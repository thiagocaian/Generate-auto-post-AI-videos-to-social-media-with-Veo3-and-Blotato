"use client";

import React, { useEffect, useState } from "react";
import { CalendarCheck, Check, PhoneMissed } from "lucide-react";

/** Compact HTML/Tailwind UI fragments used by the bento grid and the walkthrough. */

export function MissedCallCard() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#e5e7eb] bg-[#f7f8fa] text-slate-700">
          <PhoneMissed size={18} />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-slate-900">Missed call</p>
          <p className="text-xs text-slate-600">Tue 6:42 pm · after hours</p>
        </div>
      </div>
      <div className="rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2.5">
        <p className="text-[13px] font-semibold text-slate-900">New customer</p>
        <p className="mt-0.5 text-xs text-slate-600">Unknown number · Burleigh Heads</p>
        <p className="mt-2 text-[13px] text-slate-700">No answer — the team was on a job.</p>
      </div>
      <p className="text-[12px] font-medium text-slate-700">Logged automatically · SMS sent in 40s</p>
    </div>
  );
}

export function SmsThread({
  text,
  cursor = false,
  booked = false,
}: {
  text: string;
  cursor?: boolean;
  booked?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="max-w-[90%] rounded-lg rounded-tl-sm border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2">
        <p className="text-[11px] font-semibold text-slate-600">Customer</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-slate-800">Hi, called about a leaking tap, no answer?</p>
      </div>
      {(text || cursor) && (
        <div className="ml-auto max-w-[90%] rounded-lg rounded-tr-sm bg-[#5b5cf6] px-3 py-2 text-white">
          <p className="text-[11px] font-semibold text-white">Auto-reply · 40s later</p>
          <p className="mt-0.5 text-[13px] leading-relaxed">
            {text}
            {cursor && <span className="ml-0.5 inline-block w-[1px] animate-pulse bg-white align-[-1px]" style={{ height: "0.9em" }} />}
          </p>
        </div>
      )}
      {booked && (
        <div className="max-w-[90%] rounded-lg rounded-tl-sm border border-emerald-200 bg-emerald-50 px-3 py-2">
          <p className="text-[11px] font-semibold text-emerald-800">Customer</p>
          <p className="mt-0.5 text-[13px] font-medium text-emerald-800">Booked Thu 9:00 am ✓</p>
        </div>
      )}
    </div>
  );
}

