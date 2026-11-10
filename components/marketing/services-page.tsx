"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Check, Eye, FileText, ShieldCheck } from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";
import { BookingCalendar, InvoicePaid, ReminderCard, SmsThread } from "@/components/marketing/ui-fragments";
import { HeldForReview, LeadCaptured } from "@/components/marketing/ui-fragments-more";
import { CtaBand, PageIntro, PrimaryLink, SecondaryLink } from "@/components/marketing/page-kit";

const SERVICES = [
  {
    id: "enquiries",
    short: "Missed calls & messages",
    k: "01",
    t: "Missed calls & messages, answered",
    d: "Every missed call, web form, SMS and social message gets a reply in under a minute, in your tone, with a link to book. After hours and weekends included.",
    points: ["Missed-call text back", "Web form, SMS, email and WhatsApp in one flow", "Answers to common questions, approved by you"],
    ui: <SmsThread text="Sorry we missed you, book a time here" booked />,
  },
  {
    id: "booking",
    short: "Bookings",
    k: "02",
    t: "Bookings without phone tag",
    d: "Customers pick a time that actually works for your team. It lands in your calendar or job software with the details already filled in.",
    points: ["Live availability from your calendar", "Job details captured up front", "Waitlist fills cancelled slots"],
    ui: <BookingCalendar />,
  },
  {
    id: "reminders",
    short: "Reminders",
    k: "03",
    t: "Reminders that cut no-shows",
    d: "A reminder the day before, a one-tap confirm and an easy way to reschedule. Unconfirmed appointments are flagged to you in the morning.",
    points: ["SMS and email reminders", "Confirm or reschedule by reply", "Morning list of who hasn't confirmed"],
    ui: <ReminderCard />,
  },
  {
    id: "invoicing",
    short: "Invoices & payments",
    k: "04",
    t: "Invoices raised, payments collected",
    d: "The invoice goes out the moment a job is marked done, synced to your accounts, with a link to pay by card. Overdue ones get a polite nudge.",
    points: ["Xero and MYOB sync", "Pay-by-link in the SMS", "Friendly overdue reminders"],
    ui: <InvoicePaid />,
  },
  {
    id: "crm",
    short: "Lead capture",
    k: "05",
    t: "Every lead captured in your CRM",
    d: "Name, need, suburb and source are saved automatically, duplicates are merged and follow-ups are scheduled. No more leads living in someone's inbox.",
    points: ["HubSpot or your existing CRM", "Duplicate check and tagging", "Follow-up tasks created for you"],
    ui: <LeadCaptured />,
  },
  {
    id: "review",
    short: "Human review",
    k: "06",
    t: "Human review, built in",
    d: "Anything outside the rules, like a big discount, an unhappy customer or a missing detail, is held for a person, with the full context and the reason.",
    points: ["Nothing goes out on a guess", "Approve with one tap", "Every decision logged"],
    ui: <HeldForReview />,
  },
];

const AGENT_ROLES = [
  { icon: Eye, t: "Monitor", d: "Watches every workflow around the clock. If something stalls or a connection drops, it's restarted or flagged before you notice." },
  { icon: ShieldCheck, t: "Verify", d: "Checks the data before anything is sent or changed. If a detail doesn't add up, the job is held, never pushed through on a guess." },
  { icon: FileText, t: "Report", d: "Sends a plain-English status for every area you asked us to automate, on your schedule: what ran, what passed, what needs you." },
  { icon: BarChart3, t: "Improve", d: "Spots where time is still lost and where customers drop off, and brings you the next improvement with the numbers behind it." },
];

export default function ServicesPage() {
  const reduced = useReducedMotion() === true;
  const rise = reduced ? {} : { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 0.4, ease: "easeOut" as const } };

  return (
    <div className="bg-white">
      <PageIntro
        eyebrow="Services"
        title={<>Six things that <Accent>run on their own</Accent>.</>}
        lead="From the first missed call to the paid invoice, Cytron handles the repeat work in the background and hands anything unusual to a person."
        actions={<><PrimaryLink href="/contact">Book a free audit</PrimaryLink><SecondaryLink href="/pricing">See pricing</SecondaryLink></>}
      />

      <nav aria-label="Services on this page" className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 text-[13px]">
          {SERVICES.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1.5 font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900">
              {s.short}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-16 sm:py-20">
        {SERVICES.map((s, i) => (
          <motion.section
            key={s.id}
            id={s.id}
            {...rise}
            className="grid scroll-mt-24 items-center gap-8 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10"
          >
            <div className={i % 2 ? "lg:order-2" : ""}>
              <p className="text-sm font-semibold text-[#5b5cf6]">{s.k}</p>
              <h2 className="mt-2 text-[24px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[30px]">{s.t}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-slate-600">{s.d}</p>
              <ul className="mt-6 space-y-2.5 text-[15px] text-slate-700">
                {s.points.map((p) => <li key={p} className="flex gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-emerald-700" />{p}</li>)}
              </ul>
            </div>
            <div className={`rounded-xl border border-[#e5e7eb] bg-[#f7f8fa] p-5 sm:p-7 ${i % 2 ? "lg:order-1" : ""}`}>
              <div className="mx-auto max-w-sm rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">{s.ui}</div>
            </div>
          </motion.section>
        ))}
      </div>

      <section id="agents" className="scroll-mt-20 bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-3xl">
            <Eyebrow>Cytron agents</Eyebrow>
            <Heading>Agents working on our servers, <Accent>for your business</Accent>.</Heading>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">They&apos;re not chatbots. Cytron agents are background workers running on our own servers, around the clock, keeping every automation safe and reliable.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AGENT_ROLES.map(({ icon: Icon, t, d }, i) => (
              <div key={t} className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-700"><Icon size={18} /></div>
                  <span className="text-xs font-semibold text-slate-600">0{i + 1}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{t}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Not sure where to start?" text="The free audit finds the one or two automations that save the most hours first." secondary={{ href: "/use-cases", label: "See use cases" }} />
    </div>
  );
}
