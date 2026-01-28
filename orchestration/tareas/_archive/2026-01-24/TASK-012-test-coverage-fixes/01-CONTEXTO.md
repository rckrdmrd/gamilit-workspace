# 01-CONTEXTO.md - TASK-012: Test Coverage Fixes

## Solicitud del Usuario

**Fecha:** 2026-01-25
**Solicitante:** adredsi
**Canal:** Claude Code CLI

### Mensaje Original

> "sí, procede con test coverage"

### Interpretacion

1. **Tarea:** Continuar con US-AUDIT-004 (Test Coverage Improvement)
2. **Estado previo:** 45 tests fallando en módulo gamification
3. **Objetivo:** Corregir tests fallidos para aumentar coverage

## Contexto Tecnico

### Stack Tecnologico
- **Backend:** NestJS + TypeScript + Jest
- **Testing:** Jest + @nestjs/testing
- **Mocking:** jest.fn(), createMockRepository, createMockQueryBuilder

### Archivos Afectados
```
apps/backend/src/modules/
├── admin/__tests__/
│   ├── admin-gamification-config-us-ae-005.controller.spec.ts
│   └── gamification-config-us-ae-005.service.spec.ts
└── gamification/services/
    ├── __tests__/missions.service.spec.ts
    └── missions/__tests__/mission-generator.service.spec.ts
```

## Problema Principal

45 tests fallando debido a desalineación entre mocks y código real:

| Categoría | Tests Fallidos | Causa |
|-----------|----------------|-------|
| Controller | 8 | req.user.sub vs req.user.id |
| Service getMayaRanks | 5 | Falta mock query() |
| Missions claimRewards | 4 | userId vs profileId en assertions |
| MissionGenerator | 28 | Método incorrecto mockeado |

## Restricciones

1. **No modificar código de producción** - Solo archivos de test
2. **Mantener coherencia** - Mocks deben reflejar comportamiento real
3. **Preservar cobertura existente** - No eliminar tests, solo corregir

## Criterios de Exito

1. 0 tests fallidos en módulo gamification
2. Todos los tests ejecutan correctamente
3. Sin regresiones en otras suites
