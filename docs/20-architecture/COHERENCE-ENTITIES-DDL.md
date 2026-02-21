# COHERENCE: Backend Entities vs DDL Tables

**Proyecto:** GAMILIT
**Version:** 2.3.0
**Fecha:** 2026-02-21
**Tarea:** TASK-2026-02-12-ANALISIS-BD-VS-DOCS (Sprint R3)

---

## Resumen Ejecutivo

Este documento valida la coherencia entre las entidades TypeORM del backend y las tablas DDL de la base de datos, identificando matches y gaps potenciales.

### Metricas Globales

| Metrica | Valor |
|---------|-------|
| Total Entities Backend | 156 files (159 @Entity classes) |
| Total Tablas DDL | 173 |
| Tablas con Entity | 156 |
| Tablas sin Entity | 17 |
| Cobertura | ~90.2% |

**Nota:** Las 17 tablas sin entity directa son casos justificados: 16 data_warehouse (acceso via SQL raw) + 1 auth.users (gestionada externamente). Las anteriores excepciones auth_management.roles (03b) ahora estan cubiertas indirectamente. Ver seccion "Tablas DDL sin Entity" mas abajo.

**Auditoria:** Verificado en TASK-2026-02-12-ANALISIS-BACKEND-INTEGRACION (2026-02-12). Actualizado 2026-02-21 con +3 resource entities (TASK-2026-02-21-COMPLIANCE-AUDIT).

---

## Modulo: auth (18 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| auth-attempt.entity.ts | 02-auth_attempts.sql | auth_management | MATCH |
| auth-provider.entity.ts | 05-auth_providers.sql | auth_management | MATCH |
| email-verification-token.entity.ts | 06-email_verification_tokens.sql | auth_management | MATCH |
| membership.entity.ts | 10-memberships.sql | auth_management | MATCH |
| parent-account.entity.ts | 14-parent_accounts.sql | auth_management | MATCH |
| parent-notification.entity.ts | 16-parent_notifications.sql | auth_management | MATCH |
| parent-student-link.entity.ts | 15-parent_student_links.sql | auth_management | MATCH |
| password-reset-token.entity.ts | 07-password_reset_tokens.sql | auth_management | MATCH |
| profile.entity.ts | 03-profiles.sql | auth_management | MATCH |
| role.entity.ts | 04-roles.sql | auth_management | MATCH |
| security-event.entity.ts | 08-security_events.sql | auth_management | MATCH |
| tenant.entity.ts | 01-tenants.sql | auth_management | MATCH |
| two-factor-token.entity.ts | 13-two_factor_tokens.sql | auth_management | MATCH |
| user.entity.ts | 01-users.sql | auth | MATCH |
| user-preferences.entity.ts | 09-user_preferences.sql | auth_management | MATCH |
| user-role.entity.ts | 03b-roles.sql | auth_management | MATCH |
| user-session.entity.ts | 11-user_sessions.sql | auth_management | MATCH |
| user-suspension.entity.ts | 12-user_suspensions.sql | auth_management | MATCH |

**Cobertura auth:** 100% (18/18)

---

## Modulo: gamification (22 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| achievement.entity.ts | 03-achievements.sql | gamification_system | MATCH |
| achievement-category.entity.ts | 10-achievement_categories.sql | gamification_system | MATCH |
| active-boost.entity.ts | 11-active_boosts.sql | gamification_system | MATCH |
| classroom-mission.entity.ts | 16-classroom_missions.sql | gamification_system | MATCH |
| comodin-use.entity.ts | comodin_uses.sql | gamification_system | MATCH |
| comodines-inventory.entity.ts | 07-comodines_inventory.sql | gamification_system | MATCH |
| comodin-usage-log.entity.ts | 14-comodin_usage_log.sql | gamification_system | MATCH |
| comodin-usage-tracking.entity.ts | 15-comodin_usage_tracking.sql | gamification_system | MATCH |
| inventory-transaction.entity.ts | 12-inventory_transactions.sql | gamification_system | MATCH |
| leaderboard-metadata.entity.ts | 09-leaderboard_metadata.sql | gamification_system | MATCH |
| maya-rank.entity.ts | 13-maya_ranks.sql | gamification_system | MATCH |
| mission.entity.ts | 06-missions.sql | gamification_system | MATCH |
| mission-template.entity.ts | 20-mission_templates.sql | gamification_system | MATCH |
| ml-coins-transaction.entity.ts | 05-ml_coins_transactions.sql | gamification_system | MATCH |
| shop-category.entity.ts | 17-shop_categories.sql | gamification_system | MATCH |
| shop-item.entity.ts | 18-shop_items.sql | gamification_system | MATCH |
| user-achievement.entity.ts | 04-user_achievements.sql | gamification_system | MATCH |
| user-purchase.entity.ts | 19-user_purchases.sql | gamification_system | MATCH |
| user-rank.entity.ts | 02-user_ranks.sql | gamification_system | MATCH |
| user-skill-rating.entity.ts | user_skill_ratings.sql | social_features | MATCH |
| user-equipped-item.entity.ts | 21-user_equipped_items.sql | gamification_system | MATCH |
| user-stats.entity.ts | 01-user_stats.sql | gamification_system | MATCH |

