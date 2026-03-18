"use client";

import { useState } from "react";
import Image from "next/image";

// 🖼️ Imagens reais dos produtos goodMix (do site oficial)
const GOODMIX_PRODUCTS = [
  {
    id: "gut-cleanse",
    label: "Gut Cleanse",
    subtitle: "Smoothie bowl · Ritual matinal 🥣",
    imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_cleanse_new.png?v=1767569796&width=1024",
    // Prompt de RECEITA faceless — mãos preparando comida com o produto
    prompt:
      "Starting from a close-up of the goodMix Gut Cleanse package on a white marble kitchen counter, the camera slowly pulls back. A pair of clean female hands (no face shown at any point) enters the frame, opens the container and scoops two heaped tablespoons of the green superfood blend. She pours it into a vibrant frozen mango and banana smoothie bowl. The green powder cascades in satisfying slow motion. Soft warm morning kitchen light streams through a window. Cozy, aesthetic ASMR-style food prep content. 9:16 vertical.",
    caption:
      "🥣 Smoothie bowl upgrade your gut will love 🌿 Two scoops of goodMix Gut Cleanse = prebiotic fuel for your whole day 💚 Drop a 🙋 if you're trying this! #GutHealth #SmoothieBowl #goodMix #HealthyBreakfast #MorningRoutine #GutCleanse #WellnessTips #HealthyRecipes #AustralianSuperfoods",
  },
  {
    id: "gut-reset",
    label: "Gut Reset",
    subtitle: "Overnight oats · Café da manhã 🫙",
    imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_reset_new.png?v=1767569926&width=1024",
    prompt:
      "Starting from a close-up of the goodMix Gut Reset package on a warm wooden kitchen bench, the camera gently zooms out. Female hands (no face shown at any point) pour a generous scoop of the earthy superfood blend into a glass jar of overnight oats with almond milk and chia seeds. She stirs it slowly with a wooden spoon — close-up of the oats swirling with the blend. Camera tilts up to show the beautifully layered jar. Soft cozy morning light. Satisfying, calming food prep aesthetic. 9:16 vertical.",
    caption:
      "🫙 The overnight oats glow-up your gut has been waiting for ✨ Add goodMix Gut Reset for a prebiotic-packed breakfast that works while you sleep 💚 #GutReset #OvernightOats #GutHealth #goodMix #HealthyBreakfast #WellnessRoutine #GutMicrobiome #MealPrep #AustralianHealth",
  },
  {
    id: "gut-repair",
    label: "Gut Repair",
    subtitle: "Acai bowl · Topping poderoso 🫐",
    imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_repair_new.png?v=1767569737&width=1024",
    prompt:
      "Starting from a macro close-up of the goodMix Gut Repair package, the camera slowly pulls back to reveal a purple acai smoothie bowl on a marble surface. Female hands (no face shown at any point) use a wooden spoon to scoop the healing superfood blend and gracefully sprinkle it over the bowl in a satisfying arc. The powder falls in beautiful slow motion over granola, blueberries and sliced banana. Close-up ASMR shot of textures. Warm golden natural light. Premium wellness food aesthetic. 9:16 vertical.",
    caption:
      "🫐 Your gut is literally begging for this acai bowl 🙏 Top it with goodMix Gut Repair — 288 servings of natural healing superfoods 🌿 Save this for your next breakfast! #GutRepair #AcaiBowl #GutHealth #goodMix #NaturalHealth #GutHealing #HealthyRecipes #WellnessFood #Superfoods",
  },
  {
    id: "bundle",
    label: "Bundle — Os 3 Juntos",
    subtitle: "Kit completo · 3 receitas saudáveis 🌿",
    imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_cleanse_new.png?v=1767569796&width=1024",
    prompt:
      "Top-down flat lay shot of three goodMix products — Gut Cleanse, Gut Reset, Gut Repair — arranged neatly on white marble beside matching smoothie jars. The camera slowly tilts and zooms in as female hands (no face shown at any point) open each container in sequence and scoop the blend into each jar. Each powder has a distinct color — green, earthy brown, golden. Morning sunlight. Labels clearly visible. Clean elegant kitchen aesthetic. ASMR food prep vibes. 9:16 vertical.",
    caption:
      "🌿 Your complete gut health morning routine 🌅 Gut Cleanse + Gut Reset + Gut Repair — 3 powerful blends, 1 simple habit 💚 Which recipe are you trying first? Drop it below 👇 #goodMix #GutHealth #MorningRoutine #Superfoods #GutHealing #HealthyLifestyle #WellnessBundle #AustralianSuperfoods",
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

  // Submete o job e faz polling a cada 5s — evita timeout do browser
  async function generateVideoWithPolling(onLog: (msg: string) => void): Promise<string | null> {
    // 1. Submete o job
    const submitRes = await fetch("/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        imageUrl: selectedProduct.id !== "bundle" ? selectedProduct.imageUrl : undefined,
        aspectRatio: "9:16",
        durationSeconds: 10,
      }),
    });

    const submitData = await submitRes.json();
    if (!submitRes.ok) {
      onLog(`❌ Erro ao iniciar: ${submitData.error}`);
      return null;
    }

    const { requestId, model } = submitData;
    onLog(`🔄 Job iniciado (ID: ${requestId.slice(0, 8)}...) — verificando a cada 5s`);

    // 2. Polling a cada 5s até completar
    let attempts = 0;
    const maxAttempts = 144; // máximo 12 minutos

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 5000));
      attempts++;

      const statusRes = await fetch(
        `/api/generate-video?requestId=${requestId}&model=${encodeURIComponent(model)}`
      );
      const statusData = await statusRes.json();

      if (statusData.status === "COMPLETED") {
        return statusData.videoUrl;
      } else if (statusData.status === "FAILED") {
        onLog(`❌ Falha na geração: ${statusData.error ?? "erro desconhecido"}`);
        return null;
      } else {
        const elapsed = (attempts * 5);
        onLog(`⏳ Processando... ${elapsed}s (status: ${statusData.status})`);
      }
    }

    onLog("❌ Timeout: geração demorou mais de 12 minutos.");
    return null;
  }

  async function handleGenerate() {
    setStatus("generating");
    setLog([]);
    addLog(`🖼️ Produto selecionado: ${selectedProduct.label}`);
    addLog("🎬 Enviando para fal.ai (Kling v2 — imagem-para-vídeo)...");

    try {
      const url = await generateVideoWithPolling(addLog);
      if (!url) { setStatus("error"); return; }
      addLog("✅ Vídeo gerado com sucesso!");
      setVideoUrl(url);
      setStatus("idle");
    } catch {
      addLog("❌ Erro inesperado. Tente novamente.");
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
    addLog("🎬 Enviando para fal.ai (Kling v2 — imagem-para-vídeo)...");

    try {
      const generatedUrl = await generateVideoWithPolling(addLog);
      if (!generatedUrl) { setStatus("error"); return; }

      setVideoUrl(generatedUrl);
      addLog("✅ Vídeo gerado! Iniciando publicação...");
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
              A IA cria um vídeo de receita faceless — mãos preparando comida com o produto:
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
            <h2 className="font-semibold text-gray-900 mb-1">🎬 Roteiro do Vídeo</h2>
            <p className="text-xs text-gray-400 mb-3">
              Descreve a cena de receita — mãos, ingredientes, câmera (em inglês para melhor resultado):
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
                  A IA vai criar uma receita com este produto
                </span>
                <span className="text-xs font-medium text-green-600 mt-1">
                  {selectedProduct.label} — {selectedProduct.subtitle}
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
