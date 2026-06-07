"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Phone, MessageSquare, Calendar, RefreshCw, Share2, Star } from "lucide-react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/aceternity/spotlight-card";

export default function LeadEnginePage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="fixed top-0 left-0 right-0 h-[1px] z-50" style={{ background: "linear-gradient(90deg, transparent, #886cff 30%, #886cff 70%, transparent)" }} />

      {/* Back nav */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
          ← Back to CYTRON
        </Link>
      </div>

      {/* Hero */}
      <section className="py-20 border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">CYTRON Lead Engine</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] mb-6">
              Turn every enquiry into
              <br />
              <span style={{ background: "linear-gradient(135deg, rgba(136,108,255,0.95), rgba(99,179,237,0.9))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                a qualified customer.
              </span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
              An AI-powered system that captures, qualifies, books and follows up with every lead — automatically.
              No more missed calls, delayed replies, or forgotten follow-ups.
            </p>
            <a
              href="/#lead-audit"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#886cff] hover:bg-[#7b5ff2] text-white text-sm font-semibold transition-all"
            >
              Get Your Free Lead Audit <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Modules detail */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="space-y-16">
            {[
              {
                number: "01",
                icon: <MessageSquare size={24} />,
                title: "Lead Capture",
                subtitle: "Never miss an enquiry from any channel.",
                bullets: [
                  "Website chat widget that qualifies visitors instantly",
                  "Facebook & Instagram lead form integration",
                  "Google Business Profile message capture",
                  "Missed call text-back — if you miss a call, they get an SMS",
                  "All leads centralised in one inbox",
                ],
              },
              {
                number: "02",
                icon: <Phone size={24} />,
                title: "AI Receptionist",
                subtitle: "A 24/7 responder that sounds human.",
                bullets: [
                  "Replies to every lead within 2 minutes via SMS and email",
                  "Personalised responses based on the enquiry type",
                  "Answers common questions automatically",
                  "Escalates complex enquiries to you with full context",
                  "Works evenings, weekends, and public holidays",
                ],
              },
              {
                number: "03",
                icon: <Calendar size={24} />,
                title: "Smart Booking",
                subtitle: "Your calendar fills itself.",
                bullets: [
                  "Qualifies the lead before booking (job type, location, budget)",
                  "Shows your real availability and books instantly",
                  "Sends calendar invites to both you and the customer",
                  "Integrates with Google Calendar and Outlook",
                  "Handles reschedules and cancellations automatically",
                ],
              },
              {
                number: "04",
                icon: <RefreshCw size={24} />,
                title: "Automatic Follow-up",
                subtitle: "Most sales close on the 5th touchpoint. We do all 5.",
                bullets: [
                  "Quote follow-up sequence (day 1, day 3, day 7)",
                  "Post-appointment check-in messages",
                  "Dormant lead re-engagement campaigns",
                  "Seasonal promotions to your existing customer list",
                  "All written in your brand voice",
                ],
              },
              {
                number: "05",
                icon: <Share2 size={24} />,
                title: "Social Media Automation",
                subtitle: "Turn DMs and comments into customers.",
                bullets: [
                  "Auto-respond to Instagram and Facebook DMs",
                  "Comment-to-DM triggers (post a promo, leads come in automatically)",
                  "Lead qualification via social chat",
                  "Hand-off to booking flow seamlessly",
                ],
              },
              {
                number: "06",
                icon: <Star size={24} />,
                title: "Review Booster",
                subtitle: "More 5-star reviews, on autopilot.",
                bullets: [
                  "Post-job SMS asking for a Google review",
                  "Smart timing — sent when satisfaction is highest",
                  "Negative feedback routed privately to you first",
                  "Integrates with Google Business Profile",
                  "Visible increase in rating within 60 days",
                ],
              },
            ].map((module, i) => (
              <motion.div
                key={i}
                className="flex flex-col md:flex-row gap-10 items-start"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex-shrink-0 flex items-center gap-4 md:flex-col md:items-start md:w-48">
                  <div className="text-5xl font-bold text-neutral-800">{module.number}</div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#886cff]"
                    style={{ background: "rgba(136,108,255,0.1)", border: "1px solid rgba(136,108,255,0.2)" }}>
                    {module.icon}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{module.title}</h2>
                  <p className="text-neutral-400 mb-6">{module.subtitle}</p>
                  <div className="space-y-2.5">
                    {module.bullets.map((b) => (
                      <div key={b} className="flex items-start gap-3 text-sm text-neutral-400">
                        <Check size={14} className="text-[#886cff] shrink-0 mt-0.5" /> {b}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-[-0.03em] mb-4">Ready to stop losing leads?</h2>
          <p className="text-neutral-400 mb-8">Get a free audit of your current enquiry flow and a custom implementation plan.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/#lead-audit" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#886cff] hover:bg-[#7b5ff2] text-white text-sm font-semibold transition-all">
              Get Free Lead Audit <ArrowRight size={14} />
            </a>
            <Link href="/" className="text-sm text-neutral-500 hover:text-white transition-colors">
              Back to homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
