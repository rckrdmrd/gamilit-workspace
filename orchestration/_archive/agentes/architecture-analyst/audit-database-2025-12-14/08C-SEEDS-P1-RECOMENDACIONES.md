# RECOMENDACIONES SEEDS P1 - ALTA PRIORIDAD

**Fecha:** 2025-12-14
**Prioridad:** P1 - ALTA
**Fase:** 2 (Semana 2-3)

---

## SEEDS ALTA PRIORIDAD A IMPLEMENTAR (10 tablas)

### RESUMEN

| Schema | Tabla | Archivo Recomendado | Registros Est. | Impacto |
|--------|-------|---------------------|----------------|---------|
| auth_management | user_preferences | 08-user_preferences_defaults.sql | 5-10 | Preferencias por defecto |
| content_management | content_categories | 03-content_categories.sql | 8-12 | Categorización contenido |
| content_management | moderation_rules | 04-moderation_rules.sql | 10-15 | Moderación automática |
| educational_content | content_tags | 13-content_tags.sql | 30-50 | Sistema de etiquetado |
| educational_content | media_resources | 14-media_resources.sql | 15-25 | Recursos multimedia |
| progress_tracking | learning_paths | 02-learning_paths.sql | 5-8 | Rutas de aprendizaje |
| system_configuration | api_configuration | 05-api_configuration.sql | 5-10 | APIs externas |
| system_configuration | environment_config | 06-environment_config.sql | 15-20 | Config por ambiente |

---

## 1. `auth_management/08-user_preferences_defaults.sql`

**Tabla:** `auth_management.user_preferences`
**Impacto:** Preferencias por defecto faltantes
**Registros:** 5-10 configuraciones base

### Contenido Sugerido

```sql
-- =====================================================
-- SEED: User Preferences Defaults
-- Schema: auth_management
-- Tabla: user_preferences
-- Prioridad: P1 - ALTA
-- =====================================================

TRUNCATE TABLE auth_management.user_preferences RESTART IDENTITY CASCADE;

-- Preferencias por defecto para nuevos usuarios STUDENT
INSERT INTO auth_management.user_preferences (
    user_id,
    preferences,
    created_at,
    updated_at
)
SELECT
    u.id,
    jsonb_build_object(
        'theme', 'light',
        'language', 'es',
        'timezone', 'America/Mexico_City',
        'notifications', jsonb_build_object(
            'email', true,
            'push', true,
            'in_app', true,
            'digest_frequency', 'daily'
        ),
        'accessibility', jsonb_build_object(
            'high_contrast', false,
            'font_size', 'medium',
            'screen_reader', false
        ),
        'privacy', jsonb_build_object(
            'show_profile', true,
            'show_progress', true,
            'allow_friend_requests', true
        )
    ),
    now(),
    now()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM auth_management.user_preferences up
    WHERE up.user_id = u.id
);
```

### Valores por Rol

- **Student:** notificaciones habilitadas, perfil público
- **Teacher:** notificaciones digest semanal, perfil público
- **Admin:** notificaciones críticas only, perfil privado
- **Parent:** notificaciones de hijos habilitadas, perfil privado

---

## 2. `content_management/03-content_categories.sql`

**Tabla:** `content_management.content_categories`
**Impacto:** Categorización de contenido faltante
**Registros:** 8-12 categorías principales

### Contenido Sugerido

