# Estructura y Features - Frontend GAMILIT Platform v2

**Proyecto:** GAMILIT Platform v2
**Fecha:** 2025-10-27
**Arquitectura:** Feature-Sliced Design + Multi-App Architecture

---

## 1. Resumen Ejecutivo

El frontend de GAMILIT Platform v2 implementa una arquitectura **Feature-Sliced Design (FSD)** con una estructura de **3 aplicaciones independientes** (student, teacher, admin) que comparten una base común de features, componentes y servicios.

### Características Principales:

- **Feature-Sliced Design**: Organización modular por features
- **Multi-App**: 3 aplicaciones con UX especializada
- **Type-Safe**: TypeScript estricto en toda la aplicación
- **State Management**: Zustand con persistencia selectiva
- **Build Tool**: Vite para desarrollo rápido
- **Styling**: Tailwind CSS con tema Detective personalizado

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAMILITFRONTEND                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   Student  │  │  Teacher   │  │   Admin    │                │
│  │    App     │  │    App     │  │    App     │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
│        │                │                │                        │
│        └────────────────┼────────────────┘                        │
│                         │                                         │
│  ┌──────────────────────▼──────────────────────┐                │
│  │          Shared Features Layer              │                │
│  │  ┌──────┬─────────┬────────┬──────────┐    │                │
│  │  │ Auth │ Gamif.  │ Mechs  │ Notifs   │    │                │
│  │  └──────┴─────────┴────────┴──────────┘    │                │
│  └──────────────────────────────────────────────┘                │
│                         │                                         │
│  ┌──────────────────────▼──────────────────────┐                │
│  │          Shared Infrastructure              │                │
│  │  ┌─────────┬─────────┬──────────────┐      │                │
│  │  │   API   │  Types  │  Components  │      │                │
│  │  └─────────┴─────────┴──────────────┘      │                │
│  └──────────────────────────────────────────────┘                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Estructura de Directorios

