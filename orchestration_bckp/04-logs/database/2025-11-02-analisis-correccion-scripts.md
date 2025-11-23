# Análisis y Correcciones Necesarias para Scripts de Base de Datos

**Fecha:** 2025-11-02
**Agente:** ATLAS-DATABASE
**Objetivo:** Corregir ejecución automatizada de DDL y Seeds

---

## 🔍 Problemas Identificados

### 1. **Scripts Ocultan Errores** ❌

**Archivo:** `apps/database/scripts/init-database.sh:369`

```bash
if execute_sql_file "$seed_file" > /dev/null 2>&1; then
```

**Problema:** Redirige STDOUT y STDERR a `/dev/null`, ocultando todos los errores.

**Impacto:** Seeds que fallan silenciosamente, imposible debuggear.

**Solución:** Mostrar errores y capturar solo el exit code.

---

### 2. **UNIQUE Constraints Faltantes en DDL** ❌

Los seeds usan `ON CONFLICT` pero las tablas no tienen los constraints únicos necesarios.

#### a) `auth_management.profiles`

**Seed usa:** `ON CONFLICT (user_id)`
**Constraint actual:** Solo `UNIQUE (email)`
**Falta:** `UNIQUE (user_id)` o `PRIMARY KEY (user_id)`

**Archivo DDL:** `ddl/schemas/auth_management/tables/03-profiles.sql`

#### b) `educational_content.modules`

**Seed usa:** `ON CONFLICT (module_code)`
**Constraint actual:** NO TIENE
**Falta:** `UNIQUE (module_code)`

**Archivo DDL:** `ddl/schemas/educational_content/tables/01-modules.sql`

#### c) `educational_content.exercises`

**Seed usa:** `ON CONFLICT (module_id, exercise_type, order_index)`
**Constraint actual:** NO TIENE
**Falta:** `UNIQUE (module_id, exercise_type, order_index)`

**Archivo DDL:** `ddl/schemas/educational_content/tables/02-exercises.sql`

---

### 3. **Seeds con Estructura Incorrecta** ❌

#### a) `03-profiles.sql` intenta crear USUARIOS

**Problema:** El seed `auth_management/03-profiles.sql` tiene INSERT INTO auth.users en líneas 19-46.

**Impacto:**
- Duplica funcionalidad de `01-demo-users.sql`
- Los INSERT tienen más columnas de las necesarias (9 valores para 8 columnas)
- ERROR: "INSERT has more expressions than target columns"

**Solución:** Este seed SOLO debe crear profiles, NO usuarios.

**Dependencias correctas:**
1. `auth/01-demo-users.sql` → Crea 5 usuarios
2. `auth_management/01-tenants.sql` → Crea tenants
3. `auth_management/03-profiles.sql` → Lee users y tenants, crea profiles

---

### 4. **Orden de Carga Incorrecto** ❌

**Orden actual en script:**
```bash
seed_schemas=(
    "auth"                    # 1. ✅ Correcto (users primero)
    "auth_management"         # 2. ⚠️ Depende de users y tenants
    "system_configuration"
    "gamification_system"
    "educational_content"
    "content_management"
    "social_features"
    "progress_tracking"
    "audit_logging"
)
```

**Problema:** Dentro de `auth_management`, los archivos se cargan alfabéticamente:
- 01-tenants.sql ✅
- 02-auth_providers.sql ✅
- 03-profiles.sql ⚠️ (requiere que users ya existan)

Pero `auth/01-demo-users.sql` se carga ANTES de `auth_management/01-tenants.sql`.

**CORRECTO:**
```
1. auth/01-demo-users.sql          → Crea users
2. auth_management/01-tenants.sql   → Crea tenants
3. auth_management/02-auth_providers.sql
4. auth_management/03-profiles.sql  → Lee users + tenants, crea profiles
5. gamification_system/04-initialize_user_gamification.sql → Lee users, crea user_stats
...
```

**INCORRECTO (actual):**
```
1. auth/01-demo-users.sql
   (TERMINA todo auth/)
2. auth_management/01-tenants.sql
   ...
```

El problema es que el loop procesa schema completo antes de pasar al siguiente. No hay forma de intercalar.

**Solución:** Crear un orden específico de archivos, no por schemas.

---

### 5. **Permisos NO Están en DDL** ❌

**Problema:** Los GRANT no están en los archivos DDL de las tablas.

**Verificación:**
```bash
$ grep -r "GRANT.*gamilit_user" ddl/schemas/*/tables/*.sql | wc -l
43  # ✅ Algunos archivos sí tienen GRANT
```

