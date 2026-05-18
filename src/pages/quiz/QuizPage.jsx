import { useState, useRef, useEffect, useContext } from "react";
import SubjectsContext from "../../context/SubjectsContext";
import GameContext from "../../context/GameContext";
import { shuffleOptions } from "../../utils/shuffleOptions";
import { formatTime } from "../../utils/helpers";

export default function QuizPage({ subjectId, setPage }) {
  const { subjects, saveQuizResult } = useContext(SubjectsContext);
  const { unlockAchievement, gameStats } = useContext(GameContext);
  const subject = subjects.find(s => s.id === subjectId);
  const rawQs   = subject?.quizzes || [];

  const [shuffled]   = useState(() => rawQs.map(q => ({ ...q, ...shuffleOptions(q) })));
  const [idx,        setIdx]        = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [submitted,  setSubmitted]  = useState(false);
  const [score,      setScore]      = useState(0);
  const [done,       setDone]       = useState(false);
  const [combo,      setCombo]      = useState(0);
  const [comboAnim,  setComboAnim]  = useState("");
  const [timer,      setTimer]      = useState(30);
  const [totalTime,  setTotalTime]  = useState(0);
  const [xpPopup,    setXpPopup]    = useState(null);
  const timerRef = useRef(null);
  const totalRef = useRef(null);

  const q = shuffled[idx];

  useEffect(() => {
    if (done) return;
    timerRef.current = setInterval(() => setTimer(t => (t <= 1 ? (clearInterval(timerRef.current), 0) : t - 1)), 1000);
    totalRef.current = setInterval(() => setTotalTime(t => t + 1), 1000);
    return () => { clearInterval(timerRef.current); clearInterval(totalRef.current); };
  }, [idx, done]);

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    clearInterval(timerRef.current);
    const correct = selected === q.correctIndex;
    setSubmitted(true);
    if (correct) {
      setScore(s => s + 1);
      setCombo(c => {
        const nc = c + 1;
        setComboAnim("combo-pulse");
        setTimeout(() => setComboAnim(""), 300);
        return nc;
      });
      setXpPopup(`+${combo >= 3 ? 15 : 10} XP`);
      setTimeout(() => setXpPopup(null), 900);
    } else {
      setComboAnim("combo-shake");
      setTimeout(() => setComboAnim(""), 350);
      setCombo(0);
    }
  };

  const handleNext = () => {
    if (idx < shuffled.length - 1) {
      setIdx(i => i + 1); setSelected(null); setSubmitted(false); setTimer(30);
    } else {
      clearInterval(totalRef.current);
      const finalScore = score + (submitted && selected === q.correctIndex ? 1 : 0);
      saveQuizResult(subjectId, finalScore, shuffled.length);
      if (!gameStats.achievements.includes("first_quiz")) unlockAchievement("first_quiz");
      setDone(true);
    }
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!subject || shuffled.length === 0) return (
    <div className="page-enter" style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
      <div style={{ fontSize: 16, marginBottom: 8 }}>No questions available</div>
      <div style={{ color: "var(--text-muted)", marginBottom: 20 }}>Generate a quiz from your study notes first</div>
      <button className="glow-btn" onClick={() => setPage(`study:${subjectId}`)}>GO TO STUDY SESSION →</button>
    </div>
  );

  // ── Results screen ───────────────────────────────────────────────────────
  if (done) {
    const finalScore = score;
    const acc    = shuffled.length ? Math.round((finalScore / shuffled.length) * 100) : 0;
    const passed = acc >= 60;
    const xpGained = 50 + (acc >= 80 ? 75 : 0) + (acc === 100 ? 150 : 0);

    return (
      <div className="page-enter" style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="glass-strong" style={{ padding: 32, textAlign: "center" }}>
          <div className="font-cinzel" style={{ fontSize: 26, fontWeight: 700, color: passed ? "var(--neon-green)" : "var(--neon-red)", marginBottom: 4, letterSpacing: 2 }}>
            {passed ? "MISSION COMPLETE" : "MISSION FAILED"}
          </div>
          <div style={{ fontSize: 36, margin: "16px 0" }}>{acc === 100 ? "💎" : passed ? "⚔️" : "📖"}</div>
          <div style={{ borderTop: "1px solid rgba(99,179,237,0.15)", paddingTop: 20, marginTop: 8 }}>
            {[
              ["Accuracy",   `${acc}%`,              acc >= 80 ? "var(--neon-green)" : acc >= 60 ? "var(--neon-amber)" : "var(--neon-red)"],
              ["XP Gained",  `+${xpGained} XP`,      "var(--neon-amber)"],
              ["Time Spent", formatTime(totalTime),   "var(--neon-cyan)"],
              ["Questions",  `${shuffled.length} / ${shuffled.length}`, "var(--text-primary)"],
              ["Correct",    `${finalScore} / ${shuffled.length}`,      "var(--neon-green)"],
            ].map(([label, val, color], i) => (
              <div key={label} className="stat-reveal" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", animationDelay: `${i * 0.1}s` }}>
                <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{label}</span>
                <span className="font-mono" style={{ color, fontSize: 14, fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button className="glow-btn"        style={{ flex: 1 }} onClick={() => { setIdx(0); setScore(0); setSubmitted(false); setSelected(null); setCombo(0); setDone(false); setTotalTime(0); setTimer(30); }}>RETRY</button>
            <button className="glow-btn violet" style={{ flex: 1 }} onClick={() => setPage(`study:${subjectId}`)}>STUDY</button>
            <button className="glow-btn amber"  style={{ flex: 1 }} onClick={() => setPage("library")}>LIBRARY</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz HUD ─────────────────────────────────────────────────────────────
  const timerPct   = (timer / 30) * 100;
  const timerColor = timer > 15 ? "var(--neon-cyan)" : timer > 8 ? "var(--neon-amber)" : "var(--neon-red)";

  return (
    <div className="page-enter" style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* HUD bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setPage("library")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>←</button>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: subject.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#05060f" }}>{subject.badge}</div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{subject.title}</span>
        </div>
        <div className="font-mono" style={{ fontSize: 14, color: "var(--text-muted)" }}>{idx + 1} / {shuffled.length}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Timer ring */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="32" height="32" style={{ transform: "rotate(-90deg)" }}>
              <circle cx={16} cy={16} r={12} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
              <circle cx={16} cy={16} r={12} fill="none" stroke={timerColor} strokeWidth={3}
                strokeDasharray={75.4} strokeDashoffset={75.4 * (1 - timerPct / 100)} className="timer-ring" />
            </svg>
            <span className="font-mono" style={{ fontSize: 13, color: timerColor }}>{String(timer).padStart(2, "0")}</span>
          </div>
          {/* Combo badge */}
          {combo >= 2 && (
            <div className={comboAnim} style={{ background: combo >= 4 ? "rgba(167,139,250,0.15)" : "rgba(251,191,36,0.15)", border: `1px solid ${combo >= 4 ? "var(--neon-violet)" : "var(--neon-amber)"}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: combo >= 4 ? "var(--neon-violet)" : "var(--neon-amber)" }}>
              🔥 Combo x{combo >= 4 ? 3 : 2}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="xp-bar-track" style={{ marginBottom: 24 }}>
        <div className="xp-bar-fill" style={{ width: `${(idx / shuffled.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="glass-strong" style={{ padding: 28, marginBottom: 16, position: "relative" }}>
        {xpPopup && <div className="xp-popup" style={{ right: 20, top: 16 }}>{xpPopup}</div>}
        <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--text-muted)", marginBottom: 12 }}>QUESTION {idx + 1}</div>
        <div style={{ fontSize: 17, lineHeight: 1.6, fontWeight: 500, marginBottom: 24 }}>{q.question}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            let cls = "quiz-option";
            if (submitted) {
              cls += " disabled";
              if (i === q.correctIndex) cls += " correct";
              else if (i === selected)  cls += " wrong";
            } else if (i === selected) cls += " selected";
            return (
              <div key={i} className={cls} onClick={() => !submitted && setSelected(i)}>
                <div className="option-letter">{["A","B","C","D"][i]}</div>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {submitted && q.explanation && (
        <div className="glass" style={{ padding: 16, marginBottom: 16, borderLeft: `3px solid ${selected === q.correctIndex ? "var(--neon-green)" : "var(--neon-red)"}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: selected === q.correctIndex ? "var(--neon-green)" : "var(--neon-red)", marginBottom: 6 }}>
            {selected === q.correctIndex ? "✓ CORRECT" : "✗ INCORRECT"}
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{q.explanation}</div>
        </div>
      )}

      {/* Action */}
      <div style={{ textAlign: "right" }}>
        {!submitted
          ? <button className="glow-btn solid" disabled={selected === null} onClick={handleSubmit}>SUBMIT ANSWER</button>
          : <button className="glow-btn solid" onClick={handleNext}>{idx < shuffled.length - 1 ? "NEXT →" : "SEE RESULTS"}</button>
        }
      </div>
    </div>
  );
}