import { useState, useEffect } from "react";
import ParticleField from "./ParticleField";

export default function LoadingScreen({ onDone }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const steps = [20, 45, 70, 90, 100];
    let i = 0;
    const t = setInterval(() => {
      if (i < steps.length) { setPct(steps[i++]); }
      else { clearInterval(t); setTimeout(onDone, 300); }
    }, 260);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statusText =
    pct < 40 ? "INITIALIZING TUON…" :
    pct < 80 ? "LOADING SUBJECT DATA…" :
               "ENTERING TUON…";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "var(--bg-void)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32,
    }}>
      <ParticleField />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div className="font-cinzel" style={{
          fontSize: 52, fontWeight: 700, color: "var(--neon-cyan)",
          letterSpacing: 12, textShadow: "0 0 40px rgba(99,179,237,0.8)", marginBottom: 8,
        }}>
          TUON
        </div>
        <div style={{ fontSize: 12, letterSpacing: 4, color: "var(--text-muted)", marginBottom: 40 }}>
          STUDY · EVOLVE · ASCEND
        </div>
        <div style={{
          width: 280, height: 4,
          background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", margin: "0 auto",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "var(--xp-bar-grad)", borderRadius: 2,
            transition: "width 0.25s ease-out",
            boxShadow: "0 0 10px rgba(99,179,237,0.6)",
          }} />
        </div>
        <div className="font-mono" style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
          {statusText}
        </div>
      </div>
    </div>
  );
}
