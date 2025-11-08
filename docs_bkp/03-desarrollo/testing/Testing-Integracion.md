# Testing de Integración y E2E - GAMILIT

**Proyecto:** GAMILIT - Consolidación GAMILIT Platform
**Módulo:** Testing de Integración y End-to-End
**Fecha:** 2025-10-27
**Versión:** 1.0
**Documento RFC:** RFC-0001

---

## Introducción

Esta guía presenta ejemplos prácticos de testing de integración y end-to-end (E2E) para GAMILIT. Los tests de integración validan la interacción entre múltiples componentes del sistema, mientras que los tests E2E validan flujos completos desde la perspectiva del usuario.

El objetivo es garantizar que todas las partes del sistema funcionen correctamente juntas y que los flujos críticos de negocio se comporten como se espera en un entorno lo más cercano posible a producción.

---

## Tipos de Tests de Integración

### 1. Tests de Integración Backend (HTTP)

**Descripción:** Validan endpoints completos incluyendo middlewares, controladores, servicios y base de datos.

**Stack:**
- Supertest para requests HTTP
- Base de datos de test (PostgreSQL)
- Jest como framework

### 2. Tests de Integración Frontend-Backend

**Descripción:** Validan la comunicación entre frontend y backend a través de la API.

**Stack:**
- MSW (Mock Service Worker) para mock de API
- Vitest + React Testing Library
- Simulación de respuestas HTTP reales

### 3. Tests End-to-End (E2E)

**Descripción:** Validan flujos completos del usuario en navegador real.

**Stack:**
- Playwright o Cypress
- Navegadores reales (Chromium, Firefox, WebKit)
- Base de datos de test completa

---

## Tests de Integración Backend

### Ejemplo: POST /api/auth/login - Test de Integración HTTP

**Descripción:** Test completo del endpoint de login incluyendo validación, autenticación y respuesta.

```typescript
import request from 'supertest';
import { createApp } from '@/app';
import { pool } from '@/database/pool';

describe('POST /api/auth/login', () => {
  let app: Express.Application;

  beforeAll(async () => {
    app = createApp();
    // Inicializar base de datos de test
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Limpiar base de datos de test
    await cleanupTestDatabase();
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

  it('should return 401 on invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@glit.com',
        password: 'WrongPassword',
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should return 429 on too many requests (rate limiting)', async () => {
    // Simular múltiples requests rápidos
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@glit.com',
          password: 'Test1234',
        });
    }

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@glit.com',
        password: 'Test1234',
      })
      .expect(429);

    expect(response.body.error.code).toBe('TOO_MANY_REQUESTS');
  });
});
```

**Puntos Clave:**
- Supertest para hacer requests HTTP reales
- Validación de status codes HTTP
- Verificación de estructura de respuesta completa
- Testing de rate limiting y seguridad
- Setup/cleanup de base de datos de test

---

### Ejemplo: Flujo Completo de Ejercicio (Backend)

**Descripción:** Test de integración que valida la creación, obtención y resolución de un ejercicio.

