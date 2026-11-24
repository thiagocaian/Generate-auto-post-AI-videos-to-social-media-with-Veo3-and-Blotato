"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const WEEK = [
  { day: "Mon", time: "7:00 am", from: "Cytron", msg: "Overnight orders checked. Unclear addresses are held for the office.", me: false },
  { day: "Tue", time: "9:10 am", from: "Buyer", msg: "Where is our wholesale order?", reply: "It's packed. Here's the tracking.", me: true },
  { day: "Wed", time: "10:15 am", from: "Cytron", msg: "A repeat order matched the account and was released to pick.", me: false },
  { day: "Thu", time: "2:30 pm", from: "Cytron", msg: "Dispatch paperwork is ready. The invoice is synced to Xero.", me: false },
  { day: "Fri", time: "4:00 pm", from: "Cytron", msg: "Office summary: what shipped, what's held, and what to reorder.", me: false },
];

export default function WeekTimeline() {
  const reduced = useReducedMotion() === true;
  const fade = (delay = 0) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 8 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.6 }, transition: { duration: 0.35, delay } };

  return (
    <ol className="relative mt-10 space-y-6 before:absolute before:bottom-2 before:left-[22px] before:top-2 before:w-[2px] before:bg-[#e7e6f0]">
      {WEEK.map((w) => (
        <li key={w.day} className="relative flex gap-4 sm:gap-6">
          <motion.span
            {...fade()}
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#e7e6f0] bg-white text-[12px] font-semibold text-[#1a1d33]"
          >
            {w.day}
          </motion.span>
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#4b5067]">
              {w.day} · {w.time}
            </p>
            <motion.div
              {...fade(0.1)}
              className={`max-w-md rounded-lg border border-[#e7e6f0] bg-white px-4 py-3 text-[14.5px] leading-relaxed text-[#1a1d33]`}
            >
              <span className="mb-0.5 block text-[11px] font-semibold text-[#4b5067]">{w.from}</span>
              {w.msg}
            </motion.div>
            {w.reply && (
              <motion.div
                {...fade(0.5)}
                className="ml-auto max-w-sm rounded-lg bg-[#3f37a2] px-4 py-3 text-[14.5px] leading-relaxed text-white sm:ml-12"
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
