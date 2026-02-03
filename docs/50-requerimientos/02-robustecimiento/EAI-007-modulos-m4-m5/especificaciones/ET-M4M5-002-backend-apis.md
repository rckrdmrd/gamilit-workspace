---
id: ET-M4M5-002
title: Backend APIs - Modulos M4-M5
rf: [RF-M4-001, RF-M5-001]
epic: EAI-007
status: Done
created: 2025-12-05
updated: 2026-01-20
---

# ET-M4M5-002: Backend APIs

## Endpoints

### Envio de Respuestas (Student Portal)

```
POST /api/v1/educational/exercises/{exerciseId}/submit
```

**Request:**
```json
{
  "answers": { /* DTO segun tipo de ejercicio */ },
  "startedAt": 1705750800000,
  "hintsUsed": 0,
  "powerupsUsed": []
}
```

**Response (Manual Review):**
```json
{
  "submissionId": "uuid",
  "status": "pending_review",
  "requiresManualReview": true,
  "message": "Tu ejercicio ha sido enviado para revision del maestro"
}
```

**Response (Auto-gradable - quiz_tiktok):**
```json
{
  "submissionId": "uuid",
  "status": "graded",
  "score": 85,
  "maxScore": 100,
  "rewards": {
    "xpEarned": 100,
    "mlCoinsEarned": 20
  }
}
```

### Teacher Reviews API

**Base URL:** `/api/v1/teacher/reviews`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/pending` | Reviews pendientes (paginado) |
| GET | `/pending/module/:moduleOrder` | Por modulo |
| GET | `/:id` | Review especifico con datos enriquecidos |
| POST | `/:id/start` | Marcar como in_progress |
| PUT | `/:id` | Guardar borrador (rubric_scores, feedback) |
| POST | `/:id/complete` | Completar y asignar recompensas |
| POST | `/:id/return` | Devolver para revision |

### Completar Review

```
POST /api/v1/teacher/reviews/{reviewId}/complete
```

**Request:**
```json
{
  "rubric_scores": {
    "creativity": 25,
    "accuracy": 30,
    "presentation": 20
  },
  "total_score": 75,
  "general_feedback": "Buen trabajo...",
  "detailed_feedback": {
    "creativity": "Excelente uso de colores"
  }
}
```

**Response:**
```json
{
  "review": { /* ManualReview actualizado */ },
  "rewards": {
    "xpEarned": 112,
    "mlCoinsEarned": 30,
    "rankUp": {
      "newRank": "Nacom",
      "previousRank": "Ajaw",
      "bonusMLCoins": 100
    }
  }
}
```

## DTOs

### Module4 DTOs (por tipo de ejercicio)

**Ubicacion:** `apps/backend/src/modules/educational/dto/module4/`

```typescript
// verificador-fake-news-answer.dto.ts
interface VerificadorFakeNewsAnswerDto {
  verifications: {
    claim_id: string;
    is_fake: boolean;
    evidence: string;  // min 10 chars
  }[];
}

// infografia-interactiva-answer.dto.ts
interface InfografiaInteractivaAnswerDto {
  placements: {
    element_id: string;
    zone_id: string;
    x: number;
    y: number;
  }[];
}

// quiz-tiktok-answer.dto.ts (AUTO-GRADABLE)
interface QuizTiktokAnswerDto {
  answers: number[];  // indices de respuestas seleccionadas
}

// navegacion-hipertextual-answer.dto.ts
interface NavegacionHipertextualAnswerDto {
  responses: {
    question_id: string;
    answer: string;
  }[];
  navigation_path: string[];  // paginas visitadas
}

// analisis-memes-answer.dto.ts
interface AnalisisMemeAnswerDto {
  annotations: {
    x: number;
    y: number;
    text: string;
    category?: string;
  }[];
  analysis: {
    message: string;
  };
}
```

### Module5 DTOs (por tipo de ejercicio)

**Ubicacion:** `apps/backend/src/modules/educational/dto/module5/`

```typescript
// diario-multimedia-answer.dto.ts
interface DiarioMultimediaAnswerDto {
  entries: {
    id: string;
    date: string;
    title?: string;
    content: string;  // min 50 chars
    mood?: string;
    wordCount: number;
    multimedia?: MediaAttachment[];
  }[];  // min 1, max 5 entries
}

// comic-digital-answer.dto.ts
interface ComicDigitalAnswerDto {
  panels: {
    id: string;
    order: number;
    imageUrl: string;
    dialogue: string;
    description?: string;
  }[];  // exactly 6 panels
}

// video-carta-answer.dto.ts
interface VideoCartaAnswerDto {
  video_url: string;
  sections: {
    title: string;
    duration_seconds: number;
  }[];  // 4 sections: intro, mensaje, reflexion, cierre
}
```

### GradeResponseDto

```typescript
interface GradeResponseDto {
  score: number; // 0-100
  feedback: string;
  rubricScores: Record<string, number>;
}
```

## Servicios

### ExerciseSubmissionService

**Ubicacion:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

Metodos:
- `submitExercise(dto): Promise<ExerciseSubmissionResponse>`
- `gradeSubmission(submissionId, score): Promise<void>`
- `claimRewards(submissionId): Promise<RewardsClaimedResult>`

### ExerciseGradingService

**Ubicacion:** `apps/backend/src/modules/progress/services/grading/exercise-grading.service.ts`

Metodos:
- `gradeQuizTiktok(answers, exercise): Promise<GradingResult>` (auto-gradable)
- `validateAnswer(exerciseType, answers): Promise<boolean>`

### ManualReviewService

**Ubicacion:** `apps/backend/src/modules/teacher/services/manual-review.service.ts`

Metodos:
- `getPendingReviews(filters): Promise<PaginatedReviewsResult>`
- `startReview(reviewId): Promise<ManualReview>`
- `updateReview(reviewId, dto): Promise<ManualReview>`
- `completeReview(reviewId): Promise<CompleteReviewResult>`
- `returnForRevision(reviewId, reason): Promise<ManualReview>`

### MediaStorageService

**Ubicacion:** `apps/backend/src/modules/educational/services/media-storage.service.ts`

Metodos:
- `uploadFile(file, exerciseId, submissionId): Promise<MediaAttachment>`
- `validateFile(file, type): boolean`
- `getFileUrl(filePath): string`

## Trazabilidad

- **Controllers:**
  - `apps/backend/src/modules/teacher/controllers/manual-review.controller.ts`
  - `apps/backend/src/modules/progress/controllers/exercise-submission.controller.ts`
- **Services:**
  - `apps/backend/src/modules/progress/services/`
  - `apps/backend/src/modules/teacher/services/`
- **DTOs M4:** `apps/backend/src/modules/educational/dto/module4/`
- **DTOs M5:** `apps/backend/src/modules/educational/dto/module5/`
- **Entity:** `apps/backend/src/modules/progress/entities/manual-review.entity.ts`
- **Seeds:**
  - `apps/database/seeds/dev/05-exercises-module4.sql`
  - `apps/database/seeds/dev/06-exercises-module5.sql`

---

**Estado:** Done
**Actualizado:** 2026-01-20 (TASK-2026-01-20-001: Sincronizar con implementacion real)
