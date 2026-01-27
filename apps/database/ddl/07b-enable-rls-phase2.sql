-- =====================================================
-- Enable RLS Phase 2 - GAMILIT
-- Created: 2026-01-27
-- Task: TASK-P2-RLS-EXPANSION-2026-01-27
-- Description: Expande cobertura RLS de 25 a 70+ tablas
--              Gap: RLS-P1-001
-- =====================================================
-- FASE 2: 45+ tablas adicionales
-- Target: 50%+ cobertura RLS (70+ tablas)
-- =====================================================

-- ============================================
-- SECCION 1: GAMIFICATION_SYSTEM (8 tablas)
-- Tablas con datos de usuario sensibles
-- ============================================

-- 1.1 user_stats - Estadisticas de gamificacion
-- NOTA: Ya tiene policies definidas inline, solo habilitar RLS
ALTER TABLE gamification_system.user_stats ENABLE ROW LEVEL SECURITY;

-- 1.2 user_achievements - Logros desbloqueados
-- NOTA: Ya tiene policies definidas inline, solo habilitar RLS
ALTER TABLE gamification_system.user_achievements ENABLE ROW LEVEL SECURITY;

-- 1.3 ml_coins_transactions - Transacciones de monedas
-- NOTA: Ya tiene policies definidas inline, solo habilitar RLS
ALTER TABLE gamification_system.ml_coins_transactions ENABLE ROW LEVEL SECURITY;

-- 1.4 comodines_inventory - Inventario de comodines
ALTER TABLE gamification_system.comodines_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY comodines_inventory_admin_all ON gamification_system.comodines_inventory
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY comodines_inventory_user_own ON gamification_system.comodines_inventory
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 1.5 user_ranks - Rangos del usuario
ALTER TABLE gamification_system.user_ranks ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_ranks_admin_all ON gamification_system.user_ranks
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY user_ranks_user_read_own ON gamification_system.user_ranks
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY user_ranks_public_leaderboard ON gamification_system.user_ranks
    FOR SELECT TO authenticated
    USING (true);  -- Leaderboards son publicos

