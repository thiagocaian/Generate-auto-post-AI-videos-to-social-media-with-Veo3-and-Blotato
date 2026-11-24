"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LiquidGlass } from "@/components/marketing/glass";
import { track } from "@vercel/analytics";
import { ArrowRight, Check } from "lucide-react";
import { AUDIT_CONSENT_TEXT } from "@/lib/inbound/consent";

const inputClass = "w-full rounded-lg border border-[#e7e6f0] bg-white px-3.5 py-2.5 text-sm text-[#0f1222] outline-none transition placeholder:text-[#5b6078] focus:border-[#3f37a2] focus:ring-2 focus:ring-[#3f37a2]/15";
const labelClass = "mb-1.5 block text-xs font-semibold text-[#2e3248]";

function normaliseWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function AuditForm({ preview = false }: { preview?: boolean }) {
  const reduced = useReducedMotion() === true;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    website: "",
    responseProcess: "",
    consent: false,
    honeypot: "",
  });
  const [error, setError] = useState("");
  const set = (field: "name" | "businessName" | "email" | "phone" | "website" | "responseProcess" | "honeypot") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  useEffect(() => {
    const fromHero = new URLSearchParams(window.location.search).get("email");
    if (fromHero) setForm((prev) => (prev.email ? prev : { ...prev, email: fromHero.slice(0, 200) }));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.businessName || !form.email) {
      setError("Please fill in your name, business name and email.");
      return;
    }
    if (!form.consent) {
      setError("Please agree before we save this request.");
      return;
    }
    setError("");
    if (preview) {
      setStatus("success");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/lead-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          businessName: form.businessName,
          email: form.email,
          phone: form.phone || undefined,
          website: normaliseWebsite(form.website),
          responseProcess: form.responseProcess || undefined,
          consent: true,
          honeypot: form.honeypot,
        }),
      });
      if (res.ok) {
        track("lead_audit_submitted");
        setStatus("success");
      } else {
        setError("Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const trans = reduced ? { duration: 0 } : { duration: 0.28, ease: "easeOut" as const };

  return (
    <LiquidGlass reduced={reduced} maxTilt={0} panelClassName="p-6 sm:p-8" sheenDelay="2s">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div key="done" role="status" aria-live="polite" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
            <motion.div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-700 text-white"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.25 }}
            >
              <Check size={30} strokeWidth={3} />
            </motion.div>
            <h3 data-testid="audit-success" className="mb-2 text-2xl font-semibold text-[#0f1222]">We&apos;ll be in touch</h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#2e3248]">
              We received your request and will get back to you shortly.
            </p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={trans} className="relative space-y-5" noValidate>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#4b5067]">Free Automation Assessment</p>
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
                <label className={labelClass} htmlFor="audit-website">Website</label>
                <input id="audit-website" name="url" type="text" inputMode="url" autoComplete="url" className={inputClass} placeholder="https://www.example.com.au" value={form.website} onChange={set("website")} />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="audit-task">Which task eats your team&apos;s day?</label>
              <textarea id="audit-task" name="responseProcess" className={inputClass + " resize-none"} rows={4} placeholder="e.g. reconciling invoices at month-end, or typing new enquiries into the CRM..." value={form.responseProcess} onChange={set("responseProcess")} />
            </div>
            <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="audit-honeypot">Company website</label>
              <input id="audit-honeypot" data-testid="audit-honeypot" name="honeypot" tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={set("honeypot")} />
            </div>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-[#2e3248]">
              <input
                id="audit-consent"
                data-testid="audit-consent"
                type="checkbox"
                className="mt-1"
                checked={form.consent}
                onChange={(event) => setForm((prev) => ({ ...prev, consent: event.target.checked }))}
                required
              />
              <span>
                {AUDIT_CONSENT_TEXT}{" "}
                <a href="/privacy" className="font-semibold text-[#3f37a2] underline">Privacy policy</a>
              </span>
            </label>
            {error && <p role="alert" aria-live="polite" className="text-sm font-medium text-red-700">{error}</p>}
            <button type="submit" disabled={status === "loading"} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3f37a2] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#352e8c] disabled:opacity-60">
              {status === "loading" ? "Sending..." : <>Request a Free Automation Assessment <ArrowRight size={17} /></>}
            </button>
            {preview && <p className="text-center text-xs text-[#4b5067]">Sketch only — this form does not send a request.</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </LiquidGlass>
  );
}
