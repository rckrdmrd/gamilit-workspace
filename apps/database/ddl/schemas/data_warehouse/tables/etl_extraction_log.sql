-- =====================================================
-- Table: data_warehouse.etl_extraction_log
-- Description: Tracks ETL extraction operations for CDC and monitoring
-- Created: 2026-02-03
-- Sprint: 2.2 - ETL Pipeline Extraction
-- =====================================================

SET search_path TO data_warehouse, public;

-- =====================================================
-- CREATE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS data_warehouse.etl_extraction_log (
    -- Primary Key
    extraction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Extractor Information
    extractor_name VARCHAR(100) NOT NULL,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Metrics
    rows_extracted INTEGER NOT NULL DEFAULT 0,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'running'
        CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

    -- Error Handling
    error_message TEXT,

    -- CDC Tracking
    last_extracted_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Additional Metadata
    metadata JSONB NOT NULL DEFAULT '{}',

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Index for querying by extractor name
CREATE INDEX IF NOT EXISTS idx_etl_extraction_log_extractor_name
    ON data_warehouse.etl_extraction_log (extractor_name);

-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_etl_extraction_log_status
    ON data_warehouse.etl_extraction_log (status);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_etl_extraction_log_started_at
    ON data_warehouse.etl_extraction_log (started_at DESC);

-- Index for completed extractions lookup
CREATE INDEX IF NOT EXISTS idx_etl_extraction_log_completed
    ON data_warehouse.etl_extraction_log (extractor_name, status, completed_at DESC)
    WHERE status = 'completed';

-- Index for getting latest extraction per extractor
CREATE INDEX IF NOT EXISTS idx_etl_extraction_log_latest
    ON data_warehouse.etl_extraction_log (extractor_name, last_extracted_timestamp DESC);

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION data_warehouse.update_etl_extraction_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_etl_extraction_log_updated_at
    ON data_warehouse.etl_extraction_log;

CREATE TRIGGER trg_etl_extraction_log_updated_at
    BEFORE UPDATE ON data_warehouse.etl_extraction_log
    FOR EACH ROW
    EXECUTE FUNCTION data_warehouse.update_etl_extraction_log_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE data_warehouse.etl_extraction_log IS
'Tracks ETL extraction operations for CDC (Change Data Capture) and monitoring.
Used to determine the starting point for incremental extractions and to monitor extraction health.';

COMMENT ON COLUMN data_warehouse.etl_extraction_log.extraction_id IS
'Unique identifier for each extraction run';

COMMENT ON COLUMN data_warehouse.etl_extraction_log.extractor_name IS
'Name of the extractor (e.g., exercise-completion-extractor, student-extractor)';

COMMENT ON COLUMN data_warehouse.etl_extraction_log.started_at IS
'Timestamp when the extraction started';

COMMENT ON COLUMN data_warehouse.etl_extraction_log.completed_at IS
'Timestamp when the extraction completed (NULL if still running)';

COMMENT ON COLUMN data_warehouse.etl_extraction_log.rows_extracted IS
'Number of rows extracted in this run';

COMMENT ON COLUMN data_warehouse.etl_extraction_log.status IS
'Current status of the extraction: pending, running, completed, failed, cancelled';

COMMENT ON COLUMN data_warehouse.etl_extraction_log.error_message IS
'Error message if the extraction failed';

COMMENT ON COLUMN data_warehouse.etl_extraction_log.last_extracted_timestamp IS
'Timestamp of the last record extracted - used as CDC marker for incremental extraction';

COMMENT ON COLUMN data_warehouse.etl_extraction_log.metadata IS
'Additional metadata about the extraction (batch info, source tables, etc.)';

-- =====================================================
-- PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON data_warehouse.etl_extraction_log TO gamilit_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA data_warehouse TO gamilit_user;
