# ANÁLISIS: Funciones con INSERT a ml_coins_transactions

**Fecha:** 2025-11-24
**Agente:** Database-Agent
**Tipo:** Análisis de Impacto
**Contexto:** Corrección de constraint violations en ml_coins_transactions

---

## 1. RESUMEN EJECUTIVO

Se identificaron **7 funciones/triggers** que insertan registros en `gamification_system.ml_coins_transactions`. De estas:

- ✅ **3 correctas** (incluyen `balance_before` y `balance_after`)
- ❌ **4 con problemas** (faltan campos requeridos)

---

## 2. ESTRUCTURA REQUERIDA

### Tabla ml_coins_transactions - Campos Obligatorios (NOT NULL)
```sql
CREATE TABLE gamification_system.ml_coins_transactions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    balance_before integer NOT NULL,        -- ← REQUERIDO
    balance_after integer NOT NULL,          -- ← REQUERIDO
    transaction_type gamification_system.transaction_type NOT NULL,
    -- ... otros campos opcionales
);
```

---

## 3. FUNCIONES ANALIZADAS

### 3.1. ✅ CORRECTAS (incluyen balance_before y balance_after)

#### 3.1.1. promote_to_next_rank.sql
**Archivo:** `ddl/schemas/gamification_system/functions/promote_to_next_rank.sql`
**Línea:** 107-112

```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id,
    amount,
    balance_before,     -- ✅ INCLUIDO
    balance_after,      -- ✅ INCLUIDO
    transaction_type,
    description
)
```

**Estado:** ✅ CORRECTO

---

#### 3.1.2. award_ml_coins.sql
**Archivo:** `ddl/schemas/gamification_system/functions/award_ml_coins.sql`
**Línea:** 56-61

```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id,
    amount,
    balance_before,     -- ✅ INCLUIDO
    balance_after,      -- ✅ INCLUIDO
    transaction_type,
    description
)
```

**Estado:** ✅ CORRECTO

---

#### 3.1.3. update_user_rank.sql (CORREGIDO)
**Archivo:** `ddl/schemas/gamification_system/functions/update_user_rank.sql`
**Línea:** 80-81

```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id, amount, balance_before, balance_after, transaction_type, description
)
```

**Estado:** ✅ CORREGIDO (2025-11-24)

---

### 3.2. ❌ CON PROBLEMAS (faltan balance_before y balance_after)

#### 3.2.1. update_mission_progress.sql
**Archivo:** `ddl/schemas/progress_tracking/functions/06-update_mission_progress.sql`
**Línea:** 59-64

```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id, amount, transaction_type, description, metadata
) VALUES (
    p_user_id,
    v_boosted_coins,
    'MISSION_COMPLETION',  -- ← ENUM inválido también
    ...
)
```

**Problemas:**
- ❌ Falta `balance_before`
- ❌ Falta `balance_after`
- ❌ Usa `'MISSION_COMPLETION'` (no existe en ENUM)

**Solución requerida:**
1. Capturar balance actual
2. Calcular nuevo balance
3. Incluir campos en INSERT
4. Corregir ENUM a valor válido (probablemente `'earned_bonus'`)

---

#### 3.2.2. check_and_award_achievements.sql
**Archivo:** `ddl/schemas/gamification_system/functions/check_and_award_achievements.sql`
**Línea:** 87-92

```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id, amount, transaction_type, description
) VALUES (
    p_user_id,
    v_achievement.ml_coins_reward,
    'ACHIEVEMENT',  -- ← ENUM inválido también
    ...
)
```

**Problemas:**
- ❌ Falta `balance_before`
- ❌ Falta `balance_after`
- ❌ Usa `'ACHIEVEMENT'` (no existe en ENUM, debería ser `'earned_achievement'`)

**Solución requerida:**
1. Capturar balance actual
2. Calcular nuevo balance
3. Incluir campos en INSERT
4. Corregir ENUM a `'earned_achievement'::gamification_system.transaction_type`

---

#### 3.2.3. claim_achievement_reward.sql
**Archivo:** `ddl/schemas/gamification_system/functions/claim_achievement_reward.sql`
**Línea:** 66-71

```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id,
    amount,
    transaction_type,
    description
) VALUES (
    ...
)
```

**Problemas:**
- ❌ Falta `balance_before`
- ❌ Falta `balance_after`

**Solución requerida:**
1. Capturar balance actual
2. Calcular nuevo balance
3. Incluir campos en INSERT

---

#### 3.2.4. trg_achievement_unlocked.sql (TRIGGER)
**Archivo:** `ddl/schemas/gamification_system/triggers/01-trg_achievement_unlocked.sql`
**Línea:** 53-58

```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    metadata
)
```

**Problemas:**
- ❌ Falta `balance_before`
- ❌ Falta `balance_after`

**Solución requerida:**
1. Capturar balance actual dentro del trigger
2. Calcular nuevo balance
3. Incluir campos en INSERT

---

## 4. PRIORIDAD DE CORRECCIÓN

### 🔴 PRIORIDAD ALTA (Funcionalidad Core)

1. **check_and_award_achievements.sql**
   - Usado frecuentemente para otorgar logros
   - Impacto: Sistema de achievements no funciona correctamente

2. **claim_achievement_reward.sql**
   - Usado cuando usuarios reclaman recompensas
   - Impacto: Usuarios no pueden reclamar achievements

3. **update_mission_progress.sql**
   - Usado para misiones diarias/semanales
   - Impacto: Sistema de misiones no funciona

### 🟡 PRIORIDAD MEDIA

