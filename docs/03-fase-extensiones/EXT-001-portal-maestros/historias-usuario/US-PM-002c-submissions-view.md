---
id: "US-PM-002c"
title: "Vista de Envios"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 4
budget: "$1,750 MXN"
sprint: "Sprint-6"
labels: ["portal-maestros", "submissions", "view", "late-detection"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-PM-002c: Vista de Envíos

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 2
**Story Points:** 4 SP
**Presupuesto:** $1,750 MXN
**Prioridad:** Alta (Extensión Fase 3)
**Estado:** Backlog
**Relación:** Parte de US-PM-002 (dividida en a/b/c)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero ver todas las submissions (envíos) de un assignment con filtros y ordenamiento para monitorear el progreso de mis estudiantes y priorizar calificaciones.

**Contexto:** Esta user story es parte de la funcionalidad de Gestión de Assignments, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca en la visualización de submissions de estudiantes.

## Criterios de Aceptación

### Funcionales

#### AC-01: Ver Submissions de Assignment
- [ ] **DADO** que un assignment tiene 30 submissions
- [ ] **CUANDO** solicito GET /api/teacher/assignments/:id/submissions
- [ ] **ENTONCES** recibo lista paginada de submissions
- [ ] **Y** cada submission incluye: student_name, classroom_id, status, submitted_at, points_earned, late

#### AC-02: Filtrar por Status
- [ ] **DADO** que un assignment tiene submissions con diferentes status
- [ ] **CUANDO** solicito GET /submissions?status=pending
- [ ] **ENTONCES** recibo solo submissions con status='pending'
- [ ] **Y** los status soportados son: pending, submitted, graded, late

#### AC-03: Filtrar por Classroom
- [ ] **DADO** que un assignment está asignado a 3 classrooms
- [ ] **CUANDO** solicito GET /submissions?classroom_id=math-101
- [ ] **ENTONCES** recibo solo submissions del classroom Math 101
- [ ] **Y** el total count refleja solo ese classroom

#### AC-04: Ordenamiento de Submissions
- [ ] **DADO** que solicito GET /submissions?sort=oldest
- [ ] **ENTONCES** recibo submissions ordenadas por submitted_at ASC (más antiguas primero)
- [ ] **Y** los sorts soportados son: oldest, newest, late_first, student_name

#### AC-05: Marcar Late Submissions
- [ ] **DADO** que un assignment tiene deadline = "2025-10-20T23:59:59Z"
- [ ] **CUANDO** un estudiante envía submission el "2025-10-21T10:00:00Z"
- [ ] **ENTONCES** la submission se marca con late=true automáticamente
- [ ] **Y** el profesor puede ver indicador visual de "late"

#### AC-06: Paginación de Submissions
- [ ] **DADO** que un assignment tiene 100 submissions
- [ ] **CUANDO** solicito GET /submissions?page=2&limit=25
- [ ] **ENTONCES** recibo 25 submissions (items 26-50)
- [ ] **Y** recibo metadata con total, page, totalPages

#### AC-07: Ver Detalle de Submission
- [ ] **DADO** que hago clic en una submission
- [ ] **CUANDO** solicito detalles de la submission
- [ ] **ENTONCES** veo: assignment details, student info, content, attachments, submitted_at, status

### No Funcionales

#### AC-08: Performance
- [ ] Response time p95 < 500ms para GET submissions (puede ser query complejo)
- [ ] Paginación eficiente con LIMIT/OFFSET
- [ ] Indexes en: assignment_id, student_id, status, submitted_at

#### AC-09: Security
- [ ] Solo el teacher owner del assignment puede ver sus submissions
- [ ] Middleware verifyAssignmentOwnership
- [ ] No exponer datos de estudiantes de otros profesores

#### AC-10: Validación
- [ ] Joi/Zod schemas para query params
- [ ] Validación de enum values (status, sort)
- [ ] Validación de UUIDs

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. GET /api/teacher/assignments/:id/submissions**
- Descripción: Ver todas las submissions del assignment
- Auth: JWT Required (role: teacher)
- Middleware: verifyAssignmentOwnership

Query Params:
```typescript
{
  status?: 'pending' | 'submitted' | 'graded' | 'late';
  classroom_id?: string;  // UUID
  page?: number;          // default: 1
  limit?: number;         // 10, 25, 50, 100
  sort?: 'oldest' | 'newest' | 'late_first' | 'student_name';  // default: oldest
}
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    id: string,
    assignment_id: string,
    student_id: string,
    student_name: string,
    classroom_id: string,
    classroom_name: string,
    status: 'pending' | 'submitted' | 'graded' | 'late',
    submitted_at: string | null,
    graded_at: string | null,
    points_earned: number | null,
    late: boolean
  }[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    pending_count: number,
    graded_count: number
  }
}
```

#### Tareas Backend (2.5 SP)

1. Submissions Endpoint (2 SP)
   - GET /api/teacher/assignments/:id/submissions
   - Implementar filtros (status, classroom_id)
   - Implementar ordenamiento (oldest, newest, late_first, student_name)
   - Lógica de late detection (submitted_at > deadline)
   - Paginación eficiente
   - Tests unitarios

2. Late Detection Logic (0.5 SP)
   - Función para detectar late submissions
   - Computed column o cálculo en query
   - Tests de timezone handling

### Frontend

#### Componentes

- SubmissionsList (con filtros y ordenamiento)
- SubmissionCard
- SubmissionFilters (status, classroom, sort)
- LateIndicator (badge visual)

#### Tareas Frontend (1.5 SP)

1. Submissions List View (1.5 SP)
   - Componente SubmissionsList
   - SubmissionCard con status badge
   - Filtros (status, classroom)
   - Ordenamiento selector
   - LateIndicator visual (badge rojo)
   - Paginación
   - Loading states

### Database

- Tabla: `submissions`
- Indexes: assignment_id, student_id, status, submitted_at
- Computed column para `late` (o calcular en query)
- Foreign keys configuradas

## Dependencias

- **Requiere:**
  - US-PM-002a (Assignment CRUD) - assignments deben existir
  - US-PM-002b (Assignment Distribution) - assignments asignados a classrooms
  - EP002 (Student Module) - submissions de estudiantes

- **Relacionada:**
  - US-PM-002a (Assignment CRUD)
  - US-PM-002b (Assignment Distribution)
  - US-PM-003a (Grading Queue) - usa misma data

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Performance con 1000+ submissions | Media | Alto | Paginación obligatoria, indexes, considerar cache |
| Late detection incorrecta | Media | Alto | Tests exhaustivos de timezone handling, usar UTC siempre |
| Confusion entre status pending y late | Alta | Bajo | UX clara, late como badge adicional no status |

## Testing

### Unit Tests
- SubmissionsService: 5 tests
- Late detection: 3 tests
- Filtros y ordenamiento: 4 tests

### Integration Tests
- GET /submissions endpoint
- Tests de filtros combinados
- Tests de paginación

### E2E Tests
- Flujo: Login → View assignment → View submissions → Filter by late

## Late Detection Implementation

```typescript
// Backend: Late detection
const isLate = (deadline: Date, submittedAt: Date): boolean => {
  return submittedAt > deadline;
};

// En query SQL
SELECT
  *,
  (submitted_at > deadline) AS late
FROM submissions;
```

## Métricas de Éxito

- 1 endpoint funcionando
- Test coverage >80%
- Response time p95 <500ms
- 100% de late submissions detectadas correctamente
- <2% error rate en filtros

## Notas

- ✅ Archivo modularizado desde US-PM-002-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Vista y filtros de submissions
- 🔗 Complementa con US-PM-002a (CRUD) y US-PM-002b (Distribution)
- ⚠️ IMPORTANTE: Late detection debe usar UTC y manejar timezones correctamente

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
