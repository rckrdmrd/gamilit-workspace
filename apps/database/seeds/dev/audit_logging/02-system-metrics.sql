-- =====================================================
-- GLIT Platform - System Metrics & Alerts Seeds
-- =====================================================
-- Schema: audit_logging
-- Description: Performance metrics, system alerts, user activity logs
-- Dependencies: auth schema (users)
-- Version: 1.1 (fixed column names to match DDL)
-- =====================================================
-- DDL performance_metrics columns: id, tenant_id, metric_name, metric_type,
--   category, metric_value, unit, endpoint, operation, module_name,
--   function_name, request_id, session_id, user_id, dimensions, tags,
--   measured_at, created_at
-- DDL system_alerts columns: id, tenant_id, alert_type, severity, title,
--   description, source_system, source_module, error_code, affected_users,
--   status, acknowledgment_note, resolution_note, acknowledged_by,
--   acknowledged_at, resolved_by, resolved_at, notification_sent,
--   escalation_level, auto_resolve, suppress_similar, context_data,
--   metrics, related_alerts, triggered_at, created_at, updated_at
-- DDL alert_type CHECK: performance_degradation, high_error_rate,
--   security_breach, resource_limit, service_outage, data_anomaly
-- DDL severity CHECK: low, medium, high, critical
-- DDL status CHECK: open, acknowledged, resolved, suppressed
-- =====================================================

SET search_path TO audit_logging, auth, public;

-- =====================================================
-- PERFORMANCE METRICS: Metricas historicas
-- =====================================================
-- Idempotency: delete previous seed data before re-inserting
DELETE FROM audit_logging.performance_metrics
WHERE module_name IN ('postgresql', 'api_server', 'websocket_server', 'application', 'gamification', 'system', 'redis');

INSERT INTO audit_logging.performance_metrics (
    metric_name, metric_type, metric_value,
    unit, module_name, category,
    dimensions, measured_at, created_at
) VALUES

-- ============ DATABASE METRICS ============

(
    'database_connections_active',
    'gauge',
    15.0,
    'connections',
    'postgresql',
    'database',
    '{
        "pool_size": 20,
        "utilization_percentage": 75,
        "idle_connections": 5,
        "waiting_clients": 0
    }'::jsonb,
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '10 minutes'
),
(
    'database_query_avg_duration',
    'histogram',
    45.5,
    'milliseconds',
    'postgresql',
    'database',
    '{
        "queries_sampled": 1250,
        "p50": 25.0,
        "p75": 55.0,
        "p95": 85.0,
        "p99": 150.0,
        "max": 500.0
    }'::jsonb,
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '10 minutes'
),
(
    'database_cache_hit_ratio',
    'gauge',
    98.5,
    'percentage',
    'postgresql',
    'database',
    '{
        "cache_hits": 9850,
        "cache_misses": 150,
        "total_queries": 10000,
        "shared_buffers_mb": 128
    }'::jsonb,
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '15 minutes'
),
(
    'database_transactions_per_second',
    'gauge',
    45.8,
    'transactions',
    'postgresql',
    'database',
    '{
        "commits": 2748,
        "rollbacks": 12,
        "sample_duration_seconds": 60
    }'::jsonb,
    NOW() - INTERVAL '20 minutes',
    NOW() - INTERVAL '20 minutes'
),

-- ============ APPLICATION METRICS ============

(
    'api_requests_total',
    'counter',
    5432.0,
    'requests',
    'api_server',
    'performance',
    '{
        "endpoint": "/api/exercises",
        "method": "GET",
        "status_2xx": 5200,
        "status_4xx": 200,
        "status_5xx": 32,
        "time_window_hours": 1
    }'::jsonb,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
),
(
    'api_response_time',
    'histogram',
    125.5,
    'milliseconds',
    'api_server',
    'performance',
    '{
        "endpoint": "/api/modules",
        "method": "GET",
        "p50": 95.0,
        "p75": 180.0,
        "p95": 250.0,
        "p99": 450.0,
        "requests_count": 850
    }'::jsonb,
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
),
(
    'api_error_rate',
    'gauge',
    0.8,
    'percentage',
    'api_server',
    'performance',
    '{
        "total_requests": 5000,
        "errors": 40,
        "status_5xx": 32,
        "status_4xx": 8,
        "threshold_percentage": 2.0
    }'::jsonb,
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '45 minutes'
),
(
    'websocket_connections_active',
    'gauge',
    12.0,
    'connections',
    'websocket_server',
    'performance',
    '{
        "max_connections": 1000,
        "utilization_percentage": 1.2,
        "messages_per_second": 45
    }'::jsonb,
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes'
),

