import type { Metadata } from "next";
import ServicesPage from "@/components/marketing/services-page";

export const metadata: Metadata = {
  title: "Services — CYTRON business automation, Australia",
  description: "Missed calls and messages answered, bookings, reminders, invoices and payments, CRM lead capture and human review, automated for Australian businesses.",
  alternates: { canonical: "/services" },
};

export default function Page() {
  return <ServicesPage />;
}
