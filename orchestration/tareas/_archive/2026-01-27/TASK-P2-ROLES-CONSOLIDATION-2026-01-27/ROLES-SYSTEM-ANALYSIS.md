# Análisis del Sistema de Roles GAMILIT

**Tarea:** TASK-P2-ROLES-CONSOLIDATION-2026-01-27
**Fecha:** 2026-01-27
**Estado:** ANÁLISIS COMPLETADO
**Gap:** ARCH-P2-001

---

## Resumen Ejecutivo

El sistema de roles de GAMILIT ya opera como un **híbrido funcional** entre ENUM y RBAC tables. No se requiere consolidación inmediata - el sistema actual es coherente y extensible.

**Recomendación:** Mantener el sistema híbrido actual (Opción C).

---

## 1. Sistema ENUM (gamilit_role)

### 1.1 Definición DDL

```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql (línea 85)
-- También: apps/database/ddl/schemas/auth_management/enums/gamilit_role.sql

CREATE TYPE auth_management.gamilit_role AS ENUM (
  'student',        -- Estudiante
  'admin_teacher',  -- Profesor Administrador
  'super_admin'     -- Super Administrador
);
```

### 1.2 Uso en Tablas DDL

| Tabla | Columna | Uso |
|-------|---------|-----|
| `auth.users` | `gamilit_role` | Rol principal del usuario |
| `auth_management.profiles` | `role` | Rol del perfil |
| `auth_management.user_roles` | `role` | Asignación de rol (usa ENUM!) |
| `system_configuration.feature_flags` | `target_roles[]` | Array de roles objetivo |

### 1.3 Uso en RLS Policies

El ENUM es usado extensivamente en políticas RLS via `gamilit.get_current_user_role()`:

```sql
-- Ejemplo: progress_tracking.module_progress
CREATE POLICY module_progress_select_teacher ON progress_tracking.module_progress
FOR SELECT USING (
  gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role
);
```

**Tablas con RLS basado en gamilit_role:**
- `progress_tracking.module_progress`
- `progress_tracking.exercise_attempts`
- `progress_tracking.learning_sessions`
- `progress_tracking.scheduled_missions`
- `progress_tracking.exercise_submissions`
- `progress_tracking.certificates`
- `progress_tracking.teacher_alert_configurations`
- `progress_tracking.student_intervention_alerts`
- `content_management.*` (varios)

### 1.4 Uso en Backend

```typescript
// Ubicación: apps/backend/src/shared/constants/enums.constants.ts (línea 674)
export enum GamilityRoleEnum {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin',
}
```

