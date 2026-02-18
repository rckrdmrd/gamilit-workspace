# ANALISIS-FLUJO-EJERCICIOS.md

**Tarea:** TASK-2026-02-17-ANALISIS-INTEGRACION-CAPAS
**Fecha:** 2026-02-17
**Autor:** Claude Sonnet 4.6 (RESEARCH ONLY — sin modificaciones de código)
**Objetivo:** Mapear el flujo completo de submit de ejercicios para los 5 módulos, identificar endpoints post-submit y evaluar riesgos de FK/CHECK.

---

## PASO 1 — MAPA DE TIPOS DE EJERCICIO POR MÓDULO

### Módulo 1 — Comprensión Literal (evaluación automática)

| Directorio | Mechanic Key (loadMechanic) | Component Principal |
|---|---|---|
| Crucigrama | `crucigrama`, `crucigrama_cientifico` | `CrucigramaExercise.tsx` |
| Timeline | `linea_tiempo`, `timeline` | `TimelineExercise.tsx` |
| SopaLetras | `sopa_letras` | `SopaLetrasExercise.tsx` |
| MapaConceptual | `mapa_conceptual` | `MapaConceptualExercise.tsx` |
| Emparejamiento | `emparejamiento` | `EmparejamientoExercise.tsx` |
| VerdaderoFalso | `verdadero_falso` | `VerdaderoFalsoExercise.tsx` |
| CompletarEspacios | `completar_espacios` | `CompletarEspaciosExercise.tsx` |

**Total Módulo 1:** 7 tipos (+ 1 alias: `crucigrama_cientifico`)

---

### Módulo 2 — Comprensión Inferencial (evaluación automática)

| Directorio | Mechanic Key (loadMechanic) | Component Principal |
|---|---|---|
| DetectiveTextual | `detective_textual` | `DetectiveTextualExercise.tsx` |
| LecturaInferencial | `lectura_inferencial` | `LecturaInferencialExercise.tsx` |
| ConstruccionHipotesis | `construccion_hipotesis` | `CausaEfectoExercise.tsx` |
| PrediccionNarrativa | `prediccion_narrativa` | `PrediccionNarrativaExercise.tsx` |
| PuzzleContexto | `puzzle_contexto` | `PuzzleContextoExercise.tsx` |
| RuedaInferencias | `rueda_inferencias` | `RuedaInferenciasExercise.tsx` |

**Total Módulo 2:** 6 tipos

---

### Módulo 3 — Comprensión Crítica (revisión manual por maestro)

| Directorio | Mechanic Key (loadMechanic) | Component Principal |
|---|---|---|
| AnalisisFuentes | `analisis_fuentes` | `AnalisisFuentesExercise.tsx` |
| DebateDigital | `debate_digital` | `DebateDigitalExercise.tsx` |
| MatrizPerspectivas | `matriz_perspectivas` | `MatrizPerspectivasExercise.tsx` |
| PodcastArgumentativo | `podcast_argumentativo` | `PodcastArgumentativoExercise.tsx` |
| TribunalOpiniones | `tribunal_opiniones` | `TribunalOpinionesExercise.tsx` |

**Total Módulo 3:** 5 tipos

---

### Módulo 4 — Textos Digitales y Multimediales (revisión manual por maestro)

| Directorio | Mechanic Key (loadMechanic) | Component Principal |
|---|---|---|
| VerificadorFakeNews | `verificador_fake_news`, `verificador_fakenews`, `fake_news` | `VerificadorFakeNewsExercise.tsx` |
| QuizTikTok | `quiz_tiktok` | `QuizTikTokExercise.tsx` |
| NavegacionHipertextual | `navegacion_hipertextual` | `NavegacionHipertextualExercise.tsx` |
| AnalisisMemes | `analisis_memes` | `AnalisisMemesExercise.tsx` |
| InfografiaInteractiva | `infografia_interactiva` | `InfografiaInteractivaExercise.tsx` |

