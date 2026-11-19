"use client";

import React, { useId, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  Bell,
  Calculator,
  CircleCheck,
  Database,
  FileText,
  GitCompare,
  Inbox,
  ListChecks,
  MapPin,
  Printer,
  Receipt,
  Scale,
  ScanText,
  Send,
  Server,
  ShieldCheck,
  ShoppingCart,
  Tag,
  TriangleAlert,
  User,
  UserSearch,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Accent, Eyebrow, Heading } from "@/components/site";

const T = {
  ink: "#0f172a",
  body: "#475569",
  muted: "#64748b",
  faint: "#94a3b8",
  border: "#e5e7eb",
  surf: "#f7f8fa",
  a: "#5b5cf6",
  a2: "#8b8cff",
  atint: "#eef0ff",
  aborder: "#c7c8f8",
  green: "#059669",
  gtint: "#ecfdf5",
  amber: "#d97706",
  warnBg: "#fff7ed",
  dash: "#cbd5e1",
  dot: "#d9dbe3",
  after: "#f6f6ff",
  personBg: "#f1f5f9",
} as const;

const ICONS: Record<string, LucideIcon> = {
  inbox: Inbox,
  receipt: Receipt,
  "file-text": FileText,
  "shopping-cart": ShoppingCart,
  workflow: Workflow,
  "scan-text": ScanText,
  "user-search": UserSearch,
  database: Database,
  bell: Bell,
  "git-compare": GitCompare,
  calculator: Calculator,
  scale: Scale,
  "list-checks": ListChecks,
  "shield-check": ShieldCheck,
  "map-pin": MapPin,
  tag: Tag,
  printer: Printer,
  send: Send,
  "circle-check": CircleCheck,
  "triangle-alert": TriangleAlert,
  user: User,
  server: Server,
};

export type BackofficeFlow = {
  id: string;
  n: string;
  t1: string;
  t2: string;
  label: string;
  trigger: { icon: string; title: string; sub: string };
  steps: { icon: string; title: string; sub: string }[];
  exception: string;
  human: string;
  result: { title: string; sub: string };
  badge?: string;
};

export const BACKOFFICE_FLOWS: BackofficeFlow[] = [
  {
    id: "intake",
    n: "01",
    t1: "Client intake",
    t2: "CRM",
    label: "Intake → CRM",
    trigger: { icon: "inbox", title: "New enquiry", sub: "Website, email or form" },
    steps: [
      { icon: "scan-text", title: "Reads the message", sub: "Name, company and request" },
      { icon: "user-search", title: "Classifies and enriches", sub: "Matches existing contacts, no duplicates" },
      { icon: "database", title: "Creates or updates the lead", sub: "In HubSpot, with tags and source" },
      { icon: "bell", title: "Notifies the team", sub: "And schedules the follow-up" },
    ],
    exception: "Ambiguous details or a suspected duplicate",
    human: "Held for human review",
    result: { title: "Lead in the CRM", sub: "No manual data entry" },
  },
  {
    id: "invoice",
    n: "02",
    t1: "Invoice",
    t2: "reconciliation",
    label: "Invoice → reconciliation",
    trigger: { icon: "receipt", title: "Invoice or payment", sub: "Received, issued or paid" },
    steps: [
      { icon: "scan-text", title: "Extracts the invoice data", sub: "Supplier, amount, number and date" },
      { icon: "git-compare", title: "Matches the record", sub: "Against the related order or bill" },
      { icon: "calculator", title: "Posts and reconciles", sub: "In Xero or MYOB" },
      { icon: "scale", title: "Flags mismatches", sub: "When amounts or items don't match" },
    ],
    exception: "The amount doesn't match",
    human: "Held for human approval",
    result: { title: "Continuous reconciliation", sub: "No month-end backlog" },
  },
  {
    id: "document",
    n: "03",
    t1: "Document",
    t2: "data",
    label: "Document → data",
    trigger: { icon: "file-text", title: "Document arrives", sub: "PDF, photo, spreadsheet or attachment" },
    steps: [
      { icon: "scan-text", title: "Reads the document", sub: "OCR plus AI" },
      { icon: "list-checks", title: "Extracts the right fields", sub: "Items, quantities and amounts" },
      { icon: "shield-check", title: "Validates it", sub: "Format and business rules" },
      { icon: "database", title: "Saves it to your system", sub: "Spreadsheet, ERP or database" },
    ],
    exception: "A field is unreadable or out of pattern",
    human: "Sent for human review",
    result: { title: "Structured data", sub: "No retyping documents" },
  },
  {
    id: "fulfilment",
    n: "04",
    t1: "Order",
    t2: "fulfilment",
    label: "Order → fulfilment",
    trigger: { icon: "shopping-cart", title: "New order", sub: "From Shopify" },
    steps: [
      { icon: "map-pin", title: "Validates the order", sub: "Address, item and stock" },
      { icon: "tag", title: "Generates the label", sub: "In the shipping platform" },
      { icon: "printer", title: "Triggers printing", sub: "And fulfilment" },
      { icon: "send", title: "Updates the status", sub: "And notifies the customer" },
    ],
    exception: "Invalid address or item out of stock",
    human: "Held for human review",
    result: { title: "Ready to dispatch", sub: "From order to shipping, no manual touch" },
    badge: "Real example · an Australian online retailer",
  },
];

