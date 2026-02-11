---
id: "RF-PEER-001"
title: "Challenge Creation"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "peer_challenges"
epic: "EXT-009"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Challenge Creation

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PEER-001 |
| Modulo | peer_challenges |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-009 |

## Descripcion

El sistema debe permitir a los estudiantes crear desafios (challenges) para retar a otros estudiantes en competencias de ejercicios. El creador selecciona tipo de ejercicio, dificultad, tiempo limite y apuesta de ML Coins. Los desafios pueden ser directos (a un amigo) o abiertos (cualquiera puede aceptar).

## Requerimiento Funcional

- **RF-PEER-001.1:** Crear challenge seleccionando categoria de ejercicio, nivel de dificultad y cantidad de preguntas.
- **RF-PEER-001.2:** Configurar apuesta de ML Coins (minimo 10, maximo 500) y tiempo limite (1-30 minutos).
- **RF-PEER-001.3:** Enviar challenge directo a un amigo especifico con notificacion.
- **RF-PEER-001.4:** Publicar challenge abierto visible para todos los estudiantes del mismo nivel o aula.
- **RF-PEER-001.5:** Validar que el creador tiene suficientes ML Coins para la apuesta.

## Criterios de Aceptacion

- [x] AC-001: Formulario de creacion con seleccion de categoria, dificultad y parametros.
- [x] AC-002: Validacion de balance de ML Coins antes de confirmar apuesta.
- [x] AC-003: Challenge directo genera notificacion al retado.
- [x] AC-004: Challenge abierto visible en listado publico filtrable.
- [x] AC-005: Challenges creados registrados en tabla peer_challenges con estado pending.

## Referencias

- **User Story:** US-PEER-001
- **Especificacion:** ET-PEER-001
- **EPIC:** EXT-009
