# FINDINGS-D3: Seed Quality Analysis

**Agent:** D (Seeds & Data Completeness)
**Date:** 2026-02-20
**Scope:** Quality review of all existing teacher-related seed files

---

## Quality Issues Found

### Issue Q-01: teacher-notes seed uses auth.users for student lookups (FK mismatch)
**File:** `apps/database/seeds/dev/progress_tracking/08-teacher-notes.sql`
**Severity:** HIGH
**Environment:** dev only (not in pipeline)

**Problem:** Lines 29-38 look up student IDs from `auth.users` directly:
```sql
SELECT id INTO student1_id
FROM auth.users
WHERE email = 'estudiante1@demo.glit.edu.mx';
```

But `progress_tracking.teacher_notes.student_id` has FK to `auth_management.profiles(id)`, NOT `auth.users(id)`. The `auth.users.id` and `auth_management.profiles.id` are DIFFERENT UUIDs (profiles.id is auto-generated, users.id is the Supabase auth ID).

**Expected pattern:**
```sql
SELECT p.id INTO student1_id
FROM auth.users u
JOIN auth_management.profiles p ON p.user_id = u.id
WHERE u.email = 'estudiante1@demo.glit.edu.mx';
```

**Impact:** Insert will fail with FK violation error if the seed is ever added to the pipeline. Currently non-functional because it is orphaned (not in init-database.sh pipeline).

**Note:** Teacher ID lookup on line 23-26 is correct (uses `profiles.role = 'admin_teacher'`), so only the student lookups are wrong.

---

### Issue Q-02: teacher-notes seed has self-referential DELETE bug
**File:** `apps/database/seeds/dev/progress_tracking/08-teacher-notes.sql`
**Severity:** MEDIUM
**Environment:** dev only

**Problem:** Line 49-51:
```sql
DELETE FROM progress_tracking.teacher_notes
WHERE teacher_id = teacher_id
  AND student_id IN (student1_id, student2_id, student3_id);
```

The `teacher_id = teacher_id` condition compares the column to itself (always true for non-NULL), which would delete ALL notes for the listed students regardless of which teacher wrote them. Should be:
```sql
DELETE FROM progress_tracking.teacher_notes
WHERE teacher_id = v_teacher_id
  ...
```

Or the variable should be renamed to avoid shadowing the column name.

**Impact:** In a multi-teacher environment, this would incorrectly delete notes from other teachers. In the current single-teacher demo setup, the effect is the same but the logic is wrong.

---

### Issue Q-03: teacher-notes seed is NOT in the init-database.sh pipeline
**File:** `apps/database/seeds/dev/progress_tracking/08-teacher-notes.sql`
**Severity:** HIGH
**Environment:** dev

**Problem:** The seed file exists in the `dev/progress_tracking/` directory but is NOT listed in the `seed_entries` array in `apps/database/scripts/init-database.sh`. This means the seed never executes during database recreation.

**Impact:** Teacher notes table is always empty in dev, providing no demo data for the teacher portal's student notes feature.

**Fix:** Add to init-database.sh pipeline:
```bash
"progress_tracking/08-teacher-notes.sql|dev|demo_data"
```
After fixing the FK mismatch (Q-01) and DELETE bug (Q-02).

---

### Issue Q-04: staging/assignments seed uses auth.users directly (FK mismatch)
**File:** `apps/database/seeds/staging/educational_content/05-assignments.sql`
**Severity:** HIGH
**Environment:** staging

**Problem:** Lines 46-49 look up teacher_id from `auth.users` directly:
```sql
SELECT id INTO v_teacher_id
FROM auth.users
WHERE email = 'teacher@gamilit.com'
LIMIT 1;
```

But `educational_content.assignments.teacher_id` has FK to `auth_management.profiles(id)`. This returns the auth.users UUID, not the profile UUID.

**Expected pattern (as used in dev/prod versions):**
```sql
SELECT p.id INTO v_teacher_id
FROM auth.users u
JOIN auth_management.profiles p ON p.user_id = u.id
WHERE u.email = 'teacher@gamilit.com'
LIMIT 1;
```

**Note:** The dev and prod versions of this same seed file are CORRECT -- they use the proper JOIN pattern. Only staging has this issue.

---

### Issue Q-05: staging/assignments seed uses hardcoded UUID in DELETE
**File:** `apps/database/seeds/staging/educational_content/05-assignments.sql`
**Severity:** MEDIUM
**Environment:** staging

**Problem:** Line 34-35:
```sql
DELETE FROM educational_content.assignments
WHERE teacher_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
```

Uses a hardcoded UUID that may not match any real profile ID. The dev and prod versions correctly use dynamic lookup:
```sql
DELETE FROM educational_content.assignments
WHERE teacher_id = (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'teacher@gamilit.com');
```