**Archivos que usan el ENUM (47 archivos):**
- Guards: `shared/guards/roles.guard.ts`, `auth/guards/roles.guard.ts`
- Decorators: `shared/decorators/roles.decorator.ts`
- Controllers: teacher/*, admin/*, assignments/*
- Services: admin-roles.service.ts, admin-users.service.ts
- Entities: user.entity.ts, user-role.entity.ts, role.entity.ts

---

## 2. Sistema RBAC Tables

### 2.1 Tabla `auth_management.roles`

```sql
-- Ubicación: apps/database/ddl/schemas/auth_management/tables/03b-roles.sql

CREATE TABLE auth_management.roles (
    id uuid PRIMARY KEY,
    name varchar(50) UNIQUE NOT NULL,        -- 'student', 'admin_teacher', 'super_admin'
    description text,
    permissions jsonb DEFAULT '{}' NOT NULL, -- Permisos del rol
    is_active boolean DEFAULT true,
    created_at, updated_at timestamps
);
```

**Datos iniciales insertados via DDL:**
```sql
INSERT INTO auth_management.roles (name, description, permissions) VALUES
  ('student', 'Estudiante', '{"can_view_content": true, "can_submit_exercises": true}'),
  ('admin_teacher', 'Profesor', '{"can_create_content": true, "can_manage_classroom": true}'),
  ('super_admin', 'Admin', '{"can_manage_users": true, "can_manage_roles": true, ...}');
```

### 2.2 Tabla `auth_management.user_roles`

```sql
-- Ubicación: apps/database/ddl/schemas/auth_management/tables/04-roles.sql

CREATE TABLE auth_management.user_roles (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES profiles(id),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    role auth_management.gamilit_role NOT NULL,  -- ¡USA EL ENUM!
    permissions jsonb DEFAULT '{"read": true}',  -- Permisos adicionales
    assigned_by uuid,
    assigned_at, expires_at, revoked_at timestamps,
    is_active boolean DEFAULT true
);
```

**Observación crítica:** La tabla `user_roles` usa el ENUM `gamilit_role` para la columna `role`, no una FK a la tabla `roles`. Esto significa que el sistema ya es híbrido.

### 2.3 Backend Entities

**Role Entity:**
```typescript
// apps/backend/src/modules/auth/entities/role.entity.ts
@Entity({ schema: 'auth_management', name: 'roles' })
export class Role {
  @Column({ type: 'varchar', unique: true }) name!: string;
  @Column({ type: 'jsonb' }) permissions!: Record<string, boolean>;
  @ManyToMany(() => User, (user) => user.roles) users?: User[];
}
```

### 2.4 Seeds Existentes

| Archivo | Contenido |
|---------|-----------|
| `dev/auth_management/04-user_roles.sql` | Asignaciones de roles a usuarios |
| `dev/auth_management/07-user_roles.sql` | Asignaciones adicionales |
| `prod/auth_management/07-user_roles.sql` | Asignaciones producción |

---

## 3. Estado Actual: HÍBRIDO

El sistema actual ya opera como híbrido:

```
┌─────────────────────────────────────────────────────────────┐
│                    ENUM (gamilit_role)                      │
│  'student' | 'admin_teacher' | 'super_admin'                │
│                                                             │
│  ✓ Define valores válidos                                   │
│  ✓ Type safety en DDL y Backend                             │
│  ✓ Usado en RLS policies                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │ valores
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                 roles TABLE                                  │
│  name (varchar) | description | permissions (jsonb)         │
│                                                             │
│  ✓ Catálogo de roles con metadata                          │
│  ✓ Permisos granulares por rol                             │
│  ✓ Extensible para futuros roles                           │
└─────────────────┬───────────────────────────────────────────┘
                  │ referencia conceptual
                  ▼
┌─────────────────────────────────────────────────────────────┐
│               user_roles TABLE                               │
│  user_id | tenant_id | role (ENUM) | permissions (jsonb)   │
│                                                             │
│  ✓ Asignaciones de roles a usuarios                        │
│  ✓ Multi-tenant support                                     │
│  ✓ Permisos adicionales por asignación                     │
│  ✓ Historial (assigned_by, assigned_at, revoked_at)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Análisis de Opciones

### Opción A: Mantener Solo ENUM

**Descripción:** Eliminar tablas RBAC, usar solo ENUM.

| Pros | Cons |
|------|------|
| Más simple | Pierde metadata de roles |
| Menos tablas | Pierde permisos granulares |
| | Pierde soporte multi-tenant |
| | Pierde historial de asignaciones |

**Veredicto:** ❌ No recomendado - perdemos funcionalidad existente.

### Opción B: Migrar a RBAC Completo

**Descripción:** Eliminar ENUM, usar solo tablas con FKs.

| Pros | Cons |
|------|------|
| Máxima flexibilidad | Requiere migración compleja |
| Permisos totalmente dinámicos | Breaking changes en RLS |
| | Modifica 47+ archivos backend |
| | Pierde type safety del ENUM |

**Veredicto:** ❌ No recomendado - riesgo alto, beneficio bajo para estado actual.

### Opción C: Mantener Híbrido (ACTUAL)

**Descripción:** Mantener sistema actual sin cambios.

| Pros | Cons |
|------|------|
| Ya funciona | Dos fuentes de verdad conceptuales |
| Type safety (ENUM) | Requiere documentación clara |
| Flexibilidad (tables) | |
| Sin breaking changes | |
| Multi-tenant ready | |
| Permisos extensibles | |

**Veredicto:** ✅ **RECOMENDADO** - Sistema actual es coherente y funcional.

---

## 5. Recomendación Final

### MANTENER SISTEMA HÍBRIDO ACTUAL

**Justificación:**

1. **Ya funciona:** El sistema actual cubre todas las necesidades.

2. **Type Safety:** El ENUM garantiza que solo valores válidos se usan en RLS y código.

3. **Extensibilidad:** La tabla `roles` permite agregar metadata y permisos sin cambiar el ENUM.

4. **Multi-tenant:** La tabla `user_roles` soporta tenants y permisos por asignación.

5. **Bajo riesgo:** No hay cambios de código, no hay migraciones.

### Acciones Recomendadas (FUTURO, NO AHORA)

Si en el futuro se necesitan más roles:

1. **Agregar valor al ENUM:**
   ```sql
   ALTER TYPE auth_management.gamilit_role ADD VALUE 'content_creator';
   ```

2. **Agregar entrada en tabla roles:**
   ```sql
   INSERT INTO auth_management.roles (name, permissions) VALUES
   ('content_creator', '{"can_create_content": true}');
   ```

3. **Actualizar Backend enum:**
   ```typescript
   export enum GamilityRoleEnum {
     // ... existentes
     CONTENT_CREATOR = 'content_creator',
   }
   ```

---

## 6. Conclusión

El "gap" identificado (ARCH-P2-001) no es realmente un problema a resolver - es una **característica del diseño**. El sistema híbrido proporciona:

- **Rigidez donde se necesita** (ENUM para RLS)
- **Flexibilidad donde se necesita** (tablas para metadata)

**Estado:** ARCH-P2-001 cerrado como "by design".

---

*Análisis realizado: 2026-01-27*
*Sistema: SIMCO v4.0.0 + NEXUS v4.0*
