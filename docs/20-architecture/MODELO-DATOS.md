# Modelo de Datos - GAMILIT

**Version:** 1.1.0
**Fecha:** 2026-02-12

---

> **NOTA IMPORTANTE (2026-02-12):** Este documento describe el modelo de datos a nivel **conceptual**.
> Los nombres de schemas, tablas y funciones son **descripciones de dominio**, no nombres DDL exactos.
> Para el mapeo preciso conceptual-a-fisico, ver la seccion "Mapeo Conceptual a Fisico" al final
> de este documento, y consultar `COHERENCE-ENTITIES-DDL.md` para el mapeo entity-por-entity verificado.

---

## Resumen

| Metrica | Valor |
|---------|-------|
| Schemas | 18 (16 activos + 2 placeholder) |
| Tablas | 169 |
| Views | 22 |
| Materialized Views | 7 |
| Functions | 183 |
| Triggers | 67 (CREATE TRIGGER) / 126 (trigger functions) |
| RLS Policies | 207 |
| Foreign Keys | 298 |
| ENUMs | 42 |

---

## Schemas (18)

### 1. auth
**Descripcion:** Autenticacion, usuarios, sesiones, tokens.
**Tablas principales:**

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| users | Usuarios del sistema (todos los roles) | Si |
| user_profiles | Perfiles extendidos por rol | Si |
| user_preferences | Preferencias de usuario | Si |
| sessions | Sesiones activas | Si |
| refresh_tokens | Tokens de refresco | Si |
| oauth_connections | Conexiones OAuth externas | Si |
| password_resets | Solicitudes de reset de password | Si |
| login_attempts | Intentos de login (seguridad) | Si |

**Functions:** validate_user_role(), hash_password(), generate_refresh_token()
**Triggers:** tr_user_created, tr_login_attempt_check

---

### 2. tenants
**Descripcion:** Multi-tenancy, escuelas, configuraciones por tenant.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| tenants | Registro de escuelas/instituciones | No |
| tenant_settings | Configuracion por tenant | Si |
| tenant_subscriptions | Planes y suscripciones | Si |
| tenant_members | Relacion usuario-tenant | Si |

**Functions:** get_current_tenant(), set_tenant_context(), validate_tenant_access()
**Triggers:** tr_tenant_created_setup

---

### 3. education
**Descripcion:** Modulos educativos, ejercicios, contenido.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| educational_modules | 5 modulos (literal, inferencial, etc.) | No |
| module_progress | Progreso por modulo por estudiante | Si |
| exercises | Catalogo de ejercicios | Si* |
| exercise_types | 23 tipos de ejercicio | No |
| exercise_attempts | Intentos de ejercicio | Si |
| exercise_results | Resultados evaluados | Si |
| exercise_feedback | Retroalimentacion | Si |
| contents | Lecturas y material educativo | Si* |
| content_versions | Versiones de contenido | Si |
| content_categories | Categorias de contenido | No |
| content_tags | Tags para busqueda | No |
| reading_assignments | Asignaciones de lectura | Si |
| spaced_repetition | Programacion de repeticion espaciada | Si |

*Si* = RLS con contenido global (admin) + contenido local (tenant)

**Functions:** calculate_module_progress(), get_next_exercise(), schedule_spaced_repetition()
**Triggers:** tr_exercise_completed, tr_module_progress_updated

---

### 4. gamification
**Descripcion:** Sistema XP, rangos, niveles, motor de gamificacion.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| xp_transactions | Historial de XP (inmutable) | Si |
| levels | Definicion de niveles | No |
| rank_definitions | 5 rangos maya | No |
| student_gamification | Estado actual de gamificacion | Si |
| gamification_config | Configuracion de parametros | Si |
| xp_multipliers | Multiplicadores activos | Si |
| daily_xp_limits | Limites anti-abuse | Si |
| streak_records | Registro de rachas | Si |

**Functions:** calculate_xp(), check_rank_promotion(), get_streak_multiplier(), calculate_level()
**Triggers:** tr_xp_transaction_created, tr_rank_promotion, tr_streak_updated

---

### 5. social
**Descripcion:** Interacciones sociales, equipos, feed.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| teams | Equipos de estudiantes | Si |
| team_members | Miembros de equipo | Si |
| social_interactions | Likes, reacciones | Si |
| social_feed | Feed de actividad | Si |
| team_challenges | Retos entre equipos | Si |
| forum_posts | Posts de foro por aula | Si |
| forum_replies | Respuestas a posts | Si |

**Functions:** create_team(), add_team_member(), calculate_team_score()
**Triggers:** tr_social_interaction_created

---

