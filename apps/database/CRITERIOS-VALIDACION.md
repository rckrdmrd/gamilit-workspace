# Criterios de Validación Detallados - Base de Datos Gamilit

**Fecha:** 2025-11-07
**Versión:** 1.0

---

## 📋 Tipos de Validación

### 1. Validación Sintáctica
Verifica que el SQL es válido y ejecutable.

### 2. Validación Semántica
Verifica que el SQL tiene sentido en el contexto del sistema.

### 3. Validación de Integridad
Verifica que las relaciones y constraints son correctos.

### 4. Validación Funcional
Verifica que el código funciona como se espera.

### 5. Validación de Coherencia
Verifica que código y documentación coinciden.

---

## 🔍 Criterios por Tipo de Objeto

### ENUMs

#### Validación Sintáctica
- [ ] **V-ENUM-001:** ENUM se crea sin errores de sintaxis
- [ ] **V-ENUM-002:** Todos los valores son strings válidos
- [ ] **V-ENUM-003:** No hay duplicados en valores

#### Validación Semántica
- [ ] **V-ENUM-004:** Nombre del ENUM es descriptivo
- [ ] **V-ENUM-005:** Valores tienen convención snake_case
- [ ] **V-ENUM-006:** ENUM tiene al menos 2 valores

#### Validación de Coherencia
- [ ] **V-ENUM-007:** ENUM está documentado en TIPOS-Y-ENUMS.md
- [ ] **V-ENUM-008:** Valores coinciden con documentación
- [ ] **V-ENUM-009:** Descripción del ENUM coincide con uso real

**Script de validación:**
```sql
-- Listar todos los ENUMs
SELECT
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values,
    obj_description(t.oid, 'pg_type') as description
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace NOT IN (
    SELECT oid FROM pg_namespace
    WHERE nspname IN ('pg_catalog', 'information_schema')
)
GROUP BY t.typname, t.oid
ORDER BY t.typname;
```

---

### Tablas

#### Validación Sintáctica
- [ ] **V-TABLE-001:** CREATE TABLE ejecuta sin errores
- [ ] **V-TABLE-002:** Todos los tipos de columnas son válidos
- [ ] **V-TABLE-003:** Primary key está definido
- [ ] **V-TABLE-004:** Nombres de columnas son válidos (sin palabras reservadas)

#### Validación Semántica
- [ ] **V-TABLE-005:** Tabla está en el schema correcto
- [ ] **V-TABLE-006:** Nombre de tabla es plural (convención)
- [ ] **V-TABLE-007:** Primary key es UUID (convención)
- [ ] **V-TABLE-008:** Tablas tienen `created_at` y `updated_at` (si aplica)
- [ ] **V-TABLE-009:** Columnas con `_id` tienen FK o son UUID

#### Validación de Integridad
- [ ] **V-TABLE-010:** Foreign keys apuntan a tablas existentes
- [ ] **V-TABLE-011:** Foreign keys tienen índice (performance)
- [ ] **V-TABLE-012:** CHECK constraints son válidos
- [ ] **V-TABLE-013:** UNIQUE constraints cubren casos de negocio
- [ ] **V-TABLE-014:** NOT NULL está en columnas requeridas

#### Validación Funcional
- [ ] **V-TABLE-015:** Se puede insertar registro válido
- [ ] **V-TABLE-016:** Constraints bloquean datos inválidos
- [ ] **V-TABLE-017:** Defaults se aplican correctamente

#### Validación de Coherencia
- [ ] **V-TABLE-018:** Tabla está documentada en ESQUEMA-COMPLETO.md
- [ ] **V-TABLE-019:** Columnas documentadas coinciden con DDL
- [ ] **V-TABLE-020:** Relaciones documentadas existen en código

**Script de validación:**
```sql
-- Verificar foreign keys
SELECT
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY tc.table_schema, tc.table_name;

-- Verificar constraints
SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_type,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY tc.table_schema, tc.table_name, tc.constraint_type;
```

---

### Funciones

