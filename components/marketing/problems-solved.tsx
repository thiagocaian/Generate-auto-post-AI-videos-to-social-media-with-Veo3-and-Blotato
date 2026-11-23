"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, FileText, Inbox, Package, Receipt, X } from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";

const CARDS = [
  {
    n: "01",
    icon: Inbox,
    title: "Client intake",
    before: "Leads typed in by hand, with hours of delay.",
    after: "Leads land in the CRM automatically, with no typing errors.",
  },
  {
    n: "02",
    icon: Receipt,
    title: "Invoice reconciliation",
    before: "Manual reconciliation and errors at month-end close.",
    after: "Reconciled in real time, with mismatches flagged straight away.",
  },
  {
    n: "03",
    icon: FileText,
    title: "Document to data",
    before: "Retyping documents and transcription errors.",
    after: "Documents become data automatically, with validation.",
  },
  {
    n: "04",
    icon: Package,
    title: "Order fulfilment",
    before: "Shipping errors and manual work.",
    after: "Automatic fulfilment, fewer errors and faster dispatch.",
    badge: "Real example · an Australian online retailer",
  },
];

export default function ProblemsSolved() {
  const reduced = useReducedMotion() === true;
  const rise = (i: number) =>
    reduced ? {} : { initial: { opacity: 0, y: 8 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.35 }, transition: { delay: i * 0.05, duration: 0.35 } };

  return (
    <section id="problems-solved" className="bg-transparent py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Eyebrow>Problems solved</Eyebrow>
        <Heading>Before and after, <Accent>without the busywork</Accent>.</Heading>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#9ca3af]">
          The same pattern, in four back-office workflows: Cytron automation handles the repeat work; a person steps in when something is off.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.article key={c.title} {...rise(i)} className="flex flex-col rounded-[24px] border border-white/[0.09] cy-glass p-6 shadow-[var(--cy-shadow)] sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#6366f1]/15 text-[#a5b4fc]">
                      <Icon size={18} strokeWidth={2} aria-hidden />
                    </span>
                    <div>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">Problem solved · {c.n}</p>
                      <h3 className="mt-0.5 text-[18px] font-semibold tracking-tight text-[#f3f4f6]">{c.title}</h3>
                    </div>
                  </div>
                </div>
                {c.badge && (
                  <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 text-[12px] font-medium text-[#d1d5db]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
                    {c.badge}
                  </p>
                )}
                <div className="mt-5 grid gap-3">
                  <div className="rounded-[18px] border border-white/[0.09] bg-white/[0.03] p-4">
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[#9ca3af]"><X size={12} strokeWidth={2.5} aria-hidden /></span>
                      Before
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#9ca3af]">{c.before}</p>
                  </div>
                  <div className="rounded-[18px] border-[1.5px] border-[#818cf8]/40 bg-[#6366f1]/10 p-4">
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a5b4fc]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4f46e5] text-white"><Check size={12} strokeWidth={2.5} aria-hidden /></span>
                      After
                    </p>
                    <p className="mt-2 text-[15px] font-medium leading-relaxed text-[#e5e7eb]">{c.after}</p>
                  </div>
                </div>
                <p className="mt-5 text-[12px] leading-relaxed text-[#9ca3af]">Cytron automation · on Cytron&apos;s own server. Exceptions go to a person.</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
