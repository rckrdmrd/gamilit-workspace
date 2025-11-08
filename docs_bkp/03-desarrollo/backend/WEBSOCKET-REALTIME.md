# WebSocket y Comunicación en Tiempo Real

## Información General

**Tecnología:** Socket.IO 4.8.1
**Transporte:** WebSocket + Polling (fallback)
**Autenticación:** JWT Token
**Endpoint:** `ws://localhost:3006/socket.io/`

---

## Arquitectura WebSocket

```
┌─────────────────────────────────────────────────┐
│           Cliente (Frontend)                    │
│   - Socket.IO Client                            │
│   - Auto-reconexión                             │
│   - Event listeners                             │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓ (WebSocket/Polling)
┌─────────────────────────────────────────────────┐
│       Socket.IO Server (Backend)                │
│   - socket.server.ts                            │
│   - Autenticación JWT                           │
│   - Gestión de conexiones                       │
│   - Salas (rooms) por usuario                   │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│        RealtimeService                          │
│   - Registro de sockets por usuario             │
│   - Emisión de notificaciones                   │
│   - Broadcast a grupos                          │
│   - Contadores en vivo                          │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│     Servicios del Backend                       │
│   - NotificationsService                        │
│   - GamificationService                         │
│   - MissionsService                             │
│   - etc.                                        │
└─────────────────────────────────────────────────┘
```

---

## Inicialización del Servidor

**Archivo:** `/src/websocket/socket.server.ts`

```typescript
import { Server as SocketIOServer } from 'socket.io';
import { envConfig } from '../config/env';

export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: envConfig.corsOrigin,  // Frontend URL
      credentials: true,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
  });

  // Aplicar middleware de autenticación
  io.use(socketAuthMiddleware);

  // Manejar conexiones
  io.on('connection', (socket: AuthenticatedSocket) => {
    handleConnection(socket);
  });

  return io;
}
```

---

## Autenticación WebSocket

### Middleware de Autenticación

**Archivo:** `/src/websocket/socket.auth.ts`

```typescript
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

interface AuthenticatedSocket extends Socket {
  userData?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    // Extraer token de auth handshake
    const token = socket.handshake.auth.token?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verificar JWT
    const payload = jwt.verify(token, jwtConfig.secret) as JWTPayload;

    // Adjuntar datos de usuario al socket
    (socket as AuthenticatedSocket).userData = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
};
```

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

## Conexión y Desconexión

### Flujo de Conexión

```
1. Cliente se conecta con token JWT
   ↓
2. socketAuthMiddleware valida token
   ↓
3. Si válido: adjunta userData al socket
   ↓
4. Socket se une a sala personal: `user:${userId}`
   ↓
5. RealtimeService registra socket del usuario
   ↓
6. Servidor emite evento 'authenticated'
   ↓
7. Cliente recibe confirmación y está listo
```

**Código de Manejo de Conexión:**
```typescript
io.on('connection', (socket: AuthenticatedSocket) => {
  const userId = socket.userData!.userId;
  const userEmail = socket.userData!.email;

  log.info(`WebSocket client connected: ${userEmail} (${socket.id})`);

  // Registrar socket en RealtimeService
  realtimeService.registerUserSocket(userId, socket.id);

  // Unir a sala personal
  socket.join(`user:${userId}`);

  // Emitir confirmación
  socket.emit('authenticated', {
    success: true,
    userId,
    email: userEmail,
    socketId: socket.id,
  });

  // Configurar event handlers
  setupEventHandlers(socket);
});
```

---

### Flujo de Desconexión

```
1. Cliente se desconecta (cierra pestaña, pierde conexión, etc.)
   ↓
2. Evento 'disconnect' es emitido
   ↓
3. RealtimeService desregistra socket
   ↓
4. Socket sale de todas las salas
   ↓
5. Log de desconexión
```

**Código de Desconexión:**
```typescript
socket.on('disconnect', (reason) => {
  log.info(
    `WebSocket client disconnected: ${userEmail} (${socket.id}) - Reason: ${reason}`
  );

  // Desregistrar socket
  realtimeService.unregisterUserSocket(userId, socket.id);
});
```

---

## Salas (Rooms)

### Tipos de Salas

#### 1. Sala Personal de Usuario

**Nombre:** `user:${userId}`

**Propósito:** Emitir notificaciones a usuario específico

**Ejemplo:**
```typescript
// Usuario se une a su sala personal
socket.join(`user:${userId}`);

// Emitir notificación solo a este usuario
io.to(`user:${userId}`).emit('new_notification', notification);
```

---

#### 2. Sala de Classroom (Futuro)

**Nombre:** `classroom:${classroomId}`

