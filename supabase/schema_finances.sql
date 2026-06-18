-- ============================================================
-- FINANCES & MARGES — ZeroStock
-- Executa aquest fitxer al SQL Editor de Supabase
-- ============================================================

-- 1. Afegir cost_unitari als components (per al càlcul de marges via BOM)
ALTER TABLE components ADD COLUMN IF NOT EXISTS cost_unitari NUMERIC(10,4) DEFAULT 0;

-- 2. Taula de factures emeses (vendes a Bumbba/Nubba)
CREATE TABLE IF NOT EXISTS invoices_out (
  id           SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  client       TEXT NOT NULL,
  base_amount  NUMERIC(12,2) NOT NULL,
  vat_pct      NUMERIC(5,2)  DEFAULT 21,
  vat_amount   NUMERIC(12,2),
  total_amount NUMERIC(12,2),
  due_date     DATE,
  paid_date    DATE,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','partial')),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Taula de factures rebudes (compres a proveïdors)
CREATE TABLE IF NOT EXISTS invoices_in (
  id             SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  invoice_date   DATE NOT NULL,
  supplier       TEXT NOT NULL,
  category       TEXT, -- fundes | rellens | textils | caixes | potes | assessorament
  base_amount    NUMERIC(12,2) NOT NULL,
  vat_pct        NUMERIC(5,2) DEFAULT 21,
  vat_amount     NUMERIC(12,2),
  total_amount   NUMERIC(12,2),
  due_date       DATE,
  paid_date      DATE,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','partial')),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (invoice_number, supplier)
);

-- 4. RLS per a les taules noves
ALTER TABLE invoices_out ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_in  ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_full_access" ON invoices_out;
DROP POLICY IF EXISTS "app_full_access" ON invoices_in;
CREATE POLICY "app_full_access" ON invoices_out FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "app_full_access" ON invoices_in  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 5. SEED — Factures emeses (vendes)
-- ============================================================
INSERT INTO invoices_out (invoice_number, invoice_date, client, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes)
VALUES
  ('PROFORMA-15062026', '2026-06-15', 'NUBBA SPACES, S.L.', 49576.49, 21, 10411.06, 59987.55, NULL, 'pending',
   '135 comandes / 154 unitats Bumbba — Transferència bancària pendent')
ON CONFLICT (invoice_number) DO NOTHING;

-- ============================================================
-- 6. SEED — Factures rebudes (compres)
-- ============================================================
INSERT INTO invoices_in (invoice_number, invoice_date, supplier, category, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes) VALUES
  ('260203',     '2026-02-19', 'FUNCOTEX SLU',                   'fundes',        68.66,    21, 14.42,    83.08,    '2026-04-20', 'paid',    'Mostres funda Pana Verd + genèrica braç'),
  ('260447',     '2026-04-16', 'FUNCOTEX SLU',                   'fundes',      1644.00,    21, 345.24,  1989.24,   '2026-06-15', 'pending', 'Fundes S/A Bumbba Pana Verd/Gris/Piedra — lots de 10'),
  ('260457',     '2026-04-17', 'FUNCOTEX SLU',                   'fundes',      5631.36,    21, 1182.59, 6813.95,   '2026-06-16', 'pending', 'Fundes S/A Bumbba Pana + Fundes Interior FI'),
  ('260479',     '2026-04-22', 'FUNCOTEX SLU',                   'fundes',      6960.30,    21, 1461.66, 8421.96,   '2026-06-21', 'pending', 'Fundes S/A Bumbba Pana Verd/Gris/Piedra — lot gran'),
  ('260554',     '2026-05-06', 'FUNCOTEX SLU',                   'fundes',       437.70,    21, 91.92,   529.62,    '2026-07-05', 'pending', 'Fundes S/A Brazo Bumbba Pana Verd/Gris/Piedra'),
  ('260555',     '2026-05-06', 'FUNCOTEX SLU',                   'fundes',      8292.72,    21, 1741.47, 10034.19,  '2026-07-05', 'pending', 'Fundes Bumbba Pana + Braç + Sunbba Pico'),
  ('260650',     '2026-05-26', 'FUNCOTEX SLU',                   'fundes',       520.00,    21, 109.20,  629.20,    '2026-07-25', 'pending', 'Etiquetes TC Sunbba x1.300'),
  ('260703',     '2026-06-05', 'FUNCOTEX SLU',                   'fundes',     14651.03,    21, 3076.72, 17727.75,  '2026-08-04', 'pending', 'Fundes S/A Sunbba Pico 04/82/37/99 + Braç Sunbba'),
  ('2600582',    '2026-04-29', 'INTERPLASP SL',                  'rellens',     4161.36,    21, 873.89,  5035.25,   '2026-05-30', 'paid',    'Colchons 190x80 Verd+Gris'),
  ('2600895',    '2026-05-11', 'INTERPLASP SL',                  'rellens',    16574.19,    21, 3480.58, 20054.77,  '2026-06-11', 'paid',    'Colchons Bumbba 190x80 i 160x80 + Puff — 101 m³'),
  ('2601483',    '2026-06-10', 'INTERPLASP SL',                  'rellens',     5179.97,    21, 1087.79, 6267.76,   '2026-07-11', 'pending', 'Braços Bumbba + Colchons i Puff Sunbba'),
  ('2026-A/1539','2026-03-18', 'TARRACÓ CONFORT UPHOLSTERY SL',  'textils',    11140.00,    21, 2339.40, 13479.40,  '2026-03-18', 'paid',    'Fundes tèxtils i coixins + transport importació'),
  ('2026-A/1622','2026-05-08', 'TARRACÓ CONFORT UPHOLSTERY SL',  'textils',    14079.00,    21, 2956.59, 17035.59,  '2026-05-08', 'paid',    'Fabric Pico+Pana + coixins Bumbba/Sunbba + embalatge + transport'),
  ('2600000668', '2026-03-12', 'TARRACÓ CONFORT UPHOLSTERY SL',  'caixes',      1730.05,    21, 363.31,  2093.36,   '2026-05-15', 'paid',    'Bumbba 1 Unit Box x255 + Clichè'),
  ('2600000953', '2026-04-16', 'TARRACÓ CONFORT UPHOLSTERY SL',  'caixes',       840.96,    21, 176.60,  1017.56,   '2026-06-15', 'pending', 'Bumbba 1 Unit Box x219'),
  ('2026-AA.196','2026-05-05', 'LACATS VF SL',                   'potes',       8650.40,    21, 1816.58, 10466.98,  '2026-06-19', 'pending', 'Potes grans/petites 5 colors RAL + 2 viatges'),
  ('2026-AA.199','2026-05-18', 'LACATS VF SL',                   'potes',        645.60,    21, 135.58,  781.18,    '2026-07-02', 'pending', 'Curvas grans RAL 7016 i RAL 1013 + petites RAL 1013'),
  ('2604',       '2026-03-31', 'CATALÀ PROMOCIONS 2005 SL',      'assessorament',2131.00,   21, 447.51,  2578.51,   '2026-03-31', 'paid',    'Assessorament Projecte Zero Stock')
ON CONFLICT (invoice_number, supplier) DO NOTHING;

-- ============================================================
-- 7. Costos unitaris dels components (des de les factures de compra)
--    Adapta els patrons si els noms dels components al DB difereixen.
-- ============================================================

-- BUMBBA — Fundes exteriors (FUNCOTEX ~19,74 €/u per 190x80)
UPDATE components SET cost_unitari = 19.74
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%funda%exterior%190%' OR name ILIKE '%funda%pana%190%' OR
  name ILIKE '%funda%s/a%190%' OR (name ILIKE '%pana%' AND name ILIKE '%190%' AND name NOT ILIKE '%interior%' AND name NOT ILIKE '%brac%')
);

