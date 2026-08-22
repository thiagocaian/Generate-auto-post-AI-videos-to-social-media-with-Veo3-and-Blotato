"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const patrolTransition = {
  duration: 13,
  ease: "linear" as const,
  repeat: Infinity,
  repeatDelay: 2.2,
};

const scanTransition = {
  duration: 3.6,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "reverse" as const,
};

/**
 * A decorative, CCTV-style scene for the homepage. It is intentionally hidden
 * from assistive technology: the nearby heading and copy convey the real page
 * message, while this layer simply gives the hero a sense of active coverage.
 */
export default function SecurityHeroScene() {
  const prefersReducedMotion = useReducedMotion();

  const personAnimation = prefersReducedMotion
    ? { opacity: 0.5, x: "42vw" }
    : {
        opacity: [0, 0.55, 0.82, 0.82, 0],
        scale: [0.78, 0.88, 1.55, 1.55, 0.78],
        x: ["-20vw", "10vw", "70vw", "70vw", "110vw"],
      };

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0 origin-[78%_48%]"
        animate={prefersReducedMotion ? undefined : { scale: [1, 1, 1.1, 1.1, 1] }}
        transition={{ ...patrolTransition, times: [0, 0.18, 0.4, 0.62, 1] }}
      >
        <Image
          src="/images/cctv/gold-coast-commercial-cctv-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_center] opacity-45 saturate-[0.8]"
        />
      </motion.div>

      {/* Keep the camera scene atmospheric, while preserving contrast for the copy. */}
      <div className="absolute inset-0 bg-[#050505]/50" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.7)_42%,rgba(5,5,5,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,5,5,0.88)_0%,transparent_45%,rgba(5,5,5,0.5)_100%)]" />

      {/* Faint scan lines make the image feel like an active camera feed. */}
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:100%_5px]" />
      {!prefersReducedMotion && (
        <motion.div
          className="absolute left-0 right-0 h-px bg-[#886cff]/70 shadow-[0_0_22px_rgba(136,108,255,0.9)]"
          initial={{ top: "15%" }}
          animate={{ top: ["15%", "82%"] }}
          transition={scanTransition}
        />
      )}

      <div className="absolute left-5 top-24 hidden items-center gap-2 rounded-md border border-white/15 bg-black/45 px-3 py-2 font-mono text-[10px] tracking-[0.16em] text-white/65 backdrop-blur-md sm:flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
        </span>
        CAM 01 · LIVE VIEW
      </div>

      <div className="absolute bottom-5 right-5 hidden rounded-md border border-white/10 bg-black/35 px-3 py-2 font-mono text-[9px] tracking-[0.13em] text-white/50 backdrop-blur-md md:block">
        4K · NIGHT VISION · RECORDING
      </div>

      {/* A stylised, non-identifying analysis panel appears during the zoom. */}
      <motion.div
        className="absolute right-6 top-[25%] hidden w-44 border border-[#9ab7ff]/50 bg-[#080b14]/70 p-3 font-mono text-[8px] tracking-[0.12em] text-[#d2dcff] shadow-[0_0_32px_rgba(79,116,255,0.18)] backdrop-blur-md lg:block"
        animate={prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: [0, 0, 1, 1, 0], x: [20, 20, 0, 0, 20] }}
        transition={{ ...patrolTransition, times: [0, 0.22, 0.4, 0.62, 1] }}
      >
        <div className="mb-3 flex items-center justify-between border-b border-[#9ab7ff]/25 pb-2 text-[#b9c9ff]">
          <span>FACIAL ANALYSIS</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#9ab7ff] shadow-[0_0_8px_rgba(154,183,255,1)]" />
        </div>
        <div className="space-y-2 text-white/55">
          <div className="flex justify-between"><span>SUBJECT</span><span className="text-white/80">01</span></div>
          <div className="flex justify-between"><span>FACE</span><span className="text-amber-200">OBSCURED</span></div>
          <div className="flex justify-between"><span>MATCH</span><span className="text-white/80">UNAVAILABLE</span></div>
        </div>
        <div className="mt-3 h-px w-full overflow-hidden bg-white/10">
          <motion.div
            className="h-full bg-[#9ab7ff]"
            animate={prefersReducedMotion ? { width: "0%" } : { width: ["0%", "100%", "100%", "0%"] }}
            transition={{ ...patrolTransition, times: [0, 0.4, 0.62, 1] }}
          />
        </div>
      </motion.div>

      {/* The generated anonymous figure crosses the scene; its tracker follows in real time. */}
      <motion.div
        className="absolute bottom-[5%] left-0 w-24 sm:w-32 lg:w-40 xl:w-48"
        initial={{ opacity: 0, x: "-20vw" }}
        animate={personAnimation}
        transition={prefersReducedMotion ? { duration: 0 } : { ...patrolTransition, times: [0, 0.18, 0.4, 0.62, 1] }}
      >
        <motion.div
          className="relative"
          animate={prefersReducedMotion ? undefined : { y: [2, -2, 2] }}
          transition={prefersReducedMotion ? undefined : { duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/images/cctv/cctv-detected-person.png"
            alt=""
            width={1024}
            height={1536}
            sizes="(max-width: 640px) 96px, (max-width: 1024px) 128px, 192px"
            className="h-auto w-full opacity-80 drop-shadow-[0_0_18px_rgba(19,108,255,0.25)]"
          />

          <motion.div
            className="absolute inset-[-5%] border border-[#9ab7ff]/80 shadow-[0_0_18px_rgba(125,153,255,0.38)]"
            animate={prefersReducedMotion ? undefined : { opacity: [0.9, 0.9, 0.2, 0.2, 0.9] }}
            transition={prefersReducedMotion ? undefined : { ...patrolTransition, times: [0, 0.18, 0.4, 0.62, 1] }}
          >
            <span className="absolute -left-px -top-5 whitespace-nowrap rounded-sm bg-[#9ab7ff] px-1.5 py-0.5 font-mono text-[7px] font-semibold tracking-[0.13em] text-[#08080b] sm:text-[8px]">
              PERSON DETECTED
            </span>
            <span className="absolute -bottom-4 left-0 whitespace-nowrap font-mono text-[7px] tracking-[0.12em] text-[#c1d0ff] sm:text-[8px]">
              TRACKING · 98.4%
            </span>
          </motion.div>

          <motion.div
            className="absolute left-[22%] top-[4%] h-[27%] w-[54%] border border-[#d7e0ff] shadow-[0_0_22px_rgba(176,197,255,0.65)]"
            animate={prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: [0, 0, 1, 1, 0], scale: [0.86, 0.86, 1, 1, 0.86] }}
            transition={{ ...patrolTransition, times: [0, 0.22, 0.4, 0.62, 1] }}
          >
            <span className="absolute -left-px -top-4 whitespace-nowrap bg-[#d7e0ff] px-1 py-0.5 font-mono text-[6px] font-semibold tracking-[0.11em] text-[#08080b] sm:text-[7px]">
              FACE SCAN
            </span>
            <motion.span
              className="absolute left-0 right-0 h-px bg-[#d7e0ff] shadow-[0_0_7px_rgba(215,224,255,0.95)]"
              animate={prefersReducedMotion ? { top: "0%" } : { top: ["0%", "100%", "0%"] }}
              transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
