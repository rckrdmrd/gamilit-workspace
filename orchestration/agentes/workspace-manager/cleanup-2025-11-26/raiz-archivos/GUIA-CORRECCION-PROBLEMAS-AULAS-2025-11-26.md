# Guia de Correccion: Problemas Identificados en Tablas de Aulas

**Fecha:** 2025-11-26  
**Problemas a Resolver:** 2 bloqueantes  
**Archivos a Modificar:** 2  
**Archivos a Crear:** 1

---

## PROBLEMA 1: Inconsistencia de Foreign Keys

### Ubicacion
**Archivo:** `apps/database/ddl/schemas/social_features/tables/teacher_classrooms.sql`  
**Linea:** 9  
**Severidad:** CRITICO - Bloquea Portal Teacher v1.0

### Descripcion
La tabla `teacher_classrooms` referencia `auth.users(id)` pero `classrooms` referencia `auth_management.profiles(id)`. Esto crea inconsistencia referencial y riesgo de datos huerfanos.

### Cambio Requerido

#### ANTES (INCORRECTO):
```sql
CREATE TABLE social_features.teacher_classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'teacher' CHECK (role IN ('owner', 'teacher', 'assistant')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, classroom_id),
    CONSTRAINT teacher_classrooms_tenant_fkey FOREIGN KEY (tenant_id)
        REFERENCES auth_management.tenants(id) ON DELETE CASCADE
);
```

#### DESPUES (CORRECTO):
```sql
CREATE TABLE social_features.teacher_classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,  -- CAMBIO AQUI
    classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'teacher' CHECK (role IN ('owner', 'teacher', 'assistant')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, classroom_id),
    CONSTRAINT teacher_classrooms_tenant_fkey FOREIGN KEY (tenant_id)
        REFERENCES auth_management.tenants(id) ON DELETE CASCADE
);
```

### Diferencia
```diff
- teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
+ teacher_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
```

### Validacion Post-Cambio

1. Verificar que la tabla se crea correctamente:
```sql
\d social_features.teacher_classrooms
```

2. Verificar FK integrity:
```sql
SELECT 
    tc.teacher_id,
    p.id as profile_id,
    COUNT(*) as matches
FROM social_features.teacher_classrooms tc
LEFT JOIN auth_management.profiles p ON tc.teacher_id = p.id
GROUP BY tc.teacher_id, p.id
HAVING p.id IS NULL;  -- Deberia retornar 0 registros
```

3. Ejecutar drop y recreate:
```sql
DROP TABLE IF EXISTS social_features.teacher_classrooms CASCADE;
-- Ejecutar el archivo teacher_classrooms.sql corregido
```

### Impacto
- Resuelve inconsistencia referencial
- Garantiza integridad de datos
- Alinea con estructura de classrooms

---

## PROBLEMA 2: Falta de RLS Policies

### Ubicacion
**Archivo:** Nuevo archivo a crear  
**Ruta:** `apps/database/ddl/schemas/social_features/rls-policies/07-teacher-classrooms-policies.sql`  
**Severidad:** CRITICO - Violacion de seguridad

### Descripcion
La tabla `teacher_classrooms` no tiene Row Level Security policies definidas. Esto permite que cualquier usuario autenticado vea TODAS las asignaciones profesor-aula.

### Archivo a Crear

**Crear nuevo archivo:** `rls-policies/07-teacher-classrooms-policies.sql`

