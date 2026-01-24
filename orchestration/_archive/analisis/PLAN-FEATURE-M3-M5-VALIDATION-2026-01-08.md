# PLAN DE EJECUCION: FEAT-M3M5-001 - Validacion Progreso Ejercicios M3-M5

**Agente:** Database-Agent + Backend-Agent + Frontend-Agent
**Tipo de tarea:** Feature
**Prioridad:** P1
**Fecha creacion:** 2026-01-08
**Relacionado con:** [REQ-PROGRESS-001], [DB-MODULE-PROGRESS], [FE-FEEDBACK-MODAL]

---

## OBJETIVO

Implementar la actualizacion inmediata del progreso del modulo cuando un estudiante envia un ejercicio de los modulos 3, 4 o 5 que requieren validacion manual del maestro.

**Criterios de Aceptacion:**
- [x] El progreso del modulo se actualiza al ENVIAR (no al calificar)
- [x] El estudiante ve su barra de progreso actualizada inmediatamente
- [x] Las recompensas (XP/ML Coins) se asignan solo cuando el maestro califica
- [x] El FeedbackModal muestra mensaje claro de "pendiente de validacion"
- [x] Todos los 13 ejercicios de M3-M5 funcionan correctamente

---

## ANALISIS PREVIO

### Contexto
- Los ejercicios de M3, M4 y M5 requieren validacion manual del maestro
- Actualmente el progreso solo se actualiza cuando el maestro califica (en `claimRewards()`)
- El estudiante no ve avance inmediato al enviar su trabajo
- Esto causa confusion y mala experiencia de usuario

### Estado Actual
- 13 ejercicios en M3-M5 con `requires_manual_grading = true`
- `module_progress` tabla solo tiene `completed_exercises` y `progress_percentage`
- `exercise-submission.service.ts` no actualiza progreso al enviar

### Anti-Duplicacion
```bash
# Comandos ejecutados para verificar no-duplicacion
grep -rn "submitted_exercises" apps/database/ddl/
grep -rn "updateModuleProgressOnSubmission" apps/backend/

# Resultado: No existe | Requiere implementacion
```

---

## DISENO DE SOLUCION

### Approach Seleccionado
Agregar 4 columnas a `module_progress` para tracking separado de submitted vs graded:
- `submitted_exercises` - Ejercicios enviados
- `graded_exercises` - Ejercicios calificados
- `submitted_progress_percentage` - Progreso por envios
- `graded_progress_percentage` - Progreso por calificaciones

**Alternativas consideradas:**
1. Solo actualizar `progress_percentage` - Descartado: Mezclaria progreso real con pendiente
2. Crear tabla separada - Descartado: Sobreingenieria para el caso de uso

### Componentes a Crear/Modificar

**Database:**
- [x] Schema: progress_tracking
- [x] Tablas: module_progress (4 columnas nuevas)
- [x] Funciones: update_module_progress_on_exercise_complete, update_module_progress_on_submission_graded
- [x] Triggers: Sin cambios (funciones existentes actualizadas)
- [x] Seeds: N/A

**Backend:**
- [x] Entities: module-progress.entity.ts (4 campos nuevos)
- [x] Services: exercise-submission.service.ts (nuevo metodo)
- [x] Controllers: N/A
- [x] DTOs: N/A

**Frontend:**
- [x] Paginas: N/A
- [x] Componentes: FeedbackModal.tsx (seccion pendingReview)
- [x] Stores: N/A
- [x] Services: progressTypes.ts, progressAPI.ts (tipos actualizados)

---

## CICLOS DE EJECUCION

### Ciclo 1: Modificacion DDL (Sin Migraciones)
**Objetivo:** Agregar columnas a module_progress directamente en DDL

**Tareas:**
1. Modificar `ddl/schemas/progress_tracking/tables/01-module_progress.sql`
2. Agregar comentarios de documentacion
3. Actualizar funciones relacionadas

**Artefactos generados:**
- Archivo: `ddl/schemas/progress_tracking/tables/01-module_progress.sql`
- Archivo: `ddl/schemas/gamilit/functions/15-update_module_progress_on_exercise_complete.sql`
- Archivo: `ddl/schemas/gamilit/functions/20-update_module_progress_on_submission_graded.sql`

