import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseValidationConfig } from '../entities';
import { UpsertValidationConfigDto } from '../dto';

/**
 * ExerciseValidationConfigService
 *
 * @description Servicio para gestionar configuracion de validacion de ejercicios.
 *              Sistema Dual ADR-008: Define funcion SQL y parametros de validacion.
 *
 * @see ExerciseValidationConfig entity
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/22-exercise_validation_config.sql
 */
@Injectable()
export class ExerciseValidationConfigService {
  constructor(
    @InjectRepository(ExerciseValidationConfig, 'educational')
    private readonly configRepository: Repository<ExerciseValidationConfig>,
  ) {}

  /**
   * Obtener todas las configuraciones de validacion
   *
   * @returns Array de configuraciones ordenadas por exerciseType
   */
  async findAll(): Promise<ExerciseValidationConfig[]> {
    return this.configRepository.find({
      order: { exerciseType: 'ASC' },
    });
  }

  /**
   * Obtener configuracion por ID
   *
   * @param id - ID de la configuracion (UUID)
   * @returns Configuracion encontrada o null
   */
  async findById(id: string): Promise<ExerciseValidationConfig | null> {
    return this.configRepository.findOne({ where: { id } });
  }

  /**
   * Obtener configuracion por tipo de ejercicio
   *
   * @param exerciseType - Tipo de ejercicio (ej: 'crucigrama')
   * @returns Configuracion para el tipo de ejercicio
   */
  async findByExerciseType(exerciseType: string): Promise<ExerciseValidationConfig | null> {
    return this.configRepository.findOne({
      where: { exerciseType },
    });
  }

  /**
   * Obtener configuraciones por funcion de validacion
   *
   * @param validationFunction - Nombre de la funcion SQL
   * @returns Array de configuraciones que usan esa funcion
   */
  async findByValidationFunction(validationFunction: string): Promise<ExerciseValidationConfig[]> {
    return this.configRepository.find({
      where: { validationFunction },
      order: { exerciseType: 'ASC' },
    });
  }

  /**
   * Crear o actualizar configuracion de validacion (upsert)
   *
   * @param dto - Datos de la configuracion
   * @returns Configuracion creada o actualizada
   */
  async upsert(dto: UpsertValidationConfigDto): Promise<ExerciseValidationConfig> {
    const existing = await this.findByExerciseType(dto.exerciseType);

    if (existing) {
      // Actualizar existente
      Object.assign(existing, {
        validationFunction: dto.validationFunction,
        caseSensitive: dto.caseSensitive ?? existing.caseSensitive,
        allowPartialCredit: dto.allowPartialCredit ?? existing.allowPartialCredit,
        fuzzyMatchingThreshold: dto.fuzzyMatchingThreshold ?? existing.fuzzyMatchingThreshold,
        normalizeText: dto.normalizeText ?? existing.normalizeText,
        specialRules: dto.specialRules ?? existing.specialRules,
        defaultMaxPoints: dto.defaultMaxPoints ?? existing.defaultMaxPoints,
        defaultPassingScore: dto.defaultPassingScore ?? existing.defaultPassingScore,
        description: dto.description ?? existing.description,
        examples: dto.examples ?? existing.examples,
      });

      return this.configRepository.save(existing);
    }

    // Crear nuevo
    const config = this.configRepository.create({
      exerciseType: dto.exerciseType,
      validationFunction: dto.validationFunction,
      caseSensitive: dto.caseSensitive ?? false,
      allowPartialCredit: dto.allowPartialCredit ?? false,
      fuzzyMatchingThreshold: dto.fuzzyMatchingThreshold ?? null,
      normalizeText: dto.normalizeText ?? true,
      specialRules: dto.specialRules ?? {},
      defaultMaxPoints: dto.defaultMaxPoints ?? 100,
      defaultPassingScore: dto.defaultPassingScore ?? 70,
      description: dto.description ?? null,
      examples: dto.examples ?? null,
    });

    return this.configRepository.save(config);
  }

  /**
   * Actualizar configuracion existente
   *
   * @param id - ID de la configuracion
   * @param dto - Datos a actualizar
   * @returns Configuracion actualizada
   * @throws NotFoundException si no existe
   */
  async update(id: string, dto: Partial<UpsertValidationConfigDto>): Promise<ExerciseValidationConfig> {
    const config = await this.findById(id);
    if (!config) {
      throw new NotFoundException(`Validation config with ID ${id} not found`);
    }

    Object.assign(config, dto);
    return this.configRepository.save(config);
  }

  /**
   * Eliminar configuracion
   *
   * @param id - ID de la configuracion
   * @throws NotFoundException si no existe
   */
  async delete(id: string): Promise<void> {
    const config = await this.findById(id);
    if (!config) {
      throw new NotFoundException(`Validation config with ID ${id} not found`);
    }

    await this.configRepository.delete(id);
  }

  /**
   * Obtener todas las funciones de validacion disponibles
   *
   * @returns Array de nombres de funciones de validacion unicas
   */
  async getAvailableValidationFunctions(): Promise<string[]> {
    const configs = await this.configRepository
      .createQueryBuilder('config')
      .select('DISTINCT config.validationFunction', 'validationFunction')
      .orderBy('config.validationFunction', 'ASC')
      .getRawMany();

    return configs.map(c => c.validationFunction);
  }
}
