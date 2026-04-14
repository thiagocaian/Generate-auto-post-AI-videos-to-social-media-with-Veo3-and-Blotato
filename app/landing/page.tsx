"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Square, Zap, Video, BarChart3, Users, Shield, ArrowRight, Check, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

// ─── Noise Background ─────────────────────────────────────────────────────────

function NoiseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;

    const imageData = ctx.createImageData(300, 300);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() * 255;
      imageData.data[i] = v;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = 12;
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.05]"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-16 md:mb-20">
      <span className="text-xs uppercase tracking-[0.3em] text-neutral-500 block mb-4">{label}</span>
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] text-white uppercase">{title}</h2>
      {subtitle && <p className="mt-4 text-neutral-400 max-w-2xl mx-auto text-sm md:text-base">{subtitle}</p>}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Process", href: "#process" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/landing" className="text-white font-bold text-xl tracking-[-0.03em]">CYTRON</Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="text-xs uppercase tracking-[0.2em] px-5 py-2.5 text-neutral-400 hover:text-white font-medium transition-colors">
            LOG IN
          </Link>
          <Link href="/login?tab=signup" className="text-xs uppercase tracking-[0.2em] px-6 py-2.5 bg-white text-black font-semibold hover:bg-neutral-200 transition-colors">
            START FREE TRIAL
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-black border-t border-white/10 px-6 py-6 flex flex-col gap-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-wider text-neutral-400 hover:text-white">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="text-sm uppercase tracking-wider px-6 py-2.5 text-neutral-400 hover:text-white font-medium text-center">
            LOG IN
          </Link>
          <Link href="/login?tab=signup" className="text-sm uppercase tracking-wider px-6 py-2.5 bg-white text-black font-semibold text-center">
            START FREE TRIAL
          </Link>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#222_0%,#000_70%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div>
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-neutral-500 border border-neutral-800 px-4 py-1.5 mb-8">
              AI Automation Platform
            </span>
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[-0.03em] text-white uppercase leading-[0.9]"
          >
            PHOTO
            <br />
            <span className="text-neutral-500">TO VIDEO</span>
            <br />
            ENGINE
          </h1>

          <p
            className="mt-8 text-neutral-400 text-sm md:text-base max-w-md leading-relaxed"
          >
            Your employee snaps a photo on-site. CYTRON&apos;s AI generates a cinematic marketing video and auto-publishes to Instagram &amp; TikTok. Zero manual work.
          </p>

          <div
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link href="/login?tab=signup" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] px-8 py-3.5 bg-white text-black font-semibold hover:bg-neutral-200 transition-colors">
              START FREE TRIAL <ArrowRight size={14} />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] px-8 py-3.5 border border-neutral-800 text-neutral-400 hover:text-white hover:border-white transition-colors">
              LEARN MORE
            </a>
          </div>
        </div>

        {/* Geometric shape */}
        <div className="hidden lg:flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="relative w-80 h-80"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border border-white/20"
                style={{
                  transform: `rotate(${i * 22.5}deg) scale(${1 - i * 0.15})`,
                }}
                animate={{ rotate: [0, 90] }}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={48} className="text-white/40" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-600 text-xs uppercase tracking-widest"
      >
        Scroll
      </motion.div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    { icon: Video, title: "AI Video Generation", desc: "Transform photos into cinematic marketing videos with Kling AI. Auto-post to Instagram & TikTok." },
    { icon: Zap, title: "n8n Automation", desc: "Workflows running 24/7 with 0% failure rate. From photo upload to social media — fully automated." },
    { icon: BarChart3, title: "Smart Analytics", desc: "Real-time performance tracking. AI-powered insights across all channels and campaigns." },
    { icon: Users, title: "Client Management", desc: "Manage multiple clients from one dashboard. Each with their own brand and AI campaigns." },
    { icon: Shield, title: "Compliance Shield", desc: "Generate AS3012, RCD testing, emergency lighting reports. PDF export with AI assistance." },
    { icon: Square, title: "Warehouse System", desc: "QR-powered inventory. Real-time stock tracking, low-stock alerts, and project allocation." },
  ];

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionHeader label="What we build" title="Features" subtitle="Everything your business needs to automate marketing, manage operations, and scale without hiring." />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-black p-8 md:p-10 group hover:bg-white/5 transition-colors"
              >
                <Icon size={24} className="text-white/40 mb-6 group-hover:text-white transition-colors" strokeWidth={1} />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">{f.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Process ──────────────────────────────────────────────────────────────────

