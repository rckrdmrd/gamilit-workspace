import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ManualReview } from '@modules/progress/entities/manual-review.entity';
import { ExerciseSubmission } from '@modules/progress/entities/exercise-submission.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ExerciseSubmissionService } from '@modules/progress/services/exercise-submission.service';

/**
 * Filtros opcionales para reviews pendientes
 */
export interface PendingReviewFilters {
  moduleId?: string;
  moduleOrder?: number;
  classroomId?: string;
  exerciseId?: string;
}

/**
 * Service para gestión de evaluaciones manuales de ejercicios creativos
 *
 * @description Provee operaciones CRUD y lógica de negocio para ManualReview.
 * Utilizado por docentes para evaluar ejercicios de módulos 4 y 5.
 *
 * NOTA ARQUITECTURA CROSS-DATABASE:
 * Este proyecto utiliza múltiples datasources PostgreSQL separados por schema:
 * - ManualReview, ExerciseSubmission -> datasource 'progress' (progress_tracking)
 * - Profile (estudiantes) -> datasource 'auth' (auth_management)
 * - Exercise, Module -> datasource 'educational' (educational_content)
 *
 * Las relaciones TypeORM @ManyToOne NO funcionan entre entidades de diferentes
 * datasources. Por lo tanto, solo usamos `relations: ['submission']` (mismo schema)
 * y el frontend obtiene datos de estudiante/ejercicio usando los IDs:
 * - submission.user_id -> Para obtener datos del estudiante
 * - submission.exercise_id -> Para obtener datos del ejercicio
 */
@Injectable()
export class ManualReviewService {
  constructor(
    @InjectRepository(ManualReview, 'progress')
    private readonly reviewRepo: Repository<ManualReview>,
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepo: Repository<ExerciseSubmission>,
    private readonly submissionService: ExerciseSubmissionService,
  ) {}

