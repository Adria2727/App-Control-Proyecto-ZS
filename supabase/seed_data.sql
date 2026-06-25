-- ============================================================================
-- ZeroStock — CÀRREGA COMPLETA DE DADES (tot el context a 2026-06-18)
-- ============================================================================
-- Executar a Supabase → SQL Editor → Run, DESPRÉS de schema.sql
-- Idempotent: es pot tornar a executar sense duplicar.
-- Conté: colors · components (stock real) · productes · BOM · preus · comandes
-- Color il·lustratiu BOM: Bumbba=PGC (Arctic Sand) · Sunbba=PC04 (Light Ivory)
-- [c] = color_varies=true (el component canvia segons color del producte)
-- Stock NEGATIU = descuadre conegut de magatzem (no és ruptura real)
-- ============================================================================

-- ============================================================================
-- COLORS
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
-- NETEJAR ABANS (evita duplicats per NULLs)
delete from bom;
delete from stock_movements;
delete from components;

-- COMPONENTS — BUMBBA (sku, name, category, color, station, stock)
-- ============================================================================
insert into components (sku, name, tenant_id, category_code, color_code, station, stock_actual) values
  -- TELA / FUNDES
  ('FUN_CR','Funda Coixí Gran','BUMBBA','TELA','PVC','E3',61),
  ('FUN_CR','Funda Coixí Gran','BUMBBA','TELA','PGC','E3',89),
  ('FUN_CR','Funda Coixí Gran','BUMBBA','TELA','PGO','E3',100),
  ('FUN_MC','Funda Coixí Petit','BUMBBA','TELA','PVC','E3',71),
  ('FUN_MC','Funda Coixí Petit','BUMBBA','TELA','PGC','E3',100),
  ('FUN_MC','Funda Coixí Petit','BUMBBA','TELA','PGO','E3',100),
  ('FUN_CRM','Funda Coixí Mitjà','BUMBBA','TELA','PVC','E3',13),
  ('FUN_CRM','Funda Coixí Mitjà','BUMBBA','TELA','PGC','E3',12),
  ('FUN_CRM','Funda Coixí Mitjà','BUMBBA','TELA','PGO','E3',12),
  ('FUN_RAC','Funda Coixí Rinconera','BUMBBA','TELA','PVC','E3',4),
  ('FUN_RAC','Funda Coixí Rinconera','BUMBBA','TELA','PGC','E3',5),
  ('FUN_RAC','Funda Coixí Rinconera','BUMBBA','TELA','PGO','E3',5),
  ('FUN_M190','Funda Matalàs 190','BUMBBA','TELA','PVC','E1',6),
  ('FUN_M190','Funda Matalàs 190','BUMBBA','TELA','PGC','E1',0),
  ('FUN_M190','Funda Matalàs 190','BUMBBA','TELA','PGO','E1',10),
  ('FUN_M160','Funda Matalàs 160','BUMBBA','TELA','PVC','E1',10),
  ('FUN_M160','Funda Matalàs 160','BUMBBA','TELA','PGC','E1',10),
  ('FUN_M160','Funda Matalàs 160','BUMBBA','TELA','PGO','E1',10),
  ('FUN_BRZ','Funda Braç','BUMBBA','TELA','PVC','E1',10),
  ('FUN_BRZ','Funda Braç','BUMBBA','TELA','PGC','E1',10),
  ('FUN_BRZ','Funda Braç','BUMBBA','TELA','PGO','E1',10),
  ('FUN_PUF','Funda Pouf','BUMBBA','TELA','PVC','E1',10),
  ('FUN_PUF','Funda Pouf','BUMBBA','TELA','PGC','E1',10),
  ('FUN_PUF','Funda Pouf','BUMBBA','TELA','PGO','E1',10),
  ('FUN_PUF_INT','Funda Interior Pouf','BUMBBA','TELA',null,'E1',0),
  -- ALTRES / FARCITS
  ('FARCIT_GR','Farcit Gran','BUMBBA','ALTRES',null,'E3',250),
  ('FARCIT_PT','Farcit Petit','BUMBBA','ALTRES',null,'E3',272),
  ('FARCIT_CR_M','Farcit Medi','BUMBBA','ALTRES',null,'E3',37),
  ('FARCIT_RAC','Farcit Rinconera','BUMBBA','ALTRES',null,'E3',14),
  ('HOTGLUE','Cola Calenta','BUMBBA','ALTRES',null,null,300),
  ('NUCLI_PUF','Nucli Pouf','BUMBBA','ALTRES','PVC','E1',16),
  ('NUCLI_PUF','Nucli Pouf','BUMBBA','ALTRES','PGC','E1',32),
  ('NUCLI_PUF','Nucli Pouf','BUMBBA','ALTRES','PGO','E1',30),
  -- ESTRUCTURES "L" i BRAÇ (color = codi pana equivalent)
  ('L_GR','L Gran','BUMBBA','ESTRUCTURES','PVC','E1',60),
  ('L_GR','L Gran','BUMBBA','ESTRUCTURES','PGC','E1',46),
  ('L_GR','L Gran','BUMBBA','ESTRUCTURES','PGO','E1',33),
  ('L_GR','L Gran','BUMBBA','ESTRUCTURES','GR','E1',59),
  ('L_GR','L Gran','BUMBBA','ESTRUCTURES','BG','E1',92),
  ('L_PT','L Petita','BUMBBA','ESTRUCTURES','PVC','E1',62),
  ('L_PT','L Petita','BUMBBA','ESTRUCTURES','PGC','E1',46),
  ('L_PT','L Petita','BUMBBA','ESTRUCTURES','PGO','E1',34),
  ('L_PT','L Petita','BUMBBA','ESTRUCTURES','GR','E1',79),
  ('L_PT','L Petita','BUMBBA','ESTRUCTURES','BG','E1',94),
  ('BRAC','Braç','BUMBBA','ESTRUCTURES','PVC','E1',24),
  ('BRAC','Braç','BUMBBA','ESTRUCTURES','PGC','E1',22),
  ('BRAC','Braç','BUMBBA','ESTRUCTURES','PGO','E1',20),
  -- MATALASSOS
  ('MAT_190','Matalàs 190','BUMBBA','MATALASSOS','PVC','E1',40),
  ('MAT_190','Matalàs 190','BUMBBA','MATALASSOS','PGC','E1',59),
  ('MAT_190','Matalàs 190','BUMBBA','MATALASSOS','PGO','E1',32),
  ('MAT_160','Matalàs 160','BUMBBA','MATALASSOS','PVC','E1',17),
  ('MAT_160','Matalàs 160','BUMBBA','MATALASSOS','PGC','E1',17),
  ('MAT_160','Matalàs 160','BUMBBA','MATALASSOS','PGO','E1',21),
  -- PATES
  ('POT_BL','Potes Blanques','BUMBBA','PATES',null,'E0',304),
  ('POT_NG','Potes Negres','BUMBBA','PATES',null,'E0',408),
  -- COIXINS MUNTATS (buffer KANBAN, normalment 0)
  ('CX_GR','Coixí Gran Muntat','BUMBBA','COIXINS','PVC','KANBAN',0),
  ('CX_GR','Coixí Gran Muntat','BUMBBA','COIXINS','PGC','KANBAN',0),
  ('CX_GR','Coixí Gran Muntat','BUMBBA','COIXINS','PGO','KANBAN',0),
  ('CX_M','Coixí Mitjà Muntat','BUMBBA','COIXINS','PVC','KANBAN',0),
  ('CX_M','Coixí Mitjà Muntat','BUMBBA','COIXINS','PGC','KANBAN',0),
  ('CX_M','Coixí Mitjà Muntat','BUMBBA','COIXINS','PGO','KANBAN',0),
  ('CX_PT','Coixí Petit Muntat','BUMBBA','COIXINS','PVC','KANBAN',0),
  ('CX_PT','Coixí Petit Muntat','BUMBBA','COIXINS','PGC','KANBAN',0),
  ('CX_PT','Coixí Petit Muntat','BUMBBA','COIXINS','PGO','KANBAN',0),
  ('CX_RAC','Coixí Rinconera Muntat','BUMBBA','COIXINS','PVC','KANBAN',0),
  ('CX_RAC','Coixí Rinconera Muntat','BUMBBA','COIXINS','PGC','KANBAN',0),
  ('CX_RAC','Coixí Rinconera Muntat','BUMBBA','COIXINS','PGO','KANBAN',0),
  -- WIP sub-assemblatges (enfundats)
  ('POUF_ENF','Pouf Enfundat','BUMBBA','ALTRES','PGC','E1',0),
  ('BRAC_ENF','Braç Enfundat','BUMBBA','ESTRUCTURES','PGC','E1',0),
  -- EMBALATGE
  ('CAJA_B','Caixa Bumbba','BUMBBA','EMBALATGE',null,'E1',260),
  ('CAJA_PLAIN','Caixa Plain','BUMBBA','EMBALATGE',null,'E1',-16),
  ('CAJA_PUF','Caixa Pouf','BUMBBA','EMBALATGE',null,'E1',-17),
  ('BOSSA','Bossa Buit','BUMBBA','EMBALATGE',null,'E2',428),
  ('MAN_ES','Manual Bumbba ES','BUMBBA','EMBALATGE',null,'E0',184),
  ('MAN_EN','Manual Bumbba EN','BUMBBA','EMBALATGE',null,'E0',190),
  ('MAN_BASE','Manual Bumbba Base','BUMBBA','EMBALATGE',null,'E0',-74),
  ('MAN_PUF','Manual Pouf/Braços','BUMBBA','EMBALATGE',null,'E0',0),
  ('ETIQ','Etiqueta Bumbba','BUMBBA','EMBALATGE',null,'E0',0)
