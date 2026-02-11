# RLS Policies Master Index

**Version:** 1.0.0
**Fecha:** 2026-02-03
**Total Policies:** 299+
**Estado:** Documentado

---

## Resumen Ejecutivo

Este documento cataloga todas las Row Level Security (RLS) policies implementadas en la base de datos GAMILIT. Las policies controlan el acceso a filas de datos basado en el contexto del usuario (rol, tenant, classroom, ownership).

### Estadisticas por Schema

| Schema | Policies | Tablas con RLS |
|--------|----------|----------------|
| auth_management | 23 | 8 |
| gamification_system | 28 | 9 |
| progress_tracking | 42 | 12 |
| social_features | 34 | 14 |
| educational_content | 20 | 6 |
| notifications | 12 | 4 |
| audit_logging | 18 | 6 |
| communication | 9 | 2 |
| content_management | 17 | 5 |
| system_configuration | 12 | 3 |
| admin_dashboard | 4 | 2 |

---

## Por Schema

### auth_management

| Policy | Tipo | Tabla | Descripcion |
|--------|------|-------|-------------|
| profiles_read_own | SELECT | profiles | Usuario ve su propio perfil |
| profiles_read_teacher | SELECT | profiles | Profesores ven alumnos de sus classrooms |
| profiles_read_admin | SELECT | profiles | Admins ven todos los perfiles |
| profiles_update_own | UPDATE | profiles | Usuario actualiza su perfil |
| profiles_update_admin | UPDATE | profiles | Admins actualizan cualquier perfil |
| profiles_select_admin | SELECT | profiles | Admins tienen acceso completo |
| profiles_select_own | SELECT | profiles | Usuario ve su perfil |
| user_sessions_read_own | SELECT | user_sessions | Ver propias sesiones |
| password_reset_read_own | SELECT | password_resets | Ver propios tokens |
| email_verification_read_own | SELECT | email_verifications | Ver propias verificaciones |
| security_events_read_own | SELECT | security_events | Ver propios eventos |
| security_events_read_admin | SELECT | security_events | Admins ven todos los eventos |
| memberships_read_tenant | SELECT | memberships | Ver membresías del tenant |
| tenants_read_own | SELECT | tenants | Ver propio tenant |
| user_roles_read_own | SELECT | user_roles | Ver propios roles |
| user_suspensions_select_admin | SELECT | user_suspensions | Admins ven suspensiones |
| user_suspensions_select_own | SELECT | user_suspensions | Ver propia suspension |
| user_suspensions_insert_admin | INSERT | user_suspensions | Solo admins crean |
| user_suspensions_update_admin | UPDATE | user_suspensions | Solo admins actualizan |
| user_suspensions_delete_admin | DELETE | user_suspensions | Solo admins eliminan |
| user_preferences_select_own | SELECT | user_preferences | Ver propias preferencias |
| user_preferences_select_admin | SELECT | user_preferences | Admins ven todas |
| user_preferences_update_own | UPDATE | user_preferences | Actualizar propias |

### gamification_system

