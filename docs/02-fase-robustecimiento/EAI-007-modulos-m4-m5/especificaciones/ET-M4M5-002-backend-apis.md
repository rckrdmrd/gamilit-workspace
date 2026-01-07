---
id: ET-M4M5-002
title: Backend APIs - Modulos M4-M5
rf: [RF-M4-001, RF-M5-001]
epic: EAI-007
status: Done
created: 2025-12-05
updated: 2026-01-04
---

# ET-M4M5-002: Backend APIs

## Endpoints

### Envio de Respuestas

```
POST /api/educational/exercises/{exerciseId}/submit
```

**Request:**
```json
{
  "response_data": {
    "content": "...",
    "metadata": {}
  },
  "media_urls": ["url1", "url2"]
}
```

**Response:**
```json
{
  "responseId": "uuid",
  "status": "pending_review",
  "message": "Enviado para revision"
}
```

### Calificacion Docente

```
POST /api/teacher/responses/{responseId}/grade
```

**Request:**
```json
{
  "score": 85,
  "feedback": "Buen trabajo...",
  "rubric_scores": {
    "contenido": 90,
    "creatividad": 80,
    "presentacion": 85
  }
}
```

### Respuestas Pendientes

```
GET /api/teacher/pending-reviews
```

**Query params:**
- `module`: 4 | 5
- `groupId`: UUID
- `page`: number
- `limit`: number

## DTOs

### Module4ResponseDto

```typescript
interface Module4ResponseDto {
  exerciseType: 'linea_tiempo' | 'mapa_mental' | 'infografia' | 'podcast' | 'video_resumen';
  content: string;
  mediaUrls: string[];
  metadata: {
    duration?: number;
    format?: string;
  };
}
```

### Module5ResponseDto

```typescript
interface Module5ResponseDto {
  exerciseType: 'ensayo' | 'carta' | 'proyecto_multimedia';
  textContent: string;
  attachments: {
    url: string;
    type: string;
    size: number;
  }[];
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

### ManualReviewService

**Ubicacion:** `apps/backend/src/educational/services/manual-review.service.ts`

Metodos:
- `submitForReview(responseDto): Promise<Response>`
- `getPendingReviews(filters): Promise<Response[]>`
- `gradeResponse(gradeDto): Promise<void>`
- `notifyTeacher(teacherId, responseId): Promise<void>`

## Trazabilidad

- Controllers: `apps/backend/src/educational/controllers/`
- Services: `apps/backend/src/educational/services/`
- DTOs: `apps/backend/src/educational/dto/`
- Tests: `apps/backend/src/educational/__tests__/`

---

**Estado:** Done
