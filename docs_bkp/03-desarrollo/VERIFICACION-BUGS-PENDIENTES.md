# VERIFICACIÓN DE BUGS PENDIENTES - Base de Datos

**Fecha de Verificación:** 2025-11-07 (Segunda validación)
**Alcance:** Validación de bugs identificados en reportes anteriores
**Estado:** 🔴 **BUG P0 SIGUE PENDIENTE DE CORRECCIÓN**

---

## 📋 RESUMEN EJECUTIVO

### Estado de Bugs Identificados

| Bug ID | Descripción | Prioridad | Estado Actual | Acción Requerida |
|--------|-------------|-----------|---------------|------------------|
| BUG-P0-01 | `process_exercise_completion` línea 28: `current_level` → `level` | 🔴 P0 | ❌ **PENDIENTE** | Corregir inmediatamente |

**Total bugs P0:** 1
**Total bugs corregidos:** 0
**Total bugs pendientes:** 1

---

## 1. BUG P0-01: `current_level` en `process_exercise_completion`

### 1.1 Información del Bug

**Archivo:**
```
/apps/database/ddl/schemas/gamification_system/functions/process_exercise_completion.sql
```

**Línea:** 28

**Código actual (INCORRECTO):**
```sql
-- Línea 28
SELECT current_level INTO v_old_level
FROM gamification_system.user_stats
WHERE user_id = p_user_id;
```

**Problema:**
La columna en la tabla `gamification_system.user_stats` se llama `level`, NO `current_level`.

**Estructura real de la tabla:**
```sql
CREATE TABLE gamification_system.user_stats (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    tenant_id uuid,

    -- LEVEL & XP SYSTEM
    level integer DEFAULT 1 NOT NULL,              -- ✅ Columna correcta
    total_xp integer DEFAULT 0 NOT NULL,
    xp_to_next_level integer DEFAULT 100 NOT NULL,

    -- RANK SYSTEM
    current_rank maya_rank DEFAULT 'Ajaw',         -- Nota: RANK usa "current_"
    rank_progress numeric(5,2) DEFAULT 0.00,

    -- ML COINS SYSTEM
    ml_coins integer DEFAULT 100 NOT NULL,         -- ✅ Columna correcta
    ...
);
```

**Observación importante:**
El sistema de RANKS sí usa `current_rank`, pero el sistema de LEVELS usa simplemente `level`.

---

### 1.2 Corrección Requerida

**OPCIÓN 1: Cambiar nombre de columna en query (RECOMENDADO)**

```sql
-- ANTES (línea 28):
SELECT current_level INTO v_old_level

-- DESPUÉS (CORRECTO):
SELECT level INTO v_old_level
```

**OPCIÓN 2: Cambiar nombre de columna en tabla (NO RECOMENDADO)**
- Requeriría migration
- Afectaría todas las funciones y queries existentes
- Rompe compatibilidad con frontend

**Recomendación:** Usar OPCIÓN 1 (cambiar la query, no la tabla).

---

### 1.3 Impacto del Bug

**Severidad:** 🔴 **CRÍTICO (P0)**

**Impacto funcional:**
- ❌ La función `process_exercise_completion()` **FALLA AL EJECUTARSE**
- ❌ Error PostgreSQL: `column "current_level" does not exist`
- ❌ XP no se otorga correctamente
- ❌ Nivel del usuario no se recalcula
- ❌ ML Coins no se otorgan correctamente
- ❌ Sistema de gamificación no funciona

**Flujos afectados:**
1. Completar ejercicio → XP no se suma
2. Calcular recompensas → Falla
3. Verificar level up → No funciona
4. Dashboard de progreso → Stats incorrectas

**Usuarios afectados:**
- Todos los estudiantes que completan ejercicios
- Sistema de gamificación completo bloqueado

---

### 1.4 Testing del Bug

**Test case para reproducir:**

```sql
-- Test 1: Intentar ejecutar la función actual
SELECT gamification_system.process_exercise_completion(
    'user-uuid-aqui'::UUID,
    'exercise-uuid-aqui'::UUID,
    100  -- XP earned
);

-- Resultado esperado: ERROR
-- ERROR: column "current_level" does not exist
-- LINE 28: SELECT current_level INTO v_old_level
```

**Test case después de corrección:**