| Policy | Tipo | Tabla | Descripcion |
|--------|------|-------|-------------|
| achievements_read_public | SELECT | achievements | Ver logros publicos activos |
| achievements_manage_admin | ALL | achievements | Admins gestionan logros |
| achievements_all_admin | ALL | achievements | Acceso completo admin |
| achievements_select_active | SELECT | achievements | Ver logros activos no secretos |
| achievements_select_admin | SELECT | achievements | Admins ven todos |
| user_achievements_read_own | SELECT | user_achievements | Ver propios logros |
| user_achievements_read_friends | SELECT | user_achievements | Ver logros de amigos |
| user_achievements_read_teacher | SELECT | user_achievements | Profesores ven logros de alumnos |
| user_achievements_select_admin | SELECT | user_achievements | Admins ven todos |
| user_achievements_select_own | SELECT | user_achievements | Ver propios |
| ml_coins_read_own | SELECT | ml_coins_transactions | Ver propias transacciones |
| ml_coins_read_teacher | SELECT | ml_coins_transactions | Profesores ven de alumnos |
| ml_coins_read_admin | SELECT | ml_coins_transactions | Admins ven todas |
| ml_coins_insert_system | INSERT | ml_coins_transactions | Sistema inserta |
| ml_transactions_select_admin | SELECT | ml_coins_transactions | Admins ven |
| ml_transactions_select_own | SELECT | ml_coins_transactions | Ver propias |
| comodines_read_own | SELECT | comodines | Ver propios comodines |
| comodines_update_own | UPDATE | comodines | Actualizar propios |
| comodines_insert_system | INSERT | comodines | Sistema inserta |
| missions_read_own | SELECT | missions | Ver propias misiones |
| missions_manage_admin | ALL | missions | Admins gestionan |
| user_stats_read_own | SELECT | user_stats | Ver propios stats |
| user_stats_read_friends | SELECT | user_stats | Ver stats de amigos |
| user_stats_read_teacher | SELECT | user_stats | Profesores ven de alumnos |
| user_stats_update_system | UPDATE | user_stats | Sistema actualiza |
| user_ranks_read_all | SELECT | user_ranks | Todos ven rangos |
| user_ranks_update_system | UPDATE | user_ranks | Sistema actualiza |
| leaderboard_metadata_read_all | SELECT | leaderboard_metadata | Todos ven metadata |
| leaderboard_metadata_manage_admin | ALL | leaderboard_metadata | Admins gestionan |
| classroom_missions_teacher_access | ALL | classroom_missions | Profesores de classroom |
| classroom_missions_student_view | SELECT | classroom_missions | Estudiantes ven |
| classroom_missions_admin_access | ALL | classroom_missions | Admins acceso total |

### progress_tracking

