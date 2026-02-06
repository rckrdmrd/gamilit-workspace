-- =====================================================
-- TABLA: shared_reports
-- DESCRIPCIÓN: Registro de reportes compartidos entre profesores
-- SCHEMA: social_features
-- FECHA: 2026-01-19
-- TASK: TASK-2026-01-18-015 Sprint 5.3
-- ACTUALIZADO: 2026-01-25 (Sync Entity-DDL Discrepancies)
-- =====================================================

CREATE TABLE IF NOT EXISTS social_features.shared_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  shared_by UUID NOT NULL,
  shared_with UUID NOT NULL,
  tenant_id UUID NOT NULL,

  -- Permisos
  permission_level VARCHAR(20) DEFAULT 'view' CHECK (permission_level IN ('view', 'download', 'edit')),

  -- Estado de revocación (sincronizado con Entity 2026-01-25)
  is_revoked BOOLEAN DEFAULT FALSE,

  -- Tracking de acceso
  accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Expiración opcional
  expires_at TIMESTAMPTZ,

  -- Mensaje opcional
  share_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

  -- Foreign Keys
  CONSTRAINT fk_shared_reports_report
    FOREIGN KEY (report_id) REFERENCES social_features.teacher_reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_shared_reports_shared_by
    FOREIGN KEY (shared_by) REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_shared_reports_shared_with
    FOREIGN KEY (shared_with) REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_shared_reports_tenant
    FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE,

  -- Constraint: No compartir consigo mismo
  CONSTRAINT chk_shared_reports_not_self CHECK (shared_by != shared_with)
);

-- Constraint único: Un reporte solo puede ser compartido una vez con cada usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_reports_unique
  ON social_features.shared_reports(report_id, shared_with);

-- Comentario de tabla
COMMENT ON TABLE social_features.shared_reports IS 'Registro de reportes compartidos entre profesores. Sincronizado con Entity (2026-01-25)';

-- Comentarios de columnas
COMMENT ON COLUMN social_features.shared_reports.id IS 'Identificador único del registro de compartir';
COMMENT ON COLUMN social_features.shared_reports.report_id IS 'ID del reporte compartido';
COMMENT ON COLUMN social_features.shared_reports.shared_by IS 'ID del profesor que comparte';
COMMENT ON COLUMN social_features.shared_reports.shared_with IS 'ID del profesor con quien se comparte';
COMMENT ON COLUMN social_features.shared_reports.tenant_id IS 'ID del tenant para soporte multi-tenant';
COMMENT ON COLUMN social_features.shared_reports.permission_level IS 'Nivel de permiso: view, download, edit';
COMMENT ON COLUMN social_features.shared_reports.is_revoked IS 'Si el acceso compartido fue revocado por el propietario';
COMMENT ON COLUMN social_features.shared_reports.accessed_at IS 'Última vez que se accedió al reporte compartido';
COMMENT ON COLUMN social_features.shared_reports.access_count IS 'Número de veces que se ha accedido';
COMMENT ON COLUMN social_features.shared_reports.expires_at IS 'Fecha de expiración del acceso (NULL = sin expiración)';
COMMENT ON COLUMN social_features.shared_reports.share_message IS 'Mensaje opcional del profesor que comparte';
COMMENT ON COLUMN social_features.shared_reports.created_at IS 'Timestamp de creación del registro';

-- Índices
CREATE INDEX IF NOT EXISTS idx_shared_reports_report_id
  ON social_features.shared_reports(report_id);

CREATE INDEX IF NOT EXISTS idx_shared_reports_shared_by
  ON social_features.shared_reports(shared_by);

CREATE INDEX IF NOT EXISTS idx_shared_reports_shared_with
  ON social_features.shared_reports(shared_with);

CREATE INDEX IF NOT EXISTS idx_shared_reports_tenant_id
  ON social_features.shared_reports(tenant_id);

CREATE INDEX IF NOT EXISTS idx_shared_reports_expires
  ON social_features.shared_reports(expires_at)
  WHERE expires_at IS NOT NULL;

-- Índice para reportes activos no revocados (sincronizado con Entity 2026-01-25)
CREATE INDEX IF NOT EXISTS idx_shared_reports_active
  ON social_features.shared_reports(shared_with, is_revoked)
  WHERE is_revoked = FALSE;

-- RLS (Row Level Security)
ALTER TABLE social_features.shared_reports ENABLE ROW LEVEL SECURITY;

-- Policy: El que comparte puede ver sus shares
CREATE POLICY shared_reports_owner_policy ON social_features.shared_reports
  FOR ALL
  USING (shared_by = current_setting('app.current_user_id', true)::UUID)
  WITH CHECK (shared_by = current_setting('app.current_user_id', true)::UUID);

-- Policy: El destinatario puede ver los shares que le enviaron
CREATE POLICY shared_reports_recipient_policy ON social_features.shared_reports
  FOR SELECT
  USING (
    shared_with = current_setting('app.current_user_id', true)::UUID
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Policy: Admins can see all shares in their tenant
CREATE POLICY shared_reports_admin_policy ON social_features.shared_reports
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id', true)::UUID
    AND current_setting('app.current_user_role', true) IN ('admin', 'super_admin')
  );
