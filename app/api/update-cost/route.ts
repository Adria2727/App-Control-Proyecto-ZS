import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { component_id, cost_unitari } = await req.json();
  if (!component_id || cost_unitari == null) {
    return NextResponse.json({ error: "Falten dades" }, { status: 400 });
  }
  const { error } = await supabase
    .from("components")
    .update({ cost_unitari })
    .eq("id", component_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
