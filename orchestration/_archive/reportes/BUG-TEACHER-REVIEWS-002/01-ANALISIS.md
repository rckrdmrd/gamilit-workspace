# ANÁLISIS PRE-EJECUCIÓN: BUG-TEACHER-REVIEWS-002 - Ejercicio No Aparece en Teacher/Reviews

**Agente:** Database-Agent
**Tipo de tarea:** Bug
**Prioridad:** P0
**Fecha análisis:** 2026-01-07
**Relacionado con:** [TP-001], [CORR-010], [M3-M5-FIX]

---

## CONTEXTO DE LA TAREA

### Solicitud Original
Un ejercicio completado por el estudiante no aparece en la página `/teacher/reviews` para evaluación del maestro.

### Objetivo Final
Corregir el bug para que todos los ejercicios enviados (especialmente los que pasan por auto-save → submit) aparezcan correctamente en la cola de revisión del maestro.

### Módulo Relacionado
**Módulo MVP:** Sistema de Evaluación Manual M3-M5
**Sección en MVP-APP.md:** Evaluación y Revisión de Ejercicios

### Justificación
Los ejercicios de módulos 3, 4 y 5 requieren evaluación manual del maestro. Si no aparecen en `/teacher/reviews`, los estudiantes nunca recibirán calificación ni recompensas.

---

## INVENTARIO ACTUAL

### Consultas Realizadas

**Inventarios revisados:**
- [x] MASTER_INVENTORY.yml
- [x] DATABASE_INVENTORY.yml - progress_tracking schema
- [x] BACKEND_INVENTORY.yml - exercise-submission.service.ts
- [x] DEPENDENCY_GRAPH.yml

**Comandos ejecutados:**
```bash
# Búsqueda de triggers relacionados
grep -rn "manual_review" apps/database/ddl/schemas/progress_tracking/triggers/
# Resultado: ✅ 16-trg_create_manual_review.sql existe (solo INSERT)

# Verificar si hay trigger UPDATE
grep -rn "AFTER UPDATE.*manual_review" apps/database/
# Resultado: ❌ No existe trigger AFTER UPDATE para crear manual_review
```

### Objetos Existentes Relacionados

**Base de Datos:**
- Schema: progress_tracking → existe
- Tabla: exercise_submissions → existe
- Tabla: manual_reviews → existe
- Función: create_manual_review_on_submission → existe
- Trigger INSERT: trg_create_manual_review_on_submission → existe
- Trigger UPDATE: ❌ NO EXISTE (CAUSA DEL BUG)

**Backend:**
- Módulo: progress → existe
- Entity: ExerciseSubmission → existe
- Service: ExerciseSubmissionService → existe (líneas 307-351: lógica UPDATE)

**Frontend:**
- Página: TeacherReviewPanelPage → existe
- Hook: useManualReviews → existe
- API: manualReviewApi → existe

### Objetos a Crear/Modificar

**Nuevos objetos:**
- [x] Trigger: trg_create_manual_review_on_submission_update (crear)
- [x] Script: fix-missing-manual-reviews.sql (crear)

**Objetos a modificar:**
- Ninguno (se reutiliza función existente)

---

## ANÁLISIS DE RIESGOS

### Riesgo de Duplicación

**Verificación:**
- [x] NO existe trigger UPDATE similar
- [x] Función create_manual_review_on_submission ya tiene ON CONFLICT DO NOTHING
- [x] Constraint UNIQUE en manual_reviews.submission_id protege contra duplicados

**Decisión:**
- [x] Crear nuevo trigger UPDATE (reutilizando función existente)

### Otros Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Duplicación de manual_reviews | Baja | Bajo | ON CONFLICT DO NOTHING en función |
| Regresión en trigger INSERT | Baja | Alto | No se modifica trigger existente |
| Fallo silencioso | Media | Alto | EXCEPTION handler con logging |

---

## ANÁLISIS DE IMPACTO

### Archivos Afectados

**A crear:**
- apps/database/ddl/schemas/progress_tracking/triggers/17-trg_create_manual_review_on_update.sql
- apps/database/scripts/fix-missing-manual-reviews.sql