#### Validación Sintáctica
- [ ] **V-FUNC-001:** CREATE FUNCTION ejecuta sin errores
- [ ] **V-FUNC-002:** Sintaxis del lenguaje es válida (plpgsql/sql)
- [ ] **V-FUNC-003:** Tipos de parámetros son válidos
- [ ] **V-FUNC-004:** Tipo de retorno es válido

#### Validación Semántica
- [ ] **V-FUNC-005:** Función está en schema correcto
- [ ] **V-FUNC-006:** Nombre describe la acción (verbo)
- [ ] **V-FUNC-007:** Parámetros tienen nombres descriptivos
- [ ] **V-FUNC-008:** Función tiene COMMENT con descripción

#### Validación de Integridad
- [ ] **V-FUNC-009:** Función no referencia objetos inexistentes
- [ ] **V-FUNC-010:** Función maneja errores (BEGIN/EXCEPTION si aplica)
- [ ] **V-FUNC-011:** Función es STABLE/IMMUTABLE si no modifica datos

#### Validación Funcional
- [ ] **V-FUNC-012:** Función retorna valor correcto con datos válidos
- [ ] **V-FUNC-013:** Función maneja NULL correctamente
- [ ] **V-FUNC-014:** Función no causa deadlocks
- [ ] **V-FUNC-015:** Performance es aceptable (< 100ms típicamente)

#### Validación de Coherencia
- [ ] **V-FUNC-016:** Función está documentada en TRIGGERS-Y-FUNCIONES.md
- [ ] **V-FUNC-017:** Descripción coincide con implementación

**Script de validación:**
```sql
-- Listar funciones
SELECT
    n.nspname as schema,
    p.proname as function,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as returns,
    l.lanname as language,
    CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END as volatility,
    obj_description(p.oid, 'pg_proc') as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, p.proname;
```

---

### Triggers

#### Validación Sintáctica
- [ ] **V-TRIG-001:** CREATE TRIGGER ejecuta sin errores
- [ ] **V-TRIG-002:** Timing es válido (BEFORE/AFTER/INSTEAD OF)
- [ ] **V-TRIG-003:** Event es válido (INSERT/UPDATE/DELETE)

#### Validación Semántica
- [ ] **V-TRIG-004:** Nombre del trigger es descriptivo
- [ ] **V-TRIG-005:** Trigger está en la tabla correcta
- [ ] **V-TRIG-006:** Timing es apropiado para la lógica

#### Validación de Integridad
- [ ] **V-TRIG-007:** Función del trigger existe
- [ ] **V-TRIG-008:** Función retorna TRIGGER type
- [ ] **V-TRIG-009:** Trigger no causa recursión infinita

#### Validación Funcional
- [ ] **V-TRIG-010:** Trigger se ejecuta en el evento correcto
- [ ] **V-TRIG-011:** Trigger modifica datos correctamente
- [ ] **V-TRIG-012:** Trigger no rompe transacción
- [ ] **V-TRIG-013:** Performance es aceptable

**Triggers críticos a validar:**

**updated_at triggers:**
- [ ] Se ejecutan en UPDATE
- [ ] Actualizan `updated_at` con `gamilit.now_mexico()`
- [ ] No causan loops infinitos

**Triggers de gamificación:**
- `initialize_user_stats` - Crea registro en `user_stats` al crear usuario
- `update_user_stats_on_exercise_complete` - Actualiza XP, ML Coins, streak

**Triggers de auditoría:**
- `audit_profile_changes` - Registra cambios en `profiles`

**Script de validación:**
```sql
-- Listar triggers
SELECT
    trigger_schema,
    trigger_name,
    event_object_schema,
    event_object_table,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY trigger_schema, event_object_table, trigger_name;

-- Test trigger updated_at
BEGIN;
    UPDATE auth_management.profiles
    SET display_name = 'Test'
    WHERE id = (SELECT id FROM auth_management.profiles LIMIT 1);

    -- Verificar que updated_at cambió
    SELECT id, display_name, updated_at
    FROM auth_management.profiles
    WHERE id = (SELECT id FROM auth_management.profiles LIMIT 1);
ROLLBACK;
```

