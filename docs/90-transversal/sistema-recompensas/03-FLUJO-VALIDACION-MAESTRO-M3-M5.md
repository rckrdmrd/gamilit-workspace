# Flujo de Validación del Maestro - Módulos 3-5

**Versión:** 1.0
**Fecha:** 2026-01-07
**Estado:** ACTIVO

---

## Resumen Ejecutivo

Este documento describe el flujo completo de validación de ejercicios de los módulos 3-5 que requieren evaluación manual del maestro. A diferencia de los módulos 1-2 (auto-evaluables), los ejercicios de M3-M5 siguen un flujo de revisión donde:

1. El estudiante envía su respuesta
2. Recibe un mensaje de confirmación (sin recompensas)
3. El maestro evalúa desde el portal teacher
4. Se asignan recompensas basadas en la calificación
5. El estudiante recibe notificación con su evaluación

---

## Ejercicios Incluidos (13 total)

### Módulo 3: Lectura Crítica (5 ejercicios)

| # | Tipo | Nombre | Descripción |
|---|------|--------|-------------|
| 3.1 | `analisis_fuentes` | Análisis de Fuentes | Evaluar credibilidad usando método CRAAP |
| 3.2 | `debate_digital` | Debate Digital | Participar en debate argumentado |
| 3.3 | `matriz_perspectivas` | Matriz de Perspectivas | Analizar desde múltiples perspectivas |
| 3.4 | `podcast_argumentativo` | Podcast Argumentativo | Crear podcast de 2 minutos |
| 3.5 | `tribunal_opiniones` | Tribunal de Opiniones | Clasificar opiniones fundamentadas |

### Módulo 4: Lectura Digital (4 ejercicios + 1 excepción)

| # | Tipo | Nombre | Evaluación |
|---|------|--------|------------|
| 4.1 | `verificador_fake_news` | Verificador Fake News | **MANUAL** |
| 4.2 | `infografia_interactiva` | Infografía Interactiva | **MANUAL** |
| 4.3 | `quiz_tiktok` | Quiz TikTok | **AUTO** (excepción) |
| 4.4 | `navegacion_hipertextual` | Navegación Hipertextual | **MANUAL** |
| 4.5 | `analisis_memes` | Análisis de Memes | **MANUAL** |

**Nota sobre Quiz TikTok:** Es el único ejercicio de M4 con evaluación automática porque tiene preguntas con respuestas únicas verificables (`correctAnswers: [1, 1, 2]`).

### Módulo 5: Producción Creativa (3 ejercicios - Elegir 1)

| # | Tipo | Nombre | Descripción |
|---|------|--------|-------------|
| 5.A | `diario_multimedia` | Diario Multimedia | 5 entradas de diario |
| 5.B | `comic_digital` | Cómic Digital | 6 viñetas narrativas |
| 5.C | `video_carta` | Video-Carta | Video de 2-3 minutos |

---

