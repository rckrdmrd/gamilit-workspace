# Schema Reference - Utilidades

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## Materialized Views (7)

### leaderboard.classroom_rankings
```sql
CREATE MATERIALIZED VIEW leaderboard.classroom_rankings AS
SELECT
  le.student_id, le.classroom_id, le.tenant_id,
  le.total_xp, le.exercises_completed, le.average_score,
  ROW_NUMBER() OVER (PARTITION BY le.classroom_id ORDER BY le.total_xp DESC) AS position,
  u.first_name, u.last_name, u.avatar_url,
  sg.current_rank, sg.current_level
FROM leaderboard.leaderboard_entries le
JOIN auth.users u ON le.student_id = u.id
JOIN gamification_system.student_gamification sg ON le.student_id = sg.student_id
WHERE le.scope = 'classroom';
-- REFRESH: CONCURRENTLY cada 5 min
```

### leaderboard.school_rankings
Rankings por escuela (REFRESH: 15 min).

### analytics.student_daily_stats
Estadisticas diarias pre-calculadas (REFRESH: 1 hora).

### analytics.module_completion_rates
Tasa de completitud por modulo educativo (REFRESH: 1 hora).

### analytics.engagement_dashboard
Metricas de engagement consolidadas (REFRESH: 30 min).

### analytics.teacher_classroom_overview
Vista general para dashboard de maestro (REFRESH: 15 min).

### leaderboard.global_leaderboard
Ranking global entre todas las escuelas (REFRESH: 15 min).

---

## ENUMs (42)

| # | ENUM | Valores |
|---|------|---------|
| 1 | user_role | student, teacher, admin, parent, super_admin |
| 2 | educational_module_type | literal, inferential, critical, digital, production |
| 3 | exercise_type | crossword, timeline, fill_blanks, true_false, word_search, detective, hypothesis, prediction, context_puzzle, inference_wheel, opinion_court, digital_debate, source_analysis, argumentative_podcast, perspectives_matrix, fake_news_verifier, interactive_infographic, tiktok_quiz, hypertextual_navigation, meme_analysis, multimedia_diary, digital_comic, video_letter |
| 4 | difficulty_level | easy, medium, hard, expert |
| 5 | rank_type | ahkin, nacom, batab, halach_uinik, ajaw |
| 6 | xp_source_type | exercise, mission, achievement, bonus, streak |
| 7 | achievement_category | academic, consistency, social, exploration, secret |
| 8 | achievement_rarity | common, uncommon, rare, epic, legendary |
| 9 | store_item_type | avatar, frame, background, powerup, effect, title |
| 10 | item_duration_type | permanent, temporary, single_use |
| 11 | notification_channel | in_app, email, push, sms |
| 12 | notification_priority | low, medium, high, urgent |
| 13 | notification_status | pending, queued, sent, delivered, failed, read |
| 14 | mission_type | daily, weekly, quest |
| 15 | mission_status | active, completed, expired |
| 16 | quest_status | in_progress, completed, abandoned |
| 17 | interaction_type | like, reaction, comment, share |
| 18 | report_format | pdf, excel, csv |
| 19 | report_status | pending, generating, completed, failed |
| 20 | audit_action | create, update, delete, login, logout |
| 21 | content_status | draft, published, archived |
| 22 | assignment_status | active, completed, cancelled, expired |
| 23 | submission_status | pending, in_progress, submitted, evaluated, returned |
| 24 | review_status | pending, approved, rejected, revision_requested |
| 25 | season_status | upcoming, active, ended |
| 26 | team_status | active, inactive, disbanded |
| 27 | link_status | pending, active, revoked |
| 28 | subscription_plan | free, basic, premium, enterprise |
| 29 | feature_flag_type | boolean, percentage, user_list |
| 30 | exercise_evaluation_mode | automatic, semi_automatic, manual |
| 31 | score_quality | poor, average, good, excellent |
| 32 | streak_status | active, broken, completed |
| 33 | powerup_type | xp_boost, time_extension, hint, shield |
| 34 | powerup_status | available, active, used, expired |
| 35 | media_type | image, audio, video, document |
| 36 | classroom_status | active, inactive, archived |
| 37 | alert_severity | info, warning, error, critical |
| 38 | alert_status | active, acknowledged, resolved, ignored |

---

## Indices de Referencia Rapida

### Indices Unicos Criticos
| Tabla | Columnas | Proposito |
|-------|----------|-----------|
| auth.users | (email, tenant_id) | Email unico por tenant |
| tenants.tenants | (slug) | Slug unico global |
| tenants.tenant_members | (tenant_id, user_id) | Un registro por usuario-tenant |
| educational_content.module_progress | (student_id, module_id, tenant_id) | Un progreso por modulo |
| gamification_system.student_gamification | (student_id, tenant_id) | Un registro por estudiante |
| gamification_system.daily_xp_limits | (student_id, date, tenant_id) | Un limite por dia |
| analytics.analytics_daily | (student_id, date, tenant_id) | Un resumen por dia |
| store.ml_coin_balances | (student_id, tenant_id) | Un saldo por estudiante |
| parents.parent_student_links | (parent_id, student_id, tenant_id) | Una vinculacion |
| settings.feature_flags | (tenant_id, flag_name) | Un flag por nombre-tenant |
| classrooms.classrooms | (code, tenant_id) | Codigo unico por tenant |
| parents.link_codes | (code) | Codigo unico global |

### Indices de Performance
| Tabla | Columnas | Proposito |
|-------|----------|-----------|
| gamification_system.xp_transactions | (student_id, created_at) | Historial XP |
| educational_content.exercise_attempts | (student_id, exercise_id) | Busqueda de intentos |
| analytics.analytics_events | (event_type, created_at) | Busqueda por tipo |
| leaderboard.leaderboard_entries | (tenant_id, scope, total_xp) | Rankings |

---

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Modelo conceptual | [MODELO-DATOS.md](../MODELO-DATOS.md) |
| Inventario BD | orchestration/inventarios/DATABASE_INVENTORY.yml |
| ADR Multi-tenancy | [ADR-003-RLS-MULTITENANCY.md](../../90-adr/ADR-003-RLS-MULTITENANCY.md) |
| ADR Exercise Engine | [ADR-004-MODULAR-EXERCISE-ENGINE.md](../../90-adr/ADR-004-MODULAR-EXERCISE-ENGINE.md) |
| User Stories | docs/10-requirements/user-stories/ |

---

*GAMILIT - Schema Reference Utilities*
*173 tablas | 18 schemas | 251 RLS policies (DDL) | 42 ENUMs | PostgreSQL 15*