**Validacion:**
```bash
# Verificar estructura DDL
cat ddl/schemas/progress_tracking/tables/01-module_progress.sql | grep -A5 "submitted_exercises"
```

**Criterios de exito:**
- [x] DDL contiene las 4 columnas nuevas
- [x] Funciones actualizadas para poblar nuevas columnas

---

### Ciclo 2: Aplicacion a BD Existente
**Objetivo:** Aplicar cambios a BD de desarrollo

**Tareas:**
1. Ejecutar ALTER TABLE para agregar columnas
2. Ejecutar CREATE OR REPLACE FUNCTION para actualizar funciones
3. Verificar estructura

**Validacion:**
```bash
PGPASSWORD="..." psql -h localhost -U gamilit_user -d gamilit_platform -c "\d progress_tracking.module_progress"
```

**Criterios de exito:**
- [x] Columnas existen en BD
- [x] Funciones actualizadas

---

### Ciclo 3: Backend Integration
**Objetivo:** Actualizar entidad y servicio

**Tareas:**
1. Agregar campos a module-progress.entity.ts
2. Agregar metodo updateModuleProgressOnSubmission()
3. Llamar metodo en submitExercise()

**Artefactos generados:**
- Archivo: `apps/backend/src/modules/progress/entities/module-progress.entity.ts`
- Archivo: `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Criterios de exito:**
- [x] Entity tiene los 4 campos
- [x] Metodo updateModuleProgressOnSubmission() implementado
- [x] Llamada en flujo de requires_manual_grading

---

### Ciclo 4: Frontend Updates
**Objetivo:** Actualizar tipos y FeedbackModal

**Tareas:**
1. Agregar campos a progressTypes.ts
2. Agregar seccion pendingReview a FeedbackModal
3. Verificar ejercicios llaman syncAndInvalidate()

**Artefactos generados:**
- Archivo: `apps/frontend/src/features/progress/api/progressTypes.ts`
- Archivo: `apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`
- Archivo: `apps/frontend/src/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx`

**Criterios de exito:**
- [x] FeedbackModal muestra seccion pendingReview
- [x] Todos los ejercicios M3-M5 invalidan cache

---

### Ciclo 5: Validacion Final
**Objetivo:** Validar integracion completa

**Validaciones:**
```bash
# Database - Verificar columnas
PGPASSWORD="..." psql -d gamilit_platform -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'module_progress' AND column_name LIKE '%submitted%';"

# Verificar funciones
PGPASSWORD="..." psql -d gamilit_platform -c "\df gamilit.update_module_progress_on_*"
```

**Checklist de Validacion:**
- [x] DB tiene columnas nuevas
- [x] Funciones actualizadas
- [x] Scripts init/recreate cargan archivos DDL
- [x] Documentacion completa

---

## DEPENDENCIAS

### Depende de:
- Ninguna

### Bloquea:
- Ninguna

### Requerimientos externos:
- Acceso a BD PostgreSQL

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Recreacion BD falla | Media | Medio | ALTER TABLE como alternativa |
| Conflicto con triggers existentes | Baja | Alto | Funciones usan ON CONFLICT DO UPDATE |

---

## DOCUMENTACION GENERADA

**Durante ejecucion:**
- [x] VALIDACION-EJECUCION-M3-M5-2026-01-08.md
- [x] Comentarios inline en codigo SQL

**Post-ejecucion:**
- [x] Este documento (PLAN)
- [x] Documento de validacion

---

## CRITERIOS DE EXITO

La tarea se considera **COMPLETADA** cuando:

- [x] DDL modificados directamente (sin migraciones)
- [x] Funciones actualizadas
- [x] Scripts init-database.sh cargan archivos automaticamente
- [x] BD actual tiene columnas nuevas
- [x] Backend entity y service actualizados
- [x] Frontend FeedbackModal muestra pendingReview
- [x] 13 ejercicios M3-M5 funcionan correctamente
- [x] Documentacion completa

---

## REFERENCIAS

**Documentacion del proyecto:**
- Directiva BD: orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md
- Templates: orchestration/templates/TEMPLATE-PLAN.md

**Archivos de referencia:**
- DDL: apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql
- Script: apps/database/scripts/init-database.sh

---

**Version:** 1.0
**Ultima actualizacion:** 2026-01-08
**Aprobado para ejecucion:** Si
**Estado:** COMPLETADO