on conflict (tenant_id, sku, color_code) do update
  set stock_actual=excluded.stock_actual, name=excluded.name,
      category_code=excluded.category_code, station=excluded.station;

-- ============================================================================
-- COMPONENTS — SUNBBA
-- ============================================================================
insert into components (sku, name, tenant_id, category_code, color_code, station, stock_actual) values
  -- TELA / FUNDES coixí
  ('FUN_CR','Funda Coixí Gran','SUNBBA','TELA','PC04','E3',56),
  ('FUN_CR','Funda Coixí Gran','SUNBBA','TELA','PC37','E3',38),
  ('FUN_CR','Funda Coixí Gran','SUNBBA','TELA','PC82','E3',32),
  ('FUN_CR','Funda Coixí Gran','SUNBBA','TELA','PC99','E3',32),
  ('FUN_MC','Funda Coixí Petit','SUNBBA','TELA','PC04','E3',28),
  ('FUN_MC','Funda Coixí Petit','SUNBBA','TELA','PC37','E3',20),
  ('FUN_MC','Funda Coixí Petit','SUNBBA','TELA','PC82','E3',16),
  ('FUN_MC','Funda Coixí Petit','SUNBBA','TELA','PC99','E3',16),
  ('FUN_CRM','Funda Coixí Mitjà','SUNBBA','TELA','PC04','E3',16),
  ('FUN_CRM','Funda Coixí Mitjà','SUNBBA','TELA','PC37','E3',10),
  ('FUN_CRM','Funda Coixí Mitjà','SUNBBA','TELA','PC82','E3',8),
  ('FUN_CRM','Funda Coixí Mitjà','SUNBBA','TELA','PC99','E3',8),
  ('FUN_M190','Funda Matalàs 190','SUNBBA','TELA','PC04','E1',0),
  ('FUN_M190','Funda Matalàs 190','SUNBBA','TELA','PC37','E1',0),
  ('FUN_M190','Funda Matalàs 190','SUNBBA','TELA','PC82','E1',0),
  ('FUN_M190','Funda Matalàs 190','SUNBBA','TELA','PC99','E1',0),
  ('FUN_M160','Funda Matalàs 160','SUNBBA','TELA','PC04','E1',0),
  ('FUN_M160','Funda Matalàs 160','SUNBBA','TELA','PC37','E1',0),
  ('FUN_M160','Funda Matalàs 160','SUNBBA','TELA','PC82','E1',0),
  ('FUN_M160','Funda Matalàs 160','SUNBBA','TELA','PC99','E1',0),
  ('FUN_PUF','Funda Pouf','SUNBBA','TELA','PC04','E1',0),
  ('FUN_PUF','Funda Pouf','SUNBBA','TELA','PC37','E1',0),
  ('FUN_PUF','Funda Pouf','SUNBBA','TELA','PC82','E1',0),
  ('FUN_PUF','Funda Pouf','SUNBBA','TELA','PC99','E1',0),
  ('FUN_PUF_INT','Funda Interior Pouf','SUNBBA','TELA',null,'E1',0),
  -- ALTRES
  ('NUCLI_PUF','Nucli Pouf','SUNBBA','ALTRES','PC04','E1',6),
  ('NUCLI_PUF','Nucli Pouf','SUNBBA','ALTRES','PC37','E1',0),
  ('NUCLI_PUF','Nucli Pouf','SUNBBA','ALTRES','PC82','E1',0),
  ('NUCLI_PUF','Nucli Pouf','SUNBBA','ALTRES','PC99','E1',2),
  ('HOTGLUE','Cola Calenta','SUNBBA','ALTRES',null,null,-4),
  ('FARCIT_GR','Farcit Gran','SUNBBA','ALTRES',null,'E3',0),
  ('FARCIT_CR_M','Farcit Medi','SUNBBA','ALTRES',null,'E3',0),
  ('FARCIT_PT','Farcit Petit','SUNBBA','ALTRES',null,'E3',0),
  -- ESTRUCTURES "L" (prov. Lacats V.F) — ~0 a tots els colors
  ('L_GR','L Gran','SUNBBA','ESTRUCTURES','PC04','E1',0),
  ('L_GR','L Gran','SUNBBA','ESTRUCTURES','PC37','E1',-4),
  ('L_GR','L Gran','SUNBBA','ESTRUCTURES','PC82','E1',0),
  ('L_GR','L Gran','SUNBBA','ESTRUCTURES','PC99','E1',0),
  ('L_PT','L Petita','SUNBBA','ESTRUCTURES','PC04','E1',0),
  ('L_PT','L Petita','SUNBBA','ESTRUCTURES','PC37','E1',0),
  ('L_PT','L Petita','SUNBBA','ESTRUCTURES','PC82','E1',0),
  ('L_PT','L Petita','SUNBBA','ESTRUCTURES','PC99','E1',0),
  -- MATALASSOS
  ('MAT_190','Matalàs 190','SUNBBA','MATALASSOS','PC04','E1',30),
  ('MAT_190','Matalàs 190','SUNBBA','MATALASSOS','PC37','E1',39),
  ('MAT_190','Matalàs 190','SUNBBA','MATALASSOS','PC82','E1',32),
  ('MAT_190','Matalàs 190','SUNBBA','MATALASSOS','PC99','E1',0),
  ('MAT_160','Matalàs 160','SUNBBA','MATALASSOS','PC04','E1',0),
  ('MAT_160','Matalàs 160','SUNBBA','MATALASSOS','PC37','E1',2),
  ('MAT_160','Matalàs 160','SUNBBA','MATALASSOS','PC82','E1',0),
  ('MAT_160','Matalàs 160','SUNBBA','MATALASSOS','PC99','E1',2),
  -- PATES
  ('POT_BL','Potes Blanques','SUNBBA','PATES',null,'E0',-24),
  ('POT_NG','Potes Negres','SUNBBA','PATES',null,'E0',0),
  -- COIXINS MUNTATS (buffer)
  ('CX_GR','Coixí Gran Muntat','SUNBBA','COIXINS','PC04','KANBAN',0),
  ('CX_GR','Coixí Gran Muntat','SUNBBA','COIXINS','PC37','KANBAN',0),
  ('CX_GR','Coixí Gran Muntat','SUNBBA','COIXINS','PC82','KANBAN',0),
  ('CX_GR','Coixí Gran Muntat','SUNBBA','COIXINS','PC99','KANBAN',0),
  ('CX_M','Coixí Mitjà Muntat','SUNBBA','COIXINS','PC04','KANBAN',0),
  ('CX_M','Coixí Mitjà Muntat','SUNBBA','COIXINS','PC37','KANBAN',0),
  ('CX_M','Coixí Mitjà Muntat','SUNBBA','COIXINS','PC82','KANBAN',0),
  ('CX_M','Coixí Mitjà Muntat','SUNBBA','COIXINS','PC99','KANBAN',0),
  ('CX_PT','Coixí Petit Muntat','SUNBBA','COIXINS','PC04','KANBAN',0),
  ('CX_PT','Coixí Petit Muntat','SUNBBA','COIXINS','PC37','KANBAN',0),
  ('CX_PT','Coixí Petit Muntat','SUNBBA','COIXINS','PC82','KANBAN',0),
  ('CX_PT','Coixí Petit Muntat','SUNBBA','COIXINS','PC99','KANBAN',0),
  -- WIP
  ('POUF_ENF','Pouf Enfundat','SUNBBA','ALTRES','PC04','E1',0),
  -- EMBALATGE
  ('CAJA_S','Caixa Sunbba','SUNBBA','EMBALATGE',null,'E1',196),
  ('CAJA_PUF','Caixa Pouf','SUNBBA','EMBALATGE',null,'E1',0),
  ('BOSSA','Bossa Buit','SUNBBA','EMBALATGE',null,'E2',0),
  ('MAN_S','Manual Sunbba','SUNBBA','EMBALATGE',null,'E0',-2),
  ('MAN_PUF','Manual Pouf','SUNBBA','EMBALATGE',null,'E0',0),
  ('ETIQ','Etiqueta Sunbba','SUNBBA','EMBALATGE',null,'E0',-4)
