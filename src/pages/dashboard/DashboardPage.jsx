import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import GameContext from "../../context/GameContext";
import SubjectsContext from "../../context/SubjectsContext";
import XPBar from "../../components/ui/XPBar";
import { getRank, getLevel } from "../../utils/ranks";
import { ACHIEVEMENTS } from "../../utils/constants";

export default function DashboardPage({ setPage }) {
  const { user }                      = useContext(AuthContext);
  const { gameStats }                 = useContext(GameContext);
  const { subjects }                  = useContext(SubjectsContext);
  const { xp, streak, achievements }  = gameStats;
  const rank  = getRank(xp);
  const level = getLevel(xp);

  const quizzedSubjects = subjects.filter(s => s.lastQuizTotal);
  const accuracy = quizzedSubjects.length
    ? Math.round(quizzedSubjects.reduce((a, s) => a + s.lastQuizScore / s.lastQuizTotal, 0) / quizzedSubjects.length * 100)
    : 0;

  const recommended = subjects.length
    ? subjects.reduce((a, s) => s.progress < a.progress ? s : a, subjects[0])
    : null;

  const statCards = [
    { label: "Focus Level",  val: `Lv.${level}`,                         color: "var(--neon-cyan)"   },
    { label: "Total XP",     val: xp.toLocaleString(),                   color: "var(--neon-violet)" },
    { label: "Quiz Accuracy",val: accuracy ? `${accuracy}%` : "—",       color: "var(--neon-green)"  },
    { label: "Study Streak", val: `${streak}d 🔥`,                       color: "var(--neon-amber)"  },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div className="font-cinzel" style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 4 }}>Command Base</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Welcome back, {user?.name || "Scholar"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 6, padding: "6px 12px" }}>
            <span>🔥</span>
            <span className="font-mono" style={{ color: "var(--neon-amber)", fontSize: 13 }}>{streak} day streak</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(99,179,237,0.1)", border: "1px solid var(--border-glow)", borderRadius: 6, padding: "6px 12px" }}>
            <span style={{ fontSize: 13, color: rank.color, fontWeight: 700 }}>{rank.name}</span>
          </div>
        </div>
      </div>

      {/* Player card */}
      <div className="glass-strong" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${rank.color},rgba(99,179,237,0.3))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, flexShrink: 0, boxShadow: `0 0 20px ${rank.color}40` }}>
            {user?.name?.[0]?.toUpperCase() || "S"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{user?.name || "Scholar"}</div>
            <div style={{ fontSize: 13, color: rank.color, fontWeight: 600, marginBottom: 10 }}>Level {level} · {rank.name}</div>
            <XPBar xp={xp} />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
        {statCards.map(({ label, val, color }) => (
          <div key={label} className="stat-card scanline" style={{ position: "relative", borderLeft: `2px solid ${color}` }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--text-muted)", marginBottom: 6 }}>
              {label.toUpperCase()}
            </div>
            <div className="font-mono" style={{ fontSize: 22, fontWeight: 500, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Recommended */}
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--text-muted)", marginBottom: 12 }}>RECOMMENDED MISSION</div>
          {recommended ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: recommended.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#05060f" }}>
                  {recommended.badge}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{recommended.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{recommended.progress}% mastered</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="glow-btn" style={{ flex: 1, padding: "8px" }} onClick={() => setPage(`study:${recommended.id}`)}>▶ Study</button>
                <button className="glow-btn violet" style={{ flex: 1, padding: "8px" }} onClick={() => setPage(`quiz:${recommended.id}`)}>⚡ Quiz</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>◫</div>
              <div style={{ fontSize: 13 }}>No subjects yet</div>
              <button className="glow-btn" style={{ marginTop: 12 }} onClick={() => setPage("library")}>Add Subject →</button>
            </div>
          )}
        </div>

        {/* Domain progress */}
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--text-muted)", marginBottom: 14 }}>DOMAIN PROGRESS</div>
          {subjects.length ? subjects.slice(0, 5).map(s => (
            <div key={s.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{s.title}</span>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.progress}%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                <div style={{ height: 4, width: `${s.progress}%`, background: s.color, borderRadius: 2, transition: "width 0.6s ease-out", boxShadow: `0 0 6px ${s.color}80` }} />
              </div>
            </div>
          )) : <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", paddingTop: 20 }}>No domains yet</div>}
        </div>
      </div>

      {/* Achievements */}
      <div className="glass" style={{ padding: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--text-muted)", marginBottom: 14 }}>ACHIEVEMENTS</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = achievements.includes(a.id);
            return (
              <div key={a.id} title={`${a.name}: ${a.desc}`} style={{ textAlign: "center", opacity: unlocked ? 1 : 0.3, transition: "opacity 0.2s", cursor: "default" }}>
                <div style={{ fontSize: 28, filter: unlocked ? "drop-shadow(0 0 8px var(--neon-amber))" : "none" }}>{a.icon}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, maxWidth: 48 }}>{a.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}