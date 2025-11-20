# ⚠️ Reporte de Desalineación: Documentación vs Implementación DB v2.0

**Fecha:** 2025-11-19
**Analista:** Database Agent
**Criticidad:** 🔴 ALTA - Requiere acción inmediata

---

## 🎯 Resumen Ejecutivo

Se detectaron **desalineaciones críticas** entre:
1. Documento de Diseño v6.1.1 (general)
2. Documentación técnica en `docs/` (detallada)
3. Implementación real en DB v2.0 (código)

**Impacto:** Los 3 agentes (Database, Backend, Frontend) consultarán valores **INCORRECTOS** en la documentación de `docs/`, generando implementaciones desalineadas.

---

## 📊 Comparativa de Valores

### 1. Umbrales de XP por Rango

| Rango | Doc Diseño v6.1.1 (ANTES) | Docs ET-GAM-003 | Docs RF-GAM-003 | DB v2.0 (REAL) |
|-------|---------------------------|-----------------|-----------------|----------------|
| **Ajaw** | 0-999 | 0-999 | 0-999 | **0-499** ✅ |
| **Nacom** | 1,000-4,999 | 1,000-2,999 | 1,000-4,999 | **500-999** ✅ |
| **Ah K'in** | 5,000-19,999 | 3,000-5,999 | 5,000-19,999 | **1,000-1,499** ✅ |
| **Halach** | 20,000-99,999 | 6,000-9,999 | 20,000-99,999 | **1,500-2,249** ✅ |
| **K'uk'ulkan** | 100,000+ | 10,000+ | 100,000+ | **2,250+** ✅ |

**Hallazgo:**
- ❌ **ET-GAM-003 tiene valores intermedios** (1k-10k) que NO coinciden con nadie
- ❌ **RF-GAM-003 tiene valores inalcanzables** (igual que v6.1.1)
- ✅ **DB v2.0 tiene valores realistas** (implementados y funcionales)

---

### 2. Bonus ML Coins por Promoción de Rango

| Promoción | Doc Diseño v6.1.1 | Docs RF-GAM-003 | Docs RF-GAM-004 | DB v2.0 (REAL) |
|-----------|-------------------|-----------------|-----------------|----------------|
| Ajaw → Nacom | 50 ML | 50 ML | 100 ML | **100 ML** ✅ |
| Nacom → Ah K'in | 100 ML | 100 ML | 250 ML | **250 ML** ✅ |
| Ah K'in → Halach | 200 ML | 200 ML | 500 ML | **500 ML** ✅ |
| Halach → K'uk'ulkan | 500 ML | 500 ML | 1,000 ML | **1,000 ML** ✅ |

**Hallazgo:**
- ❌ **RF-GAM-003 tiene valores antiguos** (50-500 ML)
- ✅ **RF-GAM-004 tiene valores correctos** (100-1000 ML) - coinciden con DB v2.0
- ⚠️ **Inconsistencia entre RF-GAM-003 y RF-GAM-004**

---

### 3. Multiplicadores de XP por Rango

| Rango | Doc Diseño v6.1.1 | Docs ET-GAM-003 | Docs RF-GAM-003 | DB v2.0 (REAL) |
|-------|-------------------|-----------------|-----------------|----------------|
| Ajaw | 1.00x | 1.00x | 1.00x | 1.00x ✅ |
| Nacom | 1.05x | 1.05x | 1.05x | **1.10x** ✅ |
| Ah K'in | 1.10x | 1.10x | 1.10x | **1.15x** ✅ |
| Halach | 1.15x | 1.15x | 1.15x | **1.20x** ✅ |
| K'uk'ulkan | 1.20x | 1.20x | 1.20x | **1.25x** ✅ |

**Hallazgo:**
- ⚠️ **Documentos tienen multiplicadores +5% inferiores** a DB v2.0
- ✅ DB v2.0: 1.00x, 1.10x, 1.15x, 1.20x, 1.25x
- ❌ Docs: 1.00x, 1.05x, 1.10x, 1.15x, 1.20x

---

### 4. Multiplicadores de ML Coins por Rango

| Rango | Doc Diseño v6.1.1 | Docs RF-GAM-004 | DB v2.0 (REAL) |
|-------|-------------------|-----------------|----------------|
| Ajaw | 1.00x | 1.00x | ❌ **NO IMPLEMENTADO** |
| Nacom | 1.25x | 1.25x (+25%) | ❌ **NO IMPLEMENTADO** |
| Ah K'in | 1.50x | 1.50x (+50%) | ❌ **NO IMPLEMENTADO** |
| Halach | 1.75x | 1.75x (+75%) | ❌ **NO IMPLEMENTADO** |
| K'uk'ulkan | 2.00x | 2.00x (+100%) | ❌ **NO IMPLEMENTADO** |

**Hallazgo:**
- ❌ **Multiplicador ML Coins documentado pero NO existe en DB**
- ✅ RF-GAM-004 describe funcionalidad no implementada
- ⚠️ Esto causará confusión en Backend/Frontend si intentan usar estos valores

---

## 🔍 Archivos Afectados que Requieren Actualización

### Prioridad P0 - CRÍTICO

