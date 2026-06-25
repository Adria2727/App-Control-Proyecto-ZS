-- ============================================================
-- LÍNIES DE FACTURA + FUNCIÓ ADJUST_STOCK — ZeroStock
-- Executar al SQL Editor de Supabase (una sola vegada)
-- ============================================================

-- 1. Línies de factura de compra (proveïdor → component d'inventari)
CREATE TABLE IF NOT EXISTS invoice_in_lines (
  id           SERIAL PRIMARY KEY,
  invoice_id   INTEGER NOT NULL REFERENCES invoices_in(id) ON DELETE CASCADE,
  component_id BIGINT  NOT NULL REFERENCES components(id),
  quantity     INTEGER NOT NULL CHECK (quantity > 0)
);

-- 2. Línies de factura de venda (producte venut → expandit via BOM)
CREATE TABLE IF NOT EXISTS invoice_out_lines (
  id           SERIAL PRIMARY KEY,
  invoice_id   INTEGER NOT NULL REFERENCES invoices_out(id) ON DELETE CASCADE,
  product_id   BIGINT  NOT NULL REFERENCES products(id),
  quantity     INTEGER NOT NULL CHECK (quantity > 0)
);

-- 3. Funció atòmica per ajustar stock (evita race conditions)
CREATE OR REPLACE FUNCTION adjust_stock(comp_id BIGINT, delta INTEGER)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE components SET stock_actual = stock_actual + delta WHERE id = comp_id;
$$;

-- 4. RLS
ALTER TABLE invoice_in_lines  ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_out_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_full_access" ON invoice_in_lines;
DROP POLICY IF EXISTS "app_full_access" ON invoice_out_lines;

CREATE POLICY "app_full_access" ON invoice_in_lines  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "app_full_access" ON invoice_out_lines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
