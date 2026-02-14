-- =====================================================
-- RLS Policies para 18 tablas con RLS ON pero sin policies
-- Creado: 2026-02-14
-- Tarea: TASK-2026-02-13-FIX-REDIS-WEBSOCKET-STARTUP (Accion 1b)
-- =====================================================
--
-- Estas tablas tenian ALTER TABLE ... ENABLE ROW LEVEL SECURITY
-- pero 0 policies definidas, lo que bloquea todo acceso para
-- roles no-propietarios (gamilit_user retorna 0 filas).
--
-- Patrones usados (consistentes con policies existentes):
--   - gamilit.get_current_user_id() para identificar usuario
--   - gamilit.is_admin() / gamilit.is_super_admin() para checks admin
--   - Subqueries a parent_accounts / classrooms para relaciones indirectas
--
-- =====================================================

-- =====================================================
-- 1. admin_dashboard.bulk_operations
-- Contexto: Operaciones masivas ejecutadas por admins
-- Columnas clave: started_by (uuid)
-- =====================================================

CREATE POLICY bulk_operations_admin_all
    ON admin_dashboard.bulk_operations
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY bulk_operations_read_own
    ON admin_dashboard.bulk_operations
    FOR SELECT
    USING (started_by = gamilit.get_current_user_id());

-- =====================================================
-- 2. auth_management.auth_attempts
-- Contexto: Log de intentos de autenticacion (seguridad)
-- Columnas clave: email (text), no tiene user_id directo
-- =====================================================

CREATE POLICY auth_attempts_admin_read
    ON auth_management.auth_attempts
    FOR SELECT
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY auth_attempts_system_insert
    ON auth_management.auth_attempts
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 3. auth_management.parent_accounts
-- Contexto: Cuentas de padres vinculadas a profile_id
-- Columnas clave: profile_id (uuid -> profiles.id)
-- =====================================================

CREATE POLICY parent_accounts_admin_all
    ON auth_management.parent_accounts
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY parent_accounts_read_own
    ON auth_management.parent_accounts
    FOR SELECT
    USING (profile_id = gamilit.get_current_user_id());

CREATE POLICY parent_accounts_update_own
    ON auth_management.parent_accounts
    FOR UPDATE
    USING (profile_id = gamilit.get_current_user_id());

CREATE POLICY parent_accounts_insert_own
    ON auth_management.parent_accounts
    FOR INSERT
    WITH CHECK (profile_id = gamilit.get_current_user_id());

-- =====================================================
-- 4. auth_management.parent_notifications
-- Contexto: Notificaciones enviadas a padres sobre estudiantes
-- Columnas clave: parent_account_id, student_id
-- =====================================================

CREATE POLICY parent_notifications_admin_all
    ON auth_management.parent_notifications
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY parent_notifications_read_own
    ON auth_management.parent_notifications
    FOR SELECT
    USING (parent_account_id IN (
        SELECT id FROM auth_management.parent_accounts
        WHERE profile_id = gamilit.get_current_user_id()
    ));

CREATE POLICY parent_notifications_update_own
    ON auth_management.parent_notifications
    FOR UPDATE
    USING (parent_account_id IN (
        SELECT id FROM auth_management.parent_accounts
        WHERE profile_id = gamilit.get_current_user_id()
    ));

CREATE POLICY parent_notifications_system_insert
    ON auth_management.parent_notifications
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 5. auth_management.parent_student_links
-- Contexto: Vinculacion padre-estudiante
-- Columnas clave: parent_account_id, student_id
-- =====================================================

CREATE POLICY parent_student_links_admin_all
    ON auth_management.parent_student_links
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY parent_student_links_parent_read
    ON auth_management.parent_student_links
    FOR SELECT
    USING (parent_account_id IN (
        SELECT id FROM auth_management.parent_accounts
        WHERE profile_id = gamilit.get_current_user_id()
    ));

CREATE POLICY parent_student_links_parent_manage
    ON auth_management.parent_student_links
    FOR INSERT
    WITH CHECK (parent_account_id IN (
        SELECT id FROM auth_management.parent_accounts
        WHERE profile_id = gamilit.get_current_user_id()
    ));

