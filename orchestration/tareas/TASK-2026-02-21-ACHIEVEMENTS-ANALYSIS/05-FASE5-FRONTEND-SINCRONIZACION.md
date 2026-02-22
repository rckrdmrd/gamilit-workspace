# FASE 5: Frontend Integration and State Synchronization

**Fecha:** 2026-02-21
**Modo:** ANALYSIS (C+A+P)
**Alcance:** Verificar la arquitectura frontend y sincronizacion de estado para el sistema de achievements

---

## 1. MAPA DE DEPENDENCIAS FRONTEND

```
apps/frontend/src/
|
|-- shared/types/achievement.types.ts                    [SSOT - TIPOS CANONICOS]
|   |   Achievement, UserAchievement, AchievementSummary,
|   |   AchievementFilter, AchievementStatus, AchievementCategory
|   |
|-- features/gamification/
|   |
|   |-- achievements/
|   |   |-- hooks/useAchievements.ts                     [CANONICO - React Query]
|   |   |   +-- usa: gamificationApi (canonico)
|   |   |   +-- usa: achievementKeys (query keys)
|   |   |   +-- exporta: useAchievements(), useAchievementFilters()
|   |   |
|   |   +-- utils/achievementTransformer.ts              [CANONICO - Transformador]
|   |       +-- transformAchievement() (snake_case -> camelCase)
|   |       +-- transformUserAchievement()
|   |       +-- transformAchievements(), transformUserAchievements()
|   |
|   |-- social/
|   |   |-- store/achievementsStore.ts                   [DEPRECADO - Zustand]
|   |   |   +-- usa: gamificationApi (migrado via REC-008)
|   |   |   +-- fetchAchievements(), unlockAchievement()
|   |   |   +-- IMPORTADO POR 3 archivos activos del portal estudiante
|   |   |
|   |   |-- hooks/useAchievements.ts                     [DEPRECADO - wrapper Zustand]
|   |   |   +-- wrapper sobre achievementsStore
|   |   |   +-- NO importado por ningun componente activo
|   |   |
|   |   |-- api/achievementsAPI.ts                       [DEPRECADO - API legacy]
|   |   |   +-- marcado @deprecated REC-008
|   |   |   +-- NO importado por ningun componente activo
|   |   |
|   |   +-- types/achievementsTypes.ts                   [LEGACY - re-export desde SSOT]
|   |       +-- Achievement = AchievementWithProgress (view model)
|   |       +-- importado por: achievementsStore, useAchievementsEnhanced
|   |
|   |-- hooks/useGamificationSocket.ts                   [ACTIVO - WebSocket handler]
|   |   +-- handleAchievementUnlocked() -> invalidate ['achievements']
|   |   +-- usado por: GamificationOverlay
|   |
|   +-- components/GamificationOverlay.tsx               [ACTIVO - DOM event listener]
|       +-- escucha: 'gamilit:achievement:unlocked'
|       +-- renderiza: banner de achievement desbloqueado
|       +-- montado en: ProtectedRoute (todas las paginas autenticadas)
|
|-- services/api/gamification/gamificationAPI.ts         [CANONICO - API centralizada]
|   +-- getAllAchievements() -> transformAchievements()
|   +-- getUserAchievements() -> transformUserAchievements()
|   +-- getAchievementSummary()
|   +-- claimAchievement()
|
|-- apps/student/
|   |-- pages/AchievementsPage.tsx                       [ACTIVO - Pagina principal]
|   |   +-- usa: useAchievements (CANONICO React Query)
|   |   +-- usa: useAchievementFilters (CANONICO)
|   |   +-- NO usa: achievementsStore (Zustand)
|   |
|   |-- hooks/useProfileData.ts                          [ACTIVO - USA ZUSTAND DEPRECADO]
|   |   +-- importa: achievementsStore (DEPRECADO)
|   |   +-- llama: fetchAchievements(userId)
|   |
|   |-- hooks/useAchievementsEnhanced.ts                 [ACTIVO - USA ZUSTAND DEPRECADO]
|   |   +-- importa: achievementsStore (DEPRECADO)
|   |   +-- filtering/sorting avanzado
|   |
|   +-- components/exercise/CompletionModal.tsx           [DEPRECADO - USA ZUSTAND]
|       +-- importa: achievementsStore.unlockAchievement
|       +-- marcado @deprecated, usar FeedbackModal
|
|-- shared/components/
|   |-- mechanics/FeedbackModal.tsx                      [ACTIVO - Modal de feedback]
|   |   +-- renderiza: achievements del FeedbackData
|   |   +-- usa: CompletionModalSections.AchievementsList
|   |
|   |-- AchievementCard.tsx                              [ACTIVO - Card modelo relacional]
|   |   +-- usa: Achievement + UserAchievement separados
|   |   +-- muestra: locked, in_progress, earned, claimed
|   |
|   +-- AchievementModal.tsx                             [ACTIVO - Modal de detalle]
|
|-- features/exercises/context/ExerciseContext.tsx        [ACTIVO - Submit handler]
|   +-- llama: submitExercise() de educationalAPI
|   +-- mapea: result.achievements -> FeedbackData.achievements
|   +-- NO invalida cache de achievements React Query
|
|-- features/notifications/hooks/useWebSocket.ts         [ACTIVO - Socket.IO]
|   +-- escucha: 'achievement:unlocked' -> dispatch DOM event
|   +-- 'gamilit:achievement:unlocked' -> GamificationOverlay
|
+-- features/progress/api/progressAPI.ts                 [ACTIVO - API alternativa submit]
    +-- submitExercise() con mock data
    +-- SubmitExerciseResponse incluye achievements? (tipo)
```

