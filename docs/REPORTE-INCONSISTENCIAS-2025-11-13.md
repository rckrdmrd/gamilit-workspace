# 🚨 REPORTE DE INCONSISTENCIAS - DOCUMENTACIÓN GAMILIT

**Fecha:** 2025-11-13
**Generado por:** Validación Exhaustiva de Documentación
**Estado:** 🔴 CRÍTICO - Múltiples inconsistencias detectadas

---

## 📋 Resumen Ejecutivo

**Categorías de inconsistencias:**
1. 🔴 **CRÍTICO:** Presupuestos y Story Points no coinciden (Fase 3)
2. 🔴 **CRÍTICO:** Números de tablas/schemas/índices contradictorios
3. 🟡 **MEDIO:** Monedas mezcladas (USD vs MXN)
4. 🟡 **MEDIO:** Políticas RLS sobre-reportadas
5. 🟢 **BAJO:** Referencias a "Fase 4: Transversal" vs "90-transversal"

---

## 🔴 1. INCONSISTENCIA CRÍTICA: Presupuestos Fase 3

### Problema
Los presupuestos y Story Points reportados en `03-fase-extensiones/README.md` **NO COINCIDEN** con los valores en los READMEs individuales de cada épica.

### Comparación Detallada

#### Épicas Completas (EXT-001 a EXT-006)

| Épica | README Fase 3 | README Individual | Diferencia |
|-------|---------------|-------------------|------------|
| **EXT-001** | $15,000 MXN / 50 SP | $26,400 MXN / 66 SP | -$11,400 / -16 SP ❌ |
| **EXT-002** | $12,000 MXN / 45 SP | $25,200 MXN / 63 SP | -$13,200 / -18 SP ❌ |
| **EXT-003** | $10,000 MXN / 40 SP | $25,000 MXN / 45 SP | -$15,000 / -5 SP ❌ |
| **EXT-004** | $10,000 MXN / 35 SP | $20,000 MXN / 35 SP | -$10,000 / ✅ SP OK |
| **EXT-005** | $12,000 MXN / 50 SP | $25,000 MXN / 50 SP | -$13,000 / ✅ SP OK |
| **EXT-006** | $10,000 MXN / 40 SP | $20,000 MXN / 45 SP | -$10,000 / -5 SP ❌ |
| **SUBTOTAL** | **$69,000 MXN / 260 SP** | **$141,600 MXN / 304 SP** | **-$72,600 / -44 SP** ❌ |

#### Épicas Parciales (EXT-007 a EXT-010)

| Épica | README Fase 3 | README Individual | Diferencia |
|-------|---------------|-------------------|------------|
| **EXT-007** | $12,000 (¿MXN?) / 45 SP | $6,000 USD / 40 SP | ⚠️ Moneda / -5 SP |
| **EXT-008** | $10,000 (¿MXN?) / 35 SP | $3,000 USD / 20 SP | ⚠️ Moneda / -15 SP |
| **EXT-009** | $8,000 (¿MXN?) / 30 SP | $3,750 USD / 25 SP | ⚠️ Moneda / -5 SP |
| **EXT-010** | $6,000 (¿MXN?) / 20 SP | $2,250 USD / 15 SP | ⚠️ Moneda / -5 SP |
| **SUBTOTAL** | **$36,000 / 130 SP** | **$15,000 USD / 100 SP** | **⚠️ Moneda mixta** |

#### Total General Fase 3

| Documento | Presupuesto | Story Points | Épicas |
|-----------|-------------|--------------|--------|
| **README Fase 3** | $105,000 MXN | 390 SP | 10 |
| **READMEs Individuales** | $141,600 MXN + $15,000 USD | 404 SP | 10 |
| **Diferencia** | **~$236,600 MXN** 🔴 | **+14 SP** | ✅ |

**NOTA:** Asumiendo $15,000 USD ≈ $300,000 MXN @ $20 MXN/USD

