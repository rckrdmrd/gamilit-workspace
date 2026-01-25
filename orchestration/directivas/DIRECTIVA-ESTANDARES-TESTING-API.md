# ESTÁNDARES DE TESTING PARA APIs

**Versión:** 1.0
**Fecha:** 2025-11-23
**Autor:** Architecture-Analyst
**Motivación:** Garantizar que bugs de configuración de rutas API se detecten en fase de testing

---

## PROBLEMA IDENTIFICADO

El bug de duplicación de rutas (`/api/api/`) no fue detectado porque:

1. **Falta de tests de integración** que validen URLs completas
2. **Tests unitarios insuficientes** que no validaban endpoints
3. **Ausencia de tests E2E** que ejecuten requests HTTP reales
4. **Falta de validación en Network tab** durante testing manual
5. **Mocks incorrectos** que ocultaban problemas de configuración

---

## ESTÁNDARES Y MEJORES PRÁCTICAS

### 1. PIRÁMIDE DE TESTING PARA APIs

```
        /\
       /  \        E2E Tests (10%)
      /____\       - Requests HTTP reales
     /      \      - Validación de URLs completas
    /        \     - Flujos end-to-end
   /----------\
  /            \   Integration Tests (30%)
 /              \  - Servicios + API Client
/________________\ - Controladores + Servicios

                   Unit Tests (60%)
                   - Validación de endpoints
                   - Lógica de negocio
                   - DTOs y validaciones
```

---

### 2. UNIT TESTS

#### 2.1. Tests de Servicios (Frontend)

**Archivo de test:** `apps/frontend/web/src/services/healthService.spec.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/lib/apiClient';
import { healthService } from './healthService';

describe('healthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkHealth', () => {
    it('should call correct endpoint without /api prefix', async () => {
      const mockResponse = {
        data: { status: 'ok', timestamp: new Date().toISOString() },
      };

      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(mockResponse);

      await healthService.checkHealth();

      // ✅ CRÍTICO: Validar que endpoint NO incluye /api
      expect(getSpy).toHaveBeenCalledWith('/health');
      expect(getSpy).not.toHaveBeenCalledWith('/api/health');
    });

    it('should return health status', async () => {
      const mockData = { status: 'ok', timestamp: '2025-11-23T00:00:00Z' };
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: mockData });

      const result = await healthService.checkHealth();

      expect(result).toEqual(mockData);
      expect(result.status).toBe('ok');
    });

    it('should handle errors', async () => {
      vi.spyOn(apiClient, 'get').mockRejectedValue(
        new Error('Network error')
      );

      await expect(healthService.checkHealth()).rejects.toThrow();
    });
  });

  describe('checkDatabase', () => {
    it('should call correct endpoint', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: { database: 'connected' },
      });

      await healthService.checkDatabase();

      expect(getSpy).toHaveBeenCalledWith('/health/database');
    });
  });
});
```

#### 2.2. Tests de Servicios con Parámetros

```typescript
describe('userService', () => {
  describe('findById', () => {
    it('should call endpoint with correct ID parameter', async () => {
      const userId = '123';
      const mockUser = { id: userId, name: 'John Doe' };

      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: mockUser,
      });

      await userService.findById(userId);

      // ✅ Validar template literal correcto
      expect(getSpy).toHaveBeenCalledWith(`/users/${userId}`);
      expect(getSpy).not.toHaveBeenCalledWith('/users/123');
    });
  });

  describe('searchUsers', () => {
    it('should call endpoint with query parameters', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: [],
      });

      await userService.searchUsers('john', 2);

      // ✅ Validar que query params se pasan correctamente
      expect(getSpy).toHaveBeenCalledWith('/users', {
        params: { q: 'john', page: 2 },
      });
    });
  });
});
```

#### 2.3. Tests de Controladores (Backend)

