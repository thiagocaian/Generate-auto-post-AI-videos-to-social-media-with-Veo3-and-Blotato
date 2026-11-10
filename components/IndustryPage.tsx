"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Building2, Check, ChevronRight, ShieldCheck, ShoppingBag, Stethoscope, UtensilsCrossed, Wrench } from "lucide-react";
import { Accent, ACCENT, cta, Eyebrow, Heading, SiteFooter, SiteNav } from "@/components/site";
import { INDUSTRIES, type Industry } from "@/lib/industries";

const ICONS = { wrench: Wrench, stethoscope: Stethoscope, building: Building2, utensils: UtensilsCrossed, bag: ShoppingBag, briefcase: Briefcase };

const PROCESS = [
  { n: "01", t: "Free audit", d: "We map the tasks that eat your team's hours and pick the first one worth automating." },
  { n: "02", t: "Shadow test", d: "It runs in read-only mode next to your team. You see every decision before it acts." },
  { n: "03", t: "Go live", d: "Switched on one step at a time, with our agents checking it every day." },
];

const card = "rounded-xl border border-[#e5e7eb] bg-white shadow-sm";

export default function IndustryPage({ industry }: { industry: Industry }) {
  const Icon = ICONS[industry.icon];
  const [before, accent, after] = industry.headline;
  const others = INDUSTRIES.filter((i) => i.slug !== industry.slug);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteNav />

      {/* Hero */}
      <section className="bg-white pb-16 pt-16 sm:pb-24 sm:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[13px] text-slate-600">
              <a href="/" className="hover:text-slate-800">Home</a><ChevronRight size={14} />
              <a href="/#industries" className="hover:text-slate-800">Industries</a><ChevronRight size={14} />
              <span className="text-slate-800">{industry.name}</span>
            </nav>
            <Eyebrow>{industry.eyebrow} · Gold Coast</Eyebrow>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl text-[28px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[40px]">
              {before}<Accent>{accent}</Accent>{after}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {industry.intro}
            </motion.p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {cta("Book a free automation audit", "/#audit")}
              <a href="#automations" className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50">What we automate</a>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-700"><Icon size={18} /></div>
              <p className="text-lg font-semibold">Sound familiar?</p>
            </div>
            <ul className="space-y-3">
              {industry.pains.map((p) => (
                <li key={p} className="flex gap-3 rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] px-4 py-3 text-[15px] text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ACCENT }} />{p}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-slate-600">Each of these follows the same steps every time. That means it can run on its own.</p>
          </motion.div>
        </div>
      </section>

      {/* Tools */}
      <section className="border-y border-[#e5e7eb] bg-[#f7f8fa] py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 text-sm font-medium text-slate-600">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Works with</span>
          {industry.tools.map((t) => <span key={t}>{t}</span>)}
        </div>
      </section>

      {/* Automations */}
      <section id="automations" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <Eyebrow>What we automate</Eyebrow>
        <Heading>Built for how {industry.name.toLowerCase()} actually works.</Heading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industry.automations.map((a, i) => (
            <div key={a.t} className={`${card} p-6`}>
              <p className="mb-4 text-sm font-semibold" style={{ color: ACCENT }}>{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mb-2 text-lg font-semibold">{a.t}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600">{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stat + agents */}
      <section className="bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2">
          <div>
            <Eyebrow>Why it matters</Eyebrow>
            <p className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">{industry.stat.k}</p>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-600">{industry.stat.v}</p>
            <a href={industry.stat.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs font-medium text-slate-600 underline-offset-2 hover:underline">Source: {industry.stat.src}</a>
          </div>
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-7 shadow-sm">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-700"><ShieldCheck size={18} /></div>
            <h3 className="text-2xl font-semibold text-slate-900">Checked every day by our agents.</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">Every automation we build is watched by Cytron agents running on our own servers. Each area is checked on its own schedule, and you get a plain-English report. If an agent stays quiet, everything passed.</p>
            <a href="/#agents" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5b5cf6]">How our agents work <ChevronRight size={16} /></a>
          </div>
        </div>
      </section>

      {/* A day with Cytron */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Eyebrow>A day with Cytron</Eyebrow>
        <Heading>The same day, <Accent>without the admin</Accent>.</Heading>
        <ol className="relative mt-12 space-y-3 before:absolute before:bottom-6 before:left-[15px] before:top-6 before:w-px before:bg-[#e5e7eb]">
          {industry.day.map((d) => (
            <li key={d.time} className="relative flex gap-4">
              <span className="relative z-10 mt-5 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white">
                <span className="h-2 w-2 rounded-full bg-[#5b5cf6]" />
              </span>
              <div className={`${card} grid flex-1 gap-1 p-5 sm:grid-cols-[130px_1fr] sm:gap-6`}>
                <p className="text-sm font-semibold" style={{ color: ACCENT }}>{d.time}</p>
                <p className="text-[15px] text-slate-700">{d.t}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-xs text-slate-600">Illustrative example. Every business gets its own rules, tone and tools.</p>
      </section>

      {/* Process */}
      <section className="bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>How we start</Eyebrow>
          <Heading>Safe by design, live in weeks.</Heading>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PROCESS.map((p) => (
              <div key={p.n} className={`${card} p-6`}>
                <p className="mb-4 text-3xl font-semibold" style={{ color: ACCENT }}>{p.n}</p>
                <h3 className="mb-2 text-lg font-semibold">{p.t}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-24">
        <Eyebrow>FAQ</Eyebrow>
        <Heading>Questions we hear from {industry.name.toLowerCase()}.</Heading>
        <div className="mt-10 divide-y divide-slate-200 rounded-xl border border-[#e5e7eb] bg-white px-6 shadow-sm">
          {industry.faq.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-slate-900">
                {f.q}<ChevronRight size={18} className="shrink-0 text-slate-400 transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#f7f8fa] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-[28px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[36px]"><Accent>One</Accent> call and you&apos;ll know what to automate first.</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-slate-600">A free audit for your business. No obligation, and a clear plan within one business day.</p>
          <div className="mt-9 flex justify-center">{cta("Book my free audit", "/#audit")}</div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
            {["Works with your current tools", "Read-only pilot first", "Local to the Gold Coast"].map((t) => (
              <span key={t} className="flex items-center gap-2"><Check size={15} className="text-emerald-500" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Other industries */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Other industries we automate</p>
        <div className="flex flex-wrap gap-2.5">
          {others.map((o) => (
            <a key={o.slug} href={`/${o.slug}`} className="rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900">{o.name}</a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
