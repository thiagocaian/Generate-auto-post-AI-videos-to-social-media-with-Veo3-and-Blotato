"use client";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

export function TracingBeam({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const contentRef = useRef<HTMLDivElement>(null);

  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 0]), {
    stiffness: 500,
    damping: 90,
  });
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, contentRef.current?.offsetHeight ?? 0]),
    { stiffness: 500, damping: 90 }
  );

  return (
    <motion.div ref={ref} className={cn("relative mx-auto h-full w-full max-w-4xl", className)}>
      <div className="absolute -left-4 top-3 md:-left-20">
        <motion.div
          transition={{ duration: 0.2, delay: 0.5 }}
          animate={{ boxShadow: "0 0 15px rgba(136, 108, 255, 0.3)" }}
          className="ml-[27px] flex h-4 w-4 items-center justify-center border border-[#886cff] bg-black shadow-sm"
        >
          <motion.div
            transition={{ duration: 0.2, delay: 0.5 }}
            className="h-2 w-2 border border-[#886cff]/50 bg-[#886cff]"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${contentRef.current?.offsetHeight ?? 500}`}
          width="20"
          height={contentRef.current?.offsetHeight ?? 500}
          className="ml-4 block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${contentRef.current?.offsetHeight ?? 500} l -18 24V ${contentRef.current?.offsetHeight ?? 500}`}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.25"
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${contentRef.current?.offsetHeight ?? 500} l -18 24V ${contentRef.current?.offsetHeight ?? 500}`}
            fill="none"
            stroke="url(#pulse)"
            strokeWidth="1.25"
            className="motion-reduce:hidden"
            style={{ pathLength: scrollYProgress }}
          />
          <defs>
            <linearGradient id="pulse" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={y1 as unknown as number} y2={y2 as unknown as number}>
              <stop stopColor="#886cff" stopOpacity="0" />
              <stop stopColor="#886cff" />
              <stop offset="0.325" stopColor="#886cff" />
              <stop offset="1" stopColor="#886cff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
}
