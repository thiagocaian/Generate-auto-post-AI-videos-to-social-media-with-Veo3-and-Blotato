import Link from "next/link";

const campaigns = [
  { name: "Instalação Elétrica — Rua das Flores", status: "live", date: "20 Mar 2025", videos: 3, leads: 12 },
  { name: "Pintura Residencial — Centro", status: "processing", date: "19 Mar 2025", videos: 0, leads: 0 },
  { name: "Jardinagem — Condomínio Verde", status: "ready", date: "18 Mar 2025", videos: 2, leads: 7 },
  { name: "Reforma Banheiro — Vila Nova", status: "live", date: "15 Mar 2025", videos: 4, leads: 18 },
  { name: "Impermeabilização — Edifício Sol", status: "live", date: "12 Mar 2025", videos: 2, leads: 9 },
];

const statusStyle: Record<string, string> = {
  live: "bg-[#00c853]/10 text-[#007a33]",
  processing: "bg-blue-50 text-blue-600",
  ready: "bg-orange-50 text-orange-600",
};

const statusLabel: Record<string, string> = {
  live: "Publicado",
  processing: "Processando",
  ready: "Pronto",
};

export default function CampaignsPage() {
  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0a0a0a]">Campanhas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{campaigns.length} campanhas no total</p>
        </div>
        <Link href="/dashboard/new-campaign" className="bg-[#00c853] text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:opacity-90 transition-opacity">
          + Nova
        </Link>
      </div>

      <div className="space-y-2">
        {campaigns.map((c) => (
          <div key={c.name} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0a0a0a] truncate">{c.name}</p>
                <p className="text-xs text-gray-400 mt-1">{c.date}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusStyle[c.status]}`}>
                {statusLabel[c.status]}
              </span>
            </div>
            {c.status !== "processing" && (
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">🎬 {c.videos} vídeos</span>
                <span className="text-xs text-gray-500">👤 {c.leads} leads</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
