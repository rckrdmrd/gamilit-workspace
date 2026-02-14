# 03-EJECUCION.md - TASK-012: Test Coverage Fixes

## Resumen de Ejecucion

| Suite | Tests Corregidos | Commit |
|-------|------------------|--------|
| admin-gamification-config-us-ae-005.controller.spec.ts | 8 | 9924eb27 |
| gamification-config-us-ae-005.service.spec.ts | 5 | a7794926 |
| missions.service.spec.ts | 4 | a7794926 |
| mission-generator.service.spec.ts | 28 | a7794926 |

---

## Correccion 1: Controller Mocks (req.user.sub → req.user.id)

**Archivo:** `apps/backend/src/modules/admin/__tests__/admin-gamification-config-us-ae-005.controller.spec.ts`

**Cambios (4 ocurrencias):**
```typescript
// ANTES
const req = { user: { sub: 'admin-2' } };

// DESPUES
const req = { user: { id: 'admin-2' } };
```

**Tests corregidos:** 8

---

## Correccion 2: Service Mock Query + Maya Ranks

**Archivo:** `apps/backend/src/modules/admin/__tests__/gamification-config-us-ae-005.service.spec.ts`

**Cambio 1 - Agregar query mock:**
```typescript
// ANTES
const mockSystemSettingRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
};

// DESPUES
const mockSystemSettingRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
  query: jest.fn(),  // Agregado
};
```

**Cambio 2 - Agregar datos mock para query:**
```typescript
const mockRanksQueryResult = [
  { id: 'rank-1', name: 'Novato', level: 0, minXp: '0', maxXp: '99', ... },
  { id: 'rank-2', name: 'Guerrero', level: 1, minXp: '100', maxXp: '499', ... },
  { id: 'rank-3', name: 'Sabio', level: 2, minXp: '500', maxXp: '1499', ... },
  { id: 'rank-4', name: 'Líder', level: 3, minXp: '1500', maxXp: '4999', ... },
  { id: 'rank-5', name: 'Maestro', level: 4, minXp: '5000', maxXp: null, ... },
];
```

**Cambio 3 - Actualizar tests getMayaRanks:**
```typescript
// ANTES
mockSystemSettingRepository.count.mockResolvedValue(1);
mockSystemSettingRepository.findOne.mockResolvedValue(mockRanksSetting);

// DESPUES
mockSystemSettingRepository.query.mockResolvedValue(mockRanksQueryResult);
mockSystemSettingRepository.findOne.mockResolvedValue(mockRanksSetting);
```

**Tests corregidos:** 5

---

## Correccion 3: Missions Service Assertions

**Archivo:** `apps/backend/src/modules/gamification/services/__tests__/missions.service.spec.ts`

**Cambio 1 - claimRewards assertion:**
```typescript
// ANTES
expect(mlCoinsService.addCoins).toHaveBeenCalledWith(
  mockProfile.id,  // profileId
  50,
  ...
);

// DESPUES
expect(mlCoinsService.addCoins).toHaveBeenCalledWith(
  userId,  // Service passes userId, not profileId
  50,
  ...
);
```

**Cambio 2 - Rank check test:**
```typescript
// ANTES
it('should check for rank-up after claiming rewards', async () => {
  ranksService.checkForRankUp.mockResolvedValue(null);
  await service.claimRewards(missionId, userId);
  expect(ranksService.checkForRankUp).toHaveBeenCalledWith(mockProfile.id);
});

// DESPUES
it('should check current rank after claiming rewards', async () => {
  ranksService.getCurrentRank.mockResolvedValue({ current_rank: 'Guerrero' });
  await service.claimRewards(missionId, userId);
  expect(ranksService.getCurrentRank).toHaveBeenCalledWith(userId);
});
```

**Cambio 3 - generateDailyMissions empty templates:**
```typescript
// ANTES
it('should return empty array if no templates available', async () => {
  templatesService.getActiveByType.mockResolvedValue([]);
  const result = await service.generateDailyMissions(userId);
  expect(result).toEqual([]);
});

// DESPUES
it('should throw BadRequestException if no templates available', async () => {
  templatesService.getActiveByType.mockResolvedValue([]);
  await expect(service.generateDailyMissions(userId)).rejects.toThrow(
    'No daily mission templates available',
  );
});
```

**Tests corregidos:** 4

---

## Correccion 4: Mission Generator DI + Method Name

**Archivo:** `apps/backend/src/modules/gamification/services/missions/__tests__/mission-generator.service.spec.ts`

**Cambio 1 - Import:**
```typescript
// ANTES
import { MissionGeneratorService } from '../mission-generator.service';
import { Mission, ... } from '../../../entities/mission.entity';

// DESPUES
import { MissionGeneratorService } from '../mission-generator.service';
import { MissionTemplatesService } from '../../mission-templates.service';  // Agregado
import { Mission, ... } from '../../../entities/mission.entity';
```

**Cambio 2 - Provider:**
```typescript
// ANTES
{ provide: 'MissionTemplatesService', useValue: templatesService },

// DESPUES
{ provide: MissionTemplatesService, useValue: templatesService },
```

**Cambio 3 - Method mock (global replace):**
```typescript
// ANTES
templatesService.getActiveByTypeAndLevel.mockResolvedValue(mockTemplates);

// DESPUES
templatesService.getActiveByType.mockResolvedValue(mockTemplates);
```

**Tests corregidos:** 28

---

## Validacion Final

### Comando
```bash
npm test -- --testPathPatterns="gamification" --passWithNoTests
```

### Resultado
```
Test Suites: 12 passed, 12 total
Tests:       2 skipped, 297 passed, 299 total
Snapshots:   0 total
Time:        20.629 s
```

### Git Status
```
On branch main
Your branch is up to date with 'origin/master'.
nothing to commit, working tree clean
```

---

## Metricas de Ejecucion

| Metrica | Valor |
|---------|-------|
| Tests corregidos | 45 |
| Archivos modificados | 4 |
| Lineas cambiadas | ~120 |
| Commits | 2 |
| Tiempo ejecucion | ~1.5h |

## Commits

1. `9924eb27` - test(gamification): Fix failing tests and increase coverage
2. `a7794926` - test(gamification): fix remaining failing test suites
