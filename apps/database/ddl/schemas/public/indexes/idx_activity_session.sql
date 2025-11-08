-- Índice: idx_activity_session
-- Tabla: ON
-- Schema: public

CREATE INDEX idx_activity_session ON audit_logging.user_activity_logs(session_id);