### Impacto
🔴 **CRÍTICO** - No se puede confiar en las cifras de presupuesto reportadas. Requiere reconciliación urgente.

### Recomendación
1. Validar cuáles son los números correctos (¿individuales o consolidados?)
2. Actualizar todos los documentos para que coincidan
3. Definir política: ¿presupuestos en MXN o USD?
4. Agregar nota de conversión si se usan ambas monedas

---

## 🔴 2. INCONSISTENCIA CRÍTICA: Números de Base de Datos

### Problema
Los números de schemas, tablas, índices, funciones, triggers y RLS policies son **inconsistentes** entre documentos.

### Comparación entre Fuentes

**FUENTE DE VERDAD:** `90-transversal/inventarios/DATABASE_INVENTORY.yml` (2025-11-11, validación física)

| Métrica | docs/README.md | 02-fase-robustecimiento/README.md | 90-transversal/README.md | **DATABASE_INVENTORY.yml** ✅ |
|---------|----------------|-----------------------------------|--------------------------|------------------------------|
| **Schemas** | 13 | 13 | 13 | **14** ✅ |
| **Tablas** | 89 | 89 | 104 | **101** ✅ |
| **Índices** | 127 | 127 | 162 | **67** ✅ |
| **Funciones** | 28 | 28 | 36 | **62** ✅ |
| **Triggers** | 18 | 18 | 18 | **34** ✅ |
| **ENUMs** | - | - | 15 | **19** ✅ |
| **RLS Policies** | 45 | 45 | 45 | **24** ✅ |
| **Views** | - | - | 18 + 4 mat. | **12 + 4 mat.** ✅ |

### Análisis de Discrepancias

#### ✅ Schemas: 13 → 14
**Correcto:** 14 schemas
- Los 13 originales + `lti_integration` agregado en 2025-11-08

#### ❌ Tablas: 89 vs 101
**Correcto:** 101 tablas (según conteo físico de archivos .sql)
- `docs/README.md` y `02-fase-robustecimiento/README.md` reportan 89 (ERROR)
- `90-transversal/README.md` reporta 104 (cercano, pero impreciso)
- DATABASE_INVENTORY.yml: **101 tablas DDL** (validación física 2025-11-11)

**Diferencia:** +12 tablas no contabilizadas en docs principales

#### ❌ Índices: 127 vs 67
**Correcto:** 67 índices (según conteo físico)
- Sobre-reportados por 60 índices (+90% error) 🔴

#### ❌ Funciones: 28 vs 62
**Correcto:** 62 funciones
- Sub-reportadas por 34 funciones (-55% error) 🔴

#### ❌ Triggers: 18 vs 34
**Correcto:** 34 triggers
- Sub-reportados por 16 triggers (-47% error) 🔴

#### ❌ RLS Policies: 45 vs 24
**Correcto:** 24 políticas RLS
- Sobre-reportadas por 21 políticas (+88% error) 🔴

### Impacto
🔴 **CRÍTICO** - Métricas de arquitectura de BD incorrectas. Afecta credibilidad del proyecto.

### Recomendación
1. Usar **DATABASE_INVENTORY.yml** como única fuente de verdad
2. Actualizar `docs/README.md` con números correctos
3. Actualizar `02-fase-robustecimiento/README.md`
4. Agregar referencia: "Fuente: DATABASE_INVENTORY.yml (2025-11-11)"
5. Automatizar conteo físico para evitar desincronización futura

---

## 🟡 3. INCONSISTENCIA MEDIA: Monedas Mezcladas

### Problema
Las épicas parciales (EXT-007 a EXT-010) reportan presupuestos en **USD** en sus READMEs individuales, pero el README de Fase 3 no especifica moneda (asume MXN).

### Detalle
- **EXT-007:** $6,000 USD (README individual)
- **EXT-008:** $3,000 USD (README individual)
- **EXT-009:** $3,750 USD (README individual)
- **EXT-010:** $2,250 USD (README individual)
- **TOTAL:** $15,000 USD ≈ $300,000 MXN

