-- Índice: idx_activity_module
-- Tabla: audit_logging
-- Schema: public

CREATE INDEX idx_activity_module ON audit_logging.user_activity_logs(module_id) WHERE module_id IS NOT NULL;