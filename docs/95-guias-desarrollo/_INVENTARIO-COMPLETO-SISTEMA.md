# Inventario Completo del Sistema GAMILIT

**Proyecto:** GAMILIT Platform
**Versión:** 1.0
**Fecha Generación:** 2025-11-07
**Propósito:** Inventario exhaustivo de todos los componentes del sistema para trazabilidad completa

---

## 📊 Resumen Ejecutivo

### Componentes Totales Identificados

| Capa | Componente | Cantidad | Estado |
|------|------------|----------|--------|
| **Backend** | Módulos | 17 | ✅ Identificados |
| | Controladores | 34 | ✅ Identificados |
| | Servicios | 48 | ✅ Identificados |
| | Endpoints HTTP | 283 | ✅ Identificados |
| | DTOs | 193 | ✅ Identificados |
| | Tipos/Enums | ~20 | ✅ Identificados |
| **Base de Datos** | Schemas | 14 | ✅ Identificados |
| | Tablas | 62 | ✅ Identificadas |
| | Funciones | 69 | ✅ Identificadas |
| | Views | 12 | ✅ Identificadas |
| | Enums | 10 | ✅ Identificados |
| **Frontend** | Módulos Features | ~15 | ✅ Identificados |
| | Mecánicas Educativas | 33 | ✅ Identificadas |
| | Zustand Stores | 8 | ✅ Identificados |

---

## 1️⃣ INVENTARIO DE BACKEND

### 1.1 Módulos Backend (17 Total)

| # | Módulo | Controladores | Servicios | Endpoints Est. | Estado Doc |
|---|--------|---------------|-----------|----------------|------------|
| 1 | **admin** | 4 | ~5 | ~40 | ⚠️ Parcial |
| 2 | **assignments** | 1 | ~2 | ~15 | ❌ No doc |
| 3 | **audit** | 0 | ~2 | ~5 | ❌ No doc |
| 4 | **auth** | 2 | ~4 | ~15 | ✅ Documentado |
| 5 | **content** | 3 | ~4 | ~25 | ⚠️ Parcial |
| 6 | **core** | 0 | ~2 | ~5 | ⚠️ Parcial |
| 7 | **educational** | 3 | ~5 | ~45 | ✅ Documentado |
| 8 | **gamification** | 5 | ~6 | ~40 | ✅ Documentado |
| 9 | **mail** | 0 | ~1 | ~3 | ❌ No doc |
| 10 | **missions** | 1 | ~2 | ~12 | ⚠️ Parcial |
| 11 | **notifications** | 1 | ~2 | ~10 | ✅ Documentado |
| 12 | **powerups** | 1 | ~2 | ~10 | ⚠️ Parcial |
| 13 | **progress** | 5 | ~5 | ~25 | ✅ Documentado |
| 14 | **social** | 7 | ~8 | ~35 | ✅ Documentado |
| 15 | **tasks** | 0 | ~2 | ~5 | ❌ No doc |
| 16 | **teacher** | 1 | ~4 | ~30 | ✅ Documentado |
| 17 | **websocket** | 0 | ~1 | ~5 | ✅ Documentado |

### 1.2 Controladores por Módulo (34 Total)

#### Admin (4 controladores)
- `admin-users.controller.ts` → `/api/admin/users/*`
- `admin-content.controller.ts` → `/api/admin/content/*`
- `admin-system.controller.ts` → `/api/admin/system/*`
- `admin-organizations.controller.ts` → `/api/admin/organizations/*`

#### Assignments (1 controlador)
- `assignments.controller.ts` → `/api/assignments/*`

#### Auth (2 controladores)
- `auth.controller.ts` → `/api/auth/*`
- `password.controller.ts` → `/api/auth/password/*`

#### Content (3 controladores)
- `marie-curie-content.controller.ts` → `/api/content/marie-curie/*`
- `media-files.controller.ts` → `/api/content/media/*`
- `content-templates.controller.ts` → `/api/content/templates/*`

