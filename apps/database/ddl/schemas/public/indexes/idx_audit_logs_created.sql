-- Índice: idx_audit_logs_created
-- Tabla: audit_logging
-- Schema: public

CREATE INDEX idx_audit_logs_created ON audit_logging.audit_logs(created_at DESC);