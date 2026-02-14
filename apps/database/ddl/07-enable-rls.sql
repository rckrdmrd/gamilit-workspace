-- =====================================================
-- Enable RLS for Missing Tables - GAMILIT
-- Created: 2026-01-16
-- Task: TASK-2026-01-16-003
-- Description: Habilita Row Level Security en tablas
--              que no tenian RLS configurado
-- =====================================================
-- AUDIT: 77 tablas identificadas sin RLS
-- FASE 1: 25 tablas ALTA prioridad (datos de usuario)
-- =====================================================

-- ============================================
-- SECCION 1: AUTH_MANAGEMENT (4 tablas)
-- ============================================

-- 1.1 auth_attempts - Intentos de autenticacion
ALTER TABLE auth_management.auth_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_attempts_admin_all" ON auth_management.auth_attempts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

-- auth_attempts no tiene user_id; acceso propio via email
-- (cubierto por 07d-rls-policies-pending-tables.sql)

-- 1.2 parent_accounts - Cuentas de padres
ALTER TABLE auth_management.parent_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_accounts_admin_all" ON auth_management.parent_accounts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "parent_accounts_read_own" ON auth_management.parent_accounts
    FOR SELECT TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "parent_accounts_update_own" ON auth_management.parent_accounts
    FOR UPDATE TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

-- 1.3 parent_notifications - Notificaciones para padres
ALTER TABLE auth_management.parent_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_notifications_admin_all" ON auth_management.parent_notifications
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "parent_notifications_read_own" ON auth_management.parent_notifications
    FOR SELECT TO authenticated
    USING (parent_account_id IN (
        SELECT id FROM auth_management.parent_accounts WHERE profile_id = auth.uid()
    ));

-- 1.4 parent_student_links - Vinculos padre-estudiante
ALTER TABLE auth_management.parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_student_links_admin_all" ON auth_management.parent_student_links
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "parent_student_links_read_own" ON auth_management.parent_student_links
    FOR SELECT TO authenticated
    USING (
        parent_account_id IN (
            SELECT id FROM auth_management.parent_accounts WHERE profile_id = auth.uid()
        )
        OR student_id = auth.uid()
    );

-- ============================================
-- SECCION 2: COMMUNICATION (1 tabla)
-- ============================================

-- 2.1 message_participants - Participantes de mensajes
ALTER TABLE communication.message_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "message_participants_admin_all" ON communication.message_participants
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "message_participants_read_own" ON communication.message_participants
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "message_participants_insert_own" ON communication.message_participants
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- SECCION 3: EDUCATIONAL_CONTENT (5 tablas)
-- ============================================

-- 3.1 assignments - Tareas asignadas
ALTER TABLE educational_content.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_admin_all" ON educational_content.assignments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "assignments_teacher_manage" ON educational_content.assignments
    FOR ALL TO authenticated
    USING (
        teacher_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin_teacher'
        )
    );

CREATE POLICY "assignments_student_read" ON educational_content.assignments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM educational_content.assignment_students
            WHERE assignment_id = educational_content.assignments.id
            AND student_id = auth.uid()
        )
    );

-- 3.2 assignment_exercises - Ejercicios de tareas
ALTER TABLE educational_content.assignment_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignment_exercises_admin_all" ON educational_content.assignment_exercises
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "assignment_exercises_student_read" ON educational_content.assignment_exercises
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM educational_content.assignment_students ast
            WHERE ast.assignment_id = educational_content.assignment_exercises.assignment_id
            AND ast.student_id = auth.uid()
        )
    );

-- 3.3 assignment_students - Estudiantes asignados
ALTER TABLE educational_content.assignment_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignment_students_admin_teacher" ON educational_content.assignment_students
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "assignment_students_read_own" ON educational_content.assignment_students
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

-- 3.4 assignment_submissions - Entregas de tareas
ALTER TABLE educational_content.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignment_submissions_admin_teacher" ON educational_content.assignment_submissions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "assignment_submissions_student_own" ON educational_content.assignment_submissions
    FOR ALL TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- 3.5 teacher_content - Contenido de docentes
ALTER TABLE educational_content.teacher_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_content_admin_all" ON educational_content.teacher_contents
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "teacher_content_teacher_own" ON educational_content.teacher_contents
    FOR ALL TO authenticated
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "teacher_content_student_read_public" ON educational_content.teacher_contents
    FOR SELECT TO authenticated
    USING (visibility = 'public');

-- 3.6 media_attachments - Archivos multimedia adjuntos a ejercicios
ALTER TABLE educational_content.media_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_attachments_admin_all ON educational_content.media_attachments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY media_attachments_user_own ON educational_content.media_attachments
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- SECCION 4: GAMIFICATION_SYSTEM (3 tablas)
-- ============================================

