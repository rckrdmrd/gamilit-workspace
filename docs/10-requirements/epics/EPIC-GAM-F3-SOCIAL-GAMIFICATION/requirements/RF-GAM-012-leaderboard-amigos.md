---
id: "RF-GAM-012"
title: "Leaderboard de Amigos"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "social_features, gamification_system"
epic: "EAI-003-EXT"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# RF-GAM-012: Leaderboard de Amigos

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-GAM-012 |
| Modulo | social_features, gamification_system |
| Status | Done |
| EPIC | EAI-003-EXT - Gamificacion Social |

## Descripcion

Implementar una vista de leaderboard filtrada que muestre unicamente a los amigos del usuario actual, complementando el leaderboard global existente. Esta vista permite competencia cercana y personal, mostrando ranking por XP con filtros de periodo y notificaciones cuando un amigo supera al usuario.

## Requerimiento Funcional

- **RF-GAM-012.1:** Proveer endpoint y vista de leaderboard filtrado que muestre solo amigos del usuario actual, ordenados por XP total descendente, con la posicion propia destacada visualmente.
- **RF-GAM-012.2:** Soportar filtros de periodo temporal: semanal (ultimos 7 dias), mensual (ultimos 30 dias) e historico (acumulado total), permitiendo alternar sin recarga completa de pagina.
- **RF-GAM-012.3:** Mostrar informacion contextual de cada amigo en el ranking: nombre, avatar, rango Maya actual, XP del periodo seleccionado y modulo en el que se encuentra activamente.
- **RF-GAM-012.4:** Enviar notificacion push cuando un amigo supera al usuario en el ranking semanal, limitada a maximo 1 notificacion por amigo por dia para evitar spam.

## Criterios de Aceptacion

- [ ] AC-001: Leaderboard de amigos carga en menos de 2 segundos con hasta 100 amigos
- [ ] AC-002: Posicion propia del usuario siempre visible (scroll automatico si necesario)
- [ ] AC-003: Filtros de periodo (semanal/mensual/historico) funcionan sin recarga de pagina
- [ ] AC-004: Notificacion de superacion se envia maximo 1 vez por amigo por dia
- [ ] AC-005: Vista vacia muestra mensaje contextual si el usuario no tiene amigos

## Referencias

- **User Story:** US-GAM-012 - Leaderboard de Amigos
- **Especificacion:** ET-SOC-001 - Diseno Tecnico Sistema de Amigos
- **EPIC:** EAI-003-EXT - Gamificacion Social
- **Dependencia:** RF-GAM-010 (Sistema de Amigos debe estar implementado)
