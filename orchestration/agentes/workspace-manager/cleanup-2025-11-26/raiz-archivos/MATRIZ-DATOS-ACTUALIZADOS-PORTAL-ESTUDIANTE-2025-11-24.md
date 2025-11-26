# MATRIZ DE DATOS ACTUALIZADOS POR PORTAL ESTUDIANTE
**Generado:** 2025-11-24 | **Codebase:** GAMILIT V6.1

---

## RESUMEN EJECUTIVO

El portal de estudiantes actualiza **7 tablas principales** a través de **5 flujos de negocio** clave:

| Tabla Afectada | Acción Disparadora | Frecuencia | Campos Críticos |
|---|---|---|---|
| `exercise_attempts` | Envío de ejercicio | Por intento | score, is_correct, xp_earned, ml_coins_earned |
| `exercise_submissions` | Envío de ejercicio (revisión manual) | Una sola vez | answer_data, status, feedback |
| `module_progress` | Completar ejercicio correctamente | Por módulo | progress_percentage, completed_exercises, total_xp_earned |
| `user_stats` | Cualquier actividad gamificada | Por acción | total_xp, ml_coins, level, current_rank |
| `ml_coins_transactions` | Ganar/gastar monedas | Por transacción | amount, transaction_type, balance_before, balance_after |
| `missions` | Completar ejercicio/racha | Dinámico | progress, status, objectives[].current |
| `user_ranks` | Alcanzar umbral XP | Automático (trigger) | rank_progress, unlock_date |

---

## 1. FLUJO: ENVÍO DE EJERCICIO

### 1.1 Acción del Estudiante
- **Dónde:** `/exercise/:exerciseId` (ExercisePage.tsx)
- **Botón:** "Enviar Respuestas"
- **Datos enviados:** answers, startedAt, hintsUsed, powerupsUsed

### 1.2 API Call
```typescript
// apps/frontend/src/services/api/educationalAPI.ts:478
submitExercise(exerciseId, {
  answers: userAnswers,
  startedAt: startTime.getTime(),
  hintsUsed: progress.hintsUsed || 0,
  powerupsUsed: progress.powerupsUsed || [],
})
```

### 1.3 Backend Processing
**Service:** ExerciseAttemptService (para ejercicios autocorregibles)
**Endpoint:** POST /api/v1/educational/exercises/:id/submit

#### Tablas Actualizadas:

**1. exercise_attempts** (TABLA PRIMARY)
```
ACCIÓN: INSERT + UPDATE
FRECUENCIA: Cada intento (múltiples permitidos)

CAMPOS ACTUALIZADOS:
├── submitted_answers: JSONB (respuestas del usuario)
├── is_correct: BOOLEAN (autocorregido)
├── score: INTEGER (0-100)
├── time_spent_seconds: INTEGER (tiempo en ejercicio)
├── hints_used: INTEGER (contador de pistas)
├── comodines_used: JSONB array (['power_up_name'])
├── xp_earned: INTEGER (calculado por calculateXpReward)
├── ml_coins_earned: INTEGER (calculado por calculateCoinsReward)
├── attempt_number: INTEGER (auto-incrementado)
├── submitted_at: TIMESTAMP (NOW())
└── metadata: JSONB (browser, device_type, response_pattern)

FÓRMULAS:
XP = MAX(0, score - (hints_used * 10))
ML_COINS = MAX(0, FLOOR(score/10) - (comodines_used.length * 2))
```

**2. user_stats** (TABLA GAMIFICACIÓN)
```
ACCIÓN: UPDATE (vía awardRewards en ExerciseAttemptService)
FRECUENCIA: Solo si is_correct = true

CAMPOS ACTUALIZADOS:
├── total_xp: += xp_earned (trigger automático)
├── ml_coins: += ml_coins_earned (si xp > 0)
├── level: RECALCULADO automáticamente por trigger
├── current_rank: PROMOVIDO si alcanza umbral (trigger)
├── exercises_completed: += 1
├── perfect_scores: += 1 (si score = 100 y no hints)
└── updated_at: NOW()

TRIGGERS:
├── trg_check_rank_promotion_on_xp_gain (AFTER UPDATE total_xp)
│   └─► check_and_award_achievements()
│   └─► promote_to_next_rank() si aplica
└── trg_update_user_stats_on_exercise (AFTER INSERT en exercise_attempts)
    └─► Actualiza counters
```