on conflict (tenant_id, sku, color_code) do update
  set stock_actual=excluded.stock_actual, name=excluded.name,
      category_code=excluded.category_code, station=excluded.station;

-- ============================================================================
-- PRODUCTES
-- ============================================================================
insert into products (code, name, tenant_id, family, bom_active, sold_on_web) values
  -- BUMBBA sofàs
  ('1P','1 Seater','BUMBBA','SOFA',true,true),
  ('2P','2 Seater','BUMBBA','SOFA',true,true),
  ('3P','3 Seater','BUMBBA','SOFA',true,true),
  ('CHL','Chaise Longue','BUMBBA','SOFA',true,true),
  ('CHL_160','Chaise Longue 160','BUMBBA','SOFA',true,true),
  ('CRN','Corner','BUMBBA','SOFA',true,true),
  ('CRN_160','Corner 160','BUMBBA','SOFA',true,true),
  -- BUMBBA famílies web amb BOM inactiu
  ('WWL','Wonderwall','BUMBBA','SOFA',false,true),
  ('PLD','Prelude','BUMBBA','SOFA',false,true),
  ('SBM','Stand By Me','BUMBBA','SOFA',false,true),
  ('PFG','Feeling Good','BUMBBA','SOFA',false,true),
  -- BUMBBA individualitzats
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
  -- SUNBBA sofàs
  ('1P','1 Seater','SUNBBA','SOFA',true,false),
  ('2P','2 Seater','SUNBBA','SOFA',true,false),
  ('3P','3 Seater','SUNBBA','SOFA',true,true),
  ('CHL_190_160','Chaise Longue (Medium)','SUNBBA','SOFA',true,true),
  ('CHLB','Chaise Big','SUNBBA','SOFA',true,false),
  ('CHLS','Chaise Small','SUNBBA','SOFA',true,false),
  -- SUNBBA individualitzats
  ('CR','Coixí Gran','SUNBBA','INDIVIDUAL',true,false),
  ('CR_M','Coixí Mitjà','SUNBBA','INDIVIDUAL',true,false),
  ('MC','Coixí Petit','SUNBBA','INDIVIDUAL',true,false),
  ('PUF','The Pouf','SUNBBA','INDIVIDUAL',true,false)