#### Educational (3 controladores)
- `modules.controller.ts` → `/api/educational/modules/*`
- `exercises.controller.ts` → `/api/educational/exercises/*`
- `media.controller.ts` → `/api/educational/media/*`

#### Gamification (5 controladores)
- `ml-coins.controller.ts` → `/api/gamification/ml-coins/*`
- `ranks.controller.ts` → `/api/gamification/ranks/*`
- `user-stats.controller.ts` → `/api/gamification/stats/*`
- `achievements.controller.ts` → `/api/gamification/achievements/*`
- `leaderboard.controller.ts` → `/api/gamification/leaderboard/*`

#### Missions (1 controlador)
- `missions.controller.ts` → `/api/missions/*`

#### Notifications (1 controlador)
- `notifications.controller.ts` → `/api/notifications/*`

#### Powerups (1 controlador)
- `powerups.controller.ts` → `/api/powerups/*`

#### Progress (5 controladores)
- `module-progress.controller.ts` → `/api/progress/modules/*`
- `exercise-attempt.controller.ts` → `/api/progress/attempts/*`
- `exercise-submission.controller.ts` → `/api/progress/submissions/*`
- `learning-session.controller.ts` → `/api/progress/sessions/*`
- `scheduled-mission.controller.ts` → `/api/progress/missions/*`

#### Social (7 controladores)
- `schools.controller.ts` → `/api/social/schools/*`
- `classrooms.controller.ts` → `/api/social/classrooms/*`
- `classroom-members.controller.ts` → `/api/social/classrooms/:id/members/*`
- `teams.controller.ts` → `/api/social/teams/*`
- `team-members.controller.ts` → `/api/social/teams/:id/members/*`
- `team-challenges.controller.ts` → `/api/social/challenges/*`
- `friendships.controller.ts` → `/api/social/friendships/*`

#### Teacher (1 controlador)
- `teacher.controller.ts` → `/api/teacher/*`

---

## 2️⃣ INVENTARIO DE BASE DE DATOS

### 2.1 Schemas (14 Total)

| # | Schema | Tables | Functions | Views | Enums | Total Objetos |
|---|--------|--------|-----------|-------|-------|---------------|
| 1 | **admin_dashboard** | 0 | 0 | 4 | 0 | 4 |
| 2 | **audit_logging** | 6 | 1 | 0 | 0 | 7 |
| 3 | **auth** | 1 | 1 | 0 | 2 | 4 |
| 4 | **auth_management** | 12 | 6 | 0 | 0 | 18 |
| 5 | **content_management** | 5 | 0 | 0 | 0 | 5 |
| 6 | **educational_content** | 4 | 2 | 0 | 0 | 6 |
| 7 | **gamification_system** | 13 | 23 | 4 | 2 | 42 |
| 8 | **gamilit** | 0 | 13 | 0 | 0 | 13 |
| 9 | **progress_tracking** | 5 | 7 | 1 | 0 | 13 |
| 10 | **public** | 6 | 7 | 3 | 5 | 21 |
| 11 | **social_features** | 7 | 1 | 0 | 0 | 8 |
| 12 | **storage** | 0 | 0 | 0 | 1 | 1 |
| 13 | **system_configuration** | 3 | 0 | 0 | 0 | 3 |
| 14 | **schemas** (metadata) | - | - | - | - | - |
| **TOTAL** | | **62** | **69** | **12** | **10** | **153** |

### 2.2 Detalle de Objetos por Schema

#### auth_management (18 objetos)
**Tablas (12):**
- `profiles`
- `sessions`
- `refresh_tokens`
- `password_reset_tokens`
- `email_verification_tokens`
- `security_logs`
- `user_preferences`
- `organizations`
- `tenants`
- `roles`
- `permissions`
- `role_permissions`

