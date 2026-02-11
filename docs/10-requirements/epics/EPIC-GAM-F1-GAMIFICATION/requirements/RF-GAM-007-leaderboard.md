---
id: "RF-GAM-007"
title: "Sistema de Leaderboard"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Gamificacion"
epic: "EAI-003"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Sistema de Leaderboard

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-GAM-007 |
| Modulo | Gamificacion |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-003 |

## Descripcion

El sistema debe proveer tablas de clasificacion (leaderboards) que permitan a los estudiantes comparar su progreso con otros, fomentando competencia saludable y motivacion. Se implementan tres niveles de alcance: aula (clase), escuela (tenant), y global, con rankings basados en XP total.

## Requerimiento Funcional

- **RF-GAM-007.1:** Mostrar leaderboard de aula con el top 10 estudiantes por XP total dentro de la misma clase, incluyendo posicion, avatar, nombre, rango Maya, y XP.
- **RF-GAM-007.2:** Mostrar leaderboard de escuela (tenant) con el top 10 estudiantes de toda la institucion, filtrable por periodo (semanal, mensual, historico).
- **RF-GAM-007.3:** Mostrar leaderboard global con el top 10 estudiantes de toda la plataforma, actualizado periodicamente (cada 5 minutos o en tiempo real via cache).
- **RF-GAM-007.4:** Resaltar la posicion del estudiante actual en cada leaderboard, mostrando su rango incluso si no esta en el top 10 (ej: "Tu posicion: #23").
- **RF-GAM-007.5:** Implementar proteccion de privacidad: mostrar solo primer nombre e inicial del apellido, y permitir al estudiante optar por no aparecer en leaderboards publicos.

## Criterios de Aceptacion

- [ ] AC-001: El leaderboard de aula muestra correctamente el top 10 por XP
- [ ] AC-002: El leaderboard de escuela soporta filtro por periodo temporal
- [ ] AC-003: El leaderboard global se actualiza sin afectar performance
- [ ] AC-004: La posicion del estudiante actual siempre es visible
- [ ] AC-005: La opcion de privacidad permite ocultar al estudiante de rankings publicos

## Referencias

- **User Story:** US-GAM-007
- **Especificacion:** ET-GAM-007
- **EPIC:** EAI-003
