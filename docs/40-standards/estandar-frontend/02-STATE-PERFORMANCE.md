---
title: "Estandar Frontend Profesional - State Management & Performance"
status: activo
last_updated: "2026-02-28"
parent: "ESTANDAR-FRONTEND-PROFESIONAL.md"
sections: "2-3"
---

# State Management & Performance Optimization

> Secciones 2-3 de [Estandar Frontend Profesional](../ESTANDAR-FRONTEND-PROFESIONAL.md)

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
