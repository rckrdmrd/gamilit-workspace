# Analysis: Comodin Usage Tables Consolidation

**Task:** TASK-2026-02-03-CONSOLIDATION-COMODIN-TABLES
**Gap Reference:** DUP-001 (85% Similar Tables)
**Date:** 2026-02-03
**Agent:** @REFACTOR_AGENT

---

## Executive Summary

After thorough analysis, the three comodin-related tables serve **distinct and complementary purposes**. They form a well-designed system with proper separation of concerns:

| Table | Purpose | Recommendation |
|-------|---------|----------------|
| `comodines_inventory` | Current balance (SSOT) | **KEEP** - Required |
| `comodin_usage_tracking` | Per-attempt limits | **KEEP** - Required |
| `comodin_usage_log` | Historical event log | **CONSOLIDATE** with `comodin_uses` |
| `comodin_uses` | Audit trail | **KEEP** - Absorbs `comodin_usage_log` |

**RECOMMENDATION: Option A - Keep system as-is with minor cleanup**

The apparent "85% similarity" between `comodin_usage_log` and `comodin_usage_tracking` is misleading. They track fundamentally different things with different data models.

---

## Table Analysis

### 1. `comodines_inventory` (07-comodines_inventory.sql)

**Purpose:** Single Source of Truth (SSOT) for user comodin balances.

**Structure:**
- One row per user (UNIQUE on user_id)
- Tracks available quantity, purchased totals, used totals per type
- Stores pricing information

**Key Columns:**
```sql
user_id UUID NOT NULL UNIQUE
pistas_available INTEGER
vision_lectora_available INTEGER
segunda_oportunidad_available INTEGER
pistas_purchased_total INTEGER
vision_lectora_purchased_total INTEGER
segunda_oportunidad_purchased_total INTEGER
pistas_used_total INTEGER
vision_lectora_used_total INTEGER
segunda_oportunidad_used_total INTEGER
```

**Role:** Balance ledger - "How many comodines does user X have?"

**Dependencies:**
- Created by trigger on new user registration
- Updated when user purchases or uses comodines
- Read by UI to show available comodines

**VERDICT: ESSENTIAL - Cannot be consolidated**

---

### 2. `comodin_usage_tracking` (15-comodin_usage_tracking.sql)

**Purpose:** Enforce per-attempt usage limits (business rules).

**Structure:**
- One row per (user, exercise, attempt) combination
- Counters with CHECK constraints for max limits
- Boolean flags for limit-reached status

**Key Columns:**
```sql
user_id UUID NOT NULL
exercise_id UUID NOT NULL
attempt_id UUID NOT NULL
pistas_used INTEGER CHECK (pistas_used <= 3)
vision_lectora_used INTEGER CHECK (vision_lectora_used <= 1)
segunda_oportunidad_used INTEGER CHECK (segunda_oportunidad_used <= 1)
pistas_limit_reached BOOLEAN
vision_lectora_limit_reached BOOLEAN
segunda_oportunidad_limit_reached BOOLEAN
UNIQUE(user_id, exercise_id, attempt_id)
```

**Role:** Limit enforcer - "Has user X reached the limit of pistas in attempt Y?"

**Business Rules Enforced:**
- Maximum 3 pistas per attempt
- Maximum 1 vision_lectora per attempt
- Maximum 1 segunda_oportunidad per attempt

**Dependencies:**
- Read before allowing comodin use
- Updated when comodin is used in an attempt
- Critical for game fairness

**VERDICT: ESSENTIAL - Cannot be consolidated**

---

### 3. `comodin_usage_log` (14-comodin_usage_log.sql)

**Purpose:** Historical event log with detailed context.

**Structure:**
- One row per comodin use event
- UNIQUE constraint per (user, exercise, attempt, type)
- Stores effect details and context

