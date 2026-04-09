"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-white/[0.08] bg-black/50 p-6 shadow-none transition duration-200 hover:border-white/[0.15] hover:shadow-[0_0_30px_rgba(136,108,255,0.08)]",
        className
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-1">
        {icon && (
          <div
            className="inline-flex w-10 h-10 rounded-xl items-center justify-center mb-3"
            style={{
              background: "linear-gradient(135deg, rgba(136,108,255,0.12) 0%, rgba(136,108,255,0.04) 100%)",
              border: "1px solid rgba(136,108,255,0.18)",
              boxShadow: "0 0 20px rgba(136,108,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {icon}
          </div>
        )}
        <div className="mb-2 font-mono text-lg font-bold text-neutral-200">
          {title}
        </div>
        <div className="font-mono text-xs text-neutral-400 leading-relaxed">
          {description}
        </div>
      </div>
    </motion.div>
  );
}
