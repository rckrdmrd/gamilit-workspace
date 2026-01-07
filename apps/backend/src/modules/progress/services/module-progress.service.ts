import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleProgress, ExerciseSubmission } from '../entities';
import { CreateModuleProgressDto, ModuleExerciseBreakdownDto, ExerciseStatusDto, ExerciseCompletionStatus } from '../dto';
import { ProgressStatusEnum } from '@shared/constants/enums.constants';
import { CertificateService } from './certificate.service';

/**
 * ModuleProgressService
 *
 * Gestión del progreso de estudiantes por módulo educativo
 * - CRUD de progreso de módulos
 * - Actualización de porcentajes y estadísticas
 * - Completación de módulos
 * - Análisis de rutas de aprendizaje
 * - Agregación de estadísticas por módulo
 */
@Injectable()
export class ModuleProgressService {
  private readonly logger = new Logger(ModuleProgressService.name);

  constructor(
    @InjectRepository(ModuleProgress, 'progress')
    private readonly moduleProgressRepo: Repository<ModuleProgress>,
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly exerciseSubmissionRepo: Repository<ExerciseSubmission>,
    @Inject(forwardRef(() => CertificateService))
    private readonly certificateService: CertificateService,
  ) {}

  /**
   * Obtiene todos los registros de progreso de un usuario
   * @param userId - ID del usuario
   * @returns Lista de progreso de módulos ordenados por última actualización
   */
  async findByUserId(userId: string): Promise<ModuleProgress[]> {
    return this.moduleProgressRepo.find({
      where: { user_id: userId },
      order: { updated_at: 'DESC' },
    });
  }

  /**
   * Obtiene el progreso específico de un usuario en un módulo
   * @param userId - ID del usuario
   * @param moduleId - ID del módulo
   * @returns Registro de progreso o lanza excepción si no existe
   */
  async findByUserAndModule(userId: string, moduleId: string): Promise<ModuleProgress> {
    const progress = await this.moduleProgressRepo.findOne({
      where: { user_id: userId, module_id: moduleId },
    });

    if (!progress) {
      throw new NotFoundException(
        `No progress found for user ${userId} in module ${moduleId}`,
      );
    }

    return progress;
  }

  /**
   * Obtiene el progreso específico de un usuario en un módulo
   * Retorna null si no existe en lugar de lanzar excepción
   *
   * @param userId - ID del usuario
   * @param moduleId - ID del módulo
   * @returns Registro de progreso o null si no existe
   */
  async findByUserAndModuleOrNull(userId: string, moduleId: string): Promise<ModuleProgress | null> {
    return this.moduleProgressRepo.findOne({
      where: { user_id: userId, module_id: moduleId },
    });
  }

  /**
   * Obtiene o crea el progreso de un usuario en un módulo
   * Si no existe, retorna un objeto de progreso vacío (no persistido)
   *
   * @param userId - ID del usuario
   * @param moduleId - ID del módulo
   * @returns Registro de progreso existente o objeto vacío
   */
  async findByUserAndModuleOrEmpty(userId: string, moduleId: string): Promise<ModuleProgress | Partial<ModuleProgress>> {
    const progress = await this.moduleProgressRepo.findOne({
      where: { user_id: userId, module_id: moduleId },
    });

    if (progress) {
      return progress;
    }

    // Return empty progress object (not persisted)
    // This allows frontend to handle "not started" state gracefully
    return {
      user_id: userId,
      module_id: moduleId,
      status: ProgressStatusEnum.NOT_STARTED,
      progress_percentage: 0,
      completed_exercises: 0,
      total_exercises: 0,
      total_score: 0,
      total_xp_earned: 0,
      total_ml_coins_earned: 0,
    };
  }