---

### RLS Policies

#### Validación Sintáctica
- [ ] **V-RLS-001:** CREATE POLICY ejecuta sin errores
- [ ] **V-RLS-002:** Expresión USING es válida
- [ ] **V-RLS-003:** Expresión WITH CHECK es válida (si aplica)

#### Validación Semántica
- [ ] **V-RLS-004:** Policy está en tabla correcta
- [ ] **V-RLS-005:** Policy tiene nombre descriptivo
- [ ] **V-RLS-006:** Command es apropiado (SELECT/INSERT/UPDATE/DELETE/ALL)

#### Validación de Integridad
- [ ] **V-RLS-007:** RLS está habilitado en la tabla
- [ ] **V-RLS-008:** Policy no referencia funciones inexistentes
- [ ] **V-RLS-009:** Policy usa funciones STABLE/IMMUTABLE

#### Validación Funcional
- [ ] **V-RLS-010:** Policy permite acceso a usuarios autorizados
- [ ] **V-RLS-011:** Policy bloquea acceso a usuarios no autorizados
- [ ] **V-RLS-012:** Multi-tenancy funciona (usuario ve solo su tenant)
- [ ] **V-RLS-013:** Performance es aceptable con policy activa

#### Validación de Coherencia
- [ ] **V-RLS-014:** Policy está documentada en ADR-003
- [ ] **V-RLS-015:** Lógica de acceso coincide con especificación

**Script de validación:**
```sql
-- Listar RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- Verificar RLS habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    AND rowsecurity = true
ORDER BY schemaname, tablename;
```

---

### Índices

#### Validación Sintáctica
- [ ] **V-IDX-001:** CREATE INDEX ejecuta sin errores
- [ ] **V-IDX-002:** Tipo de índice es válido (btree/gin/gist/etc.)
- [ ] **V-IDX-003:** Columnas existen en la tabla

#### Validación Semántica
- [ ] **V-IDX-004:** Nombre del índice es descriptivo
- [ ] **V-IDX-005:** Índice está en columnas frecuentemente consultadas
- [ ] **V-IDX-006:** Índice compuesto tiene orden lógico de columnas

#### Validación de Integridad
- [ ] **V-IDX-007:** Foreign keys tienen índice
- [ ] **V-IDX-008:** Columnas con UNIQUE tienen índice
- [ ] **V-IDX-009:** No hay índices duplicados

#### Validación Funcional
- [ ] **V-IDX-010:** Query usa el índice (EXPLAIN)
- [ ] **V-IDX-011:** Índice mejora performance
- [ ] **V-IDX-012:** Índice no causa overhead excesivo en INSERT/UPDATE

#### Validación de Coherencia
- [ ] **V-IDX-013:** Índice está documentado en INDICES-Y-OPTIMIZACION.md
- [ ] **V-IDX-014:** Justificación del índice está documentada

**Índices críticos a validar:**

**Foreign key indexes:**
- Todos los FK deben tener índice

**Columnas frecuentes:**
- `user_id`, `tenant_id`, `created_at`, `status`

**Full-text search:**
- Índices GIN en columnas de texto

**JSONB:**
- Índices GIN en columnas JSONB

**Script de validación:**
```sql
-- Listar índices
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- Verificar FK sin índice
SELECT
    tc.table_schema,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
    AND NOT EXISTS (
        SELECT 1
        FROM pg_indexes idx
        WHERE idx.schemaname = tc.table_schema
            AND idx.tablename = tc.table_name
            AND idx.indexdef LIKE '%' || kcu.column_name || '%'
    );
```

---

### Vistas

#### Validación Sintáctica
- [ ] **V-VIEW-001:** CREATE VIEW ejecuta sin errores
- [ ] **V-VIEW-002:** Query de la vista es válido

