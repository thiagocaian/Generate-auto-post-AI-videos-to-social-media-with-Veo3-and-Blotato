"use client";

import React from "react";

export default function AnnouncementBar() {
  return (
    <a
      href="/contact"
      className="block bg-[#3f37a2] px-4 py-2 text-center text-[13px] font-medium text-[#e9e7fb] transition-colors hover:text-white"
    >
      Specialists in repetitive office tasks — free assessment for trade and fulfilment{" "}
      <span aria-hidden="true">→</span>
    </a>
  );
}
