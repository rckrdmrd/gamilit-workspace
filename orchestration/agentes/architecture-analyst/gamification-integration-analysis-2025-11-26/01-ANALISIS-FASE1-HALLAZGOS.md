# ANÁLISIS DE INTEGRACIÓN DE GAMIFICACIÓN - FASE 1

**Fecha:** 2025-11-26
**Analista:** Architecture-Analyst
**Tarea:** Análisis de integración de gamificación con ejercicios módulos 1-3

---

## 🎯 PROBLEMA REPORTADO

El usuario completó 3 ejercicios pero:
- ❌ NO se actualizaron las actividades recientes
- ❌ NO se actualizó el progreso de misiones (debía completarse 1)
- ❌ NO se obtuvieron las recompensas esperadas

---

## 📊 HALLAZGOS DEL ANÁLISIS EXPLORATORIO

### 1. ESTRUCTURA DE EJERCICIOS DEL MÓDULO 1

Los primeros 3 ejercicios del módulo 1 (Comprensión Literal):

| # | Ejercicio | Tipo | XP | ML Coins | Tiempo |
|---|-----------|------|-----|----------|--------|
| 1 | Crucigrama Científico | `crucigrama_cientifico` | 100 | 20 | 15 min |
| 2 | Línea de Tiempo Marie Curie | `linea_tiempo` | 100 | 20 | 12 min |
| 3 | Completar Espacios en Blanco | `completar_espacios` | 100 | 20 | 10 min |

**Ubicación componentes:**
- `/apps/frontend/src/features/mechanics/module1/Crucigrama/`
- `/apps/frontend/src/features/mechanics/module1/Timeline/`
- `/apps/frontend/src/features/mechanics/module1/CompletarEspacios/`

---

### 2. ARQUITECTURA DUAL DE SUBMISSIONS (⚠️ CRÍTICO)

El sistema tiene DOS flujos diferentes para procesar ejercicios:

```
┌─────────────────────────────────────────────────────────────────┐
│ FLUJO A: Ejercicios Autocorregibles (99% actual)               │
├─────────────────────────────────────────────────────────────────┤
│ Endpoint: POST /educational/exercises/:id/submit               │
│ Servicio: ExerciseAttemptService                               │
│ Tabla: progress_tracking.exercise_attempts                     │
│ TRIGGERS: ✅ SÍ se disparan (21, 22, 24)                       │
│ XP: Solo en PRIMER acierto (anti-farming)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FLUJO B: Ejercicios con Revisión Manual                        │
├─────────────────────────────────────────────────────────────────┤
│ Endpoint: POST /progress/submissions/submit                    │
│ Servicio: ExerciseSubmissionService                            │
│ Tabla: progress_tracking.exercise_submissions                  │
│ TRIGGERS: ❌ NO se disparan automáticamente                    │
│ XP: Manual via claimRewards()                                  │
└─────────────────────────────────────────────────────────────────┘
```

**🔴 PROBLEMA IDENTIFICADO:**
Si el frontend está enviando al endpoint `/progress/submissions/submit` (Flujo B), los triggers de gamificación NO se disparan porque están asociados a la tabla `exercise_attempts`, NO a `exercise_submissions`.

---

### 3. CASCADA DE TRIGGERS EN exercise_attempts

Cuando se inserta en `exercise_attempts`, PostgreSQL ejecuta triggers en **orden alfabético**:

