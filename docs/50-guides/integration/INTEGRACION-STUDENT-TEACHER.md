# Integracion Student Portal → Teacher Portal

**Fecha de creacion:** 2025-11-29
**Version:** 1.0.0
**Estado:** ESPECIFICACION PARA DESARROLLO
**Relacionado:** PORTAL-TEACHER-GUIDE.md, PORTAL-STUDENT-GUIDE.md, PORTAL-TEACHER-FLOWS.md

---

## 1. Vision General

### 1.1 Proposito de este Documento

Este documento especifica **como el Portal de Students genera datos que el Portal de Teacher necesita consumir**. Sirve como guia para:

1. **Desarrolladores Student Portal**: Que datos deben guardarse correctamente
2. **Desarrolladores Teacher Portal**: Que datos pueden consumir y de donde
3. **Desarrolladores Backend**: Que endpoints, triggers y funciones son necesarios
4. **Desarrolladores Database**: Que estructuras de BD soportan la integracion

### 1.2 Principio Fundamental

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE DATOS UNIDIRECCIONAL                        │
│                                                                             │
│    STUDENT genera datos  ──►  BACKEND procesa  ──►  TEACHER consume         │
│                                                                             │
│    - Respuestas ejercicios    - Valida              - Visualiza progreso   │
│    - Progreso modulos         - Almacena            - Califica             │
│    - Actividad gamificacion   - Calcula metricas    - Genera reportes      │
│    - Misiones completadas     - Dispara triggers    - Recibe alertas       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura de Datos

### 2.1 Schemas de Base de Datos Involucrados

| Schema | Proposito | Tablas Principales |
|--------|-----------|-------------------|
| `auth_management` | Usuarios y perfiles | users, profiles |
| `progress_tracking` | Progreso educativo | module_progress, exercise_submissions, exercise_attempts |
| `gamification_system` | Recompensas | user_stats, ml_coins_transactions, user_achievements |
| `educational_content` | Contenido | modules, exercises |
| `social_features` | Aulas | classrooms, classroom_members, teacher_classrooms |

### 2.2 Diagrama de Relaciones Criticas

```
                    ┌──────────────────────┐
                    │   auth_management    │
                    │  ┌───────────────┐   │
                    │  │     users     │   │
                    │  │  (auth.users) │   │
                    │  └───────┬───────┘   │
                    │          │ 1:1       │
                    │  ┌───────▼───────┐   │
                    │  │   profiles    │   │
                    │  │ (profiles.id) │◄──┼────────────────────────────────┐
                    │  └───────────────┘   │                                │
                    └──────────────────────┘                                │
                                                                            │
┌──────────────────────────────────────────────────────────────────────────┐│
│                          progress_tracking                                ││
│                                                                          ││
│  ┌─────────────────────┐      ┌─────────────────────┐                    ││
│  │   module_progress   │      │ exercise_submissions │                    ││
│  ├─────────────────────┤      ├─────────────────────┤                    ││
│  │ user_id (FK)────────┼──────┼► user_id (FK)───────┼────────────────────┘│
│  │ module_id (FK)      │      │ exercise_id (FK)    │                     │
│  │ classroom_id (FK)   │      │ answer_data (JSONB) │ ◄── RESPUESTAS      │
│  │ progress_percentage │      │ score               │                     │
│  │ exercises_completed │      │ feedback            │                     │
│  │ last_activity_at    │      │ graded_at           │                     │
│  │ status              │      │ status              │                     │
│  └─────────────────────┘      └─────────────────────┘                     │
│                                                                           │
│  ┌─────────────────────┐      ┌─────────────────────┐                     │
│  │  exercise_attempts  │      │  learning_sessions  │                     │
│  ├─────────────────────┤      ├─────────────────────┤                     │
│  │ user_id (FK)        │      │ user_id (FK)        │                     │
│  │ exercise_id (FK)    │      │ module_id (FK)      │                     │
│  │ attempt_number      │      │ duration_minutes    │                     │
│  │ answers (JSONB)     │      │ activities_count    │                     │
│  │ score               │      │ started_at          │                     │
│  │ time_spent_seconds  │      │ ended_at            │                     │
│  │ hints_used          │      └─────────────────────┘                     │
│  │ powerups_used       │                                                  │
│  └─────────────────────┘                                                  │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                         gamification_system                               │
│                                                                           │
│  ┌─────────────────────┐      ┌─────────────────────┐                     │
│  │     user_stats      │      │ml_coins_transactions│                     │
│  ├─────────────────────┤      ├─────────────────────┤                     │
│  │ user_id (FK)        │      │ user_id (FK)        │                     │
│  │ level               │      │ amount              │                     │
│  │ total_xp            │      │ type (earned/spent) │                     │
│  │ ml_coins            │      │ source              │                     │
│  │ current_rank        │      │ created_at          │                     │
│  │ current_streak      │      └─────────────────────┘                     │
│  │ exercises_completed │                                                  │
│  │ modules_completed   │      ┌─────────────────────┐                     │
│  │ perfect_scores      │      │  user_achievements  │                     │
│  └─────────────────────┘      ├─────────────────────┤                     │
│                               │ user_id (FK)        │                     │
│                               │ achievement_id (FK) │                     │
│                               │ unlocked_at         │                     │
│                               │ progress            │                     │
│                               └─────────────────────┘                     │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Especificacion de Respuestas de Ejercicios

### 3.1 Estructura de Almacenamiento

Las respuestas de ejercicios se almacenan en dos tablas principales:

#### Tabla: `progress_tracking.exercise_attempts`
**Proposito:** Registrar cada intento individual (incluyendo incompletos)

```sql
CREATE TABLE progress_tracking.exercise_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_management.profiles(id),
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id),
    attempt_number INTEGER NOT NULL DEFAULT 1,

    -- RESPUESTAS DEL ESTUDIANTE (JSONB flexible por tipo de ejercicio)
    answers JSONB NOT NULL DEFAULT '{}',

    -- METRICAS DEL INTENTO
    score DECIMAL(5,2),
    time_spent_seconds INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    powerups_used JSONB DEFAULT '[]',

    -- ESTADO
    status VARCHAR(20) DEFAULT 'in_progress',
    -- Valores: 'in_progress', 'submitted', 'abandoned'

    -- TIMESTAMPS
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,

    -- CONSTRAINT para unicidad
    UNIQUE(user_id, exercise_id, attempt_number)
);
```

#### Tabla: `progress_tracking.exercise_submissions`
**Proposito:** Registrar envios finales con calificacion

```sql
CREATE TABLE progress_tracking.exercise_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_management.profiles(id),
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id),
    attempt_id UUID REFERENCES progress_tracking.exercise_attempts(id),

    -- RESPUESTAS ENVIADAS (copia final de lo que envio el estudiante)
    answer_data JSONB NOT NULL,

    -- CALIFICACION
    score DECIMAL(5,2),
    max_score DECIMAL(5,2) DEFAULT 100,
    is_correct BOOLEAN,
    partial_scores JSONB, -- Puntuacion por pregunta/seccion

    -- FEEDBACK
    auto_feedback TEXT, -- Generado por sistema
    teacher_feedback TEXT, -- Agregado por profesor

    -- ESTADO
    status VARCHAR(20) DEFAULT 'submitted',
    -- Valores: 'submitted', 'graded', 'pending_review', 'late'

    -- AUDITORIA
    graded_by UUID REFERENCES auth_management.profiles(id),
    graded_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- METADATA
    client_metadata JSONB DEFAULT '{}' -- navegador, IP, etc.
);
```

### 3.2 Formato de `answer_data` por Tipo de Ejercicio

Cada tipo de ejercicio tiene una estructura especifica de respuestas. El Teacher Portal debe poder interpretar estas estructuras.

#### Crucigrama
```json
{
  "clues": {
    "h1": { "answer": "SORBONA", "isCorrect": true },
    "h2": { "answer": "NOBEL", "isCorrect": true },
    "v1": { "answer": "PARIS", "isCorrect": true }
  },
  "completedAt": "2025-11-29T10:30:00Z",
  "hintsUsed": ["h1"]
}
```

#### Linea de Tiempo
```json
{
  "events": [
    { "eventId": "evt-1", "position": 1, "isCorrect": true },
    { "eventId": "evt-2", "position": 2, "isCorrect": false },
    { "eventId": "evt-3", "position": 3, "isCorrect": true }
  ],
  "totalCorrect": 2,
  "totalEvents": 3
}
```

#### Detective Textual
```json
{
  "selections": [
    { "paragraphId": 1, "selectedText": "Marie Curie descubrio...", "isCorrect": true },
    { "paragraphId": 3, "selectedText": "en 1903", "isCorrect": true }
  ],
  "totalSelections": 2,
  "correctSelections": 2
}
```

#### Fill in the Blank
```json
{
  "blanks": {
    "blank_1": { "answer": "polonio", "isCorrect": true },
    "blank_2": { "answer": "radio", "isCorrect": true }
  },
  "correctCount": 2,
  "totalBlanks": 2
}
```

#### True/False
```json
{
  "statements": {
    "stmt_1": { "answer": true, "isCorrect": true },
    "stmt_2": { "answer": false, "isCorrect": false }
  },
  "correctCount": 1,
  "totalStatements": 2
}
```

### 3.3 Acceso del Teacher a las Respuestas

**Endpoint existente:** GET `/teacher/exercise-responses`

**Datos que debe retornar:**

```typescript
interface ExerciseResponseForTeacher {
  // Identificacion
  submissionId: string;
  studentId: string;
  studentName: string;
  exerciseId: string;
  exerciseTitle: string;
  exerciseType: string; // 'crucigrama', 'linea_tiempo', etc.

  // Respuestas del estudiante
  answerData: Record<string, any>; // Estructura especifica del tipo

  // Calificacion
  score: number;
  maxScore: number;
  isCorrect: boolean;
  partialScores: Record<string, number>; // Por pregunta

  // Feedback
  autoFeedback: string | null;
  teacherFeedback: string | null;

  // Estado
  status: 'submitted' | 'graded' | 'pending_review';

  // Metricas del intento
  attemptNumber: number;
  timeSpentSeconds: number;
  hintsUsed: number;
  powerupsUsed: string[];

  // Timestamps
  submittedAt: string;
  gradedAt: string | null;
  gradedBy: string | null;
}
```

---

## 4. Triggers y Funciones de Base de Datos

### 4.1 Triggers Necesarios para Sincronizacion Automatica

#### Trigger 1: Actualizar ModuleProgress cuando se completa ejercicio

```sql
-- Funcion: Actualizar module_progress al completar ejercicio
CREATE OR REPLACE FUNCTION progress_tracking.update_module_progress_on_submission()
RETURNS TRIGGER AS $$
DECLARE
    v_module_id UUID;
    v_classroom_id UUID;
    v_total_exercises INTEGER;
    v_completed_exercises INTEGER;
    v_progress_pct DECIMAL(5,2);
BEGIN
    -- Obtener module_id del ejercicio
    SELECT module_id INTO v_module_id
    FROM educational_content.exercises
    WHERE id = NEW.exercise_id;

    -- Obtener classroom_id del estudiante (primary classroom)
    SELECT cm.classroom_id INTO v_classroom_id
    FROM social_features.classroom_members cm
    WHERE cm.user_id = NEW.user_id
      AND cm.is_primary = true
    LIMIT 1;

    -- Contar ejercicios totales y completados
    SELECT COUNT(*) INTO v_total_exercises
    FROM educational_content.exercises
    WHERE module_id = v_module_id AND is_active = true;

    SELECT COUNT(DISTINCT es.exercise_id) INTO v_completed_exercises
    FROM progress_tracking.exercise_submissions es
    JOIN educational_content.exercises e ON e.id = es.exercise_id
    WHERE es.user_id = NEW.user_id
      AND e.module_id = v_module_id
      AND es.score >= 60; -- Minimo para considerar "completado"

    -- Calcular porcentaje
    v_progress_pct := CASE
        WHEN v_total_exercises > 0
        THEN (v_completed_exercises::DECIMAL / v_total_exercises * 100)
        ELSE 0
    END;

    -- Upsert module_progress
    INSERT INTO progress_tracking.module_progress (
        user_id, module_id, classroom_id,
        exercises_completed, total_exercises, progress_percentage,
        status, last_activity_at
    ) VALUES (
        NEW.user_id, v_module_id, v_classroom_id,
        v_completed_exercises, v_total_exercises, v_progress_pct,
        CASE WHEN v_progress_pct >= 100 THEN 'completed' ELSE 'in_progress' END,
        NOW()
    )
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        exercises_completed = EXCLUDED.exercises_completed,
        progress_percentage = EXCLUDED.progress_percentage,
        status = EXCLUDED.status,
        last_activity_at = NOW(),
        completed_at = CASE
            WHEN EXCLUDED.progress_percentage >= 100 AND module_progress.completed_at IS NULL
            THEN NOW()
            ELSE module_progress.completed_at
        END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trg_update_module_progress
