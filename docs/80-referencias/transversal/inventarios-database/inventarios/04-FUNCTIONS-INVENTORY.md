# FUNCTIONS INVENTORY
## Proyecto GAMILIT

**Fecha:** 2026-01-07
**Version:** 2.0.0
**Total:** 109 funciones activas (excluye _deprecated y tests)

---

## Resumen por Schema

| # | Schema | Funciones | Descripcion |
|---|--------|-----------|-------------|
| 1 | educational_content | 28 | Validadores de ejercicios y rutas de aprendizaje |
| 2 | gamilit | 27 | Funciones core del sistema (usuarios, triggers, utilidades) |
| 3 | gamification_system | 20 | Sistema de gamificacion (XP, rangos, logros, comodines) |
| 4 | progress_tracking | 11 | Seguimiento de progreso y analytics |
| 5 | auth_management | 6 | Gestion de roles y autenticacion |
| 6 | audit_logging | 5 | Registro de eventos y limpieza de logs |
| 7 | content_management | 4 | Moderacion de contenido |
| 8 | notifications | 3 | Sistema de notificaciones |
| 9 | social_features | 2 | Caracteristicas sociales |
| 10 | system_configuration | 2 | Feature flags y configuracion |
| 11 | admin_dashboard | 1 | Panel de administracion |
| | **TOTAL** | **109** | |

---

## Por Schema

---

### Schema: admin_dashboard (1 funcion)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | update_bulk_operation_progress | 01-update_bulk_operation_progress.sql | Actualiza el progreso de una operacion bulk incrementando contadores y actualizando estado automaticamente |

---

### Schema: audit_logging (5 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | retry_pending_initializations | 02-retry_pending_initializations.sql | Reintenta la inicializacion de usuarios que fallaron en batch |
| 2 | cleanup_old_system_logs | cleanup_old_system_logs.sql | Removes system log entries older than specified retention period |
| 3 | cleanup_old_user_activity | cleanup_old_user_activity.sql | Removes user activity records older than specified retention period |
| 4 | log_audit_event | log_audit_event.sql | Registra eventos de auditoria en system_logs con manejo de errores |
| 5 | log_system_event | log_system_event.sql | Logs system events for audit and monitoring purposes |

---

### Schema: auth_management (6 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | assign_role_to_user | 01-assign_role_to_user.sql | Asigna un rol a un usuario con validaciones de seguridad y auditoria |
| 2 | get_user_role | 02-get_user_role.sql | Obtiene el rol mas privilegiado de un usuario |
| 3 | verify_user_permission | 03-verify_user_permission.sql | Verifica si un usuario tiene un permiso especifico |
| 4 | remove_role_from_user | 04-remove_role_from_user.sql | Revoca un rol de un usuario con validaciones |
| 5 | hash_token | 05-hash_token.sql | Genera un hash SHA-256 de un token para almacenamiento seguro |
| 6 | update_user_preferences | 06-update_user_preferences.sql | Actualiza las preferencias de usuario (tema, idioma, notificaciones) |

---

### Schema: content_management (4 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | apply_moderation_rules | 01-apply_moderation_rules.sql | Aplica todas las reglas de moderacion activas a un contenido y ejecuta las acciones correspondientes |
| 2 | check_keyword_rule | 02-check_keyword_rule.sql | Verifica si un texto contiene palabras prohibidas |
| 3 | check_pattern_rule | 03-check_pattern_rule.sql | Verifica si un texto coincide con un patron regex |
| 4 | auto_moderate_content | 04-auto_moderate_content.sql | Funcion simplificada para moderar contenido desde backend |

---

### Schema: educational_content (28 funciones)

#### Validadores Modulo 1 - Comprension Literal (7 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | validate_answer | 02-validate_answer.sql | Funcion maestra para validar respuestas de ejercicios (dispatcher) |
| 2 | validate_crucigrama | 03-validate_crucigrama.sql | Validador para ejercicios tipo crucigrama |
| 3 | validate_timeline | 04-validate_timeline.sql | Validador para ejercicios tipo linea de tiempo |
| 4 | validate_word_search | 05-validate_word_search.sql | Validador para ejercicios tipo sopa de letras |
| 5 | validate_fill_in_blank | 06-validate_fill_in_blank.sql | Validador para ejercicios tipo completar espacios |
| 6 | validate_true_false | 07-validate_true_false.sql | Validador para ejercicios tipo verdadero/falso |
| 7 | validate_mapa_conceptual | 08-validate_mapa_conceptual.sql | Validador para ejercicios tipo mapa conceptual |

