import type { Metadata } from "next";
import ContactPage from "@/components/marketing/contact-page";

export const metadata: Metadata = {
  title: "Contact — Book a free automation audit | CYTRON",
  description: "Book a free automation audit with Cytron, in person on the Gold Coast or online. Pick a time and tell us which task eats your team's day.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactPage />;
}
