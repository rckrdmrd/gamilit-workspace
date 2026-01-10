# Schema: social_features

Características sociales: escuelas, aulas, equipos, amistades, reportes de profesores.

## Estructura

- **tables/**: 17 archivos
- **enums/**: 5 archivos activos (classroom_role, friendship_status, team_role, enrollment_method, team_challenge_status)
- **enums/_deprecated/**: 1 archivo (social_event_type - sin uso)
- **functions/**: 2 archivos
- **triggers/**: 2 archivos activos (incluye 00-batch_updated_at_triggers.sql consolidado)
- **triggers/_deprecated/**: 5 archivos (triggers updated_at individuales)
- **rls-policies/**: 10 archivos

**Total:** 37 objetos DDL activos

## Tablas Principales

| Tabla | Propósito |
|-------|-----------|
| `schools` | Instituciones educativas |
| `classrooms` | Aulas/grupos dentro de escuelas |
| `classroom_members` | Estudiantes asignados a aulas |
| `teams` | Equipos de estudiantes |
| `team_members` | Miembros de equipos |
| `friendships` | Amistades aceptadas entre usuarios |
| `friend_requests` | Solicitudes de amistad pendientes |
| `teacher_reports` | Reportes generados por profesores |
| `peer_challenges` | Desafíos entre pares |

## Sistema de Amistades

Modelo de dos tablas:
1. **friend_requests**: Solicitudes pendientes (sender → receiver)
2. **friendships**: Amistades confirmadas (bidireccional)

Funciones helper en `friendship_helpers.sql`:
- `are_friends()`, `count_friends()`, `accept_friend_request()`

## Reportes de Profesores

Tabla `teacher_reports` para almacenar reportes generados:
- Asociado a classroom y teacher
- Tipos: performance, attendance, behavior, etc.

## Consolidacion de Triggers (2026-01-07)

Triggers de `updated_at` consolidados en `00-batch_updated_at_triggers.sql`:
- `classroom_members_updated_at`
- `classrooms_updated_at`
- `schools_updated_at`
- `teams_updated_at`
- `teacher_reports_updated_at`

Archivos originales movidos a `triggers/_deprecated/`.

## Migracion de ENUMs (2026-01-07)

ENUMs migrados desde `00-prerequisites.sql` a archivos individuales en `enums/`:
- `classroom_role` - Roles en aulas
- `friendship_status` - Estados de amistad
- `team_role` - Roles en equipos

---

**Ultima actualizacion:** 2026-01-07
**Cambios recientes:**
- SINCRONIZACION: Agregados ENUMs enrollment_method y team_challenge_status (2026-01-07)
- SINCRONIZACION: team_role alineado con backend (owner, admin, member) (2026-01-07)
- SINCRONIZACION: friendship_status agregado 'rejected' (2026-01-07)
- CONSOLIDACION BD: Triggers updated_at consolidados (2026-01-07)
- CONSOLIDACION BD: ENUMs migrados a archivos individuales (2026-01-07)
