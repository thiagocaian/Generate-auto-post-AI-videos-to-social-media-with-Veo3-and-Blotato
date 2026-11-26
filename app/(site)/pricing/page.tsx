import type { Metadata } from "next";
import PricingPage from "@/components/marketing/pricing-page";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/pricing",
  title: "Pricing — CYTRON",
  description: "Cytron specialises in automating repetitive office tasks. Monthly plans from $349 AUD for trade, e-commerce and fulfilment operations, plus a Free Automation Assessment. Prices ex GST where applicable.",
});

export default function Page() {
  return <PricingPage />;
}
