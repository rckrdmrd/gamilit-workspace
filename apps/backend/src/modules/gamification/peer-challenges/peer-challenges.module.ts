import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Entities
import { UserSkillRating } from './entities/user-skill-rating.entity';

// Services
import { SkillRatingService } from './services/skill-rating.service';
import { MatchmakingService } from './services/matchmaking.service';
import { BattleSessionService } from './services/battle-session.service';

// Gateways
import { MatchmakingGateway } from './gateways/matchmaking.gateway';
import { BattleGateway } from './gateways/battle.gateway';

// External modules
import { SocialModule } from '@modules/social/social.module';

/**
 * PeerChallengesModule
 *
 * @description Module for peer-to-peer challenges including matchmaking and real-time battles.
 * Implements Epic EXT-009 features.
 *
 * Features:
 * - Skill-based matchmaking with ELO rating system
 * - Real-time battle sessions via WebSocket
 * - Score tracking and rating updates
 *
 * @see Epic: EXT-009 - Peer Challenges
 * @see docs/03-fase-extensiones/EXT-009-peer-challenges/
 */
@Module({
  imports: [
    // TypeORM for skill rating entity
    TypeOrmModule.forFeature([UserSkillRating], 'social'),

    // JWT for WebSocket authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
        signOptions: {
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
    }),

    // Config for environment variables
    ConfigModule,

    // Social module for peer challenges service
    forwardRef(() => SocialModule),
  ],
  providers: [
    // Services
    SkillRatingService,
    MatchmakingService,
    BattleSessionService,

    // WebSocket Gateways
    MatchmakingGateway,
    BattleGateway,
  ],
  exports: [
    SkillRatingService,
    MatchmakingService,
    BattleSessionService,
    MatchmakingGateway,
    BattleGateway,
  ],
})
export class PeerChallengesModule {}
