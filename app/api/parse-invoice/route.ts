import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT_IN = `Ets un assistent que extreu dades de factures de compra en format JSON.
Analitza el PDF i retorna NOMÉS un JSON vàlid (sense markdown) amb exactament aquests camps:
{
  "invoice_number": "string — número de factura",
  "invoice_date": "YYYY-MM-DD",
  "supplier": "string — nom del proveïdor",
  "category": "fundes|rellens|textils|caixes|potes|etiquetes|assessorament|transport|altres",
  "base_amount": número (base imposable sense IVA),
  "vat_pct": número (% IVA, normalment 21),
  "vat_amount": número (import IVA),
  "total_amount": número (total amb IVA),
  "due_date": "YYYY-MM-DD o null",
  "notes": "string breu amb resum del contingut (màx 120 car.)"
}
Si un camp no s'troba, usa null. No afegeixis res fora del JSON.`;

const PROMPT_OUT = `Ets un assistent que extreu dades de factures de venda en format JSON.
Analitza el PDF i retorna NOMÉS un JSON vàlid (sense markdown) amb exactament aquests camps:
{
  "invoice_number": "string — número de factura",
  "invoice_date": "YYYY-MM-DD",
  "client": "string — nom del client",
  "base_amount": número (base imposable sense IVA),
  "vat_pct": número (% IVA, normalment 21),
  "vat_amount": número (import IVA),
  "total_amount": número (total amb IVA),
  "due_date": "YYYY-MM-DD o null",
  "notes": "string breu amb resum (productes, unitats, etc.) (màx 200 car.)"
}
Si un camp no s'troba, usa null. No afegeixis res fora del JSON.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string; // "in" | "out"

    if (!file || !type) {
      return NextResponse.json({ error: "Falta fitxer o tipus" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 },
            },
            { type: "text", text: type === "in" ? PROMPT_IN : PROMPT_OUT },
          ],
        },
      ],
    });

    const text = (response.content[0] as any).text as string;
    // Neteja possible markdown
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ data: parsed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Error desconegut" }, { status: 500 });
  }
}
