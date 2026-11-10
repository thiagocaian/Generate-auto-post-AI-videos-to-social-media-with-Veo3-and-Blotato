"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Check,
  ChevronRight,
  FileText,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
  BarChart3,
  Eye,
  Lock,
} from "lucide-react";
import { Accent, Eyebrow, Heading, SiteFooter, SiteNav } from "@/components/site";
import AnnouncementBar from "@/components/marketing/announcement-bar";
import MarketingHero from "@/components/marketing/marketing-hero";
import WeekMetrics from "@/components/marketing/week-metrics";
import Walkthrough from "@/components/marketing/walkthrough";
import ServicesBento from "@/components/marketing/services-bento";
import StatsSection from "@/components/marketing/stats";
import WeekTimeline from "@/components/marketing/week-timeline";
import AuditForm from "@/components/marketing/audit-form";

// ─── Content ──────────────────────────────────────────────────────────────────
const AGENT_ROLES = [
  { icon: Eye, t: "Monitor", d: "Watches every workflow around the clock. If something stalls or a connection drops, it's restarted or flagged before you notice." },
  { icon: ShieldCheck, t: "Verify", d: "Checks the data before anything is sent or changed. If a detail doesn't add up, the job is held, never pushed through on a guess." },
  { icon: FileText, t: "Report", d: "Sends a plain-English status for every area you asked us to automate, on your schedule: what ran, what passed, what needs you." },
  { icon: BarChart3, t: "Improve", d: "Spots where time is still lost and where customers drop off, and brings you the next improvement with the numbers behind it." },
];

const CARE_SCHEDULE = [
  { time: "7:30 am", area: "Data check", check: "Every new record's suburb, state and postcode is matched against the official Australian postcode list, and the street is confirmed on the map.", you: "Only the records that need a look, with the reason. Nothing is changed." },
  { time: "8:00 am", area: "Bookings", check: "Tomorrow's diary is checked. Unconfirmed appointments get a reminder, and cancelled slots are offered to the waitlist.", you: "Who hasn't confirmed, and which gaps were filled." },
  { time: "9:00 am", area: "Enquiries", check: "Every enquiry from overnight is checked for a reply. Anything waiting on a price or a decision is pulled out.", you: "The ones waiting on you, with the details attached." },
  { time: "1:30 pm", area: "Jobs & deliveries", check: "This afternoon's jobs and deliveries are checked against what's actually ready, before the van leaves.", you: "Anything not ready, so it's sorted in time." },
  { time: "5:00 pm", area: "Daily summary", check: "Every workflow from the day is checked: did it run, did it finish, did anything fail?", you: "One short status for every area, and what needs you tomorrow." },
  { time: "Mon 8:00 am", area: "Invoices", check: "Every open invoice is checked. Overdue ones get a polite reminder in your tone.", you: "What was paid, what's overdue and who was reminded." },
];

const CASE_POINTS = [
  "Every new order checked before the team starts the day",
  "Shipping paperwork ready before the shift, not after it",
  "Unclear orders held for a person, with the reason written down",
  "The team asks an assistant what's pending instead of digging through spreadsheets",
];

const EXPERIENCE = {
  customers: [
    "A reply in minutes, even at 9 pm on a Sunday",
    "A booking confirmed without phone tag",
    "A reminder before they forget, and an easy way to reschedule",
    "A quote the same day, and an invoice that takes one tap to pay",
    "A thank-you that sounds like your business, not a robot",
  ],
  team: [
    "Monday starts with a summary, not a full inbox",
    "No more re-typing between the calendar, the job app and the accounts",
    "Overdue invoices chased without awkward phone calls",
    "Fewer gaps in the diary from no-shows",
    "Anything unusual lands with a person, with the full context",
  ],
};

