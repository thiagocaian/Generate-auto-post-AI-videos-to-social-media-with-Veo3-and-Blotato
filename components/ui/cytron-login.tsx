"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface CytronLoginProps {
  onSubmit: (email: string, password: string) => void;
  onGoogleLogin?: () => void;
  error?: string;
  loading?: boolean;
  className?: string;
}

export function CytronLogin({ onSubmit, onGoogleLogin, error, loading = false, className }: CytronLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className={cn("flex w-full flex-col min-h-screen relative overflow-hidden", className)}
      style={{ background: "#050505", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>

      {/* Gradient top accent */}
      <div className="fixed top-0 left-0 right-0 h-[1px] z-50"
        style={{ background: "linear-gradient(90deg, transparent, rgba(136,108,255,0.6) 20%, rgba(99,179,237,0.6) 50%, rgba(236,121,154,0.6) 80%, transparent)" }} />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(136,108,255,0.06) 0%, transparent 70%)" }} />

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center px-6"
        style={{ background: "rgba(5,5,5,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#886cff] flex items-center justify-center">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="text-[15px] font-semibold tracking-[0.02em]" style={{ color: "#fff" }}>Cytron</span>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex flex-col justify-center items-center pt-16">
        <div className="w-full max-w-sm px-4">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-[-0.02em]" style={{ color: "#fff" }}>
                Welcome back
              </h1>
              <p className="text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
                Sign in to your workspace
              </p>
            </div>

            <div className="space-y-4">
              {/* Google OAuth */}
              {onGoogleLogin && (
                <>
                  <button
                    type="button"
                    onClick={onGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>or</span>
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                  </div>
                </>
              )}

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-left space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider pl-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={e => e.currentTarget.style.borderColor = "rgba(136,108,255,0.4)"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                    required
                  />
                </div>

                <div className="text-left space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Password
                    </label>
                    <a href="/forgot-password" className="text-xs transition-colors" style={{ color: "rgba(136,108,255,0.7)" }}
                      onMouseEnter={e => e.currentTarget.style.color = "rgba(136,108,255,1)"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(136,108,255,0.7)"}>
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3 px-4 pr-12 rounded-xl text-sm focus:outline-none transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
                      onFocus={e => e.currentTarget.style.borderColor = "rgba(136,108,255,0.4)"}
                      onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-2.5 text-sm text-center"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl font-semibold py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  style={{ background: "#fff", color: "#000" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>
            </div>

            <div className="pt-6 space-y-4">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                Don&apos;t have access?{" "}
                <a href="mailto:admin@cytron.io" className="transition-colors" style={{ color: "rgba(136,108,255,0.6)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(136,108,255,1)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(136,108,255,0.6)"}>
                  Contact your administrator
                </a>
              </p>
              <div className="flex justify-center gap-2">
                {["Starter", "Pro", "Enterprise"].map((p) => (
                  <span key={p} className="text-[10px] px-2.5 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)" }}>
                    {p}
                  </span>
                ))}
              </div>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.1)" }}>
                &copy; 2026 Cytron. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CytronLogin;
