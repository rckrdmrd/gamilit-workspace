-- Índice: idx_alerts_triggered
-- Tabla: audit_logging
-- Schema: public

CREATE INDEX idx_alerts_triggered ON audit_logging.system_alerts(triggered_at DESC);