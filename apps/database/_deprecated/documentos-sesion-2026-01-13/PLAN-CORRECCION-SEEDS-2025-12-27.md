# Plan de Correccion de Seeds GAMILIT

**Fecha**: 2025-12-27
**Version**: 1.0
**Estado**: Listo para implementacion
**Prioridad**: CRITICA

---

## Resumen Ejecutivo

Este documento detalla las correcciones necesarias para los seeds de GAMILIT identificadas durante el analisis de la base de datos.

### Problemas Identificados

| Prioridad | Problema | Archivos Afectados | Impacto |
|-----------|----------|-------------------|---------|
| **P0-001** | Tenant name mismatch | `00-schools-default.sql` (DEV/PROD) | Fallo total al crear escuela default |
| **P0-002** | UUID no definido en DEV | Multiples seeds usan `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | FK violations |
| **P1-001** | Orden incorrecto de seeds | `04-initialize_user_gamification.sql` | Triggers fallan |

---

## BATCH 1: Correccion de Tenant (P0-001)

### Archivo 1.1: `seeds/dev/auth_management/01-tenants.sql`

**Problema**: El tenant principal se llama "Gamilit Test Organization" pero varios seeds buscan "GAMILIT Platform".

**Solucion**: Agregar tenant adicional "GAMILIT Platform" o crear un alias.

#### ANTES (lineas 33-43):

```sql
-- Tenant 1: Gamilit Test Organization
(
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Gamilit Test Organization',
    'gamilit-test',
    'test.gamilit.com',
    NULL,
    'enterprise',
```

#### DESPUES (agregar nuevo tenant despues de linea 122):

```sql
-- Tenant 4: GAMILIT Platform (Alias principal para compatibilidad)
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'GAMILIT Platform',
    'gamilit-platform',
    'platform.gamilit.com',
    NULL,
    'enterprise',
    5000,
    500,
    true,
    NULL,
    '{
        "theme": "detective",
        "language": "es",
        "timezone": "America/Mexico_City",
        "features": {
            "analytics_enabled": true,
            "gamification_enabled": true,
            "social_features_enabled": true
        }
    }'::jsonb,
    '{
        "description": "Tenant principal de GAMILIT Platform",
        "environment": "production",
        "created_by": "seed_script",
        "is_primary": true
    }'::jsonb,
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
```

**Justificacion**: El UUID `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` ya esta siendo usado en produccion (backups muestran 50+ perfiles con este tenant_id). Crear el tenant con el nombre esperado resuelve el problema de busqueda por nombre.

---

### Archivo 1.2: `seeds/dev/social_features/00-schools-default.sql`

**Problema (linea 36)**: Busca tenant por nombre "GAMILIT Platform" que no existe en DEV.

#### ANTES (lineas 34-37):

```sql
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE name = 'GAMILIT Platform'
    LIMIT 1;
```

#### DESPUES:

```sql
    -- Buscar tenant principal (primero por nombre exacto, luego por UUID conocido, luego primer tenant)
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE name = 'GAMILIT Platform'
       OR id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
       OR name LIKE '%Gamilit%'
    ORDER BY
        CASE
            WHEN name = 'GAMILIT Platform' THEN 1
            WHEN id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid THEN 2
            ELSE 3
        END
    LIMIT 1;
