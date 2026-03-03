---
title: "Backend Modules Architecture"
description: "Arquitectura modular del backend GAMILIT — NestJS 11, 23 modulos, 915 endpoints"
version: "2.0.0"
date: "2026-03-03"
project: "gamilit"
status: "PRODUCCION_ACTIVA"
ssot: "orchestration/inventarios/BACKEND_INVENTORY.yml (v5.3.3) + MASTER_INVENTORY.yml (v14.9.4)"
---

# Backend Modules Architecture

## Proyecto GAMILIT

**Fecha:** 2026-03-03 (actualizado desde v1.0 de 2026-01-07)
**Total modulos:** 23 (22 directorios + mail transitivo)
**Total entidades:** 156 archivos (157 clases @Entity)
**Total endpoints REST:** 915 (856 activos + 58 condicionales data_warehouse)
**SSOT:** `orchestration/inventarios/BACKEND_INVENTORY.yml`

---

## Overview

El backend de GAMILIT utiliza una arquitectura modular basada en **NestJS 11** con soporte para **multi-tenant** y **multi-schema** en PostgreSQL. Cada modulo encapsula funcionalidad especifica y puede conectarse a diferentes schemas de base de datos segun su dominio.

### Arquitectura Multi-Schema

El sistema utiliza **12 datasources** (11 siempre activos + 1 condicional) conectados a 18 schemas de PostgreSQL (16 activos + 2 placeholder):

| Datasource | Schema | Modulos principales |
|------------|--------|---------------------|
| `auth` | `auth_management` | auth, profile, admin (system_configuration) |
| `educational` | `educational_content` | educational, assignments, teacher (content) |
| `gamification` | `gamification_system` | gamification, notifications (basic notification) |
| `progress` | `progress_tracking` | progress, teacher (alerts) |
| `social` | `social_features` | social, assignments, teacher (reports) |
| `content` | `content_management` | content |
| `audit` | `audit_logging` | audit, admin (audit entities) |
| `notifications` | `notifications` | notifications (multichannel) |
| `communication` | `communication` | communication, teacher (messages) |
| `admin_dashboard` | `admin_dashboard` | admin (reports, metrics) |
| `lti` | `lti_integration` | lti |
| `data_warehouse` | `data_warehouse` | etl, ml, visualization (CONDICIONAL) |

**Nota:** El 12o datasource (`data_warehouse`) solo se activa cuando `ENABLE_DATA_WAREHOUSE=true`. Los modulos `etl`, `ml` y `visualization` se importan condicionalmente en `app.module.ts` (lineas 458-488).

---

## Importacion en app.module.ts

### Modulos siempre importados (18 directos)
```
AuthModule, ProfileModule, EducationalModule, ProgressModule, SocialModule,
ContentModule, GamificationModule, AdminModule, TeacherModule,
NotificationsModule, WebSocketModule, TasksModule, AuditModule,
AssignmentsModule, HealthModule, ParentsModule, CommunicationModule, LtiModule
```

### Modulos condicionales (ENABLE_DATA_WAREHOUSE=true)
```
ETLModule, MLModule, VisualizationModule
```

### Modulos transitivos (no importados directamente en app.module.ts)
```
MailModule — cargado transitivamente por: AuthModule, NotificationsModule,
             ProgressModule, TeacherModule, ParentsModule
```

---

## Module: admin

### Purpose
Portal administrativo completo para gestion de usuarios, organizaciones, contenido educativo, configuracion del sistema, reportes y monitoreo. Incluye funcionalidades de bulk operations, alertas del sistema y feature flags.

### Controllers (21)
- `AdminUsersController` - Gestion de usuarios
- `AdminOrganizationsController` - Gestion de tenants/organizaciones
- `AdminContentController` - Administracion de contenido
- `AdminSystemController` - Configuracion del sistema
- `AdminDashboardController` - Dashboard con estadisticas
- `AdminRolesController` - Gestion de roles RBAC
- `AdminReportsController` - Generacion de reportes
- `AdminLogsController` - Visualizacion de logs
- `ClassroomAssignmentsController` - Asignaciones a aulas
- `ClassroomTeachersRestController` - Profesores en aulas
- `AdminGamificationConfigController` - Configuracion de gamificacion
- `AdminBulkOperationsController` - Operaciones masivas
- `AdminAlertsController` - Alertas del sistema
- `AdminAnalyticsController` - Analytics avanzados
- `AdminProgressController` - Progreso global
- `AdminMonitoringController` - Monitoreo del sistema
- `AdminInterventionsController` - Alertas de intervencion estudiantil
- `AdminAssignmentsController` - Gestion de asignaciones
- `FeatureFlagsController` - Feature flags
- `AdminSystemConfigurationController` - Configuracion de sistema avanzada
- `AdminReportsDashboardController` - Dashboard de reportes

### Services (22)
- `AdminUsersService` - CRUD de usuarios
- `AdminOrganizationsService` - CRUD de organizaciones
- `AdminContentService` - Gestion de contenido
- `AdminSystemService` - Configuracion sistema
- `AdminDashboardService` - Estadisticas dashboard
- `AdminRolesService` - Gestion roles
- `AdminReportsService` - Generacion reportes
- `ClassroomAssignmentsService` - Asignaciones aulas
- `GamificationConfigService` - Config gamificacion
- `BulkOperationsService` - Operaciones bulk
- `AdminAlertsService` - Alertas sistema
- `AdminAnalyticsService` - Analytics
- `AdminProgressService` - Progreso tracking
- `AdminMonitoringService` - Monitoreo
- `AdminInterventionsService` - Intervenciones
- `AdminAssignmentsService` - Asignaciones
- `FeatureFlagsService` - Feature flags
- `DashboardStatsService` - Stats dashboard
- `UserStatsService` - Stats usuarios
- `ContentStatsService` - Stats contenido
- `RecentActivityService` - Actividad reciente
- `AdminQueryBuilder` - Query builder