function Process() {
  const steps = [
    { n: "01", title: "Snap", desc: "Employee takes a photo on the job site. That's it." },
    { n: "02", title: "Analyse", desc: "Claude Vision identifies the scene, materials, and context." },
    { n: "03", title: "Generate", desc: "Kling AI creates a cinematic video from the photo." },
    { n: "04", title: "Caption", desc: "AI writes platform-optimized captions with hashtags." },
    { n: "05", title: "Publish", desc: "Auto-posts to Instagram & TikTok via Blotato API." },
  ];

  return (
    <section id="process" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader label="How it works" title="Process" subtitle="From a single photo to a full marketing campaign in under 60 seconds." />

        <div className="space-y-0">
          {steps.map((s) => (
            <div
              key={s.n}
              className="flex items-start gap-6 md:gap-10 py-8 border-t border-white/10 group hover:bg-white/[0.02] px-4 -mx-4 transition-colors"
            >
              <span className="text-3xl md:text-5xl font-bold text-neutral-800 group-hover:text-neutral-600 transition-colors tabular-nums tracking-tight">
                {s.n}
              </span>
              <div>
                <h3 className="text-white font-semibold text-lg md:text-xl uppercase tracking-wider mb-2">{s.title}</h3>
                <p className="text-neutral-500 text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: 19,
      limits: { jobs: "50/mo", videos: "10/mo", posts: "30/mo" },
      features: [
        { label: "Materials Agent", included: true },
        { label: "Priority Support", included: false },
        { label: "Custom Branding", included: false },
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: 49,
      limits: { jobs: "200/mo", videos: "50/mo", posts: "150/mo" },
      features: [
        { label: "Materials Agent", included: true },
        { label: "Priority Support", included: true },
        { label: "Custom Branding", included: false },
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: 99,
      limits: { jobs: "Unlimited", videos: "Unlimited", posts: "Unlimited" },
      features: [
        { label: "Materials Agent", included: true },
        { label: "Priority Support", included: true },
        { label: "Custom Branding", included: true },
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader label="Plans" title="Pricing" subtitle="All prices in AUD. 30-day free trial on every plan. No credit card required." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-black p-8 md:p-10 relative ${plan.popular ? "border border-white/20" : ""}`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-0 text-[10px] uppercase tracking-widest bg-white text-black px-3 py-1 font-semibold">
                  Popular
                </span>
              )}
              <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">{plan.name}</h3>
              <div className="mb-8">
                <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">${plan.price}</span>
                <span className="text-neutral-600 text-sm ml-1">AUD/mo</span>
              </div>

              {/* Limits */}
              <div className="space-y-2 mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Jobs</span>
                  <span className="text-white font-medium">{plan.limits.jobs}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">AI Videos</span>
                  <span className="text-white font-medium">{plan.limits.videos}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Social Posts</span>
                  <span className="text-white font-medium">{plan.limits.posts}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-10">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-3 text-sm text-neutral-400">
                    {f.included ? (
                      <Check size={14} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                        <span className="block w-2 h-0.5 bg-neutral-700" />
                      </span>
                    )}
                    <span className={f.included ? "text-neutral-300" : "text-neutral-600"}>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login?tab=signup"
                className={`block text-center text-xs uppercase tracking-[0.2em] py-3 font-semibold transition-colors ${
                  plan.popular
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "border border-neutral-800 text-neutral-400 hover:text-white hover:border-white"
                }`}
              >
                START FREE TRIAL
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <SectionHeader label="Get in touch" title="Contact" />
            <div className="space-y-6 mt-8">
              <div className="flex items-center gap-4">
                <Mail size={16} className="text-neutral-600" />
                <span className="text-neutral-400 text-sm">hello@cytron.com.au</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={16} className="text-neutral-600" />
                <span className="text-neutral-400 text-sm">+61 4XX XXX XXX</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin size={16} className="text-neutral-600" />
                <span className="text-neutral-400 text-sm">Gold Coast, QLD, Australia</span>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-600 block mb-2">Name</label>
              <input className="w-full bg-transparent border border-neutral-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors" placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-600 block mb-2">Email</label>
              <input type="email" className="w-full bg-transparent border border-neutral-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors" placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-600 block mb-2">Message</label>
              <textarea rows={4} className="w-full bg-transparent border border-neutral-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors resize-none" placeholder="Tell us about your project" />
            </div>
            <button type="submit" className="text-xs uppercase tracking-[0.2em] px-8 py-3.5 bg-white text-black font-semibold hover:bg-neutral-200 transition-colors w-full md:w-auto">
              SEND MESSAGE
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-white font-bold text-lg tracking-[-0.03em]">CYTRON</div>
        <div className="flex gap-6">
          {["Features", "Process", "Pricing", "Contact"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-xs uppercase tracking-wider text-neutral-600 hover:text-white transition-colors">
              {l}
            </a>
          ))}
        </div>
        <p className="text-xs text-neutral-700">&copy; 2026 CYTRON Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <NoiseBackground />
      <Navbar />
      <Hero />
      <Features />
      <Process />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}
