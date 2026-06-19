-- ============================================================
-- COSTS UNITARIS PER COMPONENT — ZeroStock
-- Font: lectura directa de totes les factures de compra (juny 2026)
-- TOTS els preus son [C] = confirmats de factura real amb preu/u explícit
-- Excepcions marcades amb [E] = estimat
-- ============================================================

-- ── LACATS VF — Estructures metàl·liques en L ────────────────
-- AA.199: L Gran (RAL 7016 x17 + RAL 1013 x37) × 10€/u = 540€ ✓
-- AA.203: L Gran 330u × 10€ = 3.300€ ✓ ; AA.252: 100u × 10€ ✓
UPDATE components SET cost_unitari = 10.00
WHERE name ILIKE '%L Gran%' AND category_code = 'ESTRUCTURES';

-- AA.199: L Petita RAL 1013 x12 × 8,80€ = 105,60€ ✓
-- AA.203: L Petita 240u × 8,80€ = 2.112€ ✓ ; AA.252: 60u × 8,80€ ✓
UPDATE components SET cost_unitari = 8.80
WHERE name ILIKE '%L Petita%' AND category_code = 'ESTRUCTURES';

-- [E] Braç BUMBBA: tipologia Lacats VF (peça metàl·lica), estimat com L Gran
UPDATE components SET cost_unitari = 10.00
WHERE name ILIKE '%Braç%' AND category_code = 'ESTRUCTURES'
  AND tenant_id = 'BUMBBA'
  AND name NOT ILIKE '%Funda%' AND name NOT ILIKE '%Enfundat%';

-- INTERPLASP 2601483: Braç SUNBBA 78×61.5×22 × 16,375€/u ✓
-- (3 colors × 26u aprox = 425,75€ / 16,375 cada)
UPDATE components SET cost_unitari = 16.38
WHERE name ILIKE '%Braç%' AND category_code = 'ESTRUCTURES'
  AND tenant_id = 'SUNBBA'
  AND name NOT ILIKE '%Funda%' AND name NOT ILIKE '%Enfundat%';

-- ── INTERPLASP — Matalassos i nuclis pouf ────────────────────
-- 2600582: Matalàs BUMBBA 190×80×22 FUNDA+ENROLLADO: 52,017€/u ✓
--   (50u verde 2600,85€ + 30u gris 1560,51€ = 80u × 52,017€)
-- 2600895: Matalàs BUMBBA 190×80 Gris 52,017€, Pedra 52,017€ ✓
UPDATE components SET cost_unitari = 52.02
WHERE name ILIKE '%Matalàs 190%' AND tenant_id = 'BUMBBA';

-- 2600895: Matalàs BUMBBA 160×80×22 = 52,017€/u ✓ (igual que 190)
--   21u verde 1092,36€ / 52,017 = 21u ✓
UPDATE components SET cost_unitari = 52.02
WHERE name ILIKE '%Matalàs 160%' AND tenant_id = 'BUMBBA';

-- 2601483: Matalàs SUNBBA 190×90×22 FUNDA+ENROLLADO = 57,807€/u ✓
UPDATE components SET cost_unitari = 57.81
WHERE name ILIKE '%Matalàs 190%' AND tenant_id = 'SUNBBA';

-- 2601483: Matalàs SUNBBA 160×90×22 = 57,807€/u ✓ (igual que 190 en SUNBBA)
UPDATE components SET cost_unitari = 57.81
WHERE name ILIKE '%Matalàs 160%' AND tenant_id = 'SUNBBA';

-- 2600895: Pouf BUMBBA 80×80 BB-F002 = 28,859€/u ✓
--   (16u verde 461,74€ / 28,859 = 16u ✓)
UPDATE components SET cost_unitari = 28.86
WHERE name ILIKE '%Nucli Pouf%' AND tenant_id = 'BUMBBA';

-- 2601483: Pouf SUNBBA 80×90 BB-F002 = 31,754€/u ✓
UPDATE components SET cost_unitari = 31.75
WHERE name ILIKE '%Nucli Pouf%' AND tenant_id = 'SUNBBA';

-- ── FUNCOTEX — Fundes matalàs i braç (exterior tela) ─────────
-- 260457/260479/260555: FUNDA S/A BUMBBA PANA VERDE/GRIS/PIEDRA 080X190X22 = 19,74€/u ✓
UPDATE components SET cost_unitari = 19.74
WHERE name ILIKE '%Funda Matalàs 190%' AND tenant_id = 'BUMBBA';

-- 260457/260479: FUNDA S/A BUMBBA PANA 080X160X22 = 18,72€/u ✓
UPDATE components SET cost_unitari = 18.72
WHERE name ILIKE '%Funda Matalàs 160%' AND tenant_id = 'BUMBBA';

-- 260703: FUNDA S/A SUNBBA PICO 04/37/82/99 090X190X22 = 35,71€/u ✓
UPDATE components SET cost_unitari = 35.71
WHERE name ILIKE '%Funda Matalàs 190%' AND tenant_id = 'SUNBBA';

-- 260703: FUNDA S/A SUNBBA PICO 04/37/82/99 090X160X22 = 32,38€/u ✓
UPDATE components SET cost_unitari = 32.38
WHERE name ILIKE '%Funda Matalàs 160%' AND tenant_id = 'SUNBBA';

-- 260479/260555: FUNDA S/A BUMBBA PANA 080X080X22 (pouf exterior) = 16,34€/u ✓
UPDATE components SET cost_unitari = 16.34
WHERE name ILIKE '%Funda Pouf%' AND tenant_id = 'BUMBBA'
  AND name NOT ILIKE '%Interior%';