```

**Justificacion**: La busqueda flexible permite encontrar el tenant correcto sin importar si es "GAMILIT Platform" (prod) o "Gamilit Test Organization" (dev).

---

### Archivo 1.3: `seeds/prod/social_features/00-schools-default.sql`

Aplicar el mismo cambio que en Archivo 1.2.

---

## BATCH 2: Correccion de UUID de Tenant (P0-002)

### Archivos afectados:

El UUID `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` se usa en 100+ seeds pero NO existe en `01-tenants.sql` de DEV.

**Archivos principales**:
- `seeds/dev/auth_management/04-profiles-complete.sql`
- `seeds/dev/auth_management/06-profiles-production.sql`
- `seeds/dev/gamification_system/04-achievements.sql`
- `seeds/dev/gamification_system/05-user_stats.sql`
- `seeds/dev/gamification_system/06-user_ranks.sql`
- `seeds/dev/gamification_system/07-ml_coins_transactions.sql`
- `seeds/dev/gamification_system/13-shop_items.sql`

**Solucion**: El cambio del BATCH 1 (Archivo 1.1) resuelve este problema al crear el tenant con ese UUID.

---

## BATCH 3: Correccion de Orden en init-database.sh (P1-001)

### Archivo: `scripts/init-database.sh`

**Problema**: `04-initialize_user_gamification.sql` se ejecuta ANTES de que existan las tablas `user_stats` y `user_ranks`.

#### ANTES (lineas 944-954):

```bash
        # ==========================================
        # FASE 4: Gamification Base
        # ==========================================
        "$SEEDS_DIR/gamification_system/01-achievement_categories.sql"
        "$SEEDS_DIR/gamification_system/02-leaderboard_metadata.sql"
        "$SEEDS_DIR/gamification_system/03-maya_ranks.sql"
        "$SEEDS_DIR/gamification_system/04-achievements.sql"
        "$SEEDS_DIR/gamification_system/04-initialize_user_gamification.sql"

        # ==========================================
        # FASE 5: Gamification Avanzado (NUEVO)
        # ==========================================
        "$SEEDS_DIR/gamification_system/05-user_stats.sql"
        "$SEEDS_DIR/gamification_system/06-user_ranks.sql"
```

#### DESPUES:

```bash
        # ==========================================
        # FASE 4: Gamification Base
        # ==========================================
        "$SEEDS_DIR/gamification_system/01-achievement_categories.sql"
        "$SEEDS_DIR/gamification_system/02-leaderboard_metadata.sql"
        "$SEEDS_DIR/gamification_system/03-maya_ranks.sql"
        "$SEEDS_DIR/gamification_system/04-achievements.sql"

        # ==========================================
        # FASE 5: Gamification Avanzado
        # ==========================================
        "$SEEDS_DIR/gamification_system/05-user_stats.sql"
        "$SEEDS_DIR/gamification_system/06-user_ranks.sql"
        # NOTA: 04-initialize_user_gamification.sql movido al final de FASE 5
        "$SEEDS_DIR/gamification_system/04-initialize_user_gamification.sql"
        "$SEEDS_DIR/gamification_system/07-ml_coins_transactions.sql"
```

**Justificacion**: El script de inicializacion requiere que las tablas `user_stats` y `user_ranks` existan antes de ejecutarse, ya que intenta insertar datos en ellas.

---

## BATCH 4: Notas Adicionales

### 4.1 Problema de ENUM 'teacher' (RESUELTO)

El analisis inicial reporto uso de ENUM `'teacher'` invalido, pero la revision del codigo muestra que:

1. El ENUM correcto es `auth_management.gamilit_role` con valores: `'student'`, `'admin_teacher'`, `'super_admin'`
2. Los seeds actuales en `/seeds/dev/auth/02-test-users.sql` (linea 56) ya usan el cast correcto:
   ```sql
   'admin_teacher'::auth_management.gamilit_role
   ```
3. NO se encontro uso incorrecto de `'teacher'` como valor ENUM en los seeds activos.

**Estado**: NO REQUIERE CORRECCION

### 4.2 Seed 06-profiles-production.sql (P1-002)

Este seed puede fallar por duplicados si se ejecuta despues de otros seeds de profiles.

**Mitigacion existente**: El seed ya usa `ON CONFLICT (user_id) DO UPDATE` (verificar que existe).

---

## Orden de Implementacion

### Fase 1: Preparacion (5 min)
1. Crear backup de seeds actuales
2. Verificar que no hay conexiones activas a la BD

### Fase 2: Correccion de Tenants (10 min)
1. Editar `seeds/dev/auth_management/01-tenants.sql` (Archivo 1.1)
2. Editar `seeds/dev/social_features/00-schools-default.sql` (Archivo 1.2)
3. Editar `seeds/prod/social_features/00-schools-default.sql` (Archivo 1.3)
4. Copiar cambios de DEV a PROD si aplica

### Fase 3: Correccion de Orden (5 min)
1. Editar `scripts/init-database.sh` (BATCH 3)

### Fase 4: Validacion (10 min)
1. Ejecutar script de validacion (ver siguiente seccion)
2. Verificar logs de errores
3. Confirmar que todos los objetos fueron creados

---

## Comandos SQL de Verificacion Post-Correccion

```sql
-- ============================================
-- SCRIPT DE VALIDACION POST-CORRECCION
-- Ejecutar despues de aplicar correcciones
-- ============================================

