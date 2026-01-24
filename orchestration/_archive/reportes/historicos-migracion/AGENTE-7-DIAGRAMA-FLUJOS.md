# AGENTE 7: Diagramas de Flujo de Tipos

## Flujo 1: Autenticación (Login)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ DATABASE: auth.users                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ id                    uuid                                               │
│ email                 text                                               │
│ encrypted_password    text                                               │
│ role                  gamilit_role ENUM                                  │
│ email_confirmed_at    timestamp with time zone                          │
│ raw_user_meta_data    jsonb                                              │
│ created_at            timestamp with time zone                          │
│ updated_at            timestamp with time zone                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND ENTITY: User                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ id: string                                                               │
│ email: string                                                            │
│ encrypted_password: string (@Exclude)                                    │
│ role: GamilityRoleEnum                                                   │
│ email_confirmed_at?: Date                                                │
│ raw_user_meta_data: Record<string, any>                                 │
│ created_at: Date                                                         │
│ updated_at: Date                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND DTO: UserResponseDto                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ id: string                                                               │
│ email: string                                                            │
│ role: GamilityRoleEnum                                                   │
│ email_confirmed_at?: Date                                                │
│ raw_user_meta_data: Record<string, any>                                 │
│ created_at: Date                                                         │
│ updated_at: Date                                                         │
│ ❌ EXCLUDED: encrypted_password, deleted_at                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND LOGIN RESPONSE                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ {                                                                        │
│   user: UserResponseDto                                                  │
│   accessToken: string                   ⚠️ camelCase                     │
│   refreshToken: string                  ⚠️ camelCase                     │
│ }                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP / JSON
┌─────────────────────────────────────────────────────────────────────────┐
│ JSON SERIALIZED                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ {                                                                        │
│   "user": {                                                              │
│     "id": "uuid-string",                                                 │
│     "email": "user@example.com",                                         │
│     "role": "student",                                                   │
│     "email_confirmed_at": "2024-11-04T10:30:00.000Z",  ⚠️ Date→string   │
│     "raw_user_meta_data": {...},                                         │
│     "created_at": "2024-11-04T08:00:00.000Z",                           │
│     "updated_at": "2024-11-04T10:30:00.000Z"                            │
│   },                                                                     │
│   "accessToken": "jwt-token-here",                                       │
│   "refreshToken": "refresh-token-here"                                   │
│ }                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: AuthResponse                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ {                                                                        │
│   access_token: string              ⚠️ snake_case (mismatch)             │
│   refresh_token?: string            ⚠️ snake_case + optional             │
│   user?: User                       ⚠️ optional                          │
│ }                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: User                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ id: string                          ✓ OK                                 │
│ email: string                       ✓ OK                                 │
│ role: string                        ⚠️ no enum                           │
│ status: string                      ❌ NO EXISTE en backend              │
│ email_verified: boolean             ❌ MISMATCH (backend: Date)          │
│ ❌ MISSING: raw_user_meta_data                                           │
│ ❌ MISSING: created_at, updated_at                                       │
└─────────────────────────────────────────────────────────────────────────┘

