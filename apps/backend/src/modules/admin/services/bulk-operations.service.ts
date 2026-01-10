import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BulkOperation } from '../entities/bulk-operation.entity';
import { User } from '@modules/auth/entities/user.entity';
import { UserSuspension } from '@modules/auth/entities/user-suspension.entity';
import {
  BulkSuspendUsersDto,
  BulkActivateUsersDto,
  BulkUpdateRoleDto,
  BulkDeleteUsersDto,
  BulkOperationStatusDto,
} from '../dto/bulk-operations';
import { IBulkOperationResult } from '../interfaces/bulk-operation.interface';

/**
 * BulkOperationsService
 *
 * @description Servicio para manejar operaciones bulk (masivas) sobre usuarios
 * @related EXT-002 (Admin Extendido - Bulk Operations)
 *
 * IMPORTANTE:
 * - Procesa operaciones sobre múltiples usuarios de forma asíncrona
 * - Registra progreso en tabla admin_dashboard.bulk_operations
 * - Usa función SQL update_bulk_operation_progress() para tracking
 * - En v2: Integrar con BullMQ para procesamiento en background
 *
 * ============================================================================
 * SECURITY WARNING - CROSS-TENANT ACCESS VULNERABILITY (FIX-2025-01-07)
 * ============================================================================
 *
 * PROBLEMA IDENTIFICADO:
 * Este servicio NO valida que los usuarios a modificar pertenezcan a la misma
 * organización/tenant que el administrador que ejecuta la operación.
 *
 * ESCENARIO DE RIESGO:
 * 1. Admin de Organización A llama a bulkSuspendUsers()
 * 2. Incluye UUIDs de usuarios de Organización B
 * 3. El AdminGuard solo verifica el rol (admin/super_admin)
 * 4. La operación se ejecuta sin validar el tenant
 *
 * IMPACTO:
 * - Un admin_teacher podría suspender/eliminar usuarios de otras organizaciones
 * - Violación del aislamiento multi-tenant
 * - Posible compliance issue (GDPR, datos de terceros)
 *
 * SOLUCIÓN RECOMENDADA:
 * 1. Agregar validación de tenant en cada método bulk:
 *    ```typescript
 *    // Verificar que todos los userIds pertenezcan a la org del admin
 *    const users = await this.userRepo.findByIds(dto.userIds);
 *    const invalidUsers = users.filter(u => u.organization_id !== admin.organization_id);
 *    if (invalidUsers.length > 0 && admin.role !== 'super_admin') {
 *      throw new ForbiddenException('Cannot modify users from other organizations');
 *    }
 *    ```
 *
 * 2. O implementar en el Guard:
 *    ```typescript
 *    // En AdminGuard o nuevo TenantGuard
 *    if (user.role === 'admin_teacher') {
 *      // Verificar que body.userIds solo contenga usuarios del mismo tenant
 *    }
 *    ```
 *
 * 3. Usar Row Level Security (RLS) en PostgreSQL:
 *    ```sql
 *    CREATE POLICY tenant_isolation ON auth.gamilit_user
 *    FOR ALL USING (organization_id = current_setting('app.current_tenant_id'));
 *    ```
 *
 * NOTA: super_admin puede operar cross-tenant por diseño.
 *
 * PRIORIDAD: P1 (Alto) - Requiere implementación antes de producción
 * TICKET: Crear issue en backlog para implementar validación cross-tenant
 * ============================================================================
 */
@Injectable()
export class BulkOperationsService {
  private readonly logger = new Logger(BulkOperationsService.name);

  constructor(
    @InjectRepository(BulkOperation, 'auth')
    private readonly bulkOpsRepo: Repository<BulkOperation>,
    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserSuspension, 'auth')
    private readonly suspensionRepo: Repository<UserSuspension>,
    @InjectDataSource('auth')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Suspende múltiples usuarios de forma masiva
   */
  async bulkSuspendUsers(
    dto: BulkSuspendUsersDto,
    adminId: string,
  ): Promise<BulkOperationStatusDto> {
    // Crear registro de operación bulk
    const operation = await this.createBulkOperation(
      'suspend_users',
      'users',
      dto.userIds,
      adminId,
    );

    // Procesar de forma asíncrona (sin bloquear la respuesta)
    this.processBulkSuspend(operation.id, dto, adminId).catch((error) => {
      this.logger.error(`Error processing bulk suspend: ${error.message}`, error.stack);
    });

    return this.mapToDto(operation);
  }

