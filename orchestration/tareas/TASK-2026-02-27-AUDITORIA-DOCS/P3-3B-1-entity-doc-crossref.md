# P3-3B-1: Entity-Documentation Cross-Reference Audit

**Task:** TASK-2026-02-27-AUDITORIA-DOCS
**Phase:** P3 (Data Model Alignment)
**Sub-task:** 3B-1 — Entity vs Documentation cross-reference
**Date:** 2026-02-27
**Status:** COMPLETE
**Auditor:** Claude Sonnet 4.6 (read-only)

---

## Methodology

1. Enumerated all 156 entity files (157 classes) via filesystem scan of `apps/backend/src/modules/**/entities/*.entity.ts`
2. Extracted `@Entity()` table names and schemas via grep on all entity files
3. Resolved table name constants via `apps/backend/src/shared/constants/database.constants.ts`
4. Cross-referenced each entity against:
   - Schema-reference docs (`docs/20-architecture/schema-reference/*.md`)
   - API reference (`docs/40-api/API-REFERENCE.md`)
   - Architecture docs (`docs/20-architecture/`)
5. Identified ghost references (docs mentioning entity class names that have no matching file)
6. Verified `@Entity()` table names match DDL `CREATE TABLE` statements

---

## Entity Coverage Summary

- **Total entity files:** 156
- **Total entity classes:** 157 (message.entity.ts contains 2: `Message` + `MessageParticipant`)
- **Documented in schema-reference (table documented):** ~128 (~82%)
- **Documented in API reference:** ~45 (~29%) (API-REFERENCE.md documents endpoints, not entities directly)
- **Undocumented in schema-reference:** ~29 (~18%)

### Coverage by Module

| Module | Files | Documented | Undocumented |
|--------|-------|-----------|--------------|
| admin | 16 | 6 | 10 |
| assignments | 4 | 4 | 0 |
| audit | 3 | 2 | 1 |
| auth | 13 | 11 | 2 |
| communication | 2 | 4 (via 19-communication.md) | 0 |
| content | 10 | 10 | 0 |
| educational | 14 | 10 | 4 |
| gamification | 18 | 14 | 4 |
| lti | 3 | 3 | 0 |
| notifications | 7 | 7 | 0 |
| progress | 21 | 20 | 1 |
| social | 25 | 22 | 3 |
| teacher | 9 | 7 | 2 |

---

## Undocumented Entities

Entities with NO mention in schema-reference docs (table name not documented).

