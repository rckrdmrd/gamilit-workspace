---
titulo: Patrones en Frontend (React 19) y Resumen General
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [patrones, gof, react, typescript, frontend, zustand, react-query]
aplica_a: [frontend]
estado: vigente
origen: GUIA-DESIGN-PATTERNS-NESTJS.md
seccion: "Secciones 10, Resumen General"
---

# Patrones en Frontend (React 19) y Resumen General

> **Aplica a:** `apps/frontend/src/` | **Stack:** React 19, TypeScript 5.x, Zustand, React Query, Vite 6.x

---

## 10. Patrones en Frontend (React 19)

Esta seccion cubre brevemente los patrones de diseno aplicados en el frontend de gamilit (`apps/frontend/src/`).

### 10.1 Compound Components

**Categoria:** Estructural

Los Compound Components permiten crear componentes relacionados que comparten estado implicito:

```tsx
// Ejemplo: Componente de Exercise con sub-componentes
// apps/frontend/src/features/exercises/components/
<Exercise moduleId="literal">
  <Exercise.Header />
  <Exercise.Content>
    <Exercise.Question />
    <Exercise.Options />
  </Exercise.Content>
  <Exercise.Footer>
    <Exercise.SubmitButton />
    <Exercise.Timer />
  </Exercise.Footer>
</Exercise>
```

**Implementacion con Context:**

```tsx
const ExerciseContext = createContext<ExerciseState | null>(null);

function Exercise({ children, moduleId }: ExerciseProps) {
  const [state, dispatch] = useReducer(exerciseReducer, initialState);

  return (
    <ExerciseContext.Provider value={{ state, dispatch, moduleId }}>
      <div className="exercise-container">{children}</div>
    </ExerciseContext.Provider>
  );
}

// Sub-componentes acceden al contexto compartido
Exercise.Header = function ExerciseHeader() {
  const { state } = useContext(ExerciseContext);
  return <h2>{state.currentExercise.title}</h2>;
};
```

### 10.2 Custom Hooks como Strategy Pattern

Los custom hooks de gamilit (132 hooks) implementan el patron Strategy para logica reutilizable:

```tsx
// Hook como estrategia de autenticacion
function useAuth() {
  const { user, login, logout } = useContext(AuthContext);
  return { user, login, logout, isAuthenticated: !!user };
}

// Hook como estrategia de gamificacion
function useXP() {
  const { data: xpData } = useQuery(['user-xp'], fetchUserXP);
  return { xp: xpData?.xp, rank: xpData?.rank, nextRankXP: xpData?.nextRankXP };
}

// Hook como estrategia de ejercicios (cambia segun tipo)
function useExerciseLogic(exerciseType: ExerciseType) {
  // Selecciona la estrategia segun el tipo de ejercicio
  switch (exerciseType) {
    case 'multiple-choice': return useMultipleChoiceLogic();
    case 'drag-and-drop': return useDragAndDropLogic();
    case 'fill-in-blank': return useFillInBlankLogic();
    // ... 23 tipos de ejercicio
  }
}
```

### 10.3 Zustand Slices como State Pattern

gamilit usa 13 stores Zustand para estado de cliente. Las slices representan el patron State:

```tsx
// Store con slices — patron State
import { create } from 'zustand';

interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
}

interface GamificationSlice {
  xp: number;
  rank: string;
  achievements: Achievement[];
  addXP: (amount: number) => void;
}

// Cada slice gestiona su propio estado
const useAppStore = create<AuthSlice & GamificationSlice>((set, get) => ({
  // Auth slice
  user: null,
  isAuthenticated: false,
  login: async (credentials) => { /* ... */ },
  logout: () => set({ user: null, isAuthenticated: false }),

  // Gamification slice
  xp: 0,
  rank: 'Estudiante',
  achievements: [],
  addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
}));
```

### 10.4 React Query como Cache-Aside Pattern

React Query implementa Cache-Aside (Lazy Loading) para datos del servidor:

```tsx
// Cache-Aside: Primero busca en cache, si no existe va al servidor
// Nota: useStudentProgress fue removido (Teacher Portal Audit 2026-02-20).
// Este ejemplo ilustra el patron Cache-Aside con nombre generico.
function useStudentProgress(studentId: string) {
  return useQuery({
    queryKey: ['student-progress', studentId],
    queryFn: () => progressAPI.getStudentProgress(studentId),
    staleTime: 5 * 60 * 1000,    // 5 minutos antes de considerar stale
    cacheTime: 30 * 60 * 1000,   // 30 minutos en cache
    refetchOnWindowFocus: true,   // Refrescar al volver a la ventana
  });
}

// Mutacion con invalidacion de cache
function useCompleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CompleteExerciseDto) => exerciseAPI.complete(dto),
    onSuccess: (data, variables) => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-xp'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
```

### Resumen de Patrones Frontend

| Patron | Implementacion en gamilit | Cantidad |
|--------|--------------------------|----------|
| Compound Components | Ejercicios, Dashboard, Formularios | ~15 conjuntos |
| Custom Hooks (Strategy) | Hooks de feature, auth, gamificacion | 132 hooks |
| Zustand (State) | Auth, UI, gamificacion, preferencias | 13 stores |
| React Query (Cache-Aside) | Todos los datos del servidor | 65 API files, ~575 calls |
| Provider Pattern | AuthContext, ThemeProvider | 4 providers |

---

## Resumen General

### Matriz de Patrones por Capa

| Patron | Domain | Application | Infrastructure | Frontend |
|--------|--------|-------------|---------------|----------|
| Factory | - | useFactory, DynamicModule | Datasource factories | - |
| Strategy | - | Guards (15) | Passport Strategies | Custom Hooks |
| Adapter | - | - | TypeORM Repos, RedisIoAdapter | - |
| Decorator | - | @Roles, @CurrentUser | @Controller, @Entity | - |
| Observer | Domain Events | EventEmitter2 | @OnEvent listeners | - |
| Builder | - | QueryBuilder | - | - |
| Singleton | - | @Injectable (default) | - | Zustand stores |
| Template Method | - | Base Services | TransformerBase | - |
| Repository | Interfaces | - | TypeORM implementation | - |

### Checklist de Patrones

- [ ] Factories usadas para configuracion con dependencias (no hardcoded)
- [ ] Guards implementan `CanActivate` con responsabilidad unica
- [ ] Adaptadores secundarios implementan interfaces de dominio
- [ ] Decoradores custom son composables y reutilizables
- [ ] Eventos de dominio usados para desacoplar modulos
- [ ] QueryBuilder usado para consultas con >3 filtros opcionales
- [ ] Singleton como scope default; REQUEST/TRANSIENT solo cuando necesario
- [ ] Base services con hooks para codigo DRY
- [ ] Repositories abstraen persistencia detras de interfaces
- [ ] Frontend usa React Query para server state, Zustand para client state
