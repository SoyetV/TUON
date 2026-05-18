export default function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="glass-strong modal-enter" style={{ width: "100%", maxWidth: 480, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 className="font-cinzel" style={{ fontSize: 16, color: "var(--neon-cyan)", letterSpacing: 2 }}>
            {title}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}