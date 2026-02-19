"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const T = {
  bg: "#09090B",
  surface: "#111113",
  surfaceHover: "#19191D",
  border: "rgba(255,255,255,0.06)",
  borderFocus: "rgba(129,140,248,0.4)",
  white: "#FAFAFA",
  t1: "#E4E4E7",
  t2: "#71717A",
  t3: "#3F3F46",
  green: "#10B981",
  red: "#F43F5E",
  line: "#818CF8",
  lineBg: "rgba(129,140,248,0.08)",
};

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (mode === "register") {
      if (password !== confirmPass) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    setLoading(true);

    if (mode === "login") {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.ok) {
          localStorage.setItem("nexus_auth", JSON.stringify({ user: username, ts: Date.now() }));
          router.push("/");
        } else {
          setError(data.error || "Invalid credentials");
          setLoading(false);
        }
      } catch {
        setError("Connection error");
        setLoading(false);
      }
    } else {
      // Register — store and redirect
      localStorage.setItem("nexus_auth", JSON.stringify({ user: username, ts: Date.now() }));
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: T.bg }}>
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.02]"
           style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.04]"
           style={{ background: T.line }} />

      <div className="relative z-10 w-full max-w-[380px] mx-4">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
               style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.line} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: T.white }}>LINBAY</h1>
          <p className="text-[12px] mt-1" style={{ color: T.t3 }}>Autonomous Trading Engine</p>
        </div>

        {/* Card */}
        <div className="rounded-xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {/* Tab switch */}
          <div className="flex mb-6 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.03)" }}>
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className="flex-1 py-2 text-[12px] font-medium rounded-md transition-all"
                style={{
                  color: mode === m ? T.white : T.t3,
                  background: mode === m ? "rgba(255,255,255,0.06)" : "transparent",
                }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] mb-1.5" style={{ color: T.t3 }}>Username</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full h-10 px-3 rounded-lg text-[13px] font-medium outline-none transition-all placeholder:opacity-30"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, color: T.t1 }}
                onFocus={(e) => e.target.style.borderColor = T.borderFocus}
                onBlur={(e) => e.target.style.borderColor = T.border}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] mb-1.5" style={{ color: T.t3 }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full h-10 px-3 rounded-lg text-[13px] font-medium outline-none transition-all placeholder:opacity-30"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, color: T.t1 }}
                onFocus={(e) => e.target.style.borderColor = T.borderFocus}
                onBlur={(e) => e.target.style.borderColor = T.border}
              />
            </div>

            {/* Confirm Password (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] mb-1.5" style={{ color: T.t3 }}>Confirm Password</label>
                <input
                  type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className="w-full h-10 px-3 rounded-lg text-[13px] font-medium outline-none transition-all placeholder:opacity-30"
                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, color: T.t1 }}
                  onFocus={(e) => e.target.style.borderColor = T.borderFocus}
                  onBlur={(e) => e.target.style.borderColor = T.border}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg px-3 py-2 text-[11px] font-medium" style={{ background: T.red + "12", color: T.red }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-lg text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: T.line, color: T.white }}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-[10px] mt-4" style={{ color: T.t3 }}>
          {mode === "login" ? "Default: admin / admin888" : "Create your trading account"}
        </p>
      </div>
    </div>
  );
}
