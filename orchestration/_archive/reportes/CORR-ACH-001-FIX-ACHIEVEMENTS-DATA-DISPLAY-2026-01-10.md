# Reporte de Correccion: CORR-ACH-001 - Datos Incorrectos en Pagina de Achievements

**Fecha:** 2026-01-10
**Archivo(s):** 6 archivos frontend (ver seccion Archivos Afectados)
**Prioridad:** P1 (Alto)
**Estado:** COMPLETADO

---

## RESUMEN EJECUTIVO

Se corrigio el problema donde la pagina de Achievements del portal de estudiantes mostraba datos incorrectos o vacios. Los achievement cards no mostraban datos reales del usuario, y los componentes de encabezado no mostraban estadisticas correctas.

**Causa Raiz:** Multiples problemas de mapeo de datos entre backend (snake_case) y frontend (camelCase), valores fallback hardcodeados, y falta de fetch real en algunos hooks.

---

## 1. PROBLEMA IDENTIFICADO

### 1.1 Sintomas Reportados
- Los cards de logros (achievements) no mostraban datos reales del usuario
- Los componentes de encabezado mostraban datos incorrectos
- Los valores de rewards mostraban 50 ML / 100 XP (hardcodeados)
- Algunos hooks no hacian fetch real del backend

### 1.2 Impacto
- Experiencia de gamificacion comprometida
- Confusion del usuario sobre su progreso real
- Datos de achievements inconsistentes entre diferentes vistas

---

## 2. CAUSA RAIZ

### 2.1 Problema P1: Extraccion Incorrecta de Achievement Embebido
**Ubicacion:** `useDashboardData.ts:192-208`

El backend retorna `user_achievements` con una relacion `achievement` embebida que contiene los datos del logro (nombre, descripcion, rewards). El mapeo original no priorizaba correctamente estos datos embebidos.

**Codigo problematico:**
```typescript
name: raw.name || raw.achievement?.name || 'Unknown',
```

**Problema:** Si `raw.name` no existe (tipico en user_achievements), deberia priorizar `raw.achievement?.name`.

### 2.2 Problema P2: Fallbacks Hardcodeados
**Ubicacion:** `AchievementsPreview.tsx:227-234`

```typescript
+{achievement.mlCoinsReward ?? achievement.rewards?.ml_coins ?? 50} ML
+{achievement.xpReward ?? achievement.rewards?.xp ?? 100} XP
```

**Problema:** Valores 50 y 100 eran fallbacks incorrectos que mostraban datos falsos.

### 2.3 Problema P3: Hook Sin Fetch Real
**Ubicacion:** `useAchievementsEnhanced.ts:309-313`

```typescript
useEffect(() => {
  if (achievements.length === 0) {
    refresh(); // Llamaba a refreshAchievements() que solo recalcula, NO hace fetch
  }
}, []);
```

**Problema:** El metodo `refresh()` llamaba a `refreshAchievements()` del store que solo recalcula estadisticas pero NO hace fetch del backend.

### 2.4 Problema P4: Valores Undefined No Manejados
**Ubicacion:** `AchievementCard.tsx:196-202`

```typescript
{achievement.mlCoinsReward} ML  // Puede ser undefined
{achievement.xpReward} XP       // Puede ser undefined
```

**Problema:** Sin manejo de valores undefined, podia mostrar "undefined ML".

---

## 3. CORRECCIONES APLICADAS

### 3.1 CORR-ACH-001: Mejorar Extraccion de Achievement Embebido
**Archivo:** `apps/frontend/src/apps/student/hooks/useDashboardData.ts`
**Lineas:** 192-227

```typescript
// FIX: CORR-ACH-001 - Priorizar datos del achievement embebido (relacion)
const achievementsData: AchievementData[] = achievementsRawArray.map((raw: any) => {
  // Extraer achievement embebido (si existe) - el backend envia la relacion
  const ach = raw.achievement || {};

  return {
    id: raw.achievement_id || raw.achievementId || raw.id || ach.id,
    name: ach.name || raw.name || 'Achievement',
    title: ach.name || raw.name || 'Achievement',
    description: ach.description || raw.description || '',
    rarity: ach.rarity || raw.rarity || 'common',
    category: ach.category || raw.category || 'progress',
    icon: ach.icon || raw.icon || 'trophy',
    unlocked: raw.is_completed ?? raw.isCompleted ?? raw.unlocked ?? false,
    isUnlocked: raw.is_completed ?? raw.isCompleted ?? raw.unlocked ?? false,
    unlockedAt: raw.completed_at || raw.completedAt || raw.unlockedAt,
    progress: raw.progress ?? 0,
    required: raw.max_progress || raw.maxProgress || ach.max_progress || 100,
    // Rewards: Priorizar achievement embebido, usar ?? para respetar 0
    mlCoinsReward: ach.ml_coins_reward ?? ach.rewards?.ml_coins ?? raw.ml_coins_reward ?? 0,
    xpReward: ach.points_value ?? ach.rewards?.xp ?? raw.xp_reward ?? 0,
    rewards: ach.rewards || raw.rewards,
  };
});
```

