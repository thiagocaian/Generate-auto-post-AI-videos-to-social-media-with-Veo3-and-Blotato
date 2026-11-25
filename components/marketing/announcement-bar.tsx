"use client";

import React from "react";

export default function AnnouncementBar() {
  return (
    <a
      href="/contact"
      className="block bg-[#0A0038] px-4 py-2 text-center text-[13px] font-medium text-white transition-colors hover:text-white/90"
    >
      Specialists in repetitive office tasks — free assessment for trade and fulfilment{" "}
      <span aria-hidden="true">→</span>
    </a>
  );
}
