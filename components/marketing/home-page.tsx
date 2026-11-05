"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { track } from "@vercel/analytics";
import { Calendar, CreditCard, FileText, Phone } from "lucide-react";

const FLOW = [
  { n: "1", label: "Enquiry", detail: "Call, form or message" },
  { n: "2", label: "Reply", detail: "First response, fast" },
  { n: "3", label: "Booked", detail: "Slot in your system" },
  { n: "4", label: "Reminder", detail: "Fewer no-shows" },
  { n: "5", label: "Invoice", detail: "Sent when done" },
  { n: "6", label: "Paid", detail: "Follow-up until clear" },
];

const SERVICES = [
  {
    n: "1",
    title: "Missed calls & enquiries",
    text: "After-hours and busy-hour leads get a clear reply and are logged so nothing sits unanswered.",
    icon: Phone,
  },
  {
    n: "2",
    title: "Bookings & reminders",
    text: "Confirmations go into your diary; reminders go out before the appointment so no-shows drop.",
    icon: Calendar,
  },
  {
    n: "3",
    title: "Quotes & follow-up",
    text: "Quotes leave on time; open quotes get a polite chase on a schedule you approve.",
    icon: FileText,
  },
  {
    n: "4",
    title: "Invoices & getting paid",
    text: "Invoices issue when the job closes; unpaid ones escalate on your rules until cleared.",
    icon: CreditCard,
  },
];

const STEPS = [
  {
    n: "Step 01",
    title: "Audit",
    text: "You see which tasks eat the day — a written map of enquiry to paid, plus the first workflow worth fixing.",
  },
  {
    n: "Step 02",
    title: "Rules",
    text: "We write how your best person decides: tone, timing, exceptions and when a human must step in.",
  },
  {
    n: "Step 03",
    title: "Shadow",
    text: "It runs read-only beside your team. You compare outcomes before anything touches a live customer.",
  },
  {
    n: "Step 04",
    title: "Go live",
    text: "Switched on one step at a time. You keep the kill switch; we stay on for monitoring and small fixes.",
  },
];

const TIERS = [
  {
    kicker: "Start here",
    title: "Automation audit",
    price: "Free",
    highlight: true,
    points: ["Walk-through of enquiry-to-paid", "Tasks that eat the most time", "Short written plan — no obligation"],
  },
  {
    kicker: "Build",
    title: "Pilot",
    price: "Fixed quote",
    highlight: false,
    points: ["One workflow, scoped in writing", "Shadow mode before go-live", "Handover notes for your team"],
  },
  {
    kicker: "Keep improving",
    title: "Run & improve",
    price: "Monthly",
    highlight: false,
    points: ["Monitoring and small rule changes", "New steps when you are ready", "Cancel when you no longer need it"],
  },
];

const SECTORS = [
  "Trades & construction",
  "Clinics & allied health",
  "Hospitality & short-stay",
  "Retail & online",
  "Professional services",
  "Real estate & property",
];

const BUSINESS_TYPES = [
  "Trades & construction",
  "Clinic / allied health",
  "Real estate / property",
  "Hospitality / tourism / short-stay",
  "Retail / online store",
  "Professional services",
  "Other",
];

