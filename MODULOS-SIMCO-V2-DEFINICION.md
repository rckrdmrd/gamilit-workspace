# Módulos SIMCO v2 - Definición Oficial

**Fecha:** 2025-11-07
**Versión:** 2.0
**Propósito:** Definición autoritativa de módulos funcionales del sistema GAMILIT

---

## Módulos Identificados (11 módulos)

### M-AUTH: Autenticación y Autorización
**Responsabilidad:** Gestión de identidad, roles, permisos, sesiones y OAuth

**Entidades de DB (30 objetos):**
- Schema: `auth`, `auth_management`
- Tablas: users, user_profiles, roles, permissions, role_permissions, sessions, oauth_providers
- Triggers: trg_users_audit, trg_update_user_updated_at
- Funciones: get_current_user_id, get_current_user_role, is_admin, validate_email_format, validate_username
- Views: user_stats_summary, active_sessions

**Backend (1 módulo, 48 archivos):**
- Module: `auth`
- Controllers: 2 (auth.controller, session.controller)
- Services: 5 (auth.service, session.service, oauth.service, rbac.service, password.service)
- Entities: 10 (User, UserProfile, Role, Permission, Session, OAuthProvider, etc.)
- DTOs: 31 (LoginDto, RegisterDto, UpdateProfileDto, ChangePasswordDto, etc.)

**Frontend (1 feature, 13 componentes):**
- Feature: `auth`
- Componentes: LoginForm, RegisterForm, PasswordStrengthMeter, AuthProvider, PermissionMatrix, RoleSelector, SessionsList, etc.

**Documentos (6 docs):**
- RF-AUTH-001: Roles y Permisos
- RF-AUTH-002: Estados de Cuenta
- RF-AUTH-003: OAuth
- ET-AUTH-001: RBAC
- ET-AUTH-002: Estados de Cuenta
- ET-AUTH-003: OAuth

---

### M-GAM: Gamificación
**Responsabilidad:** Achievements, rangos maya, economía ML-Coins, misiones, comodines, leaderboards

**Entidades de DB (65 objetos):**
- Schema: `gamification_system`
- Tablas: achievements, user_achievements, maya_ranks, user_ranks, ml_coins_transactions, ml_coins_balances, missions, user_missions, powerups, user_powerups, leaderboard_entries, streaks
- Triggers: 15+ (actualización de stats, logs de transacciones, etc.)
- Funciones: award_achievement, update_rank, add_ml_coins, deduct_ml_coins, calculate_leaderboard, etc.
- Índices: GIN para analytics, BTREE para queries frecuentes

**Backend (3 módulos, 60+ archivos):**
- Modules: `gamification`, `missions`, `powerups`
- Controllers: 7 (achievements, ranks, economy, missions, powerups, leaderboard, streaks)
- Services: 7 (achievements, ranks, economy, missions, powerups, leaderboard, streaks)
- Entities: 12 (Achievement, UserAchievement, MayaRank, UserRank, MLCoinTransaction, Mission, PowerUp, etc.)
- DTOs: 30 (CreateAchievementDto, AwardAchievementDto, AddCoinsDto, CreateMissionDto, etc.)

**Frontend (1 feature, 71 componentes):**
- Feature: `gamification`
- Sub-features: social (achievements, friends, guilds, leaderboards, powerups), ranks, economy, missions, streak
- Componentes: 71 total (AchievementCard, RankBadge, CoinWallet, MissionCard, PowerUpShop, Leaderboard, etc.)

**Documentos (6 docs):**
- RF-GAM-001: Achievements
- RF-GAM-002: Comodines
- RF-GAM-003: Rangos Maya
- ET-GAM-001: Achievements
- ET-GAM-002: Economía ML-Coins
- ET-GAM-003: Rangos Maya

---

### M-EDU: Contenido Educativo
**Responsabilidad:** Módulos educativos, mecánicas de ejercicios, taxonomía de Bloom, niveles de dificultad

**Entidades de DB (12 objetos):**
- Schema: `educational_content`
- Tablas: modules, exercises, mechanics, difficulty_levels, bloom_taxonomy, exercise_templates
- Funciones: get_exercise_by_id, get_module_exercises, validate_exercise_solution

**Backend (2 módulos, 18+ archivos):**
- Modules: `educational`, `tasks`
- Controllers: 3 (modules, exercises, mechanics)
- Services: 5 (modules, exercises, mechanics, difficulty, bloom)
- Entities: 4 (Module, Exercise, Mechanic, DifficultyLevel)
- DTOs: 8 (CreateModuleDto, CreateExerciseDto, etc.)

