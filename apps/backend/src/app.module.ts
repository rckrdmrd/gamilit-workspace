import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';

// Configurations
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import envConfig from './config/env.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { EducationalModule } from './modules/educational/educational.module';
import { ProgressModule } from './modules/progress/progress.module';
import { SocialModule } from './modules/social/social.module';
import { ContentModule } from './modules/content/content.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { AdminModule } from './modules/admin/admin.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AuditModule } from './modules/audit/audit.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { HealthModule } from './modules/health/health.module';
import { ParentsModule } from './modules/parents/parents.module';

// Shared
import { RlsInterceptor } from './shared/interceptors/rls.interceptor';
import { AuditInterceptor } from './modules/audit/interceptors/audit.interceptor';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, envConfig],
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Global cache configuration
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // Default TTL: 60 seconds (in milliseconds)
      max: 100, // Maximum number of items in cache
      // For production with Redis:
      // store: redisStore,
      // host: process.env.REDIS_HOST || 'localhost',
      // port: parseInt(process.env.REDIS_PORT || '6379', 10),
    }),

    // Schedule module for cron jobs (cleanup, reports, etc.)
    ScheduleModule.forRoot(),

    // Database connection for 'auth_management' schema
    TypeOrmModule.forRootAsync({
      name: 'auth',  // Connection name for @InjectRepository(Entity, 'auth')
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/modules/auth/entities/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'educational_content' schema
    // CORRECTED (2025-12-18): Agregado path de assignments y teacher entities
    TypeOrmModule.forRootAsync({
      name: 'educational',  // Connection name for @InjectRepository(Entity, 'educational')
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/educational/entities/**/*.entity{.ts,.js}',
          __dirname + '/modules/assignments/entities/**/*.entity{.ts,.js}',
          __dirname + '/modules/teacher/entities/teacher-content.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'gamification_system' schema
    TypeOrmModule.forRootAsync({
      name: 'gamification',  // Connection name for @InjectRepository(Entity, 'gamification')
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/gamification/entities/**/*.entity{.ts,.js}',
          __dirname + '/modules/notifications/entities/notification.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'progress_tracking' schema
    // FIX-BE-007-2026-01-18: Added StudentInterventionAlert entity from teacher module
    // FIX-BE-010-2026-01-18: Added Profile and Classroom for cross-datasource relations
    // FIX-BE-011-2026-01-18: Added Tenant for Profile->Tenant cascade dependency
    // FIX-BE-013-2026-01-20: Added School for Classroom->School cascade dependency
    TypeOrmModule.forRootAsync({
      name: 'progress',  // Connection name for @InjectRepository(Entity, 'progress')
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/progress/entities/**/*.entity{.ts,.js}',
          __dirname + '/modules/teacher/entities/student-intervention-alert.entity{.ts,.js}',
          // FIX-BE-010: Required for StudentInterventionAlert @ManyToOne relations
          __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
          __dirname + '/modules/social/entities/classroom.entity{.ts,.js}',
          // FIX-BE-011: Required for Profile @ManyToOne -> Tenant cascade
          __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
          // FIX-BE-013: Required for Classroom @ManyToOne -> School cascade
          __dirname + '/modules/social/entities/school.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'social_features' schema
    // FIX-BE-008-2026-01-18: Added TeacherReport entity from teacher module
    // FIX-BE-012-2026-01-19: Added Profile and Tenant for @ManyToOne relations in Classroom, ClassroomMember, TeacherClassroom
    TypeOrmModule.forRootAsync({
      name: 'social',  // Connection name for @InjectRepository(Entity, 'social')
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/social/entities/**/*.entity{.ts,.js}',
          __dirname + '/modules/assignments/entities/**/*.entity{.ts,.js}', // Needed for AssignmentClassroom relation
          __dirname + '/modules/teacher/entities/teacher-report.entity{.ts,.js}',
          // FIX-BE-012: Required for Classroom, ClassroomMember, TeacherClassroom @ManyToOne relations
          __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
          __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'content_management' schema
    TypeOrmModule.forRootAsync({
      name: 'content',  // Connection name for @InjectRepository(Entity, 'content')
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/modules/content/entities/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'audit_logging' schema
    TypeOrmModule.forRootAsync({
      name: 'audit',  // Connection name for @InjectRepository(Entity, 'audit')
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/modules/audit/entities/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'notifications' schema (EXT-003)
    TypeOrmModule.forRootAsync({
      name: 'notifications',  // 8th datasource for multi-channel notifications
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/modules/notifications/entities/multichannel/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'communication' schema
    TypeOrmModule.forRootAsync({
      name: 'communication',  // 9th datasource for teacher-student communication
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/modules/teacher/entities/message*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'admin_dashboard' schema
    // FIX-BE-009-2026-01-18: Created datasource for AdminReport entity (was incorrectly on 'auth')
    // FIX-BE-010-2026-01-18: Added User entity for AdminReport @ManyToOne relation
    // FIX-BE-011-2026-01-18: Added Role for User->Role cascade dependency
    TypeOrmModule.forRootAsync({
      name: 'admin_dashboard',  // 10th datasource for admin reports
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/admin/entities/admin-report.entity{.ts,.js}',
          // FIX-BE-010: Required for AdminReport @ManyToOne relation to User
          __dirname + '/modules/auth/entities/user.entity{.ts,.js}',
          // FIX-BE-011: Required for User @ManyToMany -> Role cascade
          __dirname + '/modules/auth/entities/role.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Application modules
    AuthModule,
    ProfileModule, // User profile management
    EducationalModule,
    ProgressModule,
    SocialModule,
    ContentModule,
    GamificationModule,
    AdminModule,
    TeacherModule,
    NotificationsModule,
    WebSocketModule,
    TasksModule, // Must be after NotificationsModule
    AuditModule, // Audit logging for compliance
    AssignmentsModule, // Teacher assignment management
    HealthModule, // Health check endpoint for monitoring
    ParentsModule, // EXT-010: Parent notifications and weekly reports
  ],
  controllers: [],
  providers: [
    // Global RLS Interceptor for Row Level Security
    {
      provide: APP_INTERCEPTOR,
      useClass: RlsInterceptor,
    },
    // Global Audit Interceptor for compliance logging
    // Logs all POST, PUT, PATCH, DELETE requests automatically
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule { }
