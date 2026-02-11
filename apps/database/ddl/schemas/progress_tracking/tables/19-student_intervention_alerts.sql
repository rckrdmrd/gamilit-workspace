-- =====================================================
-- Table: progress_tracking.student_intervention_alerts
-- Description: Alertas de intervención para identificar estudiantes en riesgo
-- Dependencies: auth_management.profiles, auth_management.tenants, social_features.classrooms
-- =====================================================

DROP TABLE IF EXISTS progress_tracking.student_intervention_alerts CASCADE;

CREATE TABLE progress_tracking.student_intervention_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    classroom_id uuid,
    alert_type text NOT NULL,
    severity text NOT NULL,
    title text NOT NULL,
    description text,
    metrics jsonb,
    status text DEFAULT 'active'::text,
    generated_at timestamptz DEFAULT gamilit.now_mexico() NOT NULL,
    acknowledged_at timestamptz,
    acknowledged_by uuid,
    resolved_at timestamptz,
    resolved_by uuid,
    resolution_notes text,
    tenant_id uuid NOT NULL,
    created_at timestamptz DEFAULT gamilit.now_mexico(),
    updated_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT student_intervention_alerts_pkey PRIMARY KEY (id),

    -- Check Constraints
    CONSTRAINT student_intervention_alerts_alert_type_check CHECK ((alert_type = ANY (ARRAY['no_activity'::text, 'low_score'::text, 'declining_trend'::text, 'repeated_failures'::text, 'excessive_time'::text, 'low_engagement'::text]))),
    CONSTRAINT student_intervention_alerts_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
    CONSTRAINT student_intervention_alerts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'acknowledged'::text, 'resolved'::text, 'dismissed'::text])))
);

-- Indexes
CREATE INDEX idx_student_alerts_classroom ON progress_tracking.student_intervention_alerts(classroom_id);
CREATE INDEX idx_student_alerts_classroom_status ON progress_tracking.student_intervention_alerts(classroom_id, status) WHERE status = 'active'::text;
CREATE INDEX idx_student_alerts_generated ON progress_tracking.student_intervention_alerts(generated_at DESC);
CREATE INDEX idx_student_alerts_severity ON progress_tracking.student_intervention_alerts(severity);
CREATE INDEX idx_student_alerts_status ON progress_tracking.student_intervention_alerts(status);
CREATE INDEX idx_student_alerts_student ON progress_tracking.student_intervention_alerts(student_id);
CREATE INDEX idx_student_alerts_tenant ON progress_tracking.student_intervention_alerts(tenant_id);
CREATE INDEX idx_student_alerts_type ON progress_tracking.student_intervention_alerts(alert_type);

-- Foreign Keys
ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_acknowledged_by_fkey FOREIGN KEY (acknowledged_by) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_classroom_id_fkey FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id) ON DELETE SET NULL;

ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE;

-- Triggers
CREATE TRIGGER trg_student_intervention_alerts_updated_at BEFORE UPDATE ON progress_tracking.student_intervention_alerts FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

-- Row Level Security
ALTER TABLE progress_tracking.student_intervention_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY admin_view_tenant_alerts ON progress_tracking.student_intervention_alerts FOR SELECT USING (((tenant_id IN ( SELECT p.tenant_id
   FROM auth_management.profiles p
  WHERE (p.id = gamilit.get_current_user_id()))) AND (EXISTS ( SELECT 1
   FROM auth_management.profiles p
  WHERE ((p.id = gamilit.get_current_user_id()) AND (p.role = ANY (ARRAY['SUPER_ADMIN'::auth_management.gamilit_role, 'ADMIN_TEACHER'::auth_management.gamilit_role])))))));

CREATE POLICY teacher_manage_classroom_alerts ON progress_tracking.student_intervention_alerts FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM social_features.teacher_classrooms tc
  WHERE ((tc.classroom_id = student_intervention_alerts.classroom_id) AND (tc.teacher_id = gamilit.get_current_user_id()) AND (tc.tenant_id = student_intervention_alerts.tenant_id)))));

CREATE POLICY teacher_view_classroom_alerts ON progress_tracking.student_intervention_alerts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM social_features.teacher_classrooms tc
  WHERE ((tc.classroom_id = student_intervention_alerts.classroom_id) AND (tc.teacher_id = gamilit.get_current_user_id()) AND (tc.tenant_id = student_intervention_alerts.tenant_id)))));

-- Comments
COMMENT ON TABLE progress_tracking.student_intervention_alerts IS 'Alertas de intervención para identificar estudiantes en riesgo que requieren atención del teacher';
COMMENT ON COLUMN progress_tracking.student_intervention_alerts.alert_type IS 'Tipo de alerta: no_activity (sin actividad), low_score (bajo rendimiento), declining_trend (tendencia decreciente), repeated_failures (fallos repetidos), excessive_time (tiempo excesivo), low_engagement (bajo engagement)';
COMMENT ON COLUMN progress_tracking.student_intervention_alerts.severity IS 'Severidad de la alerta: low, medium, high, critical';
COMMENT ON COLUMN progress_tracking.student_intervention_alerts.status IS 'Estado de la alerta: active, acknowledged (teacher notificado), resolved (resuelta), dismissed (descartada)';
COMMENT ON COLUMN progress_tracking.student_intervention_alerts.metrics IS 'Métricas asociadas a la alerta en formato JSON. Ejemplo: {"score": 45, "threshold": 60, "attempts": 5}';
COMMENT ON COLUMN progress_tracking.student_intervention_alerts.tenant_id IS 'ID del tenant para soporte multi-tenant';

-- Permissions
ALTER TABLE progress_tracking.student_intervention_alerts OWNER TO gamilit_user;
GRANT ALL ON TABLE progress_tracking.student_intervention_alerts TO gamilit_user;
