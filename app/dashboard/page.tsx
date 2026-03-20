import Link from "next/link";

const stats = [
  { label: "Campanhas Ativas", value: "3", sub: "este mês", color: "text-[#00c853]" },
  { label: "Vídeos Gerados", value: "12", sub: "+4 esta semana", color: "text-blue-500" },
  { label: "Leads Captados", value: "91", sub: "↑ 12% vs último", color: "text-purple-500" },
  { label: "Posts Publicados", value: "248", sub: "↑ 34% vs último", color: "text-orange-500" },
];

const campaigns = [
  { name: "Instalação Elétrica — Rua das Flores", status: "live", date: "Hoje", content: "3 vídeos" },
  { name: "Pintura Residencial — Centro", status: "processing", date: "Ontem", content: "Em processamento..." },
  { name: "Jardinagem — Condomínio Verde", status: "ready", date: "18 Mar", content: "2 vídeos prontos" },
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

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0a0a0a]">Bom dia 👋</h1>
          <p className="text-sm text-gray-500">Aqui está o resumo das suas campanhas</p>
        </div>
        <Link href="/dashboard/new-campaign" className="hidden md:flex bg-[#00c853] text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:opacity-90 transition-opacity items-center gap-2">
          + Nova campanha
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Automações ativas */}
      <div className="bg-[#0a0a0a] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">Automações ativas</p>
          <p className="text-white/40 text-xs mt-0.5">n8n processando em segundo plano</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse" />
          <span className="text-[#00c853] text-sm font-bold">Online</span>
        </div>
      </div>

      {/* Campanhas recentes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#0a0a0a] text-sm">Campanhas recentes</h2>
          <Link href="/dashboard/campaigns" className="text-xs text-[#00c853] font-semibold">Ver todas</Link>
        </div>
        <div className="space-y-2">
          {campaigns.map((c) => (
            <div key={c.name} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-semibold text-[#0a0a0a] truncate">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.date} · {c.content}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusStyle[c.status]}`}>
                {statusLabel[c.status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick action */}
      <Link href="/dashboard/new-campaign" className="flex md:hidden items-center justify-center gap-2 w-full bg-[#00c853] text-white font-semibold py-4 rounded-[10px] text-base hover:opacity-90 transition-opacity">
        📷 Criar nova campanha
      </Link>
    </div>
  );
}