**3. ml_coins_transactions** (TABLA AUDITORÍA ECONÓMICA)
```
ACCIÓN: INSERT (crear transacción de auditoría)
FRECUENCIA: 1 por cada ejercicio correcto

CAMPOS REGISTRADOS:
├── amount: INTEGER (positivo si gana, negativo si gasta)
├── transaction_type: ENUM ('EARNED_EXERCISE', 'SPENT_HINT', etc)
├── balance_before: INTEGER (balance anterior)
├── balance_after: INTEGER (balance nuevo)
├── description: VARCHAR ('Exercise completed: {exercise_id}')
├── reference_id: UUID (exercise_id)
├── reference_type: ENUM ('exercise')
├── multiplier: NUMERIC (1.0 por defecto)
└── metadata: JSONB ({})
```

**4. module_progress** (TABLA PROGRESO)
```
ACCIÓN: INSERT/UPDATE (UPSERT)
FRECUENCIA: Una vez por módulo (cuando 1er ejercicio completado)

CAMPOS ACTUALIZADOS:
├── status: ENUM ('not_started' → 'in_progress' → 'completed')
├── progress_percentage: INTEGER (ROUND((completed/total)*100))
├── completed_exercises: INTEGER (COUNT DISTINCT de ejercicios correctos)
├── total_exercises: INTEGER (STATIC - ejercicios activos del módulo)
├── total_xp_earned: += xp_earned_in_module
├── total_ml_coins_earned: += ml_coins_earned
├── last_accessed_at: NOW()
└── completed_at: NOW() (si progress = 100%)

LÓGICA:
├─ Si es PRIMER intento correcto en este ejercicio:
│  └─► actualizar completed_exercises y porcentaje
├─ Si NO es el primero (reintentos):
│  └─► solo actualizar last_accessed_at
└─ Si progress >= 100%:
   └─► status = 'completed', completed_at = NOW()
```

---

## 2. FLUJO: AUTO-CORRECCIÓN Y VALIDACIÓN

### 2.1 Validación SQL
**Función PostgreSQL:** `educational_content.validate_and_audit()`
- **Ubicación:** apps/database/ddl/schemas/educational_content/functions/
- **Ejecuta:** Validación centralizada de respuestas
- **Retorna:** score, is_correct, feedback, audit_id

### 2.2 Auditoría de Validación
**Tabla:** `educational_content.exercise_validation_audit`
```
INSERTS automático durante validate_and_audit()

CAMPOS REGISTRADOS:
├── exercise_id: UUID
├── user_id: UUID
├── submitted_answer: JSONB (respuestas enviadas)
├── is_correct: BOOLEAN
├── score: INTEGER
├── feedback: TEXT
├── attempt_number: INTEGER
├── client_metadata: JSONB (IP, user-agent, etc)
└── audit_id: UUID (referenciado en exercise_submissions)
```

---

## 3. FLUJO: MISIONES GAMIFICADAS

### 3.1 Acción Disparadora
**Condición:** Completar ejercicio correctamente
**Service:** MissionsService.updateProgress()

### 3.2 Tabla: missions

