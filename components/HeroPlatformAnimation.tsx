"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── SVG Icons ─────────────────────────────────────────── */
const PlatformIcon = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Instagram: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>),
    TikTok: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.13a8.16 8.16 0 004.77 1.53v-3.44a4.85 4.85 0 01-.8-.1 4.83 4.83 0 01.8-3.85h.81z"/></svg>),
    Facebook: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
    YouTube: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>),
    Google: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>),
    LinkedIn: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>),
  };
  return <>{icons[name] || null}</>;
};

/* ── Data ──────────────────────────────────────────────── */
const platforms = [
  { name: "Instagram", color: "#E1306C", short: "IG" },
  { name: "TikTok", color: "#00F2EA", short: "TT" },
  { name: "Facebook", color: "#1877F2", short: "FB" },
  { name: "YouTube", color: "#FF0000", short: "YT" },
  { name: "Google", color: "#4285F4", short: "G" },
  { name: "LinkedIn", color: "#0A66C2", short: "LI" },
];

const contentCycle = [
  { type: "Video", icon: "▶", desc: "Marketing reel criado com IA" },
  { type: "Post", icon: "✎", desc: "Post promocional gerado" },
  { type: "Story", icon: "◉", desc: "Story com oferta do dia" },
  { type: "Reel", icon: "♫", desc: "Reel de bastidores editado" },
];

const activityFeed = [
  { platform: "Instagram", action: "Reel publicado", time: "agora" },
  { platform: "TikTok", action: "Video postado", time: "2s" },
  { platform: "Facebook", action: "Post agendado", time: "5s" },
  { platform: "YouTube", action: "Short enviado", time: "8s" },
  { platform: "Google", action: "Perfil atualizado", time: "12s" },
  { platform: "LinkedIn", action: "Artigo postado", time: "15s" },
];

/* ── Helper ────────────────────────────────────────────── */
const getPos = (i: number, total: number, r: number) => {
  const a = (i / total) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
};