ISSUES:
🔴 email_verified (boolean) vs email_confirmed_at (Date)
🔴 status field no existe en backend
🟠 Naming: accessToken vs access_token
🟠 role no es enum en frontend
🟠 Campos faltantes: metadata, timestamps
```

---

## Flujo 2: Gamificación (UserStats)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ DATABASE: gamification_system.user_stats                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ id                      uuid                                             │
│ user_id                 uuid                                             │
│ level                   integer                                          │
│ total_xp                integer                                          │
│ current_rank            text (CHECK: ajaw, nacom, ...)                   │
│ rank_progress           numeric(5,2)                                     │
│ ml_coins                integer                                          │
│ ml_coins_earned_total   integer                                          │
│ current_streak          integer                                          │
│ max_streak              integer                                          │
│ exercises_completed     integer                                          │
│ modules_completed       integer                                          │
│ total_score             integer                                          │
│ average_score           numeric(5,2)                                     │
│ perfect_scores          integer                                          │
│ total_time_spent        interval                                         │
│ metadata                jsonb                                            │
│ ... (35 campos total)                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND ENTITY: UserStats                                                │
├─────────────────────────────────────────────────────────────────────────┤
│ id: string                                                               │
│ user_id: string                                                          │
│ level: number                                                            │
│ total_xp: number                                                         │
│ current_rank: string                ⚠️ no enum                           │
│ rank_progress: number                                                    │
│ ml_coins: number                                                         │
│ ml_coins_earned_total: number                                            │
│ current_streak: number                                                   │
│ max_streak: number                                                       │
│ exercises_completed: number                                              │
│ modules_completed: number                                                │
│ total_score: number                                                      │
│ average_score?: number                                                   │
│ perfect_scores: number                                                   │
│ total_time_spent: string            ⚠️ interval→string                   │
│ metadata: Record<string, any>       ⚠️ no tipo                           │
│ ... (35 campos total - 1:1 con DB)                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND DTO: UserStatsResponseDto                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ [SAME AS ENTITY - 35 campos expuestos 1:1]                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP / JSON
┌─────────────────────────────────────────────────────────────────────────┐
│ JSON SERIALIZED (35 campos)                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: ??? (NO EXISTE)                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│       ❌ CRÍTICO: NO HAY INTERFACE UserStats EN FRONTEND                 │
│                                                                          │
│  - Mencionado en ProfileWithStats pero no definido                      │
│  - Frontend usa 'any' implícitamente                                     │
│  - Zero type safety para todo el sistema de gamificación                │
│  - 35 campos sin tipo                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

IMPACT:
🔴 0% type coverage para gamificación
🔴 No autocomplete en IDE
🔴 No compile-time checks
🔴 Runtime errors no detectables
```

---

## Flujo 3: Ejercicios (Educacional)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ DATABASE: educational_content.exercises                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ id                  uuid                                                 │
│ module_id           uuid                                                 │
│ exercise_type       exercise_type ENUM (27+ valores)                     │
│ config              jsonb  ⚠️                                            │
│ content             jsonb  ⚠️                                            │
│ solution            jsonb  ⚠️                                            │
│ difficulty_level    difficulty_level ENUM (5 valores)                    │
│ comodines_allowed   comodin_type[] (array)                               │
│ comodines_config    jsonb  ⚠️                                            │
│ prerequisites       uuid[] (array)                                       │
│ metadata            jsonb  ⚠️                                            │
│ ... (60+ campos total)                                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND ENTITY: Exercise                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ id: string                                                               │
│ module_id: string                                                        │
│ exercise_type: ExerciseTypeEnum  (27+ valores)                          │
│ config: Record<string, any>      ⚠️ sin tipo específico                 │
│ content: Record<string, any>     ⚠️ sin tipo específico                 │
│ solution?: Record<string, any>   ⚠️ sin tipo específico                 │
│ difficulty_level: DifficultyLevelEnum  (5 valores)                      │
│ comodines_allowed: ComodinTypeEnum[]                                     │
│ comodines_config: Record<string, any>  ⚠️ sin tipo                      │
│ prerequisites?: string[]                                                 │
│ metadata: Record<string, any>    ⚠️ sin tipo                             │
│ ... (60+ campos)                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND DTO: ExerciseResponseDto                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ [SAME AS ENTITY - todos los JSONB siguen siendo Record<string, any>]    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP / JSON
┌─────────────────────────────────────────────────────────────────────────┐
│ JSON SERIALIZED                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ {                                                                        │
│   "id": "uuid",                                                          │
│   "exercise_type": "detective_textual",   ⚠️ 1 de 27+ tipos             │
│   "config": {                                                            │
│     "text": "...",                      ⚠️ estructura varía por tipo     │
│     "questions": [...],                                                  │
│     "clues": [...]                                                       │
│   },                                                                     │
│   "difficulty_level": "very_hard"       ⚠️ 1 de 5 niveles               │
│ }                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: Exercise                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ id: string                          ✓ OK                                 │
│ type: ExerciseType                  ❌ SOLO 6 VALORES (vs 27+)          │
│ config?: Record<string, any>        ⚠️ sin tipo específico               │
│ content: ExerciseContent            ⚠️ parcialmente tipado               │
│ difficulty: DifficultyLevel         ❌ SOLO 3 VALORES (vs 5)            │
│ comodines_config: Record<string, any>  ⚠️ sin tipo                       │
│ ... (otros campos)                                                       │
└─────────────────────────────────────────────────────────────────────────┘

