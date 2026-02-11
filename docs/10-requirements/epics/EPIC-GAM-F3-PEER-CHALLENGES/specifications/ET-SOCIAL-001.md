# ET-SOCIAL-001: Especificacion Modulo Social

**Version:** 1.0.0
**Fecha:** 2026-02-03
**Epic:** EXT-009 (Peer Challenges)
**Prioridad:** P1 - Alta
**Estado:** Documentado

---

## 1. Descripcion General

El Modulo Social de GAMILIT proporciona las funcionalidades de interaccion social entre usuarios, incluyendo sistema de amistades, equipos colaborativos, y desafios peer-to-peer. Este modulo es fundamental para la gamificacion social y el engagement de estudiantes.

### 1.1 Objetivos
- Permitir conexiones sociales entre estudiantes (amistades)
- Facilitar colaboracion mediante equipos
- Fomentar competencia saludable con desafios P2P
- Promover engagement a traves de interacciones sociales

### 1.2 Alcance
- Schema: `social_features`
- Backend Module: `modules/social/`
- Funcionalidades: Friendships, Teams, Peer Challenges

---

## 2. Tablas Involucradas

### 2.1 friendships
**Proposito:** Relaciones de amistad ACEPTADAS entre usuarios

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| user_id | UUID | Usuario que inicio la amistad |
| friend_id | UUID | Usuario amigo |
| status | VARCHAR(20) | pending, accepted, rejected, blocked |
| created_at | TIMESTAMPTZ | Fecha de creacion |
| updated_at | TIMESTAMPTZ | Ultima actualizacion |

**Constraints:**
- `friendships_unique`: UNIQUE(user_id, friend_id)
- `friendships_no_self`: user_id != friend_id

**Indices:**
- `idx_friendships_user_id`
- `idx_friendships_friend_id`
- `idx_friendships_status`

**FK:**
- `user_id` -> `auth_management.profiles(id)` ON DELETE CASCADE
- `friend_id` -> `auth_management.profiles(id)` ON DELETE CASCADE

### 2.2 friend_requests
**Proposito:** Solicitudes de amistad pendientes

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| requester_id | UUID | Usuario que envia solicitud |
| recipient_id | UUID | Usuario que recibe solicitud |
| status | VARCHAR(20) | pending, accepted, rejected, cancelled |
| message | TEXT | Mensaje opcional |
| created_at | TIMESTAMPTZ | Fecha de creacion |
| responded_at | TIMESTAMPTZ | Fecha de respuesta |

**Estados:**
- `pending`: Solicitud enviada, esperando respuesta
- `accepted`: Aceptada (se crea registro en friendships)
- `rejected`: Rechazada por el destinatario
- `cancelled`: Cancelada por el solicitante

**Constraints:**
- `friend_requests_unique`: UNIQUE(requester_id, recipient_id)
- `friend_requests_no_self`: requester_id != recipient_id

**Indices:**
- `idx_friend_requests_requester`
- `idx_friend_requests_recipient`
- `idx_friend_requests_status`
- `idx_friend_requests_recipient_status` WHERE status = 'pending'

