# PLAN DE CORRECCION POR FASES

**Tarea:** TASK-2026-02-13-CORRECCION-MULTI-TENANCY-PRODUCCION
**Fecha:** 2026-02-13
**Total Fases:** 6
**Estrategia:** Progresiva con validacion entre fases

---

## RESUMEN DE FASES

| Fase | Nombre | Riesgo | Reversible | Dependencia |
|------|--------|--------|------------|-------------|
| **F0** | Diagnostico Produccion | NULO | N/A | Acceso BD prod |
| **F1** | Backup y Preparacion | NULO | N/A | F0 completada |
| **F2** | Consolidacion de Tenants | ALTO | SI (backup) | F1 completada |
| **F3** | Normalizacion School/Classroom | MEDIO | SI (backup) | F2 completada |
| **F4** | Limpieza y Verificacion | BAJO | SI | F3 completada |
| **F5** | Hardening Backend + Frontend | BAJO | SI (git) | F4 completada |

---

## FASE 0: DIAGNOSTICO EN PRODUCCION

**Objetivo:** Obtener estado real de la BD de produccion antes de cualquier modificacion.

### F0.1 — Conectar a produccion
```bash
# Opcion A: Desde servidor
ssh isem@74.208.126.102
psql -U gamilit_user -d gamilit_platform

# Opcion B: Tunnel SSH
ssh -L 15432:localhost:5432 isem@74.208.126.102
psql -h localhost -p 15432 -U gamilit_user -d gamilit_platform
```

### F0.2 — Ejecutar queries diagnosticos
Ejecutar los 8 queries de `01-ANALISIS-DIAGNOSTICO.md` seccion 4.

### F0.3 — Documentar resultados
Guardar output en: `03-RESULTADOS-DIAGNOSTICO.md`

**Datos requeridos antes de continuar:**
- [ ] Lista completa de tenants (Q1)
- [ ] Perfiles por tenant (Q2)
- [ ] Schools existentes (Q3)
- [ ] Classrooms existentes (Q4)
- [ ] Alumnos por classroom (Q5)
- [ ] Usuarios sin classroom (Q6)
- [ ] Gamificacion por tenant (Q7)
- [ ] Sesiones activas (Q8)

### F0.4 — Clasificar tenants

Clasificar cada tenant encontrado en:

| Clasificacion | Criterio | Accion |
|---------------|----------|--------|
| **PRINCIPAL** | slug = 'gamilit-platform' | Conservar |
| **ESPURIO_VACIO** | 0 perfiles asociados | Eliminar directamente |
| **ESPURIO_CON_DATOS** | 1+ perfiles pero no es principal | Migrar datos, luego eliminar |
| **OBSOLETO** | Seeds antiguos (00000000-*) | Verificar FKs, eliminar |

**Gate F0:** NO continuar hasta tener tabla completa de tenants clasificados.

---

## FASE 1: BACKUP Y PREPARACION

**Objetivo:** Asegurar que existe backup completo antes de cualquier modificacion.

### F1.1 — Backup completo de produccion
```bash
ssh isem@74.208.126.102

# Backup completo con formato custom (comprimido)
pg_dump -U gamilit_user -d gamilit_platform \
  -F custom -f /tmp/gamilit_backup_$(date +%Y%m%d_%H%M%S).dump

# Verificar integridad del backup
pg_restore -l /tmp/gamilit_backup_*.dump | head -20
```

### F1.2 — Backup selectivo de tablas criticas
```sql
-- Backup de tablas que seran modificadas
CREATE TABLE _backup_tenants AS SELECT * FROM auth_management.tenants;
CREATE TABLE _backup_profiles AS SELECT * FROM auth_management.profiles;
CREATE TABLE _backup_memberships AS SELECT * FROM auth_management.memberships;
CREATE TABLE _backup_user_roles AS SELECT * FROM auth_management.user_roles;
CREATE TABLE _backup_user_sessions AS SELECT * FROM auth_management.user_sessions;
CREATE TABLE _backup_schools AS SELECT * FROM social_features.schools;
CREATE TABLE _backup_classrooms AS SELECT * FROM social_features.classrooms;
CREATE TABLE _backup_classroom_members AS SELECT * FROM social_features.classroom_members;
CREATE TABLE _backup_teacher_classrooms AS SELECT * FROM social_features.teacher_classrooms;
```

