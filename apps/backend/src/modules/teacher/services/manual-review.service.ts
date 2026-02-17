import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ManualReview } from '@modules/progress/entities/manual-review.entity';
import { ExerciseSubmission } from '@modules/progress/entities/exercise-submission.entity';
import { CreateReviewDto, UpdateReviewDto } from '../dto/create-review.dto';
import { ExerciseSubmissionService } from '@modules/progress/services/exercise-submission.service';
// FIX GAP-LOW-001: Import AuditService for event tracking
import { AuditService } from '@modules/audit/services/audit.service';
import { Severity, Status } from '@modules/audit/entities/audit-log.entity';
// CORR-009: Import NotificationService for review_completed event
import { NotificationService } from '@modules/notifications/services/notification.service';
// FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Import Profile and Exercise for data enrichment
import { Profile } from '@modules/auth/entities/profile.entity';
import { Exercise } from '@modules/educational/entities/exercise.entity';
// FIX TASK-2026-01-18-008: Import ExerciseTypeRubric for rubric data
import { ExerciseTypeRubric, RubricCriteria } from '@modules/educational/entities/exercise-type-rubric.entity';

/**
 * Filtros opcionales para reviews pendientes
 * FIX GAP-LOW-002: Added pagination support
 */
export interface PendingReviewFilters {
  moduleId?: string;
  moduleOrder?: number;
  classroomId?: string;
  exerciseId?: string;
  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Resultado paginado de reviews pendientes
 * FIX GAP-LOW-002: Added for pagination support
 */
export interface PaginatedReviewsResult {
  reviews: ManualReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Resultado de completar un review con información de recompensas
 * FIX GAP-CRIT-001: Agregado para retornar rewards al frontend
 */
export interface CompleteReviewResult {
  review: ManualReview;
  rewards: {
    xp_earned: number;
    ml_coins_earned: number;
    rankUp: {
      newRank: string;
      previousRank: string;
      bonusMLCoins: number;
      newMultiplier: number;
    } | null;
  } | null;
}

/**
 * Review enriquecido con datos de estudiante, ejercicio y rúbrica
 * FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Estructura para retornar datos completos al frontend
 * FIX TASK-2026-01-18-008: Agregado rubric para evaluación manual
 */
export interface EnrichedManualReview extends ManualReview {
  student?: {
    id: string;
    name: string;
    email: string;
  };
  exercise?: {
    id: string;
    title: string;
    moduleId: string;
    type?: string;
  };
  // FIX TASK-2026-01-18-008: Rubric criteria for evaluation
  rubric?: Array<{
    id: string;
    name: string;
    description: string;
    maxPoints: number;
    weight?: number;
  }>;
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
  private readonly logger = new Logger(ManualReviewService.name);

