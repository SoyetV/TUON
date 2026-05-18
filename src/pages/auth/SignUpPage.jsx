import { useState } from "react";
import { supabase } from "../../lib/supabase";
import ParticleField from "../../components/ui/ParticleField";

const FIELDS = [
  ["NAME",     "text",     "Your name"],
  ["EMAIL",    "email",    "scholar@tuon.app"],
  ["PASSWORD", "password", "••••••••"],
];

export default function SignUpPage({ goLogin }) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const setters = [setName, setEmail, setPass];
  const values  = [name,    email,    pass];

  const handle = async () => {
    if (!name || !email || !pass) {
      setErr("Fill all fields");
      setNotice("");
      return;
    }
    if (pass.length < 6) {
      setErr("Password must be at least 6 characters");
      setNotice("");
      return;
    }

    setErr("");
    setNotice("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }

    setNotice("A verification email was sent. Confirm your account before signing in.");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <ParticleField />
      <div className="glass-strong page-enter" style={{ width: "100%", maxWidth: 440, margin: 16, padding: 40, position: "relative", zIndex: 1 }}>
        <div className="font-cinzel" style={{ fontSize: 14, color: "var(--neon-violet)", letterSpacing: 3, marginBottom: 6 }}>
          BEGIN YOUR JOURNEY
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 28 }}>Create your TUON account</div>

        {err && <div style={{ color: "var(--neon-red)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
        {notice && <div style={{ color: "var(--neon-cyan)", fontSize: 13, marginBottom: 12 }}>{notice}</div>}

        {FIELDS.map(([label, type, placeholder], i) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              {label}
            </label>
            <input
              className="hud-input"
              type={type}
              value={values[i]}
              onChange={e => setters[i](e.target.value)}
              placeholder={placeholder}
              onKeyDown={e => e.key === "Enter" && handle()}
            />
          </div>
        ))}

        <button className="glow-btn violet" style={{ width: "100%", marginTop: 10, marginBottom: 14, opacity: loading ? 0.6 : 1 }} onClick={handle} disabled={loading}>
          {loading ? "CREATING..." : "CREATE ACCOUNT"}
        </button>

        <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          Have an account?{" "}
          <span style={{ color: "var(--neon-cyan)", cursor: "pointer" }} onClick={goLogin}>Sign in →</span>
        </div>
      </div>
    </div>
  );
}