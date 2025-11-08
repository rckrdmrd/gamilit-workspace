# PLAN DE CONSOLIDACIÓN: Enum gamilit_role

**Fecha:** 2025-11-07
**Agente:** NEXUS-DATABASE-AVANZADO
**Objetivo:** Consolidar enum `gamilit_role` eliminando duplicados y corrigiendo todas las dependencias
**Prioridad:** 🔴 **P0 - CRÍTICO BLOQUEADOR**

---

## 📊 Resumen Ejecutivo

### Problema Detectado

- ✅ Enum **DEFINIDO** como: `auth_management.gamilit_role` (2 veces - duplicado)
- ❌ Enum **USADO** como: `public.gamilit_role` (11 veces - NO EXISTE)
- ⚠️ Enum **USADO** sin schema: `gamilit_role` (ambiguo - múltiples veces)

### Impacto

🔴 **CRÍTICO - BLOQUEADOR DE APLICACIÓN**

- ❌ 3 tablas NO pueden ser creadas
- ❌ 7 RLS policies FALLAN en runtime
- ❌ 1 function pública FALLA en runtime
- ❌ Sistema de autenticación COMPLETAMENTE ROTO

### Solución

**Consolidar a:** `auth_management.gamilit_role` (enum oficial)

**Archivos a modificar:** 14 archivos SQL
**Migrations requeridas:** 1 migration compleja
**Tiempo estimado:** 2-3 horas (corrección + testing)
**Riesgo:** Medio (requiere actualizar muchos archivos)

---

## 🔍 Análisis de Root Cause

### Causa Raíz

**Hipótesis:** Durante migración/refactor alguien:
1. Creó enum `auth_management.gamilit_role`
2. Actualizó SOLO algunas tablas/functions
3. Dejó 11 referencias antiguas a `public.gamilit_role`
4. Nunca definió `public.gamilit_role` (o lo eliminó)

### Evidencia

```sql
-- ✅ Definido CORRECTAMENTE (00-prerequisites.sql:30)
CREATE TYPE auth_management.gamilit_role AS ENUM ('student', 'admin_teacher', 'super_admin');

-- ❌ Usado INCORRECTAMENTE (auth/tables/01-users.sql:15)
role public.gamilit_role DEFAULT 'student'::public.gamilit_role NOT NULL,

-- ✅ Usado CORRECTAMENTE (auth_management/tables/03-profiles.sql:29)
role auth_management.gamilit_role DEFAULT 'student'::auth_management.gamilit_role NOT NULL,
```

### Cascada de Errores

```
public.gamilit_role NO DEFINIDO
  ↓
❌ CREATE TABLE auth.users FAILS
  ↓
❌ FK profiles.user_id → users.id FAILS
  ↓
❌ Sistema de Auth COMPLETAMENTE ROTO
  ↓
❌ Aplicación NO INICIA
```

---

## 📋 Inventario Completo de Dependencias

### 1. Definiciones del Enum (2 - DUPLICADO)

| Archivo | Línea | Tipo | Acción |
|---------|-------|------|--------|
| `00-prerequisites.sql` | 30 | CREATE TYPE auth_management.gamilit_role | ✅ **MANTENER** (centralizado) |
| `schemas/auth_management/enums/gamilit_role.sql` | 6 | CREATE TYPE auth_management.gamilit_role | ❌ **ELIMINAR** (duplicado) |

**Decisión:** Mantener solo en `00-prerequisites.sql` (archivo central de enums)

### 2. Tablas que Usan el Enum (4)

| Tabla | Schema | Archivo | Línea | Tipo Actual | Tipo Correcto | Acción |
|-------|--------|---------|-------|-------------|---------------|--------|
| `users` | `auth` | `schemas/auth/tables/01-users.sql` | 15 | `public.gamilit_role` | `auth_management.gamilit_role` | ⚠️ **CORREGIR** |
| `profiles` | `auth_management` | `schemas/auth_management/tables/03-profiles.sql` | 29 | `auth_management.gamilit_role` | `auth_management.gamilit_role` | ✅ **OK** |
| `roles` | `auth_management` | `schemas/auth_management/tables/04-roles.sql` | 17 | `public.gamilit_role` | `auth_management.gamilit_role` | ⚠️ **CORREGIR** |
| `feature_flags` | `system_configuration` | `schemas/system_configuration/tables/02-feature_flags.sql` | 20 | `public.gamilit_role[]` | `auth_management.gamilit_role[]` | ⚠️ **CORREGIR** |