### Entities (16)
- `SystemSetting` - Configuraciones globales
- `FeatureFlag` - Feature flags
- `NotificationSettings` - Config notificaciones por usuario
- `NotificationSettingsGlobal` - Config notificaciones global
- `BulkOperation` - Registro operaciones masivas
- `AdminReport` - Reportes generados
- `SystemAlert` - Alertas del sistema
- `RateLimit` - Rate limiting
- `GamificationParameter` - Parametros de gamificacion
- `PerformanceMetric` - Metricas de rendimiento
- `SystemLog` - Logs del sistema
- `ActivityLog` - Logs de actividad
- `ApiConfiguration` - Configuracion APIs
- `EnvironmentConfig` - Configuracion por ambiente
- `TenantConfiguration` - Configuracion por tenant
- `MetricsHistory` - Historico de metricas

### Endpoints: 158

### Dependencies
- `TasksModule` (para MissionsCronService)
- TypeORM entities de: auth, educational, content, social, audit, progress, admin_dashboard

---

## Module: assignments

### Purpose
Gestion de tareas y asignaciones para profesores. Permite crear, asignar y dar seguimiento a ejercicios asignados a estudiantes y aulas.

### Controllers (2)
- `AssignmentsController` - CRUD de asignaciones
- `StudentAssignmentsController` - Vista estudiante de asignaciones

### Services (1)
- `AssignmentsService` - Logica de negocio de asignaciones

### Entities (4)
- `Assignment` - Tarea/asignacion principal
- `AssignmentExercise` - Ejercicios incluidos en asignacion
- `AssignmentStudent` - Relacion asignacion-estudiante
- `AssignmentSubmission` - Entregas de estudiantes

### DTOs (7)
- CreateAssignmentDto
- UpdateAssignmentDto
- AssignmentResponseDto
- AssignmentFiltersDto
- SubmitAssignmentDto
- AssignmentSubmissionResponseDto
- StudentAssignmentDto

### Endpoints: 19

### Dependencies
- TypeORM: educational (Assignment, AssignmentExercise, AssignmentStudent, AssignmentSubmission)
- TypeORM: social (AssignmentClassroom)

---

## Module: audit

### Purpose
Sistema de audit logging para compliance y seguridad. Registra todas las acciones criticas del sistema.

### Controllers
- Ninguno (solo interceptor global)

### Services (1)
- `AuditService` - Creacion y consulta de logs

### Interceptors (1)
- `AuditInterceptor` - Interceptor global automatico de requests (POST, PUT, PATCH, DELETE)

### Entities (3)
- `AuditLog` - Log de auditoria con campos:
  - `eventType` - Tipo de evento
  - `action` - Accion realizada
  - `resourceType/resourceId` - Recurso afectado
  - `actorId/actorType` - Quien realizo la accion
  - `oldValues/newValues/changes` - Cambios realizados (JSONB)
  - `severity` - Nivel (debug, info, warning, error, critical)
  - `status` - Resultado (success, failure, partial)

### DTOs (1)
- CreateAuditLogDto

### Endpoints: 0

### Dependencies
- TypeORM: audit (AuditLog)

---

## Module: auth

### Purpose
Autenticacion completa con JWT, gestion de sesiones, verificacion de email, recuperacion de contrasena y seguridad. Incluye sistema RBAC con roles y permisos. Carga `MailModule` transitivamente.

### Controllers (3)
- `AuthController` - Login, logout, refresh tokens
- `PasswordController` - Recuperacion de contrasena
- `UsersController` - Gestion de usuarios

### Services (6)
- `AuthService` - Autenticacion core
- `SessionManagementService` - Gestion de sesiones
- `SecurityService` - Seguridad y validaciones
- `PasswordRecoveryService` - Recuperacion contrasena
- `EmailVerificationService` - Verificacion email
- `TokenService` - Gestion de tokens JWT

### Strategies (1)
- `JwtStrategy` - Passport JWT strategy

### Entities (18)
- `User` - Usuario principal
- `Profile` - Perfil de usuario
- `Tenant` - Organizacion/tenant
- `Role` - Roles RBAC
- `UserRole` - Relacion usuario-rol
- `Membership` - Membresia en tenant
- `AuthProvider` - Proveedores OAuth
- `AuthAttempt` - Intentos de login
- `UserSession` - Sesiones activas
- `EmailVerificationToken` - Tokens verificacion
- `PasswordResetToken` - Tokens reset password
- `SecurityEvent` - Eventos de seguridad
- `UserPreferences` - Preferencias usuario
- `UserSuspension` - Suspensiones
- `Permission` - Permisos granulares
- `ParentAccount` - Cuentas de padres
- `ParentStudentLink` - Vinculacion padre-estudiante
- `ParentNotification` - Notificaciones a padres

### DTOs (38)
- Login, Register, ChangePassword
- Create/Update User, Profile, Tenant
- Token management DTOs
- Role assignment DTOs
- Response DTOs

### Endpoints: 29

### Dependencies
- `MailModule` - Para envio de emails (transitivo)
- `PassportModule` - Strategies de autenticacion
- `JwtModule` - Manejo de tokens JWT
- TypeORM: auth (todas las entities)
- TypeORM: gamification (UserStats para getUserStatistics)
- TypeORM: progress (ExerciseSubmission)

---

## Module: communication

### Purpose
Entidades de conversacion para el sistema de mensajeria entre docentes y estudiantes. Modulo parcialmente implementado (20%) — las entidades se registran via glob en app.module.ts. Las entidades de mensajes (Message, MessageParticipant) residen en el modulo teacher.

### Controllers
- Ninguno

### Services
- Ninguno

### Entities (2)
- `Conversation` - Conversaciones (schema: communication)
- `ConversationParticipant` - Participantes en conversaciones

### Endpoints: 0

### Estado: 20%

### Dependencies
- TypeORM: communication (Conversation, ConversationParticipant)
- Nota: Message + MessageParticipant estan en modules/teacher/entities/ pero usan datasource `communication`

---

## Module: content

### Purpose
Gestion de contenido educativo y multimedia. Incluye plantillas reutilizables, contenido curado sobre Marie Curie, y archivos multimedia.

### Controllers (10)
- `ContentTemplatesController` - Plantillas de contenido
- `MarieCurieContentController` - Contenido Marie Curie
- `MediaFilesController` - Archivos multimedia
- `ContentAuthorsController` - Autores de contenido
- `ContentCategoriesController` - Categorias jerarquicas
- `ContentTagsController` - Tags de contenido
- `ContentModerationController` - Moderacion de contenido
- `ContentVersionsController` - Versionado de contenido
- `ContentSearchController` - Busqueda de contenido
- `ContentStatsController` - Estadisticas de contenido

