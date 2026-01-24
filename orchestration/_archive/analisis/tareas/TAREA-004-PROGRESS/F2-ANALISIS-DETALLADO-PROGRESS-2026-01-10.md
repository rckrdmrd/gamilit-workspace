# F2: ANALISIS DETALLADO - TAREA-004 PROGRESS_TRACKING

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-004 |
| **Fase** | F2 - Analisis Detallado |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Agentes** | @PERFIL_ORQUESTADOR |

---

## 1. RESUMEN EJECUTIVO

### 1.1 Metricas de Alineacion

| Comparacion | Alineacion | Estado | Accion |
|-------------|------------|--------|--------|
| ProgressStatus (DDL/Backend/Frontend) | **100%** | EXCELENTE | Ninguna |
| AttemptResult (DDL/Backend) | **100%** | EXCELENTE | Ninguna |
| AttemptStatus vs Frontend status | **75%** | MEDIA | Revisar 'in_progress' vs 'draft' |
| ComodinType vs PowerupType naming | **100%** | EXCELENTE | Solo naming diferente |
| ModuleProgress (Entity/Type) | **95%** | EXCELENTE | 2 campos menores faltantes |
| MayaRank XP comments (Backend) | **0%** | **CRITICO** | Comentarios legacy en Backend |

### 1.2 Inconsistencias Totales

| Severidad | Cantidad | Descripcion |
|-----------|----------|-------------|
| **CRITICA (P0)** | 1 | MayaRank XP comments en backend enums.constants.ts |
| **ALTA (P1)** | 0 | - |
| **MEDIA (P2)** | 2 | attempt_status mapping, MayaRank XP en backend |
| **BAJA (P3)** | 1 | PowerupType vs ComodinType naming |

---

## 2. ANALISIS CRITICO: MAYA RANK XP (BACKEND)

### 2.1 Problema Detectado

Durante el analisis de TAREA-003, se corrigieron los comentarios de XP en `apps/frontend/src/shared/constants/enums.constants.ts`. Sin embargo, el archivo **backend** `apps/backend/src/shared/constants/enums.constants.ts` todavia tiene los valores legacy.

**Backend `enums.constants.ts:161-167` (VALORES LEGACY):**

| Rank | XP Range (comentario) |
|------|----------------------|
| Ajaw | 0-999 XP |
| Nacom | 1,000-2,999 XP |
| Ah K'in | 3,000-5,999 XP |
| Halach Uinic | 6,000-9,999 XP |
| K'uk'ulkan | 10,000+ XP |

**SSOT `ranks.constants.ts` (VALORES v2.0 CORRECTOS):**

| Rank | xpMin | xpMax |
|------|-------|-------|
| Ajaw | 0 | 499 |
| Nacom | 500 | 999 |
| Ah K'in | 1,000 | 1,499 |
| Halach Uinic | 1,500 | 2,249 |
| K'uk'ulkan | 2,250 | null |

### 2.2 Accion Requerida

- **P0-001**: Actualizar comentarios XP en `apps/backend/src/shared/constants/enums.constants.ts:161-167`

---

## 3. VALIDACION DE ENUMS PROGRESS_TRACKING

### 3.1 ProgressStatus (6 valores) - 100% ALINEADO

| DDL | Backend | Frontend | Estado |
|-----|---------|----------|--------|
| not_started | NOT_STARTED | NOT_STARTED | MATCH |
| in_progress | IN_PROGRESS | IN_PROGRESS | MATCH |
| completed | COMPLETED | COMPLETED | MATCH |
| needs_review | NEEDS_REVIEW | NEEDS_REVIEW | MATCH |
| mastered | MASTERED | MASTERED | MATCH |
| abandoned | ABANDONED | ABANDONED | MATCH |

**Alineacion: 100%** - Excelente sincronizacion entre las 3 capas.

### 3.2 AttemptResult (4 valores) - 100% ALINEADO

