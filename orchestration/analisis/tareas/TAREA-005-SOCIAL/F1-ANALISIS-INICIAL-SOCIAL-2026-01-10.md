# F1: ANALISIS INICIAL - TAREA-005 SOCIAL_FEATURES

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-005 |
| **Modulo** | social_features |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Agente** | @PERFIL_ORQUESTADOR |

---

## 1. OBJETIVO

Realizar analisis inicial del modulo de funcionalidades sociales para identificar alcance, archivos y dependencias antes del analisis detallado (F2).

---

## 2. RESUMEN EJECUTIVO

### 2.1 Metricas por Capa

| Capa | Objetos | Estado |
|------|---------|--------|
| **Base de Datos** | 18 tablas, 5 enums, 10 funciones, 7 triggers | Produccion |
| **Backend** | 16 entities, 11 services, 11 controllers, 27 DTOs | Produccion |
| **Frontend** | Zustand stores, APIs (1700+ lineas), 10+ types | Produccion |

### 2.2 Subsistemas de Social Features

| Subsistema | Tablas | Descripcion |
|------------|--------|-------------|
| **Schools & Classrooms** | 4 | Instituciones educativas, aulas virtuales, miembros |
| **Teams/Guilds** | 3 | Equipos colaborativos con gamificacion |
| **Friendships** | 2 | Sistema de amistades con solicitudes |
| **Peer Challenges** | 3 | Desafios peer-to-peer y torneos |
| **Discussions** | 1 | Hilos de discusion en aulas/equipos |
| **Activities** | 2 | Feed de actividades e interacciones |
| **Teacher Portal** | 2 | Reportes y asignaciones de maestros |

---

## 3. CAPA 1: BASE DE DATOS (Schema social_features)

### 3.1 Tablas (18 Activas)

| # | Tabla | Proposito |
|---|-------|-----------|
| 1 | schools | Instituciones educativas con datos academicos |
| 2 | classrooms | Aulas virtuales con codigo unico, capacidad, configuracion |
| 3 | classroom_members | Inscripcion estudiantes en aulas (status, grades, attendance) |
| 4 | teacher_classrooms | Asignacion maestros-aulas (M2M) |
| 5 | teams | Equipos colaborativos con XP/ML Coins |
| 6 | team_members | Miembros de equipo con roles (owner/admin/member) |
| 7 | team_challenges | Desafios asignados a equipos |
| 8 | friendships | Amistades aceptadas (bidireccional) |
| 9 | friend_requests | Solicitudes pendientes de amistad |
| 10 | peer_challenges | Desafios peer-to-peer (head_to_head, tournament, etc.) |
| 11 | challenge_participants | Participantes en desafios con scores |
| 12 | challenge_results | Resultados finales y leaderboards |
| 13 | discussion_threads | Hilos de discusion (aulas o equipos) |
| 14 | user_activities | Feed de actividades de usuario |
| 15 | social_interactions | Interacciones sociales (like, comment, share) |
| 16 | teacher_reports | Reportes generados por maestros |
| 17 | assignment_classrooms | M2M asignaciones-aulas |
| 18 | user_follows | Relaciones de seguimiento |

### 3.2 Enums (5 Activos)

| Enum | Valores | Uso |
|------|---------|-----|
| classroom_role | teacher, student, assistant | Roles en aulas |
| friendship_status | pending, accepted, rejected, blocked | Estados de amistad |
| team_role | owner, admin, member | Roles en equipos |
| enrollment_method | teacher_invite, self_enroll, admin_add, bulk_import | Metodos de inscripcion |
| team_challenge_status | active, in_progress, completed, failed, cancelled | Estados de desafios |

### 3.3 Funciones (10)

**Friendship Helpers (9 funciones):**
- are_friends, count_friends, get_user_friends
- has_pending_friend_request, count_pending_friend_requests
- accept_friend_request, reject_friend_request, cancel_friend_request
- remove_friendship

**Otras:**
- cleanup_old_notifications
- sync_teacher_classroom_on_insert (trigger function)

### 3.4 Triggers (7)

| Trigger | Tabla | Proposito |
|---------|-------|-----------|
| trg_classroom_members_updated_at | classroom_members | Auto-update timestamp |
| trg_classrooms_updated_at | classrooms | Auto-update timestamp |
| trg_schools_updated_at | schools | Auto-update timestamp |
| trg_teams_updated_at | teams | Auto-update timestamp |
| trg_teacher_reports_updated_at | teacher_reports | Auto-update timestamp |
| trg_update_classroom_count | classroom_members | Mantiene conteo de miembros |
| trg_sync_teacher_classroom | classrooms | Sync teacher_classrooms (FIX-DB2) |

### 3.5 Dependencias Externas

| Schema Externo | Referencias |
|----------------|-------------|
| auth_management.profiles | 16+ FKs (user_id, teacher_id, student_id) |
| auth_management.tenants | 8+ FKs (tenant_id multi-tenancy) |
| educational_content.modules | FK peer_challenges.module_id |
| educational_content.exercises | FK peer_challenges.exercise_id |
| educational_content.assignments | FK assignment_classrooms |

