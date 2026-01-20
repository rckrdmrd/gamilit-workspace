# Ciclo de Vida de Estados de Ejercicio

**Version:** 2.0.0
**Fecha:** 2026-01-20
**Autor:** Sistema de Documentacion SIMCO
**Tarea:** SUBTASK-3.2 de TASK-2026-01-20-EXERCISES-VALIDATION
**GAPs Resueltos:** GAP-EX-010 (Estados Ambiguos), GAP-EX-002 (Arquitectura Dual)

---

## Resumen Ejecutivo

Este documento describe el ciclo de vida completo de un ejercicio en Gamilit, desde su creacion (draft) hasta su evaluacion final (completed/reviewed). El sistema soporta dos flujos principales:

1. **Evaluacion Automatica** (Modulos 1-2): Calificacion inmediata por el sistema
2. **Evaluacion Manual** (Modulos 3-5): Calificacion por docente con rubrica

---

## Estados del Ejercicio (ExerciseSubmission)

### Estados Definidos en DDL

```sql
-- Constraint en progress_tracking.exercise_submissions
CONSTRAINT exercise_submissions_status_check
CHECK ((status = ANY (ARRAY[
    'draft'::text,
    'submitted'::text,
    'graded'::text,
    'reviewed'::text,
    'pending_review'::text
])))
```

### Descripcion de Estados

| Estado | Descripcion | Siguiente Estado | Actor |
|--------|-------------|------------------|-------|
| `draft` | Trabajo en progreso, auto-guardado | `submitted` | Estudiante |
| `submitted` | Enviado, esperando evaluacion | `graded`, `pending_review` | Sistema/Docente |
| `pending_review` | En cola para revision manual | `graded` | Sistema |
| `graded` | Calificado con puntaje asignado | `reviewed` | Sistema/Docente |
| `reviewed` | Feedback proporcionado (estado final) | - | Docente |

---

## Diagrama de Estados

```
                                    EVALUACION AUTOMATICA (M1-M2)
                                    ============================

    +-------+      submit      +-----------+    auto-grade    +---------+
    | draft | --------------> | submitted | ---------------> | graded  |
    +-------+                 +-----------+                  +---------+
        ^                                                         |
        |                                                         | (opcional)
        | auto-save                                               v
        |                                                   +----------+
    [Estudiante                                             | reviewed |
     trabajando]                                            +----------+


                                    EVALUACION MANUAL (M3-M5)
                                    =========================

    +-------+      submit      +-----------+     queue      +----------------+
    | draft | --------------> | submitted | ------------> | pending_review |
    +-------+                 +-----------+                +----------------+
        ^                                                         |
        |                                                         | teacher grades
        | auto-save                                               v
        |                                                   +---------+
    [Estudiante                                             | graded  |
     trabajando]                                            +---------+
                                                                  |
                                                                  | feedback
                                                                  v
                                                            +----------+
                                                            | reviewed |
                                                            +----------+
```

---

## Flujo de Evaluacion Automatica (M1-M2)

### Secuencia Completa

```
1. ESTUDIANTE inicia ejercicio
   |
   v
2. [draft] - Auto-save periodico (cada 30s)
   |       - answer_data actualizado
   |       - time_spent_seconds acumulado
   v
3. ESTUDIANTE hace clic en "Enviar"
   |
   v
4. [submitted] - submitted_at = NOW()
   |           - Validacion de estructura (ExerciseAnswerValidator)
   v
5. SISTEMA ejecuta validate_and_audit()
   |         - SQL function en educational_content
   |         - Genera audit record
   v
6. [graded] - score calculado
   |        - is_correct determinado
   |        - graded_at = NOW()
   |        - feedback generado
   v
7. SISTEMA ejecuta claimRewards()
   |        - XP distribuido (con multiplicador de rango)
   |        - ML Coins distribuidos
   |        - Verificacion de rank up
   v
8. SISTEMA actualiza module_progress
   |        - progress_percentage recalculado
   |        - completed_exercises incrementado
   v
9. FeedbackModal mostrado al estudiante
   - Score, XP, ML Coins earned
   - Confetti si es success
```

### Codigo Backend Relevante

