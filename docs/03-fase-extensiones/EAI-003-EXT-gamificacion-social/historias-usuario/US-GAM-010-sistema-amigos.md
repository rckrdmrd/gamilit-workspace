---
id: "US-GAM-010"
title: "Sistema de Amigos"
type: "User Story"
status: "Backlog"
priority: "P1"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-003-EXT"
story_points: 8
sprint: "Sprint 9"
labels: ["gamification", "social_features", "friends"]
created_date: "2025-12-05"
updated_date: "2026-01-04"
previous_id: "US-GAM-002"
---

# US-GAM-010: Sistema de Amigos

> **NOTA:** Este archivo fue renombrado de US-GAM-002 a US-GAM-010 para resolver
> conflicto de ID duplicado. El ID original US-GAM-002 pertenece a
> "Sistema de experiencia XP" en EAI-003.

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-GAM-010 |
| **Epica** | EAI-003-EXT - Gamificacion Social |
| **Modulo** | gamification, social_features |
| **Prioridad** | P1 |
| **Story Points** | 8 |
| **Sprint** | Sprint 9 |
| **Estado** | Backlog |
| **Asignado a** | Backend-Agent, Frontend-Agent |

---

### Historia de Usuario

**Como** estudiante,
**quiero** agregar amigos y gestionar mis conexiones sociales,
**para** competir y compararme con mis companeros cercanos.

### Descripcion Detallada

Implementar el sistema de amigos que permite a los estudiantes enviar solicitudes de amistad, aceptar/rechazar solicitudes, y mantener una lista de amigos. Esta funcionalidad habilita el leaderboard de amigos y futura interaccion social.

**Funcionalidades:**
1. Buscar usuarios por nombre o email
2. Enviar solicitud de amistad
3. Ver solicitudes pendientes (enviadas y recibidas)
4. Aceptar/rechazar solicitudes
5. Eliminar amigo
6. Ver lista de amigos

---

### Criterios de Aceptacion

**Escenario 1: Buscar y enviar solicitud**
```gherkin
DADO que busco un companero por nombre "Maria"
CUANDO encuentro su perfil
ENTONCES puedo ver su avatar, nombre, rango y nivel
Y puedo enviar solicitud de amistad si no somos amigos
Y no puedo enviar si ya hay solicitud pendiente
```

**Escenario 2: Recibir y aceptar solicitud**
```gherkin
DADO que tengo 3 solicitudes de amistad pendientes
CUANDO accedo a "Solicitudes de Amistad"
ENTONCES veo lista de usuarios que me enviaron solicitud
Y puedo aceptar (se crea amistad) o rechazar (se elimina solicitud)
Y el solicitante recibe notificacion de mi respuesta
```

**Escenario 3: Gestionar amigos**
```gherkin
DADO que tengo 10 amigos
CUANDO accedo a "Mis Amigos"
ENTONCES veo lista ordenada por ultima actividad
Y puedo ver perfil de cada amigo
Y puedo eliminar amigo (requiere confirmacion)
```

**Escenario 4: Privacidad**
```gherkin
DADO que no soy amigo de Juan
CUANDO intento ver su progreso detallado
ENTONCES solo veo informacion publica (nombre, avatar, rango)
Y no veo XP exacto, ejercicios completados, ni actividad
```

### Criterios Adicionales

- [ ] Limite de 100 amigos por usuario
- [ ] Rate limiting: maximo 10 solicitudes por hora
- [ ] Notificaciones in-app para solicitudes
- [ ] No se puede enviar solicitud a usuarios bloqueados

---

### Tareas Tecnicas

**Database:**
- [ ] DB-GAM-003: Crear tabla `social_features.friendships`
  ```sql
  friendships (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    friend_id UUID REFERENCES users(id),
    created_at TIMESTAMP,
    UNIQUE(user_id, friend_id)
  )
  ```
- [ ] DB-GAM-004: Crear tabla `social_features.friend_requests`
  ```sql
  friend_requests (
    id UUID PRIMARY KEY,
    requester_id UUID REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP,
    responded_at TIMESTAMP
  )
  ```
- [ ] DB-GAM-005: Crear RLS policies para privacidad

**Backend:**
- [ ] BE-GAM-002: Crear FriendsService
  - searchUsers(query: string)
  - sendRequest(requesterId, recipientId)
  - respondToRequest(requestId, accept: boolean)
  - removeFriend(userId, friendId)
  - getFriends(userId)
  - getPendingRequests(userId)
- [ ] BE-GAM-003: Crear FriendsController
  - GET /friends
  - POST /friends/request
  - POST /friends/request/:id/respond
  - DELETE /friends/:friendId
  - GET /friends/search?q=

**Frontend:**
- [ ] FE-GAM-002: Implementar componentes vacios
  - FriendCard.tsx
  - FriendsList.tsx
  - FriendSearch.tsx
  - FriendRequests.tsx
  - AddFriend.tsx
  - ActivityFeed.tsx
  - FriendRecommendations.tsx
- [ ] FE-GAM-003: Conectar friendsStore con API real

**Tests:**
- [ ] TEST-GAM-002: Tests de integracion amigos

---

### Dependencias

**Depende de:**
- [x] NotificationsService - Estado: Done
- [x] UsersService - Estado: Done

**Bloquea:**
- [ ] US-GAM-003: Leaderboard de Amigos
- [ ] Desafios PvP (futuro)

---

### Notas Tecnicas

**Endpoints involucrados:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | /api/v1/friends | Lista de amigos |
| POST | /api/v1/friends/request | Enviar solicitud |
| POST | /api/v1/friends/request/:id/respond | Responder solicitud |
| DELETE | /api/v1/friends/:friendId | Eliminar amigo |
| GET | /api/v1/friends/search | Buscar usuarios |
| GET | /api/v1/friends/requests | Solicitudes pendientes |

**Entidades/Tablas:**
- `social_features.friendships`: Relacion de amistad (bidireccional)
- `social_features.friend_requests`: Solicitudes pendientes

**Componentes UI:**
- `FriendsPage`: Pagina principal de amigos

---

### Definition of Ready (DoR)

- [x] Historia claramente escrita (quien, que, por que)
- [x] Criterios de aceptacion definidos
- [x] Story points estimados
- [x] Dependencias identificadas
- [x] Sin bloqueadores
- [x] MockData disponible en frontend

### Definition of Done (DoD)

- [ ] Codigo implementado segun criterios
- [ ] Tests unitarios escritos y pasando
- [ ] Tests de integracion pasando
- [ ] Code review aprobado
- [ ] Documentacion actualizada
- [ ] Inventarios actualizados
- [ ] Traza registrada
- [ ] QA aprobado

---

### Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-12-05 | Creacion | Requirements-Analyst |
| 2026-01-04 | Renombrado de US-GAM-002 a US-GAM-010, agregado YAML front-matter | Claude |

---

**Creada por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Ultima actualizacion:** 2026-01-04
