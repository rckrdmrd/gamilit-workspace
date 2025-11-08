# Trazabilidad: Realtime Notifications & WebSocket

**Metadata RFC-0001**
- **Tipo:** Especificacion Tecnica - Trazabilidad Modular
- **Categoria:** Realtime Communication, WebSocket, Notifications
- **Version:** 2.0
- **Fecha:** Octubre 2025
- **Stack:** PostgreSQL 16 → Node.js/TypeScript → React/TypeScript → Socket.io
- **Autor:** Sistema GAMILIT
- **Estado:** Activo

---

## Vision General

Este modulo documenta la trazabilidad completa del sistema de notificaciones en tiempo real de la plataforma GAMILIT utilizando WebSocket (Socket.io).

**Alcance:** WebSocket Server, Realtime Notifications, Push Events

---

## Flujo 6: Notificaciones en Tiempo Real (WebSocket)

**Trigger:** Evento del backend (logro desbloqueado, mision completada, etc.)

### Backend - WebSocket Server
```typescript
// backend/websocket/socket.server.ts
import { Server } from 'socket.io';
import { authenticateSocket } from './socket.auth';

export function initializeSocketServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  // Middleware de autenticacion
  io.use(authenticateSocket);

  // Conexion
  io.on('connection', (socket) => {
    const userId = socket.data.userId;

    console.log(`User ${userId} connected to WebSocket`);

    // Unir a sala personal
    socket.join(`user:${userId}`);

    // Emitir confirmacion
    socket.emit('authenticated', { userId });

    // Marcar notificacion como leida
    socket.on('mark_as_read', async (notificationId: string) => {
      await notificationsService.markAsRead(userId, notificationId);
      socket.emit('notification_read', { notificationId });
    });

    // Desconexion
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from WebSocket`);
    });
  });

  // Guardar instancia de IO para usar en servicios
  global.io = io;

  return io;
}
```

### Backend - Realtime Service
```typescript
// backend/modules/notifications/services/realtime.service.ts
export class RealtimeService {
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map();

  initialize(io: Server) {
    this.io = io;
  }

  emitNotificationToUser(userId: string, notification: Notification) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('new_notification', notification);
  }

  emitUnreadCountUpdate(userId: string, count: number) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('unread_count_updated', {
      count,
      timestamp: new Date()
    });
  }

  broadcastToAllUsers(notification: Notification) {
    if (!this.io) return;

    this.io.emit('system_announcement', notification);
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) &&
           this.userSockets.get(userId)!.size > 0;
  }
}

export const realtimeService = new RealtimeService();
```

### Backend - Notifications Service (Integration)
```typescript
// backend/modules/notifications/notifications.service.ts
async createNotification(dto: CreateNotificationDto): Promise<Notification> {
  const notification = await notificationsRepository.create({
    userId: dto.userId,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    data: dto.data,
    priority: dto.priority || 'medium',
    isRead: false,
  });

  // Emitir via WebSocket si usuario esta conectado
  realtimeService.emitNotificationToUser(dto.userId, notification);

  // Actualizar contador
  const unreadCount = await this.getUnreadCount(dto.userId);
  realtimeService.emitUnreadCountUpdate(dto.userId, unreadCount);

  return notification;
}
```

### Frontend - WebSocket Hook
```typescript
// services/websocket/useWebSocket.ts
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@features/auth/store/authStore';
import { useNotificationsStore } from '@features/notifications/store/notificationsStore';

export const useWebSocket = () => {
  const token = useAuthStore((state) => state.token);
  const addNotification = useNotificationsStore((state) => state.addNotification);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    // Conectar
    const socketInstance = io(WS_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket', 'polling']
    });

    // Eventos
    socketInstance.on('authenticated', (data) => {
      console.log('WebSocket authenticated:', data);
    });

    socketInstance.on('new_notification', (notification) => {
      addNotification(notification);
      toast.info(notification.message);
    });

    socketInstance.on('unread_count_updated', ({ count }) => {
      useNotificationsStore.setState({ unreadCount: count });
    });

    socketInstance.on('notification_read', ({ notificationId }) => {
      useNotificationsStore.getState().markAsRead(notificationId);
    });

    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return socket;
};
```

### Frontend - Notifications Store (WebSocket Integration)
```typescript
// features/notifications/store/notificationsStore.ts
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  // ... otras acciones
}));
```

---

## Tipos de Datos

### WebSocket Types
```typescript
interface SocketData {
  userId: string;
  sessionId: string;
}

interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}
```

### WebSocket Events
```typescript
// Server -> Client Events
interface ServerToClientEvents {
  authenticated: (data: { userId: string }) => void;
  new_notification: (notification: Notification) => void;
  unread_count_updated: (data: { count: number; timestamp: Date }) => void;
  notification_read: (data: { notificationId: string }) => void;
  system_announcement: (notification: Notification) => void;
}

// Client -> Server Events
interface ClientToServerEvents {
  mark_as_read: (notificationId: string) => void;
  ping: () => void;
}
```

---

## Diagrama de Flujo

```
Backend Event (Achievement Unlocked)
            ↓
  Notifications Service
            ↓
   Create Notification in DB
            ↓
   Realtime Service
            ↓
   WebSocket Server (Socket.io)
            ↓
   Emit to User Room
            ↓
   Frontend WebSocket Hook
            ↓
   Notifications Store
            ↓
   Update UI + Toast Notification
```

---

## Patrones de Diseno

### Room-based Broadcasting
- Cada usuario se une a su sala personal: `user:${userId}`
- Permite enviar notificaciones solo a usuarios especificos
- Soporte para broadcasts globales via `io.emit()`

### Reconnection Strategy
- Socket.io maneja reconexion automatica
- Mensajes perdidos se recuperan via polling al reconectar
- Frontend sincroniza estado al autenticarse

### Authentication Middleware
- JWT validation en handshake inicial
- Socket desconectado si token invalido
- userId se almacena en `socket.data`

---

## Referencias

- **Documento Padre:** TRAZABILIDAD-COMPLETA.md
- **Relacionado con:** 04-gamification-progression.md, 02-educational-mechanics.md
- **RFC-0001:** Governance Model GAMILIT Platform
- **Tecnologia:** Socket.io v4+
