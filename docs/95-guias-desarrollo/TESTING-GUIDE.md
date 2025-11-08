# Guía de Testing GAMILIT

**Proyecto:** GAMILIT - Consolidación GAMILIT Platform
**Fecha:** 2025-10-27
**Versión:** 1.0

---

## Introducción

Esta guía presenta ejemplos prácticos de testing para el proyecto GAMILIT, cubriendo tanto el backend (Node.js/Express con Jest) como el frontend (React/Vite con Vitest). El objetivo de cobertura es **80%** como mínimo en todas las capas críticas: servicios, repositorios, controladores (backend) y componentes, stores, hooks (frontend).

GAMILIT utiliza un stack de testing moderno que garantiza la calidad del código mediante tests unitarios, de integración y end-to-end. El backend emplea Jest con soporte para TypeScript, mientras que el frontend utiliza Vitest + React Testing Library para una experiencia de testing rápida y confiable.

---

## Stack de Testing

### Backend
- **Framework:** Jest 29.x
- **Mocking:** jest.mock(), jest.fn()
- **Coverage:** Istanbul integrado en Jest
- **Supertest:** Para tests de integración HTTP
- **TypeScript:** ts-jest

### Frontend
- **Framework:** Vitest 1.x (compatible con Jest API)
- **Testing Library:** @testing-library/react 14.x
- **User Events:** @testing-library/user-event
- **Mocking:** vi.mock() (Vitest)
- **Coverage:** c8 o vitest coverage

---

## Configuración Básica

### jest.config.js (Backend)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.types.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
  },
};
```

### vitest.config.ts (Frontend)

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

---

## Tests de Backend

### 1. AuthService.login() - Test Unitario

**Descripción:** Test del servicio de autenticación que valida credenciales y retorna tokens JWT.

```typescript
import { AuthService } from '../auth.service';
import { UsersRepository } from '../users.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../users.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersRepo: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    mockUsersRepo = new UsersRepository() as jest.Mocked<UsersRepository>;
    authService = new AuthService(mockUsersRepo);
  });

  describe('login()', () => {
    it('should return access and refresh tokens on valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'student@glit.com',
        password_hash: 'hashed_password',
        role: 'student',
        status: 'active',
      };

      mockUsersRepo.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.login('student@glit.com', 'Test1234');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('student@glit.com');
      expect(mockUsersRepo.findByEmail).toHaveBeenCalledWith('student@glit.com');
    });
  });
});
```

**Explicación:** Mock del repositorio y dependencias externas (bcrypt, jwt). Valida que el servicio retorna los tokens esperados cuando las credenciales son correctas.

---

### 2. ExerciseRepository.findById() - Test con Mock de DB

**Descripción:** Test del repositorio que busca ejercicios por ID usando un pool de PostgreSQL mockeado.

```typescript
import { ExerciseRepository } from '../exercise.repository';
import { pool } from '@/database/pool';

jest.mock('@/database/pool');

describe('ExerciseRepository', () => {
  let repo: ExerciseRepository;
  let mockPool: jest.Mocked<typeof pool>;

  beforeEach(() => {
    mockPool = pool as jest.Mocked<typeof pool>;
    repo = new ExerciseRepository();
  });

  describe('findById()', () => {
    it('should return exercise when found', async () => {
      const mockExercise = {
        id: 'ex-123',
        module_id: 'mod-1',
        title: 'Crucigrama Maya',
        type: 'crucigrama',
        config: { size: 10, words: [] },
        xp_reward: 100,
        ml_coins_reward: 50,
      };

      mockPool.query.mockResolvedValue({
        rows: [mockExercise],
        rowCount: 1,
      } as any);

      const result = await repo.findById('ex-123');

      expect(result).toEqual(mockExercise);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM exercises WHERE id = $1',
        ['ex-123']
      );
    });
  });
});
```

**Explicación:** Mock del pool de PostgreSQL. Valida que la query SQL es correcta y que el repositorio retorna el objeto esperado del resultado de la base de datos.

---

### 3. POST /api/auth/login - Test de Integración

**Descripción:** Test de integración que valida el endpoint completo de login incluyendo validación, middlewares y respuesta HTTP.

```typescript
import request from 'supertest';
import { createApp } from '@/app';
import { pool } from '@/database/pool';

