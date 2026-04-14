"use client";

import { motion } from "framer-motion";

export default function PhoneMockup() {
  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: "100%", maxWidth: 280, aspectRatio: "280/580" }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* iPhone Frame */}
      <div
        className="absolute inset-0 rounded-[40px]"
        style={{
          background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          padding: 8,
        }}
      >
        {/* Screen */}
        <div className="w-full h-full rounded-[32px] overflow-hidden" style={{ background: "#FFFFFF" }}>
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1">
            <span style={{ fontSize: 11, fontWeight: 600, color: "#1A1A1A" }}>9:41</span>
            <div className="flex items-center gap-1">
              <span style={{ fontSize: 9, fontWeight: 600, color: "#1A1A1A" }}>5G</span>
              <div style={{ width: 20, height: 9, border: "1px solid #FFF", borderRadius: 2, padding: 1 }}>
                <div style={{ width: "70%", height: "100%", background: "#34C759", borderRadius: 1 }} />
              </div>
            </div>
          </div>

          {/* Dynamic Island */}
          <div className="flex justify-center mb-2">
            <div style={{ width: 90, height: 24, background: "#000", borderRadius: 20 }} />
          </div>

          {/* App Header */}
          <div className="px-4 pt-1 pb-2">
            <p style={{ fontSize: 7, color: "#886cff", letterSpacing: 1, textTransform: "uppercase" }}>CYTRON / MARKETING AI</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>Create Content</p>
          </div>

          {/* Upload Area */}
          <div className="mx-4 mb-3 p-3 rounded-xl text-center" style={{ border: "1px dashed rgba(136,108,255,0.4)", background: "rgba(136,108,255,0.05)" }}>
            <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center" style={{ background: "rgba(136,108,255,0.15)" }}>
              <span style={{ fontSize: 14 }}>📸</span>
            </div>
            <p style={{ fontSize: 8, color: "#886cff", fontWeight: 600 }}>Upload photo or video</p>
            <p style={{ fontSize: 6, color: "#666" }}>AI transforms into marketing content</p>
          </div>

          {/* AI Processing Steps */}
          <div className="mx-4 mb-3 space-y-1.5">
            {[
              { icon: "🔍", label: "AI Scene Analysis", status: "done" },
              { icon: "🎬", label: "Video Generation", status: "done" },
              { icon: "✍️", label: "Caption Writing", status: "done" },
              { icon: "📱", label: "Auto Publishing", status: "active" },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: step.status === "active" ? "rgba(136,108,255,0.1)" : "rgba(255,255,255,0.03)",
                  border: step.status === "active" ? "1px solid rgba(136,108,255,0.3)" : "1px solid rgba(255,255,255,0.05)",
                }}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15 }}
              >
                <span style={{ fontSize: 11 }}>{step.icon}</span>
                <span style={{ fontSize: 9, color: step.status === "active" ? "#886cff" : "#999", fontWeight: step.status === "active" ? 600 : 400, flex: 1 }}>{step.label}</span>
                {step.status === "done" && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#059669" }}>
                    <span style={{ color: "#FFF", fontSize: 7 }}>✓</span>
                  </div>
                )}
                {step.status === "active" && (
                  <motion.div
                    className="w-4 h-4 rounded-full"
                    style={{ border: "2px solid #886cff", borderTopColor: "transparent" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Platforms */}
          <div className="mx-4 mb-3">
            <p style={{ fontSize: 7, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Publishing to</p>
            <div className="flex gap-2">
              {[
                { name: "Instagram", color: "#E4405F", icon: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6" },
                { name: "TikTok", color: "#000", border: "#333", icon: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.83a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.24" },
                { name: "Facebook", color: "#1877F2", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { name: "YouTube", color: "#FF0000", icon: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
                { name: "LinkedIn", color: "#0A66C2", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: p.color, border: p.border ? `1px solid ${p.border}` : "none" }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={p.icon} />
                  </svg>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Result Preview */}
          <div className="mx-4 p-3 rounded-xl" style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#059669" }}>
                <span style={{ color: "#1A1A1A", fontSize: 7 }}>✓</span>
              </div>
              <span style={{ fontSize: 9, color: "#059669", fontWeight: 600 }}>Published to 5 platforms</span>
            </div>
            <p style={{ fontSize: 7, color: "#666" }}>Reached 2,450 people in 24h</p>
          </div>

          {/* Bottom Nav */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-center justify-around" style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {["Create", "Posts", "Analytics"].map((tab, i) => (
              <div key={i} className="text-center">
                <div className="w-5 h-5 mx-auto mb-0.5 rounded flex items-center justify-center" style={{ background: i === 0 ? "#886cff" : "transparent" }}>
                  <span style={{ fontSize: 10 }}>{i === 0 ? "✨" : i === 1 ? "📋" : "📊"}</span>
                </div>
                <span style={{ fontSize: 7, color: i === 0 ? "#886cff" : "rgba(255,255,255,0.3)", fontWeight: i === 0 ? 600 : 400 }}>{tab}</span>
              </div>
            ))}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2" style={{ width: 100, height: 3, background: "#FFF", borderRadius: 2, opacity: 0.2 }} />
          </div>
        </div>
      </div>

      {/* Glow */}
      <div className="absolute -inset-8 -z-10 rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(136,108,255,0.12) 0%, transparent 60%)" }} />
    </motion.div>
  );
}
