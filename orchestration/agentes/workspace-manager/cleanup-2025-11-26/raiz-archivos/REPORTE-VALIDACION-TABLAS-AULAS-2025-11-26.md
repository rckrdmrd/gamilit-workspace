# REPORTE DE VALIDACION: Estructura de Tablas de Aulas - Portal Teacher

Fecha de validacion: 2025-11-26
Entorno: /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit

---

## RESUMEN EJECUTIVO

Se validaron 2 tablas criticas para el Portal Teacher:
1. **social_features.classrooms** - Gestion de aulas virtuales
2. **social_features.teacher_classrooms** - Relacion profesor-aula (many-to-many)

Estado General: ⚠️ PARCIALMENTE VALIDO CON PROBLEMAS IDENTIFICADOS

---

## 1. TABLA: social_features.classrooms

### 1.1 Estado General
✅ **TABLA EXISTE Y ESTA BIEN DEFINIDA**

**Archivo DDL:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables/03-classrooms.sql`

### 1.2 Columnas Principales y Tipos

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| **id** | uuid | NO | gen_random_uuid() |
| **school_id** | uuid | SI | NULL |
| **tenant_id** | uuid | NO | NULL |
| **name** | text | NO | NULL |
| **code** | text | SI | NULL |
| **description** | text | SI | NULL |
| **grade_level** | text | SI | NULL |
| **section** | text | SI | NULL |
| **subject** | text | SI | NULL |
| **academic_year** | text | SI | NULL |
| **semester** | text | SI | NULL |
| **teacher_id** | uuid | NO | NULL |
| **co_teachers** | uuid[] | SI | NULL |
| **capacity** | integer | SI | 40 |
| **current_students_count** | integer | SI | 0 |
| **settings** | jsonb | SI | {...} |
| **schedule** | jsonb | SI | '[]' |
| **meeting_url** | text | SI | NULL |
| **is_active** | boolean | SI | true |
| **is_archived** | boolean | SI | false |
| **is_deleted** | boolean | SI | false |
| **start_date** | date | SI | NULL |
| **end_date** | date | SI | NULL |
| **metadata** | jsonb | SI | '{}' |
| **created_at** | timestamp with timezone | SI | gamilit.now_mexico() |
| **updated_at** | timestamp with timezone | SI | gamilit.now_mexico() |

### 1.3 Constraints

#### Primary Key
- ✅ `classrooms_pkey` en columna `id`

#### Unique Constraints
- ✅ `classrooms_code_key` en columna `code`

#### Foreign Keys
| Constraint | Columna | Referencia | Action |
|-----------|---------|-----------|--------|
| classrooms_school_id_fkey | school_id | social_features.schools(id) | ON DELETE CASCADE |
| classrooms_teacher_id_fkey | teacher_id | **auth_management.profiles(id)** | ON DELETE RESTRICT |
| classrooms_tenant_id_fkey | tenant_id | auth_management.tenants(id) | ON DELETE CASCADE |

### 1.4 Indices Definidos
- ✅ `idx_classrooms_active` - ON is_active WHERE is_active = true
- ✅ `idx_classrooms_not_deleted` - ON created_at DESC WHERE is_deleted = false
- ✅ `idx_classrooms_code` - ON code
- ✅ `idx_classrooms_school` - ON school_id
- ✅ `idx_classrooms_teacher` - ON teacher_id

### 1.5 RLS Policies
**Archivo:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/rls-policies/03-classrooms-policies.sql`

| Policy | Type | Condition |
|--------|------|-----------|
| classrooms_read_student | SELECT | Student in classroom_members |
| classrooms_read_teacher | SELECT | teacher_id = current_user_id |
| classrooms_read_admin | SELECT | User has super_admin role |
| classrooms_insert_teacher | INSERT | teacher_id = current_user_id AND admin_teacher role |
| classrooms_update_teacher | UPDATE | teacher_id = current_user_id |

### 1.6 Datos de Prueba (Dev)
✅ **DATOS DISPONIBLES**