**Frontend (3 features, 68 componentes):**
- Features: `exercises`, `mechanics`, `progress`
- Exercises: MultipleChoice, DragDrop, Matching, FillBlank, TrueFalse, Ordering (8 componentes)
- Mechanics: 60 componentes distribuidos en 5 módulos
  - Módulo 1 (7): VerdaderoFalso, Crucigrama, Emparejamiento, MapaConceptual, SopaLetras, Timeline, CompletarEspacios
  - Módulo 2 (5): DetectiveTextual, ConstruccionHipotesis, RuedaInferencias, PrediccionNarrativa, PuzzleContexto
  - Módulo 3 (5): AnalisisFuentes, DebateDigital, MatrizPerspectivas, PodcastArgumentativo, TribunalOpiniones
  - Módulo 4 (9): VerificadorFakeNews, InfografiaInteractiva, NavegacionHipertextual, QuizTikTok, AnalisisMemes, ChatLiterario, EmailFormal, EnsayoArgumentativo, ResenaCritica
  - Módulo 5 (3): ComicDigital, DiarioMultimedia, VideoCarta
  - Auxiliares (4): CallToAction, CollagePrensa, ComprensiónAuditiva, TextoEnMovimiento

**Documentos (6 docs):**
- RF-EDU-001: Mecánicas de Ejercicios
- RF-EDU-002: Niveles de Dificultad
- RF-EDU-003: Taxonomía de Bloom
- ET-EDU-001: Mecánicas de Ejercicios
- ET-EDU-002: Niveles de Dificultad
- ET-EDU-003: Taxonomía de Bloom

---

### M-PRG: Progreso y Seguimiento
**Responsabilidad:** Tracking de módulos, sesiones de aprendizaje, intentos/submissions de ejercicios, misiones programadas

**Entidades de DB (20 objetos):**
- Schema: `progress_tracking`
- Tablas: module_progress, learning_sessions, exercise_attempts, exercise_submissions, scheduled_missions
- Triggers: 3 (actualización de stats, timestamps)
- Funciones: calculate_module_progress, get_user_progress, record_exercise_attempt, update_mission_progress, get_classroom_analytics
- Views: user_progress_summary
- Índices: GIN para analytics
- RLS Policies: 2 (enable RLS, progress policies)

**Backend (1 módulo, 40+ archivos):**
- Module: `progress`
- Controllers: 5 (module_progress, learning_session, exercise_attempt, exercise_submission, scheduled_mission)
- Services: 7 (module_progress, learning_session, exercise_attempt, exercise_submission, scheduled_mission, pending_activities, recent_activity)
- Entities: 5 (ModuleProgress, LearningSession, ExerciseAttempt, ExerciseSubmission, ScheduledMission)
- DTOs: 12 (CreateModuleProgressDto, CreateLearningSessionDto, etc.)

**Frontend:** Integrado en `exercises` y `progress` features

**Documentos (4 docs):**
- RF-PRG-001: Estados de Progreso
- RF-PRG-002: Análisis de Desempeño
- ET-PRG-001: Estados de Progreso
- ET-PRG-002: Análisis de Desempeño

---

### M-SOC: Características Sociales
**Responsabilidad:** Aulas virtuales, equipos colaborativos, sistema de amigos, interacciones sociales

**Entidades de DB (21 objetos):**
- Schema: `social_features`
- Tablas: classrooms, classroom_members, teams, team_members, friendships, friend_requests, social_interactions
- Triggers: actualización de member_count, timestamps
- Funciones: update_classroom_member_count, add_friend, remove_friend

**Backend (1 módulo, 37+ archivos):**
- Module: `social`
- Controllers: 7 (classrooms, teams, friends, guilds, interactions, challenges, invitations)
- Services: 7 (classrooms, teams, friends, guilds, interactions, challenges, invitations)
- Entities: 7 (Classroom, ClassroomMember, Team, TeamMember, Friendship, FriendRequest, SocialInteraction)
- DTOs: 16 (CreateClassroomDto, JoinClassroomDto, CreateTeamDto, AddFriendDto, etc.)

