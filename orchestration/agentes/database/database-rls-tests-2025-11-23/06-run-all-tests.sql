-- =====================================================
-- Master Test Runner for GAMILIT RLS Tests
-- Created: 2025-11-23
-- Purpose: Execute all RLS tests and generate summary
-- =====================================================

\set ON_ERROR_STOP off

\echo ''
\echo '========================================='
\echo 'GAMILIT RLS Test Suite'
\echo 'Date: 2025-11-23'
\echo '========================================='
\echo ''

-- Step 1: Create test framework
\echo 'Step 1/6: Creating test framework...'
\i 01-test-framework.sql
\echo ''

-- Step 2: Setup test data
\echo 'Step 2/6: Setting up test data...'
\i 02-setup-test-data.sql
\echo ''

-- Step 3: Run auth_management tests
\echo 'Step 3/6: Running auth_management tests...'
\i 03-auth-management-tests.sql
\echo ''

-- Step 4: Run progress_tracking tests
\echo 'Step 4/6: Running progress_tracking tests...'
\i 04-progress-tracking-tests.sql
\echo ''

-- Step 5: Run gamification_system tests
\echo 'Step 5/6: Running gamification_system tests...'
\i 05-gamification-tests.sql
\echo ''

-- Step 6: Generate summary
\echo 'Step 6/6: Generating test summary...'
\echo ''
\echo '========================================='
\echo 'TEST SUMMARY'
\echo '========================================='

SELECT
    'Total Tests' as metric,
    total_tests::TEXT as value
FROM rls_tests.get_test_summary()
UNION ALL
SELECT
    'Passed',
    passed::TEXT
FROM rls_tests.get_test_summary()
UNION ALL
SELECT
    'Failed',
    failed::TEXT
FROM rls_tests.get_test_summary()
UNION ALL
SELECT
    'Errors',
    errors::TEXT
FROM rls_tests.get_test_summary()
UNION ALL
SELECT
    'Pass Rate',
    pass_rate::TEXT || '%'
FROM rls_tests.get_test_summary();

\echo ''
\echo '========================================='
\echo 'DETAILED RESULTS BY CATEGORY'
\echo '========================================='

SELECT
    test_category as "Schema",
    COUNT(*) as "Total",
    COUNT(*) FILTER (WHERE status = 'PASS') as "Passed",
    COUNT(*) FILTER (WHERE status = 'FAIL') as "Failed",
    COUNT(*) FILTER (WHERE status = 'ERROR') as "Errors",
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'PASS')::NUMERIC /
         NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
        2
    ) as "Pass %"
FROM rls_tests.test_results
GROUP BY test_category
ORDER BY test_category;

\echo ''
\echo '========================================='
\echo 'FAILED/ERROR TESTS'
\echo '========================================='

SELECT
    test_name as "Test",
    test_category as "Schema",
    test_description as "Description",
    status as "Status",
    COALESCE(error_message, 'Expected: ' || expected_result || ', Got: ' || actual_result) as "Details"
FROM rls_tests.test_results
WHERE status IN ('FAIL', 'ERROR')
ORDER BY test_name;

\echo ''
\echo '========================================='
\echo 'ALL TEST RESULTS'
\echo '========================================='

SELECT
    test_name as "Test ID",
    test_category as "Schema",
    LEFT(test_description, 50) as "Description",
    status as "Status"
FROM rls_tests.test_results
ORDER BY test_name;

\echo ''
\echo '========================================='
\echo 'Test execution completed!'
\echo 'Results saved to rls_tests.test_results table'
\echo '========================================='
\echo ''

-- Export results to CSV for reporting
\copy (SELECT test_name, test_category, test_description, expected_result, actual_result, status, error_message, executed_at FROM rls_tests.test_results ORDER BY test_name) TO '/tmp/rls_test_results.csv' WITH CSV HEADER;

\echo 'Results exported to: /tmp/rls_test_results.csv'
\echo ''
