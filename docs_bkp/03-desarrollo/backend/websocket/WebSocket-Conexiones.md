<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: WebSocket - Conexiones y Autenticación -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# WebSocket - Conexiones y Autenticación

## Información General

Este documento describe la gestión de conexiones WebSocket, autenticación JWT y el sistema de salas (rooms) en GAMILIT

---

## Tabla de Contenidos

1. [Inicialización del Servidor](#inicialización-del-servidor)
2. [Autenticación WebSocket](#autenticación-websocket)
3. [Conexión y Desconexión](#conexión-y-desconexión)
4. [Salas (Rooms)](#salas-rooms)
5. [RealtimeService](#realtimeservice)

---

## Inicialización del Servidor

### Configuración Básica

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

### Configuración CORS

```typescript
cors: {
  origin: envConfig.corsOrigin,  // e.g., 'http://localhost:5173'
  credentials: true,              // Permitir cookies/auth headers
  methods: ['GET', 'POST'],      // Métodos HTTP permitidos
}
```

### Transportes Soportados

```typescript
transports: ['websocket', 'polling']
```

**WebSocket:**
- Protocolo principal
- Bidireccional, baja latencia
- Conexión persistente

**Polling (Fallback):**
- HTTP long-polling
- Para navegadores sin soporte WebSocket
- Menos eficiente pero más compatible

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

### Interface AuthenticatedSocket

```typescript
interface AuthenticatedSocket extends Socket {
  userData?: {
    userId: string;      // UUID del usuario
    email: string;       // Email del usuario
    role: string;        // Rol: student, teacher, admin, super_admin
  };
}
```

### Flujo de Autenticación

```
1. Cliente envía token en handshake.auth
   ↓
2. socketAuthMiddleware extrae token
   ↓
3. Verifica JWT con jwt.verify()
   ↓
4. Si válido: adjunta userData al socket
   ↓
5. Si inválido: rechaza conexión con error
   ↓
6. Cliente recibe conexión exitosa o error
```

### Ejemplo de Rechazo

```javascript
// Si token inválido
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  // "Invalid or expired token"
});
```

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

### Código de Manejo de Conexión

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

### Payload de Autenticación Exitosa

```typescript
{
  success: true,
  userId: "user-uuid-123",
  email: "student@example.com",
  socketId: "abc123def456"
}
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

### Código de Desconexión

```typescript
socket.on('disconnect', (reason) => {
  log.info(
    `WebSocket client disconnected: ${userEmail} (${socket.id}) - Reason: ${reason}`
  );

  // Desregistrar socket
  realtimeService.unregisterUserSocket(userId, socket.id);
});
```

### Razones de Desconexión

| Reason | Descripción |
|--------|-------------|
| `io server disconnect` | Servidor cerró la conexión |
| `io client disconnect` | Cliente cerró la conexión |
| `ping timeout` | Timeout de ping |
| `transport close` | Transporte cerrado |
| `transport error` | Error de transporte |

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

**Uso:**
- Notificaciones personales
- Actualizaciones de perfil
- Mensajes directos
- Contadores en tiempo real

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

**Uso (Planificado):**
- Nuevas tareas publicadas
- Anuncios del profesor
- Actualizaciones de calificaciones
- Chat del aula

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

**Uso (Planificado):**
- Chat del gremio
- Nuevos miembros
- Logros del gremio
- Eventos competitivos

---

### Operaciones con Salas

#### Unirse a Sala

```typescript
socket.join('room-name');
```

#### Salir de Sala

```typescript
socket.leave('room-name');
```

#### Emitir a Sala

```typescript
io.to('room-name').emit('event', data);
```

#### Broadcast a Sala (excepto emisor)

```typescript
socket.to('room-name').emit('event', data);
```

#### Obtener Sockets en Sala

```typescript
const sockets = await io.in('room-name').fetchSockets();
console.log(`${sockets.length} sockets in room`);
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

### Múltiples Conexiones por Usuario

Un usuario puede tener múltiples conexiones activas (e.g., múltiples pestañas):

```typescript
// Usuario abre 3 pestañas
userSockets.get('user-123') = Set(['socket-1', 'socket-2', 'socket-3'])

// Emitir notificación llega a las 3 pestañas
io.to('user:user-123').emit('new_notification', notification);
```

---

### Métodos Principales

#### `initialize(io: SocketIOServer)`

Inicializa el servicio con instancia de Socket.IO.

```typescript
const io = initializeSocketServer(httpServer);
realtimeService.initialize(io);
```

---

#### `registerUserSocket(userId: string, socketId: string)`

Registra un nuevo socket para un usuario.

```typescript
realtimeService.registerUserSocket('user-123', 'socket-abc');
```

---

#### `unregisterUserSocket(userId: string, socketId: string)`

Desregistra un socket de un usuario.

```typescript
realtimeService.unregisterUserSocket('user-123', 'socket-abc');
```

---

#### `emitNotificationToUser(userId: string, notification: Notification)`

Emite notificación a usuario específico.

```typescript
realtimeService.emitNotificationToUser('user-123', {
  id: 'notif-uuid',
  type: 'achievement_unlocked',
  title: 'Achievement Unlocked!',
  message: 'You unlocked "First Steps"',
  data: { achievementId: 'ach-uuid', rewards: { mlCoins: 50, xp: 100 } },
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

#### `emitUnreadCountUpdate(userId: string, count: number)`

Actualiza contador de notificaciones no leídas.

```typescript
realtimeService.emitUnreadCountUpdate('user-123', 5);
```

**Implementación:**
```typescript
emitUnreadCountUpdate(userId: string, count: number): void {
  if (!this.io) return;

  const room = `user:${userId}`;

  this.io.to(room).emit('unread_count_updated', {
    count,
    timestamp: new Date().toISOString(),
  });
}
```

---

#### `broadcastNotification(notification: Notification)`

Broadcast a todos los usuarios conectados.

```typescript
realtimeService.broadcastNotification({
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

#### `isUserConnected(userId: string): boolean`

Verifica si usuario está conectado.

```typescript
if (realtimeService.isUserConnected('user-123')) {
  console.log('User is online');
} else {
  console.log('User is offline');
}
```

**Implementación:**
```typescript
isUserConnected(userId: string): boolean {
  const sockets = this.userSockets.get(userId);
  return sockets !== undefined && sockets.size > 0;
}
```

---

#### `getConnectedUsersCount(): number`

Obtiene número de usuarios conectados.

```typescript
const count = realtimeService.getConnectedUsersCount();
log.info(`${count} users connected via WebSocket`);
```

**Implementación:**
```typescript
getConnectedUsersCount(): number {
  return this.userSockets.size;
}
```

---

## Navegación

- **Índice Principal:** [README.md](./README.md)
- **Siguiente:** [WebSocket-Eventos.md](./WebSocket-Eventos.md)
- **Relacionado:** [WebSocket-Seguridad.md](./WebSocket-Seguridad.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
