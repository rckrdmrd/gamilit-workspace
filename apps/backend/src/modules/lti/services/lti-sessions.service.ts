import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { LtiSession } from '../entities';
import { CreateLtiSessionDto } from '../dto';

/**
 * LtiSessionsService
 *
 * @description Gestión de sesiones LTI (launches desde LMS externos).
 * Tracking de actividad de usuarios que acceden desde Canvas, Moodle, etc.
 *
 * @features
 * - Creación de sesiones post-launch
 * - Tracking de actividad
 * - Limpieza de sesiones expiradas
 * - Vinculación usuario LMS ↔ usuario Gamilit
 */
@Injectable()
export class LtiSessionsService {
  private readonly logger = new Logger(LtiSessionsService.name);

  constructor(
    @InjectRepository(LtiSession, 'lti')
    private readonly sessionRepo: Repository<LtiSession>,
  ) {}

  /**
   * Crea una nueva sesión LTI
   */
  async create(dto: CreateLtiSessionDto): Promise<LtiSession> {
    const session = this.sessionRepo.create({
      ...dto,
      isActive: true,
    });

    const saved = await this.sessionRepo.save(session);
    this.logger.log(`LTI Session creada: ${saved.launchId} (${saved.id})`);
    return saved;
  }

  /**
   * Obtiene una sesión por ID
   */
  async findOne(id: string): Promise<LtiSession> {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['consumer', 'user'],
    });
    if (!session) {
      throw new NotFoundException(`LTI Session ${id} no encontrada`);
    }
    return session;
  }

  /**
   * Obtiene sesión por launchId
   */
  async findByLaunchId(launchId: string): Promise<LtiSession | null> {
    return this.sessionRepo.findOne({
      where: { launchId, isActive: true },
      relations: ['consumer'],
    });
  }

  /**
   * Obtiene sesiones activas de un usuario
   */
  async findActiveByUser(userId: string): Promise<LtiSession[]> {
    return this.sessionRepo.find({
      where: { userId, isActive: true },
      order: { launchedAt: 'DESC' },
      relations: ['consumer'],
    });
  }

  /**
   * Obtiene sesiones activas de un consumer
   */
  async findActiveByConsumer(consumerId: string): Promise<LtiSession[]> {
    return this.sessionRepo.find({
      where: { consumerId, isActive: true },
      order: { launchedAt: 'DESC' },
    });
  }

  /**
   * Vincula sesión con usuario de Gamilit
   */
  async linkUser(sessionId: string, userId: string): Promise<LtiSession> {
    const session = await this.findOne(sessionId);
    session.userId = userId;
    return this.sessionRepo.save(session);
  }

  /**
   * Actualiza timestamp de última actividad
   */
  async updateActivity(id: string): Promise<void> {
    await this.sessionRepo.update(id, { lastActivityAt: new Date() });
  }

  /**
   * Termina una sesión
   */
  async endSession(id: string): Promise<void> {
    const session = await this.findOne(id);
    session.isActive = false;
    session.endedAt = new Date();
    await this.sessionRepo.save(session);
    this.logger.log(`LTI Session terminada: ${session.launchId} (${id})`);
  }

  /**
   * Termina todas las sesiones de un usuario
   */
  async endUserSessions(userId: string): Promise<number> {
    const result = await this.sessionRepo.update(
      { userId, isActive: true },
      { isActive: false, endedAt: new Date() },
    );
    return result.affected || 0;
  }

  /**
   * Limpia sesiones expiradas (más de 24 horas sin actividad)
   */
  async cleanupExpired(hoursOld: number = 24): Promise<number> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hoursOld);

    const result = await this.sessionRepo.update(
      {
        isActive: true,
        lastActivityAt: LessThan(cutoff),
      },
      { isActive: false, endedAt: new Date() },
    );

    if (result.affected && result.affected > 0) {
      this.logger.log(`Sesiones LTI expiradas limpiadas: ${result.affected}`);
    }

    return result.affected || 0;
  }

  /**
   * Obtiene estadísticas de sesiones
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    today: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, active] = await Promise.all([
      this.sessionRepo.count(),
      this.sessionRepo.count({ where: { isActive: true } }),
    ]);

    // Count sessions started today
    const todayCount = await this.sessionRepo
      .createQueryBuilder('session')
      .where('session.launchedAt >= :today', { today })
      .getCount();

    return { total, active, today: todayCount };
  }
}
