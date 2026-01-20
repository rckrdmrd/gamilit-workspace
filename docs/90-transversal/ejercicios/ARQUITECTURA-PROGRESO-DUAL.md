# Arquitectura de Progreso Dual en GAMILIT

**Autor:** @PERFIL_ARCHITECT
**Fecha:** 2026-01-20
**Version:** 1.0.0
**Estado:** Documentado

---

## 1. Introduccion

GAMILIT implementa una **arquitectura dual de progreso** para manejar dos tipos fundamentales de ejercicios:

| Tipo | Modulos | Evaluacion | Actualizacion de Progreso |
|------|---------|------------|---------------------------|
| **Inmediato** | M1-M2 | Automatica (auto-grading) | Instantanea al enviar |
| **Diferido** | M3-M5 | Manual (docente) | Al calificar (rewards) + Al enviar (visual) |

Esta arquitectura responde a la necesidad pedagogica de combinar ejercicios de practica (autocorregibles) con ejercicios creativos y de produccion que requieren evaluacion humana.

---

## 2. Modelo Inmediato (M1-M2)

### 2.1 Descripcion

Los modulos 1 y 2 contienen ejercicios **autocorregibles** donde el sistema puede evaluar automaticamente las respuestas del estudiante. Ejemplos:

- Completar espacios en blanco
- Ordenar eventos cronologicamente
- Seleccion multiple
- Arrastrar y soltar

### 2.2 Flujo de Datos

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Estudiante │      │   Backend   │      │  Auto-Grade │      │  Dashboard  │
│   Submit    │──────▶│   Recibe    │──────▶│  Evalua     │──────▶│  Refleja    │
│             │      │             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
      │                     │                    │                    │
      │                     ▼                    ▼                    ▼
      │              ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
      │              │ exercise_   │      │ Score       │      │ XP + Coins  │
      │              │ submissions │      │ Calculado   │      │ Mostrados   │
      │              │ status:     │      │ is_correct: │      │ Ranking     │
      │              │ 'graded'    │      │ true/false  │      │ Actualizado │
      └──────────────┴─────────────┴──────┴─────────────┴──────┴─────────────┘
                              INSTANTANEO (~500ms)
```

### 2.3 Tablas Involucradas

**Tabla principal:** `progress_tracking.exercise_submissions`

```sql
-- Estados posibles para M1-M2
status IN ('draft', 'submitted', 'graded', 'reviewed')

-- Flujo tipico: draft → submitted → graded (automatico)
```

**Tabla de progreso:** `progress_tracking.module_progress`

```sql
-- Campos actualizados inmediatamente
completed_exercises      -- Incrementa al aprobar
progress_percentage      -- Recalcula (completed/total)*100
total_xp_earned         -- Suma XP del ejercicio
total_ml_coins_earned   -- Suma ML Coins
status                  -- not_started → in_progress → completed
```

### 2.4 Servicios Backend

**Archivo:** `/apps/backend/src/modules/progress/services/exercise-submission.service.ts`

```typescript
// Metodo principal: submitExercise()
async submitExercise(userId, exerciseId, answers) {
  // 1. Validar respuestas
  await ExerciseAnswerValidator.validate(exercise.exercise_type, answers);

  // 2. Crear submission
  submission = await this.create(submissionData);

  // 3. Auto-grade (M1-M2)
  if (!exercise.requires_manual_grading) {
    submission = await this.gradeSubmission(submission.id);

    // 4. Distribuir rewards si correcto
    if (submission.is_correct && submission.status === 'graded') {
      const rewards = await this.claimRewards(submission.id);
    }
  }

  return submission;
}
```

### 2.5 Triggers de Base de Datos

| Trigger | Tabla | Evento | Funcion |
|---------|-------|--------|---------|
| `trg_update_module_progress_on_exercise` | exercise_attempts | INSERT | Actualiza module_progress cuando is_correct=true |
| `trg_update_user_stats_on_exercise` | exercise_attempts | INSERT | Actualiza XP/ML Coins en user_stats |
| `trg_update_missions_on_exercise` | exercise_attempts | INSERT | Actualiza progreso de misiones |

### 2.6 Impacto en UX

El estudiante experimenta:

1. **Feedback instantaneo:** "Correcto!" o "Intentalo de nuevo"
2. **Animacion de rewards:** +50 XP, +10 ML Coins
3. **Barra de progreso:** Actualiza inmediatamente
4. **Posible rankUp:** Notificacion si sube de rango

---

## 3. Modelo Diferido (M3-M5)

### 3.1 Descripcion

Los modulos 3, 4 y 5 contienen ejercicios **creativos y de produccion** que requieren evaluacion humana. Ejemplos:

- **M3:** Rueda de Inferencias, Detective Textual
- **M4:** Diario Multimedia, Comic Digital
- **M5:** Video Carta, Podcast Argumentativo

### 3.2 Flujo de Datos

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Estudiante │      │   Backend   │      │   Teacher   │
│   Submit    │──────▶│   Guarda    │      │   Portal    │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
      │                     │                    │
      ▼                     ▼                    │
┌─────────────┐      ┌─────────────┐            │
│  Dashboard  │      │ manual_     │◀───────────┘
│  "Enviado"  │      │ reviews     │     Docente
│  "Pendiente"│      │ pending     │     Evalua
└─────────────┘      └─────────────┘
      │                     │
      │                     ▼
      │              ┌─────────────┐      ┌─────────────┐
      │              │   Backend   │      │  Dashboard  │
      │              │ claimRewards│──────▶│  Refleja    │
      │              │             │      │  Rewards    │
      │              └─────────────┘      └─────────────┘
      │                     │
      └─────────────────────┴─── DIFERIDO (horas/dias) ───
```