| Entity File | Class Name | Table Name | Schema | Notes |
|-------------|-----------|------------|--------|-------|
| `admin/entities/activity-log.entity.ts` | `ActivityLog` | `activity_logs` | `audit_logging` | Documented in 16-audit.md as `audit_logs` (different table) — wrong cross-ref. Separate table not documented. |
| `admin/entities/notification-settings.entity.ts` | `NotificationSettings` | `notification_settings` | `system_configuration` | 15-settings.md documents the table conceptually but no **Entity:** tag — weak coverage |
| `admin/entities/notification-settings-global.entity.ts` | `NotificationSettingsGlobal` | `notification_settings_globals` | `system_configuration` | Not documented in any schema-reference section |
| `admin/entities/rate-limit.entity.ts` | `RateLimit` | `rate_limits` | `system_configuration` | Not documented in 15-settings.md |
| `admin/entities/environment-config.entity.ts` | `EnvironmentConfig` | `environment_configs` | `system_configuration` | Not documented in 15-settings.md |
| `admin/entities/tenant-configuration.entity.ts` | `TenantConfiguration` | `tenant_configurations` | `system_configuration` | Not documented in 15-settings.md |
| `admin/entities/system-log.entity.ts` | `SystemLog` | `system_logs` | `audit_logging` | Not documented in 16-audit.md |
| `admin/entities/performance-metric.entity.ts` | `PerformanceMetric` | `performance_metrics` | `audit_logging` | Not documented in 16-audit.md |
| `admin/entities/system-alert.entity.ts` | `SystemAlert` | `system_alerts` | `audit_logging` | Not documented in 16-audit.md |
| `admin/entities/user-activity-log.entity.ts` (audit module) | `UserActivityLog` | `user_activity_logs` | `audit_logging` | Not in 16-audit.md |
| `audit/entities/audit-log.entity.ts` | `AuditLog` | `audit_logs` | `audit_logging` | Partially documented (column list) but no **Entity:** tag in 16-audit.md |
| `educational/entities/taxonomy.entity.ts` | `Taxonomy` | `taxonomies` | `educational_content` | Not in 03-education.md |
| `educational/entities/content-metadata.entity.ts` | `ContentMetadata` | `content_metadatas` | `educational_content` | Table in DDL, no schema-ref entry |
| `educational/entities/exercise-type-rubric.entity.ts` | `ExerciseTypeRubric` | `exercise_type_rubrics` | `educational_content` | Not documented in 03-education.md |
| `educational/entities/exercise-mechanic-mapping.entity.ts` | `ExerciseMechanicMapping` | `exercise_mechanic_mappings` | `educational_content` | Not documented in 03-education.md |
| `gamification/entities/user-equipped-item.entity.ts` | `UserEquippedItem` | `user_equipped_items` | `gamification_system` | Not in 04-gamification.md or 10-store.md (deprecated) |
| `gamification/entities/comodin-use.entity.ts` | `ComodinUse` | `comodin_uses` | `gamification_system` | Not documented in 04-gamification.md |
| `gamification/entities/achievement.entity.ts` | `Achievement` | `achievements` | `gamification_system` | Table exists in DDL and docs reference achievements, but no dedicated table entry with **Entity:** tag in 04-gamification.md |
| `gamification/entities/ml-coins-transaction.entity.ts` | `MLCoinsTransaction` | `ml_coins_transactions` | `gamification_system` | Not in 04-gamification.md |
| `progress/entities/certificate.entity.ts` | `Certificate` | `certificates` | `progress_tracking` | Not in 06-progress.md |
| `social/entities/guild-mission-contribution.entity.ts` | `GuildMissionContribution` | `guild_mission_contributions` | `social_features` | Not in 05-social.md |
| `social/entities/team-vs-team-challenge.entity.ts` | `TeamVsTeamChallenge` | `team_vs_team_challenges` | `social_features` | Not in 05-social.md |
| `social/entities/user-report.entity.ts` | `UserReport` | `user_reports` | `social_features` | Not in 05-social.md |
| `teacher/entities/resource-rating.entity.ts` | `ResourceRating` | `resource_ratings` | `educational_content` | Documented in 03-education.md with **Entity:** tag — COVERED |
| `teacher/entities/resource-download.entity.ts` | `ResourceDownload` | `resource_downloads` | `educational_content` | Documented in 03-education.md with **Entity:** tag — COVERED |
| `teacher/entities/resource-comment.entity.ts` | `ResourceComment` | `resource_comments` | `educational_content` | Documented in 03-education.md with **Entity:** tag — COVERED |

> **Note:** teacher/entities/resource-*.entity.ts are actually covered in 03-education.md. Corrected count above.

### Revised Undocumented Count: 23 entities without schema-reference documentation

---

## Ghost References (Docs Reference Non-Existent Entities)

Docs use **Entity:** tags or class names for entities that DO NOT exist in the codebase.