1. **ET-GAM-003-rangos-maya.md**
   - Ubicación: `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/`
   - Cambios requeridos:
     - Líneas 88-92: Actualizar umbrales XP (0-999 → 0-499, etc.)
     - Línea 602-608: Actualizar `RANK_THRESHOLDS` en código Backend
     - Líneas 311-316: Actualizar bonus ML Coins (50 → 100, etc.)
     - Líneas 460-467: Actualizar multiplicadores XP (+5% → +10%, etc.)

2. **RF-GAM-003-rangos-maya.md**
   - Ubicación: `docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/`
   - Cambios requeridos:
     - Líneas 148-328: Actualizar toda la sección de umbrales XP
     - Líneas 200-203: Actualizar bonus ML Coins
     - Líneas 400-407: Actualizar multiplicadores XP
     - Líneas 340-346: Actualizar tabla de progresión estimada

3. **RF-GAM-004-economia-ml-coins.md**
   - Ubicación: `docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/`
   - Cambios requeridos:
     - Líneas 171-175: ✅ Valores correctos (NO cambiar)
     - Líneas 266-281: ⚠️ **Marcar multiplicador ML Coins como "Pendiente Implementación"**

### Prioridad P1 - IMPORTANTE

4. **DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md**
   - Ubicación: `docs/00-vision-general/`
   - Estado: ✅ **YA ACTUALIZADO** a v6.2 con valores DB v2.0

---

## 🚨 Riesgos de NO Actualizar

### Riesgo 1: Backend Implementa Valores Incorrectos
**Probabilidad:** Alta
**Impacto:** Crítico

**Escenario:**
```typescript
// Backend lee ET-GAM-003 y implementa:
export const RANK_THRESHOLDS = {
  [MayaRankEnum.NACOM]: { min: 1000, max: 4999 },  // ❌ INCORRECTO
  // DB esperaba: { min: 500, max: 999 }
};
```

**Consecuencia:**
- Promociones no ocurren cuando deberían
- Usuarios no alcanzan rangos
- Funcionalidad rota

---

### Riesgo 2: Frontend Muestra Progreso Incorrecto
**Probabilidad:** Alta
**Impacto:** Alto

**Escenario:**
```typescript
// Frontend calcula progreso a Nacom:
// Documento dice: 1,000 XP requerido
// DB real: 500 XP requerido
// Usuario tiene 600 XP

Frontend muestra: "60% hacia Nacom" (600/1000)
Realidad: Usuario YA es Nacom (600 >= 500)
```

**Consecuencia:**
- UI desincronizada con backend
- Usuarios confundidos
- Confianza en la plataforma afectada

---

### Riesgo 3: Tests Fallan por Valores Desalineados
**Probabilidad:** Media
**Impacto:** Medio

**Escenario:**
```typescript
test('User promotes to Nacom at 1000 XP', async () => {
  // Test basado en documentación (1000 XP)
  // Pero DB promueve en 500 XP
  // Test falla inesperadamente
});
```

---

## ✅ Plan de Acción

### Fase 1: Actualización Inmediata (HOY - 2025-11-19)

- [x] ✅ Actualizar DocumentoDeDiseño v6.1.1 → v6.2
- [x] ✅ Actualizar ET-GAM-003-rangos-maya.md
- [x] ✅ Actualizar RF-GAM-003-rangos-maya.md
- [x] ✅ Actualizar RF-GAM-004-economia-ml-coins.md (marcar multiplicador ML como N/I)

### Fase 2: Validación (Próximo Sprint)

- [ ] Backend: Verificar que RanksService use valores DB v2.0
- [ ] Frontend: Verificar que UI use valores DB v2.0
- [ ] QA: Ejecutar tests de regresión con valores actualizados

### Fase 3: Comunicación (Esta Semana)

- [ ] Notificar a equipos del cambio de valores
- [ ] Actualizar README de cada agente
- [ ] Agregar ADR documentando cambio de valores

---

## 📝 Valores Correctos (DB v2.0) - FUENTE DE VERDAD

### Umbrales XP
```
Ajaw: 0-499 XP
Nacom: 500-999 XP
Ah K'in: 1,000-1,499 XP
Halach Uinic: 1,500-2,249 XP
K'uk'ulkan: 2,250+ XP
```

### Bonus ML Coins (promoción de rango)
```
Ajaw → Nacom: 100 ML
Nacom → Ah K'in: 250 ML
Ah K'in → Halach: 500 ML
Halach → K'uk'ulkan: 1,000 ML
```

### Multiplicadores XP
```
Ajaw: 1.00x
Nacom: 1.10x (+10%)
Ah K'in: 1.15x (+15%)
Halach Uinic: 1.20x (+20%)
K'uk'ulkan: 1.25x (+25%)
```

### Multiplicador ML Coins
```
❌ NO IMPLEMENTADO (marcado como backlog)
```

---

## 🔗 Referencias

- **Implementación Real:** `apps/database/seeds/prod/gamification_system/03-maya_ranks.sql`
- **Servicio Backend:** `apps/backend/src/modules/gamification/services/ranks.service.ts`
- **Documento Diseño v6.2:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`
- **Análisis Homologación:** `docs/00-vision-general/ANALISIS-HOMOLOGACION-DOC-DISENO-v6.1.md`

---

**Responsable:** Database Agent
**Próxima actualización:** Tras completar correcciones
**Estado:** ⚠️ En progreso
