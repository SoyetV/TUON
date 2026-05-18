import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import GameContext from "../../context/GameContext";
import XPBar from "../ui/XPBar";
import { getRank, getLevel } from "../../utils/ranks";

const NAV_ITEMS = [
  ["dashboard", "⌂", "BASE"],
  ["library",   "◫", "LIBRARY"],
];

export default function Sidebar({ page, setPage, onLogout }) {
  const { user }                 = useContext(AuthContext);
  const { gameStats }            = useContext(GameContext);
  const { xp, streak }           = gameStats;
  const rank  = getRank(xp);
  const level = getLevel(xp);

  const isActive = (id) =>
    page === id ||
    (page.startsWith("study") && id === "library") ||
    (page.startsWith("quiz")  && id === "library");

  return (
    <nav className="sidebar">
      <div className="sidebar-logo font-cinzel">TU<span>◈</span>N</div>

      <div style={{ padding: "20px 0", flex: 1 }}>
        {NAV_ITEMS.map(([id, icon, label]) => (
          <div
            key={id}
            className={`nav-item${isActive(id) ? " active" : ""}`}
            onClick={() => setPage(id)}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid rgba(99,179,237,0.1)", paddingTop: 12 }}>
        <div style={{ padding: "8px 16px" }}>
          {/* User avatar + info */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `linear-gradient(135deg,${rank.color},rgba(99,179,237,0.3))`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>{user?.name || "Scholar"}</div>
              <div style={{ fontSize: 11, color: rank.color, fontWeight: 600, marginTop: 2 }}>
                Lv.{level} · {rank.name}
              </div>
            </div>
          </div>

          {/* Streak */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 13 }}>🔥</span>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--neon-amber)" }}>
              {streak} day streak
            </span>
          </div>

          <XPBar xp={xp} compact />
        </div>

        <div style={{ display: "flex", gap: 4, padding: "0 16px 4px" }}>
          <button className="glow-btn" style={{ flex: 1, padding: "6px", fontSize: 11 }} onClick={onLogout}>
            ⎋ Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