| DDL | Backend | Estado |
|-----|---------|--------|
| correct | CORRECT | MATCH |
| incorrect | INCORRECT | MATCH |
| partial | PARTIAL | MATCH |
| skipped | SKIPPED | MATCH |

**Alineacion: 100%**

### 3.3 AttemptStatus vs Frontend ExerciseSubmission.status

| DDL attempt_status | Frontend status | Mapeo |
|--------------------|-----------------|-------|
| in_progress | draft | DIFERENTE (semanticamente similar) |
| submitted | submitted | MATCH |
| graded | graded | MATCH |
| reviewed | reviewed | MATCH |
| - | pending_review | EXTRA en Frontend |

**Alineacion: 75%** - Diferencias semanticas menores

**Analisis:**
- `in_progress` (DDL) vs `draft` (Frontend): Semanticamente equivalentes, representan un trabajo no enviado
- `pending_review` (Frontend): Valor extra para UX, no existe en DDL

**Recomendacion:** No requiere cambio - las diferencias son aceptables para la capa de presentacion.

---

## 4. VALIDACION DE TIPOS COMODIN/POWERUP

### 4.1 ComodinType (Backend) vs PowerupType (Frontend)

| Backend ComodinTypeEnum | Frontend PowerupType | Valor | Estado |
|-------------------------|----------------------|-------|--------|
| PISTAS | PISTAS | 'pistas' | MATCH |
| VISION_LECTORA | VISION_LECTORA | 'vision_lectora' | MATCH |
| SEGUNDA_OPORTUNIDAD | SEGUNDA_OPORTUNIDAD | 'segunda_oportunidad' | MATCH |

**Alineacion: 100%** (valores identicos)

**Nota:** Solo difiere el nombre del enum (ComodinTypeEnum vs PowerupType). Esto es aceptable ya que:
- Backend usa terminologia en espanol (Comodin)
- Frontend usa terminologia de gaming (PowerUp)
- Los valores string son identicos

---

## 5. VALIDACION DE INTERFACES

### 5.1 ModuleProgress Entity vs Frontend Type

| Campo Backend | Campo Frontend | Tipo | Estado |
|---------------|----------------|------|--------|
| id | id | string | MATCH |
| user_id | user_id | string | MATCH |
| module_id | module_id | string | MATCH |
| status | status | ProgressStatus | MATCH |
| progress_percentage | progress_percentage | number | MATCH |
| completed_exercises | completed_exercises | number | MATCH |
| total_exercises | total_exercises | number | MATCH |
| skipped_exercises | skipped_exercises | number | MATCH |
| submitted_exercises | - | number | FALTA en Frontend |
| graded_exercises | - | number | FALTA en Frontend |
| total_score | total_score | number | MATCH |
| max_possible_score | max_possible_score | number? | MATCH |
| average_score | average_score | number? | MATCH |
| best_score | best_score | number? | MATCH |
| total_xp_earned | total_xp_earned | number | MATCH |
| total_ml_coins_earned | total_ml_coins_earned | number | MATCH |
| time_spent | time_spent | string/number | MATCH |
| sessions_count | sessions_count | number | MATCH |
| attempts_count | attempts_count | number | MATCH |
| hints_used_total | hints_used_total | number | MATCH |
| comodines_used_total | comodines_used_total | number | MATCH |
| comodines_cost_total | comodines_cost_total | number | MATCH |
| started_at | started_at | Date/string | MATCH |
| completed_at | completed_at | Date/string | MATCH |
| last_accessed_at | last_accessed_at | Date/string | MATCH |
| deadline | deadline | Date/string | MATCH |
| classroom_id | classroom_id | string? | MATCH |
| assignment_id | assignment_id | string? | MATCH |
| allow_retry | allow_retry | boolean | MATCH |
| sequential_completion | sequential_completion | boolean | MATCH |
| adaptive_difficulty | adaptive_difficulty | boolean | MATCH |
| learning_path | learning_path | any[] | MATCH |
| performance_analytics | performance_analytics | Record | MATCH |
| system_observations | system_observations | Record | MATCH |
| student_notes | student_notes | string? | MATCH |
| teacher_notes | teacher_notes | string? | MATCH |
| metadata | metadata | Record | MATCH |
| created_at | created_at | Date/string | MATCH |
| updated_at | updated_at | Date/string | MATCH |

