# Analisis Detallado: Fallos Tests Gamification Frontend

**Fecha:** 2026-01-18
**Total Fallos:** 93 tests
**Total Passing:** 277 tests
**Cobertura Actual:** 74.9%

---

## 1. Resumen Ejecutivo

Los 93 tests fallando en el modulo gamification se dividen en **3 categorias principales**:

| Categoria | Tests | Porcentaje | Causa Raiz |
|-----------|-------|------------|------------|
| API Response Mismatch | 68 | 73.1% | Mocks no simulan respuestas reales del backend |
| Store State Tracking | 18 | 19.4% | Tests esperan estado local, stores usan API |
| Missing API Mocks | 7 | 7.5% | APIs no mockeadas causan errores |

---

## 2. Fallos por Archivo de Test

### 2.1 economyStore.test.ts (27 fallos - 29%)

**Ubicacion:** `src/features/gamification/economy/store/__tests__/economyStore.test.ts`

**Suites afectadas:**
- Add Coins (4 tests)
- Spend Coins (6 tests)
- Update Balance (1 test)
- Transaction History (4 tests)
- Purchase Operations (5 tests)
- Economy Stats (4 tests)
- Fetch Balance API (3 tests)

**Errores comunes:**
```
expected +0 to be 100 // balance no actualiza
expected [] to have length 1 // transactions vacias
expected false to be true // canAfford incorrecto
Cannot read properties of undefined (reading 'description')
```

**Causa Raiz:**
- `addCoins()` y `spendCoins()` hacen llamadas a `apiClient.patch()`
- El mock devuelve valores estaticos, no acumula cambios
- `balance.current` siempre es 500 (valor del mock) en lugar de acumularse

**Dependencias:**
```
economyStore.ts
├── @/features/auth/store/authStore (useAuthStore.getState().user?.id)
├── @/services/api/apiClient (patch, get)
└── Types: economyTypes.ts
```

---

### 2.2 EconomyIntegration.test.tsx (14 fallos - 15%)

**Ubicacion:** `src/features/gamification/economy/__tests__/EconomyIntegration.test.tsx`

**Suites afectadas:**
- Coin Operations Flow (3 tests)
- Transaction History Flow (3 tests)
- Purchase Flow (4 tests)
- Stats and Calculations (2 tests)
- UI Integration (2 tests)

**Errores comunes:**
```
expected 550 to be 50 // balance incorrecto despues de spend
expected +0 to be 3 // transaction count es 0
expected 'None' to be 'achievement' // topSource incorrecto
```

**Causa Raiz:**
- Mismo problema que economyStore: mocks estaticos
- UI rendering usa estado del store que no se actualiza correctamente

---

### 2.3 DashboardIntegration.test.tsx (12 fallos - 13%)

**Ubicacion:** `src/features/gamification/__tests__/DashboardIntegration.test.tsx`

**Suites afectadas:**
- Cross-Store Synchronization (5 tests)
- Multiple Widgets Coordination (2 tests)
- Data Consistency (2 tests)
- Real-Time Updates (3 tests)

**Errores comunes:**
```
expected +0 to be 50 // XP no se agrega
expected +0 to be 100 // coins no se agregan
expected false to be true // levelUp no detectado
```

**Causa Raiz:**
- Tests prueban integracion entre 3 stores (economy, ranks, achievements)
- Cada store tiene su propio mock de apiClient
- No hay sincronizacion real entre los estados

**Dependencias:**
```
DashboardIntegration.test.tsx
├── useAchievementsStore
├── useEconomyStore
│   └── apiClient (mocked)
├── useRanksStore
│   └── apiClient (mocked)
└── useAuthStore (mocked)
```

---

### 2.4 ranksStore.test.ts (8 fallos - 8.6%)

**Ubicacion:** `src/features/gamification/ranks/store/__tests__/ranksStore.test.ts`