**Total Módulo 4:** 5 tipos (+ 2 aliases para VerificadorFakeNews)

---

### Módulo 5 — Producción Creativa (revisión manual por maestro)

| Directorio | Mechanic Key (loadMechanic) | Component Principal |
|---|---|---|
| DiarioMultimedia | `diario_multimedia` | `DiarioMultimediaExercise.tsx` |
| ComicDigital | `comic_digital` | `ComicDigitalExercise.tsx` |
| VideoCarta | `video_carta` | `VideoCartaExercise.tsx` |

**Total Módulo 5:** 3 tipos

---

### Auxiliares (no son módulos principales)

| Directorio | Mechanic Key | Component |
|---|---|---|
| CallToAction | `call_to_action` | `CallToActionExercise` |
| CollagePrensa | `collage_prensa` | `CollagePrensaExercise` |
| ComprensiónAuditiva | `comprension_auditiva` | `ComprensiónAuditivaExercise` |
| TextoEnMovimiento | `texto_movimiento` | `TextoEnMovimientoExercise` |

**Total general registrado en loadMechanic:** 26 entradas (incluyendo aliases, excluyendo auxiliares = 21 tipos únicos + 4 auxiliares)

---

## PASO 2 — ORQUESTADOR PRINCIPAL: ExercisePage.tsx

**Archivo:** `apps/frontend/src/apps/student/pages/ExercisePage.tsx`

### 2a. Función handleSubmit — Endpoint

```
POST /educational/exercises/{exerciseId}/submit
```

**Construcción del endpoint** (educationalAPI.ts, línea 541):
```typescript
await apiClient.post<ExerciseSubmissionResult>(
  `${API_ENDPOINTS.educational.exercise(exerciseId)}/submit`,
  submission,
);
```

**Payload enviado:**
```typescript
{
  answers: userAnswers,          // respuestas reales del usuario
  startedAt: startTime.getTime(), // Unix timestamp
  hintsUsed: progress.hintsUsed || 0,
  powerupsUsed: usedPowerUpsList || [],
}
```

### 2b. Flujo post-submit exitoso

```
handleSubmit()
  ├── submitExercise() → POST /educational/exercises/{id}/submit
  ├── syncAndInvalidate()          ← useInvalidateDashboard hook
  │   ├── fetchUserProgress()      ← GET /gamification/users/{userId}/rank-progress
  │   ├── fetchBalance()           ← GET /gamification/users/{userId}/stats
  │   ├── invalidateQueries(['dashboard', userId])
  │   ├── invalidateQueries(['userModules', userId])
  │   ├── invalidateQueries(['dashboard'])
  │   ├── invalidateQueries(['userModules'])
  │   ├── invalidateQueries(['userGamification', userId])
  │   └── invalidateQueries(['userGamification'])
  ├── setFeedback({ type: 'success', ... })  ← muestra FeedbackModal
  └── setAvailableCoins(prev + result.rewards.mlCoins)
```

**Navegación post-submit** (al cerrar FeedbackModal con type='success'):
```typescript
navigate(`/modules/${exercise.module_id}`)
// fallback: navigate('/dashboard')
```

### 2c. Diferencia Auto-eval (M1-M2) vs Manual-review (M3-M5)

El frontend NO diferencia en el momento del submit — usa el mismo handler `handleSubmit()` y el mismo endpoint para todos los módulos. La diferencia se maneja 100% en el backend.

La respuesta del backend para M3-M5 incluye:
```typescript
{
  requiresManualReview: true,
  message: 'Tu respuesta ha sido enviada para revisión del maestro...'
}
```

El frontend muestra el FeedbackModal con el resultado. Sin embargo, hay un problema: el frontend espera recibir `result.score`, `result.rewards.xp`, `result.rewards.mlCoins` en la respuesta. Para M3-M5, estos campos NO son enviados de regreso de la misma manera porque no hubo auto-grading.

---

