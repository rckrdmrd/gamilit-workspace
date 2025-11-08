import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStats } from '../entities';
import { Profile } from '@/modules/auth/entities';

/**
 * LeaderboardService
 *
 * @description Servicio para generar rankings y leaderboards
 * - Leaderboard global (todos los usuarios)
 * - Leaderboard por escuela
 * - Leaderboard por aula
 *
 * Ordena por:
 * 1. total_xp (primario)
 * 2. level (secundario)
 * 3. exercises_completed (terciario)
 */
@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepo: Repository<UserStats>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
  ) {}

  /**
   * Obtiene el leaderboard global
   *
   * @param limit - Cantidad de usuarios a retornar (default: 100)
   * @param offset - Offset para paginación (default: 0)
   * @param timePeriod - Período de tiempo (all_time, this_week, this_month) - Future feature
   * @returns Array de entries del leaderboard
   */
  async getGlobalLeaderboard(
    limit: number = 100,
    offset: number = 0,
    timePeriod?: string,
  ): Promise<any> {
    // TODO: Implementar filtrado por time period (this_week, this_month, etc.)
    // Por ahora retornamos all_time

    // Query principal: Obtener top users por XP
    const topUsers = await this.userStatsRepo
      .createQueryBuilder('stats')
      .select([
        'stats.user_id',
        'stats.total_xp',
        'stats.level',
        'stats.current_rank',
        'stats.current_streak',
        'stats.achievements_earned',
        'stats.exercises_completed',
      ])
      .orderBy('stats.total_xp', 'DESC')
      .addOrderBy('stats.level', 'DESC')
      .addOrderBy('stats.exercises_completed', 'DESC')
      .limit(limit)
      .offset(offset)
      .getRawMany();

    // Obtener información de perfiles para estos usuarios
    const userIds = topUsers.map((u) => u.stats_user_id);
    const profiles = await this.profileRepo
      .createQueryBuilder('profile')
      .select([
        'profile.user_id',
        'profile.display_name',
        'profile.first_name',
        'profile.last_name',
        'profile.avatar_url',
      ])
      .where('profile.user_id IN (:...userIds)', { userIds })
      .getRawMany();

    // Crear map de perfiles para acceso rápido
    const profileMap = new Map<string, any>();
    profiles.forEach((p) => {
      profileMap.set(p.profile_user_id, p);
    });

    // Construir entries con información completa
    const entries = topUsers.map((user, index) => {
      const profile = profileMap.get(user.stats_user_id);
      const username =
        profile?.profile_display_name ||
        profile?.profile_first_name ||
        'Usuario';

      return {
        rank: offset + index + 1,
        userId: user.stats_user_id,
        username,
        firstName: profile?.profile_first_name || null,
        lastName: profile?.profile_last_name || null,
        avatar: profile?.profile_avatar_url || null,
        totalXP: user.stats_total_xp,
        level: user.stats_level,
        currentRank: user.stats_current_rank,
        streak: user.stats_current_streak,
        achievementCount: user.stats_achievements_earned,
        tasksCompleted: user.stats_exercises_completed,
      };
    });

    // Contar total de usuarios (para paginación)
    const totalEntries = await this.userStatsRepo.count();

    return {
      type: 'global',
      entries,
      totalEntries,
      lastUpdated: new Date().toISOString(),
      timePeriod: timePeriod || 'all_time',
    };
  }

  /**
   * Obtiene el leaderboard de una escuela específica
   *
   * @param schoolId - ID de la escuela (UUID)
   * @param limit - Cantidad de usuarios a retornar
   * @param offset - Offset para paginación
   * @param timePeriod - Período de tiempo (future feature)
   * @returns Leaderboard de la escuela
   */
  async getSchoolLeaderboard(
    schoolId: string,
    limit: number = 100,
    offset: number = 0,
    timePeriod?: string,
  ): Promise<any> {
    // Obtener usuarios de la escuela a través de profiles
    const schoolProfiles = await this.profileRepo
      .createQueryBuilder('profile')
      .select(['profile.user_id'])
      .where('profile.school_id = :schoolId', { schoolId })
      .getRawMany();

    const userIds = schoolProfiles.map((p) => p.profile_user_id);

    if (userIds.length === 0) {
      return {
        type: 'school',
        entries: [],
        totalEntries: 0,
        lastUpdated: new Date().toISOString(),
        timePeriod: timePeriod || 'all_time',
        schoolId,
      };
    }

    // Query para obtener stats de estos usuarios
    const topUsers = await this.userStatsRepo
      .createQueryBuilder('stats')
      .select([
        'stats.user_id',
        'stats.total_xp',
        'stats.level',
        'stats.current_rank',
        'stats.current_streak',
        'stats.achievements_earned',
        'stats.exercises_completed',
      ])
      .where('stats.user_id IN (:...userIds)', { userIds })
      .orderBy('stats.total_xp', 'DESC')
      .addOrderBy('stats.level', 'DESC')
      .addOrderBy('stats.exercises_completed', 'DESC')
      .limit(limit)
      .offset(offset)
      .getRawMany();

    // Obtener perfiles
    const topUserIds = topUsers.map((u) => u.stats_user_id);
    const profiles = await this.profileRepo
      .createQueryBuilder('profile')
      .select([
        'profile.user_id',
        'profile.display_name',
        'profile.first_name',
        'profile.last_name',
        'profile.avatar_url',
      ])
      .where('profile.user_id IN (:...topUserIds)', { topUserIds })
      .getRawMany();

    const profileMap = new Map<string, any>();
    profiles.forEach((p) => {
      profileMap.set(p.profile_user_id, p);
    });

    // Construir entries
    const entries = topUsers.map((user, index) => {
      const profile = profileMap.get(user.stats_user_id);
      const username =
        profile?.profile_display_name ||
        profile?.profile_first_name ||
        'Usuario';

      return {
        rank: offset + index + 1,
        userId: user.stats_user_id,
        username,
        firstName: profile?.profile_first_name || null,
        lastName: profile?.profile_last_name || null,
        avatar: profile?.profile_avatar_url || null,
        totalXP: user.stats_total_xp,
        level: user.stats_level,
        currentRank: user.stats_current_rank,
        streak: user.stats_current_streak,
        achievementCount: user.stats_achievements_earned,
        tasksCompleted: user.stats_exercises_completed,
      };
    });

    return {
      type: 'school',
      entries,
      totalEntries: userIds.length,
      lastUpdated: new Date().toISOString(),
      timePeriod: timePeriod || 'all_time',
      schoolId,
    };
  }

  /**
   * Obtiene el leaderboard de un aula específica
   *
   * @param classroomId - ID del aula (UUID)
   * @param limit - Cantidad de usuarios a retornar
   * @param offset - Offset para paginación
   * @param timePeriod - Período de tiempo (future feature)
   * @returns Leaderboard del aula
   */
  async getClassroomLeaderboard(
    classroomId: string,
    limit: number = 100,
    offset: number = 0,
    timePeriod?: string,
  ): Promise<any> {
    // TODO: Implementar query para obtener miembros del classroom
    // Por ahora, asumimos que hay una relación classroom_members con student_id
    // Esto requiere crear la entity ClassroomMember o hacer query directo

    // Query directo a la tabla classroom_members
    const classroomMembersQuery = `
      SELECT student_id as user_id
      FROM social_features.classroom_members
      WHERE classroom_id = $1
    `;

    const classroomMembers = await this.userStatsRepo.query(
      classroomMembersQuery,
      [classroomId],
    );

    const userIds = classroomMembers.map((m: any) => m.user_id);

    if (userIds.length === 0) {
      return {
        type: 'classroom',
        entries: [],
        totalEntries: 0,
        lastUpdated: new Date().toISOString(),
        timePeriod: timePeriod || 'all_time',
        classroomId,
      };
    }

    // Query para obtener stats de estos usuarios
    const topUsers = await this.userStatsRepo
      .createQueryBuilder('stats')
      .select([
        'stats.user_id',
        'stats.total_xp',
        'stats.level',
        'stats.current_rank',
        'stats.current_streak',
        'stats.achievements_earned',
        'stats.exercises_completed',
      ])
      .where('stats.user_id IN (:...userIds)', { userIds })
      .orderBy('stats.total_xp', 'DESC')
      .addOrderBy('stats.level', 'DESC')
      .addOrderBy('stats.exercises_completed', 'DESC')
      .limit(limit)
      .offset(offset)
      .getRawMany();

    // Obtener perfiles
    const topUserIds = topUsers.map((u) => u.stats_user_id);
    const profiles = await this.profileRepo
      .createQueryBuilder('profile')
      .select([
        'profile.user_id',
        'profile.display_name',
        'profile.first_name',
        'profile.last_name',
        'profile.avatar_url',
      ])
      .where('profile.user_id IN (:...topUserIds)', { topUserIds })
      .getRawMany();

    const profileMap = new Map<string, any>();
    profiles.forEach((p) => {
      profileMap.set(p.profile_user_id, p);
    });

    // Construir entries
    const entries = topUsers.map((user, index) => {
      const profile = profileMap.get(user.stats_user_id);
      const username =
        profile?.profile_display_name ||
        profile?.profile_first_name ||
        'Usuario';

      return {
        rank: offset + index + 1,
        userId: user.stats_user_id,
        username,
        firstName: profile?.profile_first_name || null,
        lastName: profile?.profile_last_name || null,
        avatar: profile?.profile_avatar_url || null,
        totalXP: user.stats_total_xp,
        level: user.stats_level,
        currentRank: user.stats_current_rank,
        streak: user.stats_current_streak,
        achievementCount: user.stats_achievements_earned,
        tasksCompleted: user.stats_exercises_completed,
      };
    });

    return {
      type: 'classroom',
      entries,
      totalEntries: userIds.length,
      lastUpdated: new Date().toISOString(),
      timePeriod: timePeriod || 'all_time',
      classroomId,
    };
  }

  /**
   * Obtiene la posición de un usuario específico en el ranking global
   *
   * @param userId - ID del usuario
   * @returns Posición y datos del usuario
   */
  async getUserPosition(userId: string): Promise<any> {
    const userStats = await this.userStatsRepo.findOne({
      where: { user_id: userId },
    });

    if (!userStats) {
      return null;
    }

    // Contar cuántos usuarios tienen más XP
    const rank = await this.userStatsRepo
      .createQueryBuilder('stats')
      .where('stats.total_xp > :userXp', { userXp: userStats.total_xp })
      .orWhere(
        'stats.total_xp = :userXp AND stats.level > :userLevel',
        { userXp: userStats.total_xp, userLevel: userStats.level },
      )
      .getCount();

    return {
      rank: rank + 1,
      totalXP: userStats.total_xp,
      level: userStats.level,
      currentRank: userStats.current_rank,
    };
  }
}
