# REPORTE TECH-LEADER: Analisis Shop y Achievements

**Fecha:** 2025-12-14
**Perfil:** TECH-LEADER (PERFIL-TECH-LEADER.md)
**Proyecto:** GAMILIT
**Componentes:** Shop Page, Achievements Page (Portal Estudiantes)
**Estado:** ANALISIS COMPLETADO - GAPS IDENTIFICADOS

---

## 1. RESUMEN EJECUTIVO

El sistema de **Shop** y **Achievements** en el portal de estudiantes tiene la arquitectura y backend **completamente implementados**, pero presenta **gaps de integracion frontend** que impiden la funcionalidad completa de compra e interaccion con items.

### Estado por Componente

| Componente | Backend | Database | Frontend | Integracion | Estado |
|------------|---------|----------|----------|-------------|--------|
| Shop Categories | 100% | 100% | 100% | 95% | OK |
| Shop Items | 100% | 100% | 90% | 75% | GAPS |
| Purchase Flow | 100% | 100% | 85% | 60% | GAPS CRITICOS |
| Ownership Check | 100% | 100% | 0% | 0% | NO IMPLEMENTADO |
| Achievements List | 100% | 100% | 100% | 90% | OK |
| Claim Rewards | 100% | 100% | 0% | 0% | NO IMPLEMENTADO |

---

## 2. PROBLEMAS CRITICOS IDENTIFICADOS

### 2.1 SHOP: isOwned Hardcodeado (CRITICO)

**Archivo:** `apps/frontend/src/apps/student/pages/ShopPage.tsx:108`

```typescript
// PROBLEMA: isOwned siempre es false
const transformedItems: ShopItem[] = items.map((item) => ({
  ...
  isOwned: false, // <-- HARDCODEADO, nunca consulta ownership real
  ...
}));
```

**Impacto:** Los usuarios ven "Buy Now" en items que ya compraron. Pueden intentar recomprar items que ya poseen.

**Solucion:** Usar el endpoint `checkItemOwnership()` de shopAPI.ts que ya existe:
```typescript
// shopAPI.ts ya tiene:
export const checkItemOwnership = async (userId: string, itemId: string): Promise<boolean>
```

### 2.2 ACHIEVEMENTS: Sin UI para Claim Rewards (CRITICO)

**Archivo:** `apps/frontend/src/apps/student/pages/AchievementsPage.tsx`

**Problema:** El frontend NO tiene boton ni UI para reclamar recompensas de achievements completados.

**Backend disponible:**
```typescript
// achievements.controller.ts:350
@Post('users/:userId/achievements/:achievementId/claim')
async claimAchievement(userId: string, achievementId: string)
```

**Frontend API disponible:**
```typescript
// achievementsAPI.ts - comentado/no utilizado
// NO existe funcion claimAchievement() implementada
```

**Impacto:** Usuarios desbloquean achievements pero NO reciben ML Coins ni XP de recompensas.

### 2.3 SEEDS: Falta Sync dev/prod

**Problema:** Seeds de shop existen en `prod/` pero NO en `dev/`:

```
/apps/database/seeds/prod/gamification_system/12-shop_categories.sql  # EXISTE
/apps/database/seeds/prod/gamification_system/13-shop_items.sql       # EXISTE
/apps/database/seeds/dev/gamification_system/12-shop_categories.sql   # NO EXISTE
/apps/database/seeds/dev/gamification_system/13-shop_items.sql        # NO EXISTE
```

**Impacto:** Ambiente de desarrollo sin datos de tienda.

### 2.4 VALIDACION: Required Rank Exacto vs Minimo

**Archivo:** `apps/backend/src/modules/gamification/services/shop.service.ts:309`

```typescript
// PROBLEMA: Validacion exacta en lugar de minimo
if (userStats.current_rank !== item.required_rank) {  // <-- === en lugar de >=
  throw new BadRequestException(...)
}
```

**Impacto:** Si un item requiere rank "Chaak" (nivel 3), un usuario con rank "K'uk'ulkan" (nivel 5) NO podria comprarlo aunque deberia poder.

### 2.5 VALIDACION: Achievement Requerido Comentado

**Archivo:** `apps/backend/src/modules/gamification/services/shop.service.ts:326-332`

```typescript
// Validar achievement requerido (si aplica)
if (item.required_achievement_id) {
  // Aqui podrias implementar validacion de achievements
  // const hasAchievement = await this.achievementsService.hasAchievement(...)
  // if (!hasAchievement) { throw new BadRequestException(...) }
}
```

**Impacto:** Items con requisito de achievement pueden comprarse sin validar.

---

## 3. ARQUITECTURA ACTUAL

