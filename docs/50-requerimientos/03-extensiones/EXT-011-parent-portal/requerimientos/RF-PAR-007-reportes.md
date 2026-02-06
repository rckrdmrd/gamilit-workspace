---
id: "RF-PAR-007"
title: "Reportes Portal Padres"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "parent_portal"
epic: "EXT-011"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Reportes Portal Padres

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PAR-007 |
| Modulo | parent_portal |
| Prioridad | Alta |
| Status | Partial (Pending) |
| EPIC | EXT-011 |

## Descripcion

El sistema debe proporcionar reportes detallados de progreso para padres: reporte semanal interactivo (complementa el email de EXT-010), historico mensual con tendencias, comparativa con promedios del aula (anonimizados) y exportacion en PDF. Los reportes son de solo lectura.

## Requerimiento Funcional

- **RF-PAR-007.1:** Reporte semanal interactivo con drill-down por materia y tipo de ejercicio.
- **RF-PAR-007.2:** Reporte historico mensual con graficos de tendencia y comparativa mes a mes.
- **RF-PAR-007.3:** Comparativa anonimizada con promedios del aula (percentil del hijo).
- **RF-PAR-007.4:** Exportar reportes en PDF con branding de la organizacion.
- **RF-PAR-007.5:** Historial de reportes accesible con filtro por periodo y tipo.

## Criterios de Aceptacion

- [ ] AC-001: Reporte semanal interactivo con datos reales del hijo.
- [ ] AC-002: Graficos de tendencia mensual renderizados correctamente.
- [ ] AC-003: Comparativa con promedios de aula sin revelar datos individuales.
- [ ] AC-004: PDF exportado con formato profesional y branding.
- [ ] AC-005: Historial de reportes navegable por los ultimos 12 meses.

## Referencias

- **User Story:** US-PP-004
- **Especificacion:** ET-PARPORT-003
- **EPIC:** EXT-011
