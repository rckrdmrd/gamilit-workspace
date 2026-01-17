# Analisis de Errores de Tests - CAPVED Fase A

**Task ID:** TASK-2026-01-17-002
**Fecha:** 2026-01-17
**Fase:** Analisis (A)

---

## Resumen Ejecutivo

| Metrica | Backend | Frontend | Total |
|---------|---------|----------|-------|
| Test Suites Fallando | 30 | 25 | 55 |
| Tests Fallando | 506 | 279 | 785 |
| Tests Pasando | 902 | 882 | 1,784 |
| Tasa de Fallo | 36% | 24% | 31% |

---

## Clasificacion de Errores por Categoria

### Backend (30 suites, 506 tests fallando)

#### Categoria 1: Missing Repository Mocks (P0)
**Impacto:** 8 suites, ~120 tests
**Causa Raiz:** Servicios actualizados con nuevas dependencias no mockeadas

| Archivo | Error | Dependencia Faltante |
|---------|-------|---------------------|
| ml-coins.service.spec.ts | `gamification_MayaRankEntityRepository` | MayaRank entity |
| user-stats.service.spec.ts | Similar pattern | MayaRank, Achievements |
| achievements.service.spec.ts | Missing repository | UserStats |
| missions.service.spec.ts | Missing repository | MissionProgress |
| ranks.service.spec.ts | Missing mock | MayaRank |

**Solucion:** Agregar mocks faltantes en `repositories.mock.ts`

#### Categoria 2: Test Setup Incompleto (P0)
**Impacto:** 12 suites, ~200 tests
**Causa Raiz:** Tests no mockean todas las dependencias del modulo

| Archivo | Error |
|---------|-------|
| auth.service.spec.ts | Profile, Session dependencies |
| auth.controller.spec.ts | Guards, Interceptors |
| module-progress.service.spec.ts | Exercise, Module entities |
| exercise-submission.service.spec.ts | Validator, Grading services |

**Solucion:** Refactorizar test modules con todos los providers

#### Categoria 3: TypeORM/Node.js Compatibility (P1)
**Impacto:** 3 suites, ~50 tests
**Causa Raiz:** path-scurry issue con TypeORM en Node 20+

| Archivo | Error |
|---------|-------|
| admin-reports.service.spec.ts | `Cannot read 'native'` |
| content-categories.service.spec.ts | Same issue |

**Solucion:** Update TypeORM o mock DataSource

#### Categoria 4: Memory Issues (P2)
**Impacto:** 2 suites, ~30 tests
**Causa Raiz:** Jest worker out of memory

**Solucion:** Configurar `--maxWorkers=2` o aumentar heap

#### Categoria 5: Assertion Failures (P1)
**Impacto:** 5 suites, ~106 tests
**Causa Raiz:** Tests desactualizados vs implementacion

| Modulo | Tests Afectados |
|--------|-----------------|
| Auth (register, login) | 17 tests |
| Teacher (classrooms) | 11 tests |
| Progress (module) | 47 tests |
| Admin (reports) | 31 tests |

**Solucion:** Actualizar assertions para match current implementation

---

### Frontend (25 suites, 279 tests fallando)

#### Categoria 6: Auth State Not Mocked (P0)
**Impacto:** 12 suites, ~150 tests
**Causa Raiz:** `useAuthStore.getState().user` es undefined

| Archivo | Error |
|---------|-------|
| economyStore.test.ts | "User not authenticated" |
| EconomyIntegration.test.tsx | Same |
| DashboardIntegration.test.tsx | Same |
| ranksStore.test.ts | Same |
| achievementsStore.test.ts | Same |

**Solucion:** Mock auth store correctamente en setup.ts o por suite

#### Categoria 7: API Mock Issues (P1)
**Impacto:** 8 suites, ~80 tests
**Causa Raiz:** API mocks no retornan datos esperados

| Archivo | Error Type |
|---------|------------|
| apiConfig.test.ts | Endpoint format validation |
| adminAPI.test.ts | Transform functions |
| ForgotPasswordPage.test.tsx | Form submission |
| RegisterForm.test.tsx | Async operations |

**Solucion:** Actualizar mocks para match API responses

#### Categoria 8: Component Rendering (P1)
**Impacto:** 5 suites, ~49 tests
**Causa Raiz:** Components actualizados, tests no

| Archivo | Tests Fallando |
|---------|----------------|
| RegisterForm.test.tsx | 29 |
| ForgotPasswordPage.test.tsx | 20 |

**Solucion:** Sync tests con component implementation

---

## Dependencias Entre Categorias

```
┌─────────────────────────────────────────────────────────────────┐
│  ORDEN DE CORRECCION RECOMENDADO                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  P0 (Bloqueantes - Semana 1):                                   │
│  ┌────────────────┐    ┌────────────────┐                       │
│  │ Cat 1: Repos   │───→│ Cat 2: Setup   │                       │
│  │ (Backend)      │    │ (Backend)      │                       │
│  └────────────────┘    └────────────────┘                       │
│          │                    │                                  │
│          ▼                    ▼                                  │
│  ┌────────────────────────────────────────┐                     │
│  │ Cat 6: Auth State Mock (Frontend)      │                     │
│  └────────────────────────────────────────┘                     │
│                                                                  │
│  P1 (Importantes - Semana 2):                                   │
│  ┌────────────────┐    ┌────────────────┐                       │
│  │ Cat 3: TypeORM │    │ Cat 7: API     │                       │
│  │ Compatibility  │    │ Mocks          │                       │
│  └────────────────┘    └────────────────┘                       │
│          │                    │                                  │
│          ▼                    ▼                                  │
│  ┌────────────────┐    ┌────────────────┐                       │
│  │ Cat 5: Backend │    │ Cat 8: Render  │                       │
│  │ Assertions     │    │ Tests          │                       │
│  └────────────────┘    └────────────────┘                       │
│                                                                  │
│  P2 (Optimizacion - Semana 3):                                  │
│  ┌────────────────┐                                             │
│  │ Cat 4: Memory  │                                             │
│  │ Issues         │                                             │
│  └────────────────┘                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Alineacion con Documentacion

### Referencia: INIT-NEXUS-TESTING.md

| Aspecto | Documentado | Estado Actual | Gap |
|---------|-------------|---------------|-----|
| Coverage Target | 70% | 15% BE / 13% FE | -55% |
| Mock Patterns | repositories.mock.ts | Incompleto | Agregar MayaRank, etc |
| Auth Mock | Definido en setup.ts | No funcional | Refactorizar |
| Test Timeout | 30s BE / 10s FE | OK | - |

### Referencia: TEST_STRUCTURE_SUMMARY.md

| Aspecto | Documentado | Estado Actual | Gap |
|---------|-------------|---------------|-----|
| AAA Pattern | Requerido | Implementado | OK |
| TestDataFactory | Definido | Usado parcialmente | Expandir |
| Service Mocks | 10 servicios | 6 implementados | Agregar 4 |

---

## Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Cambios en implementacion durante fix | Alta | Medio | Branch separado |
| Tests flaky despues de fix | Media | Alto | CI con reruns |
| Regresiones por mock incorrectos | Media | Alto | Review exhaustivo |
| Tiempo insuficiente | Media | Medio | Priorizar P0 |

---

## Metricas de Exito

| Metrica | Actual | Objetivo Minimo | Objetivo Ideal |
|---------|--------|-----------------|----------------|
| Tests Pasando BE | 902/1408 (64%) | 1200/1408 (85%) | 1350/1408 (96%) |
| Tests Pasando FE | 882/1161 (76%) | 1050/1161 (90%) | 1100/1161 (95%) |
| Suites sin errores | 37/85 (44%) | 70/85 (82%) | 80/85 (94%) |

---

**Generado por:** Claude-Agent
**Fecha:** 2026-01-17
**Fase CAPVED:** Analisis (A) - Completada
