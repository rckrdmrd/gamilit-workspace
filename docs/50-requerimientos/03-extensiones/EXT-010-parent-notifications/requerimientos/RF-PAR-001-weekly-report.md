---
id: "RF-PAR-001"
title: "Weekly Report"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "parent_notifications"
epic: "EXT-010"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Weekly Report

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PAR-001 |
| Modulo | parent_notifications |
| Prioridad | Alta |
| Status | Partial (40%) |
| EPIC | EXT-010 |

## Descripcion

El sistema debe generar y enviar reportes semanales automaticos a los padres de familia con un resumen del progreso academico y de gamificacion de sus hijos. El reporte incluye actividades completadas, calificaciones, racha de estudio, logros desbloqueados y comparativa con la semana anterior.

## Requerimiento Funcional

- **RF-PAR-001.1:** Generar reporte semanal automatico con metricas de progreso del estudiante.
- **RF-PAR-001.2:** Incluir: ejercicios completados, calificacion promedio, tiempo de estudio, racha y XP ganado.
- **RF-PAR-001.3:** Comparativa con semana anterior: mejora/deterioro en cada metrica con indicador visual.
- **RF-PAR-001.4:** Enviar por email en formato HTML responsive y opcionalmente como PDF adjunto.
- **RF-PAR-001.5:** Configurar dia y hora de envio del reporte semanal por organizacion.

## Criterios de Aceptacion

- [x] AC-001: Schema de parent_student_link creado con relacion padre-hijo verificada.
- [x] AC-002: Datos de progreso semanal recopilados correctamente.
- [ ] AC-003: Email HTML renderizado correctamente en clientes de correo principales.
- [ ] AC-004: Comparativa semanal calculada con indicadores de mejora/deterioro.
- [ ] AC-005: Envio programado ejecutado en dia y hora configurados.

## Referencias

- **User Story:** US-PARENT-001
- **Especificacion:** ET-PARN-001
- **EPIC:** EXT-010