```
gamilit-platform-web/
├── src/
│   ├── apps/                          # 3 aplicaciones independientes
│   │   ├── student/                   # App de estudiantes
│   │   │   ├── pages/                 # Páginas específicas
│   │   │   │   ├── dashboard/
│   │   │   │   ├── learning/
│   │   │   │   ├── achievements/
│   │   │   │   ├── shop/
│   │   │   │   └── social/
│   │   │   ├── components/            # Componentes de app
│   │   │   ├── layouts/               # Layouts de app
│   │   │   ├── hooks/                 # Hooks de app
│   │   │   ├── types/                 # Types de app
│   │   │   └── routes/                # Routing
│   │   │
│   │   ├── teacher/                   # App de profesores
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── monitoring/
│   │   │   │   ├── assignments/
│   │   │   │   ├── analytics/
│   │   │   │   └── interventions/
│   │   │   ├── components/
│   │   │   ├── layouts/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── routes/
│   │   │
│   │   └── admin/                     # App de administradores
│   │       ├── pages/
│   │       │   ├── dashboard/
│   │       │   ├── users/
│   │       │   ├── organizations/
│   │       │   ├── monitoring/
│   │       │   └── content/
│   │       ├── components/
│   │       ├── layouts/
│   │       ├── hooks/
│   │       ├── types/
│   │       └── routes/
│   │
│   ├── features/                      # Features compartidos
│   │   ├── auth/                      # Autenticación
│   │   │   ├── components/
│   │   │   ├── api/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   ├── hooks/
│   │   │   └── providers/
│   │   │
│   │   ├── gamification/              # Sistema de gamificación
│   │   │   ├── economy/               # ML Coins
│   │   │   │   ├── components/
│   │   │   │   ├── store/
│   │   │   │   ├── api/
│   │   │   │   ├── types/
│   │   │   │   └── hooks/
│   │   │   ├── ranks/                 # Rangos Maya
│   │   │   │   ├── components/
│   │   │   │   ├── store/
│   │   │   │   ├── types/
│   │   │   │   └── hooks/
│   │   │   ├── missions/              # Misiones diarias/semanales
│   │   │   ├── social/                # Achievements, Guilds, Friends
│   │   │   │   ├── components/
│   │   │   │   ├── store/
│   │   │   │   ├── types/
│   │   │   │   └── hooks/
│   │   │   └── components/            # Componentes compartidos
│   │   │
│   │   ├── mechanics/                 # 33 mecánicas educativas
│   │   │   ├── module1/               # Comprensión Literal
│   │   │   │   ├── Crucigrama/
│   │   │   │   ├── Timeline/
│   │   │   │   ├── SopaLetras/
│   │   │   │   ├── MapaConceptual/
│   │   │   │   ├── Emparejamiento/
│   │   │   │   ├── VerdaderoFalso/
│   │   │   │   └── CompletarEspacios/
│   │   │   ├── module2/               # Comprensión Inferencial
│   │   │   │   ├── DetectiveTextual/
│   │   │   │   ├── ConstruccionHipotesis/
│   │   │   │   ├── PrediccionNarrativa/
│   │   │   │   ├── PuzzleContexto/
│   │   │   │   └── RuedaInferencias/
│   │   │   ├── module3/               # Comprensión Crítica
│   │   │   │   ├── AnalisisFuentes/
│   │   │   │   ├── DebateDigital/
│   │   │   │   ├── MatrizPerspectivas/
│   │   │   │   ├── PodcastArgumentativo/
│   │   │   │   └── TribunalOpiniones/
│   │   │   ├── module4/               # Textos Digitales
│   │   │   │   ├── VerificadorFakeNews/
│   │   │   │   ├── QuizTikTok/
│   │   │   │   ├── NavegacionHipertextual/
│   │   │   │   ├── AnalisisMemes/
│   │   │   │   ├── InfografiaInteractiva/
│   │   │   │   ├── EmailFormal/
│   │   │   │   ├── ChatLiterario/
│   │   │   │   ├── EnsayoArgumentativo/
│   │   │   │   └── ResenaCritica/
│   │   │   ├── module5/               # Producción Creativa
│   │   │   │   ├── DiarioMultimedia/
│   │   │   │   ├── ComicDigital/
│   │   │   │   └── VideoCarta/
│   │   │   ├── auxiliar/              # Mecánicas auxiliares
│   │   │   └── shared/                # Utilidades compartidas
│   │   │
│   │   ├── notifications/             # Sistema de notificaciones
│   │   │   ├── components/
│   │   │   ├── store/
│   │   │   └── hooks/
│   │   │
│   │   └── education/                 # Contenido educativo
│   │       ├── modules/
│   │       └── exercises/
│   │
│   ├── shared/                        # Código compartido
│   │   ├── components/                # Componentes base
│   │   │   ├── ui/                    # UI primitives
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Input/
│   │   │   │   └── ...
│   │   │   ├── layout/                # Layouts
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Footer/
│   │   │   │   └── Container/
│   │   │   └── mechanics/             # Componentes de mecánicas
│   │   │       ├── BaseExercise/
│   │   │       ├── ProgressBar/
│   │   │       ├── FeedbackModal/
│   │   │       └── ScoreDisplay/
│   │   ├── hooks/                     # Hooks reutilizables
│   │   ├── types/                     # Types compartidos
│   │   ├── utils/                     # Utilidades
│   │   └── constants/                 # Constantes
│   │
│   ├── services/                      # Servicios
│   │   ├── api/                       # API Client
│   │   │   ├── apiClient.ts
│   │   │   ├── apiConfig.ts
│   │   │   ├── apiTypes.ts
│   │   │   └── interceptors.ts
│   │   ├── websocket/                 # WebSocket
│   │   └── analytics/                 # Analytics
│   │
│   ├── App.tsx                        # App principal
│   ├── main.tsx                       # Entry point
│   └── routes.tsx                     # Routing principal
│
├── public/                            # Assets estáticos
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── vite.config.ts                     # Configuración Vite
├── tailwind.config.js                 # Configuración Tailwind
├── tsconfig.json                      # Configuración TypeScript
└── package.json                       # Dependencias
```

---

## 4. Feature-Sliced Design (FSD)

### 4.1 Principios FSD

GAMILIT sigue los principios de Feature-Sliced Design:

1. **Separación por Features**: Cada feature es autocontenido
2. **Layers**: Apps → Features → Shared
3. **Public API**: Cada feature expone su API pública
4. **Dependencias Unidireccionales**: Apps dependen de Features, Features dependen de Shared

### 4.2 Estructura de un Feature

Cada feature sigue esta estructura:

```
feature-name/
├── components/          # Componentes React del feature
├── api/                 # Llamadas API
├── store/               # Estado (Zustand)
├── types/               # TypeScript types
├── hooks/               # Custom hooks
├── utils/               # Utilidades del feature
├── constants/           # Constantes
├── index.ts             # Public API
└── README.md            # Documentación
```

**Ejemplo: Feature Auth**

```typescript
// features/auth/index.ts (Public API)
export { useAuthStore } from './store/authStore';
export { LoginForm, RegisterForm } from './components';
export { useAuth, useSession } from './hooks';
export type { User, LoginCredentials, AuthResponse } from './types/auth.types';
```

### 4.3 Comunicación entre Features

Los features NO se comunican directamente entre sí. La comunicación se realiza a través de:

1. **Shared State**: Zustand stores
2. **Events**: Custom events del navegador
3. **Props**: Componentes padres coordinan

```typescript
// ❌ MAL: Feature A importa directamente de Feature B
import { useEconomyStore } from '@features/gamification/economy/store';

// ✅ BIEN: A través de shared interface
import { useEconomyStore } from '@features/gamification/economy';
```

---

## 5. Apps: Student, Teacher, Admin

### 5.1 Student App

**Objetivo:** Experiencia de aprendizaje gamificada

**Páginas principales:**

- `/dashboard` - Dashboard principal con progreso
- `/learning/:moduleId` - Vista de aprendizaje
- `/exercise/:exerciseId` - Realización de ejercicios
- `/achievements` - Logros y badges
- `/shop` - Tienda de items con ML Coins
- `/leaderboard` - Ranking de estudiantes
- `/guilds` - Sistema de gremios
- `/profile` - Perfil de usuario

**Componentes destacados:**

```typescript
// apps/student/components/dashboard/StatsOverview.tsx
interface StatsOverviewProps {
  xp: number;
  mlCoins: number;
  rank: string;
  streak: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  xp,
  mlCoins,
  rank,
  streak,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard icon="Zap" label="XP" value={xp} />
      <StatCard icon="Coins" label="ML Coins" value={mlCoins} />
      <StatCard icon="Award" label="Rango" value={rank} />
      <StatCard icon="Flame" label="Racha" value={`${streak} días`} />
    </div>
  );
};
```

**Hooks especializados:**

- `useGamificationData()` - Datos de gamificación del usuario
- `useUserModules()` - Módulos del usuario con progreso
- `useExerciseState()` - Estado de ejercicio actual
- `useDashboardData()` - Datos agregados del dashboard
- `useRecentActivities()` - Actividades recientes

### 5.2 Teacher App

**Objetivo:** Monitoreo y gestión de estudiantes

**Páginas principales:**

- `/dashboard` - Dashboard con métricas de clase
- `/monitoring` - Monitoreo en tiempo real
- `/students/:id` - Detalle de estudiante
- `/assignments` - Gestión de tareas
- `/analytics` - Analytics de aprendizaje
- `/interventions` - Alertas y acciones

**Componentes destacados:**

```typescript
// apps/teacher/components/monitoring/StudentMonitor.tsx
interface StudentMonitorProps {
  students: StudentMonitoring[];
  onIntervene: (studentId: string) => void;
}

export const StudentMonitor: React.FC<StudentMonitorProps> = ({
  students,
  onIntervene,
}) => {
  return (
    <div className="space-y-4">
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          status={student.status}
          progress={student.progress_percentage}
          onIntervene={() => onIntervene(student.id)}
        />
      ))}
    </div>
  );
};
```

**Hooks especializados:**

- `useStudentMonitoring()` - Monitoreo de estudiantes
- `useClassroomData()` - Datos de clase
- `useAnalytics()` - Analytics educativos
- `useTeacherDashboard()` - Datos del dashboard
- `useInterventions()` - Alertas y acciones

### 5.3 Admin App

**Objetivo:** Administración del sistema

**Páginas principales:**

- `/dashboard` - Dashboard con métricas del sistema
- `/users` - Gestión de usuarios
- `/organizations` - Gestión de organizaciones
- `/monitoring` - Monitoreo del sistema
- `/content` - Gestión de contenido
- `/settings` - Configuración global

**Componentes destacados:**

