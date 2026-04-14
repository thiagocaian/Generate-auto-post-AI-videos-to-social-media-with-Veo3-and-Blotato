"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Check, Play } from "lucide-react";
// Solar Icons — Modern 2026 style with BoldDuotone weight
import {
  MagicStick3,
  FolderOpen,
  Camera,
  Videocamera,
  Share,
  ChartSquare,
  Chart2,
  Bolt,
  ClipboardList,
  BoxMinimalistic,
  DocumentText,
  UsersGroupTwoRounded,
} from "@solar-icons/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import BackgroundScene from "@/components/BackgroundScene";
import HeroDashboardMockup from "@/components/HeroDashboardMockup";
import { TextGenerateEffect } from "@/components/ui/aceternity/text-generate-effect";
import { BentoGrid, BentoGridItem } from "@/components/ui/aceternity/bento-grid";
import { InfiniteMovingCards } from "@/components/ui/aceternity/infinite-moving-cards";
import { SpotlightCard } from "@/components/ui/aceternity/spotlight-card";
import { FloatingNav } from "@/components/ui/aceternity/floating-nav";
import { GlowingStarsCard, GlowingStarsTitle, GlowingStarsDescription } from "@/components/ui/aceternity/glowing-stars-card";

// ─── Logo ─────────────────────────────────────────────────────────────────────
function CytronLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-lg bg-[#886cff] flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.45 }}>C</span>
    </div>
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
          const hasComma = value.includes(",");
          const duration = 2000;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            const formatted = hasComma
              ? Math.floor(current).toLocaleString()
              : String(Math.floor(current));
            setDisplayed(formatted + suffix);
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
    icon: <MagicStick3 weight="BoldDuotone" size={22} />,
    title: "AI Create",
    desc: "Upload a photo. AI generates a cinematic video with transitions, music, and captions — ready to publish.",
    tag: "MOST POPULAR",
  },
  {
    icon: <FolderOpen weight="BoldDuotone" size={22} />,
    title: "Ready to Use",
    desc: "Browse our library of pre-made video templates. Pick one, customize the caption, publish instantly.",
    tag: "FASTEST",
  },
  {
    icon: <Camera weight="BoldDuotone" size={22} />,
    title: "Record & Post",
    desc: "Open your camera, record directly. Choose: AI-enhance with effects & captions, or quick-post raw to all platforms.",
    tag: "AUTHENTIC",
  },
];