**Archivo:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/seeds/dev/social_features/02-classrooms.sql`

**Registros de ejemplo:**
- 7 aulas creadas en total
- 3 escuelas distintas:
  - SF-015-CDMX: 3 aulas (2° A, 3° B, 1° C)
  - ST-042-NL: 2 aulas (1° A, 2° B)
  - CP-AE-JAL: 2 aulas (2° STEAM, 3° Advanced)

---

## 2. TABLA: social_features.teacher_classrooms

### 2.1 Estado General
❌ **TABLA EXISTE PERO CON PROBLEMA CRITICO DE REFERENCIA FOREIGN KEY**

**Archivo DDL:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables/teacher_classrooms.sql`

### 2.2 Columnas Principales y Tipos

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| **id** | UUID | NO | gen_random_uuid() |
| **teacher_id** | UUID | NO | NULL |
| **classroom_id** | UUID | NO | NULL |
| **tenant_id** | UUID | NO | NULL |
| **role** | VARCHAR(50) | NO | 'teacher' |
| **assigned_at** | timestamp with timezone | SI | CURRENT_TIMESTAMP |
| **created_at** | timestamp with timezone | SI | CURRENT_TIMESTAMP |

### 2.3 Constraints

#### Primary Key
- ✅ `id` (PRIMARY KEY DEFAULT gen_random_uuid())

#### Unique Constraints
- ✅ UNIQUE(teacher_id, classroom_id)

#### Check Constraints
- ✅ `role` IN ('owner', 'teacher', 'assistant')

#### Foreign Keys
| Constraint | Columna | Referencia | Status |
|-----------|---------|-----------|--------|
| teacher_classrooms_teacher_id_fkey | teacher_id | **auth.users(id)** | ❌ PROBLEMA |
| (sin nombre) | classroom_id | social_features.classrooms(id) | ✅ OK |
| teacher_classrooms_tenant_fkey | tenant_id | auth_management.tenants(id) | ✅ OK |

### 2.4 Indices Definidos
- ✅ `idx_teacher_classrooms_teacher_id` - ON teacher_id
- ✅ `idx_teacher_classrooms_classroom_id` - ON classroom_id
- ✅ `idx_teacher_classrooms_role` - ON role
- ✅ `idx_teacher_classrooms_tenant_id` - ON tenant_id

### 2.5 RLS Policies
❌ **NO DEFINIDAS**

No se encontraron RLS policies para la tabla teacher_classrooms.

### 2.6 Datos de Prueba
✅ **SINCRONIZACION AUTOMATICA IMPLEMENTADA**

En el seed de classrooms (02-classrooms.sql) existe sincronizacion:

```sql
INSERT INTO social_features.teacher_classrooms (id, teacher_id, classroom_id, tenant_id, role, assigned_at, created_at)
SELECT
    gen_random_uuid(),
    c.teacher_id,
    c.id,
    c.tenant_id,
    'owner',
    c.created_at,
    NOW()
FROM social_features.classrooms c
WHERE c.teacher_id IS NOT NULL
ON CONFLICT DO NOTHING;
```

---

## 3. PROBLEMAS IDENTIFICADOS

### CRITICO - Inconsistencia de Foreign Keys (BLOQUEANTE)

#### PROBLEMA 1: teacher_classrooms.teacher_id referencia incorrecta

**Ubicacion:** `teacher_classrooms.sql:9`
```sql
teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
```

**Issue:**
- La tabla `teacher_classrooms` referencia `auth.users(id)`
- La tabla `classrooms` referencia `auth_management.profiles(id)`
- Esto crea inconsistencia en el modelo: ¿Cual es la fuente de verdad para profesores?

**Schemas Involucrados:**
- `auth.users` - Tabla de autenticacion (schema `auth`)
- `auth_management.profiles` - Tabla de perfiles de usuario (schema `auth_management`)

**Impacto:**
- Integridad referencial comprometida si existen registros en teacher_classrooms pero no en classrooms
- Problemas con cascada de deletes
- Riesgo de huerfandad de datos

### CRITICO - Falta de RLS Policies para teacher_classrooms