-- 4.1 active_boosts - Boosts activos del usuario
ALTER TABLE gamification_system.active_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "active_boosts_admin_all" ON gamification_system.active_boosts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "active_boosts_user_own" ON gamification_system.active_boosts
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 4.2 inventory_transactions - Transacciones de inventario
ALTER TABLE gamification_system.inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_transactions_admin_all" ON gamification_system.inventory_transactions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "inventory_transactions_user_read_own" ON gamification_system.inventory_transactions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "inventory_transactions_user_insert_own" ON gamification_system.inventory_transactions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 4.3 user_purchases - Compras del usuario
ALTER TABLE gamification_system.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_purchases_admin_all" ON gamification_system.user_purchases
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "user_purchases_user_own" ON gamification_system.user_purchases
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- SECCION 5: LTI_INTEGRATION (2 tablas)
-- ============================================

-- 5.1 lti_grade_passback - Calificaciones LTI
ALTER TABLE lti_integration.lti_grade_passbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lti_grade_passback_admin_all" ON lti_integration.lti_grade_passbacks
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "lti_grade_passback_user_read_own" ON lti_integration.lti_grade_passbacks
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 5.2 lti_sessions - Sesiones LTI
ALTER TABLE lti_integration.lti_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lti_sessions_admin_all" ON lti_integration.lti_sessions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "lti_sessions_user_own" ON lti_integration.lti_sessions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- SECCION 6: PROGRESS_TRACKING (7 tablas)
-- ============================================

-- 6.1 manual_reviews - Revisiones manuales
ALTER TABLE progress_tracking.manual_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manual_reviews_admin_teacher" ON progress_tracking.manual_reviews
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "manual_reviews_student_read" ON progress_tracking.manual_reviews
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM progress_tracking.exercise_submissions es
            WHERE es.id = progress_tracking.manual_reviews.submission_id
            AND es.user_id = auth.uid()
        )
    );

-- 6.2 mastery_tracking - Seguimiento de maestria
ALTER TABLE progress_tracking.mastery_trackings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mastery_tracking_admin_teacher" ON progress_tracking.mastery_trackings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "mastery_tracking_user_own" ON progress_tracking.mastery_trackings
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 6.3 module_completion_tracking - Completacion de modulos
ALTER TABLE progress_tracking.module_completion_trackings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "module_completion_admin_teacher" ON progress_tracking.module_completion_trackings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "module_completion_user_own" ON progress_tracking.module_completion_trackings
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 6.4 skill_assessments - Evaluaciones de habilidades
ALTER TABLE progress_tracking.skill_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skill_assessments_admin_teacher" ON progress_tracking.skill_assessments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "skill_assessments_user_own" ON progress_tracking.skill_assessments
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 6.5 student_intervention_alerts - Alertas de intervencion
ALTER TABLE progress_tracking.student_intervention_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intervention_alerts_admin_teacher" ON progress_tracking.student_intervention_alerts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

-- 6.6 teacher_interventions - Intervenciones docentes
ALTER TABLE progress_tracking.teacher_interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_interventions_admin_teacher" ON progress_tracking.teacher_interventions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "teacher_interventions_student_read" ON progress_tracking.teacher_interventions
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

-- 6.7 user_current_level - Nivel actual del usuario
ALTER TABLE progress_tracking.user_current_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_current_level_admin_teacher" ON progress_tracking.user_current_levels
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "user_current_level_user_own" ON progress_tracking.user_current_levels
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- SECCION 7: SOCIAL_FEATURES (5 tablas)
-- ============================================

-- 7.1 challenge_participants - Participantes de retos
ALTER TABLE social_features.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenge_participants_admin" ON social_features.challenge_participants
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "challenge_participants_user_own" ON social_features.challenge_participants
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "challenge_participants_public_read" ON social_features.challenge_participants
    FOR SELECT TO authenticated
    USING (true);

-- 7.2 challenge_results - Resultados de retos
ALTER TABLE social_features.challenge_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenge_results_admin" ON social_features.challenge_results
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "challenge_results_public_read" ON social_features.challenge_results
    FOR SELECT TO authenticated
    USING (true);

-- 7.3 discussion_threads - Hilos de discusion
ALTER TABLE social_features.discussion_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discussion_threads_admin" ON social_features.discussion_threads
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "discussion_threads_classroom_members" ON social_features.discussion_threads
    FOR SELECT TO authenticated
    USING (
        classroom_id IN (
            SELECT classroom_id FROM social_features.classroom_members
            WHERE student_id = auth.uid()
        )
    );

CREATE POLICY "discussion_threads_create" ON social_features.discussion_threads
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- 7.4 peer_challenges - Retos entre pares
ALTER TABLE social_features.peer_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "peer_challenges_admin" ON social_features.peer_challenges
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "peer_challenges_participants" ON social_features.peer_challenges
    FOR ALL TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- 7.5 user_follows - Seguidores
