import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManualReview } from '@modules/progress/entities/manual-review.entity';
import { ExerciseSubmission } from '@modules/progress/entities/exercise-submission.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ExerciseSubmissionService } from '@modules/progress/services/exercise-submission.service';

/**
 * Service para gestión de evaluaciones manuales de ejercicios creativos
 *
 * @description Provee operaciones CRUD y lógica de negocio para ManualReview.
 * Utilizado por docentes para evaluar ejercicios de módulos 4 y 5.
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
   * @returns Lista de reviews pendientes con datos del submission
   */
  async findPendingReviews(teacherId: string): Promise<ManualReview[]> {
    return this.reviewRepo.find({
      where: {
        reviewerId: teacherId,
        status: 'pending',
      },
      relations: ['submission'],
      order: {
        createdAt: 'ASC',
      },
    });
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
}
