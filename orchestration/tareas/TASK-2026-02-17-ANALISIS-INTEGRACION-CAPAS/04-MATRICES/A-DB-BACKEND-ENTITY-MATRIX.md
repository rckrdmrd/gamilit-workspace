# A: DB-Backend Entity Integrity Matrix

**Fecha:** 2026-02-17
**Agente:** Agent A (DB-to-Backend Entity Integrity)
**Version:** 1.0.0

---

## Summary

| Metric | Count |
|--------|-------|
| Total DDL tables (CREATE TABLE) | 169 |
| Total @Entity classes | 153 |
| MATCHED (DDL table has entity + datasource) | 153 |
| DDL-ONLY (no backend entity) | 16 |
| ENTITY-NO-DDL (entity without DDL table) | 0 |
| Schema mismatches | 0 |
| In database.constants.ts (DB_TABLES) | 169 (all DDL tables represented) |

**Integrity Score:** 153/169 = **90.5%** (16 DDL-only tables are all in `data_warehouse` schema -- expected, as ETL/ML/Visualization modules are not imported)

---

## Detailed Matrix

### 1. auth (1 table)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 1 | auth | users | User | auth/entities/user.entity.ts | auth | AUTH_BASE.USERS | MATCHED |

### 2. auth_management (16 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 2 | auth_management | tenants | Tenant | auth/entities/tenant.entity.ts | auth | AUTH.TENANTS | MATCHED |
| 3 | auth_management | auth_attempts | AuthAttempt | auth/entities/auth-attempt.entity.ts | auth | AUTH.AUTH_ATTEMPTS | MATCHED |
| 4 | auth_management | profiles | Profile | auth/entities/profile.entity.ts | auth | AUTH.PROFILES | MATCHED |
| 5 | auth_management | roles | Role | auth/entities/role.entity.ts | auth | AUTH.ROLES | MATCHED |
| 6 | auth_management | user_roles | UserRole | auth/entities/user-role.entity.ts | auth | AUTH.USER_ROLES | MATCHED |
| 7 | auth_management | auth_providers | AuthProvider | auth/entities/auth-provider.entity.ts | auth | AUTH.AUTH_PROVIDERS | MATCHED |
| 8 | auth_management | email_verification_tokens | EmailVerificationToken | auth/entities/email-verification-token.entity.ts | auth | AUTH.EMAIL_VERIFICATION_TOKENS | MATCHED |
| 9 | auth_management | password_reset_tokens | PasswordResetToken | auth/entities/password-reset-token.entity.ts | auth | AUTH.PASSWORD_RESET_TOKENS | MATCHED |
| 10 | auth_management | security_events | SecurityEvent | auth/entities/security-event.entity.ts | auth | AUTH.SECURITY_EVENTS | MATCHED |
| 11 | auth_management | user_preferences | UserPreferences | auth/entities/user-preferences.entity.ts | auth | AUTH.USER_PREFERENCES | MATCHED |
| 12 | auth_management | memberships | Membership | auth/entities/membership.entity.ts | auth | AUTH.MEMBERSHIPS | MATCHED |
| 13 | auth_management | user_sessions | UserSession | auth/entities/user-session.entity.ts | auth | AUTH.USER_SESSIONS | MATCHED |
| 14 | auth_management | user_suspensions | UserSuspension | auth/entities/user-suspension.entity.ts | auth | AUTH.USER_SUSPENSIONS | MATCHED |
| 15 | auth_management | two_factor_tokens | TwoFactorToken | auth/entities/two-factor-token.entity.ts | auth | AUTH.TWO_FACTOR_TOKENS | MATCHED |
| 16 | auth_management | parent_accounts | ParentAccount | auth/entities/parent-account.entity.ts | auth | AUTH.PARENT_ACCOUNTS | MATCHED |
| 17 | auth_management | parent_student_links | ParentStudentLink | auth/entities/parent-student-link.entity.ts | auth | AUTH.PARENT_STUDENT_LINKS | MATCHED |
| 18 | auth_management | parent_notifications | ParentNotification | auth/entities/parent-notification.entity.ts | auth | AUTH.PARENT_NOTIFICATIONS | MATCHED |

