# Plan de Desarrollo: EPIC-GAM-F1-PORTAL-ADMIN

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 40
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | Modulo | Descripcion | Dependencias | Sprint |
|-------|--------|-------------|-------------|--------|
| 1 | Alertas | Sistema FSM con 7 endpoints, gestion de alertas del sistema | EPIC-GAM-F1-ADMIN, EPIC-GAM-F1-ANALYTICS | S1 |
| 2 | Analiticas | 4 tabs con 7 graficos, metricas globales de plataforma | Alertas (parcial) | S1-S2 |
| 3 | Progreso | 3 vistas con drill-down y exportacion CSV | Analiticas | S2-S3 |
| 4 | Monitoreo | 4 tabs con auto-refresh, salud del sistema | Alertas | S3 |

## Notas

Esta epica no tiene User Stories formales migradas. El contenido detallado legacy se encuentra en archivados/modulos-legacy/ del workspace v2. Solo el archivo TRACEABILITY.yml fue migrado como contenido activo.

## Enfoque Tecnico
- **Stack:** NestJS + TypeScript + PostgreSQL + React/Next.js
- **Base de datos:** Schema `gamilit` (tablas admin_alerts, admin_analytics, admin_monitoring)
- **Patron:** Modular architecture, RBAC-based admin portal
- **FSM:** Finite State Machine para ciclo de vida de alertas

## Estrategia de Testing
- **Unit:** AlertService, AnalyticsService, MonitoringService (Jest)
- **Integration:** Admin portal API endpoints (supertest)
- **E2E:** Portal admin flows completos (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Complejidad permisos granulares | Media | Alto | Reutilizar RBAC de F1-AUTH |
| Performance con dashboards pesados | Baja | Medio | Caching + lazy loading |
| Dependencia circular alertas-monitoreo | Baja | Alto | Interfaces desacopladas, eventos asincronos |

---

*Generado: 2026-02-10 | ADR-0020*
