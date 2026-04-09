"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Check, Play, Video, Share2, BarChart3, Bot, Clock, Zap, Camera, FolderOpen, Upload, Sparkles, ClipboardList, LineChart, Package, FileText, Users } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import { TextGenerateEffect } from "@/components/ui/aceternity/text-generate-effect";
import { BentoGrid, BentoGridItem } from "@/components/ui/aceternity/bento-grid";
import { InfiniteMovingCards } from "@/components/ui/aceternity/infinite-moving-cards";
import { SpotlightCard } from "@/components/ui/aceternity/spotlight-card";
import { FloatingNav } from "@/components/ui/aceternity/floating-nav";
import { GlowingStarsCard, GlowingStarsTitle, GlowingStarsDescription } from "@/components/ui/aceternity/glowing-stars-card";

// ─── Logo ─────────────────────────────────────────────────────────────────────
function CytronLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <linearGradient id="cGrad" x1="12" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#9898b0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="0" fill="url(#bgGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <path d="M31 15.5C29 13.8 26.3 12.5 23.5 12.5C17 12.5 11.5 18 11.5 24.5C11.5 31 17 36.5 23.5 36.5C26.3 36.5 29 35.2 31 33.5" stroke="url(#cGrad)" strokeWidth="4.5" strokeLinecap="square" fill="none" />
    </svg>
  );
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────
function MagneticButton({ children, className = "", style = {}, href = "" }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ ...style, x: springX, y: springY }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left - rect.width / 2) * 0.15);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.15);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const numericPart = value.replace(/[^0-9.]/g, "");
          const target = parseFloat(numericPart);
          const prefix = value.replace(numericPart, "").replace(suffix, "");
          const duration = 2000;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            setDisplayed(prefix + Math.floor(current) + suffix);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, suffix, hasAnimated]);

  return <span ref={ref}>{displayed}</span>;
}

// ─── Automation Showcase Data ─────────────────────────────────────────────────
const automationItems = [
  { before: "Generate quote manually — 2 hours", after: "AI generates in 30 seconds", metric: "99% faster" },
  { before: "Post on social media — 45 min/post", after: "Auto-post to 3 platforms — 1 click", metric: "95% time saved" },
  { before: "Stock control in spreadsheet — frequent errors", after: "Stock Guardian real-time — 0 errors", metric: "100% accuracy" },
  { before: "Compliance report — 1 full day", after: "PDF auto-generated — 2 minutes", metric: "99.7% faster" },
  { before: "Coordinate team by phone — 30 min", after: "Field Commander check-in — instant", metric: "Real-time tracking" },
  { before: "Task management on post-its — forgotten", after: "Digital Kanban — 100% traceable", metric: "Zero missed tasks" },
  { before: "Update Excel dashboard — 1h/week", after: "Live dashboard — real-time data", metric: "Always current" },
  { before: "Record + edit + post video — 3 hours", after: "Video Hub — record, enhance, distribute", metric: "85% faster" },
];

// ─── Video Hub Modes ──────────────────────────────────────────────────────────
const videoModes = [
  {
    icon: <Sparkles className="w-6 h-6 text-[#00B050]" />,
    title: "AI Create",
    desc: "Upload a photo. AI generates a cinematic video with transitions, music, and captions — ready to publish.",
    tag: "MOST POPULAR",
  },
  {
    icon: <FolderOpen className="w-6 h-6 text-[#00B050]" />,
    title: "Ready to Use",
    desc: "Browse our library of pre-made video templates. Pick one, customize the caption, publish instantly.",
    tag: "FASTEST",
  },
  {
    icon: <Camera className="w-6 h-6 text-[#00B050]" />,
    title: "Record & Post",
    desc: "Open your camera, record directly. Choose: AI-enhance with effects & captions, or quick-post raw to all platforms.",
    tag: "AUTHENTIC",
  },
];

