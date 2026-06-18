# CONTEXT — App Control Proyecto Zero Stock (ZeroStock)

> Font de veritat del domini. Tota la app es construeix sobre aquest model.
> Dades reals a **2026-06-18**. Fàbrica de sofàs modulars a **Amposta**.

---

## 1. Negoci

Fàbrica de sofàs modulars amb **2 marques (tenants)**:

| Tenant | Web | Estat |
|--------|-----|-------|
| **BUMBBA** | bumbba.com | Marca principal i madura (palette pana, catàleg complet) |
| **SUNBBA** | sunbba.com | 2a marca, relançament — poc madura, molts buits de model |
| ~~NUBBA~~ | — | Pseudo-tenant **només** per a vista agregada. **Ignorar** com a marca real |

**Model operatiu (Zero Stock):**
1. Es **compren** components (fundes, farcits, estructures "L", potes, matalassos, caixes).
2. Es **munten** en estacions → sofà acabat.
3. Cada producte acabat té un **escandall (BOM)**: quins components consumeix i quants.
4. Transportistes recullen el sofà acabat i el porten al client final.
5. Mundo Parquet cobra **part del benefici** per unitat.

**Estacions de producció (camp `station` al BOM):**
| Codi | Significat |
|------|-----------|
| `E0` | Accessoris / manuals / potes |
| `E1` | Muntatge i encaixat |
| `E2` | Buit (bossa al buit) |
| `E3` | Farciment de coixins (funda + farcit) |
| `KANBAN` | Coixins muntats — buffer WIP (normalment stock 0) |
| `COSTE` | Línies de cost teòric (mà d'obra, fundes consumides) — **referència, NO és estoc físic** |

> ⚠️ **Stock negatiu** = descuadre de comptabilitat de magatzem (conegut), no necessàriament falta real. La app l'ha de marcar però sense alarmar com a ruptura.

---

## 2. Codis de color

**BUMBBA — pana (`fabric_code`), 3 colors actuals:**
| Codi | Color |
|------|-------|
| `PVC` | Light Green |
| `PGC` | Arctic Sand |
| `PGO` | Shadow Grey |

> Palette antiga encara visible a web (no produïda): PBR=Light Ivory, PAI=Blue Wave, PMC=Brown Sugar, PVB=Forest Green, Dark Grey.

**BUMBBA — estructura "L" (sufix SKU):** `GC`=Arctic Sand · `GO`=Shadow Grey · `GR`=Dark Grey · `VC`=Light Green · `BG`/`B`=Beige

**SUNBBA — `fabric_code`, 4 colors:**
| Codi | Color |
|------|-------|
| `PC04` | Light Ivory |
| `PC37` | Green Olive |
| `PC82` | Grey Stone |
| `PC99` | Graphite Grey |

---

## 3. Categories de components

| Categoria | Conté |
|-----------|-------|
| `TELA` | Fundes (coixí gran/petit/mitjà/rinconera, matalàs 190/160, braç, pouf, interior pouf) |
| `ALTRES` | Farcits (Gran/Petit/Medi/Rinconera), núclis pouf, cola calenta (HOTGLUE) |
| `ESTRUCTURES` | L Gran, L Petita, Braç |
| `MATALASSOS` | 190, 160 (per color) |
| `PATES` | Potes blanques / negres |
| `COIXINS` | Coixins muntats (buffer, normalment 0) |
| `EMBALATGE` | Caixa BUMBBA/SUNBBA/Plain/Pouf, Bossa buit, Manuals, Etiquetes |

---

## 4. Productes acabats (variants = fabric × leg)

### BUMBBA
**Sofàs complets (ACTIUS):** 1P (15 var) · 2P (15) · 3P (36) · CHL / CHL_160 (+combos 160/190, 190/160) · CRN / CRN_160 (+combos)
**Famílies a web amb BOM INACTIU** (sistema antic, encara es venen): WWL Wonderwall · PLD Prelude · SBM Stand By Me · PFG Feeling Good → *revisar si cal mantenir BOM*
**Individualitzats:** BRAZO · PUF · CR (coixí gran) · CR_M (mitjà) · MC (petit) · RAC (rinconera) · CL190 · CL160 · TB_IND (L gran) · TB_IND_P (L petita)

### SUNBBA
**Sofàs complets:** 1P (8) · 2P (8) · 3P (8) · CHL_190_160 (8) · CHLB Chaise Big (8) · CHLS Chaise Small (8)
**Individualitzats:** CR · CR_M · MC · PUF
> SUNBBA **NO** té família Corner ni L/Braç individuals (diferència vs BUMBBA).

---

## 5. Escandalls (BOM) — resum

`[c]` = el component canvia segons color de tela. Quantitats per unitat produïda.

### BUMBBA
- **1P:** Caixa BUMBBA ×1 · Pouf enfundat ×1[c] · L Gran ×1[c] · Coixí Mitjà ×1[c] (KANBAN) · Potes ×4 · Manual ×1 · Etiqueta ×1 · Cola ×1
- **2P:** Caixa ×2 · Matalàs 160 ×2[c] · L Gran ×2[c] · L Petita ×2[c] · Coixí Mitjà ×2[c] · Coixí Petit ×2[c] · Potes ×12 · Manual ×1 · Funda matalàs 160 ×2[c]
- **3P:** Matalàs 190 ×2[c] · Coixí 90 ×2[c] · Caixa ×2 · Potes ×12 · Manual ×1 · Etiqueta ×2 · Cola ×2 · Funda matalàs 190 ×2[c]
- **CHL:** Caixa ×4 · Matalàs 190 ×4[c] · L Gran ×3[c] · L Petita ×2[c] · Coixí Gran ×3[c] · Coixí Petit ×2[c] · Potes ×12 · Manual ×1 · Funda matalàs 190 ×4[c]
- **CRN:** Caixa ×4 · Matalàs 190 ×4[c] · L Gran ×5[c] · L Petita ×2[c] · Coixí Gran ×3[c] · Coixí Petit ×2[c] · Coixí Rinconera ×1[c] · Potes ×12 · Manual ×1 · Funda matalàs 190 ×4[c]
- *Variants 160 i combos = mateixa estructura canviant matalàs/funda + mà d'obra + cola per caixa*
- **PUF:** Caixa Pouf ×1 · Pouf enfundat ×2[c] · Manual Pouf ×1 · Funda Pouf ×1[c] · Funda interior Pouf ×1
- **BRAZO:** Caixa Plain ×1 · Braç enfundat ×2[c] · Manual Braços ×1 · Funda braç ×2[c]
- **CR / CR_M / MC / RAC:** Relleno + Funda[c] (+ Bossa buit en CR/CR_M/RAC) + Caixa Plain ×1
- **CL190 / CL160:** Matalàs ×1 + Caixa Plain ×1
- **TB_IND / TB_IND_P:** L ×2[c] + Potes ×4 + Caixa Plain ×1

### SUNBBA
- **1P:** Caixa SUNBBA ×1 · Pouf enfundat ×1[c] · L Gran ×1[c] · Coixí Mitjà ×1[c] (KANBAN) · Potes ×4 · Manual ×1 · Etiqueta ×1 · Cola ×1 · Mà d'obra ×1
- **2P:** Caixa ×2 · Matalàs 160 ×2[c] · L Gran ×2[c] · Coixí Mitjà ×2[c] · Potes ×12 · Manual ×1 · Etiqueta ×2 · Cola ×2 · Funda matalàs 160 ×2[c]
- **3P:** Caixa ×2 · Matalàs 190 ×2[c] · L Gran ×2[c] · Coixí Gran ×2[c] · Potes ×12 · Manual ×1 · Etiqueta ×2 · Cola ×2 · Funda matalàs 190 ×2[c]
- **CHL_190_160:** Caixa ×4 · Matalàs 190 ×2[c] · Matalàs 160 ×2[c] · L Gran ×3[c] · Coixí Gran ×3[c] · Potes ×24 · Manual ×1 · Etiqueta ×4 · Cola ×4 · Fundes matalàs 190 ×2 + 160 ×2[c]
- **CHLB:** Caixa ×4 · Matalàs 190 ×4[c] · L Gran ×3[c] · Coixí Gran ×3[c] · Potes ×24 · Funda matalàs 190 ×4[c]
- **CHLS:** Caixa ×4 · Matalàs 160 ×4[c] · L Gran ×3[c] · Coixí Mitjà ×3[c] · Potes ×24 · Funda matalàs 160 ×4[c]
- **CR / CR_M / MC / PUF:** anàlegs a BUMBBA amb Caixa SUNBBA

---

## 6. Preus

### BUMBBA — RETAIL (bumbba.com, EUR, IVA inclòs)
1 seater 322–484 · 2 seater 661,50–758,10 · 3 seater 696,50–793,80 · Chaise S/M/B 1176,70/1189,30/1249,50 (fins 1334,90) · Corner S/M/B 1313,90/1352,40/1452,50 (fins 1522,50) · Wonderwall 518 · Stand by me 594,30 · Prelude 625,80 · Feeling Good 549,50 · Pouf 290,50 · Mattress 230,30 · L-pieces 116,20 · Arms 98 · Arm cushion 31,50 · Back cushion 76,30 · Extra Covers 258,30–608,30

### BUMBBA — PROPOSTA (fabricació/majorista, = full PROPOSTA PREUS TARRACO)
| Model | 80 | 90 |
|-------|----|----|
| 3 Seater 190 | 292,80 | 309,60 |
| 2 Seater / 3-160 | 289,60 | 305,20 |
| Chaiselong | 518,69 | 552,29 |
| Corner | 596,60 | 630,20 |
| Wonderwall | 218,80 | 235,60 |
| Stand by me | 243,80 | 260,60 |
| Prelude | 261,80 | 278,60 |
| Feeling Good | 233,80 | 250,60 |
| Pouf | 124,00 (70) | 128,17 (80) |

Components proposta: Coixí gran 25,75 · Coixí mitjà/petit 12,00 · L individual 44,56 · Braç 89,00 · Funda extra 29,60

### SUNBBA — RETAIL (sunbba.com) — només 2 productes
3 Seater 994,00–1197,00 · Medium Chaise Longue 1897,00–2096,50. *(No hi ha tarifa proposta/majorista a la BD.)*

---

## 7. Proveïdor tèxtil — TARRACÓ

Tarraco Confort Upholstery SL · www.tarraco.eu · +34 679 983 822
Comercial: m.marti@tarraco.eu (M. Martí Jr.) · Compres: a.rodriguez@tarraco.eu

Subministra **FUNDES (pana/tela) + FARCITS** de BUMBBA **i** SUNBBA (fundes PC04/PC37/PC82/PC99). Camions compartits **10 m³** des de Polònia → Tarragona. L'espai lliure es completa amb **potes i bosses al buit** (altres proveïdors, **NO** compten contra els 10 m³).

**Comanda enviada** (tarraco_order 2026-04-08, 2 camions, marge +15%, corner +20%):
- Camió #1 (22 Abr 2026, 679 u, 9,996/10 m³)
- Camió #2 (15 Mai 2026, 707 u, 9,812/10 m³)
- Vendes que la justifiquen: Març '26 = 68u (63% Light Green) · Abril '26 = 19u. Velocitat ~34 LG/setmana orgànic, projecció ~45 amb ads.

---

## 8. Què ha de mostrar la app

- **Inventari** per tenant i categoria (stock actual per SKU/color).
- **Entrades i sortides** de materials (moviments).
- **Indicadors negatius**: stock < 0 (marcar com descuadre conegut, no ruptura).
- **Producció**: en produir X unitats d'un producte → descompte automàtic de components segons BOM.
- **Marges**: preu proposta − cost components per producte.
- **Alertes Sunbba**: SKU a 0 (buits de model).
- **Dashboards** agregats (vista Nubba = Bumbba + Sunbba).
- **Comandes a proveïdor** (Tarracó): seguiment camions, m³, colors.
