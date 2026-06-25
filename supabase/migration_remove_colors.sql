-- ============================================================
-- MIGRACIÓ: Eliminar colors de l'inventari de components
-- Executar UNA SOLA VEGADA al SQL Editor de Supabase
-- ============================================================
-- Efecte: fusiona les files duplicades per color en una sola
-- per (tenant_id, sku), sumant l'stock_actual.
-- Actualitza totes les FK (bom, stock_movements, invoice_in_lines).
-- ============================================================

-- 1. Crear taula temporal amb el component a conservar per cada SKU+tenant
CREATE TEMP TABLE comp_merge AS
SELECT
  tenant_id,
  sku,
  MIN(id)             AS keep_id,
  SUM(stock_actual)   AS total_stock
FROM components
GROUP BY tenant_id, sku;

-- 2. Actualitzar l'stock del component conservat amb la suma total
UPDATE components c
SET stock_actual = cm.total_stock
FROM comp_merge cm
WHERE c.id = cm.keep_id;

-- 3. Redirigir les FK de bom als IDs conservats
UPDATE bom b
SET component_id = cm.keep_id
FROM components c
JOIN comp_merge cm ON cm.tenant_id = c.tenant_id AND cm.sku = c.sku
WHERE b.component_id = c.id
  AND c.id <> cm.keep_id;

-- 4. Redirigir les FK de stock_movements als IDs conservats
UPDATE stock_movements sm
SET component_id = cm.keep_id
FROM components c
JOIN comp_merge cm ON cm.tenant_id = c.tenant_id AND cm.sku = c.sku
WHERE sm.component_id = c.id
  AND c.id <> cm.keep_id;

-- 5. Redirigir les FK de invoice_in_lines (si existeix la taula)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoice_in_lines') THEN
    UPDATE invoice_in_lines il
    SET component_id = cm.keep_id
    FROM components c
    JOIN comp_merge cm ON cm.tenant_id = c.tenant_id AND cm.sku = c.sku
    WHERE il.component_id = c.id
      AND c.id <> cm.keep_id;
  END IF;
END $$;

-- 6. Eliminar les files duplicades (no conservades)
DELETE FROM components
WHERE id NOT IN (SELECT keep_id FROM comp_merge);

-- 7. Actualitzar el constraint únic (treure color_code)
ALTER TABLE components DROP CONSTRAINT IF EXISTS components_tenant_id_sku_color_code_key;
ALTER TABLE components ADD CONSTRAINT components_tenant_id_sku_key UNIQUE (tenant_id, sku);

-- 8. Eliminar la columna color_code
ALTER TABLE components DROP COLUMN IF EXISTS color_code;

-- Verificació ràpida
SELECT tenant_id, COUNT(*) AS components FROM components GROUP BY tenant_id ORDER BY tenant_id;
