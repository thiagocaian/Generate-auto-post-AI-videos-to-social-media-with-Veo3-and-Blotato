"use client";

import React, { useEffect, useState } from "react";
import { Outfit } from "next/font/google";
import { track } from "@vercel/analytics";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileText,
  MapPin,
  MessageSquare,
  Package,
  Printer,
  ShieldCheck,
  Sparkles,
  Truck,
  BarChart3,
  Eye,
  Lock,
} from "lucide-react";
import LedTunnel from "@/components/LedTunnel";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

const ACCENT = "#5b5cf6";

// ─── Logo ─────────────────────────────────────────────────────────────────────
function CytronLogo({ size = 30 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-lg shadow-[0_0_18px_rgba(91,92,246,0.45)]" style={{ width: size, height: size, background: ACCENT }}>
      <span className="font-bold text-white" style={{ fontSize: size * 0.48 }}>C</span>
    </div>
  );
}

const cta = (label: string, href = "#audit", event = "lead_audit_started") => (
  <a
    href={href}
    onClick={() => track(event)}
    className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(91,92,246,0.7)] transition-transform hover:-translate-y-0.5"
    style={{ background: ACCENT }}
  >
    {label}
    <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
  </a>
);

// ─── Live workflow card (hero) ────────────────────────────────────────────────
const STEPS = [
  { icon: Package, label: "New order #1042 received", detail: "3 items · Express" },
  { icon: ClipboardCheck, label: "Address and items checked", detail: "Postcode matches state" },
  { icon: Package, label: "Box chosen", detail: "B-SML · 18 × 13 × 5 cm" },
  { icon: Truck, label: "Cheapest carrier picked", detail: "Express Post · $13.20" },
  { icon: Printer, label: "Label and packing slip printed", detail: "Warehouse printer · 8:10 am" },
];

