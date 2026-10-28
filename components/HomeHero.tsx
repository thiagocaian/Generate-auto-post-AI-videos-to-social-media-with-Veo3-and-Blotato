"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Route, Tag, Truck, type LucideIcon } from "lucide-react";
import LedTunnel from "@/components/LedTunnel";
import { ACCENT, cta, GRADIENT } from "@/components/site";

/**
 * Home hero copy switch.
 * "a" is the approved main version and the default.
 * "b" is the comparison headline and subheadline.
 *
 * Preview without editing this file: `/?hero=b` (main version: `/?hero=a`).
 * A query value of "a" or "b" overrides the constant below.
 */
export const HERO_VARIANT_DEFAULT = "a" as const;
export type HeroVariant = "a" | "b";

const COPY: Record<HeroVariant, { lead: string; accent?: string; sub: string }> = {
  a: {
    lead: "Get your fulfilment team.",
    accent: "AI agents working 24/7.",
    sub: "A dedicated team of AI agents that runs your orders from checkout to doorstep, day and night.",
  },
  b: {
    lead: "Your 24/7 AI operations team.",
    sub: "Specialist AI agents handle addresses, pickups, dispatch and post-shipping, so you can focus on growing.",
  },
};

const AGENTS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: MapPin, title: "Addresses", text: "Checks and fixes every delivery address before it ships." },
  { icon: Truck, title: "Pickup", text: "Books courier pickups on time, every time." },
  { icon: Tag, title: "Dispatch", text: "Prepares labels and gets orders out the door." },
  { icon: Route, title: "Post-shipping", text: "Tracks deliveries and keeps customers updated." },
];

function resolveHeroVariant(query: string | null): HeroVariant {
  if (query === "a" || query === "b") return query;
  return HERO_VARIANT_DEFAULT;
}

export function HomeHeroContent({ variant }: { variant: HeroVariant }) {
  const copy = COPY[variant];
  return (
    <section aria-labelledby="home-hero-heading" className="relative isolate overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40">
      <LedTunnel />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5b5cf6]/15 bg-[#5b5cf6]/[0.06] px-3 py-1 text-[13px] font-medium"
            style={{ color: ACCENT }}
          >
            <span className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: "currentColor" }} />
            AI fulfilment for online stores
          </motion.p>
          <motion.h1
            id="home-hero-heading"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-balance text-[30px] font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-[46px] lg:text-[56px]"
          >
            <span className="block">{copy.lead}</span>
            {copy.accent ? (
              <span className="mt-1 block" style={{ color: ACCENT }}>
                {copy.accent}
              </span>
            ) : null}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0"
          >
            {copy.sub}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-8 flex flex-col items-center gap-3 lg:flex-row lg:items-center lg:justify-start"
          >
            {cta("Book a free demo")}
            <a href="#how" className="group inline-flex items-center gap-1 px-2 py-2 text-[15px] font-semibold" style={{ color: ACCENT }}>
              See how it works
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>
          <p className="mt-6 text-sm text-slate-500">Live 24/7 · No hiring · Set up in days</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-16 lg:grid-cols-4">
          {AGENTS.map(({ icon: Icon, title, text }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + i * 0.06 }}
              className="rounded-3xl border border-white bg-white/80 p-4 text-left shadow-[0_20px_50px_-30px_rgba(40,60,120,0.35)] backdrop-blur-xl sm:p-6"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-[0_0_20px_rgba(91,92,246,0.45)] sm:mb-5 sm:h-11 sm:w-11"
                style={{ background: GRADIENT }}
              >
                <Icon size={18} aria-hidden />
              </div>
              <h2 className="mb-1.5 text-[15px] font-semibold text-slate-900 sm:text-lg">{title}</h2>
              <p className="text-[13px] leading-snug text-slate-600 sm:text-[15px] sm:leading-relaxed">{text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeHeroFromQuery() {
  const params = useSearchParams();
  return <HomeHeroContent variant={resolveHeroVariant(params.get("hero"))} />;
}

export default function HomeHero() {
  return (
    <Suspense fallback={<HomeHeroContent variant={HERO_VARIANT_DEFAULT} />}>
      <HomeHeroFromQuery />
    </Suspense>
  );
}
