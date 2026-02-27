---
titulo: Guia de Coverage Testing
tipo: guia
dominio: testing
ultima_actualizacion: 2026-02-27
---

# Guia de Coverage Testing — gamilit

**Version:** 1.0.0
**Fecha:** 2026-02-13
**Objetivo:** Alcanzar 80% de cobertura de tests
**Estado actual:** ~50% backend (threshold), frontend sin medicion formal

---

## Estado Actual de Testing

### Backend (Jest + ts-jest)

| Metrica | Valor |
|---------|-------|
| Spec files | 63 |
| Tests passing | 2324 (2296 passed + 28 skipped) |
| Coverage threshold actual | 50% (branches, functions, lines, statements) |
| Coverage objetivo | 80% |
| Test runner | Jest con ts-jest |
| Config | `apps/backend/jest.config.js` |

### Frontend (Vitest)

| Metrica | Valor |
|---------|-------|
| Test files | 46 |
| Test runner | Vitest |
| Config | `apps/frontend/vitest.config.ts` |
| Coverage | Sin threshold configurado |
| Coverage objetivo | 80% |

### Tests de Integracion (Backend — Jest)

| Metrica | Valor |
|---------|-------|
| Archivos | 5 en `apps/backend/test/integration/` |
| Distribucion | 3 auth + 2 gamification |
| Test runner | Jest con config separada |
| Config | `apps/backend/jest.integration.config.js` |
| Script | `npm run test:integration` |
| Comportamiento | Graceful skip cuando no hay base de datos disponible |

Los tests de integracion usan una base de datos real (PostgreSQL) y son separados de los unit tests para no bloquear el CI cuando la BD no esta disponible. Para ejecutarlos:

```bash
cd apps/backend
npm run test:integration
```

---

## Estrategia de Cobertura

### Prioridad por Capa

```
1. SERVICES (alta prioridad)
   - Logica de negocio critica
   - 172 services, ~30% cubiertos
   - ROI mas alto: 1 test = 1 regla de negocio validada

2. CONTROLLERS (media prioridad)
   - Validacion de DTOs, guards, rutas
   - 108 controllers
   - Tests de integracion ligeros

3. GUARDS / INTERCEPTORS (alta prioridad)
   - Cross-cutting concerns de seguridad
   - 15 guards, 6 interceptors
   - Impacto global: 1 bug aqui = toda la app afectada

4. ENTITIES (baja prioridad)
   - Validacion de relaciones y transformers
   - 156 entity files (157 classes)
   - La mayoria se valida indirectamente via services

5. FRONTEND COMPONENTS (media prioridad)
   - Componentes criticos: auth, exercises, gamification
   - 575 componentes, 46 tests actuales (~10%)
   - Priorizar: formularios, integracion API, estado
```

### Modulos Prioritarios (Backend)

| Modulo | Services | Specs Actuales | Gap | Prioridad |
|--------|----------|---------------|-----|-----------|
| auth | 8 | 5 | 3 | P0 — Seguridad |
| progress | 12 | 5 | 7 | P0 — Core educativo |
| gamification | 15 | 6 | 9 | P1 — Core gamification |
| educational | 10 | 1 | 9 | P1 — Core educativo |
| admin | 12 | 16 | 0 | OK — Bien cubierto |
| teacher | 8 | 3 | 5 | P1 — Portal maestro |
| social | 6 | 1 | 5 | P2 |
| content | 5 | 2 | 3 | P2 |
| notifications | 4 | 2 | 2 | P2 |
| assignments | 3 | 1 | 2 | P2 |

---

## Configuracion Jest (Backend)

### Archivo: `apps/backend/jest.config.js`

```javascript
// Configuracion actual (resumida)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.spec.ts', '**/*.spec.ts'],
  maxWorkers: 1,                    // Serializado por memoria WSL2
  workerIdleMemoryLimit: '512MB',
  cache: false,                     // Deshabilitado por memoria
  coverageThreshold: {
    global: {
      branches: 50,                 // TODO: Subir a 80 gradualmente
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/*.spec.ts'
  ]
};
```

### Plan de Subida Gradual del Threshold

```yaml
fase_1: # Actual
  threshold: 50%
  cuando: "Ahora"

fase_2:
  threshold: 70%
  cuando: "Al alcanzar 70% real en CI"
  accion: "Actualizar coverageThreshold a 70"

fase_3:
  threshold: 70%
  cuando: "Al alcanzar 70% real en CI"
  accion: "Actualizar coverageThreshold a 70"

fase_4: # Objetivo
  threshold: 80%
  cuando: "Meta final MVP"
  accion: "Actualizar coverageThreshold a 80"
```

---

## Patrones de Testing

### 1. Service Test (Backend)

```typescript
// apps/backend/src/modules/{module}/__tests__/{service}.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MyService } from '../my.service';
import { MyEntity } from '../entities/my.entity';

describe('MyService', () => {
  let service: MyService;
  let repository: jest.Mocked<any>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: getRepositoryToken(MyEntity, 'datasource_name'),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    repository = module.get(getRepositoryToken(MyEntity, 'datasource_name'));
  });

  describe('findAll', () => {
    it('should return array of entities', async () => {
      const expected = [{ id: '1', name: 'test' }];
      repository.find.mockResolvedValue(expected);

      const result = await service.findAll();

      expect(result).toEqual(expected);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return entity by id', async () => {
      const expected = { id: '1', name: 'test' };
      repository.findOne.mockResolvedValue(expected);

      const result = await service.findOne('1');

      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow();
    });
  });
});
```

