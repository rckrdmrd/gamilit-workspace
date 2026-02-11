---
id: "RF-EDU-007"
title: "Sistema de Feedback de Ejercicios"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Contenido Educativo"
epic: "EAI-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Sistema de Feedback de Ejercicios

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-EDU-007 |
| Modulo | Contenido Educativo |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-002 |

## Descripcion

El sistema debe proporcionar feedback claro e inmediato al estudiante al responder actividades, permitiendole entender sus aciertos y errores de forma educativa. El feedback es centralizado para todas las mecanicas, con mensajes pre-cargados y explicaciones hardcodeadas. No usa IA para generar feedback personalizado.

## Requerimiento Funcional

- **RF-EDU-007.1:** Mostrar feedback inmediato (<1 segundo) al enviar una respuesta, diferenciando visualmente entre respuesta correcta (animacion positiva, confetti, check verde) e incorrecta (animacion suave, X roja, sin penalizar emocionalmente).
- **RF-EDU-007.2:** Mostrar la explicacion educativa de la respuesta correcta, almacenada en el campo explanation del ejercicio en BD, independientemente de si el estudiante acerto o no.
- **RF-EDU-007.3:** Integrar feedback con el sistema de gamificacion: al responder correctamente mostrar XP ganados, monedas obtenidas, y progreso hacia el siguiente logro.
- **RF-EDU-007.4:** Soportar feedback parcial para mecanicas con puntuacion gradual (ordenamiento, asociacion): indicar cuantos items fueron correctos y cuales necesitan correccion.
- **RF-EDU-007.5:** Implementar sistema de reintentos con feedback mejorado: en el segundo intento mostrar pistas adicionales, en el tercero revelar la respuesta correcta.

## Criterios de Aceptacion

- [ ] AC-001: El feedback aparece en menos de 1 segundo tras enviar respuesta
- [ ] AC-002: Las animaciones de acierto y error son visualmente distintas y apropiadas
- [ ] AC-003: La explicacion educativa se muestra siempre, acierto o error
- [ ] AC-004: Los XP y monedas ganados se muestran integrados en el feedback
- [ ] AC-005: El sistema de reintentos muestra pistas progresivas

## Referencias

- **User Story:** US-ACT-007
- **Especificacion:** ET-EDU-007
- **EPIC:** EAI-002
