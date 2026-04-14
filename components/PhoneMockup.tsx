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
        <div className="w-full h-full rounded-[32px] overflow-hidden" style={{ background: "#0A0A0A" }}>
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1">
            <span style={{ fontSize: 11, fontWeight: 600, color: "#FFF" }}>9:41</span>
            <div className="flex items-center gap-1">
              <span style={{ fontSize: 9, fontWeight: 600, color: "#FFF" }}>5G</span>
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
            <p style={{ fontSize: 14, fontWeight: 700, color: "#FFF" }}>Create Content</p>
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
                { name: "IG", color: "#E4405F" },
                { name: "TT", color: "#000", border: "#FFF" },
                { name: "FB", color: "#1877F2" },
                { name: "YT", color: "#FF0000" },
                { name: "Li", color: "#0A66C2" },
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
                  <span style={{ color: "#FFF", fontSize: 7, fontWeight: 700 }}>{p.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Result Preview */}
          <div className="mx-4 p-3 rounded-xl" style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#059669" }}>
                <span style={{ color: "#FFF", fontSize: 7 }}>✓</span>
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