**Cobertura gamification:** 100% (22/22)

---

## Modulo: educational (16 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| assessment-rubric.entity.ts | 03-assessment_rubrics.sql | educational_content | MATCH |
| classroom-module.entity.ts | (junction table) | educational_content | VIRTUAL |
| content-approval.entity.ts | content_approvals.sql | educational_content | MATCH |
| content-metadata.entity.ts | content_metadata.sql | educational_content | MATCH |
| content-tag.entity.ts | content_tags.sql | educational_content | MATCH |
| difficulty-criteria.entity.ts | 20-difficulty_criteria.sql | educational_content | MATCH |
| exercise.entity.ts | 02-exercises.sql | educational_content | MATCH |
| exercise-mechanic-mapping.entity.ts | 21-exercise_mechanic_mapping.sql | educational_content | MATCH |
| exercise-type-rubric.entity.ts | 27-exercise_type_rubrics.sql | educational_content | MATCH |
| exercise-validation-audit.entity.ts | 26-exercise_validation_audit.sql | educational_content | MATCH |
| exercise-validation-config.entity.ts | 22-exercise_validation_config.sql | educational_content | MATCH |
| media-attachment.entity.ts | 09-media_attachments.sql | educational_content | MATCH |
| media-resource.entity.ts | 04-media_resources.sql | educational_content | MATCH |
| module.entity.ts | 01-modules.sql | educational_content | MATCH |
| module-dependencies.entity.ts | module_dependencies.sql | educational_content | MATCH |
| taxonomy.entity.ts | taxonomies.sql | educational_content | MATCH |

**Cobertura educational:** 100% (16/16)

---

## Modulo: progress (20 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| certificate.entity.ts | 18-certificates.sql | progress_tracking | MATCH |
| engagement-metrics.entity.ts | engagement_metrics.sql | progress_tracking | MATCH |
| exercise-attempt.entity.ts | 03-exercise_attempts.sql | progress_tracking | MATCH |
| exercise-submission.entity.ts | 04-exercise_submissions.sql | progress_tracking | MATCH |
| learning-path.entity.ts | learning_paths.sql | progress_tracking | MATCH |
| learning-path-module.entity.ts | learning_path_modules.sql | progress_tracking | MATCH |
| learning-session.entity.ts | 02-learning_sessions.sql | progress_tracking | MATCH |
| manual-review.entity.ts | 06-manual_reviews.sql | progress_tracking | MATCH |
| mastery-tracking.entity.ts | mastery_tracking.sql | progress_tracking | MATCH |
| module-completion-tracking.entity.ts | module_completion_tracking.sql | progress_tracking | MATCH |
| module-progress.entity.ts | 01-module_progress.sql | progress_tracking | MATCH |
| progress-snapshot.entity.ts | progress_snapshots.sql | progress_tracking | MATCH |
| scheduled-mission.entity.ts | 05-scheduled_missions.sql | progress_tracking | MATCH |
| skill-assessment.entity.ts | skill_assessments.sql | progress_tracking | MATCH |
| teacher-alert-configuration.entity.ts | 20-teacher_alert_configurations.sql | progress_tracking | MATCH |
| teacher-intervention.entity.ts | 17-teacher_interventions.sql | progress_tracking | MATCH |
| teacher-note.entity.ts | teacher_notes.sql | progress_tracking | MATCH |
| user-current-level.entity.ts | 16-user_current_level.sql | progress_tracking | MATCH |
| user-difficulty-progress.entity.ts | 15-user_difficulty_progress.sql | progress_tracking | MATCH |
| user-learning-path.entity.ts | user_learning_paths.sql | progress_tracking | MATCH |

