-- =====================================================
-- Tabla: metrics_history
-- Schema: admin_dashboard
-- Descripcion: Almacena historial de metricas del sistema para monitoreo
-- Relacionado: TASK-MONITORING-HISTORY-PERSISTENCE
-- Fecha: 2026-01-07
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_dashboard.metrics_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Timestamp de la metrica
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metricas de memoria
    memory_total_mb NUMERIC(10, 2) NOT NULL,
    memory_used_mb NUMERIC(10, 2) NOT NULL,
    memory_free_mb NUMERIC(10, 2) NOT NULL,
    memory_usage_percent NUMERIC(5, 2) NOT NULL,
    heap_used_mb NUMERIC(10, 2),
    heap_total_mb NUMERIC(10, 2),

    -- Metricas de CPU
    cpu_user_ms NUMERIC(12, 2),
    cpu_system_ms NUMERIC(12, 2),
    cpu_usage_percent NUMERIC(5, 2),
    cpu_cores INTEGER,
    load_average_1m NUMERIC(5, 2),
    load_average_5m NUMERIC(5, 2),
    load_average_15m NUMERIC(5, 2),

    -- Metricas del proceso
    process_uptime_seconds INTEGER,
    active_handles INTEGER,
    active_requests INTEGER,

    -- Metricas del sistema
    system_uptime_seconds INTEGER,

    -- Metadata
    node_version VARCHAR(20),
    platform VARCHAR(50),
    hostname VARCHAR(255),

    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraint para evitar duplicados en el mismo segundo
    CONSTRAINT uq_metrics_history_recorded_at UNIQUE (recorded_at)
);

-- =====================================================
-- Indices para consultas eficientes
-- =====================================================

-- Indice principal para consultas por rango de tiempo
CREATE INDEX idx_metrics_history_recorded_at
    ON admin_dashboard.metrics_history(recorded_at DESC);

-- Indice para cleanup de registros antiguos
CREATE INDEX idx_metrics_history_created_at
    ON admin_dashboard.metrics_history(created_at);

-- Indice para consultas por uso de memoria alto
CREATE INDEX idx_metrics_history_memory_usage
    ON admin_dashboard.metrics_history(memory_usage_percent)
    WHERE memory_usage_percent > 80;

-- =====================================================
-- Particionamiento por tiempo (opcional para alto volumen)
-- =====================================================
-- NOTA: En produccion con alto volumen, considerar:
-- - Particionamiento por mes/semana
-- - Retention policy automatica (30-90 dias)
-- - Agregacion de datos antiguos (hourly -> daily -> weekly)

-- =====================================================
-- Funcion de cleanup automatico
-- =====================================================

CREATE OR REPLACE FUNCTION admin_dashboard.cleanup_old_metrics(
    p_retention_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    deleted_count INTEGER,
    status_message TEXT
) AS $$
DECLARE
    v_deleted_count INTEGER;
    v_cutoff_date TIMESTAMPTZ;
BEGIN
    v_cutoff_date := NOW() - (p_retention_days || ' days')::INTERVAL;

    DELETE FROM admin_dashboard.metrics_history
    WHERE recorded_at < v_cutoff_date;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN QUERY SELECT
        v_deleted_count,
        format('Deleted %s metrics older than %s days (before %s)',
               v_deleted_count, p_retention_days, v_cutoff_date);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comentarios
-- =====================================================

COMMENT ON TABLE admin_dashboard.metrics_history IS
'Almacena historial de metricas del sistema para monitoreo en AdminMonitoringPage';

COMMENT ON COLUMN admin_dashboard.metrics_history.recorded_at IS
'Timestamp de cuando se registro la metrica';

COMMENT ON COLUMN admin_dashboard.metrics_history.memory_usage_percent IS
'Porcentaje de uso de memoria del sistema (0-100)';

COMMENT ON COLUMN admin_dashboard.metrics_history.cpu_usage_percent IS
'Porcentaje estimado de uso de CPU';

COMMENT ON COLUMN admin_dashboard.metrics_history.load_average_1m IS
'Load average del ultimo minuto';

COMMENT ON FUNCTION admin_dashboard.cleanup_old_metrics IS
'Elimina metricas mas antiguas que N dias. Default: 30 dias';

-- =====================================================
-- Grants
-- =====================================================

GRANT SELECT, INSERT, DELETE ON admin_dashboard.metrics_history TO gamilit_user;
GRANT EXECUTE ON FUNCTION admin_dashboard.cleanup_old_metrics TO gamilit_user;
