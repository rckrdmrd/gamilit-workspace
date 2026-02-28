---
titulo: Portal Teacher - API Reference
tipo: portal
portal: teacher
ultima_actualizacion: 2026-02-27
---

# Portal Teacher - API Reference

**Fecha de creacion:** 2025-11-29
**Version:** 1.3.0
**Estado:** VIGENTE
**Complementa:** PORTAL-TEACHER-GUIDE.md

> Este archivo es un hub de navegacion. El contenido detallado esta dividido en archivos especializados bajo `teacher-api-reference/`.

---

## Contenido

| Archivo | Secciones | Descripcion |
|---------|-----------|-------------|
| [01-DASHBOARD.md](teacher-api-reference/01-DASHBOARD.md) | 1-2 | Resumen de endpoints (63+) + Dashboard APIs (stats, activities, alerts, top-performers) |
| [02-CLASSROOMS.md](teacher-api-reference/02-CLASSROOMS.md) | 3 | Classrooms APIs — lista, crea, estudiantes, progreso por modulo |
| [03-PROGRESS-GRADING.md](teacher-api-reference/03-PROGRESS-GRADING.md) | 4-5 | Student Progress APIs + Grading APIs (submissions, feedback, bulk-grade) |
| [04-COMMUNICATION.md](teacher-api-reference/04-COMMUNICATION.md) | 7-8, 10 | Intervention Alerts + Bonus Coins + Resource Sharing (6 endpoints) |
| [05-ANALYTICS-REPORTS.md](teacher-api-reference/05-ANALYTICS-REPORTS.md) | 6, 9 | Analytics APIs (classroom, economy, achievements) + Reports PDF/Excel |
| [06-INFRASTRUCTURE.md](teacher-api-reference/06-INFRASTRUCTURE.md) | 11-13 + Changelog | Error Handling + Rate Limiting + Websocket Events + Changelog |

---

## Resumen Rapido

**63+ endpoints** en 10 controladores. Frontend conectado a 8 de ellos.

| Controller | Base Path | Frontend |
|------------|-----------|----------|
| TeacherController | `/teacher` | Si |
| TeacherClassroomsController | `/teacher/classrooms` | Si |
| TeacherAssignmentsController | `/teacher/assignments` | Si |
| InterventionAlertsController | `/teacher/alerts` | Si |
| AlertConfigController | `/teacher/alert-config` | Si |
| ManualReviewController | `/teacher/reviews` | Si |
| TeacherCommunicationController | `/teacher/messages` | No (removed v3.1.0) |
| TeacherContentController | `/teacher/content` | Parcial (solo resource sharing) |
| ExerciseResponsesController | `/teacher/exercise-responses` | Si |
| TeacherGradesController | `/teacher/grades` | Si |

---

## Index

Ver: [teacher-api-reference/_INDEX.md](teacher-api-reference/_INDEX.md)
