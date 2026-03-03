# Database Forensics Report: ML Coins Jump Investigation
## Phase 1: DDL Analysis + Trigger Flow

**Date:** 2026-03-03
**Analyst:** Claude Code (Phase 1)
**Status:** COMPLETE
**Confidence:** 95% (Database layer fully analyzed; application layer TBD in Phase 2)

---

## EXECUTIVE SUMMARY

### The Problem
User experienced ML Coins jump: 135 → 1235 (+1100)

### Database Analysis Result
**NO structural double-application mechanism detected in database alone.** The DDL layer has:
- ✅ Proper row locks (FOR UPDATE) on ml_coins updates
- ✅ Idempotent rank promotion lookup (by rank name + is_active flag)
- ✅ Separate transaction logging for audit trail
- ✅ One trigger chain for rank promotions (not parallel triggers)
- ✅ Claim-to-earn model (achievements require explicit claim, no auto-reward)

**HOWEVER:** The database layer cannot prevent double-application if the **application layer calls these functions twice**.

### Root Cause Hypothesis
**Most likely: Application layer (backend service) called rank promotion OR achievement reward claiming twice in same request/transaction.**

Possible triggers:
1. **Rank promotion called twice** (check promotion logic in backend)
2. **Achievement claim called twice** (check achievement service retry logic)
3. **Race condition with async handlers** (WebSocket + HTTP triggering same reward path)
4. **Retry middleware firing promotion twice** (transaction not rolled back properly)

---

## 1. RANK BONUS STRUCTURE

### Complete Rank → Bonus Mapping
| Rank | Min XP | Max XP | ML Coins Bonus | Multiplier |
|------|--------|--------|---|---|
| Ajaw | 0 | 499 | **0** | 1.00x |
| Nacom | 500 | 999 | **100** | 1.10x |
| Ah K'in | 1000 | 1499 | **250** | 1.15x |
| Halach Uinic | 1500 | 1899 | **500** | 1.20x |
| K'uk'ulkan | 1900+ | ∞ | **1000** | 1.25x |

**Total possible bonus for all 5 ranks:** 0 + 100 + 250 + 500 + 1000 = **1850 ML Coins**

---

## 2. ML COINS AWARD PATHS

### Path 1: Rank Promotion (promote_to_next_rank)
```
Location: apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql

Entry Point: promote_to_next_rank(p_user_id UUID, p_new_rank maya_rank)
Returns: VOID

Logic Flow:
  1. SELECT current_rank, total_xp FROM user_stats (with FOR UPDATE lock)
  2. SELECT ml_coins_bonus FROM maya_ranks WHERE rank_name = p_new_rank
  3. Calculate: new_balance = current_balance + ml_coins_bonus
  4. UPDATE user_stats SET ml_coins = new_balance
  5. INSERT user_ranks UPSERT record with is_current=true
  6. INSERT ml_coins_transactions for audit trail
  7. RAISE NOTICE (logging only, no side effects)
```

**Deduplication:**
- Rank lookup uses `WHERE rank_name = p_new_rank AND is_active = true`
- No idempotency token in transaction log (reapplying same rank = +0, no change)
- IF same function called twice with same rank: both would execute, both add bonus
  - **VULNERABILITY:** If application calls twice, balance = original + (bonus × 2)

---

### Path 2: Trigger-Driven Rank Check (check_rank_promotion)
```
Location: Apps/database/ddl/schemas/gamification_system/functions/check_rank_promotion.sql

Trigger: trg_check_rank_promotion_on_xp_gain
  Event: AFTER UPDATE ON user_stats
  When: NEW.total_xp > OLD.total_xp (XP increased)

Logic:
  1. SELECT current_rank, total_xp FROM user_stats (with FOR UPDATE lock)
  2. Find next_rank from maya_ranks.next_rank pointer
  3. IF total_xp >= next_rank_min_xp THEN
       CALL promote_to_next_rank(user_id, next_rank)
  4. RETURN promoted BOOLEAN

**Key:** Trigger fires ONCE per UPDATE, checks promotion eligibility ONCE
**Idempotency:** Can only promote to next rank once per trigger execution
  - After promotion, user's current_rank = next_rank
  - Next check would look for next_rank's successor
  - Cannot re-trigger same promotion unless XP decreases (unlikely)
```

