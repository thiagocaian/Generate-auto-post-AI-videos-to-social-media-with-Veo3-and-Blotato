"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Bell,
  CalendarCheck,
  Check,
  Cpu,
  Database,
  FileText,
  MessageSquare,
  Package,
  PhoneMissed,
  Receipt,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

type NodeId =
  | "hub"
  | "missed"
  | "reply"
  | "booked"
  | "reminder"
  | "lead"
  | "documents"
  | "order"
  | "shipping"
  | "invoice"
  | "paid"
  | "human";

type NodeState = "idle" | "running" | "done";
type Side = "left" | "right" | "top" | "bottom";
type NodeKind = "hub" | "task" | "human";

type FlowNode = {
  id: NodeId;
  x: number;
  y: number;
  title: string;
  sub: string;
  icon: LucideIcon;
  kind?: NodeKind;
  w?: number;
  h?: number;
};

type FlowEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
  fromSide: Side;
  toSide: Side;
  /** Shift the port along the side, -0.5 to 0.5, so several spokes can leave the hub cleanly. */
  fromAlong?: number;
  toAlong?: number;
  dashed?: boolean;
};

type LaneLabel = { id: string; label: string; x: number; y: number; w: number };

// Flat, grid-aligned canvas. No rotate / translateZ, so connectors meet the cards exactly.
const NODE_W = 148;
const NODE_H = 64;
const HUB_W = 232; // wide enough for "Runs in the background" on one line
const HUB_H = 72;
const COL = 172;
const PAD = 12;

const TOP_Y = 30;
const HUB_X = (PAD * 2 + COL * 3 + NODE_W - HUB_W) / 2; // centered in the 688-wide canvas
const HUB_Y = 156;
const BOT_Y1 = 296;
const BOT_Y2 = 380;
const HUMAN_Y = 492;
const LEFT_X = PAD;
const COL1_X = PAD + COL;
const COL2_X = PAD + COL * 2;
const RIGHT_X = PAD + COL * 3;
const MID_X = (PAD * 2 + COL * 3 + NODE_W - NODE_W) / 2; // 270
const HUMAN_X = MID_X;

const NODES: FlowNode[] = [
  { id: "hub", x: HUB_X, y: HUB_Y, w: HUB_W, h: HUB_H, title: "Cytron automation", sub: "Runs in the background", icon: Cpu, kind: "hub" },
  // Enquiries — /services "Missed calls & messages"
  { id: "missed", x: LEFT_X, y: TOP_Y, title: "Missed call", sub: "After hours", icon: PhoneMissed },
  { id: "reply", x: COL1_X, y: TOP_Y, title: "Instant reply", sub: "Under a minute", icon: MessageSquare },
  // Bookings — /services "Bookings" + "Reminders"
  { id: "booked", x: COL2_X, y: TOP_Y, title: "Booked", sub: "In the calendar", icon: CalendarCheck },
  { id: "reminder", x: RIGHT_X, y: TOP_Y, title: "Reminder", sub: "Day before", icon: Bell },
  // Office — /services "Lead capture" + /professional-services documents
  { id: "lead", x: LEFT_X, y: BOT_Y1, title: "Lead saved", sub: "CRM", icon: Database },
  { id: "documents", x: LEFT_X, y: BOT_Y2, title: "Documents in", sub: "Collected", icon: FileText },
  // Fulfilment — /retail + /use-cases retailer case study
  { id: "order", x: MID_X, y: BOT_Y1, title: "Order check", sub: "Shopify", icon: Package },
  { id: "shipping", x: MID_X, y: BOT_Y2, title: "Shipping docs", sub: "Ready to pack", icon: Truck },
  // Finance — /services "Invoices & payments"
  { id: "invoice", x: RIGHT_X, y: BOT_Y1, title: "Invoice sent", sub: "Xero", icon: Receipt },
  { id: "paid", x: RIGHT_X, y: BOT_Y2, title: "Paid", sub: "Pay-by-link", icon: Check },
  // Human review — /services "Human review"
  { id: "human", x: HUMAN_X, y: HUMAN_Y, title: "Human review", sub: "When needed", icon: UserRound, kind: "human" },
];

