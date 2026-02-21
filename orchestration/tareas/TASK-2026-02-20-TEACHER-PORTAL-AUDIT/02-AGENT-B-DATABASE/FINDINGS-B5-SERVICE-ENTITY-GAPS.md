# FINDINGS-B5: Service-Entity Gaps Audit

**Agent:** B (Database Coherence)
**Date:** 2026-02-20
**Scope:** All 24 services in teacher module -- entity injection, datasource registration, cross-datasource queries

---

## Service-Entity Mapping

### 1. StudentBlockingService

| Injected Entity | Datasource | Registered in teacher.module.ts | Status |
|----------------|------------|-------------------------------|--------|
| `ClassroomMember` | social | YES (line 169) | OK |
| `TeacherClassroom` | social | YES (line 169) | OK |
| `Profile` | auth | YES (line 163) | OK |

**Notes:** None. Clean single-datasource access (social + auth).

---

### 2. TeacherDashboardService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `ExerciseSubmission` | progress | YES (line 177) | OK |
| `Profile` | auth | YES (line 163) | OK |
| `ModuleProgress` | progress | YES (line 177) | OK |
| `Classroom` | social | YES (line 169) | OK |
| `ClassroomMember` | social | YES (line 169) | OK |

**Notes:** Accesses 3 datasources (progress, auth, social). No cross-datasource joins -- each entity queried independently.

---

### 3. StudentProgressService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `ExerciseSubmission` | progress | YES | OK |
| `Profile` | auth | YES | OK |
| `ModuleProgress` | progress | YES | OK |
| `ClassroomMember` | social | YES | OK |
| `Classroom` | social | YES | OK |
| `User` | auth | YES | OK |
| `UserStats` | gamification | YES (line 186) | OK |
| `Module (Educational)` | educational | YES (line 183) | OK |
| `Exercise` | educational | YES (line 183) | OK |

**Notes:** Accesses 4 datasources. Highest entity count among services. No cross-datasource join issues.

---

### 4. GradingService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `ExerciseSubmission` | progress | YES | OK |

**Notes:** Single datasource access. Uses raw `createQueryBuilder` with cross-schema joins:
- `leftJoinAndSelect('auth_management.profiles', ...)` -- raw SQL join, not TypeORM relation
- `leftJoinAndSelect('educational_content.exercises', ...)` -- raw SQL join

**GAP:** These raw cross-schema joins work because they bypass TypeORM's relation system and go directly to PostgreSQL. This is correct behavior for cross-datasource queries but means type safety is reduced.

---

### 5. AnalyticsService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `ExerciseSubmission` | progress | YES | OK |
| `Profile` | auth | YES | OK |
| `Classroom` | social | YES | OK |
| `ClassroomMember` | social | YES | OK |
| `Assignment` | educational | YES (line 192) | OK |
| `AssignmentSubmission` | educational | YES (line 192) | OK |
| `UserStats` | gamification | YES | OK |
| `Achievement` | gamification | YES | OK |
| `UserAchievement` | gamification | YES | OK |
| `MasteryTracking` | progress | YES | OK |
| `SkillAssessment` | progress | YES | OK |

**Also injects:** `CACHE_MANAGER`, `StudentProgressService` (service dependency)

**Notes:** Accesses 4 datasources (progress, auth, social, educational, gamification = 5 datasources total). Highest datasource count. No issues found.

---

### 6. StudentRiskAlertService (CRON)

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `Profile` | auth | YES | OK |
| `Classroom` | social | YES | OK |
| `ClassroomMember` | social | YES | OK |

**Also injects:** `AnalyticsService`, `NotificationService`

**Notes:**
- **CRON job:** `@Cron(CronExpression.EVERY_DAY_AT_8AM)` -- scans all students daily
- **Cross-module dependency:** Depends on `AnalyticsService.getStudentInsights()` which itself accesses 5 datasources
- **Potential issue:** `findByIds` is deprecated in TypeORM 0.3.x (line 144, 378). Use `findBy({ id: In(ids) })` instead.
- **Performance concern:** `getCurrentAlerts` (line 358) loads ALL active classroom members then filters in-memory. For large tenants this could be slow. Consider adding a `classroom_id` filter to the query.

---

### 7. ReportsService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `Profile` | auth | YES | OK |
| `Classroom` | social | YES | OK |
| `ClassroomMember` | social | YES | OK |
| `ExerciseSubmission` | progress | YES | OK |

**Also injects:** `AnalyticsService`, `StorageService`, `TeacherReportsService`

**Notes:** Generates PDF/Excel reports. Uses puppeteer for PDF generation. No entity-datasource issues.

---

### 8. TeacherClassroomsCrudService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `Classroom` | social | YES | OK |
| `TeacherClassroom` | social | YES | OK |
| `ClassroomMember` | social | YES | OK |
| `Profile` | auth | YES | OK |
| `User` | auth | YES | OK |
| `ModuleProgress` | progress | YES | OK |
| `ExerciseSubmission` | progress | YES | OK |
| `Module (Educational)` | educational | YES | OK |
| `Exercise` | educational | YES | OK |
| `UserStats` | gamification | YES | OK |

