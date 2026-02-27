# P3-3C-1: UX Flows vs DB Constraints Audit

**Task:** TASK-2026-02-27-AUDITORIA-DOCS
**Phase:** P3 (Cross-Layer Consistency)
**Subtask:** 3C-1 — UX Flow vs Database Constraint Alignment
**Date:** 2026-02-27
**Auditor:** Claude Sonnet 4.6 (read-only analysis)

---

## Methodology

Each of the 10 critical UX flows was read and cross-checked against the actual DDL
constraints in `apps/database/ddl/`. For each flow the audit verifies:

1. FK references (do table/column names match the DDL?)
2. ENUM values (are status/type strings used in the flow valid ENUM members?)
3. NOT NULL fields (are all required fields present in the described INSERT operations?)
4. CHECK constraints (are numeric ranges, status transitions, and string sets valid?)
5. UNIQUE constraints (are duplicate-prevention rules acknowledged?)
6. RLS policies (can the described actors actually perform the operations under RLS?)

Severity codes:
- **BLOCKER** — operation will fail at DB level if executed as described
- **WARNING** — logic inconsistency or undocumented constraint; may fail or produce silent data corruption
- **INFO** — minor naming deviation, documentation gap, or deprecated note

---

## Flow 1: Student Registration

**Doc:** `docs/30-ux-ui/flujos/auth/FLUJO-REGISTRO-LOGIN.md`
**DDL tables examined:**
- `auth_management.profiles` (`tables/03-profiles.sql`)
- `auth_management.tenants` (`tables/01-tenants.sql`)
- `auth_management.user_sessions` (`tables/11-user_sessions.sql`)
- `auth.users` (`tables/01-users.sql`)

**DB Operations described:** 3 (INSERT users, INSERT profiles, INSERT user_sessions)

### Findings

