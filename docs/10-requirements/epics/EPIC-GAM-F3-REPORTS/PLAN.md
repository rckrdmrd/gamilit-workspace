# Plan de Desarrollo: EPIC-GAM-F3-REPORTS

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 50
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-REP-001 | Analytics Profesor | 13 | F1-ANALYTICS, F3-TEACHER-PORTAL | Sprint 17 |
| 2 | US-REP-002 | Analytics Admin | 8 | US-REP-001, F3-ADMIN-EXTENDED | Sprint 17 |
| 3 | US-REP-004 | Data Warehouse ETL | 13 | US-REP-001 | Sprint 18 |
| 4 | US-REP-003 | Analytics Predictivo | 8 | US-REP-004 | Sprint 18 |
| 5 | US-REP-005 | Visualizaciones Avanzadas | 8 | US-REP-003 | Sprint 19 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 16 / React 19 / Recharts / PDFKit
- **Base de datos:** Schema `progress_tracking` + materialized views para ETL
- **Patron:** ETL pipeline, CQRS para lecturas, export multi-formato (PDF, Excel, CSV)

## Estrategia de Testing
- **Unit:** report-generator, etl-pipeline, analytics-predictor (Jest)
- **Integration:** /api/v1/reports/*, /api/v1/analytics/export/* (supertest)
- **E2E:** Generar reporte profesor, exportar PDF, verificar analytics predictivo (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| ETL performance con muchos datos | Alta | Alto | Batch processing, partitioning temporal |
| Prediccion imprecisa | Alta | Medio | Modelo simple inicial, mejorar con datos reales |
| PDF generation lenta | Media | Medio | Queue background, cache de reportes frecuentes |

---

*Generado: 2026-02-10 | ADR-0020*