| Policy | Tipo | Tabla | Descripcion |
|--------|------|-------|-------------|
| module_progress_read_own | SELECT | module_progress | Ver propio progreso |
| module_progress_read_teacher | SELECT | module_progress | Profesores ven de alumnos |
| module_progress_update_own | UPDATE | module_progress | Actualizar propio |
| module_progress_insert_system | INSERT | module_progress | Sistema inserta |
| module_progress_insert_own | INSERT | module_progress | Usuario inserta propio |
| module_progress_select_admin | SELECT | module_progress | Admins ven todos |
| module_progress_select_own | SELECT | module_progress | Ver propio |
| module_progress_select_teacher | SELECT | module_progress | Profesor ve de classroom |
| module_progress_update_own | UPDATE | module_progress | Actualizar propio |
| exercise_attempts_read_own | SELECT | exercise_attempts | Ver propios intentos |
| exercise_attempts_read_teacher | SELECT | exercise_attempts | Profesores ven de alumnos |
| exercise_attempts_insert_own | INSERT | exercise_attempts | Usuario inserta |
| exercise_attempts_select_admin | SELECT | exercise_attempts | Admins ven |
| exercise_attempts_select_own | SELECT | exercise_attempts | Ver propios |
| exercise_attempts_select_teacher | SELECT | exercise_attempts | Profesor ve |
| exercise_submissions_read_own | SELECT | exercise_submissions | Ver propios envios |
| exercise_submissions_read_teacher | SELECT | exercise_submissions | Profesores ven |
| exercise_submissions_insert_own | INSERT | exercise_submissions | Usuario inserta |
| exercise_submissions_update_teacher | UPDATE | exercise_submissions | Profesor actualiza |
| exercise_submissions_select_admin | SELECT | exercise_submissions | Admins ven |
| exercise_submissions_select_own | SELECT | exercise_submissions | Ver propios |
| exercise_submissions_select_teacher | SELECT | exercise_submissions | Profesor ve |
| exercise_submissions_update_own | UPDATE | exercise_submissions | Actualizar propio |
| learning_sessions_insert_own | INSERT | learning_sessions | Usuario inserta |
| learning_sessions_select_admin | SELECT | learning_sessions | Admins ven |
| learning_sessions_select_own | SELECT | learning_sessions | Ver propias |
| learning_sessions_select_teacher | SELECT | learning_sessions | Profesor ve |
| learning_sessions_update_own | UPDATE | learning_sessions | Actualizar propia |
| certificates_select_own | SELECT | certificates | Ver propios certificados |
| certificates_select_teacher | SELECT | certificates | Profesor ve |
| certificates_select_admin | SELECT | certificates | Admins ven |
| certificates_insert_system | INSERT | certificates | Sistema inserta |
| certificates_update_admin | UPDATE | certificates | Admins actualizan |
| certificates_delete_admin | DELETE | certificates | Admins eliminan |
| teacher_notes_select_own | SELECT | teacher_notes | Profesor ve sus notas |
| teacher_notes_insert_own | INSERT | teacher_notes | Profesor inserta |
| teacher_notes_update_own | UPDATE | teacher_notes | Profesor actualiza |
| teacher_notes_delete_own | DELETE | teacher_notes | Profesor elimina |
| reviewer_manage_own_reviews | ALL | manual_reviews | Reviewer gestiona sus reviews |
| teacher_view_classroom_reviews | SELECT | manual_reviews | Profesor ve de classroom |
| admin_view_tenant_reviews | SELECT | manual_reviews | Admin ve de tenant |
| super_admin_full_access_reviews | ALL | manual_reviews | Super admin acceso total |
| scheduled_missions_select_admin | SELECT | scheduled_missions | Admins ven |
| scheduled_missions_select_teacher | SELECT | scheduled_missions | Profesor ve |
| scheduled_missions_insert_teacher | INSERT | scheduled_missions | Profesor inserta |
| scheduled_missions_update_teacher | UPDATE | scheduled_missions | Profesor actualiza |
| user_difficulty_progress_select_own | SELECT | user_difficulty_progress | Ver propio |
| user_difficulty_progress_select_teacher | SELECT | user_difficulty_progress | Profesor ve |
| user_current_level_select_own | SELECT | user_current_level | Ver propio nivel |
| user_current_level_manage_system | ALL | user_current_level | Sistema gestiona |
| teacher_manage_own_interventions | ALL | teacher_interventions | Profesor sus intervenciones |
| teacher_view_classroom_interventions | SELECT | teacher_interventions | Profesor ve de classroom |
| admin_view_tenant_interventions | SELECT | teacher_interventions | Admin ve de tenant |
| admin_view_tenant_alerts | SELECT | student_intervention_alerts | Admin ve alertas |
| teacher_manage_classroom_alerts | UPDATE | student_intervention_alerts | Profesor gestiona |
| teacher_view_classroom_alerts | SELECT | student_intervention_alerts | Profesor ve |
| teacher_manage_own_config | ALL | teacher_alert_configurations | Profesor config propia |
| admin_manage_tenant_config | SELECT | teacher_alert_configurations | Admin ve config |

### social_features

