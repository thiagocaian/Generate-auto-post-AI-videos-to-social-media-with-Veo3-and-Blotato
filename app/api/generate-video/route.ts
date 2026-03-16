import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// fal.ai — Kling v2 text-to-video generation
// Docs: https://fal.ai/models/fal-ai/kling-video/v2/master/text-to-video
// Model supports 9:16 vertical format, up to 10s — perfect for TikTok

// Allow up to 5 min for video generation
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio = "9:16", durationSeconds = 5 } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return NextResponse.json({ error: "Missing FAL_KEY" }, { status: 500 });
    }

    fal.config({ credentials: falKey });

    // fal.ai Kling v2 — duration must be "5" or "10"
    const duration = durationSeconds >= 10 ? "10" : "5";

    const result = await fal.subscribe("fal-ai/kling-video/v2/master/text-to-video", {
      input: {
        prompt,
        aspect_ratio: aspectRatio as "9:16" | "16:9" | "1:1",
        duration,
      },
      logs: false,
    });

    const videoUrl = (result.data as { video?: { url: string } })?.video?.url;

    if (!videoUrl) {
      return NextResponse.json({ error: "No video URL returned by fal.ai" }, { status: 502 });
    }

    return NextResponse.json({ videoUrl, requestId: result.requestId });
  } catch (err) {
    console.error("Generate video error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
