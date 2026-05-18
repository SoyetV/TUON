import { useState, useContext } from "react";
import SubjectsContext from "../../context/SubjectsContext";
import ParticleField from "../../components/ui/ParticleField";
import { SUBJECT_COLORS } from "../../utils/constants";

function buildSteps(user, subjectTitle, setSubjectTitle, chosenColor, setChosenColor) {
  return [
    {
      title: "TUON Is Online",
      sub: `Welcome, ${user?.name || "Scholar"}. Your journey begins.`,
      content: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>◈</div>
          <div style={{ color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 340, margin: "0 auto" }}>
            TUON transforms your study notes into an RPG. Earn XP, rank up, and master your subjects through AI-powered quizzes.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
            {["📚 Study", "⚡ Quiz", "🏆 Rank Up"].map(t => (
              <div key={t} style={{ color: "var(--neon-cyan)", fontSize: 13, fontWeight: 600 }}>{t}</div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Choose Your Domain",
      sub: "Create your first subject to begin training.",
      content: (
        <div>
          <input
            className="hud-input"
            placeholder="e.g. Quantum Mechanics, World History…"
            value={subjectTitle}
            onChange={e => setSubjectTitle(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <div style={{ marginBottom: 8, fontSize: 11, letterSpacing: 1.5, color: "var(--text-muted)" }}>DOMAIN COLOR</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {SUBJECT_COLORS.map(c => (
              <div
                key={c}
                onClick={() => setChosenColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                  border: chosenColor === c ? "2px solid white" : "2px solid transparent",
                  boxShadow: chosenColor === c ? `0 0 12px ${c}` : "none",
                  transition: "all 0.15s",
                }}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Begin Training",
      sub: "Your TUON workspace is ready. Master your domains.",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            ["◫", "Library",  "Browse and manage your subject domains"],
            ["📖", "Journal",  "Write and save study notes"],
            ["⚡", "Quiz",     "AI-generated MCQs from your notes"],
            ["🏆", "Rank Up",  "Earn XP and climb from Initiate to Grandmaster"],
          ].map(([icon, label, desc]) => (
            <div key={label} className="glass" style={{ padding: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];
}

export default function OnboardingPage({ user, onDone }) {
  const { addSubject } = useContext(SubjectsContext);
  const [step,         setStep]         = useState(0);
  const [subjectTitle, setSubjectTitle] = useState("");
  const [chosenColor,  setChosenColor]  = useState(SUBJECT_COLORS[0]);

  const steps   = buildSteps(user, subjectTitle, setSubjectTitle, chosenColor, setChosenColor);
  const canNext = step !== 1 || subjectTitle.trim().length > 0;

  const next = () => {
    if (step === 1 && subjectTitle.trim()) addSubject(subjectTitle.trim(), chosenColor);
    if (step < steps.length - 1) setStep(s => s + 1);
    else onDone();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, position: "relative" }}>
      <ParticleField />
      <div className="glass-strong step-enter" style={{ width: "100%", maxWidth: 520, padding: 40, position: "relative", zIndex: 1 }}>
        {/* Step dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 6, borderRadius: 3, background: i === step ? "var(--neon-cyan)" : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />
          ))}
        </div>

        <div className="font-cinzel" style={{ fontSize: 18, color: "var(--neon-cyan)", letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>
          {steps[step].title}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
          {steps[step].sub}
        </div>

        {steps[step].content}

        <button className="glow-btn solid" style={{ width: "100%", marginTop: 28 }} disabled={!canNext} onClick={next}>
          {step < steps.length - 1 ? "CONTINUE →" : "ENTER TUON"}
        </button>
      </div>
    </div>
  );
}
