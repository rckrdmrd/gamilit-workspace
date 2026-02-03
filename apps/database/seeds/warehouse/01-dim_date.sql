-- ============================================
-- Dimension Date Seed Data
-- ============================================
-- Schema: data_warehouse
-- Purpose: Pre-populate date dimension (2020-2030)
-- Created: 2026-02-03 (Sprint 2.4 - ETL Pipeline Load)
-- ============================================

-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS data_warehouse;

-- Create dim_date table if not exists
CREATE TABLE IF NOT EXISTS data_warehouse.dim_date (
    date_key INTEGER PRIMARY KEY,
    full_date DATE NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    month INTEGER NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    month_name_short VARCHAR(3) NOT NULL,
    week_of_year INTEGER NOT NULL,
    day_of_year INTEGER NOT NULL,
    day_of_month INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    day_name VARCHAR(20) NOT NULL,
    day_name_short VARCHAR(3) NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
    holiday_name VARCHAR(100),
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER NOT NULL,
    academic_year VARCHAR(9),
    academic_semester VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on full_date
CREATE INDEX IF NOT EXISTS idx_dim_date_full_date ON data_warehouse.dim_date(full_date);
CREATE INDEX IF NOT EXISTS idx_dim_date_year_month ON data_warehouse.dim_date(year, month);

-- Generate dates from 2020-01-01 to 2030-12-31
INSERT INTO data_warehouse.dim_date (
    date_key,
    full_date,
    year,
    quarter,
    month,
    month_name,
    month_name_short,
    week_of_year,
    day_of_year,
    day_of_month,
    day_of_week,
    day_name,
    day_name_short,
    is_weekend,
    is_holiday,
    fiscal_year,
    fiscal_quarter,
    academic_year,
    academic_semester
)
SELECT
    TO_CHAR(d, 'YYYYMMDD')::INTEGER AS date_key,
    d AS full_date,
    EXTRACT(YEAR FROM d)::INTEGER AS year,
    EXTRACT(QUARTER FROM d)::INTEGER AS quarter,
    EXTRACT(MONTH FROM d)::INTEGER AS month,
    TO_CHAR(d, 'FMMonth') AS month_name,
    TO_CHAR(d, 'Mon') AS month_name_short,
    EXTRACT(WEEK FROM d)::INTEGER AS week_of_year,
    EXTRACT(DOY FROM d)::INTEGER AS day_of_year,
    EXTRACT(DAY FROM d)::INTEGER AS day_of_month,
    EXTRACT(ISODOW FROM d)::INTEGER AS day_of_week,
    TO_CHAR(d, 'FMDay') AS day_name,
    TO_CHAR(d, 'Dy') AS day_name_short,
    EXTRACT(ISODOW FROM d)::INTEGER IN (6, 7) AS is_weekend,
    FALSE AS is_holiday,
    -- Fiscal year (assuming fiscal year = calendar year)
    EXTRACT(YEAR FROM d)::INTEGER AS fiscal_year,
    EXTRACT(QUARTER FROM d)::INTEGER AS fiscal_quarter,
    -- Academic year (Aug-Jul)
    CASE
        WHEN EXTRACT(MONTH FROM d) >= 8 THEN
            EXTRACT(YEAR FROM d)::TEXT || '-' || (EXTRACT(YEAR FROM d) + 1)::TEXT
        ELSE
            (EXTRACT(YEAR FROM d) - 1)::TEXT || '-' || EXTRACT(YEAR FROM d)::TEXT
    END AS academic_year,
    -- Academic semester
    CASE
        WHEN EXTRACT(MONTH FROM d) BETWEEN 8 AND 12 THEN 'Fall'
        WHEN EXTRACT(MONTH FROM d) BETWEEN 1 AND 5 THEN 'Spring'
        ELSE 'Summer'
    END AS academic_semester
FROM generate_series('2020-01-01'::DATE, '2030-12-31'::DATE, '1 day'::INTERVAL) AS d
ON CONFLICT (date_key) DO NOTHING;

-- Update known holidays (Mexican holidays as example)
UPDATE data_warehouse.dim_date
SET is_holiday = TRUE, holiday_name = 'Ano Nuevo'
WHERE month = 1 AND day_of_month = 1;

UPDATE data_warehouse.dim_date
SET is_holiday = TRUE, holiday_name = 'Dia de la Constitucion'
WHERE month = 2 AND day_of_month = 5;

UPDATE data_warehouse.dim_date
SET is_holiday = TRUE, holiday_name = 'Natalicio de Benito Juarez'
WHERE month = 3 AND day_of_month = 21;

UPDATE data_warehouse.dim_date
SET is_holiday = TRUE, holiday_name = 'Dia del Trabajo'
WHERE month = 5 AND day_of_month = 1;

UPDATE data_warehouse.dim_date
SET is_holiday = TRUE, holiday_name = 'Dia de la Independencia'
WHERE month = 9 AND day_of_month = 16;

UPDATE data_warehouse.dim_date
SET is_holiday = TRUE, holiday_name = 'Dia de la Revolucion'
WHERE month = 11 AND day_of_month = 20;

UPDATE data_warehouse.dim_date
SET is_holiday = TRUE, holiday_name = 'Navidad'
WHERE month = 12 AND day_of_month = 25;

-- Comments
COMMENT ON TABLE data_warehouse.dim_date IS
    'Date dimension for data warehouse analytics. Contains one row per date from 2020 to 2030.';

COMMENT ON COLUMN data_warehouse.dim_date.date_key IS
    'Surrogate key in YYYYMMDD format (e.g., 20260203)';
COMMENT ON COLUMN data_warehouse.dim_date.academic_year IS
    'Academic year spanning Aug-Jul (e.g., 2025-2026)';
COMMENT ON COLUMN data_warehouse.dim_date.academic_semester IS
    'Academic semester: Fall (Aug-Dec), Spring (Jan-May), Summer (Jun-Jul)';

-- Grant permissions
GRANT SELECT ON data_warehouse.dim_date TO gamilit_user;

-- Verify row count
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM data_warehouse.dim_date;
    RAISE NOTICE 'dim_date populated with % rows', row_count;
END $$;