**Propósito:** Eventos en tiempo real de aula (nuevas tareas, anuncios)

**Ejemplo:**
```typescript
// Estudiantes y profesor se unen a sala de classroom
socket.join(`classroom:${classroomId}`);

// Emitir nueva tarea a todos en el aula
io.to(`classroom:${classroomId}`).emit('new_assignment', assignment);
```

---

#### 3. Sala de Guild (Futuro)

**Nombre:** `guild:${guildId}`

**Propósito:** Chat y eventos del gremio

**Ejemplo:**
```typescript
// Miembros del gremio se unen a sala
socket.join(`guild:${guildId}`);

// Emitir mensaje de chat a todos los miembros
io.to(`guild:${guildId}`).emit('guild_message', message);
```

---

## RealtimeService

**Archivo:** `/src/modules/notifications/services/realtime.service.ts`

### Estructura Interna

```typescript
class RealtimeService {
  private io: SocketIOServer | null = null;

  // Map de userId a Set de socketIds
  // Permite múltiples conexiones por usuario
  private userSockets: Map<string, Set<string>> = new Map();

  initialize(io: SocketIOServer): void {
    this.io = io;
  }

  registerUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  unregisterUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }
}
```

---

### Métodos Principales

#### `emitNotificationToUser(userId, notification)`

Emite notificación a usuario específico.

**Uso:**
```typescript
import { realtimeService } from '@/modules/notifications/services/realtime.service';

// En servicio de gamification, cuando se desbloquea logro
await gamificationService.unlockAchievement(userId, achievementId);

// Emitir notificación en tiempo real
realtimeService.emitNotificationToUser(userId, {
  id: 'uuid',
  type: 'achievement_unlocked',
  title: 'Achievement Unlocked!',
  message: 'You unlocked "First Steps"',
  data: { achievementId, rewards: { mlCoins: 50, xp: 100 } },
  createdAt: new Date().toISOString(),
});
```

**Implementación:**
```typescript
emitNotificationToUser(userId: string, notification: Notification): void {
  if (!this.io) return;

  const room = `user:${userId}`;

  this.io.to(room).emit('new_notification', {
    notification,
    timestamp: new Date().toISOString(),
  });
}
```

---

#### `emitUnreadCountUpdate(userId, count)`

Actualiza contador de notificaciones no leídas.

**Uso:**
```typescript
// Después de marcar notificación como leída
await notificationsService.markAsRead(userId, notificationId);

const newCount = await notificationsService.getUnreadCount(userId);
realtimeService.emitUnreadCountUpdate(userId, newCount);
```

**Cliente Recibe:**
```javascript
socket.on('unread_count_updated', (data) => {
  console.log(`Unread count: ${data.count}`);
  // Actualizar badge en UI
  updateNotificationBadge(data.count);
});
```

---

#### `broadcastToAllUsers(notification)`

Broadcast a todos los usuarios conectados.

**Uso:**
```typescript
// Anuncio del sistema
realtimeService.broadcastToAllUsers({
  type: 'system_announcement',
  title: 'Maintenance Notice',
  message: 'System will be down for maintenance at 2 AM',
  priority: 'urgent',
});
```

**Implementación:**
```typescript
broadcastNotification(notification: Notification): void {
  if (!this.io) return;

  this.io.emit('new_notification', {
    notification,
    timestamp: new Date().toISOString(),
  });
}
```

---

#### `isUserConnected(userId): boolean`

Verifica si usuario está conectado.

**Uso:**
```typescript
if (realtimeService.isUserConnected(userId)) {
  // Usuario online, enviar notificación push también
  console.log('User is online, will receive real-time notification');
} else {
  // Usuario offline, solo persistir en DB
  console.log('User is offline, notification saved to DB');
}
```

---

#### `getConnectedUsersCount(): number`

Obtiene número de usuarios conectados.

**Uso:**
```typescript
const connectedUsers = realtimeService.getConnectedUsersCount();
log.info(`Currently ${connectedUsers} users connected via WebSocket`);
```

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

---

## Manejo de Errores y Reconexión

### Auto-Reconexión

Socket.IO maneja automáticamente la reconexión en caso de pérdida de conexión.

**Configuración:**
```typescript
const socket = io('ws://localhost:3006', {
  reconnection: true,
  reconnectionDelay: 1000,      // Esperar 1 segundo antes de reintentar
  reconnectionAttempts: 5,      // Máximo 5 intentos
  reconnectionDelayMax: 5000,   // Máximo 5 segundos entre intentos
});
```

---

### Estados de Conexión

