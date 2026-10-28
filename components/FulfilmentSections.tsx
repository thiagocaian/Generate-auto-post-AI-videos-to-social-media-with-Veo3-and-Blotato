"use client";

import {
  BellRing,
  Eye,
  MapPin,
  Package,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { cta, Eyebrow, GRADIENT, LILAC } from "@/components/site";
import { MONITOR_COPY } from "@/lib/monitor-copy";

const card =
  "h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:border-[#8b8cff]/40 hover:bg-white/[0.07]";

const HOW_IT_WORKS = [
  {
    title: "Order comes in.",
    body: "New orders flow straight from your Shopify store.",
  },
  {
    title: "Address checked.",
    body: "AI reviews every delivery address. Anything that looks off goes to a person for review, not straight to the courier.",
  },
  {
    title: "Courier chosen.",
    body: "Your rules decide: express orders go on the fastest priority service, everything else on the best-value option. International, missing shipping methods and Click & Collect are flagged for a human.",
  },
  {
    title: "Box picked.",
    body: "The right carton is chosen from the product's shape, with weights set per product.",
  },
  {
    title: "Label created.",
    body: "The shipping label is generated in StarShipIt and the order is marked as packed.",
  },
  {
    title: "Label printed.",
    body: "It prints automatically on your label printer, ready to stick on.",
  },
  {
    title: "Pickup booked.",
    body: "Your courier pickup is scheduled without anyone picking up the phone.",
  },
  {
    title: "Delivery tracked.",
    body: "We follow each parcel and keep your customer posted along the way.",
  },
  MONITOR_COPY.step,
] as const;

const AGENTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: MapPin,
    title: "Addresses",
    body: "Checks every delivery address and flags the dodgy ones before they cost you a return.",
  },
  {
    icon: Truck,
    title: "Pickup",
    body: "Books courier pickups so parcels leave on time.",
  },
  {
    icon: Package,
    title: "Dispatch",
    body: "Picks the courier and the box, creates the label and sends it to the printer.",
  },
  {
    icon: Route,
    title: "Post-shipping",
    body: "Tracks deliveries and keeps your customers in the loop.",
  },
];

const ONBOARDING = [
  {
    title: "Have a chat.",
    body: "We map your products, couriers and the rules you already follow.",
  },
  {
    title: "Build your team.",
    body: "We set up a dedicated team of agents with your store's rules.",
  },
  {
    title: "Test properly.",
    body: "Full end-to-end runs in test mode. No real orders touched.",
  },
  {
    title: "Shadow mode.",
    body: "The agents make their calls alongside your team, and we compare the two before anything goes live.",
  },
  {
    title: "Go live.",
    body: "Continuous monitoring, with a person reviewing every exception.",
  },
  {
    title: "Keep improving.",
    body: "We fine-tune the rules as your store changes.",
  },
] as const;

const SAFEGUARDS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: "Human review",
    body: "Anything unusual (a doubtful address, an international order, a missing shipping method) goes to a person, not a guess.",
  },
  {
    icon: Eye,
    title: "Test mode first",
    body: "Everything is proven on test runs before it touches a real order.",
  },
  { icon: BellRing, ...MONITOR_COPY.safeguard },
  {
    icon: SlidersHorizontal,
    title: "Your rules, your call",
    body: "You decide how orders are handled, and you can change it anytime.",
  },
];

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div
      className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_0_24px_rgba(124,125,255,0.55)]"
      style={{ background: GRADIENT }}
    >
      <Icon size={20} aria-hidden />
    </div>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="max-w-3xl">
      <Eyebrow dark>{eyebrow}</Eyebrow>
      <h2 id={id} className="text-3xl font-semibold leading-tight tracking-tight sm:text-[42px]">
        {title}
      </h2>
      {intro ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">{intro}</p> : null}
    </div>
  );
}

export default function FulfilmentSections() {
  return (
    <div id="how" className="relative bg-[#050507] text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(91,92,246,0.28),transparent_62%)]"
        aria-hidden
      />

      <section id="how-it-works" aria-labelledby="how-it-works-title" className="relative px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            id="how-it-works-title"
            eyebrow="How it works"
            title="From checkout to doorstep, handled."
            intro="Here's what happens to every order once your team of agents is on the job."
          />
          <ol className="mt-12 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_IT_WORKS.map((step, index) => (
              <li key={step.title} className={card}>
                <span
                  aria-hidden="true"
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm font-semibold"
                  style={{ color: LILAC }}
                >
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/65">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="agents" aria-labelledby="agents-title" className="relative border-t border-white/10 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            id="agents-title"
            eyebrow="Meet your agents"
            title="Meet your agents."
            intro="Each one has a single job, and does it the way your store does things."
          />
          <ul className="mt-12 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AGENTS.map(({ icon, title, body }) => (
              <li key={title} className={card}>
                <IconTile icon={icon} />
                <h3 className="mb-2 mt-5 text-lg font-semibold">{title}</h3>
                <p className="text-[15px] leading-relaxed text-white/65">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="onboarding" aria-labelledby="onboarding-title" className="relative border-t border-white/10 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            id="onboarding-title"
            eyebrow="How we onboard you"
            title="How we get you set up."
            intro="No big switch-over. We build trust step by step."
          />
          <ol className="mt-12 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ONBOARDING.map((step, index) => (
              <li key={step.title} className={card}>
                <span
                  aria-hidden="true"
                  className="mb-4 block bg-clip-text text-3xl font-semibold text-transparent"
                  style={{ backgroundImage: GRADIENT }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/65">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="safeguards" aria-labelledby="safeguards-title" className="relative border-t border-white/10 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="safeguards-title" eyebrow="Built-in safeguards" title="You stay in control." />
          <ul className="mt-12 grid list-none gap-5 sm:grid-cols-2">
            {SAFEGUARDS.map(({ icon, title, body }) => (
              <li key={title} className={`${card} flex gap-4`}>
                <div className="shrink-0">
                  <IconTile icon={icon} />
                </div>
                <div className="min-w-0">
                <h3 className="text-lg font-semibold">{title}:</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/65">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="demo" aria-labelledby="demo-title" className="relative isolate overflow-hidden border-t border-white/10 px-5 py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(91,92,246,0.22),transparent_62%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 id="demo-title" className="text-3xl font-semibold leading-tight tracking-tight sm:text-[46px]">
            Ready to hand over the busywork?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Tell us how your store ships today and we&apos;ll show you what your fulfilment team would look like.
          </p>
          <div className="mt-9 flex justify-center">{cta("Book a free demo")}</div>
        </div>
      </section>
    </div>
  );
}
