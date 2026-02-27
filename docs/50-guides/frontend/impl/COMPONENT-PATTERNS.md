---
titulo: Patrones de Componentes
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# Patrones de Componentes - Frontend GAMILIT

**Fecha de creacion:** 2025-11-29
**Version:** 1.0
**Estado:** VIGENTE
**Contexto:** Estandarizacion de 180+ componentes React

---

## 1. Principios Fundamentales

### 1.1 Filosofia de Componentes
- **Componentes pequenos y enfocados**: Una responsabilidad por componente
- **Composicion sobre herencia**: Componer componentes simples
- **Props explicitas**: Siempre tipar props con interfaces
- **Colocacion**: Mantener archivos relacionados juntos

### 1.2 Regla de Oro
> Si un componente supera las 150 lineas, probablemente debe dividirse.

---

## 2. Anatomia de un Componente Estandar

### 2.1 Estructura de Archivo
```typescript
/**
 * ComponentName
 * @description Breve descripcion del componente
 * @see Backend: [ruta si aplica]
 */

// 1. Imports externos
import { useState, useCallback, memo } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Imports internos (types, utils, hooks)
import type { ComponentProps } from './ComponentName.types';
import { formatDate } from '@shared/utils';
import { useAuth } from '@features/auth/hooks';

// 3. Imports de componentes
import { Button, Card } from '@shared/components/ui';
import { LoadingSpinner } from '@shared/components/loading';

// 4. Constantes locales (si son pocas)
const DEFAULT_PAGE_SIZE = 10;

// 5. Componente principal
export const ComponentName = memo(function ComponentName({
  prop1,
  prop2,
  onAction,
}: ComponentProps) {
  // 5.1 Hooks (siempre al inicio)
  const { user } = useAuth();
  const [state, setState] = useState<string>('');

  // 5.2 Queries/Mutations
  const { data, isLoading } = useQuery({...});

  // 5.3 Handlers (useCallback para optimizar)
  const handleClick = useCallback(() => {
    onAction?.(state);
  }, [state, onAction]);

  // 5.4 Early returns (loading, error, empty)
  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;

  // 5.5 Render principal
  return (
    <Card>
      <h2>{prop1}</h2>
      <Button onClick={handleClick}>
        {prop2}
      </Button>
    </Card>
  );
});

// 6. Display name (para debugging)
ComponentName.displayName = 'ComponentName';
```

### 2.2 Archivo de Types
```typescript
// ComponentName.types.ts

export interface ComponentProps {
  /** Descripcion de prop1 */
  prop1: string;
  /** Descripcion de prop2 */
  prop2: string;
  /** Callback cuando se ejecuta accion */
  onAction?: (value: string) => void;
  /** Clases CSS adicionales */
  className?: string;
  /** Contenido hijo */
  children?: React.ReactNode;
}

export interface ComponentState {
  isOpen: boolean;
  selectedId: string | null;
}
```

---

## 3. Estructura de Carpetas por Feature

### 3.1 Componente Simple (1 archivo)
```
features/auth/components/
└── LoginButton.tsx
```

### 3.2 Componente Complejo (carpeta)
```
features/auth/components/LoginForm/
├── index.ts              # Re-export
├── LoginForm.tsx         # Componente principal
├── LoginForm.types.ts    # Types e interfaces
├── LoginForm.styles.ts   # Styled components (si aplica)
├── LoginForm.test.tsx    # Tests
└── useLoginForm.ts       # Hook especifico (si aplica)
```

### 3.3 index.ts (Barrel Export)
```typescript
// features/auth/components/LoginForm/index.ts
export { LoginForm } from './LoginForm';
export type { LoginFormProps } from './LoginForm.types';
```

---

## 4. Props Patterns

### 4.1 Props Basicas
```typescript
interface ButtonProps {
  // Requeridas
  label: string;
  onClick: () => void;

  // Opcionales con defaults
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;

  // Children
  children?: React.ReactNode;

  // ClassName para extension
  className?: string;
}

// Uso con defaults
export const Button = ({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
}: ButtonProps) => { ... };
```

### 4.2 Props Compuestas
```typescript
// Extender props de elemento HTML
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// Uso
export const Input = ({ label, error, ...inputProps }: InputProps) => (
  <div>
    <label>{label}</label>
    <input {...inputProps} />
    {error && <span className="error">{error}</span>}
  </div>
);
```

### 4.3 Render Props
```typescript
interface DataListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

export function DataList<T>({
  data,
  renderItem,
  renderEmpty,
}: DataListProps<T>) {
  if (data.length === 0 && renderEmpty) {
    return <>{renderEmpty()}</>;
  }
  return <ul>{data.map(renderItem)}</ul>;
}
```

---

## 5. Composicion de Componentes

### 5.1 Compound Components
```typescript
// Card.tsx
interface CardProps {
  children: React.ReactNode;
}

interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export const Card = ({ children }: CardProps) => (
  <div className="card">{children}</div>
);

Card.Header = ({ title, action }: CardHeaderProps) => (
  <div className="card-header">
    <h3>{title}</h3>
    {action}
  </div>
);

Card.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="card-body">{children}</div>
);

Card.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="card-footer">{children}</div>
);

// Uso
<Card>
  <Card.Header title="Titulo" action={<Button>Accion</Button>} />
  <Card.Body>Contenido</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

### 5.2 HOCs (Higher Order Components)
```typescript
// withAuth.tsx
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...props} />;
  };
}