-- ============ USER ACTIVITY METRICS ============

(
    'active_users_daily',
    'gauge',
    5.0,
    'users',
    'application',
    'business',
    '{
        "date": "2025-11-02",
        "students": 3,
        "instructors": 1,
        "admins": 1,
        "total_sessions": 8,
        "avg_session_duration_minutes": 45
    }'::jsonb,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
),
(
    'exercises_completed',
    'counter',
    12.0,
    'exercises',
    'application',
    'business',
    '{
        "period": "24h",
        "module_breakdown": {
            "MOD-01-LITERAL": 8,
            "MOD-02-INFERENCIAL": 3,
            "MOD-03-CRITICA": 1
        },
        "avg_score_percentage": 75.5
    }'::jsonb,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
),
(
    'ml_coins_transactions',
    'counter',
    45.0,
    'transactions',
    'gamification',
    'business',
    '{
        "period": "24h",
        "total_earned": 1250,
        "total_spent": 350,
        "net_change": 900,
        "unique_users": 3
    }'::jsonb,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
),
(
    'mission_completion_rate',
    'gauge',
    65.5,
    'percentage',
    'application',
    'business',
    '{
        "missions_assigned": 20,
        "missions_completed": 13,
        "missions_in_progress": 5,
        "missions_overdue": 2
    }'::jsonb,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
),

-- ============ SYSTEM RESOURCES ============

(
    'memory_usage',
    'gauge',
    512.5,
    'megabytes',
    'system',
    'system',
    '{
        "total_mb": 2048,
        "utilization_percentage": 25,
        "heap_used_mb": 380,
        "heap_total_mb": 512,
        "rss_mb": 650
    }'::jsonb,
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes'
),
(
    'cpu_usage',
    'gauge',
    35.2,
    'percentage',
    'system',
    'system',
    '{
        "cores": 4,
        "load_average": [1.2, 1.5, 1.3],
        "user_percentage": 25.5,
        "system_percentage": 9.7
    }'::jsonb,
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes'
),
(
    'disk_usage',
    'gauge',
    1024.0,
    'megabytes',
    'system',
    'system',
    '{
        "total_gb": 50,
        "used_gb": 1.0,
        "available_gb": 49.0,
        "utilization_percentage": 2.0
    }'::jsonb,
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '10 minutes'
),
(
    'network_throughput',
    'gauge',
    2.5,
    'megabytes_per_second',
    'system',
    'system',
    '{
        "inbound_mbps": 1.8,
        "outbound_mbps": 0.7,
        "packets_per_second": 1250,
        "errors": 0
    }'::jsonb,
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes'
),

-- ============ CACHE METRICS ============

(
    'cache_hit_rate',
    'gauge',
    85.5,
    'percentage',
    'redis',
    'performance',
    '{
        "total_requests": 5000,
        "hits": 4275,
        "misses": 725,
        "evictions": 12
    }'::jsonb,
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '15 minutes'
),
(
    'cache_memory_usage',
    'gauge',
    128.5,
    'megabytes',
    'redis',
    'performance',
    '{
        "max_memory_mb": 256,
        "utilization_percentage": 50.2,
        "keys_count": 1250,
        "expired_keys": 45
    }'::jsonb,
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '10 minutes'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SYSTEM ALERTS: Alertas generadas
-- =====================================================
-- Idempotency: delete previous seed data before re-inserting
DELETE FROM audit_logging.system_alerts
WHERE title IN (
    'High Memory Usage Detected',
    'Multiple Failed Login Attempts',
    'Automated Backup Completed',
    'Slow API Response Time',
    'High API Error Rate',
    'SSL Certificate Expiring Soon',
    'Disk Space Usage'
);

