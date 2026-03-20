import { NextRequest, NextResponse } from "next/server";

const N8N_FORM_URL = "https://labofantasma.app.n8n.cloud/form/goodmix-photo-form";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();

    const form = new FormData();
    const job = body.get("job") as string;
    const antes = body.get("antes") as File;
    const depois = body.get("depois") as File;

    if (!antes || !depois) {
      return NextResponse.json({ error: "Fotos obrigatórias" }, { status: 400 });
    }

    // n8n form trigger field name: "Foto do Produto"
    form.append("Foto do Produto", antes, `antes_${antes.name}`);
    form.append("Foto do Produto", depois, `depois_${depois.name}`);
    if (job) form.append("job", job);

    const res = await fetch(N8N_FORM_URL, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("n8n error:", res.status, text);
      return NextResponse.json({ error: "Falha no n8n" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
