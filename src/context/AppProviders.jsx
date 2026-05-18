import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AuthContext from "./AuthContext";
import GameContext from "./GameContext";
import SubjectsContext from "./SubjectsContext";
import UIContext from "./UIContext";
import { ACHIEVEMENTS, SUBJECT_COLORS } from "../utils/constants";
import { getRank } from "../utils/ranks";
import { createId } from "../utils/createId";
import AchievementToast from "../components/ui/AchievementToast";

export default function AppProviders({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);

  // ── Subjects ──────────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState([]);

  // ── Game ──────────────────────────────────────────────────────────────────
  const [gameStats, setGameStats] = useState({
    xp: 0,
    streak: 0,
    achievements: [],
  });

  // ── UI ────────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const [rankUpMsg, setRankUpMsg] = useState(null);

  // ── Load subjects when user logs in ───────────────────────────────────────
  useEffect(() => {
  if (!user) {
    setSubjects([]);
    return;
  }
  const loadSubjects = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data) setSubjects(data);
  };
  loadSubjects();
}, [user, setSubjects]);

  // ── Game actions ──────────────────────────────────────────────────────────
  const awardXP = useCallback((amount) => {
    setGameStats((prev) => {
      const oldRank = getRank(prev.xp);
      const newXP = prev.xp + amount;
      const newRank = getRank(newXP);
      if (newRank.name !== oldRank.name) setRankUpMsg(newRank.name);
      return { ...prev, xp: newXP };
    });
  }, []);

  const unlockAchievement = useCallback(
    (id) => {
      const ach = ACHIEVEMENTS.find((a) => a.id === id);
      if (!ach) return;
      setGameStats((prev) => {
        if (prev.achievements.includes(id)) return prev;
        setToast(ach);
        return { ...prev, achievements: [...prev.achievements, id] };
      });
      awardXP(ach.xp);
    },
    [awardXP]
  );

  // ── Subject actions ───────────────────────────────────────────────────────
  const addSubject = useCallback(
    async (title, color) => {
      const id = createId();
      const badge = title.slice(0, 2).toUpperCase();
      const newSubject = {
        id,
        user_id: user.id,
        title,
        badge,
        color: color || SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)],
        progress: 0,
        notes: "",
        quizzes: [],
        citations: [],
        papers: 0,
        summaries: 0,
        last_quiz_score: null,
        last_quiz_total: null,
      };

      const { error } = await supabase.from("subjects").insert(newSubject);
      if (error) {
        console.error("addSubject error:", error);
        return { success: false };
      }

      setSubjects((prev) => {
        const next = [...prev, newSubject];
        if (next.length === 5) setTimeout(() => unlockAchievement("five_subjects"), 500);
        return next;
      });
      awardXP(25);
      return { success: true, id };
    },
    [user, awardXP, unlockAchievement]
  );

  const updateNotes = useCallback(
    async (id, notes) => {
      const { error } = await supabase
        .from("subjects")
        .update({ notes })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) { console.error("updateNotes error:", error); return; }
      setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, notes } : s)));
      awardXP(5);
    },
    [user, awardXP]
  );

  const saveQuizResult = useCallback(
    async (id, score, total) => {
      const progress = Math.round((score / total) * 100);
      const { error } = await supabase
        .from("subjects")
        .update({ last_quiz_score: score, last_quiz_total: total, progress })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) { console.error("saveQuizResult error:", error); return; }
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, last_quiz_score: score, last_quiz_total: total, progress }
            : s
        )
      );
      awardXP(50);
      if (score === total) { awardXP(150); unlockAchievement("perfect_score"); }
      else if (score / total >= 0.8) awardXP(75);
    },
    [user, awardXP, unlockAchievement]
  );

  const saveQuizzes = useCallback(
    async (id, quizzes) => {
      const { error } = await supabase
        .from("subjects")
        .update({ quizzes })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) { console.error("saveQuizzes error:", error); return; }
      setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, quizzes } : s)));
      awardXP(20);
    },
    [user, awardXP]
  );

  const deleteSubject = useCallback(
    async (id) => {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) { console.error("deleteSubject error:", error); return; }
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <GameContext.Provider value={{ gameStats, awardXP, unlockAchievement }}>
        <SubjectsContext.Provider value={{ subjects, addSubject, updateNotes, saveQuizResult, saveQuizzes, deleteSubject }}>
          <UIContext.Provider value={{ toast, setToast, rankUpMsg, setRankUpMsg }}>
            {children}

            {toast && <AchievementToast achievement={toast} onDone={() => setToast(null)} />}

            {rankUpMsg && (
              <div className="rank-up-overlay" onAnimationEnd={() => setRankUpMsg(null)}>
                <div style={{ textAlign: "center" }}>
                  <div className="font-cinzel" style={{ fontSize: 11, letterSpacing: 4, color: "var(--neon-cyan)", marginBottom: 8 }}>
                    RANK UP
                  </div>
                  <div className="font-cinzel" style={{ fontSize: 42, fontWeight: 700, color: "white", textShadow: "0 0 40px var(--neon-cyan)" }}>
                    {rankUpMsg}
                  </div>
                </div>
              </div>
            )}
          </UIContext.Provider>
        </SubjectsContext.Provider>
      </GameContext.Provider>
    </AuthContext.Provider>
  );
}