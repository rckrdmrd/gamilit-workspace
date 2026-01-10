# Backend Modules Architecture

## Proyecto GAMILIT

**Fecha:** 2026-01-07
**Total modulos:** 14 (+2 auxiliares: health, mail)
**Total entidades:** 107
**Total endpoints REST:** 200+

---

## Overview

El backend de GAMILIT utiliza una arquitectura modular basada en **NestJS** con soporte para **multi-tenant** y **multi-schema** en PostgreSQL. Cada modulo encapsula funcionalidad especifica y puede conectarse a diferentes esquemas de base de datos segun su dominio.

### Arquitectura Multi-Schema

El sistema utiliza 8 datasources conectados a diferentes schemas de PostgreSQL:

| Datasource | Schema | Modulos |
|------------|--------|---------|
| `auth` | `auth_management` | auth, profile, admin |
| `educational` | `educational_content` | educational, assignments |
| `content` | `content_management` | content |
| `gamification` | `gamification_system` | gamification |
| `progress` | `progress_tracking` | progress |
| `social` | `social_features` | social |
| `audit` | `audit_logging` | audit |
| `notifications` | `notifications` | notifications |
| `communication` | `communication` | teacher (messages) |

---

## Module: admin

### Purpose
Portal administrativo completo para gestion de usuarios, organizaciones, contenido educativo, configuracion del sistema, reportes y monitoreo. Incluye funcionalidades de bulk operations, alertas del sistema y feature flags.

### Controllers (20)
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

### Services (21)
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

### Entities (15)
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

### Dependencies
- `TasksModule` (para MissionsCronService)
- TypeORM entities de: auth, educational, content, social, audit, progress

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

### Dependencies
- TypeORM: educational (Assignment, AssignmentExercise, AssignmentStudent, AssignmentSubmission)
- TypeORM: social (AssignmentClassroom)

---

## Module: audit

### Purpose
Sistema de audit logging para compliance y seguridad. Registra todas las acciones criticas del sistema.

### Controllers
- Ninguno (solo interceptor)

### Services (1)
- `AuditService` - Creacion y consulta de logs

### Interceptors (1)
- `AuditInterceptor` - Interceptor automatico de requests

### Entities (1)
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

### Dependencies
- TypeORM: audit (AuditLog)

---

## Module: auth

### Purpose
Autenticacion completa con JWT, gestion de sesiones, verificacion de email, recuperacion de contrasena y seguridad. Incluye sistema RBAC con roles y permisos.

### Controllers (3)
- `AuthController` - Login, logout, refresh tokens
- `PasswordController` - Recuperacion de contrasena
- `UsersController` - Gestion de usuarios

### Services (5)
- `AuthService` - Autenticacion core
- `SessionManagementService` - Gestion de sesiones
- `SecurityService` - Seguridad y validaciones
- `PasswordRecoveryService` - Recuperacion contrasena
- `EmailVerificationService` - Verificacion email

### Strategies (1)
- `JwtStrategy` - Passport JWT strategy

### Entities (14)
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

### DTOs (40)
- Login, Register, ChangePassword
- Create/Update User, Profile, Tenant
- Token management DTOs
- Role assignment DTOs
- Response DTOs

### Dependencies
- `MailModule` - Para envio de emails
- `PassportModule` - Strategies de autenticacion
- `JwtModule` - Manejo de tokens JWT
- TypeORM: auth (todas las entities)
- TypeORM: gamification (UserStats, etc. para getUserStatistics)
- TypeORM: progress (ExerciseSubmission)

---

## Module: content

### Purpose
Gestion de contenido educativo y multimedia. Incluye plantillas reutilizables, contenido curado sobre Marie Curie, y archivos multimedia.

### Controllers (5)
- `ContentTemplatesController` - Plantillas de contenido
- `MarieCurieContentController` - Contenido Marie Curie
- `MediaFilesController` - Archivos multimedia
- `ContentAuthorsController` - Autores de contenido
- `ContentCategoriesController` - Categorias jerarquicas

### Services (5)
- `ContentTemplatesService` - CRUD plantillas
- `MarieCurieContentService` - Contenido curado
- `MediaFilesService` - Gestion archivos
- `ContentAuthorsService` - Perfiles autores
- `ContentCategoriesService` - Categorias

### Entities (5)
- `ContentTemplate` - Plantillas reutilizables (5 tipos)
- `MarieCurieContent` - Contenido curado (9 categorias)
- `MediaFile` - Archivos multimedia (6 tipos)
- `ContentAuthor` - Perfiles de autores
- `ContentCategory` - Categorias jerarquicas

### DTOs (11)
- Create/Update DTOs para cada entity
- Response DTOs con relaciones
- Filter DTOs

### Dependencies
- TypeORM: content (todas las entities)

---

## Module: educational

### Purpose
Gestion de contenido educativo estructurado: modulos de aprendizaje, ejercicios (27+ tipos), recursos multimedia y rubricas de evaluacion.

### Controllers (4)
- `ModulesController` - API modulos educativos
- `ExercisesController` - API ejercicios
- `MediaController` - API recursos multimedia
- `MediaUploadController` - Subida de archivos

### Services (4)
- `ModulesService` - Gestion de modulos
- `ExercisesService` - Gestion de ejercicios
- `MediaService` - Gestion multimedia
- `MediaStorageService` - Almacenamiento archivos

### Entities (9)
- `Module` - Modulo educativo con contenido estructurado
- `Exercise` - Ejercicio (27+ tipos diferentes)
- `AssessmentRubric` - Rubrica de evaluacion
- `MediaResource` - Recurso multimedia
- `MediaAttachment` - Adjunto multimedia
- `ExerciseMechanicMapping` - Mapeo mecanicas
- `ContentApproval` - Aprobacion de contenido
- `DifficultyCriteria` - Criterios de dificultad
- `ClassroomModule` - Modulos asignados a aulas

### DTOs (2)
- CreateExerciseDto
- UpdateExerciseDto

### Dependencies
- `ProgressModule` - Para ExerciseSubmissionService
- TypeORM: educational (todas las entities)
- TypeORM: auth (Profile)
- TypeORM: social (ClassroomMember, AssignmentClassroom)

---

## Module: gamification

### Purpose
Sistema completo de gamificacion con rangos Maya, ML Coins (moneda virtual), achievements, misiones diarias/semanales, power-ups y leaderboards.

### Controllers (10)
- `UserStatsController` - Estadisticas de usuario
- `AchievementsController` - Logros
- `MLCoinsController` - Moneda virtual
- `RanksController` - Sistema de rangos
- `LeaderboardController` - Tablas de posiciones
- `MissionsController` - Misiones
- `MissionTemplatesController` - Plantillas de misiones
- `ClassroomMissionsController` - Misiones por aula
- `ComodinesController` - Power-ups/comodines
- `ShopController` - Tienda virtual

### Services (10)
- `UserStatsService` - XP, nivel, estadisticas
- `AchievementsService` - Logros desbloqueados
- `MLCoinsService` - Economia virtual
- `RanksService` - Rangos Maya (5 niveles)
- `LeaderboardService` - Rankings (global, escuela, aula)
- `MissionsService` - Misiones diarias/semanales
- `MissionTemplatesService` - Templates de misiones
- `ClassroomMissionsService` - Misiones colectivas
- `ComodinesService` - Power-ups (3 tipos)
- `ShopService` - Tienda con items

### Entities (18)
- `UserStats` - Estadisticas del jugador
- `UserRank` - Rango actual del usuario
- `Achievement` - Definicion de logros
- `UserAchievement` - Logros desbloqueados
- `AchievementCategory` - Categorias de logros
- `MLCoinsTransaction` - Transacciones de moneda
- `Mission` - Mision activa
- `MissionTemplate` - Plantilla de mision
- `ClassroomMission` - Mision de aula
- `ComodinesInventory` - Inventario power-ups
- `LeaderboardMetadata` - Metadata rankings
- `ActiveBoost` - Boosts activos
- `InventoryTransaction` - Transacciones inventario
- `ShopCategory` - Categorias tienda
- `ShopItem` - Items de tienda
- `UserPurchase` - Compras realizadas
- `MayaRankEntity` - Definicion rangos Maya
- `ComodinUsageLog` - Log uso comodines

### DTOs (2)
- CreateMissionDto
- MissionResponseDto

### Dependencies
- TypeORM: gamification (todas las entities)
- TypeORM: auth (Profile para leaderboards)
- TypeORM: progress (ExerciseSubmission para streaks)

---

## Module: notifications

### Purpose
Sistema de notificaciones multi-canal consolidado. Soporta notificaciones in-app, email y push (Web Push API nativo con VAPID).

### Controllers (5)
- `NotificationMultiChannelController` - Notificaciones multi-canal
- `NotificationPreferencesController` - Preferencias usuario
- `NotificationDevicesController` - Dispositivos push
- `NotificationTemplatesController` - Plantillas
- `NotificationsController` - Sistema basico

### Services (7)
- `NotificationService` - Core multi-canal
- `NotificationTemplateService` - Templates
- `NotificationPreferenceService` - Preferencias
- `NotificationQueueService` - Cola asincrona
- `UserDeviceService` - Dispositivos
- `PushNotificationService` - Web Push
- `NotificationsService` - Sistema basico

### Entities (7)
**Sistema Multi-Canal (schema: notifications):**
- `NotificationTemplate` - Plantillas reutilizables
- `Notification` - Notificacion multi-canal
- `NotificationPreference` - Preferencias por tipo
- `NotificationLog` - Registro de envios
- `NotificationQueue` - Cola procesamiento
- `UserDevice` - Dispositivos push

**Sistema Basico (schema: gamification_system):**
- `Notification` (basic) - Notificaciones simples

### DTOs (4)
- CreateNotificationDto
- NotificationResponseDto
- UpdatePreferencesDto
- RegisterDeviceDto

### Dependencies
- `WebSocketModule` - Notificaciones en tiempo real
- `MailModule` - Notificaciones por email
- TypeORM: notifications (entities multi-canal)
- TypeORM: gamification (Notification basica)

---

## Module: profile

### Purpose
Gestion de perfiles de usuario: informacion personal, preferencias y avatares.

### Controllers (1)
- `ProfileController` - 3 endpoints REST

### Services (1)
- `ProfileService` - CRUD de perfiles

### Entities
- Usa `Profile` de AuthModule

### DTOs (1)
- UpdateProfileDto

### Dependencies
- TypeORM: auth (Profile)

---

## Module: progress

### Purpose
Tracking de progreso de estudiantes: modulos completados, sesiones de aprendizaje, intentos y entregas de ejercicios, misiones programadas, certificados digitales.

### Controllers (6)
- `ModuleProgressController` - 10 endpoints
- `LearningSessionController` - 8 endpoints
- `ExerciseAttemptController` - 9 endpoints
- `ExerciseSubmissionController` - 11 endpoints
- `ScheduledMissionController` - 9 endpoints
- `CertificateController` - 7 endpoints (EPIC 10.2)

**Total: 54 endpoints REST**

### Services (8)
- `ModuleProgressService` - Progreso por modulo (11 metodos)
- `LearningSessionService` - Sesiones (8 metodos)
- `ExerciseAttemptService` - Intentos (12 metodos)
- `ExerciseSubmissionService` - Entregas (13 metodos)
- `ScheduledMissionService` - Misiones (13 metodos)
- `CertificateService` - Certificados
- `PendingActivitiesService` - Actividades pendientes
- `RecentActivityService` - Actividad reciente

### Entities (15)
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
- `TeacherIntervention` - Intervenciones
- `Certificate` - Certificados digitales

### DTOs (18)
- Create/Update DTOs para cada entity
- Progress response DTOs
- Submission grading DTOs

### Dependencies
- `GamificationModule` - Para recompensas (MLCoins, XP)
- `NotificationsModule` - Notificaciones a profesores
- `MailModule` - Emails
- `WebSocketModule` - Updates en tiempo real
- TypeORM: progress (todas las entities)
- TypeORM: educational (Module, Exercise)
- TypeORM: auth (Profile)

---

## Module: social

### Purpose
Caracteristicas sociales: amistades, escuelas, aulas virtuales, equipos colaborativos y desafios peer-to-peer.

### Controllers (10)
- `FriendshipsController` - 10 endpoints
- `SchoolsController` - 8 endpoints
- `ClassroomsController` - 12 endpoints
- `ClassroomMembersController` - 10 endpoints
- `TeamsController` - 13 endpoints
- `TeamMembersController` - 8 endpoints
- `TeamChallengesController` - 9 endpoints
- `PeerChallengesController` - 16 endpoints
- `ChallengeParticipantsController` - 15 endpoints
- `UserActivitiesController` - 5 endpoints (Activity Feed)

**Total: 106 endpoints REST**

### Services (10)
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

### Entities (15)
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

### DTOs (27)
- CRUD DTOs para cada entity
- Filter y pagination DTOs
- Challenge response DTOs

### Dependencies
- TypeORM: social (todas las entities)

---

## Module: tasks

### Purpose
Tareas programadas y cron jobs para la aplicacion.

### Controllers
- Ninguno

### Services (2)
- `MissionsCronService` - Generacion automatica de misiones
- `NotificationsCronService` - Procesamiento cola notificaciones

### Entities
- Ninguna propia

### Dependencies
- `ScheduleModule` (NestJS)
- `GamificationModule` - Para misiones
- `NotificationsModule` - Para notificaciones

---

## Module: teacher

### Purpose
Portal completo para profesores: gestion de estudiantes, calificaciones, analytics, alertas de riesgo, reportes y comunicacion.

### Controllers (8)
- `TeacherClassroomsController` - Gestion estudiantes en aulas
- `TeacherController` - Analytics, progreso, insights
- `TeacherGradesController` - Vista calificaciones
- `InterventionAlertsController` - Alertas intervencion
- `TeacherCommunicationController` - Mensajes y anuncios
- `TeacherContentController` - Contenido del profesor
- `ExerciseResponsesController` - Respuestas ejercicios
- `ManualReviewController` - Evaluaciones manuales

### Services (17)
- `StudentBlockingService` - Bloqueo estudiantes
- `TeacherDashboardService` - Dashboard estadisticas
- `StudentProgressService` - Progreso estudiantes
- `GradingService` - Calificacion ejercicios
- `AnalyticsService` - Analytics con caching
- `StudentRiskAlertService` - Alertas riesgo (CRON)
- `ReportsService` - Reportes PDF/Excel
- `TeacherClassroomsCrudService` - CRUD aulas
- `InterventionAlertsService` - Alertas intervencion
- `TeacherMessagesService` - Mensajes
- `TeacherContentService` - Contenido
- `BonusCoinsService` - ML Coins bonus
- `ExerciseResponsesService` - Respuestas
- `StorageService` - Almacenamiento
- `TeacherReportsService` - Reportes
- `ManualReviewService` - Reviews manuales
- `RubricScoringService` - Puntuacion rubricas

### Guards (2)
- `TeacherGuard` - Verificar rol profesor
- `ClassroomOwnershipGuard` - Verificar acceso aula

### Entities (4)
- `StudentInterventionAlert` - Alertas intervencion
- `Message` - Mensajes
- `MessageParticipant` - Participantes mensaje
- `TeacherContent` - Contenido profesor
- `TeacherReport` - Reportes generados

### DTOs (17)
- Student progress DTOs
- Grading DTOs
- Communication DTOs
- Report filter DTOs

### Dependencies
- `ProgressModule` - Para submissions
- `NotificationsModule` - Alertas a profesores
- `AuditModule` - Tracking de reviews
- `CacheModule` - Cache para analytics
- `ScheduleModule` - CRON jobs
- TypeORM: auth, social, progress, educational, gamification, communication

---

## Module: websocket

### Purpose
Comunicacion en tiempo real via Socket.IO. Proporciona notificaciones push, updates de actividad estudiantil y comunicacion bidireccional.

### Gateway (1)
- `NotificationsGateway` - Gateway principal Socket.IO
  - Eventos: authenticated, mark_as_read, notification_read
  - Teacher events: subscribe_classroom, unsubscribe_classroom
  - Emitters: student_activity, classroom_update, new_submission, alert_triggered

### Services (1)
- `WebSocketService` - Servicio helper para emitir eventos

### Guards (1)
- `WsJwtGuard` - Autenticacion JWT para WebSocket

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
                                     |                            |
                                     |                            v
                                     |                   +--------+--------+
                                     |                   |  WebSocketMod   |
                                     |                   | (Real-time)     |
                                     |                   +-----------------+
                                     |
        +----------------------------+----------------------------+
        |                            |                            |
        v                            v                            v
+-------+-------+           +--------+--------+          +--------+--------+
| EducationalM  |           |   SocialModule  |          |   AdminModule   |
| (Modules,     |           | (Classrooms,    |          | (Portal Admin)  |
|  Exercises)   |           |  Teams...)      |          +--------+--------+
+-------+-------+           +--------+--------+                   |
        |                            |                            v
        v                            v                   +--------+--------+
+-------+-------+           +--------+--------+          |   AuditModule   |
| AssignmentsMod|           |  TeacherModule  |<-------->| (Logging)       |
+---------------+           | (Teacher Portal)|          +-----------------+
                            +-----------------+
                                     |
                                     v
                            +--------+--------+
                            |   ContentModule |
                            | (Templates,     |
                            |  Media Files)   |
                            +-----------------+
                                     |
                                     v
                            +--------+--------+
                            |   MailModule    |
                            | (Email service) |
                            +-----------------+
```

### Dependency Summary

| Module | Depends On |
|--------|------------|
| admin | TasksModule |
| auth | MailModule |
| assignments | - |
| audit | - |
| content | - |
| educational | ProgressModule |
| gamification | - |
| notifications | WebSocketModule, MailModule |
| profile | - |
| progress | GamificationModule, NotificationsModule, MailModule, WebSocketModule |
| social | - |
| tasks | GamificationModule, NotificationsModule |
| teacher | ProgressModule, NotificationsModule, AuditModule |
| websocket | - |

---

## Statistics Summary

| Metric | Count |
|--------|-------|
| Total Modules | 14 (+2 auxiliares) |
| Total Entities | 107 |
| Total Controllers | 75+ |
| Total Services | 100+ |
| Total DTOs | 130+ |
| REST Endpoints | 200+ |
| WebSocket Events | 10+ |
| Database Schemas | 8 |

---

## Key Features by Module

### Authentication & Security
- JWT tokens con refresh
- Verificacion email
- Recuperacion contrasena
- RBAC (Role-Based Access Control)
- Audit logging
- Rate limiting

### Educational Content
- 27+ tipos de ejercicios
- Rubricas de evaluacion
- Contenido multimedia
- Aprobacion de contenido
- Templates reutilizables

### Gamification
- Sistema rangos Maya (5 niveles)
- ML Coins (economia virtual)
- 30+ achievements
- Misiones diarias/semanales
- Power-ups (comodines)
- Leaderboards (global, escuela, aula)
- Tienda virtual

### Progress Tracking
- Progreso por modulo
- Sesiones de aprendizaje
- Intentos y entregas
- Certificados digitales
- Learning paths
- Mastery tracking

### Social Features
- Amistades
- Equipos colaborativos
- Aulas virtuales
- Desafios P2P
- Activity feed

### Real-time Communication
- WebSocket notifications
- Push notifications (Web Push API)
- Multi-channel notifications
- Teacher portal real-time updates