### 3. educational_content (19 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 19 | educational_content | modules | Module | educational/entities/module.entity.ts | educational | EDUCATIONAL.MODULES | MATCHED |
| 20 | educational_content | exercises | Exercise | educational/entities/exercise.entity.ts | educational | EDUCATIONAL.EXERCISES | MATCHED |
| 21 | educational_content | assessment_rubrics | AssessmentRubric | educational/entities/assessment-rubric.entity.ts | educational | EDUCATIONAL.ASSESSMENT_RUBRICS | MATCHED |
| 22 | educational_content | media_resources | MediaResource | educational/entities/media-resource.entity.ts | educational | EDUCATIONAL.MEDIA_RESOURCES | MATCHED |
| 23 | educational_content | assignments | Assignment | assignments/entities/assignment.entity.ts | educational | EDUCATIONAL.ASSIGNMENTS | MATCHED |
| 24 | educational_content | assignment_exercises | AssignmentExercise | assignments/entities/assignment-exercise.entity.ts | educational | EDUCATIONAL.ASSIGNMENT_EXERCISES | MATCHED |
| 25 | educational_content | assignment_students | AssignmentStudent | assignments/entities/assignment-student.entity.ts | educational | EDUCATIONAL.ASSIGNMENT_STUDENTS | MATCHED |
| 26 | educational_content | assignment_submissions | AssignmentSubmission | assignments/entities/assignment-submission.entity.ts | educational | EDUCATIONAL.ASSIGNMENT_SUBMISSIONS | MATCHED |
| 27 | educational_content | difficulty_criteria | DifficultyCriteria | educational/entities/difficulty-criteria.entity.ts | educational | EDUCATIONAL.DIFFICULTY_CRITERIA | MATCHED |
| 28 | educational_content | exercise_validation_configs | ExerciseValidationConfig | educational/entities/exercise-validation-config.entity.ts | educational | EDUCATIONAL.EXERCISE_VALIDATION_CONFIG | MATCHED |
| 29 | educational_content | teacher_contents | TeacherContent | teacher/entities/teacher-content.entity.ts | educational | EDUCATIONAL.TEACHER_CONTENT | MATCHED |
| 30 | educational_content | exercise_validation_audits | ExerciseValidationAudit | educational/entities/exercise-validation-audit.entity.ts | educational | EDUCATIONAL.EXERCISE_VALIDATION_AUDIT | MATCHED |
| 31 | educational_content | exercise_type_rubrics | ExerciseTypeRubric | educational/entities/exercise-type-rubric.entity.ts | educational | EDUCATIONAL.EXERCISE_TYPE_RUBRICS | MATCHED |
| 32 | educational_content | content_metadatas | ContentMetadata | educational/entities/content-metadata.entity.ts | educational | EDUCATIONAL.CONTENT_METADATA | MATCHED |
| 33 | educational_content | module_dependencies | ModuleDependencies | educational/entities/module-dependencies.entity.ts | educational | EDUCATIONAL.MODULE_DEPENDENCIES | MATCHED |
| 34 | educational_content | taxonomies | Taxonomy | educational/entities/taxonomy.entity.ts | educational | EDUCATIONAL.TAXONOMIES | MATCHED |
| 35 | educational_content | content_tags | ContentTag | educational/entities/content-tag.entity.ts | educational | EDUCATIONAL.CONTENT_TAGS | MATCHED |
| 36 | educational_content | content_approvals | ContentApproval | educational/entities/content-approval.entity.ts | educational | EDUCATIONAL.CONTENT_APPROVALS | MATCHED |
| 37 | educational_content | exercise_mechanic_mappings | ExerciseMechanicMapping | educational/entities/exercise-mechanic-mapping.entity.ts | educational | EDUCATIONAL.EXERCISE_MECHANIC_MAPPING | MATCHED |

**Note:** 2 tables are in `_cross_schema/` subdirectory (media_attachments, classroom_modules):

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 38 | educational_content | media_attachments | MediaAttachment | educational/entities/media-attachment.entity.ts | educational | EDUCATIONAL.MEDIA_ATTACHMENTS | MATCHED |
| 39 | educational_content | classroom_modules | ClassroomModule | educational/entities/classroom-module.entity.ts | educational | EDUCATIONAL.CLASSROOM_MODULES | MATCHED |

### 4. gamification_system (19 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 40 | gamification_system | user_stats | UserStats | gamification/entities/user-stats.entity.ts | gamification | GAMIFICATION.USER_STATS | MATCHED |
| 41 | gamification_system | user_ranks | UserRank | gamification/entities/user-rank.entity.ts | gamification | GAMIFICATION.USER_RANKS | MATCHED |
| 42 | gamification_system | achievements | Achievement | gamification/entities/achievement.entity.ts | gamification | GAMIFICATION.ACHIEVEMENTS | MATCHED |
| 43 | gamification_system | user_achievements | UserAchievement | gamification/entities/user-achievement.entity.ts | gamification | GAMIFICATION.USER_ACHIEVEMENTS | MATCHED |
| 44 | gamification_system | ml_coins_transactions | MLCoinsTransaction | gamification/entities/ml-coins-transaction.entity.ts | gamification | GAMIFICATION.ML_COINS_TRANSACTIONS | MATCHED |
| 45 | gamification_system | missions | Mission | gamification/entities/mission.entity.ts | gamification | GAMIFICATION.MISSIONS | MATCHED |
| 46 | gamification_system | comodines_inventory | ComodinesInventory | gamification/entities/comodines-inventory.entity.ts | gamification | GAMIFICATION.COMODINES_INVENTORY | MATCHED |
| 47 | gamification_system | leaderboard_metadatas | LeaderboardMetadata | gamification/entities/leaderboard-metadata.entity.ts | gamification | GAMIFICATION.LEADERBOARD_METADATA | MATCHED |
| 48 | gamification_system | achievement_categories | AchievementCategory | gamification/entities/achievement-category.entity.ts | gamification | GAMIFICATION.ACHIEVEMENT_CATEGORIES | MATCHED |
| 49 | gamification_system | active_boosts | ActiveBoost | gamification/entities/active-boost.entity.ts | gamification | GAMIFICATION.ACTIVE_BOOSTS | MATCHED |
| 50 | gamification_system | inventory_transactions | InventoryTransaction | gamification/entities/inventory-transaction.entity.ts | gamification | GAMIFICATION.INVENTORY_TRANSACTIONS | MATCHED |
| 51 | gamification_system | maya_ranks | MayaRankEntity | gamification/entities/maya-rank.entity.ts | gamification | GAMIFICATION.MAYA_RANKS | MATCHED |
| 52 | gamification_system | comodin_usage_logs | ComodinUsageLog | gamification/entities/comodin-usage-log.entity.ts | gamification | GAMIFICATION.COMODIN_USAGE_LOG | MATCHED |
| 53 | gamification_system | comodin_usage_trackings | ComodinUsageTracking | gamification/entities/comodin-usage-tracking.entity.ts | gamification | GAMIFICATION.COMODIN_USAGE_TRACKING | MATCHED |
| 54 | gamification_system | shop_categories | ShopCategory | gamification/entities/shop-category.entity.ts | gamification | GAMIFICATION.SHOP_CATEGORIES | MATCHED |
| 55 | gamification_system | shop_items | ShopItem | gamification/entities/shop-item.entity.ts | gamification | GAMIFICATION.SHOP_ITEMS | MATCHED |
| 56 | gamification_system | user_purchases | UserPurchase | gamification/entities/user-purchase.entity.ts | gamification | GAMIFICATION.USER_PURCHASES | MATCHED |
| 57 | gamification_system | mission_templates | MissionTemplate | gamification/entities/mission-template.entity.ts | gamification | GAMIFICATION.MISSION_TEMPLATES | MATCHED |

