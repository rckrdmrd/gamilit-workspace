import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/auth/entities/user.entity';
import { Tenant } from '@modules/auth/entities/tenant.entity';
import { Membership } from '@modules/auth/entities/membership.entity';
import { AuthAttempt } from '@modules/auth/entities/auth-attempt.entity';
import { Module as EducationalModule } from '@modules/educational/entities/module.entity';
import { Exercise } from '@modules/educational/entities/exercise.entity';
import { ContentTemplate } from '@modules/content/entities/content-template.entity';
import { SystemSetting, FeatureFlag, NotificationSettings } from './entities'; // ✨ NUEVO - P1/P2 (System Configuration)
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminOrganizationsController } from './controllers/admin-organizations.controller';
import { AdminContentController } from './controllers/admin-content.controller';
import { AdminSystemController } from './controllers/admin-system.controller';
import { AdminUsersService } from './services/admin-users.service';
import { AdminOrganizationsService } from './services/admin-organizations.service';
import { AdminContentService } from './services/admin-content.service';
import { AdminSystemService } from './services/admin-system.service';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant, Membership, AuthAttempt, SystemSetting, FeatureFlag, NotificationSettings], 'auth'),
    TypeOrmModule.forFeature([EducationalModule, Exercise], 'educational'),
    TypeOrmModule.forFeature([ContentTemplate], 'content'),
  ],
  controllers: [
    AdminUsersController,
    AdminOrganizationsController,
    AdminContentController,
    AdminSystemController,
  ],
  providers: [
    AdminUsersService,
    AdminOrganizationsService,
    AdminContentService,
    AdminSystemService,
    AdminGuard,
  ],
  exports: [
    AdminUsersService,
    AdminOrganizationsService,
    AdminContentService,
    AdminSystemService,
  ],
})
export class AdminModule {}
