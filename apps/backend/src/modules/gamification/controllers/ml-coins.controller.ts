import { Controller, Get, Post, Param, Body, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MLCoinsService, RankMultiplierService } from '../services';
import { API_ROUTES, extractBasePath } from '@/shared/constants';
import { TransactionTypeEnum } from '@/shared/constants/enums.constants';
import { JwtAuthGuard } from '@/modules/auth/guards';

/**
 * MLCoinsController
 *
 * @description Gestión de la economía virtual del sistema (ML Coins).
 * Endpoints para consultar balance, agregar/gastar coins, y ver historial de transacciones.
 *
 * @route /api/v1/gamification/users/:userId/ml-coins*
 */
@ApiTags('Gamification - ML Coins')
@Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MLCoinsController {
  constructor(
    private readonly mlCoinsService: MLCoinsService,
    private readonly rankMultiplierService: RankMultiplierService,
  ) {}

  /**
   * Obtiene el balance actual de ML Coins del usuario
   *
   * @param userId - ID del usuario (UUID)
   * @returns Objeto con balance actual y estadísticas de coins
   *
   * @example
   * GET /api/v1/gamification/users/550e8400-e29b-41d4-a716-446655440000/ml-coins
   * Response: {
   *   "current_balance": 500,
   *   "total_earned": 1000,
   *   "total_spent": 500,
   *   "earned_today": 150
   * }
   */
  @Get('users/:userId/ml-coins')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get ML Coins balance',
    description: 'Obtiene el balance actual y estadísticas de ML Coins de un usuario',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario en formato UUID',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance de ML Coins obtenido exitosamente',
    schema: {
      example: {
        current_balance: 500,
        total_earned: 1000,
        total_spent: 500,
        earned_today: 150,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getMLCoinsBalance(@Param('userId') userId: string) {
    return this.mlCoinsService.getCoinsStats(userId);
  }

  /**
   * Obtiene el historial de transacciones de ML Coins del usuario
   *
   * @param userId - ID del usuario (UUID)
   * @param limit - Número máximo de transacciones a retornar (default: 50)
   * @param offset - Número de transacciones a saltar para paginación (default: 0)
   * @returns Array de transacciones ordenadas por fecha descendente
   *
   * @example
   * GET /api/v1/gamification/users/550e8400-e29b-41d4-a716-446655440000/ml-coins/transactions?limit=20&offset=0
   * Response: [
   *   {
   *     "id": "660e8400-e29b-41d4-a716-446655440000",
   *     "user_id": "550e8400-e29b-41d4-a716-446655440000",
   *     "amount": 50,
   *     "balance_before": 450,
   *     "balance_after": 500,
   *     "transaction_type": "EARNED_EXERCISE",
   *     "description": "Completaste el ejercicio de comprensión lectora",
   *     "created_at": "2024-01-15T10:30:00Z"
   *   },
   *   ...
   * ]
   */
  @Get('users/:userId/ml-coins/transactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get ML Coins transactions',
    description: 'Obtiene el historial de transacciones de ML Coins de un usuario con paginación',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario en formato UUID',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de transacciones a retornar',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Número de transacciones a saltar para paginación',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Transacciones obtenidas exitosamente',
    schema: {
      example: [
        {
          id: '660e8400-e29b-41d4-a716-446655440000',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 50,
          balance_before: 450,
          balance_after: 500,
          transaction_type: 'EARNED_EXERCISE',
          description: 'Completaste el ejercicio de comprensión lectora',
          reference_type: 'exercise',
          reference_id: '770e8400-e29b-41d4-a716-446655440000',
          created_at: '2024-01-15T10:30:00Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getMLCoinsTransactions(
  @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    return this.mlCoinsService.getTransactions(userId, limitNum, offsetNum);
  }

  /**
   * Agrega ML Coins al balance del usuario
   *
   * @param userId - ID del usuario (UUID)
   * @param body - Objeto con monto y detalles de la transacción
   * @returns Nuevo balance y detalles de la transacción registrada
   *
   * @example
   * POST /api/v1/gamification/users/550e8400-e29b-41d4-a716-446655440000/ml-coins/add
   * Request: {
   *   "amount": 50,
   *   "transaction_type": "EARNED_EXERCISE",
   *   "description": "Completaste el ejercicio de comprensión lectora",
   *   "reference_id": "770e8400-e29b-41d4-a716-446655440000",
   *   "reference_type": "exercise",
   *   "multiplier": 1.5
   * }
   * Response: {
   *   "balance": 500,
   *   "transaction": {
   *     "id": "660e8400-e29b-41d4-a716-446655440000",
   *     "user_id": "550e8400-e29b-41d4-a716-446655440000",
   *     "amount": 75,
   *     "balance_before": 425,
   *     "balance_after": 500,
   *     "transaction_type": "EARNED_EXERCISE",
   *     "multiplier": 1.5,
   *     "created_at": "2024-01-15T10:30:00Z"
   *   }
   * }
   */
  @Post('users/:userId/ml-coins/add')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add ML Coins',
    description: 'Agrega ML Coins al balance de un usuario y registra la transacción',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario en formato UUID',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'ML Coins agregados exitosamente',
    schema: {
      example: {
        balance: 500,
        transaction: {
          id: '660e8400-e29b-41d4-a716-446655440000',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 75,
          balance_before: 425,
          balance_after: 500,
          transaction_type: 'EARNED_EXERCISE',
          description: 'Completaste el ejercicio de comprensión lectora',
          multiplier: 1.5,
          created_at: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o monto debe ser mayor a 0',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async addMLCoins(
  @Param('userId') userId: string,
    @Body()
    body: {
      amount: number;
      transaction_type: TransactionTypeEnum;
      description?: string;
      reference_id?: string;
      reference_type?: string;
      multiplier?: number;
    },
  ) {
    return this.mlCoinsService.addCoins(
      userId,
      body.amount,
      body.transaction_type,
      body.description,
      body.reference_id,
      body.reference_type,
      body.multiplier,
    );
  }

  /**
   * Gasta ML Coins del balance del usuario
   *
   * @param userId - ID del usuario (UUID)
   * @param body - Objeto con monto y detalles de la transacción
   * @returns Nuevo balance y detalles de la transacción registrada
   *
   * @example
   * POST /api/v1/gamification/users/550e8400-e29b-41d4-a716-446655440000/ml-coins/spend
   * Request: {
   *   "amount": 50,
   *   "transaction_type": "SPENT_POWERUP",
   *   "description": "Compraste un power-up de ayuda",
   *   "reference_id": "880e8400-e29b-41d4-a716-446655440000",
   *   "reference_type": "powerup"
   * }
   * Response: {
   *   "balance": 450,
   *   "transaction": {
   *     "id": "660e8400-e29b-41d4-a716-446655440001",
   *     "user_id": "550e8400-e29b-41d4-a716-446655440000",
   *     "amount": -50,
   *     "balance_before": 500,
   *     "balance_after": 450,
   *     "transaction_type": "SPENT_POWERUP",
   *     "created_at": "2024-01-15T10:35:00Z"
   *   }
   * }
   */
  @Post('users/:userId/ml-coins/spend')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Spend ML Coins',
    description: 'Gasta ML Coins del balance de un usuario con validación de saldo suficiente',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario en formato UUID',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'ML Coins gastados exitosamente',
    schema: {
      example: {
        balance: 450,
        transaction: {
          id: '660e8400-e29b-41d4-a716-446655440001',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: -50,
          balance_before: 500,
          balance_after: 450,
          transaction_type: 'SPENT_POWERUP',
          description: 'Compraste un power-up de ayuda',
          created_at: '2024-01-15T10:35:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, monto debe ser mayor a 0, o saldo insuficiente',
    schema: {
      example: {
        statusCode: 400,
        message: 'Insufficient balance. Required: 1000, Available: 450',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async spendMLCoins(
  @Param('userId') userId: string,
    @Body()
    body: {
      amount: number;
      transaction_type: TransactionTypeEnum;
      description?: string;
      reference_id?: string;
      reference_type?: string;
    },
  ) {
    return this.mlCoinsService.spendCoins(
      userId,
      body.amount,
      body.transaction_type,
      body.description,
      body.reference_id,
      body.reference_type,
    );
  }

  // =========================================================================
  // RANK MULTIPLIER ENDPOINTS (US-GAM-011)
  // =========================================================================

  /**
   * Obtiene la información del multiplicador de ML Coins basado en el rango del usuario
   *
   * @param userId - ID del usuario (UUID)
   * @returns Información del multiplicador actual y progreso hacia el siguiente
   *
   * @example
   * GET /api/v1/gamification/users/550e8400-e29b-41d4-a716-446655440000/ml-coins/multiplier
   * Response: {
   *   "userId": "550e8400-e29b-41d4-a716-446655440000",
   *   "rankLevel": 3,
   *   "rankName": "Ah K'in",
   *   "multiplier": 1.5,
   *   "bonusPercentage": 50,
   *   "xpToNextRank": 250,
   *   "nextRankMultiplier": 1.75,
   *   "nextRankBonusPercentage": 75,
   *   "isMaxRank": false
   * }
   */
  @Get('users/:userId/ml-coins/multiplier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get ML Coins rank multiplier info',
    description: 'Obtiene información del multiplicador de ML Coins basado en el rango maya del usuario. ' +
                 'Los multiplicadores van desde 1.0x (Ajaw) hasta 2.0x (K\'uk\'ulkan).',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario en formato UUID',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del multiplicador obtenida exitosamente',
    schema: {
      example: {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        rankLevel: 3,
        rankName: "Ah K'in",
        multiplier: 1.5,
        bonusPercentage: 50,
        xpToNextRank: 250,
        nextRankMultiplier: 1.75,
        nextRankBonusPercentage: 75,
        isMaxRank: false,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getMultiplierInfo(@Param('userId') userId: string) {
    return this.rankMultiplierService.getUserRankWithMultiplier(userId);
  }

  /**
   * Obtiene la tabla completa de multiplicadores por rango
   *
   * @returns Array con todos los rangos y sus multiplicadores
   *
   * @example
   * GET /api/v1/gamification/ml-coins/multiplier-table
   * Response: [
   *   { "level": 1, "name": "Ajaw", "description": "...", "multiplier": 1.0, "bonusPercentage": 0 },
   *   { "level": 2, "name": "Nacom", "description": "...", "multiplier": 1.25, "bonusPercentage": 25 },
   *   { "level": 3, "name": "Ah K'in", "description": "...", "multiplier": 1.5, "bonusPercentage": 50 },
   *   { "level": 4, "name": "Halach Uinic", "description": "...", "multiplier": 1.75, "bonusPercentage": 75 },
   *   { "level": 5, "name": "K'uk'ulkan", "description": "...", "multiplier": 2.0, "bonusPercentage": 100 }
   * ]
   */
  @Get('ml-coins/multiplier-table')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get ML Coins multiplier table',
    description: 'Obtiene la tabla completa de multiplicadores de ML Coins por rango maya. ' +
                 'Útil para mostrar al usuario la progresión de bonificaciones disponibles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tabla de multiplicadores obtenida exitosamente',
    schema: {
      example: [
        { level: 1, name: 'Ajaw', description: 'Señor - Inicio del camino del conocimiento', multiplier: 1.0, bonusPercentage: 0 },
        { level: 2, name: 'Nacom', description: 'Capitán de Guerra - Guerrero en entrenamiento', multiplier: 1.25, bonusPercentage: 25 },
        { level: 3, name: "Ah K'in", description: 'Sacerdote del Sol - Guía del conocimiento', multiplier: 1.5, bonusPercentage: 50 },
        { level: 4, name: 'Halach Uinic', description: 'Hombre Verdadero - Líder de la comunidad', multiplier: 1.75, bonusPercentage: 75 },
        { level: 5, name: "K'uk'ulkan", description: 'Serpiente Emplumada - Maestro legendario', multiplier: 2.0, bonusPercentage: 100 },
      ],
    },
  })
  async getMultiplierTable() {
    return this.rankMultiplierService.getRankMultiplierTable();
  }

  /**
   * Calcula los ML Coins que recibiría un usuario con su multiplicador actual
   *
   * @param userId - ID del usuario (UUID)
   * @param baseAmount - Cantidad base de ML Coins
   * @returns Información detallada del cálculo con multiplicador
   *
   * @example
   * GET /api/v1/gamification/users/550e8400-e29b-41d4-a716-446655440000/ml-coins/calculate?baseAmount=100
   * Response: {
   *   "rankLevel": 3,
   *   "rankName": "Ah K'in",
   *   "multiplier": 1.5,
   *   "baseCoins": 100,
   *   "finalCoins": 150,
   *   "bonusCoins": 50,
   *   "bonusPercentage": 50
   * }
   */
  @Get('users/:userId/ml-coins/calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate ML Coins with multiplier',
    description: 'Calcula cuántos ML Coins recibiría un usuario aplicando su multiplicador de rango actual. ' +
                 'Útil para previsualizar recompensas antes de otorgarlas.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario en formato UUID',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'baseAmount',
    required: true,
    type: Number,
    description: 'Cantidad base de ML Coins antes del multiplicador',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Cálculo realizado exitosamente',
    schema: {
      example: {
        rankLevel: 3,
        rankName: "Ah K'in",
        multiplier: 1.5,
        baseCoins: 100,
        finalCoins: 150,
        bonusCoins: 50,
        bonusPercentage: 50,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'baseAmount inválido o faltante',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async calculateWithMultiplier(
    @Param('userId') userId: string,
    @Query('baseAmount') baseAmount: string,
  ) {
    const amount = parseInt(baseAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      return { error: 'baseAmount must be a positive number' };
    }
    return this.rankMultiplierService.calculateCoinsWithMultiplier(userId, amount);
  }

  /**
   * Agrega ML Coins usando automáticamente el multiplicador de rango del usuario
   *
   * @param userId - ID del usuario (UUID)
   * @param body - Objeto con monto base y detalles de la transacción
   * @returns Nuevo balance, transacción creada, y multiplicador aplicado
   *
   * @example
   * POST /api/v1/gamification/users/550e8400-e29b-41d4-a716-446655440000/ml-coins/add-with-multiplier
   * Request: {
   *   "amount": 100,
   *   "transaction_type": "EARNED_EXERCISE",
   *   "description": "Completaste el ejercicio de comprensión lectora"
   * }
   * Response: {
   *   "balance": 650,
   *   "transaction": { ... },
   *   "multiplierApplied": 1.5
   * }
   */
  @Post('users/:userId/ml-coins/add-with-multiplier')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add ML Coins with rank multiplier',
    description: 'Agrega ML Coins aplicando automáticamente el multiplicador basado en el rango maya del usuario. ' +
                 'El multiplicador va desde 1.0x (Ajaw) hasta 2.0x (K\'uk\'ulkan).',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario en formato UUID',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'ML Coins agregados exitosamente con multiplicador',
    schema: {
      example: {
        balance: 650,
        transaction: {
          id: '660e8400-e29b-41d4-a716-446655440000',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 150,
          balance_before: 500,
          balance_after: 650,
          transaction_type: 'EARNED_EXERCISE',
          description: 'Completaste el ejercicio de comprensión lectora',
          multiplier: 1.5,
          created_at: '2024-01-15T10:30:00Z',
        },
        multiplierApplied: 1.5,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o monto debe ser mayor a 0',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async addMLCoinsWithMultiplier(
    @Param('userId') userId: string,
    @Body()
    body: {
      amount: number;
      transaction_type: TransactionTypeEnum;
      description?: string;
      reference_id?: string;
      reference_type?: string;
    },
  ) {
    return this.mlCoinsService.addCoinsWithRankMultiplier(
      userId,
      body.amount,
      body.transaction_type,
      body.description,
      body.reference_id,
      body.reference_type,
    );
  }
}