**Archivo de test:** `apps/backend/src/modules/health/health.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            checkHealth: jest.fn(),
            checkDatabase: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return health status', async () => {
      const mockResult = { status: 'ok', timestamp: new Date() };
      jest.spyOn(service, 'checkHealth').mockResolvedValue(mockResult);

      const result = await controller.checkHealth();

      expect(result).toEqual(mockResult);
      expect(service.checkHealth).toHaveBeenCalled();
    });
  });

  describe('checkDatabase', () => {
    it('should return database status', async () => {
      const mockResult = { database: 'connected' };
      jest.spyOn(service, 'checkDatabase').mockResolvedValue(mockResult);

      const result = await controller.checkDatabase();

      expect(result).toEqual(mockResult);
    });
  });
});
```

---

### 3. INTEGRATION TESTS

#### 3.1. Tests de Servicios con API Client Real

```typescript
// apps/frontend/web/src/services/__integration__/healthService.integration.spec.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { healthService } from '../healthService';

// Mock server para tests de integración
let mockServer: any;

beforeAll(async () => {
  // Setup mock server (usando MSW o similar)
  mockServer = setupMockServer();
  mockServer.listen();
});

afterAll(() => {
  mockServer.close();
});

describe('healthService Integration Tests', () => {
  it('should make actual HTTP request to correct URL', async () => {
    // Mock de respuesta del servidor
    mockServer.use(
      rest.get('http://localhost:3000/api/health', (req, res, ctx) => {
        return res(ctx.json({ status: 'ok' }));
      })
    );

    const result = await healthService.checkHealth();

    expect(result.status).toBe('ok');
  });

  it('should NOT call /api/api/health', async () => {
    // Este endpoint NO debe ser llamado
    mockServer.use(
      rest.get('http://localhost:3000/api/api/health', (req, res, ctx) => {
        // Si este endpoint es llamado, el test debe fallar
        throw new Error('Invalid endpoint /api/api/health was called');
      })
    );

    // No debe lanzar error
    await expect(healthService.checkHealth()).resolves.toBeDefined();
  });
});
```

#### 3.2. Tests de Controladores (Backend E2E)

**Archivo de test:** `apps/backend/test/health.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // ✅ CRÍTICO: Configurar prefijo global igual que en main.ts
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')  // ✅ Ruta completa con /api
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });

    it('should have correct content-type', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('/api/health/database (GET)', () => {
    it('should return database status', () => {
      return request(app.getHttpServer())
        .get('/api/health/database')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('database');
        });
    });
  });

  describe('Invalid routes', () => {
    it('should NOT respond to /api/api/health', () => {
      // ✅ Validar que ruta duplicada NO existe
      return request(app.getHttpServer())
        .get('/api/api/health')
        .expect(404);
    });

    it('should NOT respond to /health without /api prefix', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(404);
    });
  });
});
```

---

### 4. E2E TESTS

#### 4.1. Tests con Playwright

```typescript
// apps/frontend/web/e2e/health.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Health Check Page', () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar requests para validar URLs
    page.on('request', (request) => {
      const url = request.url();

      // ✅ CRÍTICO: Validar que NO hay /api/api/
      if (url.includes('/api/api/')) {
        throw new Error(`Invalid URL detected: ${url}`);
      }

      console.log(`Request: ${request.method()} ${url}`);
    });

    await page.goto('http://localhost:5173/health');
  });

  test('should load health status', async ({ page }) => {
    // Esperar que el request se complete
    const response = await page.waitForResponse(
      (response) => response.url().includes('/api/health') && response.status() === 200
    );

    expect(response.ok()).toBeTruthy();

    // Validar que la URL es correcta
    expect(response.url()).toBe('http://localhost:3000/api/health');
    expect(response.url()).not.toContain('/api/api/');
  });

  test('should display health status on page', async ({ page }) => {
    await page.waitForSelector('[data-testid="health-status"]');

    const status = await page.textContent('[data-testid="health-status"]');
    expect(status).toBe('ok');
  });

  test('should handle API errors', async ({ page }) => {
    // Mock error response
    await page.route('**/api/health', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('http://localhost:5173/health');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

#### 4.2. Tests con Cypress

```typescript
// cypress/e2e/health.cy.ts

