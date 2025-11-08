# Testing Frontend - GAMILIT

**Proyecto:** GAMILIT - Consolidación GAMILIT Platform
**Módulo:** Testing Frontend (React/Vite con Vitest)
**Fecha:** 2025-10-27
**Versión:** 1.0
**Documento RFC:** RFC-0001

---

## Introducción

Esta guía presenta ejemplos prácticos de testing para el frontend de GAMILIT, desarrollado con React, Vite y Vitest. El objetivo de cobertura es **80%** como mínimo en componentes, stores y hooks.

El frontend utiliza Vitest + React Testing Library, proporcionando una experiencia de testing rápida y confiable con compatibilidad completa con la API de Jest.

---

## Stack de Testing Frontend

### Tecnologías Principales

- **Framework:** Vitest 1.x (compatible con Jest API)
- **Testing Library:** @testing-library/react 14.x
- **User Events:** @testing-library/user-event
- **Mocking:** vi.mock() (Vitest)
- **Coverage:** c8 o vitest coverage
- **Environment:** jsdom

### Características Principales

- Testing de componentes React con Testing Library
- Simulación de interacciones de usuario
- Testing de custom hooks con renderHook
- Testing de stores Zustand
- Testing de utilidades y API clients

---

## Configuración de Vitest

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@apps': path.resolve(__dirname, './src/apps'),
    },
  },
});
```

### src/test/setup.ts

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup después de cada test
afterEach(() => {
  cleanup();
});

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Descripción de Configuración

- **globals:** Habilita globals de testing (describe, it, expect)
- **environment:** jsdom para simular navegador
- **setupFiles:** Archivo de configuración inicial
- **coverage:** Configuración de cobertura con c8
- **thresholds:** Umbral mínimo 80% en todas las métricas
- **alias:** Paths aliases para imports limpios

---

## Ejemplos de Tests Frontend

### 1. Test de Componente - LoginPage

**Tipo:** Test de Renderizado
**Capa:** Componente
**Descripción:** Valida que todos los elementos del formulario se renderizan.

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe('LoginPage', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
  };

  it('should render login form with all fields', () => {
    renderComponent();

    expect(screen.getByText('GAMILIT Detective Platform')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/detective@glit.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should display form labels', () => {
    renderComponent();

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Recordarme')).toBeInTheDocument();
  });
});
```

**Puntos Clave:**
- Uso de BrowserRouter para contexto de routing
- Mock de hooks personalizados (useAuth, useNavigate)
- Queries semánticas (getByRole, getByText, getByPlaceholderText)
- Validación de presencia de elementos UI

---

### 2. Test de Store - authStore (Zustand)

**Tipo:** Test de Estado
**Capa:** Store
**Descripción:** Valida gestión de estado de autenticación con Zustand.

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';
import { authAPI } from '@features/auth/api/authAPI';

vi.mock('@features/auth/api/authAPI');

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  describe('login()', () => {
    it('should set user and token on successful login', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'student@glit.com',
          fullName: 'Test Student',
          role: 'student',
        },
        accessToken: 'mock_token',
      };

      vi.mocked(authAPI.login).mockResolvedValue(mockResponse);

      await useAuthStore.getState().login('student@glit.com', 'Test1234');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe('mock_token');
      expect(state.isAuthenticated).toBe(true);
    });
  });
});
```

**Puntos Clave:**
- Reset de estado en beforeEach
- Mock de API externa
- Validación de cambios de estado
- Acceso directo al state con getState()

---

### 3. Test de Custom Hook - useExercise

**Tipo:** Test de Hook
**Capa:** Hook
**Descripción:** Valida lógica de fetch y manejo de estado en custom hook.

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useExercise } from '../useExercise';
import { exercisesAPI } from '@features/education/api/exercisesAPI';

vi.mock('@features/education/api/exercisesAPI');

describe('useExercise', () => {
  it('should fetch and return exercise data', async () => {
    const mockExercise = {
      id: 'ex-123',
      title: 'Crucigrama Maya',
      type: 'crucigrama',
      config: { size: 10 },
    };

    vi.mocked(exercisesAPI.getById).mockResolvedValue(mockExercise);

    const { result } = renderHook(() => useExercise('ex-123'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.exercise).toEqual(mockExercise);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when exercise not found', async () => {
    vi.mocked(exercisesAPI.getById).mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useExercise('invalid-id'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.exercise).toBeNull();
    expect(result.current.error).toBeTruthy();
  });
});
```

**Puntos Clave:**
- Uso de renderHook para testear hooks
- Uso de waitFor para operaciones asíncronas
- Validación de estados (loading, data, error)
- Mock de API calls

---

### 4. Test de Interacción - Button Component

