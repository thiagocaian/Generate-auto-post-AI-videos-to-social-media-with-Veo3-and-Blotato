import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// fal.ai — Suporta Veo3 (Google, rápido + áudio) e Kling v2 (image-to-video)
// Arquitetura: submit → poll. Evita timeout do browser.

function configureFal() {
  fal.config({ credentials: process.env.FAL_KEY });
}

// POST — Submete o job e retorna requestId imediatamente
export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      imageUrl,
      aspectRatio = "9:16",
      durationSeconds = 10,
      engine = "veo3", // "veo3" (padrão, rápido + áudio) | "kling" (image-to-video)
    } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 });
    }
    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY não configurada" }, { status: 500 });
    }

    configureFal();

    let model: string;
    let input: Record<string, unknown>;

    if (engine === "veo3" && !imageUrl) {
      // ✅ Veo3 — text-to-video, gera áudio automaticamente, muito mais rápido
      model = "fal-ai/veo3";
      input = {
        prompt,
        aspect_ratio: aspectRatio as "9:16" | "16:9" | "1:1",
        duration: "8s",
        resolution: "720p",
        generate_audio: true,
        safety_tolerance: "4",
        auto_fix: true,
      };
    } else if (engine === "veo3" && imageUrl) {
      // Veo3 image-to-video
      model = "fal-ai/veo3/image-to-video";
      input = {
        prompt,
        image_url: imageUrl,
        duration: "8s",
        generate_audio: true,
      };
    } else {
      // Kling v2 — fallback, bom para image-to-video de longa duração
      const duration = (durationSeconds >= 10 ? "10" : "5") as "10" | "5";
      model = imageUrl
        ? "fal-ai/kling-video/v2/master/image-to-video"
        : "fal-ai/kling-video/v2/master/text-to-video";
      input = imageUrl
        ? { prompt, image_url: imageUrl, duration }
        : { prompt, aspect_ratio: aspectRatio as "9:16" | "16:9" | "1:1", duration };
    }

    // Submete o job de forma assíncrona — retorna requestId imediatamente
    const { request_id } = await fal.queue.submit(model, { input });

    console.log(`✅ Job submetido: ${request_id} | modelo: ${model} | engine: ${engine}`);

    return NextResponse.json({ requestId: request_id, model, engine });
  } catch (err) {
    console.error("Erro ao submeter job:", err);
    return NextResponse.json({ error: "Erro ao iniciar geração" }, { status: 500 });
  }
}

// GET — Verifica o status do job (client faz polling a cada 5s)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get("requestId");
  const model = searchParams.get("model") ?? "fal-ai/veo3";

  if (!requestId) {
    return NextResponse.json({ error: "requestId é obrigatório" }, { status: 400 });
  }
  if (!process.env.FAL_KEY) {
    return NextResponse.json({ error: "FAL_KEY não configurada" }, { status: 500 });
  }

  configureFal();

  try {
    const status = await fal.queue.status(model, { requestId, logs: false });

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result(model, { requestId });
      const data = result.data as {
        video?: { url: string };
        url?: string;
      };
      const videoUrl = data?.video?.url ?? data?.url;
      if (!videoUrl) {
        return NextResponse.json({ status: "FAILED", error: "Sem URL de vídeo na resposta" });
      }
      return NextResponse.json({ status: "COMPLETED", videoUrl });
    }

    // IN_QUEUE | IN_PROGRESS
    return NextResponse.json({ status: status.status });
  } catch (err) {
    console.error("Erro ao verificar status:", err);
    return NextResponse.json({ status: "FAILED", error: "Erro ao verificar status" });
  }
}
