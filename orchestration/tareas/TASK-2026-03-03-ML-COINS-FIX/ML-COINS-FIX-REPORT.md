# ML Coins Fix Report — Salto 135→1235 + Desync Header/Tienda

**Fecha:** 2026-03-03
**Modelo:** Opus 4.6 (orquestador) + 4 Sonnet + 3 Haiku = 8 agentes
**Estado:** COMPLETADO

---

## Resumen del Problema

1. **Salto de 135→1235 ML Coins (+1100):** Brinco excesivo reportado por usuario `rckrdmrd@gmail.com`
2. **Desync header/tienda:** El header mostraba balance distinto al de la tienda

## Analisis de Causa Raiz

### Issue 1: Doble Aplicacion de Coins en Promocion de Rango (CRITICAL)

**Causa:** Dos paths independientes creditaban ML Coins en la misma promocion de rango:
- **Path A (DB trigger):** `addXp()` → trigger `trg_check_rank_promotion_on_xp_gain` → `promote_to_next_rank()` → UPDATE user_stats SET ml_coins += bonus
- **Path B (Backend API):** `POST /ranks/promote/:userId` → `ranksService.promoteToNextRank()` → `mlCoinsService.addCoins()` → segundo credito

**Escenario del +1100:** Promocion a K'uk'ulkan (1000 coins bonus) + misiones/logros (~100 coins) = ~1100 coins. Si ambos paths ejecutaron, los coins de rango se duplicaron.

### Issue 2: Desync Header vs Tienda (HIGH)

**Causa:** Dos sistemas de estado independientes sin sincronizacion:
- Header: React Query (`useUserGamification` → `GET /summary`) con staleTime de 5 minutos
- Tienda: Zustand persist (localStorage → `GET /stats`)
- `economyStore.addCoins()` y `spendCoins()` actualizaban Zustand pero NO invalidaban React Query

### Issue 3: Race Condition en Missions Fallback (HIGH)

**Causa:** `claimRewardsFallback()` usaba `findOne()` sin lock. Dos requests concurrentes podian pasar la verificacion de `claimed_at` y ambos otorgar recompensas.

## Cambios Realizados

### Backend (3 archivos)

| Archivo | Cambio | Severidad |
|---------|--------|-----------|
| `ranks.service.ts` | Removido `mlCoinsService.addCoins()` de `promoteToNextRank()`. DB trigger ya lo maneja. Solo log. | CRITICAL |
| `missions.service.ts` | Atomic UPDATE guard en `claimRewardsFallback()`: `WHERE claimed_at IS NULL` + `affected === 0` → BadRequestException | HIGH |
| `ranks.service.spec.ts` | Test actualizado: `addCoins` → `not.toHaveBeenCalled()` | TEST |
| `missions.service.spec.ts` | Mock de `createQueryBuilder` para atomic guard + doble `findOne` mock | TEST |

### Frontend (4 archivos)

| Archivo | Cambio | Severidad |
|---------|--------|-----------|
| `shared/lib/queryClient.ts` | NUEVO: Singleton QueryClient exportado (extraido de main.tsx) | PREREQ |
| `main.tsx` | Import singleton en vez de crear QueryClient inline | PREREQ |
| `economyStore.ts` | `addCoins()` y `spendCoins()` ahora llaman `queryClient.invalidateQueries(['userGamification'])` | HIGH |
| `useUserGamification.ts` | `staleTime` reducido de 5 min → 30 seg | MEDIUM |
| `ShopPage.tsx` | Loading skeleton mientras `fetchBalance()` esta en progreso | LOW |

## Resultados de Validacion

| Check | Resultado |
|-------|-----------|
| Backend build | PASS (0 errores) |
| Backend lint | PASS (0 errores, 635 warnings pre-existentes) |
| Frontend typecheck | PASS (0 errores) |
| Frontend build | PASS (0 errores) |
| Frontend lint | PASS (0 errores, 98 warnings pre-existentes) |
| ranks.service.spec | PASS (todos los tests) |
| missions.service.spec | PASS (todos los tests) |
| Gamification tests | 302/338 pass (34 fallos pre-existentes: integration/e2e sin BD live, config DI) |

## Fuera de Alcance / Trabajo Futuro

1. **`auditBalance()` hardcoded +100:** `ml-coins.service.ts:422` asume balance inicial 100 sin transaccion INITIAL. Fix: emitir transaccion `type=INITIAL` en `UserStatsService.create()`
2. **`ml_coins_earned_total` no incluye bonus de rango:** El trigger DB no actualiza este contador. Fix: agregar `ml_coins_earned_total = ml_coins_earned_total + v_ml_coins_bonus` al UPDATE en `promote_to_next_rank.sql`
3. **`/stats` vs `/summary` — dos endpoints distintos:** Riesgo estructural bajo de discrepancia transitoria
4. **Zustand persist sin migration:** localStorage stale sobrevive reinicios de app hasta que `fetchBalance()` se ejecute
5. **`useStudentPageSetup` no llama `fetchBalance()`:** El Zustand store no se sincroniza hasta que ShopPage monte

---

## Impacto en Métricas

- **BACKEND_INVENTORY:** v5.3.4 → v5.3.5 (ranks.service + missions.service fixes)
- **FRONTEND_INVENTORY:** v12.7.2 → v12.7.3 (queryClient singleton + staleTime reduction)
- **MASTER_INVENTORY:** v14.9.9 → v14.9.10
