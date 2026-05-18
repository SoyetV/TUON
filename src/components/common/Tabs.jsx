/**
 * Tabs — HUD-style tab strip.
 *
 * Props:
 *   tabs    – [{ id, label }]
 *   active  – currently active tab id
 *   onChange – (id) => void
 */
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: "1px solid rgba(99,179,237,0.15)", marginBottom: 20 }}>
      {tabs.map(({ id, label }) => (
        <div
          key={id}
          className={`hud-tab${active === id ? " active" : ""}`}
          onClick={() => onChange(id)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}