**Frontend (gamification/social, 42 componentes):**
- Achievements (6): AchievementCard, AchievementNotification, AchievementUnlockModal, AchievementsList, ProgressTreeVisualizer, TrophyRoom
- Friends (7): ActivityFeed, AddFriend, FriendCard, FriendRecommendations, FriendRequests, FriendSearch, FriendsList
- Guilds (9): GuildCard, GuildChallenges, GuildCreation, GuildDashboard, GuildLeaderboard, GuildManagement, GuildMembersList, GuildSettings, GuildsList
- Leaderboards (13): GlobalLeaderboard, SchoolLeaderboard, GradeLeaderboard, FriendsLeaderboard, etc.
- PowerUps (6): PowerUpCard, PowerUpShop, PowerUpInventory, etc.

**Documentos (6 docs):**
- RF-SOC-001: Aulas Virtuales
- RF-SOC-002: Equipos Colaborativos
- RF-SOC-003: Sistema de Amigos
- ET-SOC-001: Aulas Virtuales
- ET-SOC-002: Equipos Colaborativos
- ET-SOC-003: Sistema de Amigos

---

### M-NOT: Notificaciones
**Responsabilidad:** Sistema de notificaciones en tiempo real, preferencias de notificaciones, templates

**Entidades de DB:**
- Schema: integrado en múltiples schemas
- Tablas: notifications, notification_preferences, notification_templates

**Backend (3 módulos, 5+ archivos):**
- Modules: `notifications`, `mail`, `websocket`
- Controllers: 1 (notifications)
- Services: 1 (notifications)
- Entities: 1 (Notification)
- DTOs: 4 (CreateNotificationDto, UpdatePreferencesDto, etc.)

**Frontend (1 feature, 2 componentes):**
- Feature: `notifications`
- Componentes: NotificationBell, NotificationDropdown

**Documentos (4 docs):**
- RF-NOT-001: Tipos de Notificaciones
- RF-NOT-002: Preferencias de Notificaciones
- ET-NOT-001: Tipos de Notificaciones
- ET-NOT-002: Preferencias de Notificaciones

---

### M-CNT: Gestión de Contenido y Media
**Responsabilidad:** Gestión de multimedia, storage, CDN, tipos de media, procesamiento

**Entidades de DB (11 objetos):**
- Schema: `storage`, `content_management`
- Tablas: media_files, media_metadata, media_processing_queue, cdn_cache
- Funciones: upload_media, process_media, get_media_url

**Backend (1 módulo, 15+ archivos):**
- Module: `content`
- Controllers: 3 (media, upload, cdn)
- Services: 3 (media, upload, cdn)
- Entities: 3 (MediaFile, MediaMetadata, ProcessingQueue)
- DTOs: 6 (UploadMediaDto, ProcessMediaDto, etc.)

**Frontend:** Integrado en múltiples features (ejercicios, mecánicas)

**Documentos (6 docs):**
- RF-CNT-001: Gestión de Media
- RF-CNT-002: Tipos de Media y Procesamiento
- RF-CNT-003: Storage y CDN
- ET-CNT-001: Gestión de Media
- ET-CNT-002: Tipos de Media y Procesamiento
- ET-CNT-003: Storage y CDN

---

### M-AUD: Auditoría
**Responsabilidad:** Sistema de auditoría, logging de eventos, alertas, retención de datos

**Entidades de DB (9 objetos):**
- Schema: `audit_logging`
- Tablas: audit_logs, system_logs, user_activity_logs, performance_metrics, system_alerts, user_activity
- Triggers: trg_system_alerts_updated_at
- Funciones: log_audit_event
- RLS Policies: policies

**Backend (1 módulo, 3+ archivos):**
- Module: `audit`
- Services: 1 (audit)
- Entities: 1 (AuditLog)
- DTOs: 1 (CreateAuditLogDto)

**Frontend:** Integrado en admin dashboard

**Documentos (7 docs):**
- RF-AUD-001: Sistema de Auditoría
- RF-AUD-002: Alertas y Notificaciones
- RF-AUD-003: Niveles de Logging
- RF-AUD-004: Retención de Datos
- ET-AUD-001: Sistema de Auditoría
- ET-AUD-002: Alertas y Notificaciones
- ET-AUD-003: Niveles de Logging

---

### M-CFG: Configuración del Sistema
**Responsabilidad:** Configuraciones globales, feature flags, configuraciones de módulos

**Entidades de DB (19 objetos):**
- Schema: `system_configuration`
- Tablas: app_settings, feature_flags, module_configurations
- Funciones: get_setting, update_setting, is_feature_enabled

**Backend:** Integrado en `core` module

**Frontend:** Integrado en admin dashboard

**Documentos (1 doc):**
- RF-CFG-001: Sistema de Configuración

