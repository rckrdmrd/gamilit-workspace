# Plan de Testing - Student Portal GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Autor:** QA-Agent
**Estado:** ACTIVO
**GAP Relacionado:** GAP-SP-006

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| **Total archivos fuente** | 907 |
| **Total tests existentes** | 47 |
| **Coverage actual estimado** | ~5.2% (por archivos) |
| **Coverage objetivo intermedio** | 25% |
| **Coverage objetivo final** | 40% |
| **Hooks criticos sin tests** | 10 |
| **APIs criticas sin tests** | 5+ |

---

## 1. Estado Actual

### 1.0 Desglose por Area

| Area | Archivos Fuente | Tests Existentes | Coverage |
|------|-----------------|------------------|----------|
| apps/student | 85 | 4 | 4.7% |
| features/ | 369 | 28 | 7.6% |
| shared/components | ~50 | 14 | 28% |
| services/api | ~15 | 2 | 13.3% |

### 1.1 Tests Existentes (47 archivos)

#### Tests de Paginas (4)
| Archivo | Tipo | Proposito |
|---------|------|-----------|
| `apps/student/pages/__tests__/EmailVerificationPage.test.tsx` | Unit | Verificacion de email |
| `apps/student/pages/__tests__/LoginPage.test.tsx` | Unit | Inicio de sesion |
| `apps/student/pages/__tests__/RegisterPage.test.tsx` | Unit | Registro |
| `pages/auth/__tests__/ForgotPasswordPage.test.tsx` | Unit | Recuperar contrasena |

#### Tests de Hooks (8)
| Archivo | Tipo | Proposito |
|---------|------|-----------|
| `features/exercises/hooks/__tests__/useExerciseSubmission.test.ts` | Unit | Envio de ejercicios |
| `features/exercises/hooks/__tests__/useExerciseRewards.test.ts` | Unit | Recompensas |
| `features/exercises/hooks/__tests__/useExerciseTimer.test.ts` | Unit | Temporizador |
| `shared/hooks/__tests__/usePersistedFilters.test.ts` | Unit | Filtros persistentes |
| `apps/admin/hooks/__tests__/useAnalytics.test.ts` | Unit | Analytics admin |
| `apps/admin/hooks/__tests__/useAdminDashboard-CORR-004.test.ts` | Unit | Dashboard admin |

#### Tests de Stores (6)
| Archivo | Tipo | Proposito |
|---------|------|-----------|
| `features/auth/__tests__/authStore.test.ts` | Unit | Estado de autenticacion |
| `features/gamification/social/store/__tests__/achievementsStore.test.ts` | Unit | Logros |
| `features/gamification/ranks/store/__tests__/ranksStore.test.ts` | Unit | Rangos |
| `features/gamification/economy/store/__tests__/economyStore.test.ts` | Unit | Economia ML Coins |
| `features/missions/store/__tests__/missionsStore.test.ts` | Unit | Misiones |

#### Tests de Componentes (16)
| Archivo | Tipo | Proposito |
|---------|------|-----------|
| `shared/components/__tests__/Button.test.tsx` | Unit | Boton base |
| `shared/components/__tests__/Input.test.tsx` | Unit | Input base |
| `shared/components/__tests__/Modal.test.tsx` | Unit | Modal base |
| `shared/components/__tests__/Card.test.tsx` | Unit | Card base |
| `shared/components/__tests__/ErrorBoundary.test.tsx` | Unit | Error boundary |
| `shared/components/__tests__/Avatar.test.tsx` | Unit | Avatar |
| `shared/components/__tests__/Footer.test.tsx` | Unit | Footer |
| `shared/components/__tests__/Skeleton.test.tsx` | Unit | Skeleton loader |
| `shared/components/__tests__/LoadingSpinner.test.tsx` | Unit | Spinner de carga |
| `shared/components/__tests__/Header.test.tsx` | Unit | Header |
| `shared/components/__tests__/Sidebar.test.tsx` | Unit | Sidebar |
| `shared/components/__tests__/ProtectedRoute.test.tsx` | Unit | Ruta protegida |
| `shared/components/__tests__/AvatarUpload.test.tsx` | Unit | Carga de avatar |
| `shared/components/base/__tests__/RankBadge.test.tsx` | Unit | Badge de rango |
| `shared/components/base/__tests__/ProgressBar.test.tsx` | Unit | Barra de progreso |
| `apps/student/components/dashboard/__tests__/MLCoinsWidget.test.tsx` | Unit | Widget ML Coins |

