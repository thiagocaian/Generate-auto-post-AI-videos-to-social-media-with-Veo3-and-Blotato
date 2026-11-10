"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
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
  z: number;
  title: string;
  sub: string;
  icon: LucideIcon;
};

type FlowEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
  dashed?: boolean;
};

const NODE_W = 156;
const NODE_H = 68;

const NODES: FlowNode[] = [
  { id: "trigger", x: 8, y: 156, z: 8, title: "Missed call", sub: "Tue 6:42 pm", icon: PhoneMissed },
  { id: "sms", x: 184, y: 156, z: 16, title: "AI reply", sub: "Sent in 40s", icon: MessageSquare },
  { id: "booked", x: 360, y: 56, z: 24, title: "Booked", sub: "Thu 9:00 am", icon: CalendarCheck },
  { id: "crm", x: 360, y: 244, z: 10, title: "Lead saved", sub: "CRM", icon: Database },
  { id: "reminder", x: 536, y: 56, z: 20, title: "Reminder", sub: "Day before", icon: Bell },
  { id: "invoice", x: 536, y: 244, z: 28, title: "Invoice sent", sub: "Xero", icon: Receipt },
  { id: "paid", x: 712, y: 244, z: 36, title: "Paid ✓", sub: "Same day · by link", icon: Check },
  { id: "human", x: 184, y: 352, z: -8, title: "Human review", sub: "Held for a person", icon: UserRound },
];

const EDGES: FlowEdge[] = [
  { id: "e-trigger-sms", from: "trigger", to: "sms" },
  { id: "e-sms-booked", from: "sms", to: "booked" },
  { id: "e-sms-crm", from: "sms", to: "crm" },
  { id: "e-sms-human", from: "sms", to: "human", dashed: true },
  { id: "e-booked-reminder", from: "booked", to: "reminder" },
  { id: "e-reminder-invoice", from: "reminder", to: "invoice" },
  { id: "e-crm-invoice", from: "crm", to: "invoice" },
  { id: "e-invoice-paid", from: "invoice", to: "paid" },
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
const VIEW_W = 900;
const VIEW_H = 500;

function nodeById(id: NodeId) {
  return NODES.find((n) => n.id === id)!;
}

function ports(from: FlowNode, to: FlowNode, dashedDown = false) {
  const start = { x: from.x + NODE_W, y: from.y + NODE_H / 2 };
  const end = { x: to.x, y: to.y + NODE_H / 2 };
  if (to.x === from.x || dashedDown) {
    // mostly vertical
    return {
      start: { x: from.x + NODE_W / 2, y: from.y + NODE_H },
      end: { x: to.x + NODE_W / 2, y: to.y },
    };
  }
  if (Math.abs(to.y - from.y) > 40 && to.x > from.x) {
    return { start, end };
  }
  return { start, end };
}

function edgePath(edge: FlowEdge) {
  const from = nodeById(edge.from);
  const to = nodeById(edge.to);
  const downFromReminder = edge.from === "reminder" && edge.to === "invoice";
  let start: { x: number; y: number };
  let end: { x: number; y: number };
  if (downFromReminder) {
    start = { x: from.x + NODE_W / 2, y: from.y + NODE_H };
    end = { x: to.x + NODE_W / 2, y: to.y };
  } else if (edge.to === "human") {
    start = { x: from.x + NODE_W / 2, y: from.y + NODE_H };
    end = { x: to.x + NODE_W / 2, y: to.y };
  } else {
    const p = ports(from, to);
    start = p.start;
    end = p.end;
  }
  const dx = Math.max(40, Math.abs(end.x - start.x) * 0.45);
  const dy = Math.abs(end.y - start.y);
  let c1: { x: number; y: number };
  let c2: { x: number; y: number };
  if (downFromReminder || edge.to === "human") {
    c1 = { x: start.x, y: start.y + Math.max(36, dy * 0.4) };
    c2 = { x: end.x, y: end.y - Math.max(36, dy * 0.4) };
  } else {
    c1 = { x: start.x + dx, y: start.y };
    c2 = { x: end.x - dx, y: end.y };
  }
  const d = `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
  return { d, start, end };
}

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
  { id: "paid", title: "Paid ✓", sub: "Same day · by link", icon: Check },
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
        return (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: node.x,
              top: node.y,
              transform: `translateZ(${node.z}px)`,
            }}
          >
            {/* ports */}
            <span
              className="absolute left-0 top-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e5e7eb] bg-white"
              aria-hidden
            />
            <span
              className={`absolute right-0 top-1/2 z-10 h-2 w-2 translate-x-1/2 -translate-y-1/2 rounded-full border bg-white ${
                state === "running" ? "border-[#5b5cf6]" : "border-[#e5e7eb]"
              }`}
              aria-hidden
            />
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

export default function HeroFlow({ reduced: reducedProp }: { reduced?: boolean }) {
  const reducedHook = useReducedMotion() === true;
  const reduced = reducedProp ?? reducedHook;
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const time = useLoop(inView, reduced);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 160, damping: 22, mass: 0.4 };
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [11, 5]), spring);
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-11, -5]), spring);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-hidden="true"
    >
      {/* Desktop 3D canvas */}
      <div className="hidden h-full w-full lg:flex lg:items-center" style={{ perspective: 1400 }}>
        <motion.div
          className="origin-left"
          style={{
            rotateX: reduced ? 8 : tiltX,
            rotateY: reduced ? -8 : tiltY,
            transformStyle: "preserve-3d",
          }}
        >
          <DesktopFlow time={time} reduced={reduced} />
        </motion.div>
      </div>

      {/* Mobile vertical flow */}
      <div className="flex h-full items-center justify-center py-6 lg:hidden">
        <MobileFlow time={time} reduced={reduced} />
      </div>
    </div>
  );
}

export const HERO_FLOW_SUMMARY =
  "A missed call is answered by an automatic SMS, the job is booked in the calendar, a reminder is sent, an invoice is synced to Xero and paid. Unclear cases are held for a person.";
