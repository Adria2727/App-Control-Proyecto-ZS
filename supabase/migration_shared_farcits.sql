-- ============================================================================
-- Moure Farcit Gran, Mitjà i Petit a SHARED
-- ============================================================================

-- 1. Inserir components SHARED
INSERT INTO components (sku, name, tenant_id, category_code, station, stock_actual)
VALUES
  ('FARCIT_GR',   'Farcit Gran',  'SHARED', 'ALTRES', 'E3', 156),
  ('FARCIT_CR_M', 'Farcit Mitja', 'SHARED', 'ALTRES', 'E3',  40),
  ('FARCIT_PT',   'Farcit Petit', 'SHARED', 'ALTRES', 'E3', 390)
ON CONFLICT (tenant_id, sku) DO UPDATE
  SET stock_actual = EXCLUDED.stock_actual, name = EXCLUDED.name;

-- 2. Actualitzar BOM
UPDATE bom SET component_id = (SELECT id FROM components WHERE tenant_id='SHARED' AND sku='FARCIT_GR')
WHERE component_id IN (SELECT id FROM components WHERE sku='FARCIT_GR' AND tenant_id IN ('BUMBBA','SUNBBA'));

UPDATE bom SET component_id = (SELECT id FROM components WHERE tenant_id='SHARED' AND sku='FARCIT_CR_M')
WHERE component_id IN (SELECT id FROM components WHERE sku='FARCIT_CR_M' AND tenant_id IN ('BUMBBA','SUNBBA'));

UPDATE bom SET component_id = (SELECT id FROM components WHERE tenant_id='SHARED' AND sku='FARCIT_PT')
WHERE component_id IN (SELECT id FROM components WHERE sku='FARCIT_PT' AND tenant_id IN ('BUMBBA','SUNBBA'));

-- 3. Eliminar els de marca
DELETE FROM components WHERE sku IN ('FARCIT_GR','FARCIT_CR_M','FARCIT_PT') AND tenant_id IN ('BUMBBA','SUNBBA');
