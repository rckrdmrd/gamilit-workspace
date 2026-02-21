# Estructura de Código Compartido Frontend

**Versión:** 1.1.0
**Última Actualización:** 2026-02-21
**Aplica a:** apps/frontend/src/shared/

---

## Resumen

La carpeta `shared/` contiene código reutilizable que no pertenece a ninguna feature específica. Incluye componentes UI base, hooks genéricos, utilidades, tipos comunes y configuración.

---

## Estructura de Carpetas

```
shared/
├── components/               # Componentes UI reutilizables
│   ├── base/                 # Componentes base temáticos
│   │   ├── TabBar.tsx        # Tabs unificado (5 variantes, keyboard nav, ARIA)
│   │   ├── DetectiveButton.tsx
│   │   ├── DetectiveCard.tsx
│   │   ├── ColorfulCard.tsx
│   │   ├── EnhancedCard.tsx
│   │   ├── InputDetective.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── RankBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Toast.tsx
│   │   └── index.ts
│   ├── common/               # Componentes comunes reutilizables
│   │   ├── Modal.tsx         # Modal enhanced (animated, overlayClassName, contentClassName, ariaLabelledBy)
│   │   ├── ConfirmDialog.tsx
│   │   ├── DataTable.tsx
│   │   ├── FeatureBadge.tsx
│   │   ├── FormField.tsx
│   │   └── index.ts
│   ├── layout/               # Layout components (Header, Sidebar, Footer, GamifiedHeader)
│   ├── feedback/             # Loading, Error, Empty, Save states
│   │   ├── SaveButton.tsx    # Multi-status save button (idle/saving/saved/error)
│   │   ├── ErrorMessage.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── index.ts
│   ├── loading/              # Loading spinners and skeletons
│   ├── Pagination.tsx        # 2 variantes: 'full' (page numbers, size selector) + 'simple' (prev/next)
│   ├── Modal.tsx             # Legacy modal (simple wrapper)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── index.ts
├── hooks/                    # Custom hooks genéricos
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useDebounce.ts
│   └── index.ts
├── lib/                      # Configuración de librerías
│   ├── axios.ts              # Instancia configurada de axios
│   ├── queryClient.ts        # React Query client
│   └── i18n.ts               # Internacionalización
├── types/                    # Tipos TypeScript compartidos
│   ├── api.types.ts          # Tipos de respuestas API
│   ├── common.types.ts       # Tipos genéricos
│   └── index.ts
├── utils/                    # Funciones utilitarias
│   ├── format.ts             # Formateo de fechas, números
│   ├── validation.ts         # Validadores
│   ├── storage.ts            # LocalStorage helpers
│   └── index.ts
├── constants/                # Constantes globales
│   ├── routes.ts             # Rutas de la aplicación
│   ├── api.ts                # Endpoints base
│   └── index.ts
└── styles/                   # Estilos globales
    ├── globals.css
    └── variables.css
```

---

## Componentes UI Base

### components/ (raíz)

Componentes de uso directo, sin subdirectorio:

```
components/
├── Button.tsx            # Botón con variantes (primary, secondary, outline, ghost, danger)
├── Card.tsx              # Tarjeta base
├── Input.tsx             # Input estilizado
├── Modal.tsx             # Modal legacy (wrapper simple)
├── Pagination.tsx        # Paginación con 2 variantes: 'full' + 'simple'
└── index.ts              # Barrel exports
```

### components/base/ — Componentes temáticos

```
components/base/
├── TabBar.tsx            # 5 variantes: pills, underline, detective-pills, detective-underline, cards
│                         # Keyboard nav (ArrowLeft/Right/Home/End), ARIA compliant
├── StatusBadge.tsx       # Badge de estado multi-propósito
├── DetectiveButton.tsx   # Botón con tema detective
├── DetectiveCard.tsx     # Tarjeta con tema detective
├── ColorfulCard.tsx      # Tarjeta con gradientes
├── EnhancedCard.tsx      # Tarjeta mejorada
├── InputDetective.tsx    # Input con tema detective
├── ProgressBar.tsx       # Barra de progreso
├── RankBadge.tsx         # Badge de rango maya
├── Toast.tsx             # Notificación toast
└── index.ts
```

### components/common/ — Componentes comunes reutilizables