---

## 2. VERIFICACIONES

### VP-1: AchievementsPage usa React Query (canonico) y NO el Zustand store deprecado

**RESULTADO: CORRECTO**

**Evidencia:**
- `apps/frontend/src/apps/student/pages/AchievementsPage.tsx:23-25`:
  ```typescript
  import {
    useAchievements,
    useAchievementFilters,
  } from '@/features/gamification/achievements/hooks/useAchievements';
  ```
- Linea 34-41: Usa `useAchievements()` de React Query, NO el store Zustand.
- Los tipos importados son de `@/shared/types/achievement.types` (SSOT), no de `social/types/achievementsTypes`.

**Sin embargo**, 3 archivos activos del portal estudiante SIGUEN usando el store Zustand deprecado:
1. `apps/frontend/src/apps/student/hooks/useProfileData.ts:14` - importa `useAchievementsStore`
2. `apps/frontend/src/apps/student/hooks/useAchievementsEnhanced.ts:7` - importa `useAchievementsStore`
3. `apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx:40` - importa `useAchievementsStore`

---

### VP-2: WebSocket event `achievement:unlocked` invalida React Query caches

**RESULTADO: CORRECTO**

**Evidencia:**
- `apps/frontend/src/features/notifications/hooks/useWebSocket.ts:257-259`:
  ```typescript
  socket.on('achievement:unlocked', (data: unknown) => {
    window.dispatchEvent(new CustomEvent('gamilit:achievement:unlocked', { detail: data }));
  });
  ```
- `apps/frontend/src/features/gamification/components/GamificationOverlay.tsx:50`:
  ```typescript
  ['gamilit:achievement:unlocked', (e) => handleAchievementUnlocked((e as CustomEvent).detail)],
  ```
- `apps/frontend/src/features/gamification/hooks/useGamificationSocket.ts:116-120`:
  ```typescript
  const handleAchievementUnlocked = useCallback((data: AchievementUnlockedData) => {
    setShowAchievement(data);
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
    queryClient.invalidateQueries({ queryKey: ['userStats'] });
  }, [queryClient]);
  ```
- La invalidacion usa `queryKey: ['achievements']` que coincide con `achievementKeys.all = ['achievements']` definido en `useAchievements.ts:27`.
- `GamificationOverlay` esta montado en `ProtectedRoute.tsx:104`, garantizando que esta presente en TODAS las paginas autenticadas.