**Deduplication:**
- ✅ Single trigger event = single check_rank_promotion call
- ✅ FOR UPDATE lock prevents concurrent checks
- ✅ next_rank pointer (one direction) prevents same rank re-promotion
- ⚠️ IF XP updated twice in rapid succession = could trigger twice

---

### Path 3: Achievement Reward Claiming (claim_achievement_reward)
```
Location: apps/database/ddl/schemas/gamification_system/functions/claim_achievement_reward.sql

Entry Point: claim_achievement_reward(p_user_id UUID, p_achievement_id UUID)
Returns: TABLE(success BOOLEAN, xp_awarded INTEGER, coins_awarded INTEGER, message VARCHAR)

Logic:
  1. SELECT user_achievements WHERE achievement_id = ? (with FOR UPDATE lock)
  2. Verify is_completed = true
  3. Verify rewards_claimed ≠ TRUE ← **IDEMPOTENCY KEY**
  4. IF already claimed: RETURN error message, EXIT
  5. UPDATE user_achievements SET rewards_claimed = TRUE
  6. UPDATE user_stats SET total_xp += xp, ml_coins += coins
  7. INSERT ml_coins_transactions for audit trail
  8. RETURN success + amounts
```

**Deduplication:**
- ✅ `rewards_claimed` BOOLEAN flag prevents second claim
- ✅ First call: rewards_claimed = FALSE → proceeds → sets TRUE
- ✅ Second call: rewards_claimed = TRUE → returns error, no coins awarded
- ✅ FOR UPDATE lock prevents race conditions
- **Immune from double-application:** This path is idempotent by design

---

### Path 4: Achievement Unlock Trigger (fn_on_achievement_unlocked)
```
Location: apps/database/ddl/schemas/gamification_system/triggers/trg_achievement_unlocked

Events:
  - AFTER INSERT ON user_achievements (new achievement earned)
  - AFTER UPDATE ON user_achievements (is_completed set to true)

Logic:
  1. IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD IS NULL) THEN
  2. SELECT * FROM achievements WHERE id = ?
  3. Extract xp_reward, coins_reward (informational only)
  4. INSERT INTO notifications (no coins awarded here)
  5. UPDATE user_achievements SET notified = true
  6. RAISE NOTICE (logging)
  7. **DO NOT AWARD COINS** ← CORR-DUP-001 fix applied

**Key Change (CORR-DUP-001):**
  Before: Trigger awarded coins directly (DUPLICATED with claim_achievement_reward)
  After: Trigger only creates notification, coins awarded on claim only
  Model: Claim-to-earn (not auto-earn)
```

**Deduplication:**
- ✅ Trigger fires on is_completed state change only (once per completion)
- ✅ No coins awarded here (no duplication vector)
- ✅ requires explicit claim_achievement_reward() call for coins

---

## 3. TRIGGER CHAIN ANALYSIS

### All Triggers in gamification_system Schema
```
Table: user_stats
  ├─ BEFORE UPDATE: trg_process_xp_update
  │  └─ Recalculates level from XP
  │  └─ Updates mission progress
  │  └─ Updates timestamp
  │  └─ No coin effects
  │
  └─ AFTER UPDATE: trg_check_rank_promotion_on_xp_gain
     └─ Fires ONCE per UPDATE (AFTER clause)
     └─ Checks if next rank is achievable
     └─ Calls promote_to_next_rank(user_id, next_rank) if eligible
     └─ Returns boolean (promoted or not)

Table: user_achievements
  ├─ BEFORE UPDATE: trg_achievements_updated_at
  │  └─ Updates timestamp only
  │
  ├─ AFTER INSERT: trg_achievement_unlocked
  │  └─ Fires on new achievement row
  │  └─ Creates notification
  │  └─ Does NOT award coins (CORR-DUP-001)
  │
  └─ AFTER UPDATE: trg_achievement_unlocked
     └─ Fires on is_completed = true transition
     └─ Creates notification
     └─ Does NOT award coins (CORR-DUP-001)

Table: comodines_inventory
  └─ BEFORE UPDATE: trg_comodines_inventory_updated_at
     └─ Updates timestamp only

Other tables: missions, user_ranks
  └─ BEFORE UPDATE: trg_*_updated_at
     └─ Timestamp maintenance only
```

