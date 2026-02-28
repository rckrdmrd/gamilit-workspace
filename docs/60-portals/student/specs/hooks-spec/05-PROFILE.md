---
title: Student Portal Hooks — Profile & Deprecated
status: activo
last_updated: "2026-02-28"
---

## Categoria: Profile (Phase 4 — 2026-02-18)

### useProfileData

**Archivo:** `hooks/useProfileData.ts`
**Proposito:** Agrega 4 Zustand stores en un solo hook para EnhancedProfilePage, eliminando prop drilling y reduciendo acoplamiento.

#### Retorno

```typescript
interface UseProfileDataReturn {
  user: User | null;
  logout: () => void;
  userProgress: UserRankProgress | null;
  balance: number;
  achievements: Achievement[];
  achievementStats: AchievementStats | null;
}
```

#### Dependencias

- `useAuthStore` — user, logout
- `useRanksStore` — userProgress, fetchUserProgress
- `useEconomyStore` — balance, fetchBalance
- `useAchievementsStore` — achievements, stats, fetchAchievements

#### Notas

- Auto-fetches on mount when `user?.id` exists
- Candidato futuro para migracion a React Query (eliminar dependencia de Zustand stores)

---

### useAvatarUpdate

**Archivo:** `hooks/useAvatarUpdate.ts`
**Proposito:** Actualización optimista de avatar con persistencia via API.

#### Retorno

```typescript
interface UseAvatarUpdateReturn {
  updateAvatar: (avatarUrl: string) => Promise<boolean>;
  isUpdating: boolean;
}
```

#### Comportamiento

1. Actualiza `authStore.user.avatar_url` inmediatamente (optimistic)
2. Persiste via `profileAPI.updateProfile(userId, { avatar_url })`
3. Muestra toast de éxito/error
4. Retorna `boolean` para que el caller sepa si cerrar modal

#### Dependencias

- `useAuthStore` — user, setState
- `profileAPI` — updateProfile
- `react-hot-toast` — notificaciones

---

## Hook Deprecado

### useGamificationData (DEPRECATED)

**Archivo:** `hooks/useGamificationData.ts`
**Estado:** DEPRECADO - No usar en codigo nuevo

**Razon de deprecacion:**
- Reemplazado por `useDashboardData` (React Query)
- Reemplazado por `useUserGamification` de `@/shared/hooks/`

**Alternativas:**
```typescript
// Antes (deprecado)
const { rankData, mlCoins } = useGamificationData(userId);

// Ahora (recomendado)
const { rank, coins } = useDashboardData();
// o
const gamification = useUserGamification();
```

---
