---
id: "US-PM-003a"
title: "Cola de Calificaciones"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 8
budget: "$3,500 MXN"
sprint: "Sprint-7"
labels: ["portal-maestros", "grading", "queue", "pending-submissions"]
created_date: "2025-11-02"
updated_date: "2026-01-25"
---

# US-PM-003a: Cola de Calificaciones

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 3
**Story Points:** 8 SP
**Presupuesto:** $3,500 MXN
**Prioridad:** Alta (Extensión Fase 3)
**Estado:** Done
**Relación:** Parte de US-PM-003 (dividida en a/b)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero ver una cola organizada de submissions pendientes de calificación con filtros y priorización para gestionar eficientemente mi carga de trabajo de calificaciones.

**Contexto:** Esta user story es parte de la funcionalidad de Sistema de Calificación, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca en la visualización y organización de la cola de calificaciones pendientes.

## Criterios de Aceptación

### Funcionales

#### AC-01: Listar Pending Submissions
- [ ] **DADO** que soy un profesor con 50 submissions pendientes
- [ ] **CUANDO** solicito GET /api/teacher/grading/pending
- [ ] **ENTONCES** recibo lista de submissions con status='pending'
- [ ] **Y** cada item incluye: assignment_title, student_name, submitted_at, days_waiting
- [ ] **Y** la lista está ordenada por oldest first (más antiguos primero)

#### AC-02: Filtrar por Classroom
- [ ] **DADO** que tengo submissions de 3 classrooms diferentes
- [ ] **CUANDO** solicito GET /api/teacher/grading/pending?classroom_id=math-101
- [ ] **ENTONCES** recibo solo submissions del classroom Math 101
- [ ] **Y** el total count refleja solo ese classroom

#### AC-03: Filtrar por Assignment
- [ ] **DADO** que tengo 10 assignments con submissions pendientes
- [ ] **CUANDO** solicito GET /grading/pending?assignment_id=quiz-123
- [ ] **ENTONCES** recibo solo submissions del assignment Quiz 123
- [ ] **Y** puedo combinar con filtro de classroom

#### AC-04: Filtrar por Estudiante
- [ ] **DADO** que quiero revisar trabajo de un estudiante específico
- [ ] **CUANDO** solicito GET /grading/pending?student_id=john-doe
- [ ] **ENTONCES** recibo solo submissions de ese estudiante
- [ ] **Y** veo todas sus submissions pendientes de todos los assignments

#### AC-05: Priorizar Late Submissions
- [ ] **DADO** que tengo submissions late y on-time
- [ ] **CUANDO** solicito GET /api/teacher/grading/pending?sort=priority
- [ ] **ENTONCES** las late submissions aparecen primero
- [ ] **Y** hay un indicador visual de "LATE" en cada submission

#### AC-06: Ordenamiento Flexible
- [ ] **DADO** que solicito la grading queue
- [ ] **CUANDO** especifico sort=newest
- [ ] **ENTONCES** recibo submissions ordenadas por submitted_at DESC
- [ ] **Y** los sorts soportados son: oldest, newest, priority

#### AC-07: Days Waiting Calculation
- [ ] **DADO** que una submission fue enviada hace 3 días
- [ ] **CUANDO** solicito la grading queue
- [ ] **ENTONCES** veo days_waiting = 3
- [ ] **Y** esto me ayuda a priorizar submissions antiguas

#### AC-08: Paginación de Queue
- [ ] **DADO** que tengo 100 submissions pendientes
- [ ] **CUANDO** solicito GET /grading/pending?page=2&limit=25
- [ ] **ENTONCES** recibo 25 submissions (items 26-50)
- [ ] **Y** recibo metadata con total, pending_count, page, totalPages

### No Funcionales

#### AC-09: Performance
- [ ] Response time p95 < 200ms para GET grading queue
- [ ] Indexes en: status, submitted_at, assignment_id, classroom_id
- [ ] Query optimizado con JOINs eficientes

#### AC-10: Security
- [ ] Solo veo submissions de mis propios assignments
- [ ] Middleware verifica que soy teacher de los assignments
- [ ] Rate limiting: 100 req/15min

#### AC-11: Validación
- [ ] Joi/Zod schemas para query params
- [ ] Validación de enum values (sort)
- [ ] Validación de UUIDs para filtros

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. GET /api/teacher/grading/pending**
- Descripción: Listar submissions pendientes de calificación (grading queue)
- Auth: JWT Required (role: teacher)
- Rate Limit: 100 req/15min

