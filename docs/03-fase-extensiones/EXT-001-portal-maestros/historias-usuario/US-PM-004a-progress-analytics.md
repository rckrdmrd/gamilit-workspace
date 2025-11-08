# US-PM-004a: Analytics de Progreso

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 4
**Story Points:** 7 SP
**Presupuesto:** $3,050 MXN
**Prioridad:** Media (Extensión Fase 3)
**Estado:** 📋 Planificada
**Relación:** Parte de US-PM-004 (dividida en a/b)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero ver analytics detallado del progreso individual de mis estudiantes con métricas, gráficas y comparativas para identificar estudiantes que necesiten apoyo adicional y reconocer alto desempeño.

**Contexto:** Esta user story es parte de la funcionalidad de Seguimiento de Progreso Estudiantil, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca en analytics y métricas de desempeño estudiantil.

## Criterios de Aceptación

### Funcionales

#### AC-01: Ver Progreso General
- [ ] **DADO** que soy profesor de un estudiante
- [ ] **CUANDO** solicito GET /api/teacher/students/:id/progress
- [ ] **ENTONCES** recibo overall_progress con: total_assignments, completed, pending, completion_rate, average_grade
- [ ] **Y** recibo breakdown by_classroom
- [ ] **Y** recibo recent_submissions (últimas 10)

#### AC-02: Filtrar por Fecha
- [ ] **DADO** que quiero ver progreso de Oct-Nov 2025
- [ ] **CUANDO** solicito GET /progress?start_date=2025-10-01&end_date=2025-11-30
- [ ] **ENTONCES** recibo solo datos del rango especificado
- [ ] **Y** los cálculos (avg_grade, completion_rate) reflejan solo ese periodo

#### AC-03: Performance Trend
- [ ] **DADO** que solicito GET /progress
- [ ] **ENTONCES** recibo performance_trend con datos de últimas 12 semanas
- [ ] **Y** cada week incluye: average_grade, submissions_count
- [ ] **Y** puedo graficar una línea de tendencia en el frontend

#### AC-04: Access Control
- [ ] **DADO** que soy profesor de Math 101
- [ ] **CUANDO** intento ver progreso de estudiante que NO está en mis classrooms
- [ ] **ENTONCES** recibo error 403 Forbidden
- [ ] **Y** el mensaje indica "You don't have access to this student"

#### AC-05: Analytics Detallado
- [ ] **DADO** que solicito GET /api/teacher/students/:id/analytics
- [ ] **ENTONCES** recibo time_metrics (total_time, avg_time, last_login)
- [ ] **Y** recibo performance_by_type (quiz, homework, project, etc.)
- [ ] **Y** recibo performance_by_subject
- [ ] **Y** recibo strengths y areas_for_improvement

#### AC-06: At-Risk Detection
- [ ] **DADO** que un estudiante tiene average_grade < 70%
- [ ] **CUANDO** solicito GET /analytics
- [ ] **ENTONCES** recibo at_risk=true
- [ ] **Y** recibo at_risk_reasons: ["Low average grade (65%)", "Completion rate below 50%"]
- [ ] **Y** puedo usar esto para intervención temprana

#### AC-07: Exportar Progreso
- [ ] **DADO** que quiero exportar datos de progreso
- [ ] **CUANDO** solicito GET /progress?format=csv
- [ ] **ENTONCES** recibo archivo CSV con datos del estudiante
- [ ] **Y** incluye: assignments, submissions, grades, dates

### No Funcionales

#### AC-08: Performance
- [ ] Response time p95 < 300ms para /progress
- [ ] Response time p95 < 500ms para /analytics (puede ser query complejo)
- [ ] Cache de analytics (TTL: 5 minutos) con Redis

#### AC-09: Security
- [ ] Verificar relación teacher-student via classrooms
- [ ] Middleware verifyStudentAccess
- [ ] No exponer datos de estudiantes de otros profesores

