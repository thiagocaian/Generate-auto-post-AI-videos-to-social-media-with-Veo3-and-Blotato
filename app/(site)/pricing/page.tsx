import type { Metadata } from "next";
import PricingPage from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — CYTRON",
  description: "Monthly plans from $349 AUD for Gold Coast small businesses, plus a free automation audit. Setup fees listed, prices ex GST where applicable.",
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PricingPage />;
}