## PASO 3 — BACKEND: SERVICIO DE EVALUACIÓN

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

### 3a. Punto de entrada

```
POST /educational/exercises/{exerciseId}/submit
  → ExerciseSubmissionService.submitExercise(userId, exerciseId, answers)
```

### 3b. Flujo M1-M2 (requires_manual_grading = FALSE)

```
submitExercise()
  ├── getProfileId(userId)              ← valida profile existe
  ├── exerciseRepo.findOne(exerciseId)  ← valida ejercicio existe
  ├── check: requires_manual_grading === false → continúa
  ├── validaciones BE-P2-009 (solo M5: word count, panel count, video URL)
  ├── ExerciseAnswerValidator.validate(type, answers)
  ├── findByUserAndExercise() → ¿submission previa?
  │   ├── SI: status in ['draft','submitted'] → UPDATE existente
  │   └── NO: CREATE nueva submission
  ├── gradeSubmission(submissionId)       ← AUTO-GRADING
  │   ├── autoGrade() → SQL validate_and_audit() OR custom TypeScript
  │   ├── submission.score = score
  │   ├── submission.status = 'graded'
  │   └── achievementsService.detectAndGrantEarned(user_id)
  └── claimRewards(submissionId)          ← SI is_correct = true
      ├── getRankXpMultiplier(userId)
      ├── userStatsService.addXp(userId, xpEarned)
      ├── mlCoinsService.addCoins(...)    ← EARNED_EXERCISE, referenceType='exercise'
      ├── updateModuleProgressAfterCompletion()
      ├── updateMissionsProgressAfterCompletion()
      ├── IF rankUp:
      │   ├── mlCoinsService.addCoins(..., EARNED_RANK, referenceType='rank_promotion')  ← ⚠️ RIESGO
      │   └── notificationService.create(RANK_UP)
      └── webSocketService.emitBalanceUpdated / emitMLCoinsEarned / emitXpGained / emitRankUpdated
```

### 3c. Flujo M3-M5 (requires_manual_grading = TRUE)

```
submitExercise()
  ├── getProfileId(userId)
  ├── exerciseRepo.findOne(exerciseId)
  ├── check: requires_manual_grading === true → rama manual
  ├── validaciones BE-P2-009 (M5 only)
  ├── ExerciseAnswerValidator.validate(type, answers)
  ├── findByUserAndExercise() → ¿submission previa?
  │   ├── SI: status 'draft'|'submitted' → UPDATE
  │   └── NO: CREATE nueva
  ├── updateModuleProgressOnSubmission()   ← progreso inmediato (sin rewards)
  ├── notifyTeacherOfSubmission()          ← in-app + email opcional
  └── RETURN { requiresManualReview: true, message: '...' }
      ↑ NO auto-grade, NO rewards (se otorgan cuando maestro califica)
```

**Calificación manual (teacher):**
```
gradeSubmission(id, { final_score, grader_id, feedback })
  ├── submission.score = manualGrade.final_score
  ├── submission.is_correct = score >= 60% of max_score
  ├── submission.status = 'graded'
  ├── claimRewards(submissionId)   ← misma lógica que M1-M2
  └── achievementsService.detectAndGrantEarned(user_id)
```

### 3d. Lógica de gamificación post-submit (claimRewards)

Servicios gamification invocados:
1. **UserStatsService.addXp** → actualiza `gamification_system.user_stats.total_xp`
2. **MLCoinsService.addCoins** → inserta en `gamification_system.ml_coins_transactions`
3. **RankMultiplierService.getMultiplier** → consulta `gamification_system.maya_ranks`
4. Trigger SQL `trg_check_rank_promotion_on_xp_gain` → actualiza `current_rank`
5. **Notificaciones** → `NotificationService.create` si hay rankUp
6. **WebSocket** → emite eventos de balance en tiempo real

---

## PASO 4 — ENDPOINTS POST-SUBMIT

### 4a. useInvalidateDashboard (frontend)

