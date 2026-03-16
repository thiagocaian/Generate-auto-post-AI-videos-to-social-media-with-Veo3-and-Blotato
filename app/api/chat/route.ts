import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Você é um assistente inteligente de uma plataforma SaaS de análise de dados.
Seu papel é ajudar os usuários a entenderem o produto, tirar dúvidas sobre funcionalidades,
e guiá-los em como extrair o máximo valor dos dados que analisam.

Seja sempre amigável, objetivo e útil. Se não souber algo específico sobre os dados do usuário,
oriente sobre as possibilidades gerais da plataforma. Responda sempre em português.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Mensagens inválidas" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content ?? "Desculpe, não consegui processar sua mensagem.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