**Funciones (6):**
- `create_user_profile()`
- `update_last_login()`
- `invalidate_session()`
- `cleanup_expired_tokens()`
- `log_security_event()`
- `check_user_permissions()`

#### gamification_system (42 objetos - SCHEMA MÁS GRANDE)
**Tablas (13):**
- `user_stats`
- `maya_ranks`
- `user_ranks`
- `ml_coins_transactions`
- `ml_coins_wallets`
- `achievements`
- `user_achievements`
- `missions`
- `user_missions`
- `power_ups`
- `user_power_ups`
- `leaderboards`
- `leaderboard_entries`

**Funciones (23):**
- `award_ml_coins()`
- `deduct_ml_coins()`
- `get_user_wallet()`
- `calculate_rank_progress()`
- `check_rank_requirements()`
- `promote_user_rank()`
- `unlock_achievement()`
- `check_achievement_progress()`
- `create_mission()`
- `update_mission_progress()`
- `claim_mission_reward()`
- `activate_power_up()`
- `deactivate_power_up()`
- `get_leaderboard_top_n()`
- `update_leaderboard_entry()`
- `calculate_user_xp()`
- `apply_rank_multiplier()`
- `get_active_missions()`
- `get_completed_achievements()`
- `get_available_power_ups()`
- `calculate_streak_bonus()`
- `reset_daily_missions()`
- `archive_expired_missions()`

**Views (4):**
- `user_stats_summary`
- `leaderboard_global`
- `leaderboard_by_classroom`
- `achievements_progress`

**Enums (2):**
- `maya_rank_enum`
- `achievement_type_enum`

#### educational_content (6 objetos)
**Tablas (4):**
- `modules`
- `lessons`
- `exercises`
- `exercise_configurations`

**Funciones (2):**
- `get_module_progress()`
- `calculate_lesson_completion()`

#### progress_tracking (13 objetos)
**Tablas (5):**
- `module_progress`
- `exercise_attempts`
- `exercise_submissions`
- `learning_sessions`
- `scheduled_missions`

**Funciones (7):**
- `record_exercise_attempt()`
- `submit_exercise()`
- `calculate_score()`
- `update_module_progress()`
- `start_learning_session()`
- `end_learning_session()`
- `get_recent_activities()`

**Views (1):**
- `user_progress_summary`

#### social_features (8 objetos)
**Tablas (7):**
- `schools`
- `classrooms`
- `classroom_members`
- `teams`
- `team_members`
- `team_challenges`
- `friendships`

**Funciones (1):**
- `add_classroom_member()`

#### audit_logging (7 objetos)
**Tablas (6):**
- `audit_logs`
- `api_logs`
- `user_activity_logs`
- `security_events`
- `data_changes`
- `error_logs`

**Funciones (1):**
- `log_audit_event()`

#### public (21 objetos)
**Tablas (6):**
- `countries`
- `states`
- `cities`
- `languages`
- `timezones`
- `currencies`

**Funciones (7):**
- `get_country_by_code()`
- `get_states_by_country()`
- `get_cities_by_state()`
- `validate_timezone()`
- `convert_currency()`
- `get_supported_languages()`
- `format_date_locale()`

**Views (3):**
- `countries_with_stats`
- `popular_cities`
- `language_usage`

**Enums (5):**
- `user_role`
- `user_status`
- `exercise_type`
- `notification_type`
- `transaction_type`

#### content_management (5 objetos)
**Tablas (5):**
- `marie_curie_content`
- `media_files`
- `content_templates`
- `content_versions`
- `content_metadata`

#### system_configuration (3 objetos)
**Tablas (3):**
- `system_settings`
- `feature_flags`
- `maintenance_windows`

#### admin_dashboard (4 objetos)
**Views (4):**
- `dashboard_overview`
- `user_metrics`
- `content_metrics`
- `system_health`

#### auth (4 objetos)
**Tablas (1):**
- `auth_providers`

**Funciones (1):**
- `authenticate_user()`

**Enums (2):**
- `auth_provider_enum`
- `auth_method_enum`

