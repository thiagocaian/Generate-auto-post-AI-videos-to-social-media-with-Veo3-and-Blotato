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
    <section className="border-b border-[#e5e7eb] bg-gradient-to-b from-white to-[#f3f4f7]">
      <div className={`mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-14 sm:pb-20 sm:pt-20 ${aside ? "lg:grid-cols-[1.1fr_0.9fr] lg:items-center" : ""}`}>
        <div>
          <motion.p {...rise()} className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#5b5cf6]">{eyebrow}</motion.p>
          <motion.h1 {...rise(0.03)} className="max-w-3xl text-[clamp(2.1rem,6.5vw,3.6rem)] font-semibold leading-[1.06] tracking-tight text-slate-900">
            {title}
          </motion.h1>
          <motion.p {...rise(0.08)} className="mt-5 max-w-2xl text-[17px] leading-relaxed text-slate-600 sm:text-lg">{lead}</motion.p>
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
        <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-[#e5e7eb] bg-[#f7f8fa] p-8 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Free automation audit</p>
            <h2 className="text-[26px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[32px]">{title}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-slate-600">{text}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <PrimaryLink href="/contact">Book a free audit</PrimaryLink>
            {secondary && <SecondaryLink href={secondary.href}>{secondary.label}</SecondaryLink>}
          </div>
        </div>
      </div>
    </section>
  );
}

export const CARD_CLS = "rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm";