  /**
   * Activa múltiples usuarios de forma masiva
   */
  async bulkActivateUsers(
    dto: BulkActivateUsersDto,
    adminId: string,
  ): Promise<BulkOperationStatusDto> {
    const operation = await this.createBulkOperation(
      'activate_users',
      'users',
      dto.userIds,
      adminId,
    );

    this.processBulkActivate(operation.id, dto).catch((error) => {
      this.logger.error(`Error processing bulk activate: ${error.message}`, error.stack);
    });

    return this.mapToDto(operation);
  }

  /**
   * Actualiza roles de múltiples usuarios
   */
  async bulkUpdateRole(
    dto: BulkUpdateRoleDto,
    adminId: string,
  ): Promise<BulkOperationStatusDto> {
    const operation = await this.createBulkOperation(
      'update_role',
      'users',
      dto.userIds,
      adminId,
    );

    this.processBulkUpdateRole(operation.id, dto).catch((error) => {
      this.logger.error(`Error processing bulk update role: ${error.message}`, error.stack);
    });

    return this.mapToDto(operation);
  }

  /**
   * Elimina múltiples usuarios (soft delete por defecto)
   */
  async bulkDeleteUsers(
    dto: BulkDeleteUsersDto,
    adminId: string,
  ): Promise<BulkOperationStatusDto> {
    const operation = await this.createBulkOperation(
      'delete_users',
      'users',
      dto.userIds,
      adminId,
    );

    this.processBulkDelete(operation.id, dto).catch((error) => {
      this.logger.error(`Error processing bulk delete: ${error.message}`, error.stack);
    });

    return this.mapToDto(operation);
  }

  /**
   * Obtiene el estado de una operación bulk
   */
  async getBulkOperationStatus(operationId: string): Promise<BulkOperationStatusDto> {
    const operation = await this.bulkOpsRepo.findOne({
      where: { id: operationId },
    });

    if (!operation) {
      throw new NotFoundException(`Bulk operation ${operationId} not found`);
    }

    return this.mapToDto(operation);
  }

  /**
   * Lista operaciones bulk del sistema (últimas 100)
   */
  async listBulkOperations(limit: number = 100): Promise<BulkOperationStatusDto[]> {
    const operations = await this.bulkOpsRepo.find({
      order: { started_at: 'DESC' },
      take: limit,
    });

    return operations.map((op) => this.mapToDto(op));
  }

  // ========================================
  // PRIVATE METHODS - Procesamiento
  // ========================================

  /**
   * Crea el registro inicial de operación bulk
   */
  private async createBulkOperation(
    operationType: string,
    targetEntity: string,
    targetIds: string[],
    adminId: string,
  ): Promise<BulkOperation> {
    const operation = this.bulkOpsRepo.create({
      operation_type: operationType,
      target_entity: targetEntity,
      target_ids: targetIds,
      target_count: targetIds.length,
      started_by: adminId,
      status: 'pending',
    });

    return this.bulkOpsRepo.save(operation);
  }

