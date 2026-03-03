# ML Coins Award Flow Diagram

## 1. RANK PROMOTION FLOW (Most Likely Source of +1100)

```
User completes exercise → XP increases
                            ↓
                    UPDATE user_stats SET total_xp = total_xp + 100
                            ↓
    ┌─────────────────────────────────────────────────────────────┐
    │ BEFORE UPDATE TRIGGER: trg_process_xp_update                │
    │ - Recalculates level from XP                                 │
    │ - Updates mission progress                                   │
    │ - Does NOT modify total_xp                                   │
    └─────────────────────────────────────────────────────────────┘
                            ↓
            Main UPDATE completes (total_xp changed)
                            ↓
    ┌─────────────────────────────────────────────────────────────┐
    │ AFTER UPDATE TRIGGER: trg_check_rank_promotion_on_xp_gain   │
    │ - Fires ONCE per UPDATE                                      │
    │ - Checks IF NEW.total_xp > OLD.total_xp                     │
    └─────────────────────────────────────────────────────────────┘
                            ↓
        PERFORM check_rank_promotion(NEW.user_id)
                            ↓
    ┌─────────────────────────────────────────────────────────────┐
    │ FUNCTION: check_rank_promotion()                             │
    │ - SELECT current_rank, total_xp FROM user_stats (FOR UPDATE) │
    │ - Find next_rank pointer from maya_ranks                     │
    │ - IF total_xp >= next_rank.min_xp_required THEN              │
    │     CALL promote_to_next_rank(user_id, next_rank)            │
    │ - RETURN promoted BOOLEAN                                    │
    └─────────────────────────────────────────────────────────────┘
                            ↓
    ┌─────────────────────────────────────────────────────────────┐
    │ FUNCTION: promote_to_next_rank(user_id, new_rank)           │
    │                                                              │
    │ 1. SELECT ml_coins_bonus FROM maya_ranks                     │
    │    WHERE rank_name = new_rank AND is_active = true           │
    │                                                              │
    │ 2. Calculate: new_balance = current_balance + ml_coins_bonus │
    │                                                              │
    │ 3. UPDATE user_stats SET                                     │
    │      current_rank = new_rank,                                │
    │      ml_coins = new_balance,  ← COINS AWARDED HERE          │
    │      updated_at = now()                                      │
    │                                                              │
    │ 4. INSERT user_ranks (history + is_current=true)             │
    │                                                              │
    │ 5. INSERT ml_coins_transactions (audit log)                  │
    │    {amount, balance_before, balance_after, description, ...} │
    │                                                              │
    │ ⚠️ VULNERABILITY: If called twice = double coins            │
    └─────────────────────────────────────────────────────────────┘
                            ↓
            Transaction audit logged
            User ML coins updated
                            ↓
                        COMPLETE
```

## 2. ACHIEVEMENT CLAIMING FLOW (Idempotent Safe)

```
Achievement unlocked event (is_completed = true)
                            ↓
    ┌─────────────────────────────────────────────────────────────┐
    │ TRIGGER: trg_achievement_unlocked                            │
    │ - Creates notification (ONLY)                                │
    │ - Does NOT award coins (CORR-DUP-001 fix)                    │
    │ - RAISE NOTICE logging                                       │
    │ ✅ NO COINS AWARDED HERE                                     │
    └─────────────────────────────────────────────────────────────┘
                            ↓
    Frontend receives notification: "Achievement unlocked!
                                    Click to claim rewards"
                            ↓
    User clicks "Claim Rewards" button
                            ↓
    POST /api/achievements/:id/claim
                            ↓
    ┌─────────────────────────────────────────────────────────────┐
    │ FUNCTION: claim_achievement_reward(user_id, achievement_id) │
    │                                                              │
    │ 1. SELECT user_achievement WHERE user_id = ? (FOR UPDATE)    │
    │                                                              │
    │ 2. IF NOT completed: RETURN error                            │
    │                                                              │
    │ 3. ✅ IF rewards_claimed = true: RETURN error("Already...") │
    │       Second call returns here, no coins awarded             │
    │                                                              │
    │ 4. UPDATE user_achievements SET rewards_claimed = true       │
    │                                                              │
    │ 5. UPDATE user_stats SET                                     │
    │      total_xp = total_xp + xp_reward,                        │
    │      ml_coins = ml_coins + coins_reward  ← AWARDED HERE     │
    │                                                              │
    │ 6. INSERT ml_coins_transactions (audit log)                  │
    │                                                              │
    │ RETURN success + amounts                                     │
    │                                                              │
    │ ✅ IDEMPOTENT: Second call caught at step 3                  │
    └─────────────────────────────────────────────────────────────┘
                            ↓
            Coins credited to user
            Transaction audited
            Frontend updated
                            ↓
                        COMPLETE
```

## 3. DOUBLE-APPLICATION SCENARIOS

### Scenario A: Rank Promotion Called Twice (MOST LIKELY)

```
Event: User XP update triggers rank check

Timeline:
  T0: UPDATE user_stats SET total_xp = +100
      └─ Trigger fires: check_rank_promotion()
         └─ Calls promote_to_next_rank('Nacom' → 'Ah K''in')
         └─ Awards 250 coins (balance: 135 → 385)

  [BUG] Retry middleware or duplicate handler fires

  T1: UPDATE user_stats SET total_xp = +100 (again)
      └─ Trigger fires again: check_rank_promotion()
         └─ User already at 'Ah K''in', next = 'Halach Uinic'
         └─ But if check_rank_promotion called twice for same rank:
            promote_to_next_rank('Nacom' → 'Ah K''in') again
         └─ Awards 250 coins again (balance: 385 → 635)

Result: +500 coins instead of +250
Audit: Two rows in ml_coins_transactions with same description
```