```typescript
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  updateConnectionStatus('connected');
});

socket.on('disconnect', (reason) => {
  console.warn('Disconnected:', reason);
  updateConnectionStatus('disconnected');

  // Razones de desconexión:
  // - 'io server disconnect': Servidor cerró la conexión
  // - 'io client disconnect': Cliente cerró la conexión
  // - 'ping timeout': Timeout de ping
  // - 'transport close': Transporte cerrado
  // - 'transport error': Error de transporte
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  updateConnectionStatus('error');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('Reconnection attempt', attemptNumber);
  updateConnectionStatus('reconnecting');
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  updateConnectionStatus('connected');
});

socket.on('reconnect_failed', () => {
  console.error('Reconnection failed after max attempts');
  updateConnectionStatus('failed');

  // Mostrar mensaje al usuario
  showAlert('Connection lost. Please refresh the page.');
});
```

---

## Testing WebSocket

### Test de Conexión con curl-websocket

```bash
# Instalar wscat
npm install -g wscat

# Conectar al servidor WebSocket
wscat -c "ws://localhost:3006/socket.io/?transport=websocket&token=Bearer YOUR_JWT_TOKEN"

# Enviar evento
> 42["mark_as_read", {"notificationId": "uuid"}]

# Recibir eventos
< 42["new_notification", {...}]
```

---

### Test Unitario (Jest)

```typescript
import { io as Client, Socket } from 'socket.io-client';
import { createServer } from 'http';
import { initializeSocketServer } from '@/websocket/socket.server';

describe('WebSocket Server', () => {
  let httpServer: any;
  let clientSocket: Socket;

  beforeAll((done) => {
    httpServer = createServer();
    initializeSocketServer(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = Client(`http://localhost:${port}`, {
        auth: { token: 'Bearer VALID_JWT_TOKEN' },
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    clientSocket.close();
    httpServer.close();
  });

  test('should authenticate and join user room', (done) => {
    clientSocket.on('authenticated', (data) => {
      expect(data.success).toBe(true);
      expect(data.userId).toBeDefined();
      done();
    });
  });

  test('should receive new notification', (done) => {
    clientSocket.on('new_notification', (data) => {
      expect(data.notification).toBeDefined();
      expect(data.notification.type).toBe('achievement_unlocked');
      done();
    });

    // Trigger notification from backend
    // ...
  });
});
```

---

## Monitoreo y Debugging

### Logs del Servidor

```typescript
// En socket.server.ts
io.on('connection', (socket: AuthenticatedSocket) => {
  log.info(`[WebSocket] Client connected: ${socket.userData!.email} (${socket.id})`);
});

socket.on('disconnect', (reason) => {
  log.info(`[WebSocket] Client disconnected: ${userEmail} - Reason: ${reason}`);
});
```

---

### Estadísticas en Tiempo Real

```typescript
export const getWebSocketStats = async () => {
  const sockets = await io.fetchSockets();
  const connectedUsers = new Set(sockets.map(s => s.userData?.userId));

  return {
    totalConnections: sockets.length,
    uniqueUsers: connectedUsers.size,
    rooms: Array.from(io.sockets.adapter.rooms.keys()),
  };
};
```

---

## Diagrama de Flujo: Notificación en Tiempo Real

```
┌───────────────────────────────────────────────┐
│ Usuario completa ejercicio                    │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ ExercisesService.submitExercise()            │
│ - Evalúa respuesta                            │
│ - Otorga recompensas                          │
│ - Verifica logros desbloqueados               │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ GamificationService.unlockAchievement()      │
│ - Crea registro en user_achievements          │
│ - Otorga coins + XP                           │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ NotificationsService.createNotification()    │
│ - Persiste notificación en DB                 │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ RealtimeService.emitNotificationToUser()     │
│ - Emite evento a sala user:${userId}          │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ Socket.IO emite 'new_notification'           │
│ - Solo a sockets del usuario                  │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ Cliente recibe evento                         │
│ - Muestra modal de logro                      │
│ - Reproduce sonido                            │
│ - Actualiza UI                                │
└───────────────────────────────────────────────┘
```

---

## Mejores Prácticas

1. **Siempre autenticar** antes de permitir conexiones WebSocket
2. **Usar salas (rooms)** para enviar mensajes dirigidos
3. **Manejar reconexiones** automáticamente en el cliente
4. **Validar eventos del cliente** antes de procesarlos
5. **Limitar rate** de eventos del cliente (anti-spam)
6. **Persistir notificaciones** en DB antes de emitir por WebSocket
7. **Logs detallados** de conexiones/desconexiones para debugging
8. **Monitorear** número de conexiones activas
9. **Graceful shutdown** - desconectar todos los sockets antes de cerrar servidor

---

## Próximo Documento

- `CRON-JOBS.md` - Tareas programadas y mantenimiento automático
