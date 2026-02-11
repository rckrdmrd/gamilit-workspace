---
id: "RF-REP-002"
title: "Analytics Admin"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "reports"
epic: "EXT-005"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Analytics Admin

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-REP-002 |
| Modulo | reports |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-005 |

## Descripcion

El sistema debe proporcionar analiticas de nivel administrativo con vision global de la plataforma: metricas de uso, crecimiento, retencion, engagement y rendimiento academico agregado por organizacion. Incluye reportes programados y alertas automaticas por umbrales.

## Requerimiento Funcional

- **RF-REP-002.1:** Dashboard administrativo con KPIs globales: DAU, WAU, MAU, churn rate, NPS.
- **RF-REP-002.2:** Metricas de crecimiento: registros por periodo, tasa de activacion, conversion.
- **RF-REP-002.3:** Reportes de rendimiento academico agregados por organizacion y periodo.
- **RF-REP-002.4:** Reportes programados enviados por email a administradores (semanal, mensual).
- **RF-REP-002.5:** Alertas automaticas cuando KPIs caen por debajo de umbrales configurados.

## Criterios de Aceptacion

- [x] AC-001: Dashboard admin muestra al menos 10 KPIs globales.
- [x] AC-002: Graficos de tendencia con datos de al menos 90 dias.
- [x] AC-003: Reportes programados generados y enviados en horario configurado.
- [x] AC-004: Alertas disparadas correctamente al cruzar umbrales.

## Referencias

- **User Story:** US-REP-002
- **Especificacion:** ET-REP-002
- **EPIC:** EXT-005
