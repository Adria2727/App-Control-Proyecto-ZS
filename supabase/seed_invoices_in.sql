-- ============================================================
-- FACTURES DE COMPRA (invoices_in) — ZeroStock
-- Font: Google Drive carpeta factures de compres
-- Generat: 2026-06-19
-- IMPORTANT: Aquestes factures NO afecten l'inventari.
--            Són NOMÉS per a l'apartat de costos/marges/finances.
-- ============================================================

INSERT INTO invoices_in
  (invoice_number, invoice_date, supplier, category,
   base_amount, vat_pct, vat_amount, total_amount,
   due_date, paid_date, status, notes)
VALUES

-- ============================================================
-- FUNCOTEX — Fundes exteriors, interiors, braços, etiquetes
-- ============================================================
('260203', '2026-02-19', 'FUNCOTEX', 'fundes',
 68.66, 21, 14.42, 83.08,
 '2026-04-20', NULL, 'overdue',
 'Mostres fundes BUMBBA pana verde + mostra genèrica braç'),

('260369', '2026-03-30', 'FUNCOTEX', 'fundes',
 14.59, 21, 3.06, 17.65,
 '2026-05-29', NULL, 'overdue',
 'Mostra genèrica funda braç 080X062X22'),

('260457', '2026-04-17', 'FUNCOTEX', 'fundes',
 5631.36, 21, 1182.59, 6813.95,
 '2026-06-16', NULL, 'overdue',
 'Fundes BUMBBA pana verde/gris 190x80 + fundes interiors poliester 80/160/190'),

('260479', '2026-04-22', 'FUNCOTEX', 'fundes',
 6960.30, 21, 1461.66, 8421.96,
 '2026-06-21', NULL, 'pending',
 'Fundes BUMBBA pana verde/gris/pedra 190/160/80x80'),

('260554', '2026-05-06', 'FUNCOTEX', 'fundes',
 437.70, 21, 91.92, 529.62,
 '2026-07-05', NULL, 'pending',
 'Fundes braç BUMBBA pana verde/gris/pedra 062X078 x10 cada'),

('260555', '2026-05-06', 'FUNCOTEX', 'fundes',
 8292.72, 21, 1741.47, 10034.19,
 '2026-07-05', NULL, 'pending',
 'Fundes BUMBBA pana verde (224u 190+54u 80) + fundes braç (36u cada color) + SUNBBA pico 04/37/99'),

('260650', '2026-05-26', 'FUNCOTEX', 'etiquetes',
 520.00, 21, 109.20, 629.20,
 '2026-07-25', NULL, 'pending',
 'Etiquetes TC SUNBBA x1300u'),

('260703', '2026-06-05', 'FUNCOTEX', 'fundes',
 14651.03, 21, 3076.72, 17727.75,
 '2026-08-04', NULL, 'pending',
 'Fundes SUNBBA pico 04/37/82/99 colchon 190/160/90 + fundes braç SUNBBA x54u'),

-- ============================================================
-- INTERPLASP — Matalassos/colchons i rellens puffs
-- ============================================================
('2600582', '2026-04-29', 'INTERPLASP', 'rellens',
 4161.36, 21, 873.89, 5035.25,
 '2026-05-30', NULL, 'overdue',
 'Colchons 190X80X22 BUMBBA verde oliva (50u) + gris (30u)'),

('2600895', '2026-05-11', 'INTERPLASP', 'rellens',
 16574.19, 21, 3480.58, 20054.77,
 '2026-06-11', NULL, 'overdue',
 'Colchons 190/160X80 BUMBBA (verde/gris/pedra) + puffs 80X80 BUMBBA x16 cada color'),

('2601483', '2026-06-10', 'INTERPLASP', 'rellens',
 5179.97, 21, 1087.79, 6267.76,
 '2026-07-11', NULL, 'pending',
 'Braços SUNBBA 78X61.5 (verde/gris/pedra) + colchon BUMBBA 190 + puff BUMBBA + colchons SUNBBA 190/160 + puff SUNBBA'),

-- ============================================================
-- TARRACO CONFORT UPHOLSTERY — Teixits, coixins, farcits
-- ============================================================
('2026-A1539', '2026-03-18', 'TARRACO CONFORT UPHOLSTERY', 'textils',
 11140.00, 21, 2339.40, 13479.40,
 '2026-03-18', '2026-03-18', 'paid',
 'Fundes textils i coixins (lot) + transport importació 2.950€'),

('2026-A1622', '2026-05-08', 'TARRACO CONFORT UPHOLSTERY', 'textils',
 14079.00, 21, 2956.59, 17035.59,
 '2026-05-08', '2026-05-08', 'paid',
 'Teixits PICO 04/82/37/99 i PANA verde/olive/dark + farcits coixins PUMMBA big/small/corner + fundes coixins BB pana + embalatge x12 + transport 1.950€'),

