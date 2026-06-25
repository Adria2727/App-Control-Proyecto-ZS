-- Crear Brac SUNBBA + actualitzar stocks Sunbba del recompte
INSERT INTO components (sku, name, tenant_id, category_code, station, stock_actual)
VALUES ('BRAC', 'Brac', 'SUNBBA', 'ESTRUCTURES', 'E1', 54)
ON CONFLICT (tenant_id, sku) DO UPDATE SET stock_actual = 54;

UPDATE components SET stock_actual = 93 WHERE tenant_id = 'SUNBBA' AND sku = 'MAT_190';
UPDATE components SET stock_actual = 24 WHERE tenant_id = 'SUNBBA' AND sku = 'MAT_160';
UPDATE components SET stock_actual = 26 WHERE tenant_id = 'SUNBBA' AND sku = 'NUCLI_PUF';
