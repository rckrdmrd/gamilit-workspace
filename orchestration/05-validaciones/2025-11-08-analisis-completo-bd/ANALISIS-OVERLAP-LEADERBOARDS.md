# Análisis: Overlap en Leaderboards

**Fecha:** 2025-11-08
**Issue:** OVERLAP-001
**Severidad:** 🟡 MEDIO
**Estado:** ✅ ANALIZADO - Recomendaciones generadas

---

## 🔍 Problema Identificado

Existen **DOS materialized views** con nombres similares y propósitos solapados para el "global leaderboard":

### 1. `gamification_system.leaderboard_global`

**Archivo:** `ddl/schemas/gamification_system/views/02-leaderboard_global.sql`
**Tipo:** Materialized View (⚠️ archivo en carpeta incorrecta)

**Características:**
```sql
- Fórmula: global_score = (XP × 1.0) + (ML Coins × 0.5) + (Streak × 100)
- Campos: user_id, full_name, avatar_url, total_xp, ml_coins_lifetime,
          current_streak, max_streak, maya_rank, global_score, rank_position
- Filtro: WHERE total_xp > 0 OR ml_coins > 0 OR current_streak > 0
- Ordenamiento: Por global_score DESC
- Índices: user_id (UNIQUE), rank_position, global_score
```

**Propósito:** Ranking **combinado** que considera XP, coins y rachas con pesos diferentes

---

### 2. `gamification_system.mv_global_leaderboard`

**Archivo:** `ddl/schemas/gamification_system/materialized-views/01-mv_global_leaderboard.sql`
**Tipo:** Materialized View (✅ ubicación correcta)

**Características:**
```sql
- Ordenamiento: Por total_xp DESC (sin fórmula)
- Campos: rank, user_id, full_name, avatar_url, total_xp, current_rank,
          ml_coins, level, achievements_count, modules_completed,
          exercises_completed, current_streak
- Filtro: WHERE role = 'student' AND status = 'active'
- Índices: rank (UNIQUE), user_id, total_xp
```

**Propósito:** Ranking **simple** por XP solamente, más detallado en métricas educativas

---

## 📊 Comparación

| Aspecto | `leaderboard_global` | `mv_global_leaderboard` |
|---------|----------------------|-------------------------|
| **Criterio ranking** | Fórmula combinada (XP+coins+streak) | Solo XP |
| **Complejidad** | Alta (ponderación) | Baja (directo) |
| **Filtro usuarios** | Cualquiera con stats > 0 | Solo students activos |
| **Métricas educativas** | No incluidas | Sí (modules, exercises) |
| **achievements_count** | ❌ No | ✅ Sí |
| **Ubicación archivo** | ❌ Incorrecta (views/) | ✅ Correcta (materialized-views/) |
| **Uso esperado** | Gamificación competitiva | Analytics educativo |

---

## ⚠️ Problemas

### 1. Ambigüedad en nombres
- Ambos se llaman "global leaderboard"
- No queda claro cuál usar en qué contexto
- Frontend/backend podrían usar el incorrecto

### 2. Ubicación incorrecta de archivo
- `leaderboard_global` está en `views/` pero ES una materialized view
- Debería estar en `materialized-views/`

### 3. Propósitos diferentes pero no documentados
- No hay documentación que explique cuándo usar cada uno
- Developers deben leer el SQL para entender diferencias

### 4. Posible confusión en frontend
- ¿Cuál muestra el frontend en la página de leaderboard?
- ¿Se usan ambos en diferentes pantallas?

---

## ✅ Recomendaciones

### Opción A: Renombrar para clarificar (RECOMENDADO)

**Acción:** Renombrar para reflejar propósito claro

**Cambios:**
```sql
-- Opción A1: Por tipo de ranking
leaderboard_global → mv_leaderboard_combined
mv_global_leaderboard → mv_leaderboard_by_xp

-- Opción A2: Por uso
leaderboard_global → mv_leaderboard_gamification
mv_global_leaderboard → mv_leaderboard_educational

-- Opción A3: Más descriptivo
leaderboard_global → mv_leaderboard_composite_score
mv_global_leaderboard → mv_leaderboard_xp_ranking
```

**Ventajas:**
- ✅ Claridad inmediata de propósito
- ✅ No requiere eliminar ninguna (ambas pueden coexistir)
- ✅ Backend puede usar ambas según necesidad

**Desventajas:**
- ⚠️ Requiere actualizar queries en backend/frontend
- ⚠️ Breaking change si ya está en producción

---

### Opción B: Consolidar en una sola view con parámetro

**Acción:** Crear una sola MV con columnas para ambos rankings