| Doc File | Referenced Entity Class | Status | Notes |
|----------|------------------------|--------|-------|
| `docs/20-architecture/schema-reference/01-auth.md` | `UserProfile` | GHOST — no entity class named `UserProfile` exists | Auth has `Profile` class (profiles table) |
| `docs/20-architecture/schema-reference/01-auth.md` | `Session` | GHOST — no entity class named `Session` exists | Entity is `UserSession` |
| `docs/20-architecture/schema-reference/01-auth.md` | `RefreshToken` | GHOST — no entity class named `RefreshToken` exists | No refresh_token entity file exists |
| `docs/20-architecture/schema-reference/01-auth.md` | `OAuthConnection` | GHOST — no entity exists | auth.oauth_connections table is legacy/conceptual only |
| `docs/20-architecture/schema-reference/01-auth.md` | `UserPreference` (singular) | PARTIAL — entity is `UserPreferences` (plural) | Naming mismatch |
| `docs/20-architecture/schema-reference/02-tenants.md` | `TenantSettings` | GHOST — no entity exists | Conceptual only |
| `docs/20-architecture/schema-reference/02-tenants.md` | `TenantSubscription` | GHOST — no entity exists | Conceptual only |
| `docs/20-architecture/schema-reference/02-tenants.md` | `TenantMember` | GHOST — no entity exists | Entity is `Membership` |
| `docs/20-architecture/schema-reference/04-gamification.md` | `XpTransaction` | GHOST — no entity exists | No xp_transactions table in DDL either (legacy) |
| `docs/20-architecture/schema-reference/04-gamification.md` | `Level` | GHOST — no entity exists | No levels table in DDL either (legacy) |
| `docs/20-architecture/schema-reference/04-gamification.md` | `RankDefinition` | GHOST — no entity exists | Legacy conceptual model; real entity is `MayaRankEntity` |
| `docs/20-architecture/schema-reference/04-gamification.md` | `StudentGamification` | GHOST — no entity exists | Real entity is `UserStats` |
| `docs/20-architecture/schema-reference/04-gamification.md` | `GamificationConfig` | GHOST — no entity exists | Entity is `GamificationParameter` |
| `docs/20-architecture/schema-reference/04-gamification.md` | `StreakRecord` | GHOST — no entity exists | Streak data stored in `UserStats` columns |
| `docs/20-architecture/schema-reference/12-leaderboard.md` | `LeaderboardEntry` | GHOST — no entity exists | No leaderboard_entries table in DDL; real entity is `LeaderboardMetadata` |
| `docs/20-architecture/schema-reference/12-leaderboard.md` | `LeaderboardSeason` | GHOST — no entity exists | No leaderboard_seasons table in DDL |
| `docs/20-architecture/schema-reference/14-parents.md` | `ParentProfile` | GHOST — no entity exists | Real entities are `ParentAccount` + `ParentStudentLink` + `ParentNotification` |
| `docs/20-architecture/schema-reference/03-education.md` | `EducationalModule` | GHOST — entity class is `Module` | Naming mismatch |
| `docs/20-architecture/schema-reference/03-education.md` | `ModuleProgress` | GHOST — entity class is in progress module as `ModuleProgress` | MATCH (class exists in progress/entities) |
| `docs/20-architecture/schema-reference/03-education.md` | `ExerciseResult` | GHOST — no entity exists | Conceptual; real entities are `ExerciseAttempt` + `ExerciseSubmission` |
| `docs/20-architecture/schema-reference/03-education.md` | `ExerciseFeedback` | GHOST — no entity exists | Conceptual only |
| `docs/20-architecture/schema-reference/03-education.md` | `Content` | GHOST — no entity named `Content` exists | Conceptual; content split into many tables |
| `docs/20-architecture/schema-reference/03-education.md` | `ReadingAssignment` | GHOST — no entity exists | Conceptual only |
| `docs/20-architecture/schema-reference/03-education.md` | `SpacedRepetition` | GHOST — no entity exists | Conceptual only |
| `docs/20-architecture/schema-reference/07-analytics.md` | `AnalyticsEvents`, `AnalyticsDaily`, etc. | GHOST — no analytics entities exist in backend | Data warehouse tables have no TypeORM entities (DDL-only by design) |
| `docs/20-architecture/schema-reference/16-audit.md` | `DataChanges` (implied by `audit.data_changes`) | GHOST — no entity exists | No data_changes table in DDL either |
| `docs/20-architecture/schema-reference/16-audit.md` | `AccessLog` (implied by `audit.access_logs`) | GHOST — no entity exists | No access_logs table in DDL either |
| `docs/20-architecture/schema-reference/19-communication.md` | States "Sin entity - R3-07" for all 4 tables | STALE — entities NOW exist | `Conversation`, `ConversationParticipant`, `Message`, `MessageParticipant` all exist in backend |

### Ghost Reference Summary
- **Total ghost entity references:** 22 class names referenced in docs that don't exist as TypeORM entity classes
- **Stale status entries:** 1 doc (19-communication.md) incorrectly states entities are missing
- **Naming mismatches** (doc uses wrong class name): 4 cases (`UserPreference`→`UserPreferences`, `EducationalModule`→`Module`, `TenantMember`→`Membership`, `UserSession`→`UserSession` ✓ matched)

---

## Table Name Mismatches (@Entity vs DDL)

Cross-checking `@Entity({name: ...})` or `@Entity(string, ...)` in entity files against `CREATE TABLE schema.table_name` in DDL.

