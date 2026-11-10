"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Accent, Eyebrow } from "@/components/site";

const STATS = [
  { target: 72, prefix: "", suffix: "%", v: "of Australians expect a reply from a small business within an hour. 22% expect it instantly.", link: "Missed calls & enquiries", src: "Zoho, 2024", url: "https://itbrief.com.au/story/zoho-study-reveals-rising-customer-service-expectations-in-australia" },
  { target: 15257, prefix: "$", suffix: "", v: "a year is what late payments cost the average Australian small business.", link: "Invoices & getting paid", src: "Xero Small Business Insights, Dec 2025 qtr", url: "https://www.xero.com/au/guides/late-payment-small-business-australia/" },
  { target: 97, prefix: "", suffix: "%", v: "of Gold Coast businesses have fewer than 20 staff. Most have no admin team to absorb the busywork.", link: "Reports & AI assistant", src: "NEMA Gold Coast LGA profile, 2025", url: "https://www.nema.gov.au/sites/default/files/LGAProfiles/Gold%20Coast%20-%20LGA%20profile.docx" },
  { target: 64, prefix: "", suffix: "%", v: "of Australian small businesses already use AI regularly, up from 39% a year earlier.", link: "Your competitors are moving", src: "QuickBooks Small Business Insights, Apr 2025", url: "https://quickbooks.intuit.com/au/blog/news/small-business-insights-survey-april-2025" },
];

function formatStat(n: number, prefix: string, suffix: string) {
  if (prefix === "$") return `$${n.toLocaleString("en-AU")}`;
  return `${n}${suffix}`;
}

function CountUp({ target, prefix, suffix, start, reduced }: { target: number; prefix: string; suffix: string; start: boolean; reduced: boolean }) {
  const [n, setN] = useState(reduced ? target : 0);
  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setN(target);
      return;
    }
    let raf = 0;
    const duration = 1400;
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
  return <>{formatStat(n, prefix, suffix)}</>;
}

export default function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduced = useReducedMotion() === true;

  return (
    <section id="numbers" ref={ref} className="bg-[#f7f8fa] px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
      <Eyebrow>Why it matters</Eyebrow>
      <h2 className="max-w-3xl text-[28px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[36px]">
        Small teams, <Accent>big expectations</Accent>.
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-700">
        Customers expect fast replies and easy payments. Most local businesses don&apos;t have the staff to keep up by hand. That gap is where automation pays for itself.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.link}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: reduced ? 0 : i * 0.08, duration: 0.35, ease: "easeOut" }}
            className="flex flex-col rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm"
          >
            <p className="text-4xl font-semibold tracking-tight text-slate-900">
              <CountUp target={s.target} prefix={s.prefix} suffix={s.suffix} start={inView} reduced={reduced} />
            </p>
            <p className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-700">{s.v}</p>
            <p className="mt-5 text-xs font-semibold text-slate-800">→ {s.link}</p>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline">
              Source: {s.src}
            </a>
          </motion.div>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-700">On the Coast, health care employment grew 18.5% and construction 12.9% in the year to August 2025 (<a href="https://www.jobsandskills.gov.au/sites/default/files/2025-10/Industry%20Profile%20Gold%20Coast.pdf" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-800 underline underline-offset-2">Jobs and Skills Australia</a>). More clients, same front desk.</p>
      </div>
    </section>
  );
}
