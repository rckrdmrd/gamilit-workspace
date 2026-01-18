# TASK-2026-01-18-007: Cambios Implementados
## Fix Backend Service - Eliminar constante hardcodeada MANUAL_REVIEW_EXERCISE_TYPES

**Fecha:** 2026-01-18
**Estado:** Completado

---

## Resumen del Problema

El servicio `exercise-responses.service.ts` usaba una **constante hardcodeada** `MANUAL_REVIEW_EXERCISE_TYPES` en lugar del campo de BD `exercises.requires_manual_grading`.

### Problemas identificados:
1. **GAPs**: Faltaban 3 ejercicios de M4 (`verificador_fake_news`, `infografia_interactiva`, `navegacion_hipertextual`)
2. **Extras incorrectos**: Tenía 4 tipos que no deberían estar (`prediccion_narrativa`, `collage_prensa`, `call_to_action`, `texto_en_movimiento`)
3. **Desincronización**: No se actualizaba automáticamente con cambios en BD

---

## Solución Implementada

### 1. Eliminación de Constante Hardcodeada

**Antes (líneas 32-62):**
```typescript
const MANUAL_REVIEW_EXERCISE_TYPES = [
  'tribunal_opiniones',
  'podcast_argumentativo',
  // ... 14 tipos hardcodeados
];

function requiresManualReview(exerciseType: string): boolean {
  return MANUAL_REVIEW_EXERCISE_TYPES.includes(exerciseType);
}
```

**Después:**
- Constante eliminada completamente
- Función `requiresManualReview()` eliminada
- Documentación actualizada en JSDoc del servicio

---

### 2. Modificación de Query SQL en `getAttempts()`

**Agregado al SELECT:**
```sql
exercise.requires_manual_grading AS requires_manual_grading,
```

---

### 3. Modificación de Query SQL en `getAttemptDetail()`

**Agregado al SELECT:**
```sql
exercise.requires_manual_grading AS requires_manual_grading,
```

---

### 4. Actualización de Transformación de Datos

**Antes:**
```typescript
requires_manual_review: requiresManualReview(row.exercise_type || ''),
```

**Después:**
```typescript
requires_manual_review: row.requires_manual_grading ?? false,
```

Aplicado en:
- `getAttempts()` - transformación de rawResults
- `getAttemptDetail()` - return del detalle

---

## Validaciones

| Validación | Resultado |
|------------|-----------|
| Backend lint | ✅ Exitoso |
| Backend build | ✅ Exitoso (tsc) |

---

## Archivos Modificados

1. `apps/backend/src/modules/teacher/services/exercise-responses.service.ts`

---

## Impacto

### Antes del fix:
| Ejercicio | Marcado como Manual Review |
|-----------|---------------------------|
| verificador_fake_news | ❌ NO |
| infografia_interactiva | ❌ NO |
| navegacion_hipertextual | ❌ NO |
| prediccion_narrativa | ✅ SÍ (incorrecto - es auto) |

### Después del fix:
| Ejercicio | Marcado como Manual Review |
|-----------|---------------------------|
| verificador_fake_news | ✅ SÍ (de BD) |
| infografia_interactiva | ✅ SÍ (de BD) |
| navegacion_hipertextual | ✅ SÍ (de BD) |
| prediccion_narrativa | ❌ NO (de BD - correcto) |

---

## Beneficios

1. **Única fuente de verdad**: El campo `exercises.requires_manual_grading` en BD
2. **Sincronización automática**: Cambios en BD se reflejan inmediatamente
3. **Mantenibilidad**: No requiere cambios en código para agregar/modificar tipos
4. **Consistencia**: Frontend y Backend usan la misma fuente de datos

---

## Referencias

- Análisis de origen: TASK-2026-01-18-006 (análisis profundo de capas)
- Campo BD: `educational_content.exercises.requires_manual_grading`
- Documentación: docs/03-fase-extensiones/EXT-001-portal-maestros/