-- 1. Verificar que existe tenant "GAMILIT Platform"
SELECT 'TENANT_CHECK' AS test,
       CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status,
       COUNT(*) AS count
FROM auth_management.tenants
WHERE name = 'GAMILIT Platform'
   OR id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;

-- 2. Verificar que existe la escuela default del sistema
SELECT 'SCHOOL_DEFAULT_CHECK' AS test,
       CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status,
       COUNT(*) AS count
FROM social_features.schools
WHERE code = 'SYSTEM-UNASSIGNED';

-- 3. Verificar integridad de FK: profiles -> tenants
SELECT 'PROFILES_FK_CHECK' AS test,
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status,
       COUNT(*) AS orphan_count
FROM auth_management.profiles p
LEFT JOIN auth_management.tenants t ON p.tenant_id = t.id
WHERE t.id IS NULL;

-- 4. Verificar que los usuarios de testing existen
SELECT 'TEST_USERS_CHECK' AS test,
       CASE WHEN COUNT(*) = 3 THEN 'PASS' ELSE 'FAIL' END AS status,
       COUNT(*) AS count
FROM auth.users
WHERE email IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com');

-- 5. Verificar user_stats inicializados
SELECT 'USER_STATS_CHECK' AS test,
       CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status,
       COUNT(*) AS count
FROM gamification_system.user_stats;

-- 6. Verificar user_ranks inicializados
SELECT 'USER_RANKS_CHECK' AS test,
       CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status,
       COUNT(*) AS count
FROM gamification_system.user_ranks;

-- 7. Resumen de todos los tenants
SELECT 'TENANT_SUMMARY' AS test, id, name, slug
FROM auth_management.tenants
ORDER BY created_at;

-- 8. Verificar ENUM values (informativo)
SELECT 'ENUM_CHECK' AS test,
       enumlabel AS role_value
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'gamilit_role'
ORDER BY enumsortorder;

-- 9. Conteo total de objetos criticos
SELECT
    'OBJECT_COUNT' AS test,
    (SELECT COUNT(*) FROM auth_management.tenants) AS tenants,
    (SELECT COUNT(*) FROM auth.users WHERE deleted_at IS NULL) AS users,
    (SELECT COUNT(*) FROM auth_management.profiles) AS profiles,
    (SELECT COUNT(*) FROM social_features.schools) AS schools,
    (SELECT COUNT(*) FROM social_features.classrooms) AS classrooms,
    (SELECT COUNT(*) FROM gamification_system.user_stats) AS user_stats,
    (SELECT COUNT(*) FROM gamification_system.user_ranks) AS user_ranks;
```

---

## Script de Rollback (En caso de fallo)

```bash
#!/bin/bash
# rollback-seeds.sh
# Ejecutar si las correcciones fallan

echo "Iniciando rollback..."

# Restaurar desde backup
cp backup/01-tenants.sql.bak seeds/dev/auth_management/01-tenants.sql
cp backup/00-schools-default.sql.bak seeds/dev/social_features/00-schools-default.sql
cp backup/init-database.sh.bak scripts/init-database.sh

echo "Rollback completado"
```

---

## Checklist Pre-Implementacion

- [ ] Backup de archivos originales creado
- [ ] Revision de cambios por segundo desarrollador
- [ ] Base de datos de testing disponible
- [ ] Script de validacion preparado
- [ ] Rollback plan documentado

## Checklist Post-Implementacion

- [ ] Todos los tests de validacion pasan
- [ ] No hay errores FK en logs
- [ ] Usuarios de testing pueden hacer login
- [ ] Gamificacion inicializada correctamente
- [ ] Escuela default creada

---

## Historial de Cambios

| Version | Fecha | Autor | Descripcion |
|---------|-------|-------|-------------|
| 1.0 | 2025-12-27 | Claude Code | Creacion inicial del plan |

---

## Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Database Admin | | | |
| Tech Lead | | | |
| QA | | | |
