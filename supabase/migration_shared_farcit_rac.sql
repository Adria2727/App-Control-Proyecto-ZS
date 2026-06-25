-- Moure Farcit Rinconera a SHARED
INSERT INTO components (sku, name, tenant_id, category_code, station, stock_actual)
VALUES ('FARCIT_RAC', 'Farcit Rinconera', 'SHARED', 'ALTRES', 'E3', 18)
ON CONFLICT (tenant_id, sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual, name = EXCLUDED.name;

UPDATE bom SET component_id = (SELECT id FROM components WHERE tenant_id='SHARED' AND sku='FARCIT_RAC')
WHERE component_id IN (SELECT id FROM components WHERE sku='FARCIT_RAC' AND tenant_id IN ('BUMBBA','SUNBBA'));

DELETE FROM components WHERE sku='FARCIT_RAC' AND tenant_id IN ('BUMBBA','SUNBBA');
