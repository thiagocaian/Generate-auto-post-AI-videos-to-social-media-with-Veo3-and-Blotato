"use client";

import React from "react";
import { AlertTriangle, Check, Clock, MessageSquare, PhoneMissed, UserPlus, CalendarCheck, FileText, CreditCard } from "lucide-react";

/** More compact UI fragments for the services and how-it-works pages. Same visual language as ui-fragments.tsx. */

const row = "rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2.5";

export function LeadCaptured() {
  const fields = [
    ["Name", "Sam Patel"],
    ["Need", "Hot water repair"],
    ["Suburb", "Southport QLD 4215"],
    ["Source", "Web form · 9:12 pm"],
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-slate-700"><UserPlus size={14} /></span>
          New lead
        </p>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Saved to CRM</span>
      </div>
      <dl className="grid grid-cols-2 gap-1.5">
        {fields.map(([k, v]) => (
          <div key={k} className={row + " !py-2"}>
            <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-600">{k}</dt>
            <dd className="mt-0.5 truncate text-[12.5px] font-medium text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[12px] font-medium text-slate-700">No duplicate · tagged &ldquo;urgent&rdquo; · follow-up in 2 days</p>
    </div>
  );
}

export function HeldForReview() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-700" />
        <div>
          <p className="text-[13px] font-semibold text-amber-900">Held for a person</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-amber-900">Quote asks for a 40% discount. Outside the rules, so nothing was sent.</p>
        </div>
      </div>
      <div className={row}>
        <p className="text-[11px] font-semibold text-slate-600">Context attached</p>
        <p className="mt-0.5 text-[12.5px] text-slate-800">Customer history · 3 past jobs · last quote $860</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <span className="rounded-md bg-[#5b5cf6] px-3 py-2 text-center text-[12px] font-semibold text-white">Approve &amp; send</span>
        <span className="rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-center text-[12px] font-semibold text-slate-800">Reply myself</span>
      </div>
    </div>
  );
}

export function ProcessMap() {
  const tasks = [
    { t: "Returning missed calls", h: "6 h / week", top: true },
    { t: "Chasing unpaid invoices", h: "4 h / week", top: true },
    { t: "Confirming tomorrow's bookings", h: "3 h / week", top: true },
    { t: "Re-typing jobs into Xero", h: "2 h / week", top: false },
  ];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Where the hours go · example</p>
      {tasks.map((x) => (
        <div key={x.t} className="flex items-center justify-between gap-3 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2">
          <span className="flex items-center gap-2 text-[12.5px] text-slate-800">
            <span className={`flex h-5 w-5 items-center justify-center rounded ${x.top ? "bg-[#5b5cf6] text-white" : "border border-[#e5e7eb] text-slate-500"}`}>
              {x.top ? <Check size={11} strokeWidth={3} /> : null}
            </span>
            {x.t}
          </span>
          <span className="text-[12px] font-semibold tabular-nums text-slate-700">{x.h}</span>
        </div>
      ))}
      <p className="mt-1 text-[12px] font-medium text-slate-700">Top 3 picked to automate first</p>
    </div>
  );
}

export function RulesCard() {
  const rules = [
    ["IF", "call missed and caller is new"],
    ["THEN", "text a booking link within 1 min"],
    ["IF", "quote over $2,000 or a discount asked"],
    ["THEN", "hold for a person, with the reason"],
  ];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Rules · written with your team</p>
      <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white font-mono text-[12px]">
        {rules.map(([k, v], i) => (
          <div key={i} className={`flex gap-3 px-3 py-2 ${i ? "border-t border-[#e5e7eb]" : ""}`}>
            <span className={`w-10 shrink-0 font-semibold ${k === "IF" ? "text-slate-500" : "text-[#5b5cf6]"}`}>{k}</span>
            <span className="text-slate-800">{v}</span>
          </div>
        ))}
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-slate-700"><MessageSquare size={13} /> Message tone approved by you</p>
    </div>
  );
}

export function BuildFlow() {
  const nodes = [
    { i: PhoneMissed, t: "Phone system" },
    { i: MessageSquare, t: "SMS" },
    { i: CalendarCheck, t: "Calendar" },
    { i: FileText, t: "Xero" },
    { i: CreditCard, t: "Payment link" },
  ];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Connected to the tools you already use</p>
      <ol className="flex flex-col gap-1.5">
        {nodes.map(({ i: Icon, t }, idx) => (
          <li key={t} className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-slate-700"><Icon size={15} /></span>
            <span className="flex-1 rounded-md border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-800">{t}</span>
            <span className="text-[11px] font-semibold text-emerald-800">{idx < 4 ? "Connected" : "Shadow test"}</span>
          </li>
        ))}
      </ol>
      <p className="text-[12px] font-medium text-slate-700">Read-only shadow test: 47 of 47 decisions matched your team</p>
    </div>
  );
}

export function RunStatus() {
  const items = [
    { t: "Missed-call replies", s: "12 sent", ok: true },
    { t: "Booking reminders", s: "18 confirmed", ok: true },
    { t: "Invoice follow-ups", s: "3 paid", ok: true },
    { t: "Held for you", s: "1 quote", ok: false },
  ];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Daily summary · 5:00 pm</p>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />All running</span>
      </div>
      {items.map((x) => (
        <div key={x.t} className="flex items-center justify-between gap-3 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2">
          <span className="flex items-center gap-2 text-[12.5px] text-slate-800">
            {x.ok ? <Check size={14} className="text-emerald-700" /> : <Clock size={14} className="text-amber-700" />}
            {x.t}
          </span>
          <span className="text-[12px] font-semibold tabular-nums text-slate-700">{x.s}</span>
        </div>
      ))}
      <p className="mt-1 text-[12px] font-medium text-slate-700">Rules tuned monthly from the exceptions</p>
    </div>
  );
}