describe('Health Check API', () => {
  beforeEach(() => {
    // Interceptar requests
    cy.intercept('GET', '/api/health').as('healthCheck');
  });

  it('should call correct API endpoint', () => {
    cy.visit('/health');

    cy.wait('@healthCheck').then((interception) => {
      // ✅ Validar URL correcta
      expect(interception.request.url).to.include('/api/health');
      expect(interception.request.url).to.not.include('/api/api/');

      // ✅ Validar respuesta
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('status', 'ok');
    });
  });

  it('should display health status', () => {
    cy.visit('/health');

    cy.get('[data-testid="health-status"]')
      .should('be.visible')
      .and('contain', 'ok');
  });
});
```

---

### 5. NETWORK TAB VALIDATION

#### 5.1. Manual Testing Checklist

**Antes de marcar feature como completa:**

1. **Abrir DevTools**
   ```
   Chrome/Edge: F12 o Ctrl+Shift+I
   Firefox: F12 o Ctrl+Shift+K
   Safari: Cmd+Option+I
   ```

2. **Ir a Network Tab**
   - Activar "Preserve log"
   - Filtrar por "Fetch/XHR"
   - Limpiar logs existentes

3. **Ejecutar la acción que hace el request**
   - Click en botón
   - Navegar a página
   - Hacer submit de form

4. **Validar en Network Tab:**

   ```
   ✅ Checklist de validación:

   Request URL:
   [ ] Debe ser: http://localhost:3000/api/health
   [ ] NO debe ser: http://localhost:3000/api/api/health
   [ ] NO debe ser: http://localhost:3000/health

   Request Method:
   [ ] GET, POST, PUT, DELETE, etc. (correcto para la acción)

   Status Code:
   [ ] 200 OK (para GET exitoso)
   [ ] 201 Created (para POST exitoso)
   [ ] 204 No Content (para DELETE exitoso)
   [ ] NO 404 Not Found
   [ ] NO 500 Internal Server Error

   Request Headers:
   [ ] Content-Type: application/json
   [ ] Authorization: Bearer ... (si requiere auth)

   Response:
   [ ] Body tiene estructura esperada
   [ ] NO hay errores en response
   ```

5. **Tomar Screenshot**
   - Guardar screenshot del Network tab
   - Adjuntar al PR como evidencia

#### 5.2. Automated Network Validation

```typescript
// apps/frontend/web/src/tests/helpers/networkValidator.ts

/**
 * Validates that a URL does not have duplicate /api/ prefixes
 */
export function validateApiUrl(url: string): void {
  if (url.includes('/api/api/')) {
    throw new Error(
      `Invalid API URL detected: ${url}\n` +
      `URL contains duplicate /api/ prefix.\n` +
      `This indicates incorrect endpoint configuration.`
    );
  }

  if (!url.includes('/api/')) {
    console.warn(
      `Warning: URL does not contain /api/ prefix: ${url}\n` +
      `This might be a non-API request or incorrect configuration.`
    );
  }
}

/**
 * Setup global request interceptor for validation
 */
export function setupNetworkValidation(): void {
  const originalFetch = window.fetch;

  window.fetch = function(...args) {
    const url = args[0] as string;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      validateApiUrl(url);
    }

    return originalFetch.apply(this, args);
  };
}

// Usar en tests
beforeAll(() => {
  setupNetworkValidation();
});
```

---

### 6. MOCK SERVER TESTING

#### 6.1. MSW (Mock Service Worker)

```typescript
// apps/frontend/web/src/mocks/handlers.ts

import { rest } from 'msw';

export const handlers = [
  rest.get('http://localhost:3000/api/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      })
    );
  }),

  rest.get('http://localhost:3000/api/health/database', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        database: 'connected',
        tables: 42,
      })
    );
  }),

  // ✅ Handler para detectar requests inválidos
  rest.get('http://localhost:3000/api/api/*', (req, res, ctx) => {
    console.error(`[MSW] Invalid request to /api/api/: ${req.url}`);

    return res(
      ctx.status(404),
      ctx.json({
        error: 'Invalid endpoint',
        message: 'Endpoint contains duplicate /api/ prefix',
      })
    );
  }),
];
```

```typescript
// apps/frontend/web/src/mocks/server.ts

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Setup en tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### 6.2. Tests con MSW