### 3. RLS Policies que Usan el Enum (7)

| Policy | Tabla | Archivo | Línea | Cast Actual | Cast Correcto | Acción |
|--------|-------|---------|-------|-------------|---------------|--------|
| `exercise_attempts_select_teacher` | `exercise_attempts` | `progress_tracking/tables/03-exercise_attempts.sql` | 156 | `'admin_teacher'::public.gamilit_role` | `'admin_teacher'::auth_management.gamilit_role` | ⚠️ **CORREGIR** |
| `exercise_submissions_select_teacher` | `exercise_submissions` | `progress_tracking/tables/04-exercise_submissions.sql` | 152 | `'admin_teacher'::public.gamilit_role` | `'admin_teacher'::auth_management.gamilit_role` | ⚠️ **CORREGIR** |
| `scheduled_missions_insert_teacher` | `scheduled_missions` | `progress_tracking/tables/05-scheduled_missions.sql` | 71 | `'admin_teacher'::public.gamilit_role` | `'admin_teacher'::auth_management.gamilit_role` | ⚠️ **CORREGIR** |
| `scheduled_missions_update_teacher` | `scheduled_missions` | `progress_tracking/tables/05-scheduled_missions.sql` | 83 | `'admin_teacher'::public.gamilit_role` | `'admin_teacher'::auth_management.gamilit_role` | ⚠️ **CORREGIR** |
| `scheduled_missions_delete_teacher` | `scheduled_missions` | `progress_tracking/tables/05-scheduled_missions.sql` | 95 | `'admin_teacher'::public.gamilit_role` | `'admin_teacher'::auth_management.gamilit_role` | ⚠️ **CORREGIR** |
| `module_progress_select_teacher` | `module_progress` | `progress_tracking/tables/01-module_progress.sql` | 200 | `'admin_teacher'::public.gamilit_role` | `'admin_teacher'::auth_management.gamilit_role` | ⚠️ **CORREGIR** |
| `learning_sessions_select_teacher` | `learning_sessions` | `progress_tracking/tables/02-learning_sessions.sql` | 182 | `'admin_teacher'::public.gamilit_role` | `'admin_teacher'::auth_management.gamilit_role` | ⚠️ **CORREGIR** |

### 4. Functions que Usan el Enum (3)

| Function | Schema | Archivo | Líneas Afectadas | Tipo Actual | Tipo Correcto | Acción |
|----------|--------|---------|------------------|-------------|---------------|--------|
| `is_feature_enabled` | `public` | `public/functions/03-is_feature_enabled.sql` | 18 | Variable `v_user_role public.gamilit_role` | `v_user_role auth_management.gamilit_role` | ⚠️ **CORREGIR** |
| `get_user_role` | `auth_management` | `auth_management/functions/02-get_user_role.sql` | 9, 15, 22, 39 | Sin schema (ambiguo) | `auth_management.gamilit_role` | ⚠️ **CORREGIR** |
| `get_current_user_role` | `gamilit` | `gamilit/functions/03-get_current_user_role.sql` | 10, 15 | Sin schema (ambiguo) | `auth_management.gamilit_role` | ⚠️ **CORREGIR** |

---

## 🛠️ PLAN DE CONSOLIDACIÓN DETALLADO

### FASE 1: Preparación (30 minutos)

#### Paso 1.1: Backup de Archivos a Modificar

```bash
# Crear carpeta de backup
mkdir -p orchestration/05-validaciones/consolidacion/backups-2025-11-07

# Backup de archivos SQL
cp apps/database/ddl/schemas/auth/tables/01-users.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/auth_management/tables/04-roles.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/system_configuration/tables/02-feature_flags.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/progress_tracking/tables/05-scheduled_missions.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/progress_tracking/tables/02-learning_sessions.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/public/functions/03-is_feature_enabled.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/auth_management/functions/02-get_user_role.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/gamilit/functions/03-get_current_user_role.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
cp apps/database/ddl/schemas/auth_management/enums/gamilit_role.sql orchestration/05-validaciones/consolidacion/backups-2025-11-07/
```

