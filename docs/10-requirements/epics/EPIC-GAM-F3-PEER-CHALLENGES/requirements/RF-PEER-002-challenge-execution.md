---
id: "RF-PEER-002"
title: "Challenge Execution"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "peer_challenges"
epic: "EXT-009"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Challenge Execution

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PEER-002 |
| Modulo | peer_challenges |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-009 |

## Descripcion

El sistema debe gestionar la ejecucion de challenges aceptados: ambos participantes responden el mismo set de ejercicios bajo las mismas condiciones. El sistema sincroniza inicio, controla tiempo, valida respuestas y determina ganador basado en puntuacion y velocidad.

## Requerimiento Funcional

- **RF-PEER-002.1:** Aceptar challenge con validacion de balance de ML Coins del aceptante.
- **RF-PEER-002.2:** Sincronizar inicio del challenge: ambos participantes empiezan al mismo tiempo.
- **RF-PEER-002.3:** Generar set identico de ejercicios aleatorios segun parametros del challenge.
- **RF-PEER-002.4:** Controlar tiempo limite con countdown visible y finalizacion automatica.
- **RF-PEER-002.5:** Calcular resultado: puntuacion (respuestas correctas) y desempate por velocidad.

## Criterios de Aceptacion

- [x] AC-001: Ambos participantes ven el mismo set de ejercicios.
- [x] AC-002: Countdown visible y sincronizado para ambos jugadores.
- [x] AC-003: Challenge finaliza automaticamente al agotar el tiempo.
- [x] AC-004: Resultado calculado y mostrado a ambos participantes al terminar.
- [x] AC-005: En caso de empate en puntos, gana quien termino primero.

## Referencias

- **User Story:** US-PEER-002
- **Especificacion:** ET-PEER-002
- **EPIC:** EXT-009
