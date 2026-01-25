--
-- PostgreSQL table definition
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: teacher_alert_configurations; Type: TABLE; Schema: progress_tracking; Owner: gamilit_user
--
-- Documentacion:
-- Requerimiento: US-PM-007
-- Epic: Teacher Portal - Alert Configuration
--
-- DESCRIPCION:
-- Tabla para almacenar las configuraciones de alertas personalizadas por profesor.
-- Permite a los teachers configurar umbrales y preferencias de notificacion para cada tipo de alerta.
-- Soporta configuraciones globales (sin classroom_id) o por aula especifica.
--

CREATE TABLE IF NOT EXISTS progress_tracking.teacher_alert_configurations (
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
    created_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    CONSTRAINT teacher_alert_configurations_pkey PRIMARY KEY (id),
    CONSTRAINT teacher_alert_configurations_alert_type_check CHECK ((alert_type = ANY (ARRAY['no_activity'::text, 'low_score'::text, 'declining_trend'::text, 'repeated_failures'::text, 'excessive_time'::text, 'low_engagement'::text]))),
    CONSTRAINT teacher_alert_configurations_threshold_unit_check CHECK ((threshold_unit IS NULL OR threshold_unit = ANY (ARRAY['percentage'::text, 'days'::text, 'count'::text, 'minutes'::text]))),
    CONSTRAINT teacher_alert_configurations_unique_config UNIQUE (teacher_id, classroom_id, alert_type)
);


ALTER TABLE progress_tracking.teacher_alert_configurations OWNER TO gamilit_user;

--
-- Name: TABLE teacher_alert_configurations; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON TABLE progress_tracking.teacher_alert_configurations IS 'Configuraciones personalizadas de alertas por profesor. Permite definir umbrales y preferencias de notificacion.';


--
-- Name: COLUMN teacher_alert_configurations.teacher_id; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.teacher_id IS 'ID del profesor que configura las alertas';


--
-- Name: COLUMN teacher_alert_configurations.classroom_id; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.classroom_id IS 'ID del aula especifica. NULL indica configuracion global del profesor';


--
-- Name: COLUMN teacher_alert_configurations.alert_type; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.alert_type IS 'Tipo de alerta: no_activity, low_score, declining_trend, repeated_failures, excessive_time, low_engagement';


--
-- Name: COLUMN teacher_alert_configurations.is_enabled; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.is_enabled IS 'Indica si este tipo de alerta esta habilitado';


--
-- Name: COLUMN teacher_alert_configurations.threshold_value; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.threshold_value IS 'Valor del umbral para disparar la alerta';


--
-- Name: COLUMN teacher_alert_configurations.threshold_unit; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.threshold_unit IS 'Unidad del umbral: percentage, days, count, minutes';


--
-- Name: COLUMN teacher_alert_configurations.notify_email; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.notify_email IS 'Enviar notificacion por email';


--
-- Name: COLUMN teacher_alert_configurations.notify_in_app; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.notify_in_app IS 'Mostrar notificacion en la aplicacion';


--
-- Name: COLUMN teacher_alert_configurations.cooldown_hours; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.cooldown_hours IS 'Horas minimas entre alertas del mismo tipo para el mismo estudiante';


--
-- Name: COLUMN teacher_alert_configurations.custom_settings; Type: COMMENT; Schema: progress_tracking; Owner: gamilit_user
--

COMMENT ON COLUMN progress_tracking.teacher_alert_configurations.custom_settings IS 'Configuraciones adicionales especificas del tipo de alerta en formato JSON';


--
-- Name: idx_teacher_alert_config_teacher; Type: INDEX; Schema: progress_tracking; Owner: gamilit_user
--

CREATE INDEX idx_teacher_alert_config_teacher ON progress_tracking.teacher_alert_configurations USING btree (teacher_id);


--
-- Name: idx_teacher_alert_config_classroom; Type: INDEX; Schema: progress_tracking; Owner: gamilit_user
--

