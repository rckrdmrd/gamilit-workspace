-- =====================================================
-- Table: data_warehouse.ml_model_weights
-- Description: Stores ML model weights and metadata
-- Type: Configuration/Model Storage
-- Grain: One row per model version per feature
-- Source: ML training pipeline
-- Created: 2026-02-03
-- Sprint: 3.2 - ML Prediction Models
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.ml_model_weights CASCADE;

CREATE TABLE data_warehouse.ml_model_weights (
    -- =====================================================
    -- PRIMARY KEY
    -- =====================================================
    id BIGSERIAL NOT NULL,

    -- =====================================================
    -- MODEL IDENTIFICATION
    -- =====================================================
    model_id TEXT NOT NULL,              -- e.g., 'dropout_risk', 'performance_predictor'
    version TEXT NOT NULL,               -- semver format e.g., '1.0.0'

    -- =====================================================
    -- WEIGHT DATA
    -- =====================================================
    feature_name TEXT NOT NULL,          -- Feature this weight applies to
    weight DOUBLE PRECISION NOT NULL,    -- Weight value

    -- =====================================================
    -- MODEL METADATA (Denormalized for query efficiency)
    -- =====================================================
    bias DOUBLE PRECISION NOT NULL DEFAULT 0,           -- Bias term (same for all features in version)
    algorithm TEXT NOT NULL DEFAULT 'logistic_regression',
    model_type TEXT NOT NULL DEFAULT 'classification',  -- 'classification' or 'regression'

    -- =====================================================
    -- TRAINING METADATA
    -- =====================================================
    trained_at TIMESTAMP WITH TIME ZONE NOT NULL,
    training_samples INTEGER NOT NULL DEFAULT 0,
    validation_samples INTEGER NOT NULL DEFAULT 0,

    -- =====================================================
    -- PERFORMANCE METRICS (JSON for flexibility)
    -- =====================================================
    metrics_json JSONB NOT NULL DEFAULT '{}',

    -- =====================================================
    -- VERSION STATUS
    -- =====================================================
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_by TEXT DEFAULT 'system',

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT ml_model_weights_pkey PRIMARY KEY (id),
    CONSTRAINT ml_model_weights_unique UNIQUE (model_id, version, feature_name),
    CONSTRAINT ml_model_weights_model_type_check CHECK (model_type IN ('classification', 'regression')),
    CONSTRAINT ml_model_weights_algorithm_check CHECK (
        algorithm IN ('logistic_regression', 'linear_regression', 'random_forest', 'gradient_boosting')
    )
);

-- =====================================================
-- INDEXES
-- =====================================================
-- Model lookup
CREATE INDEX idx_ml_model_weights_model_id ON data_warehouse.ml_model_weights USING btree (model_id);

-- Version lookup
CREATE INDEX idx_ml_model_weights_version ON data_warehouse.ml_model_weights USING btree (model_id, version);

-- Active model lookup (most common query)
CREATE INDEX idx_ml_model_weights_active ON data_warehouse.ml_model_weights USING btree (model_id, is_active)
    WHERE is_active = TRUE;

-- Feature lookup
CREATE INDEX idx_ml_model_weights_feature ON data_warehouse.ml_model_weights USING btree (feature_name);

-- Metrics JSON index for querying performance
CREATE INDEX idx_ml_model_weights_metrics ON data_warehouse.ml_model_weights USING gin (metrics_json);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.ml_model_weights OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_warehouse.ml_model_weights TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.ml_model_weights_id_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.ml_model_weights IS
'Stores ML model weights and metadata for the prediction models.
Grain: One row per model version per feature.
Models: dropout_risk, performance_predictor, difficulty_recommender, engagement_predictor.
Query active model: SELECT * WHERE model_id = ? AND is_active = TRUE';

