"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";
import { CalendarCheck, Check, ClipboardList, MapPin, PhoneCall } from "lucide-react";
import { Accent } from "@/components/site";
import AuditForm from "@/components/marketing/audit-form";
import { LiquidGlass } from "@/components/marketing/glass";

const NEXT = [
  { icon: ClipboardList, t: "Tell us about the business", d: "Two minutes: who you are and which task eats the most time." },
  { icon: CalendarCheck, t: "We get in touch", d: "A person at Cytron reviews the request, in person on the Coast or online." },
  { icon: PhoneCall, t: "A clear plan, no obligation", d: "We come back with the tasks worth automating first, and how we would run them." },
];

const GET = ["A map of where your team's hours go", "The top 3 tasks worth automating first", "A rough estimate of time and cost saved", "A clear next step, with no obligation"];

export default function ContactPage() {
  const reduced = useReducedMotion() === true;
  return (
    <div className="bg-white">
      <section id="audit" className="border-b border-[#e7e6f0] bg-gradient-to-b from-[#f2f1ff] to-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#3f37a2]">Contact · Free Automation Assessment</p>
            <h1 className="max-w-xl text-[clamp(2.1rem,6.5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-[#0f1222]">
              <Accent>One</Accent> call and you&apos;ll know what to automate first.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[#4b5067] sm:text-lg">
              Cytron specialises in repetitive office tasks. Tell us which one eats the day — stock, orders, dispatch or invoices. We&apos;ll come back with a clear plan.
            </p>

            <ol className="mt-10 space-y-5">
              {NEXT.map(({ icon: Icon, t, d }, i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#e7e6f0] bg-white text-[#2e3248]"><Icon size={18} /></span>
                  <div>
                    <p className="text-[15.5px] font-semibold text-[#0f1222]"><span className="mr-2 text-[#5b6078]">{i + 1}.</span>{t}</p>
                    <p className="mt-0.5 text-[14.5px] leading-relaxed text-[#4b5067]">{d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <LiquidGlass reduced={reduced} lite className="mt-10" panelClassName="p-6" sheenDelay="0.8s">
              <p className="mb-4 text-sm font-semibold text-[#0f1222]">What you get from the assessment</p>
              <ul className="space-y-2.5 text-[15px] text-[#2e3248]">
                {GET.map((g) => <li key={g} className="flex gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-emerald-700" />{g}</li>)}
              </ul>
              <p className="mt-5 flex items-center gap-2 border-t border-slate-900/[0.08] pt-4 text-[13.5px] text-[#4b5067]"><MapPin size={15} /> Gold Coast, Queensland · in person or online</p>
            </LiquidGlass>
          </div>
          <div className="lg:sticky lg:top-24">
            <AuditForm />
          </div>
        </div>
      </section>
    </div>
  );
}