```sql
-- =====================================================
-- SEED: Content Categories
-- Schema: content_management
-- Tabla: content_categories
-- Prioridad: P1 - ALTA
-- =====================================================

TRUNCATE TABLE content_management.content_categories RESTART IDENTITY CASCADE;

INSERT INTO content_management.content_categories (
    category_code,
    category_name,
    category_description,
    parent_category_id,
    metadata,
    created_at
) VALUES
    ('BIO', 'Biografía', 'Contenido biográfico de Marie Curie', NULL,
     jsonb_build_object('icon', 'person', 'color', '#4CAF50'), now()),

    ('SCI', 'Ciencia', 'Conceptos y descubrimientos científicos', NULL,
     jsonb_build_object('icon', 'science', 'color', '#2196F3'), now()),

    ('HIS', 'Historia', 'Contexto histórico y eventos', NULL,
     jsonb_build_object('icon', 'history_edu', 'color', '#FF9800'), now()),

    ('EXP', 'Experimentos', 'Experimentos y metodología científica', NULL,
     jsonb_build_object('icon', 'biotech', 'color', '#9C27B0'), now()),

    ('SOC', 'Impacto Social', 'Impacto en sociedad y género', NULL,
     jsonb_build_object('icon', 'groups', 'color', '#E91E63'), now()),

    ('EDU', 'Educación', 'Contenido educativo y didáctico', NULL,
     jsonb_build_object('icon', 'school', 'color', '#00BCD4'), now()),

    ('MED', 'Medicina', 'Aplicaciones médicas de la radiactividad', NULL,
     jsonb_build_object('icon', 'medical_services', 'color', '#F44336'), now()),

    ('PHY', 'Física', 'Conceptos de física y radiactividad', 'SCI',
     jsonb_build_object('icon', 'energy_savings_leaf', 'color', '#3F51B5'), now()),

    ('CHE', 'Química', 'Elementos químicos y reacciones', 'SCI',
     jsonb_build_object('icon', 'science', 'color', '#009688'), now()),

    ('AWA', 'Premios', 'Reconocimientos y galardones', NULL,
     jsonb_build_object('icon', 'emoji_events', 'color', '#FFC107'), now());
```

---

## 3. `content_management/04-moderation_rules.sql`

**Tabla:** `content_management.moderation_rules`
**Impacto:** Moderación automática deshabilitada
**Registros:** 10-15 reglas de moderación

### Contenido Sugerido

```sql
-- =====================================================
-- SEED: Moderation Rules
-- Schema: content_management
-- Tabla: moderation_rules
-- Prioridad: P1 - ALTA
-- =====================================================

TRUNCATE TABLE content_management.moderation_rules RESTART IDENTITY CASCADE;

INSERT INTO content_management.moderation_rules (
    rule_name,
    rule_type,
    rule_config,
    action,
    severity,
    is_active,
    created_at
) VALUES
    ('Palabras prohibidas básicas', 'keyword_blacklist',
     jsonb_build_object('keywords', jsonb_build_array('spam', 'phishing', 'scam')),
     'flag', 'high', true, now()),

    ('Lenguaje ofensivo', 'keyword_blacklist',
     jsonb_build_object('keywords', jsonb_build_array('offensive1', 'offensive2')),
     'block', 'critical', true, now()),

    ('URLs sospechosas', 'pattern',
     jsonb_build_object('pattern', 'http[s]?://(?!gamilit\\.com).*'),
     'flag', 'medium', true, now()),

    ('Emails no autorizados', 'pattern',
     jsonb_build_object('pattern', '[a-zA-Z0-9._%+-]+@(?!gamilit\\.com)'),
     'flag', 'low', true, now()),

    ('Contenido muy largo', 'length_limit',
     jsonb_build_object('max_length', 5000),
     'warn', 'low', true, now());
```

---

## 4. `educational_content/13-content_tags.sql`

**Tabla:** `educational_content.content_tags`
**Impacto:** Sistema de etiquetado faltante
**Registros:** 30-50 tags principales

### Contenido Sugerido

```sql
-- =====================================================
-- SEED: Content Tags
-- Schema: educational_content
-- Tabla: content_tags
-- Prioridad: P1 - ALTA
-- =====================================================

TRUNCATE TABLE educational_content.content_tags RESTART IDENTITY CASCADE;

INSERT INTO educational_content.content_tags (
    tag_code,
    tag_name,
    tag_category,
    usage_count,
    metadata,
    created_at
) VALUES
    -- Tags Marie Curie
    ('marie-curie', 'Marie Curie', 'person', 0,
     jsonb_build_object('related_modules', jsonb_build_array('MOD-01', 'MOD-02', 'MOD-03', 'MOD-04', 'MOD-05')), now()),

    ('pierre-curie', 'Pierre Curie', 'person', 0,
     jsonb_build_object('related_modules', jsonb_build_array('MOD-03')), now()),

    -- Tags Científicos
    ('radiactividad', 'Radiactividad', 'concept', 0,
     jsonb_build_object('difficulty', 'medium', 'grade_levels', jsonb_build_array('7', '8', '9')), now()),

    ('polonio', 'Polonio', 'element', 0,
     jsonb_build_object('atomic_number', 84), now()),

    ('radio', 'Radio', 'element', 0,
     jsonb_build_object('atomic_number', 88), now()),

    ('nobel', 'Premio Nobel', 'award', 0,
     jsonb_build_object('years', jsonb_build_array(1903, 1911)), now()),

    -- Tags Temáticos
    ('ciencia', 'Ciencia', 'theme', 0,
     jsonb_build_object('related_modules', jsonb_build_array('MOD-02', 'MOD-03')), now()),

    ('mujer-ciencia', 'Mujer en Ciencia', 'theme', 0,
     jsonb_build_object('related_modules', jsonb_build_array('MOD-03', 'MOD-05')), now()),

    ('perseverancia', 'Perseverancia', 'value', 0,
     jsonb_build_object('related_modules', jsonb_build_array('MOD-01', 'MOD-05')), now()),

    ('innovación', 'Innovación', 'value', 0,
     jsonb_build_object('related_modules', jsonb_build_array('MOD-04', 'MOD-05')), now());
```

