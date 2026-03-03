# REMEDIATION REPORT: Rúbricas — Quiz TikTok

**Fecha:** 2026-03-03
**Severidad:** CRÍTICO
**Estado:** RESUELTO

---

## Problema

Error "Rúbrica no disponible" en el portal del maestro al revisar ejercicios `quiz_tiktok` del Módulo 4.

## Causa Raíz

El seed `13-exercise_type_rubrics.sql` excluía `quiz_tiktok` con comentario "es auto-grading, no requiere rúbrica", pero el seed de ejercicios `05-exercises-module4.sql` define `quiz_tiktok` con `requires_manual_grading = true` (requiere justificación por pregunta). Contradicción entre seeds.

Pipeline afectado:
1. Estudiante envía ejercicio → backend verifica `requires_manual_grading = true`
2. Se crea `exercise_submission` + trigger crea `manual_review`
3. Maestro abre revisión → `ManualReviewService.enrichReview()` busca en tabla `exercise_type_rubrics` por `exerciseType` + `isDefault = true`
4. No encuentra rúbrica para `quiz_tiktok` → `review.rubric = undefined` → frontend muestra "Rúbrica no disponible"

## Solución

Agregado INSERT para `quiz_tiktok` en `13-exercise_type_rubrics.sql` (3 ambientes: dev, staging, prod).

**Rúbrica creada (4 criterios, peso total = 100):**

| Criterio | Peso | Descripción |
|----------|------|-------------|
| Precisión de Respuestas | 25 | Porcentaje de respuestas correctas |
| Calidad de Justificaciones | 30 | Profundidad y relevancia de justificaciones |
| Pensamiento Crítico | 25 | Análisis crítico del contenido |
| Completitud | 20 | Todas las preguntas respondidas y justificadas |

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `apps/database/seeds/dev/educational_content/13-exercise_type_rubrics.sql` | +INSERT quiz_tiktok, conteo 12→13, comentarios actualizados |
| `apps/database/seeds/staging/educational_content/13-exercise_type_rubrics.sql` | Idéntico |
| `apps/database/seeds/prod/educational_content/13-exercise_type_rubrics.sql` | Idéntico |

## Validación

| Check | Resultado |
|-------|-----------|
| BD: 13 rúbricas cargadas | ✅ (M3=5, M4=5, M5=3) |
| BD: 0 ejercicios manuales sin rúbrica | ✅ |
| Backend build | ✅ 0 errores |
| Backend lint | ✅ 0 errores |
| Frontend build | ✅ 0 errores |
| Frontend typecheck | ✅ 0 errores |
| Frontend lint | ✅ 0 errores |
| Cross-verification pipeline | ✅ Backend enrichReview() correcto |
| Cross-verification frontend | ✅ No requiere cambios |

## Cobertura Final

| Módulo | Ejercicios Manuales | Rúbricas | Estado |
|--------|---------------------|----------|--------|
| M3 - Lectura Crítica | 5 | 5 | ✅ 100% |
| M4 - Alfabetización Digital | 5 | 5 | ✅ 100% |
| M5 - Producción Creativa | 3 | 3 | ✅ 100% |
| **Total** | **13** | **13** | **✅ 100%** |