// ─── Pricing ──────────────────────────────────────────────────────────────────
const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/mo AUD",
    desc: "For tradies & small businesses getting started.",
    features: ["50 jobs/month", "10 AI videos/month", "30 auto-posts", "2 platforms (IG + TikTok)", "Materials Agent", "AI captions"],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo AUD",
    popular: true,
    desc: "For growing businesses that need scale.",
    features: ["200 jobs/month", "50 AI videos/month", "150 auto-posts", "All platforms", "Materials Agent", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/mo AUD",
    desc: "For teams that need unlimited power.",
    features: ["Unlimited jobs", "Unlimited AI videos", "Unlimited posts", "All platforms", "Custom branding", "Dedicated support", "24/7 priority"],
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
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#886cff]/30 bg-[#886cff]/5">
          <Check size={16} className="text-[#886cff]" />
          <span className="text-sm text-[#886cff] font-medium">You&apos;re on the list! We&apos;ll be in touch soon.</span>
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
        className="w-full sm:w-72 px-4 py-3 text-sm rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-neutral-600 outline-none focus:border-[#886cff]/50 font-mono"
        required
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium px-7 py-3 rounded-lg bg-[#886cff] text-white transition-opacity disabled:opacity-50"
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
    <div className="relative min-h-screen bg-[#050505] text-white">

      {/* ─── Top Accent Line ─────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-[1px] z-50" style={{ background: "linear-gradient(90deg, transparent, #886cff 30%, #886cff 70%, transparent)" }} />

      {/* ─── Floating Nav ────────────────────────────────────────── */}
      <FloatingNav navItems={navItems} />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── HERO SECTION (Twingate-style split layout) ──────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <BackgroundScene particleCount={40} opacity={0.3} />

        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(136,108,255,0.08) 0%, transparent 70%)" }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── LEFT SIDE: Text content ── */}
            <div className="flex flex-col gap-8">
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#886cff]/30 bg-[#886cff]/5 text-xs text-[#886cff] w-fit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#886cff]"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Smart Automation for Your Business
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[56px] font-bold leading-[1.08] tracking-[-0.03em]">
                  Your business
                  <br />
                  deserves a system
                  <br />
                  that works for
                  <br />
                  <motion.span
                    style={{
                      background: "linear-gradient(135deg, rgba(136,108,255,0.95), rgba(99,179,237,0.9))",
                      backgroundSize: "200% 200%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    you.
                  </motion.span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="text-base sm:text-lg text-neutral-400 max-w-lg leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Automate quoting, customer service, inventory, content and
                processes — no hassle, no ridiculous costs.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row items-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Link
                  href="/login?tab=signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#886cff] hover:bg-[#7b5ff2] text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-[#886cff]/25"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm transition-all"
                >
                  Request a Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="flex items-center gap-10 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {[
                  { value: "85", suffix: "%", label: "Time saved" },
                  { value: "6", suffix: "+", label: "Platforms" },
                  { value: "24", suffix: "/7", label: "Always on" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-white">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs text-neutral-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT SIDE: Platform animation box ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="hidden lg:block"
            >
              <HeroDashboardMockup />
            </motion.div>

          </div>
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
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Video Hub</p>
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
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-[#886cff] transition-all group-hover:border-[#886cff]/40"
                      style={{
                        background: "linear-gradient(135deg, rgba(136,108,255,0.12) 0%, rgba(136,108,255,0.04) 100%)",
                        border: "1px solid rgba(136,108,255,0.18)",
                        boxShadow: "0 0 20px rgba(136,108,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
                      }}
                    >
                      {mode.icon}
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#886cff]/70 rounded-full border border-[#886cff]/20 bg-[#886cff]/5 px-2.5 py-1">
                      {mode.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-200 mb-2 tracking-tight">{mode.title}</h3>
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
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full border border-white/[0.08] bg-white/[0.02]">
              <span className="text-xs text-neutral-600">Then choose:</span>
              <span className="text-xs font-bold text-[#886cff]">AI Enhance + Post</span>
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
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Platform</p>
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
              icon={<Videocamera weight="BoldDuotone" size={22} className="text-[#886cff]" />}
              header={
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <span className="w-2 h-2 bg-[#886cff] animate-pulse" />
                  Core Engine
                </div>
              }
            />
            <BentoGridItem
              title="Auto-Publish"
              description="Schedule and publish to TikTok, Instagram, Facebook, LinkedIn — all at once."
              icon={<Share weight="BoldDuotone" size={22} className="text-[#886cff]" />}
              header={<div className="text-xs text-neutral-600">Distribution</div>}
            />
            <BentoGridItem
              title="Smart Automation"
              description="Connect workflows with n8n. Automate quotes, compliance, inventory alerts."
              icon={<Bolt weight="BoldDuotone" size={22} className="text-[#886cff]" />}
              header={<div className="text-xs text-neutral-600">Workflows</div>}
            />
            <BentoGridItem
              title="Analytics"
              description="Real-time insights on reach, engagement, and ROI across all platforms."
              icon={<ChartSquare weight="BoldDuotone" size={22} className="text-[#886cff]" />}
              header={<div className="text-xs text-neutral-600">Intelligence</div>}
            />
            <BentoGridItem
              title="AI Agents"
              description="Autonomous agents handle your content pipeline 24/7. Set it and forget it."
              icon={<MagicStick3 weight="BoldDuotone" size={22} className="text-[#886cff]" />}
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
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Built-in Solutions</p>
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
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-[#886cff]"
                    style={{
                      background: "linear-gradient(135deg, rgba(136,108,255,0.12) 0%, rgba(136,108,255,0.04) 100%)",
                      border: "1px solid rgba(136,108,255,0.18)",
                      boxShadow: "0 0 20px rgba(136,108,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                  >
                    <ClipboardList weight="BoldDuotone" size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-200">Office Admin</h3>
                    <p className="text-xs text-neutral-600">Complete management system</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {["Kanban task board", "Calendar & scheduling", "Contact CRM", "Document manager", "KPI dashboards"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-neutral-400">
                      <Check size={12} className="text-[#886cff]" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/office-admin" className="inline-flex items-center gap-1 text-xs text-[#886cff] hover:text-[#886cff]/80 transition-colors">
                  Explore <ArrowRight size={12} />
                </Link>
              </div>
            </SpotlightCard>

            {/* Portfolio Data */}
            <SpotlightCard className="p-8" spotlightColor="rgba(136, 108, 255, 0.15)">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-[#886cff]"
                    style={{
                      background: "linear-gradient(135deg, rgba(136,108,255,0.12) 0%, rgba(136,108,255,0.04) 100%)",
                      border: "1px solid rgba(136,108,255,0.18)",
                      boxShadow: "0 0 20px rgba(136,108,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                  >
                    <Chart2 weight="BoldDuotone" size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-200">Portfolio Data</h3>
                    <p className="text-xs text-neutral-600">Live analytics dashboards</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {["Sales dashboard", "Financial analytics", "Operations metrics", "HR insights", "Custom reports"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-neutral-400">
                      <Check size={12} className="text-[#886cff]" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/portfolio-data" className="inline-flex items-center gap-1 text-xs text-[#886cff] hover:text-[#886cff]/80 transition-colors">
                  Explore <ArrowRight size={12} />
                </Link>
              </div>
            </SpotlightCard>

            {/* Existing Tools Row */}
            <SpotlightCard className="p-6 md:col-span-2">
              <div className="relative z-10">
                <p className="text-xs text-neutral-600 mb-4 uppercase tracking-widest">Also included</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: <BoxMinimalistic weight="BoldDuotone" size={18} />, name: "Warehouse", desc: "Stock Guardian" },
                    { icon: <DocumentText weight="BoldDuotone" size={18} />, name: "Quotes", desc: "AI estimates" },
                    { icon: <ChartSquare weight="BoldDuotone" size={18} />, name: "Compliance", desc: "Auto-reports" },
                    { icon: <UsersGroupTwoRounded weight="BoldDuotone" size={18} />, name: "Field Commander", desc: "Team tracking" },
                  ].map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center gap-3 p-3 rounded-lg transition-all hover:border-[#886cff]/20"
                      style={{
                        background: "rgba(255,255,255,0.015)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#886cff] shrink-0"
                        style={{
                          background: "linear-gradient(135deg, rgba(136,108,255,0.1) 0%, rgba(136,108,255,0.03) 100%)",
                          border: "1px solid rgba(136,108,255,0.15)",
                        }}
                      >
                        {tool.icon}
                      </div>
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
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              Simple pricing.
              <br />
              <span className="text-neutral-500">Serious results.</span>
            </h2>
            <p className="text-sm text-neutral-600 mt-4">Setup fee: $497 one-off (includes custom configuration + training)</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <GlowingStarsCard key={plan.name} className={plan.popular ? "border-[#886cff]/30" : ""}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#886cff]" />
                )}
                <div className="relative z-20">
                  {plan.popular && (
                    <span className="inline-block text-[10px] uppercase tracking-widest text-[#886cff] rounded-full border border-[#886cff]/30 px-2 py-0.5 mb-4">
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
                        <Check size={12} className="text-[#886cff] shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  <MagneticButton
                    href="/login?tab=signup"
                    className={`mt-8 w-full inline-flex items-center justify-center text-sm font-medium py-3 ${
                      plan.popular
                        ? "bg-[#886cff] text-white"
                        : "border border-white/[0.1] text-neutral-400 hover:text-white"
                    }`}
                  >
                    Start Free Trial
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
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(136,108,255,0.04) 0%, transparent 70%)" }} />
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
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <MagneticButton
              href="/login?tab=signup"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium px-8 py-3.5 rounded-lg bg-[#886cff] text-white"
            >
              Start Free Trial <ArrowRight size={14} />
            </MagneticButton>
            <span className="text-xs text-neutral-600">Free for 30 days, no credit card required</span>
          </motion.div>
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