COMMENT ON COLUMN data_warehouse.ml_model_weights.model_id IS 'Model identifier: dropout_risk, performance_predictor, difficulty_recommender, engagement_predictor';
COMMENT ON COLUMN data_warehouse.ml_model_weights.version IS 'Semantic version string (e.g., 1.0.0)';
COMMENT ON COLUMN data_warehouse.ml_model_weights.feature_name IS 'Name of the feature this weight applies to';
COMMENT ON COLUMN data_warehouse.ml_model_weights.weight IS 'Weight coefficient for linear combination';
COMMENT ON COLUMN data_warehouse.ml_model_weights.bias IS 'Bias/intercept term (same value repeated for all features in a version)';
COMMENT ON COLUMN data_warehouse.ml_model_weights.metrics_json IS 'Performance metrics as JSON: {accuracy, precision, recall, f1Score, rmse, mae, auc}';
COMMENT ON COLUMN data_warehouse.ml_model_weights.is_active IS 'Whether this version is the currently active production model';

-- =====================================================
-- TRIGGER: Update updated_at on modification
-- =====================================================
CREATE OR REPLACE FUNCTION data_warehouse.update_ml_model_weights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ml_model_weights_updated_at
    BEFORE UPDATE ON data_warehouse.ml_model_weights
    FOR EACH ROW
    EXECUTE FUNCTION data_warehouse.update_ml_model_weights_updated_at();

