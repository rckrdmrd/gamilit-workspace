# Inventario de Funciones de Base de Datos

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Autor:** Requirements-Analyst (SIMCO)

---

## RESUMEN

| Schema | Total Funciones | Documentadas |
|--------|-----------------|--------------|
| gamification_system | 12 | 12 |
| educational_content | 15 | 15 |
| auth_management | 5 | 5 |
| **TOTAL** | **32** | **32** |

---

## SCHEMA: gamification_system

### Funciones de Rangos Maya

#### calculate_maya_rank_from_xp(xp INTEGER)

**Ubicacion:** `ddl/schemas/gamification_system/functions/calculate_maya_rank_helpers.sql:1-50`
**Version:** v2.1 (Dec 14, 2025)
**Status:** Activo

**Proposito:** Determina el rango Maya basado en XP total.

**Thresholds v2.1:**
| XP | Rango |
|----|-------|
| 0-499 | Ajaw |
| 500-999 | Nacom |
| 1000-1499 | Ah K'in |
| 1500-1899 | Halach Uinic |
| 1900+ | K'uk'ulkan |

```sql
SELECT gamification_system.calculate_maya_rank_from_xp(500);
-- Retorna: 'Nacom'
```

---

#### calculate_rank_progress_percentage(xp INTEGER)

**Ubicacion:** `ddl/schemas/gamification_system/functions/calculate_maya_rank_helpers.sql:51-119`
**Version:** v2.1 (Dec 14, 2025)
**Status:** Activo

**Proposito:** Calcula el porcentaje de progreso dentro del rango actual.

```sql
SELECT gamification_system.calculate_rank_progress_percentage(750);
-- Retorna: 50 (50% dentro de Nacom)
```

---

#### calculate_user_rank(p_user_id UUID)

**Ubicacion:** `ddl/schemas/gamification_system/functions/calculate_user_rank.sql:1-75`
**Version:** v2.1 (Dec 15, 2025)
**Status:** Activo
**Correccion:** CORR-P0-001 (missions_completed -> modules_completed)

**Proposito:** Calcula y actualiza el rango de un usuario basado en su XP.

```sql
SELECT gamification_system.calculate_user_rank('user-uuid');
```

---

#### get_user_rank_progress(p_user_id UUID)

**Ubicacion:** `ddl/schemas/gamification_system/functions/get_user_rank_progress.sql:1-86`
**Version:** v2.1 (Dec 18, 2025)
**Status:** Activo

**Proposito:** Obtiene informacion completa de progreso de rango.

**Retorna:** Record con current_rank, xp_total, progress_percentage, next_rank, xp_to_next

---

### Funciones de Leaderboard

#### update_leaderboard_global()

**Ubicacion:** `ddl/schemas/gamification_system/functions/update_leaderboard_global.sql:1-79`
**Version:** v2.1 (Dec 18, 2025)
**Status:** Activo
**Correccion:** CORR-P0-001

**Proposito:** Actualiza el leaderboard global con posiciones actuales.

---

#### update_leaderboard_coins()

**Ubicacion:** `ddl/schemas/gamification_system/functions/update_leaderboard_coins.sql:1-60`
**Status:** Activo

**Proposito:** Actualiza leaderboard ordenado por ML Coins.

---

#### update_leaderboard_streaks()

**Ubicacion:** `ddl/schemas/gamification_system/functions/update_leaderboard_streaks.sql:1-94`
**Version:** v2.1 (Dec 15, 2025)
**Status:** Activo
**Correccion:** CORR-001 (last_activity_date -> last_activity_at, longest_streak -> max_streak)

**Proposito:** Actualiza leaderboard de rachas.

---

### Funciones de Promocion

#### check_rank_promotion(p_user_id UUID)

**Ubicacion:** `ddl/schemas/gamification_system/functions/check_rank_promotion.sql:1-80`
**Status:** Activo

**Proposito:** Verifica si un usuario califica para promocion de rango.

---

#### promote_to_next_rank(p_user_id UUID)

**Ubicacion:** `ddl/schemas/gamification_system/functions/promote_to_next_rank.sql:1-120`
**Status:** Activo

**Proposito:** Ejecuta la promocion de rango y registra en historial.

---

