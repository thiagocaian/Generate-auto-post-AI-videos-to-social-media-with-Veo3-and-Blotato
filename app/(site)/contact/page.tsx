import type { Metadata } from "next";
import ContactPage from "@/components/marketing/contact-page";

export const metadata: Metadata = {
  title: "Contact — Free Automation Assessment | CYTRON",
  description: "Request a Free Automation Assessment with Cytron, in person on the Gold Coast or online. Tell us which task eats your team's day.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactPage />;
}
