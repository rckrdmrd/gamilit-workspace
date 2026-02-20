# FASE 1: Analisis Comparativo de Seeds — DEV vs PROD vs STAGING

**Fecha:** 2026-02-19
**Tarea:** TASK-2026-02-19-ANALISIS-DEPLOY-PROD
**Autor:** Agente SIMCO (Claude Opus 4.6)
**Version:** 1.0.0

---

## 1. RESUMEN EJECUTIVO

| Metrica | DEV | PROD | STAGING |
|---------|-----|------|---------|
| **Archivos .sql (sin _testing/_backlog)** | 107 | 71 | 61 |
| **Archivos en _testing/** | 4 | 4 | 0 |
| **Archivos en _backlog/** | 2 | 2 | 0 |
| **Total archivos .sql** | 113 | 77 | 61 |
| **Archivo raiz (00-dev-testing-student)** | 1 | 0 | 0 |
| **Schemas con seeds** | 13 | 13 | 12 |
| **Config (.conf) disponible** | SI | SI | NO |
| **ENV_LOAD_DEMO_DATA** | true | false | N/A (sin .conf) |

**Hallazgo principal:** PROD tiene **2 archivos con prefijo duplicado 17-** en `gamification_system/`. STAGING tiene **2 archivos con prefijo duplicado 17-** tambien. Ambos son errores de numeracion con riesgo de colision si los archivos se cargan por orden de nombre.

---

## 2. INVENTARIO COMPLETO POR SCHEMA

### 2.1 admin_dashboard/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-bulk_operations.sql | SI | SI | NO | `all\|core` | DIFERENTE (md5 dev!=prod) |
| 2 | 02-admin_reports.sql | SI | SI | NO | `all\|core` | DIFERENTE (md5 dev!=prod) |

**Discrepancias:**
- STAGING no tiene carpeta `admin_dashboard/` — pero init-database.sh la declara con scope `all|core`
- DEV y PROD tienen contenido diferente

---

### 2.2 audit_logging/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-activity_log_sample.sql | SI | NO | NO | NO en pipeline | N/A |
| 2 | 01-audit-logs.sql | SI | NO | NO | `dev\|demo_data` | N/A |
| 3 | 01-default-config.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 4 | 02-system-metrics.sql | SI | NO | NO | `dev\|demo_data` | N/A |
| 5 | 03-pending_user_initialization.sql | SI | NO | NO | NO en pipeline | N/A |

**Discrepancias:**
- `01-activity_log_sample.sql` existe en DEV pero NO esta en el pipeline de init-database.sh
- `03-pending_user_initialization.sql` existe en DEV pero NO esta en el pipeline

---

### 2.3 auth/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-demo-users.sql | SI | SI | SI | `all\|demo_users` | IDENTICO (3 envs) |
| 2 | 01b-demo-students.sql | SI | NO | NO | `dev\|demo_users` | N/A |
| 3 | 02-production-users.sql | SI | SI | NO | `all\|core` | IDENTICO (dev==prod) |

**Discrepancias:**
- `02-production-users.sql` falta en STAGING — pero scope es `all|core`
- `01b-demo-students.sql` correctamente solo en DEV (scope `dev`)

---

### 2.4 auth_management/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-tenants.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 2 | 02-auth_providers.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 3 | 02-tenants-production.sql | SI | SI | NO | `all\|core` | IDENTICO (dev==prod) |
| 4 | 03-profiles.sql | SI | NO | SI | `dev\|demo_data` | IDENTICO (dev==stg) |
| 5 | 04-profiles-complete.sql | SI | SI | NO | `all\|core` | IDENTICO (dev==prod) |
| 6 | 04-user_roles.sql | SI | NO | SI | `dev\|demo_data` | DIFERENTE (dev!=stg) |
| 7 | 05-user_preferences.sql | SI | NO | NO | `dev\|demo_data` | N/A |
| 8 | 06-auth_attempts.sql | SI | NO | NO | `dev\|demo_data` | N/A |
| 9 | 06-profiles-production.sql | SI | SI | NO | `all\|core` | **DIFERENTE** (dev!=prod) |
| 10 | 07-profiles-production-additional.sql | SI | SI | NO | `all\|core` | IDENTICO (dev==prod) |
| 11 | 07-security_events.sql | SI | NO | NO | `dev\|demo_data` | N/A |
| 12 | 07-user_roles.sql | SI | SI | NO | `all\|core` | IDENTICO (dev==prod) |
| 13 | 08-assign-admin-schools.sql | SI | SI | NO | `all\|core` | IDENTICO (dev==prod) |

**Discrepancias:**
- `06-profiles-production.sql` tiene contenido DIFERENTE entre dev y prod (md5: `65260...` vs `b2e32...`)
- Multiples archivos `all|core` faltan en STAGING: `02-tenants-production`, `04-profiles-complete`, `06-profiles-production`, `07-profiles-production-additional`, `07-user_roles`, `08-assign-admin-schools`
- STAGING tiene `03-profiles` y `04-user_roles` (scope `dev|demo_data`) pero le falta todo lo de produccion

---

### 2.5 communication/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-system-messages.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod/stg; prod==stg |
| 2 | 02-message_participants.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod/stg; prod==stg |

**Discrepancias:**
- Contenido difiere entre DEV y PROD/STAGING (mismos archivos, diferente contenido)

---

### 2.6 content_management/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-default-templates.sql | SI | SI | SI | `all\|core` **(RE-HABILITADO 2026-02-20)** | IDENTICO (3 envs) |
| 2 | 01-marie-curie-bio.sql | SI | NO | NO | `dev\|demo_data` | N/A |
| 3 | 02-marie_curie_content.sql | SI | SI | SI | `prod\|core` | IDENTICO (3 envs) |
| 4 | 02-media-files.sql | SI | NO | NO | `dev\|demo_data` | N/A |
| 5 | 03-tags.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 6 | 04-moderation_rules.sql | SI | SI | SI | `all\|core` **(RE-HABILITADO 2026-02-20)** | IDENTICO (3 envs) |

**Discrepancias:**
- ~~`01-default-templates.sql` y `04-moderation_rules.sql` existen en los 3 envs pero estan EXCLUIDOS del pipeline~~ **RESUELTO** (SEED-HOMOLOGATION 2026-02-20: A1 fixed structure→template_structure, B2 fixed FK violation with dynamic lookup)
- `02-marie_curie_content.sql` tiene scope `prod|core` — pero existe en DEV y STAGING. Cuando se ejecuta en DEV con --env dev, este seed sera OMITIDO

---

### 2.7 educational_content/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-modules.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 2 | 02-exercises-module1.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 3 | 03-exercises-module2.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 4 | 04-exercises-module3.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 5 | 05-assignments.sql | SI | SI | SI | `all\|core` | DIFERENTE (dev != prod==stg) |
| 6 | 05-exercises-module4.sql | SI | SI | SI | `all\|core` | DIFERENTE (dev != prod==stg) |
| 7 | 06-exercises-module5.sql | SI | SI | SI | `all\|core` | DIFERENTE (dev != prod==stg) |
| 8 | 07-assessment-rubrics.sql | SI | SI | SI | `all\|core` | DIFERENTE (dev != prod==stg) |
| 9 | 08-difficulty_criteria.sql | SI | SI | SI | `all\|core` | DIFERENTE (dev != prod==stg) |
| 10 | 09-exercise_mechanic_mapping.sql | SI | SI | SI | `all\|core` | DIFERENTE (dev != prod==stg) |
| 11 | 10-exercise_validation_config.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 12 | 11-exercise_validation_config_m4_m5.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 13 | 11-module_dependencies.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 14 | 12-taxonomies.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 15 | 13-exercise_type_rubrics.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 16 | **14-classroom_modules.sql** | **NO** | **SI** | **NO** | `prod\|core` | Solo en PROD |

**Discrepancias:**
- `14-classroom_modules.sql` solo existe en PROD (scope `prod|core`) — CORRECTO, es prod-only
- 5 archivos (05 a 09) tienen contenido diferente en DEV vs PROD/STAGING (prod y staging son identicos entre si)

---

### 2.8 gamification_system/ (CRITICO)

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-achievement_categories.sql | SI | SI | SI | `all\|core` | dev==prod; stg DIFERENTE |
| 2 | 02-leaderboard_metadata.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod==stg |
| 3 | 03-maya_ranks.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 4 | 04-achievements.sql | SI | SI | SI | `all\|core` | dev DIFERENTE; prod DIFERENTE stg |
| 5 | 05-user_stats.sql | SI | SI | SI | `all\|core` | **DEV v2.2; PROD==STG v2.0** |
| 6 | 06-user_ranks.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 7 | 07-ml_coins_transactions.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod==stg |
| 8 | 08-user_achievements.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod==stg |
| 9 | 09-comodines_inventory.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 10 | 10-mission_templates.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod==stg |
| 11 | 12-shop_categories.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 12 | 13-shop_items.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 13 | 14-achievements-m3-m5.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 14 | 15-comodin_usage_tracking.sql | SI | SI | SI | `all\|core` | dev==stg; PROD DIFERENTE |
| 15 | **16-shop_items_expanded.sql** | **SI** | **NO** | **NO** | `dev\|core` | Solo DEV |
| 16 | 17-shop_items_metadata_normalization.sql | SI | SI | SI | `all\|core` | **3 versiones diferentes** |
| 17 | 18-user_purchases-demo.sql (DEV) | SI | - | - | `dev\|demo_gamification` | - |
| 17b | **17-user_purchases-demo.sql (PROD)** | - | **SI** | - | `dev\|demo_gamification` | - |
| 17c | **16-user_purchases-demo.sql (STG)** | - | - | **SI** | - | - |
| 18 | 19-user_equipped_items-demo.sql (DEV) | SI | - | - | `dev\|demo_gamification` | - |
| 18b | **18-user_equipped_items-demo.sql (PROD)** | - | **SI** | - | - | - |
| 18c | **17-user_equipped_items-demo.sql (STG)** | - | - | **SI** | - | - |
| 19 | 20-achievements-collection.sql | SI | SI | SI | `all\|core` | **3 versiones diferentes** |

#### Analisis de Numeracion Gamification (CRITICO)

| Concepto | DEV | PROD | STAGING |
|----------|-----|------|---------|
| shop_items_expanded | **16** | NO EXISTE | NO EXISTE |
| shop_items_metadata_normalization | **17** | **17** | **17** |
| user_purchases-demo | **18** | **17** (DUPLICADO!) | **16** |
| user_equipped_items-demo | **19** | **18** | **17** (DUPLICADO!) |
| achievements-collection | **20** | **20** | **20** |

**PROD tiene 2 archivos con prefijo `17-`:**
1. `17-shop_items_metadata_normalization.sql` (Order: 16 segun header)
2. `17-user_purchases-demo.sql` (Order: 17 segun header)

**STAGING tiene 2 archivos con prefijo `17-`:**
1. `17-shop_items_metadata_normalization.sql` (Order: 15 segun header)
2. `17-user_equipped_items-demo.sql` (Order: 17 segun header)

**NOTA:** El pipeline init-database.sh usa la lista ordenada del array `seed_entries[]`, NO el listado del directorio, por lo que la numeracion duplicada en archivos NO afecta la ejecucion via init-database.sh. Sin embargo, si alguien usa scripts que cargan por orden de directorio (como `load-dev-seeds.sh` o carga manual), la ambiguedad es real.

---

### 2.9 lti_integration/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-lti_consumers.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod==stg |
| 2 | 02-lti_sessions.sql | SI | NO | NO | NO en pipeline | N/A |
| 3 | 03-lti_grade_passback.sql | SI | NO | NO | NO en pipeline | N/A |

**Discrepancias:**
- `02-lti_sessions.sql` y `03-lti_grade_passback.sql` existen en DEV pero NO estan en el pipeline

---

### 2.10 notifications/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-notification_templates.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod==stg |
| 2 | 02-notification_preferences_defaults.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod==stg |
| 3 | 02-notification_templates_i18n.sql | SI | NO | NO | NO en pipeline | N/A |
| 4 | 02-user_devices_dev.sql | SI | NO | NO | `dev\|demo_data` | N/A |
| 5 | 03-notifications.sql | SI | NO | NO | NO en pipeline | N/A |
| 6 | 04-notification_logs.sql | SI | NO | NO | NO en pipeline | N/A |
| 7 | 05-notification_queue.sql | SI | NO | NO | NO en pipeline | N/A |

**Discrepancias:**
- 4 archivos DEV-only NO estan en el pipeline de init-database.sh (`02-notification_templates_i18n`, `03-notifications`, `04-notification_logs`, `05-notification_queue`)

---

### 2.11 progress_tracking/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-module_progress.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 2 | 01-demo-progress.sql | SI | NO | NO | `dev\|demo_exercises` | N/A |
| 3 | 02-exercise-attempts.sql | SI | NO | NO | `dev\|demo_exercises` | N/A |
| 4 | 03-manual-reviews.sql | SI | NO | NO | `dev\|demo_exercises` | N/A |
| 5 | 04-learning-paths.sql | SI | NO | NO | NO en pipeline | N/A |
| 6 | 05-user-learning-paths.sql | SI | NO | NO | NO en pipeline | N/A |
| 7 | 06-user-difficulty-progress.sql | SI | NO | NO | NO en pipeline | N/A |
| 8 | 07-user-current-level.sql | SI | NO | NO | NO en pipeline | N/A |
| 9 | 08-teacher-notes.sql | SI | NO | NO | NO en pipeline | N/A |
| 10 | 09-skill-assessments.sql | SI | NO | NO | NO en pipeline | N/A |
| 11 | 10-mastery-tracking.sql | SI | NO | NO | NO en pipeline | N/A |
| 12 | 11-engagement-metrics.sql | SI | NO | NO | NO en pipeline | N/A |
| 13 | 12-progress-snapshots.sql | SI | NO | NO | NO en pipeline | N/A |
| 14 | 13-module-completion-tracking.sql | SI | NO | NO | NO en pipeline | N/A |
| 15 | 14-scheduled-missions.sql | SI | NO | NO | NO en pipeline | N/A |

**Discrepancias:**
- 10 archivos DEV-only NO estan en el pipeline (04 a 14)
- Solo 3 archivos DEV-only (01-demo, 02, 03) estan en el pipeline con scope `dev|demo_exercises`

---

### 2.12 social_features/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 00-schools-default.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 2 | 01-schools.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 3 | 02-classrooms.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod==stg |
| 4 | 03-classroom-members.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 5 | 04-friendships.sql | SI | SI | SI | `dev\|demo_data` | IDENTICO (3 envs) |
| 6 | 04-teams.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod==stg |
| 7 | 05-teacher-reports.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 8 | 06-team_members.sql | SI | NO | NO | NO en pipeline | N/A |
| 9 | 07-friend_requests.sql | SI | NO | NO | NO en pipeline | N/A |
| 10 | 08-peer_challenges.sql | SI | SI | NO | NO en pipeline | dev DIFERENTE de prod |
| 11 | 09-challenge_participants.sql | SI | NO | NO | NO en pipeline | N/A |
| 12 | 10-team_challenges.sql | SI | SI | NO | NO en pipeline | dev DIFERENTE de prod |

**Discrepancias:**
- `08-peer_challenges.sql` y `10-team_challenges.sql` existen en PROD pero NO estan en el pipeline
- 5 archivos DEV-only (06-09 + 10) NO estan en el pipeline
- `04-friendships.sql` existe en PROD y STAGING pero scope es `dev|demo_data` — no se cargaria en esos envs

---

### 2.13 system_configuration/

| # | Archivo | DEV | PROD | STAGING | Scope (init-db.sh) | Content Match |
|---|---------|-----|------|---------|---------------------|---------------|
| 1 | 01-feature_flags_seeds.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 2 | 01-system_settings.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 3 | 02-feature_flags.sql | SI | NO | NO | `dev\|demo_data` | N/A |
| 4 | 02-gamification_parameters_seeds.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |
| 5 | 03-notification_settings_global.sql | SI | SI | SI | `all\|core` | dev DIFERENTE de prod==stg |
| 6 | 04-rate_limits.sql | SI | SI | SI | `all\|core` | IDENTICO (3 envs) |

---

## 3. PIPELINE init-database.sh: SEED ENTRIES COMPLETO

Total entries en el array `seed_entries[]`: **82 entradas**

### 3.1 Por Scope

| Scope | Cantidad | Seeds |
|-------|----------|-------|
| `all` | 57 | Core seeds que se cargan en todos los ambientes |
| `dev` | 22 | Demo data solo para desarrollo |
| `prod` | 2 | `content_management/02-marie_curie_content.sql`, `educational_content/14-classroom_modules.sql` |

**NOTA:** No existe scope `staging` en el array. STAGING usaria las mismas entradas `all` si tuviera un .conf, pero **no tiene staging.conf** creado.

### 3.2 Por Categoria

| Categoria | Cantidad |
|-----------|----------|
| `core` | 59 |
| `demo_users` | 3 |
| `demo_data` | 14 |
| `demo_exercises` | 3 |
| `demo_gamification` | 2 |

### 3.3 Seeds En Archivos Pero NO En Pipeline

Estos archivos existen en el directorio pero NO estan declarados en `seed_entries[]`:

| Archivo | Entornos | Razon |
|---------|----------|-------|
| `audit_logging/01-activity_log_sample.sql` | DEV | No registrado |
| `audit_logging/03-pending_user_initialization.sql` | DEV | No registrado |
| `content_management/01-default-templates.sql` | 3 envs | ~~EXCLUIDO~~ **RE-HABILITADO** (SEED-HOMOLOGATION A1) |
| `content_management/04-moderation_rules.sql` | 3 envs | ~~EXCLUIDO~~ **RE-HABILITADO** (SEED-HOMOLOGATION B2) |
| `lti_integration/02-lti_sessions.sql` | DEV | No registrado |
| `lti_integration/03-lti_grade_passback.sql` | DEV | No registrado |
| `notifications/02-notification_templates_i18n.sql` | DEV | No registrado |
| `notifications/03-notifications.sql` | DEV | No registrado |
| `notifications/04-notification_logs.sql` | DEV | No registrado |
| `notifications/05-notification_queue.sql` | DEV | No registrado |
| `progress_tracking/04-learning-paths.sql` | DEV | No registrado |
| `progress_tracking/05-user-learning-paths.sql` | DEV | No registrado |
| `progress_tracking/06-user-difficulty-progress.sql` | DEV | No registrado |
| `progress_tracking/07-user-current-level.sql` | DEV | No registrado |
| `progress_tracking/08-teacher-notes.sql` | DEV | No registrado |
| `progress_tracking/09-skill-assessments.sql` | DEV | No registrado |
| `progress_tracking/10-mastery-tracking.sql` | DEV | No registrado |
| `progress_tracking/11-engagement-metrics.sql` | DEV | No registrado |
| `progress_tracking/12-progress-snapshots.sql` | DEV | No registrado |
| `progress_tracking/13-module-completion-tracking.sql` | DEV | No registrado |
| `progress_tracking/14-scheduled-missions.sql` | DEV | No registrado |
| `social_features/06-team_members.sql` | DEV | No registrado |
| `social_features/07-friend_requests.sql` | DEV | No registrado |
| `social_features/08-peer_challenges.sql` | DEV, PROD | No registrado |
| `social_features/09-challenge_participants.sql` | DEV | No registrado |
| `social_features/10-team_challenges.sql` | DEV, PROD | No registrado |
| `00-dev-testing-student.sql` (raiz) | DEV | No registrado |

**Total: 27 archivos no en pipeline** (25 DEV-only + 2 en DEV+PROD)

---

## 4. ARCHIVOS CON CONTENIDO DIFERENTE (Mismo Nombre, Distinto MD5)

### 4.1 DEV != PROD (mismo nombre)

| Schema | Archivo | DEV MD5 | PROD MD5 |
|--------|---------|---------|----------|
| admin_dashboard | 01-bulk_operations.sql | `018f41d...` | `c7f21fd...` |
| admin_dashboard | 02-admin_reports.sql | `3dc762a...` | `f5e0330...` |
| auth_management | 06-profiles-production.sql | `65260f2...` | `b2e3254...` |
| communication | 01-system-messages.sql | `aa3114b...` | `514ac58...` |
| communication | 02-message_participants.sql | `ba6c831...` | `521e036...` |
| educational_content | 05-assignments.sql | `041016b...` | `3608406...` |
| educational_content | 05-exercises-module4.sql | `f6663b3...` | `b0db60b...` |
| educational_content | 06-exercises-module5.sql | `2fde699...` | `6edc39b...` |
| educational_content | 07-assessment-rubrics.sql | `cb5a6de...` | `05dcd7c...` |
| educational_content | 08-difficulty_criteria.sql | `29cf087...` | `4555eef...` |
| educational_content | 09-exercise_mechanic_mapping.sql | `64e20c3...` | `a49d7d0...` |
| gamification_system | 02-leaderboard_metadata.sql | `2c99fe3...` | `0895c70...` |
| gamification_system | 04-achievements.sql | `0d38fcc...` | `bf1a5ad...` |
| gamification_system | 05-user_stats.sql | `93af164...` | `8ebef21...` |
| gamification_system | 07-ml_coins_transactions.sql | `28b17b6...` | `dc869f8...` |
| gamification_system | 08-user_achievements.sql | `046be8d...` | `097eef5...` |
| gamification_system | 10-mission_templates.sql | `09805ce...` | `68d621d...` |
| gamification_system | 15-comodin_usage_tracking.sql | `4cb8213...` | `77fac23...` |
| gamification_system | 17-shop_items_metadata_normalization.sql | `7e0b738...` | `a5b0c25...` |
| gamification_system | 20-achievements-collection.sql | `5ea1b25...` | `3dc123e...` |
| lti_integration | 01-lti_consumers.sql | `fdf2be8...` | `3bc78b0...` |
| notifications | 01-notification_templates.sql | `4a26c67...` | `0e99402...` |
| notifications | 02-notification_preferences_defaults.sql | `10e2b6b...` | `daeba29...` |
| social_features | 02-classrooms.sql | `d974113...` | `cb58c6b...` |
| social_features | 04-teams.sql | `ecb5b15...` | `2d59de5...` |
| system_configuration | 03-notification_settings_global.sql | `e088a0f...` | `c9bb438...` |

**Total: 26 archivos con contenido diferente entre DEV y PROD**

### 4.2 DEV != STAGING (mismo nombre)

| Schema | Archivo | Nota |
|--------|---------|------|
| auth_management | 04-user_roles.sql | Diferente |
| gamification_system | 01-achievement_categories.sql | dev==prod pero stg DIFERENTE |
| gamification_system | 02-leaderboard_metadata.sql | Diferente |
| gamification_system | 04-achievements.sql | 3 versiones diferentes |
| gamification_system | 05-user_stats.sql | DEV v2.2, STG v2.0 |
| gamification_system | 07-ml_coins_transactions.sql | Diferente |
| gamification_system | 08-user_achievements.sql | Diferente |
| gamification_system | 10-mission_templates.sql | Diferente |
| gamification_system | 17-shop_items_metadata_normalization.sql | 3 versiones diferentes |
| gamification_system | 20-achievements-collection.sql | 3 versiones diferentes |

Mas todos los que difieren en DEV vs PROD donde STAGING es igual a PROD.

### 4.3 PROD vs STAGING Content Match

En general, PROD y STAGING comparten contenido identico para la gran mayoria de archivos. Las excepciones son:

| Schema | Archivo | Nota |
|--------|---------|------|
| gamification_system | 01-achievement_categories.sql | PROD != STG |
| gamification_system | 04-achievements.sql | PROD != STG |
| gamification_system | 15-comodin_usage_tracking.sql | dev==stg pero PROD diferente |
| gamification_system | 17-shop_items_metadata_normalization.sql | 3 versiones distintas |
| gamification_system | 20-achievements-collection.sql | 3 versiones distintas |

---

## 5. DISCREPANCIAS CLASIFICADAS

### CRITICA (Riesgo de fallo en deploy o datos corruptos)

| ID | Descripcion | Detalle |
|----|-------------|---------|
| C-01 | **PROD: Prefijo duplicado 17-** en gamification_system | `17-shop_items_metadata_normalization.sql` y `17-user_purchases-demo.sql` — ambiguedad si se usa carga por directorio |
| C-02 | **STAGING: Prefijo duplicado 17-** en gamification_system | `17-shop_items_metadata_normalization.sql` y `17-user_equipped_items-demo.sql` — misma ambiguedad |
| C-03 | **05-user_stats.sql desactualizado en PROD/STAGING** | DEV tiene v2.2 (REC-009 FIX: template_id UUID + dynamic lookups), PROD/STAGING siguen en v2.0. Deploy a prod con DDL nuevo + seed viejo = potencial FK violation |
| C-04 | **staging.conf NO EXISTE** | Sin archivo de configuracion para staging, init-database.sh no puede configurar SEEDS_DIR para staging. El script caeria al default `seeds/` que no tiene archivos directos |

### ALTA (Datos inconsistentes entre ambientes)

| ID | Descripcion | Detalle |
|----|-------------|---------|
| A-01 | **26 archivos con contenido diferente** entre DEV y PROD | Seeds `all\|core` divergen — riesgo de datos diferentes post-recreacion |
| A-02 | **06-profiles-production.sql** difiere entre DEV y PROD | Este es un seed `all\|core` con perfiles de produccion — debe ser identico |
| A-03 | **STAGING falta archivos `all\|core`** | 8+ archivos core faltan en staging: `admin_dashboard/*`, `auth/02-production-users`, `auth_management/02-tenants-production`, `04-profiles-complete`, `06-profiles-production`, `07-profiles-production-additional`, `07-user_roles`, `08-assign-admin-schools` |
| A-04 | **user_purchases/equipped scopes incorrectos** | En init-database.sh: `18-user_purchases-demo.sql\|dev\|demo_gamification` y `19-user_equipped_items-demo.sql\|dev\|demo_gamification`. Pero los archivos EXISTEN en prod (como 17-/18-) y en staging (como 16-/17-). El pipeline NO los cargara en prod/staging por scope=dev, pero los archivos estan ahi con nombres prod/staging-specificos |
| A-05 | **17-shop_items_metadata_normalization** tiene 3 versiones diferentes | DEV, PROD, STAGING todos tienen contenido distinto, pero se carga como `all\|core` |

### MEDIA (Inconsistencia documental o limpieza pendiente)

| ID | Descripcion | Detalle |
|----|-------------|---------|
| M-01 | **27 archivos no en pipeline** | Existen en disco pero no se cargan via init-database.sh. Algunos son demos (ok), otros parecen seeds funcionales olvidados |
| M-02 | ~~**2 seeds excluidos existen en 3 envs**~~ | ~~`01-default-templates.sql` y `04-moderation_rules.sql` — archivos muertos~~ **RESUELTO** (SEED-HOMOLOGATION 2026-02-20) |
| M-03 | **social_features seeds en PROD no en pipeline** | `08-peer_challenges.sql` y `10-team_challenges.sql` existen en PROD pero no se cargan |
| M-04 | **04-friendships.sql en prod/staging innecesario** | Existe en los 3 envs pero scope=`dev\|demo_data`, nunca se carga en prod |
| M-05 | **Numeracion interna vs nombre archivo** | En PROD, `17-shop_items_metadata_normalization` tiene `Order: 16` en header. En STAGING tiene `Order: 15`. La numeracion interna no coincide con el nombre del archivo |

### BAJA (Mejoras de higiene)

| ID | Descripcion | Detalle |
|----|-------------|---------|
| B-01 | **No hay seed #11** en gamification_system | Todos los envs saltan de 10 a 12 |
| B-02 | **_testing/ en PROD** | Directorio `_testing/` con 4 archivos de test existe en PROD (no deberia estar ahi) |
| B-03 | **_backlog/ en PROD** | Directorio `_backlog/` con 2 archivos existe en PROD |
| B-04 | **02-marie_curie_content.sql scope confusion** | Scope es `prod\|core` pero archivo existe en DEV y STAGING tambien. DEV nunca lo carga; STAGING tampoco |
| B-05 | **00-dev-testing-student.sql en raiz de DEV** | Archivo suelto fuera de cualquier schema subdirectory, no en pipeline |

---

## 6. CONTEOS FINALES

### Seeds que se cargan efectivamente por ambiente (via init-database.sh)

| Scope Filter | DEV (--env dev) | PROD (--env prod) |
|--------------|-----------------|-------------------|
| `all` seeds | 57 | 57 |
| `dev` seeds | 22 | 0 |
| `prod` seeds | 0 | 2 |
| **TOTAL CARGADOS** | **79** | **59** |
| demo_data=false exclude | N/A | -14 (demo_users, demo_data, demo_exercises, demo_gamification) |
| **TOTAL PROD EFECTIVO** | - | **59** (all:57 + prod:2) |

**STAGING:** Sin `staging.conf`, el script no sabe apuntar a `seeds/staging/`. Si se ejecutara con default, usaria `seeds/` (raiz) que no tiene seeds SQL directos. **STAGING NO PUEDE EJECUTARSE VIA init-database.sh actualmente.**

### Archivos fisicos en disco (excluyendo _testing, _backlog, y archivos no-.sql)

| Ambiente | Archivos .sql | En pipeline | No en pipeline |
|----------|---------------|-------------|----------------|
| DEV | 107 + 1 raiz = 108 | 79 (con scope dev) | 29 |
| PROD | 71 | 59 (con scope all+prod) | 12 |
| STAGING | 61 | 0 (sin .conf) | 61 |

---

## 7. RECOMENDACIONES PRIORITARIAS

1. **[CRITICA] Crear staging.conf** con `ENV_SEEDS_DIR="seeds/staging"` para habilitar staging
2. **[CRITICA] Sincronizar 05-user_stats.sql** — copiar DEV v2.2 a PROD y STAGING (fix REC-009)
3. **[CRITICA] Renumerar gamification PROD:** `17-user_purchases-demo.sql` -> `18-user_purchases-demo.sql`, `18-user_equipped_items-demo.sql` -> `19-user_equipped_items-demo.sql` (igualar a DEV)
4. **[CRITICA] Renumerar gamification STAGING:** `16-user_purchases-demo.sql` -> `18-user_purchases-demo.sql`, `17-user_equipped_items-demo.sql` -> `19-user_equipped_items-demo.sql`
5. **[ALTA] Sincronizar seeds `all|core`** — los 26 archivos con contenido diferente entre DEV y PROD deben alinearse (decidir cual es la version canonica)
6. **[ALTA] Completar STAGING** con los archivos `all|core` faltantes (admin_dashboard, auth, auth_management)
7. **[MEDIA] Limpiar archivos muertos** — eliminar `_testing/` y `_backlog/` de PROD, eliminar seeds excluidos del pipeline
8. **[BAJA] Documentar seeds no-pipeline** — decidir si los 27 archivos huerfanos deben agregarse al pipeline o eliminarse

---

*Generado automaticamente por agente SIMCO — 2026-02-19*
