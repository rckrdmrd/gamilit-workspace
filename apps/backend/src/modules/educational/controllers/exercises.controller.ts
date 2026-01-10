import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ExercisesService } from '../services';
import {
  CreateExerciseDto,
  ExerciseResponseDto,
  SubmitExerciseDto,
  SubmitExerciseResponseDto,
} from '../dto';
import { API_ROUTES, extractBasePath } from '@/shared/constants';
import { ExerciseTypeEnum } from '@/shared/constants/enums.constants';
import { ExerciseSubmissionService, ExerciseAttemptService } from '@/modules/progress/services';
import { ExerciseAnswerValidator } from '@/modules/progress/dto/answers/exercise-answer.validator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Profile } from '@/modules/auth/entities';
import { AuthRequest } from '@shared/types';

/**
 * ExercisesController
 *
 * @description Gestión de ejercicios educativos con 27+ mecánicas diferentes.
 * Endpoints para crear, leer, actualizar y eliminar ejercicios,
 * así como gestionar pistas y validar contenido JSONB.
 *
 * @route /api/v1/educational/exercises
 */
@ApiTags('Educational - Exercises')
@Controller(extractBasePath(API_ROUTES.EDUCATIONAL.BASE))
export class ExercisesController {
  constructor(
    private readonly exercisesService: ExercisesService,
    private readonly exerciseSubmissionService: ExerciseSubmissionService,
    private readonly exerciseAttemptService: ExerciseAttemptService,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
    @Optional()
    @InjectDataSource('educational')
    private readonly dataSource?: DataSource,
  ) {}