### Services (10)
- `ContentTemplatesService` - CRUD plantillas
- `MarieCurieContentService` - Contenido curado
- `MediaFilesService` - Gestion archivos
- `ContentAuthorsService` - Perfiles autores
- `ContentCategoriesService` - Categorias
- `ContentTagsService` - Tags
- `ContentModerationService` - Moderacion
- `ContentVersionsService` - Versiones
- `ContentSearchService` - Busqueda
- `ContentStatsService` - Estadisticas

### Entities (10)
- `ContentTemplate` - Plantillas reutilizables (5 tipos)
- `MarieCurieContent` - Contenido curado (9 categorias)
- `MediaFile` - Archivos multimedia (6 tipos)
- `ContentAuthor` - Perfiles de autores
- `ContentCategory` - Categorias jerarquicas
- `ContentTag` - Tags de contenido
- `ContentVersion` - Versiones de contenido
- `ContentModerationLog` - Logs de moderacion
- `ContentSearch` - Indices de busqueda
- `MediaAttachment` - Adjuntos multimedia

### DTOs (10)
- Create/Update DTOs para cada entity
- Response DTOs con relaciones
- Filter DTOs

### Endpoints: 102

### Dependencies
- TypeORM: content (todas las entities)

---

## Module: educational

### Purpose
Gestion de contenido educativo estructurado: modulos de aprendizaje, ejercicios (23 tipos activos, 1 BACKLOG), recursos multimedia y rubricas de evaluacion.

### Controllers (5)
- `ModulesController` - API modulos educativos
- `ExercisesController` - API ejercicios (filtra is_active=true)
- `MediaController` - API recursos multimedia
- `MediaUploadController` - Subida de archivos
- `RubricsController` - Rubricas de evaluacion

### Services (7)
- `ModulesService` - Gestion de modulos
- `ExercisesService` - Gestion de ejercicios (findByModuleId filtra is_active:true)
- `MediaService` - Gestion multimedia
- `MediaStorageService` - Almacenamiento archivos
- `RubricsService` - Rubricas
- `ExerciseMechanicsService` - Mapeo mecanicas
- `ContentApprovalService` - Flujo de aprobacion

### Entities (16)
- `Module` - Modulo educativo con contenido estructurado
- `Exercise` - Ejercicio (23 tipos activos + comprension_auditiva BACKLOG)
- `AssessmentRubric` - Rubrica de evaluacion
- `MediaResource` - Recurso multimedia
- `MediaAttachment` - Adjunto multimedia
- `ExerciseMechanicMapping` - Mapeo mecanicas
- `ContentApproval` - Aprobacion de contenido
- `DifficultyCriteria` - Criterios de dificultad
- `ClassroomModule` - Modulos asignados a aulas
- `RubricCriteria` - Criterios de rubrica
- `RubricLevel` - Niveles de rubrica
- `ExerciseTag` - Tags de ejercicio
- `ModulePrerequisite` - Prerequisitos de modulos
- `ExerciseHint` - Pistas de ejercicio
- `LearningObjective` - Objetivos de aprendizaje
- `ExerciseVariant` - Variantes de ejercicio

### DTOs (30)
- CreateExerciseDto
- UpdateExerciseDto
- CreateModuleDto, UpdateModuleDto
- RubricDTOs (Create, Update, Response)
- ExerciseFilter DTOs

### Endpoints: 51

### Dependencies
- `ProgressModule` - Para ExerciseSubmissionService
- TypeORM: educational (todas las entities)
- TypeORM: auth (Profile)
- TypeORM: social (ClassroomMember, AssignmentClassroom)

---

## Module: etl

### Purpose
Pipeline ETL (Extract-Transform-Load) para el data warehouse analitico. **Importado condicionalmente** cuando `ENABLE_DATA_WAREHOUSE=true`.

### Controllers (3)
- `ETLPipelineController` - Gestion del pipeline ETL
- `ETLJobsController` - Trabajos ETL programados
- `ETLStatusController` - Estado y metricas

### Services (9)
- `ETLPipelineService` - Orquestador del pipeline
- `ExtractService` - Extraccion de datos
- `TransformService` - Transformacion
- `LoadService` - Carga al warehouse
- `ETLSchedulerService` - Programacion de jobs
- `ETLMonitoringService` - Monitoreo
- `DataValidationService` - Validacion de datos
- `ETLConfigService` - Configuracion
- `ETLAuditService` - Auditoria

### Entities: 0 (usa SQL nativo sobre data_warehouse schema)

### Endpoints: 16 (condicionales)

### Estado: 75% — ENABLE_DATA_WAREHOUSE=false por defecto

### Dependencies
- TypeORM: data_warehouse (condicional)
- Multiples datasources para extraccion: auth, progress, gamification, social

---

## Module: gamification

### Purpose
Sistema completo de gamificacion con rangos Maya, ML Coins (moneda virtual), achievements, misiones diarias/semanales, power-ups, boosts, leaderboards y tienda virtual.

### Controllers (12)
- `UserStatsController` - Estadisticas de usuario
- `AchievementsController` - Logros
- `MLCoinsController` - Moneda virtual
- `RanksController` - Sistema de rangos Maya
- `LeaderboardController` - Tablas de posiciones
- `MissionsController` - Misiones
- `MissionTemplatesController` - Plantillas de misiones
- `ClassroomMissionsController` - Misiones por aula
- `ComodinesController` - Power-ups/comodines
- `ShopController` - Tienda virtual
- `InventoryController` - Inventario de usuario
- `BoostController` - Boosts activos (GET /boosts/:userId/active)

### Services (19)
- `UserStatsService` - XP, nivel, estadisticas
- `AchievementsService` - Logros desbloqueados
- `MLCoinsService` - Economia virtual
- `RanksService` - Rangos Maya (5 niveles)
- `LeaderboardService` - Rankings (global, escuela, aula)
- `MissionsService` - Misiones diarias/semanales
- `MissionTemplatesService` - Templates de misiones
- `ClassroomMissionsService` - Misiones colectivas
- `ComodinesService` - Power-ups (3 tipos: pistas, vision_lectora, segunda_oportunidad)
- `ShopService` - Tienda con items (3 categorias activas: consumables, cosmetics, boosts)
- `InventoryService` - Inventario de usuario
- `BoostService` - Activacion/consulta de boosts activos
- `PeerChallengesService` - Desafios entre pares
- `UserEquipmentService` - Equipamiento de cosmeticos (visual_type slot system)
- `SkillRatingService` - Calificacion de habilidades
- `BonusCoinsService` - Bonificaciones de ML Coins
- `SeasonService` - Sistema de temporadas
- `MissionProgressService` - Progreso de misiones
- `GamificationEventService` - Eventos de gamificacion