```typescript
// exercise-submission.service.ts
async submitExercise(userId, exerciseId, answers) {
  // Validar tipo de ejercicio
  if (!exercise.requires_manual_grading) {
    // Flujo automatico
    submission = await this.gradeSubmission(submission.id);

    if (submission.is_correct && submission.status === 'graded') {
      const rewards = await this.claimRewards(submission.id);
      submission.rankUp = rewards.rankUp;
    }
  }
  return submission;
}
```

---

## Flujo de Evaluacion Manual (M3-M5)

### Secuencia Completa

```
1. ESTUDIANTE inicia ejercicio creativo
   |
   v
2. [draft] - Auto-save periodico
   |       - Contenido multimedia guardado
   v
3. ESTUDIANTE hace clic en "Enviar"
   |
   v
4. [submitted] - submitted_at = NOW()
   |           - Validacion requisitos minimos:
   |             * diario_multimedia: 150 palabras min
   |             * comic_digital: 4 paneles min
   |             * video_carta: 30 segundos min
   v
5. SISTEMA actualiza module_progress (INMEDIATAMENTE)
   |        - submitted_progress_percentage actualizado
   |        - Estudiante ve barra de progreso avanzar
   |        - NO hay rewards aun
   v
6. SISTEMA crea ManualReview
   |        - status = 'pending'
   |        - reviewerId = teacherId (asignado)
   v
7. SISTEMA notifica al DOCENTE
   |        - Notificacion in-app (siempre)
   |        - Email (si habilitado en preferences)
   v
8. DOCENTE ve review en Teacher Portal
   |        - Lista de pendientes con prioridad
   v
9. DOCENTE inicia revision
   |        - ManualReview.status = 'in_progress'
   |        - ManualReview.startedAt = NOW()
   v
10. DOCENTE evalua con rubrica
    |       - rubricScores por criterio
    |       - generalFeedback texto
    |       - detailedFeedback por seccion
    v
11. DOCENTE completa review
    |       - ManualReview.status = 'completed'
    |       - ManualReview.completedAt = NOW()
    v
12. SISTEMA ejecuta gradeSubmission() con manualGrade
    |       - ExerciseSubmission.status = 'graded'
    |       - score = totalScore del docente
    |       - is_correct = (score >= passing_score)
    v
13. SISTEMA ejecuta claimRewards()
    |       - XP y ML Coins distribuidos
    |       - Basado en calificacion del docente
    v
14. SISTEMA notifica al ESTUDIANTE
    |       - Notificacion in-app
    |       - Incluye score, XP, ML Coins
    v
15. ESTUDIANTE ve feedback en modal
    - Score final
    - Feedback del docente
    - Recompensas ganadas
```

### Estados de ManualReview

```
+---------+    start    +-------------+   complete   +-----------+
| pending | ---------> | in_progress | -----------> | completed |
+---------+            +-------------+              +-----------+
                            |
                            | return_for_revision
                            v
                       +----------+
                       | returned |
                       +----------+
```

---

## Campos de Base de Datos Relacionados

### Tabla: progress_tracking.exercise_submissions

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico |
| `user_id` | UUID | FK a auth_management.profiles |
| `exercise_id` | UUID | FK a educational_content.exercises |
| `answer_data` | JSONB | Respuestas del estudiante |
| `is_correct` | BOOLEAN | Resultado de evaluacion |
| `score` | INTEGER | Puntaje obtenido (0-max_score) |
| `max_score` | INTEGER | Puntaje maximo posible (default: 100) |
| `feedback` | TEXT | Retroalimentacion del sistema/docente |
| `status` | TEXT | Estado actual (draft/submitted/graded/reviewed/pending_review) |
| `started_at` | TIMESTAMPTZ | Inicio del ejercicio |
| `submitted_at` | TIMESTAMPTZ | Fecha de envio |
| `graded_at` | TIMESTAMPTZ | Fecha de calificacion |
| `xp_earned` | INTEGER | XP ganado (persistido en claimRewards) |
| `ml_coins_earned` | INTEGER | ML Coins ganados |
| `rewards_claimed` | BOOLEAN | Flag para prevenir duplicados |

