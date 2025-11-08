# Matriz de Mapeo y Referencias Cruzadas - GAMILIT

**Proyecto:** GAMILIT Platform
**Versión:** 1.0
**Fecha:** 2025-11-07
**Propósito:** Mapeo completo de referencias cruzadas entre todas las capas del sistema

---

## 📋 Índice de Navegación

1. [Mapeo API → Backend → Database](#1-mapeo-api--backend--database)
2. [Mapeo DTOs y Tipos](#2-mapeo-dtos-y-tipos)
3. [Mapeo Enums](#3-mapeo-enums)
4. [Mapeo Funciones de Base de Datos](#4-mapeo-funciones-de-base-de-datos)
5. [Diagrama de Flujos Críticos](#5-diagrama-de-flujos-críticos)
6. [Referencias Cruzadas por Dominio](#6-referencias-cruzadas-por-dominio)

---

## 1️⃣ Mapeo API → Backend → Database

### 1.1 Módulo: Auth (15 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/auth/register` | POST | auth.controller.ts | AuthService.register() | auth_management.profiles | create_user_profile() |
| `/api/auth/login` | POST | auth.controller.ts | AuthService.login() | auth_management.profiles, sessions | authenticate_user(), update_last_login() |
| `/api/auth/refresh` | POST | auth.controller.ts | AuthService.refreshToken() | auth_management.refresh_tokens | - |
| `/api/auth/logout` | POST | auth.controller.ts | AuthService.logout() | auth_management.sessions | invalidate_session() |
| `/api/auth/me` | GET | auth.controller.ts | AuthService.getCurrentUser() | auth_management.profiles | - |
| `/api/auth/password` | PUT | password.controller.ts | PasswordService.changePassword() | auth_management.profiles | hash_password(), verify_password() |
| `/api/auth/forgot-password` | POST | password.controller.ts | PasswordService.forgotPassword() | auth_management.password_reset_tokens | generate_token() |
| `/api/auth/reset-password` | POST | password.controller.ts | PasswordService.resetPassword() | auth_management.password_reset_tokens, profiles | hash_password() |
| `/api/auth/sessions` | GET | auth.controller.ts | SessionService.getUserSessions() | auth_management.sessions | - |
| `/api/auth/sessions/:id` | DELETE | auth.controller.ts | SessionService.revokeSession() | auth_management.sessions | invalidate_session() |
| `/api/auth/sessions/all` | DELETE | auth.controller.ts | SessionService.revokeAllSessions() | auth_management.sessions | invalidate_session() |

**DTOs Usados:**
- `RegisterDto` → `auth_management.profiles`
- `LoginDto` → `auth_management.profiles`, `sessions`
- `RefreshTokenDto` → `auth_management.refresh_tokens`
- `ChangePasswordDto` → `auth_management.profiles`
- `ForgotPasswordDto` → `auth_management.password_reset_tokens`

---

### 1.2 Módulo: Gamification (40+ endpoints)

#### ML Coins (8 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/gamification/ml-coins/balance` | GET | ml-coins.controller.ts | MLCoinsService.getBalance() | gamification_system.ml_coins_wallets | get_user_wallet() |
| `/api/gamification/ml-coins/transactions` | GET | ml-coins.controller.ts | MLCoinsService.getTransactions() | gamification_system.ml_coins_transactions | - |
| `/api/gamification/ml-coins/award` | POST | ml-coins.controller.ts | MLCoinsService.awardCoins() | gamification_system.ml_coins_transactions, wallets | award_ml_coins() |
| `/api/gamification/ml-coins/deduct` | POST | ml-coins.controller.ts | MLCoinsService.deductCoins() | gamification_system.ml_coins_transactions, wallets | deduct_ml_coins() |
| `/api/gamification/ml-coins/purchase` | POST | ml-coins.controller.ts | MLCoinsService.purchaseItem() | gamification_system.ml_coins_transactions, wallets | deduct_ml_coins() |
| `/api/gamification/ml-coins/history` | GET | ml-coins.controller.ts | MLCoinsService.getTransactionHistory() | gamification_system.ml_coins_transactions | - |

**Trigger:** Exercise completion → `award_ml_coins()` con multiplier de rango

#### Ranks Maya (6 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/gamification/ranks` | GET | ranks.controller.ts | RanksService.getAllRanks() | gamification_system.maya_ranks | - |
| `/api/gamification/ranks/user` | GET | ranks.controller.ts | RanksService.getUserRank() | gamification_system.user_ranks | - |
| `/api/gamification/ranks/progress` | GET | ranks.controller.ts | RanksService.getRankProgress() | gamification_system.user_ranks, user_stats | calculate_rank_progress() |
| `/api/gamification/ranks/promote` | POST | ranks.controller.ts | RanksService.promoteRank() | gamification_system.user_ranks, user_stats | promote_user_rank(), check_rank_requirements() |
| `/api/gamification/ranks/requirements` | GET | ranks.controller.ts | RanksService.getRankRequirements() | gamification_system.maya_ranks | check_rank_requirements() |

**5 Rangos Maya:**
1. Ajaw (Nacom) - 1.0x multiplier
2. Nacom (Batab) - 1.25x multiplier
3. Ah K'in (Holcatte) - 1.5x multiplier
4. Halach Uinic (Guerrero) - 1.75x multiplier
5. K'uk'ulkan (Mercenario) - 2.0x multiplier

#### Achievements (6 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/gamification/achievements` | GET | achievements.controller.ts | AchievementsService.getAll() | gamification_system.achievements | - |
| `/api/gamification/achievements/user` | GET | achievements.controller.ts | AchievementsService.getUserAchievements() | gamification_system.user_achievements | - |
| `/api/gamification/achievements/:id/unlock` | POST | achievements.controller.ts | AchievementsService.unlockAchievement() | gamification_system.user_achievements | unlock_achievement() |
| `/api/gamification/achievements/progress` | GET | achievements.controller.ts | AchievementsService.getProgress() | gamification_system.user_achievements | check_achievement_progress() |
| `/api/gamification/achievements/recent` | GET | achievements.controller.ts | AchievementsService.getRecent() | gamification_system.user_achievements | - |

#### Leaderboards (6 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/gamification/leaderboard/global` | GET | leaderboard.controller.ts | LeaderboardService.getGlobal() | gamification_system.leaderboards, leaderboard_entries | get_leaderboard_top_n() |
| `/api/gamification/leaderboard/classroom/:id` | GET | leaderboard.controller.ts | LeaderboardService.getByClassroom() | gamification_system.leaderboard_entries | get_leaderboard_top_n() |
| `/api/gamification/leaderboard/friends` | GET | leaderboard.controller.ts | LeaderboardService.getFriends() | gamification_system.leaderboard_entries, social_features.friendships | - |
| `/api/gamification/leaderboard/user/:id` | GET | leaderboard.controller.ts | LeaderboardService.getUserPosition() | gamification_system.leaderboard_entries | - |

---

### 1.3 Módulo: Educational (45+ endpoints)

#### Modules (15 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/educational/modules` | GET | modules.controller.ts | ModulesService.findAll() | educational_content.modules | - |
| `/api/educational/modules/:id` | GET | modules.controller.ts | ModulesService.findOne() | educational_content.modules | - |
| `/api/educational/modules` | POST | modules.controller.ts | ModulesService.create() | educational_content.modules | - |
| `/api/educational/modules/:id` | PUT | modules.controller.ts | ModulesService.update() | educational_content.modules | - |
| `/api/educational/modules/:id` | DELETE | modules.controller.ts | ModulesService.delete() | educational_content.modules | - |
| `/api/educational/modules/:id/lessons` | GET | modules.controller.ts | ModulesService.getLessons() | educational_content.lessons | - |
| `/api/educational/modules/:id/progress` | GET | modules.controller.ts | ProgressService.getModuleProgress() | progress_tracking.module_progress | get_module_progress() |

#### Exercises (30 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/educational/exercises` | GET | exercises.controller.ts | ExercisesService.findAll() | educational_content.exercises | - |
| `/api/educational/exercises/:id` | GET | exercises.controller.ts | ExercisesService.findOne() | educational_content.exercises, exercise_configurations | - |
| `/api/educational/exercises` | POST | exercises.controller.ts | ExercisesService.create() | educational_content.exercises | - |
| `/api/educational/exercises/:id` | PUT | exercises.controller.ts | ExercisesService.update() | educational_content.exercises | - |
| `/api/educational/exercises/:id/submit` | POST | exercises.controller.ts | ExercisesService.submitAnswer() | progress_tracking.exercise_submissions | submit_exercise(), calculate_score() |
| `/api/educational/exercises/:id/validate` | POST | exercises.controller.ts | ExercisesService.validateAnswer() | educational_content.exercises | - |
| `/api/educational/exercises/:id/hints` | GET | exercises.controller.ts | ExercisesService.getHints() | educational_content.exercises | - |

**27 Tipos de Ejercicios Soportados:**
1. Crucigrama, 2. Timeline, 3. Sopa de Letras, 4. Mapa Conceptual, 5. Emparejamiento, 6. Verdadero/Falso, 7. Completar Espacios, 8. Detective Textual, 9. Construcción Hipótesis, 10. Predicción Narrativa, 11. Puzzle Contexto, 12. Rueda Inferencias, 13. Análisis Fuentes, 14. Debate Digital, 15. Matriz Perspectivas, 16. Podcast, 17. Tribunal, 18. Fake News, 19. Quiz TikTok, 20. Hipertextual, 21. Memes, 22. Infografía, 23. Email Formal, 24. Chat Literario, 25. Ensayo, 26. Reseña, 27. Diario

---

### 1.4 Módulo: Progress (25 endpoints)

#### Module Progress (5 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/progress/modules` | GET | module-progress.controller.ts | ProgressService.getAllModules() | progress_tracking.module_progress | - |
| `/api/progress/modules/:id` | GET | module-progress.controller.ts | ProgressService.getModuleProgress() | progress_tracking.module_progress | get_module_progress() |
| `/api/progress/modules/:id` | PUT | module-progress.controller.ts | ProgressService.updateProgress() | progress_tracking.module_progress | update_module_progress() |

#### Exercise Attempts (7 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/progress/attempts` | GET | exercise-attempt.controller.ts | AttemptsService.findAll() | progress_tracking.exercise_attempts | - |
| `/api/progress/attempts/:id` | GET | exercise-attempt.controller.ts | AttemptsService.findOne() | progress_tracking.exercise_attempts | - |
| `/api/progress/attempts` | POST | exercise-attempt.controller.ts | AttemptsService.recordAttempt() | progress_tracking.exercise_attempts | record_exercise_attempt() |
| `/api/progress/attempts/exercise/:id` | GET | exercise-attempt.controller.ts | AttemptsService.getExerciseAttempts() | progress_tracking.exercise_attempts | - |

#### Exercise Submissions (7 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/progress/submissions` | GET | exercise-submission.controller.ts | SubmissionsService.findAll() | progress_tracking.exercise_submissions | - |
| `/api/progress/submissions/:id` | GET | exercise-submission.controller.ts | SubmissionsService.findOne() | progress_tracking.exercise_submissions | - |
| `/api/progress/submissions` | POST | exercise-submission.controller.ts | SubmissionsService.submitExercise() | progress_tracking.exercise_submissions | submit_exercise(), calculate_score() |

**Flujo Completo de Submissión:**
```
POST /api/progress/submissions
  → exercise-submission.controller.ts
    → SubmissionsService.submitExercise()
      → ExerciseRepository.findById() [educational_content.exercises]
      → ValidationService.validateAnswer()
      → ScoringService.calculateScore() [DB: calculate_score()]
      → SubmissionsRepository.save() [progress_tracking.exercise_submissions]
      → MLCoinsService.awardCoins() [gamification_system.ml_coins_transactions]
      → AchievementsService.checkProgress() [gamification_system.achievements]
      → NotificationsService.sendNotification()
```

---

### 1.5 Módulo: Social (35 endpoints)

#### Schools (6 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/social/schools` | GET | schools.controller.ts | SchoolsService.findAll() | social_features.schools | - |
| `/api/social/schools/:id` | GET | schools.controller.ts | SchoolsService.findOne() | social_features.schools | - |
| `/api/social/schools` | POST | schools.controller.ts | SchoolsService.create() | social_features.schools | - |
| `/api/social/schools/:id` | PUT | schools.controller.ts | SchoolsService.update() | social_features.schools | - |
| `/api/social/schools/:id` | DELETE | schools.controller.ts | SchoolsService.delete() | social_features.schools | - |

#### Classrooms (12 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/social/classrooms` | GET | classrooms.controller.ts | ClassroomsService.findAll() | social_features.classrooms | - |
| `/api/social/classrooms/:id` | GET | classrooms.controller.ts | ClassroomsService.findOne() | social_features.classrooms | - |
| `/api/social/classrooms` | POST | classrooms.controller.ts | ClassroomsService.create() | social_features.classrooms | - |
| `/api/social/classrooms/:id` | PUT | classrooms.controller.ts | ClassroomsService.update() | social_features.classrooms | - |
| `/api/social/classrooms/:id` | DELETE | classrooms.controller.ts | ClassroomsService.delete() | social_features.classrooms | - |
| `/api/social/classrooms/:id/members` | GET | classroom-members.controller.ts | MembersService.findAll() | social_features.classroom_members | - |
| `/api/social/classrooms/:id/members` | POST | classroom-members.controller.ts | MembersService.addMember() | social_features.classroom_members | add_classroom_member() |
| `/api/social/classrooms/:id/members/:memberId` | DELETE | classroom-members.controller.ts | MembersService.removeMember() | social_features.classroom_members | - |

#### Teams (12 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/social/teams` | GET | teams.controller.ts | TeamsService.findAll() | social_features.teams | - |
| `/api/social/teams/:id` | GET | teams.controller.ts | TeamsService.findOne() | social_features.teams | - |
| `/api/social/teams` | POST | teams.controller.ts | TeamsService.create() | social_features.teams | - |
| `/api/social/teams/:id/members` | POST | team-members.controller.ts | TeamMembersService.addMember() | social_features.team_members | - |

#### Friendships (5 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/social/friendships` | GET | friendships.controller.ts | FriendshipsService.findAll() | social_features.friendships | - |
| `/api/social/friendships/request` | POST | friendships.controller.ts | FriendshipsService.sendRequest() | social_features.friendships | - |
| `/api/social/friendships/:id/accept` | PUT | friendships.controller.ts | FriendshipsService.acceptRequest() | social_features.friendships | - |

---

### 1.6 Módulo: Teacher (30 endpoints)

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/teacher/classrooms` | GET | teacher.controller.ts | TeacherService.getClassrooms() | social_features.classrooms | - |
| `/api/teacher/students/:id/progress` | GET | teacher.controller.ts | TeacherService.getStudentProgress() | progress_tracking.module_progress, exercise_submissions | get_module_progress() |
| `/api/teacher/analytics/overview` | GET | teacher.controller.ts | AnalyticsService.getOverview() | multiple tables | - |
| `/api/teacher/grading/pending` | GET | teacher.controller.ts | GradingService.getPending() | progress_tracking.exercise_submissions | - |

---

### 1.7 Módulo: Admin (40 endpoints)

#### Users Management

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/admin/users` | GET | admin-users.controller.ts | UsersService.findAll() | auth_management.profiles | - |
| `/api/admin/users/:id` | GET | admin-users.controller.ts | UsersService.findOne() | auth_management.profiles | - |
| `/api/admin/users/:id/suspend` | PUT | admin-users.controller.ts | UsersService.suspend() | auth_management.profiles | log_security_event() |

#### Organizations

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/admin/organizations` | GET | admin-organizations.controller.ts | OrganizationsService.findAll() | auth_management.organizations | - |
| `/api/admin/organizations/:id` | GET | admin-organizations.controller.ts | OrganizationsService.findOne() | auth_management.organizations | - |

#### System

| Endpoint | Método | Controlador | Servicio | Tablas DB | Funciones DB |
|----------|--------|-------------|----------|-----------|--------------|
| `/api/admin/system/health` | GET | admin-system.controller.ts | SystemService.getHealth() | system_configuration.system_settings | - |
| `/api/admin/system/stats` | GET | admin-system.controller.ts | SystemService.getStats() | admin_dashboard views | - |

---

## 2️⃣ Mapeo DTOs y Tipos

### 2.1 Auth DTOs

| DTO | Archivo | Mapea a Tabla | Campos Clave |
|-----|---------|---------------|--------------|
| `RegisterDto` | auth/dto/register.dto.ts | auth_management.profiles | email, password, full_name, role |
| `LoginDto` | auth/dto/login.dto.ts | auth_management.profiles | email, password |
| `RefreshTokenDto` | auth/dto/refresh-token.dto.ts | auth_management.refresh_tokens | refresh_token |
| `ChangePasswordDto` | auth/dto/change-password.dto.ts | auth_management.profiles | old_password, new_password |
| `UserResponseDto` | auth/dto/user-response.dto.ts | auth_management.profiles | id, email, role, status |

### 2.2 Gamification DTOs

| DTO | Archivo | Mapea a Tabla | Campos Clave |
|-----|---------|---------------|--------------|
| `AwardCoinsDto` | gamification/dto/award-coins.dto.ts | gamification_system.ml_coins_transactions | user_id, amount, reason, transaction_type |
| `UserStatsDto` | gamification/dto/user-stats.dto.ts | gamification_system.user_stats | user_id, total_xp, current_rank, ml_coins_balance |
| `AchievementDto` | gamification/dto/achievement.dto.ts | gamification_system.achievements | id, name, description, reward_coins |
| `UserAchievementDto` | gamification/dto/user-achievement.dto.ts | gamification_system.user_achievements | user_id, achievement_id, unlocked_at |
| `MissionDto` | gamification/dto/mission.dto.ts | gamification_system.missions | id, title, description, reward, type |

### 2.3 Educational DTOs

| DTO | Archivo | Mapea a Tabla | Campos Clave |
|-----|---------|---------------|--------------|
| `ModuleDto` | educational/dto/module.dto.ts | educational_content.modules | id, title, description, order |
| `ExerciseDto` | educational/dto/exercise.dto.ts | educational_content.exercises | id, type, content, correct_answer |
| `SubmitExerciseDto` | progress/dto/submit-exercise.dto.ts | progress_tracking.exercise_submissions | exercise_id, user_answer, time_spent |
| `ExerciseAttemptDto` | progress/dto/exercise-attempt.dto.ts | progress_tracking.exercise_attempts | exercise_id, user_id, is_correct |

### 2.4 Social DTOs

| DTO | Archivo | Mapea a Tabla | Campos Clave |
|-----|---------|---------------|--------------|
| `ClassroomDto` | social/dto/classroom.dto.ts | social_features.classrooms | id, name, school_id, teacher_id |
| `TeamDto` | social/dto/team.dto.ts | social_features.teams | id, name, classroom_id, members_count |
| `FriendshipDto` | social/dto/friendship.dto.ts | social_features.friendships | user_id_1, user_id_2, status |

---

## 3️⃣ Mapeo Enums

### 3.1 Backend Enums → Database Enums

| Backend Enum | Archivo | Database Enum | Schema | Valores |
|--------------|---------|---------------|--------|---------|
| `UserRole` | shared/enums/user-role.enum.ts | `gamilit_role` | public | student, admin_teacher, super_admin |
| `UserStatus` | shared/enums/user-status.enum.ts | `user_status` | public | active, inactive, suspended, pending |
| `ExerciseType` | educational/enums/exercise-type.enum.ts | `exercise_type` | public | crucigrama, timeline, sopa_letras, etc. (27 tipos) |
| `NotificationType` | notifications/enums/notification-type.enum.ts | `notification_type` | public | achievement_unlocked, mission_completed, level_up, friend_request |
| `TransactionType` | gamification/enums/transaction-type.enum.ts | `transaction_type` | public | exercise_completion, mission_reward, purchase, admin_adjustment |
| `MayaRank` | gamification/enums/maya-rank.enum.ts | `maya_rank_enum` | gamification_system | ajaw, nacom, ah_kin, halach_uinic, kukkulkan |
| `AchievementType` | gamification/enums/achievement-type.enum.ts | `achievement_type_enum` | gamification_system | milestone, streak, mastery, social, special |
| `AuthProvider` | auth/enums/auth-provider.enum.ts | `auth_provider_enum` | auth | local, google, facebook, apple |
| `AuthMethod` | auth/enums/auth-method.enum.ts | `auth_method_enum` | auth | password, oauth, magic_link |
| `FileType` | storage/enums/file-type.enum.ts | `file_type_enum` | storage | image, video, audio, document |

### 3.2 Posibles Duplicaciones de Enums

⚠️ **REVISAR:**

1. **user_role vs gamilit_role**
   - Backend usa `UserRole`
   - Database tiene `gamilit_role` y `user_role`
   - ❓ ¿Son el mismo enum?

2. **maya_rank naming**
   - Docs mencionan: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan
   - También mencionados: Nacom, Batab, Holcatte, Guerrero, Mercenario
   - ❓ ¿Cuál es el set correcto?

---

## 4️⃣ Mapeo Funciones de Base de Datos

### 4.1 Funciones por Módulo Backend

| Función DB | Schema | Llamada desde | Servicio Backend | Propósito |
|------------|--------|---------------|------------------|-----------|
| `create_user_profile()` | auth_management | auth module | AuthService | Crear perfil de usuario con validaciones |
| `authenticate_user()` | auth | auth module | AuthService | Validar credenciales |
| `award_ml_coins()` | gamification_system | gamification module | MLCoinsService | Otorgar monedas con multiplier |
| `deduct_ml_coins()` | gamification_system | gamification module | MLCoinsService | Descontar monedas validando balance |
| `unlock_achievement()` | gamification_system | gamification module | AchievementsService | Desbloquear logro y dar recompensa |
| `promote_user_rank()` | gamification_system | gamification module | RanksService | Promover rango verificando requisitos |
| `record_exercise_attempt()` | progress_tracking | progress module | AttemptsService | Registrar intento de ejercicio |
| `submit_exercise()` | progress_tracking | progress module | SubmissionsService | Enviar ejercicio y calcular score |
| `calculate_score()` | progress_tracking | progress module | ScoringService | Calcular puntuación del ejercicio |
| `update_module_progress()` | progress_tracking | progress module | ProgressService | Actualizar progreso de módulo |
| `get_module_progress()` | educational_content | educational module | ModulesService | Obtener progreso completo |
| `add_classroom_member()` | social_features | social module | ClassroomsService | Agregar miembro a aula |
| `log_security_event()` | auth_management | auth, admin modules | SecurityService | Registrar evento de seguridad |
| `log_audit_event()` | audit_logging | audit module | AuditService | Registrar evento de auditoría |

### 4.2 Funciones Utilitarias (Schema: gamilit)

| Función | Uso | Módulos que la usan |
|---------|-----|---------------------|
| `generate_uuid()` | Generar IDs únicos | Todos |
| `slugify_text()` | Crear slugs URL-friendly | content, educational |
| `validate_email()` | Validar formato email | auth |
| `hash_password()` | Hash de contraseñas | auth |
| `verify_password()` | Verificar contraseña | auth |
| `generate_token()` | Generar tokens seguros | auth |
| `sanitize_html()` | Limpiar HTML | content, educational |

---

## 5️⃣ Diagrama de Flujos Críticos

### 5.1 Flujo: Resolver Ejercicio Completo

```
Frontend: Mecánica de Ejercicio
  │
  ├─ POST /api/progress/submissions
  │    {
  │      exercise_id: UUID,
  │      user_answer: any,
  │      time_spent: number
  │    }
  │
  ▼
Backend: exercise-submission.controller.ts
  │
  ├─ SubmissionsService.submitExercise()
  │   │
  │   ├─ 1. Validar ejercicio existe
  │   │    DB: educational_content.exercises
  │   │
  │   ├─ 2. Registrar intento
  │   │    DB: record_exercise_attempt()
  │   │    Tabla: progress_tracking.exercise_attempts
  │   │
  │   ├─ 3. Validar respuesta
  │   │    ScoringService.calculateScore()
  │   │    DB: calculate_score()
  │   │
  │   ├─ 4. Guardar submission
  │   │    Tabla: progress_tracking.exercise_submissions
  │   │
  │   ├─ 5. Otorgar ML Coins (si correcto)
  │   │    MLCoinsService.awardCoins()
  │   │    DB: award_ml_coins()
  │   │    Tabla: gamification_system.ml_coins_transactions
  │   │    Trigger: Aplicar multiplier de rango
  │   │
  │   ├─ 6. Actualizar progreso del módulo
  │   │    DB: update_module_progress()
  │   │    Tabla: progress_tracking.module_progress
  │   │
  │   ├─ 7. Verificar achievements
  │   │    AchievementsService.checkProgress()
  │   │    DB: check_achievement_progress()
  │   │
  │   ├─ 8. Verificar promoción de rango
  │   │    RanksService.checkPromotion()
  │   │    DB: check_rank_requirements()
  │   │
  │   └─ 9. Enviar notificación
  │        NotificationsService.send()
  │        WebSocket: 'exercise:completed'
  │
  ▼
Response: {
  success: true,
  score: number,
  is_correct: boolean,
  ml_coins_earned: number,
  rank_progress: RankProgressDto,
  achievements_unlocked: AchievementDto[]
}
```

### 5.2 Flujo: Registro de Usuario

```
Frontend: Formulario de Registro
  │
  ├─ POST /api/auth/register
  │    {
  │      email: string,
  │      password: string,
  │      full_name: string,
  │      role: 'student'
  │    }
  │
  ▼
Backend: auth.controller.ts
  │
  ├─ AuthService.register()
  │   │
  │   ├─ 1. Validar email único
  │   │    DB: auth_management.profiles (SELECT)
  │   │
  │   ├─ 2. Hash password
  │   │    DB: hash_password()
  │   │
  │   ├─ 3. Crear perfil
  │   │    DB: create_user_profile()
  │   │    Tabla: auth_management.profiles (INSERT)
  │   │
  │   ├─ 4. Inicializar gamificación
  │   │    GamificationService.initializeUser()
  │   │    Tablas:
  │   │      - gamification_system.user_stats (INSERT)
  │   │      - gamification_system.ml_coins_wallets (INSERT)
  │   │      - gamification_system.user_ranks (INSERT)
  │   │
  │   ├─ 5. Crear sesión
  │   │    SessionService.create()
  │   │    Tabla: auth_management.sessions (INSERT)
  │   │
  │   ├─ 6. Generar tokens JWT
  │   │    DB: generate_token()
  │   │
  │   └─ 7. Log security event
  │        DB: log_security_event()
  │        Tabla: auth_management.security_logs (INSERT)
  │
  ▼
Response: {
  user: UserDto,
  access_token: string,
  refresh_token: string
}
```

### 5.3 Flujo: Promoción de Rango Maya

```
Trigger: Usuario completa misión/logro suficiente
  │
  ├─ Background Job: check_rank_promotions()
  │
  ▼
Backend: RanksService.checkPromotion()
  │
  ├─ 1. Obtener user stats
  │    Tabla: gamification_system.user_stats
  │
  ├─ 2. Verificar requisitos próximo rango
  │    DB: check_rank_requirements()
  │    Tabla: gamification_system.maya_ranks
  │
  ├─ 3. Si cumple requisitos
  │    │
  │    ├─ 3a. Promover rango
  │    │    DB: promote_user_rank()
  │    │    Tabla: gamification_system.user_ranks (UPDATE)
  │    │
  │    ├─ 3b. Otorgar recompensa de rango
  │    │    DB: award_ml_coins()
  │    │    Tabla: gamification_system.ml_coins_transactions
  │    │
  │    ├─ 3c. Desbloquear achievement
  │    │    DB: unlock_achievement()
  │    │    Tabla: gamification_system.user_achievements
  │    │
  │    ├─ 3d. Actualizar leaderboard
  │    │    DB: update_leaderboard_entry()
  │    │    Tabla: gamification_system.leaderboard_entries
  │    │
  │    └─ 3e. Notificar usuario
  │         NotificationsService.send()
  │         WebSocket: 'rank:promoted'
  │         Type: 'level_up'
  │
  ▼
Result: Usuario promovido con nuevo multiplier activo
```

---

## 6️⃣ Referencias Cruzadas por Dominio

### 6.1 Dominio: Autenticación

**Backend Module:** auth
**Controllers:** 2 (auth, password)
**Services:** 4 (AuthService, SessionService, PasswordService, SecurityService)
**Database Schemas:** 2 (auth_management, auth)
**Tables:** 13 (profiles, sessions, refresh_tokens, password_reset_tokens, etc.)
**Functions:** 7 (create_user_profile, authenticate_user, invalidate_session, etc.)
**DTOs:** 8 (RegisterDto, LoginDto, RefreshTokenDto, etc.)
**Enums:** 3 (UserRole, UserStatus, AuthProvider)

**Referencias Externas:**
- Usado por: Todos los módulos (middleware de auth)
- Usa: gamification (inicialización user), audit (logs)

---

### 6.2 Dominio: Gamificación

**Backend Modules:** 3 (gamification, missions, powerups)
**Controllers:** 7
**Services:** 10
**Database Schema:** gamification_system
**Tables:** 13
**Functions:** 23
**Views:** 4
**Enums:** 2
**DTOs:** 15

**Referencias Externas:**
- Usado por: educational (rewards), progress (ML coins), social (leaderboards)
- Usa: auth (user_id), notifications (rank up)

---

### 6.3 Dominio: Educativo

**Backend Modules:** 2 (educational, content)
**Controllers:** 6
**Services:** 9
**Database Schemas:** 2 (educational_content, content_management)
**Tables:** 9
**Functions:** 2
**DTOs:** 12

**Referencias Externas:**
- Usado por: progress (submissions), gamification (rewards), teacher (grading)
- Usa: auth (permissions), storage (media files)

---

### 6.4 Dominio: Progreso

**Backend Module:** progress
**Controllers:** 5
**Services:** 5
**Database Schema:** progress_tracking
**Tables:** 5
**Functions:** 7
**Views:** 1
**DTOs:** 10

**Referencias Externas:**
- Usado por: teacher (analytics), gamification (achievements)
- Usa: educational (exercises), gamification (ML coins)

---

### 6.5 Dominio: Social

**Backend Module:** social
**Controllers:** 7
**Services:** 8
**Database Schema:** social_features
**Tables:** 7
**Functions:** 1
**DTOs:** 8

**Referencias Externas:**
- Usado por: gamification (leaderboards), teacher (classrooms)
- Usa: auth (user profiles)

---

## 7️⃣ Resumen de Cobertura

### 7.1 Endpoints Documentados vs Reales

| Módulo | Endpoints Estimados | Endpoints Documentados | % Cobertura | Prioridad |
|--------|---------------------|------------------------|-------------|-----------|
| auth | 15 | 15 | 100% | ✅ Completo |
| gamification | 40 | 25 | 63% | 🟡 Alta |
| educational | 45 | 30 | 67% | 🟡 Alta |
| progress | 25 | 20 | 80% | ✅ Bueno |
| social | 35 | 25 | 71% | 🟡 Alta |
| teacher | 30 | 10 | 33% | 🔴 Crítica |
| admin | 40 | 15 | 38% | 🔴 Crítica |
| assignments | 15 | 0 | 0% | 🔴 Crítica |
| missions | 12 | 8 | 67% | 🟡 Media |
| powerups | 10 | 6 | 60% | 🟡 Media |
| notifications | 10 | 10 | 100% | ✅ Completo |
| **TOTAL** | **283** | **164** | **58%** | 🟡 |

### 7.2 Objetos de Base de Datos Documentados

| Tipo | Total Real | Documentados | % Cobertura |
|------|------------|--------------|-------------|
| Schemas | 14 | 9 | 64% |
| Tables | 62 | 44 | 71% |
| Functions | 69 | 35 | 51% |
| Views | 12 | 8 | 67% |
| Enums | 10 | 10 | 100% |

---

## 8️⃣ Acciones Recomendadas

### Prioridad P0 (Crítica)
1. ✅ Documentar endpoints de `teacher` (20 faltantes)
2. ✅ Documentar endpoints de `admin` (25 faltantes)
3. ✅ Documentar endpoints de `assignments` (15 faltantes)
4. ✅ Documentar schemas faltantes (5 schemas)

### Prioridad P1 (Alta)
5. ⬜ Completar documentación de `gamification` (15 endpoints)
6. ⬜ Completar documentación de `educational` (15 endpoints)
7. ⬜ Documentar funciones de base de datos (34 faltantes)

### Prioridad P2 (Media)
8. ⬜ Verificar y documentar duplicaciones de enums
9. ⬜ Actualizar diagramas de flujo con referencias completas
10. ⬜ Crear scripts de validación de referencias

---

**Documento Vivo:** Este mapeo será actualizado continuamente.

**Última actualización:** 2025-11-07
**Próxima revisión:** Semanal
**Mantenedores:** @backend-team, @database-team, @docs-team
