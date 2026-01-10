# CORR-005: Analisis y Correccion de Leaderboard y Achievements

**Fecha**: 2026-01-07
**Estado**: En Progreso
**Prioridad**: Alta
**Asignado**: Claude Tech Lead

---

## 1. RESUMEN EJECUTIVO

Se identificaron multiples problemas en las paginas de Leaderboard y Achievements que impiden su correcto funcionamiento. Este documento detalla el analisis completo, los problemas encontrados y el plan de correccion.

---

## 2. ANALISIS DETALLADO - LEADERBOARD

### 2.1 Archivos Analizados

| Capa | Archivo | Lineas | Estado |
|------|---------|--------|--------|
| Frontend Page | `apps/frontend/src/apps/student/pages/LeaderboardPage.tsx` | 517 | Analizado |
| Frontend Hook | `apps/frontend/src/features/gamification/social/hooks/useLeaderboards.ts` | 49 | Analizado |
| Frontend Store | `apps/frontend/src/features/gamification/social/store/leaderboardsStore.ts` | 207 | Analizado |
| Frontend API | `apps/frontend/src/features/gamification/social/api/socialAPI.ts` | 1149 | Analizado |
| Backend Controller | `apps/backend/src/modules/gamification/controllers/leaderboard.controller.ts` | 529 | Analizado |
| Backend Service | `apps/backend/src/modules/gamification/services/leaderboard.service.ts` | 583 | Analizado |

### 2.2 Problemas Identificados

#### PROBLEMA L1: Campo `isCurrentUser` siempre es `false` [CRITICO]

**Ubicacion**: `socialAPI.ts:437`

**Codigo Actual**:
```typescript
return entries.map((entry: any, index: number) => ({
  // ... otros campos
  isCurrentUser: false,  // <- SIEMPRE FALSE
}));
```

**Impacto**:
- `getUserEntry()` en `useLeaderboards.ts:28` siempre retorna `undefined`
- La tarjeta de posicion del usuario no se muestra
- El auto-scroll al usuario no funciona

**Solucion Propuesta**:
```typescript
// Obtener userId del authStore
const authStore = (await import('@/features/auth/store/authStore')).useAuthStore.getState();
const currentUserId = authStore.user?.id;

return entries.map((entry: any, index: number) => ({
  // ... otros campos
  isCurrentUser: (entry.userId || entry.user_id) === currentUserId,
}));
```

---

#### ~~PROBLEMA L2: Propiedad `timePeriod` vs `period`~~ [DESCARTADO]

**Estado**: DESCARTADO en validacion

**Razon**: La interfaz `LeaderboardData` en `leaderboardsTypes.ts:32` define `timePeriod: TimePeriod`,
por lo que el store es correcto. No hay problema.

---

#### PROBLEMA L3: Estado de loading no visible en UI [MEDIO]

**Ubicacion**: `LeaderboardPage.tsx`

**Problema**: El store tiene `loading: boolean` pero la pagina no muestra indicador de carga.

**Solucion Propuesta**:
```typescript
const { currentLeaderboard, loading, error } = useLeaderboards();

// Agregar en JSX:
{loading && (
  <div className="flex items-center justify-center py-12">
    <RefreshCw className="h-8 w-8 animate-spin text-detective-orange" />
    <span className="ml-3 text-gray-600">Cargando clasificacion...</span>
  </div>
)}
```

---

#### PROBLEMA L4: Tipo `grade` no tiene endpoint [BAJO]

**Ubicacion**: Frontend espera tipo `grade` que no existe en backend

**Solucion**:
- Opcion A: Implementar endpoint `/leaderboard/grades/:gradeId` en backend
- Opcion B: Remover tipo `grade` del frontend (recomendado por simplicidad)

---

### 2.3 Dependencias Identificadas

| Archivo Dependiente | Tipo | Impacto |
|---------------------|------|---------|
| `LeaderboardTabs.tsx` | Componente UI | Tabs de tipos |
| `LeaderboardLayout.tsx` | Componente UI | Renderizado de tabla |
| `leaderboardsTypes.ts` | Tipos TS | Interfaces compartidas |
| `authStore.ts` | Store Auth | Usuario actual |
| `API_ENDPOINTS` | Constantes | Rutas API |