| # | Acción | Endpoint Backend | Descripción |
|---|---|---|---|
| 1 | `fetchUserProgress()` (ranksStore) | `GET /gamification/users/{userId}/rank-progress` | Sincroniza rank, XP, nivel |
| 2 | `fetchBalance()` (economyStore) | `GET /gamification/users/{userId}/stats` | Sincroniza ML Coins balance |
| 3 | `invalidateQueries(['dashboard'])` | Trigger React Query | Re-fetch del dashboard completo |
| 4 | `invalidateQueries(['userModules'])` | Trigger React Query | Re-fetch de módulos con progreso |
| 5 | `invalidateQueries(['userGamification'])` | Trigger React Query | Re-fetch del header gamificado |

### 4b. Endpoints backend invocados por stores (post-submit)

| Endpoint | Store | Riesgo FK/CHECK |
|---|---|---|
| `GET /gamification/users/{userId}/rank-progress` | ranksStore | Bajo — solo lectura |
| `GET /gamification/users/{userId}/stats` | economyStore | Bajo — solo lectura |
| `PATCH /gamification/users/{userId}/stats` | economyStore.addCoins | Medio — escribe user_stats |

### 4c. Endpoints backend invocados durante submitExercise (dentro de claimRewards)

| Llamada interna | Tabla afectada | Riesgo FK/CHECK |
|---|---|---|
| `userStatsService.addXp()` | `gamification_system.user_stats` | Bajo — FK a profiles.id (correcto) |
| `mlCoinsService.addCoins(..., 'exercise')` | `gamification_system.ml_coins_transactions` | **RIESGO CHECK** (ver sección 5) |
| `mlCoinsService.addCoins(..., 'rank_promotion')` | `gamification_system.ml_coins_transactions` | **RIESGO CHECK ALTO** (ver sección 5) |
| `updateModuleProgressAfterCompletion()` | `progress_tracking.module_progress` | Bajo |
| `updateMissionsProgressAfterCompletion()` | `gamification_system.user_mission_progress` | Bajo |
| `notificationService.create()` | `communication.notifications` | Bajo |
| WebSocket emits | (no persiste en BD) | Sin riesgo |

---

## PASO 5 — DIFERENCIA AUTO-EVAL vs MANUAL-REVIEW

### 5a. Frontend: No hay diferencia en el manejo

El `ExercisePage.tsx` usa **el mismo `handleSubmit()`** para todos los módulos:
- Mismo endpoint: `POST /educational/exercises/{id}/submit`
- Misma validación previa (check de `userAnswers`)
- Mismo `syncAndInvalidate()` post-submit
- Mismo `FeedbackModal`

La única diferencia es lo que muestra la UI basado en el campo `requiresManualReview` del response (si el backend lo incluye en la respuesta formateada).

### 5b. Backend: Bifurcación completa en submitExercise

| Aspecto | M1-M2 (Auto) | M3-M5 (Manual) |
|---|---|---|
| Trigger | `exercise.requires_manual_grading = false` | `exercise.requires_manual_grading = true` |
| Validación adicional | Solo ExerciseAnswerValidator | ExerciseAnswerValidator + BE-P2-009 |
| Grading | Inmediato (SQL validate_and_audit o TypeScript) | No — espera al maestro |
| Rewards | Inmediatos (XP + ML Coins en claimRewards) | Diferidos (al momento de gradeSubmission manual) |
| Progreso módulo | updateModuleProgressAfterCompletion() | updateModuleProgressOnSubmission() (porcentaje por envíos, no calificaciones) |
| Notificación maestro | No | notifyTeacherOfSubmission() |
| Respuesta | `{ score, rewards: { xp, mlCoins }, is_correct, rankUp, ... }` | `{ requiresManualReview: true, message: '...' }` |

### 5c. Tipos de ejercicio con validaciones especiales (BE-P2-009)

