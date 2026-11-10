"use client";

/**
 * Discreet 3D page transitions for the marketing site (Next 14 App Router).
 *
 * - TransitionProvider lives in app/(site)/layout.tsx, so it survives navigation.
 *   It intercepts same-origin clicks to other site pages, plays the exit
 *   (the page recedes in depth), scrolls to the top while the page is invisible,
 *   then pushes the new route.
 * - PageTransition is rendered by app/(site)/template.tsx, which remounts on
 *   every navigation, so each new page plays the enter (a slight rotation in).
 * - The first page load never animates (no LCP cost), and reduced-motion users
 *   get a short plain fade.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { isSiteRoute, SITE_ROUTES } from "@/lib/site-routes";

type Phase = "idle" | "exit";
type Ctx = { phase: Phase; origin: string; navigate: (href: string) => void; onExitDone: () => void };

const TransitionCtx = createContext<Ctx>({ phase: "idle", origin: "50% 50vh", navigate: () => {}, onExitDone: () => {} });

export const useSiteNavigate = () => useContext(TransitionCtx).navigate;

const EXIT_MS = 300;
const ENTER_MS = 420;

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [origin, setOrigin] = useState("50% 50vh");
  const pending = useRef<string | null>(null);
  const fallback = useRef<number | undefined>(undefined);

  // Warm every site page so the push after the exit is instant.
  useEffect(() => {
    const id = window.setTimeout(() => SITE_ROUTES.forEach((r) => router.prefetch(r)), 1500);
    return () => window.clearTimeout(id);
  }, [router]);

  // A new route has rendered: clear the pending navigation.
  useEffect(() => {
    pending.current = null;
    window.clearTimeout(fallback.current);
    setPhase("idle");
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname) {
        router.push(url.pathname + url.search + url.hash);
        return;
      }
      if (pending.current) return;
      pending.current = url.pathname + url.search + url.hash;
      setOrigin(`50% ${Math.round(window.scrollY + window.innerHeight / 2)}px`);
      setPhase("exit");
      // Safety net: if the push never lands, do a normal page load.
      window.clearTimeout(fallback.current);
      fallback.current = window.setTimeout(() => {
        if (pending.current) window.location.assign(pending.current);
      }, 4000);
    },
    [router]
  );

  const onExitDone = useCallback(() => {
    const href = pending.current;
    if (!href) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    router.push(href, { scroll: false });
  }, [router]);

  // Turn plain <a href="/pricing"> links anywhere on the site into transitions.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !isSiteRoute(url.pathname)) return;
      if (url.pathname === window.location.pathname) return; // same-page anchor: let the browser scroll
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);

  return (
    <TransitionCtx.Provider value={{ phase, origin, navigate, onExitDone }}>
      {children}
    </TransitionCtx.Provider>
  );
}

const PERSPECTIVE = 1600;

const variants3d: Variants = {
  // incoming page: turned slightly away and a touch deeper, then settles flat
  enter: { opacity: 0, scale: 0.965, rotateY: -7, rotateX: 2, y: 18, transformPerspective: PERSPECTIVE },
  center: {
    opacity: 1, scale: 1, rotateY: 0, rotateX: 0, y: 0, transformPerspective: PERSPECTIVE,
    transition: { duration: ENTER_MS / 1000, ease: [0.22, 1, 0.36, 1] },
    transitionEnd: { transform: "none" },
  },
  // outgoing page: recedes in depth with a slight turn and fades
  exit: {
    opacity: 0, scale: 0.92, rotateY: 7, rotateX: 3, y: -10, transformPerspective: PERSPECTIVE,
    transition: { duration: EXIT_MS / 1000, ease: [0.4, 0, 0.9, 0.6] },
  },
};

const variantsFade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

let firstMount = true;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const { phase, origin, onExitDone } = useContext(TransitionCtx);
  const reduced = useReducedMotion() === true;
  const [animateIn] = useState(() => !firstMount);

  useEffect(() => {
    firstMount = false;
    // Arrived with a hash (e.g. /pricing#faq): jump to it once the page is in.
    const hash = window.location.hash.slice(1);
    if (animateIn && hash) {
      const el = document.getElementById(decodeURIComponent(hash));
      if (el) window.setTimeout(() => el.scrollIntoView({ behavior: "auto", block: "start" }), 30);
    }
  }, [animateIn]);

  return (
    <motion.div
      data-page-transition
      variants={reduced ? variantsFade : variants3d}
      initial={animateIn ? "enter" : false}
      animate={phase === "exit" ? "exit" : "center"}
      onAnimationComplete={(def) => {
        if (def === "exit") onExitDone();
      }}
      style={{ transformOrigin: phase === "exit" ? origin : "50% 50vh", backfaceVisibility: "hidden" }}
    >
      {children}
    </motion.div>
  );
}
