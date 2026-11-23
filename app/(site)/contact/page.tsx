import type { Metadata } from "next";
import ContactPage from "@/components/marketing/contact-page";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact — Free Automation Assessment | CYTRON",
  description: "Cytron specialises in automating repetitive office tasks. Request a Free Automation Assessment, in person on the Gold Coast or online.",
});

export default function Page() {
  return <ContactPage />;
}
