"use client";

import React from "react";
import { CalendarCheck, Check, ClipboardList, MapPin, PhoneCall } from "lucide-react";
import { Accent } from "@/components/site";
import AuditForm from "@/components/marketing/audit-form";

const NEXT = [
  { icon: ClipboardList, t: "Tell us about the business", d: "Two minutes: who you are and which task eats the most time." },
  { icon: CalendarCheck, t: "Pick a time", d: "Choose a weekday slot for the audit, in person on the Coast or online." },
  { icon: PhoneCall, t: "We review and follow up", d: "A person at Cytron reviews the request and comes back with ideas for your tools." },
];

const GET = ["A map of where your team's hours go", "The top 3 tasks worth automating first", "A rough estimate of time and cost saved", "A clear next step, with no obligation"];

export default function ContactPage() {
  return (
    <div className="bg-white">
      <section id="audit" className="border-b border-[#e5e7eb] bg-gradient-to-b from-white to-[#f3f4f7]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#5b5cf6]">Contact · Free automation audit</p>
            <h1 className="max-w-xl text-[clamp(2.1rem,6.5vw,3.4rem)] font-semibold leading-[1.06] tracking-tight text-slate-900">
              <Accent>One</Accent> call and you&apos;ll know what to automate first.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-slate-600 sm:text-lg">
              Tell us which task eats your team&apos;s day, whether it&apos;s missed calls, no-shows or unpaid invoices. We&apos;ll come back with a clear plan.
            </p>

            <ol className="mt-10 space-y-5">
              {NEXT.map(({ icon: Icon, t, d }, i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-slate-700"><Icon size={18} /></span>
                  <div>
                    <p className="text-[15.5px] font-semibold text-slate-900"><span className="mr-2 text-slate-500">{i + 1}.</span>{t}</p>
                    <p className="mt-0.5 text-[14.5px] leading-relaxed text-slate-600">{d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-slate-900">What you get from the audit</p>
              <ul className="space-y-2.5 text-[15px] text-slate-700">
                {GET.map((g) => <li key={g} className="flex gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-emerald-700" />{g}</li>)}
              </ul>
              <p className="mt-5 flex items-center gap-2 border-t border-[#e5e7eb] pt-4 text-[13.5px] text-slate-600"><MapPin size={15} /> Gold Coast, Queensland · in person or online</p>
            </div>
          </div>
          <div className="lg:sticky lg:top-24">
            <AuditForm />
          </div>
        </div>
      </section>
    </div>
  );
}