FRONTEND ExerciseType (solo 6):        BACKEND ExerciseTypeEnum (27+):
┌───────────────────────────────┐      ┌────────────────────────────────┐
│ ✓ MULTIPLE_CHOICE              │      │ ✓ crucigrama                    │
│ ✓ CODE_COMPLETION              │      │ ✓ linea_tiempo                  │
│ ✓ TRUE_FALSE                   │      │ ✓ sopa_letras                   │
│ ✓ FILL_IN_BLANK                │      │ ✓ mapa_conceptual               │
│ ✓ CODING_CHALLENGE             │      │ ✓ emparejamiento                │
│ ✓ MATCHING                     │      │ ✓ detective_textual             │
│                                │      │ ✓ construccion_hipotesis        │
│                                │      │ ✓ prediccion_narrativa          │
│                                │      │ ✓ puzzle_contexto               │
│                                │      │ ✓ rueda_inferencias             │
│                                │      │ ✓ tribunal_opiniones            │
│                                │      │ ✓ debate_digital                │
│                                │      │ ✓ analisis_fuentes              │
│                                │      │ ✓ podcast_argumentativo         │
│                                │      │ ✓ matriz_perspectivas           │
│                                │      │ ✓ verificador_fake_news         │
│                                │      │ ✓ infografia_interactiva        │
│                                │      │ ✓ quiz_tiktok                   │
│                                │      │ ✓ navegacion_hipertextual       │
│                                │      │ ✓ analisis_memes                │
│                                │      │ ✓ diario_multimedia             │
│                                │      │ ✓ comic_digital                 │
│                                │      │ ✓ video_carta                   │
│                                │      │ ✓ comprension_auditiva          │
│                                │      │ ✓ collage_prensa                │
│                                │      │ ✓ texto_movimiento              │
│                                │      │ ✓ call_to_action                │
└───────────────────────────────┘      └────────────────────────────────┘