```
INSERT INTO exercise_attempts
    ↓
┌───────────────────────────────────────────────────────────────┐
│ TRIGGER 22: trg_update_module_progress_on_exercise            │
│ Función: gamilit.update_module_progress_on_exercise_complete()│
│ Actualiza:                                                     │
│   - module_progress.completed_exercises                        │
│   - module_progress.progress_percentage                        │
│   - module_progress.status (not_started→in_progress→completed)│
└───────────────────────────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────────────────────────┐
│ TRIGGER 24: trg_update_missions_on_exercise                   │
│ Función: gamilit.update_missions_on_exercise_complete()       │
│ Actualiza:                                                     │
│   - missions.objectives[].current += 1                        │
│   - missions.progress = recalc()                              │
│   - missions.status → 'completed' si progress >= 100%         │
└───────────────────────────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────────────────────────┐
│ TRIGGER 21: trg_update_user_stats_on_exercise                 │
│ Función: gamilit.update_user_stats_on_exercise_complete()     │
│ Actualiza:                                                     │
│   - user_stats.exercises_completed += 1                        │
│   - user_stats.total_xp += xp_earned                          │
│   - user_stats.ml_coins += ml_coins_earned                    │
│   - user_stats.last_activity_at = now()                       │
└───────────────────────────────────────────────────────────────┘
```

**🔴 PROBLEMA:** Si `is_correct = false` o el INSERT es en `exercise_submissions`, estos triggers NO se ejecutan o no hacen nada.

---

### 4. SISTEMA DE MISIONES

#### Misiones Inicializadas para Usuarios

**Diarias (3):**
| Template | Objetivo | Target | Recompensa |
|----------|----------|--------|------------|
| daily_complete_exercises | complete_exercises | 3 | 50 XP + 25 ML |
| daily_earn_xp | earn_xp | 100 | 30 XP + 15 ML |
| daily_use_comodin | use_comodines | 1 | 20 XP + 10 ML |

**Semanales (5):**
| Template | Objetivo | Target | Recompensa |
|----------|----------|--------|------------|
| weekly_complete_module | complete_modules | 1 | 200 XP + 100 ML |
| weekly_daily_streak | daily_streak | 5 | 150 XP + 75 ML |
| weekly_perfect_scores | perfect_scores | 3 | 180 XP + 90 ML |
| weekly_explorer | explore_modules | 3 | 120 XP + 60 ML |
| weekly_master_learner | complete_exercises | 15 | 250 XP + 125 ML |

**🔴 PROBLEMAS IDENTIFICADOS EN MISIONES:**

1. **Inconsistencia de estructura objectives:**
   - BD crea `objectives` como OBJETO simple
   - Backend espera `objectives` como ARRAY
   - Esto puede causar errores silenciosos en el trigger

2. **Trigger solo busca `complete_exercises`:**
   ```sql
   WHERE objectives @> '[{"type": "complete_exercises"}]'::jsonb
   ```
   - Si objectives es objeto (no array), el operador `@>` NO encuentra match

3. **Cron jobs DESHABILITADOS:**
   - No hay reset automático de misiones diarias/semanales
   - Misiones se generan bajo demanda

4. **Race conditions:**
   - Sin lock pessimista en actualizaciones de progreso
   - Múltiples ejercicios simultáneos pueden causar lecturas fantasma

---

### 5. ACTIVIDADES RECIENTES (🔴 DESACOPLADO)

**Hallazgo crítico:** El sistema de actividades recientes está DESACOPLADO del flujo principal.

```
┌─────────────────────────────────────────────────────────────────┐
│ TABLAS DE ACTIVIDADES EN BD:                                    │
├─────────────────────────────────────────────────────────────────┤
│ 1. audit_logging.activity_log        → Para admin dashboard     │
│ 2. audit_logging.user_activity_logs  → Para analytics           │
│ 3. audit_logging.user_activity       → Legacy                   │
└─────────────────────────────────────────────────────────────────┘
                         ↑
            ❌ NO HAY TRIGGERS que escriban aquí
                         ↑
┌─────────────────────────────────────────────────────────────────┐
│ FLUJO REAL DE RecentActivityService:                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Consulta DIRECTAMENTE:                                       │
│    - module_progress (completados e iniciados)                 │
│    - exercise_submission (correctos)                           │
│    - learning_session                                          │
│ 2. NO usa ninguna tabla de activity_log                        │
└─────────────────────────────────────────────────────────────────┘
```

**🔴 PROBLEMAS:**
1. NO hay trigger que inserte en `activity_log` al completar ejercicio
2. Frontend no hace polling (solo fetch inicial)
3. No hay WebSocket para actualizaciones en tiempo real

---

## 🎯 CAUSA RAÍZ PROBABLE DEL BUG

Basado en el análisis, las causas más probables son:

### Hipótesis 1: Endpoint Incorrecto (Alta Probabilidad)
El frontend está enviando a `/progress/submissions/submit` (ExerciseSubmissionService) en vez de `/educational/exercises/:id/submit` (ExerciseAttemptService).

**Evidencia:**
- Los triggers están en `exercise_attempts`, no en `exercise_submissions`
- El flujo de submissions NO dispara triggers automáticamente

### Hipótesis 2: Estructura de Objectives Incorrecta (Media Probabilidad)
Las misiones se inicializan con objectives como OBJETO pero el trigger espera ARRAY.

**Evidencia:**
```sql
-- Inicialización (18-initialize_user_missions.sql)
objectives: jsonb_build_object('type', 'complete_exercises', ...)  -- OBJETO

-- Trigger busca (17-update_missions_on_exercise_complete.sql)
WHERE objectives @> '[{"type": "complete_exercises"}]'::jsonb  -- ARRAY
```

### Hipótesis 3: is_correct = false (Media Probabilidad)
Los ejercicios se están registrando pero con `is_correct = false`, por lo cual los triggers no actualizan.

**Evidencia:**
- Todos los triggers verifican `IF NEW.is_correct = TRUE THEN...`

---

## 📁 ARCHIVOS CLAVE IDENTIFICADOS

### Frontend
| Archivo | Propósito |
|---------|-----------|
| `apps/frontend/src/apps/student/pages/ExercisePage.tsx` | Orquestación de ejercicios |
| `apps/frontend/src/features/progress/api/progressAPI.ts` | API de submissions |
| `apps/frontend/src/services/api/educationalAPI.ts` | API de ejercicios |
| `apps/frontend/src/apps/student/hooks/useRecentActivities.ts` | Hook de actividades |

### Backend
| Archivo | Propósito |
|---------|-----------|
| `apps/backend/src/modules/progress/services/exercise-attempt.service.ts` | Procesa attempts |
| `apps/backend/src/modules/progress/services/exercise-submission.service.ts` | Procesa submissions |
| `apps/backend/src/modules/gamification/services/missions.service.ts` | Gestión de misiones |
| `apps/backend/src/modules/progress/services/recent-activity.service.ts` | Actividades recientes |

### Database
| Archivo | Propósito |
|---------|-----------|
| `apps/database/ddl/schemas/progress_tracking/triggers/21-trg_update_user_stats_on_exercise.sql` | Actualiza XP/coins |
| `apps/database/ddl/schemas/progress_tracking/triggers/22-trg_update_module_progress_on_exercise.sql` | Actualiza módulo |
| `apps/database/ddl/schemas/progress_tracking/triggers/24-trg_update_missions_on_exercise.sql` | Actualiza misiones |
| `apps/database/ddl/schemas/gamilit/functions/17-update_missions_on_exercise_complete.sql` | Función de misiones |
| `apps/database/ddl/schemas/gamilit/functions/18-initialize_user_missions.sql` | Inicialización misiones |

---

## ✅ SIGUIENTE PASO: FASE 2 - ANÁLISIS DETALLADO

Necesito verificar:
1. ¿Qué endpoint está usando el frontend exactamente?
2. ¿Cómo está estructurado `objectives` en las misiones del usuario de prueba?
3. ¿Los registros en `exercise_attempts` tienen `is_correct = true`?
4. ¿Se están insertando registros en `exercise_attempts` o solo en `exercise_submissions`?

---

**Estado:** FASE 1 COMPLETADA
**Próximo:** Análisis de los 15 ejercicios de los 3 módulos
