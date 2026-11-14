"use client";

import React, { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  CONSTELLATION_TOOLS,
  DESKTOP_TILE,
  MD_MIN,
  driftedPositions,
  tileSizeFor,
  type ConstellationId,
  type NodePoint,
} from "./hero-constellation-data";
import { BrandMark } from "./hero-constellation-marks";

const PARALLAX = 6;

export default function HeroConstellation({ reduced: reducedProp }: { reduced?: boolean }) {
  const reducedHook = useReducedMotion() === true;
  const reduced = reducedProp ?? reducedHook;
  const rootRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Partial<Record<ConstellationId, HTMLDivElement | null>>>({});
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const parallaxRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef<NodePoint[]>([]);
  const inView = useInView(rootRef, { amount: 0.15 });
  const inViewRef = useRef(inView);
  const visibleRef = useRef(true);
  const reducedRef = useRef(reduced);
  const kickRef = useRef<() => void>(() => {});
  inViewRef.current = inView;
  reducedRef.current = reduced;

  useEffect(() => {
    const onVis = () => {
      visibleRef.current = document.visibilityState === "visible";
      if (visibleRef.current) kickRef.current();
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    kickRef.current();
  }, [inView, reduced]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const applyLayout = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;
      sizeRef.current = { w, h };
      if (w < MD_MIN) {
        mouseRef.current = { x: 0, y: 0 };
        parallaxRef.current = { x: 0, y: 0 };
      }
      pointsRef.current = driftedPositions(w, h, 0, true);
      paint(pointsRef.current, w);
    };

    applyLayout();
    const ro = new ResizeObserver(applyLayout);
    ro.observe(el);

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const running = inViewRef.current && visibleRef.current && !reducedRef.current;
      if (!running) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
      const { w, h } = sizeRef.current;
      if (w <= 0) return;
      // Ease parallax toward the target so it stays a few pixels and never snaps.
      // Mobile / touch: keep the target at zero so this eases back and never follows a pointer.
      const p = parallaxRef.current;
      const t = w < MD_MIN ? { x: 0, y: 0 } : mouseRef.current;
      p.x += (t.x - p.x) * 0.08;
      p.y += (t.y - p.y) * 0.08;
      const elapsed = now - start;
      const points = driftedPositions(w, h, elapsed, false, p);
      pointsRef.current = points;
      paint(points, w);
    };
    const kick = () => {
      if (!raf && inViewRef.current && visibleRef.current && !reducedRef.current) {
        raf = requestAnimationFrame(tick);
      }
    };
    kickRef.current = kick;
    kick();

    const onMove = (e: MouseEvent) => {
      const { w } = sizeRef.current;
      // No mouse parallax below md, or when the primary pointer cannot hover (touch).
      if (w < MD_MIN || window.matchMedia("(hover: none)").matches) {
        mouseRef.current = { x: 0, y: 0 };
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseRef.current = { x: nx * PARALLAX, y: ny * PARALLAX };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      kickRef.current = () => {};
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  function paint(points: NodePoint[], width = sizeRef.current.w) {
    const tile = tileSizeFor(width);
    const seen = new Set(points.map((p) => p.id));
    for (const tool of CONSTELLATION_TOOLS) {
      const el = tileRefs.current[tool.id];
      if (!el) continue;
      if (!seen.has(tool.id)) {
        el.style.visibility = "hidden";
        continue;
      }
    }
    for (const p of points) {
      const tileEl = tileRefs.current[p.id];
      if (!tileEl) continue;
      tileEl.style.width = `${tile}px`;
      tileEl.style.height = `${tile}px`;
      tileEl.style.transform = `translate3d(${p.x - tile / 2}px, ${p.y - tile / 2}px, 0)`;
      tileEl.style.visibility = "visible";
    }
  }

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {CONSTELLATION_TOOLS.map((tool) => (
        <div
          key={tool.id}
          ref={(el) => {
            tileRefs.current[tool.id] = el;
          }}
          className="hero-constellation-tile absolute left-0 top-0 flex items-center justify-center overflow-hidden rounded-xl border border-[#e5e7eb] bg-white/90"
          style={{ width: DESKTOP_TILE, height: DESKTOP_TILE, willChange: "transform", visibility: "hidden" }}
        >
          <span className="flex items-center justify-center max-md:scale-[0.72] md:contents">
            <BrandMark id={tool.id} label={tool.label} />
          </span>
        </div>
      ))}
    </div>
  );
}

