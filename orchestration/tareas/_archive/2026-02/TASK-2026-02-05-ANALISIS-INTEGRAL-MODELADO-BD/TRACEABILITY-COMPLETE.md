# TRACEABILITY COMPLETE - EPICs → Schemas → Tablas → Entities → Controllers

**Tarea:** TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD
**Fase:** FASE-4 - TAREA 4.1.2
**Fecha:** 2026-02-05
**Agente:** Compilacion consolidada SA-F4-04 (Traceability)

---

## RESUMEN

| Metrica | Valor |
|---------|-------|
| EPICs mapeadas | 22 (8 FASE-1 + 3 FASE-2 + 11 FASE-3) |
| Schemas cubiertos | 16 activos |
| Tablas DDL referenciadas | 171 |
| FK relationships catalogadas | 299 |

---

## FASE 1: ALCANCE INICIAL (EAI-001 a EAI-008)

### EAI-001: Fundamentos (Autenticacion, Roles, Multi-Tenancy)

| Capa | Objetos |
|------|---------|
| **Schemas** | `auth`, `auth_management` |
| **Tablas DDL** | auth.users, profiles, tenants, roles, user_roles, auth_providers, auth_attempts, email_verification_tokens, password_reset_tokens, security_events, user_preferences, memberships, user_sessions, user_suspensions, two_factor_tokens |
| **Entities** | User, Profile, Tenant, Role, UserRole, AuthProvider, AuthAttempt, EmailVerificationToken, PasswordResetToken, SecurityEvent, UserPreference, Membership, UserSession, UserSuspension, TwoFactorToken |
| **Controllers** | AuthController, UsersController, TenantsController, RolesController |
| **Estado** | COMPLETADA - 17 tablas, 15 entities (auth_attempts sin entity dedicado) |

### EAI-002: Actividades y Contenido Educativo

| Capa | Objetos |
|------|---------|
| **Schemas** | `educational_content`, `progress_tracking` |
| **Tablas DDL** | modules, exercises, difficulty_criteria, exercise_mechanic_mapping, module_dependencies, assessment_rubrics, media_resources, media_attachments, content_tags, content_approvals, exercise_validation_audits, teacher_contents, teacher_content_versions |
| **Entities** | Module, Exercise, DifficultyLevel, AssessmentRubric, MediaResource, MediaAttachment, ContentTag, ContentApproval, TeacherContent, TeacherContentVersion, ExerciseValidationAudit |
| **Controllers** | ModulesController, ExercisesController, AssessmentRubricsController, TeacherContentController |
| **Estado** | COMPLETADA - 13 tablas, 11 entities |

### EAI-003: Gamificacion Basica (XP, Coins, Ranks, Logros, Tienda)

| Capa | Objetos |
|------|---------|
| **Schemas** | `gamification_system` |
| **Tablas DDL** | maya_ranks, user_stats, user_ranks, achievements, user_achievements, ml_coins_transactions, comodines_inventory, comodin_usage_log, comodin_usage_tracking, comodin_uses, active_boosts, inventory_transactions, missions, mission_templates, classroom_missions, shop_categories, shop_items, user_purchases |
| **Entities** | MayaRank, UserStats, UserRank, Achievement, UserAchievement, MlCoinsTransaction, ComodinInventory, ComodinUsageLog, ComodinUsageTracking, ActiveBoost, InventoryTransaction, Mission, MissionTemplate, ClassroomMission, ShopCategory, ShopItem, UserPurchase |
| **Controllers** | GamificationController, AchievementsController, ShopController, MissionsController, RanksController |
| **Estado** | COMPLETADA - 18 tablas, 17 entities (comodin_uses sin entity = H-017) |

### EAI-004: Analytics y Metricas Basicas

| Capa | Objetos |
|------|---------|
| **Schemas** | `progress_tracking`, `admin_dashboard`, `audit_logging` |
| **Tablas DDL** | module_progress, exercise_attempts, exercise_submissions, learning_sessions, engagement_metrics, progress_snapshots, user_activity_logs, activity_logs, performance_metrics |
| **Entities** | ModuleProgress, ExerciseAttempt, ExerciseSubmission, LearningSession, EngagementMetric, ProgressSnapshot, UserActivityLog, ActivityLog, PerformanceMetric |
| **Controllers** | ProgressController, AnalyticsController, DashboardController |
| **Estado** | COMPLETADA - 9 tablas core, entities alineados |

