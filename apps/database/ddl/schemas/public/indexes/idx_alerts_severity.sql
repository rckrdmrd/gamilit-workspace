-- Índice: idx_alerts_severity
-- Tabla: audit_logging
-- Schema: public

CREATE INDEX idx_alerts_severity ON audit_logging.system_alerts(severity);