"use client";

import React, { useId, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, Clock, MessageSquare, PhoneMissed, UserPlus, CalendarCheck, FileText, CreditCard, Keyboard, Receipt } from "lucide-react";
import { hoursSummary } from "@/lib/marketing/hours-summary";
import { GLASS_ACTIVE, GLASS_HEADER, GLASS_IDLE, GLASS_ROW, GlassChevron, GlassCollapse, LiquidGlass, useHoverPill } from "@/components/marketing/glass";

/** More compact UI fragments for the services and how-it-works pages. Same visual language as ui-fragments.tsx. */

const row = "rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-2.5";

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
        <p className="flex items-center gap-2 text-[13px] font-semibold text-[#f3f4f6]">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.09] bg-white/[0.04] text-[#d1d5db]"><UserPlus size={14} /></span>
          New lead
        </p>
        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">Saved to CRM</span>
      </div>
      <dl className="grid grid-cols-2 gap-1.5">
        {fields.map(([k, v]) => (
          <div key={k} className={row + " !py-2"}>
            <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-[#9ca3af]">{k}</dt>
            <dd className="mt-0.5 truncate text-[12.5px] font-medium text-[#f3f4f6]">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[12px] font-medium text-[#d1d5db]">No duplicate · tagged &ldquo;urgent&rdquo; · follow-up in 2 days</p>
    </div>
  );
}

export function HeldForReview() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2.5">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-300" />
        <div>
          <p className="text-[13px] font-semibold text-amber-200">Held for a person</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-amber-200">Quote asks for a 40% discount. Outside the rules, so nothing was sent.</p>
        </div>
      </div>
      <div className={row}>
        <p className="text-[11px] font-semibold text-[#9ca3af]">Context attached</p>
        <p className="mt-0.5 text-[12.5px] text-[#e5e7eb]">Customer history · 3 past jobs · last quote $860</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <span className="rounded-md bg-[#4f46e5] px-3 py-2 text-center text-[12px] font-semibold text-white">Approve &amp; send</span>
        <span className="rounded-md border border-white/[0.09] bg-white/[0.04] px-3 py-2 text-center text-[12px] font-semibold text-[#e5e7eb]">Reply myself</span>
      </div>
    </div>
  );
}

const HOURS_EXAMPLE = [
  { t: "Returning missed calls", hours: 6, icon: PhoneMissed, top: true },
  { t: "Chasing unpaid invoices", hours: 4, icon: Receipt, top: true },
  { t: "Confirming tomorrow's bookings", hours: 3, icon: CalendarCheck, top: true },
  { t: "Re-typing jobs into Xero", hours: 2, icon: Keyboard, top: false },
];

export function ProcessMap() {
  const reduced = useReducedMotion() === true;
  const [open, setOpen] = useState(true);
  const listId = useId();
  const summary = hoursSummary(HOURS_EXAMPLE);
  const hover = useHoverPill(reduced);
  return (
    <LiquidGlass reduced={reduced} panelClassName="p-2" data-glass="a">
      <div className="flex items-center justify-between gap-3 py-1 pl-2.5 pr-1">
        <p className={GLASS_HEADER}>Where the hours go · example</p>
        <GlassChevron
          open={open}
          controls={listId}
          label={open ? "Collapse where the hours go" : "Expand where the hours go"}
          onClick={() => setOpen((v) => !v)}
          reduced={reduced}
          data-glass-toggle="a"
        />
      </div>

      <GlassCollapse open={!open} reduced={reduced}>
        <div className="flex items-center gap-2 px-2.5 pb-1.5 pt-1">
          <span className="flex shrink-0 -space-x-1.5" aria-hidden>
            {HOURS_EXAMPLE.map(({ t, icon: Icon, top }) => (
              <span
                key={t}
                className={`lg-row flex h-6 w-6 items-center justify-center rounded-full ${top ? "lg-row-active text-[#a5b4fc]" : "text-[#9ca3af]"}`}
              >
                <Icon size={12} />
              </span>
            ))}
          </span>
          <span className="lg-row lg-row-active whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold tabular-nums text-[#c7d2fe]">
            {summary}
          </span>
        </div>
      </GlassCollapse>

      <GlassCollapse open={open} id={listId} reduced={reduced}>
        <ul className="flex flex-col gap-1.5 px-0.5 pb-1 pt-1">
          {HOURS_EXAMPLE.map(({ t, hours, icon: Icon, top }, i) => (
            <li key={t} className={`${GLASS_ROW} ${top ? GLASS_ACTIVE : GLASS_IDLE}`} {...hover.bind(i)}>
              {hover.pill(i, "assess")}
              <span
                className={`lg-row flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${top ? "text-[#a5b4fc]" : "text-[#9ca3af]"}`}
                aria-hidden
              >
                <Icon size={14} />
              </span>
              <span className={`min-w-0 flex-1 text-[12.5px] ${top ? "font-medium text-[#f3f4f6]" : "text-[#d1d5db]"}`}>
                {t}
                {top ? <span className="sr-only"> (picked)</span> : null}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-semibold tabular-nums ${top ? "bg-gradient-to-b from-[#6d6ef8] to-[#5b5cf6] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" : "bg-white/[0.06] text-[#9ca3af]"}`}
              >
                {hours} h / week
              </span>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-2 px-2.5 pb-1.5 pt-2 text-[12px] font-medium text-[#d1d5db]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#5b5cf6]/25 ring-1 ring-[#5b5cf6]/40" aria-hidden />
          Top 3 picked to automate first
        </p>
      </GlassCollapse>
    </LiquidGlass>
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
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">Rules · written with your team</p>
      <div className="overflow-hidden rounded-lg border border-white/[0.09] bg-white/[0.04] font-mono text-[12px]">
        {rules.map(([k, v], i) => (
          <div key={i} className={`flex gap-3 px-3 py-2 ${i ? "border-t border-white/[0.09]" : ""}`}>
            <span className={`w-10 shrink-0 font-semibold ${k === "IF" ? "text-[#9ca3af]" : "text-[#a5b4fc]"}`}>{k}</span>
            <span className="text-[#e5e7eb]">{v}</span>
          </div>
        ))}
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-[#d1d5db]"><MessageSquare size={13} /> Message tone approved by you</p>
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
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">Connected to the tools you already use</p>
      <ol className="flex flex-col gap-1.5">
        {nodes.map(({ i: Icon, t }, idx) => (
          <li key={t} className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.09] bg-white/[0.04] text-[#d1d5db]"><Icon size={15} /></span>
            <span className="flex-1 rounded-md border border-white/[0.09] bg-white/[0.04] px-3 py-1.5 text-[12.5px] font-medium text-[#e5e7eb]">{t}</span>
            <span className="text-[11px] font-semibold text-emerald-300">{idx < 4 ? "Connected" : "Shadow test"}</span>
          </li>
        ))}
      </ol>
      <p className="text-[12px] font-medium text-[#d1d5db]">Read-only shadow test: 47 of 47 decisions matched your team</p>
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
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">Daily summary · 5:00 pm</p>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />All running</span>
      </div>
      {items.map((x) => (
        <div key={x.t} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.09] bg-white/[0.04] px-3 py-2">
          <span className="flex items-center gap-2 text-[12.5px] text-[#e5e7eb]">
            {x.ok ? <Check size={14} className="text-emerald-400" /> : <Clock size={14} className="text-amber-300" />}
            {x.t}
          </span>
          <span className="text-[12px] font-semibold tabular-nums text-[#d1d5db]">{x.s}</span>
        </div>
      ))}
      <p className="mt-1 text-[12px] font-medium text-[#d1d5db]">Rules tuned monthly from the exceptions</p>
    </div>
  );
}