**INFO-1.1 — `tenant_id` NOT NULL but flow does not mention it explicitly**
`profiles.tenant_id` is `NOT NULL` with FK to `auth_management.tenants`. The flow diagram
shows `INSERT users + profiles` but the narrative ("Registro crea perfil academico del
usuario con rol y tenant") does mention "tenant". The DDL trigger
`trg_set_default_tenant` handles assignment automatically, so runtime is safe.
However the flow does not document that tenant resolution happens via trigger, which
could confuse future implementers.

**INFO-1.2 — `profiles.email` format CHECK constraint not mentioned**
`CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+...')` must pass.
The flow does not note that registration will fail for non-standard email formats. This
is a documentation gap.

**INFO-1.3 — `user_sessions.device_type` CHECK constraint**
`CONSTRAINT user_sessions_device_type_check CHECK (device_type = ANY (ARRAY['desktop',
'mobile', 'tablet', 'unknown']))`. The flow mentions session creation but not the
device_type constraint. Any value outside those 4 strings will raise a DB error.

**INFO-1.4 — `user_sessions.expires_at` is NOT NULL**
The flow does not mention that `expires_at` must be provided when creating a session.
`session_token` is also `NOT NULL UNIQUE`. These are implicit in the service code but not
called out in the UX doc.

**INFO-1.5 — Leaderboard table `leaderboard_metadata` name discrepancy**
The flow references `gamification_system.user_stats` (via triggers). The DDL table is
actually named `gamification_system.leaderboard_metadatas` (plural), not
`leaderboard_metadata` as cited in the leaderboard flow. This is not relevant to
registration but is a cross-cutting naming issue flagged here for context.

**Constraint Violations: 0 BLOCKERs**
Flow is consistent with DDL. Soft documentation gaps only.

---

## Flow 2: Exercise Attempt (M1-M2 Auto-Grade)

**Doc:** `docs/30-ux-ui/flujos/student/FLUJO-EJERCICIO-COMPLETO.md`
**DDL tables examined:**
- `progress_tracking.exercise_attempts` (`tables/03-exercise_attempts.sql`)
- `progress_tracking.exercise_submissions` (`tables/04-exercise_submissions.sql`)
- `gamification_system.user_stats` (`tables/01-user_stats.sql`)
- `gamification_system.ml_coins_transactions` (`tables/05-ml_coins_transactions.sql`)

**DB Operations described:** 4+ (autosave, INSERT attempt, INSERT submission, UPDATE
user_stats, INSERT ml_coins_transactions)

### Findings

**WARNING-2.1 — `exercise_attempts.submitted_answers` is NOT NULL**
`CONSTRAINT exercise_attempts_pkey`: `submitted_answers jsonb NOT NULL`. The flow
describes an autosave step (`POST /progress/exercises/:id/autosave`) that presumably
saves partial progress. If autosave writes to `exercise_attempts` with an empty or null
`submitted_answers`, the INSERT will fail. The flow does not document this constraint.

**INFO-2.2 — `exercise_submissions.status` CHECK constraint limits valid states**
The DDL CHECK constraint allows: `'draft', 'submitted', 'graded', 'reviewed',
'pending_review'`. The flow transitions `submitted → graded` (auto-grade path). These
values are valid. The flow is correct on status transitions.

**INFO-2.3 — `exercise_submissions.score` CHECK allows 0 to max_score**
`CONSTRAINT check_score_range CHECK ((score >= 0) AND (score <= max_score))`. The flow
does not document a max_score upper bound. If a reward calculation ever produces
`score > max_score`, the UPDATE will fail. Low risk because `max_score DEFAULT 100` and
typical scores are percentage-based.

**INFO-2.4 — `ml_coins_transactions.reference_type` CHECK constraint**
`CONSTRAINT ml_coins_transactions_reference_type_check CHECK (reference_type = ANY
(ARRAY['exercise', 'module', 'achievement', 'powerup', 'admin', 'streak', 'rank',
'mission', 'rank_promotion']))`. When the flow creates the ML coins transaction after
exercise completion, `reference_type` must be one of those 9 values. The flow does not
specify which value is used; service code should use `'exercise'` but this is
undocumented in the UX doc.

**WARNING-2.5 — No `tenant_id` mentioned in `exercise_attempts` INSERT**
`exercise_attempts` does not have a `tenant_id` column, but multi-tenant RLS filters via
`classroom_members` join in the teacher SELECT policy. The student INSERT policy is
`(user_id = gamilit.get_current_user_id())` which is correct. No blocker here, but the
flow does not discuss how RLS allows students to insert their own attempts.

**Constraint Violations: 0 BLOCKERs, 2 WARNINGs**

---

## Flow 3: XP Award (Achievement / Exercise Completion)

**Doc:** `docs/30-ux-ui/flujos/student/FLUJO-EJERCICIO-COMPLETO.md` (section: XP/reward
pipeline) and `docs/30-ux-ui/flujos/student/FLUJO-LOGROS-MISIONES-CLAIM.md`
**DDL tables examined:**
- `gamification_system.user_stats` (`tables/01-user_stats.sql`)
- `gamification_system.ml_coins_transactions` (`tables/05-ml_coins_transactions.sql`)
- `gamification_system.user_achievements` (`tables/04-user_achievements.sql`)

**DB Operations described:** UPDATE user_stats, INSERT ml_coins_transactions

### Findings

**INFO-3.1 — `user_stats.total_xp` has `CHECK (total_xp >= 0)` — no overflow guard documented**
The flow describes XP accumulation incrementally. There is no documented upper bound in
the DDL (integer max ~2.1B), which is practically safe, but the flow does not mention
that `total_xp` cannot go negative. A bug that subtracts XP without guard would hit the
CHECK constraint.

**INFO-3.2 — `user_stats.ml_coins` has `CHECK (ml_coins >= 0)`**
The reward flow credits ML Coins via transaction. The DDL check prevents negative
balances. The flow does not document this constraint. Service code in `shop.service.ts`
already validates balance before deduction, so runtime is safe.

**INFO-3.3 — `ml_coins_transactions.transaction_type` ENUM: no `earned_xp` value exists**
The `transaction_type` ENUM (14 values) covers `earned_exercise`, `earned_achievement`,
`earned_module`, `earned_rank`, `earned_streak`, `earned_daily`, `earned_bonus`. XP is
tracked in `user_stats.total_xp` directly (not via a separate `xp_transactions` table).
The flow text conflates "XP transactions" with "ML Coins transactions". There is no
`xp_transactions` table — XP is recorded only in `user_stats`. This is architecturally
correct but the flow description ("GM->>DB: Actualiza user_stats y transacciones") is
potentially confusing.

**INFO-3.4 — `user_achievements.is_completed` column used by flow, DDL uses `is_completed`**
The flow references `is_completed=true, rewards_claimed=false` (section 5). The DDL
column is `is_completed boolean DEFAULT false`. Correct name match.

**INFO-3.5 — DB function `check_and_award_achievements()` documented as @DEPRECATED**
The flow correctly notes (REC-005) that the DB function uses UPPERCASE condition types
that do not match the seeds' lowercase values. The flow documents that evaluation is
backend-only. This is a known documented issue, not a new finding.

**Constraint Violations: 0 BLOCKERs, 0 WARNINGs**
Flow is consistent. Minor documentation clarity issues only.

---

## Flow 4: Achievement Unlock

**Doc:** `docs/30-ux-ui/flujos/student/FLUJO-LOGROS-MISIONES-CLAIM.md` (section
AchievementDetection)
**DDL tables examined:**
- `gamification_system.user_achievements` (`tables/04-user_achievements.sql`)
- `gamification_system.achievements` (`tables/03-achievements.sql`)

**DB Operations described:** INSERT user_achievements, UPDATE rewards_claimed

### Findings

**INFO-4.1 — `user_achievements` has UNIQUE(user_id, achievement_id)**
`CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id,
achievement_id)`. The flow states the backend uses `ON CONFLICT DO NOTHING` for
idempotence. This constraint protects against double-insertion but the flow does not
explicitly mention that the INSERT must be `ON CONFLICT DO NOTHING` or similar. If the
service code does a plain INSERT and the achievement already exists, it will throw a
unique violation error.

**INFO-4.2 — `user_achievements.progress` CHECK `(progress >= 0)` but no upper bound**
The flow describes progress as a percentage (0-100 implied). The DDL only enforces
`progress >= 0` with no upper bound. If a bug sends progress > 100, it will silently
accept it.

**INFO-4.3 — RLS: No INSERT policy defined on `user_achievements`**
The DDL defines only SELECT policies for `user_achievements`:
- `user_achievements_select_admin`
- `user_achievements_select_own`

There is no INSERT or UPDATE RLS policy. This means:
- Inserts are allowed only if RLS is disabled or the role has BYPASSRLS.
- The comment in `user_stats.sql` shows `user_stats_update_system USING (true)` pattern,
  but `user_achievements` lacks equivalent INSERT policy.

This is a **WARNING**: if RLS is strictly enforced for `gamilit_user` without BYPASSRLS,
backend service calls to INSERT `user_achievements` from the achievement detection service
will fail silently or raise a permission error at runtime.

**WARNING-4.3 confirmed: No INSERT RLS policy on `gamification_system.user_achievements`**
The flow relies on `AchievementsService.detectAndGrantEarned()` inserting rows into this
table. If RLS is enforced at the DB level without BYPASSRLS on `gamilit_user`, this will
fail. Severity is WARNING because the current CLAUDE.md notes "BYPASSRLS still active on
gamilit_user role (CORR-F2-01b)" — meaning it works at runtime, but the fix to remove
BYPASSRLS will break this flow until an INSERT policy is added.

**Constraint Violations: 0 BLOCKERs, 1 WARNING**

---

## Flow 5: Store Purchase

**Doc:** `docs/30-ux-ui/flujos/student/FLUJO-TIENDA-COMPRA.md` and
`docs/30-ux-ui/flujos/student/FLUJO-COMPRA-INVENTARIO-EQUIPAR.md`
**DDL tables examined:**
- `gamification_system.shop_items` (`tables/18-shop_items.sql`)
- `gamification_system.user_purchases` (`tables/19-user_purchases.sql`)
- `gamification_system.ml_coins_transactions` (`tables/05-ml_coins_transactions.sql`)
- `gamification_system.user_stats` (`tables/01-user_stats.sql`)
- `gamification_system.user_equipped_items` (`tables/21-user_equipped_items.sql`)

**DB Operations described:** validate balance, INSERT ml_coins_transactions, INSERT
user_purchases, UPSERT user_equipped_items

### Findings

**BLOCKER-5.1 — `transaction_type` ENUM does not include a "shop purchase" type**
The `shop.service.ts` (line 255) uses `TransactionTypeEnum.SPENT_POWERUP` for store
purchases. The `gamification_system.transaction_type` ENUM has `'spent_powerup'` which
is semantically "used on power-ups/comodines", not shop cosmetic purchases. There is no
`spent_shop` or `spent_purchase` enum value. Using `spent_powerup` for cosmetic item
purchases is a semantic violation. While it does not cause a DB CHECK error (the ENUM
value is valid), the transaction history will incorrectly classify all store purchases as
power-up usage, corrupting analytics and reporting. The ML coins transactions table
also has `reference_type` CHECK: `powerup` is a valid reference_type, which the service
uses. The entire purchase funnel will succeed at DB level but produce misleading data.

**Severity reclassification: WARNING-5.1** (not a BLOCKER since DB accepts it, but data
integrity is violated for reporting purposes).

**INFO-5.2 — `user_purchases.item_id` ON DELETE SET NULL, not CASCADE**
`item_id uuid NOT NULL REFERENCES gamification_system.shop_items(id) ON DELETE SET NULL`.
The field is NOT NULL but the FK is ON DELETE SET NULL. This is a DDL contradiction:
if a shop item is deleted, `item_id` would be set to NULL, violating the NOT NULL
constraint, causing a DB error on the cascade.

**BLOCKER-5.2 — `user_purchases.item_id` NOT NULL + ON DELETE SET NULL = contradiction**
If any `shop_items` row is deleted, the `ON DELETE SET NULL` trigger would attempt to set
`user_purchases.item_id = NULL`, which violates the `NOT NULL` constraint on that column.
This is a DDL constraint conflict. The result would be a PostgreSQL error:
`ERROR: null value in column "item_id" of relation "user_purchases" violates not-null
constraint`. Any admin flow that deletes a shop item would cascade this error.
**Source:** `tables/19-user_purchases.sql` lines 35 and the NOT NULL declaration on
line 34.

**INFO-5.3 — `user_equipped_items` UPSERT uses `(user_id, category_id)` UNIQUE**
`CREATE UNIQUE INDEX idx_user_equipped_unique_category ON
gamification_system.user_equipped_items(user_id, category_id)`. The equip flow
(`SVC->>DB: UPSERT user_equipped_items por (user_id, category_id)`) correctly identifies
this constraint. The flow is consistent with the DDL here.

**INFO-5.4 — No RLS INSERT policy on `user_purchases` or `user_equipped_items`**
Neither `user_purchases` nor `user_equipped_items` have explicit RLS INSERT policies in
their DDL. Same BYPASSRLS caveat as Flow 4. When BYPASSRLS is removed, INSERT operations
from the shop service will require INSERT RLS policies to be added.

**Constraint Violations: 1 BLOCKER, 1 WARNING**

---

## Flow 6: Teacher Assignment

**Doc:** `docs/30-ux-ui/flujos/teacher/FLUJO-ASIGNACIONES-CLASE.md`
**DDL tables examined:**
- `educational_content.assignments` (`tables/05-assignments.sql`)
- `educational_content.assignment_exercises` (`tables/06-assignment_exercises.sql`)
- `educational_content.assignment_students` (`tables/07-assignment_students.sql`)
- `social_features.teacher_classrooms` (`teacher_classrooms.sql`)

**DB Operations described:** INSERT assignments, INSERT assignment_exercises, INSERT
assignment_students

### Findings

**INFO-6.1 — `assignment_type` CHECK constraint matches flow exactly**
`CONSTRAINT ... CHECK (assignment_type IN ('practice', 'quiz', 'exam', 'homework'))`.
The flow documents: "tipo (practice/quiz/exam/homework)". Exact match. Valid.

**INFO-6.2 — `assignments.is_published` defaults to `false`**
`is_published BOOLEAN NOT NULL DEFAULT false`. The flow describes publishing as the
final step. By default assignments are unpublished, which aligns with the wizard-then-
publish pattern. No issue.

**WARNING-6.3 — `teacher_classrooms.tenant_id` is NOT NULL but the flow does not mention it**
`tenant_id UUID NOT NULL` in `teacher_classrooms`. This means teacher-classroom
associations require a valid `tenant_id`. The flow mentions "Tenant isolation: queries
filtered by tenant_id of authenticated user" as a rule, but does not document that
INSERT into `teacher_classrooms` will fail if `tenant_id` is missing. This is a backend
validation responsibility not visible in the UX flow.

**INFO-6.4 — Cascade delete behavior not documented in flow**
The flow documents "Eliminacion en cascada" deleting `assignment_exercises`,
`assignment_students`, and `assignment_submissions`. The DDL confirms:
- `assignment_exercises`: `ON DELETE CASCADE` from `assignments` — correct
- `assignment_students`: `ON DELETE CASCADE` from `assignments` — correct
- `assignment_submissions`: The flow mentions this table, but it is not in `06-` or
  `07-`. The correct table path is `educational_content.assignment_students` which holds
  submissions. There is a separate `educational_content.assignment_submissions` referenced
  by the flow (`tables/08-assignment_submissions.sql`) that was not examined but is
  referenced by the DDL tree.

**INFO-6.5 — `assignment_students.attempt_number` CHECK**
`CONSTRAINT assignment_students_attempt_positive CHECK (attempt_number > 0 AND
attempt_number <= max_attempts)`. The flow does not document this constraint. If the
system allows re-attempts and `attempt_number` exceeds `max_attempts`, the UPDATE will
fail.

**Constraint Violations: 0 BLOCKERs, 1 WARNING**

---

## Flow 7: Grade Submission (Manual Review M3-M5)

**Doc:** `docs/30-ux-ui/flujos/teacher/FLUJO-REVISION-MANUAL-M3-M5.md` and
`docs/30-ux-ui/flujos/student/FLUJO-EJERCICIO-M3-M5.md`
**DDL tables examined:**
- `progress_tracking.manual_reviews` (`tables/06-manual_reviews.sql`)
- `progress_tracking.exercise_submissions` (`tables/04-exercise_submissions.sql`)
- `gamification_system.user_stats` (`tables/01-user_stats.sql`)

**DB Operations described:** UPDATE manual_reviews (status=completed), UPDATE
exercise_submissions (status=graded), UPDATE user_stats (XP/coins)

### Findings

**BLOCKER-7.1 — `notificationType=exercise_feedback` violates `notifications.notifications` CHECK**
The M3-M5 flow (step 4) states: "Backend envia notificacion in-app con
`notificationType=exercise_feedback`". The `notifications.notifications` table has:
`CONSTRAINT chk_notif_type CHECK (type IN ('achievement', 'mission', 'assignment',
'social', 'system', 'gamification'))`. The value `'exercise_feedback'` is NOT in this
list. Any INSERT into `notifications.notifications` with `type='exercise_feedback'`
will fail with a CHECK constraint violation.

**This is a BLOCKER**: the grade completion notification path as described is not
compatible with the DB constraint. The correct value would likely be `'assignment'` or
`'gamification'` for this notification type.

**INFO-7.2 — `manual_reviews.status` CHECK: 4 valid states**
`CONSTRAINT ... CHECK (status IN ('pending', 'in_progress', 'completed', 'returned'))`.
The flow transitions: `pending_review → inReview → graded → rewardsApplied`. The
`manual_reviews` table uses `pending/in_progress/completed/returned`. The
`exercise_submissions` table uses `pending_review` (via `exercise_submissions_status_check`).
These are two separate status systems correctly applied to two separate tables. The flow
is consistent here.

**INFO-7.3 — `manual_reviews.rubric_scores` is NOT NULL but defaults to `{}`**
`rubric_scores JSONB NOT NULL DEFAULT '{}'`. The DDL allows an empty JSONB object.
The flow describes saving rubric scores before completing — this is valid as long as the
backend sends at least `{}`.

**INFO-7.4 — `manual_reviews.reviewer_id` FK ON DELETE RESTRICT**
`reviewer_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE RESTRICT`.
If a teacher profile is deleted, the DELETE will be blocked by this RESTRICT. The flow
does not document this behavior.

**INFO-7.5 — No RLS UPDATE policy on `progress_tracking.manual_reviews`**
The DDL does not define RLS policies on `manual_reviews`. Same BYPASSRLS caveat applies.
When BYPASSRLS is removed from `gamilit_user`, teacher UPDATE on `manual_reviews` will
require a new RLS UPDATE policy scoped to the teacher's classrooms.

**Constraint Violations: 1 BLOCKER, 0 WARNINGs**

---

## Flow 8: Parent-Student Link

**Doc:** `docs/30-ux-ui/flujos/parents/FLUJO-VINCULACION-PADRE-ESTUDIANTE.md`
**DDL tables examined:**
- `auth_management.parent_accounts` (`tables/14-parent_accounts.sql`)
- `auth_management.parent_student_links` (`tables/15-parent_student_links.sql`)
- `auth_management.profiles` (`tables/03-profiles.sql`)

**DB Operations described:** INSERT parent_accounts, INSERT parent_student_links
(status=pending), UPDATE parent_student_links (status=active)

### Findings

**BLOCKER-8.1 — `parent_student_links.relationship_type` NOT NULL has no default**
`relationship_type TEXT NOT NULL CHECK (relationship_type IN ('mother', 'father',
'guardian', 'tutor', 'stepparent', 'grandparent', 'other'))`. The field is NOT NULL with
no DEFAULT. The flow (step 4: `POST /api/v1/parent-portal/students/link`) describes
sending `LinkStudentDto (codigo del estudiante)`. The DTO does not mention
`relationship_type`. If the `LinkStudentDto` does not include `relationship_type`, the
INSERT into `parent_student_links` will fail: `ERROR: null value in column
"relationship_type" violates not-null constraint`.

**This is a BLOCKER**: the flow does not document that `relationship_type` must be
provided during the linking step, yet the DDL requires it.

**INFO-8.2 — `parent_accounts.relationship_type` is nullable, `parent_student_links.relationship_type` is NOT NULL**
`parent_accounts.relationship_type` is nullable (no NOT NULL). But
`parent_student_links.relationship_type` is NOT NULL. The flow mentions parent
registration but does not document that the link creation step has its own
`relationship_type` requirement separate from the account registration.

**INFO-8.3 — `verification_code` in `parent_student_links` is nullable**
`verification_code TEXT` (no NOT NULL). The flow describes a verification code step.
If the backend does not set `verification_code` at INSERT time, the verification step
(step 6) that sends `VerifyLinkDto (codigo de verificacion)` would need to look up a
NULL code, which would silently match nothing. The flow assumes the code is set but the
DDL does not enforce it.

**INFO-8.4 — UNIQUE constraint `unique_parent_student`**
`CONSTRAINT unique_parent_student UNIQUE(parent_account_id, student_id)`. The flow
documents 409 Conflict for duplicate links. Consistent with this constraint.

**INFO-8.5 — `parent_accounts.profile_id` NOT NULL UNIQUE**
`profile_id UUID NOT NULL UNIQUE REFERENCES auth_management.profiles(id)`. The parent
registration flow must create a profile first (or simultaneously). The flow says
`POST /api/v1/parent-portal/auth/register` creates an account in `parent_accounts`
directly. If `profile_id` is required, the service must first INSERT into `profiles`
and then INSERT into `parent_accounts`. The flow does not document this two-step DB
operation.

**Constraint Violations: 1 BLOCKER, 0 WARNINGs**

---

## Flow 9: Leaderboard Update

**Doc:** `docs/30-ux-ui/flujos/student/FLUJO-LEADERBOARDS.md`
**DDL tables examined:**
- `gamification_system.user_stats` (`tables/01-user_stats.sql`)
- `gamification_system.user_ranks` (`tables/02-user_ranks.sql`)
- `gamification_system.leaderboard_metadatas` (`tables/09-leaderboard_metadata.sql`)
- `auth_management.profiles` (`tables/03-profiles.sql`)

**DB Operations described:** SELECT user_stats + profiles (leaderboard query), no direct
INSERT/UPDATE to leaderboard table

### Findings

**WARNING-9.1 — Flow references `leaderboard_metadata` (singular), DDL table is `leaderboard_metadatas` (plural)**
The flow doc (section 5 Backend, section 8 trazabilidad) references
`gamification_system.leaderboard_metadata` (singular). The actual DDL creates
`gamification_system.leaderboard_metadatas` (plural, with `s`). The backend entity file
is `leaderboard-metadata.entity.ts` but maps to the plural table name. Any ORM query
using the singular name would fail with `relation "gamification_system.leaderboard_metadata"
does not exist`.

**WARNING-9.2 — Leaderboard query described as `JOIN user_stats + profiles ORDER BY total_xp` — no dedicated leaderboard entries table**
The flow describes a `gamification_system.leaderboard_entries` table implied by terms
like "entries[]" in the API response. There is no `leaderboard_entries` table in the DDL.
The actual query uses `gamification_system.user_stats` directly (pre-calculated
`global_rank_position`, `class_rank_position`, `school_rank_position` columns). The flow
does not document that leaderboard data is derived from `user_stats` columns, not a
separate `leaderboard_entries` table.

**INFO-9.3 — `user_stats.global_rank_position` is nullable**
The DDL shows `global_rank_position integer` with no NOT NULL. If rank position has not
been calculated yet (new user), the leaderboard query may return NULL for position.
The flow does not document NULL handling for rank positions.

**INFO-9.4 — Leaderboard "school" type requires `schoolId` parameter, but `school_id` in profiles is also nullable**
`profiles.school_id uuid` (no NOT NULL). If a student has no `school_id`, filtering
`WHERE school_id = :schoolId` will not include them. The flow documents that school
leaderboard requires schoolId but does not document that students without a school_id
are excluded.

**INFO-9.5 — `user_ranks.UNIQUE(user_id)` — one rank record per user**
`CONSTRAINT user_ranks_user_id_key UNIQUE (user_id)`. The leaderboard query JOINs
`user_ranks` but this is single-record-per-user, which is consistent.

**Constraint Violations: 0 BLOCKERs, 2 WARNINGs**

---

## Flow 10: Notification Send (Parent Notifications)

**Doc:** `docs/30-ux-ui/flujos/parents/FLUJO-NOTIFICACIONES-PADRES.md`
**DDL tables examined:**
- `auth_management.parent_notifications` (`tables/16-parent_notifications.sql`)
- `notifications.notifications` (`tables/01-notifications.sql`)
- `notifications.notification_queue` (`tables/05-notification_queue.sql`)
- `notifications.rate_limit_logs` (`tables/07-rate_limit_logs.sql`)

**DB Operations described:** INSERT parent_notifications, GET notifications (list), PATCH
status=read

### Findings

**WARNING-10.1 — `parent_notifications.notification_type` ENUM vs flow documented types**
The DDL CHECK constraint allows:
`'daily_summary', 'weekly_report', 'monthly_report', 'low_performance',
'inactivity_alert', 'achievement_unlocked', 'rank_promotion', 'assignment_due',
'assignment_submitted', 'recommendation', 'custom'`.

The flow (section 6) documents types as:
`'low_performance', 'achievement', 'streak_loss', 'inactivity', 'rank_promotion',
'assignment_due', 'weekly_report'`.

**Mismatches between flow documentation and DDL CHECK constraint:**
- Flow uses `'achievement'` → DDL requires `'achievement_unlocked'`
- Flow uses `'streak_loss'` → DDL has NO such value (closest: none; `'inactivity_alert'` is different)
- Flow uses `'inactivity'` → DDL requires `'inactivity_alert'`

Any INSERT with `notification_type='achievement'`, `notification_type='streak_loss'`,
or `notification_type='inactivity'` will fail with a CHECK constraint violation.

**This is a WARNING** (not BLOCKER) because the service code may use correct values even
if the documentation is wrong. However, the documentation misrepresents the valid values,
which could lead to bugs during maintenance.

**INFO-10.2 — `parent_notifications.priority` CHECK: `'normal'` is the default**
DDL CHECK: `priority IN ('low', 'normal', 'high', 'urgent')`. The flow documentation
says priorities are `'low', 'medium', 'high', 'critical'`. There is a **mismatch**:
- Flow uses `'medium'` → DDL requires `'normal'`
- Flow uses `'critical'` → DDL requires `'urgent'`

**WARNING-10.2 — Priority value mismatch between flow doc and DDL CHECK constraint**
If any service code uses `'medium'` or `'critical'` based on the flow documentation, the
INSERT will fail.

**INFO-10.3 — `notifications.notification_queue` status transitions**
The flow does not explicitly describe inserting into `notification_queue` for parent
notifications. Parent notifications use `auth_management.parent_notifications` directly,
not the general `notifications.notification_queue`. The flow is architecturally consistent
— parent notifications bypass the general notification queue. This is by design.

**INFO-10.4 — `rate_limit_logs.channel` CHECK: `'sms'` is valid but flow doesn't mention SMS**
The DDL allows `channel IN ('in_app', 'email', 'push', 'sms', 'global')`. The flow
documents `sent_via_email`, `sent_via_in_app`, `sent_via_push` columns in
`parent_notifications`. SMS channel is in the rate limiter but not in the notification
delivery path — minor gap.

**INFO-10.5 — `parent_notifications.status` on PATCH: `'read'` is valid**
DDL CHECK: `status IN ('pending', 'sent', 'read', 'archived')`. Flow updates status to
`'read'` on PATCH. Valid. Consistent.

**Constraint Violations: 0 BLOCKERs, 2 WARNINGs**

---

## Summary Table

| # | Flow | Doc | DB Ops | BLOCKERs | WARNINGs | INFOs |
|---|------|-----|--------|----------|----------|-------|
| 1 | Student Registration | `auth/FLUJO-REGISTRO-LOGIN.md` | 3 | 0 | 0 | 5 |
| 2 | Exercise Attempt (M1-M2) | `student/FLUJO-EJERCICIO-COMPLETO.md` | 5 | 0 | 2 | 3 |
| 3 | XP Award | `student/FLUJO-EJERCICIO-COMPLETO.md` + LOGROS | 3 | 0 | 0 | 5 |
| 4 | Achievement Unlock | `student/FLUJO-LOGROS-MISIONES-CLAIM.md` | 2 | 0 | 1 | 2 |
| 5 | Store Purchase | `student/FLUJO-TIENDA-COMPRA.md` + EQUIPAR | 4 | 1 | 1 | 2 |
| 6 | Teacher Assignment | `teacher/FLUJO-ASIGNACIONES-CLASE.md` | 3 | 0 | 1 | 3 |
| 7 | Grade Submission | `teacher/FLUJO-REVISION-MANUAL-M3-M5.md` | 3 | 1 | 0 | 4 |
| 8 | Parent-Student Link | `parents/FLUJO-VINCULACION-PADRE-ESTUDIANTE.md` | 3 | 1 | 0 | 4 |
| 9 | Leaderboard Update | `student/FLUJO-LEADERBOARDS.md` | 1 | 0 | 2 | 3 |
| 10 | Notification Send | `parents/FLUJO-NOTIFICACIONES-PADRES.md` | 3 | 0 | 2 | 4 |
| **TOTAL** | | | **30** | **3** | **9** | **35** |

---

## Critical Findings (BLOCKERs)

### BLOCKER-5.2: `user_purchases.item_id` NOT NULL + ON DELETE SET NULL contradiction

- **File:** `apps/database/ddl/schemas/gamification_system/tables/19-user_purchases.sql`
  lines 34-35
- **Issue:** Column declared `NOT NULL`, FK declared `ON DELETE SET NULL`. If a shop item
  is deleted, PostgreSQL will attempt to SET NULL on a NOT NULL column, raising:
  `ERROR: null value in column "item_id" violates not-null constraint`
- **Impact:** Any admin deletion of a shop item will fail with a cascading error
- **Fix:** Either change to `ON DELETE RESTRICT` (prevent deletion if purchases exist) or
  change `item_id` to nullable

### BLOCKER-7.1: `notificationType='exercise_feedback'` not in `notifications.notifications` CHECK

- **File:** `apps/database/ddl/schemas/notifications/tables/01-notifications.sql` line 52
- **Issue:** `CHECK (type IN ('achievement', 'mission', 'assignment', 'social', 'system',
  'gamification'))`. Value `'exercise_feedback'` is not allowed
- **Impact:** Grade completion notifications for M3-M5 exercises will fail to INSERT
- **Docs referenced:** `docs/30-ux-ui/flujos/student/FLUJO-EJERCICIO-M3-M5.md` line 61;
  `docs/30-ux-ui/flujos/teacher/FLUJO-REVISION-MANUAL-M3-M5.md` line 13
- **Fix:** Either add `'exercise_feedback'` to the CHECK constraint (requires DDL
  migration) or document that `'assignment'` or `'gamification'` is the correct type to
  use

### BLOCKER-8.1: `parent_student_links.relationship_type` NOT NULL, missing from link flow

- **File:** `apps/database/ddl/schemas/auth_management/tables/15-parent_student_links.sql`
  line 19
- **Issue:** `relationship_type TEXT NOT NULL CHECK (...)` with no DEFAULT. The
  `LinkStudentDto` described in the flow does not include `relationship_type`
- **Impact:** `POST /api/v1/parent-portal/students/link` will fail with NOT NULL
  constraint violation
- **Fix:** Add `relationship_type` to `LinkStudentDto` and to the flow documentation

---

## Significant Warnings (Remediation Recommended)

### WARNING-4.3: No INSERT RLS policy on `gamification_system.user_achievements`

When `BYPASSRLS` is removed from `gamilit_user` (pending remediation CORR-F2-01b),
achievement insertion will require an explicit INSERT policy such as:
```sql
CREATE POLICY user_achievements_insert_system ON gamification_system.user_achievements
    FOR INSERT WITH CHECK (true);
```

### WARNING-5.1: `spent_powerup` used for shop cosmetic purchases

`shop.service.ts` line 255 uses `TransactionTypeEnum.SPENT_POWERUP` for all shop
purchases. This misclassifies cosmetic/avatar purchases as power-up usage in
ML Coins transaction history. Analytics and reports will show incorrect spending
categories. A `spent_shop` value should be added to the `transaction_type` ENUM.

### WARNING-9.1: `leaderboard_metadata` (singular) name mismatch with DDL `leaderboard_metadatas`

The DDL creates `gamification_system.leaderboard_metadatas`. Any code or documentation
using the singular form will fail at query time. All references should use the plural
form `leaderboard_metadatas`.

### WARNING-10.1 / WARNING-10.2: Parent notification type/priority mismatch

Flow documentation uses `'achievement'`, `'streak_loss'`, `'inactivity'`, `'medium'`,
`'critical'`. DDL CHECK constraints require `'achievement_unlocked'`,
`'inactivity_alert'`, `'normal'`, `'urgent'`. Documentation must be corrected to use
the DDL-valid values.

### WARNING-9.2: No `leaderboard_entries` table — flow implies one exists

The flow describes `entries[]` in API responses. No such table exists. Leaderboard data
is read from `user_stats` pre-calculated rank columns. The flow's ER model is misleading.

---

## DDL Issues Found (Not Directly Flow-Related)

| Issue | File | Description |
|-------|------|-------------|
| NOT NULL + ON DELETE SET NULL | `19-user_purchases.sql` lines 34-35 | Conflicting constraints on `item_id` |
| No INSERT RLS policies | `04-user_achievements.sql`, `19-user_purchases.sql`, `21-user_equipped_items.sql`, `06-manual_reviews.sql` | All require INSERT policies before BYPASSRLS can be removed |
| `leaderboard_metadatas` plural table name | `09-leaderboard_metadata.sql` | Table named with plural but referenced in docs as singular |

---

*Generated: 2026-02-27 | Audit: TASK-2026-02-27-AUDITORIA-DOCS Phase 3C | Read-Only*
