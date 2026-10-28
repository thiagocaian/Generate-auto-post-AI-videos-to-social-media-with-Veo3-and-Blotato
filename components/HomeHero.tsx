"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { MapPin, Route, Tag, Truck, type LucideIcon } from "lucide-react";
import { ACCENT } from "@/components/site";

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

const primaryButton =
  "inline-flex w-full max-w-xs items-center justify-center rounded-lg bg-[#5b5cf6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4e4fe0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b5cf6] lg:w-auto lg:max-w-none";

const secondaryButton =
  "inline-flex w-full max-w-xs items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b5cf6] lg:w-auto lg:max-w-none";

export function HomeHeroContent({ variant }: { variant: HeroVariant }) {
  const copy = COPY[variant];
  return (
    <section aria-labelledby="home-hero-heading" className="border-b border-slate-200/80 bg-[#f4f7fb] pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
          <p className="text-[13px] font-medium tracking-wide" style={{ color: ACCENT }}>
            AI fulfilment for online stores
          </p>
          <h1
            id="home-hero-heading"
            className="mt-4 text-balance text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.02em] text-slate-950 sm:text-[2.5rem] lg:text-[2.75rem]"
          >
            <span className="block">{copy.lead}</span>
            {copy.accent ? (
              <span className="mt-1 block" style={{ color: ACCENT }}>
                {copy.accent}
              </span>
            ) : null}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-7 text-slate-600 lg:mx-0 lg:text-[17px]">
            {copy.sub}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 lg:flex-row lg:justify-start">
            <a href="#audit" onClick={() => track("lead_audit_started")} className={primaryButton}>
              Book a free demo
            </a>
            <a href="#how" className={secondaryButton}>
              See how it works
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-500">Live 24/7 · No hiring · Set up in days</p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 lg:mt-20 lg:grid-cols-4 lg:gap-6">
          {AGENTS.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:p-6"
            >
              <Icon size={22} strokeWidth={1.5} aria-hidden style={{ color: ACCENT }} />
              <h2 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
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