**Key Columns:**
```sql
user_id UUID NOT NULL
comodin_type comodin_type NOT NULL
exercise_id UUID
attempt_id UUID
effect_applied TEXT
value_provided JSONB
usage_context JSONB
used_at TIMESTAMPTZ
UNIQUE(user_id, exercise_id, attempt_id, comodin_type)
```

**Role:** Event log - "What comodines were used, when, and with what effect?"

**Dependencies:**
- Trigger `trg_update_missions_on_use_comodines` fires on INSERT
- Used for mission progress tracking

**VERDICT: OVERLAPS with comodin_uses - CANDIDATE FOR CONSOLIDATION**

---

### 4. `comodin_uses` (21-comodin_uses.sql)

**Purpose:** Immutable audit trail for compliance and analytics.

**Structure:**
- Multiple rows per attempt allowed (NO UNIQUE constraint)
- Designed for analytics and compliance
- Has FK constraints to exercises and attempts tables

**Key Columns:**
```sql
user_id UUID NOT NULL
comodin_type comodin_type NOT NULL
exercise_id UUID REFERENCES educational_content.exercises(id)
attempt_id UUID REFERENCES progress_tracking.exercise_attempts(id)
effect_applied VARCHAR(100)
value_provided JSONB
consumed_at TIMESTAMPTZ
```

**Role:** Audit log - "Complete audit trail of all comodin consumption"

**Key Differences from comodin_usage_log:**
1. No UNIQUE constraint (allows multiple records per attempt)
2. Has proper FK constraints
3. More explicit audit focus (no updated_at)
4. Better RLS policies

**VERDICT: KEEP - Better designed than comodin_usage_log**

---

## Overlap Analysis: comodin_usage_log vs comodin_uses

| Aspect | comodin_usage_log | comodin_uses |
|--------|-------------------|--------------|
| Created | 2025-11-08 | 2026-02-03 |
| UNIQUE constraint | Yes (user, exercise, attempt, type) | No |
| FK constraints | No | Yes |
| RLS policies | Basic | Comprehensive |
| Trigger dependency | Yes (missions) | No |
| Audit design | Partial | Full |
| module_id column | Yes | No |

**Similarity Score:** ~70% column overlap

**Key Finding:** `comodin_uses` appears to be a newer, better-designed replacement for `comodin_usage_log` that was not fully migrated.

---

## Recommendations

### OPTION A: Keep System As-Is (RECOMMENDED)

**Rationale:** The tables serve distinct purposes:

1. **comodines_inventory** - Balance management (required)
2. **comodin_usage_tracking** - Per-attempt limits (required)
3. **comodin_usage_log** - Event log + mission triggers (has trigger dependency)
4. **comodin_uses** - Audit trail (analytics)

**Action Items:**
- [x] Document the distinct purposes
- [ ] Update comodin_uses comments to clarify relationship
- [ ] Consider if both log tables are needed

**Pros:**
- No migration risk
- Existing functionality preserved
- Trigger dependencies maintained

**Cons:**
- Two log tables (comodin_usage_log + comodin_uses) is redundant

---

### OPTION B: Consolidate Log Tables (ALTERNATIVE)

Merge `comodin_usage_log` into `comodin_uses` and update the mission trigger.

**Migration Plan:**

1. **Add missing columns to comodin_uses:**
   - `module_id UUID`
   - `usage_context JSONB`

2. **Migrate existing data:**
   ```sql
   INSERT INTO comodin_uses (user_id, comodin_type, exercise_id, attempt_id, effect_applied, value_provided, consumed_at)
   SELECT user_id, comodin_type, exercise_id, attempt_id, effect_applied, value_provided, used_at
   FROM comodin_usage_log
   ON CONFLICT DO NOTHING;
   ```

3. **Update mission trigger:**
   - Change trigger from comodin_usage_log to comodin_uses

4. **Create backwards-compatible view:**
   ```sql
   CREATE VIEW gamification_system.comodin_usage_log_v AS
   SELECT * FROM gamification_system.comodin_uses;
   ```

