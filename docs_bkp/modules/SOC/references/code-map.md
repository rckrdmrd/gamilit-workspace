# Code Map - M-SOC

**Última actualización:** 2025-11-07
**Total de objetos:** 42

---

## Base de Datos

| OBJ ID | Tipo | Nombre | Schema | Ruta | Líneas |
|--------|------|--------|--------|------|--------|
| `OBJ-DB-SOC-FN-CLEANUP-OLD-NOTIFICATIONS` | function | `cleanup_old_notifications` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/functions/cleanup_old_notifications.sql` | 42 |
| `OBJ-DB-SOC-UNKN-01-ENABLE-RLS` | unknown | `01-enable-rls` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/rls-policies/01-enable-rls.sql` | 29 |
| `OBJ-DB-SOC-UNKN-02-POLICIES` | unknown | `02-policies` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/rls-policies/02-policies.sql` | 219 |
| `OBJ-DB-SOC-UNKN-02-SCHOOLS-POLICIES` | unknown | `02-schools-policies` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/rls-policies/02-schools-policies.sql` | 67 |
| `OBJ-DB-SOC-UNKN-03-CLASSROOMS-POLICIES` | unknown | `03-classrooms-policies` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/rls-policies/03-classrooms-policies.sql` | 102 |
| `OBJ-DB-SOC-UNKN-03-GRANTS` | unknown | `03-grants` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/rls-policies/03-grants.sql` | 25 |
| `OBJ-DB-SOC-UNKN-04-CLASSROOM-MEMBERS-POLICIES` | unknown | `04-classroom-members-policies` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/rls-policies/04-classroom-members-policies.sql` | 74 |
| `OBJ-DB-SOC-UNKN-05-FRIENDSHIPS-POLICIES` | unknown | `05-friendships-policies` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/rls-policies/05-friendships-policies.sql` | 59 |
| `OBJ-DB-SOC-UNKN-06-TEAMS-POLICIES` | unknown | `06-teams-policies` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/rls-policies/06-teams-policies.sql` | 70 |
| `OBJ-DB-SOC-IDX-FRIENDSHIPS` | index | `friendships` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables/01-friendships.sql` | 116 |
| `OBJ-DB-SOC-TRG-SCHOOLS` | trigger | `schools` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables/02-schools.sql` | 152 |
| `OBJ-DB-SOC-TRG-CLASSROOMS` | trigger | `classrooms` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables/03-classrooms.sql` | 189 |
| `OBJ-DB-SOC-TRG-CLASSROOM-MEMBERS` | trigger | `classroom_members` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables/04-classroom_members.sql` | 190 |
| `OBJ-DB-SOC-TRG-TEAMS` | trigger | `teams` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables/05-teams.sql` | 181 |
| `OBJ-DB-SOC-IDX-TEAM-MEMBERS` | index | `team_members` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables/06-team_members.sql` | 115 |
| `OBJ-DB-SOC-IDX-TEAM-CHALLENGES` | index | `team_challenges` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables/07-team_challenges.sql` | 108 |
| `OBJ-DB-SOC-TRG-TRG-CLASSROOM-MEMBERS-UPDATED-AT` | trigger | `trg_classroom_members_updated_at` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/triggers/24-trg_classroom_members_updated_at.sql` | 15 |
| `OBJ-DB-SOC-TRG-TRG-UPDATE-CLASSROOM-COUNT` | trigger | `trg_update_classroom_count` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/triggers/25-trg_update_classroom_count.sql` | 15 |
| `OBJ-DB-SOC-TRG-TRG-CLASSROOMS-UPDATED-AT` | trigger | `trg_classrooms_updated_at` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/triggers/26-trg_classrooms_updated_at.sql` | 15 |
| `OBJ-DB-SOC-TRG-TRG-SCHOOLS-UPDATED-AT` | trigger | `trg_schools_updated_at` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/triggers/27-trg_schools_updated_at.sql` | 15 |
| `OBJ-DB-SOC-TRG-TRG-TEAMS-UPDATED-AT` | trigger | `trg_teams_updated_at` | social_features | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/triggers/28-trg_teams_updated_at.sql` | 15 |

---

## Backend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|
| `OBJ-BE-SOC-CTRL-CLASSROOM-MEMBERS-CONTROLLER` | controller | `classroom-members.controller` | `social/controllers/classroom-members.controller.ts` |
| `OBJ-BE-SOC-CTRL-CLASSROOMS-CONTROLLER` | controller | `classrooms.controller` | `social/controllers/classrooms.controller.ts` |
| `OBJ-BE-SOC-CTRL-FRIENDSHIPS-CONTROLLER` | controller | `friendships.controller` | `social/controllers/friendships.controller.ts` |
| `OBJ-BE-SOC-CTRL-SCHOOLS-CONTROLLER` | controller | `schools.controller` | `social/controllers/schools.controller.ts` |
| `OBJ-BE-SOC-CTRL-TEAM-CHALLENGES-CONTROLLER` | controller | `team-challenges.controller` | `social/controllers/team-challenges.controller.ts` |
| `OBJ-BE-SOC-CTRL-TEAM-MEMBERS-CONTROLLER` | controller | `team-members.controller` | `social/controllers/team-members.controller.ts` |
| `OBJ-BE-SOC-CTRL-TEAMS-CONTROLLER` | controller | `teams.controller` | `social/controllers/teams.controller.ts` |
| `OBJ-BE-SOC-SVC-CLASSROOM-MEMBERS-SERVICE` | service | `classroom-members.service` | `social/services/classroom-members.service.ts` |
| `OBJ-BE-SOC-SVC-CLASSROOMS-SERVICE` | service | `classrooms.service` | `social/services/classrooms.service.ts` |
| `OBJ-BE-SOC-SVC-FRIENDSHIPS-SERVICE` | service | `friendships.service` | `social/services/friendships.service.ts` |
| `OBJ-BE-SOC-SVC-SCHOOLS-SERVICE` | service | `schools.service` | `social/services/schools.service.ts` |
| `OBJ-BE-SOC-SVC-TEAM-CHALLENGES-SERVICE` | service | `team-challenges.service` | `social/services/team-challenges.service.ts` |
| `OBJ-BE-SOC-SVC-TEAM-MEMBERS-SERVICE` | service | `team-members.service` | `social/services/team-members.service.ts` |
| `OBJ-BE-SOC-SVC-TEAMS-SERVICE` | service | `teams.service` | `social/services/teams.service.ts` |
| `OBJ-BE-SOC-ENT-CLASSROOM-MEMBER-ENTITY` | entity | `classroom-member.entity` | `social/entities/classroom-member.entity.ts` |
| `OBJ-BE-SOC-ENT-CLASSROOM-ENTITY` | entity | `classroom.entity` | `social/entities/classroom.entity.ts` |
| `OBJ-BE-SOC-ENT-FRIENDSHIP-ENTITY` | entity | `friendship.entity` | `social/entities/friendship.entity.ts` |
| `OBJ-BE-SOC-ENT-SCHOOL-ENTITY` | entity | `school.entity` | `social/entities/school.entity.ts` |
| `OBJ-BE-SOC-ENT-TEAM-CHALLENGE-ENTITY` | entity | `team-challenge.entity` | `social/entities/team-challenge.entity.ts` |
| `OBJ-BE-SOC-ENT-TEAM-MEMBER-ENTITY` | entity | `team-member.entity` | `social/entities/team-member.entity.ts` |
| `OBJ-BE-SOC-ENT-TEAM-ENTITY` | entity | `team.entity` | `social/entities/team.entity.ts` |

---

## Frontend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|