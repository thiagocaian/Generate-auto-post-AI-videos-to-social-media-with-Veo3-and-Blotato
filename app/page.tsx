import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm z-50">
        <span className="text-xl font-extrabold tracking-tight">
          CYTR<span className="text-[#00c853]">ON</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">
            Login
          </Link>
          <Link href="/login" className="bg-[#00c853] text-white text-sm font-semibold px-4 py-2 rounded-[8px] hover:opacity-90 transition-opacity">
            Start now
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-20">
        <div className="inline-flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] text-[#007a33] text-[11px] font-semibold tracking-wider px-3 py-1.5 rounded-full mb-6 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00c853] inline-block" />
          AI Marketing Automation — Now Available
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-[#0a0a0a] max-w-sm sm:max-w-xl mb-5">
          Marketing automático para{" "}
          <span className="text-[#00c853]">negócios modernos</span>
        </h1>

        <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-sm mb-10">
          Seus clientes enviam fotos do serviço. A Cytron transforma em vídeos e posts para Instagram e TikTok — automaticamente.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm sm:max-w-none sm:justify-center">
          <Link href="/login" className="w-full sm:w-auto bg-[#00c853] text-white font-semibold px-8 py-4 rounded-[10px] text-base hover:opacity-90 transition-opacity text-center">
            Começar grátis →
          </Link>
          <Link href="/login" className="w-full sm:w-auto border border-gray-200 text-[#0a0a0a] font-semibold px-8 py-4 rounded-[10px] text-base hover:border-gray-400 transition-colors text-center">
            Ver demo
          </Link>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="px-6 pb-16 flex justify-center">
        <div className="w-full max-w-2xl bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-[#00c853]" />
            <span className="text-xs text-gray-400 ml-2 font-medium">Cytron Dashboard</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Posts Published", value: "248", up: "+34%" },
              { label: "Leads Captured", value: "91", up: "+12%" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                <p className="text-2xl font-extrabold">{s.value}<span className="text-[#00c853] text-xs font-semibold ml-1">↑ {s.up}</span></p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              { icon: "🎬", label: "TikTok Video — AI Generated", tag: "Live", color: "bg-[#00c853]/10 text-[#007a33]" },
              { icon: "📹", label: "YouTube Short — AI Written", tag: "Scheduled", color: "bg-blue-50 text-blue-600" },
              { icon: "📸", label: "Instagram Reel — AI Draft", tag: "Ready", color: "bg-orange-50 text-orange-600" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium text-[#0a0a0a]">{item.label}</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.color}`}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 pb-20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-extrabold text-center mb-2">Como funciona</h2>
        <p className="text-gray-500 text-center text-sm mb-10">Três passos. Zero esforço.</p>
        <div className="space-y-4">
          {[
            { n: "01", title: "Cliente envia as fotos", desc: "Antes e depois do serviço, direto pelo celular. Sem complicação." },
            { n: "02", title: "IA cria o conteúdo", desc: "Vídeos, legendas e posts prontos para Instagram, TikTok e YouTube." },
            { n: "03", title: "Marketing no piloto automático", desc: "Você recebe, aprova e publica. Ou deixa publicar sozinho." },
          ].map((f) => (
            <div key={f.n} className="flex gap-5 items-start bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <span className="text-[#00c853] font-extrabold text-lg leading-none mt-0.5">{f.n}</span>
              <div>
                <h3 className="font-bold text-[#0a0a0a] mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 mb-16 bg-[#0a0a0a] rounded-3xl px-8 py-12 flex flex-col items-center text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-extrabold text-white mb-3">Pronto para automatizar?</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-xs">Comece hoje. Sem cartão de crédito. Resultados em minutos.</p>
        <Link href="/login" className="bg-[#00c853] text-white font-semibold px-8 py-4 rounded-[10px] text-base hover:opacity-90 transition-opacity">
          Criar minha conta →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 px-6 py-8 flex items-center justify-between text-xs text-gray-400">
        <span className="font-extrabold text-[#0a0a0a]">CYTR<span className="text-[#00c853]">ON</span></span>
        <span>© 2025 Cytron. Todos os direitos reservados.</span>
      </footer>
    </div>
  );
}
