import type { Metadata } from "next";
import IndustryPage from "@/components/IndustryPage";
import { getIndustry } from "@/lib/industries";

const industry = getIndustry("clinics");

export const metadata: Metadata = {
  title: industry.metaTitle,
  description: industry.metaDescription,
  alternates: { canonical: "/clinics" },
  openGraph: { title: industry.metaTitle, description: industry.metaDescription, type: "website", locale: "en_AU" },
};

export default function Page() {
  return <IndustryPage industry={industry} />;
}
