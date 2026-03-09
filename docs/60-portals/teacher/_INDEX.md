---
titulo: "Portal Maestro — Indice"
tipo: indice
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-03-03"
estado: activo
---

# Portal Maestro — Indice

> Documentacion del portal de maestro de GAMILIT. Cubre gestion de aulas, asignaciones, revision manual de ejercicios M3-M5, analitica docente y flujos de integracion backend-frontend.

## Archivos

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `PORTAL-TEACHER-GUIDE.md` | Guia principal — arquitectura, 16 paginas del portal, gestion de aulas, analitica, gamificacion docente (v3.3.0) | Actualizado 2026-03-03 |
| `PORTAL-TEACHER-API-REFERENCE.md` | Referencia de endpoints — 63+ endpoints en 10 controladores, 8 conectados al frontend (v1.3.0) | Actualizado 2026-02-27 |
| `PORTAL-TEACHER-FLOWS.md` | Flujos de datos e integracion — diagramas de flujo Dashboard Load, revision manual M3-M5, alertas de intervencion | Actualizado 2026-02-27 |

## Controladores Backend del Portal

| Controlador | Ruta Base | Descripcion |
|-------------|-----------|-------------|
| `TeacherController` | `/teacher` | Dashboard, progreso, analitica, calificacion |
| `TeacherClassroomsController` | `/teacher/classrooms` | CRUD de aulas y estudiantes |
| `TeacherAssignmentsController` | `/teacher/assignments` | Gestion de asignaciones |
| `InterventionAlertsController` | `/teacher/alerts` | Alertas de intervencion estudiantil |
| `AlertConfigController` | `/teacher/alert-config` | Configuracion de umbrales de alertas |

## Referencias Cruzadas

- Epic de origen: `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/`
- Backend module: `apps/backend/src/modules/teacher/`
- Frontend pages: `apps/frontend/src/apps/teacher/`
- API docs global: `docs/40-api/API-REFERENCE.md`
- Flujos UX/UI: `docs/30-ux-ui/flujos/teacher/FLUJO-REVISION-MANUAL-M3-M5.md`
- Trazabilidad: `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
- Inventarios SSOT: `orchestration/inventarios/BACKEND_INVENTORY.yml`

## Estado del Portal

- Completitud: ~95%
- Paginas implementadas: 16
- Endpoints backend: 63+ (8 controladores conectados al frontend, 2 desconectados en v3.1.0)
- Revision manual M3-M5: implementada y documentada en PORTAL-TEACHER-FLOWS.md
- Cumplimiento estandares responsive: 95% (remediacion 2026-03-03: 16 paginas, 21 componentes, 4 modales)
