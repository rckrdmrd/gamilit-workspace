# Patrones de Custom Hooks - Frontend GAMILIT

**Fecha de creacion:** 2025-11-29
**Version:** 1.0
**Estado:** VIGENTE
**Contexto:** Estandarizacion de 30+ custom hooks

---

## 1. Principios Fundamentales

### 1.1 Proposito de Custom Hooks
- **Encapsular logica reutilizable**: Extraer logica de componentes
- **Compartir estado**: Entre componentes sin prop drilling
- **Abstraer complejidad**: Ocultar detalles de implementacion
- **Testear aisladamente**: Logica separada de UI

### 1.2 Regla de Extraccion
> Si una logica con hooks se repite en 2+ componentes, crea un custom hook.

### 1.3 Naming Convention
- Siempre empezar con `use`: `useAuth`, `useForm`, `useDebounce`
- Nombre descriptivo de lo que hace: `useUserData`, `useLocalStorage`
- Verbos para acciones: `useFetchUser`, `useSubmitForm`

---

## 2. Anatomia de un Custom Hook

### 2.1 Estructura Estandar
```typescript
/**
 * useHookName
 * @description Breve descripcion del hook
 * @param {ParamType} param - Descripcion del parametro
 * @returns {ReturnType} Descripcion del retorno
 *
 * @example
 * const { data, isLoading } = useHookName(param);
 */

import { useState, useEffect, useCallback } from 'react';

// 1. Tipos
interface UseHookNameParams {
  initialValue?: string;
  onSuccess?: (data: Data) => void;
}

interface UseHookNameReturn {
  data: Data | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// 2. Hook principal
export function useHookName({
  initialValue = '',
  onSuccess,
}: UseHookNameParams = {}): UseHookNameReturn {
  // 2.1 Estado
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 2.2 Efectos
  useEffect(() => {
    // Logica de efecto
  }, [/* dependencias */]);

  // 2.3 Callbacks
  const refetch = useCallback(() => {
    // Logica de refetch
  }, [/* dependencias */]);

  // 2.4 Return
  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
```

### 2.2 Archivo de Hook Simple
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 3. Estructura de Carpetas

### 3.1 Hooks Compartidos
```
shared/
└── hooks/
    ├── index.ts              # Barrel export
    ├── useDebounce.ts
    ├── useLocalStorage.ts
    ├── useMediaQuery.ts
    ├── useClickOutside.ts
    └── useAsync.ts
```

### 3.2 Hooks por Feature
```
features/
└── auth/
    └── hooks/
        ├── index.ts
        ├── useAuth.ts
        ├── useLogin.ts
        └── useLogout.ts
```

### 3.3 Barrel Export
```typescript
// shared/hooks/index.ts
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { useMediaQuery } from './useMediaQuery';
export { useClickOutside } from './useClickOutside';
export { useAsync } from './useAsync';

// types
export type { UseAsyncReturn } from './useAsync';
```

---

## 4. Patrones Comunes

### 4.1 State Management Hook
```typescript
// useToggle.ts
import { useState, useCallback } from 'react';

export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// Uso
const { value: isOpen, toggle, setFalse: close } = useToggle();
```

### 4.2 Data Fetching Hook (con React Query)
```typescript
// useUserData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUser, updateUser } from '@/services/api/userApi';
import type { User, UpdateUserDto } from '@shared/types';

export function useUserData(userId: string) {
  const queryClient = useQueryClient();

  // Query
  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: (data: UpdateUserDto) => updateUser(userId, data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', userId], updatedUser);
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateUser: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}

// Uso
const { user, isLoading, updateUser } = useUserData(userId);
```

### 4.3 Form Hook
```typescript
// useForm.ts
import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when field changes
    if (errors[name as keyof T]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    // Validate
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    // Submit
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
}

// Uso
const form = useForm({
  initialValues: { email: '', password: '' },
  validate: (values) => {
    const errors: Record<string, string> = {};
    if (!values.email) errors.email = 'Requerido';
    return errors;
  },
  onSubmit: async (values) => {
    await login(values);
  },
});
```

### 4.4 Storage Hook
```typescript
// useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Lazy initialization
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving to localStorage: ${key}`, error);
    }
  }, [key, storedValue]);

  // Remove from localStorage
  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setStoredValue, remove];
}

// Uso
const [theme, setTheme, clearTheme] = useLocalStorage('theme', 'light');
```

### 4.5 Event Listener Hook
```typescript
// useClickOutside.ts
import { useEffect, useRef, RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
  handler: () => void
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
}

