import type { Metadata } from "next";
import IndustryPage from "@/components/IndustryPage";
import { getIndustry } from "@/lib/industries";

const industry = getIndustry("retail");

export const metadata: Metadata = {
  title: industry.metaTitle,
  description: industry.metaDescription,
  alternates: { canonical: "/retail" },
  openGraph: { title: industry.metaTitle, description: industry.metaDescription, type: "website", locale: "en_AU" },
};

export default function Page() {
  return <IndustryPage industry={industry} />;
}