#### Validadores Modulo 2 - Comprension Inferencial (8 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 8 | validate_emparejamiento | 09-validate_emparejamiento.sql | Validador para ejercicios tipo emparejamiento (matching) |
| 9 | validate_detective_textual | 10-validate_detective_textual.sql | Validador para ejercicios tipo detective textual (Modulo 2) |
| 10 | validate_construccion_hipotesis | 11-validate_construccion_hipotesis.sql | Validador heuristico para construccion de hipotesis (Modulo 2) |
| 11 | validate_prediccion_narrativa | 12-validate_prediccion_narrativa.sql | Validador heuristico para prediccion narrativa (Modulo 2) |
| 12 | validate_puzzle_contexto | 13-validate_puzzle_contexto.sql | Validador para puzzle de contexto (Modulo 2) |
| 13 | validate_rueda_inferencias | 14-validate_rueda_inferencias.sql | Valida un fragmento individual con keywords |
| 14 | validate_rueda_inferencias_text | 14-validate_rueda_inferencias_text.sql | Validador para rueda de inferencias con texto libre (Modulo 2) |
| 15 | validate_detective_connections | 20-validate_detective_connections.sql | Validador para ejercicios tipo detective textual (conexiones de evidencias) |

#### Validadores Modulo 3 - Comprension Critica (5 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 16 | validate_tribunal_opiniones | 15-validate_tribunal_opiniones.sql | Validador heuristico para tribunal de opiniones (Modulo 3) |
| 17 | validate_debate_digital | 16-validate_debate_digital.sql | Validador heuristico para debate digital (Modulo 3) |
| 18 | validate_analisis_fuentes | 17-validate_analisis_fuentes.sql | Validador para analisis de fuentes (Modulo 3) |
| 19 | validate_podcast_argumentativo | 18-validate_podcast_argumentativo.sql | Validador tecnico para podcast argumentativo (Modulo 3) |
| 20 | validate_matriz_perspectivas | 19-validate_matriz_perspectivas.sql | Validador para matriz de perspectivas (Modulo 3) |

#### Validadores Adicionales (5 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 21 | validate_and_audit | 20-validate_and_audit.sql | Valida respuesta de ejercicio Y crea registro de auditoria |
| 22 | recalculate_exercise | 21-recalculate_exercise.sql | Recalcula la validacion de un ejercicio basado en su audit_id |
| 23 | validate_prediction_scenarios | 21-validate_prediction_scenarios.sql | Validador para ejercicios de prediccion narrativa con escenarios y opciones |
| 24 | validate_cause_effect_matching | 22-validate_cause_effect_matching.sql | Validador para ejercicios de matching causa-efecto (drag & drop) |
| 25 | validate_module4_module5 | 23-validate_module4_module5.sql | Validador de estructura JSONB para ejercicios de Modulos 4 y 5 |

#### Funciones de Rutas y Recomendaciones (3 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 26 | calculate_learning_path | calculate_learning_path.sql | Calcula ruta de aprendizaje personalizada basada en progreso del usuario |
| 27 | get_recommended_missions | get_recommended_missions.sql | Obtiene misiones recomendadas basadas en nivel y progreso del usuario |
| 28 | validate_exercise_structure | validate_exercise_structure.sql | Valida que la estructura JSONB de content y answer_key sea correcta segun la mecanica del ejercicio |

---

### Schema: gamification_system (20 funciones)

#### Funciones de XP y Niveles (4 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | recalculate_level_on_xp_change | 08-recalculate_level_on_xp_change.sql | Trigger function que recalcula automaticamente el nivel cuando cambia el XP |
| 2 | apply_xp_boost | apply_xp_boost.sql | Calcula XP con multiplicadores de boost aplicados, sin modificar la base de datos |
| 3 | calculate_level_from_xp | calculate_level_from_xp.sql | Calcula el nivel del usuario basado en XP total |
| 4 | process_exercise_completion | process_exercise_completion.sql | Procesa y otorga recompensas por completar ejercicios |

#### Funciones de ML Coins (1 funcion)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 5 | award_ml_coins | award_ml_coins.sql | Otorga ML Coins al usuario aplicando multiplicador de rango basado en current_rank y registra la transaccion |

#### Funciones de Rangos Maya (8 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 6 | calculate_maya_rank_helpers | calculate_maya_rank_helpers.sql | Helper functions for rank calculation without database queries |
| 7 | calculate_user_rank | calculate_user_rank.sql | Calcula el rango actual del usuario basado en XP total y modulos completados |
| 8 | check_rank_promotion | check_rank_promotion.sql | Verifica si un usuario califica para promocion de rango |
| 9 | get_rank_benefits | get_rank_benefits.sql | Obtiene los beneficios (perks) de un rango Maya |
| 10 | get_rank_multiplier | get_rank_multiplier.sql | Obtiene el multiplicador de XP para un rango Maya |
| 11 | get_user_rank_progress | get_user_rank_progress.sql | Calcula el progreso del usuario hacia el siguiente rango Maya |
| 12 | get_user_rank_requirements | get_user_rank_requirements.sql | Obtiene requisitos para el siguiente rango maya |
| 13 | promote_to_next_rank | promote_to_next_rank.sql | Promociona un usuario al siguiente rango Maya |

