"use client";

import { track } from "@vercel/analytics";
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
import { ACCENT } from "@/components/site";
import { MONITOR_COPY } from "@/lib/monitor-copy";

const primaryButton =
  "inline-flex w-full items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto";

const panel =
  "mt-14 grid gap-px overflow-hidden rounded-xl border border-white/15 bg-white/15 shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:mt-16";

const cell = "bg-black p-6 text-left sm:p-8";

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
    <div className="max-w-3xl text-left">
      <p className="text-[13px] font-medium tracking-[-0.01em]" style={{ color: ACCENT }}>
        {eyebrow}
      </p>
      <h2 id={id} className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-balance sm:text-4xl">
        {title}
      </h2>
      {intro ? <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">{intro}</p> : null}
    </div>
  );
}

function StepIndex({ index }: { index: number }) {
  return (
    <span aria-hidden="true" className="text-[13px] font-medium tabular-nums" style={{ color: ACCENT }}>
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

function LineIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon size={20} strokeWidth={1.5} aria-hidden style={{ color: ACCENT }} />;
}

export default function FulfilmentSections() {
  return (
    <div id="how" className="bg-black text-white">
      <section id="how-it-works" aria-labelledby="how-it-works-title" className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            id="how-it-works-title"
            eyebrow="How it works"
            title="From checkout to doorstep, handled."
            intro="Here's what happens to every order once your team of agents is on the job."
          />
          <ol className={`${panel} list-none sm:grid-cols-2 lg:grid-cols-3`}>
            {HOW_IT_WORKS.map((step, index) => (
              <li key={step.title} className={cell}>
                <StepIndex index={index} />
                <h3 className="mt-4 text-base font-medium tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="agents" aria-labelledby="agents-title" className="border-t border-white/15 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            id="agents-title"
            eyebrow="Meet your agents"
            title="Meet your agents."
            intro="Each one has a single job, and does it the way your store does things."
          />
          <ul className={`${panel} list-none sm:grid-cols-2 lg:grid-cols-4`}>
            {AGENTS.map(({ icon, title, body }) => (
              <li key={title} className={cell}>
                <LineIcon icon={icon} />
                <h3 className="mt-5 text-[15px] font-medium tracking-[-0.02em]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="onboarding" aria-labelledby="onboarding-title" className="border-t border-white/15 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            id="onboarding-title"
            eyebrow="How we onboard you"
            title="How we get you set up."
            intro="No big switch-over. We build trust step by step."
          />
          <ol className={`${panel} list-none sm:grid-cols-2 lg:grid-cols-3`}>
            {ONBOARDING.map((step, index) => (
              <li key={step.title} className={cell}>
                <StepIndex index={index} />
                <h3 className="mt-4 text-base font-medium tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="safeguards" aria-labelledby="safeguards-title" className="border-t border-white/15 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="safeguards-title" eyebrow="Built-in safeguards" title="You stay in control." />
          <ul className={`${panel} list-none sm:grid-cols-2`}>
            {SAFEGUARDS.map(({ icon, title, body }) => (
              <li key={title} className={cell}>
                <LineIcon icon={icon} />
                <h3 className="mt-5 text-[15px] font-medium tracking-[-0.02em]">{title}:</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="demo" aria-labelledby="demo-title" className="border-t border-white/15 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl text-left">
          <h2 id="demo-title" className="max-w-3xl text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-balance sm:text-4xl">
            Ready to hand over the busywork?
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
            Tell us how your store ships today and we&apos;ll show you what your fulfilment team would look like.
          </p>
          <div className="mt-8">
            <a href="#audit" onClick={() => track("lead_audit_started")} className={primaryButton}>
              Book a free demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