### F1.3 — Crear script de rollback
```sql
-- ROLLBACK SCRIPT (ejecutar SOLO si algo sale mal)
-- Este script restaura las tablas desde backup

BEGIN;
  -- 1. Restaurar profiles (desactiva FKs temporalmente)
  SET session_replication_role = replica;

  DELETE FROM auth_management.profiles;
  INSERT INTO auth_management.profiles SELECT * FROM _backup_profiles;

  DELETE FROM auth_management.memberships;
  INSERT INTO auth_management.memberships SELECT * FROM _backup_memberships;

  DELETE FROM auth_management.user_roles;
  INSERT INTO auth_management.user_roles SELECT * FROM _backup_user_roles;

  DELETE FROM auth_management.tenants;
  INSERT INTO auth_management.tenants SELECT * FROM _backup_tenants;

  DELETE FROM social_features.schools;
  INSERT INTO social_features.schools SELECT * FROM _backup_schools;

  DELETE FROM social_features.classrooms;
  INSERT INTO social_features.classrooms SELECT * FROM _backup_classrooms;

  DELETE FROM social_features.classroom_members;
  INSERT INTO social_features.classroom_members SELECT * FROM _backup_classroom_members;

  SET session_replication_role = DEFAULT;
COMMIT;
```

**Gate F1:** NO continuar hasta confirmar backup exitoso y script de rollback probado.

---

## FASE 2: CONSOLIDACION DE TENANTS

**Objetivo:** Migrar todos los perfiles y datos asociados al tenant principal.

### F2.1 — Identificar tenant principal
```sql
-- Obtener UUID del tenant principal
SELECT id FROM auth_management.tenants
WHERE slug = 'gamilit-platform' AND is_active = true;
-- Esperado: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

### F2.2 — Migrar perfiles al tenant principal
```sql
-- TRANSACCION ATOMICA: Migrar todos los perfiles
BEGIN;

-- Variable para el tenant principal
DO $$
DECLARE
  v_primary_tenant_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_migrated_count INTEGER;
BEGIN
  -- Contar perfiles a migrar
  SELECT COUNT(*) INTO v_migrated_count
  FROM auth_management.profiles
  WHERE tenant_id != v_primary_tenant_id
    AND deleted_at IS NULL;

  RAISE NOTICE 'Perfiles a migrar: %', v_migrated_count;

  -- Migrar profiles.tenant_id
  UPDATE auth_management.profiles
  SET tenant_id = v_primary_tenant_id,
      updated_at = NOW()
  WHERE tenant_id != v_primary_tenant_id;

  RAISE NOTICE 'Profiles migrados: %', v_migrated_count;
END $$;

COMMIT;
```

### F2.3 — Migrar user_roles al tenant principal
```sql
BEGIN;

DO $$
DECLARE
  v_primary_tenant_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_count INTEGER;
BEGIN
  -- Contar roles a migrar
  SELECT COUNT(*) INTO v_count
  FROM auth_management.user_roles
  WHERE tenant_id != v_primary_tenant_id;

  RAISE NOTICE 'User roles a migrar: %', v_count;

  -- Migrar user_roles.tenant_id
  -- Nota: UNIQUE(user_id, tenant_id, role) puede causar conflicto
  -- Eliminar duplicados potenciales primero
  DELETE FROM auth_management.user_roles ur1
  WHERE tenant_id != v_primary_tenant_id
    AND EXISTS (
      SELECT 1 FROM auth_management.user_roles ur2
      WHERE ur2.user_id = ur1.user_id
        AND ur2.tenant_id = v_primary_tenant_id
        AND ur2.role = ur1.role
    );

  -- Ahora migrar los restantes
  UPDATE auth_management.user_roles
  SET tenant_id = v_primary_tenant_id,
      updated_at = NOW()
  WHERE tenant_id != v_primary_tenant_id;

  RAISE NOTICE 'User roles migrados exitosamente';
END $$;

COMMIT;
```

### F2.4 — Migrar memberships al tenant principal
```sql
BEGIN;

