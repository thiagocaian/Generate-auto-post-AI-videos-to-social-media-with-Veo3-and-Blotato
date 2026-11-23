"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";
import { CtaBand, PageIntro, PrimaryLink, SecondaryLink } from "@/components/marketing/page-kit";

const PLANS = [
  {
    t: "Starter",
    price: "$349",
    unit: "/month",
    note: "Setup $990",
    d: "One operational automation, with monitoring.",
    f: [
      "One operational workflow",
      "Monitoring and alerts from Cytron automation",
      "Rules written with your team",
      "Read-only first, with a go-live plan",
    ],
    cta: "Free Automation Assessment",
  },
  {
    t: "Growth",
    price: "$649",
    unit: "/month",
    note: "Setup $1,490",
    d: "Smart automation, CRM, leads and follow-up.",
    f: [
      "Cytron automation on our servers",
      "Lead capture in your CRM",
      "Follow-up tasks and reminders",
      "Messages in your tone, approved by you",
    ],
    cta: "Start with the assessment",
    hot: true,
  },
  {
    t: "Business",
    price: "$999",
    unit: "/month",
    note: "Setup $2,490",
    d: "Multiple processes, integrations and advanced monitoring.",
    f: [
      "Multiple workflows as you grow",
      "Connects to the tools you already use",
      "Daily or weekly plain-English reports",
      "Monitoring and alerts from Cytron automation",
    ],
    cta: "Free Automation Assessment",
  },
  {
    t: "Enterprise",
    price: "$1,499+",
    unit: "/month",
    note: "Custom setup",
    d: "Complex operations and specialised digital teams.",
    f: [
      "Human review, built in",
      "Local Gold Coast team",
      "Monthly rule tuning and reports",
      "New workflows as you grow",
    ],
    cta: "Free Automation Assessment",
  },
];

const INCLUDED = ["Works with the tools you already use", "Read-only first, one click back to manual", "Your data and accounts stay yours", "Local Gold Coast team"];

const FAQ = [
  { q: "What does it cost?", a: "The assessment is free. Monthly plans start at $349, plus a setup fee from $990. Growth is $649, Business is $999, and Enterprise is $1,499+ a month with a custom setup. Prices are in AUD, ex GST where applicable. API usage, phone and SMS are subject to included allowances or additional charges." },
  { q: "Is there a lock-in contract?", a: "Your workflows, your data, your accounts. No black box and no lock-in." },
  { q: "Do I need to change the software I use?", a: "No. We connect to what you already use: your store, warehouse system, accounting, email and chat." },
  { q: "How long until it runs?", a: "A first workflow usually goes from assessment to shadow test in a few weeks, depending on access to your systems." },
  { q: "Will my customers know it's automated?", a: "Messages are written in your tone and approved by you. When a conversation needs a real person, it's handed over with the full history so nobody repeats themselves." },
  { q: "What if the automation gets something wrong?", a: "It is built to stop rather than guess. Anything outside the rules is held for a person, and every decision is logged." },
  { q: "Is it only for one type of business?", a: "No. We work with trade and wholesale, e-commerce, and warehouse and fulfilment operations. If a task follows the same steps every time, it can usually run on its own." },
];

export default function PricingPage() {
  return (
    <div>
      <PageIntro
        eyebrow="Pricing"
        title={<>Office tasks. <Accent>Pay for what works</Accent>.</>}
        lead="Cytron specialises in repetitive office tasks. Begin with a free assessment, then a monthly plan — from one workflow to more complex operations."
        actions={<><PrimaryLink href="/contact">Free Automation Assessment</PrimaryLink><SecondaryLink href="#faq">Read the FAQ</SecondaryLink></>}
      />

      <section className="cy-shell py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => (
              <div key={p.t} className={`relative flex flex-col rounded-[24px] border bg-white p-7 shadow-[var(--cy-shadow)] ${p.hot ? "border-[#5b5cf6] ring-1 ring-[#5b5cf6]" : "border-[#e5e7eb]"}`}>
                <div className="flex min-h-[26px] items-center justify-between">
                  {p.hot ? (
                    <p className="rounded-full bg-[#eef0ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#4f46e5]">Recommended</p>
                  ) : (
                    <span aria-hidden className="h-[26px]" />
                  )}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">{p.t}</h2>
                <p className="mt-2 text-[34px] font-semibold tracking-tight text-slate-900">
                  {p.price}
                  {p.unit && <span className="text-base font-medium text-slate-600">{p.unit}</span>}
                </p>
                {"note" in p && p.note && <p className="mt-1 text-sm font-medium text-slate-600">{p.note}</p>}
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{p.d}</p>
                <ul className="mt-6 flex-1 space-y-2.5 text-[15px] text-slate-700">
                  {p.f.map((f) => <li key={f} className="flex gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-emerald-700" />{f}</li>)}
                </ul>
                <a href="/contact" className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${p.hot ? "bg-[#111827] text-white hover:bg-[#1f2937]" : "border border-[#e7e7ec] bg-white text-slate-800 hover:border-[#d8ccfb] hover:bg-[#faf7ff]"}`}>
                  {p.cta} <ChevronRight size={16} />
                </a>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-xl border border-[#e5e7eb] bg-[#f7f8fa] px-6 py-5 text-[14.5px] text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Every plan</span>
            {INCLUDED.map((t) => <span key={t} className="flex items-center gap-2"><Check size={16} className="text-emerald-700" />{t}</span>)}
          </div>
          <p className="mt-4 text-center text-xs text-slate-600">Prices in AUD, ex GST where applicable. API usage, phone and SMS are subject to included allowances or additional charges.</p>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-transparent py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <Eyebrow>FAQ</Eyebrow>
          <Heading>Questions we hear a lot.</Heading>
          <div className="mt-10 divide-y divide-[#e5e7eb] rounded-[20px] border border-[#e7e7ec] bg-white px-6 shadow-[var(--cy-shadow)]">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-slate-900">
                  {f.q}<ChevronRight size={18} className="shrink-0 text-slate-400 transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Not sure which plan fits?" text="It starts with the free assessment. We'll recommend the right plan for your business." />
    </div>
  );
}