---

## 4. CAPA 2: BACKEND

### 4.1 Entities (16)

| Entity | Tabla DDL | Campos Clave |
|--------|-----------|--------------|
| Classroom | classrooms | tenant_id, teacher_id, code, capacity, settings |
| School | schools | tenant_id, code, principal_id, is_active |
| Team | teams | classroom_id, creator_id, leader_id, total_xp, total_ml_coins |
| Friendship | friendships | user_id, friend_id, status |
| FriendRequest | friend_requests | requester_id, recipient_id, status, message |
| ClassroomMember | classroom_members | classroom_id, student_id, enrollment_method, status |
| TeamMember | team_members | team_id, user_id, role |
| TeacherClassroom | teacher_classrooms | teacher_id, classroom_id, role |
| PeerChallenge | peer_challenges | challenge_type, module_id, difficulty_level, rewards |
| ChallengeParticipant | challenge_participants | challenge_id, user_id, score, rank |
| ChallengeResult | challenge_results | challenge_id, winner_id, final_leaderboard |
| TeamChallenge | team_challenges | team_id, challenge_id, status, score |
| DiscussionThread | discussion_threads | classroom_id, team_id, is_pinned, is_locked |
| UserActivity | user_activities | user_id, activity_type, is_public |
| AssignmentClassroom | assignment_classrooms | assignment_id, classroom_id |
| SocialInteraction | social_interactions | user_id, target_user_id, interaction_type |

### 4.2 Services (11)

| Service | Metodos Clave |
|---------|---------------|
| ClassroomsService | create, findByCode, updateMemberCount, archive |
| SchoolsService | CRUD, findByCode |
| TeamsService | CRUD, leaderboard, updateXP, addMember |
| ClassroomMembersService | CRUD, updateStatus, withdraw |
| TeamMembersService | CRUD, updateRole |
| FriendshipsService | sendRequest, accept, reject, block |
| PeerChallengesService | CRUD, addParticipant, calculateResults, distributeRewards |
| ChallengeParticipantsService | CRUD, updateScore, getRanking |
| TeamChallengesService | CRUD, updateScore |
| DiscussionThreadsService | CRUD, pin, lock |
| UserActivitiesService | CRUD, getPublicActivities |

### 4.3 Controllers (11)

| Controller | Base Path |
|------------|-----------|
| ClassroomsController | /api/v1/social/classrooms |
| SchoolsController | /api/v1/social/schools |
| TeamsController | /api/v1/social/teams |
| ClassroomMembersController | /api/v1/social/classroom-members |
| TeamMembersController | /api/v1/social/team-members |
| FriendshipsController | /api/v1/social/friendships |
| PeerChallengesController | /api/v1/social/peer-challenges |
| ChallengeParticipantsController | /api/v1/social/challenge-participants |
| TeamChallengesController | /api/v1/social/team-challenges |
| DiscussionThreadsController | /api/v1/social/discussion-threads |
| UserActivitiesController | /api/v1/social/user-activities |

### 4.4 DTOs (27)

**Create (11):** classroom, school, team, classroom-member, team-member, friendship, peer-challenge, team-challenge, discussion-thread, activity, add-participant

**Response (7):** classroom, school, team, classroom-member, team-member, friendship, activity

**Update (9):** member-status, friendship-status, peer-challenge, participant-score, discussion-thread, distribute-rewards, team-challenge-response, discussion-response

---

## 5. CAPA 3: FRONTEND

### 5.1 State Management (Zustand Stores)

| Store | State Clave | Ubicacion |
|-------|-------------|-----------|
| guildsStore | allGuilds, userGuild, guildMembers, guildChallenges | features/gamification/social/store/ |
| friendsStore | friends, friendRequests, recommendations, activities | features/gamification/social/store/ |
| achievementsStore | achievements, unlockedAchievements, recentUnlocks | features/gamification/social/store/ |
| leaderboardsStore | currentLeaderboard, selectedType, timeFrame | features/gamification/social/store/ |
| powerUpsStore | powerUps, inventory, activePowerUps | features/gamification/social/store/ |

### 5.2 Types (Principales)

| Archivo | Types Definidos |
|---------|-----------------|
| social.types.ts (303 lineas) | FriendshipStatus, Friendship, Team, TeamMember, Classroom, ClassroomMember, School |
| classroom.types.ts (785 lineas) | Classroom (170+ campos), ClassroomSettings, StudentInClassroom, ClassroomStats |
| guildsTypes.ts | GuildRole, GuildStatus, Guild, GuildMember, GuildChallenge |
| friendsTypes.ts | Friend, FriendRequest, FriendRecommendation, FriendActivity |

### 5.3 APIs (Principales)