-- 1.6 comodin_usage_log - Log de uso de comodines
ALTER TABLE gamification_system.comodin_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY comodin_usage_log_admin_all ON gamification_system.comodin_usage_log
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY comodin_usage_log_user_read_own ON gamification_system.comodin_usage_log
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 1.7 comodin_usage_tracking - Tracking de comodines
ALTER TABLE gamification_system.comodin_usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY comodin_usage_tracking_admin_all ON gamification_system.comodin_usage_tracking
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY comodin_usage_tracking_user_own ON gamification_system.comodin_usage_tracking
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 1.8 classroom_missions - Misiones de aula
ALTER TABLE gamification_system.classroom_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY classroom_missions_admin_teacher ON gamification_system.classroom_missions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY classroom_missions_student_read ON gamification_system.classroom_missions
    FOR SELECT TO authenticated
    USING (
        classroom_id IN (
            SELECT classroom_id FROM social_features.classroom_members
            WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- SECCION 2: NOTIFICATIONS (4 tablas)
-- Notificaciones y preferencias de usuario
-- ============================================

-- 2.1 notifications - Notificaciones del usuario
ALTER TABLE notifications.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_admin_all ON notifications.notifications
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY notifications_user_read_own ON notifications.notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY notifications_user_update_own ON notifications.notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 2.2 notification_preferences - Preferencias de notificacion
ALTER TABLE notifications.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_preferences_admin_all ON notifications.notification_preferences
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY notification_preferences_user_own ON notifications.notification_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 2.3 notification_logs - Logs de notificaciones (solo admin)
ALTER TABLE notifications.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_logs_admin_only ON notifications.notification_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 2.4 user_devices - Dispositivos del usuario
ALTER TABLE notifications.user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_devices_admin_all ON notifications.user_devices
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY user_devices_user_own ON notifications.user_devices
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- SECCION 3: COMMUNICATION (1 tabla)
-- Mensajes entre usuarios
-- ============================================

-- 3.1 messages - Mensajes
ALTER TABLE communication.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_admin_all ON communication.messages
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Usuario puede ver mensajes donde es sender o recipient
CREATE POLICY messages_user_read_own ON communication.messages
    FOR SELECT TO authenticated
    USING (
        sender_id = auth.uid()
        OR recipient_id = auth.uid()
        OR classroom_id IN (
            SELECT classroom_id FROM social_features.classroom_members
            WHERE user_id = auth.uid()
        )
    );

-- Usuario solo puede enviar mensajes como si mismo
CREATE POLICY messages_user_insert ON communication.messages
    FOR INSERT TO authenticated
    WITH CHECK (sender_id = auth.uid());

-- Usuario puede actualizar solo sus propios mensajes
CREATE POLICY messages_user_update_own ON communication.messages
    FOR UPDATE TO authenticated
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- ============================================
-- SECCION 4: PROGRESS_TRACKING (8 tablas adicionales)
-- Tracking de progreso del estudiante
-- ============================================

-- 4.1 learning_sessions - Sesiones de aprendizaje
ALTER TABLE progress_tracking.learning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_sessions_admin_teacher ON progress_tracking.learning_sessions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY learning_sessions_user_own ON progress_tracking.learning_sessions
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 4.2 exercise_attempts - Intentos de ejercicios
ALTER TABLE progress_tracking.exercise_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY exercise_attempts_admin_teacher ON progress_tracking.exercise_attempts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY exercise_attempts_user_own ON progress_tracking.exercise_attempts
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 4.3 exercise_submissions - Entregas de ejercicios
ALTER TABLE progress_tracking.exercise_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY exercise_submissions_admin_teacher ON progress_tracking.exercise_submissions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY exercise_submissions_user_own ON progress_tracking.exercise_submissions
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 4.4 scheduled_missions - Misiones programadas
ALTER TABLE progress_tracking.scheduled_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY scheduled_missions_admin_teacher ON progress_tracking.scheduled_missions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY scheduled_missions_user_own ON progress_tracking.scheduled_missions
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 4.5 user_difficulty_progress - Progreso por dificultad
ALTER TABLE progress_tracking.user_difficulty_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_difficulty_progress_admin_teacher ON progress_tracking.user_difficulty_progress
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY user_difficulty_progress_user_own ON progress_tracking.user_difficulty_progress
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 4.6 module_progress - Progreso por modulo
ALTER TABLE progress_tracking.module_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY module_progress_admin_teacher ON progress_tracking.module_progress
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY module_progress_user_own ON progress_tracking.module_progress
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 4.7 teacher_notes - Notas del docente
ALTER TABLE progress_tracking.teacher_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY teacher_notes_admin_teacher ON progress_tracking.teacher_notes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY teacher_notes_student_read_own ON progress_tracking.teacher_notes
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

-- 4.8 certificates - Certificados del usuario
ALTER TABLE progress_tracking.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY certificates_admin_teacher ON progress_tracking.certificates
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY certificates_user_read_own ON progress_tracking.certificates
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- SECCION 5: SOCIAL_FEATURES (6 tablas adicionales)
-- Funcionalidades sociales
-- ============================================

-- 5.1 classroom_members - Miembros del aula
ALTER TABLE social_features.classroom_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY classroom_members_admin_teacher ON social_features.classroom_members
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY classroom_members_user_read_own ON social_features.classroom_members
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY classroom_members_same_classroom ON social_features.classroom_members
    FOR SELECT TO authenticated
    USING (
        classroom_id IN (
            SELECT classroom_id FROM social_features.classroom_members
            WHERE user_id = auth.uid()
        )
    );

-- 5.2 team_members - Miembros de equipo
ALTER TABLE social_features.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_members_admin ON social_features.team_members
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY team_members_user_own ON social_features.team_members
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY team_members_same_team ON social_features.team_members
    FOR SELECT TO authenticated
    USING (
        team_id IN (
            SELECT team_id FROM social_features.team_members
            WHERE user_id = auth.uid()
        )
    );

-- 5.3 friendships - Relaciones de amistad
ALTER TABLE social_features.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY friendships_admin ON social_features.friendships
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY friendships_user_own ON social_features.friendships
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR friend_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 5.4 team_challenges - Desafios entre equipos
ALTER TABLE social_features.team_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_challenges_admin ON social_features.team_challenges
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY team_challenges_participants ON social_features.team_challenges
    FOR SELECT TO authenticated
    USING (
        challenger_team_id IN (
            SELECT team_id FROM social_features.team_members WHERE user_id = auth.uid()
        )
        OR challenged_team_id IN (
            SELECT team_id FROM social_features.team_members WHERE user_id = auth.uid()
        )
    );

-- 5.5 social_interactions - Interacciones sociales
ALTER TABLE social_features.social_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY social_interactions_admin ON social_features.social_interactions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY social_interactions_user_own ON social_features.social_interactions
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 5.6 classrooms - Aulas (teacher view)
ALTER TABLE social_features.classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY classrooms_admin_teacher ON social_features.classrooms
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY classrooms_teacher_own ON social_features.classrooms
    FOR ALL TO authenticated
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY classrooms_student_member ON social_features.classrooms
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT classroom_id FROM social_features.classroom_members
            WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- SECCION 6: AUDIT_LOGGING (2 tablas)
-- Logs de auditoria
-- ============================================

-- 6.1 audit_logs - Logs de auditoria (solo admin)
ALTER TABLE audit_logging.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_admin_only ON audit_logging.audit_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 6.2 user_activity_logs - Logs de actividad de usuario
ALTER TABLE audit_logging.user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_activity_logs_admin ON audit_logging.user_activity_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY user_activity_logs_user_read_own ON audit_logging.user_activity_logs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- SECCION 7: AUTH_MANAGEMENT (4 tablas adicionales)
-- Gestion de autenticacion
-- ============================================

-- 7.1 user_preferences - Preferencias del usuario
ALTER TABLE auth_management.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_preferences_admin_all ON auth_management.user_preferences
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY user_preferences_user_own ON auth_management.user_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 7.2 user_sessions - Sesiones del usuario
ALTER TABLE auth_management.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_sessions_admin_all ON auth_management.user_sessions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY user_sessions_user_own ON auth_management.user_sessions
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 7.3 security_events - Eventos de seguridad
ALTER TABLE auth_management.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY security_events_admin_only ON auth_management.security_events
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY security_events_user_read_own ON auth_management.security_events
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 7.4 email_verification_tokens - Tokens de verificacion (solo admin/sistema)
ALTER TABLE auth_management.email_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_verification_tokens_admin_only ON auth_management.email_verification_tokens
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- ============================================
-- SECCION 8: ADMIN_DASHBOARD (1 tabla)
-- Dashboard administrativo
-- ============================================

-- 8.1 bulk_operations - Operaciones masivas (solo admin)
ALTER TABLE admin_dashboard.bulk_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY bulk_operations_admin_only ON admin_dashboard.bulk_operations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- ============================================
-- COMENTARIOS FINALES
-- ============================================

COMMENT ON TABLE gamification_system.user_stats IS 'RLS enabled (Phase 2): Estadisticas gamificacion - gestion propia + admin';
COMMENT ON TABLE gamification_system.user_achievements IS 'RLS enabled (Phase 2): Logros usuario - gestion propia + admin';
COMMENT ON TABLE gamification_system.ml_coins_transactions IS 'RLS enabled (Phase 2): Transacciones ML - lectura propia + admin';
COMMENT ON TABLE gamification_system.comodines_inventory IS 'RLS enabled (Phase 2): Inventario comodines - gestion propia + admin';
COMMENT ON TABLE gamification_system.user_ranks IS 'RLS enabled (Phase 2): Rangos usuario - leaderboard publico + admin';
COMMENT ON TABLE gamification_system.comodin_usage_log IS 'RLS enabled (Phase 2): Log comodines - lectura propia + teacher/admin';
COMMENT ON TABLE gamification_system.comodin_usage_tracking IS 'RLS enabled (Phase 2): Tracking comodines - gestion propia + teacher/admin';
COMMENT ON TABLE gamification_system.classroom_missions IS 'RLS enabled (Phase 2): Misiones aula - teacher manage + student read';

COMMENT ON TABLE notifications.notifications IS 'RLS enabled (Phase 2): Notificaciones - lectura/update propia + admin';
COMMENT ON TABLE notifications.notification_preferences IS 'RLS enabled (Phase 2): Preferencias notif - gestion propia + admin';
COMMENT ON TABLE notifications.notification_logs IS 'RLS enabled (Phase 2): Logs notificaciones - solo admin';
COMMENT ON TABLE notifications.user_devices IS 'RLS enabled (Phase 2): Dispositivos usuario - gestion propia + admin';

COMMENT ON TABLE communication.messages IS 'RLS enabled (Phase 2): Mensajes - sender/recipient/classroom + admin';

COMMENT ON TABLE progress_tracking.learning_sessions IS 'RLS enabled (Phase 2): Sesiones aprendizaje - gestion propia + teacher/admin';
COMMENT ON TABLE progress_tracking.exercise_attempts IS 'RLS enabled (Phase 2): Intentos ejercicios - gestion propia + teacher/admin';
COMMENT ON TABLE progress_tracking.exercise_submissions IS 'RLS enabled (Phase 2): Entregas ejercicios - gestion propia + teacher/admin';
COMMENT ON TABLE progress_tracking.scheduled_missions IS 'RLS enabled (Phase 2): Misiones programadas - gestion propia + teacher/admin';
COMMENT ON TABLE progress_tracking.user_difficulty_progress IS 'RLS enabled (Phase 2): Progreso dificultad - gestion propia + teacher/admin';
COMMENT ON TABLE progress_tracking.module_progress IS 'RLS enabled (Phase 2): Progreso modulos - gestion propia + teacher/admin';
COMMENT ON TABLE progress_tracking.teacher_notes IS 'RLS enabled (Phase 2): Notas docente - teacher manage + student read';
COMMENT ON TABLE progress_tracking.certificates IS 'RLS enabled (Phase 2): Certificados - lectura propia + teacher/admin';

COMMENT ON TABLE social_features.classroom_members IS 'RLS enabled (Phase 2): Miembros aula - same classroom visible + teacher/admin';
COMMENT ON TABLE social_features.team_members IS 'RLS enabled (Phase 2): Miembros equipo - same team visible + admin';
COMMENT ON TABLE social_features.friendships IS 'RLS enabled (Phase 2): Amistades - participantes + admin';
COMMENT ON TABLE social_features.team_challenges IS 'RLS enabled (Phase 2): Desafios equipos - participantes + admin';
COMMENT ON TABLE social_features.social_interactions IS 'RLS enabled (Phase 2): Interacciones - gestion propia + admin';
COMMENT ON TABLE social_features.classrooms IS 'RLS enabled (Phase 2): Aulas - teacher own + student member + admin';

COMMENT ON TABLE audit_logging.audit_logs IS 'RLS enabled (Phase 2): Audit logs - solo admin';
COMMENT ON TABLE audit_logging.user_activity_logs IS 'RLS enabled (Phase 2): Activity logs - lectura propia + admin';

COMMENT ON TABLE auth_management.user_preferences IS 'RLS enabled (Phase 2): Preferencias usuario - gestion propia + admin';
COMMENT ON TABLE auth_management.user_sessions IS 'RLS enabled (Phase 2): Sesiones usuario - gestion propia + admin';
COMMENT ON TABLE auth_management.security_events IS 'RLS enabled (Phase 2): Eventos seguridad - lectura propia + admin';
COMMENT ON TABLE auth_management.email_verification_tokens IS 'RLS enabled (Phase 2): Tokens verificacion - solo admin';

COMMENT ON TABLE admin_dashboard.bulk_operations IS 'RLS enabled (Phase 2): Operaciones masivas - solo admin';

-- ============================================
-- FIN DEL ARCHIVO
-- Total tablas con RLS agregadas en Fase 2: 34
-- Total tablas con RLS (Fase 1 + 2): 25 + 34 = 59
-- ============================================
