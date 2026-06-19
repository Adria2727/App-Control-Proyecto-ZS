-- ============================================================
-- COSTS UNITARIS PER COMPONENT — ZeroStock
-- Font: anàlisi factures de compra (juny 2026)
-- [C] = confirmat directament de factura amb preu explícit
-- [E] = estimat per proporció superfície/volum o extrapolació
-- ============================================================
-- Executar al SQL Editor de Supabase

-- ── LACATS VF — Estructures metàl·liques ─────────────────────
-- [C] AA.199: 54 L Gran × 10€ + 12 L Petita × 8,80€ = 645,60€ ✓
-- [C] AA.203: 330 L Gran × 10€ + 240 L Petita × 8,80€ + 380€ extra = 5.792€ ✓
UPDATE components SET cost_unitari = 10.00
WHERE name ILIKE '%L Gran%' AND category_code = 'ESTRUCTURES';

UPDATE components SET cost_unitari = 8.80
WHERE name ILIKE '%L Petita%' AND category_code = 'ESTRUCTURES';

-- [E] Braç: tipologia Lacats VF, estimat igual que L Gran
UPDATE components SET cost_unitari = 10.00
WHERE name ILIKE '%Braç%' AND category_code = 'ESTRUCTURES'
  AND name NOT ILIKE '%Funda%' AND name NOT ILIKE '%Enfundat%';

-- ── INTERPLASP — Matalassos i nuclis pouf ────────────────────
-- [C] 2600582: 80u matalàs 190 = 4.161,36€ → 52,02€/u
UPDATE components SET cost_unitari = 52.02
WHERE name ILIKE '%Matalàs 190%' AND category_code = 'MATALASSOS';

-- [E] Matalàs 160: proporció superfície 160/190 × 52,02 = 43,81€
UPDATE components SET cost_unitari = 43.85
WHERE name ILIKE '%Matalàs 160%' AND category_code = 'MATALASSOS';

-- [E] Nucli Pouf 80×80: proporció superfície vs matalàs 190×80
--     6400/15200 × 52,02 = 21,88€ ≈ 22€
UPDATE components SET cost_unitari = 22.00
WHERE name ILIKE '%Nucli Pouf%';

-- ── TARRACO CONFORT — Farcits de coixins ─────────────────────
-- [E] A1755: 150 BACKREST 860×230×460 + 20 MEDIUM 750×230×460 = 1.641€
--     Proporcional per volum → big = 9,80€, medium = 8,55€
UPDATE components SET cost_unitari = 9.80
WHERE name ILIKE '%Farcit Gran%';

UPDATE components SET cost_unitari = 8.55
WHERE name ILIKE '%Farcit Med%' OR name ILIKE '%Farcit Mitj%';

UPDATE components SET cost_unitari = 6.50
WHERE name ILIKE '%Farcit Petit%';

UPDATE components SET cost_unitari = 9.80
WHERE name ILIKE '%Farcit Rinconera%';

-- ── FUNCOTEX / TARRACO — Fundes tela (pana/pico) ─────────────
-- [C] 260554: 30 Fundes Braç (3 colors × 10u) = 437,70€ → 14,59€/u
UPDATE components SET cost_unitari = 14.59
WHERE name ILIKE '%Funda Braç%';

-- [E] Fundes matalàs pana exterior: estimació per superfície
UPDATE components SET cost_unitari = 20.00
WHERE name ILIKE '%Funda Matalàs 190%';

UPDATE components SET cost_unitari = 17.00
WHERE name ILIKE '%Funda Matalàs 160%';

-- [E] Fundes coixí: estimació per mida
UPDATE components SET cost_unitari = 14.50
WHERE name ILIKE '%Funda Coixí Gran%';

UPDATE components SET cost_unitari = 10.00
WHERE name ILIKE '%Funda Coixí Mitj%';

UPDATE components SET cost_unitari = 8.00
WHERE name ILIKE '%Funda Coixí Petit%';

-- [E] Rinconera: peça de forma especial, costura complexa
UPDATE components SET cost_unitari = 18.00
WHERE name ILIKE '%Funda Coixí Rinconera%';

-- [E] Funda Pouf exterior pana
UPDATE components SET cost_unitari = 12.00
WHERE name ILIKE '%Funda Pouf%' AND name NOT ILIKE '%Interior%';

-- [E] Funda interior pouf (poliester, menys cara)
UPDATE components SET cost_unitari = 4.00
WHERE name ILIKE '%Funda Interior Pouf%' OR name ILIKE '%Interior Pouf%';

-- ── PROVEÏDOR CAIXES — Embalatge ─────────────────────────────
-- [C] 2600000668: 255u × 3,84€ + cliché = 1.730,05€ ✓
-- [C] 2600000953: 219u × 3,84€ = 840,96€ ✓
UPDATE components SET cost_unitari = 3.84
WHERE (name ILIKE '%Caixa BUMBBA%' OR name ILIKE '%Caixa Bumbba%');

-- [E] Caixa SUNBBA: mateixa tipologia
UPDATE components SET cost_unitari = 3.84
WHERE (name ILIKE '%Caixa SUNBBA%' OR name ILIKE '%Caixa Sunbba%');

-- [E] Caixa Plain: sense impressió de marca, menys cost
UPDATE components SET cost_unitari = 2.50
WHERE name ILIKE '%Caixa Plain%';

-- [E] Caixa Pouf: mida reduïda
UPDATE components SET cost_unitari = 2.00
WHERE name ILIKE '%Caixa Pouf%';

-- ── FUNCOTEX — Etiquetes ──────────────────────────────────────
-- [C] 260650: 1.300u etiquetes SUNBBA = 520€ → 0,40€/u
UPDATE components SET cost_unitari = 0.40
WHERE name ILIKE '%Etiqueta%';

-- ── MATERIAL AUXILIAR — estimacions ──────────────────────────
-- [E] Potes: retroenginyeria BOM TB_IND (2L + 4 potes + caixa Plain)
UPDATE components SET cost_unitari = 1.50
WHERE name ILIKE '%Potes%' AND category_code = 'PATES';

-- [E] Cola calenta: consums per unitat de producció
UPDATE components SET cost_unitari = 1.00
WHERE name ILIKE '%Cola%';

-- [E] Bossa al buit: embalatge secundari
UPDATE components SET cost_unitari = 0.30
WHERE name ILIKE '%Bossa%';

-- [E] Manuals: impresos (ES, EN, base, pouf)
UPDATE components SET cost_unitari = 0.50
WHERE name ILIKE '%Manual%';

-- ── VERIFICACIÓ ───────────────────────────────────────────────
-- Descomenta per veure resultats:
-- SELECT name, tenant_id, category_code, cost_unitari
-- FROM components
-- WHERE cost_unitari > 0
-- ORDER BY cost_unitari DESC, name;
--
-- SELECT count(*) AS "sense cost", tenant_id
-- FROM components WHERE cost_unitari = 0
-- GROUP BY tenant_id;