#### Paso 1.2: Verificar que Base de Datos Esté Accesible

```bash
# Test de conexión
psql -h localhost -U gamilit_user -d gamilit_dev -c "SELECT 1;"
```

#### Paso 1.3: Verificar Estado Actual del Enum

```sql
-- Ver si existe public.gamilit_role (debería fallar)
SELECT * FROM pg_type WHERE typname = 'gamilit_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Ver si existe auth_management.gamilit_role (debería existir)
SELECT * FROM pg_type WHERE typname = 'gamilit_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth_management');
```

---

### FASE 2: Corrección de Archivos DDL (1 hora)

#### Grupo 1: Tablas (4 archivos)

**Archivo 1: `schemas/auth/tables/01-users.sql`**

```sql
-- LÍNEA 15 - ANTES:
role public.gamilit_role DEFAULT 'student'::public.gamilit_role NOT NULL,

-- LÍNEA 15 - DESPUÉS:
role auth_management.gamilit_role DEFAULT 'student'::auth_management.gamilit_role NOT NULL,
```

**Archivo 2: `schemas/auth_management/tables/04-roles.sql`**

```sql
-- LÍNEA 17 - ANTES:
role public.gamilit_role NOT NULL,

-- LÍNEA 17 - DESPUÉS:
role auth_management.gamilit_role NOT NULL,
```

**Archivo 3: `schemas/system_configuration/tables/02-feature_flags.sql`**

```sql
-- LÍNEA 20 - ANTES:
target_roles public.gamilit_role[],

-- LÍNEA 20 - DESPUÉS:
target_roles auth_management.gamilit_role[],
```

**Archivo 4: `schemas/auth_management/tables/03-profiles.sql`**
- ✅ Ya está correcto, no requiere cambios

#### Grupo 2: RLS Policies (5 archivos, 7 policies)

**Archivo 5: `progress_tracking/tables/03-exercise_attempts.sql`**

```sql
-- LÍNEA 156 - ANTES:
CREATE POLICY exercise_attempts_select_teacher ON progress_tracking.exercise_attempts FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::public.gamilit_role) AND ...

-- LÍNEA 156 - DESPUÉS:
CREATE POLICY exercise_attempts_select_teacher ON progress_tracking.exercise_attempts FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND ...
```

**Archivo 6: `progress_tracking/tables/04-exercise_submissions.sql`**

```sql
-- LÍNEA 152 - ANTES:
CREATE POLICY exercise_submissions_select_teacher ON progress_tracking.exercise_submissions FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::public.gamilit_role) AND ...

-- LÍNEA 152 - DESPUÉS:
CREATE POLICY exercise_submissions_select_teacher ON progress_tracking.exercise_submissions FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND ...
```

**Archivo 7: `progress_tracking/tables/05-scheduled_missions.sql`**

```sql
-- LÍNEA 71 - ANTES:
((gamilit.get_current_user_role() = 'admin_teacher'::public.gamilit_role) AND

-- LÍNEA 71 - DESPUÉS:
((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND

-- LÍNEA 83 - ANTES:
((gamilit.get_current_user_role() = 'admin_teacher'::public.gamilit_role) AND

-- LÍNEA 83 - DESPUÉS:
((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND

-- LÍNEA 95 - ANTES:
((gamilit.get_current_user_role() = 'admin_teacher'::public.gamilit_role) AND

-- LÍNEA 95 - DESPUÉS:
((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND
```

**Archivo 8: `progress_tracking/tables/01-module_progress.sql`**

```sql
-- LÍNEA 200 - ANTES:
CREATE POLICY module_progress_select_teacher ON progress_tracking.module_progress FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::public.gamilit_role) AND ...

-- LÍNEA 200 - DESPUÉS:
CREATE POLICY module_progress_select_teacher ON progress_tracking.module_progress FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND ...
```

