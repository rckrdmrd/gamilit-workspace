# Migracion: Sistema de Rangos Maya v2.0 a v2.1

**Version:** 2.1.0
**Fecha:** 2025-12-18
**Autor:** Requirements-Analyst (SIMCO)
**Tipo:** Migracion de Datos y Logica

---

## RESUMEN EJECUTIVO

Migracion de umbrales de XP para hacer **todos los 5 rangos Maya alcanzables** con el contenido educativo actual (1,950 XP disponibles en Modulos 1-3).

### Problema Resuelto

Los umbrales v2.0 (hasta 10,000 XP para K'uk'ulkan) eran **inalcanzables** con el contenido educativo disponible, causando frustracion en estudiantes y falta de motivacion.

### Solucion Implementada

Reduccion de umbrales para que la progresion sea:
- **Justa:** Todos los rangos alcanzables completando M1-M3 con excelencia
- **Motivante:** Progresion visible y constante
- **Pedagogica:** Recompensas alineadas con esfuerzo real

---

## CAMBIOS TECNICOS

### Tabla Comparativa de Umbrales

| Rango | v2.0 XP | v2.1 XP | Reduccion |
|-------|---------|---------|-----------|
| Ajaw | 0-999 | 0-499 | -500 XP |
| Nacom | 1,000-2,999 | 500-999 | Reorganizado |
| Ah K'in | 3,000-5,999 | 1,000-1,499 | -1,500 XP |
| Halach Uinic | 6,000-9,999 | 1,500-1,899 | -3,100 XP |
| K'uk'ulkan | 10,000+ | 1,900+ | **-8,100 XP** |

### XP Disponible por Modulo

| Modulo | XP Aproximado | Rango Alcanzable |
|--------|---------------|------------------|
| M1 | 0-500 | Ajaw -> Nacom |
| M2 | 500-1,000 | Nacom -> Ah K'in |
| M3 | 1,000-1,950 | Ah K'in -> K'uk'ulkan |

**Total disponible M1-M3:** 1,950 XP

---

## FUNCIONES MODIFICADAS

### 1. calculate_maya_rank_helpers.sql

**Ubicacion:** `apps/database/ddl/schemas/gamification_system/functions/calculate_maya_rank_helpers.sql`

#### Funcion: `calculate_maya_rank_from_xp(xp INTEGER)`

```sql
-- v2.0 (ANTES)
IF xp < 1000 THEN RETURN 'Ajaw';
ELSIF xp < 3000 THEN RETURN 'Nacom';
ELSIF xp < 6000 THEN RETURN 'Ah K''in';
ELSIF xp < 10000 THEN RETURN 'Halach Uinic';
ELSE RETURN 'K''uk''ulkan';

-- v2.1 (DESPUES)
IF xp < 500 THEN RETURN 'Ajaw';
ELSIF xp < 1000 THEN RETURN 'Nacom';
ELSIF xp < 1500 THEN RETURN 'Ah K''in';
ELSIF xp < 1900 THEN RETURN 'Halach Uinic';
ELSE RETURN 'K''uk''ulkan';
```

#### Funcion: `calculate_rank_progress_percentage(xp INTEGER)`

```sql
-- v2.0 (ANTES)
WHEN 'Ajaw' THEN xp_in_rank := xp; rank_size := 1000;
WHEN 'Nacom' THEN xp_in_rank := xp - 1000; rank_size := 2000;
WHEN 'Ah K''in' THEN xp_in_rank := xp - 3000; rank_size := 3000;
WHEN 'Halach Uinic' THEN xp_in_rank := xp - 6000; rank_size := 4000;

-- v2.1 (DESPUES)
WHEN 'Ajaw' THEN xp_in_rank := xp; rank_size := 500;
WHEN 'Nacom' THEN xp_in_rank := xp - 500; rank_size := 500;
WHEN 'Ah K''in' THEN xp_in_rank := xp - 1000; rank_size := 500;
WHEN 'Halach Uinic' THEN xp_in_rank := xp - 1500; rank_size := 400;
```

### 2. calculate_user_rank.sql

**Ubicacion:** `apps/database/ddl/schemas/gamification_system/functions/calculate_user_rank.sql`

**Correccion aplicada (CORR-P0-001):**
```sql
-- ANTES (ERROR - columna no existe)
SELECT us.total_xp, us.missions_completed INTO v_total_xp, v_missions_completed

-- DESPUES (CORRECTO)
SELECT us.total_xp, us.modules_completed INTO v_total_xp, v_modules_completed
```

### 3. update_leaderboard_streaks.sql