**Pero:** No todos los archivos tienen GRANT completo para:
- USAGE ON SCHEMA
- ALL PRIVILEGES ON SEQUENCES
- EXECUTE ON FUNCTIONS

**Solución:** Agregar un archivo `ddl/99-post-ddl-permissions.sql` que se ejecute DESPUÉS de crear todas las tablas.

---

## ✅ Plan de Corrección

### Paso 1: Agregar UNIQUE Constraints en DDL

**Archivos a modificar:**

#### A) `ddl/schemas/auth_management/tables/03-profiles.sql`

```sql
-- Después de PRIMARY KEY
ALTER TABLE ONLY auth_management.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
```

#### B) `ddl/schemas/educational_content/tables/01-modules.sql`

```sql
-- Después de PRIMARY KEY
ALTER TABLE ONLY educational_content.modules
    ADD CONSTRAINT modules_module_code_key UNIQUE (module_code);
```

#### C) `ddl/schemas/educational_content/tables/02-exercises.sql`

```sql
-- Después de PRIMARY KEY
ALTER TABLE ONLY educational_content.exercises
    ADD CONSTRAINT exercises_module_type_order_key
    UNIQUE (module_id, exercise_type, order_index);
```

---

### Paso 2: Crear Archivo de Permisos Post-DDL

**Nuevo archivo:** `ddl/99-post-ddl-permissions.sql`

```sql
-- =====================================================
-- POST-DDL: Grant Permissions to gamilit_user
-- =====================================================
-- This file MUST be executed AFTER all DDL files
-- =====================================================

-- Grant USAGE on all schemas
GRANT USAGE ON SCHEMA
    auth,
    auth_management,
    system_configuration,
    gamification_system,
    educational_content,
    content_management,
    social_features,
    progress_tracking,
    audit_logging,
    gamilit,
    public
TO gamilit_user;

-- Grant ALL on tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth_management TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA system_configuration TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA gamification_system TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA educational_content TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA content_management TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA social_features TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA progress_tracking TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit_logging TO gamilit_user;

-- Grant ALL on sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth_management TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA system_configuration TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA gamification_system TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA educational_content TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA content_management TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA social_features TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA progress_tracking TO gamilit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit_logging TO gamilit_user;

-- Grant EXECUTE on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA gamilit TO gamilit_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO gamilit_user;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO gamilit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth_management GRANT ALL ON TABLES TO gamilit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA system_configuration GRANT ALL ON TABLES TO gamilit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA gamification_system GRANT ALL ON TABLES TO gamilit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA educational_content GRANT ALL ON TABLES TO gamilit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA content_management GRANT ALL ON TABLES TO gamilit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA social_features GRANT ALL ON TABLES TO gamilit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA progress_tracking GRANT ALL ON TABLES TO gamilit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit_logging GRANT ALL ON TABLES TO gamilit_user;

SELECT 'Permisos otorgados a gamilit_user' as status;
```

---

### Paso 3: Corregir Seed de Profiles

**Archivo:** `seeds/dev/auth_management/03-profiles.sql`

**Cambio:** ELIMINAR todos los INSERT INTO auth.users (líneas 18-226).

Este seed debe SOLO crear profiles, asumiendo que users y tenants ya existen:

```sql
-- =====================================================
-- Seed: auth_management.profiles (DEV)
-- =====================================================
SET search_path TO auth_management, auth, public;

-- Insert profiles for existing users
INSERT INTO auth_management.profiles (
    user_id,
    tenant_id,
    email,
    first_name,
    last_name,
    display_name,
    full_name,
    role
)
SELECT
    u.id as user_id,
    (SELECT id FROM auth_management.tenants WHERE name LIKE '%Test%' LIMIT 1) as tenant_id,
    u.email,
    CASE
        WHEN u.email LIKE '%admin%' THEN 'Admin'
        WHEN u.email LIKE '%instructor%' THEN 'Instructor'
        ELSE 'Estudiante'
    END as first_name,
    -- ... resto de campos
FROM auth.users u
WHERE u.deleted_at IS NULL
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
```

---

### Paso 4: Modificar init-database.sh

**Cambios necesarios:**

#### A) Agregar carga de permisos post-DDL

```bash
create_ddl() {
    # ... código existente ...

    # Después de cargar todas las tablas
    print_info "Otorgando permisos a gamilit_user..."
    execute_sql_file "$DDL_DIR/99-post-ddl-permissions.sql"
}
```

#### B) Cambiar orden de seeds (opción 1: por archivo específico)