```typescript
// apps/frontend/web/src/services/healthService.msw.spec.ts

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '@/mocks/server';
import { rest } from 'msw';
import { healthService } from './healthService';

describe('healthService with MSW', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should call correct endpoint', async () => {
    const result = await healthService.checkHealth();

    expect(result).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });

  it('should handle server errors', async () => {
    server.use(
      rest.get('http://localhost:3000/api/health', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    await expect(healthService.checkHealth()).rejects.toThrow();
  });

  it('should fail if calling /api/api/health', async () => {
    // Modificar temporalmente el servicio para probar endpoint incorrecto
    const originalGet = apiClient.get;

    apiClient.get = vi.fn().mockImplementation((url) => {
      return originalGet(`/api${url}`);  // Simular bug de duplicación
    });

    await expect(healthService.checkHealth()).rejects.toThrow();

    // Restaurar
    apiClient.get = originalGet;
  });
});
```

---

### 7. COVERAGE REQUIREMENTS

#### 7.1. Minimum Coverage

```yaml
Requisitos mínimos de cobertura:

Unit Tests:
  - Servicios (Frontend): 90%
  - Controladores (Backend): 85%
  - Lógica de negocio: 95%

Integration Tests:
  - Flujos críticos: 80%
  - Endpoints principales: 100%

E2E Tests:
  - User flows críticos: 100%
  - Happy paths: 100%
  - Error handling: 70%
```

#### 7.2. Coverage Configuration

```typescript
// vitest.config.ts (Frontend)

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/mocks/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

```json
// jest.config.js (Backend)

module.exports = {
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
  ],
};
```

---

## CHECKLIST DE VALIDACIÓN

### Pre-Commit Checklist (Developer)

- [ ] Unit tests escritos y pasando
- [ ] Integration tests para endpoints críticos
- [ ] Tests validan endpoints correctos (sin `/api` en services)
- [ ] Coverage mínimo alcanzado
- [ ] Probado en Network tab del navegador
- [ ] No hay errores en consola
- [ ] Todos los tests pasan localmente

### Pre-Merge Checklist (Reviewer)

- [ ] Revisar que tests existen para nuevos endpoints
- [ ] Revisar que tests validan URLs correctas
- [ ] Revisar que hay tests E2E si es feature crítica
- [ ] Ejecutar tests localmente
- [ ] Validar coverage report
- [ ] Probar manualmente en navegador

### Pre-Deploy Checklist (QA)

- [ ] Smoke tests en staging
- [ ] Validar endpoints en Network tab
- [ ] Tests E2E en staging
- [ ] Performance tests
- [ ] Security tests
- [ ] Regression tests

---

## HERRAMIENTAS DE AUTOMATIZACIÓN

### 1. CI/CD Pipeline

```yaml
# .github/workflows/test.yml

name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Install dependencies
        run: npm install

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Check coverage
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage-final.json
```

### 2. Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running tests before commit..."

# Run unit tests
npm run test:unit

if [ $? -ne 0 ]; then
  echo "Unit tests failed. Commit aborted."
  exit 1
fi

# Run linter
npm run lint

if [ $? -ne 0 ]; then
  echo "Linter failed. Commit aborted."
  exit 1
fi

echo "Tests passed. Proceeding with commit."
```

---

## REFERENCIAS

- [ESTANDARES-API-ROUTES.md](./ESTANDARES-API-ROUTES.md) - Estándares de rutas API
- [CHECKLIST-CODE-REVIEW-API.md](./CHECKLIST-CODE-REVIEW-API.md) - Checklist de code review
- [PITFALLS-API-ROUTES.md](./PITFALLS-API-ROUTES.md) - Errores comunes
- [Vitest Documentation](https://vitest.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)

---

**Uso:** Referencia obligatoria para escribir tests de APIs
**Validación:** Obligatoria antes de merge y deploy
**Actualización:** Mantener sincronizado con cambios en arquitectura