```typescript
import request from 'supertest';
import { createApp } from '@/app';
import { pool } from '@/database/pool';

describe('Exercise Flow Integration', () => {
  let app: Express.Application;
  let authToken: string;
  let exerciseId: string;

  beforeAll(async () => {
    app = createApp();

    // Login para obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teacher@glit.com',
        password: 'Test1234',
      });

    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should create a new exercise', async () => {
    const response = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moduleId: 'mod-123',
        title: 'Test Crucigrama',
        type: 'crucigrama',
        config: {
          size: 10,
          words: ['MAYA', 'AZTECA'],
        },
        xpReward: 100,
        mlCoinsReward: 50,
      })
      .expect(201);

    exerciseId = response.body.data.id;
    expect(response.body.data.title).toBe('Test Crucigrama');
  });

  it('should retrieve the created exercise', async () => {
    const response = await request(app)
      .get(`/api/exercises/${exerciseId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(exerciseId);
    expect(response.body.data.title).toBe('Test Crucigrama');
  });

  it('should submit a solution to the exercise', async () => {
    const response = await request(app)
      .post(`/api/exercises/${exerciseId}/submit`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        solution: {
          words: ['MAYA', 'AZTECA'],
          positions: [[0, 0], [5, 5]],
        },
      })
      .expect(200);

    expect(response.body.data.isCorrect).toBe(true);
    expect(response.body.data.xpEarned).toBe(100);
  });
});
```

**Puntos Clave:**
- Test de flujo completo (CRUD)
- Autenticación con JWT en requests
- Validación de relaciones entre requests
- Estado compartido entre tests del flujo

---

## Tests de Integración Frontend

### Mock Service Worker (MSW) Setup

**Archivo:** `src/test/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock de login
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();

    if (body.email === 'student@glit.com' && body.password === 'Test1234') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: 'student@glit.com',
            fullName: 'Test Student',
            role: 'student',
          },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        },
      },
      { status: 401 }
    );
  }),

  // Mock de exercises
  http.get('/api/exercises/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        title: 'Crucigrama Maya',
        type: 'crucigrama',
        config: { size: 10 },
      },
    });
  }),
];
```

**Archivo:** `src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Archivo:** `src/test/setup.ts` (actualizado)

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// Iniciar MSW antes de todos los tests
beforeAll(() => server.listen());

// Resetear handlers después de cada test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Cerrar MSW después de todos los tests
afterAll(() => server.close());
```

---

### Ejemplo: Test de Integración con API Mock

**Descripción:** Test que valida el flujo completo de login con API mockeada.

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

describe('LoginPage Integration', () => {
  it('should login successfully with valid credentials', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Rellenar formulario
    await user.type(screen.getByLabelText(/email/i), 'student@glit.com');
    await user.type(screen.getByLabelText(/password/i), 'Test1234');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Esperar navegación o mensaje de éxito
    await waitFor(() => {
      expect(screen.getByText(/bienvenido/i)).toBeInTheDocument();
    });
  });

  it('should show error message on invalid credentials', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'wrong@email.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });
});
```

**Puntos Clave:**
- MSW intercepta requests HTTP reales
- Test de flujo completo UI + API
- Validación de estados de éxito y error
- Simulación realista de la experiencia de usuario

---

## Tests End-to-End (E2E)

### Stack Recomendado: Playwright

**Instalación:**

```bash
npm install -D @playwright/test
npx playwright install
```

**Configuración:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Ejemplo: E2E Login Flow

**Archivo:** `e2e/auth/login.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Rellenar formulario
    await page.fill('[name="email"]', 'student@glit.com');
    await page.fill('[name="password"]', 'Test1234');
    await page.click('button[type="submit"]');

    // Esperar navegación al dashboard
    await page.waitForURL('/dashboard');

    // Verificar elementos del dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test Student');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@email.com');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    // Verificar mensaje de error
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Credenciales inválidas');

    // Verificar que no navega
    await expect(page).toHaveURL('/login');
  });

  test('should persist session after refresh', async ({ page }) => {
    await page.goto('/login');

    // Login
    await page.fill('[name="email"]', 'student@glit.com');
    await page.fill('[name="password"]', 'Test1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Recargar página
    await page.reload();

    // Verificar que sigue autenticado
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
  });
});
```

**Puntos Clave:**
- Navegación real en navegador
- Selectores basados en atributos semánticos
- Validación de navegación y URLs
- Testing de persistencia de sesión

---

### Ejemplo: E2E Exercise Flow

