import { getRank, getLevel, getNextRankXP } from "../../utils/ranks";

export default function XPBar({ xp, compact = false }) {
  const rank     = getRank(xp);
  const level    = getLevel(xp);
  const nextXP   = getNextRankXP(xp);
  const pct      = nextXP ? Math.round(((xp - rank.min) / (nextXP - rank.min)) * 100) : 100;

  if (compact) {
    return (
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: rank.color, fontWeight: 700, letterSpacing: 1 }}>{rank.name}</span>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>Lv.{level}</span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, textAlign: "right" }}>
          {xp.toLocaleString()} XP
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: rank.color, fontWeight: 700, letterSpacing: 1 }}>{rank.name}</span>
        <span className="font-mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {xp.toLocaleString()} / {nextXP ? nextXP.toLocaleString() : "MAX"} XP
        </span>
      </div>
      <div className="xp-bar-track" style={{ height: 8 }}>
        <div className="xp-bar-fill" style={{ width: `${pct}%`, height: 8 }} />
      </div>
    </div>
  );
}