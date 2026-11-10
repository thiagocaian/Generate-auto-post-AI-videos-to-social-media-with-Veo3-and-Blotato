import type { Metadata } from "next";
import HowPage from "@/components/marketing/how-page";

export const metadata: Metadata = {
  title: "How it works — CYTRON",
  description: "Audit, design, build, run: how Cytron takes a Gold Coast business from a free audit to automations that run safely, read-only first.",
  alternates: { canonical: "/how-it-works" },
};

export default function Page() {
  return <HowPage />;
}