function WorkflowCard() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (STEPS.length + 2)), 1300);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative w-full max-w-md rounded-3xl border border-white bg-white/80 p-5 shadow-[0_30px_80px_-30px_rgba(40,60,120,0.35),0_0_0_1px_rgba(91,92,246,0.06)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: ACCENT }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: ACCENT }} />
          </span>
          Dispatch automation · live
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">no one touched this</span>
      </div>
      <ul className="space-y-2.5">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          const Icon = s.icon;
          return (
            <li key={s.label} className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all duration-500 ${done ? "border-slate-100 bg-white" : active ? "border-[#5b5cf6]/30 bg-[#5b5cf6]/[0.06]" : "border-transparent bg-slate-50/60 opacity-50"}`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${done ? "bg-emerald-50 text-emerald-600" : active ? "text-white" : "bg-slate-100 text-slate-400"}`} style={active ? { background: ACCENT } : undefined}>
                {done ? <Check size={17} /> : <Icon size={17} />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-slate-800">{s.label}</p>
                <p className="truncate text-[12px] text-slate-500">{s.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <AnimatePresence>
        {step >= STEPS.length && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 rounded-2xl bg-emerald-50 px-4 py-2.5 text-[12.5px] font-medium text-emerald-700">
            Order ready to pack in 9 seconds. Anything unusual goes to a person first.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: Truck, title: "Orders & fulfilment", text: "Pending orders checked, box and cheapest carrier chosen, labels and packing slips printed before the team arrives." },
  { icon: MapPin, title: "Address & data checks", text: "Wrong postcodes, missing unit numbers and duplicate records caught before they cost you a re-delivery." },
  { icon: FileText, title: "Quotes, invoices & paperwork", text: "Documents generated from your own data, sent to the right person, filed where you can find them." },
  { icon: MessageSquare, title: "AI assistant for your team", text: "Ask in Telegram or chat: “what's held today and why?”. The assistant answers from your systems, not from guesses." },
  { icon: BarChart3, title: "Daily reports", text: "A short summary every morning: what shipped, what's stuck, what it cost. No spreadsheet hunting." },
  { icon: Printer, title: "Printing & warehouse devices", text: "Your office and label printers receive jobs automatically, with a queue if a printer is offline." },
];

const STEPS_HOW = [
  { n: "01", t: "Free audit", d: "We sit with your team and map the tasks that eat the most hours." },
  { n: "02", t: "Rules first", d: "We write down how your best person decides, so the automation decides the same way." },
  { n: "03", t: "Build", d: "Workflows connected to the tools you already use. Fixed rules for the maths, AI only where judgment helps." },
  { n: "04", t: "Shadow test", d: "It runs in read-only mode next to your team. We compare every decision before anything goes live." },
  { n: "05", t: "Go live", d: "Switched on one step at a time, with a one-click way back to manual." },
  { n: "06", t: "Improve", d: "We watch the exceptions and keep tuning the rules every month." },
];

const PRINCIPLES = [
  { icon: ShieldCheck, t: "Rules decide, AI assists", d: "Prices, weights and boxes come from fixed rules you can audit. AI handles text and judgment calls." },
  { icon: Eye, t: "Read-only first", d: "Every automation starts by watching, not acting. You see its decisions before it makes any." },
  { icon: Lock, t: "Nothing goes out on a guess", d: "Unclear address? Missing weight? The job is held for a person, with the reason written down." },
  { icon: Sparkles, t: "You own it", d: "Your workflows, your data, your accounts. No black box and no lock-in." },
];

const CASE = [
  { k: "100 orders", v: "checked, boxed and quoted in under 3 minutes" },
  { k: "47%", v: "lower freight in a test batch, by always picking the cheapest carrier that fits" },
  { k: "8:10 am", v: "labels and packing slips waiting at the printer" },
  { k: "0", v: "orders shipped with an unclear address: they go to review" },
];

const TOOLS = ["n8n", "Starshipit", "WooCommerce", "Shopify", "Australia Post", "Aramex", "Telegram", "Google Sheets", "Gemini", "Grok"];

const FAQ = [
  { q: "Do I need to change the software I use?", a: "No. We connect to the tools you already have, like your online store, shipping platform, spreadsheets and chat." },
  { q: "What if the automation gets something wrong?", a: "It is built to stop rather than guess. Anything outside the rules is held for a person, and every decision is logged." },
  { q: "How long until it runs?", a: "A first workflow usually goes from audit to shadow test in a few weeks, depending on access to your systems." },
  { q: "Is it only for e-commerce?", a: "No. Fulfilment is our showcase, but the same approach works for quotes, bookings, invoicing, reporting and admin in any small business." },
];

// ─── Audit form ───────────────────────────────────────────────────────────────
const BUSINESS_TYPES = ["E-commerce / online store", "Trades & services", "Clinic / health", "Professional services", "Wholesale / distribution", "Other"];

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
        <textarea className={input + " resize-none"} rows={3} placeholder="e.g. we print and check 200 orders by hand every morning, and pick the courier manually..." value={form.responseProcess} onChange={set("responseProcess")} />
      </div>
      {status === "error" && <p className="text-xs text-red-500">{errorMsg}</p>}
      <button type="submit" disabled={status === "loading"} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(91,92,246,0.7)] transition disabled:opacity-60" style={{ background: ACCENT }}>
        {status === "loading" ? "Sending..." : <>Book my free audit <ArrowRight size={17} /></>}
      </button>
      <p className="text-center text-xs text-slate-400">No obligation. We reply within one business day.</p>
    </form>
  );
}

