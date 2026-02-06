---
id: "RF-PAR-002"
title: "Low Performance Alert"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "parent_notifications"
epic: "EXT-010"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Low Performance Alert

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PAR-002 |
| Modulo | parent_notifications |
| Prioridad | Alta |
| Status | Partial (35%) |
| EPIC | EXT-010 |

## Descripcion

El sistema debe enviar alertas automaticas a los padres cuando el rendimiento del estudiante cae por debajo de umbrales configurables. Las alertas se disparan por calificaciones bajas, inactividad prolongada, perdida de racha significativa o caida en el ranking. Incluye sugerencias de accion.

## Requerimiento Funcional

- **RF-PAR-002.1:** Alerta por calificacion promedio inferior al umbral (default: 60%).
- **RF-PAR-002.2:** Alerta por inactividad del estudiante superior a dias configurados (default: 3 dias).
- **RF-PAR-002.3:** Alerta por perdida de racha de estudio mayor a 7 dias.
- **RF-PAR-002.4:** Configurar umbrales de alerta por organizacion o individualmente por padre.
- **RF-PAR-002.5:** Incluir sugerencias de accion en cada alerta (ej: "Motivar a retomar ejercicios").

## Criterios de Aceptacion

- [x] AC-001: Modelo de datos para umbrales y configuracion de alertas creado.
- [ ] AC-002: Alerta de calificacion baja disparada automaticamente al cruzar umbral.
- [ ] AC-003: Alerta de inactividad enviada tras periodo configurado sin login.
- [ ] AC-004: Sugerencias de accion incluidas en el cuerpo de cada alerta.
- [ ] AC-005: Frecuencia de alertas limitada para evitar spam (max 1 por tipo por semana).

## Referencias

- **User Story:** US-PARENT-002
- **Especificacion:** ET-PARN-001
- **EPIC:** EXT-010