Query Params:
```typescript
{
  page?: number;              // default: 1
  limit?: number;             // 10, 25, 50, 100
  classroom_id?: string;      // Filter por classroom
  assignment_id?: string;     // Filter por assignment
  student_id?: string;        // Filter por student
  sort?: 'oldest' | 'newest' | 'priority';  // default: oldest
}
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    id: string,                    // submission_id
    assignment_id: string,
    assignment_title: string,
    student_id: string,
    student_name: string,
    student_email: string,
    classroom_id: string,
    classroom_name: string,
    content: string,               // Student's submission
    submitted_at: string,
    deadline: string,
    late: boolean,
    days_waiting: number           // Days since submission
  }[],
  meta: {
    total: number,
    pending_count: number,
    page: number,
    totalPages: number
  }
}
```

#### Tareas Backend (5 SP)

1. Database Optimization (1 SP)
   - Verificar tabla submissions
   - Crear indexes: `idx_submissions_status`, `idx_submissions_submitted_at`
   - Query optimization para grading queue
   - Migration scripts

2. Grading Queue Endpoint (3 SP)
   - GET /api/teacher/grading/pending
   - Implementar filtros (classroom, assignment, student)
   - Implementar ordenamiento (oldest, newest, priority)
   - Calcular days_waiting
   - Detectar late submissions
   - JOIN eficiente con assignments, students, classrooms
   - Tests unitarios

3. Tests (1 SP)
   - Unit tests: GradingQueueService (8 tests)
   - Integration tests: API endpoint
   - Tests de filtros combinados
   - Tests de performance con 1000+ submissions

### Frontend

#### Componentes

- GradingQueue (tabla con paginación)
- GradingQueueFilters (classroom, assignment, student, sort)
- LateIndicator (badge visual)
- DaysWaitingBadge (indicador de antigüedad)

#### Tareas Frontend (3 SP)

1. Setup & Store (0.5 SP)
   - Zustand store: gradingStore
   - API client functions
   - TypeScript types

2. Grading Queue View (2.5 SP)
   - Componente GradingQueue (tabla con paginación)
   - GradingQueueFilters (filtros múltiples)
   - Indicador de late submissions (badge rojo)
   - DaysWaitingBadge (badge con días)
   - Ordenamiento selector
   - Click en item → abrir GradingInterface (US-PM-003b)
   - Loading skeletons
   - Empty state cuando no hay pending

### Database

- Tabla: `submissions`
- Indexes críticos:
  - `idx_submissions_status` (para filtrar pending)
  - `idx_submissions_submitted_at` (para ordenar)
  - `idx_submissions_assignment_id`
  - `idx_submissions_classroom_id`
- Computed column: `days_waiting` (o calcular en query)

## Dependencias

- **Requiere:**
  - US-PM-002a (Assignment Management) - assignments y submissions existen
  - EP002 (Student Module) - submissions de estudiantes

- **Relacionada:**
  - US-PM-003b (Grading Interface) - complementa con UI de calificación

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Performance con 1000+ pending | Media | Alto | Paginación obligatoria, indexes, cache si es necesario |
| Cálculo incorrecto de days_waiting | Baja | Medio | Tests de timezone handling, usar UTC |
| UX confusa con múltiples filtros | Alta | Bajo | UI clara, reset filters button, preview count |

## Testing

### Unit Tests
- GradingQueueService: 8 tests
  - Filtros individuales (3 tests)
  - Filtros combinados (2 tests)
  - Ordenamiento (2 tests)
  - Days waiting calculation (1 test)

### Integration Tests
- GET /grading/pending endpoint
- Tests con 100 submissions
- Tests de filtros

### E2E Tests
- Flujo: Login → View grading queue → Apply filters → Click submission

## Cálculo de Days Waiting

```typescript
// Backend: Days waiting calculation
const calculateDaysWaiting = (submittedAt: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - submittedAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// En query SQL
SELECT
  *,
  DATE_PART('day', NOW() - submitted_at) AS days_waiting
FROM submissions
WHERE status = 'pending';
```

## Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ Grading Queue                              24 pending       │
├─────────────────────────────────────────────────────────────┤
│ [Math 101 ▼] [All Assignments ▼] [Sort: Oldest ▼]          │
├─────────────────────────────────────────────────────────────┤
│ Assignment            Student      Submitted      Status    │
│ ───────────────────────────────────────────────────────────│
│ Chapter 5 Quiz        John Doe     2 days ago    🔴 LATE   │
│ Research Project      Jane Smith   1 day ago     ⏳ Pending│
│ Homework 10           Bob Johnson  5 hours ago   ⏳ Pending│
├─────────────────────────────────────────────────────────────┤
│                    [1] 2 3 ... 5 Next                       │
└─────────────────────────────────────────────────────────────┘
```

## Métricas de Éxito

- 1 endpoint funcionando
- Test coverage >80%
- Response time p95 <200ms
- 100% de submissions pendientes visibles
- Filtros funcionan 100% correctamente
- Days waiting calculado con ±1 día de precisión

## Notas

- ✅ Archivo modularizado desde US-PM-003-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Cola y organización de calificaciones pendientes
- 🔗 Complementa con US-PM-003b para interfaz de calificación
- ⚠️ IMPORTANTE: Indexes críticos para performance

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