### Funciones de Beneficios

#### get_rank_benefits(p_rank maya_rank)

**Ubicacion:** `ddl/schemas/gamification_system/functions/get_rank_benefits.sql:1-45`
**Status:** Activo

**Proposito:** Obtiene los beneficios/perks de un rango.

---

#### get_rank_multiplier(p_rank maya_rank)

**Ubicacion:** `ddl/schemas/gamification_system/functions/get_rank_multiplier.sql:1-25`
**Status:** Activo

**Proposito:** Obtiene el multiplicador de XP para un rango.

---

## SCHEMA: educational_content

### Funciones de Validacion

#### validate_rueda_inferencias(...)

**Ubicacion:** `ddl/schemas/educational_content/functions/14-validate_rueda_inferencias.sql:176-410`
**Version:** v1.0 (Dec 15, 2025)
**Status:** NUEVO

**Proposito:** Valida respuestas abiertas para ejercicios de "Rueda de Inferencias".

**Caracteristicas:**
- Soporte para estructura `categoryExpectations` (nueva)
- Soporte para estructura `flat` (legacy)
- Validacion de keywords con normalizacion
- Puntuacion parcial

**Retorna:**
```sql
RECORD (
  is_correct BOOLEAN,
  score INTEGER,
  feedback TEXT,
  details JSONB
)
```

---

#### validate_multiple_choice(...)

**Ubicacion:** `ddl/schemas/educational_content/functions/01-validate_multiple_choice.sql`
**Status:** Activo

**Proposito:** Valida respuestas de opcion multiple.

---

#### validate_drag_and_drop(...)

**Ubicacion:** `ddl/schemas/educational_content/functions/02-validate_drag_and_drop.sql`
**Status:** Activo

**Proposito:** Valida ejercicios de arrastrar y soltar.

---

#### validate_fill_blanks(...)

**Ubicacion:** `ddl/schemas/educational_content/functions/03-validate_fill_blanks.sql`
**Status:** Activo

**Proposito:** Valida ejercicios de llenar espacios.

---

#### validate_ordering(...)

**Ubicacion:** `ddl/schemas/educational_content/functions/04-validate_ordering.sql`
**Status:** Activo

**Proposito:** Valida ejercicios de ordenamiento.

---

#### validate_matching(...)

**Ubicacion:** `ddl/schemas/educational_content/functions/05-validate_matching.sql`
**Status:** Activo

**Proposito:** Valida ejercicios de emparejamiento.

---

## SCHEMA: auth_management

### Funciones de Autenticacion

#### validate_user_credentials(...)

**Ubicacion:** `ddl/schemas/auth_management/functions/validate_user_credentials.sql`
**Status:** Activo

**Proposito:** Valida credenciales de usuario.

---

#### create_session(...)

**Ubicacion:** `ddl/schemas/auth_management/functions/create_session.sql`
**Status:** Activo

**Proposito:** Crea sesion de usuario.

---

#### invalidate_session(...)

**Ubicacion:** `ddl/schemas/auth_management/functions/invalidate_session.sql`
**Status:** Activo

**Proposito:** Invalida sesion de usuario.

---

## HISTORIAL DE CORRECCIONES

### CORR-P0-001 (Dec 15, 2025)

**Problema:** Funciones referenciaban `missions_completed` que no existe en `user_stats`.

**Solucion:** Cambiar a `modules_completed`.

**Funciones afectadas:**
- `calculate_user_rank()`
- `update_leaderboard_global()`

---

### CORR-001 (Dec 15, 2025)

**Problema:** Funciones referenciaban columnas incorrectas en `user_stats`.

**Cambios:**
- `last_activity_date` -> `last_activity_at::DATE`
- `longest_streak` -> `max_streak`

**Funciones afectadas:**
- `update_leaderboard_streaks()`

---

## REFERENCIAS

- [MIGRACION-MAYA-RANKS-v2.1.md](../../migraciones/MIGRACION-MAYA-RANKS-v2.1.md)
- [01-SCHEMAS-INVENTORY.md](./01-SCHEMAS-INVENTORY.md)
- [02-TABLES-INVENTORY.md](./02-TABLES-INVENTORY.md)

---

**Ultima actualizacion:** 2025-12-18
