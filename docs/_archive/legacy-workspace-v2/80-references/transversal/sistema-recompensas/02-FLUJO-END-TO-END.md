# 🔄 FLUJO END-TO-END - SISTEMA DE RECOMPENSAS

**Versión:** v2.8.0
**Fecha:** 2025-11-29

---

## 📊 Diagrama Completo del Flujo

```
┌─────────────┐
│   USUARIO   │
│  (Student)  │
└──────┬──────┘
       │
       │ 1. Ingresa al módulo
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                 │
└──────────────────────────────────────────────────────────────────┘
       │
       │ 2. useModuleDetail(moduleId)
       ▼
   ┌────────────────────────────┐
   │ GET /modules/:id           │
   │ GET /exercises (filtered)  │
   └────────────┬───────────────┘
                │
                │ 3. Renderiza ejercicios
                │    con badge "Completado" si completed=true
                ▼
   ┌────────────────────────────┐
   │ Usuario selecciona         │
   │ ejercicio y lo resuelve    │
   └────────────┬───────────────┘
                │
                │ 4. Click "Enviar Respuesta"
                ▼
┌──────────────────────────────────────────────────────────────────┐
│              POST /exercises/:id/submit                          │
│              Body: { answers, startedAt, hintsUsed, powerups }   │
└──────────────────────────────────────────────────────────────────┘
                │
                │ 5. JWT Auth
                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ExercisesController.submit()                              │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│                           │ 6. Validar ejercicio existe          │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ExerciseSubmissionService.createSubmission()              │ │
│  │    - status: 'submitted'                                   │ │
│  │    - answers, started_at, submitted_at                     │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│                           │ 7. Crear submission                  │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ExerciseAttemptService.createAttempt()                    │ │
│  │    ├─▶ Calcular score (0-100)                              │ │
│  │    ├─▶ Calcular XP (base_xp - penalties)                   │ │
│  │    ├─▶ Calcular ML Coins (base_coins - penalties)          │ │
│  │    │   Penalties:                                          │ │
│  │    │     - Cada hint: -10% XP, -5% coins                   │ │
│  │    │     - Powerup usado: -15% XP, -10% coins              │ │
│  │    │                                                        │ │
│  │    └─▶ INSERT INTO exercise_attempts                       │ │
│  │        (xp_earned, ml_coins_earned, is_correct, score)     │ │
│  └────────────────────────┬───────────────────────────────────┘ │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             │ 8. INSERT dispara trigger
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Trigger: trg_update_user_stats_on_exercise                │ │
│  │  AFTER INSERT ON exercise_attempts                         │ │
│  │  FOR EACH ROW EXECUTE FUNCTION                             │ │
│  │    gamilit.update_user_stats_on_exercise_complete()        │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│                           │ 9. Función trigger se ejecuta        │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  update_user_stats_on_exercise_complete()                  │ │
│  │    ├─▶ Leer NEW.xp_earned                                  │ │
│  │    ├─▶ Leer NEW.ml_coins_earned                            │ │
│  │    ├─▶ Leer NEW.is_correct                                 │ │
│  │    │                                                        │ │
│  │    └─▶ UPDATE gamification_system.user_stats               │ │
│  │        SET total_xp = total_xp + NEW.xp_earned             │ │
│  │        SET ml_coins = ml_coins + NEW.ml_coins_earned       │ │
│  │        SET ml_coins_earned_total += NEW.ml_coins_earned    │ │
│  │        SET exercises_completed += 1                        │ │
│  │        SET last_activity_at = NOW()                        │ │
│  │        WHERE user_id = NEW.user_id                         │ │
│  │                                                             │ │
│  │        -- Si no existe (NOT FOUND):                        │ │
│  │        INSERT INTO user_stats                              │ │
│  │          (user_id, total_xp, ml_coins, ...)                │ │
│  │        VALUES (NEW.user_id, NEW.xp_earned,                 │ │
│  │                100 + NEW.ml_coins_earned, ...)             │ │
│  └────────────────────────┬───────────────────────────────────┘ │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             │ 10. Trigger COMMIT SUCCESS
                             │     (todo en misma transacción)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (Response)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ExercisesController retorna:                              │ │
│  │  {                                                         │ │
│  │    score: 100,                                             │ │
│  │    isPerfect: true,                                        │ │
│  │    rewards: {                                              │ │
│  │      xp: 200,                                              │ │
│  │      mlCoins: 50,                                          │ │
│  │      bonuses: []                                           │ │
│  │    },                                                      │ │
│  │    rankUp: null                                            │ │
│  │  }                                                         │ │
│  └────────────────────────┬───────────────────────────────────┘ │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             │ 11. Respuesta JSON
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  useModuleDetail actualiza:                                │ │
│  │    - Estado del ejercicio (completed: true)                │ │
│  │    - Re-fetch de progreso del módulo                       │ │
│  │    - Muestra feedback visual:                              │ │
│  │      ✓ Badge "Completado"                                  │ │
│  │      ✓ Botón cambia a "Volver a intentar"                  │ │
│  │      ✓ Toast notification con rewards                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                             │
                             │ 12. Usuario ve:
                             │     • "¡Completado! +200 XP, +50 ML Coins"
                             │     • Badge verde "Completado"
                             │     • Progreso del módulo: 20% (1/5)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     USUARIO (Feedback Visual)                    │
│  ✅ Ejercicio marcado como completado                            │
│  💰 Recompensas otorgadas y visibles                             │
│  📊 Progreso de módulo actualizado                               │
│  🏆 Stats de perfil actualizados                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Flujo B: Ejercicios con Revisión Manual (v2.8.0)

Este flujo complementa el flujo principal para ejercicios que requieren calificación por maestro.

```
┌─────────────┐
│   USUARIO   │
│  (Student)  │
└──────┬──────┘
       │
       │ 1. Ingresa al ejercicio (requires_manual_grading = true)
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                 │
│  Renderiza ejercicio que requiere revisión manual                │
└──────────────────────────────────────────────────────────────────┘
       │
       │ 2. Click "Enviar para Revisión"
       ▼
