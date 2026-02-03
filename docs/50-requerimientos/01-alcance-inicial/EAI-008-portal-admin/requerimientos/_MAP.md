# Requerimientos Funcionales - EAI-008

**EPIC:** EAI-008 - Portal de Administracion
**Ultima actualizacion:** 2026-01-04

---

## Nota

Esta EPIC fue implementada antes de la estandarizacion SCRUM. Los requerimientos fueron documentados de forma implicita en los implementation reports.

**Documentacion original:** `../archivados/modulos-legacy/`

---

## Indice de Requerimientos

| ID | Titulo | Modulo | Prioridad | Estado |
|----|--------|--------|-----------|--------|
| RF-ADM-001 | Sistema de Alertas Admin | Alertas | Alta | Done |
| RF-ADM-002 | Dashboard Analiticas Interactivo | Analiticas | Alta | Done |
| RF-ADM-003 | Seguimiento de Progreso | Progreso | Alta | Done |
| RF-ADM-004 | Monitoreo en Tiempo Real | Monitoreo | Alta | Done |
| RF-ADM-005 | Gestion Completa de Usuarios | Usuarios | Alta | Done |
| RF-ADM-006 | Gestion de Instituciones | Instituciones | Media | Done |
| RF-ADM-007 | Gestion de Roles y Permisos | Roles | Media | Done |
| RF-ADM-008 | Feature Flags y A/B Testing | Advanced | Baja | Backlog |
| RF-ADM-009 | Configuracion General y Seguridad | Settings | Baja | Backlog |
| RF-ADM-010 | Reportes con Persistencia BD | Reports | Media | Backlog |

---

## Descripcion de Requerimientos

### RF-ADM-001: Sistema de Alertas Admin
- Gestion de alertas del sistema con FSM
- 7 endpoints REST
- UI con filtros, acciones, historial

### RF-ADM-002: Dashboard Analiticas
- 4 tabs: Overview, Engagement, Gamification, Retention
- 7 graficos interactivos (Recharts)
- Exportacion de datos

### RF-ADM-003: Seguimiento de Progreso
- 3 vistas: Overview, Classrooms, Student Detail
- Drill-down de datos
- Export CSV

### RF-ADM-004: Monitoreo Sistema
- 4 tabs: Logs, Metrics, Errors, Alerts
- Auto-refresh configurable
- Filtros avanzados

### RF-ADM-005 a RF-ADM-007
- CRUD completo para entidades administrativas
- Validaciones y permisos por rol

### RF-ADM-008 a RF-ADM-010 (Fase 2 - Backlog)
- Funcionalidades avanzadas pendientes
- Estimacion: 130-180 SP

---

## Documentacion Detallada

Para especificaciones detalladas, consultar:
- `../archivados/modulos-legacy/00-analisis-inicial/PLAN-IMPLEMENTACION-INFRAESTRUCTURA-DB-DISPONIBLE.md`
- `../archivados/modulos-legacy/0X-modulo-*/backend/IMPLEMENTATION-REPORT-*.md`

---

**Nota:** Los RF formales pueden crearse si se requiere ampliar esta EPIC.
