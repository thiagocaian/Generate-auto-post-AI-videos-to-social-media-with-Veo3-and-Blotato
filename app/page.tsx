"use client";

import React, { useState, useRef } from "react";
import { track } from "@vercel/analytics";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight,
  Check,
  Camera,
  Building2,
  Lock,
  Bell,
  Wrench,
  ClipboardCheck,
  ShieldCheck,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SecurityHeroScene from "@/components/SecurityHeroScene";
import { SpotlightCard } from "@/components/ui/aceternity/spotlight-card";
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


// ─── Packages ─────────────────────────────────────────────────────────────────
const packages = [
  {
    name: "Residential",
    desc: "For homes and townhouses.",
    features: [
      "2–8 camera systems",
      "Mobile app access & alerts",
      "Free on-site assessment",
      "Standard warranty",
      "Local Gold Coast support",
    ],
  },
  {
    name: "Commercial",
    desc: "For shops, offices and warehouses.",
    popular: true,
    features: [
      "Everything in Residential",
      "Multi-camera & access control",
      "Remote viewing for multiple staff",
      "Priority installation",
      "Maintenance plans available",
    ],
  },
  {
    name: "Enterprise / Multi-Site",
    desc: "For larger operations and multi-location businesses.",
    features: [
      "Everything in Commercial",
      "24/7 monitoring integration",
      "Custom NVR & cloud storage",
      "Multi-site management",
      "Dedicated account support",
    ],
  },
];

const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Multi-site / Enterprise",
  "Other",
];

