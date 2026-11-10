import AnnouncementBar from "@/components/marketing/announcement-bar";
import { SiteNav } from "@/components/site";
import { TransitionProvider } from "@/components/page-transition";

// Shared shell for the public site: header stays put, each page (and the
// footer under it) moves through the 3D transition in template.tsx.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <TransitionProvider>
      <div className="min-h-screen overflow-x-clip bg-white text-slate-900">
        <AnnouncementBar />
        <SiteNav />
        {children}
      </div>
    </TransitionProvider>
  );
}