#### gamilit (13 objetos - FUNCIONES COMPARTIDAS)
**Funciones (13):**
- `generate_uuid()`
- `current_timestamp_utc()`
- `slugify_text()`
- `validate_email()`
- `validate_username()`
- `hash_password()`
- `verify_password()`
- `generate_token()`
- `sanitize_html()`
- `parse_json_safe()`
- `array_unique()`
- `array_diff()`
- `string_similarity()`

#### storage (1 objeto)
**Enums (1):**
- `file_type_enum`

---

## 3️⃣ INVENTARIO DE FRONTEND

### 3.1 Estructura de Apps

```
apps/frontend/src/
├── apps/
│   ├── admin/          # Portal de administración
│   ├── student/        # Portal de estudiante
│   └── teacher/        # Portal de profesor
├── features/           # Features compartidas
│   ├── auth/
│   ├── gamification/
│   ├── mechanics/      # 33 mecánicas educativas
│   ├── exercises/
│   ├── progress/
│   └── ...
├── shared/            # Componentes compartidos
└── lib/               # Utilidades
```

### 3.2 Mecánicas Educativas (33 Total)

#### Módulo 1 - Comprensión Literal (7 mecánicas)
1. Crucigrama
2. Timeline
3. Sopa de Letras
4. Mapa Conceptual
5. Emparejamiento
6. Verdadero/Falso
7. Completar Espacios

#### Módulo 2 - Comprensión Inferencial (5 mecánicas)
8. Detective Textual
9. Construcción de Hipótesis
10. Predicción Narrativa
11. Puzzle de Contexto
12. Rueda de Inferencias

#### Módulo 3 - Comprensión Crítica (5 mecánicas)
13. Análisis de Fuentes
14. Debate Digital
15. Matriz de Perspectivas
16. Podcast Argumentativo
17. Tribunal de Opiniones

#### Módulo 4 - Textos Digitales (9 mecánicas)
18. Verificador Fake News
19. Quiz TikTok
20. Navegación Hipertextual
21. Análisis de Memes
22. Infografía Interactiva
23. Email Formal
24. Chat Literario
25. Ensayo Argumentativo
26. Reseña Crítica

#### Módulo 5 - Producción Creativa (3 mecánicas)
27. Diario Multimedia
28. Cómic Digital
29. Video Carta

#### Mecánicas Auxiliares (4 mecánicas)
30. Call to Action
31. Collage de Prensa
32. Comprensión Auditiva
33. Texto en Movimiento

### 3.3 Zustand Stores (8 Total)

1. **authStore** - Autenticación y sesión
2. **gamificationStore** - ML Coins, rangos, logros
3. **progressStore** - Progreso de módulos y ejercicios
4. **exerciseStore** - Estado de ejercicios activos
5. **notificationStore** - Notificaciones en tiempo real
6. **socialStore** - Escuelas, aulas, equipos
7. **tenantStore** - Multi-tenancy
8. **uiStore** - Estado de UI global

---

## 4️⃣ MAPEO DE REFERENCIAS CRUZADAS

### 4.1 Backend Module → Database Schema

| Backend Module | Primary Schema(s) | Tables Used | Functions Used |
|----------------|-------------------|-------------|----------------|
| **auth** | auth_management, auth | profiles, sessions, refresh_tokens | create_user_profile(), authenticate_user() |
| **gamification** | gamification_system | user_stats, maya_ranks, ml_coins_*, achievements, missions | award_ml_coins(), unlock_achievement(), check_rank_requirements() |
| **educational** | educational_content | modules, lessons, exercises | get_module_progress() |
| **progress** | progress_tracking | module_progress, exercise_*, learning_sessions | record_exercise_attempt(), calculate_score() |
| **social** | social_features | schools, classrooms, teams, friendships | add_classroom_member() |
| **admin** | auth_management, system_configuration | profiles, organizations, system_settings | check_user_permissions() |
| **teacher** | social_features, progress_tracking | classrooms, classroom_members, module_progress | get_module_progress() |
| **notifications** | audit_logging (indirectly) | - | - |
| **assignments** | educational_content, progress_tracking | exercises, exercise_submissions | submit_exercise() |
| **missions** | gamification_system | missions, user_missions | create_mission(), update_mission_progress() |
| **powerups** | gamification_system | power_ups, user_power_ups | activate_power_up(), deactivate_power_up() |
| **content** | content_management | marie_curie_content, media_files | - |
| **audit** | audit_logging | audit_logs, api_logs, security_events | log_audit_event() |

