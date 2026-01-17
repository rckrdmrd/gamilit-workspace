# Plan de Correccion de Tests - CAPVED Fase P

**Task ID:** TASK-2026-01-17-002
**Fecha:** 2026-01-17
**Fase:** Planeacion (P)

---

## Resumen del Plan

| Semana | Prioridad | Subtareas | Tests a Corregir | SP |
|--------|-----------|-----------|------------------|-----|
| 1 | P0 | 3 | ~470 | 8 |
| 2 | P1 | 4 | ~285 | 8 |
| 3 | P2 | 1 | ~30 | 5 |
| **Total** | | **8** | **785** | **21** |

---

## Subtareas Detalladas

### SUBTASK-001: Completar Repository Mocks Backend (P0)
**Prioridad:** P0 (Bloqueante)
**SP:** 3
**Archivo Principal:** `apps/backend/src/__mocks__/repositories.mock.ts`

#### Objetivo
Agregar mocks faltantes para entities que fueron agregadas recientemente.

#### Tareas
- [ ] Agregar `createMockMayaRankRepository()`
- [ ] Agregar `createMockMissionProgressRepository()`
- [ ] Agregar `createMockExerciseRepository()`
- [ ] Agregar `createMockModuleRepository()`
- [ ] Actualizar exports en index

#### Criterios de Aceptacion
```gherkin
DADO que ejecuto tests de gamification
CUANDO uso createMockRepository para MayaRank
ENTONCES no hay errores de "repository not found"
Y los tests que dependen de MayaRank pasan
```

#### Archivos a Modificar
- `apps/backend/src/__mocks__/repositories.mock.ts`
- `apps/backend/src/__mocks__/index.ts`

---

### SUBTASK-002: Refactorizar Test Modules Backend (P0)
**Prioridad:** P0 (Bloqueante)
**SP:** 3
**Modulos:** auth, gamification, progress

#### Objetivo
Actualizar beforeEach() de cada test suite para incluir todas las dependencias.

#### Tareas
- [ ] Fix `auth.service.spec.ts` - Agregar ProfileRepository, SessionRepository
- [ ] Fix `auth.controller.spec.ts` - Agregar Guards, Interceptors mocks
- [ ] Fix `ml-coins.service.spec.ts` - Agregar MayaRankRepository
- [ ] Fix `module-progress.service.spec.ts` - Agregar ExerciseRepository
- [ ] Fix `exercise-submission.service.spec.ts` - Agregar ValidatorService

#### Patron a Seguir
```typescript
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ServiceUnderTest,
      { provide: getRepositoryToken(Entity1, 'connection'), useValue: createMockRepository() },
      { provide: getRepositoryToken(Entity2, 'connection'), useValue: createMockRepository() },
      // ... todas las dependencias
    ],
  }).compile();
});
```

#### Criterios de Aceptacion
- 12 test suites compilan sin errores de dependencias
- Tests de auth pasan al 85%+
- Tests de gamification pasan al 80%+

---

### SUBTASK-003: Fix Auth State Mock Frontend (P0)
**Prioridad:** P0 (Bloqueante)
**SP:** 2
**Archivo Principal:** `apps/frontend/src/test/setup.ts`

#### Objetivo
Asegurar que todos los tests tengan acceso a un usuario autenticado mock.

#### Tareas
- [ ] Actualizar mock de useAuthStore en setup.ts
- [ ] Crear helper `mockAuthenticatedUser()`
- [ ] Actualizar economyStore.test.ts
- [ ] Actualizar ranksStore.test.ts
- [ ] Actualizar achievementsStore.test.ts

#### Solucion Propuesta
```typescript
// setup.ts
vi.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      isAuthenticated: true,
      token: 'mock-token',
    })),
    subscribe: vi.fn(),
  },
}));
```

#### Criterios de Aceptacion
- Ningun test falla con "User not authenticated"
- 150 tests adicionales pasan

---

### SUBTASK-004: Fix TypeORM Compatibility (P1)
**Prioridad:** P1 (Alta)
**SP:** 2
**Modulos:** admin, content

#### Objetivo
Resolver error de path-scurry con TypeORM en Node 20+.

#### Opciones
1. Mock DataSource completamente
2. Update TypeORM a version compatible
3. Downgrade Node version en tests

#### Solucion Recomendada: Mock DataSource
```typescript
// __mocks__/typeorm.mock.ts
export const mockDataSource = {
  createQueryRunner: jest.fn(() => ({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: mockEntityManager,
  })),
  getRepository: jest.fn(),
};
```

#### Archivos a Modificar
- `apps/backend/src/__mocks__/typeorm.mock.ts` (nuevo)
- `apps/backend/src/modules/admin/__tests__/admin-reports.service.spec.ts`
- `apps/backend/src/modules/content/services/__tests__/content-categories.service.spec.ts`

#### Criterios de Aceptacion
- Tests de admin-reports pasan
- Tests de content-categories pasan
- No errores de "Cannot read 'native'"

---

### SUBTASK-005: Update API Mocks Frontend (P1)
**Prioridad:** P1 (Alta)
**SP:** 2
**Modulos:** api tests

#### Objetivo
Sincronizar mocks de API con respuestas actuales del backend.

#### Tareas
- [ ] Fix apiConfig.test.ts - Actualizar formato de rutas esperado
- [ ] Fix adminAPI.test.ts - Actualizar transformaciones
- [ ] Fix ForgotPasswordPage.test.tsx - Mock de authAPI
- [ ] Crear helper `mockAPIResponse<T>(data: T)`

#### Criterios de Aceptacion
- 80 tests de API pasan
- Tests de endpoint format pasan

---

