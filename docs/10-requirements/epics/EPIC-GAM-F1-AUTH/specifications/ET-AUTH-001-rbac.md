# ET-AUTH-001: RBAC (Role-Based Access Control)

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-AUTH-001 |
| **Módulo** | Autenticación y Autorización |
| **Tipo** | Especificación Técnica |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha creación** | 2025-11-07 |

## 🔗 Referencias

### Requerimiento Funcional
📄 [RF-AUTH-001: Sistema de Roles de Usuario](../requirements/RF-AUTH-001-roles.md)

### Implementación DDL
🗄️ **Archivos relacionados:**

**ENUM Principal:**
```sql
-- apps/database/ddl/00-prerequisites.sql:30-32
CREATE TYPE auth_management.gamilit_role AS ENUM (
    'student',       -- Estudiante regular
    'admin_teacher', -- Profesor/Administrador
    'super_admin'    -- Super administrador del sistema
);
```

**Tablas:**
- `auth_management.profiles:15` - `role auth_management.gamilit_role NOT NULL`
- `auth.users:15` - `role auth_management.gamilit_role DEFAULT 'student'`
- `system_configuration.feature_flags:20` - `allowed_roles auth_management.gamilit_role[]`

**Funciones:**
- `gamilit.get_current_user_role():196-198` - Retorna rol del usuario en contexto
- `gamilit.is_admin():223-225` - Verifica si usuario es admin

**RLS Policies (7 implementadas):**
1. `progress_tracking.module_progress` → `module_progress_select_teacher`
2. `progress_tracking.learning_sessions` → `learning_sessions_select_teacher`
3. `progress_tracking.exercise_attempts` → `exercise_attempts_select_teacher`
4. `progress_tracking.exercise_submissions` → `exercise_submissions_select_teacher`
5. `educational_content.modules` → `modules_select_teacher`
6. `educational_content.exercises` → `exercises_select_teacher`
7. `gamification_system.user_stats` → `user_stats_select_teacher`