**Suites afectadas:**
- Add XP (3 tests)
- Level Up (3 tests)
- Fetch User Progress API (2 tests)

**Errores comunes:**
```
expected 100 to be 50 // XP devuelto por mock no coincide
expected 1 to be greater than 1 // level no incrementa
expected "spy" to be called at least once // API no llamada
```

**Causa Raiz:**
- `addXP()` depende de respuesta de API para actualizar estado
- Mock devuelve valores fijos que no reflejan el XP agregado
- `levelUp()` se llama solo si `data.leveled_up` es true en respuesta

**Dependencias:**
```
ranksStore.ts
├── @/features/auth/store/authStore
├── @/services/api/apiClient
├── @/config/api.config (API_ENDPOINTS)
└── mockData/ranksMockData.ts (MAYA_RANKS)
```

---

### 2.5 RanksIntegration.test.tsx (8 fallos - 8.6%)

**Ubicacion:** `src/features/gamification/ranks/__tests__/RanksIntegration.test.tsx`

**Suites afectadas:**
- XP Operations (2 tests)
- Level Up Flow (3 tests)
- Multipliers (1 test)
- Edge Cases (2 tests)

**Errores comunes:**
```
expected 50 to be 95 // XP no acumula
expected 1 to be 2 // level no incrementa
expected 2 to be >= 3 // multiplier sources incorrecto
```

---

### 2.6 LeaderboardsIntegration.test.tsx (7 fallos - 7.5%)

**Ubicacion:** `src/features/gamification/social/__tests__/LeaderboardsIntegration.test.tsx`

**Suites afectadas:**
- Set Leaderboard Type (2 tests)
- Refresh Leaderboard (2 tests)
- Loading States (1 test)
- User Rank (1 test)
- Fallback to Mock Data (1 test)

**Errores comunes:**
```
expected 'global' to be 'friends' // type no cambia
expected timestamp to be greater than // refresh no actualiza
expected 'No school ID available' to be 'API Error'
```

**Causa Raiz:**
- `setLeaderboardType()` usa mock data cuando `USE_MOCK_DATA` flag es true
- Pero el mock de `FEATURE_FLAGS` siempre devuelve `USE_MOCK_DATA: true`
- Logica de fallback a mock data no se testea correctamente

**Dependencias:**
```
leaderboardsStore.ts
├── ../api/socialAPI (getLeaderboard, getUserLeaderboardRank)
├── @/features/auth/store/authStore
└── @/config/api.config (FEATURE_FLAGS - no usado directamente)
```

---

### 2.7 GuildsIntegration.test.tsx (7 fallos - 7.5%)

**Ubicacion:** `src/features/gamification/social/__tests__/GuildsIntegration.test.tsx`

**Suites afectadas:**
- Join Guild Flow (2 tests)
- Leave Guild Flow (2 tests)
- Create Guild Flow (3 tests)

**Errores comunes:**
```
expected null not to be null // userGuild no se asigna
expected false to be true // isInGuild no cambia
expected 2 to be 3 // guild count incorrecto
```

**Causa Raiz:**
- `guildsStore` usa `teamsAPI` que no esta mockeado
- Operaciones async fallan silenciosamente

**Dependencias:**
```
guildsStore.ts
├── @/services/api/teamsAPI (teamsAPI)
├── @/services/api/apiClient
├── @/features/auth/store/authStore
└── Types: guildsTypes.ts
```

---

### 2.8 FriendsIntegration.test.tsx (5 fallos - 5.4%)

**Ubicacion:** `src/features/gamification/social/__tests__/FriendsIntegration.test.tsx`

**Suites afectadas:**
- Remove Friend Flow (1 test)
- Friend Requests Flow (4 tests)

**Errores comunes:**
```
expected [] to have length 1 // requests no se agregan
expected false to be true // requestSent no actualiza
```

**Causa Raiz:**
- `friendsStore` usa `friendsAPI` que no esta mockeado
- Metodos como `sendFriendRequest()` hacen llamadas API reales

