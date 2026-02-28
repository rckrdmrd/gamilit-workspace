---
titulo: Guía de Desarrollo - Portal Admin
tipo: portal
portal: admin
ultima_actualizacion: 2026-02-28
---

# Guía de Desarrollo - Portal Admin

**Fecha de creación:** 2025-11-29
**Versión:** 2.0.0
**Estado:** VIGENTE
**Aplica a:** apps/frontend/src/apps/admin/ + apps/backend/src/modules/admin/

---

El Portal Admin es la interfaz principal para administradores del sistema GAMILIT. Proporciona herramientas para gestión de usuarios, organizaciones, contenido, gamificación, monitoreo y analytics. Requiere rol `admin` o `super_admin`.

**Stack:** NestJS 11 (backend) + React 19 + Zustand + React Query (frontend) + PostgreSQL 15

---

## Contenido

| Archivo | Descripción |
|---------|-------------|
| [admin-guide/01-ARQUITECTURA.md](admin-guide/01-ARQUITECTURA.md) | Visión general, estructura de carpetas (frontend + backend), diagramas de dependencias y flujo de datos, 12 módulos principales con endpoints y DTOs |
| [admin-guide/02-PATRONES-ESTADO.md](admin-guide/02-PATRONES-ESTADO.md) | Patrones de diseño frontend/backend (Page+Hook, AdminPageShell, Bulk Ops, Modal), rutas, tabla completa de endpoints, API services, Zustand y React Query |
| [admin-guide/03-SEGURIDAD-FLUJOS.md](admin-guide/03-SEGURIDAD-FLUJOS.md) | Autorización (JwtAuthGuard + AdminGuard), reglas de acceso, audit logging, rate limiting, 6 flujos detallados paso a paso, ejemplos de código completos |
| [admin-guide/04-CALIDAD.md](admin-guide/04-CALIDAD.md) | Tests unitarios backend/frontend, E2E tests, buenas prácticas, troubleshooting, checklist de desarrollo, referencias y ADRs, changelog |

---

## Referencia rápida

**19 páginas:** Dashboard, Users, Institutions, Roles, Content, Gamification, Settings, Monitoring, Alerts, Analytics, Reports, Progress, ClassroomTeacher, Advanced, Notifications, NotificationPreferences, AuditLogs, Assignments, ExerciseCreate

**124 componentes** | **31 hooks** | **21 controllers** | **15 services**

**Guard:** Todos los endpoints usan `@UseGuards(JwtAuthGuard, AdminGuard)`

**API service:** `apps/frontend/src/services/api/adminAPI.ts` (archivo único monolítico)

---

## Changelog (última entrada)

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 2.0.0 | 2026-02-18 | Sprint 0+1+2 Admin Portal Refactor: 14→19 pages, +30 componentes, +12 hooks, AdminPageShell y AdminTabBar patterns, corrección API monolítica |
| 1.0.0 | 2025-11-29 | Creación inicial |

Ver historial completo en [admin-guide/04-CALIDAD.md](admin-guide/04-CALIDAD.md#changelog)
