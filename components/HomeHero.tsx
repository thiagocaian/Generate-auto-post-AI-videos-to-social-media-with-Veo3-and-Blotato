"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { track } from "@vercel/analytics";
import { MapPin, Route, Tag, Truck, type LucideIcon } from "lucide-react";
import { ACCENT } from "@/components/site";

/**
 * Home hero copy switch.
 * "a" is the approved main version and the default.
 * "b" is the comparison headline, subheadline, and primary button.
 *
 * Preview without editing this file: `/?hero=b` (main version: `/?hero=a`).
 * A query value of "a" or "b" overrides the constant below.
 */
export const HERO_VARIANT_DEFAULT = "a" as const;
export type HeroVariant = "a" | "b";

const COPY: Record<HeroVariant, { lead: string; accent?: string; sub: string; cta: string }> = {
  a: {
    lead: "Get your fulfilment team.",
    accent: "AI agents working 24/7.",
    sub: "A dedicated team of AI agents that runs your orders from checkout to doorstep, day and night.",
    cta: "Get your free fulfilment audit",
  },
  b: {
    lead: "Your 24/7 AI operations team.",
    sub: "Specialist AI agents handle addresses, pickups, dispatch and post-shipping, so you can focus on growing.",
    cta: "Book a free demo",
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

const primaryButton =
  "inline-flex w-full items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto";

const secondaryButton =
  "inline-flex w-full items-center justify-center rounded-md border border-white/25 bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto";

export function HomeHeroContent({ variant }: { variant: HeroVariant }) {
  const copy = COPY[variant];
  return (
    <section aria-labelledby="home-hero-heading" className="relative isolate overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 15% -10%, rgba(91,92,246,0.22), transparent 55%), linear-gradient(180deg, #0a0a0a 0%, #000000 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative mx-auto max-w-6xl px-6 pb-20 pt-32 sm:pb-28 sm:pt-40"
      >
        <div className="text-left">
          <p className="text-[13px] font-medium tracking-[-0.01em]" style={{ color: ACCENT }}>
            AI fulfilment for online stores
          </p>
          <h1
            id="home-hero-heading"
            className="mt-5 max-w-5xl text-[1.7rem] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl lg:text-[4rem]"
          >
            <span className="block text-balance">{copy.lead}</span>
            {copy.accent ? (
              <span className="mt-1 block text-balance" style={{ color: ACCENT }}>
                {copy.accent}
              </span>
            ) : null}
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base leading-7 text-white/70 sm:text-lg">{copy.sub}</p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <a href="#audit" onClick={() => track("lead_audit_started")} className={primaryButton}>
              {copy.cta}
            </a>
            <a href="#how" className={secondaryButton}>
              See how it works
            </a>
          </div>
          <p className="mt-6 text-sm text-white/50">Live 24/7 · No hiring · Set up in days</p>
        </div>

        <div className="mt-16 border-t border-white/15 pt-12 lg:mt-20 lg:pt-16">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/15 bg-white/15 shadow-[0_1px_2px_rgba(0,0,0,0.45)] lg:grid-cols-4">
            {AGENTS.map(({ icon: Icon, title, text }) => (
              <article key={title} className="bg-black p-5 text-left sm:p-6">
                <Icon size={20} strokeWidth={1.5} aria-hidden style={{ color: ACCENT }} />
                <h2 className="mt-5 text-[15px] font-medium tracking-[-0.02em] text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </motion.div>
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