DO $$
DECLARE
  v_primary_tenant_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  -- Eliminar memberships duplicadas (mismo user ya existe en tenant principal)
  DELETE FROM auth_management.memberships m1
  WHERE m1.tenant_id != v_primary_tenant_id
    AND EXISTS (
      SELECT 1 FROM auth_management.memberships m2
      WHERE m2.user_id = m1.user_id
        AND m2.tenant_id = v_primary_tenant_id
    );

  -- Migrar memberships restantes
  UPDATE auth_management.memberships
  SET tenant_id = v_primary_tenant_id,
      updated_at = NOW()
  WHERE tenant_id != v_primary_tenant_id;

  RAISE NOTICE 'Memberships migradas exitosamente';
END $$;

COMMIT;
```

### F2.5 — Migrar sesiones al tenant principal
```sql
BEGIN;

UPDATE auth_management.user_sessions
SET tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE tenant_id != 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

COMMIT;
```

### F2.6 — Migrar tablas adicionales con tenant_id directo
```sql
BEGIN;

DO $$
DECLARE
  v_tid UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  -- social_features.schools
  UPDATE social_features.schools SET tenant_id = v_tid WHERE tenant_id != v_tid;

  -- social_features.classrooms
  UPDATE social_features.classrooms SET tenant_id = v_tid WHERE tenant_id != v_tid;

  -- social_features.teams
  UPDATE social_features.teams SET tenant_id = v_tid WHERE tenant_id != v_tid;

  -- social_features.teacher_classrooms
  UPDATE social_features.teacher_classrooms SET tenant_id = v_tid WHERE tenant_id != v_tid;

  -- social_features.teacher_reports
  UPDATE social_features.teacher_reports SET tenant_id = v_tid WHERE tenant_id != v_tid;

  -- gamification_system (tablas con tenant_id)
  UPDATE gamification_system.user_stats SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;
  UPDATE gamification_system.user_ranks SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;
  UPDATE gamification_system.achievements SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;
  UPDATE gamification_system.shop_items SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;
  UPDATE gamification_system.shop_categories SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;
  UPDATE gamification_system.ml_coins_transactions SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;

  -- progress_tracking (tablas con tenant_id)
  UPDATE progress_tracking.learning_sessions SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;
  UPDATE progress_tracking.certificates SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;

  -- system_configuration
  UPDATE system_configuration.system_settings SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;
  UPDATE system_configuration.tenant_configurations SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;

  -- audit_logging
  UPDATE audit_logging.audit_logs SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;
  UPDATE audit_logging.user_activity_logs SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;

  -- content_management
  UPDATE content_management.content_templates SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;

  -- educational_content
  UPDATE educational_content.modules SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;

  -- admin_dashboard
  UPDATE admin_dashboard.admin_reports SET tenant_id = v_tid WHERE tenant_id IS NOT NULL AND tenant_id != v_tid;

  RAISE NOTICE 'Todas las tablas adicionales migradas al tenant principal';
END $$;

COMMIT;
```

### F2.7 — Verificacion post-migracion de tenants
```sql
-- VERIFICACION: No deberia haber datos en tenants no-principales
SELECT
  t.id,
  t.name,
  t.slug,
  (SELECT COUNT(*) FROM auth_management.profiles p WHERE p.tenant_id = t.id) AS profiles,
  (SELECT COUNT(*) FROM auth_management.memberships m WHERE m.tenant_id = t.id) AS memberships,
  (SELECT COUNT(*) FROM auth_management.user_roles ur WHERE ur.tenant_id = t.id) AS user_roles,
  (SELECT COUNT(*) FROM social_features.schools s WHERE s.tenant_id = t.id) AS schools
FROM auth_management.tenants t
WHERE t.slug != 'gamilit-platform'
ORDER BY t.name;

-- RESULTADO ESPERADO: Todas las columnas de conteo = 0
```

**Gate F2:** NO continuar hasta que la verificacion muestre 0 datos en tenants espurios.

---

## FASE 3: NORMALIZACION SCHOOL / CLASSROOM / TEACHER

**Objetivo:** Asegurar que existe 1 school, 1 classroom, 1 teacher y todos los alumnos asignados.

### F3.1 — Verificar/Crear school default
```sql
DO $$
DECLARE
  v_tid UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_school_id UUID;