| Policy | Tipo | Tabla | Descripcion |
|--------|------|-------|-------------|
| schools_read_tenant | SELECT | schools | Leer escuelas del tenant |
| schools_insert_admin | INSERT | schools | Solo admins crean |
| schools_update_admin | UPDATE | schools | Solo admins actualizan |
| classrooms_read_student | SELECT | classrooms | Estudiante ve su classroom |
| classrooms_read_teacher | SELECT | classrooms | Profesor ve sus classrooms |
| classrooms_read_admin | SELECT | classrooms | Admin ve todos |
| classrooms_insert_teacher | INSERT | classrooms | Profesor crea |
| classrooms_update_teacher | UPDATE | classrooms | Profesor actualiza |
| classrooms_manage_teacher | ALL | classrooms | Profesor gestiona sus classrooms |
| classrooms_select_admin | SELECT | classrooms | Admin ve |
| classrooms_select_student | SELECT | classrooms | Estudiante ve |
| classrooms_select_teacher | SELECT | classrooms | Profesor ve |
| classroom_members_read_student | SELECT | classroom_members | Estudiante ve |
| classroom_members_read_teacher | SELECT | classroom_members | Profesor ve |
| classroom_members_manage_teacher | ALL | classroom_members | Profesor gestiona |
| classroom_members_select_admin | SELECT | classroom_members | Admin ve |
| classroom_members_select_own | SELECT | classroom_members | Ver propios |
| classroom_members_select_teacher | SELECT | classroom_members | Profesor ve |
| friendships_select_own | SELECT | friendships | Ver propias amistades |
| friendships_delete_own | DELETE | friendships | Eliminar propias |
| friend_requests_select_own | SELECT | friend_requests | Ver propias solicitudes |
| friend_requests_insert_own | INSERT | friend_requests | Crear solicitudes |
| friend_requests_update_recipient | UPDATE | friend_requests | Recipient responde |
| friend_requests_delete_requester | DELETE | friend_requests | Requester cancela |
| teams_select_member | SELECT | teams | Miembros ven equipo |
| teams_select_admin | SELECT | teams | Admin ve todos |
| teams_manage_admin | ALL | teams | Admin gestiona |
| teams_update_member | UPDATE | teams | Miembros actualizan |
| team_members_read_own | SELECT | team_members | Ver propias membresías |
| team_challenges_read_members | SELECT | team_challenges | Miembros ven desafios |
| teacher_classrooms_read_teacher | SELECT | teacher_classrooms | Profesor ve sus asignaciones |
| teacher_classrooms_read_admin | SELECT | teacher_classrooms | Admin ve |
| teacher_classrooms_update_admin | UPDATE | teacher_classrooms | Admin actualiza |
| teacher_reports_teacher_policy | ALL | teacher_reports | Profesor sus reportes |
| teacher_reports_admin_policy | ALL | teacher_reports | Admin todos |
| scheduled_reports_teacher_policy | ALL | scheduled_reports | Profesor sus reportes |
| scheduled_reports_admin_policy | ALL | scheduled_reports | Admin todos |
| shared_reports_owner_policy | ALL | shared_reports | Owner gestiona |
| shared_reports_recipient_policy | SELECT | shared_reports | Recipient ve |
| shared_reports_admin_policy | ALL | shared_reports | Admin todos |

### educational_content

| Policy | Tipo | Tabla | Descripcion |
|--------|------|-------|-------------|
| modules_read_published | SELECT | modules | Ver modulos publicados |
| modules_read_teacher | SELECT | modules | Profesor ve todos |
| modules_manage_admin | ALL | modules | Admin gestiona |
| modules_all_admin | ALL | modules | Admin acceso total |
| modules_select_admin | SELECT | modules | Admin ve |
| modules_select_published | SELECT | modules | Ver publicados |
| exercises_read_active | SELECT | exercises | Ver ejercicios activos |
| exercises_read_teacher | SELECT | exercises | Profesor ve todos |
| exercises_manage_admin | ALL | exercises | Admin gestiona |
| exercises_all_admin | ALL | exercises | Admin acceso total |
| exercises_select_active | SELECT | exercises | Ver activos |
| exercises_select_admin | SELECT | exercises | Admin ve |
| teacher_content_view_own | SELECT | teacher_content | Profesor ve propio |
| teacher_content_view_public | SELECT | teacher_content | Ver publico |
| teacher_content_view_school | SELECT | teacher_content | Ver de escuela |
| teacher_content_view_shared | SELECT | teacher_content | Ver compartido |
| teacher_content_create_own | INSERT | teacher_content | Profesor crea |
| teacher_content_update_own | UPDATE | teacher_content | Profesor actualiza propio |
| teacher_content_update_shared | UPDATE | teacher_content | Actualizar compartido |
| teacher_content_delete_own | DELETE | teacher_content | Profesor elimina propio |
| teacher_content_admin_manage_all | ALL | teacher_content | Admin gestiona |
| teacher_content_student_view_classroom | SELECT | teacher_content | Estudiante ve de classroom |
| classroom_modules_teacher_access | ALL | classroom_modules | Profesor gestiona |
| classroom_modules_student_view | SELECT | classroom_modules | Estudiante ve |
| classroom_modules_admin_access | ALL | classroom_modules | Admin acceso total |

