# Servicios de Notificaciones

**Proyecto:** GAMILIT
**RFC:** RFC-0001
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Índice

1. [NotificationsService](#1-notificationsservice)
2. [RealtimeService](#2-realtimeservice)

---

## 1. NotificationsService

**Archivo:** `/src/modules/notifications/notifications.service.ts`

**Responsabilidad:** Sistema de notificaciones persistentes

### Métodos Principales

#### `createNotification(notificationDto): Promise<Notification>`

Crea una nueva notificación.

**Tipos de Notificaciones:**
```typescript
type NotificationType =
  | 'achievement_unlocked'
  | 'mission_completed'
  | 'level_up'
  | 'friend_request'
  | 'guild_invitation'
  | 'assignment_graded'
  | 'new_assignment'
  | 'system_announcement';
```

**Ejemplo de Uso:**
```typescript
const notification = await notificationsService.createNotification({
  userId: 'uuid',
  type: 'achievement_unlocked',
  title: 'Achievement Unlocked!',
  message: 'You unlocked "First Steps"',
  data: {
    achievementId: 'uuid',
    achievementName: 'First Steps',
    rewards: { mlCoins: 50, xp: 100 }
  },
  priority: 'high'
});

// Respuesta:
{
  id: 'uuid',
  userId: 'uuid',
  type: 'achievement_unlocked',
  title: 'Achievement Unlocked!',
  message: 'You unlocked "First Steps"',
  data: { ... },
  priority: 'high',
  isRead: false,
  createdAt: '2025-10-27T10:30:00Z'
}
```

**Prioridades:**
- `low` - Informacional
- `medium` - Normal (default)
- `high` - Importante
- `urgent` - Crítico

**Integración con WebSocket:**
Al crear notificación, automáticamente se emite via Socket.IO:
```typescript
realtimeService.emitNotificationToUser(userId, notification);
```

---

#### `getUserNotifications(userId, options): Promise<Notification[]>`

Obtiene notificaciones del usuario.

**Opciones:**
```typescript
interface GetNotificationsOptions {
  limit?: number;       // Default: 20
  offset?: number;      // Default: 0
  unreadOnly?: boolean; // Default: false
  type?: NotificationType;
}
```

**Ejemplo de Uso:**
```typescript
const notifications = await notificationsService.getUserNotifications(
  userId,
  { limit: 10, unreadOnly: true }
);

// Respuesta: Array de notificaciones no leídas
```

---

#### `markAsRead(userId, notificationId): Promise<void>`

Marca notificación como leída.

**Flujo:**
```
1. Verificar notificación pertenece al usuario
2. Actualizar is_read = true
3. Actualizar read_at timestamp
4. Emitir evento via WebSocket (notification_read)
5. Actualizar contador de no leídas
```

---

#### `markAllAsRead(userId): Promise<number>`

Marca todas las notificaciones como leídas.

**Retorna:** Número de notificaciones actualizadas

---

#### `getUnreadCount(userId): Promise<number>`

Obtiene contador de notificaciones no leídas.

**Ejemplo:**
```typescript
const count = await notificationsService.getUnreadCount(userId);
// count: 5
```

---

#### `cleanupOldNotifications(daysOld: number): Promise<number>`

Elimina notificaciones leídas antiguas.

**Uso en Cron Job:**
```typescript
// Ejecutado diariamente a las 2:00 AM
const deletedCount = await notificationsService.cleanupOldNotifications(30);
// Elimina notificaciones leídas con más de 30 días
```

---

## 2. RealtimeService

**Archivo:** `/src/modules/notifications/services/realtime.service.ts`

**Responsabilidad:** Gestión de conexiones WebSocket y emisión en tiempo real

### Métodos Principales

#### `initialize(io: SocketIOServer): void`

Inicializa el servicio con instancia de Socket.IO.

```typescript
realtimeService.initialize(io);
```

---

#### `registerUserSocket(userId, socketId): void`

Registra socket del usuario.

**Estructura Interna:**
```typescript
private userSockets: Map<string, Set<string>> = new Map();

// Permite múltiples conexiones por usuario
userSockets.set(userId, new Set([socketId1, socketId2]));
```

---

#### `unregisterUserSocket(userId, socketId): void`

Desregistra socket cuando se desconecta.

---

#### `emitNotificationToUser(userId, notification): void`

Emite notificación a usuario específico.

**Ejemplo:**
```typescript
realtimeService.emitNotificationToUser(userId, {
  id: 'uuid',
  type: 'achievement_unlocked',
  title: 'Achievement Unlocked!',
  message: 'You unlocked "First Steps"',
  data: { ... },
  createdAt: '2025-10-27T10:30:00Z'
});

// Se emite a todas las conexiones activas del usuario
// Evento: 'new_notification'
```

---

#### `emitUnreadCountUpdate(userId, count): void`

Emite actualización de contador no leídas.

```typescript
realtimeService.emitUnreadCountUpdate(userId, 5);

// Cliente recibe:
// Evento: 'unread_count_updated'
// Data: { count: 5, timestamp: '...' }
```

---

#### `broadcastToAllUsers(notification): void`

Broadcast a todos los usuarios conectados.

**Uso:**
```typescript
// Anuncios del sistema
realtimeService.broadcastToAllUsers({
  type: 'system_announcement',
  title: 'Maintenance Notice',
  message: 'System will be down for maintenance...',
  priority: 'urgent'
});
```

---

#### `getConnectedUsersCount(): number`

Obtiene número de usuarios conectados.

---

#### `isUserConnected(userId): boolean`

Verifica si usuario está conectado.

```typescript
if (realtimeService.isUserConnected(userId)) {
  // Usuario online, enviar notificación en tiempo real
} else {
  // Usuario offline, solo persistir en DB
}
```

---

## Flujo de Notificación Completo

```
┌──────────────────┐
│  Evento Ocurre   │
│  (ej: logro      │
│   desbloqueado)  │
└────────┬─────────┘
         │
         ↓
┌────────────────────────────┐
│  NotificationsService      │
│  createNotification()      │
└────────┬───────────────────┘
         │
         ├──────────────────────┐
         │                      │
         ↓                      ↓
┌────────────────┐    ┌─────────────────┐
│  Guardar en DB │    │  RealtimeService│
│  (persistente) │    │  emit via WS    │
└────────────────┘    └────────┬────────┘
                               │
                               ↓
                      ┌─────────────────┐
                      │  Cliente recibe │
                      │  notificación   │
                      │  en tiempo real │
                      └─────────────────┘
```

---

## Eventos WebSocket

### Cliente → Servidor

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `connect` | - | Cliente se conecta |
| `disconnect` | - | Cliente se desconecta |
| `mark_notification_read` | `{notificationId}` | Marcar como leída |
| `mark_all_read` | - | Marcar todas como leídas |

### Servidor → Cliente

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `new_notification` | `Notification` | Nueva notificación |
| `notification_read` | `{notificationId}` | Notificación leída |
| `unread_count_updated` | `{count}` | Contador actualizado |
| `system_announcement` | `Notification` | Anuncio del sistema |

---

## Ejemplo de Integración en Cliente

### Conexión WebSocket
```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3006', {
  auth: {
    token: accessToken  // JWT token
  }
});

// Escuchar nuevas notificaciones
socket.on('new_notification', (notification) => {
  console.log('Nueva notificación:', notification);
  showToast(notification.title, notification.message);
  updateNotificationBadge();
});

// Escuchar cambio en contador
socket.on('unread_count_updated', ({ count }) => {
  updateBadgeCount(count);
});

// Marcar como leída
const markAsRead = (notificationId) => {
  socket.emit('mark_notification_read', { notificationId });
};
```

---

## Buenas Prácticas

### 1. Prioridades de Notificaciones
```typescript
// Usar prioridades apropiadas
'urgent'  → Suspensión de cuenta, mantenimiento crítico
'high'    → Logros, misiones completadas, mensajes importantes
'medium'  → Asignaciones nuevas, solicitudes de amistad
'low'     → Tips, recordatorios generales
```

### 2. Limpieza Periódica
```typescript
// Cron job diario para limpiar notificaciones antiguas
// Mantiene DB eficiente
await notificationsService.cleanupOldNotifications(30);
```

### 3. Manejo de Usuarios Offline
```typescript
// Siempre persistir en DB, emitir WS solo si online
await notificationsService.createNotification(data);  // ← Persiste
if (realtimeService.isUserConnected(userId)) {
  realtimeService.emitNotificationToUser(userId, notification);
}
```

---

## Documentos Relacionados

- [API Notifications Endpoints](../api/API-Notifications.md) - Endpoints de notificaciones
- [WebSocket Realtime](../WEBSOCKET-REALTIME.md) - Documentación de WebSocket
- [README de Servicios](./README.md) - Índice de servicios

---

**Última revisión:** 2025-11-01
