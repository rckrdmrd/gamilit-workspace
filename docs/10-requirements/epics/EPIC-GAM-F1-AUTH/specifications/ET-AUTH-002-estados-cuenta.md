# ET-AUTH-002: Gestión de Estados de Cuenta

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-AUTH-002 |
| **Módulo** | Autenticación y Autorización |
| **Tipo** | Especificación Técnica |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha creación** | 2025-11-07 |

## 🔗 Referencias

### Requerimiento Funcional
📄 [RF-AUTH-002: Estados de Cuenta de Usuario](../../01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md)

### Implementación DDL
🗄️ **Archivos relacionados:**

**ENUM Principal:**
```sql
-- apps/database/ddl/00-prerequisites.sql:34-36
DO $$ BEGIN
    CREATE TYPE auth_management.user_status AS ENUM (
        'active',    -- Usuario activo, puede acceder
        'inactive',  -- Inactivo temporalmente
        'suspended', -- Suspendido por admin (reversible)
        'banned',    -- Baneado permanentemente
        'pending'    -- Registro pendiente de verificación
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

COMMENT ON TYPE auth_management.user_status IS 'Estados de cuenta de usuario';
```

**Tabla Principal:**
```sql
-- apps/database/ddl/schemas/auth_management/tables/03-profiles.sql:17
CREATE TABLE auth_management.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- ESTADO DE LA CUENTA
    status auth_management.user_status NOT NULL DEFAULT 'pending',

    -- Metadata de estado
    status_changed_at TIMESTAMPTZ,
    status_changed_by UUID REFERENCES auth_management.profiles(user_id),
    status_reason TEXT, -- Razón de suspensión/baneo

    -- Otros campos...
    role auth_management.gamilit_role NOT NULL DEFAULT 'student',
    display_name TEXT,
    email TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT gamilit.now_mexico()
);
```

**Funciones:**
- `auth_management.verify_user_status(user_id):130` - Valida acceso
- `auth_management.suspend_user(user_id, reason):145` - Suspende usuario
- `auth_management.ban_user(user_id, reason):160` - Banea usuario
- `auth_management.reactivate_user(user_id):175` - Reactiva usuario

**Triggers:**
- `trg_profiles_status_change:190` - Audita cambios de estado
- `trg_verify_email_set_active:195` - Cambia pending → active al verificar

