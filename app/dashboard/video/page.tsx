"use client";

import { useState } from "react";

// ✅ Prompts dos vídeos ficam em inglês (necessário para a IA gerar corretamente)
const GOODMIX_PROMPTS = [
  {
    label: "Gut Cleanse — Ritual matinal",
    prompt:
      "Cinematic close-up of hands mixing a spoonful of natural green superfood powder into a glass of clear water at golden hour. Bubbles dissolve slowly. Text overlay: 'Start your gut reset today.' Clean white kitchen background. Warm, vibrant colors. 9:16 vertical format. Aspirational wellness aesthetic.",
  },
  {
    label: "Gut Reset — Antes & Depois",
    prompt:
      "Split-screen vertical ad: left side shows a tired person slumped at a desk in dim light, right side shows the same person energized and smiling after taking goodMix Gut Reset superfood blend. Australian summer light, natural tones. Bold text: 'Reset your gut. Reset your life.' 9:16 format.",
  },
  {
    label: "Gut Repair — Ingredientes naturais",
    prompt:
      "Macro slow-motion video of natural superfoods — chia seeds, flaxseed, dried fruits — falling into a wooden bowl. Rich earthy colors. Voiceover text overlay: '288 servings of gut-healing power.' Australian health food brand aesthetic. Deep green and cream palette. 9:16 vertical.",
  },
  {
    label: "Bundle — Os 3 produtos juntos",
    prompt:
      "Elegant product reveal: three goodMix superfood jars — Gut Cleanse, Gut Reset, Gut Repair — arranged on a marble surface with fresh herbs and morning sunlight streaming in. Camera slowly pushes in. Text: 'The complete gut health system.' Forest green branding. 9:16 vertical format.",
  },
];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok — @Cytron", icon: "🎵" },
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "youtube", label: "YouTube Shorts", icon: "▶️" },
  { id: "twitter", label: "Twitter/X", icon: "🐦" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
];

type Status = "idle" | "generating" | "posting" | "done" | "error";