CREATE POLICY parent_student_links_student_read
    ON auth_management.parent_student_links
    FOR SELECT
    USING (student_id = gamilit.get_current_user_id());

-- =====================================================
-- 6. content_management.moderation_rules
-- Contexto: Reglas de moderacion de contenido (admin-only)
-- Columnas clave: created_by
-- =====================================================

CREATE POLICY moderation_rules_admin_all
    ON content_management.moderation_rules
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

-- =====================================================
-- 7. data_warehouse.ml_prediction_logs
-- Contexto: Logs de predicciones ML (admin read, system insert)
-- Columnas clave: student_id, tenant_id, created_by
-- =====================================================

CREATE POLICY ml_prediction_logs_admin_read
    ON data_warehouse.ml_prediction_logs
    FOR SELECT
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY ml_prediction_logs_system_insert
    ON data_warehouse.ml_prediction_logs
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 8. educational_content.assessment_rubrics
-- Contexto: Rubricas de evaluacion para ejercicios
-- Columnas clave: exercise_id, module_id, created_by, is_active
-- =====================================================

CREATE POLICY assessment_rubrics_admin_all
    ON educational_content.assessment_rubrics
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY assessment_rubrics_teacher_manage
    ON educational_content.assessment_rubrics
    FOR ALL
    USING (created_by = gamilit.get_current_user_id());

CREATE POLICY assessment_rubrics_read_active
    ON educational_content.assessment_rubrics
    FOR SELECT
    USING (is_active = true AND gamilit.get_current_user_id() IS NOT NULL);

-- =====================================================
-- 9. educational_content.classroom_modules
-- Contexto: Modulos asignados a aulas
-- Columnas clave: classroom_id, module_id, assigned_by, is_active
-- =====================================================

CREATE POLICY classroom_modules_admin_all
    ON educational_content.classroom_modules
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY classroom_modules_teacher_manage
    ON educational_content.classroom_modules
    FOR ALL
    USING (
        assigned_by = gamilit.get_current_user_id()
        OR classroom_id IN (
            SELECT id FROM social_features.classrooms
            WHERE teacher_id = gamilit.get_current_user_id()
        )
    );

CREATE POLICY classroom_modules_student_read
    ON educational_content.classroom_modules
    FOR SELECT
    USING (
        is_active = true
        AND classroom_id IN (
            SELECT classroom_id FROM social_features.classroom_members
            WHERE student_id = gamilit.get_current_user_id()
        )
    );

-- =====================================================
-- 10. educational_content.media_resources
-- Contexto: Recursos multimedia educativos
-- Columnas clave: tenant_id, created_by, is_active, is_public
-- =====================================================

CREATE POLICY media_resources_admin_all
    ON educational_content.media_resources
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY media_resources_creator_manage
    ON educational_content.media_resources
    FOR ALL
    USING (created_by = gamilit.get_current_user_id());

CREATE POLICY media_resources_read_active
    ON educational_content.media_resources
    FOR SELECT
    USING (is_active = true AND gamilit.get_current_user_id() IS NOT NULL);

-- =====================================================
-- 11. progress_tracking.scheduled_missions
-- Contexto: Misiones programadas para aulas
-- Columnas clave: mission_id, classroom_id, scheduled_by, is_active
-- =====================================================

CREATE POLICY scheduled_missions_admin_all
    ON progress_tracking.scheduled_missions
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY scheduled_missions_teacher_manage
    ON progress_tracking.scheduled_missions
    FOR ALL
    USING (scheduled_by = gamilit.get_current_user_id());

CREATE POLICY scheduled_missions_student_read
    ON progress_tracking.scheduled_missions
    FOR SELECT
    USING (
        is_active = true
        AND classroom_id IN (
            SELECT classroom_id FROM social_features.classroom_members
            WHERE student_id = gamilit.get_current_user_id()
        )
    );

