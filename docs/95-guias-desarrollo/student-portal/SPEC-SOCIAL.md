# SPEC-SOCIAL - Student Portal Social Features

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

El sistema social de GAMILIT permite interacción entre estudiantes:
- **Sistema de Amigos** - Solicitudes, lista, actividades
- **Gremios (Guilds)** - Grupos colaborativos con desafíos
- **Notificaciones** - Centro de notificaciones multi-canal

---

## 2. Páginas Relacionadas

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Friends | `pages/FriendsPage.tsx` | Sistema de amigos |
| Guilds | `pages/GuildsPage.tsx` | Sistema de gremios |
| Notifications | `pages/NotificationsPage.tsx` | Centro de notificaciones |

---

## 3. Sistema de Amigos

### 3.1 Funcionalidades

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Lista de amigos | ✅ | Avatares, nivel, XP, estado online |
| Búsqueda | ⚠️ | Solo filtra recomendaciones (falta endpoint global) |
| Solicitudes | ✅ | Enviar/aceptar/rechazar |
| Recomendaciones | ✅ | Basadas en amigos mutuos |
| Feed de actividades | ✅ | Actividades con "praise" |
| Ver perfil | ❌ | Botón sin implementación |
| Eliminar amigos | ✅ | Con confirmación |

### 3.2 APIs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `fetchFriends(userId)` | GET | Lista de amigos |
| `fetchPendingRequests(userId)` | GET | Solicitudes pendientes |
| `fetchRecommendations(userId)` | GET | Recomendaciones |
| `fetchActivities(userId)` | GET | Actividades de amigos |
| `sendFriendRequest(userId)` | POST | Enviar solicitud |
| `acceptFriendRequest(requestId)` | PUT | Aceptar solicitud |
| `declineFriendRequest(requestId)` | DELETE | Rechazar solicitud |
| `removeFriend(userId)` | DELETE | Eliminar amigo |
| `praiseActivity(activityId)` | POST | Dar "praise" a actividad |

### 3.3 Tipos

```typescript
interface Friend {
  userId: string;
  username: string;
  rank: string;
  level: number;
  xp: number;
  mlCoins: number;
  isOnline: boolean;
  lastActive: Date;
}

interface FriendRequest {
  id: string;
  senderName: string;
  senderRank: string;
  senderLevel: number;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
}
```

---

## 4. Sistema de Gremios

### 4.1 Funcionalidades

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Descubrir gremios | ✅ | Lista pública con búsqueda |
| Crear gremio | ✅ | Modal con validaciones |
| Unirse | ✅ | Validación de requisitos |
| Panel de mi gremio | ✅ | Stats, miembros |
| Desafíos | ✅ | Colaborativos/competitivos |
| Salir del gremio | ✅ | Con confirmación |
| Chat de gremio | ❌ | No implementado |

### 4.2 APIs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `fetchAllGuilds()` | GET | Lista pública de gremios |
| `fetchUserGuild(userId)` | GET | Gremio actual del usuario |
| `fetchGuildMembers(guildId)` | GET | Miembros del gremio |
| `joinGuild(guildId)` | POST | Unirse a gremio |
| `leaveGuild(guildId)` | DELETE | Salir del gremio |
| `createGuild(data)` | POST | Crear nuevo gremio |

### 4.3 Tipos

```typescript
interface Guild {
  id: string;
  name: string;
  description: string;
  level: number;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  status: 'active' | 'recruiting' | 'full' | 'inactive';
  requirements?: { minLevel: number };
  stats: {
    totalExercisesCompleted: number;
    totalMlCoinsEarned: number;
    totalAchievements: number;
    averageScore: number;
  };
}

interface GuildMember {
  userId: string;
  username: string;
  rank: string;
  role: 'leader' | 'officer' | 'member';
  contributionScore: number;
}
```

### 4.4 Roles

| Rol | Icono | Permisos |
|-----|-------|----------|
| Leader | 👑 | Todo |
| Officer | ⭐ | Gestión de miembros |
| Member | - | Participación |

---

## 5. Sistema de Notificaciones

### 5.1 Funcionalidades

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Centro de notificaciones | ✅ | Paginación, filtros |
| 11 tipos de notificación | ✅ | Ver sección 5.3 |
| Marcar como leída | ✅ | Individual y masiva |
| Eliminar | ✅ | Individual |
| Filtros por estado | ✅ | Todas, leídas, no leídas |
| Filtros por tipo | ✅ | Dropdown dinámico |
| WebSocket real-time | ⚠️ | Hooks disponibles, no conectados |
| Push notifications | ✅ | Store preparado (EXT-003) |

### 5.2 APIs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `getNotifications(options)` | GET | Lista con filtros |
| `getUnreadCount()` | GET | Contador sin leer |
| `markAsRead(notificationId)` | PUT | Marcar individual |
| `markAllAsRead()` | PUT | Marcar todas |
| `deleteNotification(id)` | DELETE | Eliminar individual |
| `clearAll()` | DELETE | Eliminar todas |

### 5.3 Tipos de Notificación

| Tipo | Descripción | Color |
|------|-------------|-------|
| achievement_unlocked | Logro desbloqueado | Amarillo |
| rank_promoted | Subida de rango | Púrpura |
| mission_completed | Misión completada | Verde |
| mission_expired | Misión expirada | Rojo |
| friend_request | Solicitud de amistad | Azul |
| friend_accepted | Amistad aceptada | Verde |
| assignment_created | Nueva tarea | Azul |
| assignment_graded | Tarea calificada | Verde |
| module_unlocked | Módulo desbloqueado | Púrpura |
| coins_received | ML Coins recibidas | Amarillo |
| system_announcement | Anuncio del sistema | Gris |

---

## 6. Hooks

| Hook | Archivo | Descripción |
|------|---------|-------------|
| useFriends | `features/gamification/social/hooks/useFriends` | Store de amigos |
| useGuilds | `features/gamification/social/hooks/useGuilds` | Store de gremios |
| useNotificationsStore | `features/notifications/store/notificationsStore` | Store de notificaciones |
| useUserClassroom | `hooks/useUserClassroom.ts` | Aula del usuario |
| useWebSocket | `features/notifications/hooks/useWebSocket` | WebSocket (no conectado) |
| usePushNotifications | `features/notifications/hooks/usePushNotifications` | Push notifications |

---

## 7. Gaps Conocidos

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| GAP-P0-003 | Sin búsqueda global de usuarios | Alta | Pendiente |
| GAP-P0-004 | WebSocket no conectado a UI | Media | Pendiente |
| GAP-P1-011 | View Profile button vacío | Media | Pendiente |
| GAP-P1-012 | Sin chat de gremio | Media | Backlog |
| GAP-P2-014 | Sin validación de ya en gremio | Baja | Pendiente |
| GAP-P2-015 | useUserClassroom sin criterio de primary | Baja | Pendiente |

---

## 8. Arquitectura

```
Frontend Components
       ↓
Custom Hooks (useFriends, useGuilds)
       ↓
Zustand Stores (friendsStore, guildsStore, notificationsStore)
       ↓
API Clients (apiClient, notificationsAPI)
       ↓
Backend NestJS REST APIs
       ↓
PostgreSQL (gamilit_platform)
```

---

## 9. Referencias

- **Notifications:** `features/notifications/`
- **Social:** `features/gamification/social/`
- **Gaps:** `orchestration/analisis/GAPS-STUDENT-PORTAL.yml`

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.3.0*
