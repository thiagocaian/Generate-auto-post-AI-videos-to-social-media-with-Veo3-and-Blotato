import type { Metadata } from "next";
import HowPage from "@/components/marketing/how-page";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/how-it-works",
  title: "How it works — CYTRON",
  description: "Cytron specialises in automating repetitive office tasks. Assess, design, build, run: from a free assessment to automations that run safely, read-only first.",
});

export default function Page() {
  return <HowPage />;
}