### Mapeo Completo
📊 [Ver en: Mapeo Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-requirements-IMPLEMENTACION.md#11-sistema-de-roles-de-usuario)

---

## 🏗️ Arquitectura de RBAC

### Diseño General

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA FRONTEND                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ RoleBadge   │  │ RoleBasedUI  │  │ ProtectedRoute  │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP + JWT (role claim)
┌────────────────────────▼────────────────────────────────────┐
│                     CAPA BACKEND                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ RolesGuard  │  │ @Roles()     │  │ JwtStrategy     │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
┌────────────────────────▼────────────────────────────────────┐
│                   CAPA DATABASE (PostgreSQL)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  RLS POLICIES (Row Level Security)                   │  │
│  │  - students_view_own_data                            │  │
│  │  - teachers_view_classroom_students                  │  │
│  │  - superadmin_view_all (bypass RLS)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ENUM: auth_management.gamilit_role                  │  │
│  │  VALUES: student | admin_teacher | super_admin       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Matriz de Permisos

### Tabla Detallada de Permisos

| Recurso | Acción | student | admin_teacher | super_admin |
|---------|--------|---------|---------------|-------------|
| **Perfil Propio** |
| Ver perfil | ✅ | ✅ | ✅ |
| Editar perfil | ✅ | ✅ | ✅ |
| Cambiar rol | ❌ | ❌ | ✅ |
| **Progreso** |
| Ver propio progreso | ✅ | ✅ | ✅ |
| Ver progreso de estudiantes | ❌ | ✅ (solo sus aulas) | ✅ |
| Modificar progreso | ❌ | ❌ | ✅ |
| **Contenido Educativo** |
| Ver contenido publicado | ✅ | ✅ | ✅ |
| Ver contenido en draft | ❌ | ✅ (solo propio) | ✅ |
| Crear contenido | ❌ | ✅ | ✅ |
| Editar contenido | ❌ | ✅ (solo propio) | ✅ |
| Aprobar contenido | ❌ | ❌ | ✅ |
| Archivar contenido | ❌ | ❌ | ✅ |
| **Aulas** |
| Unirse a aula | ✅ (con invitación) | ✅ | ✅ |
| Crear aula | ❌ | ✅ | ✅ |
| Gestionar aula | ❌ | ✅ (solo propias) | ✅ |
| Asignar ejercicios | ❌ | ✅ (solo sus aulas) | ✅ |
| **Gamificación** |
| Ver propias estadísticas | ✅ | ✅ | ✅ |
| Ver stats de estudiantes | ❌ | ✅ (solo sus aulas) | ✅ |
| Modificar XP/coins | ❌ | ❌ | ✅ |
| **Sistema** |
| Ver configuración | ❌ | ❌ | ✅ |
| Modificar configuración | ❌ | ❌ | ✅ |
| Ver logs de auditoría | ❌ | ❌ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |

---

## 🔧 Implementación Técnica

### 1. DDL - Definición del ENUM

**Ubicación:** `apps/database/ddl/00-prerequisites.sql:30-32`

```sql
DO $$ BEGIN
    CREATE TYPE auth_management.gamilit_role AS ENUM (
        'student',       -- Estudiante regular
        'admin_teacher', -- Profesor/Administrador
        'super_admin'    -- Super administrador del sistema
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

COMMENT ON TYPE auth_management.gamilit_role IS 'Roles de usuario en la plataforma';
```

**Decisiones de Diseño:**
- ✅ Schema explícito: `auth_management.` (no `public.`)
- ✅ DO block con exception handling para idempotencia
- ✅ Comentario descriptivo para documentación automática
- ✅ Nombres descriptivos en inglés (consistencia con codebase)

---

### 2. Tabla: auth_management.profiles

**Ubicación:** `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql`

```sql
CREATE TABLE auth_management.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- ROL DEL USUARIO
    role auth_management.gamilit_role NOT NULL DEFAULT 'student',

    -- Otros campos...
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT gamilit.now_mexico(),

    -- Constraints
    CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- RLS Policies
ALTER TABLE auth_management.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Todos pueden ver perfiles básicos
CREATE POLICY "profiles_select_all" ON auth_management.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Solo el propio usuario puede actualizar su perfil
CREATE POLICY "profiles_update_own" ON auth_management.profiles
    FOR UPDATE
    TO authenticated
    USING (user_id = gamilit.get_current_user_id())
    WITH CHECK (
        -- No puede cambiar su propio rol (solo super_admin puede)
        role = (SELECT role FROM auth_management.profiles WHERE id = profiles.id)
    );

-- Policy 3: Solo super_admin puede cambiar roles
CREATE POLICY "profiles_update_role_admin_only" ON auth_management.profiles
    FOR UPDATE
    TO authenticated
    USING (gamilit.get_current_user_role() = 'super_admin')
    WITH CHECK (true);
```

**Notas Técnicas:**
- Default role: `'student'` (seguro por defecto)
- RLS impide cambio de rol propio (previene privilege escalation)
- Trigger de auditoría registra cambios de rol (seguridad)

---

### 3. Backend - Enum TypeScript

**Ubicación:** `apps/backend/src/shared/enums/gamilit-role.enum.ts`

```typescript
/**
 * Roles de usuario en Gamilit
 *
 * Debe estar sincronizado con:
 * - Database ENUM: auth_management.gamilit_role
 * - DDL: apps/database/ddl/00-prerequisites.sql:30-32
 */
export enum GamilitRole {
  /** Estudiante regular con acceso limitado */
  STUDENT = 'student',

  /** Profesor/Admin con permisos de gestión de aulas */
  ADMIN_TEACHER = 'admin_teacher',

  /** Super administrador con acceso completo */
  SUPER_ADMIN = 'super_admin',
}

/**
 * Mapeo de roles a nivel numérico (para comparaciones)
 */
export const RoleLevel: Record<GamilitRole, number> = {
  [GamilitRole.STUDENT]: 1,
  [GamilitRole.ADMIN_TEACHER]: 2,
  [GamilitRole.SUPER_ADMIN]: 3,
};

/**
 * Verifica si un rol tiene al menos el nivel requerido
 */
export function hasMinimumRole(
  userRole: GamilitRole,
  requiredRole: GamilitRole
): boolean {
  return RoleLevel[userRole] >= RoleLevel[requiredRole];
}
```

---

### 4. Backend - Guard de Roles

**Ubicación:** `apps/backend/src/shared/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GamilitRole } from '../enums/gamilit-role.enum';

/**
 * Guard que valida roles de usuario en endpoints
 *
 * Uso:
 * @Roles(GamilitRole.ADMIN_TEACHER, GamilitRole.SUPER_ADMIN)
 * @Get('admin/dashboard')
 * getAdminDashboard() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles permitidos del decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<GamilitRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles) {
      return true;
    }

    // Obtener usuario del request (inyectado por JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    // Validar que usuario tenga alguno de los roles permitidos
    return requiredRoles.some((role) => user.role === role);
  }
}
```

**Decorator:**
```typescript
// apps/backend/src/shared/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { GamilitRole } from '../enums/gamilit-role.enum';

export const Roles = (...roles: GamilitRole[]) => SetMetadata('roles', roles);
```

**Ejemplo de Uso:**
```typescript
// apps/backend/src/modules/admin/admin.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { GamilitRole } from '@shared/enums/gamilit-role.enum';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {

  @Roles(GamilitRole.ADMIN_TEACHER, GamilitRole.SUPER_ADMIN)
  @Get('dashboard')
  getDashboard() {
    return { message: 'Admin dashboard' };
  }

  @Roles(GamilitRole.SUPER_ADMIN)
  @Get('system-config')
  getSystemConfig() {
    return { message: 'System configuration' };
  }
}
```

---

### 5. Frontend - Types y Componentes

**Types:**
```typescript
// apps/frontend/src/types/auth.types.ts

/**
 * Roles de usuario (sincronizado con backend y database)
 */
export enum GamilitRole {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin',
}

export interface UserProfile {
  id: string;
  userId: string;
  role: GamilitRole;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Componente: RoleBasedRoute**
```typescript
// apps/frontend/src/components/auth/RoleBasedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GamilitRole } from '@/types/auth.types';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: GamilitRole[];
  fallback?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallback = '/unauthorized',
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
```

**Uso:**
```typescript
// apps/frontend/src/App.tsx
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { GamilitRole } from '@/types/auth.types';

<Routes>
  <Route path="/dashboard" element={<Dashboard />} />

  <Route
    path="/admin"
    element={
      <RoleBasedRoute allowedRoles={[GamilitRole.ADMIN_TEACHER, GamilitRole.SUPER_ADMIN]}>
        <AdminPanel />
      </RoleBasedRoute>
    }
  />

  <Route
    path="/system-config"
    element={
      <RoleBasedRoute allowedRoles={[GamilitRole.SUPER_ADMIN]}>
        <SystemConfig />
      </RoleBasedRoute>
    }
  />
</Routes>
```

---

## 🔒 Row Level Security (RLS) Policies

### Ejemplo Completo: progress_tracking.module_progress

```sql
-- apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql

-- Habilitar RLS
ALTER TABLE progress_tracking.module_progress ENABLE ROW LEVEL SECURITY;

-- Policy 1: Estudiantes ven solo su progreso
CREATE POLICY "module_progress_select_student" ON progress_tracking.module_progress
    FOR SELECT
    TO authenticated
    USING (
        user_id = gamilit.get_current_user_id()
        AND gamilit.get_current_user_role() = 'student'
    );

-- Policy 2: Profesores ven progreso de estudiantes de sus aulas
CREATE POLICY "module_progress_select_teacher" ON progress_tracking.module_progress
    FOR SELECT
    TO authenticated
    USING (
        gamilit.get_current_user_role() = 'admin_teacher'
        AND user_id IN (
            -- Subquery: obtener estudiantes de aulas del profesor
            SELECT cm.user_id
            FROM social_features.classroom_members cm
            INNER JOIN social_features.classroom_members tcm
                ON cm.classroom_id = tcm.classroom_id
            WHERE tcm.user_id = gamilit.get_current_user_id()
                AND tcm.role = 'teacher'
                AND cm.role = 'student'
        )
    );

-- Policy 3: Super admin ve todo
CREATE POLICY "module_progress_select_admin" ON progress_tracking.module_progress
    FOR SELECT
    TO authenticated
    USING (gamilit.get_current_user_role() = 'super_admin');
```

**Notas de Performance:**
- Subquery de profesor está indexado:
  - `social_features.classroom_members(classroom_id, user_id, role)`
- Función `gamilit.get_current_user_role()` cachea resultado por sesión
- Para super_admin, RLS hace bypass automático

---

## 📊 Performance y Escalabilidad

### Consideraciones

1. **Caching de Rol:**
```sql
-- Función cacheada para evitar múltiples lookups
CREATE OR REPLACE FUNCTION gamilit.get_current_user_role()
RETURNS auth_management.gamilit_role
LANGUAGE sql STABLE  -- STABLE = cacheable durante sesión
AS $$
    SELECT role
    FROM auth_management.profiles
    WHERE user_id = gamilit.get_current_user_id()
    LIMIT 1;
$$;
```

2. **Índices Requeridos:**
```sql
-- Índice en columna role para filtrado rápido
CREATE INDEX idx_profiles_role ON auth_management.profiles(role);

-- Índice compuesto para RLS policies
CREATE INDEX idx_classroom_members_composite
    ON social_features.classroom_members(classroom_id, user_id, role);
```

3. **Estadísticas de Roles (estimadas):**
- `student`: ~95% de usuarios
- `admin_teacher`: ~4% de usuarios
- `super_admin`: <1% de usuarios

---

## 🧪 Testing

### Unit Tests

```typescript
// apps/backend/src/shared/guards/roles.guard.spec.ts
describe('RolesGuard', () => {
  it('should allow access if user has required role', () => {
    const user = { role: GamilitRole.ADMIN_TEACHER };
    const requiredRoles = [GamilitRole.ADMIN_TEACHER, GamilitRole.SUPER_ADMIN];

    const result = guard.canActivate(mockContext(user, requiredRoles));
    expect(result).toBe(true);
  });

  it('should deny access if user lacks required role', () => {
    const user = { role: GamilitRole.STUDENT };
    const requiredRoles = [GamilitRole.ADMIN_TEACHER];

    const result = guard.canActivate(mockContext(user, requiredRoles));
    expect(result).toBe(false);
  });
});
```

### E2E Tests

```typescript
// apps/backend/test/auth/roles.e2e-spec.ts
describe('RBAC E2E', () => {
  it('student cannot access admin endpoint', async () => {
    const student = await createUser({ role: GamilitRole.STUDENT });
    const token = await getAuthToken(student);

    const response = await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('admin_teacher can access admin endpoint', async () => {
    const teacher = await createUser({ role: GamilitRole.ADMIN_TEACHER });
    const token = await getAuthToken(teacher);

    const response = await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
```

---

## 📚 Referencias

### Documentos Relacionados
- 📄 [RF-AUTH-001: Sistema de Roles](../requirements/RF-AUTH-001-roles.md)
- 📄 [RF-AUTH-002: Estados de Cuenta](../requirements/RF-AUTH-002-estados-cuenta.md)
- 📐 [ADR-003: Row Level Security](../adr/ADR-003-row-level-security.md)

### Estándares
- [NIST RBAC](https://csrc.nist.gov/projects/role-based-access-control)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Documento:** `docs/20-architecture/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md`
**Ruta relativa desde docs/:** `10-requirements/epics/EPIC-GAM-F1-AUTH/specifications/ET-AUTH-001-rbac.md`
