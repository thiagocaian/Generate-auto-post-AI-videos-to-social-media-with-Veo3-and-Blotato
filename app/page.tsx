"use client";

import React, { useState } from "react";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarCheck,
  Check,
  ChevronRight,
  FileText,
  MessageSquare,
  PhoneCall,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
  BarChart3,
  Eye,
  Lock,
} from "lucide-react";
import HomeHero from "@/components/HomeHero";
import LedTunnel from "@/components/LedTunnel";
import { Accent, ACCENT, Eyebrow, GRADIENT, Heading, LILAC, outfit, SiteFooter, SiteNav } from "@/components/site";

// ─── Content ──────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: PhoneCall, title: "Missed calls & new enquiries", text: "Every call, web form and message gets an instant reply, the details captured and a booking link sent. No lead goes cold overnight." },
  { icon: CalendarCheck, title: "Bookings, reminders & no-shows", text: "Confirmations, reminders and easy rescheduling by SMS or email, plus a waitlist that fills the gaps left by cancellations." },
  { icon: FileText, title: "Quotes & follow-up", text: "Quotes drafted from the job details, sent the same day and followed up politely when the customer goes quiet." },
  { icon: Receipt, title: "Invoices & getting paid", text: "Invoices raised the moment the job is done, synced to Xero or MYOB, with friendly reminders until they're paid." },
  { icon: Star, title: "Reviews & repeat customers", text: "A review request after a good job, and a check-in when it's time to book again. Unhappy replies go to you, not online." },
  { icon: BarChart3, title: "Reports & AI assistant", text: "A short summary every morning, and an assistant your team can ask: “who still owes us money?”. Answers come from your systems, not guesses." },
];

const STATS = [
  { k: "72%", v: "of Australians expect a reply from a small business within an hour. 22% expect it instantly.", link: "Missed calls & enquiries", src: "Zoho, 2024", url: "https://itbrief.com.au/story/zoho-study-reveals-rising-customer-service-expectations-in-australia" },
  { k: "$15,257", v: "a year is what late payments cost the average Australian small business.", link: "Invoices & getting paid", src: "Xero Small Business Insights, Dec 2025 qtr", url: "https://www.xero.com/au/guides/late-payment-small-business-australia/" },
  { k: "97%", v: "of Gold Coast businesses have fewer than 20 staff. Most have no admin team to absorb the busywork.", link: "Reports & AI assistant", src: "NEMA Gold Coast LGA profile, 2025", url: "https://www.nema.gov.au/sites/default/files/LGAProfiles/Gold%20Coast%20-%20LGA%20profile.docx" },
  { k: "64%", v: "of Australian small businesses already use AI regularly, up from 39% a year earlier.", link: "Your competitors are moving", src: "QuickBooks Small Business Insights, Apr 2025", url: "https://quickbooks.intuit.com/au/blog/news/small-business-insights-survey-april-2025" },
];

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