### Entities (22)
- `UserStats` - Estadisticas del jugador
- `UserRank` - Rango actual del usuario
- `Achievement` - Definicion de logros
- `UserAchievement` - Logros desbloqueados
- `AchievementCategory` - Categorias de logros
- `MLCoinsTransaction` - Transacciones de moneda
- `Mission` - Mision activa
- `MissionTemplate` - Plantilla de mision
- `ClassroomMission` - Mision de aula
- `ComodinesInventory` - Inventario power-ups (wide-table)
- `LeaderboardMetadata` - Metadata rankings
- `ActiveBoost` - Boosts activos con TTL
- `InventoryTransaction` - Transacciones inventario
- `ShopCategory` - Categorias tienda (3 activas: consumables, cosmetics, boosts)
- `ShopItem` - Items de tienda (31 items activos)
- `UserPurchase` - Compras realizadas
- `UserEquippedItem` - Items equipados (visual_type slot: cosmetics/frames)
- `MayaRankEntity` - Definicion rangos Maya
- `ComodinUsageLog` - Log uso comodines
- `PeerChallenge` - Desafios entre pares (peer-challenges subdir)
- `UserSkillRating` - Calificacion de habilidades
- `Season` - Temporadas del sistema

### DTOs (39)
- CreateMissionDto, MissionResponseDto
- ShopPurchaseDto, ShopItemResponseDto
- EquipItemDto
- AchievementResponseDto
- LeaderboardResponseDto
- ComodinUsageDto

### Endpoints: 73

### Dependencies
- TypeORM: gamification (todas las entities)
- TypeORM: auth (Profile para leaderboards)
- TypeORM: progress (ExerciseSubmission para streaks)
- TypeORM: social (UserSkillRating via peer-challenges)

---

## Module: health

### Purpose
Health checks para monitoreo del sistema. Expone endpoints de liveness, readiness y metricas Prometheus.

### Controllers (1)
- `HealthController` - 4 endpoints de health check

### Services (2)
- `HealthService` - Health check comprehensivo (DB, Redis, memoria)
- `MetricsService` - Metricas en formato Prometheus

### Entities: 0

### DTOs (1)
- HealthResponseDto

### Endpoints: 4
- `GET /health` - Check comprensivo
- `GET /health/live` - Liveness probe (Kubernetes)
- `GET /health/ready` - Readiness probe (Kubernetes)
- `GET /health/metrics` - Metricas Prometheus

### Dependencies
- `ConfigModule` - Configuracion del sistema

---

## Module: lti

### Purpose
Integracion LTI 1.3 (Learning Tools Interoperability) para conectar con sistemas LMS externos (Canvas, Moodle, Blackboard).

### Controllers (5)
- `LtiLaunchController` - Lanzamiento LTI
- `LtiConfigController` - Configuracion de consumers
- `LtiGradeController` - Grade passback
- `LtiSessionController` - Sesiones LTI
- `LtiToolController` - Configuracion de herramientas

### Services (5)
- `LtiLaunchService` - Validacion y procesamiento de launches
- `LtiConfigService` - Gestion de consumers
- `LtiGradeService` - Sincronizacion de calificaciones
- `LtiSessionService` - Sesiones activas
- `LtiSecurityService` - Validacion JWKS y firmas

### Entities (3)
- `LtiConsumer` - Consumer/plataforma LMS
- `LtiSession` - Sesion de usuario LTI
- `LtiGradePassback` - Registro de grade passback

### DTOs (12)
- LtiLaunchDto, LtiConfigDto
- LtiGradeDto, LtiSessionDto
- Response DTOs

### Endpoints: 42

### Estado: 75%

### Dependencies
- TypeORM: lti (LtiConsumer, LtiSession, LtiGradePassback)
- TypeORM: auth (Profile, Tenant para relaciones)

---

## Module: mail

### Purpose
Servicio de transporte de email via Nodemailer. **No importado directamente en app.module.ts** — cargado transitivamente por AuthModule, NotificationsModule, ProgressModule, TeacherModule, ParentsModule.

### Controllers: Ninguno

### Services (1)
- `MailService` - Envio de emails transaccionales

### Entities: 0

### Endpoints: 0

### Estado: 100%

### Dependencies
- Nodemailer (SMTP transport)
- `ConfigModule` - Credenciales SMTP

---

## Module: ml

### Purpose
Predicciones de Machine Learning basadas en datos de progreso y gamificacion. **Importado condicionalmente** cuando `ENABLE_DATA_WAREHOUSE=true`.

### Controllers (3)
- `MLPredictionsController` - Predicciones de aprendizaje
- `MLModelsController` - Gestion de modelos
- `MLFeaturesController` - Feature store

### Services (13)
- `MLPipelineService` - Orquestador de pipeline ML
- `FeatureStoreService` - Almacen de features
- `ModelRegistryService` - Registro de modelos
- `PredictionService` - Calculo de predicciones
- `TrainingService` - Entrenamiento de modelos
- `EvaluationService` - Evaluacion de modelos
- `StudentRiskService` - Prediccion de riesgo estudiantil
- `LearningPathService` - Recomendacion de rutas
- `DifficultyAdaptationService` - Adaptacion de dificultad
- `EngagementPredictionService` - Prediccion de engagement
- `ContentRecommendationService` - Recomendacion de contenido
- `PerformanceForecastService` - Pronostico de rendimiento
- `MLMonitoringService` - Monitoreo de modelos en produccion

### Entities: 0 (usa data_warehouse schema via SQL nativo)

### Guards (1)
- `ModelReadyGuard` - Verifica que el modelo este listo

### Decorators (1)
- `@CachePrediction()` - Cache de predicciones

### Endpoints: 21 (condicionales)

### Estado: 50% — ENABLE_DATA_WAREHOUSE=false por defecto

