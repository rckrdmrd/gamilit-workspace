
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: ET-NOT-001 -->
<!-- ID Nuevo: M-NOT-ET-001 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-NOT-ET-001: Implementación del Sistema de Notificaciones

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-NOT-001 |
| **Módulo** | 06 - Notificaciones |
| **Título** | Implementación del Sistema de Notificaciones |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team, Backend Team |
| **Reviewers** | Backend Lead, Frontend Lead |

---

## 🔗 Referencias

### Requerimiento Funcional

📘 **Documento RF:**
- [RF-NOT-001: Tipos de Notificaciones](../../01-requerimientos/06-notificaciones/RF-NOT-001-tipos-notificaciones.md)

### Implementación DDL

🗄️ **ENUMs:**
- `public.notification_type` - `apps/database/ddl/00-prerequisites.sql:76-80`
- `public.notification_priority` - `apps/database/ddl/00-prerequisites.sql:81-85`

🗄️ **Tablas:**
- `public.notifications`

---

## 🏗️ Arquitectura

### Flujo de Notificaciones en Tiempo Real

```
Evento (ej: achievement desbloqueado)
        ↓
Trigger DB / Event Listener
        ↓
    ┌────────────────────────────────┐
    │ INSERT notification            │
    │ - user_id                      │
    │ - type = 'achievement_unlocked'│
    │ - priority = 'high'            │
    │ - data (JSONB)                 │
    └─────────────┬──────────────────┘
                  ↓
    ┌────────────────────────────────┐
    │ NotificationGateway (WebSocket)│
    │ - Emit 'notification:new'      │
    └─────────────┬──────────────────┘
                  ↓
    ┌────────────────────────────────┐
    │ Frontend recibe evento         │
    │ - Mostrar toast                │
    │ - Actualizar badge             │
    │ - Reproducir sonido            │
    └────────────────────────────────┘
```

---

## 💾 Implementación de Base de Datos

### 1. ENUM: notification_type

**Ubicación:** `apps/database/ddl/00-prerequisites.sql:76-80`

```sql
-- Notification Types
CREATE TYPE public.notification_type AS ENUM (
    'achievement_unlocked',
    'rank_up',
    'module_completed',
    'module_mastered',
    'streak_milestone',
    'streak_broken',
    'classroom_invitation',
    'friend_request',
    'team_invitation',
    'ml_coins_earned',
    'system_announcement'
);

COMMENT ON TYPE public.notification_type IS '11 tipos de notificaciones in-app';
```

### 2. ENUM: notification_priority

**Ubicación:** `apps/database/ddl/00-prerequisites.sql:81-85`

```sql
-- Notification Priority
CREATE TYPE public.notification_priority AS ENUM (
    'low',      -- Información general
    'medium',   -- Requiere atención eventual
    'high',     -- Importante, revisar pronto
    'urgent'    -- Crítico, requiere acción inmediata
);

COMMENT ON TYPE public.notification_priority IS 'Niveles de prioridad de notificaciones';
```

### 3. Tabla: notifications

**Ubicación:** `apps/database/ddl/schemas/public/tables/notifications.sql`

```sql
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Usuario destinatario
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Clasificación
    type public.notification_type NOT NULL,
    priority public.notification_priority NOT NULL DEFAULT 'medium',

    -- Contenido
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    data JSONB, -- Información adicional específica por tipo

    -- Estado
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,

    -- Acciones
    action_url VARCHAR(500), -- URL a la que redirigir al hacer click
    action_label VARCHAR(100), -- Texto del botón de acción

    -- Expiración
    expires_at TIMESTAMPTZ, -- Para invitaciones y temporales

    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_priority ON public.notifications(priority);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_expires_at ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Trigger para updated_at
CREATE TRIGGER trg_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Comentarios
COMMENT ON TABLE public.notifications IS 'Notificaciones in-app para usuarios';
COMMENT ON COLUMN public.notifications.data IS 'JSONB con información específica por tipo';
COMMENT ON COLUMN public.notifications.expires_at IS 'Para invitaciones y notificaciones temporales';

-- Constraint
ALTER TABLE public.notifications
    ADD CONSTRAINT chk_read_at_requires_is_read CHECK (
        (is_read = false AND read_at IS NULL) OR
        (is_read = true AND read_at IS NOT NULL)
    );
```

