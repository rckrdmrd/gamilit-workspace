# Plan de Desarrollo: EPIC-GAM-F3-ADMIN-EXTENDED

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 114
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-AE-000 | Admin Dashboard | 8 | F1-AUTH, F1-ANALYTICS | Sprint 13 |
| 2 | US-AE-001 | User Management Avanzado | 20 | US-AE-000 | Sprint 13 |
| 3 | US-AE-002 | Gestion Organizaciones | 18 | US-AE-001 | Sprint 14 |
| 4 | US-AE-003 | Content Management | 16 | US-AE-000 | Sprint 14 |
| 5 | US-AE-004 | System Monitoring | 16 | US-AE-000 | Sprint 15 |
| 6 | US-AE-005 | Parametrizacion Gamificacion | 12 | US-AE-000, F1-GAMIFICATION | Sprint 15 |
| 7 | US-AE-006 | Admin Reports | 10 | US-AE-004 | Sprint 16 |
| 8 | US-AE-007 | Asignar Grupos a Maestros | 6 | US-AE-002, F1-ADMIN | Sprint 16 |
| 9 | US-AE-008 | System Settings | 8 | US-AE-000 | Sprint 16 |
| 10 | US-AE-009 | Admin Assignments View | 5 | US-AE-000 | Sprint 17 |
| 11 | US-AE-010 | Create Users | 5 | US-AE-001 | Sprint 17 |
| 12 | US-AE-011 | Audit Logs Viewer | 5 | US-AE-004 | Sprint 17 |
| 13 | US-AE-012 | Roles Management | 5 | US-AE-001 | Sprint 17 |
| 14 | US-AE-013 | Alerts Management | 3 | US-AE-004 | Sprint 18 |
| 15 | US-AE-014 | Analytics Dashboard | 5 | US-AE-006, F1-ANALYTICS | Sprint 18 |
| 16 | US-AE-015 | Progress Tracking | 5 | US-AE-014 | Sprint 18 |
| 17 | US-AE-016 | Advanced Admin Tools | 5 | US-AE-002 | Sprint 19 |
| 18 | US-AE-017 | Notifications Management | 3 | F3-NOTIFICATIONS | Sprint 19 |
| 19 | US-AE-018 | Notification Preferences | 3 | US-AE-017 | Sprint 19 |
| 20 | US-EXT-002 | Sprints Implementados (tracking) | -- | -- | -- |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 16 / React 19 / Vite 7.x
- **Base de datos:** Schemas multiples (auth_management, system_configuration, progress_tracking)
- **Patron:** Admin SPA con 18+ paginas, RBAC role=admin, bulk operations, export (PDF/CSV/Excel)

## Estrategia de Testing
- **Unit:** admin services (users, orgs, content, monitoring, reports) (Jest)
- **Integration:** /api/v1/admin/* (43+ endpoints) (supertest)
- **E2E:** CRUD usuarios, configurar gamificacion, generar reportes, audit logs (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Scope creep (114 SP, 20 US) | Alta | Alto | Priorizar P0/P1, diferir P2 |
| Permisos admin demasiado amplios | Media | Alto | Audit logging, principle of least privilege |
| Export de datos masivos | Media | Medio | Streaming, background jobs, limites |

---

*Generado: 2026-02-10 | ADR-0020*
