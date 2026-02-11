---
id: "RF-GAM-006"
title: "Narrativa Maya e Integracion de Lore"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Gamificacion"
epic: "EAI-003"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Narrativa Maya e Integracion de Lore

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-GAM-006 |
| Modulo | Gamificacion |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-003 |

## Descripcion

El sistema debe integrar una narrativa motivacional basada en la cultura Maya que acompane al estudiante durante su aprendizaje. Los mensajes narrativos pre-escritos se muestran entre modulos y al alcanzar logros, creando una historia de descubrimiento que conecta el progreso academico con la exploracion de la civilizacion Maya. No usa IA.

## Requerimiento Funcional

- **RF-GAM-006.1:** Mostrar mensajes narrativos al inicio de cada modulo educativo, contextualizando el contenido dentro de la historia Maya (ej: "Has llegado al Templo del Conocimiento, donde los escribas mayas...").
- **RF-GAM-006.2:** Mostrar mensajes narrativos al completar modulos, celebrando el logro dentro del contexto de la historia y anticipando el siguiente capitulo.
- **RF-GAM-006.3:** Integrar la narrativa con el sistema de rangos Maya: al subir de rango, mostrar una secuencia narrativa especial que explique el significado cultural del nuevo titulo.
- **RF-GAM-006.4:** Almacenar todos los textos narrativos en BD (tabla gamification_system.narrative_messages o seeds) para facilitar actualizaciones sin deploy.
- **RF-GAM-006.5:** Proveer un personaje guia (mascota o avatar Maya) que presenta los mensajes narrativos con expresiones visuales basicas (feliz, pensativo, celebrando).

## Criterios de Aceptacion

- [ ] AC-001: Cada modulo tiene un mensaje narrativo de apertura y cierre
- [ ] AC-002: Los mensajes narrativos son coherentes con la tematica Maya
- [ ] AC-003: La subida de rango incluye secuencia narrativa especial
- [ ] AC-004: Los textos narrativos son editables desde BD sin redeploy
- [ ] AC-005: El personaje guia se muestra con al menos 3 expresiones visuales

## Referencias

- **User Story:** US-GAM-006
- **Especificacion:** ET-GAM-006
- **EPIC:** EAI-003
