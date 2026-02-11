# 🏗️ ARQUITECTURA DEL SISTEMA DE RECOMPENSAS Y PROGRESO

**Versión:** v2.8.0
**Fecha:** 2025-11-29
**Estado:** ✅ IMPLEMENTADO Y VERIFICADO

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura de Componentes](#arquitectura-de-componentes)
3. [Dual-Table Pattern](#dual-table-pattern)
4. [Flujo de Datos](#flujo-de-datos)
5. [Patrones de Diseño](#patrones-de-diseño)
6. [Seguridad y Rendimiento](#seguridad-y-rendimiento)

---

## 🎯 1. Visión General

### Objetivo del Sistema

Implementar un sistema completo de **gamificación educativa** que:
- ✅ Otorga **XP y ML Coins** por completar ejercicios
- ✅ Actualiza **estadísticas del usuario** automáticamente
- ✅ Rastrea **progreso de módulos** en tiempo real
- ✅ Previene **duplicación de recompensas**
- ✅ Mantiene **integridad de datos** con triggers

---

## 🏛️ 2. Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐│
│  │ ModuleDetailPage │──│ useModuleDetail  │──│ ExerciseCard  ││
│  │   (Component)    │  │     (Hook)       │  │  (Component)  ││
│  └──────────────────┘  └──────────────────┘  └───────────────┘│
│           │                     │                      │        │
└───────────┼─────────────────────┼──────────────────────┼────────┘
            │                     │                      │
            │ GET /modules/:id    │ GET /exercises       │
            │ GET /exercises      │ (with completed)     │
            ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND (NestJS)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           API LAYER (Controllers + Guards)               │  │
│  │  ┌────────────────────┐  ┌──────────────────────────┐   │  │
│  │  │ ModulesController  │  │  ExercisesController     │   │  │
│  │  │  + JwtAuthGuard    │  │   + JwtAuthGuard         │   │  │
│  │  └────────────────────┘  └──────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SERVICE LAYER                               │  │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐   │  │
│  │  │ ModulesService  │  │ ExerciseAttemptService      │   │  │
│  │  │ ExercisesService│  │ ExerciseSubmissionService   │   │  │
│  │  └─────────────────┘  └─────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│           │                            │                        │
└───────────┼────────────────────────────┼────────────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         educational_content (schema)                     │  │
│  │  ┌──────────┐         ┌──────────┐                      │  │
│  │  │ modules  │         │exercises │                      │  │
│  │  └──────────┘         └──────────┘                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         progress_tracking (schema)                       │  │
│  │  ┌──────────────────┐  ┌──────────────────────┐         │  │
│  │  │ exercise_        │  │  exercise_attempts   │         │  │
│  │  │ submissions      │  │  (rewards table)     │         │  │
│  │  │ (workflow)       │  │   ▲ INSERT           │         │  │
│  │  └──────────────────┘  └───┼──────────────────┘         │  │
│  └──────────────────────────────┼──────────────────────────┘  │
│                                 │ TRIGGER                     │
│                                 │                             │
│  ┌──────────────────────────────┼──────────────────────────┐  │
│  │         gamilit (schema)     │                          │  │
│  │  ┌───────────────────────────▼────────────────────────┐ │  │
│  │  │ update_user_stats_on_exercise_complete()           │ │  │
│  │  │ (TRIGGER FUNCTION)                                 │ │  │
│  │  └───────────────────────────┬────────────────────────┘ │  │
│  └──────────────────────────────┼──────────────────────────┘  │
│                                 │ UPDATE/INSERT               │
│                                 ▼                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         gamification_system (schema)                     │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ user_stats (table)                               │   │  │
│  │  │  - total_xp                                      │   │  │
│  │  │  - ml_coins                                      │   │  │
│  │  │  - ml_coins_earned_total                        │   │  │
│  │  │  - exercises_completed                          │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 3. Dual-Table Pattern

### Problema Resuelto

**Separación de Responsabilidades**: Necesitamos distinguir entre:
1. **Workflow de evaluación** (draft → submitted → graded)
2. **Sistema de recompensas** (XP, ML Coins, achievements)

### Solución: Dos Tablas Complementarias

#### 📝 `exercise_submissions` - Tabla de Workflow y Revisión Manual

**Propósito:** Gestión del ciclo de vida de submissions que requieren calificación manual

```sql
CREATE TABLE progress_tracking.exercise_submissions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    status VARCHAR(20), -- 'draft', 'submitted', 'graded', 'reviewed'
    answers JSONB,
    answer_data JSONB,
    is_correct BOOLEAN DEFAULT false,
    xp_earned INTEGER DEFAULT 0,
    ml_coins_earned INTEGER DEFAULT 0,
    graded_at TIMESTAMP,
    feedback TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Flujo:**
```
DRAFT → SUBMITTED → GRADED → REVIEWED
  ↓         ↓          ↓          ↓
Save     Submit    Teacher    Final
```

**Trigger Asociado (v2.8.0):**
```sql
CREATE TRIGGER trg_update_user_stats_on_submission
  AFTER UPDATE ON exercise_submissions
  FOR EACH ROW
  WHEN (status IN ('graded','reviewed') AND is_correct = true)
  EXECUTE FUNCTION gamilit.update_user_stats_on_submission_graded();
```

---

#### 🏆 `exercise_attempts` - Tabla de Recompensas

**Propósito:** Tracking de intentos y cálculo de recompensas

```sql
CREATE TABLE progress_tracking.exercise_attempts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    submission_id UUID REFERENCES exercise_submissions(id),

    -- SCORING
    score INTEGER NOT NULL,
    is_correct BOOLEAN,
    attempt_number INTEGER,

    -- REWARDS (calculados por ExerciseAttemptService)
    xp_earned INTEGER NOT NULL,
    ml_coins_earned INTEGER NOT NULL,

    -- GAMEPLAY
    hints_used INTEGER DEFAULT 0,
    powerups_used JSONB DEFAULT '[]'::JSONB,
    time_spent INTEGER,

    created_at TIMESTAMP DEFAULT NOW()
);
```

**Trigger Asociado:**
```sql
CREATE TRIGGER trg_update_user_stats_on_exercise
  AFTER INSERT ON exercise_attempts
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.update_user_stats_on_exercise_complete();
```

---

### Relación Entre Tablas (v2.8.0 - Dual Trigger)

```
┌──────────────────────────────────────────────────────────────────┐
│              ARQUITECTURA BD-FIRST (Triggers = Verdad)           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ exercise_submissions │
│ (Revisión manual)    │
└──────────┬───────────┘
           │ UPDATE (status='graded', is_correct=true)
           │
           ▼
     TRIGGER 31 ─────────────────────────────────────────┐
     trg_update_user_stats_on_submission                  │
           │                                              │
           ▼                                              ▼
     ┌─────────────────────────────────────────────────────┐
     │              update_user_stats_on_                  │
     │              submission_graded()                    │
     └─────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────┐       ┌──────────────────────────────────┐
│ exercise_attempts    │       │         user_stats               │
│ (Autocorregibles)    │       │   total_xp, ml_coins, ...        │
└──────────┬───────────┘       └──────────────┬───────────────────┘
           │ INSERT                           │
           │                                  │ UPDATE total_xp
           ▼                                  ▼
     TRIGGER 21 ────────────┐           TRIGGER 27
     trg_update_user_stats_ │           trg_update_missions_on_earn_xp
     on_exercise            │                 │
           │                │                 ▼
           ▼                │           ┌────────────────────────┐
     ┌─────────────────┐    │           │ update_missions_on_    │
     │ update_user_    │────┘           │ earn_xp()              │
     │ stats_on_       │                │ → Actualiza misiones   │
     │ exercise_       │                │   de tipo earn_xp      │
     │ complete()      │                └────────────────────────┘
     └─────────────────┘
```

**Ventajas:**
- ✅ **BD-first Architecture**: Triggers como fuente de verdad
- ✅ **Dual Path**: Ambos flujos actualizan user_stats y misiones
- ✅ **Separation of Concerns**: Cada tabla tiene una responsabilidad clara
- ✅ **Atomic Rewards**: Inserción/Actualización = recompensas otorgadas automáticamente
- ✅ **History Tracking**: Se mantiene historial completo de attempts/submissions
- ✅ **No Duplicate Rewards**: Anti-refire en triggers previene duplicados
- ✅ **Cascade to Missions**: Actualización de XP dispara automáticamente misiones earn_xp

---

## 🌊 4. Flujo de Datos

### 4.1 Submit de Ejercicio (Escritura)

```
1. Frontend
   └─▶ POST /api/educational/exercises/:id/submit
       Body: { answers, startedAt, hintsUsed, powerupsUsed }

2. ExercisesController.submit()
   └─▶ ExerciseAttemptService.createAttempt()
       │
       ├─▶ Calcular score (0-100)
       ├─▶ Calcular XP earned (con penalties)
       ├─▶ Calcular ML Coins earned (con penalties)
       │
       └─▶ INSERT INTO exercise_attempts
           { xp_earned, ml_coins_earned, is_correct, score }

3. Database Trigger (AUTOMÁTICO)
   └─▶ gamilit.update_user_stats_on_exercise_complete()
       │
       ├─▶ READ NEW.xp_earned, NEW.ml_coins_earned
       │
       └─▶ UPDATE gamification_system.user_stats
           SET total_xp = total_xp + NEW.xp_earned
           SET ml_coins = ml_coins + NEW.ml_coins_earned
           SET exercises_completed = exercises_completed + 1

4. Respuesta al Frontend
   └─▶ { score, isPerfect, rewards: { xp, mlCoins }, rankUp }
```

---

### 4.2 Consulta de Progreso (Lectura)

```
1. Frontend
   └─▶ GET /api/educational/modules
       Header: Authorization: Bearer {JWT}

2. ModulesController.findAll()
   ├─▶ Obtener todos los módulos
   ├─▶ Obtener submissions del usuario (status='graded')
   ├─▶ Obtener todos los ejercicios
   │
   └─▶ Para cada módulo:
       ├─▶ Filtrar ejercicios del módulo
       ├─▶ Contar completed (en completedExercisesMap)
       ├─▶ Calcular progress = (completed / total) * 100
       └─▶ Agregar campos: { total_exercises, completed_exercises, progress, completed }

3. Respuesta al Frontend
   └─▶ [
         { id, title, total_exercises: 5, completed_exercises: 2, progress: 40, completed: false },
         ...
       ]
```

---

## 🎨 5. Patrones de Diseño Implementados

### 5.1 UPSERT Pattern (Base de Datos)

**Ubicación:** `update_user_stats_on_exercise_complete()`

```sql
-- Intenta UPDATE
UPDATE user_stats SET ... WHERE user_id = NEW.user_id;

-- Si no existe (NOT FOUND), hace INSERT
IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, ...) VALUES (...);
END IF;
```

**Ventaja:** Evita errores por falta de registro inicial de user_stats

---

### 5.2 Map-based Lookup (Backend)

**Ubicación:** `ModulesController.findAll()`, `ExercisesController.findAll()`

```typescript
// Crear Map para O(1) lookup
const completedExercisesMap = new Map<string, boolean>();
allSubmissions.forEach((submission) => {
  if (submission.status === 'graded') {
    completedExercisesMap.set(submission.exercise_id, true);
  }
});

// Usar Map para agregar campo 'completed'
exercises.map((exercise) => ({
  ...exercise,
  completed: completedExercisesMap.get(exercise.id) || false
}));
```

**Ventaja:** Evita N+1 queries, eficiencia O(n) en lugar de O(n²)

---

### 5.3 Trigger-based Automation (Base de Datos)

**Patrón:** Event-driven updates

```sql
CREATE TRIGGER trg_update_user_stats_on_exercise
  AFTER INSERT ON exercise_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_exercise_complete();
```

**Ventajas:**
- ✅ Actualización automática (no requiere código de aplicación)
- ✅ Atomic (dentro de la misma transacción)
- ✅ No se puede olvidar actualizar stats

---

### 5.4 Dependency Injection (Backend)

**Ubicación:** `ModulesController`

```typescript
constructor(
  private readonly modulesService: ModulesService,
  private readonly exercisesService: ExercisesService,
  private readonly exerciseSubmissionService: ExerciseSubmissionService,
) {}
```

**Ventaja:** Testeable, desacoplado, siguiendo principios SOLID

---

### 5.5 Custom Hooks (Frontend)

**Ubicación:** `useModuleDetail`

```typescript
export function useModuleDetail(moduleId: string) {
  const [module, setModule] = useState<Module | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch logic
  }, [moduleId]);

  return { module, exercises, loading, error };
}
```

**Ventaja:** Reusable, encapsula lógica de fetch, separation of concerns

---

## 🔒 6. Seguridad y Rendimiento

### 6.1 Seguridad

#### Autenticación JWT
```typescript
@UseGuards(JwtAuthGuard)
@Get('modules')
async findAll(@Request() req: any) {
  const userId = req.user.id; // Extraído del JWT
  // ...
}
```

#### RLS (Row Level Security)
```sql
-- Políticas en BD aseguran que users solo vean sus datos
ALTER TABLE progress_tracking.exercise_submissions ENABLE ROW LEVEL SECURITY;
```

#### SECURITY DEFINER
```sql
CREATE OR REPLACE FUNCTION update_user_stats_on_exercise_complete()
LANGUAGE plpgsql
SECURITY DEFINER  -- Ejecuta con permisos del owner de la función
```

---

### 6.2 Rendimiento

#### Índices en BD
```sql
-- Índices para queries frecuentes
CREATE INDEX idx_exercise_submissions_user ON exercise_submissions(user_id);
CREATE INDEX idx_exercise_attempts_user ON exercise_attempts(user_id);
CREATE INDEX idx_user_stats_user ON user_stats(user_id);
```

#### Batch Fetch
```typescript
// En lugar de N queries, una sola
const allSubmissions = await this.exerciseSubmissionService.findByUserId(userId);
```

#### Caching Potencial
```typescript
// TODO: Implementar cache en Redis para submissions frecuentes
@Cacheable('user-submissions', ttl: 300)
async findByUserId(userId: string) { ... }
```

---

## 📊 7. Métricas y Monitoreo

### Puntos de Observabilidad

1. **Trigger Execution Time**
   - Medir tiempo de `update_user_stats_on_exercise_complete()`
   - Alert si > 100ms

2. **API Response Time**
   - GET /modules: objetivo < 200ms
   - GET /exercises: objetivo < 150ms

3. **Error Rates**
   - Trigger warnings en logs
   - Failed submissions
   - Token expiration

---

**Última actualización:** 2025-11-29
**Autor:** Sistema Gamilit
**Versión:** 2.8.0