export default function VideoPage() {
  const [prompt, setPrompt] = useState(GOODMIX_PROMPTS[0].prompt);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["tiktok"]);
  const [caption, setCaption] = useState(
    "🌿 Reset your gut, reset your life. goodMix Superfoods — Australia's #1 gut health blend. Link in bio to try free. #GutHealth #Superfoods #Wellness #goodMix #TikTokMadeMeBuyIt #HealthyLiving"
  );
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);

  const togglePlatform = (id: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  async function handleGenerate() {
    setStatus("generating");
    setLog([]);
    addLog("🎬 Enviando prompt para geração de vídeo com IA...");

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "9:16", durationSeconds: 5 }),
      });

      const data = await res.json();

      if (!res.ok) {
        addLog(`❌ Erro na geração: ${data.error}`);
        setStatus("error");
        return;
      }

      addLog(`✅ Vídeo gerado com sucesso!`);
      addLog(`🔗 URL: ${data.videoUrl}`);
      setVideoUrl(data.videoUrl);
      setStatus("idle");
    } catch {
      addLog("❌ Erro de rede ao gerar vídeo. Verifique sua conexão.");
      setStatus("error");
    }
  }

  async function handlePost() {
    if (!videoUrl) return;
    setStatus("posting");
    addLog(`📤 Publicando nas plataformas: ${selectedPlatforms.join(", ")}...`);

    try {
      const res = await fetch("/api/post-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          caption,
          platforms: selectedPlatforms,
          useNextFreeSlot: true,
        }),
      });

      const data = await res.json();

      data.successes?.forEach((s: { platform: string }) =>
        addLog(`✅ Publicado com sucesso no ${s.platform}!`)
      );
      data.failures?.forEach((f: string) => addLog(`❌ Falha: ${f}`));

      setStatus("done");
    } catch {
      addLog("❌ Erro de rede ao publicar o vídeo. Tente novamente.");
      setStatus("error");
    }
  }

  async function handleGenerateAndPost() {
    setStatus("generating");
    setLog([]);
    addLog("🎬 Iniciando geração de vídeo com IA (Kling v2)...");
    addLog("⏳ Isso pode levar entre 1 e 3 minutos, aguarde...");

    try {
      const genRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "9:16", durationSeconds: 5 }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) {
        addLog(`❌ Falha na geração: ${genData.error}`);
        setStatus("error");
        return;
      }

      const generatedUrl = genData.videoUrl;
      setVideoUrl(generatedUrl);
      addLog(`✅ Vídeo gerado! Iniciando publicação...`);
      setStatus("posting");

      addLog(`📤 Enviando para as plataformas selecionadas...`);

      const postRes = await fetch("/api/post-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: generatedUrl,
          caption,
          platforms: selectedPlatforms,
          useNextFreeSlot: true,
        }),
      });

      const postData = await postRes.json();
      postData.successes?.forEach((s: { platform: string }) =>
        addLog(`✅ Publicado com sucesso no ${s.platform}!`)
      );
      postData.failures?.forEach((f: string) => addLog(`❌ Falha: ${f}`));
      setStatus("done");
    } catch {
      addLog("❌ Erro inesperado. Verifique os logs do servidor.");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Painel</a>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium">Campanha de Vídeo com IA</span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
          goodMix Superfoods
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 grid md:grid-cols-2 gap-8">
        {/* Esquerda — Configuração */}
        <div className="flex flex-col gap-6">

          {/* Seletor de prompt */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">🎬 Prompt do Vídeo</h2>
            <p className="text-xs text-gray-400 mb-4">O prompt fica em inglês para a IA gerar melhor. Escolha um ou escreva o seu:</p>
            <div className="flex flex-col gap-2 mb-4">
              {GOODMIX_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPrompt(p.prompt)}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                    prompt === p.prompt
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-indigo-400"
              placeholder="Ou escreva seu próprio prompt em inglês..."
            />
          </div>

          {/* Legenda */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">📝 Legenda para as Redes</h2>
            <p className="text-xs text-gray-400 mb-3">Texto que será publicado junto com o vídeo:</p>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Plataformas */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">📲 Plataformas</h2>
            <p className="text-xs text-gray-400 mb-3">Selecione onde deseja publicar:</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                    selectedPlatforms.includes(p.id)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGenerateAndPost}
              disabled={status === "generating" || status === "posting"}
              className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {status === "generating"
                ? "⏳ Gerando vídeo com IA..."
                : status === "posting"
                ? "📤 Publicando nas redes..."
                : "🚀 Gerar e Publicar"}
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={status !== "idle" && status !== "done" && status !== "error"}
                className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                🎬 Só gerar vídeo
              </button>
              <button
                onClick={handlePost}
                disabled={!videoUrl || (status !== "idle" && status !== "done" && status !== "error")}
                className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                📤 Só publicar
              </button>
            </div>
          </div>
        </div>

        {/* Direita — Preview e Logs */}
        <div className="flex flex-col gap-6">

          {/* Preview do vídeo */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">📺 Pré-visualização</h2>
            {videoUrl ? (
              <video src={videoUrl} controls className="w-full rounded-xl" />
            ) : (
              <div className="h-64 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200">
                <span className="text-4xl mb-2">🎬</span>
                <span className="text-sm">O vídeo aparecerá aqui após a geração</span>
              </div>
            )}
            {videoUrl && (
              <input
                type="text"
                value={videoUrl}
                readOnly
                className="mt-3 w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-500 bg-gray-50"
              />
            )}
          </div>

          {/* Log de atividade */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex-1">
            <h2 className="font-semibold text-gray-900 mb-3">📋 Log de Atividade</h2>
            <div className="bg-gray-900 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs text-green-400 flex flex-col gap-1">
              {log.length === 0 ? (
                <span className="text-gray-600">Aguardando ação...</span>
              ) : (
                log.map((line, i) => <div key={i}>{line}</div>)
              )}
            </div>
          </div>

          {/* Badge de sucesso */}
          {status === "done" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🎉</div>
              <p className="text-green-700 font-semibold text-sm">Campanha publicada com sucesso!</p>
              <p className="text-green-600 text-xs mt-1">Seu vídeo goodMix está no ar no @Cytron TikTok 🎵</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