```bash
load_seeds() {
    print_step "PASO 3/4: Cargando seeds..."

    export PGPASSWORD="$DB_PASSWORD"

    local seeds_base="$SEEDS_DIR/dev"

    # Orden específico de seeds respetando dependencias
    local seed_files=(
        # 1. Tenants y auth providers (sin dependencias)
        "$seeds_base/auth_management/01-tenants.sql"
        "$seeds_base/auth_management/02-auth_providers.sql"

        # 2. Users (depende de tenants)
        "$seeds_base/auth/01-demo-users.sql"

        # 3. Profiles (depende de users y tenants)
        "$seeds_base/auth_management/03-profiles.sql"

        # 4. Resto de auth_management
        "$seeds_base/auth_management/04-user_roles.sql"
        "$seeds_base/auth_management/05-user_preferences.sql"
        "$seeds_base/auth_management/06-auth_attempts.sql"
        "$seeds_base/auth_management/07-security_events.sql"

        # 5. Gamificación (depende de users)
        "$seeds_base/gamification_system/01-achievement_categories.sql"
        "$seeds_base/gamification_system/02-achievements.sql"
        "$seeds_base/gamification_system/03-leaderboard_metadata.sql"
        "$seeds_base/gamification_system/04-initialize_user_gamification.sql"

        # 6. System configuration
        "$seeds_base/system_configuration/01-system_settings.sql"
        "$seeds_base/system_configuration/02-feature_flags.sql"

        # 7. Educational content
        "$seeds_base/educational_content/01-modules.sql"
        "$seeds_base/educational_content/02-exercises-module1.sql"
        "$seeds_base/educational_content/03-exercises-module2.sql"
        "$seeds_base/educational_content/04-exercises-module3.sql"
        "$seeds_base/educational_content/05-exercises-module4.sql"
        "$seeds_base/educational_content/06-exercises-module5.sql"
        "$seeds_base/educational_content/07-assessment-rubrics.sql"

        # 8. Content management
        "$seeds_base/content_management/01-marie-curie-bio.sql"
        "$seeds_base/content_management/02-media-files.sql"
        "$seeds_base/content_management/03-tags.sql"

        # 9. Social features
        "$seeds_base/social_features/01-schools.sql"
        "$seeds_base/social_features/02-classrooms.sql"
        "$seeds_base/social_features/03-classroom-members.sql"
        "$seeds_base/social_features/04-teams.sql"

        # 10. Progress tracking
        "$seeds_base/progress_tracking/01-demo-progress.sql"
        "$seeds_base/progress_tracking/02-exercise-attempts.sql"

        # 11. Audit logging
        "$seeds_base/audit_logging/01-audit-logs.sql"
        "$seeds_base/audit_logging/02-system-metrics.sql"
    )

    local loaded=0
    local failed=0

    for seed_file in "${seed_files[@]}"; do
        if [ -f "$seed_file" ]; then
            print_info "Cargando $(basename $seed_file)..."

            # CRÍTICO: NO ocultar errores
            if execute_sql_file "$seed_file" 2>&1 | tee -a "$LOG_FILE"; then
                ((loaded++))
            else
                ((failed++))
                print_error "Error en $(basename $seed_file)"
            fi
        else
            print_warning "Seed no encontrado: $seed_file"
        fi
    done

    print_success "$loaded seeds cargados ($failed errores)"

    unset PGPASSWORD
}
```

#### C) Agregar variable LOG_FILE

```bash
# Al inicio del script
LOG_FILE="/tmp/gamilit-db-install-$(date +%Y%m%d_%H%M%S).log"

print_info "Log: $LOG_FILE"
```

---

### Paso 5: Aplicar Mismos Cambios a recreate y reset

Los scripts `recreate-database.sh` y `reset-database.sh` deben tener las mismas correcciones.

---

## 📝 Resumen de Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `ddl/schemas/auth_management/tables/03-profiles.sql` | Agregar UNIQUE constraint en user_id |
| `ddl/schemas/educational_content/tables/01-modules.sql` | Agregar UNIQUE constraint en module_code |
| `ddl/schemas/educational_content/tables/02-exercises.sql` | Agregar UNIQUE constraint compuesto |
| `ddl/99-post-ddl-permissions.sql` | **CREAR** nuevo archivo con permisos |
| `seeds/dev/auth_management/03-profiles.sql` | Eliminar INSERT INTO users, solo profiles |
| `scripts/init-database.sh` | Cambiar orden seeds, mostrar errores, cargar permisos |
| `scripts/recreate-database.sh` | Aplicar mismos cambios |
| `scripts/reset-database.sh` | Aplicar mismos cambios |

---

**Total:** 8 archivos a modificar/crear

---

**Próximo Paso:** Aplicar correcciones y probar instalación completa desde cero.

**Autor:** ATLAS-DATABASE
**Fecha:** 2025-11-02
