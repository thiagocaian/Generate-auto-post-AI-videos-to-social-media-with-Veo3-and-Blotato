import type { Metadata } from "next";
import HowPage from "@/components/marketing/how-page";

export const metadata: Metadata = {
  title: "How it works — CYTRON",
  description: "Assess, design, build, run: how Cytron takes an Australian business from a free assessment to automations that run safely, read-only first.",
  alternates: { canonical: "/how-it-works" },
};

export default function Page() {
  return <HowPage />;
}