ALTER TABLE social_features.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_follows_admin" ON social_features.user_follows
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "user_follows_own" ON social_features.user_follows
    FOR ALL TO authenticated
    USING (follower_id = auth.uid() OR following_id = auth.uid())
    WITH CHECK (follower_id = auth.uid());

-- ============================================
-- SECCION 8: TEACHER_REPORTS (ya en social_features)
-- ============================================

-- 8.1 teacher_reports - Reportes docentes
ALTER TABLE social_features.teacher_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_reports_admin_teacher" ON social_features.teacher_reports
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin_teacher', 'super_admin')
        )
    );

CREATE POLICY "teacher_reports_teacher_own" ON social_features.teacher_reports
    FOR ALL TO authenticated
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

-- ============================================
-- COMENTARIOS FINALES
-- ============================================

COMMENT ON TABLE auth_management.auth_attempts IS 'RLS enabled: Intentos de autenticacion - lectura propia + admin';
COMMENT ON TABLE auth_management.parent_accounts IS 'RLS enabled: Cuentas de padres - gestion propia + admin';
COMMENT ON TABLE auth_management.parent_notifications IS 'RLS enabled: Notificaciones padres - lectura propia + admin';
COMMENT ON TABLE auth_management.parent_student_links IS 'RLS enabled: Vinculos padre-estudiante - lectura bidireccional + admin';

COMMENT ON TABLE communication.message_participants IS 'RLS enabled: Participantes de mensajes - gestion propia + admin';

COMMENT ON TABLE educational_content.assignments IS 'RLS enabled: Tareas - teacher manage + student read asignadas';
COMMENT ON TABLE educational_content.assignment_exercises IS 'RLS enabled: Ejercicios de tareas - teacher manage + student read';
COMMENT ON TABLE educational_content.assignment_students IS 'RLS enabled: Estudiantes asignados - teacher manage + student read own';
COMMENT ON TABLE educational_content.assignment_submissions IS 'RLS enabled: Entregas - teacher review + student own';
COMMENT ON TABLE educational_content.teacher_contents IS 'RLS enabled: Contenido docente - teacher own + student read public';

COMMENT ON TABLE gamification_system.active_boosts IS 'RLS enabled: Boosts activos - gestion propia + admin';
COMMENT ON TABLE gamification_system.inventory_transactions IS 'RLS enabled: Transacciones inventario - lectura propia + admin';
COMMENT ON TABLE gamification_system.user_purchases IS 'RLS enabled: Compras usuario - gestion propia + admin';

COMMENT ON TABLE lti_integration.lti_grade_passbacks IS 'RLS enabled: Calificaciones LTI - lectura propia + admin';
COMMENT ON TABLE lti_integration.lti_sessions IS 'RLS enabled: Sesiones LTI - lectura propia + admin';

COMMENT ON TABLE progress_tracking.manual_reviews IS 'RLS enabled: Revisiones manuales - teacher manage + student read';
COMMENT ON TABLE progress_tracking.mastery_trackings IS 'RLS enabled: Seguimiento maestria - teacher view + student own';
COMMENT ON TABLE progress_tracking.module_completion_trackings IS 'RLS enabled: Completacion modulos - teacher view + student own';
COMMENT ON TABLE progress_tracking.skill_assessments IS 'RLS enabled: Evaluaciones habilidades - teacher view + student own';
COMMENT ON TABLE progress_tracking.student_intervention_alerts IS 'RLS enabled: Alertas intervencion - solo teacher + admin';
COMMENT ON TABLE progress_tracking.teacher_interventions IS 'RLS enabled: Intervenciones - teacher manage + student read';
COMMENT ON TABLE progress_tracking.user_current_levels IS 'RLS enabled: Nivel actual - gestion propia + teacher view';

COMMENT ON TABLE social_features.challenge_participants IS 'RLS enabled: Participantes retos - gestion propia + lectura publica';
COMMENT ON TABLE social_features.challenge_results IS 'RLS enabled: Resultados retos - lectura publica + admin manage';
COMMENT ON TABLE social_features.discussion_threads IS 'RLS enabled: Discusiones - miembros classroom + admin';
COMMENT ON TABLE social_features.peer_challenges IS 'RLS enabled: Retos peer - participantes + admin';
COMMENT ON TABLE social_features.user_follows IS 'RLS enabled: Seguidores - gestion propia + admin';
COMMENT ON TABLE social_features.teacher_reports IS 'RLS enabled: Reportes docente - teacher own + admin';

-- ============================================
-- FIN DEL ARCHIVO
-- Total tablas con RLS: 25 (Fase 1 - ALTA prioridad)
-- ============================================