---

## 3. ANALISIS DETALLADO - ACHIEVEMENTS

### 3.1 Archivos Analizados

| Capa | Archivo | Lineas | Estado |
|------|---------|--------|--------|
| Frontend Page | `apps/frontend/src/pages/AchievementsPage.tsx` | 467 | Analizado |
| Frontend Store | `apps/frontend/src/features/gamification/social/store/achievementsStore.ts` | 199 | Analizado |
| Frontend API | `apps/frontend/src/features/gamification/social/api/achievementsAPI.ts` | 436 | Analizado |
| Backend Controller | `apps/backend/src/modules/gamification/controllers/achievements.controller.ts` | 481 | Analizado |
| Backend Service | `apps/backend/src/modules/gamification/services/achievements.service.ts` | 607 | Analizado |

### 3.2 Problemas Identificados

#### PROBLEMA A1: Dos implementaciones de API diferentes [CRITICO]

**Ubicaciones**:
- `AchievementsPage.tsx:74` usa `gamificationApi.getAllAchievements()`
- `achievementsStore.ts:162` usa `getUserAchievements()` de `achievementsAPI.ts`

**Problema**: Dos clientes API diferentes con mapeos potencialmente inconsistentes.

**Solucion Propuesta**:
- Unificar en un solo cliente: `achievementsAPI.ts`
- Actualizar `AchievementsPage.tsx` para usar el mismo cliente

---

#### PROBLEMA A2: Backend retorna solo achievements completados [CRITICO]

**Ubicacion**: `achievements.controller.ts:196-198`

**Codigo Actual**:
```typescript
async getUserAchievements(@Param('userId') userId: string) {
  return this.achievementsService.getCompletedByUser(userId);  // Solo completados!
}
```

**Impacto**:
- Frontend no recibe logros en progreso
- Frontend no recibe logros bloqueados
- Solo se muestran logros ya completados

**Solucion Propuesta**:
Crear nuevo metodo en servicio que retorne TODOS los logros con progreso:
```typescript
async getAllUserAchievements(userId: string) {
  // Obtener todos los achievements
  const allAchievements = await this.findAll(true);

  // Obtener progreso del usuario
  const userProgress = await this.userAchievementRepo.find({
    where: { user_id: userId }
  });

  return {
    achievements: allAchievements.map(ach => {
      const progress = userProgress.find(p => p.achievement_id === ach.id);
      return { ...ach, userProgress: progress || null };
    }),
    total: allAchievements.length
  };
}
```

---

#### PROBLEMA A3: Campo `status` no existe en backend [ALTO]

**Ubicacion**: `AchievementsPage.tsx:141-143`

**Codigo Actual**:
```typescript
const status = item.userAchievement?.status || 'locked';
return status === filter.status;
```

**Problema**: Backend no tiene campo `status`, solo `is_completed` y `rewards_claimed`.

**Mapeo Correcto**:
```typescript
// Calcular status basado en campos del backend
function calculateStatus(userAch?: UserAchievement): AchievementStatus {
  if (!userAch) return 'locked';
  if (userAch.rewards_claimed) return 'claimed';
  if (userAch.is_completed) return 'earned';
  if (userAch.progress > 0) return 'in_progress';
  return 'locked';
}
```

---

#### PROBLEMA A4: Respuesta API no coincide con expectativa [ALTO]

**Frontend Espera** (`achievementsAPI.ts:141-142`):
```typescript
const { data } = await apiClient.get<
  ApiResponse<{ achievements: BackendUserAchievement[]; total: number }>
>(`/gamification/users/${userId}/achievements`);
```

**Backend Retorna** (`achievements.controller.ts:196`):
```typescript
// Retorna array directo, no objeto con { achievements, total }
return this.achievementsService.getCompletedByUser(userId);
```

**Solucion**: Alinear respuesta del backend con lo que espera el frontend.

---

#### PROBLEMA A5: Bug en calculateStatus - retorna 'unlocked' invalido [CRITICO]

**Ubicacion**: `achievementTransformer.ts:58`

**Codigo Actual**:
```typescript
const calculateStatus = (...): AchievementStatus => {
  if (isCompleted && rewardsClaimed) return 'claimed';
  if (isCompleted) return 'unlocked';  // <- 'unlocked' NO existe en AchievementStatus
  // ...
};
```

