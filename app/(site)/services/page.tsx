import type { Metadata } from "next";
import ServicesPage from "@/components/marketing/services-page";

export const metadata: Metadata = {
  title: "Services — CYTRON business automation, Gold Coast",
  description: "Missed calls and messages answered, bookings, reminders, invoices and payments, CRM lead capture and human review, automated for Gold Coast small businesses.",
  alternates: { canonical: "/services" },
};

export default function Page() {
  return <ServicesPage />;
}