BEGIN
  -- Verificar si existe la escuela default
  SELECT id INTO v_school_id
  FROM social_features.schools
  WHERE code = 'GAMILIT-DEFAULT' AND is_active = true;

  IF v_school_id IS NULL THEN
    -- Crear escuela default (ejecutar seed 00-schools-default.sql)
    INSERT INTO social_features.schools (
      id, tenant_id, name, code, short_name, description,
      country, email, grade_levels, max_students, max_teachers,
      is_active, is_verified, settings, metadata
    ) VALUES (
      '99999999-9999-9999-9999-999999999999', v_tid,
      'GAMILIT - Institucion General', 'GAMILIT-DEFAULT', 'GAMILIT',
      'Institucion principal de GAMILIT. Todos los usuarios registrados pertenecen a esta institucion.',
      'Mexico', 'sistema@gamilit.com',
      ARRAY['todos'], 9999, 999, true, true,
      '{"is_system": true, "is_default": true, "auto_assignment": true}'::jsonb,
      '{"system_school": true, "is_default": true, "is_primary": true}'::jsonb
    )
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name, is_active = true, is_verified = true,
      settings = EXCLUDED.settings, metadata = EXCLUDED.metadata;

    RAISE NOTICE 'Escuela default CREADA';
  ELSE
    RAISE NOTICE 'Escuela default YA EXISTE: %', v_school_id;
  END IF;
END $$;
```

### F3.2 — Eliminar schools espurias
```sql
-- Primero ver si hay schools que no son la default
SELECT id, name, code, tenant_id, is_active
FROM social_features.schools
WHERE code != 'GAMILIT-DEFAULT' OR code IS NULL;

-- Si hay escuelas espurias, mover sus classrooms a la escuela default
UPDATE social_features.classrooms
SET school_id = '99999999-9999-9999-9999-999999999999'
WHERE school_id IN (
  SELECT id FROM social_features.schools
  WHERE code != 'GAMILIT-DEFAULT' OR code IS NULL
);

-- Luego eliminar escuelas espurias
DELETE FROM social_features.schools
WHERE code != 'GAMILIT-DEFAULT' OR code IS NULL;
```

### F3.3 — Asignar school_id a todos los perfiles
```sql
-- Asignar escuela default a todos los perfiles que no la tengan
UPDATE auth_management.profiles
SET school_id = '99999999-9999-9999-9999-999999999999',
    updated_at = NOW()
WHERE (school_id IS NULL OR school_id != '99999999-9999-9999-9999-999999999999')
  AND deleted_at IS NULL;
```

### F3.4 — Verificar/Crear teacher default
```sql
DO $$
DECLARE
  v_teacher_id UUID;
  v_tid UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  -- Buscar maestro default
  SELECT id INTO v_teacher_id
  FROM auth_management.profiles
  WHERE email = 'teacher@gamilit.com'
    AND role = 'admin_teacher'
    AND deleted_at IS NULL;

  IF v_teacher_id IS NULL THEN
    -- Buscar cualquier admin_teacher activo
    SELECT id INTO v_teacher_id
    FROM auth_management.profiles
    WHERE role = 'admin_teacher'
      AND tenant_id = v_tid
      AND deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_teacher_id IS NULL THEN
      RAISE WARNING 'No se encontro ningun maestro. Se debe crear uno manualmente.';
    ELSE
      RAISE NOTICE 'Usando maestro existente: %', v_teacher_id;
    END IF;
  ELSE
    RAISE NOTICE 'Maestro default encontrado: % (teacher@gamilit.com)', v_teacher_id;
  END IF;
END $$;
```

### F3.5 — Verificar/Crear classroom default
```sql
DO $$
DECLARE
  v_tid UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_school_id UUID := '99999999-9999-9999-9999-999999999999';
  v_classroom_id UUID;
  v_teacher_id UUID;
