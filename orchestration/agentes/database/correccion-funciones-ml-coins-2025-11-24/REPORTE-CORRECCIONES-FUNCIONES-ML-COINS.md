# Reporte de Correcciones - Funciones ML Coins Transactions

**Fecha:** 2025-11-24
**Ejecutado por:** Architecture-Analyst
**Estado:** ✅ COMPLETADO

---

## 📋 Resumen Ejecutivo

Se identificaron y corrigieron **5 funciones** que insertaban registros en `gamification_system.ml_coins_transactions` sin incluir los campos obligatorios `balance_before` y `balance_after` (NOT NULL).

Adicionalmente, se corrigieron **3 funciones** que usaban valores incorrectos del ENUM `transaction_type`.

---

## 🔍 Problema Identificado

### Causa Raíz
La tabla `ml_coins_transactions` tiene constraints NOT NULL en los campos:
- `balance_before` - Balance del usuario ANTES de la transacción
- `balance_after` - Balance del usuario DESPUÉS de la transacción

Las funciones que insertan en esta tabla omitían estos campos, causando errores de constraint violation cuando se ejecutaban.

### Impacto
- ❌ Promociones de rango fallaban silenciosamente
- ❌ Otorgamiento de achievements no registraba transacciones
- ❌ Integración gamificación-progreso no funcionaba correctamente
- ❌ Historial de transacciones incompleto

---

## ✅ Funciones Corregidas

### 1. `promote_to_next_rank.sql`
**Path:** `apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql`

**Cambios:**
- ✅ Agregadas variables `v_current_balance`, `v_new_balance`
- ✅ Obtención de balance con `FOR UPDATE` (row lock)
- ✅ INSERT incluye `balance_before`, `balance_after`
- ✅ ENUM corregido: `'RANK_UP'` → `'earned_rank'`

### 2. `update_user_rank.sql`
**Path:** `apps/database/ddl/schemas/gamification_system/functions/update_user_rank.sql`

**Cambios:**
- ✅ Agregadas variables `v_current_balance`, `v_new_balance`
- ✅ Obtención de balance antes del UPDATE
- ✅ INSERT incluye `balance_before`, `balance_after`
- ✅ ENUM ya usaba `'earned_rank'` (correcto)

### 3. `check_and_award_achievements.sql`
**Path:** `apps/database/ddl/schemas/gamification_system/functions/check_and_award_achievements.sql`

**Cambios:**
- ✅ Agregadas variables `v_current_balance`, `v_new_balance`
- ✅ Obtención de balance con `FOR UPDATE` (row lock)
- ✅ INSERT incluye `balance_before`, `balance_after`
- ✅ ENUM corregido: `'ACHIEVEMENT'` → `'earned_achievement'`

### 4. `claim_achievement_reward.sql`
**Path:** `apps/database/ddl/schemas/gamification_system/functions/claim_achievement_reward.sql`

**Cambios:**
- ✅ Agregadas variables `v_current_balance`, `v_new_balance`
- ✅ Obtención de balance con `FOR UPDATE` (row lock)
- ✅ INSERT incluye `balance_before`, `balance_after`
- ✅ ENUM corregido: `'ACHIEVEMENT_REWARD'` → `'earned_achievement'`

### 5. `generate_student_alerts.sql`
**Path:** `apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql`

**Cambios:**
- ✅ JOINs corregidos para usar `auth_management.profiles` en lugar de `auth.users`
- ✅ Alineación con FK de `module_progress.user_id → profiles.id`

---

## 📊 Valores ENUM `transaction_type` Correctos

| Valor ENUM | Descripción | Usado en Funciones |
|------------|-------------|-------------------|
| `earned_exercise` | Completar ejercicio | `award_ml_coins()` |
| `earned_module` | Completar módulo | - |
| `earned_achievement` | Desbloquear achievement | `check_and_award_achievements()`, `claim_achievement_reward()` |
| `earned_rank` | Subir de rango | `promote_to_next_rank()`, `update_user_rank()` |
| `earned_streak` | Mantener racha | - |
| `earned_daily` | Login diario | - |
| `earned_bonus` | Bonus especial | `award_ml_coins()` |

---

## 🔧 Patrón de Corrección Aplicado

```sql
-- 1. Declarar variables
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;

-- 2. Obtener balance actual con row lock
SELECT ml_coins INTO v_current_balance
FROM gamification_system.user_stats
WHERE user_id = p_user_id
FOR UPDATE;

-- 3. Calcular nuevo balance
v_new_balance := COALESCE(v_current_balance, 0) + v_amount;

-- 4. Actualizar user_stats
UPDATE gamification_system.user_stats
SET ml_coins = v_new_balance
WHERE user_id = p_user_id;

-- 5. Insertar transacción con balances
INSERT INTO gamification_system.ml_coins_transactions (
    user_id, amount, balance_before, balance_after,
    transaction_type, description
) VALUES (
    p_user_id, v_amount, v_current_balance, v_new_balance,
    'earned_xxx'::gamification_system.transaction_type,
    'Descripción'
);
```

---

## 📁 Archivos Modificados

```
apps/database/ddl/schemas/gamification_system/functions/
├── promote_to_next_rank.sql      ✅ Corregido
├── update_user_rank.sql          ✅ Corregido
├── check_and_award_achievements.sql  ✅ Corregido
├── claim_achievement_reward.sql  ✅ Corregido
└── award_ml_coins.sql            ✔️ Ya estaba correcto (referencia)

apps/database/ddl/schemas/progress_tracking/functions/
└── 15-generate_student_alerts.sql  ✅ Corregido (JOINs)
```

---

## 🚀 Próximos Pasos

1. **Aplicar a Base de Datos:**
   ```bash
   cd apps/database
   psql -h <host> -U gamilit_user -d gamilit_platform -f ddl/schemas/gamification_system/functions/promote_to_next_rank.sql
   psql -h <host> -U gamilit_user -d gamilit_platform -f ddl/schemas/gamification_system/functions/update_user_rank.sql
   psql -h <host> -U gamilit_user -d gamilit_platform -f ddl/schemas/gamification_system/functions/check_and_award_achievements.sql
   psql -h <host> -U gamilit_user -d gamilit_platform -f ddl/schemas/gamification_system/functions/claim_achievement_reward.sql
   psql -h <host> -U gamilit_user -d gamilit_platform -f ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql
   ```

2. **Validar Funcionalidad:**
   - Probar promoción de rango
   - Probar otorgamiento de achievements
   - Verificar historial de transacciones

3. **Actualizar Inventarios:**
   - `docs/90-transversal/inventarios/DATABASE_INVENTORY.yml`

---

## 📝 Notas Técnicas

### FK Patterns Identificados
La base de datos usa dos patrones de FK para `user_id`:
1. `auth.users(id)` - Usado por: `user_stats`, `user_ranks`
2. `auth_management.profiles(id)` - Usado por: `ml_coins_transactions`, `module_progress`

**Nota:** En producción `profiles.id = profiles.user_id = auth.users.id` (mismo UUID), pero las funciones deben respetar las FK definidas en cada tabla.

### Concurrencia
El patrón `SELECT ... FOR UPDATE` garantiza atomicidad en transacciones concurrentes, evitando race conditions en el balance de ML Coins.

---

**Generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