#### Validación Semántica
- [ ] **V-VIEW-003:** Vista está en schema correcto
- [ ] **V-VIEW-004:** Nombre de vista es descriptivo
- [ ] **V-VIEW-005:** Vista agrega valor (no es simple SELECT *)

#### Validación de Integridad
- [ ] **V-VIEW-006:** Vista no referencia objetos inexistentes
- [ ] **V-VIEW-007:** Vista no causa dependencias circulares

#### Validación Funcional
- [ ] **V-VIEW-008:** Vista retorna datos correctos
- [ ] **V-VIEW-009:** Vista usa índices apropiados
- [ ] **V-VIEW-010:** Performance es aceptable

#### Validación de Coherencia
- [ ] **V-VIEW-011:** Vista está documentada

**Script de validación:**
```sql
-- Listar vistas
SELECT
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, viewname;
```

---

### Seeds

#### Validación Sintáctica
- [ ] **V-SEED-001:** SQL ejecuta sin errores
- [ ] **V-SEED-002:** Todos los INSERT son válidos

#### Validación Semántica
- [ ] **V-SEED-003:** Seeds están organizados por schema
- [ ] **V-SEED-004:** Archivos tienen nombres descriptivos
- [ ] **V-SEED-005:** Seeds tienen datos realistas

#### Validación de Integridad
- [ ] **V-SEED-006:** Valores de ENUMs son válidos
- [ ] **V-SEED-007:** Foreign keys apuntan a registros existentes
- [ ] **V-SEED-008:** Constraints se respetan (UNIQUE, CHECK, etc.)
- [ ] **V-SEED-009:** UUIDs son únicos y válidos

#### Validación Funcional
- [ ] **V-SEED-010:** Seeds son idempotentes (puede ejecutarse múltiples veces)
- [ ] **V-SEED-011:** Seeds se pueden ejecutar en orden de dependencias
- [ ] **V-SEED-012:** Seeds cubren casos de uso básicos
- [ ] **V-SEED-013:** Seeds incluyen datos de prueba suficientes

#### Validación de Coherencia
- [ ] **V-SEED-014:** Seeds están documentados en DATOS-SEED.md
- [ ] **V-SEED-015:** Conteo de seeds coincide con documentación
- [ ] **V-SEED-016:** Contenido de seeds coincide con descripción

**Orden de ejecución de seeds:**
1. auth (usuarios base)
2. auth_management (tenants, profiles)
3. system_configuration (settings, flags)
4. gamification_system (achievements)
5. educational_content (módulos, ejercicios)
6. content_management (contenido)
7. social_features (escuelas, aulas)
8. progress_tracking (progreso)
9. audit_logging (logs)

**Script de validación:**
```bash
# Test idempotencia
for seed in $(find seeds/dev -name "*.sql"); do
    echo "Testing: $seed"
    psql -d glit_test -f $seed
    psql -d glit_test -f $seed  # Segunda ejecución
    if [ $? -eq 0 ]; then
        echo "✅ $seed is idempotent"
    else
        echo "❌ $seed is NOT idempotent"
    fi
done
```

---

## 🎯 Checklist por Fase

### Fase 1: Prerequisites

- [ ] **V-ENUM-001 a V-ENUM-009:** Validar 24+ ENUMs
- [ ] **V-FUNC-001 a V-FUNC-008:** Validar 8 funciones de `gamilit` schema
- [ ] Comparar ENUMs con `TIPOS-Y-ENUMS.md`
- [ ] Verificar que todos los schemas existen

### Fase 2-6: Schemas

Para cada schema:
- [ ] **V-TABLE-001 a V-TABLE-020:** Validar todas las tablas
- [ ] **V-FUNC-001 a V-FUNC-017:** Validar funciones del schema
- [ ] **V-TRIG-001 a V-TRIG-013:** Validar triggers del schema
- [ ] **V-RLS-001 a V-RLS-015:** Validar RLS policies
- [ ] **V-IDX-001 a V-IDX-014:** Validar índices

### Fase 7: Seeds

- [ ] **V-SEED-001 a V-SEED-016:** Validar todos los seeds
- [ ] Ejecutar seeds en orden de dependencias
- [ ] Verificar idempotencia