const INDUSTRIES = [
  { icon: Wrench, t: "Trades & construction", slug: "trades", d: "Missed-call text back, quote follow-up, job reminders and an invoice the day the job is done.", tools: "ServiceM8 · Tradify · Xero" },
  { icon: Stethoscope, t: "Clinics & allied health", slug: "clinics", d: "Appointment reminders, waitlist backfill, intake forms before the visit and recall messages.", tools: "Cliniko · Halaxy · Google Calendar" },
  { icon: Building2, t: "Real estate & property", slug: "real-estate", d: "Instant enquiry replies, inspection bookings and maintenance requests routed to the right tradie.", tools: "Your CRM · Email · SMS" },
  { icon: UtensilsCrossed, t: "Hospitality, tourism & short-stay", slug: "hospitality", d: "Booking confirmations, pre-arrival info, guest questions answered and review requests after checkout.", tools: "Booking platforms · WhatsApp" },
  { icon: ShoppingBag, t: "Retail & online stores", slug: "retail", d: "Order updates, low-stock alerts, customer questions and returns handled in one flow.", tools: "Shopify · WooCommerce" },
  { icon: Briefcase, t: "Professional services", slug: "professional-services", d: "Client onboarding, document collection, deadline reminders and recurring reports.", tools: "Microsoft 365 · Google Workspace" },
];

const STEPS_HOW = [
  { n: "01", t: "Free audit", d: "We sit with your team, in person or online, and map the tasks that eat the most hours." },
  { n: "02", t: "Rules first", d: "We write down how your best person decides, so the automation decides the same way." },
  { n: "03", t: "Build", d: "Workflows connected to the tools you already use. Fixed rules for the maths, AI only where judgment helps." },
  { n: "04", t: "Shadow test", d: "It runs in read-only mode next to your team. We compare every decision before anything goes live." },
  { n: "05", t: "Go live", d: "Switched on one step at a time, with a one-click way back to manual." },
  { n: "06", t: "Improve", d: "We watch the exceptions and keep tuning the rules every month." },
];

const PRINCIPLES = [
  { icon: ShieldCheck, t: "Rules decide, AI assists", d: "Prices, dates and amounts come from rules you can check. AI writes the messages and helps with judgment calls." },
  { icon: MessageSquare, t: "Sounds like you", d: "Every message is written in your tone and approved by you before it goes live. Customers get a human experience, not a bot." },
  { icon: Eye, t: "Read-only first", d: "Every automation starts by watching, not acting. You see its decisions before it makes any." },
  { icon: Lock, t: "Nothing goes out on a guess", d: "Unclear request? Missing detail? It's held for a person, with the reason written down." },
  { icon: Sparkles, t: "You own it", d: "Your workflows, your data, your accounts. No black box and no lock-in." },
];

const TOOLS = ["Xero", "MYOB", "ServiceM8", "Tradify", "Cliniko", "Google Workspace", "Microsoft 365", "Shopify", "HubSpot", "WhatsApp", "n8n"];