  /**
   * Crea un nuevo registro de progreso para un módulo
   * @param dto - Datos para crear el progreso
   * @returns Nuevo registro de progreso
   */
  async create(dto: CreateModuleProgressDto): Promise<ModuleProgress> {
    // Verificar que no exista progreso previo
    const existingProgress = await this.moduleProgressRepo.findOne({
      where: { user_id: dto.user_id, module_id: dto.module_id },
    });

    if (existingProgress) {
      throw new BadRequestException(
        `Progress already exists for user ${dto.user_id} in module ${dto.module_id}`,
      );
    }

    const newProgress = this.moduleProgressRepo.create({
      ...dto,
      status: ProgressStatusEnum.NOT_STARTED,
      progress_percentage: 0,
      completed_exercises: 0,
      total_exercises: dto.total_exercises || 0,
      skipped_exercises: 0,
      total_score: 0,
      total_xp_earned: 0,
      total_ml_coins_earned: 0,
      time_spent: '00:00:00',
      sessions_count: 0,
      attempts_count: 0,
      hints_used_total: 0,
      comodines_used_total: 0,
      comodines_cost_total: 0,
      started_at: new Date(),
      learning_path: [],
      performance_analytics: {},
      system_observations: {},
      metadata: {},
    });

    return this.moduleProgressRepo.save(newProgress);
  }

  /**
   * Actualiza campos específicos de un progreso
   * @param id - ID del registro de progreso
   * @param dto - Campos a actualizar
   * @returns Registro actualizado
   */
  async update(
    id: string,
    dto: Partial<CreateModuleProgressDto>,
  ): Promise<ModuleProgress> {
    const progress = await this.moduleProgressRepo.findOne({ where: { id } });

    if (!progress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }

    Object.assign(progress, dto);
    return this.moduleProgressRepo.save(progress);
  }

  /**
   * Actualiza el porcentaje de progreso de un módulo
   * @param id - ID del registro de progreso
   * @param percentage - Nuevo porcentaje (0-100)
   * @returns Registro actualizado
   */
  async updateProgressPercentage(id: string, percentage: number): Promise<ModuleProgress> {
    // Validar porcentaje
    if (percentage < 0 || percentage > 100) {
      throw new BadRequestException('Progress percentage must be between 0 and 100');
    }

    const progress = await this.moduleProgressRepo.findOne({ where: { id } });

    if (!progress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }

    progress.progress_percentage = percentage;
    progress.last_accessed_at = new Date();

    // Actualizar estado basado en porcentaje
    if (percentage === 0) {
      progress.status = ProgressStatusEnum.NOT_STARTED;
    } else if (percentage < 100) {
      progress.status = ProgressStatusEnum.IN_PROGRESS;
    } else {
      progress.status = ProgressStatusEnum.COMPLETED;
      progress.completed_at = new Date();
    }

    return this.moduleProgressRepo.save(progress);
  }