### Fase 8: Triggers y Funciones

- [ ] **V-FUNC-012 a V-FUNC-015:** Tests funcionales
- [ ] **V-TRIG-010 a V-TRIG-013:** Tests funcionales

### Fase 9: RLS

- [ ] **V-RLS-010 a V-RLS-013:** Tests funcionales

### Fase 10: Índices

- [ ] **V-IDX-010 a V-IDX-012:** Tests de performance

### Fase 11: Vistas

- [ ] **V-VIEW-008 a V-VIEW-010:** Tests funcionales

### Fase 12: Coherencia

- [ ] Comparar con `ESQUEMA-COMPLETO.md`
- [ ] Comparar con `TIPOS-Y-ENUMS.md`
- [ ] Comparar con `DATOS-SEED.md`
- [ ] Comparar con `DIAGRAMAS-ARQUITECTURA.md`

---

## 📊 Matriz de Validación

| Tipo Objeto | Sintáctica | Semántica | Integridad | Funcional | Coherencia | Total Criterios |
|-------------|------------|-----------|------------|-----------|------------|-----------------|
| ENUMs       | 3          | 3         | 0          | 0         | 3          | 9               |
| Tablas      | 4          | 5         | 5          | 3         | 3          | 20              |
| Funciones   | 4          | 4         | 3          | 4         | 2          | 17              |
| Triggers    | 3          | 3         | 3          | 4         | 0          | 13              |
| RLS         | 3          | 3         | 3          | 4         | 2          | 15              |
| Índices     | 3          | 3         | 3          | 3         | 2          | 14              |
| Vistas      | 2          | 3         | 2          | 3         | 1          | 11              |
| Seeds       | 2          | 3         | 4          | 4         | 3          | 16              |
| **TOTAL**   | **24**     | **27**    | **23**     | **25**    | **16**     | **115**         |

---

## 🚀 Ejecución de Validación

### Setup Ambiente de Prueba

```bash
# 1. Crear base de datos de prueba
createdb glit_test

# 2. Ejecutar prerequisites
psql -d glit_test -f ddl/00-prerequisites.sql

# 3. Ejecutar DDL por schema (en orden de dependencias)
psql -d glit_test -f ddl/99-post-ddl-permissions.sql
```

### Validación Automatizada

```bash
# Script maestro de validación
./scripts/validate_database.sh

# Validación por fase
./scripts/validate_phase_1_prerequisites.sh
./scripts/validate_phase_2_schemas.sh
./scripts/validate_phase_7_seeds.sh
# ... etc
```

---

## 📝 Plantilla de Reporte de Validación

```markdown
# Reporte de Validación - [Fase X] - [Nombre]

**Fecha:** YYYY-MM-DD
**Ejecutor:** [Nombre]
**Duración:** [tiempo]

## Objetos Validados
- [Tipo]: [cantidad]

## Resultados

### Validación Sintáctica
- ✅ Pasados: X/Y
- ❌ Fallidos: Y
- Detalles: [lista de errores]

### Validación Semántica
- ✅ Pasados: X/Y
- ❌ Fallidos: Y
- Detalles: [lista de warnings]

### Validación de Integridad
- ✅ Pasados: X/Y
- ❌ Fallidos: Y
- Detalles: [lista de errores]

### Validación Funcional
- ✅ Pasados: X/Y
- ❌ Fallidos: Y
- Detalles: [lista de errores]

### Validación de Coherencia
- ✅ Pasados: X/Y
- ❌ Fallidos: Y
- Detalles: [lista de discrepancias]

## Problemas Encontrados
1. [Problema 1]
   - Severidad: [Alta/Media/Baja]
   - Impacto: [descripción]
   - Solución propuesta: [descripción]

## Conclusión
[Resumen general]

## Próximos Pasos
- [ ] [Acción 1]
- [ ] [Acción 2]
```

---

**Creado:** 2025-11-07
**Autor:** Equipo de Validación Database