**Archivo:** `e2e/education/exercise-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Exercise Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/login');
    await page.fill('[name="email"]', 'student@glit.com');
    await page.fill('[name="password"]', 'Test1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should complete a crossword exercise', async ({ page }) => {
    // Navegar a ejercicios
    await page.click('a[href="/exercises"]');
    await page.waitForURL('/exercises');

    // Seleccionar un ejercicio
    await page.click('[data-testid="exercise-card"]:first-child');
    await expect(page.locator('h1')).toContainText('Crucigrama');

    // Resolver ejercicio
    await page.fill('[data-testid="crossword-input-0"]', 'MAYA');
    await page.fill('[data-testid="crossword-input-1"]', 'AZTECA');

    // Enviar solución
    await page.click('button[type="submit"]');

    // Verificar resultado
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('[data-testid="xp-earned"]')).toContainText('100 XP');
    await expect(page.locator('[data-testid="coins-earned"]')).toContainText('50 ML');
  });

  test('should show progress in user dashboard', async ({ page }) => {
    // Verificar progreso inicial
    const initialXP = await page.locator('[data-testid="user-xp"]').textContent();

    // Completar ejercicio
    await page.click('a[href="/exercises"]');
    await page.click('[data-testid="exercise-card"]:first-child');
    await page.fill('[data-testid="crossword-input-0"]', 'MAYA');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.success-message');

    // Volver al dashboard
    await page.click('a[href="/dashboard"]');

    // Verificar que XP aumentó
    const newXP = await page.locator('[data-testid="user-xp"]').textContent();
    expect(parseInt(newXP!)).toBeGreaterThan(parseInt(initialXP!));
  });
});
```

**Puntos Clave:**
- Setup compartido con beforeEach
- Flujo completo de usuario (navegación + acción + verificación)
- Validación de estado persistente
- Testing de elementos dinámicos

---

## Comandos de Testing

### Backend Integration Tests

```bash
# Ejecutar tests de integración
npm run test:integration

# Con base de datos de test real
TEST_DB_URL=postgresql://test npm run test:integration

# Ejecutar solo tests de API
npm test -- --testPathPattern=integration/api
```

### Frontend Integration Tests

```bash
# Tests con MSW
npm run test

# Tests de integración específicos
npm run test -- --testPathPattern=integration
```

### E2E Tests (Playwright)

```bash
# Ejecutar todos los E2E tests
npx playwright test

# Tests en modo headed (ver navegador)
npx playwright test --headed

# Tests en modo debug
npx playwright test --debug

# Tests en un navegador específico
npx playwright test --project=chromium

# Ver reporte de tests
npx playwright show-report
```

---

## Mejores Prácticas

### Tests de Integración Backend

1. **Base de Datos de Test**
   - Usar una base de datos separada para tests
   - Limpiar y seedear datos antes de cada test suite
   - Usar transacciones para aislar tests

2. **Autenticación**
   - Crear tokens válidos para tests
   - Testear tanto rutas protegidas como públicas
   - Validar roles y permisos

3. **Edge Cases**
   - Testear errores de validación
   - Testear límites de rate limiting
   - Testear casos de concurrencia

### Tests E2E

4. **Selectores Robustos**
   - Preferir data-testid sobre clases CSS
   - Usar roles ARIA cuando sea posible
   - Evitar selectores frágiles (nth-child)

5. **Esperas Inteligentes**
   - Usar waitFor en lugar de sleep
   - Esperar elementos específicos
   - Configurar timeouts apropiados

6. **Datos de Test**
   - Usar datos de seed consistentes
   - Limpiar datos después de cada test
   - Evitar dependencias entre tests

### General

7. **Aislamiento**
   - Cada test debe ser independiente
   - No compartir estado entre tests
   - Usar beforeEach/afterEach apropiadamente

8. **Performance**
   - Minimizar setup costoso
   - Ejecutar en paralelo cuando sea posible
   - Usar mocks para dependencias externas lentas

---

## Referencias

### Documentación Oficial
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [MSW Documentation](https://mswjs.io/docs/)
- [Playwright Documentation](https://playwright.dev/)
- [Cypress Documentation](https://docs.cypress.io/)

### Documentación Interna GAMILIT
- [Testing Backend](./Testing-Backend.md)
- [Testing Frontend](./Testing-Frontend.md)
- [Testing Cobertura](./Testing-Cobertura.md)

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Autor:** Equipo GAMILIT
**RFC:** RFC-0001