#### AC-10: Validación
- [ ] Joi/Zod schemas
- [ ] Date validation (ISO 8601)
- [ ] Student ID debe ser UUID válido

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. GET /api/teacher/students/:id/progress**
- Descripción: Ver progreso general del estudiante
- Auth: JWT Required (role: teacher)
- Middleware: verifyStudentAccess

Query Params:
```typescript
{
  start_date?: string;      // ISO 8601, default: inicio del año escolar
  end_date?: string;        // ISO 8601, default: NOW()
  classroom_id?: string;    // Filter por classroom específico
}
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    student: {
      id: string,
      name: string,
      email: string,
      avatar_url: string | null
    },
    overall_progress: {
      total_assignments: number,
      completed_assignments: number,
      pending_assignments: number,
      completion_rate: number,        // percentage
      average_grade: number,          // 0-100
      total_points_earned: number,
      total_points_possible: number
    },
    by_classroom: {
      classroom_id: string,
      classroom_name: string,
      assignments_count: number,
      completed_count: number,
      average_grade: number
    }[],
    recent_submissions: {
      id: string,
      assignment_title: string,
      submitted_at: string,
      points_earned: number,
      max_points: number,
      late: boolean
    }[],  // Last 10
    performance_trend: {
      week: string,              // ISO week
      average_grade: number,
      submissions_count: number
    }[]  // Last 12 weeks
  }
}
```

**2. GET /api/teacher/students/:id/analytics**
- Descripción: Analytics detallado del estudiante
- Auth: JWT Required (role: teacher)

Response (200 OK):
```typescript
{
  success: true,
  data: {
    student_id: string,
    time_metrics: {
      total_time_on_platform: number,    // minutes
      avg_time_per_assignment: number,   // minutes
      last_login: string
    },
    performance_by_type: {
      type: 'quiz' | 'homework' | 'project' | 'exam' | 'discussion',
      count: number,
      average_grade: number,
      completion_rate: number
    }[],
    performance_by_subject: {
      subject: string,
      count: number,
      average_grade: number
    }[],
    strengths: string[],           // Topics con >85% avg
    areas_for_improvement: string[], // Topics con <70% avg
    engagement_score: number,      // 0-100
    consistency_score: number,     // 0-100 (regularidad de submissions)
    at_risk: boolean,              // Flag si avg < 70% o completion < 50%
    at_risk_reasons: string[]
  }
}
```

#### Tareas Backend (4.5 SP)

1. Setup & Infrastructure (0.5 SP)
   - Configurar Redis cache
   - Joi/Zod schemas

2. Database (0.5 SP)
   - Verificar indexes para performance
   - Considerar materialized view para analytics (opcional)
   - Migration scripts

3. Progress & Analytics Endpoints (3 SP)
   - GET /api/teacher/students/:id/progress
     - Query submissions del estudiante
     - Calcular overall_progress
     - Calcular by_classroom breakdown
     - Calcular performance_trend (últimas 12 semanas)
   - GET /api/teacher/students/:id/analytics
     - Calcular time_metrics
     - Calcular performance_by_type
     - Calcular performance_by_subject
     - Detectar strengths y areas_for_improvement
     - Calcular at_risk flag
   - Cache implementation (Redis)
   - Middleware verifyStudentAccess

4. Tests (0.5 SP)
   - Tests unitarios: ProgressService (cálculos)
   - Tests unitarios: AnalyticsService (at-risk detection)
   - Tests de integración: 2 endpoints

### Frontend

#### Componentes

- StudentProgress (dashboard)
- ProgressChart (línea de tendencia)
- PerformanceBreakdown (by type, by subject)
- AtRiskAlert (si at_risk=true)
- RecentSubmissions (tabla)
- DateRangePicker (filtrar por fechas)

#### Tareas Frontend (2.5 SP)

