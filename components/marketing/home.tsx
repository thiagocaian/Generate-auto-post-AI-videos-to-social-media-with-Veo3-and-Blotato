"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, Check, CreditCard, Eye, MessageSquare, PhoneMissed, Scissors, Stethoscope, UserPlus, Wrench, Briefcase } from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";
import MarketingHero from "@/components/marketing/marketing-hero";
import WeekMetrics from "@/components/marketing/week-metrics";
import Walkthrough from "@/components/marketing/walkthrough";
import { CtaBand, TextLink } from "@/components/marketing/page-kit";
import { LEGACY_HASHES } from "@/lib/site-routes";

const TOOLS = ["Xero", "MYOB", "ServiceM8", "Tradify", "Cliniko", "Google Workspace", "Microsoft 365", "Shopify", "HubSpot", "WhatsApp", "n8n"];

const SERVICES = [
  { icon: PhoneMissed, t: "Missed calls & messages", d: "An instant reply in your tone, with a booking link." },
  { icon: CalendarCheck, t: "Bookings", d: "Customers pick a time. It lands in your diary." },
  { icon: MessageSquare, t: "Reminders", d: "Fewer no-shows, easy rescheduling, waitlist backfill." },
  { icon: CreditCard, t: "Invoices & payments", d: "Raised when the job is done, paid by link." },
  { icon: UserPlus, t: "Lead capture", d: "Every enquiry saved to your CRM, nothing lost." },
  { icon: Eye, t: "Human review", d: "Anything unusual is held for a person, with context." },
];

const STEPS = [
  { n: "01", t: "Audit", d: "We map where your team's hours go." },
  { n: "02", t: "Design", d: "Rules written the way your best person decides." },
  { n: "03", t: "Build", d: "Connected to your tools, shadow-tested first." },
  { n: "04", t: "Run", d: "Monitored daily, improved every month." },
];

const USE_CASES = [
  { icon: Scissors, t: "Salons & beauty", d: "Rebook reminders and no-show cover.", href: "/use-cases#salon" },
  { icon: Stethoscope, t: "Clinics", d: "Reminders, intake forms and recalls.", href: "/use-cases#clinic" },
  { icon: Wrench, t: "Trades & mechanics", d: "Missed-call text back to paid invoice.", href: "/use-cases#trades" },
  { icon: Briefcase, t: "Service providers", d: "Onboarding, documents and follow-up.", href: "/use-cases#services" },
];

/** Old one-page links (/#faq, /#audit …) land on the page that now holds that content. */
function LegacyHashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const target = LEGACY_HASHES[window.location.hash.slice(1)];
    if (target) router.replace(target);
  }, [router]);
  return null;
}

export default function Home() {
  const reduced = useReducedMotion() === true;
  const rise = (i: number) =>
    reduced ? {} : { initial: { opacity: 0, y: 8 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, transition: { delay: i * 0.05, duration: 0.35 } };

  return (
    <div className="bg-white text-slate-900">
      <LegacyHashRedirect />
      <MarketingHero />
      <WeekMetrics />

      <section className="border-b border-[#e5e7eb] bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 text-sm text-slate-600">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Works with</span>
          {TOOLS.map((t) => <span key={t}>{t}</span>)}
        </div>
      </section>

      <Walkthrough />

      {/* Services summary */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>What we automate</Eyebrow>
              <Heading>The repeat work, <Accent>handled</Accent>.</Heading>
            </div>
            <TextLink href="/services">All services</TextLink>
          </div>
          <div className="mt-10 grid overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#e5e7eb] sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 1 }}>
            {SERVICES.map(({ icon: Icon, t, d }, i) => (
              <motion.a key={t} href="/services" {...rise(i)} className="group flex gap-4 bg-white p-6 transition-colors hover:bg-[#fafafb]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-700 transition-colors group-hover:border-[#c7c8f8] group-hover:text-[#5b5cf6]"><Icon size={18} /></span>
                <span>
                  <span className="block text-[16px] font-semibold text-slate-900">{t}</span>
                  <span className="mt-1 block text-[14.5px] leading-relaxed text-slate-600">{d}</span>
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* How it works teaser */}
      <section className="bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>How it works</Eyebrow>
              <Heading>Safe by design, <Accent>live in weeks</Accent>.</Heading>
            </div>
            <TextLink href="/how-it-works">See the process</TextLink>
          </div>
          <ol className="relative mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.li key={s.n} {...rise(i)} className="relative rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-[#5b5cf6]">{s.n}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{s.t}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-600">{s.d}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Use cases teaser */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Use cases</Eyebrow>
              <Heading>Built for how the <Accent>Gold Coast</Accent> works.</Heading>
            </div>
            <TextLink href="/use-cases">All use cases</TextLink>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map(({ icon: Icon, t, d, href }, i) => (
              <motion.a key={t} href={href} {...rise(i)} className="group block rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm transition-colors hover:border-slate-300">
                <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-700"><Icon size={18} /></span>
                <h3 className="text-[16px] font-semibold text-slate-900">{t}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-600">{d}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-y border-[#e5e7eb] bg-[#f7f8fa] py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Eyebrow>Pricing</Eyebrow>
            <p className="text-[22px] font-semibold tracking-tight text-slate-900 sm:text-[26px]">Start small. Pay for what works.</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-slate-700">
            {["Free audit", "Fixed-quote pilot", "Monthly run & improve"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check size={16} className="text-emerald-700" />{t}</li>
            ))}
          </ul>
          <TextLink href="/pricing">See pricing</TextLink>
        </div>
      </section>

      <CtaBand secondary={{ href: "/how-it-works", label: "How it works" }} />
    </div>
  );
}

