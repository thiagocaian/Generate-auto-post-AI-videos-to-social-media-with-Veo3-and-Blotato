import type { Metadata } from "next";
import ContactPage from "@/components/marketing/contact-page";

export const metadata: Metadata = {
  title: "Contact — Free Automation Assessment | CYTRON",
  description: "Cytron specialises in automating repetitive office tasks. Request a Free Automation Assessment, in person on the Gold Coast or online.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactPage />;
}
