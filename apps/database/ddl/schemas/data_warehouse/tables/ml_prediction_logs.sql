-- =============================================================================
-- ML Prediction Logs Table
-- =============================================================================
-- Description: Stores all ML prediction logs for auditing and model improvement.
-- Schema: data_warehouse
-- Sprint: 3.3 - ML Prediction API
-- Created: 2026-02-03
--
-- Purpose:
-- - Audit trail for all ML predictions
-- - Data source for model retraining
-- - Performance monitoring (latency, cache hits)
-- - Model accuracy validation (actual vs predicted)
-- =============================================================================

-- Create table if not exists
CREATE TABLE IF NOT EXISTS data_warehouse.ml_prediction_logs (
    -- Primary key
    prediction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Model information
    model_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,

    -- Student context
    student_id UUID NOT NULL,
    classroom_id UUID,
    tenant_id UUID,

    -- Prediction details
    input_features_json JSONB NOT NULL,
    output_json JSONB NOT NULL,

    -- Quality metrics
    confidence DECIMAL(5, 4) CHECK (confidence >= 0 AND confidence <= 1),
    risk_level VARCHAR(20),
    predicted_score DECIMAL(5, 2),

    -- Performance metrics
    latency_ms INTEGER NOT NULL,
    cached BOOLEAN NOT NULL DEFAULT FALSE,

    -- Validation (filled later when actual outcome known)
    actual_outcome_json JSONB,
    prediction_accurate BOOLEAN,
    validated_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,

    -- Indexes will be created below
    CONSTRAINT ml_prediction_logs_model_type_check CHECK (
        model_type IN ('dropout_risk', 'performance', 'difficulty', 'engagement')
    )
);

-- Add comments
COMMENT ON TABLE data_warehouse.ml_prediction_logs IS 'Audit log for all ML predictions made by the platform';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.prediction_id IS 'Unique prediction identifier';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.model_type IS 'Type of ML model (dropout_risk, performance, difficulty, engagement)';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.model_version IS 'Version of the model used for prediction';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.student_id IS 'Student profile ID (from auth_management.profiles)';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.classroom_id IS 'Optional classroom context';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.input_features_json IS 'Input features used for prediction (JSONB)';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.output_json IS 'Prediction output (JSONB)';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.confidence IS 'Model confidence in prediction (0-1)';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.latency_ms IS 'Time taken for prediction in milliseconds';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.cached IS 'Whether the result was served from cache';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.actual_outcome_json IS 'Actual outcome for validation (filled later)';
COMMENT ON COLUMN data_warehouse.ml_prediction_logs.prediction_accurate IS 'Whether prediction matched actual outcome';

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Index for querying by student
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_student_id
    ON data_warehouse.ml_prediction_logs(student_id);

-- Index for querying by model type
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_model_type
    ON data_warehouse.ml_prediction_logs(model_type);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_created_at
    ON data_warehouse.ml_prediction_logs(created_at DESC);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_model_student
    ON data_warehouse.ml_prediction_logs(model_type, student_id, created_at DESC);

-- Index for validation queries
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_unvalidated
    ON data_warehouse.ml_prediction_logs(model_type, created_at)
    WHERE validated_at IS NULL;

-- Index for tenant queries
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_tenant_id
    ON data_warehouse.ml_prediction_logs(tenant_id)
    WHERE tenant_id IS NOT NULL;

-- GIN index for JSON queries
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_output_gin
    ON data_warehouse.ml_prediction_logs USING gin(output_json);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE data_warehouse.ml_prediction_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all logs
CREATE POLICY ml_prediction_logs_admin_policy
    ON data_warehouse.ml_prediction_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.users u
            JOIN auth_management.user_roles ur ON u.id = ur.user_id
            JOIN auth_management.roles r ON ur.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name IN ('admin', 'super_admin')
        )
    );

-- Policy: Users can see their own prediction logs
CREATE POLICY ml_prediction_logs_own_policy
    ON data_warehouse.ml_prediction_logs
    FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM auth_management.profiles
            WHERE user_id = auth.uid()
        )
    );