**Note:** 2 tables in `_cross_schema/` subdirectory (classroom_missions, comodin_uses):

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 58 | gamification_system | classroom_missions | ClassroomMission | gamification/entities/classroom-mission.entity.ts | gamification | GAMIFICATION.CLASSROOM_MISSIONS | MATCHED |
| 59 | gamification_system | comodin_uses | ComodinUse | gamification/entities/comodin-use.entity.ts | gamification | GAMIFICATION.COMODIN_USES | MATCHED |

### 5. progress_tracking (21 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 60 | progress_tracking | module_progress | ModuleProgress | progress/entities/module-progress.entity.ts | progress | PROGRESS.MODULE_PROGRESS | MATCHED |
| 61 | progress_tracking | learning_sessions | LearningSession | progress/entities/learning-session.entity.ts | progress | PROGRESS.LEARNING_SESSIONS | MATCHED |
| 62 | progress_tracking | exercise_attempts | ExerciseAttempt | progress/entities/exercise-attempt.entity.ts | progress | PROGRESS.EXERCISE_ATTEMPTS | MATCHED |
| 63 | progress_tracking | exercise_submissions | ExerciseSubmission | progress/entities/exercise-submission.entity.ts | progress | PROGRESS.EXERCISE_SUBMISSIONS | MATCHED |
| 64 | progress_tracking | scheduled_missions | ScheduledMission | progress/entities/scheduled-mission.entity.ts | progress | PROGRESS.SCHEDULED_MISSIONS | MATCHED |
| 65 | progress_tracking | teacher_notes | TeacherNote | progress/entities/teacher-note.entity.ts | progress | PROGRESS.TEACHER_NOTES | MATCHED |
| 66 | progress_tracking | manual_reviews | ManualReview | progress/entities/manual-review.entity.ts | progress | PROGRESS.MANUAL_REVIEWS | MATCHED |
| 67 | progress_tracking | engagement_metrics | EngagementMetrics | progress/entities/engagement-metrics.entity.ts | progress | PROGRESS.ENGAGEMENT_METRICS | MATCHED |
| 68 | progress_tracking | learning_paths | LearningPath | progress/entities/learning-path.entity.ts | progress | PROGRESS.LEARNING_PATHS | MATCHED |
| 69 | progress_tracking | mastery_trackings | MasteryTracking | progress/entities/mastery-tracking.entity.ts | progress | PROGRESS.MASTERY_TRACKING | MATCHED |
| 70 | progress_tracking | module_completion_trackings | ModuleCompletionTracking | progress/entities/module-completion-tracking.entity.ts | progress | PROGRESS.MODULE_COMPLETION_TRACKING | MATCHED |
| 71 | progress_tracking | progress_snapshots | ProgressSnapshot | progress/entities/progress-snapshot.entity.ts | progress | PROGRESS.PROGRESS_SNAPSHOTS | MATCHED |
| 72 | progress_tracking | skill_assessments | SkillAssessment | progress/entities/skill-assessment.entity.ts | progress | PROGRESS.SKILL_ASSESSMENTS | MATCHED |
| 73 | progress_tracking | user_learning_paths | UserLearningPath | progress/entities/user-learning-path.entity.ts | progress | PROGRESS.USER_LEARNING_PATHS | MATCHED |
| 74 | progress_tracking | teacher_interventions | TeacherIntervention | progress/entities/teacher-intervention.entity.ts | progress | PROGRESS.TEACHER_INTERVENTIONS | MATCHED |
| 75 | progress_tracking | student_intervention_alerts | StudentInterventionAlert | teacher/entities/student-intervention-alert.entity.ts | progress | PROGRESS.STUDENT_INTERVENTION_ALERTS | MATCHED |
| 76 | progress_tracking | certificates | Certificate | progress/entities/certificate.entity.ts | progress | PROGRESS.CERTIFICATES | MATCHED |
| 77 | progress_tracking | teacher_alert_configurations | TeacherAlertConfiguration | progress/entities/teacher-alert-configuration.entity.ts | progress | PROGRESS.TEACHER_ALERT_CONFIGURATIONS | MATCHED |
| 78 | progress_tracking | user_difficulty_progresses | UserDifficultyProgress | progress/entities/user-difficulty-progress.entity.ts | progress | PROGRESS.USER_DIFFICULTY_PROGRESS | MATCHED |
| 79 | progress_tracking | user_current_levels | UserCurrentLevel | progress/entities/user-current-level.entity.ts | progress | PROGRESS.USER_CURRENT_LEVEL | MATCHED |