### 4.2 API Endpoint → Backend Controller → Service

**Ejemplo: Submit Exercise**
```
POST /api/progress/submissions
  → progress/exercise-submission.controller.ts
    → SubmissionService.submitExercise()
      → ExerciseRepository.findById()
      → ScoreService.calculateScore()
      → GamificationService.awardMLCoins()
      → DB: progress_tracking.exercise_submissions (INSERT)
      → DB: gamification_system.ml_coins_transactions (INSERT)
```

### 4.3 Frontend Feature → Backend API → Database

**Ejemplo: Resolver Ejercicio**
```
Frontend: features/mechanics/module1/Crucigrama/
  → API: POST /api/progress/submissions
    → Backend: progress/SubmissionService
      → DB: progress_tracking.exercise_submissions
      → DB: gamification_system.ml_coins_transactions
```

---

## 5️⃣ GAPS IDENTIFICADOS

### 5.1 Documentación Faltante

| Componente | Estado | Prioridad | Esfuerzo |
|------------|--------|-----------|----------|
| Módulo assignments | ❌ Sin documentar | 🔴 Alta | 2h |
| Módulo audit | ❌ Sin documentar | 🔴 Alta | 2h |
| Módulo mail | ❌ Sin documentar | 🟡 Media | 1h |
| Módulo tasks | ❌ Sin documentar | 🟡 Media | 1h |
| Schemas faltantes (5) | ⚠️ Parcial | 🔴 Alta | 4h |
| Endpoints API (~300) | ⚠️ 21% cobertura | 🔴 Alta | 15h |

### 5.2 Posibles Duplicaciones

⚠️ **ÁREAS A REVISAR:**

1. **Gamification dividido en 3 módulos:**
   - `gamification/` (core)
   - `missions/` (separado)
   - `powerups/` (separado)
   - ❓ ¿Consolidar o mantener separado?

2. **Notifications dividido en 2 módulos:**
   - `notifications/` (in-app, push)
   - `mail/` (email)
   - ❓ ¿Consolidar o mantener separado?

3. **Content dividido en 2 módulos:**
   - `content/` (gestión de contenido)
   - `educational/` (módulos educativos)
   - ✅ Separación justificada (diferentes dominios)

---

## 6️⃣ PRÓXIMOS PASOS

### Fase 1 - Inventario Detallado (En Progreso)
- [x] Contar módulos, controladores, servicios
- [x] Contar objetos de base de datos por schema
- [ ] Extraer todos los endpoints con decoradores HTTP
- [ ] Listar todos los DTOs y tipos
- [ ] Mapear relaciones entre módulos

### Fase 2 - Documentación de Gaps
- [ ] Documentar módulos faltantes (assignments, audit, mail, tasks)
- [ ] Documentar schemas faltantes (5 schemas)
- [ ] Completar documentación de endpoints API (300+)

### Fase 3 - Matriz de Trazabilidad
- [ ] Crear matriz completa: API → Controller → Service → Repository → DB
- [ ] Actualizar archivos de trazabilidad existentes
- [ ] Crear _MAP.md en subcarpetas faltantes

---

**Documento Vivo:** Este inventario será actualizado continuamente conforme se descubran más componentes.

**Última actualización:** 2025-11-07
**Próxima revisión:** Semanal