**A modificar:**
- Ninguno

**Total archivos:**
- Crear: 2
- Modificar: 0

### Dependencias

**Esta tarea depende de:**
- [TP-001]: Trigger automático ManualReview → Estado: Completado (solo INSERT)
- Función create_manual_review_on_submission → Estado: Completado

**Bloqueadores actuales:**
- Ninguno

**Esta tarea bloquea:**
- Flujo de evaluación manual M3-M5 (12 ejercicios)

### Módulos Afectados

**Impacto directo:**
- Módulo: progress_tracking (Database)
- Stack: Database

**Impacto indirecto:**
- Teacher Portal (/teacher/reviews)
- Ejercicios M3, M4, M5

---

## DECISIÓN DE APPROACH

### Approach Seleccionado
Crear trigger adicional AFTER UPDATE que se ejecute cuando status cambia a 'submitted', reutilizando la función existente create_manual_review_on_submission().

**Razones:**
1. Reutiliza lógica existente probada
2. ON CONFLICT DO NOTHING evita duplicados automáticamente
3. No requiere cambios en backend ni frontend

### Alternativas Consideradas

**Alternativa 1:** Crear manual_review desde el backend
- **Pros:** Control explícito en código
- **Contras:** Duplica lógica, más propenso a errores
- **Razón de descarte:** Viola principio de source of truth en BD

**Alternativa 2:** Modificar trigger INSERT para manejar UPDATE también
- **Pros:** Un solo trigger
- **Contras:** Complejidad innecesaria, riesgo de regresión
- **Razón de descarte:** Mejor mantener separación de responsabilidades

---

## NECESIDAD DE SUBAGENTES

### Análisis de Complejidad

**Criterios:**
- Número de pasos: 3 → Simple
- Módulos afectados: 1 (Database) → Simple
- Archivos a crear: 2 → Simple
- Coordinación entre capas: No

**Decisión:**
- [x] **NO usar subagentes** - Tarea simple, ejecutar directamente

---

## ESTIMACIÓN PRELIMINAR

### Tiempo Estimado por Fase

| Fase | Duración Estimada | Notas |
|------|-------------------|-------|
| Análisis | 15 min | Este documento |
| Planificación | 10 min | Plan de ejecución |
| Ejecución | 10 min | Crear archivos SQL |
| Validación | 15 min | Recrear BD y verificar |
| Documentación | 10 min | Actualizar inventarios |
| **TOTAL** | **~1 hora** | |

---

## REFERENCIAS CONSULTADAS

### Documentación del Proyecto
- [x] Trigger existente: 16-trg_create_manual_review.sql
- [x] Función: 16-create_manual_review_on_submission.sql
- [x] Backend: exercise-submission.service.ts (líneas 307-351)

### Código Existente
**Archivos de referencia:**
- 16-trg_create_manual_review.sql - Template para nuevo trigger
- 16-create_manual_review_on_submission.sql - Función a reutilizar

---

## CONCLUSIÓN DEL ANÁLISIS

### Resumen
El bug ocurre porque el trigger que crea manual_review solo se ejecuta en AFTER INSERT, pero cuando hay auto-save previo (draft), el envío se hace via UPDATE (draft → submitted), lo cual no dispara el trigger.

### Decisiones Clave
1. **Approach:** Crear trigger AFTER UPDATE adicional
2. **Subagentes:** No usar
3. **Objetos a crear:** 2 archivos SQL
4. **Duración estimada:** ~1 hora

### Recomendaciones
1. Ejecutar recreación de BD para validar
2. Verificar submissions existentes sin manual_review

### Aprobación para Proceder
- [x] Análisis completo y documentado
- [x] Sin bloqueadores identificados
- [x] Recursos disponibles
- [x] Estimaciones validadas
- [x] **APROBADO PARA PLANIFICACIÓN**

---

## PRÓXIMO PASO

**Acción:** Crear documento de planificación (02-PLAN.md)

---

**Analizado por:** Claude Opus 4.5 (Database-Agent)
**Fecha:** 2026-01-07 20:15
**Versión:** 1.0
**Estado:** Aprobado