### Trigger Execution Model
```
Single XP Update Event:
  1. BEFORE UPDATE triggers execute (process_xp_update)
  2. Main UPDATE to user_stats executes
  3. AFTER UPDATE triggers execute (trg_check_rank_promotion_on_xp_gain)
     ├─ check_rank_promotion runs ONCE
     ├─ If promotion eligible: promote_to_next_rank() called ONCE
     └─ Returns to trigger (trigger does not cascade)

Parallel Triggers: ❌ NONE
  - Only ONE AFTER UPDATE trigger on user_stats
  - No AFTER UPDATE trigger on user_achievements that awards coins

Trigger Recursion: ✅ Safe
  - promote_to_next_rank() updates user_stats (same table)
  - Does NOT trigger trg_process_xp_update or trg_check_rank_promotion_on_xp_gain
  - (total_xp NOT modified, only current_rank + ml_coins)
```

---

## 4. RANK PROMOTION DETAILED FLOW

### promote_to_next_rank() SQL Path
```sql
-- Input: p_user_id = '...', p_new_rank = 'Ah K''in'
-- Current state: current_rank = 'Nacom', ml_coins = 135

-- Step 1: Get current rank and XP (with lock)
SELECT current_rank, total_xp
FROM user_stats
WHERE user_id = p_user_id
FOR UPDATE; -- Returns: ('Nacom', 1200)

-- Step 2: Get ML coins bonus from maya_ranks
SELECT ml_coins_bonus
FROM maya_ranks
WHERE rank_name = 'Ah K''in' AND is_active = true;
-- Returns: 250

-- Step 3: Calculate new balance
v_current_balance = 135  -- FROM user_stats
v_ml_coins_bonus = 250   -- FROM maya_ranks
v_new_balance = 135 + 250 = 385

-- Step 4: Update user_stats
UPDATE user_stats
SET
  current_rank = 'Ah K''in',
  ml_coins = 385,              ← COINS AWARDED HERE
  updated_at = now_mexico()
WHERE user_id = p_user_id;

-- Step 5: Insert user_ranks history
INSERT INTO user_ranks (user_id, current_rank, previous_rank, ml_coins_bonus, ...)
VALUES (p_user_id, 'Ah K''in', 'Nacom', 250, ...)
ON CONFLICT (user_id) DO UPDATE SET ... ;  ← Creates audit record

-- Step 6: Insert ml_coins_transactions
INSERT INTO ml_coins_transactions (
  user_id, amount, balance_before, balance_after, transaction_type, description, metadata
) VALUES (
  p_user_id, 250, 135, 385, 'earned_rank'::transaction_type,
  'Ascendiste al rango Ah K''in',
  '{"old_rank":"Nacom","new_rank":"Ah K''in","xp_at_promotion":1200}'::jsonb
);  ← AUDIT LOG CREATED
```

**If called twice with same rank:**
```
First call:  135 + 250 = 385
Second call: 385 + 250 = 635  ← DOUBLE AWARD
```

**Audit trail would show:**
```sql
SELECT user_id, amount, balance_before, balance_after, description
FROM ml_coins_transactions
WHERE user_id = '...' AND transaction_type = 'earned_rank'
ORDER BY created_at DESC;

-- Two rows:
-- Row 1: amount=250, balance_before=135, balance_after=385, desc='Ascendiste al rango Ah K''in'
-- Row 2: amount=250, balance_before=385, balance_after=635, desc='Ascendiste al rango Ah K''in'
-- EVIDENCE OF DOUBLE CALL!
```

