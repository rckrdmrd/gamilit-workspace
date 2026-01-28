import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Peer Challenges Module (EXT-009)
import { PeerChallengesModule } from './peer-challenges/peer-challenges.module';

// Entities
import {
  UserStats,
  UserRank,
  Achievement,
  UserAchievement,
  AchievementCategory,
  MLCoinsTransaction,
  Mission,
  MissionTemplate,
  ClassroomMission,
  ComodinesInventory,
  LeaderboardMetadata,
  ActiveBoost,
  InventoryTransaction,
  ShopCategory,
  ShopItem,
  UserPurchase,
  MayaRankEntity,
} from './entities';

// External entities
import { Profile } from '@/modules/auth/entities';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';

// Services
import {
  UserStatsService,
  AchievementsService,
  MLCoinsService,
  RanksService,
  LeaderboardService,
  MissionsService,
  MissionTemplatesService,
  ClassroomMissionsService,
  ComodinesService,
  ShopService,
} from './services';

// Controllers
import {
  UserStatsController,
  AchievementsController,
  MLCoinsController,
  RanksController,
  LeaderboardController,
  MissionsController,
  MissionTemplatesController,
  ClassroomMissionsController,
  ComodinesController,
  ShopController,
} from './controllers';

// Constants

/**
 * GamificationModule
 *
 * @description Módulo de gamificación completo con sistema de rangos Maya,
 * ML Coins, achievements, misiones y power-ups.
 *
 * @features
 * - Sistema de rangos Maya (5 niveles)
 * - Economía virtual (ML Coins)
 * - 30+ Achievements
 * - Misiones diarias/semanales
 * - Power-ups (3 tipos)
 * - Leaderboards (global, school, classroom)
 * - Notificaciones en tiempo real
 *
 * @exports
 * - UserStatsService
 * - AchievementsService
 * - MLCoinsService
 */
@Module({
  imports: [
    // Connection 'gamification' handles schema 'gamification_system'
    TypeOrmModule.forFeature(
      [
        UserStats,
        UserRank,
        Achievement,
        UserAchievement,
        AchievementCategory,
        MLCoinsTransaction,
        Mission,
        MissionTemplate,
        ClassroomMission,
        ComodinesInventory,
        LeaderboardMetadata,
        ActiveBoost,
        InventoryTransaction,
        ShopCategory,
        ShopItem,
        UserPurchase,
        MayaRankEntity,
      ],
      'gamification',
    ),
    // Connection 'auth' for Profile entity (needed by LeaderboardService)
    TypeOrmModule.forFeature([Profile], 'auth'),
    // Connection 'progress' for ExerciseSubmission entity (needed by MissionsService for streak calculation)
    TypeOrmModule.forFeature([ExerciseSubmission], 'progress'),
    // Peer Challenges Module (EXT-009: Matchmaking and Real-time Battles)
    PeerChallengesModule,
  ],
  providers: [
    UserStatsService,
    AchievementsService,
    MLCoinsService,
    RanksService,
    LeaderboardService,
    MissionsService,
    MissionTemplatesService,
    ClassroomMissionsService,
    ComodinesService,
    ShopService,
  ],
  controllers: [
    UserStatsController,
    AchievementsController,
    MLCoinsController,
    RanksController,
    LeaderboardController,
    MissionsController,
    MissionTemplatesController,
    ClassroomMissionsController,
    ComodinesController,
    ShopController,
  ],
  exports: [
    UserStatsService,
    AchievementsService,
    MLCoinsService,
    RanksService,
    LeaderboardService,
    MissionsService,
    MissionTemplatesService,
    ClassroomMissionsService,
    ComodinesService,
    ShopService,
  ],
})
export class GamificationModule {}