### Tabla: progress_tracking.manual_reviews

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico |
| `submission_id` | UUID | FK a exercise_submissions (unique) |
| `reviewer_id` | UUID | FK a profiles (docente) |
| `rubric_scores` | JSONB | Puntuaciones por criterio |
| `total_score` | INTEGER | Puntuacion total (0-100) |
| `general_feedback` | TEXT | Comentarios generales |
| `detailed_feedback` | JSONB | Feedback por seccion |
| `status` | VARCHAR(20) | pending/in_progress/completed/returned |
| `started_at` | TIMESTAMPTZ | Inicio de revision |
| `completed_at` | TIMESTAMPTZ | Fin de revision |

---

## Integracion con Gamificacion

### Distribucion de Rewards

```
                          +-------------------+
                          | ExerciseSubmission|
                          | status = 'graded' |
                          +--------+----------+
                                   |
                                   v
                          +-------------------+
                          |   claimRewards()  |
                          +--------+----------+
                                   |
            +----------------------+----------------------+
            |                      |                      |
            v                      v                      v
    +---------------+      +---------------+      +---------------+
    | userStatsService|    | mlCoinsService |    | missionsService|
    |   .addXp()     |    |   .addCoins()  |    | .updateProgress|
    +---------------+      +---------------+      +---------------+
            |                      |                      |
            v                      v                      v
    +---------------+      +---------------+      +---------------+
    | user_stats    |      | ml_coins_     |      | user_missions |
    | total_xp +    |      | transactions  |      | progress +    |
    +---------------+      +---------------+      +---------------+
```

### Formula de XP

```
xpEarned = baseXpReward * scoreMultiplier * rankMultiplier

donde:
- baseXpReward = exercise.xp_reward (default: 100)
- scoreMultiplier = score / max_score (0.0 - 1.0)
- rankMultiplier = maya_ranks.xp_multiplier (1.00 - 1.25)

Bonus:
- Perfect score (100% sin hints): +50 XP, +10 ML Coins
- Penalizacion por hints: -5 XP por hint usado
```

### Promocion de Rango

```
Al completar ejercicio correctamente:
1. Agregar XP a user_stats.total_xp
2. Trigger trg_check_rank_promotion_on_xp_gain evalua
3. Si total_xp >= next_rank.min_xp:
   - user_stats.current_rank actualizado
   - Bonus ML Coins otorgados
   - Notificacion enviada
   - Multiplicador de XP actualizado
```

---

## Frontend: FeedbackModal

### Propiedades de FeedbackData

```typescript
interface FeedbackData {
  type: 'success' | 'error' | 'partial' | 'info';
  title: string;
  message: string;
  score?: number;
  xpEarned?: number;
  mlCoinsEarned?: number;
  showConfetti?: boolean;
  pendingReview?: boolean;  // M3-M5: true cuando espera revision
  details?: Array<{         // Detalles por fragmento
    fragmentId: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
}
```

### Renderizado Condicional

```
SI pendingReview = true:
  - Mostrar mensaje "Pendiente de validacion por tu maestro"
  - No mostrar XP ni ML Coins (aun no asignados)
  - Mostrar progreso del modulo actualizado

SI pendingReview = false:
  - Mostrar score, XP, ML Coins
  - Confetti si es success
  - Botones: Siguiente (success) o Reintentar (error)
```

---

## Validaciones por Tipo de Ejercicio

### Modulo 5 - Requisitos Minimos

| Tipo | Validacion | Minimo |
|------|------------|--------|
| `diario_multimedia` | Conteo de palabras | 150 palabras |
| `comic_digital` | Conteo de paneles | 4 paneles |
| `video_carta` | Duracion de video | 30 segundos |

### Codigo de Validacion

```typescript
// exercise-submission.service.ts
if (exercise.exercise_type === 'diario_multimedia') {
  const wordCount = this.countWords(content);
  if (wordCount < 150) {
    throw new BadRequestException(
      `El diario debe tener al menos 150 palabras. Actualmente tienes ${wordCount} palabras.`
    );
  }
}
```

---

## Transiciones de Estado Validas

### ExerciseSubmission

```typescript
const validTransitions: Record<string, string[]> = {
  draft: ['submitted'],
  submitted: ['graded', 'draft', 'pending_review'],
  pending_review: ['graded'],
  graded: ['reviewed'],
  reviewed: [], // Estado final
};
```

### ManualReview

```typescript
const validTransitions: Record<string, string[]> = {
  pending: ['in_progress'],
  in_progress: ['completed', 'returned'],
  completed: [],    // Estado final
  returned: ['pending'], // Puede volver a pending si estudiante reenvia
};
```