---

## 5. `educational_content/14-media_resources.sql`

**Tabla:** `educational_content.media_resources`
**Impacto:** Recursos multimedia base faltantes
**Registros:** 15-25 recursos

### Contenido Sugerido

```sql
-- =====================================================
-- SEED: Media Resources
-- Schema: educational_content
-- Tabla: media_resources
-- Prioridad: P1 - ALTA
-- =====================================================

TRUNCATE TABLE educational_content.media_resources RESTART IDENTITY CASCADE;

INSERT INTO educational_content.media_resources (
    resource_code,
    resource_name,
    resource_type,
    resource_url,
    thumbnail_url,
    metadata,
    created_at
) VALUES
    ('marie-portrait-1', 'Retrato de Marie Curie (1903)', 'image',
     'https://cdn.gamilit.com/media/marie-curie-portrait-1903.jpg',
     'https://cdn.gamilit.com/media/thumbs/marie-curie-portrait-1903.jpg',
     jsonb_build_object('year', 1903, 'source', 'Public Domain', 'related_content', 'marie-nobel-physics-1903'),
     now()),

    ('lab-radium', 'Laboratorio de Investigación del Radio', 'image',
     'https://cdn.gamilit.com/media/lab-radium.jpg',
     'https://cdn.gamilit.com/media/thumbs/lab-radium.jpg',
     jsonb_build_object('year', 1902, 'location', 'París', 'related_content', 'marie-radioactivity-research'),
     now()),

    ('nobel-certificate-1903', 'Certificado Nobel Física 1903', 'document',
     'https://cdn.gamilit.com/media/nobel-certificate-1903.pdf',
     'https://cdn.gamilit.com/media/thumbs/nobel-certificate-1903.jpg',
     jsonb_build_object('year', 1903, 'award', 'Nobel Physics'),
     now());
```

---

## 6. `progress_tracking/02-learning_paths.sql`

**Tabla:** `progress_tracking.learning_paths`
**Impacto:** Rutas de aprendizaje predefinidas necesarias
**Registros:** 5-8 rutas predefinidas

### Contenido Sugerido