```typescript
// apps/admin/components/dashboard/SystemHealth.tsx
interface SystemHealthProps {
  metrics: SystemMetrics;
  health: SystemHealth;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({
  metrics,
  health,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard
        label="CPU Usage"
        value={`${health.cpu}%`}
        status={health.cpu > 80 ? 'critical' : 'healthy'}
      />
      <MetricCard
        label="Memory"
        value={`${health.memory}%`}
        status={health.memory > 80 ? 'critical' : 'healthy'}
      />
      <MetricCard
        label="Active Users"
        value={health.activeUsers}
        status="healthy"
      />
    </div>
  );
};
```

**Hooks especializados:**

- `useSystemMetrics()` - Métricas del sistema
- `useUserManagement()` - Gestión de usuarios
- `useOrganizations()` - Gestión de organizaciones
- `useSystemMonitoring()` - Monitoreo del sistema
- `useContentManagement()` - Gestión de contenido

---

## 6. Features Compartidos

### 6.1 Auth Feature

**Responsabilidad:** Autenticación y autorización

**Componentes:**
- `LoginForm` - Formulario de login
- `RegisterForm` - Formulario de registro
- `PasswordResetForm` - Reset de contraseña
- `ProtectedRoute` - Ruta protegida

**Store:**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}
```

**API Endpoints:**
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`

### 6.2 Gamification Feature

**Responsabilidad:** Sistema completo de gamificación

**Sub-features:**

#### Economy
- ML Coins balance
- Transacciones
- Tienda de items
- Inventario

#### Ranks
- Rangos Maya (5 niveles)
- Progresión de XP
- Sistema de multiplicadores
- Prestigio

#### Missions
- Misiones diarias
- Misiones semanales
- Misiones especiales
- Recompensas

#### Social
- Achievements
- Guilds
- Friends
- Leaderboards
- PowerUps

### 6.3 Mechanics Feature

**Responsabilidad:** 33 mecánicas educativas

**Organización:**

- **Módulo 1 (7 mecánicas):** Comprensión Literal
- **Módulo 2 (5 mecánicas):** Comprensión Inferencial
- **Módulo 3 (5 mecánicas):** Comprensión Crítica
- **Módulo 4 (9 mecánicas):** Textos Digitales
- **Módulo 5 (3 mecánicas):** Producción Creativa
- **Auxiliar (4+ mecánicas):** Soporte

**Componente Base:**

```typescript
// features/mechanics/shared/BaseExercise.tsx
interface BaseExerciseProps {
  exerciseId: string;
  config: ExerciseConfig;
  onComplete: (result: ScoreResult) => void;
  children: React.ReactNode;
}

export const BaseExercise: React.FC<BaseExerciseProps> = ({
  exerciseId,
  config,
  onComplete,
  children,
}) => {
  const [startTime] = useState(Date.now());
  const { submit } = useExerciseSubmission(exerciseId);

  const handleSubmit = async (answers: any) => {
    const timeSpent = Date.now() - startTime;
    const result = await submit({ answers, timeSpent });
    onComplete(result);
  };

  return (
    <div className="exercise-container">
      <ExerciseHeader config={config} />
      {children}
      <ExerciseFooter onSubmit={handleSubmit} />
    </div>
  );
};
```

### 6.4 Notifications Feature

**Responsabilidad:** Sistema de notificaciones en tiempo real

**Componentes:**
- `NotificationCenter` - Centro de notificaciones
- `NotificationItem` - Item individual
- `NotificationBadge` - Badge contador

**Store:**
```typescript
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notif: Notification) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}
```

---

## 7. Shared Layer

### 7.1 Shared Components

**UI Primitives:**
- `Button` - Botones con variantes
- `Card` - Cards con estilos
- `Modal` - Modales
- `Input` - Inputs de formulario
- `Select` - Selects
- `Checkbox` - Checkboxes
- `Badge` - Badges
- `Avatar` - Avatares

**Layout:**
- `Header` - Header principal
- `Sidebar` - Sidebar navegación
- `Footer` - Footer
- `Container` - Container responsive
- `Grid` - Grid system

**Mechanics:**
- `BaseExercise` - Base para ejercicios
- `ProgressBar` - Barra de progreso
- `FeedbackModal` - Modal de feedback
- `ScoreDisplay` - Display de puntaje
- `TimerDisplay` - Display de tiempo

### 7.2 Shared Hooks

