# Arquitectura: Teacher Responses Page - Consulta Dual de Tablas

**Fecha**: 19 Diciembre 2025
**Autor**: Requirements-Analyst
**Modulo**: Teacher Portal - Responses

---

## ARQUITECTURA ACTUAL

El endpoint `GET /api/v1/teacher/attempts` consulta **dos tablas** mediante UNION query para mostrar todas las respuestas de estudiantes:

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE DATOS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ESTUDIANTE                       TEACHER PORTAL            │
│  ┌────────────┐                  ┌────────────┐            │
│  │ Submit     │                  │ Responses  │            │
│  │ Ejercicio  │                  │ Page       │            │
│  └─────┬──────┘                  └──────┬─────┘            │
│        │                                │                   │
│        ▼                                ▼                   │
│  ┌────────────────┐          ┌────────────────┐            │
│  │ exercise_      │          │ UNION QUERY    │            │
│  │ SUBMISSIONS    │◄─────────│ attempts +     │            │
│  │ (M4-M5)        │          │ submissions    │            │
│  └────────────────┘          └────────────────┘            │
│        │                                ▲                   │
│        │                                │                   │
│  ┌────────────────┐                     │                   │
│  │ exercise_      │─────────────────────┘                   │
│  │ ATTEMPTS       │                                         │
│  │ (M1-M3)        │                                         │
│  └────────────────┘                                         │
│                                                             │
│  ✅ UNION Query combina ambas tablas                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## TABLAS DE ORIGEN

### Tabla 1: `progress_tracking.exercise_attempts`

**Proposito**: Ejercicios autocorregibles (Modulos 1-3)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | ID del intento |
| `user_id` | UUID | ID del estudiante |
| `exercise_id` | UUID | ID del ejercicio |
| `submitted_answers` | JSONB | Respuestas enviadas |
| `is_correct` | BOOLEAN | Si fue correcto |
| `score` | INTEGER | Puntaje obtenido |
| `comodines_used` | JSONB | Comodines usados |
| `submitted_at` | TIMESTAMP | Fecha de envio |

**DDL**: `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`

### Tabla 2: `progress_tracking.exercise_submissions`

**Proposito**: Ejercicios de revision manual (Modulos 4-5)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | ID del submission |
| `user_id` | UUID | ID del estudiante |
| `exercise_id` | UUID | ID del ejercicio |
| `answer_data` | JSONB | Respuestas enviadas |
| `is_correct` | BOOLEAN | Si fue correcto (NULL hasta calificar) |
| `score` | INTEGER | Puntaje (NULL hasta calificar) |
| `status` | TEXT | draft, submitted, graded, reviewed |
| `feedback` | TEXT | Retroalimentacion del profesor |
| `comodines_used` | TEXT[] | Comodines usados |
| `submitted_at` | TIMESTAMP | Fecha de envio |

**DDL**: `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`

---

## IMPLEMENTACION

### Archivos Clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `apps/backend/src/modules/teacher/services/exercise-responses.service.ts` | UNION query de ambas tablas |
| `apps/backend/src/modules/teacher/dto/exercise-responses.dto.ts` | DTOs con enums `ResponseSource`, `ExerciseSubmissionStatus` |

### DTOs

```typescript
// Enums para identificar origen
export enum ResponseSource {
  ATTEMPT = 'attempt',       // exercise_attempts
  SUBMISSION = 'submission', // exercise_submissions
}

export enum ExerciseSubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  REVIEWED = 'reviewed',
}

// Campos adicionales en AttemptResponseDto
interface AttemptResponseDto {
  // ... campos base ...
  source?: ResponseSource;           // Indica tabla de origen
  status?: ExerciseSubmissionStatus; // Solo para submissions
  feedback?: string;                 // Solo para submissions
  requires_manual_grading?: boolean; // true para submissions
}
```

### Query UNION

```sql
SELECT * FROM (
  -- Ejercicios autocorregibles
  SELECT
    'attempt' AS source,
    attempt.id, attempt.user_id, attempt.exercise_id,
    attempt.submitted_answers, attempt.is_correct, attempt.score,
    attempt.comodines_used, -- JSONB
    NULL::text AS status,
    NULL::text AS feedback,
    false AS requires_manual_grading,
    ...
  FROM progress_tracking.exercise_attempts attempt
  ...

  UNION ALL

  -- Ejercicios de revision manual
  SELECT
    'submission' AS source,
    sub.id, sub.user_id, sub.exercise_id,
    sub.answer_data AS submitted_answers, sub.is_correct, sub.score,
    to_jsonb(sub.comodines_used) AS comodines_used, -- text[] -> jsonb
    sub.status,
    sub.feedback,
    true AS requires_manual_grading,
    ...
  FROM progress_tracking.exercise_submissions sub
  ...
  WHERE sub.status != 'draft'  -- Excluir borradores
) AS combined
ORDER BY submitted_at DESC
```

**Nota**: `to_jsonb(sub.comodines_used)` convierte `text[]` a `jsonb` para compatibilidad del UNION.

---

## RESPUESTA API

### Endpoint

```
GET /api/v1/teacher/attempts
Authorization: Bearer <token>
```

### Query Parameters

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `page` | number | Pagina (default: 1) |
| `limit` | number | Items por pagina (default: 20) |
| `student_id` | UUID | Filtrar por estudiante |
| `exercise_id` | UUID | Filtrar por ejercicio |
| `module_id` | UUID | Filtrar por modulo |
| `classroom_id` | UUID | Filtrar por aula |
| `is_correct` | boolean | Filtrar por correctitud |
| `from_date` | ISO8601 | Fecha desde |
| `to_date` | ISO8601 | Fecha hasta |
| `sort_by` | enum | submitted_at, score, time |
| `sort_order` | enum | asc, desc |

### Response

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        "student_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "student_name": "Estudiante Testing",
        "exercise_id": "fe944016-0f37-4a8e-b6dc-07f85c0e282c",
        "exercise_title": "Crucigrama Cientifico",
        "module_name": "Modulo 1: Comprension Literal",
        "submitted_answers": {"essay": "Respuesta del estudiante..."},
        "is_correct": false,
        "score": 0,
        "source": "submission",
        "status": "submitted",
        "requires_manual_grading": true
      },
      {
        "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "student_name": "Estudiante Testing",
        "exercise_title": "Linea de Tiempo",
        "submitted_answers": {"answers": ["A", "B", "C"]},
        "is_correct": true,
        "score": 100,
        "source": "attempt",
        "status": null,
        "requires_manual_grading": false
      }
    ],
    "total": 4,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

---

## VALIDACION RLS

El acceso se valida mediante:

```sql
WHERE c.teacher_id = $1        -- Profesor asignado al aula
  AND profile.tenant_id = $2   -- Mismo tenant
```

Los profesores solo ven respuestas de estudiantes en sus aulas asignadas.

---

## RELACIONES

```
Teacher Portal (Frontend)
    │
    ▼
GET /api/v1/teacher/attempts
    │
    ▼
ExerciseResponsesService.getAttempts()
    │
    ├──► progress_tracking.exercise_attempts
    │        └──► Ejercicios autocorregibles (M1-M3)
    │
    └──► progress_tracking.exercise_submissions
             └──► Ejercicios revision manual (M4-M5)
```

---

*Documento actualizado: 2025-12-19*
*Proyecto: GAMILIT - Portal Teacher*
