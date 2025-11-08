# Stores de UI y Notificaciones - GAMILIT Platform v2

**Dominio:** Interfaz de usuario y comunicaciones
**Total de Stores:** 2
**Persistencia:** Ninguno

---

## 1. notificationsStore

**Ubicación:** `/src/features/notifications/store/notificationsStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- Notificaciones del usuario
- Contador de no leídas
- Marcado como leído
- Limpieza de notificaciones
- Integración con WebSocket

### State Shape

```typescript
interface NotificationsState {
  // State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  deleteNotification: (notificationId: string) => void;
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

type NotificationType =
  | 'achievement_unlocked'
  | 'mission_completed'
  | 'rank_up'
  | 'friend_request'
  | 'guild_invitation'
  | 'exercise_graded'
  | 'system'
  | 'info';
```

### Implementación

```typescript
export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });

    try {
      const notifications = await notificationsAPI.getAll();
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      set({
        notifications,
        unreadCount,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    // Actualizar en backend
    notificationsAPI.markAsRead(notificationId);
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));

    // Actualizar en backend
    notificationsAPI.markAllAsRead();
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });

    notificationsAPI.clearAll();
  },

  deleteNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      const wasUnread = notification && !notification.isRead;

      return {
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });

    notificationsAPI.delete(notificationId);
  },
}));
```

### Integración con WebSocket

```typescript
// features/notifications/hooks/useNotificationWebSocket.ts
export const useNotificationWebSocket = () => {
  const addNotification = useNotificationsStore((state) => state.addNotification);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`${WS_URL}/notifications?userId=${user.id}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data);
      addNotification(notification);

      // Mostrar toast
      toast.info(notification.message, {
        onClick: () => {
          if (notification.link) {
            navigate(notification.link);
          }
        },
      });

      // Reproducir sonido (opcional)
      playNotificationSound();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [user, addNotification]);
};
```

### Componente de Centro de Notificaciones

```typescript
// features/notifications/components/NotificationCenter.tsx
export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  } = useNotificationsStore();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="notification-bell">
        <Bell />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="notification-center">
          <div className="header">
            <h2>Notificaciones</h2>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}>Marcar todas como leídas</button>
            )}
          </div>

          <div className="notifications-list">
            {isLoading ? (
              <LoadingSpinner />
            ) : notifications.length === 0 ? (
              <EmptyState message="No tienes notificaciones" />
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
```

### NotificationItem Component

```typescript
// features/notifications/components/NotificationItem.tsx
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead();
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'achievement_unlocked':
        return <Award className="text-yellow-500" />;
      case 'rank_up':
        return <TrendingUp className="text-green-500" />;
      case 'mission_completed':
        return <CheckCircle className="text-blue-500" />;
      case 'friend_request':
        return <Users className="text-purple-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  return (
    <div
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onClick={handleClick}
    >
      <div className="icon">{getIcon()}</div>

      <div className="content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <span className="timestamp">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: es,
          })}
        </span>
      </div>

      <div className="actions">
        {!notification.isRead && (
          <button onClick={(e) => { e.stopPropagation(); onMarkAsRead(); }}>
            <Check />
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 />
        </button>
      </div>
    </div>
  );
};
```

---

## 2. uiStore

**Ubicación:** `/src/shared/store/uiStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- Estado de UI global
- Modales abiertos
- Sidebar colapsado
- Tema (light/dark)
- Loading states globales
- Toasts y mensajes

### State Shape

```typescript
interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;

  // Modales
  openModals: string[];
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  isModalOpen: (modalId: string) => boolean;

  // Tema
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;

  // Loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (toastId: string) => void;

  // Breadcrumbs
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface Breadcrumb {
  label: string;
  path?: string;
}
```

### Implementación

```typescript
export const useUIStore = create<UIState>()((set, get) => ({
  // Sidebar
  isSidebarOpen: true,

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  closeSidebar: () => {
    set({ isSidebarOpen: false });
  },

  openSidebar: () => {
    set({ isSidebarOpen: true });
  },

  // Modales
  openModals: [],

  openModal: (modalId) => {
    set((state) => ({
      openModals: [...state.openModals, modalId],
    }));
  },

  closeModal: (modalId) => {
    set((state) => ({
      openModals: state.openModals.filter((id) => id !== modalId),
    }));
  },

  isModalOpen: (modalId) => {
    return get().openModals.includes(modalId);
  },

  // Tema
  theme: 'auto',

  setTheme: (theme) => {
    set({ theme });

    // Aplicar tema al DOM
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Guardar en localStorage
    localStorage.setItem('theme', theme);
  },

  // Loading
  globalLoading: false,

  setGlobalLoading: (loading) => {
    set({ globalLoading: loading });
  },

  // Toasts
  toasts: [],

  addToast: (toast) => {
    const id = crypto.randomUUID();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 3000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove después de duration
    setTimeout(() => {
      get().removeToast(id);
    }, newToast.duration);
  },

  removeToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== toastId),
    }));
  },

  // Breadcrumbs
  breadcrumbs: [],

  setBreadcrumbs: (breadcrumbs) => {
    set({ breadcrumbs });
  },
}));
```

### Hook para gestión de tema

```typescript
// shared/hooks/useTheme.ts
export const useTheme = () => {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto';
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Listener para cambios de preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        setTheme('auto'); // Re-aplicar para actualizar
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]);

  return { theme, setTheme };
};
```

### Componente de Toasts

```typescript
// shared/components/ToastContainer.tsx
export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({
  toast,
  onClose,
}) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="text-green-500" />;
      case 'error':
        return <XCircle className="text-red-500" />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" />;
      case 'info':
        return <Info className="text-blue-500" />;
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{toast.message}</div>
      <button onClick={onClose} className="toast-close">
        <X />
      </button>
    </div>
  );
};
```

### Helper para toasts

```typescript
// shared/utils/toast.ts
import { useUIStore } from '@shared/store/uiStore';

