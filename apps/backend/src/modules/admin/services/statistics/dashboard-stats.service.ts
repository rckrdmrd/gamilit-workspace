import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';

import { User } from '@modules/auth/entities/user.entity';
import { Tenant } from '@modules/auth/entities/tenant.entity';
import { Module } from '@modules/educational/entities/module.entity';
import { Exercise } from '@modules/educational/entities/exercise.entity';
import { DashboardStatsDto } from '../../dto/dashboard';
import { UserStatsService } from './user-stats.service';
import { ContentStatsService } from './content-stats.service';

/**
 * Service responsible for aggregating dashboard statistics.
 * Coordinates between different stat services to provide a unified dashboard view.
 *
 * Responsibilities:
 * - Aggregate statistics from multiple sources
 * - Calculate system health metrics
 * - Provide overall dashboard statistics
 */
@Injectable()
export class DashboardStatsService {
  constructor(
    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant, 'auth')
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Module, 'educational')
    private readonly moduleRepo: Repository<Module>,
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
    private readonly userStatsService: UserStatsService,
    private readonly contentStatsService: ContentStatsService,
  ) {}

  /**
   * Get complete dashboard statistics.
   * Aggregates data from user stats and content stats services.
   */
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Execute all queries in parallel
    const [
      totalUsers,
      activeUsers24h,
      newUsersToday,
      totalOrganizations,
      totalExercises,
      totalModules,
      exercisesCompleted24h,
    ] = await Promise.all([
      this.userRepo.count(),
      this.userStatsService.getActiveUsers24h(oneDayAgo),
      this.userRepo.count({
        where: {
          created_at: MoreThanOrEqual(todayStart),
        },
      }),
      this.tenantRepo.count(),
      this.exerciseRepo.count(),
      this.moduleRepo.count(),
      this.contentStatsService.getExercisesCompleted24h(oneDayAgo),
    ]);

    // Determine system health based on basic metrics
    const systemHealth = this.determineSystemHealth(activeUsers24h, totalUsers);

    return {
      totalUsers,
      activeUsers: activeUsers24h,
      newUsersToday,
      totalOrganizations,
      totalExercises,
      totalModules,
      exercisesCompleted24h,
      systemHealth,
      avgResponseTime: 125, // TODO: Implement actual response time tracking
    };
  }

  /**
   * Determine system health based on user activity metrics.
   *
   * @param activeUsers - Number of active users in the last 24 hours
   * @param totalUsers - Total number of users in the system
   * @returns System health status
   */
  private determineSystemHealth(
    activeUsers: number,
    totalUsers: number,
  ): 'healthy' | 'warning' | 'critical' {
    if (totalUsers === 0) return 'warning';

    const activeRatio = activeUsers / totalUsers;

    if (activeRatio >= 0.2) return 'healthy';
    if (activeRatio >= 0.05) return 'warning';
    return 'critical';
  }
}
