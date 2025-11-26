--
-- PostgreSQL database dump
--

\restrict kbum8PVMgj5CLpUrEBeJlXIL8TxLp3qKyGRYM1icgHe84QAeAoEm90c4NVmH2oU

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

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
-- Name: student_intervention_alerts; Type: TABLE; Schema: progress_tracking; Owner: postgres
--
-- 📚 Documentación:
-- Requerimiento: GAP-ALERTS-001
-- Epic: Teacher Portal - Intervention Alerts
-- Especificación: orchestration/agentes/architecture-analyst/gap-analysis-teacher-portal-2025-11-24/REPORTE-GAP-ANALYSIS-TEACHER-PORTAL.md
--
-- DESCRIPCIÓN:
-- Tabla para almacenar alertas de intervención de estudiantes en riesgo.
-- Permite a los teachers identificar y dar seguimiento a estudiantes que requieren atención especial
-- por bajo rendimiento, inactividad, fallos repetidos, etc.
--

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
    generated_at timestamp with time zone DEFAULT gamilit.now_mexico() NOT NULL,
    acknowledged_at timestamp with time zone,
    acknowledged_by uuid,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    resolution_notes text,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    CONSTRAINT student_intervention_alerts_alert_type_check CHECK ((alert_type = ANY (ARRAY['no_activity'::text, 'low_score'::text, 'declining_trend'::text, 'repeated_failures'::text, 'excessive_time'::text, 'low_engagement'::text]))),
    CONSTRAINT student_intervention_alerts_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
    CONSTRAINT student_intervention_alerts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'acknowledged'::text, 'resolved'::text, 'dismissed'::text])))
);


ALTER TABLE progress_tracking.student_intervention_alerts OWNER TO gamilit_user;

--
-- Name: TABLE student_intervention_alerts; Type: COMMENT; Schema: progress_tracking; Owner: postgres
--

COMMENT ON TABLE progress_tracking.student_intervention_alerts IS 'Alertas de intervención para identificar estudiantes en riesgo que requieren atención del teacher';


--
-- Name: COLUMN student_intervention_alerts.alert_type; Type: COMMENT; Schema: progress_tracking; Owner: postgres
--

COMMENT ON COLUMN progress_tracking.student_intervention_alerts.alert_type IS 'Tipo de alerta: no_activity (sin actividad), low_score (bajo rendimiento), declining_trend (tendencia decreciente), repeated_failures (fallos repetidos), excessive_time (tiempo excesivo), low_engagement (bajo engagement)';


--
-- Name: COLUMN student_intervention_alerts.severity; Type: COMMENT; Schema: progress_tracking; Owner: postgres
--

COMMENT ON COLUMN progress_tracking.student_intervention_alerts.severity IS 'Severidad de la alerta: low, medium, high, critical';


--
-- Name: COLUMN student_intervention_alerts.status; Type: COMMENT; Schema: progress_tracking; Owner: postgres
--

COMMENT ON COLUMN progress_tracking.student_intervention_alerts.status IS 'Estado de la alerta: active, acknowledged (teacher notificado), resolved (resuelta), dismissed (descartada)';


--
-- Name: COLUMN student_intervention_alerts.metrics; Type: COMMENT; Schema: progress_tracking; Owner: postgres
--

COMMENT ON COLUMN progress_tracking.student_intervention_alerts.metrics IS 'Métricas asociadas a la alerta en formato JSON. Ejemplo: {"score": 45, "threshold": 60, "attempts": 5}';


--
-- Name: COLUMN student_intervention_alerts.tenant_id; Type: COMMENT; Schema: progress_tracking; Owner: postgres
--

COMMENT ON COLUMN progress_tracking.student_intervention_alerts.tenant_id IS 'ID del tenant para soporte multi-tenant';


--
-- Name: student_intervention_alerts student_intervention_alerts_pkey; Type: CONSTRAINT; Schema: progress_tracking; Owner: postgres
--

ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_pkey PRIMARY KEY (id);


--
-- Name: idx_student_alerts_classroom; Type: INDEX; Schema: progress_tracking; Owner: postgres
--

CREATE INDEX idx_student_alerts_classroom ON progress_tracking.student_intervention_alerts USING btree (classroom_id);


--
-- Name: idx_student_alerts_classroom_status; Type: INDEX; Schema: progress_tracking; Owner: postgres
--

CREATE INDEX idx_student_alerts_classroom_status ON progress_tracking.student_intervention_alerts USING btree (classroom_id, status) WHERE (status = 'active'::text);


--
-- Name: idx_student_alerts_generated; Type: INDEX; Schema: progress_tracking; Owner: postgres
--

CREATE INDEX idx_student_alerts_generated ON progress_tracking.student_intervention_alerts USING btree (generated_at DESC);


--
-- Name: idx_student_alerts_severity; Type: INDEX; Schema: progress_tracking; Owner: postgres
--