-- =====================================================
-- 12. progress_tracking.student_intervention_alerts
-- Contexto: Alertas de intervencion generadas para estudiantes
-- Columnas clave: student_id, classroom_id, tenant_id
-- =====================================================

CREATE POLICY student_intervention_alerts_admin_all
    ON progress_tracking.student_intervention_alerts
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY student_intervention_alerts_student_read
    ON progress_tracking.student_intervention_alerts
    FOR SELECT
    USING (student_id = gamilit.get_current_user_id());

CREATE POLICY student_intervention_alerts_teacher_manage
    ON progress_tracking.student_intervention_alerts
    FOR ALL
    USING (
        classroom_id IN (
            SELECT id FROM social_features.classrooms
            WHERE teacher_id = gamilit.get_current_user_id()
        )
    );

CREATE POLICY student_intervention_alerts_system_insert
    ON progress_tracking.student_intervention_alerts
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 13. progress_tracking.teacher_alert_configurations
-- Contexto: Configuracion de alertas por maestro/aula
-- Columnas clave: teacher_id, classroom_id, tenant_id
-- =====================================================

CREATE POLICY teacher_alert_configs_admin_all
    ON progress_tracking.teacher_alert_configurations
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY teacher_alert_configs_teacher_own
    ON progress_tracking.teacher_alert_configurations
    FOR ALL
    USING (teacher_id = gamilit.get_current_user_id());

-- =====================================================
-- 14. progress_tracking.user_difficulty_progresses
-- Contexto: Progreso por nivel de dificultad de cada usuario
-- Columnas clave: user_id (PK component)
-- =====================================================

CREATE POLICY user_difficulty_progresses_admin_all
    ON progress_tracking.user_difficulty_progresses
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY user_difficulty_progresses_user_own
    ON progress_tracking.user_difficulty_progresses
    FOR ALL
    USING (user_id = gamilit.get_current_user_id());

CREATE POLICY user_difficulty_progresses_teacher_read
    ON progress_tracking.user_difficulty_progresses
    FOR SELECT
    USING (
        user_id IN (
            SELECT cm.student_id FROM social_features.classroom_members cm
            JOIN social_features.classrooms c ON cm.classroom_id = c.id
            WHERE c.teacher_id = gamilit.get_current_user_id()
        )
    );

-- =====================================================
-- 15. social_features.user_follows
-- Contexto: Relaciones de follow entre usuarios
-- Columnas clave: follower_id, following_id
-- =====================================================

CREATE POLICY user_follows_read_own
    ON social_features.user_follows
    FOR SELECT
    USING (
        follower_id = gamilit.get_current_user_id()
        OR following_id = gamilit.get_current_user_id()
    );

CREATE POLICY user_follows_insert_own
    ON social_features.user_follows
    FOR INSERT
    WITH CHECK (follower_id = gamilit.get_current_user_id());

CREATE POLICY user_follows_delete_own
    ON social_features.user_follows
    FOR DELETE
    USING (follower_id = gamilit.get_current_user_id());

CREATE POLICY user_follows_admin_all
    ON social_features.user_follows
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

-- =====================================================
-- 16. system_configuration.notification_settings
-- Contexto: Preferencias de notificacion por usuario
-- Columnas clave: user_id, tenant_id
-- =====================================================

CREATE POLICY notification_settings_admin_all
    ON system_configuration.notification_settings
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY notification_settings_user_own
    ON system_configuration.notification_settings
    FOR ALL
    USING (user_id = gamilit.get_current_user_id());

-- =====================================================
-- 17. system_configuration.rate_limits
-- Contexto: Configuracion de rate limiting (admin manage, read global)
-- Columnas clave: resource_type, is_enabled (no user-specific)
-- =====================================================

CREATE POLICY rate_limits_admin_all
    ON system_configuration.rate_limits
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY rate_limits_read_authenticated
    ON system_configuration.rate_limits
    FOR SELECT
    USING (is_enabled = true AND gamilit.get_current_user_id() IS NOT NULL);

-- =====================================================
-- 18. system_configuration.tenant_configurations
-- Contexto: Configuraciones por tenant (admin manage, authenticated read)
-- Columnas clave: tenant_id, config_key
-- =====================================================

