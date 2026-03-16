"use client";

import { useState } from "react";
import Image from "next/image";

// 🖼️ Imagens reais dos produtos goodMix (do site oficial)
const GOODMIX_PRODUCTS = [
  {
    id: "gut-cleanse",
    label: "Gut Cleanse",
    subtitle: "211 servings · Ritual matinal",
    imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_cleanse_new.png?v=1767569796&width=1024",
    // Prompt de MOVIMENTO — a IA anima a foto real do produto
    prompt:
      "The goodMix Gut Cleanse product slowly rotates on a clean marble surface. Warm golden morning light streams in from the left. Camera gently pushes in. Ingredients — green powder, chia seeds — float gracefully around the product. Text fades in: 'Start your gut reset today.' Calm, premium wellness aesthetic. 9:16 vertical.",
    caption:
      "🌿 Start your morning right with goodMix Gut Cleanse. 211 servings of gut-healing superfoods. 💚 Link in bio! #GutHealth #GutCleanse #goodMix #WellnessRoutine #Superfoods #HealthyLiving #TikTokMadeMeBuyIt",
  },
  {
    id: "gut-reset",
    label: "Gut Reset",
    subtitle: "199 servings · Transformação",
    imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_reset_new.png?v=1767569926&width=1024",
    prompt:
      "The goodMix Gut Reset product sits on a natural wooden table. Camera orbits slowly around it, revealing all sides. Soft Australian daylight. A spoonful of natural powder pours into water in the foreground. Text appears: 'Reset your gut. Reset your life.' Forest green tones. 9:16 vertical. Premium health brand aesthetic.",
    caption:
      "✨ Reset your gut, reset your life. goodMix Gut Reset — Australia's #1 gut health blend. 💚 Link in bio to try risk-free! #GutReset #GutHealth #goodMix #AustralianSuperfoods #WellnessJourney #HealthyGut",
  },
  {
    id: "gut-repair",
    label: "Gut Repair",
    subtitle: "288 servings · Regeneração",
    imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_repair_new.png?v=1767569737&width=1024",
    prompt:
      "The goodMix Gut Repair product stands tall on a dark green velvet surface. Macro shots of natural superfoods — aloe vera, dried fruits, flaxseed — drift past the camera in slow motion. Warm earthy light. Camera slowly zooms in. Text overlay: '288 servings of gut-healing power.' 9:16 vertical. Luxury Australian wellness brand.",
    caption:
      "🔬 288 servings of natural gut-healing power. goodMix Gut Repair — naturopathically designed for real results. 🌿 Link in bio! #GutRepair #GutHealing #goodMix #NaturalHealth #Superfoods #GutMicrobiome #WellnessTikTok",
  },
  {
    id: "bundle",
    label: "Bundle — Os 3 Juntos",
    subtitle: "Gut Cleanse + Reset + Repair",
    imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_cleanse_new.png?v=1767569796&width=1024",
    prompt:
      "Three goodMix superfood products — Gut Cleanse, Gut Reset, Gut Repair — revealed one by one on a white marble surface with fresh herbs. Camera starts close and slowly pulls back to reveal all three. Morning sunlight. Text: 'The complete gut health system.' Forest green branding. 9:16 vertical. Elegant product hero shot.",
    caption:
      "🌿 The complete goodMix gut health system. 3 powerful blends. 1 simple routine. 💚 Bundle available — link in bio! #goodMix #GutHealth #GutCleanse #GutReset #GutRepair #Superfoods #AustralianHealth #WellnessBundle",
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
  const [selectedProduct, setSelectedProduct] = useState(GOODMIX_PRODUCTS[0]);
  const [prompt, setPrompt] = useState(GOODMIX_PRODUCTS[0].prompt);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["tiktok"]);
  const [caption, setCaption] = useState(GOODMIX_PRODUCTS[0].caption);
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);

  const selectProduct = (product: typeof GOODMIX_PRODUCTS[0]) => {
    setSelectedProduct(product);
    setPrompt(product.prompt);
    setCaption(product.caption);
  };

  const togglePlatform = (id: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  async function handleGenerate() {
    setStatus("generating");
    setLog([]);
    addLog(`🖼️ Usando imagem real do produto: ${selectedProduct.label}`);
    addLog("🎬 Iniciando geração de vídeo com IA (Kling v2 — imagem-para-vídeo)...");
    addLog("⏳ Isso pode levar entre 1 e 3 minutos, aguarde...");

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageUrl: selectedProduct.id !== "bundle" ? selectedProduct.imageUrl : undefined,
          aspectRatio: "9:16",
          durationSeconds: 5,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        addLog(`❌ Erro na geração: ${data.error}`);
        setStatus("error");
        return;
      }

      addLog(`✅ Vídeo gerado com sucesso!`);
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
    addLog(`🖼️ Produto selecionado: ${selectedProduct.label}`);
    addLog("🎬 Iniciando geração de vídeo com IA (Kling v2 — imagem-para-vídeo)...");
    addLog("⏳ Isso pode levar entre 1 e 3 minutos, aguarde...");

    try {
      const genRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageUrl: selectedProduct.id !== "bundle" ? selectedProduct.imageUrl : undefined,
          aspectRatio: "9:16",
          durationSeconds: 5,
        }),
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

      addLog(`📤 Enviando para: ${selectedPlatforms.join(", ")}...`);

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
          <span className="text-sm font-medium">Campanha de Vídeo goodMix</span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
          🌿 goodMix Superfoods
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 grid md:grid-cols-2 gap-8">
        {/* Esquerda — Configuração */}
        <div className="flex flex-col gap-6">

          {/* Seletor de produto com imagem real */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">🛍️ Produto goodMix</h2>
            <p className="text-xs text-gray-400 mb-4">
              A IA vai animar a foto real do produto para criar o vídeo:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {GOODMIX_PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProduct(p)}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all text-left ${
                    selectedProduct.id === p.id
                      ? "border-green-500 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="bg-gray-50 flex items-center justify-center h-28">
                    <Image
                      src={p.imageUrl}
                      alt={p.label}
                      width={90}
                      height={90}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="p-2">
                    <p className={`text-xs font-semibold ${selectedProduct.id === p.id ? "text-green-700" : "text-gray-800"}`}>
                      {p.label}
                    </p>
                    <p className="text-[10px] text-gray-400">{p.subtitle}</p>
                  </div>
                  {selectedProduct.id === p.id && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt de movimento */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">🎬 Direção do Vídeo</h2>
            <p className="text-xs text-gray-400 mb-3">
              Descreve como a câmera se move e o que acontece no vídeo (em inglês para melhor resultado):
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-green-400"
            />
          </div>

          {/* Legenda */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">📝 Legenda para as Redes</h2>
            <p className="text-xs text-gray-400 mb-3">Texto publicado junto com o vídeo:</p>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-green-400"
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
                      ? "bg-green-600 text-white border-green-600"
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
              className="w-full bg-green-600 text-white rounded-xl py-3.5 font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
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

          {/* Preview do produto selecionado */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">📺 Pré-visualização</h2>
            {videoUrl ? (
              <>
                <video src={videoUrl} controls className="w-full rounded-xl" />
                <input
                  type="text"
                  value={videoUrl}
                  readOnly
                  className="mt-3 w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-500 bg-gray-50"
                />
              </>
            ) : (
              <div className="h-64 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-dashed border-gray-200">
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.label}
                  width={120}
                  height={120}
                  className="object-contain mb-3 opacity-60"
                  unoptimized
                />
                <span className="text-xs text-gray-400">
                  A IA vai animar este produto
                </span>
                <span className="text-xs font-medium text-green-600 mt-1">
                  {selectedProduct.label}
                </span>
              </div>
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
              <p className="text-green-600 text-xs mt-1">
                Seu vídeo goodMix {selectedProduct.label} está no ar! 🎵
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
