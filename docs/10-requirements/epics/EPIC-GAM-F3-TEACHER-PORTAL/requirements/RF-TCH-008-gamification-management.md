---
id: "RF-TCH-008"
title: "Gestion de Gamificacion por Aula"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Gestion de Gamificacion por Aula

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-008 |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir a los maestros configurar y gestionar los elementos de gamificacion dentro de cada aula. Esto incluye activar/desactivar mecanicas de gamificacion (puntos, badges, leaderboards, rachas), definir recompensas personalizadas, ajustar la tabla de posiciones y configurar el sistema de niveles y experiencia adaptado al contexto del aula.

## Requerimiento Funcional

- **RF-TCH-008.1:** El maestro puede activar o desactivar individualmente las mecanicas de gamificacion disponibles: puntos XP, badges, leaderboard, rachas y niveles.
- **RF-TCH-008.2:** El maestro puede crear badges personalizados para el aula con nombre, icono, descripcion y condicion de obtencion (manual o automatica).
- **RF-TCH-008.3:** El maestro puede configurar el leaderboard del aula: visible/oculto, anonimizado, top-N o completo, y frecuencia de reset.
- **RF-TCH-008.4:** El maestro puede otorgar puntos o badges manualmente a estudiantes como reconocimiento por participacion o logros especiales.

## Criterios de Aceptacion

- [ ] AC-001: Al desactivar una mecanica, los elementos relacionados dejan de ser visibles para los estudiantes del aula.
- [ ] AC-002: Un badge personalizado creado aparece en el catalogo del aula y puede ser otorgado.
- [ ] AC-003: La configuracion del leaderboard se refleja inmediatamente en la vista del estudiante.
- [ ] AC-004: Los puntos otorgados manualmente se registran con motivo y se suman al total del estudiante.
- [ ] AC-005: Las configuraciones de gamificacion son independientes entre aulas del mismo maestro.

## Reglas de Negocio

- La configuracion de gamificacion por defecto se hereda del template del aula pero es personalizable.
- Los puntos XP otorgados manualmente estan limitados a 100 por estudiante por dia.
- Los badges automaticos se evaluan al momento del evento que los dispara.

## Dependencias

- Tablas en esquema `gamification`: `badges`, `points_log`, `leaderboards`.
- Configuracion de mecanicas en esquema `classroom`.

## Referencias

- **User Story:** US-PM-008
- **Especificacion:** ET-TCH-008
- **EPIC:** EXT-001
