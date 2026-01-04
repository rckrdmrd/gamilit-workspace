# Schema: gamification_system

Sistema de gamificación: logros, rangos Maya, monedas ML, comodines, tienda virtual.

## Estructura

- **tables/**: 15 archivos
- **enums/**: 4 archivos
- **functions/**: 21 archivos activos
- **functions/_deprecated/**: 4 archivos (funciones updated_at + leaderboard sin uso)
- **triggers/**: 10 archivos
- **indexes/**: 23 archivos
- **materialized-views/**: 4 archivos (leaderboards activos)
- **views/_deprecated/**: 4 archivos (views redundantes)
- **rls-policies/**: 8 archivos

**Total:** 85 objetos DDL activos

## Tablas Principales

| Tabla | Propósito |
|-------|-----------|
| `user_stats` | Estadísticas principales (XP, ML Coins, nivel, racha) |
| `user_ranks` | Rangos Maya actuales e históricos |
| `maya_ranks` | Definición de 7 rangos (Ajaw → Ahau) |
| `achievements` | Definición de logros |
| `user_achievements` | Logros desbloqueados por usuario |
| `ml_coins_transactions` | Historial de transacciones ML Coins |
| `missions` | Misiones diarias y semanales |
| `comodines_inventory` | Inventario de comodines por usuario |
| `leaderboard_metadata` | Configuración de leaderboards |
| `achievement_categories` | Categorías de logros |

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

---

**Última actualización:** 2025-12-29
