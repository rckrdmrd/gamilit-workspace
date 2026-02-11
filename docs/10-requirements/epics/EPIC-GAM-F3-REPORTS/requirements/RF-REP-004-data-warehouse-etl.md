---
id: "RF-REP-004"
title: "Data Warehouse ETL"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "reports"
epic: "EXT-005"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Data Warehouse ETL

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-REP-004 |
| Modulo | reports |
| Prioridad | Alta |
| Status | Partial (30%) |
| EPIC | EXT-005 |

## Descripcion

El sistema debe implementar un pipeline ETL (Extract, Transform, Load) para consolidar datos en un data warehouse orientado a reportes. Las vistas materializadas actuales sirven como base, pero se requiere un schema analytics dedicado con tablas de hechos y dimensiones para consultas complejas.

## Requerimiento Funcional

- **RF-REP-004.1:** Schema analytics con tablas de hechos: fact_activity, fact_progress, fact_gamification.
- **RF-REP-004.2:** Tablas de dimension: dim_time, dim_user, dim_organization, dim_content.
- **RF-REP-004.3:** Pipeline ETL que alimenta el warehouse desde tablas operacionales con refresh periodico.
- **RF-REP-004.4:** Vistas materializadas actualizadas automaticamente por trigger o schedule.
- **RF-REP-004.5:** API de consultas OLAP para reportes complejos con agregaciones multidimensionales.

## Criterios de Aceptacion

- [x] AC-001: Schema analytics creado con tablas de hechos y dimensiones.
- [ ] AC-002: Pipeline ETL ejecuta sin errores y completa en menos de 5 minutos.
- [ ] AC-003: Vistas materializadas actualizadas automaticamente cada hora.
- [ ] AC-004: API OLAP soporta consultas con al menos 3 dimensiones simultaneas.

## Referencias

- **User Story:** US-REP-004
- **Especificacion:** ET-REP-002
- **EPIC:** EXT-005