```sql
-- Verificar que la función se ejecuta correctamente
SELECT gamification_system.process_exercise_completion(
    'user-uuid-aqui'::UUID,
    'exercise-uuid-aqui'::UUID,
    100  -- XP earned
);

-- Resultado esperado: SUCCESS
-- RETURNS (nuevo_nivel, ml_coins_ganados, achievement_triggered)
```

---

### 1.5 Frecuencia del Error

**Búsqueda exhaustiva de usos incorrectos:**

```bash
# Buscar referencias a "current_level" en todo gamification_system
grep -rn "current_level" apps/database/ddl/schemas/gamification_system --include="*.sql"
```

**Resultado:**
```
process_exercise_completion.sql:28:    SELECT current_level INTO v_old_level
```

**Conclusión:** ✅ Solo 1 ocurrencia del error (fácil de corregir).

---

### 1.6 Plan de Corrección

#### Paso 1: Crear backup (5 min)
```bash
# Backup de la función actual
cp process_exercise_completion.sql process_exercise_completion.sql.backup
```

#### Paso 2: Corregir archivo (5 min)
```bash
# Editar línea 28
sed -i 's/SELECT current_level/SELECT level/' process_exercise_completion.sql
```

#### Paso 3: Aplicar en base de datos (2 min)
```sql
-- Ejecutar el archivo corregido
\i apps/database/ddl/schemas/gamification_system/functions/process_exercise_completion.sql
```

#### Paso 4: Testing (10 min)
```sql
-- Test con usuario real
SELECT gamification_system.process_exercise_completion(
    (SELECT id FROM auth_management.profiles LIMIT 1),
    (SELECT id FROM educational_content.exercises LIMIT 1),
    100
);

-- Verificar resultado
SELECT level, total_xp, ml_coins
FROM gamification_system.user_stats
WHERE user_id = (SELECT id FROM auth_management.profiles LIMIT 1);
```

#### Paso 5: Deployment (5 min)
```bash
# Aplicar en staging
psql -h staging-db -d gamilit -f process_exercise_completion.sql

# Aplicar en production (después de validar en staging)
psql -h prod-db -d gamilit -f process_exercise_completion.sql
```

**Tiempo total estimado:** 30 minutos

---

## 2. VALIDACIÓN DE OTROS BUGS REPORTADOS

### 2.1 Bug: Constraints de `ml_coins_transactions`

**Reporte original:**
> GAP-P0-04: Constraints de validación faltantes
> - No hay constraint que valide `balance_after = balance_before ± amount`

**Validación:**

```bash
grep -n "CONSTRAINT\|CHECK" apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql
```

**Resultado:**
- ✅ Tabla tiene constraints básicos (PK, FK, NOT NULL)
- ⚠️ NO tiene constraint de validación de balance

**Estado:** ⚠️ **VERIFICADO - Gap real pero NO crítico**

**Prioridad:** 🟡 P1 (mejora de integridad de datos)

**Recomendación:** Implementar en Sprint 1, no bloquea funcionalidad actual.

---

### 2.2 Bug: Trigger `update_user_stats_on_exercise_complete`

**Reporte original:**
> GAP-P0-03: Trigger es PLACEHOLDER

**Validación:**

**Archivo leído:**
```
apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql
```

**Resultado:**
```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_correct BOOLEAN;
    v_xp_earned INTEGER;
    v_coins_earned INTEGER;
BEGIN
    -- Determinar si el ejercicio fue completado correctamente
    v_is_correct := (NEW.result = 'correct' OR NEW.score >= 70);

    -- [147 líneas de código completo]
    ...
END;
$$;
```

**Estado:** ✅ **CORREGIDO - Función totalmente implementada**

**Eliminado de gaps:** Este NO es un bug, la función está completa.

---

### 2.3 Bug: Función `initialize_user_stats`

**Reporte original:**
> Función PLACEHOLDER

**Validación:**

**Archivo leído:**
```
apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql
```

**Resultado:**
```sql
CREATE OR REPLACE FUNCTION gamilit.initialize_user_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.role = 'student' THEN
        -- Inicializa user_stats
        INSERT INTO gamification_system.user_stats (...)

        -- Crea inventario comodines
        INSERT INTO gamification_system.comodines_inventory (...)

        -- Crea rango inicial
        INSERT INTO gamification_system.user_ranks (...)

        -- Inicializa misiones
        PERFORM gamilit.initialize_user_missions(NEW.user_id);
    END IF;
    RETURN NEW;
END;
$function$;
```

