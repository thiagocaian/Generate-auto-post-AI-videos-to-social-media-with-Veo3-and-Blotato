"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const WEEK = [
  { day: "Mon", time: "7:00 am", from: "Cytron", msg: "Weekend summary: 6 enquiries, 4 already booked, 2 quotes waiting for a price.", me: false },
  { day: "Tue", time: "6:42 pm", from: "Customer", msg: "Hi, called about a leaking tap, no answer?", reply: "Sorry we missed you, book a time here", me: true },
  { day: "Wed", time: "10:15 am", from: "Cytron", msg: "Friendly follow-up on Monday's quote sent. Customer accepted ✓", me: false },
  { day: "Thu", time: "2:30 pm", from: "Cytron", msg: "Job done. Invoice #1042 sent and synced to Xero before the van left.", me: false },
  { day: "Fri", time: "4:00 pm", from: "Cytron", msg: "3 review requests sent. 1 unhappy reply forwarded to you to sort personally.", me: false },
];

export default function WeekTimeline() {
  const reduced = useReducedMotion() === true;
  const fade = (delay = 0) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 8 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.6 }, transition: { duration: 0.35, delay } };

  return (
    <ol className="relative mt-10 space-y-6 before:absolute before:bottom-2 before:left-[22px] before:top-2 before:w-[2px] before:bg-[#e5e7eb]">
      {WEEK.map((w) => (
        <li key={w.day} className="relative flex gap-4 sm:gap-6">
          <motion.span
            {...fade()}
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[12px] font-semibold text-slate-800"
          >
            {w.day}
          </motion.span>
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {w.day} · {w.time}
            </p>
            <motion.div
              {...fade(0.1)}
              className={`max-w-md rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-[14.5px] leading-relaxed text-slate-800`}
            >
              <span className="mb-0.5 block text-[11px] font-semibold text-slate-600">{w.from}</span>
              {w.msg}
            </motion.div>
            {w.reply && (
              <motion.div
                {...fade(0.5)}
                className="ml-auto max-w-sm rounded-lg bg-[#5b5cf6] px-4 py-3 text-[14.5px] leading-relaxed text-white sm:ml-12"
              >
                <span className="mb-0.5 block text-[11px] font-semibold text-white/85">Auto-reply · 40s later</span>
                {w.reply}
              </motion.div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