### 3.3 Estados del Submission

```
┌──────────┐     ┌───────────┐     ┌───────────────┐     ┌───────────┐     ┌──────────┐
│  draft   │────▶│ submitted │────▶│ pending_review│────▶│  graded   │────▶│ reviewed │
│          │     │           │     │               │     │           │     │          │
└──────────┘     └───────────┘     └───────────────┘     └───────────┘     └──────────┘
     │                 │                   │                   │                │
     │            Estudiante          ManualReview         Docente         Feedback
     │             envia               creado auto        califica         adicional
     │                                                                     (opcional)
```

### 3.4 Tablas Involucradas

**Tabla de submissions:** `progress_tracking.exercise_submissions`

```sql
-- Estados para M3-M5
status IN ('draft', 'submitted', 'pending_review', 'graded', 'reviewed')

-- Flujo tipico: draft → submitted → pending_review → graded
```

**Tabla de reviews:** `progress_tracking.manual_reviews`

```sql
CREATE TABLE progress_tracking.manual_reviews (
    id UUID PRIMARY KEY,
    submission_id UUID REFERENCES exercise_submissions(id),
    reviewer_id UUID REFERENCES profiles(id),
    rubric_scores JSONB,        -- {"creatividad": 25, "precision": 30}
    total_score INTEGER,        -- 0-100
    general_feedback TEXT,
    detailed_feedback JSONB,
    status VARCHAR(20),         -- pending, in_progress, completed, returned
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);
```

**Tabla de progreso:** `progress_tracking.module_progress`

```sql
-- Campos especificos para M3-M5
submitted_exercises          -- Cuenta al ENVIAR (progreso visual)
submitted_progress_percentage -- % basado en envios
graded_exercises            -- Cuenta al CALIFICAR
graded_progress_percentage  -- % basado en calificaciones
```

### 3.5 Servicios Backend

**Archivo:** `/apps/backend/src/modules/progress/services/exercise-submission.service.ts`

```typescript
// Para ejercicios M3-M5
async submitExercise(userId, exerciseId, answers) {
  // ...validaciones...

  if (exercise.requires_manual_grading) {
    // NO auto-grade
    // Actualizar progreso visual (submitted_progress)
    await this.updateModuleProgressOnSubmission(profileId, exerciseId);

    // Notificar al docente
    await this.notifyTeacherOfSubmission(submission, exercise, profileId);

    return Object.assign(submission, {
      requiresManualReview: true,
      message: 'Tu respuesta ha sido enviada para revision del maestro.'
    });
  }
}
```

**Archivo:** `/apps/backend/src/modules/teacher/services/manual-review.service.ts`

