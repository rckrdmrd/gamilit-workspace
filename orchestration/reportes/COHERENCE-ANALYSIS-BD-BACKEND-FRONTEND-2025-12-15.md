# REPORTE DE COHERENCIA BD-BACKEND-FRONTEND
## Sistema de Gamificación - GAMILIT

**Fecha:** 2025-12-15
**Ejecutado por:** Tech-Leader (Claude Opus 4.5)
**Alcance:** Achievements, UserStats, ENUMs, Funciones SQL

---

## 1. RESUMEN EJECUTIVO

| Severidad | Hallazgos | Estado |
|-----------|-----------|--------|
| CRÍTICO   | 1         | REQUIERE CORRECCIÓN |
| ALTO      | 1         | REQUIERE CORRECCIÓN |
| MEDIO     | 2         | ACEPTABLE |
| BAJO      | 1         | INFORMATIVO |

**Estado General:** Se identificaron discrepancias que requieren atención inmediata.

---

## 2. HALLAZGOS CRÍTICOS

### 2.1 [P0-CRÍTICO] Función update_leaderboard_streaks - Columnas Inexistentes

**Archivo:** `ddl/schemas/gamification_system/functions/update_leaderboard_streaks.sql`

**Problema:**
La función SQL referencia columnas que NO existen en la tabla `user_stats`:

| Columna en Función | Columna Real en DDL | Estado |
|--------------------|---------------------|--------|
| `last_activity_date` (DATE) | `last_activity_at` (TIMESTAMP WITH TIME ZONE) | ❌ ERROR |
| `longest_streak` | `max_streak` | ❌ ERROR |

**Código Problemático (líneas 27-33):**
```sql
SELECT
    COALESCE(last_activity_date, CURRENT_DATE),  -- ❌ No existe
    COALESCE(us.current_streak, 0),
    COALESCE(us.longest_streak, 0)  -- ❌ Debería ser max_streak
INTO v_last_activity, v_current_streak, v_longest_streak
FROM gamification_system.user_stats us
WHERE us.user_id = p_user_id;
```

**Impacto:**
- La función FALLARÁ al ejecutarse
- El sistema de rachas NO se actualiza correctamente
- Afecta IMPL-003 del sistema de achievements

**Corrección Requerida:**
```sql
SELECT
    COALESCE(last_activity_at::DATE, CURRENT_DATE),  -- ✅ Corregido
    COALESCE(us.current_streak, 0),
    COALESCE(us.max_streak, 0)  -- ✅ Corregido
INTO v_last_activity, v_current_streak, v_longest_streak
```

**También línea 55-58:**
```sql
-- ACTUAL (INCORRECTO):
longest_streak = GREATEST(longest_streak, v_current_streak),
last_activity_date = CURRENT_DATE,

-- CORRECCIÓN:
max_streak = GREATEST(max_streak, v_current_streak),
last_activity_at = NOW(),
```

---

## 3. HALLAZGOS DE ALTA PRIORIDAD

### 3.1 [P1-ALTO] AchievementCategory - Frontend tiene valores extras

**Archivos Analizados:**
1. DDL: `ddl/00-prerequisites.sql:113-115`
2. Backend: `backend/src/shared/constants/enums.constants.ts:258-266`
3. Frontend: `frontend/src/shared/types/achievement.types.ts:14-23`

**Comparación:**

| Valor | DDL (ENUM) | Backend (TS Enum) | Frontend (Type) |
|-------|------------|-------------------|-----------------|
| progress | ✅ | ✅ | ✅ |
| streak | ✅ | ✅ | ✅ |
| completion | ✅ | ✅ | ✅ |
| social | ✅ | ✅ | ✅ |
| special | ✅ | ✅ | ✅ |
| mastery | ✅ | ✅ | ✅ |
| exploration | ✅ | ✅ | ✅ |
| collection | ❌ | ❌ | ⚠️ EXTRA |
| hidden | ❌ | ❌ | ⚠️ EXTRA |

**Impacto:**
- Si se crean achievements con category='collection' o 'hidden' en frontend:
  - NO podrán guardarse en BD (ENUM constraint)
  - Error de validación en backend
