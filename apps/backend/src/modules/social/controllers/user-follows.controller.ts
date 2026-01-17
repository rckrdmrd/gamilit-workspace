import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserFollowsService } from '../services';
import {
  CreateUserFollowDto,
  UserFollowResponseDto,
  UserFollowCountsDto,
} from '../dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

/**
 * UserFollowsController
 *
 * @description Gestión de relaciones de seguimiento entre usuarios.
 * Endpoints para follow/unfollow, listar seguidores/seguidos, y estadísticas.
 *
 * @route /api/v1/social/follows
 * @security JWT Bearer token required
 */
@ApiTags('Social - User Follows')
@Controller('api/v1/social/follows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserFollowsController {
  constructor(private readonly userFollowsService: UserFollowsService) {}

  /**
   * Seguir a un usuario
   *
   * @param followerId - ID del usuario que sigue (desde JWT)
   * @param dto - DTO con ID del usuario a seguir
   * @returns Registro de seguimiento creado
   *
   * @example
   * POST /api/v1/social/follows/users/550e8400.../follow
   */
  @Post('users/:followerId/follow')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Follow a user',
    description: 'Crea un nuevo seguimiento hacia otro usuario',
  })
  @ApiParam({
    name: 'followerId',
    description: 'ID del usuario que sigue (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Seguimiento creado exitosamente',
    type: UserFollowResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No puedes seguirte a ti mismo',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya sigues a este usuario',
  })
  async follow(
    @Param('followerId') followerId: string,
    @Body() dto: CreateUserFollowDto,
  ) {
    return this.userFollowsService.follow(followerId, dto.following_id);
  }

  /**
   * Dejar de seguir a un usuario
   *
   * @param followerId - ID del usuario que deja de seguir
   * @param followingId - ID del usuario a dejar de seguir
   *
   * @example
   * DELETE /api/v1/social/follows/users/550e8400.../unfollow/660e8400...
   */
  @Delete('users/:followerId/unfollow/:followingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Unfollow a user',
    description: 'Elimina un seguimiento existente',
  })
  @ApiParam({
    name: 'followerId',
    description: 'ID del usuario que deja de seguir (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'followingId',
    description: 'ID del usuario a dejar de seguir (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Seguimiento eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No sigues a este usuario',
  })
  async unfollow(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.userFollowsService.unfollow(followerId, followingId);
  }

  /**
   * Obtener seguidores de un usuario
   *
   * @param userId - ID del usuario
   * @returns Lista de seguidores
   *
   * @example
   * GET /api/v1/social/follows/users/550e8400.../followers
   */
  @Get('users/:userId/followers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user followers',
    description: 'Obtiene la lista de usuarios que siguen al usuario especificado',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de seguidores obtenida exitosamente',
    type: [UserFollowResponseDto],
  })
  async getFollowers(@Param('userId') userId: string) {
    return this.userFollowsService.getFollowers(userId);
  }

  /**
   * Obtener usuarios que sigue un usuario
   *
   * @param userId - ID del usuario
   * @returns Lista de usuarios seguidos
   *
   * @example
   * GET /api/v1/social/follows/users/550e8400.../following
   */
  @Get('users/:userId/following')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user following',
    description: 'Obtiene la lista de usuarios que el usuario especificado sigue',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de seguidos obtenida exitosamente',
    type: [UserFollowResponseDto],
  })
  async getFollowing(@Param('userId') userId: string) {
    return this.userFollowsService.getFollowing(userId);
  }

  /**
   * Verificar si un usuario sigue a otro
   *
   * @param followerId - ID del posible seguidor
   * @param followingId - ID del posible seguido
   * @returns { isFollowing: boolean }
   *
   * @example
   * GET /api/v1/social/follows/users/550e8400.../is-following/660e8400...
   */
  @Get('users/:followerId/is-following/:followingId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if following',
    description: 'Verifica si un usuario sigue a otro',
  })
  @ApiParam({
    name: 'followerId',
    description: 'ID del posible seguidor (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'followingId',
    description: 'ID del posible seguido (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de seguimiento verificado',
    schema: {
      example: { isFollowing: true },
    },
  })
  async isFollowing(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    const isFollowing = await this.userFollowsService.isFollowing(
      followerId,
      followingId,
    );
    return { isFollowing };
  }

  /**
   * Obtener conteos de seguidores y seguidos
   *
   * @param userId - ID del usuario
   * @returns Conteos de seguidores y seguidos
   *
   * @example
   * GET /api/v1/social/follows/users/550e8400.../counts
   */
  @Get('users/:userId/counts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get follow counts',
    description: 'Obtiene el conteo de seguidores y seguidos de un usuario',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Conteos obtenidos exitosamente',
    type: UserFollowCountsDto,
  })
  async getCounts(@Param('userId') userId: string) {
    const counts = await this.userFollowsService.getCounts(userId);
    return {
      user_id: userId,
      ...counts,
    };
  }

  /**
   * Obtener seguidores mutuos
   *
   * @param userId - ID del usuario
   * @returns Lista de IDs de usuarios con seguimiento mutuo
   *
   * @example
   * GET /api/v1/social/follows/users/550e8400.../mutual
   */
  @Get('users/:userId/mutual')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get mutual follows',
    description: 'Obtiene la lista de usuarios con seguimiento mutuo (ambos se siguen)',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de seguidores mutuos obtenida exitosamente',
    schema: {
      example: {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        mutual_follows: ['660e8400...', '770e8400...'],
        count: 2,
      },
    },
  })
  async getMutualFollows(@Param('userId') userId: string) {
    const mutualFollows = await this.userFollowsService.getMutualFollows(userId);
    return {
      user_id: userId,
      mutual_follows: mutualFollows,
      count: mutualFollows.length,
    };
  }
}