| Tipo | Módulo | Validación mínima |
|---|---|---|
| `diario_multimedia` | 5 | 150 palabras mínimas en contenido |
| `comic_digital` | 5 | 4 paneles mínimos, cada panel con texto o imagen |
| `video_carta` | 5 | URL de video obligatoria, duración >= 30s si hay metadata |

### 5d. Tipos con validación especial en autoGrade

| Tipo | Módulo | Lógica especial |
|---|---|---|
| `completar_espacios` | 1 | Anti-redundancia: blanks 5 y 6 no pueden ser iguales |
| `rueda_inferencias` | 2 | Custom TypeScript (no usa SQL validate_and_audit) — valida por categoría (literal/inferencial/crítico/creativo) |
| Todos los demás | 1-2 | SQL `educational_content.validate_and_audit()` |

---

## PASO 6 — EVALUACIÓN DE RIESGOS FK/CHECK

### RIESGO 1: `reference_type` CHECK constraint en `ml_coins_transactions`

**Severidad: ALTA**

**DDL constraint** (`05-ml_coins_transactions.sql`, línea 32):
```sql
CONSTRAINT ml_coins_transactions_reference_type_check CHECK (
  (reference_type = ANY (ARRAY[
    'exercise'::text, 'module'::text, 'achievement'::text,
    'powerup'::text, 'admin'::text, 'streak'::text, 'rank'::text
  ]))
)
```

**Valores permitidos:** `exercise`, `module`, `achievement`, `powerup`, `admin`, `streak`, `rank`

**Código problemático** (`exercise-submission.service.ts`, línea 1138):
```typescript
await this.mlCoinsService.addCoins(
  submission.user_id,
  bonusCoins,
  TransactionTypeEnum.EARNED_RANK,
  `Bonus por ascenso a ${newRank}`,
  undefined,
  'rank_promotion',   // ← ESTE VALOR NO EXISTE EN EL CHECK CONSTRAINT
);
```

**Análisis:**
- El valor `'rank_promotion'` se pasa como `referenceType` cuando hay un rankUp.
- El CHECK constraint SOLO permite: `'exercise'`, `'module'`, `'achievement'`, `'powerup'`, `'admin'`, `'streak'`, `'rank'`.
- `'rank_promotion'` NO está en la lista permitida.
- **Resultado:** PostgreSQL lanza error `ERROR: new row for relation "ml_coins_transactions" violates check constraint "ml_coins_transactions_reference_type_check"`.

**Impacto:** Solo se dispara cuando el usuario sube de rango. El primer INSERT (bonusCoins) falla con error CHECK. La transacción de XP (línea 1086) habría completado antes, resultando en XP ganado sin ML Coins de rango acreditados.

**Fix necesario:** Cambiar `'rank_promotion'` por `'rank'` en la línea 1138.

---

### RIESGO 2: FK `user_ranks.user_id` → `profiles.id`

**Severidad: MEDIA**

**DDL** (`02-user_ranks.sql`, línea 83):
```sql
CONSTRAINT user_ranks_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;
```

**Análisis:**
- La tabla `user_ranks` referencia `profiles.id` (no `auth.users.id`).
- El trigger `trg_check_rank_promotion_on_xp_gain` actualiza `user_ranks` después de agregar XP.
- En `claimRewards()`, la llamada `userStatsService.addXp(submission.user_id, xpEarned)` usa `submission.user_id` que es ya el `profile.id` (convertido correctamente en la línea 221 via `getProfileId()`).
- Por tanto, el FK de `user_ranks` en sí NO debería fallar si el flujo upstream es correcto.

**Punto de riesgo:** Si `user_stats.user_id` se popula con `auth.users.id` en lugar de `profiles.id`, el trigger que lee `user_stats.user_id` para actualizar `user_ranks` pasaría un valor incorrecto. Verificar que `user_stats.user_id` siempre almacena `profiles.id`.

---

### RIESGO 3: `ml_coins_transactions.user_id` FK

