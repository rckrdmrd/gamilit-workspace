# ET-WS-001: WebSocket y Comunicación en Tiempo Real

**Versión:** 1.0.0
**Fecha:** 2025-12-18
**Estado:** Implementado
**Módulo Backend:** `apps/backend/src/modules/websocket/`

---

## 1. DESCRIPCIÓN

El módulo WebSocket proporciona comunicación bidireccional en tiempo real entre el backend y los clientes. Utiliza Socket.IO para gestionar conexiones, salas y eventos.

---

## 2. COMPONENTES

### 2.1 WebSocketService

**Ubicación:** `websocket/websocket.service.ts`

**Responsabilidades:**
- Gestionar conexiones de clientes
- Broadcast de eventos a usuarios/salas
- Mantener registro de usuarios conectados

**Métodos:**

| Método | Descripción | Parámetros |
|--------|-------------|------------|
| `sendToUser(userId, event, data)` | Enviar a usuario específico | userId, event, payload |
| `sendToRoom(room, event, data)` | Broadcast a una sala | roomId, event, payload |
| `broadcastToAll(event, data)` | Broadcast global | event, payload |
| `joinRoom(socketId, room)` | Unir socket a sala | socketId, roomId |
| `leaveRoom(socketId, room)` | Salir de sala | socketId, roomId |

### 2.2 NotificationsGateway

**Ubicación:** `websocket/gateways/notifications.gateway.ts`

**Eventos Soportados:**

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `connection` | Client→Server | Cliente se conecta |
| `disconnect` | Client→Server | Cliente se desconecta |
| `subscribe:notifications` | Client→Server | Suscribirse a notificaciones |
| `notification:new` | Server→Client | Nueva notificación |
| `notification:read` | Server→Client | Notificación marcada leída |
| `achievement:unlocked` | Server→Client | Logro desbloqueado |
| `rank:promoted` | Server→Client | Promoción de rango |
| `coins:earned` | Server→Client | ML Coins ganadas |

### 2.3 WsJwtGuard

**Ubicación:** `websocket/guards/ws-jwt.guard.ts`

**Funcionalidad:**
- Valida JWT en handshake de conexión
- Extrae userId del token
- Rechaza conexiones no autorizadas

---

## 3. FLUJO DE CONEXIÓN

```
1. Cliente inicia conexión WebSocket
   └─> ws://api.gamilit.com/socket.io

2. Handshake con token JWT
   └─> { auth: { token: "Bearer xxx" } }

3. WsJwtGuard valida token
   └─> Si válido: conexión aceptada
   └─> Si inválido: conexión rechazada

4. Cliente se une a sala personal
   └─> room: "user:{userId}"

5. Cliente recibe eventos en tiempo real
   └─> notification:new, achievement:unlocked, etc.
```

---

## 4. CONFIGURACIÓN

### 4.1 Módulo

```typescript
@Module({
  imports: [JwtModule],
  providers: [
    WebSocketService,
    NotificationsGateway,
    WsJwtGuard,
  ],
  exports: [WebSocketService],
})
export class WebSocketModule {}
```

### 4.2 Gateway

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // ...
}
```

---

## 5. SALAS (ROOMS)

| Sala | Formato | Propósito |
|------|---------|-----------|
| Usuario | `user:{userId}` | Notificaciones personales |
| Classroom | `classroom:{classroomId}` | Eventos del aula |
| Teacher | `teacher:{teacherId}` | Alertas para maestros |
| Admin | `admin:all` | Alertas administrativas |

---

## 6. EVENTOS DE GAMIFICACIÓN

### 6.1 Achievement Unlocked

```typescript
// Server envía
socket.emit('achievement:unlocked', {
  achievementId: 'ach-123',
  name: 'Primer Ejercicio',
  description: 'Completaste tu primer ejercicio',
  icon: 'trophy',
  xpReward: 100,
});
```

### 6.2 Rank Promoted

```typescript
socket.emit('rank:promoted', {
  oldRank: { name: 'Ajaw', level: 1 },
  newRank: { name: 'Nacom', level: 2 },
  xpRequired: 500,
});
```

### 6.3 Coins Earned

```typescript
socket.emit('coins:earned', {
  amount: 50,
  reason: 'exercise_completed',
  newBalance: 1250,
});
```

---

## 7. INTEGRACIÓN CON NOTIFICACIONES

```typescript
// NotificationsService usa WebSocketService
@Injectable()
export class NotificationsService {
  constructor(private readonly wsService: WebSocketService) {}

  async sendNotification(userId: string, notification: Notification) {
    // Guardar en BD
    await this.notificationRepo.save(notification);

    // Enviar por WebSocket si usuario conectado
    this.wsService.sendToUser(userId, 'notification:new', notification);
  }
}
```

---

## 8. DEPENDENCIAS

### 8.1 Módulos Requeridos

- `JwtModule` (para autenticación)

### 8.2 Es Usado Por

- `NotificationsModule` (envío de notificaciones real-time)
- `GamificationModule` (eventos de logros, rangos)
- `ProgressModule` (eventos de ejercicios)

---

## 9. SEGURIDAD

- Autenticación JWT obligatoria
- Validación de pertenencia a salas
- Rate limiting por conexión
- Sanitización de payloads

---

## 10. MONITOREO

| Métrica | Descripción |
|---------|-------------|
| `ws_connections_active` | Conexiones activas |
| `ws_messages_sent` | Mensajes enviados/min |
| `ws_errors` | Errores de conexión |
| `ws_latency` | Latencia promedio |

---

*Especificación generada: 2025-12-18*