```
components/common/
├── Modal.tsx             # Modal enhanced con framer-motion
│                         # Props: animated, overlayClassName, contentClassName, ariaLabelledBy
│                         # Sizes: sm, md, lg, xl, 2xl, 4xl, 5xl, full
│                         # Focus trap + ESC close + overlay click
├── ConfirmDialog.tsx     # Dialogo de confirmación
├── DataTable.tsx         # Tabla de datos genérica
├── FeatureBadge.tsx      # Badge de feature flag
├── FormField.tsx         # Campo de formulario
└── index.ts
```

### Ejemplo: Button

```typescript
// shared/components/ui/Button/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-dark',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  isLoading,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner className="mr-2" /> : null}
      {children}
    </button>
  );
};
```

---

## Componentes de Layout

### components/layout/

```typescript
// shared/components/layout/MainLayout.tsx
interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};
```

```typescript
// shared/components/layout/Header.tsx
import { useAuth } from '@/features/auth';
import { MlCoinsDisplay, RankBadge } from '@/features/gamification';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b flex items-center px-6 justify-between">
      <Logo />
      <div className="flex items-center gap-4">
        <MlCoinsDisplay />
        <RankBadge />
        <UserMenu user={user} />
      </div>
    </header>
  );
};
```

---

## Componentes de Feedback

### components/feedback/

```
components/feedback/
├── SaveButton.tsx        # Multi-status save button (idle/saving/saved/error)
│                         # Uses framer-motion for status transitions
│                         # Props: status (SaveStatus), onClick, idleLabel, idleIcon
├── ErrorMessage.tsx      # Error display with optional retry
├── EmptyState.tsx        # Empty state with icon, title, description, action
├── ConfirmDialog.tsx     # Confirmation dialog with cancel/confirm
└── index.ts
```

```typescript
// shared/components/feedback/SaveButton.tsx
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveButtonProps {
  status: SaveStatus;
  onClick: () => void;
  idleLabel?: string;    // default: 'Guardar Cambios'
  idleIcon?: ReactNode;
}

// shared/components/feedback/ErrorMessage.tsx
interface ErrorMessageProps {
  error: Error | string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Reintentar
        </Button>
      )}
    </div>
  );
};

// shared/components/feedback/EmptyState.tsx
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
```

---

## Hooks Compartidos

### hooks/

```typescript
// shared/hooks/useLocalStorage.ts
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}

// shared/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// shared/hooks/useMediaQuery.ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

---

## Configuración de Librerías

### lib/axios.ts

```typescript
import axios from 'axios';
import { getAuthToken, clearAuthToken } from '@/features/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - añadir token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### lib/queryClient.ts

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000,   // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

## Utilidades

### utils/format.ts

```typescript
// Formatear fecha
export const formatDate = (date: Date | string, format = 'short'): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { day: '2-digit', month: 'short', year: 'numeric' }
      : { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };

  return d.toLocaleDateString('es-MX', options);
};

// Formatear número con separadores
export const formatNumber = (num: number): string => {
  return num.toLocaleString('es-MX');
};

// Formatear XP
export const formatXp = (xp: number): string => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K XP`;
  }
  return `${xp} XP`;
};
```

### utils/cn.ts (classNames helper)

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Tipos Compartidos

### types/api.types.ts

```typescript
// Respuesta paginada genérica
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Respuesta de error
export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  errors?: Array<{
    field: string;
    messages: string[];
  }>;
}

// Query params de paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

---

## Constantes

### constants/routes.ts

```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EXERCISES: '/exercises',
  EXERCISE: (id: string) => `/exercises/${id}`,
  ACHIEVEMENTS: '/achievements',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  ADMIN: '/admin',
  TEACHER: '/teacher',
} as const;
```

---

## Buenas Prácticas

1. **Componentes genéricos**: Sin lógica de negocio
2. **Props tipadas**: Interfaces claras para cada componente
3. **Variantes con CVA**: Para componentes con múltiples estilos
4. **Hooks puros**: Sin efectos secundarios de negocio
5. **Utils sin estado**: Funciones puras
6. **Barrel exports**: index.ts en cada carpeta

---

## Ver También

- [ESTRUCTURA-FEATURES.md](./ESTRUCTURA-FEATURES.md) - Estructura de features
- [COMPONENTES-UI.md](./COMPONENTES-UI.md) - Guía de componentes UI
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Gestión de estado