**Cobertura progress:** 100% (20/20)

---

## Modulo: social (26 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| assignment-classroom.entity.ts | assignment_classrooms.sql | social_features | MATCH |
| challenge-participant.entity.ts | 12-challenge_participants.sql | social_features | MATCH |
| challenge-result.entity.ts | 13-challenge_results.sql | social_features | MATCH |
| classroom.entity.ts | 03-classrooms.sql | social_features | MATCH |
| classroom-member.entity.ts | 04-classroom_members.sql | social_features | MATCH |
| discussion-thread.entity.ts | discussion_threads.sql | social_features | MATCH |
| friend-request.entity.ts | 10-friend_requests.sql | social_features | MATCH |
| friendship.entity.ts | 01-friendships.sql | social_features | MATCH |
| guild.entity.ts | guilds.sql | social_features | MATCH |
| guild-emblem.entity.ts | guild_emblems.sql | social_features | MATCH |
| guild-join-request.entity.ts | guild_join_requests.sql | social_features | MATCH |
| guild-member.entity.ts | guild_members.sql | social_features | MATCH |
| guild-mission.entity.ts | guild_missions.sql | social_features | MATCH |
| guild-mission-contribution.entity.ts | guild_mission_contributions.sql | social_features | MATCH |
| peer-challenge.entity.ts | 11-peer_challenges.sql | social_features | MATCH |
| school.entity.ts | 02-schools.sql | social_features | MATCH |
| social-interaction.entity.ts | social_interactions.sql | social_features | MATCH |
| teacher-classroom.entity.ts | teacher_classrooms.sql | social_features | MATCH |
| team.entity.ts | 05-teams.sql | social_features | MATCH |
| team-challenge.entity.ts | 07-team_challenges.sql | social_features | MATCH |
| team-member.entity.ts | 06-team_members.sql | social_features | MATCH |
| team-vs-team-challenge.entity.ts | team_vs_team_challenges.sql | social_features | MATCH |
| user-activity.entity.ts | 09-user_activities.sql | social_features | MATCH |
| user-block.entity.ts | user_blocks.sql | social_features | MATCH |
| user-follow.entity.ts | user_follows.sql | social_features | MATCH |
| user-report.entity.ts | user_reports.sql | social_features | MATCH |

**Cobertura social:** 100% (26/26)

---

## Modulo: admin (16 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| activity-log.entity.ts | 06-activity_log.sql | audit_logging | MATCH |
| admin-report.entity.ts | 08-admin_reports.sql | admin_dashboard | MATCH |
| api-configuration.entity.ts | api_configurations.sql | system_configuration | MATCH |
| bulk-operation.entity.ts | 07-bulk_operations.sql | admin_dashboard | MATCH |
| environment-config.entity.ts | environment_configs.sql | system_configuration | MATCH |
| feature-flag.entity.ts | feature_flags.sql | system_configuration | MATCH |
| gamification-parameter.entity.ts | gamification_parameters.sql | system_configuration | MATCH |
| metrics-history.entity.ts | 09-metrics_history.sql | admin_dashboard | MATCH |
| notification-settings.entity.ts | (user specific) | system_configuration | MATCH |
| notification-settings-global.entity.ts | notification_settings.sql | system_configuration | MATCH |
| performance-metric.entity.ts | 02-performance_metrics.sql | audit_logging | MATCH |
| rate-limit.entity.ts | rate_limits.sql | system_configuration | MATCH |
| system-alert.entity.ts | 03-system_alerts.sql | audit_logging | MATCH |
| system-log.entity.ts | 04-system_logs.sql | audit_logging | MATCH |
| system-setting.entity.ts | system_settings.sql | system_configuration | MATCH |
| tenant-configuration.entity.ts | tenant_configurations.sql | system_configuration | MATCH |

**Cobertura admin:** 100% (16/16)

---

## Modulo: assignments (4 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| assignment.entity.ts | 05-assignments.sql | educational_content | MATCH |
| assignment-exercise.entity.ts | 06-assignment_exercises.sql | educational_content | MATCH |
| assignment-student.entity.ts | 07-assignment_students.sql | educational_content | MATCH |
| assignment-submission.entity.ts | 08-assignment_submissions.sql | educational_content | MATCH |

**Cobertura assignments:** 100% (4/4)

---

