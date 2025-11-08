# RF-CFG-001: Sistema de Configuración y Feature Flags

**ID:** RF-CFG-001
**Título:** Gestión Centralizada de Configuración del Sistema
**Módulo:** 08-auditoria-configuracion
**Tipo:** Requerimiento Funcional
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Descripción General

Este requerimiento funcional define el sistema de configuración centralizada y feature flags para la plataforma Gamilit, permitiendo modificar comportamiento del sistema sin redesplegar código. El sistema soporta configuración por ambiente, feature flags con targeting, y cambios en tiempo real.

El sistema permite:
- Configuración dinámica sin redeployment
- Feature flags con rollout gradual
- Configuración por ambiente (dev, staging, prod)
- Targeting por usuario/organización
- Auditoría de cambios de configuración
- Rollback inmediato

---

## 🎯 Objetivos

1. **Desacoplar configuración** del código fuente
2. **Habilitar feature flags** para lanzamientos graduales
3. **Facilitar A/B testing** y experimentación
4. **Reducir riesgo** en despliegues
5. **Agilizar desarrollo** con configuración dinámica

---

## ✅ Requerimientos Funcionales

### RF-CFG-001-01: Tipos de Configuración

**Descripción:** 3 categorías de configuración según su naturaleza.

#### 1. Configuración de Sistema (System Config)

**Definición:** Parámetros técnicos que afectan operación del sistema.

**Ejemplos:**
- Límites de rate limiting
- Timeouts de operaciones
- Tamaños máximos de archivos
- TTLs de cache
- Configuración de pools de conexiones

**Características:**
- Cambios requieren validación técnica
- Solo `super_admin` puede modificar
- Cambios auditados
- Puede requerir restart de servicios (algunos)

**Formato:**
```json
{
  "rate_limiting": {
    "login_attempts_per_minute": 5,
    "api_requests_per_minute": 100,
    "upload_requests_per_hour": 50
  },
  "timeouts": {
    "database_query_ms": 5000,
    "external_api_ms": 10000,
    "file_upload_ms": 300000
  },
  "limits": {
    "max_file_size_mb": 10,
    "max_batch_size": 100,
    "max_concurrent_jobs": 50
  }
}
```

#### 2. Feature Flags (Funcionalidades)

**Definición:** Interruptores para habilitar/deshabilitar funcionalidades.

**Casos de Uso:**
- Lanzamiento gradual de nuevas features
- Kill switch para features problemáticas
- A/B testing de variantes
- Acceso beta para usuarios seleccionados

**Características:**
- Cambios en tiempo real (sin restart)
- Targeting avanzado (% usuarios, lista específica, etc.)
- Rollback inmediato
- Métricas de uso por feature

**Formato:**
```json
{
  "feature_name": "new_gamification_system",
  "enabled": true,
  "rollout_percentage": 25,  // 25% de usuarios
  "target_users": ["user-123", "user-456"],  // Usuarios específicos
  "target_roles": ["admin_teacher"],  // Por rol
  "environments": ["staging", "production"],
  "created_by": "user-789",
  "created_at": "2025-11-07T10:00:00Z",
  "description": "New gamification system with Maya ranks"
}
```

#### 3. Configuración de Negocio (Business Config)

**Definición:** Parámetros que afectan reglas de negocio.

**Ejemplos:**
- Costos de comodines en ML Coins
- Umbrales de promoción de nivel
- Duración de sesiones
- Reglas de achievements

**Características:**
- Cambios en tiempo real
- `admin_teacher` y `super_admin` pueden modificar
- Cambios auditados
- Versionado (historial de cambios)

**Formato:**
```json
{
  "comodines": {
    "pista_cost": 10,
    "vision_lectora_cost": 15,
    "segunda_oportunidad_cost": 20
  },
  "niveles": {
    "promotion_threshold_success_rate": 80,
    "promotion_threshold_exercises": 30,
    "demotion_threshold_success_rate": 50
  },
  "sesion": {
    "inactivity_timeout_minutes": 30,
    "max_session_duration_hours": 8
  }
}
```

---

### RF-CFG-001-02: Feature Flags Avanzados

**Descripción:** Sistema completo de feature flags con targeting y rollout.

**Estados de un Feature Flag:**

