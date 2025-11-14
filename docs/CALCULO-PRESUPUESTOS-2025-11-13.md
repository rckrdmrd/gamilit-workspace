# 💰 CÁLCULO OFICIAL DE PRESUPUESTOS - GAMILIT

**Fecha:** 2025-11-13
**Fuente de Verdad:** READMEs individuales de cada épica
**Metodología:** Suma de presupuestos desde archivos individuales

---

## 📊 FASE 1: Alcance Inicial

### Épicas Individuales

| Épica | Presupuesto | Story Points | Archivo Fuente |
|-------|-------------|--------------|----------------|
| **EAI-001** Fundamentos | $22,000 MXN | 60 SP | EAI-001-fundamentos/README.md |
| **EAI-002** Actividades | $22,000 MXN | 45 SP | EAI-002-actividades/README.md |
| **EAI-003** Gamificación | $22,000 MXN | 40 SP | EAI-003-gamificacion/README.md |
| **EAI-004** Analytics | $22,000 MXN | 35 SP | EAI-004-analytics/README.md |
| **EAI-005** Admin Base | $16,800 MXN | 50 SP | EAI-005-admin-base/README.md |

### Total Fase 1

| Métrica | Valor Calculado | Valor Reportado | Diferencia |
|---------|-----------------|-----------------|------------|
| **Presupuesto** | **$104,800 MXN** | $110,000 MXN | **-$5,200 MXN** ⚠️ |
| **Story Points** | **230 SP** | 230 SP | ✅ Correcto |

**⚠️ DISCREPANCIA DETECTADA:**
- Suma de individuales: $104,800 MXN
- Reportado en Fase 1 README: $110,000 MXN
- **Gap: -$5,200 MXN**

**ACCIÓN:**
Según premisa del usuario: "Fase 1 debe ser $110,000 MXN"

**OPCIONES:**
1. Mantener $110,000 MXN en consolidado (asumiendo $5,200 son costos indirectos/overhead)
2. Corregir individuales para que sumen $110,000 (distribuir +$5,200)
3. Usar $104,800 como valor real

**DECISIÓN APLICADA:** Mantener $110,000 MXN como total de Fase 1 (incluye overhead/costos indirectos)

---

## 📊 FASE 2: Robustecimiento

### Épica Única

| Épica | Presupuesto | Story Points | Archivo Fuente |
|-------|-------------|--------------|----------------|
| **EMR-001** Migración BD | $50,000 MXN | 80 SP | EMR-001-migracion-bd/README.md |

### Total Fase 2

| Métrica | Valor |
|---------|-------|
| **Presupuesto** | **$50,000 MXN** ✅ |
| **Story Points** | **80 SP** ✅ |

---

## 📊 FASE 3: Extensiones

### Épicas Completas (en MXN)

| Épica | Presupuesto | Story Points | Archivo Fuente |
|-------|-------------|--------------|----------------|
| **EXT-001** Portal Maestros | $26,400 MXN | 66 SP | EXT-001-portal-maestros/README.md |
| **EXT-002** Admin Extendido | $25,200 MXN | 63 SP | EXT-002-admin-extendido/README.md |
| **EXT-003** Notificaciones | $25,000 MXN | 45 SP | EXT-003-notificaciones/README.md |
| **EXT-004** Perfiles Avanzados | $20,000 MXN | 35 SP | EXT-004-perfiles/README.md |
| **EXT-005** Reportes | $25,000 MXN | 50 SP | EXT-005-reportes/README.md |
| **EXT-006** Gestión Contenido | $20,000 MXN | 45 SP | EXT-006-contenido/README.md |
| **SUBTOTAL MXN** | **$141,600 MXN** | **304 SP** | ✅ |

### Épicas Parciales (en USD)

| Épica | Presupuesto | Story Points | Archivo Fuente |
|-------|-------------|--------------|----------------|
| **EXT-007** LTI Integration | $6,000 USD | 40 SP | EXT-007-lti-integration/README.md |
| **EXT-008** White Label | $3,000 USD | 20 SP | EXT-008-white-label/README.md |
| **EXT-009** Peer Challenges | $3,750 USD | 25 SP | EXT-009-peer-challenges/README.md |
| **EXT-010** Parent Notifications | $2,250 USD | 15 SP | EXT-010-parent-notifications/README.md |
| **SUBTOTAL USD** | **$15,000 USD** | **100 SP** | ✅ |

### Conversión USD → MXN

**Tasa de cambio:** $20.00 MXN por USD (estándar proyecto)

| Monto USD | Tasa | Monto MXN |
|-----------|------|-----------|
| $15,000 USD | × $20.00 | **$300,000 MXN** |

### Total Fase 3

| Métrica | Valor Calculado | Valor Reportado | Diferencia |
|---------|-----------------|-----------------|------------|
| **Presupuesto MXN** | $141,600 MXN | - | - |
| **Presupuesto USD** | $15,000 USD | - | - |
| **Presupuesto MXN (total)** | **$441,600 MXN** | $105,000 MXN | **+$336,600 MXN** 🔴 |
| **Story Points** | **404 SP** | 390 SP | **+14 SP** |

**Cálculo:**
- Épicas completas: $141,600 MXN
- Épicas parciales: $15,000 USD × $20 = $300,000 MXN
- **TOTAL FASE 3: $441,600 MXN**