**Flujo completo verificado:**
```
Backend -> Socket.IO 'achievement:unlocked'
  -> useWebSocket -> DOM CustomEvent 'gamilit:achievement:unlocked'
    -> GamificationOverlay -> handleAchievementUnlocked()
      -> queryClient.invalidateQueries(['achievements'])
      -> React Query refetch en AchievementsPage
      -> Banner visual de achievement desbloqueado
```

---

### VP-3: FeedbackModal recibe achievements del backend response

**RESULTADO: PARCIALMENTE CORRECTO - GAP CRITICO IDENTIFICADO**

**Flujo analizado:**

1. **ExerciseContext.tsx** (linea 205-268) llama a `submitExercise()` de `educationalAPI.ts` y mapea `result.achievements` a `FeedbackData.achievements`:
   ```typescript
   // ExerciseContext.tsx:254-259
   achievements: result.achievements?.map(a => ({
     name: a.name,
     description: a.description,
     icon: a.icon,
     rarity: 'common', // HARDCODED!
   })),
   ```

2. **FeedbackModal.tsx** (linea 166-171) renderiza achievements si existen:
   ```typescript
   {feedback.achievements && feedback.achievements.length > 0 && (
     <AchievementsList achievements={feedback.achievements.map(a => ({
       name: a.name, description: a.description, icon: a.icon,
       rarity: a.rarity, mlCoinsReward: a.mlCoinsReward ?? 0, xpReward: a.xpReward ?? 0,
     }))} />
   )}
   ```

3. **PROBLEMA CRITICO: El backend NO incluye achievements en la respuesta del submit.**

   - `apps/backend/src/modules/educational/controllers/exercises.controller.ts:1098-1115`:
     ```typescript
     return {
       attemptId: savedAttempt.id,
       score: score,
       isPerfect: score === 100 && normalized.hintsUsed === 0,
       // ... rewards, feedback ...
       rankUp: null, // TODO: Detectar rank up desde user_stats
     };
     // NO incluye campo 'achievements'
     ```
   - El `SubmitExerciseResponseDto` (backend DTO) NO tiene campo `achievements`.
   - El backend detecta achievements via `detectAndGrantEarned()` (linea 546) PERO no retorna los logros recien otorgados en la respuesta HTTP.
   - Los achievements se notifican SOLO via WebSocket (`achievement:unlocked`), no en la respuesta sincroica del submit.

4. **El frontend ExerciseSubmissionResult type SI tiene el campo `achievements?`** (educationalAPI.ts:79-84), pero el backend nunca lo llena en produccion. Solo el mock data lo genera.

**Consecuencia:** En produccion, `result.achievements` siempre sera `undefined`, por lo que FeedbackModal NUNCA mostrara achievements desbloqueados en el modal de completacion de ejercicio. Los usuarios solo veran el banner de GamificationOverlay (via WebSocket), que desaparece en 3-5 segundos y no muestra detalles de rewards.

---

### VP-4: La API social deprecada NO es usada en componentes activos del portal estudiante

**RESULTADO: PARCIALMENTE CORRECTO**

- `apps/frontend/src/features/gamification/social/api/achievementsAPI.ts`: Marcado `@deprecated REC-008`. **NO importado** por ningun componente activo. Correcto.

- Sin embargo, el **store Zustand** (`social/store/achievementsStore.ts`) que fue migrado para usar `gamificationApi` en vez de `achievementsAPI`, **SI es importado** por 3 archivos activos del portal estudiante:

  | Archivo | Linea | Uso |
  |---------|-------|-----|
  | `useProfileData.ts` | 14 | `fetchAchievements(userId)` para Profile page |
  | `useAchievementsEnhanced.ts` | 7 | Filtering/sorting avanzado |
  | `CompletionModal.tsx` | 40 | `unlockAchievement(id)` local (no API call) |

- Tambien importado en:
  - `_testing/GamificationTestPage.tsx` (archivo de testing, no produccion)
  - `__tests__/DashboardIntegration.test.tsx` (test)

**Riesgo:** El store Zustand y React Query operan como dos fuentes de verdad paralelas. Si `useProfileData` llama a `fetchAchievements()` del store Zustand, y `AchievementsPage` usa React Query, los datos pueden quedar desincronizados.

---

### VP-5: El transformer maneja correctamente todos los campos (rewards.ml_coins -> mlCoins, etc.)

