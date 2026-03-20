"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Photo = { file: File; preview: string };

export default function NewCampaignPage() {
  const router = useRouter();
  const [antes, setAntes] = useState<Photo | null>(null);
  const [depois, setDepois] = useState<Photo | null>(null);
  const [jobName, setJobName] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const antesRef = useRef<HTMLInputElement>(null);
  const depoisRef = useRef<HTMLInputElement>(null);

  function handlePhoto(type: "antes" | "depois", file: File) {
    const preview = URL.createObjectURL(file);
    if (type === "antes") setAntes({ file, preview });
    else setDepois({ file, preview });
  }

  async function handleSubmit() {
    if (!antes || !depois) { setError("Adicione as duas fotos."); return; }
    setError("");
    setSending(true);
    try {
      const form = new FormData();
      form.append("job", jobName || "Sem título");
      form.append("Foto do Produto", antes.file, `antes_${antes.file.name}`);
      form.append("Foto do Produto", depois.file, `depois_${depois.file.name}`);
      await fetch("/api/upload", { method: "POST", body: form });
      setDone(true);
    } catch {
      setError("Erro ao enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center pb-24 md:pb-0">
        <div className="text-6xl mb-5">✅</div>
        <h2 className="text-xl font-extrabold text-[#0a0a0a] mb-2">Campanha criada!</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">Suas fotos foram enviadas. A IA está criando o conteúdo de marketing agora.</p>
        <button onClick={() => router.push("/dashboard")} className="bg-[#00c853] text-white font-semibold px-6 py-3 rounded-[10px] text-sm hover:opacity-90">
          Ver dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg pb-24 md:pb-0 space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-[#0a0a0a]">Nova Campanha</h1>
        <p className="text-sm text-gray-500 mt-0.5">Envie as fotos antes e depois do serviço</p>
      </div>

      {/* Nome */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Nome do job</label>
        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          placeholder="Ex: Instalação elétrica — Rua das Flores"
          className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 text-sm text-[#0a0a0a] placeholder-gray-300 outline-none focus:border-[#00c853] transition-colors"
        />
      </div>

      {/* Fotos */}
      {(["antes", "depois"] as const).map((type) => {
        const photo = type === "antes" ? antes : depois;
        const ref = type === "antes" ? antesRef : depoisRef;
        return (
          <div key={type} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              {type === "antes" ? "🔴 Foto ANTES" : "🟢 Foto DEPOIS"}
            </label>
            <input ref={ref} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhoto(type, e.target.files[0])} />
            {photo ? (
              <div className="relative rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt={type} className="w-full h-48 object-cover" />
                <button onClick={() => type === "antes" ? setAntes(null) : setDepois(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-base">×</button>
              </div>
            ) : (
              <button onClick={() => ref.current?.click()}
                className="w-full h-36 border-2 border-dashed border-gray-200 hover:border-[#00c853] rounded-xl flex flex-col items-center justify-center gap-2 transition-colors bg-gray-50 active:bg-[#f0fdf4]">
                <span className="text-3xl">📷</span>
                <span className="text-xs text-gray-400 font-medium">Toque para fotografar ou escolher</span>
              </button>
            )}
          </div>
        );
      })}

      {error && (
        <p className="text-red-500 text-sm text-center bg-red-50 border border-red-100 py-3 px-4 rounded-[10px]">{error}</p>
      )}

      <button onClick={handleSubmit} disabled={sending || !antes || !depois}
        className="w-full bg-[#00c853] disabled:bg-gray-100 disabled:text-gray-300 text-white font-semibold py-4 rounded-[10px] text-base hover:opacity-90 transition-all">
        {sending ? "Enviando..." : "Criar Campanha"}
      </button>
    </div>
  );
}
