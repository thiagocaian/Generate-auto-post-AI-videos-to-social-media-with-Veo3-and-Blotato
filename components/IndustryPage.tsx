"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Building2, Check, ChevronRight, ShieldCheck, ShoppingBag, Stethoscope, UtensilsCrossed, Wrench, Zap } from "lucide-react";
import LedTunnel from "@/components/LedTunnel";
import { Accent, ACCENT, cta, Eyebrow, GRADIENT, Heading, LILAC, outfit, SiteFooter, SiteNav } from "@/components/site";
import { INDUSTRIES, type Industry } from "@/lib/industries";

const ICONS = { wrench: Wrench, stethoscope: Stethoscope, building: Building2, utensils: UtensilsCrossed, bag: ShoppingBag, briefcase: Briefcase };

const PROCESS = [
  { n: "01", t: "Free audit", d: "We map the tasks that eat your team's hours and pick the first one worth automating." },
  { n: "02", t: "Shadow test", d: "It runs in read-only mode next to your team. You see every decision before it acts." },
  { n: "03", t: "Go live", d: "Switched on one step at a time, with our agents checking it every day." },
];

const card = "rounded-3xl border border-white bg-white/80 shadow-[0_20px_50px_-30px_rgba(40,60,120,0.35)]";

export default function IndustryPage({ industry }: { industry: Industry }) {
  const Icon = ICONS[industry.icon];
  const [before, accent, after] = industry.headline;
  const others = INDUSTRIES.filter((i) => i.slug !== industry.slug);

  return (
    <div className={`${outfit.className} min-h-screen bg-[#f4f7fb] text-slate-900`}>
      <SiteNav />

      {/* Hero */}
      <section className="relative isolate overflow-hidden pb-20 pt-32 sm:pb-24 sm:pt-40">
        <LedTunnel />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[13px] text-slate-500">
              <a href="/" className="hover:text-slate-800">Home</a><ChevronRight size={14} />
              <a href="/#industries" className="hover:text-slate-800">Industries</a><ChevronRight size={14} />
              <span className="text-slate-800">{industry.name}</span>
            </nav>
            <Eyebrow>{industry.eyebrow} · Gold Coast</Eyebrow>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="text-[40px] font-semibold leading-[1.06] tracking-tight text-slate-950 sm:text-[60px]">
              {before}<Accent>{accent}</Accent>{after}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {industry.intro}
            </motion.p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {cta("Book a free automation audit", "/#audit")}
              <a href="#automations" className="inline-flex items-center gap-2 rounded-2xl border border-white bg-white/70 px-6 py-3.5 text-[15px] font-semibold text-slate-700 backdrop-blur transition hover:bg-white">What we automate</a>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border border-white bg-white/85 p-6 shadow-[0_30px_80px_-30px_rgba(40,60,120,0.35)] backdrop-blur-xl sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_0_20px_rgba(91,92,246,0.45)]" style={{ background: GRADIENT }}><Icon size={20} /></div>
              <p className="text-lg font-semibold">Sound familiar?</p>
            </div>
            <ul className="space-y-3">
              {industry.pains.map((p) => (
                <li key={p} className="flex gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-[15px] text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ACCENT }} />{p}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-slate-500">Each of these follows the same steps every time. That means it can run on its own.</p>
          </motion.div>
        </div>
      </section>

      {/* Tools */}
      <section className="border-y border-white bg-white/60 py-7">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 text-[15px] font-medium text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Works with</span>
          {industry.tools.map((t) => <span key={t}>{t}</span>)}
        </div>
      </section>

      {/* Automations */}
      <section id="automations" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <Eyebrow>What we automate</Eyebrow>
        <Heading>Built for how {industry.name.toLowerCase()} actually works.</Heading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industry.automations.map((a, i) => (
            <div key={a.t} className={`${card} group p-6 transition duration-300 hover:-translate-y-1 hover:border-[#5b5cf6]/20 hover:shadow-[0_25px_60px_-25px_rgba(91,92,246,0.45)]`}>
              <p className="mb-4 text-sm font-semibold" style={{ color: ACCENT }}>{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mb-2 text-lg font-semibold">{a.t}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600">{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stat + agents */}
      <section className="relative isolate overflow-hidden bg-[#050507] py-24 text-white">
        <LedTunnel dark className="opacity-40 [mask-image:linear-gradient(to_bottom,black_40%,transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/70 via-[#050507]/40 to-[#050507]/90" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2">
          <div>
            <Eyebrow dark>Why it matters</Eyebrow>
            <p className="text-6xl font-semibold tracking-tight sm:text-7xl" style={{ color: LILAC }}>{industry.stat.k}</p>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/70">{industry.stat.v}</p>
            <a href={industry.stat.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs text-white/40 underline-offset-2 hover:underline">Source: {industry.stat.src}</a>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_0_24px_rgba(124,125,255,0.55)]" style={{ background: GRADIENT }}><ShieldCheck size={20} /></div>
            <h3 className="text-2xl font-semibold">Checked every day by our agents.</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/60">Every automation we build is watched by Cytron agents running on our own servers. Each area is checked on its own schedule, and you get a plain-English report. If an agent stays quiet, everything passed.</p>
            <a href="/#agents" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: LILAC }}>How our agents work <ChevronRight size={16} /></a>
          </div>
        </div>
      </section>

      {/* A day with Cytron */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Eyebrow>A day with Cytron</Eyebrow>
        <Heading>The same day, <Accent>without the admin</Accent>.</Heading>
        <ol className="relative mt-12 space-y-3 before:absolute before:bottom-6 before:left-[15px] before:top-6 before:w-px before:bg-[#5b5cf6]/20">
          {industry.day.map((d) => (
            <li key={d.time} className="relative flex gap-4">
              <span className="relative z-10 mt-5 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border border-[#5b5cf6]/20 bg-white">
                <span className="h-2 w-2 rounded-full shadow-[0_0_8px_rgba(91,92,246,0.7)]" style={{ background: ACCENT }} />
              </span>
              <div className={`${card} grid flex-1 gap-1 p-5 sm:grid-cols-[130px_1fr] sm:gap-6`}>
                <p className="text-sm font-semibold" style={{ color: ACCENT }}>{d.time}</p>
                <p className="text-[15px] text-slate-700">{d.t}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-xs text-slate-400">Illustrative example. Every business gets its own rules, tone and tools.</p>
      </section>

      {/* Process */}
      <section className="bg-white/70 py-24">
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
        <div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-white bg-white/80 px-6">
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
      <section className="relative isolate overflow-hidden py-24">
        <LedTunnel />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-[0_0_24px_rgba(91,92,246,0.5)]" style={{ background: GRADIENT }}><Zap size={22} /></div>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-[52px]"><Accent>One</Accent> call and you&apos;ll know what to automate first.</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-slate-600">A free audit for your business. No obligation, and a clear plan within one business day.</p>
          <div className="mt-9 flex justify-center">{cta("Book my free audit", "/#audit")}</div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {["Works with your current tools", "Read-only pilot first", "Local to the Gold Coast"].map((t) => (
              <span key={t} className="flex items-center gap-2"><Check size={15} className="text-emerald-500" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Other industries */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Other industries we automate</p>
        <div className="flex flex-wrap gap-2.5">
          {others.map((o) => (
            <a key={o.slug} href={`/${o.slug}`} className="rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#5b5cf6]/25 hover:text-slate-900">{o.name}</a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