**Ubicacion:** `apps/database/ddl/schemas/gamification_system/functions/update_leaderboard_streaks.sql`

**Correcciones aplicadas (CORR-001):**
```sql
-- ANTES (ERROR)
last_activity_date -> last_activity_at::DATE
longest_streak -> max_streak

-- DESPUES (CORRECTO - alineado con user_stats)
v_last_activity, v_current_streak, v_longest_streak
FROM gamification_system.user_stats us
WHERE us.user_id = p_user_id;
```

### 4. update_leaderboard_global.sql

**Ubicacion:** `apps/database/ddl/schemas/gamification_system/functions/update_leaderboard_global.sql`

**Correccion aplicada (CORR-P0-001):**
- Cambio de `missions_completed` a `modules_completed`
- Alineacion con columnas reales de `user_stats`

---

## SEEDS ACTUALIZADOS

### 03-maya_ranks.sql

**Ubicacion:** `apps/database/seeds/dev/gamification_system/03-maya_ranks.sql`

```sql
INSERT INTO gamification_system.maya_ranks (
    rank_name, min_xp_required, max_xp_threshold,
    ml_coins_bonus, xp_multiplier, perks
) VALUES
    ('Ajaw', 0, 499, 0, 1.00,
     '["basic_access", "forum_access"]'),
    ('Nacom', 500, 999, 100, 1.10,
     '["xp_boost_10", "daily_bonus", "avatar_customization"]'),
    ('Ah K''in', 1000, 1499, 250, 1.15,
     '["xp_boost_15", "coin_bonus", "exclusive_content"]'),
    ('Halach Uinic', 1500, 1899, 500, 1.20,
     '["xp_boost_20", "priority_support", "mentor_badge"]'),
    ('K''uk''ulkan', 1900, NULL, 1000, 1.25,
     '["xp_boost_25", "all_perks", "hall_of_fame", "certificate"]')
ON CONFLICT (rank_name) DO UPDATE SET
    min_xp_required = EXCLUDED.min_xp_required,
    max_xp_threshold = EXCLUDED.max_xp_threshold,
    ml_coins_bonus = EXCLUDED.ml_coins_bonus,
    xp_multiplier = EXCLUDED.xp_multiplier,
    perks = EXCLUDED.perks;
```

---

## IMPACTO EN EL SISTEMA

### Funciones Dependientes

| Funcion | Status | Notas |
|---------|--------|-------|
| `calculate_user_rank()` | ✅ Actualizada | Usa v2.1 thresholds |
| `get_user_rank_progress()` | ✅ Actualizada | Calculo de porcentaje correcto |
| `update_leaderboard_global()` | ✅ Corregida | Alineacion con user_stats |
| `update_leaderboard_streaks()` | ✅ Corregida | Columnas correctas |

### Tablas Afectadas

| Tabla | Cambio |
|-------|--------|
| `gamification_system.maya_ranks` | Datos actualizados via seed |
| `gamification_system.user_stats` | Sin cambios de schema |
| `gamification_system.user_ranks` | Sin cambios de schema |

### Frontend

| Componente | Impacto |
|------------|---------|
| RankProgressBar | Muestra porcentaje correcto |
| Leaderboard | Posiciones calculadas con v2.1 |
| UserProfile | Rango mostrado correctamente |

---

## CALCULO DE PROGRESION

### Distribucion por Modulo

```
Modulo 1: 0-500 XP
├── Ejercicios basicos: ~300 XP
├── Bonuses: ~100 XP
└── Completitud: ~100 XP
    → Rango: Ajaw → Nacom

Modulo 2: 500-1,000 XP
├── Ejercicios intermedios: ~350 XP
├── Bonuses: ~100 XP
└── Completitud: ~100 XP
    → Rango: Nacom → Ah K'in

Modulo 3: 1,000-1,950 XP
├── Ejercicios avanzados: ~600 XP
├── Bonuses: ~200 XP
└── Completitud: ~150 XP
    → Rango: Ah K'in → K'uk'ulkan
```

### XP Multipliers por Rango

| Rango | Multiplicador | Efecto |
|-------|---------------|--------|
| Ajaw | 1.00x | Base |
| Nacom | 1.10x | +10% XP |
| Ah K'in | 1.15x | +15% XP |
| Halach Uinic | 1.20x | +20% XP |
| K'uk'ulkan | 1.25x | +25% XP |

### ML Coins Bonus por Rango

| Rango | Bonus | Acumulado |
|-------|-------|-----------|
| Ajaw | 0 | 0 |
| Nacom | 100 | 100 |
| Ah K'in | 250 | 350 |
| Halach Uinic | 500 | 850 |
| K'uk'ulkan | 1,000 | 1,850 |