### Mapeo Completo
📊 [Ver en: Mapeo Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#12-estados-de-cuenta-de-usuario)

---

## 🏗️ Arquitectura de Estados

### Diagrama de Transiciones

```
┌──────────────────────────────────────────────────────────┐
│                   CICLO DE VIDA DE CUENTA                 │
└──────────────────────────────────────────────────────────┘

        [REGISTRO]
            │
            ▼
      ┌──────────┐
      │ pending  │ ◄─── Estado inicial
      └────┬─────┘
           │
           │ verify_email()
           │
           ▼
      ┌──────────┐
      │  active  │ ◄─── Estado principal
      └─┬──┬──┬──┘
        │  │  │
        │  │  └──────► [admin_suspends] ──► ┌────────────┐
        │  │                                  │ suspended  │
        │  │            [admin_lifts] ◄────  └────┬───────┘
        │  │                                      │
        │  │                      [admin_bans] ───┘
        │  │                           │
        │  └────► [user_deactivates] ──┤
        │                               │
        ▼                               ▼
   ┌──────────┐                   ┌──────────┐
   │ inactive │                   │  banned  │
   └────┬─────┘                   └──────────┘
        │                              │
        │ reactivate()                 │
        │                              │
        └─────────────────────────────►│
                                       ▼
                                   [FINAL]
                               (irreversible)


LEYENDA:
────►  Transición automática/usuario
- - ->  Transición admin only
═════►  Transición irreversible
```

---

## 🔧 Implementación Técnica

### 1. Funciones de Gestión de Estado

#### verify_user_status()
```sql
-- apps/database/ddl/schemas/auth_management/functions/01-verify_user_status.sql
CREATE OR REPLACE FUNCTION auth_management.verify_user_status(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status auth_management.user_status;
BEGIN
    -- Obtener estado actual
    SELECT status INTO v_status
    FROM auth_management.profiles
    WHERE user_id = p_user_id;

    -- Si no existe el usuario
    IF v_status IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Solo 'active' puede acceder
    RETURN v_status = 'active';
END;
$$;

COMMENT ON FUNCTION auth_management.verify_user_status(UUID) IS
    'Verifica si usuario puede acceder al sistema (solo active)';
```

#### suspend_user()
```sql
-- apps/database/ddl/schemas/auth_management/functions/02-suspend_user.sql
CREATE OR REPLACE FUNCTION auth_management.suspend_user(
    p_user_id UUID,
    p_reason TEXT,
    p_suspended_by UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_status auth_management.user_status;
BEGIN
    -- Obtener estado actual
    SELECT status INTO v_current_status
    FROM auth_management.profiles
    WHERE user_id = p_user_id;

    -- Solo se puede suspender si está active
    IF v_current_status != 'active' THEN
        RAISE EXCEPTION 'User must be active to suspend. Current status: %', v_current_status;
    END IF;

    -- Validar razón
    IF p_reason IS NULL OR LENGTH(TRIM(p_reason)) < 10 THEN
        RAISE EXCEPTION 'Suspension reason must be at least 10 characters';
    END IF;

    -- Actualizar estado
    UPDATE auth_management.profiles
    SET
        status = 'suspended',
        status_changed_at = NOW(),
        status_changed_by = p_suspended_by,
        status_reason = p_reason,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Cerrar todas las sesiones activas del usuario
    -- (autenticación estándar maneja esto automáticamente)

    -- Trigger automático auditará el cambio

    RAISE NOTICE 'User % suspended. Reason: %', p_user_id, p_reason;
END;
$$;

COMMENT ON FUNCTION auth_management.suspend_user(UUID, TEXT, UUID) IS
    'Suspende usuario (solo de active a suspended)';
```

#### ban_user()
```sql
-- apps/database/ddl/schemas/auth_management/functions/03-ban_user.sql
CREATE OR REPLACE FUNCTION auth_management.ban_user(
    p_user_id UUID,
    p_reason TEXT,
    p_banned_by UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_status auth_management.user_status;
    v_email TEXT;
BEGIN
    -- Obtener estado y email
    SELECT status, email INTO v_current_status, v_email
    FROM auth_management.profiles
    WHERE user_id = p_user_id;

    -- Se puede banear desde active o suspended
    IF v_current_status NOT IN ('active', 'suspended') THEN
        RAISE EXCEPTION 'Can only ban active or suspended users. Current: %', v_current_status;
    END IF;

    -- Validar razón (debe ser grave)
    IF p_reason IS NULL OR LENGTH(TRIM(p_reason)) < 20 THEN
        RAISE EXCEPTION 'Ban reason must be at least 20 characters (permanent action)';
    END IF;

    -- Actualizar estado (IRREVERSIBLE)
    UPDATE auth_management.profiles
    SET
        status = 'banned',
        status_changed_at = NOW(),
        status_changed_by = p_banned_by,
        status_reason = p_reason,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Bloquear email para futuros registros
    INSERT INTO auth_management.blocked_emails (
        email, reason, blocked_by, blocked_at
    ) VALUES (
        v_email, p_reason, p_banned_by, NOW()
    ) ON CONFLICT (email) DO NOTHING;

    -- Cerrar sesiones
    -- Trigger auditará

    RAISE NOTICE 'User % BANNED (PERMANENT). Reason: %', p_user_id, p_reason;
END;
$$;

COMMENT ON FUNCTION auth_management.ban_user(UUID, TEXT, UUID) IS
    'Banea usuario PERMANENTEMENTE (irreversible)';
```

#### reactivate_user()
```sql
-- apps/database/ddl/schemas/auth_management/functions/04-reactivate_user.sql
CREATE OR REPLACE FUNCTION auth_management.reactivate_user(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_status auth_management.user_status;
BEGIN
    SELECT status INTO v_current_status
    FROM auth_management.profiles
    WHERE user_id = p_user_id;

    -- Solo se puede reactivar desde inactive o suspended
    IF v_current_status NOT IN ('inactive', 'suspended') THEN
        RAISE EXCEPTION 'Can only reactivate inactive or suspended users. Current: %', v_current_status;
    END IF;

    -- NO se puede reactivar banned (irreversible)
    IF v_current_status = 'banned' THEN
        RAISE EXCEPTION 'Cannot reactivate banned users';
    END IF;

    -- Reactivar
    UPDATE auth_management.profiles
    SET
        status = 'active',
        status_changed_at = NOW(),
        status_changed_by = p_user_id, -- Self-reactivation
        status_reason = NULL, -- Clear reason
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RAISE NOTICE 'User % reactivated', p_user_id;
END;
$$;

COMMENT ON FUNCTION auth_management.reactivate_user(UUID) IS
    'Reactiva usuario (de inactive o suspended a active)';
```

---

### 2. Triggers de Auditoría

#### trg_profiles_status_change
```sql
-- apps/database/ddl/schemas/auth_management/tables/03-profiles.sql:200
CREATE OR REPLACE FUNCTION audit_logging.log_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Solo auditar si el status cambió
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logging.audit_logs (
            user_id,
            action,
            resource_type,
            resource_id,
            details,
            ip_address,
            user_agent
        ) VALUES (
            NEW.status_changed_by, -- Quién hizo el cambio
            'update',
            'user_status',
            NEW.user_id,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'reason', NEW.status_reason,
                'changed_at', NEW.status_changed_at
            ),
            current_setting('request.headers.x-forwarded-for', true),
            current_setting('request.headers.user-agent', true)
        );

        -- Enviar notificación si cambio no fue iniciado por el usuario
        IF NEW.status_changed_by IS DISTINCT FROM NEW.user_id THEN
            INSERT INTO public.notifications (
                user_id,
                type,
                priority,
                title,
                body,
                data
            ) VALUES (
                NEW.user_id,
                'system_announcement',
                CASE
                    WHEN NEW.status IN ('suspended', 'banned') THEN 'high'
                    ELSE 'medium'
                END,
                'Estado de cuenta actualizado',
                CASE NEW.status
                    WHEN 'suspended' THEN 'Tu cuenta ha sido suspendida: ' || NEW.status_reason
                    WHEN 'banned' THEN 'Tu cuenta ha sido baneada permanentemente: ' || NEW.status_reason
                    WHEN 'active' THEN 'Tu cuenta ha sido reactivada'
                    ELSE 'El estado de tu cuenta cambió'
                END,
                jsonb_build_object(
                    'old_status', OLD.status,
                    'new_status', NEW.status
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Crear trigger
CREATE TRIGGER trg_profiles_status_change
    AFTER UPDATE OF status ON auth_management.profiles
    FOR EACH ROW
    EXECUTE FUNCTION audit_logging.log_status_change();
```

#### trg_verify_email_set_active
```sql
-- Trigger para cambiar de pending a active al verificar email
CREATE OR REPLACE FUNCTION auth_management.on_email_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si email_confirmed_at se setea y status es pending
    IF NEW.email_confirmed_at IS NOT NULL
       AND OLD.email_confirmed_at IS NULL
       AND NEW.status = 'pending'
    THEN
        -- Cambiar a active
        NEW.status := 'active';
        NEW.status_changed_at := NOW();
        NEW.status_changed_by := NEW.user_id; -- Self-verification

        RAISE NOTICE 'User % verified email, status changed to active', NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_verify_email_set_active
    BEFORE UPDATE OF email_confirmed_at ON auth_management.profiles
    FOR EACH ROW
    EXECUTE FUNCTION auth_management.on_email_verified();
```

---

### 3. Backend - Middleware y Guards

#### UserStatusMiddleware
```typescript
// apps/backend/src/modules/auth/middleware/user-status.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware que valida el estado del usuario en cada request
 *
 * Bloquea acceso si status !== 'active'
 * Excepciones: endpoints de reactivación y status check
 */
@Injectable()
export class UserStatusMiddleware implements NestMiddleware {
  // Paths que NO requieren status active
  private readonly exemptPaths = [
    '/auth/status',
    '/auth/reactivate',
    '/auth/logout',
    '/health',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    // Si no hay usuario autenticado, dejar pasar (otro guard lo manejará)
    if (!req.user) {
      return next();
    }

    // Verificar si path está exento
    const isExempt = this.exemptPaths.some(path =>
      req.path.startsWith(path)
    );

    if (isExempt) {
      return next();
    }

    // Validar status
    const userStatus = req.user.status;

    if (userStatus !== 'active') {
      // Mensajes específicos por estado
      const messages = {
        pending: 'Tu cuenta está pendiente de verificación. Por favor verifica tu email.',
        inactive: 'Tu cuenta está desactivada. Puedes reactivarla en cualquier momento.',
        suspended: `Tu cuenta ha sido suspendida. Razón: ${req.user.status_reason || 'No especificada'}. Contacta a soporte.`,
        banned: `Tu cuenta ha sido baneada permanentemente. Razón: ${req.user.status_reason || 'Violación de términos'}. Esta acción es irreversible.`,
      };

      throw new ForbiddenException({
        statusCode: 403,
        message: messages[userStatus] || 'Acceso denegado',
        error: 'AccountStatusError',
        status: userStatus,
      });
    }

    // Usuario active, permitir acceso
    next();
  }
}
```

#### UpdateUserStatusDto
```typescript
// apps/backend/src/modules/auth/dto/update-user-status.dto.ts
import { IsEnum, IsString, MinLength, IsUUID, IsOptional } from 'class-validator';
import { UserStatus } from '../enums/user-status.enum';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsString()
  @MinLength(10, { message: 'Reason must be at least 10 characters' })
  @IsOptional()
  reason?: string;
}

export class SuspendUserDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(10)
  reason: string;
}

export class BanUserDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(20, { message: 'Ban reason must be at least 20 characters (permanent action)' })
  reason: string;
}
```

#### UserManagementService
```typescript
// apps/backend/src/modules/auth/services/user-management.service.ts
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { UserStatus } from '../enums/user-status.enum';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
  ) {}

  /**
   * Suspende usuario (requiere rol super_admin)
   */
  async suspendUser(
    userId: string,
    reason: string,
    adminId: string,
  ): Promise<void> {
    const profile = await this.profileRepo.findOne({ where: { userId } });

    if (!profile) {
      throw new BadRequestException('User not found');
    }

    if (profile.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot suspend user with status: ${profile.status}`,
      );
    }

    // Ejecutar función SQL
    await this.profileRepo.query(
      `SELECT auth_management.suspend_user($1, $2, $3)`,
      [userId, reason, adminId],
    );
  }

  /**
   * Banea usuario PERMANENTEMENTE (requiere super_admin)
   */
  async banUser(
    userId: string,
    reason: string,
    adminId: string,
  ): Promise<void> {
    const profile = await this.profileRepo.findOne({ where: { userId } });

    if (!profile) {
      throw new BadRequestException('User not found');
    }

    if (!['active', 'suspended'].includes(profile.status)) {
      throw new BadRequestException(
        `Cannot ban user with status: ${profile.status}`,
      );
    }

    // Confirmar que admin entiende que es permanente
    await this.profileRepo.query(
      `SELECT auth_management.ban_user($1, $2, $3)`,
      [userId, reason, adminId],
    );
  }

  /**
   * Reactiva usuario (de inactive o suspended)
   */
  async reactivateUser(userId: string): Promise<void> {
    const profile = await this.profileRepo.findOne({ where: { userId } });

    if (!profile) {
      throw new BadRequestException('User not found');
    }

    if (!['inactive', 'suspended'].includes(profile.status)) {
      throw new BadRequestException(
        `Cannot reactivate user with status: ${profile.status}`,
      );
    }

    if (profile.status === UserStatus.BANNED) {
      throw new ForbiddenException('Cannot reactivate banned users');
    }

    await this.profileRepo.query(
      `SELECT auth_management.reactivate_user($1)`,
      [userId],
    );
  }
}
```

---

### 4. Frontend - Componentes

#### UserStatusBadge
```typescript
// apps/frontend/src/components/ui/UserStatusBadge.tsx
import React from 'react';
import { UserStatus } from '@/types/auth.types';