  constructor(
    @InjectRepository(ManualReview, 'progress')
    private readonly reviewRepo: Repository<ManualReview>,
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepo: Repository<ExerciseSubmission>,
    // FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Inject Profile and Exercise repos for data enrichment
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
    // FIX TASK-2026-01-18-008: Inject ExerciseTypeRubric for rubric data
    @InjectRepository(ExerciseTypeRubric, 'educational')
    private readonly rubricRepo: Repository<ExerciseTypeRubric>,
    private readonly submissionService: ExerciseSubmissionService,
    // FIX GAP-LOW-001: Inject AuditService for event tracking
    private readonly auditService: AuditService,
    // CORR-009: Inject NotificationService for review_completed notifications
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Enriquece un review con datos de estudiante, ejercicio y rúbrica
   * FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Soluciona problema de datos faltantes en frontend
   * FIX TASK-2026-01-18-008: Agrega rubric desde exercise_type_rubrics
   *
   * @param review - ManualReview con submission cargado
   * @returns Review enriquecido con student, exercise y rubric
   */
  private async enrichReview(review: ManualReview): Promise<EnrichedManualReview> {
    const enriched: EnrichedManualReview = { ...review };
    let exerciseType: string | null = null;

    if (review.submission) {
      // Obtener datos del estudiante
      if (review.submission.user_id) {
        try {
          const profile = await this.profileRepo.findOne({
            where: { id: review.submission.user_id },
            select: ['id', 'full_name', 'email'],
          });
          if (profile) {
            enriched.student = {
              id: profile.id,
              name: profile.full_name || 'Sin nombre',
              email: profile.email || '',
            };
          }
        } catch (error) {
          this.logger.warn(`[enrichReview] Failed to fetch profile for user ${review.submission.user_id}: ${error}`);
        }
      }

      // Obtener datos del ejercicio
      if (review.submission.exercise_id) {
        try {
          const exercise = await this.exerciseRepo.findOne({
            where: { id: review.submission.exercise_id },
            select: ['id', 'title', 'module_id', 'exercise_type'],
          });
          if (exercise) {
            enriched.exercise = {
              id: exercise.id,
              title: exercise.title || 'Sin título',
              moduleId: exercise.module_id,
              type: exercise.exercise_type,
            };
            exerciseType = exercise.exercise_type;
          }
        } catch (error) {
          this.logger.warn(`[enrichReview] Failed to fetch exercise ${review.submission.exercise_id}: ${error}`);
        }
      }
    }

    // FIX TASK-2026-01-18-008: Obtener rúbrica por tipo de ejercicio
    // FIX TASK-2026-01-18-011: Usar criterion.id de BD si existe, no generar desde nombre
    if (exerciseType) {
      try {
        const rubricData = await this.rubricRepo.findOne({
          where: { exerciseType, isDefault: true },
        });
        if (rubricData && rubricData.criteria) {
          // Transformar criterios al formato esperado por frontend
          // IMPORTANTE: Usar criterion.id de BD para mantener consistencia con seeds
          enriched.rubric = rubricData.criteria.map((criterion: RubricCriteria & { id?: string }, index: number) => ({
            id: criterion.id || criterion.name?.toLowerCase().replace(/\s+/g, '_') || `criterion_${index}`,
            name: criterion.name,
            description: criterion.description,
            maxPoints: Math.max(...(criterion.levels?.map(l => l.score) || [100])),
            weight: criterion.weight,
          }));
          this.logger.log(`[enrichReview] Loaded rubric for ${exerciseType} with ${enriched.rubric.length} criteria`);
        } else {
          this.logger.warn(`[enrichReview] No rubric found for exercise type: ${exerciseType}`);
        }
      } catch (error) {
        this.logger.error(`[enrichReview] Failed to fetch rubric for exercise type ${exerciseType}: ${error}`);
      }
    } else {
      this.logger.warn(`[enrichReview] No exercise type available for rubric lookup`);
    }

    return enriched;
  }

  /**
   * Enriquece múltiples reviews de forma optimizada
   * FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Batch enrichment para mejor rendimiento
   * FIX TASK-2026-01-18-008: Agrega rubrics en batch
   *
   * @param reviews - Array de ManualReview con submissions cargados
   * @returns Array de reviews enriquecidos con student, exercise y rubric
   */
  private async enrichReviews(reviews: ManualReview[]): Promise<EnrichedManualReview[]> {
    if (reviews.length === 0) return [];

    // Extraer IDs únicos de usuarios y ejercicios
    const userIds = [...new Set(reviews
      .filter(r => r.submission?.user_id)
      .map(r => r.submission!.user_id))];

    const exerciseIds = [...new Set(reviews
      .filter(r => r.submission?.exercise_id)
      .map(r => r.submission!.exercise_id))];

    // Cargar perfiles en batch
    const profiles = userIds.length > 0
      ? await this.profileRepo.find({
          where: { id: In(userIds) },
          select: ['id', 'full_name', 'email'],
        })
      : [];

    // Cargar ejercicios en batch
    const exercises = exerciseIds.length > 0
      ? await this.exerciseRepo.find({
          where: { id: In(exerciseIds) },
          select: ['id', 'title', 'module_id', 'exercise_type'],
        })
      : [];

    // FIX TASK-2026-01-18-008: Extraer tipos de ejercicio únicos y cargar rúbricas
    const exerciseTypes = [...new Set(exercises
      .map(e => e.exercise_type)
      .filter(Boolean))] as string[];

    const rubrics = exerciseTypes.length > 0
      ? await this.rubricRepo.find({
          where: { exerciseType: In(exerciseTypes), isDefault: true },
        })
      : [];

    // Crear mapas para acceso rápido
    const profileMap = new Map(profiles.map(p => [p.id, p]));
    const exerciseMap = new Map(exercises.map(e => [e.id, e]));
    // FIX TASK-2026-01-18-008: Mapa de rúbricas por tipo de ejercicio
    const rubricMap = new Map(rubrics.map(r => [r.exerciseType, r]));

    // Enriquecer cada review
    return reviews.map(review => {
      const enriched: EnrichedManualReview = { ...review };

      if (review.submission) {
        // Agregar datos del estudiante
        const profile = profileMap.get(review.submission.user_id);
        if (profile) {
          enriched.student = {
            id: profile.id,
            name: profile.full_name || 'Sin nombre',
            email: profile.email || '',
          };
        }

        // Agregar datos del ejercicio
        const exercise = exerciseMap.get(review.submission.exercise_id);
        if (exercise) {
          enriched.exercise = {
            id: exercise.id,
            title: exercise.title || 'Sin título',
            moduleId: exercise.module_id,
            type: exercise.exercise_type,
          };

          // FIX TASK-2026-01-18-008: Agregar rúbrica
          // FIX TASK-2026-01-18-011: Usar criterion.id de BD si existe
          const rubricData = rubricMap.get(exercise.exercise_type);
          if (rubricData && rubricData.criteria) {
            enriched.rubric = rubricData.criteria.map((criterion: RubricCriteria & { id?: string }, index: number) => ({
              id: criterion.id || criterion.name?.toLowerCase().replace(/\s+/g, '_') || `criterion_${index}`,
              name: criterion.name,
              description: criterion.description,
              maxPoints: Math.max(...(criterion.levels?.map(l => l.score) || [100])),
              weight: criterion.weight,
            }));
          }
        }
      }

      return enriched;
    });
  }

  /**
   * Obtiene reviews pendientes para un docente con paginación
   *
   * @param teacherId - UUID del docente
   * @param filters - Filtros opcionales (moduleId, moduleOrder, classroomId, exerciseId, page, limit)
   * @returns Lista paginada de reviews pendientes con datos del submission
   *
   * FIX GAP-LOW-002: Added pagination support with page/limit parameters
   *
   * NOTA: Para filtrar por módulo, usar `moduleOrder` (1-5) que utiliza la vista
   * teacher_pending_reviews para el join cross-database. Alternativamente,
   * usar `findPendingByModule()` directamente para obtener datos completos.
   */
  async findPendingReviews(
    teacherId: string,
    filters?: PendingReviewFilters,
  ): Promise<PaginatedReviewsResult> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    // Si se filtra por módulo, usar la vista cross-database
    if (filters?.moduleOrder) {
      // Usar findPendingByModule y mapear a ManualReview format
      const pendingFromView = await this.findPendingByModule(teacherId, filters.moduleOrder);
      // Obtener los reviews correspondientes
      if (pendingFromView.length === 0) {
        return { reviews: [], total: 0, page, limit, totalPages: 0 };
      }

      const submissionIds = pendingFromView.map((p: any) => p.submission_id);
      const total = submissionIds.length;

      // Apply pagination to submissionIds
      const paginatedIds = submissionIds.slice(skip, skip + limit);

      const reviews = await this.reviewRepo.find({
        where: {
          submissionId: In(paginatedIds),
          reviewerId: teacherId,
          status: 'pending',
        },
        relations: ['submission'],
      });

      // FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Enriquecer reviews con datos de estudiante y ejercicio
      const enrichedReviews = await this.enrichReviews(reviews);

      return {
        reviews: enrichedReviews,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
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

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const reviews = await queryBuilder.getMany();

    // FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Enriquecer reviews con datos de estudiante y ejercicio
    const enrichedReviews = await this.enrichReviews(reviews);

    return {
      reviews: enrichedReviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

    const savedReview = await this.reviewRepo.save(review);

    // FIX GAP-LOW-001: Log audit event for review creation
    await this.auditService.logEvent({
      eventType: 'manual_review_created',
      action: 'create',
      resourceType: 'manual_review',
      resourceId: savedReview.id,
      actorId: teacherId,
      targetId: submission.user_id,
      targetType: 'student',
      severity: Severity.INFO,
      status: Status.SUCCESS,
      description: `Manual review created for submission ${dto.submissionId}`,
      newValues: {
        submissionId: dto.submissionId,
        totalScore: dto.totalScore,
        exerciseId: submission.exercise_id,
      },
      tags: ['teacher', 'review', 'evaluation', 'create'],
    });

    return savedReview;
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
    dto: UpdateReviewDto,
  ): Promise<ManualReview> {
    // DEBUG: Log para verificar datos recibidos
    this.logger.log(`[updateReview] reviewId: ${reviewId}`);
    this.logger.log(`[updateReview] dto received: ${JSON.stringify(dto)}`);

    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Actualizar campos si están presentes en el DTO
    // NOTA: DTO usa snake_case porque el frontend transforma camelCase -> snake_case
    if (dto.rubric_scores !== undefined) {
      this.logger.log(`[updateReview] Setting rubricScores: ${JSON.stringify(dto.rubric_scores)}`);
      review.rubricScores = dto.rubric_scores;
    }
    if (dto.total_score !== undefined) {
      this.logger.log(`[updateReview] Setting totalScore: ${dto.total_score}`);
      review.totalScore = dto.total_score;
    }
    if (dto.general_feedback !== undefined) {
      review.generalFeedback = dto.general_feedback;
    }
    if (dto.detailed_feedback !== undefined) {
      review.detailedFeedback = dto.detailed_feedback;
    }
    if (dto.status !== undefined) {
      review.status = dto.status;
    }

    const savedReview = await this.reviewRepo.save(review);
    this.logger.log(`[updateReview] Saved review with totalScore: ${savedReview.totalScore}, rubricScores: ${JSON.stringify(savedReview.rubricScores)}`);
    return savedReview;
  }

  /**
   * Marca un review como completado y distribuye recompensas (XP, ML Coins)
   *
   * @param reviewId - UUID del review
   * @returns Review actualizado con información de recompensas distribuidas
   * @throws NotFoundException si el review no existe
   * @description Al completar el review, se llama a gradeSubmission() para:
   *   - Actualizar el submission a status 'graded'
   *   - Asignar el score final
   *   - Distribuir XP y ML Coins al estudiante basados en el score
   *
   * FIX GAP-CRIT-001: Ahora retorna información de rewards para mostrar en frontend
   */
  async completeReview(reviewId: string): Promise<CompleteReviewResult> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['submission'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // FIX TASK-2026-01-18-012: Validar que hay evaluacion ANTES de marcar como completado
    // Sin esta validacion, el review se marcaba completed pero sin rewards
    if (review.totalScore === null || review.totalScore === undefined) {
      throw new BadRequestException(
        'No se puede completar el review sin una calificación. ' +
        'Guarda la evaluación con el puntaje usando updateReview() primero.',
      );
    }

    if (!review.rubricScores || Object.keys(review.rubricScores).length === 0) {
      throw new BadRequestException(
        'No se puede completar el review sin evaluar los criterios de la rúbrica. ' +
        'Evalúa todos los criterios antes de completar.',
      );
    }

    // FIX H-08: Validar rubricScores contra la configuración de rúbrica del ejercicio
    if (review.submission?.exercise_id) {
      const exercise = await this.exerciseRepo.findOne({
        where: { id: review.submission.exercise_id },
        select: ['id', 'exercise_type'],
      });

      if (exercise) {
        const rubric = await this.rubricRepo.findOne({
          where: { exerciseType: exercise.exercise_type, isDefault: true },
        });

        if (rubric && rubric.criteria && rubric.criteria.length > 0) {
          const expectedIds = rubric.criteria
            .map((c: RubricCriteria) => c.id || c.name)
            .sort();
          const providedIds = Object.keys(review.rubricScores).sort();
          const missingCriteria = expectedIds.filter(
            (id: string) => !providedIds.includes(id),
          );

          if (missingCriteria.length > 0) {
            throw new BadRequestException(
              `Faltan criterios de evaluación: ${missingCriteria.join(', ')}. ` +
              `Se requieren todos los criterios de la rúbrica: ${expectedIds.join(', ')}.`,
            );
          }
        }
      }
    }

    // Variable para almacenar información de recompensas
    let rewardsResult: CompleteReviewResult['rewards'] = null;

    // Distribuir recompensas llamando a gradeSubmission y luego claimRewards.
    // IMPORTANTE: solo marcamos el review como completed DESPUÉS de este bloque
    // para evitar estados parciales (review completado sin rewards aplicadas).
    if (review.submissionId && review.totalScore !== undefined && review.totalScore !== null) {
      // Primero calificar el submission
      await this.submissionService.gradeSubmission(review.submissionId, {
        final_score: review.totalScore ?? undefined,
        grader_id: review.reviewerId,
        feedback: review.generalFeedback || `Calificación manual: ${review.totalScore}/100`,
      });

      // FIX GAP-CRIT-001 / ISSUE-P1-REV-001:
      // No ignorar errores de rewards para no cerrar review en estado inconsistente.
      const claimResult = await this.submissionService.claimRewards(review.submissionId);
      rewardsResult = {
        xp_earned: claimResult.xp_earned,
        ml_coins_earned: claimResult.ml_coins_earned,
        rankUp: claimResult.rankUp,
      };
    }

    // Actualizar estado del review únicamente cuando la distribución finalizó correctamente.
    review.status = 'completed';
    review.completedAt = new Date();
    const savedReview = await this.reviewRepo.save(review);

    // FIX GAP-LOW-001: Log audit event for review completion
    await this.auditService.logEvent({
      eventType: 'manual_review_completed',
      action: 'complete',
      resourceType: 'manual_review',
      resourceId: reviewId,
      actorId: review.reviewerId,
      targetId: review.submission?.user_id,
      targetType: 'student',
      severity: Severity.INFO,
      status: Status.SUCCESS,
      description: `Manual review completed with score ${review.totalScore}/100`,
      newValues: {
        submissionId: review.submissionId,
        totalScore: review.totalScore,
        xpEarned: rewardsResult?.xp_earned || 0,
        mlCoinsEarned: rewardsResult?.ml_coins_earned || 0,
        rankUp: rewardsResult?.rankUp?.newRank || null,
      },
      tags: ['teacher', 'review', 'evaluation', 'complete', 'rewards'],
    });

    // CORR-009: Send notification to student when review is completed
    if (review.submission?.user_id) {
      try {
        await this.notificationService.create({
          userId: review.submission.user_id,
          type: 'exercise_feedback',
          title: 'Tu ejercicio ha sido calificado',
          message: review.generalFeedback
            ? `Calificacion: ${review.totalScore}/100. ${review.generalFeedback.substring(0, 150)}...`
            : `Tu ejercicio ha sido calificado con ${review.totalScore}/100 puntos.${
                rewardsResult ? ` Ganaste ${rewardsResult.xp_earned} XP y ${rewardsResult.ml_coins_earned} ML Coins!` : ''
              }`,
          priority: 'normal',
          channels: ['in_app', 'push'],
          data: {
            submissionId: review.submissionId,
            reviewId: reviewId,
            score: review.totalScore,
            xpEarned: rewardsResult?.xp_earned || 0,
            mlCoinsEarned: rewardsResult?.ml_coins_earned || 0,
            rankUp: rewardsResult?.rankUp || null,
          },
        });
        this.logger.log(`Notification sent to student ${review.submission.user_id} for review ${reviewId}`);
      } catch (notifError) {
        // Log but don't fail the review completion
        this.logger.warn(`Failed to send notification for review ${reviewId}: ${notifError}`);
      }
    }

    return {
      review: savedReview,
      rewards: rewardsResult,
    };
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
      relations: ['submission'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    const previousStatus = review.status;
    review.status = 'returned';
    review.generalFeedback = feedback;

    const savedReview = await this.reviewRepo.save(review);

    // FIX GAP-LOW-001: Log audit event for review returned
    await this.auditService.logEvent({
      eventType: 'manual_review_returned',
      action: 'return',
      resourceType: 'manual_review',
      resourceId: reviewId,
      actorId: review.reviewerId,
      targetId: review.submission?.user_id,
      targetType: 'student',
      severity: Severity.INFO,
      status: Status.SUCCESS,
      description: `Manual review returned for revision`,
      oldValues: { status: previousStatus },
      newValues: {
        status: 'returned',
        feedback: feedback.substring(0, 200), // Truncate for audit log
      },
      tags: ['teacher', 'review', 'evaluation', 'returned'],
    });

    // CORR-009: Send notification to student when work is returned for revision
    if (review.submission?.user_id) {
      try {
        await this.notificationService.create({
          userId: review.submission.user_id,
          type: 'exercise_feedback',
          title: 'Tu ejercicio requiere revision',
          message: `Tu profesor te ha devuelto el ejercicio para que lo revises. ${feedback.substring(0, 100)}${feedback.length > 100 ? '...' : ''}`,
          priority: 'high',
          channels: ['in_app', 'push'],
          data: {
            submissionId: review.submissionId,
            reviewId: reviewId,
            status: 'returned',
            feedback: feedback,
          },
        });
        this.logger.log(`Return notification sent to student ${review.submission.user_id} for review ${reviewId}`);
      } catch (notifError) {
        this.logger.warn(`Failed to send return notification for review ${reviewId}: ${notifError}`);
      }
    }

    return savedReview;
  }

  /**
   * Obtiene un review por ID
   *
   * @param reviewId - UUID del review
   * @returns Review encontrado enriquecido con datos de estudiante y ejercicio
   * @throws NotFoundException si el review no existe
   *
   * FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Ahora retorna datos enriquecidos
   */
  async findById(reviewId: string): Promise<EnrichedManualReview> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['submission'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Enriquecer review con datos de estudiante y ejercicio
    return this.enrichReview(review);
  }

  /**
   * Obtiene todos los reviews de un docente con filtros opcionales
   *
   * @param teacherId - UUID del docente
   * @param filters - Filtros opcionales (status, moduleId, exerciseId, classroomId)
   * @returns Lista de reviews enriquecidos
   *
   * FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Ahora retorna datos enriquecidos
   * FIX H-07 2026-02-10: Soporte para filtrado por módulo, ejercicio y aula
   */
  async findByTeacher(
    teacherId: string,
    filters?: {
      status?: 'pending' | 'in_progress' | 'completed' | 'returned';
      moduleId?: string;
      exerciseId?: string;
      classroomId?: string;
    } | string,
  ): Promise<EnrichedManualReview[]> {
    // Backward compat: accept string status for callers not yet migrated
    const normalizedFilters = typeof filters === 'string'
      ? { status: filters as 'pending' | 'in_progress' | 'completed' | 'returned' }
      : filters || {};

    const hasAdvancedFilters = normalizedFilters.moduleId || normalizedFilters.exerciseId || normalizedFilters.classroomId;

    if (!hasAdvancedFilters) {
      // Simple path: TypeORM find (original behavior)
      const whereClause: any = { reviewerId: teacherId };
      if (normalizedFilters.status) {
        whereClause.status = normalizedFilters.status;
      }

      const reviews = await this.reviewRepo.find({
        where: whereClause,
        relations: ['submission'],
        order: { createdAt: 'DESC' },
      });

      return this.enrichReviews(reviews);
    }

    // Advanced path: QueryBuilder for cross-entity filtering
    const qb = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.submission', 'submission')
      .where('review.reviewerId = :teacherId', { teacherId });

    if (normalizedFilters.status) {
      qb.andWhere('review.status = :status', { status: normalizedFilters.status });
    }

    if (normalizedFilters.exerciseId) {
      qb.andWhere('submission.exercise_id = :exerciseId', { exerciseId: normalizedFilters.exerciseId });
    }

    if (normalizedFilters.moduleId) {
      // Get exercise IDs for this module, then filter submissions
      const moduleExercises = await this.exerciseRepo.find({
        where: { module_id: normalizedFilters.moduleId },
        select: ['id'],
      });
      const exerciseIds = moduleExercises.map(e => e.id);

      if (exerciseIds.length === 0) {
        return [];
      }
      qb.andWhere('submission.exercise_id IN (:...exerciseIds)', { exerciseIds });
    }

    if (normalizedFilters.classroomId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM social_features.classroom_members cm
          WHERE cm.student_id = submission.user_id
            AND cm.classroom_id = :classroomId
            AND cm.status = 'active'
        )`,
        { classroomId: normalizedFilters.classroomId },
      );
    }

    qb.orderBy('review.createdAt', 'DESC');

    const reviews = await qb.getMany();

    // FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Enriquecer reviews con datos de estudiante y ejercicio
    return this.enrichReviews(reviews);
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

  /**
   * TASK-2026-01-18-009: Obtiene la configuración de ejercicios con revisión manual
   *
   * Retorna todos los ejercicios que requieren revisión manual (requires_manual_grading = true)
   * junto con la información del módulo al que pertenecen.
   *
   * NOTA: Este endpoint reemplaza los datos hardcodeados de:
   * - Frontend: manualReviewExercises.ts (MANUAL_REVIEW_MODULES, MANUAL_REVIEW_EXERCISES)
   *
   * @returns Módulos y ejercicios que requieren revisión manual
   */
  async getManualReviewConfig(): Promise<{
    modules: Array<{
      id: string;
      name: string;
      number: number;
    }>;
    exercises: Array<{
      id: string;
      title: string;
      exerciseType: string;
      moduleId: string;
      moduleName: string;
      moduleNumber: number;
    }>;
  }> {
    // Obtener ejercicios con revisión manual
    const exercises = await this.exerciseRepo
      .createQueryBuilder('e')
      .select([
        'e.id',
        'e.title',
        'e.exercise_type',
        'e.module_id',
        'e.order_index',
      ])
      .where('e.requires_manual_grading = :requiresManual', { requiresManual: true })
      .andWhere('e.is_active = :isActive', { isActive: true })
      .orderBy('e.order_index', 'ASC')
      .getMany();

    if (exercises.length === 0) {
      return { modules: [], exercises: [] };
    }

    // Obtener IDs de módulos únicos
    const moduleIds = [...new Set(exercises.map(e => e.module_id))];

    // Obtener información de los módulos
    const modules = await this.exerciseRepo.query(
      `SELECT id, title as name, order_index as number
       FROM educational_content.modules
       WHERE id = ANY($1)
       ORDER BY order_index ASC`,
      [moduleIds],
    );

    // Crear mapa de módulos para enriquecer ejercicios
    const moduleMap = new Map<string, { name: string; number: number }>();
    for (const mod of modules) {
      moduleMap.set(mod.id, { name: mod.name, number: parseInt(mod.number, 10) });
    }

    // Formatear respuesta
    return {
      modules: modules.map((m: any) => ({
        id: m.id,
        name: m.name,
        number: parseInt(m.number, 10),
      })),
      exercises: exercises.map(e => {
        const mod = moduleMap.get(e.module_id) || { name: 'Unknown', number: 0 };
        return {
          id: e.id,
          title: e.title,
          exerciseType: e.exercise_type,
          moduleId: e.module_id,
          moduleName: mod.name,
          moduleNumber: mod.number,
        };
      }),
    };
  }
}
