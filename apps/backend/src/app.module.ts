import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Configurations
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import envConfig from './config/env.config';
import redisConfig from './config/redis.config';
import { validateEnv } from './config/env.validation';

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
import { CommunicationModule } from './modules/communication/communication.module';
import { LtiModule } from './modules/lti/lti.module';

// Data Warehouse modules (conditionally loaded via ENABLE_DATA_WAREHOUSE=true)
import { ETLModule } from './modules/etl/etl.module';
import { MLModule } from './modules/ml/ml.module';
import { VisualizationModule } from './modules/visualization/visualization.module';

// Shared
import { RlsInterceptor } from './shared/interceptors/rls.interceptor';
import { AuditInterceptor } from './modules/audit/interceptors/audit.interceptor';
import { TracingInterceptor } from './shared/interceptors/tracing.interceptor';

// ---------------------------------------------------------------------------
// Connection stagger for Windows WSL2 development.
// Windows Hyper-V firewall and svchost.exe proxy drop TCP connections
// (ECONNREFUSED/ECONNRESET) when overwhelmed by 11+ simultaneous connects.
// Each datasource waits (n × 500ms) so connections are serialized.
// Disabled in production and on non-Windows platforms.
// ---------------------------------------------------------------------------
let _dsConnIndex = 0;
const DS_STAGGER_MS =
  process.platform === 'win32' && process.env.NODE_ENV !== 'production'
    ? 500
    : 0;