```
┌─────────────┐
│  Disabled   │ Feature completamente deshabilitado
└──────┬──────┘
       │ Enable
       ▼
┌─────────────┐
│ Internal    │ Solo para equipo interno (testing)
└──────┬──────┘
       │ Start Rollout
       ▼
┌─────────────┐
│ Beta (10%)  │ Rollout gradual: 10% → 25% → 50% → 100%
└──────┬──────┘
       │ Increase Rollout
       ▼
┌─────────────┐
│ GA (100%)   │ General Availability (todos los usuarios)
└──────┬──────┘
       │ Stabilize
       ▼
┌─────────────┐
│  Permanent  │ Feature se vuelve permanente (remover flag del código)
└─────────────┘
```

**Tipos de Targeting:**

#### 1. Percentage Rollout
Habilitar para X% de usuarios aleatoriamente:

```json
{
  "feature": "new_ui_design",
  "enabled": true,
  "targeting": {
    "type": "percentage",
    "percentage": 25  // 25% de usuarios
  }
}
```

Implementación determinística (mismo usuario siempre ve misma versión):
```typescript
const isEnabled = (userId: string, percentage: number): boolean => {
  const hash = hashUserId(userId);  // Hash consistente
  return (hash % 100) < percentage;
};
```

#### 2. User List
Habilitar para usuarios específicos:

```json
{
  "feature": "admin_dashboard_v2",
  "enabled": true,
  "targeting": {
    "type": "user_list",
    "users": ["user-123", "user-456", "user-789"]
  }
}
```

#### 3. Role-Based
Habilitar para roles específicos:

```json
{
  "feature": "advanced_analytics",
  "enabled": true,
  "targeting": {
    "type": "role",
    "roles": ["admin_teacher", "super_admin"]
  }
}
```

#### 4. Organization-Based
Habilitar para organizaciones específicas:

```json
{
  "feature": "custom_branding",
  "enabled": true,
  "targeting": {
    "type": "organization",
    "organizations": ["org-abc", "org-xyz"]
  }
}
```

#### 5. Attribute-Based
Habilitar según atributos del usuario:

```json
{
  "feature": "mobile_app_redesign",
  "enabled": true,
  "targeting": {
    "type": "attributes",
    "conditions": [
      {
        "attribute": "device_type",
        "operator": "equals",
        "value": "mobile"
      },
      {
        "attribute": "app_version",
        "operator": "greater_than",
        "value": "2.0.0"
      }
    ]
  }
}
```

#### 6. Time-Based
Habilitar solo en ciertos períodos:

```json
{
  "feature": "holiday_theme",
  "enabled": true,
  "targeting": {
    "type": "schedule",
    "start_date": "2025-12-15T00:00:00Z",
    "end_date": "2026-01-07T23:59:59Z"
  }
}
```

---

### RF-CFG-001-03: Configuración por Ambiente

**Descripción:** Diferentes valores de configuración según ambiente.

**Ambientes:**

#### Development
```yaml
environment: development

database:
  host: localhost
  port: 5432
  pool_size: 5

cache:
  enabled: true
  ttl: 60  # 1 minuto (corto para testing)

logging:
  level: debug
  console: true
  file: false

features:
  all_features_enabled: true  # Todas las features habilitadas

external_apis:
  mock: true  # Usar mocks en lugar de APIs reales
```

#### Staging
```yaml
environment: staging

database:
  host: staging-db.gamilit.com
  port: 5432
  pool_size: 10

cache:
  enabled: true
  ttl: 300  # 5 minutos

logging:
  level: info
  console: true
  file: true
  external: datadog

features:
  inherit_from_production: true
  allow_overrides: true

external_apis:
  mock: false
  use_sandbox: true  # Usar sandboxes (ej: Stripe test mode)
```

#### Production
```yaml
environment: production

database:
  host: prod-db.gamilit.com
  port: 5432
  pool_size: 20
  ssl: true

cache:
  enabled: true
  ttl: 3600  # 1 hora

logging:
  level: info
  console: false
  file: true
  external: datadog

features:
  controlled_rollout: true  # Feature flags controlados

external_apis:
  mock: false
  use_sandbox: false
  monitoring: true
```

**Herencia de Configuración:**