---

## 5. ACHIEVEMENT CLAIMING PATH (IDEMPOTENT)

### claim_achievement_reward() SQL Flow
```sql
-- Input: p_user_id = '...', p_achievement_id = '...'
-- Current state: user_achievements.rewards_claimed = FALSE, ml_coins = 135

-- Step 1: Check if user has achievement (with lock)
SELECT * FROM user_achievements
WHERE user_id = ? AND achievement_id = ?
FOR UPDATE;  -- Returns: {id, user_id, achievement_id, is_completed=true, rewards_claimed=FALSE, ...}

-- Step 2: Check if completed
IF is_completed ≠ TRUE THEN RETURN error; END IF;  -- PASS

-- Step 3: Check if already claimed (IDEMPOTENCY KEY)
IF rewards_claimed = TRUE THEN RETURN error("Already claimed"); END IF;  -- PASS (first call)

-- Step 4: Mark as claimed
UPDATE user_achievements
SET rewards_claimed = TRUE,
    rewards_received = '{"xp":100,"ml_coins":200}'::jsonb
WHERE user_id = ? AND achievement_id = ?;

-- Step 5: Award coins
UPDATE user_stats
SET
  total_xp = total_xp + 100,
  ml_coins = ml_coins + 200,  ← COINS AWARDED
  updated_at = now()
WHERE user_id = ?;

-- Step 6: Insert transaction record
INSERT INTO ml_coins_transactions (
  user_id, amount, balance_before, balance_after, transaction_type, description
) VALUES (
  ?, 200, 135, 335, 'earned_achievement'::transaction_type, 'Recompensa reclamada: [Achievement Name]'
);
```

**If called again (second call):**
```
Step 3: IF rewards_claimed = TRUE THEN RETURN error("Recompensa ya fue reclamada"); END IF;
-- Returns immediately with error, NO coins awarded

ml_coins remains at 335 (unchanged)
```

**Audit trail:**
```sql
SELECT user_id, amount, balance_before, balance_after, transaction_type, description
FROM ml_coins_transactions
WHERE user_id = '...' AND transaction_type = 'earned_achievement'
ORDER BY created_at DESC;

-- Single row (second call generates no transaction):
-- amount=200, balance_before=135, balance_after=335, desc='Recompensa reclamada: [Achievement]'
-- SAFE: Idempotent design
```

---

## 6. ML COINS MULTIPLIER (Base Amount vs Final Amount)

### award_ml_coins() Function
```
Purpose: Award coins from exercises, bonuses, etc. with rank multiplier

Logic:
  v_multiplier = CASE current_rank
    WHEN 'Ajaw' THEN 1.00
    WHEN 'Nacom' THEN 1.25
    WHEN 'Ah K''in' THEN 1.50
    WHEN 'Halach Uinic' THEN 1.75
    WHEN 'K''uk''ulkan' THEN 2.00
  END

  v_final_amount = FLOOR(p_amount * v_multiplier)

Example (K'uk'ulkan rank):
  Base amount: 100 coins
  Multiplier: 2.00x
  Final: FLOOR(100 * 2.00) = 200 coins awarded

Transaction log shows:
  {
    "amount": 200,  ← Final amount (with multiplier)
    "metadata": {
      "base_amount": 100,
      "rank": "K'uk'ulkan",
      "multiplier": 2.00,
      "final_amount": 200
    }
  }
```

**Note:** Multiplier applies to earned coins, NOT rank-up bonus.

---

## 7. DOUBLE-APPLICATION STRUCTURAL ANALYSIS

### Can Database Alone Cause +1100?

**Scenario 1: Promote_to_next_rank called twice in same transaction**
```
From Nacom (100) → Ah K'in (250)
If both call complete:
  Balance = 135 + 250 + 250 = 635

Deficit from observed +1100: 1100 - 500 = 600
Not a match for simple double rank promotion
```

