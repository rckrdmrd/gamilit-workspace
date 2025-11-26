# RESUMEN VISUAL - FLUJOS DE ACTUALIZACIÓN DE DATOS

## DIAGRAMA 1: ARQUITECTURA DE ACTUALIZACIÓN POR ACCIÓN

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PORTAL DE ESTUDIANTES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ExercisePage          ShopPage         MissionsPage  ProfilePage   │
│  ├─ Enviar respuestas  ├─ Comprar item  ├─ Completar ├─ Editar     │
│  └─ Usar hints         └─ Usar monedas  │   objetivo │   perfil    │
│                                         └─ Reclamar   │             │
│                                            recompensa │             │
│  │                      │                 │           │             │
│  └──────────────────────┴─────────────────┴───────────┴─────────────┘
│                          │
│                 ┌────────▼────────────┐
│                 │  API GATEWAY        │
│                 │  /api/v1/...        │
│                 └────────┬────────────┘
│                          │
└──────────────────────────┼──────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────────────────────┐
│                          ▼                                            │
│          ┌──────────────────────────────┐                            │
│          │  BACKEND SERVICES (NestJS)   │                            │
│          ├──────────────────────────────┤                            │
│          │ ExerciseAttemptService       │                            │
│          │ MissionsService              │                            │
│          │ MLCoinsService               │                            │
│          │ UserStatsService             │                            │
│          └──────────────────────────────┘                            │
│                    │                                                  │
│                    ▼                                                  │
│          ┌──────────────────────────────┐                            │
│          │  PostgreSQL DATABASE         │                            │
│          │  (7 TABLAS + TRIGGERS)       │                            │
│          └──────────────────────────────┘                            │
└──────────────────────────────────────────────────────────────────────┘
```

## DIAGRAMA 2: FLUJO COMPLETO DE ENVÍO DE EJERCICIO

```
TIMELINE: T0 → T6 (típicamente < 200ms)

T0: USUARIO ENVÍA
┌─────────────────────────────┐
│ Frontend: ExercisePage      │
│ handleSubmit()              │
│ ├─ answers: {...}           │
│ ├─ hintsUsed: 2             │
│ └─ startedAt: timestamp     │
└────────────┬────────────────┘
             │
             ▼
T1: API CALL
┌─────────────────────────────┐
│ POST /exercises/:id/submit  │
│ Content-Type: application/json
└────────────┬────────────────┘
             │
             ▼
T2: BACKEND PROCESA
┌──────────────────────────────────┐
│ ExerciseAttemptService           │
│ ├─ submitAttempt()               │
│ ├─ calculateScore()              │
│ │  └─ validate_and_audit() (SQL) │
│ ├─ calculateXpReward()           │
│ └─ calculateCoinsReward()        │
└────────────┬─────────────────────┘
             │
             ▼
T3: OTORGA RECOMPENSAS
┌──────────────────────────────────┐
│ awardRewards()                   │
│ ├─ mlCoinsService.addCoins()     │
│ │  └─► user_stats.ml_coins += 8  │
│ ├─ userStatsService.addXp()      │
│ │  └─► user_stats.total_xp += 65 │
│ └─ TRIGGER: check_rank_promotion │
│    └─► Si 3000 XP: promote rank  │
└────────────┬─────────────────────┘
             │
             ▼
T4: ACTUALIZA PROGRESO
┌──────────────────────────────────┐
│ updateModuleProgressAfterCompletion()
│ ├─ completed_exercises: 2/5 (40%)│
│ ├─ status: in_progress           │
│ └─ last_accessed_at: NOW()       │
└────────────┬─────────────────────┘
             │
             ▼
T5: ACTUALIZA MISIONES
┌──────────────────────────────────┐
│ updateMissionsProgress()          │
│ ├─ daily_missions[0].progress++   │
│ │  └─ objectives[0].current=2/3   │
│ └─ Si objetivo=target: COMPLETED  │
└────────────┬─────────────────────┘
             │
             ▼