-- =============================================================================
-- PARTITIONING (Optional - for high volume)
-- =============================================================================
-- If the table grows very large, consider partitioning by month:
--
-- CREATE TABLE data_warehouse.ml_prediction_logs_template (
--     LIKE data_warehouse.ml_prediction_logs INCLUDING ALL
-- ) PARTITION BY RANGE (created_at);
--
-- Then create partitions:
-- CREATE TABLE data_warehouse.ml_prediction_logs_2026_02
--     PARTITION OF data_warehouse.ml_prediction_logs_template
--     FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to log a prediction
CREATE OR REPLACE FUNCTION data_warehouse.log_ml_prediction(
    p_model_type VARCHAR(50),
    p_model_version VARCHAR(20),
    p_student_id UUID,
    p_input_features JSONB,
    p_output JSONB,
    p_confidence DECIMAL(5, 4),
    p_latency_ms INTEGER,
    p_cached BOOLEAN DEFAULT FALSE,
    p_classroom_id UUID DEFAULT NULL,
    p_tenant_id UUID DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_prediction_id UUID;
    v_risk_level VARCHAR(20);
    v_predicted_score DECIMAL(5, 2);
BEGIN
    -- Extract risk_level if present
    v_risk_level := p_output->>'riskLevel';

    -- Extract predicted score if present
    IF p_output ? 'predictedScore' THEN
        v_predicted_score := (p_output->>'predictedScore')::DECIMAL(5, 2);
    END IF;

    INSERT INTO data_warehouse.ml_prediction_logs (
        model_type,
        model_version,
        student_id,
        classroom_id,
        tenant_id,
        input_features_json,
        output_json,
        confidence,
        risk_level,
        predicted_score,
        latency_ms,
        cached,
        created_by
    ) VALUES (
        p_model_type,
        p_model_version,
        p_student_id,
        p_classroom_id,
        p_tenant_id,
        p_input_features,
        p_output,
        p_confidence,
        v_risk_level,
        v_predicted_score,
        p_latency_ms,
        p_cached,
        p_created_by
    )
    RETURNING prediction_id INTO v_prediction_id;

    RETURN v_prediction_id;
END;
$$;

COMMENT ON FUNCTION data_warehouse.log_ml_prediction IS 'Logs an ML prediction to the audit table';

-- Function to validate a prediction
CREATE OR REPLACE FUNCTION data_warehouse.validate_prediction(
    p_prediction_id UUID,
    p_actual_outcome JSONB,
    p_accurate BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE data_warehouse.ml_prediction_logs
    SET
        actual_outcome_json = p_actual_outcome,
        prediction_accurate = p_accurate,
        validated_at = NOW()
    WHERE prediction_id = p_prediction_id
    AND validated_at IS NULL;

    RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION data_warehouse.validate_prediction IS 'Validates a prediction against actual outcome';

-- =============================================================================
-- ANALYTICS VIEWS
-- =============================================================================

-- View: Model performance summary
CREATE OR REPLACE VIEW data_warehouse.v_ml_model_performance AS
SELECT
    model_type,
    model_version,
    DATE_TRUNC('day', created_at) AS prediction_date,
    COUNT(*) AS total_predictions,
    COUNT(CASE WHEN cached THEN 1 END) AS cache_hits,
    AVG(latency_ms) AS avg_latency_ms,
    AVG(confidence) AS avg_confidence,
    COUNT(CASE WHEN validated_at IS NOT NULL THEN 1 END) AS validated_count,
    AVG(CASE WHEN prediction_accurate THEN 1.0 ELSE 0.0 END) AS accuracy_rate
FROM data_warehouse.ml_prediction_logs
GROUP BY model_type, model_version, DATE_TRUNC('day', created_at)
ORDER BY prediction_date DESC, model_type;

COMMENT ON VIEW data_warehouse.v_ml_model_performance IS 'Daily model performance metrics';

-- View: At-risk students summary
CREATE OR REPLACE VIEW data_warehouse.v_ml_at_risk_students AS
SELECT DISTINCT ON (student_id)
    student_id,
    classroom_id,
    tenant_id,
    output_json->>'riskLevel' AS risk_level,
    (output_json->>'probability')::DECIMAL(5, 3) AS dropout_probability,
    confidence,
    created_at AS last_prediction_at
FROM data_warehouse.ml_prediction_logs
WHERE model_type = 'dropout_risk'
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY student_id, created_at DESC;

COMMENT ON VIEW data_warehouse.v_ml_at_risk_students IS 'Latest dropout risk for each student (last 24h)';
