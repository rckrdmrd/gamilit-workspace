---
id: "RF-TCH-010"
title: "Centro de Comunicacion Maestro-Estudiante"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Centro de Comunicacion Maestro-Estudiante

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-010 |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe proporcionar un centro de comunicacion que permita al maestro enviar mensajes a estudiantes individuales, grupos o a toda el aula. Incluye anuncios del aula (unidireccionales), mensajes directos (bidireccionales) y comunicaciones asociadas a tareas. Toda comunicacion queda registrada para trazabilidad.

## Requerimiento Funcional

- **RF-TCH-010.1:** El maestro puede publicar anuncios visibles para toda el aula, con opcion de fijar (pin) anuncios importantes en la parte superior.
- **RF-TCH-010.2:** El maestro puede enviar mensajes directos a un estudiante individual, creando una conversacion privada bidireccional.
- **RF-TCH-010.3:** El maestro puede enviar mensajes a un subgrupo de estudiantes seleccionados del aula.
- **RF-TCH-010.4:** Los mensajes pueden incluir archivos adjuntos (hasta 10MB) y formato de texto enriquecido basico (negrita, cursiva, listas).

## Criterios de Aceptacion

- [ ] AC-001: Un anuncio publicado es visible para todos los estudiantes activos del aula inmediatamente.
- [ ] AC-002: Los mensajes directos son visibles solo para el maestro y el estudiante involucrado.
- [ ] AC-003: Los anuncios fijados permanecen en la parte superior de la lista de anuncios.
- [ ] AC-004: Los archivos adjuntos se envian y reciben correctamente en cualquier tipo de mensaje.
- [ ] AC-005: El historial de comunicacion es buscable por texto, fecha y participante.

## Reglas de Negocio

- Los estudiantes bloqueados no pueden enviar ni recibir mensajes directos.
- Los anuncios no permiten respuestas de estudiantes (canal unidireccional).
- Se retiene historial de mensajes durante todo el periodo academico mas 6 meses.

## Dependencias

- Tablas `conversations`, `conversation_participants`, `messages` en esquema `messaging`.
- WebSocket o polling para mensajes en tiempo real.

## Referencias

- **User Story:** US-PM-010
- **Especificacion:** ET-TCH-010
- **EPIC:** EXT-001