const LANES: LaneLabel[] = [
  { id: "enquiries", label: "Enquiries", x: LEFT_X, y: 8, w: COL + NODE_W },
  { id: "bookings", label: "Bookings", x: COL2_X, y: 8, w: COL + NODE_W },
  { id: "office", label: "Office", x: LEFT_X, y: 276, w: NODE_W },
  { id: "fulfilment", label: "Fulfilment", x: MID_X, y: 276, w: NODE_W },
  { id: "finance", label: "Finance", x: RIGHT_X, y: 276, w: NODE_W },
  { id: "exceptions", label: "Exceptions", x: HUMAN_X, y: 472, w: NODE_W },
];

const EDGES: FlowEdge[] = [
  // Hub to each lane, then the two steps inside the lane
  { id: "e-hub-missed", from: "hub", to: "missed", fromSide: "top", toSide: "bottom", fromAlong: -0.32 },
  { id: "e-missed-reply", from: "missed", to: "reply", fromSide: "right", toSide: "left" },
  { id: "e-hub-booked", from: "hub", to: "booked", fromSide: "top", toSide: "bottom", fromAlong: 0.32 },
  { id: "e-booked-reminder", from: "booked", to: "reminder", fromSide: "right", toSide: "left" },
  { id: "e-hub-lead", from: "hub", to: "lead", fromSide: "bottom", toSide: "top", fromAlong: -0.36 },
  { id: "e-lead-documents", from: "lead", to: "documents", fromSide: "bottom", toSide: "top" },
  { id: "e-hub-order", from: "hub", to: "order", fromSide: "bottom", toSide: "top" },
  { id: "e-order-shipping", from: "order", to: "shipping", fromSide: "bottom", toSide: "top" },
  { id: "e-hub-invoice", from: "hub", to: "invoice", fromSide: "bottom", toSide: "top", fromAlong: 0.36 },
  { id: "e-invoice-paid", from: "invoice", to: "paid", fromSide: "bottom", toSide: "top" },
  // Dashed exception path, routed around the fulfilment column
  { id: "e-hub-human", from: "hub", to: "human", fromSide: "left", toSide: "left", fromAlong: 0.28, dashed: true },
];

const MAIN_PULSE: { edge: string; fromMs: number; toMs: number }[] = [
  { edge: "e-hub-missed", fromMs: 900, toMs: 1600 },
  { edge: "e-missed-reply", fromMs: 1700, toMs: 2300 },
  { edge: "e-hub-booked", fromMs: 2500, toMs: 3200 },
  { edge: "e-booked-reminder", fromMs: 3300, toMs: 3900 },
  { edge: "e-hub-lead", fromMs: 4100, toMs: 4800 },
  { edge: "e-lead-documents", fromMs: 4900, toMs: 5500 },
  { edge: "e-hub-order", fromMs: 5700, toMs: 6400 },
  { edge: "e-order-shipping", fromMs: 6500, toMs: 7100 },
  { edge: "e-hub-invoice", fromMs: 7300, toMs: 8000 },
  { edge: "e-invoice-paid", fromMs: 8100, toMs: 8700 },
  { edge: "e-hub-human", fromMs: 8900, toMs: 9800 },
];