**Implementación:**
```sql
CREATE MATERIALIZED VIEW gamification_system.mv_global_leaderboard AS
SELECT
    user_id,
    full_name,
    avatar_url,
    total_xp,
    ml_coins_lifetime,
    current_streak,

    -- Ranking simple (por XP)
    ROW_NUMBER() OVER (ORDER BY total_xp DESC) as rank_by_xp,

    -- Ranking combinado (fórmula ponderada)
    (total_xp * 1.0 + ml_coins_lifetime * 0.5 + current_streak * 100) as composite_score,
    ROW_NUMBER() OVER (ORDER BY composite_score DESC) as rank_by_composite,

    -- Métricas adicionales
    achievements_count,
    modules_completed,
    exercises_completed,
    maya_rank
FROM ...
```

**Ventajas:**
- ✅ Una sola fuente de verdad
- ✅ Flexibilidad para ordenar por diferentes criterios
- ✅ Menos mantenimiento (un solo refresh)

**Desventajas:**
- ⚠️ MV más grande (más storage)
- ⚠️ Refresh potencialmente más lento

---

### Opción C: Eliminar una y documentar la otra

**Acción:** Decidir cuál es el "official global leaderboard" y eliminar la otra

**Si se elimina `leaderboard_global` (combinado):**
- Mantener solo ranking por XP (más simple)
- Usar `mv_global_leaderboard`
- Documentar que ranking oficial es por XP

**Si se elimina `mv_global_leaderboard` (XP):**
- Mantener solo ranking combinado (más interesante gamificación)
- Usar `leaderboard_global` (renombrar a `mv_global_leaderboard`)
- Documentar fórmula de scoring

**Ventajas:**
- ✅ Elimina ambigüedad completamente
- ✅ Menos mantenimiento

**Desventajas:**
- ❌ Pierde flexibilidad
- ❌ Puede que ambos se usen actualmente

---

## 🎯 Recomendación Final

**OPCIÓN A1: Renombrar para clarificar**

```sql
-- Renombrar existentes
leaderboard_global → mv_leaderboard_combined
mv_global_leaderboard → mv_leaderboard_xp

-- Mover archivo a ubicación correcta
mv views/02-leaderboard_global.sql → materialized-views/05-mv_leaderboard_combined.sql

-- Documentar en comentarios SQL
COMMENT ON MATERIALIZED VIEW mv_leaderboard_combined IS
'Global leaderboard with COMPOSITE SCORE = (XP × 1.0) + (Coins × 0.5) + (Streak × 100).
Use for: Gamification-focused rankings, competitive features.
Refresh: Hourly via cron.';

COMMENT ON MATERIALIZED VIEW mv_leaderboard_xp IS
'Global leaderboard ranked by TOTAL XP only. Includes educational metrics.
Use for: Academic/educational rankings, progress tracking.
Refresh: Hourly via cron.';
```

**Tareas:**
1. ✅ Renombrar MVs en DDL
2. ✅ Mover archivo a carpeta correcta
3. ✅ Actualizar COMMENT ON para documentar uso
4. ✅ Actualizar backend queries
5. ✅ Actualizar frontend components
6. ✅ Crear migration script

---

## 📝 Otras Views y MVs Leaderboard

**Views (regular):**
- `leaderboard_coins` - Ranking por ML Coins
- `leaderboard_streaks` - Ranking por rachas
- `leaderboard_xp` - Ranking por XP (¿duplica mv_global_leaderboard?)

**Materialized Views:**
- `mv_classroom_leaderboard` - Rankings por classroom
- `mv_weekly_leaderboard` - Rankings semanales
- `mv_mechanic_leaderboard` - Rankings por mecánica de juego

**Observación:** Parece haber también overlap entre:
- `leaderboard_xp` (view) vs `mv_global_leaderboard` (MV que rankea por XP)

**Acción adicional:** Revisar si `leaderboard_xp` es necesario o si puede eliminarse en favor de `mv_global_leaderboard` (más eficiente).

---

## 🔄 Plan de Acción

### Fase 1: Análisis de uso actual
- [ ] Grep en backend/frontend por referencias a ambas MVs
- [ ] Identificar cuál se usa en qué pantallas
- [ ] Determinar si hay breaking change risk

### Fase 2: Renombrado
- [ ] Renombrar `leaderboard_global` → `mv_leaderboard_combined`
- [ ] Renombrar `mv_global_leaderboard` → `mv_leaderboard_xp`
- [ ] Mover archivo a ubicación correcta
- [ ] Actualizar COMMENT ON

### Fase 3: Actualización de código
- [ ] Actualizar backend queries
- [ ] Actualizar frontend components
- [ ] Actualizar tests

### Fase 4: Validación
- [ ] Validar que MVs funcionan correctamente
- [ ] Validar refresh de MVs
- [ ] Validar queries en backend

---

**Creado:** 2025-11-08
**Issue:** OVERLAP-001
**Estado:** ✅ ANALIZADO
**Recomendación:** Renombrar para clarificar propósito
**Próximo paso:** Implementar renombrado o esperar decisión de equipo