**Tipo Definido** (`achievement.types.ts:60`):
```typescript
export type AchievementStatus = 'locked' | 'in_progress' | 'earned' | 'claimed';
```

**Problema**: `'unlocked'` no es un valor valido de `AchievementStatus`. Deberia ser `'earned'`.

**Solucion**:
```typescript
if (isCompleted) return 'earned';  // <- Corregir a 'earned'
```

---

### 3.3 Dependencias Identificadas

| Archivo Dependiente | Tipo | Impacto |
|---------------------|------|---------|
| `AchievementCard.tsx` | Componente UI | Renderizado de tarjeta |
| `AchievementModal.tsx` | Componente UI | Modal de detalles |
| `AchievementFilter.tsx` | Componente UI | Filtros |
| `achievement.types.ts` | Tipos TS | Interfaces SSOT |
| `gamification.api.ts` | API Client | Cliente alternativo |

---

## 4. PLAN DE CORRECCION

### 4.1 Leaderboard - Correcciones EJECUTADAS

| ID | Problema | Archivo | Accion | Prioridad | Estado |
|----|----------|---------|--------|-----------|--------|
| L1 | isCurrentUser false | socialAPI.ts:420-438 | Obtener userId y comparar | CRITICA | COMPLETADO |
| ~~L2~~ | ~~timePeriod vs period~~ | - | Descartado (interfaz correcta) | - | DESCARTADO |
| L3 | Loading no visible | LeaderboardPage.tsx | Agregar loading state + error state | MEDIA | COMPLETADO |
| L4 | Tipo grade sin endpoint | LeaderboardTabs.tsx | Remover tipo grade | BAJA | DIFERIDO |

### 4.2 Achievements - Correcciones EJECUTADAS

| ID | Problema | Archivo | Accion | Prioridad | Estado |
|----|----------|---------|--------|-----------|--------|
| A1 | APIs duplicadas | AchievementsPage.tsx | Usar transformer de gamification.api.ts | MEDIA | NO REQUERIDO |
| A2 | Solo completados | achievements.service.ts | Nuevo metodo getAllUserAchievements | CRITICA | COMPLETADO |
| A3 | Campo status | achievementsAPI.ts | YA EXISTE transformer | ALTA | NO REQUERIDO (ver A5) |
| A4 | Respuesta API | achievements.controller.ts | Alinear estructura { data: { achievements, total } } | ALTA | COMPLETADO |
| A5 | Bug 'unlocked' | achievementTransformer.ts:49-65 | Cambiar 'unlocked' a 'earned' | CRITICA | COMPLETADO |

---

## 5. ARCHIVOS A MODIFICAR

### 5.1 Frontend

1. `apps/frontend/src/features/gamification/social/api/socialAPI.ts`
   - Linea 437: Calcular isCurrentUser correctamente

2. `apps/frontend/src/features/gamification/social/store/leaderboardsStore.ts`
   - Lineas 88-95, 125-132, 188-194: Cambiar timePeriod a period

3. `apps/frontend/src/apps/student/pages/LeaderboardPage.tsx`
   - Agregar estado de loading en UI

4. `apps/frontend/src/pages/AchievementsPage.tsx`
   - Cambiar a usar achievementsAPI.ts
   - Actualizar logica de filtrado

5. `apps/frontend/src/features/gamification/social/api/achievementsAPI.ts`
   - Actualizar getUserAchievements para manejar nueva estructura

### 5.2 Backend

1. `apps/backend/src/modules/gamification/services/achievements.service.ts`
   - Agregar metodo getAllUserAchievements

2. `apps/backend/src/modules/gamification/controllers/achievements.controller.ts`
   - Actualizar getUserAchievements para usar nuevo metodo
   - Envolver respuesta en estructura { data: { achievements, total } }

---

## 6. VALIDACION

### 6.1 Criterios de Aceptacion - Leaderboard

- [x] **L1**: isCurrentUser se calcula comparando con userId del authStore
- [x] **L3**: Indicador de loading visible mientras se cargan datos
- [x] **L3**: Estado de error con boton de reintentar
- [ ] Pendiente prueba manual: La tarjeta de "Tu Posicion" muestra datos del usuario actual
- [ ] Pendiente prueba manual: El auto-scroll funciona al cargar la pagina
- [ ] Pendiente prueba manual: Todos los tipos de leaderboard funcionan correctamente