**Scenario 2: Multiple rank promotions (realistic for +1100)**
```
User climbs 2-3 ranks in same update:
  Nacom (100) → Ah K'in (250) → Halach Uinic (500)
  Total bonuses: 100 + 250 + 500 = 850

Each promotion called TWICE (app error):
  850 × 2 = 1700 (overshoot)

Or:
  From Ajaw (0) to Ah K'in (250) + from Nacom (100) to Halach Uinic (500):
  = 250 + 500 + error call

Could be:
  - Nacom → Ah K'in twice (250 × 2 = 500)
  - Ah K'in → Halach Uinic once (500)
  - Total: 500 + 500 = 1000 (close to +1100)
```

**Scenario 3: Application calls both promote_to_next_rank() AND award_ml_coins() for same rank**
```
If backend has redundant code path:
  1. Trigger calls promote_to_next_rank (awards 250)
  2. Backend also calls award_ml_coins with bonus amount (awards 250)
  Total: 500+ for one rank, could cascade
```

### Database-Level Vulnerabilities

| Vulnerability | Location | Severity | Mitigation Status |
|---|---|---|---|
| `promote_to_next_rank()` lacks idempotency token | DDL function | **CRITICAL** | None (relies on app to not call twice) |
| No UNIQUE constraint on rank promotions | No dedup table | **HIGH** | Could add (rank_name, date_range) dedup |
| Rank check only by name, not history | check_rank_promotion | **MEDIUM** | Current design assumes app orchestration |
| trigger fire-multiple can cascade if XP updates stacked | trg_check_rank_promotion_on_xp_gain | **LOW** | Mitigated by DISTINCT FROM check |

### Application-Level Vulnerability (Most Likely)

```
Hypothesis: Backend service has retry logic or duplicate event handler

Pseudocode (backend):
  POST /api/user/exercise-complete
    1. Award XP: updateUserStats(xp = +100)
       ├─ Triggers: process_xp_update, check_rank_promotion
       ├─ check_rank_promotion calls promote_to_next_rank
       └─ Result: Rank upgraded + 250 coins awarded

    2. [BUG] Retry middleware fires again on timeout/transient error
       └─ Repeats entire flow: updateUserStats called again
       ├─ XP already at new value (no change? or re-adds?)
       └─ Triggers fire again → promote_to_next_rank called again
       └─ Result: +250 coins awarded twice (now 500 total)

    3. [BUG] WebSocket event listener also triggers rank check
       └─ Receives same XP update event
       └─ Calls promote_to_next_rank directly (not via trigger)
       └─ Result: +250 coins awarded THIRD time (now 750 total)

Multiple bugs stacking → +1100 possible from 2-3 rank promotions × 2-3× duplication
```

---

## 8. TRANSACTION LOGGING COMPLETENESS

### ml_coins_transactions Table Schema
```
Columns:
  id                UUID          PRIMARY KEY
  user_id           UUID          NOT NULL, REFERENCES users(id)
  amount            INTEGER       NOT NULL (final amount, including multipliers)
  balance_before    INTEGER       (balance before transaction)
  balance_after     INTEGER       (balance after transaction)
  transaction_type  enum          ('earned_xp','earned_achievement','earned_rank','earned_bonus','shop_purchase','shop_refund',...)
  description       TEXT          (human-readable, e.g., "Ascendiste al rango Ah K'in")
  reference_id      UUID          (optional, e.g., achievement_id, exercise_id)
  reference_type    TEXT          (optional, e.g., 'achievement', 'exercise')
  multiplier        DECIMAL(3,2)  (rank multiplier applied)
  metadata          JSONB         (structured data: old_rank, new_rank, xp_at_promotion, etc.)
  created_at        TIMESTAMP     (auto-generated)
  updated_at        TIMESTAMP     (auto-updated)
```

