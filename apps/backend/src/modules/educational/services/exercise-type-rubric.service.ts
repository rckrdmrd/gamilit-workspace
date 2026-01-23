import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseTypeRubric } from '../entities';
import {
  CreateExerciseTypeRubricDto,
  UpdateExerciseTypeRubricDto,
} from '../dto';

/**
 * ExerciseTypeRubricService
 *
 * @description Servicio para gestionar rubricas estandar por tipo de ejercicio.
 *              Define criterios de evaluacion para M3, M4, M5 que requieren calificacion manual.
 *
 * @see ExerciseTypeRubric entity
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/27-exercise_type_rubrics.sql
 */
@Injectable()
export class ExerciseTypeRubricService {
  constructor(
    @InjectRepository(ExerciseTypeRubric, 'educational')
    private readonly rubricRepository: Repository<ExerciseTypeRubric>,
  ) {}

  /**
   * Obtener todas las rubricas
   *
   * @returns Array de rubricas ordenadas por exerciseType
   */
  async findAll(): Promise<ExerciseTypeRubric[]> {
    return this.rubricRepository.find({
      order: { exerciseType: 'ASC' },
    });
  }

  /**
   * Obtener una rubrica por ID
   *
   * @param id - ID de la rubrica (UUID)
   * @returns Rubrica encontrada o null
   */
  async findById(id: string): Promise<ExerciseTypeRubric | null> {
    return this.rubricRepository.findOne({ where: { id } });
  }

  /**
   * Obtener rubrica por tipo de ejercicio
   *
   * @param exerciseType - Tipo de ejercicio (ej: 'verificador_fake_news')
   * @returns Rubrica por defecto para el tipo de ejercicio
   */
  async findByExerciseType(exerciseType: string): Promise<ExerciseTypeRubric | null> {
    return this.rubricRepository.findOne({
      where: {
        exerciseType,
        isDefault: true,
      },
    });
  }

  /**
   * Obtener todas las rubricas para un tipo de ejercicio
   *
   * @param exerciseType - Tipo de ejercicio
   * @returns Array de rubricas para ese tipo
   */
  async findAllByExerciseType(exerciseType: string): Promise<ExerciseTypeRubric[]> {
    return this.rubricRepository.find({
      where: { exerciseType },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * Obtener rubricas por codigo de modulo
   *
   * @param moduleCode - Codigo del modulo (M3, M4, M5)
   * @returns Array de rubricas del modulo
   */
  async findByModuleCode(moduleCode: string): Promise<ExerciseTypeRubric[]> {
    return this.rubricRepository.find({
      where: { moduleCode },
      order: { exerciseType: 'ASC' },
    });
  }

  /**
   * Crear una nueva rubrica
   *
   * @param dto - Datos de la rubrica a crear
   * @returns Rubrica creada
   * @throws ConflictException si ya existe rubrica por defecto para ese tipo
   */
  async create(dto: CreateExerciseTypeRubricDto): Promise<ExerciseTypeRubric> {
    // Validar suma de pesos
    const totalWeight = dto.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      throw new ConflictException(
        `Criteria weights must sum to 100, got ${totalWeight}`,
      );
    }

    // Si se marca como default, verificar que no exista otra por defecto
    if (dto.isDefault !== false) {
      const existing = await this.findByExerciseType(dto.exerciseType);
      if (existing) {
        throw new ConflictException(
          `Default rubric already exists for exercise type: ${dto.exerciseType}`,
        );
      }
    }

    const rubric = this.rubricRepository.create({
      exerciseType: dto.exerciseType,
      rubricName: dto.rubricName,
      criteria: dto.criteria,
      totalWeight: totalWeight,
      isDefault: dto.isDefault ?? true,
      moduleCode: dto.moduleCode ?? null,
    });

    return this.rubricRepository.save(rubric);
  }

  /**
   * Actualizar una rubrica existente
   *
   * @param id - ID de la rubrica
   * @param dto - Datos a actualizar
   * @returns Rubrica actualizada
   * @throws NotFoundException si no existe
   */
  async update(id: string, dto: UpdateExerciseTypeRubricDto): Promise<ExerciseTypeRubric> {
    const rubric = await this.findById(id);
    if (!rubric) {
      throw new NotFoundException(`Rubric with ID ${id} not found`);
    }

    // Si se actualizan criterios, validar suma de pesos
    if (dto.criteria) {
      const totalWeight = dto.criteria.reduce((sum, c) => sum + c.weight, 0);
      if (totalWeight !== 100) {
        throw new ConflictException(
          `Criteria weights must sum to 100, got ${totalWeight}`,
        );
      }
      rubric.totalWeight = totalWeight;
    }

    // Si se cambia a default, verificar que no exista otra
    if (dto.isDefault === true && !rubric.isDefault) {
      const exerciseType = dto.exerciseType || rubric.exerciseType;
      const existing = await this.rubricRepository.findOne({
        where: {
          exerciseType,
          isDefault: true,
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Default rubric already exists for exercise type: ${exerciseType}`,
        );
      }
    }

    Object.assign(rubric, dto);
    return this.rubricRepository.save(rubric);
  }

  /**
   * Eliminar una rubrica
   *
   * @param id - ID de la rubrica
   * @throws NotFoundException si no existe
   */
  async delete(id: string): Promise<void> {
    const rubric = await this.findById(id);
    if (!rubric) {
      throw new NotFoundException(`Rubric with ID ${id} not found`);
    }

    await this.rubricRepository.delete(id);
  }

  /**
   * Establecer rubrica como por defecto para su tipo de ejercicio
   *
   * @param id - ID de la rubrica a establecer como default
   * @returns Rubrica actualizada
   * @throws NotFoundException si no existe
   */
  async setAsDefault(id: string): Promise<ExerciseTypeRubric> {
    const rubric = await this.findById(id);
    if (!rubric) {
      throw new NotFoundException(`Rubric with ID ${id} not found`);
    }

    // Quitar default de la actual
    await this.rubricRepository.update(
      { exerciseType: rubric.exerciseType, isDefault: true },
      { isDefault: false },
    );

    // Establecer esta como default
    rubric.isDefault = true;
    return this.rubricRepository.save(rubric);
  }
}
