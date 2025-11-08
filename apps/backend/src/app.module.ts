import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';

// Configurations
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import envConfig from './config/env.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
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

// Shared
import { RlsInterceptor } from './shared/interceptors/rls.interceptor';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, envConfig],
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

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
        entities: [__dirname + '/modules/educational/entities/**/*.entity{.ts,.js}'],
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
        entities: [__dirname + '/modules/gamification/entities/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'progress_tracking' schema
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
        entities: [__dirname + '/modules/progress/entities/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
        extra: configService.get('database.extra'),
      }),
      inject: [ConfigService],
    }),

    // Database connection for 'social_features' schema
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
        entities: [__dirname + '/modules/social/entities/**/*.entity{.ts,.js}'],
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

    // Application modules
    AuthModule,
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
  ],
  controllers: [],
  providers: [
    // Global RLS Interceptor for Row Level Security
    {
      provide: APP_INTERCEPTOR,
      useClass: RlsInterceptor,
    },
  ],
})
export class AppModule {}
