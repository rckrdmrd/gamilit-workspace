# ML Coins Remediation Report

**Fecha:** 2026-03-03
**Alcance:** 3 items fuera de alcance de investigacion previa
**Agentes:** 1 Opus (orquestador) + 6 Sonnet + 4 Haiku = 11 agentes
**Archivos modificados:** ~10 codigo + ~6 docs

## Items Resueltos

### Item 1: auditBalance() hardcoded +100
- **Causa raiz:** UserStatsService.create() inicializaba ml_coins=100 sin crear transaccion WELCOME_BONUS
- **Fix:** Emitir transaccion WELCOME_BONUS en create(), remover +100 de auditBalance()
- **Archivos:** user-stats.service.ts, ml-coins.service.ts, 05-ml_coins_transactions.sql, ml-coins-transaction.entity.ts

### Item 2: ml_coins_earned_total counter drift
- **Causa raiz:** 3 DDL functions creditaban ml_coins pero no actualizaban ml_coins_earned_total
- **Fix:** Agregar `ml_coins_earned_total = ml_coins_earned_total + amount` a cada funcion
- **Archivos:** promote_to_next_rank.sql, update_user_rank.sql, claim_achievement_reward.sql

### Item 3: Divergencia endpoints /stats vs /summary vs /ml-coins
- **Causa raiz:** MLCoinsService no usaba resolveProfileId()
- **Fix:** Agregar resolveProfileId() a 12 metodos publicos de MLCoinsService
- **Archivos:** ml-coins.service.ts

### Item 4: Trigger DDL con transaction_type invalido (descubierto en validacion seeds)
- **Causa raiz:** `initialize_user_stats()` usaba `transaction_type = 'earn'` (no existe en enum) y `reference_type = 'admin'`. El INSERT fallaba silenciosamente en el EXCEPTION handler del trigger — 59 user_stats pero solo 1 welcome_bonus transaction.
- **Fix:** Corregido a `'welcome_bonus'::gamification_system.transaction_type` y `reference_type = 'welcome'` (consistente con backend y CHECK constraint).
- **Archivos:** `04-initialize_user_stats.sql`, `validate-initialize-user-stats-v2.sql` (columna `source` → `reason`)
- **Verificacion post-fix:** 58 user_stats, 56 welcome_bonus transactions (vs 1 antes)

## Cambios adicionales
- Test specs actualizados: ml-coins.service.spec.ts (Profile repo mock), user-stats.service.spec.ts (MLCoinsTransaction repo mock)
- ADR-052 creado
- Docs actualizados: schema-reference, API reference, SPEC-GAMIFICATION, FL-SYS-03
- Script validacion corregido: columna `source` → `reason`, `'earn'` → `'welcome_bonus'`

## Validacion
- Backend build: PASS (0 errores)
- Backend lint: PASS (0 errores nuevos)
- Frontend build: PASS
- Frontend typecheck: PASS
- Tests: 63/63 PASS (ml-coins + user-stats)
- BD recreada: PASS (173 tablas, 255 funciones)
- Trigger welcome_bonus: 56/58 transacciones creadas (antes: 1/59)
- Seeds homologacion: 3 envs consistentes, no requieren cambios

## Homologacion Seeds y Scripts
| Componente | dev | prod | staging | Estado |
|------------|-----|------|---------|--------|
| DDL functions (ml_coins_earned_total) | OK | OK (mismas DDL) | OK (mismas DDL) | HOMOLOGADO |
| DDL constraint (reference_type 'welcome') | OK | OK | OK | HOMOLOGADO |
| DDL trigger (welcome_bonus enum) | OK | OK | OK | HOMOLOGADO |
| Seeds 05-user_stats.sql | OK (ml_coins=100, earned_total=100) | OK | OK | HOMOLOGADO |
| Seeds 07-ml_coins_transactions.sql | OK (no welcome rows, trigger authoritative) | OK | OK | HOMOLOGADO |
| Script validate-v2.sql | CORREGIDO (earn→welcome_bonus, source→reason) | N/A | N/A | CORREGIDO |
| recreate-database.sh | OK (sin hardcoded earn/admin) | N/A | N/A | LIMPIO |
| init-database.sh | OK (sin hardcoded earn/admin) | N/A | N/A | LIMPIO |

## Items pendientes (fuera de alcance)
- addXp() no consulta active boosts (multiplicador boost no aplicado a XP)
- Boost expiration cron (solo desactivacion on-read)
- Consolidacion de 3 versiones de gamificationAPI en frontend
- RankMultiplierService no tiene resolveProfileId (recibe userId de addCoinsWithRankMultiplier)
