-- ============================================
-- Dimension Time Seed Data
-- ============================================
-- Schema: data_warehouse
-- Purpose: Pre-populate time dimension (0000-2359, every minute)
-- Created: 2026-02-03 (Sprint 2.4 - ETL Pipeline Load)
-- ============================================

-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS data_warehouse;

-- Create dim_time table if not exists
CREATE TABLE IF NOT EXISTS data_warehouse.dim_time (
    time_key INTEGER PRIMARY KEY,
    full_time TIME NOT NULL UNIQUE,
    hour INTEGER NOT NULL,
    minute INTEGER NOT NULL,
    second INTEGER NOT NULL DEFAULT 0,
    hour_12 INTEGER NOT NULL,
    am_pm VARCHAR(2) NOT NULL,
    time_of_day VARCHAR(20) NOT NULL,
    is_business_hour BOOLEAN NOT NULL,
    is_school_hour BOOLEAN NOT NULL,
    quarter_hour VARCHAR(20) NOT NULL,
    half_hour VARCHAR(20) NOT NULL,
    display_time_24 VARCHAR(5) NOT NULL,
    display_time_12 VARCHAR(8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on hour
CREATE INDEX IF NOT EXISTS idx_dim_time_hour ON data_warehouse.dim_time(hour);

-- Generate times from 00:00 to 23:59 (every minute = 1440 rows)
INSERT INTO data_warehouse.dim_time (
    time_key,
    full_time,
    hour,
    minute,
    second,
    hour_12,
    am_pm,
    time_of_day,
    is_business_hour,
    is_school_hour,
    quarter_hour,
    half_hour,
    display_time_24,
    display_time_12
)
SELECT
    (h * 100 + m)::INTEGER AS time_key,
    MAKE_TIME(h, m, 0) AS full_time,
    h AS hour,
    m AS minute,
    0 AS second,
    CASE WHEN h = 0 THEN 12 WHEN h > 12 THEN h - 12 ELSE h END AS hour_12,
    CASE WHEN h < 12 THEN 'AM' ELSE 'PM' END AS am_pm,
    CASE
        WHEN h BETWEEN 0 AND 5 THEN 'Night'
        WHEN h BETWEEN 6 AND 11 THEN 'Morning'
        WHEN h BETWEEN 12 AND 17 THEN 'Afternoon'
        ELSE 'Evening'
    END AS time_of_day,
    h BETWEEN 9 AND 17 AS is_business_hour,
    h BETWEEN 7 AND 15 AS is_school_hour,
    CASE
        WHEN m BETWEEN 0 AND 14 THEN 'First Quarter'
        WHEN m BETWEEN 15 AND 29 THEN 'Second Quarter'
        WHEN m BETWEEN 30 AND 44 THEN 'Third Quarter'
        ELSE 'Fourth Quarter'
    END AS quarter_hour,
    CASE
        WHEN m < 30 THEN 'First Half'
        ELSE 'Second Half'
    END AS half_hour,
    LPAD(h::TEXT, 2, '0') || ':' || LPAD(m::TEXT, 2, '0') AS display_time_24,
    LPAD(
        CASE WHEN h = 0 THEN 12 WHEN h > 12 THEN h - 12 ELSE h END::TEXT,
        2, '0'
    ) || ':' || LPAD(m::TEXT, 2, '0') || ' ' ||
    CASE WHEN h < 12 THEN 'AM' ELSE 'PM' END AS display_time_12
FROM generate_series(0, 23) AS h
CROSS JOIN generate_series(0, 59) AS m
ON CONFLICT (time_key) DO NOTHING;

-- Comments
COMMENT ON TABLE data_warehouse.dim_time IS
    'Time dimension for data warehouse analytics. Contains one row per minute (1440 rows total).';

COMMENT ON COLUMN data_warehouse.dim_time.time_key IS
    'Surrogate key in HHMM format (e.g., 1430 for 2:30 PM)';
COMMENT ON COLUMN data_warehouse.dim_time.time_of_day IS
    'Time period: Night (0-5), Morning (6-11), Afternoon (12-17), Evening (18-23)';
COMMENT ON COLUMN data_warehouse.dim_time.is_business_hour IS
    'True if between 9 AM and 5 PM';
COMMENT ON COLUMN data_warehouse.dim_time.is_school_hour IS
    'True if between 7 AM and 3 PM (typical school hours)';

-- Grant permissions
GRANT SELECT ON data_warehouse.dim_time TO gamilit_user;

-- Verify row count
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM data_warehouse.dim_time;
    RAISE NOTICE 'dim_time populated with % rows (expected 1440)', row_count;
END $$;