**RESULTADO: CORRECTO**

**Evidencia del transformador** (`achievementTransformer.ts:252-306`):

| Campo Backend (snake_case) | Campo Frontend (camelCase) | Linea |
|---------------------------|--------------------------|-------|
| `rewards.ml_coins` | `rewards.mlCoins` | 258 |
| `rewards.xp` | `rewards.xp` | 257 |
| `points_value` (fallback) | `rewards.xp` | 257 |
| `ml_coins_reward` (fallback) | `rewards.mlCoins` | 258 |
| `is_secret` | `isHidden` | 287 |
| `is_active` | `is_active` (mantenido snake) | 291 |
| `is_repeatable` | `is_repeatable` (mantenido snake) | 292 |
| `detailed_description` | `detailedDescription` | 274 |
| `created_at` | `createdAt` | 303 |
| `updated_at` | `updatedAt` | 304 |

**Para UserAchievement** (`achievementTransformer.ts:173-210`):

| Campo Backend | Campo Frontend | Linea |
|--------------|---------------|-------|
| `user_id` | `userId` | 201 |
| `achievement_id` | `achievementId` | 202 |
| `completed_at` | `earnedAt` | 185 |
| `rewards_claimed` + `completed_at` | `claimedAt` | 189-191 |
| `is_completed` + `rewards_claimed` | `status` (calculado) | 177-181 |

**Manejo defensivo:**
- `safeToISOString()` previene `RangeError: Invalid time value` (CORR-ACHIEVEMENTS-006)
- `transformUserAchievements()` valida que el input sea array (linea 221)
- Nullish coalescing (`??`) usado correctamente para valores 0 (CORR-P0-003)

**Observacion menor:** El campo `progress` en UserAchievement se transforma como numero directo (0-100), pero el tipo Achievement en el store Zustand espera `{ current, required }`. El store Zustand maneja esto con `progress: userProgress ? { current: userProgress.progress ?? 0, required: 100 } : undefined` (achievementsStore.ts:197), usando un `required: 100` hardcodeado que pierde el `max_progress` real del backend.

---

### VP-6: AchievementsPage muestra los estados correctos: locked, in_progress, earned, claimed

**RESULTADO: CORRECTO**

**Evidencia:**

1. **Calculo de estado** - `useAchievements.ts:164-170` combina Achievement + UserAchievement:
   ```typescript
   const combinedAchievements = useMemo(() => {
     const userAchMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));
     return allAchievements.map((achievement) => ({
       achievement,
       userAchievement: userAchMap.get(achievement.id),
     }));
   }, [allAchievements, userAchievements]);
   ```

2. **Filtro por estado** - `useAchievementFilters` (linea 303-315):
   ```typescript
   const status = item.userAchievement?.status || 'locked'; // Default a 'locked'
   const isLocked = status === 'locked';
   const isEarned = status === 'earned' || status === 'claimed';
   ```
   Segrega en: `earned` (earned+claimed), `pending` (in_progress+locked no-hidden), `hidden` (locked+isHidden).

3. **Rendering en AchievementCard.tsx** (linea 95-98):
   ```typescript
   const isLocked = status === 'locked';
   const isEarned = status === 'earned' || status === 'claimed';
   const isClaimed = status === 'claimed';
   const isInProgress = status === 'in_progress';
   ```
   Cada estado tiene badge visual:
   - `locked`: gris + icono Lock + "Bloqueado"
   - `in_progress`: azul + barra de progreso + "%"
   - `earned`: verde + CheckCircle + "Ganado"
   - `claimed`: morado + Gift + "Reclamado"

4. **Summary stats** - AchievementsPage.tsx:114-137 muestra 5 metricas: Total, Ganados, Completado%, En Progreso, Bloqueados.

5. **Hidden achievements** - AchievementsPage.tsx:236-255 muestra seccion separada de "Logros Ocultos".

---

### VP-7: Componentes usando mock data en vez de API real

**RESULTADO: HALLAZGO MEDIO**

1. **progressAPI.ts** tiene funciones mock con flag `FEATURE_FLAGS.USE_MOCK_DATA`:
   - `mockSubmitExercise()` (linea 238-285) - genera achievements mock en respuestas perfectas
   - `mockGetUserProgress()`, `mockGetModuleProgress()` - datos hardcoded
   - **Si el flag esta activo en produccion, los datos son falsos.**

2. **educationalAPI.ts** (linea 517-581) tiene mock data en `submitExercise()`:
   - Genera `achievements` mock solo cuando `USE_MOCK_DATA` esta activo
   - **En produccion (flag off), el backend no retorna achievements (VP-3).**

3. **achievementsStore.ts** (linea 73) - `achievements: []` inicializado vacio, NO mock data. Correcto desde REC-008.

4. **AchievementsPage.tsx** - 100% datos reales via React Query. NO mock data. Correcto.

5. **CompletionModal.tsx** (deprecado) - No usa mock data, pero su `unlockAchievement()` es una operacion local del store Zustand (no llama al backend). Esto significa que cuando el CompletionModal "desbloquea" un achievement en el store, no se sincroniza con el servidor.

---

## 3. HALLAZGOS (Lo que funciona correctamente)

### H-01: AchievementsPage usa arquitectura moderna React Query
La pagina principal de logros (`AchievementsPage.tsx`) esta correctamente migrada a React Query con el hook canonico `useAchievements()`. No tiene dependencias del store Zustand deprecado.

### H-02: Transformer robusto y defensivo
El `achievementTransformer.ts` maneja correctamente todos los mapeos snake_case a camelCase, con fallbacks para campos alternativos (`ml_coins_reward` vs `rewards.ml_coins`), validacion segura de fechas, y manejo de arrays no validos.

### H-03: WebSocket -> React Query pipeline funcional
El pipeline completo funciona: Socket.IO event -> DOM CustomEvent -> GamificationOverlay -> handleAchievementUnlocked -> `queryClient.invalidateQueries(['achievements'])`. Esto garantiza que la pagina de logros se actualiza en tiempo real cuando el backend otorga un nuevo achievement.

### H-04: GamificationOverlay montado globalmente
El componente esta montado en `ProtectedRoute.tsx` que envuelve todas las rutas protegidas, garantizando que el banner de achievement desbloqueado es visible en CUALQUIER pagina de la aplicacion.

### H-05: AchievementCard soporta los 4 estados correctamente
El componente `AchievementCard.tsx` renderiza correctamente `locked`, `in_progress`, `earned` y `claimed` con indicadores visuales diferenciados (iconos, colores, badges, barra de progreso).

### H-06: API deprecada correctamente aislada
La API legacy `achievementsAPI.ts` esta marcada `@deprecated`, NO es importada por ningun componente activo de produccion, y el store Zustand fue migrado para usar `gamificationApi` canonico.

### H-07: Claim mutation invalida caches relacionados
El `claimRewards()` en `useAchievements.ts` invalida correctamente: user achievements, summary, shop, inventory, balance, userStats, y dashboard. Esto garantiza que la UI se actualiza tras reclamar rewards.

---

## 4. PROBLEMAS

### P-01: Backend NO retorna achievements en respuesta de submit [CRITICO]

**Archivo:** `apps/backend/src/modules/educational/controllers/exercises.controller.ts:1098-1115`
**Severidad:** CRITICO

El endpoint `POST /exercises/:id/submit` del backend:
1. Ejecuta `detectAndGrantEarned()` para otorgar achievements (linea 546)
2. NO incluye los achievements otorgados en la respuesta HTTP
3. El campo `achievements` NO existe en `SubmitExerciseResponseDto`

El frontend `ExerciseContext.tsx:254-259` intenta mapear `result.achievements` a `FeedbackData`, pero este campo siempre es `undefined` en produccion.

**Consecuencia:** Los usuarios NUNCA ven achievements desbloqueados en el modal de completacion de ejercicio. Solo ven el banner fugaz de GamificationOverlay (3-5 segundos via WebSocket).

**Nota adicional:** El mock data en `educationalAPI.ts:564-573` SI genera achievements, creando una discrepancia entre dev (con mock) y produccion (sin achievements en response).

### P-02: ExerciseContext hardcodea rarity a 'common' [MEDIO]

