---
titulo: "Portal Admin - Seguridad, Flujos Principales y Ejemplos de Código"
tipo: portal
portal: admin
status: activo
last_updated: "2026-02-28"
---

# Portal Admin — Seguridad, Flujos Principales y Ejemplos de Código

**Aplica a:** apps/frontend/src/apps/admin/ + apps/backend/src/modules/admin/

[← Volver al hub](../PORTAL-ADMIN-GUIDE.md) | [← Anterior: Patrones y Estado](02-PATRONES-ESTADO.md) | [Siguiente: Calidad →](04-CALIDAD.md)

---

## 8. Seguridad

### 8.1 Autorización

1. **JwtAuthGuard:** Verifica token JWT válido
2. **AdminGuard:** Verifica rol admin/super_admin

### 8.2 Reglas de Acceso

```yaml
Admin puede:
  - Ver todos los usuarios del sistema
  - Crear/editar/eliminar usuarios
  - Suspender/reactivar usuarios
  - Gestionar organizaciones
  - Moderar contenido
  - Configurar gamificación
  - Ver audit logs completos
  - Ejecutar bulk operations
  - Configurar sistema
  - Ver todas las métricas

Admin NO puede:
  - Modificar datos de super_admin (solo super_admin puede)
  - Eliminar su propia cuenta
  - Desactivar modo mantenimiento si no lo activó
```

### 8.3 Audit Logging

Todas las acciones de admin se registran:

```typescript
// Eventos auditados
const AUDIT_EVENTS = {
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_SUSPENDED: 'user_suspended',
  ORG_CREATED: 'organization_created',
  ORG_UPDATED: 'organization_updated',
  CONTENT_APPROVED: 'content_approved',
  CONTENT_REJECTED: 'content_rejected',
  CONFIG_UPDATED: 'config_updated',
  MAINTENANCE_TOGGLED: 'maintenance_toggled',
  BULK_OPERATION: 'bulk_operation',
};
```

### 8.4 Rate Limiting

Endpoints de admin tienen rate limiting más permisivo:

```typescript
// Rate limits por rol
const RATE_LIMITS = {
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 1000,         // 1000 requests
  },
  default: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
};
```

---

## 9. Flujos Principales

### 9.1 Flujo: Crear Usuario

```
1. Admin navega a /admin/users
2. Click en "Nuevo Usuario"
3. Modal de creación se abre
4. Admin completa form:
   - Username
   - Email
   - Password
   - Role
   - Profile info
5. Submit → POST /admin/users
6. Backend valida datos
7. Backend crea usuario en DB
8. Backend registra audit log
9. Backend retorna usuario creado
10. Frontend actualiza lista (invalidate query)
11. Modal se cierra
12. Toast de éxito
```

### 9.2 Flujo: Suspender Usuario

```
1. Admin ve lista de usuarios
2. Selecciona usuario problemático
3. Click "Suspender"
4. Modal de confirmación:
   - Razón (requerido)
   - Duración (opcional)
5. Confirm → POST /admin/users/:id/suspend
6. Backend suspende usuario
7. Backend registra audit log
8. Backend envía notificación al usuario
9. Frontend actualiza UI
10. Toast de confirmación
```

### 9.3 Flujo: Aprobar Contenido

```
1. Admin navega a /admin/content
2. Ve lista de contenido pendiente
3. Click en item para ver detalles
4. Revisa contenido:
   - Preview del ejercicio
   - Metadata
   - Author
5. Decisión:
   a) Aprobar → POST /admin/content/:id/approve
      - Contenido pasa a published
      - Creator recibe notificación
   b) Rechazar → POST /admin/content/:id/reject
      - Modal para razón
      - Contenido pasa a rejected
      - Creator recibe notificación con feedback
6. Frontend actualiza cola de moderación
```

### 9.4 Flujo: Configurar Gamificación

```
1. Admin navega a /admin/gamification
2. Ve config actual de parámetros
3. Modifica valores:
   - ML Coins por ejercicio
   - XP por logro
   - Costos de comodines
4. Click "Preview Impact"
   → POST /admin/gamification/preview-impact
   - Backend simula impacto en usuarios
   - Muestra estadísticas proyectadas
5. Admin revisa preview
6. Confirm → PATCH /admin/gamification/settings
7. Backend actualiza config
8. Backend registra audit log
9. Config nueva aplica a partir de ahora
10. Toast de éxito con resumen de cambios
```

### 9.5 Flujo: Operación Masiva (Bulk Suspend)

```
1. Admin selecciona múltiples usuarios (checkboxes)
2. Click "Suspender seleccionados"
3. Modal de confirmación:
   - Lista de usuarios
   - Razón global
   - Duración
4. Confirm → POST /admin/users/bulk/suspend
5. Backend:
   - Crea BulkOperation record
   - Retorna operation_id inmediatamente
   - Ejecuta suspensión en background
6. Frontend:
   - Muestra progress modal
   - Poll GET /admin/users/bulk/:operationId cada 2s
7. Backend actualiza progreso:
   - completed_count incrementa
   - failed_count si hay errores
8. Al completar:
   - Frontend muestra resumen
   - Invalidate users query
   - Cierra modal después de 3s
```

### 9.6 Flujo: Modo Mantenimiento

```
1. Admin navega a /admin/settings
2. Toggle "Maintenance Mode"
3. Modal de confirmación:
   - Mensaje personalizado para usuarios
   - Duración estimada
4. Confirm → POST /admin/system/maintenance/toggle
5. Backend:
   - Actualiza system_settings
   - Broadcast WebSocket a todos los usuarios
6. Frontend (todos los portales):
   - Reciben notificación
   - Muestran banner de mantenimiento
   - Bloquean acciones críticas
7. Admin puede seguir usando el portal
8. Para desactivar:
   - Admin toggle OFF
   - Backend notifica a todos
   - Sistema vuelve a normal
```

