-- ============================================================================
-- ZeroStock — CÀRREGA COMPLETA (sense colors a l'inventari)
-- ============================================================================
-- Executar a Supabase → SQL Editor → Run, DESPRÉS de schema.sql
-- Idempotent: es pot tornar a executar sense duplicar.
-- Stock = suma de tots els colors (inventari global per SKU).
-- ============================================================================

-- ============================================================================
-- COLORS (es mantenen per al catàleg de productes, no per a l'inventari)
-- ============================================================================
insert into colors (tenant_id, code, name, l_suffix, is_active) values
  ('BUMBBA','PVC','Light Green','VC',true),
  ('BUMBBA','PGC','Arctic Sand','GC',true),
  ('BUMBBA','PGO','Shadow Grey','GO',true),
  ('BUMBBA','GR','Dark Grey','GR',true),
  ('BUMBBA','BG','Beige','BG',true),
  ('BUMBBA','PBR','Light Ivory',null,false),
  ('BUMBBA','PAI','Blue Wave',null,false),
  ('BUMBBA','PMC','Brown Sugar',null,false),
  ('BUMBBA','PVB','Forest Green',null,false),
  ('SUNBBA','PC04','Light Ivory',null,true),
  ('SUNBBA','PC37','Green Olive',null,true),
  ('SUNBBA','PC82','Grey Stone',null,true),
  ('SUNBBA','PC99','Graphite Grey',null,true)
on conflict (tenant_id, code) do update
  set name=excluded.name, l_suffix=excluded.l_suffix, is_active=excluded.is_active;

-- ============================================================================
-- NETEJAR ABANS (evita duplicats en re-execució)
-- ============================================================================
delete from bom;
delete from stock_movements;
delete from components;

-- ============================================================================
-- COMPONENTS — BUMBBA (stock = suma de tots els colors)
-- ============================================================================
insert into components (sku, name, tenant_id, category_code, station, stock_actual) values
  -- TELA / FUNDES
  ('FUN_CR',      'Funda Coixí Gran',        'BUMBBA','TELA',       'E3', 250),
  ('FUN_MC',      'Funda Coixí Petit',       'BUMBBA','TELA',       'E3', 271),
  ('FUN_CRM',     'Funda Coixí Mitjà',       'BUMBBA','TELA',       'E3',  37),
  ('FUN_RAC',     'Funda Coixí Rinconera',   'BUMBBA','TELA',       'E3',  14),
  ('FUN_M190',    'Funda Matalàs 190',       'BUMBBA','TELA',       'E1',  16),
  ('FUN_M160',    'Funda Matalàs 160',       'BUMBBA','TELA',       'E1',  30),
  ('FUN_BRZ',     'Funda Braç',              'BUMBBA','TELA',       'E1',  30),
  ('FUN_PUF',     'Funda Pouf',              'BUMBBA','TELA',       'E1',  30),
  ('FUN_PUF_INT', 'Funda Interior Pouf',     'BUMBBA','TELA',       'E1',   0),
  -- FARCITS / ALTRES
  ('FARCIT_GR',   'Farcit Gran',             'BUMBBA','ALTRES',     'E3', 250),
  ('FARCIT_PT',   'Farcit Petit',            'BUMBBA','ALTRES',     'E3', 272),
  ('FARCIT_CR_M', 'Farcit Medi',             'BUMBBA','ALTRES',     'E3',  37),
  ('FARCIT_RAC',  'Farcit Rinconera',        'BUMBBA','ALTRES',     'E3',  14),
  ('HOTGLUE',     'Cola Calenta',            'BUMBBA','ALTRES',      null, 300),
  ('NUCLI_PUF',   'Nucli Pouf',             'BUMBBA','ALTRES',      'E1',  78),
  -- ESTRUCTURES
  ('L_GR',  'L Gran',   'BUMBBA','ESTRUCTURES','E1', 290),
  ('L_PT',  'L Petita', 'BUMBBA','ESTRUCTURES','E1', 315),
  ('BRAC',  'Braç',     'BUMBBA','ESTRUCTURES','E1',  66),
  -- MATALASSOS
  ('MAT_190','Matalàs 190','BUMBBA','MATALASSOS','E1', 131),
  ('MAT_160','Matalàs 160','BUMBBA','MATALASSOS','E1',  55),
  -- PATES
  ('POT_BL','Potes Blanques','BUMBBA','PATES','E0', 304),
  ('POT_NG','Potes Negres',  'BUMBBA','PATES','E0', 408),
  -- COIXINS MUNTATS (buffer KANBAN)
  ('CX_GR', 'Coixí Gran Muntat',      'BUMBBA','COIXINS','KANBAN', 0),
  ('CX_M',  'Coixí Mitjà Muntat',     'BUMBBA','COIXINS','KANBAN', 0),
  ('CX_PT', 'Coixí Petit Muntat',     'BUMBBA','COIXINS','KANBAN', 0),
  ('CX_RAC','Coixí Rinconera Muntat', 'BUMBBA','COIXINS','KANBAN', 0),
  -- WIP
  ('POUF_ENF','Pouf Enfundat', 'BUMBBA','ALTRES',     'E1', 0),
  ('BRAC_ENF','Braç Enfundat', 'BUMBBA','ESTRUCTURES','E1', 0),
  -- EMBALATGE
  ('CAJA_B',    'Caixa Bumbba',      'BUMBBA','EMBALATGE','E1',  260),
  ('CAJA_PLAIN','Caixa Plain',       'BUMBBA','EMBALATGE','E1',  -16),
  ('CAJA_PUF',  'Caixa Pouf',        'BUMBBA','EMBALATGE','E1',  -17),
  ('BOSSA',     'Bossa Buit',        'BUMBBA','EMBALATGE','E2',  428),
  ('MAN_ES',    'Manual Bumbba ES',  'BUMBBA','EMBALATGE','E0',  184),
  ('MAN_EN',    'Manual Bumbba EN',  'BUMBBA','EMBALATGE','E0',  190),
  ('MAN_BASE',  'Manual Bumbba Base','BUMBBA','EMBALATGE','E0',  -74),
  ('MAN_PUF',   'Manual Pouf/Braços','BUMBBA','EMBALATGE','E0',    0),
  ('ETIQ',      'Etiqueta Bumbba',   'BUMBBA','EMBALATGE','E0',    0)
on conflict (tenant_id, sku) do update
  set stock_actual=excluded.stock_actual, name=excluded.name,
      category_code=excluded.category_code, station=excluded.station;

-- ============================================================================
-- COMPONENTS — SUNBBA
-- ============================================================================
insert into components (sku, name, tenant_id, category_code, station, stock_actual) values
  -- TELA / FUNDES
  ('FUN_CR',      'Funda Coixí Gran',    'SUNBBA','TELA','E3', 158),
  ('FUN_MC',      'Funda Coixí Petit',   'SUNBBA','TELA','E3',  80),
  ('FUN_CRM',     'Funda Coixí Mitjà',   'SUNBBA','TELA','E3',  42),
  ('FUN_M190',    'Funda Matalàs 190',   'SUNBBA','TELA','E1',   0),
  ('FUN_M160',    'Funda Matalàs 160',   'SUNBBA','TELA','E1',   0),
  ('FUN_PUF',     'Funda Pouf',          'SUNBBA','TELA','E1',   0),
  ('FUN_PUF_INT', 'Funda Interior Pouf', 'SUNBBA','TELA','E1',   0),
  -- ALTRES
  ('NUCLI_PUF',   'Nucli Pouf',   'SUNBBA','ALTRES', 'E1',  8),
  ('HOTGLUE',     'Cola Calenta', 'SUNBBA','ALTRES',  null, -4),
  ('FARCIT_GR',   'Farcit Gran',  'SUNBBA','ALTRES',  'E3',  0),
  ('FARCIT_CR_M', 'Farcit Medi',  'SUNBBA','ALTRES',  'E3',  0),
  ('FARCIT_PT',   'Farcit Petit', 'SUNBBA','ALTRES',  'E3',  0),
  -- ESTRUCTURES
  ('L_GR',  'L Gran',   'SUNBBA','ESTRUCTURES','E1', -4),
  ('L_PT',  'L Petita', 'SUNBBA','ESTRUCTURES','E1',  0),
  -- MATALASSOS
  ('MAT_190','Matalàs 190','SUNBBA','MATALASSOS','E1', 101),
  ('MAT_160','Matalàs 160','SUNBBA','MATALASSOS','E1',   4),
  -- PATES
  ('POT_BL','Potes Blanques','SUNBBA','PATES','E0', -24),
  ('POT_NG','Potes Negres',  'SUNBBA','PATES','E0',   0),
  -- COIXINS MUNTATS
  ('CX_GR','Coixí Gran Muntat', 'SUNBBA','COIXINS','KANBAN', 0),
  ('CX_M', 'Coixí Mitjà Muntat','SUNBBA','COIXINS','KANBAN', 0),
  ('CX_PT','Coixí Petit Muntat','SUNBBA','COIXINS','KANBAN', 0),
  -- WIP
  ('POUF_ENF','Pouf Enfundat','SUNBBA','ALTRES','E1', 0),
  -- EMBALATGE
  ('CAJA_S',  'Caixa Sunbba', 'SUNBBA','EMBALATGE','E1',  196),
  ('CAJA_PUF','Caixa Pouf',   'SUNBBA','EMBALATGE','E1',    0),
  ('BOSSA',   'Bossa Buit',   'SUNBBA','EMBALATGE','E2',    0),
  ('MAN_S',   'Manual Sunbba','SUNBBA','EMBALATGE','E0',   -2),
  ('MAN_PUF', 'Manual Pouf',  'SUNBBA','EMBALATGE','E0',    0),
  ('ETIQ',    'Etiqueta Sunbba','SUNBBA','EMBALATGE','E0', -4)
on conflict (tenant_id, sku) do update
  set stock_actual=excluded.stock_actual, name=excluded.name,
      category_code=excluded.category_code, station=excluded.station;

-- ============================================================================
-- PRODUCTES
-- ============================================================================
insert into products (code, name, tenant_id, family, bom_active, sold_on_web) values
  ('1P','1 Seater','BUMBBA','SOFA',true,true),
  ('2P','2 Seater','BUMBBA','SOFA',true,true),
  ('3P','3 Seater','BUMBBA','SOFA',true,true),
  ('CHL','Chaise Longue','BUMBBA','SOFA',true,true),
  ('CHL_160','Chaise Longue 160','BUMBBA','SOFA',true,true),
  ('CRN','Corner','BUMBBA','SOFA',true,true),
  ('CRN_160','Corner 160','BUMBBA','SOFA',true,true),
  ('WWL','Wonderwall','BUMBBA','SOFA',false,true),
  ('PLD','Prelude','BUMBBA','SOFA',false,true),
  ('SBM','Stand By Me','BUMBBA','SOFA',false,true),
  ('PFG','Feeling Good','BUMBBA','SOFA',false,true),
  ('BRAZO','Braços (2u)','BUMBBA','INDIVIDUAL',true,true),
  ('PUF','The Pouf','BUMBBA','INDIVIDUAL',true,true),
  ('CR','Coixí Gran','BUMBBA','INDIVIDUAL',true,true),
  ('CR_M','Coixí Mitjà','BUMBBA','INDIVIDUAL',true,true),
  ('MC','Coixí Petit','BUMBBA','INDIVIDUAL',true,true),
  ('RAC','Coixí Rinconera','BUMBBA','INDIVIDUAL',true,true),
  ('CL190','Matalàs 190','BUMBBA','INDIVIDUAL',true,true),
  ('CL160','Matalàs 160','BUMBBA','INDIVIDUAL',true,true),
  ('TB_IND','L Gran Individual','BUMBBA','INDIVIDUAL',true,true),
  ('TB_IND_P','L Petita Individual','BUMBBA','INDIVIDUAL',true,true),
  ('1P','1 Seater','SUNBBA','SOFA',true,false),
  ('2P','2 Seater','SUNBBA','SOFA',true,false),
  ('3P','3 Seater','SUNBBA','SOFA',true,true),
  ('CHL_190_160','Chaise Longue (Medium)','SUNBBA','SOFA',true,true),
  ('CHLB','Chaise Big','SUNBBA','SOFA',true,false),
  ('CHLS','Chaise Small','SUNBBA','SOFA',true,false),
  ('CR','Coixí Gran','SUNBBA','INDIVIDUAL',true,false),
  ('CR_M','Coixí Mitjà','SUNBBA','INDIVIDUAL',true,false),
  ('MC','Coixí Petit','SUNBBA','INDIVIDUAL',true,false),
  ('PUF','The Pouf','SUNBBA','INDIVIDUAL',true,false)
on conflict (tenant_id, code) do update
  set name=excluded.name, family=excluded.family,
      bom_active=excluded.bom_active, sold_on_web=excluded.sold_on_web;

-- ============================================================================
-- BOM — sense colors, JOIN directe per nom + tenant
-- ============================================================================

-- ── BUMBBA 1P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Bumbba',      1, 'E1', false),
  ('Pouf Enfundat',     1, 'E1', true),
  ('L Gran',            1, 'E1', true),
  ('Coixí Mitjà Muntat',1, 'KANBAN', true),
  ('Potes Blanques',    4, 'E0', true),
  ('Manual Bumbba ES',  1, 'E0', false),
  ('Etiqueta Bumbba',   1, 'E0', false),
  ('Cola Calenta',      1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='1P';

-- ── BUMBBA 2P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Bumbba',       2, 'E1', false),
  ('Matalàs 160',        2, 'E1', true),
  ('L Gran',             2, 'E1', true),
  ('L Petita',           2, 'E1', true),
  ('Coixí Mitjà Muntat', 2, 'KANBAN', true),
  ('Coixí Petit Muntat', 2, 'KANBAN', true),
  ('Potes Blanques',    12, 'E0', true),
  ('Manual Bumbba ES',   1, 'E0', false),
  ('Funda Matalàs 160',  2, 'E1', true)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='2P';

-- ── BUMBBA 3P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Matalàs 190',        2, 'E1', true),
  ('L Gran',             2, 'E1', true),
  ('L Petita',           2, 'E1', true),
  ('Coixí Gran Muntat',  2, 'KANBAN', true),
  ('Caixa Bumbba',       2, 'E1', false),
  ('Potes Blanques',    12, 'E0', true),
  ('Manual Bumbba ES',   1, 'E0', false),
  ('Etiqueta Bumbba',    2, 'E0', false),
  ('Cola Calenta',       2, 'E1', false),
  ('Funda Matalàs 190',  2, 'E1', true)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='3P';

-- ── BUMBBA CHL ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Bumbba',       4, 'E1', false),
  ('Matalàs 190',        4, 'E1', true),
  ('L Gran',             3, 'E1', true),
  ('L Petita',           2, 'E1', true),
  ('Coixí Gran Muntat',  3, 'KANBAN', true),
  ('Coixí Petit Muntat', 2, 'KANBAN', true),
  ('Potes Blanques',    12, 'E0', true),
  ('Manual Bumbba ES',   1, 'E0', false),
  ('Funda Matalàs 190',  4, 'E1', true)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='CHL';

-- ── BUMBBA CRN ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Bumbba',           4, 'E1', false),
  ('Matalàs 190',            4, 'E1', true),
  ('L Gran',                 5, 'E1', true),
  ('L Petita',               2, 'E1', true),
  ('Coixí Gran Muntat',      3, 'KANBAN', true),
  ('Coixí Petit Muntat',     2, 'KANBAN', true),
  ('Coixí Rinconera Muntat', 1, 'KANBAN', true),
  ('Potes Blanques',        12, 'E0', true),
  ('Manual Bumbba ES',       1, 'E0', false),
  ('Funda Matalàs 190',      4, 'E1', true)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='CRN';

-- ── BUMBBA PUF ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Pouf',         1, 'E1', false),
  ('Pouf Enfundat',      2, 'E1', true),
  ('Manual Pouf/Braços', 1, 'E0', false),
  ('Funda Pouf',         1, 'E1', true),
  ('Funda Interior Pouf',1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='PUF';

-- ── BUMBBA BRAZO ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Plain',        1, 'E1', false),
  ('Braç Enfundat',      2, 'E1', true),
  ('Manual Pouf/Braços', 1, 'E0', false),
  ('Funda Braç',         2, 'E1', true)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='BRAZO';

-- ── BUMBBA CR / CR_M / MC / RAC ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Farcit Gran',    1, 'E3', false),
  ('Funda Coixí Gran',1,'E3', true),
  ('Bossa Buit',     1, 'E2', false),
  ('Caixa Plain',    1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='CR';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Farcit Medi',        1, 'E3', false),
  ('Funda Coixí Mitjà',  1, 'E3', true),
  ('Bossa Buit',         1, 'E2', false),
  ('Caixa Plain',        1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='CR_M';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Farcit Petit',       1, 'E3', false),
  ('Funda Coixí Petit',  1, 'E3', true),
  ('Caixa Plain',        1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='MC';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Farcit Rinconera',       1, 'E3', false),
  ('Funda Coixí Rinconera',  1, 'E3', true),
  ('Bossa Buit',             1, 'E2', false),
  ('Caixa Plain',            1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='RAC';

-- ── BUMBBA CL190 / CL160 ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Matalàs 190', 1, 'E1', true),
  ('Caixa Plain', 1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='CL190';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Matalàs 160', 1, 'E1', true),
  ('Caixa Plain', 1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='CL160';

-- ── BUMBBA TB_IND / TB_IND_P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('L Gran',        2, 'E1', true),
  ('Potes Blanques',4, 'E0', true),
  ('Caixa Plain',   1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='TB_IND';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('L Petita',      2, 'E1', true),
  ('Potes Blanques',4, 'E0', true),
  ('Caixa Plain',   1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname
where p.tenant_id='BUMBBA' and p.code='TB_IND_P';

-- ── SUNBBA 1P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Sunbba',       1, 'E1', false),
  ('Pouf Enfundat',      1, 'E1', true),
  ('L Gran',             1, 'E1', true),
  ('Coixí Mitjà Muntat', 1, 'KANBAN', true),
  ('Potes Blanques',     4, 'E0', true),
  ('Manual Sunbba',      1, 'E0', false),
  ('Etiqueta Sunbba',    1, 'E0', false),
  ('Cola Calenta',       1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname
where p.tenant_id='SUNBBA' and p.code='1P';

-- ── SUNBBA 2P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Sunbba',       2, 'E1', false),
  ('Matalàs 160',        2, 'E1', true),
  ('L Gran',             2, 'E1', true),
  ('Coixí Mitjà Muntat', 2, 'KANBAN', true),
  ('Potes Blanques',    12, 'E0', true),
  ('Manual Sunbba',      1, 'E0', false),
  ('Etiqueta Sunbba',    2, 'E0', false),
  ('Cola Calenta',       2, 'E1', false),
  ('Funda Matalàs 160',  2, 'E1', true)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname
where p.tenant_id='SUNBBA' and p.code='2P';

-- ── SUNBBA 3P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Sunbba',       2, 'E1', false),
  ('Matalàs 190',        2, 'E1', true),
  ('L Gran',             2, 'E1', true),
  ('L Petita',           2, 'E1', true),
  ('Coixí Gran Muntat',  2, 'KANBAN', true),
  ('Potes Blanques',    12, 'E0', true),
  ('Manual Sunbba',      1, 'E0', false),
  ('Etiqueta Sunbba',    2, 'E0', false),
  ('Cola Calenta',       2, 'E1', false),
  ('Funda Matalàs 190',  2, 'E1', true)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname
where p.tenant_id='SUNBBA' and p.code='3P';

-- ── SUNBBA CHL_190_160 ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Sunbba',      4, 'E1', false),
  ('Matalàs 190',       2, 'E1', true),
  ('Matalàs 160',       2, 'E1', true),
  ('L Gran',            3, 'E1', true),
  ('Coixí Gran Muntat', 3, 'KANBAN', true),
  ('Potes Blanques',   24, 'E0', true),
  ('Manual Sunbba',     1, 'E0', false),
  ('Etiqueta Sunbba',   4, 'E0', false),
  ('Cola Calenta',      4, 'E1', false),
  ('Funda Matalàs 190', 2, 'E1', true),
  ('Funda Matalàs 160', 2, 'E1', true)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname
where p.tenant_id='SUNBBA' and p.code='CHL_190_160';

-- ── SUNBBA CHLB ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Sunbba',      4, 'E1', false),
  ('Matalàs 190',       4, 'E1', true),
  ('L Gran',            3, 'E1', true),
  ('Coixí Gran Muntat', 3, 'KANBAN', true),
  ('Potes Blanques',   24, 'E0', true),
  ('Funda Matalàs 190', 4, 'E1', true)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname
where p.tenant_id='SUNBBA' and p.code='CHLB';

-- ── SUNBBA CHLS ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Sunbba',       4, 'E1', false),
  ('Matalàs 160',        4, 'E1', true),
  ('L Gran',             3, 'E1', true),
  ('Coixí Mitjà Muntat', 3, 'KANBAN', true),
  ('Potes Blanques',    24, 'E0', true),
  ('Funda Matalàs 160',  4, 'E1', true)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname
where p.tenant_id='SUNBBA' and p.code='CHLS';

-- ── SUNBBA CR / CR_M / MC ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Farcit Gran',       1, 'E3', false),
  ('Funda Coixí Gran',  1, 'E3', true),
  ('Bossa Buit',        1, 'E2', false),
  ('Caixa Sunbba',      1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname
where p.tenant_id='SUNBBA' and p.code='CR';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Farcit Medi',        1, 'E3', false),
  ('Funda Coixí Mitjà',  1, 'E3', true),
  ('Bossa Buit',         1, 'E2', false),
  ('Caixa Sunbba',       1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname
where p.tenant_id='SUNBBA' and p.code='CR_M';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Farcit Petit',      1, 'E3', false),
  ('Funda Coixí Petit', 1, 'E3', true),
  ('Caixa Sunbba',      1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname
where p.tenant_id='SUNBBA' and p.code='MC';

-- ── SUNBBA PUF ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.st, v.cv
from products p
join lateral (values
  ('Caixa Pouf',         1, 'E1', false),
  ('Pouf Enfundat',      2, 'E1', true),
  ('Manual Pouf',        1, 'E0', false),
  ('Etiqueta Sunbba',    1, 'E0', false),
  ('Funda Pouf',         1, 'E1', true),
  ('Funda Interior Pouf',1, 'E1', false),
  ('Cola Calenta',       1, 'E1', false)
) as v(cname,qty,st,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname
where p.tenant_id='SUNBBA' and p.code='PUF';

-- ============================================================================
-- PREUS
-- ============================================================================
delete from prices where product_id in (select id from products where tenant_id in ('BUMBBA','SUNBBA'));

insert into prices (product_id, price_type, size, amount, vat_included)
select p.id, 'PROPOSTA', v.size, v.amount, false
from products p
join lateral (values
  ('3P','80',292.80),('3P','90',309.60),
  ('2P','80',289.60),('2P','90',305.20),
  ('CHL','80',518.69),('CHL','90',552.29),
  ('CRN','80',596.60),('CRN','90',630.20),
  ('WWL','80',218.80),('WWL','90',235.60),
  ('SBM','80',243.80),('SBM','90',260.60),
  ('PLD','80',261.80),('PLD','90',278.60),
  ('PFG','80',233.80),('PFG','90',250.60),
  ('PUF','70',124.00),('PUF','80',128.17),
  ('CR',null,25.75),
  ('CR_M',null,12.00),('MC',null,12.00),
  ('TB_IND',null,44.56),('TB_IND_P',null,44.56),
  ('BRAZO',null,89.00)
) as v(code,size,amount) on true
where p.tenant_id='BUMBBA' and p.code=v.code;

insert into prices (product_id, price_type, size, amount, vat_included)
select p.id, 'RETAIL', null, v.amount, true
from products p
join lateral (values
  ('1P',322.00),('2P',661.50),('3P',696.50),
  ('CHL',1189.30),('CRN',1352.40),
  ('WWL',518.00),('SBM',594.30),('PLD',625.80),('PFG',549.50),
  ('PUF',290.50),('CL190',230.30),('TB_IND',116.20),('BRAZO',98.00),
  ('CR',76.30),('MC',31.50)
) as v(code,amount) on true
where p.tenant_id='BUMBBA' and p.code=v.code;

insert into prices (product_id, price_type, size, amount, vat_included)
select p.id, 'RETAIL', null, v.amount, true
from products p
join lateral (values
  ('3P',994.00),
  ('CHL_190_160',1897.00)
) as v(code,amount) on true
where p.tenant_id='SUNBBA' and p.code=v.code;

-- ============================================================================
-- COMANDES TARRACÓ
-- ============================================================================
delete from purchase_order_lines where order_id in
  (select po.id from purchase_orders po join suppliers s on s.id=po.supplier_id where s.name='Tarracó');
delete from purchase_orders where supplier_id in (select id from suppliers where name='Tarracó');

with s as (select id from suppliers where name='Tarracó' limit 1),
ins as (
  insert into purchase_orders (supplier_id, reference, truck_number, order_date, m3_used, m3_limit, notes)
  select s.id, 'tarraco_order_2026-04-08', 1, date '2026-04-22', 9.996, 10,
         '679 u. Marge +15%, corner +20%.' from s
  returning id
)
insert into purchase_order_lines (order_id, component_sku, description, quantity, is_carry_along)
select ins.id, v.sku, v.descr, v.qty, v.carry
from ins
join lateral (values
  ('FARCIT_RAC','Farcit Rinconera',6,false),
  ('FARCIT_GR','Farcit Gran',96,false),
  ('FARCIT_PT','Farcit Petit',480,false),
  ('POT_BL','Potes blanques (carry-along)',1000,true),
  ('POT_NG','Potes negres (carry-along)',600,true),
  ('BOSSA','Bosses al buit (carry-along)',160,true)
) as v(sku,descr,qty,carry) on true;

with s as (select id from suppliers where name='Tarracó' limit 1),
ins as (
  insert into purchase_orders (supplier_id, reference, truck_number, order_date, m3_used, m3_limit, notes)
  select s.id, 'tarraco_order_2026-04-08', 2, date '2026-05-15', 9.812, 10,
         '707 u. Segon camió.' from s
  returning id
)
insert into purchase_order_lines (order_id, component_sku, description, quantity, is_carry_along)
select ins.id, v.sku, v.descr, v.qty, v.carry
from ins
join lateral (values
  ('FARCIT_GR','Farcit Gran',96,false),
  ('FARCIT_PT','Farcit Petit',480,false),
  ('POT_BL','Potes blanques (carry-along)',1000,true),
  ('POT_NG','Potes negres (carry-along)',600,true),
  ('BOSSA','Bosses al buit (carry-along)',240,true)
) as v(sku,descr,qty,carry) on true;
