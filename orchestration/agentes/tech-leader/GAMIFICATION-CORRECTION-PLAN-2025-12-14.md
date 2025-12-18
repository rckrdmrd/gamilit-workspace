# PLAN DE CORRECCIONES: Integraciones de Gamificacion
## GAMILIT - FASE 3

**Fecha:** 2025-12-14
**Proyecto:** GAMILIT
**Rol:** Tech-Leader Agent
**Basado en:** GAMIFICATION-ANALYSIS-REPORT-2025-12-14.md

---

## RESUMEN DE CORRECCIONES

| ID | Severidad | Descripcion | Estimacion | Riesgo |
|----|-----------|-------------|------------|--------|
| P0-001 | CRITICA | Actualizar umbrales XP en calculate_maya_rank_helpers.sql | Bajo | Bajo |
| P0-002 | CRITICA | Corregir isMinRank en useRank.ts | Bajo | Bajo |
| P0-003 | CRITICA | Corregir calculo progreso (ML Coins → XP) | Medio | Medio |
| P0-004 | CRITICA | Reemplazar mock data con API real | Alto | Medio |

---

## CORRECCION P0-001: Actualizar Umbrales XP en SQL Function

### Descripcion
La funcion `calculate_maya_rank_from_xp()` tiene umbrales de XP de la version 1.0, cuando deberia usar los de version 2.1.

### Archivo Afectado
```
apps/database/ddl/schemas/gamification_system/functions/calculate_maya_rank_helpers.sql
```

### Cambio Requerido

