import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const COMPONENT_LIST = `
BUMBBA: FUN_CR=Funda Coixí Gran, FUN_MC=Funda Coixí Petit, FUN_CRM=Funda Coixí Mitjà, FUN_RAC=Funda Coixí Rinconera, FUN_M190=Funda Matalàs 190, FUN_M160=Funda Matalàs 160, FUN_BRZ=Funda Braç, FUN_PUF=Funda Pouf, FARCIT_GR=Farcit Gran, FARCIT_PT=Farcit Petit, FARCIT_CR_M=Farcit Mitjà, FARCIT_RAC=Farcit Rinconera, L_GR=L Gran, L_PT=L Petita, BRAC=Braç, MAT_190=Matalàs 190, MAT_160=Matalàs 160, POT_BL=Potes Blanques, POT_NG=Potes Negres, CAJA_B=Caixa Bumbba, CAJA_PUF=Caixa Pouf, CAJA_PLAIN=Caixa Plain, BOSSA=Bossa Buit, MAN_ES=Manual ES, MAN_EN=Manual EN, ETIQ=Etiqueta, HOTGLUE=Cola Calenta, NUCLI_PUF=Nucli Pouf
SUNBBA: FUN_CR=Funda Coixí Gran, FUN_MC=Funda Coixí Petit, FUN_CRM=Funda Coixí Mitjà, FUN_M190=Funda Matalàs 190, FUN_M160=Funda Matalàs 160, FARCIT_GR=Farcit Gran, FARCIT_PT=Farcit Petit, FARCIT_CR_M=Farcit Mitjà, L_GR=L Gran, L_PT=L Petita, MAT_190=Matalàs 190, MAT_160=Matalàs 160, POT_BL=Potes Blanques, POT_NG=Potes Negres, CAJA_S=Caixa Sunbba, BOSSA=Bossa Buit, ETIQ=Etiqueta, HOTGLUE=Cola Calenta
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
- CURVAS GRANDES / CURVA GRANDE (proveïdor Lacats, qualsevol RAL) → L_GR, to_inventory: true
- CURVAS PEQUEÑAS / CURVA PEQUEÑA (proveïdor Lacats, qualsevol RAL) → L_PT, to_inventory: true
- BRAZO / BRAÇ (escuma de braç, proveïdor Interplasp) → BRAC, to_inventory: true
- COLCHON / COLCHÓ 190 (proveïdor Interplasp) → MAT_190, to_inventory: true
- COLCHON / COLCHÓ 160 (proveïdor Interplasp) → MAT_160, to_inventory: true
- PUFF / POUF / NUCLI (proveïdor Interplasp) → NUCLI_PUF, to_inventory: true
- FABRIC (metres de tela) → null, to_inventory: false
- TRANSPORT / CARGO → null, to_inventory: false
- EMBALAJE (caixes) → CAJA_B si és per sofà gran, CAJA_PUF si és pouf
- Si no pots determinar, usa null

No afegeixis res fora del JSON.`;

const PRODUCT_LIST = `
BUMBBA: BUM_3S=3 Seater 190x80, BUM_CHL=Chaiselong 190x80, BUM_CRN=Corner 190x80, BUM_PLAIN=Plain 190x80, BUM_SBYME=Stand By Me 190x80, BUM_FG=Feeling Good 80, BUM_WW=Wonderwall 190x80, BUM_PUF=Pouf 80x80
SUNBBA: SUN_3S=3 Seater 190x80, SUN_CHL=Chaiselong 190x80, SUN_CRN=Corner 190x80, SUN_PLAIN=Plain 190x80, SUN_PUF=Pouf 80x80
`;

const PROMPT_OUT = `Ets un assistent que extreu dades de factures de venda en format JSON.
La factura pot tenir moltes comandes individuals — has d'agregar les quantitats per producte.

Analitza el PDF i retorna NOMÉS un JSON vàlid (sense markdown) amb exactament aquests camps:
{
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "client": "string",
  "base_amount": número,
  "vat_pct": número,
  "vat_amount": número,
  "total_amount": número,
  "due_date": "YYYY-MM-DD o null",
  "notes": "string breu (màx 100 car.)",
  "line_items": [
    {
      "description": "nom del producte tal com apareix a la factura",
      "quantity": número (suma total de totes les comandes per aquest producte),
      "unit_price": número (preu unitari),
      "amount": número (quantitat × preu),
      "suggested_code": "codi del producte de la llista, o null"
    }
  ]
}

Catàleg de productes per suggested_code:
\${PRODUCT_LIST}

Regles:
- BUMBBA 3 SEATER → BUM_3S
- BUMBBA CHAISELONG → BUM_CHL
- BUMBBA CORNER → BUM_CRN
- BUMBBA PRELUDE / PLAIN → BUM_PLAIN
- BUMBBA STAND BY ME → BUM_SBYME
- BUMBBA FEELING GOOD → BUM_FG
- BUMBBA WONDERWALL → BUM_WW
- THE POUFF / POUF → BUM_PUF
- SUNBBA 3 SEATER → SUN_3S
- SUNBBA CHAISELONG → SUN_CHL
- Si no coincideix, usa null

Suma totes les comandes — si "BUMBBA 3 SEATER" apareix en 28 comandes d'1 unitat, quantity = 28.
No afegeixis res fora del JSON.`;

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
