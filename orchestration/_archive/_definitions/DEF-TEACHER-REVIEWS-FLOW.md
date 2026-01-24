# DEF-TEACHER-REVIEWS-FLOW: Flujo de Evaluaciones Manuales

**Versión:** 1.0.0
**Fecha:** 2026-01-18
**Estado:** Aprobado
**Tipo:** Definición de Flujo

---

## 1. RESUMEN

Este documento define el flujo completo de evaluaciones manuales de ejercicios (Teacher Reviews) incluyendo la visualización de respuestas, calificación con rúbrica, y distribución de recompensas de gamificación.

---

## 2. ALCANCE

**Módulos afectados:**
- M3: Lectura Crítica (5 ejercicios)
- M4: Alfabetización Digital (4 ejercicios manuales + 1 auto)
- M5: Producción Creativa (3 ejercicios)

**Total:** 12 ejercicios que requieren evaluación manual

---

## 3. DIAGRAMA DE FLUJO

```
┌─────────────────────────────────────────────────────────────────┐
│                 ESTUDIANTE ENVÍA EJERCICIO                       │
│         ExerciseSubmissionService.submitExercise()               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │  exercise.requires_manual_grading?     │
         └────────────────────────────────────────┘
                    │ TRUE
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Crear ManualReview (status='pending')                           │
│  Notificar docente asignado                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOCENTE                                       │
│  1. Abre /teacher/reviews                                        │
│  2. Ve lista de pendientes                                       │
│  3. Selecciona un review                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              CARGAR DETALLE DEL REVIEW                           │
│  GET /api/v1/teacher/reviews/:id                                 │
│  ManualReviewService.findById() → enrichReview()                 │
│  Retorna: review + student + exercise + rubric + submission      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              VISUALIZAR RESPUESTAS                               │
│  ExerciseContentRenderer(exerciseType, answerData)               │
│  → Switch por tipo → Renderizador específico                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              EVALUAR CON RÚBRICA                                 │
│  RubricEvaluator(rubric, initialEvaluations)                     │
│  → Slider por cada criterio                                      │
│  → Feedback por criterio                                         │
│  → Feedback general                                              │
│  → Cálculo automático de score total                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │ GUARDAR BORRADOR │  │ CALIFICAR        │
         │ handleSaveProgress│  │ handleCompleteReview
         └──────────────────┘  └──────────────────┘
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────────────────────┐
         │ PUT /reviews/:id │  │ 1. PUT /reviews/:id (guardar)    │
         │ status=in_progress│  │ 2. POST /reviews/:id/complete   │
         └──────────────────┘  └──────────────────────────────────┘
                                        │
                                        ▼
                    ┌───────────────────────────────────────────┐
                    │         BACKEND: completeReview()          │
                    │ 1. review.status = 'completed'             │
                    │ 2. gradeSubmission(submissionId, score)    │
                    │ 3. claimRewards(submissionId)              │
                    │    → Calcular XP + ML Coins                │
                    │    → Detectar promoción de rango           │
                    │    → Detectar achievements                 │
                    │ 4. Notificar estudiante                    │
                    │ 5. Retornar { review, rewards }            │
                    └───────────────────────────────────────────┘
                                        │
                                        ▼
                    ┌───────────────────────────────────────────┐
                    │      FRONTEND: Mostrar Recompensas         │
                    │ - XP ganado                                │
                    │ - ML Coins ganadas                         │
                    │ - Promoción de rango (si aplica)           │
                    │ - Cerrar modal después de 5 segundos       │
                    └───────────────────────────────────────────┘
```

---

## 4. TIPOS DE EJERCICIO POR MÓDULO

### 4.1 Módulo 3: Lectura Crítica

| exercise_type | Nombre | Renderizador |
|---------------|--------|--------------|
| analisis_fuentes | Análisis de Fuentes | TextResponseRenderer |
| debate_digital | Debate Digital | TextResponseRenderer |
| tribunal_opiniones | Tribunal de Opiniones | TextResponseRenderer |
| matriz_perspectivas | Matriz de Perspectivas | TextResponseRenderer |
| podcast_argumentativo | Podcast Argumentativo | PodcastRenderer |

### 4.2 Módulo 4: Alfabetización Digital

| exercise_type | Nombre | Renderizador | Manual |
|---------------|--------|--------------|--------|
| verificador_fake_news | Verificador Fake News | MultimediaRenderer | ✅ |
| infografia_interactiva | Infografía Interactiva | MultimediaRenderer | ✅ |
| navegacion_hipertextual | Navegación Hipertextual | MultimediaRenderer | ✅ |
| analisis_memes | Análisis de Memes | MultimediaRenderer | ✅ |
| quiz_tiktok | Quiz TikTok | AutoGrading | ❌ |

### 4.3 Módulo 5: Producción Creativa

| exercise_type | Nombre | Renderizador |
|---------------|--------|--------------|
| diario_multimedia | Diario Multimedia | MultimediaRenderer |
| comic_digital | Cómic Digital | MultimediaRenderer |
| video_carta | Video-Carta | MultimediaRenderer |

---

## 5. ESTRUCTURA DE RÚBRICA

### 5.1 Criterio de Rúbrica

```typescript
interface RubricCriterion {
  id: string;           // Identificador único
  name: string;         // Nombre del criterio
  description: string;  // Descripción detallada
  maxPoints: number;    // Puntos máximos (típico: 25, 30, 50)
  weight?: number;      // Peso relativo (default: 1)
  levels?: Array<{      // Niveles de puntuación
    score: number;      // Puntuación del nivel
    label: string;      // Etiqueta (Excelente, Bueno, etc.)
    description?: string;
  }>;
}
```

### 5.2 Evaluación de Criterio