CREATE POLICY tenant_configs_admin_all
    ON system_configuration.tenant_configurations
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY tenant_configs_read_authenticated
    ON system_configuration.tenant_configurations
    FOR SELECT
    USING (gamilit.get_current_user_id() IS NOT NULL);

-- =====================================================
-- 19. progress_tracking.user_learning_paths
-- Contexto: Rutas de aprendizaje asignadas a usuarios con progreso
-- Columnas clave: user_id (uuid -> profiles.id)
-- Riesgo: HIGH - datos de progreso personal del estudiante
-- =====================================================

ALTER TABLE progress_tracking.user_learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_learning_paths_admin_all
    ON progress_tracking.user_learning_paths
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

-- Usuarios pueden ver y gestionar sus propias rutas de aprendizaje
CREATE POLICY user_learning_paths_user_own
    ON progress_tracking.user_learning_paths
    FOR ALL
    USING (user_id = gamilit.get_current_user_id());

-- Maestros pueden ver rutas de sus estudiantes (lectura)
CREATE POLICY user_learning_paths_teacher_read
    ON progress_tracking.user_learning_paths
    FOR SELECT
    USING (
        user_id IN (
            SELECT cm.student_id FROM social_features.classroom_members cm
            JOIN social_features.classrooms c ON cm.classroom_id = c.id
            WHERE c.teacher_id = gamilit.get_current_user_id()
        )
    );

-- =====================================================
-- 20. progress_tracking.engagement_metrics
-- Contexto: Metricas diarias de engagement por usuario
-- Columnas clave: user_id (uuid -> profiles.id)
-- Riesgo: HIGH - datos de actividad y comportamiento del estudiante
-- =====================================================

ALTER TABLE progress_tracking.engagement_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY engagement_metrics_admin_all
    ON progress_tracking.engagement_metrics
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

-- Usuarios pueden ver sus propias metricas de engagement
CREATE POLICY engagement_metrics_user_own
    ON progress_tracking.engagement_metrics
    FOR SELECT
    USING (user_id = gamilit.get_current_user_id());

-- Maestros pueden ver metricas de sus estudiantes (lectura)
CREATE POLICY engagement_metrics_teacher_read
    ON progress_tracking.engagement_metrics
    FOR SELECT
    USING (
        user_id IN (
            SELECT cm.student_id FROM social_features.classroom_members cm
            JOIN social_features.classrooms c ON cm.classroom_id = c.id
            WHERE c.teacher_id = gamilit.get_current_user_id()
        )
    );

-- Sistema puede insertar/actualizar metricas (via triggers/funciones)
CREATE POLICY engagement_metrics_system_insert
    ON progress_tracking.engagement_metrics
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY engagement_metrics_system_update
    ON progress_tracking.engagement_metrics
    FOR UPDATE
    USING (user_id = gamilit.get_current_user_id())
    WITH CHECK (user_id = gamilit.get_current_user_id());

-- =====================================================
-- 21. progress_tracking.progress_snapshots
-- Contexto: Snapshots historicos de progreso de usuarios
-- Columnas clave: user_id (uuid -> profiles.id)
-- Riesgo: HIGH - historial completo de progreso academico
-- =====================================================

ALTER TABLE progress_tracking.progress_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY progress_snapshots_admin_all
    ON progress_tracking.progress_snapshots
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

-- Usuarios pueden ver sus propios snapshots de progreso
CREATE POLICY progress_snapshots_user_own
    ON progress_tracking.progress_snapshots
    FOR SELECT
    USING (user_id = gamilit.get_current_user_id());

-- Maestros pueden ver snapshots de sus estudiantes (lectura)
CREATE POLICY progress_snapshots_teacher_read
    ON progress_tracking.progress_snapshots
    FOR SELECT
    USING (
        user_id IN (
            SELECT cm.student_id FROM social_features.classroom_members cm
            JOIN social_features.classrooms c ON cm.classroom_id = c.id
            WHERE c.teacher_id = gamilit.get_current_user_id()
        )
    );