**Impact:** The DELETE is a no-op (deletes nothing) since the UUID doesn't match, which means old demo data is never cleaned up before re-inserting. Combined with Q-04, the INSERT also fails with FK violation.

---

### Issue Q-06: teacher-reports seed uses CROSS JOIN without limiting teacher count
**File:** `apps/database/seeds/dev/social_features/05-teacher-reports.sql` (also staging/prod)
**Severity:** LOW
**Environment:** all

**Problem:** Lines 59-62:
```sql
FROM auth_management.profiles t
CROSS JOIN social_features.classrooms c
WHERE t.role = 'admin_teacher'
LIMIT 5
```

The CROSS JOIN between all admin_teachers and all classrooms could produce unexpected numbers of rows if there are multiple teachers or classrooms. The `LIMIT 5` caps it but the generated data may not match expected patterns.

**Impact:** Minor -- the LIMIT clause prevents runaway data, and the seed works correctly in practice. However, if multiple teachers exist, the reports may be assigned to unexpected teacher-classroom combinations.

**Recommendation:** Consider using `CROSS JOIN LATERAL (SELECT ... LIMIT 1) t` to pin a single teacher, or explicitly select the demo teacher.

---

### Issue Q-07: manual-reviews seed depends on exercise_submissions being populated
**File:** `apps/database/seeds/dev/progress_tracking/03-manual-reviews.sql`
**Severity:** LOW
**Environment:** dev

**Problem:** The seed queries `progress_tracking.exercise_submissions` to find submissions to review. If no submissions exist (e.g., the `02-exercise-attempts.sql` seed failed or was skipped), the seed produces 0 rows silently.

The seed does have a dependency check (lines 12-14) that raises a NOTICE, but it continues anyway and the INSERT produces 0 rows.

**Impact:** Minor -- the seed handles the empty case gracefully with `ON CONFLICT DO NOTHING` and reports counts at the end. The warning notice is appropriate.

---

### Issue Q-08: communication/messages seed uses hardcoded UUID IDs
**File:** `apps/database/seeds/dev/communication/01-system-messages.sql`
**Severity:** LOW
**Environment:** dev

**Problem:** Messages are inserted with hardcoded UUIDs like:
```sql
'c0000001-0000-0000-0001-000000000001'::uuid
```

While this makes the seed idempotent (ON CONFLICT (id) DO UPDATE), the pattern of using synthetic UUIDs is not aligned with the project's standard of using `gen_random_uuid()`.

**Impact:** Minimal -- the approach works correctly and provides idempotency. The hardcoded IDs are for seed-specific data and not referenced by other systems. Thread relationships require stable IDs.

**Note:** This is an intentional design choice for idempotency, not a bug. The ON CONFLICT clause handles re-runs correctly.

---

### Issue Q-09: classroom seed does not populate co_teachers array
**File:** `apps/database/seeds/{dev,staging,prod}/social_features/02-classrooms.sql`
**Severity:** LOW
**Environment:** all

**Problem:** The classrooms DDL includes a `co_teachers uuid[]` column, but the seed only creates one classroom with a single teacher. The `co_teachers` array is never populated.

**Impact:** Minor -- the teacher portal's co-teacher features cannot be tested with demo data. This is a missing feature in the seed, not a bug.

---

### Issue Q-10: classroom_modules seed only exists in prod
**File:** `apps/database/seeds/prod/educational_content/14-classroom_modules.sql`
**Severity:** MEDIUM
**Environment:** dev (missing), staging (missing)

**Problem:** The `classroom_modules` seed that assigns modules to the DEFAULT classroom only exists in `prod/`. The init-database.sh pipeline entry is:
```
"educational_content/14-classroom_modules.sql|prod|core"
```

This means in dev and staging, the DEFAULT classroom has no modules assigned. Students in dev/staging environments cannot see or access modules through the classroom system.

**Impact:** In dev, modules are accessible directly (not through classroom assignment), so the practical impact is limited. But it means the teacher portal's "classroom modules" management view has no data in dev.

**Fix:** Create dev/staging copies and change pipeline scope to `all|core`.

---

## Quality Score by Seed File

