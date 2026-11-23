import type { Metadata } from "next";
import PricingPage from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — monthly plans from $349 AUD/month | CYTRON",
  description: "Cytron specialises in automating repetitive office tasks. Monthly plans from $349 AUD for trade, e-commerce and fulfilment operations, plus a Free Automation Assessment. Prices ex GST where applicable.",
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PricingPage />;
}
