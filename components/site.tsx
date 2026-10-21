"use client";

import React from "react";
import { Outfit } from "next/font/google";
import { track } from "@vercel/analytics";
import { ChevronRight } from "lucide-react";
import { INDUSTRY_LINKS } from "@/lib/industries";

// Shared look of the public marketing site (home + industry pages).
export const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const ACCENT = "#5b5cf6";
export const LILAC = "#8b8cff";
export const GRADIENT = "linear-gradient(135deg, #5b5cf6 0%, #6667f8 60%, #7778ff 100%)";

// ─── Logo ─────────────────────────────────────────────────────────────────────
export function CytronLogo({ size = 30 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-lg shadow-[0_0_18px_rgba(91,92,246,0.45)]" style={{ width: size, height: size, background: GRADIENT }}>
      <span className="font-bold text-white" style={{ fontSize: size * 0.48 }}>C</span>
    </div>
  );
}

export const cta = (label: string, href = "#audit", event = "lead_audit_started") => (
  <a
    href={href}
    onClick={() => track(event)}
    className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(91,92,246,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(91,92,246,0.85),inset_0_1px_0_rgba(255,255,255,0.25)]"
    style={{ background: GRADIENT }}
  >
    {label}
    <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
  </a>
);

// ─── Section helpers ──────────────────────────────────────────────────────────
export function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? "border-white/15 bg-white/5" : "border-[#5b5cf6]/15 bg-[#5b5cf6]/[0.06]"}`} style={{ color: dark ? LILAC : ACCENT }}>
      <span className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: "currentColor" }} />
      {children}
    </p>
  );
}
export function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[42px]">{children}</h2>;
}
export function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative whitespace-nowrap">
      <span style={{ color: ACCENT }}>{children}</span>
      <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full shadow-[0_0_10px_rgba(91,92,246,0.55)]" style={{ background: ACCENT }} />
    </span>
  );
}

// ─── Nav & footer ─────────────────────────────────────────────────────────────
// On the home page the links are in-page anchors; elsewhere they point back to the home sections.
export function SiteNav({ onHome = false }: { onHome?: boolean }) {
  const base = onHome ? "" : "/";
  const links = [["What we automate", "#services"], ["Agents", "#agents"], ["Industries", "#industries"], ["How it works", "#how"], ["FAQ", "#faq"]];
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3">
      <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 shadow-[0_8px_30px_-12px_rgba(30,50,100,0.2)] backdrop-blur-xl sm:px-5">
        <a href={onHome ? "#" : "/"} className="flex items-center gap-2.5"><CytronLogo /><span className="text-[15px] font-bold tracking-wide">CYTRON</span></a>
        <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex">
          {links.map(([l, h]) => (
            <a key={h} href={base + h} className="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900">{l}</a>
          ))}
        </nav>
        <a href={base + "#audit"} onClick={() => track("lead_audit_started")} className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(91,92,246,0.7)] transition hover:-translate-y-px" style={{ background: GRADIENT }}>Free audit</a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const col = "mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40";
  const link = "block py-1 text-sm text-white/60 transition hover:text-white";
  return (
    <footer className="bg-[#050507] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5"><CytronLogo size={28} /><span className="font-semibold">CYTRON</span></div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">AI process automation for small businesses. Built and looked after by agents running on our own servers. Gold Coast, Australia.</p>
          <a href="/#audit" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: LILAC }}>Book a free audit <ChevronRight size={16} /></a>
        </div>
        <div>
          <p className={col}>Industries</p>
          {INDUSTRY_LINKS.map((i) => <a key={i.slug} href={`/${i.slug}`} className={link}>{i.name}</a>)}
        </div>
        <div>
          <p className={col}>Company</p>
          {[["What we automate", "/#services"], ["Our agents", "/#agents"], ["How it works", "/#how"], ["FAQ", "/#faq"]].map(([l, h]) => <a key={h} href={h} className={link}>{l}</a>)}
        </div>
        <div>
          <p className={col}>Account</p>
          {[["Client login", "/login"], ["Privacy", "/privacy"], ["Terms", "/terms"]].map(([l, h]) => <a key={h} href={h} className={link}>{l}</a>)}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-white/35">© {new Date().getFullYear()} Cytron · Gold Coast, Queensland, Australia</p>
      </div>
    </footer>
  );
}