### Scenario B: Multiple Rank Promotions + Double Calls

```
Event: User complete multiple exercises, rank 0 → 2

Timeline:
  T0: Nacom (100) + Ah K''in (250) = 350 coins
      └─ Correctly awarded once

  T1: Retry fires, double-awards Ah K''in (250)
      └─ New balance: 350 + 250 = 600

  T2: Async handler also triggers Ah K''in promotion
      └─ New balance: 600 + 250 = 850

Result: +850 coins (plausible from +1100 with other rewards)
```

### Scenario C: WebSocket + HTTP Handler Race

```
Frontend action → HTTP request
                    ↓
            Backend processes XP update
                    ↓
        trigger: check_rank_promotion fires
                    ↓
        WebSocket event: "rankPromoted" broadcast
                    ↓
Frontend receives WebSocket → HTTP request to claim reward
                    ↓
    User clicks "Claim" button at same time
                    ↓
Two HTTP requests: /api/achievements/claim + /api/ranks/promote
                    ↓
Both call promote_to_next_rank() independently
                    ↓
Result: +500 coins (same rank promoted twice)
```

## 4. AUDIT TRAIL RECONSTRUCTION

### Query to Find Duplicate Transactions

```sql
SELECT
    user_id,
    transaction_type,
    description,
    amount,
    balance_before,
    balance_after,
    created_at,
    metadata
FROM gamification_system.ml_coins_transactions
WHERE user_id = '...'  -- User who experienced jump
ORDER BY created_at DESC;

-- Look for:
-- 1. Same transaction_type (earned_rank) appearing twice
-- 2. Same description repeated
-- 3. balance_before of row 2 = balance_after of row 1
--    (would indicate sequential calls)
-- 4. timestamp gap < 100ms (indicates rapid re-execution)
```

### Example Output (Suspicious Pattern)

```
user_id                 | transaction_type | description          | amount | balance_before | balance_after | created_at
─────────────────────────┼──────────────────┼──────────────────────┼────────┼────────────────┼───────────────┼──────────────
xxx | earned_rank       | Ascendiste a...  | 250    | 135            | 385           | 2026-03-03 10:15:00
xxx | earned_rank       | Ascendiste a...  | 250    | 385            | 635           | 2026-03-03 10:15:00  ← SAME TIMESTAMP!
xxx | earned_rank       | Ascendiste a...  | 500    | 635            | 1135          | 2026-03-03 10:15:02
                                                                      ↑
                                                            Matches +1100 jump!
```

## 5. MULTIPLE COINS AWARD PATHS

```
┌─────────────────────────────────────────────────────────────────┐
│ ML COINS CAN BE AWARDED VIA:                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Rank Promotion (promote_to_next_rank)                       │
│    └─ Called by: trigger on XP update                          │
│    └─ Bonus: 0/100/250/500/1000 (from maya_ranks)              │
│    └─ Audit: ml_coins_transactions type='earned_rank'          │
│    └─ VULNERABILITY: No idempotency                            │
│                                                                 │
│ 2. Achievement Claim (claim_achievement_reward)                │
│    └─ Called by: explicit API call (user clicks "Claim")       │
│    └─ Amount: from achievements.ml_coins_reward                │
│    └─ Audit: ml_coins_transactions type='earned_achievement'   │
│    └─ SAFE: rewards_claimed flag prevents re-claim             │
│                                                                 │
│ 3. General Award (award_ml_coins function)                     │
│    └─ Called by: backend service for exercise completion       │
│    └─ Amount: variable (with rank multiplier)                  │
│    └─ Multiplier: 1.00x to 2.00x based on rank                 │
│    └─ Audit: ml_coins_transactions type='earned_xp'            │
│    └─ SAFE: Each call is independent, multiplier correct       │
│                                                                 │
│ 4. Bonus Coins (from backend service)                          │
│    └─ Called by: teacher or admin award                        │
│    └─ Amount: specified by grantor                             │
│    └─ Audit: ml_coins_transactions type='earned_bonus'         │
│    └─ SAFE: Direct insert, no duplication vector               │
│                                                                 │
│ 5. Shop Purchase (shop.service.ts)                             │
│    └─ Called by: user clicks "Comprar"                         │
│    └─ Amount: deducted (negative)                              │
│    └─ Audit: ml_coins_transactions type='shop_purchase'        │
│    └─ SAFE: Balance checked before deduction                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

POTENTIAL COLLISION POINTS:
  • Path 1 + Path 3: If both award_ml_coins and promote_to_next_rank
                     called for same event (rank achievement bonus)
  • Path 1 × 2: If promote_to_next_rank called twice (retry/race)
  • Path 2 × 2: If claim_achievement_reward called twice (prevented by flag)
```

## 6. LOCK MECHANISM (Race Condition Prevention)

```
promote_to_next_rank() execution:

1. SELECT ml_coins INTO v_current_balance
   FROM user_stats
   WHERE user_id = p_user_id
   FOR UPDATE;  ← EXCLUSIVE LOCK acquired on user_stats row

2. [No other process can UPDATE or SELECT...FOR UPDATE on this row]

3. v_new_balance := v_current_balance + v_ml_coins_bonus;

4. UPDATE user_stats SET ml_coins = v_new_balance
   WHERE user_id = p_user_id;  ← Lock held until transaction commits

5. Lock released when transaction commits

CONCLUSION: ✅ Row lock prevents concurrent modifications
            ⚠️ Does NOT prevent sequential duplicate calls
               (same function called twice from application = race not relevant)
```

---

**Summary:** Database layer uses proper locking, but rely on application to call functions once per event. The +1100 jump indicates application-layer duplicate execution, not database race condition.