| Entity File | Class Name | @Entity Name (resolved) | DDL Table Name | Match? | Notes |
|-------------|-----------|------------------------|----------------|--------|-------|
| `teacher/entities/resource-rating.entity.ts` | `ResourceRating` | `resource_ratings` (hardcoded) | `educational_content.resource_ratings` | MATCH | Uses hardcoded string instead of `DB_TABLES.EDUCATIONAL.RESOURCE_RATINGS` constant |
| `teacher/entities/resource-download.entity.ts` | `ResourceDownload` | `resource_downloads` (hardcoded) | `educational_content.resource_downloads` | MATCH | Uses hardcoded string instead of constant |
| `teacher/entities/resource-comment.entity.ts` | `ResourceComment` | `resource_comments` (hardcoded) | `educational_content.resource_comments` | MATCH | Uses hardcoded string instead of constant |
| `gamification/peer-challenges/entities/user-skill-rating.entity.ts` | `UserSkillRating` | `user_skill_ratings` (hardcoded) | `social_features.user_skill_ratings` | MATCH | Uses hardcoded string instead of `DB_TABLES.SOCIAL.USER_SKILL_RATINGS` constant |
| `admin/entities/activity-log.entity.ts` | `ActivityLog` | `activity_logs` | `audit_logging.activity_logs` | MATCH | Entity uses `DB_TABLES.AUDIT.ACTIVITY_LOG` which resolves to `activity_logs` — OK |
| `gamification/entities/leaderboard-metadata.entity.ts` | `LeaderboardMetadata` | `leaderboard_metadatas` | `gamification_system.leaderboard_metadatas` | MATCH | |
| All other 151 entities | various | via DB_TABLES constants | DDL tables | MATCH | All constants-based names verified against database.constants.ts and DDL |

### Schema Mismatches

| Entity File | Class Name | @Entity Schema | DDL Schema | Match? | Notes |
|-------------|-----------|---------------|------------|--------|-------|
| `teacher/entities/message.entity.ts` | `Message` | `DB_SCHEMAS.COMMUNICATION` = `communication` | `communication` | MATCH | Uses legacy `@Entity(name, {schema})` syntax — functional but non-standard |
| `teacher/entities/message.entity.ts` | `MessageParticipant` | `DB_SCHEMAS.COMMUNICATION` = `communication` | `communication` | MATCH | Same file, 2nd class |
| `auth/entities/user-suspension.entity.ts` | `UserSuspension` | `DB_SCHEMAS.AUTH` = `auth_management` | `auth_management` | MATCH | |
| `auth/entities/user-preferences.entity.ts` | `UserPreferences` | `DB_SCHEMAS.AUTH` = `auth_management` | `auth_management` | MATCH | |

> **Finding:** No schema-level mismatches found. All entity schemas resolve correctly through DB_SCHEMAS constants.

---

## Key Findings Summary

### Finding 1: Legacy Conceptual Model Still in Docs (HIGH IMPACT)
`docs/20-architecture/schema-reference/04-gamification.md` documents 6 conceptual table names (`xp_transactions`, `levels`, `rank_definitions`, `student_gamification`, `gamification_config`, `streak_records`) that **do not exist in DDL** and have **no TypeORM entities**. These are legacy tables from early design that were replaced by the current `user_stats`, `user_ranks`, `maya_ranks`, and `gamification_parameters` tables. This creates confusion about what the actual data model is.

**Affected doc:** `docs/20-architecture/schema-reference/04-gamification.md`
**Entity classes that DO exist for these concepts:** `UserStats`, `UserRank`, `MayaRankEntity`, `GamificationParameter`

### Finding 2: Schema-reference/19-communication.md is Stale (MEDIUM IMPACT)
The `19-communication.md` file explicitly states "Sin entity - R3-07" for all 4 communication tables, but these entities now fully exist:
- `communication/entities/conversation.entity.ts` → `Conversation`
- `communication/entities/conversation-participant.entity.ts` → `ConversationParticipant`
- `teacher/entities/message.entity.ts` → `Message`, `MessageParticipant`

**Affected doc:** `docs/20-architecture/schema-reference/19-communication.md`

