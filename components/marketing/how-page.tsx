"use client";

import React from "react";
import { Eye, Lock, MessageSquare, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";
import ScrollSteps, { type ScrollStep } from "@/components/marketing/scroll-steps";
import { BuildFlow, ProcessMap, RulesCard, RunStatus } from "@/components/marketing/ui-fragments-more";
import { CtaBand, PageIntro, PrimaryLink, SecondaryLink } from "@/components/marketing/page-kit";

const STEPS: ScrollStep[] = [
  { id: "audit", kicker: "Week 1", label: "Audit", detail: "We sit with your team, in person on the Coast or online, and map the tasks that eat the most hours. You get the top three worth automating first.", card: <ProcessMap /> },
  { id: "design", kicker: "Week 1–2", label: "Design", detail: "We write down how your best person decides, so the automation decides the same way. You approve every rule and every message.", card: <RulesCard /> },
  { id: "build", kicker: "Week 2–4", label: "Build", detail: "Workflows connected to the tools you already use, then a read-only shadow test next to your team before anything goes live.", card: <BuildFlow /> },
  { id: "run", kicker: "Ongoing", label: "Run", detail: "Switched on one step at a time. Our agents check it every day, report in plain English and tune the rules every month.", card: <RunStatus /> },
];

const CARE_SCHEDULE = [
  { time: "8:00 am", area: "Bookings", check: "Tomorrow's diary is checked. Unconfirmed appointments get a reminder, and cancelled slots are offered to the waitlist." },
  { time: "9:00 am", area: "Enquiries", check: "Every enquiry from overnight is checked for a reply. Anything waiting on a price or a decision is pulled out." },
  { time: "1:30 pm", area: "Jobs", check: "This afternoon's jobs are checked against what's actually ready, before the van leaves." },
  { time: "5:00 pm", area: "Daily summary", check: "Every workflow from the day: did it run, did it finish, did anything fail?" },
];

const PRINCIPLES = [
  { icon: ShieldCheck, t: "Rules decide, AI assists", d: "Prices, dates and amounts come from rules you can check. AI writes the messages and helps with judgment calls." },
  { icon: Eye, t: "Read-only first", d: "Every automation starts by watching, not acting. You see its decisions before it makes any." },
  { icon: Lock, t: "Nothing goes out on a guess", d: "Unclear request? Missing detail? It's held for a person, with the reason written down." },
  { icon: RotateCcw, t: "One click back to manual", d: "Every step can be switched off and handed back to your team at any time." },
  { icon: MessageSquare, t: "Sounds like you", d: "Every message is written in your tone and approved by you before it goes live." },
  { icon: Sparkles, t: "You own it", d: "Your workflows, your data, your accounts. No black box and no lock-in." },
];

export default function HowPage() {
  return (
    <div className="bg-white">
      <PageIntro
        eyebrow="How it works"
        title={<>Audit, design, build, run. <Accent>Live in weeks</Accent>.</>}
        lead="A first workflow usually goes from audit to shadow test in a few weeks, depending on access to your systems. Nothing acts on its own until you've seen it work."
        actions={<><PrimaryLink href="/contact">Start with a free audit</PrimaryLink><SecondaryLink href="/services">What we automate</SecondaryLink></>}
      />

      <ScrollSteps
        id="process"
        label="Audit, design, build, run"
        steps={STEPS}
        header={
          <div className="max-w-3xl">
            <Eyebrow>The process</Eyebrow>
            <Heading>Four steps, <Accent>one at a time</Accent>.</Heading>
          </div>
        }
      />

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Once it runs</Eyebrow>
            <Heading>Every area has its own check, <Accent>at its own time</Accent>.</Heading>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">You choose when each area is checked. If an agent stays quiet, everything in its area passed. Example schedule below.</p>
          </div>
          <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-[#e5e7eb]">
            {CARE_SCHEDULE.map((c) => (
              <li key={c.area} className="relative flex gap-4">
                <span className="relative z-10 mt-5 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white">
                  <span className="h-2 w-2 rounded-full bg-[#5b5cf6]" />
                </span>
                <div className="flex-1 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="text-sm font-semibold text-slate-600">{c.time}</span>
                    <span className="font-semibold text-slate-900">{c.area}</span>
                  </div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{c.check}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>Our principles</Eyebrow>
          <Heading>Automation you can trust with real customers.</Heading>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-slate-700"><Icon size={18} /></div>
                <div><h3 className="mb-1.5 text-lg font-semibold text-slate-900">{t}</h3><p className="text-[15px] leading-relaxed text-slate-600">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand secondary={{ href: "/pricing", label: "See pricing" }} />
    </div>
  );
}
