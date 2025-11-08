<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: WebSocket - Seguridad y Testing -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# WebSocket - Seguridad y Testing

## Información General

Este documento describe el manejo de errores, testing, monitoreo y mejores prácticas de seguridad para el sistema WebSocket de GAMILIT

---

## Tabla de Contenidos

1. [Manejo de Errores y Reconexión](#manejo-de-errores-y-reconexión)
2. [Testing WebSocket](#testing-websocket)
3. [Monitoreo y Debugging](#monitoreo-y-debugging)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Optimizaciones](#optimizaciones)

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

**Parámetros:**
- `reconnection`: Habilitar auto-reconexión (default: true)
- `reconnectionDelay`: Tiempo inicial entre intentos (ms)
- `reconnectionAttempts`: Número máximo de intentos (0 = infinito)
- `reconnectionDelayMax`: Tiempo máximo entre intentos (ms)

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

### Indicador Visual de Estado

```typescript
function updateConnectionStatus(status: string) {
  const indicator = document.getElementById('connection-indicator');

  switch (status) {
    case 'connected':
      indicator.className = 'status-indicator online';
      indicator.title = 'Connected';
      break;

    case 'disconnected':
      indicator.className = 'status-indicator offline';
      indicator.title = 'Disconnected';
      break;

    case 'reconnecting':
      indicator.className = 'status-indicator reconnecting';
      indicator.title = 'Reconnecting...';
      break;

    case 'error':
    case 'failed':
      indicator.className = 'status-indicator error';
      indicator.title = 'Connection failed';
      break;
  }
}
```

**CSS:**
```css
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.status-indicator.online {
  background-color: #4caf50;
}

.status-indicator.offline {
  background-color: #f44336;
}

.status-indicator.reconnecting {
  background-color: #ff9800;
  animation: pulse 1s infinite;
}

.status-indicator.error {
  background-color: #f44336;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

### Manejo de Errores en Servidor

```typescript
socket.on('mark_as_read', async (data) => {
  try {
    const { notificationId } = data;

    // Validar entrada
    if (!notificationId) {
      socket.emit('error', { message: 'Notification ID required' });
      return;
    }

    // Procesar
    await notificationsService.markAsRead(socket.userData!.userId, notificationId);

    // Confirmar
    socket.emit('notification_read', { notificationId, success: true });

    // Actualizar contador
    const newCount = await notificationsService.getUnreadCount(socket.userData!.userId);
    socket.emit('unread_count_updated', { count: newCount });

  } catch (error) {
    log.error('[WebSocket] Error marking notification as read:', error);
    socket.emit('error', { message: 'Failed to mark notification as read' });
  }
});
```

---

## Testing WebSocket

### Test de Conexión con wscat

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

### Test Unitario con Jest

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

### Test de Autenticación

```typescript
describe('WebSocket Authentication', () => {
  test('should reject connection without token', (done) => {
    const clientSocket = Client(`http://localhost:${port}`);

    clientSocket.on('connect_error', (error) => {
      expect(error.message).toBe('Authentication token required');
      clientSocket.close();
      done();
    });
  });

  test('should reject connection with invalid token', (done) => {
    const clientSocket = Client(`http://localhost:${port}`, {
      auth: { token: 'Bearer INVALID_TOKEN' },
    });

    clientSocket.on('connect_error', (error) => {
      expect(error.message).toBe('Invalid or expired token');
      clientSocket.close();
      done();
    });
  });

  test('should accept connection with valid token', (done) => {
    const clientSocket = Client(`http://localhost:${port}`, {
      auth: { token: 'Bearer VALID_JWT_TOKEN' },
    });

    clientSocket.on('authenticated', (data) => {
      expect(data.success).toBe(true);
      clientSocket.close();
      done();
    });
  });
});
```

---

### Test de Salas (Rooms)

```typescript
describe('WebSocket Rooms', () => {
  test('should join user to personal room', (done) => {
    const userId = 'user-123';

    clientSocket.on('authenticated', async (data) => {
      // Verificar que el usuario está en su sala
      const sockets = await io.in(`user:${userId}`).fetchSockets();
      expect(sockets.length).toBeGreaterThan(0);
      expect(sockets[0].id).toBe(clientSocket.id);
      done();
    });
  });

  test('should emit notification only to specific user', (done) => {
    const userId = 'user-123';
    const notification = {
      id: 'notif-uuid',
      type: 'achievement_unlocked',
      title: 'Test Achievement',
    };

    clientSocket.on('new_notification', (data) => {
      expect(data.notification.id).toBe(notification.id);
      done();
    });

    // Emitir desde servidor
    io.to(`user:${userId}`).emit('new_notification', { notification });
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

**Endpoint Admin:**
```typescript
router.get('/admin/websocket/stats',
  authenticateJWT,
  requireRole('super_admin'),
  async (req, res) => {
    try {
      const stats = await getWebSocketStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
);
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalConnections": 523,
    "uniqueUsers": 487,
    "rooms": [
      "user:user-123",
      "user:user-456",
      "classroom:class-789"
    ]
  }
}
```

---

### Logs Estructurados

```typescript
log.info('[WebSocket] Event received', {
  event: 'mark_as_read',
  userId: socket.userData!.userId,
  socketId: socket.id,
  data: { notificationId },
  timestamp: new Date().toISOString()
});
```

---

### Dashboard de Monitoreo

```typescript
// Métricas a recolectar
interface WebSocketMetrics {
  totalConnections: number;
  uniqueUsers: number;
  connectionsPerMinute: number;
  disconnectionsPerMinute: number;
  eventsPerMinute: number;
  averageEventProcessingTime: number;
  errorRate: number;
}

// Actualizar métricas periódicamente
setInterval(async () => {
  const metrics = await collectWebSocketMetrics();
  await storeMetrics(metrics);
}, 60000); // Cada minuto
```

---

## Mejores Prácticas

### 1. Siempre Autenticar

```typescript
// ❌ MAL: Permitir conexiones sin autenticación
io.on('connection', (socket) => {
  // Cualquiera puede conectarse
});

// ✅ BIEN: Requerir autenticación JWT
io.use(socketAuthMiddleware);
io.on('connection', (socket: AuthenticatedSocket) => {
  // Solo usuarios autenticados
});
```

---

### 2. Usar Salas (Rooms) para Mensajes Dirigidos

```typescript
// ❌ MAL: Emitir a todos
io.emit('notification', notification); // Todos reciben

// ✅ BIEN: Emitir solo a usuario específico
io.to(`user:${userId}`).emit('notification', notification);
```

---

### 3. Validar Eventos del Cliente

```typescript
// ❌ MAL: Confiar ciegamente en input del cliente
socket.on('mark_as_read', async (data) => {
  await markAsRead(data.notificationId); // Sin validar
});

// ✅ BIEN: Validar antes de procesar
socket.on('mark_as_read', async (data) => {
  // Validar formato
  if (!data.notificationId || typeof data.notificationId !== 'string') {
    socket.emit('error', { message: 'Invalid notification ID' });
    return;
  }

  // Validar ownership
  const notification = await getNotification(data.notificationId);
  if (notification.userId !== socket.userData!.userId) {
    socket.emit('error', { message: 'Unauthorized' });
    return;
  }

  // Procesar
  await markAsRead(data.notificationId);
});
```

---

### 4. Rate Limiting

```typescript
// Limitar eventos por socket
const eventCounts = new Map<string, number>();

socket.on('mark_as_read', async (data) => {
  const count = eventCounts.get(socket.id) || 0;

  // Máximo 10 eventos por minuto
  if (count > 10) {
    socket.emit('error', { message: 'Rate limit exceeded' });
    return;
  }

  eventCounts.set(socket.id, count + 1);

  // Reset después de 1 minuto
  setTimeout(() => {
    eventCounts.delete(socket.id);
  }, 60000);

  // Procesar evento
  // ...
});
```

---

### 5. Persistir Antes de Emitir

```typescript
// ❌ MAL: Solo emitir por WebSocket
realtimeService.emitNotificationToUser(userId, notification);

// ✅ BIEN: Persistir primero, luego emitir
const notification = await notificationsService.createNotification({
  userId,
  type: 'achievement_unlocked',
  title: 'Achievement Unlocked!',
  // ...
});

// Ahora emitir en tiempo real
realtimeService.emitNotificationToUser(userId, notification);
```

**Ventajas:**
- Usuario offline recibirá notificación cuando se conecte
- Historial completo en DB
- Puede re-emitir si falla

---

### 6. Graceful Shutdown

```typescript
const gracefulShutdown = async (signal: string) => {
  log.info(`${signal} received. Disconnecting WebSocket clients...`);

  // Emitir evento a todos los clientes
  io.emit('server_shutdown', {
    message: 'Server is shutting down. Please reconnect in a moment.'
  });

  // Desconectar todos los sockets
  const sockets = await io.fetchSockets();
  for (const socket of sockets) {
    socket.disconnect(true);
  }

  // Cerrar servidor
  io.close();

  // ... resto de shutdown
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

### 7. Logging Detallado

```typescript
// Log todas las conexiones/desconexiones
io.on('connection', (socket) => {
  log.info('[WebSocket] Connection', {
    socketId: socket.id,
    userId: socket.userData?.userId,
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent']
  });
});

socket.on('disconnect', (reason) => {
  log.info('[WebSocket] Disconnection', {
    socketId: socket.id,
    userId: socket.userData?.userId,
    reason,
    duration: Date.now() - socket.handshake.time
  });
});
```

---

### 8. Monitorear Conexiones Activas

```typescript
// Endpoint de health check
router.get('/health/websocket', (req, res) => {
  const stats = {
    totalConnections: io.engine.clientsCount,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  };

  res.json({
    success: true,
    data: stats
  });
});
```

---

## Optimizaciones

### 1. Compresión

```typescript
const io = new SocketIOServer(httpServer, {
  // ... otras opciones
  perMessageDeflate: {
    threshold: 1024, // Comprimir mensajes > 1KB
  },
});
```

---

### 2. Binary Data

Para datos binarios (imágenes, archivos), usar buffer en lugar de JSON:

```typescript
// Emitir buffer
socket.emit('file', buffer);

// Recibir buffer
socket.on('file', (data) => {
  console.log('Received buffer:', data instanceof Buffer);
});
```

---

### 3. Namespaces para Separación

```typescript
// Namespace para notificaciones
const notificationsNamespace = io.of('/notifications');

notificationsNamespace.on('connection', (socket) => {
  // Solo eventos de notificaciones
});

// Namespace para chat
const chatNamespace = io.of('/chat');

chatNamespace.on('connection', (socket) => {
  // Solo eventos de chat
});
```

**Cliente:**
```typescript
const notificationsSocket = io('ws://localhost:3006/notifications');
const chatSocket = io('ws://localhost:3006/chat');
```

---

### 4. Adapter para Escalabilidad

Para múltiples instancias del servidor, usar Redis adapter:

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

**Beneficios:**
- Múltiples servidores comparten estado
- Balance de carga entre instancias
- Broadcast funciona entre servidores

---

## Navegación

- **Índice Principal:** [README.md](./README.md)
- **Anterior:** [WebSocket-Eventos.md](./WebSocket-Eventos.md)
- **Relacionado:** [WebSocket-Conexiones.md](./WebSocket-Conexiones.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