```sql
-- =====================================================
-- SEED: Learning Paths
-- Schema: progress_tracking
-- Tabla: learning_paths
-- Prioridad: P1 - ALTA
-- =====================================================

TRUNCATE TABLE progress_tracking.learning_paths RESTART IDENTITY CASCADE;

INSERT INTO progress_tracking.learning_paths (
    path_code,
    path_name,
    path_description,
    difficulty_level,
    estimated_hours,
    path_structure,
    is_active,
    created_at
) VALUES
    ('PATH-BEGINNER', 'Ruta del Principiante',
     'Introducción a la comprensión lectora con Marie Curie',
     'beginner',
     8,
     jsonb_build_object(
         'modules', jsonb_build_array(
             jsonb_build_object('module_code', 'MOD-01-LITERAL', 'order', 1, 'required', true),
             jsonb_build_object('module_code', 'MOD-02-INFERENCIAL', 'order', 2, 'required', true)
         ),
         'milestones', jsonb_build_array(
             jsonb_build_object('at_module', 'MOD-01-LITERAL', 'achievement', 'FIRST-MODULE-COMPLETE'),
             jsonb_build_object('at_module', 'MOD-02-INFERENCIAL', 'achievement', 'BEGINNER-PATH-COMPLETE')
         )
     ),
     true,
     now()),

    ('PATH-INTERMEDIATE', 'Ruta Intermedia',
     'Desarrolla pensamiento crítico',
     'intermediate',
     12,
     jsonb_build_object(
         'modules', jsonb_build_array(
             jsonb_build_object('module_code', 'MOD-02-INFERENCIAL', 'order', 1, 'required', true),
             jsonb_build_object('module_code', 'MOD-03-CRITICA', 'order', 2, 'required', true),
             jsonb_build_object('module_code', 'MOD-04-DIGITAL', 'order', 3, 'required', true)
         )
     ),
     true,
     now()),

    ('PATH-ADVANCED', 'Ruta Avanzada',
     'Domina todos los niveles de comprensión lectora',
     'advanced',
     20,
     jsonb_build_object(
         'modules', jsonb_build_array(
             jsonb_build_object('module_code', 'MOD-01-LITERAL', 'order', 1, 'required', true),
             jsonb_build_object('module_code', 'MOD-02-INFERENCIAL', 'order', 2, 'required', true),
             jsonb_build_object('module_code', 'MOD-03-CRITICA', 'order', 3, 'required', true),
             jsonb_build_object('module_code', 'MOD-04-DIGITAL', 'order', 4, 'required', true),
             jsonb_build_object('module_code', 'MOD-05-CREATIVO', 'order', 5, 'required', true)
         )
     ),
     true,
     now());
```

---

## 7. `system_configuration/05-api_configuration.sql`

**Tabla:** `system_configuration.api_configuration`
**Impacto:** APIs externas sin configuración
**Registros:** 5-10 configuraciones de APIs

### Contenido Sugerido

```sql
-- =====================================================
-- SEED: API Configuration
-- Schema: system_configuration
-- Tabla: api_configuration
-- Prioridad: P1 - ALTA
-- =====================================================

TRUNCATE TABLE system_configuration.api_configuration RESTART IDENTITY CASCADE;

INSERT INTO system_configuration.api_configuration (
    api_name,
    api_endpoint,
    api_version,
    auth_config,
    rate_limit_config,
    is_active,
    created_at
) VALUES
    ('OpenAI', 'https://api.openai.com/v1',
     'v1',
     jsonb_build_object('type', 'bearer', 'env_var', 'OPENAI_API_KEY'),
     jsonb_build_object('requests_per_minute', 60, 'tokens_per_minute', 90000),
     true,
     now()),

    ('Storage compatible', 'https://storage.gamilit.com/storage/v1',
     'v1',
     jsonb_build_object('type', 'service_role', 'env_var', 'STORAGE_SERVICE_KEY'),
     jsonb_build_object('requests_per_second', 100),
     true,
     now()),

    ('SendGrid Email', 'https://api.sendgrid.com/v3',
     'v3',
     jsonb_build_object('type', 'api_key', 'env_var', 'SENDGRID_API_KEY'),
     jsonb_build_object('emails_per_day', 100),
     true,
     now());
```

---

## 8. `system_configuration/06-environment_config.sql`

**Tabla:** `system_configuration.environment_config`
**Impacto:** Configuración por ambiente faltante
**Registros:** 15-20 configuraciones (DEV/STAGING/PROD)

### Contenido Sugerido

```sql
-- =====================================================
-- SEED: Environment Configuration
-- Schema: system_configuration
-- Tabla: environment_config
-- Prioridad: P1 - ALTA
-- =====================================================

TRUNCATE TABLE system_configuration.environment_config RESTART IDENTITY CASCADE;

-- DEV Environment
INSERT INTO system_configuration.environment_config (
    environment,
    config_key,
    config_value,
    config_type,
    is_sensitive,
    created_at
) VALUES
    ('development', 'debug_mode', 'true', 'boolean', false, now()),
    ('development', 'log_level', 'debug', 'string', false, now()),
    ('development', 'api_timeout_ms', '30000', 'number', false, now()),
    ('development', 'enable_mock_data', 'true', 'boolean', false, now()),
    ('development', 'cors_origins', '["http://localhost:3000", "http://localhost:5173"]', 'json', false, now());

-- STAGING Environment
INSERT INTO system_configuration.environment_config (
    environment,
    config_key,
    config_value,
    config_type,
    is_sensitive,
    created_at
) VALUES
    ('staging', 'debug_mode', 'false', 'boolean', false, now()),
    ('staging', 'log_level', 'info', 'string', false, now()),
    ('staging', 'api_timeout_ms', '15000', 'number', false, now()),
    ('staging', 'enable_mock_data', 'false', 'boolean', false, now()),
    ('staging', 'cors_origins', '["https://staging.gamilit.com"]', 'json', false, now());

-- PRODUCTION Environment
INSERT INTO system_configuration.environment_config (
    environment,
    config_key,
    config_value,
    config_type,
    is_sensitive,
    created_at
) VALUES
    ('production', 'debug_mode', 'false', 'boolean', false, now()),
    ('production', 'log_level', 'warn', 'string', false, now()),
    ('production', 'api_timeout_ms', '10000', 'number', false, now()),
    ('production', 'enable_mock_data', 'false', 'boolean', false, now()),
    ('production', 'cors_origins', '["https://app.gamilit.com"]', 'json', false, now());
```