```
Base Config
    ↓
Development Config (overrides base)
    ↓
Staging Config (overrides base)
    ↓
Production Config (overrides base)
```

---

### RF-CFG-001-04: Gestión de Configuración (UI)

**Descripción:** Interfaz administrativa para gestionar configuración.

**Vista Principal:**

```
┌──────────────────────────────────────────────────────┐
│ CONFIGURATION MANAGEMENT                             │
├──────────────────────────────────────────────────────┤
│ [System Config] [Feature Flags] [Business Config]   │
├──────────────────────────────────────────────────────┤
│                                                       │
│ FEATURE FLAGS (12 total)                            │
│                                                       │
│ 🟢 new_gamification_system                          │
│    Status: Enabled (25% rollout)                    │
│    Target: All users                                │
│    [Edit] [Metrics] [Disable]                       │
│                                                       │
│ 🟡 advanced_analytics                               │
│    Status: Beta (admin_teacher only)                │
│    Target: Roles: admin_teacher, super_admin        │
│    [Edit] [Increase Rollout] [Metrics]             │
│                                                       │
│ 🔴 experimental_ai_feature                          │
│    Status: Disabled                                  │
│    Target: Internal only                            │
│    [Enable] [Edit]                                   │
│                                                       │
│ [+ Create New Feature Flag]                         │
└──────────────────────────────────────────────────────┘
```

**Formulario de Edición:**

```
┌──────────────────────────────────────────────────────┐
│ Edit Feature Flag: new_gamification_system          │
├──────────────────────────────────────────────────────┤
│ Name: new_gamification_system                       │
│ Description: New gamification system with Maya ranks│
│                                                       │
│ Status: [x] Enabled  [ ] Disabled                   │
│                                                       │
│ Targeting:                                           │
│   Type: [Percentage Rollout ▼]                      │
│   Percentage: [25%] ============----------           │
│                                                       │
│ Environments:                                        │
│   [x] Development                                    │
│   [x] Staging                                        │
│   [x] Production                                     │
│                                                       │
│ Advanced:                                            │
│   Kill Switch: [ ] Enable (disable immediately)     │
│   Expiry: [Never ▼]                                 │
│                                                       │
│ [Save Changes] [Cancel]                             │
└──────────────────────────────────────────────────────┘
```

**Historial de Cambios:**

```
┌──────────────────────────────────────────────────────┐
│ CHANGE HISTORY: new_gamification_system             │
├──────────────────────────────────────────────────────┤
│ 2025-11-07 14:30 | @john_admin                      │
│   Increased rollout from 10% to 25%                 │
│   Reason: Metrics look good, scaling up             │
│                                                       │
│ 2025-11-06 09:15 | @jane_admin                      │
│   Enabled for 10% of users                          │
│   Reason: Starting beta rollout                     │
│                                                       │
│ 2025-11-05 16:45 | @john_admin                      │
│   Created feature flag                              │
│   Status: Disabled (internal testing)               │
└──────────────────────────────────────────────────────┘
```

---

### RF-CFG-001-05: Seguridad y Validación

**Descripción:** Controles de seguridad para cambios de configuración.

**Validación de Cambios:**

#### 1. Validación de Tipo
```typescript
const configSchema = {
  rate_limiting: {
    login_attempts_per_minute: {
      type: 'number',
      min: 1,
      max: 20,
      required: true
    }
  },
  timeouts: {
    database_query_ms: {
      type: 'number',
      min: 1000,
      max: 60000,
      required: true
    }
  }
};

// Validar antes de guardar
const isValid = validateConfig(newConfig, configSchema);
if (!isValid) {
  throw new Error('Invalid configuration');
}
```

#### 2. Dry Run (Simulación)
Antes de aplicar cambios en producción, simular:

```typescript
POST /api/admin/config/dry-run
{
  "config_key": "rate_limiting.login_attempts_per_minute",
  "new_value": 3,
  "environment": "production"
}

Response:
{
  "dry_run": true,
  "estimated_impact": {
    "users_affected": 15000,
    "services_to_restart": ["auth-service"],
    "rollback_available": true
  },
  "warnings": [
    "Reducing login attempts may frustrate legitimate users"
  ]
}
```

#### 3. Aprobación para Cambios Críticos
Cambios de alto impacto requieren aprobación:

```yaml
critical_configs:
  - rate_limiting.*
  - database.pool_size
  - cache.ttl

approval_process:
  requires: 2  # 2 admins deben aprobar
  timeout: 24h  # Expira si no se aprueba en 24h
  notify: devops_team
```

#### 4. Rollback Automático
Si métricas se degradan después de cambio, rollback automático:

```yaml
rollback_triggers:
  - metric: error_rate
    threshold: 5%  # Si error rate >5%, rollback
    window: 5m

  - metric: p95_latency
    threshold: 1000ms  # Si latencia >1s, rollback
    window: 5m

  - metric: database_connections
    threshold: 0  # Si DB desconectada, rollback
    window: 1m
```

---

### RF-CFG-001-06: Configuración como Código

**Descripción:** Gestionar configuración en Git junto con código.

**Estructura de Archivos:**

```
config/
├── base.yml              # Configuración base (común a todos)
├── development.yml       # Overrides para desarrollo
├── staging.yml           # Overrides para staging
├── production.yml        # Overrides para producción
│
├── features/             # Feature flags
│   ├── gamification.yml
│   ├── social.yml
│   └── experimental.yml
│
└── secrets/              # Secretos (NO en Git, en vault)
    ├── development.yml   # Encrypted
    ├── staging.yml
    └── production.yml
```

**Ejemplo: `config/base.yml`**

```yaml
app:
  name: Gamilit
  version: 1.2.3

database:
  pool_size: 10
  timeout_ms: 5000
  log_queries: false

cache:
  enabled: true
  ttl: 3600
  max_memory_mb: 512

rate_limiting:
  enabled: true
  login_attempts_per_minute: 5
  api_requests_per_minute: 100

logging:
  level: info
  format: json
  outputs:
    - console
    - file
```

**Ejemplo: `config/features/gamification.yml`**

```yaml
features:
  new_gamification_system:
    enabled: true
    description: "New gamification system with Maya ranks"
    rollout_percentage: 25
    environments:
      - staging
      - production

  achievement_celebrations:
    enabled: true
    description: "Animated celebrations when earning achievements"
    rollout_percentage: 100

  leaderboards_v2:
    enabled: false
    description: "Redesigned leaderboards with filters"
    target_roles:
      - admin_teacher
      - super_admin
```

**Workflow con Git:**

```bash
# 1. Desarrollador hace cambio en feature flag
git checkout -b feature/enable-new-gamification
vim config/features/gamification.yml
git commit -m "feat: Enable new gamification for 25% rollout"
git push

# 2. Pull Request con review
# 3. Merge a main

# 4. CI/CD aplica cambios automáticamente
# (Deploy pipeline lee config y actualiza en DB/runtime)
```

---

### RF-CFG-001-07: Métricas de Feature Flags

**Descripción:** Monitorear uso y performance de features.

**Métricas por Feature:**

```json
{
  "feature": "new_gamification_system",
  "period": "last_7_days",
  "metrics": {
    "total_checks": 125000,  // Cuántas veces se verificó el flag
    "enabled_checks": 31250,  // 25% (coincide con rollout)
    "unique_users_enabled": 1250,
    "unique_users_disabled": 3750,

    "engagement": {
      "enabled_group": {
        "avg_session_duration_minutes": 25,
        "avg_exercises_completed": 8,
        "return_rate_7d": 0.72
      },
      "disabled_group": {
        "avg_session_duration_minutes": 22,
        "avg_exercises_completed": 7,
        "return_rate_7d": 0.68
      },
      "improvement": "+4.5%"  // Grupo con feature es mejor
    },

    "errors": {
      "enabled_group": 12,  // Errores en grupo con feature
      "disabled_group": 8,
      "error_rate_increase": "+50%"  // ⚠️ Feature tiene más errores
    }
  }
}
```

**Dashboard de Feature:**

