---
titulo: Estandar Frontend Profesional
tipo: estandar-proyecto
version: 1.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
status: active
applies_to:
  - all_frontend_projects
  - react_applications
  - typescript_projects
tags:
  - frontend
  - react
  - typescript
  - patterns
  - performance
  - testing
  - accessibility
---

# Estandar Frontend Profesional

Este documento establece los patrones, practicas y estandares obligatorios para el desarrollo frontend en todos los proyectos del workspace.

---

## 1. Component Patterns

### 1.1 Compound Components

Patron para crear componentes relacionados que comparten estado implicito. Ideal para Tabs, Accordion, Menu, Select.

```tsx
// tabs/Tabs.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within Tabs');
  }
  return context;
}

interface TabsProps {
  defaultTab: string;
  children: ReactNode;
}

export function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
}

export function TabList({ children }: TabListProps) {
  return (
    <div role="tablist" className="tab-list">
      {children}
    </div>
  );
}

interface TabProps {
  id: string;
  children: ReactNode;
}

export function Tab({ id, children }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      className={`tab ${isActive ? 'tab--active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  id: string;
  children: ReactNode;
}

export function TabPanel({ id, children }: TabPanelProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== id) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className="tab-panel"
    >
      {children}
    </div>
  );
}

// Uso:
// <Tabs defaultTab="general">
//   <TabList>
//     <Tab id="general">General</Tab>
//     <Tab id="settings">Settings</Tab>
//   </TabList>
//   <TabPanel id="general">General content</TabPanel>
//   <TabPanel id="settings">Settings content</TabPanel>
// </Tabs>
```

### 1.2 Render Props

Patron para compartir logica entre componentes mediante una funcion como prop.

```tsx
// components/MouseTracker.tsx
import { useState, useEffect, ReactNode } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  children: (position: MousePosition) => ReactNode;
}

export function MouseTracker({ children }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <>{children(position)}</>;
}

// Uso:
// <MouseTracker>
//   {({ x, y }) => (
//     <div>Mouse position: {x}, {y}</div>
//   )}
// </MouseTracker>
```

### 1.3 Custom Hooks

Extraer y reutilizar logica con estado. Convencion de nomenclatura: `use{NombreDescriptivo}`.

```tsx
// hooks/useAsync.ts
import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (...args: unknown[]) => Promise<T | undefined>;
  reset: () => void;
}

export function useAsync<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState({ data: null, error: null, isLoading: true });
      try {
        const data = await asyncFunction(...args);
        setState({ data, error: null, isLoading: false });
        return data;
      } catch (error) {
        setState({ data: null, error: error as Error, isLoading: false });
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { ...state, execute, reset };
}

// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
```

### 1.4 Container/Presentational

Separar la logica de negocio (Container) de la presentacion visual (Presentational).

```tsx
// features/users/components/UserList.tsx (Presentational)
import { User } from '../types';

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onUserSelect: (user: User) => void;
}

