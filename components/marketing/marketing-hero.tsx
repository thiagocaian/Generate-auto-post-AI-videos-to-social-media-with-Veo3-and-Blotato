"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import HeroFlow, { HERO_FLOW_SUMMARY } from "@/components/marketing/hero-flow";

function fillAuditEmail(email: string) {
  const dest = document.getElementById("audit-email") as HTMLInputElement | null;
  if (!dest) return;
  const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  proto?.call(dest, email);
  dest.dispatchEvent(new Event("input", { bubbles: true }));
}

export default function MarketingHero({ artSrc }: { artSrc?: string | null }) {
  const reduced = useReducedMotion() === true;
  const sectionRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("");
  const [resolvedArt, setResolvedArt] = useState<string | null>(artSrc ?? null);

  useEffect(() => {
    if (artSrc) {
      setResolvedArt(artSrc);
      return;
    }
    let cancelled = false;
    fetch("/cytron-art/hero.png", { method: "HEAD" })
      .then((r) => {
        if (!cancelled && r.ok) setResolvedArt("/cytron-art/hero.png");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [artSrc]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const lift = useSpring(useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -36]), {
    stiffness: 120,
    damping: 24,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) fillAuditEmail(email);
    document.getElementById("audit")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-white to-[#f3f4f7]"
    >
      <div className="relative mx-auto flex max-w-6xl flex-col lg:min-h-[calc(90vh-4rem)] lg:flex-row lg:items-center">
        <div className="relative z-10 w-full px-5 pb-8 pt-14 lg:w-[46%] lg:py-16">
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-[clamp(2.25rem,8vw,3rem)] font-semibold leading-[1.05] tracking-tight text-slate-900 lg:text-[clamp(3.5rem,5.2vw,4.75rem)]"
          >
            Automate the busywork.
            <br />
            Keep the judgment.
          </motion.h1>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.4, ease: "easeOut" }}
            className="mt-5 max-w-md text-[17px] leading-relaxed text-slate-600 sm:text-lg"
          >
            Missed calls, bookings and invoices — handled. Your team only steps in when it matters.
          </motion.p>

          <motion.form
            onSubmit={onSubmit}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease: "easeOut" }}
            className="mt-8 flex w-full max-w-md items-center rounded-full border border-[#e5e7eb] bg-white p-1.5 shadow-sm"
          >
            <label htmlFor="hero-email" className="sr-only">
              Work email
            </label>
            <input
              id="hero-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-600 sm:px-4"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-[#5b5cf6] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#4f46e5] sm:px-5 sm:text-sm"
            >
              Book a free audit
            </button>
          </motion.form>

          <motion.a
            href="#walkthrough"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: "easeOut" }}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5b5cf6] transition-colors hover:text-[#4f46e5]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#c7c8f8] text-[#5b5cf6]">
              <Play size={11} fill="currentColor" />
            </span>
            See Cytron in action
          </motion.a>
        </div>

        <motion.div
          className="relative h-[28rem] w-full sm:h-[32rem] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[60%]"
          style={reduced ? undefined : { y: lift }}
        >
          <p className="sr-only">{HERO_FLOW_SUMMARY}</p>
          {resolvedArt ? (
            <Image
              src={resolvedArt}
              alt=""
              fill
              priority
              className="object-contain object-right"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center lg:items-center">
              <div className="h-full w-full lg:-translate-x-1">
                <HeroFlow reduced={reduced} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
