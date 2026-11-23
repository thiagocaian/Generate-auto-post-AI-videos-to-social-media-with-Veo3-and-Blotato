"use client";

import React from "react";

export default function AnnouncementBar() {
  return (
    <a
      href="/contact"
      className="block border-b border-white/[0.06] bg-[#0e0f11] px-4 py-2 text-center text-[13px] font-medium text-slate-200 transition-colors hover:text-white"
    >
      Specialists in repetitive office tasks — free assessment for trade and fulfilment{" "}
      <span aria-hidden="true">→</span>
    </a>
  );
}