function AuditForm() {
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    industry: "",
    responseProcess: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.businessName || !form.email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/lead-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
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

  const field =
    "w-full rounded-[10px] border border-[#E0E1E4] bg-white px-3.5 py-3 text-sm text-[#1e1b4b] outline-none transition placeholder:text-[#8b8b98] focus:border-[#312e81]";
  const label = "mb-1.5 block text-xs font-semibold text-[#4b4b5a]";

  if (status === "success") {
    return (
      <div className="py-10 text-center">
        <h3 className="text-xl font-semibold tracking-tight text-[#1e1b4b]">Request received</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#4b4b5a]">
          We&apos;ll look at your details and get back to you within one business day to book the audit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="audit-name">Your name</label>
          <input id="audit-name" className={field} autoComplete="name" value={form.name} onChange={set("name")} required />
        </div>
        <div>
          <label className={label} htmlFor="audit-business">Business name</label>
          <input id="audit-business" className={field} autoComplete="organization" value={form.businessName} onChange={set("businessName")} required />
        </div>
        <div>
          <label className={label} htmlFor="audit-email">Email</label>
          <input id="audit-email" type="email" className={field} autoComplete="email" value={form.email} onChange={set("email")} required />
        </div>
        <div>
          <label className={label} htmlFor="audit-phone">Phone</label>
          <input id="audit-phone" type="tel" className={field} autoComplete="tel" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="audit-industry">Type of business</label>
          <select id="audit-industry" className={field} value={form.industry} onChange={set("industry")}>
            <option value="">Select one</option>
            {BUSINESS_TYPES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={label} htmlFor="audit-task">Which task takes the most time?</label>
        <textarea
          id="audit-task"
          className={field + " resize-y"}
          rows={3}
          value={form.responseProcess}
          onChange={set("responseProcess")}
        />
      </div>
      {status === "error" && <p className="text-sm text-red-700">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        onClick={() => track("lead_audit_started")}
        className="inline-flex w-full items-center justify-center rounded-[9px] bg-[#312e81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e1b4b] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Book a free automation audit"}
      </button>
      <p className="text-center text-xs text-[#6b6b78]">No obligation. We reply within one business day.</p>
    </form>
  );
}

const ctaClass =
  "inline-flex items-center justify-center rounded-[9px] bg-[#312e81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e1b4b]";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#1e1b4b]">
      <header className="sticky top-0 z-40 border-b border-[#E0E1E4] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <a href="#top" className="text-[13px] font-semibold tracking-[0.16em] text-[#312e81]">
            CYTRON
          </a>
          <nav className="hidden items-center gap-7 text-sm text-[#4b4b5a] md:flex" aria-label="Primary">
            <a href="#workflows" className="hover:text-[#1e1b4b]">Workflows</a>
            <a href="#switch-on" className="hover:text-[#1e1b4b]">How we switch on</a>
            <a href="#pricing" className="hover:text-[#1e1b4b]">Pricing</a>
          </nav>
          <a href="#audit" onClick={() => track("lead_audit_started")} className="inline-flex shrink-0 items-center justify-center rounded-[9px] bg-[#312e81] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-[#1e1b4b] sm:px-4 sm:text-sm">
            Book a free automation audit
          </a>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-6xl px-5 pb-8 pt-20 sm:pb-12 sm:pt-28">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#312e81]">Cytron</p>
          <h1 className="mt-5 max-w-4xl text-[2.15rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#1e1b4b] sm:text-5xl">
            Process automation for Gold Coast small businesses — so enquiries, bookings and invoices run without chasing.
          </h1>
          <div className="mt-10 flex flex-col items-start gap-4">
            <a href="#audit" onClick={() => track("lead_audit_started")} className={ctaClass}>
              Book a free automation audit
            </a>
            <p className="text-sm text-[#4b4b5a]">
              Works with your current tools · Read-only pilot first · Local to the Gold Coast
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24" aria-labelledby="flow-heading">
          <h2 id="flow-heading" className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#312e81]">
            Enquiry → Paid
          </h2>
          <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {FLOW.map((step) => (
              <li key={step.n} className="rounded-[14px] border border-[#E0E1E4] bg-white px-3 py-5 text-center">
                <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#312e81] text-xs font-bold text-white">
                  {step.n}
                </span>
                <p className="mt-3 text-[15px] font-semibold tracking-tight">{step.label}</p>
                <p className="mt-1 text-xs leading-snug text-[#5a5a68]">{step.detail}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[#4b4b5a]">
            <span className="font-semibold text-[#1e1b4b]">Who we serve. </span>
            {SECTORS.join(" · ")}
          </p>
        </section>

        <section id="workflows" className="border-t border-[#E0E1E4] bg-white">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#312e81]">Cytron</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-[#1e1b4b] sm:text-4xl">
              Four workflows. Four steps to go live. Clear pricing.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4b4b5a]">
              Missed calls, bookings, quotes and invoices — the workflows we switch on, and the steps from a free audit to live.
            </p>

            <h3 className="mt-16 text-[11px] font-bold uppercase tracking-[0.16em] text-[#312e81]">Services</h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <li key={service.n} className="rounded-[14px] border border-[#E0E1E4] bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[#EEF0FA] px-1.5 text-xs font-bold text-[#312e81]">
                        {service.n}
                      </span>
                      <Icon size={22} strokeWidth={1.75} className="text-[#1e1b4b]" aria-hidden />
                    </div>
                    <h4 className="mt-4 text-[15px] font-semibold leading-snug tracking-tight">{service.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#5a5a68]">{service.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section id="switch-on" className="border-t border-[#E0E1E4]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#312e81]">How we switch on</h2>
            <p className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-[#1e1b4b]">
              Audit → Rules → Shadow → Go live
            </p>
            <ol className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className={`rounded-[14px] border p-5 ${index === 0 ? "border-[#312e81] bg-[#EEF0FA]" : "border-transparent bg-[#F4F5F9]"}`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#312e81]">{step.n}</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5a5a68]">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="border-t border-[#E0E1E4]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#312e81]">Pricing</h2>
            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              {TIERS.map((tier) => (
                <article
                  key={tier.title}
                  className={`rounded-[14px] p-6 ${tier.highlight ? "border-2 border-[#312e81] bg-[#EEF0FA]" : "border border-[#E0E1E4] bg-white"}`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#312e81]">{tier.kicker}</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">{tier.title}</h3>
                  <p className="mt-1 text-sm font-semibold">{tier.price}</p>
                  <ul className="mt-4 space-y-1.5">
                    {tier.points.map((point) => (
                      <li key={point} className="flex gap-2 text-sm leading-relaxed text-[#5a5a68]">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#312e81]" aria-hidden />
                        {point}
                      </li>
                    ))}
                  </ul>
                  {tier.highlight && (
                    <a href="#audit" onClick={() => track("lead_audit_started")} className={ctaClass + " mt-6"}>
                      Book a free automation audit
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="audit" className="border-t border-[#E0E1E4] bg-[#F4F5F9]">
          <div className="mx-auto max-w-xl px-5 py-20 sm:py-28">
            <h2 className="text-2xl font-semibold tracking-tight text-[#1e1b4b]">Book a free automation audit</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4b4b5a]">
              A walk-through of enquiry to paid. No obligation, and a short written plan.
            </p>
            <div className="mt-8 rounded-[14px] border border-[#E0E1E4] bg-white p-5 sm:p-7">
              <AuditForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E0E1E4] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-[#4b4b5a] sm:flex-row sm:items-center sm:justify-between">
          <p>Cytron · Process automation · Gold Coast</p>
          <nav className="flex gap-5" aria-label="Footer">
            <a href="/privacy" className="hover:text-[#1e1b4b]">Privacy</a>
            <a href="/terms" className="hover:text-[#1e1b4b]">Terms</a>
            <a href="/login" className="hover:text-[#1e1b4b]">Client login</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
