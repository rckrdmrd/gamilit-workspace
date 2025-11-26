# Guía de Migración: Sistema de Missions

## Estado Actual

El sistema de missions tiene **dos implementaciones**:

### Sistema Legacy (DEPRECADO)
- **Store:** `src/features/missions/store/missionsStore.ts`
- **API:** `src/services/api/missionsAPI.ts`
- **Tipo Mission:** Usa `objective` (singular)
- **Estado:** DEPRECADO - No usar en código nuevo

### Sistema Nuevo (RECOMENDADO)
- **Hook:** `src/features/gamification/missions/hooks/useMissions.ts`
- **Types:** `src/features/gamification/missions/types/missionsTypes.ts`
- **Tipo Mission:** Usa `objectives[]` (array)
- **Estado:** ACTIVO - Usar para todo código nuevo

## Migración

### Antes (Legacy)
```typescript
import { useMissionsStore } from '@/features/missions/store/missionsStore';
import { Mission } from '@/services/api/missionsAPI';

// En componente
const { dailyMissions, fetchDailyMissions } = useMissionsStore();
```

### Después (Nuevo)
```typescript
import { useMissions } from '@/features/gamification/missions/hooks/useMissions';
import type { Mission } from '@/features/gamification/missions/types/missionsTypes';

// En componente
const { dailyMissions, refresh } = useMissions();
```

## Diferencias de Tipos

| Aspecto | Legacy | Nuevo |
|---------|--------|-------|
| Objetivos | `mission.objective` (singular) | `mission.objectives[]` (array) |
| Status | 4 valores | 5 valores (incluye 'expired') |
| Recompensas | `rewards.mlCoins` | `rewards.ml_coins` |

## Helpers Disponibles

El sistema nuevo incluye helpers para facilitar la migración:

```typescript
import {
  getMissionProgress,
  getMissionRewards,
  isMissionCompletable
} from '@/features/gamification/missions/utils/missionHelpers';
```

## Referencias

- Análisis: `orchestration/agentes/architecture-analyst/useMissions-error-analysis-2025-11-26/`
- Hook: `src/features/gamification/missions/hooks/useMissions.ts`
- Types: `src/features/gamification/missions/types/missionsTypes.ts`