**Dependencias:**
```
friendsStore.ts
├── @/services/api/friendsAPI (friendsAPI)
├── @/features/auth/store/authStore
└── Types: friendsTypes.ts
```

---

### 2.9 LiveLeaderboard.test.tsx (3 fallos - 3.2%)

**Ubicacion:** `src/features/gamification/leaderboard/LiveLeaderboard.test.tsx`

**Suites afectadas:**
- Rank Display (1 test)
- Accessibility (1 test)
- Integration (1 test)

**Errores comunes:**
```
// Component no renderiza como esperado
// Buttons no accesibles
```

---

### 2.10 achievementsStore.test.ts (2 fallos - 2.2%)

**Ubicacion:** `src/features/gamification/social/store/__tests__/achievementsStore.test.ts`

**Suites afectadas:**
- Fetch Achievements API (2 tests)

**Errores comunes:**
```
expected "spy" to be called // API mapper no invocado
expected achievements to equal // estructura diferente
```

**Causa Raiz:**
- `mapAchievementsToFrontend` mock no transforma datos correctamente

---

## 3. Mapa de Dependencias Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GAMIFICATION MODULE                               │
└─────────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────────────┐
│ economyStore  │    │  ranksStore   │    │    socialStores       │
│               │    │               │    │  ┌─────────────────┐  │
│ - addCoins    │    │ - addXP       │    │  │ achievementsStore│  │
│ - spendCoins  │    │ - levelUp     │    │  │ friendsStore    │  │
│ - fetchBalance│    │ - rankUp      │    │  │ guildsStore     │  │
│               │    │ - prestige    │    │  │ leaderboardsStore│  │
└───────┬───────┘    └───────┬───────┘    │  │ powerUpsStore   │  │
        │                    │            │  └─────────────────┘  │
        │                    │            └───────────┬───────────┘
        │                    │                        │
        └────────────┬───────┴────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   SHARED DEPENDENCIES  │
        ├────────────────────────┤
        │ @/features/auth/store/ │◄── useAuthStore (user.id)
        │   authStore            │
        ├────────────────────────┤
        │ @/services/api/        │◄── apiClient.patch/get
        │   apiClient            │
        ├────────────────────────┤
        │ @/services/api/        │◄── friendsAPI, teamsAPI
        │   [feature]API         │
        ├────────────────────────┤
        │ @/config/api.config    │◄── API_ENDPOINTS, FEATURE_FLAGS
        └────────────────────────┘