**Estado:** ✅ **CORREGIDO - Función totalmente implementada**

**Eliminado de gaps:** Este NO es un bug, la función está completa.

---

## 3. RESUMEN DE VALIDACIÓN

### 3.1 Bugs del Reporte Original vs Realidad

| Bug Reportado | Prioridad Original | Estado Real | Nueva Prioridad |
|---------------|-------------------|-------------|-----------------|
| `process_exercise_completion` línea 28 | 🔴 P0 | ❌ **PENDIENTE** | 🔴 **P0** |
| Constraints `ml_coins_transactions` | 🔴 P0 | ⚠️ Gap real pero NO crítico | 🟡 P1 |
| Trigger `update_user_stats_on_exercise_complete` | 🔴 P0 | ✅ Ya implementado | ~~Eliminado~~ |
| Función `initialize_user_stats` | 🟡 P1 | ✅ Ya implementado | ~~Eliminado~~ |

### 3.2 Bugs Confirmados

**Total bugs P0:** 1 (reducido de 4)
**Total bugs P1:** 1 (constraints)

---

## 4. PLAN DE ACCIÓN ACTUALIZADO

### 4.1 SPRINT 0 - INMEDIATO (30 minutos)

**ÚNICA TAREA P0:**
```
[X] Corregir bug process_exercise_completion línea 28
    - Tiempo: 30 minutos
    - Responsable: Backend/DB team
    - Testing: Validar con ejercicio real
    - Deploy: Staging → Production
```

**Resultado esperado:** Sistema de gamificación 100% funcional

---

### 4.2 SPRINT 1 - PRÓXIMA SEMANA (1 hora)

**TAREA P1:**
```
[ ] Agregar constraint validación ml_coins_transactions
    - Tiempo: 1 hora
    - Código:
      ALTER TABLE gamification_system.ml_coins_transactions
      ADD CONSTRAINT check_balance_calculation
      CHECK (
        (transaction_type LIKE 'earned_%' AND balance_after = balance_before + amount)
        OR
        (transaction_type LIKE 'spent_%' AND balance_after = balance_before - amount)
        OR
        (transaction_type LIKE 'admin_%')  -- Admin puede ajustar libremente
      );
```

---

## 5. IMPACTO EN ROADMAP

### Roadmap Original (de REPORTE-ALINEACION-SISTEMA.md)
```
Sprint 0: 3.5 días
  - 4 bugs P0 a corregir

Sprint 1: 4 días
  - 7 gaps P1 a resolver
```

### Roadmap Actualizado (Post-Validación)
```
Sprint 0: 30 minutos ✅
  - 1 bug P0 a corregir

Sprint 1: 3.5 días
  - 1 constraint P1
  - Achievements auto-detection (3 días) ← SIGUE SIENDO CRÍTICO
  - Otros gaps reales
```

**Mejora:** 🎉 **Reducción de 3 días en Sprint 0**

---

## 6. CÓDIGO DE CORRECCIÓN EXACTO

### 6.1 Archivo Completo Corregido

**Archivo:** `process_exercise_completion.sql`

**Líneas 27-31 (ANTES - INCORRECTO):**
```sql
    -- Obtener nivel actual del usuario
    SELECT current_level INTO v_old_level
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
```

**Líneas 27-31 (DESPUÉS - CORRECTO):**
```sql
    -- Obtener nivel actual del usuario
    SELECT level INTO v_old_level
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
```

**Cambio:** Una sola palabra en línea 28: `current_level` → `level`

---

### 6.2 Script de Corrección Automatizado

```bash
#!/bin/bash
# Script: fix_process_exercise_completion.sh
# Descripción: Corrige bug en process_exercise_completion

FILE="apps/database/ddl/schemas/gamification_system/functions/process_exercise_completion.sql"

# Backup
cp "$FILE" "${FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Corrección
sed -i 's/SELECT current_level INTO v_old_level/SELECT level INTO v_old_level/' "$FILE"

# Verificación
if grep -q "SELECT level INTO v_old_level" "$FILE"; then
    echo "✅ Corrección aplicada correctamente"
    echo "📝 Backup guardado en: ${FILE}.backup.*"
    echo "🚀 Listo para aplicar en base de datos"
else
    echo "❌ Error en corrección, restaurar backup"
    exit 1
fi
```

