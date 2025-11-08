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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ExercisesService } from '../services';
import { CreateExerciseDto, ExerciseResponseDto } from '../dto';
import { API_ROUTES, extractBasePath } from '@/shared/constants';
import { ExerciseTypeEnum } from '@/shared/constants/enums.constants';

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
  constructor(private readonly exercisesService: ExercisesService) {}

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
  @Get('exercises')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all exercises',
    description: 'Obtiene todos los ejercicios ordenados por módulo e índice de secuencia',
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
  async findAll() {
    return await this.exercisesService.findAll();
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
  @Get('exercises/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get exercise by ID',
    description: 'Obtiene un ejercicio específico por su ID',
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
  async findOne(@Param('id') id: string) {
    return await this.exercisesService.findById(id);
  }

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
    return await this.exercisesService.create(createExerciseDto);
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
    return await this.exercisesService.update(id, updateExerciseDto);
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
   * @returns Array de ejercicios del módulo ordenados por índice
   *
   * @example
   * GET /api/v1/educational/modules/660e8400-e29b-41d4-a716-446655440000/exercises
   * Response: [
   *   {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "title": "Crucigrama - Infancia de Marie",
   *     "order_index": 0,
   *     "exercise_type": "crucigrama"
   *   }
   * ]
   */
  @Get('modules/:moduleId/exercises')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get exercises by module',
    description: 'Obtiene todos los ejercicios de un módulo específico ordenados por índice',
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
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Módulo no encontrado',
  })
  async findByModule(@Param('moduleId') moduleId: string) {
    return await this.exercisesService.findByModuleId(moduleId);
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
    @Body() body: { exercise_type: ExerciseTypeEnum; content: Record<string, any> },
  ) {
    this.exercisesService.validateContentByExerciseType(body.exercise_type, body.content);
    return {
      valid: true,
      message: `Content is valid for exercise type: ${body.exercise_type}`,
    };
  }
}