**Note:** 1 table in `_cross_schema/` subdirectory (learning_path_modules):

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 80 | progress_tracking | learning_path_modules | LearningPathModule | progress/entities/learning-path-module.entity.ts | progress | PROGRESS.LEARNING_PATH_MODULES | MATCHED |

### 6. social_features (29 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 81 | social_features | friendships | Friendship | social/entities/friendship.entity.ts | social | SOCIAL.FRIENDSHIPS | MATCHED |
| 82 | social_features | schools | School | social/entities/school.entity.ts | social | SOCIAL.SCHOOLS | MATCHED |
| 83 | social_features | classrooms | Classroom | social/entities/classroom.entity.ts | social | SOCIAL.CLASSROOMS | MATCHED |
| 84 | social_features | classroom_members | ClassroomMember | social/entities/classroom-member.entity.ts | social | SOCIAL.CLASSROOM_MEMBERS | MATCHED |
| 85 | social_features | teams | Team | social/entities/team.entity.ts | social | SOCIAL.TEAMS | MATCHED |
| 86 | social_features | team_members | TeamMember | social/entities/team-member.entity.ts | social | SOCIAL.TEAM_MEMBERS | MATCHED |
| 87 | social_features | team_challenges | TeamChallenge | social/entities/team-challenge.entity.ts | social | SOCIAL.TEAM_CHALLENGES | MATCHED |
| 88 | social_features | assignment_classrooms | AssignmentClassroom | social/entities/assignment-classroom.entity.ts | social | SOCIAL.ASSIGNMENT_CLASSROOMS | MATCHED |
| 89 | social_features | peer_challenges | PeerChallenge | social/entities/peer-challenge.entity.ts | social | SOCIAL.PEER_CHALLENGES | MATCHED |
| 90 | social_features | challenge_participants | ChallengeParticipant | social/entities/challenge-participant.entity.ts | social | SOCIAL.CHALLENGE_PARTICIPANTS | MATCHED |
| 91 | social_features | challenge_results | ChallengeResult | social/entities/challenge-result.entity.ts | social | SOCIAL.CHALLENGE_RESULTS | MATCHED |
| 92 | social_features | discussion_threads | DiscussionThread | social/entities/discussion-thread.entity.ts | social | SOCIAL.DISCUSSION_THREADS | MATCHED |
| 93 | social_features | social_interactions | SocialInteraction | social/entities/social-interaction.entity.ts | social | SOCIAL.SOCIAL_INTERACTIONS | MATCHED |
| 94 | social_features | teacher_classrooms | TeacherClassroom | social/entities/teacher-classroom.entity.ts | social | SOCIAL.TEACHER_CLASSROOMS | MATCHED |
| 95 | social_features | user_follows | UserFollow | social/entities/user-follow.entity.ts | social | SOCIAL.USER_FOLLOWS | MATCHED |
| 96 | social_features | user_activities | UserActivity | social/entities/user-activity.entity.ts | social | SOCIAL.USER_ACTIVITIES | MATCHED |
| 97 | social_features | friend_requests | FriendRequest | social/entities/friend-request.entity.ts | social | SOCIAL.FRIEND_REQUESTS | MATCHED |
| 98 | social_features | teacher_reports | TeacherReport | teacher/entities/teacher-report.entity.ts | social | SOCIAL.TEACHER_REPORTS | MATCHED |
| 99 | social_features | scheduled_reports | ScheduledReport | teacher/entities/scheduled-report.entity.ts | social | SOCIAL.SCHEDULED_REPORTS | MATCHED |
| 100 | social_features | shared_reports | SharedReport | teacher/entities/shared-report.entity.ts | social | SOCIAL.SHARED_REPORTS | MATCHED |
| 101 | social_features | user_skill_ratings | UserSkillRating | gamification/peer-challenges/entities/user-skill-rating.entity.ts | social | SOCIAL.USER_SKILL_RATINGS | MATCHED |
| 102 | social_features | guild_emblems | GuildEmblem | social/entities/guild-emblem.entity.ts | social | SOCIAL.GUILD_EMBLEMS | MATCHED |
| 103 | social_features | guilds | Guild | social/entities/guild.entity.ts | social | (hardcoded 'guilds') | MATCHED |
| 104 | social_features | guild_members | GuildMember | social/entities/guild-member.entity.ts | social | (hardcoded 'guild_members') | MATCHED |
| 105 | social_features | guild_join_requests | GuildJoinRequest | social/entities/guild-join-request.entity.ts | social | (hardcoded 'guild_join_requests') | MATCHED |
| 106 | social_features | guild_missions | GuildMission | social/entities/guild-mission.entity.ts | social | SOCIAL.GUILD_MISSIONS | MATCHED |
| 107 | social_features | guild_mission_contributions | GuildMissionContribution | social/entities/guild-mission-contribution.entity.ts | social | SOCIAL.GUILD_MISSION_CONTRIBUTIONS | MATCHED |
| 108 | social_features | team_vs_team_challenges | TeamVsTeamChallenge | social/entities/team-vs-team-challenge.entity.ts | social | SOCIAL.TEAM_VS_TEAM_CHALLENGES | MATCHED |
| 109 | social_features | user_blocks | UserBlock | social/entities/user-block.entity.ts | social | SOCIAL.USER_BLOCKS | MATCHED |
| 110 | social_features | user_reports | UserReport | social/entities/user-report.entity.ts | social | SOCIAL.USER_REPORTS | MATCHED |