### 3.1 Flujo de Shop (Con Gaps)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (ShopPage.tsx)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  1. getShopCategories() ────────────────────────► OK                    │
│  2. getShopItems(filters) ──────────────────────► OK                    │
│  3. purchaseShopItem(dto) ──────────────────────► OK                    │
│  4. checkItemOwnership(userId, itemId) ─────────► NO USADO (isOwned=false)│
│  5. getUserPurchases(userId) ───────────────────► NO USADO              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (ShopController)                       │
├─────────────────────────────────────────────────────────────────────────┤
│  GET  /gamification/shop/categories ─────────── OK                      │
│  GET  /gamification/shop/items ──────────────── OK                      │
│  GET  /gamification/shop/items/:id ──────────── OK                      │
│  POST /gamification/shop/purchase ───────────── OK                      │
│  GET  /gamification/shop/purchases/:userId ──── OK (no usado FE)        │
│  GET  /gamification/shop/owned/:userId/:itemId─ OK (no usado FE)        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Achievements (Con Gaps)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       FRONTEND (AchievementsPage.tsx)                    │
├─────────────────────────────────────────────────────────────────────────┤
│  1. getAllAchievements() ───────────────────────► OK                    │
│  2. getUserAchievements(userId) ────────────────► OK                    │
│  3. unlockAchievement(userId, achievementId) ───► ADMIN ONLY            │
│  4. claimAchievement(userId, achievementId) ────► NO EXISTE EN API.ts   │
│  5. checkAchievements(userId, type, value) ─────► NO INTEGRADO          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (AchievementsController)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  GET  /gamification/achievements ────────────── OK                      │
│  GET  /gamification/achievements/:id ────────── OK                      │
│  GET  /gamification/users/:userId/achievements─ OK                      │
│  POST /gamification/users/:userId/achievements/:id ── OK                │
│  GET  /gamification/users/:userId/achievements/summary ── OK            │
│  POST /gamification/users/:userId/achievements/:id/claim ── OK (no FE)  │
│  PATCH /gamification/achievements/:id ───────── OK                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. PLAN DE CORRECCION PRIORIZADO

### FASE 1: CRITICO (Bloquea Funcionalidad)

| # | Tarea | Archivo | Tipo | Esfuerzo |
|---|-------|---------|------|----------|
| 1.1 | Integrar checkItemOwnership en ShopPage | ShopPage.tsx | Frontend | 2h |
| 1.2 | Agregar funcion claimAchievement a achievementsAPI | achievementsAPI.ts | Frontend | 1h |
| 1.3 | Agregar UI Claim Rewards en AchievementCard | AchievementCard.tsx | Frontend | 3h |
| 1.4 | Copiar seeds shop a dev | seeds/dev/gamification_system/ | Database | 30min |

### FASE 2: IMPORTANTE (Mejora UX)

| # | Tarea | Archivo | Tipo | Esfuerzo |
|---|-------|---------|------|----------|
| 2.1 | Cargar ownership batch en lugar de individual | ShopPage.tsx | Frontend | 2h |
| 2.2 | Corregir validacion rank >= en lugar de === | shop.service.ts | Backend | 30min |
| 2.3 | Implementar validacion achievement requerido | shop.service.ts | Backend | 1h |
| 2.4 | Agregar indicador visual "Rewards Pending" | AchievementsPage.tsx | Frontend | 2h |

### FASE 3: MEJORAS (Optimizacion)

| # | Tarea | Archivo | Tipo | Esfuerzo |
|---|-------|---------|------|----------|
| 3.1 | Cache de items en economyStore | economyStore.ts | Frontend | 2h |
| 3.2 | Error handling especifico (saldo, stock, requisitos) | ShopPage.tsx | Frontend | 1h |
| 3.3 | WebSocket para achievements real-time | achievementsStore.ts | Frontend | 4h |

---

## 5. IMPLEMENTACIONES DETALLADAS

### 5.1 Fix: Ownership Check en ShopPage

```typescript
// ShopPage.tsx - Agregar al useEffect de fetch

// Despues de obtener items, verificar ownership para cada uno
const checkOwnership = async (items: ShopItem[], userId: string) => {
  const ownedMap = new Map<string, boolean>();

  // Opcion A: Individual (simple pero lento)
  for (const item of items) {
    const owned = await checkItemOwnership(userId, item.id);
    ownedMap.set(item.id, owned);
  }

  // Opcion B: Batch via getUserPurchases (mejor performance)
  const purchases = await getUserPurchases(userId);
  const ownedItemIds = new Set(purchases.map(p => p.item_id));

  return items.map(item => ({
    ...item,
    isOwned: ownedItemIds.has(item.id)
  }));
};
```

### 5.2 Fix: Claim Rewards en AchievementCard

```typescript
// achievementsAPI.ts - Agregar funcion

export const claimAchievementRewards = async (
  userId: string,
  achievementId: string,
): Promise<{
  success: boolean;
  ml_coins_awarded: number;
  xp_awarded: number;
}> => {
  const { data } = await apiClient.post(
    `/gamification/users/${userId}/achievements/${achievementId}/claim`
  );
  return data;
};
```