### Impacto
🟡 **MEDIO** - Confusión en presupuesto total. ¿El total de Fase 3 incluye conversión USD?

### Recomendación
1. Estandarizar todos los presupuestos a MXN
2. Agregar nota de conversión: "USD convertido a MXN @ $20 por dólar"
3. Actualizar tabla de Fase 3 con conversiones

---

## 🟡 4. INCONSISTENCIA MEDIA: Test Coverage

### Problema
El test coverage reportado en Fase 1 tiene discrepancia entre **estimado** y **real**.

### Detalle
- **Estimado:** 88%
- **Real:** 18%
- **Gap:** -70% 🔴

**Nota:** Ya fue corregido en `01-fase-alcance-inicial/README.md` (línea 67, 86)

### Estado
✅ **RESUELTO** - Ya documentado correctamente como "88% estimado / 18% real"

---

## 🟢 5. INCONSISTENCIA BAJA: Referencias a Fase 4

### Problema
Inconsistencia en nomenclatura entre "Fase 4: Transversal" vs carpeta real "90-transversal"

### Detalle
- Carpeta física: `/docs/90-transversal/`
- Algunos documentos referencian: "Fase 4: Transversal"
- El README.md dice: "Fase 4: Contenido Transversal"

### Estado
🟢 **MENOR** - Solo afecta navegación, no funcionalidad

### Recomendación
1. Usar consistentemente: "90-transversal" o "Contenido Transversal"
2. No llamarlo "Fase 4" si está en carpeta "90-"

---

## 📊 Resumen de Correcciones Necesarias

### Archivos que requieren actualización

#### 1. `/docs/README.md` (Prioridad: 🔴 ALTA)
**Correcciones necesarias:**
- Línea 188: Actualizar "13 schemas" → "14 schemas"
- Línea 189: Actualizar "89 tablas" → "101 tablas"
- Línea 190: Actualizar "127 índices" → "67 índices"
- Línea 391: Actualizar "28 funciones" → "62 funciones"
- Línea 392: Actualizar "18 triggers" → "34 triggers"
- Línea 389: Actualizar "45 políticas RLS" → "24 políticas RLS"
- Línea 94: Validar presupuesto Fase 3: ¿$105,000 o $441,600 MXN?
- Línea 95: Validar Story Points Fase 3: ¿390 o 404 SP?

**Agregar:**
```markdown
**Fuente de métricas BD:** [DATABASE_INVENTORY.yml](./90-transversal/inventarios/DATABASE_INVENTORY.yml) (validación física 2025-11-11)
```

#### 2. `/docs/02-fase-robustecimiento/README.md` (Prioridad: 🔴 ALTA)
**Correcciones necesarias:**
- Línea 18: Actualizar "89 tablas" → "101 tablas"
- Actualizar tabla de "Objetos de Base de Datos" con números correctos del inventario

#### 3. `/docs/03-fase-extensiones/README.md` (Prioridad: 🔴 CRÍTICA)
**Decisión necesaria:**
- ¿Qué presupuestos son correctos: los individuales ($141,600) o el consolidado ($105,000)?
- ¿Qué Story Points son correctos: individuales (404) o consolidado (390)?

**Opciones:**
A. Corregir READMEs individuales para que coincidan con consolidado
B. Corregir consolidado para que coincida con individuales
C. Investigar y determinar valores reales

#### 4. `/docs/90-transversal/README.md` (Prioridad: 🟡 MEDIA)
**Correcciones necesarias:**
- Línea 38-39: Actualizar con números del DATABASE_INVENTORY.yml
- Línea 200-201: Actualizar métricas

---

## 🎯 Plan de Acción Recomendado

### ⏰ Inmediato (Hoy)
1. ✅ **Identificar fuente de verdad para presupuestos Fase 3**
   - Revisar contratos, facturas, o registros contables
   - Determinar si $105,000 o $441,600 MXN es correcto