```
ACCIÓN: UPDATE (progreso de objectives)
FRECUENCIA: Cada ejercicio correcto si hay misión activa

CAMPOS ACTUALIZADOS:
├── objectives[].current: += 1 (para 'complete_exercises')
├── progress: RECALCULADO (% basado en objectives)
├── status: ENUM ('active' → 'in_progress' → 'completed')
└── updated_at: NOW()

TIPOS DE OBJETIVOS:
├── complete_exercises: target=3, se incrementa cada ejercicio
├── correct_streak: target=2+, se incrementa con series de aciertos
├── study_time: target=15 min, se incrementa con time_spent
└── (custom objectives definidas en mission.objectives[])

RECOMPENSAS (al completar misión):
├── ml_coins: +25 (misión diaria) a +150 (especial)
├── xp: +30 a +100
└── status → 'completed' → recompensas claimables
```

### 3.3 Tabla: user_stats (recompensas misiones)
```
ACCIÓN: UPDATE (cuando usuario reclama recompensa)
FRECUENCIA: Manual (usuario debe hacer click en "Claim Reward")

CAMPOS:
├── ml_coins: += mission.rewards.ml_coins
├── total_xp: += mission.rewards.xp
└── updated_at: NOW()
```

---

## 4. FLUJO: SISTEMA DE RANGOS MAYA

### 4.1 Trigger Automático
**SQL Trigger:** `trg_check_rank_promotion_on_xp_gain`
**Se ejecuta:** AFTER UPDATE en `user_stats.total_xp`

### 4.2 Promoción de Rango
**Función:** `check_and_award_achievements()`

```
LÓGICA DE PROMOCIÓN:
XP_THRESHOLD = {
  'Ajaw': 0,
  'Nacom': 1000,
  'Ah K\'in': 3000,
  'Halach Uinic': 6500,
  'K\'uk\'ulkan': 11500
}

SI total_xp >= threshold_siguiente_rango:
├── promote_to_next_rank()
├── UPDATE user_stats SET:
│   ├── current_rank = SIGUIENTE
│   ├── rank_progress = 0
│   └── updated_at = NOW()
└── INSERT user_ranks (histórico)
```

### 4.3 Tabla: user_ranks
```
ACCIÓN: INSERT (crear registro histórico)
FRECUENCIA: 1 sola vez por rango (5 promociones máximo)

CAMPOS REGISTRADOS:
├── user_id: UUID
├── rank_name: ENUM (Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan)
├── rank_number: INTEGER (1-5)
├── unlock_date: TIMESTAMP (cuando alcanzó)
├── xp_at_promotion: INTEGER (XP total en momento de promoción)
├── bonus_ml_coins: INTEGER (+50 bonus al promover)
└── metadata: JSONB ({unlock_features: []})
```

---

## 5. FLUJO: PERFIL DE USUARIO

### 5.1 Acción: Actualizar Perfil
**Página:** SettingsPage, EnhancedProfilePage
**Campos editables:**
- avatar, display_name, bio, location
- notification_preferences
- privacy_settings

### 5.2 Tabla: auth_management.profiles

```
ACCIÓN: UPDATE
FRECUENCIA: Manual (cuando usuario edita)

CAMPOS ACTUALIZADOS:
├── display_name: VARCHAR
├── bio: TEXT
├── avatar_url: VARCHAR
├── location: VARCHAR
├── notification_preferences: JSONB ({
│   email_notifications: boolean,
│   push_notifications: boolean,
│   daily_digest: boolean
│ })
├── privacy_settings: JSONB ({
│   show_in_leaderboard: boolean,
│   allow_friend_requests: boolean,
│   show_progress: boolean
│ })
├── metadata: JSONB (datos custom)
└── updated_at: NOW()
```

---

## 6. FLUJO: GASTAR MONEDAS (SHOP)

### 6.1 Acción: Comprar Item
**Página:** ShopPage
**Item types:** power_ups, inventory_items, cosmetics

### 6.2 Tablas Actualizadas:

**1. user_stats (balance)**
```
ACCIÓN: UPDATE
CAMPOS:
├── ml_coins: -= purchase_amount
└── ml_coins_spent_total: += purchase_amount
```

