import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const COMPONENT_LIST = `
BUMBBA: FUN_CR=Funda Coixí Gran, FUN_MC=Funda Coixí Petit, FUN_CRM=Funda Coixí Mitjà, FUN_RAC=Funda Coixí Rinconera, FUN_M190=Funda Matalàs 190, FUN_M160=Funda Matalàs 160, FUN_BRZ=Funda Braç, FUN_PUF=Funda Pouf, FARCIT_GR=Farcit Gran, FARCIT_PT=Farcit Petit, FARCIT_CR_M=Farcit Medi, FARCIT_RAC=Farcit Rinconera, L_GR=L Gran, L_PT=L Petita, BRAC=Braç, MAT_190=Matalàs 190, MAT_160=Matalàs 160, POT_BL=Potes Blanques, POT_NG=Potes Negres, CAJA_B=Caixa Bumbba, CAJA_PUF=Caixa Pouf, CAJA_PLAIN=Caixa Plain, BOSSA=Bossa Buit, MAN_ES=Manual ES, MAN_EN=Manual EN, ETIQ=Etiqueta, HOTGLUE=Cola Calenta, NUCLI_PUF=Nucli Pouf
SUNBBA: FUN_CR=Funda Coixí Gran, FUN_MC=Funda Coixí Petit, FUN_CRM=Funda Coixí Mitjà, FUN_M190=Funda Matalàs 190, FUN_M160=Funda Matalàs 160, FARCIT_GR=Farcit Gran, FARCIT_PT=Farcit Petit, FARCIT_CR_M=Farcit Medi, L_GR=L Gran, L_PT=L Petita, MAT_190=Matalàs 190, MAT_160=Matalàs 160, POT_BL=Potes Blanques, POT_NG=Potes Negres, CAJA_S=Caixa Sunbba, BOSSA=Bossa Buit, ETIQ=Etiqueta, HOTGLUE=Cola Calenta
`;

const PROMPT_IN = `Ets un assistent que extreu dades de factures de compra en format JSON per a una fàbrica de sofàs.
Analitza el PDF i retorna NOMÉS un JSON vàlid (sense markdown) amb exactament aquests camps:
{
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "supplier": "string",
  "category": "fundes|rellens|textils|caixes|potes|etiquetes|assessorament|transport|altres",
  "base_amount": número,
  "vat_pct": número,
  "vat_amount": número,
  "total_amount": número,
  "due_date": "YYYY-MM-DD o null",
  "notes": "string breu (màx 100 car.)",
  "line_items": [
    {
      "supplier_code": "codi producte del proveïdor",
      "description": "descripció de la línia",
      "quantity": número,
      "unit": "u" si unitats senceres, "m" si metres, "kg" si quilos, "altres" si no és clar,
      "unit_price": número,
      "amount": número,
      "to_inventory": true si és un component físic en unitats senceres que entra a magatzem (false per metres, transport, serveis, embalatge genèric),
      "suggested_sku": "SKU del component més probable de la llista següent, o null si no coincideix"
    }
  ]
}

Llista de components disponibles per fer el suggested_sku:
${COMPONENT_LIST}

Regles per suggested_sku:
- BIG PILLOW COVER / TEXTILE COVER BIG → FUN_CR
- MEDIUM PILLOW COVER / TEXTILE COVER MEDIUM → FUN_CRM
- MINI PILLOW COVER / TEXTILE COVER MINI → FUN_MC
- CORNER PILLOW SET / COVER CORNER → FUN_RAC
- BACKREST PILLOW (farcit gran) → FARCIT_GR
- SMALL PILLOW AUX (farcit petit) → FARCIT_PT
- CORNER PILLOW (farcit, codi PUM) → FARCIT_RAC
- FABRIC (metres de tela) → null, to_inventory: false
- TRANSPORT / CARGO → null, to_inventory: false
- EMBALAJE (caixes) → CAJA_B si és per sofà gran, CAJA_PUF si és pouf
- Si no pots determinar, usa null

No afegeixis res fora del JSON.`;

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
      max_tokens: 4096,
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
