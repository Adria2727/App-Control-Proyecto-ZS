import { supabase } from "@/lib/supabase";
import ProductesClient from "@/components/ProductesClient";

export const dynamic = "force-dynamic";

export default async function ProductesPage() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, code, name, tenant_id, family, bom_active, sold_on_web,
      bom ( id, quantity, station, color_varies, component:components ( id, sku, name, category_code, color_code, station ) ),
      prices ( id, price_type, size, amount, vat_included )
    `)
    .order("tenant_id")
    .order("family")
    .order("code");

  const products = (data ?? []) as Parameters<typeof ProductesClient>[0]["products"];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Productes</h1>
        <p className="text-[var(--muted)] text-sm">
          Catàleg complet amb escandall (BOM) i preus — Bumbba &amp; Sunbba
        </p>
      </div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
          Error carregant productes: {error.message}
        </div>
      )}
      <ProductesClient products={products} />
    </div>
  );
}