const FAQ = [
  { q: "Do I need to change the software I use?", a: "No. We connect to what you already use: your calendar, job or practice software, accounting, email and chat." },
  { q: "Will my customers know it's automated?", a: "Messages are written in your tone and approved by you. When a conversation needs a real person, it's handed over with the full history so nobody repeats themselves." },
  { q: "What if the automation gets something wrong?", a: "It is built to stop rather than guess. Anything outside the rules is held for a person, and every decision is logged." },
  { q: "How long until it runs?", a: "A first workflow usually goes from audit to shadow test in a few weeks, depending on access to your systems." },
  { q: "What does it cost?", a: "The audit is free. Each automation gets a fixed quote before we start, so there are no surprise invoices." },
  { q: "Is it only for one type of business?", a: "No. We work with trades, clinics, property, hospitality, retail and professional services. If a task follows the same steps every time, it can usually run on its own." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const reduced = useReducedMotion() === true;
  const card = "rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AnnouncementBar />
      <SiteNav onHome />

      <main>
      <MarketingHero />

      <WeekMetrics />

      <section className="border-b border-[#e5e7eb] bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 text-sm text-slate-600">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Works with</span>
          {TOOLS.map((t) => <span key={t}>{t}</span>)}
        </div>
      </section>

      <Walkthrough />

      <ServicesBento />

      <StatsSection />

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>The experience</Eyebrow>
          <Heading>Better for your customers. <Accent>Lighter</Accent> for your team.</Heading>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">Automation isn&apos;t about replacing people. It&apos;s about making sure nobody waits, nothing slips and your team spends its time on the work that matters.</p>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {[["What your customers notice", EXPERIENCE.customers], ["What your team notices", EXPERIENCE.team]].map(([title, items]) => (
              <div key={title as string} className={card + " p-7"}>
                <h3 className="mb-5 text-lg font-semibold text-slate-900">{title as string}</h3>
                <ul className="space-y-3 text-[15px] text-slate-700">
                  {(items as string[]).map((t) => <li key={t} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-emerald-700" />{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="agents" className="bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-3xl">
            <Eyebrow>Cytron agents</Eyebrow>
            <Heading>Agents working on our servers, <Accent>for your business</Accent>.</Heading>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">They&apos;re not chatbots. Cytron agents are background workers running on our own servers, around the clock. Their job is to keep every automation safe and reliable, report on each area you asked us to automate and help your business run better every month.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AGENT_ROLES.map(({ icon: Icon, t, d }, i) => (
              <motion.div key={t} initial={reduced ? false : { opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: reduced ? 0 : i * 0.06, duration: reduced ? 0 : 0.35 }}
                className={card}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-700"><Icon size={18} /></div>
                  <span className="text-xs font-semibold text-slate-600">0{i + 1}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{t}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600">{d}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow>Scheduled care</Eyebrow>
              <h3 className="text-2xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-[30px]">Every function has its own check, at its own time.</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">You choose when each area is checked. The agent runs on schedule, checks the work against fixed rules and tells you only what matters. If an agent stays quiet, everything in its area passed.</p>
              <figure className="mt-8 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Example report · 7:30 am</p>
                <blockquote className="mt-3 text-[15px] leading-relaxed text-slate-700">
                  &ldquo;This morning&apos;s check covered 42 new records. 40 passed and 2 are marked for attention: the suburb, state and postcode match the Australian postcode list, but the street couldn&apos;t be confirmed on the map. Nothing was changed. These 2 are worth a closer look first.&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-xs text-slate-600">Data check agent · sent only because 2 records need a person</figcaption>
              </figure>
            </div>
            <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-[#e5e7eb]">
              {CARE_SCHEDULE.map((c) => (
                <li key={c.area} className="relative flex gap-4">
                  <span className="relative z-10 mt-5 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f7f8fa]">
                    <span className="h-2 w-2 rounded-full bg-[#5b5cf6]" />
                  </span>
                  <div className="flex-1 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-sm font-semibold text-slate-600">{c.time}</span>
                      <span className="font-semibold text-slate-900">{c.area}</span>
                    </div>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{c.check}</p>
                    <p className="mt-2 text-[13.5px] text-slate-600"><span className="font-semibold text-slate-700">You hear: </span>{c.you}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 grid overflow-hidden rounded-xl border border-[#e5e7eb] bg-white sm:grid-cols-3">
            {[["24/7", "on duty on Cytron servers"], ["Every check", "logged and traceable"], ["One report", "per automated area, on your schedule"]].map(([k, v], i) => (
              <div key={k} className={`px-6 py-6 text-center ${i ? "border-t border-[#e5e7eb] sm:border-t-0 sm:border-l" : ""}`}>
                <p className="text-2xl font-semibold text-slate-900">{k}</p>
                <p className="mt-1 text-sm text-slate-600">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="industries" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
        <Eyebrow>Industries</Eyebrow>
        <Heading>Built for how the Gold Coast works.</Heading>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">Health, construction, retail, professional services and hospitality employ most people on the Coast, and most of these businesses have fewer than 20 staff. That&apos;s exactly who we build for.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map(({ icon: Icon, t, slug, d, tools }) => (
            <a key={t} href={`/${slug}`} className={`group block ${card} transition-colors hover:border-slate-300`}>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-700"><Icon size={18} /></div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{t}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600">{d}</p>
              <p className="mt-4 text-xs font-medium text-slate-600">{tools}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#5b5cf6]">See how it works <ChevronRight size={15} /></p>
            </a>
          ))}
        </div>
        </div>
      </section>

      <section id="case" className="bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2">
          <div>
            <Eyebrow>Case study · Australian online retailer</Eyebrow>
            <Heading>Mornings that used to start <Accent>by hand</Accent>.</Heading>
            <p className="mt-4 leading-relaxed text-slate-600">A growing Australian online store was checking every order by hand each morning before anything could ship. We automated the order checks, the shipping paperwork and a daily summary for the team. Anything unusual now goes to a person first.</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">Online orders keep climbing: 9.8 million Australian households shopped online in 2025, and spend grew 13.9% (<a href="https://www.parcelandpostaltechnologyinternational.com/news/e-commerce/australian-online-spending-reaches-a82-6bn-in-2025.html" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-800 underline underline-offset-2">Australia Post eCommerce Report</a>). Manual checks don&apos;t scale with that.</p>
          </div>
          <ul className="space-y-3 self-center text-[15px] text-slate-700">
            {CASE_POINTS.map((t) => (
              <li key={t} className="flex gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm"><Check size={18} className="mt-0.5 shrink-0 text-emerald-700" />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="week" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <Eyebrow>A week with Cytron</Eyebrow>
          <Heading>The same week, <Accent>without the admin</Accent>.</Heading>
          <WeekTimeline />
          <p className="mt-6 text-xs text-slate-600">Illustrative example. Every business gets its own rules, tone and tools.</p>
        </div>
      </section>

      <section id="how" className="bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
        <Eyebrow>How it works</Eyebrow>
        <Heading>Safe by design, live in weeks.</Heading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS_HOW.map((s) => (
            <div key={s.n} className={card}>
              <p className="mb-3 text-sm font-semibold text-slate-600">{s.n}</p>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{s.t}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>Our principles</Eyebrow>
          <Heading>Automation you can trust with real customers.</Heading>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-700"><Icon size={18} /></div>
                <div><h3 className="mb-1.5 text-lg font-semibold text-slate-900">{t}</h3><p className="text-[15px] leading-relaxed text-slate-600">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
        <Eyebrow>Getting started</Eyebrow>
        <Heading>Start small. Pay for what works.</Heading>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[
            { t: "Automation audit", p: "Free", d: "One session to map your processes and find the tasks worth automating first.", f: ["Process map", "Top 3 automation opportunities", "Rough time and cost saved"] },
            { t: "Pilot", p: "Fixed quote", d: "One workflow built and tested in read-only mode next to your team.", f: ["Rules written with your team", "Shadow test with a daily comparison", "Go-live plan"], hot: true },
            { t: "Run & improve", p: "Monthly", d: "We keep it running, watch the exceptions and add the next automations.", f: ["Monitoring and alerts", "Monthly rule tuning", "New workflows as you grow"] },
          ].map((p) => (
            <div key={p.t} className={`rounded-xl border bg-white p-7 shadow-sm ${p.hot ? "border-[#5b5cf6]" : "border-[#e5e7eb]"}`}>
              {p.hot && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5b5cf6]">Most chosen</p>}
              <h3 className="text-lg font-semibold text-slate-900">{p.t}</h3>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{p.p}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{p.d}</p>
              <ul className="mt-6 space-y-2.5 text-[15px] text-slate-700">
                {p.f.map((f) => <li key={f} className="flex gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-emerald-700" />{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-20 sm:pb-24">
        <div className="mx-auto max-w-3xl px-5">
        <Eyebrow>FAQ</Eyebrow>
        <Heading>Questions we hear a lot.</Heading>
        <div className="mt-10 divide-y divide-[#e5e7eb] rounded-xl border border-[#e5e7eb] bg-white px-6 shadow-sm">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[16px] font-semibold text-slate-900">
                {f.q}<ChevronRight size={18} className="text-slate-400 transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
        </div>
      </section>

      <section id="audit" className="bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <Eyebrow>Free automation audit</Eyebrow>
            <h2 className="max-w-xl text-[28px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[36px]"><Accent>One</Accent> call and you&apos;ll know what to automate first.</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600">Tell us which task eats your team&apos;s day, whether it&apos;s missed calls, no-shows or unpaid invoices. We&apos;ll come back with a clear plan, no obligation.</p>
          </div>
          <AuditForm />
        </div>
      </section>

      </main>

      <SiteFooter />
    </div>
  );
}