---

## ORDEN DE EJECUCIÓN FASE 2

**Ejecutar después de completar seeds P0:**

1. `system_configuration/05-api_configuration.sql`
2. `system_configuration/06-environment_config.sql`
3. `auth_management/08-user_preferences_defaults.sql`
4. `content_management/03-content_categories.sql`
5. `content_management/04-moderation_rules.sql`
6. `educational_content/13-content_tags.sql`
7. `educational_content/14-media_resources.sql`
8. `progress_tracking/02-learning_paths.sql`

---

## CRITERIOS DE ACEPTACIÓN

### Para cada seed P1:

✅ Archivo SQL creado en ruta correcta
✅ TRUNCATE con CASCADE para idempotencia
✅ Al menos N registros insertados (según tabla)
✅ Valores JSONB correctamente formateados
✅ Comentarios descriptivos
✅ Query de verificación incluida
✅ Probado en DEV sin errores
✅ Documentado en SEEDS_INVENTORY.yml

### Validación General:

```sql
-- Verificar todos los seeds P1
SELECT 'user_preferences' as seed, COUNT(*) FROM auth_management.user_preferences
UNION ALL
SELECT 'content_categories', COUNT(*) FROM content_management.content_categories
UNION ALL
SELECT 'moderation_rules', COUNT(*) FROM content_management.moderation_rules
UNION ALL
SELECT 'content_tags', COUNT(*) FROM educational_content.content_tags
UNION ALL
SELECT 'media_resources', COUNT(*) FROM educational_content.media_resources
UNION ALL
SELECT 'learning_paths', COUNT(*) FROM progress_tracking.learning_paths
UNION ALL
SELECT 'api_configuration', COUNT(*) FROM system_configuration.api_configuration
UNION ALL
SELECT 'environment_config', COUNT(*) FROM system_configuration.environment_config;
```

**Resultado Esperado:**
- user_preferences: 5-10
- content_categories: 8-12
- moderation_rules: 10-15
- content_tags: 30-50
- media_resources: 15-25
- learning_paths: 5-8
- api_configuration: 5-10
- environment_config: 15-20

---

## IMPACTO EN FUNCIONALIDADES

### Con Seeds P1 Implementados:

✅ **Sistema de Preferencias:** Usuarios tienen defaults coherentes
✅ **Categorización:** Contenido organizado y filtrable
✅ **Moderación:** Contenido inapropiado detectado automáticamente
✅ **Etiquetado:** Búsqueda y discovery mejorados
✅ **Multimedia:** Contenido enriquecido visualmente
✅ **Rutas de Aprendizaje:** Progresión guiada para estudiantes
✅ **APIs Configuradas:** Integraciones funcionando correctamente
✅ **Multi-ambiente:** Configuraciones específicas DEV/STAGING/PROD

---

## ESTIMACIÓN

**Tiempo estimado:** 5-7 días (Semana 2-3)
**Complejidad:** Media
**Dependencias:** Seeds P0 completados
**Riesgo:** Bajo

---

**Próximos Pasos:**
1. Completar seeds P0 (Fase 1)
2. Implementar seeds P1 según orden de ejecución
3. Validar en DEV
4. Migrar a STAGING
5. Actualizar SEEDS_INVENTORY.yml

**Fecha Estimada:** 2025-12-21 a 2025-12-30
