# PLAN DE CORRECCIÓN FRONTEND - TIPOS DE MISIONES

**Fecha:** 2025-11-26
**Estado:** EN EJECUCIÓN
**Analista:** Architecture-Analyst

---

## RESUMEN DEL PROBLEMA

### Backend Envía:
```json
{
  "objectives": [
    { "type": "complete_exercises", "target": 3, "current": 1 }
  ],
  "rewards": { "ml_coins": 25, "xp": 50 },
  "progress": 33.33
}
```

### Frontend Espera (missionsTypes.ts):
```typescript
{
  currentValue: number;    // NO existe en respuesta
  targetValue: number;     // NO existe en respuesta
  xpReward: number;        // Backend usa rewards.xp
  mlCoinsReward: number;   // Backend usa rewards.ml_coins
}
```

---

## ARCHIVOS A MODIFICAR

| # | Archivo | Acción | Prioridad |
|---|---------|--------|-----------|
| 1 | `missionsTypes.ts` | Agregar `objectives[]` y `rewards` | P1 |
| 2 | `missionTransformer.ts` | CREAR - Transformar API → Frontend | P1 |
| 3 | `useMissions.ts` | Aplicar transformer | P1 |
| 4 | `MissionCard.tsx` | Usar helper para acceso seguro | P2 |
| 5 | `ActiveMissionTracker.tsx` | Usar helper para acceso seguro | P2 |
| 6 | `missionsStore.ts` | Actualizar para usar objectives[] | P2 |

---

## FASE 1: ACTUALIZAR TIPOS (missionsTypes.ts)

### Ubicación:
`apps/frontend/src/features/gamification/missions/types/missionsTypes.ts`

### Cambios:

```typescript
// AGREGAR: Interface para objetivo (del backend)
export interface MissionObjective {
  type: string;
  target: number;
  current: number;
  description?: string;
  modules_visited?: string[]; // Para weekly_explorer
}

// AGREGAR: Interface para rewards (del backend)
export interface MissionRewardsFromAPI {
  ml_coins?: number;
  xp?: number;
  items?: Array<{ type: string; quantity: number }>;
}

// MODIFICAR: Interface Mission
export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  category: MissionCategory;

  // NUEVO: Estructura del Backend
  objectives: MissionObjective[];
  rewards: MissionRewardsFromAPI;

  // MANTENER: Campos computados para backwards compatibility
  targetValue: number;      // Computed from objectives[0].target
  currentValue: number;     // Computed from objectives[0].current
  progress: number;         // Del backend (0-100)

  // MANTENER: Campos de recompensas (computed)
  xpReward: number;         // Computed from rewards.xp
  mlCoinsReward: number;    // Computed from rewards.ml_coins

  // ... resto de campos igual
}
```

---

## FASE 2: CREAR TRANSFORMER

### Ubicación:
`apps/frontend/src/features/gamification/missions/utils/missionTransformer.ts` (NUEVO)

### Contenido:

```typescript
import type { Mission, MissionObjective, MissionRewardsFromAPI } from '../types/missionsTypes';

/**
 * Interface que representa la respuesta cruda del API
 */
export interface MissionFromAPI {
  id: string;
  user_id: string;
  template_id: string;
  title: string;
  description: string | null;
  mission_type: 'daily' | 'weekly' | 'special';
  objectives: MissionObjective[];
  rewards: MissionRewardsFromAPI;
  status: 'active' | 'in_progress' | 'completed' | 'claimed' | 'expired';
  progress: number;
  start_date: string;
  end_date: string;
  completed_at: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Transforma la respuesta del API al formato esperado por los componentes
 */
export function transformMission(apiMission: MissionFromAPI): Mission {
  const firstObjective = apiMission.objectives[0];

  return {
    id: apiMission.id,
    type: apiMission.mission_type,
    title: apiMission.title,
    description: apiMission.description || '',
    category: mapTemplateToCategory(apiMission.template_id),

    // Estructura del Backend (nuevos campos)
    objectives: apiMission.objectives,
    rewards: apiMission.rewards,

    // Campos computados para backwards compatibility
    targetValue: firstObjective?.target ?? 0,
    currentValue: firstObjective?.current ?? 0,
    progress: apiMission.progress,

    // Recompensas computadas
    xpReward: apiMission.rewards.xp ?? 0,
    mlCoinsReward: apiMission.rewards.ml_coins ?? 0,

    // Metadatos
    icon: getIconForCategory(mapTemplateToCategory(apiMission.template_id)),
    difficulty: getDifficultyFromTarget(firstObjective?.target ?? 1),
    status: mapApiStatusToFrontend(apiMission.status),

    // Timestamps
    expiresAt: new Date(apiMission.end_date),
    startedAt: new Date(apiMission.start_date),
    completedAt: apiMission.completed_at ? new Date(apiMission.completed_at) : undefined,
    claimedAt: apiMission.claimed_at ? new Date(apiMission.claimed_at) : undefined,
  };
}

/**
 * Transforma un array de misiones
 */
export function transformMissions(apiMissions: MissionFromAPI[]): Mission[] {
  return apiMissions.map(transformMission);
}

// Helpers privados
function mapTemplateToCategory(templateId: string): MissionCategory {
  if (templateId.includes('exercise')) return 'exercises';
  if (templateId.includes('xp')) return 'xp';
  if (templateId.includes('streak')) return 'streak';
  if (templateId.includes('module')) return 'achievement';
  return 'exercises';
}

function mapApiStatusToFrontend(apiStatus: string): MissionStatus {
  const statusMap: Record<string, MissionStatus> = {
    'active': 'not_started',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'claimed': 'claimed',
    'expired': 'not_started',
  };
  return statusMap[apiStatus] || 'not_started';
}

function getIconForCategory(category: MissionCategory): string {
  const iconMap: Record<MissionCategory, string> = {
    exercises: 'book',
    xp: 'star',
    streak: 'flame',
    achievement: 'trophy',
    time: 'clock',
    social: 'users',
  };
  return iconMap[category] || 'target';
}

function getDifficultyFromTarget(target: number): MissionDifficulty {
  if (target <= 3) return 'easy';
  if (target <= 10) return 'medium';
  return 'hard';
}
```

