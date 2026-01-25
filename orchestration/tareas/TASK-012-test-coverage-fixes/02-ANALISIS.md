# 02-ANALISIS.md - TASK-012: Test Coverage Fixes

## Metodologia de Analisis

Ejecución de tests con análisis de errores para identificar causa raíz:

```bash
npm test -- --testPathPatterns="gamification"
```

**Resultado inicial:** 45 failed, 252 passed, 2 skipped

## Analisis de Errores por Suite

### Suite 1: admin-gamification-config-us-ae-005.controller.spec.ts

**Tests fallidos:** 8
**Error pattern:**
```
expect(service.updateMayaRank).toHaveBeenCalledWith(
  rankName,
  dto,
  'admin-1',  // Expected
+ undefined,  // Received
```

**Causa raíz:**
- Test mock: `const req = { user: { sub: 'admin-1' } }`
- Controller real: `const adminId = req.user!.id`
- Diferencia: `sub` vs `id`

### Suite 2: gamification-config-us-ae-005.service.spec.ts

**Tests fallidos:** 5
**Error pattern:**
```
TypeError: this.systemSettingRepo.query is not a function
```

**Causa raíz:**
- Service usa `this.systemSettingRepo.query()` para raw SQL
- Mock no incluye método `query`
- Service actualizado para usar tabla maya_ranks directamente

### Suite 3: missions.service.spec.ts

**Tests fallidos:** 4
**Error patterns:**

1. claimRewards assertion:
```
Expected: "profile-xxx", 50, ...
Received: "user-123", 50, ...
```
- Service pasa `userId` a mlCoinsService, no `profileId`

2. checkForRankUp:
```
expect(ranksService.checkForRankUp).toHaveBeenCalledWith(...)
Number of calls: 0
```
- Service usa `getCurrentRank()` dos veces, no `checkForRankUp()`

3. generateDailyMissions:
```
BadRequestException: No daily mission templates available
```
- Service lanza excepción cuando no hay templates
- Test esperaba array vacío

### Suite 4: mission-generator.service.spec.ts

**Tests fallidos:** 28
**Error pattern:**
```
Nest can't resolve dependencies of MissionGeneratorService (?, MissionTemplatesService)
```

**Causa raíz:**
- Provider: `{ provide: 'MissionTemplatesService', useValue: ... }` (string)
- Debería ser: `{ provide: MissionTemplatesService, useValue: ... }` (class)

Además:
- Mock usa `getActiveByTypeAndLevel`
- Service usa `getActiveByType`

## Plan de Correccion

| Prioridad | Suite | Acción |
|-----------|-------|--------|
| 1 | Controller | Cambiar `sub` → `id` en 4 mocks |
| 2 | Service | Agregar `query` mock + datos maya_ranks |
| 3 | Missions | Corregir assertions userId y método rank |
| 4 | Generator | Fix import + provider + método mock |

## Impacto Estimado

- **Sin impacto en producción** - Solo archivos .spec.ts
- **Mejora coverage** - De ~25% a ~28% estimado
- **CI/CD** - Tests pasarán correctamente
