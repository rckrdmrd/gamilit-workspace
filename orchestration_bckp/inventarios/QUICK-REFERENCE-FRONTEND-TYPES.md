# REFERENCIA RÁPIDA - Tipos TypeScript Frontend

**Generado por SA-VAL-003** | 2025-11-02 | 102 archivos analizados

---

## NAVEGACIÓN RÁPIDA

### Archivos Principales de Tipos
```
shared/
├── constants/
│   └── enums.constants.ts         (31 ENUMs + helpers)
├── types/
│   ├── auth.types.ts              (6 interfaces)
│   ├── educational.types.ts       (7 interfaces, 2 ENUMs locales)
│   ├── progress.types.ts          (9 interfaces, 1 ENUM)
│   ├── achievement.types.ts       (8 interfaces, 3 ENUMs)
│   ├── leaderboard.types.ts       (6 interfaces, 3 ENUMs)
│   └── profile.types.ts           (6 interfaces)
├── constants/
│   ├── api-endpoints.ts           (API_ENDPOINTS const)
│   ├── colors.ts                  (colors palette)
│   └── breakpoints.ts             (responsive breakpoints)
└── hooks/                          (custom hooks with types)
```

---

## ENUMS POR CATEGORÍA

### Auth Management (9)
- `AuthProviderEnum` - [local, google, facebook, apple, microsoft, github]
- `SubscriptionTierEnum` - [free, basic, professional, enterprise]
- `UserStatusEnum` - [active, inactive, suspended, pending]
- `SecurityEventSeverityEnum` - [low, medium, high, critical]
- `ThemeEnum` - [light, dark, auto]
- `LanguageEnum` - [es, en]
- `DeviceTypeEnum` - [desktop, mobile, tablet]
- `MembershipRoleEnum` - [owner, admin, member, guest]
- `MembershipStatusEnum` - [active, pending, suspended, revoked]

### Gamification (11)
- `DifficultyLevelEnum` - [beginner, intermediate, advanced, very_easy, easy, medium, hard, very_hard]
- `MayaRank` ⚠️ - [Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan]
- `MayaRankEnum` (DEPRECATED) - Legacy version
- `ComodinTypeEnum` - [pistas, vision_lectora, segunda_oportunidad]
- `TransactionTypeEnum` - [earned_exercise, earned_achievement, earned_daily_bonus, earned_rank_promotion, spent_hint, spent_unlock_content, spent_customization, refund, admin_adjustment, gift]
- `AchievementCategoryEnum` - [progress, streak, completion, social, special, mastery, exploration]
- `AchievementTypeEnum` - [badge, milestone, special, rank_promotion]
- `NotificationTypeEnum` - [info, success, warning, error, achievement, progress, social, reminder]
- `NotificationChannelEnum` - [in_app, email, push, sms]

### Educational (8)
- `ContentStatusEnum` - [draft, published, archived, reviewing]
- `ModuleStatusEnum` - [draft, published, archived, under_review]
- `ContentTypeEnum` - [video, text, interactive, quiz, game, simulation]
- `MediaTypeEnum` - [image, video, audio, document, interactive, animation]
- `ProcessingStatusEnum` - [uploading, processing, ready, error, optimizing]
- `ExerciseTypeEnum` - **31 tipos** (crucigrama, detective_textual, etc.)
- `DifficultyLevel` (local) - [beginner, intermediate, advanced]
- `ExerciseType` (local) - [multiple_choice, code_completion, true_false, fill_in_blank, coding_challenge, matching]

### Progress & System (4)
- `ProgressStatusEnum` - [not_started, in_progress, completed, reviewed, mastered]
- `AttemptResultEnum` - [correct, incorrect, partial, skipped]
- `GamilityRoleEnum` - [student, admin_teacher, super_admin]
- `AlertSeverityEnum` - [info, warning, error, critical]

### Social (2)
- `ClassroomRoleEnum` - [teacher, student, assistant]
- `SocialEventTypeEnum` - [competition, collaboration, challenge, tournament, workshop]

### System (2)
- `AggregationPeriodEnum` - [daily, weekly, monthly, quarterly, yearly]
- `MetricTypeEnum` - [engagement, performance, completion, time_spent, accuracy, streak, social_interaction]

### Leaderboard (3)
- `LeaderboardType` - [global, school, classroom]
- `MayaRank` (local) ⚠️ - [novice, apprentice, adept, expert, master, legend]
- `LeaderboardTimePeriod` - [all_time, this_month, this_week, today]

---

## INTERFACES PRINCIPALES POR DOMINIO

