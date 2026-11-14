"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Accent, Eyebrow, Heading } from "@/components/site";
import {
  BookingCalendar,
  InvoicePaid,
  MorningReport,
  QuoteFollowup,
  ReviewRequest,
  SmsThread,
} from "@/components/marketing/ui-fragments";

const TILES = [
  {
    id: "sms",
    title: "Missed calls & new enquiries",
    text: "Every call, web form and message gets an instant reply, the details captured and a booking link sent.",
    span: "md:col-span-7",
    /* Tighter than before: three bubbles should fill ~70–80% of this box */
    aspect: "aspect-[5/4] md:aspect-[16/10]",
    fragment: <SmsThread text="Sorry we missed you, book a time here" booked />,
  },
  {
    id: "booking",
    title: "Bookings, reminders & no-shows",
    text: "Confirmations, reminders and easy rescheduling, plus a waitlist that fills cancelled slots.",
    span: "md:col-span-5",
    aspect: "aspect-[5/4] md:aspect-[16/10]",
    fragment: <BookingCalendar />,
  },
  {
    id: "quote",
    title: "Quotes & follow-up",
    text: "Quotes drafted from the job details, sent the same day and followed up politely.",
    span: "md:col-span-4",
    aspect: "aspect-[5/4] md:aspect-[4/3]",
    fragment: <QuoteFollowup />,
  },
  {
    id: "invoice",
    title: "Invoices & getting paid",
    text: "Invoices raised when the job is done, synced to Xero or MYOB, with reminders until they're paid.",
    span: "md:col-span-4",
    aspect: "aspect-[5/4] md:aspect-[4/3]",
    fragment: <InvoicePaid />,
  },
  {
    id: "review",
    title: "Reviews & repeat customers",
    text: "A review request after a good job. Unhappy replies go to you, not online.",
    span: "md:col-span-4",
    aspect: "aspect-[5/4] md:aspect-[4/3]",
    fragment: <ReviewRequest />,
  },
  {
    id: "report",
    title: "Reports & AI assistant",
    text: "A short summary every morning, and an assistant your team can ask from your own systems.",
    span: "md:col-span-12",
    aspect: "min-h-[13rem]",
    fragment: <MorningReport />,
  },
] as const;

export default function ServicesBento() {
  const reduced = useReducedMotion() === true;
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.12 });

  return (
    <section id="services" className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <Eyebrow>What we automate</Eyebrow>
        <Heading>The work nobody hired you to do.</Heading>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
          If a task follows the same steps every day, it can usually run on its own. These are the ones we build most.
        </p>

        <div ref={gridRef} className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-12">
          {TILES.map((tile, i) => (
            <motion.article
              key={tile.id}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={reduced || inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: reduced ? 0 : i * 0.07, duration: 0.35, ease: "easeOut" }}
              className={`${tile.span} flex flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow`}
            >
              <div className={`${tile.aspect} overflow-hidden p-4 sm:p-5`}>{tile.fragment}</div>
              <div className="border-t border-[#e5e7eb] px-4 py-3 sm:px-5">
                <h3 className="text-[15px] font-semibold text-slate-900">{tile.title}</h3>
                <p className="mt-1 hidden text-[13px] leading-relaxed text-slate-600 sm:block">{tile.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
