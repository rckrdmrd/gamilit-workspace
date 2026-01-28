# ET-NOT-001: Push Notifications

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-NOT-001 |
| **Modulo** | Notificaciones |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 60% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-NOT-001: Push Notification System

### User Stories
- [US-NOT-001a: WebSocket Infrastructure](../historias-usuario/US-NOT-001a-websocket-infrastructure.md)

---

## Descripcion Funcional

Sistema de notificaciones push en tiempo real:
- Web Push API (browser notifications)
- WebSocket para notificaciones in-app
- Mobile push (Firebase Cloud Messaging)
- Service Worker para notificaciones offline

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - NotificationCenter                                    |
|  - useWebSocket hook                                     |
|  - PushNotificationManager                               |
|  - Service Worker                                        |
+-----------------------------+----------------------------+
                              | WebSocket + HTTP
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - NotificationsGateway (WebSocket)                     |
|  - PushNotificationService                               |
|  - UserDeviceService                                     |
|  - WebSocketService                                      |
+-----------------------------+----------------------------+
                              |
+-----------------------------v----------------------------+
|               EXTERNAL SERVICES                           |
|  - Firebase Cloud Messaging (FCM)                        |
|  - Web Push (VAPID)                                      |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Backend - WebSocket Gateway

**Ubicacion:** `apps/backend/src/modules/websocket/notifications.gateway.ts`

**Estado:** COMPLETO (100%)

```typescript
@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Socket[]> = new Map();

  handleConnection(client: Socket): void {
    const userId = this.extractUserId(client);
    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      sockets.push(client);
      this.userSockets.set(userId, sockets);
    }
  }

  handleDisconnect(client: Socket): void {
    // Remove socket from user map
  }

  /**
   * Envia notificacion a usuario especifico
   */
  sendToUser(userId: string, notification: NotificationPayload): void {
    const sockets = this.userSockets.get(userId) || [];
    sockets.forEach((socket) => {
      socket.emit('notification', notification);
    });
  }

  /**
   * Envia a todos los usuarios de un aula
   */
  sendToClassroom(classroomId: string, notification: NotificationPayload): void {
    this.server.to(`classroom:${classroomId}`).emit('notification', notification);
  }

  /**
   * Broadcast a todos los usuarios conectados
   */
  broadcast(notification: NotificationPayload): void {
    this.server.emit('notification', notification);
  }
}
```

### Backend - WebSocketService

**Ubicacion:** `apps/backend/src/modules/websocket/websocket.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class WebSocketService {
  constructor(private readonly gateway: NotificationsGateway) {}

  /**
   * Emite notificacion a usuario
   */
  emitNotificationToUser(userId: string, notification: any): void {
    this.gateway.sendToUser(userId, {
      type: 'notification',
      payload: notification,
    });
  }

  /**
   * Emite actualizacion de gamificacion
   */
  emitGamificationUpdate(userId: string, update: any): void {
    this.gateway.sendToUser(userId, {
      type: 'gamification_update',
      payload: update,
    });
  }

  /**
   * Emite actualizacion de progreso
   */
  emitProgressUpdate(userId: string, progress: any): void {
    this.gateway.sendToUser(userId, {
      type: 'progress_update',
      payload: progress,
    });
  }
}
```

### Backend - PushNotificationService

**Ubicacion:** `apps/backend/src/modules/notifications/services/push-notification.service.ts`

**Estado:** PARCIAL (50%)

```typescript
@Injectable()
export class PushNotificationService {
  /**
   * Envia push notification via FCM
   */
  async sendPushNotification(
    deviceTokens: string[],
    notification: PushPayload
  ): Promise<SendResult>;

  /**
   * Envia web push
   */
  async sendWebPush(
    subscription: PushSubscription,
    notification: PushPayload
  ): Promise<void>;
}
```

### Backend - UserDeviceService

**Ubicacion:** `apps/backend/src/modules/notifications/services/user-device.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class UserDeviceService {
  /**
   * Registra dispositivo del usuario
   */
  async registerDevice(
    userId: string,
    deviceInfo: RegisterDeviceDto
  ): Promise<UserDevice>;

  /**
   * Obtiene dispositivos del usuario
   */
  async getUserDevices(userId: string): Promise<UserDevice[]>;

  /**
   * Elimina dispositivo
   */
  async removeDevice(userId: string, deviceId: string): Promise<void>;

  /**
   * Actualiza token del dispositivo
   */
  async updateDeviceToken(deviceId: string, token: string): Promise<void>;
}
```

