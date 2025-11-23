-- ========================================
-- CORRECCIÓN C1.3.1: Crear tabla system_metrics
-- ========================================

/**
 * Tabla para almacenar métricas del sistema agregadas
 * Usada por: apps/database/seeds/dev/audit_logging/02-system-metrics.sql
 *
 * DECISIÓN: Crear tabla (OPCIÓN A)
 * Si no se necesita esta tabla, eliminar el seed en su lugar
 */

-- Verificar que el esquema existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'audit_logging') THEN
        RAISE EXCEPTION 'Schema audit_logging no existe. Ejecutar primero el DDL de schemas.';
    END IF;
END $$;

-- Crear tabla system_metrics
CREATE TABLE IF NOT EXISTS audit_logging.system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(255) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type VARCHAR(50), -- Podría ser ENUM si existe audit_logging.metric_type
    aggregation_period VARCHAR(50), -- Podría ser ENUM si existe audit_logging.aggregation_period
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID, -- REFERENCES auth_management.tenants(id) si existe
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_metric_per_period
        UNIQUE (metric_name, aggregation_period, recorded_at, tenant_id)
);

-- Comentarios
COMMENT ON TABLE audit_logging.system_metrics IS 'Métricas agregadas del sistema para monitoreo y análisis de rendimiento';
COMMENT ON COLUMN audit_logging.system_metrics.metric_name IS 'Nombre identificador de la métrica (ej: cpu_usage, memory_usage, active_users)';
COMMENT ON COLUMN audit_logging.system_metrics.metric_value IS 'Valor numérico de la métrica';
COMMENT ON COLUMN audit_logging.system_metrics.metric_type IS 'Tipo de métrica (engagement, performance, completion, etc)';
COMMENT ON COLUMN audit_logging.system_metrics.aggregation_period IS 'Período de agregación (daily, weekly, monthly, etc)';
COMMENT ON COLUMN audit_logging.system_metrics.recorded_at IS 'Timestamp cuando se registró la métrica';
COMMENT ON COLUMN audit_logging.system_metrics.metadata IS 'Datos adicionales en formato JSON';

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_system_metrics_tenant
    ON audit_logging.system_metrics(tenant_id)
    WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_system_metrics_type
    ON audit_logging.system_metrics(metric_type)
    WHERE metric_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded
    ON audit_logging.system_metrics(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_metrics_name_period
    ON audit_logging.system_metrics(metric_name, aggregation_period, recorded_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION audit_logging.update_system_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_system_metrics_updated_at
    BEFORE UPDATE ON audit_logging.system_metrics
    FOR EACH ROW
    EXECUTE FUNCTION audit_logging.update_system_metrics_updated_at();

-- Habilitar Row Level Security (opcional)
-- ALTER TABLE audit_logging.system_metrics ENABLE ROW LEVEL SECURITY;

/**
 * Validación:
 *
 * -- Verificar que la tabla existe
 * \dt audit_logging.system_metrics
 *
 * -- Verificar estructura
 * \d audit_logging.system_metrics
 *
 * -- Insertar dato de prueba
 * INSERT INTO audit_logging.system_metrics (metric_name, metric_value, metric_type, aggregation_period)
 * VALUES ('test_metric', 100, 'performance', 'daily');
 *
 * -- Verificar inserción
 * SELECT * FROM audit_logging.system_metrics WHERE metric_name = 'test_metric';
 *
 * -- Limpiar
 * DELETE FROM audit_logging.system_metrics WHERE metric_name = 'test_metric';
 */

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Tabla audit_logging.system_metrics creada exitosamente';
    RAISE NOTICE 'Ahora puedes ejecutar: apps/database/seeds/dev/audit_logging/02-system-metrics.sql';
END $$;