| # | Seed File | Env | Dynamic Lookups | Table Names | Column Names | ON CONFLICT | Idempotent | Quality Score |
|---|-----------|-----|-----------------|-------------|--------------|-------------|------------|---------------|
| 1 | `social_features/02-classrooms.sql` | all | YES | YES | YES | YES (UPSERT) | YES | 9/10 (Q-09 minor) |
| 2 | `social_features/03-classroom-members.sql` | all | YES | YES | YES | YES (ON CONFLICT DO UPDATE) | YES | 10/10 |
| 3 | `social_features/05-teacher-reports.sql` | all | YES (profiles.role) | YES | YES | YES (ON CONFLICT DO NOTHING) | YES | 8/10 (Q-06 minor) |
| 4 | `educational_content/05-assignments.sql` (dev/prod) | dev/prod | YES (JOIN pattern) | YES | YES | YES (ON CONFLICT DO UPDATE) | YES | 9/10 |
| 5 | `educational_content/05-assignments.sql` (staging) | staging | NO (Q-04, Q-05) | YES | YES | YES | Partial | 4/10 (Q-04 HIGH, Q-05 MEDIUM) |
| 6 | `educational_content/14-classroom_modules.sql` | prod | YES (code lookup) | YES | YES | N/A (DELETE+INSERT) | YES | 8/10 (Q-10 scope) |
| 7 | `progress_tracking/01-module_progress.sql` | all | YES | YES | YES | YES | YES | 9/10 |
| 8 | `progress_tracking/02-exercise-attempts.sql` | dev | YES (JOIN pattern) | YES | YES | N/A (INSERT only) | Partial | 8/10 |
| 9 | `progress_tracking/03-manual-reviews.sql` | dev | YES (profiles.role) | YES | YES | YES (ON CONFLICT DO NOTHING) | YES | 8/10 (Q-07 minor) |
| 10 | `progress_tracking/08-teacher-notes.sql` | dev (orphaned) | PARTIAL (Q-01) | YES | YES | N/A (DELETE+INSERT) | NO (Q-02) | 3/10 (Q-01 HIGH, Q-02 MEDIUM, Q-03 HIGH) |
| 11 | `communication/01-system-messages.sql` | dev | YES (dynamic profile queries) | YES | YES | YES (ON CONFLICT DO UPDATE) | YES | 9/10 (Q-08 cosmetic) |
| 12 | `communication/02-message_participants.sql` | dev | YES | YES | YES | YES | YES | 9/10 |

---

## Summary of Issues by Severity

### HIGH (3 issues -- require fix)
| ID | File | Issue |
|----|------|-------|
| Q-01 | `08-teacher-notes.sql` (dev) | FK mismatch: auth.users.id used instead of profiles.id for student lookups |
| Q-03 | `08-teacher-notes.sql` (dev) | Not in init-database.sh pipeline (orphaned seed) |
| Q-04 | `05-assignments.sql` (staging) | FK mismatch: auth.users.id used instead of profiles.id for teacher lookup |

### MEDIUM (3 issues -- should fix)
| ID | File | Issue |
|----|------|-------|
| Q-02 | `08-teacher-notes.sql` (dev) | Self-referential DELETE bug (teacher_id = teacher_id) |
| Q-05 | `05-assignments.sql` (staging) | Hardcoded UUID in DELETE statement |
| Q-10 | `14-classroom_modules.sql` | Only in prod scope; missing from dev/staging |

### LOW (4 issues -- nice to fix)
| ID | File | Issue |
|----|------|-------|
| Q-06 | `05-teacher-reports.sql` (all) | CROSS JOIN could produce unexpected combinations |
| Q-07 | `03-manual-reviews.sql` (dev) | Silent empty result if exercise_submissions is empty |
| Q-08 | `01-system-messages.sql` (dev) | Hardcoded UUIDs (intentional for idempotency) |
| Q-09 | `02-classrooms.sql` (all) | co_teachers array never populated |

---

## Environment Consistency

### Files that differ between environments

| Seed | dev | staging | prod | Consistent? |
|------|-----|---------|------|-------------|
| `05-assignments.sql` | Correct (JOIN pattern) | BROKEN (Q-04, Q-05) | Correct (JOIN pattern) | NO -- staging must be synced |
| `05-teacher-reports.sql` | Identical | Identical | Identical | YES |
| `02-classrooms.sql` | Identical | Identical | Identical | YES |
| `03-classroom-members.sql` | Identical | Identical | Identical | YES |
| `01-system-messages.sql` | Identical | Identical | Identical | YES |
| `14-classroom_modules.sql` | MISSING | MISSING | Exists | NO -- should be in all envs |

---

## Recommended Fixes (Action Items)

### Priority 1 (Before next deploy)
1. **Fix Q-04 + Q-05:** Sync staging `05-assignments.sql` with the dev/prod version (copy dev version to staging)
2. **Fix Q-01 + Q-02:** Update `08-teacher-notes.sql` to use proper profile JOIN pattern and rename variable
3. **Fix Q-03:** Add `08-teacher-notes.sql` to init-database.sh pipeline after fixing Q-01/Q-02

### Priority 2 (Next sprint)
4. **Fix Q-10:** Copy `14-classroom_modules.sql` to dev/staging and change pipeline scope to `all|core`
5. Create missing HIGH priority seeds (teacher_contents, student_intervention_alerts, assignment_students)

### Priority 3 (Backlog)
6. Address remaining LOW severity issues
7. Create MEDIUM priority seeds (teacher_alert_configurations, scheduled_reports, conversations)