#### Tests de Integracion (10)
| Archivo | Tipo | Proposito |
|---------|------|-----------|
| `features/gamification/__tests__/DashboardIntegration.test.tsx` | Integration | Dashboard gamificacion |
| `features/gamification/social/__tests__/AchievementsIntegration.test.tsx` | Integration | Logros |
| `features/gamification/social/__tests__/FriendsIntegration.test.tsx` | Integration | Amigos |
| `features/gamification/social/__tests__/GuildsIntegration.test.tsx` | Integration | Gremios |
| `features/gamification/social/__tests__/LeaderboardsIntegration.test.tsx` | Integration | Leaderboards |
| `features/gamification/social/__tests__/PowerUpsIntegration.test.tsx` | Integration | Power-ups |
| `features/gamification/ranks/__tests__/RanksIntegration.test.tsx` | Integration | Rangos |
| `features/gamification/economy/__tests__/EconomyIntegration.test.tsx` | Integration | Economia |
| `features/notifications/__tests__/NotificationsIntegration.test.tsx` | Integration | Notificaciones |
| `features/gamification/leaderboard/LiveLeaderboard.test.tsx` | Integration | Leaderboard en vivo |

#### Tests de API Services (3)
| Archivo | Tipo | Proposito |
|---------|------|-----------|
| `services/api/__tests__/apiConfig.test.ts` | Unit | Configuracion API |
| `services/api/__tests__/adminAPI.test.ts` | Unit | API Admin |
| `features/auth/components/__tests__/LoginForm.test.tsx` | Unit | Formulario login |

### 1.2 Areas Sin Coverage

#### Hooks Criticos Sin Tests (Prioridad P0)
| Hook | Ubicacion | Razon de Criticidad |
|------|-----------|---------------------|
| `useDashboardData` | `apps/student/hooks/` | Hook principal del dashboard, maneja 5 endpoints |
| `useExerciseAutoSave` | `apps/student/hooks/` | Auto-guardado de progreso, evita perdida de datos |
| `useUserGamification` | `shared/hooks/` | Datos de gamificacion del usuario |
| `useUserModules` | `apps/student/hooks/` | Modulos del usuario |
| `useGamificationData` | `apps/student/hooks/` | Datos consolidados de gamificacion |
| `useExercisePowerUps` | `apps/student/hooks/` | Sistema de power-ups en ejercicios |
| `useExerciseState` | `apps/student/hooks/` | Estado de ejercicios |

#### APIs Criticas Sin Tests (Prioridad P0)
| API | Ubicacion | Razon de Criticidad |
|-----|-----------|---------------------|
| `gamification.api.ts` | `lib/api/` | API principal de gamificacion |
| `educationalAPI.ts` | `services/api/` | API educativa con modulos y ejercicios |
| `progressAPI.ts` | `features/progress/api/` | API de progreso con auto-save |
| `missionsAPI.ts` | `services/api/` | API de misiones |

#### Paginas Sin Tests (Prioridad P1)
| Pagina | Ruta | Razon |
|--------|------|-------|
| `DashboardComplete` | `/dashboard` | Pagina principal del estudiante |
| `ExercisePage` | `/exercises/:id` | Resolucion de ejercicios |
| `MissionsPage` | `/missions` | Misiones diarias/semanales |
| `GamificationPage` | `/gamification` | Dashboard de gamificacion |
| `ProfilePage` | `/profile` | Perfil del estudiante |
| `SettingsPage` | `/settings` | Configuracion |
| `ModuleDetailPage` | `/modules/:id` | Detalle de modulo |

#### Stores Sin Tests (Prioridad P1)
| Store | Ubicacion | Razon |
|-------|-----------|-------|
| `leaderboardsStore` | `features/gamification/social/store/` | Rankings |
| `newLeaderboardsStore` | `features/gamification/social/store/` | Nueva implementacion |
| `friendsStore` | `features/gamification/social/store/` | Amigos |
| `guildsStore` | `features/gamification/social/store/` | Gremios |
| `powerUpsStore` | `features/gamification/social/store/` | Power-ups |

---

## 2. Priorizacion de Tests

### 2.1 P0 - Critico (Sprint 1) - Meta: +8% coverage

**Objetivo:** Cubrir hooks y APIs criticos que afectan funcionalidad core.