### Dependencies
- TypeORM: data_warehouse (condicional)
- Multiples datasources para features: progress, gamification, auth

---

## Module: notifications

### Purpose
Sistema de notificaciones multi-canal consolidado. Soporta notificaciones in-app, email y push (Web Push API nativo con VAPID). Carga `MailModule` transitivamente.

### Controllers (8)
- `NotificationMultiChannelController` - Notificaciones multi-canal
- `NotificationPreferencesController` - Preferencias usuario
- `NotificationDevicesController` - Dispositivos push
- `NotificationTemplatesController` - Plantillas
- `NotificationsController` - Sistema basico
- `NotificationQueueController` - Cola de notificaciones
- `NotificationLogsController` - Historial de envios
- `PushSubscriptionController` - Suscripciones push

### Services (12)
- `NotificationService` - Core multi-canal
- `NotificationTemplateService` - Templates
- `NotificationPreferenceService` - Preferencias
- `NotificationQueueService` - Cola asincrona
- `UserDeviceService` - Dispositivos
- `PushNotificationService` - Web Push (VAPID)
- `NotificationsService` - Sistema basico
- `SMSNotificationService` - SMS (parcial)
- `EmailNotificationService` - Email via MailModule
- `InAppNotificationService` - Notificaciones in-app
- `NotificationLogService` - Registro de envios
- `NotificationBatchService` - Envio masivo

### Entities (7)
**Sistema Multi-Canal (schema: notifications):**
- `NotificationTemplate` - Plantillas reutilizables
- `MultiChannelNotification` - Notificacion multi-canal
- `NotificationPreference` - Preferencias por tipo
- `NotificationLog` - Registro de envios
- `NotificationQueue` - Cola procesamiento
- `UserDevice` - Dispositivos push
- `RateLimitLog` - Log de rate limiting

**Sistema Basico (schema: gamification_system):**
- `Notification` (basic) - Notificaciones simples (en datasource gamification)

### DTOs (18)
- CreateNotificationDto
- NotificationResponseDto
- UpdatePreferencesDto
- RegisterDeviceDto

### Endpoints: 46

### Dependencies
- `WebSocketModule` - Notificaciones en tiempo real
- `MailModule` - Notificaciones por email (transitivo)
- TypeORM: notifications (entities multichannel)
- TypeORM: gamification (Notification basica)

---

## Module: parents

### Purpose
Portal de padres de familia. Vinculacion con estudiantes, dashboard de progreso academico, notificaciones y comunicacion con docentes. Las entidades (ParentAccount, ParentStudentLink, ParentNotification) residen en el modulo auth.

### Controllers (2)
- `ParentsController` - Perfil, vinculacion, dashboard
- `ParentNotificationsController` - Notificaciones a padres

### Services (7)
- `ParentsService` - Gestion de cuentas de padres
- `ParentStudentLinkService` - Vinculacion padre-estudiante
- `ParentDashboardService` - Dashboard con progreso del hijo
- `ParentNotificationService` - Notificaciones especificas
- `ParentReportService` - Reportes semanales
- `ParentCommunicationService` - Comunicacion con docentes
- `ParentAuthService` - Autenticacion especifica

### Guards (1)
- `ParentAuthGuard` - Verificar rol padre

### Decorators (3)
- `@ParentAccountParam()` - Parametro de cuenta padre
- `@ParentProfileId()` - ID de perfil padre
- `@ParentAccountId()` - ID de cuenta padre

### Entities: 0 (entidades en modules/auth/entities/)

### DTOs (4)
- ParentRegistrationDto
- ParentDashboardDto
- ParentNotificationPreferencesDto
- ParentStudentLinkDto

### Endpoints: 17

### Estado: 100% (backend + frontend 7/7 paginas)

### Dependencies
- TypeORM: auth (ParentAccount, ParentStudentLink, ParentNotification, Profile)
- `MailModule` - Reportes semanales por email (transitivo)
- `NotificationsModule` - Notificaciones multi-canal

---

## Module: profile

### Purpose
Thin layer para gestion de perfiles de usuario. Capa delegada sobre las entidades del modulo auth.

### Controllers (1)
- `ProfileController` - 3 endpoints REST

### Services (1)
- `ProfileService` - CRUD de perfiles

### Entities: 0 (usa `Profile` de AuthModule)

### DTOs (1)
- UpdateProfileDto

### Endpoints: 3

### Dependencies
- TypeORM: auth (Profile)
- TypeORM: gamification (UserStats para estadisticas de perfil)

---

## Module: progress

### Purpose
Tracking de progreso de estudiantes: modulos completados, sesiones de aprendizaje, intentos y entregas de ejercicios, misiones programadas, certificados digitales y metricas de engagement.

### Controllers (6)
- `ModuleProgressController` - 10 endpoints
- `LearningSessionController` - 8 endpoints
- `ExerciseAttemptController` - 9 endpoints
- `ExerciseSubmissionController` - 11 endpoints
- `ScheduledMissionController` - 9 endpoints
- `CertificateController` - 7 endpoints

**Total: 59 endpoints REST**

### Services (13)
- `ModuleProgressService` - Progreso por modulo
- `LearningSessionService` - Sesiones de aprendizaje
- `ExerciseAttemptService` - Intentos de ejercicio
- `ExerciseSubmissionService` - Entregas y calificacion
- `ScheduledMissionService` - Misiones programadas
- `CertificateService` - Certificados digitales
- `PendingActivitiesService` - Actividades pendientes
- `RecentActivityService` - Actividad reciente
- `EngagementService` - Metricas de engagement
- `MasteryService` - Dominio de temas
- `LearningPathService` - Rutas de aprendizaje
- `ProgressSnapshotService` - Snapshots historicos
- `SkillAssessmentService` - Evaluacion de habilidades

### Entities (20)
- `ModuleProgress` - Progreso por modulo
- `LearningSession` - Sesion de aprendizaje
- `ExerciseAttempt` - Intento de ejercicio
- `ExerciseSubmission` - Entrega final
- `ScheduledMission` - Mision programada
- `TeacherNote` - Notas del profesor
- `ManualReview` - Evaluaciones manuales
- `EngagementMetrics` - Metricas engagement
- `MasteryTracking` - Dominio de temas
- `LearningPath` - Rutas de aprendizaje
- `UserLearningPath` - Usuario en ruta
- `ProgressSnapshot` - Snapshots historicos
- `SkillAssessment` - Evaluacion habilidades
- `TeacherIntervention` - Intervenciones docentes
- `Certificate` - Certificados digitales
- `LearningObjectiveProgress` - Progreso por objetivo
- `ExerciseHintUsage` - Uso de pistas en ejercicios
- `SessionEvent` - Eventos de sesion
- `CompletionCriteria` - Criterios de completitud
- `ProgressReport` - Reportes de progreso