- Actualmente NO se usan en seeds, pero el riesgo existe

**Recomendación:**
1. **Opción A (Preferida):** Agregar valores al ENUM en DDL:
   ```sql
   ALTER TYPE gamification_system.achievement_category
   ADD VALUE 'collection';
   ALTER TYPE gamification_system.achievement_category
   ADD VALUE 'hidden';
   ```
2. **Opción B:** Eliminar valores del frontend type

---

## 4. HALLAZGOS DE PRIORIDAD MEDIA

### 4.1 [P2-MEDIO] UserStats.current_rank - Text vs ENUM

**Archivos:**
- DDL: `ddl/schemas/gamification_system/tables/01-user_stats.sql:53`
- Entity: `backend/src/modules/gamification/entities/user-stats.entity.ts:84-85`

**DDL:**
```sql
current_rank gamification_system.maya_rank DEFAULT 'Ajaw'::gamification_system.maya_rank,
```

**Entity:**
```typescript
@Column({ type: 'text', default: 'Ajaw' })
  current_rank!: string;
```

**Impacto:**
- TypeORM puede manejar esto (PostgreSQL convierte text↔enum automáticamente)
- Sin embargo, la validación de valores se pierde a nivel Entity
- Podría insertarse un valor inválido desde código

**Recomendación:**
```typescript
// Opción corregida:
@Column({
  type: 'enum',
  enum: ['Ajaw', 'Nacom', 'Ah K\'in', 'Halach Uinic', 'K\'uk\'ulkan'],
  enumName: 'maya_rank',
  default: 'Ajaw'
})
  current_rank!: string;
```

**Estado:** ACEPTABLE - Funciona actualmente pero debería corregirse para consistencia.

---

### 4.2 [P2-MEDIO] Nomenclatura user_stats - DDL vs Frontend

**Campos con nomenclatura diferente:**

| Campo DDL | Campo Frontend Esperado | Estado |
|-----------|-------------------------|--------|
| `max_streak` | `longest_streak` (algunos contextos) | ⚠️ Alias |
| `level` | `current_level` (algunos tipos) | ⚠️ Alias |
| `exercises_completed` | `total_exercises_completed` | ⚠️ Alias |

**Impacto:** Bajo - Los mapeos se manejan en API responses y hooks.

**Documentado en:** `ddl/schemas/gamification_system/tables/01-user_stats.sql:309-314`

---

## 5. HALLAZGOS INFORMATIVOS

### 5.1 [P3-BAJO] Condition Types - Backend es Superset

**Seeds Achievement Conditions (9 tipos):**
1. `exercise_completion` (5 achievements)
2. `streak` (3 achievements)
3. `module_completion` (3 achievements)
4. `social` (2 achievements)
5. `skill_mastery` (2 achievements)
6. `exploration` (2 achievements)
7. `special` (1 achievement)
8. `perfect_score` (1 achievement)
9. `all_modules_completion` (1 achievement)

**Backend Service Soporta (14 tipos):**
Los 9 anteriores + legacy:
- `progress`
- `level`
- `score`
- `rank`
- `ml_coins`

**Estado:** ✅ CORRECTO - Backend soporta todos los tipos de seeds + extras legacy

---

## 6. VALIDACIÓN DE ENTITIES vs DDL

### 6.1 Achievement Entity