**Also injects:** `@InjectDataSource('social')` for raw queries

**Notes:** Accesses 5 datasources. Uses DataSource for raw SQL in complex aggregation queries. No issues.

---

### 9. InterventionAlertsService (CRON)

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `StudentInterventionAlert` | progress | YES (line 195) | OK |

**Notes:**
- **CRON job:** `@Cron(CronExpression.EVERY_DAY_AT_2AM)` -- generates alerts via SQL function
- Calls `progress_tracking.generate_student_alerts()` via raw query
- Uses raw SQL for cross-schema access verification (`social_features.teacher_classrooms`)
- Single entity injection, clean design

---

### 10. TeacherMessagesService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `Message` | communication | YES (line 198) | OK |
| `MessageParticipant` | communication | YES (line 198) | OK |
| `Profile` | auth | YES | OK |

**Notes:** Clean 2-datasource access. Profile used for display name resolution.

---

### 11. TeacherContentService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `TeacherContent` | educational | YES (line 192) | OK |
| `Profile` | auth | YES | OK |

**Notes:** Clean 2-datasource access.

---

### 12. BonusCoinsService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `UserStats` | gamification | YES | OK |
| `ClassroomMember` | social | YES | OK |
| `Classroom` | social | YES | OK |
| `Profile` | auth | YES | OK |

**Also injects:** `@InjectDataSource('gamification')` for transaction support

**Notes:** Uses gamification DataSource for transactional ML Coins updates. 3 datasources accessed.

---

### 13. ExerciseResponsesService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `ExerciseAttempt` | progress | YES (line 177) | OK |
| `Profile` | auth | YES | OK |

**Also injects:** `@InjectDataSource('progress')` for raw queries

**Notes:** Uses DataSource for complex cross-schema queries with RLS validation.

---

### 14. StorageService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| (none) | - | - | OK |

**Notes:** Pure filesystem service. No database access.

---

### 15. TeacherReportsService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `TeacherReport` | social | YES (line 169) | OK |

**Also injects:** `@InjectDataSource('social')` for SET LOCAL transactions (RLS support)

**Notes:**
- **RLS-aware:** Uses `SET LOCAL app.current_user_id` in every read query via DataSource transaction
- UUID validation before SET LOCAL to prevent SQL injection (isUUID check)
- Accesses only 1 datasource (social)
- **Potential concern:** SET LOCAL uses string interpolation (`'${teacherId}'`). While protected by isUUID validation, parameterized queries would be safer.

---

### 16. ManualReviewService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `ManualReview` | progress | YES (line 177) | OK |
| `ExerciseSubmission` | progress | YES | OK |
| `Profile` | auth | YES | OK |
| `Exercise` | educational | YES | OK |
| `ExerciseTypeRubric` | educational | YES (line 183) | OK |

**Also injects:** `ExerciseSubmissionService` (from ProgressModule), `AuditService`, `NotificationService`

**Notes:** Complex service with cross-module dependencies. 3 datasources accessed. No issues with entity registration.

---

### 17. ScheduledReportsService (CRON)

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `ScheduledReport` | social | YES (line 169) | OK |

**Also injects:** `ReportsService`, `TeacherReportsService`, `MailService`

**Notes:**
- **CRON job:** `@Cron('0 * * * *')` -- checks every hour
- Cascading dependency chain: ScheduledReportsService -> ReportsService -> AnalyticsService -> 5 datasources
- No direct multi-datasource access (delegates to ReportsService)

---

### 18. SharedReportsService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `SharedReport` | social | YES (line 169) | OK |
| `TeacherReport` | social | YES (line 169) | OK |

**Notes:** Single datasource access (social). Clean design.

---

### 19. AlertConfigService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `TeacherAlertConfiguration` | progress | YES (line 177) | OK |
| `Profile` | auth | YES | OK |
| `Classroom` | social | YES | OK |

**Notes:** 3 datasources. Classroom accessed only for display name resolution.

---

### 20. TeacherAssignmentsService

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| `Assignment` | educational | YES (line 192) | OK |
| `AssignmentSubmission` | educational | YES (line 192) | OK |
| `AssignmentExercise` | educational | YES (line 192) | OK |
| `AssignmentClassroom` | social | YES (line 169) | OK |
| `ClassroomMember` | social | YES | OK |

**Notes:** 2 datasources (educational, social). No issues.

---

### 21. MLPredictorService (NOT injected in module -- standalone)

| Injected Entity | Datasource | Registered | Status |
|----------------|------------|------------|--------|
| (none) | - | - | OK |

**IMPORTANT FINDING:** MLPredictorService is exported from `index.ts` but is NOT registered as a provider in `teacher.module.ts`. It is also NOT imported by any service in the teacher module.

**Status:** ORPHAN SERVICE -- it exists in the codebase but is never instantiated. This is consistent with the documented TODO notes (6 heuristic placeholders, "version 0.0.1-heuristic").

**Recommendation:** The file should either be:
1. Registered in teacher.module.ts if it will be used, or
2. Moved to a `_deprecated/` or `_future/` directory, or
3. Deleted if ML integration is not planned