T6: RETORNA RESULTADO
┌──────────────────────────────────┐
│ Frontend recibe response:        │
│ {                                │
│   score: 85,                     │
│   xpEarned: 65,                  │
│   mlCoinsEarned: 8,              │
│   rankUp: null,                  │
│   feedback: "Great job!"         │
│ }                                │
│                                  │
│ ├─► showFeedbackModal()          │
│ ├─► confetti animation           │
│ └─► navigate to next exercise    │
└──────────────────────────────────┘
```

## DIAGRAMA 3: DEPENDENCIAS DE TABLAS

```
exercise_attempts (ENTRADA)
│
├─► exercise_validation_audit (AUDITORÍA)
│
├─► user_stats (GAMIFICACIÓN PRINCIPAL)
│   │
│   ├─► user_ranks (TRIGGER: promoción)
│   │
│   ├─► ml_coins_transactions (AUDITORÍA ECONÓMICA)
│   │
│   └─► leaderboards (VIEW: nightly rebuild)
│
├─► module_progress (PROGRESO EDUCATIVO)
│
└─► missions (ACTUALIZAR PROGRESO)
```

## DIAGRAMA 4: DATOS GUARDADOS POR PÁGINA

```
┌──────────────────────────────────────────────────────────────────┐
│ EXERCISE PAGE (/exercise/:exerciseId)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ACCIONES:                          DATOS GUARDADOS:              │
│ ├─ Enviar respuestas               ├─ exercise_attempts (nuevo)  │
│ │  └─ calcScore + otorgar rewards  ├─ user_stats (+XP/coins)     │
│ ├─ Usar hint                       ├─ ml_coins_transactions      │
│ │  └─ gastar monedas               ├─ module_progress (progreso) │
│ ├─ Completar ejercicio             ├─ missions (objectives++)    │
│ │  └─ actualizar todos los stats   └─ user_ranks (si asciende)  │
│ └─ Auto-save (cada 30s)                                          │
│    └─ localStorage only (NO BD)                                  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ DASHBOARD PAGE (/)                                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ACCIONES:             DATOS GUARDADOS:                            │
│ ├─ Ver progreso       ├─ user_stats.last_activity_at (TRIGGER)   │
│ ├─ Ver módulos        ├─ user_stats.last_login_at (si aplica)    │
│ └─ Ver misiones       └─ LECTURA ONLY - sin actualizaciones       │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ SHOP PAGE (/shop)                                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ACCIONES:               DATOS GUARDADOS:                          │
│ ├─ Comprar power-up     ├─ user_stats.ml_coins (-amount)          │
│ │  └─ validar balance   ├─ user_stats.ml_coins_spent_total        │
│ ├─ Usar item            ├─ ml_coins_transactions (negativo)       │
│ │  └─ actualizar inv.   └─ comodines_inventory (nueva fila)       │
│ └─ Ver inventario                                                 │
│    └─ LECTURA ONLY                                                │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ PROFILE PAGE (/profile)                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ACCIONES:                 DATOS GUARDADOS:                        │
│ ├─ Editar perfil         ├─ auth_management.profiles (update)     │
│ │  ├─ display_name       │  ├─ display_name                      │
│ │  ├─ bio                │  ├─ bio                                │
│ │  ├─ avatar             │  ├─ avatar_url                         │
│ │  └─ location           │  └─ metadata (custom data)             │
│ └─ Ver logros                                                     │
│    └─ LECTURA ONLY                                                │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ MISSIONS PAGE (/missions)                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ACCIONES:                      DATOS GUARDADOS:                   │
│ ├─ Ver misiones activas        ├─ missions.progress (TRIGGER)    │
│ ├─ Completar objetivo          ├─ missions.objectives[].current   │
│ │  └─ auto-update (TRIGGER)    ├─ missions.status (si complete)  │
│ ├─ Reclamar recompensa         ├─ user_stats (+XP/coins)         │
│ │  └─ manual claim action      └─ ml_coins_transactions          │
│ └─ Ver historial                                                  │
│    └─ LECTURA ONLY                                                │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

## DIAGRAMA 5: CAMPOS MODIFICABLES POR ACCIÓN

