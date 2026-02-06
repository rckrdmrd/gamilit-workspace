---
id: "RF-LTI-002"
title: "Grade Passback"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "lti"
epic: "EXT-007"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Grade Passback

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-LTI-002 |
| Modulo | lti |
| Prioridad | Alta |
| Status | Partial (50%) |
| EPIC | EXT-007 |

## Descripcion

El sistema debe implementar LTI Assignment and Grade Services (AGS) para enviar calificaciones de vuelta al LMS de origen. Cuando un estudiante completa un ejercicio o modulo en Gamilit, la calificacion se sincroniza automaticamente con el gradebook del LMS.

## Requerimiento Funcional

- **RF-LTI-002.1:** Implementar cliente AGS (Assignment and Grade Services) para LTI 1.3.
- **RF-LTI-002.2:** Enviar calificacion al LMS al completar ejercicio con score y timestamp.
- **RF-LTI-002.3:** Soportar multiples line items por actividad (calificacion parcial y final).
- **RF-LTI-002.4:** Reintentar envio de calificacion en caso de fallo de comunicacion con el LMS.
- **RF-LTI-002.5:** Log de sincronizacion de calificaciones con estado por cada envio.

## Criterios de Aceptacion

- [x] AC-001: Calificacion enviada automaticamente al LMS tras completar ejercicio.
- [x] AC-002: Score normalizado a escala del LMS (0.0 - 1.0).
- [ ] AC-003: Reintento automatico con backoff exponencial (max 3 intentos).
- [ ] AC-004: Log de sincronizacion con detalle de exito/fallo por calificacion.
- [ ] AC-005: Multiples line items soportados para modulos con varios ejercicios.

## Referencias

- **User Story:** US-LTI-002
- **Especificacion:** ET-LTI-002
- **EPIC:** EXT-007
