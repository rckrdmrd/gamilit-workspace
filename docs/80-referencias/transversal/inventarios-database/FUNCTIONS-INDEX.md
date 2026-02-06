# Functions Index - Base de Datos GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-03
**Total Funciones:** 159+
**Estado:** Documentado

---

## Resumen Ejecutivo

Este documento cataloga todas las funciones PostgreSQL implementadas en la base de datos GAMILIT. Las funciones estan organizadas por schema y clasificadas segun su proposito (triggers, helpers, validations, calculations, etc.).

### Estadisticas por Schema

| Schema | Funciones | Proposito Principal |
|--------|-----------|---------------------|
| gamilit | 35 | Core utilities, triggers, helpers |
| gamification_system | 24 | XP, ranks, achievements, comodines |
| educational_content | 26 | Validacion de ejercicios, learning paths |
| progress_tracking | 18 | Progreso, analytics, reviews |
| social_features | 14 | Friendships, cleanup |
| auth_management | 6 | Roles, permissions, tokens |
| system_configuration | 5 | Feature flags, params |
| audit_logging | 8 | Logging, cleanup |
| notifications | 3 | Envio, preferences |
| content_management | 5 | Moderation |
| admin_dashboard | 2 | Dashboards, metrics |
| communication | 6 | Messages |

---

## Por Schema

### gamilit (Core)

#### Funciones de Usuario/Contexto

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamilit.get_current_user_id()` | 02-get_current_user_id.sql | Obtener UUID del usuario actual desde JWT |
| `gamilit.get_current_user_role()` | 03-get_current_user_role.sql | Obtener rol del usuario actual |
| `gamilit.get_current_tenant_id()` | 09-get_current_tenant_id.sql | Obtener tenant_id actual |
| `gamilit.is_admin()` | 05-is_admin.sql | Verificar si usuario es admin |
| `gamilit.is_super_admin()` | 05b-is_super_admin.sql | Verificar si es super_admin |

#### Funciones de Inicializacion

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamilit.initialize_user_stats()` | 04-initialize_user_stats.sql | Inicializar stats de nuevo usuario |
| `gamilit.initialize_user_stats_for_user(user_id)` | 19-retry_helper_functions.sql | Reintentar init de stats |
| `gamilit.initialize_module_progress_for_users()` | 05-initialize_module_progress_for_users.sql | Inicializar progreso de modulos |
| `gamilit.initialize_user_missions(user_id)` | 18-initialize_user_missions.sql | Inicializar misiones de usuario |
| `gamilit.assign_default_classroom()` | 15-assign_default_classroom.sql | Asignar classroom por defecto |
| `gamilit.assign_default_classroom_for_user(user_id)` | 19-retry_helper_functions.sql | Reintentar asignacion classroom |

#### Funciones de Triggers

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamilit.update_updated_at_column()` | 15-update_updated_at_column.sql | Actualizar timestamp en UPDATE |
| `gamilit.audit_profile_changes()` | 01-audit_profile_changes.sql | Auditar cambios en perfiles |
| `gamilit.set_profile_defaults()` | 09-set_profile_defaults.sql | Establecer defaults en perfil |
| `gamilit.set_default_tenant()` | 11-set_default_tenant.sql | Asignar tenant por defecto |
| `gamilit.update_classroom_member_count()` | 10-update_classroom_member_count.sql | Actualizar contador de miembros |
| `gamilit.update_user_stats_on_exercise_complete()` | 14-update_user_stats_on_exercise_complete.sql | Stats al completar ejercicio |
| `gamilit.update_module_progress_on_exercise_complete()` | 15-update_module_progress_on_exercise_complete.sql | Progreso al completar ejercicio |
| `gamilit.update_module_progress_on_submission_graded()` | 20-update_module_progress_on_submission_graded.sql | Progreso al calificar |
| `gamilit.update_user_stats_on_submission_graded()` | 27-update_user_stats_on_submission_graded.sql | Stats al calificar |

#### Funciones de Validacion

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamilit.validate_email_format(email)` | 12-validate_email_format.sql | Validar formato de email |
| `gamilit.validate_username(username)` | 13-validate_username.sql | Validar nombre de usuario |
| `gamilit.validate_date_range(start, end)` | validate_date_range.sql | Validar rango de fechas |
| `gamilit.normalize_text(text)` | 16-normalize_text.sql | Normalizar texto (acentos, etc) |

