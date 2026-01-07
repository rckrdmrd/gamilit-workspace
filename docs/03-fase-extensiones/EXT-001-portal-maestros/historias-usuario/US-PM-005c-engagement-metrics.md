---
id: "US-PM-005c"
title: "Metricas de Engagement"
type: "User Story"
status: "Backlog"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 3
budget: "$1,300 MXN"
sprint: "Sprint-9"
labels: ["portal-maestros", "engagement", "metrics", "alerts", "activity-tracking"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-PM-005c: Métricas de Engagement

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 5
**Story Points:** 3 SP
**Presupuesto:** $1,300 MXN
**Prioridad:** Media (Extensión Fase 3)
**Estado:** Backlog
**Relación:** Parte de US-PM-005 (dividida en a/b/c)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero ver métricas de engagement de mis estudiantes (actividad, tiempo en plataforma, participación) para identificar estudiantes inactivos y mejorar el engagement general.

**Contexto:** Esta user story es parte de la funcionalidad de Analytics y Reportes, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca en métricas de engagement y actividad estudiantil.

## Criterios de Aceptación

### Funcionales

#### AC-01: Overall Engagement
- [ ] **DADO** que solicito GET /api/teacher/analytics/engagement
- [ ] **CUANDO** el sistema calcula engagement
- [ ] **ENTONCES** recibo overall_engagement con: total_students, active_students, active_rate, avg_login_frequency, avg_time_on_platform
- [ ] **Y** active_students se define como "logged in últimos 7 días"

#### AC-02: Engagement por Classroom
- [ ] **DADO** que solicito GET /engagement
- [ ] **CUANDO** el sistema procesa la data
- [ ] **ENTONCES** recibo by_classroom breakdown
- [ ] **Y** cada classroom incluye: students_count, active_students, engagement_score (0-100), avg_time_per_student

#### AC-03: Activity Timeline
- [ ] **DADO** que solicito GET /engagement
- [ ] **CUANDO** el sistema genera timeline
- [ ] **ENTONCES** recibo activity_timeline con datos de últimos 30 días
- [ ] **Y** cada día incluye: logins, submissions, time_on_platform
- [ ] **Y** puedo graficar una línea de actividad en el frontend

#### AC-04: Engagement Alerts
- [ ] **DADO** que solicito GET /engagement
- [ ] **CUANDO** hay estudiantes inactivos
- [ ] **ENTONCES** recibo engagement_alerts array
- [ ] **Y** los alert_types incluyen: no_login_7days, no_submission_14days, low_time
- [ ] **Y** cada alert incluye: student_id, student_name, classroom_id, alert_type, last_activity

#### AC-05: Engagement Score Calculation
- [ ] **DADO** que un estudiante tiene login frequency alta, submissions regulares, tiempo adecuado
- [ ] **CUANDO** se calcula engagement_score
- [ ] **ENTONCES** recibe score alto (80-100)
- [ ] **Y** el score considera: login frequency (30%), submission regularity (40%), time on platform (30%)

#### AC-06: Filtrar por Classroom
- [ ] **DADO** que especifico classroom_id en query params
- [ ] **CUANDO** solicito engagement metrics
- [ ] **ENTONCES** recibo métricas solo de ese classroom
- [ ] **Y** el overall refleja solo ese classroom

### No Funcionales

#### AC-07: Performance
- [ ] Response time p95 < 400ms
- [ ] Cache de engagement metrics (TTL: 10 minutos)
- [ ] Queries optimizados para activity data

#### AC-08: Security
- [ ] Solo ver engagement de estudiantes de mis classrooms
- [ ] No exponer datos de otros profesores
- [ ] Rate limiting: 100 req/15min

#### AC-09: Validación
- [ ] Joi/Zod schemas
- [ ] Classroom ID validation (si aplica)

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. GET /api/teacher/analytics/engagement**
- Descripción: Métricas de engagement de todos los classrooms
- Auth: JWT Required (role: teacher)

Query Params:
```typescript
{
  classroom_id?: string;  // Optional filter
}
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    overall_engagement: {
      total_students: number,
      active_students: number,         // Logged in last 7 days
      active_rate: number,              // percentage
      avg_login_frequency: number,     // Logins per week
      avg_time_on_platform: number     // Minutes per week
    },
    by_classroom: {
      classroom_id: string,
      classroom_name: string,
      students_count: number,
      active_students: number,
      engagement_score: number,        // 0-100
      avg_time_per_student: number     // minutes per week
    }[],
    activity_timeline: {
      date: string,
      logins: number,
      submissions: number,
      time_on_platform: number
    }[],  // Last 30 days
    engagement_alerts: {
      student_id: string,
      student_name: string,
      classroom_id: string,
      alert_type: 'no_login_7days' | 'no_submission_14days' | 'low_time',
      last_activity: string
    }[]
  }
}
```

#### Tareas Backend (2 SP)

1. Engagement Metrics Endpoint (1.5 SP)
   - GET /api/teacher/analytics/engagement
   - Calcular overall_engagement
   - Calcular by_classroom breakdown
   - Calcular engagement_score por estudiante
   - Generar activity_timeline (30 días)
   - Detectar engagement_alerts
   - Cache implementation
   - Tests unitarios

2. Tests (0.5 SP)
   - Tests unitarios: EngagementService (5 tests)
   - Tests de integración: endpoint
   - Tests de engagement_score calculation

### Frontend

#### Componentes

- EngagementMetrics (dashboard)
- OverallEngagementCards
- EngagementByClassroomTable
- ActivityTimelineChart (línea de 30 días)
- EngagementAlertsPanel
- ClassroomFilter

#### Tareas Frontend (1 SP)

1. Engagement Metrics UI (1 SP)
   - Componente EngagementMetrics
   - OverallEngagementCards
   - EngagementByClassroomTable
   - ActivityTimelineChart (línea de actividad)
   - EngagementAlertsPanel (lista de alerts)
   - ClassroomFilter

### Database

- Tablas existentes: `user_activity_logs`, `submissions`, `users`
- Indexes:
  - `idx_activity_user_id`
  - `idx_activity_timestamp`

## Dependencias

- **Requiere:**
  - User Activity Tracking - logs de logins y tiempo en plataforma
  - US-PM-001a (Classroom Management) - classrooms
  - US-PM-002a (Assignment Management) - submissions

- **Relacionada:**
  - US-PM-005a (Classroom Analytics)
  - US-PM-005b (Report Generation)

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Activity tracking no implementado | Media | Alto | Coordinar con equipo de infra, usar mock data para desarrollo |
| Engagement score calculation incorrecta | Media | Medio | Tests con datos reales, validar con profesores |
| Performance con activity_logs grandes | Alta | Medio | Limitar timeline a 30 días, indexes, cache |

## Testing

### Unit Tests
- EngagementService: 5 tests
  - Active students detection (1 test)
  - Engagement score calculation (2 tests)
  - Alert generation (2 tests)

### Integration Tests
- GET /engagement endpoint

### E2E Tests
- Flujo: Login → View engagement metrics → View alerts

## Engagement Score Formula

```typescript
const calculateEngagementScore = (student: Student): number => {
  // Login frequency (30%): logins per week, max 7
  const loginScore = Math.min(student.logins_per_week / 7, 1) * 30;

  // Submission regularity (40%): on-time submissions / total
  const submissionScore = (student.on_time_submissions / student.total_assignments) * 40;

  // Time on platform (30%): avg minutes per week, target 120 min
  const timeScore = Math.min(student.avg_time_per_week / 120, 1) * 30;

  return Math.round(loginScore + submissionScore + timeScore);
};
```

## Wireframe

```
┌────────────────────────────────────────────────────────────┐
│ Engagement Metrics                                          │
├────────────────────────────────────────────────────────────┤
│ Overall Engagement                                          │
│ ┌──────────────┬──────────────┬──────────────┬───────────┐│
│ │ Total        │ Active       │ Active Rate  │ Avg Time  ││
│ │ 87 students  │ 79 students  │ 91%          │ 105 min/w ││
│ └──────────────┴──────────────┴──────────────┴───────────┘│
├────────────────────────────────────────────────────────────┤
│ Activity Timeline (Last 30 Days)                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │  50 ┤                                  ●─●─●           │ │
│ │  40 ┤                        ●─●─●─●─●                │ │
│ │  30 ┤                  ●─●─●                          │ │
│ │  20 ┤            ●─●─●                                │ │
│ │  10 ┤      ●─●─●                                      │ │
│ │   0 ┼─────────────────────────────────────────────────│ │
│ │     Oct 1    Oct 10    Oct 20    Oct 30              │ │
│ └────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│ Engagement Alerts ⚠️                                       │
│ • John Doe (Math 101) - No login for 7 days               │
│ • Jane Smith (Science 201) - No submissions for 14 days   │
│ • Bob Johnson (Math 101) - Low time on platform           │
└────────────────────────────────────────────────────────────┘
```

## Métricas de Éxito

- 1 endpoint funcionando
- Test coverage >80%
- Response time p95 <400ms
- Engagement alerts detectan 100% de casos
- >50% de profesores revisan engagement regularmente

## Notas

- ✅ Archivo modularizado desde US-PM-005-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Métricas de engagement y actividad estudiantil
- 🔗 Complementa con US-PM-005a (Analytics) y US-PM-005b (Reports)
- ⚠️ IMPORTANTE: Depende de user activity tracking system

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