### Finding 3: 4 Entities Use Hardcoded Table Names Instead of Constants (LOW IMPACT)
The following entities bypass `DB_TABLES` constants by hardcoding table name strings:
- `teacher/entities/resource-rating.entity.ts`: `name: 'resource_ratings'`
- `teacher/entities/resource-download.entity.ts`: `name: 'resource_downloads'`
- `teacher/entities/resource-comment.entity.ts`: `name: 'resource_comments'`
- `gamification/peer-challenges/entities/user-skill-rating.entity.ts`: `name: 'user_skill_ratings'`

All 4 match DDL correctly, so there is no runtime error. However, the constants `DB_TABLES.EDUCATIONAL.RESOURCE_RATINGS`, `DB_TABLES.EDUCATIONAL.RESOURCE_COMMENTS`, `DB_TABLES.EDUCATIONAL.RESOURCE_DOWNLOADS`, and `DB_TABLES.SOCIAL.USER_SKILL_RATINGS` already exist and should be used for consistency.

**Affected files:** 4 entity files listed above.

### Finding 4: 23 Entities Undocumented in Schema-Reference (MEDIUM IMPACT)
The following entity categories lack schema-reference documentation:
- **Admin/system entities (10):** `ActivityLog`, `NotificationSettings`, `NotificationSettingsGlobal`, `RateLimit`, `EnvironmentConfig`, `TenantConfiguration`, `SystemLog`, `PerformanceMetric`, `SystemAlert`, `UserActivityLog`
- **Educational entities (4):** `Taxonomy`, `ContentMetadata`, `ExerciseTypeRubric`, `ExerciseMechanicMapping`
- **Gamification entities (4):** `UserEquippedItem`, `ComodinUse`, `Achievement`, `MLCoinsTransaction`
- **Progress entities (1):** `Certificate`
- **Social entities (3):** `GuildMissionContribution`, `TeamVsTeamChallenge`, `UserReport`
- **Audit entity (1):** `AuditLog` (table documented but no **Entity:** tag)

### Finding 5: auth.md Documents 6+ Legacy/Conceptual Tables (LOW IMPACT)
`docs/20-architecture/schema-reference/01-auth.md` documents `auth.user_profiles`, `auth.sessions`, `auth.refresh_tokens`, `auth.oauth_connections`, `auth.password_resets`, and `auth.login_attempts` — all marked as "legacy model" in the doc header. None have TypeORM entities. These are kept as historical reference (the doc header explains them), so this is informational only.

### Finding 6: Leaderboard and Store Schemas are Conceptual-Only (LOW IMPACT)
- `12-leaderboard.md` documents 4 conceptual tables (`leaderboard_entries`, `leaderboard_seasons`, `leaderboard_history`, `leaderboard_snapshots`) that don't exist in DDL. Only `leaderboard_metadatas` exists with entity `LeaderboardMetadata`.
- `10-store.md` is correctly marked as deprecated, redirecting to `gamification_system.*`.

---

## Recommendations

| # | Priority | Recommendation | Effort |
|---|----------|---------------|--------|
| R1 | HIGH | Update `04-gamification.md` to reflect actual entities: replace legacy conceptual tables (`xp_transactions`, `levels`, etc.) with real entities (`UserStats`, `UserRank`, `MayaRankEntity`, `GamificationParameter`). Add **Entity:** tags for all gamification entities that exist. | 2h |
| R2 | MEDIUM | Update `19-communication.md` status table to reflect that all 4 communication entities now exist (`Conversation`, `ConversationParticipant`, `Message`, `MessageParticipant`). | 15min |
| R3 | MEDIUM | Add schema-reference entries for the 10 undocumented admin/system entities in `15-settings.md` and `16-audit.md`. | 3h |
| R4 | MEDIUM | Add schema-reference entries for the 4 undocumented educational entities (`Taxonomy`, `ContentMetadata`, `ExerciseTypeRubric`, `ExerciseMechanicMapping`) in `03-education.md`. | 1h |
| R5 | MEDIUM | Add schema-reference entries for undocumented gamification entities (`UserEquippedItem`, `ComodinUse`, `Achievement`, `MLCoinsTransaction`) in `04-gamification.md`. | 1h |
| R6 | MEDIUM | Add schema-reference entry for `Certificate` entity in `06-progress.md`. | 15min |
| R7 | MEDIUM | Add schema-reference entries for social entities (`GuildMissionContribution`, `TeamVsTeamChallenge`, `UserReport`) in `05-social.md`. | 30min |
| R8 | LOW | Replace 4 hardcoded table names in entity files with their respective DB_TABLES constants (resource-rating, resource-download, resource-comment, user-skill-rating). | 15min |
| R9 | LOW | Update `12-leaderboard.md` to clarify that the documented tables are conceptual/planned, and that the only real entity is `LeaderboardMetadata` for the `leaderboard_metadatas` table. | 15min |
| R10 | LOW | Add **Entity:** tags to `16-audit.md` for `AuditLog`, `SystemLog`, `UserActivityLog`, `PerformanceMetric`, `SystemAlert`, `ActivityLog`. | 15min |