ISSUES:
🔴 CRÍTICO: Frontend NO puede renderizar 21+ tipos de ejercicio
🔴 ALTO: config sin tipo - estructura varía dramáticamente por tipo
🔴 ALTO: difficulty mismatch (3 vs 5 niveles)
🟠 content parcialmente tipado
🟠 comodines_config sin estructura definida
```

---

## Flujo 4: Submissions (Progreso)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ DATABASE: progress_tracking.exercise_submissions                         │
├─────────────────────────────────────────────────────────────────────────┤
│ id                    uuid                                               │
│ user_id               uuid                                               │
│ exercise_id           uuid                                               │
│ answer_data           jsonb                                              │
│ is_correct            boolean                                            │
│ score                 integer                                            │
│ max_score             integer                                            │
│ feedback              text                                               │
│ hint_used             boolean                                            │
│ hints_count           integer                                            │
│ comodines_used        text[]                                             │
│ ml_coins_spent        integer                                            │
│ time_spent_seconds    integer                                            │
│ attempt_number        integer                                            │
│ status                text (CHECK)                                       │
│ started_at            timestamp                                          │
│ submitted_at          timestamp                                          │
│ graded_at             timestamp                                          │
│ created_at            timestamp                                          │
│ updated_at            timestamp                                          │
│ (19 campos total)                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND ENTITY: ExerciseSubmission                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ id: string                                                               │
│ user_id: string                                                          │
│ exercise_id: string                                                      │
│ answer_data: Record<string, any>     ⚠️ sin tipo específico             │
│ is_correct?: boolean                                                     │
│ score: number                                                            │
│ max_score: number                                                        │
│ feedback?: string                                                        │
│ hint_used: boolean                                                       │
│ hints_count: number                                                      │
│ comodines_used?: string[]                                                │
│ ml_coins_spent: number                                                   │
│ time_spent_seconds?: number                                              │
│ attempt_number: number                                                   │
│ status: string                                                           │
│ started_at?: Date                                                        │
│ submitted_at: Date                                                       │
│ graded_at?: Date                                                         │
│ created_at: Date                                                         │
│ updated_at: Date                                                         │
│ (19 campos)                                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND DTO: ExerciseSubmissionResponseDto                               │
├─────────────────────────────────────────────────────────────────────────┤
│ [SAME - 19 campos con @Type(() => Date) para dates]                     │
│ Nota: usa | null en lugar de | undefined                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP / JSON
┌─────────────────────────────────────────────────────────────────────────┐
│ JSON SERIALIZED (19 campos)                                              │
├─────────────────────────────────────────────────────────────────────────┤
│ {                                                                        │
│   "id": "uuid",                                                          │
│   "user_id": "uuid",                                                     │
│   "exercise_id": "uuid",                                                 │
│   "answer_data": {...},                  ⚠️                              │
│   "is_correct": true,                                                    │
│   "score": 95,                                                           │
│   "max_score": 100,                                                      │
│   "hint_used": false,                                                    │
│   "hints_count": 0,                                                      │
│   "comodines_used": ["vision_lectora"],                                 │
│   "ml_coins_spent": 25,                                                  │
│   "time_spent_seconds": 180,                                             │
│   "attempt_number": 1,                                                   │
│   "status": "graded",                                                    │
│   "submitted_at": "2024-11-04T10:30:00.000Z",                           │
│   ...                                                                    │
│ }                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: ExerciseSubmission                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ id: string                          ✓ OK                                 │
│ attempt_id: string                  ❌ NO EXISTE en backend              │
│ user_id: string                     ✓ OK                                 │
│ exercise_id: string                 ✓ OK                                 │
│ submission_data: Record<string, any>  ❌ MISMATCH: answer_data           │
│ score: number                       ✓ OK                                 │
│ max_score: number                   ✓ OK                                 │
│ is_correct: boolean                 ⚠️ backend puede ser null            │
│ feedback: string | null             ✓ OK                                 │
│ submitted_at: string                ✓ OK                                 │
│ created_at: string                  ✓ OK                                 │
│ updated_at: string                  ✓ OK                                 │
│                                                                          │
│ ❌ MISSING (10 campos):                                                  │
│   - hint_used                                                            │
│   - hints_count                                                          │
│   - comodines_used                                                       │
│   - ml_coins_spent                                                       │
│   - time_spent_seconds                                                   │
│   - attempt_number                                                       │
│   - status                                                               │
│   - started_at                                                           │
│   - graded_at                                                            │
│                                                                          │
│ (9 de 19 campos = 47% coverage)                                         │
└─────────────────────────────────────────────────────────────────────────┘

COMPARISON TABLE:
┌──────────────────────┬──────────┬──────────┐
│ Field                │ Backend  │ Frontend │
├──────────────────────┼──────────┼──────────┤
│ id                   │    ✓     │    ✓     │
│ user_id              │    ✓     │    ✓     │
│ exercise_id          │    ✓     │    ✓     │
│ answer_data          │    ✓     │    ❌    │ (nombre diferente)
│ submission_data      │    ❌    │    ✓     │ (nombre diferente)
│ is_correct           │    ✓     │    ✓     │
│ score                │    ✓     │    ✓     │
│ max_score            │    ✓     │    ✓     │
│ feedback             │    ✓     │    ✓     │
│ hint_used            │    ✓     │    ❌    │
│ hints_count          │    ✓     │    ❌    │
│ comodines_used       │    ✓     │    ❌    │
│ ml_coins_spent       │    ✓     │    ❌    │
│ time_spent_seconds   │    ✓     │    ❌    │
│ attempt_number       │    ✓     │    ❌    │
│ status               │    ✓     │    ❌    │
│ started_at           │    ✓     │    ❌    │
│ submitted_at         │    ✓     │    ✓     │
│ graded_at            │    ✓     │    ❌    │
│ created_at           │    ✓     │    ✓     │
│ updated_at           │    ✓     │    ✓     │
│ attempt_id           │    ❌    │    ✓     │ (extra en frontend)
└──────────────────────┴──────────┴──────────┘

ISSUES:
🔴 Solo 47% de campos presentes en frontend
🔴 answer_data vs submission_data naming mismatch
🔴 10 campos críticos faltantes (gamificación, hints, estado)
🔴 attempt_id extra en frontend (no existe en backend)
🟠 is_correct nullable en backend pero not-null en frontend
```

---

## Resumen Visual de Issues

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                         TYPE SAFETY BREAKDOWN                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  DB → Backend Entity:        ████████████████████▌░░  85%                ║
║                                                                           ║
║  Backend Entity → DTO:       ████████████████████▌░░  85%                ║
║                                                                           ║
║  DTO → JSON:                 ████████████████████████ 100%  (automático) ║
║                                                                           ║
║  JSON → Frontend Types:      █████████░░░░░░░░░░░░░░  45%   ⚠️           ║
║                                                                           ║
║  ─────────────────────────────────────────────────────────────────────   ║
║  OVERALL:                    ████████████▌░░░░░░░░░░  62%   ❌ D Grade   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