export function UserList({ users, isLoading, onUserSelect }: UserListProps) {
  if (isLoading) {
    return <div className="skeleton-list" aria-busy="true">Loading...</div>;
  }

  return (
    <ul className="user-list" role="list">
      {users.map((user) => (
        <li key={user.id}>
          <button onClick={() => onUserSelect(user)}>
            {user.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

// features/users/containers/UserListContainer.tsx (Container)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserList } from '../components/UserList';
import { UserDetail } from '../components/UserDetail';
import { userService } from '../services/userService';
import { User } from '../types';

export function UserListContainer() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="user-list-container">
      <UserList
        users={users}
        isLoading={isLoading}
        onUserSelect={handleUserSelect}
      />
      {selectedUser && <UserDetail user={selectedUser} />}
    </div>
  );
}
```

---

## 2. State Management Patterns

### 2.1 Cuando Usar Cada Tipo de Estado

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `useState` | Estado local de un componente | Form inputs, toggles, UI state |
| `useReducer` | Estado local complejo con multiples acciones | Forms con validacion, wizards |
| `Context` | Estado compartido en un subarbol | Theme, User auth, Feature flags |
| `Zustand` | Estado global de la aplicacion | Cart, Notifications, App settings |

### 2.2 Local State (useState)

```tsx
// Preferir multiples useState sobre un objeto grande
function UserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ...
}
```

### 2.3 Context para Estado Compartido

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const userData = await response.json();
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

### 2.4 Zustand para Estado Global

```tsx
// stores/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

---

## 3. Performance Optimization

### 3.1 Regla Fundamental

> **NO memoizar por defecto. Medir primero, optimizar despues.**

Solo usar memoizacion cuando:
- El componente re-renderiza frecuentemente con las mismas props
- El calculo es computacionalmente costoso (>10ms)
- React DevTools Profiler muestra problemas de rendimiento

### 3.2 Memoization

#### React.memo

Previene re-renders cuando las props no cambian.

```tsx
// Usar cuando el componente es costoso y recibe las mismas props frecuentemente
const ExpensiveList = React.memo(function ExpensiveList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

// Con comparador personalizado
const UserCard = React.memo(
  function UserCard({ user }: { user: User }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
);
```

#### useMemo

Memoriza el resultado de un calculo costoso.

```tsx
function Dashboard({ transactions }: { transactions: Transaction[] }) {
  // Usar cuando el calculo es costoso y las dependencias no cambian frecuentemente
  const statistics = useMemo(() => {
    return {
      total: transactions.reduce((sum, t) => sum + t.amount, 0),
      average: transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
        : 0,
      byCategory: groupByCategory(transactions),
    };
  }, [transactions]);

  return <StatsDisplay stats={statistics} />;
}
```

#### useCallback

Memoriza una funcion para evitar re-creaciones innecesarias.

```tsx
function ParentComponent() {
  const [count, setCount] = useState(0);

  // Usar cuando la funcion se pasa a componentes memorizados
  const handleIncrement = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  return <MemoizedChild onIncrement={handleIncrement} />;
}
```

### 3.3 Code Splitting

```tsx
// Lazy loading de componentes
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Reports = lazy(() => import('./pages/Reports'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}

// Named exports con lazy
const AdminDashboard = lazy(() =>
  import('./pages/Admin').then((module) => ({ default: module.AdminDashboard }))
);
```

### 3.4 Virtual Lists (react-window)

Para listas con mas de 100 elementos, usar virtualizacion.

```tsx
import { FixedSizeList as List } from 'react-window';

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: User[];
}

function Row({ index, style, data }: RowProps) {
  const user = data[index];
  return (
    <div style={style} className="user-row">
      <span>{user.name}</span>
      <span>{user.email}</span>
    </div>
  );
}

function VirtualUserList({ users }: { users: User[] }) {
  return (
    <List
      height={400}
      itemCount={users.length}
      itemSize={50}
      itemData={users}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

---

## 4. Testing Patterns

### 4.1 Unit Tests para Hooks

```tsx
// hooks/__tests__/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });
});
```

### 4.2 Component Tests

```tsx
// components/__tests__/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render email and password fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // Preferir getByRole sobre getByTestId
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with form data when valid', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // Preferir userEvent sobre fireEvent
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### 4.3 API Mocking con MSW

```tsx
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ]);
  }),

  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json(
      { id: '3', ...newUser },
      { status: 201 }
    );
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: 'John Doe',
      email: 'john@example.com',
    });
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// setupTests.ts
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 4.4 Jerarquia de Queries

Orden de preferencia para seleccionar elementos:

1. **getByRole** - Accesible para todos
2. **getByLabelText** - Forms
3. **getByPlaceholderText** - Cuando no hay label
4. **getByText** - Contenido no interactivo
5. **getByDisplayValue** - Inputs con valor
6. **getByAltText** - Imagenes
7. **getByTitle** - Atributo title
8. **getByTestId** - Ultimo recurso

---

## 5. Accessibility (A11Y)

### 5.1 Semantic HTML

```tsx
// Preferir elementos semanticos nativos
function ArticlePage({ article }: { article: Article }) {
  return (
    <article>
      <header>
        <h1>{article.title}</h1>
        <time dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
      </header>

      <main>
        <section aria-labelledby="content-heading">
          <h2 id="content-heading">Content</h2>
          {article.content}
        </section>
      </main>

      <footer>
        <nav aria-label="Article navigation">
          <a href={article.prevUrl}>Previous</a>
          <a href={article.nextUrl}>Next</a>
        </nav>
      </footer>
    </article>
  );
}
```

### 5.2 ARIA Labels

```tsx
// Usar ARIA solo cuando HTML semantico no es suficiente
function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  const [term, setTerm] = useState('');

  return (
    <div role="search">
      <label htmlFor="search-input" className="sr-only">
        Search products
      </label>
      <input
        id="search-input"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-describedby="search-hint"
        placeholder="Search..."
      />
      <span id="search-hint" className="sr-only">
        Type at least 3 characters to search
      </span>
      <button
        type="button"
        onClick={() => onSearch(term)}
        aria-label="Submit search"
      >
        <SearchIcon aria-hidden="true" />
      </button>
    </div>
  );
}
```

### 5.3 Focus Management

```tsx
import { useRef, useEffect } from 'react';

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Mover foco al modal cuando se abre
      closeButtonRef.current?.focus();

      // Trap focus dentro del modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button ref={closeButtonRef} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
