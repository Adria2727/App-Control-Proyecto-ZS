-- ============================================================================
-- Migració: L Gran i L Petita → components SHARED
-- ============================================================================

-- 1. Crear components SHARED (suma stocks de les dues marques)
INSERT INTO components (tenant_id, sku, name, category_code, station, stock_actual)
VALUES (
  'SHARED', 'L_GR', 'L Gran', 'LAMES', 'E1',
  COALESCE((SELECT SUM(stock_actual) FROM components WHERE sku = 'L_GR'), 0)
)
ON CONFLICT (tenant_id, sku) DO UPDATE SET stock_actual = excluded.stock_actual;

INSERT INTO components (tenant_id, sku, name, category_code, station, stock_actual)
VALUES (
  'SHARED', 'L_PT', 'L Petita', 'LAMES', 'E1',
  COALESCE((SELECT SUM(stock_actual) FROM components WHERE sku = 'L_PT'), 0)
)
ON CONFLICT (tenant_id, sku) DO UPDATE SET stock_actual = excluded.stock_actual;

-- 2. Redirigir BOM → nous components SHARED
UPDATE bom
SET component_id = (SELECT id FROM components WHERE tenant_id = 'SHARED' AND sku = 'L_GR')
WHERE component_id IN (SELECT id FROM components WHERE sku = 'L_GR' AND tenant_id != 'SHARED');

UPDATE bom
SET component_id = (SELECT id FROM components WHERE tenant_id = 'SHARED' AND sku = 'L_PT')
WHERE component_id IN (SELECT id FROM components WHERE sku = 'L_PT' AND tenant_id != 'SHARED');

-- 3. Netejar movements dels components vells
DELETE FROM stock_movements
WHERE component_id IN (SELECT id FROM components WHERE sku IN ('L_GR', 'L_PT') AND tenant_id != 'SHARED');

-- 4. Eliminar components vells de cada marca
DELETE FROM components WHERE sku IN ('L_GR', 'L_PT') AND tenant_id != 'SHARED';
