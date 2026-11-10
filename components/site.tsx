"use client";

import React, { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { INDUSTRY_LINKS } from "@/lib/industries";
import { activeNavHref, NAV_LINKS } from "@/lib/site-routes";

export const ACCENT = "#5b5cf6";
export const LILAC = "#8b8cff";
export const GRADIENT = "#5b5cf6"; // solid accent — kept so existing style={{ background: GRADIENT }} stays valid

export const CARD = "rounded-xl border border-[#e5e7eb] bg-white shadow-sm";
export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#5b5cf6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50";

export function CytronLogo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-md bg-[#5b5cf6]" style={{ width: size, height: size }}>
      <span className="font-bold text-white" style={{ fontSize: size * 0.48 }}>C</span>
    </div>
  );
}

export const cta = (label: string, href = "/contact", event = "lead_audit_started") => (
  <a href={href} onClick={() => track(event)} className={BTN_PRIMARY}>
    {label}
    <ChevronRight size={16} />
  </a>
);

export function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-slate-300" : "text-slate-600"}`}>
      {children}
    </p>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="max-w-3xl text-[28px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[36px]">{children}</h2>;
}

export function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-[#5b5cf6]">{children}</span>;
}

export function SiteNav() {
  const pathname = usePathname() || "/";
  const active = activeNavHref(pathname);
  const [open, setOpen] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const reduced = useReducedMotion() === true;
  const ease = { duration: reduced ? 0 : 0.2, ease: "easeOut" as const };
  const onContact = pathname === "/contact";

  // Close the menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Mobile sticky CTA: after the hero on the home page, after 480px elsewhere.
  useEffect(() => {
    setShowBar(false);
    const hero = document.getElementById("hero");
    if (hero) {
      const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting), { threshold: 0.2 });
      io.observe(hero);
      return () => io.disconnect();
    }
    const onScroll = () => setShowBar(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="/" className="flex items-center gap-2.5" aria-label="Cytron home">
            <CytronLogo />
            <span className="text-[15px] font-semibold tracking-wide text-slate-900">CYTRON</span>
          </a>
          <nav className="hidden items-center gap-0.5 text-sm md:flex" aria-label="Primary">
            {NAV_LINKS.map(({ label, href }) => {
              const on = active === href;
              return (
                <a
                  key={href}
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={`relative rounded-md px-3 py-1.5 transition-colors ${on ? "font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  {label}
                  {on && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-[17px] h-[2px] rounded-full bg-[#5b5cf6]"
                      transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </a>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <a href="/login" className="hidden rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900 lg:inline-flex">
              Client login
            </a>
            <a href="/contact" onClick={() => track("lead_audit_started")} className={`hidden sm:inline-flex ${BTN_PRIMARY} !px-4 !py-2`}>
              Free audit
            </a>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-slate-800 md:hidden"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            className="fixed inset-0 z-40 md:hidden"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={ease}
          >
            <button type="button" className="absolute inset-0 bg-slate-900/30" aria-label="Close menu" onClick={() => setOpen(false)} />
            <motion.nav
              aria-label="Mobile"
              className="absolute inset-x-0 top-16 border-b border-[#e5e7eb] bg-white p-4 shadow-sm"
              initial={reduced ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={ease}
            >
              {[{ label: "Home", href: "/" }, ...NAV_LINKS].map(({ label, href }) => {
                const on = href === "/" ? pathname === "/" : active === href;
                return (
                  <a
                    key={href}
                    href={href}
                    aria-current={on ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-md px-2 py-3 text-[15px] font-medium hover:bg-slate-50 ${on ? "text-[#5b5cf6]" : "text-slate-800"}`}
                  >
                    {label}
                    <ChevronRight size={16} className={on ? "text-[#5b5cf6]" : "text-slate-400"} />
                  </a>
                );
              })}
              <a href="/login" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-md px-2 py-3 text-[15px] font-medium text-slate-600 hover:bg-slate-50">
                Client login
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="/contact"
                onClick={() => { track("lead_audit_started"); setOpen(false); }}
                className={`${BTN_PRIMARY} mt-2 w-full`}
              >
                Book a free audit
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBar && !onContact && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e5e7eb] bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
            initial={reduced ? false : { y: 64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? undefined : { y: 64, opacity: 0 }}
            transition={ease}
          >
            <a href="/contact" onClick={() => track("lead_audit_started")} className={`${BTN_PRIMARY} w-full py-3`}>
              Book a free audit
              <ChevronRight size={16} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SiteFooter() {
  const col = "mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400";
  const link = "block py-1 text-sm text-slate-300 transition-colors hover:text-white";
  return (
    <footer className="bg-slate-900 pb-24 text-white md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5"><CytronLogo size={28} /><span className="font-semibold">CYTRON</span></div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">AI process automation for small businesses. Built and looked after by agents running on our own servers. Gold Coast, Australia.</p>
          <a href="/contact" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline">Book a free audit <ChevronRight size={16} /></a>
        </div>
        <div>
          <p className={col}>Company</p>
          {[{ label: "Home", href: "/" }, ...NAV_LINKS].map(({ label, href }) => <a key={href} href={href} className={link}>{label}</a>)}
        </div>
        <div>
          <p className={col}>Industries</p>
          {INDUSTRY_LINKS.map((i) => <a key={i.slug} href={`/${i.slug}`} className={link}>{i.name}</a>)}
        </div>
        <div>
          <p className={col}>Account</p>
          {[["Client login", "/login"], ["Privacy", "/privacy"], ["Terms", "/terms"]].map(([l, h]) => <a key={h} href={h} className={link}>{l}</a>)}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-slate-400">© {new Date().getFullYear()} Cytron · Gold Coast, Queensland, Australia</p>
      </div>
    </footer>
  );
}
