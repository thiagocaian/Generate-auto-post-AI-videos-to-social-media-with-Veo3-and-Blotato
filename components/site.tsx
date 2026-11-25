"use client";

import React, { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { activeNavHref, NAV_LINKS } from "@/lib/site-routes";

export const ACCENT = "#3f37a2";
export const LILAC = "#8f88d6";
export const GRADIENT = "#3f37a2"; // solid accent — kept so existing style={{ background: GRADIENT }} stays valid

/** Lavender washes sampled from the reference: flat #f6f5ff that deepens to
 *  periwinkle over a fixed band at the bottom (so it sits behind the hero cards
 *  at every viewport), with soft uneven patches like the reference. */
export const HERO_WASH =
  "radial-gradient(48% 200px at 14% 100%, rgba(176,170,255,0.55), rgba(176,170,255,0)), " +
  "radial-gradient(42% 180px at 86% 100%, rgba(188,182,255,0.45), rgba(188,182,255,0)), " +
  "linear-gradient(180deg, #f6f5ff 0%, #f6f5ff calc(100% - 440px), #efeeff calc(100% - 320px), #e2dfff calc(100% - 170px), #d2ceff calc(100% - 60px), #c9c5ff 100%)";
export const INTRO_WASH =
  "linear-gradient(180deg, #f6f5ff 0%, #f6f5ff calc(100% - 280px), #eeecff calc(100% - 130px), #e4e1ff 100%)";
export const CARD = "rounded-xl border border-[#e7e6f0] bg-white shadow-[0_1px_2px_rgba(15,18,34,0.04),0_10px_28px_-14px_rgba(63,55,162,0.14)]";
export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#3f37a2] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#352e8c]";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-[#eeedf7] px-5 py-2.5 text-sm font-semibold text-[#0f1222] transition-colors hover:bg-[#e3e1f2]";

/** Cytron mark: white C ring with a diagonal opening and a periwinkle dot on a
 *  navy rounded tile. Inline SVG traced from the brand PNG so it stays crisp. */
export function CytronLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true" focusable="false" className="block shrink-0">
      <rect width="1024" height="1024" rx="224" fill="#0B1020" />
      <path d="M713.1 309.2A280 280 0 1 0 713.1 714.8L611 607.6A132 132 0 1 1 611 416.4Z" fill="#FFFFFF" />
      <circle cx="725.5" cy="511.5" r="60" fill="#8B8CFF" />
    </svg>
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
    <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#E0C6F4]" : "text-[#4b5067]"}`}>
      {children}
    </p>
  );
}

export function Heading({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 className={`max-w-3xl text-[28px] font-semibold leading-snug tracking-tight sm:text-[36px] ${dark ? "text-white" : "text-[#0f1222]"}`}>
      {children}
    </h2>
  );
}

export function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-[#3f37a2]">{children}</span>;
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
      <header className="sticky top-0 z-50 border-b border-[#e7e6f0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="/" className="flex items-center gap-2.5" aria-label="Cytron home">
            <CytronLogo />
            <span className="text-[15px] font-semibold tracking-wide text-[#0f1222]">CYTRON</span>
          </a>
          <nav className="hidden items-center gap-0.5 text-sm md:flex" aria-label="Primary">
            {NAV_LINKS.map(({ label, href }) => {
              const on = active === href;
              return (
                <a
                  key={href}
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={`relative rounded-md px-3 py-1.5 transition-colors ${on ? "font-semibold text-[#0f1222]" : "text-[#4b5067] hover:bg-[#f6f5ff] hover:text-[#0f1222]"}`}
                >
                  {label}
                  {on && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-[17px] h-[2px] rounded-full bg-[#3f37a2]"
                      transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </a>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <a href="/login" className="hidden rounded-md px-3 py-1.5 text-sm text-[#4b5067] transition-colors hover:text-[#0f1222] lg:inline-flex">
              Client login
            </a>
            <a href="/contact" onClick={() => track("lead_audit_started")} className={`hidden sm:inline-flex ${BTN_PRIMARY} !px-4 !py-2`}>
              Free Assessment
            </a>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#e7e6f0] bg-white text-[#1a1d33] md:hidden"
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
              className="absolute inset-x-0 top-16 border-b border-[#e7e6f0] bg-white p-4 shadow-sm"
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
                    className={`flex items-center justify-between rounded-md px-2 py-3 text-[15px] font-medium hover:bg-[#f6f5ff] ${on ? "text-[#3f37a2]" : "text-[#1a1d33]"}`}
                  >
                    {label}
                    <ChevronRight size={16} className={on ? "text-[#3f37a2]" : "text-slate-400"} />
                  </a>
                );
              })}
              <a href="/login" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-md px-2 py-3 text-[15px] font-medium text-[#4b5067] hover:bg-[#f6f5ff]">
                Client login
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="/contact"
                onClick={() => { track("lead_audit_started"); setOpen(false); }}
                className={`${BTN_PRIMARY} mt-2 w-full`}
              >
                Free Automation Assessment
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBar && !onContact && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e7e6f0] bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
            initial={reduced ? false : { y: 64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? undefined : { y: 64, opacity: 0 }}
            transition={ease}
          >
            <a href="/contact" onClick={() => track("lead_audit_started")} className={`${BTN_PRIMARY} w-full py-3`}>
              Free Automation Assessment
              <ChevronRight size={16} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SiteFooter() {
  const col = "mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9db8]";
  const link = "block py-1 text-sm text-[#c9cbe0] transition-colors hover:text-white";
  return (
    <footer className="bg-[#0A0038] pb-24 text-white md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5"><CytronLogo size={28} /><span className="font-semibold">CYTRON</span></div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#c9cbe0]">Specialists in automating repetitive office tasks for trade, wholesale, e-commerce and warehouse operations. Run on our own servers. Gold Coast.</p>
          <a href="/contact" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline">Free Automation Assessment <ChevronRight size={16} /></a>
        </div>
        <div>
          <p className={col}>Company</p>
          {[{ label: "Home", href: "/" }, ...NAV_LINKS].map(({ label, href }) => <a key={href} href={href} className={link}>{label}</a>)}
        </div>
        <div>
          <p className={col}>Office tasks</p>
          {[
            ["Stock & inventory", "/use-cases#stock"],
            ["Order intake", "/use-cases#orders"],
            ["Dispatch & fulfilment", "/use-cases#dispatch"],
            ["B2B & online sales", "/use-cases#sales"],
          ].map(([label, href]) => <a key={href} href={href} className={link}>{label}</a>)}
        </div>
        <div>
          <p className={col}>Account</p>
          {[["Client login", "/login"], ["Privacy", "/privacy"], ["Terms", "/terms"]].map(([l, h]) => <a key={h} href={h} className={link}>{l}</a>)}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-[#9a9db8]">© {new Date().getFullYear()} Cytron · Gold Coast, Queensland, Australia</p>
      </div>
    </footer>
  );
}
