"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, type Transition } from "framer-motion";
import { ChevronDown } from "lucide-react";
import "./liquid-glass.css";

/**
 * Liquid-glass primitives for the three collapsible panels (how-it-works "Assess"
 * card, mobile hero timeline, back-office flow selector). Light theme, indigo
 * accents, one real backdrop-filter per panel. Material lives in liquid-glass.css.
 */

/** Spring used for expand / collapse and the sliding hover pill. */
export const GLASS_SPRING: Transition = { type: "spring", bounce: 0.2, duration: 0.6 };
/** Kept for small non-spring bits (chevron, fades). */
export const GLASS_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
export const GLASS_DURATION = 0.45;

/** Legacy flat panel (pre liquid glass); kept until every panel uses LiquidGlass. */
export const GLASS_PANEL =
  "rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white/80 to-slate-50/60 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_rgba(15,23,42,0.06)]";

/** Small uppercase section header, like MAIN / WORKSPACE in the reference. */
export const GLASS_HEADER = "text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500";

/** A row inside a panel. */
export const GLASS_ROW = "relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-[background,box-shadow] duration-300";

/** Translucent indigo glass for the active / picked row. */
export const GLASS_ACTIVE = "lg-row lg-row-active";

/** Neutral glass row (second glass layer, no backdrop-filter). */
export const GLASS_IDLE = "lg-row";

export const GLASS_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b5cf6] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function canHoverFine() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * Glass panel with blurred colour shapes behind it, a specular edge, a periodic sheen,
 * and (desktop pointer only) a reflection that follows the pointer plus a slight tilt.
 * Pointer work writes CSS variables through a ref, throttled with rAF: no re-renders.
 */
export function LiquidGlass({
  children,
  className = "",
  panelClassName = "",
  reduced,
  tall = false,
  maxTilt = 3,
  sheenDelay,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
  reduced: boolean;
  tall?: boolean;
  maxTilt?: number;
  sheenDelay?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current = !reduced && canHoverFine();
    return () => cancelAnimationFrame(frame.current);
  }, [reduced]);

  const apply = useCallback(() => {
    frame.current = 0;
    const el = tiltRef.current;
    const p = last.current;
    if (!el || !p) return;
    const r = el.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (p.x - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (p.y - r.top) / r.height));
    el.style.setProperty("--lg-mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--lg-my", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--lg-ry", `${((px - 0.5) * 2 * maxTilt).toFixed(2)}deg`);
    el.style.setProperty("--lg-rx", `${((0.5 - py) * 2 * maxTilt).toFixed(2)}deg`);
  }, [maxTilt]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled.current || e.pointerType !== "mouse") return;
    last.current = { x: e.clientX, y: e.clientY };
    if (tiltRef.current) tiltRef.current.dataset.hover = "true";
    if (!frame.current) frame.current = requestAnimationFrame(apply);
  };
  const onPointerLeave = () => {
    const el = tiltRef.current;
    last.current = null;
    if (!el) return;
    el.dataset.hover = "false";
    el.style.setProperty("--lg-rx", "0deg");
    el.style.setProperty("--lg-ry", "0deg");
  };

  return (
    <div className={`lg-stage ${className}`} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} {...rest}>
      <div ref={tiltRef} className="lg-tilt" data-hover="false">
        <div className="lg-backdrop" data-tall={tall || undefined} aria-hidden>
          <span className="lg-blob lg-blob-1" />
          <span className="lg-blob lg-blob-2" />
          <span className="lg-blob lg-blob-3" />
        </div>
        <div
          className={`lg-panel ${panelClassName}`}
          style={sheenDelay ? ({ ["--lg-sheen-delay" as string]: sheenDelay } as React.CSSProperties) : undefined}
        >
          <span className="lg-glare" aria-hidden />
          <div className="lg-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hover pill that slides between rows (desktop mouse only). Usage:
 *   const hover = useHoverPill(reduced);
 *   <li {...hover.bind(i)}>{hover.pill(i, "assess")}...</li>
 */
export function useHoverPill(reduced: boolean) {
  const [hovered, setHovered] = useState<number | null>(null);
  const fine = useRef(false);
  useEffect(() => {
    fine.current = canHoverFine();
  }, []);
  const bind = (i: number) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && fine.current) setHovered(i);
    },
    onPointerLeave: () => setHovered((h) => (h === i ? null : h)),
  });
  const pill = (i: number, group: string) =>
    hovered === i ? (
      <motion.span
        layoutId={`lg-hover-${group}`}
        className="lg-hover-pill"
        aria-hidden
        transition={reduced ? { duration: 0 } : GLASS_SPRING}
      />
    ) : null;
  return { hovered, bind, pill };
}

/** Round chevron button that opens / closes a panel. */
export function GlassChevron({
  open,
  controls,
  label,
  onClick,
  reduced,
  className = "",
  ...rest
}: {
  open: boolean;
  controls: string;
  label: string;
  onClick: () => void;
  reduced: boolean;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "aria-expanded" | "aria-controls" | "aria-label">) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={label}
      onClick={onClick}
      className={`lg-row flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:text-[#4f46e5] ${GLASS_FOCUS} ${className}`}
      {...rest}
    >
      <GlassChevronIcon open={open} reduced={reduced} />
    </button>
  );
}

export function GlassChevronIcon({ open, reduced, size = 15 }: { open: boolean; reduced: boolean; size?: number }) {
  return (
    <motion.span
      aria-hidden
      className="flex"
      initial={false}
      animate={{ rotate: open ? 180 : 0 }}
      transition={reduced ? { duration: 0 } : GLASS_SPRING}
    >
      <ChevronDown size={size} strokeWidth={2} />
    </motion.span>
  );
}

/**
 * Height + fade collapse on a spring. Always mounted (so aria-controls resolves and SSR
 * shows the open content); hidden content gets visibility:hidden and leaves the tab order.
 * Labels inside fade and slide in with the panel.
 */
export function GlassCollapse({
  open,
  id,
  reduced,
  children,
  className = "",
  ...rest
}: {
  open: boolean;
  id?: string;
  reduced: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "id" | "className" | "children" | "style" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd">) {
  const height: Transition = reduced ? { duration: 0 } : GLASS_SPRING;
  const fade: Transition = reduced ? { duration: 0 } : { duration: 0.3, ease: GLASS_EASE, delay: open ? 0.08 : 0 };
  return (
    <motion.div
      id={id}
      initial={false}
      animate={open ? "open" : "closed"}
      variants={{
        open: { height: "auto", opacity: 1, visibility: "visible", transition: { height, opacity: fade } },
        closed: { height: 0, opacity: 0, transition: { height, opacity: fade }, transitionEnd: { visibility: "hidden" } },
      }}
      style={{ overflow: "hidden" }}
      className={className}
      aria-hidden={!open || undefined}
      {...rest}
    >
      <motion.div
        initial={false}
        animate={{ y: open ? 0 : -6, x: open ? 0 : -4 }}
        transition={reduced ? { duration: 0 } : GLASS_SPRING}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