interface UserStatusBadgeProps {
  status: UserStatus;
  showLabel?: boolean;
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  status,
  showLabel = true
}) => {
  const config = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: '⏳',
      label: 'Pendiente',
    },
    active: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '✅',
      label: 'Activo',
    },
    inactive: {
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: '⏸️',
      label: 'Inactivo',
    },
    suspended: {
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: '⚠️',
      label: 'Suspendido',
    },
    banned: {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: '🚫',
      label: 'Baneado',
    },
  };

  const { color, icon, label } = config[status] || config.active;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
      <span className="mr-1">{icon}</span>
      {showLabel && <span>{label}</span>}
    </span>
  );
};
```

---

## 📊 Testing

### Test Case 1: Suspender usuario activo
```typescript
test('Admin can suspend active user with reason', async () => {
  const admin = await createUser({ role: 'super_admin' });
  const user = await createUser({ status: 'active' });

  await loginAs(admin);

  const response = await api.post(`/admin/users/${user.id}/suspend`, {
    reason: 'Inappropriate behavior reported by multiple users',
  });

  expect(response.status).toBe(200);

  // Verificar cambio de estado
  const updatedUser = await getUser(user.id);
  expect(updatedUser.status).toBe('suspended');
  expect(updatedUser.status_reason).toContain('Inappropriate behavior');

  // Verificar auditoría
  const auditLog = await getLatestAuditLog(user.id, 'user_status');
  expect(auditLog.details.old_status).toBe('active');
  expect(auditLog.details.new_status).toBe('suspended');
});
```

---

## 📚 Referencias

### Documentos Relacionados
- 📄 [RF-AUTH-002: Estados de Cuenta](../../01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md)
- 📄 [RF-AUD-001: Auditoría](../../01-requerimientos/08-auditoria-configuracion/RF-AUD-001-registro-acciones.md)

---

**Documento:** `docs/20-architecture/01-autenticacion-autorizacion/ET-AUTH-002-estados-cuenta.md`
**Ruta relativa desde docs/:** `10-requirements/epics/EPIC-GAM-F1-AUTH/specifications/ET-AUTH-002-estados-cuenta.md`
