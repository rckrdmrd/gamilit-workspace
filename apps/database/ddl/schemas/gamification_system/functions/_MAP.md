# Funciones del Schema gamification_system (Partes 1 y 2)

## Descripción General
Conjunto de 20 funciones SQL para el sistema de gamificación de la plataforma Gamilit, divididas en dos partes:

**Parte 1 (Funciones 1-10):** Bases del sistema
- Otorgamiento y gestión de XP y ML Coins
- Cálculo de niveles y rangos
- Logros y recompensas
- Inventario y comodines
- Boosts y multiplicadores

**Parte 2 (Funciones 11-20):** Consultas avanzadas y actualización de rankings
- Resumen de inventario del usuario
- Progreso de rango del usuario
- Requisitos de rango
- Otorgamiento de logros
- Procesamiento de completitud de ejercicios
- Canje de comodines
- Actualización de leaderboards (coins, global, streaks)
- Actualización de rango del usuario

## Funciones Implementadas (20/20)

### 1. apply_xp_boost.sql
- **Función:** `gamification_system.apply_xp_boost(UUID, INTEGER)`
- **Descripción:** Calcula XP con multiplicadores de boost aplicados, sin modificar la base de datos
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
  - `p_base_xp` (INTEGER) - XP base a multiplicar
- **Retorna:** TABLE (base_xp, total_multiplier, boosted_xp, active_boosts_count)
- **Origen:** `15-apply_xp_boost.sql` (backup)
- **Estado:** ✓ Validado

### 2. award_ml_coins.sql
- **Función:** `gamification_system.award_ml_coins(UUID, INTEGER, TEXT, TEXT, UUID, TEXT)`
- **Descripción:** Otorga ML Coins al usuario aplicando multiplicador de rango y registra la transacción
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
  - `p_amount` (INTEGER) - Cantidad base de ML Coins
  - `p_transaction_type` (TEXT) - Tipo de transacción
  - `p_description` (TEXT) - Descripción
  - `p_reference_id` (UUID, opcional) - ID de referencia
  - `p_reference_type` (TEXT, opcional) - Tipo de referencia
- **Retorna:** UUID (ID de la transacción)
- **Origen:** `01-award_ml_coins.sql` (backup)
- **Estado:** ✓ Validado

### 3. calculate_level_from_xp.sql
- **Función:** `gamification_system.calculate_level_from_xp(INTEGER)`
- **Descripción:** Calcula el nivel basado en XP total
- **Parámetros:**
  - `p_xp` (INTEGER) - Total de XP
- **Retorna:** INTEGER (nivel calculado)
- **Origen:** `02-calculate_level_from_xp.sql` (backup)
- **Estado:** ✓ Validado

### 4. calculate_user_rank.sql
- **Función:** `gamification_system.calculate_user_rank(UUID)`
- **Descripción:** Calcula el rango actual del usuario basado en XP total y misiones completadas
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
- **Retorna:** TABLE (user_id, current_rank, next_rank, xp_to_next_rank, missions_to_next_rank, rank_percentage)
- **Origen:** Creado nuevo
- **Estado:** ✓ Validado

### 5. check_and_award_achievements.sql
- **Función:** `gamification_system.check_and_award_achievements(UUID, VARCHAR, INTEGER)`
- **Descripción:** Verifica y otorga achievements automáticamente basados en eventos del usuario
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
  - `p_event_type` (VARCHAR) - Tipo de evento (MISSIONS_COMPLETED, TOTAL_XP, STREAK_DAYS, etc)
  - `p_event_value` (INTEGER, default 1) - Valor del evento
- **Retorna:** TABLE (achievement_id, achievement_name, xp_granted, coins_granted)
- **Origen:** `16-check_and_grant_achievements.sql` (backup)
- **Estado:** ✓ Validado

### 6. claim_achievement_reward.sql
- **Función:** `gamification_system.claim_achievement_reward(UUID, UUID)`
- **Descripción:** Reclama la recompensa de un logro ya desbloqueado
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
  - `p_achievement_id` (UUID) - ID del logro
- **Retorna:** TABLE (success, xp_granted, coins_granted, message)
- **Origen:** Creado nuevo
- **Estado:** ✓ Validado

### 7. consume_comodin.sql
- **Función:** `gamification_system.consume_comodin(UUID, UUID)`
- **Descripción:** Consume un comodín del usuario y aplica su efecto
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
  - `p_comodin_id` (UUID) - ID del comodín
- **Retorna:** TABLE (success, comodin_type, effect_applied, value_applied, message)
- **Origen:** Creado nuevo
- **Estado:** ✓ Validado

### 8. get_user_comodines.sql
- **Función:** `gamification_system.get_user_comodines(UUID)`
- **Descripción:** Obtiene todos los comodines disponibles del usuario
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
- **Retorna:** TABLE (comodin_id, comodin_name, comodin_type, category, quantity, effect_description, acquired_at, expires_at)
- **Origen:** Creado nuevo
- **Estado:** ✓ Validado