### 3.2 CORR-ACH-002: Agregar userId y Fetch Real en useAchievementsEnhanced
**Archivo:** `apps/frontend/src/apps/student/hooks/useAchievementsEnhanced.ts`
**Lineas:** 57-65, 300-328

**Cambio en firma del hook:**
```typescript
export const useAchievementsEnhanced = (userId?: string): UseAchievementsEnhancedResult => {
```

**Cambio en refresh:**
```typescript
const refresh = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    if (userId) {
      console.log('[useAchievementsEnhanced] Fetching achievements for userId:', userId);
      await fetchAchievements(userId);
    } else {
      console.log('[useAchievementsEnhanced] No userId, only refreshing stats');
      refreshAchievements();
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load achievements');
  } finally {
    setLoading(false);
  }
}, [userId, fetchAchievements, refreshAchievements]);
```

**Cambio en useEffect inicial:**
```typescript
useEffect(() => {
  if (userId && achievements.length === 0) {
    console.log('[useAchievementsEnhanced] Initial fetch triggered for userId:', userId);
    refresh();
  }
}, [userId]);
```

### 3.3 CORR-ACH-003: Remover Fallbacks Hardcodeados
**Archivo:** `apps/frontend/src/apps/student/components/gamification/AchievementsPreview.tsx`
**Lineas:** 222-236

```typescript
{/* Rewards - FIX: CORR-ACH-003 - Mostrar valores reales o 0 si no hay datos */}
<div className="flex items-center justify-around border-t border-gray-200 pt-3">
  <div className="flex items-center gap-1">
    <Coins className="h-4 w-4 text-detective-gold" />
    <span className="text-sm font-semibold text-detective-text">
      +{achievement.mlCoinsReward ?? achievement.rewards?.ml_coins ?? 0} ML
    </span>
  </div>
  <div className="flex items-center gap-1">
    <Zap className="h-4 w-4 text-detective-orange" />
    <span className="text-sm font-semibold text-detective-text">
      +{achievement.xpReward ?? achievement.rewards?.xp ?? 0} XP
    </span>
  </div>
</div>
```

### 3.4 CORR-ACH-004: Manejar Valores Undefined
**Archivo:** `apps/frontend/src/features/gamification/social/components/Achievements/AchievementCard.tsx`
**Lineas:** 191-205

```typescript
{/* Rewards - FIX: CORR-ACH-004 - Manejar valores undefined con ?? 0 */}
<div className="flex justify-around items-center pt-3 border-t border-gray-200">
  <div className="flex items-center gap-1">
    <Coins className="w-4 h-4 text-detective-gold" />
    <span className="text-detective-sm font-semibold text-detective-text">
      {achievement.mlCoinsReward ?? 0} ML
    </span>
  </div>
  <div className="flex items-center gap-1">
    <Zap className="w-4 h-4 text-detective-orange" />
    <span className="text-detective-sm font-semibold text-detective-text">
      {achievement.xpReward ?? 0} XP
    </span>
  </div>
</div>
```

### 3.5 CORR-ACH-005: Agregar Logs y Validacion de userId en GamificationPage
**Archivo:** `apps/frontend/src/apps/student/pages/GamificationPage.tsx`
**Lineas:** 85-119

```typescript
// FIX: CORR-ACH-005 - Agregar logs y validacion de userId
useEffect(() => {
  const fetchAllData = async () => {
    if (!user?.id) {
      console.warn('[GamificationPage] No user.id available, skipping fetch');
      return;
    }

    console.log('[GamificationPage] Fetching all gamification data for user:', user.id);

    await Promise.all([
      fetchUserProgress(),
      fetchBalance(),
      fetchAchievements(user.id),
    ]);
  };

  fetchAllData();

  const pollingInterval = setInterval(() => {
    if (user?.id) {
      fetchAllData();
    }
  }, 30000);

  return () => {
    clearInterval(pollingInterval);
  };
}, [user?.id, fetchUserProgress, fetchBalance, fetchAchievements]);
```

### 3.6 Logs de Debug en achievementsStore
**Archivo:** `apps/frontend/src/features/gamification/social/store/achievementsStore.ts`
**Lineas:** 161-167, 189-191

```typescript
fetchAchievements: async (userId: string) => {
  console.log('[achievementsStore] fetchAchievements called for userId:', userId);
  // ...
  console.log('[achievementsStore] Raw achievements from API:', achievementsWithProgress.length);
  // ...
  const stats = calculateStats(achievements);
  console.log('[achievementsStore] Mapped achievements:', achievements.length);
  console.log('[achievementsStore] Stats calculated:', stats);
  // ...
}
```

---

## 4. ARCHIVOS AFECTADOS

