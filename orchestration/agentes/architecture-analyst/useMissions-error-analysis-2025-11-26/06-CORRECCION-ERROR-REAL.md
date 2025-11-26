# CORRECCIÓN DEL ERROR REAL

**Fecha:** 2025-11-26
**Estado:** CORREGIDO

---

## ERROR ORIGINAL REPORTADO

```
useMissions.ts:453 Error fetching weekly missions:
TypeError: Cannot read properties of undefined (reading 'toLowerCase')
    at mapTemplateToCategory (missionTransformer.ts:56:27)
    at transformMission (missionTransformer.ts:179:20)
```

---

## CAUSA RAÍZ IDENTIFICADA

**El análisis inicial fue incorrecto.** El error NO era por el status `expired`, sino por incompatibilidad de nombres de campo:

| Capa | Campo | Valor |
|------|-------|-------|
| **Backend** | `template_id` | `"daily_complete_exercises"` |
| **Frontend (esperaba)** | `template_key` | undefined |

El frontend esperaba `template_key` pero el backend enviaba `template_id`, causando que `templateKey.toLowerCase()` fallara con `undefined`.

---

## CORRECCIONES APLICADAS

### 1. Interface MissionFromAPI (línea 22)
```typescript
// ANTES
template_key: string;

// DESPUÉS
template_id: string;
```

### 2. Función mapTemplateToCategory (línea 54-56)
```typescript
// ANTES
export function mapTemplateToCategory(templateKey: string): MissionCategory {
  const key = templateKey.toLowerCase();

// DESPUÉS
export function mapTemplateToCategory(templateKey: string | undefined | null): MissionCategory {
  if (!templateKey) return 'exercises';
  const key = templateKey.toLowerCase();
```

### 3. Función generateTitle (línea 133-134)
```typescript
// ANTES
function generateTitle(templateKey: string): string {
  const key = templateKey

// DESPUÉS
function generateTitle(templateKey: string | undefined | null): string {
  if (!templateKey) return 'Mission';
  const key = templateKey
```

### 4. Función transformMission (líneas 180-182, 206)
```typescript
// ANTES
const category = mapTemplateToCategory(apiMission.template_key);
title: apiMission.title || generateTitle(apiMission.template_key),

// DESPUÉS
const templateId = apiMission.template_id || '';
const category = mapTemplateToCategory(templateId);
title: apiMission.title || generateTitle(templateId),
```

---

## ARCHIVO MODIFICADO

```
apps/frontend/src/features/gamification/missions/utils/missionTransformer.ts
```

---

## VALIDACIÓN

```bash
✅ TypeScript compila sin errores (npx tsc --noEmit)
✅ Interface usa template_id (coincide con backend)
✅ Funciones tienen fallbacks para undefined
✅ Build exitoso
```

---

## LECCIÓN APRENDIDA

El análisis inicial se enfocó en problemas secundarios (status `expired`, deprecation) sin verificar el error de runtime real. El stack trace indicaba claramente:

```
at mapTemplateToCategory (missionTransformer.ts:56:27)
```

La línea 56 era `templateKey.toLowerCase()`, lo que indicaba que `templateKey` era `undefined`.

**Para futuros análisis:** Siempre comenzar por el stack trace exacto y verificar los valores en runtime.

---

## RESUMEN DE TODOS LOS CAMBIOS HOY

| Cambio | Archivo | Propósito |
|--------|---------|-----------|
| `template_key` → `template_id` | missionTransformer.ts | Fix error principal |
| Agregar `'expired'` a MissionStatus | missionsTypes.ts | Mejora de tipos |
| Agregar `'expired'` a MissionFromAPI | missionTransformer.ts | Mejora de tipos |
| Agregar case `'expired'` | missionTransformer.ts | Mapeo correcto |
| Agregar fallbacks a funciones | missionTransformer.ts | Robustez |
| Documentación deprecation | missionsStore.ts | Deuda técnica |
| Guía de migración | MIGRATION-GUIDE.md | Documentación |

---

**Corrección completada por:** Architecture-Analyst
**Fecha:** 2025-11-26