on conflict (tenant_id, code) do update
  set name=excluded.name, family=excluded.family,
      bom_active=excluded.bom_active, sold_on_web=excluded.sold_on_web;

-- ============================================================================
-- BOM (escandalls) — via lookup per nom + color il·lustratiu.
-- Si un component no existeix, simplement no insereix aquella línia (segur).
-- Es neteja primer el BOM de cada tenant per evitar duplicats en re-execució.
-- ============================================================================


-- Helper: insereix línies BOM d'un producte donat tenant+code i una llista de
-- (component_name, color_code|null, qty, station, color_varies)
-- Patró: insert ... select amb join lateral i match per nom+color.

-- ── BUMBBA 1P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Bumbba', null::text, 1, 'E1', false),
  ('Pouf Enfundat','PGC', 1, 'E1', true),
  ('L Gran','PGC', 1, 'E1', true),
  ('Coixí Mitjà Muntat','PGC', 1, 'KANBAN', true),
  ('Potes Blanques', null, 4, 'E0', true),
  ('Manual Bumbba ES', null, 1, 'E0', false),
  ('Etiqueta Bumbba', null, 1, 'E0', false),
  ('Cola Calenta', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='1P';

-- ── BUMBBA 2P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Bumbba', null::text, 2, 'E1', false),
  ('Matalàs 160','PGC', 2, 'E1', true),
  ('L Gran','PGC', 2, 'E1', true),
  ('L Petita','PGC', 2, 'E1', true),
  ('Coixí Mitjà Muntat','PGC', 2, 'KANBAN', true),
  ('Coixí Petit Muntat','PGC', 2, 'KANBAN', true),
  ('Potes Blanques', null, 12, 'E0', true),
  ('Manual Bumbba ES', null, 1, 'E0', false),
  ('Funda Matalàs 160','PGC', 2, 'E1', true)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='2P';

-- ── BUMBBA 3P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Matalàs 190','PGC', 2, 'E1', true),
  ('L Gran','PGC', 2, 'E1', true),
  ('L Petita','PGC', 2, 'E1', true),
  ('Coixí Gran Muntat','PGC', 2, 'KANBAN', true),
  ('Caixa Bumbba', null::text, 2, 'E1', false),
  ('Potes Blanques', null, 12, 'E0', true),
  ('Manual Bumbba ES', null, 1, 'E0', false),
  ('Etiqueta Bumbba', null, 2, 'E0', false),
  ('Cola Calenta', null, 2, 'E1', false),
  ('Funda Matalàs 190','PGC', 2, 'E1', true)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='3P';

-- ── BUMBBA CHL ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Bumbba', null::text, 4, 'E1', false),
  ('Matalàs 190','PGC', 4, 'E1', true),
  ('L Gran','PGC', 3, 'E1', true),
  ('L Petita','PGC', 2, 'E1', true),
  ('Coixí Gran Muntat','PGC', 3, 'KANBAN', true),
  ('Coixí Petit Muntat','PGC', 2, 'KANBAN', true),
  ('Potes Blanques', null, 12, 'E0', true),
  ('Manual Bumbba ES', null, 1, 'E0', false),
  ('Funda Matalàs 190','PGC', 4, 'E1', true)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='CHL';

-- ── BUMBBA CRN ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Bumbba', null::text, 4, 'E1', false),
  ('Matalàs 190','PGC', 4, 'E1', true),
  ('L Gran','PGC', 5, 'E1', true),
  ('L Petita','PGC', 2, 'E1', true),
  ('Coixí Gran Muntat','PGC', 3, 'KANBAN', true),
  ('Coixí Petit Muntat','PGC', 2, 'KANBAN', true),
  ('Coixí Rinconera Muntat','PGC', 1, 'KANBAN', true),
  ('Potes Blanques', null, 12, 'E0', true),
  ('Manual Bumbba ES', null, 1, 'E0', false),
  ('Funda Matalàs 190','PGC', 4, 'E1', true)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='CRN';

-- ── BUMBBA PUF ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Pouf', null::text, 1, 'E1', false),
  ('Pouf Enfundat','PGC', 2, 'E1', true),
  ('Manual Pouf/Braços', null, 1, 'E0', false),
  ('Funda Pouf','PGC', 1, 'E1', true),
  ('Funda Interior Pouf', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='PUF';

-- ── BUMBBA BRAZO ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Plain', null::text, 1, 'E1', false),
  ('Braç Enfundat','PGC', 2, 'E1', true),
  ('Manual Pouf/Braços', null, 1, 'E0', false),
  ('Funda Braç','PGC', 2, 'E1', true)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='BRAZO';

-- ── BUMBBA CR / CR_M / MC / RAC ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Farcit Gran', null::text, 1, 'E3', false),
  ('Funda Coixí Gran','PGC', 1, 'E3', true),
  ('Bossa Buit', null, 1, 'E2', false),
  ('Caixa Plain', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='CR';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Farcit Medi', null::text, 1, 'E3', false),
  ('Funda Coixí Mitjà','PGC', 1, 'E3', true),
  ('Bossa Buit', null, 1, 'E2', false),
  ('Caixa Plain', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='CR_M';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Farcit Petit', null::text, 1, 'E3', false),
  ('Funda Coixí Petit','PGC', 1, 'E3', true),
  ('Caixa Plain', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='MC';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Farcit Rinconera', null::text, 1, 'E3', false),
  ('Funda Coixí Rinconera','PGC', 1, 'E3', true),
  ('Bossa Buit', null, 1, 'E2', false),
  ('Caixa Plain', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='RAC';

-- ── BUMBBA CL190 / CL160 ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Matalàs 190','PGC', 1, 'E1', true),
  ('Caixa Plain', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='CL190';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Matalàs 160','PGC', 1, 'E1', true),
  ('Caixa Plain', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='CL160';

-- ── BUMBBA TB_IND / TB_IND_P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('L Gran','PGC', 2, 'E1', true),
  ('Potes Blanques', null, 4, 'E0', true),
  ('Caixa Plain', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='TB_IND';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('L Petita','PGC', 2, 'E1', true),
  ('Potes Blanques', null, 4, 'E0', true),
  ('Caixa Plain', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='BUMBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='BUMBBA' and p.code='TB_IND_P';

-- ── SUNBBA 1P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Sunbba', null::text, 1, 'E1', false),
  ('Pouf Enfundat','PC04', 1, 'E1', true),
  ('L Gran','PC04', 1, 'E1', true),
  ('Coixí Mitjà Muntat','PC04', 1, 'KANBAN', true),
  ('Potes Blanques', null, 4, 'E0', true),
  ('Manual Sunbba', null, 1, 'E0', false),
  ('Etiqueta Sunbba', null, 1, 'E0', false),
  ('Cola Calenta', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='SUNBBA' and p.code='1P';

-- ── SUNBBA 2P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Sunbba', null::text, 2, 'E1', false),
  ('Matalàs 160','PC04', 2, 'E1', true),
  ('L Gran','PC04', 2, 'E1', true),
  ('Coixí Mitjà Muntat','PC04', 2, 'KANBAN', true),
  ('Potes Blanques', null, 12, 'E0', true),
  ('Manual Sunbba', null, 1, 'E0', false),
  ('Etiqueta Sunbba', null, 2, 'E0', false),
  ('Cola Calenta', null, 2, 'E1', false),
  ('Funda Matalàs 160','PC04', 2, 'E1', true)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='SUNBBA' and p.code='2P';

-- ── SUNBBA 3P ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Sunbba', null::text, 2, 'E1', false),
  ('Matalàs 190','PC04', 2, 'E1', true),
  ('L Gran','PC04', 2, 'E1', true),
  ('L Petita','PC04', 2, 'E1', true),
  ('Coixí Gran Muntat','PC04', 2, 'KANBAN', true),
  ('Potes Blanques', null, 12, 'E0', true),
  ('Manual Sunbba', null, 1, 'E0', false),
  ('Etiqueta Sunbba', null, 2, 'E0', false),
  ('Cola Calenta', null, 2, 'E1', false),
  ('Funda Matalàs 190','PC04', 2, 'E1', true)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='SUNBBA' and p.code='3P';

-- ── SUNBBA CHL_190_160 ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Sunbba', null::text, 4, 'E1', false),
  ('Matalàs 190','PC04', 2, 'E1', true),
  ('Matalàs 160','PC04', 2, 'E1', true),
  ('L Gran','PC04', 3, 'E1', true),
  ('Coixí Gran Muntat','PC04', 3, 'KANBAN', true),
  ('Potes Blanques', null, 24, 'E0', true),
  ('Manual Sunbba', null, 1, 'E0', false),
  ('Etiqueta Sunbba', null, 4, 'E0', false),
  ('Cola Calenta', null, 4, 'E1', false),
  ('Funda Matalàs 190','PC04', 2, 'E1', true),
  ('Funda Matalàs 160','PC04', 2, 'E1', true)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='SUNBBA' and p.code='CHL_190_160';

-- ── SUNBBA CHLB ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Sunbba', null::text, 4, 'E1', false),
  ('Matalàs 190','PC04', 4, 'E1', true),
  ('L Gran','PC04', 3, 'E1', true),
  ('Coixí Gran Muntat','PC04', 3, 'KANBAN', true),
  ('Potes Blanques', null, 24, 'E0', true),
  ('Funda Matalàs 190','PC04', 4, 'E1', true)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='SUNBBA' and p.code='CHLB';

-- ── SUNBBA CHLS ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Sunbba', null::text, 4, 'E1', false),
  ('Matalàs 160','PC04', 4, 'E1', true),
  ('L Gran','PC04', 3, 'E1', true),
  ('Coixí Mitjà Muntat','PC04', 3, 'KANBAN', true),
  ('Potes Blanques', null, 24, 'E0', true),
  ('Funda Matalàs 160','PC04', 4, 'E1', true)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='SUNBBA' and p.code='CHLS';

-- ── SUNBBA CR / CR_M / MC ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Farcit Gran', null::text, 1, 'E3', false),
  ('Funda Coixí Gran','PC04', 1, 'E3', true),
  ('Bossa Buit', null, 1, 'E2', false),
  ('Caixa Sunbba', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='SUNBBA' and p.code='CR';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Farcit Medi', null::text, 1, 'E3', false),
  ('Funda Coixí Mitjà','PC04', 1, 'E3', true),
  ('Bossa Buit', null, 1, 'E2', false),
  ('Caixa Sunbba', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='SUNBBA' and p.code='CR_M';

insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Farcit Petit', null::text, 1, 'E3', false),
  ('Funda Coixí Petit','PC04', 1, 'E3', true),
  ('Caixa Sunbba', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='SUNBBA' and p.code='MC';

-- ── SUNBBA PUF ──
insert into bom (product_id, component_id, quantity, station, color_varies)
select p.id, c.id, v.qty, v.station, v.cv
from products p
join lateral (values
  ('Caixa Pouf', null::text, 1, 'E1', false),
  ('Pouf Enfundat','PC04', 2, 'E1', true),
  ('Manual Pouf', null, 1, 'E0', false),
  ('Etiqueta Sunbba', null, 1, 'E0', false),
  ('Funda Pouf','PC04', 1, 'E1', true),
  ('Funda Interior Pouf', null, 1, 'E1', false),
  ('Cola Calenta', null, 1, 'E1', false)
) as v(cname,ccolor,qty,station,cv) on true
join components c on c.tenant_id='SUNBBA' and c.name=v.cname and c.color_code is not distinct from v.ccolor
where p.tenant_id='SUNBBA' and p.code='PUF';

-- ============================================================================
-- PREUS
-- ============================================================================
delete from prices where product_id in (select id from products where tenant_id in ('BUMBBA','SUNBBA'));

-- ── BUMBBA PROPOSTA (fabricació/majorista) per mida ──
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

-- ── BUMBBA RETAIL (representatiu, IVA inclòs) ──
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

-- ── SUNBBA RETAIL ──
insert into prices (product_id, price_type, size, amount, vat_included)
select p.id, 'RETAIL', null, v.amount, true
from products p
join lateral (values
  ('3P',994.00),
  ('CHL_190_160',1897.00)
) as v(code,amount) on true
where p.tenant_id='SUNBBA' and p.code=v.code;

-- ============================================================================
-- COMANDES A PROVEÏDOR — Tarracó (2 camions)
-- ============================================================================
delete from purchase_order_lines where order_id in
  (select po.id from purchase_orders po join suppliers s on s.id=po.supplier_id where s.name='Tarracó');
delete from purchase_orders where supplier_id in (select id from suppliers where name='Tarracó');

-- Camió #1
with s as (select id from suppliers where name='Tarracó' limit 1),
ins as (
  insert into purchase_orders (supplier_id, reference, truck_number, order_date, m3_used, m3_limit, notes)
  select s.id, 'tarraco_order_2026-04-08', 1, date '2026-04-22', 9.996, 10,
         '679 u. Marge +15%, corner +20%. Color dominant Light Green (PVC).' from s
  returning id
)
insert into purchase_order_lines (order_id, component_sku, description, quantity, is_carry_along)
select ins.id, v.sku, v.descr, v.qty, v.carry
from ins
join lateral (values
  ('SB1_C_CR_FUN_PVC','Funda Coixí Gran Light Green',51,false),
  ('SB1_C_MC_FUN_PVC','Funda Coixí Petit Light Green',39,false),
  ('SB1_C_RAC_FUN_PVC','Funda Coixí Rinconera Light Green',7,false),
  ('FARCIT_RAC','Farcit Rinconera',6,false),
  ('FARCIT_GR','Farcit Gran',96,false),
  ('FARCIT_PT','Farcit Petit',480,false),
  ('POT_BL','Potes blanques (carry-along)',1000,true),
  ('POT_NG','Potes negres (carry-along)',600,true),
  ('BOSSA','Bosses al buit (carry-along)',160,true)
) as v(sku,descr,qty,carry) on true;

-- Camió #2
with s as (select id from suppliers where name='Tarracó' limit 1),
ins as (
  insert into purchase_orders (supplier_id, reference, truck_number, order_date, m3_used, m3_limit, notes)
  select s.id, 'tarraco_order_2026-04-08', 2, date '2026-05-15', 9.812, 10,
         '707 u. Segon camió de la mateixa comanda.' from s
  returning id
)
insert into purchase_order_lines (order_id, component_sku, description, quantity, is_carry_along)
select ins.id, v.sku, v.descr, v.qty, v.carry
from ins
join lateral (values
  ('SB1_C_CR_FUN_PVC','Funda Coixí Gran Light Green',71,false),
  ('SB1_C_MC_FUN_PVC','Funda Coixí Petit Light Green',55,false),
  ('SB1_C_RAC_FUN_PVC','Funda Coixí Rinconera Light Green',5,false),
  ('FARCIT_GR','Farcit Gran',96,false),
  ('FARCIT_PT','Farcit Petit',480,false),
  ('POT_BL','Potes blanques (carry-along)',1000,true),
  ('POT_NG','Potes negres (carry-along)',600,true),
  ('BOSSA','Bosses al buit (carry-along)',240,true)
) as v(sku,descr,qty,carry) on true;

-- ============================================================================
-- COMPROVACIONS RÀPIDES (opcional, descomenta per veure resultats)
-- ============================================================================
-- select tenant_id, count(*) components from components group by tenant_id;
-- select tenant_id, count(*) productes from products group by tenant_id;
-- select p.tenant_id, p.code, count(b.id) linies_bom from products p
--   left join bom b on b.product_id=p.id group by 1,2 order by 1,2;
-- select * from components where stock_actual < 0 order by tenant_id, stock_actual;
