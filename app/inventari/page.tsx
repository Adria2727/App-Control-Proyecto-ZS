import { supabase } from "@/lib/supabase";
import { Component } from "@/lib/types";
import InventoryTable from "./InventoryTable";

export const dynamic = "force-dynamic";

export default async function InventariPage() {
  const { data } = await supabase
    .from("components")
    .select("id,sku,name,tenant_id,category_code,color_code,station,stock_actual")
    .order("name");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Inventari</h1>
        <p className="text-[var(--muted)] text-sm">Stock actual de tots els components per marca i categoria</p>
      </div>
      <InventoryTable components={(data ?? []) as Component[]} />
    </div>
  );
}
