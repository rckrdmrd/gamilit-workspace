# Frontend Architecture - GAMILIT Platform

**Version**: 2.0
**Fecha**: Octubre 2025
**Stack**: React 19.2.0 + Vite 7.1.10 + TypeScript 5.9.3

---

## 🔗 Trazabilidad

**Casos de uso relacionados:**
- [UC-STU-002: Onboarding de estudiante](../../01-requerimientos/casos-uso/student/UC-STU-002-onboarding.md) - Interfaz de bienvenida
- [UC-STU-003: Resolver ejercicio](../../01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md) - 33 mecánicas interactivas

**User Stories:**
- [US-FUND-003: Dashboard principal estudiante](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-003-dashboard-principal-estudiante.md) - Vista principal SPA
- [US-FUND-007: Navegación y routing](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-007-navegacion-routing.md) - React Router (60+ rutas)
- [US-FUND-008: UI/UX base](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-008-ui-ux-base.md) - Design system (180+ componentes)
- [US-FUND-002: Perfiles de usuario básicos](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-002-perfiles-usuario-basicos.md) - Interfaz de perfil
- [US-FUND-005: Sistema de sesiones y estado](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-005-sistema-sesiones-estado.md) - Zustand stores

**Épicas:**
- [EAI-001: Fundamentos](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/_MAP.md) - SPA base y componentes
- [EAI-002: Actividades](../../04-planificacion/01-alcance-inicial/EAI-002-actividades/_MAP.md) - 33 mecánicas de ejercicios
- [EAI-003: Gamificación](../../04-planificacion/01-alcance-inicial/EAI-003-gamificacion/_MAP.md) - UI de rangos y rewards
- [EAI-004: Analytics](../../04-planificacion/01-alcance-inicial/EAI-004-analytics/_MAP.md) - Dashboards y gráficas

**Requerimientos funcionales:**
- [Interfaces](../../01-requerimientos/interfaces/) - Diseño UI/UX y componentes
- [Módulos educativos](../../01-requerimientos/modulos/) - Interfaz de ejercicios interactivos
- [Gamificación](../../01-requerimientos/gamificacion/) - Visualización de progreso y rangos

---

## Tabla de Contenidos

