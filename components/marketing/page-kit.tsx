"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/components/site";

/** Top block for inner pages: same type scale and soft gradient as the home hero. */
export function PageIntro({
  eyebrow,
  title,
  lead,
  actions,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const reduced = useReducedMotion() === true;
  const rise = (d = 0) => (reduced ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.4, ease: "easeOut" as const } });
  return (
    <section className="border-b border-[#e7e6f0] bg-gradient-to-b from-[#f2f1ff] to-white">
      <div className={`mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-14 sm:pb-20 sm:pt-20 ${aside ? "lg:grid-cols-[1.1fr_0.9fr] lg:items-center" : ""}`}>
        <div>
          <motion.p {...rise()} className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#5b5cf6]">{eyebrow}</motion.p>
          <motion.h1 {...rise(0.03)} className="max-w-3xl text-[clamp(2.1rem,6.5vw,3.6rem)] font-semibold leading-[1.06] tracking-tight text-[#0f1222]">
            {title}
          </motion.h1>
          <motion.p {...rise(0.08)} className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#4b5067] sm:text-lg">{lead}</motion.p>
          {actions && <motion.div {...rise(0.12)} className="mt-8 flex flex-wrap items-center gap-3">{actions}</motion.div>}
        </div>
        {aside && <motion.div {...rise(0.15)}>{aside}</motion.div>}
      </div>
    </section>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={BTN_PRIMARY}>
      {children}
      <ChevronRight size={16} />
    </a>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className={BTN_SECONDARY}>{children}</a>;
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-[#5b5cf6] transition-colors hover:text-[#4f46e5]">
      {children}
      <ChevronRight size={15} />
    </a>
  );
}

/** Closing call to action used at the bottom of every page. */
export function CtaBand({
  title = "One call and you'll know what to automate first.",
  text = "Tell us which task eats your team's day. We'll come back with a clear plan, no obligation.",
  secondary,
}: {
  title?: string;
  text?: string;
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-[#e7e6f0] bg-[#f6f5ff] p-8 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#4b5067]">Free Automation Assessment</p>
            <h2 className="text-[26px] font-semibold leading-snug tracking-tight text-[#0f1222] sm:text-[32px]">{title}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-[#4b5067]">{text}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <PrimaryLink href="/contact">Free Automation Assessment</PrimaryLink>
            {secondary && <SecondaryLink href={secondary.href}>{secondary.label}</SecondaryLink>}
          </div>
        </div>
      </div>
    </section>
  );
}

export const CARD_CLS = "rounded-xl border border-[#e7e6f0] bg-white p-6 shadow-[0_1px_2px_rgba(15,18,34,0.04),0_10px_28px_-14px_rgba(63,55,162,0.14)]";