### SUBTASK-006: Update Assertion Tests Backend (P1)
**Prioridad:** P1 (Alta)
**SP:** 2
**Modulos:** auth, progress, teacher

#### Objetivo
Actualizar assertions que no coinciden con la implementacion actual.

#### Tareas
- [ ] Review auth.service register flow
- [ ] Review module-progress assertions
- [ ] Review teacher-classrooms controller
- [ ] Update expected values en cada test

#### Patron
```typescript
// Antes (incorrecto)
expect(result.password).toBeDefined();

// Despues (correcto - password no se retorna)
expect(result.password).toBeUndefined();
expect(result.id).toBeDefined();
```

#### Criterios de Aceptacion
- Tests de auth pasan al 90%+
- Tests de progress pasan al 85%+

---

### SUBTASK-007: Fix Component Rendering Tests (P1)
**Prioridad:** P1 (Alta)
**SP:** 2
**Componentes:** RegisterForm, ForgotPasswordPage

#### Objetivo
Sincronizar tests con implementation actual de componentes.

#### Tareas
- [ ] Analizar RegisterForm.tsx actual
- [ ] Actualizar RegisterForm.test.tsx
- [ ] Analizar ForgotPasswordPage.tsx actual
- [ ] Actualizar ForgotPasswordPage.test.tsx

#### Criterios de Aceptacion
- Tests de RegisterForm pasan (29 tests)
- Tests de ForgotPasswordPage pasan (20 tests)

---

### SUBTASK-008: Fix Memory Issues Jest (P2)
**Prioridad:** P2 (Baja)
**SP:** 5
**Config:** jest.config.js

#### Objetivo
Resolver Jest worker out of memory.

#### Opciones
1. Limitar workers: `--maxWorkers=2`
2. Aumentar heap: `--max-old-space-size=4096`
3. Optimizar tests pesados
4. Ejecutar suites grandes en aislamiento

#### Solucion Recomendada
```javascript
// jest.config.js
module.exports = {
  // ... existing config
  maxWorkers: 2,
  workerIdleMemoryLimit: '512MB',
};
```

#### Criterios de Aceptacion
- No memory crashes durante test run
- Todos los tests se ejecutan

---

## Cronograma Detallado

### Semana 1 (P0 - Bloqueantes)

| Dia | Subtask | Horas | Entregable |
|-----|---------|-------|------------|
| 1 | SUBTASK-001 | 4h | repositories.mock.ts actualizado |
| 2 | SUBTASK-002 (1/2) | 6h | auth, gamification tests |
| 3 | SUBTASK-002 (2/2) | 4h | progress tests |
| 4 | SUBTASK-003 | 4h | Frontend auth mock |
| 5 | Buffer + Validacion | 2h | Run all tests, document |

**Meta Semana 1:** 470 tests adicionales pasando

### Semana 2 (P1 - Importantes)

| Dia | Subtask | Horas | Entregable |
|-----|---------|-------|------------|
| 1 | SUBTASK-004 | 4h | TypeORM mock |
| 2 | SUBTASK-005 | 4h | API mocks |
| 3 | SUBTASK-006 | 4h | Backend assertions |
| 4 | SUBTASK-007 | 4h | Component tests |
| 5 | Buffer + Validacion | 2h | Run all tests, document |

**Meta Semana 2:** 285 tests adicionales pasando

### Semana 3 (P2 - Optimizacion)

| Dia | Subtask | Horas | Entregable |
|-----|---------|-------|------------|
| 1-2 | SUBTASK-008 | 6h | Jest config optimizado |
| 3-5 | Cleanup + CI | 6h | CI green, documentation |

**Meta Semana 3:** 30 tests adicionales, CI estable

---

## Validacion de Alineacion (CAPVED-V)

**Fecha de Validacion:** 2026-01-17

### Configuracion Verificada

| Archivo | Ubicacion | Threshold Actual | Objetivo Plan |
|---------|-----------|-----------------|---------------|
| jest.config.js | apps/backend/ | 30% | 85%+ tests passing |
| vitest.config.ts | apps/frontend/ | 60% | 90%+ tests passing |
| setup.ts (BE) | apps/backend/src/__tests__/ | Basico | Extender con auth mock |
| setup.ts (FE) | apps/frontend/src/test/ | Sin auth mock | Agregar auth mock |
| repositories.mock.ts | apps/backend/src/__mocks__/ | Generic createMockRepository | OK - usar existente |

### Mocks Existentes Validados

| Mock | Estado | Accion |
|------|--------|--------|
| createMockRepository<T>() | Funcional | Usar para todos los repos |
| createMockQueryBuilder<T>() | Funcional | Usar para queries complejas |
| localStorage/sessionStorage | Frontend OK | - |
| matchMedia/ResizeObserver | Frontend OK | - |
| Auth store mock | NO EXISTE | Crear en SUBTASK-003 |

---

## Criterios de Aceptacion del Plan

### Gate de Completitud (CAPVED-V) - COMPLETADO

- [x] Cada subtarea tiene criterios claros
- [x] Dependencias identificadas
- [x] Archivos a modificar listados
- [x] Estimaciones razonables
- [x] Alineado con configuracion existente (jest.config.js, vitest.config.ts)

### Gate de Cierre (CAPVED-D) - PENDIENTE

- [ ] Tests pasan al 85%+ backend (actual: 64%)
- [ ] Tests pasan al 90%+ frontend (actual: 76%)
- [ ] CI configurado y verde
- [ ] Inventarios actualizados
- [ ] Documentacion de testing actualizada

---

**Generado por:** Claude-Agent
**Fecha:** 2026-01-17
**Fase CAPVED:** Validacion (V) - Completada
**Siguiente Fase:** Ejecucion (E) - Pendiente aprobacion
