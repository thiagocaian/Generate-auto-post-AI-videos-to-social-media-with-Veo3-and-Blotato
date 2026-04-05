"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export const CanvasRevealEffect = ({
  animationSpeed = 3,
  colors = [[59, 130, 246]],
  containerClassName,
  dotSize = 5,
  showGradient = true,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    const time = Date.now() * 0.001 * animationSpeed;
    const gap = dotSize * 4;
    const cols = Math.ceil(w / gap);
    const rows = Math.ceil(h / gap);
    const cx = w / 2;
    const cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * gap + gap / 2;
        const y = j * gap + gap / 2;

        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const normalizedDist = dist / maxDist;

        // Staggered reveal from center
        const revealThreshold = normalizedDist * 3;
        const reveal = Math.max(0, Math.min(1, (time * 0.5) - revealThreshold + 1));

        if (reveal <= 0) continue;

        // Flickering opacity
        const seed = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
        const flicker = (Math.sin(time * 2 + seed) + 1) * 0.5;
        const baseOpacity = 0.15 + flicker * 0.35;
        const opacity = baseOpacity * reveal;

        const colorIdx = Math.floor((seed - Math.floor(seed)) * colors.length);
        const color = colors[Math.abs(colorIdx) % colors.length];

        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
        ctx.fillRect(x - dotSize / 2, y - dotSize / 2, dotSize, dotSize);
      }
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [animationSpeed, colors, dotSize]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      )}
    </div>
  );
};

export default CanvasRevealEffect;