// Uso
export const ProtectedPage = withAuth(DashboardPage);
```

---

## 6. Performance Patterns

### 6.1 memo para Componentes Puros
```typescript
import { memo } from 'react';

// Usar memo cuando:
// - Props no cambian frecuentemente
// - Componente es costoso de renderizar
// - Lista de items grandes

export const UserCard = memo(function UserCard({ user }: UserCardProps) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});
```

### 6.2 useMemo para Calculos Costosos
```typescript
import { useMemo } from 'react';

export const Dashboard = ({ data }: DashboardProps) => {
  // Calcular solo cuando data cambia
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveCalculation(item),
    }));
  }, [data]);

  return <Chart data={processedData} />;
};
```

### 6.3 useCallback para Handlers Estables
```typescript
import { useCallback } from 'react';

export const Form = ({ onSubmit }: FormProps) => {
  const [value, setValue] = useState('');

  // Estable, no se recrea en cada render
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  }, [value, onSubmit]);

  return <form onSubmit={handleSubmit}>...</form>;
};
```

### 6.4 Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

// Cargar componente pesado solo cuando se necesita
const HeavyChart = lazy(() => import('./HeavyChart'));

export const Dashboard = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <HeavyChart />
  </Suspense>
);
```

---

## 7. Error Handling

### 7.1 Error Boundary
```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Enviar a servicio de monitoreo
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback />;
    }
    return this.props.children;
  }
}

// Uso
<ErrorBoundary fallback={<ErrorPage />}>
  <RiskyComponent />
</ErrorBoundary>
```

### 7.2 Manejo de Estados Async
```typescript
export const UserProfile = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  // Estado de carga
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Estado de error
  if (isError) {
    return <ErrorMessage error={error} />;
  }

  // Estado vacio
  if (!data) {
    return <EmptyState message="Usuario no encontrado" />;
  }

  // Render con datos
  return <ProfileCard user={data} />;
};
```

---

## 8. Patrones de Estado

### 8.1 Estado Local vs Global
| Tipo de Estado | Donde Guardarlo |
|----------------|-----------------|
| UI temporal (modals, dropdowns) | useState local |
| Datos del formulario | useState o react-hook-form |
| Datos del servidor | React Query |
| Estado compartido entre features | Zustand store |
| Estado de autenticacion | AuthStore (Zustand) |

### 8.2 Elevacion de Estado
```typescript
// Estado elevado al padre cuando multiples hijos lo necesitan
const Parent = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <List onSelect={setSelectedId} />
      <Detail selectedId={selectedId} />
    </>
  );
};
```

---

## 9. Testing de Componentes

### 9.1 Estructura de Test
```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Setup comun
  const defaultProps = {
    prop1: 'test',
    onAction: vi.fn(),
  };

  it('renders correctly', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('calls onAction when clicked', async () => {
    render(<ComponentName {...defaultProps} />);
    await fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onAction).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<ComponentName {...defaultProps} isLoading />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### 9.2 Testing de Hooks
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('increments correctly', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

---

## 10. Anti-patrones a Evitar

### 10.1 NO: Props Drilling Profundo
```typescript
// MAL
<GrandParent data={data}>
  <Parent data={data}>
    <Child data={data}>
      <GrandChild data={data} /> {/* 4 niveles! */}
    </Child>
  </Parent>
</GrandParent>

// BIEN: Usar Context o Zustand
const DataContext = createContext<Data | null>(null);
```

### 10.2 NO: Logica en JSX
```typescript
// MAL
<div>
  {items.filter(x => x.active).map(x => (
    <Item key={x.id} data={processData(x)} />
  ))}
</div>

// BIEN: Extraer logica
const activeItems = useMemo(() =>
  items.filter(x => x.active).map(processData),
  [items]
);

<div>
  {activeItems.map(item => <Item key={item.id} data={item} />)}
</div>
```

### 10.3 NO: Componentes Dios (>300 lineas)
```typescript
// MAL: Un componente hace todo
const Dashboard = () => { /* 500 lineas */ };

// BIEN: Dividir en subcomponentes
const Dashboard = () => (
  <>
    <DashboardHeader />
    <DashboardStats />
    <DashboardCharts />
    <DashboardActivity />
  </>
);
```

---

## 11. Checklist de Creacion de Componente

Antes de crear un nuevo componente:

1. [ ] Verificar que no existe componente similar
2. [ ] Determinar si es shared o feature-specific
3. [ ] Crear interface de Props en archivo separado
4. [ ] Usar nombres descriptivos (verbo + sustantivo)
5. [ ] Implementar estados: loading, error, empty, success
6. [ ] Agregar memo si es puro y costoso
7. [ ] Escribir al menos 1 test basico
8. [ ] Exportar en barrel file

---

## 12. Referencias

- **Hooks:** `docs/50-guides/frontend/HOOK-PATTERNS.md`
- **Types:** `docs/50-guides/frontend/TYPES-CONVENTIONS.md`
- **React Testing Library:** https://testing-library.com/docs/react-testing-library/intro
- **React Patterns:** https://reactpatterns.com/

---

## 13. Changelog

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-29 | Creacion inicial |
