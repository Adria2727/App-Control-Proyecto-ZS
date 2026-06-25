import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { component_id, stock_actual } = await req.json();
  if (component_id == null || stock_actual == null) {
    return NextResponse.json({ error: "Falten dades" }, { status: 400 });
  }
  const { error } = await supabase
    .from("components")
    .update({ stock_actual })
    .eq("id", component_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Registrar el moviment manual
  await supabase.from("stock_movements").insert({
    component_id,
    delta: null,
    reason: "Ajust manual d'inventari",
    source: "manual",
  });

  return NextResponse.json({ ok: true });
}
