---
title: "Estandar Frontend Profesional - Component Patterns"
status: activo
last_updated: "2026-02-28"
parent: "ESTANDAR-FRONTEND-PROFESIONAL.md"
section: "1"
---

# Component Patterns

> Seccion 1 de [Estandar Frontend Profesional](../ESTANDAR-FRONTEND-PROFESIONAL.md)

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
