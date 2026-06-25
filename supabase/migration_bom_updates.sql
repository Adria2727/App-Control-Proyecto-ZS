-- ============================================================================
-- Migració: Actualització BOM - tots els canvis acumulats
-- ============================================================================

-- ── 1. POUF (BUMBBA + SUNBBA) ──
-- Eliminar Pouf Enfundat del BOM
DELETE FROM bom
WHERE component_id IN (SELECT id FROM components WHERE name = 'Pouf Enfundat')
  AND product_id IN (SELECT id FROM products WHERE code = 'PUF');

-- Afegir Nucli Pouf × 1 (Funda Pouf ja existeix al BOM)
INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, 1, 'E1', true
FROM products p
JOIN components c ON c.name = 'Nucli Pouf' AND c.tenant_id = p.tenant_id
WHERE p.code = 'PUF'
  AND NOT EXISTS (SELECT 1 FROM bom b WHERE b.product_id = p.id AND b.component_id = c.id);

-- Eliminar Funda Interior Pouf del BOM
DELETE FROM bom
WHERE component_id IN (SELECT id FROM components WHERE name = 'Funda Interior Pouf');

-- Eliminar components Pouf Enfundat i Funda Interior Pouf de l'inventari
DELETE FROM stock_movements
WHERE component_id IN (SELECT id FROM components WHERE name IN ('Pouf Enfundat', 'Funda Interior Pouf'));
DELETE FROM components WHERE name IN ('Pouf Enfundat', 'Funda Interior Pouf');

-- ── 2. 2 SEATER BUMBBA: Afegir Etiqueta × 2 ──
-- (SUNBBA 2P ja en té)
INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, 2, 'E0', false
FROM products p
JOIN components c ON c.sku = 'ETIQ' AND c.tenant_id = 'BUMBBA'
WHERE p.tenant_id = 'BUMBBA' AND p.code = '2P'
  AND NOT EXISTS (SELECT 1 FROM bom b WHERE b.product_id = p.id AND b.component_id = c.id);

-- ── 3. 3 SEATER (BUMBBA + SUNBBA): Afegir Farcit Petit × 2 + Funda Coixí Petit × 2 ──
INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, 2, 'E3', false
FROM products p
JOIN components c ON c.sku = 'FARCIT_PT' AND c.tenant_id = p.tenant_id
WHERE p.code = '3P'
  AND NOT EXISTS (SELECT 1 FROM bom b WHERE b.product_id = p.id AND b.component_id = c.id);

INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, 2, 'E3', true
FROM products p
JOIN components c ON c.sku = 'FUN_MC' AND c.tenant_id = p.tenant_id
WHERE p.code = '3P'
  AND NOT EXISTS (SELECT 1 FROM bom b WHERE b.product_id = p.id AND b.component_id = c.id);

-- ── 4. CHAISE LONGUE BUMBBA: Potes 12 → 24 ──
UPDATE bom SET quantity = 24
WHERE product_id = (SELECT id FROM products WHERE tenant_id = 'BUMBBA' AND code = 'CHL')
  AND component_id = (SELECT id FROM components WHERE tenant_id = 'SHARED' AND sku = 'POT');

-- ── 5. CHAISE LONGUE 160 BUMBBA: BOM nou complet ──
INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, v.qty, v.st, v.cv
FROM products p
JOIN lateral (values
  ('POT',         'SHARED', 24, 'E0', false),
  ('MAN_ES',      'BUMBBA',  1, 'E0', false),
  ('ETIQ',        'BUMBBA',  4, 'E0', false),
  ('CAJA_B',      'BUMBBA',  4, 'E1', false),
  ('MAT_160',     'BUMBBA',  4, 'E1', true),
  ('FUN_M160',    'BUMBBA',  4, 'E1', true),
  ('L_GR',        'BUMBBA',  3, 'E1', true),
  ('L_PT',        'BUMBBA',  2, 'E1', true),
  ('FARCIT_CR_M', 'BUMBBA',  3, 'E3', false),
  ('FUN_CRM',     'BUMBBA',  3, 'E3', true),
  ('BOSSA',       'BUMBBA',  3, 'E2', false),
  ('FARCIT_PT',   'BUMBBA',  2, 'E3', false),
  ('FUN_MC',      'BUMBBA',  2, 'E3', true)
) as v(sku, tid, qty, st, cv) on true
JOIN components c ON c.sku = v.sku AND c.tenant_id = v.tid
WHERE p.tenant_id = 'BUMBBA' AND p.code = 'CHL_160';

-- ── 6. CORNER BUMBBA: Potes 12 → 24 + Etiqueta × 4 ──
UPDATE bom SET quantity = 24
WHERE product_id = (SELECT id FROM products WHERE tenant_id = 'BUMBBA' AND code = 'CRN')
  AND component_id = (SELECT id FROM components WHERE tenant_id = 'SHARED' AND sku = 'POT');

INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, 4, 'E0', false
FROM products p
JOIN components c ON c.sku = 'ETIQ' AND c.tenant_id = 'BUMBBA'
WHERE p.tenant_id = 'BUMBBA' AND p.code = 'CRN'
  AND NOT EXISTS (SELECT 1 FROM bom b WHERE b.product_id = p.id AND b.component_id = c.id);

-- Farcit Rinconera, Funda Coixí Rinconera, Bossa Buit (si no existeixen del flatten)
INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, 1, 'E3', false
FROM products p
JOIN components c ON c.sku = 'FARCIT_RAC' AND c.tenant_id = 'BUMBBA'
WHERE p.tenant_id = 'BUMBBA' AND p.code = 'CRN'
  AND NOT EXISTS (SELECT 1 FROM bom b WHERE b.product_id = p.id AND b.component_id = c.id);

INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, 1, 'E3', true
FROM products p
JOIN components c ON c.sku = 'FUN_RAC' AND c.tenant_id = 'BUMBBA'
WHERE p.tenant_id = 'BUMBBA' AND p.code = 'CRN'
  AND NOT EXISTS (SELECT 1 FROM bom b WHERE b.product_id = p.id AND b.component_id = c.id);

-- ── 7. CORNER 160 BUMBBA: BOM nou complet ──
INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, v.qty, v.st, v.cv
FROM products p
JOIN lateral (values
  ('POT',         'SHARED', 12, 'E0', false),
  ('CAJA_B',      'BUMBBA',  4, 'E1', false),
  ('MAT_160',     'BUMBBA',  4, 'E1', true),
  ('FUN_M160',    'BUMBBA',  4, 'E1', true),
  ('L_GR',        'BUMBBA',  5, 'E1', true),
  ('L_PT',        'BUMBBA',  2, 'E1', true),
  ('FARCIT_CR_M', 'BUMBBA',  3, 'E3', false),
  ('FUN_CRM',     'BUMBBA',  3, 'E3', true),
  ('FARCIT_PT',   'BUMBBA',  2, 'E3', false),
  ('FUN_MC',      'BUMBBA',  2, 'E3', true),
  ('FARCIT_RAC',  'BUMBBA',  1, 'E3', false),
  ('FUN_RAC',     'BUMBBA',  1, 'E3', true),
  ('BOSSA',       'BUMBBA',  4, 'E2', false),
  ('MAN_ES',      'BUMBBA',  1, 'E0', false),
  ('ETIQ',        'BUMBBA',  4, 'E0', false)
) as v(sku, tid, qty, st, cv) on true
JOIN components c ON c.sku = v.sku AND c.tenant_id = v.tid
WHERE p.tenant_id = 'BUMBBA' AND p.code = 'CRN_160';

-- ── 8. MATALÀS 190 BUMBBA (CL190): Afegir Funda Matalàs 190 × 1 ──
INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, 1, 'E1', true
FROM products p
JOIN components c ON c.sku = 'FUN_M190' AND c.tenant_id = 'BUMBBA'
WHERE p.tenant_id = 'BUMBBA' AND p.code = 'CL190'
  AND NOT EXISTS (SELECT 1 FROM bom b WHERE b.product_id = p.id AND b.component_id = c.id);

-- ── 9. MATALÀS 160 BUMBBA (CL160): Afegir Funda Matalàs 160 × 1 ──
INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, 1, 'E1', true
FROM products p
JOIN components c ON c.sku = 'FUN_M160' AND c.tenant_id = 'BUMBBA'
WHERE p.tenant_id = 'BUMBBA' AND p.code = 'CL160'
  AND NOT EXISTS (SELECT 1 FROM bom b WHERE b.product_id = p.id AND b.component_id = c.id);

-- ── 10. BRAÇOS BUMBBA: Braç Enfundat → Braç ──
DELETE FROM bom
WHERE component_id IN (SELECT id FROM components WHERE name = 'Braç Enfundat')
  AND product_id IN (SELECT id FROM products WHERE code = 'BRAZO');

INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT p.id, c.id, 2, 'E1', true
FROM products p
JOIN components c ON c.sku = 'BRAC' AND c.tenant_id = 'BUMBBA'
WHERE p.tenant_id = 'BUMBBA' AND p.code = 'BRAZO'
  AND NOT EXISTS (SELECT 1 FROM bom b WHERE b.product_id = p.id AND b.component_id = c.id);

DELETE FROM stock_movements WHERE component_id IN (SELECT id FROM components WHERE name = 'Braç Enfundat');
DELETE FROM components WHERE name = 'Braç Enfundat';
