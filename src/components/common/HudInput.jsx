/**
 * HudInput - styled text input for the TUON HUD.
 * Supports `as="textarea"` for multi-line use.
 */
export default function HudInput({ as: Tag = "input", className = "", ...rest }) {
  const cls = Tag === "textarea" ? "hud-textarea" : "hud-input";
  return <Tag className={`${cls} ${className}`.trim()} {...rest} />;
}
