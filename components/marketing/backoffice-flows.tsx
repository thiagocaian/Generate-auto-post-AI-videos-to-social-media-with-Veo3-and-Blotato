"use client";

import React, { useState } from "react";
import { Accent, Eyebrow, Heading } from "@/components/site";
import FlowVideo from "@/components/marketing/flow-video";

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

export default function BackofficeFlows() {
  const [active, setActive] = useState(0);

  return (
    <section id="back-office" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Eyebrow>Back-office workflows</Eyebrow>
        <Heading>Repetitive work, <Accent>handled in the background</Accent>.</Heading>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-slate-600">
          Cytron automation takes the trigger, runs the steps on our own servers, and holds anything unusual for a person.
        </p>

        <div role="tablist" aria-label="Back-office workflows" className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {BACKOFFICE_FLOWS.map((f, i) => {
            const on = i === active;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`flow-panel-${f.id}`}
                id={`flow-tab-${f.id}`}
                onClick={() => setActive(i)}
                className={`shrink-0 rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-colors sm:text-sm ${
                  on
                    ? "border-[#5b5cf6] bg-[#eef0ff] text-[#4f46e5]"
                    : "border-[#e5e7eb] bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
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
    </section>
  );
}