**Uso:**
```bash
chmod +x fix_process_exercise_completion.sh
./fix_process_exercise_completion.sh
```

---

## 7. TESTING POST-CORRECCIÓN

### 7.1 Test Suite Completo

```sql
-- =====================================================
-- TEST SUITE: process_exercise_completion
-- =====================================================

-- Test 1: Verificar que la función existe
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'process_exercise_completion';
-- Esperado: 1 fila

-- Test 2: Verificar estructura de user_stats
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'gamification_system'
  AND table_name = 'user_stats'
  AND column_name IN ('level', 'current_level');
-- Esperado: Solo 'level' existe

-- Test 3: Ejecutar función con usuario real
DO $$
DECLARE
    v_user_id UUID;
    v_exercise_id UUID;
    v_result RECORD;
BEGIN
    -- Obtener un usuario existente
    SELECT id INTO v_user_id
    FROM auth_management.profiles
    WHERE role = 'student'
    LIMIT 1;

    -- Obtener un ejercicio existente
    SELECT id INTO v_exercise_id
    FROM educational_content.exercises
    LIMIT 1;

    -- Ejecutar función
    SELECT * INTO v_result
    FROM gamification_system.process_exercise_completion(
        v_user_id,
        v_exercise_id,
        100  -- XP earned
    );

    RAISE NOTICE 'Test exitoso: level=%, coins=%, achievement=%',
        v_result.level, v_result.ml_coins_earned, v_result.achievement_triggered;
END $$;
-- Esperado: Test exitoso sin errores

-- Test 4: Verificar que XP se sumó correctamente
SELECT user_id, level, total_xp, ml_coins
FROM gamification_system.user_stats
WHERE user_id = (SELECT id FROM auth_management.profiles WHERE role = 'student' LIMIT 1);
-- Esperado: total_xp incrementado en 100
```

### 7.2 Criterios de Aceptación

✅ **Función se ejecuta sin errores**
✅ **XP se suma a `total_xp`**
✅ **ML Coins se suman correctamente**
✅ **Nivel se recalcula si aplica**
✅ **No hay errores de columna inexistente**

---

## 8. CONCLUSIÓN

### 8.1 Estado Actual

🔴 **BUG P0 CONFIRMADO - PENDIENTE DE CORRECCIÓN**

El bug en `process_exercise_completion.sql` línea 28 **SIGUE EXISTIENDO** y debe ser corregido inmediatamente.

### 8.2 Impacto

**CRÍTICO:** El sistema de gamificación no funciona correctamente hasta que este bug sea corregido.

**POSITIVO:** Es una corrección trivial (1 palabra, 30 minutos total).

### 8.3 Siguiente Acción

**ACCIÓN INMEDIATA REQUERIDA:**
1. Ejecutar script de corrección
2. Testing en staging (10 min)
3. Deploy a production (5 min)
4. Validar con ejercicio real (5 min)

**TOTAL: 30 minutos**

---

## 9. VERIFICACIÓN POST-CORRECCIÓN

Una vez aplicada la corrección, ejecutar:

```bash
# Verificar que el cambio fue aplicado
grep -n "SELECT level INTO v_old_level" \
  apps/database/ddl/schemas/gamification_system/functions/process_exercise_completion.sql

# Resultado esperado:
# 28:    SELECT level INTO v_old_level
```

---

**FIN DE VERIFICACIÓN**

**Fecha:** 2025-11-07
**Verificador:** Claude Code (Sonnet 4.5)
**Estado:** 🔴 **BUG CONFIRMADO - ACCIÓN REQUERIDA**
**Prioridad:** 🔴 **P0 - INMEDIATO**
**Tiempo estimado de corrección:** 30 minutos
**Próxima validación:** Inmediatamente después de corrección

---

**Documentos relacionados:**
- [REPORTE-ALINEACION-SISTEMA.md](./REPORTE-ALINEACION-SISTEMA.md)
- [CORRECCION-REPORTE-ALINEACION.md](./CORRECCION-REPORTE-ALINEACION.md)
- [VALIDACION-REFERENCIAS-DB-FRONTEND.md](./VALIDACION-REFERENCIAS-DB-FRONTEND.md)