#### Funciones de Logros (2 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 14 | check_and_award_achievements | check_and_award_achievements.sql | Verifica y otorga achievements automaticamente basados en eventos del usuario |
| 15 | claim_achievement_reward | claim_achievement_reward.sql | Reclama la recompensa de un logro ya desbloqueado |

#### Funciones de Comodines (2 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 16 | consume_comodin | consume_comodin.sql | Consume un comodin del usuario y aplica su efecto |
| 17 | get_user_comodines | get_user_comodines.sql | Obtiene todos los comodines disponibles del usuario |

#### Funciones de Inventario y Leaderboard (3 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 18 | get_user_inventory_summary | get_user_inventory_summary.sql | Obtiene resumen completo del inventario del usuario con estadisticas y adquisiciones recientes |
| 19 | update_leaderboard_streaks | update_leaderboard_streaks.sql | Verifica y actualiza la racha de dias consecutivos del usuario |
| 20 | update_user_rank | update_user_rank.sql | Actualiza el rango del usuario basado en XP total y otorga recompensas |

---

### Schema: gamilit (27 funciones)

#### Funciones de Auditoria (1 funcion)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | audit_profile_changes | 01-audit_profile_changes.sql | Audita cambios importantes en perfiles de usuario |

#### Funciones de Sesion y Usuario (5 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 2 | get_current_user_id | 02-get_current_user_id.sql | Retorna el ID del usuario actual de la sesion |
| 3 | get_current_user_role | 03-get_current_user_role.sql | Retorna el rol del usuario actual |
| 4 | is_admin | 05-is_admin.sql | Verifica si el usuario actual tiene rol de administrador |
| 5 | is_super_admin | 05b-is_super_admin.sql | Alias de is_admin() - Verifica si el usuario actual tiene rol de super administrador |
| 6 | update_user_last_login | 11-update_user_last_login.sql | Actualiza la fecha y hora del ultimo login de un usuario |

#### Funciones de Inicializacion (4 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 7 | initialize_user_stats | 04-initialize_user_stats.sql | Inicializa estadisticas de gamificacion para nuevos usuarios |
| 8 | initialize_module_progress_for_users | 05-initialize_module_progress_for_users.sql | Inicializa registros de progress para un modulo nuevo |
| 9 | set_profile_defaults | 09-set_profile_defaults.sql | Establece valores por defecto para nuevos usuarios |
| 10 | initialize_user_missions | 18-initialize_user_missions.sql | Inicializa misiones diarias y semanales para un usuario nuevo |

#### Funciones de Tenant y Classroom (3 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 11 | update_classroom_member_count | 10-update_classroom_member_count.sql | Actualiza contador de miembros en aulas |
| 12 | set_default_tenant | 11-set_default_tenant.sql | Asigna automaticamente el tenant principal de GAMILIT a nuevos perfiles |
| 13 | assign_default_classroom | 15-assign_default_classroom.sql | Asigna automaticamente estudiantes nuevos al classroom default |

#### Funciones de Validacion (3 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 14 | validate_email_format | 12-validate_email_format.sql | Valida que el formato del email sea correcto |
| 15 | validate_username | 13-validate_username.sql | Valida que el username tenga formato valido (alfanumerico, guiones, guiones bajos) |
| 16 | validate_date_range | validate_date_range.sql | Validates that date ranges are logically correct and reasonable |

#### Funciones de Estadisticas y Progreso (4 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 17 | update_user_stats_on_exercise_complete | 14-update_user_stats_on_exercise_complete.sql | Actualiza estadisticas del usuario al completar un ejercicio |
| 18 | update_module_progress_on_exercise_complete | 15-update_module_progress_on_exercise_complete.sql | Actualiza el progreso del modulo al completar un ejercicio (trigger) |
| 19 | update_module_progress_on_submission_graded | 20-update_module_progress_on_submission_graded.sql | Actualiza el progreso del modulo al calificar un submission (trigger) |
| 20 | update_user_stats_on_submission_graded | 27-update_user_stats_on_submission_graded.sql | Actualiza estadisticas del usuario al calificarse una submission |

#### Funciones de Utilidad (3 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 21 | now_mexico | 08-now_mexico.sql | Retorna timestamp actual en zona horaria de Mexico (America/Mexico_City) |
| 22 | update_updated_at_column | 15-update_updated_at_column.sql | Actualiza automaticamente el campo updated_at |
| 23 | normalize_text | 16-normalize_text.sql | Normaliza texto para comparaciones (quita acentos, espacios extras) |

