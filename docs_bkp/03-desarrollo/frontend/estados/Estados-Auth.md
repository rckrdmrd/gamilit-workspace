# Stores de Autenticación - GAMILIT Platform v2

**Dominio:** Gestión de usuarios y sesiones
**Total de Stores:** 3 (1 persistente)

---

## 1. authStore (PERSISTENT)

**Ubicación:** `/src/features/auth/store/authStore.ts`
**Persistencia:** ✅ Sí (localStorage)
**Campos Persistidos:** user, token, refreshToken, isAuthenticated, sessionExpiresAt

### Responsabilidad

- Autenticación de usuarios
- Gestión de sesiones
- Refresh de tokens
- Permisos y roles

### State Shape

```typescript
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiresAt: number | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  checkSession: () => boolean;
  clearError: () => void;
}
```

### Implementación Completa

```typescript
// features/auth/store/authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpiresAt: null,

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            sessionExpiresAt: expiresAt,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
        }
      },

      // Register
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            sessionExpiresAt: expiresAt,
            isLoading: false,
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          sessionExpiresAt: null,
        });
      },

      // Refresh Session
      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          const response = await authAPI.refresh({ refreshToken });
          const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

          set({
            token: response.token,
            sessionExpiresAt: expiresAt,
          });
        } catch (error) {
          get().logout();
        }
      },

      // Update User
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      // Check Session
      checkSession: () => {
        const { sessionExpiresAt } = get();
        if (!sessionExpiresAt) return false;

        const isValid = Date.now() < sessionExpiresAt;
        if (!isValid) {
          get().logout();
        }
        return isValid;
      },

      // Clear Error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
    }
  )
);
```

### Uso en Componentes

```typescript
// Leer estado
const { user, isAuthenticated } = useAuthStore();

// Ejecutar acciones
const login = useAuthStore((state) => state.login);
const logout = useAuthStore((state) => state.logout);

// En un componente
const LoginComponent = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <div className="error">{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
};
```

### Configuración de Persistencia

```typescript
{
  name: 'auth-storage', // Clave en localStorage
  version: 1, // Versión para migraciones
  partialize: (state) => ({
    // Solo persistir estos campos
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
  }),
  // Opcional: Migración de versiones
  migrate: (persistedState, version) => {
    if (version === 0) {
      // Migrar de v0 a v1
      return { ...persistedState, newField: defaultValue };
    }
    return persistedState as AuthState;
  },
}
```

---

## 2. userStore

**Ubicación:** `/src/features/auth/store/userStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- Perfil de usuario extendido
- Preferencias
- Configuración personal
- Avatar y personalización

### State Shape

```typescript
interface UserState {
  // State
  profile: UserProfile | null;
  preferences: UserPreferences;
  stats: UserStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

interface UserProfile {
  id: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  grade?: string;
  school?: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
  };
}