-- 260703: FUNDA S/A SUNBBA PICO 37 GREEN 080X080X22 (pouf 80×80) = 25,10€/u ✓
-- (080×090 1-seater SUNBBA = 26,01€ — però per pouf usem 080×080 = 25,10€)
UPDATE components SET cost_unitari = 25.10
WHERE name ILIKE '%Funda Pouf%' AND tenant_id = 'SUNBBA'
  AND name NOT ILIKE '%Interior%';

-- 260457: FUNDA INTERIOR PUNTO POLIESTER 080×080/160/190×22 = 2,88€/u ✓ (totes les mides igual)
UPDATE components SET cost_unitari = 2.88
WHERE name ILIKE '%Interior Pouf%' OR name ILIKE '%Interior%Pouf%'
  OR name ILIKE '%Funda Interior%';

-- 260554/260203/260555: FUNDA S/A BRAZO BUMBBA PANA 062X078X22 = 14,59€/u ✓
UPDATE components SET cost_unitari = 14.59
WHERE name ILIKE '%Funda Braç%' AND tenant_id = 'BUMBBA';

-- 260703: FUNDA S/A BRAZO SUNBBA PICO 04/37/82/99 062X088X22 = 28,01€/u ✓
UPDATE components SET cost_unitari = 28.01
WHERE name ILIKE '%Funda Braç%' AND tenant_id = 'SUNBBA';

-- ── TARRACO CONFORT — Farcits de coixins (PUMMBA) ────────────
-- A1622: PUMMBA BACKREST PILLOW (860×230×460) = 9,75€/u ✓
-- A1755: confirmat x2 = 9,75€/u ✓
UPDATE components SET cost_unitari = 9.75
WHERE name ILIKE '%Farcit Gran%';

-- A1755: PUMMBA BACKREST PILLOW MEDIUM (750×230×460) = 8,925€/u ✓
UPDATE components SET cost_unitari = 8.93
WHERE name ILIKE '%Farcit Med%' OR name ILIKE '%Farcit Mitj%';

-- A1622: PUMMBA SMALL PILLOW AUX (520×260×120) = 4,053€/u ✓
UPDATE components SET cost_unitari = 4.05
WHERE name ILIKE '%Farcit Petit%';

-- A1622: PUMMBA CORNER PILLOW (UNIVERSAL) = 8,99€/u ✓
UPDATE components SET cost_unitari = 8.99
WHERE name ILIKE '%Farcit Rinconera%';

-- ── TARRACO CONFORT — Fundes tela coixins (BMB TEXTILE COVER) ─
-- A1622: BMB TEXTILE COVER BIG PILLOW PANA/PICO = 3,024€/u ✓
UPDATE components SET cost_unitari = 3.02
WHERE name ILIKE '%Funda Coixí Gran%';

-- A1622: BMB TEXTILE COVER MEDIUM PILLOW = 3,024€/u ✓
UPDATE components SET cost_unitari = 3.02
WHERE name ILIKE '%Funda Coixí Mitj%';

-- A1622: BMB TEXTILE COVER MINI PILLOW PANA/PICO = 1,533€/u ✓
UPDATE components SET cost_unitari = 1.53
WHERE name ILIKE '%Funda Coixí Petit%';

-- A1622: BMB CORNER PILLOW SET L+R = 3,2235€/u ✓ (set esquerra+dreta)
UPDATE components SET cost_unitari = 3.22
WHERE name ILIKE '%Funda Coixí Rinconera%';

-- ── PROVEÏDOR CAIXES — Embalatge ─────────────────────────────
-- 2600000668: BUMBBA 1 UNIT BOX × 255 × 3,84€ = 979,20€ ✓
-- 2600000953: BUMBBA 1 UNIT BOX × 219 × 3,84€ = 840,96€ ✓
UPDATE components SET cost_unitari = 3.84
WHERE name ILIKE '%Caixa BUMBBA%' OR name ILIKE '%Caixa Bumbba%';

-- [E] Caixa SUNBBA: mateixa tipologia/proveïdor
UPDATE components SET cost_unitari = 3.84
WHERE name ILIKE '%Caixa SUNBBA%' OR name ILIKE '%Caixa Sunbba%';

-- [E] Caixa Plain: sense impressió de marca
UPDATE components SET cost_unitari = 2.50
WHERE name ILIKE '%Caixa Plain%';

-- [E] Caixa Pouf: mida reduïda
UPDATE components SET cost_unitari = 2.00
WHERE name ILIKE '%Caixa Pouf%';

-- ── FUNCOTEX — Etiquetes ──────────────────────────────────────
-- 260650: ETIQUETA TC SUNBBA × 1.300u × 0,40€ = 520,00€ ✓
UPDATE components SET cost_unitari = 0.40
WHERE name ILIKE '%Etiqueta%';

-- ── MATERIAL AUXILIAR ─────────────────────────────────────────
-- [E] Potes: estimació per retroenginyeria BOM TB_IND
UPDATE components SET cost_unitari = 1.50
WHERE name ILIKE '%Potes%' AND category_code = 'PATES';

-- [E] Cola calenta: consum per unitat de producció
UPDATE components SET cost_unitari = 1.00
WHERE name ILIKE '%Cola%';

-- [E] Bossa al buit: embalatge secundari
UPDATE components SET cost_unitari = 0.30
WHERE name ILIKE '%Bossa%';

-- [E] Manuals: impresos
UPDATE components SET cost_unitari = 0.50
WHERE name ILIKE '%Manual%';

-- ── VERIFICACIÓ (descomenta per comprovar) ────────────────────
-- SELECT name, tenant_id, cost_unitari
-- FROM components WHERE cost_unitari > 0
-- ORDER BY cost_unitari DESC, tenant_id, name;
--
-- SELECT count(*) AS sense_cost, tenant_id
-- FROM components WHERE cost_unitari = 0
-- GROUP BY tenant_id;