```
EJERCICIO COMPLETADO (¡MÁS ACUALIZACIONES!)
┌─────────────────────────────────────────┐
│ exercise_attempts                        │
├─────────────────────────────────────────┤
│ ✓ submitted_answers (JSONB)             │
│ ✓ is_correct (BOOLEAN)                  │
│ ✓ score (INTEGER)                       │
│ ✓ time_spent_seconds (INTEGER)          │
│ ✓ hints_used (INTEGER)                  │
│ ✓ xp_earned (INTEGER)                   │
│ ✓ ml_coins_earned (INTEGER)             │
│ ✓ attempt_number (INTEGER, auto)        │
└─────────────────────────────────────────┘

PERFIL EDITADO
┌─────────────────────────────────────────┐
│ auth_management.profiles                │
├─────────────────────────────────────────┤
│ ✓ display_name (VARCHAR)                │
│ ✓ bio (TEXT)                            │
│ ✓ avatar_url (VARCHAR)                  │
│ ✓ location (VARCHAR)                    │
│ ✓ notification_preferences (JSONB)      │
│ ✓ metadata (JSONB)                      │
│ ✓ updated_at (TIMESTAMP, auto)          │
└─────────────────────────────────────────┘

MONEDAS GANADAS (SIMPLE)
┌─────────────────────────────────────────┐
│ user_stats                              │
├─────────────────────────────────────────┤
│ ✓ ml_coins (+8)                         │
│ ✓ ml_coins_earned_total (+8)            │
│ ✓ updated_at (TIMESTAMP, auto)          │
└─────────────────────────────────────────┘

XP GANADO (COMPLEJO - TRIGGERS!)
┌─────────────────────────────────────────┐
│ user_stats                              │
├─────────────────────────────────────────┤
│ ✓ total_xp (+65)                        │
│ └─► TRIGGER: trg_check_rank_promotion   │
│     ├─ Recalcula level                  │
│     ├─ Promueve rank si aplica          │
│     └─ Otorga bonuses                   │
│ ✓ exercises_completed (+1)              │
│ ✓ perfect_scores (+1 si score=100)      │
│ ✓ sessions_count (auto, si nuevo día)   │
└─────────────────────────────────────────┘
```

## DIAGRAMA 6: FLUJO DE MONEDAS

```
GANA MONEDAS (Ejercicio)
┌─────────────┐
│ +8 ML Coins │
└──────┬──────┘
       │
       ▼
  ┌─────────────────────────────┐
  │ addCoins()                  │
  │ ├─ Validar monto > 0        │
  │ └─ Calcular: finalAmount    │
  │    = (8 * multiplier) = 8   │
  └──────────┬──────────────────┘
             │
             ├──────────────────────┬──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌──────────────┐    ┌───────────────┐    ┌──────────────────────┐
      │ user_stats   │    │ transactions  │    │ earned_today reset   │
      ├──────────────┤    ├───────────────┤    ├──────────────────────┤
      │ ml_coins +=8 │    │ INSERT new    │    │ Si ya pasó medianoche│
      │ ml_coins_    │    │ ├─ amount: 8  │    │ → earned_today = 0   │
      │ earned_total │    │ ├─ type:      │    │ → earned_today += 8  │
      │ += 8         │    │ │  EARNED_EX. │    └──────────────────────┘
      │ ml_coins_    │    │ ├─ reference: │
      │ earned_today │    │ │  exercise   │
      │ += 8         │    │ └─ balance:   │
      │              │    │   before/after
      │ updated_at = │    │              │
      │ NOW()        │    │              │
      └──────────────┘    └───────────────┘

GASTA MONEDAS (Shop)
┌─────────────┐
│ -50 ML Coins│
└──────┬──────┘
       │
       ▼
  ┌──────────────────────────────┐
  │ spendCoins()                 │
  │ ├─ Validar balance >= 50     │
  │ ├─ Validar monto > 0         │
  │ └─ Si OK: proceder           │
  └──────────┬───────────────────┘
             │
             ├────────────────┬──────────────────────────┐
             │                │                          │
             ▼                ▼                          ▼
      ┌──────────────┐  ┌──────────────┐    ┌─────────────────────┐
      │ user_stats   │  │ transactions │    │ comodines_inventory │
      ├──────────────┤  ├──────────────┤    ├─────────────────────┤
      │ ml_coins     │  │ INSERT new   │    │ user_id: UUID       │
      │ -= 50        │  │ ├─ amount: -50   │ comodin_id: UUID    │
      │ ml_coins_    │  │ ├─ type:     │    │ quantity: 1         │
      │ spent_total  │  │ │  SPENT_SHOP│    │ unlocked_at: NOW()  │
      │ += 50        │  │ ├─ reference:    │ last_used_at: NULL  │
      │              │  │ │  shop_item │    └─────────────────────┘
      │ updated_at = │  │ └─ balance:  │
      │ NOW()        │  │   before/after
      └──────────────┘  └──────────────┘
```

