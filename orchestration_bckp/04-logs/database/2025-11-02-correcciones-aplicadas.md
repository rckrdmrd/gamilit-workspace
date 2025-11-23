# Correcciones Aplicadas a Scripts de Base de Datos

**Fecha:** 2025-11-02
**Agente:** ATLAS-DATABASE
**Estado:** PARCIALMENTE COMPLETADO

---

## ✅ Correcciones Completadas

### 1. UNIQUE Constraints Agregados en DDL ✅

#### Archivo: `ddl/schemas/auth_management/tables/03-profiles.sql`
```sql
-- Línea 46 agregada:
CONSTRAINT profiles_user_id_key UNIQUE (user_id),
```

**Permite:** `ON CONFLICT (user_id)` en seeds de profiles

#### Archivo: `ddl/schemas/educational_content/tables/01-modules.sql`
```sql
-- Líneas 68-70 agregadas:
-- Unique Constraints
ALTER TABLE ONLY educational_content.modules
    ADD CONSTRAINT modules_module_code_key UNIQUE (module_code);
```

**Permite:** `ON CONFLICT (module_code)` en seeds de módulos

#### Archivo: `ddl/schemas/educational_content/tables/02-exercises.sql`
```sql
-- Líneas 78-80 agregadas:
-- Unique Constraints
ALTER TABLE ONLY educational_content.exercises
    ADD CONSTRAINT exercises_module_type_order_key UNIQUE (module_id, exercise_type, order_index);
```

**Permite:** `ON CONFLICT (module_id, exercise_type, order_index)` en seeds de ejercicios

---

### 2. Archivo de Permisos Post-DDL Creado ✅

**Archivo nuevo:** `ddl/99-post-ddl-permissions.sql`

**Contenido:**
- GRANT USAGE en todos los schemas
- GRANT ALL PRIVILEGES en todas las tablas
- GRANT ALL PRIVILEGES en todas las secuencias
- GRANT EXECUTE en todas las funciones
- ALTER DEFAULT PRIVILEGES para objetos futuros

**Ejecución:** Debe cargarse DESPUÉS de crear todas las tablas DDL

---

## ⏳ Correcciones Pendientes

### 3. Corregir Seed de Profiles ⏳

**Archivo:** `seeds/dev/auth_management/03-profiles.sql`

**Problema actual:**
- Líneas 18-450 intentan crear usuarios en auth.users
- INSERT tiene 8 columnas pero 9 valores (error de sintaxis)
- Duplica funcionalidad de `01-demo-users.sql`

**Corrección necesaria:**
1. **ELIMINAR** todos los INSERT INTO auth.users (líneas 18-450 aproximadamente)
2. **REEMPLAZAR** con INSERT simple que:
   - Lee usuarios existentes de auth.users
   - Lee tenant_id de auth_management.tenants
   - Crea profiles con ON CONFLICT (user_id)

**Estructura correcta:**
```sql
SET search_path TO auth_management, auth, public;

-- Crear profiles para usuarios existentes
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
    (SELECT id FROM auth_management.tenants WHERE name LIKE '%Test%' OR name LIKE '%Gamilit%' LIMIT 1) as tenant_id,
    u.email,
    CASE
        WHEN u.email LIKE '%admin%' THEN 'Admin'
        WHEN u.email LIKE '%instructor%' OR u.email LIKE '%teacher%' THEN 'Instructor'
        WHEN u.email LIKE '%estudiante%' OR u.email LIKE '%student%' THEN 'Estudiante'
        ELSE 'Usuario'
    END as first_name,
    CASE
        WHEN u.email LIKE '%admin%' THEN 'Sistema'
        WHEN u.email LIKE '%instructor%' OR u.email LIKE '%teacher%' THEN 'Demo'
        ELSE 'Demo'
    END as last_name,
    SPLIT_PART(u.email, '@', 1) as display_name,
    CASE
        WHEN u.email LIKE '%admin%' THEN 'Admin Sistema'
        WHEN u.email LIKE '%instructor%' OR u.email LIKE '%teacher%' THEN 'Instructor Demo'
        ELSE CONCAT('Estudiante ', SPLIT_PART(u.email, '@', 1))
    END as full_name,
    u.role
FROM auth.users u
WHERE u.deleted_at IS NULL
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- Mensaje de confirmación
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM auth_management.profiles;
    RAISE NOTICE '✓ Profiles creados: % registros', profile_count;
END $$;
```

---

### 4. Modificar init-database.sh ⏳

**Cambios necesarios:**

#### A) Agregar carga de permisos post-DDL

Después de crear todas las tablas (línea ~330), agregar:

```bash
# Otorgar permisos a gamilit_user
print_info "Otorgando permisos a gamilit_user..."
execute_sql_file "$DDL_DIR/99-post-ddl-permissions.sql"
```

#### B) Cambiar orden de seeds

Reemplazar el loop actual (líneas 349-375) con orden específico:

```bash
load_seeds() {
    print_step "PASO 3/4: Cargando seeds..."

    export PGPASSWORD="$DB_PASSWORD"

    local seeds_base="$SEEDS_DIR/dev"
    local loaded=0
    local failed=0

    # Array con orden específico respetando dependencias
    local seed_files=(
        # 1. Tenants y auth providers (sin dependencias)
        "$seeds_base/auth_management/01-tenants.sql"
        "$seeds_base/auth_management/02-auth_providers.sql"

        # 2. Users (depende de tenants - opcional)
        "$seeds_base/auth/01-demo-users.sql"

        # 3. Profiles (CRÍTICO: depende de users y tenants)
        "$seeds_base/auth_management/03-profiles.sql"

        # 4. Resto de auth_management
        "$seeds_base/auth_management/04-user_roles.sql"
        "$seeds_base/auth_management/05-user_preferences.sql"
        "$seeds_base/auth_management/06-auth_attempts.sql"
        "$seeds_base/auth_management/07-security_events.sql"

        # 5. System configuration
        "$seeds_base/system_configuration/01-system_settings.sql"
        "$seeds_base/system_configuration/02-feature_flags.sql"

        # 6. Gamificación (depende de users/profiles)
        "$seeds_base/gamification_system/01-achievement_categories.sql"
        "$seeds_base/gamification_system/02-achievements.sql"
        "$seeds_base/gamification_system/03-leaderboard_metadata.sql"
        "$seeds_base/gamification_system/04-initialize_user_gamification.sql"

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

    for seed_file in "${seed_files[@]}"; do
        if [ -f "$seed_file" ]; then
            local basename_file=$(basename "$seed_file")
            print_info "  $basename_file"

            # CRÍTICO: NO ocultar errores - mostrar STDOUT y STDERR
            if execute_sql_file "$seed_file"; then
                ((loaded++))
            else
                ((failed++))
                print_error "Error en $basename_file"
            fi
        else
            print_warning "Seed no encontrado: $(basename $seed_file)"
        fi
    done

    if [ $failed -gt 0 ]; then
        print_warning "$loaded seeds cargados, $failed con errores"
    else
        print_success "$loaded seeds cargados exitosamente"
    fi

    unset PGPASSWORD
}
```

#### C) Modificar execute_sql_file para mostrar errores

Buscar la función `execute_sql_file` y asegurarse que NO oculta errores:

```bash
execute_sql_file() {
    local file="$1"

    # Ejecutar como postgres usando sudo
    printf "$SUDO_PASS\n" | sudo -S -u postgres psql -d "$DB_NAME" -f "$file"

    # Retornar el exit code de psql
    return $?
}
```

---

### 5. Actualizar recreate-database.sh y reset-database.sh ⏳

Aplicar los MISMOS cambios que en init-database.sh:
1. Cargar `99-post-ddl-permissions.sql` después de DDL
2. Usar el mismo orden de seeds
3. NO ocultar errores

---

## 📋 Resumen de Archivos Modificados

| Archivo | Estado | Cambio |
|---------|--------|--------|
| `ddl/schemas/auth_management/tables/03-profiles.sql` | ✅ Completado | UNIQUE constraint en user_id |
| `ddl/schemas/educational_content/tables/01-modules.sql` | ✅ Completado | UNIQUE constraint en module_code |
| `ddl/schemas/educational_content/tables/02-exercises.sql` | ✅ Completado | UNIQUE constraint compuesto |
| `ddl/99-post-ddl-permissions.sql` | ✅ Creado | Nuevo archivo de permisos |
| `seeds/dev/auth_management/03-profiles.sql` | ⏳ Pendiente | Eliminar INSERT users, simplificar |
| `scripts/init-database.sh` | ⏳ Pendiente | Orden seeds, cargar permisos, mostrar errores |
| `scripts/recreate-database.sh` | ⏳ Pendiente | Mismos cambios que init |
| `scripts/reset-database.sh` | ⏳ Pendiente | Mismos cambios que init |

---

## 🎯 Próximos Pasos

1. ⏳ Corregir `03-profiles.sql` - **PENDIENTE**
2. ⏳ Modificar `init-database.sh` - **PENDIENTE**
3. ⏳ Actualizar `recreate` y `reset` scripts - **PENDIENTE**
4. ⏳ Probar instalación completa desde cero - **PENDIENTE**

---

**Autor:** ATLAS-DATABASE
**Fecha:** 2025-11-02
**Progreso:** 4/8 archivos completados (50%)