| Campo DDL | Campo Entity | Tipo DDL | Tipo Entity | Estado |
|-----------|--------------|----------|-------------|--------|
| id | id | uuid | uuid (PrimaryGeneratedColumn) | ✅ |
| tenant_id | tenant_id | uuid | uuid | ✅ |
| name | name | text | text | ✅ |
| description | description | text | text | ✅ |
| icon | icon | text | text | ✅ |
| category | category | achievement_category | enum | ✅ |
| rarity | rarity | text (CHECK) | text | ✅ |
| difficulty_level | difficulty_level | difficulty_level | enum | ✅ |
| conditions | conditions | jsonb | jsonb | ✅ |
| rewards | rewards | jsonb | jsonb | ✅ |
| is_secret | is_secret | boolean | boolean | ✅ |
| is_active | is_active | boolean | boolean | ✅ |
| is_repeatable | is_repeatable | boolean | boolean | ✅ |
| order_index | order_index | integer | integer | ✅ |
| points_value | points_value | integer | integer | ✅ |
| unlock_message | unlock_message | text | text | ✅ |
| instructions | instructions | text | text | ✅ |
| tips | tips | text[] | text[] | ✅ |
| metadata | metadata | jsonb | jsonb | ✅ |
| created_by | created_by | uuid | uuid | ✅ |
| ml_coins_reward | ml_coins_reward | integer | integer | ✅ |
| created_at | created_at | timestamp tz | timestamp tz | ✅ |
| updated_at | updated_at | timestamp tz | timestamp tz | ✅ |

**Resultado:** 22/22 campos alineados ✅

---

### 6.2 UserStats Entity

| Campo DDL | Campo Entity | Alineado |
|-----------|--------------|----------|
| id | id | ✅ |
| user_id | user_id | ✅ |
| tenant_id | tenant_id | ✅ |
| level | level | ✅ |
| total_xp | total_xp | ✅ |
| xp_to_next_level | xp_to_next_level | ✅ |
| current_rank | current_rank | ⚠️ (text vs enum) |
| rank_progress | rank_progress | ✅ |
| ml_coins | ml_coins | ✅ |
| ml_coins_earned_total | ml_coins_earned_total | ✅ |
| ml_coins_spent_total | ml_coins_spent_total | ✅ |
| ml_coins_earned_today | ml_coins_earned_today | ✅ |
| last_ml_coins_reset | last_ml_coins_reset | ✅ |
| current_streak | current_streak | ✅ |
| max_streak | max_streak | ✅ |
| streak_started_at | streak_started_at | ✅ |
| days_active_total | days_active_total | ✅ |
| exercises_completed | exercises_completed | ✅ |
| modules_completed | modules_completed | ✅ |
| total_score | total_score | ✅ |
| average_score | average_score | ✅ |
| perfect_scores | perfect_scores | ✅ |
| achievements_earned | achievements_earned | ✅ |
| certificates_earned | certificates_earned | ✅ |
| total_time_spent | total_time_spent | ✅ |
| weekly_time_spent | weekly_time_spent | ✅ |
| sessions_count | sessions_count | ✅ |
| weekly_xp | weekly_xp | ✅ |
| monthly_xp | monthly_xp | ✅ |
| weekly_exercises | weekly_exercises | ✅ |
| global_rank_position | global_rank_position | ✅ |
| class_rank_position | class_rank_position | ✅ |
| school_rank_position | school_rank_position | ✅ |
| last_activity_at | last_activity_at | ✅ |
| last_login_at | last_login_at | ✅ |
| metadata | metadata | ✅ |
| created_at | created_at | ✅ |
| updated_at | updated_at | ✅ |

**Resultado:** 38/38 campos presentes, 1 con discrepancia de tipo (current_rank)

---

## 7. VALIDACIÓN DE FUNCIONES SQL

### 7.1 Funciones Llamadas desde Backend

| Función | Schema | Llamada Desde | Estado |
|---------|--------|---------------|--------|
| `update_leaderboard_streaks(uuid)` | gamification_system | exercise-attempt.service.ts:667-677 | ❌ ERROR EN FUNCIÓN |
| `now_mexico()` | gamilit | Múltiples seeds | ✅ |
| `get_current_user_id()` | gamilit | RLS policies | ✅ |
| `is_admin()` | gamilit | RLS policies | ✅ |

---

## 8. PLAN DE CORRECCIÓN

### 8.1 Correcciones Inmediatas (P0-P1)

| # | Archivo | Corrección | Prioridad |
|---|---------|------------|-----------|
| 1 | `update_leaderboard_streaks.sql` | Cambiar `last_activity_date` → `last_activity_at::DATE` | P0 |
| 2 | `update_leaderboard_streaks.sql` | Cambiar `longest_streak` → `max_streak` | P0 |
| 3 | `00-prerequisites.sql` | Agregar `'collection'` y `'hidden'` al ENUM achievement_category | P1 |

