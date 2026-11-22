"use client";

import React, { useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, FileText, Package, Receipt, UserPlus, type LucideIcon } from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";
import FlowVideo from "@/components/marketing/flow-video";
import { GLASS_ACTIVE, GLASS_DURATION, GLASS_EASE, GLASS_FOCUS, GLASS_HEADER, GLASS_PANEL, GLASS_ROW, GlassCollapse } from "@/components/marketing/glass";

export type BackofficeFlow = {
  id: string;
  n: string;
  t1: string;
  t2: string;
  label: string;
  trigger: { title: string; sub: string };
  steps: { title: string; sub: string }[];
  exception: string;
  human: string;
  result: { title: string; sub: string };
  badge?: string;
  poster: string;
  posterMobile: string;
  srcWebm?: string;
  srcMp4?: string;
  srcWebmMobile?: string;
  srcMp4Mobile?: string;
};

export const BACKOFFICE_FLOWS: BackofficeFlow[] = [
  {
    id: "intake",
    n: "01",
    t1: "Client intake",
    t2: "CRM",
    label: "Intake → CRM",
    trigger: { title: "New enquiry", sub: "Website, email or form" },
    steps: [
      { title: "Reads the message", sub: "Name, company and request" },
      { title: "Classifies and enriches", sub: "Matches existing contacts, no duplicates" },
      { title: "Creates or updates the lead", sub: "In HubSpot, with tags and source" },
      { title: "Notifies the team", sub: "And schedules the follow-up" },
    ],
    exception: "Ambiguous details or a suspected duplicate",
    human: "Held for human review",
    result: { title: "Lead in the CRM", sub: "No manual data entry" },
    poster: "/backoffice/video/flow-1-intake-crm-poster.webp",
    posterMobile: "/backoffice/video/flow-1-intake-crm-poster.webp",
    srcWebm: "/backoffice/video/flow-1-intake-crm.webm",
    srcMp4: "/backoffice/video/flow-1-intake-crm.mp4",
    srcWebmMobile: "/backoffice/video/flow-1-intake-crm-mobile.webm",
    srcMp4Mobile: "/backoffice/video/flow-1-intake-crm-mobile.mp4",
  },
  {
    id: "invoice",
    n: "02",
    t1: "Invoice",
    t2: "reconciliation",
    label: "Invoice → reconciliation",
    trigger: { title: "Invoice or payment", sub: "Received, issued or paid" },
    steps: [
      { title: "Extracts the invoice data", sub: "Supplier, amount, number and date" },
      { title: "Matches the record", sub: "Against the related order or bill" },
      { title: "Posts and reconciles", sub: "In Xero or MYOB" },
      { title: "Flags mismatches", sub: "When amounts or items don't match" },
    ],
    exception: "The amount doesn't match",
    human: "Held for human approval",
    result: { title: "Continuous reconciliation", sub: "No month-end backlog" },
    poster: "/backoffice/video/flow-2-invoice-reconciliation-poster.webp",
    posterMobile: "/backoffice/video/flow-2-invoice-reconciliation-poster.webp",
    srcWebm: "/backoffice/video/flow-2-invoice-reconciliation.webm",
    srcMp4: "/backoffice/video/flow-2-invoice-reconciliation.mp4",
    srcWebmMobile: "/backoffice/video/flow-2-invoice-reconciliation-mobile.webm",
    srcMp4Mobile: "/backoffice/video/flow-2-invoice-reconciliation-mobile.mp4",
  },
  {
    id: "document",
    n: "03",
    t1: "Document",
    t2: "data",
    label: "Document → data",
    trigger: { title: "Document arrives", sub: "PDF, photo, spreadsheet or attachment" },
    steps: [
      { title: "Reads the document", sub: "OCR plus AI" },
      { title: "Extracts the right fields", sub: "Items, quantities and amounts" },
      { title: "Validates it", sub: "Format and business rules" },
      { title: "Saves it to your system", sub: "Spreadsheet, ERP or database" },
    ],
    exception: "A field is unreadable or out of pattern",
    human: "Sent for human review",
    result: { title: "Structured data", sub: "No retyping documents" },
    poster: "/backoffice/video/flow-3-document-data-poster.webp",
    posterMobile: "/backoffice/video/flow-3-document-data-poster.webp",
    srcWebm: "/backoffice/video/flow-3-document-data.webm",
    srcMp4: "/backoffice/video/flow-3-document-data.mp4",
    srcWebmMobile: "/backoffice/video/flow-3-document-data-mobile.webm",
    srcMp4Mobile: "/backoffice/video/flow-3-document-data-mobile.mp4",
  },
  {
    id: "fulfilment",
    n: "04",
    t1: "Order",
    t2: "fulfilment",
    label: "Order → fulfilment",
    trigger: { title: "New order", sub: "From Shopify" },
    steps: [
      { title: "Validates the order", sub: "Address, item and stock" },
      { title: "Generates the label", sub: "In the shipping platform" },
      { title: "Triggers printing", sub: "And fulfilment" },
      { title: "Updates the status", sub: "And notifies the customer" },
    ],
    exception: "Invalid address or item out of stock",
    human: "Held for human review",
    result: { title: "Ready to dispatch", sub: "From order to shipping, no manual touch" },
    badge: "Real example · an Australian online retailer",
    poster: "/backoffice/video/flow-4-order-fulfilment-poster.webp",
    posterMobile: "/backoffice/video/flow-4-order-fulfilment-poster.webp",
    srcWebm: "/backoffice/video/flow-4-order-fulfilment.webm",
    srcMp4: "/backoffice/video/flow-4-order-fulfilment.mp4",
    srcWebmMobile: "/backoffice/video/flow-4-order-fulfilment-mobile.webm",
    srcMp4Mobile: "/backoffice/video/flow-4-order-fulfilment-mobile.mp4",
  },
];

