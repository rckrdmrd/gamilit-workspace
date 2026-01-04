# Schema: social_features

Características sociales: escuelas, aulas, equipos, amistades, reportes de profesores.

## Estructura

- **tables/**: 17 archivos
- **enums/**: 0 archivos activos
- **enums/_deprecated/**: 1 archivo (social_event_type - sin uso)
- **functions/**: 2 archivos
- **triggers/**: 6 archivos
- **rls-policies/**: 10 archivos

**Total:** 35 objetos DDL activos

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

---

**Última actualización:** 2025-12-29