interface UserStats {
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalTimeSpent: number; // minutos
  lastActive: Date;
}
```

### Implementación

```typescript
export const useUserStore = create<UserState>()((set, get) => ({
  profile: null,
  preferences: {
    theme: 'auto',
    language: 'es',
    notifications: {
      email: true,
      push: true,
      inApp: true,
    },
    privacy: {
      showProfile: true,
      showActivity: true,
    },
  },
  stats: {
    totalExercises: 0,
    completedExercises: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    lastActive: new Date(),
  },
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await userAPI.getProfile();
      const stats = await userAPI.getStats();
      set({ profile, stats, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true });
    try {
      const updatedProfile = await userAPI.updateProfile(updates);
      set({ profile: updatedProfile, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  updatePreferences: async (preferences) => {
    const current = get().preferences;
    set({ preferences: { ...current, ...preferences } });

    try {
      await userAPI.updatePreferences(preferences);
    } catch (error) {
      // Revertir en caso de error
      set({ preferences: current, error: error.message });
    }
  },

  uploadAvatar: async (file) => {
    set({ isLoading: true });
    try {
      const avatarUrl = await userAPI.uploadAvatar(file);
      set((state) => ({
        profile: state.profile ? { ...state.profile, avatar: avatarUrl } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

---

## 3. sessionStore

**Ubicación:** `/src/features/auth/store/sessionStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- Gestión de timeout de sesión
- Actividad del usuario
- Auto-logout por inactividad
- Warnings de expiración

### State Shape

```typescript
interface SessionState {
  // State
  lastActivity: number;
  sessionTimeout: number; // minutos
  warningTimeout: number; // minutos antes del timeout para mostrar warning
  showTimeoutWarning: boolean;
  isActive: boolean;

  // Actions
  updateActivity: () => void;
  resetSession: () => void;
  extendSession: () => void;
  startSessionMonitoring: () => void;
  stopSessionMonitoring: () => void;
}
```

### Implementación

```typescript
export const useSessionStore = create<SessionState>()((set, get) => ({
  lastActivity: Date.now(),
  sessionTimeout: 30, // 30 minutos
  warningTimeout: 5, // Advertir 5 minutos antes
  showTimeoutWarning: false,
  isActive: true,

  updateActivity: () => {
    set({
      lastActivity: Date.now(),
      showTimeoutWarning: false,
      isActive: true,
    });
  },

  resetSession: () => {
    set({
      lastActivity: Date.now(),
      showTimeoutWarning: false,
      isActive: true,
    });
  },

  extendSession: () => {
    set({
      lastActivity: Date.now(),
      showTimeoutWarning: false,
    });

    // Refresh token
    useAuthStore.getState().refreshSession();
  },

  startSessionMonitoring: () => {
    const interval = setInterval(() => {
      const { lastActivity, sessionTimeout, warningTimeout } = get();
      const now = Date.now();
      const inactiveMinutes = (now - lastActivity) / (1000 * 60);

      // Mostrar warning
      if (inactiveMinutes >= sessionTimeout - warningTimeout) {
        set({ showTimeoutWarning: true, isActive: false });
      }

      // Logout por timeout
      if (inactiveMinutes >= sessionTimeout) {
        useAuthStore.getState().logout();
        get().stopSessionMonitoring();
      }
    }, 60000); // Revisar cada minuto

    // Guardar interval ID para poder limpiarlo
    (window as any).__sessionMonitorInterval = interval;
  },

  stopSessionMonitoring: () => {
    const interval = (window as any).__sessionMonitorInterval;
    if (interval) {
      clearInterval(interval);
    }
  },
}));
```

### Hook de Monitoreo de Actividad

```typescript
// features/auth/hooks/useActivityMonitor.ts
export const useActivityMonitor = () => {
  const updateActivity = useSessionStore((state) => state.updateActivity);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      updateActivity();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [updateActivity]);
};
```

### Componente de Warning de Timeout

```typescript
// features/auth/components/SessionTimeoutWarning.tsx
export const SessionTimeoutWarning: React.FC = () => {
  const showWarning = useSessionStore((state) => state.showTimeoutWarning);
  const extendSession = useSessionStore((state) => state.extendSession);
  const logout = useAuthStore((state) => state.logout);

  if (!showWarning) return null;

  return (
    <Modal isOpen onClose={extendSession}>
      <div className="timeout-warning">
        <h2>Tu sesión está por expirar</h2>
        <p>Por inactividad, tu sesión se cerrará en 5 minutos.</p>
        <div className="actions">
          <button onClick={extendSession}>Continuar Sesión</button>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      </div>
    </Modal>
  );
};
```

---

## Integración y Uso Conjunto

### App con todos los stores de Auth

```typescript
// App.tsx
export const App: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkSession = useAuthStore((state) => state.checkSession);
  const startMonitoring = useSessionStore((state) => state.startSessionMonitoring);

  useActivityMonitor(); // Hook para monitorear actividad

  useEffect(() => {
    // Verificar sesión al cargar
    if (isAuthenticated) {
      checkSession();
      startMonitoring();
    }
  }, [isAuthenticated]);

  return (
    <>
      <SessionTimeoutWarning />
      {isAuthenticated ? <AuthenticatedApp /> : <PublicApp />}
    </>
  );
};
```

---

## Testing

```typescript
// features/auth/store/__tests__/authStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store
    useAuthStore.getState().logout();
  });

  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });

  it('should handle login error', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('invalid@example.com', 'wrong');
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeDefined();
  });

  it('should logout and clear state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