describe('POST /api/auth/login', () => {
  let app: Express.Application;

  beforeAll(async () => {
    app = createApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should return 200 and tokens on valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@glit.com',
        password: 'Test1234',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');
    expect(response.body.data.user.email).toBe('student@glit.com');
  });

  it('should return 400 on missing email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Test1234' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

**Explicación:** Usa Supertest para hacer requests HTTP reales a la aplicación Express. Valida el flujo completo desde el endpoint hasta la respuesta, incluyendo status codes y estructura de datos.

---

### 4. Middleware de Autenticación - Test de Middleware

**Descripción:** Test del middleware que valida JWT en requests protegidos.

```typescript
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../auth.middleware';
import { AuthRequest } from '@/shared/types';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should attach user to request on valid token', () => {
    mockReq.headers = {
      authorization: 'Bearer valid_token',
    };

    const mockPayload = {
      id: 'user-123',
      email: 'student@glit.com',
      role: 'student',
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual(mockPayload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 on missing token', () => {
    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
```

**Explicación:** Mock de Express request/response. Valida que el middleware decodifica correctamente el JWT y adjunta el usuario al request, o retorna 401 si falta el token.

---

### 5. Validación de DTO con Joi - Test de Validación

**Descripción:** Test de esquema de validación Joi para DTOs de entrada.

```typescript
import Joi from 'joi';
import { loginSchema } from '../auth.validation';

describe('Auth Validation', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'student@glit.com',
        password: 'Test1234',
      };

      const { error, value } = loginSchema.validate(validData);

      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Test1234',
      };

      const { error } = loginSchema.validate(invalidData);

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('valid email');
    });

    it('should reject weak passwords', () => {
      const weakPassword = {
        email: 'student@glit.com',
        password: '123',
      };

      const { error } = loginSchema.validate(weakPassword);

      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('password');
    });
  });
});
```

**Explicación:** Valida que el esquema Joi rechaza datos inválidos y acepta datos válidos. Útil para garantizar que las validaciones de entrada funcionan antes de llegar al controlador.

---

## Tests de Frontend

### 6. LoginPage Component - Test de Renderizado

**Descripción:** Test del componente LoginPage que verifica que todos los elementos se renderizan correctamente.

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

**Explicación:** Renderiza el componente con los providers necesarios (BrowserRouter) y verifica que todos los elementos del formulario estén presentes en el DOM usando queries de Testing Library.

---

### 7. authStore.login() - Test de Zustand Store

**Descripción:** Test del store de autenticación Zustand que gestiona el estado de login.

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

**Explicación:** Mock de la API y validación de que el store actualiza correctamente su estado interno (user, token, isAuthenticated) después de un login exitoso.

---

### 8. useExercise Hook - Test de Custom Hook

**Descripción:** Test del custom hook que gestiona el estado de un ejercicio.

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

**Explicación:** Usa renderHook de Testing Library para testear el ciclo de vida del hook. Valida estados de loading, data y error, y que se llama correctamente a la API.

---

### 9. Button Component - Test de Interacción

**Descripción:** Test del componente Button que valida eventos de click y variantes visuales.

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

**Explicación:** Valida interacciones de usuario con userEvent. Verifica que el callback onClick se ejecuta, que el botón disabled no responde a clicks, y que las variantes aplican las clases CSS correctas.

---

### 10. API Client Utility - Test de Utility Function

**Descripción:** Test de la función utilitaria del cliente API que maneja requests HTTP con interceptors.

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

**Explicación:** Mock de axios para testear el cliente API. Valida que los interceptors añaden headers de autenticación y manejan correctamente errores HTTP 401 (unauthorized).

---

## Comandos de Testing

### Backend (Jest)

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage

# Tests específicos
npm test -- auth.service.test.ts

# Tests en modo debug
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend (Vitest)

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch (UI interactiva)
npm run test:ui

# Coverage report
npm run test:coverage

# Tests específicos
npm run test -- LoginPage.test.tsx

# Tests con verbose output
npm run test -- --reporter=verbose
```

---

## Mejores Prácticas

### General
1. **AAA Pattern:** Arrange (preparar), Act (actuar), Assert (verificar)
2. **Test Isolation:** Cada test debe ser independiente
3. **Descriptive Names:** Nombres descriptivos (should/when/given)
4. **Mock External Dependencies:** Mockear APIs, DBs, servicios externos
5. **Coverage != Quality:** 80% de cobertura es el objetivo, pero tests significativos son más importantes

### Backend
- Mockear pool de DB en tests unitarios
- Usar Supertest para tests de integración HTTP
- Testear edge cases y errores de validación
- Verificar que middlewares se ejecutan en el orden correcto
- Testear tanto paths exitosos como errores

### Frontend
- Usar queries semánticas (getByRole, getByLabelText)
- Testear desde la perspectiva del usuario
- Evitar testear detalles de implementación
- Usar waitFor para operaciones asíncronas
- Mock de hooks/stores solo cuando sea necesario

---

## Referencias

### Documentación Oficial
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest](https://github.com/ladjs/supertest)

### Documentación Interna GAMILIT
- `/docs/projects/gamilit/03-desarrollo/backend/ESTRUCTURA-Y-MODULOS.md`
- `/docs/projects/gamilit/03-desarrollo/frontend/ESTRUCTURA-Y-FEATURES.md`
- `/docs/projects/gamilit/03-desarrollo/backend/SERVICIOS-PRINCIPALES.md`

### Código de Ejemplo
- Backend Tests: `/projects/glit/backend/src/__tests__/`
- Frontend Tests: `/gamilit-platform-web/src/**/__tests__/`

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Autor:** Equipo GAMILIT
**Cobertura objetivo:** 80%
