-- =====================================================
-- TABLA: teacher_reports
-- DESCRIPCIÓN: Almacena metadatos de reportes generados por profesores
-- SCHEMA: social_features
-- FECHA: 2025-11-26
-- =====================================================

DROP TABLE IF EXISTS social_features.teacher_reports CASCADE;

CREATE TABLE social_features.teacher_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  classroom_id UUID,
  tenant_id UUID NOT NULL,

  -- Metadatos del reporte
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('individual', 'classroom', 'progress', 'analytics')),
  report_format VARCHAR(10) NOT NULL CHECK (report_format IN ('pdf', 'excel', 'csv')),

  -- Estadísticas
  student_count INTEGER DEFAULT 0,
  period_start DATE,
  period_end DATE,

  -- Archivo
  file_path TEXT,
  file_size_bytes BIGINT,

  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
  created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
  updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

  -- Foreign Keys
  CONSTRAINT fk_teacher_reports_teacher
    FOREIGN KEY (teacher_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_teacher_reports_classroom
    FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id) ON DELETE SET NULL,
  CONSTRAINT fk_teacher_reports_tenant
    FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE
);

-- Comentario de tabla
COMMENT ON TABLE social_features.teacher_reports IS 'Almacena metadatos de reportes generados por profesores';

-- Comentarios de columnas
COMMENT ON COLUMN social_features.teacher_reports.id IS 'Identificador único del reporte';
COMMENT ON COLUMN social_features.teacher_reports.teacher_id IS 'ID del profesor que generó el reporte';
COMMENT ON COLUMN social_features.teacher_reports.classroom_id IS 'ID del aula (NULL si es reporte individual o general)';
COMMENT ON COLUMN social_features.teacher_reports.tenant_id IS 'ID del tenant para soporte multi-tenant';
COMMENT ON COLUMN social_features.teacher_reports.report_name IS 'Nombre descriptivo del reporte';
COMMENT ON COLUMN social_features.teacher_reports.report_type IS 'Tipo de reporte: individual, classroom, progress, analytics';
COMMENT ON COLUMN social_features.teacher_reports.report_format IS 'Formato del archivo: pdf, excel, csv';
COMMENT ON COLUMN social_features.teacher_reports.student_count IS 'Número de estudiantes incluidos en el reporte';
COMMENT ON COLUMN social_features.teacher_reports.period_start IS 'Fecha de inicio del período reportado';
COMMENT ON COLUMN social_features.teacher_reports.period_end IS 'Fecha de fin del período reportado';
COMMENT ON COLUMN social_features.teacher_reports.file_path IS 'Ruta del archivo generado en el sistema de archivos o storage';
COMMENT ON COLUMN social_features.teacher_reports.file_size_bytes IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN social_features.teacher_reports.generated_at IS 'Timestamp de generación del reporte';
COMMENT ON COLUMN social_features.teacher_reports.created_at IS 'Timestamp de creación del registro';
COMMENT ON COLUMN social_features.teacher_reports.updated_at IS 'Timestamp de última actualización del registro';

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_teacher_reports_teacher_id
  ON social_features.teacher_reports(teacher_id);

CREATE INDEX IF NOT EXISTS idx_teacher_reports_tenant_id
  ON social_features.teacher_reports(tenant_id);

CREATE INDEX IF NOT EXISTS idx_teacher_reports_generated_at
  ON social_features.teacher_reports(generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_teacher_reports_classroom_id
  ON social_features.teacher_reports(classroom_id)
  WHERE classroom_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_teacher_reports_report_type
  ON social_features.teacher_reports(report_type);

-- Trigger para updated_at
-- NOTE: Trigger movido a archivo separado para evitar duplicación
-- Ver: social_features/triggers/29-trg_teacher_reports_updated_at.sql

-- RLS (Row Level Security)
ALTER TABLE social_features.teacher_reports ENABLE ROW LEVEL SECURITY;

-- NOTE: Policies movidas a archivo separado
-- Ver: social_features/rls-policies/08-teacher-reports-policies.sql
