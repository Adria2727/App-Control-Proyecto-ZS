-- ============================================================
-- SEED INVENTARI — ZeroStock (BUMBBA + SUNBBA)
-- Executa al SQL Editor de Supabase
-- Dades reals a 2026-06-18
-- ============================================================

-- ============================================================
-- BUMBBA — COMPONENTS
-- ============================================================

-- FARCITS / NUCLIS (ALTRES)
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('FARCIT_GR',       'Farcit Gran',              'BUMBBA', 'ALTRES', NULL,  250, 0),
('FARCIT_PT',       'Farcit Petit',             'BUMBBA', 'ALTRES', NULL,  272, 0),
('FARCIT_CR_M',     'Farcit Medi',              'BUMBBA', 'ALTRES', NULL,   37, 0),
('FARCIT_RAC',      'Farcit Rinconera',         'BUMBBA', 'ALTRES', NULL,   14, 0),
('HOTGLUE',         'Cola calenta (tires)',      'BUMBBA', 'ALTRES', NULL,  300, 0),
('BB_NUCLI_PVC',    'Nucli Pouf Light Green',   'BUMBBA', 'ALTRES', 'PVC',  16, 0),
('BB_NUCLI_PGC',    'Nucli Pouf Arctic Sand',   'BUMBBA', 'ALTRES', 'PGC',  32, 0),
('BB_NUCLI_PGO',    'Nucli Pouf Shadow Grey',   'BUMBBA', 'ALTRES', 'PGO',  30, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- FUNDES / TELA (TELA)
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('BB_FUN_GR_PVC',      'Funda Coixí Gran Light Green',       'BUMBBA', 'TELA', 'PVC',  61, 0),
('BB_FUN_GR_PGC',      'Funda Coixí Gran Arctic Sand',       'BUMBBA', 'TELA', 'PGC',  89, 0),
('BB_FUN_GR_PGO',      'Funda Coixí Gran Shadow Grey',       'BUMBBA', 'TELA', 'PGO', 100, 0),
('BB_FUN_PT_PVC',      'Funda Coixí Petit Light Green',      'BUMBBA', 'TELA', 'PVC',  71, 0),
('BB_FUN_PT_PGC',      'Funda Coixí Petit Arctic Sand',      'BUMBBA', 'TELA', 'PGC', 100, 0),
('BB_FUN_PT_PGO',      'Funda Coixí Petit Shadow Grey',      'BUMBBA', 'TELA', 'PGO', 100, 0),
('BB_FUN_MJ_PVC',      'Funda Coixí Mitjà Light Green',      'BUMBBA', 'TELA', 'PVC',  13, 0),
('BB_FUN_MJ_PGC',      'Funda Coixí Mitjà Arctic Sand',      'BUMBBA', 'TELA', 'PGC',  12, 0),
('BB_FUN_MJ_PGO',      'Funda Coixí Mitjà Shadow Grey',      'BUMBBA', 'TELA', 'PGO',  12, 0),
('BB_FUN_RAC_PVC',     'Funda Coixí Rinconera Light Green',  'BUMBBA', 'TELA', 'PVC',   4, 0),
('BB_FUN_RAC_PGC',     'Funda Coixí Rinconera Arctic Sand',  'BUMBBA', 'TELA', 'PGC',   5, 0),
('BB_FUN_RAC_PGO',     'Funda Coixí Rinconera Shadow Grey',  'BUMBBA', 'TELA', 'PGO',   5, 0),
('BB_FUN_MAT190_PVC',  'Funda Matalàs 190 Light Green',      'BUMBBA', 'TELA', 'PVC',   6, 0),
('BB_FUN_MAT190_PGC',  'Funda Matalàs 190 Arctic Sand',      'BUMBBA', 'TELA', 'PGC',   0, 0),
('BB_FUN_MAT190_PGO',  'Funda Matalàs 190 Shadow Grey',      'BUMBBA', 'TELA', 'PGO',  10, 0),
('BB_FUN_MAT160_PVC',  'Funda Matalàs 160 Light Green',      'BUMBBA', 'TELA', 'PVC',  10, 0),
('BB_FUN_MAT160_PGC',  'Funda Matalàs 160 Arctic Sand',      'BUMBBA', 'TELA', 'PGC',  10, 0),
('BB_FUN_MAT160_PGO',  'Funda Matalàs 160 Shadow Grey',      'BUMBBA', 'TELA', 'PGO',  10, 0),
('BB_FUN_BRAC_PVC',    'Funda Braç Light Green',             'BUMBBA', 'TELA', 'PVC',  10, 0),
('BB_FUN_BRAC_PGC',    'Funda Braç Arctic Sand',             'BUMBBA', 'TELA', 'PGC',  10, 0),
('BB_FUN_BRAC_PGO',    'Funda Braç Shadow Grey',             'BUMBBA', 'TELA', 'PGO',  10, 0),
('BB_FUN_POUF_PVC',    'Funda Pouf Light Green',             'BUMBBA', 'TELA', 'PVC',  10, 0),
('BB_FUN_POUF_PGC',    'Funda Pouf Arctic Sand',             'BUMBBA', 'TELA', 'PGC',  10, 0),
('BB_FUN_POUF_PGO',    'Funda Pouf Shadow Grey',             'BUMBBA', 'TELA', 'PGO',  10, 0),
('BB_FUN_INT_POUF',    'Funda Interior Pouf',                'BUMBBA', 'TELA', NULL,    0, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- ESTRUCTURES "L" i BRAÇOS (ESTRUCTURES)
-- Color codes L: VC=Light Green · GC=Arctic Sand · GO=Shadow Grey · GR=Dark Grey · BG=Beige
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('BB_L_GR_VC',   'L Gran Light Green',   'BUMBBA', 'ESTRUCTURES', 'VC',  60, 0),
('BB_L_GR_GC',   'L Gran Arctic Sand',   'BUMBBA', 'ESTRUCTURES', 'GC',  46, 0),
('BB_L_GR_GO',   'L Gran Shadow Grey',   'BUMBBA', 'ESTRUCTURES', 'GO',  33, 0),
('BB_L_GR_GR',   'L Gran Dark Grey',     'BUMBBA', 'ESTRUCTURES', 'GR',  59, 0),
('BB_L_GR_BG',   'L Gran Beige',         'BUMBBA', 'ESTRUCTURES', 'BG',  92, 0),
('BB_L_PT_VC',   'L Petita Light Green', 'BUMBBA', 'ESTRUCTURES', 'VC',  62, 0),
('BB_L_PT_GC',   'L Petita Arctic Sand', 'BUMBBA', 'ESTRUCTURES', 'GC',  46, 0),
('BB_L_PT_GO',   'L Petita Shadow Grey', 'BUMBBA', 'ESTRUCTURES', 'GO',  34, 0),
('BB_L_PT_GR',   'L Petita Dark Grey',   'BUMBBA', 'ESTRUCTURES', 'GR',  79, 0),
('BB_L_PT_BG',   'L Petita Beige',       'BUMBBA', 'ESTRUCTURES', 'BG',  94, 0),
('BB_BRAC_VC',   'Braç Light Green',     'BUMBBA', 'ESTRUCTURES', 'VC',  24, 0),
('BB_BRAC_GC',   'Braç Arctic Sand',     'BUMBBA', 'ESTRUCTURES', 'GC',  22, 0),
('BB_BRAC_GO',   'Braç Shadow Grey',     'BUMBBA', 'ESTRUCTURES', 'GO',  20, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- MATALASSOS (MATALASSOS)
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('BB_MAT190_PVC', 'Matalàs 190 Light Green',   'BUMBBA', 'MATALASSOS', 'PVC', 40, 0),
('BB_MAT190_PGC', 'Matalàs 190 Arctic Sand',   'BUMBBA', 'MATALASSOS', 'PGC', 59, 0),
('BB_MAT190_PGO', 'Matalàs 190 Shadow Grey',   'BUMBBA', 'MATALASSOS', 'PGO', 32, 0),
('BB_MAT160_PVC', 'Matalàs 160 Light Green',   'BUMBBA', 'MATALASSOS', 'PVC', 17, 0),
('BB_MAT160_PGC', 'Matalàs 160 Arctic Sand',   'BUMBBA', 'MATALASSOS', 'PGC', 17, 0),
('BB_MAT160_PGO', 'Matalàs 160 Shadow Grey',   'BUMBBA', 'MATALASSOS', 'PGO', 21, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- POTES (PATES)
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('BB_POT_BL', 'Potes Blanques', 'BUMBBA', 'PATES', NULL, 304, 0),
('BB_POT_NG', 'Potes Negres',   'BUMBBA', 'PATES', NULL, 408, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- EMBALATGE
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('BB_CAIXA',      'Caixa BUMBBA',       'BUMBBA', 'EMBALATGE', NULL,  260, 0),
('BB_CAIXA_PL',   'Caixa Plain',        'BUMBBA', 'EMBALATGE', NULL,  -16, 0),
('BB_CAIXA_POUF', 'Caixa Pouf',         'BUMBBA', 'EMBALATGE', NULL,  -17, 0),
('BB_BOSSA',      'Bossa al buit',      'BUMBBA', 'EMBALATGE', NULL,  428, 0),
('BB_MAN_ES',     'Manual BUMBBA (ES)', 'BUMBBA', 'EMBALATGE', NULL,  184, 0),
('BB_MAN_EN',     'Manual BUMBBA (EN)', 'BUMBBA', 'EMBALATGE', NULL,  190, 0),
('BB_MAN_BASE',   'Manual BUMBBA (base)','BUMBBA','EMBALATGE', NULL,  -74, 0),
('BB_MAN_POUF',   'Manual Pouf/Braços', 'BUMBBA', 'EMBALATGE', NULL,    0, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- COIXINS MUNTATS — buffer KANBAN (normalment 0)
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('BB_COI_GR_PVC',  'Coixí Gran Muntat Light Green',      'BUMBBA', 'COIXINS', 'PVC', 0, 0),
('BB_COI_GR_PGC',  'Coixí Gran Muntat Arctic Sand',      'BUMBBA', 'COIXINS', 'PGC', 0, 0),
('BB_COI_GR_PGO',  'Coixí Gran Muntat Shadow Grey',      'BUMBBA', 'COIXINS', 'PGO', 0, 0),
('BB_COI_MJ_PVC',  'Coixí Mitjà Muntat Light Green',     'BUMBBA', 'COIXINS', 'PVC', 0, 0),
('BB_COI_MJ_PGC',  'Coixí Mitjà Muntat Arctic Sand',     'BUMBBA', 'COIXINS', 'PGC', 0, 0),
('BB_COI_MJ_PGO',  'Coixí Mitjà Muntat Shadow Grey',     'BUMBBA', 'COIXINS', 'PGO', 0, 0),
('BB_COI_PT_PVC',  'Coixí Petit Muntat Light Green',     'BUMBBA', 'COIXINS', 'PVC', 0, 0),
('BB_COI_PT_PGC',  'Coixí Petit Muntat Arctic Sand',     'BUMBBA', 'COIXINS', 'PGC', 0, 0),
('BB_COI_PT_PGO',  'Coixí Petit Muntat Shadow Grey',     'BUMBBA', 'COIXINS', 'PGO', 0, 0),
('BB_COI_RAC_PVC', 'Coixí Rinconera Muntat Light Green', 'BUMBBA', 'COIXINS', 'PVC', 0, 0),
('BB_COI_RAC_PGC', 'Coixí Rinconera Muntat Arctic Sand', 'BUMBBA', 'COIXINS', 'PGC', 0, 0),
('BB_COI_RAC_PGO', 'Coixí Rinconera Muntat Shadow Grey', 'BUMBBA', 'COIXINS', 'PGO', 0, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- ============================================================
-- SUNBBA — COMPONENTS
-- Colors: PC04=Light Ivory · PC37=Green Olive · PC82=Grey Stone · PC99=Graphite Grey
-- ============================================================

-- FUNDES coixí (TELA)
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('SB_FUN_GR_PC04',  'Funda Coixí Gran Light Ivory',       'SUNBBA', 'TELA', 'PC04', 56, 0),
('SB_FUN_GR_PC37',  'Funda Coixí Gran Green Olive',       'SUNBBA', 'TELA', 'PC37', 38, 0),
('SB_FUN_GR_PC82',  'Funda Coixí Gran Grey Stone',        'SUNBBA', 'TELA', 'PC82', 32, 0),
('SB_FUN_GR_PC99',  'Funda Coixí Gran Graphite Grey',     'SUNBBA', 'TELA', 'PC99', 32, 0),
('SB_FUN_PT_PC04',  'Funda Coixí Petit Light Ivory',      'SUNBBA', 'TELA', 'PC04', 28, 0),
('SB_FUN_PT_PC37',  'Funda Coixí Petit Green Olive',      'SUNBBA', 'TELA', 'PC37', 20, 0),
('SB_FUN_PT_PC82',  'Funda Coixí Petit Grey Stone',       'SUNBBA', 'TELA', 'PC82', 16, 0),
('SB_FUN_PT_PC99',  'Funda Coixí Petit Graphite Grey',    'SUNBBA', 'TELA', 'PC99', 16, 0),
('SB_FUN_MJ_PC04',  'Funda Coixí Mitjà Light Ivory',      'SUNBBA', 'TELA', 'PC04', 16, 0),
('SB_FUN_MJ_PC37',  'Funda Coixí Mitjà Green Olive',      'SUNBBA', 'TELA', 'PC37', 10, 0),
('SB_FUN_MJ_PC82',  'Funda Coixí Mitjà Grey Stone',       'SUNBBA', 'TELA', 'PC82',  8, 0),
('SB_FUN_MJ_PC99',  'Funda Coixí Mitjà Graphite Grey',    'SUNBBA', 'TELA', 'PC99',  8, 0),
-- Fundes matalàs (totes a 0 — encara no proveïdes)
('SB_FUN_MAT190_PC04','Funda Matalàs 190 Light Ivory',    'SUNBBA', 'TELA', 'PC04',  0, 0),
('SB_FUN_MAT190_PC37','Funda Matalàs 190 Green Olive',    'SUNBBA', 'TELA', 'PC37',  0, 0),
('SB_FUN_MAT190_PC82','Funda Matalàs 190 Grey Stone',     'SUNBBA', 'TELA', 'PC82',  0, 0),
('SB_FUN_MAT190_PC99','Funda Matalàs 190 Graphite Grey',  'SUNBBA', 'TELA', 'PC99',  0, 0),
('SB_FUN_MAT160_PC04','Funda Matalàs 160 Light Ivory',    'SUNBBA', 'TELA', 'PC04',  0, 0),
('SB_FUN_MAT160_PC37','Funda Matalàs 160 Green Olive',    'SUNBBA', 'TELA', 'PC37',  0, 0),
('SB_FUN_MAT160_PC82','Funda Matalàs 160 Grey Stone',     'SUNBBA', 'TELA', 'PC82',  0, 0),
('SB_FUN_MAT160_PC99','Funda Matalàs 160 Graphite Grey',  'SUNBBA', 'TELA', 'PC99',  0, 0),
('SB_FUN_POUF_PC04', 'Funda Pouf Light Ivory',            'SUNBBA', 'TELA', 'PC04',  0, 0),
('SB_FUN_POUF_PC37', 'Funda Pouf Green Olive',            'SUNBBA', 'TELA', 'PC37',  0, 0),
('SB_FUN_POUF_PC82', 'Funda Pouf Grey Stone',             'SUNBBA', 'TELA', 'PC82',  0, 0),
('SB_FUN_POUF_PC99', 'Funda Pouf Graphite Grey',          'SUNBBA', 'TELA', 'PC99',  0, 0),
('SB_FUN_INT_POUF',  'Funda Interior Pouf',               'SUNBBA', 'TELA', NULL,    0, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- NUCLIS POUF + COLA (ALTRES)
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('SB_NUCLI_PC04', 'Nucli Pouf Light Ivory',    'SUNBBA', 'ALTRES', 'PC04',  6, 0),
('SB_NUCLI_PC37', 'Nucli Pouf Green Olive',    'SUNBBA', 'ALTRES', 'PC37',  0, 0),
('SB_NUCLI_PC82', 'Nucli Pouf Grey Stone',     'SUNBBA', 'ALTRES', 'PC82',  0, 0),
('SB_NUCLI_PC99', 'Nucli Pouf Graphite Grey',  'SUNBBA', 'ALTRES', 'PC99',  2, 0),
('SB_HOTGLUE',    'Cola calenta',              'SUNBBA', 'ALTRES', NULL,   -4, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- ESTRUCTURES "L" (ESTRUCTURES)
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('SB_L_GR_PC04', 'L Gran Light Ivory',       'SUNBBA', 'ESTRUCTURES', 'PC04',  0, 0),
('SB_L_GR_PC37', 'L Gran Green Olive',       'SUNBBA', 'ESTRUCTURES', 'PC37', -4, 0),
('SB_L_GR_PC82', 'L Gran Grey Stone',        'SUNBBA', 'ESTRUCTURES', 'PC82',  0, 0),
('SB_L_GR_PC99', 'L Gran Graphite Grey',     'SUNBBA', 'ESTRUCTURES', 'PC99',  0, 0),
('SB_L_PT_PC04', 'L Petita Light Ivory',     'SUNBBA', 'ESTRUCTURES', 'PC04',  0, 0),
('SB_L_PT_PC37', 'L Petita Green Olive',     'SUNBBA', 'ESTRUCTURES', 'PC37',  0, 0),
('SB_L_PT_PC82', 'L Petita Grey Stone',      'SUNBBA', 'ESTRUCTURES', 'PC82',  0, 0),
('SB_L_PT_PC99', 'L Petita Graphite Grey',   'SUNBBA', 'ESTRUCTURES', 'PC99',  0, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- MATALASSOS (MATALASSOS)
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('SB_MAT190_PC04', 'Matalàs 190 Light Ivory',    'SUNBBA', 'MATALASSOS', 'PC04', 30, 0),
('SB_MAT190_PC37', 'Matalàs 190 Green Olive',    'SUNBBA', 'MATALASSOS', 'PC37', 39, 0),
('SB_MAT190_PC82', 'Matalàs 190 Grey Stone',     'SUNBBA', 'MATALASSOS', 'PC82', 32, 0),
('SB_MAT190_PC99', 'Matalàs 190 Graphite Grey',  'SUNBBA', 'MATALASSOS', 'PC99',  0, 0),
('SB_MAT160_PC04', 'Matalàs 160 Light Ivory',    'SUNBBA', 'MATALASSOS', 'PC04',  0, 0),
('SB_MAT160_PC37', 'Matalàs 160 Green Olive',    'SUNBBA', 'MATALASSOS', 'PC37',  2, 0),
('SB_MAT160_PC82', 'Matalàs 160 Grey Stone',     'SUNBBA', 'MATALASSOS', 'PC82',  0, 0),
('SB_MAT160_PC99', 'Matalàs 160 Graphite Grey',  'SUNBBA', 'MATALASSOS', 'PC99',  2, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- POTES (PATES)
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('SB_POT_BL', 'Potes Blanques', 'SUNBBA', 'PATES', NULL, -24, 0),
('SB_POT_NG', 'Potes Negres',   'SUNBBA', 'PATES', NULL,   0, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- EMBALATGE
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('SB_CAIXA',      'Caixa SUNBBA',   'SUNBBA', 'EMBALATGE', NULL, 196, 0),
('SB_CAIXA_POUF', 'Caixa Pouf',     'SUNBBA', 'EMBALATGE', NULL,   0, 0),
('SB_MAN',        'Manual SUNBBA',  'SUNBBA', 'EMBALATGE', NULL,  -2, 0),
('SB_ETI',        'Etiqueta SUNBBA','SUNBBA', 'EMBALATGE', NULL,  -4, 0),
('SB_BOSSA',      'Bossa al buit',  'SUNBBA', 'EMBALATGE', NULL,   0, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;

-- COIXINS MUNTATS — buffer KANBAN
INSERT INTO components (sku, name, tenant_id, category_code, color_code, stock_actual, cost_unitari) VALUES
('SB_COI_GR_PC04', 'Coixí Gran Muntat Light Ivory',    'SUNBBA', 'COIXINS', 'PC04', 0, 0),
('SB_COI_GR_PC37', 'Coixí Gran Muntat Green Olive',    'SUNBBA', 'COIXINS', 'PC37', 0, 0),
('SB_COI_GR_PC82', 'Coixí Gran Muntat Grey Stone',     'SUNBBA', 'COIXINS', 'PC82', 0, 0),
('SB_COI_GR_PC99', 'Coixí Gran Muntat Graphite Grey',  'SUNBBA', 'COIXINS', 'PC99', 0, 0),
('SB_COI_MJ_PC04', 'Coixí Mitjà Muntat Light Ivory',   'SUNBBA', 'COIXINS', 'PC04', 0, 0),
('SB_COI_MJ_PC37', 'Coixí Mitjà Muntat Green Olive',   'SUNBBA', 'COIXINS', 'PC37', 0, 0),
('SB_COI_MJ_PC82', 'Coixí Mitjà Muntat Grey Stone',    'SUNBBA', 'COIXINS', 'PC82', 0, 0),
('SB_COI_MJ_PC99', 'Coixí Mitjà Muntat Graphite Grey', 'SUNBBA', 'COIXINS', 'PC99', 0, 0),
('SB_COI_PT_PC04', 'Coixí Petit Muntat Light Ivory',   'SUNBBA', 'COIXINS', 'PC04', 0, 0),
('SB_COI_PT_PC37', 'Coixí Petit Muntat Green Olive',   'SUNBBA', 'COIXINS', 'PC37', 0, 0),
('SB_COI_PT_PC82', 'Coixí Petit Muntat Grey Stone',    'SUNBBA', 'COIXINS', 'PC82', 0, 0),
('SB_COI_PT_PC99', 'Coixí Petit Muntat Graphite Grey', 'SUNBBA', 'COIXINS', 'PC99', 0, 0)
ON CONFLICT (sku) DO UPDATE SET stock_actual = EXCLUDED.stock_actual;