  /**
   * FE-061: Helper method to convert auth.users.id → profiles.id
   *
   * @param userId - auth.users.id (from JWT token)
   * @returns profiles.id
   * @throws NotFoundException if profile doesn't exist
   */
  private async getProfileId(userId: string): Promise<string> {
    const profile = await this.profileRepo.findOne({
      where: { user_id: userId },
      select: ['id'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    return profile.id;
  }

  /**
   * Normaliza la estructura de respuestas del ejercicio
   *
   * @description Detecta y convierte entre formato antiguo y nuevo.
   * Mantiene compatibilidad temporal durante la transición.
   *
   * @param dto - DTO de entrada (puede contener formato antiguo o nuevo)
   * @param req - Request object (contiene JWT user)
   * @returns Objeto normalizado con estructura estándar
   *
   * @throws BadRequestException si no se encuentra campo de respuestas o userId
   *
   * @note FE-061: Este método resuelve el workaround temporal
   */
  private normalizeSubmitData(dto: SubmitExerciseDto, req: any): {
    userId: string;
    answers: Record<string, unknown>;
    timeSpentSeconds?: number;
    hintsUsed: number;
    powerupsUsed: string[];
  } {
    // 1. Determinar userId (JWT tiene prioridad)
    const userId = req.user?.id || dto.userId;

    if (!userId) {
      throw new BadRequestException(
        'User ID not found. Ensure JWT authentication is enabled or provide userId in body.',
      );
    }

    // 2. Extraer respuestas (nuevo formato tiene prioridad)
    let answers: Record<string, unknown>;

    if (dto.answers) {
      // Formato nuevo (estándar)
      answers = dto.answers;
    } else if (dto.submitted_answers) {
      // Formato antiguo (compatibilidad)
      answers = dto.submitted_answers;
      // Log para detectar uso de formato antiguo
      console.warn('[DEPRECATED] Client using old format "submitted_answers". Migrate to "answers".');
    } else {
      throw new BadRequestException(
        'Missing exercise answers. Provide either "answers" or "submitted_answers".',
      );
    }

    // 3. Calcular tiempo invertido
    let timeSpentSeconds: number | undefined;

    if (dto.startedAt) {
      // Formato nuevo (camelCase): calcular desde timestamp
      timeSpentSeconds = Math.floor((Date.now() - dto.startedAt) / 1000);
    } else if (dto.started_at) {
      // Formato snake_case: calcular desde timestamp
      timeSpentSeconds = Math.floor((Date.now() - dto.started_at) / 1000);
    } else if (dto.time_spent_seconds !== undefined) {
      // Formato antiguo: usar valor directo
      timeSpentSeconds = dto.time_spent_seconds;
    }

    // 4. Normalizar hints y powerups (prioridad: camelCase > snake_case > legacy)
    const hintsUsed = dto.hintsUsed ?? dto.hints_used ?? 0;
    const powerupsUsed = dto.powerupsUsed ?? dto.powerups_used ?? dto.comodines_used ?? [];

    return {
      userId,
      answers,
      timeSpentSeconds,
      hintsUsed,
      powerupsUsed,
    };
  }

  /**
   * Obtiene todos los ejercicios ordenados por módulo y índice
   *
   * @returns Array de ejercicios ordenados
   *
   * @example
   * GET /api/v1/educational/exercises
   * Response: [
   *   {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "module_id": "660e8400-e29b-41d4-a716-446655440000",
   *     "title": "Crucigrama - Infancia de Marie",
   *     "exercise_type": "crucigrama",
   *     "order_index": 0,
   *     ...
   *   }
   * ]
   */
  @UseGuards(JwtAuthGuard)
  @Get('exercises')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all exercises',
    description: 'Obtiene todos los ejercicios ordenados por módulo e índice de secuencia, con estado de completado para el usuario autenticado. Estudiantes solo ven ejercicios de sus classrooms asignados (RLS).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ejercicios obtenida exitosamente',
    type: [ExerciseResponseDto],
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          module_id: '660e8400-e29b-41d4-a716-446655440000',
          title: 'Crucigrama - Infancia de Marie',
          subtitle: 'Completa el crucigrama sobre la infancia de Marie Curie',
          description: 'Un crucigrama interactivo para reforzar conceptos',
          instructions: 'Lee las pistas y completa el crucigrama',
          order_index: 0,
          exercise_type: 'crucigrama',
          content: {
            grid: [],
            across_clues: [],
            down_clues: [],
          },
          solution: {},
          auto_gradable: true,
          difficulty_level: 'beginner',
          max_points: 100,
          passing_score: 70,
          estimated_time_minutes: 15,
          time_limit_minutes: null,
          max_attempts: 3,
          allow_retry: true,
          hints: ['Pista 1', 'Pista 2'],
          enable_hints: true,
          hint_cost_ml_coins: 10,
          comodines_allowed: ['pistas', 'segunda_oportunidad'],
          xp_reward: 50,
          ml_coins_reward: 25,
          is_active: true,
          is_optional: false,
          is_bonus: false,
          version: 1,
          completed: false,
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async findAll(@Request() req: AuthRequest) {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // GAP-C06: Aplicar RLS según el rol del usuario
    let exercises: any[];

    if (userRole === 'student') {
      // Estudiantes: Solo ejercicios de sus classrooms asignados
      exercises = await this.exercisesService.findAllForStudent(userId);
    } else {
      // admin_teacher, super_admin: Todos los ejercicios
      exercises = await this.exercisesService.findAll();
    }

    // FIX 2025-11-24: Convert auth.users.id → profiles.id
    // exercise_submissions.user_id references profiles.id (not auth.users.id)
    const profileId = await this.getProfileId(userId);

    // Obtener todas las submissions del usuario de una sola vez para eficiencia
    const allSubmissions = await this.exerciseSubmissionService.findByUserId(profileId);

    // FIX BUG-002: También obtener exercise_attempts para ejercicios auto-calificados
    // Los ejercicios como Crucigrama usan exercise_attempts, no exercise_submissions
    const allAttempts = await this.exerciseAttemptService.findByUserId(profileId);

    // Crear un mapa de ejercicios completados (de submissions Y attempts)
    const completedExercisesMap = new Map<string, boolean>();

    // Marcar como completados los ejercicios con submissions calificadas
    allSubmissions.forEach((submission) => {
      if (submission.status === 'graded') {
        completedExercisesMap.set(submission.exercise_id, true);
      }
    });

    // Marcar como completados los ejercicios con intentos correctos (auto-calificados)
    allAttempts.forEach((attempt) => {
      if (attempt.is_correct) {
        completedExercisesMap.set(attempt.exercise_id, true);
      }
    });

    // Agregar campo 'completed' a cada ejercicio
    return exercises.map((exercise) => ({
      ...exercise,
      completed: completedExercisesMap.get(exercise.id) || false,
    }));
  }

  /**
   * Obtiene un ejercicio específico por ID
   *
   * @param id - ID del ejercicio (UUID)
   * @returns Ejercicio encontrado
   *
   * @example
   * GET /api/v1/educational/exercises/550e8400-e29b-41d4-a716-446655440000
   */
  @UseGuards(JwtAuthGuard)
  @Get('exercises/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get exercise by ID',
    description: 'Obtiene un ejercicio específico por su ID, incluyendo estado de completado para el usuario autenticado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ejercicio en formato UUID',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Ejercicio encontrado exitosamente',
    type: ExerciseResponseDto,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        module_id: '660e8400-e29b-41d4-a716-446655440000',
        title: 'Crucigrama - Infancia de Marie',
        subtitle: 'Completa el crucigrama sobre la infancia de Marie Curie',
        description: 'Un crucigrama interactivo para reforzar conceptos clave',
        instructions: 'Lee las pistas horizontales y verticales y completa el crucigrama',
        order_index: 0,
        exercise_type: 'crucigrama',
        config: {
          grid_size: { rows: 10, cols: 10 },
          show_numbers: true,
        },
        content: {
          grid: [
            ['P', 'O', 'L', 'O', 'N', 'I', 'A', '', '', ''],
            ['', '', '', '', '', '', '', '', '', ''],
          ],
          across_clues: [{ number: 1, clue: 'País natal de Marie', answer: 'POLONIA' }],
          down_clues: [{ number: 2, clue: 'Primer nombre de Marie', answer: 'MARIA' }],
        },
        solution: {
          correct_grid: [],
          explanation: 'Marie Curie nació en Polonia...',
        },
        rubric: {
          criteria: [{ name: 'Corrección', weight: 1.0 }],
        },
        auto_gradable: true,
        difficulty_level: 'beginner',
        max_points: 100,
        passing_score: 70,
        estimated_time_minutes: 15,
        time_limit_minutes: null,
        max_attempts: 3,
        allow_retry: true,
        retry_delay_minutes: 0,
        hints: ['La respuesta está en el primer párrafo', 'Marie nació en Varsovia'],
        enable_hints: true,
        hint_cost_ml_coins: 10,
        comodines_allowed: ['pistas', 'segunda_oportunidad'],
        comodines_config: {
          pistas: { max_uses: 2 },
          segunda_oportunidad: { max_uses: 1 },
        },
        xp_reward: 50,
        ml_coins_reward: 25,
        bonus_multiplier: 1.0,
        is_active: true,
        is_optional: false,
        is_bonus: false,
        version: 1,
        version_notes: 'Versión inicial',
        adaptive_difficulty: false,
        prerequisites: [],
        metadata: {
          tags: ['crucigrama', 'infancia', 'biografía'],
        },
        completed: false,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Ejercicio no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Exercise with ID 550e8400-e29b-41d4-a716-446655440000 not found',
      },
    },
  })
  async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    const userId = req.user!.id;