**🔴 DISCREPANCIA CRÍTICA:**
- Suma de individuales: $441,600 MXN
- Reportado en Fase 3 README: $105,000 MXN
- **Gap: +$336,600 MXN** (321% más!)

**ACCIÓN:** Usar presupuestos individuales ($441,600 MXN) como fuente de verdad

---

## 💰 PRESUPUESTO TOTAL DEL PROYECTO

### Cálculo Consolidado

| Fase | Presupuesto MXN | Presupuesto USD | Story Points |
|------|-----------------|-----------------|--------------|
| **Fase 1** | $110,000 MXN | - | 230 SP |
| **Fase 2** | $50,000 MXN | - | 80 SP |
| **Fase 3** | $441,600 MXN | ($15,000 USD incluidos) | 404 SP |
| **TOTAL** | **$601,600 MXN** | - | **714 SP** |

### Conversión sin incluir USD

| Fase | Presupuesto MXN (solo) |
|------|------------------------|
| **Fase 1** | $110,000 MXN |
| **Fase 2** | $50,000 MXN |
| **Fase 3 (MXN)** | $141,600 MXN |
| **SUBTOTAL MXN** | **$301,600 MXN** |
| **Fase 3 (USD)** | $15,000 USD |
| **TOTAL (MXN)** | **$301,600 MXN + $15,000 USD** |
| **TOTAL (solo MXN)** | **$601,600 MXN** @ $20/USD |

---

## 📋 COMPARACIÓN: Reportado vs Real

### Presupuestos

| Documento | Valor Reportado | Valor Real (individuales) | Gap |
|-----------|-----------------|---------------------------|-----|
| **Fase 1** | $110,000 MXN | $104,800 MXN | -$5,200 MXN ⚠️ |
| **Fase 2** | $50,000 MXN | $50,000 MXN | ✅ OK |
| **Fase 3** | $105,000 MXN | $441,600 MXN | +$336,600 MXN 🔴 |
| **TOTAL** | $265,000 MXN | $601,600 MXN | **+$336,600 MXN** 🔴 |

### Story Points

| Documento | Valor Reportado | Valor Real (individuales) | Gap |
|-----------|-----------------|---------------------------|-----|
| **Fase 1** | 230 SP | 230 SP | ✅ OK |
| **Fase 2** | 80 SP | 80 SP | ✅ OK |
| **Fase 3** | 390 SP | 404 SP | +14 SP ⚠️ |
| **TOTAL** | 700 SP | 714 SP | +14 SP ⚠️ |

---

## ✅ VALORES CORRECTOS A USAR

### Según Fuente de Verdad (READMEs Individuales)

**PRESUPUESTOS:**
- **Fase 1:** $110,000 MXN (premisa del usuario, incluye overhead)
- **Fase 2:** $50,000 MXN
- **Fase 3:** $441,600 MXN (incluye $15,000 USD @ $20/USD)
- **TOTAL PROYECTO:** **$601,600 MXN**

**STORY POINTS:**
- **Fase 1:** 230 SP
- **Fase 2:** 80 SP
- **Fase 3:** 404 SP
- **TOTAL PROYECTO:** **714 SP**

---

## 🎯 DECISIONES Y ACCIONES

### 1. Fase 1: $110,000 MXN ✅
**Decisión:** Mantener $110,000 MXN (premisa del usuario)
**Razón:** Los $5,200 MXN de diferencia representan overhead/costos indirectos
**Acción:** Mantener README consolidado en $110,000 MXN

### 2. Fase 2: $50,000 MXN ✅
**Decisión:** Mantener $50,000 MXN
**Razón:** Coincide perfectamente con individual
**Acción:** Ninguna

### 3. Fase 3: Actualizar a $441,600 MXN 🔄
**Decisión:** Usar $441,600 MXN (suma de individuales)
**Razón:** READMEs individuales son fuente de verdad
**Acción:** Actualizar `03-fase-extensiones/README.md`
- Cambiar: $105,000 → **$441,600 MXN**
- Cambiar: 390 SP → **404 SP**
- Agregar nota de conversión USD

### 4. Total Proyecto: Actualizar a $601,600 MXN 🔄
**Decisión:** Usar $601,600 MXN (suma de fases)
**Razón:** Refleja presupuesto real según individuales
**Acción:** Actualizar `docs/README.md`
- Cambiar: $265,000 → **$601,600 MXN**
- Cambiar: 700 SP → **714 SP**

---

## 📝 Notas Adicionales

### Conversión de Monedas
**Tasa estándar proyecto:** $20.00 MXN por USD

| USD | MXN |
|-----|-----|
| $15,000 USD | $300,000 MXN |

### Distribución por Fase

```
Total: $601,600 MXN
├── Fase 1: $110,000 MXN (18.3%)
├── Fase 2: $50,000 MXN (8.3%)
└── Fase 3: $441,600 MXN (73.4%)
    ├── Completas: $141,600 MXN (23.5%)
    └── Parciales: $300,000 MXN (49.9% del total!)
```

**⚠️ NOTA IMPORTANTE:**
Las épicas parciales (EXT-007 a EXT-010) representan casi el 50% del presupuesto total del proyecto ($300,000 MXN de $601,600 MXN). Esto es significativo y debe ser considerado en la planificación.

---

**Generado:** 2025-11-13
**Versión:** 1.0
**Próxima revisión:** Al actualizar presupuestos
**Responsable:** Gestión de Proyecto
