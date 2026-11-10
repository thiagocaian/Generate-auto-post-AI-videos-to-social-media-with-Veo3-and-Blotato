"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { PUBLIC_MARKETING_ROUTES } from "@/lib/site-routes";

const BackgroundScene = dynamic(() => import("@/components/BackgroundScene"), { ssr: false });

const MARKETING = new Set(PUBLIC_MARKETING_ROUTES);

export default function AppBackground() {
  const pathname = usePathname() || "/";
  if (MARKETING.has(pathname)) return null;
  return <BackgroundScene fixed opacity={0.25} particleCount={60} />;
}
