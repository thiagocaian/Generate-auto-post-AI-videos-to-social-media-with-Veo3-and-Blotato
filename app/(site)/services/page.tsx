import type { Metadata } from "next";
import ServicesPage from "@/components/marketing/services-page";

export const metadata: Metadata = {
  title: "Services — specialists in repetitive office tasks | CYTRON",
  description: "Cytron specialises in automating repetitive office tasks: missed calls, bookings, reminders, invoices and human review for trade, wholesale, e-commerce and warehouse operations.",
  alternates: { canonical: "/services" },
};

export default function Page() {
  return <ServicesPage />;
}
