"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/dashboard/campaigns", label: "Campanhas", icon: "🎬" },
  { href: "/dashboard/new-campaign", label: "Nova Campanha", icon: "＋", highlight: true },
  { href: "/dashboard/automations", label: "Automações", icon: "⚡" },
  { href: "/dashboard/leads", label: "Leads", icon: "👤" },
  { href: "/dashboard/billing", label: "Plano", icon: "💳" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f8f8f8]">
      {/* SIDEBAR — desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0a0a0a] fixed h-full">
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-lg font-extrabold text-white tracking-tight">
            CYTR<span className="text-[#00c853]">ON</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${item.highlight
                    ? "bg-[#00c853] text-white hover:opacity-90"
                    : active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-[#00c853] flex items-center justify-center text-xs font-bold text-white">C</div>
            <div>
              <p className="text-xs font-semibold text-white">Cliente</p>
              <p className="text-[10px] text-white/40">Solo plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 md:ml-60 flex flex-col">
        {/* MOBILE TOP BAR */}
        <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 sticky top-0 z-40">
          <span className="text-base font-extrabold">
            CYTR<span className="text-[#00c853]">ON</span>
          </span>
          <Link href="/dashboard/new-campaign" className="bg-[#00c853] text-white text-xs font-semibold px-3 py-2 rounded-[8px]">
            + Nova
          </Link>
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 p-5 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </div>

        {/* MOBILE BOTTOM NAV */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-40">
          {nav.filter(n => !n.highlight).slice(0, 4).map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${active ? "text-[#00c853]" : "text-gray-400"}`}>
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link href="/dashboard/new-campaign" className="flex flex-col items-center gap-1 px-3 py-1.5">
            <span className="w-8 h-8 rounded-full bg-[#00c853] flex items-center justify-center text-white text-lg font-bold">+</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