┌──────────────────────────────────────────────────────────────────┐
│              POST /exercises/:id/submit                          │
│              Body: { answers, startedAt }                        │
└──────────────────────────────────────────────────────────────────┘
       │
       │ 3. Backend detecta requires_manual_grading = true
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  INSERT INTO exercise_submissions                          │ │
│  │    status = 'submitted', is_correct = NULL                 │ │
│  │    xp_earned = 0, ml_coins_earned = 0                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
       │
       │ ⏳ ESPERA: Maestro revisa y califica
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    TEACHER PORTAL                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Maestro califica submission:                              │ │
│  │    PUT /teacher/submissions/:id/grade                      │ │
│  │    Body: { score: 90, is_correct: true, feedback: "..." }  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
       │
       │ 4. UPDATE dispara trigger
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  UPDATE exercise_submissions                               │ │
│  │    SET status = 'graded',                                  │ │
│  │        is_correct = true,                                  │ │
│  │        xp_earned = 200,                                    │ │
│  │        ml_coins_earned = 50                                │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│                           │ 5. Trigger WHEN se activa             │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Trigger: trg_update_user_stats_on_submission              │ │
│  │  AFTER UPDATE ON exercise_submissions                      │ │
│  │  WHEN (status IN ('graded','reviewed')                     │ │
│  │        AND is_correct = true                               │ │
│  │        AND status/is_correct CHANGED)                      │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│                           │ 6. Función se ejecuta                │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  update_user_stats_on_submission_graded()                  │ │
│  │    ├─▶ Leer NEW.xp_earned (200)                           │ │
│  │    ├─▶ Leer NEW.ml_coins_earned (50)                      │ │
│  │    │                                                        │ │
│  │    └─▶ UPDATE gamification_system.user_stats               │ │
│  │        SET total_xp = total_xp + 200                       │ │
│  │        SET ml_coins = ml_coins + 50                        │ │
│  │        SET exercises_completed += 1                        │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│                           │ 7. Cascada: UPDATE en user_stats      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Trigger: trg_update_missions_on_earn_xp                   │ │
│  │  AFTER UPDATE ON user_stats                                │ │
│  │  WHEN (NEW.total_xp != OLD.total_xp)                       │ │
│  │    ├─▶ Busca misiones earn_xp activas                     │ │
│  │    └─▶ Incrementa objectives[].current += 200             │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
       │
       │ 8. Transacción COMMIT
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    NOTIFICACIÓN AL ESTUDIANTE                    │
│  ✅ "¡Tu ejercicio fue calificado! +200 XP, +50 ML Coins"       │
│  🏆 Misión "Ganar 100 XP" actualizada automáticamente           │
└──────────────────────────────────────────────────────────────────┘
```

### Comparación de Flujos

| Aspecto | Flujo A (Autocorregibles) | Flujo B (Revisión Manual) |
|---------|---------------------------|---------------------------|
| Tabla principal | `exercise_attempts` | `exercise_submissions` |
| Trigger evento | AFTER INSERT | AFTER UPDATE |
| Cuándo se otorga XP | Inmediato al enviar | Cuando maestro califica |
| Reintentos | Ilimitados | Solo 1 entrega |
| Anti-farming XP | Solo primer acierto | N/A (solo 1 entrega) |
| Actualiza misiones | Sí, vía cadena de triggers | Sí, vía cadena de triggers |

---

## 🎯 Puntos Clave del Flujo

### 1. **Inicio del Flujo (Frontend)**
- Usuario navega a `ModuleDetailPage`
- Hook `useModuleDetail` se ejecuta automáticamente
- Fetch simultáneo de módulo y ejercicios

### 2. **Autenticación (JWT)**
- Cada request incluye `Authorization: Bearer {token}`
- Backend valida con `JwtAuthGuard`
- Extrae `userId` del token para queries

### 3. **Cálculo de Recompensas (Backend)**
- `ExerciseAttemptService` calcula XP y ML Coins
- Aplica penalties según hints/powerups usados
- **NO sobrescribe con 0** (bug corregido)

### 4. **Trigger Automático (Database)**
- INSERT en `exercise_attempts` dispara trigger
- Función lee valores precalculados (`NEW.xp_earned`, `NEW.ml_coins_earned`)
- UPDATE atómico en `user_stats`

### 5. **Pattern UPSERT (Database)**
- Primero intenta UPDATE
- Si `NOT FOUND`, hace INSERT con valores iniciales
- Evita errores por user_stats faltante

### 6. **Respuesta y Actualización (Frontend)**
- Backend retorna rewards calculados
- Frontend re-fetch para actualizar UI
- Badges y progreso se actualizan automáticamente

---

## ⏱️ Timeline del Flujo (Performance)

```
t=0ms     Usuario hace submit
t=20ms    Backend recibe request (JWT validated)
t=50ms    INSERT en exercise_submissions
t=80ms    INSERT en exercise_attempts
t=85ms    ⚡ Trigger ejecuta (muy rápido, <5ms)
t=90ms    UPDATE en user_stats completo
t=100ms   Response enviada al Frontend
t=120ms   Frontend actualiza UI

