"use client";

import { useEffect, useId, useState } from "react";
import {
  applyStoredGoogleConsent,
  captureGoogleClickIds,
  isGoogleTagConfigured,
  writeGoogleConsent,
  type GoogleConsentChoice,
} from "@/lib/analytics/google";

const secondaryButton =
  "inline-flex items-center justify-center rounded-lg border border-transparent bg-[#eeedf7] px-4 py-2.5 text-sm font-semibold text-[#0f1222] transition-colors hover:bg-[#e3e1f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f37a2]";
const primaryButton =
  "inline-flex items-center justify-center rounded-lg bg-[#3f37a2] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#352e8c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f37a2]";

export default function GoogleConsentBanner() {
  const titleId = useId();
  const bodyId = useId();
  const [visible, setVisible] = useState(false);
  const configured = isGoogleTagConfigured();

  useEffect(() => {
    if (!configured) return;
    captureGoogleClickIds(window.location.search);
    if (!applyStoredGoogleConsent()) setVisible(true);
  }, [configured]);

  if (!configured || !visible) return null;

  const choose = (choice: GoogleConsentChoice) => {
    writeGoogleConsent(choice);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="mx-auto flex max-w-3xl flex-col gap-4 rounded-xl border border-[#e7e6f0] bg-white p-4 shadow-[0_1px_2px_rgba(15,18,34,0.04),0_10px_28px_-14px_rgba(63,55,162,0.14)] sm:flex-row sm:items-center sm:p-5"
      >
        <div className="min-w-0 flex-1">
          <p id={titleId} className="text-sm font-semibold text-[#0f1222]">Cookies for measurement</p>
          <p id={bodyId} className="mt-1 text-sm leading-relaxed text-[#2e3248]">
            We use Google Analytics and Google Ads only after you allow them. Until then, advertising and analytics cookies stay off.{" "}
            <a href="/privacy" className="font-semibold text-[#3f37a2] underline">Privacy policy</a>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" className={secondaryButton} onClick={() => choose("denied")}>Decline</button>
          <button type="button" className={primaryButton} onClick={() => choose("granted")}>Accept</button>
        </div>
      </div>
    </div>
  );
}
