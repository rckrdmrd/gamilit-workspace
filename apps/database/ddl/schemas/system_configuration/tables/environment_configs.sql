-- Tabla: environment_configs
-- Schema: system_configuration
-- Descripción: Configuración por entorno (dev, staging, prod)
-- CREADO: 2025-11-08
-- ACTUALIZADO: 2026-02-03 - Pluralización de nombre (NOM-TBL)

DROP TABLE IF EXISTS system_configuration.environment_configs CASCADE;

CREATE TABLE system_configuration.environment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment VARCHAR(50) NOT NULL CHECK (environment IN ('development', 'staging', 'production', 'test')),
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT NOT NULL,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(environment, config_key)
);

-- Índices
CREATE INDEX idx_environment_configs_environment ON system_configuration.environment_configs(environment);
CREATE INDEX idx_environment_configs_key ON system_configuration.environment_configs(config_key);
CREATE INDEX idx_environment_configs_env_key ON system_configuration.environment_configs(environment, config_key);
CREATE INDEX idx_environment_configs_sensitive ON system_configuration.environment_configs(is_sensitive) WHERE is_sensitive = true;

-- Comentarios
COMMENT ON TABLE system_configuration.environment_configs IS 'Configuration settings by environment';
COMMENT ON COLUMN system_configuration.environment_configs.environment IS 'Environment: development, staging, production, test';
COMMENT ON COLUMN system_configuration.environment_configs.config_key IS 'Configuration key (e.g., "max_upload_size", "api_rate_limit")';
COMMENT ON COLUMN system_configuration.environment_configs.is_encrypted IS 'Whether value is encrypted';
COMMENT ON COLUMN system_configuration.environment_configs.is_sensitive IS 'Whether value contains sensitive data (passwords, keys)';

-- Trigger para updated_at
CREATE TRIGGER trg_environment_configs_updated_at
    BEFORE UPDATE ON system_configuration.environment_configs
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();
