# Estructura del Proyecto - Frontend GAMILIT Platform v2

**Arquitectura:** Feature-Sliced Design + Multi-App
**Build Tool:** Vite 5.0.8
**Framework:** React 18.2.0

---

## Árbol de Directorios Completo

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

## Feature-Sliced Design (FSD)

### Principios FSD

GAMILIT sigue los principios de Feature-Sliced Design:

1. **Separación por Features**: Cada feature es autocontenido
2. **Layers**: Apps → Features → Shared
3. **Public API**: Cada feature expone su API pública
4. **Dependencias Unidireccionales**: Apps dependen de Features, Features dependen de Shared

### Estructura de un Feature

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

### Comunicación entre Features

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

## Configuración del Proyecto

### Vite Configuration

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

### TypeScript Configuration

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

### Dependencias Principales

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

## Patrones de Diseño

### Component Pattern (Atomic Design Simplificado)

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

### Hook Pattern

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

### Store Pattern

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

## Mejores Prácticas

### Organización de Código

1. **Un componente por archivo**
2. **Colocación de archivos relacionados**
3. **Nombres descriptivos**
4. **Exportaciones explícitas**

### TypeScript

1. **Tipos explícitos en props**
2. **Interfaces sobre types**
3. **Evitar `any`**
4. **Union types para valores restringidos**

### Estado

1. **Zustand para estado global**
2. **useState para estado local**
3. **Persistencia selectiva**
4. **Acciones asíncronas en stores**

### Estilos

1. **Tailwind utility-first**
2. **Clases personalizadas para componentes**
3. **Tema consistente**
4. **Responsive design**

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
