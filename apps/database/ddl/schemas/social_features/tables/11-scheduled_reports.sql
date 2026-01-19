-- =====================================================
-- TABLA: scheduled_reports
-- DESCRIPCIÓN: Configuración de reportes programados para profesores
-- SCHEMA: social_features
-- FECHA: 2026-01-19
-- TASK: TASK-2026-01-18-015 Sprint 5.1
-- =====================================================

CREATE TABLE IF NOT EXISTS social_features.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  classroom_id UUID,
  tenant_id UUID NOT NULL,

  -- Configuración del reporte
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('individual', 'classroom', 'progress', 'analytics')),
  report_format VARCHAR(10) NOT NULL DEFAULT 'pdf' CHECK (report_format IN ('pdf', 'excel', 'csv')),
  template_id VARCHAR(50),

  -- Configuración del schedule
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Domingo, 6=Sábado (para weekly)
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 28),  -- Para monthly
  time_of_day TIME NOT NULL DEFAULT '08:00:00',
  timezone VARCHAR(50) DEFAULT 'America/Mexico_City',

  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_error TEXT,
  run_count INTEGER DEFAULT 0,

  -- Notificaciones
  notify_email BOOLEAN DEFAULT false,
  email_recipients TEXT[],  -- Array de emails

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
  updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

  -- Foreign Keys
  CONSTRAINT fk_scheduled_reports_teacher
    FOREIGN KEY (teacher_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_scheduled_reports_classroom
    FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id) ON DELETE SET NULL,
  CONSTRAINT fk_scheduled_reports_tenant
    FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE
);

-- Comentario de tabla
COMMENT ON TABLE social_features.scheduled_reports IS 'Configuración de reportes programados para generación automática';

-- Comentarios de columnas
COMMENT ON COLUMN social_features.scheduled_reports.id IS 'Identificador único del schedule';
COMMENT ON COLUMN social_features.scheduled_reports.teacher_id IS 'ID del profesor propietario del schedule';
COMMENT ON COLUMN social_features.scheduled_reports.classroom_id IS 'ID del aula para el reporte (NULL para todos)';
COMMENT ON COLUMN social_features.scheduled_reports.tenant_id IS 'ID del tenant para soporte multi-tenant';
COMMENT ON COLUMN social_features.scheduled_reports.report_name IS 'Nombre descriptivo del reporte programado';
COMMENT ON COLUMN social_features.scheduled_reports.report_type IS 'Tipo de reporte a generar';
COMMENT ON COLUMN social_features.scheduled_reports.report_format IS 'Formato del reporte: pdf, excel, csv';
COMMENT ON COLUMN social_features.scheduled_reports.template_id IS 'ID de plantilla opcional';
COMMENT ON COLUMN social_features.scheduled_reports.frequency IS 'Frecuencia: daily, weekly, monthly';
COMMENT ON COLUMN social_features.scheduled_reports.day_of_week IS 'Día de la semana para reportes semanales (0=Dom, 6=Sáb)';
COMMENT ON COLUMN social_features.scheduled_reports.day_of_month IS 'Día del mes para reportes mensuales (1-28)';
COMMENT ON COLUMN social_features.scheduled_reports.time_of_day IS 'Hora de generación del reporte';
COMMENT ON COLUMN social_features.scheduled_reports.timezone IS 'Zona horaria para el schedule';
COMMENT ON COLUMN social_features.scheduled_reports.is_active IS 'Si el schedule está activo';
COMMENT ON COLUMN social_features.scheduled_reports.last_run_at IS 'Última ejecución del schedule';
COMMENT ON COLUMN social_features.scheduled_reports.next_run_at IS 'Próxima ejecución programada';
COMMENT ON COLUMN social_features.scheduled_reports.last_error IS 'Último error si falló la generación';
COMMENT ON COLUMN social_features.scheduled_reports.run_count IS 'Número de veces que se ha ejecutado';
COMMENT ON COLUMN social_features.scheduled_reports.notify_email IS 'Si enviar notificación por email';
COMMENT ON COLUMN social_features.scheduled_reports.email_recipients IS 'Lista de emails para notificación';

-- Índices
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_teacher_id
  ON social_features.scheduled_reports(teacher_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_tenant_id
  ON social_features.scheduled_reports(tenant_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run
  ON social_features.scheduled_reports(next_run_at)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active
  ON social_features.scheduled_reports(is_active)
  WHERE is_active = true;

-- RLS (Row Level Security)
ALTER TABLE social_features.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can only see/modify their own schedules
CREATE POLICY scheduled_reports_teacher_policy ON social_features.scheduled_reports
  FOR ALL
  USING (teacher_id = current_setting('app.current_user_id', true)::UUID)
  WITH CHECK (teacher_id = current_setting('app.current_user_id', true)::UUID);

-- Policy: Admins can see all schedules in their tenant
CREATE POLICY scheduled_reports_admin_policy ON social_features.scheduled_reports
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id', true)::UUID
    AND current_setting('app.current_user_role', true) IN ('admin', 'super_admin')
  );