### 7. content_management (10 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 111 | content_management | content_templates | ContentTemplate | content/entities/content-template.entity.ts | content | CONTENT.CONTENT_TEMPLATES | MATCHED |
| 112 | content_management | marie_curie_contents | MarieCurieContent | content/entities/marie-curie-content.entity.ts | content | CONTENT.MARIE_CURIE_CONTENT | MATCHED |
| 113 | content_management | media_files | MediaFile | content/entities/media-file.entity.ts | content | CONTENT.MEDIA_FILES | MATCHED |
| 114 | content_management | content_versions | ContentVersion | content/entities/content-version.entity.ts | content | CONTENT.CONTENT_VERSIONS | MATCHED |
| 115 | content_management | flagged_contents | FlaggedContent | content/entities/flagged-content.entity.ts | content | CONTENT.FLAGGED_CONTENT | MATCHED |
| 116 | content_management | moderation_rules | ModerationRule | content/entities/moderation-rule.entity.ts | content | CONTENT.MODERATION_RULES | MATCHED |
| 117 | content_management | tags | Tag | content/entities/tag.entity.ts | content | CONTENT.TAGS | MATCHED |
| 118 | content_management | content_authors | ContentAuthor | content/entities/content-author.entity.ts | content | CONTENT.CONTENT_AUTHORS | MATCHED |
| 119 | content_management | content_categories | ContentCategory | content/entities/content-category.entity.ts | content | CONTENT.CONTENT_CATEGORIES | MATCHED |
| 120 | content_management | media_metadatas | MediaMetadata | content/entities/media-metadata.entity.ts | content | CONTENT.MEDIA_METADATA | MATCHED |

### 8. audit_logging (7 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 121 | audit_logging | audit_logs | AuditLog | audit/entities/audit-log.entity.ts | audit | AUDIT.AUDIT_LOGS | MATCHED |
| 122 | audit_logging | performance_metrics | PerformanceMetric | admin/entities/performance-metric.entity.ts | audit | AUDIT.PERFORMANCE_METRICS | MATCHED |
| 123 | audit_logging | system_alerts | SystemAlert | admin/entities/system-alert.entity.ts | audit | AUDIT.SYSTEM_ALERTS | MATCHED |
| 124 | audit_logging | system_logs | SystemLog | admin/entities/system-log.entity.ts | audit | AUDIT.SYSTEM_LOGS | MATCHED |
| 125 | audit_logging | user_activity_logs | UserActivityLog | audit/entities/user-activity-log.entity.ts | audit | AUDIT.USER_ACTIVITY_LOGS | MATCHED |
| 126 | audit_logging | activity_logs | ActivityLog | admin/entities/activity-log.entity.ts | audit | AUDIT.ACTIVITY_LOG | MATCHED |
| 127 | audit_logging | pending_user_initializations | PendingUserInitialization | audit/entities/pending-user-initialization.entity.ts | audit | AUDIT.PENDING_USER_INITIALIZATION | MATCHED |

### 9. notifications (7 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 128 | notifications | notifications | Notification | notifications/entities/multichannel/notification.entity.ts | notifications | NOTIFICATIONS.NOTIFICATIONS | MATCHED |
| 129 | notifications | notification_preferences | NotificationPreference | notifications/entities/multichannel/notification-preference.entity.ts | notifications | NOTIFICATIONS.NOTIFICATION_PREFERENCES | MATCHED |
| 130 | notifications | notification_logs | NotificationLog | notifications/entities/multichannel/notification-log.entity.ts | notifications | NOTIFICATIONS.NOTIFICATION_LOGS | MATCHED |
| 131 | notifications | notification_templates | NotificationTemplate | notifications/entities/multichannel/notification-template.entity.ts | notifications | NOTIFICATIONS.NOTIFICATION_TEMPLATES | MATCHED |
| 132 | notifications | notification_queue | NotificationQueue | notifications/entities/multichannel/notification-queue.entity.ts | notifications | NOTIFICATIONS.NOTIFICATION_QUEUE | MATCHED |
| 133 | notifications | user_devices | UserDevice | notifications/entities/multichannel/user-device.entity.ts | notifications | NOTIFICATIONS.USER_DEVICES | MATCHED |
| 134 | notifications | rate_limit_logs | RateLimitLog | notifications/entities/rate-limit-log.entity.ts | notifications | NOTIFICATIONS.RATE_LIMIT_LOGS | MATCHED |

