"use client";

import React from "react";

export default function AnnouncementBar() {
  return (
    <a
      href="/contact"
      className="block bg-slate-900 px-4 py-2 text-center text-[13px] font-medium text-slate-200 transition-colors hover:text-white"
    >
      New: free automation audits for Gold Coast businesses{" "}
      <span aria-hidden="true">→</span>
    </a>
  );
}