BEGIN
  -- Obtener teacher_id
  SELECT id INTO v_teacher_id
  FROM auth_management.profiles
  WHERE role IN ('admin_teacher', 'super_admin')
    AND tenant_id = v_tid
    AND deleted_at IS NULL
  ORDER BY
    CASE WHEN email = 'teacher@gamilit.com' THEN 0 ELSE 1 END,
    created_at ASC
  LIMIT 1;

  -- Verificar classroom default
  SELECT id INTO v_classroom_id
  FROM social_features.classrooms
  WHERE code = 'DEFAULT' AND is_active = true;

  IF v_classroom_id IS NULL THEN
    INSERT INTO social_features.classrooms (
      id, school_id, tenant_id, teacher_id, name, code,
      grade_level, section, subject, description, capacity,
      is_active, settings, metadata
    ) VALUES (
      'a0000000-0000-4000-a000-000000000001',
      v_school_id, v_tid, v_teacher_id,
      'GAMILIT - Aula General', 'DEFAULT',
      'todos', 'GENERAL', 'General',
      'Aula general de GAMILIT. Todos los estudiantes son asignados automaticamente.',
      999, true,
      '{"is_system_classroom": true, "enable_gamification": true}'::jsonb,
      '{"is_default": true, "system_classroom": true, "auto_assignment": true}'::jsonb
    )
    ON CONFLICT (code) DO UPDATE SET
      school_id = EXCLUDED.school_id,
      teacher_id = EXCLUDED.teacher_id,
      name = EXCLUDED.name,
      is_active = true,
      settings = EXCLUDED.settings,
      metadata = EXCLUDED.metadata;

    RAISE NOTICE 'Classroom default CREADO';
  ELSE
    -- Actualizar teacher_id si es necesario
    UPDATE social_features.classrooms
    SET teacher_id = v_teacher_id
    WHERE id = v_classroom_id AND teacher_id IS DISTINCT FROM v_teacher_id;

    RAISE NOTICE 'Classroom default YA EXISTE: %', v_classroom_id;
  END IF;
END $$;
```

### F3.6 — Inscribir TODOS los alumnos en el aula default
```sql
DO $$
DECLARE
  v_classroom_id UUID;
  v_enrolled INTEGER := 0;
  v_student RECORD;
BEGIN
  -- Obtener classroom default
  SELECT id INTO v_classroom_id
  FROM social_features.classrooms
  WHERE code = 'DEFAULT' AND is_active = true;

  IF v_classroom_id IS NULL THEN
    RAISE EXCEPTION 'Classroom DEFAULT no encontrado';
  END IF;

  -- Inscribir estudiantes que no estan en el aula
  FOR v_student IN
    SELECT p.id, p.email
    FROM auth_management.profiles p
    WHERE p.role = 'student'
      AND p.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM social_features.classroom_members cm
        WHERE cm.classroom_id = v_classroom_id
          AND cm.student_id = p.id
          AND cm.status = 'active'
      )
  LOOP
    INSERT INTO social_features.classroom_members (
      classroom_id, student_id, enrollment_date,
      enrollment_method, status, is_active
    ) VALUES (
      v_classroom_id, v_student.id, NOW(),
      'admin_add', 'active', true
    )
    ON CONFLICT (classroom_id, student_id) DO UPDATE SET
      status = 'active',
      is_active = true,
      updated_at = NOW();

    v_enrolled := v_enrolled + 1;
  END LOOP;

  RAISE NOTICE 'Estudiantes inscritos en aula default: %', v_enrolled;

  -- Nota: El trigger trg_update_classroom_count actualizara automaticamente
  -- current_students_count del classroom
END $$;
```

### F3.7 — Crear entry en teacher_classrooms para el maestro
```sql
DO $$
DECLARE
  v_classroom_id UUID;
  v_teacher_id UUID;
  v_tid UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  SELECT id INTO v_classroom_id FROM social_features.classrooms WHERE code = 'DEFAULT';

  SELECT teacher_id INTO v_teacher_id FROM social_features.classrooms WHERE id = v_classroom_id;

  -- Verificar/crear entrada en teacher_classrooms
  INSERT INTO social_features.teacher_classrooms (
    teacher_id, classroom_id, tenant_id, role, assigned_at
  ) VALUES (
    v_teacher_id, v_classroom_id, v_tid, 'owner', NOW()
  )
  ON CONFLICT (teacher_id, classroom_id) DO UPDATE SET
    role = 'owner';

  RAISE NOTICE 'Teacher-classroom asignacion verificada';
END $$;
```

### F3.8 — Verificacion post-normalizacion
```sql
-- Verificacion final de F3
SELECT 'Schools' AS objeto, COUNT(*) AS total,
  SUM(CASE WHEN code = 'GAMILIT-DEFAULT' THEN 1 ELSE 0 END) AS default_count
FROM social_features.schools WHERE is_active = true

UNION ALL

SELECT 'Classrooms', COUNT(*),
  SUM(CASE WHEN code = 'DEFAULT' THEN 1 ELSE 0 END)
FROM social_features.classrooms WHERE is_active = true AND is_deleted = false

UNION ALL

SELECT 'Classroom Members', COUNT(*), COUNT(*)
FROM social_features.classroom_members
WHERE classroom_id = (SELECT id FROM social_features.classrooms WHERE code = 'DEFAULT')
  AND status = 'active'

