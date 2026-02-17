# ET-NOT-003: In-App Notifications

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-NOT-003 |
| **Modulo** | Notificaciones |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Implementado |
| **Completitud** | 90% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-NOT-003: In-App Notification System

### User Stories
- [US-NOT-001b: Notification Center](../user-stories/US-NOT-001b/US-NOT-001b-notification-center.md)

---

## Descripcion Funcional

Sistema de notificaciones dentro de la aplicacion:
- Centro de notificaciones (dropdown)
- Notificaciones en tiempo real (WebSocket)
- Badges de notificaciones no leidas
- Tipos de notificacion con iconos
- Acciones rapidas desde notificacion
- Persistencia y paginacion

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - NotificationCenter (dropdown)                         |
|  - NotificationDropdown                                  |
|  - NotificationItem                                      |
|  - NotificationBadge                                     |
|  - useNotificationStore (Zustand)                        |
+-----------------------------+----------------------------+
                              | REST API + WebSocket
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - NotificationsController                               |
|  - NotificationService                                   |
|  - WebSocketService                                      |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - communication.notifications                           |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Backend - NotificationService

**Ubicacion:** `apps/backend/src/modules/notifications/services/notification.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class NotificationService {
  /**
   * Crea notificacion
   */
  async create(data: CreateNotificationDto): Promise<Notification>;

  /**
   * Obtiene notificaciones del usuario
   */
  async findByUser(
    userId: string,
    options?: FindNotificationsOptions
  ): Promise<PaginatedResult<Notification>>;

  /**
   * Obtiene notificaciones no leidas
   */
  async findUnread(userId: string): Promise<Notification[]>;

  /**
   * Cuenta no leidas
   */
  async countUnread(userId: string): Promise<number>;

  /**
   * Marca como leida
   */
  async markAsRead(userId: string, notificationId: string): Promise<void>;

  /**
   * Marca todas como leidas
   */
  async markAllAsRead(userId: string): Promise<void>;

  /**
   * Elimina notificacion
   */
  async delete(userId: string, notificationId: string): Promise<void>;

  /**
   * Elimina todas las leidas
   */
  async deleteAllRead(userId: string): Promise<number>;
}
```

### Backend - NotificationsController

**Ubicacion:** `apps/backend/src/modules/notifications/controllers/notifications.controller.ts`

**Estado:** COMPLETO (100%)

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/notifications` | GET | Listar con paginacion |
| `/notifications/unread` | GET | Solo no leidas |
| `/notifications/unread/count` | GET | Contador |
| `/notifications/:id/read` | PATCH | Marcar como leida |
| `/notifications/read-all` | PATCH | Marcar todas |
| `/notifications/:id` | DELETE | Eliminar una |
| `/notifications/clear-read` | DELETE | Eliminar leidas |

### Database - Notification Entity

**Ubicacion:** `apps/backend/src/modules/notifications/entities/multichannel/notification.entity.ts`

**Estado:** COMPLETO (100%)

```typescript
@Entity({ schema: DB_SCHEMAS.COMMUNICATION, name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('text')
  type!: string;

  @Column('text')
  title!: string;

  @Column('text')
  message!: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column('text', { default: 'normal' })
  priority!: string;

  @Column('text[]', { default: '{}' })
  channels!: string[];

  @Column('text', { default: 'sent' })
  status!: string;

  @Column('boolean', { default: false })
  isRead!: boolean;

  @Column('timestamp with time zone', { nullable: true })
  readAt?: Date;

  @Column('timestamp with time zone', { nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
```

### Frontend - NotificationDropdown

**Ubicacion:** `apps/frontend/src/features/notifications/components/NotificationDropdown.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotifications();

  if (!isOpen) return null;

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notificaciones</h3>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}>Marcar todas</button>
        )}
      </div>

      <div className="notification-list">
        {isLoading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyState message="No tienes notificaciones" />
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => markAsRead(notification.id)}
            />
          ))
        )}
      </div>

      <div className="notification-footer">
        <a href="/notifications">Ver todas</a>
      </div>
    </div>
  );
};
```

### Frontend - NotificationItem

**Ubicacion:** `apps/frontend/src/features/notifications/components/NotificationItem.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onClick?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClick,
}) => {
  const Icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

  return (
    <div
      className={cn(
        'notification-item',
        !notification.isRead && 'notification-unread'
      )}
      onClick={() => {
        if (!notification.isRead) onMarkAsRead();
        onClick?.();
      }}
    >
      <div className={cn('notification-icon', color)}>
        <Icon />
      </div>

      <div className="notification-content">
        <p className="notification-title">{notification.title}</p>
        <p className="notification-message">{notification.message}</p>
        <span className="notification-time">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>

      {!notification.isRead && <div className="unread-dot" />}
    </div>
  );
};
```

### Frontend - useNotificationStore

**Ubicacion:** `apps/frontend/src/features/notifications/store/notificationStore.ts`

**Estado:** COMPLETO (100%)

```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  // Actions
  fetchNotifications: () => Promise<void>;
  fetchMore: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,
  page: 1,

  fetchNotifications: async () => { ... },
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  // ... rest of actions
}));
```

---

## Tipos de Notificacion

| Tipo | Icono | Color | Ejemplo |
|------|-------|-------|---------|
| achievement | Trophy | Gold | "Desbloqueaste un logro" |
| level_up | Star | Purple | "Subiste al nivel 5" |
| rank_up | Crown | Blue | "Ahora eres Nacom" |
| mission | Target | Green | "Mision completada" |
| streak | Fire | Orange | "Racha de 7 dias" |
| coins | Coin | Yellow | "Ganaste 50 ML Coins" |
| message | Message | Gray | "Mensaje de tu profesor" |
| system | Info | Blue | "Actualizacion del sistema" |
| warning | Alert | Red | "Tu racha esta en riesgo" |

---

## Lo que Falta para Completar (10%)

### 1. Notification Actions (5%)

```typescript
// components/NotificationActions.tsx (NUEVO)
interface NotificationAction {
  id: string;
  label: string;
  url?: string;
  action?: () => void;
  variant: 'primary' | 'secondary';
}

export const NotificationActions: React.FC<{
  actions: NotificationAction[];
}>;
```

### 2. Notification Groups (5%)

```typescript
// utils/notificationGrouper.ts (NUEVO)
/**
 * Agrupa notificaciones similares
 * Ej: "Ganaste 3 logros hoy"
 */
export function groupNotifications(
  notifications: Notification[]
): GroupedNotification[];
```

---

## Criterios de Aceptacion

### Funcionales
- [x] Centro de notificaciones dropdown
- [x] Badge con contador de no leidas
- [x] Marcar como leida individual
- [x] Marcar todas como leidas
- [x] Notificaciones en tiempo real
- [x] Paginacion infinita
- [x] Iconos por tipo
- [ ] Acciones en notificacion
- [ ] Agrupacion de similares

### No Funcionales
- [x] Actualizacion en < 100ms
- [x] Scroll infinito performante
- [x] Animaciones de entrada/salida

---

## Dependencias

### Bloqueado Por
- Notification Entity (COMPLETO)
- WebSocket Gateway (COMPLETO)

### Bloquea
- Notification Analytics
- Notification Preferences Page

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| Notification Actions | 3h |
| Notification Groups | 4h |
| Tests | 2h |
| **Total** | **9h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-NOT-003-in-app-notifications.md*
*Generado: 2026-01-27*
