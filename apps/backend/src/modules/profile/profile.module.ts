import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../auth/entities/profile.entity';
import * as services from './services';
import * as controllers from './controllers';

/**
 * ProfileModule
 *
 * @description Module for user profile management
 *
 * Responsibilities:
 * - Get user profile information
 * - Update user profile data
 * - Upload and manage user avatars
 *
 * Entities (1):
 * - Profile: User profile with personal info, preferences, and settings
 *
 * Services (1):
 * - ProfileService: CRUD operations for profiles (3 main methods)
 *
 * Controllers (1):
 * - ProfileController: REST API endpoints (3 endpoints)
 *
 * Total: 3 REST API endpoints
 *
 * @route /api/v1/profile
 */
@NestModule({
  imports: [
    // Import Profile entity from auth schema
    TypeOrmModule.forFeature([Profile], 'auth'),
  ],
  providers: [services.ProfileService],
  controllers: [controllers.ProfileController],
  exports: [services.ProfileService],
})
export class ProfileModule {}