const SUB = "Runs in the background on Cytron's own server, in real time. A person only steps in when something is out of the ordinary.";

export function flowAccessibleText(flow: BackofficeFlow): string {
  const steps = flow.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.sub}`).join(" ");
  return `${flow.t1} to ${flow.t2}. ${SUB} Trigger: ${flow.trigger.title}. ${flow.trigger.sub}. Cytron automation, custom code, n8n and AI, on Cytron's server. What it does: ${steps}. Result: ${flow.result.title}. ${flow.result.sub}. If out of the ordinary — ${flow.exception} — ${flow.human}.${flow.badge ? ` ${flow.badge}.` : ""}`;
}

function Ico({ name, x, y, size, color }: { name: string; x: number; y: number; size: number; color: string }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon x={x} y={y} width={size} height={size} color={color} strokeWidth={2} aria-hidden />;
}

function IBox({ x, y, s, name, kind }: { x: number; y: number; s: number; name: string; kind: "tint" | "solid" | "ok" | "warn" | "person" }) {
  const map = {
    tint: { bg: T.atint, fg: T.a },
    solid: { bg: T.a, fg: "#fff" },
    ok: { bg: T.gtint, fg: T.green },
    warn: { bg: T.warnBg, fg: T.amber },
    person: { bg: T.personBg, fg: T.body },
  }[kind];
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} rx={Math.round(s * 0.27)} fill={map.bg} />
      <Ico name={name} x={x + s * 0.25} y={y + s * 0.25} size={s * 0.5} color={map.fg} />
    </g>
  );
}

function Label({ x, y, children, size = 13, fill = T.muted, anchor = "start" }: { x: number; y: number; children: string; size?: number; fill?: string; anchor?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={fill} fontSize={size} fontWeight={600} letterSpacing={size * 0.12} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
      {children.toUpperCase()}
    </text>
  );
}

function Arrow({ id, x1, y1, x2, y2, dashed, reduced, delay, inView, head }: {
  id: string; x1: number; y1: number; x2: number; y2: number; dashed?: boolean; reduced: boolean; delay: number; inView: boolean; head: string;
}) {
  return (
    <>
      {!dashed && (
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0" stopColor={T.a} />
          <stop offset="1" stopColor={T.a2} />
        </linearGradient>
      )}
      <motion.path
        d={`M${x1} ${y1} L${x2} ${y2}`}
        fill="none"
        stroke={dashed ? T.faint : `url(#${id})`}
        strokeWidth={dashed ? 2 : 2.5}
        strokeDasharray={dashed ? "6 6" : undefined}
        strokeLinejoin="round"
        markerEnd={`url(#${head})`}
        initial={reduced ? false : { pathLength: 0, opacity: 0.35 }}
        animate={inView || reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0.35 }}
        transition={reduced ? { duration: 0 } : { duration: 0.65, delay, ease: "easeOut" }}
      />
    </>
  );
}

function DiagramDefs({ uid }: { uid: string }) {
  return (
    <defs>
      <pattern id={`${uid}-dots`} width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.1" fill={T.dot} />
      </pattern>
      <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="1" />
        <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <mask id={`${uid}-dotmask`}>
        <rect width="100%" height="100%" fill={`url(#${uid}-fade)`} />
      </mask>
      <marker id={`${uid}-head`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill={T.a2} />
      </marker>
      <marker id={`${uid}-headGrey`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill={T.faint} />
      </marker>
      <filter id={`${uid}-soft`} x="-10%" y="-10%" width="120%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.06" />
      </filter>
      <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="11" floodColor={T.a} floodOpacity="0.18" />
      </filter>
    </defs>
  );
}

function HorizontalFlow({ flow, reduced }: { flow: BackofficeFlow; reduced: boolean }) {
  const uid = useId().replace(/:/g, "");
  const ref = React.useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const cy = 480;
  const PH = 4 * 78 + 3 * 12 + 2 * 16;
  const py = cy - PH / 2;
  const LY = py - 18;

  return (
    <svg ref={ref} viewBox="0 0 1600 900" className="hidden h-auto w-full md:block" role="img" aria-labelledby={titleId} aria-describedby={descId}>
      <title id={titleId}>{`${flow.t1} to ${flow.t2}: Cytron back-office automation flow`}</title>
      <desc id={descId}>{flowAccessibleText(flow)}</desc>
      <DiagramDefs uid={uid} />
      <rect width="1600" height="900" rx="16" fill="#fff" />
      <rect width="1600" height="900" rx="16" fill={`url(#${uid}-dots)`} mask={`url(#${uid}-dotmask)`} opacity="0.7" />

      <Label x={80} y={92} size={14}>Back-office flow</Label>
      <Label x={260} y={92} size={14} fill={T.a}>{flow.n}</Label>
      <text x={80} y={150} fontSize={46} fontWeight={600} fill={T.ink} letterSpacing={-0.92} fontFamily="Inter, system-ui, sans-serif">
        {flow.t1} <tspan fill={T.a}>→ {flow.t2}</tspan>
      </text>
      <text x={80} y={188} fontSize={20} fontWeight={400} fill={T.body} fontFamily="Inter, system-ui, sans-serif">
        {SUB}
      </text>
      {flow.badge && (
        <g>
          <rect x={1148} y={70} width={372} height={32} rx={16} fill={T.surf} stroke={T.border} />
          <circle cx={1166} cy={86} r={4} fill={T.green} />
          <text x={1178} y={91} fontSize={14} fontWeight={500} fill="#334155" fontFamily="Inter, system-ui, sans-serif">{flow.badge}</text>
        </g>
      )}

      <Label x={80} y={LY}>Trigger</Label>
      <rect x={80.5} y={cy - 118} width={249} height={236} rx={16} fill="#fff" stroke={T.border} filter={`url(#${uid}-soft)`} />
      <IBox x={104} y={cy - 94} s={48} name={flow.trigger.icon} kind="tint" />
      <text x={104} y={cy - 10} fontSize={22} fontWeight={600} fill={T.ink} fontFamily="Inter, system-ui, sans-serif">{flow.trigger.title}</text>
      <text x={104} y={cy + 20} fontSize={17} fontWeight={400} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">{flow.trigger.sub}</text>

      <Arrow id={`${uid}-a1`} x1={334} y1={cy} x2={394} y2={cy} reduced={reduced} delay={0.08} inView={inView} head={`${uid}-head`} />

      <Label x={400} y={LY}>Solution</Label>
      <rect x={400.5} y={cy - 130} width={269} height={260} rx={16} fill="#fff" stroke={T.aborder} strokeWidth={1.5} filter={`url(#${uid}-glow)`} />
      {!reduced && inView && (
        <motion.rect
          x={394} y={cy - 136} width={282} height={272} rx={18}
          fill="none" stroke={T.a} strokeWidth={1}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <IBox x={424} y={cy - 106} s={48} name="workflow" kind="solid" />
      <text x={424} y={cy - 22} fontSize={22} fontWeight={600} fill={T.ink} fontFamily="Inter, system-ui, sans-serif">Cytron automation</text>
      <text x={424} y={cy + 8} fontSize={17} fontWeight={400} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">Custom code, n8n and AI</text>
      <rect x={424} y={cy + 36} width={196} height={26} rx={13} fill={T.atint} stroke="#dcdcfd" />
      <Ico name="server" x={434} y={cy + 42.5} size={13} color={T.a} />
      <text x={453} y={cy + 54} fontSize={12} fontWeight={600} fill={T.a} letterSpacing={1.2} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">ON CYTRON&apos;S SERVER</text>

      <Arrow id={`${uid}-a2`} x1={674} y1={cy} x2={734} y2={cy} reduced={reduced} delay={0.2} inView={inView} head={`${uid}-head`} />

      <Label x={740} y={LY}>What it does</Label>
      <rect x={740.5} y={py + 0.5} width={469} height={PH - 1} rx={18} fill={T.surf} stroke={T.border} />
      {flow.steps.map((step, i) => {
        const ry = py + 16 + i * 90;
        return (
          <g key={step.title}>
            <rect x={756.5} y={ry + 0.5} width={437} height={77} rx={12} fill="#fff" stroke={T.border} filter={`url(#${uid}-soft)`} />
            <Label x={772} y={ry + 44} size={15} fill={T.a}>{`0${i + 1}`}</Label>
            <IBox x={806} y={ry + 19} s={40} name={step.icon} kind="tint" />
            <text x={862} y={ry + 36} fontSize={18} fontWeight={600} fill={T.ink} fontFamily="Inter, system-ui, sans-serif">{step.title}</text>
            <text x={862} y={ry + 56} fontSize={15} fontWeight={400} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">{step.sub}</text>
            {i < 3 && <path d={`M826 ${ry + 78} v12`} stroke={T.aborder} strokeWidth={2} />}
          </g>
        );
      })}

      <Arrow id={`${uid}-a3`} x1={1214} y1={cy} x2={1274} y2={cy} reduced={reduced} delay={0.36} inView={inView} head={`${uid}-head`} />

      <Label x={1280} y={LY}>Result</Label>
      <rect x={1280.5} y={cy - 118} width={239} height={236} rx={16} fill="#fff" stroke={T.border} filter={`url(#${uid}-soft)`} />
      <IBox x={1304} y={cy - 94} s={48} name="circle-check" kind="ok" />
      <text x={1304} y={cy - 10} fontSize={22} fontWeight={600} fill={T.ink} fontFamily="Inter, system-ui, sans-serif">{flow.result.title}</text>
      <text x={1304} y={cy + 20} fontSize={17} fontWeight={400} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">{flow.result.sub}</text>

      <Label x={740} y={722}>Exception</Label>
      <Arrow id={`${uid}-ax`} x1={850} y1={py + PH + 4} x2={850} y2={710} dashed reduced={reduced} delay={0.45} inView={inView} head={`${uid}-headGrey`} />
      <rect x={740.5} y={740.5} width={469} height={79} rx={12} fill="#fff" stroke={T.dash} strokeWidth={1.5} strokeDasharray="6 5" filter={`url(#${uid}-soft)`} />
      <IBox x={756} y={760} s={40} name="triangle-alert" kind="warn" />
      <text x={812} y={770} fontSize={18} fontWeight={600} fill={T.ink} fontFamily="Inter, system-ui, sans-serif">Out of the ordinary?</text>
      <text x={812} y={792} fontSize={15} fontWeight={400} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">{flow.exception}</text>

      <Arrow id={`${uid}-ah`} x1={1214} y1={780} x2={1274} y2={780} dashed reduced={reduced} delay={0.55} inView={inView} head={`${uid}-headGrey`} />
      <rect x={1280.5} y={740.5} width={239} height={79} rx={12} fill="#fff" stroke={T.border} filter={`url(#${uid}-soft)`} />
      <IBox x={1296} y={760} s={40} name="user" kind="person" />
      <text x={1352} y={770} fontSize={18} fontWeight={600} fill={T.ink} fontFamily="Inter, system-ui, sans-serif">Human review</text>
      <text x={1352} y={792} fontSize={15} fontWeight={400} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">{flow.human}</text>

      <path d="M80 841 h34" stroke={T.a} strokeWidth={2.5} />
      <text x={124} y={846} fontSize={14} fontWeight={500} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">Automated</text>
      <path d="M230 841 h34" stroke={T.faint} strokeWidth={2} strokeDasharray="6 6" />
      <text x={274} y={846} fontSize={14} fontWeight={500} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">Exception path</text>
    </svg>
  );
}

function VerticalFlow({ flow, reduced }: { flow: BackofficeFlow; reduced: boolean }) {
  const uid = useId().replace(/:/g, "");
  const ref = React.useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const W = 800;
  const X = 48;
  const CW = 704;
  // Fixed vertical rhythm matching Fox's mobile stack, compact enough for a phone.
  const H = 1680;

  const row = (y: number, h: number, kind: "tint" | "solid" | "ok" | "warn" | "person", icon: string, title: string, sub: string, opts?: { hub?: boolean; dashed?: boolean; num?: string }) => (
    <g>
      <rect
        x={X + 0.5}
        y={y + 0.5}
        width={CW - 1}
        height={h - 1}
        rx={opts?.hub ? 16 : 14}
        fill="#fff"
        stroke={opts?.hub ? T.aborder : opts?.dashed ? T.dash : T.border}
        strokeWidth={opts?.hub || opts?.dashed ? 1.5 : 1}
        strokeDasharray={opts?.dashed ? "6 5" : undefined}
        filter={`url(#${uid}-${opts?.hub ? "glow" : "soft"})`}
      />
      <IBox x={X + 26} y={y + (h - 52) / 2} s={52} name={icon} kind={kind} />
      <text x={X + 96} y={y + h / 2 - 6} fontSize={26} fontWeight={600} fill={T.ink} fontFamily="Inter, system-ui, sans-serif">{title}</text>
      <text x={X + 96} y={y + h / 2 + 22} fontSize={21} fontWeight={400} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">{sub}</text>
    </g>
  );

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full md:hidden" role="img" aria-labelledby={titleId} aria-describedby={descId}>
      <title id={titleId}>{`${flow.t1} to ${flow.t2}: Cytron back-office automation flow`}</title>
      <desc id={descId}>{flowAccessibleText(flow)}</desc>
      <DiagramDefs uid={uid} />
      <rect width={W} height={H} rx="16" fill="#fff" />
      <rect width={W} height={H} rx="16" fill={`url(#${uid}-dots)`} mask={`url(#${uid}-dotmask)`} opacity="0.7" />

      <Label x={X} y={56} size={18}>Back-office flow</Label>
      <Label x={X + 260} y={56} size={18} fill={T.a}>{flow.n}</Label>
      <text x={X} y={128} fontSize={48} fontWeight={600} fill={T.ink} letterSpacing={-0.96} fontFamily="Inter, system-ui, sans-serif">
        {flow.t1} <tspan fill={T.a}>→ {flow.t2}</tspan>
      </text>
      <text x={X} y={170} fontSize={22} fontWeight={400} fill={T.body} fontFamily="Inter, system-ui, sans-serif">
        Runs in the background on Cytron&apos;s own server, in real time.
      </text>
      <text x={X} y={200} fontSize={22} fontWeight={400} fill={T.body} fontFamily="Inter, system-ui, sans-serif">
        A person only steps in when something is out of the ordinary.
      </text>
      {flow.badge && (
        <g>
          <rect x={X} y={224} width={560} height={36} rx={18} fill={T.surf} stroke={T.border} />
          <circle cx={X + 18} cy={242} r={5} fill={T.green} />
          <text x={X + 32} y={248} fontSize={18} fontWeight={500} fill="#334155" fontFamily="Inter, system-ui, sans-serif">{flow.badge}</text>
        </g>
      )}

      <Label x={X} y={flow.badge ? 300 : 260} size={18}>Trigger</Label>
      {row(flow.badge ? 316 : 276, 110, "tint", flow.trigger.icon, flow.trigger.title, flow.trigger.sub)}
      <Arrow id={`${uid}-v1`} x1={400} y1={flow.badge ? 426 : 386} x2={400} y2={flow.badge ? 478 : 438} reduced={reduced} delay={0.08} inView={inView} head={`${uid}-head`} />

      <Label x={X} y={flow.badge ? 506 : 466} size={18}>Solution</Label>
      {row(flow.badge ? 522 : 482, 120, "solid", "workflow", "Cytron automation", "Custom code, n8n and AI, on Cytron's server", { hub: true })}
      <Arrow id={`${uid}-v2`} x1={400} y1={flow.badge ? 642 : 602} x2={400} y2={flow.badge ? 694 : 654} reduced={reduced} delay={0.18} inView={inView} head={`${uid}-head`} />

      <Label x={X} y={flow.badge ? 722 : 682} size={18}>What it does</Label>
      {(() => {
        const panY = flow.badge ? 738 : 698;
        const rowH = 86;
        const gap = 12;
        const pad = 16;
        const ph = 4 * rowH + 3 * gap + 2 * pad;
        return (
          <g>
            <rect x={X + 0.5} y={panY + 0.5} width={CW - 1} height={ph - 1} rx={18} fill={T.surf} stroke={T.border} />
            {flow.steps.map((step, i) => {
              const ry = panY + pad + i * (rowH + gap);
              return (
                <g key={step.title}>
                  <rect x={X + pad + 0.5} y={ry + 0.5} width={CW - 2 * pad - 1} height={rowH - 1} rx={12} fill="#fff" stroke={T.border} />
                  <Label x={X + pad + 16} y={ry + 50} size={16} fill={T.a}>{`0${i + 1}`}</Label>
                  <IBox x={X + pad + 56} y={ry + 17} s={52} name={step.icon} kind="tint" />
                  <text x={X + pad + 122} y={ry + 40} fontSize={24} fontWeight={600} fill={T.ink} fontFamily="Inter, system-ui, sans-serif">{step.title}</text>
                  <text x={X + pad + 122} y={ry + 66} fontSize={18} fontWeight={400} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">{step.sub}</text>
                </g>
              );
            })}
            <Arrow id={`${uid}-v3`} x1={400} y1={panY + ph} x2={400} y2={panY + ph + 52} reduced={reduced} delay={0.4} inView={inView} head={`${uid}-head`} />
            <Label x={X} y={panY + ph + 80} size={18}>Result</Label>
            {row(panY + ph + 96, 110, "ok", "circle-check", flow.result.title, flow.result.sub)}
            <Label x={X} y={panY + ph + 244} size={18}>Exception</Label>
            <Arrow id={`${uid}-vx`} x1={400} y1={panY + ph + 206} x2={400} y2={panY + ph + 236} dashed reduced={reduced} delay={0.5} inView={inView} head={`${uid}-headGrey`} />
            {row(panY + ph + 260, 110, "warn", "triangle-alert", "Out of the ordinary?", flow.exception, { dashed: true })}
            <Arrow id={`${uid}-vh`} x1={400} y1={panY + ph + 370} x2={400} y2={panY + ph + 422} dashed reduced={reduced} delay={0.58} inView={inView} head={`${uid}-headGrey`} />
            {row(panY + ph + 428, 110, "person", "user", "Human review", flow.human)}
            <path d={`M${X} ${panY + ph + 580} h40`} stroke={T.a} strokeWidth={2.5} />
            <text x={X + 52} y={panY + ph + 586} fontSize={18} fontWeight={500} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">Automated</text>
            <path d={`M${X + 220} ${panY + ph + 580} h40`} stroke={T.faint} strokeWidth={2} strokeDasharray="6 6" />
            <text x={X + 272} y={panY + ph + 586} fontSize={18} fontWeight={500} fill={T.muted} fontFamily="Inter, system-ui, sans-serif">Exception path</text>
          </g>
        );
      })()}
    </svg>
  );
}

export default function BackofficeFlows() {
  const reduced = useReducedMotion() === true;
  const [active, setActive] = useState(0);
  const flow = BACKOFFICE_FLOWS[active];

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

        <AnimatePresence mode="wait">
          <motion.div
            key={flow.id}
            id={`flow-panel-${flow.id}`}
            role="tabpanel"
            aria-labelledby={`flow-tab-${flow.id}`}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
            className="mt-6 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm"
          >
            <HorizontalFlow flow={flow} reduced={reduced} />
            <VerticalFlow flow={flow} reduced={reduced} />
            <ol className="sr-only">
              <li>Trigger: {flow.trigger.title}. {flow.trigger.sub}</li>
              <li>Cytron automation: custom code, n8n and AI, on Cytron&apos;s server</li>
              {flow.steps.map((s, i) => <li key={s.title}>Step {i + 1}: {s.title}. {s.sub}</li>)}
              <li>Result: {flow.result.title}. {flow.result.sub}</li>
              <li>Exception: {flow.exception}. {flow.human}</li>
            </ol>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
