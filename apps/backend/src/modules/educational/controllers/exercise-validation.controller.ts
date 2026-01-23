import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  ExerciseTypeRubricService,
  ExerciseValidationConfigService,
  ExerciseValidationAuditService,
} from '../services';
import {
  CreateExerciseTypeRubricDto,
  UpdateExerciseTypeRubricDto,
  ExerciseTypeRubricResponseDto,
  UpsertValidationConfigDto,
  ValidationConfigResponseDto,
  QueryValidationAuditDto,
  ValidationAuditResponseDto,
  PaginatedValidationAuditResponseDto,
} from '../dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { API_ROUTES, extractBasePath } from '@/shared/constants';

/**
 * ExerciseValidationController
 *
 * @description Controller para endpoints de validacion de ejercicios M4-M5.
 *              Gestiona rubricas, configuracion de validacion y auditoria.
 *
 * @route /api/v1/educational/validation
 */
@ApiTags('Educational - Validation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(extractBasePath(API_ROUTES.EDUCATIONAL.BASE) + '/validation')
export class ExerciseValidationController {
  constructor(
    private readonly rubricService: ExerciseTypeRubricService,
    private readonly configService: ExerciseValidationConfigService,
    private readonly auditService: ExerciseValidationAuditService,
  ) {}

  // ==========================================
  // EXERCISE TYPE RUBRICS
  // ==========================================

  /**
   * Obtener todas las rubricas por tipo de ejercicio
   */
  @Get('rubrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all exercise type rubrics',
    description: 'Obtiene todas las rubricas estandar por tipo de ejercicio (M3, M4, M5)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de rubricas obtenida exitosamente',
    type: [ExerciseTypeRubricResponseDto],
  })
  async findAllRubrics() {
    return this.rubricService.findAll();
  }

  /**
   * Obtener rubrica por ID
   */
  @Get('rubrics/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get rubric by ID',
    description: 'Obtiene una rubrica especifica por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rubrica (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Rubrica encontrada',
    type: ExerciseTypeRubricResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rubrica no encontrada',
  })
  async findRubricById(@Param('id') id: string) {
    const rubric = await this.rubricService.findById(id);
    if (!rubric) {
      throw new NotFoundException(`Rubric with ID ${id} not found`);
    }
    return rubric;
  }

  /**
   * Obtener rubrica por tipo de ejercicio
   */
  @Get('rubrics/exercise-type/:exerciseType')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get rubric by exercise type',
    description: 'Obtiene la rubrica por defecto para un tipo de ejercicio',
  })
  @ApiParam({
    name: 'exerciseType',
    description: 'Tipo de ejercicio (ej: verificador_fake_news)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Rubrica encontrada',
    type: ExerciseTypeRubricResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rubrica no encontrada para este tipo de ejercicio',
  })
  async findRubricByExerciseType(@Param('exerciseType') exerciseType: string) {
    const rubric = await this.rubricService.findByExerciseType(exerciseType);
    if (!rubric) {
      throw new NotFoundException(
        `No default rubric found for exercise type: ${exerciseType}`,
      );
    }
    return rubric;
  }

  /**
   * Obtener rubricas por codigo de modulo
   */
  @Get('rubrics/module/:moduleCode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get rubrics by module code',
    description: 'Obtiene todas las rubricas de un modulo (M3, M4, M5)',
  })
  @ApiParam({
    name: 'moduleCode',
    description: 'Codigo del modulo (M3, M4, M5)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de rubricas del modulo',
    type: [ExerciseTypeRubricResponseDto],
  })
  async findRubricsByModuleCode(@Param('moduleCode') moduleCode: string) {
    return this.rubricService.findByModuleCode(moduleCode);
  }

  /**
   * Crear nueva rubrica
   */
  @Post('rubrics')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create exercise type rubric [Admin only]',
    description: 'Crea una nueva rubrica para un tipo de ejercicio',
  })
  @ApiResponse({
    status: 201,
    description: 'Rubrica creada exitosamente',
    type: ExerciseTypeRubricResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una rubrica por defecto para este tipo de ejercicio',
  })
  async createRubric(@Body() dto: CreateExerciseTypeRubricDto) {
    return this.rubricService.create(dto);
  }

  /**
   * Actualizar rubrica
   */
  @Put('rubrics/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update exercise type rubric [Admin only]',
    description: 'Actualiza una rubrica existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rubrica (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Rubrica actualizada exitosamente',
    type: ExerciseTypeRubricResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rubrica no encontrada',
  })
  async updateRubric(
    @Param('id') id: string,
    @Body() dto: UpdateExerciseTypeRubricDto,
  ) {
    return this.rubricService.update(id, dto);
  }

  /**
   * Eliminar rubrica
   */
  @Delete('rubrics/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete exercise type rubric [Admin only]',
    description: 'Elimina una rubrica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rubrica (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Rubrica eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Rubrica no encontrada',
  })
  async deleteRubric(@Param('id') id: string) {
    await this.rubricService.delete(id);
  }

  /**
   * Establecer rubrica como default
   */
  @Post('rubrics/:id/set-default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Set rubric as default [Admin only]',
    description: 'Establece una rubrica como la por defecto para su tipo de ejercicio',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la rubrica (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Rubrica establecida como default',
    type: ExerciseTypeRubricResponseDto,
  })
  async setRubricAsDefault(@Param('id') id: string) {
    return this.rubricService.setAsDefault(id);
  }

  // ==========================================
  // VALIDATION CONFIG
  // ==========================================

  /**
   * Obtener todas las configuraciones de validacion
   */
  @Get('configs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all validation configs',
    description: 'Obtiene todas las configuraciones de validacion por tipo de ejercicio',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de configuraciones obtenida exitosamente',
    type: [ValidationConfigResponseDto],
  })
  async findAllConfigs() {
    return this.configService.findAll();
  }

  /**
   * Obtener configuracion por ID
   */
  @Get('configs/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get validation config by ID',
    description: 'Obtiene una configuracion de validacion por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la configuracion (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Configuracion encontrada',
    type: ValidationConfigResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Configuracion no encontrada',
  })
  async findConfigById(@Param('id') id: string) {
    const config = await this.configService.findById(id);
    if (!config) {
      throw new NotFoundException(`Validation config with ID ${id} not found`);
    }
    return config;
  }

  /**
   * Obtener configuracion por tipo de ejercicio
   */
  @Get('configs/exercise-type/:exerciseType')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get validation config by exercise type',
    description: 'Obtiene la configuracion de validacion para un tipo de ejercicio',
  })
  @ApiParam({
    name: 'exerciseType',
    description: 'Tipo de ejercicio (ej: crucigrama)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Configuracion encontrada',
    type: ValidationConfigResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Configuracion no encontrada para este tipo de ejercicio',
  })
  async findConfigByExerciseType(@Param('exerciseType') exerciseType: string) {
    const config = await this.configService.findByExerciseType(exerciseType);
    if (!config) {
      throw new NotFoundException(
        `No validation config found for exercise type: ${exerciseType}`,
      );
    }
    return config;
  }

  /**
   * Crear o actualizar configuracion de validacion (upsert)
   */
  @Post('configs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upsert validation config [Admin only]',
    description: 'Crea o actualiza la configuracion de validacion para un tipo de ejercicio',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuracion creada/actualizada exitosamente',
    type: ValidationConfigResponseDto,
  })
  async upsertConfig(@Body() dto: UpsertValidationConfigDto) {
    return this.configService.upsert(dto);
  }

  /**
   * Eliminar configuracion
   */
  @Delete('configs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete validation config [Admin only]',
    description: 'Elimina una configuracion de validacion',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la configuracion (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Configuracion eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuracion no encontrada',
  })
  async deleteConfig(@Param('id') id: string) {
    await this.configService.delete(id);
  }

  /**
   * Obtener funciones de validacion disponibles
   */
  @Get('configs/functions/available')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get available validation functions',
    description: 'Obtiene la lista de funciones SQL de validacion disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de funciones obtenida',
    type: [String],
  })
  async getAvailableFunctions() {
    return this.configService.getAvailableValidationFunctions();
  }

  // ==========================================
  // VALIDATION AUDIT
  // ==========================================

  /**
   * Consultar registros de auditoria con filtros
   */
  @Get('audit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Query validation audit records',
    description: 'Consulta registros de auditoria con filtros y paginacion',
  })
  @ApiResponse({
    status: 200,
    description: 'Registros de auditoria obtenidos',
    type: PaginatedValidationAuditResponseDto,
  })
  async queryAudit(@Query() query: QueryValidationAuditDto) {
    return this.auditService.findWithFilters(query);
  }

  /**
   * Obtener registro de auditoria por ID
   */
  @Get('audit/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get audit record by ID',
    description: 'Obtiene un registro de auditoria por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de auditoria (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de auditoria encontrado',
    type: ValidationAuditResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
  })
  async findAuditById(@Param('id') id: string) {
    const audit = await this.auditService.findById(id);
    if (!audit) {
      throw new NotFoundException(`Audit record with ID ${id} not found`);
    }
    return audit;
  }

  /**
   * Obtener registros de auditoria por ejercicio
   */
  @Get('audit/exercise/:exerciseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get audit records by exercise',
    description: 'Obtiene todos los registros de auditoria para un ejercicio',
  })
  @ApiParam({
    name: 'exerciseId',
    description: 'ID del ejercicio (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Registros de auditoria obtenidos',
    type: [ValidationAuditResponseDto],
  })
  async findAuditByExercise(@Param('exerciseId') exerciseId: string) {
    return this.auditService.findByExerciseId(exerciseId);
  }

  /**
   * Obtener registros de auditoria por usuario
   */
  @Get('audit/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get audit records by user',
    description: 'Obtiene todos los registros de auditoria para un usuario',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Registros de auditoria obtenidos',
    type: [ValidationAuditResponseDto],
  })
  async findAuditByUser(@Param('userId') userId: string) {
    return this.auditService.findByUserId(userId);
  }

  /**
   * Obtener registros con discrepancias
   */
  @Get('audit/discrepancies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get records with discrepancies',
    description: 'Obtiene registros de auditoria que tienen discrepancias detectadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Registros con discrepancias obtenidos',
    type: [ValidationAuditResponseDto],
  })
  async findWithDiscrepancies(@Query('exerciseId') exerciseId?: string) {
    return this.auditService.findWithDiscrepancies(exerciseId);
  }

  /**
   * Obtener estadisticas de validacion para un ejercicio
   */
  @Get('audit/exercise/:exerciseId/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get exercise validation stats',
    description: 'Obtiene estadisticas de validacion para un ejercicio',
  })
  @ApiParam({
    name: 'exerciseId',
    description: 'ID del ejercicio (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estadisticas obtenidas',
    schema: {
      example: {
        totalAttempts: 150,
        uniqueUsers: 42,
        avgScore: 78.5,
        passRate: 85.3,
        avgTimeMs: 250,
        discrepancyCount: 3,
      },
    },
  })
  async getExerciseStats(@Param('exerciseId') exerciseId: string) {
    return this.auditService.getExerciseStats(exerciseId);
  }

  /**
   * Marcar discrepancia en un registro
   */
  @Post('audit/:id/discrepancy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark discrepancy [Admin only]',
    description: 'Marca una discrepancia en un registro de auditoria',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de auditoria (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Discrepancia marcada exitosamente',
    type: ValidationAuditResponseDto,
  })
  async markDiscrepancy(
    @Param('id') id: string,
    @Body() body: { type: string; notes?: string },
  ) {
    return this.auditService.markDiscrepancy(id, body.type, body.notes);
  }
}