AFTER INSERT ON progress_tracking.exercise_submissions
FOR EACH ROW
EXECUTE FUNCTION progress_tracking.update_module_progress_on_submission();
```

#### Trigger 2: Actualizar UserStats cuando se completa ejercicio

```sql
-- Funcion: Actualizar user_stats al completar ejercicio
CREATE OR REPLACE FUNCTION gamification_system.update_user_stats_on_submission()
RETURNS TRIGGER AS $$
DECLARE
    v_xp_to_add INTEGER;
    v_coins_to_add INTEGER;
    v_is_perfect BOOLEAN;
BEGIN
    -- Calcular XP (basado en score)
    v_xp_to_add := FLOOR(NEW.score * 0.1); -- 10 XP por cada 100 puntos

    -- Calcular ML Coins (solo si score >= 60)
    v_coins_to_add := CASE
        WHEN NEW.score >= 90 THEN 15
        WHEN NEW.score >= 70 THEN 10
        WHEN NEW.score >= 60 THEN 5
        ELSE 0
    END;

    -- Es puntuacion perfecta?
    v_is_perfect := (NEW.score = NEW.max_score);

    -- Actualizar user_stats
    UPDATE gamification_system.user_stats SET
        total_xp = total_xp + v_xp_to_add,
        ml_coins = ml_coins + v_coins_to_add,
        exercises_completed = exercises_completed + 1,
        perfect_scores = perfect_scores + CASE WHEN v_is_perfect THEN 1 ELSE 0 END,
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    -- Registrar transaccion de ML Coins si aplica
    IF v_coins_to_add > 0 THEN
        INSERT INTO gamification_system.ml_coins_transactions (
            user_id, amount, type, source, description, created_at
        ) VALUES (
            NEW.user_id,
            v_coins_to_add,
            'earned',
            'exercise_completion',
            'Ejercicio completado con ' || NEW.score || '% de score',
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trg_update_user_stats
AFTER INSERT ON progress_tracking.exercise_submissions
FOR EACH ROW
WHEN (NEW.status = 'graded' OR NEW.score IS NOT NULL)
EXECUTE FUNCTION gamification_system.update_user_stats_on_submission();
```

#### Trigger 3: Generar Alerta de Intervencion por bajo rendimiento

```sql
-- Funcion: Crear alerta cuando estudiante falla multiples veces
CREATE OR REPLACE FUNCTION progress_tracking.check_student_failures()
RETURNS TRIGGER AS $$
DECLARE
    v_failure_count INTEGER;
    v_teacher_id UUID;
BEGIN
    -- Solo procesar si es un fallo (score < 60)
    IF NEW.score >= 60 THEN
        RETURN NEW;
    END IF;

    -- Contar fallos consecutivos en ultimas 5 submissions
    SELECT COUNT(*) INTO v_failure_count
    FROM (
        SELECT score
        FROM progress_tracking.exercise_submissions
        WHERE user_id = NEW.user_id
        ORDER BY submitted_at DESC
        LIMIT 5
    ) recent
    WHERE recent.score < 60;

    -- Si hay 3+ fallos consecutivos, crear alerta
    IF v_failure_count >= 3 THEN
        -- Obtener teacher del classroom del estudiante
        SELECT tc.teacher_id INTO v_teacher_id
        FROM social_features.classroom_members cm
        JOIN social_features.teacher_classrooms tc ON tc.classroom_id = cm.classroom_id
        WHERE cm.user_id = NEW.user_id
          AND cm.is_primary = true
        LIMIT 1;

        IF v_teacher_id IS NOT NULL THEN
            INSERT INTO progress_tracking.student_intervention_alerts (
                teacher_id,
                student_id,
                alert_type,
                priority,
                message,
                details,
                created_at
            ) VALUES (
                v_teacher_id,
                NEW.user_id,
                'repeated_failures',
                'high',
                'Estudiante con multiples ejercicios fallidos consecutivos',
                jsonb_build_object(
                    'failure_count', v_failure_count,
                    'last_exercise_id', NEW.exercise_id,
                    'last_score', NEW.score
                ),
                NOW()
            )
            ON CONFLICT DO NOTHING; -- Evitar duplicados
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trg_check_student_failures
AFTER INSERT ON progress_tracking.exercise_submissions
FOR EACH ROW
EXECUTE FUNCTION progress_tracking.check_student_failures();
```

### 4.2 Funcion de Validacion y Auditoria

Ya existe la funcion `educational_content.validate_and_audit()` que:

1. Recibe las respuestas del estudiante
2. Compara con respuestas correctas del ejercicio
3. Calcula score
4. Registra intento
5. Retorna resultado

**Ver:** `orchestration/reportes/historicos/2025-11/DIAGRAMA-FLUJO-SUBMISSIONS-2025-11-19.md` (Archivo historico)

---

## 5. Endpoints de Integracion

### 5.1 Endpoints que Student Portal DEBE usar correctamente

| Endpoint | Metodo | Descripcion | Datos Guardados |
|----------|--------|-------------|-----------------|
| `/progress/submissions` | POST | Enviar respuesta de ejercicio | exercise_submissions |
| `/progress/attempts` | POST | Iniciar intento | exercise_attempts |
| `/progress/attempts/:id` | PATCH | Actualizar intento (autosave) | exercise_attempts |
| `/gamification/missions/:id/claim` | POST | Reclamar recompensa mision | ml_coins_transactions |

### 5.2 Endpoints que Teacher Portal CONSUME

| Endpoint | Metodo | Descripcion | Origen de Datos |
|----------|--------|-------------|-----------------|
| `/teacher/dashboard/stats` | GET | Estadisticas generales | Agregacion multiple |
| `/teacher/students/:id/progress` | GET | Progreso del estudiante | module_progress |
| `/teacher/exercise-responses` | GET | Respuestas de ejercicios | exercise_submissions |
| `/teacher/alerts` | GET | Alertas de intervencion | student_intervention_alerts |
| `/teacher/classrooms/:id/students` | GET | Estudiantes del aula | classroom_members + user_stats |
| `/gamification/users/:id/stats` | GET | Stats de gamificacion | user_stats |
| `/gamification/users/:id/achievements` | GET | Logros del estudiante | user_achievements |

### 5.3 Endpoints NUEVOS Requeridos

| Endpoint | Metodo | Descripcion | Prioridad |
|----------|--------|-------------|-----------|
| `/teacher/students/:id/attempts/:exerciseId` | GET | Historial de intentos | P0 |
| `/teacher/students/:id/pending-activities` | GET | Actividades pendientes | P1 |
| `/teacher/students/:id/recent-activities` | GET | Actividades recientes | P1 |
| `/teacher/classrooms/:id/exercise-stats` | GET | Stats por tipo de ejercicio | P1 |
| `/teacher/classrooms/:id/problematic-exercises` | GET | Ejercicios con mas fallos | P1 |

---

## 6. Dependencias entre Objetos

### 6.1 Mapa de Dependencias

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MAPA DE DEPENDENCIAS                                │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend Student (genera)              Backend (procesa)              Frontend Teacher (consume)
─────────────────────────             ────────────────────            ────────────────────────────

ExercisePage.tsx                      ExerciseSubmissionService       TeacherExerciseResponsesPage
    │                                       │                               ▲
    ├── useExerciseState()                  ├── submitAndGrade()            │
    │   └── answers JSONB                   │   ├── validate()              │
    │                                       │   ├── autoGrade()             │
    └── handleSubmit()                      │   ├── saveSubmission() ───────┼── GET /exercise-responses
        │                                   │   └── distributeRewards()     │
        │                                   │                               │
        ▼                                   ▼                               │
    POST /submissions ─────────────► exercise_submissions ──────────────────┘
                                            │
                                            ├── TRIGGER: update_module_progress
                                            │         │
                                            │         ▼
                                            │   module_progress ────────► GET /students/:id/progress
                                            │                                     │
                                            │                                     ▼
                                            │                             TeacherProgressPage
                                            │
                                            ├── TRIGGER: update_user_stats
                                            │         │
                                            │         ▼
                                            │   user_stats ─────────────► GET /gamification/stats
                                            │   ml_coins_transactions           │
                                            │                                   ▼
                                            │                           TeacherGamificationPage
                                            │
                                            └── TRIGGER: check_student_failures
                                                      │
                                                      ▼
                                              student_intervention_alerts ─► GET /alerts
                                                                                  │
                                                                                  ▼
                                                                          TeacherAlertsPage
```

### 6.2 Impacto de Cambios

| Si cambias... | Afecta a... |
|---------------|-------------|
| Estructura de `answer_data` en Student | DTOs de respuesta en Teacher, Funcion de validacion en BD |
| Schema de `exercise_submissions` | Triggers de BD, Queries de Teacher, DTOs de ambos portales |
| Logica de `autoGrade()` en Backend | Scores que ve el Teacher, Triggers de gamificacion |
| Trigger de `update_module_progress` | Datos de progreso en Teacher Dashboard |
| Trigger de `update_user_stats` | Datos de gamificacion en Teacher |

---

## 7. Checklist de Desarrollo

### 7.1 Para Desarrollo en Student Portal

Antes de modificar cualquier funcionalidad que genere datos:

- [ ] Verificar que el endpoint correcto se esta usando (ver seccion 5.1)
- [ ] Verificar que la estructura de `answer_data` sigue el formato documentado (seccion 3.2)
- [ ] Verificar que los triggers de BD estan activos (seccion 4)
- [ ] Probar que Teacher Portal puede ver los datos generados
- [ ] Actualizar esta documentacion si hay cambios en estructuras

### 7.2 Para Desarrollo en Teacher Portal

Antes de consumir nuevos datos:

- [ ] Verificar que el endpoint existe (ver seccion 5.2)
- [ ] Verificar que el Student Portal esta generando los datos correctamente
- [ ] Verificar tipos de datos en TypeScript coinciden con respuesta real
- [ ] Probar con datos reales de estudiantes
- [ ] Documentar cualquier endpoint nuevo necesario

### 7.3 Para Desarrollo en Backend

Antes de modificar servicios o triggers:

- [ ] Evaluar impacto en ambos portales (ver seccion 6.2)
- [ ] Verificar que no se rompen triggers existentes
- [ ] Probar flujo completo: Student envía → Backend procesa → Teacher ve
- [ ] Actualizar DTOs si hay cambios en estructuras
- [ ] Actualizar esta documentacion

### 7.4 Para Desarrollo en Database

Antes de modificar schemas o triggers:

- [ ] Consultar impacto en tabla de dependencias (seccion 6.2)
- [ ] Actualizar scripts DDL en `apps/database/ddl/`
- [ ] Verificar que recreacion de BD funciona
- [ ] Probar triggers con datos de prueba
- [ ] Actualizar DATABASE_INVENTORY.yml

---

## 8. Validaciones Obligatorias

### 8.1 Antes de Merge a Main

1. **Build exitoso**
   ```bash
   cd apps/backend && npm run build
   cd apps/frontend && npm run build
   ```

2. **Lint sin errores**
   ```bash
   cd apps/backend && npm run lint
   cd apps/frontend && npm run lint
   ```

3. **Test de integracion Student→Teacher**
   - Student puede enviar ejercicio
   - Backend procesa y guarda correctamente
   - Triggers se ejecutan
   - Teacher puede ver los datos

### 8.2 Datos Minimos que Teacher DEBE poder ver

Para cada estudiante de su aula:

| Dato | Origen | Criticidad |
|------|--------|------------|
| Nombre y email | profiles | CRITICO |
| Modulos completados | module_progress | CRITICO |
| Porcentaje de progreso | module_progress | CRITICO |
| Puntuacion promedio | Agregacion de submissions | CRITICO |
| Ultima actividad | module_progress.last_activity_at | CRITICO |
| Respuestas de ejercicios | exercise_submissions | CRITICO |
| ML Coins | user_stats | ALTA |
| Rango Maya | user_stats | ALTA |
| Logros | user_achievements | MEDIA |
| Misiones activas | user_missions | MEDIA |

---

## 9. Referencias

### Documentos Relacionados

- [PORTAL-TEACHER-GUIDE.md](../../60-portals/teacher/PORTAL-TEACHER-GUIDE.md) - Guia completa del Teacher Portal
- [PORTAL-TEACHER-API-REFERENCE.md](../../60-portals/teacher/PORTAL-TEACHER-API-REFERENCE.md) - Referencia de APIs
- [PORTAL-TEACHER-FLOWS.md](../../60-portals/teacher/PORTAL-TEACHER-FLOWS.md) - Flujos de datos Teacher
- [PORTAL-STUDENT-GUIDE.md](../../60-portals/student/PORTAL-STUDENT-GUIDE.md) - Guia del Student Portal
- [Student Specs README](../../60-portals/student/specs/README.md) - Documentacion de gaps Student
- [Reportes historicos](../../../orchestration/reports/README.md) - Flujo detallado de submissions (archivo historico consolidado)

### Inventarios

- [DATABASE_INVENTORY.yml](../../../orchestration/inventarios/DATABASE_INVENTORY.yml)
- [BACKEND_INVENTORY.yml](../../../orchestration/inventarios/BACKEND_INVENTORY.yml)
- [FRONTEND_INVENTORY.yml](../../../orchestration/inventarios/FRONTEND_INVENTORY.yml)

---

**Documento creado por:** Architecture-Analyst
**Fecha:** 2025-11-29
**Estado:** ESPECIFICACION LISTA PARA DESARROLLO
