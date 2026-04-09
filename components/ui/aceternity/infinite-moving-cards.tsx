"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: {
  items: {
    before: string;
    after: string;
    metric: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      const directionVal = direction === "left" ? "forwards" : "reverse";
      containerRef.current.style.setProperty("--animation-direction", directionVal);

      const speedVal = speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";
      containerRef.current.style.setProperty("--animation-duration", speedVal);

      setStart(true);
    }
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-6 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="relative w-[400px] max-w-full shrink-0 border border-white/[0.08] bg-black/60 px-6 py-5"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-red-500">&#10006;</span>
                <span className="font-mono text-xs text-neutral-500 line-through">
                  {item.before}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-[#00B050]">&#10004;</span>
                <span className="font-mono text-sm text-neutral-200">
                  {item.after}
                </span>
              </div>
              <div className="mt-1 border-t border-white/[0.05] pt-2">
                <span className="font-mono text-xs font-bold text-[#00B050]">
                  {item.metric}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