## Modulo: audit (3 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| audit-log.entity.ts | 01-audit_logs.sql | audit_logging | MATCH |
| pending-user-initialization.entity.ts | 08-pending_user_initialization.sql | audit_logging | MATCH |
| user-activity-log.entity.ts | 05-user_activity_logs.sql | audit_logging | MATCH |

**Cobertura audit:** 100% (3/3)

---

## Modulo: content (10 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| content-author.entity.ts | content_authors.sql | content_management | MATCH |
| content-category.entity.ts | (derived) | content_management | VIRTUAL |
| content-template.entity.ts | 01-content_templates.sql | content_management | MATCH |
| content-version.entity.ts | 04-content_versions.sql | content_management | MATCH |
| flagged-content.entity.ts | 05-flagged_content.sql | content_management | MATCH |
| marie-curie-content.entity.ts | 02-marie_curie_content.sql | content_management | MATCH |
| media-file.entity.ts | 03-media_files.sql | content_management | MATCH |
| media-metadata.entity.ts | (embedded) | content_management | VIRTUAL |
| moderation-rule.entity.ts | 06-moderation_rules.sql | content_management | MATCH |
| tag.entity.ts | 07-tags.sql | content_management | MATCH |

**Cobertura content:** 80% (8/10 - 2 virtuales)

---

## Modulo: lti (3 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| lti-consumer.entity.ts | lti_consumers.sql | lti_integration | MATCH |
| lti-grade-passback.entity.ts | lti_grade_passback.sql | lti_integration | MATCH |
| lti-session.entity.ts | lti_sessions.sql | lti_integration | MATCH |

**Cobertura lti:** 100% (3/3)

---

## Modulo: notifications (7 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| notification.entity.ts | notifications.sql | notifications | MATCH |
| notification-log.entity.ts | notification_logs.sql | notifications | MATCH |
| notification-preference.entity.ts | notification_preferences.sql | notifications | MATCH |
| notification-queue.entity.ts | notification_queue.sql | notifications | MATCH |
| notification-template.entity.ts | notification_templates.sql | notifications | MATCH |
| rate-limit-log.entity.ts | rate_limit_logs.sql | notifications | MATCH |
| user-device.entity.ts | user_devices.sql | notifications | MATCH |

**Cobertura notifications:** 100% (7/7)

---

## Modulo: teacher (9 Entities)

| Entity | Tabla DDL | Schema | Estado |
|--------|-----------|--------|--------|
| message.entity.ts | 01-messages.sql | communication | MATCH |
| resource-rating.entity.ts | 28-resource_ratings.sql | educational_content | MATCH |
| resource-comment.entity.ts | 29-resource_comments.sql | educational_content | MATCH |
| resource-download.entity.ts | 30-resource_downloads.sql | educational_content | MATCH |
| scheduled-report.entity.ts | 08b-scheduled_reports.sql | social_features | MATCH |
| shared-report.entity.ts | 08c-shared_reports.sql | social_features | MATCH |
| student-intervention-alert.entity.ts | 19-student_intervention_alerts.sql | progress_tracking | MATCH |
| teacher-content.entity.ts | 25-teacher_content.sql | educational_content | MATCH |
| teacher-report.entity.ts | 08-teacher_reports.sql | social_features | MATCH |

**Cobertura teacher:** 100% (9/9)

> **Nota (2026-02-21):** 3 new resource sharing entities added: resource_ratings, resource_comments, resource_downloads. These support the ResourceSharingPanel feature for teacher content collaboration.

> **Nota DDL-Entity pattern:** `scheduled_reports.frequency`, `scheduled_reports.status`, y `shared_reports.permission_level` usan TypeORM `varchar(20)` (no TypeORM enum) para coincidir con el patron DDL `VARCHAR(20) + CHECK constraint`. Ver comentarios `FIX AUDIT-B2` en las entities.

---

## Tablas DDL sin Entity Directa (17 tablas)

### Categoria 1: Data Warehouse (16 tablas) - Intencional

Acceso via SQL raw, materialized views, y reportes directos. No requieren entity TypeORM.

