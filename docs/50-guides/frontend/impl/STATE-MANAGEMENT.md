---
titulo: Gestión de Estado Frontend
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# Gestión de Estado Frontend

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/frontend/src/

---

## Resumen

GAMILIT utiliza una estrategia de gestión de estado híbrida:
- **React Query (TanStack Query)**: Estado del servidor (datos de API)
- **Zustand**: Estado del cliente (UI, preferencias)
- **Context API**: Estado muy localizado (themes, modals)

---

## Cuándo Usar Cada Herramienta

| Tipo de Estado | Herramienta | Ejemplos |
|----------------|-------------|----------|
| Datos del servidor | React Query | Usuarios, logros, ejercicios |
| Cache de API | React Query | Respuestas cacheadas |
| UI global | Zustand | Sidebar abierto, tema |
| Autenticación | Zustand | Token, usuario actual |
| Formularios | React Hook Form | Inputs, validación |
| UI local | useState | Modals, toggles locales |

---

## React Query

### Configuración

```typescript
// shared/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // Datos frescos por 5 min
      gcTime: 10 * 60 * 1000,        // Garbage collection a 10 min
      retry: 1,                       // Reintentar 1 vez
      refetchOnWindowFocus: false,   // No refetch al enfocar ventana
    },
  },
});
```

### Query Hook

```typescript
// features/gamification/hooks/useUserStats.ts
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '../services/gamification.service';

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => gamificationService.getMyStats(),
  });
};

// Uso en componente
const StatsDisplay = () => {
  const { data: stats, isLoading, error } = useUserStats();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <span>XP: {stats.totalXp}</span>
      <span>Coins: {stats.mlCoins}</span>
    </div>
  );
};
```

### Query con Parámetros

```typescript
// features/exercises/hooks/useExercise.ts
export const useExercise = (exerciseId: string) => {
  return useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => exercisesService.getById(exerciseId),
    enabled: !!exerciseId, // Solo ejecutar si hay ID
  });
};

// features/gamification/hooks/useLeaderboard.ts
export const useLeaderboard = (filters: LeaderboardFilters) => {
  return useQuery({
    queryKey: ['leaderboard', filters],
    queryFn: () => gamificationService.getLeaderboard(filters),
  });
};
```

### Mutation Hook

```typescript
// features/exercises/hooks/useSubmitAnswer.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { exerciseId: string; answer: any }) =>
      exercisesService.submitAnswer(data.exerciseId, data.answer),

    onSuccess: (result) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },

    onError: (error) => {
      toast.error('Error al enviar respuesta');
    },
  });
};

// Uso
const ExerciseForm = ({ exerciseId }) => {
  const { mutate: submit, isPending } = useSubmitAnswer();

  const handleSubmit = (answer) => {
    submit({ exerciseId, answer });
  };

  return (
    <Button onClick={() => handleSubmit(answer)} disabled={isPending}>
      {isPending ? 'Enviando...' : 'Enviar'}
    </Button>
  );
};
```

### Prefetching

```typescript
// Prefetch al hover sobre un link
const ExerciseListItem = ({ exercise }) => {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['exercise', exercise.id],
      queryFn: () => exercisesService.getById(exercise.id),
    });
  };

  return (
    <Link to={`/exercises/${exercise.id}`} onMouseEnter={handleMouseEnter}>
      {exercise.title}
    </Link>
  );
};
```

---

## Zustand

### Crear Store

```typescript
// features/auth/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage', // Key en localStorage
      partialize: (state) => ({ token: state.token }), // Solo persistir token
    }
  )
);
```

### Usar Store

```typescript
// En componente
const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <div>
      <span>Hola, {user?.name}</span>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};

// Acceso fuera de componente (en services)
const token = useAuthStore.getState().token;
```

### Store de UI

```typescript
// shared/stores/ui.store.ts
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';

  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
```

### Store con Computed Values

```typescript
// features/gamification/stores/gamification.store.ts
interface GamificationState {
  activeBoosts: Boost[];

  // Actions
  addBoost: (boost: Boost) => void;
  removeBoost: (boostId: string) => void;

  // Computed (usando selectors)
}

export const useGamificationStore = create<GamificationState>((set) => ({
  activeBoosts: [],

  addBoost: (boost) =>
    set((state) => ({
      activeBoosts: [...state.activeBoosts, boost],
    })),

  removeBoost: (boostId) =>
    set((state) => ({
      activeBoosts: state.activeBoosts.filter((b) => b.id !== boostId),
    })),
}));

// Selector para computed value
export const selectActiveXpMultiplier = (state: GamificationState) =>
  state.activeBoosts
    .filter((b) => b.type === 'xp_multiplier')
    .reduce((acc, b) => acc * b.value, 1);

// Uso
const xpMultiplier = useGamificationStore(selectActiveXpMultiplier);
```

---

## Patrones Combinados

### React Query + Zustand

```typescript
// Sincronizar usuario de API con store local
const useInitAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: authService.getCurrentUser,
    enabled: !!token,
  });

  useEffect(() => {
    if (user && token) {
      setAuth(token, user);
    }
  }, [user, token, setAuth]);
};
```

### Optimistic Updates

```typescript
const usePurchaseComodin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationService.purchaseComodin,

    // Optimistic update
    onMutate: async (comodinId) => {
      await queryClient.cancelQueries({ queryKey: ['user-stats'] });

      const previousStats = queryClient.getQueryData(['user-stats']);

      // Actualizar optimistamente
      queryClient.setQueryData(['user-stats'], (old: UserStats) => ({
        ...old,
        mlCoins: old.mlCoins - getComodinPrice(comodinId),
      }));

      return { previousStats };
    },

    // Rollback en error
    onError: (err, comodinId, context) => {
      queryClient.setQueryData(['user-stats'], context.previousStats);
    },

    // Refetch para confirmar
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
};
```

---

## Anti-Patrones a Evitar

### 1. Duplicar Estado del Servidor

```typescript
// ❌ MAL: Copiar datos de API a Zustand
const store = create((set) => ({
  users: [],
  fetchUsers: async () => {
    const users = await api.getUsers();
    set({ users });
  },
}));

// ✅ BIEN: Usar React Query
const useUsers = () => useQuery({
  queryKey: ['users'],
  queryFn: api.getUsers,
});
```

### 2. Props Drilling Excesivo

```typescript
// ❌ MAL: Pasar props por 5 niveles
<App user={user}>
  <Layout user={user}>
    <Page user={user}>
      <Section user={user}>
        <Component user={user} />

// ✅ BIEN: Usar store o context
const Component = () => {
  const user = useAuthStore((s) => s.user);
};
```

### 3. Efectos Innecesarios

```typescript
// ❌ MAL: useEffect para derivar estado
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ BIEN: Calcular directamente
const fullName = `${firstName} ${lastName}`;
```

---

## DevTools

### React Query DevTools

```typescript
// main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Zustand DevTools

```typescript
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set) => ({
      // ...state
    }),
    { name: 'MyStore' }
  )
);
```

---

## Buenas Prácticas

1. **Servidor = React Query**: Todo dato de API
2. **Cliente = Zustand**: Solo estado de UI/preferencias
3. **Selectores estrechos**: Solo seleccionar lo necesario
4. **Invalidar vs Refetch**: Preferir invalidateQueries
5. **Keys descriptivas**: `['users', userId, 'posts']`
6. **Persist selectivo**: Solo persistir lo necesario

---

## Ver También

- [API-INTEGRATION.md](./API-INTEGRATION.md) - Integración con API
- [ESTRUCTURA-FEATURES.md](./ESTRUCTURA-FEATURES.md) - Dónde ubicar stores