UNION ALL

SELECT 'Estudiantes sin aula', COUNT(*), 0
FROM auth_management.profiles p
WHERE p.role = 'student' AND p.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM social_features.classroom_members cm
    WHERE cm.student_id = p.id AND cm.status = 'active'
  );
```

**Gate F3:** Verificar:
- [ ] Exactamente 1 school activa (GAMILIT-DEFAULT)
- [ ] Exactamente 1 classroom activo (DEFAULT)
- [ ] 0 estudiantes sin aula
- [ ] Teacher asignado al classroom

---

## FASE 4: LIMPIEZA Y ELIMINACION DE TENANTS ESPURIOS

**Objetivo:** Eliminar tenants vacios que ya no tienen datos.

### F4.1 — Verificacion pre-eliminacion
```sql
-- CRITICAL: Verificar que NINGUN tenant espurio tiene datos residuales
SELECT
  t.id,
  t.name,
  t.slug,
  (SELECT COUNT(*) FROM auth_management.profiles WHERE tenant_id = t.id) AS profiles,
  (SELECT COUNT(*) FROM auth_management.memberships WHERE tenant_id = t.id) AS memberships,
  (SELECT COUNT(*) FROM auth_management.user_roles WHERE tenant_id = t.id) AS roles,
  (SELECT COUNT(*) FROM social_features.schools WHERE tenant_id = t.id) AS schools,
  (SELECT COUNT(*) FROM social_features.classrooms WHERE tenant_id = t.id) AS classrooms
FROM auth_management.tenants t
WHERE t.slug != 'gamilit-platform'
  AND t.deleted_at IS NULL;

-- TODOS los conteos DEBEN ser 0 antes de proceder
```

### F4.2 — Soft-delete de tenants espurios
```sql
-- Soft-delete (marcar como eliminados, no borrar fisicamente)
UPDATE auth_management.tenants
SET deleted_at = NOW(),
    is_active = false,
    updated_at = NOW(),
    metadata = metadata || '{"deleted_reason": "tenant_espurio_consolidacion_2026-02-13"}'::jsonb
WHERE slug != 'gamilit-platform'
  AND deleted_at IS NULL;
```

### F4.3 — (Opcional) Hard-delete si no hay dependencias
```sql
-- SOLO si la verificacion F4.1 muestra 0 en todos los conteos
-- Y SOLO despues de confirmar que el soft-delete funciona
DELETE FROM auth_management.tenants
WHERE slug != 'gamilit-platform'
  AND deleted_at IS NOT NULL;
```

### F4.4 — Limpiar tablas de backup
```sql
-- SOLO despues de verificar que todo funciona correctamente
-- Esperar minimo 48 horas antes de eliminar backups
-- DROP TABLE IF EXISTS _backup_tenants;
-- DROP TABLE IF EXISTS _backup_profiles;
-- DROP TABLE IF EXISTS _backup_memberships;
-- DROP TABLE IF EXISTS _backup_user_roles;
-- DROP TABLE IF EXISTS _backup_user_sessions;
-- DROP TABLE IF EXISTS _backup_schools;
-- DROP TABLE IF EXISTS _backup_classrooms;
-- DROP TABLE IF EXISTS _backup_classroom_members;
-- DROP TABLE IF EXISTS _backup_teacher_classrooms;
```

**Gate F4:** Portal admin muestra SOLO 1 organizacion (GAMILIT Platform).

---

## FASE 5: HARDENING BACKEND + FRONTEND

**Objetivo:** Prevenir que el problema se repita en el futuro.

### F5.1 — Backend: Proteger creacion de tenants

**Archivo:** `apps/backend/src/modules/admin/services/admin-organizations.service.ts`

**Accion:** Agregar validacion para prevenir creacion de tenants por usuarios no super_admin:

```typescript
// Validacion adicional en createOrganization()
async createOrganization(createDto: CreateOrganizationDto, userId: string): Promise<OrganizationDto> {
  // Verificar que el usuario es super_admin
  const profile = await this.profileRepo.findOne({ where: { id: userId } });
  if (!profile || profile.role !== 'super_admin') {
    throw new ForbiddenException('Solo super_admin puede crear organizaciones');
  }

  // ... resto del flujo
}
```

### F5.2 — Backend: Agregar TenantGuard al controller

**Archivo:** `apps/backend/src/modules/admin/controllers/admin-organizations.controller.ts`

**Accion:** Agregar `@Roles('super_admin')` al endpoint de creacion:

```typescript
@Post('admin/organizations')
@UseGuards(JwtAuthGuard, AdminGuard)
@Roles('super_admin') // NUEVO: Solo super_admin puede crear organizaciones
async createOrganization(...) { ... }
```

### F5.3 — Backend: Logging de operaciones sobre tenants

Agregar logging a todas las operaciones CRUD de organizaciones para auditar cambios.

### F5.4 — Frontend: Verificar AdminInstitutionsPage

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`