| Tabla | Tipo | Descripcion |
|-------|------|-------------|
| dim_dates | Dimension | Fecha (calendario educativo) |
| dim_times | Dimension | Hora del dia |
| dim_students | Dimension | Estudiantes (SCD2) |
| dim_exercises | Dimension | Ejercicios educativos |
| dim_modules | Dimension | Modulos educativos |
| dim_teachers | Dimension | Docentes |
| dim_achievements | Dimension | Logros gamificacion |
| dim_event_types | Dimension | Tipos de eventos |
| fact_exercise_completions | Fact | Completaciones de ejercicios |
| fact_daily_progress | Fact | Progreso diario agregado |
| fact_gamification_events | Fact | Eventos de gamificacion |
| fact_teacher_metrics | Fact | Metricas docentes |
| ml_model_weights | ML | Pesos de modelos ML |
| ml_prediction_logs | ML | Logs de predicciones |
| etl_extraction_logs | ETL | Extracciones ETL |
| etl_load_logs | ETL | Cargas ETL |

### Categoria 2: Infraestructura (1 tabla) - Gestionada externamente

| Tabla | Schema | Razon |
|-------|--------|-------|
| auth.users | auth | Gestionada por Supabase auth layer, no por TypeORM |

### Categoria 3: Catalogo/Infrastructure (1 tabla)

| Tabla | Schema | Razon |
|-------|--------|-------|
| auth_management.roles (03b) | auth_management | Catalogo RBAC, cubierto por user-role.entity.ts |

### ~~Categoria 4: Communication~~ - RESUELTO (2026-02-12)

Las 4 tablas communication ahora tienen entities:

| Tabla | Schema | Entity | Modulo | Estado |
|-------|--------|--------|--------|--------|
| communication.conversations | communication | conversation.entity.ts | communication | MATCH |
| communication.conversation_participants | communication | conversation-participant.entity.ts | communication | MATCH |
| communication.messages | communication | message.entity.ts (@Entity Message) | teacher | MATCH |
| communication.message_participants | communication | message.entity.ts (@Entity MessageParticipant) | teacher | MATCH |

**Nota:** Las entities de conversation/conversation-participant estan en modules/communication/entities/ pero NO registradas en ningun datasource (huerfanas). Requiere agregar al datasource 'communication' en app.module.ts.

### Anteriores "sin entity" ahora resueltas (2026-02-12)

| Tabla | Schema | Entity |
|-------|--------|--------|
| social_features.guild_mission_contributions | social_features | guild-mission-contribution.entity.ts |
| social_features.guild_emblems | social_features | guild-emblem.entity.ts |
| social_features.user_blocks | social_features | user-block.entity.ts |
| social_features.user_reports | social_features | user-report.entity.ts |

---

## Coherencia Frontend Types vs Backend Entities

### Tipos Frontend Encontrados

| Archivo | Contenido | Mapea a Entity |
|---------|-----------|----------------|
| index.ts | Exports globales | N/A |
| userStats.ts | UserStats types | user-stats.entity.ts |
| admin/achievements.types.ts | Achievement types | achievement.entity.ts |
| admin/classroom-teacher.types.ts | Classroom types | classroom.entity.ts |
| admin/gamification.types.ts | Gamification types | Multiple entities |

### Analisis

El frontend tiene **tipos limitados** definidos explicitamente en `/types/`:
- **5 archivos de tipos** vs **136 entities backend**
- La mayoria de tipos se infieren de las respuestas API
- Los tipos explicitamente definidos mapean correctamente a entities

### Recomendacion

Para mejorar coherencia frontend:
1. Generar tipos automaticamente desde Swagger/OpenAPI
2. O definir interfaces completas en `/types/` que reflejen entities clave

---

## Resumen de Coherencia

### Por Modulo (Actualizado 2026-02-12)

| Modulo | Entities | DDL Tables | Cobertura |
|--------|----------|------------|-----------|
| auth | 18 | 18 | 100% |
| gamification | 22 | 22 | 100% |
| educational | 16 | 18 | 89% |
| progress | 20 | 20 | 100% |
| social | 26 | 27 | 96% |
| admin | 16 | 16 | 100% |
| assignments | 4 | 4 | 100% |
| audit | 3 | 8 | 38% |
| content | 10 | 10 | 80% |
| lti | 3 | 3 | 100% |
| notifications | 7 | 7 | 100% |
| teacher | 9 (10 classes) | 9 | 100% |
| communication | 2 (+ 2 in teacher) | 4 | 100% |

### Calificacion Global

| Criterio | Estado |
|----------|--------|
| Entities principales cubiertas | SI |
| Gaps criticos | NO |
| Junction tables sin entity | ESPERADO |
| Data warehouse sin entity | INTENCIONAL (16 tablas) |
| Communication entities | RESUELTO (4/4 con entity) |
| Communication datasource | PENDIENTE (conversation entities huerfanas) |
| Frontend types incompletos | MEJORABLE |