**Severidad: BAJA** (ya gestionado)

**DDL** (`05-ml_coins_transactions.sql`, línea 46):
```sql
CONSTRAINT ml_coins_transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;
```

**Análisis:**
- `claimRewards()` pasa `submission.user_id` a `mlCoinsService.addCoins()`.
- `submission.user_id` fue establecido como `profileId` (línea 346: `user_id: profileId`).
- La conversión `getProfileId()` al inicio de `submitExercise()` garantiza que `profileId` es un `profiles.id` válido.
- FK no debería fallar si el flujo upstream es correcto.

---

### RIESGO 4: `ml_coins_transactions.tenant_id` NOT NULL vs nullable

**Severidad: BAJA-MEDIA**

**DDL:** `tenant_id uuid` (nullable sin NOT NULL)
**Entity TypeORM:** No incluye `tenant_id` en el `MLCoinsTransaction` entity como campo requerido.

**Análisis:** `addCoins()` no pasa `tenant_id`. La transacción se inserta con `tenant_id = NULL`. Esto es aceptable (DDL lo permite). No causa error.

---

### RIESGO 5: Response mismatch M3-M5 vs frontend expectations

**Severidad: MEDIA-ALTA** (UX/runtime error)

**El frontend espera** (ExercisePage.tsx línea 516):
```typescript
let feedbackMessage = `Has obtenido ${result.score} puntos. Ganaste ${result.rewards.xp} XP y ${result.rewards.mlCoins} ML Coins.`;
```

**Pero para M3-M5, el backend retorna** (`exercise-submission.service.ts`, línea 383):
```typescript
return Object.assign(submission, {
  requiresManualReview: true,
  message: 'Tu respuesta ha sido enviada para revisión...',
});
```

La respuesta M3-M5 NO incluye `result.score`, `result.rewards.xp`, `result.rewards.mlCoins`, `result.isPerfect`, `result.rankUp`. El frontend intenta acceder `result.rewards.xp` y `result.rewards.mlCoins` que son `undefined`, resultando en un mensaje incorrecto o error en runtime si `result.rewards` es undefined.

---

## RESUMEN DE RIESGOS

| # | Riesgo | Severidad | Ubicación | Descripción |
|---|---|---|---|---|
| R1 | CHECK `reference_type = 'rank_promotion'` | **ALTA** | `exercise-submission.service.ts:1138` | Viola constraint — valor no permitido |
| R2 | FK `user_ranks.user_id` | MEDIA | Trigger `trg_check_rank_promotion_on_xp_gain` | Depende de que user_stats.user_id sea profiles.id |
| R3 | FK `ml_coins_transactions.user_id` | BAJA | `claimRewards()` | Correctamente gestionado con getProfileId() |
| R4 | `tenant_id = NULL` en transactions | BAJA | MLCoinsTransaction insert | DDL acepta NULL — no falla |
| R5 | Response mismatch M3-M5 | MEDIA-ALTA | `ExercisePage.tsx:516` + backend respuesta M3-M5 | Frontend accede `result.rewards` que es undefined para M3-M5 |

---

## DIAGRAMA DE FLUJO POST-SUBMIT

