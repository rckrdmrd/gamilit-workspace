# US-GAM-002: Sistema de Amigos

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-GAM-002 |
| **Épica** | EAI-003-EXT - Gamificación Social |
| **Módulo** | gamification, social_features |
| **Prioridad** | P1 |
| **Story Points** | 8 |
| **Sprint** | Sprint 9 |
| **Estado** | Backlog |
| **Asignado a** | Backend-Agent, Frontend-Agent |

---

### Historia de Usuario

**Como** estudiante,
**quiero** agregar amigos y gestionar mis conexiones sociales,
**para** competir y compararme con mis compañeros cercanos.

### Descripción Detallada

Implementar el sistema de amigos que permite a los estudiantes enviar solicitudes de amistad, aceptar/rechazar solicitudes, y mantener una lista de amigos. Esta funcionalidad habilita el leaderboard de amigos y futura interacción social.

**Funcionalidades:**
1. Buscar usuarios por nombre o email
2. Enviar solicitud de amistad
3. Ver solicitudes pendientes (enviadas y recibidas)
4. Aceptar/rechazar solicitudes
5. Eliminar amigo
6. Ver lista de amigos

---

### Criterios de Aceptación

**Escenario 1: Buscar y enviar solicitud**
```gherkin
DADO que busco un compañero por nombre "María"
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
Y el solicitante recibe notificación de mi respuesta
```

**Escenario 3: Gestionar amigos**
```gherkin
DADO que tengo 10 amigos
CUANDO accedo a "Mis Amigos"
ENTONCES veo lista ordenada por última actividad
Y puedo ver perfil de cada amigo
Y puedo eliminar amigo (requiere confirmación)
```

**Escenario 4: Privacidad**
```gherkin
DADO que no soy amigo de Juan
CUANDO intento ver su progreso detallado
ENTONCES solo veo información pública (nombre, avatar, rango)
Y no veo XP exacto, ejercicios completados, ni actividad
```

### Criterios Adicionales

- [ ] Límite de 100 amigos por usuario
- [ ] Rate limiting: máximo 10 solicitudes por hora
- [ ] Notificaciones in-app para solicitudes
- [ ] No se puede enviar solicitud a usuarios bloqueados

---

### Tareas Técnicas

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
- [ ] FE-GAM-002: Implementar componentes vacíos
  - FriendCard.tsx
  - FriendsList.tsx
  - FriendSearch.tsx
  - FriendRequests.tsx
  - AddFriend.tsx
  - ActivityFeed.tsx
  - FriendRecommendations.tsx
- [ ] FE-GAM-003: Conectar friendsStore con API real

**Tests:**
- [ ] TEST-GAM-002: Tests de integración amigos

---

### Dependencias

**Depende de:**
- [ ] NotificationsService - Estado: Done
- [ ] UsersService - Estado: Done

**Bloquea:**
- [ ] US-GAM-003: Leaderboard de Amigos
- [ ] Desafíos PvP (futuro)

---

### Notas Técnicas

**Endpoints involucrados:**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/v1/friends | Lista de amigos |
| POST | /api/v1/friends/request | Enviar solicitud |
| POST | /api/v1/friends/request/:id/respond | Responder solicitud |
| DELETE | /api/v1/friends/:friendId | Eliminar amigo |
| GET | /api/v1/friends/search | Buscar usuarios |
| GET | /api/v1/friends/requests | Solicitudes pendientes |

**Entidades/Tablas:**
- `social_features.friendships`: Relación de amistad (bidireccional)
- `social_features.friend_requests`: Solicitudes pendientes

**Componentes UI:**
- `FriendsPage`: Página principal de amigos

---

### Definition of Ready (DoR)

- [x] Historia claramente escrita (quién, qué, por qué)
- [x] Criterios de aceptación definidos
- [x] Story points estimados
- [x] Dependencias identificadas
- [x] Sin bloqueadores
- [x] MockData disponible en frontend

### Definition of Done (DoD)

- [ ] Código implementado según criterios
- [ ] Tests unitarios escritos y pasando
- [ ] Tests de integración pasando
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Inventarios actualizados
- [ ] Traza registrada
- [ ] QA aprobado

---

### Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-12-05 | Creación | Requirements-Analyst |

---

**Creada por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Última actualización:** 2025-12-05