**Alineacion: 95%** (33/35 campos)

**Campos faltantes en Frontend:**
- `submitted_exercises` (Feature M3-M5)
- `graded_exercises` (Feature M3-M5)

**Nota:** Estos campos son del Feature M3-M5 (2026-01-08). El frontend tiene `submittedExercises` y `gradedExercises` en `ModuleProgressSummary` pero no en el type principal.

---

## 6. PLAN DE CORRECCION

### 6.1 Prioridad P0 (Critico)

| ID | Accion | Archivo | Cambio |
|----|--------|---------|--------|
| P0-001 | Actualizar comentarios XP MayaRank | apps/backend/src/shared/constants/enums.constants.ts:161-167 | Alinear con ranks.constants.ts v2.0 |

### 6.2 Prioridad P2 (Media) - BACKLOG

| ID | Accion | Archivo | Cambio |
|----|--------|---------|--------|
| P2-001 | Agregar submitted_exercises | progress.types.ts | Campo opcional |
| P2-002 | Agregar graded_exercises | progress.types.ts | Campo opcional |

### 6.3 Prioridad P3 (Baja) - NO REQUERIDO

| ID | Descripcion | Razon de No-Accion |
|----|-------------|-------------------|
| P3-001 | PowerupType vs ComodinTypeEnum naming | Aceptable, valores identicos |
| P3-002 | draft vs in_progress status | Semanticamente equivalentes |

---

## 7. CODIGO A MODIFICAR

### 7.1 P0-001: Backend MayaRank XP Comments

**Archivo:** `apps/backend/src/shared/constants/enums.constants.ts:161-167`

**Antes:**
```typescript
export enum MayaRank {
  AJAW = 'Ajaw',                    // Nivel 1: Señor, líder supremo (0-999 XP)
  NACOM = 'Nacom',                  // Nivel 2: Capitán de guerra (1,000-2,999 XP)
  AH_KIN = 'Ah K\'in',              // Nivel 3: Sacerdote del sol (3,000-5,999 XP)
  HALACH_UINIC = 'Halach Uinic',    // Nivel 4: Hombre verdadero (6,000-9,999 XP)
  KUKULKAN = 'K\'uk\'ulkan',        // Nivel 5: Serpiente emplumada (10,000+ XP) - Corregido ortografia 2025-11-26
}
```

**Despues:**
```typescript
export enum MayaRank {
  AJAW = 'Ajaw',                    // Nivel 1: Señor (0-499 XP) - @see ranks.constants.ts v2.0
  NACOM = 'Nacom',                  // Nivel 2: Capitan de guerra (500-999 XP)
  AH_KIN = 'Ah K\'in',              // Nivel 3: Sacerdote del sol (1,000-1,499 XP)
  HALACH_UINIC = 'Halach Uinic',    // Nivel 4: Hombre verdadero (1,500-2,249 XP)
  KUKULKAN = 'K\'uk\'ulkan',        // Nivel 5: Serpiente emplumada (2,250+ XP)
}
```

---

## 8. DECISION FINAL

**ANALISIS COMPLETADO**

- Solo se encontro 1 inconsistencia critica (MayaRank XP comments en backend)
- ProgressStatus enum perfectamente sincronizado (100%)
- ComodinType/PowerupType valores identicos
- ModuleProgress interface 95% alineada
- Diferencias menores en status naming son aceptables

---

## 9. PROXIMOS PASOS

1. **F3-F5**: Omitir (cambio simple, no requiere plan elaborado)
2. **F6**: Ejecutar correccion P0-001
3. **F7**: Validar build backend

---

**Documento generado por:** @PERFIL_ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F6 - Ejecucion (directa)
