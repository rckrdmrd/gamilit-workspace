-- =====================================================
-- Table: data_warehouse.dim_times
-- Description: Time dimension for intra-day analytics
-- Type: Dimension (Conformed)
-- Grain: One row per minute (1440 rows total)
-- Pre-populated: Yes (static)
-- SCD Type: N/A (static dimension)
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.dim_times CASCADE;

CREATE TABLE data_warehouse.dim_times (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    time_key INTEGER NOT NULL,           -- HHMM format (e.g., 1430 for 2:30 PM)

    -- =====================================================
    -- TIME ATTRIBUTES
    -- =====================================================
    full_time TIME NOT NULL,             -- Actual time value

    -- Hour attributes
    hour_24 INTEGER NOT NULL,            -- 0-23
    hour_12 INTEGER NOT NULL,            -- 1-12
    am_pm TEXT NOT NULL,                 -- 'AM' or 'PM'

    -- Minute attributes
    minute INTEGER NOT NULL,             -- 0-59

    -- Period attributes
    period TEXT NOT NULL,                -- 'morning', 'afternoon', 'evening', 'night'
    period_spanish TEXT NOT NULL,        -- 'manana', 'tarde', 'noche', 'madrugada'

    -- =====================================================
    -- TIME BUCKETS
    -- =====================================================
    hour_bucket TEXT NOT NULL,           -- '00:00-00:59', '01:00-01:59', etc.
    half_hour_bucket TEXT NOT NULL,      -- '00:00-00:29', '00:30-00:59', etc.
    quarter_hour_bucket TEXT NOT NULL,   -- '00:00-00:14', '00:15-00:29', etc.

    -- =====================================================
    -- EDUCATIONAL TIME PERIODS
    -- =====================================================
    is_school_hours BOOLEAN DEFAULT FALSE,   -- 7:00-15:00
    is_homework_hours BOOLEAN DEFAULT FALSE, -- 15:00-21:00
    school_period TEXT,                      -- 'before_school', 'school_hours', 'after_school', 'evening', 'night'

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT dim_times_pkey PRIMARY KEY (time_key),
    CONSTRAINT dim_times_full_time_key UNIQUE (full_time),
    CONSTRAINT dim_times_hour_24_check CHECK (hour_24 BETWEEN 0 AND 23),
    CONSTRAINT dim_times_hour_12_check CHECK (hour_12 BETWEEN 1 AND 12),
    CONSTRAINT dim_times_minute_check CHECK (minute BETWEEN 0 AND 59),
    CONSTRAINT dim_times_am_pm_check CHECK (am_pm IN ('AM', 'PM')),
    CONSTRAINT dim_times_period_check CHECK (period IN ('morning', 'afternoon', 'evening', 'night'))
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_dim_times_hour ON data_warehouse.dim_times USING btree (hour_24);
CREATE INDEX idx_dim_times_period ON data_warehouse.dim_times USING btree (period);
CREATE INDEX idx_dim_times_school_hours ON data_warehouse.dim_times USING btree (is_school_hours) WHERE is_school_hours = TRUE;

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.dim_times OWNER TO gamilit_user;
GRANT SELECT ON data_warehouse.dim_times TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.dim_times IS
'Time dimension - Conformed dimension for intra-day analytics.
Grain: One row per minute (1440 rows total).
Periods: morning (5-12), afternoon (12-17), evening (17-21), night (21-5).
Includes educational time periods for school hours analysis.';

COMMENT ON COLUMN data_warehouse.dim_times.time_key IS 'Surrogate key in HHMM integer format (e.g., 1430 = 2:30 PM)';
COMMENT ON COLUMN data_warehouse.dim_times.period IS 'Time of day: morning, afternoon, evening, night';
COMMENT ON COLUMN data_warehouse.dim_times.is_school_hours IS 'TRUE for 7:00-15:00 school hours';