// ─── Section helpers ──────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>{children}</p>;
}
function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[42px]">{children}</h2>;
}
function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative whitespace-nowrap" style={{ color: ACCENT }}>
      {children}
      <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full" style={{ background: ACCENT }} />
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className={`${outfit.className} min-h-screen bg-[#f4f7fb] text-slate-900`}>
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 shadow-[0_8px_30px_-12px_rgba(30,50,100,0.2)] backdrop-blur-xl sm:px-5">
          <a href="#" className="flex items-center gap-2.5"><CytronLogo /><span className="text-[15px] font-bold tracking-wide">CYTRON</span></a>
          <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex">
            {[["What we automate", "#services"], ["How it works", "#how"], ["Case study", "#case"], ["FAQ", "#faq"]].map(([l, h]) => (
              <a key={h} href={h} className="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900">{l}</a>
            ))}
          </nav>
          <a href="#audit" onClick={() => track("lead_audit_started")} className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: ACCENT }}>Free audit</a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
        <LedTunnel />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-slate-600 shadow-sm backdrop-blur">
              <Sparkles size={14} style={{ color: ACCENT }} /> AI process automation for small businesses
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[44px] font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-[68px]">
              <Accent>Automate</Accent> the busywork.<br />Keep the judgment.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Cytron builds automations that do the repetitive work in your business: checking orders, choosing couriers, printing labels, chasing paperwork. Your team only steps in when something actually needs a person.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-9 flex flex-wrap items-center gap-3">
              {cta("Book a free automation audit")}
              <a href="#case" className="inline-flex items-center gap-2 rounded-2xl border border-white bg-white/70 px-6 py-3.5 text-[15px] font-semibold text-slate-700 backdrop-blur transition hover:bg-white">See a real example</a>
            </motion.div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
              {["Works with your current tools", "Read-only pilot first", "Based in Australia"].map((t) => (
                <span key={t} className="flex items-center gap-2"><Check size={15} className="text-emerald-500" />{t}</span>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex justify-center lg:justify-end">
            <WorkflowCard />
          </motion.div>
        </div>
      </section>

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
            <div key={title} className="group rounded-3xl border border-white bg-white/80 p-6 shadow-[0_20px_50px_-30px_rgba(40,60,120,0.35)] transition hover:-translate-y-1 hover:shadow-[0_25px_60px_-25px_rgba(91,92,246,0.35)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_0_20px_rgba(91,92,246,0.45)]" style={{ background: ACCENT }}><Icon size={20} /></div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Case study */}
      <section id="case" className="relative isolate overflow-hidden py-24">
        <LedTunnel className="opacity-70" />
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="rounded-[32px] border border-white bg-white/75 p-8 shadow-[0_40px_100px_-40px_rgba(40,60,120,0.45)] backdrop-blur-xl sm:p-12">
            <Eyebrow>Case study · online retailer, Gold Coast</Eyebrow>
            <Heading>From 200 orders by hand to <Accent>labels at 8:10</Accent>.</Heading>
            <p className="mt-4 max-w-3xl text-slate-600">
              An Australian oral-care retailer printed every packing slip by hand, highlighted the details with a marker and picked a box and courier from a chart on the wall. We built a dispatch automation on top of their store and shipping platform:
            </p>
            <div className="mt-8 grid gap-3 text-[15px] text-slate-700 sm:grid-cols-2">
              {["Reads every pending order and checks the address, postcode, items and shipping method", "Picks the box from the warehouse packaging table and the real product weights", "Quotes every courier and takes the cheapest one that fits the shipping method", "Prints labels and packing slips on the warehouse printers before the shift starts", "Holds anything unclear for a person, with the reason written down", "Answers the team in Telegram: “what's held today?”"].map((t) => (
                <div key={t} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />{t}</div>
              ))}
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CASE.map((c) => (
                <div key={c.k} className="rounded-2xl border border-slate-100 bg-white p-5">
                  <p className="text-3xl font-semibold tracking-tight" style={{ color: ACCENT }}>{c.k}</p>
                  <p className="mt-1.5 text-sm text-slate-600">{c.v}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-slate-400">Figures from pilot tests on a test account and reference courier prices, before go-live.</p>
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
              <p className="mb-4 text-sm font-semibold" style={{ color: ACCENT }}>{s.n}</p>
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
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
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
            <p className="mt-5 max-w-md text-lg text-slate-600">Tell us which task eats your team&apos;s day. We&apos;ll come back with a clear plan, no obligation.</p>
          </div>
          <div className="rounded-[28px] border border-white bg-white/85 p-7 shadow-[0_40px_100px_-40px_rgba(40,60,120,0.45)] backdrop-blur-xl sm:p-9">
            <AuditForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2.5"><CytronLogo size={24} /><span className="font-semibold text-slate-700">CYTRON</span><span>· AI process automation · Gold Coast, Australia</span></div>
          <div className="flex gap-5"><a href="/privacy" className="hover:text-slate-800">Privacy</a><a href="/terms" className="hover:text-slate-800">Terms</a><a href="/login" className="hover:text-slate-800">Client login</a></div>
        </div>
      </footer>
    </div>
  );
}