  /**
   * Procesa suspensión masiva de usuarios
   * Optimizado: Usa batch query en lugar de N+1 queries (FIX-2025-01-07)
   */
  private async processBulkSuspend(
    operationId: string,
    dto: BulkSuspendUsersDto,
    adminId: string,
  ): Promise<void> {
    await this.updateOperationStatus(operationId, 'running');

    const results: IBulkOperationResult[] = [];
    let completed = 0;
    let failed = 0;

    // OPTIMIZATION: Batch query - obtener todos los usuarios en una sola consulta
    const users = await this.userRepo.findByIds(dto.userIds);
    const userMap = new Map(users.map((u) => [u.id, u]));
    const notFoundIds = dto.userIds.filter((id) => !userMap.has(id));

    // Registrar usuarios no encontrados
    for (const userId of notFoundIds) {
      results.push({ userId, success: false, error: 'User not found' });
      failed++;
    }

    // Procesar usuarios encontrados
    const suspensionDate = dto.durationDays
      ? new Date(Date.now() + dto.durationDays * 24 * 60 * 60 * 1000)
      : null;

    for (const user of users) {
      try {
        // Crear registro de suspensión
        const suspension = this.suspensionRepo.create({
          user_id: user.id,
          reason: dto.reason,
          suspension_until: suspensionDate,
          suspended_by: adminId,
        });
        await this.suspensionRepo.save(suspension);

        // Marcar usuario como suspendido (soft delete)
        user.deleted_at = new Date();
        await this.userRepo.save(user);

        results.push({ userId: user.id, success: true });
        completed++;
      } catch (error: any) {
        this.logger.error(`Error suspending user ${user.id}: ${error.message}`);
        results.push({ userId: user.id, success: false, error: error.message });
        failed++;
      }

      // Actualizar progreso cada 10 usuarios
      if ((completed + failed) % 10 === 0) {
        await this.updateProgress(operationId, 10, 0);
      }
    }

    // Actualizar progreso final (incluye los not found)
    const totalProcessed = completed + failed;
    const remaining = totalProcessed % 10;
    if (remaining > 0) {
      await this.updateProgress(operationId, remaining, 0);
    }

    // Guardar resultado final
    const operation = await this.bulkOpsRepo.findOne({ where: { id: operationId } });
    if (operation) {
      operation.error_details = results.filter((r) => !r.success);
      operation.result = {
        total: dto.userIds.length,
        completed,
        failed,
        summary: `Suspended ${completed} users, ${failed} failed`,
      };
      await this.bulkOpsRepo.save(operation);
    }
  }

  /**
   * Procesa activación masiva de usuarios
   * Optimizado: Usa batch query en lugar de N+1 queries (FIX-2025-01-07)
   */
  private async processBulkActivate(
    operationId: string,
    dto: BulkActivateUsersDto,
  ): Promise<void> {
    await this.updateOperationStatus(operationId, 'running');

    let completed = 0;
    let failed = 0;

    // OPTIMIZATION: Batch query - obtener todos los usuarios en una sola consulta
    const users = await this.userRepo.findByIds(dto.userIds);
    const foundIds = new Set(users.map((u) => u.id));
    const notFoundCount = dto.userIds.filter((id) => !foundIds.has(id)).length;
    failed += notFoundCount;

    for (const user of users) {
      try {
        // Reactivar usuario (quitar soft delete)
        user.deleted_at = undefined;
        await this.userRepo.save(user);

        // Eliminar suspensiones activas
        await this.suspensionRepo.delete({ user_id: user.id });

        completed++;
      } catch (error: any) {
        this.logger.error(`Error activating user ${user.id}: ${error.message}`);
        failed++;
      }

      if ((completed + failed) % 10 === 0) {
        await this.updateProgress(operationId, 10, 0);
      }
    }

    const remaining = (completed + failed) % 10;
    if (remaining > 0) {
      await this.updateProgress(operationId, remaining, 0);
    }
  }

