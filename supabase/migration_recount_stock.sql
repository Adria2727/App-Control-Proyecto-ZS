-- ============================================================================
-- Recompte d'inventari complet — 2026-06-25
-- Reset a 0 + nous valors reals
-- ============================================================================

-- 1. Reset total
UPDATE components SET stock_actual = 0;

-- 2. BUMBBA
UPDATE components SET stock_actual = 160 WHERE tenant_id = 'BUMBBA' AND sku = 'FUN_CR';
UPDATE components SET stock_actual = 25  WHERE tenant_id = 'BUMBBA' AND sku = 'FUN_CRM';
UPDATE components SET stock_actual = 76  WHERE tenant_id = 'BUMBBA' AND sku = 'FUN_RAC';
UPDATE components SET stock_actual = 200 WHERE tenant_id = 'BUMBBA' AND sku = 'FUN_MC';
UPDATE components SET stock_actual = 69  WHERE tenant_id = 'BUMBBA' AND sku = 'MAT_190';
UPDATE components SET stock_actual = 41  WHERE tenant_id = 'BUMBBA' AND sku = 'MAT_160';
UPDATE components SET stock_actual = 18  WHERE tenant_id = 'BUMBBA' AND sku = 'NUCLI_PUF';
UPDATE components SET stock_actual = 28  WHERE tenant_id = 'BUMBBA' AND sku = 'BRAC';
UPDATE components SET stock_actual = 156 WHERE tenant_id = 'BUMBBA' AND sku = 'FARCIT_GR';
UPDATE components SET stock_actual = 40  WHERE tenant_id = 'BUMBBA' AND sku = 'FARCIT_CR_M';
UPDATE components SET stock_actual = 18  WHERE tenant_id = 'BUMBBA' AND sku = 'FARCIT_RAC';
UPDATE components SET stock_actual = 390 WHERE tenant_id = 'BUMBBA' AND sku = 'FARCIT_PT';
UPDATE components SET stock_actual = 700 WHERE tenant_id = 'BUMBBA' AND sku = 'ETIQ';
UPDATE components SET stock_actual = 250 WHERE tenant_id = 'BUMBBA' AND sku = 'HOTGLUE';
UPDATE components SET stock_actual = 200 WHERE tenant_id = 'BUMBBA' AND sku = 'CAJA_B';

-- 3. SUNBBA — nou component FUN_RAC
INSERT INTO components (sku, name, tenant_id, category_code, station, stock_actual)
VALUES ('FUN_RAC', 'Funda Coixi Rinconera', 'SUNBBA', 'TELA', 'E3', 86)
ON CONFLICT (tenant_id, sku) DO UPDATE SET stock_actual = 86, name = EXCLUDED.name;

UPDATE components SET stock_actual = 118 WHERE tenant_id = 'SUNBBA' AND sku = 'FUN_CR';
UPDATE components SET stock_actual = 42  WHERE tenant_id = 'SUNBBA' AND sku = 'FUN_CRM';
UPDATE components SET stock_actual = 80  WHERE tenant_id = 'SUNBBA' AND sku = 'FUN_MC';

-- 4. SHARED
UPDATE components SET stock_actual = 150 WHERE tenant_id = 'SHARED' AND sku = 'L_GR';
UPDATE components SET stock_actual = 150 WHERE tenant_id = 'SHARED' AND sku = 'L_PT';
UPDATE components SET stock_actual = 300 WHERE tenant_id = 'SHARED' AND sku = 'BOSSA';
UPDATE components SET stock_actual = 400 WHERE tenant_id = 'SHARED' AND sku = 'POT';
