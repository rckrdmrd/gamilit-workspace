-- Índice: idx_alerts_open
-- Tabla: audit_logging
-- Schema: public

CREATE INDEX idx_alerts_open ON audit_logging.system_alerts(status, severity) WHERE status = 'open';