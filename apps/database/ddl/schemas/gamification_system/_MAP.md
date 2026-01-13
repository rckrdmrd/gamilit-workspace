# Schema: gamification_system

Sistema de gamificación: logros, rangos Maya, monedas ML, comodines, tienda virtual.

## Estructura

- **tables/**: 19 archivos activos
- **enums/**: 8 archivos
- **functions/**: 21 archivos activos
- **functions/_deprecated/**: 4 archivos (funciones updated_at + leaderboard sin uso)
- **triggers/**: 7 archivos activos (incluye 00-batch_updated_at_triggers.sql con 5 triggers)
- **triggers/_deprecated/**: 6 archivos (triggers updated_at individuales)
- **rls-policies/_deprecated/**: 1 archivo (policies de notifications)
- **indexes/**: 23 archivos
- **materialized-views/**: 4 archivos (leaderboards activos)
- **views/_deprecated/**: 4 archivos (views redundantes)
- **rls-policies/**: 8 archivos

**Total:** ~90 objetos DDL activos

## Tablas (19 archivos)

| # | Archivo | Tabla | Proposito |
|---|---------|-------|-----------|
| 01 | `01-user_stats.sql` | user_stats | Estadisticas principales (XP, ML Coins, nivel, racha) |
| 02 | `02-user_ranks.sql` | user_ranks | Rangos Maya actuales e historicos |
| 03 | `03-achievements.sql` | achievements | Definicion de logros |
| 04 | `04-user_achievements.sql` | user_achievements | Logros desbloqueados por usuario |
| 05 | `05-ml_coins_transactions.sql` | ml_coins_transactions | Historial de transacciones ML Coins |
| 06 | `06-missions.sql` | missions | Misiones diarias y semanales |
| 07 | `07-comodines_inventory.sql` | comodines_inventory | Inventario de comodines por usuario |
| 08 | `09-leaderboard_metadata.sql` | leaderboard_metadata | Configuracion de leaderboards |
| 09 | `10-achievement_categories.sql` | achievement_categories | Categorias de logros |
| 10 | `11-active_boosts.sql` | active_boosts | Boosts activos de usuarios |
| 11 | `12-inventory_transactions.sql` | inventory_transactions | Transacciones de inventario |
| 12 | `13-maya_ranks.sql` | maya_ranks | Definicion de 7 rangos (Ajaw → Ahau) |
| 13 | `14-comodin_usage_log.sql` | comodin_usage_log | Log de uso de comodines |
| 14 | `15-comodin_usage_tracking.sql` | comodin_usage_tracking | Tracking de uso de comodines |
| 15 | `16-classroom_missions.sql` | classroom_missions | Misiones asignadas a aulas |
| 16 | `17-shop_categories.sql` | shop_categories | Categorias de tienda virtual |
| 17 | `18-shop_items.sql` | shop_items | Items de tienda virtual |
| 18 | `19-user_purchases.sql` | user_purchases | Compras de usuarios |
| 19 | `20-mission_templates.sql` | mission_templates | Templates de misiones |

**Nota:** Tabla `notifications` movida a schema `notifications` (ver MIGRATION-NOTIFICATIONS.md)

## Migracion de Duplicados

**Ver:** `MIGRATION-NOTIFICATIONS.md`

| Tabla Deprecated | Migrar a | Razon |
|-----------------|----------|-------|
| `notifications` | `notifications.notifications` | Sistema consolidado multi-canal |

## Sistema de Rangos Maya

7 rangos progresivos basados en XP acumulada:
1. Ajaw (0 XP) → Ahau (50,000+ XP)

Cada rango otorga multiplicadores de XP y ML Coins.

## Funciones Principales

| Función | Propósito |
|---------|-----------|
| `check_rank_promotion` | Verifica si usuario califica para promoción |
| `promote_to_next_rank` | Ejecuta promoción de rango |
| `get_rank_multiplier` | Obtiene multiplicador por rango |
| `award_ml_coins` | Otorga ML Coins con transacción |
| `check_and_award_achievements` | Verifica y otorga logros |
| `consume_comodin` | Consume comodín del inventario |
| `process_exercise_completion` | Procesa XP/ML tras ejercicio |
| `update_leaderboard_streaks` | Actualiza racha de usuario (usado por backend) |

## Vistas Materializadas (Activas)

| Materialized View | Propósito | Refresh | Estado |
|-------------------|-----------|---------|--------|
| `mv_global_leaderboard` | Ranking global por XP | Horario | ✅ OK |
| `mv_classroom_leaderboard` | Ranking por aula | 30 min | ✅ OK |
| `mv_weekly_leaderboard` | Ranking semanal | Horario + reset lunes | ✅ OK |
| `mv_mechanic_leaderboard` | Ranking por mecánica | 2 horas | ⚠️ Sin uso |

**Nota DB-165:** `mv_mechanic_leaderboard` no se usa en backend. Tiene diseño con CROSS JOIN
que genera producto cartesiano (cada estudiante × cada tipo de misión). Candidata a deprecación
en futuro refactoring.

## Directorios _deprecated

### Views (DB-158)

| View | Razon |
|------|-------|
| `leaderboard_coins` | Redundante con mv_global_leaderboard |
| `leaderboard_global` | Redundante con mv_global_leaderboard |
| `leaderboard_streaks` | Sin uso en backend |
| `leaderboard_xp` | Redundante con mv_global_leaderboard |

### Funciones (DB-162, DB-164)

| Función | Razón | Reemplazada por |
|---------|-------|-----------------|
| `update_missions_updated_at` | Redundante | `gamilit.update_updated_at_column()` |
| `update_notifications_updated_at` | Redundante | `gamilit.update_updated_at_column()` |
| `update_leaderboard_global` | Sin uso en backend | Materialized views (mv_global_leaderboard) |
| `update_leaderboard_coins` | Sin uso + bug v_old_rank=1 | Materialized views (mv_global_leaderboard) |

## Consolidacion de Triggers (2026-01-07)

Triggers de `updated_at` consolidados en `00-batch_updated_at_triggers.sql`:
- `achievements_updated_at`
- `comodines_inventory_updated_at`
- `missions_updated_at`
- `notifications_updated_at`
- `user_ranks_updated_at`
- `user_stats_updated_at`

Archivos originales movidos a `triggers/_deprecated/`.

---

**Ultima actualizacion:** 2026-01-13
**Cambios recientes:**
- AUDITORIA: Inventario de tablas actualizado de 15 a 19 (2026-01-13)
- AUDITORIA: Timestamps de missions alineados a WITH TIME ZONE (2026-01-13)
- LIMPIEZA: Trigger de notifications removido del batch (2026-01-07)
- LIMPIEZA: RLS policies de notifications movidas a rls-policies/_deprecated/ (2026-01-07)
- CONSOLIDACION BD: Triggers updated_at consolidados en 00-batch_updated_at_triggers.sql (2026-01-07)
- CONSOLIDACION BD: 6 triggers individuales movidos a _deprecated/ (2026-01-07)
- notifications marcada como DEPRECATED (2026-01-04)
- Agregado MIGRATION-NOTIFICATIONS.md
