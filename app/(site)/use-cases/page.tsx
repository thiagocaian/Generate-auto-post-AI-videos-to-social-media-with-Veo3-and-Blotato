import type { Metadata } from "next";
import UseCasesPage from "@/components/marketing/use-cases-page";

export const metadata: Metadata = {
  title: "Use cases — specialists in repetitive office tasks | CYTRON",
  description: "Cytron specialises in automating repetitive office tasks: stock, orders, dispatch and B2B sales for Australian trade, wholesale, e-commerce and warehouse operations.",
  alternates: { canonical: "/use-cases" },
};

export default function Page() {
  return <UseCasesPage />;
}
