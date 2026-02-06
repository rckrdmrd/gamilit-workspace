---
id: "RF-AE-014"
title: "Analytics Dashboard"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_analytics"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Analytics Dashboard

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-014 |
| Modulo | admin_analytics |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe proporcionar un dashboard de analiticas avanzadas para administradores con graficos de tendencias, metricas de engagement, tasas de retencion y KPIs del sistema. Consume vistas materializadas y datos agregados para visualizacion en tiempo real con filtros por periodo y organizacion.

## Requerimiento Funcional

- **RF-AE-014.1:** Mostrar tendencias de usuarios (registros, logins, usuarios activos) en graficos de linea por periodo.
- **RF-AE-014.2:** Calcular y mostrar metricas de engagement: DAU, WAU, MAU, session duration promedio.
- **RF-AE-014.3:** Mostrar KPIs de gamificacion: XP promedio, ML Coins en circulacion, logros desbloqueados.
- **RF-AE-014.4:** Filtrar analiticas por organizacion, rol de usuario y rango de fechas.
- **RF-AE-014.5:** Consumir vistas user_stats_summary y organization_stats_summary para datos agregados.

## Criterios de Aceptacion

- [x] AC-001: Dashboard muestra al menos 8 metricas clave con tendencias.
- [x] AC-002: Filtros por periodo (diario, semanal, mensual) funcionales.
- [x] AC-003: Datos de engagement calculados a partir de activity_log.
- [x] AC-004: Graficos renderizados con datos reales del sistema.

## Referencias

- **User Story:** US-AE-014
- **Especificacion:** ET-ADM-010-analytics
- **EPIC:** EXT-002