### 6.2 Criterios de Aceptacion - Achievements

- [x] **A5**: Bug 'unlocked' corregido a 'earned' en transformer
- [x] **A2**: Nuevo metodo getAllUserAchievements en servicio
- [x] **A4**: Controller actualizado para usar nuevo metodo y estructura correcta
- [ ] Pendiente prueba manual: Se muestran todos los logros (completados, en progreso, bloqueados)
- [ ] Pendiente prueba manual: Los filtros por status funcionan correctamente
- [ ] Pendiente prueba manual: El resumen muestra estadisticas correctas
- [ ] Pendiente prueba manual: Se puede reclamar recompensas de logros completados

### 6.3 Validacion TypeScript

- **Backend**: Compila sin errores
- **Frontend**: Errores pre-existentes (no relacionados con cambios de CORR-005)

---

## 7. ARCHIVOS MODIFICADOS (CORR-005)

### Frontend:
1. `apps/frontend/src/features/gamification/social/api/socialAPI.ts`
   - Lineas 420-438: Agregado calculo de isCurrentUser usando authStore

2. `apps/frontend/src/features/gamification/social/hooks/useLeaderboards.ts`
   - Lineas 14-15: Agregado loading y error del store
   - Lineas 38-39: Agregado loading y error al return

3. `apps/frontend/src/apps/student/pages/LeaderboardPage.tsx`
   - Linea 28: Agregado import AlertCircle
   - Lineas 61-68: Agregado loading y leaderboardError del hook
   - Lineas 388-411: Agregado indicador de loading y estado de error

4. `apps/frontend/src/features/gamification/achievements/utils/achievementTransformer.ts`
   - Lineas 49-65: Corregido 'unlocked' a 'earned' en calculateStatus

5. `apps/frontend/src/lib/api/gamification.api.ts`
   - Lineas 110-137: Actualizado getUserAchievements para manejar nueva estructura de respuesta
   - Agregado fallbacks para multiples estructuras de respuesta posibles

6. `apps/frontend/src/apps/student/hooks/useDashboardData.ts`
   - Lineas 176-210: Corregido procesamiento de achievements data
   - Agregado transformacion de campos backend (is_completed -> unlocked, completed_at -> unlockedAt)
   - Agregado manejo de nueva estructura { data: { achievements, total } }

### Backend:
5. `apps/backend/src/modules/gamification/services/achievements.service.ts`
   - Lineas 133-155: Nuevo metodo getAllUserAchievements

6. `apps/backend/src/modules/gamification/controllers/achievements.controller.ts`
   - Lineas 161-206: Actualizado getUserAchievements para usar nuevo metodo

---

## 8. ERRORES DE RUNTIME CORREGIDOS

### Error R1: achievements?.filter is not a function (LeaderboardPage.tsx:127)

**Causa**: El hook `useDashboardData` no manejaba correctamente la nueva estructura de respuesta
`{ data: { achievements, total } }` del backend. Retornaba un objeto en lugar de un array.

**Solucion**: Actualizado `useDashboardData.ts` para:
1. Extraer correctamente el array de achievements de multiples estructuras posibles
2. Transformar campos del backend (is_completed -> unlocked, completed_at -> unlockedAt)

### Error R2: transformUserAchievements: Expected array, got: object

**Causa**: Mismo problema que R1. El transformer esperaba un array pero recibia la nueva estructura
envuelta.

**Solucion**: Actualizado `gamification.api.ts` con fallbacks para extraer el array de achievements
de la estructura `{ data: { achievements, total } }`.

---

## 9. NOTAS ADICIONALES

### Correcciones Previas Relacionadas

- **CORR-002**: Fix para carga inicial de LeaderboardPage (useEffect agregado)
- **CORR-004**: Manejo de 404 en getUserLeaderboardRank

### Referencias

- Documentacion API Swagger: http://localhost:3006/api/v1/docs
- Tipos SSOT: `apps/frontend/src/shared/types/achievement.types.ts`
- Constantes API: `apps/frontend/src/config/api.config.ts`