```
┌────────────────────────────────────────────────────┐
│ FEATURE: new_gamification_system                   │
├────────────────────────────────────────────────────┤
│ Status: 🟢 Enabled (25% rollout)                  │
│ Users: 1,250 enabled / 5,000 total                │
│                                                     │
│ ENGAGEMENT COMPARISON:                             │
│   Enabled Group:  ███████████ 25min avg session   │
│   Disabled Group: ██████████ 22min avg session    │
│   Improvement: +13.6% 📈                          │
│                                                     │
│ ERROR RATE:                                        │
│   Enabled Group:  0.96% ⚠️                        │
│   Disabled Group: 0.64%                           │
│   Increase: +50% (needs investigation)            │
│                                                     │
│ RECOMMENDATION:                                    │
│   Fix errors before increasing rollout            │
│   [View Error Logs] [Pause Rollout]              │
└────────────────────────────────────────────────────┘
```

---

## 🔒 Consideraciones de Seguridad

### Secretos
- API keys, passwords NO en configuración visible
- Usar vault (HashiCorp Vault, AWS Secrets Manager)
- Rotar secretos periódicamente
- Nunca loguear valores de secretos

### Control de Acceso
- Solo `super_admin` puede cambiar config de sistema
- `admin_teacher` puede cambiar config de negocio
- Feature flags auditados (quién, cuándo, por qué)

### Validación
- Validar tipos y rangos
- Dry run obligatorio para cambios críticos
- Rollback automático si métricas se degradan

---

## 🧪 Casos de Prueba

### Test 1: Feature Flag con Targeting

```typescript
test('Feature flag enabled for specific user', async () => {
  await featureFlagService.create({
    name: 'beta_feature',
    enabled: true,
    targeting: {
      type: 'user_list',
      users: ['user-123']
    }
  });

  // Usuario en lista: feature habilitado
  const enabled = await featureFlagService.isEnabled('beta_feature', 'user-123');
  expect(enabled).toBe(true);

  // Usuario no en lista: feature deshabilitado
  const disabled = await featureFlagService.isEnabled('beta_feature', 'user-456');
  expect(disabled).toBe(false);
});
```

### Test 2: Percentage Rollout Determinístico

```typescript
test('Percentage rollout is deterministic', async () => {
  await featureFlagService.create({
    name: 'new_feature',
    enabled: true,
    targeting: {
      type: 'percentage',
      percentage: 50
    }
  });

  const userId = 'user-123';

  // Verificar múltiples veces: siempre mismo resultado
  const check1 = await featureFlagService.isEnabled('new_feature', userId);
  const check2 = await featureFlagService.isEnabled('new_feature', userId);
  const check3 = await featureFlagService.isEnabled('new_feature', userId);

  expect(check1).toBe(check2);
  expect(check2).toBe(check3);
});
```

### Test 3: Rollback Automático en Errores

```typescript
test('Auto-rollback on high error rate', async () => {
  const configKey = 'rate_limiting.api_requests_per_minute';
  const originalValue = await configService.get(configKey);

  // Cambiar configuración
  await configService.set(configKey, 10); // Muy restrictivo

  // Simular incremento de errores
  await simulateHighErrorRate();

  // Esperar 1 minuto (ventana de observación)
  await sleep(60000);

  // Verificar rollback automático
  const currentValue = await configService.get(configKey);
  expect(currentValue).toBe(originalValue);

  // Verificar alerta enviada
  const alerts = await getAlertsSent();
  expect(alerts).toContainEqual({
    type: 'config_rollback',
    reason: 'High error rate detected'
  });
});
```

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Tablas:**
- `system_configuration.config_entries` - Configuración del sistema
- `system_configuration.feature_flags` - Feature flags
- `system_configuration.config_history` - Historial de cambios

### Documentos Relacionados

- [RF-AUD-002: Alertas y Notificaciones](./RF-AUD-002-alertas-notificaciones.md)
- [RF-AUD-003: Niveles de Logging](./RF-AUD-003-niveles-logging.md)

---

## 📝 Notas de Implementación

### Herramientas Recomendadas

**Feature Flags:**
- **LaunchDarkly** - SaaS completo (recomendado si presupuesto lo permite)
- **Unleash** - Open source self-hosted
- **ConfigCat** - SaaS económico
- **Custom** - Implementación propia (más control, más mantenimiento)

**Configuration Management:**
- **dotenv** - Variables de entorno simples
- **node-config** - Configuración por ambiente
- **Vault** - Gestión de secretos

---

**Última revisión:** 2025-11-07
**Revisores:** DevOps Team, Backend Team
**Próxima revisión:** 2026-01-07
