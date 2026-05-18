/**
 * GlowButton — wraps the .glow-btn class with a React component.
 *
 * Props:
 *   variant  – "cyan" (default) | "violet" | "amber" | "red" | "green" | "solid"
 *   ...rest  – forwarded to <button>
 */
export default function GlowButton({ variant = "cyan", className = "", children, ...rest }) {
  const variantClass = variant === "cyan" ? "" : variant;
  return (
    <button className={`glow-btn ${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}