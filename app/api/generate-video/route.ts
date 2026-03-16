import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// fal.ai — Kling v2 video generation
// image-to-video: https://fal.ai/models/fal-ai/kling-video/v2/master/image-to-video
// text-to-video:  https://fal.ai/models/fal-ai/kling-video/v2/master/text-to-video

// Permite até 5 min para geração do vídeo
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { prompt, imageUrl, aspectRatio = "9:16", durationSeconds = 5 } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return NextResponse.json({ error: "Missing FAL_KEY" }, { status: 500 });
    }

    fal.config({ credentials: falKey });

    // Kling v2 — duração deve ser "5" ou "10"
    const duration = durationSeconds >= 10 ? "10" : "5";

    let result;

    if (imageUrl) {
      // 🖼️ Imagem-para-vídeo: anima a foto real do produto goodMix
      console.log("Usando image-to-video com imagem:", imageUrl);
      result = await fal.subscribe("fal-ai/kling-video/v2/master/image-to-video", {
        input: {
          prompt,
          image_url: imageUrl,
          duration,
        },
        logs: false,
      });
    } else {
      // 📝 Texto-para-vídeo: geração a partir de descrição
      console.log("Usando text-to-video");
      result = await fal.subscribe("fal-ai/kling-video/v2/master/text-to-video", {
        input: {
          prompt,
          aspect_ratio: aspectRatio as "9:16" | "16:9" | "1:1",
          duration,
        },
        logs: false,
      });
    }

    const videoUrl = (result.data as { video?: { url: string } })?.video?.url;

    if (!videoUrl) {
      return NextResponse.json({ error: "Nenhuma URL de vídeo retornada pelo fal.ai" }, { status: 502 });
    }

    return NextResponse.json({ videoUrl, requestId: result.requestId });
  } catch (err) {
    console.error("Erro na geração de vídeo:", err);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