-- Sistema puede insertar snapshots (via jobs automaticos)
CREATE POLICY progress_snapshots_system_insert
    ON progress_tracking.progress_snapshots
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 22. auth_management.two_factor_tokens
-- Contexto: Tokens y configuracion de autenticacion de dos factores
-- Columnas clave: user_id (uuid -> auth.users.id)
-- Riesgo: HIGH - contiene secret_key, token_hash, backup_codes_encrypted
-- CRITICO: Acceso indebido permite bypass de 2FA
-- =====================================================

ALTER TABLE auth_management.two_factor_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY two_factor_tokens_admin_read
    ON auth_management.two_factor_tokens
    FOR SELECT
    USING (gamilit.is_super_admin());

-- Usuarios solo pueden ver/gestionar sus propios tokens 2FA
CREATE POLICY two_factor_tokens_user_own
    ON auth_management.two_factor_tokens
    FOR ALL
    USING (user_id = gamilit.get_current_user_id());

-- Sistema puede insertar tokens (durante flujo de habilitacion 2FA)
CREATE POLICY two_factor_tokens_system_insert
    ON auth_management.two_factor_tokens
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 23. social_features.guild_join_requests
-- Contexto: Solicitudes de union a gremios
-- Columnas clave: requester_id (uuid -> profiles.id),
--                 guild_id (uuid -> guilds.id),
--                 responded_by (uuid -> profiles.id)
-- Riesgo: HIGH - datos de interaccion social del usuario
-- =====================================================

ALTER TABLE social_features.guild_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY guild_join_requests_admin_all
    ON social_features.guild_join_requests
    FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

-- Usuarios pueden ver y crear sus propias solicitudes
CREATE POLICY guild_join_requests_requester_own
    ON social_features.guild_join_requests
    FOR ALL
    USING (requester_id = gamilit.get_current_user_id());

-- Lideres/officers del gremio pueden ver solicitudes pendientes para su gremio
CREATE POLICY guild_join_requests_guild_leader_read
    ON social_features.guild_join_requests
    FOR SELECT
    USING (
        guild_id IN (
            SELECT id FROM social_features.guilds
            WHERE leader_id = gamilit.get_current_user_id()
        )
    );

-- Lideres del gremio pueden actualizar solicitudes (aceptar/rechazar)
CREATE POLICY guild_join_requests_guild_leader_update
    ON social_features.guild_join_requests
    FOR UPDATE
    USING (
        guild_id IN (
            SELECT id FROM social_features.guilds
            WHERE leader_id = gamilit.get_current_user_id()
        )
    );

-- =====================================================
-- NOBYPASSRLS: gamilit_user debe respetar RLS
-- Sin esto, TODAS las policies son ignoradas para gamilit_user.
-- =====================================================

ALTER ROLE gamilit_user NOBYPASSRLS;

-- =====================================================
-- FORCE ROW LEVEL SECURITY
-- Necesario para tablas owned by gamilit_user, ya que
-- el owner bypasea RLS sin FORCE. El backend conecta
-- como gamilit_user, asi que RLS debe ser enforced.
-- =====================================================

ALTER TABLE auth_management.auth_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE educational_content.assessment_rubrics FORCE ROW LEVEL SECURITY;
ALTER TABLE educational_content.media_resources FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.scheduled_missions FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.student_intervention_alerts FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.teacher_alert_configurations FORCE ROW LEVEL SECURITY;
ALTER TABLE system_configuration.notification_settings FORCE ROW LEVEL SECURITY;

-- FORCE RLS para 5 tablas HIGH-RISK agregadas (A-003-exec)
ALTER TABLE progress_tracking.user_learning_paths FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.engagement_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.progress_snapshots FORCE ROW LEVEL SECURITY;
ALTER TABLE auth_management.two_factor_tokens FORCE ROW LEVEL SECURITY;
ALTER TABLE social_features.guild_join_requests FORCE ROW LEVEL SECURITY;

-- =====================================================
-- FIN - 23 tablas cubiertas con 73 policies + 12 FORCE RLS
-- =====================================================