#### Funciones de Misiones (2 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 24 | update_mission_progress | 50-update_mission_progress.sql | Funcion UNIFICADA para actualizar el progreso de misiones |
| 25 | mission_trigger_wrappers | 51-mission_trigger_wrappers.sql | Wrappers de trigger que llaman a la funcion unificada update_mission_progress |

#### Archivos de Test (2 archivos)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 26 | update_missions_on_complete_modules.TEST | 25-update_missions_on_complete_modules.TEST.sql | Test suite para misiones de completar modulos |
| 27 | update_missions_on_explore_modules.TEST | 26-update_missions_on_explore_modules.TEST.sql | Script de prueba para misiones de explorar modulos |

---

### Schema: notifications (3 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | send_notification | 01-send_notification.sql | Crea una notificacion respetando las preferencias del usuario y la encola para envio |
| 2 | get_user_preferences | 02-get_user_preferences.sql | Obtiene las preferencias de notificaciones de un usuario |
| 3 | queue_batch_notifications | 03-queue_batch_notifications.sql | Encola notificaciones masivas a multiples usuarios |

---

### Schema: progress_tracking (11 funciones)

#### Funciones de Progreso (3 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | calculate_module_progress | 01-calculate_module_progress.sql | Calcula el porcentaje de progreso en un modulo |
| 2 | get_user_progress | 03-get_user_progress.sql | Retorna resumen completo de progreso del usuario |
| 3 | update_mission_progress | 06-update_mission_progress.sql | Otorga todas las recompensas y procesa logros al completar una mision |

#### Funciones de Analytics (2 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 4 | get_classroom_analytics | 05-get_classroom_analytics.sql | Obtiene estadisticas y analytics completos de un classroom con rango de fechas |
| 5 | enhanced_analytics_functions | 10-enhanced_analytics_functions.sql | Get complete dashboard statistics for a teacher |

#### Funciones de Dificultad CEFR (3 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 6 | check_difficulty_promotion_eligibility | check_difficulty_promotion_eligibility.sql | Verifica si un usuario cumple criterios para promocion de nivel CEFR |
| 7 | promote_user_difficulty_level | promote_user_difficulty_level.sql | Promociona al usuario al siguiente nivel de dificultad CEFR |
| 8 | update_difficulty_progress | update_difficulty_progress.sql | Actualiza el progreso del usuario en un nivel CEFR tras completar ejercicio |

#### Funciones de Triggers y Alertas (3 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 9 | update_exercise_submissions_updated_at | 07-update_exercise_submissions_updated_at.sql | Actualiza automaticamente el campo updated_at al modificar una submission |
| 10 | generate_student_alerts | 15-generate_student_alerts.sql | Genera alertas automaticas basadas en metricas de estudiantes |
| 11 | create_manual_review_on_submission | 16-create_manual_review_on_submission.sql | Crea ManualReview automaticamente cuando se inserta un ExerciseSubmission para ejercicios que requieren revision manual |

---

### Schema: social_features (2 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | cleanup_old_notifications | cleanup_old_notifications.sql | Limpia notificaciones leidas mas antiguas que el periodo especificado |
| 2 | friendship_helpers | friendship_helpers.sql | Utility functions for friendship management |

---

### Schema: system_configuration (2 funciones)

| # | Funcion | Archivo | Proposito |
|---|---------|---------|-----------|
| 1 | is_feature_enabled | is_feature_enabled.sql | Checks if a feature flag is enabled globally or for specific users/roles |
| 2 | update_feature_flag | update_feature_flag.sql | Updates feature flag status and manages rollout configurations |

---

## Notas

### Funciones Excluidas

Se excluyen de este inventario:
- Funciones en carpetas `_deprecated/`
- Funciones de test en carpetas `tests/`
- Archivos `.TEST.sql` (incluidos solo como referencia)

### Ubicacion de Archivos

Todos los archivos se encuentran en:
```
/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/{schema}/functions/
```

### Convenciones de Nomenclatura

- Archivos con prefijo numerico (ej: `01-`, `02-`) indican orden de ejecucion
- Funciones `validate_*` son validadores de ejercicios
- Funciones `update_*` generalmente son triggers
- Funciones `get_*` son consultas de lectura
- Funciones `*_helpers` contienen funciones auxiliares

---

## Referencias

- [01-SCHEMAS-INVENTORY.md](./01-SCHEMAS-INVENTORY.md)
- [02-TABLES-INVENTORY.md](./02-TABLES-INVENTORY.md)
- [03-ENUMS-INVENTORY.md](./03-ENUMS-INVENTORY.md)

---

**Ultima actualizacion:** 2026-01-07