```

---

## 4. Plan de Correcciones

### Fase 1: Mocks Dinamicos para Stores Principales (Prioridad Alta)

**Objetivo:** Hacer que los mocks de apiClient simulen comportamiento real del backend

#### 4.1 economyStore - Mock Dinamico

**Archivos a modificar:**
- `src/features/gamification/economy/store/__tests__/economyStore.test.ts`
- `src/features/gamification/economy/__tests__/EconomyIntegration.test.tsx`

**Solucion propuesta:**
```typescript
// Crear helper de mock que trackea estado
const createEconomyApiMock = () => {
  let balance = { current: 0, lifetime: 0, spent: 0 };

  return {
    apiClient: {
      patch: vi.fn().mockImplementation((url, data) => {
        if (data.ml_coins_increment) {
          balance.current += data.ml_coins_increment;
          balance.lifetime += data.ml_coins_increment;
        }
        if (data.ml_coins_decrement) {
          balance.current -= data.ml_coins_decrement;
          balance.spent += data.ml_coins_decrement;
        }
        return Promise.resolve({
          data: {
            ml_coins: balance.current,
            ml_coins_earned_total: balance.lifetime,
            ml_coins_spent_total: balance.spent,
          }
        });
      }),
      get: vi.fn().mockImplementation(() =>
        Promise.resolve({ data: { ...balance } })
      ),
    },
    resetBalance: () => { balance = { current: 0, lifetime: 0, spent: 0 }; },
    setBalance: (b) => { balance = b; },
  };
};
```

**Tests afectados:** 41 tests (27 + 14)

---

#### 4.2 ranksStore - Mock Dinamico

**Archivos a modificar:**
- `src/features/gamification/ranks/store/__tests__/ranksStore.test.ts`
- `src/features/gamification/ranks/__tests__/RanksIntegration.test.tsx`

**Solucion propuesta:**
```typescript
const createRanksApiMock = () => {
  let progress = {
    current_xp: 0,
    total_xp: 0,
    level: 1,
    xp_to_next_level: 100,
    current_rank: 'Nacom',
  };

  return {
    apiClient: {
      patch: vi.fn().mockImplementation((url, data) => {
        progress.current_xp += data.total_xp_increment || 0;
        progress.total_xp += data.total_xp_increment || 0;

        // Simular level up
        let leveled_up = false;
        while (progress.current_xp >= progress.xp_to_next_level) {
          progress.current_xp -= progress.xp_to_next_level;
          progress.level++;
          progress.xp_to_next_level = Math.floor(progress.xp_to_next_level * 1.1);
          leveled_up = true;
        }

        return Promise.resolve({ data: { ...progress, leveled_up } });
      }),
    },
    resetProgress: () => { /* reset */ },
  };
};
```

**Tests afectados:** 16 tests (8 + 8)

---

### Fase 2: Mocks para APIs Externas (Prioridad Media)

#### 4.3 teamsAPI Mock para guildsStore

**Archivos a modificar:**
- `src/features/gamification/social/__tests__/GuildsIntegration.test.tsx`

**Solucion propuesta:**
```typescript
vi.mock('@/services/api/teamsAPI', () => ({
  teamsAPI: {
    getTeams: vi.fn().mockResolvedValue([]),
    getTeamById: vi.fn().mockResolvedValue(null),
    createTeam: vi.fn().mockImplementation((data) =>
      Promise.resolve({ id: 'new-guild-id', ...data })
    ),
    joinTeam: vi.fn().mockResolvedValue({ success: true }),
    leaveTeam: vi.fn().mockResolvedValue({ success: true }),
  },
}));
```

**Tests afectados:** 7 tests

---

#### 4.4 friendsAPI Mock para friendsStore

**Archivos a modificar:**
- `src/features/gamification/social/__tests__/FriendsIntegration.test.tsx`

**Solucion propuesta:**
```typescript
vi.mock('@/services/api/friendsAPI', () => ({
  friendsAPI: {
    getFriends: vi.fn().mockResolvedValue([]),
    getFriendRequests: vi.fn().mockResolvedValue([]),
    sendFriendRequest: vi.fn().mockImplementation((userId) =>
      Promise.resolve({ id: 'req-id', to: userId, status: 'pending' })
    ),
    acceptFriendRequest: vi.fn().mockResolvedValue({ success: true }),
    declineFriendRequest: vi.fn().mockResolvedValue({ success: true }),
    removeFriend: vi.fn().mockResolvedValue({ success: true }),
  },
}));
```

**Tests afectados:** 5 tests

---

### Fase 3: Fixes Menores (Prioridad Baja)

#### 4.5 socialAPI Mock para leaderboardsStore

**Tests afectados:** 7 tests

#### 4.6 achievementsAPI mapAchievementsToFrontend Fix

**Tests afectados:** 2 tests

#### 4.7 LiveLeaderboard Component Tests

**Tests afectados:** 3 tests

---

## 5. Estimacion de Esfuerzo

| Fase | Tests | Complejidad | Estimacion |
|------|-------|-------------|------------|
| Fase 1: Mocks Dinamicos | 57 | Alta | 4-6 horas |
| Fase 2: APIs Externas | 12 | Media | 2-3 horas |
| Fase 3: Fixes Menores | 12 | Baja | 1-2 horas |
| **Total** | **93** | - | **7-11 horas** |

---

## 6. Orden de Implementacion Recomendado

1. **economyStore.test.ts** (27 tests) - Mayor impacto
2. **ranksStore.test.ts** (8 tests) - Dependencia de Dashboard
3. **EconomyIntegration.test.tsx** (14 tests) - Valida #1
4. **RanksIntegration.test.tsx** (8 tests) - Valida #2
5. **DashboardIntegration.test.tsx** (12 tests) - Depende de #1-4
6. **GuildsIntegration.test.tsx** (7 tests) - Independiente
7. **FriendsIntegration.test.tsx** (5 tests) - Independiente
8. **LeaderboardsIntegration.test.tsx** (7 tests) - Independiente
9. **achievementsStore.test.ts** (2 tests) - Rapido
10. **LiveLeaderboard.test.tsx** (3 tests) - UI fix

---

## 7. Criterios de Exito

- [ ] 0 errores de tipo "User not authenticated" (COMPLETADO)
- [ ] 0 errores de tipo "Network Error"
- [ ] Tests de economy: balance acumula correctamente
- [ ] Tests de ranks: XP acumula y level up funciona
- [ ] Tests de integration: cross-store sync funciona
- [ ] Cobertura gamification >= 95%

---

## 8. DISCREPANCIAS FRONTEND ↔ BACKEND (CRITICO)

### 8.1 Resumen de Incoherencias

Se identificaron **12 discrepancias principales** entre las estructuras del frontend y backend:

| Severidad | Cantidad | Impacto |
|-----------|----------|---------|
| 🔴 CRITICAS | 5 | Bloquean funcionalidad |
| 🟠 ALTAS | 5 | Requieren mapeo manual |
| 🟡 MEDIAS | 4 | Workarounds posibles |

### 8.2 Discrepancias Criticas (Bloquean tests)

#### A. UserRankProgress - Estructura completamente diferente

**Frontend espera** (`ranksTypes.ts`):
```typescript
interface UserRankProgress {
  currentRank: MayaRank;
  currentLevel: number;      // ❌ NO EXISTE EN BACKEND
  currentXP: number;         // ❌ NO EXISTE EN BACKEND
  xpToNextLevel: number;     // ❌ NO EXISTE EN BACKEND
  totalXP: number;           // ❌ NO EXISTE EN BACKEND
  prestigeLevel: number;     // ❌ NO EXISTE EN BACKEND
  multiplier: number;
  activityStreak: number;    // ❌ NO EXISTE EN BACKEND
  canRankUp: boolean;        // ❌ NO EXISTE EN BACKEND
  canPrestige: boolean;      // ❌ NO EXISTE EN BACKEND
}
```

**Backend devuelve** (`user-rank.entity.ts`):
```typescript
// Diseño centrado en HISTORIAL de rangos (múltiples registros)
current_rank: MayaRank;
previous_rank?: MayaRank;
rank_progress_percentage: number;
modules_required_for_next?: number;
modules_completed_for_rank: number;
xp_required_for_next?: number;
xp_earned_for_rank: number;
// NO tiene: currentLevel, currentXP, totalXP, prestigeLevel, etc.
```

**Impacto en tests:** ranksStore.test.ts (8 fallos), RanksIntegration.test.tsx (8 fallos)

---

#### B. Multipliers Endpoint - NO IMPLEMENTADO

**Frontend llama**:
```typescript
// GET /gamification/ranks/:userId/multipliers
export const getMultipliers = async (userId: string): Promise<MultiplierBreakdown>
```

**Backend NO tiene** este endpoint en `ranks.controller.ts`.

**Impacto en tests:** Tests de multipliers fallan por endpoint inexistente.

---

#### C. AddXP/Prestige - Endpoints comentados

En `ranksAPI.ts` los endpoints están **comentados** con nota:
```typescript
// ⚠️ NOT IMPLEMENTED - Backend endpoint does not exist
// XP is managed through user_stats module, not ranks module
```

**Impacto en tests:** Tests de XP y prestige no pueden funcionar.

---

#### D. ShopItem DTO - Campos faltantes

**Frontend espera**: `max_per_user`, `duration_days`, `effect_data`
**Backend DTO NO expone** estos campos (existen en entity pero no en DTO)

**Impacto en tests:** Purchase operations fallan por campos faltantes.

---

#### E. Transaction source vs reference_type

**Frontend usa**: `source: EarningSource` (ej: "exercise_completion")
**Backend usa**: `reference_type` (ej: "exercise")

**Impacto en tests:** 27 fallos en economyStore por mismatch de campos.

---

### 8.3 Nomenclatura snake_case vs camelCase

| Campo Frontend | Campo Backend | Archivo |
|----------------|---------------|---------|
| `balanceAfter` | `balance_after` | economyTypes.ts |
| `maxMembers` | `max_members` | guildsTypes.ts |
| `isUnlocked` | `is_unlocked` | achievementsTypes.ts |
| `mlCoinsReward` | `ml_coins_reward` | achievementsTypes.ts |
| `xpReward` | (NO EXISTE) | achievementsTypes.ts |

---

### 8.4 Relacion Discrepancias ↔ Fallos de Tests

```
┌────────────────────────────────────────────────────────────────────┐
│                    MAPA DE IMPACTO                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DISCREPANCIA                    TESTS AFECTADOS                   │
│  ─────────────                   ────────────────                   │
│                                                                     │
│  UserRankProgress incompatible ──► ranksStore.test.ts (8)          │
│                                 ──► RanksIntegration.test.tsx (8)   │
│                                 ──► DashboardIntegration (12)       │
│                                                                     │
│  Transaction source mismatch ────► economyStore.test.ts (27)       │
│                                 ──► EconomyIntegration.test.tsx (14)│
│                                                                     │
│  ShopItem DTO campos faltantes ──► Purchase tests (5)              │
│                                                                     │
│  Multipliers endpoint missing ───► Multiplier tests (3)            │
│                                                                     │
│  AchievementWithProgress ────────► achievementsStore.test.ts (2)   │
│  composición manual requerida                                       │
│                                                                     │
│  teamsAPI/friendsAPI ────────────► GuildsIntegration (7)           │
│  no mockeados                   ──► FriendsIntegration (5)          │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 9. Plan de Correcciones Actualizado

