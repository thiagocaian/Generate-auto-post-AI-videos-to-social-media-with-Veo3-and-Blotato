"use client";

import { motion } from "framer-motion";

const jobs = [
  { id: "JOB-0012", title: "Vinyl plank installation", client: "Scott Williams", status: "in progress", color: "#000", bg: "#F0F0F0", time: "00:45:23" },
  { id: "JOB-0013", title: "Skirting board replacement", client: "Emma Thompson", status: "scheduled", color: "#1D4ED8", bg: "#EFF6FF", time: "2:00 PM" },
  { id: "JOB-0014", title: "Timber floor sanding", client: "Mark Johnson", status: "enquiry", color: "#D97706", bg: "#FFFBEB", time: "Tomorrow" },
];

const checklist = [
  { text: "Remove existing floor", done: true },
  { text: "Level subfloor", done: true },
  { text: "Install moisture barrier", done: false },
  { text: "Lay vinyl planks", done: false },
  { text: "Install skirting boards", done: false },
];

export default function PhoneMockup() {
  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: 280, height: 580 }}
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
        <div className="w-full h-full rounded-[32px] overflow-hidden" style={{ background: "#FFF" }}>
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1" style={{ background: "#FFF" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#000" }}>9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[1,2,3,4].map(i => (
                  <div key={i} className="rounded-sm" style={{ width: 3, height: i === 4 ? 4 : i === 3 ? 6 : i === 2 ? 8 : 10, background: "#000", opacity: i > 2 ? 0.3 : 1 }} />
                ))}
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#000", marginLeft: 2 }}>5G</span>
              <div style={{ width: 20, height: 9, border: "1px solid #000", borderRadius: 2, padding: 1, marginLeft: 2 }}>
                <div style={{ width: "70%", height: "100%", background: "#34C759", borderRadius: 1 }} />
              </div>
            </div>
          </div>

          {/* Dynamic Island */}
          <div className="flex justify-center mb-1">
            <div style={{ width: 90, height: 24, background: "#000", borderRadius: 20 }} />
          </div>

          {/* App Header */}
          <div className="px-4 pt-2 pb-2">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 10, color: "#886cff", fontWeight: 600 }}>Done</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>Job #012</span>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ border: "1px solid #E5E5E5" }}>
                <span style={{ fontSize: 10, color: "#999" }}>i</span>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="mx-4 p-3 rounded-xl mb-2" style={{ background: "#FAFAFA" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#886cff" }}>
                <span style={{ color: "#FFF", fontSize: 11, fontWeight: 700 }}>S</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>Scott Williams</p>
                <p style={{ fontSize: 9, color: "#999" }}>42 Palm Beach Rd, Gold Coast QLD</p>
                <p style={{ fontSize: 9, color: "#1D4ED8", fontWeight: 500 }}>0412 345 678</p>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="mx-4 mb-2">
            <motion.div
              className="py-2.5 rounded-xl text-center"
              style={{ background: "#059669" }}
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p style={{ fontSize: 16, fontWeight: 700, color: "#FFF", letterSpacing: 2 }}>00:45:23</p>
              <p style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Check Out</p>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="mx-4 space-y-1.5 mb-2">
            {[
              { icon: "💰", label: "Billing", value: "$1,850.00", arrow: true },
              { icon: "📋", label: "Diary", value: "", arrow: true },
              { icon: "📍", label: "Assets", value: "3", arrow: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ border: "1px solid #F0F0F0" }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 12 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#000" }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {item.value && <span style={{ fontSize: 11, color: "#000", fontWeight: 600 }}>{item.value}</span>}
                  <span style={{ fontSize: 10, color: "#CCC" }}>›</span>
                </div>
              </div>
            ))}
          </div>

          {/* Checklist */}
          <div className="mx-4 mb-2">
            <p style={{ fontSize: 8, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Checklist</p>
            <div className="space-y-1">
              {checklist.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{ background: item.done ? "#F0FDF4" : "#FFF", border: `1px solid ${item.done ? "#BBF7D0" : "#F0F0F0"}` }}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: item.done ? "#059669" : "#E5E5E5" }}>
                    {item.done && <span style={{ color: "#FFF", fontSize: 8 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 10, color: item.done ? "#059669" : "#333", textDecoration: item.done ? "line-through" : "none" }}>
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-center justify-around" style={{ background: "#FFF", borderTop: "1px solid #F0F0F0" }}>
            {["Jobs", "Calendar", "Dashboard"].map((tab, i) => (
              <div key={i} className="text-center">
                <div className="w-5 h-5 mx-auto mb-0.5 rounded flex items-center justify-center" style={{ background: i === 0 ? "#886cff" : "transparent" }}>
                  <span style={{ fontSize: 10, color: i === 0 ? "#FFF" : "#CCC" }}>
                    {i === 0 ? "📋" : i === 1 ? "📅" : "📊"}
                  </span>
                </div>
                <span style={{ fontSize: 7, color: i === 0 ? "#886cff" : "#CCC", fontWeight: i === 0 ? 600 : 400 }}>{tab}</span>
              </div>
            ))}
            {/* Home indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2" style={{ width: 100, height: 3, background: "#000", borderRadius: 2, opacity: 0.2 }} />
          </div>
        </div>
      </div>

      {/* Glow */}
      <div className="absolute -inset-8 -z-10 rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(136,108,255,0.12) 0%, transparent 60%)" }} />
    </motion.div>
  );
}