## DIAGRAMA 7: AUTO-ACTUALIZACIONES (Triggers)

```
TRIGGER #1: Rank Promotion on XP Gain
┌──────────────────────────────────────────────────────────────┐
│ AFTER UPDATE ON user_stats.total_xp                         │
├──────────────────────────────────────────────────────────────┤
│ IF NEW.total_xp >= rank_threshold:                          │
│   ├─ CALL promote_to_next_rank()                           │
│   │  ├─ current_rank: Ajaw → Nacom                         │
│   │  ├─ rank_progress: 0                                   │
│   │  ├─ bonus: +50 ML Coins                                │
│   │  └─ unlock_features: []                                │
│   └─ INSERT user_ranks (histórico)                         │
│                                                             │
│ IF total_xp alcanzó achievement threshold:                 │
│   └─ CALL check_and_award_achievements()                  │
│      └─ achievements_earned += 1                           │
│                                                             │
│ UPDATE updated_at = NOW()                                  │
└──────────────────────────────────────────────────────────────┘

TRIGGER #2: Module Progress Update
┌──────────────────────────────────────────────────────────────┐
│ AFTER INSERT/UPDATE ON exercise_attempts                    │
├──────────────────────────────────────────────────────────────┤
│ IF is_correct = true:                                       │
│   ├─ COUNT distinct completed exercises in module          │
│   ├─ CALCULATE progress_percentage = completed/total*100   │
│   ├─ UPSERT module_progress                               │
│   │  ├─ completed_exercises: new count                     │
│   │  ├─ progress_percentage: new %                         │
│   │  ├─ last_accessed_at: NOW()                           │
│   │  └─ IF progress = 100%: completed_at = NOW()          │
│   └─ UPDATE status based on percentage                     │
│                                                             │
│ ALWAYS:                                                     │
│   └─ UPDATE updated_at = NOW()                             │
└──────────────────────────────────────────────────────────────┘

TRIGGER #3: Mission Progress Update
┌──────────────────────────────────────────────────────────────┐
│ AFTER INSERT ON exercise_attempts (in updateMissionsProgress)
├──────────────────────────────────────────────────────────────┤
│ FOR EACH mission of user WHERE status='active':             │
│   ├─ FIND objectives with type='complete_exercises'        │
│   ├─ INCREMENT objectives[].current += 1                   │
│   ├─ IF current >= target:                                │
│   │  └─ UPDATE status = 'completed'                        │
│   └─ CALCULATE progress = sum(current/target)*100          │
│                                                             │
│ UPDATE missions.updated_at = NOW()                         │
└──────────────────────────────────────────────────────────────┘
```

---

## TABLA RESUMEN: CAMPOS ACTUALIZABLES

```
╔════════════════════════════════════════════════════════════════════╗
║ TABLA                    │ CAMPOS                  │ ACTUALIZACIÓN ║
╠════════════════════════════════════════════════════════════════════╣
║ exercise_attempts        │ score, xp_earned        │ INSERT NUEVO  ║
║                          │ ml_coins_earned, ...    │              ║
╠════════════════════════════════════════════════════════════════════╣
║ user_stats               │ total_xp, ml_coins      │ UPDATE x5-8   ║
║                          │ level, rank, counters   │              ║
╠════════════════════════════════════════════════════════════════════╣
║ module_progress          │ progress_%, completed   │ UPSERT 1x mod ║
║                          │ total_xp_earned         │              ║
╠════════════════════════════════════════════════════════════════════╣
║ missions                 │ objectives[].current    │ UPDATE DINÁM. ║
║                          │ progress, status        │              ║
╠════════════════════════════════════════════════════════════════════╣
║ user_ranks               │ rank_name, unlock_date  │ INSERT 1x ran ║
║                          │ bonus_ml_coins          │              ║
╠════════════════════════════════════════════════════════════════════╣
║ ml_coins_transactions    │ amount, balance_after   │ INSERT AUDITORÍA
║                          │ transaction_type        │              ║
╠════════════════════════════════════════════════════════════════════╣
║ auth_management.profiles │ display_name, bio       │ UPDATE MANUAL ║
║                          │ avatar_url, metadata    │              ║
╚════════════════════════════════════════════════════════════════════╝
```