### Auth (6)
```typescript
interface User { id, email, role, status, email_verified }
interface LoginCredentials { email, password }
interface RegisterData extends LoginCredentials { first_name?, last_name? }
interface AuthResponse { access_token, refresh_token?, user? }
interface AuthState { user, isAuthenticated, isLoading, error }
interface AuthContextType extends AuthState { login, register, logout, refreshUser, clearError }
```

### Educational (7)
```typescript
interface Module { id, title, description, difficulty, order_index, ... }
interface Exercise { id, module_id, title, type, config, content, solution, ... } // 45+ props
interface ExerciseContent { question?, options?, correct_answer?, code_template?, test_cases? }
interface TestCase { input, expected_output, is_hidden, description? }
interface ModuleWithProgress extends Module { progress? }
```

### Progress (9)
```typescript
interface ModuleProgress { id, user_id, module_id, status, progress_percentage, ... } // 35+ props
interface ProgressSummary { user_id, total_modules, modules_completed, ... }
interface LearningSession { id, user_id, module_id, exercise_id?, session_start, ... }
interface ExerciseAttempt { id, user_id, exercise_id, attempt_number, status, score, ... }
interface ExerciseSubmission { id, attempt_id, user_id, exercise_id, submission_data, ... }
interface SessionStats { user_id, period, total_sessions, ... }
interface SubmissionStats { user_id, total_submissions, correct_submissions, ... }
```

### Achievements (8)
```typescript
interface Achievement { id, name, description, icon, category, type, conditions, rewards, ... }
interface UserAchievement { id, userId, achievementId, progress, earnedAt?, claimedAt?, status }
interface AchievementCondition { type, target, current?, description }
interface AchievementReward { xp, mlCoins, items?, rankPromotion? }
interface AchievementFilter { category?, status?, sortBy?, sortOrder?, searchQuery? }
interface AchievementSummary { total, earned, claimed, inProgress, locked, completionPercentage, ... }
```

### Leaderboard (6)
```typescript
interface LeaderboardEntry { rank, userId, username, firstName?, lastName?, avatar?, totalXP, level, ... }
interface LeaderboardResponse { type, entries, totalEntries, currentUserEntry?, lastUpdated, ... }
interface LeaderboardFilterOptions { type, limit?, offset?, timePeriod?, schoolId?, classroomId? }
interface CurrentUserPosition { rank, totalXP, level, currentRank, percentile?, xpToNextRank? }
```

### Profile (6)
```typescript
interface UserPreferences { theme, language, timezone, sound_enabled, notifications_enabled, ... }
interface Profile { id, tenant_id, user_id?, email, display_name?, full_name?, role, status, ... } // 25 props
interface ProfileWithStats extends Profile { stats? }
interface CreateProfileDto { tenant_id, email, role?, first_name?, preferences? }
interface UpdateProfileDto { display_name?, full_name?, avatar_url?, bio?, preferences?, ... }
```

---

## TIPOS (4)

```typescript
type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
type ColorName = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'
type Breakpoint = keyof typeof breakpoints
type ApiEndpoint = string | ((...args: string[]) => string)
```

---

## CONST MAPPINGS (12)

### Achievement UI Mappings
- `ACHIEVEMENT_CATEGORY_COLORS` - Record<AchievementCategory, string>
- `ACHIEVEMENT_CATEGORY_LABELS` - Record<AchievementCategory, string> (Spanish)
- `ACHIEVEMENT_RARITY_COLORS` - {common, rare, epic, legendary}

### Leaderboard UI Mappings
- `RANK_ICONS` - Record<MayaRank, string>
- `RANK_COLORS` - Record<MayaRank, string>
- `RANK_LABELS` - Record<MayaRank, string> (Spanish)
- `LEADERBOARD_TYPE_LABELS` - Record<LeaderboardType, string> (Spanish)
- `TIME_PERIOD_LABELS` - Record<LeaderboardTimePeriod, string> (Spanish)

### Constants Objects
- `API_ENDPOINTS` - Organized by module (AUTH, USERS, GAMIFICATION, EDUCATIONAL, PROGRESS, SOCIAL, CONTENT, HEALTH)
- `colors` - Color palette synchronized with Tailwind CSS
- `breakpoints` - Responsive breakpoints (sm, md, lg, xl, 2xl)
- `mediaQueries` - Media query strings for responsive design

---

## HELPER FUNCTIONS

Located in `shared/constants/enums.constants.ts`:

