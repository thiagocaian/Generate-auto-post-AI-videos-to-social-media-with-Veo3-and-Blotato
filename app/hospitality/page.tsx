import type { Metadata } from "next";
import IndustryPage from "@/components/IndustryPage";
import { getIndustry } from "@/lib/industries";

const industry = getIndustry("hospitality");

export const metadata: Metadata = {
  title: industry.metaTitle,
  description: industry.metaDescription,
  alternates: { canonical: "/hospitality" },
  openGraph: { title: industry.metaTitle, description: industry.metaDescription, type: "website", locale: "en_AU" },
};

export default function Page() {
  return <IndustryPage industry={industry} />;
}