export const toast = {
  success: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: 'success', message, duration });
  },

  error: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: 'error', message, duration });
  },

  warning: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: 'warning', message, duration });
  },

  info: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: 'info', message, duration });
  },
};
```

---

## Uso en la Aplicación

### App Setup

```typescript
// App.tsx
export const App: React.FC = () => {
  useTheme(); // Inicializar tema
  useNotificationWebSocket(); // Conectar WebSocket

  return (
    <>
      <ToastContainer />
      <NotificationCenter />
      <Router />
    </>
  );
};
```

### Ejemplo de uso en componentes

```typescript
// Componente con toasts y notificaciones
const ExampleComponent = () => {
  const { addToast } = useUIStore();

  const handleSuccess = () => {
    toast.success('Operación exitosa!');
  };

  const handleError = () => {
    toast.error('Ocurrió un error');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Éxito</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
};
```

---

## DevTools y Debugging

### Habilitación de DevTools

```typescript
import { devtools } from 'zustand/middleware';

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set, get) => ({
      // ... store implementation
    }),
    { name: 'NotificationsStore' }
  )
);
```

### Subscripciones para Debugging

```typescript
// Suscribirse a cambios de notificaciones
useEffect(() => {
  const unsubscribe = useNotificationsStore.subscribe(
    (state) => state.unreadCount,
    (unreadCount) => {
      console.log('Unread count changed:', unreadCount);
    }
  );

  return unsubscribe;
}, []);
```

---

## Diagrama de Flujo

```
┌──────────────────────────────────────────────────────────┐
│                  USER ACTION                              │
│  (button click, form submit, etc.)                        │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│              COMPONENT CALLS STORE ACTION                 │
│  const addToast = useUIStore(state => state.addToast)    │
│  addToast({ type: 'success', message: 'Done!' })         │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│                   STORE ACTION                            │
│  1. set({ toasts: [...toasts, newToast] })               │
│  2. setTimeout to auto-remove                            │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│              STATE UPDATE TRIGGERS RE-RENDER              │
│  ToastContainer re-renders with new toast                │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│                   UI UPDATES                              │
│  Toast appears on screen                                 │
└──────────────────────────────────────────────────────────┘
```

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
