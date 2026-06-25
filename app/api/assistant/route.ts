import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeInvoices } from "@/lib/invoice-utils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TODAY = new Date("2026-06-19").toISOString().split("T")[0];

const SYSTEM = `Ets l'assistent intel·ligent de l'aplicació "Zero Stock" de l'empresa Estelle Parquet.
Gestionen la producció de sofàs de les marques BUMBBA i SUNBBA fabricats a Amposta.
Respons sempre en català, de forma concisa i directa. Si cal, usa listes curtes.
Avui és ${TODAY}.

Tens accés a les dades reals de l'empresa:

COMPONENTS / STOCK
- Cada component té: nom, color, tenant (BUMBBA/SUNBBA), categoria, stock_actual, cost_unitari
- Stock negatiu = descuadre comptable (productes muntats però no descomptats)
- Categoria pot ser: fundes, rellens, potes, caixes, etiquetes, altres

FACTURES DE VENDA (invoices_out)
- Sempre de client NUBBA SPACES S.L.
- Estelle Parquet emet factura setmanal per les vendes de Bumbba/Sunbba
- Camps: número, data, import base, import total (IVA inc.), data venciment, estat (paid/pending/overdue)

FACTURES DE COMPRA (invoices_in)
- Proveïdors: FUNCOTEX (fundes), INTERPLASP (rellens), TARRACO CONFORT (assessorament), LACATS VF (potes), CATALÁ PROMOCIONS (caixes), etc.
- Camps: número, proveïdor, data, import, venciment, estat, categoria

PRODUCTES I BOM
- Cada producte (sofà) té una BOM amb els components i quantitats necessàries per fabricar-lo
- El cost de fabricació = suma(quantitat × cost_unitari) de cada component del BOM

Respon basant-te ÚNICAMENT en les dades que et proporciono. Si no tens la informació exacta, digues-ho clarament.
No inventes dades. Sigues precís amb els números.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: { role: "user" | "assistant"; content: string }[] };

    if (!messages?.length) {
      return NextResponse.json({ error: "Falta missatge" }, { status: 400 });
    }

    // Fetch live data from Supabase
    const [
      { data: components },
      { data: invoicesOut },
      { data: invoicesIn },
      { data: products },
    ] = await Promise.all([
      supabase
        .from("components")
        .select("name,tenant_id,category_code,stock_actual,cost_unitari")
        .order("tenant_id")
        .order("name"),
      supabase
        .from("invoices_out")
        .select("invoice_number,invoice_date,client,base_amount,total_amount,due_date,status,notes")
        .order("invoice_date", { ascending: false }),
      supabase
        .from("invoices_in")
        .select("invoice_number,invoice_date,supplier,category,base_amount,total_amount,due_date,status,notes")
        .order("due_date"),
      supabase
        .from("products")
        .select("id,name,code,tenant_id,bom:bom(quantity,component:components(name,cost_unitari))")
        .order("tenant_id")
        .order("name"),
    ]);

    const dataContext = `
=== DADES EN TEMPS REAL (avui ${TODAY}) ===
NOTA: Totes les factures amb data de venciment ≤ avui es consideren pagades automàticament.

--- COMPONENTS I STOCK ---
${JSON.stringify(components ?? [], null, 2)}

--- FACTURES DE VENDA (invoices_out) ---
${JSON.stringify(normalizeInvoices(invoicesOut ?? []), null, 2)}

--- FACTURES DE COMPRA (invoices_in) ---
${JSON.stringify(normalizeInvoices(invoicesIn ?? []), null, 2)}

--- PRODUCTES I BOM ---
${JSON.stringify(products ?? [], null, 2)}
`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM + "\n\n" + dataContext,
      messages,
    });

    const text = (response.content[0] as any).text as string;
    return NextResponse.json({ reply: text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Error desconegut" }, { status: 500 });
  }
}
