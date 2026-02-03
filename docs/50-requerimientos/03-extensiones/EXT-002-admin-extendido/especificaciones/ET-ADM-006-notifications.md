# ET-ADM-006: Centro de Notificaciones Admin

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ADM-006 |
| **Modulo** | Admin Extendido |
| **Titulo** | Implementacion del Centro de Notificaciones Admin |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-25 |
| **Ultima Actualizacion** | 2026-01-25 |
| **Autor** | Architecture Analyst |

---

## Referencias

### User Stories
- US-AE-012: Centro de Notificaciones Admin
- US-AE-014: Preferencias de Notificacion

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - AdminNotificationsPage                                 |
|  - useNotificationsStore (Zustand)                        |
|  - useWebSocket (real-time)                               |
+-----------------------------+----------------------------+
                              | REST API + WebSocket
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - NotificationsController                               |
|  - NotificationsService                                  |
|  - NotificationsGateway (WebSocket)                      |
+-----------------------------+----------------------------+
                              | SQL Queries
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - notifications_system.notifications                    |
|  - notifications_system.user_notification_preferences    |
+----------------------------------------------------------+
```

### Flujo de Notificaciones

```
Nueva notificacion generada
        |
        v
NotificationsService.create()
        |
        v
NotificationsGateway.emit('new_notification')
        |
        v
Frontend: useWebSocket recibe evento
        |
        v
Zustand store: addNotification()
        |
        v
UI actualiza en tiempo real
```

---

## Implementacion Backend

### Controller

**Ubicacion:** `apps/backend/src/notifications/notifications.controller.ts`

```typescript
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('limit') limit: number = 50,
    @Query('status') status?: 'all' | 'unread' | 'read'
  ) {
    return this.notificationsService.findByUser(user.id, { limit, status });
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.delete(id, user.id);
  }
}
```

### WebSocket Gateway

**Ubicacion:** `apps/backend/src/notifications/notifications.gateway.ts`

```typescript
@WebSocketGateway({ namespace: '/notifications' })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  async sendNotification(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('new_notification', notification);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, userId: string) {
    client.join(`user:${userId}`);
  }
}
```

---

## Implementacion Frontend

### Pagina Principal

**Ubicacion:** `apps/frontend/src/apps/admin/pages/AdminNotificationsPage.tsx`

### Zustand Store

**Ubicacion:** `apps/frontend/src/features/notifications/store/notificationsStore.ts`

```typescript
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
}
```

### Tipos de Notificacion

```typescript
type NotificationType =
  | 'system_announcement'
  | 'security_alert'
  | 'user_activity'
  | 'institution_update'
  | 'system_health'
  | 'database_alert'
  | 'achievement_unlocked'
  | 'rank_promoted'
  | 'mission_completed'
  | 'friend_request'
  | 'assignment_created'
  | 'module_unlocked'
  | 'coins_received';
```

### Mapeo de Iconos

| Tipo | Icono | Color |
|------|-------|-------|
| system_announcement | Megaphone | Azul |
| security_alert | Shield | Rojo |
| user_activity | Users | Verde |
| institution_update | Building2 | Morado |
| system_health | Activity | Amarillo |
| database_alert | Database | Naranja |

### Funcionalidades

1. **Lista de Notificaciones:**
   - Scroll infinito (limit: 50)
   - Filtro por estado (todas/leidas/no leidas)
   - Filtro por tipo (dinamico)

2. **Acciones:**
   - Marcar como leida (individual)
   - Marcar todas como leidas
   - Eliminar notificacion

3. **Tiempo Real:**
   - WebSocket para nuevas notificaciones
   - Actualizacion automatica del contador

4. **UI/UX:**
   - Animaciones con Framer Motion
   - Estados visuales (leido/no leido)
   - Formato de tiempo relativo

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/notifications` | Listar notificaciones |
| GET | `/api/notifications/unread-count` | Contador no leidas |
| PATCH | `/api/notifications/:id/read` | Marcar como leida |
| POST | `/api/notifications/read-all` | Marcar todas como leidas |
| DELETE | `/api/notifications/:id` | Eliminar notificacion |

### WebSocket Events

| Evento | Direccion | Payload |
|--------|-----------|---------|
| subscribe | Client -> Server | userId |
| new_notification | Server -> Client | Notification |
| notification_read | Server -> Client | notificationId |
| unread_count_updated | Server -> Client | count |

---

## Tipos TypeScript

### Notification

```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  status: 'unread' | 'read';
  createdAt: string;
}
```

---

## State Management

### Local State

| State | Tipo | Descripcion |
|-------|------|-------------|
| statusFilter | 'all' \| 'unread' \| 'read' | Filtro de estado |
| typeFilter | string | Filtro de tipo |
| isRefreshing | boolean | Estado de refresh |
| showFilters | boolean | Toggle filtros |

### Memoized Values

```typescript
const filteredNotifications = useMemo(() => {
  return notifications.filter(n => {
    if (statusFilter === 'unread' && n.status !== 'unread') return false;
    if (statusFilter === 'read' && n.status !== 'read') return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });
}, [notifications, statusFilter, typeFilter]);

const availableTypes = useMemo(() => {
  return [...new Set(notifications.map(n => n.type))];
}, [notifications]);
```

---

## Dependencias

### Frontend
- zustand (state management)
- socket.io-client (WebSocket)
- framer-motion (animaciones)
- lucide-react (iconos)

### Backend
- @nestjs/websockets (WebSocket)
- socket.io (server)

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-25 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-ADM-006-notifications.md*
*Generado: 2026-01-25*