### Frontend - useWebSocket Hook

**Ubicacion:** `apps/frontend/src/features/notifications/hooks/useWebSocket.ts`

**Estado:** COMPLETO (100%)

```typescript
export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(`${API_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    newSocket.on('notification', (data) => {
      // Handle notification
      useNotificationStore.getState().addNotification(data);
      // Show toast
      toast(data.title, { description: data.message });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return { socket, isConnected };
}
```

---

## Lo que Falta para Completar (40%)

### 1. Service Worker (15%)

```typescript
// public/sw.js (NUEVO)
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.message,
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    data: data.data,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.openWindow(url)
  );
});
```

### 2. Web Push Registration (10%)

```typescript
// services/push-registration.service.ts (NUEVO)
export class PushRegistrationService {
  /**
   * Registra Service Worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration>;

  /**
   * Solicita permiso de notificaciones
   */
  async requestPermission(): Promise<NotificationPermission>;

  /**
   * Obtiene subscription para Web Push
   */
  async getSubscription(): Promise<PushSubscription>;

  /**
   * Envia subscription al backend
   */
  async registerSubscription(subscription: PushSubscription): Promise<void>;
}
```

### 3. FCM Integration (10%)

```typescript
// services/fcm.service.ts (NUEVO)
import * as admin from 'firebase-admin';

@Injectable()
export class FCMService {
  private messaging: admin.messaging.Messaging;

  /**
   * Inicializa Firebase Admin
   */
  onModuleInit(): void {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    this.messaging = admin.messaging();
  }

  /**
   * Envia notificacion a multiples tokens
   */
  async sendMulticast(
    tokens: string[],
    notification: FCMNotification
  ): Promise<admin.messaging.BatchResponse>;

  /**
   * Envia a topic
   */
  async sendToTopic(
    topic: string,
    notification: FCMNotification
  ): Promise<string>;
}
```

### 4. Notification Preferences (5%)

```typescript
// components/PushNotificationToggle.tsx (NUEVO)
export const PushNotificationToggle: React.FC = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = async () => {
    if (permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
    // Toggle subscription
  };

  return (
    <div className="push-toggle">
      <span>Notificaciones Push</span>
      <Switch checked={isEnabled} onChange={handleToggle} />
    </div>
  );
};
```

---

## Tipos de Notificaciones Push

| Tipo | Titulo | Ejemplo |
|------|--------|---------|
| achievement | Logro desbloqueado | "Ganaste el logro 'Primer paso'" |
| level_up | Subiste de nivel | "Llegaste al nivel 5" |
| rank_up | Promocion de rango | "Ahora eres Nacom" |
| mission_ready | Nuevas misiones | "Tus misiones diarias estan listas" |
| streak_reminder | Recordatorio | "No pierdas tu racha de 7 dias" |
| classroom_message | Mensaje de profesor | "Tu profesor dejo un mensaje" |

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/notifications/devices/register` | Registrar dispositivo |
| GET | `/notifications/devices` | Listar dispositivos |
| DELETE | `/notifications/devices/:id` | Eliminar dispositivo |
| POST | `/notifications/web-push/subscribe` | Suscribirse a web push |
| POST | `/notifications/web-push/unsubscribe` | Desuscribirse |

---

## Criterios de Aceptacion

### Funcionales
- [x] WebSocket en tiempo real
- [x] Notificaciones in-app
- [x] Registro de dispositivos
- [ ] Web Push API integration
- [ ] Service Worker
- [ ] FCM integration
- [ ] Permission management UI

### No Funcionales
- [x] WebSocket con reconexion automatica
- [x] < 100ms latencia
- [ ] Offline notification queue
- [ ] Cross-browser support

---

## Dependencias

### Bloqueado Por
- Notification Entity (COMPLETO)
- WebSocket Gateway (COMPLETO)

### Bloquea
- Mobile App Push
- Rich Notifications
- Notification Actions

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| Service Worker | 6h |
| Web Push Registration | 5h |
| FCM Integration | 6h |
| Permission UI | 3h |
| Tests | 3h |
| **Total** | **23h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-NOT-001-push-notifications.md*
*Generado: 2026-01-27*