**Archivo 9: `progress_tracking/tables/02-learning_sessions.sql`**

```sql
-- LÍNEA 182 - ANTES:
CREATE POLICY learning_sessions_select_teacher ON progress_tracking.learning_sessions FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::public.gamilit_role) AND ...

-- LÍNEA 182 - DESPUÉS:
CREATE POLICY learning_sessions_select_teacher ON progress_tracking.learning_sessions FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND ...
```

#### Grupo 3: Functions (3 archivos)

**Archivo 10: `public/functions/03-is_feature_enabled.sql`**

```sql
-- LÍNEA 18 - ANTES:
v_user_role public.gamilit_role;

-- LÍNEA 18 - DESPUÉS:
v_user_role auth_management.gamilit_role;
```

**Archivo 11: `auth_management/functions/02-get_user_role.sql`**

```sql
-- LÍNEA 9 - ANTES:
RETURNS gamilit_role

-- LÍNEA 9 - DESPUÉS:
RETURNS auth_management.gamilit_role

-- LÍNEA 15 - ANTES:
v_role gamilit_role;

-- LÍNEA 15 - DESPUÉS:
v_role auth_management.gamilit_role;

-- LÍNEA 22 - ANTES:
RETURN 'student'::gamilit_role;

-- LÍNEA 22 - DESPUÉS:
RETURN 'student'::auth_management.gamilit_role;

-- LÍNEA 39 - ANTES:
RETURN COALESCE(v_role, 'student'::gamilit_role);

-- LÍNEA 39 - DESPUÉS:
RETURN COALESCE(v_role, 'student'::auth_management.gamilit_role);
```

**Archivo 12: `gamilit/functions/03-get_current_user_role.sql`**

```sql
-- LÍNEA 10 - ANTES:
RETURNS gamilit_role

-- LÍNEA 10 - DESPUÉS:
RETURNS auth_management.gamilit_role

-- LÍNEA 15 - ANTES:
v_role gamilit_role;

-- LÍNEA 15 - DESPUÉS:
v_role auth_management.gamilit_role;
```

#### Grupo 4: Eliminar Definición Duplicada (1 archivo)

**Archivo 13: `schemas/auth_management/enums/gamilit_role.sql`**

**Acción:** ❌ **ELIMINAR ARCHIVO COMPLETO**

**Justificación:** Enum ya está definido en `00-prerequisites.sql` (centralizado)

**IMPORTANTE:** Verificar que no haya referencias a este archivo en scripts de deployment

---

### FASE 3: Crear Migration para DB Existentes (1 hora)

Si la base de datos YA EXISTE, necesitamos migration para actualizar columnas y policies.

**Migration:** `apps/database/migrations/20251107_consolidate_gamilit_role_enum.sql`

