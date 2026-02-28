---
titulo: "Plan de Desarrollo: EPIC-GAM-F1-ANALYTICS"
tipo: plan
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Plan de Desarrollo: EPIC-GAM-F1-ANALYTICS

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 35
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-ANA-005 | Tracking actividad | 8 | F1-AUTH | Sprint 7 |
| 2 | US-ANA-001 | Dashboard clase basico | 5 | US-ANA-005 | Sprint 7 |
| 3 | US-ANA-002 | Tabla estudiantes metricas | 5 | US-ANA-005 | Sprint 8 |
| 4 | US-ANA-003 | Vista estudiante individual | 5 | US-ANA-002 | Sprint 8 |
| 5 | US-ANA-004 | Reporte basico progreso | 5 | US-ANA-003 | Sprint 9 |
| 6 | US-ANA-006 | Identificacion rezagados | 7 | US-ANA-005, US-ANA-003 | Sprint 9 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / React 19 / Recharts
- **Base de datos:** Schema `progress_tracking` (tablas exercise_attempts, module_progress, analytics_snapshots)
- **Patron:** Materialized views para metricas agregadas, CQRS para lecturas pesadas

## Estrategia de Testing
- **Unit:** analytics-aggregator, progress-calculator (Jest)
- **Integration:** /api/v1/analytics/*, /api/v1/progress/* (supertest)
- **E2E:** Verificar dashboard muestra datos correctos post-ejercicio (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Performance con muchos registros | Alta | Alto | Materialized views, refresh programado |
| Datos inconsistentes entre vistas | Media | Medio | Refresh cascading, validacion cruzada |
| Identificacion falsos positivos (rezagados) | Media | Alto | Algoritmo con ventana temporal, umbral configurable |

---

*Generado: 2026-02-10 | ADR-0020*
