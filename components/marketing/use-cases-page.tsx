"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, Check, ChevronRight, Scissors, Stethoscope, Wrench } from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";
import StatsSection from "@/components/marketing/stats";
import WeekTimeline from "@/components/marketing/week-timeline";
import { CtaBand, PageIntro, PrimaryLink, SecondaryLink } from "@/components/marketing/page-kit";
import { INDUSTRY_LINKS } from "@/lib/industries";

const CASES = [
  {
    id: "salon",
    icon: Scissors,
    t: "Salons & beauty",
    lead: "Chairs stay full when rebooking, reminders and cancellations run themselves.",
    before: ["Phone rings mid-cut and goes to voicemail", "No-shows leave gaps nobody can fill", "Clients forget to rebook for six weeks"],
    after: ["Instant reply with a booking link", "Reminder the day before, waitlist fills cancellations", "A rebook nudge at the right time for each service"],
    week: [["Bookings made online", "14"], ["No-shows avoided", "3"], ["Gaps filled from waitlist", "2"], ["Hours back at the front desk", "5"]],
    tools: "Your booking app · Google Calendar · SMS",
    more: null as null | { href: string; label: string },
  },
  {
    id: "clinic",
    icon: Stethoscope,
    t: "Clinics & allied health",
    lead: "Reception gets time back for the patients in front of them.",
    before: ["Reminder calls take the first hour of every day", "Intake forms filled in the waiting room", "Recalls slip when the team is busy"],
    after: ["Reminders and confirmations by SMS", "Intake forms sent and returned before the visit", "Recall messages on schedule, in your tone"],
    week: [["Appointments confirmed", "62"], ["Intake forms returned early", "18"], ["Recalls sent", "25"], ["Reception hours saved", "6"]],
    tools: "Cliniko · Halaxy · Google Calendar",
    more: { href: "/clinics", label: "Clinics in detail" },
  },
  {
    id: "trades",
    icon: Wrench,
    t: "Trades & mechanics",
    lead: "From missed call to paid invoice while you're on the tools.",
    before: ["Calls missed under a sink or a car", "Quotes sent days late and never followed up", "Invoices written at night"],
    after: ["Missed-call text back in 40 seconds", "Same-day quotes with a polite follow-up", "Invoice raised when the job is done, paid by link"],
    week: [["Weekend enquiries handled", "6"], ["Jobs booked automatically", "4"], ["Quotes followed up", "5"], ["Invoices paid by link", "9"]],
    tools: "ServiceM8 · Tradify · Xero",
    more: { href: "/trades", label: "Trades in detail" },
  },
  {
    id: "services",
    icon: Briefcase,
    t: "Service providers",
    lead: "Onboarding, documents and deadlines without the chasing.",
    before: ["New clients onboarded by email ping-pong", "Documents chased one by one", "Deadlines tracked in someone's head"],
    after: ["Onboarding flow with forms and e-signature", "Automatic document requests and reminders", "Deadline reminders and recurring reports"],
    week: [["Clients onboarded", "3"], ["Documents collected", "21"], ["Deadline reminders sent", "12"], ["Admin hours saved", "7"]],
    tools: "Microsoft 365 · Google Workspace · Xero",
    more: { href: "/professional-services", label: "Professional services in detail" },
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
    <div className="bg-white">
      <PageIntro
        eyebrow="Use cases"
        title={<>Same admin, <Accent>different business</Accent>.</>}
        lead="Most Gold Coast businesses have fewer than 20 staff and the same repeat tasks. Here is what automation looks like for four of them."
        actions={<><PrimaryLink href="/contact">Book a free audit</PrimaryLink><SecondaryLink href="/services">All services</SecondaryLink></>}
      />

      <nav aria-label="Business types" className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 text-[13px]">
          {CASES.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#e5e7eb] px-3 py-1.5 font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900">
              <c.icon size={14} />{c.t}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-16 sm:py-20">
        {CASES.map((c) => (
          <motion.section key={c.id} id={c.id} {...rise} className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5e7eb] p-6 sm:p-8">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-700"><c.icon size={20} /></span>
                <div>
                  <h2 className="text-[22px] font-semibold tracking-tight text-slate-900 sm:text-[26px]">{c.t}</h2>
                  <p className="mt-1 text-[15.5px] text-slate-600">{c.lead}</p>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600">{c.tools}</p>
            </div>
            <div className="grid gap-px bg-[#e5e7eb] lg:grid-cols-[1fr_1fr_1.1fr]">
              <div className="bg-white p-6 sm:p-8">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Today</p>
                <ul className="space-y-3 text-[15px] text-slate-600">
                  {c.before.map((b) => <li key={b} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />{b}</li>)}
                </ul>
              </div>
              <div className="bg-white p-6 sm:p-8">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#5b5cf6]">With Cytron</p>
                <ul className="space-y-3 text-[15px] text-slate-800">
                  {c.after.map((a) => <li key={a} className="flex gap-3"><Check size={17} className="mt-0.5 shrink-0 text-emerald-700" />{a}</li>)}
                </ul>
              </div>
              <div className="bg-[#f7f8fa] p-6 sm:p-8">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">A typical week</p>
                  <p className="text-[11px] font-medium text-slate-600">Illustrative example</p>
                </div>
                <dl className="grid grid-cols-2 gap-3">
                  {c.week.map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-[#e5e7eb] bg-white p-3.5">
                      <dd className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{v}</dd>
                      <dt className="mt-0.5 text-[12px] leading-snug text-slate-600">{k}</dt>
                    </div>
                  ))}
                </dl>
                {c.more && (
                  <a href={c.more.href} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#5b5cf6] hover:text-[#4f46e5]">{c.more.label} <ChevronRight size={15} /></a>
                )}
              </div>
            </div>
          </motion.section>
        ))}
        <p className="text-xs text-slate-600">Weekly numbers are illustrative examples, not client results. Every business gets its own rules, tone and tools.</p>
      </div>

      <StatsSection />

      <section id="case" className="scroll-mt-20 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2">
          <div>
            <Eyebrow>Case study · Australian online retailer</Eyebrow>
            <Heading>Mornings that used to start <Accent>by hand</Accent>.</Heading>
            <p className="mt-4 leading-relaxed text-slate-600">A growing Australian online store was checking every order by hand each morning before anything could ship. We automated the order checks, the shipping paperwork and a daily summary for the team. Anything unusual now goes to a person first.</p>
          </div>
          <ul className="space-y-3 self-center text-[15px] text-slate-700">
            {CASE_POINTS.map((t) => (
              <li key={t} className="flex gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm"><Check size={18} className="mt-0.5 shrink-0 text-emerald-700" />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="week" className="scroll-mt-20 bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <Eyebrow>A week with Cytron</Eyebrow>
          <Heading>The same week, <Accent>without the admin</Accent>.</Heading>
          <WeekTimeline />
          <p className="mt-6 text-xs text-slate-600">Illustrative example. Every business gets its own rules, tone and tools.</p>
        </div>
      </section>

      <section className="bg-white pt-16">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Industry guides</p>
          <div className="flex flex-wrap gap-2.5">
            {INDUSTRY_LINKS.map((i) => (
              <a key={i.slug} href={`/${i.slug}`} className="rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900">{i.name}</a>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Don't see your business here?" text="If a task follows the same steps every time, it can usually run on its own. The audit will tell you which ones." />
    </div>
  );
}