```typescript
interface RubricEvaluation {
  criterionId: string;  // ID del criterio evaluado
  score: number;        // Puntuación asignada (0 a maxPoints)
  feedback?: string;    // Comentarios del docente
}
```

### 5.3 Cálculo de Score Total

```typescript
function calculateTotalScore(rubric: RubricCriterion[], evaluations: RubricEvaluation[]): number {
  const totalPossible = rubric.reduce((sum, c) => sum + c.maxPoints * (c.weight || 1), 0);
  const totalEarned = evaluations.reduce((sum, e) => {
    const criterion = rubric.find(c => c.id === e.criterionId);
    if (!criterion) return sum;
    return sum + e.score * (criterion.weight || 1);
  }, 0);

  return Math.round((totalEarned / totalPossible) * 100);
}
```

---

## 6. FÓRMULAS DE GAMIFICACIÓN

### 6.1 Cálculo de XP

```
xpEarned = baseXpReward × scoreMultiplier × rankMultiplier + bonuses - penalties

Donde:
- baseXpReward = exercise.xp_reward (default: 100)
- scoreMultiplier = score / maxScore
- rankMultiplier = maya_ranks.xp_multiplier (1.00 - 1.25)
- bonuses:
  - perfectBonus: +50 XP (si score=100 y hints=0)
- penalties:
  - hintPenalty: -5 XP por hint usado
```

### 6.2 Cálculo de ML Coins

```
mlCoinsEarned = baseMlCoinsReward × scoreMultiplier + bonuses - spent

Donde:
- baseMlCoinsReward = exercise.ml_coins_reward (default: 20)
- scoreMultiplier = score / maxScore
- bonuses:
  - perfectBonus: +10 coins (si score=100 y hints=0)
- spent:
  - mlCoinsSpent: coins gastadas en comodines durante ejercicio
```

### 6.3 Promoción de Rango Maya

Cuando `user_stats.total_xp` supera el umbral del siguiente rango:
- Se actualiza `user_stats.current_rank`
- Se otorga `maya_ranks.ml_coins_bonus` (50-500 coins)
- Se activa nuevo multiplicador de XP

**Rangos:**
1. Ajaw (0 XP) - 1.00x
2. Nacom (1000 XP) - 1.02x
3. Halach Uinic (2500 XP) - 1.05x
4. Chilam (5000 XP) - 1.08x
5. Ah Kin (10000 XP) - 1.12x
6. Ah Cuch Cab (20000 XP) - 1.15x
7. K'uhul Ahau (35000 XP) - 1.20x
8. K'uk'ulkan (50000 XP) - 1.25x

---

## 7. ENDPOINTS API

### 7.1 Reviews

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /teacher/reviews/pending | Lista reviews pendientes |
| GET | /teacher/reviews/:id | Detalle de review |
| POST | /teacher/reviews/:id/start | Iniciar review |
| PUT | /teacher/reviews/:id | Guardar evaluación |
| POST | /teacher/reviews/:id/complete | Completar y distribuir rewards |
| POST | /teacher/reviews/:id/return | Devolver para revisión |

### 7.2 Formato de Respuesta (completeReview)

```json
{
  "review": {
    "id": "uuid",
    "status": "completed",
    "totalScore": 85,
    "completedAt": "2026-01-18T..."
  },
  "rewards": {
    "xp_earned": 102,
    "ml_coins_earned": 17,
    "rankUp": {
      "newRank": "Nacom",
      "previousRank": "Ajaw",
      "bonusMLCoins": 50,
      "newMultiplier": 1.02
    }
  }
}
```

---

## 8. COMPONENTES FRONTEND

### 8.1 Jerarquía

```
TeacherReviewPanelPage
├── useManualReviews() - Hook para lista
├── useManualReviewDetail() - Hook para detalle
├── ReviewList - Listado de cards
└── ReviewDetail
    ├── ExerciseContentRenderer - Visualización respuestas
    ├── RubricEvaluator - Evaluación con rúbrica
    └── Botones de acción
```

### 8.2 Estado del Componente ReviewDetail

```typescript
const [evaluations, setEvaluations] = useState<RubricEvaluation[]>([]);
const [generalFeedback, setGeneralFeedback] = useState('');
const [_totalScore, setTotalScore] = useState(0);
const [isValid, setIsValid] = useState(false);
const [assignedRewards, setAssignedRewards] = useState<ReviewRewards | null>(null);
```

---

## 9. INTEGRACIÓN CON ACHIEVEMENTS

Achievements detectados automáticamente al completar evaluación:

| Achievement | Condición | XP | Coins |
|-------------|-----------|-----|-------|
| first_module_exercise | Primer ejercicio de módulo | 50 | 25 |
| perfect_score | Score = 100 | 100 | 50 |
| content_analysis | 5+ análisis con score ≥ 80 | 150 | 75 |
| creative_producer | 3+ ejercicios M5 completados | 200 | 100 |

---

## 10. VALIDACIONES

### 10.1 Frontend (RubricEvaluator)

- Todos los criterios deben tener puntuación asignada
- Score debe estar en rango [0, maxPoints]
- No se permite calificar sin evaluar todos los criterios

### 10.2 Backend (ManualReviewService)

- Review debe existir
- Submission debe existir
- Score debe estar en rango [0, maxScore]
- No se pueden reclamar rewards dos veces

---

## 11. REFERENCIAS

- Componentes: `apps/frontend/src/apps/teacher/`
- Servicios: `apps/backend/src/modules/teacher/services/`
- Entidades: `apps/backend/src/modules/progress/entities/`
- Rúbricas: `apps/database/seeds/dev/educational_content/13-exercise_type_rubrics.sql`
- Gamificación: `apps/backend/src/modules/gamification/`

---

*Definición generada como parte de TASK-2026-01-18-011*
