-- ============================================================================
-- Migració: Bossa Buit → component SHARED
-- ============================================================================

INSERT INTO components (tenant_id, sku, name, category_code, station, stock_actual)
VALUES (
  'SHARED', 'BOSSA', 'Bossa Buit', 'EMBALATGE', 'E2',
  COALESCE((SELECT SUM(stock_actual) FROM components WHERE sku = 'BOSSA'), 0)
)
ON CONFLICT (tenant_id, sku) DO UPDATE SET stock_actual = excluded.stock_actual;

UPDATE bom
SET component_id = (SELECT id FROM components WHERE tenant_id = 'SHARED' AND sku = 'BOSSA')
WHERE component_id IN (SELECT id FROM components WHERE sku = 'BOSSA' AND tenant_id != 'SHARED');

DELETE FROM stock_movements
WHERE component_id IN (SELECT id FROM components WHERE sku = 'BOSSA' AND tenant_id != 'SHARED');

DELETE FROM components WHERE sku = 'BOSSA' AND tenant_id != 'SHARED';
