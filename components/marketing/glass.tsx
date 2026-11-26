"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, type Transition } from "framer-motion";
import { ChevronDown } from "lucide-react";
import "./liquid-glass.css";

/**
 * Frosted-glass primitives for the collapsible panels (how-it-works "Assess"
 * card, mobile hero timeline, back-office flow selector) and repeated lite cards.
 * Light theme, Wedge indigo accents, one real backdrop-filter per full panel.
 * Material lives in liquid-glass.css.
 */

/** Spring used for expand / collapse and the sliding hover pill. */
export const GLASS_SPRING: Transition = { type: "spring", bounce: 0.2, duration: 0.6 };
/** Kept for small non-spring bits (chevron, fades). */
export const GLASS_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
export const GLASS_DURATION = 0.45;

/** Small uppercase section header, like MAIN / WORKSPACE in the reference. */
export const GLASS_HEADER = "text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#5b6078]";

/** A row inside a panel. */
export const GLASS_ROW = "relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-[background,box-shadow] duration-300";

/** Translucent indigo glass for the active / picked row. */
export const GLASS_ACTIVE = "lg-row lg-row-active";

/** Neutral glass row (second glass layer, no backdrop-filter). */
export const GLASS_IDLE = "lg-row";

export const GLASS_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f37a2] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function canHoverFine() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * Frosted glass panel: modest blur, even 1px edge, no 3D tilt and no sheen.
 * `maxTilt` and `sheenDelay` are accepted so existing callers keep compiling;
 * they no longer change the material.
 */
export function LiquidGlass({
  children,
  className = "",
  panelClassName = "",
  reduced: _reduced,
  tall = false,
  maxTilt: _maxTilt = 3,
  sheenDelay: _sheenDelay,
  lite = false,
  fill = false,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
  reduced: boolean;
  tall?: boolean;
  maxTilt?: number;
  sheenDelay?: string;
  /**
   * Cheap variant for cards that repeat down a page: no backdrop-filter.
   * Hover lifts the card 5px on fine pointers (see liquid-glass.css).
   */
  lite?: boolean;
  /** Stretch the glass to the height of its parent (equal-height grid cards). */
  fill?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">) {
  void _reduced;
  void _maxTilt;
  void _sheenDelay;

  return (
    <div
      className={`lg-stage ${className}`}
      data-lite={lite || undefined}
      data-fill={fill || undefined}
      {...rest}
    >
      <div className="lg-tilt">
        <div className="lg-backdrop" data-tall={tall || undefined} aria-hidden />
        <div className={`lg-panel ${panelClassName}`}>
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
      className={`lg-row flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#4b5067] transition-colors hover:text-[#352e8c] ${GLASS_FOCUS} ${className}`}
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
