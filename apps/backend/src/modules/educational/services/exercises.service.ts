import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../entities';
import { DB_SCHEMAS } from '@shared/constants';
import { ExerciseTypeEnum } from '@shared/constants/enums.constants';

/**
 * ExercisesService
 *
 * Servicio para gestionar ejercicios educativos con 27+ tipos diferentes.
 * Incluye validación de JSONB según el tipo de ejercicio y gestión de pistas.
 */
@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
  ) {}

  /**
   * Obtener todos los ejercicios
   */
  async findAll(): Promise<Exercise[]> {
    return await this.exerciseRepo.find({
      order: { module_id: 'ASC', order_index: 'ASC' },
    });
  }

  /**
   * Obtener un ejercicio por ID
   */
  async findById(id: string): Promise<Exercise | null> {
    return await this.exerciseRepo.findOne({ where: { id } });
  }

  /**
   * Crear un nuevo ejercicio con validación
   */
  async create(exerciseData: Partial<Exercise>): Promise<Exercise> {
    // Validar que el contenido JSONB sea válido según el tipo de ejercicio
    this.validateContentByExerciseType(
      exerciseData.exercise_type,
      exerciseData.content,
    );

    const exercise = this.exerciseRepo.create(exerciseData);
    return await this.exerciseRepo.save(exercise);
  }

  /**
   * Actualizar un ejercicio existente
   */
  async update(id: string, exerciseData: Partial<Exercise>): Promise<Exercise> {
    const exercise = await this.findById(id);
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    // Si se actualiza el tipo o contenido, validar
    if (exerciseData.exercise_type || exerciseData.content) {
      const exerciseType = exerciseData.exercise_type || exercise.exercise_type;
      const content = exerciseData.content || exercise.content;
      this.validateContentByExerciseType(exerciseType, content);
    }

    await this.exerciseRepo.update(id, exerciseData);
    return await this.findById(id);
  }

  /**
   * Eliminar un ejercicio
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.exerciseRepo.delete(id);
    return result.affected > 0;
  }

  /**
   * Validar el contenido JSONB según el tipo de ejercicio
   * Asegura que la estructura sea correcta para cada mecánica
   */
  validateContentByExerciseType(
    exerciseType: ExerciseTypeEnum,
    content: Record<string, any>,
  ): void {
    if (!content) {
      throw new BadRequestException('Content is required');
    }

    switch (exerciseType) {
      case ExerciseTypeEnum.CRUCIGRAMA:
        // Crucigrama requiere grid, across_clues, down_clues
        if (!content.grid || !content.across_clues || !content.down_clues) {
          throw new BadRequestException(
            'Crucigrama must have grid, across_clues, and down_clues',
          );
        }
        break;

      case ExerciseTypeEnum.SOPA_LETRAS:
        // Sopa de letras requiere grid y words
        if (!content.grid || !content.words) {
          throw new BadRequestException(
            'Sopa de letras must have grid and words',
          );
        }
        break;

      case ExerciseTypeEnum.MAPA_CONCEPTUAL:
        // Mapa conceptual requiere nodes y connections
        if (!content.nodes || !content.connections) {
          throw new BadRequestException(
            'Mapa conceptual must have nodes and connections',
          );
        }
        break;

      case ExerciseTypeEnum.EMPAREJAMIENTO:
        // Emparejamiento requiere pairs
        if (!content.pairs || !Array.isArray(content.pairs)) {
          throw new BadRequestException(
            'Emparejamiento must have pairs array',
          );
        }
        break;

      case ExerciseTypeEnum.VERDADERO_FALSO:
      case ExerciseTypeEnum.COMPLETAR_ESPACIOS:
      case ExerciseTypeEnum.QUIZ_TIKTOK:
        // Quiz requiere questions y correct_answers
        if (!content.question && !content.questions) {
          throw new BadRequestException(
            'Quiz must have question or questions',
          );
        }
        if (!content.correct_answers) {
          throw new BadRequestException(
            'Quiz must have correct_answers',
          );
        }
        break;

      case ExerciseTypeEnum.DETECTIVE_TEXTUAL:
      case ExerciseTypeEnum.COMPRENSION_AUDITIVA:
        // Detective textual requiere text/audio y clues
        if (!content.text && !content.audio_url) {
          throw new BadRequestException(
            'Detective textual must have text or audio_url',
          );
        }
        break;

      case ExerciseTypeEnum.LINEA_TIEMPO:
        // Línea de tiempo requiere events
        if (!content.events || !Array.isArray(content.events)) {
          throw new BadRequestException(
            'Linea tiempo must have events array',
          );
        }
        break;

      case ExerciseTypeEnum.PODCAST_ARGUMENTATIVO:
      case ExerciseTypeEnum.DEBATE_DIGITAL:
        // Debate requiere topics y arguments
        if (!content.topics || !content.arguments) {
          throw new BadRequestException(
            'Debate must have topics and arguments',
          );
        }
        break;

      // Otros tipos pueden tener estructura flexible
      default:
        // Validación mínima: debe tener al menos un campo
        if (Object.keys(content).length === 0) {
          throw new BadRequestException(
            'Content must have at least one property',
          );
        }
    }
  }

  /**
   * Obtener pistas para un ejercicio
   * Retorna las pistas disponibles del ejercicio
   */
  async getHints(exerciseId: string): Promise<string[]> {
    const exercise = await this.findById(exerciseId);
    if (!exercise) {
      throw new NotFoundException(
        `Exercise with ID ${exerciseId} not found`,
      );
    }

    if (!exercise.enable_hints) {
      throw new BadRequestException('Hints are disabled for this exercise');
    }

    return exercise.hints || [];
  }

  /**
   * Obtener ejercicios por módulo
   */
  async findByModuleId(moduleId: string): Promise<Exercise[]> {
    return await this.exerciseRepo.find({
      where: { module_id: moduleId },
      order: { order_index: 'ASC' },
    });
  }

  /**
   * Obtener ejercicios activos
   */
  async findActive(): Promise<Exercise[]> {
    return await this.exerciseRepo.find({
      where: { is_active: true },
      order: { module_id: 'ASC', order_index: 'ASC' },
    });
  }
}