```typescript
// Cuando el docente completa la evaluacion
async completeReview(reviewId: string) {
  // 1. Validar que hay evaluacion
  if (review.totalScore === null || !review.rubricScores) {
    throw new BadRequestException('No se puede completar sin calificacion');
  }

  // 2. Actualizar estado
  review.status = 'completed';
  review.completedAt = new Date();

  // 3. Calificar submission y distribuir rewards
  await this.submissionService.gradeSubmission(review.submissionId, {
    final_score: review.totalScore,
    grader_id: review.reviewerId,
    feedback: review.generalFeedback
  });

  // 4. Reclamar rewards (XP, ML Coins)
  const claimResult = await this.submissionService.claimRewards(review.submissionId);

  // 5. Notificar al estudiante
  await this.notificationService.create({
    userId: review.submission.user_id,
    type: 'exercise_feedback',
    title: 'Tu ejercicio ha sido calificado',
    message: `Calificacion: ${review.totalScore}/100. Ganaste ${claimResult.xp_earned} XP!`
  });

  return { review, rewards: claimResult };
}
```

### 3.6 Triggers de Base de Datos

| Trigger | Tabla | Evento | Funcion |
|---------|-------|--------|---------|
| `trg_update_submitted_progress_on_submission` | exercise_submissions | INSERT | Actualiza submitted_progress_percentage |
| `trg_create_manual_review_on_submission` | exercise_submissions | INSERT | Crea ManualReview automaticamente |
| `trg_update_module_progress_on_submission` | exercise_submissions | UPDATE | Actualiza completed_exercises cuando status='graded' AND score>=60 |
| `trg_update_user_stats_on_submission` | exercise_submissions | UPDATE | Actualiza XP/ML cuando se califica |

### 3.7 Impacto en UX

**Al ENVIAR (inmediato):**

1. Mensaje: "Tu trabajo ha sido enviado para revision"
2. Barra de progreso: Actualiza `submitted_progress_percentage`
3. Estado: "Pendiente de evaluacion"
4. NO hay rewards todavia

**Al ser CALIFICADO (diferido):**

1. Notificacion push: "Tu ejercicio fue calificado"
2. Email (si habilitado): Detalle de calificacion
3. Dashboard: Muestra score y feedback
4. Animacion de rewards: +XP, +ML Coins
5. Posible rankUp si corresponde

---

## 4. Tablas y Servicios Completos

### 4.1 Diagrama de Tablas

```
┌─────────────────────────────────────────────────────────────────────┐
│                    progress_tracking SCHEMA                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────┐        ┌─────────────────────┐             │
│  │  module_progress    │        │ exercise_submissions│             │
│  ├─────────────────────┤        ├─────────────────────┤             │
│  │ user_id            │◀───────│ user_id            │             │
│  │ module_id          │        │ exercise_id        │             │
│  │ status             │        │ answer_data        │             │
│  │ progress_percentage│        │ is_correct         │             │
│  │ completed_exercises│        │ score              │             │
│  │ submitted_exercises│        │ status             │             │
│  │ graded_exercises   │        │ xp_earned          │             │
│  │ total_xp_earned    │        │ ml_coins_earned    │             │
│  │ total_ml_coins_    │        └─────────┬──────────┘             │
│  │   earned           │                  │                         │
│  └─────────────────────┘                  │ 1:1                     │
│                                           ▼                         │
│                              ┌─────────────────────┐                │
│                              │   manual_reviews    │                │
│                              ├─────────────────────┤                │
│                              │ submission_id       │                │
│                              │ reviewer_id         │                │
│                              │ rubric_scores       │                │
│                              │ total_score         │                │
│                              │ status              │                │
│                              │ general_feedback    │                │
│                              └─────────────────────┘                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Mapa de Servicios

```
Backend Services
├── progress/
│   ├── module-progress.service.ts      # Progreso por modulo
│   └── exercise-submission.service.ts  # Submissions + Auto-grade
│
├── teacher/
│   ├── manual-review.service.ts        # Evaluacion manual
│   └── student-progress.service.ts     # Vista docente
│
└── gamification/
    ├── user-stats.service.ts           # XP, rangos
    └── ml-coins.service.ts             # Moneda virtual
```

---

## 5. Impacto en UX Detallado

### 5.1 Dashboard del Estudiante

**Componente:** `DashboardPage.tsx`

El dashboard obtiene datos de:

```typescript
// Obtener progreso por modulo
const progressData = await progressApi.getUserProgress(user.id);

