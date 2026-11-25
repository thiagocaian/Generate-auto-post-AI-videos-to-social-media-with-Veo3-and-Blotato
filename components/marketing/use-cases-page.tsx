"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, Check, ChevronRight, ClipboardList, Package, Truck } from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";
import StatsSection from "@/components/marketing/stats";
import WeekTimeline from "@/components/marketing/week-timeline";
import { CtaBand, PageIntro, PrimaryLink, SecondaryLink } from "@/components/marketing/page-kit";
import { LiquidGlass } from "@/components/marketing/glass";
const CASES: {
  id: string;
  icon: typeof Package;
  t: string;
  lead: string;
  before: string[];
  after: string[];
  week: [string, string][];
  tools: string;
  more: null | { href: string; label: string };
}[] = [
  {
    id: "stock",
    icon: Package,
    t: "Stock & inventory",
    lead: "The office sees what is low before the warehouse runs out.",
    before: ["Stock counted in a spreadsheet", "Reorders raised after a product sells out", "The office and the floor working from different lists"],
    after: ["Levels checked against the reorder point", "A buyer alert before the shelf is empty", "One list for the office and the warehouse"],
    week: [["Checked before the shift", "Daily"], ["Low lines", "Flagged"], ["Recounts", "Held"], ["Office retype", "None"]],
    tools: "Shopify · Xero · Spreadsheets",
    more: null,
  },
  {
    id: "orders",
    icon: ClipboardList,
    t: "Order intake",
    lead: "Wholesale and online orders are checked before anyone starts picking.",
    before: ["Orders keyed in by hand", "Bad addresses found at the bench", "Accounts and the store sitting in different inboxes"],
    after: ["Each order read as it arrives", "Unclear lines held, with the reason written down", "A clean order passed to pick"],
    week: [["Read on arrival", "Each"], ["Unclear lines", "Held"], ["Duplicates", "Caught"], ["Retyping", "None"]],
    tools: "Shopify · Email · HubSpot",
    more: null,
  },
  {
    id: "dispatch",
    icon: Truck,
    t: "Dispatch & fulfilment",
    lead: "Paperwork and status updates are ready before the shift, not after it.",
    before: ["Labels made one by one", "Customers asking where the order is", "Dispatch notes living in someone's head"],
    after: ["Labels and paperwork prepared for the run", "Status updates sent without a chase", "Exceptions held for a person"],
    week: [["Paperwork", "Ready"], ["Status", "Sent"], ["Exceptions", "Held"], ["Manual chase", "None"]],
    tools: "Shopify · Shipping · Email",
    more: null,
  },
  {
    id: "sales",
    icon: Briefcase,
    t: "B2B & online sales",
    lead: "Repeat sales admin — invoices, follow-up and documents — runs without the office chasing it.",
    before: ["Invoices raised at the end of the week", "Follow-up left to whoever remembers", "Documents requested one email at a time"],
    after: ["Invoices raised when the order is done", "Follow-up sent in your tone", "Documents requested until they are in"],
    week: [["Invoices", "Raised"], ["Follow-up", "Sent"], ["Documents", "Chased"], ["End-of-week pile", "None"]],
    tools: "Xero · MYOB · Shopify",
    more: null,
  },
];

const CASE_POINTS = [
  "Every new order checked before the team starts the day",
  "Shipping paperwork ready before the shift, not after it",
  "Unclear orders held for a person, with the reason written down",
  "The team asks an assistant what's pending instead of digging through spreadsheets",
];