  /**
   * Marca un módulo como completado y genera certificado automáticamente
   *
   * @param id - ID del registro de progreso
   * @returns Registro actualizado
   *
   * @see EPIC 10.2 - Digital Certificates System (auto-generation)
   */
  async completeModule(id: string): Promise<ModuleProgress> {
    const progress = await this.moduleProgressRepo.findOne({ where: { id } });

    if (!progress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }

    progress.status = ProgressStatusEnum.COMPLETED;
    progress.progress_percentage = 100;
    progress.completed_at = new Date();
    progress.last_accessed_at = new Date();

    // Calcular promedio de score si hay ejercicios completados
    if (progress.completed_exercises > 0 && progress.max_possible_score) {
      progress.average_score = Number(
        ((progress.total_score / progress.max_possible_score) * 100).toFixed(2),
      );
    }

    const savedProgress = await this.moduleProgressRepo.save(progress);

    // [EPIC-10.2] Auto-generate certificate on module completion
    try {
      this.logger.log(`[EPIC-10.2] Auto-generating certificate for user ${progress.user_id} module ${progress.module_id}`);

      await this.certificateService.generateModuleCertificate(
        progress.user_id,
        progress.module_id,
        undefined, // tenant_id - will be resolved from profile
        progress.classroom_id || undefined,
      );

      this.logger.log(`[EPIC-10.2] Certificate generated successfully for module completion`);
    } catch (error) {
      // Log the error but don't fail the module completion
      // Certificate generation is a secondary concern
      this.logger.warn(`[EPIC-10.2] Certificate generation failed (non-blocking): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return savedProgress;
  }

  /**
   * Obtiene estadísticas agregadas de un módulo
   * @param moduleId - ID del módulo
   * @returns Estadísticas del módulo (total estudiantes, promedios, completados)
   */
  async getModuleStats(moduleId: string): Promise<{
    total_students: number;
    completed_count: number;
    in_progress_count: number;
    average_progress: number;
    average_score: number;
    average_time_spent: string;
  }> {
    const allProgress = await this.moduleProgressRepo.find({
      where: { module_id: moduleId },
    });

    if (allProgress.length === 0) {
      return {
        total_students: 0,
        completed_count: 0,
        in_progress_count: 0,
        average_progress: 0,
        average_score: 0,
        average_time_spent: '00:00:00',
      };
    }

    const completedCount = allProgress.filter(
      (p) => p.status === ProgressStatusEnum.COMPLETED,
    ).length;

    const inProgressCount = allProgress.filter(
      (p) => p.status === ProgressStatusEnum.IN_PROGRESS,
    ).length;

    const totalProgress = allProgress.reduce((sum, p) => sum + p.progress_percentage, 0);
    const averageProgress = totalProgress / allProgress.length;

    const validScores = allProgress.filter((p) => p.average_score !== null && p.average_score !== undefined);
    const totalScore = validScores.reduce((sum, p) => sum + (p.average_score || 0), 0);
    const averageScore = validScores.length > 0 ? totalScore / validScores.length : 0;

    return {
      total_students: allProgress.length,
      completed_count: completedCount,
      in_progress_count: inProgressCount,
      average_progress: Number(averageProgress.toFixed(2)),
      average_score: Number(averageScore.toFixed(2)),
      average_time_spent: '00:00:00', // TODO: Calcular promedio real de intervalos
    };
  }

  /**
   * Obtiene resumen de progreso de un usuario (completion rates, módulos activos)
   * @param userId - ID del usuario
   * @returns Resumen de progreso del usuario
   */
  async getUserProgressSummary(userId: string): Promise<{
    total_modules: number;
    completed_modules: number;
    in_progress_modules: number;
    completion_rate: number;
    total_xp_earned: number;
    total_ml_coins_earned: number;
    total_time_spent: string;
    total_exercises: number;
    completed_exercises: number;
    average_score: number;
    current_streak: number;
    longest_streak: number;
  }> {
    const allProgress = await this.moduleProgressRepo.find({
      where: { user_id: userId },
    });

    const completedModules = allProgress.filter(
      (p) => p.status === ProgressStatusEnum.COMPLETED,
    ).length;

    const inProgressModules = allProgress.filter(
      (p) => p.status === ProgressStatusEnum.IN_PROGRESS,
    ).length;

    const completionRate =
      allProgress.length > 0 ? (completedModules / allProgress.length) * 100 : 0;

    const totalXp = allProgress.reduce((sum, p) => sum + p.total_xp_earned, 0);
    const totalCoins = allProgress.reduce((sum, p) => sum + p.total_ml_coins_earned, 0);

    // Calcular total de ejercicios y ejercicios completados
    const totalExercises = allProgress.reduce((sum, p) => sum + (p.total_exercises || 0), 0);
    const completedExercises = allProgress.reduce((sum, p) => sum + (p.completed_exercises || 0), 0);

    // Calcular promedio de score (solo módulos con score > 0)
    const modulesWithScore = allProgress.filter(p => p.total_score > 0);
    const averageScore = modulesWithScore.length > 0
      ? modulesWithScore.reduce((sum, p) => sum + p.total_score, 0) / modulesWithScore.length
      : 0;

    return {
      total_modules: allProgress.length,
      completed_modules: completedModules,
      in_progress_modules: inProgressModules,
      completion_rate: Number(completionRate.toFixed(2)),
      total_xp_earned: totalXp,
      total_ml_coins_earned: totalCoins,
      total_time_spent: '00:00:00', // TODO: Sumar intervalos
      total_exercises: totalExercises,
      completed_exercises: completedExercises,
      average_score: Number(averageScore.toFixed(2)),
      current_streak: 0, // TODO: Obtener de user_stats
      longest_streak: 0, // TODO: Obtener de user_stats
    };
  }

  /**
   * Obtiene módulos en progreso de un usuario
   * @param userId - ID del usuario
   * @returns Lista de módulos actualmente en progreso
   */
  async findInProgress(userId: string): Promise<ModuleProgress[]> {
    return this.moduleProgressRepo.find({
      where: {
        user_id: userId,
        status: ProgressStatusEnum.IN_PROGRESS,
      },
      order: { last_accessed_at: 'DESC' },
    });
  }

  /**
   * Genera ruta de aprendizaje personalizada basada en progreso
   * EPIC 10.3 - Module Progress Tracking (mejorado)
   *
   * @param userId - ID del usuario
   * @returns Recomendaciones de próximos módulos con reasoning detallado
   */
  async calculateLearningPath(userId: string): Promise<{
    user_id: string;
    recommended_modules: {
      module_id: string;
      module_title: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
      estimated_minutes: number;
      progress_percentage: number;
    }[];
    areas_for_improvement: string[];
    suggested_next_action: string;
    difficulty_adjustment: 'increase' | 'maintain' | 'decrease';
    overall_performance: 'excellent' | 'good' | 'needs_improvement' | 'struggling';
  }> {
    this.logger.log(`[EPIC-10.3] Calculating learning path for user ${userId}`);

    // 1. Get all progress for user
    const allProgress = await this.moduleProgressRepo.find({
      where: { user_id: userId },
      order: { updated_at: 'DESC' },
    });

    // 2. Get all available modules with their info
    const modulesQuery = `
      SELECT
        m.id,
        m.title,
        m.difficulty_level,
        m.order_index,
        m.estimated_duration_minutes,
        m.prerequisites,
        COUNT(e.id) as exercise_count
      FROM educational_content.modules m
      LEFT JOIN educational_content.exercises e ON e.module_id = m.id AND e.is_active = true
      WHERE m.is_active = true
      GROUP BY m.id
      ORDER BY m.order_index ASC
    `;

    const allModules = await this.moduleProgressRepo.query(modulesQuery);

    // 3. Create progress map
    const progressMap = new Map<string, ModuleProgress>();
    for (const p of allProgress) {
      progressMap.set(p.module_id, p);
    }

    // 4. Calculate overall performance metrics
    const completedModules = allProgress.filter(p => p.status === ProgressStatusEnum.COMPLETED);
    const inProgressModules = allProgress.filter(p => p.status === ProgressStatusEnum.IN_PROGRESS);

    const totalScore = completedModules.reduce((sum, p) => sum + (p.average_score || 0), 0);
    const averageScore = completedModules.length > 0 ? totalScore / completedModules.length : 0;

    // 5. Determine overall performance level
    let overallPerformance: 'excellent' | 'good' | 'needs_improvement' | 'struggling';
    let difficultyAdjustment: 'increase' | 'maintain' | 'decrease';

    if (averageScore >= 90) {
      overallPerformance = 'excellent';
      difficultyAdjustment = 'increase';
    } else if (averageScore >= 75) {
      overallPerformance = 'good';
      difficultyAdjustment = 'maintain';
    } else if (averageScore >= 60) {
      overallPerformance = 'needs_improvement';
      difficultyAdjustment = 'maintain';
    } else {
      overallPerformance = 'struggling';
      difficultyAdjustment = 'decrease';
    }

    // 6. Build recommended modules list
    const recommendedModules: {
      module_id: string;
      module_title: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
      estimated_minutes: number;
      progress_percentage: number;
    }[] = [];

    // Priority 1: Continue modules in progress
    for (const p of inProgressModules) {
      const moduleInfo = allModules.find((m: any) => m.id === p.module_id);
      if (moduleInfo) {
        recommendedModules.push({
          module_id: p.module_id,
          module_title: moduleInfo.title,
          priority: 'high',
          reason: `Continúa donde lo dejaste (${p.progress_percentage}% completado)`,
          estimated_minutes: Math.round((moduleInfo.estimated_duration_minutes || 60) * (1 - p.progress_percentage / 100)),
          progress_percentage: p.progress_percentage,
        });
      }
    }

    // Priority 2: Not started modules that are next in sequence
    const completedIds = new Set(completedModules.map(p => p.module_id));
    const inProgressIds = new Set(inProgressModules.map(p => p.module_id));

    for (const module of allModules) {
      if (completedIds.has(module.id) || inProgressIds.has(module.id)) {
        continue; // Skip completed and in-progress
      }

      // Check if prerequisites are met
      const prerequisites = module.prerequisites || [];
      const prereqsMet = prerequisites.every((prereqId: string) => completedIds.has(prereqId));

      if (prereqsMet && recommendedModules.length < 5) {
        recommendedModules.push({
          module_id: module.id,
          module_title: module.title,
          priority: recommendedModules.length < 2 ? 'high' : 'medium',
          reason: prerequisites.length > 0
            ? 'Siguiente módulo en tu ruta de aprendizaje'
            : 'Módulo disponible para comenzar',
          estimated_minutes: module.estimated_duration_minutes || 60,
          progress_percentage: 0,
        });
      }
    }

    // 7. Identify areas for improvement based on low scores
    const areasForImprovement: string[] = [];
    const lowScoreModules = completedModules.filter(p => (p.average_score || 0) < 70);

    for (const lowScore of lowScoreModules.slice(0, 3)) {
      const moduleInfo = allModules.find((m: any) => m.id === lowScore.module_id);
      if (moduleInfo) {
        areasForImprovement.push(moduleInfo.title);
      }
    }

    // 8. Determine suggested next action
    let suggestedNextAction: string;
    if (inProgressModules.length > 0) {
      const firstInProgress = inProgressModules[0];
      const moduleInfo = allModules.find((m: any) => m.id === firstInProgress.module_id);
      suggestedNextAction = `Continúa con "${moduleInfo?.title || 'el módulo actual'}" - te falta ${100 - firstInProgress.progress_percentage}%`;
    } else if (recommendedModules.length > 0) {
      suggestedNextAction = `Comienza el módulo "${recommendedModules[0].module_title}"`;
    } else if (areasForImprovement.length > 0) {
      suggestedNextAction = `Practica más en "${areasForImprovement[0]}" para mejorar tu puntaje`;
    } else {
      suggestedNextAction = '¡Felicitaciones! Has completado todos los módulos disponibles';
    }

    this.logger.log(`[EPIC-10.3] Learning path calculated: ${recommendedModules.length} recommendations, performance: ${overallPerformance}`);

    return {
      user_id: userId,
      recommended_modules: recommendedModules,
      areas_for_improvement: areasForImprovement,
      suggested_next_action: suggestedNextAction,
      difficulty_adjustment: difficultyAdjustment,
      overall_performance: overallPerformance,
    };
  }

  /**
   * Obtiene el desglose de ejercicios de un módulo para un usuario
   * EPIC 10.3 - Module Progress Tracking
   *
   * @param userId - ID del usuario
   * @param moduleId - ID del módulo
   * @returns Desglose detallado de ejercicios con estado de completación
   */
  async getModuleExerciseBreakdown(
    userId: string,
    moduleId: string,
  ): Promise<ModuleExerciseBreakdownDto> {
    this.logger.log(`[EPIC-10.3] Getting exercise breakdown for user ${userId} in module ${moduleId}`);

    // 1. Get module progress for this user (or create empty response if none)
    let moduleProgress: ModuleProgress | null = null;
    try {
      moduleProgress = await this.findByUserAndModule(userId, moduleId);
    } catch {
      // Module progress doesn't exist yet - that's OK, user hasn't started
      this.logger.debug(`No progress found for user ${userId} in module ${moduleId}`);
    }

    // 2. Get all exercises for this module from educational_content schema
    // Using raw query for cross-schema access
    const exercisesQuery = `
      SELECT
        e.id,
        e.title,
        e.order_index,
        e.exercise_type,
        e.difficulty_level,
        e.xp_reward,
        e.ml_coins_reward,
        e.estimated_time_minutes,
        e.max_score,
        m.title as module_title
      FROM educational_content.exercises e
      JOIN educational_content.modules m ON m.id = e.module_id
      WHERE e.module_id = $1 AND e.is_active = true
      ORDER BY e.order_index ASC
    `;

    const exercises = await this.moduleProgressRepo.query(exercisesQuery, [moduleId]);

    if (exercises.length === 0) {
      throw new NotFoundException(`No exercises found for module ${moduleId}`);
    }

    const moduleTitle = exercises[0]?.module_title || 'Unknown Module';

    // 3. Get all submissions for this user in this module's exercises
    const exerciseIds = exercises.map((e: any) => e.id);
    const submissions = await this.exerciseSubmissionRepo
      .createQueryBuilder('sub')
      .where('sub.user_id = :userId', { userId })
      .andWhere('sub.exercise_id IN (:...exerciseIds)', { exerciseIds })
      .orderBy('sub.submitted_at', 'DESC')
      .getMany();

    // Create a map of exercise_id -> latest submission
    const submissionMap = new Map<string, ExerciseSubmission>();
    for (const sub of submissions) {
      if (!submissionMap.has(sub.exercise_id)) {
        submissionMap.set(sub.exercise_id, sub);
      }
    }

    // Count attempts per exercise
    const attemptsCountQuery = `
      SELECT exercise_id, COUNT(*) as count
      FROM progress_tracking.exercise_submissions
      WHERE user_id = $1 AND exercise_id = ANY($2)
      GROUP BY exercise_id
    `;
    const attemptsCounts = await this.moduleProgressRepo.query(attemptsCountQuery, [userId, exerciseIds]);
    const attemptsMap = new Map<string, number>();
    for (const ac of attemptsCounts) {
      attemptsMap.set(ac.exercise_id, parseInt(ac.count, 10));
    }

    // 4. Build exercise status list
    const exerciseStatuses: ExerciseStatusDto[] = [];
    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;
    let skippedCount = 0;
    let totalScore = 0;
    let scoredCount = 0;
    let totalXpEarned = 0;
    let totalMlCoinsEarned = 0;
    let estimatedRemainingMinutes = 0;

    for (const ex of exercises) {
      const submission = submissionMap.get(ex.id);
      const attempts = attemptsMap.get(ex.id) || 0;

      let status: ExerciseCompletionStatus = 'pending';
      let score: number | null = null;
      let isCorrect: boolean | null = null;
      let completedAt: string | null = null;

      if (submission) {
        if (submission.is_correct === true) {
          status = 'completed';
          completedCount++;
          score = submission.score;
          isCorrect = true;
          completedAt = submission.submitted_at?.toISOString() || null;
          totalScore += submission.score || 0;
          scoredCount++;
          totalXpEarned += ex.xp_reward || 0;
          totalMlCoinsEarned += ex.ml_coins_reward || 0;
        } else if (submission.is_correct === false) {
          // Has submission but not correct - in progress
          status = 'in_progress';
          inProgressCount++;
          score = submission.score;
          isCorrect = false;
          estimatedRemainingMinutes += ex.estimated_time_minutes || 10;
        } else {
          // Submission exists but not graded yet
          status = 'in_progress';
          inProgressCount++;
          estimatedRemainingMinutes += ex.estimated_time_minutes || 10;
        }
      } else {
        // No submission - pending
        status = 'pending';
        pendingCount++;
        estimatedRemainingMinutes += ex.estimated_time_minutes || 10;
      }

      exerciseStatuses.push({
        exercise_id: ex.id,
        title: ex.title,
        order_index: ex.order_index,
        exercise_type: ex.exercise_type,
        difficulty: ex.difficulty_level,
        status,
        score,
        max_score: ex.max_score || 100,
        is_correct: isCorrect,
        xp_reward: ex.xp_reward || 0,
        ml_coins_reward: ex.ml_coins_reward || 0,
        estimated_minutes: ex.estimated_time_minutes || 10,
        completed_at: completedAt,
        attempts_count: attempts,
      });
    }

    // 5. Calculate progress percentage
    const totalExercises = exercises.length;
    const progressPercentage = totalExercises > 0
      ? Math.round((completedCount / totalExercises) * 100)
      : 0;

    // 6. Calculate average score
    const averageScore = scoredCount > 0
      ? Number((totalScore / scoredCount).toFixed(2))
      : 0;

    // 7. Find next exercise to complete
    const nextExercise = exerciseStatuses.find(
      (e) => e.status === 'in_progress' || e.status === 'pending',
    ) || null;

    // 8. Get time spent from module progress
    const timeSpent = moduleProgress?.time_spent || '00:00:00';

    const result: ModuleExerciseBreakdownDto = {
      user_id: userId,
      module_id: moduleId,
      module_title: moduleTitle,
      total_exercises: totalExercises,
      completed_exercises: completedCount,
      in_progress_exercises: inProgressCount,
      pending_exercises: pendingCount,
      skipped_exercises: skippedCount,
      progress_percentage: progressPercentage,
      average_score: averageScore,
      total_xp_earned: totalXpEarned,
      total_ml_coins_earned: totalMlCoinsEarned,
      estimated_remaining_minutes: estimatedRemainingMinutes,
      time_spent: timeSpent,
      exercises: exerciseStatuses,
      next_exercise: nextExercise,
    };

    this.logger.log(`[EPIC-10.3] Exercise breakdown: ${completedCount}/${totalExercises} completed (${progressPercentage}%)`);

    return result;
  }
}