UPDATE components SET cost_unitari = 18.72
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%funda%exterior%160%' OR name ILIKE '%funda%pana%160%' OR
  (name ILIKE '%pana%' AND name ILIKE '%160%' AND name NOT ILIKE '%interior%' AND name NOT ILIKE '%brac%')
);

UPDATE components SET cost_unitari = 16.34
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%funda%exterior%80x80%' OR name ILIKE '%funda%pana%80x80%' OR name ILIKE '%funda%pana%puff%' OR
  (name ILIKE '%pana%' AND name ILIKE '%80x80%' AND name NOT ILIKE '%interior%' AND name NOT ILIKE '%brac%')
);

-- BUMBBA — Fundes braç (FUNCOTEX ~14,59 €/u)
UPDATE components SET cost_unitari = 14.59
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%brac%' OR name ILIKE '%brazo%' OR name ILIKE '%braç%'
) AND (name ILIKE '%funda%' OR name ILIKE '%pana%');

-- BUMBBA — Fundes interiors (FUNCOTEX 2,88 €/u)
UPDATE components SET cost_unitari = 2.88
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%funda%interior%' OR name ILIKE '%interior%punt%' OR name ILIKE '%poliester%'
);

-- BUMBBA — Rellens / colchons (INTERPLASP)
UPDATE components SET cost_unitari = 52.017
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%rellen%190%' OR name ILIKE '%colch%190%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%190%')
);
UPDATE components SET cost_unitari = 52.017
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%rellen%160%' OR name ILIKE '%colch%160%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%160%')
);
UPDATE components SET cost_unitari = 28.859
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%rellen%puff%' OR name ILIKE '%rellen%80x80%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%80%' AND name NOT ILIKE '%190%' AND name NOT ILIKE '%160%')
);