### 2. Controller Test (Backend)

```typescript
// apps/backend/src/modules/{module}/__tests__/{controller}.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { MyController } from '../my.controller';
import { MyService } from '../my.service';

describe('MyController', () => {
  let controller: MyController;
  let service: jest.Mocked<MyService>;

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyController],
      providers: [{ provide: MyService, useValue: mockService }],
    }).compile();

    controller = module.get<MyController>(MyController);
    service = module.get(MyService) as jest.Mocked<MyService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /resource', () => {
    it('should return array', async () => {
      service.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });
});
```

### 3. Component Test (Frontend — Vitest + Testing Library)

```typescript
// apps/frontend/src/{path}/__tests__/MyComponent.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MyComponent } from '../MyComponent';

// Mock API calls
vi.mock('@/services/api/myAPI', () => ({
  getData: vi.fn().mockResolvedValue({ items: [] }),
}));

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    render(<MyComponent loading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### 4. Hook Test (Frontend)

```typescript
// apps/frontend/src/{path}/__tests__/useMyHook.test.ts

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('updates state on action', async () => {
    const { result } = renderHook(() => useMyHook());
    await act(async () => {
      await result.current.fetchData();
    });
    expect(result.current.data).toBeDefined();
  });
});
```

### 5. Store Test (Frontend — Zustand)

```typescript
// apps/frontend/src/{path}/__tests__/myStore.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { useMyStore } from '../myStore';

describe('useMyStore', () => {
  beforeEach(() => {
    useMyStore.setState(useMyStore.getInitialState());
  });

  it('has correct initial state', () => {
    const state = useMyStore.getState();
    expect(state.items).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('adds item correctly', () => {
    useMyStore.getState().addItem({ id: '1', name: 'test' });
    expect(useMyStore.getState().items).toHaveLength(1);
  });
});
```

---

## Comandos

### Ejecutar Tests

```bash
# Backend — todos los tests
cd apps/backend && npm run test

# Backend — un modulo especifico
cd apps/backend && npx jest --testPathPattern="modules/auth"

# Backend — con coverage
cd apps/backend && npx jest --coverage

# Backend — un archivo especifico
cd apps/backend && npx jest src/modules/auth/__tests__/auth.service.spec.ts

# Frontend — todos los tests
cd apps/frontend && npx vitest run

# Frontend — con coverage
cd apps/frontend && npx vitest run --coverage

# Frontend — watch mode
cd apps/frontend && npx vitest
```

### Ver Reporte de Coverage

```bash
# Backend — generar reporte HTML
cd apps/backend && npx jest --coverage
# Abrir: apps/backend/coverage/index.html

# Frontend
cd apps/frontend && npx vitest run --coverage
# Abrir: apps/frontend/coverage/index.html
```

---

## Convenciones

### Ubicacion de Tests

```
Backend:
  apps/backend/src/modules/{module}/__tests__/
  apps/backend/src/modules/{module}/services/__tests__/
  apps/backend/src/modules/{module}/controllers/__tests__/

Frontend:
  apps/frontend/src/{feature}/__tests__/
  apps/frontend/src/{feature}/components/__tests__/
  apps/frontend/src/{feature}/hooks/__tests__/
  apps/frontend/src/{feature}/store/__tests__/
  apps/frontend/src/shared/components/__tests__/
```

### Naming

```
Backend:  {nombre}.service.spec.ts, {nombre}.controller.spec.ts
Frontend: {Nombre}.test.tsx, use{Hook}.test.ts, {store}Store.test.ts
```

### Que Testear (Prioridad)

```yaml
SIEMPRE testear:
  - Logica de negocio en services
  - Validacion de DTOs (campos obligatorios, formatos)
  - Guards de autenticacion/autorizacion
  - Calculos (XP, rangos, coins)
  - Edge cases (null, empty, limites)

TESTEAR cuando sea critico:
  - Formularios con validacion compleja
  - Componentes con logica condicional
  - Hooks con efectos secundarios
  - Stores con logica de transformacion

NO testear (bajo ROI):
  - Componentes puramente presentacionales
  - Re-exports y barrel files
  - Tipos e interfaces TypeScript
  - Configuracion estatica
```

---

## Metricas de Referencia

| Metrica | Actual | Objetivo Fase 2 | Objetivo Final |
|---------|--------|-----------------|---------------|
| BE Spec Files | 63 | 90 | 120+ |
| BE Tests Passing | 2324 (2296 + 28 skipped) | 2,800 | 3,500+ |
| BE Coverage | ~50% | 70% | 80% |
| FE Test Files | 46 | 70 | 100+ |
| FE Coverage | N/A | 40% | 80% |

---

## Referencias

- Jest config: `apps/backend/jest.config.js`
- Vitest config: `apps/frontend/vitest.config.ts`
- Setup file: `apps/backend/src/__tests__/setup.ts`
- SIMCO-TESTING: `orchestration/directivas/simco/SIMCO-TESTING.md`
- Patron Testing: `orchestration/patrones/PATRON-TESTING.md`

---

**Version:** 1.0.0 | **Mantenido por:** Testing-Agent
