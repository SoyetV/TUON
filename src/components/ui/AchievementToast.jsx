import { useState, useEffect } from "react";

export default function AchievementToast({ achievement, onDone }) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHiding(true), 3200);
    const t2 = setTimeout(onDone, 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`achievement-toast${hiding ? " hiding" : ""}`} style={{ top: 80 }}>
      <div className="glass-strong" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, minWidth: 280 }}>
        <span style={{ fontSize: 28 }}>{achievement.icon}</span>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--neon-amber)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>
            Achievement Unlocked
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{achievement.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {achievement.desc} · +{achievement.xp} XP
          </div>
        </div>
      </div>
    </div>
  );
}