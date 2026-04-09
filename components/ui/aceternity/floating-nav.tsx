"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function FloatingNav({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - (scrollYProgress.getPrevious() ?? 0);
      if (current < 0.05) {
        setVisible(true);
        setAtTop(true);
      } else {
        setAtTop(false);
        setVisible(direction < 0);
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed inset-x-0 top-6 z-[5000] mx-auto flex max-w-fit items-center justify-center space-x-6 border px-8 py-3 font-mono",
          atTop
            ? "border-transparent bg-transparent rounded-full"
            : "border-white/[0.08] bg-black/80 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md rounded-full",
          className
        )}
      >
        {navItems.map((navItem, idx) => (
          <Link
            key={`nav-${idx}`}
            href={navItem.link}
            className={cn(
              "relative flex items-center space-x-1 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
            )}
          >
            <span className="hidden sm:block">{navItem.icon}</span>
            <span>{navItem.name}</span>
          </Link>
        ))}
        <Link
          href="/login"
          className="relative rounded-full border border-white/[0.15] bg-white/[0.05] px-4 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-white/[0.1] hover:text-white"
        >
          Login
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
