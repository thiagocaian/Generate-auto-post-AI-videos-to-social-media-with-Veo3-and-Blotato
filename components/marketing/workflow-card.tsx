"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  BellRing,
  CalendarCheck,
  Check,
  MessageSquare,
  PhoneCall,
  Receipt,
} from "lucide-react";
import { ACCENT } from "@/components/site";

const STEPS = [
  { icon: PhoneCall, label: "Missed call from a new customer", baseDetail: "Tue 6:42 pm · after hours" },
  { icon: MessageSquare, label: "Text reply sent in 40 seconds", sms: "Sorry we missed you, book a time here" },
  { icon: CalendarCheck, label: "Job booked into the calendar", baseDetail: "Thu 9:00 am · Burleigh Heads" },
  { icon: BellRing, label: "Reminder sent the day before", baseDetail: "Confirmed by the customer" },
  { icon: Receipt, label: "Invoice sent and synced to Xero", baseDetail: "Paid by link · same day" },
] as const;

const HOLD_MS = [1200, 2400, 1100, 1100, 1100, 2200];

function usePrefersReduced() {
  const hook = useReducedMotion();
  return hook === true;
}

export default function WorkflowCard() {
  const reduced = usePrefersReduced();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const [step, setStep] = useState(0); // 0-4 active step, 5 = paid
  const [sms, setSms] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [clock, setClock] = useState("Tue 6:42:00 pm");

  // Reset / freeze for reduced motion
  useEffect(() => {
    if (reduced) {
      setStep(5);
      setSms("Sorry we missed you, book a time here");
      setSeconds(40);
      setClock("Tue 6:42:40 pm");
    }
  }, [reduced]);

  // Main loop — pauses when off-screen
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    let smsInterval: ReturnType<typeof setInterval> | undefined;
    let tickInterval: ReturnType<typeof setInterval> | undefined;

    const run = (current: number) => {
      if (cancelled) return;
      if (!inViewRef.current) {
        timeout = setTimeout(() => run(current), 200);
        return;
      }

      setStep(current);

      if (current === 0) {
        setSms("");
        setSeconds(0);
        setClock("Tue 6:42:00 pm");
      }

      if (current === 1) {
        const text = "Sorry we missed you, book a time here";
        let i = 0;
        setSms("");
        setSeconds(0);
        smsInterval = setInterval(() => {
          i += 1;
          setSms(text.slice(0, i));
          if (i >= text.length && smsInterval) clearInterval(smsInterval);
        }, 36);
        let s = 0;
        tickInterval = setInterval(() => {
          s = Math.min(40, s + 1);
          setSeconds(s);
          const sec = String(s).padStart(2, "0");
          setClock(`Tue 6:42:${sec} pm`);
          if (s >= 40 && tickInterval) clearInterval(tickInterval);
        }, 55);
      }

      const hold = HOLD_MS[current] ?? 1200;
      timeout = setTimeout(() => {
        const next = current >= 5 ? 0 : current + 1;
        run(next);
      }, hold);
    };

    run(0);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (smsInterval) clearInterval(smsInterval);
      if (tickInterval) clearInterval(tickInterval);
    };
  }, [reduced]);

  const progress = Math.min(1, step / (STEPS.length - 1));
  const paid = step >= 5;

  return (
    <div
      ref={rootRef}
      className="relative w-full max-w-md rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm sm:p-5"
      aria-label="Enquiry to invoice, live demonstration"
    >
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#5b5cf6]" />
          Enquiry to invoice · live
        </div>
        <span className="text-[11px] font-medium tabular-nums text-slate-600">
          {clock}
        </span>
      </div>

      <ul className="relative space-y-2">
        <div className="pointer-events-none absolute bottom-5 left-[18px] top-5 w-[2px] rounded-full bg-slate-200" aria-hidden>
          <motion.div
            className="w-full rounded-full origin-top"
            style={{ background: paid ? "#059669" : ACCENT }}
            animate={{ height: `${progress * 100}%` }}
            transition={reduced ? { duration: 0 } : { duration: 0.55, ease: "easeInOut" }}
          />
        </div>

        {STEPS.map((s, i) => {
          const done = i < step || paid;
          const active = i === step && !paid;
          const Icon = s.icon;
          const detail = i === 1
            ? (sms ? `“${sms}${active && sms.length < 36 ? "▍" : ""}”` : active ? "Writing a reply…" : "“Sorry we missed you, book a time here”")
            : ("baseDetail" in s ? s.baseDetail : "");
          const smsLabel = i === 1 && (active || done) && seconds ? ` · ${seconds}s` : "";

          return (
            <li key={s.label}>
              <motion.div
                className={`relative flex items-center gap-3 rounded-lg border px-3 py-1.5 sm:py-2.5 ${
                  done
                    ? "border-[#e5e7eb] bg-white"
                    : active
                      ? "border-[#5b5cf6] bg-white"
                      : "border-transparent bg-[#f7f8fa]"
                }`}
              >
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md sm:h-9 sm:w-9 ${
                    done ? "bg-emerald-50 text-emerald-700" : active ? "text-white" : "bg-slate-100 text-slate-500"
                  }`}
                  style={active ? { background: ACCENT } : undefined}
                >
                  {done ? <Check size={17} /> : <Icon size={17} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-slate-900 sm:truncate sm:text-[13.5px]">{s.label}{smsLabel && <span className="font-medium text-slate-600">{smsLabel}</span>}</p>
                  <p className={`text-[12px] text-slate-600 ${active && i === 1 ? "whitespace-normal" : "truncate"}`}>{detail}</p>
                </div>
              </motion.div>
            </li>
          );
        })}
      </ul>

      <div className="mt-2 min-h-[48px] sm:mt-3 sm:min-h-[52px]">
        <AnimatePresence>
          {paid && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[12.5px] font-medium text-emerald-800"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-white">
                <Check size={16} strokeWidth={3} />
              </span>
              <span>
                <span className="font-semibold">Paid ✓</span> · Booked, reminded and paid while the team was on the tools.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