const SUB = "Runs in the background on Cytron's own server, in real time. A person only steps in when something is out of the ordinary.";

export function flowAccessibleText(flow: BackofficeFlow): string {
  const steps = flow.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.sub}`).join(" ");
  return `${flow.t1} to ${flow.t2}. ${SUB} Trigger: ${flow.trigger.title}. ${flow.trigger.sub}. Cytron automation, custom code and AI, on Cytron's server. What it does: ${steps}. Result: ${flow.result.title}. ${flow.result.sub}. If out of the ordinary — ${flow.exception} — ${flow.human}.${flow.badge ? ` ${flow.badge}.` : ""}`;
}

const FLOW_ICONS: Record<string, LucideIcon> = {
  intake: UserPlus,
  invoice: Receipt,
  document: FileText,
  fulfilment: Package,
};

function FlowRowContent({ flow, on }: { flow: BackofficeFlow; on: boolean }) {
  const Icon = FLOW_ICONS[flow.id] ?? FileText;
  return (
    <>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
          on ? "bg-white/90 text-[#4f46e5] shadow-sm" : "bg-slate-100/80 text-slate-600"
        }`}
        aria-hidden
      >
        <Icon size={15} />
      </span>
      <span className={`min-w-0 flex-1 text-[13.5px] leading-snug ${on ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
        {flow.label}
      </span>
      <span
        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums ${
          on ? "bg-[#5b5cf6] text-white" : "bg-slate-900/[0.05] text-slate-600"
        }`}
        aria-hidden
      >
        {flow.n}
      </span>
    </>
  );
}

export default function BackofficeFlows() {
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion() === true;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const activeFlow = BACKOFFICE_FLOWS[active];

  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = BACKOFFICE_FLOWS.length - 1;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const pick = (i: number) => {
    setActive(i);
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <section id="back-office" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Eyebrow>Back-office workflows</Eyebrow>
        <Heading>Repetitive work, <Accent>handled in the background</Accent>.</Heading>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-slate-600">
          Cytron automation takes the trigger, runs the steps on our own servers, and holds anything unusual for a person.
        </p>

        <div className="mt-8 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-5">
          {/* Mobile / tablet: collapsible selector showing the active flow. */}
          <div
            className={`${GLASS_PANEL} mb-4 p-1.5 lg:hidden`}
            data-glass="c-mobile"
            onKeyDown={(e) => {
              if (e.key === "Escape" && menuOpen) {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
              }
            }}
          >
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((v) => !v)}
              data-glass-toggle="c"
              className={`${GLASS_ROW} ${GLASS_ACTIVE} w-full text-left ${GLASS_FOCUS}`}
            >
              <span className="sr-only">Back-office workflow: </span>
              <FlowRowContent flow={activeFlow} on />
              <motion.span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600"
                initial={false}
                animate={{ rotate: menuOpen ? 180 : 0 }}
                transition={{ duration: reduced ? 0 : GLASS_DURATION, ease: GLASS_EASE }}
              >
                <ChevronDown size={15} />
              </motion.span>
            </button>
            <GlassCollapse open={menuOpen} id={menuId} reduced={reduced}>
              <p className={`${GLASS_HEADER} px-2.5 pb-1 pt-2.5`}>Choose a workflow</p>
              <ul className="flex flex-col gap-1 pb-0.5">
                {BACKOFFICE_FLOWS.map((f, i) => {
                  const on = i === active;
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        aria-current={on ? "true" : undefined}
                        onClick={() => pick(i)}
                        data-glass-option={f.id}
                        className={`${GLASS_ROW} w-full text-left ${on ? GLASS_ACTIVE : "hover:bg-white/60"} ${GLASS_FOCUS}`}
                      >
                        <FlowRowContent flow={f} on={on} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </GlassCollapse>
          </div>

          {/* Desktop: narrow glass rail beside the video. */}
          <div className={`${GLASS_PANEL} hidden p-1.5 lg:block`} data-glass="c-rail">
            <p className={`${GLASS_HEADER} px-2.5 pb-1.5 pt-2`} id="flow-rail-heading">Choose a workflow</p>
            <div role="tablist" aria-labelledby="flow-rail-heading" aria-orientation="vertical" className="flex flex-col gap-1">
              {BACKOFFICE_FLOWS.map((f, i) => {
                const on = i === active;
                return (
                  <button
                    key={f.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`flow-panel-${f.id}`}
                    id={`flow-tab-${f.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className={`${GLASS_ROW} w-full text-left ${on ? GLASS_ACTIVE : "hover:bg-white/60"} ${GLASS_FOCUS}`}
                  >
                    <FlowRowContent flow={f} on={on} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
          {BACKOFFICE_FLOWS.map((flow, i) => {
            const on = i === active;
            const videoLabel = `${flow.t1} to ${flow.t2}: Cytron back-office automation flow. ${flowAccessibleText(flow)}`;
            return (
              <div
                key={flow.id}
                id={`flow-panel-${flow.id}`}
                role="tabpanel"
                aria-labelledby={`flow-tab-${flow.id}`}
                hidden={!on}
                className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm"
              >
                <FlowVideo
                  label={videoLabel}
                  poster={flow.poster}
                  posterMobile={flow.posterMobile}
                  srcWebm={flow.srcWebm}
                  srcMp4={flow.srcMp4}
                  srcWebmMobile={flow.srcWebmMobile}
                  srcMp4Mobile={flow.srcMp4Mobile}
                />
                <ol className="sr-only">
                  <li>Trigger: {flow.trigger.title}. {flow.trigger.sub}</li>
                  <li>Cytron automation: custom code and AI, on Cytron&apos;s server</li>
                  {flow.steps.map((s, stepIndex) => (
                    <li key={s.title}>Step {stepIndex + 1}: {s.title}. {s.sub}</li>
                  ))}
                  <li>Result: {flow.result.title}. {flow.result.sub}</li>
                  <li>Exception: {flow.exception}. {flow.human}</li>
                </ol>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