| Componente/Hook | Razon | Esfuerzo Est. | LOC Estimadas |
|-----------------|-------|---------------|---------------|
| `useDashboardData` | Hook central del dashboard, maneja 5 endpoints en paralelo | 4h | ~150 |
| `useExerciseAutoSave` | Previene perdida de progreso, logica compleja de debounce | 3h | ~120 |
| `gamification.api.ts` | 12 metodos, transformers de datos, manejo de errores | 4h | ~200 |
| `educationalAPI.ts` | 20+ funciones, transformers, mock data | 5h | ~250 |
| `progressAPI.ts` | Auto-save, recuperacion de progreso | 2h | ~80 |

**Total Fase P0:** 18h, ~800 LOC de tests

### 2.2 P1 - Alto (Sprint 2) - Meta: +9% coverage

**Objetivo:** Cubrir hooks adicionales del Student Portal y paginas criticas.

| Componente/Hook | Razon | Esfuerzo Est. | LOC Estimadas |
|-----------------|-------|---------------|---------------|
| `useUserGamification` | Datos de gamificacion del usuario | 2h | ~80 |
| `useUserModules` | Modulos asignados al usuario | 2h | ~80 |
| `useExercisePowerUps` | Sistema de power-ups | 2h | ~100 |
| `useGamificationData` | Datos consolidados | 2h | ~80 |
| `DashboardComplete` | Pagina principal - integration test | 4h | ~150 |
| `ExercisePage` | Pagina de ejercicios - integration test | 4h | ~150 |
| `missionsAPI.ts` | API de misiones | 2h | ~80 |

**Total Fase P1:** 18h, ~720 LOC de tests

### 2.3 P2 - Medio (Sprint 3) - Meta: +10% coverage

**Objetivo:** Completar cobertura de stores y paginas adicionales.

| Componente/Hook | Razon | Esfuerzo Est. | LOC Estimadas |
|-----------------|-------|---------------|---------------|
| `leaderboardsStore` | Estado de rankings | 2h | ~80 |
| `friendsStore` | Estado de amigos | 2h | ~80 |
| `guildsStore` | Estado de gremios | 2h | ~80 |
| `powerUpsStore` | Estado de power-ups | 2h | ~80 |
| `MissionsPage` | Pagina de misiones | 3h | ~120 |
| `GamificationPage` | Dashboard gamificacion | 3h | ~120 |
| `ProfilePage` | Perfil del usuario | 2h | ~80 |
| `SettingsPage` | Configuracion | 2h | ~80 |

**Total Fase P2:** 18h, ~720 LOC de tests

---

## 3. Estrategia de Testing

### 3.1 Unit Tests

**Framework:** Vitest + React Testing Library

**Convenciones (basadas en tests existentes):**
```typescript
// Estructura de test estandar
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

describe('NombreDelHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Inicializacion', () => {
    it('should initialize with correct default state', () => {
      // Arrange, Act, Assert
    });
  });

  describe('Funcionalidad Principal', () => {
    it('should handle success case', async () => {
      // Arrange
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });
      // Act
      // Assert
    });

    it('should handle error case', async () => {
      // ...
    });
  });
});
```

**Targets:**
- Hooks: 100% de hooks criticos
- Utils: Funciones puras
- Stores: Estado inicial, acciones, selectores
- API Services: Llamadas HTTP, transformers, error handling

### 3.2 Integration Tests

**Framework:** Vitest + React Testing Library + MSW (Mock Service Worker)

**Targets:**
- Flujos completos de usuario
- Interaccion entre componentes
- API calls reales mockeados

**Ejemplo de configuracion MSW:**
```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/v1/gamification/users/:userId/ml-coins', (req, res, ctx) => {
    return res(ctx.json({ current_balance: 1000, earned_today: 50 }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 3.3 E2E Tests (Futuro - P3)

**Framework:** Playwright (recomendado)

**Targets prioritarios:**
- Login/Logout flow
- Completar ejercicio completo
- Verificar recompensas
- Navegacion entre modulos

---

## 4. Roadmap de Implementacion

### Fase 1: 13% → 25% (Sprint 1-2)

**Semana 1 - Hooks Criticos:**
```
[ ] useDashboardData.test.ts (4h)
    - Test de inicializacion
    - Test de fetch exitoso de 5 endpoints
    - Test de fallback cuando endpoint falla
    - Test de transformacion de datos
    - Test de estados de loading/error

[ ] useExerciseAutoSave.test.ts (3h)
    - Test de inicializacion
    - Test de debounce
    - Test de interval auto-save
    - Test de recuperacion de datos
    - Test de clear
```

**Semana 2 - APIs Criticas:**
```
[ ] gamification.api.test.ts (4h)
    - Test de getUserStats
    - Test de getUserRank
    - Test de getMLCoinsBalance
    - Test de getAllAchievements
    - Test de getUserAchievements (con transformer)
    - Test de getLeaderboard
    - Test de error handling