  /**
   * Procesa actualización masiva de roles
   * Optimizado: Usa batch UPDATE en lugar de N+1 queries (FIX-2025-01-07)
   */
  private async processBulkUpdateRole(
    operationId: string,
    dto: BulkUpdateRoleDto,
  ): Promise<void> {
    await this.updateOperationStatus(operationId, 'running');

    let completed = 0;
    let failed = 0;

    try {
      // OPTIMIZATION: Batch UPDATE - actualizar todos los roles en una sola consulta
      const result = await this.userRepo
        .createQueryBuilder()
        .update()
        .set({ role: dto.newRole })
        .whereInIds(dto.userIds)
        .execute();

      completed = result.affected ?? 0;
      failed = dto.userIds.length - completed;

      // Actualizar progreso de una vez
      await this.updateProgress(operationId, completed, failed);
    } catch (error: any) {
      this.logger.error(`Error updating roles in batch: ${error.message}`);
      // Fallback: procesar individualmente si falla el batch
      const users = await this.userRepo.findByIds(dto.userIds);
      const foundIds = new Set(users.map((u) => u.id));
      failed = dto.userIds.filter((id) => !foundIds.has(id)).length;

      for (const user of users) {
        try {
          user.role = dto.newRole;
          await this.userRepo.save(user);
          completed++;
        } catch (err: any) {
          this.logger.error(`Error updating role for user ${user.id}: ${err.message}`);
          failed++;
        }

        if ((completed + failed) % 10 === 0) {
          await this.updateProgress(operationId, 10, 0);
        }
      }

      const remaining = (completed + failed) % 10;
      if (remaining > 0) {
        await this.updateProgress(operationId, remaining, 0);
      }
    }
  }

  /**
   * Procesa eliminación masiva de usuarios
   * Optimizado: Usa batch operations en lugar de N+1 queries (FIX-2025-01-07)
   */
  private async processBulkDelete(
    operationId: string,
    dto: BulkDeleteUsersDto,
  ): Promise<void> {
    await this.updateOperationStatus(operationId, 'running');

    let completed = 0;
    let failed = 0;

    try {
      if (dto.hardDelete) {
        // OPTIMIZATION: Batch DELETE - eliminar todos en una sola consulta
        const result = await this.userRepo
          .createQueryBuilder()
          .delete()
          .whereInIds(dto.userIds)
          .execute();

        completed = result.affected ?? 0;
        failed = dto.userIds.length - completed;
      } else {
        // OPTIMIZATION: Batch UPDATE para soft delete
        const result = await this.userRepo
          .createQueryBuilder()
          .update()
          .set({ deleted_at: new Date() })
          .whereInIds(dto.userIds)
          .execute();

        completed = result.affected ?? 0;
        failed = dto.userIds.length - completed;
      }

      // Actualizar progreso de una vez
      await this.updateProgress(operationId, completed, failed);
    } catch (error: any) {
      this.logger.error(`Error in batch delete: ${error.message}`);
      // Fallback: procesar individualmente si falla el batch
      for (const userId of dto.userIds) {
        try {
          if (dto.hardDelete) {
            await this.userRepo.delete(userId);
          } else {
            const user = await this.userRepo.findOne({ where: { id: userId } });
            if (user) {
              user.deleted_at = new Date();
              await this.userRepo.save(user);
            }
          }
          completed++;
        } catch (err: any) {
          this.logger.error(`Error deleting user ${userId}: ${err.message}`);
          failed++;
        }

        if ((completed + failed) % 10 === 0) {
          await this.updateProgress(operationId, 10, 0);
        }
      }

      const remaining = (completed + failed) % 10;
      if (remaining > 0) {
        await this.updateProgress(operationId, remaining, 0);
      }
    }
  }

  /**
   * Actualiza el progreso de una operación usando la función SQL
   */
  private async updateProgress(
    operationId: string,
    completedIncrement: number,
    failedIncrement: number = 0,
  ): Promise<void> {
    await this.dataSource.query(
      'SELECT admin_dashboard.update_bulk_operation_progress($1, $2, $3)',
      [operationId, completedIncrement, failedIncrement],
    );
  }

  /**
   * Actualiza el estado de una operación
   */
  private async updateOperationStatus(
    operationId: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
  ): Promise<void> {
    await this.bulkOpsRepo.update(operationId, { status });
  }

  /**
   * Mapea entity a DTO de respuesta
   */
  private mapToDto(operation: BulkOperation): BulkOperationStatusDto {
    return {
      id: operation.id,
      operationType: operation.operation_type,
      targetEntity: operation.target_entity,
      status: operation.status,
      targetCount: operation.target_count,
      completedCount: operation.completed_count,
      failedCount: operation.failed_count,
      startedAt: operation.started_at,
      completedAt: operation.completed_at,
      errorDetails: operation.error_details,
      result: operation.result,
      startedBy: operation.started_by,
    };
  }
}