Despues de F4, verificar que:
- La lista muestra solo 1 organizacion
- El boton "Crear Organizacion" solo es visible para super_admin
- El detalle muestra datos correctos

### F5.5 — Frontend: Ocultar boton crear para admin_teacher

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`

```tsx
// Solo super_admin puede crear organizaciones
{user?.role === 'super_admin' && (
  <Button onClick={() => setShowCreateModal(true)}>
    Crear Organizacion
  </Button>
)}
```

**Gate F5:** Build exitoso, lint limpio, funcionalidad verificada.

---

## FASE 6: VALIDACION FINAL

### F6.1 — Verificacion de produccion
```sql
-- Conteo final de estado
SELECT 'Tenants activos' AS check_item, COUNT(*) AS value
FROM auth_management.tenants WHERE is_active = true AND deleted_at IS NULL
UNION ALL
SELECT 'Schools activas', COUNT(*)
FROM social_features.schools WHERE is_active = true
UNION ALL
SELECT 'Classrooms activos', COUNT(*)
FROM social_features.classrooms WHERE is_active = true AND is_deleted = false
UNION ALL
SELECT 'Total usuarios', COUNT(*)
FROM auth_management.profiles WHERE deleted_at IS NULL
UNION ALL
SELECT 'Usuarios en tenant principal', COUNT(*)
FROM auth_management.profiles
WHERE tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' AND deleted_at IS NULL
UNION ALL
SELECT 'Alumnos en aula default', COUNT(*)
FROM social_features.classroom_members cm
JOIN social_features.classrooms c ON c.id = cm.classroom_id
WHERE c.code = 'DEFAULT' AND cm.status = 'active';
```

### F6.2 — Resultado esperado

| Check | Valor Esperado |
|-------|----------------|
| Tenants activos | 1 |
| Schools activas | 1 |
| Classrooms activos | 1 |
| Total usuarios | N (todos) |
| Usuarios en tenant principal | N (= total) |
| Alumnos en aula default | M (= total students) |

### F6.3 — Tests end-to-end
- [ ] Login como admin → Portal admin muestra 1 organizacion
- [ ] Login como maestro → Ve 1 aula con todos los alumnos
- [ ] Registrar nuevo usuario → Asignado a tenant principal + aula default
- [ ] API GET /admin/organizations → Retorna 1 organizacion

### F6.4 — Limpieza post-verificacion (despues de 48 horas)
- [ ] Eliminar tablas _backup_*
- [ ] Actualizar PROXIMA-ACCION.md
- [ ] Actualizar inventarios

---

## TIMELINE ESTIMADO

| Fase | Duracion | Bloqueante |
|------|----------|------------|
| F0 | 15-30 min | Acceso a BD prod |
| F1 | 10-15 min | N/A |
| F2 | 20-30 min | Gate F1 |
| F3 | 15-20 min | Gate F2 |
| F4 | 5-10 min | Gate F3 |
| F5 | 30-60 min | Gate F4 |
| **Total** | **~2-3 horas** | |

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| CASCADE delete destruye datos | Baja (si se sigue el plan) | CRITICO | Backup + migracion primero |
| Conflicto UNIQUE al migrar | Media | Bajo | Delete duplicados antes |
| Trigger falla al inscribir | Baja | Medio | Verificar trigger existe |
| Frontend cache muestra datos viejos | Media | Bajo | Hard refresh |
| Sesiones invalidas post-migracion | Media | Bajo | Auto-refresh tokens |

---

*Archivo complementario: 01-ANALISIS-DIAGNOSTICO.md (queries y mapa de dependencias)*
*Siguiente paso: Ejecutar F0 (Diagnostico en produccion)*
