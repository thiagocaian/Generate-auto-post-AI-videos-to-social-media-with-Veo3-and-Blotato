"use client";

import React, { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  CONSTELLATION_TOOLS,
  DESKTOP_TILE,
  MD_MIN,
  MOBILE_ANCHORS,
  MOBILE_TILE,
  driftedPositions,
  tileSizeFor,
  type ConstellationId,
  type NodePoint,
} from "./hero-constellation-data";
import { BrandMark } from "./hero-constellation-marks";

const PARALLAX = 6;

const MOBILE_DRIFT_CLASS = [
  "hero-constellation-mobile-tile--top-a",
  "hero-constellation-mobile-tile--top-b",
  "hero-constellation-mobile-tile--top-a",
  "hero-constellation-mobile-tile--top-b",
  "hero-constellation-mobile-tile--bottom-a",
  "hero-constellation-mobile-tile--bottom-b",
  "hero-constellation-mobile-tile--bottom-a",
  "hero-constellation-mobile-tile--bottom-b",
] as const;

function MobileConstellation({ reduced }: { reduced: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:hidden"
      aria-hidden="true"
    >
      {MOBILE_ANCHORS.map((anchor, i) => {
        const fromBottom = anchor.yFrom === "bottom";
        return (
          <div
            key={anchor.id}
            className={[
              "hero-constellation-tile hero-constellation-mobile-tile absolute flex items-center justify-center overflow-hidden rounded-xl border border-[#e5e7eb] bg-white/90",
              fromBottom ? "hero-constellation-mobile-tile--bottom" : "hero-constellation-mobile-tile--top",
              reduced ? "" : MOBILE_DRIFT_CLASS[i],
            ].join(" ")}
            style={{
              left: `${anchor.x}%`,
              width: MOBILE_TILE,
              height: MOBILE_TILE,
              ...(fromBottom ? { bottom: anchor.y } : { top: anchor.y }),
            }}
          >
            <span className="flex items-center justify-center scale-[0.72]">
              <BrandMark id={anchor.id} label={CONSTELLATION_TOOLS.find((tool) => tool.id === anchor.id)?.label ?? anchor.id} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DesktopConstellation({ reduced }: { reduced: boolean }) {
  const reducedHook = useReducedMotion() === true;
  const reduce = reduced || reducedHook;
  const rootRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Partial<Record<ConstellationId, HTMLDivElement | null>>>({});
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const parallaxRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef<NodePoint[]>([]);
  const inView = useInView(rootRef, { amount: 0.15 });
  const inViewRef = useRef(inView);
  const visibleRef = useRef(true);
  const reducedRef = useRef(reduce);
  const kickRef = useRef<() => void>(() => {});
  inViewRef.current = inView;
  reducedRef.current = reduce;

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
  }, [inView, reduce]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let raf = 0;
    let ro: ResizeObserver | null = null;

    const applyLayout = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;
      sizeRef.current = { w, h };
      pointsRef.current = driftedPositions(w, h, 0, true);
      paint(pointsRef.current, w);
    };

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
      const p = parallaxRef.current;
      const t = mouseRef.current;
      p.x += (t.x - p.x) * 0.08;
      p.y += (t.y - p.y) * 0.08;
      const elapsed = now - start;
      const points = driftedPositions(w, h, elapsed, false, p);
      pointsRef.current = points;
      paint(points, w);
    };

    let start = 0;
    const kick = () => {
      if (!raf && inViewRef.current && visibleRef.current && !reducedRef.current) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: MouseEvent) => {
      if (window.matchMedia("(hover: none)").matches) {
        mouseRef.current = { x: 0, y: 0 };
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseRef.current = { x: nx * PARALLAX, y: ny * PARALLAX };
    };

    const stop = () => {
      kickRef.current = () => {};
      cancelAnimationFrame(raf);
      raf = 0;
      ro?.disconnect();
      ro = null;
      window.removeEventListener("mousemove", onMove);
    };

    const startDesktop = () => {
      stop();
      start = performance.now();
      applyLayout();
      ro = new ResizeObserver(applyLayout);
      ro.observe(el);
      kickRef.current = kick;
      kick();
      window.addEventListener("mousemove", onMove, { passive: true });
    };

    const mq = window.matchMedia(`(min-width: ${MD_MIN}px)`);
    const sync = () => {
      if (mq.matches) startDesktop();
      else stop();
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      stop();
    };
  }, []);

  function paint(points: NodePoint[], width = sizeRef.current.w) {
    const tile = tileSizeFor(width);
    const seen = new Set(points.map((p) => p.id));
    for (const tool of CONSTELLATION_TOOLS) {
      const node = tileRefs.current[tool.id];
      if (!node) continue;
      if (!seen.has(tool.id)) {
        node.style.visibility = "hidden";
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
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block"
      aria-hidden="true"
    >
      {CONSTELLATION_TOOLS.map((tool) => (
        <div
          key={tool.id}
          ref={(node) => {
            tileRefs.current[tool.id] = node;
          }}
          className="hero-constellation-tile absolute left-0 top-0 flex items-center justify-center overflow-hidden rounded-xl border border-[#e5e7eb] bg-white/90"
          style={{ width: DESKTOP_TILE, height: DESKTOP_TILE, willChange: "transform", visibility: "hidden" }}
        >
          <span className="flex items-center justify-center md:contents">
            <BrandMark id={tool.id} label={tool.label} />
          </span>
        </div>
      ))}
    </div>
  );
}

export default function HeroConstellation({ reduced: reducedProp }: { reduced?: boolean }) {
  const reducedHook = useReducedMotion() === true;
  const reduced = reducedProp ?? reducedHook;
  return (
    <>
      <MobileConstellation reduced={reduced} />
      <DesktopConstellation reduced={reduced} />
    </>
  );
}