### 4. Función: Crear Notificación

**Ubicación:** `apps/database/ddl/schemas/public/functions/create_notification.sql`

```sql
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type public.notification_type,
    p_title VARCHAR,
    p_body TEXT,
    p_data JSONB DEFAULT NULL,
    p_priority public.notification_priority DEFAULT 'medium',
    p_action_url VARCHAR DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
    v_unread_count INTEGER;
BEGIN
    -- 1. Contar notificaciones no leídas
    SELECT COUNT(*) INTO v_unread_count
    FROM public.notifications
    WHERE user_id = p_user_id
        AND is_read = false;

    -- 2. Si tiene más de 100 notificaciones no leídas, borrar las más antiguas de prioridad 'low'
    IF v_unread_count >= 100 THEN
        DELETE FROM public.notifications
        WHERE id IN (
            SELECT id
            FROM public.notifications
            WHERE user_id = p_user_id
                AND is_read = false
                AND priority = 'low'
            ORDER BY created_at ASC
            LIMIT 10
        );
    END IF;

    -- 3. Crear notificación
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        body,
        data,
        priority,
        action_url,
        expires_at
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_body,
        p_data,
        p_priority,
        p_action_url,
        p_expires_at
    ) RETURNING id INTO v_notification_id;

    RAISE NOTICE 'Notification created: %', v_notification_id;

    RETURN v_notification_id;
END;
$$;

COMMENT ON FUNCTION public.create_notification IS 'Crear notificación con validaciones y limpieza automática';
```

### 5. Job: Limpiar Notificaciones Expiradas

**Ubicación:** `apps/database/ddl/schemas/public/jobs/cleanup_expired_notifications.sql`

```sql
-- Job nocturno (cron: 0 2 * * *)
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Borrar notificaciones expiradas
    WITH deleted AS (
        DELETE FROM public.notifications
        WHERE expires_at < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted;

    -- Borrar notificaciones antiguas (excepto achievements y rank_up)
    WITH deleted_old AS (
        DELETE FROM public.notifications
        WHERE created_at < NOW() - INTERVAL '30 days'
            AND type NOT IN ('achievement_unlocked', 'rank_up', 'module_completed', 'module_mastered')
        RETURNING id
    )
    SELECT COUNT(*) + v_deleted_count INTO v_deleted_count FROM deleted_old;

    RAISE NOTICE 'Deleted % expired/old notifications', v_deleted_count;

    RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_notifications IS 'Job nocturno para limpiar notificaciones expiradas y antiguas';
```

---

## 🔧 Implementación Backend (NestJS)

### 1. Enums TypeScript

```typescript
export enum NotificationTypeEnum {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_UP = 'rank_up',
  MODULE_COMPLETED = 'module_completed',
  MODULE_MASTERED = 'module_mastered',
  STREAK_MILESTONE = 'streak_milestone',
  STREAK_BROKEN = 'streak_broken',
  CLASSROOM_INVITATION = 'classroom_invitation',
  FRIEND_REQUEST = 'friend_request',
  TEAM_INVITATION = 'team_invitation',
  ML_COINS_EARNED = 'ml_coins_earned',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export enum NotificationPriorityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}
```

### 2. Entity