// Uso
const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
<div ref={ref}>...</div>
```

---

## 5. Integracion con React Query

### 5.1 Pattern para Queries
```typescript
// usePaginatedData.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';

interface UsePaginatedDataParams {
  page: number;
  limit: number;
  filters?: Record<string, any>;
}

export function usePaginatedData<T>({
  page,
  limit,
  filters,
}: UsePaginatedDataParams) {
  return useQuery({
    queryKey: ['data', { page, limit, ...filters }],
    queryFn: () => fetchPaginatedData<T>({ page, limit, filters }),
    placeholderData: keepPreviousData, // Mantener datos anteriores
    staleTime: 30_000, // 30 segundos
  });
}
```

### 5.2 Pattern para Mutations
```typescript
// useCreateItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
```

---

## 6. Error Handling en Hooks

### 6.1 Try-Catch Pattern
```typescript
export function useAsyncAction<T, P extends any[]>(
  action: (...args: P) => Promise<T>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (...args: P) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await action(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [action]);

  return { execute, isLoading, error, data };
}
```

### 6.2 Error Boundary Integration
```typescript
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  // Si hay error, lo propaga al Error Boundary mas cercano
  if (error) {
    throw error;
  }

  const handleError = useCallback((error: Error) => {
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { handleError, clearError };
}
```

---

## 7. Dependencies Array

### 7.1 Reglas de Dependencias
```typescript
// SIEMPRE incluir todas las dependencias usadas

// MAL - Falta dependencia
useEffect(() => {
  fetchData(userId); // userId no esta en deps
}, []); // eslint warning!

// BIEN - Todas las dependencias
useEffect(() => {
  fetchData(userId);
}, [userId]);

// useCallback con dependencias correctas
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]); // value incluido
```

### 7.2 Evitar Dependencias Inestables
```typescript
// MAL - Objeto nuevo en cada render
useEffect(() => {
  fetchData(options);
}, [options]); // options es nuevo cada vez

// BIEN - Dependencias primitivas
useEffect(() => {
  fetchData({ page, limit });
}, [page, limit]); // primitivos estables

// O usar useMemo para estabilizar
const stableOptions = useMemo(() => ({ page, limit }), [page, limit]);
useEffect(() => {
  fetchData(stableOptions);
}, [stableOptions]);
```

---

## 8. Testing de Hooks

### 8.1 Setup Basico
```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter(0));
    expect(result.current.count).toBe(0);
  });

  it('should increment', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(5);
  });
});
```

### 8.2 Testing con React Query
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserData } from './useUserData';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUserData', () => {
  it('should fetch user data', async () => {
    const { result } = renderHook(() => useUserData('123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeDefined();
  });
});
```

---

## 9. Anti-patrones a Evitar

### 9.1 NO: Llamar Hooks Condicionalmente
```typescript
// MAL - Viola reglas de hooks
if (condition) {
  const [state] = useState(); // Error!
}

// BIEN - Hook siempre se llama
const [state] = useState();
if (condition) {
  // usar state
}
```

### 9.2 NO: Efectos sin Cleanup
```typescript
// MAL - Memory leak potencial
useEffect(() => {
  const subscription = subscribe(callback);
  // Falta cleanup!
}, []);

// BIEN - Con cleanup
useEffect(() => {
  const subscription = subscribe(callback);
  return () => subscription.unsubscribe();
}, []);
```

### 9.3 NO: Dependencias Faltantes
```typescript
// MAL - eslint-disable para silenciar warning
useEffect(() => {
  doSomething(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // NO hacer esto!

// BIEN - Incluir o refactorizar
useEffect(() => {
  doSomething(value);
}, [value]);
```

---

## 10. Checklist de Creacion de Hook

Antes de crear un nuevo custom hook:

1. [ ] Verificar que no existe hook similar
2. [ ] Nombre empieza con `use`
3. [ ] Parametros tipados con interface
4. [ ] Return tipado con interface o inline
5. [ ] Documentacion JSDoc con @example
6. [ ] Dependencies array completo
7. [ ] Cleanup en useEffect si necesario
8. [ ] Al menos 1 test basico
9. [ ] Exportar en barrel file

---

## 11. Referencias

- **Componentes:** `docs/95-guias-desarrollo/frontend/COMPONENT-PATTERNS.md`
- **Types:** `docs/95-guias-desarrollo/frontend/TYPES-CONVENTIONS.md`
- **React Hooks:** https://react.dev/reference/react/hooks
- **React Query:** https://tanstack.com/query/latest

---

## 12. Changelog

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-29 | Creacion inicial |
