import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LtiConsumer } from '../entities';
import { CreateLtiConsumerDto, UpdateLtiConsumerDto } from '../dto';

/**
 * LtiConsumersService
 *
 * @description Gestión de LTI Consumers (configuración de LMS externos).
 * Implementa CRUD para plataformas LMS que integran con Gamilit vía LTI 1.3.
 *
 * @features
 * - Registro de nuevos LMS
 * - Configuración OAuth 2.0 / OIDC
 * - Gestión de capacidades LTI Advantage
 * - Multi-tenancy support
 */
@Injectable()
export class LtiConsumersService {
  private readonly logger = new Logger(LtiConsumersService.name);

  constructor(
    @InjectRepository(LtiConsumer, 'lti')
    private readonly consumerRepo: Repository<LtiConsumer>,
  ) {}

  /**
   * Obtiene todos los consumers activos
   */
  async findAll(): Promise<LtiConsumer[]> {
    return this.consumerRepo.find({
      where: { isActive: true },
      order: { platformName: 'ASC' },
    });
  }

  /**
   * Obtiene un consumer por ID
   */
  async findOne(id: string): Promise<LtiConsumer> {
    const consumer = await this.consumerRepo.findOne({ where: { id } });
    if (!consumer) {
      throw new NotFoundException(`LTI Consumer ${id} no encontrado`);
    }
    return consumer;
  }

  /**
   * Busca consumer por platformId y clientId
   */
  async findByPlatformAndClient(
    platformId: string,
    clientId: string,
  ): Promise<LtiConsumer | null> {
    return this.consumerRepo.findOne({
      where: { platformId, clientId, isActive: true },
    });
  }

  /**
   * Busca consumers por tenant
   */
  async findByTenant(tenantId: string): Promise<LtiConsumer[]> {
    return this.consumerRepo.find({
      where: { tenantId, isActive: true },
      order: { platformName: 'ASC' },
    });
  }

  /**
   * Registra un nuevo LTI Consumer
   */
  async create(
    dto: CreateLtiConsumerDto,
    createdBy?: string,
  ): Promise<LtiConsumer> {
    // Verificar duplicados
    const existing = await this.consumerRepo.findOne({
      where: {
        platformId: dto.platformId,
        clientId: dto.clientId,
        deploymentId: dto.deploymentId || undefined,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un consumer con platformId=${dto.platformId}, clientId=${dto.clientId}`,
      );
    }

    const consumer = this.consumerRepo.create({
      ...dto,
      createdBy,
      isActive: true,
      isVerified: false,
    });

    const saved = await this.consumerRepo.save(consumer);
    this.logger.log(`LTI Consumer creado: ${saved.platformName} (${saved.id})`);
    return saved;
  }

  /**
   * Actualiza un LTI Consumer
   */
  async update(id: string, dto: UpdateLtiConsumerDto): Promise<LtiConsumer> {
    const consumer = await this.findOne(id);

    Object.assign(consumer, dto);
    const updated = await this.consumerRepo.save(consumer);

    this.logger.log(`LTI Consumer actualizado: ${updated.platformName} (${id})`);
    return updated;
  }

  /**
   * Desactiva un LTI Consumer (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    const consumer = await this.findOne(id);
    consumer.isActive = false;
    await this.consumerRepo.save(consumer);
    this.logger.log(`LTI Consumer desactivado: ${consumer.platformName} (${id})`);
  }

  /**
   * Reactiva un LTI Consumer
   */
  async activate(id: string): Promise<LtiConsumer> {
    const consumer = await this.consumerRepo.findOne({ where: { id } });
    if (!consumer) {
      throw new NotFoundException(`LTI Consumer ${id} no encontrado`);
    }
    consumer.isActive = true;
    return this.consumerRepo.save(consumer);
  }

  /**
   * Marca como verificado un consumer
   */
  async verify(id: string): Promise<LtiConsumer> {
    const consumer = await this.findOne(id);
    consumer.isVerified = true;
    return this.consumerRepo.save(consumer);
  }

  /**
   * Actualiza timestamp de último uso
   */
  async updateLastUsed(id: string): Promise<void> {
    await this.consumerRepo.update(id, { lastUsedAt: new Date() });
  }

  /**
   * Cuenta consumers por estado
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    verified: number;
  }> {
    const [total, active, verified] = await Promise.all([
      this.consumerRepo.count(),
      this.consumerRepo.count({ where: { isActive: true } }),
      this.consumerRepo.count({ where: { isVerified: true } }),
    ]);
    return { total, active, verified };
  }
}
