"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BackgroundBeams({ className }: { className?: string }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true) }, []);

  useEffect(() => {
    if (!mounted) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    const el = ref.current;
    el?.addEventListener("mousemove", handleMouseMove);
    return () => el?.removeEventListener("mousemove", handleMouseMove);
  }, [mounted]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
        className
      )}
    >
      {mounted && (
        <>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="beam-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(0, 176, 80, 0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const length = 800;
              const x2 = mousePosition.x + Math.cos(angle) * length;
              const y2 = mousePosition.y + Math.sin(angle) * length;
              return (
                <motion.line
                  key={i}
                  x1={mousePosition.x}
                  y1={mousePosition.y}
                  x2={x2}
                  y2={y2}
                  stroke="url(#beam-gradient)"
                  strokeWidth="0.5"
                  strokeOpacity={0.3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatType: "reverse" }}
                />
              );
            })}
          </svg>
          <div
            className="pointer-events-none absolute rounded-full opacity-20 blur-[100px]"
            style={{
              width: 400,
              height: 400,
              left: mousePosition.x - 200,
              top: mousePosition.y - 200,
              background: "radial-gradient(circle, rgba(0,176,80,0.3) 0%, transparent 70%)",
            }}
          />
        </>
      )}
    </div>
  );
}
