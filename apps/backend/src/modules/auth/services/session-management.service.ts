import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as crypto from 'crypto';
import { UserSession } from '../entities';
import { CreateUserSessionDto, UpdateUserSessionDto, UserSessionResponseDto } from '../dto';
import { DB_SCHEMAS, DeviceTypeEnum } from '@/shared/constants';

/**
 * SessionManagementService
 *
 * @description Gestión de sesiones de usuario.
 *
 * @constraints
 * - Máximo 5 sesiones concurrentes por usuario
 * - Al crear la 6ta, se elimina la más antigua
 * - Sesiones expiradas se limpian periódicamente
 *
 * @security
 * - Refresh tokens hasheados con SHA256
 * - Validación de ownership en revoke
 * - Actualización de last_activity_at en cada validación
 */
@Injectable()
export class SessionManagementService {
  private readonly MAX_SESSIONS_PER_USER = 5;

  constructor(
    @InjectRepository(UserSession, 'auth')
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  /**
   * Crear nueva sesión
   */
  async createSession(dto: CreateUserSessionDto): Promise<UserSession> {
    // 1. Limpiar sesiones expiradas del usuario
    await this.deleteExpiredSessions(dto.user_id);

    // 2. Contar sesiones activas
    const activeSessions = await this.countActiveSessions(dto.user_id);

    // 3. Si tiene 5+ sesiones, eliminar la más antigua
    if (activeSessions >= this.MAX_SESSIONS_PER_USER) {
      await this.deleteOldestSession(dto.user_id);
    }

    // 4. Hashear refresh token
    const hashedRefreshToken = dto.refresh_token ? this.hashToken(dto.refresh_token) : '';

    // 5. Crear sesión
    const session = this.sessionRepository.create({
      ...dto,
      refresh_token: hashedRefreshToken,
      expires_at: new Date(dto.expires_at),
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Validar sesión y actualizar actividad
   */
  async validateSession(sessionId: string): Promise<UserSession | null> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      return null;
    }

    // Validar expiración
    if (new Date() > session.expires_at) {
      await this.sessionRepository.delete({ id: sessionId });
      return null;
    }

    // Actualizar última actividad
    session.last_activity_at = new Date();
    await this.sessionRepository.save(session);

    return session;
  }

  /**
   * Renovar sesión (refresh token)
   */
  async refreshSession(sessionId: string, newExpiresAt: Date): Promise<UserSession> {
    const session = await this.validateSession(sessionId);

    if (!session) {
      throw new NotFoundException('Sesión no encontrada o expirada');
    }

    session.expires_at = newExpiresAt;
    session.last_activity_at = new Date();

    return this.sessionRepository.save(session);
  }

  /**
   * Revocar sesión específica
   *
   * @param sessionId - ID de la sesión a revocar
   * @param userId - ID del usuario propietario (validación de ownership)
   * @returns Mensaje de confirmación
   * @throws NotFoundException si la sesión no existe o no pertenece al usuario
   */
  async revokeSession(sessionId: string, userId: string): Promise<{ message: string }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    session.is_active = false;
    // NOTE: revoked_at se establece si la columna existe en BD
    // TypeORM ignorará el campo si no existe en la tabla
    (session as any).revoked_at = new Date();
    await this.sessionRepository.save(session);

    return { message: 'Sesión cerrada correctamente' };
  }

  /**
   * Revocar todas las sesiones del usuario excepto la actual
   *
   * @param userId - ID del usuario
   * @param currentSessionId - ID de la sesión actual a excluir
   * @returns Mensaje de confirmación y cantidad de sesiones cerradas
   */
  async revokeAllSessions(userId: string, currentSessionId: string): Promise<{ message: string; count: number }> {
    const sessions = await this.sessionRepository.find({
      where: {
        user_id: userId,
        is_active: true,
      },
    });

    // Filtrar todas excepto la sesión actual
    const sessionsToRevoke = sessions.filter(s => s.id !== currentSessionId);

    // Marcar como inactivas
    const now = new Date();
    for (const session of sessionsToRevoke) {
      session.is_active = false;
      // NOTE: revoked_at se establece si la columna existe en BD
      // TypeORM ignorará el campo si no existe en la tabla
      (session as any).revoked_at = now;
    }

    await this.sessionRepository.save(sessionsToRevoke);

    return {
      message: 'Sesiones cerradas correctamente',
      count: sessionsToRevoke.length,
    };
  }

  /**
   * Limpiar sesiones expiradas (cron job)
   */
  async cleanExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository.delete({
      expires_at: LessThan(new Date()),
    });

    return result.affected || 0;
  }

  /**
   * Obtener sesiones activas del usuario
   *
   * @param userId - ID del usuario
   * @returns Lista de sesiones activas ordenadas por última actividad
   */
  async getSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: {
        user_id: userId,
        is_active: true,
      },
      order: { last_activity_at: 'DESC' },
      select: ['id', 'device_type', 'browser', 'os', 'ip_address', 'user_agent', 'created_at', 'last_activity_at', 'country', 'city'],
    });
  }

  /**
   * Helper: Contar sesiones activas
   */
  private async countActiveSessions(userId: string): Promise<number> {
    return this.sessionRepository.count({
      where: { user_id: userId },
    });
  }

  /**
   * Helper: Eliminar sesión más antigua
   */
  private async deleteOldestSession(userId: string): Promise<void> {
    const oldestSession = await this.sessionRepository.findOne({
      where: { user_id: userId },
      order: { created_at: 'ASC' },
    });

    if (oldestSession) {
      await this.sessionRepository.delete({ id: oldestSession.id });
    }
  }

  /**
   * Helper: Eliminar sesiones expiradas de un usuario
   */
  private async deleteExpiredSessions(userId: string): Promise<void> {
    await this.sessionRepository.delete({
      user_id: userId,
      expires_at: LessThan(new Date()),
    });
  }

  /**
   * Helper: Hashear token con SHA256
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
