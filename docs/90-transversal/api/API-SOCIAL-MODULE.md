# API SOCIAL MODULE

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Modulo:** Social
**Version:** 1.0
**Fecha:** 2025-12-23
**Base URL:** `/api/v1/social`

---

## RESUMEN

| Metrica | Valor |
|---------|-------|
| **Controllers** | 10 |
| **Services** | 10 |
| **Endpoints** | 106 |
| **Entidades** | 13 |

---

## CONTROLLERS

1. `SchoolsController` - Instituciones educativas
2. `ClassroomsController` - Aulas virtuales
3. `ClassroomMembersController` - Membresia en aulas
4. `TeamsController` - Equipos colaborativos
5. `TeamMembersController` - Membresia en equipos
6. `TeamChallengesController` - Desafios de equipos
7. `FriendshipsController` - Amistades
8. `PeerChallengesController` - Desafios peer-to-peer
9. `ChallengeParticipantsController` - Participantes en desafios
10. `UserActivitiesController` - Activity Feed

---

## 1. SCHOOLS ENDPOINTS

**Base:** `/social/schools`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/schools` | Listar escuelas |
| GET | `/schools/:id` | Obtener escuela por ID |
| GET | `/schools/code/:code` | Obtener por codigo |
| POST | `/schools` | Crear escuela |
| PATCH | `/schools/:id` | Actualizar escuela |
| DELETE | `/schools/:id` | Desactivar escuela |
| GET | `/schools/:id/stats` | Estadisticas |
| PATCH | `/schools/:id/settings` | Actualizar config |

---

## 2. CLASSROOMS ENDPOINTS

**Base:** `/social/classrooms`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/classrooms` | Listar aulas |
| GET | `/classrooms/:id` | Obtener aula |
| GET | `/classrooms/code/:code` | Obtener por codigo |
| POST | `/classrooms` | Crear aula |
| PATCH | `/classrooms/:id` | Actualizar aula |
| DELETE | `/classrooms/:id` | Desactivar aula |
| GET | `/classrooms/:id/stats` | Estadisticas |
| GET | `/classrooms/:id/members` | Listar miembros |
| POST | `/classrooms/:id/students/:studentId` | Inscribir estudiante |
| DELETE | `/classrooms/:id/students/:studentId` | Retirar estudiante |
| PATCH | `/classrooms/:id/schedule` | Actualizar horario |
| GET | `/teachers/:teacherId/classrooms/active` | Aulas del profesor |

---

## 3. CLASSROOM MEMBERS ENDPOINTS

**Base:** `/social/classroom-members`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/classrooms/:id` | Obtener miembros |
| GET | `/users/:userId` | Aulas del usuario |
| GET | `/classrooms/:id/users/:userId` | Membresia especifica |
| POST | `/` | Inscribir estudiante |
| PATCH | `/:id/status` | Actualizar estado |
| PATCH | `/:id/grade` | Registrar calificacion |
| PATCH | `/:id/attendance` | Actualizar asistencia |
| POST | `/:id/withdraw` | Marcar retirado |
| GET | `/classrooms/:id/active` | Miembros activos |
| GET | `/classrooms/:id/leaderboard` | Leaderboard del aula |

**Estados:** active, inactive, withdrawn, completed

---

## 4. TEAMS ENDPOINTS

**Base:** `/social/teams`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/teams` | Listar equipos |
| GET | `/teams/:id` | Obtener equipo |
| GET | `/teams/code/:code` | Obtener por codigo |
| POST | `/teams` | Crear equipo |
| PATCH | `/teams/:id` | Actualizar equipo |
| DELETE | `/teams/:id` | Eliminar equipo |
| POST | `/teams/:id/members/:userId` | Agregar miembro |
| DELETE | `/teams/:id/members/:userId` | Remover miembro |
| PATCH | `/teams/:id/score` | Actualizar puntuacion |
| POST | `/teams/:id/xp` | Agregar XP |
| GET | `/teams/:id/stats` | Estadisticas |
| GET | `/teams/:id/members` | Listar miembros |
| GET | `/classrooms/:id/teams/leaderboard` | Leaderboard equipos |

---

## 5. TEAM MEMBERS ENDPOINTS

**Base:** `/social/team-members`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/teams/:teamId` | Miembros del equipo |
| GET | `/users/:userId` | Equipos del usuario |
| GET | `/teams/:id/users/:userId` | Membresia especifica |
| POST | `/` | Unirse a equipo |
| PATCH | `/:id/role` | Actualizar rol |
| DELETE | `/:id` | Salir del equipo |
| GET | `/teams/:id/active` | Miembros activos |
| POST | `/teams/:id/transfer-ownership` | Transferir propiedad |

**Roles:** owner, admin, member

---

## 6. TEAM CHALLENGES ENDPOINTS

**Base:** `/social/team-challenges`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/teams/:teamId` | Desafios del equipo |
| GET | `/challenges/:id` | Equipos en desafio |
| GET | `/teams/:id/challenges/:id` | Registro especifico |
| POST | `/` | Asignar desafio |
| PATCH | `/:id/status` | Actualizar estado |
| PATCH | `/:id/score` | Registrar puntuacion |
| POST | `/:id/complete` | Completar |
| POST | `/:id/fail` | Marcar fallido |
| GET | `/challenges/:id/leaderboard` | Leaderboard |

**Estados:** active, in_progress, completed, failed

---

## 7. FRIENDSHIPS ENDPOINTS

