"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Check, Play, Camera, Sparkles, Send, BarChart3, Upload, Shield, Package } from "lucide-react";
import Link from "next/link";

// ─── Animated Section ────────────────────────────────────────────────────────

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Counter Animation ───────────────────────────────────────────────────────

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#process" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-[#0a0a0a] font-bold text-lg tracking-[-0.04em]">
          cytron
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[13px] text-[#666] hover:text-[#0a0a0a] transition-colors">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="text-[13px] font-medium text-white bg-[#0a0a0a] px-5 py-2 rounded-full hover:bg-[#333] transition-colors">
            Get Started
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[#0a0a0a]">
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-[#f0f0f0] px-6 py-6 flex flex-col gap-4"
        >
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-[15px] text-[#666] hover:text-[#0a0a0a] py-1">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="text-[14px] font-medium text-white bg-[#0a0a0a] px-5 py-2.5 rounded-full text-center mt-2">
            Get Started
          </Link>
        </motion.div>
      )}
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="max-w-3xl">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-[#f5f5f5] rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12px] text-[#666] font-medium">AI-Powered Automation Platform</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-[-0.035em] text-[#0a0a0a] leading-[1.05]">
              Your business creates content.
              <br />
              <span className="text-[#999]">Let AI do the rest.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-6 text-[#666] text-[17px] leading-relaxed max-w-lg">
              Snap a photo. CYTRON generates cinematic videos, writes captions, and auto-publishes to your social channels. Zero manual work.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-[14px] font-medium text-white bg-[#0a0a0a] px-7 py-3 rounded-full hover:bg-[#333] transition-colors">
                Start Free Trial <ArrowRight size={15} />
              </Link>
              <a href="#process" className="inline-flex items-center gap-2 text-[14px] text-[#666] hover:text-[#0a0a0a] transition-colors">
                <Play size={14} className="fill-current" /> See how it works
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Stats bar */}
        <FadeIn delay={0.5}>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-[#eee]">
            {[
              { value: 60, suffix: "s", label: "Photo to video" },
              { value: 500, suffix: "+", label: "Videos generated" },
              { value: 99, suffix: "%", label: "Automation rate" },
              { value: 24, suffix: "/7", label: "Always running" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold tracking-[-0.03em] text-[#0a0a0a]">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[13px] text-[#999] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: Camera,
      title: "Photo to Video",
      desc: "Upload a photo from the job site. AI generates a cinematic marketing video in 60 seconds.",
    },
    {
      icon: Send,
      title: "Auto-Publish",
      desc: "Videos are posted directly to Instagram, TikTok, and LinkedIn. Captions and hashtags included.",
    },
    {
      icon: Sparkles,
      title: "AI Captions",
      desc: "Platform-optimized copy written by AI. Different tone for each channel, always on-brand.",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      desc: "Track performance across all channels. AI-powered insights tell you what works and why.",
    },
    {
      icon: Upload,
      title: "Upload Videos",
      desc: "Upload your own raw footage. AI handles the cuts, transitions, subtitles, and music.",
    },
    {
      icon: Package,
      title: "Operations Suite",
      desc: "Warehouse inventory, compliance reports, quoting system. All in one platform.",
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <div className="max-w-2xl mb-16 md:mb-20">
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#999] font-medium">Features</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] text-[#0a0a0a] mt-3 leading-[1.1]">
              Everything your business needs to automate content
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="group">
                  <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center mb-4 group-hover:bg-[#0a0a0a] transition-colors duration-300">
                    <Icon size={18} className="text-[#666] group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[#0a0a0a] font-semibold text-[15px] mb-2">{f.title}</h3>
                  <p className="text-[#999] text-[14px] leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Highlight Section ───────────────────────────────────────────────────────

function Highlight() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <div className="bg-[#fafafa] rounded-3xl p-10 md:p-16 text-center">
            <h2 className="text-2xl md:text-[2.5rem] font-bold tracking-[-0.03em] text-[#0a0a0a] leading-[1.15] max-w-2xl mx-auto">
              Your team takes photos.
              <br />
              <span className="text-[#bbb]">CYTRON handles everything else.</span>
            </h2>
            <p className="mt-5 text-[#999] text-[15px] max-w-md mx-auto leading-relaxed">
              From a single photo to a full marketing campaign across all social channels. Fully automated, 24/7.
            </p>
            <div className="mt-8">
              <Link href="/login" className="inline-flex items-center gap-2 text-[14px] font-medium text-white bg-[#0a0a0a] px-7 py-3 rounded-full hover:bg-[#333] transition-colors">
                Try it free <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Process ─────────────────────────────────────────────────────────────────

function Process() {
  const steps = [
    { n: "01", title: "Snap a photo", desc: "Your employee takes a photo on the job site. That's the only manual step." },
    { n: "02", title: "AI analyses the scene", desc: "Computer vision identifies materials, context, and the best angle for marketing." },
    { n: "03", title: "Video is generated", desc: "AI creates a cinematic video with motion, transitions, and professional editing." },
    { n: "04", title: "Captions are written", desc: "Platform-optimized copy with hashtags, tailored for each social channel." },
    { n: "05", title: "Published automatically", desc: "Posted to Instagram, TikTok, and LinkedIn. You get notified when it's live." },
  ];

  return (
    <section id="process" className="py-24 md:py-32 bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <div className="max-w-2xl mb-16">
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#999] font-medium">How it works</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] text-[#0a0a0a] mt-3 leading-[1.1]">
              From photo to published in under 60 seconds
            </h2>
          </div>
        </FadeIn>

        <div className="space-y-0">
          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.08}>
              <div className="flex items-start gap-6 md:gap-10 py-8 border-t border-[#e5e5e5] group">
                <span className="text-3xl md:text-5xl font-bold text-[#e0e0e0] group-hover:text-[#0a0a0a] transition-colors duration-500 tabular-nums tracking-tight min-w-[60px] md:min-w-[80px]">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[#0a0a0a] font-semibold text-base md:text-lg mb-1">{s.title}</h3>
                  <p className="text-[#999] text-[14px] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

function Pricing() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      desc: "For small businesses getting started",
      price: annual ? 49 : 59,
      features: ["10 AI videos/month", "1 brand", "Instagram auto-post", "Basic analytics", "Email support"],
      popular: false,
    },
    {
      name: "Pro",
      desc: "For growing teams and agencies",
      price: annual ? 149 : 179,
      features: ["50 AI videos/month", "5 brands", "Instagram + TikTok + LinkedIn", "Advanced analytics", "Compliance reports", "Warehouse system", "Priority support"],
      popular: true,
    },
    {
      name: "Enterprise",
      desc: "For large organisations",
      price: annual ? 399 : 499,
      features: ["Unlimited videos", "Unlimited brands", "All platforms", "Custom AI models", "Full compliance suite", "Warehouse + Field Commander", "Dedicated account manager", "SLA guarantee"],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#999] font-medium">Pricing</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] text-[#0a0a0a] mt-3 leading-[1.1]">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-[#999] text-[15px]">No contracts. Cancel anytime.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex justify-center mb-10">
            <div className="flex items-center bg-[#f5f5f5] rounded-full p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`text-[13px] font-medium px-5 py-2 rounded-full transition-all ${!annual ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#999]"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`text-[13px] font-medium px-5 py-2 rounded-full transition-all ${annual ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#999]"}`}
              >
                Annual <span className="text-emerald-500 text-[11px] ml-1">Save 20%</span>
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div className={`rounded-2xl p-8 relative h-full flex flex-col ${plan.popular ? "bg-[#0a0a0a] text-white ring-1 ring-[#0a0a0a]" : "bg-white border border-[#eee]"}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-medium bg-emerald-500 text-white px-3 py-0.5 rounded-full">
                    Most popular
                  </span>
                )}
                <div>
                  <h3 className={`font-semibold text-[15px] ${plan.popular ? "text-white" : "text-[#0a0a0a]"}`}>{plan.name}</h3>
                  <p className={`text-[13px] mt-1 ${plan.popular ? "text-white/60" : "text-[#999]"}`}>{plan.desc}</p>
                </div>
                <div className="mt-6 mb-6">
                  <span className={`text-4xl font-bold tracking-[-0.03em] ${plan.popular ? "text-white" : "text-[#0a0a0a]"}`}>${plan.price}</span>
                  <span className={`text-[13px] ml-1 ${plan.popular ? "text-white/40" : "text-[#ccc]"}`}>/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-[13px] ${plan.popular ? "text-white/80" : "text-[#666]"}`}>
                      <Check size={14} className={`mt-0.5 flex-shrink-0 ${plan.popular ? "text-emerald-400" : "text-[#ccc]"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block text-center text-[13px] font-medium py-2.5 rounded-full transition-colors ${
                    plan.popular
                      ? "bg-white text-[#0a0a0a] hover:bg-neutral-100"
                      : "bg-[#f5f5f5] text-[#0a0a0a] hover:bg-[#eee]"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#999] font-medium">Contact</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] text-[#0a0a0a] mt-3 leading-[1.1]">
              Let&apos;s talk about your project
            </h2>
            <p className="mt-4 text-[#999] text-[15px]">
              Get in touch and we&apos;ll show you how CYTRON can automate your content.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <form className="mt-10 space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-[14px] text-[#0a0a0a] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors"
                  placeholder="Your name"
                />
                <input
                  type="email"
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-[14px] text-[#0a0a0a] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors"
                  placeholder="you@company.com"
                />
              </div>
              <textarea
                rows={4}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-[14px] text-[#0a0a0a] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors resize-none"
                placeholder="Tell us about your project..."
              />
              <div className="text-center pt-2">
                <button type="submit" className="inline-flex items-center gap-2 text-[14px] font-medium text-white bg-[#0a0a0a] px-7 py-3 rounded-full hover:bg-[#333] transition-colors">
                  Send Message <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-[13px] text-[#999]">
              <span>hello@cytron.com.au</span>
              <span>Gold Coast, QLD, Australia</span>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[#f0f0f0] py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-[#0a0a0a] font-bold text-[15px] tracking-[-0.03em]">cytron</div>
        <div className="flex gap-6">
          {["Features", "How it works", "Pricing", "Contact"].map((l) => (
            <a key={l} href={`#${l === "How it works" ? "process" : l.toLowerCase()}`} className="text-[12px] text-[#bbb] hover:text-[#666] transition-colors">
              {l}
            </a>
          ))}
        </div>
        <p className="text-[12px] text-[#ccc]">&copy; 2026 Cytron. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-white text-[#0a0a0a] min-h-screen" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <Navbar />
      <Hero />
      <Features />
      <Highlight />
      <Process />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}