#### Funciones de Misiones

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamilit.update_mission_progress()` | 50-update_mission_progress.sql | Actualizar progreso de mision |
| `gamilit.trigger_missions_on_exercise_complete()` | 51-mission_trigger_wrappers.sql | Trigger misiones al completar |
| `gamilit.trigger_missions_on_earn_xp()` | 51-mission_trigger_wrappers.sql | Trigger misiones al ganar XP |
| `gamilit.trigger_missions_on_correct_streak()` | 51-mission_trigger_wrappers.sql | Trigger misiones en racha |
| `gamilit.trigger_missions_on_daily_streak()` | 51-mission_trigger_wrappers.sql | Trigger misiones en racha diaria |
| `gamilit.trigger_missions_on_use_comodines()` | 51-mission_trigger_wrappers.sql | Trigger al usar comodines |
| `gamilit.trigger_missions_on_perfect_scores()` | 51-mission_trigger_wrappers.sql | Trigger en scores perfectos |
| `gamilit.trigger_missions_on_complete_modules()` | 51-mission_trigger_wrappers.sql | Trigger al completar modulos |
| `gamilit.trigger_missions_on_explore_modules()` | 51-mission_trigger_wrappers.sql | Trigger al explorar modulos |
| `gamilit.trigger_missions_on_submission()` | 51-mission_trigger_wrappers.sql | Trigger al enviar respuesta |

#### Utilidades

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamilit.now_mexico()` | 08-now_mexico.sql | Timestamp en zona horaria Mexico |
| `gamilit.update_user_last_login(user_id)` | 11-update_user_last_login.sql | Actualizar ultimo login |

---

### gamification_system

#### Funciones de XP/Nivel

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamification_system.calculate_level_from_xp(xp)` | calculate_level_from_xp.sql | Calcular nivel desde XP |
| `gamification_system.recalculate_level_on_xp_change()` | 08-recalculate_level_on_xp_change.sql | Recalcular nivel en cambio XP |
| `gamification_system.process_xp_update()` | 09-process_xp_update.sql | Procesar actualizacion de XP |
| `gamification_system.apply_xp_boost(user_id, base_xp, boost_type)` | apply_xp_boost.sql | Aplicar multiplicador XP |

#### Funciones de Rango

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamification_system.calculate_user_rank(user_id)` | calculate_user_rank.sql | Calcular rango de usuario |
| `gamification_system.calculate_maya_rank_from_xp(xp)` | calculate_maya_rank_helpers.sql | Rango Maya desde XP |
| `gamification_system.calculate_rank_progress_percentage()` | calculate_maya_rank_helpers.sql | Porcentaje de progreso de rango |
| `gamification_system.check_rank_promotion(user_id)` | check_rank_promotion.sql | Verificar promocion de rango |
| `gamification_system.promote_to_next_rank(user_id)` | promote_to_next_rank.sql | Promover al siguiente rango |
| `gamification_system.update_user_rank(user_id)` | update_user_rank.sql | Actualizar rango de usuario |
| `gamification_system.get_rank_benefits(rank)` | get_rank_benefits.sql | Obtener beneficios del rango |
| `gamification_system.get_rank_multiplier(rank)` | get_rank_multiplier.sql | Obtener multiplicador del rango |
| `gamification_system.get_user_rank_progress(user_id)` | get_user_rank_progress.sql | Progreso hacia siguiente rango |
| `gamification_system.get_user_rank_requirements(current_rank)` | get_user_rank_requirements.sql | Requisitos para siguiente rango |

#### Funciones de Logros

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamification_system.check_and_grant_achievements(user_id)` | check_and_award_achievements.sql | Verificar y otorgar logros |
| `gamification_system.claim_achievement_reward(user_id, achievement_id)` | claim_achievement_reward.sql | Reclamar recompensa de logro |
| `gamification_system.fn_on_achievement_unlocked()` | 01-trg_achievement_unlocked.sql | Trigger al desbloquear logro |

#### Funciones de ML Coins

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamification_system.award_ml_coins(user_id, amount, type, desc)` | award_ml_coins.sql | Otorgar ML Coins |

#### Funciones de Comodines

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamification_system.consume_comodin(user_id, comodin_type)` | consume_comodin.sql | Consumir comodin |
| `gamification_system.get_user_comodines(user_id)` | get_user_comodines.sql | Obtener comodines del usuario |

#### Funciones de Inventario

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamification_system.get_user_inventory_summary(user_id)` | get_user_inventory_summary.sql | Resumen de inventario |

