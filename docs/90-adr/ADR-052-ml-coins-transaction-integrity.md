---
titulo: "ADR-052: ML Coins — Integridad Transaccional"
tipo: adr
fecha_creacion: "2026-03-03"
ultima_actualizacion: "2026-03-03"
estado: aceptada
---

# ADR-052: ML Coins — Integridad Transaccional

**Estado:** Aceptada
**Fecha:** 2026-03-03
**Decisores:** Equipo de desarrollo

## Contexto

El sistema de ML Coins presentaba 3 problemas de integridad:

1. **WELCOME_BONUS sin transaccion:** `UserStatsService.create()` inicializaba `ml_coins: 100` directamente sin crear un registro en `ml_coins_transactions`. El tipo `TransactionTypeEnum.WELCOME_BONUS` existia pero nunca se usaba. Esto obligaba a `auditBalance()` a compensar con `+ 100` hardcoded.

2. **Counter drift en `ml_coins_earned_total`:** Tres funciones DDL (`promote_to_next_rank`, `update_user_rank`, `claim_achievement_reward`) creditaban ML Coins a `user_stats.ml_coins` pero NO actualizaban `ml_coins_earned_total`, causando drift acumulativo. El leaderboard de maestros ordena por `ml_coins_earned_total DESC`, distorsionando el ranking.

3. **Divergencia de endpoints:** `MLCoinsService` no usaba `resolveProfileId()`, a diferencia de `UserStatsService`. Si recibia `auth.users.id` en vez de `profiles.id`, fallaba silenciosamente retornando zeros.

## Decision

**Toda operacion que modifique ML Coins DEBE crear un registro en `ml_coins_transactions` y actualizar `ml_coins_earned_total` cuando corresponda.**

### Cambios implementados

| Componente | Cambio |
|------------|--------|
| `UserStatsService.create()` | Crea transaccion WELCOME_BONUS (amount=100, reference_type='welcome') |
| `MLCoinsService.auditBalance()` | Removido `+ 100` hardcoded — SUM(transactions) = balance real |
| `promote_to_next_rank.sql` | Agrega `ml_coins_earned_total += v_ml_coins_bonus` |
| `update_user_rank.sql` | Agrega `ml_coins_earned_total += v_coins_reward` |
| `claim_achievement_reward.sql` | Agrega `ml_coins_earned_total += COALESCE(ml_coins_reward, 0)` |
| `MLCoinsService` | Agrega `resolveProfileId()` a 12 metodos publicos |
| DDL constraint | Agrega 'welcome' a reference_type CHECK |
| Entity | Agrega 'welcome' a union type y @Check |

## Alternativas evaluadas

1. **Mantener +100 hardcoded** — Rechazada. Fragil, no auditable, oculta el problema.
2. **Crear transaccion via MLCoinsService.addCoins()** — Rechazada por riesgo de circular dependency. Se uso inyeccion directa del repo de transacciones.
3. **Cambiar ml_coins DEFAULT a 0** — Rechazada. Mantener DEFAULT 100 en DDL como fallback defensivo; la transaccion WELCOME_BONUS es la fuente de verdad.

## Consecuencias

- `auditBalance()` funciona correctamente sin compensacion manual
- Leaderboard refleja ML Coins reales ganadas (sin drift)
- Endpoints ML Coins resuelven profileId correctamente
- Patron establecido: toda funcion DDL que credite coins DEBE actualizar ambos campos

## Referencias

- `apps/backend/src/modules/gamification/services/user-stats.service.ts`
- `apps/backend/src/modules/gamification/services/ml-coins.service.ts`
- `apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql`
- `apps/database/ddl/schemas/gamification_system/functions/update_user_rank.sql`
- `apps/database/ddl/schemas/gamification_system/functions/claim_achievement_reward.sql`

---

*GAMILIT - Architecture Decision Record*
