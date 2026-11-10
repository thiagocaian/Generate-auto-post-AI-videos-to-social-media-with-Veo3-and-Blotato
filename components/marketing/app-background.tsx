"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const BackgroundScene = dynamic(() => import("@/components/BackgroundScene"), { ssr: false });

const MARKETING = new Set([
  "/",
  "/privacy",
  "/terms",
  "/trades",
  "/clinics",
  "/real-estate",
  "/hospitality",
  "/retail",
  "/professional-services",
]);

export default function AppBackground() {
  const pathname = usePathname() || "/";
  if (MARKETING.has(pathname)) return null;
  return <BackgroundScene fixed opacity={0.25} particleCount={60} />;
}