1. [Vision General](#vision-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [33 Mecanicas de Ejercicios](#33-mecanicas-de-ejercicios)
4. [State Management con Zustand](#state-management-con-zustand)
5. [Sistema de Componentes](#sistema-de-componentes)
6. [Routing y Navegacion](#routing-y-navegacion)

---

## Vision General

El frontend de GAMILITes una **Single Page Application (SPA)** construida con React 19, usando arquitectura modular con **592 archivos TypeScript**, **33 mecanicas de ejercicios**, y **8 stores Zustand** para state management.

### Metricas Clave

| Metrica | Valor |
|---------|-------|
| **Total archivos** | 592 TypeScript files |
| **Lineas de codigo** | ~85,000 LOC |
| **Componentes** | 180+ React components |
| **Custom Hooks** | 40+ hooks |
| **Stores Zustand** | 8 stores |
| **Mecanicas** | 33 ejercicios |
| **Rutas** | 60+ rutas SPA |

---

## Estructura del Proyecto

```
src/
├── app/                          # App configuration
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── shared/                       # Shared resources
│   ├── components/               # 180+ componentes
│   │   ├── ui/                   # 50+ UI base (Button, Input, Card)
│   │   ├── forms/                # Formularios
│   │   ├── layout/               # Layout (Header, Sidebar, Footer)
│   │   ├── feedback/             # Modals, toasts, alerts
│   │   └── gamification/         # ML Coins, Ranks, Achievements
│   │
│   ├── stores/                   # 8 Zustand stores
│   │   ├── authStore.ts          # Autenticacion
│   │   ├── gamificationStore.ts  # ML Coins, XP, Rank
│   │   ├── progressStore.ts      # Module/Exercise progress
│   │   ├── exerciseStore.ts      # Current exercise state
│   │   ├── notificationStore.ts  # Notifications
│   │   ├── tenantStore.ts        # Multi-tenant
│   │   ├── socialStore.ts        # Classrooms, teams
│   │   └── uiStore.ts            # UI state (sidebar, theme)
│   │
│   ├── services/                 # API clients
│   │   ├── api/
│   │   │   ├── apiClient.ts      # Axios instance
│   │   │   └── interceptors.ts   # Auth, error handling
│   │   ├── auth/                 # Auth service
│   │   ├── gamification/         # Gamification API
│   │   ├── exercise/             # Exercise mechanics
│   │   └── realtime/             # Socket.IO client
│   │
│   ├── hooks/                    # 40+ custom hooks
│   │   ├── useAuth.ts
│   │   ├── useRealtime.ts
│   │   ├── usePermissions.ts
│   │   ├── useExercise.ts
│   │   ├── useGamification.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── auth.ts
│   │   ├── exercise.ts
│   │   ├── gamification.ts
│   │   ├── user.ts
│   │   └── database.types.ts     # Generated from DB
│   │
│   └── utils/
│       ├── constants.ts
│       ├── helpers.ts
│       ├── validation.ts
│       └── permissions.ts
│
├── features/                     # Feature modules
│   ├── student/                  # Student portal
│   │   ├── components/
│   │   │   ├── Dashboard/        # Student dashboard
│   │   │   ├── Exercises/        # Exercise player
│   │   │   ├── Progress/         # Progress tracking
│   │   │   ├── Gamification/     # ML Coins, Ranks
│   │   │   └── Leaderboard/      # Leaderboards
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── teacher/                  # Teacher dashboard
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   ├── ClassManagement/
│   │   │   ├── StudentMonitoring/
│   │   │   ├── ExerciseCreation/
│   │   │   └── Analytics/
│   │   └── ...
│   │
│   └── admin/                    # Admin panel
│       ├── components/
│       │   ├── Dashboard/
│       │   ├── UserManagement/
│       │   ├── TenantManagement/
│       │   └── SystemSettings/
│       └── ...
│
└── pages/                        # Route pages
    ├── student/
    │   ├── StudentDashboard.tsx
    │   ├── ExercisePage.tsx
    │   ├── ProgressPage.tsx
    │   └── LeaderboardPage.tsx
    ├── teacher/
    │   ├── TeacherDashboard.tsx
    │   ├── ClassroomPage.tsx
    │   └── AnalyticsPage.tsx
    ├── admin/
    │   ├── AdminDashboard.tsx
    │   ├── UserManagementPage.tsx
    │   └── TenantManagementPage.tsx
    └── auth/
        ├── LoginPage.tsx
        └── RegisterPage.tsx
```

---

## 33 Mecanicas de Ejercicios

### Framework de Mecanicas

Todas las mecanicas heredan de una clase base abstracta:

```typescript
// ExerciseMechanic.ts (Base Class)
export abstract class ExerciseMechanic {
  abstract type: string;
  abstract validate(answer: any, exercise: Exercise): ValidationResult;
  abstract render(exercise: Exercise, attempt: ExerciseAttempt): React.ReactNode;
  abstract generateHint(exercise: Exercise, attempt: ExerciseAttempt): string;

  protected calculateScore(
    isCorrect: boolean,
    timeSpent: number,
    hints: number
  ): number {
    let score = isCorrect ? 100 : 0;
    const timeBonus = Math.max(0, 30 - Math.floor(timeSpent / 1000));
    score += timeBonus;
    score -= hints * 10;
    return Math.max(0, Math.min(100, score));
  }
}
```

### Registry Pattern

```typescript
export class MechanicRegistry {
  private mechanics = new Map<string, ExerciseMechanic>();

  register(mechanic: ExerciseMechanic) {
    this.mechanics.set(mechanic.type, mechanic);
  }

  get(type: string): ExerciseMechanic | undefined {
    return this.mechanics.get(type);
  }
}

export const mechanicRegistry = new MechanicRegistry();
```

### Listado de 33 Mecanicas

**Modulo 1: Comprension Literal (5)**
1. `crucigrama_cientifico` - Crossword puzzle
2. `linea_tiempo_visual` - Timeline visualization
3. `mapa_conceptual` - Concept mapping
4. `emparejamiento` - Matching pairs
5. `sopa_letras` - Word search

**Modulo 2: Comprension Inferencial (5)**
6. `detective_textual` - Text detective
7. `construccion_hipotesis` - Hypothesis building
8. `prediccion_narrativa` - Narrative prediction
9. `puzzle_contexto` - Context puzzle
10. `rueda_inferencias` - Inference wheel

**Modulo 3: Comprension Critica (5)**
11. `tribunal_opiniones` - Opinion tribunal
12. `debate_digital` - Digital debate
13. `analisis_fuentes` - Source analysis
14. `podcast_argumentativo` - Argumentative podcast
15. `matriz_perspectivas` - Perspectives matrix

**Modulo 4: Lectura Digital (5)**
16. `verificador_fake_news` - Fake news checker
17. `infografia_interactiva` - Interactive infographic
18. `quiz_tiktok` - TikTok-style quiz
19. `navegacion_hipertextual` - Hypertextual navigation
20. `analisis_memes` - Meme analysis

**Modulo 5: Produccion Lectora (3)**
21. `diario_multimedia` - Multimedia diary
22. `comic_digital` - Digital comic
23. `video_carta_futuro` - Video letter to future

**Auxiliares (4)**
24. `comprension_auditiva` - Listening comprehension
25. `collage_digital` - Digital collage
26. `texto_movimiento` - Text in motion
27. `call_to_action` - Call to action

**Adicionales (6)**
28. `multiple_choice` - Multiple choice
29. `true_false` - True/False
30. `fill_in_blank` - Fill in the blank
31. `drag_drop` - Drag and drop
32. `ordering` - Ordering/Sequencing
33. `short_answer` - Short answer

### Ejemplo de Implementacion

```typescript
// MultipleChoiceMechanic.tsx
export class MultipleChoiceMechanic extends ExerciseMechanic {
  type = 'multiple_choice';

  validate(answer: string, exercise: Exercise): ValidationResult {
    const correctAnswer = exercise.data.correctAnswer;
    const isCorrect = answer === correctAnswer;

    return {
      isCorrect,
      score: this.calculateScore(isCorrect, 0, 0),
      feedback: isCorrect
        ? 'Correct! Well done.'
        : `Incorrect. The correct answer is: ${exercise.data.options[correctAnswer]}`
    };
  }

  render(exercise: Exercise, attempt: ExerciseAttempt): React.ReactNode {
    return <MultipleChoiceRenderer exercise={exercise} attempt={attempt} />;
  }

  generateHint(exercise: Exercise, attempt: ExerciseAttempt): string {
    const wrongAnswers = Object.keys(exercise.data.options)
      .filter(key => key !== exercise.data.correctAnswer);
    const eliminateOption = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    return `You can eliminate option ${eliminateOption}`;
  }
}

// Register mechanic
mechanicRegistry.register(new MultipleChoiceMechanic());
```

---

## State Management con Zustand

### 8 Stores Principales

#### 1. authStore.ts

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('glit_token'),
  isAuthenticated: false,

  login: async (credentials) => {
    const { user, token } = await authService.login(credentials);
    localStorage.setItem('glit_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    localStorage.removeItem('glit_token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
```

#### 2. gamificationStore.ts

```typescript
interface GamificationState {
  userStats: UserStats | null;
  mlCoins: number;
  totalXP: number;
  currentLevel: number;
  currentRank: RangoMaya;
  achievements: Achievement[];

  fetchStats: (userId: string) => Promise<void>;
  updateMLCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  unlockAchievement: (achievementId: string) => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  userStats: null,
  mlCoins: 0,
  totalXP: 0,
  currentLevel: 1,
  currentRank: 'nacom',
  achievements: [],

  fetchStats: async (userId) => {
    const stats = await gamificationService.getUserStats(userId);
    set({
      userStats: stats,
      mlCoins: stats.ml_coins,
      totalXP: stats.total_xp,
      currentLevel: stats.level,
      currentRank: stats.current_rank
    });
  },

  updateMLCoins: (amount) => set((state) => ({
    mlCoins: state.mlCoins + amount
  }))
}));
```

#### 3. exerciseStore.ts

```typescript
interface ExerciseState {
  currentExercise: Exercise | null;
  currentAttempt: ExerciseAttempt | null;
  isSubmitting: boolean;

  loadExercise: (exerciseId: string) => Promise<void>;
  startExercise: (exerciseId: string) => Promise<void>;
  submitAnswer: (answer: any) => Promise<SubmissionResult>;
  useHint: () => Promise<string>;
  usePowerup: (powerupType: string) => Promise<void>;
}
```

#### 4. progressStore.ts

```typescript
interface ProgressState {
  moduleProgress: Record<string, ModuleProgress>;
  exerciseProgress: Record<string, ExerciseProgress>;

  fetchModuleProgress: (userId: string) => Promise<void>;
  updateProgress: (data: ProgressUpdate) => void;
}
```

#### 5. notificationStore.ts

```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}
```

#### 6. socialStore.ts

```typescript
interface SocialState {
  classrooms: Classroom[];
  currentClassroom: Classroom | null;
  teams: Team[];

  fetchClassrooms: () => Promise<void>;
  joinClassroom: (inviteCode: string) => Promise<void>;
}
```

#### 7. tenantStore.ts

```typescript
interface TenantState {
  tenant: Tenant | null;
  settings: TenantSettings;

  fetchTenant: () => Promise<void>;
  updateSettings: (settings: Partial<TenantSettings>) => void;
}
```

#### 8. uiStore.ts

```typescript
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'detective';

  toggleSidebar: () => void;
  setTheme: (theme: string) => void;
}
```

---

## Sistema de Componentes

### Componentes Base (shadcn/ui pattern)

```typescript
// Button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8'
      }
    }
  }
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Componentes de Gamificacion