export function BookingCalendar() {
  const days = [
    { d: "Mon", n: "11", on: false },
    { d: "Tue", n: "12", on: false },
    { d: "Wed", n: "13", on: false },
    { d: "Thu", n: "14", on: true },
    { d: "Fri", n: "15", on: false },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-1.5">
        {days.map((day) => (
          <div
            key={day.d}
            className={`rounded-md border px-1 py-2 text-center ${
              day.on ? "border-[#5b5cf6] bg-white" : "border-[#e5e7eb] bg-[#f7f8fa]"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">{day.d}</p>
            <p className={`text-sm font-semibold ${day.on ? "text-[#5b5cf6]" : "text-slate-800"}`}>{day.n}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
          <CalendarCheck size={14} className="text-[#5b5cf6]" />
          Thu 9:00 am
        </p>
        <p className="mt-0.5 text-xs text-slate-600">Leaking tap · Burleigh Heads</p>
        <p className="mt-2 text-[12px] font-medium text-emerald-800">Booked ✓ · reminder scheduled</p>
      </div>
      <div className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2">
        <p className="text-[11px] font-semibold text-slate-600">Waitlist</p>
        <p className="mt-0.5 text-[12px] text-slate-700">Fri 11:00 am · 2 customers offered a cancelled slot</p>
      </div>
    </div>
  );
}

export function ReminderCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="ml-auto max-w-[95%] rounded-lg rounded-tr-sm bg-[#5b5cf6] px-3 py-2 text-white">
        <p className="text-[11px] font-semibold text-white">Reminder · day before</p>
        <p className="mt-0.5 text-[13px] leading-relaxed">See you tomorrow at 9:00 am, Burleigh Heads. Reply C to confirm.</p>
      </div>
      <div className="max-w-[80%] rounded-lg rounded-tl-sm border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2">
        <p className="text-[11px] font-semibold text-slate-600">Customer</p>
        <p className="mt-0.5 text-[13px] text-slate-800">C</p>
      </div>
      <p className="text-[12px] font-medium text-emerald-800">Confirmed by the customer ✓</p>
    </div>
  );
}

export function InvoicePaid() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-slate-900">Invoice #1042</p>
          <p className="text-xs text-slate-600">Leaking tap · Thu job</p>
        </div>
        <p className="text-lg font-semibold tabular-nums text-slate-900">$420</p>
      </div>
      <div className="space-y-1.5 text-[12px] text-slate-700">
        <p>Raised when the job was marked done</p>
        <p>Synced to Xero at 2:31 pm, before the van left</p>
        <p>Paid by card · link in the invoice SMS</p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12.5px] font-medium text-emerald-800">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-700 text-white">
          <Check size={13} strokeWidth={3} />
        </span>
        Paid ✓ · same day, by link
      </div>
    </div>
  );
}

export function QuoteFollowup() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-slate-900">Quote #887</p>
          <p className="text-xs text-slate-600">Hot water repair · Southport</p>
        </div>
        <p className="text-lg font-semibold tabular-nums text-slate-900">$860</p>
      </div>
      <ol className="space-y-1.5 text-[12px] text-slate-700">
        <li className="flex justify-between gap-3"><span>Mon 4:12 pm</span><span>Quote sent · SMS + email</span></li>
        <li className="flex justify-between gap-3"><span>Wed 10:15 am</span><span>Friendly follow-up</span></li>
        <li className="flex justify-between gap-3 font-medium text-emerald-800"><span>Wed 2:40 pm</span><span>Customer accepted ✓</span></li>
      </ol>
    </div>
  );
}

export function ReviewRequest() {
  return (
    <div className="flex flex-col gap-2">
      <div className="ml-auto max-w-[95%] rounded-lg rounded-tr-sm bg-[#5b5cf6] px-3 py-2 text-white">
        <p className="text-[11px] font-semibold text-white">After the job</p>
        <p className="mt-0.5 text-[13px] leading-relaxed">Thanks for having us today — if you have a moment, a review helps a lot.</p>
      </div>
      <div className="max-w-[90%] rounded-lg rounded-tl-sm border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2">
        <p className="text-[11px] font-semibold text-slate-600">Customer</p>
        <p className="mt-0.5 text-[13px] text-slate-800">On time and tidy, thanks.</p>
      </div>
      <p className="text-[12px] font-medium text-slate-700">
        5★ review posted · 1 unhappy reply forwarded to you, not online.
      </p>
    </div>
  );
}

export function MorningReport() {
  return (
    <div className="flex h-full flex-col gap-3 md:flex-row md:items-stretch md:gap-5">
      <div className="md:w-[42%] md:shrink-0">
        <div className="rounded-lg rounded-tr-sm border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2 md:ml-auto md:max-w-sm">
          <p className="text-[11px] font-semibold text-slate-600">You · 7:32 am</p>
          <p className="mt-0.5 text-[13px] text-slate-800">Who still owes us money?</p>
        </div>
      </div>
      <div className="min-w-0 flex-1 rounded-lg rounded-tl-sm border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2.5">
        <p className="text-[11px] font-semibold text-slate-600">Assistant · from your Xero</p>
        <p className="mt-0.5 text-[13px] font-medium text-slate-900">3 invoices overdue</p>
        <ul className="mt-1.5 space-y-1 text-[12px] text-slate-700">
          <li className="flex justify-between gap-3"><span>#1040 · Hart Plumbing</span><span className="tabular-nums">$180 · 12 days</span></li>
          <li className="flex justify-between gap-3"><span>#1036 · Mermaid Cafe</span><span className="tabular-nums">$640 · 21 days</span></li>
          <li className="flex justify-between gap-3"><span>#1031 · Burleigh Lots</span><span className="tabular-nums">$95 · 30 days</span></li>
        </ul>
      </div>
    </div>
  );
}

export function useTypedText(full: string, active: boolean, reduced: boolean, speed = 28) {
  const [text, setText] = useState(reduced ? full : "");
  useEffect(() => {
    if (reduced) {
      setText(full);
      return;
    }
    if (!active) {
      setText("");
      return;
    }
    setText("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setText(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [active, reduced, full, speed]);
  return text;
}
