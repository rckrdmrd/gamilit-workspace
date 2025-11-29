-- =====================================================
-- Tabla: admin_reports
-- Schema: admin_dashboard
-- Descripción: Registra reportes generados por administradores del sistema
-- Relacionado: EXT-002 (Admin Extendido - Reports)
-- Fecha: 2025-11-28
-- =====================================================

CREATE TABLE admin_dashboard.admin_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo de reporte: 'users', 'progress', 'engagement', 'gamification', 'content', 'assignments'
    report_type VARCHAR(50) NOT NULL,

    -- Formato del archivo: 'pdf', 'excel', 'csv'
    report_format VARCHAR(20) NOT NULL,

    -- Estado: 'pending', 'generating', 'completed', 'failed'
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    -- URL del archivo generado (ruta local o S3)
    file_url VARCHAR(500),

    -- Tamaño del archivo en bytes
    file_size INTEGER,

    -- Metadata del reporte (filtros, parámetros, configuración)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Mensaje de error si la generación falla
    error_message TEXT,

    -- Auditoría
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT gamilit.now_mexico(),
    completed_at TIMESTAMP,

    -- Fecha de expiración (para cleanup automático)
    -- Por defecto: created_at + 30 días
    expires_at TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_admin_reports_status CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    CONSTRAINT chk_admin_reports_file_size CHECK (file_size >= 0)
);

-- Índices para búsquedas comunes
CREATE INDEX idx_admin_reports_status ON admin_dashboard.admin_reports(status);
CREATE INDEX idx_admin_reports_requested_by ON admin_dashboard.admin_reports(requested_by);
CREATE INDEX idx_admin_reports_type ON admin_dashboard.admin_reports(report_type);
CREATE INDEX idx_admin_reports_created_at ON admin_dashboard.admin_reports(created_at DESC);
CREATE INDEX idx_admin_reports_expires_at ON admin_dashboard.admin_reports(expires_at) WHERE expires_at IS NOT NULL;

-- Comentarios
COMMENT ON TABLE admin_dashboard.admin_reports IS 'Registra reportes generados por administradores del sistema';
COMMENT ON COLUMN admin_dashboard.admin_reports.report_type IS 'Tipo de reporte generado (users, progress, engagement, etc.)';
COMMENT ON COLUMN admin_dashboard.admin_reports.report_format IS 'Formato del archivo (pdf, excel, csv)';
COMMENT ON COLUMN admin_dashboard.admin_reports.status IS 'Estado actual de la generación del reporte';
COMMENT ON COLUMN admin_dashboard.admin_reports.file_url IS 'URL del archivo generado (local o cloud storage)';
COMMENT ON COLUMN admin_dashboard.admin_reports.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN admin_dashboard.admin_reports.metadata IS 'Metadata del reporte (filtros, parámetros, configuración)';
COMMENT ON COLUMN admin_dashboard.admin_reports.error_message IS 'Mensaje de error si la generación falla';
COMMENT ON COLUMN admin_dashboard.admin_reports.expires_at IS 'Fecha de expiración para cleanup automático (por defecto: +30 días)';
