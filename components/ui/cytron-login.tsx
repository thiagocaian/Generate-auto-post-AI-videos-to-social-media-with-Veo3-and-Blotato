"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import — Three.js cannot run on the server
const CanvasRevealEffect = dynamic(
  () => import("./canvas-reveal").then((mod) => mod.CanvasRevealEffect),
  { ssr: false }
);

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
    <div className={cn("flex w-full flex-col min-h-screen bg-black relative", className)}>
      {/* WebGL Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-black"
            colors={[
              [59, 130, 246],
              [99, 102, 241],
            ]}
            dotSize={5}
            reverse={false}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.8)_0%,_transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Top bar */}
        <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center px-6 py-3 backdrop-blur-sm border border-white/10 bg-black/30">
          <div className="flex items-center gap-6">
            <span className="text-white font-bold text-lg tracking-[0.12em]">CYTRON</span>
            <span className="text-white/30 text-xs hidden sm:block">Intelligent Automation Platform</span>
          </div>
        </header>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm px-4">
            <div
              className="space-y-6 text-center"
            >
              <div className="space-y-1">
                <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                  Welcome back
                </h1>
                <p className="text-[1.4rem] text-white/50 font-light">
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
                      className="backdrop-blur-[2px] w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-none py-3 px-4 transition-colors disabled:opacity-50"
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
                      <div className="h-px bg-white/10 flex-1" />
                      <span className="text-white/40 text-sm">or</span>
                      <div className="h-px bg-white/10 flex-1" />
                    </div>
                  </>
                )}

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-left space-y-1.5">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider pl-4">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full backdrop-blur-[1px] bg-white/5 text-white border border-white/10 rounded-none py-3 px-5 focus:outline-none focus:border-white/30 placeholder:text-white/20 text-sm"
                      required
                    />
                  </div>

                  <div className="text-left space-y-1.5">
                    <div className="flex items-center justify-between px-4">
                      <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                        Password
                      </label>
                      <a href="/forgot-password" className="text-xs text-blue-400/70 hover:text-blue-300 transition-colors">
                        Forgot?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full backdrop-blur-[1px] bg-white/5 text-white border border-white/10 rounded-none py-3 px-5 pr-12 focus:outline-none focus:border-white/30 placeholder:text-white/20 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-none px-5 py-2.5 text-sm bg-red-500/10 text-red-400 border border-red-500/20 text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-none bg-white text-black font-semibold py-3 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <p className="text-xs text-white/25">
                  Don&apos;t have access?{" "}
                  <a href="mailto:admin@cytron.io" className="text-blue-400/60 hover:text-blue-300 transition-colors">
                    Contact your administrator
                  </a>
                </p>
                <div className="flex justify-center gap-2">
                  {["Starter", "Pro", "Enterprise"].map((p) => (
                    <span key={p} className="text-[10px] px-2.5 py-0.5 rounded-none font-medium bg-white/5 border border-white/10 text-white/30">
                      {p}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-white/15">
                  &copy; 2026 CYTRON Platform. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CytronLogin;