// ─── Quote Form ────────────────────────────────────────────────────────────────
function QuoteForm() {
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    industry: "",
    responseProcess: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.businessName || !form.email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/lead-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        // Fire analytics only on confirmed success
        track("lead_audit_submitted", { industry: form.industry });
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  const inputClass = "w-full px-4 py-3 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-neutral-600 outline-none focus:border-[#886cff]/50 transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-400 mb-1.5";

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 px-6"
      >
        <div className="w-14 h-14 rounded-full bg-[#886cff]/10 border border-[#886cff]/30 flex items-center justify-center mx-auto mb-6">
          <Check size={24} className="text-[#886cff]" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Request received</h3>
        <p className="text-neutral-400 mb-2 max-w-sm mx-auto text-sm">
          We&apos;ll review your details and get back to you with a quote within 24 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Your name *</label>
          <input type="text" placeholder="Jane Smith" value={form.name} onChange={set("name")} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Property / business name *</label>
          <input type="text" placeholder="Smith Residence or Acme Pty Ltd" value={form.businessName} onChange={set("businessName")} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" placeholder="0400 000 000" value={form.phone} onChange={set("phone")} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Property type</label>
          <select value={form.industry} onChange={set("industry")} className={inputClass + " appearance-none"}>
            <option value="">Select property type</option>
            {PROPERTY_TYPES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Tell us about your property and security needs</label>
        <textarea
          placeholder="e.g. 4-bedroom home, two entry points to cover, want mobile alerts and a doorbell camera..."
          value={form.responseProcess}
          onChange={set("responseProcess")}
          rows={3}
          className={inputClass + " resize-none"}
        />
      </div>
      {status === "error" && (
        <p className="text-red-400 text-xs">{errorMsg}</p>
      )}
      <motion.button
        type="submit"
        disabled={status === "loading"}
        className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-8 py-4 rounded-lg bg-[#886cff] text-white transition-opacity disabled:opacity-50"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => track("lead_audit_started")}
      >
        {status === "loading" ? "Sending..." : "Get My Free Quote"} <ArrowRight size={16} />
      </motion.button>
      <p className="text-center text-xs text-neutral-600">No obligation. We&apos;ll respond within 24 hours.</p>
    </form>
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

      {/* ─── Nav ─────────────────────────────────────────────────── */}
      <nav className="fixed top-2 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <motion.div
          className="pointer-events-auto flex items-center gap-1 px-4 py-2 rounded-full border border-white/[0.08] backdrop-blur-md"
          style={{ background: "rgba(10,10,10,0.85)" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mr-4">
            <CytronLogo size={20} />
            <span className="text-sm font-semibold text-white">CYTRON</span>
          </div>
          <a href="#services" className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all">Services</a>
          <a href="#projects" className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all">Projects</a>
          <a href="#how-it-works" className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all">How It Works</a>
          <a href="#why-it-matters" className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all">Why It Matters</a>
          <a href="#pricing" className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all" onClick={() => track("pricing_viewed")}>Pricing</a>
          <a
            href="#quote"
            className="ml-2 px-4 py-1.5 text-xs font-semibold text-white rounded-full bg-[#886cff] hover:bg-[#7b5ff2] transition-colors"
            onClick={() => track("lead_audit_started")}
          >
            Free Quote
          </a>
        </motion.div>
      </nav>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── HERO ────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <SecurityHeroScene />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(136,108,255,0.07) 0%, transparent 70%)" }} />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-32 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#886cff]/30 bg-[#886cff]/5 text-xs text-[#886cff] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#886cff]"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            CCTV &amp; Security Installation — Gold Coast
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-[-0.03em] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Protect what matters,
            <br />
            <motion.span
              style={{
                background: "linear-gradient(135deg, rgba(136,108,255,0.95), rgba(99,179,237,0.9))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              day and night.
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            CYTRON designs, installs and maintains CCTV and security systems for homes and businesses across the Gold Coast — from a free site assessment to ongoing support.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <a
              href="#quote"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#886cff] hover:bg-[#7b5ff2] text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-[#886cff]/25"
              onClick={() => track("lead_audit_started")}
            >
              Get Your Free Quote
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm transition-all"
            >
              See How It Works
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-10 mt-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            {[
              { value: "Free", label: "Site assessment" },
              { value: "24/7", label: "Monitoring ready" },
              { value: "Fast", label: "Turnaround" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-neutral-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── WHY IT MATTERS ──────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="why-it-matters" className="py-24 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Why It Matters</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-6">
              Break-ins don&apos;t wait.
              <br />
              <span className="text-neutral-500">Neither should your security.</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-12">
              A quick look at what&apos;s driving demand for CCTV and security systems across the Gold Coast.
            </p>
          </motion.div>

          <motion.div
            className="relative rounded-2xl overflow-hidden border border-white/[0.08] mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Image
              src="/images/cctv/gold-coast-commercial-cctv-hero.png"
              alt="CCTV security camera installed on a commercial building along the Gold Coast beachfront at dusk"
              width={1672}
              height={941}
              className="w-full h-auto"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(5,5,5,0.85) 100%)" }} />
            <p className="absolute bottom-4 left-5 text-xs text-neutral-300">Commercial CCTV overlooking the Gold Coast beachfront</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left mb-6">
            {[
              { stat: "12%", title: "Rise in home invasions", desc: "Gold Coast home invasions have risen over the past year." },
              { stat: "20 min", title: "A break-in every 20 minutes", desc: "That's how often a break-in occurs somewhere in Queensland." },
              { stat: "80%", title: "Fewer break-ins", desc: "Homes with security cameras and screens installed see far fewer break-ins." },
              { stat: "20%", title: "Rise in business crime", desc: "Growing crime rates are pushing more businesses to strengthen security." },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="text-2xl font-bold text-[#886cff] mb-2">{s.stat}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { src: "/images/cctv/gold-coast-home-cctv.png", w: 1672, h: 941, alt: "A security camera mounted under the eaves of a modern Gold Coast home", caption: "Residential CCTV, discreetly mounted" },
              { src: "/images/cctv/commercial-cctv-close-up.png", w: 1448, h: 1086, alt: "Close-up of a dome security camera overlooking a Gold Coast business precinct at night", caption: "Dome camera covering a business precinct" },
            ].map((img) => (
              <motion.div
                key={img.src}
                className="relative rounded-xl overflow-hidden border border-white/[0.06]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.w}
                  height={img.h}
                  className="w-full h-auto"
                  sizes="(max-width: 640px) 100vw, 512px"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(5,5,5,0.85) 100%)" }} />
                <p className="absolute bottom-3 left-4 text-xs text-neutral-300">{img.caption}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-neutral-700 mt-10">
            Informational only — figures reflect general Gold Coast &amp; Queensland security trends.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── SERVICES ────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="services" className="py-28 border-t border-white/[0.05]" style={{ background: "linear-gradient(180deg, rgba(136,108,255,0.03) 0%, transparent 100%)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Services</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-4">
              What we install &amp; support
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              From a single home camera to multi-site commercial systems — we design, install and support all of it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Camera size={20} />,
                title: "Residential CCTV",
                desc: "Discreet, high-definition cameras covering entry points, driveways and blind spots around your home.",
              },
              {
                icon: <Building2 size={20} />,
                title: "Commercial &amp; Business Security",
                desc: "Multi-camera systems for shops, offices and warehouses, with remote viewing from anywhere.",
              },
              {
                icon: <Lock size={20} />,
                title: "Access Control",
                desc: "Keypads, fobs and video intercoms that control who comes and goes from your property.",
              },
              {
                icon: <Bell size={20} />,
                title: "Alarm &amp; Monitoring",
                desc: "AI-powered motion alerts and integration with 24/7 monitoring services.",
              },
              {
                icon: <Wrench size={20} />,
                title: "Maintenance &amp; Support",
                desc: "Firmware updates, camera realignment and fast repairs whenever something needs attention.",
              },
              {
                icon: <ClipboardCheck size={20} />,
                title: "Free Site Assessment",
                desc: "We walk your property, map coverage and blind spots, and quote before any work begins.",
              },
            ].map((module, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <SpotlightCard className="p-7 h-full">
                  <div className="relative z-10">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[#886cff] mb-5"
                      style={{
                        background: "linear-gradient(135deg, rgba(136,108,255,0.12) 0%, rgba(136,108,255,0.04) 100%)",
                        border: "1px solid rgba(136,108,255,0.18)",
                      }}
                    >
                      {module.icon}
                    </div>
                    <h3 className="text-base font-bold text-neutral-200 mb-2" dangerouslySetInnerHTML={{ __html: module.title }} />
                    <p className="text-sm text-neutral-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: module.desc }} />
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── PROJECTS ────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="projects" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Where We Work</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-4">
              From beachfront homes
              <br />
              <span className="text-neutral-500">to city offices.</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              The kind of residential and commercial properties CYTRON designs security systems for, right across the Gold Coast.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { src: "/images/projects/gold-coast-skyline.jpg", w: 1024, h: 768, alt: "Aerial view of Surfers Paradise skyline and beach on the Gold Coast", caption: "Surfers Paradise, Gold Coast" },
              { src: "/images/projects/modern-residential.jpg", w: 1024, h: 768, alt: "A modern two-storey house with large windows", caption: "Homes &amp; townhouses" },
              { src: "/images/projects/commercial-office.jpg", w: 768, h: 1024, alt: "A modern glass-fronted office building", caption: "Offices &amp; commercial premises" },
            ].map((img, i) => (
              <motion.div
                key={img.src}
                className="relative rounded-xl overflow-hidden border border-white/[0.06] aspect-[4/5]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(5,5,5,0.85) 100%)" }} />
                <p className="absolute bottom-3 left-4 text-xs text-neutral-300" dangerouslySetInnerHTML={{ __html: img.caption }} />
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-neutral-700 mt-8">
            Illustrative photos, not completed CYTRON installations. Surfers Paradise photo by Tatters (CC BY 2.0) via Flickr; home photo by pnwra (CC BY 2.0) via Flickr; office photo by ricardodiaz11 (CC BY 2.0) via Flickr.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              From free quote
              <br />
              <span className="text-neutral-500">to fully installed and supported.</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-[23px] top-10 bottom-10 w-[1px] bg-gradient-to-b from-[#886cff]/40 via-[#886cff]/20 to-transparent hidden sm:block" />

            <div className="space-y-6">
              {[
                { step: "01", label: "Free consultation", desc: "Tell us about your property and what you're trying to protect.", color: "#886cff" },
                { step: "02", label: "Site assessment", desc: "We visit in person to map camera placement, cabling runs and blind spots.", color: "#886cff" },
                { step: "03", label: "Custom quote", desc: "A clear, itemised quote — no hidden fees, no obligation.", color: "#886cff" },
                { step: "04", label: "Professional installation", desc: "Licensed technicians install your system with minimal disruption.", color: "#886cff" },
                { step: "05", label: "Handover &amp; training", desc: "We walk you through the app, footage access and alerts before we leave.", color: "#886cff" },
                { step: "06", label: "Ongoing support", desc: "Maintenance, upgrades and support whenever you need it.", color: "#059669" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold shrink-0 relative z-10"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}40`, color: s.color }}
                  >
                    {s.step}
                  </div>
                  <div className="pt-3">
                    <h3 className="text-base font-semibold text-white mb-1" dangerouslySetInnerHTML={{ __html: s.label }} />
                    <p className="text-sm text-neutral-500">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── RESULTS ─────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-white/[0.05]" style={{ background: "linear-gradient(180deg, rgba(136,108,255,0.03) 0%, transparent 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Results</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-12">
              What changes when your property is covered.
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { headline: "Fewer break-ins.", detail: "Visible cameras and monitored systems are a proven deterrent against opportunistic crime.", icon: <ShieldCheck size={22} /> },
              { headline: "Eyes on your property, 24/7.", detail: "Check live footage and get alerts from your phone, wherever you are.", icon: <Eye size={22} /> },
              { headline: "Faster response when it matters.", detail: "Motion alerts and monitoring mean you know the moment something happens.", icon: <Bell size={22} /> },
            ].map((r, i) => (
              <motion.div
                key={i}
                className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#886cff] mb-5"
                  style={{ background: "rgba(136,108,255,0.1)", border: "1px solid rgba(136,108,255,0.2)" }}>
                  {r.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{r.headline}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{r.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── QUOTE FORM ──────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="quote" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Free Security Assessment</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-4">
              Get a free,
              <br />
              <span className="text-neutral-500">no-obligation quote.</span>
            </h2>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              Tell us about your property and what you need protected — we&apos;ll get back to you within 24 hours with next steps.
            </p>
          </motion.div>

          <motion.div
            className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <QuoteForm />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── PRICING ─────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              Straightforward packages.
              <br />
              <span className="text-neutral-500">Tailored to your property.</span>
            </h2>
          </motion.div>
          <p className="text-center text-sm text-neutral-600 mb-12">
            Every property is different — get a free, no-obligation quote and we&apos;ll recommend the right package.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlowingStarsCard className={pkg.popular ? "border-[#886cff]/30" : ""}>
                  {pkg.popular && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#886cff]" />
                  )}
                  <div className="relative z-20">
                    {pkg.popular && (
                      <span className="inline-block text-[10px] uppercase tracking-widest text-[#886cff] rounded-full border border-[#886cff]/30 px-2 py-0.5 mb-4">
                        Most Popular
                      </span>
                    )}
                    <GlowingStarsTitle>{pkg.name}</GlowingStarsTitle>
                    <GlowingStarsDescription>{pkg.desc}</GlowingStarsDescription>
                    <div className="mt-6 space-y-2.5">
                      {pkg.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-neutral-400">
                          <Check size={12} className="text-[#886cff] shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                    <MagneticButton
                      href="#quote"
                      className={`mt-8 w-full inline-flex items-center justify-center text-sm font-medium py-3 rounded-lg ${
                        pkg.popular
                          ? "bg-[#886cff] text-white"
                          : "border border-white/[0.1] text-neutral-400 hover:text-white"
                      }`}
                    >
                      Get a Free Quote
                    </MagneticButton>
                  </div>
                </GlowingStarsCard>
              </motion.div>
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
            Protect what matters most.
          </motion.h2>
          <motion.p
            className="text-sm text-neutral-500 mb-10 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Get a free, no-obligation quote for your home or business — most quotes are ready within 24 hours.
          </motion.p>
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <MagneticButton
              href="#quote"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-8 py-4 rounded-lg bg-[#886cff] text-white"
            >
              Get Your Free Quote <ArrowRight size={14} />
            </MagneticButton>
            <span className="text-xs text-neutral-600">No obligation. Just a clear plan to keep your property safe.</span>
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
              <span className="text-sm font-semibold text-white">CYTRON</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-neutral-600">
              <a href="#services" className="hover:text-neutral-400 transition-colors">Services</a>
              <a href="#projects" className="hover:text-neutral-400 transition-colors">Projects</a>
              <a href="#how-it-works" className="hover:text-neutral-400 transition-colors">How It Works</a>
              <a href="#why-it-matters" className="hover:text-neutral-400 transition-colors">Why It Matters</a>
              <a href="#pricing" className="hover:text-neutral-400 transition-colors">Pricing</a>
              <Link href="/login" className="hover:text-neutral-400 transition-colors">Login</Link>
            </div>
            <p className="text-xs text-neutral-700">&copy; 2026 CYTRON. Gold Coast, Australia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
