-- =====================================================
-- RLS Test Framework for GAMILIT Platform
-- Created: 2025-11-23
-- Purpose: Comprehensive RLS policy validation
-- =====================================================

-- Create test schema and functions
CREATE SCHEMA IF NOT EXISTS rls_tests;

-- Test result tracking table
DROP TABLE IF EXISTS rls_tests.test_results CASCADE;
CREATE TABLE rls_tests.test_results (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(255) NOT NULL,
    test_category VARCHAR(100) NOT NULL,
    test_description TEXT,
    expected_result TEXT,
    actual_result TEXT,
    status VARCHAR(20) CHECK (status IN ('PASS', 'FAIL', 'ERROR')),
    error_message TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test user tracking
DROP TABLE IF EXISTS rls_tests.test_users CASCADE;
CREATE TABLE rls_tests.test_users (
    user_id UUID PRIMARY KEY,
    username VARCHAR(100),
    role VARCHAR(50),
    tenant_id UUID,
    created_for_test BOOLEAN DEFAULT true
);

-- Function to run a test and log results
CREATE OR REPLACE FUNCTION rls_tests.run_test(
    p_test_name VARCHAR,
    p_test_category VARCHAR,
    p_test_description TEXT,
    p_test_sql TEXT,
    p_expected_result TEXT
) RETURNS VOID AS $$
DECLARE
    v_actual_result TEXT;
    v_status VARCHAR(20);
    v_error_message TEXT;
BEGIN
    BEGIN
        -- Execute the test SQL
        EXECUTE p_test_sql INTO v_actual_result;

        -- Compare results
        IF v_actual_result = p_expected_result THEN
            v_status := 'PASS';
        ELSE
            v_status := 'FAIL';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_status := 'ERROR';
        v_error_message := SQLERRM;
        v_actual_result := 'ERROR';
    END;

    -- Log the result
    INSERT INTO rls_tests.test_results (
        test_name, test_category, test_description,
        expected_result, actual_result, status, error_message
    ) VALUES (
        p_test_name, p_test_category, p_test_description,
        p_expected_result, v_actual_result, v_status, v_error_message
    );
END;
$$ LANGUAGE plpgsql;

-- Function to set user context
CREATE OR REPLACE FUNCTION rls_tests.set_user_context(
    p_user_id UUID,
    p_tenant_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', p_user_id::text, false);
    IF p_tenant_id IS NOT NULL THEN
        PERFORM set_config('app.current_tenant_id', p_tenant_id::text, false);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to clear user context
CREATE OR REPLACE FUNCTION rls_tests.clear_user_context() RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', '', false);
    PERFORM set_config('app.current_tenant_id', '', false);
END;
$$ LANGUAGE plpgsql;

-- Function to get test summary
CREATE OR REPLACE FUNCTION rls_tests.get_test_summary()
RETURNS TABLE (
    total_tests BIGINT,
    passed BIGINT,
    failed BIGINT,
    errors BIGINT,
    pass_rate NUMERIC(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_tests,
        COUNT(*) FILTER (WHERE status = 'PASS')::BIGINT as passed,
        COUNT(*) FILTER (WHERE status = 'FAIL')::BIGINT as failed,
        COUNT(*) FILTER (WHERE status = 'ERROR')::BIGINT as errors,
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'PASS')::NUMERIC /
             NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
            2
        ) as pass_rate
    FROM rls_tests.test_results;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup test data
CREATE OR REPLACE FUNCTION rls_tests.cleanup_test_data() RETURNS VOID AS $$
BEGIN
    -- This will be called at the end to remove test users and data
    DELETE FROM auth_management.profiles WHERE id IN (
        SELECT user_id FROM rls_tests.test_users WHERE created_for_test = true
    );

    DELETE FROM rls_tests.test_users WHERE created_for_test = true;

    RAISE NOTICE 'Test data cleaned up successfully';
END;
$$ LANGUAGE plpgsql;

COMMENT ON SCHEMA rls_tests IS 'RLS Testing Framework - Created 2025-11-23';
COMMENT ON TABLE rls_tests.test_results IS 'Stores results of all RLS policy tests';
COMMENT ON FUNCTION rls_tests.run_test IS 'Executes a single RLS test and logs the result';
COMMENT ON FUNCTION rls_tests.set_user_context IS 'Sets the current user context for RLS testing';