### 9. get_user_current_rank.sql
- **Función:** `gamification_system.get_user_rank_progress(UUID)`
- **Descripción:** Calcula el progreso del usuario hacia el siguiente rango Maya
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
- **Retorna:** TABLE (current_rank, current_xp, next_rank, next_rank_xp, xp_needed, progress_percentage, missions_completed, missions_required)
- **Origen:** `17-get_user_rank_progress.sql` (backup)
- **Estado:** ✓ Validado

### 10. get_user_inventory.sql
- **Función:** `gamification_system.get_user_inventory_summary(UUID)`
- **Descripción:** Obtiene resumen completo del inventario del usuario con estadísticas
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
- **Retorna:** TABLE (total_items, total_value_coins, items_by_category, consumables_count, cosmetics_count, boosts_count, recent_acquisitions)
- **Origen:** `23-get_user_inventory_summary.sql` (backup)
- **Estado:** ✓ Validado

## PARTE 2: FUNCIONES 11-20 (Migración SA-DB-025)

### 11. get_user_inventory_summary.sql
- **Función:** `gamification_system.get_user_inventory_summary(UUID)`
- **Descripción:** Obtiene resumen completo del inventario del usuario con estadísticas y adquisiciones recientes
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
- **Retorna:** TABLE (total_items, total_value_coins, items_by_category, consumables_count, cosmetics_count, boosts_count, recent_acquisitions)
- **Origen:** Alias de get_user_inventory.sql
- **Estado:** ✓ Validado

### 12. get_user_rank_progress.sql
- **Función:** `gamification_system.get_user_rank_progress(UUID)`
- **Descripción:** Calcula el progreso del usuario hacia el siguiente rango Maya
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
- **Retorna:** TABLE (current_rank, current_xp, next_rank, next_rank_xp, xp_needed, progress_percentage, missions_completed, missions_required)
- **Origen:** Alias de get_user_current_rank.sql
- **Estado:** ✓ Validado

### 13. get_user_rank_requirements.sql
- **Función:** `gamification_system.get_user_rank_requirements(VARCHAR)`
- **Descripción:** Obtiene requisitos para el siguiente rango maya
- **Parámetros:**
  - `p_current_rank` (VARCHAR) - Rango actual del usuario
- **Retorna:** TABLE (next_rank, modules_required, xp_required, ml_coins_bonus)
- **Origen:** Creado nuevo (basado en backup 04-get_user_rank_requirements.sql)
- **Estado:** ✓ Validado

### 14. grant_achievement.sql
- **Función:** `gamification_system.grant_achievement(UUID, VARCHAR, INTEGER)`
- **Descripción:** Verifica y otorga achievements automáticamente basados en eventos del usuario
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
  - `p_event_type` (VARCHAR) - Tipo de evento (MISSIONS_COMPLETED, TOTAL_XP, STREAK_DAYS, etc)
  - `p_event_value` (INTEGER) - Valor del evento (default 1)
- **Retorna:** TABLE (achievement_id, achievement_name, xp_granted, coins_granted)
- **Origen:** Alias de check_and_award_achievements.sql
- **Estado:** ✓ Validado

### 15. process_exercise_completion.sql
- **Función:** `gamification_system.process_exercise_completion(UUID, UUID, INTEGER)`
- **Descripción:** Procesa y otorga recompensas por completar ejercicios
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
  - `p_exercise_id` (UUID) - ID del ejercicio
  - `p_xp_earned` (INTEGER) - XP ganado por el ejercicio (default 100)
- **Retorna:** TABLE (user_id, xp_awarded, coins_awarded, level_up, achievement_triggered)
- **Origen:** Creado nuevo
- **Estado:** ✓ Validado

### 16. redeem_comodin.sql
- **Función:** `gamification_system.redeem_comodin(UUID, UUID)`
- **Descripción:** Procesa el canje de un comodín por el usuario
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
  - `p_comodin_id` (UUID) - ID del comodín a canjear
- **Retorna:** TABLE (success, message)
- **Origen:** Alias de consume_comodin.sql
- **Estado:** ✓ Validado

### 17. update_leaderboard_coins.sql
- **Función:** `gamification_system.update_leaderboard_coins(UUID)`
- **Descripción:** Actualiza posición del usuario en el leaderboard de monedas ML
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
- **Retorna:** TABLE (rank, total_coins, position_change)
- **Origen:** Creado nuevo
- **Estado:** ✓ Validado

### 18. update_leaderboard_global.sql
- **Función:** `gamification_system.update_leaderboard_global(UUID, VARCHAR, VARCHAR)`
- **Descripción:** Obtiene la posición del usuario en el leaderboard global
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
  - `p_leaderboard_type` (VARCHAR) - Tipo de leaderboard (XP, MISSIONS) default 'XP'
  - `p_scope` (VARCHAR) - Alcance del leaderboard (GLOBAL, CLASSROOM) default 'GLOBAL'