CRITICAL GAPS:
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔴 UserStats:           0% coverage (NO existe en frontend)              │
│ 🔴 ExerciseType:       22% coverage (6 de 27+ tipos)                     │
│ 🔴 ExerciseSubmission: 47% coverage (9 de 19 campos)                     │
│ 🔴 JSONB fields:        0% type safety (todo Record<string, any>)        │
│ 🟠 Enums:              Partial coverage (algunos faltantes/incompletos)  │
│ 🟠 Naming:             Inconsistent (camelCase vs snake_case)            │
│ 🟠 Nullables:          Mix de undefined vs null                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Diagrama de Dependencias de Tipos

```
                         ┌─────────────┐
                         │  DATABASE   │
                         │  (PostgreSQL)│
                         └──────┬──────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              ┌─────▼─────┐         ┌──────▼──────┐
              │  Primitive │         │   Complex   │
              │   Types    │         │   Types     │
              │            │         │             │
              │ uuid       │         │ ENUM        │
              │ text       │         │ JSONB       │
              │ integer    │         │ ARRAY       │
              │ timestamp  │         │ interval    │
              └─────┬──────┘         └──────┬──────┘
                    │                       │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   TYPEORM MAPPING     │
                    │   (Entity Layer)      │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   string, number,     │
                    │   Date, Record<any>   │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   DTO LAYER           │
                    │   (@Expose, @Type)    │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   JSON SERIALIZATION  │
                    │   (HTTP Response)     │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
  ┌─────▼──────┐        ┌──────▼──────┐        ┌──────▼──────┐
  │  Frontend  │        │  Frontend   │        │  Frontend   │
  │   Types    │        │   Types     │        │   Types     │
  │  ✓ EXISTS  │        │ ⚠️ PARTIAL  │        │ ❌ MISSING  │
  │            │        │             │        │             │
  │ User       │        │ Exercise    │        │ UserStats   │
  │ (parcial)  │        │ (6/27 enum) │        │ (0 campos)  │
  │            │        │             │        │             │
  │ Submission │        │             │        │             │
  │ (9/19)     │        │             │        │             │
  └────────────┘        └─────────────┘        └─────────────┘

TYPE LOSS POINTS:
  ↓
  1️⃣  Entity → JSONB fields become Record<string, any>
  ↓
  2️⃣  DTO → Dates serialize to strings (no explicit type)
  ↓
  3️⃣  JSON → Frontend missing types/fields
  ↓
  4️⃣  Frontend → Mix of complete/partial/missing types
```

---

## Recomendación de Arquitectura Mejorada

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROPOSED ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  @gamilit/shared-types  (New Package)                          │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │                                                                 │    │
│  │  /enums/                                                        │    │
│  │    - exercise-type.enum.ts    (27+ valores)                    │    │
│  │    - difficulty-level.enum.ts (5 niveles)                      │    │
│  │    - maya-rank.enum.ts        (5 rangos)                       │    │
│  │                                                                 │    │
│  │  /interfaces/                                                   │    │
│  │    - user-stats.interface.ts  (35 campos)                      │    │
│  │    - exercise.interface.ts                                     │    │
│  │    - submission.interface.ts                                   │    │
│  │                                                                 │    │
│  │  /discriminated-unions/                                         │    │
│  │    - exercise-config.types.ts                                  │    │
│  │    - exercise-content.types.ts                                 │    │
│  │                                                                 │    │
│  │  /validators/ (Zod schemas)                                    │    │
│  │    - user-stats.schema.ts                                      │    │
│  │    - exercise-config.schema.ts                                 │    │
│  │                                                                 │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                            │                                             │
│              ┌─────────────┴─────────────┐                              │
│              │                           │                              │
│     ┌────────▼────────┐         ┌────────▼────────┐                    │
│     │   Backend       │         │   Frontend      │                    │
│     │   imports       │         │   imports       │                    │
│     └─────────────────┘         └─────────────────┘                    │
│                                                                          │
│  Benefits:                                                               │
│    ✓ Single source of truth                                             │
│    ✓ Auto-sync types                                                    │
│    ✓ Compile-time checking                                              │
│    ✓ Runtime validation (Zod)                                           │
│    ✓ No manual sync needed                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Generado por:** AGENTE 7
**Fecha:** 2025-11-04
**Propósito:** Documentación visual de gaps en type safety end-to-end
