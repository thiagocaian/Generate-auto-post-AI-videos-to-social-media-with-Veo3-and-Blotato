import type { Metadata } from "next";
import PricingPage from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — CYTRON",
  description: "Free automation audit, a fixed-quote pilot and monthly run & improve for Gold Coast small businesses. No surprise invoices.",
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PricingPage />;
}