**Ubicacion:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/rls-policies/`

**Issue:**
- La tabla `teacher_classrooms` NO tiene policies de Row Level Security definidas
- Esto significa que:
  - Cualquier usuario autenticado podria leer TODAS las asignaciones profesor-aula
  - Falta control de acceso granular por tenant
  - Violacion de principio de seguridad

**Recomendacion:**
Crear archivo `/rls-policies/07-teacher-classrooms-policies.sql` con:
- Policy SELECT para que profesores vean sus propias asignaciones
- Policy SELECT para admins
- Policy INSERT/UPDATE/DELETE para admins

### MEDIO - Falta de columna user_id en classroom_members

En los seeds se intenta hacer UPDATE con `user_id` pero la tabla usa `student_id`:

```sql
-- Seed (linea 290): Intenta usar user_id
ON CONFLICT (classroom_id, user_id) DO UPDATE SET...

-- Tabla definition: usa student_id
```

---

## 4. VALIDACION CHECKLIST

### Tabla: social_features.classrooms
- ✅ Archivo DDL existe
- ✅ Columnas definidas correctamente
- ✅ Primary key configurada
- ✅ Foreign keys definidas
- ⚠️ Foreign key a auth_management.profiles (consistencia cuestionable)
- ✅ Indices definidos (5 indices)
- ✅ RLS policies configuradas (5 policies)
- ✅ Datos de prueba disponibles (7 registros)
- ✅ Soft delete implementado (is_deleted column)

### Tabla: social_features.teacher_classrooms
- ✅ Archivo DDL existe
- ✅ Columnas definidas correctamente
- ✅ Primary key configurada
- ❌ Foreign key a auth.users (INCONSISTENCIA)
- ✅ Indices definidos (4 indices)
- ❌ RLS policies NO DEFINIDAS (CRITICO)
- ✅ Sincronizacion con classrooms implementada
- ❌ Datos solo via sincronizacion, no seeds directos

---

## 5. RECOMENDACIONES

### URGENTE (Para Portal Teacher v1.0)

1. **Resolver inconsistencia de schemas:**
   - Decidir: ¿teacher_id debe venir de auth.users O auth_management.profiles?
   - OPCION A: Cambiar teacher_classrooms para usar auth_management.profiles
   - OPCION B: Cambiar classrooms para usar auth.users
   - Recomendacion: Opcion A (perfiles)

2. **Crear RLS Policies para teacher_classrooms:**
   ```sql
   -- Archivo: rls-policies/07-teacher-classrooms-policies.sql
   -- Contenido: SELECT/INSERT/UPDATE/DELETE policies para admins y profesores
   ```

3. **Validar integridad de seeds:**
   - Verificar que todos los teacher_id en classrooms correspondan a perfiles validos
   - Ejecutar validacion cruzada entre tablas

### IMPORTANTE (Para siguiente version)

4. **Considerar cascade delete strategy:**
   - Actualmente: classrooms.teacher_id tiene ON DELETE RESTRICT
   - teacher_classrooms.teacher_id tiene ON DELETE CASCADE
   - Esto puede crear inconsistencias

5. **Documentar relacion classrooms vs teacher_classrooms:**
   - classrooms.teacher_id = dueno/creador
   - teacher_classrooms = multiples profesores asignados
   - Necesita claridad en backend API

---

## 6. RESUMEN FINAL

| Aspecto | Estado | Notas |
|--------|--------|-------|
| Estructura DDL | ✅ | Bien definida |
| Columnas | ✅ | Completas y tipadas |
| Primary Keys | ✅ | Configuradas correctamente |
| Foreign Keys | ❌ | Inconsistencia de schemas |
| Indices | ✅ | Adecuados |
| RLS Policies | ⚠️ | Incompleto (falta teacher_classrooms) |
| Datos de Prueba | ✅ | Disponibles en dev/prod |
| Integridad | ❌ | Riesgo por FK inconsistente |

**Recomendacion de Go/No-Go:**
- ⚠️ **CONDICIONAL** para Portal Teacher
- Resolver Foreign Key inconsistencia antes de deploy a produccion
- Implementar RLS policies antes de release