```typescript
@Entity({ schema: 'public', name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: NotificationTypeEnum })
  type: NotificationTypeEnum;

  @Column({ type: 'enum', enum: NotificationPriorityEnum, default: NotificationPriorityEnum.MEDIUM })
  priority: NotificationPriorityEnum;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'read_at' })
  readAt?: Date;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'action_url' })
  actionUrl?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'action_label' })
  actionLabel?: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 3. NotificationService

```typescript
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    private notificationGateway: NotificationGateway, // WebSocket
  ) {}

  /**
   * Crear notificación y enviar en tiempo real
   */
  async create(
    userId: string,
    type: NotificationTypeEnum,
    title: string,
    body: string,
    data?: Record<string, any>,
    priority: NotificationPriorityEnum = NotificationPriorityEnum.MEDIUM,
    actionUrl?: string
  ): Promise<Notification> {
    // Usar función SQL que maneja validaciones y limpieza
    const result = await this.notificationRepo.query(
      'SELECT public.create_notification($1, $2, $3, $4, $5, $6, $7) as id',
      [userId, type, title, body, data ? JSON.stringify(data) : null, priority, actionUrl]
    );

    const notificationId = result[0].id;

    // Obtener notificación creada
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId },
    });

    // Enviar por WebSocket
    await this.notificationGateway.sendToUser(userId, 'notification:new', notification);

    return notification;
  }

  /**
   * Obtener notificaciones del usuario
   */
  async findAll(
    userId: string,
    filters?: {
      isRead?: boolean;
      type?: NotificationTypeEnum;
      priority?: NotificationPriorityEnum;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const queryBuilder = this.notificationRepo.createQueryBuilder('n').where('n.user_id = :userId', { userId });

    // Aplicar filtros
    if (filters?.isRead !== undefined) {
      queryBuilder.andWhere('n.is_read = :isRead', { isRead: filters.isRead });
    }

    if (filters?.type) {
      queryBuilder.andWhere('n.type = :type', { type: filters.type });
    }

    if (filters?.priority) {
      queryBuilder.andWhere('n.priority = :priority', { priority: filters.priority });
    }

    // Ordenar por prioridad y fecha
    queryBuilder
      .orderBy(
        `CASE n.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        END`,
        'ASC'
      )
      .addOrderBy('n.created_at', 'DESC');

    // Paginación
    if (filters?.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters?.offset) {
      queryBuilder.offset(filters.offset);
    }

    const [notifications, total] = await queryBuilder.getManyAndCount();

    // Contar no leídas
    const unreadCount = await this.notificationRepo.count({
      where: { userId, isRead: false },
    });

    return { notifications, total, unreadCount };
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepo.update(
      { id: notificationId, userId }, // Verificar ownership
      { isRead: true, readAt: new Date() }
    );

    // Emitir evento de actualización
    await this.notificationGateway.sendToUser(userId, 'notification:updated', {
      notificationId,
      isRead: true,
    });
  }

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // Emitir evento de actualización masiva
    await this.notificationGateway.sendToUser(userId, 'notification:all-read', {});

    return result.affected || 0;
  }

  /**
   * Borrar notificación
   */
  async delete(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepo.delete({ id: notificationId, userId });
  }

  /**
   * Obtener contador de no leídas
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }
}
```

### 4. NotificationGateway (WebSocket)

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string[]>(); // userId -> [socketId1, socketId2, ...]

  /**
   * Cliente se conecta
   */
  handleConnection(client: Socket) {
    const userId = this.getUserIdFromSocket(client);

    if (userId) {
      // Registrar socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)!.push(client.id);

      console.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  /**
   * Cliente se desconecta
   */
  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);

    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      const index = sockets.indexOf(client.id);

      if (index > -1) {
        sockets.splice(index, 1);
      }

      if (sockets.length === 0) {
        this.userSockets.delete(userId);
      }

      console.log(`User ${userId} disconnected socket ${client.id}`);
    }
  }

  /**
   * Enviar notificación a usuario específico
   */
  async sendToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId) || [];

    for (const socketId of sockets) {
      this.server.to(socketId).emit(event, data);
    }
  }

  /**
   * Obtener userId del socket
   */
  private getUserIdFromSocket(client: Socket): string | null {
    // Extraer userId del token JWT en handshake
    try {
      const token = client.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.sub;
    } catch {
      return null;
    }
  }
}
```

### 5. Controller

```typescript
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /**
   * GET /notifications
   * Obtener notificaciones del usuario
   */
  @Get()
  async getNotifications(
    @Req() req,
    @Query('isRead') isRead?: string,
    @Query('type') type?: NotificationTypeEnum,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const filters = {
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      type,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    };

    return await this.notificationService.findAll(req.user.id, filters);
  }

  /**
   * PATCH /notifications/:id/read
   * Marcar notificación como leída
   */
  @Patch(':id/read')
  async markAsRead(@Req() req, @Param('id') id: string) {
    await this.notificationService.markAsRead(id, req.user.id);
    return { success: true };
  }

  /**
   * PATCH /notifications/mark-all-read
   * Marcar todas como leídas
   */
  @Patch('mark-all-read')
  async markAllAsRead(@Req() req) {
    const count = await this.notificationService.markAllAsRead(req.user.id);
    return { success: true, markedCount: count };
  }

  /**
   * GET /notifications/unread-count
   * Obtener contador de no leídas
   */
  @Get('unread-count')
  async getUnreadCount(@Req() req) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  /**
   * DELETE /notifications/:id
   * Borrar notificación
   */
  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    await this.notificationService.delete(id, req.user.id);
    return { success: true };
  }
}
```

---

## 🎨 Implementación Frontend (React)

### 1. Hook: useNotifications

```typescript
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Conectar WebSocket
    const newSocket = io(process.env.REACT_APP_WS_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    newSocket.on('notification:new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Mostrar toast
      showToast(notification);

      // Reproducir sonido
      playNotificationSound(notification.priority);
    });

    newSocket.on('notification:updated', ({ notificationId, isRead }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead } : n))
      );
      if (isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    });

    newSocket.on('notification:all-read', () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    setSocket(newSocket);

    // Cargar notificaciones iniciales
    loadNotifications();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const loadNotifications = async () => {
    const data = await notificationService.getNotifications();
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  };

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    reload: loadNotifications,
  };
};
```

### 2. Component: NotificationBell

```typescript
export const NotificationBell: React.FC = () => {
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b">
            <h3 className="font-bold text-lg">Notificaciones</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hay notificaciones</div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. Component: NotificationItem

```typescript
const NotificationItem: React.FC<{ notification: Notification; onMarkAsRead: (id: string) => void }> = ({
  notification,
  onMarkAsRead,
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Navegar a action_url si existe
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-500';
      case 'high':
        return 'bg-yellow-100 border-yellow-500';
      case 'medium':
        return 'bg-blue-100 border-blue-500';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 ${getPriorityColor(notification.priority)} ${
        !notification.isRead ? 'font-semibold' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold">{notification.title}</h4>
        {!notification.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
      </div>
      <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
      <p className="text-xs text-gray-400 mt-2">{formatDistanceToNow(new Date(notification.createdAt))} ago</p>
    </div>
  );
};
```

---

## 🧪 Testing

### Test Case 1: Crear Notificación

```typescript
test('Creating notification inserts record and emits WebSocket event', async () => {
  const user = await createUser();

  const notification = await notificationService.create(
    user.id,
    NotificationTypeEnum.ACHIEVEMENT_UNLOCKED,
    '¡Achievement Desbloqueado!',
    'Completaste tu primer ejercicio',
    { achievement_id: 'uuid' },
    NotificationPriorityEnum.HIGH
  );

  expect(notification.id).toBeDefined();
  expect(notification.type).toBe('achievement_unlocked');

  // Verificar que WebSocket fue llamado
  expect(notificationGateway.sendToUser).toHaveBeenCalledWith(user.id, 'notification:new', expect.any(Object));
});
```

---

## 📊 Performance

### Índices Críticos

```sql
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
```

### Caching

```typescript
// Redis cache para unread count
async getUnreadCount(userId: string): Promise<number> {
  const cacheKey = `notification:unread:${userId}`;
  const cached = await this.redis.get(cacheKey);

  if (cached) {
    return parseInt(cached);
  }

  const count = await this.notificationRepo.count({
    where: { userId, isRead: false },
  });

  await this.redis.set(cacheKey, count.toString(), 'EX', 60); // 1 min

  return count;
}
```

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |

---

**Documento:** `docs/02-especificaciones-tecnicas/06-notificaciones/ET-NOT-001-tipos-notificaciones.md`
**Propósito:** Especificación técnica completa del sistema de notificaciones
**Audiencia:** Backend Developers, Frontend Developers