2. ✅ **Actualizar métricas de BD en docs/README.md**
   - Usar DATABASE_INVENTORY.yml como fuente única
   - Agregar referencia a la fuente

### 📅 Corto Plazo (Esta Semana)
3. ⚠️ **Reconciliar presupuestos individuales vs consolidados**
   - Si individuales son correctos → actualizar Fase 3 README
   - Si consolidado es correcto → actualizar 10 READMEs individuales

4. ⚠️ **Estandarizar monedas**
   - Convertir todos a MXN
   - Agregar nota de conversión USD → MXN

### 📅 Mediano Plazo (Próxima Semana)
5. 🔧 **Automatizar validación de métricas**
   - Script que cuenta físicamente tablas/índices/funciones
   - CI/CD check que valida consistencia

6. 📝 **Crear CHANGELOG de correcciones**
   - Documentar todas las correcciones realizadas
   - Versionar documentación (v1.1)

---

## 📎 Archivos de Referencia

### Fuentes de Verdad Identificadas
1. **Base de Datos:** `90-transversal/inventarios/DATABASE_INVENTORY.yml` (2025-11-11)
2. **Presupuestos:** ⚠️ PENDIENTE - Determinar fuente oficial
3. **Story Points:** Individual READMEs vs Fase READMEs (⚠️ conflicto)

### Documentos Analizados (15)
- `docs/README.md`
- `docs/01-fase-alcance-inicial/README.md`
- `docs/02-fase-robustecimiento/README.md`
- `docs/03-fase-extensiones/README.md`
- `docs/90-transversal/README.md`
- `docs/sistema-recompensas/README.md`
- `docs/03-fase-extensiones/EXT-001-portal-maestros/README.md`
- `docs/03-fase-extensiones/EXT-002-admin-extendido/README.md`
- `docs/03-fase-extensiones/EXT-003-notificaciones/README.md`
- `docs/03-fase-extensiones/EXT-004-perfiles/README.md`
- `docs/03-fase-extensiones/EXT-005-reportes/README.md`
- `docs/03-fase-extensiones/EXT-006-contenido/README.md`
- `docs/03-fase-extensiones/EXT-007-lti-integration/README.md`
- `docs/03-fase-extensiones/EXT-008-white-label/README.md`
- `docs/03-fase-extensiones/EXT-009-peer-challenges/README.md`
- `docs/03-fase-extensiones/EXT-010-parent-notifications/README.md`

---

## ✅ Estado de Correcciones

| Inconsistencia | Prioridad | Estado | Acción Requerida |
|----------------|-----------|--------|------------------|
| **Presupuestos Fase 3** | 🔴 CRÍTICA | ⏳ PENDIENTE | Determinar fuente de verdad |
| **Tablas BD** | 🔴 ALTA | ⏳ PENDIENTE | Actualizar a 101 |
| **Schemas BD** | 🔴 ALTA | ⏳ PENDIENTE | Actualizar a 14 |
| **Índices BD** | 🔴 ALTA | ⏳ PENDIENTE | Actualizar a 67 |
| **Funciones BD** | 🔴 ALTA | ⏳ PENDIENTE | Actualizar a 62 |
| **Triggers BD** | 🔴 ALTA | ⏳ PENDIENTE | Actualizar a 34 |
| **RLS Policies** | 🟡 MEDIA | ⏳ PENDIENTE | Actualizar a 24 |
| **Monedas mezcladas** | 🟡 MEDIA | ⏳ PENDIENTE | Estandarizar a MXN |
| **Test Coverage** | 🟡 MEDIA | ✅ RESUELTO | Ya corregido |
| **Referencias Fase 4** | 🟢 BAJA | ⏳ PENDIENTE | Estandarizar nomenclatura |

---

**Generado:** 2025-11-13
**Versión:** 1.0
**Próxima revisión:** Después de aplicar correcciones
**Responsable:** Equipo de Documentación + Tech Lead