```sql
-- =====================================================
-- Migration: Consolidar enum gamilit_role
-- Fecha: 2025-11-07
-- Autor: NEXUS-DATABASE-AVANZADO
-- Objetivo: Cambiar todas las referencias de public.gamilit_role a auth_management.gamilit_role
-- =====================================================

BEGIN;

-- =====================================================
-- PASO 1: Verificar que enum auth_management.gamilit_role exista
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE t.typname = 'gamilit_role' AND n.nspname = 'auth_management'
    ) THEN
        RAISE EXCEPTION 'Enum auth_management.gamilit_role no existe. Ejecutar 00-prerequisites.sql primero.';
    END IF;
END $$;

-- =====================================================
-- PASO 2: Crear alias temporal public.gamilit_role → auth_management.gamilit_role
-- (Para permitir migración sin romper datos)
-- =====================================================

-- Crear dominio que apunta al enum correcto
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE t.typname = 'gamilit_role' AND n.nspname = 'public'
    ) THEN
        CREATE DOMAIN public.gamilit_role AS auth_management.gamilit_role;
    END IF;
END $$;

-- =====================================================
-- PASO 3: Alterar columnas de tablas
-- =====================================================

-- 3.1 Tabla auth.users
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE auth.users ALTER COLUMN role TYPE auth_management.gamilit_role;
        RAISE NOTICE 'auth.users.role actualizado';
    END IF;
END $$;

-- 3.2 Tabla auth_management.roles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'auth_management' AND table_name = 'roles' AND column_name = 'role') THEN
        ALTER TABLE auth_management.roles ALTER COLUMN role TYPE auth_management.gamilit_role;
        RAISE NOTICE 'auth_management.roles.role actualizado';
    END IF;
END $$;

-- 3.3 Tabla system_configuration.feature_flags
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'system_configuration' AND table_name = 'feature_flags' AND column_name = 'target_roles') THEN
        ALTER TABLE system_configuration.feature_flags ALTER COLUMN target_roles TYPE auth_management.gamilit_role[];
        RAISE NOTICE 'system_configuration.feature_flags.target_roles actualizado';
    END IF;
END $$;

-- =====================================================
-- PASO 4: Recrear RLS Policies con tipo correcto
-- =====================================================

-- 4.1 exercise_attempts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'exercise_attempts_select_teacher') THEN
        DROP POLICY exercise_attempts_select_teacher ON progress_tracking.exercise_attempts;
        CREATE POLICY exercise_attempts_select_teacher ON progress_tracking.exercise_attempts
        FOR SELECT USING (
            (gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role)
            AND (EXISTS (SELECT 1 FROM social_features.classroom_members WHERE ...))
        );
        RAISE NOTICE 'Policy exercise_attempts_select_teacher recreada';
    END IF;
END $$;

-- 4.2 exercise_submissions
-- ... (similar para las otras 6 policies)

-- =====================================================
-- PASO 5: Recrear Functions con tipo correcto
-- =====================================================

-- 5.1 public.is_feature_enabled
CREATE OR REPLACE FUNCTION public.is_feature_enabled(feature_key text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_role auth_management.gamilit_role;
    -- ... resto de la función
$$;

-- 5.2 auth_management.get_user_role
CREATE OR REPLACE FUNCTION auth_management.get_user_role(p_user_id uuid DEFAULT NULL)
RETURNS auth_management.gamilit_role
LANGUAGE plpgsql
AS $$
DECLARE
    v_role auth_management.gamilit_role;
    -- ... resto
$$;

-- 5.3 gamilit.get_current_user_role
CREATE OR REPLACE FUNCTION gamilit.get_current_user_role()
RETURNS auth_management.gamilit_role
LANGUAGE plpgsql
AS $$
DECLARE
    v_role auth_management.gamilit_role;
    -- ... resto
$$;

-- =====================================================
-- PASO 6: Eliminar dominio temporal (opcional - mantener para compatibilidad)
-- =====================================================

-- DROP DOMAIN IF EXISTS public.gamilit_role CASCADE;
-- NOTA: Mejor MANTENER el dominio como alias para evitar romper código legacy

-- =====================================================
-- PASO 7: Verificación final
-- =====================================================

DO $$
DECLARE
    v_count_tables int;
    v_count_functions int;
BEGIN
    -- Verificar tablas
    SELECT COUNT(*) INTO v_count_tables
    FROM information_schema.columns
    WHERE udt_name = 'gamilit_role'
    AND udt_schema = 'auth_management';

    RAISE NOTICE 'Tablas con auth_management.gamilit_role: %', v_count_tables;

    IF v_count_tables < 3 THEN
        RAISE WARNING 'Solo % tablas usan auth_management.gamilit_role (esperado: 4)', v_count_tables;
    END IF;
END $$;

COMMIT;

-- =====================================================
-- Log de migración
-- =====================================================

INSERT INTO public.schema_migrations (version, description, applied_at)
VALUES ('20251107_consolidate_gamilit_role_enum', 'Consolidar enum gamilit_role a auth_management schema', NOW())
ON CONFLICT DO NOTHING;
```

**Migration Rollback:** `apps/database/migrations/20251107_consolidate_gamilit_role_enum_down.sql`