### EAI-005: Administracion Base (Aulas, Grupos, Asignaciones)

| Capa | Objetos |
|------|---------|
| **Schemas** | `social_features`, `educational_content` |
| **Tablas DDL** | classrooms, classroom_members, teacher_classrooms, schools, assignments, assignment_exercises, assignment_students, assignment_submissions, assignment_classrooms, classroom_modules |
| **Entities** | Classroom, ClassroomMember, TeacherClassroom, School, Assignment, AssignmentExercise, AssignmentStudent, AssignmentSubmission, AssignmentClassroom, ClassroomModule |
| **Controllers** | ClassroomsController, AssignmentsController, SchoolsController |
| **Estado** | COMPLETADA - 10 tablas, 10 entities (assignment_students 17% match = H-023) |

### EAI-006: Configuracion del Sistema

| Capa | Objetos |
|------|---------|
| **Schemas** | `system_configuration` |
| **Tablas DDL** | system_settings, gamification_parameters, feature_flags, rate_limits, tenant_configurations, api_configurations, environment_configs, notification_settings, notification_settings_globals |
| **Entities** | SystemSetting, GamificationParameter, FeatureFlag, RateLimit, TenantConfiguration, ApiConfiguration, EnvironmentConfig, NotificationSetting, NotificationSettingGlobal |
| **Controllers** | SettingsController, FeatureFlagsController |
| **Estado** | COMPLETADA - 9 tablas, 9 entities (100% column match) |

### EAI-007: Modulos M4 y M5

| Capa | Objetos |
|------|---------|
| **Schemas** | `educational_content`, `progress_tracking` |
| **Tablas DDL** | Reutiliza exercises, module_progress + manual_reviews, skill_assessments |
| **Entities** | ManualReview, SkillAssessment |
| **Controllers** | ManualReviewsController |
| **Estado** | PARCIAL (FASE-2 robustecimiento) |

### EAI-008: Portal de Administracion

| Capa | Objetos |
|------|---------|
| **Schemas** | `admin_dashboard`, `audit_logging` |
| **Tablas DDL** | bulk_operations, admin_reports, metrics_history, system_alerts, system_logs, audit_logs |
| **Views MV** | system_overview_mv, user_analytics_mv, classroom_summary_mv |
| **Entities** | BulkOperation, AdminReport, MetricsHistory, SystemAlert, SystemLog, AuditLog |
| **Controllers** | AdminController, AuditController, AlertsController |
| **Estado** | COMPLETADA - 6 tablas + 3 MVs, entities completos |

---

## FASE 2: ROBUSTECIMIENTO

### EMR-001: Migracion BD
| Capa | Objetos |
|------|---------|
| **Impacto** | Infraestructura - afecta todos los schemas |
| **Estado** | COMPLETADA |

### ETC-001: Consolidacion Tecnica
| Capa | Objetos |
|------|---------|
| **Impacto** | Deuda tecnica - afecta todos los schemas |
| **Estado** | EN_PROGRESO |

---

## FASE 3: EXTENSIONES (EXT-001 a EXT-011 + EAI-003-EXT)

### EXT-001: Portal Maestros

| Capa | Objetos |
|------|---------|
| **Schemas** | `social_features`, `progress_tracking` |
| **Tablas DDL** | teacher_reports, scheduled_reports, shared_reports, teacher_interventions, student_intervention_alerts, teacher_alert_configurations, teacher_notes |
| **Entities** | TeacherReport, ScheduledReport, SharedReport, TeacherIntervention, StudentInterventionAlert, TeacherAlertConfiguration, TeacherNote |
| **Controllers** | TeacherReportsController, InterventionsController |
| **Estado** | COMPLETADA - scheduled_reports 4 column mismatches = H-025 |

### EXT-002: Admin Extendido

| Capa | Objetos |
|------|---------|
| **Schemas** | `admin_dashboard`, `audit_logging` |
| **Tablas DDL** | Extiende bulk_operations, admin_reports + pending_user_initializations |
| **Entities** | PendingUserInitialization |
| **Controllers** | Extiende AdminController |
| **Estado** | COMPLETADA |

