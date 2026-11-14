"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const METRICS = [
  { target: 6, suffix: "", label: "Weekend enquiries handled" },
  { target: 4, suffix: "", label: "Jobs already booked" },
  { target: 40, suffix: "s", label: "Missed-call text back" },
  { target: 3, suffix: "", label: "Review requests sent" },
];

function CountUp({
  target,
  suffix,
  start,
  reduced,
}: {
  target: number;
  suffix: string;
  start: boolean;
  reduced: boolean;
}) {
  const [n, setN] = useState(reduced ? target : 0);
  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setN(target);
      return;
    }
    let raf = 0;
    const duration = 1200;
    let t0 = 0;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, reduced]);
  return (
    <>
      {n}
      {suffix}
    </>
  );
}

export default function WeekMetrics() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion() === true;

  return (
    <section
      ref={ref}
      aria-labelledby="week-metrics-heading"
      className="border-y border-[#e5e7eb] bg-[#f7f8fa]"
    >
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2
            id="week-metrics-heading"
            className="text-[15px] font-semibold tracking-tight text-slate-900 sm:text-base"
          >
            A typical week for a Gold Coast trade business
          </h2>
          <p className="text-xs font-medium text-slate-600">Illustrative example</p>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: reduced ? 0 : i * 0.07, duration: 0.35, ease: "easeOut" }}
            >
              <dt className="text-xs font-medium leading-snug text-slate-600">{m.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
                <CountUp target={m.target} suffix={m.suffix} start={inView} reduced={reduced} />
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