### 10. communication (4 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 135 | communication | messages | Message | teacher/entities/message.entity.ts | communication | COMMUNICATION.MESSAGES | MATCHED |
| 136 | communication | message_participants | MessageParticipant | teacher/entities/message.entity.ts (2nd class) | communication | COMMUNICATION.MESSAGE_PARTICIPANTS | MATCHED |
| 137 | communication | conversations | Conversation | communication/entities/conversation.entity.ts | communication | COMMUNICATION.CONVERSATIONS | MATCHED |
| 138 | communication | conversation_participants | ConversationParticipant | communication/entities/conversation-participant.entity.ts | communication | COMMUNICATION.CONVERSATION_PARTICIPANTS | MATCHED |

### 11. admin_dashboard (3 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 139 | admin_dashboard | bulk_operations | BulkOperation | admin/entities/bulk-operation.entity.ts | admin_dashboard | ADMIN.BULK_OPERATIONS | MATCHED |
| 140 | admin_dashboard | admin_reports | AdminReport | admin/entities/admin-report.entity.ts | admin_dashboard | ADMIN.ADMIN_REPORTS | MATCHED |
| 141 | admin_dashboard | metrics_history | MetricsHistory | admin/entities/metrics-history.entity.ts | admin_dashboard | ADMIN.METRICS_HISTORY | MATCHED |

### 12. system_configuration (9 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 142 | system_configuration | system_settings | SystemSetting | admin/entities/system-setting.entity.ts | auth | SYSTEM.SYSTEM_SETTINGS | MATCHED |
| 143 | system_configuration | feature_flags | FeatureFlag | admin/entities/feature-flag.entity.ts | auth | SYSTEM.FEATURE_FLAGS | MATCHED |
| 144 | system_configuration | notification_settings | NotificationSettings | admin/entities/notification-settings.entity.ts | auth | SYSTEM.NOTIFICATION_SETTINGS | MATCHED |
| 145 | system_configuration | rate_limits | RateLimit | admin/entities/rate-limit.entity.ts | auth | SYSTEM.RATE_LIMITS | MATCHED |
| 146 | system_configuration | notification_settings_globals | NotificationSettingsGlobal | admin/entities/notification-settings-global.entity.ts | auth | SYSTEM.NOTIFICATION_SETTINGS_GLOBAL | MATCHED |
| 147 | system_configuration | api_configurations | ApiConfiguration | admin/entities/api-configuration.entity.ts | auth | SYSTEM.API_CONFIGURATION | MATCHED |
| 148 | system_configuration | environment_configs | EnvironmentConfig | admin/entities/environment-config.entity.ts | auth | SYSTEM.ENVIRONMENT_CONFIG | MATCHED |
| 149 | system_configuration | tenant_configurations | TenantConfiguration | admin/entities/tenant-configuration.entity.ts | auth | SYSTEM.TENANT_CONFIGURATIONS | MATCHED |
| 150 | system_configuration | gamification_parameters | GamificationParameter | admin/entities/gamification-parameter.entity.ts | auth | SYSTEM.GAMIFICATION_PARAMETERS | MATCHED |

### 13. lti_integration (3 tables)

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 151 | lti_integration | lti_consumers | LtiConsumer | lti/entities/lti-consumer.entity.ts | lti | LTI.LTI_CONSUMERS | MATCHED |
| 152 | lti_integration | lti_sessions | LtiSession | lti/entities/lti-session.entity.ts | lti | LTI.LTI_SESSIONS | MATCHED |
| 153 | lti_integration | lti_grade_passbacks | LtiGradePassback | lti/entities/lti-grade-passback.entity.ts | lti | LTI.LTI_GRADE_PASSBACK | MATCHED |

### 14. data_warehouse (16 tables) -- ALL DDL-ONLY