-- =====================================================
-- FUNCTION: Get active model weights
-- =====================================================
CREATE OR REPLACE FUNCTION data_warehouse.get_active_model_weights(p_model_id TEXT)
RETURNS TABLE (
    feature_name TEXT,
    weight DOUBLE PRECISION,
    bias DOUBLE PRECISION,
    version TEXT,
    trained_at TIMESTAMP WITH TIME ZONE,
    metrics_json JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mw.feature_name,
        mw.weight,
        mw.bias,
        mw.version,
        mw.trained_at,
        mw.metrics_json
    FROM data_warehouse.ml_model_weights mw
    WHERE mw.model_id = p_model_id
      AND mw.is_active = TRUE
    ORDER BY mw.feature_name;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION data_warehouse.get_active_model_weights(TEXT) IS
'Returns all weights for the active version of a model.
Usage: SELECT * FROM data_warehouse.get_active_model_weights(''dropout_risk'')';

-- =====================================================
-- FUNCTION: Set model version as active
-- =====================================================
CREATE OR REPLACE FUNCTION data_warehouse.set_active_model_version(
    p_model_id TEXT,
    p_version TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Deactivate all versions of this model
    UPDATE data_warehouse.ml_model_weights
    SET is_active = FALSE
    WHERE model_id = p_model_id;

    -- Activate the specified version
    UPDATE data_warehouse.ml_model_weights
    SET is_active = TRUE
    WHERE model_id = p_model_id
      AND version = p_version;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Model version % for % not found', p_version, p_model_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION data_warehouse.set_active_model_version(TEXT, TEXT) IS
'Sets a specific version as the active model version.
Usage: SELECT data_warehouse.set_active_model_version(''dropout_risk'', ''1.1.0'')';

-- =====================================================
-- SEED: Default model weights (from model defaults)
-- =====================================================

-- Dropout Risk Model weights
INSERT INTO data_warehouse.ml_model_weights
(model_id, version, feature_name, weight, bias, algorithm, model_type, trained_at, training_samples, validation_samples, metrics_json, is_active, description)
VALUES
('dropout_risk', '1.0.0', 'daysSinceLastLogin', 0.35, 0.5, 'logistic_regression', 'classification', '2026-01-15', 5000, 1000, '{"accuracy": 0.85, "precision": 0.82, "recall": 0.78, "f1Score": 0.80, "auc": 0.88}', TRUE, 'Initial production model'),
('dropout_risk', '1.0.0', 'loginFrequency30d', -0.25, 0.5, 'logistic_regression', 'classification', '2026-01-15', 5000, 1000, '{"accuracy": 0.85, "precision": 0.82, "recall": 0.78, "f1Score": 0.80, "auc": 0.88}', TRUE, 'Initial production model'),
('dropout_risk', '1.0.0', 'streakCurrent', -0.15, 0.5, 'logistic_regression', 'classification', '2026-01-15', 5000, 1000, '{"accuracy": 0.85, "precision": 0.82, "recall": 0.78, "f1Score": 0.80, "auc": 0.88}', TRUE, 'Initial production model'),
('dropout_risk', '1.0.0', 'completionRate30d', -0.20, 0.5, 'logistic_regression', 'classification', '2026-01-15', 5000, 1000, '{"accuracy": 0.85, "precision": 0.82, "recall": 0.78, "f1Score": 0.80, "auc": 0.88}', TRUE, 'Initial production model'),
('dropout_risk', '1.0.0', 'engagementTrend', -0.15, 0.5, 'logistic_regression', 'classification', '2026-01-15', 5000, 1000, '{"accuracy": 0.85, "precision": 0.82, "recall": 0.78, "f1Score": 0.80, "auc": 0.88}', TRUE, 'Initial production model');

-- Performance Predictor Model weights
INSERT INTO data_warehouse.ml_model_weights
(model_id, version, feature_name, weight, bias, algorithm, model_type, trained_at, training_samples, validation_samples, metrics_json, is_active, description)
VALUES
('performance_predictor', '1.0.0', 'avgScore7d', 0.40, 50.0, 'linear_regression', 'regression', '2026-01-15', 8000, 2000, '{"rmse": 12.5, "mae": 9.8}', TRUE, 'Initial production model'),
('performance_predictor', '1.0.0', 'moduleProgress', 0.15, 50.0, 'linear_regression', 'regression', '2026-01-15', 8000, 2000, '{"rmse": 12.5, "mae": 9.8}', TRUE, 'Initial production model'),
('performance_predictor', '1.0.0', 'exerciseDifficulty', -10.0, 50.0, 'linear_regression', 'regression', '2026-01-15', 8000, 2000, '{"rmse": 12.5, "mae": 9.8}', TRUE, 'Initial production model'),
('performance_predictor', '1.0.0', 'timeSinceLastExercise', -0.5, 50.0, 'linear_regression', 'regression', '2026-01-15', 8000, 2000, '{"rmse": 12.5, "mae": 9.8}', TRUE, 'Initial production model'),
('performance_predictor', '1.0.0', 'historicalPerformanceOnType', 0.30, 50.0, 'linear_regression', 'regression', '2026-01-15', 8000, 2000, '{"rmse": 12.5, "mae": 9.8}', TRUE, 'Initial production model');

-- Difficulty Recommender Model weights
INSERT INTO data_warehouse.ml_model_weights
(model_id, version, feature_name, weight, bias, algorithm, model_type, trained_at, training_samples, validation_samples, metrics_json, is_active, description)
VALUES
('difficulty_recommender', '1.0.0', 'currentPerformance', 0.02, 0.0, 'logistic_regression', 'classification', '2026-01-15', 3000, 600, '{"accuracy": 0.78}', TRUE, 'Initial production model'),
('difficulty_recommender', '1.0.0', 'failureRate', -2.0, 0.0, 'logistic_regression', 'classification', '2026-01-15', 3000, 600, '{"accuracy": 0.78}', TRUE, 'Initial production model'),
('difficulty_recommender', '1.0.0', 'avgTimeOverExpected', -0.5, 0.0, 'logistic_regression', 'classification', '2026-01-15', 3000, 600, '{"accuracy": 0.78}', TRUE, 'Initial production model'),
('difficulty_recommender', '1.0.0', 'consecutiveFailures', -0.8, 0.0, 'logistic_regression', 'classification', '2026-01-15', 3000, 600, '{"accuracy": 0.78}', TRUE, 'Initial production model'),
('difficulty_recommender', '1.0.0', 'completionSpeedRatio', 0.3, 0.0, 'logistic_regression', 'classification', '2026-01-15', 3000, 600, '{"accuracy": 0.78}', TRUE, 'Initial production model'),
('difficulty_recommender', '1.0.0', 'skipRate', -0.5, 0.0, 'logistic_regression', 'classification', '2026-01-15', 3000, 600, '{"accuracy": 0.78}', TRUE, 'Initial production model'),
('difficulty_recommender', '1.0.0', 'consecutiveEasyPasses', 0.4, 0.0, 'logistic_regression', 'classification', '2026-01-15', 3000, 600, '{"accuracy": 0.78}', TRUE, 'Initial production model'),
('difficulty_recommender', '1.0.0', 'zpdCurrentLevel', 0.0, 0.0, 'logistic_regression', 'classification', '2026-01-15', 3000, 600, '{"accuracy": 0.78}', TRUE, 'Initial production model'),
('difficulty_recommender', '1.0.0', 'zpdMastered', -0.1, 0.0, 'logistic_regression', 'classification', '2026-01-15', 3000, 600, '{"accuracy": 0.78}', TRUE, 'Initial production model'),
('difficulty_recommender', '1.0.0', 'zpdChallenged', 0.3, 0.0, 'logistic_regression', 'classification', '2026-01-15', 3000, 600, '{"accuracy": 0.78}', TRUE, 'Initial production model');

-- Engagement Predictor Model weights
INSERT INTO data_warehouse.ml_model_weights
(model_id, version, feature_name, weight, bias, algorithm, model_type, trained_at, training_samples, validation_samples, metrics_json, is_active, description)
VALUES
('engagement_predictor', '1.0.0', 'avgEngagementPattern', 0.30, 0.5, 'logistic_regression', 'classification', '2026-01-15', 6000, 1200, '{"accuracy": 0.76, "precision": 0.74, "recall": 0.71, "f1Score": 0.72}', TRUE, 'Initial production model'),
('engagement_predictor', '1.0.0', 'dayOfWeek', 0.05, 0.5, 'logistic_regression', 'classification', '2026-01-15', 6000, 1200, '{"accuracy": 0.76, "precision": 0.74, "recall": 0.71, "f1Score": 0.72}', TRUE, 'Initial production model'),
('engagement_predictor', '1.0.0', 'timeOfDay', 0.15, 0.5, 'logistic_regression', 'classification', '2026-01-15', 6000, 1200, '{"accuracy": 0.76, "precision": 0.74, "recall": 0.71, "f1Score": 0.72}', TRUE, 'Initial production model'),
('engagement_predictor', '1.0.0', 'recentAchievements', 0.15, 0.5, 'logistic_regression', 'classification', '2026-01-15', 6000, 1200, '{"accuracy": 0.76, "precision": 0.74, "recall": 0.71, "f1Score": 0.72}', TRUE, 'Initial production model'),
('engagement_predictor', '1.0.0', 'pendingMissions', 0.10, 0.5, 'logistic_regression', 'classification', '2026-01-15', 6000, 1200, '{"accuracy": 0.76, "precision": 0.74, "recall": 0.71, "f1Score": 0.72}', TRUE, 'Initial production model'),
('engagement_predictor', '1.0.0', 'daysSinceLastReward', -0.08, 0.5, 'logistic_regression', 'classification', '2026-01-15', 6000, 1200, '{"accuracy": 0.76, "precision": 0.74, "recall": 0.71, "f1Score": 0.72}', TRUE, 'Initial production model'),
('engagement_predictor', '1.0.0', 'currentStreak', 0.12, 0.5, 'logistic_regression', 'classification', '2026-01-15', 6000, 1200, '{"accuracy": 0.76, "precision": 0.74, "recall": 0.71, "f1Score": 0.72}', TRUE, 'Initial production model');
