"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, CalendarCheck, Check, ClipboardList, CreditCard, Eye, MessageSquare, Package, PhoneMissed, ShieldCheck, Truck, UserPlus } from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";
import MarketingHero from "@/components/marketing/marketing-hero";
import WeekMetrics from "@/components/marketing/week-metrics";
import Walkthrough from "@/components/marketing/walkthrough";
import BackofficeFlows from "@/components/marketing/backoffice-flows";
import ProblemsSolved from "@/components/marketing/problems-solved";
import { CtaBand, TextLink } from "@/components/marketing/page-kit";
import { LEGACY_HASHES } from "@/lib/site-routes";

const TOOLS = ["Xero", "MYOB", "Shopify", "HubSpot", "Google Workspace", "Microsoft 365", "Shipping", "Automation"];

const SERVICES = [
  { icon: PhoneMissed, t: "Missed calls & messages", d: "An instant reply in your tone, with a booking link." },
  { icon: CalendarCheck, t: "Bookings", d: "Customers pick a time. It lands in your diary." },
  { icon: MessageSquare, t: "Reminders", d: "Fewer no-shows, easy rescheduling, waitlist backfill." },
  { icon: CreditCard, t: "Invoices & payments", d: "Raised when the job is done, paid by link." },
  { icon: UserPlus, t: "Lead capture", d: "Every enquiry saved to your CRM, nothing lost." },
  { icon: Eye, t: "Human review", d: "Anything unusual is held for a person, with context." },
];

const STEPS = [
  { n: "01", t: "Assess", d: "We map where your team's hours go." },
  { n: "02", t: "Design", d: "Rules written the way your best person decides." },
  { n: "03", t: "Build", d: "Connected to your tools, shadow-tested first." },
  { n: "04", t: "Run", d: "Monitored daily, improved every month." },
];


const SECURITY = [
  { t: "Isolated by client", d: "Each client runs in an isolated environment on our own servers." },
  { t: "Read-only first", d: "Every automation starts by watching, not acting." },
  { t: "Human approval on exceptions", d: "Anything unusual is held for a person, with the context they need." },
  { t: "Full logs and audit trail", d: "Every decision is recorded, so you can see what ran and why." },
  { t: "Least-privilege access", d: "Automations only get the access they need to do the job." },
];

const USE_CASES = [
  { icon: Package, t: "Stock & inventory", d: "Reorder points and stock checks, without the spreadsheet.", href: "/use-cases#stock" },
  { icon: ClipboardList, t: "Order intake", d: "New orders checked before anyone starts picking.", href: "/use-cases#orders" },
  { icon: Truck, t: "Dispatch & fulfilment", d: "Labels, status updates, and exceptions held for a person.", href: "/use-cases#dispatch" },
  { icon: Briefcase, t: "B2B & online sales", d: "Wholesale and store orders, invoices and follow-up.", href: "/use-cases#sales" },
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
    <div className="text-[#f3f4f6]">
      <LegacyHashRedirect />
      <MarketingHero />
      <WeekMetrics />

      <section className="bg-transparent py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 text-sm text-[#9ca3af]">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">Works with</span>
          {TOOLS.map((t) => <span key={t}>{t}</span>)}
        </div>
      </section>

      <BackofficeFlows />
      <ProblemsSolved />

      <Walkthrough />

      {/* Services summary */}
      <section className="cy-shell py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>What we automate</Eyebrow>
              <Heading>The repeat work, <Accent>handled</Accent>.</Heading>
            </div>
            <TextLink href="/services">All services</TextLink>
          </div>
          <div className="mt-10 grid overflow-hidden rounded-[20px] border border-white/[0.09] bg-white/[0.08] shadow-[var(--cy-shadow)] sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 1 }}>
            {SERVICES.map(({ icon: Icon, t, d }, i) => (
              <motion.a key={t} href="/services" {...rise(i)} className="group flex gap-4 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.06]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/[0.09] text-[#d1d5db] transition-colors group-hover:border-[#818cf8]/50 group-hover:text-[#c7d2fe]"><Icon size={18} /></span>
                <span>
                  <span className="block text-[16px] font-semibold text-[#f3f4f6]">{t}</span>
                  <span className="mt-1 block text-[14.5px] leading-relaxed text-[#9ca3af]">{d}</span>
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* How it works teaser */}
      <section className="bg-transparent py-20 sm:py-24">
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
              <motion.li key={s.n} {...rise(i)} className="relative rounded-[20px] border border-white/[0.09] cy-glass p-6 shadow-[var(--cy-shadow)]">
                <p className="text-sm font-semibold text-[#a5b4fc]">{s.n}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#f3f4f6]">{s.t}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#9ca3af]">{s.d}</p>
              </motion.li>
            ))}
          </ol>
          <div className="mt-14 border-t border-white/[0.09] pt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a5b4fc]">Secure by design</p>
            <h3 className="mt-3 max-w-2xl text-[22px] font-semibold tracking-tight text-[#f3f4f6] sm:text-[26px]">
              Secure by design, built by a team with a cyber security practice.
            </h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#9ca3af]">
              Automations run in the background on our own servers, with a person in the loop when something is off.
            </p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SECURITY.map((s, i) => (
                <motion.li key={s.t} {...rise(i)} className="rounded-[20px] border border-white/[0.09] cy-glass p-6 shadow-[var(--cy-shadow)]">
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.09] text-[#d1d5db]"><ShieldCheck size={18} /></span>
                  <h4 className="text-[16px] font-semibold text-[#f3f4f6]">{s.t}</h4>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#9ca3af]">{s.d}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Use cases teaser */}
      <section className="cy-shell py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Use cases</Eyebrow>
              <Heading>Office tasks for <Accent>trade, commerce and fulfilment</Accent>.</Heading>
            </div>
            <TextLink href="/use-cases">All use cases</TextLink>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map(({ icon: Icon, t, d, href }, i) => (
              <motion.a key={t} href={href} {...rise(i)} className="group block rounded-[20px] border border-white/[0.09] cy-glass p-6 shadow-[var(--cy-shadow)] transition-colors hover:border-white/20">
                <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.09] text-[#d1d5db]"><Icon size={18} /></span>
                <h3 className="text-[16px] font-semibold text-[#f3f4f6]">{t}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#9ca3af]">{d}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-transparent py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Eyebrow>Pricing</Eyebrow>
            <p className="text-[22px] font-semibold tracking-tight text-[#f3f4f6] sm:text-[26px]">Office tasks. Pay for what works.</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-[#d1d5db]">
            {["Starter $349/mo", "Growth $649/mo", "Business $999/mo", "Enterprise $1,499+/mo"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check size={16} className="text-emerald-400" />{t}</li>
            ))}
          </ul>
          <TextLink href="/pricing">See pricing</TextLink>
        </div>
      </section>

      <CtaBand secondary={{ href: "/how-it-works", label: "How it works" }} />
    </div>
  );
}

