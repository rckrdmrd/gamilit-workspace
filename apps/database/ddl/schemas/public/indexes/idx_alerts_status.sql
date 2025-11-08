-- Índice: idx_alerts_status
-- Tabla: audit_logging
-- Schema: public

CREATE INDEX idx_alerts_status ON audit_logging.system_alerts(status);