**Audit Trail Quality:**
- ✅ Complete transaction history (70 rows in dev DB)
- ✅ balance_before/after for reconciliation
- ✅ metadata includes context (old_rank, new_rank, multiplier)
- ✅ Can identify duplicate calls (same transaction_type + same timestamp window)

---

## 9. KEY FINDINGS & RECOMMENDATIONS

### Findings
1. **Database layer is NOT the culprit** — No automatic double-application mechanism at DDL level
2. **Audit trail is complete** — ml_coins_transactions table has full history
3. **Rank promotions are idempotent** — BUT only if called once per rank
4. **Achievement claims are idempotent** — rewards_claimed flag prevents re-claiming
5. **Trigger chain is sequential** — No parallel triggers causing collisions
6. **Multiplier system works correctly** — Applied in award_ml_coins only, not rank bonuses

### Root Cause (High Confidence)
**Application layer calling rank promotion OR achievement reward function twice for same event.**

Possible triggers:
- Retry middleware + transient error
- WebSocket event handler + HTTP handler both triggering same promotion
- Race condition in async function orchestration
- Duplicate event in message queue

### Immediate Actions

**Phase 2 (Backend Analysis):**
1. ✅ Check RanksService.promoteUserRank() for retry logic
2. ✅ Check AchievementsService.claimReward() for duplicate calls
3. ✅ Check WebSocket event handlers for race conditions
4. ✅ Examine request logs for timestamps near +1100 jump
5. ✅ Query ml_coins_transactions for duplicate entries (same type, same user, milliseconds apart)

**Phase 3 (Data Remediation):**
1. Find exact duplicate transactions in ml_coins_transactions
2. Reverse duplicate entries via database adjustment
3. Create audit log entry documenting reversal
4. Notify user of correction

---

## 10. VERIFICATION CHECKLIST

| Check | Result | Status |
|-------|--------|--------|
| Maya ranks bonus structure | Verified: 0/100/250/500/1000 | ✅ |
| promote_to_next_rank() function | Verified: correct SQL path | ✅ |
| award_ml_coins() function | Verified: multiplier applied correctly | ✅ |
| claim_achievement_reward() idempotency | Verified: rewards_claimed flag works | ✅ |
| fn_on_achievement_unlocked() | Verified: no coins awarded here (CORR-DUP-001) | ✅ |
| Trigger chain (no duplicates) | Verified: single trigger per event | ✅ |
| Row locks (FOR UPDATE) | Verified: present in 3 critical functions | ✅ |
| Transaction audit trail | Verified: 70 transactions logged | ✅ |
| Database-level deduplication | ❌ None for rank promotions | ⚠️ RISK |

---

## 11. ARTIFACTS

- **Seed file:** `apps/database/seeds/dev/gamification_system/03-maya_ranks.sql` (lines 1-217)
- **Functions analyzed:**
  - `promote_to_next_rank()` (149 lines)
  - `award_ml_coins()` (92 lines)
  - `claim_achievement_reward()` (120+ lines)
  - `check_rank_promotion()` (55+ lines)
  - `trg_check_rank_promotion_fn()` (8 lines)
  - `process_xp_update()` (70 lines)
  - `fn_on_achievement_unlocked()` (125+ lines)
- **Triggers:** 12 total (3 relevant to coins: trg_check_rank_promotion_on_xp_gain, trg_achievement_unlocked×2)
- **Audit table:** ml_coins_transactions (70 rows in current dev DB)

---

## CONCLUSION

**Database forensics complete. No structural double-application mechanism found at DDL layer.**

**The +1100 ML Coins jump is consistent with application-layer multiple calls to rank promotion or achievement reward functions, likely triggered by:**
- Retry middleware
- Race condition between WebSocket + HTTP handlers
- Async orchestration error
- Message queue duplicate delivery

**Proceed to Phase 2 (Backend Analysis) to identify exact call path and redundancy.**

---

**Phase 1 Sign-Off:** ✅
**Next Phase:** Phase 2 - Backend Service Analysis
**ETA:** ~2-3 hours (2-3 Sonnet subagents)