INSERT INTO audit_logging.system_alerts (
    alert_type, severity, title, description,
    source_system, source_module,
    status, triggered_at, resolved_at,
    context_data, created_at, updated_at
) VALUES

-- ============ RESOLVED ALERTS ============

-- High memory usage (resolved)
(
    'resource_limit',
    'medium',
    'High Memory Usage Detected',
    'Memory usage exceeded 80% threshold',
    'system',
    'system',
    'resolved',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour',
    '{
        "threshold_value": 80.0,
        "current_value": 85.5,
        "actions_taken": [
            "Memory cache cleared",
            "Garbage collection forced",
            "Unused connections closed"
        ],
        "resolution_time_minutes": 60,
        "peak_memory_mb": 1740,
        "final_memory_mb": 512
    }'::jsonb,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour'
),

-- Failed login attempts (resolved)
(
    'security_breach',
    'low',
    'Multiple Failed Login Attempts',
    'User exceeded login attempt threshold',
    'authentication',
    'auth',
    'resolved',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '2 hours 55 minutes',
    '{
        "threshold_value": 5.0,
        "current_value": 6.0,
        "user_email": "test@example.com",
        "ip_address": "203.0.113.42",
        "actions_taken": [
            "Account locked for 15 minutes",
            "Security notification sent"
        ],
        "resolution": "User successfully logged in after password reset"
    }'::jsonb,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '2 hours 55 minutes'
),

-- Database backup success (acknowledged)
(
    'data_anomaly',
    'low',
    'Automated Backup Completed',
    'Daily database backup completed successfully',
    'database',
    'postgresql',
    'acknowledged',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours',
    '{
        "backup_size_mb": 450,
        "duration_seconds": 45,
        "location": "/backups/glit_dev_2025-11-02.sql.gz",
        "compression_ratio": 4.5,
        "integrity_check": "passed"
    }'::jsonb,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
),

-- ============ OPEN ALERTS ============

-- Slow API endpoint (open)
(
    'performance_degradation',
    'medium',
    'Slow API Response Time',
    'Endpoint /api/leaderboards exceeding SLA',
    'api_server',
    'api_server',
    'open',
    NOW() - INTERVAL '15 minutes',
    NULL,
    '{
        "threshold_value": 200.0,
        "current_value": 450.0,
        "endpoint": "/api/leaderboards",
        "method": "GET",
        "sla_ms": 200,
        "p99_ms": 450,
        "requests_affected": 25,
        "suggested_actions": [
            "Add database index on leaderboards.student_id",
            "Implement Redis caching for leaderboard data",
            "Consider pagination for large result sets"
        ]
    }'::jsonb,
    NOW() - INTERVAL '15 minutes',
    NOW()
),

-- High error rate (open)
(
    'high_error_rate',
    'high',
    'High API Error Rate',
    'Error rate exceeded 2% threshold',
    'api_server',
    'api_server',
    'open',
    NOW() - INTERVAL '25 minutes',
    NULL,
    '{
        "threshold_value": 2.0,
        "current_value": 3.5,
        "total_requests": 1000,
        "errors": 35,
        "error_breakdown": {
            "500_internal_error": 20,
            "503_service_unavailable": 10,
            "504_gateway_timeout": 5
        },
        "affected_endpoints": [
            "/api/exercises/submit",
            "/api/ml-coins/transactions"
        ],
        "investigating": true
    }'::jsonb,
    NOW() - INTERVAL '25 minutes',
    NOW()
),

-- ============ ACKNOWLEDGED ALERTS ============

-- SSL certificate expiry warning (acknowledged)
(
    'security_breach',
    'medium',
    'SSL Certificate Expiring Soon',
    'SSL certificate will expire in 30 days',
    'security',
    'security',
    'acknowledged',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    '{
        "domain": "*.glit.edu.mx",
        "expiry_date": "2025-12-02",
        "days_remaining": 30,
        "renewal_initiated": true,
        "auto_renewal": true
    }'::jsonb,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),