    // Obtener ejercicio
    const exercise = await this.exercisesService.findById(id);

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    // FIX 2025-11-24: Convert auth.users.id → profiles.id
    const profileId = await this.getProfileId(userId);

    // FE-061: Mejorar validación de completed
    // Verificar si el usuario ha completado este ejercicio con validaciones adicionales
    const submission = await this.exerciseSubmissionService.findByUserAndExercise(profileId, id);

    // Validar que:
    // 1. Existe submission
    // 2. Status es 'graded'
    // 3. Score es >= passing_score (70 por defecto)
    let completed = submission
      && submission.status === 'graded'
      && submission.score >= (exercise.passing_score || 70)
      ? true
      : false;

    // FIX BUG-002: También verificar exercise_attempts para ejercicios auto-calificados
    if (!completed) {
      const attempts = await this.exerciseAttemptService.findByUserAndExercise(profileId, id);
      // Si tiene al menos un intento correcto, está completado
      completed = attempts.some((attempt) => attempt.is_correct);
    }

    // FE-061: Exercise ya viene sanitizado del service (sanitizeExercise)
    // NO re-sanitizar para evitar duplicación y sobreescritura
    // El service ya eliminó solutions y generó grid correcto con config.gridSize

    // Retornar ejercicio con campo 'completed'
    return {
      ...exercise,
      completed,
    };
  }

  /**
   * FE-061: MÉTODOS ELIMINADOS - generateCrosswordGrid() y filterCorrectAnswers()
   *
   * @deprecated Estos métodos fueron eliminados para evitar duplicación de sanitización.
   * La sanitización ahora se realiza ÚNICAMENTE en ExercisesService.sanitizeExercise()
   *
   * Razón de eliminación:
   * - generateCrosswordGrid() calculaba dimensiones desde clues (incorrecto)
   * - Ignoraba config.gridSize del ejercicio
   * - filterCorrectAnswers() duplicaba la sanitización del service
   * - Causaba sobreescritura del grid correcto (15x15 -> 13x15)
   *
   * Ver:
   * - FE-060: Fix gridSize en service
   * - FE-061: Análisis profundo y eliminación de duplicación
   * - apps/backend/src/modules/educational/services/exercises.service.ts (sanitización única)
   */

  /**
   * Crea un nuevo ejercicio educativo
   *
   * @param createExerciseDto - Datos del ejercicio a crear
   * @returns Ejercicio creado
   *
   * @example
   * POST /api/v1/educational/exercises
   * Request: {
   *   "module_id": "660e8400-e29b-41d4-a716-446655440000",
   *   "title": "Crucigrama - Infancia de Marie",
   *   "exercise_type": "crucigrama",
   *   "order_index": 0,
   *   "content": {
   *     "grid": [...],
   *     "across_clues": [...],
   *     "down_clues": [...]
   *   }
   * }
   */
  @Post('exercises')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new exercise [Admin only]',
    description:
      'Crea un nuevo ejercicio educativo con validación de contenido JSONB. Requiere permisos de administrador.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ejercicio creado exitosamente',
    type: ExerciseResponseDto,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        module_id: '660e8400-e29b-41d4-a716-446655440000',
        title: 'Crucigrama - Infancia de Marie',
        exercise_type: 'crucigrama',
        order_index: 0,
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o contenido JSONB no cumple con la estructura del exercise_type',
    schema: {
      example: {
        statusCode: 400,
        message: 'Crucigrama must have grid, across_clues, and down_clues',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Se requieren permisos de administrador',
  })
  async create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  /**
   * Actualiza un ejercicio educativo existente
   *
   * @param id - ID del ejercicio a actualizar
   * @param updateExerciseDto - Datos a actualizar (parciales)
   * @returns Ejercicio actualizado
   *
   * @example
   * PATCH /api/v1/educational/exercises/550e8400-e29b-41d4-a716-446655440000
   * Request: {
   *   "title": "Crucigrama - Infancia de Marie (Actualizado)",
   *   "max_points": 120
   * }
   */
  @Patch('exercises/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update exercise [Admin only]',
    description:
      'Actualiza un ejercicio educativo existente con validación de contenido. Requiere permisos de administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ejercicio en formato UUID',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Ejercicio actualizado exitosamente',
    type: ExerciseResponseDto,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Crucigrama - Infancia de Marie (Actualizado)',
        max_points: 120,
        updated_at: '2025-01-15T11:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o contenido JSONB inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Se requieren permisos de administrador',
  })
  @ApiResponse({
    status: 404,
    description: 'Ejercicio no encontrado',
  })
  async update(@Param('id') id: string, @Body() updateExerciseDto: Partial<CreateExerciseDto>) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  /**
   * Elimina un ejercicio educativo
   *
   * @param id - ID del ejercicio a eliminar
   * @returns Resultado de la operación
   *
   * @example
   * DELETE /api/v1/educational/exercises/550e8400-e29b-41d4-a716-446655440000
   */
  @Delete('exercises/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete exercise [Admin only]',
    description: 'Elimina un ejercicio educativo. Requiere permisos de administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ejercicio en formato UUID',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Ejercicio eliminado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Exercise deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Se requieren permisos de administrador',
  })
  @ApiResponse({
    status: 404,
    description: 'Ejercicio no encontrado',
  })
  async remove(@Param('id') id: string) {
    const deleted = await this.exercisesService.delete(id);
    return {
      success: deleted,
      message: deleted ? 'Exercise deleted successfully' : 'Exercise not found',
    };
  }

  /**
   * Obtiene ejercicios por módulo
   *
   * @param moduleId - ID del módulo
   * @param req - Request object (contiene JWT user)
   * @returns Array de ejercicios del módulo ordenados por índice con estado de completado
   *
   * @example
   * GET /api/v1/educational/modules/660e8400-e29b-41d4-a716-446655440000/exercises
   * Response: [
   *   {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "title": "Crucigrama - Infancia de Marie",
   *     "order_index": 0,
   *     "exercise_type": "crucigrama",
   *     "completed": true
   *   }
   * ]
   */
  @UseGuards(JwtAuthGuard)
  @Get('modules/:moduleId/exercises')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get exercises by module',
    description: 'Obtiene todos los ejercicios de un módulo específico ordenados por índice, con estado de completado para el usuario autenticado',
  })
  @ApiParam({
    name: 'moduleId',
    description: 'ID del módulo en formato UUID',
    type: String,
    required: true,
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ejercicios del módulo obtenida exitosamente',
    type: [ExerciseResponseDto],
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          module_id: '660e8400-e29b-41d4-a716-446655440000',
          title: 'Crucigrama - Infancia de Marie',
          order_index: 0,
          exercise_type: 'crucigrama',
          difficulty_level: 'beginner',
          max_points: 100,
          xp_reward: 50,
          is_active: true,
          completed: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          module_id: '660e8400-e29b-41d4-a716-446655440000',
          title: 'Sopa de Letras - Palabras Clave',
          order_index: 1,
          exercise_type: 'sopa_letras',
          difficulty_level: 'beginner',
          max_points: 80,
          xp_reward: 40,
          is_active: true,
          completed: false,
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Módulo no encontrado',
  })
  async findByModule(@Param('moduleId') moduleId: string, @Request() req: AuthRequest) {
    // Obtener ejercicios del módulo
    const exercises = await this.exercisesService.findByModuleId(moduleId);

    // FIX 2025-11-29: Convert auth.users.id → profiles.id
    const userId = req.user!.id;
    const profileId = await this.getProfileId(userId);

    // Obtener todas las submissions del usuario de una sola vez para eficiencia
    const allSubmissions = await this.exerciseSubmissionService.findByUserId(profileId);

    // Obtener todos los exercise_attempts para ejercicios auto-calificados
    // Los ejercicios como Crucigrama usan exercise_attempts, no exercise_submissions
    const allAttempts = await this.exerciseAttemptService.findByUserId(profileId);

    // Crear un mapa de ejercicios completados (de submissions Y attempts)
    const completedExercisesMap = new Map<string, boolean>();

    // Marcar como completados los ejercicios con submissions calificadas
    allSubmissions.forEach((submission) => {
      if (submission.status === 'graded') {
        completedExercisesMap.set(submission.exercise_id, true);
      }
    });

    // Marcar como completados los ejercicios con intentos correctos (auto-calificados)
    allAttempts.forEach((attempt) => {
      if (attempt.is_correct) {
        completedExercisesMap.set(attempt.exercise_id, true);
      }
    });

    // Agregar campo 'completed' a cada ejercicio
    return exercises.map((exercise) => ({
      ...exercise,
      completed: completedExercisesMap.get(exercise.id) || false,
    }));
  }

  /**
   * Obtiene las pistas de un ejercicio
   *
   * @param id - ID del ejercicio
   * @returns Array de pistas disponibles
   *
   * @example
   * GET /api/v1/educational/exercises/550e8400-e29b-41d4-a716-446655440000/hints
   * Response: [
   *   "La respuesta está en el primer párrafo",
   *   "Marie nació en Varsovia"
   * ]
   */
  @Get('exercises/:id/hints')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get exercise hints',
    description:
      'Obtiene las pistas disponibles para un ejercicio. Solo retorna pistas si están habilitadas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ejercicio en formato UUID',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Pistas obtenidas exitosamente',
    schema: {
      example: {
        hints: ['La respuesta está en el primer párrafo', 'Marie nació en Varsovia'],
        cost_per_hint_ml_coins: 10,
        hints_available: 2,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Las pistas están deshabilitadas para este ejercicio',
    schema: {
      example: {
        statusCode: 400,
        message: 'Hints are disabled for this exercise',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Ejercicio no encontrado',
  })
  async getHints(@Param('id') id: string) {
    const hints = await this.exercisesService.getHints(id);
    const exercise = await this.exercisesService.findById(id);
    return {
      hints,
      cost_per_hint_ml_coins: exercise?.hint_cost_ml_coins || 0,
      hints_available: hints.length,
    };
  }

  /**
   * Valida el contenido JSONB de un ejercicio según su tipo
   *
   * @param body - Objeto con exercise_type y content a validar
   * @returns Resultado de la validación
   *
   * @example
   * POST /api/v1/educational/exercises/validate-content
   * Request: {
   *   "exercise_type": "crucigrama",
   *   "content": {
   *     "grid": [...],
   *     "across_clues": [...],
   *     "down_clues": [...]
   *   }
   * }
   */
  @Post('exercises/validate-content')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate exercise content by type',
    description:
      'Valida que el contenido JSONB sea válido según el tipo de ejercicio (27+ tipos diferentes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Contenido válido',
    schema: {
      example: {
        valid: true,
        message: 'Content is valid for exercise type: crucigrama',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Contenido inválido para el tipo de ejercicio',
    schema: {
      example: {
        statusCode: 400,
        message: 'Crucigrama must have grid, across_clues, and down_clues',
        error: 'Bad Request',
      },
    },
  })
  async validateContentByExerciseType(
  @Body() body: { exercise_type: ExerciseTypeEnum; content: Record<string, unknown> },
  ) {
    this.exercisesService.validateContentByExerciseType(body.exercise_type, body.content);
    return {
      valid: true,
      message: `Content is valid for exercise type: ${body.exercise_type}`,
    };
  }

  /**
   * Envía un ejercicio completo - Frontend-aligned endpoint
   *
   * @param id - ID del ejercicio (UUID)
   * @param body - Datos del envío (userId, submitted_answers, hints_used, time_spent_seconds, comodines_used)
   * @returns Envío creado y procesado con puntaje, XP y ML Coins ganadas
   *
   * @description
   * Este endpoint permite a los estudiantes enviar sus respuestas de ejercicios.
   * Internamente delega al ExerciseSubmissionService del módulo Progress.
   *
   * WORKAROUND TEMPORAL (Issue FE-049):
   * Frontend actualmente envía formato incorrecto en `answers` (objeto de progreso en lugar de respuestas reales).
   * Este endpoint acepta AMBOS formatos hasta que Frontend se refactorice:
   * - Formato antiguo: { userId, submitted_answers, ... }
   * - Formato nuevo (problemático): { answers, startedAt, hintsUsed, powerupsUsed }
   *
   * TODO: Remover workaround cuando Frontend envíe respuestas reales
   *
   * Proceso:
   * 1. Valida que el ejercicio exista
   * 2. Crea un ExerciseAttempt en progress_tracking.exercise_attempts
   * 3. Calcula el puntaje automáticamente
   * 4. Otorga XP y ML Coins según el score
   * 5. Dispara trigger para actualizar user_stats (ejercicios completados, XP, etc.)
   * 6. Retorna el resultado completo del intento
   *
   * @example
   * POST /api/v1/educational/exercises/880e8400-e29b-41d4-a716-446655440000/submit
   * Request: {
   *   "userId": "550e8400-e29b-41d4-a716-446655440000",
   *   "submitted_answers": {
   *     "question_1": "Marie Curie",
   *     "question_2": "1903",
   *     "question_3": "Radiactividad"
   *   },
   *   "time_spent_seconds": 180,
   *   "hints_used": 1,
   *   "comodines_used": ["pistas"]
   * }
   * Response: {
   *   "id": "aa0e8400-e29b-41d4-a716-446655440000",
   *   "user_id": "550e8400-e29b-41d4-a716-446655440000",
   *   "exercise_id": "880e8400-e29b-41d4-a716-446655440000",
   *   "status": "auto_graded",
   *   "final_score": 85,
   *   "submitted_at": "2025-11-11T15:00:00Z",
   *   "graded_at": "2025-11-11T15:00:01Z",
   *   "xp_earned": 170,
   *   "ml_coins_earned": 85,
   *   "user_answers": { ... }
   * }
   */
  /**
   * Enviar respuestas de ejercicio para validación y scoring
   *
   * @description Endpoint para que estudiantes envíen sus respuestas.
   * Valida estructura, calcula score y otorga recompensas.
   *
   * @param exerciseId - UUID del ejercicio
   * @param dto - Respuestas del estudiante
   * @param req - Request object (contiene JWT user)
   * @returns Resultado de validación con score y recompensas
   *
   * @throws NotFoundException si ejercicio no existe
   * @throws BadRequestException si estructura de respuestas es inválida
   *
   * @note FE-061: Implementa validación robusta con ExerciseAnswerValidator
   */
  @UseGuards(JwtAuthGuard)
  @Post('exercises/:id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit exercise answers',
    description:
      'Envía las respuestas de un ejercicio para calificación automática. ' +
      'Valida estructura, calcula score, otorga XP/ML Coins y actualiza estadísticas del usuario. ' +
      'Soporta formato nuevo (recomendado) y formato antiguo (deprecated) para compatibilidad.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ejercicio en formato UUID',
    type: String,
    required: true,
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Respuestas validadas exitosamente',
    type: SubmitExerciseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Estructura de respuestas inválida',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed for exercise type "crucigrama": clues must be an object',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Ejercicio no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Exercise 880e8400-... not found',
        error: 'Not Found',
      },
    },
  })
  async submitExercise(
    @Param('id') exerciseId: string,
      @Body() dto: SubmitExerciseDto,
      @Request() req: AuthRequest,
  ): Promise<SubmitExerciseResponseDto> {
    // ========================================
    // 1. NORMALIZACIÓN
    // ========================================
    const normalized = this.normalizeSubmitData(dto, req);

    // ========================================
    // 2. OBTENER EJERCICIO Y VALIDAR EXISTENCIA
    // ========================================
    const exercise = await this.exercisesService.findById(exerciseId);

    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} not found`);
    }

    // ========================================
    // 3. PRE-SANITIZACIÓN (CORR-010 v5)
    // ========================================
    // CORR-010 FIX: Sanitize tribunal_opiniones at controller level
    // This is defense-in-depth before the validator runs
    if (exercise.exercise_type === 'tribunal_opiniones') {
      const answers = normalized.answers as any;
      console.log('[CORR-010 CONTROLLER] Raw answers received:', {
        hasEvaluations: !!answers?.evaluations,
        evaluationsCount: answers?.evaluations?.length || 0,
        answersKeys: Object.keys(answers || {}),
      });

      if (answers?.evaluations && Array.isArray(answers.evaluations)) {
        answers.evaluations = answers.evaluations.map((e: any, idx: number) => {
          const currentId = e?.statementId;
          const needsFix = !currentId || (typeof currentId === 'string' && currentId.trim() === '');

          if (needsFix) {
            const fallbackId = `stmt-${idx + 1}`;
            console.warn(`[CORR-010 CONTROLLER] Fixing empty statementId at index ${idx}: "${currentId}" -> "${fallbackId}"`);
            return { ...e, statementId: fallbackId };
          }
          return e;
        });

        console.log('[CORR-010 CONTROLLER] Sanitized evaluations:',
          answers.evaluations.map((e: any, i: number) => ({ index: i, statementId: e.statementId }))
        );
      }
    }

    // ========================================
    // 4. VALIDACIÓN PRE-SQL (NUEVA - FE-061)
    // ========================================
    try {
      await ExerciseAnswerValidator.validate(
        exercise.exercise_type,
        normalized.answers,
      );
    } catch (error: any) {
      // Log para debug
      console.error('[VALIDATION ERROR]', {
        exerciseId,
        exerciseType: exercise.exercise_type,
        error: error.message,
      });

      throw error; // Re-throw para que NestJS maneje el 400
    }

    // ========================================
    // 5. CONVERSIÓN USUARIO → PERFIL
    // ========================================
    const profileId = await this.getProfileId(normalized.userId);

    // ========================================
    // 6. MANEJO DE EJERCICIOS MANUALES
    // ========================================
    if (exercise.requires_manual_grading) {
      const submission = await this.exerciseSubmissionService.submitExercise(
        normalized.userId,
        exerciseId,
        normalized.answers,
      );

      // BUG-M3-SUBMIT-001 FIX 2026-01-07: Incluir campos de revisión manual
      // El frontend necesita status, requiresManualReview y message para mostrar
      // el mensaje correcto de "pendiente de revisión" al usuario
      return {
        score: submission.score || 0,
        isPerfect: false,
        rewards: {
          xp: 0,
          mlCoins: 0,
          bonuses: [],
        },
        rankUp: null,
        feedback: 'Submission sent for teacher review',
        // Campos para revisión manual (requeridos por el frontend)
        status: 'submitted' as const,
        requiresManualReview: true,
        message: 'Tu respuesta ha sido enviada para revisión del maestro. Recibirás tus recompensas cuando sea evaluada.',
      };
    }

    // ========================================
    // 7. FLUJO PRINCIPAL: AUTOCORREGIBLES
    // ========================================

    // 6.1. Obtener intentos previos
    const previousAttempts = await this.exerciseAttemptService.findByUserAndExercise(
      profileId,
      exerciseId,
    );
    const attemptNumber = previousAttempts.length + 1;

    // 6.2. Validación y scoring en PostgreSQL
    if (!this.dataSource) {
      throw new Error('DataSource not available. Educational database connection not initialized.');
    }

    const validationResult = await this.dataSource.query(`
      SELECT * FROM educational_content.validate_and_audit(
        $1::UUID,
        $2::UUID,
        $3::JSONB,
        $4::INTEGER
      )
    `, [exerciseId, profileId, JSON.stringify(normalized.answers), attemptNumber]);

    const validationData = validationResult[0];
    const score = validationData.score || 0;
    const isCorrect = score >= (exercise.passing_score || 70);
    const feedback = validationData.feedback || '';

    // 6.3. Anti-farming: XP solo en primer acierto
    const hasCorrectAttemptBefore = previousAttempts.some((attempt: any) => attempt.is_correct);
    const isFirstCorrectAttempt = !hasCorrectAttemptBefore && isCorrect;

    let xpEarned = 0;
    let mlCoinsEarned = 0;

    if (isFirstCorrectAttempt) {
      xpEarned = exercise.xp_reward || 0;
      mlCoinsEarned = exercise.ml_coins_reward || 0;
    }

    // 6.4. Crear attempt (trigger actualiza user_stats)
    await this.exerciseAttemptService.create({
      user_id: profileId,
      exercise_id: exerciseId,
      submitted_answers: normalized.answers,
      is_correct: isCorrect,
      score: score,
      xp_earned: xpEarned,
      ml_coins_earned: mlCoinsEarned,
      time_spent_seconds: normalized.timeSpentSeconds,
      hints_used: normalized.hintsUsed,
      comodines_used: normalized.powerupsUsed,
    });

    // ========================================
    // 7. RESPUESTA
    // ========================================
    return {
      score: score,
      isPerfect: score === 100 && normalized.hintsUsed === 0,
      rewards: {
        xp: xpEarned,
        mlCoins: mlCoinsEarned,
        bonuses: [],
      },
      feedback: feedback,
      isFirstCorrectAttempt: isFirstCorrectAttempt,
      rankUp: null, // TODO: Detectar rank up desde user_stats
    };
  }
}
