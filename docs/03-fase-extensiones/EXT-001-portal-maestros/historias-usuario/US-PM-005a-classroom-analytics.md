---
id: "US-PM-005a"
title: "Analytics de Aula"
type: "User Story"
status: "Backlog"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 8
budget: "$3,500 MXN"
sprint: "Sprint-9"
labels: ["portal-maestros", "analytics", "classroom", "dashboard", "cache"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-PM-005a: Analytics de Aula

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 5
**Story Points:** 8 SP
**Presupuesto:** $3,500 MXN
**Prioridad:** Media (Extensión Fase 3)
**Estado:** Backlog
**Relación:** Parte de US-PM-005 (dividida en a/b/c)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero ver analytics agregado de mis classrooms con métricas generales, distribución de calificaciones y tendencias para tomar decisiones informadas sobre mi enseñanza.

**Contexto:** Esta user story es parte de la funcionalidad de Analytics y Reportes, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca en analytics agregado a nivel de classroom con dashboard y gráficas.

## Criterios de Aceptación

### Funcionales

#### AC-01: Analytics de Classroom
- [ ] **DADO** que soy profesor de Math 101
- [ ] **CUANDO** solicito GET /api/teacher/analytics/classroom/:id
- [ ] **ENTONCES** recibo overall_performance (avg_grade, completion_rate)
- [ ] **Y** recibo grade_distribution (distribución de calificaciones)
- [ ] **Y** recibo top_performers (top 5 estudiantes)
- [ ] **Y** recibo at_risk_students

#### AC-02: Filtrar por Fecha
- [ ] **DADO** que quiero analytics de Octubre 2025
- [ ] **CUANDO** solicito GET /classroom/:id?start_date=2025-10-01&end_date=2025-10-31
- [ ] **ENTONCES** recibo solo datos del mes de Octubre
- [ ] **Y** los cálculos reflejan solo ese periodo

#### AC-03: Performance by Assignment
- [ ] **DADO** que solicito analytics de classroom
- [ ] **ENTONCES** recibo performance_by_assignment
- [ ] **Y** cada assignment incluye: title, avg_grade, completion_rate, avg_time_to_complete
- [ ] **Y** puedo identificar assignments difíciles (avg_grade < 70%)

#### AC-04: Grade Distribution
- [ ] **DADO** que solicito analytics de classroom
- [ ] **ENTONCES** recibo grade_distribution en rangos: 90-100, 80-89, 70-79, 60-69, 0-59
- [ ] **Y** cada rango incluye count y percentage
- [ ] **Y** puedo graficar un histograma en el frontend

#### AC-05: At-Risk Detection
- [ ] **DADO** que un classroom tiene 3 estudiantes con avg_grade < 70%
- [ ] **CUANDO** solicito GET /analytics/classroom/:id
- [ ] **ENTONCES** recibo at_risk_students array con esos 3 estudiantes
- [ ] **Y** cada estudiante incluye reason array (ej: ["Low average grade", "Low completion rate"])

#### AC-06: Performance Trend
- [ ] **DADO** que solicito analytics de classroom
- [ ] **ENTONCES** recibo trend con datos de últimas 12 semanas
- [ ] **Y** cada week incluye: average_grade, submissions_count, completion_rate
- [ ] **Y** puedo graficar línea de tendencia en frontend

#### AC-07: Top Performers
- [ ] **DADO** que solicito analytics de classroom
- [ ] **ENTONCES** recibo top_performers (top 5 estudiantes)
- [ ] **Y** cada estudiante incluye: name, average_grade, completion_rate
- [ ] **Y** están ordenados por average_grade DESC

#### AC-08: Cache de Analytics
- [ ] **DADO** que solicito analytics que no cambió en 5 minutos
- [ ] **CUANDO** solicito GET /analytics/classroom/:id
- [ ] **ENTONCES** recibo respuesta del cache (Redis)
- [ ] **Y** el response time es <100ms
- [ ] **Y** el cache se invalida al crear nueva submission/grade

### No Funcionales

#### AC-09: Performance
- [ ] Response time p95 < 500ms para analytics endpoints (sin cache)
- [ ] Response time p95 < 100ms con cache hit
- [ ] Cache TTL: 5 minutos
- [ ] Indexes críticos en BD

#### AC-10: Security
- [ ] Verificar ownership de classroom antes de mostrar analytics
- [ ] No exponer datos de otros profesores
- [ ] Rate limiting: 100 req/15min

#### AC-11: Validación
- [ ] Joi/Zod schemas
- [ ] Date validation (ISO 8601)
- [ ] Classroom ID debe ser UUID válido

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. GET /api/teacher/analytics/classroom/:id**
- Descripción: Analytics agregado del classroom
- Auth: JWT Required (role: teacher)
- Middleware: verifyClassroomOwnership

Query Params:
```typescript
{
  start_date?: string;      // ISO 8601, default: inicio del año escolar
  end_date?: string;        // ISO 8601, default: NOW()
}
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    classroom: {
      id: string,
      name: string,
      subject: string,
      grade_level: string,
      students_count: number
    },
    overall_performance: {
      total_assignments: number,
      average_completion_rate: number,   // percentage
      average_grade: number,              // 0-100
      total_submissions: number,
      pending_grading: number
    },
    grade_distribution: {
      range: '90-100' | '80-89' | '70-79' | '60-69' | '0-59',
      count: number,
      percentage: number
    }[],
    performance_by_assignment: {
      assignment_id: string,
      assignment_title: string,
      assignment_type: string,
      submissions_count: number,
      average_grade: number,
      completion_rate: number,
      avg_time_to_complete: number      // minutes
    }[],
    top_performers: {
      student_id: string,
      student_name: string,
      average_grade: number,
      completion_rate: number
    }[],  // Top 5
    at_risk_students: {
      student_id: string,
      student_name: string,
      average_grade: number,
      completion_rate: number,
      reason: string[]
    }[],
    trend: {
      week: string,
      average_grade: number,
      submissions_count: number,
      completion_rate: number
    }[]  // Last 12 weeks
  }
}
```

#### Tareas Backend (5 SP)

1. Setup & Infrastructure (1 SP)
   - Configurar Redis cache con TTL
   - Joi/Zod schemas
   - Query optimization

2. Database Optimization (0.5 SP)
   - Crear indexes para analytics queries
   - Considerar materialized views (opcional)
   - Query profiling con EXPLAIN ANALYZE

3. Classroom Analytics Endpoint (3 SP)
   - GET /api/teacher/analytics/classroom/:id
     - Overall performance
     - Grade distribution
     - Performance by assignment
     - Top performers y at-risk students
     - Trend (12 weeks)
   - Cache implementation (Redis)
   - Cache invalidation strategy
   - Tests unitarios

4. Tests (0.5 SP)
   - Tests unitarios: AnalyticsService (cálculos complejos)
   - Tests de integración: endpoint
   - Tests de cache

### Frontend

#### Componentes

- ClassroomAnalytics (dashboard principal)
- OverallPerformanceCards (métricas generales)
- GradeDistributionChart (histograma)
- PerformanceByAssignmentTable
- TopPerformersList
- AtRiskStudentsAlert
- TrendLineChart (12 semanas)
- DateRangePicker

#### Tareas Frontend (3 SP)

1. Analytics Dashboard (2.5 SP)
   - Componente ClassroomAnalytics (layout principal)
   - OverallPerformanceCards (cards con stats)
   - GradeDistributionChart (histograma con Recharts)
   - PerformanceByAssignmentTable
   - TopPerformersList
   - AtRiskStudentsAlert
   - TrendLineChart (línea de tendencia, 12 semanas)
   - DateRangePicker

2. Tests (0.5 SP)
   - Component tests: ClassroomAnalytics
   - Tests de charts rendering

### Database

- Indexes críticos:
  - `idx_submissions_classroom_id`
  - `idx_submissions_student_id`
  - `idx_submissions_submitted_at`
  - `idx_submissions_graded_at`
- Considerar materialized views para analytics complejos (opcional)

## Dependencias

- **Requiere:**
  - US-PM-001a (Classroom Management) - classrooms existen
  - US-PM-002a (Assignment Management) - assignments y submissions existen
  - US-PM-003b (Grading System) - grades existen

- **Relacionada:**
  - US-PM-005b (Report Generation)
  - US-PM-005c (Engagement Metrics)

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Performance con analytics complejos | Alta | Alto | Cache Redis, materialized views, indexes, query optimization |
| Cálculos incorrectos | Media | Alto | Tests exhaustivos, validación con datos reales, code review |
| Queries SQL lentos | Alta | Alto | EXPLAIN ANALYZE, indexes, limitar date range a 1 año max |

## Testing

### Unit Tests
- AnalyticsService: 10 tests
  - Cálculo de grade distribution (2 tests)
  - Top performers (2 tests)
  - At-risk detection (2 tests)
  - Performance trend (2 tests)
  - Filtros por fecha (2 tests)

### Integration Tests
- GET /analytics/classroom/:id endpoint
- Tests con 100+ submissions
- Tests de cache

### E2E Tests
- Flujo: Login → View classroom analytics → Apply filters

## Wireframe

```
┌────────────────────────────────────────────────────────────┐
│ Analytics Dashboard                                         │
├────────────────────────────────────────────────────────────┤
│ [Math 101 ▼]                    Oct 1 - Nov 28, 2025 ▼    │
├────────────────────────────────────────────────────────────┤
│ Overall Performance                                         │
│ ┌──────────────┬──────────────┬──────────────┬───────────┐│
│ │ Avg Grade    │ Completion   │ At Risk      │ Pending   ││
│ │ 82%          │ 85%          │ 3 students   │ 12        ││
│ └──────────────┴──────────────┴──────────────┴───────────┘│
├────────────────────────────────────────────────────────────┤
│ Grade Distribution                                          │
│ ┌────────────────────────────────────────────────────────┐ │
│ │  30 ┤     ████████                                       │ │
│ │  20 ┤     ████████ ██████                               │ │
│ │  10 ┤     ████████ ██████ ████ ████                     │ │
│ │   0 ┼─────────────────────────────────────────────────  │ │
│ │     0-59   60-69  70-79  80-89  90-100                 │ │
│ └────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│ Performance Trend                                           │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 100% ┤                                  ●─●─●           │ │
│ │  80% ┤                        ●─●─●─●─●                │ │
│ │  60% ┤                  ●─●─●                          │ │
│ │  40% ┤            ●─●─●                                │ │
│ │   0% ┼─────────────────────────────────────────────────│ │
│ │      W1  W3  W5  W7  W9  W11                           │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Métricas de Éxito

- 1 endpoint funcionando
- Test coverage >80%
- Response time p95 <500ms (sin cache), <100ms (con cache)
- Cache hit rate >70%
- >60% de profesores usan analytics regularmente

## Notas

- ✅ Archivo modularizado desde US-PM-005-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Analytics agregado de classroom con dashboard
- 🔗 Complementa con US-PM-005b (Reports) y US-PM-005c (Engagement)
- ⚠️ IMPORTANTE: Cache Redis crítico para performance

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
