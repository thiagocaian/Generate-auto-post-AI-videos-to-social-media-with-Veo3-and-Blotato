"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { track } from "@vercel/analytics";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const BUSINESS_TYPES = ["Trades & construction", "Clinic / allied health", "Real estate / property", "Hospitality / tourism / short-stay", "Retail / online store", "Professional services", "Other"];
const AUDIT_TIMES = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"];

type DayChip = { iso: string; label: string; sub: string };

function weekdayChips(limit = 10): DayChip[] {
  const out: DayChip[] = [];
  const now = new Date();
  for (let i = 0; out.length < limit && i < 21; i++) {
    const probe = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const parts = new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Brisbane",
      weekday: "short",
      day: "numeric",
      month: "short",
    }).formatToParts(probe);
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    const weekday = get("weekday");
    if (weekday === "Sat" || weekday === "Sun") continue;
    const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane", year: "numeric", month: "2-digit", day: "2-digit" }).format(probe);
    out.push({ iso, label: weekday, sub: `${get("day")} ${get("month")}` });
  }
  return out;
}

const inputClass = "w-full rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-[#5b5cf6] focus:ring-2 focus:ring-[#5b5cf6]/15";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-700";

export default function AuditForm({ preview = false }: { preview?: boolean }) {
  const reduced = useReducedMotion() === true;
  const [days, setDays] = useState<DayChip[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    industry: "",
    responseProcess: "",
    preferredDate: "",
    preferredTime: "",
  });
  const [error, setError] = useState("");
  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  useEffect(() => {
    setDays(weekdayChips(10));
    // Email typed in the home hero arrives as ?email=
    const fromHero = new URLSearchParams(window.location.search).get("email");
    if (fromHero) setForm((prev) => (prev.email ? prev : { ...prev, email: fromHero.slice(0, 200) }));
  }, []);

  const goTimes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.businessName || !form.email) {
      setError("Please fill in your name, business name and email.");
      return;
    }
    setError("");
    setStep(2);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.preferredDate || !form.preferredTime) {
      setError("Please pick a weekday and a time.");
      return;
    }
    setError("");
    if (preview) {
      setStep(3);
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/lead-audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        track("lead_audit_submitted", { industry: form.industry });
        setStatus("success");
        setStep(3);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  const trans = reduced ? { duration: 0 } : { duration: 0.28, ease: "easeOut" as const };

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form key="step1" onSubmit={goTimes} initial={reduced ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: -10 }} transition={trans} className="space-y-5" noValidate>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Step 1 of 2 · About you</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="audit-name">Your name *</label>
                <input id="audit-name" name="name" autoComplete="name" className={inputClass} placeholder="Jane Smith" value={form.name} onChange={set("name")} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="audit-business">Business name *</label>
                <input id="audit-business" name="organization" autoComplete="organization" className={inputClass} placeholder="Acme Pty Ltd" value={form.businessName} onChange={set("businessName")} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="audit-email">Email *</label>
                <input id="audit-email" name="email" type="email" autoComplete="email" className={inputClass} placeholder="jane@acme.com.au" value={form.email} onChange={set("email")} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="audit-phone">Phone</label>
                <input id="audit-phone" name="tel" type="tel" autoComplete="tel" className={inputClass} placeholder="0400 000 000" value={form.phone} onChange={set("phone")} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="audit-industry">Type of business</label>
                <select id="audit-industry" name="industry" className={inputClass + " appearance-none"} value={form.industry} onChange={set("industry")}>
                  <option value="">Select one</option>
                  {BUSINESS_TYPES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="audit-task">Which task takes your team the most time?</label>
              <textarea id="audit-task" name="responseProcess" className={inputClass + " resize-none"} rows={3} placeholder="e.g. we miss calls while we're on jobs, and chasing unpaid invoices takes every Friday afternoon..." value={form.responseProcess} onChange={set("responseProcess")} />
            </div>
            {error && <p role="alert" aria-live="polite" className="text-sm font-medium text-red-700">{error}</p>}
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5b5cf6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]">
              Next: pick a time <ArrowRight size={17} />
            </button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form key="step2" onSubmit={submit} initial={reduced ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: -10 }} transition={trans} className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Step 2 of 2 · Weekdays only · times in AEST</p>
            <fieldset>
              <legend className={labelClass}>Preferred date *</legend>
              <div className="grid grid-cols-5 gap-2">
                {days.map((d) => {
                  const on = form.preferredDate === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, preferredDate: d.iso }))}
                      aria-pressed={on}
                      className={`rounded-lg border px-1 py-2.5 text-center transition-colors ${on ? "border-[#5b5cf6] bg-[#5b5cf6] text-white" : "border-[#e5e7eb] bg-white text-slate-800 hover:border-slate-300"}`}
                    >
                      <span className="block text-[11px] font-semibold">{d.label}</span>
                      <span className="block text-[12px]">{d.sub}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset>
              <legend className={labelClass}>Preferred time · AEST *</legend>
              <div className="flex flex-wrap gap-2">
                {AUDIT_TIMES.map((t) => {
                  const on = form.preferredTime === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, preferredTime: t }))}
                      aria-pressed={on}
                      className={`rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors ${on ? "border-[#5b5cf6] bg-[#5b5cf6] text-white" : "border-[#e5e7eb] bg-white text-slate-800 hover:border-slate-300"}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {error && <p role="alert" aria-live="polite" className="text-sm font-medium text-red-700">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setError(""); setStatus("idle"); setStep(1); }} className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                <ArrowLeft size={16} /> Back
              </button>
              <button type="submit" disabled={status === "loading"} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#5b5cf6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-60">
                {status === "loading" ? "Sending..." : <>Book my free audit <ArrowRight size={17} /></>}
              </button>
            </div>
            {preview && <p className="text-center text-xs text-slate-600">Sketch only — this form does not send a request.</p>}
            {!preview && <p className="text-center text-xs text-slate-600">Pick a weekday in the next 14 days. We confirm within one business day.</p>}
          </motion.form>
        )}

        {step === 3 && (
          <motion.div key="done" role="status" aria-live="polite" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
            <motion.div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-700 text-white"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.25 }}
            >
              <Check size={30} strokeWidth={3} />
            </motion.div>
            <h3 className="mb-2 text-2xl font-semibold text-slate-900">Audit requested</h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-700">
              We have your preferred time, {form.preferredDate} at {form.preferredTime} AEST. We&apos;ll confirm it within one business day.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