**Base:** `/social/users/:userId/friends`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/users/:userId/friends` | Listar amigos |
| GET | `/users/:userId/friends/pending` | Solicitudes pendientes |
| GET | `/users/:userId/friends/sent` | Solicitudes enviadas |
| POST | `/friendships/request` | Enviar solicitud |
| PATCH | `/friendships/:id/accept` | Aceptar |
| PATCH | `/friendships/:id/reject` | Rechazar |
| POST | `/users/:userId/block/:friendId` | Bloquear usuario |
| DELETE | `/users/:userId/block/:friendId` | Desbloquear |
| DELETE | `/users/:userId/friends/:friendId` | Eliminar amistad |
| GET | `/users/:id1/:id2/friendship` | Verificar estado |

**Estados:** pending, accepted, rejected, blocked

---

## 8. PEER CHALLENGES ENDPOINTS (EPIC EXT-009)

**Base:** `/social/peer-challenges`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/` | Crear desafio P2P |
| GET | `/` | Listar desafios |
| GET | `/open` | Desafios abiertos |
| GET | `/active` | Desafios activos |
| GET | `/:id` | Obtener desafio |
| GET | `/creator/:userId` | Desafios del creador |
| PATCH | `/:id` | Actualizar desafio |
| PATCH | `/:id/start` | Iniciar desafio |
| PATCH | `/:id/complete` | Completar |
| PATCH | `/:id/cancel` | Cancelar |
| PATCH | `/mark-expired` | Marcar expirados |
| DELETE | `/:id` | Eliminar |
| GET | `/stats/by-type` | Stats por tipo |
| GET | `/stats/by-status` | Stats por estado |

**Tipos:** head_to_head, multiplayer, tournament, leaderboard
**Estados:** open, full, in_progress, completed, cancelled, expired

---

## 9. CHALLENGE PARTICIPANTS ENDPOINTS (EPIC EXT-009)

**Base:** `/social/challenge-participants`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/` | Agregar participante |
| GET | `/challenge/:id` | Participantes |
| GET | `/challenge/:id/user/:userId` | Participacion especifica |
| GET | `/user/:userId` | Desafios del usuario |
| PATCH | `/challenge/:id/user/:userId/accept` | Aceptar invitacion |
| PATCH | `/challenge/:id/user/:userId/status` | Actualizar estado |
| PATCH | `/challenge/:id/user/:userId/score` | Actualizar score |
| PATCH | `/challenge/:id/rankings` | Calcular rankings |
| PATCH | `/challenge/:id/winner` | Determinar ganador |
| POST | `/challenge/:id/user/:userId/rewards` | Distribuir recompensa |
| POST | `/challenge/:id/rewards` | Distribuir a todos |
| PATCH | `/challenge/:id/user/:userId/forfeit` | Abandonar |
| PATCH | `/challenge/:id/user/:userId/disqualify` | Descalificar |
| DELETE | `/challenge/:id/user/:userId` | Eliminar participante |
| GET | `/user/:userId/stats` | Estadisticas usuario |

**Estados:** invited, accepted, in_progress, completed, forfeit, disqualified

---

## 10. USER ACTIVITIES ENDPOINTS (TASK 2.5)

**Base:** `/social/activities`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/users/:userId/activities/me` | Mis actividades |
| GET | `/activities/feed` | Feed de amigos |
| POST | `/activities` | Crear actividad |
| GET | `/activities/:id` | Obtener actividad |
| GET | `/activities/public/all` | Actividades publicas |

**Tipos:** achievement, exercise, rankup, level_up

---

## ENTIDADES

| Entidad | Descripcion |
|---------|-------------|
| School | Instituciones educativas |
| Classroom | Aulas virtuales |
| ClassroomMember | Membresia en aulas |
| Team | Equipos colaborativos |
| TeamMember | Membresia en equipos |
| TeamChallenge | Desafios de equipos |
| Friendship | Relaciones de amistad |
| PeerChallenge | Desafios peer-to-peer |
| ChallengeParticipant | Participantes en desafios |
| UserActivity | Activity Feed |
| TeacherClassroom | Relacion profesor-aula |
| AssignmentClassroom | Asignaciones a aulas |
| DiscussionThread | Hilos de discusion |

---

## SERVICES

1. `SchoolsService` - CRUD escuelas, estadisticas
2. `ClassroomsService` - CRUD aulas, inscripcion
3. `ClassroomMembersService` - Membresia, calificaciones
4. `TeamsService` - CRUD equipos, leaderboards
5. `TeamMembersService` - Membresia, roles
6. `TeamChallengesService` - Asignacion desafios
7. `FriendshipsService` - Gestión amistades
8. `PeerChallengesService` - Desafios P2P
9. `ChallengeParticipantsService` - Participantes, recompensas
10. `UserActivitiesService` - Activity Feed

---

## CARACTERISTICAS

### Multi-Tenancy
- Escuelas asociadas a tenant_id
- Filtrado automatico en consultas

### Gamificacion
- Puntuaciones (score, total_score)
- Experiencia (XP, total_xp)
- Leaderboards por aula, equipo, desafio
- Recompensas (XP + ML Coins)

### Gestion de Miembros
- Estados: active, inactive, withdrawn, completed
- Calificaciones y asistencia
- Roles: owner, admin, member

### Validaciones
- Codigos unicos por escuela, aula, equipo
- Capacidad maxima
- Control de permisos

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