### 8.2 Correcciones Recomendadas (P2)

| # | Archivo | Corrección | Prioridad |
|---|---------|------------|-----------|
| 4 | `user-stats.entity.ts` | Cambiar type de `current_rank` a enum | P2 |

---

## 9. VERIFICACIÓN DE SEEDS

### 9.1 Achievements Seeds Validados

**Archivo:** `seeds/dev/gamification_system/04-achievements.sql`
**Archivo:** `seeds/prod/gamification_system/04-achievements.sql`

| Check | Estado |
|-------|--------|
| Todas las categorías existen en ENUM | ✅ |
| Todos los tipos de condición soportados en backend | ✅ |
| Estructura de rewards válida | ✅ |
| UUIDs únicos | ✅ |
| Referencias FK válidas | ✅ |

---

## 10. DIAGRAMA DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COHERENCIA BD-BACKEND-FRONTEND                       │
└─────────────────────────────────────────────────────────────────────────────┘

DATABASE (PostgreSQL)                 BACKEND (NestJS)              FRONTEND (React)
═══════════════════                   ═══════════════               ════════════════

┌─────────────────────┐
│ 00-prerequisites.sql│
│ ├─ maya_rank ENUM   │───────────────────────┐
│ ├─ achievement_     │                       │
│ │   category ENUM   │───┐                   │
│ └─ comodin_type     │   │                   │
│     ENUM            │   │                   │
└─────────────────────┘   │                   │
                          │                   │
┌─────────────────────┐   │   ┌───────────────────────┐   ┌─────────────────────┐
│ user_stats table    │   │   │ UserStats Entity      │   │ UserStats Types     │
│ ├─ current_rank     │◄──┼───│ ├─ current_rank: text│───│ (Frontend)          │
│ │   (maya_rank)     │   │   │ │   ⚠️ DISCREPANCIA   │   │                     │
│ ├─ max_streak       │   │   │ ├─ max_streak        │   │                     │
│ └─ last_activity_at │   │   │ └─ last_activity_at  │   │                     │
└─────────────────────┘   │   └───────────────────────┘   └─────────────────────┘
         │                │
         │                │   ┌───────────────────────┐   ┌─────────────────────┐
         ▼                │   │ Achievement Entity    │   │ Achievement Types   │
┌─────────────────────┐   │   │ ├─ category (enum)   │───│ ├─ AchievementCat.  │
│ achievements table  │   │   │ ├─ conditions (jsonb)│   │ │   9 valores       │
│ ├─ category         │◄──┴───│ └─ rewards (jsonb)   │   │ │   ⚠️ 2 EXTRAS     │
│ │   (7 valores)     │       └───────────────────────┘   │ └─                  │
│ └─ conditions       │                                   └─────────────────────┘
│     (jsonb)         │
└─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐       ┌───────────────────────┐
│ update_leaderboard_ │       │ AchievementsService   │
│ _streaks()          │◄──────│ ├─ meetsConditions()  │
│ ❌ ERRORES:         │       │ │   14 tipos          │
│ ├─ last_activity_   │       │ └─ detectAndGrant     │
│ │   date (no existe)│       │     Earned()          │
│ └─ longest_streak   │       └───────────────────────┘
│     (no existe)     │
└─────────────────────┘
```

---

## 11. CONCLUSIONES

1. **Función SQL Crítica Rota:** `update_leaderboard_streaks` NO funciona debido a referencias a columnas inexistentes. Requiere corrección inmediata.

2. **ENUMs Parcialmente Desalineados:** Frontend tiene categorías de achievement extras que no existen en BD.

3. **Entities Correctamente Mapeadas:** 98% de los campos están correctamente alineados entre DDL y Entities.

4. **Seeds Válidos:** Todos los seeds de achievements usan valores válidos que existen en ENUMs y son soportados por el backend.

---

**Tech-Leader:** Análisis COMPLETADO
**Estado:** REQUIERE CORRECCIONES P0/P1
**Fecha:** 2025-12-15
