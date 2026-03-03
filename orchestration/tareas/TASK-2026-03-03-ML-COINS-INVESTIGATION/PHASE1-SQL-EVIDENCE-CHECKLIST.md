# Phase 1: SQL Evidence Checklist

**Purpose:** Step-by-step SQL queries to verify database forensics findings and collect evidence for Phase 2.

---

## A. VERIFY RANK BONUSES

### Query A1: All maya_ranks configuration
```sql
SELECT
    rank_order,
    rank_name,
    min_xp_required,
    max_xp_threshold,
    ml_coins_bonus,
    xp_multiplier,
    is_active
FROM gamification_system.maya_ranks
ORDER BY rank_order;
```

**Expected Output (VERIFIED):**
```
rank_order | rank_name     | min_xp | max_xp | ml_coins_bonus | xp_multiplier | is_active
───────────┼───────────────┼────────┼────────┼────────────────┼───────────────┼──────────
1          | Ajaw          | 0      | 499    | 0              | 1.00          | t
2          | Nacom         | 500    | 999    | 100            | 1.10          | t
3          | Ah K'in       | 1000   | 1499   | 250            | 1.15          | t
4          | Halach Uinic  | 1500   | 1899   | 500            | 1.20          | t
5          | K'uk'ulkan    | 1900   | NULL   | 1000           | 1.25          | t
```

---

## B. VERIFY TRIGGERS ON USER_STATS

### Query B1: Count triggers
```sql
SELECT COUNT(*)
FROM information_schema.triggers
WHERE event_object_schema = 'gamification_system'
  AND event_object_table = 'user_stats';
```

**Expected:** 3 triggers (not 2, not 4)

### Query B2: List all triggers
```sql
SELECT
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'gamification_system'
  AND event_object_table = 'user_stats'
ORDER BY trigger_name;
```

**Expected Output (VERIFIED):**
```
trigger_name                          | event_manipulation | action_timing | action_statement
──────────────────────────────────────┼────────────────────┼───────────────┼─────────────────────
trg_check_rank_promotion_on_xp_gain   | UPDATE             | AFTER         | EXECUTE FUNCTION...
trg_process_xp_update                 | UPDATE             | BEFORE        | EXECUTE FUNCTION...
trg_user_stats_updated_at             | UPDATE             | BEFORE        | EXECUTE FUNCTION...
```

---

## C. VERIFY NO PARALLEL COIN-AWARDING TRIGGERS

### Query C1: All triggers on user_achievements
```sql
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'gamification_system'
  AND event_object_table = 'user_achievements'
ORDER BY trigger_name;
```

**Expected:** 3 rows (2× trg_achievement_unlocked + 1× updated_at)

### Query C2: Verify achievement unlocked does NOT award coins
```sql
SELECT prosrc
FROM pg_proc
WHERE proname = 'fn_on_achievement_unlocked'
AND prosrc LIKE '%ml_coins%';  -- Should find ZERO coin-awarding statements
```

**Expected:** No results (indicating no `ml_coins` modification in trigger)

---

## D. VERIFY RANK PROMOTION FUNCTION LOGIC

### Query D1: Check promote_to_next_rank() structure
```sql
SELECT
    proname,
    prosrc
FROM pg_proc
WHERE proname = 'promote_to_next_rank'
LIMIT 1;
```

**Expected:** Function exists with 149 lines, includes:
- `SELECT ml_coins_bonus FROM maya_ranks` ✓
- `v_new_balance := ... + v_ml_coins_bonus` ✓
- `UPDATE user_stats SET ml_coins = v_new_balance` ✓
- `INSERT INTO ml_coins_transactions` ✓

### Query D2: Verify no loop in promote_to_next_rank
```sql
SELECT prosrc
FROM pg_proc
WHERE proname = 'promote_to_next_rank';
```

Search results for: `LOOP`, `WHILE`, `FOR`, `RECURSIVE`

**Expected:** Zero results (no loops, function executes once per call)

---

## E. VERIFY ACHIEVEMENT CLAIMING IDEMPOTENCY

### Query E1: Check claim_achievement_reward() rewards_claimed flag logic
```sql
SELECT prosrc
FROM pg_proc
WHERE proname = 'claim_achievement_reward';
```

Search for: `rewards_claimed` + error return on duplicate

