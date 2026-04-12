"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const jobs = [
  { id: "JOB-0001", title: "Switchboard upgrade", client: "David Wilson", status: "completed", color: "#059669", bg: "#ECFDF5", value: "$2,450" },
  { id: "JOB-0002", title: "LED downlight install", client: "Sarah Chen", status: "in progress", color: "#000", bg: "#F0F0F0", value: "$1,200" },
  { id: "JOB-0003", title: "Safety inspection", client: "James Murphy", status: "scheduled", color: "#1D4ED8", bg: "#EFF6FF", value: "$380" },
  { id: "JOB-0004", title: "Powerpoint installation", client: "Lisa Brown", status: "enquiry", color: "#D97706", bg: "#FFFBEB", value: "$650" },
];

const kpis = [
  { label: "Active Jobs", value: 12, suffix: "" },
  { label: "Revenue", value: 47, suffix: "K" },
  { label: "Completed", value: 89, suffix: "%" },
  { label: "This Month", value: 23, suffix: "" },
];

const activity = [
  { icon: "✅", text: "JOB-0001 completed", time: "2m ago" },
  { icon: "💰", text: "INV-1001 paid — $2,450", time: "5m ago" },
  { icon: "📸", text: "Photos uploaded — JOB-0002", time: "12m ago" },
  { icon: "📋", text: "New job created — JOB-0004", time: "18m ago" },
  { icon: "✍️", text: "Signature captured — JOB-0001", time: "25m ago" },
];

export default function HeroDashboardMockup() {
  const [activeKpi, setActiveKpi] = useState(0);
  const [visibleActivity, setVisibleActivity] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setActiveKpi(p => (p + 1) % kpis.length), 2000);
    const t2 = setInterval(() => setVisibleActivity(p => (p + 1) % activity.length), 3000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <div className="relative w-full max-w-[580px] mx-auto">
      {/* Browser chrome */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-0.5 rounded-md text-[9px] text-white/30 font-mono" style={{ background: "rgba(255,255,255,0.05)" }}>
              cytronai.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex" style={{ background: "#FFFFFF", minHeight: 340 }}>
          {/* Mini sidebar */}
          <div className="w-10 flex-shrink-0 flex flex-col items-center gap-2 py-3" style={{ background: "#FAFAFA", borderRight: "1px solid #E5E5E5" }}>
            <div className="w-5 h-5 rounded bg-[#886cff] flex items-center justify-center">
              <span className="text-white text-[7px] font-bold">C</span>
            </div>
            {["📊", "📋", "💰", "📅", "📸"].map((icon, i) => (
              <div key={i} className="w-5 h-5 rounded flex items-center justify-center text-[8px] cursor-default" style={{ background: i === 1 ? "#F0F0F0" : "transparent" }}>
                {icon}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[7px] tracking-widest text-gray-400">CYTRON / JOBS</p>
                <p className="text-[11px] font-bold text-black">Job Management</p>
              </div>
              <div className="px-2 py-1 rounded-md text-[7px] font-medium text-white" style={{ background: "#000" }}>
                + New Job
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {kpis.map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  className="px-2 py-1.5 rounded-lg"
                  style={{ border: "1px solid #E5E5E5" }}
                  animate={{
                    borderColor: activeKpi === i ? "#886cff" : "#E5E5E5",
                    boxShadow: activeKpi === i ? "0 0 8px rgba(136,108,255,0.15)" : "none",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-[6px] text-gray-400">{kpi.label}</p>
                  <p className="text-[12px] font-bold text-black">
                    {kpi.label === "Revenue" && "$"}{kpi.value}{kpi.suffix}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Jobs list */}
            <div className="space-y-1.5">
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                  style={{ border: "1px solid #F0F0F0" }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] font-mono px-1 py-0.5 rounded" style={{ background: "#F0F0F0", color: "#666" }}>
                      {job.id}
                    </span>
                    <div>
                      <p className="text-[8px] font-medium text-black">{job.title}</p>
                      <p className="text-[6px] text-gray-400">{job.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] font-medium px-1.5 py-0.5 rounded" style={{ background: job.bg, color: job.color }}>
                      {job.status}
                    </span>
                    <span className="text-[8px] font-semibold text-black">{job.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right sidebar — activity feed */}
          <div className="w-[130px] flex-shrink-0 p-2" style={{ background: "#FAFAFA", borderLeft: "1px solid #E5E5E5" }}>
            <p className="text-[7px] font-medium text-gray-400 uppercase tracking-wider mb-2">Activity</p>
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {activity.slice(visibleActivity, visibleActivity + 4).map((item, i) => (
                  <motion.div
                    key={`${item.text}-${visibleActivity}`}
                    className="flex gap-1.5 p-1.5 rounded-md"
                    style={{ background: i === 0 ? "#FFF" : "transparent", border: i === 0 ? "1px solid #E5E5E5" : "none" }}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: i === 0 ? 1 : 0.5, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-[8px]">{item.icon}</span>
                    <div>
                      <p className="text-[6px] text-black leading-tight">{item.text}</p>
                      <p className="text-[5px] text-gray-400">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect behind */}
      <div className="absolute -inset-4 -z-10 rounded-2xl" style={{ background: "radial-gradient(ellipse at center, rgba(136,108,255,0.08) 0%, transparent 70%)" }} />
    </div>
  );
}
