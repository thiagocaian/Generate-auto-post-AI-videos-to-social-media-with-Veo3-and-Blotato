"use client";

import React, { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Check } from "lucide-react";

/** Generic sticky "advances as you scroll" section (desktop), stacked cards (mobile), static list (reduced motion). */

export type ScrollStep = { id: string; label: string; detail: string; kicker?: string; card: React.ReactNode };

function StepList({ steps, active, onSelect, clickable }: { steps: ScrollStep[]; active: number; onSelect?: (i: number) => void; clickable?: boolean }) {
  return (
    <ol className="relative space-y-1">
      {steps.map((s, i) => {
        const done = i < active;
        const current = i === active;
        const Tag = clickable ? "button" : "div";
        return (
          <li key={s.id}>
            <Tag
              {...(clickable ? { type: "button" as const } : {})}
              onClick={clickable && onSelect ? () => onSelect(i) : undefined}
              aria-current={current ? "step" : undefined}
              className={`flex w-full gap-3 rounded-lg px-2 py-3 text-left transition-colors ${current ? "bg-white shadow-sm" : "bg-transparent"} ${clickable ? "cursor-pointer hover:bg-white" : ""}`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ${
                  done ? "bg-emerald-700 text-white" : current ? "bg-[#5b5cf6] text-white" : "border border-[#e5e7eb] bg-white text-slate-700"
                }`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0">
                {s.kicker && <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">{s.kicker}</span>}
                <span className={`block text-[16px] font-semibold ${current || done ? "text-slate-900" : "text-slate-700"}`}>{s.label}</span>
                <span className="mt-0.5 block text-[13.5px] leading-relaxed text-slate-600">{s.detail}</span>
              </span>
            </Tag>
          </li>
        );
      })}
    </ol>
  );
}

function StepCard({ step }: { step: ScrollStep }) {
  return (
    <div className="flex h-full min-h-[22rem] flex-col rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-7">
      <p className="mb-5 text-sm font-semibold text-slate-800">{step.label}</p>
      <div className="flex flex-1 flex-col justify-center">{step.card}</div>
    </div>
  );
}

function Desktop({ steps, header }: { steps: ScrollStep[]; header: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const stepProgress = useTransform(scrollYProgress, [0, 1], [0, steps.length - 0.001]);
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [active, setActive] = useState(0);

  useMotionValueEvent(stepProgress, "change", (v) => {
    const next = Math.min(steps.length - 1, Math.max(0, Math.floor(v)));
    setActive((prev) => (prev === next ? prev : next));
  });

  const scrollToStep = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const n = Math.max(1, steps.length - 1);
    const start = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: start + (i / n) * range, behavior: "smooth" });
  };

  return (
    <div ref={trackRef} className="relative" style={{ height: `${steps.length * 70}vh` }}>
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-center">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="mb-8">{header}</div>
          <div className="grid grid-cols-[0.9fr_1.1fr] items-stretch gap-12">
            <div className="relative pl-1">
              <div className="pointer-events-none absolute bottom-3 left-[22px] top-3 w-px bg-[#e5e7eb]" aria-hidden />
              <motion.div className="pointer-events-none absolute left-[22px] top-3 w-px origin-top bg-[#5b5cf6]" style={{ height: lineHeight }} aria-hidden />
              <StepList steps={steps} active={active} onSelect={scrollToStep} clickable />
            </div>
            <div className="relative min-h-[22rem]">
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: "easeOut" }} className="h-full">
                  <StepCard step={steps[active]} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileStep({ step, index }: { step: ScrollStep; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: true });
  return (
    <motion.li ref={ref} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.35, ease: "easeOut" }}>
      <p className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-slate-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#5b5cf6] text-[11px] font-semibold text-white">{index + 1}</span>
        {step.label}
      </p>
      <p className="mb-3 text-[13.5px] leading-relaxed text-slate-600">{step.detail}</p>
      <StepCard step={step} />
    </motion.li>
  );
}

export default function ScrollSteps({ id, label, header, steps }: { id: string; label: string; header: React.ReactNode; steps: ScrollStep[] }) {
  const reduced = useReducedMotion() === true;
  return (
    <section id={id} aria-label={label} className="bg-[#f7f8fa]">
      {reduced ? (
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          {header}
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <StepList steps={steps} active={steps.length} />
            <div className="space-y-5">{steps.map((s) => <StepCard key={s.id} step={s} />)}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden lg:block"><Desktop steps={steps} header={header} /></div>
          <div className="mx-auto max-w-6xl px-5 py-16 lg:hidden">
            {header}
            <ol className="mt-10 space-y-10">{steps.map((s, i) => <MobileStep key={s.id} step={s} index={i} />)}</ol>
          </div>
        </>
      )}
    </section>
  );
}
