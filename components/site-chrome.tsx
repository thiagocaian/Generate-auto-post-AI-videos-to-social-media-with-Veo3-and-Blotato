"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const BackgroundScene = dynamic(() => import("@/components/BackgroundScene"), { ssr: false });

/**
 * Keeps the existing particle background on app pages.
 * The marketing homepage stays flat white — no lights, glows, or particles.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const home = pathname === "/";

  useEffect(() => {
    if (!home) return;
    const previousBg = document.body.style.backgroundColor;
    const previousColor = document.body.style.color;
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#1e1b4b";
    return () => {
      document.body.style.backgroundColor = previousBg;
      document.body.style.color = previousColor;
    };
  }, [home]);

  return (
    <>
      {!home && <BackgroundScene fixed opacity={0.25} particleCount={60} />}
      <div style={{ position: "relative", zIndex: 1, background: home ? "#ffffff" : undefined }}>
        {children}
      </div>
    </>
  );
}