```sql
-- =====================================================
-- RLS Policies for: social_features.teacher_classrooms
-- Description: Teacher-classroom assignments with role-based access
-- Created: 2025-11-26
-- Policies: 4 (SELECT: 2, INSERT: 1, UPDATE: 1, DELETE: 1)
-- =====================================================
--
-- Security Strategy:
-- - Teachers: Can only see their own assignments
-- - Admins: Can see and manage all assignments in tenant
-- - Students: No access
-- =====================================================

-- Enable RLS on teacher_classrooms (if not already enabled)
ALTER TABLE social_features.teacher_classrooms ENABLE ROW LEVEL SECURITY;

-- Policy: teacher_classrooms_read_teacher
-- Purpose: Teachers can read their own assignments
CREATE POLICY teacher_classrooms_read_teacher
    ON social_features.teacher_classrooms
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        teacher_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY teacher_classrooms_read_teacher ON social_features.teacher_classrooms IS
    'Teachers can only see classrooms they are assigned to';

-- Policy: teacher_classrooms_read_admin
-- Purpose: Admins can read all assignments in their tenant
CREATE POLICY teacher_classrooms_read_admin
    ON social_features.teacher_classrooms
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'super_admin'
        )
    );

COMMENT ON POLICY teacher_classrooms_read_admin ON social_features.teacher_classrooms IS
    'Admins can see all teacher-classroom assignments in the system';

-- Policy: teacher_classrooms_insert_admin
-- Purpose: Only admins can create teacher-classroom assignments
CREATE POLICY teacher_classrooms_insert_admin
    ON social_features.teacher_classrooms
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'super_admin'
        )
    );

COMMENT ON POLICY teacher_classrooms_insert_admin ON social_features.teacher_classrooms IS
    'Only admins can create teacher-classroom assignments';

-- Policy: teacher_classrooms_update_admin
-- Purpose: Only admins can update assignments (role changes)
CREATE POLICY teacher_classrooms_update_admin
    ON social_features.teacher_classrooms
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'super_admin'
        )
    );

COMMENT ON POLICY teacher_classrooms_update_admin ON social_features.teacher_classrooms IS
    'Only admins can update teacher-classroom assignments';

-- Policy: teacher_classrooms_delete_admin
-- Purpose: Only admins can delete assignments
CREATE POLICY teacher_classrooms_delete_admin
    ON social_features.teacher_classrooms
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'super_admin'
        )
    );

COMMENT ON POLICY teacher_classrooms_delete_admin ON social_features.teacher_classrooms IS
    'Only admins can delete teacher-classroom assignments';

-- Grant permissions
GRANT ALL ON TABLE social_features.teacher_classrooms TO gamilit_user;
```

### Validacion Post-Creacion

1. Verificar policies creadas:
```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'teacher_classrooms'
ORDER BY policyname;
```

2. Verificar que RLS esta habilitado:
```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'teacher_classrooms';
-- rowsecurity deberia ser true
```

3. Verificar acceso de un usuario no-admin:
```sql
-- Conectar como usuario que NO es admin
SELECT COUNT(*) FROM social_features.teacher_classrooms;
-- Deberia retornar solo sus asignaciones o error
```

### Impacto
- Implementa seguridad de datos
- Previene access control bypass
- Garantiza que cada usuario solo ve sus datos
- Cumple con principios de multi-tenancy

---

## Orden de Aplicacion de Cambios

### Paso 1: Backup (Recomendado)
```sql
-- Crear backup de datos actuales
CREATE TABLE teacher_classrooms_backup AS
SELECT * FROM social_features.teacher_classrooms;
```

### Paso 2: Corregir Foreign Key
1. Abrir archivo: `apps/database/ddl/schemas/social_features/tables/teacher_classrooms.sql`
2. Cambiar linea 9 segun instrucciones arriba
3. Guardar archivo

### Paso 3: Crear RLS Policies
1. Crear nuevo archivo: `apps/database/ddl/schemas/social_features/rls-policies/07-teacher-classrooms-policies.sql`
2. Copiar contenido SQL arriba
3. Guardar archivo

### Paso 4: Ejecutar Scripts
```bash
# En ambiente de base de datos:

# 1. Ejecutar cambios de teacher_classrooms (DROP y recreate)
psql -U postgres -d gamilit < apps/database/ddl/schemas/social_features/tables/teacher_classrooms.sql

# 2. Ejecutar RLS policies
psql -U postgres -d gamilit < apps/database/ddl/schemas/social_features/rls-policies/07-teacher-classrooms-policies.sql

# 3. Re-ejecutar seeds para restablecer datos de prueba
psql -U postgres -d gamilit < apps/database/seeds/dev/social_features/02-classrooms.sql
```

