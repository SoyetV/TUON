import { useState } from "react";
import { supabase } from "../../lib/supabase";
import ParticleField from "../../components/ui/ParticleField";

export default function LoginPage({ onLogin, goSignup }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !pass) {
      setErr("Fill all fields");
      setNotice("");
      return;
    }

    setErr("");
    setNotice("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (!error && data?.user) {
      setLoading(false);
      const u = data.user;
      onLogin({ id: u.id, name: u.user_metadata?.full_name || u.email.split("@")[0], email: u.email });
      return;
    }

    const message = error?.message?.toLowerCase() || "";
    const shouldAutoSignup =
      message.includes("invalid login credentials") ||
      message.includes("invalid email or password") ||
      message.includes("user not found") ||
      message.includes("user does not exist") ||
      message.includes("not found");

    if (shouldAutoSignup) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { emailRedirectTo: window.location.origin },
      });
      setLoading(false);

      if (signUpError) {
        if (signUpError.message?.toLowerCase().includes("already registered")) {
          setErr("This email is already registered. Use the correct password or reset it.");
        } else {
          setErr(signUpError.message);
        }
        return;
      }

      setNotice("No account was found, so one was created. Check your email for the verification link before signing in.");
      return;
    }

    setLoading(false);
    setErr(error?.message || "Unable to sign in.");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative" }}>
      <ParticleField />

      {/* Left hero */}
      <div className="hex-bg" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center" }}>
          <div className="font-cinzel" style={{ fontSize: 64, fontWeight: 700, color: "var(--neon-cyan)", letterSpacing: 10, textShadow: "0 0 60px rgba(99,179,237,0.9)", lineHeight: 1, marginBottom: 16 }}>
            TUON
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, letterSpacing: 3 }}>YOUR STUDY RPG AWAITS</div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ width: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, position: "relative", zIndex: 1 }}>
        <div className="glass-strong" style={{ width: "100%", padding: 36 }}>
          <div className="font-cinzel" style={{ fontSize: 14, color: "var(--neon-cyan)", letterSpacing: 3, marginBottom: 6 }}>
            ENTER TUON
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 28 }}>Sign in to your TUON account</div>

          {err && <div style={{ color: "var(--neon-red)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
          {notice && <div style={{ color: "var(--neon-cyan)", fontSize: 13, marginBottom: 12 }}>{notice}</div>}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>EMAIL</label>
            <input className="hud-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="scholar@tuon.app" onKeyDown={e => e.key === "Enter" && handle()} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>PASSWORD</label>
            <input className="hud-input" type="password" value={pass} onChange={e => setPass(e.target.value)}
              placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} />
          </div>

          <button className="glow-btn solid" style={{ width: "100%", marginBottom: 14, opacity: loading ? 0.6 : 1 }} onClick={handle} disabled={loading}>
            {loading ? "ENTERING..." : "ENTER TUON"}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            No account?{" "}
            <span style={{ color: "var(--neon-cyan)", cursor: "pointer" }} onClick={goSignup}>Create one →</span>
          </div>
        </div>
      </div>
    </div>
  );
}