### notifications

| Policy | Tipo | Tabla | Descripcion |
|--------|------|-------|-------------|
| notifications_select_own | SELECT | notifications | Ver propias notificaciones |
| notifications_select_admin | SELECT | notifications | Admin ve todas |
| notifications_update_own | UPDATE | notifications | Actualizar propias |
| notifications_delete_own | DELETE | notifications | Eliminar propias |
| notification_preferences_select_own | SELECT | notification_preferences | Ver propias preferencias |
| notification_preferences_insert_own | INSERT | notification_preferences | Crear propias |
| notification_preferences_update_own | UPDATE | notification_preferences | Actualizar propias |
| notification_logs_select_own | SELECT | notification_logs | Ver propios logs |
| notification_logs_select_admin | SELECT | notification_logs | Admin ve todos |
| user_devices_select_own | SELECT | user_devices | Ver propios dispositivos |
| user_devices_insert_own | INSERT | user_devices | Agregar propios |
| user_devices_update_own | UPDATE | user_devices | Actualizar propios |
| user_devices_delete_own | DELETE | user_devices | Eliminar propios |

### audit_logging

| Policy | Tipo | Tabla | Descripcion |
|--------|------|-------|-------------|
| audit_logs_select_admin | SELECT | audit_logs | Admin ve logs |
| audit_logs_select_own | SELECT | audit_logs | Ver propios logs |
| performance_metrics_select_admin | SELECT | performance_metrics | Admin ve metricas |
| performance_metrics_insert_system | INSERT | performance_metrics | Sistema inserta |
| system_alerts_all_admin | ALL | system_alerts | Admin gestiona alertas |
| system_logs_select_admin | SELECT | system_logs | Admin ve logs |
| system_logs_insert_system | INSERT | system_logs | Sistema inserta |
| user_activity_logs_select_admin | SELECT | user_activity_logs | Admin ve |
| user_activity_logs_select_own | SELECT | user_activity_logs | Ver propios |
| user_activity_logs_insert_own | INSERT | user_activity_logs | Usuario inserta |
| user_activity_select_admin | SELECT | user_activity | Admin ve |
| user_activity_insert_system | INSERT | user_activity | Sistema inserta |
| activity_log_select_own | SELECT | activity_log | Ver propios |
| activity_log_select_admin | SELECT | activity_log | Admin ve |
| activity_log_insert_system | INSERT | activity_log | Sistema inserta |
| system_alerts_select_admin | SELECT | system_alerts | Admin ve |
| system_alerts_insert_admin | INSERT | system_alerts | Admin inserta |
| system_alerts_update_admin | UPDATE | system_alerts | Admin actualiza |
| system_alerts_delete_admin | DELETE | system_alerts | Admin elimina |
| system_alerts_select_tenant | SELECT | system_alerts | Tenant ve propias |

### communication

| Policy | Tipo | Tabla | Descripcion |
|--------|------|-------|-------------|
| messages_select_own | SELECT | messages | Ver propios mensajes |
| messages_select_classroom | SELECT | messages | Ver mensajes de classroom |
| messages_select_admin | SELECT | messages | Admin ve todos |
| messages_insert_own | INSERT | messages | Crear mensajes |
| messages_update_own | UPDATE | messages | Actualizar propios |
| messages_delete_own | DELETE | messages | Eliminar propios |
| message_participants_select_own | SELECT | message_participants | Ver propias participaciones |
| message_participants_update_own | UPDATE | message_participants | Actualizar propias |
| message_participants_insert_system | INSERT | message_participants | Sistema inserta |

### content_management

