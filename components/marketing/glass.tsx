"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Light frosted-glass primitives for collapsible panels (how-it-works "Assess" card,
 * hero timeline, back-office flow selector). Indigo accents, no glow, discreet motion.
 */

/** Smooth, no-bounce ease used for every expand / collapse. */
export const GLASS_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
export const GLASS_DURATION = 0.5;

/** Outer panel: translucent white, backdrop blur, 1px soft border, soft shadow. */
export const GLASS_PANEL =
  "rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white/80 to-slate-50/60 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_rgba(15,23,42,0.06)]";

/** Small uppercase section header, like MAIN / WORKSPACE in the reference. */
export const GLASS_HEADER = "text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500";

/** A row inside a panel. */
export const GLASS_ROW = "flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors duration-300";

/** Translucent indigo pill for the active / picked row. */
export const GLASS_ACTIVE = "bg-[#5b5cf6]/[0.09] ring-1 ring-inset ring-[#5b5cf6]/20";

/** Neutral glass row (not active). */
export const GLASS_IDLE = "bg-white/55 ring-1 ring-inset ring-slate-200/70";

export const GLASS_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b5cf6] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

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
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition-colors hover:border-[#c7c8f8] hover:text-[#4f46e5] ${GLASS_FOCUS} ${className}`}
      {...rest}
    >
      <motion.span
        aria-hidden
        className="flex"
        initial={false}
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: reduced ? 0 : GLASS_DURATION, ease: GLASS_EASE }}
      >
        <ChevronDown size={15} strokeWidth={2} />
      </motion.span>
    </button>
  );
}

/**
 * Height + fade collapse. Always mounted (so aria-controls resolves and SSR shows the
 * open content); hidden content gets visibility:hidden so it leaves the tab order.
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
  const d = reduced ? 0 : GLASS_DURATION;
  return (
    <motion.div
      id={id}
      initial={false}
      animate={open ? "open" : "closed"}
      variants={{
        open: { height: "auto", opacity: 1, visibility: "visible", transition: { duration: d, ease: GLASS_EASE } },
        closed: { height: 0, opacity: 0, transition: { duration: d, ease: GLASS_EASE }, transitionEnd: { visibility: "hidden" } },
      }}
      style={{ overflow: "hidden" }}
      className={className}
      aria-hidden={!open || undefined}
      {...rest}
    >
      <motion.div
        initial={false}
        animate={{ y: open ? 0 : -4 }}
        transition={{ duration: d, ease: GLASS_EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