---

## Appendix A: Full Entity-to-Table Mapping

Complete mapping of all 157 entity classes to their DDL tables:

### auth module (13 files, 13 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `User` | `users` | `auth` |
| `Profile` | `profiles` | `auth_management` |
| `Tenant` | `tenants` | `auth_management` |
| `UserRole` | `user_roles` | `auth_management` |
| `Role` | `roles` | `auth_management` |
| `Membership` | `memberships` | `auth_management` |
| `AuthProvider` | `auth_providers` | `auth_management` |
| `AuthAttempt` | `auth_attempts` | `auth_management` |
| `UserSession` | `user_sessions` | `auth_management` |
| `EmailVerificationToken` | `email_verification_tokens` | `auth_management` |
| `PasswordResetToken` | `password_reset_tokens` | `auth_management` |
| `SecurityEvent` | `security_events` | `auth_management` |
| `UserPreferences` | `user_preferences` | `auth_management` |
| `UserSuspension` | `user_suspensions` | `auth_management` |
| `TwoFactorToken` | `two_factor_tokens` | `auth_management` |
| `ParentAccount` | `parent_accounts` | `auth_management` |
| `ParentStudentLink` | `parent_student_links` | `auth_management` |
| `ParentNotification` | `parent_notifications` | `auth_management` |

### admin module (16 files, 16 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `ActivityLog` | `activity_logs` | `audit_logging` |
| `AdminReport` | `admin_reports` | `admin_dashboard` |
| `ApiConfiguration` | `api_configurations` | `system_configuration` |
| `BulkOperation` | `bulk_operations` | `admin_dashboard` |
| `EnvironmentConfig` | `environment_configs` | `system_configuration` |
| `FeatureFlag` | `feature_flags` | `system_configuration` |
| `GamificationParameter` | `gamification_parameters` | `system_configuration` |
| `MetricsHistory` | `metrics_history` | `admin_dashboard` |
| `NotificationSettings` | `notification_settings` | `system_configuration` |
| `NotificationSettingsGlobal` | `notification_settings_globals` | `system_configuration` |
| `PerformanceMetric` | `performance_metrics` | `audit_logging` |
| `RateLimit` | `rate_limits` | `system_configuration` |
| `SystemAlert` | `system_alerts` | `audit_logging` |
| `SystemLog` | `system_logs` | `audit_logging` |
| `SystemSetting` | `system_settings` | `system_configuration` |
| `TenantConfiguration` | `tenant_configurations` | `system_configuration` |

### assignments module (4 files, 4 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `Assignment` | `assignments` | `educational_content` |
| `AssignmentExercise` | `assignment_exercises` | `educational_content` |
| `AssignmentStudent` | `assignment_students` | `educational_content` |
| `AssignmentSubmission` | `assignment_submissions` | `educational_content` |

### audit module (3 files, 3 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `AuditLog` | `audit_logs` | `audit_logging` |
| `PendingUserInitialization` | `pending_user_initializations` | `audit_logging` |
| `UserActivityLog` | `user_activity_logs` | `audit_logging` |

### communication module (2 files, 2 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `Conversation` | `conversations` | `communication` |
| `ConversationParticipant` | `conversation_participants` | `communication` |

### content module (10 files, 10 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `ContentAuthor` | `content_authors` | `content_management` |
| `ContentCategory` | `content_categories` | `content_management` |
| `ContentTemplate` | `content_templates` | `content_management` |
| `ContentVersion` | `content_versions` | `content_management` |
| `FlaggedContent` | `flagged_contents` | `content_management` |
| `MarieCurieContent` | `marie_curie_contents` | `content_management` |
| `MediaFile` | `media_files` | `content_management` |
| `MediaMetadata` | `media_metadatas` | `content_management` |
| `ModerationRule` | `moderation_rules` | `content_management` |
| `Tag` | `tags` | `content_management` |