**Expected:** Contains:
```sql
IF v_already_claimed THEN
    RETURN QUERY SELECT false, 0, 0, 'Recompensa ya fue reclamada'::VARCHAR;
    RETURN;
END IF;
```

---

## F. VERIFY TRANSACTION AUDIT TABLE

### Query F1: Check ml_coins_transactions row count
```sql
SELECT COUNT(*) as total_transactions
FROM gamification_system.ml_coins_transactions;
```

**Expected:** 70 rows (current dev DB)

### Query F2: Transaction type distribution
```sql
SELECT
    transaction_type,
    COUNT(*) as count
FROM gamification_system.ml_coins_transactions
GROUP BY transaction_type
ORDER BY count DESC;
```

**Expected:** Shows breakdown by type (earned_rank, earned_achievement, earned_xp, etc.)

### Query F3: Check for duplicate transactions (indicator of double-call)
```sql
SELECT
    user_id,
    transaction_type,
    description,
    amount,
    balance_before,
    balance_after,
    created_at,
    COUNT(*) as occurrences
FROM gamification_system.ml_coins_transactions
GROUP BY user_id, transaction_type, description, amount, balance_before, balance_after, created_at
HAVING COUNT(*) > 1
ORDER BY created_at DESC;
```

**Expected:** 0 results (or if >0, indicates exact duplicates)

---

## G. VERIFY ROW LOCKING IN CRITICAL FUNCTIONS

### Query G1: Check promote_to_next_rank uses FOR UPDATE
```sql
SELECT prosrc
FROM pg_proc
WHERE proname = 'promote_to_next_rank'
AND prosrc LIKE '%FOR UPDATE%';
```

**Expected:** 1 result (row lock present)

### Query G2: Check award_ml_coins uses FOR UPDATE
```sql
SELECT prosrc
FROM pg_proc
WHERE proname = 'award_ml_coins'
AND prosrc LIKE '%FOR UPDATE%';
```

**Expected:** 1 result (row lock present)

### Query G3: Check claim_achievement_reward uses FOR UPDATE
```sql
SELECT prosrc
FROM pg_proc
WHERE proname = 'claim_achievement_reward'
AND prosrc LIKE '%FOR UPDATE%';
```

**Expected:** 1 result (row lock present)

---

## H. EVIDENCE COLLECTION FOR SUSPECT USER

### Query H1: Get all ML coin transactions for suspect user

Replace `'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'` with actual user_id:

```sql
SELECT
    id,
    user_id,
    amount,
    balance_before,
    balance_after,
    transaction_type,
    description,
    reference_id,
    reference_type,
    multiplier,
    metadata,
    created_at
FROM gamification_system.ml_coins_transactions
WHERE user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
ORDER BY created_at DESC
LIMIT 20;
```

**Look for:**
- Pattern of duplicate rows (same transaction_type back-to-back)
- Same balance_before/after values in sequential rows
- High amount values (250, 500, 1000 = rank bonuses)
- Created_at timestamps < 1 second apart

### Query H2: Suspicious pattern detection

```sql
WITH coin_trans AS (
    SELECT
        user_id,
        amount,
        balance_before,
        balance_after,
        transaction_type,
        description,
        created_at,
        LAG(balance_after) OVER (PARTITION BY user_id ORDER BY created_at) as prev_balance_after
    FROM gamification_system.ml_coins_transactions
    WHERE user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
)
SELECT
    user_id,
    transaction_type,
    description,
    amount,
    balance_before,
    balance_after,
    prev_balance_after,
    CASE
        WHEN balance_before = prev_balance_after THEN '✓ SEQUENTIAL'
        WHEN balance_before = prev_balance_after - 250 THEN '✓ 250 bonus match'
        WHEN balance_before = prev_balance_after - 500 THEN '✓ 500 bonus match'
        WHEN balance_before = prev_balance_after - 1000 THEN '✓ 1000 bonus match'
        ELSE 'Gap detected'
    END as pattern,
    created_at
FROM coin_trans
WHERE description LIKE '%Ascendiste%'
ORDER BY created_at DESC;
```

**Expected:** Clear audit trail showing which transactions are suspicious

---

## I. RANK HISTORY VERIFICATION