**2. ml_coins_transactions (auditoría)**
```
ACCIÓN: INSERT
CAMPOS:
├── amount: NEGATIVE (p.ej., -50)
├── transaction_type: 'SPENT_SHOP'
├── reference_id: item_id
├── reference_type: 'shop_item'
├── description: 'Purchased: Power-up de Visión'
└── balance_before/after: REGISTRADO
```

**3. comodines_inventory (inventario)**
```
ACCIÓN: INSERT/UPDATE
CAMPOS:
├── user_id: UUID
├── comodin_id: UUID
├── quantity: += 1
├── unlocked_at: NOW()
└── last_used_at: NULL
```

---

## 7. MATRIZ RESUMEN: FRECUENCIA DE ACTUALIZACIONES

```
┌─────────────────────────────────────────────────────────────────┐
│ TABLA                        │ CUÁNDO           │ CUÁNTO CAMBIA  │
├─────────────────────────────────────────────────────────────────┤
│ exercise_attempts            │ Cada intento     │ 100% (nuevo)   │
│ exercise_submissions         │ Una sola vez     │ 100% (nuevo)   │
│ module_progress              │ 1er ejercicio OK │ 30% campos     │
│ user_stats                   │ Ejercicio OK     │ 5-8 campos     │
│ ml_coins_transactions        │ Cambios monedas  │ 100% (nuevo)   │
│ missions                     │ Cada ejercicio   │ 2-3 campos     │
│ user_ranks                   │ Rango nuevo      │ 100% (nuevo)   │
│ comodines_inventory          │ Compra/uso       │ Var. cantidad  │
│ leaderboards (cached)        │ Nightly rebuild  │ Recalculado    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. FLUJO POR PÁGINA DEL PORTAL

### 8.1 DashboardComplete.tsx
```
Acciones: Ver progreso, estadísticas

ACTUALIZA:
├─ last_activity_at (user_stats) - TRIGGER
├─ last_login_at (user_stats) - Si primer acceso del día
└─ LECTURA de: user_stats, module_progress, missions
```

### 8.2 ExercisePage.tsx
```
Acciones: Completar ejercicio, usar hints, guardar progreso

ACTUALIZA (submitExercise):
├─ exercise_attempts - NUEVO RECORD
├─ user_stats - XP, ML Coins, counters
├─ module_progress - progress_percentage
├─ ml_coins_transactions - Auditoría
├─ missions - progress si aplica
└─ user_ranks - Si rango nuevo (VÍA TRIGGER)

ACTUALIZA (saveExerciseProgress - auto cada 30s):
├─ localStorage (frontend only)
└─ NO toca base de datos actualmente
```

### 8.3 ShopPage.tsx
```
Acciones: Comprar power-ups, items

ACTUALIZA:
├─ user_stats (ml_coins balance)
├─ ml_coins_transactions (registro)
└─ comodines_inventory (nuevo item)
```

### 8.4 ProfilePage / EnhancedProfilePage.tsx
```
Acciones: Editar perfil, cambiar avatar

ACTUALIZA:
├─ auth_management.profiles (display_name, bio, etc)
└─ metadata (custom fields)
```

### 8.5 MissionsPage.tsx
```
Acciones: Ver misiones, completar objetivo, reclamar recompensa

ACTUALIZA (auto):
├─ missions (objectives[].current) - Después de ejercicio
└─ missions.status - A 'completed' cuando objetivo=target

ACTUALIZA (manual - claim):
├─ user_stats (ml_coins, total_xp)
├─ missions.status → 'claimed'
└─ ml_coins_transactions (auditoría)
```

### 8.6 LeaderboardPage.tsx
```
Acciones: Ver rankings