### educational module (14 files, 14 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `AssessmentRubric` | `assessment_rubrics` | `educational_content` |
| `ClassroomModule` | `classroom_modules` | `educational_content` |
| `ContentApproval` | `content_approvals` | `educational_content` |
| `ContentMetadata` | `content_metadatas` | `educational_content` |
| `ContentTag` | `content_tags` | `educational_content` |
| `DifficultyCriteria` | `difficulty_criteria` | `educational_content` |
| `Exercise` | `exercises` | `educational_content` |
| `ExerciseMechanicMapping` | `exercise_mechanic_mappings` | `educational_content` |
| `ExerciseTypeRubric` | `exercise_type_rubrics` | `educational_content` |
| `ExerciseValidationAudit` | `exercise_validation_audits` | `educational_content` |
| `ExerciseValidationConfig` | `exercise_validation_configs` | `educational_content` |
| `MediaAttachment` | `media_attachments` | `educational_content` |
| `MediaResource` | `media_resources` | `educational_content` |
| `Module` | `modules` | `educational_content` |
| `ModuleDependencies` | `module_dependencies` | `educational_content` |
| `Taxonomy` | `taxonomies` | `educational_content` |

### gamification module (18 files, 18 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `Achievement` | `achievements` | `gamification_system` |
| `AchievementCategory` | `achievement_categories` | `gamification_system` |
| `ActiveBoost` | `active_boosts` | `gamification_system` |
| `ClassroomMission` | `classroom_missions` | `gamification_system` |
| `ComodinesInventory` | `comodines_inventory` | `gamification_system` |
| `ComodinUsageLog` | `comodin_usage_logs` | `gamification_system` |
| `ComodinUsageTracking` | `comodin_usage_trackings` | `gamification_system` |
| `ComodinUse` | `comodin_uses` | `gamification_system` |
| `InventoryTransaction` | `inventory_transactions` | `gamification_system` |
| `LeaderboardMetadata` | `leaderboard_metadatas` | `gamification_system` |
| `MayaRankEntity` | `maya_ranks` | `gamification_system` |
| `Mission` | `missions` | `gamification_system` |
| `MissionTemplate` | `mission_templates` | `gamification_system` |
| `MLCoinsTransaction` | `ml_coins_transactions` | `gamification_system` |
| `ShopCategory` | `shop_categories` | `gamification_system` |
| `ShopItem` | `shop_items` | `gamification_system` |
| `UserAchievement` | `user_achievements` | `gamification_system` |
| `UserEquippedItem` | `user_equipped_items` | `gamification_system` |
| `UserPurchase` | `user_purchases` | `gamification_system` |
| `UserRank` | `user_ranks` | `gamification_system` |
| `UserStats` | `user_stats` | `gamification_system` |
| `UserSkillRating` | `user_skill_ratings` | `social_features` |

### lti module (3 files, 3 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `LtiConsumer` | `lti_consumers` | `lti_integration` |
| `LtiGradePassback` | `lti_grade_passbacks` | `lti_integration` |
| `LtiSession` | `lti_sessions` | `lti_integration` |

### notifications module (7 files, 7 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `Notification` | `notifications` | `notifications` |
| `NotificationLog` | `notification_logs` | `notifications` |
| `NotificationPreference` | `notification_preferences` | `notifications` |
| `NotificationQueue` | `notification_queue` | `notifications` |
| `NotificationTemplate` | `notification_templates` | `notifications` |
| `RateLimitLog` | `rate_limit_logs` | `notifications` |
| `UserDevice` | `user_devices` | `notifications` |

