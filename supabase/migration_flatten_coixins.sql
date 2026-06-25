-- ============================================================================
-- Migració: Aplanar BOM coixins muntats → components raw directes
-- Coixí Gran Muntat → Farcit Gran + Funda Coixí Gran + Bossa Buit
-- Coixí Mitjà Muntat → Farcit Mitjà + Funda Coixí Mitjà + Bossa Buit
-- Coixí Rinconera Muntat → Farcit Rinconera + Funda Coixí Rinconera + Bossa Buit
-- Coixí Petit Muntat → Farcit Petit + Funda Coixí Petit (sense Bossa)
-- ============================================================================

-- 1. Expandir BOM: inserir components raw agrupats per producte
WITH coixi_expansion AS (
  SELECT
    b.product_id,
    b.quantity          AS coixi_qty,
    coixi.name          AS coixi_name,
    coixi.tenant_id,
    exp.raw_name,
    exp.qty_per_coixi
  FROM bom b
  JOIN components coixi ON coixi.id = b.component_id
  JOIN (VALUES
    ('Coixí Gran Muntat',     'Farcit Gran',           1),
    ('Coixí Gran Muntat',     'Funda Coixí Gran',      1),
    ('Coixí Gran Muntat',     'Bossa Buit',            1),
    ('Coixí Mitjà Muntat',    'Farcit Mitjà',           1),
    ('Coixí Mitjà Muntat',    'Funda Coixí Mitjà',     1),
    ('Coixí Mitjà Muntat',    'Bossa Buit',            1),
    ('Coixí Rinconera Muntat','Farcit Rinconera',      1),
    ('Coixí Rinconera Muntat','Funda Coixí Rinconera', 1),
    ('Coixí Rinconera Muntat','Bossa Buit',            1),
    ('Coixí Petit Muntat',    'Farcit Petit',          1),
    ('Coixí Petit Muntat',    'Funda Coixí Petit',     1)
  ) AS exp(coixi_name, raw_name, qty_per_coixi)
  ON coixi.name = exp.coixi_name
),
grouped AS (
  SELECT
    ce.product_id,
    raw_comp.id                              AS component_id,
    SUM(ce.coixi_qty * ce.qty_per_coixi)    AS total_qty,
    CASE WHEN ce.raw_name = 'Bossa Buit' THEN 'E2' ELSE 'E3' END AS station,
    ce.raw_name LIKE 'Funda%'               AS color_varies
  FROM coixi_expansion ce
  JOIN components raw_comp
    ON raw_comp.name = ce.raw_name
    AND raw_comp.tenant_id = ce.tenant_id
  GROUP BY ce.product_id, raw_comp.id, ce.raw_name
)
INSERT INTO bom (product_id, component_id, quantity, station, color_varies)
SELECT product_id, component_id, total_qty, station, color_varies
FROM grouped;

-- 2. Eliminar coixins muntats del BOM de tots els productes
DELETE FROM bom
WHERE component_id IN (
  SELECT id FROM components
  WHERE name IN (
    'Coixí Gran Muntat', 'Coixí Mitjà Muntat',
    'Coixí Rinconera Muntat', 'Coixí Petit Muntat'
  )
);

-- 3. Eliminar stock_movements dels coixins muntats (tots a 0, res a perdre)
DELETE FROM stock_movements
WHERE component_id IN (
  SELECT id FROM components
  WHERE name IN (
    'Coixí Gran Muntat', 'Coixí Mitjà Muntat',
    'Coixí Rinconera Muntat', 'Coixí Petit Muntat'
  )
);

-- 4. Eliminar els components coixins muntats
DELETE FROM components
WHERE name IN (
  'Coixí Gran Muntat', 'Coixí Mitjà Muntat',
  'Coixí Rinconera Muntat', 'Coixí Petit Muntat'
);
