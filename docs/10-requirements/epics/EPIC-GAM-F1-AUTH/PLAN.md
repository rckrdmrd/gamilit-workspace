---
titulo: "Plan de Desarrollo: EPIC-GAM-F1-AUTH"
tipo: plan
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Plan de Desarrollo: EPIC-GAM-F1-AUTH

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 60
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-FUND-004 | Infraestructura Tecnica Base | 13 | -- | Sprint 1 |
| 2 | US-FUND-001 | Autenticacion Basica JWT | 8 | US-FUND-004 | Sprint 1 |
| 3 | US-FUND-002 | Perfiles Usuario Basicos | 8 | US-FUND-001 | Sprint 2 |
| 4 | US-FUND-005 | Sistema Sesiones Estado | 5 | US-FUND-001 | Sprint 2 |
| 5 | US-FUND-006 | API RESTful Basica | 8 | US-FUND-004 | Sprint 2 |
| 6 | US-FUND-008 | UI/UX Base | 5 | US-FUND-004 | Sprint 3 |
| 7 | US-FUND-007 | Navegacion Routing | 5 | US-FUND-008 | Sprint 3 |
| 8 | US-FUND-003 | Dashboard Principal Estudiante | 8 | US-FUND-007, US-FUND-002 | Sprint 3 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / React 19 / Vite 6.x
- **Base de datos:** Schema `auth_management` (tablas users, roles, sessions, tenants)
- **Patron:** JWT + Passport + RBAC, multi-tenant con RLS

## Estrategia de Testing
- **Unit:** auth.service, users.service, sessions.service (Jest)
- **Integration:** /api/v1/auth/*, /api/v1/users/* (supertest)
- **E2E:** Login flow, registro, refresh token (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Complejidad RBAC multi-tenant | Media | Alto | Definir roles y permisos antes de implementar |
| Token security vulnerabilities | Baja | Alto | Usar httpOnly cookies, refresh rotation |
| Performance con RLS | Media | Medio | Indices en tenant_id, testing carga |

---

*Generado: 2026-02-10 | ADR-0020*
