import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import {
  LtiGradePassback,
  PassbackStatus,
} from '../entities';
import { CreateLtiGradePassbackDto, UpdateLtiGradePassbackDto } from '../dto';

/**
 * LtiGradePassbacksService
 *
 * @description Gestión de envío de calificaciones a LMS externos vía LTI AGS.
 * Implementa Assignment and Grade Services según estándar IMS Global.
 *
 * @features
 * - Registro de calificaciones para passback
 * - Cola de reintentos para envíos fallidos
 * - Tracking de estado de cada passback
 * - Soporte para activity/grading progress
 */
@Injectable()
export class LtiGradePassbacksService {
  private readonly logger = new Logger(LtiGradePassbacksService.name);

  constructor(
    @InjectRepository(LtiGradePassback, 'lti')
    private readonly passbackRepo: Repository<LtiGradePassback>,
  ) {}

  /**
   * Crea un nuevo registro de grade passback
   */
  async create(dto: CreateLtiGradePassbackDto): Promise<LtiGradePassback> {
    const scorePercentage = dto.scoreGiven && dto.scoreMaximum
      ? (dto.scoreGiven / dto.scoreMaximum) * 100
      : null;

    const passback = this.passbackRepo.create({
      ...dto,
      scoreMaximum: dto.scoreMaximum || 100,
      scorePercentage,
      passbackStatus: PassbackStatus.PENDING,
      gradedAt: new Date(),
      attemptCount: 0,
    });

    const saved = await this.passbackRepo.save(passback);
    this.logger.log(`Grade passback creado: ${saved.id} para usuario ${dto.userId}`);
    return saved;
  }

  /**
   * Obtiene un passback por ID
   */
  async findOne(id: string): Promise<LtiGradePassback> {
    const passback = await this.passbackRepo.findOne({
      where: { id },
      relations: ['session', 'user', 'consumer'],
    });
    if (!passback) {
      throw new NotFoundException(`Grade passback ${id} no encontrado`);
    }
    return passback;
  }

  /**
   * Obtiene passbacks de un usuario
   */
  async findByUser(userId: string): Promise<LtiGradePassback[]> {
    return this.passbackRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene passbacks de una sesión
   */
  async findBySession(sessionId: string): Promise<LtiGradePassback[]> {
    return this.passbackRepo.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene passbacks pendientes de envío
   */
  async findPending(): Promise<LtiGradePassback[]> {
    return this.passbackRepo.find({
      where: {
        passbackStatus: In([
          PassbackStatus.PENDING,
          PassbackStatus.RETRYING,
        ]),
      },
      order: { createdAt: 'ASC' },
      relations: ['consumer'],
    });
  }

  /**
   * Obtiene passbacks listos para reintento
   */
  async findReadyForRetry(): Promise<LtiGradePassback[]> {
    const now = new Date();
    return this.passbackRepo.find({
      where: {
        passbackStatus: PassbackStatus.RETRYING,
        nextRetryAt: LessThanOrEqual(now),
      },
      relations: ['consumer'],
    });
  }

  /**
   * Actualiza un passback
   */
  async update(
    id: string,
    dto: UpdateLtiGradePassbackDto,
  ): Promise<LtiGradePassback> {
    const passback = await this.findOne(id);
    Object.assign(passback, dto);

    // Recalcular porcentaje si cambió el score
    if (dto.scoreGiven !== undefined) {
      passback.scorePercentage = (dto.scoreGiven / passback.scoreMaximum) * 100;
    }

    return this.passbackRepo.save(passback);
  }

  /**
   * Marca passback como enviándose
   */
  async markSending(id: string): Promise<void> {
    const passback = await this.findOne(id);
    passback.passbackStatus = PassbackStatus.SENDING;
    passback.attemptCount += 1;

    if (!passback.firstSentAt) {
      passback.firstSentAt = new Date();
    }
    passback.lastSentAt = new Date();

    await this.passbackRepo.save(passback);
  }

  /**
   * Marca passback como exitoso
   */
  async markSuccess(
    id: string,
    lmsResponse?: Record<string, unknown>,
    lmsResponseCode?: number,
  ): Promise<void> {
    const passback = await this.findOne(id);
    passback.passbackStatus = PassbackStatus.SUCCESS;
    passback.successAt = new Date();
    passback.lmsResponse = lmsResponse || null;
    passback.lmsResponseCode = lmsResponseCode || 200;
    passback.errorMessage = null;

    await this.passbackRepo.save(passback);
    this.logger.log(`Grade passback exitoso: ${id}`);
  }

  /**
   * Marca passback como fallido
   */
  async markFailed(
    id: string,
    errorMessage: string,
    lmsResponse?: Record<string, unknown>,
    lmsResponseCode?: number,
  ): Promise<void> {
    const passback = await this.findOne(id);

    passback.lmsResponse = lmsResponse || null;
    passback.lmsResponseCode = lmsResponseCode || null;
    passback.errorMessage = errorMessage;

    // Decidir si reintentar
    if (passback.attemptCount < passback.maxRetries) {
      passback.passbackStatus = PassbackStatus.RETRYING;
      // Backoff exponencial: 1min, 5min, 30min
      const delayMinutes = Math.pow(5, passback.attemptCount);
      passback.nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
      this.logger.warn(
        `Grade passback ${id} fallido, reintentando en ${delayMinutes} min`,
      );
    } else {
      passback.passbackStatus = PassbackStatus.FAILED;
      this.logger.error(`Grade passback ${id} fallido permanentemente: ${errorMessage}`);
    }

    await this.passbackRepo.save(passback);
  }

  /**
   * Obtiene estadísticas de passbacks
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    success: number;
    failed: number;
    retrying: number;
  }> {
    const [total, pending, success, failed, retrying] = await Promise.all([
      this.passbackRepo.count(),
      this.passbackRepo.count({ where: { passbackStatus: PassbackStatus.PENDING } }),
      this.passbackRepo.count({ where: { passbackStatus: PassbackStatus.SUCCESS } }),
      this.passbackRepo.count({ where: { passbackStatus: PassbackStatus.FAILED } }),
      this.passbackRepo.count({ where: { passbackStatus: PassbackStatus.RETRYING } }),
    ]);
    return { total, pending, success, failed, retrying };
  }
}