```typescript
// shared/hooks/useNavigation.ts
export const useNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const goToDashboard = () => {
    const path = user?.role === 'student' ? '/dashboard'
      : user?.role === 'admin_teacher' ? '/teacher/dashboard'
      : '/admin/dashboard';
    navigate(path);
  };

  return { goToDashboard, navigate };
};
```

```typescript
// shared/hooks/useModules.ts
export const useModules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      const data = await modulesAPI.getAll();
      setModules(data);
      setIsLoading(false);
    };
    fetchModules();
  }, []);

  return { modules, isLoading };
};
```

### 7.3 Shared Types

```typescript
// shared/types/index.ts
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'admin_teacher' | 'super_admin';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  xp_reward: number;
  ml_coins_reward: number;
}

export interface Exercise {
  id: string;
  module_id: string;
  title: string;
  type: ExerciseType;
  config: ExerciseConfig;
  xp_reward: number;
  ml_coins_reward: number;
}
```

---

## 8. Configuración del Proyecto

### 8.1 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@apps': path.resolve(__dirname, './src/apps'),
      '@features': path.resolve(__dirname, './src/features'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
  server: {
    port: 3005,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    },
  },
});
```

### 8.2 TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@apps/*": ["./src/apps/*"],
      "@features/*": ["./src/features/*"],
      "@services/*": ["./src/services/*"]
    }
  }
}
```

### 8.3 Dependencias Principales

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "lucide-react": "^0.294.0",
    "date-fns": "^3.0.0",
    "dompurify": "^3.0.8"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.2"
  }
}
```

---

## 9. Patrones de Diseño

### 9.1 Component Pattern

**Atomic Design Simplificado:**

```
Atoms → Molecules → Organisms → Templates → Pages
```

**Ejemplo:**

```typescript
// Atom: Button
export const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
  <button className="btn" {...props}>{children}</button>
);

// Molecule: StatCard
export const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="stat-card">
    <Icon name={icon} />
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

// Organism: StatsOverview
export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => (
  <div className="stats-grid">
    {stats.map((stat) => <StatCard key={stat.id} {...stat} />)}
  </div>
);

// Template: DashboardLayout
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => (
  <div className="dashboard-layout">
    <Header />
    <Sidebar />
    <main>{children}</main>
    <Footer />
  </div>
);

// Page: DashboardPage
export const DashboardPage: React.FC = () => {
  const stats = useDashboardData();
  return (
    <DashboardLayout>
      <StatsOverview stats={stats} />
    </DashboardLayout>
  );
};
```

### 9.2 Hook Pattern

**Custom Hooks para lógica reutilizable:**

```typescript
// hooks/useAsync.ts
export const useAsync = <T,>(asyncFn: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    asyncFn()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
};
```

### 9.3 Store Pattern

**Zustand stores con acciones:**

```typescript
// features/auth/store/authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await authAPI.login({ email, password });
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' }
  )
);
```

---

## 10. Mejores Prácticas

### 10.1 Organización de Código

1. **Un componente por archivo**
2. **Colocación de archivos relacionados**
3. **Nombres descriptivos**
4. **Exportaciones explícitas**

### 10.2 TypeScript

1. **Tipos explícitos en props**
2. **Interfaces sobre types**
3. **Evitar `any`**
4. **Union types para valores restringidos**

### 10.3 Estado

1. **Zustand para estado global**
2. **useState para estado local**
3. **Persistencia selectiva**
4. **Acciones asíncronas en stores**

### 10.4 Estilos

1. **Tailwind utility-first**
2. **Clases personalizadas para componentes**
3. **Tema consistente**
4. **Responsive design**

---

## 11. Roadmap

### Fase Actual (v2.0)
- ✅ Arquitectura FSD implementada
- ✅ 3 apps funcionando
- ✅ 33 mecánicas implementadas
- ✅ Sistema de gamificación completo
- ✅ Type-safe al 100%

### Próximos Pasos (v2.1)
- 🔄 Optimización de performance
- 🔄 Server-side rendering (SSR)
- 🔄 Progressive Web App (PWA)
- 🔄 Offline mode
- 🔄 Internacionalización (i18n)

### Futuro (v3.0)
- 📋 Micro-frontends
- 📋 Module federation
- 📋 Edge rendering
- 📋 AI-powered features

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Mantenedor:** Equipo GAMILIT
