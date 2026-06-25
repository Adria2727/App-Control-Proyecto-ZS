import { supabase } from "@/lib/supabase";
import ProductesClient from "@/components/ProductesClient";

export const dynamic = "force-dynamic";

export default async function ProductesPage() {
  const [
    { data: productsData, error: errP },
    { data: bomData },
    { data: pricesData },
    { data: componentsData },
  ] = await Promise.all([
    supabase.from("products").select("id,code,name,tenant_id,family,bom_active,sold_on_web").order("tenant_id").order("family").order("code"),
    supabase.from("bom").select("id,product_id,component_id,quantity,station,color_varies"),
    supabase.from("prices").select("id,product_id,price_type,size,amount,vat_included"),
    supabase.from("components").select("id,sku,name,category_code,station"),
  ]);

  const componentMap = Object.fromEntries((componentsData ?? []).map((c) => [c.id, c]));

  const bomByProduct: Record<number, unknown[]> = {};
  for (const line of bomData ?? []) {
    if (!bomByProduct[line.product_id]) bomByProduct[line.product_id] = [];
    bomByProduct[line.product_id].push({ ...line, component: componentMap[line.component_id] ?? null });
  }

  const pricesByProduct: Record<number, unknown[]> = {};
  for (const price of pricesData ?? []) {
    if (!pricesByProduct[price.product_id]) pricesByProduct[price.product_id] = [];
    pricesByProduct[price.product_id].push(price);
  }

  const products = (productsData ?? []).map((p) => ({
    ...p,
    bom: (bomByProduct[p.id] ?? []) as Parameters<typeof ProductesClient>[0]["products"][0]["bom"],
    prices: (pricesByProduct[p.id] ?? []) as Parameters<typeof ProductesClient>[0]["products"][0]["prices"],
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Productes</h1>
        <p className="text-[var(--muted)] text-sm">
          Catàleg complet amb escandall (BOM) i preus — Bumbba &amp; Sunbba
        </p>
      </div>
      {errP && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
          Error carregant productes: {errP.message}
        </div>
      )}
      {products.length === 0 && !errP && (
        <div className="text-sm text-[var(--muted)] bg-[var(--card)] px-4 py-6 rounded-xl border border-[var(--border)] text-center">
          No hi ha productes a la base de dades. Cal executar el seed_data.sql a Supabase.
        </div>
      )}
      {products.length > 0 && <ProductesClient products={products} />}
    </div>
  );
}