```
[Estudiante hace clic "Enviar Respuestas"]
          |
          v
[ExercisePage.handleSubmit()]
  ├── Validar userAnswers != null
  ├── getUsedPowerUps()
  └── submitExercise(exerciseId, { answers, startedAt, hintsUsed, powerupsUsed })
          |
          v
[POST /educational/exercises/{id}/submit]
          |
          v
[ExerciseSubmissionService.submitExercise()]
  ├── getProfileId() → profiles.id
  ├── exerciseRepo.findOne(exerciseId)
  ├── validaciones BE-P2-009 (M5)
  ├── ExerciseAnswerValidator.validate()
  └── ¿requires_manual_grading?
          |
     -----+-----
     |         |
    NO        SI
  (M1-M2)   (M3-M5)
     |         |
     v         v
 gradeSubmission()   updateModuleProgressOnSubmission()
     |                notifyTeacherOfSubmission()
     v                return { requiresManualReview: true }
 autoGrade()
     |
     v
 claimRewards() [si is_correct=true]
  ├── addXp()                    → user_stats
  ├── addCoins(EARNED_EXERCISE)  → ml_coins_transactions [reference_type='exercise'] ✓
  ├── updateModuleProgress()     → module_progress
  ├── updateMissionsProgress()   → user_mission_progress
  ├── IF rankUp:
  │   ├── addCoins(EARNED_RANK)  → ml_coins_transactions [reference_type='rank_promotion'] ⚠️ FALLA
  │   └── notificationService.create(RANK_UP)
  └── webSocketService.emit(...)
          |
          v
[Frontend recibe response]
  ├── syncAndInvalidate()
  │   ├── fetchUserProgress() → GET /gamification/users/{id}/rank-progress
  │   ├── fetchBalance()      → GET /gamification/users/{id}/stats
  │   └── invalidateQueries(['dashboard', 'userModules', 'userGamification'])
  ├── setFeedback({ type: 'success', ... })
  └── [Al cerrar modal] navigate(`/modules/${exercise.module_id}`)
```

---

## CORRECCIONES RECOMENDADAS

### Fix R1 (CRÍTICO): Cambiar reference_type en bonus de rankUp

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
**Línea:** 1138 (aproximada)

```typescript
// ANTES (FALLA):
await this.mlCoinsService.addCoins(
  submission.user_id,
  bonusCoins,
  TransactionTypeEnum.EARNED_RANK,
  `Bonus por ascenso a ${newRank}`,
  undefined,
  'rank_promotion',   // ← NO existe en CHECK constraint
);

// DESPUES (CORRECTO):
await this.mlCoinsService.addCoins(
  submission.user_id,
  bonusCoins,
  TransactionTypeEnum.EARNED_RANK,
  `Bonus por ascenso a ${newRank}`,
  undefined,
  'rank',             // ← valor permitido por DDL CHECK constraint
);
```

### Fix R5 (IMPORTANTE): Normalizar respuesta M3-M5

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
**Línea:** ~383

```typescript
// ANTES:
return Object.assign(submission, {
  requiresManualReview: true,
  message: '...',
});

// DESPUES: incluir campos que el frontend espera con valores default
return Object.assign(submission, {
  requiresManualReview: true,
  message: '...',
  score: 0,
  isPerfect: false,
  correctAnswers: 0,
  totalQuestions: 0,
  rewards: { xp: 0, mlCoins: 0 },
  rankUp: null,
});
```

---

## ARCHIVOS CLAVE REFERENCIADOS

| Archivo | Rol |
|---|---|
| `apps/frontend/src/apps/student/pages/ExercisePage.tsx` | Orquestador principal del flujo de ejercicios |
| `apps/frontend/src/shared/hooks/useInvalidateDashboard.ts` | Hook de invalidación post-submit |
| `apps/frontend/src/services/api/educationalAPI.ts` | Función `submitExercise` — endpoint POST |
| `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts` | Store de rangos — `fetchUserProgress()` |
| `apps/frontend/src/features/gamification/economy/store/economyStore.ts` | Store económico — `fetchBalance()` |
| `apps/backend/src/modules/progress/services/exercise-submission.service.ts` | Lógica central de submit + gamification |
| `apps/backend/src/modules/educational/services/exercises.service.ts` | ExercisesService — sanitización y CRUD |
| `apps/backend/src/modules/gamification/services/ml-coins.service.ts` | MLCoinsService — transacciones con pessimistic lock |
| `apps/backend/src/modules/gamification/entities/ml-coins-transaction.entity.ts` | Entidad + CHECK constraints |
| `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql` | DDL — CHECK reference_type permitidos |
| `apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql` | DDL — FK user_ranks → profiles.id |
