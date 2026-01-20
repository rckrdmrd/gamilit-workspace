-- =====================================================================================
-- SEED: Pending User Initialization for audit_logging Schema
-- =====================================================================================
-- Description: Sample data for pending_user_initialization table
--              Records failed user initialization attempts for monitoring and retry
-- Dependencies: auth_management.profiles, auth_management.tenants
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-20
-- Task: P2-3 (Aumentar cobertura de seeds al 80%)
-- =====================================================================================

SET search_path TO audit_logging, auth_management, public;

-- =====================================================
-- PENDING USER INITIALIZATION RECORDS
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_admin_id UUID;
BEGIN
    RAISE NOTICE 'Creating pending user initialization sample records...';

    -- Get tenant and admin IDs for reference
    SELECT id INTO v_tenant_id FROM auth_management.tenants WHERE name ILIKE '%demo%' OR name ILIKE '%gamilit%' LIMIT 1;
    SELECT id INTO v_admin_id FROM auth_management.profiles WHERE role = 'admin' LIMIT 1;

    -- Sample pending initialization records (simulating failed triggers)
    INSERT INTO audit_logging.pending_user_initialization (
        id,
        user_id,
        profile_id,
        tenant_id,
        error_message,
        error_code,
        error_detail,
        trigger_name,
        function_name,
        retry_count,
        max_retries,
        last_retry_at,
        next_retry_at,
        status,
        resolved_at,
        resolved_by,
        resolution_notes,
        created_at,
        updated_at
    ) VALUES

    -- Record 1: Pending - Database connection timeout
    (
        '11111111-1111-1111-1111-111111111001'::uuid,
        gen_random_uuid(),
        NULL,
        v_tenant_id,
        'Connection timeout while creating user_stats record',
        'CONN_TIMEOUT',
        'PostgreSQL connection pool exhausted during peak load',
        'trg_initialize_user_stats',
        'gamilit.initialize_user_stats',
        1,
        3,
        NOW() - INTERVAL '2 hours',
        NOW() + INTERVAL '1 hour',
        'pending',
        NULL,
        NULL,
        NULL,
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours'
    ),

    -- Record 2: Retrying - Foreign key constraint
    (
        '11111111-1111-1111-1111-111111111002'::uuid,
        gen_random_uuid(),
        NULL,
        v_tenant_id,
        'Foreign key violation on user_ranks insert',
        'FK_VIOLATION',
        'Key (rank_id)=(unknown-rank) is not present in maya_ranks',
        'trg_initialize_user_stats',
        'gamilit.initialize_user_stats',
        2,
        3,
        NOW() - INTERVAL '30 minutes',
        NOW() + INTERVAL '30 minutes',
        'retrying',
        NULL,
        NULL,
        NULL,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '30 minutes'
    ),

    -- Record 3: Resolved - Successfully retried
    (
        '11111111-1111-1111-1111-111111111003'::uuid,
        gen_random_uuid(),
        NULL,
        v_tenant_id,
        'Deadlock detected during user_stats creation',
        'DEADLOCK',
        'Deadlock detected while inserting into gamification_system.user_stats',
        'trg_initialize_user_stats',
        'gamilit.initialize_user_stats',
        2,
        3,
        NOW() - INTERVAL '4 hours',
        NULL,
        'resolved',
        NOW() - INTERVAL '3 hours',
        v_admin_id,
        'Retry successful after deadlock resolution',
        NOW() - INTERVAL '6 hours',
        NOW() - INTERVAL '3 hours'
    ),

    -- Record 4: Failed - Max retries exceeded
    (
        '11111111-1111-1111-1111-111111111004'::uuid,
        gen_random_uuid(),
        NULL,
        v_tenant_id,
        'Trigger function not found after schema migration',
        'FUNC_NOT_FOUND',
        'Function gamilit.initialize_user_stats does not exist',
        'trg_initialize_user_stats',
        'gamilit.initialize_user_stats',
        3,
        3,
        NOW() - INTERVAL '12 hours',
        NULL,
        'failed',
        NULL,
        NULL,
        NULL,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '12 hours'
    ),

    -- Record 5: Manual intervention required
    (
        '11111111-1111-1111-1111-111111111005'::uuid,
        gen_random_uuid(),
        NULL,
        v_tenant_id,
        'User profile data incomplete - missing required fields',
        'DATA_INCOMPLETE',
        'Profile requires manual review: missing grade_level and school_id',
        'trg_initialize_user_stats',
        'gamilit.initialize_user_stats',
        1,
        3,
        NOW() - INTERVAL '8 hours',
        NULL,
        'manual',
        NULL,
        NULL,
        NULL,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '8 hours'
    )

    ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        retry_count = EXCLUDED.retry_count,
        last_retry_at = EXCLUDED.last_retry_at,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE 'Pending user initialization records created successfully';
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_pending_count INTEGER;
    v_resolved_count INTEGER;
    v_failed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM audit_logging.pending_user_initialization;
    SELECT COUNT(*) INTO v_pending_count FROM audit_logging.pending_user_initialization WHERE status = 'pending';
    SELECT COUNT(*) INTO v_resolved_count FROM audit_logging.pending_user_initialization WHERE status = 'resolved';
    SELECT COUNT(*) INTO v_failed_count FROM audit_logging.pending_user_initialization WHERE status = 'failed';

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: pending_user_initialization';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total registros: %', v_total_count;
    RAISE NOTICE '  - Pending: %', v_pending_count;
    RAISE NOTICE '  - Resolved: %', v_resolved_count;
    RAISE NOTICE '  - Failed: %', v_failed_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