const NODE_TIMES: Record<NodeId, { run: number; done: number; appear: number }> = {
  hub: { appear: 0, run: 0, done: 700 },
  missed: { appear: 900, run: 1600, done: 1700 },
  reply: { appear: 1700, run: 2300, done: 2500 },
  booked: { appear: 2500, run: 3200, done: 3300 },
  reminder: { appear: 3300, run: 3900, done: 4100 },
  lead: { appear: 4100, run: 4800, done: 4900 },
  documents: { appear: 4900, run: 5500, done: 5700 },
  order: { appear: 5700, run: 6400, done: 6500 },
  shipping: { appear: 6500, run: 7100, done: 7300 },
  invoice: { appear: 7300, run: 8000, done: 8100 },
  paid: { appear: 8100, run: 8700, done: 8900 },
  human: { appear: 8900, run: -1, done: -1 },
};

const LOOP_MS = 12000;
export const VIEW_W = PAD * 2 + COL * 3 + NODE_W; // 688
export const VIEW_H = HUMAN_Y + NODE_H + 16; // 572

function nodeById(id: NodeId) {
  return NODES.find((n) => n.id === id)!;
}

function sizeOf(node: FlowNode) {
  return { w: node.w ?? NODE_W, h: node.h ?? NODE_H };
}

function portPoint(node: FlowNode, side: Side, along = 0) {
  const { w, h } = sizeOf(node);
  const clamped = Math.max(-0.45, Math.min(0.45, along));
  switch (side) {
    case "left":
      return { x: node.x, y: node.y + h / 2 + clamped * h };
    case "right":
      return { x: node.x + w, y: node.y + h / 2 + clamped * h };
    case "top":
      return { x: node.x + w / 2 + clamped * w, y: node.y };
    case "bottom":
      return { x: node.x + w / 2 + clamped * w, y: node.y + h };
  }
}

function control(pt: { x: number; y: number }, side: Side, dist: number) {
  switch (side) {
    case "left":
      return { x: pt.x - dist, y: pt.y };
    case "right":
      return { x: pt.x + dist, y: pt.y };
    case "top":
      return { x: pt.x, y: pt.y - dist };
    case "bottom":
      return { x: pt.x, y: pt.y + dist };
  }
}

export function edgeEnds(edge: FlowEdge) {
  const from = nodeById(edge.from);
  const to = nodeById(edge.to);
  return {
    start: portPoint(from, edge.fromSide, edge.fromAlong),
    end: portPoint(to, edge.toSide, edge.toAlong),
  };
}