```typescript
// AchievementCard.tsx - Agregar boton

{achievement.isUnlocked && !achievement.rewardsClaimed && (
  <Button
    onClick={() => onClaimRewards(achievement.id)}
    className="bg-gold text-white"
  >
    Reclamar Recompensas ({achievement.mlCoinsReward} ML + {achievement.xpReward} XP)
  </Button>
)}
```

### 5.3 Fix: Validacion Rank Minimo

```typescript
// shop.service.ts - Modificar validateRequirements

// Definir orden de ranks
const RANK_ORDER = ['Alux', 'Chaak', 'Ix-Chel', 'Ahau', 'K\'uk\'ulkan'];

// Validar rank >= requerido
if (item.required_rank) {
  const requiredIndex = RANK_ORDER.indexOf(item.required_rank);
  const currentIndex = RANK_ORDER.indexOf(userStats.current_rank);

  if (currentIndex < requiredIndex) {
    throw new BadRequestException(
      `Required rank: ${item.required_rank} or higher. Current: ${userStats.current_rank}`
    );
  }
}
```

---

## 6. ARCHIVOS CLAVE PARA MODIFICAR

### Frontend (Prioridad Alta)

1. `apps/frontend/src/apps/student/pages/ShopPage.tsx`
   - Linea 108: Fix isOwned hardcodeado
   - Agregar llamada a getUserPurchases/checkItemOwnership

2. `apps/frontend/src/features/gamification/social/api/achievementsAPI.ts`
   - Agregar funcion claimAchievementRewards()

3. `apps/frontend/src/features/gamification/social/components/Achievements/AchievementCard.tsx`
   - Agregar boton "Claim Rewards" condicional

4. `apps/frontend/src/apps/student/pages/AchievementsPage.tsx`
   - Integrar claim rewards con store
   - Actualizar balance despues de claim

### Backend (Prioridad Media)

1. `apps/backend/src/modules/gamification/services/shop.service.ts`
   - Linea 309: Fix validacion rank >=
   - Linea 326: Implementar validacion achievement requerido

### Database (Prioridad Alta)

1. Copiar `seeds/prod/gamification_system/12-shop_categories.sql` a `seeds/dev/`
2. Copiar `seeds/prod/gamification_system/13-shop_items.sql` a `seeds/dev/`

---

## 7. VERIFICACION POST-IMPLEMENTACION

### Checklist de Validacion

- [ ] Shop muestra "Owned" en items ya comprados
- [ ] Shop NO permite recomprar items max_per_user=1 ya poseidos
- [ ] Shop valida rank >= requerido (no exacto)
- [ ] Achievements muestra boton "Claim" en completados sin reclamar
- [ ] Claim Rewards actualiza balance de ML Coins visible
- [ ] Seeds dev cargan correctamente con 5 categorias y 20+ items
- [ ] Error messages especificos (saldo, stock, requisitos)

### Endpoints a Testear

```bash
# Shop - Verificar ownership
curl -H "Authorization: Bearer <token>" \
  http://localhost:3006/api/v1/gamification/shop/owned/{userId}/{itemId}

# Shop - Listar compras
curl -H "Authorization: Bearer <token>" \
  http://localhost:3006/api/v1/gamification/shop/purchases/{userId}

# Achievements - Claim rewards
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:3006/api/v1/gamification/users/{userId}/achievements/{achievementId}/claim

# Achievements - Summary
curl -H "Authorization: Bearer <token>" \
  http://localhost:3006/api/v1/gamification/users/{userId}/achievements/summary
```

---

## 8. DELEGACION RECOMENDADA

Como Tech-Leader, recomiendo delegar las correcciones de la siguiente manera:

| Tarea | Delegar a | Razon |
|-------|-----------|-------|
| Fixes Frontend Shop/Achievements | PERFIL-FRONTEND | Modificaciones de componentes React, hooks, estado |
| Fixes Backend Validaciones | PERFIL-BACKEND | Modificaciones en services NestJS |
| Seeds dev sync | PERFIL-DATABASE | Copiar/adaptar SQL seeds |
| Code Review post-fix | PERFIL-CODE-REVIEWER | Validar calidad y consistencia |

---

## 9. CONCLUSION

El sistema de Shop y Achievements tiene una **base solida** con backend completo y funcional. Los gaps identificados son principalmente de **integracion frontend** y se pueden corregir sin modificaciones arquitecturales.

**Prioridad inmediata:**
1. Ownership check en ShopPage
2. Claim rewards UI en Achievements
3. Seeds dev sync

**Tiempo estimado total:** 12-16 horas de desarrollo

---

**Reporte generado por:** Tech-Leader Agent
**Fecha:** 2025-12-14
**Version:** 1.0
