"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import HeroFlow, { HERO_FLOW_SUMMARY } from "@/components/marketing/hero-flow";
import { useSiteNavigate } from "@/components/page-transition";

export default function MarketingHero({ artSrc }: { artSrc?: string | null }) {
  const reduced = useReducedMotion() === true;
  const sectionRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("");
  const navigate = useSiteNavigate();
  // Optional static art; the coded automation flow renders when none is passed.
  const resolvedArt = artSrc ?? null;

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
    navigate(email ? `/contact?email=${encodeURIComponent(email)}` : "/contact");
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-white to-[#f3f4f7]"
    >
      <div className="relative mx-auto flex max-w-6xl flex-col xl:min-h-[calc(90vh-4rem)] xl:flex-row xl:items-center">
        <div className="relative z-10 w-full px-5 pb-8 pt-14 md:pb-4 xl:w-[47%] xl:shrink-0 xl:py-16">
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-[clamp(2.25rem,8vw,3rem)] font-semibold leading-[1.05] tracking-tight text-slate-900 lg:text-[clamp(3.5rem,5.2vw,4.75rem)] xl:text-[clamp(3.5rem,4.4vw,4.25rem)]"
          >
            Automate the repetitive.
            <br />
            Decide what matters.
          </motion.h1>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.4, ease: "easeOut" }}
            className="mt-5 max-w-md text-[17px] leading-relaxed text-slate-600 sm:text-lg"
          >
            Cytron runs on smart automation: less manual work, more time for what drives results.
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
          className="relative w-full px-5 pb-12 pt-2 md:pb-16 xl:min-w-0 xl:flex-1 xl:py-16 xl:pl-6"
          style={reduced ? undefined : { y: lift }}
        >
          <p className="sr-only">{HERO_FLOW_SUMMARY}</p>
          {resolvedArt ? (
            <Image
              src={resolvedArt}
              alt=""
              width={1280}
              height={880}
              priority
              className="h-auto w-full object-contain"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          ) : (
            <HeroFlow reduced={reduced} />
          )}
        </motion.div>
      </div>
    </section>
  );
}