---

### 22. TeacherGradesController (Note: Grading)

Already covered in GradingService (#4 above).

---

## Special Service Deep-Dives

### MLPredictorService -- 6 TODO Heuristic Placeholders

| Method | Current Implementation | TODO |
|--------|----------------------|------|
| `predictCompletion()` | Weighted average (40% score, 30% completion, 20% streak, 10% struggles) | Replace with ML model |
| `predictDropoutRisk()` | Inverse of completion + inactivity penalty | Replace with dedicated dropout model |
| `predictRiskLevel()` | Threshold-based classification (>60% high, >30% medium) | Replace with ML classification |
| `getFeatureImportance()` | Static hardcoded weights | Get from trained model |
| `normalize()` | Helper, no TODO | - |
| `weightedAverage()` | Helper, no TODO | - |

**Assessment:** This service is a well-documented placeholder. It is not registered in the module and not used at runtime. The documented integration patterns (Python/FastAPI, TensorFlow.js, AWS SageMaker) show a clear migration path.

### TeacherReportsService -- RLS-Aware Transactions

**Pattern:** Every read method uses a DataSource transaction with `SET LOCAL app.current_user_id`:
```
return this.dataSource.transaction(async (manager) => {
  await manager.query(`SET LOCAL app.current_user_id = '${teacherId}'`);
  // ... query using manager
});
```

**Security Note:** Uses `isUUID()` validation before string interpolation. While this prevents SQL injection for UUID values, the pattern of string interpolation in SQL is inherently risky. The `SET LOCAL` PostgreSQL command does not support parameterized placeholders (`$1`), which is why string interpolation is used. This is documented and justified.

### StudentRiskAlertService -- CRON Job Analysis

- **Schedule:** Daily at 8:00 AM
- **Process:** Scans all students with `STUDENT` role, checks risk via AnalyticsService
- **Batch size:** 10 students at a time with 1-second delay between batches
- **Notification:** Sends to teachers via NotificationService, admin summary for high-risk students
- **Concern:** `findByIds` deprecated in TypeORM 0.3.x (2 occurrences, lines 144, 378)

### InterventionAlertsService -- CRON + SQL Function

- **Schedule:** Daily at 2:00 AM
- **Process:** Calls `progress_tracking.generate_student_alerts()` SQL function
- **SQL Function Status:** VERIFIED -- exists in DDL at `progress_tracking/functions/15-generate_student_alerts.sql`
- **Function generates 6 alert types:** no_activity, low_score, repeated_failures, declining_trend, excessive_time, low_engagement
- **Deduplication:** Function includes NOT EXISTS checks to prevent duplicate alerts

---

## Datasource Access Summary

| Service | auth | social | progress | educational | gamification | communication | Total DS |
|---------|------|--------|----------|-------------|--------------|---------------|----------|
| StudentBlockingService | X | X | | | | | 2 |
| TeacherDashboardService | X | X | X | | | | 3 |
| StudentProgressService | X | X | X | X | X | | 5 |
| GradingService | | | X | | | | 1 |
| AnalyticsService | X | X | X | X | X | | 5 |
| StudentRiskAlertService | X | X | | | | | 2 |
| ReportsService | X | X | X | | | | 3 |
| TeacherClassroomsCrudService | X | X | X | X | X | | 5 |
| InterventionAlertsService | | | X | | | | 1 |
| TeacherMessagesService | X | | | | | X | 2 |
| TeacherContentService | X | | | X | | | 2 |
| BonusCoinsService | X | X | | | X | | 3 |
| ExerciseResponsesService | X | | X | | | | 2 |
| StorageService | | | | | | | 0 |
| TeacherReportsService | | X | | | | | 1 |
| ManualReviewService | X | | X | X | | | 3 |
| ScheduledReportsService | | X | | | | | 1 |
| SharedReportsService | | X | | | | | 1 |
| AlertConfigService | X | X | X | | | | 3 |
| TeacherAssignmentsService | | X | | X | | | 2 |
| MLPredictorService | | | | | | | 0 (orphan) |

---

## Summary of Findings

| ID | Severity | Finding |
|----|----------|---------|
| B5-01 | MEDIUM | MLPredictorService is an orphan -- exported but NOT registered as provider in teacher.module.ts, never instantiated |
| B5-02 | LOW | StudentRiskAlertService uses deprecated `findByIds` method (TypeORM 0.3.x deprecation) |
| B5-03 | LOW | StudentRiskAlertService.getCurrentAlerts loads ALL classroom members then filters in-memory |
| B5-04 | INFO | TeacherReportsService uses string interpolation in SET LOCAL (protected by isUUID validation) |
| B5-05 | INFO | GradingService uses raw cross-schema SQL joins (intentional for cross-datasource queries) |
| B5-06 | INFO | 3 CRON jobs in teacher module: StudentRiskAlertService (8AM), InterventionAlertsService (2AM), ScheduledReportsService (hourly) |

**Overall Entity-Datasource Registration Score: 100%** -- All entities used by services are correctly registered in `teacher.module.ts` with the appropriate datasource.

---

*Generated by Agent B - Database Coherence Audit*
