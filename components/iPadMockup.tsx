"use client";

import { motion } from "framer-motion";

const kpis = [
  { label: "Active Jobs", value: "12", color: "#000" },
  { label: "Pipeline", value: "$47K", color: "#000" },
  { label: "Completed", value: "89%", color: "#059669" },
  { label: "This Month", value: "23", color: "#000" },
  { label: "AI Videos", value: "8", color: "#886cff" },
  { label: "Posts", value: "29", color: "#D97706" },
];

const jobs = [
  { id: "JOB-0001", title: "Switchboard upgrade", status: "completed", color: "#059669", bg: "#ECFDF5", value: "$2,450" },
  { id: "JOB-0002", title: "LED downlight install", status: "in progress", color: "#000", bg: "#F0F0F0", value: "$1,200" },
  { id: "JOB-0003", title: "Floor vinyl install", status: "scheduled", color: "#1D4ED8", bg: "#EFF6FF", value: "$3,800" },
  { id: "JOB-0004", title: "Safety inspection", status: "enquiry", color: "#D97706", bg: "#FFFBEB", value: "$380" },
];

const schedule = [
  { time: "8:00", job: "Switchboard upgrade", active: false, done: true },
  { time: "9:30", job: "", active: false, done: false },
  { time: "10:00", job: "LED downlight install", active: true, done: false },
  { time: "11:30", job: "", active: false, done: false },
  { time: "1:00", job: "Floor vinyl install", active: false, done: false },
  { time: "2:30", job: "Safety inspection", active: false, done: false },
  { time: "4:00", job: "", active: false, done: false },
];

export default function IPadMockup() {
  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: "100%", maxWidth: 620, aspectRatio: "4/3" }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* iPad Frame */}
      <div
        className="absolute inset-0 rounded-[24px]"
        style={{
          background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          padding: 10,
        }}
      >
        {/* Screen */}
        <div className="w-full h-full rounded-[16px] overflow-hidden flex" style={{ background: "#FFF" }}>
          {/* Sidebar */}
          <div className="flex-shrink-0 flex flex-col py-3" style={{ width: 48, background: "#1A1A1A" }}>
            <div className="w-7 h-7 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ background: "#886cff" }}>
              <span style={{ color: "#FFF", fontSize: 9, fontWeight: 800 }}>C</span>
            </div>
            <div style={{ width: 16, height: 1, background: "rgba(255,255,255,0.1)", margin: "0 auto 8px" }} />
            {["📊", "📋", "💰", "🧾", "📅", "👷", "📸", "🔗"].map((icon, i) => (
              <div key={i} className="w-7 h-7 mx-auto mb-1 rounded-lg flex items-center justify-center" style={{ background: i === 0 ? "rgba(255,255,255,0.12)" : "transparent" }}>
                <span style={{ fontSize: 11, opacity: i === 0 ? 1 : 0.4 }}>{icon}</span>
              </div>
            ))}
          </div>

          {/* Secondary Nav */}
          <div className="flex-shrink-0 py-3 px-2" style={{ width: 120, background: "#FFF", borderRight: "1px solid #F0F0F0" }}>
            <div className="flex items-center gap-1.5 mb-1 px-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#1A1A1A" }}>
                <span style={{ color: "#FFF", fontSize: 7, fontWeight: 700 }}>I</span>
              </div>
              <div>
                <p style={{ fontSize: 8, fontWeight: 700, color: "#000" }}>Inkwell Printing</p>
                <p style={{ fontSize: 6, color: "#999" }}>info@inkwell...</p>
              </div>
            </div>
            <p style={{ fontSize: 6, color: "#BBB", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 8, marginBottom: 4, paddingLeft: 8 }}>Modules</p>
            {["Dashboard", "Jobs", "Quotes", "Invoices", "Calendar", "Marketing AI", "Materials"].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md mb-0.5" style={{ background: i === 0 ? "#F5F5F5" : "transparent" }}>
                <span style={{ fontSize: 7, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "#000" : "#888" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p style={{ fontSize: 6, color: "#999", letterSpacing: 1, textTransform: "uppercase" }}>CYTRON / DASHBOARD</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>Dashboard</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />
                <span style={{ fontSize: 7, color: "#22C55E", fontWeight: 600 }}>All Systems Online</span>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-6 gap-1.5 mb-3">
              {kpis.map((kpi, i) => (
                <motion.div
                  key={i}
                  className="px-2 py-1.5 rounded-lg"
                  style={{ border: "1px solid #E5E5E5" }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <p style={{ fontSize: 5, color: "#999" }}>{kpi.label}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: kpi.color }}>{kpi.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2">
              {/* Jobs List */}
              <div className="flex-1">
                <p style={{ fontSize: 7, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Recent Jobs</p>
                <div className="space-y-1">
                  {jobs.map((job, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                      style={{ border: "1px solid #F0F0F0" }}
                      initial={{ opacity: 0, x: -5 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 6, fontFamily: "monospace", color: "#999", background: "#F5F5F5", padding: "1px 3px", borderRadius: 3 }}>{job.id}</span>
                        <span style={{ fontSize: 7, fontWeight: 500, color: "#000" }}>{job.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 6, fontWeight: 500, padding: "1px 4px", borderRadius: 4, background: job.bg, color: job.color }}>{job.status}</span>
                        <span style={{ fontSize: 7, fontWeight: 600, color: "#000" }}>{job.value}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Schedule Timeline */}
              <div style={{ width: 100 }}>
                <p style={{ fontSize: 7, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Today</p>
                <div className="space-y-0">
                  {schedule.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5" style={{ minHeight: 22 }}>
                      <span style={{ fontSize: 6, color: "#BBB", fontWeight: 500, width: 22, flexShrink: 0, paddingTop: 1 }}>{s.time}</span>
                      <div className="flex flex-col items-center" style={{ width: 8 }}>
                        <motion.div
                          className="rounded-full"
                          style={{
                            width: 6, height: 6, flexShrink: 0,
                            background: s.done ? "#059669" : s.active ? "#886cff" : s.job ? "#1D4ED8" : "#E5E5E5",
                          }}
                          animate={s.active ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        {i < schedule.length - 1 && (
                          <div style={{ width: 1, height: 16, background: s.done ? "#059669" : "#E5E5E5" }} />
                        )}
                      </div>
                      <span style={{ fontSize: 6, color: s.job ? "#333" : "#DDD", fontWeight: s.active ? 600 : 400, paddingTop: 0 }}>
                        {s.job || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glow */}
      <div className="absolute -inset-8 -z-10 rounded-3xl" style={{ background: "radial-gradient(ellipse at center, rgba(136,108,255,0.1) 0%, transparent 60%)" }} />
    </motion.div>
  );
}