('2026-A1755', '2026-06-18', 'TARRACO CONFORT UPHOLSTERY', 'textils',
 1641.00, 21, 344.61, 1985.61,
 '2026-06-18', NULL, 'pending',
 'PUMMBA BACKREST PILLOW 860X230X460 x150 + MEDIUM 750X230X460 x20'),

-- ============================================================
-- LACATS VF — Potes (curvas grandes/petites) i estructures
-- ============================================================
('2026-AA.199', '2026-05-18', 'LACATS VF', 'potes',
 645.60, 21, 135.58, 781.18,
 '2026-07-02', NULL, 'pending',
 'Curvas grandes RAL 7016 x17 + RAL 1013 x37 (10€/u), Curvas petites RAL 1013 x12 (8,80€/u)'),

('2026-AA.203', '2026-05-28', 'LACATS VF', 'potes',
 5792.00, 21, 1216.32, 7008.32,
 '2026-05-28', NULL, 'overdue',
 'LS grandes RAL 7016x140 + RAL 1013x190 (10€) + LS petites RAL 7016x110 + RAL 1013x130 (8,80€) + prototip carro 310€ + viatge 70€'),

('2026-AA.252', '2026-06-18', 'LACATS VF', 'potes',
 1598.00, 21, 335.58, 1933.58,
 '2026-08-02', NULL, 'pending',
 'Potes grandes/petites RAL 6025/1013/7035/7043 x130u cada + portes 70€'),

-- ============================================================
-- CATALA PROMOCIONS 2005 — Assessorament
-- ============================================================
('2604', '2026-03-31', 'CATALA PROMOCIONS 2005', 'assessorament',
 2131.00, 21, 447.51, 2578.51,
 NULL, NULL, 'pending',
 'Assessorament'),

('26006', '2026-04-30', 'CATALA PROMOCIONS 2005', 'assessorament',
 5514.00, 21, 1157.94, 6671.94,
 NULL, NULL, 'pending',
 'Assessorament'),

-- ============================================================
-- Proveïdor Caixes — Caixes cartró BUMBBA/SUNBBA
-- ============================================================
('2600000668', '2026-03-12', 'Proveïdor Caixes', 'caixes',
 1730.05, 21, 363.31, 2093.36,
 '2026-05-15', NULL, 'overdue',
 'BUMBBA 1 UNIT BOX x255 (3,84€) + cliché BUMBBA 1 UNIT BOX x1 (750,85€)'),

('2600000953', '2026-04-16', 'Proveïdor Caixes', 'caixes',
 840.96, 21, 176.60, 1017.56,
 '2026-06-15', NULL, 'overdue',
 'BUMBBA 1 UNIT BOX x219 (3,84€/u)'),

('2600001715', '2026-06-18', 'Proveïdor Caixes', 'caixes',
 3034.72, 21, 637.29, 3672.01,
 '2026-08-25', NULL, 'pending',
 'BUMBBA 1 UNIT BOX x1058 + SUNBBA cliché x193'),

-- ============================================================
-- Proveïdors petits / material auxiliar
-- ============================================================
('FME26001162', '2026-03-15', 'FERRE ANELL', 'altres',
 30.00, 21, 6.30, 36.30,
 '2026-05-15', NULL, 'overdue',
 'Lloguer Karcher HDS 6/16 1 dia'),

('AL/41713', '2026-02-28', 'EBRE POOL', 'altres',
 28.57, 21, 6.00, 34.57,
 '2026-04-15', NULL, 'overdue',
 'Material ferreteria/fontaneria (arandeles, tubs PVC, cables)'),

('AL/41897', '2026-03-15', 'EBRE POOL', 'altres',
 44.09, 21, 9.26, 53.35,
 '2026-04-15', NULL, 'overdue',
 'Material fontaneria/ferreteria (adaptadors, manguera, tub PVC 90mm, traje agua)'),

('1421', '2026-02-28', 'MJ LLOMBART', 'altres',
 13.50, 21, 2.84, 16.34,
 NULL, '2026-02-28', 'paid',
 'Lloguer taladradora elèctrica Hitachi 1 dia (giro a la vista)'),

('F12600609', '2026-04-15', 'SUIMPLAST', 'altres',
 49.01, 21, 10.29, 59.30,
 '2026-06-14', NULL, 'overdue',
 'Tub PVC sanitari 315mm 3m'),

('A077569', '2026-06-05', 'FERRETERIA CASTILLO SERRA', 'altres',
 12.28, 21, 2.58, 14.86,
 '2026-06-05', NULL, 'overdue',
 'Juntes, broca paret widia 6mm'),

('FA0043322026A000224', '2026-04-30', 'CTT EXPRESS', 'transport',
 45.22, 21, 9.50, 54.72,
 '2026-05-30', NULL, 'overdue',
 'Enviaments e-commerce x5 paquets (excés mesures longitud)');
