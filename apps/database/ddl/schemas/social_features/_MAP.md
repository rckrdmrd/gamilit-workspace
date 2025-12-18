# Schema: social_features

Características sociales: aulas, equipos, miembros, interacciones, reportes de profesores

## Estructura

- **tables/**: 17 archivos
- **enums/**: 1 archivos
- **functions/**: 2 archivos
- **triggers/**: 6 archivos
- **rls-policies/**: 10 archivos

**Total:** 36 objetos

## Contenido Detallado

### tables/ (17 archivos)

```
01-friendships.sql              # 2025-12-05: Actualizada - Solo amistades aceptadas
02-schools.sql
03-classrooms.sql
04-classroom_members.sql
05-teams.sql
06-team_members.sql
07-team_challenges.sql
08-teacher_reports.sql          # 2025-11-26: Reportes generados por profesores
10-friend_requests.sql          # 2025-12-05: Nueva - Sistema de solicitudes de amistad
11-peer_challenges.sql
12-challenge_participants.sql
13-challenge_results.sql
assignment_classrooms.sql
discussion_threads.sql
social_interactions.sql
teacher_classrooms.sql
user_follows.sql
```

### enums/ (1 archivos)

```
social_event_type.sql
```

### functions/ (2 archivos)

```
cleanup_old_notifications.sql
friendship_helpers.sql          # 2025-12-05: Funciones helper para sistema de amigos
```

### triggers/ (6 archivos)

```
24-trg_classroom_members_updated_at.sql
25-trg_update_classroom_count.sql
26-trg_classrooms_updated_at.sql
27-trg_schools_updated_at.sql
28-trg_teams_updated_at.sql
29-trg_teacher_reports_updated_at.sql  # 2025-11-26: Auto-update updated_at
```

### rls-policies/ (10 archivos)

```
01-enable-rls.sql
02-policies.sql
02-schools-policies.sql
03-classrooms-policies.sql
03-grants.sql
04-classroom-members-policies.sql
05-friendships-policies.sql      # 2025-12-05: Actualizada - Simplificada para amistades aceptadas
06-teams-policies.sql
08-teacher-reports-policies.sql  # 2025-11-26: Políticas para reportes
09-friend-requests-policies.sql  # 2025-12-05: Nueva - Políticas para solicitudes de amistad
```

---

**Última actualización:** 2025-12-05
**Reorganización:** 2025-11-09
**Cambios recientes:**
- 2025-12-05: Sistema de Amigos (DB-GAM-003, DB-GAM-004, DB-GAM-005)
  - Actualizada tabla friendships: Solo amistades aceptadas
  - Nueva tabla friend_requests: Gestión de solicitudes de amistad
  - Nuevas funciones helper: are_friends, count_friends, accept_friend_request, etc.
  - Actualizadas políticas RLS para friendships y friend_requests
- 2025-11-26: Agregada tabla teacher_reports (Portal Teacher fix)
- 2025-11-26: Agregado trigger trg_teacher_reports_updated_at
- 2025-11-26: Agregadas políticas RLS para teacher_reports