### DTOs (37)
- Create/Update DTOs para cada entity
- Progress response DTOs
- Submission grading DTOs

### Endpoints: 59

### Dependencies
- `GamificationModule` - Para recompensas (MLCoins, XP)
- `NotificationsModule` - Notificaciones a profesores
- `MailModule` - Emails (transitivo)
- `WebSocketModule` - Updates en tiempo real
- TypeORM: progress (todas las entities)
- TypeORM: educational (Module, Exercise)
- TypeORM: auth (Profile)

---

## Module: social

### Purpose
Caracteristicas sociales y de aula: escuelas, aulas virtuales, miembros, equipos colaborativos, desafios peer-to-peer y activity feed. Nota: Las features de amistad (friendships) estan implementadas pero son parcialmente funcionales en frontend (~40 endpoints no conectados en UI).

### Controllers (13)
- `FriendshipsController` - Solicitudes y relaciones de amistad
- `SchoolsController` - Instituciones educativas
- `ClassroomsController` - Aulas virtuales
- `ClassroomMembersController` - Miembros de aula
- `TeamsController` - Equipos colaborativos
- `TeamMembersController` - Miembros de equipo
- `TeamChallengesController` - Desafios de equipo
- `PeerChallengesController` - Desafios P2P
- `ChallengeParticipantsController` - Participantes en desafios
- `UserActivitiesController` - Activity Feed
- `GuildsController` - Gremios (BACKLOG: guild/social features out of scope)
- `DiscussionController` - Hilos de discusion
- `TeacherClassroomController` - Relacion profesor-aula

### Services (13)
- `FriendshipsService` - Amistades y bloqueos
- `SchoolsService` - CRUD escuelas
- `ClassroomsService` - CRUD aulas
- `ClassroomMembersService` - Membresia aulas
- `TeamsService` - CRUD equipos
- `TeamMembersService` - Membresia equipos
- `TeamChallengesService` - Desafios equipos
- `PeerChallengesService` - Desafios P2P
- `ChallengeParticipantsService` - Participantes
- `UserActivitiesService` - Activity Feed
- `GuildsService` - Gremios (BACKLOG)
- `DiscussionService` - Discusiones
- `TeacherClassroomService` - Relacion profesor-aula

### Entities (26)
- `Friendship` - Relaciones de amistad
- `FriendRequest` - Solicitudes amistad
- `School` - Instituciones educativas
- `Classroom` - Aulas virtuales
- `ClassroomMember` - Miembros de aula
- `TeacherClassroom` - Profesor-aula
- `Team` - Equipos colaborativos
- `TeamMember` - Miembros equipo
- `TeamChallenge` - Desafios de equipo
- `AssignmentClassroom` - Asignaciones a aulas
- `PeerChallenge` - Desafios P2P
- `ChallengeParticipant` - Participantes desafio
- `ChallengeResult` - Resultados
- `DiscussionThread` - Hilos discusion
- `UserActivity` - Actividad usuario
- `Guild` - Gremios (BACKLOG)
- `GuildMember` - Miembros de gremio
- `GuildChallenge` - Desafios de gremio
- `Block` - Bloqueos entre usuarios
- `UserReport` - Reportes de usuarios
- `ClassroomAnnouncement` - Anuncios de aula
- `ClassroomResource` - Recursos de aula
- `ClassroomEvent` - Eventos de aula
- `ClassroomInvitation` - Invitaciones a aula
- `TeamInvitation` - Invitaciones a equipo
- `ResourceShareLog` - Log de comparticion de recursos

### DTOs (28)
- CRUD DTOs para cada entity
- Filter y pagination DTOs
- Challenge response DTOs

### Endpoints: 135

### Estado: 60% (~40 endpoints unwired en frontend)

### Dependencies
- TypeORM: social (todas las entities)
- TypeORM: auth (Profile, Tenant para relaciones)
- TypeORM: gamification (UserSkillRating via peer-challenges)

---

## Module: tasks

### Purpose
Tareas programadas y cron jobs. Zona horaria: America/Mexico_City. Los CRON jobs se pueden deshabilitar con `CRON_ENABLED=false`.

### Controllers: Ninguno

### Services (5)
- `MissionsCronService` - Generacion automatica de misiones (diarias/semanales)
- `NotificationsCronService` - Procesamiento cola de notificaciones
- `AchievementReconciliationService` - Reconciliacion de achievements
- `MaterializedViewsService` - Actualizacion de vistas materializadas
- `PendingInitializationsCronService` - Reintento de inicializaciones pendientes de usuario

### Entities: 0

### Endpoints: 0

### Dependencies
- `ScheduleModule` (NestJS) — condicional: `CRON_ENABLED=false` lo omite
- `GamificationModule` - Para misiones y achievements
- `NotificationsModule` - Para procesamiento de cola
- `ProgressModule` - Para reconciliacion de datos

---

## Module: teacher

### Purpose
Portal completo para profesores: gestion de estudiantes, calificaciones, analytics, alertas de riesgo, reportes, comunicacion y comparticion de recursos educativos.

### Controllers (10)
- `TeacherClassroomsController` - Gestion estudiantes en aulas
- `TeacherController` - Analytics, progreso, insights
- `TeacherGradesController` - Vista calificaciones
- `InterventionAlertsController` - Alertas intervencion
- `TeacherCommunicationController` - Mensajes y anuncios
- `TeacherContentController` - Contenido del profesor
- `ExerciseResponsesController` - Respuestas ejercicios
- `ManualReviewController` - Evaluaciones manuales
- `ResourceSharingController` - Comparticion de recursos (+7 endpoints)
- `TeacherReportsController` - Reportes generados

### Services (21)
- `StudentBlockingService` - Bloqueo/suspension de estudiantes
- `TeacherDashboardService` - Dashboard estadisticas
- `StudentProgressService` - Progreso estudiantes
- `GradingService` - Calificacion ejercicios
- `AnalyticsService` - Analytics con caching Redis
- `StudentRiskAlertService` - Alertas riesgo (CRON)
- `ReportsService` - Reportes PDF/Excel
- `TeacherClassroomsCrudService` - CRUD aulas
- `InterventionAlertsService` - Alertas intervencion
- `TeacherMessagesService` - Mensajes
- `TeacherContentService` - Contenido educativo del profesor
- `BonusCoinsService` - ML Coins bonus para estudiantes
- `ExerciseResponsesService` - Respuestas de ejercicios
- `StorageService` - Almacenamiento de archivos
- `TeacherReportsService` - Generacion de reportes
- `ManualReviewService` - Reviews manuales de ejercicios
- `RubricScoringService` - Puntuacion de rubricas
- `ResourceSharingService` - Comparticion de recursos (+7 endpoints)
- `ResourceRatingService` - Calificacion de recursos
- `ResourceCommentService` - Comentarios en recursos
- `ResourceDownloadService` - Descarga de recursos

### Guards (2)
- `TeacherGuard` - Verificar rol profesor
- `ClassroomOwnershipGuard` - Verificar acceso a aula

### Entities (9, 10 clases @Entity)
- `StudentInterventionAlert` - Alertas de intervencion (schema: progress)
- `Message` - Mensajes (schema: communication)
- `MessageParticipant` - Participantes en mensaje (schema: communication, mismo archivo que Message)
- `TeacherContent` - Contenido del profesor (schema: educational)
- `TeacherReport` - Reportes generados (schema: social)
- `ScheduledReport` - Reportes programados (schema: social)
- `SharedReport` - Reportes compartidos (schema: social)
- `ResourceRating` - Calificacion de recursos (schema: educational)
- `ResourceComment` - Comentarios en recursos (schema: educational)
- `ResourceDownload` - Descargas de recursos (schema: educational)

**Nota:** `message.entity.ts` contiene 2 @Entity classes (Message + MessageParticipant) — por eso 9 archivos = 10 clases.

### DTOs (23)
- Student progress DTOs
- Grading DTOs
- Communication DTOs
- Report filter DTOs
- ResourceSharing DTOs

### Endpoints: 117

### Dependencies
- `ProgressModule` - Para submissions y progreso
- `NotificationsModule` - Alertas a profesores
- `AuditModule` - Tracking de reviews
- `CacheModule` - Cache para analytics (Redis)
- `ScheduleModule` - CRON jobs de riesgo
- `MailModule` - Emails (transitivo)
- TypeORM: auth, social, progress, educational, gamification, communication

---

## Module: visualization

### Purpose
Visualizaciones, dashboards y reportes graficos sobre datos del data warehouse. **Importado condicionalmente** cuando `ENABLE_DATA_WAREHOUSE=true`.

### Controllers (4)
- `DashboardController` - Dashboards analiticos
- `ChartController` - Generacion de graficas
- `ReportController` - Reportes visuales
- `ExportController` - Exportacion de datos

### Services (4)
- `DashboardService` - Orquestacion de dashboards
- `ChartService` - Generacion de charts
- `ReportVisualizationService` - Reportes graficos
- `ExportService` - Exportacion PDF/Excel/CSV

### Entities: 0 (in-memory, sin datasource propio)

### Endpoints: 21 (condicionales)

### Estado: 50% — ENABLE_DATA_WAREHOUSE=false por defecto

### Dependencies
- En memoria — no requiere datasource adicional
- Consume datos via otros servicios (ETLModule, MLModule)

---

## Module: websocket

### Purpose
Comunicacion en tiempo real via Socket.IO 4.8+. Proporciona notificaciones push, updates de actividad estudiantil y comunicacion bidireccional.

### Gateway (1)
- `NotificationsGateway` - Gateway principal Socket.IO
  - Eventos: authenticated, mark_as_read, notification_read
  - Teacher events: subscribe_classroom, unsubscribe_classroom
  - Emitters: student_activity, classroom_update, new_submission, alert_triggered

### Services (2)
- `WebSocketService` - Helper para emision de eventos
- `MessagePersistenceService` - Persistencia de mensajes WebSocket

### Guards (1)
- `WsJwtGuard` - Autenticacion JWT para WebSocket

### Entities: 0

### Endpoints: 0 (WebSocket — no REST)

### Socket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `authenticated` | Server -> Client | Conexion autenticada |
| `mark_as_read` | Client -> Server | Marcar notificacion leida |
| `notification_read` | Server -> Client | Confirmacion lectura |
| `student_activity` | Server -> Client | Actividad estudiante |
| `classroom_update` | Server -> Client | Update de aula |
| `new_submission` | Server -> Client | Nueva entrega |
| `alert_triggered` | Server -> Client | Alerta disparada |
| `progress_update` | Server -> Client | Update progreso |
| `student_online` | Server -> Client | Estudiante conectado |
| `student_offline` | Server -> Client | Estudiante desconectado |
| `xp_gained` | Server -> Client | XP ganado en gamificacion |
| `achievement_unlocked` | Server -> Client | Logro desbloqueado |

### Dependencies
- `JwtModule` - Verificacion tokens
- `ConfigModule` - Configuracion

---

## Module Dependencies Graph