## Diagrama del Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                     ESTUDIANTE                                  │
├─────────────────────────────────────────────────────────────────┤
│  1. Accede a ejercicio M3/M4/M5                                 │
│  2. Completa el ejercicio                                       │
│  3. Click "Enviar respuesta"                                    │
│     └─> POST /api/exercises/:id/submit                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND                                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Valida respuesta (estructura JSONB)                         │
│  2. Detecta: requires_manual_grading = true                     │
│  3. INSERT INTO exercise_submissions                            │
│       status = 'submitted'                                      │
│       is_correct = NULL                                         │
│       xp_earned = 0                                             │
│       ml_coins_earned = 0                                       │
│  4. Notifica al maestro (in-app + email opcional)               │
│  5. Retorna: { status: 'pending_review' }                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ESTUDIANTE VE MENSAJE                              │
├─────────────────────────────────────────────────────────────────┤
│  "Tu [ejercicio] ha sido enviado para revisión del maestro.    │
│   Recibirás tus recompensas cuando sea evaluado."               │
│                                                                 │
│  ✓ Mensaje tipo: info                                           │
│  ✓ No muestra XP ni ML Coins                                    │
│  ✓ No muestra score                                             │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ ⏳ ESPERA
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PORTAL TEACHER                                │
├─────────────────────────────────────────────────────────────────┤
│  1. Maestro recibe notificación                                 │
│  2. Accede a /teacher/reviews                                   │
│  3. Filtra por módulo (M3, M4, M5)                              │
│  4. Selecciona submission pendiente                             │
│  5. En ReviewDetail.tsx:                                        │
│     - Ve respuesta del estudiante                               │
│     - Evalúa con rúbrica (si aplica)                            │
│     - Asigna score (0-100)                                      │
│     - Escribe feedback                                          │
│  6. Click "Completar y Enviar"                                  │
│     └─> PUT /api/teacher/reviews/:id/complete                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND - GRADING                             │
├─────────────────────────────────────────────────────────────────┤
│  ManualReviewService.completeReview():                          │
│                                                                 │
│  1. UPDATE exercise_submissions                                 │
│       status = 'graded'                                         │
│       score = [score del maestro]                               │
│       is_correct = (score >= 60)                                │
│       feedback = [feedback del maestro]                         │
│                                                                 │
│  2. claimRewards(submissionId):                                 │
│       - Calcula XP: (score/100) * base_xp * multiplicadores     │
│       - Calcula ML Coins: base + bonuses                        │
│       - UPDATE submission SET xp_earned, ml_coins_earned        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE - TRIGGERS                           │
├─────────────────────────────────────────────────────────────────┤
│  TRIGGER: trg_update_user_stats_on_submission                   │
│    WHEN (status IN ('graded','reviewed') AND is_correct = true) │
│                                                                 │
│  UPDATE gamification_system.user_stats                          │
│    total_xp += submission.xp_earned                             │
│    ml_coins += submission.ml_coins_earned                       │
│    exercises_completed += 1                                     │
│                                                                 │
│  CASCADA: trg_update_missions_on_earn_xp                        │
│    - Actualiza misiones con objetivo 'earn_xp'                  │
│    - Actualiza misiones con objetivo 'complete_exercises'       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NOTIFICACIÓN AL ESTUDIANTE                    │
├─────────────────────────────────────────────────────────────────┤
│  NotificationService.create({                                   │
│    userId: submission.user_id,                                  │
│    type: 'exercise_feedback',                                   │
│    title: 'Tu ejercicio ha sido calificado',                    │
│    message: 'Calificación: 85/100. Ganaste 200 XP y 50 ML...'   │
│    data: {                                                      │
│      submissionId,                                              │
│      score,                                                     │
│      xpEarned,                                                  │
│      mlCoinsEarned,                                             │
│      rankUp: true/false                                         │
│    }                                                            │
│  })                                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ESTUDIANTE VE RESULTADOS                           │
├─────────────────────────────────────────────────────────────────┤
│  - Dashboard actualizado con nuevo XP y ML Coins                │
│  - Ejercicio marcado como "Completado" con score                │
│  - Posible ascenso de rango Maya                                │
│  - Progreso del módulo actualizado                              │
│  - Notificación en /student/notifications                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estados de la Submission

| Estado | Descripción | Quién lo asigna |
|--------|-------------|-----------------|
| `draft` | Guardado sin enviar | Estudiante |
| `submitted` | Enviado, en cola | Sistema |
| `pending_review` | Pendiente de revisión | Sistema |
| `graded` | Calificado por maestro | Maestro |
| `reviewed` | Revisión completada | Maestro |

### Transiciones Permitidas

```
draft ──────────────> submitted
                          │
                          ▼
                   pending_review
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
           graded ◄─────────── returned (opcional)
              │
              ▼
          reviewed (opcional)
```

---

## Cálculo de Recompensas

### XP (Experience Points)

```typescript
// Fórmula real de ExerciseSubmissionService.claimRewards()
const base_xp = exercise.xp_reward || 100;    // Valor configurado del ejercicio
const score_multiplier = score / max_score;   // Porcentaje de acierto
const rank_multiplier = getRankXpMultiplier(userId); // Multiplicador del rango Maya

let xp_earned = Math.floor(base_xp * score_multiplier * rank_multiplier);

// Bonus por perfect score (score=100 y sin hints)
if (score === max_score && !hint_used) {
  xp_earned += 50;  // Bonus fijo de 50 XP
}

// Penalización por hints usados
xp_earned = Math.max(0, xp_earned - (hints_count * 5));
```

### ML Coins

```typescript
const base_coins = exercise.ml_coins_reward || 20; // Valor configurado del ejercicio
let coins_earned = Math.floor(base_coins * (score / max_score));

// Bonus por perfect score sin hints
if (score === max_score && !hint_used) {
  coins_earned += 10;  // Bonus fijo de 10 ML Coins
}

// Restar coins gastados en comodines
coins_earned = Math.max(0, coins_earned - ml_coins_spent);
```

---

## Componentes de Código Clave

### Frontend - Portal Student

| Componente | Ruta | Maneja pending_review |
|------------|------|----------------------|
| `DebateDigitalExercise.tsx` | module3/DebateDigital/ | ✅ |
| `MatrizPerspectivasExercise.tsx` | module3/MatrizPerspectivas/ | ✅ |
| `PodcastArgumentativoExercise.tsx` | module3/PodcastArgumentativo/ | ✅ |
| `TribunalOpinionesExercise.tsx` | module3/TribunalOpiniones/ | ✅ |
| `AnalisisFuentesExercise.tsx` | module3/AnalisisFuentes/ | ✅ (CORR-AF-001) |
| `VerificadorFakeNewsExercise.tsx` | module4/VerificadorFakeNews/ | ✅ |
| `InfografiaInteractivaExercise.tsx` | module4/InfografiaInteractiva/ | ✅ |
| `NavegacionHipertextualExercise.tsx` | module4/NavegacionHipertextual/ | ✅ |
| `AnalisisMemesExercise.tsx` | module4/AnalisisMemes/ | ✅ |
| `DiarioMultimediaExercise.tsx` | module5/DiarioMultimedia/ | ✅ |
| `ComicDigitalExercise.tsx` | module5/ComicDigital/ | ✅ |
| `VideoCartaExercise.tsx` | module5/VideoCarta/ | ✅ |

### Frontend - Portal Teacher

| Componente | Ruta | Propósito |
|------------|------|-----------|
| `TeacherReviewPanelPage.tsx` | /teacher/reviews | Panel principal |
| `TeacherExerciseResponsesPage.tsx` | /teacher/responses | Tabla de respuestas |
| `ReviewList.tsx` | components/review-panel/ | Lista de pendientes |
| `ReviewDetail.tsx` | components/review-panel/ | Detalle + calificación |

### Backend - Services

| Servicio | Métodos Clave |
|----------|---------------|
| `ExerciseSubmissionService` | submitExercise(), gradeSubmission(), claimRewards() |
| `ManualReviewService` | completeReview(), returnForRevision() |
| `ExerciseRewardsService` | calculateRewards(), distributeRewards() |
| `NotificationService` | notifyTeacher(), notifyStudent() |

### Database - Triggers

| Trigger | Tabla | Condición |
|---------|-------|-----------|
| `trg_update_user_stats_on_submission` | exercise_submissions | status='graded' AND is_correct=true |
| `trg_update_module_progress_on_submission` | exercise_submissions | status='graded' AND score>=60 |
| `trg_update_missions_on_submission` | exercise_submissions | status='graded' AND is_correct=true |

---

## Constantes

### Tipos de Ejercicio con Revisión Manual

```typescript
// apps/frontend/src/apps/teacher/constants/manualReviewExercises.ts
export const MANUAL_REVIEW_EXERCISE_TYPES = [
  // Módulo 3
  'tribunal_opiniones',
  'debate_digital',
  'analisis_fuentes',
  'podcast_argumentativo',
  'matriz_perspectivas',
  // Módulo 4 (excepto quiz_tiktok)
  'verificador_fake_news',
  'infografia_interactiva',
  'navegacion_hipertextual',
  'analisis_memes',
  // Módulo 5
  'diario_multimedia',
  'comic_digital',
  'video_carta',
] as const;
```

---

## Referencias

- `docs/90-transversal/sistema-recompensas/01-ARQUITECTURA-SISTEMA.md` - Arquitectura
- `docs/90-transversal/sistema-recompensas/02-FLUJO-END-TO-END.md` - Flujo general
- `docs/99-finiquito/Manual_Portal_Maestros_ACTUALIZADO.md` - Manual usuario
- `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/EPICA-EAI-007.md` - Épica M4-M5

---

*Documento creado como parte de la integración M3-M5 con validación del maestro*