const dsStagger = (): Promise<void> => {
  const delay = _dsConnIndex++ * DS_STAGGER_MS;
  return delay > 0 ? new Promise((r) => setTimeout(r, delay)) : Promise.resolve();
};

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, envConfig, redisConfig],
      envFilePath: [
        '.env.local',
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env.dev',
        '.env',
      ],
      cache: true,
      validate: validateEnv,
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
    // Disabled in dev via CRON_ENABLED=false to prevent DB connection saturation
    ...((process.env.CRON_ENABLED || 'true').toLowerCase() !== 'false'
      ? [ScheduleModule.forRoot()]
      : []),

    // Rate limiting (ESTANDAR-SEGURIDAD §3.4 API4: Unrestricted Resource Consumption)
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,   // 1 minute window
          limit: 100,   // 100 requests per minute per IP (global default)
        },
      ],
    }),

    // Event emitter for decoupled domain events (exercise -> XP -> achievement -> notification)
    EventEmitterModule.forRoot(),

    // Database connection for 'auth_management' schema
    TypeOrmModule.forRootAsync({
      name: 'auth',  // Connection name for @InjectRepository(Entity, 'auth')
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/auth/entities/**/*.entity{.ts,.js}',
          // FIX-CORR-002: Admin entities registered via forFeature('auth') in admin.module.ts
          __dirname + '/modules/admin/entities/system-setting.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/feature-flag.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/notification-settings.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/notification-settings-global.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/bulk-operation.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/tenant-configuration.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/api-configuration.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/environment-config.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/gamification-parameter.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/rate-limit.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
      inject: [ConfigService],
    }),

    // Database connection for 'educational_content' schema
    // CORRECTED (2025-12-18): Agregado path de assignments y teacher entities
    TypeOrmModule.forRootAsync({
      name: 'educational',  // Connection name for @InjectRepository(Entity, 'educational')
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/educational/entities/**/*.entity{.ts,.js}',
          __dirname + '/modules/assignments/entities/**/*.entity{.ts,.js}',
          __dirname + '/modules/teacher/entities/teacher-content.entity{.ts,.js}',
          __dirname + '/modules/teacher/entities/resource-rating.entity{.ts,.js}',
          __dirname + '/modules/teacher/entities/resource-comment.entity{.ts,.js}',
          __dirname + '/modules/teacher/entities/resource-download.entity{.ts,.js}',
          // FIX: Profile+Tenant needed by ResourceRating#teacher, ResourceComment#author, ResourceDownload @ManyToOne
          __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
          __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
      inject: [ConfigService],
    }),

    // Database connection for 'gamification_system' schema
    TypeOrmModule.forRootAsync({
      name: 'gamification',  // Connection name for @InjectRepository(Entity, 'gamification')
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/gamification/entities/**/*.entity{.ts,.js}',
          // FIX-CORR-001: Removed broken path '/modules/notifications/entities/notification.entity'
          // (file is at multichannel/notification.entity.ts, already covered by notifications datasource L285)
          // FIX-BE-014-2026-01-28: Required for UserStats @OneToOne -> Profile relation
          __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
          // FIX-BE-014b-2026-01-28: Required for Profile @ManyToOne -> Tenant cascade
          __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
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
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
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
          // FIX-BE-015-2026-01-28: Required for ModuleProgress @ManyToOne -> Module relation
          __dirname + '/modules/educational/entities/module.entity{.ts,.js}',
          // FIX-BE-015b-2026-01-28: Required for Module @OneToMany -> Exercise cascade
          __dirname + '/modules/educational/entities/exercise.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
      inject: [ConfigService],
    }),

    // Database connection for 'social_features' schema
    // FIX-BE-008-2026-01-18: Added TeacherReport entity from teacher module
    // FIX-BE-012-2026-01-19: Added Profile and Tenant for @ManyToOne relations in Classroom, ClassroomMember, TeacherClassroom
    TypeOrmModule.forRootAsync({
      name: 'social',  // Connection name for @InjectRepository(Entity, 'social')
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/social/entities/**/*.entity{.ts,.js}',
          __dirname + '/modules/assignments/entities/**/*.entity{.ts,.js}', // Needed for AssignmentClassroom relation
          __dirname + '/modules/teacher/entities/teacher-report.entity{.ts,.js}',
          // FIX-CORR-005: Teacher entities with social_features schema
          __dirname + '/modules/teacher/entities/scheduled-report.entity{.ts,.js}',
          __dirname + '/modules/teacher/entities/shared-report.entity{.ts,.js}',
          // FIX-BE-012: Required for Classroom, ClassroomMember, TeacherClassroom @ManyToOne relations
          __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
          __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
          // FIX P2: UserSkillRating uses 'social' datasource via PeerChallengesModule
          __dirname + '/modules/gamification/peer-challenges/entities/**/*.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
      inject: [ConfigService],
    }),

    // Database connection for 'content_management' schema
    TypeOrmModule.forRootAsync({
      name: 'content',  // Connection name for @InjectRepository(Entity, 'content')
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
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
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
      inject: [ConfigService],
    }),

    // Database connection for 'audit_logging' schema
    TypeOrmModule.forRootAsync({
      name: 'audit',  // Connection name for @InjectRepository(Entity, 'audit')
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/audit/entities/**/*.entity{.ts,.js}',
          // FIX-CORR-003: Admin entities with audit_logging schema
          __dirname + '/modules/admin/entities/system-alert.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/activity-log.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/system-log.entity{.ts,.js}',
          __dirname + '/modules/admin/entities/performance-metric.entity{.ts,.js}',
          // FIX-ECONN-002: Required for SystemAlert/ActivityLog/SystemLog/PerformanceMetric @ManyToOne -> Profile
          __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
          // FIX-ECONN-002b: Required for SystemAlert/SystemLog/PerformanceMetric @ManyToOne -> Tenant
          __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
      inject: [ConfigService],
    }),

    // Database connection for 'notifications' schema (EXT-003)
    TypeOrmModule.forRootAsync({
      name: 'notifications',  // 8th datasource for multi-channel notifications
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/notifications/entities/multichannel/**/*.entity{.ts,.js}',
          // FIX-CORR-004: rate-limit-log.entity is at root level, not in multichannel/
          __dirname + '/modules/notifications/entities/rate-limit-log.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
      inject: [ConfigService],
    }),

    // Database connection for 'communication' schema
    TypeOrmModule.forRootAsync({
      name: 'communication',  // 9th datasource for teacher-student communication
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/communication/entities/**/*.entity{.ts,.js}',
          __dirname + '/modules/teacher/entities/message*.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
      inject: [ConfigService],
    }),

    // Database connection for 'admin_dashboard' schema
    // FIX-BE-009-2026-01-18: Created datasource for AdminReport entity (was incorrectly on 'auth')
    // FIX-BE-010-2026-01-18: Added User entity for AdminReport @ManyToOne relation
    // FIX-BE-011-2026-01-18: Added Role for User->Role cascade dependency
    TypeOrmModule.forRootAsync({
      name: 'admin_dashboard',  // 10th datasource for admin reports
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/admin/entities/admin-report.entity{.ts,.js}',
          // FIX-CORR-006: Admin entities with admin_dashboard schema
          __dirname + '/modules/admin/entities/metrics-history.entity{.ts,.js}',
          // FIX-BE-010: Required for AdminReport @ManyToOne relation to User
          __dirname + '/modules/auth/entities/user.entity{.ts,.js}',
          // FIX-BE-011: Required for User @ManyToMany -> Role cascade
          __dirname + '/modules/auth/entities/role.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
      inject: [ConfigService],
    }),

    // Database connection for 'lti_integration' schema
    // FIX-CORR-007: LTI module referenced 'lti' datasource but it didn't exist
    TypeOrmModule.forRootAsync({
      name: 'lti',  // 11th datasource for LTI integration
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => { await dsStagger(); return {
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          __dirname + '/modules/lti/entities/**/*.entity{.ts,.js}',
          // FIX-ECONN-001: Required for LtiConsumer/LtiSession/LtiGradePassback @ManyToOne -> Profile
          __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
          // FIX-ECONN-001b: Required for LtiConsumer @ManyToOne -> Tenant + Profile -> Tenant cascade
          __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
        retryAttempts: configService.get('database.retryAttempts', 5),
        retryDelay: configService.get('database.retryDelay', 5000),
      } as TypeOrmModuleOptions; },
      inject: [ConfigService],
    }),

    // ============================================================
    // Data Warehouse datasource + modules (ETL, ML, Visualization)
    // Enabled via ENABLE_DATA_WAREHOUSE=true environment variable.
    // Default: OFF — no impact on existing modules or tests.
    // ============================================================
    ...(process.env.ENABLE_DATA_WAREHOUSE === 'true'
      ? [
          // 12th datasource: data_warehouse schema (fact/dimension tables for analytics)
          TypeOrmModule.forRootAsync({
            name: 'data_warehouse',
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => { await dsStagger(); return {
              type: 'postgres' as const,
              host: configService.get('database.host'),
              port: configService.get('database.port'),
              username: configService.get('database.username'),
              password: configService.get('database.password'),
              database: configService.get('database.database'),
              entities: [],  // ETL uses raw SQL, no entity classes for data_warehouse
              synchronize: false,  // Never auto-sync warehouse schema
              logging: configService.get('database.logging'),
              ssl: configService.get('database.ssl'),
              extra: configService.get('database.extra'),
              retryAttempts: configService.get('database.retryAttempts', 5),
              retryDelay: configService.get('database.retryDelay', 5000),
            } as TypeOrmModuleOptions; },
            inject: [ConfigService],
          }),
          // ETL: Extract-Transform-Load pipeline (data_warehouse + audit + progress + auth + social + gamification)
          ETLModule,
          // ML: Machine Learning predictions (progress + gamification + auth, queries data_warehouse via cross-schema SQL)
          MLModule,
          // Visualization: Dashboards, charts, reports (in-memory, no datasource)
          VisualizationModule,
        ]
      : []),

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
    CommunicationModule, // GAP-SOC-003: Conversation entities for communication schema
    LtiModule, // FIX-CORR-007: LTI 1.3 integration module (40 endpoints)
  ],
  controllers: [],
  providers: [
    // Global rate limiting guard (ThrottlerModule)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global Tracing Interceptor for OpenTelemetry spans + correlation IDs
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor,
    },
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
