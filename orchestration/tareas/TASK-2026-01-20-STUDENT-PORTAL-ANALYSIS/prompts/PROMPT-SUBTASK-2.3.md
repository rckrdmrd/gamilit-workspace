# PROMPT: SUBTASK-2.3 - Plan de Testing Prioritario

**Perfil:** @PERFIL_TESTING
**Gap Relacionado:** GAP-SP-006
**Tipo:** Planificacion

---

## Prompt Enviado

```
**PERFIL:** @PERFIL_TESTING
**SUBTAREA:** SUBTASK-2.3 - Plan de Testing Prioritario (GAP-SP-006)
**TAREA PADRE:** TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS

## CONTEXTO

Gap identificado: Test coverage critico
- Coverage actual: 13%
- Coverage meta: 40%
- Gap: -27%
- Solo 8 archivos testeados de 371 componentes

## TAREA

1. ANALIZAR el estado actual de testing en el frontend
2. IDENTIFICAR archivos de test existentes
3. PRIORIZAR componentes criticos para testear
4. CREAR plan de testing en orchestration/testing/TESTING-PLAN-STUDENT-PORTAL.md

## AREAS A EXPLORAR

### Tests Existentes
- apps/frontend/src/**/*.test.ts
- apps/frontend/src/**/*.spec.ts
- apps/frontend/__tests__/

### Componentes Criticos (Priorizar)
1. Hooks de datos: useDashboardData, useExerciseAutoSave
2. APIs: gamification.api.ts, educationalAPI.ts
3. Stores: gamificationStore, progressStore
4. Componentes core: ExerciseRenderer, MissionCard

## ESTRUCTURA DEL PLAN

### 1. Estado Actual
- Tests existentes (listar)
- Coverage por modulo
- Gaps de coverage

### 2. Priorizacion
- P0: Hooks criticos (sin tests, alto uso)
- P1: APIs (integracion con backend)
- P2: Stores (estado global)
- P3: Componentes UI

### 3. Plan de Implementacion
| Componente | Tipo Test | Esfuerzo | Prioridad |
|------------|-----------|----------|-----------|
| useDashboardData | Unit | 4h | P0 |
| gamification.api.ts | Integration | 6h | P1 |

### 4. Metricas Meta
- Fase 1: 13% -> 25% (12 semanas)
- Fase 2: 25% -> 40% (8 semanas)

### 5. Recursos Requeridos
- Herramientas: Jest, React Testing Library
- Mocks: MSW para APIs
- Fixtures: Datos de prueba

## VALIDACION

- El plan debe ser realista y priorizado
- Incluir estimaciones de esfuerzo
- Definir metricas de exito

## COMMIT

[SUBTASK-2.3] docs: Create testing plan for Student Portal (GAP-SP-006)
```

---

## Contexto Adicional

### Stack de Testing

| Herramienta | Uso |
|-------------|-----|
| Jest | Test runner |
| React Testing Library | Testing de componentes |
| MSW | Mock Service Worker |
| @testing-library/user-event | Simulacion de interaccion |

### Archivos de Configuracion

- `jest.config.js`
- `setupTests.ts`
- `package.json` (scripts de test)

---

## Resultado Obtenido

**Entregable:** `orchestration/testing/TESTING-PLAN-STUDENT-PORTAL.md`

**Metricas del Plan:**
| Metrica | Valor |
|---------|-------|
| Tests existentes identificados | 47 |
| Hooks criticos sin tests | 10 |
| APIs criticas sin tests | 5 |
| Horas estimadas implementacion | 54h |

---

## Uso en Mejora Continua

Este prompt puede servir como template para:
- Planes de testing de otros portales
- Auditorias de coverage
- Priorizacion de deuda tecnica

**Checklist de Plan de Testing:**
- [ ] Inventario de tests existentes
- [ ] Analisis de coverage actual
- [ ] Identificacion de gaps criticos
- [ ] Priorizacion por impacto
- [ ] Estimacion de esfuerzo
- [ ] Definicion de metas
- [ ] Recursos y herramientas