// ─── Pricing ──────────────────────────────────────────────────────────────────
const plans = [
  {
    name: "Spark",
    price: "$297",
    period: "/mo",
    desc: "For tradies & small businesses getting started.",
    features: ["8 AI videos/month", "16 auto-posts", "2 platforms (IG + TikTok)", "AI captions", "Auto-scheduling", "Monthly analytics report"],
  },
  {
    name: "Growth",
    price: "$597",
    period: "/mo",
    popular: true,
    desc: "For growing businesses that need scale.",
    features: ["20 AI videos/month", "40 auto-posts", "3 platforms + Facebook", "GHL integration", "2 custom n8n workflows", "Weekly analytics", "Priority support"],
  },
  {
    name: "Scale",
    price: "$997",
    period: "/mo",
    desc: "For teams that need unlimited power.",
    features: ["40 AI videos/month", "80 auto-posts", "All platforms + LinkedIn", "Unlimited n8n workflows", "Real-time dashboard", "Dedicated account manager", "24/7 support"],
  },
];

// ─── Nav Items ────────────────────────────────────────────────────────────────
const navItems = [
  { name: "Video Hub", link: "#video-hub" },
  { name: "Features", link: "#features" },
  { name: "Projects", link: "#projects" },
  { name: "Pricing", link: "#pricing" },
];

