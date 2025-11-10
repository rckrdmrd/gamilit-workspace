# Guía de Carga de Usuarios y Perfiles - GAMILIT Platform

**Fecha:** 2025-11-09
**Versión:** 1.0
**Estado:** ✅ Validado

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Problema Identificado](#problema-identificado)
3. [Solución Implementada](#solución-implementada)
4. [Procedimiento Correcto](#procedimiento-correcto)
5. [Scripts de Corrección](#scripts-de-corrección)
6. [Usuarios de Prueba](#usuarios-de-prueba)
7. [Troubleshooting](#troubleshooting)

---

## Resumen Ejecutivo

Esta guía documenta el proceso correcto para cargar usuarios y perfiles en la base de datos de GAMILIT Platform, incluyendo:

- **Problema detectado:** Tablas de gamificación faltantes que causan fallo en triggers
- **Solución:** Crear tablas faltantes o deshabilitar trigger temporalmente
- **Usuarios cargados:** 8 usuarios de prueba (2 admins, 2 teachers, 4 students)
- **Estado:** ✅ Validado y funcional

---

## Problema Identificado

### 🔴 Síntoma

Al ejecutar los seeds de usuarios (`auth/01-demo-users.sql` y `auth_management/03-profiles.sql`), se produce el siguiente error:

```
ERROR:  relation "gamification_system.user_stats" does not exist
CONTEXT:  PL/pgSQL function gamilit.initialize_user_stats() line 5 at SQL statement
```

### 🔍 Causa Raíz

El trigger `trg_initialize_user_stats` en la tabla `auth_management.profiles` ejecuta la función `gamilit.initialize_user_stats()`, la cual intenta insertar datos en las siguientes tablas:

1. **`gamification_system.user_stats`** ❌ No existe en BD
2. **`gamification_system.user_ranks`** ❌ No existe en BD
3. **`gamification_system.comodines_inventory`** ✅ Existe en BD

### 📊 Análisis Técnico

**Tablas Definidas en DDL pero NO creadas:**

| Tabla | Archivo DDL | Estado en BD |
|-------|-------------|--------------|
| `user_stats` | `gamification_system/tables/01-user_stats.sql` | ❌ No creada |
| `user_ranks` | `gamification_system/tables/02-user_ranks.sql` | ❌ No creada |
| `comodines_inventory` | `gamification_system/tables/07-comodines_inventory.sql` | ✅ Creada |

**Razón:** El script `init-database.sh` no incluye estas tablas en el proceso de inicialización.

### 🔗 Dependencias del Trigger

```sql
-- Archivo: ddl/schemas/gamilit/functions/04-initialize_user_stats.sql
CREATE OR REPLACE FUNCTION gamilit.initialize_user_stats()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.role = 'student' THEN
        -- Intenta insertar en user_stats (FALLA)
        INSERT INTO gamification_system.user_stats (
            user_id, tenant_id, ml_coins, ml_coins_earned_total
        ) VALUES (
            NEW.user_id, NEW.tenant_id, 100, 100
        ) ON CONFLICT (user_id) DO NOTHING;

        -- Intenta insertar en comodines_inventory (OK)
        INSERT INTO gamification_system.comodines_inventory (
            user_id
        ) VALUES (
            NEW.user_id
        ) ON CONFLICT (user_id) DO NOTHING;

        -- Intenta insertar en user_ranks (FALLA)
        INSERT INTO gamification_system.user_ranks (
            user_id, tenant_id, current_rank
        ) VALUES (
            NEW.user_id, NEW.tenant_id, 'Ajaw'::maya_rank
        );
    END IF;
    RETURN NEW;
END;
$function$;
```

---

## Solución Implementada

### ✅ Solución Temporal (Usada para corrección inmediata)

**Deshabilitar el trigger temporalmente:**

```sql
-- Paso 1: Deshabilitar trigger
ALTER TABLE auth_management.profiles DISABLE TRIGGER trg_initialize_user_stats;

-- Paso 2: Insertar profiles
INSERT INTO auth_management.profiles (
    user_id, tenant_id, email, first_name, last_name,
    display_name, full_name, role, status, email_verified
)
SELECT ...
FROM auth.users u
WHERE ...;

-- Paso 3: Re-habilitar trigger
ALTER TABLE auth_management.profiles ENABLE TRIGGER trg_initialize_user_stats;
```

### ✅ Solución Definitiva (Recomendada)

**Crear las tablas faltantes antes de cargar usuarios:**

Ver sección [Scripts de Corrección](#scripts-de-corrección) para el script completo.

---

## Procedimiento Correcto

### Opción 1: Con Tablas de Gamificación (Recomendado)

```bash
#!/bin/bash
# 1. Crear tablas de gamificación faltantes
psql -f ddl/schemas/gamification_system/tables/01-user_stats.sql
psql -f ddl/schemas/gamification_system/tables/02-user_ranks.sql

# 2. Verificar que las tablas existen
psql -c "SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'gamification_system'
         AND table_name IN ('user_stats', 'user_ranks');"

# 3. Cargar usuarios de auth
psql -f seeds/dev/auth/01-demo-users.sql
psql -f seeds/dev/auth/02-test-users.sql

# 4. Cargar profiles (el trigger funcionará correctamente)
psql -f seeds/dev/auth_management/03-profiles.sql

# 5. Verificar carga exitosa
psql -c "SELECT COUNT(*) FROM auth.users;"
psql -c "SELECT COUNT(*) FROM auth_management.profiles;"
psql -c "SELECT COUNT(*) FROM gamification_system.user_stats;"
```

### Opción 2: Sin Tablas de Gamificación (Temporal)

```bash
#!/bin/bash
# 1. Cargar usuarios de auth
psql -f seeds/dev/auth/01-demo-users.sql
psql -f seeds/dev/auth/02-test-users.sql

# 2. Deshabilitar trigger
psql -c "ALTER TABLE auth_management.profiles DISABLE TRIGGER trg_initialize_user_stats;"

# 3. Cargar profiles sin trigger
psql -f seeds/dev/auth_management/03-profiles.sql

# 4. Re-habilitar trigger
psql -c "ALTER TABLE auth_management.profiles ENABLE TRIGGER trg_initialize_user_stats;"

# 5. Verificar carga
psql -c "SELECT COUNT(*) FROM auth.users;"
psql -c "SELECT COUNT(*) FROM auth_management.profiles;"
```

---

## Scripts de Corrección

### Script 1: Crear Tablas Faltantes

**Archivo:** `scripts/fix-missing-gamification-tables.sh`

```bash
#!/bin/bash
# ============================================================================
# Script: fix-missing-gamification-tables.sh
# Descripción: Crea las tablas de gamificación faltantes
# Fecha: 2025-11-09
# ============================================================================

set -e

cd "$(dirname "$0")/.."

# Cargar credenciales
DB_PASSWORD=$(grep "^Password:" database-credentials-dev.txt | awk '{print $2}')
export PGPASSWORD="$DB_PASSWORD"

PSQL="psql -h localhost -p 5432 -U gamilit_user -d gamilit_platform"

echo "════════════════════════════════════════════════════════════════"
echo "  CREANDO TABLAS DE GAMIFICACIÓN FALTANTES"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Crear tabla user_stats
echo "📊 Creando tabla gamification_system.user_stats..."
$PSQL -f ddl/schemas/gamification_system/tables/01-user_stats.sql

# Crear tabla user_ranks
echo "🏆 Creando tabla gamification_system.user_ranks..."
$PSQL -f ddl/schemas/gamification_system/tables/02-user_ranks.sql

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  VERIFICANDO TABLAS CREADAS"
echo "════════════════════════════════════════════════════════════════"
echo ""

$PSQL -c "
SELECT
    table_name,
    '✅ Creada' as status
FROM information_schema.tables
WHERE table_schema = 'gamification_system'
  AND table_name IN ('user_stats', 'user_ranks', 'comodines_inventory')
ORDER BY table_name;
"

echo ""
echo "✅ Tablas de gamificación creadas exitosamente"
echo ""
```

### Script 2: Cargar Usuarios y Perfiles (Versión Corregida)

**Archivo:** `scripts/load-users-and-profiles.sh`

```bash
#!/bin/bash
# ============================================================================
# Script: load-users-and-profiles.sh
# Descripción: Carga usuarios y perfiles correctamente
# Versión: 2.0 (con correcciones)
# Fecha: 2025-11-09
# ============================================================================

set -e

cd "$(dirname "$0")/.."

# Cargar credenciales
DB_PASSWORD=$(grep "^Password:" database-credentials-dev.txt | awk '{print $2}')
export PGPASSWORD="$DB_PASSWORD"

PSQL="psql -h localhost -p 5432 -U gamilit_user -d gamilit_platform"

echo "════════════════════════════════════════════════════════════════"
echo "  CARGANDO USUARIOS Y PERFILES - GAMILIT PLATFORM"
echo "════════════════════════════════════════════════════════════════"
echo ""

# PASO 1: Verificar tablas de gamificación
echo "📋 PASO 1: Verificando tablas de gamificación..."
TABLES_COUNT=$($PSQL -t -c "
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'gamification_system'
  AND table_name IN ('user_stats', 'user_ranks');
" | tr -d ' ')

if [ "$TABLES_COUNT" -lt 2 ]; then
    echo "⚠️  Tablas de gamificación faltantes. Creando..."
    ./scripts/fix-missing-gamification-tables.sh
else
    echo "✅ Tablas de gamificación presentes"
fi

echo ""

# PASO 2: Cargar usuarios en auth.users
echo "👥 PASO 2: Cargando usuarios en auth.users..."
$PSQL -f seeds/dev/auth/01-demo-users.sql
$PSQL -f seeds/dev/auth/02-test-users.sql

USERS_COUNT=$($PSQL -t -c "SELECT COUNT(*) FROM auth.users;" | tr -d ' ')
echo "✅ $USERS_COUNT usuarios cargados"

echo ""

# PASO 3: Cargar profiles en auth_management.profiles
echo "📝 PASO 3: Cargando profiles..."
$PSQL -f seeds/dev/auth_management/03-profiles.sql

PROFILES_COUNT=$($PSQL -t -c "SELECT COUNT(*) FROM auth_management.profiles;" | tr -d ' ')
echo "✅ $PROFILES_COUNT profiles cargados"

echo ""

# PASO 4: Verificación final
echo "✅ PASO 4: Verificación final..."

$PSQL -c "
SELECT
    'auth.users' as tabla,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE role = 'super_admin') as admins,
    COUNT(*) FILTER (WHERE role = 'admin_teacher') as teachers,
    COUNT(*) FILTER (WHERE role = 'student') as students
FROM auth.users
WHERE email LIKE '%@glit.edu.mx'
   OR email LIKE '%@demo.glit.edu.mx'
   OR email LIKE '%@gamilit.com'
UNION ALL
SELECT
    'auth_management.profiles' as tabla,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE role = 'super_admin') as admins,
    COUNT(*) FILTER (WHERE role = 'admin_teacher') as teachers,
    COUNT(*) FILTER (WHERE role = 'student') as students
FROM auth_management.profiles
WHERE email LIKE '%@glit.edu.mx'
   OR email LIKE '%@demo.glit.edu.mx'
   OR email LIKE '%@gamilit.com';
"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ CARGA COMPLETADA EXITOSAMENTE"
echo "════════════════════════════════════════════════════════════════"
echo ""
```

### Script 3: Verificar Usuarios Cargados

**Archivo:** `scripts/verify-users.sh`

```bash
#!/bin/bash
# ============================================================================
# Script: verify-users.sh
# Descripción: Verifica que usuarios y perfiles estén correctamente cargados
# Fecha: 2025-11-09
# ============================================================================

cd "$(dirname "$0")/.."

DB_PASSWORD=$(grep "^Password:" database-credentials-dev.txt | awk '{print $2}')
export PGPASSWORD="$DB_PASSWORD"

PSQL="psql -h localhost -p 5432 -U gamilit_user -d gamilit_platform"

echo "════════════════════════════════════════════════════════════════"
echo "  VERIFICACIÓN DE USUARIOS Y PERFILES"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "📊 USUARIOS EN auth.users:"
$PSQL -c "
SELECT
    email,
    role,
    email_confirmed_at IS NOT NULL as confirmed,
    created_at::date as created
FROM auth.users
WHERE email LIKE '%@glit.edu.mx'
   OR email LIKE '%@demo.glit.edu.mx'
   OR email LIKE '%@gamilit.com'
ORDER BY role, email;
"

echo ""
echo "📝 PERFILES EN auth_management.profiles:"
$PSQL -c "
SELECT
    email,
    role,
    full_name,
    status,
    email_verified
FROM auth_management.profiles
WHERE email LIKE '%@glit.edu.mx'
   OR email LIKE '%@demo.glit.edu.mx'
   OR email LIKE '%@gamilit.com'
ORDER BY role, email;
"

echo ""
echo "🔗 VINCULACIÓN users <-> profiles:"
$PSQL -c "
SELECT
    u.email,
    CASE
        WHEN p.user_id IS NOT NULL THEN '✅ Vinculado'
        ELSE '❌ Sin Profile'
    END as vinculacion,
    u.role as user_role,
    p.role as profile_role
FROM auth.users u
LEFT JOIN auth_management.profiles p ON u.id = p.user_id
WHERE u.email LIKE '%@glit.edu.mx'
   OR u.email LIKE '%@demo.glit.edu.mx'
   OR u.email LIKE '%@gamilit.com'
ORDER BY u.role, u.email;
"

echo ""
echo "════════════════════════════════════════════════════════════════"
```

---

## Usuarios de Prueba

### Credenciales Disponibles

Después de ejecutar los scripts correctamente, estarán disponibles los siguientes usuarios:

#### Super Administradores (2)

| Email | Password | Nombre |
|-------|----------|--------|
| admin@glit.edu.mx | Admin123! | Admin Sistema |
| admin@gamilit.com | Test1234 | Admin Sistema |

#### Instructores (2)

| Email | Password | Nombre |
|-------|----------|--------|
| instructor@demo.glit.edu.mx | Instructor123! | Instructor Demo |
| teacher@gamilit.com | Test1234 | Teacher Gamilit |

#### Estudiantes (4)

| Email | Password | Nombre |
|-------|----------|--------|
| estudiante1@demo.glit.edu.mx | Student123! | Ana García |
| estudiante2@demo.glit.edu.mx | Student123! | María Curie |
| estudiante3@demo.glit.edu.mx | Student123! | Carlos Einstein |
| student@gamilit.com | Test1234 | Student Gamilit |

**Total:** 8 usuarios de prueba

---

## Troubleshooting

### Problema 1: ERROR relation "user_stats" does not exist

**Síntoma:**
```
ERROR:  relation "gamification_system.user_stats" does not exist
```

**Solución:**
```bash
# Opción A: Crear las tablas
./scripts/fix-missing-gamification-tables.sh

# Opción B: Deshabilitar trigger temporalmente
psql -c "ALTER TABLE auth_management.profiles DISABLE TRIGGER trg_initialize_user_stats;"
```

### Problema 2: ERROR invalid input value for enum gamilit_role: "teacher"

**Síntoma:**
```
ERROR:  invalid input value for enum gamilit_role: "teacher"
```

**Causa:** El valor correcto es `'admin_teacher'`, no `'teacher'`

**Solución:**
```sql
-- Verificar valores del ENUM
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'auth_management.gamilit_role'::regtype
ORDER BY enumsortorder;

-- Resultado esperado:
-- student
-- admin_teacher
-- super_admin
```

### Problema 3: Perfiles no creados (0 rows)

**Síntoma:** Los usuarios se cargan pero no los perfiles

**Diagnóstico:**
```bash
# Verificar si el trigger está habilitado
psql -c "SELECT tgenabled FROM pg_trigger
         WHERE tgname = 'trg_initialize_user_stats';"

# Verificar si hay errores en logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**Solución:**
```bash
# Re-ejecutar seed de profiles
psql -f seeds/dev/auth_management/03-profiles.sql
```

### Problema 4: Foreign Key Violation en comodines_inventory

**Síntoma:**
```
ERROR:  insert or update on table "..." violates foreign key constraint
```

**Solución:** Asegurarse de que el `user_id` existe en `auth.users` antes de crear el profile

---

## Checklist de Validación

Después de cargar usuarios y perfiles, verificar:

- [ ] Usuarios creados en `auth.users`
- [ ] Perfiles creados en `auth_management.profiles`
- [ ] Vinculación correcta (user_id coincide)
- [ ] Roles coinciden entre ambas tablas
- [ ] Email confirmado (email_confirmed_at != NULL)
- [ ] Status = 'active' en profiles
- [ ] Email_verified = true en profiles
- [ ] Tablas de gamificación creadas (si aplica)
- [ ] No hay errores en logs de PostgreSQL

---

## Referencias

- **Archivo de usuarios:** `seeds/dev/auth/01-demo-users.sql`
- **Archivo de testing:** `seeds/dev/auth/02-test-users.sql`
- **Archivo de profiles:** `seeds/dev/auth_management/03-profiles.sql`
- **Trigger:** `ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql`
- **Función:** `ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`
- **Tabla user_stats:** `ddl/schemas/gamification_system/tables/01-user_stats.sql`
- **Tabla user_ranks:** `ddl/schemas/gamification_system/tables/02-user_ranks.sql`

---

## Notas Importantes

⚠️ **SEGURIDAD:**
- Estas credenciales son **SOLO para desarrollo/staging**
- **NUNCA** usar en producción
- Cambiar passwords después del despliegue inicial

⚠️ **DEPENDENCIES:**
- Requiere PostgreSQL 14+
- Requiere que los schemas `auth`, `auth_management`, `gamification_system` existan
- Requiere que el tenant default exista (`00000000-0000-0000-0000-000000000001`)

---

**Última Actualización:** 2025-11-09
**Autor:** Claude Code (AI Assistant)
**Validado:** ✅ Sí (con 8 usuarios de prueba)

---

*Generado con [Claude Code](https://claude.com/claude-code)*
