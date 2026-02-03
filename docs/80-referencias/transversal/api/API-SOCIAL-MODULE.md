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

## AUTENTICACION Y AUTORIZACION

> **Actualizado:** 2026-01-07 | Revision de documentacion

### Headers Requeridos

| Header | Valor | Requerido | Descripcion |
|--------|-------|-----------|-------------|
| `Authorization` | `Bearer {jwt_token}` | Si | Token JWT de sesion |
| `X-Tenant-ID` | `{tenant_uuid}` | Si | Identificador del tenant (multi-tenant) |
| `Content-Type` | `application/json` | Si (POST/PATCH) | Tipo de contenido |
| `Accept` | `application/json` | No | Formato de respuesta esperado |

### Obtencion del Token JWT

El token se obtiene mediante el endpoint de autenticacion:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@escuela.edu",
  "password": "contraseña_segura"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Roles y Permisos por Endpoint

| Endpoint | Metodo | Roles Permitidos | Notas |
|----------|--------|------------------|-------|
| `/schools` | GET | admin, teacher | Listar escuelas del tenant |
| `/schools` | POST | admin | Solo administradores |
| `/schools/:id` | PATCH/DELETE | admin | Solo administradores |
| `/classrooms` | GET | admin, teacher, student | Filtrado por rol |
| `/classrooms` | POST | admin, teacher | Crear aulas |
| `/classrooms/:id` | PATCH | admin, teacher (owner) | Solo propietario o admin |
| `/classrooms/:id` | DELETE | admin | Solo administradores |
| `/classrooms/:id/members` | GET | admin, teacher, student (member) | Miembros del aula |
| `/classrooms/:id/students/*` | POST/DELETE | admin, teacher (owner) | Gestionar estudiantes |
| `/teams/*` | ALL | admin, teacher, student | Segun contexto |
| `/users/:userId/friends/*` | ALL | owner, admin | Solo propias amistades |
| `/peer-challenges/*` | ALL | student | Solo estudiantes |
| `/activities/*` | GET | all | Activity feed publico |

### Codigos de Error HTTP

| Codigo | Significado | Ejemplo |
|--------|-------------|---------|
| 200 | OK | Operacion exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Datos invalidos en request |
| 401 | Unauthorized | Token faltante o invalido |
| 403 | Forbidden | Sin permisos para esta accion |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Codigo duplicado, capacidad excedida |
| 422 | Unprocessable Entity | Validacion fallida |
| 500 | Internal Server Error | Error del servidor |

### Ejemplo de Request Autenticado

```http
GET /api/v1/social/classrooms HTTP/1.1
Host: api.gamilit.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440000
Accept: application/json
```

---

## EJEMPLOS DE REQUEST/RESPONSE

### Schools - Listar Escuelas

**Request:**
```http
GET /api/v1/social/schools?page=1&limit=10
Authorization: Bearer {token}
X-Tenant-ID: {tenant_id}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "school-uuid-1",
      "name": "Escuela Primaria Benito Juarez",
      "code": "EPBJ001",
      "tenantId": "tenant-uuid",
      "address": "Calle Principal 123, Ciudad",
      "phone": "+52 555 123 4567",
      "email": "contacto@escuela.edu",
      "principalId": "user-uuid-principal",
      "isActive": true,
      "settings": {
        "allowTeamCreation": true,
        "maxClassroomSize": 35
      },
      "createdAt": "2026-01-07T10:00:00Z",
      "updatedAt": "2026-01-07T10:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Schools - Crear Escuela

**Request:**
```http
POST /api/v1/social/schools
Authorization: Bearer {token}
X-Tenant-ID: {tenant_id}
Content-Type: application/json