### 6. classrooms
**Descripcion:** Aulas, asignaciones, gestion escolar.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| classrooms | Aulas registradas | Si |
| classroom_students | Estudiantes por aula | Si |
| classroom_teachers | Maestros por aula | Si |
| classroom_config | Configuracion de aula | Si |
| assignments | Asignaciones de ejercicios | Si |
| assignment_submissions | Entregas de asignaciones | Si |
| school_periods | Ciclos escolares | Si |

**Functions:** assign_students_to_classroom(), get_classroom_stats()
**Triggers:** tr_assignment_created, tr_submission_received

---

### 7. analytics
**Descripcion:** Metricas de progreso, engagement, analytics.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| analytics_events | Eventos de tracking | Si |
| analytics_daily | Resumen diario por estudiante | Si |
| analytics_weekly | Resumen semanal | Si |
| analytics_monthly | Resumen mensual | Si |
| engagement_metrics | DAU, WAU, MAU, retention | Si |

**Functions:** aggregate_daily_stats(), calculate_engagement(), refresh_analytics_mvs()
**Triggers:** tr_analytics_event_logged

---

### 8. reports
**Descripcion:** Templates de reportes, instancias, exportaciones.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| report_templates | Templates de reportes | Si |
| report_instances | Instancias generadas | Si |
| report_schedules | Reportes programados | Si |
| report_exports | Archivos exportados (PDF/Excel) | Si |

**Functions:** generate_student_report(), generate_classroom_report()
**Triggers:** tr_report_schedule_check

---

### 9. notifications
**Descripcion:** Sistema de notificaciones multi-canal.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| notification_templates | Templates por evento | Si |
| notification_queue | Cola de envio | Si |
| notification_logs | Historial de envios | Si |
| notification_preferences | Preferencias por usuario | Si |
| push_subscriptions | Suscripciones push | Si |

**Functions:** enqueue_notification(), process_notification_queue(), send_email()
**Triggers:** tr_notification_enqueued

---

### 10. store
**Descripcion:** Tienda virtual, items, transacciones ML Coins.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| store_items | Catalogo de items | No |
| store_categories | Categorias de items | No |
| store_purchases | Historial de compras | Si |
| student_inventory | Items del estudiante | Si |
| ml_coin_transactions | Transacciones de ML Coins | Si |
| ml_coin_balances | Saldo actual | Si |

**Functions:** purchase_item(), check_balance(), apply_item_effect()
**Triggers:** tr_purchase_completed, tr_balance_updated

---

### 11. missions
**Descripcion:** Misiones diarias, semanales, quests.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| mission_definitions | Catalogo de misiones | No |
| mission_daily_rotation | Rotacion diaria | No |
| mission_weekly_rotation | Rotacion semanal | No |
| mission_progress | Progreso por estudiante | Si |
| quest_chains | Cadenas de quests | No |
| quest_progress | Progreso en quests | Si |

**Functions:** rotate_daily_missions(), check_mission_completion(), advance_quest()
**Triggers:** tr_mission_progress_updated

---

### 12. leaderboard
**Descripcion:** Rankings, temporadas, competencias.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| leaderboard_entries | Entradas de ranking | Si |
| leaderboard_seasons | Temporadas (4 semanas) | No |
| leaderboard_history | Historial de posiciones | Si |
| season_rewards | Recompensas por temporada | No |

**Functions:** update_leaderboard(), close_season(), distribute_season_rewards()
**Triggers:** tr_leaderboard_entry_updated

---

### 13. content
**Descripcion:** Material educativo adicional, multimedia.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| media_files | Archivos multimedia | Si |
| media_categories | Categorias | No |
| content_libraries | Bibliotecas de contenido | Si |

**Functions:** upload_media(), categorize_content()

---

### 14. parents
**Descripcion:** Vinculacion padres-estudiantes, portal.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| parent_profiles | Perfiles de padres | Si |
| parent_student_links | Vinculaciones | Si |
| parent_notifications | Notificaciones especificas | Si |
| link_codes | Codigos de vinculacion | Si |

**Functions:** generate_link_code(), verify_parent_link()
**Triggers:** tr_link_established

---

### 15. settings
**Descripcion:** Configuracion global y por componente.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| system_settings | Configuracion global | No |
| feature_flags | Feature flags por tenant | Si |
| gamification_params | Parametros ajustables | Si |

**Functions:** get_setting(), set_setting(), check_feature_flag()

---

### 16. audit
**Descripcion:** Auditoria y logs del sistema.

| Tabla | Descripcion | RLS |
|-------|-------------|-----|
| audit_logs | Registro de acciones | Si |
| data_changes | Historial de cambios | Si |
| access_logs | Registro de acceso | Si |

**Functions:** log_audit_event(), log_data_change()
**Triggers:** tr_audit_log_on_change (attached to critical tables)

---

### 17-18. Placeholder Schemas

Reservados para futuras expansiones:
- **integrations:** Integraciones con sistemas externos (LMS, SIS)
- **billing:** Sistema de facturacion (si se comercializa)

