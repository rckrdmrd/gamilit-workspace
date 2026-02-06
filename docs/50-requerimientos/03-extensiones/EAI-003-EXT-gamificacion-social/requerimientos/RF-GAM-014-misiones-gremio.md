---
id: "RF-GAM-014"
title: "Misiones Cooperativas de Gremio"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "social_features, gamification_system"
epic: "EAI-003-EXT"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# RF-GAM-014: Misiones Cooperativas de Gremio

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-GAM-014 |
| Modulo | social_features, gamification_system |
| Status | Done |
| EPIC | EAI-003-EXT - Gamificacion Social |

## Descripcion

Implementar misiones especiales de gremio que requieren la contribucion colectiva de multiples miembros. El progreso es acumulativo entre todos los participantes y las recompensas (XP bonus y ML Coins) se distribuyen a todos los miembros que contribuyeron. Soporta misiones diarias (24h), semanales (7 dias) y eventos especiales con tiempo limitado.

## Requerimiento Funcional

- **RF-GAM-014.1:** Generar automaticamente misiones diarias de gremio (ej: "Completar 50 ejercicios entre todos") con duracion de 24 horas, objetivos escalados segun el numero de miembros activos del gremio.
- **RF-GAM-014.2:** Generar misiones semanales de gremio (ej: "Acumular 10,000 XP combinado") con duracion de 7 dias y recompensas superiores a las diarias, incluyendo bonus de ML Coins.
- **RF-GAM-014.3:** Soportar eventos especiales tematicos con tiempo limitado configurables por administradores, con recompensas exclusivas (badges de gremio, titulos especiales).
- **RF-GAM-014.4:** Trackear progreso individual de cada miembro hacia la mision grupal en tiempo real, mostrando contribucion de cada participante y progreso total vs objetivo.
- **RF-GAM-014.5:** Distribuir recompensas proporcionalmente al completar mision: todos los miembros que contribuyeron reciben el bonus base, con un bonus extra para los 3 mayores contribuidores.

## Criterios de Aceptacion

- [ ] AC-001: Misiones diarias se generan automaticamente a las 00:00 UTC para gremios activos
- [ ] AC-002: Progreso grupal se actualiza en tiempo real (max 5s de delay)
- [ ] AC-003: Recompensas se distribuyen automaticamente al alcanzar el objetivo
- [ ] AC-004: Misiones expiradas se archivan con registro de progreso alcanzado
- [ ] AC-005: Panel de mision muestra contribucion individual de cada miembro

## Referencias

- **User Story:** US-GAM-014 - Misiones de Gremio
- **Especificacion:** ET-SOC-002 - Diseno Tecnico Sistema de Gremios
- **EPIC:** EAI-003-EXT - Gamificacion Social
- **Dependencia:** RF-GAM-013 (Sistema de Gremios debe estar implementado)
- **Tabla DDL:** `social_features.guild_missions`