LECTURA ONLY (sin actualizaciones):
├─ user_stats (global_rank_position, ml_coins, level)
├─ user_ranks (historial de rangos)
└─ Materializado views (nightly update)
```

---

## 9. JERARQUÍA DE DEPENDENCIAS

```
PRINCIPAL:
└─ exercise_attempts (INSERT)
   ├─► calculateScore() ─► validate_and_audit() ─► exercise_validation_audit (INSERT)
   ├─► calculateXpReward() ─► awardRewards()
   │   ├─► user_stats (UPDATE total_xp)
   │   │   └─► trg_check_rank_promotion_on_xp_gain (TRIGGER)
   │   │       ├─► promote_to_next_rank()
   │   │       └─► user_ranks (INSERT)
   │   └─► ml_coins_transactions (INSERT)
   ├─► updateModuleProgressAfterCompletion()
   │   └─► module_progress (UPSERT)
   └─► updateMissionsProgress()
       └─► missions (UPDATE progress)
```

---

## 10. CAMPOS CON AUTO-ACTUALIZACIÓN (Triggers/Funciones)

```
FIELD                          │ ACTUALIZADO POR              │ CUÁNDO
───────────────────────────────┼──────────────────────────────┼─────────────────
user_stats.level               │ CHECK (total_xp vs threshold)│ AFTER addXp()
user_stats.current_rank        │ promote_to_next_rank()       │ Si total_xp ↑
user_stats.rank_progress       │ calculate_rank_progress()    │ AFTER rank change
module_progress.progress_%    │ UPSERT logic en Backend      │ AFTER ejercicio ✓
updated_at (todas las tablas)  │ DEFAULT gamilit.now_mexico() │ AUTO en UPDATE
created_at (todas las tablas)  │ DEFAULT gamilit.now_mexico() │ AUTO en INSERT
```

---

## 11. VALIDACIONES Y RESTRICCIONES

```
CONSTRAINT                              │ TABLA              │ CONDICIÓN
────────────────────────────────────────┼────────────────────┼─────────────────
exercise_attempts_attempt_number_check  │ exercise_attempts  │ attempt_number > 0
exercise_attempts_score_check           │ exercise_attempts  │ score >= 0
user_stats_level_check                  │ user_stats         │ level > 0
user_stats_ml_coins_check               │ user_stats         │ ml_coins >= 0
user_stats_rank_progress_check          │ user_stats         │ rank_progress 0-100
module_progress_percentage_check        │ module_progress    │ 0 <= % <= 100
```

---

## 12. EJEMPLO COMPLETO: FLUJO DE EJERCICIO

```
SECUENCIA TEMPORAL:

T0: Usuario envía ejercicio con respuestas
├─ ExercisePage.handleSubmit() → submitExercise(exerciseId, {answers, ...})
└─ API POST /api/v1/educational/exercises/{id}/submit

T1: Backend recibe y valida
├─ ExerciseAttemptService.submitAttempt()
├─ ExerciseAnswerValidator.validate() ✓
└─ calculateScore() ──► validate_and_audit() (SQL)
   └─ INSERT exercise_validation_audit

T2: Calcula recompensas
├─ score = 85
├─ xpEarned = 85 - (2 hints * 10) = 65 XP
├─ mlCoinsEarned = FLOOR(85/10) - (0 comodines * 2) = 8 coins
└─ is_correct = true

T3: Otorga recompensas
├─ INSERT exercise_attempts {score: 85, xp_earned: 65, ml_coins_earned: 8, is_correct: true}
├─ UPDATE user_stats SET total_xp += 65 (trigger on update)
│  └─ TRIGGER: check_and_award_achievements()
│     └─ Si total_xp = 3000: promote a "Ah K'in" (INSERT user_ranks)
├─ UPDATE user_stats SET ml_coins += 8
└─ INSERT ml_coins_transactions {amount: 8, type: 'EARNED_EXERCISE', ...}

T4: Actualiza progreso de módulo
├─ GET ejercicios_correctos en módulo = 2 (incluye este)
├─ GET total_ejercicios en módulo = 5
├─ UPSERT module_progress {
│  │  completed_exercises: 2,
│  │  progress_percentage: 40,
│  │  total_xp_earned: (prev + 65)
│  │  status: 'in_progress'
│  └─}

