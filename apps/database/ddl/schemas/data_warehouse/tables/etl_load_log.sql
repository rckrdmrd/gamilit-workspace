-- ============================================
-- ETL Load Log Table
-- ============================================
-- Schema: data_warehouse
-- Purpose: Track ETL load operations for monitoring and debugging
-- Created: 2026-02-03 (Sprint 2.4 - ETL Pipeline Load)
-- ============================================

-- Create data_warehouse schema if not exists
CREATE SCHEMA IF NOT EXISTS data_warehouse;

-- Grant usage on schema
GRANT USAGE ON SCHEMA data_warehouse TO gamilit_user;

-- Load Status Enum
DO $$ BEGIN
    CREATE TYPE data_warehouse.etl_load_status AS ENUM (
        'pending',
        'running',
        'completed',
        'failed',
        'partially_completed'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- ETL Load Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS data_warehouse.etl_load_log (
    -- Primary Key
    load_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Loader identification
    loader_name VARCHAR(100) NOT NULL,
    target_table VARCHAR(200) NOT NULL,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Row counts
    rows_inserted INTEGER NOT NULL DEFAULT 0,
    rows_updated INTEGER NOT NULL DEFAULT 0,
    rows_rejected INTEGER NOT NULL DEFAULT 0,

    -- Status
    status data_warehouse.etl_load_status NOT NULL DEFAULT 'pending',
    error_message TEXT,

    -- Metadata
    batch_size INTEGER,
    load_mode VARCHAR(50),
    configuration JSONB DEFAULT '{}',

    -- Audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

-- Index for querying by loader name
CREATE INDEX IF NOT EXISTS idx_etl_load_log_loader_name
    ON data_warehouse.etl_load_log(loader_name);

-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_etl_load_log_status
    ON data_warehouse.etl_load_log(status);

-- Index for querying by time range
CREATE INDEX IF NOT EXISTS idx_etl_load_log_started_at
    ON data_warehouse.etl_load_log(started_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_etl_load_log_loader_status_time
    ON data_warehouse.etl_load_log(loader_name, status, started_at DESC);

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE data_warehouse.etl_load_log IS
    'Tracks ETL load operations including success/failure, row counts, and timing';

COMMENT ON COLUMN data_warehouse.etl_load_log.load_id IS
    'Unique identifier for the load operation';
COMMENT ON COLUMN data_warehouse.etl_load_log.loader_name IS
    'Name of the loader that executed (e.g., fact-exercise-completion, dim-student)';
COMMENT ON COLUMN data_warehouse.etl_load_log.target_table IS
    'Target table including schema (e.g., data_warehouse.fact_exercise_completions)';
COMMENT ON COLUMN data_warehouse.etl_load_log.rows_inserted IS
    'Number of rows successfully inserted';
COMMENT ON COLUMN data_warehouse.etl_load_log.rows_updated IS
    'Number of rows updated (for upsert operations)';
COMMENT ON COLUMN data_warehouse.etl_load_log.rows_rejected IS
    'Number of rows rejected due to validation or constraint errors';
COMMENT ON COLUMN data_warehouse.etl_load_log.status IS
    'Current status of the load operation';
COMMENT ON COLUMN data_warehouse.etl_load_log.error_message IS
    'Error message if the load failed';

-- ============================================
-- Permissions
-- ============================================

GRANT SELECT, INSERT, UPDATE ON data_warehouse.etl_load_log TO gamilit_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA data_warehouse TO gamilit_user;