**Archivo:** `apps/frontend/src/features/exercises/context/ExerciseContext.tsx:254-259`
**Severidad:** MEDIO

```typescript
achievements: result.achievements?.map(a => ({
  name: a.name,
  description: a.description,
  icon: a.icon,
  rarity: 'common', // BUG: Ignora a.rarity del backend
})),
```

Incluso si P-01 se resuelve y el backend retorna achievements con rarity, el ExerciseContext lo sobreescribe a `'common'`. Ademas, falta mapear `mlCoinsReward` y `xpReward`, que FeedbackModal espera en su AchievementsList.

### P-03: Doble fuente de verdad - Zustand store vs React Query [ALTO]

**Archivos:**
- `apps/frontend/src/apps/student/hooks/useProfileData.ts:14`
- `apps/frontend/src/apps/student/hooks/useAchievementsEnhanced.ts:7`
- `apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx:40`
**Severidad:** ALTO

3 archivos activos del portal estudiante usan el store Zustand deprecado `achievementsStore`, mientras que `AchievementsPage` usa React Query. Esto crea dos fuentes de verdad paralelas con posible desincronizacion:

| Componente | Fuente | Stale Time |
|-----------|--------|------------|
| AchievementsPage | React Query | 5 min (all), 2 min (user) |
| ProfilePage (via useProfileData) | Zustand store | No cache management |
| useAchievementsEnhanced | Zustand store | No cache management |
| CompletionModal (deprecated) | Zustand store | Local-only unlock |

### P-04: CompletionModal aplica rewards localmente sin backend [MEDIO]

**Archivo:** `apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx:134-147`
**Severidad:** MEDIO

```typescript
const applyRewards = async () => {
  await addXP(xpGained, 'exercise_completion', exerciseId);
  earnCoins(mlCoinsGained, TransactionTypeEnum.EARNED_EXERCISE, ...);
  checkRankUp();
  achievements.forEach((a) => unlockAchievement(a.id)); // Solo local store!
};
```

El `unlockAchievement()` del Zustand store solo actualiza el estado local (linea 86-109 de achievementsStore.ts). No llama a ninguna API del backend. Si la pagina se recarga, el estado local se pierde.

Nota: Este componente esta marcado `@deprecated`, pero sigue importado y potencialmente utilizado.

### P-05: UserAchievement.progress usa required: 100 hardcoded en Zustand store [BAJO]

**Archivo:** `apps/frontend/src/features/gamification/social/store/achievementsStore.ts:197`
**Severidad:** BAJO

```typescript
progress: userProgress
  ? { current: userProgress.progress ?? 0, required: 100 }
  : undefined,
```

El `required: 100` esta hardcoded. El backend puede tener `max_progress` diferente para cada achievement. El hook canonico `useAchievements.ts` NO tiene este problema porque trabaja con el `progress` numerico directo de `UserAchievement`.

### P-06: rankUp siempre null en la respuesta del backend [MEDIO]

**Archivo:** `apps/backend/src/modules/educational/controllers/exercises.controller.ts:1114`
**Severidad:** MEDIO

```typescript
rankUp: null, // TODO: Detectar rank up desde user_stats
```

El backend tiene un TODO para detectar rank-up pero retorna `null`. El frontend (`ExerciseContext.tsx:260-265`) mapea `result.rankUp` al FeedbackModal, pero como siempre es `null`, el `RankUpNotification` nunca se muestra en el modal de completacion.

El rank-up solo se notifica via WebSocket (`rank:updated`), que muestra un modal separado via GamificationOverlay.

### P-07: ExerciseContext no invalida cache de achievements [BAJO]

**Archivo:** `apps/frontend/src/features/exercises/context/ExerciseContext.tsx:212`
**Severidad:** BAJO

Despues de `submitExercise()`, ExerciseContext llama `syncAndInvalidate()` (dashboard invalidation) pero NO invalida el cache de achievements de React Query. La invalidacion solo ocurre via WebSocket (cuando el backend emite `achievement:unlocked`), lo cual puede tener un delay.

---

## 5. RECOMENDACIONES

### R-01: Incluir achievements en respuesta del submit endpoint [CRITICO]