-- BUMBBA — Braços (escuma, INTERPLASP ~16,375 €/u)
UPDATE components SET cost_unitari = 16.375
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%brac%escum%' OR name ILIKE '%brazo%espum%' OR name ILIKE '%braç%rellen%' OR
  (name ILIKE '%brac%' AND (name ILIKE '%rellen%' OR name ILIKE '%espum%' OR name ILIKE '%interplasp%'))
);

-- BUMBBA — Caixes (Tarracó, 3,84 €/u)
UPDATE components SET cost_unitari = 3.84
WHERE tenant_id = 'BUMBBA' AND (
  name ILIKE '%caixa%' OR name ILIKE '%caja%' OR name ILIKE '%box%'
);

-- BUMBBA — Potes (LACATS VF)
UPDATE components SET cost_unitari = 10.00
WHERE tenant_id = 'BUMBBA' AND (
  (name ILIKE '%pot%' OR name ILIKE '%pata%') AND (name ILIKE '%gran%' OR name ILIKE '%large%' OR name ILIKE '%g%')
  AND name NOT ILIKE '%petit%'
);
UPDATE components SET cost_unitari = 8.80
WHERE tenant_id = 'BUMBBA' AND (
  (name ILIKE '%pot%' OR name ILIKE '%pata%') AND (name ILIKE '%petit%' OR name ILIKE '%small%' OR name ILIKE '%p%')
  AND name NOT ILIKE '%gran%'
);

-- SUNBBA — Fundes exteriors (FUNCOTEX)
UPDATE components SET cost_unitari = 35.71
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%funda%190%' OR (name ILIKE '%pico%' AND name ILIKE '%190%' AND name NOT ILIKE '%brac%' AND name NOT ILIKE '%interior%')
);
UPDATE components SET cost_unitari = 32.38
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%funda%160%' OR (name ILIKE '%pico%' AND name ILIKE '%160%' AND name NOT ILIKE '%brac%' AND name NOT ILIKE '%interior%')
);
UPDATE components SET cost_unitari = 26.01
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%funda%90%' OR name ILIKE '%funda%puff%' OR
  (name ILIKE '%pico%' AND name ILIKE '%90%' AND name NOT ILIKE '%190%' AND name NOT ILIKE '%160%' AND name NOT ILIKE '%brac%')
);

-- SUNBBA — Fundes braç (FUNCOTEX 28,01 €/u)
UPDATE components SET cost_unitari = 28.01
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%brac%' OR name ILIKE '%brazo%' OR name ILIKE '%braç%'
) AND (name ILIKE '%funda%' OR name ILIKE '%pico%');

-- SUNBBA — Rellens (INTERPLASP)
UPDATE components SET cost_unitari = 57.807
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%rellen%190%' OR name ILIKE '%colch%190%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%190%')
);
UPDATE components SET cost_unitari = 57.807
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%rellen%160%' OR name ILIKE '%colch%160%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%160%')
);
UPDATE components SET cost_unitari = 31.754
WHERE tenant_id = 'SUNBBA' AND (
  name ILIKE '%rellen%puff%' OR name ILIKE '%rellen%80%' OR
  (name ILIKE '%rellen%' AND name ILIKE '%90%' AND name NOT ILIKE '%190%' AND name NOT ILIKE '%160%')
);

-- SUNBBA — Etiquetes (FUNCOTEX 0,40 €/u)
UPDATE components SET cost_unitari = 0.40
WHERE tenant_id = 'SUNBBA' AND (name ILIKE '%etiquet%' OR name ILIKE '%label%');
