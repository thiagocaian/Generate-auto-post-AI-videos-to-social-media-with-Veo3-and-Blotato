"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CytronLogo } from "@/components/site";

interface CytronLoginProps {
  onSubmit: (email: string, password: string) => void;
  onSignUp?: (email: string, password: string, fullName: string) => void;
  onGoogleLogin?: () => void;
  error?: string;
  notice?: string;
  loading?: boolean;
  className?: string;
  defaultTab?: "signin" | "signup";
}

export function CytronLogin({
  onSubmit,
  onSignUp,
  onGoogleLogin,
  error,
  notice,
  loading = false,
  className,
  defaultTab = "signin",
}: CytronLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab);
  const [tabSwitched, setTabSwitched] = useState(false);
  const signup = activeTab === "signup";
  const displayError = tabSwitched ? "" : error;

  function switchTab(tab: "signin" | "signup") {
    setActiveTab(tab);
    setTabSwitched(true);
    setEmail("");
    setPassword("");
    setFullName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTabSwitched(false);
    if (signup && onSignUp) onSignUp(email, password, fullName);
    else onSubmit(email, password);
  }

  return (
    <div className={`min-h-screen bg-white text-slate-900 lg:grid lg:grid-cols-2 ${className ?? ""}`}>
      <aside className="relative hidden flex-col justify-between bg-slate-950 px-14 py-12 text-white lg:flex">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#5b5cf6]" />
        <a href="/" className="flex items-center gap-3" aria-label="Cytron home">
          <CytronLogo size={32} />
          <span className="text-sm font-semibold tracking-[0.18em]">CYTRON</span>
        </a>
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b8cff]">Client login</p>
          <p className="mt-4 text-4xl font-semibold leading-tight tracking-tight">Your workspace, kept private.</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Jobs, invoices, and the rest of the workspace are available after you sign in.
          </p>
        </div>
        <p className="text-xs text-slate-500">Gold Coast, Australia</p>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="h-1 bg-[#5b5cf6] lg:hidden" />
        <header className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4 lg:border-0 lg:px-12 lg:pt-10">
          <a href="/" className="flex items-center gap-2.5 lg:invisible" aria-label="Cytron home">
            <CytronLogo size={28} />
            <span className="text-[15px] font-semibold tracking-wide text-slate-900">CYTRON</span>
          </a>
          <a href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Book a free audit
          </a>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[400px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5b5cf6] lg:hidden">Client login</p>
            <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-slate-900 lg:mt-0">
              {signup ? "Create an account" : "Sign in"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {signup
                ? "Use your work email. You can finish setting up the workspace next."
                : "Email and password for your Cytron workspace."}
            </p>

            {onGoogleLogin && (
              <>
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={loading}
                  className="mt-8 flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#e5e7eb] bg-white text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#e5e7eb]" />
                  <span className="text-xs text-slate-400">or</span>
                  <div className="h-px flex-1 bg-[#e5e7eb]" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className={onGoogleLogin ? "space-y-4" : "mt-8 space-y-4"}>
              {signup && (
                <div>
                  <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
                  <input
                    id="full-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Nguyen"
                    className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-base text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#5b5cf6] focus:ring-2 focus:ring-[#5b5cf6]/20"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-base text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#5b5cf6] focus:ring-2 focus:ring-[#5b5cf6]/20"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                  {!signup && (
                    <a href="/forgot-password" className="text-sm font-medium text-[#5b5cf6] hover:text-[#4f46e5]">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={signup ? "new-password" : "current-password"}
                    required
                    minLength={signup ? 6 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={signup ? "At least 6 characters" : "Your password"}
                    className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 pr-11 text-base text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#5b5cf6] focus:ring-2 focus:ring-[#5b5cf6]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {displayError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {displayError}
                </p>
              )}
              {notice && !displayError && (
                <p role="status" className="rounded-lg border border-[#e5e7eb] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-[#5b5cf6] text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (signup ? "Creating account..." : "Signing in...") : signup ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              {signup ? (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchTab("signin")} className="font-semibold text-[#5b5cf6] hover:text-[#4f46e5]">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to Cytron?{" "}
                  <button type="button" onClick={() => switchTab("signup")} className="font-semibold text-[#5b5cf6] hover:text-[#4f46e5]">
                    Create an account
                  </button>
                </>
              )}
            </p>
            <p className="mt-10 text-xs text-slate-400">
              <a href="/privacy" className="hover:text-slate-600">Privacy</a>
              <span className="px-2">·</span>
              <a href="/terms" className="hover:text-slate-600">Terms</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CytronLogin;
