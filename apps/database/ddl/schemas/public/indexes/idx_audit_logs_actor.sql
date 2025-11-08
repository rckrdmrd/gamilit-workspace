-- Índice: idx_audit_logs_actor
-- Tabla: audit_logging
-- Schema: public

CREATE INDEX idx_audit_logs_actor ON audit_logging.audit_logs(actor_id);