---

## Arquitectura Dual de Progreso (GAP-EX-002)

### El Problema

En modulos con evaluacion manual (M3-M5), existe una **brecha temporal** entre cuando el estudiante envia su trabajo y cuando el docente lo califica. Esto genera confunsion en:

1. **Barra de progreso**: Si no se actualiza al enviar, el estudiante no ve avance
2. **Recompensas**: Las XP/ML Coins solo se otorgan tras la calificacion
3. **Estado del modulo**: El estudiante no sabe si "completo" o no el ejercicio

### La Solucion: Doble Tracking

La tabla `progress_tracking.module_progress` implementa **dos metricas separadas**:

```
+---------------------------+-------------------------------------------+
| Metrica                   | Descripcion                               |
+---------------------------+-------------------------------------------+
| submitted_exercises       | Ejercicios enviados (draft -> submitted)  |
| submitted_progress_%      | Porcentaje basado en envios               |
| graded_exercises          | Ejercicios calificados (-> graded)        |
| graded_progress_%         | Porcentaje basado en calificaciones       |
+---------------------------+-------------------------------------------+
```

### Campos en module_progress Entity

```typescript
// progress-tracking.module_progress
@Column({ type: 'integer', default: 0 })
  submitted_exercises!: number;  // Se actualiza al ENVIAR

@Column({ type: 'integer', default: 0 })
  graded_exercises!: number;     // Se actualiza al CALIFICAR

@Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  submitted_progress_percentage!: number;  // Para barra visual

@Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  graded_progress_percentage!: number;     // Para calculo de recompensas
```

### Flujo Visual para el Estudiante

```
MODULO M3 (5 ejercicios)

Escenario: Estudiante envia 3 ejercicios, docente califica 1

+-------------------------------------------------------+
| Progreso del Modulo                                   |
|                                                       |
|  Enviados:     [====|====|====|    |    ]  60%       |
|                   3 de 5 ejercicios enviados          |
|                                                       |
|  Calificados:  [====|    |    |    |    ]  20%       |
|                   1 de 5 ejercicios calificados       |
|                                                       |
|  Estado: EN PROGRESO                                  |
|  Pendientes de revision: 2                            |
+-------------------------------------------------------+
```

### Cuando Usar Cada Metrica

| Caso de Uso | Metrica a Usar | Razon |
|-------------|----------------|-------|
| Barra de progreso visual | `submitted_progress_%` | Motivar al estudiante |
| Calculo de XP/MLCoins | `graded_progress_%` | Evitar rewards anticipados |
| Desbloqueo de siguiente modulo | `graded_progress_%` | Garantizar evaluacion |
| Dashboard de estudiante | Ambas | Mostrar estado completo |
| Reportes de docente | `graded_progress_%` | Metricas reales de desempeno |

### Codigo de Actualizacion

```typescript
// Al enviar ejercicio (M3-M5)
async updateProgressOnSubmit(userId: string, moduleId: string) {
  await this.moduleProgressRepo.increment(
    { user_id: userId, module_id: moduleId },
    'submitted_exercises',
    1
  );
  await this.recalculateSubmittedProgress(userId, moduleId);
}

// Al calificar ejercicio (docente)
async updateProgressOnGrade(userId: string, moduleId: string) {
  await this.moduleProgressRepo.increment(
    { user_id: userId, module_id: moduleId },
    'graded_exercises',
    1
  );
  await this.recalculateGradedProgress(userId, moduleId);
}
```

---

## UI por Estado

### Vista del Estudiante

| Estado | Barra de Progreso | XP/MLCoins | Mensaje | Acciones |
|--------|-------------------|------------|---------|----------|
| `draft` | Sin cambio | - | "Guardando borrador..." | Continuar, Enviar |
| `submitted` (M1-M2) | +% inmediato | Mostrados | "Ejercicio completado" | Siguiente, Reintentar |
| `submitted` (M3-M5) | +% submitted | - | "Enviado. Pendiente de revision" | Ver estado |
| `pending_review` | Sin cambio | - | "Tu maestro esta revisando" | Ver estado |
| `graded` | +% graded | Mostrados | "Calificado: X/100" | Ver feedback, Siguiente |
| `reviewed` | Sin cambio | Ya mostrados | "Feedback disponible" | Ver feedback |

