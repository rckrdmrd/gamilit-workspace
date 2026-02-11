---
id: "RF-TCH-007"
title: "Configuracion de Alertas por Umbrales de Rendimiento"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Configuracion de Alertas por Umbrales de Rendimiento

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-007 |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir a los maestros configurar alertas automaticas basadas en umbrales de rendimiento academico y engagement. El maestro define las condiciones que disparan alertas (e.g., promedio por debajo de 60%, sin actividad en 5 dias, tendencia descendente) y el canal de notificacion. Las alertas permiten intervencion temprana con estudiantes en riesgo.

## Requerimiento Funcional

- **RF-TCH-007.1:** El maestro puede crear reglas de alerta definiendo: metrica (promedio, tasa de entrega, engagement, rachas), operador (menor que, mayor que, igual a), umbral y periodo de evaluacion.
- **RF-TCH-007.2:** Las alertas se pueden configurar por aula o de forma global para todas las aulas del maestro.
- **RF-TCH-007.3:** El maestro puede elegir el canal de notificacion para cada alerta: in-app, email, o ambos.
- **RF-TCH-007.4:** El sistema evalua las reglas diariamente y genera alertas cuando se cumplen las condiciones, evitando duplicados en un periodo de 7 dias.

## Criterios de Aceptacion

- [ ] AC-001: El maestro puede crear una regla de alerta con todos los campos y activarla exitosamente.
- [ ] AC-002: La alerta se dispara correctamente cuando un estudiante cumple la condicion configurada.
- [ ] AC-003: No se generan alertas duplicadas para el mismo estudiante y regla dentro de 7 dias.
- [ ] AC-004: Las alertas por email se envian con formato legible y enlace directo al perfil del estudiante.
- [ ] AC-005: El maestro puede desactivar, editar o eliminar reglas de alerta existentes.

## Reglas de Negocio

- El maestro puede tener hasta 10 reglas de alerta activas por aula.
- Las reglas se evaluan sobre datos del periodo academico actual.
- Las alertas incluyen el nombre del estudiante, la metrica y el valor actual.

## Dependencias

- Servicio de evaluacion de reglas (scheduler diario).
- Sistema de notificaciones in-app y email.
- Metricas de analiticas y engagement ya calculadas.

## Referencias

- **User Story:** US-PM-007
- **Especificacion:** ET-TCH-007
- **EPIC:** EXT-001