```sql
-- ⚠️ ROLLBACK NO RECOMENDADO - Puede causar pérdida de datos
-- Solo usar en ambiente de desarrollo/testing

BEGIN;

-- Revertir a public.gamilit_role (si existe)
-- NOTA: Esto requiere que public.gamilit_role exista primero

-- Paso 1: Crear public.gamilit_role si no existe
CREATE TYPE public.gamilit_role AS ENUM ('student', 'admin_teacher', 'super_admin');

-- Paso 2: Revertir columnas
ALTER TABLE auth.users ALTER COLUMN role TYPE public.gamilit_role;
ALTER TABLE auth_management.roles ALTER COLUMN role TYPE public.gamilit_role;
ALTER TABLE system_configuration.feature_flags ALTER COLUMN target_roles TYPE public.gamilit_role[];

-- Paso 3: Recrear policies con public.gamilit_role
-- ... (revertir las 7 policies)

COMMIT;
```

---

### FASE 4: Testing y Validación (30 minutos)

#### Test 1: Verificar Definición del Enum

```sql
-- Test que enum existe en schema correcto
SELECT
    n.nspname as schema,
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'gamilit_role'
GROUP BY n.nspname, t.typname;

-- Output esperado:
-- schema            | enum_name     | values
-- auth_management   | gamilit_role  | student, admin_teacher, super_admin
```

#### Test 2: Verificar Tablas Usan Tipo Correcto

```sql
-- Test que tablas usan auth_management.gamilit_role
SELECT
    table_schema,
    table_name,
    column_name,
    udt_schema,
    udt_name
FROM information_schema.columns
WHERE udt_name = 'gamilit_role'
ORDER BY table_schema, table_name;

-- Output esperado:
-- table_schema          | table_name    | column_name  | udt_schema       | udt_name
-- auth                  | users         | role         | auth_management  | gamilit_role
-- auth_management       | profiles      | role         | auth_management  | gamilit_role
-- auth_management       | roles         | role         | auth_management  | gamilit_role
-- system_configuration  | feature_flags | target_roles | auth_management  | gamilit_role
```

#### Test 3: Verificar RLS Policies

```sql
-- Test que policies existen y usan tipo correcto
SELECT
    schemaname,
    tablename,
    policyname,
    pg_get_expr(qual, oid) as policy_expression
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE policyname LIKE '%teacher%'
ORDER BY schemaname, tablename;

-- Verificar que expresiones contienen 'auth_management.gamilit_role'
```

#### Test 4: Verificar Functions

```sql
-- Test que functions retornan tipo correcto
SELECT
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE proname IN ('get_user_role', 'get_current_user_role', 'is_feature_enabled');

-- Output esperado:
-- schema            | function_name           | return_type
-- auth_management   | get_user_role           | auth_management.gamilit_role
-- gamilit           | get_current_user_role   | auth_management.gamilit_role
-- public            | is_feature_enabled      | boolean (pero usa auth_management.gamilit_role internamente)
```

#### Test 5: Test Funcional End-to-End

```sql
-- Test que roles funcionan correctamente
BEGIN;

-- Insertar usuario de test
INSERT INTO auth.users (email, encrypted_password, role)
VALUES ('test@example.com', 'hashed_password', 'admin_teacher'::auth_management.gamilit_role);

-- Verificar que se insertó correctamente
SELECT email, role FROM auth.users WHERE email = 'test@example.com';

-- Limpiar
ROLLBACK;
```

---

### FASE 5: Validación de Permisos y RLS (30 minutos)

#### Paso 5.1: Verificar Permisos del Enum

```sql
-- Verificar que gamilit_user tiene acceso al enum
SELECT
    n.nspname as schema,
    t.typname as type_name,
    t.typacl as permissions
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE t.typname = 'gamilit_role';

-- Si no tiene permisos, agregar:
GRANT USAGE ON TYPE auth_management.gamilit_role TO gamilit_user;
```

#### Paso 5.2: Verificar Permisos de Functions

```sql
-- Verificar permisos de functions que usan el enum
SELECT
    n.nspname as schema,
    p.proname as function_name,
    p.proacl as permissions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE proname IN ('get_user_role', 'get_current_user_role', 'is_feature_enabled');

-- Si faltan permisos:
GRANT EXECUTE ON FUNCTION auth_management.get_user_role TO gamilit_user;
GRANT EXECUTE ON FUNCTION gamilit.get_current_user_role TO gamilit_user;
GRANT EXECUTE ON FUNCTION public.is_feature_enabled TO gamilit_user;
```