/* ══════════════════════════════════════════════════════════ */
export default function HeroPlatformAnimation() {
  const radius = 28;
  const positions = useMemo(() => platforms.map((_, i) => getPos(i, platforms.length, radius)), []);
  const [contentIdx, setContentIdx] = useState(0);
  const [phase, setPhase] = useState<"create" | "distribute" | "done">("create");
  const [feedIdx, setFeedIdx] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    const runCycle = () => {
      setPhase("create");
      timers.push(
        setTimeout(() => setPhase("distribute"), 1400),
        setTimeout(() => setPhase("done"), 3200),
        setTimeout(() => {
          setContentIdx(p => (p + 1) % contentCycle.length);
          runCycle();
        }, 5000)
      );
    };
    runCycle();
    return () => timers.forEach(clearTimeout);
  }, []);

  // Activity feed ticker
  useEffect(() => {
    const t = setInterval(() => setFeedIdx(p => (p + 1) % activityFeed.length), 2000);
    return () => clearInterval(t);
  }, []);

  const content = contentCycle[contentIdx];

  return (
    <div className="relative w-full aspect-[4/5] max-w-[520px] mx-auto">
      <div className="relative w-full h-full rounded-2xl border-2 border-dashed border-[#886cff]/25 bg-[#0a0a12]/90 overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, rgba(136,108,255,0.8) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

        {/* Glow */}
        <motion.div
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(136,108,255,0.18) 0%, transparent 70%)" }}
          animate={{ scale: phase === "distribute" ? 1.5 : 1, opacity: phase === "distribute" ? 1 : 0.5 }}
          transition={{ duration: 0.6 }}
        />

        {/* ── Top bar ── */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-30">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
            </div>
            <span className="text-[7px] font-mono text-white/20 tracking-wider">CYTRON ENGINE</span>
          </div>
          <motion.div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/15"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
            <span className="w-1 h-1 rounded-full bg-green-400" />
            <span className="text-[6px] text-green-400/70 font-mono">LIVE</span>
          </motion.div>
        </div>

        {/* ── SVG: orbit + curves ── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" style={{ top: "-5%" }}>
          <circle cx="50" cy="45" r={radius} fill="none" stroke="rgba(136,108,255,0.05)" strokeWidth="0.25" strokeDasharray="0.8 2" />
          {positions.map((pos, i) => {
            const cy = 45; // offset center up
            const dx = pos.x - 50, dy = (pos.y - 5) - cy;
            const ctrlX = 50 + dx * 0.5 + dy * 0.15, ctrlY = cy + dy * 0.5 - dx * 0.15;
            const path = `M 50 ${cy} Q ${ctrlX} ${ctrlY} ${pos.x} ${pos.y - 5}`;
            return (
              <g key={`c-${i}`}>
                <path d={path} fill="none" stroke={platforms[i].color} strokeWidth="0.12" strokeDasharray="1 2" opacity={0.25} />
                <motion.path d={path} fill="none" stroke={platforms[i].color}
                  strokeWidth={phase === "distribute" ? "0.5" : "0.15"}
                  strokeDasharray="3 97" strokeLinecap="round"
                  animate={{ strokeDashoffset: phase === "distribute" ? [100, 0] : [100, 85], opacity: phase === "distribute" ? 0.8 : 0.1 }}
                  transition={{ duration: phase === "distribute" ? 1.2 : 5, repeat: Infinity, delay: i * 0.12, ease: "easeOut" }}
                />
              </g>
            );
          })}
        </svg>

        {/* ── Content card (center) ── */}
        <div className="absolute left-1/2 -translate-x-1/2 z-20" style={{ top: "32%" }}>
          <AnimatePresence>
            {phase === "distribute" && (
              <motion.div className="absolute -inset-8 rounded-full border border-[#886cff]/25"
                initial={{ scale: 0.6, opacity: 0.5 }} animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 1 }} />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={contentIdx}
              className="relative w-[100px] h-[68px] rounded-xl overflow-hidden border border-white/10 flex flex-col items-center justify-center gap-1"
              style={{ background: "linear-gradient(135deg, rgba(136,108,255,0.12), rgba(74,58,255,0.08))", boxShadow: "0 0 30px rgba(136,108,255,0.15)" }}
              initial={{ scale: 0, rotate: -5 }}
              animate={{ scale: phase === "distribute" ? [1, 0.9] : 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 5 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}>

              {/* Thumbnail preview */}
              <div className="w-full h-[38px] bg-gradient-to-br from-[#886cff]/20 to-[#4A3AFF]/15 flex items-center justify-center relative">
                <motion.span className="text-white/80 text-lg" animate={{ scale: phase === "create" ? [0.9, 1.1, 1] : 1 }} transition={{ duration: 0.6 }}>
                  {content.icon}
                </motion.span>
                {phase === "create" && (
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
                    animate={{ x: [-100, 100] }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                )}
              </div>
              <span className="text-[7px] text-white/50 font-medium pb-1">{content.type}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Flying cards ── */}
        <AnimatePresence>
          {phase === "distribute" && platforms.map((p, i) => {
            const pos = positions[i];
            return (
              <motion.div key={`fly-${contentIdx}-${i}`}
                className="absolute z-30 w-5 h-5 rounded-md flex items-center justify-center"
                style={{ left: "50%", top: "32%", x: "-50%", y: "-50%", backgroundColor: `${p.color}20`, border: `1px solid ${p.color}35`, boxShadow: `0 0 10px ${p.color}25` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ left: `${pos.x}%`, top: `${pos.y - 5}%`, scale: [0, 1.1, 0.7], opacity: [0, 1, 0.5] }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
                <span className="text-[6px]" style={{ color: p.color }}>{content.icon}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Platform nodes ── */}
        {platforms.map((p, i) => {
          const pos = positions[i];
          return (
            <motion.div key={p.name} className="absolute z-10 flex flex-col items-center gap-0.5"
              style={{ left: `${pos.x}%`, top: `${pos.y - 5}%`, transform: "translate(-50%, -50%)" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 200, damping: 15 }}>

              <motion.div className="relative w-9 h-9 rounded-lg flex items-center justify-center border border-white/8"
                style={{ backgroundColor: `${p.color}10`, color: p.color }}
                animate={{
                  boxShadow: phase === "done" ? `0 0 20px ${p.color}30` : `0 0 6px ${p.color}08`,
                  borderColor: phase === "done" ? `${p.color}35` : "rgba(255,255,255,0.08)"
                }}
                transition={{ duration: 0.4, delay: i * 0.08 }}>
                <PlatformIcon name={p.name} />
                <AnimatePresence>
                  {phase === "done" && (
                    <motion.div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}>
                      <span className="text-white text-[6px]">✓</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className="text-[5px] text-neutral-600 font-mono tracking-widest uppercase">{p.short}</span>
            </motion.div>
          );
        })}

        {/* ── Activity feed (bottom section) ── */}
        <div className="absolute bottom-10 left-3 right-3 z-20">
          <div className="text-[6px] text-white/20 font-mono uppercase tracking-widest mb-1.5">Atividade recente</div>
          <div className="space-y-1">
            {[0, 1, 2].map(offset => {
              const idx = (feedIdx + offset) % activityFeed.length;
              const item = activityFeed[idx];
              const p = platforms.find(pl => pl.name === item.platform);
              return (
                <motion.div key={`${idx}-${feedIdx}`}
                  className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.03]"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: offset === 0 ? 1 : 0.4, x: 0 }}
                  transition={{ duration: 0.3, delay: offset * 0.1 }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: `${p?.color}15`, color: p?.color }}>
                    <PlatformIcon name={item.platform} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[7px] text-white/50">{item.action}</span>
                  </div>
                  <span className="text-[6px] text-white/20 font-mono">{item.time}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <motion.div className="absolute bottom-2.5 left-3 right-3 z-30 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0c0c16]/95 border border-white/5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <div className="flex items-center gap-2">
            <motion.span className="w-1.5 h-1.5 rounded-full"
              animate={{ backgroundColor: phase === "distribute" ? "#886cff" : phase === "done" ? "#22c55e" : "#6b7280" }}
              transition={{ duration: 0.3 }} />
            <AnimatePresence mode="wait">
              <motion.span key={phase} className="text-[8px] font-mono"
                style={{ color: phase === "distribute" ? "#886cff" : phase === "done" ? "#22c55e" : "#6b7280" }}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}>
                {phase === "create" ? "Criando..." : phase === "distribute" ? "Distribuindo..." : "Publicado em 6 plataformas ✓"}
              </motion.span>
            </AnimatePresence>
          </div>
          {/* Mini metrics */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <motion.div className="w-6 h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div className="h-full rounded-full bg-[#886cff]/40"
                  animate={{ width: phase === "done" ? "100%" : phase === "distribute" ? "60%" : "20%" }}
                  transition={{ duration: 0.5 }} />
              </motion.div>
            </div>
            <span className="text-[7px] text-[#886cff]/50 font-mono">24/7</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
