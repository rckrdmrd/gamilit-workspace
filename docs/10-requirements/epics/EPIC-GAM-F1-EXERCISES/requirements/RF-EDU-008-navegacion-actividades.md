---
id: "RF-EDU-008"
title: "Navegacion y Flujo de Actividades"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Contenido Educativo"
epic: "EAI-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Navegacion y Flujo de Actividades

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-EDU-008 |
| Modulo | Contenido Educativo |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-002 |

## Descripcion

El sistema debe permitir navegacion fluida entre las actividades de un modulo educativo, mostrando el progreso del estudiante y guiandolo secuencialmente. La navegacion es lineal: el estudiante debe completar la actividad actual para avanzar a la siguiente, y puede ver el progreso global del modulo.

## Requerimiento Funcional

- **RF-EDU-008.1:** Mostrar barra de progreso con actividades completadas vs total del modulo, indicando visualmente la actividad actual, las completadas, y las pendientes.
- **RF-EDU-008.2:** Implementar navegacion secuencial con boton "Siguiente" que lleva a la siguiente actividad del modulo tras completar la actual. El boton se habilita solo al completar la actividad.
- **RF-EDU-008.3:** Permitir navegacion hacia atras para revisar actividades ya completadas (modo lectura), sin modificar las respuestas ni el progreso registrado.
- **RF-EDU-008.4:** Mostrar pantalla de resumen al completar todas las actividades del modulo, incluyendo puntuacion total, tiempo invertido, y recompensas obtenidas.
- **RF-EDU-008.5:** Persistir el progreso en BD (tabla progress_tracking.exercise_progress) para que el estudiante pueda retomar desde donde dejo si cierra la aplicacion.

## Criterios de Aceptacion

- [ ] AC-001: La barra de progreso refleja correctamente actividades completadas
- [ ] AC-002: El boton "Siguiente" solo se habilita tras completar la actividad actual
- [ ] AC-003: Las actividades completadas se pueden revisar sin modificar progreso
- [ ] AC-004: La pantalla de resumen muestra puntuacion, tiempo y recompensas
- [ ] AC-005: El progreso persiste entre sesiones y se restaura al volver

## Referencias

- **User Story:** US-ACT-008
- **Especificacion:** ET-EDU-008
- **EPIC:** EAI-002