CREATE INDEX idx_teacher_alert_config_classroom ON progress_tracking.teacher_alert_configurations USING btree (classroom_id) WHERE (classroom_id IS NOT NULL);


--
-- Name: idx_teacher_alert_config_tenant; Type: INDEX; Schema: progress_tracking; Owner: gamilit_user
--

CREATE INDEX idx_teacher_alert_config_tenant ON progress_tracking.teacher_alert_configurations USING btree (tenant_id);


--
-- Name: idx_teacher_alert_config_type; Type: INDEX; Schema: progress_tracking; Owner: gamilit_user
--

CREATE INDEX idx_teacher_alert_config_type ON progress_tracking.teacher_alert_configurations USING btree (alert_type);


--
-- Name: idx_teacher_alert_config_enabled; Type: INDEX; Schema: progress_tracking; Owner: gamilit_user
--

CREATE INDEX idx_teacher_alert_config_enabled ON progress_tracking.teacher_alert_configurations USING btree (teacher_id, is_enabled) WHERE (is_enabled = true);


--
-- Name: teacher_alert_configurations trg_teacher_alert_configurations_updated_at; Type: TRIGGER; Schema: progress_tracking; Owner: gamilit_user
--

CREATE TRIGGER trg_teacher_alert_configurations_updated_at BEFORE UPDATE ON progress_tracking.teacher_alert_configurations FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();


--
-- Name: teacher_alert_configurations teacher_alert_configurations_teacher_id_fkey; Type: FK CONSTRAINT; Schema: progress_tracking; Owner: gamilit_user
--

ALTER TABLE ONLY progress_tracking.teacher_alert_configurations
    ADD CONSTRAINT teacher_alert_configurations_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;


--
-- Name: teacher_alert_configurations teacher_alert_configurations_classroom_id_fkey; Type: FK CONSTRAINT; Schema: progress_tracking; Owner: gamilit_user
--

ALTER TABLE ONLY progress_tracking.teacher_alert_configurations
    ADD CONSTRAINT teacher_alert_configurations_classroom_id_fkey FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id) ON DELETE CASCADE;


--
-- Name: teacher_alert_configurations teacher_alert_configurations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: progress_tracking; Owner: gamilit_user
--

ALTER TABLE ONLY progress_tracking.teacher_alert_configurations
    ADD CONSTRAINT teacher_alert_configurations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE;


--
-- Name: teacher_alert_configurations teacher_manage_own_config; Type: POLICY; Schema: progress_tracking; Owner: gamilit_user
--
-- Permite al profesor gestionar sus propias configuraciones

CREATE POLICY teacher_manage_own_config ON progress_tracking.teacher_alert_configurations FOR ALL USING ((teacher_id = gamilit.get_current_user_id()));


--
-- Name: teacher_alert_configurations admin_manage_tenant_config; Type: POLICY; Schema: progress_tracking; Owner: gamilit_user
--
-- Permite a los administradores ver configuraciones del tenant

CREATE POLICY admin_manage_tenant_config ON progress_tracking.teacher_alert_configurations FOR SELECT USING (((tenant_id IN ( SELECT p.tenant_id
   FROM auth_management.profiles p
  WHERE (p.id = gamilit.get_current_user_id()))) AND (EXISTS ( SELECT 1
   FROM auth_management.profiles p
  WHERE ((p.id = gamilit.get_current_user_id()) AND (p.role = ANY (ARRAY['SUPER_ADMIN'::auth_management.gamilit_role, 'ADMIN_TEACHER'::auth_management.gamilit_role])))))));


--
-- Name: teacher_alert_configurations; Type: ROW SECURITY; Schema: progress_tracking; Owner: gamilit_user
--

ALTER TABLE progress_tracking.teacher_alert_configurations ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE teacher_alert_configurations; Type: ACL; Schema: progress_tracking; Owner: gamilit_user
--

GRANT ALL ON TABLE progress_tracking.teacher_alert_configurations TO gamilit_user;


--
-- PostgreSQL table definition complete
--
