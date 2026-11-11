"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Check } from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";
import {
  BookingCalendar,
  InvoicePaid,
  MissedCallCard,
  ReminderCard,
  SmsThread,
  useTypedText,
} from "@/components/marketing/ui-fragments";

const STEPS = [
  { id: "missed", label: "Missed call", detail: "A new customer rings after hours. Nobody is there to pick up." },
  { id: "sms", label: "SMS reply", detail: "A text goes out in 40 seconds, in your tone, with a booking link." },
  { id: "booked", label: "Booked in the calendar", detail: "They pick a time. It lands in the diary — no phone tag." },
  { id: "reminder", label: "Reminder", detail: "The day before, they get a reminder and confirm with one reply." },
  { id: "paid", label: "Invoice paid ✓", detail: "The job is invoiced, synced to Xero, and paid by link the same day." },
] as const;

const SMS = "Sorry we missed you, book a time here";

function WalkthroughHeader() {
  return (
    <div className="max-w-3xl">
      <Eyebrow>Enquiry to invoice</Eyebrow>
      <Heading>
        Automate the repetitive. Decide <Accent>what matters</Accent>.
      </Heading>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
        Cytron runs on smart automation: less manual work, more time for what drives results.
      </p>
    </div>
  );
}

function StepCard({ index, reduced }: { index: number; reduced: boolean }) {
  const typing = index === 1;
  const text = useTypedText(SMS, typing, reduced || index > 1, 28);
  const showCursor = typing && !reduced && text.length < SMS.length;
  const booked = index > 1 || reduced || (index === 1 && text.length >= SMS.length);

  const inner =
    index === 0 ? (
      <MissedCallCard />
    ) : index === 1 ? (
      <SmsThread text={index > 1 || reduced ? SMS : text} cursor={showCursor} booked={booked} />
    ) : index === 2 ? (
      <BookingCalendar />
    ) : index === 3 ? (
      <ReminderCard />
    ) : (
      <InvoicePaid />
    );

  return (
    <div className="flex h-full min-h-[22rem] flex-col rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-7">
      <p className="mb-5 text-sm font-semibold text-slate-800">{STEPS[index].label}</p>
      <div className="flex flex-1 flex-col justify-center">{inner}</div>
    </div>
  );
}

function StepList({
  active,
  onSelect,
  clickable,
}: {
  active: number;
  onSelect?: (i: number) => void;
  clickable?: boolean;
}) {
  return (
    <ol className="relative space-y-1">
      {STEPS.map((s, i) => {
        const done = i < active;
        const current = i === active;
        const Tag = clickable ? "button" : "div";
        return (
          <li key={s.id}>
            <Tag
              {...(clickable ? { type: "button" as const } : {})}
              onClick={clickable && onSelect ? () => onSelect(i) : undefined}
              aria-current={current ? "step" : undefined}
              className={`flex w-full gap-3 rounded-lg px-2 py-2.5 text-left transition-colors ${
                current ? "bg-white" : "bg-transparent"
              } ${clickable ? "cursor-pointer hover:bg-white" : ""}`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ${
                  done
                    ? "bg-emerald-700 text-white"
                    : current
                      ? "bg-[#5b5cf6] text-white"
                      : "border border-[#e5e7eb] bg-white text-slate-700"
                }`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className={`block text-[15px] font-semibold ${current || done ? "text-slate-900" : "text-slate-700"}`}>
                  {s.label}
                </span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-slate-600">{s.detail}</span>
              </span>
            </Tag>
          </li>
        );
      })}
    </ol>
  );
}

function DesktopWalkthrough() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const stepProgress = useTransform(scrollYProgress, [0, 1], [0, STEPS.length - 0.001]);
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [active, setActive] = useState(0);

  useMotionValueEvent(stepProgress, "change", (v) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v)));
    setActive((prev) => (prev === next ? prev : next));
  });

  const scrollToStep = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const n = Math.max(1, STEPS.length - 1);
    const start = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: start + (i / n) * range, behavior: "smooth" });
  };

  return (
    <div ref={trackRef} data-walkthrough-track className="relative h-[300vh]">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-center">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="mb-8">
            <WalkthroughHeader />
          </div>
          <div className="grid grid-cols-[0.9fr_1.1fr] items-stretch gap-12">
            <div className="relative pl-1">
              <div className="pointer-events-none absolute bottom-3 left-[22px] top-3 w-px bg-[#e5e7eb]" aria-hidden />
              <motion.div
                className="pointer-events-none absolute left-[22px] top-3 w-px origin-top bg-[#5b5cf6]"
                style={{ height: lineHeight }}
                aria-hidden
              />
              <StepList active={active} onSelect={scrollToStep} clickable />
            </div>
            <div className="relative min-h-[22rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="h-full"
                >
                  <StepCard index={active} reduced={false} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileStep({ index }: { index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { amount: 0.45, once: true });
  const reduced = useReducedMotion() === true;
  const show = reduced || inView;
  const s = STEPS[index];

  return (
    <motion.li
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <p className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-slate-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#5b5cf6] text-[11px] font-semibold text-white">
          {index + 1}
        </span>
        {s.label}
      </p>
      <p className="mb-3 text-[13px] leading-relaxed text-slate-600">{s.detail}</p>
      {show ? <StepCard index={index} reduced={reduced} /> : <div className="h-40" aria-hidden />}
    </motion.li>
  );
}

function MobileWalkthrough() {
  return (
    <ol className="mt-10 space-y-10">
      {STEPS.map((s, i) => (
        <MobileStep key={s.id} index={i} />
      ))}
    </ol>
  );
}

function StaticWalkthrough() {
  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-2">
      <StepList active={STEPS.length - 1} />
      <div className="space-y-5">
        {STEPS.map((s, i) => (
          <StepCard key={s.id} index={i} reduced />
        ))}
      </div>
    </div>
  );
}

export default function Walkthrough() {
  const reduced = useReducedMotion() === true;

  return (
    <section id="walkthrough" aria-label="From missed call to paid invoice" className="bg-[#f7f8fa]">
      {reduced ? (
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <WalkthroughHeader />
          <StaticWalkthrough />
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <DesktopWalkthrough />
          </div>
          <div className="mx-auto max-w-6xl px-5 py-16 lg:hidden">
            <WalkthroughHeader />
            <MobileWalkthrough />
          </div>
        </>
      )}
    </section>
  );
}