Modificar `exercises.controller.ts` para retornar los achievements recien otorgados:

```typescript
// Despues de linea 544 (detectAndGrantEarned)
let newAchievements = [];
try {
  const earned = await this.achievementsService.detectAndGrantEarned(submission.user_id);
  newAchievements = earned.map(ua => ({
    id: ua.achievement?.id || ua.achievement_id,
    name: ua.achievement?.name || '',
    description: ua.achievement?.description || '',
    icon: ua.achievement?.icon || 'trophy',
    rarity: ua.achievement?.rarity || 'common',
  }));
} catch (err) { /* log error */ }

// En el return:
return {
  ...existingFields,
  achievements: newAchievements.length > 0 ? newAchievements : undefined,
};
```

Tambien agregar el campo `achievements` al `SubmitExerciseResponseDto`.

### R-02: Corregir mapeo de achievements en ExerciseContext [MEDIO]

```typescript
// ExerciseContext.tsx:254-259 - Corregir a:
achievements: result.achievements?.map(a => ({
  name: a.name,
  description: a.description ?? '',
  icon: a.icon,
  rarity: a.rarity ?? 'common', // Usar rarity real del backend
  mlCoinsReward: a.mlCoinsReward ?? 0,
  xpReward: a.xpReward ?? 0,
})),
```

### R-03: Migrar useProfileData y useAchievementsEnhanced a React Query [ALTO]

Reemplazar importaciones del Zustand store deprecado:

1. `useProfileData.ts` - Usar `useAchievements()` de React Query
2. `useAchievementsEnhanced.ts` - Refactorizar para usar React Query (o eliminarlo si su funcionalidad ya esta cubierta por `useAchievementFilters`)
3. `CompletionModal.tsx` - Eliminarlo (ya marcado deprecated, reemplazado por FeedbackModal)

### R-04: Agregar invalidacion de achievements en ExerciseContext [BAJO]

```typescript
// ExerciseContext.tsx, despues de syncAndInvalidate():
queryClient.invalidateQueries({ queryKey: ['achievements'] });
```

### R-05: Implementar rankUp detection en el backend submit [MEDIO]

Reemplazar `rankUp: null // TODO` en `exercises.controller.ts:1114` con la deteccion real:

```typescript
// Obtener stats del usuario despues de aplicar rewards
const userStats = await this.userStatsService.getUserStats(profileId);
const rankUp = userStats.rankChanged ? {
  oldRank: userStats.previousRank,
  newRank: userStats.currentRank,
} : null;
```

### R-06: Evaluar eliminacion del Zustand achievementsStore [MEDIO]

Una vez que R-03 este completo (todos los consumidores migrados a React Query), eliminar:
- `features/gamification/social/store/achievementsStore.ts`
- `features/gamification/social/hooks/useAchievements.ts` (wrapper Zustand)
- `features/gamification/social/api/achievementsAPI.ts` (deprecated API)

---

## 6. RESUMEN

| Aspecto | Estado | Nota |
|---------|--------|------|
| AchievementsPage -> React Query | CORRECTO | Sin dependencia de Zustand |
| WebSocket -> cache invalidation | CORRECTO | Pipeline completo verificado |
| FeedbackModal achievements | PARCIAL | Frontend listo, backend no retorna datos |
| API deprecada aislada | CORRECTO | No importada por componentes activos |
| Transformer completo | CORRECTO | Todos los campos mapeados con fallbacks |
| 4 estados visuales | CORRECTO | locked/in_progress/earned/claimed |
| Mock data vs real | PARCIAL | progressAPI tiene mocks, AchievementsPage es real |
| Doble fuente de verdad | PROBLEMA | 3 archivos usan Zustand, 1 usa React Query |

**Problemas por severidad:**
- CRITICO: 1 (P-01: Backend no retorna achievements en submit)
- ALTO: 1 (P-03: Doble fuente de verdad Zustand vs React Query)
- MEDIO: 3 (P-02: rarity hardcoded, P-04: rewards locales, P-06: rankUp null)
- BAJO: 2 (P-05: required 100 hardcoded, P-07: missing cache invalidation)