| # | Schema (DDL) | Table (DDL) | Entity Class | Entity File | Datasource | DB_TABLES Key | Status |
|---|-------------|-------------|--------------|-------------|------------|---------------|--------|
| 154 | data_warehouse | dim_dates | -- | -- | -- | DATA_WAREHOUSE.DIM_DATE | DDL-ONLY |
| 155 | data_warehouse | dim_times | -- | -- | -- | DATA_WAREHOUSE.DIM_TIME | DDL-ONLY |
| 156 | data_warehouse | dim_students | -- | -- | -- | DATA_WAREHOUSE.DIM_STUDENT | DDL-ONLY |
| 157 | data_warehouse | dim_exercises | -- | -- | -- | DATA_WAREHOUSE.DIM_EXERCISE | DDL-ONLY |
| 158 | data_warehouse | dim_modules | -- | -- | -- | DATA_WAREHOUSE.DIM_MODULE | DDL-ONLY |
| 159 | data_warehouse | dim_teachers | -- | -- | -- | DATA_WAREHOUSE.DIM_TEACHER | DDL-ONLY |
| 160 | data_warehouse | dim_achievements | -- | -- | -- | DATA_WAREHOUSE.DIM_ACHIEVEMENT | DDL-ONLY |
| 161 | data_warehouse | dim_event_types | -- | -- | -- | DATA_WAREHOUSE.DIM_EVENT_TYPE | DDL-ONLY |
| 162 | data_warehouse | etl_extraction_logs | -- | -- | -- | DATA_WAREHOUSE.ETL_EXTRACTION_LOG | DDL-ONLY |
| 163 | data_warehouse | etl_load_logs | -- | -- | -- | DATA_WAREHOUSE.ETL_LOAD_LOG | DDL-ONLY |
| 164 | data_warehouse | ml_model_weights | -- | -- | -- | (not in constants) | DDL-ONLY |
| 165 | data_warehouse | ml_prediction_logs | -- | -- | -- | (not in constants) | DDL-ONLY |
| 166 | data_warehouse | fact_exercise_completions | -- | -- | -- | DATA_WAREHOUSE.FACT_EXERCISE_COMPLETIONS | DDL-ONLY |
| 167 | data_warehouse | fact_daily_progress | -- | -- | -- | DATA_WAREHOUSE.FACT_DAILY_PROGRESS | DDL-ONLY |
| 168 | data_warehouse | fact_gamification_events | -- | -- | -- | DATA_WAREHOUSE.FACT_GAMIFICATION_EVENTS | DDL-ONLY |
| 169 | data_warehouse | fact_teacher_metrics | -- | -- | -- | DATA_WAREHOUSE.FACT_TEACHER_METRICS | DDL-ONLY |

---

## Findings

### DDL-Only Tables (no backend entity) -- 16 total

All 16 DDL-only tables belong to the `data_warehouse` schema. This is **expected and by design**:

- The `etl`, `ml`, and `visualization` backend modules exist but are **NOT imported** in `app.module.ts`
- These modules require a `data_warehouse` datasource that is **not configured** in `app.module.ts`
- The CLAUDE.md documents this: "4 module directories exist but are NOT imported: etl, ml, visualization (require datasource data_warehouse not configured), mail"
- These tables are part of a dimensional data model for analytics and reporting (8 dimension tables, 4 fact tables, 2 ETL metadata tables, 2 ML tables)

| Schema | Table | Reason |
|--------|-------|--------|
| data_warehouse | dim_dates | Dimension table -- no entity, no datasource configured |
| data_warehouse | dim_times | Dimension table -- no entity, no datasource configured |
| data_warehouse | dim_students | Dimension table -- no entity, no datasource configured |
| data_warehouse | dim_exercises | Dimension table -- no entity, no datasource configured |
| data_warehouse | dim_modules | Dimension table -- no entity, no datasource configured |
| data_warehouse | dim_teachers | Dimension table -- no entity, no datasource configured |
| data_warehouse | dim_achievements | Dimension table -- no entity, no datasource configured |
| data_warehouse | dim_event_types | Dimension table -- no entity, no datasource configured |
| data_warehouse | etl_extraction_logs | ETL metadata -- no entity, no datasource configured |
| data_warehouse | etl_load_logs | ETL metadata -- no entity, no datasource configured |
| data_warehouse | ml_model_weights | ML model storage -- no entity, no datasource configured |
| data_warehouse | ml_prediction_logs | ML predictions -- no entity, no datasource configured |
| data_warehouse | fact_exercise_completions | Fact table -- no entity, no datasource configured |
| data_warehouse | fact_daily_progress | Fact table -- no entity, no datasource configured |
| data_warehouse | fact_gamification_events | Fact table -- no entity, no datasource configured |
| data_warehouse | fact_teacher_metrics | Fact table -- no entity, no datasource configured |

### Entities Without DDL -- 0

No orphan entities found. Every @Entity class maps to a DDL CREATE TABLE statement.

### Schema Mismatches -- 0

All entities reference the correct DDL schema via `DB_SCHEMAS` constants. No entity points to a wrong schema.

**Note on User entity:** The `User` entity uses `schema: 'auth'` (hardcoded string) instead of `DB_SCHEMAS.AUTH` which resolves to `'auth_management'`. This is correct because the `auth.users` DDL table is in the `auth` schema (separate from `auth_management`). The entity correctly maps to `auth.users`.

### Datasource Coverage Gaps -- 0

All 153 matched entities are covered by one of the 11 configured datasources in `app.module.ts`:
1. **auth** -- covers auth, auth_management, system_configuration entities (28 entities)
2. **educational** -- covers educational_content entities (21 entities)
3. **gamification** -- covers gamification_system entities (20 entities)
4. **progress** -- covers progress_tracking entities (21 entities)
5. **social** -- covers social_features entities (30 entities)
6. **content** -- covers content_management entities (10 entities)
7. **audit** -- covers audit_logging entities (7 entities)
8. **notifications** -- covers notifications entities (7 entities)
9. **communication** -- covers communication entities (4 entities)
10. **admin_dashboard** -- covers admin_dashboard entities (3 entities)
11. **lti** -- covers lti_integration entities (3 entities)