```
                              +-------------+
                              |   AppModule |
                              +------+------+
                                     |
        +----------------------------+----------------------------+
        |                            |                            |
        v                            v                            v
+-------+-------+           +--------+--------+          +--------+--------+
|   AuthModule  |           | GamificationMod |          |  ProgressModule |
| (Core Auth)   |           | (XP, Ranks...)  |          | (Tracking)      |
+-------+-------+           +--------+--------+          +--------+--------+
        |                            |                            |
        |                            |                            |
        v                            v                            v
+-------+-------+           +--------+--------+          +--------+--------+
|  ProfileMod   |           |   TasksModule   |<-------->| NotificationsM  |
+---------------+           | (Cron Jobs)     |          | (Multi-channel) |
                            +--------+--------+          +--------+--------+
+-------+-------+                    |                            |
|  ParentsMod   |                    |                            v
| (100% done)   |                    |                   +--------+--------+
+---------------+                    |                   |  WebSocketMod   |
                                     |                   | (Real-time)     |
                                     |                   +-----------------+
                                     |
        +----------------------------+----------------------------+
        |                            |                            |
        v                            v                            v
+-------+-------+           +--------+--------+          +--------+--------+
| EducationalM  |           |   SocialModule  |          |   AdminModule   |
| (Modules,     |           | (Classrooms,    |          | (Portal Admin)  |
|  Exercises)   |           |  Teams, Guilds) |          +--------+--------+
+-------+-------+           +--------+--------+                   |
        |                            |                            v
        v                            v                   +--------+--------+
+-------+-------+           +--------+--------+          |   AuditModule   |
| AssignmentsMod|           |  TeacherModule  |<-------->| (Logging)       |
+---------------+           | (Teacher Portal)|          +-----------------+
                            +-----------------+
                                     |
              +----------------------+--------------------+
              |                      |                    |
              v                      v                    v
     +--------+--------+    +--------+-------+    +------+-------+
     |   ContentModule |    | CommunicationM |    |   LtiModule  |
     | (Templates,     |    | (Conversations)|    | (LTI 1.3)    |
     |  Media Files)   |    +----------------+    +--------------+
     +-----------------+
              |
              v
     +--------+--------+
     |   MailModule    |
     | (transitivo)    |
     +-----------------+

[CONDICIONAL — ENABLE_DATA_WAREHOUSE=true]
+----------+   +----------+   +-----------------+
| ETLModule |   | MLModule |   |VisualizationMod |
+-----------+   +----------+   +-----------------+
```

### Dependency Summary

| Module | Depends On | Estado |
|--------|------------|--------|
| admin | TasksModule | 90% |
| assignments | - | 95% |
| audit | - | 100% |
| auth | MailModule | 100% |
| communication | - | 20% |
| content | - | 95% |
| educational | ProgressModule | 95% |
| etl | data_warehouse datasource (COND.) | 75% |
| gamification | - | 95% |
| health | - | 100% |
| lti | - | 75% |
| mail | - | 100% |
| ml | data_warehouse datasource (COND.) | 50% |
| notifications | WebSocketModule, MailModule | 90% |
| parents | NotificationsModule, MailModule | 100% |
| profile | - | 100% |
| progress | GamificationModule, NotificationsModule, MailModule, WebSocketModule | 90% |
| social | - | 60% |
| tasks | GamificationModule, NotificationsModule | 100% |
| teacher | ProgressModule, NotificationsModule, AuditModule, MailModule | 95% |
| visualization | ETLModule, MLModule (COND.) | 50% |
| websocket | - | 100% |

---

## Statistics Summary

| Metric | Count | Notas |
|--------|-------|-------|
| Total Modulos | 23 | 22 directorios + mail (transitivo) |
| Directorios fisicos | 22 | 18 importados directamente + 3 condicionales + mail |
| Total Entity Files | 156 | 157 @Entity classes (message.entity.ts tiene 2) |
| Total Controllers | 109 | +1 BoostController (2026-03-03) |
| Total Services | 173 | +1 BoostService (2026-03-03) |
| Total DTOs | 401 | Verified 2026-02-21 |
| REST Endpoints | 915 | 856 activos + 58 condicionales (data_warehouse) |
| WebSocket Events | 12+ | Socket.IO 4.8+ |
| Datasources TypeORM | 12 | 11 siempre activos + 1 condicional (data_warehouse) |
| Schemas PostgreSQL | 18 | 16 activos + 2 placeholder |
| Tablas PostgreSQL | 173 | Verified 2026-02-21 |
| Guards | 15 | 9 en modules/ + 6 en shared/ |
| Decorators | 18 | 18 symbols en 9 archivos |
| Interceptors | 6 | 2 globales (RLS, Audit) + 4 adicionales |
| Test Cases | 833 | 63 spec files |

> **SSOT:** `orchestration/inventarios/BACKEND_INVENTORY.yml` (v5.3.3) y `orchestration/inventarios/MASTER_INVENTORY.yml` (v14.9.4)

---

## Key Features by Module

### Authentication & Security
- JWT tokens con refresh
- Verificacion email
- Recuperacion contrasena
- RBAC (Role-Based Access Control)
- Audit logging global (interceptor POST/PUT/PATCH/DELETE)
- Rate limiting (ThrottlerGuard global)
- RLS (Row Level Security) via RlsInterceptor global
- Tracing (TracingInterceptor — OpenTelemetry + correlation IDs)
- LTI 1.3 para integracion con LMS externos

### Educational Content
- 23 tipos de ejercicios activos (comprension_auditiva en BACKLOG)
- 5 modulos educativos (Literal, Inferencial, Critica, Digital, Produccion)
- Rubricas de evaluacion
- Contenido multimedia
- Aprobacion de contenido
- Templates reutilizables

### Gamification
- Sistema rangos Maya (5 niveles)
- ML Coins (economia virtual, 3 categorias activas: consumables, cosmetics, boosts)
- 30+ achievements
- Misiones diarias/semanales (CRON: America/Mexico_City)
- Power-ups (comodines: pistas, vision_lectora, segunda_oportunidad)
- Boosts activos con TTL (BoostService + BoostController)
- Leaderboards (global, escuela, aula)
- Tienda virtual (31 items activos)
- Sistema de cosmeticos con visual_type slot (cosmetics vs frames)

### Progress Tracking
- Progreso por modulo
- Sesiones de aprendizaje
- Intentos y entregas con calificacion
- Certificados digitales
- Learning paths
- Mastery tracking
- Engagement metrics

### Social Features
- Aulas virtuales (core)
- Equipos colaborativos
- Desafios P2P
- Activity feed
- Friendships (backend listo, ~40 endpoints no conectados en frontend)
- Guilds (BACKLOG — categorias guild/social desactivadas en tienda)

### Real-time Communication
- WebSocket (Socket.IO 4.8+) notificaciones
- Push notifications (Web Push API VAPID)
- Multi-channel notifications (in-app, email, push, SMS parcial)
- Teacher portal real-time updates
- Parent portal notifications

### Analytics & Data Warehouse (Condicional)
- ETL pipeline para warehouse
- ML predictions (riesgo estudiantil, recomendaciones)
- Visualizaciones y dashboards
- Activo solo con `ENABLE_DATA_WAREHOUSE=true`