### EXT-003: Notificaciones

| Capa | Objetos |
|------|---------|
| **Schemas** | `notifications` |
| **Tablas DDL** | notifications, notification_preferences, notification_logs, notification_templates, notification_queue, user_devices, rate_limit_logs |
| **Entities** | Notification, NotificationPreference, NotificationLog, NotificationTemplate, NotificationQueue, UserDevice (rate_limit_logs sin entity = H-017) |
| **Controllers** | NotificationsController |
| **Estado** | COMPLETADA - 58% match promedio = H-024 |

### EXT-004: Perfiles Extendidos

| Capa | Objetos |
|------|---------|
| **Schemas** | `auth_management` |
| **Tablas DDL** | Extiende profiles, user_preferences |
| **Entities** | Extiende Profile, UserPreference |
| **Controllers** | ProfileController |
| **Estado** | COMPLETADA |

### EXT-005: Reportes Avanzados

| Capa | Objetos |
|------|---------|
| **Schemas** | `admin_dashboard`, `social_features` |
| **Tablas DDL** | admin_reports, scheduled_reports, shared_reports |
| **Entities** | AdminReport, ScheduledReport, SharedReport |
| **Controllers** | ReportsController |
| **Estado** | COMPLETADA |

### EXT-006: Gestion de Contenido

| Capa | Objetos |
|------|---------|
| **Schemas** | `content_management` |
| **Tablas DDL** | content_templates, media_files, content_versions, tags, content_categories, content_authors, media_metadata, marie_curie_contents, flagged_content, moderation_rules |
| **Entities** | ContentTemplate, MediaFile, ContentVersion, Tag, ContentCategory, ContentAuthor, MediaMetadata, MarieCurieContent, FlaggedContent, ModerationRule |
| **Controllers** | ContentManagementController, ModerationController |
| **Estado** | COMPLETADA - 99% match |

### EAI-003-EXT: Gamificacion Social

| Capa | Objetos |
|------|---------|
| **Schemas** | `social_features`, `gamification_system` |
| **Tablas DDL** | teams, team_members, team_challenges, peer_challenges, challenge_participants, challenge_results, friendships, friend_requests, user_follows, guilds, guild_members, guild_join_requests, guild_missions, guild_mission_participants, guild_emblems, guild_mission_contributions, user_skill_ratings |
| **Entities** | Team, TeamMember, TeamChallenge, PeerChallenge, ChallengeParticipant, ChallengeResult, Friendship, FriendRequest, UserFollow, Guild, GuildMember, GuildJoinRequest, GuildMission, GuildMissionParticipant, UserSkillRating |
| **Sin Entity** | guild_emblems, guild_mission_contributions = H-017 |
| **Controllers** | TeamsController, ChallengesController, FriendsController, GuildsController |
| **Estado** | COMPLETADA - 70% match social schema |

### EXT-007: LTI Integration

| Capa | Objetos |
|------|---------|
| **Schemas** | `lti_integration` |
| **Tablas DDL** | lti_consumers, lti_sessions, lti_grade_passbacks |
| **Entities** | LtiConsumer, LtiSession, LtiGradePassback |
| **Controllers** | LtiController |
| **Estado** | PARCIAL (40%) - DDL+entities completos, backend parcial |

### EXT-008: White Label

| Capa | Objetos |
|------|---------|
| **Schemas** | `system_configuration`, `auth_management` |
| **Tablas DDL** | tenant_configurations, system_settings |
| **Entities** | TenantConfiguration |
| **Controllers** | (no dedicado) |
| **Estado** | PARCIAL (50%) |

### EXT-009: Peer Challenges

| Capa | Objetos |
|------|---------|
| **Schemas** | `social_features` |
| **Tablas DDL** | peer_challenges, challenge_participants, challenge_results, team_vs_team_challenges |
| **Entities** | PeerChallenge, ChallengeParticipant, ChallengeResult (team_vs_team sin entity = H-039) |
| **Controllers** | ChallengesController (parcial) |
| **Estado** | PARCIAL (30%) - DDL completo, backend parcial |

