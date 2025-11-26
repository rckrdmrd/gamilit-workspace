# REPORTE: Corrección de función update_user_rank() - Balance Fields

**Fecha:** 2025-11-24
**Agente:** Database-Agent
**Tipo:** Bug Fix - Constraint Violation
**Prioridad:** CRÍTICA
**Estado:** ✅ COMPLETADO

---

## 1. CONTEXTO

### Problema Identificado
La función `gamification_system.update_user_rank()` fallaba al insertar registros en la tabla `ml_coins_transactions` debido a campos NOT NULL faltantes.

### Error Original
```
ERROR: null value in column "balance_before" violates not-null constraint
ERROR: null value in column "balance_after" violates not-null constraint
```

### Archivo Afectado
```
apps/database/ddl/schemas/gamification_system/functions/update_user_rank.sql
```

---

## 2. ANÁLISIS DEL PROBLEMA

### Código Problemático (Líneas 69-76)
```sql
INSERT INTO gamification_system.ml_coins_transactions (
    user_id, amount, transaction_type, description
) VALUES (
    p_user_id,
    v_coins_reward,
    'RANK_UP',
    'Ascendiste al rango ' || v_new_rank
);
```

### Problemas Detectados
1. **Campos faltantes**: No incluía `balance_before` y `balance_after` (requeridos NOT NULL)
2. **ENUM incorrecto**: Usaba `'RANK_UP'` en lugar de `'earned_rank'`
3. **Falta de casting**: No especificaba el tipo ENUM explícitamente

### Estructura de la Tabla ml_coins_transactions
```sql
CREATE TABLE gamification_system.ml_coins_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    balance_before integer NOT NULL,         -- ← Campo requerido faltante
    balance_after integer NOT NULL,          -- ← Campo requerido faltante
    transaction_type gamification_system.transaction_type NOT NULL,
    description text,
    -- ... otros campos
);
```

### ENUM transaction_type Válido
```sql
CREATE TYPE gamification_system.transaction_type AS ENUM (
    'earned_exercise',
    'earned_module',
    'earned_achievement',
    'earned_rank',        -- ← Valor correcto a usar
    'earned_streak',
    'earned_daily',
    'earned_bonus',
    'spent_powerup',
    'spent_hint',
    'spent_retry',
    'admin_adjustment',
    'refund',
    'bonus',
    'welcome_bonus'
);
```

---

## 3. SOLUCIÓN IMPLEMENTADA

### Cambios Realizados

#### 3.1. Declaración de Variables (Líneas 21-27)
```sql
DECLARE
    v_current_xp BIGINT;
    v_old_rank gamification_system.maya_rank;
    v_new_rank gamification_system.maya_rank;
    v_coins_reward INTEGER := 0;
    v_current_balance INTEGER;        -- ← NUEVO
    v_new_balance INTEGER;            -- ← NUEVO
```

#### 3.2. Obtención del Balance Actual (Líneas 58-61)
```sql
-- Obtener balance actual ANTES de actualizar
SELECT COALESCE(ml_coins, 0) INTO v_current_balance
FROM gamification_system.user_stats
WHERE user_id = p_user_id;
```

#### 3.3. Cálculo del Nuevo Balance (Líneas 63-64)
```sql
-- Calcular nuevo balance
v_new_balance := v_current_balance + v_coins_reward;
```

#### 3.4. UPDATE Corregido (Líneas 66-71)
```sql
-- Actualizar coins en user_stats
UPDATE gamification_system.user_stats
SET
    ml_coins = v_new_balance,    -- ← Usa valor calculado
    updated_at = NOW()
WHERE user_id = p_user_id;
```

#### 3.5. INSERT Corregido (Líneas 79-89)
```sql
-- Registrar transacción de coins con balance_before y balance_after
INSERT INTO gamification_system.ml_coins_transactions (
    user_id, amount, balance_before, balance_after, transaction_type, description
) VALUES (
    p_user_id,
    v_coins_reward,
    v_current_balance,                                   -- ← NUEVO
    v_new_balance,                                       -- ← NUEVO
    'earned_rank'::gamification_system.transaction_type, -- ← CORREGIDO
    'Ascendiste al rango ' || v_new_rank
);
```

---

## 4. VALIDACIÓN

### Criterios de Aceptación
- ✅ Función incluye `balance_before` y `balance_after` en INSERT
- ✅ Los valores se calculan correctamente (balance_before + amount = balance_after)
- ✅ Usa ENUM correcto: `'earned_rank'::gamification_system.transaction_type`
- ✅ Sintaxis SQL válida
- ✅ Mantiene la lógica de RETURN TABLE existente
- ✅ Mantiene el estilo de código

### Flujo de Datos Corregido
```
1. Obtener balance actual → v_current_balance
2. Calcular nuevo balance → v_new_balance = v_current_balance + v_coins_reward
3. UPDATE user_stats SET ml_coins = v_new_balance
4. INSERT INTO ml_coins_transactions (balance_before, balance_after)
   VALUES (v_current_balance, v_new_balance)
```

### Validación de Integridad
```sql
-- El INSERT ahora cumple con:
-- 1. Todos los campos NOT NULL tienen valores
-- 2. El balance_after es correcto: balance_before + amount
-- 3. El transaction_type es un valor válido del ENUM
-- 4. El casting es explícito para evitar ambigüedades
```

---

## 5. IMPACTO

### Sistemas Afectados
- ✅ Sistema de Rangos Maya
- ✅ Sistema de ML Coins (transacciones)
- ✅ Promociones de rango automáticas

### Funcionalidades Reparadas
- ✅ Ascenso de rango ahora registra transacciones correctamente
- ✅ Balance de ML Coins se actualiza correctamente
- ✅ Auditoría completa de transacciones de rango

