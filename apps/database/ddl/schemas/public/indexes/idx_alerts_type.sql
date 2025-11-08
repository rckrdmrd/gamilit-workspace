-- Índice: idx_alerts_type
-- Tabla: audit_logging
-- Schema: public

CREATE INDEX idx_alerts_type ON audit_logging.system_alerts(alert_type);