| Policy | Tipo | Tabla | Descripcion |
|--------|------|-------|-------------|
| marie_content_all_admin | ALL | marie_curie_content | Admin gestiona |
| marie_content_select_all | SELECT | marie_curie_content | Ver publicado |
| content_templates_all_admin | ALL | content_templates | Admin gestiona |
| content_templates_select_all | SELECT | content_templates | Ver activos |
| content_templates_select_public | SELECT | content_templates | Ver publicos |
| content_templates_select_tenant | SELECT | content_templates | Ver de tenant |
| content_templates_insert_own | INSERT | content_templates | Crear propios |
| content_templates_update_own | UPDATE | content_templates | Actualizar propios |
| content_templates_delete_own | DELETE | content_templates | Eliminar propios |
| media_files_all_admin | ALL | media_files | Admin gestiona |
| media_files_select_all | SELECT | media_files | Ver activos |
| media_files_insert_teacher | INSERT | media_files | Profesores suben |
| media_files_select_public | SELECT | media_files | Ver publicos |
| media_files_select_tenant | SELECT | media_files | Ver de tenant |
| media_files_insert_own | INSERT | media_files | Subir propios |
| media_files_update_own | UPDATE | media_files | Actualizar propios |
| media_files_delete_own | DELETE | media_files | Eliminar propios |
| flagged_content_select_admin | SELECT | flagged_content | Admin ve reportes |
| flagged_content_select_own | SELECT | flagged_content | Ver propios reportes |
| flagged_content_insert_authenticated | INSERT | flagged_content | Usuarios reportan |
| flagged_content_update_admin | UPDATE | flagged_content | Admin actualiza |
| flagged_content_delete_admin | DELETE | flagged_content | Admin elimina |

### system_configuration

| Policy | Tipo | Tabla | Descripcion |
|--------|------|-------|-------------|
| system_settings_all_admin | ALL | system_settings | Admin gestiona |
| system_settings_select_all | SELECT | system_settings | Autenticados leen |
| system_settings_select_admin | SELECT | system_settings | Admin ve |
| system_settings_insert_admin | INSERT | system_settings | Admin inserta |
| system_settings_update_admin | UPDATE | system_settings | Admin actualiza |
| system_settings_delete_admin | DELETE | system_settings | Admin elimina |
| system_settings_select_public | SELECT | system_settings | Ver publicos |
| feature_flags_all_admin | ALL | feature_flags | Admin gestiona |
| feature_flags_select_all | SELECT | feature_flags | Autenticados leen |
| notification_settings_select_admin | SELECT | notification_settings | Admin ve |
| notification_settings_insert_admin | INSERT | notification_settings | Admin inserta |
| notification_settings_update_admin | UPDATE | notification_settings | Admin actualiza |
| notification_settings_delete_admin | DELETE | notification_settings | Admin elimina |
| notification_settings_select_own | SELECT | notification_settings | Ver propias |
| notification_settings_update_own | UPDATE | notification_settings | Actualizar propias |
| notification_settings_select_tenant | SELECT | notification_settings | Ver de tenant |

---

## Funciones de Soporte RLS

Las siguientes funciones del schema `gamilit` son utilizadas en las condiciones de RLS:

| Funcion | Descripcion |
|---------|-------------|
| `gamilit.get_current_user_id()` | Obtiene UUID del usuario actual |
| `gamilit.get_current_user_role()` | Obtiene rol del usuario actual |
| `gamilit.get_current_tenant_id()` | Obtiene tenant_id actual |
| `gamilit.is_admin()` | Verifica si es admin o admin_teacher |
| `gamilit.is_super_admin()` | Verifica si es super_admin |

---

## Notas Importantes

1. **RLS Habilitado:** Todas las tablas principales tienen RLS habilitado
2. **Bypass:** El usuario `gamilit_user` no bypasea RLS (SECURITY DEFINER en funciones)
3. **Performance:** Indices optimizados para queries de RLS
4. **Multi-tenancy:** La mayoría de policies incluyen filtro por tenant_id
5. **Auditoria:** Cambios a policies requieren documentacion

---

*Documento generado automaticamente - BLOQUE 2 Plan Maestro GAMILIT*
*Fecha: 2026-02-03 | Version: 1.0.0*
