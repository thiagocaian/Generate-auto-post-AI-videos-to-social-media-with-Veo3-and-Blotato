import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an intelligent assistant for a SaaS data analysis platform called DataAI.
Your role is to help users understand the product, answer questions about features,
and guide them on how to get the most value from the data they analyze.

Always be friendly, concise, and helpful. If you don't know something specific about the user's data,
guide them on the general capabilities of the platform. Always respond in English.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I could not process your message.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