#### Funciones de Leaderboard

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamification_system.update_leaderboard_streaks()` | update_leaderboard_streaks.sql | Actualizar rachas en leaderboard |

#### Funciones de Ejercicios

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `gamification_system.process_exercise_completion(...)` | process_exercise_completion.sql | Procesar completacion de ejercicio |
| `gamification_system.trg_check_rank_promotion_fn()` | trg_check_rank_promotion_on_xp_gain.sql | Trigger promocion de rango |

---

### educational_content

#### Funciones de Validacion de Ejercicios

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `educational_content.validate_answer(...)` | 02-validate_answer.sql | Validar respuesta generica |
| `educational_content.validate_crucigrama(...)` | 03-validate_crucigrama.sql | Validar crucigrama |
| `educational_content.validate_timeline(...)` | 04-validate_timeline.sql | Validar linea de tiempo |
| `educational_content.validate_word_search(...)` | 05-validate_word_search.sql | Validar sopa de letras |
| `educational_content.validate_fill_in_blank(...)` | 06-validate_fill_in_blank.sql | Validar completar espacios |
| `educational_content.validate_true_false(...)` | 07-validate_true_false.sql | Validar verdadero/falso |
| `educational_content.validate_mapa_conceptual(...)` | 08-validate_mapa_conceptual.sql | Validar mapa conceptual |
| `educational_content.validate_emparejamiento(...)` | 09-validate_emparejamiento.sql | Validar emparejamiento |
| `educational_content.validate_detective_textual(...)` | 10-validate_detective_textual.sql | Validar detective textual |
| `educational_content.validate_construccion_hipotesis(...)` | 11-validate_construccion_hipotesis.sql | Validar hipotesis |
| `educational_content.validate_prediccion_narrativa(...)` | 12-validate_prediccion_narrativa.sql | Validar prediccion narrativa |
| `educational_content.validate_puzzle_contexto(...)` | 13-validate_puzzle_contexto.sql | Validar puzzle de contexto |
| `educational_content.validate_rueda_inferencias(...)` | 14-validate_rueda_inferencias.sql | Validar rueda de inferencias |
| `educational_content.validate_rueda_inferencias_text(...)` | 14-validate_rueda_inferencias.sql | Validar rueda (texto) |
| `educational_content._validate_single_fragment(...)` | 14-validate_rueda_inferencias.sql | Helper validacion fragmento |
| `educational_content.validate_tribunal_opiniones(...)` | 15-validate_tribunal_opiniones.sql | Validar tribunal opiniones |
| `educational_content.validate_debate_digital(...)` | 16-validate_debate_digital.sql | Validar debate digital |
| `educational_content.validate_analisis_fuentes(...)` | 17-validate_analisis_fuentes.sql | Validar analisis de fuentes |
| `educational_content.validate_podcast_argumentativo(...)` | 18-validate_podcast_argumentativo.sql | Validar podcast argumentativo |
| `educational_content.validate_matriz_perspectivas(...)` | 19-validate_matriz_perspectivas.sql | Validar matriz perspectivas |
| `educational_content.validate_and_audit(...)` | 20-validate_and_audit.sql | Validar y auditar |
| `educational_content.validate_detective_connections(...)` | 20-validate_detective_connections.sql | Validar conexiones detective |
| `educational_content.validate_prediction_scenarios(...)` | 21-validate_prediction_scenarios.sql | Validar escenarios prediccion |
| `educational_content.validate_cause_effect_matching(...)` | 22-validate_cause_effect_matching.sql | Validar causa-efecto |
| `educational_content.validate_module4_module5_answer(...)` | 23-validate_module4_module5.sql | Validar modulos 4/5 |

#### Funciones de Learning Path

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `educational_content.calculate_learning_path(user_id)` | calculate_learning_path.sql | Calcular ruta de aprendizaje |
| `educational_content.get_recommended_missions(user_id)` | get_recommended_missions.sql | Obtener misiones recomendadas |

#### Funciones Auxiliares

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `educational_content.validate_exercise_structure(...)` | validate_exercise_structure.sql | Validar estructura de ejercicio |
| `educational_content.recalculate_exercise(exercise_id)` | 21-recalculate_exercise.sql | Recalcular ejercicio |
| `gamilit.initialize_module_progress_on_publish()` | 15-trg_initialize_module_progress.sql | Init progreso al publicar |
| `educational_content.update_classroom_modules_timestamp()` | 23-classroom_modules.sql | Timestamp classroom modules |
| `educational_content.update_assignment_students_timestamp()` | 24-alter_assignment_students.sql | Timestamp assignments |
| `educational_content.update_teacher_content_timestamp()` | 25-teacher_content.sql | Timestamp teacher content |
| `educational_content.can_teacher_access_content(...)` | 25-teacher_content.sql | Verificar acceso a contenido |

---

### progress_tracking

#### Funciones de Calculo

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `progress_tracking.calculate_module_progress(user_id, module_id)` | 01-calculate_module_progress.sql | Calcular progreso de modulo |
| `progress_tracking.get_user_progress_summary(user_id)` | 03-get_user_progress.sql | Resumen de progreso |
| `progress_tracking.get_classroom_analytics(classroom_id)` | 05-get_classroom_analytics.sql | Analytics de classroom |
| `progress_tracking.get_teacher_dashboard(teacher_id)` | 10-enhanced_analytics_functions.sql | Dashboard de profesor |
| `progress_tracking.get_classroom_detailed_analytics(...)` | 10-enhanced_analytics_functions.sql | Analytics detallados |

#### Funciones de Misiones

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `progress_tracking.grant_mission_completion_rewards(...)` | 06-update_mission_progress.sql | Otorgar recompensas mision |

#### Funciones de Dificultad

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `progress_tracking.update_difficulty_progress(...)` | update_difficulty_progress.sql | Actualizar progreso dificultad |
| `progress_tracking.check_difficulty_promotion_eligibility(...)` | check_difficulty_promotion_eligibility.sql | Verificar elegibilidad promocion |
| `progress_tracking.promote_user_difficulty_level(...)` | promote_user_difficulty_level.sql | Promover nivel dificultad |

#### Funciones de Reviews

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `progress_tracking.create_manual_review_on_submission()` | 16-create_manual_review_on_submission.sql | Crear review manual |
| `progress_tracking.get_teacher_pending_reviews_count(...)` | 02-teacher_pending_reviews.sql | Contador reviews pendientes |

#### Funciones de Alertas

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `progress_tracking.generate_student_alerts()` | 15-generate_student_alerts.sql | Generar alertas estudiante |

#### Funciones de Sincronizacion

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `progress_tracking.sync_module_progress_scores(...)` | 17-sync_module_progress_scores.sql | Sincronizar scores |
| `progress_tracking.sync_all_module_progress_scores()` | 17-sync_module_progress_scores.sql | Sincronizar todos los scores |
| `progress_tracking.update_module_progress_complete()` | 20-update_module_progress_complete.sql | Completar progreso modulo |

#### Triggers

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `progress_tracking.update_submitted_progress_on_submission()` | 32-trg_update_submitted_progress.sql | Actualizar progreso en submission |
| `progress_tracking.trg_sync_average_score()` | 33-trg_sync_average_score_on_submission.sql | Sincronizar average score |

---

### social_features

#### Funciones de Amistad

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `social_features.are_friends(user1_id, user2_id)` | friendship_helpers.sql | Verificar si son amigos |
| `social_features.count_friends(user_id)` | friendship_helpers.sql | Contar amigos |
| `social_features.get_user_friends(user_id)` | friendship_helpers.sql | Obtener lista de amigos |
| `social_features.has_pending_friend_request(from, to)` | friendship_helpers.sql | Verificar solicitud pendiente |
| `social_features.count_pending_friend_requests(user_id)` | friendship_helpers.sql | Contar solicitudes pendientes |
| `social_features.accept_friend_request(request_id)` | friendship_helpers.sql | Aceptar solicitud |
| `social_features.reject_friend_request(request_id)` | friendship_helpers.sql | Rechazar solicitud |
| `social_features.cancel_friend_request(request_id)` | friendship_helpers.sql | Cancelar solicitud |
| `social_features.remove_friendship(user_id, friend_id)` | friendship_helpers.sql | Eliminar amistad |

#### Funciones de Classroom

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `social_features.sync_teacher_classroom_on_insert()` | sync_teacher_classroom.sql | Sincronizar teacher_classroom |

#### Funciones de Limpieza

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `social_features.cleanup_old_notifications(days)` | cleanup_old_notifications.sql | Limpiar notificaciones antiguas |

---

### auth_management

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `auth_management.assign_role_to_user(user_id, role)` | 01-assign_role_to_user.sql | Asignar rol a usuario |
| `auth_management.get_user_role(user_id)` | 02-get_user_role.sql | Obtener rol de usuario |
| `auth_management.user_has_permission(user_id, permission)` | 03-verify_user_permission.sql | Verificar permiso |
| `auth_management.revoke_role_from_user(user_id, role)` | 04-remove_role_from_user.sql | Revocar rol |
| `auth_management.hash_token(token)` | 05-hash_token.sql | Hashear token |
| `auth_management.update_user_preferences(...)` | 06-update_user_preferences.sql | Actualizar preferencias |
| `auth_management.ensure_profile_name()` | 03b-trg_ensure_profile_name.sql | Asegurar nombre en perfil |

---

### system_configuration

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `system_configuration.is_feature_enabled(flag, user, tenant, classroom)` | is_feature_enabled.sql | Verificar feature flag |
| `system_configuration.update_feature_flag(...)` | update_feature_flag.sql | Actualizar feature flag |
| `system_configuration.update_feature_flags_timestamp()` | 06-feature_flags.sql | Timestamp feature flags |
| `system_configuration.get_gamification_param(key, tenant, classroom)` | 02-gamification_parameters.sql | Obtener parametro gamificacion |
| `system_configuration.set_classroom_gamification_override(...)` | 02-gamification_parameters.sql | Override por classroom |
| `system_configuration.update_gamification_parameters_timestamp()` | 02-gamification_parameters.sql | Timestamp parametros |

---

### audit_logging

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `audit_logging.log_audit_event(...)` | log_audit_event.sql | Registrar evento de auditoria |
| `audit_logging.log_system_event(...)` | log_system_event.sql | Registrar evento de sistema |
| `audit_logging.cleanup_old_system_logs(days)` | cleanup_old_system_logs.sql | Limpiar logs antiguos |
| `audit_logging.cleanup_old_user_activity(days)` | cleanup_old_user_activity.sql | Limpiar actividad antigua |
| `audit_logging.retry_pending_initializations(...)` | 02-retry_pending_initializations.sql | Reintentar inicializaciones |
| `audit_logging.get_pending_initialization_stats()` | 02-retry_pending_initializations.sql | Stats de pendientes |
| `audit_logging.resolve_pending_initialization(...)` | 08-pending_user_initialization.sql | Resolver inicializacion |

---

### notifications

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `notifications.send_notification(...)` | 01-send_notification.sql | Enviar notificacion |
| `notifications.get_user_preferences(user_id)` | 02-get_user_preferences.sql | Obtener preferencias |
| `notifications.queue_batch_notifications(...)` | 03-queue_batch_notifications.sql | Encolar batch |

---

### content_management

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `content_management.apply_moderation_rules(...)` | 01-apply_moderation_rules.sql | Aplicar reglas moderacion |
| `content_management.check_keyword_rule(...)` | 02-check_keyword_rule.sql | Verificar regla keyword |
| `content_management.check_pattern_rule(...)` | 03-check_pattern_rule.sql | Verificar regla patron |
| `content_management.auto_moderate_content(...)` | 04-auto_moderate_content.sql | Auto-moderar contenido |
| `content_management.trg_auto_moderate()` | 03-trg_auto_moderate.sql | Trigger auto-moderacion |

---

### admin_dashboard

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `admin_dashboard.refresh_all_dashboards()` | 01-materialized_views.sql | Refrescar vistas materializadas |
| `admin_dashboard.update_bulk_operation_progress(...)` | 01-update_bulk_operation_progress.sql | Actualizar progreso bulk |
| `admin_dashboard.cleanup_old_metrics(days)` | 09-metrics_history.sql | Limpiar metricas antiguas |

---

### communication

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `communication.update_message_tracking_fields()` | 01-messages.sql | Trigger especializada (ver nota) |
| `communication.get_unread_count(user_id)` | 01-messages.sql | Contar no leidos |
| `communication.mark_conversation_read(...)` | 01-messages.sql | Marcar leido |
| `communication.update_message_participant_read()` | 02-message_participants.sql | Actualizar participante |
| `communication.get_user_unread_count(user_id)` | 02-message_participants.sql | Contar no leidos usuario |
| `communication.mark_message_read_for_user(...)` | 02-message_participants.sql | Marcar leido por usuario |

> **Nota OVR-006:** `update_message_tracking_fields()` NO es duplicado de `gamilit.update_updated_at_column()`.
> Es funcion ESPECIALIZADA que trackea: updated_at, edited_at, edit_count, read_at, deleted_at, flagged_at.
> Renombrada 2026-02-03 (antes: `update_messages_timestamp`)

---

## Notas de Implementacion

### Convenciones de Nomenclatura
- Funciones de trigger: `trg_*` o `fn_on_*`
- Funciones de validacion: `validate_*`
- Funciones de obtencion: `get_*`
- Funciones de actualizacion: `update_*`
- Funciones de calculo: `calculate_*`
- Funciones de limpieza: `cleanup_*`

### Seguridad
- Funciones criticas usan `SECURITY DEFINER`
- `SET search_path` definido para evitar inyeccion
- Validaciones de entrada en todas las funciones publicas

### Performance
- Funciones STABLE o IMMUTABLE donde es posible
- Uso de indices en queries internos
- EXPLAIN ANALYZE en funciones de alto trafico

---

*Documento generado automaticamente - BLOQUE 2 Plan Maestro GAMILIT*
*Fecha: 2026-02-03 | Version: 1.0.0*