#### Paso 5.3: Verificar RLS Policies Activas

```sql
-- Verificar que RLS está habilitado en tablas afectadas
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname IN ('progress_tracking')
AND tablename IN ('exercise_attempts', 'exercise_submissions', 'scheduled_missions', 'module_progress', 'learning_sessions');

-- Si RLS no está habilitado:
ALTER TABLE progress_tracking.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.exercise_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.scheduled_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.learning_sessions ENABLE ROW LEVEL SECURITY;
```

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgo 1: Migration Falla en Producción

**Probabilidad:** Media
**Impacto:** Crítico

**Mitigación:**
1. ✅ Ejecutar migration PRIMERO en dev/staging
2. ✅ Tener backup completo de base de datos
3. ✅ Tener rollback script preparado
4. ✅ Testing exhaustivo antes de producción

### Riesgo 2: Datos Incompatibles Durante Migration

**Probabilidad:** Baja
**Impacto:** Alto

**Mitigación:**
1. ✅ Usar DOMAIN temporal como alias (permite coexistencia)
2. ✅ Validar datos antes de migration
3. ✅ Migration transaccional (BEGIN/COMMIT)

### Riesgo 3: Código Legacy Rompe

**Probabilidad:** Media
**Impacto:** Medio

**Mitigación:**
1. ✅ Mantener dominio `public.gamilit_role` como alias (compatibilidad legacy)
2. ✅ Actualizar Backend constants si es necesario
3. ✅ Testing E2E completo

---

## 📊 CRITERIOS DE ÉXITO

### Must-Have (Obligatorio)

- [ ] ✅ Enum `auth_management.gamilit_role` definido 1 sola vez (00-prerequisites.sql)
- [ ] ✅ 0 usos de `public.gamilit_role` en DDL
- [ ] ✅ 4 tablas usan `auth_management.gamilit_role` correctamente
- [ ] ✅ 7 RLS policies usan `auth_management.gamilit_role` correctamente
- [ ] ✅ 3 functions usan `auth_management.gamilit_role` correctamente
- [ ] ✅ Todos los tests pasan (5/5)

### Nice-to-Have (Recomendado)

- [ ] ✅ Dominio `public.gamilit_role` mantenido como alias (compatibilidad)
- [ ] ✅ Documentación actualizada
- [ ] ✅ Script de rollback testeado
- [ ] ✅ Permisos y RLS verificados

---

## 🚀 PRÓXIMOS PASOS

### Acción Inmediata (Hoy)

1. **Revisar y aprobar este plan** (15 min)
2. **Ejecutar FASE 1: Preparación** (30 min)
3. **Ejecutar FASE 2: Corrección de archivos DDL** (1 hora)

### Acción Prioritaria (Mañana)

4. **Ejecutar FASE 3: Crear migration** (1 hora)
5. **Ejecutar FASE 4: Testing** (30 min)
6. **Ejecutar FASE 5: Validar permisos** (30 min)

### Post-Consolidación

7. Validar otros enums duplicados (`classroom_role`, `team_role`)
8. Crear script de detección automática de enums duplicados
9. Actualizar documentación de Database

---

## 📞 CONTACTO Y APROBACIONES

**Requiere aprobación de:**
- [ ] Tech Lead (migration crítica)
- [ ] Database Admin (cambios estructurales)
- [ ] Backend Team Lead (verificar Backend constants)

**Contacto para dudas:**
- Agente: NEXUS-DATABASE-AVANZADO
- Reporte: orchestration/05-validaciones/consolidacion/PLAN-CONSOLIDACION-ENUM-GAMILIT-ROLE-2025-11-07.md

---

**Generado:** 2025-11-07
**Versión:** 1.0
**Estado:** ⚠️ PENDIENTE DE APROBACIÓN
**Prioridad:** 🔴 P0 - CRÍTICO BLOQUEADOR
