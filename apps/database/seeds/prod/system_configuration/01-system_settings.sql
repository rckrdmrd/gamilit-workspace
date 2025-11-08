-- ============================================================================
-- GAMILIT Platform - Production Seeds
-- Archivo: seeds/prod/system_configuration/01-system_settings.sql
-- Propósito: Configuración del sistema para producción
-- ============================================================================

-- Configuración de ambiente
INSERT INTO system_configuration.system_settings (key, value, type, category, is_public, description)
VALUES
    ('environment', 'production', 'string', 'system', false, 'Ambiente de ejecución'),
    ('app_version', '1.0.0', 'string', 'system', true, 'Versión de la aplicación'),
    ('maintenance_mode', 'false', 'boolean', 'system', true, 'Modo de mantenimiento'),
    ('maintenance_message', 'Sistema en mantenimiento. Volveremos pronto.', 'string', 'system', true, 'Mensaje de mantenimiento')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- Configuración de autenticación
INSERT INTO system_configuration.system_settings (key, value, type, category, is_public, description)
VALUES
    ('registration_enabled', 'true', 'boolean', 'auth', true, 'Permitir registro de usuarios'),
    ('email_verification_required', 'true', 'boolean', 'auth', false, 'Requiere verificación de email'),
    ('max_login_attempts', '5', 'integer', 'auth', false, 'Máximo de intentos de login'),
    ('session_timeout_minutes', '60', 'integer', 'auth', false, 'Timeout de sesión en minutos'),
    ('jwt_expiration_hours', '24', 'integer', 'auth', false, 'Expiración de JWT en horas'),
    ('refresh_token_days', '30', 'integer', 'auth', false, 'Duración de refresh token en días')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- Configuración de seguridad
INSERT INTO system_configuration.system_settings (key, value, type, category, is_public, description)
VALUES
    ('enable_ssl', 'true', 'boolean', 'security', false, 'Habilitar SSL/TLS'),
    ('enable_cors', 'true', 'boolean', 'security', false, 'Habilitar CORS'),
    ('allowed_origins', 'https://gamilit.com,https://www.gamilit.com', 'string', 'security', false, 'Orígenes permitidos para CORS'),
    ('enable_rate_limiting', 'true', 'boolean', 'security', false, 'Habilitar rate limiting'),
    ('rate_limit_per_minute', '100', 'integer', 'security', false, 'Requests por minuto por IP')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- Configuración de logging
INSERT INTO system_configuration.system_settings (key, value, type, category, is_public, description)
VALUES
    ('log_level', 'warning', 'string', 'logging', false, 'Nivel de logging (debug|info|warning|error)'),
    ('log_requests', 'false', 'boolean', 'logging', false, 'Logear todas las requests'),
    ('log_errors_only', 'true', 'boolean', 'logging', false, 'Logear solo errores'),
    ('enable_performance_monitoring', 'true', 'boolean', 'logging', false, 'Monitor de performance')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- Configuración de features
INSERT INTO system_configuration.system_settings (key, value, type, category, is_public, description)
VALUES
    ('enable_gamification', 'true', 'boolean', 'features', true, 'Habilitar gamificación'),
    ('enable_social_features', 'true', 'boolean', 'features', true, 'Habilitar features sociales'),
    ('enable_progress_tracking', 'true', 'boolean', 'features', true, 'Habilitar tracking de progreso'),
    ('enable_assessments', 'true', 'boolean', 'features', true, 'Habilitar assessments'),
    ('enable_analytics', 'true', 'boolean', 'features', false, 'Habilitar analytics')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- Configuración de límites
INSERT INTO system_configuration.system_settings (key, value, type, category, is_public, description)
VALUES
    ('max_file_upload_mb', '50', 'integer', 'limits', true, 'Tamaño máximo de archivo en MB'),
    ('max_students_per_classroom', '50', 'integer', 'limits', true, 'Estudiantes máximos por aula'),
    ('max_teams_per_classroom', '10', 'integer', 'limits', true, 'Teams máximos por aula'),
    ('max_exercises_per_module', '100', 'integer', 'limits', false, 'Ejercicios máximos por módulo')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- Configuración de notificaciones
INSERT INTO system_configuration.system_settings (key, value, type, category, is_public, description)
VALUES
    ('enable_email_notifications', 'true', 'boolean', 'notifications', false, 'Habilitar notificaciones por email'),
    ('enable_push_notifications', 'false', 'boolean', 'notifications', false, 'Habilitar notificaciones push'),
    ('smtp_host', 'CONFIGURAR_EN_PRODUCCION', 'string', 'notifications', false, 'Host SMTP'),
    ('smtp_port', '587', 'integer', 'notifications', false, 'Puerto SMTP'),
    ('smtp_from_email', 'noreply@gamilit.com', 'string', 'notifications', false, 'Email remitente')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- Verificación
SELECT
    key,
    value,
    type,
    category,
    is_public,
    description
FROM system_configuration.system_settings
ORDER BY category, key;
