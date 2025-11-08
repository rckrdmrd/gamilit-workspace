<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: WebSocket - Eventos y Notificaciones -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# WebSocket - Eventos y Notificaciones

## Información General

Este documento describe los eventos WebSocket y los tipos de notificaciones en tiempo real del sistema GAMILIT.

---

## Tabla de Contenidos

1. [Eventos del Socket](#eventos-del-socket)
2. [Cliente WebSocket](#cliente-websocket-frontend)
3. [Tipos de Notificaciones](#tipos-de-notificaciones-en-tiempo-real)
4. [Flujos de Comunicación](#flujos-de-comunicación)

---

## Eventos del Socket

### Eventos del Servidor (Emitidos al Cliente)

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `authenticated` | Confirmación de autenticación exitosa | `{ success: true, userId, email, socketId }` |
| `new_notification` | Nueva notificación recibida | `{ notification, timestamp }` |
| `notification_read` | Notificación marcada como leída | `{ notificationId, success }` |
| `notification_deleted` | Notificación eliminada | `{ notificationId, timestamp }` |
| `unread_count_updated` | Actualización de contador no leídas | `{ count, timestamp }` |
| `error` | Error general | `{ message }` |

---

### Eventos del Cliente (Emitidos al Servidor)

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `mark_as_read` | Marcar notificación como leída | `{ notificationId }` |

---

### Detalle de Eventos del Servidor

#### `authenticated`

Confirmación de que el cliente se autenticó correctamente.

**Payload:**
```typescript
{
  success: true,
  userId: "user-uuid-123",
  email: "student@example.com",
  socketId: "abc123def456"
}
```

**Cuándo se emite:**
- Inmediatamente después de conexión exitosa
- Después de pasar autenticación JWT

---

#### `new_notification`

Nueva notificación recibida en tiempo real.

**Payload:**
```typescript
{
  notification: {
    id: "notif-uuid",
    type: "achievement_unlocked",
    title: "Achievement Unlocked!",
    message: "You unlocked 'First Steps'",
    data: {
      achievementId: "ach-uuid",
      achievementName: "First Steps",
      icon: "🎯",
      rewards: { mlCoins: 50, xp: 100 }
    },
    priority: "high",
    isRead: false,
    createdAt: "2025-10-27T10:30:00Z"
  },
  timestamp: "2025-10-27T10:30:00.123Z"
}
```

**Cuándo se emite:**
- Cuando se desbloquea un logro
- Cuando se completa una misión
- Cuando se sube de nivel
- Cuando se recibe solicitud de amistad
- Cuando se califica una tarea
- Cuando hay anuncio del sistema

---

#### `unread_count_updated`

Actualización del contador de notificaciones no leídas.

**Payload:**
```typescript
{
  count: 5,
  timestamp: "2025-10-27T10:30:00.123Z"
}
```

**Cuándo se emite:**
- Después de marcar notificación como leída
- Después de eliminar notificación
- Después de recibir nueva notificación

---

#### `notification_read`

Confirmación de que notificación fue marcada como leída.

**Payload:**
```typescript
{
  notificationId: "notif-uuid",
  success: true
}
```

**Cuándo se emite:**
- Después de procesar evento `mark_as_read` del cliente

---

#### `notification_deleted`

Confirmación de que notificación fue eliminada.

**Payload:**
```typescript
{
  notificationId: "notif-uuid",
  timestamp: "2025-10-27T10:30:00.123Z"
}
```

**Cuándo se emite:**
- Después de eliminar notificación vía REST API

---

#### `error`

Error general del WebSocket.

**Payload:**
```typescript
{
  message: "Error description"
}
```

**Cuándo se emite:**
- Cuando ocurre error al procesar evento del cliente
- Cuando hay error de validación

---

## Cliente WebSocket (Frontend)

### Conexión Básica

```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectWebSocket = (token: string) => {
  // Crear conexión
  socket = io('ws://localhost:3006', {
    auth: {
      token: `Bearer ${token}`,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  // Event listeners
  setupEventListeners(socket);

  return socket;
};
```

---

### Event Listeners del Cliente

```typescript
const setupEventListeners = (socket: Socket) => {
  // Autenticación exitosa
  socket.on('authenticated', (data) => {
    console.log('WebSocket authenticated:', data);
  });

  // Nueva notificación
  socket.on('new_notification', (data) => {
    console.log('New notification:', data.notification);

    // Actualizar UI
    addNotificationToList(data.notification);
    playNotificationSound();
    showToast(data.notification.title);
  });

  // Contador actualizado
  socket.on('unread_count_updated', (data) => {
    console.log('Unread count:', data.count);
    updateNotificationBadge(data.count);
  });

  // Notificación marcada como leída
  socket.on('notification_read', (data) => {
    console.log('Notification marked as read:', data.notificationId);
    markNotificationAsReadInUI(data.notificationId);
  });

  // Error
  socket.on('error', (data) => {
    console.error('WebSocket error:', data.message);
  });

  // Conexión perdida
  socket.on('disconnect', (reason) => {
    console.warn('WebSocket disconnected:', reason);

    if (reason === 'io server disconnect') {
      // Servidor cerró conexión, reconectar manualmente
      socket.connect();
    }
  });

  // Reconexión exitosa
  socket.on('reconnect', (attemptNumber) => {
    console.log('WebSocket reconnected after', attemptNumber, 'attempts');
  });
};
```

---

### Emitir Eventos desde Cliente

```typescript
// Marcar notificación como leída
export const markNotificationAsRead = (notificationId: string) => {
  if (!socket) return;

  socket.emit('mark_as_read', { notificationId });
};
```

---

### Desconexión Limpia

```typescript
export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

---

## Tipos de Notificaciones en Tiempo Real

### 1. Achievement Unlocked

**Trigger:** Cuando se desbloquea un logro

**Payload:**
```typescript
{
  id: 'uuid',
  type: 'achievement_unlocked',
  title: 'Achievement Unlocked!',
  message: 'You unlocked "First Steps"',
  data: {
    achievementId: 'uuid',
    achievementName: 'First Steps',
    icon: '🎯',
    rewards: {
      mlCoins: 50,
      xp: 100
    }
  },
  priority: 'high',
  createdAt: '2025-10-27T10:30:00Z'
}
```

**UI Sugerida:**
- Modal celebratorio con animación
- Mostrar icono del logro
- Mostrar recompensas ganadas
- Sonido de logro

---

### 2. Mission Completed

**Trigger:** Cuando se completa una misión

**Payload:**
```typescript
{
  id: 'uuid',
  type: 'mission_completed',
  title: 'Mission Completed!',
  message: 'You completed "Daily Practice"',
  data: {
    missionId: 'uuid',
    missionTitle: 'Daily Practice',
    rewards: {
      mlCoins: 100,
      xp: 200
    }
  },
  priority: 'medium',
  createdAt: '2025-10-27T10:35:00Z'
}
```

**UI Sugerida:**
- Toast notification
- Mostrar título de misión
- Mostrar recompensas
- Link a página de misiones

---

### 3. Level Up

**Trigger:** Cuando sube de nivel

**Payload:**
```typescript
{
  id: 'uuid',
  type: 'level_up',
  title: 'Level Up!',
  message: 'You reached Level 16',
  data: {
    newLevel: 16,
    newRank: 'Gold',
    unlockedFeatures: ['Feature A', 'Feature B']
  },
  priority: 'high',
  createdAt: '2025-10-27T10:40:00Z'
}
```

**UI Sugerida:**
- Modal de celebración
- Animación de nivel
- Mostrar nuevo rango
- Listar características desbloqueadas

---

### 4. Friend Request

**Trigger:** Cuando recibe solicitud de amistad

**Payload:**
```typescript
{
  id: 'uuid',
  type: 'friend_request',
  title: 'Friend Request',
  message: 'John Doe sent you a friend request',
  data: {
    requestId: 'uuid',
    senderId: 'uuid',
    senderName: 'John Doe',
    senderAvatarUrl: 'https://...'
  },
  priority: 'medium',
  createdAt: '2025-10-27T10:45:00Z'
}
```

**UI Sugerida:**
- Toast notification
- Botones Aceptar/Rechazar
- Mostrar avatar del remitente
- Link a perfil

---

### 5. Assignment Graded

**Trigger:** Cuando profesor califica tarea

**Payload:**
```typescript
{
  id: 'uuid',
  type: 'assignment_graded',
  title: 'Assignment Graded',
  message: 'Your assignment "Python Variables" has been graded',
  data: {
    assignmentId: 'uuid',
    assignmentTitle: 'Python Variables',
    score: 85,
    maxScore: 100,
    feedback: 'Good work, review loops section'
  },
  priority: 'high',
  createdAt: '2025-10-27T10:50:00Z'
}
```

**UI Sugerida:**
- Notificación destacada
- Mostrar puntuación
- Mostrar feedback
- Link a tarea calificada

---

### 6. New Assignment

**Trigger:** Cuando profesor publica nueva tarea

**Payload:**
```typescript
{
  id: 'uuid',
  type: 'new_assignment',
  title: 'New Assignment',
  message: 'New assignment: "Functions Quiz"',
  data: {
    assignmentId: 'uuid',
    assignmentTitle: 'Functions Quiz',
    classroomName: 'Programming 101',
    dueDate: '2025-11-05T23:59:59Z',
    points: 100
  },
  priority: 'medium',
  createdAt: '2025-10-27T10:55:00Z'
}
```

**UI Sugerida:**
- Toast notification
- Mostrar fecha de entrega
- Mostrar puntos posibles
- Link a tarea

---

### 7. System Announcement

**Trigger:** Anuncio del sistema o mantenimiento

**Payload:**
```typescript
{
  id: 'uuid',
  type: 'system_announcement',
  title: 'Maintenance Notice',
  message: 'System will be down for maintenance at 2 AM',
  data: {
    maintenanceDate: '2025-10-28T02:00:00Z',
    estimatedDuration: '2 hours'
  },
  priority: 'urgent',
  createdAt: '2025-10-27T11:00:00Z'
}
```

**UI Sugerida:**
- Banner prominente
- No cerrable automáticamente
- Icono de advertencia
- Detalles de mantenimiento

---

## Flujos de Comunicación

### Flujo: Nueva Notificación

```
1. Evento en backend (e.g., logro desbloqueado)
   ↓
2. NotificationsService.createNotification()
   - Persiste en DB
   ↓
3. RealtimeService.emitNotificationToUser(userId, notification)
   - Emite a sala user:${userId}
   ↓
4. Socket.IO envía a todos los sockets del usuario
   ↓
5. Cliente recibe evento 'new_notification'
   ↓
6. Cliente muestra notificación en UI
   - Toast/Modal/Banner según tipo
   - Reproduce sonido
   - Actualiza contador
```

---

### Flujo: Marcar como Leída

```
1. Usuario hace clic en notificación
   ↓
2. Cliente emite 'mark_as_read'
   socket.emit('mark_as_read', { notificationId })
   ↓
3. Servidor recibe evento
   ↓
4. NotificationsService.markAsRead(userId, notificationId)
   - Actualiza DB: is_read = true
   ↓
5. Servidor emite 'notification_read'
   socket.emit('notification_read', { notificationId, success: true })
   ↓
6. Servidor emite 'unread_count_updated'
   - Nuevo contador de no leídas
   ↓
7. Cliente actualiza UI
   - Marca notificación como leída
   - Actualiza badge de contador
```

---

### Flujo: Broadcast a Todos

```
1. Admin crea anuncio del sistema
   ↓
2. NotificationsService.createSystemAnnouncement(message)
   - Persiste en DB para todos los usuarios
   ↓
3. RealtimeService.broadcastNotification(notification)
   - Emite a TODOS los sockets conectados
   ↓
4. TODOS los clientes conectados reciben 'new_notification'
   ↓
5. Todos muestran banner de anuncio
```

---

## Ejemplo de Implementación Completa

### Backend: Desbloquear Logro

```typescript
// En gamification.service.ts
async unlockAchievement(userId: string, achievementId: string): Promise<void> {
  // 1. Crear registro en DB
  await gamificationRepository.unlockAchievement(userId, achievementId);

  // 2. Otorgar recompensas
  const achievement = await gamificationRepository.getAchievementById(achievementId);
  await this.addCoins(userId, achievement.rewards.mlCoins, 'achievement_unlock');
  await this.addXP(userId, achievement.rewards.xp, 'achievement_unlock');

  // 3. Crear notificación
  const notification = await notificationsService.createNotification({
    userId,
    type: 'achievement_unlocked',
    title: 'Achievement Unlocked!',
    message: `You unlocked "${achievement.name}"`,
    data: {
      achievementId,
      achievementName: achievement.name,
      icon: achievement.icon,
      rewards: achievement.rewards
    },
    priority: 'high'
  });

  // 4. Emitir en tiempo real
  realtimeService.emitNotificationToUser(userId, notification);
}
```

---

### Frontend: Recibir y Mostrar

```typescript
// En websocket.service.ts
socket.on('new_notification', (data) => {
  const { notification } = data;

  // Reproducir sonido
  playNotificationSound();

  // Mostrar según tipo
  switch (notification.type) {
    case 'achievement_unlocked':
      showAchievementModal(notification.data);
      break;

    case 'mission_completed':
      showMissionCompleteToast(notification.data);
      break;

    case 'level_up':
      showLevelUpModal(notification.data);
      break;

    case 'system_announcement':
      showSystemBanner(notification);
      break;

    default:
      showGenericToast(notification);
  }

  // Agregar a lista de notificaciones
  addNotificationToList(notification);

  // Incrementar contador
  incrementUnreadCount();
});
```

---

## Navegación

- **Índice Principal:** [README.md](./README.md)
- **Anterior:** [WebSocket-Conexiones.md](./WebSocket-Conexiones.md)
- **Siguiente:** [WebSocket-Seguridad.md](./WebSocket-Seguridad.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