- **Retorna:** TABLE (user_position, total_participants, user_score, top_score, percentile)
- **Origen:** Creado nuevo (basado en backup 24-get_leaderboard_position.sql)
- **Estado:** ✓ Validado

### 19. update_leaderboard_streaks.sql
- **Función:** `gamification_system.update_leaderboard_streaks(UUID)`
- **Descripción:** Verifica y actualiza la racha de días consecutivos del usuario
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
- **Retorna:** TABLE (current_streak, longest_streak, streak_maintained, bonus_xp)
- **Origen:** Creado nuevo (basado en backup 21-check_streak.sql)
- **Estado:** ✓ Validado

### 20. update_user_rank.sql
- **Función:** `gamification_system.update_user_rank(UUID)`
- **Descripción:** Actualiza el rango del usuario basado en XP total y otorga recompensas
- **Parámetros:**
  - `p_user_id` (UUID) - ID del usuario
- **Retorna:** TABLE (old_rank, new_rank, rank_up, reward_coins)
- **Origen:** Creado nuevo (basado en backup 20-update_user_level.sql)
- **Estado:** ✓ Validado

## Resumen de Implementación

### Estadísticas
- **Total de funciones:** 20/20
- **Parte 1 (Funciones 1-10):**
  - Funciones migradas del backup: 6
  - Funciones creadas nuevas: 4
- **Parte 2 (Funciones 11-20) - SA-DB-025:**
  - Funciones creadas nuevas: 6
  - Aliases de Parte 1: 4
- **Validación de sintaxis:** 100% OK
- **Permisos GRANT EXECUTE:** 100% configurados

### Archivos Creados
**Parte 1 (SA-DB-024):**
1. apply_xp_boost.sql (1.6 KB)
2. award_ml_coins.sql (3.1 KB)
3. calculate_level_from_xp.sql (0.7 KB)
4. calculate_user_rank.sql (1.8 KB) - NUEVO
5. check_and_award_achievements.sql (4.3 KB)
6. claim_achievement_reward.sql (2.8 KB) - NUEVO
7. consume_comodin.sql (3.1 KB) - NUEVO
8. get_user_comodines.sql (1.5 KB) - NUEVO
9. get_user_current_rank.sql (2.9 KB)
10. get_user_inventory.sql (2.4 KB)

**Parte 2 (SA-DB-025):**
11. get_user_inventory_summary.sql (2.4 KB) - Alias
12. get_user_rank_progress.sql (2.9 KB) - Alias
13. get_user_rank_requirements.sql (1.6 KB) - NUEVO
14. grant_achievement.sql (4.1 KB) - Alias
15. process_exercise_completion.sql (2.0 KB) - NUEVO
16. redeem_comodin.sql (3.1 KB) - Alias
17. update_leaderboard_coins.sql (1.6 KB) - NUEVO
18. update_leaderboard_global.sql (2.4 KB) - NUEVO
19. update_leaderboard_streaks.sql (2.7 KB) - NUEVO
20. update_user_rank.sql (2.7 KB) - NUEVO

### Ubicación
**Destino:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/functions/`

## Validación Realizada

✓ Verificación de sintaxis SQL básica
✓ Validación de CREATE OR REPLACE en todas las funciones
✓ Validación de LANGUAGE plpgsql/sql en todas las funciones
✓ Validación de COMMENT ON FUNCTION en todas las funciones
✓ Validación de GRANT EXECUTE a rol 'authenticated' en todas las funciones
✓ Estructura de headers consistente
✓ Parámetros documentados
✓ Return types definidos

## Dependencias Identificadas

Las funciones dependen de las siguientes tablas:
- `gamification_system.user_stats`
- `gamification_system.user_ranks`
- `gamification_system.user_achievements`
- `gamification_system.achievements`
- `gamification_system.ml_coins_transactions`
- `gamification_system.active_boosts`
- `gamification_system.user_inventory`
- `gamification_system.store_items`
- `gamification_system.maya_ranks`

## Notas de Implementación

1. Las funciones migradas desde backup mantienen su estructura original
2. Las funciones nuevas (4) fueron creadas siguiendo los estándares del proyecto:
   - Headers documentados
   - COMMENT ON FUNCTION
   - GRANT EXECUTE al rol authenticated
   - Validación de entrada
   - Manejo de errores

3. Mapeo de nombres utilizados:
   - `get_user_current_rank` → `get_user_rank_progress` (alias)
   - `get_user_inventory` → `get_user_inventory_summary` (alias)

4. Las 4 funciones nuevas fueron creadas porque no existían en el backup:
   - `calculate_user_rank`
   - `claim_achievement_reward`
   - `consume_comodin`
   - `get_user_comodines`

## Historial de Implementación
- **Parte 1:** 2025-11-02 (SA-DB-024)
- **Parte 2:** 2025-11-02 (SA-DB-025)

---

**Generado por:**
- SA-DB-024 - Subagente especializado en migración de funciones SQL (Parte 1)
- SA-DB-025 - Subagente especializado en migración de funciones SQL (Parte 2)

**Version:** 2.0 - Completo (Partes 1 y 2)