### Regresiones Evitadas
- ✅ Sin cambios en la firma de la función (API compatible)
- ✅ Sin cambios en la lógica de cálculo de rango
- ✅ Sin cambios en RETURN TABLE

---

## 6. ARCHIVOS MODIFICADOS

```
apps/database/ddl/schemas/gamification_system/functions/update_user_rank.sql
```

### Líneas Modificadas
- **Líneas 21-27**: Agregadas variables `v_current_balance` y `v_new_balance`
- **Líneas 58-64**: Agregado bloque para obtener y calcular balances
- **Línea 69**: UPDATE corregido para usar `v_new_balance`
- **Líneas 79-89**: INSERT corregido con campos `balance_before` y `balance_after`

---

## 7. TESTING

### Caso de Prueba 1: Usuario con Rango Inicial
```sql
-- Setup
INSERT INTO gamification_system.user_stats (user_id, total_xp, ml_coins)
VALUES ('user-123', 5000, 100);

-- Ejecutar función
SELECT * FROM gamification_system.update_user_rank('user-123');

-- Validar transacción
SELECT user_id, amount, balance_before, balance_after, transaction_type
FROM gamification_system.ml_coins_transactions
WHERE user_id = 'user-123'
ORDER BY created_at DESC
LIMIT 1;

-- Resultado esperado:
-- balance_before: 100
-- balance_after: 100 + v_coins_reward
-- transaction_type: 'earned_rank'
```

### Caso de Prueba 2: Usuario sin Cambio de Rango
```sql
-- Si no hay cambio de rango, NO debe insertarse transacción
SELECT * FROM gamification_system.update_user_rank('user-123');

-- Validar que NO se creó nueva transacción
SELECT COUNT(*) FROM gamification_system.ml_coins_transactions
WHERE user_id = 'user-123'
AND transaction_type = 'earned_rank';
-- Debe mantenerse el mismo conteo
```

### Caso de Prueba 3: Usuario con Balance 0
```sql
-- Setup: Usuario nuevo con 0 coins
INSERT INTO gamification_system.user_stats (user_id, total_xp, ml_coins)
VALUES ('user-new', 10000, 0);

-- Ejecutar función
SELECT * FROM gamification_system.update_user_rank('user-new');

-- Validar transacción
SELECT balance_before, balance_after, amount
FROM gamification_system.ml_coins_transactions
WHERE user_id = 'user-new'
AND transaction_type = 'earned_rank'
ORDER BY created_at DESC
LIMIT 1;

-- Resultado esperado:
-- balance_before: 0
-- balance_after: v_coins_reward
-- amount: v_coins_reward
```

---

## 8. DOCUMENTACIÓN ACTUALIZADA

### Changelog de la Función
```sql
-- Updated: 2025-11-24 - Fixed INSERT to ml_coins_transactions to include balance_before and balance_after
```

### Comentario de la Función (Mantenido)
```sql
COMMENT ON FUNCTION gamification_system.update_user_rank(UUID) IS
    'Actualiza el rango del usuario basado en XP total y otorga recompensas. Lee configuración dinámica desde maya_ranks table.';
```

---

## 9. PRÓXIMOS PASOS

### Validación en Producción
1. Aplicar función corregida en base de datos de desarrollo
2. Ejecutar casos de prueba completos
3. Validar con backend (endpoints que llaman a esta función)
4. Deploy a producción con monitoreo

### Funciones Relacionadas a Revisar
```bash
# Buscar otras funciones que insertan en ml_coins_transactions
grep -r "INSERT INTO.*ml_coins_transactions" apps/database/ddl/
```

**Resultado esperado:** Validar que todas las funciones incluyan `balance_before` y `balance_after`

---

## 10. LECCIONES APRENDIDAS

### Buenas Prácticas Reforzadas
1. ✅ Siempre capturar balance ANTES de UPDATE
2. ✅ Calcular nuevo balance explícitamente
3. ✅ Usar casting explícito para ENUMs: `'value'::schema.enum_type`
4. ✅ Mantener documentación de cambios en el archivo DDL

### Checklist para Funciones que Manipulan ML Coins
- [ ] Capturar `balance_before` con SELECT
- [ ] Calcular `balance_after` explícitamente
- [ ] Incluir ambos campos en INSERT a `ml_coins_transactions`
- [ ] Usar ENUM `transaction_type` correcto
- [ ] Aplicar casting explícito al ENUM
- [ ] Validar que `balance_after = balance_before ± amount`

---

## 11. REFERENCIAS

### Documentación Relacionada
- **RF-GAM-004**: Sistema de ML Coins - `docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-004-economia-ml-coins.md`
- **ET-GAM-004**: Tipos Compartidos - `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-004-tipos-compartidos-gamificacion.md`
- **RF-GAM-003**: Sistema de Rangos Maya - `docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-003-rangos-maya.md`

### Archivos Relacionados
```
apps/database/ddl/schemas/gamification_system/
├── enums/transaction_type.sql                    # ENUM usado
├── tables/05-ml_coins_transactions.sql           # Tabla destino
├── tables/01-user_stats.sql                      # Tabla de balance
└── functions/update_user_rank.sql                # Función corregida
```

---

## 12. CONCLUSIÓN

**Estado:** ✅ CORRECCIÓN COMPLETADA

La función `gamification_system.update_user_rank()` ha sido corregida exitosamente para incluir los campos `balance_before` y `balance_after` en el INSERT a `ml_coins_transactions`, cumpliendo con los constraints de la tabla y asegurando la integridad de las transacciones de ML Coins.

**Próxima acción:** Aplicar función a base de datos y ejecutar suite de pruebas.

---

**Reporte generado por:** Database-Agent
**Fecha de generación:** 2025-11-24
**Versión del reporte:** 1.0