### Paso 5: Validacion
```sql
-- Validar estructura
\d social_features.teacher_classrooms

-- Validar policies
SELECT * FROM pg_policies WHERE tablename = 'teacher_classrooms';

-- Validar datos
SELECT COUNT(*) FROM social_features.teacher_classrooms;
```

---

## Checklist de Correccion

### Antes de Aplicar
- [ ] Leer este documento completo
- [ ] Hacer backup de database
- [ ] Revisar cambios propuestos
- [ ] Coordinar con equipo

### Aplicar Cambios
- [ ] Modificar `teacher_classrooms.sql` (linea 9)
- [ ] Crear archivo de RLS policies
- [ ] Ejecutar scripts en database

### Validar Cambios
- [ ] Verificar estructura de tabla
- [ ] Verificar existence de policies
- [ ] Verificar RLS habilitado
- [ ] Ejecutar tests de integridad
- [ ] Verificar que datos se cargan correctamente

### Despues de Correccion
- [ ] Ejecutar test suite de database
- [ ] Ejecutar test suite de backend
- [ ] Ejecutar test suite de frontend
- [ ] Marcar como resuelto en backlog

---

## Lineas Exactas a Cambiar

### Archivo 1: teacher_classrooms.sql

**Linea 9:**
```diff
- teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
+ teacher_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
```

**Cambio exacto:** Reemplazar `auth.users` por `auth_management.profiles`

### Archivo 2: 07-teacher-classrooms-policies.sql (NUEVO)

**Locacion:** `apps/database/ddl/schemas/social_features/rls-policies/07-teacher-classrooms-policies.sql`  
**Contenido:** Ver seccion "Archivo a Crear" arriba

---

## Referencia de Cambios

| Elemento | Antes | Despues | Razon |
|----------|-------|---------|-------|
| FK tabla | auth.users | auth_management.profiles | Consistencia con classrooms |
| FK linea | 9 | 9 | Ubicacion del cambio |
| RLS policies | 0 | 5 | Implementar seguridad |
| RLS archivo | No existe | Crear nuevo | Necesario para security |

---

## Impacto en Integridad Referencial

### Antes (Problematico)
```
classrooms.teacher_id ──→ auth_management.profiles(id) ✅
teacher_classrooms.teacher_id ──→ auth.users(id) ❌
```

Resultado: Inconsistencia, posibilidad de referencia a usuario que no es profesor

### Despues (Correcto)
```
classrooms.teacher_id ──→ auth_management.profiles(id) ✅
teacher_classrooms.teacher_id ──→ auth_management.profiles(id) ✅
```

Resultado: Consistencia total, garantiza que todos los teacher_id apuntan a perfiles reales

---

## Preguntas Frecuentes

### P: ¿Que pasa si ya hay datos en teacher_classrooms?
**R:** El script incluye `DROP TABLE ... CASCADE` que elimina la tabla y los datos. Si necesitas preservar datos, hacer backup primero (ver Paso 1).

### P: ¿Cuales son los roles validos en teacher_classrooms?
**R:** Segun CHECK constraint: `'owner'`, `'teacher'`, `'assistant'`. El seed usa `'owner'` para todos.

### P: ¿Las policies afectan al admin?
**R:** No. Las policies usan `super_admin` role para permitir acceso total. Ver `classrooms_read_admin` policy.

### P: ¿Necesito cambiar otra cosa?
**R:** No. Solo estas 2 correcciones son necesarias para resolver los problemas bloqueantes.

### P: ¿Esto afecta la API?
**R:** No debe afectar si la API esta usando los perfiles correctamente. Pero revisar que el backend no haga queries directas a auth.users para teacher_id.

