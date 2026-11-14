import type { Metadata } from "next";
import UseCasesPage from "@/components/marketing/use-cases-page";

export const metadata: Metadata = {
  title: "Use cases — CYTRON automation for salons, clinics, trades and service providers",
  description: "What automation looks like for Gold Coast salons, clinics, trades and mechanics, and service providers: bookings, reminders, quotes, invoices and follow-up.",
  alternates: { canonical: "/use-cases" },
};

export default function Page() {
  return <UseCasesPage />;
}
