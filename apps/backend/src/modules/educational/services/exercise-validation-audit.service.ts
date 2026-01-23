import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ExerciseValidationAudit } from '../entities';
import {
  QueryValidationAuditDto,
  PaginatedValidationAuditResponseDto,
} from '../dto';

/**
 * ExerciseValidationAuditService
 *
 * @description Servicio para consultar y gestionar registros de auditoria de validaciones.
 *              Almacena snapshots inmutables para trazabilidad y recalculo.
 *
 * @see ExerciseValidationAudit entity
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/26-exercise_validation_audit.sql
 */
@Injectable()
export class ExerciseValidationAuditService {
  constructor(
    @InjectRepository(ExerciseValidationAudit, 'educational')
    private readonly auditRepository: Repository<ExerciseValidationAudit>,
  ) {}

  /**
   * Obtener registro de auditoria por ID
   *
   * @param id - ID del registro (UUID)
   * @returns Registro encontrado o null
   */
  async findById(id: string): Promise<ExerciseValidationAudit | null> {
    return this.auditRepository.findOne({
      where: { id },
      relations: ['exercise'],
    });
  }

  /**
   * Obtener registros de auditoria por ejercicio
   *
   * @param exerciseId - ID del ejercicio
   * @returns Array de registros ordenados por fecha descendente
   */
  async findByExerciseId(exerciseId: string): Promise<ExerciseValidationAudit[]> {
    return this.auditRepository.find({
      where: { exerciseId },
      order: { submittedAt: 'DESC' },
    });
  }

