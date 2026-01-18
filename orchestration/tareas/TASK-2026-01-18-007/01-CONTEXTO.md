# TASK-2026-01-18-007: Contexto
## Fase C - Contexto del Ciclo CAPVED

**Fecha:** 2026-01-18
**Estado:** Completada

---

## 1. Origen de la Solicitud

**Tarea origen:** TASK-2026-01-18-006 (Análisis y Corrección Teacher/Responses Page)
**Tipo de origen:** Análisis profundo de GAPs

Durante el análisis de validación de TASK-2026-01-18-006, se identificó que el servicio
`exercise-responses.service.ts` usaba una constante hardcodeada `MANUAL_REVIEW_EXERCISE_TYPES`
en lugar del campo de BD `exercises.requires_manual_grading`.

---

## 2. Clasificación

| Atributo | Valor |
|----------|-------|
| **Tipo** | bug-fix + refactor |
| **Prioridad** | P0-CRITICAL |
| **Capa** | Backend |
| **Módulo** | teacher-portal/exercise-responses |
| **Epic** | EXT-001-portal-maestros |

---

## 3. Proyecto Afectado

- **Proyecto:** Gamilit
- **Ruta:** /home/isem/workspace-v2/projects/gamilit/
- **Ambiente:** development, staging, production

---

## 4. Estado Actual (Antes del Fix)

### Problema
El servicio `exercise-responses.service.ts` contenía:

1. **Constante hardcodeada** (14 tipos):
   ```typescript
   const MANUAL_REVIEW_EXERCISE_TYPES = [
     'tribunal_opiniones', 'podcast_argumentativo', ...
   ];
   ```

2. **Función basada en constante**:
   ```typescript
   function requiresManualReview(exerciseType: string): boolean {
     return MANUAL_REVIEW_EXERCISE_TYPES.includes(exerciseType);
   }
   ```

### Consecuencias
- **3 ejercicios de M4 faltantes**: `verificador_fake_news`, `infografia_interactiva`, `navegacion_hipertextual`
- **4 tipos incorrectos**: `prediccion_narrativa` (M2 auto), `collage_prensa`, `call_to_action`, `texto_en_movimiento`
- **Desincronización**: Cambios en BD no se reflejaban en backend

---

## 5. Comportamiento Esperado

El servicio debe:
1. Consultar el campo `exercises.requires_manual_grading` de la BD
2. No depender de constantes hardcodeadas
3. Reflejar automáticamente cambios en configuración de ejercicios

---

## 6. Criterios de Éxito

| Criterio | Métrica |
|----------|---------|
| Constante eliminada | 0 referencias a `MANUAL_REVIEW_EXERCISE_TYPES` |
| Función eliminada | 0 referencias a `requiresManualReview()` |
| Campo BD usado | Query incluye `exercise.requires_manual_grading` |
| Build exitoso | `npm run build` sin errores |
| Lint exitoso | `npm run lint` sin errores |

---

## 7. Dependencias

### Depende de:
- Campo `exercises.requires_manual_grading` existente en BD (DDL)
- Seeds correctamente configurados con valores apropiados

### Bloqueada por:
- Ninguna

### Bloquea:
- Ninguna

---

## 8. Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Ejercicios sin campo en BD | Baja | Alto | Fallback a `false` |
| Breaking change en API | Baja | Medio | Campo mantiene mismo nombre |
| Frontend incompatible | Baja | Alto | Interface ya tiene el campo |

---

## Referencias

- TASK-2026-01-18-006: Análisis origen
- DDL: `educational_content.exercises.requires_manual_grading`
- docs/03-fase-extensiones/EXT-001-portal-maestros/