### Vista del Docente

| Estado | Ubicacion | Indicador | Acciones |
|--------|-----------|-----------|----------|
| `submitted` | Cola de pendientes | Badge "Nuevo" | Iniciar revision |
| `pending_review` | En revision (si otro docente) | Badge "En proceso" | - |
| `graded` | Historial | Score mostrado | Ver/Editar feedback |
| `reviewed` | Historial | Checkmark verde | Ver feedback |

### Componentes de UI por Estado

```typescript
// Frontend/src/features/exercises/components/ExerciseFeedback.tsx

const FEEDBACK_BY_STATUS = {
  draft: {
    title: 'En Progreso',
    icon: <Edit className="text-gray-500" />,
    message: 'Tu trabajo se esta guardando automaticamente.',
    showRewards: false,
    showConfetti: false,
  },
  submitted: {
    title: 'Enviado',
    icon: <Send className="text-blue-500" />,
    message: 'Tu ejercicio ha sido enviado exitosamente.',
    showRewards: false,  // M3-M5: false, M1-M2: se sobreescribe
    showConfetti: false,
  },
  pending_review: {
    title: 'Pendiente de Revision',
    icon: <Clock className="text-yellow-500" />,
    message: 'Tu maestro revisara tu trabajo pronto.',
    showRewards: false,
    showConfetti: false,
  },
  graded: {
    title: 'Calificado',
    icon: <CheckCircle className="text-green-500" />,
    message: 'Tu ejercicio ha sido calificado.',
    showRewards: true,
    showConfetti: (score >= 80),
  },
  reviewed: {
    title: 'Revisado',
    icon: <MessageSquare className="text-purple-500" />,
    message: 'Tu maestro ha dejado comentarios.',
    showRewards: true,
    showConfetti: false,
  },
};
```

---

## Logica de Transiciones por Modulo

### Modulo 1-2 (Evaluacion Automatica)

```typescript
// Transiciones validas
const M1_M2_TRANSITIONS = {
  draft: ['submitted'],
  submitted: ['graded'],  // Transicion automatica e inmediata
  graded: ['reviewed'],   // Opcional: docente puede agregar feedback
  reviewed: [],           // Final
};

// Flujo tipico
[draft] --submit--> [submitted] --auto-grade--> [graded] --end-->
```

### Modulo 3-5 (Evaluacion Manual)

```typescript
// Transiciones validas
const M3_M5_TRANSITIONS = {
  draft: ['submitted'],
  submitted: ['pending_review'],  // Entra a cola de revision
  pending_review: ['graded'],     // Docente califica
  graded: ['reviewed'],           // Docente agrega feedback
  reviewed: [],                   // Final
};

// Flujo tipico
[draft] --submit--> [submitted] --queue--> [pending_review]
                                                  |
                                           teacher grades
                                                  v
                                            [graded] --feedback--> [reviewed]
```

---

## Archivos de Referencia

### Backend
- `/apps/backend/src/modules/progress/entities/exercise-submission.entity.ts`
- `/apps/backend/src/modules/progress/entities/manual-review.entity.ts`
- `/apps/backend/src/modules/progress/entities/module-progress.entity.ts`
- `/apps/backend/src/modules/progress/services/exercise-submission.service.ts`
- `/apps/backend/src/modules/teacher/services/manual-review.service.ts`

### Frontend
- `/apps/frontend/src/features/exercises/components/ExerciseFeedback.tsx`
- `/apps/frontend/src/features/mechanics/shared/hooks/useExerciseSubmission.ts`
- `/apps/frontend/src/apps/student/hooks/useExerciseState.ts`

### Database DDL
- `/apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`
- `/apps/database/ddl/schemas/progress_tracking/tables/06-manual_reviews.sql`
- `/apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`

---

## Historial de Cambios

| Fecha | Version | Cambios |
|-------|---------|---------|
| 2026-01-20 | 2.0.0 | Agregada arquitectura dual de progreso, UI por estado, logica de transiciones por modulo |
| 2026-01-20 | 1.0.0 | Documento inicial con ciclo de vida completo |

---

*Documento actualizado como parte de SUBTASK-3.2 de TASK-2026-01-20-EXERCISES-VALIDATION*
