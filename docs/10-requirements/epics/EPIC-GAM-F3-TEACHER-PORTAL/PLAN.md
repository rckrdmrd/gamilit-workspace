# Plan de Desarrollo: EPIC-GAM-F3-TEACHER-PORTAL

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 66
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-PM-000 | Dashboard Maestro Base | 8 | F1-ADMIN | Sprint 13 |
| 2 | US-PM-001a | Classroom CRUD | 3 | US-PM-000 | Sprint 13 |
| 3 | US-PM-001b | Student Enrollment | 3 | US-PM-001a | Sprint 13 |
| 4 | US-PM-002a | Assignment CRUD | 5 | US-PM-001a | Sprint 14 |
| 5 | US-PM-002b | Assignment Distribution | 3 | US-PM-002a | Sprint 14 |
| 6 | US-PM-002c | Submissions View | 3 | US-PM-002b | Sprint 14 |
| 7 | US-PM-003a | Grading Queue | 3 | US-PM-002c | Sprint 15 |
| 8 | US-PM-003b | Grading Interface | 5 | US-PM-003a | Sprint 15 |
| 9 | US-PM-004a | Progress Analytics | 3 | US-PM-000, F1-ANALYTICS | Sprint 15 |
| 10 | US-PM-004b | Teacher Notes | 3 | US-PM-004a | Sprint 15 |
| 11 | US-PM-005a | Classroom Analytics | 3 | US-PM-004a | Sprint 16 |
| 12 | US-PM-005b | Report Generation | 3 | US-PM-005a | Sprint 16 |
| 13 | US-PM-005c | Engagement Metrics | 3 | US-PM-005a | Sprint 16 |
| 14 | US-PM-006 | Bloquear Alumnos Maestro | 3 | US-PM-001b | Sprint 16 |
| 15 | US-PM-007 | Alert Configuration | 3 | US-PM-004a | Sprint 17 |
| 16 | US-PM-008 | Gamification Management | 3 | F1-GAMIFICATION | Sprint 17 |
| 17 | US-PM-009 | Resources Management | 3 | US-PM-002a | Sprint 17 |
| 18 | US-PM-010 | Communication Center | 3 | -- | Sprint 17 |
| 19 | US-PM-011 | Teacher Settings | 3 | US-PM-000 | Sprint 18 |
| 20 | US-PM-012 | Notifications Center | 3 | F3-NOTIFICATIONS | Sprint 18 |
| 21 | US-PM-013 | Notification Preferences | 3 | US-PM-012 | Sprint 18 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / React 19 / Socket.IO 4.8+
- **Base de datos:** Schemas `educational_content`, `progress_tracking` (19 paginas, 21 US)
- **Patron:** Portal SPA con dashboard, RBAC role=teacher, real-time con WebSocket

## Estrategia de Testing
- **Unit:** assignments.service, grading.service, teacher-analytics (Jest)
- **Integration:** /api/v1/teacher/*, /api/v1/assignments/* (supertest)
- **E2E:** Flujo completo: crear aula, asignar, calificar, generar reporte (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Complejidad de 21 US | Alta | Alto | Sprints incrementales, entregas parciales |
| Calificacion manual lenta | Media | Medio | Batch grading, keyboard shortcuts |
| Analytics real-time performance | Media | Alto | WebSocket throttling, materialized views |

---

*Generado: 2026-02-10 | ADR-0020*