### 4.1 Modificados
| Archivo | Cambio ID | Lineas | Descripcion |
|---------|-----------|--------|-------------|
| `apps/frontend/src/apps/student/hooks/useDashboardData.ts` | CORR-ACH-001 | 192-227 | Mejorar extraccion de achievement embebido |
| `apps/frontend/src/features/gamification/social/store/achievementsStore.ts` | N/A | 161-191 | Agregar logs de debug |
| `apps/frontend/src/apps/student/hooks/useAchievementsEnhanced.ts` | CORR-ACH-002 | 57-328 | Agregar userId y fetch real |
| `apps/frontend/src/apps/student/components/gamification/AchievementsPreview.tsx` | CORR-ACH-003 | 222-236 | Remover fallbacks hardcodeados |
| `apps/frontend/src/features/gamification/social/components/Achievements/AchievementCard.tsx` | CORR-ACH-004 | 191-205 | Manejar valores undefined |
| `apps/frontend/src/apps/student/pages/GamificationPage.tsx` | CORR-ACH-005 | 85-119 | Agregar logs y validacion userId |

### 4.2 Verificados (No Requieren Cambios)
| Archivo | Razon |
|---------|-------|
| `apps/backend/src/modules/gamification/controllers/achievements.controller.ts` | Endpoints funcionan correctamente |
| `apps/backend/src/modules/gamification/services/achievements.service.ts` | Logica de negocio correcta |
| `apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql` | Estructura de tabla correcta |
| `apps/database/ddl/schemas/gamification_system/tables/04-user_achievements.sql` | Estructura de tabla correcta |
| `apps/frontend/src/features/gamification/social/api/achievementsAPI.ts` | API client funciona correctamente |
| `apps/frontend/src/lib/api/gamification.api.ts` | API client con transformadores correctos |

---

## 5. REFERENCIAS

### 5.1 Endpoints Backend Relacionados
| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/gamification/achievements` | GET | Todos los achievements |
| `/gamification/users/{userId}/achievements` | GET | Achievements del usuario con progreso |
| `/gamification/users/{userId}/achievements/{achievementId}/claim` | POST | Reclamar recompensas |

### 5.2 Documentacion Relacionada
- `/docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-001-achievements.md`
- `/docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-001-achievements.md`

---

## 6. TESTING RECOMENDADO

### 6.1 Manual Testing
1. Login como estudiante
2. Navegar a `/gamification`
3. Verificar logs en consola del navegador:
   - `[GamificationPage] Fetching all gamification data for user: <userId>`
   - `[achievementsStore] fetchAchievements called for userId: <userId>`
   - `[achievementsStore] Raw achievements from API: <count>`
4. Verificar que achievement cards muestran datos reales
5. Verificar que rewards muestran valores correctos (no 50/100)

### 6.2 Casos de Prueba
| Caso | Accion | Resultado Esperado |
|------|--------|--------------------|
| TC-001 | Usuario sin achievements | Stats muestran 0/0, cards vacios |
| TC-002 | Usuario con achievements completados | Cards muestran datos con checkmark |
| TC-003 | Achievement con rewards = 0 | Muestra "0 ML" y "0 XP" |
| TC-004 | Achievement en progreso | Barra de progreso muestra % correcto |

---

## 7. IMPACTO

### 7.1 Beneficios
- Los datos de achievements ahora se muestran correctamente
- Los valores de rewards reflejan datos reales del backend
- Logs de debug facilitan troubleshooting futuro
- Manejo correcto de valores undefined previene errores de UI

### 7.2 Sin Efectos Secundarios
- No hay cambios en la estructura de datos del backend
- No hay cambios en la base de datos
- Los tipos TypeScript no cambian (compatibilidad mantenida)

---

## 8. ESTADO DE TAREAS

- [x] **P1** - CORR-ACH-001: Mejorar extraccion de achievement embebido (COMPLETADO)
- [x] **P1** - CORR-ACH-002: Agregar userId y fetch real en useAchievementsEnhanced (COMPLETADO)
- [x] **P1** - CORR-ACH-003: Remover fallbacks hardcodeados (COMPLETADO)
- [x] **P2** - CORR-ACH-004: Manejar valores undefined (COMPLETADO)
- [x] **P2** - CORR-ACH-005: Agregar logs y validacion userId (COMPLETADO)
- [x] **P3** - Agregar logs de debug en achievementsStore (COMPLETADO)
- [x] **P3** - Documentar cambios segun estandares (COMPLETADO)

---

## 9. NOTAS ADICIONALES

### 9.1 Decisiones de Diseno
1. **Priorizar achievement embebido:** El backend envia la relacion `achievement` en la respuesta de `user_achievements`. Se prioriza extraer datos de esta relacion porque contiene la informacion completa del logro.

2. **Usar ?? en lugar de ||:** El operador nullish coalescing (??) permite que 0 sea un valor valido (un achievement puede tener 0 ML coins como recompensa).

3. **Logs de debug:** Se agregaron logs temporales para facilitar debugging en desarrollo. Pueden removerse en produccion si se desea.

### 9.2 Mantenimiento Futuro
- Considerar consolidar `achievementsAPI.ts` y `gamificationApi.ts` en un unico modulo
- El hook `useAchievementsEnhanced` podria usarse en mas componentes para filtrado avanzado
- Los logs de debug pueden configurarse con un flag de entorno

---

**Autor:** Claude Opus 4.5 (Arquitecto de Software)
**Revision:** 1.0
**Fecha:** 2026-01-10

---

## CHANGELOG

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-01-10 | Version inicial - Correccion de datos de achievements |
