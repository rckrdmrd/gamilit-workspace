import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFollow } from '../entities';

/**
 * UserFollowsService
 *
 * @description Gestión de relaciones de seguimiento entre usuarios.
 * Implementa el patrón follower/following similar a redes sociales.
 *
 * @features
 * - Follow/Unfollow usuarios
 * - Listar seguidores y seguidos
 * - Conteo de seguidores/seguidos
 * - Verificación de estado de seguimiento
 * - Prevención de auto-seguimiento y duplicados
 */
@Injectable()
export class UserFollowsService {
  constructor(
    @InjectRepository(UserFollow, 'social')
    private readonly userFollowRepo: Repository<UserFollow>,
  ) {}

  /**
   * Sigue a un usuario
   * @param followerId - ID del usuario que sigue
   * @param followingId - ID del usuario a seguir
   * @returns Registro de seguimiento creado
   * @throws BadRequestException si intenta seguirse a sí mismo
   * @throws ConflictException si ya sigue al usuario
   */
  async follow(followerId: string, followingId: string): Promise<UserFollow> {
    // Validar que no sea auto-seguimiento
    if (followerId === followingId) {
      throw new BadRequestException('No puedes seguirte a ti mismo');
    }

    // Verificar si ya existe el seguimiento
    const existingFollow = await this.userFollowRepo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (existingFollow) {
      throw new ConflictException('Ya sigues a este usuario');
    }

    // Crear el seguimiento
    const follow = this.userFollowRepo.create({
      follower_id: followerId,
      following_id: followingId,
    });

    return this.userFollowRepo.save(follow);
  }

  /**
   * Deja de seguir a un usuario
   * @param followerId - ID del usuario que deja de seguir
   * @param followingId - ID del usuario a dejar de seguir
   * @throws NotFoundException si no existe el seguimiento
   */
  async unfollow(followerId: string, followingId: string): Promise<void> {
    const follow = await this.userFollowRepo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (!follow) {
      throw new NotFoundException('No sigues a este usuario');
    }

    await this.userFollowRepo.remove(follow);
  }

  /**
   * Obtiene los seguidores de un usuario
   * @param userId - ID del usuario
   * @returns Lista de registros de seguimiento (seguidores)
   */
  async getFollowers(userId: string): Promise<UserFollow[]> {
    return this.userFollowRepo.find({
      where: { following_id: userId },
      order: { followed_at: 'DESC' },
    });
  }

  /**
   * Obtiene los usuarios que sigue un usuario
   * @param userId - ID del usuario
   * @returns Lista de registros de seguimiento (seguidos)
   */
  async getFollowing(userId: string): Promise<UserFollow[]> {
    return this.userFollowRepo.find({
      where: { follower_id: userId },
      order: { followed_at: 'DESC' },
    });
  }

  /**
   * Verifica si un usuario sigue a otro
   * @param followerId - ID del posible seguidor
   * @param followingId - ID del posible seguido
   * @returns true si existe el seguimiento
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.userFollowRepo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    return !!follow;
  }

  /**
   * Obtiene el conteo de seguidores de un usuario
   * @param userId - ID del usuario
   * @returns Número de seguidores
   */
  async getFollowersCount(userId: string): Promise<number> {
    return this.userFollowRepo.count({
      where: { following_id: userId },
    });
  }

  /**
   * Obtiene el conteo de usuarios que sigue
   * @param userId - ID del usuario
   * @returns Número de usuarios seguidos
   */
  async getFollowingCount(userId: string): Promise<number> {
    return this.userFollowRepo.count({
      where: { follower_id: userId },
    });
  }

  /**
   * Obtiene conteos de seguidores y seguidos
   * @param userId - ID del usuario
   * @returns Objeto con followers_count y following_count
   */
  async getCounts(
    userId: string,
  ): Promise<{ followers_count: number; following_count: number }> {
    const [followers_count, following_count] = await Promise.all([
      this.getFollowersCount(userId),
      this.getFollowingCount(userId),
    ]);

    return { followers_count, following_count };
  }

  /**
   * Obtiene seguidores mutuos (ambos se siguen)
   * @param userId - ID del usuario
   * @returns Lista de IDs de usuarios con seguimiento mutuo
   */
  async getMutualFollows(userId: string): Promise<string[]> {
    const [followers, following] = await Promise.all([
      this.getFollowers(userId),
      this.getFollowing(userId),
    ]);

    const followerIds = new Set(followers.map((f) => f.follower_id));
    const followingIds = following.map((f) => f.following_id);

    return followingIds.filter((id) => followerIds.has(id));
  }
}