---

### M-TCH: Portal de Profesores
**Responsabilidad:** Dashboard de profesores, analytics, calificaciones, asignaciones, notas

**Entidades de DB:**
- Schema: `public` (legacy), migrando a `teacher_portal`
- Tablas: assignments, assignment_students, assignment_classrooms, assignment_submissions, teacher_notes

**Backend (2 módulos, 20+ archivos):**
- Modules: `teacher`, `assignments`
- Controllers: 2 (teacher, assignments)
- Services: 5 (teacher_dashboard, analytics, student_progress, grading, assignments)
- Entities: 3 (Assignment, AssignmentSubmission, AssignmentClassroom)
- DTOs: 8 (CreateAssignmentDto, GradingDto, AnalyticsDto, TeacherNotesDto, etc.)

**Frontend:** Portal dedicado (pendiente de migración)

**Documentos (6 docs):**
- REQ-TEACHER-CLASSROOMS
- REQ-TEACHER-ASSIGNMENTS
- REQ-TEACHER-GRADING-PROGRESS
- REQ-TEACHER-ANALYTICS
- ET-TEACHER-* (pendientes)

---

### M-ADM: Portal de Administración
**Responsabilidad:** Gestión de usuarios, organizaciones, contenido, sistema, moderación

**Entidades de DB (4 objetos):**
- Schema: `admin_dashboard`
- Views: user_stats_summary, organization_stats_summary, moderation_queue, recent_admin_actions

**Backend (2 módulos, 30+ archivos):**
- Modules: `admin`, `core`
- Controllers: 4 (users, organizations, content, system)
- Services: 4 (users, organizations, content, system)
- DTOs: 30 (CreateUserDto, UpdateOrganizationDto, ModerateContentDto, etc.)

**Frontend:** Portal dedicado (pendiente de migración)

**Documentos (6 docs):**
- REQ-ADMIN-USUARIOS
- REQ-ADMIN-ORGANIZACIONES
- REQ-ADMIN-CONTENIDO
- REQ-ADMIN-SISTEMA
- ET-ADMIN-* (pendientes)

---

## Resumen de Cobertura

| Módulo | DB Objs | BE Files | FE Comps | Docs RF | Docs ET | Total Docs |
|--------|---------|----------|----------|---------|---------|------------|
| M-AUTH | 30      | 48       | 13       | 3       | 3       | 6          |
| M-GAM  | 65      | 60+      | 71       | 3       | 3       | 6          |
| M-EDU  | 12      | 18+      | 68       | 3       | 3       | 6          |
| M-PRG  | 20      | 40+      | ~10      | 2       | 2       | 4          |
| M-SOC  | 21      | 37+      | 42       | 3       | 3       | 6          |
| M-NOT  | ~5      | 5+       | 2        | 2       | 2       | 4          |
| M-CNT  | 11      | 15+      | ~20      | 3       | 3       | 6          |
| M-AUD  | 9       | 3+       | ~5       | 4       | 3       | 7          |
| M-CFG  | 19      | ~5       | ~3       | 1       | 0       | 1          |
| M-TCH  | ~10     | 20+      | 0        | 5       | 0       | 5          |
| M-ADM  | 4       | 30+      | 0        | 4       | 0       | 4          |
| **TOTAL** | **206+** | **281+** | **234+** | **33** | **22** | **55** |

---

## Decisiones de Mapeo

### Cross-Module Dependencies
- `gamilit` schema contiene funciones globales (get_current_user_id, now_mexico, update_updated_at_column) → mantener como utilidades compartidas
- RLS policies distribuidas entre módulos → consolidar por módulo
- Triggers de auditoría → M-AUD
- Triggers de timestamps → funciones compartidas

### Entidades Compartidas
- `users` y `user_profiles` → M-AUTH (fuente de verdad)
- User stats → M-PRG (tracking)
- Social interactions → M-SOC

### Frontend Features sin módulo directo
- `mechanics` → M-EDU (mecánicas educativas)
- `exercises` → M-EDU (ejercicios)
- `progress` → M-PRG (visualización de progreso)

---

## Próximos Pasos

1. Crear estructura `docs/modules/<MOD>/` para los 11 módulos
2. Migrar documentos RF/ET a nuevas ubicaciones con IDs SIMCO v2
3. Generar `trace.yml` por módulo con trazabilidad completa
4. Crear `code-map.md` con OBJ IDs
5. Generar `kanban.md` por módulo
6. Crear registros globales en `docs/_registry/`