### progress module (21 files, 21 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `Certificate` | `certificates` | `progress_tracking` |
| `EngagementMetrics` | `engagement_metrics` | `progress_tracking` |
| `ExerciseAttempt` | `exercise_attempts` | `progress_tracking` |
| `ExerciseSubmission` | `exercise_submissions` | `progress_tracking` |
| `LearningPath` | `learning_paths` | `progress_tracking` |
| `LearningPathModule` | `learning_path_modules` | `progress_tracking` |
| `LearningSession` | `learning_sessions` | `progress_tracking` |
| `ManualReview` | `manual_reviews` | `progress_tracking` |
| `MasteryTracking` | `mastery_trackings` | `progress_tracking` |
| `ModuleCompletionTracking` | `module_completion_trackings` | `progress_tracking` |
| `ModuleProgress` | `module_progress` | `progress_tracking` |
| `ProgressSnapshot` | `progress_snapshots` | `progress_tracking` |
| `ScheduledMission` | `scheduled_missions` | `progress_tracking` |
| `SkillAssessment` | `skill_assessments` | `progress_tracking` |
| `TeacherAlertConfiguration` | `teacher_alert_configurations` | `progress_tracking` |
| `TeacherIntervention` | `teacher_interventions` | `progress_tracking` |
| `TeacherNote` | `teacher_notes` | `progress_tracking` |
| `UserCurrentLevel` | `user_current_levels` | `progress_tracking` |
| `UserDifficultyProgress` | `user_difficulty_progresses` | `progress_tracking` |
| `UserLearningPath` | `user_learning_paths` | `progress_tracking` |

### social module (25 files, 25 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `AssignmentClassroom` | `assignment_classrooms` | `social_features` |
| `ChallengeParticipant` | `challenge_participants` | `social_features` |
| `ChallengeResult` | `challenge_results` | `social_features` |
| `Classroom` | `classrooms` | `social_features` |
| `ClassroomMember` | `classroom_members` | `social_features` |
| `DiscussionThread` | `discussion_threads` | `social_features` |
| `FriendRequest` | `friend_requests` | `social_features` |
| `Friendship` | `friendships` | `social_features` |
| `Guild` | `guilds` | `social_features` |
| `GuildEmblem` | `guild_emblems` | `social_features` |
| `GuildJoinRequest` | `guild_join_requests` | `social_features` |
| `GuildMember` | `guild_members` | `social_features` |
| `GuildMission` | `guild_missions` | `social_features` |
| `GuildMissionContribution` | `guild_mission_contributions` | `social_features` |
| `PeerChallenge` | `peer_challenges` | `social_features` |
| `School` | `schools` | `social_features` |
| `SocialInteraction` | `social_interactions` | `social_features` |
| `Team` | `teams` | `social_features` |
| `TeamChallenge` | `team_challenges` | `social_features` |
| `TeamMember` | `team_members` | `social_features` |
| `TeamVsTeamChallenge` | `team_vs_team_challenges` | `social_features` |
| `TeacherClassroom` | `teacher_classrooms` | `social_features` |
| `UserActivity` | `user_activities` | `social_features` |
| `UserBlock` | `user_blocks` | `social_features` |
| `UserFollow` | `user_follows` | `social_features` |
| `UserReport` | `user_reports` | `social_features` |

### teacher module (9 files, 10 classes)
| Entity Class | Table | Schema |
|-------------|-------|--------|
| `Message` | `messages` | `communication` |
| `MessageParticipant` | `message_participants` | `communication` |
| `ResourceComment` | `resource_comments` | `educational_content` |
| `ResourceDownload` | `resource_downloads` | `educational_content` |
| `ResourceRating` | `resource_ratings` | `educational_content` |
| `ScheduledReport` | `scheduled_reports` | `social_features` |
| `SharedReport` | `shared_reports` | `social_features` |
| `StudentInterventionAlert` | `student_intervention_alerts` | `progress_tracking` |
| `TeacherContent` | `teacher_contents` | `educational_content` |
| `TeacherReport` | `teacher_reports` | `social_features` |

---

## Appendix B: DDL Tables WITHOUT Entities

DDL tables that have NO corresponding TypeORM entity (16 data_warehouse tables excluded — DDL-only by design):

| DDL Table | Schema | Notes |
|-----------|--------|-------|
| (All `data_warehouse.*` tables) | `data_warehouse` | 16 tables — DDL-only by design, no entities needed |

> **Verdict:** All non-data_warehouse tables have TypeORM entity coverage. The `data_warehouse` schema is explicitly documented as DDL-only (accessed via SQL raw queries and materialized views).

---

*Audit completed: 2026-02-27 | Read-only — no files modified*