4. **trg_achievement_unlocked.sql**
   - Trigger automático para achievements
   - Impacto: Puede duplicar funcionalidad con check_and_award_achievements

---

## 5. PATRÓN DE CORRECCIÓN RECOMENDADO

### Template para Corregir Funciones

```sql
-- 1. Agregar variables al DECLARE
DECLARE
    -- ... variables existentes ...
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- ... lógica existente ...

    -- 2. Antes del INSERT, capturar balance actual
    SELECT COALESCE(ml_coins, 0) INTO v_current_balance
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    -- 3. Calcular nuevo balance
    v_new_balance := v_current_balance + v_amount;  -- o - v_amount si es gasto

    -- 4. UPDATE a user_stats con nuevo balance
    UPDATE gamification_system.user_stats
    SET ml_coins = v_new_balance, updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 5. INSERT corregido
    INSERT INTO gamification_system.ml_coins_transactions (
        user_id,
        amount,
        balance_before,
        balance_after,
        transaction_type,
        description
    ) VALUES (
        p_user_id,
        v_amount,
        v_current_balance,
        v_new_balance,
        'earned_xxx'::gamification_system.transaction_type,  -- Usar ENUM válido
        'Description here'
    );
END;
```

---

## 6. ENUMS VÁLIDOS DE transaction_type

### Para Correcciones de ENUM Inválidos

```sql
-- EARNED (Ingresos - 7 tipos):
'earned_exercise'      -- +5-50 coins por ejercicio
'earned_module'        -- +100-300 coins por módulo
'earned_achievement'   -- +50-500 coins por logro (USAR AQUÍ)
'earned_rank'          -- +100-1000 coins por rango
'earned_streak'        -- +10-100 coins por racha
'earned_daily'         -- +50 coins por login diario
'earned_bonus'         -- Bonus especial (USAR PARA MISIONES)

-- SPENT (Gastos - 3 tipos):
'spent_powerup'        -- -15 a -40 coins por comodín
'spent_hint'           -- -10 coins por pista
'spent_retry'          -- -20 coins por reintento

-- ADMIN/SISTEMA (4 tipos):
'admin_adjustment'     -- Ajuste manual
'refund'               -- Devolución
'bonus'                -- Bonus general
'welcome_bonus'        -- +100 coins inicial
```

### Mapeo de Valores Inválidos

```
'ACHIEVEMENT' → 'earned_achievement'
'MISSION_COMPLETION' → 'earned_bonus'
'RANK_UP' → 'earned_rank'
```

---

## 7. CHECKLIST DE VALIDACIÓN

Para cada función corregida, validar:

```markdown
- [ ] Variables v_current_balance y v_new_balance declaradas
- [ ] SELECT para capturar balance ANTES del UPDATE
- [ ] Cálculo correcto de v_new_balance
- [ ] UPDATE a user_stats usa v_new_balance
- [ ] INSERT incluye balance_before y balance_after
- [ ] transaction_type usa ENUM válido con casting
- [ ] Validar que balance_after = balance_before ± amount
```

---

## 8. SCRIPT DE VALIDACIÓN GLOBAL

### Verificar todas las funciones

```sql
-- Buscar INSERTs sin balance_before/balance_after
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%INSERT INTO%ml_coins_transactions%'
  AND pg_get_functiondef(p.oid) NOT ILIKE '%balance_before%'
  AND pg_get_functiondef(p.oid) NOT ILIKE '%balance_after%';
```

---

## 9. PLAN DE ACCIÓN

### Fase 1: Corrección Crítica (Hoy)
- [x] update_user_rank.sql - ✅ COMPLETADO

### Fase 2: Corrección de Funciones Core (Próximo)
- [ ] check_and_award_achievements.sql
- [ ] claim_achievement_reward.sql
- [ ] update_mission_progress.sql

### Fase 3: Corrección de Triggers (Después)
- [ ] trg_achievement_unlocked.sql

### Fase 4: Validación Completa
- [ ] Ejecutar script de validación global
- [ ] Test de integración con backend
- [ ] Validación en staging
- [ ] Deploy a producción

---

## 10. REFERENCIAS

### Documentación
- **Tabla:** `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql`
- **ENUM:** `apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql`
- **RF-GAM-004:** Sistema de ML Coins
- **ET-GAM-004:** Tipos Compartidos de Gamificación

### Archivos Afectados
```
apps/database/ddl/schemas/
├── gamification_system/functions/
│   ├── update_user_rank.sql                    ✅ CORREGIDO
│   ├── promote_to_next_rank.sql                ✅ CORRECTO
│   ├── award_ml_coins.sql                      ✅ CORRECTO
│   ├── check_and_award_achievements.sql        ❌ PENDIENTE
│   └── claim_achievement_reward.sql            ❌ PENDIENTE
├── gamification_system/triggers/
│   └── 01-trg_achievement_unlocked.sql         ❌ PENDIENTE
└── progress_tracking/functions/
    └── 06-update_mission_progress.sql          ❌ PENDIENTE
```

---

## 11. CONCLUSIÓN

**Estado actual:** 3 de 7 funciones correctas (42.86%)
**Pendiente:** 4 funciones requieren corrección
**Impacto:** Sistema de gamificación parcialmente funcional

**Próximos pasos:**
1. Priorizar corrección de check_and_award_achievements.sql
2. Aplicar template de corrección a funciones pendientes
3. Ejecutar suite de pruebas completa
4. Validar en staging antes de producción

---

**Reporte generado por:** Database-Agent
**Fecha:** 2025-11-24
**Versión:** 1.0