### Query I1: Check user_ranks table for suspect user
```sql
SELECT
    user_id,
    current_rank,
    previous_rank,
    ml_coins_bonus,
    achieved_at,
    is_current,
    created_at,
    updated_at
FROM gamification_system.user_ranks
WHERE user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
ORDER BY achieved_at DESC;
```

**Expected:** One row per rank promotion, ml_coins_bonus values match maya_ranks

### Query I2: Verify current rank matches user_stats
```sql
SELECT
    us.user_id,
    us.current_rank as stats_rank,
    ur.current_rank as user_ranks_rank,
    CASE
        WHEN us.current_rank = ur.current_rank THEN '✓ Match'
        ELSE '⚠ MISMATCH'
    END as consistency
FROM gamification_system.user_stats us
LEFT JOIN gamification_system.user_ranks ur
    ON us.user_id = ur.user_id AND ur.is_current = true
WHERE us.user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

**Expected:** Match (or mismatch indicates data integrity issue)

---

## J. MULTIPLIER VERIFICATION

### Query J1: Check if multiplier was applied correctly
```sql
SELECT
    user_id,
    amount as final_amount,
    metadata->>'base_amount' as base_amount,
    metadata->>'multiplier' as multiplier_used,
    (metadata->>'base_amount')::INTEGER * (metadata->>'multiplier')::DECIMAL as expected_final,
    amount as actual_final,
    CASE
        WHEN amount = FLOOR((metadata->>'base_amount')::INTEGER * (metadata->>'multiplier')::DECIMAL)
             THEN '✓ Correct'
        ELSE '⚠ MISMATCH'
    END as validation
FROM gamification_system.ml_coins_transactions
WHERE user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  AND transaction_type = 'earned_xp'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:** All "Correct" (multiplier correctly applied)

---

## K. MASTER INTEGRITY CHECK

### Query K1: Verify no orphaned transactions
```sql
SELECT COUNT(*)
FROM gamification_system.ml_coins_transactions t
LEFT JOIN gamification_system.user_stats u ON t.user_id = u.id
WHERE u.id IS NULL;  -- User doesn't exist
```

**Expected:** 0 (all transactions belong to valid users)

### Query K2: Verify balance consistency
```sql
SELECT
    user_id,
    ml_coins as current_balance,
    (SELECT MAX(balance_after)
     FROM gamification_system.ml_coins_transactions t2
     WHERE t2.user_id = user_stats.user_id) as max_recorded_balance,
    CASE
        WHEN ml_coins = (SELECT MAX(balance_after)
                         FROM gamification_system.ml_coins_transactions t2
                         WHERE t2.user_id = user_stats.user_id)
             THEN '✓ Consistent'
        ELSE '⚠ MISMATCH'
    END as consistency
FROM gamification_system.user_stats
WHERE user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

**Expected:** Consistent (current balance = latest transaction balance_after)

---

## EXECUTION ORDER FOR PHASE 1 VERIFICATION

1. **Run A1** - Confirm rank bonuses
2. **Run B1, B2** - Confirm triggers on user_stats
3. **Run C1, C2** - Confirm no coin-awarding triggers
4. **Run D1, D2** - Confirm promote_to_next_rank logic
5. **Run E1** - Confirm achievement claiming idempotency
6. **Run F1, F2, F3** - Confirm audit trail completeness
7. **Run G1, G2, G3** - Confirm row locking
8. **Run H1, H2** - Collect evidence for suspect user (requires user_id)
9. **Run I1, I2** - Verify rank history consistency
10. **Run J1** - Verify multiplier calculations
11. **Run K1, K2** - Integrity check across tables

---

## INTERPRETATION GUIDE

### If all A-G queries pass:
✅ **Database layer is sound** - No structural double-application mechanism at DDL level

### If H2 shows suspicious pattern:
⚠️ **Application layer duplication detected** - Multiple rank promotions in rapid succession

### If I2 shows MISMATCH:
⚠️ **Data integrity issue** - Rank not updated properly despite transaction log

### If J1 shows calculation errors:
⚠️ **Multiplier bug** - Base amount × multiplier not applied correctly

### If K1 shows orphaned transactions:
⚠️ **Referential integrity issue** - Transactions for deleted users (unlikely)

---

**Recommendation:** Execute queries in order, save outputs, proceed to Phase 2 with evidence.