```typescript
// Validate if value belongs to enum
isValidEnumValue<T extends Record<string, string>>(enumObj: T, value: string): boolean

// Get all enum values as array
getEnumValues<T extends Record<string, string>>(enumObj: T): string[]

// Get all enum keys as array
getEnumKeys<T extends Record<string, string>>(enumObj: T): string[]
```

---

## API ENDPOINTS (grouped by module)

### Auth
- `AUTH.BASE`, `AUTH.LOGIN`, `AUTH.REGISTER`, `AUTH.LOGOUT`, `AUTH.REFRESH`, `AUTH.VERIFY_EMAIL`, `AUTH.RESET_PASSWORD`, `AUTH.CHANGE_PASSWORD`, `AUTH.PROFILE`

### Users
- `USERS.BASE`, `USERS.BY_ID(id)`, `USERS.PROFILE(id)`, `USERS.PREFERENCES(id)`, `USERS.ROLES(id)`, `USERS.STATS(id)`

### Gamification
- `GAMIFICATION.ACHIEVEMENTS`, `GAMIFICATION.USER_ACHIEVEMENTS(userId)`, `GAMIFICATION.LEADERBOARD`, `GAMIFICATION.USER_STATS(userId)`, `GAMIFICATION.USER_RANK(userId)`, `GAMIFICATION.ML_COINS_BALANCE(userId)`, `GAMIFICATION.COMODINES(userId)`, `GAMIFICATION.NOTIFICATIONS(userId)`

### Educational
- `EDUCATIONAL.MODULES`, `EDUCATIONAL.MODULE_BY_ID(id)`, `EDUCATIONAL.EXERCISES`, `EDUCATIONAL.EXERCISE_BY_ID(id)`, `EDUCATIONAL.EXERCISE_SUBMIT(id)`, `EDUCATIONAL.MEDIA_RESOURCES`, `EDUCATIONAL.RUBRICS`

### Progress
- `PROGRESS.USER_PROGRESS(userId)`, `PROGRESS.MODULE_PROGRESS(userId, moduleId)`, `PROGRESS.EXERCISE_ATTEMPTS(userId, exerciseId)`, `PROGRESS.SESSIONS(userId)`, `PROGRESS.SUBMISSIONS(userId, exerciseId)`

### Social
- `SOCIAL.FRIENDS(userId)`, `SOCIAL.SCHOOLS`, `SOCIAL.CLASSROOMS`, `SOCIAL.TEAMS`

### Content
- `CONTENT.TEMPLATES`, `CONTENT.MARIE_CURIE`, `CONTENT.MEDIA_FILES`, `CONTENT.UPLOAD_MEDIA`

### Health
- `HEALTH.LIVENESS`, `HEALTH.READINESS`, `HEALTH.METRICS`

---

## CONFLICTOS IDENTIFICADOS

### ⚠️ MayaRank Duplicado
- **Location 1:** `shared/constants/enums.constants.ts` (v1.0)
  - Values: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan
- **Location 2:** `shared/types/leaderboard.types.ts` (legacy)
  - Values: novice, apprentice, adept, expert, master, legend
- **Status:** REQUIRES CONSOLIDATION

---

## CARACTERÍSTICAS DESTACADAS

### Gamification
- 31 tipos de ejercicios en 5 módulos educativos
- Sistema de comodines (power-ups)
- Rangos mayas jerárquicos
- 10 tipos de transacciones de ML Coins

### Progress Tracking
- Multi-level tracking: Session → Attempt → Submission → ModuleProgress
- Performance analytics incluidas
- Adaptive learning path support
- Power-ups tracking (comodines usage)

### Internationalization
- Soportado: Español (es), Inglés (en)
- Mappings de labels para dropdowns
- Theme support: light, dark, detective (custom)

### Type Safety
- 93 definiciones de tipos en total
- 31 ENUMs sincronizados con Backend DDL
- 37 Interfaces para entidades principales
- DTO pattern para Create/Update operations

---

## ESTADÍSTICAS FINALES

| Métrica | Cantidad |
|---------|----------|
| ENUMs Totales | 38 |
| Const Enums | 12 |
| Interfaces | 37 |
| Types | 4 |
| **Total Definiciones** | **93** |
| Archivos .ts | 102 |
| Líneas de Tipos | ~1,900 |
| Documentación | 85% |

---

## NEXT STEPS

1. Resolver conflicto MayaRank
2. Expandir helper functions
3. Agregar type guards
4. Documentar sync mechanism
5. Create migration guide

---

**Documento Generado por SA-VAL-003** | Orchestration | 2025-11-02
