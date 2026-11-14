"use client";

import React, { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  CONSTELLATION_TOOLS,
  driftedPositions,
  type ConstellationId,
  type NodePoint,
} from "./hero-constellation-data";
import { BrandMark } from "./hero-constellation-marks";

const TILE = 44;
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
  inViewRef.current = inView;
  reducedRef.current = reduced;

  useEffect(() => {
    const onVis = () => {
      visibleRef.current = document.visibilityState === "visible";
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const applyLayout = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;
      sizeRef.current = { w, h };
      pointsRef.current = driftedPositions(w, h, 0, true);
      paint(pointsRef.current);
    };

    applyLayout();
    const ro = new ResizeObserver(applyLayout);
    ro.observe(el);

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const running = inViewRef.current && visibleRef.current && !reducedRef.current;
      if (!running) return;
      const { w, h } = sizeRef.current;
      if (w <= 0) return;
      // Ease parallax toward the target so it stays a few pixels and never snaps.
      const p = parallaxRef.current;
      const t = mouseRef.current;
      p.x += (t.x - p.x) * 0.08;
      p.y += (t.y - p.y) * 0.08;
      const elapsed = now - start;
      const points = driftedPositions(w, h, elapsed, false, p);
      pointsRef.current = points;
      paint(points);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseRef.current = { x: nx * PARALLAX, y: ny * PARALLAX };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  function paint(points: NodePoint[]) {
    for (const p of points) {
      const tile = tileRefs.current[p.id];
      if (tile) {
        tile.style.transform = `translate3d(${p.x - TILE / 2}px, ${p.y - TILE / 2}px, 0)`;
        tile.style.visibility = "visible";
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block"
      aria-hidden="true"
    >
      {CONSTELLATION_TOOLS.map((tool) => (
        <div
          key={tool.id}
          ref={(el) => {
            tileRefs.current[tool.id] = el;
          }}
          className="hero-constellation-tile absolute left-0 top-0 flex items-center justify-center overflow-hidden rounded-xl border border-[#e5e7eb] bg-white/90"
          style={{ width: TILE, height: TILE, willChange: "transform", visibility: "hidden" }}
        >
          <BrandMark id={tool.id} label={tool.label} />
        </div>
      ))}
    </div>
  );
}