T5: Actualiza misiones
├─ GET misiones activas = [daily_complete_3, weekly_marathon]
├─ daily_complete_3.objectives[0].current = 1 → 2
├─ Si current >= target: UPDATE status = 'completed'
└─ UPDATE missions.progress = 67% (2/3 ejercicios)

T6: UI Feedback
├─ Mostrar modal con:
│  ├─ "¡Ejercicio Completado!"
│  ├─ "Ganaste 85 puntos"
│  ├─ "Ganaste 65 XP"
│  ├─ "Ganaste 8 ML Coins"
│  └─ [Si rangoup] "¡Ascendiste a Ah K'in!"
└─ Redireccionar a módulo o siguiente ejercicio
```

---

## 13. DIFERENCIAS: EJERCICIOS AUTOCORREGIBLES vs REVISIÓN MANUAL

```
AUTOCORREGIBLES                    │ REVISIÓN MANUAL (Teacher-Graded)
───────────────────────────────────┼──────────────────────────────────
Tabla: exercise_attempts           │ Tabla: exercise_submissions
Múltiples intentos permitidos       │ Una entrega máxima
Recompensas INMEDIATAS al correcta │ Recompensas al recibir calificación
Scoring automático (SQL)           │ Scoring manual (teacher)
Estado: submitted → graded         │ Estado: submitted → graded → reviewed
FE Flow: ExercisePage inline       │ FE Flow: submission modal + pendiente
```

---

## 14. IMPACTO EN PERFORMANCE

```
OPERACIÓN                          │ COMPLEJIDAD │ IMPACTO
───────────────────────────────────┼─────────────┼──────────────────
INSERT exercise_attempts           │ O(1)        │ 1 row
validate_and_audit() SQL           │ O(n)        │ n = length(answers)
UPDATE user_stats (+XP)            │ O(1)        │ 1 row + trigger
UPSERT module_progress             │ O(1)        │ 1 row
UPDATE missions (progress)         │ O(m)        │ m = active missions
Rank promotion (trigger)           │ O(1)        │ If condition met
Total per submission               │ ~O(n+m)     │ Típicamente < 100ms
```

---

## 15. MONITOREO Y AUDITORÍA

```
AUDITORÍA AUTOMÁTICA:
├─ exercise_validation_audit: Cada respuesta validada
├─ ml_coins_transactions: Cada movimiento económico
├─ created_at/updated_at: Timestamping automático
└─ Log SQL: Todos los cambios de user_stats (replicación)

MÉTRICAS CALCULADAS:
├─ Leaderboards (diario): Rankings de XP, ML Coins, streak
├─ Engagement metrics: ejercicios por día, sessions, time_spent
├─ Retention: last_login_at, days_active_total
└─ Academic: modules_completed, average_score, perfect_scores
```

---

## 16. NOTAS TÉCNICAS IMPORTANTES

### FE-055: Progress Updates con Respuestas Reales
```
ANTES (Incorrecto):
handleProgressUpdate({
  progress: {currentStep, score},
  // ❌ Sin respuestas del usuario
})

DESPUÉS (Correcto - FE-055):
handleProgressUpdate({
  progress: {currentStep, score},
  answers: userAnswers  // ✅ Ahora incluye respuestas
})
```

### FE-059: Auto-Grading Centralizado
```
ANTES: 17 validadores hardcodeados en backend
DESPUÉS: validate_and_audit() centralizado en SQL

VENTAJAS:
├─ Código único para auto-scoring
├─ Auditoría automática para cada intento
├─ Soporte para validadores especiales (Rueda Inferencias)
└─ Performance mejorado (SQL vs TypeScript)
```

### BUG-002: Module Progress Fix
```
PROBLEMA: module_progress no se actualizaba correctamente
SOLUCIÓN: Replicar lógica del trigger en backend service

VERIFICAR:
├─ updateModuleProgressAfterCompletion() en ExerciseAttemptService
└─ updateModuleProgressAfterCompletion() en ExerciseSubmissionService
```

