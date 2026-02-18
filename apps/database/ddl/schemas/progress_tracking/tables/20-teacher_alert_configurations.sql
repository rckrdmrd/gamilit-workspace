-- =====================================================
-- Table: progress_tracking.teacher_alert_configurations
-- Description: Configuraciones personalizadas de alertas por profesor
-- Dependencies: auth_management.profiles, auth_management.tenants, social_features.classrooms
-- =====================================================

DROP TABLE IF EXISTS progress_tracking.teacher_alert_configurations CASCADE;

CREATE TABLE progress_tracking.teacher_alert_configurations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    classroom_id uuid,
    alert_type text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    threshold_value numeric(5,2),
    threshold_unit text,
    notify_email boolean DEFAULT false NOT NULL,
    notify_in_app boolean DEFAULT true NOT NULL,
    cooldown_hours integer DEFAULT 24,
    custom_settings jsonb,
    tenant_id uuid NOT NULL,
    created_at timestamptz DEFAULT gamilit.now_mexico(),
    updated_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT teacher_alert_configurations_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT teacher_alert_configurations_unique_config UNIQUE (teacher_id, classroom_id, alert_type),

    -- Check Constraints
    CONSTRAINT teacher_alert_configurations_alert_type_check CHECK ((alert_type = ANY (ARRAY['no_activity'::text, 'low_score'::text, 'declining_trend'::text, 'repeated_failures'::text, 'excessive_time'::text, 'low_engagement'::text]))),
    CONSTRAINT teacher_alert_configurations_threshold_unit_check CHECK ((threshold_unit IS NULL OR threshold_unit = ANY (ARRAY['percentage'::text, 'days'::text, 'count'::text, 'minutes'::text])))
);

-- Indexes
CREATE INDEX idx_teacher_alert_config_teacher ON progress_tracking.teacher_alert_configurations(teacher_id);
CREATE INDEX idx_teacher_alert_config_classroom ON progress_tracking.teacher_alert_configurations(classroom_id) WHERE classroom_id IS NOT NULL;
CREATE INDEX idx_teacher_alert_config_tenant ON progress_tracking.teacher_alert_configurations(tenant_id);
CREATE INDEX idx_teacher_alert_config_type ON progress_tracking.teacher_alert_configurations(alert_type);
CREATE INDEX idx_teacher_alert_config_enabled ON progress_tracking.teacher_alert_configurations(teacher_id, is_enabled) WHERE is_enabled = true;

-- Foreign Keys
ALTER TABLE ONLY progress_tracking.teacher_alert_configurations
    ADD CONSTRAINT teacher_alert_configurations_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY progress_tracking.teacher_alert_configurations
    ADD CONSTRAINT teacher_alert_configurations_classroom_id_fkey FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id) ON DELETE CASCADE;

ALTER TABLE ONLY progress_tracking.teacher_alert_configurations
    ADD CONSTRAINT teacher_alert_configurations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE;

-- Triggers
CREATE TRIGGER trg_teacher_alert_configurations_updated_at BEFORE UPDATE ON progress_tracking.teacher_alert_configurations FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

-- Row Level Security
ALTER TABLE progress_tracking.teacher_alert_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY teacher_manage_own_config ON progress_tracking.teacher_alert_configurations FOR ALL USING ((teacher_id = gamilit.get_current_user_id()));

CREATE POLICY admin_manage_tenant_config ON progress_tracking.teacher_alert_configurations FOR SELECT USING (((tenant_id IN ( SELECT p.tenant_id
   FROM auth_management.profiles p
  WHERE (p.id = gamilit.get_current_user_id()))) AND (EXISTS ( SELECT 1
   FROM auth_management.profiles p
  WHERE ((p.id = gamilit.get_current_user_id()) AND (p.role = ANY (ARRAY['super_admin'::auth_management.gamilit_role, 'admin_teacher'::auth_management.gamilit_role])))))));

-- Comments
COMMENT ON TABLE progress_tracking.teacher_alert_configurations IS 'Configuraciones personalizadas de alertas por profesor. Permite definir umbrales y preferencias de notificacion.';
COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.teacher_id IS 'ID del profesor que configura las alertas';
COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.classroom_id IS 'ID del aula especifica. NULL indica configuracion global del profesor';
COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.alert_type IS 'Tipo de alerta: no_activity, low_score, declining_trend, repeated_failures, excessive_time, low_engagement';
COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.is_enabled IS 'Indica si este tipo de alerta esta habilitado';
COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.threshold_value IS 'Valor del umbral para disparar la alerta';
COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.threshold_unit IS 'Unidad del umbral: percentage, days, count, minutes';
COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.notify_email IS 'Enviar notificacion por email';
COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.notify_in_app IS 'Mostrar notificacion en la aplicacion';
COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.cooldown_hours IS 'Horas minimas entre alertas del mismo tipo para el mismo estudiante';
COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.custom_settings IS 'Configuraciones adicionales especificas del tipo de alerta en formato JSON';

-- Permissions
ALTER TABLE progress_tracking.teacher_alert_configurations OWNER TO gamilit_user;
GRANT ALL ON TABLE progress_tracking.teacher_alert_configurations TO gamilit_user;
