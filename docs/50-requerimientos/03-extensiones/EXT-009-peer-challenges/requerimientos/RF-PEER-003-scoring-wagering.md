---
id: "RF-PEER-003"
title: "Scoring y Wagering"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "peer_challenges"
epic: "EXT-009"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Scoring y Wagering

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PEER-003 |
| Modulo | peer_challenges |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-009 |

## Descripcion

El sistema debe gestionar el sistema de puntuacion y apuestas de challenges: reserva de ML Coins al crear/aceptar, distribucion de premio al ganador, penalizacion por abandono, y registro de historial de challenges con estadisticas. Incluye leaderboard de challenges.

## Requerimiento Funcional

- **RF-PEER-003.1:** Reservar ML Coins de ambos participantes al inicio del challenge (escrow).
- **RF-PEER-003.2:** Distribuir premio al ganador: monto apostado por ambos menos comision del sistema (5%).
- **RF-PEER-003.3:** Devolver apuesta en caso de empate sin penalizacion.
- **RF-PEER-003.4:** Penalizar abandono: jugador que abandona pierde su apuesta automaticamente.
- **RF-PEER-003.5:** Leaderboard de challenges: ranking por victorias, racha, y balance neto de ML Coins.

## Criterios de Aceptacion

- [x] AC-001: ML Coins reservados al crear y aceptar challenge (no disponibles durante el juego).
- [x] AC-002: Ganador recibe premio neto (apuesta x 2 - comision 5%).
- [x] AC-003: Empate devuelve apuesta integra a ambos participantes.
- [x] AC-004: Abandono transfiere apuesta al oponente automaticamente.
- [x] AC-005: Leaderboard de challenges accesible con filtros por periodo.

## Referencias

- **User Story:** US-PEER-003
- **Especificacion:** ET-PEER-003
- **EPIC:** EXT-009