TOTAL: ~120ms end-to-end
```

---

## 🔍 Verificación del Flujo Correcto

### Checkpoints de Validación

1. ✅ **exercise_attempts insertado**
   ```sql
   SELECT * FROM progress_tracking.exercise_attempts
   WHERE user_id = 'user-uuid'
   ORDER BY created_at DESC LIMIT 1;
   ```

2. ✅ **user_stats actualizado**
   ```sql
   SELECT total_xp, ml_coins, ml_coins_earned_total, exercises_completed
   FROM gamification_system.user_stats
   WHERE user_id = 'user-uuid';
   ```

3. ✅ **submission marcada como graded**
   ```sql
   SELECT status FROM progress_tracking.exercise_submissions
   WHERE id = 'submission-uuid';
   ```

4. ✅ **Frontend muestra completado**
   ```typescript
   GET /api/educational/exercises/:id
   // response: { ...exercise, completed: true }
   ```

---

## 🚨 Puntos de Fallo y Manejo

### 1. Trigger Falla

**Problema:** Función trigger tiene bug
**Impacto:** Stats no se actualizan pero attempt sí se guarda
**Solución:**
```sql
-- Trigger usa EXCEPTION handler
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error updating stats for user %', NEW.user_id;
        RETURN NEW;  -- No bloquea el INSERT
END;
```

### 2. JWT Expirado

**Problema:** Token expiró (> 1 hora)
**Impacto:** Request rechazado con 401 Unauthorized
**Solución Frontend:**
```typescript
try {
  await submitExercise();
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
    logout();
  }
}
```

### 3. Exercise No Existe

**Problema:** ID de ejercicio inválido
**Impacto:** 404 Not Found
**Solución Backend:**
```typescript
const exercise = await this.exercisesService.findById(id);
if (!exercise) {
  throw new NotFoundException(`Exercise ${id} not found`);
}
```

---

## 📈 Optimizaciones Implementadas

### 1. **Batch Fetch de Submissions**
```typescript
// ❌ ANTES: N queries (una por cada ejercicio)
for (const exercise of exercises) {
  const submission = await findSubmission(userId, exercise.id);
}

// ✅ AHORA: 1 query para todos
const allSubmissions = await findByUserId(userId);
const completedMap = new Map(submissions.map(s => [s.exercise_id, true]));
```

### 2. **Cálculo de Progress en Backend**
```typescript
// Evita que Frontend tenga que calcular
// Retorna directamente: { progress: 40, completed: false }
```

### 3. **Trigger en Lugar de Application Logic**
```typescript
// ❌ EVITADO: Actualizar stats desde NestJS
// ✅ MEJOR: Trigger automático en BD
// Garantiza que SIEMPRE se actualiza, sin olvidos
```

---

**Última actualización:** 2025-11-29
**Autor:** Sistema Gamilit
**Versión:** 2.8.0
