import type { Metadata } from "next";
import HomePage from "@/components/marketing/home-page";

export const metadata: Metadata = {
  title: "Cytron — Process automation for Gold Coast small businesses",
  description:
    "Process automation for Gold Coast small businesses, so enquiries, bookings and invoices run without chasing. Free automation audit. Read-only pilot first.",
};

export default function Page() {
  return <HomePage />;
}
