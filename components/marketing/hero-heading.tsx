"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, Clock } from "lucide-react";
import { Accent } from "@/components/site";

function Chip({
  delay,
  reduced,
  className,
  children,
}: {
  delay: number;
  reduced: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.span
      aria-hidden="true"
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : delay, duration: reduced ? 0 : 0.35, ease: "easeOut" }}
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium leading-none sm:text-xs ${className ?? ""}`}
    >
      {children}
    </motion.span>
  );
}

export default function HeroHeading() {
  const reduced = useReducedMotion() === true;

  return (
    <h1 className="max-w-xl text-[28px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[40px] lg:text-[44px]">
      <span className="sr-only">Automate the busywork. Keep the judgment.</span>
      <span aria-hidden="true" className="block">
        <span className="block">
          <Accent>Automate</Accent> the busywork.
        </span>
        <span className="block">Keep the judgment.</span>
        <span className="mt-3 flex flex-wrap items-center gap-2 text-[16px] font-semibold leading-none sm:mt-4 sm:text-lg">
          <Chip
            delay={0.28}
            reduced={reduced}
            className="rounded-lg rounded-bl-sm border border-[#e5e7eb] bg-[#f7f8fa] px-2 py-1.5 text-slate-700"
          >
            Sorry we missed you…
          </Chip>
          <Chip
            delay={0.42}
            reduced={reduced}
            className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-emerald-800"
          >
            <CalendarCheck size={12} strokeWidth={2.25} />
            Booked ✓
          </Chip>
          <Chip
            delay={0.56}
            reduced={reduced}
            className="rounded-md border border-[#e5e7eb] bg-white px-2 py-1.5 text-slate-700"
          >
            <Clock size={12} strokeWidth={2.25} />
            40s
          </Chip>
        </span>
      </span>
    </h1>
  );
}