### 2.3 teams
**Proposito:** Equipos colaborativos de estudiantes

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| classroom_id | UUID | FK a classrooms (opcional) |
| tenant_id | UUID | FK a tenants |
| name | TEXT | Nombre del equipo |
| description | TEXT | Descripcion |
| motto | TEXT | Lema del equipo |
| color_primary | TEXT | Color primario (#3B82F6 default) |
| color_secondary | TEXT | Color secundario (#10B981 default) |
| avatar_url | TEXT | URL del avatar |
| banner_url | TEXT | URL del banner |
| badges | JSONB | Insignias del equipo |
| creator_id | UUID | Usuario creador |
| leader_id | UUID | Lider actual |
| team_code | TEXT | Codigo unico de equipo |
| max_members | INTEGER | Maximo miembros (default: 5) |
| current_members_count | INTEGER | Contador actual |
| is_public | BOOLEAN | Equipo publico |
| allow_join_requests | BOOLEAN | Permite solicitudes |
| require_approval | BOOLEAN | Requiere aprobacion |
| total_xp | INTEGER | XP total acumulado |
| total_ml_coins | INTEGER | ML Coins totales |
| modules_completed | INTEGER | Modulos completados |
| achievements_earned | INTEGER | Logros obtenidos |
| is_active | BOOLEAN | Equipo activo |
| is_verified | BOOLEAN | Equipo verificado |
| founded_at | TIMESTAMPTZ | Fecha de fundacion |
| last_activity_at | TIMESTAMPTZ | Ultima actividad |
| metadata | JSONB | Metadatos adicionales |

**Indices:**
- `idx_teams_classroom`
- `idx_teams_leader`
- `idx_teams_xp` DESC
- `idx_teams_active` WHERE is_active = true
- `idx_teams_classroom_active_xp` WHERE is_active = true

### 2.4 team_members
**Proposito:** Miembros de equipos

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| team_id | UUID | FK a teams |
| user_id | UUID | FK a profiles |
| role | VARCHAR(20) | owner, admin, member |
| joined_at | TIMESTAMPTZ | Fecha de ingreso |
| left_at | TIMESTAMPTZ | Fecha de salida (null si activo) |

**Constraints:**
- `team_members_team_id_user_id_key`: UNIQUE(team_id, user_id)
- `team_members_role_check`: role IN ('owner', 'admin', 'member')

**Indices:**
- `idx_team_members_team_id`
- `idx_team_members_user_id`
- `idx_team_members_active` WHERE left_at IS NULL

### 2.5 peer_challenges
**Proposito:** Desafios peer-to-peer entre estudiantes

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| challenge_type | TEXT | head_to_head, multiplayer, tournament, leaderboard |
| created_by | UUID | Usuario creador |
| module_id | UUID | Modulo asociado (opcional) |
| exercise_id | UUID | Ejercicio asociado (opcional) |
| title | TEXT | Titulo del desafio |
| description | TEXT | Descripcion |
| difficulty_level | ENUM | Nivel de dificultad |
| max_participants | INTEGER | Maximo participantes (default: 2) |
| min_participants | INTEGER | Minimo para iniciar (default: 2) |
| current_participants | INTEGER | Contador actual |
| start_time | TIMESTAMPTZ | Hora de inicio |
| end_time | TIMESTAMPTZ | Hora de fin |
| time_limit_minutes | INTEGER | Tiempo limite por participante |
| status | TEXT | open, full, in_progress, completed, cancelled, expired |
| rewards | JSONB | {xp, ml_coins, achievement_id} |
| winner_bonus_multiplier | NUMERIC(3,2) | Multiplicador ganador (default: 1.5) |
| allow_spectators | BOOLEAN | Permite espectadores |
| is_public | BOOLEAN | Visible en lista publica |
| requires_approval | BOOLEAN | Requiere aprobacion |
| custom_rules | JSONB | Reglas personalizadas |
| started_at | TIMESTAMPTZ | Cuando inicio |
| completed_at | TIMESTAMPTZ | Cuando termino |
| metadata | JSONB | Metadatos adicionales |

**Tipos de Desafio:**
- `head_to_head`: 1v1 directo
- `multiplayer`: Multiples participantes
- `tournament`: Torneo eliminatorio
- `leaderboard`: Competencia por ranking

**Estados:**
- `open`: Abierto para unirse
- `full`: Lleno (max participants)
- `in_progress`: En curso
- `completed`: Terminado
- `cancelled`: Cancelado
- `expired`: Expirado sin completarse

### 2.6 challenge_participants
**Proposito:** Participantes de peer challenges

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| challenge_id | UUID | FK a peer_challenges |
| user_id | UUID | FK a profiles |
| participation_status | TEXT | invited, accepted, in_progress, completed, forfeit, disqualified |
| score | NUMERIC(10,2) | Puntuacion obtenida |
| accuracy_percentage | NUMERIC(5,2) | Porcentaje de precision |
| completion_percentage | NUMERIC(5,2) | Porcentaje completado |
| exercises_completed | INTEGER | Ejercicios completados |
| started_at | TIMESTAMPTZ | Inicio de participacion |
| completed_at | TIMESTAMPTZ | Fin de participacion |
| time_spent_seconds | INTEGER | Tiempo total invertido |
| rank | INTEGER | Posicion final (1 = ganador) |
| is_winner | BOOLEAN | Es ganador |
| xp_earned | INTEGER | XP ganado |
| ml_coins_earned | INTEGER | ML Coins ganados |
| rewards_claimed | BOOLEAN | Recompensas reclamadas |
| attempt_id | UUID | Link a exercise_attempts |
| invited_at | TIMESTAMPTZ | Fecha de invitacion |
| accepted_at | TIMESTAMPTZ | Fecha de aceptacion |
| metadata | JSONB | Metadatos adicionales |

**Estados de Participacion:**
- `invited`: Invitado pero no aceptado
- `accepted`: Acepto el desafio
- `in_progress`: Completando el desafio
- `completed`: Termino el desafio
- `forfeit`: Se rindio
- `disqualified`: Descalificado

### 2.7 challenge_results
**Proposito:** Resultados finales de peer challenges

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| challenge_id | UUID | FK UNIQUE a peer_challenges |
| winner_id | UUID | Usuario ganador |
| second_place_id | UUID | Segundo lugar |
| third_place_id | UUID | Tercer lugar |
| total_participants | INTEGER | Total participantes |
| participants_completed | INTEGER | Participantes que terminaron |
| participants_forfeit | INTEGER | Participantes que se rindieron |
| winning_score | NUMERIC(10,2) | Puntuacion ganadora |
| average_score | NUMERIC(10,2) | Puntuacion promedio |
| highest_accuracy | NUMERIC(5,2) | Mayor precision |
| average_completion_time_seconds | INTEGER | Tiempo promedio |
| fastest_completion_time_seconds | INTEGER | Tiempo mas rapido |
| total_xp_distributed | INTEGER | XP total distribuido |
| total_ml_coins_distributed | INTEGER | ML Coins distribuidos |
| rewards_distributed | BOOLEAN | Recompensas distribuidas |
| final_leaderboard | JSONB | [{user_id, rank, score, time}] |
| statistics | JSONB | Estadisticas detalladas |
| calculated_at | TIMESTAMPTZ | Fecha de calculo |
| rewards_distributed_at | TIMESTAMPTZ | Fecha de distribucion |
| metadata | JSONB | Metadatos adicionales |

### 2.8 team_challenges
**Proposito:** Desafios asignados a equipos

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| team_id | UUID | FK a teams |
| challenge_id | UUID | ID del desafio |
| status | VARCHAR(20) | active, in_progress, completed, failed, cancelled |
| started_at | TIMESTAMPTZ | Inicio |
| completed_at | TIMESTAMPTZ | Finalizacion |
| score | INTEGER | Puntuacion del equipo |

**Constraint:** UNIQUE(team_id, challenge_id)

---

## 3. APIs

### 3.1 Friendships API

**Base Path:** `/api/social/friendships`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar amigos del usuario |
| GET | `/:id` | Obtener amistad especifica |
| POST | `/` | Crear solicitud de amistad |
| PUT | `/:id/status` | Actualizar estado de amistad |
| DELETE | `/:id` | Eliminar amistad |

### 3.2 Friend Requests API

**Base Path:** `/api/social/friend-requests`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/pending` | Solicitudes pendientes recibidas |
| GET | `/sent` | Solicitudes enviadas |
| POST | `/` | Enviar solicitud |
| PUT | `/:id/accept` | Aceptar solicitud |
| PUT | `/:id/reject` | Rechazar solicitud |
| DELETE | `/:id` | Cancelar solicitud |

### 3.3 Teams API

**Base Path:** `/api/social/teams`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar equipos del usuario |
| GET | `/:id` | Detalle de equipo |
| POST | `/` | Crear equipo |
| PUT | `/:id` | Actualizar equipo |
| DELETE | `/:id` | Eliminar equipo |
| POST | `/:id/join` | Unirse a equipo |
| POST | `/:id/leave` | Salir de equipo |
| GET | `/:id/members` | Listar miembros |
| POST | `/:id/members` | Agregar miembro |
| DELETE | `/:id/members/:userId` | Remover miembro |

### 3.4 Peer Challenges API

**Base Path:** `/api/social/peer-challenges`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar desafios disponibles |
| GET | `/my` | Mis desafios (creados/participando) |
| GET | `/:id` | Detalle de desafio |
| POST | `/` | Crear desafio |
| PUT | `/:id` | Actualizar desafio |
| DELETE | `/:id` | Cancelar desafio |
| POST | `/:id/join` | Unirse a desafio |
| POST | `/:id/start` | Iniciar desafio |
| POST | `/:id/submit` | Enviar resultado |
| GET | `/:id/leaderboard` | Ver clasificacion |
| GET | `/:id/results` | Ver resultados finales |

### 3.5 Challenge Participants API

**Base Path:** `/api/social/challenges/:challengeId/participants`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar participantes |
| POST | `/` | Agregar participante |
| PUT | `/:id/score` | Actualizar puntuacion |
| DELETE | `/:id` | Remover participante |

---

## 4. DTOs Principales

```typescript
// CreateFriendshipDto
interface CreateFriendshipDto {
  friend_id: string;
  message?: string;
}

// FriendshipResponseDto
interface FriendshipResponseDto {
  id: string;
  user: UserSummaryDto;
  friend: UserSummaryDto;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
}

// CreateTeamDto
interface CreateTeamDto {
  name: string;
  description?: string;
  classroom_id?: string;
  max_members?: number;
  is_public?: boolean;
}

// CreatePeerChallengeDto
interface CreatePeerChallengeDto {
  title: string;
  description?: string;
  challenge_type: 'head_to_head' | 'multiplayer' | 'tournament' | 'leaderboard';
  module_id?: string;
  exercise_id?: string;
  max_participants?: number;
  time_limit_minutes?: number;
  rewards?: {
    xp?: number;
    ml_coins?: number;
  };
  is_public?: boolean;
}

// ChallengeParticipantResponseDto
interface ChallengeParticipantResponseDto {
  id: string;
  user: UserSummaryDto;
  participation_status: string;
  score: number;
  rank?: number;
  is_winner: boolean;
  time_spent_seconds?: number;
}
```

---

## 5. Funciones de Base de Datos

### 5.1 Funciones de Amistad

| Funcion | Descripcion |
|---------|-------------|
| `social_features.are_friends(user1_id, user2_id)` | Verifica si dos usuarios son amigos |
| `social_features.count_friends(user_id)` | Cuenta amigos de un usuario |
| `social_features.get_user_friends(user_id)` | Obtiene lista de amigos |
| `social_features.has_pending_friend_request(from_id, to_id)` | Verifica solicitud pendiente |
| `social_features.count_pending_friend_requests(user_id)` | Cuenta solicitudes pendientes |
| `social_features.accept_friend_request(request_id)` | Acepta solicitud y crea amistad |
| `social_features.reject_friend_request(request_id)` | Rechaza solicitud |
| `social_features.cancel_friend_request(request_id)` | Cancela solicitud enviada |
| `social_features.remove_friendship(user_id, friend_id)` | Elimina amistad |

### 5.2 Funciones de Equipo

| Funcion | Descripcion |
|---------|-------------|
| `social_features.sync_teacher_classroom_on_insert()` | Sincroniza teacher_classrooms |
| `social_features.cleanup_old_notifications(days)` | Limpia notificaciones antiguas |

---

## 6. RLS Policies

### 6.1 friendships
| Policy | Tipo | Descripcion |
|--------|------|-------------|
| `friendships_select_own` | SELECT | Ver propias amistades |
| `friendships_delete_own` | DELETE | Eliminar propias amistades |

### 6.2 friend_requests
| Policy | Tipo | Descripcion |
|--------|------|-------------|
| `friend_requests_select_own` | SELECT | Ver solicitudes propias |
| `friend_requests_insert_own` | INSERT | Crear solicitudes |
| `friend_requests_update_recipient` | UPDATE | Recipient puede responder |
| `friend_requests_delete_requester` | DELETE | Requester puede cancelar |

### 6.3 teams
| Policy | Tipo | Descripcion |
|--------|------|-------------|
| `teams_select_member` | SELECT | Miembros ven su equipo |
| `teams_select_admin` | SELECT | Admins ven todos |
| `teams_manage_admin` | ALL | Admins gestionan |
| `teams_update_member` | UPDATE | Miembros actualizan |

### 6.4 team_members
| Policy | Tipo | Descripcion |
|--------|------|-------------|
| `team_members_read_own` | SELECT | Ver propias membresías |

### 6.5 team_challenges
| Policy | Tipo | Descripcion |
|--------|------|-------------|
| `team_challenges_read_members` | SELECT | Miembros ven desafios del equipo |

---

## 7. Dependencias

### 7.1 Dependencias de Schema
- `auth_management.profiles` - Usuarios
- `auth_management.tenants` - Multi-tenancy
- `educational_content.modules` - Modulos educativos
- `educational_content.exercises` - Ejercicios

### 7.2 Dependencias de Backend
- `FriendshipsService`
- `TeamsService`
- `TeamMembersService`
- `PeerChallengesService`
- `ChallengeParticipantsService`

---

## 8. Entities Backend

| Entity | Archivo |
|--------|---------|
| Friendship | `entities/friendship.entity.ts` |
| FriendRequest | `entities/friend-request.entity.ts` |
| School | `entities/school.entity.ts` |
| ClassroomMember | `entities/classroom-member.entity.ts` |
| Team | `entities/team.entity.ts` (implícito) |
| TeamMember | `entities/team-member.entity.ts` |
| TeamChallenge | `entities/team-challenge.entity.ts` |
| PeerChallenge | `entities/peer-challenge.entity.ts` |
| ChallengeParticipant | `entities/challenge-participant.entity.ts` |
| ChallengeResult | `entities/challenge-result.entity.ts` |
| DiscussionThread | `entities/discussion-thread.entity.ts` |
| TeacherClassroom | `entities/teacher-classroom.entity.ts` |
| UserActivity | `entities/user-activity.entity.ts` |
| UserFollow | `entities/user-follow.entity.ts` |

---

## 9. Servicios Backend

| Service | Responsabilidad |
|---------|-----------------|
| `FriendshipsService` | Gestión de amistades |
| `SchoolsService` | Gestión de escuelas |
| `ClassroomsService` | Gestión de salones |
| `ClassroomMembersService` | Membresías de salones |
| `TeamsService` | Gestión de equipos |
| `TeamMembersService` | Membresías de equipos |
| `TeamChallengesService` | Desafíos de equipo |
| `PeerChallengesService` | Desafíos P2P |
| `ChallengeParticipantsService` | Participantes de desafíos |
| `UserActivitiesService` | Actividades de usuario |
| `UserFollowsService` | Sistema de seguimiento |

---

## 10. Referencias

- **DDL:** `apps/database/ddl/schemas/social_features/`
- **Backend Module:** `apps/backend/src/modules/social/`
- **Entities:** `apps/backend/src/modules/social/entities/`
- **Services:** `apps/backend/src/modules/social/services/`
- **DTOs:** `apps/backend/src/modules/social/dto/`
- **Epic:** docs/03-fase-extensiones/EXT-009-peer-challenges/

---

*Documento generado automaticamente - BLOQUE 2 Plan Maestro GAMILIT*
*Fecha: 2026-02-03 | Version: 1.0.0*