**ANTES (v1.0 - INCORRECTO):**
```sql
CREATE OR REPLACE FUNCTION gamification_system.calculate_maya_rank_from_xp(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF xp < 1000 THEN
        RETURN 'Ajaw';
    ELSIF xp < 3000 THEN
        RETURN 'Nacom';
    ELSIF xp < 6000 THEN
        RETURN 'Ah K''in';
    ELSIF xp < 10000 THEN
        RETURN 'Halach Uinic';
    ELSE
        RETURN 'K''uk''ulkan';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**DESPUES (v2.1 - CORRECTO):**
```sql
CREATE OR REPLACE FUNCTION gamification_system.calculate_maya_rank_from_xp(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    -- Umbrales v2.1 (sincronizados con 03-maya_ranks.sql)
    IF xp < 500 THEN
        RETURN 'Ajaw';
    ELSIF xp < 1000 THEN
        RETURN 'Nacom';
    ELSIF xp < 1500 THEN
        RETURN 'Ah K''in';
    ELSIF xp < 1900 THEN
        RETURN 'Halach Uinic';
    ELSE
        RETURN 'K''uk''ulkan';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Tambien Actualizar: calculate_rank_progress_percentage

**ANTES:**
```sql
CASE rank
    WHEN 'Ajaw' THEN
        xp_in_rank := xp;
        rank_size := 1000;
    WHEN 'Nacom' THEN
        xp_in_rank := xp - 1000;
        rank_size := 2000;
    WHEN 'Ah K''in' THEN
        xp_in_rank := xp - 3000;
        rank_size := 3000;
    WHEN 'Halach Uinic' THEN
        xp_in_rank := xp - 6000;
        rank_size := 4000;
```

**DESPUES:**
```sql
CASE rank
    WHEN 'Ajaw' THEN
        xp_in_rank := xp;
        rank_size := 500;      -- 0-499
    WHEN 'Nacom' THEN
        xp_in_rank := xp - 500;
        rank_size := 500;      -- 500-999
    WHEN 'Ah K''in' THEN
        xp_in_rank := xp - 1000;
        rank_size := 500;      -- 1000-1499
    WHEN 'Halach Uinic' THEN
        xp_in_rank := xp - 1500;
        rank_size := 400;      -- 1500-1899
```

### Verificacion Post-Cambio
```sql
-- Test cases
SELECT gamification_system.calculate_maya_rank_from_xp(0);     -- Debe retornar 'Ajaw'
SELECT gamification_system.calculate_maya_rank_from_xp(499);   -- Debe retornar 'Ajaw'
SELECT gamification_system.calculate_maya_rank_from_xp(500);   -- Debe retornar 'Nacom'
SELECT gamification_system.calculate_maya_rank_from_xp(1000);  -- Debe retornar 'Ah K'in'
SELECT gamification_system.calculate_maya_rank_from_xp(1500);  -- Debe retornar 'Halach Uinic'
SELECT gamification_system.calculate_maya_rank_from_xp(1900);  -- Debe retornar 'K'uk'ulkan'
```

---

## CORRECCION P0-002: Corregir isMinRank en useRank.ts

### Descripcion
La variable `isMinRank` indica incorrectamente que 'Nacom' es el rango minimo, cuando deberia ser 'Ajaw'.

### Archivo Afectado
```
apps/frontend/src/features/gamification/ranks/hooks/useRank.ts
```

### Cambio Requerido

**ANTES (Linea 65-68):**
```typescript
const isMinRank = useMemo(
  () => currentRankId === 'Nacom',
  [currentRankId]
);
```

**DESPUES:**
```typescript
const isMinRank = useMemo(
  () => currentRankId === 'Ajaw',
  [currentRankId]
);
```

### Verificacion Post-Cambio
- En DevTools, verificar que `isMinRank` sea `true` cuando el usuario tenga rango 'Ajaw'
- Verificar componentes que usen `isMinRank` para logica condicional

---

## CORRECCION P0-003: Corregir Calculo de Progreso (XP en lugar de ML Coins)

### Descripcion
El calculo de progreso hacia el siguiente rango usa ML Coins, pero deberia usar XP.

### Archivo Afectado
```
apps/frontend/src/features/gamification/ranks/hooks/useRank.ts
```

### Cambio Requerido

**ANTES (Linea 71-76):**
```typescript
const progress = useMemo(() => {
  if (!nextRank) return 100;
  const coinsNeeded = nextRank.mlCoinsRequired - currentRank.mlCoinsRequired;
  const coinsEarned = userProgress.mlCoinsEarned - currentRank.mlCoinsRequired;
  return Math.min(100, Math.max(0, (coinsEarned / coinsNeeded) * 100));
}, [userProgress.mlCoinsEarned, currentRank, nextRank]);
```

**DESPUES:**
```typescript
// Calculo de progreso basado en XP (v2.1)
const progress = useMemo(() => {
  if (!nextRank) return 100; // Max rank

  // Obtener XP actual del usuario
  const currentXP = userProgress.totalXP || 0;

  // Umbrales v2.1 (sincronizados con backend)
  const RANK_XP_THRESHOLDS: Record<string, { min: number; max: number }> = {
    'Ajaw': { min: 0, max: 500 },
    'Nacom': { min: 500, max: 1000 },
    "Ah K'in": { min: 1000, max: 1500 },
    'Halach Uinic': { min: 1500, max: 1900 },
    "K'uk'ulkan": { min: 1900, max: Infinity },
  };

  const currentThreshold = RANK_XP_THRESHOLDS[currentRank.id] || { min: 0, max: 500 };
  const xpInRank = currentXP - currentThreshold.min;
  const xpRangeSize = currentThreshold.max - currentThreshold.min;

  return Math.min(100, Math.max(0, (xpInRank / xpRangeSize) * 100));
}, [userProgress.totalXP, currentRank, nextRank]);
```

### Nota Importante
Esta correccion requiere que `userProgress.totalXP` este disponible en el store. Verificar que ranksStore tenga esta propiedad.

---

## CORRECCION P0-004: Reemplazar Mock Data con API Real

### Descripcion
El hook useRank obtiene datos de mock data estatico en lugar de llamar al API real.

### Archivos Afectados
```
apps/frontend/src/features/gamification/ranks/hooks/useRank.ts
apps/frontend/src/features/gamification/ranks/api/ranksAPI.ts (crear si no existe)
apps/frontend/src/features/gamification/ranks/store/ranksStore.ts
```

### Cambios Requeridos

#### 1. Crear/Actualizar ranksAPI.ts

```typescript
/**
 * Ranks API
 * API client for rank-related operations
 */
import { apiClient } from '@/services/api/apiClient';
import type { RankDefinition, UserRankProgress } from '../types/ranksTypes';

const API_BASE = '/gamification/ranks';

/**
 * Get all rank definitions from backend
 */
export async function getRankDefinitions(): Promise<RankDefinition[]> {
  const response = await apiClient.get<{ data: RankDefinition[] }>(`${API_BASE}/definitions`);
  return response.data.data;
}

/**
 * Get current user's rank and progress
 */
export async function getUserRankProgress(userId: string): Promise<UserRankProgress> {
  const response = await apiClient.get<{ data: UserRankProgress }>(`${API_BASE}/users/${userId}/progress`);
  return response.data.data;
}

/**
 * Get rank configuration (thresholds, bonuses, etc.)
 */
export async function getRankConfig(): Promise<Record<string, { xp_min: number; xp_max: number; ml_coins_bonus: number }>> {
  const response = await apiClient.get(`${API_BASE}/config`);
  return response.data.data;
}
```

#### 2. Actualizar useRank.ts para usar API

```typescript
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRanksStore, selectUserProgress, selectCurrentRank } from '../store/ranksStore';
import { getUserRankProgress, getRankDefinitions } from '../api/ranksAPI';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { RankDefinition, RankComparison } from '../types/ranksTypes';

export function useRank(): UseRankReturn {
  const userId = useAuthStore((state) => state.user?.id);
  const [rankDefinitions, setRankDefinitions] = useState<RankDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rank definitions on mount
  useEffect(() => {
    async function fetchRankData() {
      if (!userId) return;

      try {
        setLoading(true);
        const [definitions, progress] = await Promise.all([
          getRankDefinitions(),
          getUserRankProgress(userId),
        ]);

        setRankDefinitions(definitions);
        // Update store with progress data
        // ...
      } catch (err) {
        setError('Error loading rank data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRankData();
  }, [userId]);

  // ... resto del hook usando datos del API
}
```

#### 3. Backend - Agregar endpoint /ranks/definitions (si no existe)

Verificar que exista el endpoint en `apps/backend/src/modules/gamification/controllers/ranks.controller.ts`:

```typescript
@Get('definitions')
@ApiOperation({ summary: 'Get all rank definitions' })
async getRankDefinitions() {
  return this.ranksService.getAllRanksConfig();
}
```

---

## ORDEN DE IMPLEMENTACION

### Fase 1: Correcciones Database (Sin dependencias)
1. P0-001: Actualizar calculate_maya_rank_helpers.sql

### Fase 2: Correcciones Backend (Verificar endpoints)
2. Verificar/crear endpoint `/ranks/definitions`
3. Verificar/crear endpoint `/ranks/users/:userId/progress`

### Fase 3: Correcciones Frontend (Requiere backend)
4. P0-002: Corregir isMinRank
5. P0-003: Corregir calculo progreso
6. P0-004: Implementar API calls (requiere endpoints de Fase 2)

---

## PLAN DE ROLLBACK

### Si P0-001 causa problemas:
```sql
-- Revertir a v1.0 (solo si es necesario)
CREATE OR REPLACE FUNCTION gamification_system.calculate_maya_rank_from_xp(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF xp < 1000 THEN RETURN 'Ajaw';
    ELSIF xp < 3000 THEN RETURN 'Nacom';
    ELSIF xp < 6000 THEN RETURN 'Ah K''in';
    ELSIF xp < 10000 THEN RETURN 'Halach Uinic';
    ELSE RETURN 'K''uk''ulkan';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Si Frontend falla:
- Restaurar mock data imports
- Revertir cambios en useRank.ts

---

## TESTING REQUERIDO

### Test Cases para P0-001
| XP Value | Rango Esperado | Test SQL |
|----------|----------------|----------|
| 0 | Ajaw | `SELECT calculate_maya_rank_from_xp(0)` |
| 250 | Ajaw | `SELECT calculate_maya_rank_from_xp(250)` |
| 500 | Nacom | `SELECT calculate_maya_rank_from_xp(500)` |
| 750 | Nacom | `SELECT calculate_maya_rank_from_xp(750)` |
| 1000 | Ah K'in | `SELECT calculate_maya_rank_from_xp(1000)` |
| 1500 | Halach Uinic | `SELECT calculate_maya_rank_from_xp(1500)` |
| 1900 | K'uk'ulkan | `SELECT calculate_maya_rank_from_xp(1900)` |
| 5000 | K'uk'ulkan | `SELECT calculate_maya_rank_from_xp(5000)` |

### Test Cases para Frontend
1. Usuario nuevo (0 XP) - Debe mostrar Ajaw, progress 0%
2. Usuario con 499 XP - Debe mostrar Ajaw, progress ~99%
3. Usuario con 500 XP - Debe mostrar Nacom, progress 0%
4. Usuario con 1899 XP - Debe mostrar Halach Uinic, progress ~99%
5. Usuario con 1900 XP - Debe mostrar K'uk'ulkan, progress 100%

---

## ESTIMACION TOTAL

| Fase | Tiempo Estimado | Riesgo |
|------|-----------------|--------|
| P0-001 (SQL) | 30 min | Bajo |
| P0-002 (isMinRank) | 10 min | Bajo |
| P0-003 (Progress) | 1 hora | Medio |
| P0-004 (API) | 2-3 horas | Medio |
| Testing | 1 hora | - |
| **TOTAL** | **4-5 horas** | **Medio** |

---

**Proximo Paso:** FASE 4 - Validacion de Impacto en Componentes Dependientes

---

**Autor:** Tech-Leader Agent
**Revision:** 1.0
**Fecha:** 2025-12-14