---

## FASE 3: ACTUALIZAR HOOK useMissions

### Ubicación:
`apps/frontend/src/features/gamification/missions/hooks/useMissions.ts`

### Cambios:

```typescript
// AGREGAR import
import { transformMissions, type MissionFromAPI } from '../utils/missionTransformer';

// MODIFICAR fetch de misiones para aplicar transformer
const fetchMissions = async (): Promise<Mission[]> => {
  const response = await api.get<MissionFromAPI[]>('/gamification/missions');
  return transformMissions(response.data);
};
```

---

## FASE 4: CREAR HELPER DE ACCESO SEGURO

### Ubicación:
`apps/frontend/src/features/gamification/missions/utils/missionHelpers.ts` (NUEVO)

### Contenido:

```typescript
import type { Mission, MissionObjective } from '../types/missionsTypes';

/**
 * Obtiene el progreso actual de una misión de forma segura
 */
export function getMissionProgress(mission: Mission): { current: number; target: number } {
  // Primero intentar desde objectives (estructura nueva)
  if (mission.objectives && mission.objectives.length > 0) {
    return {
      current: mission.objectives[0].current,
      target: mission.objectives[0].target,
    };
  }

  // Fallback a campos legacy
  return {
    current: mission.currentValue ?? 0,
    target: mission.targetValue ?? 1,
  };
}

/**
 * Obtiene las recompensas de una misión de forma segura
 */
export function getMissionRewards(mission: Mission): { xp: number; mlCoins: number } {
  // Primero intentar desde rewards (estructura nueva)
  if (mission.rewards) {
    return {
      xp: mission.rewards.xp ?? mission.xpReward ?? 0,
      mlCoins: mission.rewards.ml_coins ?? mission.mlCoinsReward ?? 0,
    };
  }

  // Fallback a campos legacy
  return {
    xp: mission.xpReward ?? 0,
    mlCoins: mission.mlCoinsReward ?? 0,
  };
}
```

---

## FASE 5: ACTUALIZAR COMPONENTES

### MissionCard.tsx (línea 230)

```typescript
// ANTES:
{mission.currentValue ?? 0} / {mission.targetValue ?? 0}

// DESPUÉS:
import { getMissionProgress } from '../utils/missionHelpers';
// ...
const { current, target } = getMissionProgress(mission);
{current} / {target}
```

### ActiveMissionTracker.tsx (línea 180)

```typescript
// ANTES:
{mission.currentValue ?? 0} / {mission.targetValue ?? 0}

// DESPUÉS:
import { getMissionProgress } from '../utils/missionHelpers';
// ...
const { current, target } = getMissionProgress(mission);
{current} / {target}
```

---

## ORDEN DE EJECUCIÓN

```
1. missionsTypes.ts           ← Actualizar tipos
       ↓
2. missionTransformer.ts      ← CREAR nuevo archivo
       ↓
3. missionHelpers.ts          ← CREAR nuevo archivo
       ↓
4. useMissions.ts             ← Aplicar transformer
       ↓
5. MissionCard.tsx            ← Usar helper
       ↓
6. ActiveMissionTracker.tsx   ← Usar helper
       ↓
7. missionsStore.ts           ← Actualizar si es necesario
```

---

## VALIDACIÓN

Después de aplicar los cambios:

1. **TypeScript**: No debe haber errores de tipo
2. **Runtime**: Las misiones deben mostrar progreso correctamente
3. **Console**: No debe haber warnings de "undefined"

---

**Próximo paso:** Orquestar agentes para implementar las correcciones.