1. Progress Dashboard (1.5 SP)
   - Componente StudentProgress (layout principal)
   - ProgressChart (usando Recharts o Chart.js)
   - PerformanceBreakdown (cards con stats)
   - RecentSubmissions (tabla)
   - Date range picker (filtrar por fechas)

2. Analytics View (1 SP)
   - Componente StudentAnalytics
   - AtRiskAlert (si at_risk=true)
   - Charts: performance by type, by subject
   - Export CSV button

### Database

- Tablas existentes: `submissions`, `assignments`
- Indexes críticos:
  - `idx_submissions_student_id`
  - `idx_submissions_submitted_at`
- Views o materialized views para analytics (opcional)

## Dependencias

- **Requiere:**
  - US-PM-001a (Classroom Management) - para verificar relación teacher-student
  - US-PM-002a (Assignment Management) - para datos de progreso
  - US-PM-003b (Grading System) - para grades y submissions

- **Relacionada:**
  - US-PM-004b (Teacher Notes)

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Performance con 1000+ submissions | Alta | Alto | Cache Redis (TTL 5 min), indexes en BD, materialized views |
| Cálculos de analytics incorrectos | Media | Alto | Tests exhaustivos de edge cases, validar con datos reales |
| Acceso no autorizado a datos estudiantiles | Media | Crítico | Middleware verifyStudentAccess estricto |

## Testing

### Unit Tests
- ProgressService: 8 tests
  - Cálculo de overall_progress (2 tests)
  - Filtrado por fecha (2 tests)
  - Performance trend (2 tests)
  - By classroom breakdown (2 tests)
- AnalyticsService: 6 tests
  - At-risk detection (2 tests)
  - Strengths/weaknesses (2 tests)
  - Performance by type/subject (2 tests)

### Integration Tests
- 2 endpoints API
- Tests con 100+ submissions
- Tests de cache

### E2E Tests
- Flujo: Login → Select student → View progress → Add note

## Wireframe

```
┌────────────────────────────────────────────────────────────┐
│ ← Back to Math 101         John Doe's Progress             │
├────────────────────────────────────────────────────────────┤
│ Overall Progress                    Oct 1 - Nov 28, 2025 ▼│
│ ┌──────────────┬──────────────┬──────────────┬───────────┐│
│ │ Assignments  │ Completion   │ Average      │ At Risk   ││
│ │ 12 / 15      │ 80%          │ 85%          │ No        ││
│ └──────────────┴──────────────┴──────────────┴───────────┘│
├────────────────────────────────────────────────────────────┤
│ Performance Trend (Last 12 Weeks)                          │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 100% ┤                                    ●─●           │ │
│ │  80% ┤                          ●─●─●─●─●              │ │
│ │  60% ┤                    ●─●─●                        │ │
│ │  40% ┤              ●─●─●                              │ │
│ │  20% ┤        ●─●─●                                    │ │
│ │   0% ┼─────────────────────────────────────────────────│ │
│ │      W1  W3  W5  W7  W9  W11                           │ │
│ └────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│ By Classroom                                               │
│ Math 101: 8/10 completed, Avg: 87%                         │
│ Math 201: 4/5 completed, Avg: 82%                          │
├────────────────────────────────────────────────────────────┤
│ Recent Submissions                                         │
│ Chapter 5 Quiz       Oct 26    85/100    On time          │
│ Homework 10          Oct 24    45/50     On time          │
│ Project              Oct 20    90/100    2 days late      │
└────────────────────────────────────────────────────────────┘
```

## Métricas de Éxito

- 2 endpoints funcionando
- Test coverage >80%
- Response time p95 <500ms (con cache)
- Cache hit rate >70%
- >70% de profesores usan student progress regularmente
- Tiempo de revisión <2 min/estudiante

## Notas

- ✅ Archivo modularizado desde US-PM-004-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Analytics y métricas de progreso estudiantil
- 🔗 Complementa con US-PM-004b para notas de profesor
- ⚠️ IMPORTANTE: Cache obligatorio para performance

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