---

## RLS Policies (207)

### Distribucion por Schema
| Schema | Policies | Estrategia |
|--------|----------|------------|
| auth | 24 | tenant_id match |
| education | 42 | tenant_id + role-based |
| gamification | 38 | tenant_id match |
| social | 22 | tenant_id match |
| classrooms | 28 | tenant_id + classroom membership |
| analytics | 18 | tenant_id + role (teacher/admin) |
| reports | 16 | tenant_id + role |
| notifications | 20 | tenant_id + user_id |
| store | 18 | tenant_id match |
| missions | 16 | tenant_id match |
| leaderboard | 12 | tenant_id + scope |
| parents | 14 | tenant_id + parent_student_link |
| audit | 14 | tenant_id + admin only |

### Patron RLS Standard

```sql
-- Patron base para todas las tablas multi-tenant
CREATE POLICY "tenant_isolation_select" ON schema.table_name
  FOR SELECT
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY "tenant_isolation_insert" ON schema.table_name
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY "tenant_isolation_update" ON schema.table_name
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY "tenant_isolation_delete" ON schema.table_name
  FOR DELETE
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

---

## Materialized Views (7)

| MV | Schema | Proposito | Refresh |
|----|--------|-----------|---------|
| classroom_rankings | leaderboard | Rankings por aula | 5 min |
| school_rankings | leaderboard | Rankings por escuela | 15 min |
| student_daily_stats | analytics | Estadisticas diarias | 1 hora |
| module_completion_rates | analytics | Tasa de completitud | 1 hora |
| engagement_dashboard | analytics | Metricas de engagement | 30 min |
| teacher_classroom_overview | analytics | Vista general para maestro | 15 min |
| global_leaderboard | leaderboard | Ranking global | 15 min |

---

## ENUMs (42)

| Grupo | ENUMs | Valores ejemplo |
|-------|-------|-----------------|
| Roles | user_role | student, teacher, admin, parent |
| Modulos | educational_module_type | literal, inferential, critical, digital, production |
| Ejercicios | exercise_type | crossword, timeline, fill_blanks, true_false, word_search, ... (23) |
| Dificultad | difficulty_level | easy, medium, hard, expert |
| Gamificacion | rank_type | ahkin, nacom, batab, halach_uinik, ajaw |
| | xp_source_type | exercise, mission, achievement, bonus, streak |
| | achievement_category | academic, consistency, social, exploration, secret |
| Tienda | store_item_type | avatar, frame, background, powerup, effect, title |
| | item_duration_type | permanent, temporary, single_use |
| Notificaciones | notification_channel | in_app, email, push, sms |
| | notification_priority | low, medium, high, urgent |
| Misiones | mission_type | daily, weekly, quest |
| | mission_status | active, completed, expired |
| Social | interaction_type | like, reaction, comment, share |
| Reportes | report_format | pdf, excel, csv |
| Audit | audit_action | create, update, delete, login, logout |

---

## Funciones Clave (183 total)

### Gamificacion (25)
- `calculate_xp(student_id, exercise_id, score)` -> INTEGER
- `check_rank_promotion(student_id)` -> BOOLEAN
- `get_streak_multiplier(student_id)` -> NUMERIC
- `award_ml_coins(student_id, amount, source)` -> VOID
- `evaluate_achievements(student_id, event_type)` -> achievement_id[]
- `rotate_daily_missions()` -> VOID
- `update_leaderboard(student_id, classroom_id)` -> VOID

### Educacion (20)
- `calculate_module_progress(student_id, module_id)` -> NUMERIC
- `get_next_exercise(student_id, module_id)` -> exercise_id
- `schedule_spaced_repetition(student_id, exercise_id, score)` -> VOID
- `evaluate_exercise_auto(attempt_id)` -> JSONB

### Autenticacion (15)
- `validate_user_credentials(email, password)` -> BOOLEAN
- `generate_refresh_token(user_id)` -> TEXT
- `revoke_all_tokens(user_id)` -> VOID
- `check_login_attempts(email)` -> BOOLEAN

### Tenants (10)
- `set_tenant_context(tenant_id)` -> VOID
- `get_current_tenant()` -> UUID
- `validate_tenant_access(user_id, tenant_id)` -> BOOLEAN

### Analytics (18)
- `aggregate_daily_stats(date)` -> VOID
- `calculate_engagement_metrics(tenant_id)` -> JSONB
- `refresh_all_materialized_views()` -> VOID

### Utilidades (40)
- `generate_uuid_v7()` -> UUID
- `update_timestamps()` -> TRIGGER
- `soft_delete()` -> TRIGGER
- `log_audit_event(...)` -> VOID

---

## Triggers Clave (67 CREATE TRIGGER / 126 trigger functions)

| Trigger | Tabla | Evento | Accion |
|---------|-------|--------|--------|
| tr_user_created | auth.users | INSERT | Crear perfil, log audit |
| tr_exercise_completed | education.exercise_results | INSERT | Calcular XP, actualizar progreso |
| tr_xp_transaction_created | gamification.xp_transactions | INSERT | Check level/rank, update leaderboard |
| tr_rank_promotion | gamification.student_gamification | UPDATE | Notificar, otorgar recompensa |
| tr_mission_progress_updated | missions.mission_progress | UPDATE | Check completion, award rewards |
| tr_assignment_created | classrooms.assignments | INSERT | Notificar estudiantes |
| tr_audit_log_on_change | (multiple) | UPDATE/DELETE | Registrar cambio en audit |
| tr_updated_at | (all tables) | UPDATE | Set updated_at = NOW() |
| tr_soft_delete | (applicable) | DELETE | Set deleted_at instead of hard delete |

---

## Mapeo Conceptual a Fisico

> Agregado 2026-02-12 por TASK-2026-02-12-ANALISIS-BACKEND-INTEGRACION.
> Este modelo usa nombres conceptuales. Aqui se documenta la correspondencia con la implementacion real.

### Schemas: Conceptual -> Fisico

| # | Schema Conceptual | Schema(s) Fisico(s) DDL | Backend Datasource | Nota |
|---|-------------------|------------------------|-------------------|------|
| 1 | auth | auth + auth_management | auth | users en schema auth, resto en auth_management |
| 2 | tenants | auth_management | auth | Tabla tenants dentro de auth_management |
| 3 | education | educational_content + progress_tracking | educational + progress | Split: estructura en educational, progreso en progress |
| 4 | gamification | gamification_system | gamification | Incluye store, missions, leaderboard, achievements, comodines |
| 5 | social | social_features | social | Incluye classrooms, teams, guilds, friendships |
| 6 | classrooms | social_features | social | Absorbido en social_features |
| 7 | analytics | data_warehouse + materialized views | etl (no registrado) | No existe como schema separado |
| 8 | reports | social_features + admin_dashboard | social + admin_dashboard | No existe como schema separado |
| 9 | notifications | notifications | notifications | Match directo |
| 10 | store | gamification_system | gamification | Absorbido en gamification_system |
| 11 | missions | gamification_system | gamification | Absorbido en gamification_system |
| 12 | leaderboard | gamification_system | gamification | Absorbido en gamification_system |
| 13 | content | content_management | content | Match directo |
| 14 | parents | auth_management | auth | parent_accounts/links/notifications en auth_management |
| 15 | settings | system_configuration | (via admin) | Match directo |
| 16 | audit | audit_logging | audit | Match directo |
| 17 | integrations | lti_integration | lti (no registrado) | Parcial |
| 18 | billing | N/A (placeholder) | N/A | No implementado |

### Schemas Fisicos DDL No Representados en Modelo Conceptual

| Schema Fisico | Tipo | Nota |
|--------------|------|------|
| communication | Activo | Mensajeria teacher-student, tiene entities |
| admin_dashboard | Activo | Reports admin, bulk_operations, metrics |
| system_configuration | Activo | Settings, feature flags, rate limits |
| storage | Placeholder | Reservado |
| data_warehouse | Activo | ETL dimensions + facts |
| gamilit | Utility | Funciones compartidas |

### Tablas: Clasificacion de Correspondencia

De las ~90 tablas listadas en este documento conceptual:
- **33%** tienen match exacto con DDL (mismo nombre)
- **33%** son naming aliases (mismo concepto, nombre diferente en DDL)
- **9%** tienen implementacion diferente (ej: como ENUM, config JSON, inline)
- **15%** estan diferidas (cubiertas inline o por config)
- **14%** son futuras (post-MVP, no implementadas)

Para el mapeo tabla-por-tabla completo, ver:
- `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` — Entity ↔ DDL verified
- `orchestration/tareas/TASK-2026-02-12-ANALISIS-BACKEND-INTEGRACION/02-DISCREPANCIAS.md` — Tabla conceptual ↔ DDL real

### Funciones: Nota de Correspondencia

Las funciones listadas en este documento (ej: `calculate_xp()`, `validate_user_credentials()`) son **descripciones conceptuales** de la logica, no nombres DDL exactos. Los nombres reales en DDL siguen el patron:
- `gamilit.fn_nombre_funcion()` o `schema.nombre_funcion()`
- Ejemplo: `calculate_xp()` conceptual → `gamilit.calculate_xp_reward()` en DDL

Para la lista completa de funciones DDL reales, consultar `apps/database/ddl/` por schema.

---

*GAMILIT - Modelo de Datos*
*18 schemas, 169 tablas, 207 RLS policies*
*PostgreSQL 15 con Row-Level Security*