**Tipo:** Test de Interacción
**Capa:** Componente
**Descripción:** Valida eventos de click y comportamiento disabled.

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick} disabled>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('should apply variant classes correctly', () => {
    render(<Button variant="primary">Primary</Button>);

    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('bg-blue-600');
  });
});
```

**Puntos Clave:**
- Uso de userEvent para simular interacciones reales
- Validación de callbacks (vi.fn())
- Verificación de estado disabled
- Comprobación de clases CSS aplicadas

---

### 5. Test de Utility - apiClient

**Tipo:** Test de Utility
**Capa:** Utilidad
**Descripción:** Valida cliente HTTP con interceptors y manejo de errores.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { apiClient } from '../apiClient';

vi.mock('axios');

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add authorization header when token exists', async () => {
    const mockToken = 'mock_jwt_token';
    localStorage.setItem('auth-token', mockToken);

    vi.mocked(axios.create).mockReturnValue({
      get: vi.fn().mockResolvedValue({ data: { success: true } }),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    } as any);

    const client = apiClient;
    await client.get('/api/test');

    expect(axios.create).toHaveBeenCalled();
  });

  it('should handle 401 responses and clear auth state', async () => {
    const mockError = {
      response: { status: 401 },
    };

    vi.mocked(axios.create).mockReturnValue({
      get: vi.fn().mockRejectedValue(mockError),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn((success, error) => error(mockError)) },
      },
    } as any);

    try {
      await apiClient.get('/api/protected');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});
```

**Puntos Clave:**
- Mock de axios y sus métodos
- Validación de interceptors
- Testeo de manejo de errores HTTP
- Verificación de headers de autenticación

---

## Comandos de Testing Frontend

### Comandos NPM

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch (desarrollo)
npm run test:watch

# Tests con UI interactiva de Vitest
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar tests específicos
npm run test -- LoginPage.test.tsx

# Tests con output verbose
npm run test -- --reporter=verbose

# Ejecutar tests en modo headless (CI)
npm run test:ci
```

### Configuración en package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=json"
  }
}
```

---

## Mejores Prácticas - Frontend

### Filosofía de Testing

1. **Testear como Usuario**
   - Pensar desde la perspectiva del usuario
   - Usar queries semánticas (getByRole, getByLabelText)
   - Evitar testear detalles de implementación

2. **Testing Library Queries (Orden de Prioridad)**
   - **getByRole:** Preferir siempre (accesibilidad)
   - **getByLabelText:** Para inputs con labels
   - **getByPlaceholderText:** Como último recurso
   - **Evitar:** getByTestId (solo para casos específicos)

3. **Eventos de Usuario**
   - Usar userEvent en lugar de fireEvent
   - Simular interacciones reales (click, type, hover)
   - Esperar actualizaciones asíncronas con waitFor

### Componentes

4. **Estructura de Tests de Componentes**
   - Renderizado básico
   - Props y variantes
   - Interacciones de usuario
   - Estados de carga/error
   - Accesibilidad

5. **Providers y Contextos**
   - Crear wrappers reutilizables
   - Mockear contextos solo cuando sea necesario
   - Proveer valores de prueba mínimos

### Hooks y Stores

6. **Testing de Hooks**
   - Usar renderHook de Testing Library
   - Validar estados iniciales
   - Testear efectos secundarios
   - Usar waitFor para async updates

7. **Testing de Stores**
   - Resetear estado en beforeEach
   - Testear acciones y selectors
   - Mockear dependencias externas (APIs)

### Asincronía

8. **Manejo de Operaciones Asíncronas**
   - Usar waitFor para esperar cambios
   - Usar findBy queries (async queries)
   - Evitar usar act() manualmente (lo hace Testing Library)

---

## Patrones Comunes

### Patrón: Wrapper con Providers

```typescript
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};
```

### Patrón: Mock de Hook

```typescript
vi.mock('@features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@glit.com' },
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
  }),
}));
```

### Patrón: Testeo de Formularios

```typescript
it('should submit form with valid data', async () => {
  const handleSubmit = vi.fn();
  const user = userEvent.setup();

  render(<LoginForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText(/email/i), 'student@glit.com');
  await user.type(screen.getByLabelText(/password/i), 'Test1234');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'student@glit.com',
      password: 'Test1234',
    });
  });
});
```

---

## Referencias

### Documentación Oficial
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)

### Documentación Interna GAMILIT
- [Estructura Frontend](../frontend/ESTRUCTURA-Y-FEATURES.md)
- [Testing Backend](./Testing-Backend.md)
- [Testing Integración](./Testing-Integracion.md)
- [Testing Cobertura](./Testing-Cobertura.md)

### Código de Ejemplo
- Frontend Tests: `/gamilit-platform-web/src/**/__tests__/`

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Autor:** Equipo GAMILIT
**RFC:** RFC-0001
**Cobertura objetivo:** 80%