5. **Deprecate comodin_usage_log:**
   - Add deprecation comment
   - Schedule removal after migration

**Pros:**
- Eliminates redundancy
- Single source for audit data

**Cons:**
- Requires trigger migration
- Risk of data loss if not careful
- Breaking change for any code using comodin_usage_log

---

### OPTION C: Full Consolidation (NOT RECOMMENDED)

Merge all three into one unified table.

**Why NOT recommended:**
- `comodin_usage_tracking` has fundamentally different structure (counters vs events)
- Different query patterns (real-time limits vs historical audit)
- Would violate Single Responsibility Principle
- CHECK constraints on tracking table don't make sense for log data

---

## Final Recommendation

**OPTION A: Keep System As-Is** with documentation clarification.

**Justification:**
1. The "85% similarity" claim is misleading - the tables have different purposes
2. `comodin_usage_tracking` is for **real-time limit enforcement** (counters)
3. `comodin_usage_log` is for **event logging** (individual events)
4. `comodin_uses` is for **audit trail** (compliance)
5. `comodines_inventory` is for **balance management** (current state)

The only true duplication is between `comodin_usage_log` and `comodin_uses`, which could be consolidated in a future refactoring task if desired.

---

## Architecture Diagram

```
                    +------------------------+
                    |  comodines_inventory   |
                    |  (Balance SSOT)        |
                    |  1 row per user        |
                    +------------------------+
                              |
                              | (decremented on use)
                              v
   +-------------------------+  +-------------------------+
   |  comodin_usage_tracking |  |  comodin_usage_log      |
   |  (Per-attempt limits)   |  |  (Event log + missions) |
   |  1 row per attempt      |  |  N rows per user        |
   +-------------------------+  +-------------------------+
              |                            |
              | (enforces limits)          | (triggers missions)
              v                            v
   +-------------------------+  +-------------------------+
   |  Exercise Attempt UI    |  |  Mission System         |
   +-------------------------+  +-------------------------+
                                           |
                                           v
                               +-------------------------+
                               |  comodin_uses           |
                               |  (Audit trail)          |
                               |  N rows per user        |
                               +-------------------------+
```

---

## Files Analyzed

| File | Path |
|------|------|
| comodin_usage_log | `apps/database/ddl/schemas/gamification_system/tables/14-comodin_usage_log.sql` |
| comodin_usage_tracking | `apps/database/ddl/schemas/gamification_system/tables/15-comodin_usage_tracking.sql` |
| comodin_uses | `apps/database/ddl/schemas/gamification_system/tables/21-comodin_uses.sql` |
| comodines_inventory | `apps/database/ddl/schemas/gamification_system/tables/07-comodines_inventory.sql` |
| mission trigger | `apps/database/ddl/schemas/gamification_system/triggers/28-trg_update_missions_on_use_comodines.sql` |
| consume_comodin function | `apps/database/ddl/schemas/gamification_system/functions/consume_comodin.sql` |

---

## Appendix: Column Comparison

### comodin_usage_log vs comodin_uses

| Column | comodin_usage_log | comodin_uses | Match |
|--------|-------------------|--------------|-------|
| id | UUID PK | UUID PK | Yes |
| user_id | UUID NOT NULL | UUID NOT NULL | Yes |
| comodin_type | ENUM | ENUM | Yes |
| exercise_id | UUID (no FK) | UUID (FK) | Partial |
| attempt_id | UUID (no FK) | UUID (FK) | Partial |
| effect_applied | TEXT | VARCHAR(100) | Similar |
| value_provided | JSONB | JSONB | Yes |
| module_id | UUID | - | No |
| usage_context | JSONB | - | No |
| used_at / consumed_at | TIMESTAMPTZ | TIMESTAMPTZ | Yes |
| UNIQUE constraint | Yes | No | Different |

---

*Analysis completed by @REFACTOR_AGENT on 2026-02-03*
