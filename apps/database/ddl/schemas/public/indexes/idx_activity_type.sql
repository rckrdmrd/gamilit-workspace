-- Índice: idx_activity_type
-- Tabla: audit_logging
-- Schema: public

CREATE INDEX idx_activity_type ON audit_logging.user_activity_logs(activity_type);