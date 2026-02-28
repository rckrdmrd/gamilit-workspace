---
title: Student Portal Hooks — Gamification
status: activo
last_updated: "2026-02-28"
---

## Categoria: Gamification

### useAchievementsEnhanced

**Archivo:** `hooks/useAchievementsEnhanced.ts`
**Proposito:** Hook completo para achievements con filtrado, busqueda y estadisticas.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| userId | `string \| undefined` | No | ID usuario para fetch real |

#### Retorno

```typescript
interface UseAchievementsEnhancedResult {
  // Data
  achievements: Achievement[];
  filteredAchievements: Achievement[];
  statistics: AchievementStatisticsData;

  // Filters
  filters: AchievementFiltersState;
  setFilter: (key: keyof AchievementFiltersState, value: any) => void;
  clearFilters: () => void;

  // Navigation
  selectedAchievement: Achievement | null;
  selectAchievement: (achievement: Achievement | null) => void;
  nextAchievement: () => void;
  previousAchievement: () => void;
  hasNext: boolean;
  hasPrevious: boolean;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
}

interface AchievementFiltersState {
  category: AchievementCategory | 'all';
  rarity: AchievementRarity | 'all';
  status: 'all' | 'unlocked' | 'locked' | 'in_progress';
  searchQuery: string;
  sortBy: 'recent' | 'alphabetical' | 'rarity' | 'progress';
}

interface AchievementStatisticsData {
  total: number;
  unlocked: number;
  locked: number;
  inProgress: number;
  completionRate: number;
  pointsEarned: number;
  mlCoinsEarned: number;
  byRarity: Record<AchievementRarity, number>;
  byCategory: Record<AchievementCategory, number>;
  recentUnlocks: Achievement[];
  rarestUnlocked: Achievement[];
}

type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
type AchievementCategory = 'progress' | 'streak' | 'completion' | 'social' | 'special' | 'mastery' | 'exploration' | 'collection' | 'hidden';
```

#### Ejemplo de uso

```typescript
const {
  filteredAchievements,
  statistics,
  filters,
  setFilter,
  clearFilters,
  selectedAchievement,
  selectAchievement,
  loading
} = useAchievementsEnhanced(userId);

return (
  <AchievementsPage>
    <StatsBar
      unlocked={statistics.unlocked}
      total={statistics.total}
      completionRate={statistics.completionRate}
    />

    <FilterBar>
      <Select
        value={filters.category}
        onChange={(v) => setFilter('category', v)}
      />
      <SearchInput
        value={filters.searchQuery}
        onChange={(v) => setFilter('searchQuery', v)}
      />
      <Button onClick={clearFilters}>Clear</Button>
    </FilterBar>

    <AchievementGrid achievements={filteredAchievements} />

    {selectedAchievement && (
      <AchievementModal achievement={selectedAchievement} />
    )}
  </AchievementsPage>
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | (via achievementsStore) | Lista de achievements del usuario |

#### Dependencias

- `useAchievementsStore` - Zustand store de achievements
- `Achievement`, `AchievementCategory`, `AchievementRarity` types
- `localStorage` para persistir filtros

#### Notas importantes

- Los filtros se persisten en localStorage
- Debounce de 300ms en busqueda
- Si no hay userId, solo refresca estadisticas locales

---

### useExercisePowerUps

**Archivo:** `hooks/useExercisePowerUps.ts`
**Proposito:** Gestiona power-ups durante la ejecucion de ejercicios con sincronizacion al backend.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| exerciseId | `string` | Si | ID del ejercicio |
| userId | `string \| undefined` | No | ID usuario para sync backend |
| onHintReveal | `(hintCount: number) => void` | No | Callback pistas reveladas |
| onTimeExtension | `(seconds: number) => void` | No | Callback extension tiempo |
| onSecondChance | `() => void` | No | Callback segunda oportunidad |
| onVisionActivate | `() => void` | No | Callback vision activa |

#### Retorno

```typescript
interface UseExercisePowerUpsReturn {
  // Power-ups
  availablePowerUps: PowerUp[];
  activePowerUps: PowerUp[];
  allPowerUps: PowerUp[];

  // Actions
  activatePowerUp: (powerUpId: string) => Promise<boolean>;
  resetEffects: () => void;
  getUsedPowerUps: () => string[];
  isPowerUpActive: (effectType: string) => boolean;

  // Effects
  effects: PowerUpEffects;

  // State
  isLoading: boolean;
  error: string | null;

  // Utilities
  hasAvailablePowerUps: boolean;
  hasActivePowerUps: boolean;
}

interface PowerUpEffects {
  hintsRevealed: number;
  timeExtension: number;
  hasSecondChance: boolean;
  visionActive: boolean;
  multiplierActive: boolean;
}
```

#### Ejemplo de uso

```typescript
const {
  availablePowerUps,
  activatePowerUp,
  effects,
  isLoading,
  error,
  getUsedPowerUps
} = useExercisePowerUps({
  exerciseId: 'exercise-123',
  userId: user?.id,
  onHintReveal: (count) => setVisibleHints(count),
  onTimeExtension: (seconds) => addTime(seconds)
});

// Activar power-up
const handleUsePowerUp = async (id: string) => {
  const success = await activatePowerUp(id);
  if (!success) {
    toast.error(error);
  }
};

// Incluir en submission
const handleSubmit = () => {
  submitExercise({
    answers,
    powerUpsUsed: getUsedPowerUps()
  });
};
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/gamification/comodines/use` | Registrar uso de comodin |

#### Mapeo Frontend a Backend

```typescript
const comodinTypeMap: Record<string, string> = {
  'powerup-001': 'pistas',            // Pistas Mejoradas
  'powerup-002': 'vision_lectora',    // Vision Lectora
  'powerup-003': 'segunda_oportunidad', // Segunda Oportunidad
  'powerup-004': 'pistas',            // Extension de Tiempo (fallback)
};
```

#### Dependencias

- `usePowerUps` de `@/features/gamification/social/hooks/usePowerUps`
- `apiClient` para sync con backend

---