// ─── Early Access Form ────────────────────────────────────────────────────────
function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center gap-3 mt-6"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 border border-[#00B050]/30 bg-[#00B050]/5">
          <Check size={16} className="text-[#00B050]" />
          <span className="text-sm text-[#00B050] font-medium">You&apos;re on the list! We&apos;ll be in touch soon.</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full sm:w-72 px-4 py-3 text-sm bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-neutral-600 outline-none focus:border-[#00B050]/50 font-mono"
        required
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium px-7 py-3 bg-[#00B050] text-black transition-opacity disabled:opacity-50"
      >
        {status === "loading" ? "Sending..." : "Request Early Access"} <ArrowRight size={14} />
      </button>
    </motion.form>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-mono">

      {/* ─── Top Accent Line ─────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-[1px] z-50" style={{ background: "linear-gradient(90deg, transparent, #00B050 30%, #00B050 70%, transparent)" }} />

      {/* ─── Floating Nav ────────────────────────────────────────── */}
      <FloatingNav navItems={navItems} />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── HERO SECTION ────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BackgroundBeams />

        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,176,80,0.06) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#00B050]/30 bg-[#00B050]/5 text-xs text-[#00B050] mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.span
              className="w-1.5 h-1.5 bg-[#00B050]"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            EARLY ACCESS — Video Distribution Engine
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold leading-[1.05] tracking-[-0.04em] mb-4">
              Post your video to
              <br />
              <span className="text-[#00B050]">all platforms</span>
              <br />
              at the same time.
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-10"
          >
            <TextGenerateEffect
              words="Create with AI. Record from camera. Upload ready-made. Let AI edit your video or post it raw — you decide. Cytron distributes to every platform automatically."
              className="text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto"
            />
          </motion.div>

          {/* CTAs — Early Access */}
          <EarlyAccessForm />

          {/* Stats */}
          <motion.div
            className="flex items-center justify-center gap-12 mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {[
              { value: "10,000", suffix: "+", label: "Videos generated" },
              { value: "4", suffix: "", label: "Platforms" },
              { value: "85", suffix: "%", label: "Time saved" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-neutral-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── AUTOMATION SHOWCASE (Infinite Scroll) ───────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-16 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 text-center">Before vs After — Real automation results</p>
        </div>
        <InfiniteMovingCards items={automationItems} direction="left" speed="slow" />
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── VIDEO HUB ───────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="video-hub" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#00B050]/70 mb-4">Video Hub</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              Three ways in.
              <br />
              <span className="text-neutral-500">Every platform out.</span>
            </h2>
          </motion.div>

          {/* Video Hub Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {videoModes.map((mode, i) => (
              <SpotlightCard key={i} className="p-8">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 border border-white/[0.1] bg-white/[0.03] flex items-center justify-center">
                      {mode.icon}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00B050]/60 border border-[#00B050]/20 px-2 py-0.5">
                      {mode.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-200 mb-3">{mode.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{mode.desc}</p>
                </div>
              </SpotlightCard>
            ))}
          </div>

          {/* Distribution Arrow */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-4 px-6 py-3 border border-white/[0.08] bg-white/[0.02]">
              <span className="text-xs text-neutral-600">Then choose:</span>
              <span className="text-xs font-bold text-[#00B050]">AI Enhance + Post</span>
              <span className="text-neutral-700">or</span>
              <span className="text-xs font-bold text-white">Quick Post Raw</span>
              <ArrowRight size={14} className="text-neutral-600" />
              <span className="text-xs text-neutral-500">Instagram &bull; TikTok &bull; Facebook &bull; LinkedIn</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── FEATURES (Bento Grid) ───────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#00B050]/70 mb-4">Platform</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              Everything you need.
              <br />
              <span className="text-neutral-500">Nothing you don&apos;t.</span>
            </h2>
          </motion.div>

          <BentoGrid>
            <BentoGridItem
              className="md:col-span-2"
              title="AI Video Generation"
              description="Transform product photos into cinematic marketing videos. AI handles transitions, music, and copy."
              icon={<Video className="w-5 h-5 text-[#00B050]" />}
              header={
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <span className="w-2 h-2 bg-[#00B050] animate-pulse" />
                  Core Engine
                </div>
              }
            />
            <BentoGridItem
              title="Auto-Publish"
              description="Schedule and publish to TikTok, Instagram, Facebook, LinkedIn — all at once."
              icon={<Share2 className="w-5 h-5 text-[#00B050]" />}
              header={<div className="text-xs text-neutral-600">Distribution</div>}
            />
            <BentoGridItem
              title="Smart Automation"
              description="Connect workflows with n8n. Automate quotes, compliance, inventory alerts."
              icon={<Zap className="w-5 h-5 text-[#00B050]" />}
              header={<div className="text-xs text-neutral-600">Workflows</div>}
            />
            <BentoGridItem
              title="Analytics"
              description="Real-time insights on reach, engagement, and ROI across all platforms."
              icon={<BarChart3 className="w-5 h-5 text-[#00B050]" />}
              header={<div className="text-xs text-neutral-600">Intelligence</div>}
            />
            <BentoGridItem
              title="AI Agents"
              description="Autonomous agents handle your content pipeline 24/7. Set it and forget it."
              icon={<Bot className="w-5 h-5 text-[#00B050]" />}
              header={<div className="text-xs text-neutral-600">Automation</div>}
            />
          </BentoGrid>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── PROJECTS SHOWCASE ───────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="projects" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#00B050]/70 mb-4">Built-in Solutions</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              Beyond video.
              <br />
              <span className="text-neutral-500">Full business automation.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Office Admin */}
            <SpotlightCard className="p-8">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 border border-white/[0.1] bg-white/[0.03] flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-[#00B050]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-200">Office Admin</h3>
                    <p className="text-xs text-neutral-600">Complete management system</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {["Kanban task board", "Calendar & scheduling", "Contact CRM", "Document manager", "KPI dashboards"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-neutral-400">
                      <Check size={12} className="text-[#00B050]" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/office-admin" className="inline-flex items-center gap-1 text-xs text-[#00B050] hover:text-[#00B050]/80 transition-colors">
                  Explore <ArrowRight size={12} />
                </Link>
              </div>
            </SpotlightCard>

            {/* Portfolio Data */}
            <SpotlightCard className="p-8" spotlightColor="rgba(0, 176, 80, 0.1)">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 border border-white/[0.1] bg-white/[0.03] flex items-center justify-center">
                    <LineChart className="w-5 h-5 text-[#00B050]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-200">Portfolio Data</h3>
                    <p className="text-xs text-neutral-600">Live analytics dashboards</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {["Sales dashboard", "Financial analytics", "Operations metrics", "HR insights", "Custom reports"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-neutral-400">
                      <Check size={12} className="text-[#00B050]" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/portfolio-data" className="inline-flex items-center gap-1 text-xs text-[#00B050] hover:text-[#00B050]/80 transition-colors">
                  Explore <ArrowRight size={12} />
                </Link>
              </div>
            </SpotlightCard>

            {/* Existing Tools Row */}
            <SpotlightCard className="p-6 md:col-span-2">
              <div className="relative z-10">
                <p className="text-xs text-neutral-600 mb-4 uppercase tracking-widest">Also included</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: <Package size={16} />, name: "Warehouse", desc: "Stock Guardian" },
                    { icon: <FileText size={16} />, name: "Quotes", desc: "AI estimates" },
                    { icon: <Check size={16} />, name: "Compliance", desc: "Auto-reports" },
                    { icon: <Users size={16} />, name: "Field Commander", desc: "Team tracking" },
                  ].map((tool) => (
                    <div key={tool.name} className="flex items-center gap-3 p-3 border border-white/[0.05] bg-white/[0.02]">
                      <div className="text-[#00B050]">{tool.icon}</div>
                      <div>
                        <div className="text-sm font-medium text-neutral-300">{tool.name}</div>
                        <div className="text-[10px] text-neutral-600">{tool.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── PRICING ─────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#00B050]/70 mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              Simple pricing.
              <br />
              <span className="text-neutral-500">Serious results.</span>
            </h2>
            <p className="text-sm text-neutral-600 mt-4">Setup fee: $497 one-off (includes custom configuration + training)</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <GlowingStarsCard key={plan.name} className={plan.popular ? "border-[#00B050]/30" : ""}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#00B050]" />
                )}
                <div className="relative z-20">
                  {plan.popular && (
                    <span className="inline-block text-[10px] uppercase tracking-widest text-[#00B050] border border-[#00B050]/30 px-2 py-0.5 mb-4">
                      Most Popular
                    </span>
                  )}
                  <GlowingStarsTitle>{plan.name}</GlowingStarsTitle>
                  <div className="flex items-baseline gap-1 mt-3 mb-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-neutral-600">{plan.period}</span>
                  </div>
                  <GlowingStarsDescription>{plan.desc}</GlowingStarsDescription>
                  <div className="mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-neutral-400">
                        <Check size={12} className="text-[#00B050] shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  <MagneticButton
                    href="/login"
                    className={`mt-8 w-full inline-flex items-center justify-center text-sm font-medium py-3 ${
                      plan.popular
                        ? "bg-[#00B050] text-black"
                        : "border border-white/[0.1] text-neutral-400 hover:text-white"
                    }`}
                  >
                    Request Access
                  </MagneticButton>
                </div>
              </GlowingStarsCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── FINAL CTA ───────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-28 border-t border-white/[0.05] relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(0,176,80,0.04) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to automate
            <br />
            your business?
          </motion.h2>
          <motion.p
            className="text-sm text-neutral-500 mb-10 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join businesses across Gold Coast using Cytron to save 20+ hours per week on marketing, admin, and operations.
          </motion.p>
          <EarlyAccessForm />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <footer className="py-12 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <CytronLogo size={20} />
              <span className="text-sm font-medium text-neutral-400">Cytron</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-neutral-600">
              <a href="#video-hub" className="hover:text-neutral-400 transition-colors">Video Hub</a>
              <a href="#features" className="hover:text-neutral-400 transition-colors">Features</a>
              <a href="#projects" className="hover:text-neutral-400 transition-colors">Projects</a>
              <a href="#pricing" className="hover:text-neutral-400 transition-colors">Pricing</a>
              <Link href="/login" className="hover:text-neutral-400 transition-colors">Login</Link>
            </div>
            <p className="text-xs text-neutral-700">&copy; 2026 Cytron. Gold Coast, Australia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