---

## PERKS DESBLOQUEABLES

### Por Rango

| Rango | Perks |
|-------|-------|
| **Ajaw** | Acceso basico, Foro |
| **Nacom** | +10% XP, Bonus diario, Avatar custom |
| **Ah K'in** | +15% XP, Bonus coins, Contenido exclusivo |
| **Halach Uinic** | +20% XP, Soporte prioritario, Badge mentor |
| **K'uk'ulkan** | +25% XP, Todos los perks, Hall of Fame, Certificado |

---

## MIGRACION DE DATOS

### Para Nuevas Instalaciones

Los seeds ya incluyen los valores v2.1. No se requiere accion adicional.

### Para Instalaciones Existentes

```sql
-- Ejecutar seed actualizado
\i apps/database/seeds/dev/gamification_system/03-maya_ranks.sql

-- O manualmente:
UPDATE gamification_system.maya_ranks SET
    min_xp_required = 0, max_xp_threshold = 499
WHERE rank_name = 'Ajaw';

UPDATE gamification_system.maya_ranks SET
    min_xp_required = 500, max_xp_threshold = 999
WHERE rank_name = 'Nacom';

UPDATE gamification_system.maya_ranks SET
    min_xp_required = 1000, max_xp_threshold = 1499
WHERE rank_name = 'Ah K''in';

UPDATE gamification_system.maya_ranks SET
    min_xp_required = 1500, max_xp_threshold = 1899
WHERE rank_name = 'Halach Uinic';

UPDATE gamification_system.maya_ranks SET
    min_xp_required = 1900, max_xp_threshold = NULL
WHERE rank_name = 'K''uk''ulkan';
```

### Recalculo de Rangos de Usuarios

```sql
-- Recalcular rango de todos los usuarios
SELECT gamification_system.calculate_user_rank(user_id)
FROM gamification_system.user_stats;

-- Actualizar leaderboards
SELECT gamification_system.update_leaderboard_global();
```

---

## VERIFICACION

### Queries de Validacion

```sql
-- Verificar umbrales
SELECT rank_name, min_xp_required, max_xp_threshold, xp_multiplier
FROM gamification_system.maya_ranks
ORDER BY min_xp_required;

-- Verificar distribucion de usuarios por rango
SELECT
    mr.rank_name,
    COUNT(us.user_id) as usuarios
FROM gamification_system.maya_ranks mr
LEFT JOIN gamification_system.user_stats us
    ON us.current_rank = mr.rank_name
GROUP BY mr.rank_name
ORDER BY mr.min_xp_required;

-- Verificar funcion de calculo
SELECT gamification_system.calculate_maya_rank_from_xp(0);    -- Ajaw
SELECT gamification_system.calculate_maya_rank_from_xp(500);  -- Nacom
SELECT gamification_system.calculate_maya_rank_from_xp(1000); -- Ah K'in
SELECT gamification_system.calculate_maya_rank_from_xp(1500); -- Halach Uinic
SELECT gamification_system.calculate_maya_rank_from_xp(1900); -- K'uk'ulkan
```

---

## REFERENCIAS

### Documentacion Relacionada

- `ET-GAM-003-rangos-maya.md` - Especificacion tecnica de rangos
- `ET-GAM-005-hook-user-gamification.md` - Hook de gamificacion
- `DocumentoDiseño_Mecanicas_GAMILIT_v6.2.md` - Diseño de mecanicas

### Archivos Modificados

```
apps/database/ddl/schemas/gamification_system/functions/
├── calculate_maya_rank_helpers.sql (v2.1 thresholds)
├── calculate_user_rank.sql (CORR-P0-001)
├── update_leaderboard_streaks.sql (CORR-001)
├── update_leaderboard_global.sql (CORR-P0-001)
└── get_user_rank_progress.sql (actualizado)

apps/database/seeds/dev/gamification_system/
└── 03-maya_ranks.sql (v2.1 data)
```

---

## HISTORIAL DE CAMBIOS

| Fecha | Version | Cambio |
|-------|---------|--------|
| 2025-11-24 | v2.0 | Implementacion inicial |
| 2025-12-14 | v2.1 | Reduccion de umbrales |
| 2025-12-15 | v2.1.1 | Correcciones CORR-P0-001, CORR-001 |
| 2025-12-18 | v2.1.2 | Homologacion DEV → PROD |

---

**Status:** IMPLEMENTADO
**Ultima actualizacion:** 2025-12-18
