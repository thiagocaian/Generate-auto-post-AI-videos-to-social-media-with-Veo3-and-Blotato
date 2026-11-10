"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Bell,
  CalendarCheck,
  Check,
  Database,
  MessageSquare,
  PhoneMissed,
  Receipt,
  UserRound,
  type LucideIcon,
} from "lucide-react";

type NodeId = "trigger" | "sms" | "booked" | "crm" | "reminder" | "invoice" | "paid" | "human";
type NodeState = "idle" | "running" | "done";

type FlowNode = {
  id: NodeId;
  x: number;
  y: number;
  title: string;
  sub: string;
  icon: LucideIcon;
};

type FlowEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
  /** Leaves from the bottom of `from` and enters the top of `to`. */
  vertical?: boolean;
  dashed?: boolean;
};

// Flat, grid-aligned canvas: 4 columns × 4 rows. Everything is on the same plane
// (no rotate / translateZ), so the connector lines always meet the cards exactly.
const NODE_W = 148;
const NODE_H = 64;
const COL = 172; // column pitch
const PAD = 12; // room for the port dots on the outer edges

const NODES: FlowNode[] = [
  { id: "trigger", x: PAD, y: 150, title: "Missed call", sub: "Tue 6:42 pm", icon: PhoneMissed },
  { id: "sms", x: PAD + COL, y: 150, title: "AI reply", sub: "Sent in 40s", icon: MessageSquare },
  { id: "booked", x: PAD + COL * 2, y: 40, title: "Booked", sub: "Thu 9:00 am", icon: CalendarCheck },
  { id: "crm", x: PAD + COL * 2, y: 260, title: "Lead saved", sub: "CRM", icon: Database },
  { id: "reminder", x: PAD + COL * 3, y: 40, title: "Reminder", sub: "Day before", icon: Bell },
  { id: "invoice", x: PAD + COL * 3, y: 260, title: "Invoice sent", sub: "Xero", icon: Receipt },
  { id: "paid", x: PAD + COL * 3, y: 376, title: "Paid", sub: "Same day", icon: Check },
  { id: "human", x: PAD + COL, y: 300, title: "Human review", sub: "When needed", icon: UserRound },
];

const EDGES: FlowEdge[] = [
  { id: "e-trigger-sms", from: "trigger", to: "sms" },
  { id: "e-sms-booked", from: "sms", to: "booked" },
  { id: "e-sms-crm", from: "sms", to: "crm" },
  { id: "e-sms-human", from: "sms", to: "human", vertical: true, dashed: true },
  { id: "e-booked-reminder", from: "booked", to: "reminder" },
  { id: "e-reminder-invoice", from: "reminder", to: "invoice", vertical: true },
  { id: "e-crm-invoice", from: "crm", to: "invoice" },
  { id: "e-invoice-paid", from: "invoice", to: "paid", vertical: true },
];

const MAIN_PULSE: { edge: string; fromMs: number; toMs: number }[] = [
  { edge: "e-trigger-sms", fromMs: 500, toMs: 1500 },
  { edge: "e-sms-booked", fromMs: 2100, toMs: 3000 },
  { edge: "e-sms-crm", fromMs: 2100, toMs: 3000 },
  { edge: "e-booked-reminder", fromMs: 3500, toMs: 4400 },
  { edge: "e-reminder-invoice", fromMs: 4900, toMs: 5800 },
  { edge: "e-crm-invoice", fromMs: 3500, toMs: 4900 },
  { edge: "e-invoice-paid", fromMs: 6300, toMs: 7200 },
];

const NODE_TIMES: Record<NodeId, { run: number; done: number }> = {
  trigger: { run: 0, done: 500 },
  sms: { run: 1500, done: 2100 },
  booked: { run: 3000, done: 3500 },
  crm: { run: 3000, done: 3500 },
  reminder: { run: 4400, done: 4900 },
  invoice: { run: 5800, done: 6300 },
  paid: { run: 7200, done: 7700 },
  human: { run: -1, done: -1 },
};

const LOOP_MS = 9500;
export const VIEW_W = PAD * 2 + COL * 3 + NODE_W; // 688
export const VIEW_H = 376 + NODE_H + 16; // 456

function nodeById(id: NodeId) {
  return NODES.find((n) => n.id === id)!;
}

export function edgeEnds(edge: FlowEdge) {
  const from = nodeById(edge.from);
  const to = nodeById(edge.to);
  if (edge.vertical) {
    return {
      start: { x: from.x + NODE_W / 2, y: from.y + NODE_H },
      end: { x: to.x + NODE_W / 2, y: to.y },
    };
  }
  return {
    start: { x: from.x + NODE_W, y: from.y + NODE_H / 2 },
    end: { x: to.x, y: to.y + NODE_H / 2 },
  };
}

function edgePath(edge: FlowEdge) {
  const { start, end } = edgeEnds(edge);
  let d: string;
  if (edge.vertical) {
    const dy = Math.max(18, (end.y - start.y) * 0.5);
    d = `M ${start.x} ${start.y} C ${start.x} ${start.y + dy}, ${end.x} ${end.y - dy}, ${end.x} ${end.y}`;
  } else if (start.y === end.y) {
    d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  } else {
    const dx = (end.x - start.x) * 0.5;
    d = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
  }
  return { d, start, end };
}

/** Which sides of each card have a connector, so port dots are drawn only where a line meets the card. */
const PORTS: Record<NodeId, Set<"left" | "right" | "top" | "bottom">> = (() => {
  const out = Object.fromEntries(NODES.map((n) => [n.id, new Set()])) as Record<NodeId, Set<"left" | "right" | "top" | "bottom">>;
  for (const e of EDGES) {
    out[e.from].add(e.vertical ? "bottom" : "right");
    out[e.to].add(e.vertical ? "top" : "left");
  }
  return out;
})();

