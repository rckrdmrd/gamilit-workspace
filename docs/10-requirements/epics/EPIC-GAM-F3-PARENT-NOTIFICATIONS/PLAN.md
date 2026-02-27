# Plan de Desarrollo: EPIC-GAM-F3-PARENT-NOTIFICATIONS

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 15
**Estado:** Backlog (35% implementado)

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-PARENT-001 | Weekly Progress Report Email | 5 | F3-NOTIFICATIONS, F3-PARENT-PORTAL | Sprint 21 |
| 2 | US-PARENT-002 | Low Performance Alert | 5 | US-PARENT-001, F1-ANALYTICS | Sprint 21 |
| 3 | US-PARENT-003 | Achievement Unlock Notification | 5 | US-PARENT-001, F1-GAMIFICATION | Sprint 22 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / Nodemailer / SendGrid
- **Base de datos:** Schema `notifications` (tabla parent_notifications, parent_accounts)
- **Patron:** Cron jobs semanales, alert triggers por umbral, email templates responsivos

## Estrategia de Testing
- **Unit:** weekly-report-generator, alert-trigger, email-template-renderer (Jest)
- **Integration:** /api/v1/parents/notifications/* (supertest)
- **E2E:** Ejecutar cron, verificar email enviado con datos correctos (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Email spam perception | Media | Alto | Unsubscribe facil, frecuencia configurable |
| Alertas de bajo rendimiento sensibles | Alta | Alto | Tono positivo, incluir recomendaciones |
| Email deliverability | Media | Medio | SPF/DKIM, dominio verificado, throttling |

---

*Generado: 2026-02-10 | ADR-0020*