| API | Funciones (Lineas) |
|-----|---------------------|
| socialAPI.ts (1166 lineas) | achievements, powerUps, leaderboards, guilds, friends |
| teamsAPI.ts (543 lineas) | getAllTeams, getTeamMembers, createTeam, getTeamsLeaderboard |
| friendsAPI.ts | getUserFriends, sendFriendRequest, acceptFriendRequest |
| classroomsApi.ts | getClassrooms, getClassroomStudents, getClassroomProgress |

### 5.4 Hooks

| Hook | Funcionalidad |
|------|---------------|
| useGuilds | Guild management, auto-fetch, join/leave/create |
| useFriends | Friend search, requests, recommendations |
| useAchievements | Achievement tracking, unlock notifications |
| usePowerUps | Inventory, activation |
| useLeaderboards | Leaderboard data, filtering |

---

## 6. MATRIZ DE DEPENDENCIAS

```
+-----------------------------------------------------------------------+
|                 DEPENDENCIAS SOCIAL_FEATURES                           |
+-----------------------------------------------------------------------+
|                                                                        |
|   TABLAS INTERNAS:                                                     |
|   schools ──> classrooms (1:N)                                         |
|   classrooms ──┬─> classroom_members (1:N)                             |
|                ├─> teacher_classrooms (1:N)                            |
|                ├─> teams (1:N)                                         |
|                └─> discussion_threads (1:N)                            |
|   teams ──┬─> team_members (1:N)                                       |
|           └─> team_challenges (1:N)                                    |
|   peer_challenges ──┬─> challenge_participants (1:N)                   |
|                     └─> challenge_results (1:1)                        |
|                                                                        |
|   MAPPING ESPECIAL:                                                    |
|   Backend "teams" ←→ Frontend "guilds" (mapTeamToGuild)               |
|   Level calculation: Math.floor(total_xp / 1000) + 1                   |
|                                                                        |
|   DEPENDENCIAS EXTERNAS:                                               |
|   auth_management.profiles <── FKs user_id (todas las tablas)         |
|   auth_management.tenants <── FK tenant_id (multi-tenancy)            |
|   educational_content.modules <── FK peer_challenges                   |
|   educational_content.exercises <── FK peer_challenges                 |
|                                                                        |
+-----------------------------------------------------------------------+
```

---

## 7. PUNTOS DE INTEGRACION CRITICOS

| Integracion | Capas | Estado | Riesgo |
|-------------|-------|--------|--------|
| DDL → Entity (18 tablas vs 16 entities) | DB → Backend | Por validar | BAJO |
| Entity → DTO (16 entities vs 27 DTOs) | Backend | Por validar | BAJO |
| DTO → Type | Backend → Frontend | Por validar | MEDIO |
| Enums (5 tipos) | Todas | Por validar | ALTO |
| Team ↔ Guild mapping | Backend → Frontend | Por validar | MEDIO |

---

## 8. INCONSISTENCIAS PRELIMINARES

### 8.1 Potenciales Brechas

| # | Capa | Descripcion | Severidad |
|---|------|-------------|-----------|
| 1 | Frontend | Team vs Guild naming diferente | BAJA |
| 2 | All | Enums social necesitan validacion cruzada | MEDIA |
| 3 | Frontend | Duplicacion types entre social.types y feature types | BAJA |

### 8.2 Notas de Arquitectura

- **Team ↔ Guild Mapping**: Frontend usa "guilds" mientras backend usa "teams"
- **Multi-tenancy**: Todas las tablas principales tienen tenant_id
- **Soft deletes**: classrooms usa is_deleted flag
- **RLS**: 10+ policies para classrooms y classroom_members

---

## 9. CRITERIOS DE EXITO PARA F2

- [ ] Validacion 18 tablas DDL vs 16 entities
- [ ] Alineacion enums DDL vs Backend vs Frontend
- [ ] Verificacion FriendshipStatus (4 valores)
- [ ] Verificacion TeamMemberRole (3 valores)
- [ ] Verificacion EnrollmentMethod (4 valores)
- [ ] Verificacion TeamChallengeStatus (5 valores)
- [ ] Mapeo Team-Guild en frontend

---

## 10. PROXIMOS PASOS

1. **F2**: Analisis detallado campo por campo
2. **F3**: Plan de correcciones priorizadas (si aplica)
3. **F4**: Validacion del plan
4. **F5**: Refinamiento
5. **F6**: Ejecucion
6. **F7**: Validacion final

---

## 11. ARCHIVOS RELACIONADOS

### Base de Datos
- `/apps/database/ddl/schemas/social_features/` (60+ archivos DDL)

### Backend
- `/apps/backend/src/modules/social/`

### Frontend
- `/apps/frontend/src/features/gamification/social/`
- `/apps/frontend/src/shared/types/social.types.ts`
- `/apps/frontend/src/shared/types/classroom.types.ts`
- `/apps/frontend/src/services/api/teamsAPI.ts`

---

**Documento generado por:** @PERFIL_ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F2 - Analisis Detallado
