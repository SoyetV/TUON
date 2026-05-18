import { useState, useContext } from "react";
import SubjectsContext from "../../context/SubjectsContext";
import Modal from "../../components/ui/Modal";
import ProgressRing from "../../components/ui/ProgressRing";
import { SUBJECT_COLORS } from "../../utils/constants";

export default function LibraryPage({ setPage }) {
  const { subjects, addSubject, deleteSubject } = useContext(SubjectsContext);
  const [showAdd,       setShowAdd]       = useState(false);
  const [title,         setTitle]         = useState("");
  const [color,         setColor]         = useState(SUBJECT_COLORS[0]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAdd = () => {
    if (!title.trim()) return;
    addSubject(title.trim(), color);
    setTitle(""); setColor(SUBJECT_COLORS[0]); setShowAdd(false);
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div className="font-cinzel" style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 4 }}>Mission Board</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {subjects.length} active domain{subjects.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button className="glow-btn" onClick={() => setShowAdd(true)}>+ NEW DOMAIN</button>
      </div>

      {/* Subject grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
        {subjects.map(s => (
          <div key={s.id} className="mission-card" style={{ border: `1px solid ${s.color}30`, boxShadow: `0 0 20px ${s.color}15` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#05060f", boxShadow: `0 0 12px ${s.color}60` }}>
                  {s.badge}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.title}</div>
                  {s.lastQuizScore !== null && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Last: {s.lastQuizScore}/{s.lastQuizTotal}</div>
                  )}
                </div>
              </div>
              <ProgressRing pct={s.progress} color={s.color} size={44} />
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14, fontSize: 11, color: "var(--text-muted)" }}>
              <span>📄 {s.quizzes.length} quizzes</span>
              <span>📝 {s.notes ? "Has notes" : "No notes"}</span>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button className="glow-btn"       style={{ flex: 1, padding: "7px", fontSize: 11 }} onClick={() => setPage(`study:${s.id}`)}>STUDY</button>
              {s.quizzes.length > 0 && (
                <button className="glow-btn violet" style={{ flex: 1, padding: "7px", fontSize: 11 }} onClick={() => setPage(`quiz:${s.id}`)}>QUIZ</button>
              )}
              <button className="glow-btn red"    style={{ padding: "7px 10px", fontSize: 11 }}     onClick={() => setConfirmDelete(s)}>✕</button>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div className="add-card" onClick={() => setShowAdd(true)}>
          <div style={{ fontSize: 32 }}>+</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>New Domain</div>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <Modal title="NEW DOMAIN" onClose={() => setShowAdd(false)}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>SUBJECT NAME</label>
            <input className="hud-input" placeholder="e.g. Organic Chemistry" value={title}
              onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} autoFocus />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--text-muted)", display: "block", marginBottom: 10 }}>DOMAIN COLOR</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SUBJECT_COLORS.map(c => (
                <div key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: "50%", background: c, cursor: "pointer", border: color === c ? "2px solid white" : "2px solid transparent", boxShadow: color === c ? `0 0 14px ${c}` : "none", transition: "all 0.15s" }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="glow-btn"       style={{ flex: 1 }} onClick={() => setShowAdd(false)}>CANCEL</button>
            <button className="glow-btn solid" style={{ flex: 1 }} onClick={handleAdd} disabled={!title.trim()}>CREATE →</button>
          </div>
        </Modal>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <Modal title="CONFIRM DELETE" onClose={() => setConfirmDelete(null)}>
          <div style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            Delete <strong style={{ color: "white" }}>{confirmDelete.title}</strong>? This cannot be undone.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="glow-btn"     style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>CANCEL</button>
            <button className="glow-btn red" style={{ flex: 1 }} onClick={() => { deleteSubject(confirmDelete.id); setConfirmDelete(null); }}>DELETE</button>
          </div>
        </Modal>
      )}
    </div>
  );
}