// progressData incluye:
// - progress_percentage: % basado en ejercicios COMPLETADOS (M1-M2) o ENVIADOS (M3-M5)
// - submitted_progress_percentage: % de enviados (M3-M5)
// - graded_progress_percentage: % de calificados (M3-M5)
```

### 5.2 Comparativa de Experiencia

| Aspecto | M1-M2 (Inmediato) | M3-M5 (Diferido) |
|---------|-------------------|------------------|
| Feedback | Instantaneo | Horas/dias despues |
| Mensaje al enviar | "Correcto!" | "Enviado para revision" |
| Barra de progreso | Actualiza al completar | Actualiza al enviar |
| Rewards (XP/Coins) | Instantaneos | Al calificar docente |
| Notificaciones | Animacion en pantalla | Push + Email |
| Reintentos | Ilimitados | Solo si devuelto |

### 5.3 Estados Visuales en UI

**M1-M2:**
```
[========>        ] 45% completado
  Ultimo: Ejercicio 1.3 - Completar Espacios
  +50 XP, +10 ML Coins
```

**M3-M5 (antes de calificar):**
```
[========>        ] 45% enviado (pendiente evaluacion)
  Ultimo: Ejercicio 3.2 - Rueda de Inferencias
  Esperando revision del maestro...
```

**M3-M5 (despues de calificar):**
```
[========>        ] 45% completado
  Ultimo: Ejercicio 3.2 - Rueda de Inferencias (85/100)
  +85 XP, +17 ML Coins
```

---

## 6. Propuestas de Mejora para GAP-EX-002

### 6.1 Problema Identificado

**GAP-EX-002:** El estudiante no ve reconocimiento inmediato al enviar ejercicios M3-M5. Solo ve "Enviado para revision" sin gratificacion.

### 6.2 Propuesta 1: Progreso Parcial Inmediato

Asignar un porcentaje de XP/ML Coins al enviar, y el resto al calificar:

```
Al ENVIAR:
  - 30% del XP base (ej: 30 XP de 100)
  - Mensaje: "Ganaste 30 XP por enviar tu trabajo!"

Al CALIFICAR (score >= 60):
  - 70% restante ajustado por score
  - ej: score=85 → 70 * 0.85 = 59.5 XP adicionales
  - Total: 30 + 59.5 = 89.5 XP
```

**Implementacion:**

```typescript
// En submitExercise() para M3-M5
const SUBMISSION_XP_RATIO = 0.30;
const submissionXp = Math.floor(exercise.xp_reward * SUBMISSION_XP_RATIO);
await this.userStatsService.addXp(profileId, submissionXp);
```

### 6.3 Propuesta 2: Badge de "Trabajo Entregado"

Otorgar un badge visual temporal que se convierte en badge real al calificar:

```
Al ENVIAR:
  Badge: "En Evaluacion" (gris, animado)

Al CALIFICAR:
  Badge: "Aprobado" (dorado) o "Mejorar" (bronce)
```

### 6.4 Propuesta 3: Feedback Inmediato del Sistema

Antes de la evaluacion del docente, el sistema puede dar feedback automatico:

```
Al ENVIAR:
  - Verificar longitud minima: "Tu diario tiene 180 palabras - Excelente!"
  - Verificar multimedia: "Incluiste 3 imagenes - Muy bien!"
  - Puntaje preliminar: "Estimado: 70-85/100 (pendiente revision)"
```

### 6.5 Propuesta 4: Gamificacion del Tiempo de Espera

Convertir la espera en parte de la experiencia:

```
Al ENVIAR:
  - Iniciar "Mision de Paciencia": "Espera tu calificacion"
  - Si docente califica en <24h: +10 XP bonus para estudiante
  - Mostrar contador: "Tu maestro revisara pronto..."
