-- ============================================================================
-- GAMILIT Platform - Production Seeds
-- Archivo: seeds/prod/system_configuration/02-feature_flags.sql
-- Propósito: Feature flags para producción (conservadores)
-- ============================================================================

-- Feature flags principales
INSERT INTO system_configuration.feature_flags (
    key,
    name,
    description,
    is_enabled,
    rollout_percentage,
    target_users,
    created_at,
    updated_at
)
VALUES
    (
        'gamification_system',
        'Sistema de Gamificación',
        'Habilita XP, monedas, logros y rankings',
        true,
        100,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'social_features',
        'Features Sociales',
        'Classrooms, teams, friendships',
        true,
        100,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'progress_tracking',
        'Tracking de Progreso',
        'Seguimiento de avance de estudiantes',
        true,
        100,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'ai_assistant',
        'Asistente IA',
        'Asistente con OpenAI para módulo 3',
        true,
        100,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'real_time_collaboration',
        'Colaboración en Tiempo Real',
        'WebSockets para colaboración',
        false,
        0,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'mobile_app',
        'App Móvil',
        'Features específicas para móvil',
        false,
        0,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'advanced_analytics',
        'Analytics Avanzado',
        'Reportes y analytics detallados',
        true,
        50,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'export_reports',
        'Exportar Reportes',
        'Exportar reportes en PDF/Excel',
        true,
        100,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'parent_dashboard',
        'Dashboard para Padres',
        'Dashboard para padres de familia',
        false,
        0,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'content_marketplace',
        'Marketplace de Contenido',
        'Compra/venta de contenido educativo',
        false,
        0,
        '[]'::jsonb,
        NOW(),
        NOW()
    )
ON CONFLICT (key) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_enabled = EXCLUDED.is_enabled,
    rollout_percentage = EXCLUDED.rollout_percentage,
    updated_at = NOW();

-- Verificación
SELECT
    key,
    name,
    is_enabled,
    rollout_percentage,
    CASE
        WHEN is_enabled AND rollout_percentage = 100 THEN '✅ Activo 100%'
        WHEN is_enabled AND rollout_percentage > 0 THEN '🔄 Rollout ' || rollout_percentage || '%'
        ELSE '❌ Deshabilitado'
    END as status
FROM system_configuration.feature_flags
ORDER BY is_enabled DESC, rollout_percentage DESC, key;
