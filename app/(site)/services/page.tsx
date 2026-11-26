import type { Metadata } from "next";
import ServicesPage from "@/components/marketing/services-page";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/services",
  title: "Services — specialists in repetitive office tasks | CYTRON",
  description: "Cytron specialises in automating repetitive office tasks: missed calls, bookings, reminders, invoices and human review for trade, wholesale, e-commerce and warehouse operations.",
});

export default function Page() {
  return <ServicesPage />;
}