### EXT-010: Notificaciones Padres

| Capa | Objetos |
|------|---------|
| **Schemas** | `auth_management`, `notifications` |
| **Tablas DDL** | parent_accounts, parent_student_links, parent_notifications |
| **Entities** | ParentAccount, ParentStudentLink, ParentNotification |
| **Controllers** | ParentsController |
| **Estado** | PARCIAL (35%) - parent_notifications sistema paralelo = H-040 |

### EXT-011: Portal Padres

| Capa | Objetos |
|------|---------|
| **Schemas** | `auth_management`, `progress_tracking` |
| **Tablas DDL** | Reutiliza parent_accounts, parent_student_links + module_progress, exercise_attempts |
| **Entities** | Reutiliza ParentAccount, ParentStudentLink |
| **Controllers** | ParentsController (parcial) |
| **Estado** | PARCIAL (30%) |

---

## SCHEMAS SIN EPIC DIRECTO

| Schema | Tablas | Justificacion |
|--------|--------|---------------|
| `data_warehouse` | 16 tablas (8 dim + 4 fact + 2 ML + 2 ETL) | Soporte analitico transversal, sin EPIC dedicada |
| `communication` | 4 tablas (messages, message_participants, conversations, conversation_participants) | Infraestructura social transversal |
| `gamilit` | 0 tablas (solo funciones utility) | Schema de utilidades |
| `public` | 0 tablas (placeholder) | Placeholder |

---

## GRAFO DE DEPENDENCIAS ENTRE EPICs

```
EAI-001 (Auth) ──────────────────────→ TODAS LAS DEMAS
  │
  ├── EAI-002 (Contenido) ──────────→ EAI-003, EAI-004, EAI-007
  │     │
  │     └── EAI-007 (M4-M5) ────────→ (standalone)
  │
  ├── EAI-003 (Gamificacion) ───────→ EAI-003-EXT, EXT-009
  │     │
  │     └── EAI-003-EXT (Social) ───→ EXT-009 (Peer Challenges)
  │
  ├── EAI-005 (Admin Base) ─────────→ EAI-008, EXT-001, EXT-002, EXT-005
  │     │
  │     ├── EXT-001 (Maestros) ─────→ EXT-005 (Reportes)
  │     └── EAI-008 (Portal Admin) ─→ EXT-002 (Admin Ext)
  │
  ├── EAI-006 (Config) ────────────→ EXT-008 (White Label)
  │
  ├── EXT-003 (Notificaciones) ────→ EXT-010 (Notif Padres)
  │
  └── EXT-004 (Perfiles) ──────────→ EXT-010, EXT-011 (Portal Padres)
```

---

## FK RELATIONSHIPS SUMMARY

| Schema Origen | FKs Salientes | Target Principal |
|---------------|---------------|------------------|
| auth_management | 26 | auth.users, self |
| educational_content | 39 | auth_management.profiles, self |
| gamification_system | 30 | auth_management.profiles, educational_content |
| progress_tracking | 45 | auth_management.profiles, educational_content |
| social_features | 73 | auth_management.profiles, self |
| content_management | 16 | auth_management.profiles, self |
| notifications | 7 | auth_management.profiles, self |
| audit_logging | 12 | auth_management.profiles, tenants |
| admin_dashboard | 3 | auth_management.profiles, tenants |
| system_configuration | 10 | auth_management.profiles, tenants |
| lti_integration | 7 | auth_management.profiles, tenants, self |
| data_warehouse | 18 | self (dim→fact) |
| communication | 13 | auth_management.profiles, social_features |
| **TOTAL** | **299** | **auth_management.profiles (~155)** |

---

## COBERTURA EPIC → BD

| Metrica | Valor |
|---------|-------|
| Tablas cubiertas por EPICs | 151/171 (88.3%) |
| Tablas sin EPIC directo | 20 (data_warehouse:16 + communication:4) |
| Schemas 100% cubiertos | 12/16 |
| EPICs con gaps criticos | 4 (EAI-003: H-029, EAI-005: H-023, EXT-003: H-024, EXT-009: H-039) |

---

*Traceability v1.0.0 - 2026-02-05 (FASE-4 TAREA 4.1.2)*