function edgePath(edge: FlowEdge) {
  const { start, end } = edgeEnds(edge);
  const span = Math.hypot(end.x - start.x, end.y - start.y);
  const dist = Math.max(28, Math.min(90, span * 0.45));
  // Exception path: leave the hub to the left and drop between Office and Fulfilment.
  if (edge.id === "e-hub-human") {
    const midX = 214;
    const midY = 248;
    const dropY = 470;
    const d = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${dropY} C ${midX} ${dropY + 18}, ${end.x - 18} ${end.y}, ${end.x} ${end.y}`;
    return { d, start, end };
  }
  if (edge.fromSide === "right" && edge.toSide === "left" && start.y === end.y) {
    return { d: `M ${start.x} ${start.y} L ${end.x} ${end.y}`, start, end };
  }
  if (edge.fromSide === "bottom" && edge.toSide === "top" && start.x === end.x) {
    const dy = Math.max(18, (end.y - start.y) * 0.5);
    const d = `M ${start.x} ${start.y} C ${start.x} ${start.y + dy}, ${end.x} ${end.y - dy}, ${end.x} ${end.y}`;
    return { d, start, end };
  }
  const c1 = control(start, edge.fromSide, dist);
  const c2 = control(end, edge.toSide, dist);
  const d = `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
  return { d, start, end };
}

const PORTS: Record<NodeId, Partial<Record<Side, boolean>>> = (() => {
  const out = Object.fromEntries(NODES.map((n) => [n.id, {}])) as Record<NodeId, Partial<Record<Side, boolean>>>;
  for (const e of EDGES) {
    out[e.from][e.fromSide] = true;
    out[e.to][e.toSide] = true;
  }
  return out;
})();

function stateAt(id: NodeId, t: number, reduced: boolean): NodeState {
  if (id === "hub") return reduced || t >= NODE_TIMES.hub.done ? "done" : t >= 0 ? "running" : "idle";
  if (reduced) return id === "human" ? "idle" : "done";
  if (id === "human") return "idle";
  const times = NODE_TIMES[id];
  if (t >= times.done) return "done";
  if (t >= times.run) return "running";
  return "idle";
}

function visibleAt(id: NodeId, t: number, reduced: boolean) {
  if (reduced) return true;
  return t >= NODE_TIMES[id].appear;
}

const MOBILE_GROUPS: { label: string; nodes: { id: NodeId; title: string; sub: string; icon: FlowNode["icon"] }[] }[] = [
  { label: "Cytron automation", nodes: [{ id: "hub", title: "Cytron automation", sub: "Runs in the background", icon: Cpu }] },
  {
    label: "Enquiries",
    nodes: [
      { id: "missed", title: "Missed call", sub: "After hours", icon: PhoneMissed },
      { id: "reply", title: "Instant reply", sub: "Under a minute", icon: MessageSquare },
    ],
  },
  {
    label: "Bookings",
    nodes: [
      { id: "booked", title: "Booked", sub: "In the calendar", icon: CalendarCheck },
      { id: "reminder", title: "Reminder", sub: "Day before", icon: Bell },
    ],
  },
  {
    label: "Office",
    nodes: [
      { id: "lead", title: "Lead saved", sub: "CRM", icon: Database },
      { id: "documents", title: "Documents in", sub: "Collected", icon: FileText },
    ],
  },
  {
    label: "Fulfilment",
    nodes: [
      { id: "order", title: "Order check", sub: "Shopify", icon: Package },
      { id: "shipping", title: "Shipping docs", sub: "Ready to pack", icon: Truck },
    ],
  },
  {
    label: "Finance",
    nodes: [
      { id: "invoice", title: "Invoice sent", sub: "Xero", icon: Receipt },
      { id: "paid", title: "Paid", sub: "Pay-by-link", icon: Check },
    ],
  },
  {
    label: "Exceptions",
    nodes: [{ id: "human", title: "Human review", sub: "When needed", icon: UserRound }],
  },
];

function NodeCard({
  node,
  state,
  style,
}: {
  node: FlowNode | { id: NodeId; title: string; sub: string; icon: FlowNode["icon"]; kind?: NodeKind };
  state: NodeState;
  style?: React.CSSProperties;
}) {
  const Icon = node.icon;
  const kind: NodeKind = "kind" in node && node.kind ? node.kind : node.id === "hub" ? "hub" : node.id === "human" ? "human" : "task";
  const isHub = kind === "hub";
  const isHuman = kind === "human";
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border bg-white px-2.5 py-2.5 ${
        isHuman
          ? "border-dashed border-slate-300"
          : isHub
            ? "border-[#c7c8f8]"
            : state === "running"
              ? "border-[#5b5cf6]"
              : "border-[#e5e7eb]"
      }`}
      style={{
        width: NODE_W,
        height: NODE_H,
        boxShadow: isHub
          ? "0 1px 2px rgba(15,23,42,0.05), 0 10px 24px rgba(91,92,246,0.08)"
          : "0 1px 2px rgba(15,23,42,0.05), 0 8px 20px rgba(15,23,42,0.06)",
        ...style,
      }}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
          isHub
            ? "bg-[#5b5cf6] text-white"
            : state === "done"
              ? "bg-emerald-50 text-emerald-700"
              : state === "running"
                ? "bg-[#5b5cf6] text-white"
                : "bg-[#f7f8fa] text-slate-700"
        }`}
      >
        {state === "done" && !isHub ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate font-semibold tracking-tight text-slate-900 ${isHub ? "text-[13px]" : "text-[12px]"}`}>
          {node.title}
        </span>
        <span
          className={`block leading-tight text-slate-600 ${
            isHub
              ? "whitespace-nowrap text-[12px] tracking-normal"
              : "truncate text-[11px] tracking-tight"
          }`}
        >
          {node.sub}
        </span>
      </span>
    </div>
  );
}

function useLoop(active: boolean, reduced: boolean) {
  const [t, setT] = useState(reduced ? LOOP_MS : 0);
  useEffect(() => {
    if (reduced) {
      setT(LOOP_MS);
      return;
    }
    if (!active) return;
    let raf = 0;
    let start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) % LOOP_MS;
      setT(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);
  return t;
}

function DesktopFlow({ time, reduced }: { time: number; reduced: boolean }) {
  const paths = useMemo(() => Object.fromEntries(EDGES.map((e) => [e.id, edgePath(e)])), []);
  const pulses = MAIN_PULSE.map((p) => {
    const on = !reduced && time >= p.fromMs && time < p.toMs;
    const progress = on ? (time - p.fromMs) / (p.toMs - p.fromMs) : 0;
    return { ...p, on, progress };
  });

  return (
    <div className="relative h-full w-full" style={{ width: VIEW_W, height: VIEW_H }}>
      <svg width={VIEW_W} height={VIEW_H} className="absolute inset-0" aria-hidden>
        <defs>
          <pattern id="hero-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="0.9" fill="#d1d5db" />
          </pattern>
        </defs>
        <rect width={VIEW_W} height={VIEW_H} fill="url(#hero-dot-grid)" opacity="0.7" />
        {EDGES.map((edge) => {
          const { d } = paths[edge.id];
          const fromVisible = visibleAt(edge.from, time, reduced);
          const toVisible = visibleAt(edge.to, time, reduced);
          const show = fromVisible && (toVisible || (!reduced && time >= NODE_TIMES[edge.to].appear - 200));
          const live = pulses.some((p) => p.edge === edge.id && p.on);
          const consumed =
            reduced ||
            MAIN_PULSE.filter((p) => p.edge === edge.id).some((p) => time >= p.toMs);
          if (!show) return null;
          return (
            <motion.path
              key={edge.id}
              d={d}
              fill="none"
              stroke={live || consumed ? "#5b5cf6" : "#cbd5e1"}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={live ? 1.75 : 1.4}
              strokeDasharray={edge.dashed ? "5 5" : undefined}
              strokeOpacity={edge.dashed ? 0.7 : 1}
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : 0.7, ease: "easeOut" }}
            />
          );
        })}
        {pulses
          .filter((p) => p.on)
          .map((p) => (
            <TravelDot key={p.edge} d={paths[p.edge].d} t={p.progress} />
          ))}
      </svg>

      {LANES.map((lane) => {
        const related: NodeId[] =
          lane.id === "enquiries"
            ? ["missed"]
            : lane.id === "bookings"
              ? ["booked"]
              : lane.id === "office"
                ? ["lead"]
                : lane.id === "fulfilment"
                  ? ["order"]
                  : lane.id === "finance"
                    ? ["invoice"]
                    : ["human"];
        const show = reduced || related.some((id) => visibleAt(id, time, reduced));
        if (!show) return null;
        return (
          <p
            key={lane.id}
            className="absolute text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
            style={{ left: lane.x, top: lane.y, width: lane.w }}
          >
            {lane.label}
          </p>
        );
      })}

      {NODES.map((node) => {
        if (!visibleAt(node.id, time, reduced) && !reduced) {
          return null;
        }
        const state = stateAt(node.id, time, reduced);
        const sides = PORTS[node.id];
        const { w, h } = sizeOf(node);
        const dot = "absolute z-10 h-2 w-2 rounded-full border bg-white";
        const on = state === "running" || node.kind === "hub" ? "border-[#5b5cf6]" : "border-[#d1d5db]";
        return (
          <motion.div
            key={node.id}
            className="absolute"
            style={{ left: node.x, top: node.y, width: w, height: h }}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {sides.left && <span className={`${dot} ${on} left-0 top-1/2 -translate-x-1/2 -translate-y-1/2`} aria-hidden />}
            {sides.right && <span className={`${dot} ${on} right-0 top-1/2 translate-x-1/2 -translate-y-1/2`} aria-hidden />}
            {sides.top && <span className={`${dot} ${on} left-1/2 top-0 -translate-x-1/2 -translate-y-1/2`} aria-hidden />}
            {sides.bottom && <span className={`${dot} ${on} bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2`} aria-hidden />}
            <NodeCard node={node} state={state} style={{ width: w, height: h }} />
          </motion.div>
        );
      })}
    </div>
  );
}

function TravelDot({ d, t }: { d: string; t: number }) {
  const ref = useRef<SVGPathElement>(null);
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength();
    const p = el.getPointAtLength(Math.max(0, Math.min(1, t)) * len);
    setPt({ x: p.x, y: p.y });
  }, [d, t]);
  return (
    <>
      <path ref={ref} d={d} fill="none" stroke="none" />
      {pt && <circle cx={pt.x} cy={pt.y} r="4" fill="#5b5cf6" />}
    </>
  );
}

function MobileFlow({ time, reduced }: { time: number; reduced: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-sm px-5">
      {MOBILE_GROUPS.map((group) => {
        const showGroup = reduced || group.nodes.some((node) => visibleAt(node.id, time, reduced));
        if (!showGroup) return null;
        return (
        <div key={group.label} className="mb-5 last:mb-0">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{group.label}</p>
          <ol className="relative">
            <span className="absolute bottom-6 left-[5px] top-6 w-px bg-[#e5e7eb]" aria-hidden />
            {group.nodes.map((node) => {
              const state = stateAt(node.id, time, reduced);
              const show = visibleAt(node.id, time, reduced);
              if (!show) return null;
              return (
                <li key={node.id} className="relative mb-3 last:mb-0 flex items-start gap-3">
                  <span
                    className={`relative z-10 mt-4 h-2.5 w-2.5 shrink-0 rounded-full border ${
                      state === "done" || state === "running" || node.id === "hub"
                        ? "border-[#5b5cf6] bg-[#5b5cf6]"
                        : "border-[#e5e7eb] bg-white"
                    }`}
                    aria-hidden
                  />
                  <NodeCard
                    node={node}
                    state={state}
                    style={
                      node.id === "hub"
                        ? { width: "100%", maxWidth: 320, height: "auto", minHeight: NODE_H }
                        : { width: "100%", maxWidth: 280 }
                    }
                  />
                </li>
              );
            })}
          </ol>
        </div>
        );
      })}
    </div>
  );
}

/** Scales the fixed-size canvas down to fit its column (never up), so nothing is clipped at any width. */
function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(1, w / VIEW_W));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, scale };
}

export default function HeroFlow({ reduced: reducedProp }: { reduced?: boolean }) {
  const reducedHook = useReducedMotion() === true;
  const reduced = reducedProp ?? reducedHook;
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const time = useLoop(inView, reduced);
  const { ref: fitRef, scale } = useFitScale();

  return (
    <div ref={rootRef} className="relative w-full" aria-hidden="true">
      <div ref={fitRef} className="hidden w-full md:block">
        <div className="mx-auto" style={{ width: VIEW_W * scale, height: VIEW_H * scale }}>
          <div style={{ width: VIEW_W, height: VIEW_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
            <DesktopFlow time={time} reduced={reduced} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-6 md:hidden">
        <MobileFlow time={time} reduced={reduced} />
      </div>
    </div>
  );
}

export const HERO_FLOW_SUMMARY =
  "Cytron automation, running in the background, handles enquiries, bookings, office admin, fulfilment and invoices. Anything unusual is held for a person.";