```

### 5.4 Keyboard Navigation

```tsx
function Menu({ items }: { items: MenuItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
    }
  };

  useEffect(() => {
    itemRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li key={item.id} role="none">
          <button
            ref={(el) => (itemRefs.current[index] = el)}
            role="menuitem"
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 6. Estructura de Proyecto

```
src/
├── components/              # Componentes reutilizables globales
│   ├── ui/                  # Componentes base (Button, Input, Modal)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── layout/              # Componentes de layout (Header, Footer, Sidebar)
│
├── features/                # Modulos organizados por feature
│   ├── auth/
│   │   ├── components/      # Componentes especificos de auth
│   │   ├── hooks/           # Hooks especificos de auth
│   │   ├── services/        # API calls de auth
│   │   ├── types/           # Types de auth
│   │   └── index.ts         # Public API del feature
│   ├── users/
│   └── products/
│
├── hooks/                   # Custom hooks globales
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── index.ts
│
├── lib/                     # Utilidades y helpers
│   ├── utils.ts             # Funciones de utilidad
│   ├── formatters.ts        # Formateadores (fechas, numeros, etc.)
│   ├── validators.ts        # Funciones de validacion
│   └── constants.ts         # Constantes de la aplicacion
│
├── services/                # API calls y servicios externos
│   ├── api.ts               # Configuracion base de API (axios/fetch)
│   ├── userService.ts
│   └── productService.ts
│
├── stores/                  # Estado global (Zustand)
│   ├── cartStore.ts
│   └── notificationStore.ts
│
├── contexts/                # React Contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── types/                   # TypeScript types globales
│   ├── api.ts               # Types de respuestas API
│   ├── entities.ts          # Types de entidades
│   └── index.ts
│
├── styles/                  # Estilos globales
│   ├── globals.css
│   └── variables.css
│
├── pages/                   # Paginas (si no usa file-based routing)
│   ├── Home.tsx
│   └── Dashboard.tsx
│
├── App.tsx                  # Componente raiz
├── main.tsx                 # Entry point
└── vite-env.d.ts            # Types de Vite
```

### 6.1 Convenciones de Nomenclatura

| Tipo | Convencion | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `UserCard.tsx` |
| Hooks | camelCase con prefijo `use` | `useAuth.ts` |
| Servicios | camelCase con sufijo `Service` | `userService.ts` |
| Stores | camelCase con sufijo `Store` | `cartStore.ts` |
| Types | PascalCase | `User.ts` |
| Utilidades | camelCase | `formatDate.ts` |
| Constantes | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Tests | mismo nombre + `.test.ts(x)` | `UserCard.test.tsx` |

### 6.2 Exports e Imports

```tsx
// features/users/index.ts - Public API del feature
export { UserList } from './components/UserList';
export { UserCard } from './components/UserCard';
export { useUsers } from './hooks/useUsers';
export type { User, UserRole } from './types';

// Importar desde la public API, no desde archivos internos
import { UserList, useUsers, User } from '@/features/users';
```

---

## 7. Checklist de Validacion

### Pre-commit

- [ ] Codigo compila sin errores (`npm run build`)
- [ ] Linting pasa (`npm run lint`)
- [ ] Type checking pasa (`npm run typecheck`)
- [ ] Tests pasan (`npm run test`)
- [ ] No hay console.log en codigo de produccion
- [ ] No hay TODO sin ticket asociado

### Componentes

- [ ] Props tienen tipos TypeScript definidos
- [ ] Componente tiene nombre descriptivo
- [ ] Props destructuradas en la firma de la funcion
- [ ] Valores por defecto para props opcionales
- [ ] Keys unicas en listas
- [ ] Event handlers nombrados como `handle{Evento}`
- [ ] No hay logica de negocio en componentes presentacionales

### Accesibilidad

- [ ] Elementos interactivos son focusables
- [ ] Imagenes tienen alt text
- [ ] Forms tienen labels asociados
- [ ] Colores tienen suficiente contraste (4.5:1 minimo)
- [ ] Navegacion funciona con teclado
- [ ] ARIA labels donde HTML semantico no es suficiente
- [ ] Focus visible en elementos interactivos

### Performance

- [ ] Componentes grandes estan code-split
- [ ] Listas largas (>100 items) usan virtualizacion
- [ ] Memoizacion solo donde esta justificada
- [ ] Imagenes optimizadas y con lazy loading
- [ ] No hay re-renders innecesarios (verificar con React DevTools)

### Testing

- [ ] Cobertura minima 80% en logica critica
- [ ] Tests usan queries semanticas (getByRole preferido)
- [ ] Tests verifican comportamiento, no implementacion
- [ ] Mocking minimo necesario
- [ ] Tests son independientes entre si

### Seguridad

- [ ] No hay secrets en codigo frontend
- [ ] Inputs sanitizados antes de mostrar
- [ ] URLs externas usan `rel="noopener noreferrer"`
- [ ] No usar `dangerouslySetInnerHTML` sin sanitizar

---

## Referencias

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/docs/)
- [Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [React Window](https://react-window.vercel.app/)
- [MSW Documentation](https://mswjs.io/docs/)

## Ver tambien

- [PRINCIPIO-SEPARATION-OF-CONCERNS](../../orchestration/directivas/principios/PRINCIPIO-SEPARATION-OF-CONCERNS.md) - Principio de separacion de responsabilidades aplicado a frontend

### Estandares frontend especificos (complementarios)

Los siguientes estandares definen reglas detalladas para aspectos concretos del desarrollo frontend. Aplican como complemento a este documento:

- [ESTANDAR-FRONTEND-API.md](./ESTANDAR-FRONTEND-API.md) -- Ubicacion canonica de APIs, React Query como estandar, error handling
- [ESTANDAR-FRONTEND-COMPONENT.md](./ESTANDAR-FRONTEND-COMPONENT.md) -- Export patterns, props typing, React imports, file naming
- [ESTANDAR-FRONTEND-IMPORTS.md](./ESTANDAR-FRONTEND-IMPORTS.md) -- Import order (5 grupos), path aliases, barrels, icon imports
- [ESTANDAR-FRONTEND-TYPES.md](./ESTANDAR-FRONTEND-TYPES.md) -- Jerarquia de tipos, anti-duplicados, inline types, any policy
- [ESTANDAR-FRONTEND-UX-PATTERNS.md](./ESTANDAR-FRONTEND-UX-PATTERNS.md) -- Error/Loading/Empty states, toasts, forms, confirmation dialogs
