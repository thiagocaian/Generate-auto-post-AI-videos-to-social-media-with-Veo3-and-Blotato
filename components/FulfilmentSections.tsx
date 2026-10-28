"use client";

import { track } from "@vercel/analytics";
import { motion, useReducedMotion } from "framer-motion";
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

const auditButton =
  "inline-flex w-full items-center justify-center rounded-md bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:w-auto";

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
    title: "Tell us about your store.",
    body: "Fill in a short form. It takes a couple of minutes.",
  },
  {
    title: "Get your free audit.",
    body: "One of our agents gets back to you and looks at how you ship today: order volume, couriers and where things slow down.",
  },
  {
    title: "See your plan.",
    body: "You get a clear summary with the team of agents we'd set up for your store.",
  },
  {
    title: "Talk to our team.",
    body: "Only then do you chat with a person, to go over the plan and your questions.",
  },
  {
    title: "Test properly.",
    body: "We build your team and run it end to end in test mode. No real orders touched.",
  },
  {
    title: "Shadow mode.",
    body: "The agents make their calls alongside your team, and we compare the two before anything goes live.",
  },
  MONITOR_COPY.goLive,
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

function FineGrid({ tone }: { tone: "light" | "dark" }) {
  const line = tone === "light" ? "rgba(91,92,246,0.09)" : "rgba(255,255,255,0.07)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_32%,transparent_78%)]"
      style={{
        backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
      }}
    />
  );
}

function Fade({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  dark = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl text-left">
      <p className="text-[13px] font-medium tracking-[-0.01em]" style={{ color: ACCENT }}>
        {eyebrow}
      </p>
      <h2 id={id} className="mt-4 max-w-4xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.045em] text-balance sm:text-5xl">
        {title}
      </h2>
      {intro ? (
        <p className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg ${dark ? "text-white/70" : "text-black/70"}`}>{intro}</p>
      ) : null}
    </div>
  );
}

function StepIndex({ index }: { index: number }) {
  return (
    <span aria-hidden="true" className="text-sm font-medium tabular-nums tracking-[-0.02em]" style={{ color: ACCENT }}>
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

function LineIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon size={20} strokeWidth={1.5} aria-hidden style={{ color: ACCENT }} />;
}

function Steps({ items }: { items: readonly { title: string; body: string }[] }) {
  return (
    <ol className="mt-16 grid list-none gap-x-12 border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((step, index) => (
        <li key={step.title} className="border-b border-black/10 py-8">
          <StepIndex index={index} />
          <h3 className="mt-4 text-lg font-medium tracking-[-0.03em]">{step.title}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-black/70">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

const card =
  "rounded-xl border border-black/10 bg-white p-6 text-black shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_28px_-18px_rgba(0,0,0,0.45)] sm:p-7";

export default function FulfilmentSections() {
  return (
    <div id="how">
      <section id="how-it-works" aria-labelledby="how-it-works-title" className="relative overflow-hidden border-t border-black/10 bg-white text-black">
        <FineGrid tone="light" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <Fade>
            <SectionHeading
              id="how-it-works-title"
              eyebrow="How it works"
              title="From checkout to doorstep, handled."
              intro="Here's what happens to every order once your team of agents is on the job."
            />
            <Steps items={HOW_IT_WORKS} />
          </Fade>
        </div>
      </section>

      <section id="agents" aria-labelledby="agents-title" className="relative overflow-hidden border-t border-white/15 bg-black text-white">
        <FineGrid tone="dark" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <Fade>
            <SectionHeading
              id="agents-title"
              eyebrow="Meet your agents"
              title="Meet your agents."
              intro="Each one has a single job, and does it the way your store does things."
              dark
            />
            <ul className="mt-16 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AGENTS.map(({ icon, title, body }) => (
                <li key={title} className={card}>
                  <LineIcon icon={icon} />
                  <h3 className="mt-5 text-[15px] font-medium tracking-[-0.02em]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/70">{body}</p>
                </li>
              ))}
            </ul>
          </Fade>
        </div>
      </section>

      <section id="onboarding" aria-labelledby="onboarding-title" className="relative overflow-hidden border-t border-black/10 bg-white text-black">
        <FineGrid tone="light" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <Fade>
            <SectionHeading
              id="onboarding-title"
              eyebrow="How we onboard you"
              title="How we get you set up."
              intro="It starts with a free audit, so you know exactly what you'd get before you talk to anyone."
            />
            <Steps items={ONBOARDING} />
          </Fade>
        </div>
      </section>

      <section id="safeguards" aria-labelledby="safeguards-title" className="relative overflow-hidden border-t border-white/15 bg-black text-white">
        <FineGrid tone="dark" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <Fade>
            <SectionHeading id="safeguards-title" eyebrow="Built-in safeguards" title="You stay in control." dark />
            <ul className="mt-16 grid list-none gap-4 sm:grid-cols-2">
              {SAFEGUARDS.map(({ icon, title, body }) => (
                <li key={title} className={card}>
                  <LineIcon icon={icon} />
                  <h3 className="mt-5 text-[15px] font-medium tracking-[-0.02em]">{title}:</h3>
                  <p className="mt-2 text-sm leading-6 text-black/70">{body}</p>
                </li>
              ))}
            </ul>
          </Fade>
        </div>
      </section>

      <section id="demo" aria-labelledby="demo-title" className="relative overflow-hidden border-y border-black/10 bg-white text-black">
        <FineGrid tone="light" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <Fade>
            <div className="max-w-3xl text-left">
              <h2 id="demo-title" className="max-w-4xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.045em] text-balance sm:text-5xl">
                See where your fulfilment is losing time.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-black/70 sm:text-lg">
                Tell us how your store ships today. Our agents will review it and send you a plan for your own fulfilment team, free.
              </p>
              <div className="mt-8">
                <a href="#audit" onClick={() => track("lead_audit_started")} className={auditButton}>
                  Get your free fulfilment audit
                </a>
              </div>
            </div>
          </Fade>
        </div>
      </section>
    </div>
  );
}
