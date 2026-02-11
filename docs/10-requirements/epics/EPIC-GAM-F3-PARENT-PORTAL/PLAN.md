# Plan de Desarrollo: EPIC-GAM-F3-PARENT-PORTAL

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 20
**Estado:** Backlog (35% implementado)

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-PP-001 | Data Model & Relations | 7 | F1-AUTH | Sprint 20 |
| 2 | US-PP-002 | Portal UI Dashboard | 8 | US-PP-001 | Sprint 20 |
| 3 | US-PP-003 | Notificaciones Padres | 3 | US-PP-002, F3-NOTIFICATIONS | Sprint 21 |
| 4 | US-PP-004 | Reportes para Padres | 3 | US-PP-002, F3-REPORTS | Sprint 21 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 16 / React 19 / Vite 7.x
- **Base de datos:** Schema `auth_management` (tablas parent_accounts, parent_student_links)
- **Patron:** Portal separado con acceso via codigo, dashboard read-only de progreso

## Estrategia de Testing
- **Unit:** parent-account.service, parent-link.service (Jest)
- **Integration:** /api/v1/parents/*, /api/v1/parents/dashboard/* (supertest)
- **E2E:** Login padre con codigo, ver dashboard progreso hijo, recibir notificacion (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Vinculacion padre-hijo incorrecta | Media | Alto | Verificacion por institucion, codigo unico |
| Privacidad datos menores (COPPA) | Alta | Alto | Consentimiento previo, datos minimos |
| Baja adopcion de padres | Alta | Medio | Onboarding simple, codigo QR, push email |

---

*Generado: 2026-02-10 | ADR-0020*
