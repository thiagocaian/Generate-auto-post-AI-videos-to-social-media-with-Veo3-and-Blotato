import AnnouncementBar from "@/components/marketing/announcement-bar";
import { SiteNav } from "@/components/site";
import { TransitionProvider } from "@/components/page-transition";
import UtmCapture from "@/components/marketing/utm-capture";

// Shared shell for the public site: header stays put, each page (and the
// footer under it) moves through the 3D transition in template.tsx.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <TransitionProvider>
      <div className="flex min-h-screen flex-col overflow-x-clip bg-[#e9ecf1] text-slate-900">
        <UtmCapture />
        <AnnouncementBar />
        <SiteNav />
        {children}
      </div>
    </TransitionProvider>
  );
}