function stateAt(id: NodeId, t: number, reduced: boolean): NodeState {
  if (reduced) return id === "human" ? "idle" : "done";
  if (id === "human") return "idle";
  const times = NODE_TIMES[id];
  if (t >= times.done) return "done";
  if (t >= times.run) return "running";
  return "idle";
}

const MOBILE_STEPS: { id: NodeId; title: string; sub: string; icon: FlowNode["icon"] }[] = [
  { id: "trigger", title: "Missed call", sub: "Tue 6:42 pm", icon: PhoneMissed },
  { id: "sms", title: "AI reply", sub: "Sent in 40s", icon: MessageSquare },
  { id: "booked", title: "Booked", sub: "Thu 9:00 am", icon: CalendarCheck },
  { id: "invoice", title: "Invoice sent", sub: "Xero", icon: Receipt },
  { id: "paid", title: "Paid", sub: "Same day", icon: Check },
];

function NodeCard({
  node,
  state,
  style,
}: {
  node: FlowNode | (typeof MOBILE_STEPS)[number];
  state: NodeState;
  style?: React.CSSProperties;
}) {
  const Icon = node.icon;
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border bg-white px-2.5 py-2.5 ${
        "id" in node && node.id === "human"
          ? "border-dashed border-slate-300"
          : state === "running"
            ? "border-[#5b5cf6]"
            : "border-[#e5e7eb]"
      }`}
      style={{
        width: NODE_W,
        height: NODE_H,
        boxShadow: "0 1px 2px rgba(15,23,42,0.05), 0 8px 20px rgba(15,23,42,0.06)",
        ...style,
      }}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
          state === "done"
            ? "bg-emerald-50 text-emerald-700"
            : state === "running"
              ? "bg-[#5b5cf6] text-white"
              : "bg-[#f7f8fa] text-slate-700"
        }`}
      >
        {state === "done" ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-semibold tracking-tight text-slate-900">{node.title}</span>
        <span className="block truncate text-[11px] leading-tight tracking-tight text-slate-600">{node.sub}</span>
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
          const live = pulses.some((p) => p.edge === edge.id && p.on);
          const consumed =
            reduced ||
            MAIN_PULSE.filter((p) => p.edge === edge.id).some((p) => time >= p.toMs) ||
            (edge.dashed && time >= NODE_TIMES.sms.done);
          return (
            <motion.path
              key={edge.id}
              d={d}
              fill="none"
              stroke={live || consumed ? "#5b5cf6" : "#cbd5e1"}
              strokeLinecap="round"
              strokeWidth={live ? 1.75 : 1.4}
              strokeDasharray={edge.dashed ? "5 5" : undefined}
              strokeOpacity={edge.dashed ? 0.7 : 1}
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : 0.9, ease: "easeOut" }}
            />
          );
        })}
        {pulses
          .filter((p) => p.on)
          .map((p) => (
            <TravelDot key={p.edge} d={paths[p.edge].d} t={p.progress} />
          ))}
      </svg>

      {NODES.map((node) => {
        const state = stateAt(node.id, time, reduced);
        const sides = PORTS[node.id];
        const dot = "absolute z-10 h-2 w-2 rounded-full border bg-white";
        const on = state === "running" ? "border-[#5b5cf6]" : "border-[#d1d5db]";
        return (
          <div key={node.id} className="absolute" style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}>
            {sides.has("left") && <span className={`${dot} ${on} left-0 top-1/2 -translate-x-1/2 -translate-y-1/2`} aria-hidden />}
            {sides.has("right") && <span className={`${dot} ${on} right-0 top-1/2 translate-x-1/2 -translate-y-1/2`} aria-hidden />}
            {sides.has("top") && <span className={`${dot} ${on} left-1/2 top-0 -translate-x-1/2 -translate-y-1/2`} aria-hidden />}
            {sides.has("bottom") && <span className={`${dot} ${on} bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2`} aria-hidden />}
            <NodeCard node={node} state={state} />
          </div>
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
    <ol className="relative mx-auto w-full max-w-sm px-5">
      <span className="absolute bottom-6 left-[34px] top-6 w-px bg-[#e5e7eb]" aria-hidden />
      {MOBILE_STEPS.map((node, i) => {
        const state = stateAt(node.id, time, reduced);
        return (
          <li key={node.id} className="relative mb-4 last:mb-0 flex items-start gap-3">
            <span
              className={`relative z-10 mt-4 h-2.5 w-2.5 shrink-0 rounded-full border ${
                state === "done" || state === "running" ? "border-[#5b5cf6] bg-[#5b5cf6]" : "border-[#e5e7eb] bg-white"
              }`}
              aria-hidden
            />
            <NodeCard node={node} state={state} style={{ width: "100%", maxWidth: 280 }} />
          </li>
        );
      })}
    </ol>
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
      {/* Tablet and desktop: flat node graph, scaled to fit the column */}
      <div ref={fitRef} className="hidden w-full md:block">
        <div className="mx-auto" style={{ width: VIEW_W * scale, height: VIEW_H * scale }}>
          <div style={{ width: VIEW_W, height: VIEW_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
            <DesktopFlow time={time} reduced={reduced} />
          </div>
        </div>
      </div>

      {/* Phones: vertical flow */}
      <div className="flex items-center justify-center py-6 md:hidden">
        <MobileFlow time={time} reduced={reduced} />
      </div>
    </div>
  );
}

export const HERO_FLOW_SUMMARY =
  "A missed call is answered by an automatic SMS, the job is booked in the calendar, a reminder is sent, an invoice is synced to Xero and paid. Unclear cases are held for a person.";
