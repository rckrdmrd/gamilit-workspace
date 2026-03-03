import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BoostService } from '../services/boost.service';
import { ActiveBoost } from '../entities/active-boost.entity';
import { JwtAuthGuard } from '@/modules/auth/guards';

/**
 * BoostController
 *
 * @description REST controller for querying active boosts.
 *
 * Endpoints:
 * - GET /boosts/:userId/active - Get active boosts for a user
 *
 * @route /api/v1/gamification/boosts*
 * @security JWT Bearer Token
 */
@ApiTags('Gamification - Boosts')
@Controller('gamification/boosts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BoostController {
  constructor(private readonly boostService: BoostService) {}

  /**
   * Obtiene los boosts activos de un usuario
   *
   * @description Retorna todos los boosts activos (no expirados) para el usuario.
   * Los boosts expirados son desactivados automaticamente antes de retornar.
   *
   * @param userId - ID del usuario (UUID)
   * @returns Array de boosts activos
   *
   * @example
   * GET /api/v1/gamification/boosts/550e8400-e29b-41d4-a716-446655440000/active
   * Authorization: Bearer <token>
   *
   * Response 200:
   * [
   *   {
   *     "id": "770e8400-e29b-41d4-a716-446655440000",
   *     "user_id": "550e8400-e29b-41d4-a716-446655440000",
   *     "boost_type": "XP",
   *     "multiplier": "2.00",
   *     "source": "ITEM:880e8400-...",
   *     "activated_at": "2026-03-03T10:00:00Z",
   *     "expires_at": "2026-03-04T10:00:00Z",
   *     "is_active": true
   *   }
   * ]
   */
  @Get(':userId/active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active boosts for user',
    description: 'Returns all active (non-expired) boosts for a user',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active boosts retrieved successfully',
    type: [ActiveBoost],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
  })
  async getActiveBoosts(@Param('userId') userId: string): Promise<ActiveBoost[]> {
    return this.boostService.getActiveBoosts(userId);
  }
}