CREATE INDEX idx_student_alerts_severity ON progress_tracking.student_intervention_alerts USING btree (severity);


--
-- Name: idx_student_alerts_status; Type: INDEX; Schema: progress_tracking; Owner: postgres
--

CREATE INDEX idx_student_alerts_status ON progress_tracking.student_intervention_alerts USING btree (status);


--
-- Name: idx_student_alerts_student; Type: INDEX; Schema: progress_tracking; Owner: postgres
--

CREATE INDEX idx_student_alerts_student ON progress_tracking.student_intervention_alerts USING btree (student_id);


--
-- Name: idx_student_alerts_tenant; Type: INDEX; Schema: progress_tracking; Owner: postgres
--

CREATE INDEX idx_student_alerts_tenant ON progress_tracking.student_intervention_alerts USING btree (tenant_id);


--
-- Name: idx_student_alerts_type; Type: INDEX; Schema: progress_tracking; Owner: postgres
--

CREATE INDEX idx_student_alerts_type ON progress_tracking.student_intervention_alerts USING btree (alert_type);


--
-- Name: student_intervention_alerts trg_student_intervention_alerts_updated_at; Type: TRIGGER; Schema: progress_tracking; Owner: postgres
--

CREATE TRIGGER trg_student_intervention_alerts_updated_at BEFORE UPDATE ON progress_tracking.student_intervention_alerts FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();


--
-- Name: student_intervention_alerts student_intervention_alerts_acknowledged_by_fkey; Type: FK CONSTRAINT; Schema: progress_tracking; Owner: postgres
--

ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_acknowledged_by_fkey FOREIGN KEY (acknowledged_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: student_intervention_alerts student_intervention_alerts_classroom_id_fkey; Type: FK CONSTRAINT; Schema: progress_tracking; Owner: postgres
--

ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_classroom_id_fkey FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id) ON DELETE SET NULL;


--
-- Name: student_intervention_alerts student_intervention_alerts_resolved_by_fkey; Type: FK CONSTRAINT; Schema: progress_tracking; Owner: postgres
--

ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: student_intervention_alerts student_intervention_alerts_student_id_fkey; Type: FK CONSTRAINT; Schema: progress_tracking; Owner: postgres
--

ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: student_intervention_alerts student_intervention_alerts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: progress_tracking; Owner: postgres
--

ALTER TABLE ONLY progress_tracking.student_intervention_alerts
    ADD CONSTRAINT student_intervention_alerts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE;


--
-- Name: student_intervention_alerts admin_view_tenant_alerts; Type: POLICY; Schema: progress_tracking; Owner: postgres
--
-- CORRECCIÓN 2025-11-24: Cambiado auth.users a auth_management.profiles (schema correcto)

CREATE POLICY admin_view_tenant_alerts ON progress_tracking.student_intervention_alerts FOR SELECT USING (((tenant_id IN ( SELECT p.tenant_id
   FROM auth_management.profiles p
  WHERE (p.id = gamilit.get_current_user_id()))) AND (EXISTS ( SELECT 1
   FROM auth_management.profiles p
  WHERE ((p.id = gamilit.get_current_user_id()) AND (p.role = ANY (ARRAY['SUPER_ADMIN'::auth_management.gamilit_role, 'ADMIN_TEACHER'::auth_management.gamilit_role])))))));


--
-- Name: student_intervention_alerts teacher_manage_classroom_alerts; Type: POLICY; Schema: progress_tracking; Owner: postgres
--

CREATE POLICY teacher_manage_classroom_alerts ON progress_tracking.student_intervention_alerts FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM social_features.teacher_classrooms tc
  WHERE ((tc.classroom_id = student_intervention_alerts.classroom_id) AND (tc.teacher_id = gamilit.get_current_user_id()) AND (tc.tenant_id = student_intervention_alerts.tenant_id)))));


--
-- Name: student_intervention_alerts teacher_view_classroom_alerts; Type: POLICY; Schema: progress_tracking; Owner: postgres
--

CREATE POLICY teacher_view_classroom_alerts ON progress_tracking.student_intervention_alerts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM social_features.teacher_classrooms tc
  WHERE ((tc.classroom_id = student_intervention_alerts.classroom_id) AND (tc.teacher_id = gamilit.get_current_user_id()) AND (tc.tenant_id = student_intervention_alerts.tenant_id)))));


--
-- Name: student_intervention_alerts; Type: ROW SECURITY; Schema: progress_tracking; Owner: postgres
--

ALTER TABLE progress_tracking.student_intervention_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE student_intervention_alerts; Type: ACL; Schema: progress_tracking; Owner: postgres
--

GRANT ALL ON TABLE progress_tracking.student_intervention_alerts TO gamilit_user;


--
-- PostgreSQL database dump complete
--

\unrestrict kbum8PVMgj5CLpUrEBeJlXIL8TxLp3qKyGRYM1icgHe84QAeAoEm90c4NVmH2oU