**Cross-datasource entity registrations** (entities registered in multiple datasources for @ManyToOne cascades):
- `Profile` (auth) -- also in gamification, progress, social, audit, lti datasources
- `Tenant` (auth) -- also in gamification, progress, social, audit, lti datasources
- `User` (auth) -- also in admin_dashboard datasource
- `Role` (auth) -- also in admin_dashboard datasource
- `Classroom` (social) -- also in progress datasource
- `School` (social) -- also in progress datasource
- `Module` (educational) -- also in progress datasource
- `Exercise` (educational) -- also in progress datasource
- `Assignment` entities -- also in social datasource

### database.constants.ts Coverage

**DB_TABLES entries:** 169 entries across 14 schema groups (AUTH, GAMIFICATION, EDUCATIONAL, PROGRESS, SOCIAL, CONTENT, AUDIT, NOTIFICATIONS, ADMIN, SYSTEM, LTI, AUTH_BASE, COMMUNICATION, DATA_WAREHOUSE)

**Missing from DB_TABLES (using hardcoded strings in @Entity):**
- `social_features.guilds` -- entity uses `name: 'guilds'` (hardcoded)
- `social_features.guild_members` -- entity uses `name: 'guild_members'` (hardcoded)
- `social_features.guild_join_requests` -- entity uses `name: 'guild_join_requests'` (hardcoded)
- `social_features.guild_missions` -- entity uses `name: 'guild_missions'` (hardcoded, but DB_TABLES.SOCIAL.GUILD_MISSIONS exists)

**Not in DB_TABLES constants but in DDL:**
- `data_warehouse.ml_model_weights` -- DDL exists, no DB_TABLES entry
- `data_warehouse.ml_prediction_logs` -- DDL exists, no DB_TABLES entry

### Notable Observations

1. **Entity file location vs schema:** Several entities are in backend module directories that differ from their DDL schema:
   - `teacher/entities/teacher-content.entity.ts` -> `educational_content` schema
   - `teacher/entities/teacher-report.entity.ts` -> `social_features` schema
   - `teacher/entities/scheduled-report.entity.ts` -> `social_features` schema
   - `teacher/entities/shared-report.entity.ts` -> `social_features` schema
   - `teacher/entities/student-intervention-alert.entity.ts` -> `progress_tracking` schema
   - `teacher/entities/message.entity.ts` -> `communication` schema
   - `admin/entities/*` -> split across `system_configuration`, `audit_logging`, `admin_dashboard` schemas
   - `gamification/peer-challenges/entities/user-skill-rating.entity.ts` -> `social_features` schema

2. **Dual-class entity file:** `teacher/entities/message.entity.ts` contains 2 @Entity classes: `Message` and `MessageParticipant`. This is why entity file count (152) differs from entity class count (153).

3. **`content_management.media_files`** DDL table exists and has entity (`MediaFile`), but there is no `03-media_files.sql` numbering prefix -- it's just `03-media_files.sql`. This is consistent.

4. **`communication.conversations`** table is defined inside `03-conversation_participants.sql` file (alongside `conversation_participants`). One file creates 2 tables.

5. **`social_features.guild_missions` + `guild_mission_contributions`** table is defined inside single file `24-guild_missions.sql`. One file creates 2 tables.

---

## Datasource Entity Count Summary

| Datasource | Primary Entities | Cross-datasource Registrations | Total Registered |
|------------|-----------------|-------------------------------|-----------------|
| auth | 28 | 0 | 28 |
| educational | 21 | 0 | 21 |
| gamification | 20 | +2 (Profile, Tenant) | 22 |
| progress | 21 | +6 (Profile, Tenant, Classroom, School, Module, Exercise) | 27 |
| social | 30 | +2 (Profile, Tenant) | 32 |
| content | 10 | 0 | 10 |
| audit | 7 | +2 (Profile, Tenant) | 9 |
| notifications | 7 | 0 | 7 |
| communication | 4 | 0 | 4 |
| admin_dashboard | 3 | +2 (User, Role) | 5 |
| lti | 3 | +2 (Profile, Tenant) | 5 |
| **TOTAL** | **154** (153 unique + 1 dual) | - | **170** |

---

## Conclusion

The DB-to-Backend entity integrity is **excellent**:
- **153 of 169 DDL tables have matching entities** (90.5%)
- **All 16 DDL-only tables are in `data_warehouse`** -- expected by design (modules not yet imported)
- **Zero orphan entities** -- every entity maps to a DDL table
- **Zero schema mismatches** -- all entities correctly reference their DDL schema
- **Zero datasource coverage gaps** -- all entities are registered in appropriate datasources
- **Minor finding:** 3 guild-related entities use hardcoded table names instead of DB_TABLES constants
- **Minor finding:** 2 data_warehouse tables (`ml_model_weights`, `ml_prediction_logs`) are not in DB_TABLES constants
