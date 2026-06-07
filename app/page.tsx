"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight,
  Check,
  Phone,
  MessageSquare,
  Calendar,
  RefreshCw,
  Share2,
  Star,
  Package,
  Truck,
  BarChart3,
  Zap,
} from "lucide-react";
import Link from "next/link";
import BackgroundScene from "@/components/BackgroundScene";
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

// ─── Analytics helper ─────────────────────────────────────────────────────────
function track(event: string, props?: Record<string, string>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", event, props);
  }
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
const plans = [
  {
    name: "Starter",
    price: "$149",
    period: "/mo AUD",
    desc: "For small businesses getting their first lead system.",
    features: [
      "Lead Capture widget",
      "AI Receptionist (email + SMS)",
      "Smart Booking integration",
      "Automatic follow-up (3-touch)",
      "Up to 100 leads/month",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$299",
    period: "/mo AUD",
    popular: true,
    desc: "For growing businesses that can’t afford to miss a lead.",
    features: [
      "Everything in Starter",
      "Social Media Automation",
      "Review Booster",
      "Unlimited leads/month",
      "CRM integration",
      "Priority support",
    ],
  },
  {
    name: "Automation Pro",
    price: "$599",
    period: "/mo AUD",
    desc: "Full automation stack for ambitious operators.",
    features: [
      "Everything in Growth",
      "E-commerce Fulfillment",
      "Custom n8n workflows",
      "Dedicated account manager",
      "Custom reporting",
      "24/7 priority support",
    ],
  },
];

const INDUSTRIES = [
  "Electrical",
  "Plumbing",
  "HVAC / Air Conditioning",
  "Landscaping / Lawn Care",
  "Building / Construction",
  "Cleaning",
  "Retail / E-commerce",
  "Professional Services",
  "Other",
];

const MONTHLY_ENQUIRIES = [
  "Less than 10",
  "10 – 30",
  "30 – 100",
  "100 – 300",
  "300+",
];

// ─── Lead Audit Form ──────────────────────────────────────────────────────────
function LeadAuditForm() {
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    industry: "",
    website: "",
    monthlyEnquiries: "",
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
    track("lead_audit_submitted", { industry: form.industry });
    try {
      const res = await fetch("/api/lead-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
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
        <h3 className="text-2xl font-bold text-white mb-3">Audit request received</h3>
        <p className="text-neutral-400 mb-2 max-w-sm mx-auto text-sm">
          We&apos;ll analyse your lead flow and send you a personalised report within 24 hours.
        </p>
        <p className="text-neutral-600 text-xs">Check your inbox — a confirmation is on its way.</p>
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
          <label className={labelClass}>Business name *</label>
          <input type="text" placeholder="Acme Electrical" value={form.businessName} onChange={set("businessName")} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" placeholder="jane@yourbusiness.com" value={form.email} onChange={set("email")} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" placeholder="0400 000 000" value={form.phone} onChange={set("phone")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Industry</label>
          <select value={form.industry} onChange={set("industry")} className={inputClass + " appearance-none"}>
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Website</label>
          <input type="url" placeholder="https://yourbusiness.com.au" value={form.website} onChange={set("website")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Average enquiries per month</label>
          <select value={form.monthlyEnquiries} onChange={set("monthlyEnquiries")} className={inputClass + " appearance-none"}>
            <option value="">Select range</option>
            {MONTHLY_ENQUIRIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>How do you currently handle enquiries?</label>
        <textarea
          placeholder="e.g. Phone calls go to voicemail, I reply to emails when I get a chance, leads come from Facebook and I sometimes miss them..."
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
        {status === "loading" ? "Sending..." : "Get My Free Lead Audit"} <ArrowRight size={16} />
      </motion.button>
      <p className="text-center text-xs text-neutral-600">No credit card required. We&apos;ll respond within 24 hours.</p>
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
          <a href="#lead-engine" className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all">Lead Engine</a>
          <Link href="/solutions/ecommerce-automation" className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all" onClick={() => track("fulfillment_viewed")}>E-commerce</Link>
          <a href="#how-it-works" className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all">How It Works</a>
          <a href="#pricing" className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all" onClick={() => track("pricing_viewed")}>Pricing</a>
          <a
            href="#lead-audit"
            className="ml-2 px-4 py-1.5 text-xs font-semibold text-white rounded-full bg-[#886cff] hover:bg-[#7b5ff2] transition-colors"
            onClick={() => track("lead_audit_started")}
          >
            Free Audit
          </a>
        </motion.div>
      </nav>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── HERO ────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <BackgroundScene particleCount={40} opacity={0.3} />
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
            AI-Powered Lead Engine for Australian Businesses
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-[-0.03em] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Never lose another
            <br />
            <motion.span
              style={{
                background: "linear-gradient(135deg, rgba(136,108,255,0.95), rgba(99,179,237,0.9))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              customer enquiry.
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            CYTRON captures, responds, qualifies and follows up with your leads automatically — 24/7, while you focus on the job.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <a
              href="#lead-audit"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#886cff] hover:bg-[#7b5ff2] text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-[#886cff]/25"
              onClick={() => track("lead_audit_started")}
            >
              Get Your Free Lead Audit
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm transition-all"
            >
              See How CYTRON Works
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
              { value: "< 2 min", label: "Response time" },
              { value: "24/7", label: "Always on" },
              { value: "3×", label: "More leads captured" },
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
      {/* ─── PROBLEM SECTION ─────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-24 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">The Problem</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-6">
              How many customers are you losing
              <br />
              <span className="text-neutral-500">because nobody replied quickly enough?</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-14">
              The average business takes 47 hours to respond to a lead. Your competitor answers in minutes. Studies show 78% of customers buy from the first business that responds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {[
              { icon: "📱", title: "Leads spread across platforms", desc: "Email, Facebook, Instagram, website forms — all in different places." },
              { icon: "⏰", title: "Delayed responses", desc: "You&apos;re on the job. By the time you reply, they&apos;ve called someone else." },
              { icon: "💸", title: "Quotes that go cold", desc: "You sent the quote. They never replied. You never followed up." },
              { icon: "📅", title: "Manual scheduling", desc: "Back-and-forth to find a time costs you and the customer." },
              { icon: "🔁", title: "No follow-up system", desc: "Most sales happen on the 5th contact. Most businesses stop at 1." },
              { icon: "🤷", title: "Forgotten opportunities", desc: "That warm lead from Tuesday — did you ever call them back?" },
            ].map((p, i) => (
              <motion.div
                key={i}
                className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="text-2xl mb-3">{p.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{p.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.desc }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── LEAD ENGINE PRODUCT ─────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="lead-engine" className="py-28 border-t border-white/[0.05]" style={{ background: "linear-gradient(180deg, rgba(136,108,255,0.03) 0%, transparent 100%)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Product</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-4">
              CYTRON Lead Engine
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              Turn website visitors, calls and social enquiries into qualified opportunities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <MessageSquare size={20} />,
                title: "Lead Capture",
                desc: "Smart widget on your website, Facebook, and Google — captures every enquiry and routes it instantly.",
              },
              {
                icon: <Phone size={20} />,
                title: "AI Receptionist",
                desc: "Responds to every lead within 2 minutes via SMS and email — even at 2am on a Sunday.",
              },
              {
                icon: <Calendar size={20} />,
                title: "Smart Booking",
                desc: "Qualifies the lead and books them straight into your calendar. No back-and-forth.",
              },
              {
                icon: <RefreshCw size={20} />,
                title: "Automatic Follow-up",
                desc: "Multi-touch follow-up sequence that runs itself. Quotes, confirmations, check-ins — all automated.",
              },
              {
                icon: <Share2 size={20} />,
                title: "Social Media Automation",
                desc: "Auto-respond to DMs and comments. Never miss a lead that came through Instagram or Facebook.",
              },
              {
                icon: <Star size={20} />,
                title: "Review Booster",
                desc: "After every job, automatically asks happy customers for a Google review. More 5-stars, less effort.",
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
                    <h3 className="text-base font-bold text-neutral-200 mb-2">{module.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{module.desc}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
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
              From first contact
              <br />
              <span className="text-neutral-500">to signed customer — automatically.</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-[23px] top-10 bottom-10 w-[1px] bg-gradient-to-b from-[#886cff]/40 via-[#886cff]/20 to-transparent hidden sm:block" />

            <div className="space-y-6">
              {[
                { step: "01", label: "New enquiry", desc: "Lead arrives from website, Facebook, Google, phone — anywhere.", color: "#886cff" },
                { step: "02", label: "Instant response", desc: "AI replies within 2 minutes with a personalised message. Day or night.", color: "#886cff" },
                { step: "03", label: "AI qualification", desc: "Asks the right questions to understand the job, budget, and timeline.", color: "#886cff" },
                { step: "04", label: "Appointment booking", desc: "Books the customer directly into your calendar. No manual coordination.", color: "#886cff" },
                { step: "05", label: "Automatic follow-up", desc: "Sends quote reminders, confirmations, and check-ins until they convert.", color: "#886cff" },
                { step: "06", label: "Customer acquired", desc: "You arrive for the job. The sale was closed before you even picked up the phone.", color: "#059669" },
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
                    <h3 className="text-base font-semibold text-white mb-1">{s.label}</h3>
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
              What changes when every lead gets answered.
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { headline: "More leads answered.", detail: "Every enquiry gets a response in under 2 minutes — even after hours.", icon: <MessageSquare size={22} /> },
              { headline: "More appointments booked.", detail: "Leads self-schedule after qualifying. Your calendar fills itself.", icon: <Calendar size={22} /> },
              { headline: "Less admin work.", detail: "Follow-ups, confirmations, and reviews run on autopilot.", icon: <Zap size={22} /> },
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
      {/* ─── LEAD AUDIT FORM ─────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="lead-audit" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">Free Lead Audit</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-4">
              Find out where your business
              <br />
              <span className="text-neutral-500">is losing leads.</span>
            </h2>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              We&apos;ll analyse your current enquiry process and show you exactly how many customers you&apos;re missing — and how to fix it.
            </p>
          </motion.div>

          <motion.div
            className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <LeadAuditForm />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ─── ECOMMERCE SECONDARY ─────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-24 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="flex flex-col lg:flex-row items-start gap-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 mb-4">Also by CYTRON</p>
              <h2 className="text-3xl font-bold tracking-[-0.03em] mb-4">
                Selling online?
                <br />
                <span className="text-neutral-500">Automate your operations too.</span>
              </h2>
              <p className="text-neutral-400 text-base leading-relaxed mb-6">
                CYTRON connects orders, inventory, packing and shipping so your team can process more orders with fewer errors.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Shopify order sync",
                  "Real-time inventory tracking",
                  "Automated pack calculations",
                  "StarShipIt courier integration",
                  "Pick & scan warehouse workflow",
                  "n8n automation agents",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-neutral-400">
                    <Check size={14} className="text-[#886cff] shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <Link
                href="/solutions/ecommerce-automation"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#886cff] hover:text-[#7b5ff2] transition-colors"
                onClick={() => track("fulfillment_viewed")}
              >
                Learn about E-commerce Automation <ArrowRight size={14} />
              </Link>
            </div>

            {/* Built from real automation */}
            <div className="flex-1">
              <SpotlightCard className="p-8">
                <div className="relative z-10">
                  <p className="text-xs uppercase tracking-widest text-neutral-600 mb-6">House of Mouth — Built from real operations</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <Package size={16} />, name: "Shopify", desc: "Order sync" },
                      { icon: <BarChart3 size={16} />, name: "Stock Guardian", desc: "Live inventory" },
                      { icon: <Package size={16} />, name: "Pack Engine", desc: "Box calculations" },
                      { icon: <Truck size={16} />, name: "StarShipIt", desc: "Courier booking" },
                      { icon: <Share2 size={16} />, name: "Marketing", desc: "AI video + posts" },
                      { icon: <Zap size={16} />, name: "n8n Agents", desc: "All connected" },
                    ].map((t) => (
                      <div
                        key={t.name}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[#886cff] shrink-0"
                          style={{ background: "rgba(136,108,255,0.1)", border: "1px solid rgba(136,108,255,0.15)" }}>
                          {t.icon}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-neutral-300">{t.name}</div>
                          <div className="text-[10px] text-neutral-600">{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </div>
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
              Simple pricing.
              <br />
              <span className="text-neutral-500">Serious results.</span>
            </h2>
          </motion.div>
          <p className="text-center text-sm text-neutral-600 mb-12">
            Setup & implementation: AUD $500 – $2,000 one-off (includes custom configuration, integrations, and training)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlowingStarsCard className={plan.popular ? "border-[#886cff]/30" : ""}>
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
                      href="#lead-audit"
                      className={`mt-8 w-full inline-flex items-center justify-center text-sm font-medium py-3 rounded-lg ${
                        plan.popular
                          ? "bg-[#886cff] text-white"
                          : "border border-white/[0.1] text-neutral-400 hover:text-white"
                      }`}
                    >
                      Get Started
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
            Find out where your business
            <br />
            is losing leads.
          </motion.h2>
          <motion.p
            className="text-sm text-neutral-500 mb-10 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Get a free, personalised audit of your current enquiry flow — and a clear plan to fix it.
          </motion.p>
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <MagneticButton
              href="#lead-audit"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-8 py-4 rounded-lg bg-[#886cff] text-white"
            >
              Get Your Free Lead Audit <ArrowRight size={14} />
            </MagneticButton>
            <span className="text-xs text-neutral-600">No credit card. No commitment. Just answers.</span>
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
              <a href="#lead-engine" className="hover:text-neutral-400 transition-colors">Lead Engine</a>
              <Link href="/solutions/ecommerce-automation" className="hover:text-neutral-400 transition-colors">E-commerce</Link>
              <a href="#how-it-works" className="hover:text-neutral-400 transition-colors">How It Works</a>
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