```typescript
// MLCoinBalance.tsx
export const MLCoinBalance = ({ userId }: { userId: string }) => {
  const { mlCoins } = useGamificationStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>ML Coins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <CoinIcon className="w-8 h-8 text-yellow-500" />
          <span className="text-3xl font-bold">{mlCoins}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// RankBadge.tsx
export const RankBadge = ({ rank }: { rank: RangoMaya }) => {
  const rankConfig = {
    nacom: { label: 'Nacom', color: 'gray', icon: 'shield' },
    batab: { label: 'Batab', color: 'blue', icon: 'star' },
    holcatte: { label: 'Holcatte', color: 'purple', icon: 'crown' },
    guerrero: { label: 'Guerrero', color: 'orange', icon: 'sword' },
    mercenario: { label: 'Mercenario', color: 'gold', icon: 'trophy' }
  };

  const config = rankConfig[rank];

  return (
    <Badge variant={config.color}>
      <Icon name={config.icon} />
      {config.label}
    </Badge>
  );
};
```

---

## Routing y Navegacion

### Router Configuration

```typescript
// router.tsx
export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> }
    ]
  },
  {
    path: '/student',
    element: <ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'exercises', element: <ExerciseList /> },
      { path: 'exercises/:id', element: <ExercisePage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> }
    ]
  },
  {
    path: '/teacher',
    element: <ProtectedRoute role="admin_teacher"><TeacherLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <TeacherDashboard /> },
      { path: 'classrooms', element: <ClassroomList /> },
      { path: 'classrooms/:id', element: <ClassroomPage /> },
      { path: 'students/:id', element: <StudentDetail /> },
      { path: 'analytics', element: <AnalyticsPage /> }
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute role="super_admin"><AdminLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'tenants', element: <TenantManagement /> }
    ]
  }
]);
```

### Protected Route

```typescript
// ProtectedRoute.tsx
export const ProtectedRoute = ({ role, children }: {
  role?: string;
  children: React.ReactNode;
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    } else if (role && user?.role !== role) {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, user, role]);

  return isAuthenticated ? <>{children}</> : null;
};
```

---

## Referencias

- [Arquitectura General](./ARQUITECTURA-GENERAL.md)
- [Backend Architecture](./BACKEND-ARCHITECTURE.md)
- [API Reference](../apis/API-REFERENCE.md)
- [Types Mapping](../tipos-compartidos/TYPES-MAPPING.md)

---

**Ultima actualizacion:** Octubre 2025
**Mantenido por:** GAMILIT Platform Team
