import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
    </PageTransition>
  );
}