  /**
   * Obtiene reviews pendientes para un docente
   *
   * @param teacherId - UUID del docente
   * @param filters - Filtros opcionales (moduleId, moduleOrder, classroomId, exerciseId)
   * @returns Lista de reviews pendientes con datos del submission
   *
   * NOTA: Para filtrar por módulo, usar `moduleOrder` (1-5) que utiliza la vista
   * teacher_pending_reviews para el join cross-database. Alternativamente,
   * usar `findPendingByModule()` directamente para obtener datos completos.
   */
  async findPendingReviews(
    teacherId: string,
    filters?: PendingReviewFilters,
  ): Promise<ManualReview[]> {
    // Si se filtra por módulo, usar la vista cross-database
    if (filters?.moduleOrder) {
      // Usar findPendingByModule y mapear a ManualReview format
      const pendingFromView = await this.findPendingByModule(teacherId, filters.moduleOrder);
      // Obtener los reviews correspondientes
      if (pendingFromView.length === 0) return [];

      const submissionIds = pendingFromView.map((p: any) => p.submission_id);
      return this.reviewRepo.find({
        where: {
          submissionId: In(submissionIds),
          reviewerId: teacherId,
          status: 'pending',
        },
        relations: ['submission'],
      });
    }

    const queryBuilder = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.submission', 'submission')
      .where('review.reviewerId = :teacherId', { teacherId })
      .andWhere('review.status = :status', { status: 'pending' });

    // Filtrar por exerciseId si se proporciona
    if (filters?.exerciseId) {
      queryBuilder.andWhere('submission.exercise_id = :exerciseId', {
        exerciseId: filters.exerciseId,
      });
    }

    queryBuilder.orderBy('review.createdAt', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * Busca un review por ID de submission
   *
   * @param submissionId - UUID del submission
   * @returns Review encontrado o null si no existe
   */
  async findBySubmission(submissionId: string): Promise<ManualReview | null> {
    const review = await this.reviewRepo.findOne({
      where: { submissionId },
      relations: ['submission'],
    });

    return review || null;
  }

  /**
   * Crea una nueva evaluación manual
   *
   * @param teacherId - UUID del docente revisor
   * @param dto - Datos de la evaluación
   * @returns Review creado
   * @throws NotFoundException si el submission no existe
   * @throws BadRequestException si ya existe un review para ese submission
   */
  async createReview(teacherId: string, dto: CreateReviewDto): Promise<ManualReview> {
    // Verificar que el submission existe
    const submission = await this.submissionRepo.findOne({
      where: { id: dto.submissionId },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${dto.submissionId} not found`,
      );
    }

    // Verificar que no existe ya un review para este submission
    const existingReview = await this.reviewRepo.findOne({
      where: { submissionId: dto.submissionId },
    });

    if (existingReview) {
      throw new BadRequestException(
        `A review already exists for submission ${dto.submissionId}`,
      );
    }

    // Crear el review
    const review = this.reviewRepo.create({
      submissionId: dto.submissionId,
      reviewerId: teacherId,
      rubricScores: dto.rubricScores,
      totalScore: dto.totalScore,
      generalFeedback: dto.generalFeedback,
      detailedFeedback: dto.detailedFeedback,
      status: 'pending',
    });

    return this.reviewRepo.save(review);
  }

  /**
   * Actualiza una evaluación existente
   *
   * @param reviewId - UUID del review a actualizar
   * @param dto - Datos parciales a actualizar
   * @returns Review actualizado
   * @throws NotFoundException si el review no existe
   */
  async updateReview(
    reviewId: string,
    dto: Partial<CreateReviewDto>,
  ): Promise<ManualReview> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Actualizar campos si están presentes en el DTO
    if (dto.rubricScores !== undefined) {
      review.rubricScores = dto.rubricScores;
    }
    if (dto.totalScore !== undefined) {
      review.totalScore = dto.totalScore;
    }
    if (dto.generalFeedback !== undefined) {
      review.generalFeedback = dto.generalFeedback;
    }
    if (dto.detailedFeedback !== undefined) {
      review.detailedFeedback = dto.detailedFeedback;
    }

    return this.reviewRepo.save(review);
  }

  /**
   * Marca un review como completado y distribuye recompensas (XP, ML Coins)
   *
   * @param reviewId - UUID del review
   * @returns Review actualizado
   * @throws NotFoundException si el review no existe
   * @description Al completar el review, se llama a gradeSubmission() para:
   *   - Actualizar el submission a status 'graded'
   *   - Asignar el score final
   *   - Distribuir XP y ML Coins al estudiante basados en el score
   */
  async completeReview(reviewId: string): Promise<ManualReview> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['submission'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Actualizar estado del review
    review.status = 'completed';
    review.completedAt = new Date();

    const savedReview = await this.reviewRepo.save(review);

    // Distribuir recompensas llamando a gradeSubmission
    if (review.submissionId && review.totalScore !== undefined && review.totalScore !== null) {
      await this.submissionService.gradeSubmission(review.submissionId, {
        final_score: review.totalScore ?? undefined,
        grader_id: review.reviewerId,
        feedback: review.generalFeedback || `Calificación manual: ${review.totalScore}/100`,
      });
    }

    return savedReview;
  }

  /**
   * Marca un review como iniciado (in_progress)
   *
   * @param reviewId - UUID del review
   * @returns Review actualizado
   * @throws NotFoundException si el review no existe
   */
  async startReview(reviewId: string): Promise<ManualReview> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    if (review.status === 'pending') {
      review.status = 'in_progress';
      review.startedAt = new Date();
      return this.reviewRepo.save(review);
    }

    return review;
  }

  /**
   * Devuelve un submission para revisión del estudiante
   *
   * @param reviewId - UUID del review
   * @param feedback - Mensaje de feedback explicando qué debe corregir
   * @returns Review actualizado
   * @throws NotFoundException si el review no existe
   */
  async returnForRevision(reviewId: string, feedback: string): Promise<ManualReview> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    review.status = 'returned';
    review.generalFeedback = feedback;

    return this.reviewRepo.save(review);
  }

  /**
   * Obtiene un review por ID
   *
   * @param reviewId - UUID del review
   * @returns Review encontrado
   * @throws NotFoundException si el review no existe
   */
  async findById(reviewId: string): Promise<ManualReview> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['submission'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    return review;
  }

  /**
   * Obtiene todos los reviews de un docente
   *
   * @param teacherId - UUID del docente
   * @param status - Filtro opcional por estado
   * @returns Lista de reviews
   */
  async findByTeacher(
    teacherId: string,
    status?: 'pending' | 'in_progress' | 'completed' | 'returned',
  ): Promise<ManualReview[]> {
    const whereClause: any = { reviewerId: teacherId };
    if (status) {
      whereClause.status = status;
    }

    return this.reviewRepo.find({
      where: whereClause,
      relations: ['submission'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Obtiene reviews pendientes filtrados por módulo usando la vista teacher_pending_reviews
   *
   * @param teacherId - UUID del docente
   * @param moduleOrder - Número del módulo (1-5)
   * @returns Lista de submissions pendientes de ese módulo
   *
   * NOTA: Esta consulta usa la vista teacher_pending_reviews que ya tiene
   * el join con educational_content.exercises y modules.
   */
  async findPendingByModule(
    teacherId: string,
    moduleOrder: number,
  ): Promise<any[]> {
    const result = await this.submissionRepo.query(
      `SELECT *
       FROM progress_tracking.teacher_pending_reviews
       WHERE classroom_id IN (
         SELECT classroom_id
         FROM social_features.teacher_classrooms
         WHERE teacher_id = $1
       )
       AND module_order = $2
       ORDER BY
         CASE priority
           WHEN 'urgent' THEN 1
           WHEN 'high' THEN 2
           WHEN 'medium' THEN 3
           ELSE 4
         END,
         submission_date ASC`,
      [teacherId, moduleOrder],
    );

    return result;
  }

  /**
   * Obtiene estadísticas de reviews pendientes para el dashboard del docente
   *
   * @param teacherId - UUID del docente
   * @param classroomId - UUID del classroom (opcional)
   * @returns Estadísticas de pendientes por prioridad
   *
   * Utiliza la función get_teacher_pending_reviews_count que ya existe en BD
   */
  async getPendingReviewsStats(
    teacherId: string,
    classroomId?: string,
  ): Promise<{
    totalPending: number;
    urgentCount: number;
    highCount: number;
    mediumCount: number;
    normalCount: number;
  }> {
    const result = await this.submissionRepo.query(
      `SELECT * FROM progress_tracking.get_teacher_pending_reviews_count($1, $2)`,
      [teacherId, classroomId || null],
    );

    const stats = result[0] || {};
    return {
      totalPending: parseInt(stats.total_pending || '0', 10),
      urgentCount: parseInt(stats.urgent_count || '0', 10),
      highCount: parseInt(stats.high_count || '0', 10),
      mediumCount: parseInt(stats.medium_count || '0', 10),
      normalCount: parseInt(stats.normal_count || '0', 10),
    };
  }
}