[ ] educationalAPI.test.ts (5h)
    - Test de getModules
    - Test de getModule
    - Test de getUserModules
    - Test de getExercises
    - Test de getModuleExercises
    - Test de submitExercise
    - Test de saveExerciseProgress
    - Test de transformers
```

**Semana 3 - APIs adicionales:**
```
[ ] progressAPI.test.ts (2h)
    - Test de autoSaveProgress
    - Test de getAutoSavedProgress
    - Test de clearAutoSavedProgress
```

### Fase 2: 25% → 40% (Sprint 3-4)

**Semana 4 - Hooks Student Portal:**
```
[ ] useUserGamification.test.ts (2h)
[ ] useUserModules.test.ts (2h)
[ ] useExercisePowerUps.test.ts (2h)
[ ] useGamificationData.test.ts (2h)
```

**Semana 5 - Pages Integration:**
```
[ ] DashboardComplete.integration.test.tsx (4h)
[ ] ExercisePage.integration.test.tsx (4h)
```

**Semana 6 - Stores:**
```
[ ] leaderboardsStore.test.ts (2h)
[ ] friendsStore.test.ts (2h)
[ ] guildsStore.test.ts (2h)
[ ] powerUpsStore.test.ts (2h)
```

**Semana 7 - Pages adicionales:**
```
[ ] MissionsPage.integration.test.tsx (3h)
[ ] GamificationPage.integration.test.tsx (3h)
[ ] ProfilePage.test.tsx (2h)
[ ] SettingsPage.test.tsx (2h)
```

---

## 5. Metricas de Exito

### 5.1 Coverage Goals por Fase

| Fase | Coverage | Tests Nuevos | LOC Tests |
|------|----------|--------------|-----------|
| Actual | 13% | 47 | ~3,500 |
| Fase 1 | 25% | +15 | +2,000 |
| Fase 2 | 40% | +20 | +2,500 |

### 5.2 Metricas de Calidad

- **Componentes criticos cubiertos:** 100% de hooks P0
- **APIs criticas cubiertas:** 100% de APIs gamification/educational
- **Stores cubiertos:** 100% de stores de gamificacion
- **Paginas criticas:** 80% de paginas Student Portal

### 5.3 Reduccion de Bugs Esperada

- **Pre-tests:** Alta probabilidad de regresiones en refactors
- **Post-tests:**
  - -50% bugs en hooks criticos
  - -40% bugs en integraciones API
  - Refactors mas seguros

---

## 6. Dependencias y Requisitos

### 6.1 Dependencias Tecnicas

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/react-hooks": "^8.0.0",
    "msw": "^2.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

### 6.2 Configuracion Jest/Vitest

El proyecto ya tiene Vitest configurado. Verificar:
- `vite.config.ts` tiene configuracion de test
- `vitest.config.ts` o setup file existe
- Coverage reporter configurado

### 6.3 Mocking Strategy

- **API Client:** Mock de `apiClient` con `vi.mock()`
- **Auth:** Mock de `useAuth()` hook
- **React Query:** Wrapper con `QueryClientProvider` en tests
- **localStorage:** Mock global en setup

---

## 7. Criterios de Aceptacion

### Para cada test:
- [ ] Cobertura de happy path
- [ ] Cobertura de error cases
- [ ] Cobertura de edge cases
- [ ] Tests descriptivos (describe/it claros)
- [ ] Sin dependencias externas reales
- [ ] Tiempo de ejecucion < 5s por archivo

### Para el plan completo:
- [ ] Coverage >= 25% al final de Fase 1
- [ ] Coverage >= 40% al final de Fase 2
- [ ] Todos los hooks P0 con tests
- [ ] Todas las APIs criticas con tests
- [ ] CI/CD ejecuta tests en cada PR

---

## 8. Referencias

### Documentacion Consultada
- `orchestration/inventarios/FRONTEND_INVENTORY.yml`
- `orchestration/analisis/ANALISIS-STUDENT-PORTAL-COMPLETO-2026-01-20.md`
- `orchestration/tareas/TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS/SUBTASKS.yml`

### Tests de Referencia (Buenos ejemplos)
- `features/auth/__tests__/authStore.test.ts` - Store testing
- `features/exercises/hooks/__tests__/useExerciseSubmission.test.ts` - Hook testing
- `features/gamification/__tests__/DashboardIntegration.test.tsx` - Integration testing

### Archivos Criticos a Testear
- `apps/frontend/src/apps/student/hooks/useDashboardData.ts`
- `apps/frontend/src/apps/student/hooks/useExerciseAutoSave.ts`
- `apps/frontend/src/lib/api/gamification.api.ts`
- `apps/frontend/src/services/api/educationalAPI.ts`
- `apps/frontend/src/features/progress/api/progressAPI.ts`

---

---

## 9. Analisis de Complejidad de Hooks

### 9.1 Hooks del Student Portal (por lineas de codigo)

| Hook | Lineas | Complejidad | Esfuerzo Test |
|------|--------|-------------|---------------|
| `useAchievementsEnhanced.ts` | 378 | Alta | 4h |
| `useDashboardData.ts` | 373 | Alta | 4h |
| `useGamificationData.ts` | 341 | Alta | 3h |
| `useExerciseAutoSave.ts` | 331 | Alta | 3h |
| `useExerciseState.ts` | 319 | Media | 3h |
| `useExercisePowerUps.ts` | 243 | Media | 2h |
| `useUserModules.ts` | 167 | Media | 2h |
| `useResponsiveLayout.ts` | 134 | Baja | 1h |
| `useRecentActivities.ts` | 106 | Baja | 1.5h |
| `useSwipeGesture.ts` | 104 | Baja | 1h |
| `useUserClassroom.ts` | 91 | Baja | 1h |
| **Total** | **2,587** | - | **25.5h** |

### 9.2 Paginas del Student Portal (por lineas de codigo)

| Pagina | Lineas | Complejidad | Esfuerzo Test |
|--------|--------|-------------|---------------|
| `ExercisePage.tsx` | 1,091 | Muy Alta | 6h |
| `SettingsPage.tsx` | 1,023 | Alta | 4h |
| `GuildsPage.tsx` | 683 | Alta | 3h |
| `InventoryPage.tsx` | 669 | Alta | 3h |
| `ShopPage.tsx` | 627 | Media | 3h |
| `FriendsPage.tsx` | 590 | Media | 2.5h |
| `ModuleDetailPage.tsx` | 589 | Media | 3h |
| `EnhancedProfilePage.tsx` | 587 | Media | 2.5h |
| `GamificationPage.tsx` | 550 | Media | 3h |
| `LeaderboardPage.tsx` | 545 | Media | 3h |
| `DeviceManagementSection.tsx` | 545 | Media | 2.5h |
| `NotificationsPage.tsx` | 529 | Media | 2.5h |
| `NotificationPreferencesPage.tsx` | 393 | Baja | 2h |
| `AssignmentsPage.tsx` | 357 | Baja | 2h |
| `AssignmentDetailPage.tsx` | 347 | Baja | 2h |
| `DashboardComplete.tsx` | 257 | Baja | 3h |
| `MissionsPage.tsx` | 248 | Baja | 2h |
| `TwoFactorAuthPage.tsx` | 248 | Baja | 2h |
| `PasswordResetPage.tsx` | 195 | Baja | 1.5h |
| `ProfilePage.tsx` | 178 | Baja | 1.5h |
| `PasswordRecoveryPage.tsx` | 147 | Baja | 1h |
| `EmailVerificationPage.tsx` | 88 | Muy Baja | **YA TESTEADO** |
| `NotFoundPage.tsx` | 38 | Muy Baja | 0.5h |
| **Total** | **10,524** | - | **56h** |

### 9.3 APIs a Testear (por lineas de codigo)

| API | Lineas | Funciones | Esfuerzo Test |
|-----|--------|-----------|---------------|
| `educationalAPI.ts` | 989 | 16+ | 5h |
| `progressAPI.ts` | 823 | 12+ | 5h |
| `gamification.api.ts` | 325 | 12 | 4h |
| **Total** | **2,137** | **40+** | **14h** |

---

## 10. Configuracion Vitest Actual

```typescript
// vitest.config.ts
{
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'lcov'],
    lines: 60,        // Threshold actual
    functions: 60,
    branches: 60,
    statements: 60,
  }
}
```

**Recomendacion:** Reducir thresholds temporalmente durante fase de catch-up:
- Fase 1 (durante catch-up): 15%
- Fase 2 (despues de Sprint 4): 25%
- Fase 3 (objetivo final): 40%

---

## 11. Changelog

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-01-20 | Version inicial del plan de testing |

---

*Documento generado como parte de GAP-SP-006 (Plan de Testing Prioritario)*
*Proyecto: GAMILIT Student Portal*

**Documento generado:** 2026-01-20
**Proxima revision:** Al completar Fase 1
**Estado:** APROBADO PARA EJECUCION
