import { NextRequest, NextResponse } from "next/server";

// Endpoint para disparar o workflow N8n de geração automática de vídeo goodMix
// O N8n roda em nuvem e cuida de: Veo3 → poll → Blotato → notificação

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, scheduledTime } = body;

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_WEBHOOK_URL não configurada no .env.local" },
        { status: 500 }
      );
    }

    // Produtos goodMix disponíveis
    const PRODUCTS: Record<string, { label: string; recipe: string; imageUrl: string }> = {
      "gut-cleanse": {
        label: "goodMix Gut Cleanse",
        recipe: "tropical smoothie bowl",
        imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_cleanse_new.png?v=1767569796&width=1024",
      },
      "gut-reset": {
        label: "goodMix Gut Reset",
        recipe: "overnight oats with almond milk",
        imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_reset_new.png?v=1767569926&width=1024",
      },
      "gut-repair": {
        label: "goodMix Gut Repair",
        recipe: "acai bowl with granola and berries",
        imageUrl: "https://www.goodmix.com.au/cdn/shop/files/gut_repair_new.png?v=1767569737&width=1024",
      },
    };

    // Se nenhum produto passado, escolhe baseado no dia da semana
    const product = productId
      ? PRODUCTS[productId]
      : Object.values(PRODUCTS)[new Date().getDay() % Object.values(PRODUCTS).length];

    if (!product) {
      return NextResponse.json({ error: `Produto inválido: ${productId}` }, { status: 400 });
    }

    // Dispara o webhook do N8n
    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product: {
          ...product,
          id: productId ?? "auto",
        },
        scheduledTime: scheduledTime ?? null,
        triggeredAt: new Date().toISOString(),
        source: "goodmix-app",
      }),
    });

    if (!n8nRes.ok) {
      const errText = await n8nRes.text();
      console.error("N8n webhook error:", n8nRes.status, errText);
      return NextResponse.json(
        { error: `Erro ao chamar N8n: ${n8nRes.status}` },
        { status: 502 }
      );
    }

    const n8nData = await n8nRes.json().catch(() => ({ ok: true }));

    console.log(`✅ Workflow N8n disparado para: ${product.label}`);

    return NextResponse.json({
      success: true,
      message: `Workflow N8n iniciado para ${product.label}`,
      product,
      n8nResponse: n8nData,
    });
  } catch (err) {
    console.error("Erro ao disparar N8n:", err);
    return NextResponse.json({ error: "Erro interno ao disparar workflow" }, { status: 500 });
  }
}