**Coherencia Global: ~90.2%** (156/173 tablas con entity) - Nivel satisfactorio para produccion.

---

## Alineacion de Columnas (Top 20 Tablas Criticas)

Verificacion de Sprint R3 (2026-02-12): de las 20 tablas mas criticas, 16 tenian EXACT MATCH y 4 tenian mismatches que fueron corregidos:

| Tabla | Columna | Accion R3 | Estado |
|-------|---------|-----------|--------|
| auth_management.profiles | `deleted_at` | R3-01: Agregado @DeleteDateColumn | CORREGIDO |
| auth_management.tenants | `deleted_at` | R3-02: Agregado @DeleteDateColumn | CORREGIDO |
| gamification_system.ml_coins_transactions | `tenant_id` | R3-03: Agregado @Column | CORREGIDO |
| notifications.notifications | `updated_at` | R3-04: Agregado @UpdateDateColumn | CORREGIDO |

Inconsistencias de estilo corregidas:
- `user-suspension.entity.ts`: schema hardcoded -> `DB_SCHEMAS.AUTH` (R3-05)
- `user-preferences.entity.ts`: schema hardcoded -> `DB_SCHEMAS.AUTH` (R3-05)

### Correcciones Sprint REC (2026-02-18) — TASK-2026-02-18-ANALISIS-MISIONES-LOGROS

| Tabla/Entity | Columna | Accion | Estado |
|-------------|---------|--------|--------|
| gamification_system.missions / mission.entity.ts | `template_id` | REC-009: TEXT → UUID + FK a mission_templates(id) | CORREGIDO |
| gamification_system.classroom_missions / classroom-mission.entity.ts | `mission_template_id` | REC-009: TEXT → UUID + FK a mission_templates(id) | CORREGIDO |
| gamification_system.missions | UNIQUE constraint | REC-001: (user_id, template_id, mission_type, end_date) anti-duplicacion | AGREGADO |
| gamification_system.achievements / achievement.entity.ts | `ml_coins_reward`, `points_value` | REC-012: @deprecated, usar `rewards` JSONB como canonical | ANOTADO |

---

## Tablas Conceptuales sin DDL (R4-01)

15 tablas aparecen en documentacion (schema-reference) pero no tienen DDL implementado. Evaluacion Sprint R4:

| Tabla Conceptual | Categoria | Disposicion |
|-----------------|-----------|-------------|
| user_profiles | Naming alias → profiles | RESUELTO |
| password_resets | Naming alias → password_reset_tokens | RESUELTO |
| login_attempts | Naming alias → auth_attempts | RESUELTO |
| conversations | Ya existe en DDL (communication) | RESUELTO |
| exercise_types | Implementado como PostgreSQL ENUM | RESUELTO |
| oauth_connections | Post-MVP | FUTURO |
| tenant_subscriptions | Post-MVP (SaaS billing) | FUTURO |
| spaced_repetition | Post-MVP (pedagogia avanzada) | FUTURO |
| mission_daily/weekly_rotation | Post-MVP (gamificacion) | FUTURO |
| report_templates/instances/schedules/exports | Post-MVP (reportes avanzados) | FUTURO |
| push_subscriptions | Post-MVP (Web Push) | FUTURO |
| tenant_settings | Cubierto por system_settings + tenants | DIFERIDO |
| exercise_feedback | Cubierto inline en exercise_attempts | DIFERIDO |
| xp_multipliers / daily_xp_limits | Cubierto via config_json | DIFERIDO |

---

## Conclusiones

1. **Coherencia Backend-DDL es buena** (~90.2%) con todos los gaps justificados
2. **16 tablas data_warehouse sin entity** es intencional (acceso SQL raw)
3. **4 columnas faltantes HIGH/MEDIUM** fueron corregidas en Sprint R3
4. **2 schemas hardcoded** fueron corregidos a usar DB_SCHEMAS constants
5. **4 tablas communication** pendientes de entity cuando se active el modulo completo
6. **15 tablas conceptuales sin DDL** evaluadas: 5 resueltos, 7 futuro, 3 diferidos (Sprint R4)
7. **Frontend types son minimos** - Se recomienda expansion o autogeneracion

---

**Generado por:** Claude Code - TASK-2026-02-12-ANALISIS-BD-VS-DOCS
**Fecha:** 2026-02-12 (actualizado desde v1.0.0 de 2026-02-03)