-- Disk space warning (acknowledged)
(
    'resource_limit',
    'low',
    'Disk Space Usage',
    'Disk usage reached 70% threshold',
    'system',
    'system',
    'acknowledged',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours',
    '{
        "threshold_value": 70.0,
        "current_value": 72.5,
        "mount_point": "/var/lib/postgresql",
        "total_gb": 100,
        "used_gb": 72.5,
        "available_gb": 27.5,
        "cleanup_scheduled": true,
        "retention_policy": "90 days"
    }'::jsonb,
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- USER ACTIVITY LOGS: Actividad de usuarios
-- =====================================================

DO $$
DECLARE
    student_record RECORD;
    -- Only allowed activity_type values per DDL CHECK constraint:
    -- page_view, button_click, form_submit, exercise_start, exercise_complete,
    -- module_access, video_play, resource_download, search_query
    activity_types TEXT[] := ARRAY['page_view', 'exercise_start', 'exercise_complete', 'module_access', 'button_click', 'search_query', 'page_view'];
    pages TEXT[] := ARRAY['/modules', '/missions', '/leaderboard', '/ml-store', '/profile', '/achievements'];
BEGIN
    -- Idempotency guard: skip if seed data already exists
    IF EXISTS (SELECT 1 FROM audit_logging.user_activity_logs LIMIT 1) THEN
        RAISE NOTICE 'user_activity_logs seed data already exists, skipping';
        RETURN;
    END IF;

    -- Generar activity logs para cada estudiante
    -- user_id FK references auth_management.profiles(id), not auth.users(id)
    FOR student_record IN
        SELECT p.id AS user_id, u.email
        FROM auth.users u
        JOIN auth_management.profiles p ON p.user_id = u.id
        WHERE u.role = 'student'
        LIMIT 3
    LOOP
        -- 5 actividades por estudiante
        FOR i IN 1..5 LOOP
            INSERT INTO audit_logging.user_activity_logs (
                user_id, activity_type, action_detail,
                ip_address, user_agent, session_id,
                metadata, created_at
            ) VALUES (
                student_record.user_id,
                activity_types[1 + floor(random() * array_length(activity_types, 1))::int],
                'User activity: ' || pages[1 + floor(random() * array_length(pages, 1))::int],
                '192.168.1.' || (50 + i)::TEXT,
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0',
                gen_random_uuid(),
                jsonb_build_object(
                    'page', pages[1 + floor(random() * array_length(pages, 1))::int],
                    'duration_seconds', 30 + floor(random() * 120)::int,
                    'interactions', 1 + floor(random() * 5)::int,
                    'referrer', '/dashboard',
                    'device_type', CASE WHEN random() > 0.7 THEN 'mobile' ELSE 'desktop' END
                ),
                NOW() - (random() * INTERVAL '24 hours')
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    -- Logs especificos adicionales
    -- 'logout' is not allowed by the CHECK constraint; use 'page_view' instead
    INSERT INTO audit_logging.user_activity_logs (
        user_id, activity_type, action_detail,
        ip_address, user_agent, session_id,
        metadata, created_at
    )
    SELECT
        p.id,
        'page_view',
        'User session ended',
        '192.168.1.45',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0',
        gen_random_uuid(),
        '{
            "session_duration_minutes": 45,
            "activities_count": 12,
            "logout_type": "manual"
        }'::jsonb,
        NOW() - INTERVAL '30 minutes'
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante1@demo.glit.edu.mx'
    ON CONFLICT DO NOTHING;

END $$;

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$
DECLARE
    metrics_count INT;
    alerts_count INT;
    activity_count INT;
BEGIN
    SELECT COUNT(*) INTO metrics_count FROM audit_logging.performance_metrics;
    SELECT COUNT(*) INTO alerts_count FROM audit_logging.system_alerts;
    SELECT COUNT(*) INTO activity_count FROM audit_logging.user_activity_logs;

    RAISE NOTICE 'System metrics seeds completed successfully';
    RAISE NOTICE '- % performance_metrics inserted', metrics_count;
    RAISE NOTICE '- % system_alerts inserted', alerts_count;
    RAISE NOTICE '- % user_activity_logs inserted', activity_count;
END $$;