const WEEK = [
  { day: "Mon 7:00 am", t: "The owner gets a short summary: six enquiries over the weekend, four already booked, two quotes waiting for a price." },
  { day: "Tue 6:42 pm", t: "A customer calls while the team is on a job. They get a text in under a minute and book themselves in." },
  { day: "Wed", t: "A quote sent on Monday hasn't been opened. A friendly follow-up goes out, and the customer accepts it." },
  { day: "Thu", t: "Job done. The invoice is in the customer's inbox before the van leaves, and it's already in Xero." },
  { day: "Fri", t: "Happy customers get a review request. One unhappy reply goes straight to the owner to sort out personally." },
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

// ─── Audit form ───────────────────────────────────────────────────────────────
const BUSINESS_TYPES = ["Trades & construction", "Clinic / allied health", "Real estate / property", "Hospitality / tourism / short-stay", "Retail / online store", "Professional services", "Other"];

function AuditForm() {
  const [form, setForm] = useState({ name: "", businessName: "", email: "", phone: "", industry: "", responseProcess: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.businessName || !form.email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/lead-audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        track("lead_audit_submitted", { industry: form.industry });
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  const input = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5b5cf6] focus:ring-4 focus:ring-[#5b5cf6]/10";
  const label = "mb-1.5 block text-xs font-semibold text-slate-600";

  if (status === "success") {
    return (
      <div className="py-14 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={26} /></div>
        <h3 className="mb-2 text-2xl font-semibold text-slate-900">Request received</h3>
        <p className="mx-auto max-w-sm text-sm text-slate-500">We&apos;ll look at your details and get back to you within one business day to book the audit.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div><label className={label}>Your name *</label><input className={input} placeholder="Jane Smith" value={form.name} onChange={set("name")} required /></div>
        <div><label className={label}>Business name *</label><input className={input} placeholder="Acme Pty Ltd" value={form.businessName} onChange={set("businessName")} required /></div>
        <div><label className={label}>Email *</label><input type="email" className={input} placeholder="jane@acme.com.au" value={form.email} onChange={set("email")} required /></div>
        <div><label className={label}>Phone</label><input type="tel" className={input} placeholder="0400 000 000" value={form.phone} onChange={set("phone")} /></div>
        <div className="sm:col-span-2">
          <label className={label}>Type of business</label>
          <select className={input + " appearance-none"} value={form.industry} onChange={set("industry")}>
            <option value="">Select one</option>
            {BUSINESS_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={label}>Which task takes your team the most time?</label>
        <textarea className={input + " resize-none"} rows={3} placeholder="e.g. we miss calls while we're on jobs, and chasing unpaid invoices takes every Friday afternoon..." value={form.responseProcess} onChange={set("responseProcess")} />
      </div>
      {status === "error" && <p className="text-xs text-red-500">{errorMsg}</p>}
      <button type="submit" disabled={status === "loading"} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(91,92,246,0.7)] transition disabled:opacity-60" style={{ background: GRADIENT }}>
        {status === "loading" ? "Sending..." : <>Book my free audit <ArrowRight size={17} /></>}
      </button>
      <p className="text-center text-xs text-slate-400">No obligation. We reply within one business day.</p>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className={`${outfit.className} min-h-screen bg-[#f4f7fb] text-slate-900`}>
      <SiteNav onHome />

      <HomeHero />

      {/* Tools */}
      <section className="border-y border-white bg-white/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 text-[15px] font-medium text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Works with</span>
          {TOOLS.map((t) => <span key={t}>{t}</span>)}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-5 py-24">
        <Eyebrow>What we automate</Eyebrow>
        <Heading>The work nobody hired you to do.</Heading>
        <p className="mt-4 max-w-2xl text-slate-600">If a task follows the same steps every day, it can usually run on its own. These are the ones we build most.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="group rounded-3xl border border-white bg-white/80 p-6 shadow-[0_20px_50px_-30px_rgba(40,60,120,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#5b5cf6]/20 hover:shadow-[0_25px_60px_-25px_rgba(91,92,246,0.45)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_0_20px_rgba(91,92,246,0.45)] transition group-hover:scale-105" style={{ background: GRADIENT }}><Icon size={20} /></div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* By the numbers */}
      <section id="numbers" className="mx-auto max-w-6xl px-5 pb-24">
        <Eyebrow>Why it matters</Eyebrow>
        <Heading>Small teams, <Accent>big expectations</Accent>.</Heading>
        <p className="mt-4 max-w-2xl text-slate-600">Customers expect fast replies and easy payments. Most local businesses don&apos;t have the staff to keep up by hand. That gap is where automation pays for itself.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.k} className="flex flex-col rounded-3xl border border-white bg-white/80 p-6 shadow-[0_20px_50px_-30px_rgba(40,60,120,0.35)]">
              <p className="bg-clip-text text-4xl font-semibold tracking-tight text-transparent" style={{ backgroundImage: GRADIENT }}>{s.k}</p>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-600">{s.v}</p>
              <p className="mt-5 text-xs font-semibold text-slate-800">→ {s.link}</p>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs text-slate-400 underline-offset-2 hover:underline">Source: {s.src}</a>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">On the Coast, health care employment grew 18.5% and construction 12.9% in the year to August 2025 (<a href="https://www.jobsandskills.gov.au/sites/default/files/2025-10/Industry%20Profile%20Gold%20Coast.pdf" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Jobs and Skills Australia</a>). More clients, same front desk.</p>
      </section>

      {/* Experience */}
      <section className="bg-white/70 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>The experience</Eyebrow>
          <Heading>Better for your customers. <Accent>Lighter</Accent> for your team.</Heading>
          <p className="mt-4 max-w-2xl text-slate-600">Automation isn&apos;t about replacing people. It&apos;s about making sure nobody waits, nothing slips and your team spends its time on the work that matters.</p>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {[["What your customers notice", EXPERIENCE.customers], ["What your team notices", EXPERIENCE.team]].map(([title, items]) => (
              <div key={title as string} className="rounded-3xl border border-white bg-white/80 p-7 shadow-[0_20px_50px_-30px_rgba(40,60,120,0.35)]">
                <h3 className="mb-5 text-lg font-semibold text-slate-900">{title as string}</h3>
                <ul className="space-y-3 text-[15px] text-slate-700">
                  {(items as string[]).map((t) => <li key={t} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="relative isolate overflow-hidden bg-[#050507] py-28 text-white">
        <LedTunnel dark className="bottom-auto h-[820px] opacity-60 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]" />
        <div className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_top,rgba(91,92,246,0.28),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/80 via-[#050507]/30 to-[#050507]/85" />
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="max-w-3xl">
            <Eyebrow dark>Cytron agents</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-[46px]">Agents working on our servers, <Accent>for your business</Accent>.</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/65">They&apos;re not chatbots. Cytron agents are background workers running on our own servers, around the clock. Their job is to keep every automation safe and reliable, report on each area you asked us to automate and help your business run better every month.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AGENT_ROLES.map(({ icon: Icon, t, d }, i) => (
              <motion.div key={t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:border-[#8b8cff]/40 hover:bg-white/[0.07]">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_0_24px_rgba(124,125,255,0.55)]" style={{ background: GRADIENT }}><Icon size={20} /></div>
                  <span className="text-xs font-semibold text-white/30">0{i + 1}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{t}</h3>
                <p className="text-[15px] leading-relaxed text-white/60">{d}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow dark>Scheduled care</Eyebrow>
              <h3 className="text-2xl font-semibold leading-tight tracking-tight sm:text-[34px]">Every function has its own check, at its own time.</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-white/60">You choose when each area is checked. The agent runs on schedule, checks the work against fixed rules and tells you only what matters. If an agent stays quiet, everything in its area passed.</p>
              <figure className="mt-8 rounded-3xl border border-white/10 bg-[#0b0b12]/85 p-6 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: LILAC }}>Example report · 7:30 am</p>
                <blockquote className="mt-3 text-[15px] leading-relaxed text-white/80">
                  &ldquo;This morning&apos;s check covered 42 new records. 40 passed and 2 are marked for attention: the suburb, state and postcode match the Australian postcode list, but the street couldn&apos;t be confirmed on the map. Nothing was changed. These 2 are worth a closer look first.&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-xs text-white/40">Data check agent · sent only because 2 records need a person</figcaption>
              </figure>
            </div>
            <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-white/10">
              {CARE_SCHEDULE.map((c) => (
                <li key={c.area} className="relative flex gap-4">
                  <span className="relative z-10 mt-5 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#050507]">
                    <span className="h-2 w-2 rounded-full shadow-[0_0_10px_rgba(139,140,255,0.9)]" style={{ background: LILAC }} />
                  </span>
                  <div className="flex-1 rounded-2xl border border-white/10 bg-[#0b0b12]/85 p-5 backdrop-blur transition hover:border-[#8b8cff]/35 hover:bg-white/[0.06]">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-sm font-semibold" style={{ color: LILAC }}>{c.time}</span>
                      <span className="font-semibold">{c.area}</span>
                    </div>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-white/65">{c.check}</p>
                    <p className="mt-2 text-[13.5px] text-white/45"><span className="font-semibold text-white/70">You hear: </span>{c.you}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-3">
            {[["24/7", "on duty on Cytron servers"], ["Every check", "logged and traceable"], ["One report", "per automated area, on your schedule"]].map(([k, v]) => (
              <div key={k} className="bg-[#08080d]/90 px-6 py-6 text-center">
                <p className="text-2xl font-semibold" style={{ color: LILAC }}>{k}</p>
                <p className="mt-1 text-sm text-white/55">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="mx-auto max-w-6xl px-5 py-24">
        <Eyebrow>Industries</Eyebrow>
        <Heading>Built for how the Gold Coast works.</Heading>
        <p className="mt-4 max-w-2xl text-slate-600">Health, construction, retail, professional services and hospitality employ most people on the Coast, and most of these businesses have fewer than 20 staff. That&apos;s exactly who we build for.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map(({ icon: Icon, t, slug, d, tools }) => (
            <a key={t} href={`/${slug}`} className="group block rounded-3xl border border-white bg-white/80 p-6 shadow-[0_20px_50px_-30px_rgba(40,60,120,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#5b5cf6]/20 hover:shadow-[0_25px_60px_-25px_rgba(91,92,246,0.45)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5b5cf6]/10 transition group-hover:scale-105" style={{ color: ACCENT }}><Icon size={20} /></div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{t}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600">{d}</p>
              <p className="mt-4 text-xs font-medium text-slate-400">{tools}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: ACCENT }}>See how it works <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" /></p>
            </a>
          ))}
        </div>
      </section>

      {/* Case study */}
      <section id="case" className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-10 rounded-[32px] border border-white bg-white/80 p-8 shadow-[0_40px_100px_-40px_rgba(40,60,120,0.35)] sm:p-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>Case study · Australian online retailer</Eyebrow>
            <Heading>Mornings that used to start <Accent>by hand</Accent>.</Heading>
            <p className="mt-4 text-slate-600">A growing Australian online store was checking every order by hand each morning before anything could ship. We automated the order checks, the shipping paperwork and a daily summary for the team. Anything unusual now goes to a person first.</p>
            <p className="mt-4 text-sm text-slate-500">Online orders keep climbing: 9.8 million Australian households shopped online in 2025, and spend grew 13.9% (<a href="https://www.parcelandpostaltechnologyinternational.com/news/e-commerce/australian-online-spending-reaches-a82-6bn-in-2025.html" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Australia Post eCommerce Report</a>). Manual checks don&apos;t scale with that.</p>
          </div>
          <ul className="space-y-3 self-center text-[15px] text-slate-700">
            {CASE_POINTS.map((t) => (
              <li key={t} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4"><Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* A week with Cytron */}
      <section id="week" className="relative isolate overflow-hidden py-24">
        <LedTunnel className="opacity-70" />
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="rounded-[32px] border border-white bg-white/75 p-8 shadow-[0_40px_100px_-40px_rgba(40,60,120,0.45)] backdrop-blur-xl sm:p-12">
            <Eyebrow>A week with Cytron · local plumbing business</Eyebrow>
            <Heading>The same week, <Accent>without the admin</Accent>.</Heading>
            <div className="mt-10 space-y-4">
              {WEEK.map((w) => (
                <div key={w.day} className="grid gap-2 rounded-2xl border border-slate-100 bg-white p-5 sm:grid-cols-[140px_1fr] sm:gap-6">
                  <p className="text-sm font-semibold" style={{ color: ACCENT }}>{w.day}</p>
                  <p className="text-[15px] text-slate-700">{w.t}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-slate-400">Illustrative example. Every business gets its own rules, tone and tools.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-24">
        <Eyebrow>How it works</Eyebrow>
        <Heading>Safe by design, live in weeks.</Heading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS_HOW.map((s) => (
            <div key={s.n} className="rounded-3xl border border-white bg-white/80 p-6 shadow-[0_20px_50px_-30px_rgba(40,60,120,0.3)]">
              <p className="mb-4 bg-clip-text text-3xl font-semibold text-transparent" style={{ backgroundImage: GRADIENT }}>{s.n}</p>
              <h3 className="mb-2 text-lg font-semibold">{s.t}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="bg-white/70 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>Our principles</Eyebrow>
          <Heading>Automation you can trust with real customers.</Heading>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5b5cf6]/10" style={{ color: ACCENT }}><Icon size={20} /></div>
                <div><h3 className="mb-1.5 text-lg font-semibold">{t}</h3><p className="text-[15px] leading-relaxed text-slate-600">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-24">
        <Eyebrow>Getting started</Eyebrow>
        <Heading>Start small. Pay for what works.</Heading>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[
            { t: "Automation audit", p: "Free", d: "One session to map your processes and find the tasks worth automating first.", f: ["Process map", "Top 3 automation opportunities", "Rough time and cost saved"] },
            { t: "Pilot", p: "Fixed quote", d: "One workflow built and tested in read-only mode next to your team.", f: ["Rules written with your team", "Shadow test with a daily comparison", "Go-live plan"], hot: true },
            { t: "Run & improve", p: "Monthly", d: "We keep it running, watch the exceptions and add the next automations.", f: ["Monitoring and alerts", "Monthly rule tuning", "New workflows as you grow"] },
          ].map((p) => (
            <div key={p.t} className={`rounded-3xl border p-7 ${p.hot ? "border-[#5b5cf6]/30 bg-white shadow-[0_30px_80px_-30px_rgba(91,92,246,0.5)]" : "border-white bg-white/80 shadow-[0_20px_50px_-30px_rgba(40,60,120,0.3)]"}`}>
              {p.hot && <span className="mb-4 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white" style={{ background: ACCENT }}>Most chosen</span>}
              <h3 className="text-lg font-semibold">{p.t}</h3>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{p.p}</p>
              <p className="mt-3 text-[15px] text-slate-600">{p.d}</p>
              <ul className="mt-6 space-y-2.5 text-[15px] text-slate-700">
                {p.f.map((f) => <li key={f} className="flex gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-emerald-500" />{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 pb-24">
        <Eyebrow>FAQ</Eyebrow>
        <Heading>Questions we hear a lot.</Heading>
        <div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-white bg-white/80 px-6">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[16px] font-semibold text-slate-900">
                {f.q}<ChevronRight size={18} className="text-slate-400 transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Audit form */}
      <section id="audit" className="relative isolate overflow-hidden py-24">
        <LedTunnel />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <Eyebrow>Free automation audit</Eyebrow>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-[52px]"><Accent>One</Accent> call and you&apos;ll know what to automate first.</h2>
            <p className="mt-5 max-w-md text-lg text-slate-600">Tell us which task eats your team&apos;s day, whether it&apos;s missed calls, no-shows or unpaid invoices. We&apos;ll come back with a clear plan, no obligation.</p>
          </div>
          <div className="rounded-[28px] border border-white bg-white/85 p-7 shadow-[0_40px_100px_-40px_rgba(40,60,120,0.45)] backdrop-blur-xl sm:p-9">
            <AuditForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
