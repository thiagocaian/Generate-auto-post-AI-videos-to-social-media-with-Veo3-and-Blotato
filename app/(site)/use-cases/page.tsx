import type { Metadata } from "next";
import UseCasesPage from "@/components/marketing/use-cases-page";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/use-cases",
  title: "Use cases — specialists in repetitive office tasks | CYTRON",
  description: "Cytron specialises in automating repetitive office tasks: stock, orders, dispatch and B2B sales for Australian trade, wholesale, e-commerce and warehouse operations.",
});

export default function Page() {
  return <UseCasesPage />;
}