```

### 6.6 Recomendacion

Se recomienda implementar **Propuesta 1 + Propuesta 3** como solucion inicial:

1. **Progreso Parcial (30%):** Gratificacion inmediata tangible
2. **Feedback del Sistema:** Validacion instantanea de cumplimiento basico
3. **Bajo riesgo:** No compromete la evaluacion humana
4. **Alta retencion:** El estudiante ve progreso real al enviar

---

## 7. Diagrama de Arquitectura Completa

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           GAMILIT PROGRESS ARCHITECTURE                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   FRONTEND                    BACKEND                      DATABASE           │
│   ─────────                   ───────                      ────────           │
│                                                                               │
│   ┌─────────────┐            ┌─────────────┐              ┌─────────────┐    │
│   │  Student    │            │ Exercise    │              │ exercise_   │    │
│   │  Portal     │───Submit──▶│ Submission  │───INSERT────▶│ submissions │    │
│   │             │            │ Service     │              │             │    │
│   └─────────────┘            └──────┬──────┘              └──────┬──────┘    │
│         ▲                          │                            │            │
│         │                          │                            ▼            │
│         │                    ┌─────▼─────┐              ┌─────────────┐      │
│         │                    │ requires_ │              │ TRIGGERS:   │      │
│         │                    │ manual_   │              │ - submitted │      │
│         │                    │ grading?  │              │   _progress │      │
│         │                    └─────┬─────┘              │ - create_   │      │
│         │                          │                    │   manual_   │      │
│         │               ┌─────NO───┴───YES─────┐        │   review    │      │
│         │               │                      │        └─────────────┘      │
│         │               ▼                      ▼                             │
│         │        ┌─────────────┐       ┌─────────────┐                       │
│         │        │ Auto-Grade  │       │ Manual      │                       │
│         │        │ + Rewards   │       │ Review      │                       │
│         │        │ IMMEDIATE   │       │ DEFERRED    │                       │
│         │        └──────┬──────┘       └──────┬──────┘                       │
│         │               │                     │                              │
│         │               │              ┌──────▼──────┐                       │
│         │               │              │   Teacher   │                       │
│         │               │              │   Portal    │                       │
│         │               │              └──────┬──────┘                       │
│         │               │                     │ Evaluate                     │
│         │               │              ┌──────▼──────┐                       │
│         │               │              │ Manual      │                       │
│         │               │              │ Review Svc  │                       │
│         │               │              └──────┬──────┘                       │
│         │               │                     │                              │
│         │               │              ┌──────▼──────┐                       │
│         │               │              │ claimRewards│                       │
│         │               │              │ + Notify    │                       │
│         │               │              └──────┬──────┘                       │
│         │               │                     │                              │
│         │               └──────────┬──────────┘                              │
│         │                          │                                         │
│         │                   ┌──────▼──────┐              ┌─────────────┐     │
│         │                   │ Update      │              │ module_     │     │
│         │                   │ Module      │──UPDATE─────▶│ progress    │     │
│         │                   │ Progress    │              │             │     │
│         │                   └──────┬──────┘              └─────────────┘     │
│         │                          │                                         │
│         │                   ┌──────▼──────┐              ┌─────────────┐     │
│         │                   │ Update      │              │ user_stats  │     │
│         │                   │ User Stats  │──UPDATE─────▶│ (XP, Coins) │     │
│         │                   └──────┬──────┘              └─────────────┘     │
│         │                          │                                         │
│         └──────────────────────────┘                                         │
│                            Dashboard Updated                                  │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Referencias

### 8.1 Archivos de Codigo

| Archivo | Ubicacion |
|---------|-----------|
| ExerciseSubmissionService | `/apps/backend/src/modules/progress/services/exercise-submission.service.ts` |
| ModuleProgressService | `/apps/backend/src/modules/progress/services/module-progress.service.ts` |
| ManualReviewService | `/apps/backend/src/modules/teacher/services/manual-review.service.ts` |
| ModuleProgress Entity | `/apps/backend/src/modules/progress/entities/module-progress.entity.ts` |

### 8.2 Archivos DDL

| Archivo | Ubicacion |
|---------|-----------|
| exercise_submissions | `/apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql` |
| manual_reviews | `/apps/database/ddl/schemas/progress_tracking/tables/06-manual_reviews.sql` |
| module_progress | `/apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql` |
| Trigger submitted_progress | `/apps/database/ddl/schemas/progress_tracking/triggers/32-trg_update_submitted_progress.sql` |
| Trigger graded_progress | `/apps/database/ddl/schemas/progress_tracking/triggers/27-trg_update_module_progress_on_submission.sql` |

### 8.3 Documentacion Relacionada

- GAP-EX-002: Gap Analysis de Ejercicios
- FASE 3: Validacion de Modelo de Datos
- EPIC 10.3: Module Progress Tracking

---

**Ultima actualizacion:** 2026-01-20
**Autor:** @PERFIL_ARCHITECT
**Revision:** Pendiente
