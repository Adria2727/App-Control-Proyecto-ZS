-- ============================================================================
-- Moure Cola Calenta i Etiqueta a SHARED
-- ============================================================================

-- 1. Inserir components SHARED
INSERT INTO components (sku, name, tenant_id, category_code, station, stock_actual)
VALUES
  ('HOTGLUE', 'Cola Calenta', 'SHARED', 'ALTRES',   null, 250),
  ('ETIQ',    'Etiqueta',     'SHARED', 'EMBALATGE', 'E0', 700)
ON CONFLICT (tenant_id, sku) DO UPDATE
  SET stock_actual = EXCLUDED.stock_actual, name = EXCLUDED.name;

-- 2. Actualitzar BOM: apuntar al component SHARED
UPDATE bom SET component_id = (SELECT id FROM components WHERE tenant_id='SHARED' AND sku='HOTGLUE')
WHERE component_id IN (SELECT id FROM components WHERE sku='HOTGLUE' AND tenant_id IN ('BUMBBA','SUNBBA'));

UPDATE bom SET component_id = (SELECT id FROM components WHERE tenant_id='SHARED' AND sku='ETIQ')
WHERE component_id IN (SELECT id FROM components WHERE sku='ETIQ' AND tenant_id IN ('BUMBBA','SUNBBA'));

-- 3. Eliminar els de marca
DELETE FROM components WHERE sku='HOTGLUE' AND tenant_id IN ('BUMBBA','SUNBBA');
DELETE FROM components WHERE sku='ETIQ'    AND tenant_id IN ('BUMBBA','SUNBBA');
