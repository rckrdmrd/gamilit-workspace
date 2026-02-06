-- =====================================================
-- Table: data_warehouse.dim_dates
-- Description: Date dimension for time-based analytics
-- Type: Dimension (Conformed)
-- Grain: One row per calendar day
-- Pre-populated: Yes (10 years range)
-- SCD Type: N/A (static dimension)
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.dim_dates CASCADE;

CREATE TABLE data_warehouse.dim_dates (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    date_key INTEGER NOT NULL,           -- YYYYMMDD format (e.g., 20260203)

    -- =====================================================
    -- DATE ATTRIBUTES
    -- =====================================================
    full_date DATE NOT NULL,             -- Actual date value

    -- Day attributes
    day_of_week INTEGER NOT NULL,        -- 1=Monday, 7=Sunday (ISO)
    day_of_week_name TEXT NOT NULL,      -- 'Lunes', 'Martes', etc.
    day_of_week_abbrev TEXT NOT NULL,    -- 'Lun', 'Mar', etc.
    day_of_month INTEGER NOT NULL,       -- 1-31
    day_of_year INTEGER NOT NULL,        -- 1-366

    -- Week attributes
    week_of_year INTEGER NOT NULL,       -- 1-53 (ISO week)
    week_of_month INTEGER NOT NULL,      -- 1-5

    -- Month attributes
    month INTEGER NOT NULL,              -- 1-12
    month_name TEXT NOT NULL,            -- 'Enero', 'Febrero', etc.
    month_abbrev TEXT NOT NULL,          -- 'Ene', 'Feb', etc.

    -- Quarter attributes
    quarter INTEGER NOT NULL,            -- 1-4
    quarter_name TEXT NOT NULL,          -- 'Q1', 'Q2', 'Q3', 'Q4'

    -- Year attributes
    year INTEGER NOT NULL,               -- 2020, 2021, etc.
    year_month TEXT NOT NULL,            -- '2026-02'
    year_quarter TEXT NOT NULL,          -- '2026-Q1'

    -- =====================================================
    -- FLAGS AND INDICATORS
    -- =====================================================
    is_weekend BOOLEAN NOT NULL DEFAULT FALSE,
    is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
    holiday_name TEXT,                   -- Holiday name if applicable

    -- =====================================================
    -- EDUCATIONAL CALENDAR
    -- =====================================================
    school_year TEXT NOT NULL,           -- '2025-2026'
    semester INTEGER,                    -- 1 or 2
    semester_name TEXT,                  -- 'Primer Semestre', 'Segundo Semestre'
    bimester INTEGER,                    -- 1-5 (Mexican school system)
    trimester INTEGER,                   -- 1-3
    is_school_day BOOLEAN DEFAULT TRUE,
    is_vacation BOOLEAN DEFAULT FALSE,
    vacation_period TEXT,                -- 'Navidad', 'Semana Santa', 'Verano'

    -- =====================================================
    -- FISCAL CALENDAR (Optional)
    -- =====================================================
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    fiscal_month INTEGER,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT dim_dates_pkey PRIMARY KEY (date_key),
    CONSTRAINT dim_dates_full_date_key UNIQUE (full_date),
    CONSTRAINT dim_dates_day_of_week_check CHECK (day_of_week BETWEEN 1 AND 7),
    CONSTRAINT dim_dates_day_of_month_check CHECK (day_of_month BETWEEN 1 AND 31),
    CONSTRAINT dim_dates_month_check CHECK (month BETWEEN 1 AND 12),
    CONSTRAINT dim_dates_quarter_check CHECK (quarter BETWEEN 1 AND 4),
    CONSTRAINT dim_dates_semester_check CHECK (semester IS NULL OR semester BETWEEN 1 AND 2)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_dim_dates_full_date ON data_warehouse.dim_dates USING btree (full_date);
CREATE INDEX idx_dim_dates_year_month ON data_warehouse.dim_dates USING btree (year, month);
CREATE INDEX idx_dim_dates_school_year ON data_warehouse.dim_dates USING btree (school_year);
CREATE INDEX idx_dim_dates_is_weekend ON data_warehouse.dim_dates USING btree (is_weekend) WHERE is_weekend = TRUE;
CREATE INDEX idx_dim_dates_is_holiday ON data_warehouse.dim_dates USING btree (is_holiday) WHERE is_holiday = TRUE;

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.dim_dates OWNER TO gamilit_user;
GRANT SELECT ON data_warehouse.dim_dates TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.dim_dates IS
'Date dimension - Conformed dimension for time-based analytics.
Grain: One row per calendar day.
Pre-populated with 10 years of dates.
Includes educational calendar attributes (school year, semester, bimester).
Mexican school system calendar support.';

COMMENT ON COLUMN data_warehouse.dim_dates.date_key IS 'Surrogate key in YYYYMMDD integer format';
COMMENT ON COLUMN data_warehouse.dim_dates.school_year IS 'Educational year format: 2025-2026';
COMMENT ON COLUMN data_warehouse.dim_dates.bimester IS 'Mexican school bimester (1-5)';