  /**
   * Obtener registros de auditoria por usuario
   *
   * @param userId - ID del usuario
   * @returns Array de registros ordenados por fecha descendente
   */
  async findByUserId(userId: string): Promise<ExerciseValidationAudit[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { submittedAt: 'DESC' },
      relations: ['exercise'],
    });
  }

  /**
   * Obtener registros de auditoria por ejercicio y usuario
   *
   * @param exerciseId - ID del ejercicio
   * @param userId - ID del usuario
   * @returns Array de registros ordenados por numero de intento
   */
  async findByExerciseAndUser(
    exerciseId: string,
    userId: string,
  ): Promise<ExerciseValidationAudit[]> {
    return this.auditRepository.find({
      where: { exerciseId, userId },
      order: { attemptNumber: 'ASC' },
    });
  }

  /**
   * Obtener el ultimo intento de un usuario para un ejercicio
   *
   * @param exerciseId - ID del ejercicio
   * @param userId - ID del usuario
   * @returns Ultimo registro de auditoria o null
   */
  async findLatestAttempt(
    exerciseId: string,
    userId: string,
  ): Promise<ExerciseValidationAudit | null> {
    return this.auditRepository.findOne({
      where: { exerciseId, userId },
      order: { attemptNumber: 'DESC' },
    });
  }

  /**
   * Consultar registros con filtros y paginacion
   *
   * @param query - Filtros y opciones de paginacion
   * @returns Respuesta paginada
   */
  async findWithFilters(
    query: QueryValidationAuditDto,
  ): Promise<PaginatedValidationAuditResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Construir condiciones de busqueda
    const where: FindOptionsWhere<ExerciseValidationAudit> = {};

    if (query.exerciseId) {
      where.exerciseId = query.exerciseId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.hasDiscrepancy !== undefined) {
      where.hasDiscrepancy = query.hasDiscrepancy;
    }

    if (query.isRecalculated !== undefined) {
      where.isRecalculated = query.isRecalculated;
    }

    // Filtros de fecha
    if (query.fromDate && query.toDate) {
      where.submittedAt = Between(new Date(query.fromDate), new Date(query.toDate));
    } else if (query.fromDate) {
      where.submittedAt = MoreThanOrEqual(new Date(query.fromDate));
    } else if (query.toDate) {
      where.submittedAt = LessThanOrEqual(new Date(query.toDate));
    }

    // Ejecutar consulta con paginacion
    const [data, total] = await this.auditRepository.findAndCount({
      where,
      order: { submittedAt: 'DESC' },
      skip,
      take: limit,
      relations: ['exercise'],
    });

    return {
      data: data as any[], // Cast to DTO type
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener registros con discrepancias
   *
   * @param exerciseId - Opcional: filtrar por ejercicio
   * @returns Array de registros con discrepancia
   */
  async findWithDiscrepancies(exerciseId?: string): Promise<ExerciseValidationAudit[]> {
    const where: FindOptionsWhere<ExerciseValidationAudit> = {
      hasDiscrepancy: true,
    };

    if (exerciseId) {
      where.exerciseId = exerciseId;
    }

    return this.auditRepository.find({
      where,
      order: { submittedAt: 'DESC' },
      relations: ['exercise'],
    });
  }

  /**
   * Obtener registros recalculados
   *
   * @param exerciseId - Opcional: filtrar por ejercicio
   * @returns Array de registros recalculados
   */
  async findRecalculated(exerciseId?: string): Promise<ExerciseValidationAudit[]> {
    const where: FindOptionsWhere<ExerciseValidationAudit> = {
      isRecalculated: true,
    };

    if (exerciseId) {
      where.exerciseId = exerciseId;
    }

    return this.auditRepository.find({
      where,
      order: { recalculatedAt: 'DESC' },
      relations: ['exercise', 'originalAudit'],
    });
  }

  /**
   * Marcar un registro como recalculado
   *
   * @param id - ID del registro original
   * @param recalculatedById - ID del usuario que recalcula
   * @param reason - Razon del recalculo
   * @param newScore - Nuevo puntaje (opcional)
   * @returns Registro actualizado
   * @throws NotFoundException si no existe
   */
  async markAsRecalculated(
    id: string,
    recalculatedById: string,
    reason: string,
    newScore?: number,
  ): Promise<ExerciseValidationAudit> {
    const audit = await this.findById(id);
    if (!audit) {
      throw new NotFoundException(`Audit record with ID ${id} not found`);
    }

    audit.isRecalculated = true;
    audit.recalculatedAt = new Date();
    audit.recalculatedBy = recalculatedById;
    audit.recalculationReason = reason;

    if (newScore !== undefined) {
      audit.score = newScore;
      audit.isCorrect = newScore >= audit.maxScore * 0.7; // 70% threshold
    }

    return this.auditRepository.save(audit);
  }

  /**
   * Marcar discrepancia en un registro
   *
   * @param id - ID del registro
   * @param type - Tipo de discrepancia
   * @param notes - Notas adicionales
   * @returns Registro actualizado
   * @throws NotFoundException si no existe
   */
  async markDiscrepancy(
    id: string,
    type: string,
    notes?: string,
  ): Promise<ExerciseValidationAudit> {
    const audit = await this.findById(id);
    if (!audit) {
      throw new NotFoundException(`Audit record with ID ${id} not found`);
    }

    audit.hasDiscrepancy = true;
    audit.discrepancyType = type;
    audit.discrepancyNotes = notes ?? null;

    return this.auditRepository.save(audit);
  }

  /**
   * Obtener estadisticas de validacion para un ejercicio
   *
   * @param exerciseId - ID del ejercicio
   * @returns Estadisticas de validacion
   */
  async getExerciseStats(exerciseId: string): Promise<{
    totalAttempts: number;
    uniqueUsers: number;
    avgScore: number;
    passRate: number;
    avgTimeMs: number;
    discrepancyCount: number;
  }> {
    const result = await this.auditRepository
      .createQueryBuilder('audit')
      .select('COUNT(*)', 'totalAttempts')
      .addSelect('COUNT(DISTINCT audit.userId)', 'uniqueUsers')
      .addSelect('AVG(audit.score)', 'avgScore')
      .addSelect('AVG(CASE WHEN audit.isCorrect THEN 1 ELSE 0 END) * 100', 'passRate')
      .addSelect('AVG(audit.validationDurationMs)', 'avgTimeMs')
      .addSelect('SUM(CASE WHEN audit.hasDiscrepancy THEN 1 ELSE 0 END)', 'discrepancyCount')
      .where('audit.exerciseId = :exerciseId', { exerciseId })
      .getRawOne();

    return {
      totalAttempts: parseInt(result.totalAttempts, 10) || 0,
      uniqueUsers: parseInt(result.uniqueUsers, 10) || 0,
      avgScore: parseFloat(result.avgScore) || 0,
      passRate: parseFloat(result.passRate) || 0,
      avgTimeMs: parseFloat(result.avgTimeMs) || 0,
      discrepancyCount: parseInt(result.discrepancyCount, 10) || 0,
    };
  }
}