export default function UseCasesPage() {
  const reduced = useReducedMotion() === true;
  const rise = reduced ? {} : { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.4, ease: "easeOut" as const } };

  return (
    <div>
      <PageIntro
        eyebrow="Use cases"
        title={<>Repetitive office work, <Accent>handled</Accent>.</>}
        lead="Cytron specialises in automating repetitive office tasks for trade, wholesale, e-commerce and warehouse operations."
        actions={<><PrimaryLink href="/contact">Free Automation Assessment</PrimaryLink><SecondaryLink href="/services">All services</SecondaryLink></>}
      />

      <nav aria-label="Office tasks" className="border-b border-[#e7e6f0] bg-white">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 text-[13px]">
          {CASES.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#e7e6f0] px-3 py-1.5 font-medium text-[#2e3248] transition-colors hover:border-slate-300 hover:text-[#0f1222]">
              <c.icon size={14} />{c.t}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-16 sm:py-20">
        {CASES.map((c, i) => (
          <motion.section key={c.id} id={c.id} {...rise} className="scroll-mt-24">
            <LiquidGlass reduced={reduced} lite maxTilt={1.5} sheenDelay={`${i * 1.1 + 0.6}s`}>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-900/[0.07] p-6 sm:p-8">
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#e7e6f0] text-[#2e3248]"><c.icon size={20} /></span>
                  <div>
                    <h2 className="text-[22px] font-semibold tracking-tight text-[#0f1222] sm:text-[26px]">{c.t}</h2>
                    <p className="mt-1 text-[15.5px] text-[#4b5067]">{c.lead}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-[#4b5067]">{c.tools}</p>
              </div>
              <div className="grid gap-px bg-slate-900/[0.07] lg:grid-cols-[1fr_1fr_1.1fr]">
                <div className="bg-white/55 p-6 sm:p-8">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#4b5067]">Today</p>
                  <ul className="space-y-3 text-[15px] text-[#4b5067]">
                    {c.before.map((b) => <li key={b} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />{b}</li>)}
                  </ul>
                </div>
                <div className="bg-white/55 p-6 sm:p-8">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#3f37a2]">With Cytron</p>
                  <ul className="space-y-3 text-[15px] text-[#1a1d33]">
                    {c.after.map((a) => <li key={a} className="flex gap-3"><Check size={17} className="mt-0.5 shrink-0 text-emerald-700" />{a}</li>)}
                  </ul>
                </div>
                <div className="bg-white/35 p-6 sm:p-8">
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4b5067]">A typical week</p>
                    <p className="text-[11px] font-medium text-[#4b5067]">Illustrative example</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-3">
                    {c.week.map(([k, v]) => (
                      <div key={k} className="rounded-lg border border-white/80 bg-white/80 p-3.5">
                        <dd className="text-2xl font-semibold tabular-nums tracking-tight text-[#0f1222]">{v}</dd>
                        <dt className="mt-0.5 text-[12px] leading-snug text-[#4b5067]">{k}</dt>
                      </div>
                    ))}
                  </dl>
                  {c.more && (
                    <a href={c.more.href} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#3f37a2] hover:text-[#352e8c]">{c.more.label} <ChevronRight size={15} /></a>
                  )}
                </div>
              </div>
            </LiquidGlass>
          </motion.section>
        ))}
        <p className="text-xs text-[#4b5067]">Examples of the office work, not client results. Every operation gets its own rules, tone and tools.</p>
      </div>

      <StatsSection />

      <section id="case" className="scroll-mt-20 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2">
          <div>
            <Eyebrow>Case study · Australian online retailer</Eyebrow>
            <Heading>Mornings that used to start <Accent>by hand</Accent>.</Heading>
            <p className="mt-4 leading-relaxed text-[#4b5067]">A growing Australian online store was checking every order by hand each morning before anything could ship. We automated the order checks, the shipping paperwork and a daily summary for the team. Anything unusual now goes to a person first.</p>
          </div>
          <ul className="space-y-3 self-center text-[15px] text-[#2e3248]">
            {CASE_POINTS.map((t, i) => (
              <li key={t}>
                <LiquidGlass reduced={reduced} lite panelClassName="p-4" sheenDelay={`${i * 0.7 + 0.5}s`}>
                  <div className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-emerald-700" />{t}</div>
                </LiquidGlass>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="week" className="scroll-mt-20 bg-[#F0EEF6] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <Eyebrow>A week with Cytron</Eyebrow>
          <Heading>The same week, <Accent>without the admin</Accent>.</Heading>
          <WeekTimeline />
          <p className="mt-6 text-xs text-[#4b5067]">Illustrative example. Every business gets its own rules, tone and tools.</p>
        </div>
      </section>

      <section className="bg-white pt-16">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#4b5067]">Office tasks</p>
          <div className="flex flex-wrap gap-2.5">
            {CASES.map((c) => (
              <a key={c.id} href={`#${c.id}`} className="rounded-md border border-[#e7e6f0] bg-white px-4 py-2 text-sm font-medium text-[#2e3248] transition-colors hover:border-slate-300 hover:text-[#0f1222]">{c.t}</a>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Running trade, wholesale or fulfilment?" text="If an office task follows the same steps every time, it can usually run on its own. The assessment will tell you which ones." />
    </div>
  );
}