{
  "name": "Escuela Secundaria Miguel Hidalgo",
  "code": "ESMH002",
  "address": "Av. Reforma 456, Ciudad",
  "phone": "+52 555 987 6543",
  "email": "info@secundaria.edu",
  "principalId": "user-uuid-director"
}
```

**Response (201 Created):**
```json
{
  "id": "school-uuid-new",
  "name": "Escuela Secundaria Miguel Hidalgo",
  "code": "ESMH002",
  "tenantId": "tenant-uuid",
  "isActive": true,
  "createdAt": "2026-01-07T15:30:00Z"
}
```

### Classrooms - Listar Aulas

**Request:**
```http
GET /api/v1/social/classrooms?schoolId={school_id}&isActive=true
Authorization: Bearer {token}
X-Tenant-ID: {tenant_id}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "classroom-uuid-1",
      "name": "3ro A - Matematicas",
      "code": "3A-MAT-2026",
      "schoolId": "school-uuid",
      "teacherId": "teacher-uuid",
      "grade": "3ro",
      "section": "A",
      "subject": "Matematicas",
      "capacity": 35,
      "currentEnrollment": 28,
      "isActive": true,
      "schedule": {
        "days": ["lunes", "miercoles", "viernes"],
        "startTime": "08:00",
        "endTime": "09:30"
      },
      "createdAt": "2026-01-07T10:00:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

### Classrooms - Inscribir Estudiante

**Request:**
```http
POST /api/v1/social/classrooms/{classroom_id}/students/{student_id}
Authorization: Bearer {token}
X-Tenant-ID: {tenant_id}
```

**Response (201 Created):**
```json
{
  "id": "membership-uuid",
  "classroomId": "classroom-uuid",
  "userId": "student-uuid",
  "role": "student",
  "status": "active",
  "enrolledAt": "2026-01-07T16:00:00Z"
}
```

**Response (409 Conflict - Capacidad Excedida):**
```json
{
  "statusCode": 409,
  "message": "El aula ha alcanzado su capacidad maxima (35 estudiantes)",
  "error": "Conflict"
}
```

### Teams - Crear Equipo

**Request:**
```http
POST /api/v1/social/teams
Authorization: Bearer {token}
X-Tenant-ID: {tenant_id}
Content-Type: application/json

{
  "name": "Los Matematicos",
  "classroomId": "classroom-uuid",
  "maxMembers": 5,
  "description": "Equipo para competencias de matematicas"
}
```

**Response (201 Created):**
```json
{
  "id": "team-uuid",
  "name": "Los Matematicos",
  "code": "TEAM-ABC123",
  "classroomId": "classroom-uuid",
  "creatorId": "student-uuid",
  "maxMembers": 5,
  "currentMembers": 1,
  "totalScore": 0,
  "totalXp": 0,
  "isActive": true,
  "createdAt": "2026-01-07T16:30:00Z"
}
```

### Friendships - Enviar Solicitud

**Request:**
```http
POST /api/v1/social/friendships/request
Authorization: Bearer {token}
X-Tenant-ID: {tenant_id}
Content-Type: application/json

{
  "friendId": "user-uuid-friend"
}
```

**Response (201 Created):**
```json
{
  "id": "friendship-uuid",
  "requesterId": "current-user-uuid",
  "addresseeId": "user-uuid-friend",
  "status": "pending",
  "createdAt": "2026-01-07T17:00:00Z"
}
```

### Peer Challenges - Crear Desafio

**Request:**
```http
POST /api/v1/social/peer-challenges
Authorization: Bearer {token}
X-Tenant-ID: {tenant_id}
Content-Type: application/json

{
  "title": "Reto de Lectura Rapida",
  "description": "Quien complete mas ejercicios de comprension en 30 minutos",
  "type": "head_to_head",
  "exerciseIds": ["exercise-uuid-1", "exercise-uuid-2"],
  "wagerAmount": 50,
  "maxParticipants": 2,
  "startAt": "2026-01-08T10:00:00Z",
  "endAt": "2026-01-08T10:30:00Z"
}
```

**Response (201 Created):**
```json
{
  "id": "challenge-uuid",
  "title": "Reto de Lectura Rapida",
  "type": "head_to_head",
  "status": "open",
  "creatorId": "student-uuid",
  "wagerAmount": 50,
  "maxParticipants": 2,
  "currentParticipants": 1,
  "rewards": {
    "xp": 100,
    "mlCoins": 50
  },
  "startAt": "2026-01-08T10:00:00Z",
  "endAt": "2026-01-08T10:30:00Z",
  "createdAt": "2026-01-07T17:30:00Z"
}
```

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