---

## 15. Ejemplos de Código Completos

### 15.1 Page Pattern — AdminPageShell (canonical)

```typescript
// Pattern canónico para páginas admin (Sprint 0+1+2)
// Todas las 19 páginas siguen esta estructura

import AdminPageShell from '../components/shared/AdminPageShell';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { DashboardStatsGrid } from '../components/dashboard/DashboardStatsGrid';
import { SystemHealthCard } from '../components/dashboard/SystemHealthCard';
import { AlertsNotificationsCard } from '../components/dashboard/AlertsNotificationsCard';
import { DashboardQuickActions } from '../components/dashboard/DashboardQuickActions';

export default function AdminDashboardPage() {
  const {
    stats,
    health,
    alerts,
    recentActions,
    loading,
    handleRefresh,
  } = useAdminDashboard();

  return (
    <AdminPageShell
      title="Dashboard"
      subtitle="Vista general del sistema"
      actions={
        <button onClick={handleRefresh} className="...">
          Actualizar
        </button>
      }
    >
      <DashboardStatsGrid stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthCard health={health} loading={loading} />
        <AlertsNotificationsCard
          alerts={alerts}
          recentActions={recentActions}
          loading={loading}
        />
      </div>

      <DashboardQuickActions />
    </AdminPageShell>
  );
}
```

**Beneficios del patrón AdminPageShell:**
- Elimina 15-35 líneas de boilerplate por página (useAuth, gamification, logout)
- Header consistente con título, subtítulo y acciones
- Integración automática con AdminLayout
- 19/19 páginas migradas (100% adopción)

### 15.2 Service Backend Completo - AdminUsersService

```typescript
// services/admin-users.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@modules/auth/entities/user.entity';
import { AuditLogService } from '@modules/audit/audit-log.service';
import {
  ListUsersDto,
  UpdateUserDto,
  SuspendUserDto,
  PaginatedUsersDto,
  UserStatsDto,
} from '../dto/users';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    @InjectRepository(User, 'auth')
    private userRepo: Repository<User>,
    private auditLogService: AuditLogService,
  ) {}

  async listUsers(query: ListUsersDto): Promise<PaginatedUsersDto> {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = query;

    this.logger.debug(`Listing users: page=${page}, limit=${limit}, role=${role}, status=${status}`);

    const qb = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role');

    // Filtros
    if (role) {
      qb.andWhere('role.name = :role', { role });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search OR profile.first_name ILIKE :search OR profile.last_name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    qb.orderBy(`user.${sortBy}`, sortOrder);

    // Paginación
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    this.logger.debug(`Found ${total} users, returning page ${page}`);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['profile', 'roles', 'roles.role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(
    userId: string,
    dto: UpdateUserDto,
    adminId: string
  ): Promise<User> {
    const user = await this.getUserDetails(userId);

    this.logger.log(`Admin ${adminId} updating user ${userId}`);

    // Guardar estado anterior
    const previousState = { ...user };

    // Actualizar
    Object.assign(user, dto);
    await this.userRepo.save(user);

    // Audit log
    await this.auditLogService.log({
      event_type: 'user_updated',
      actor_id: adminId,
      target_id: userId,
      target_type: 'user',
      changes: {
        before: previousState,
        after: user,
      },
      metadata: {
        updated_fields: Object.keys(dto),
      },
    });

    return user;
  }

  async deleteUser(userId: string, adminId: string): Promise<void> {
    const user = await this.getUserDetails(userId);

    this.logger.log(`Admin ${adminId} deleting user ${userId}`);

    // Soft delete
    user.deleted_at = new Date();
    user.status = 'deleted';
    await this.userRepo.save(user);

    // Audit log
    await this.auditLogService.log({
      event_type: 'user_deleted',
      actor_id: adminId,
      target_id: userId,
      target_type: 'user',
    });
  }

  async suspendUser(
    userId: string,
    dto: SuspendUserDto,
    adminId: string
  ): Promise<void> {
    const user = await this.getUserDetails(userId);

    this.logger.log(`Admin ${adminId} suspending user ${userId}: ${dto.reason}`);

    user.status = 'suspended';
    user.suspended_at = new Date();
    user.suspension_reason = dto.reason;

    if (dto.duration_days) {
      const until = new Date();
      until.setDate(until.getDate() + dto.duration_days);
      user.suspended_until = until;
    }

    await this.userRepo.save(user);

    // Audit log
    await this.auditLogService.log({
      event_type: 'user_suspended',
      actor_id: adminId,
      target_id: userId,
      target_type: 'user',
      metadata: {
        reason: dto.reason,
        duration_days: dto.duration_days,
      },
    });
  }

  async getUserStats(): Promise<UserStatsDto> {
    const total = await this.userRepo.count();
    const active = await this.userRepo.count({ where: { status: 'active' } });
    const suspended = await this.userRepo.count({ where: { status: 'suspended' } });

    // Roles breakdown
    const roleBreakdown = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'userRoles')
      .leftJoin('userRoles.role', 'role')
      .select('role.name', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('role.name')
      .getRawMany();

    return {
      total_users: total,
      active_users: active,
      suspended_users: suspended,
      inactive_users: total - active - suspended,
      role_breakdown: roleBreakdown,
    };
  }
}
```

---

[← Volver al hub](../PORTAL-ADMIN-GUIDE.md) | [← Anterior: Patrones y Estado](02-PATRONES-ESTADO.md) | [Siguiente: Calidad →](04-CALIDAD.md)
