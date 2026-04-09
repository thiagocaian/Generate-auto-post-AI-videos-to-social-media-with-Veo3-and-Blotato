"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function GlowingStarsCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [mouseEnter, setMouseEnter] = useState(false);

  return (
    <div
      onMouseEnter={() => setMouseEnter(true)}
      onMouseLeave={() => setMouseEnter(false)}
      className={cn(
        "relative h-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a0a] p-6",
        className
      )}
    >
      <div className="flex items-center justify-center">
        <Illustration mouseEnter={mouseEnter} />
      </div>
      <div className="relative z-20">{children}</div>
    </div>
  );
}

function Illustration({ mouseEnter }: { mouseEnter: boolean }) {
  const stars = 20;
  const columns = 10;

  const [glowingStars, setGlowingStars] = useState<number[]>([]);

  const highlightedStars = useRef<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      highlightedStars.current = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * stars * columns)
      );
      setGlowingStars([...highlightedStars.current]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute inset-0 h-full w-full"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "1px",
      }}
    >
      {[...Array(stars * columns)].map((_, starIdx) => {
        const isGlowing = glowingStars.includes(starIdx);
        const delay = (starIdx % 10) * 0.1;
        const staticGlow = Math.random() > 0.97;
        return (
          <div key={`star-${starIdx}`} className="relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              {(isGlowing || mouseEnter || staticGlow) && (
                <motion.div
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 2, delay, ease: "easeInOut" }}
                  className="absolute h-[1px] w-[1px] rounded-full bg-[#886cff] shadow-[0_0_4px_#886cff]"
                />
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function GlowingStarsTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("font-mono text-xl font-bold text-neutral-200", className)}>{children}</h2>;
}

export function GlowingStarsDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mt-2 max-w-[16rem] font-mono text-sm text-neutral-500", className)}>{children}</p>;
}
