"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Package, Truck, BarChart3, Zap, ShoppingCart, Scan } from "lucide-react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/aceternity/spotlight-card";

export default function EcommerceAutomationPage() {
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
            <p className="text-xs uppercase tracking-[0.2em] text-[#886cff]/70 mb-4">E-commerce Automation</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] mb-6">
              Process more orders.
              <br />
              <span style={{ background: "linear-gradient(135deg, rgba(136,108,255,0.95), rgba(99,179,237,0.9))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Make fewer errors.
              </span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
              CYTRON connects your Shopify store, warehouse, and couriers into one automated pipeline — so your team spends less time on admin and more time shipping.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#886cff]/20 bg-[#886cff]/5 text-xs text-neutral-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              Built from real warehouse operations — not a demo
            </div>
          </motion.div>
        </div>
      </section>

      {/* The stack */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 mb-4">The Stack</p>
            <h2 className="text-3xl font-bold tracking-[-0.03em]">
              Everything connected.
              <br />
              <span className="text-neutral-500">Nothing manual.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <ShoppingCart size={22} />,
                title: "Shopify Order Sync",
                desc: "Orders flow in automatically. Status updates push back to Shopify in real-time. Your store always reflects what&apos;s happening in the warehouse.",
                bullets: [
                  "Real-time order ingestion from Shopify",
                  "Automatic status updates (picked, packed, shipped)",
                  "Multi-location inventory sync",
                ],
              },
              {
                icon: <BarChart3 size={22} />,
                title: "Stock Guardian",
                desc: "Live inventory tracking with automatic reorder alerts. Never oversell, never run out without warning.",
                bullets: [
                  "Real-time stock levels per SKU and location",
                  "Low-stock alerts via SMS or email",
                  "Stock report dashboard — always current",
                ],
              },
              {
                icon: <Package size={22} />,
                title: "Pack Engine",
                desc: "Calculates the optimal box size and packing configuration for every order. Reduces material waste and courier costs.",
                bullets: [
                  "Automatic box selection from your box catalogue",
                  "Weight and dimension calculations",
                  "Packing instructions printed with each order",
                ],
              },
              {
                icon: <Scan size={22} />,
                title: "Pick & Scan Workflow",
                desc: "Android-friendly scanning interface for warehouse workers. Scan, pick, confirm — no paper, no errors.",
                bullets: [
                  "Barcode scan to confirm picks",
                  "Mobile-first UI (works on any Android device)",
                  "Error detection — wrong SKU triggers alert",
                ],
              },
              {
                icon: <Truck size={22} />,
                title: "StarShipIt Integration",
                desc: "Courier booking automated at pack confirmation. Labels printed instantly. Customers get tracking automatically.",
                bullets: [
                  "Auto-books courier on pack confirm",
                  "Multi-carrier rate comparison",
                  "Tracking links sent to customers via Shopify",
                ],
              },
              {
                icon: <Zap size={22} />,
                title: "n8n Automation Agents",
                desc: "The glue between all your tools. Custom workflows that run in the background and keep everything in sync.",
                bullets: [
                  "Connects Shopify → Supabase → StarShipIt",
                  "Exception handling and alerts",
                  "Custom logic for your specific operations",
                ],
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <SpotlightCard className="p-8 h-full">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#886cff]"
                        style={{ background: "rgba(136,108,255,0.1)", border: "1px solid rgba(136,108,255,0.2)" }}>
                        {item.icon}
                      </div>
                      <h3 className="text-base font-bold text-neutral-200">{item.title}</h3>
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: item.desc }} />
                    <div className="space-y-2">
                      {item.bullets.map((b) => (
                        <div key={b} className="flex items-start gap-2 text-xs text-neutral-500">
                          <Check size={12} className="text-[#886cff] shrink-0 mt-0.5" /> {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The flow */}
      <section className="py-20 border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 mb-4">The Flow</p>
            <h2 className="text-3xl font-bold tracking-[-0.03em]">Order in. Parcel out.</h2>
          </motion.div>
          <div className="space-y-5">
            {[
              { step: "01", label: "Customer places order on Shopify", detail: "Order syncs to CYTRON warehouse dashboard instantly." },
              { step: "02", label: "Picker receives order on Android scanner", detail: "Scans each item to confirm pick. Wrong SKU = instant alert." },
              { step: "03", label: "Pack Engine calculates optimal box", detail: "Worker packs, scans to confirm. Label prints automatically." },
              { step: "04", label: "StarShipIt books courier", detail: "Best rate selected. Label attached. Ready for pickup." },
              { step: "05", label: "Shopify updated. Customer notified.", detail: "Tracking link sent. Inventory decremented. Done." },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-5 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "rgba(136,108,255,0.1)", border: "1px solid rgba(136,108,255,0.2)", color: "#886cff" }}>
                  {s.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{s.label}</h3>
                  <p className="text-xs text-neutral-500">{s.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-[-0.03em] mb-4">Ready to automate your fulfilment?</h2>
          <p className="text-neutral-400 mb-8 text-sm">Tell us about your operation and we&apos;ll put together a custom automation plan.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/#lead-audit" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#886cff] hover:bg-[#7b5ff2] text-white text-sm font-semibold transition-all">
              Get in Touch <ArrowRight size={14} />
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