### Fase 0: Alineación Backend-Frontend (NUEVA - Prioridad Máxima)

**Objetivo:** Resolver discrepancias estructurales antes de arreglar mocks

| Tarea | Descripcion | Impacto |
|-------|-------------|---------|
| 0.1 | Implementar endpoint `/multipliers` en backend | 3 tests |
| 0.2 | Agregar campos faltantes a ShopItemResponseDto | 5 tests |
| 0.3 | Crear DTO compuesto UserRankProgressDto | 28 tests |
| 0.4 | Documentar mapeo source ↔ reference_type | 41 tests |

**Estimación:** 4-6 horas adicionales

### Fases 1-3: Sin cambios (ver secciones anteriores)

---

## 10. Criterios de Exito Actualizados

- [ ] DTOs backend exponen todos los campos requeridos
- [ ] Endpoint `/multipliers` implementado
- [ ] Mapeo source/reference_type documentado
- [ ] 0 errores de tipo "User not authenticated" ✅ (COMPLETADO)
- [ ] 0 errores de tipo "Network Error"
- [ ] Tests de economy: balance acumula correctamente
- [ ] Tests de ranks: XP acumula y level up funciona
- [ ] Tests de integration: cross-store sync funciona
- [ ] Cobertura gamification >= 95%

---

*Documento generado: 2026-01-18*
*Actualizado con análisis de coherencia frontend ↔ backend*
*Autor: Claude-Agent*
