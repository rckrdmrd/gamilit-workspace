---
id: "RF-LTI-003"
title: "Deep Linking"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "lti"
epic: "EXT-007"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Deep Linking

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-LTI-003 |
| Modulo | lti |
| Prioridad | Alta |
| Status | Partial (Pending) |
| EPIC | EXT-007 |

## Descripcion

El sistema debe implementar LTI Deep Linking para permitir a instructores seleccionar contenido especifico de Gamilit desde el LMS. El instructor navega un picker dentro de Gamilit, selecciona modulos o ejercicios, y el enlace se inserta automaticamente en el curso del LMS.

## Requerimiento Funcional

- **RF-LTI-003.1:** Implementar endpoint de Deep Linking request que lanza el content picker de Gamilit.
- **RF-LTI-003.2:** Content picker con busqueda y filtros para seleccionar modulos y ejercicios.
- **RF-LTI-003.3:** Generar Deep Linking response con content items seleccionados en formato LTI.
- **RF-LTI-003.4:** Soportar seleccion multiple de items en una sola operacion de linking.
- **RF-LTI-003.5:** Preview del contenido seleccionado antes de confirmar el linking.

## Criterios de Aceptacion

- [ ] AC-001: Deep Linking request lanza picker de contenido Gamilit dentro del LMS.
- [ ] AC-002: Content picker muestra modulos y ejercicios con busqueda funcional.
- [ ] AC-003: Deep Linking response genera JWT firmado con content items.
- [ ] AC-004: Items seleccionados aparecen como actividades en el curso del LMS.
- [ ] AC-005: Seleccion multiple de hasta 10 items por operacion.

## Referencias

- **User Story:** US-LTI-003
- **Especificacion:** ET-LTI-003
- **EPIC:** EXT-007
