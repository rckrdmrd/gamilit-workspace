---
titulo: "ET-WL-002: Tenant Customization"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-WL-002: Tenant Customization

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-WL-002 |
| **Modulo** | White Label |
| **Titulo** | Personalizacion Avanzada por Tenant |
| **Prioridad** | Media |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 45% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 45%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| Tenant Entity | COMPLETO | 100% |
| TenantConfiguration Entity | COMPLETO | 100% |
| Tenant Settings JSONB | COMPLETO | 100% |
| Feature Flags por Tenant | PARCIAL | 50% |
| Platform Name Customization | PARCIAL | 30% |
| Custom Domain Support | NO INICIADO | 0% |
| Login Page Customization | NO INICIADO | 0% |
| Email Templates por Tenant | NO INICIADO | 0% |

---

## Referencias

### Requerimiento Funcional
- RF-WL-002: Personalizacion de Tenant
- RF-WL-003: Platform Name Customization

### User Stories
- [US-WL-003: Platform Name Customization](../user-stories/US-WL-003/US-WL-003-platform-name.md)

---

## Descripcion Funcional

Tenant Customization permite a cada organizacion personalizar no solo la apariencia visual, sino tambien el comportamiento y las funcionalidades disponibles en su instancia de GAMILIT.

### Alcance

**Tier 1 (Basico) - Esta Especificacion:**
- Nombre de plataforma personalizado
- Configuracion de features habilitadas
- Limites de usuarios y almacenamiento
- Idioma y zona horaria por defecto

**Tier 2 (Avanzado) - Futuro:**
- Dominio personalizado
- Email templates personalizados
- Login page customization

---

## Arquitectura

### Diagrama de Datos

```
+----------------------------------------------------------+
|                    TENANT ENTITY                          |
|  auth_management.tenants                                  |
+----------------------------------------------------------+
|  id          | UUID     | Primary key                    |
|  name        | TEXT     | "Universidad Nacional"         |
|  slug        | TEXT     | "unam"                         |
|  domain      | TEXT     | (null por ahora)               |
|  logo_url    | TEXT     | URL del logo                   |
|  subscription_tier | TEXT | free/basic/pro/enterprise    |
|  max_users   | INT      | 100 (default)                  |
|  max_storage_gb | INT   | 5 (default)                    |
|  settings    | JSONB    | Ver detalle abajo              |
|  metadata    | JSONB    | Info adicional                 |
+----------------------------------------------------------+
                              |
                              | 1:N
                              v
+----------------------------------------------------------+
|              TENANT CONFIGURATION                         |
|  system_configuration.tenant_configurations               |
+----------------------------------------------------------+
|  id          | UUID     | Primary key                    |
|  tenant_id   | UUID     | FK a tenants                   |
|  config_key  | VARCHAR  | 'platform_name', 'features'... |
|  config_value| JSONB    | Valor de configuracion         |
|  config_type | VARCHAR  | branding/features/limits/etc   |
+----------------------------------------------------------+
```

### Settings JSONB Structure

```json
{
  "theme": "detective",
  "features": {
    "analytics_enabled": true,
    "gamification_enabled": true,
    "social_features_enabled": true,
    "peer_challenges_enabled": false,
    "lti_integration_enabled": false,
    "parent_portal_enabled": false
  },
  "language": "es",
  "timezone": "America/Mexico_City",
  "content": {
    "welcome_message": "Bienvenido al Portal Educativo",
    "support_email": "soporte@universidad.edu",
    "support_phone": "+52 55 1234 5678"
  },
  "privacy": {
    "data_retention_days": 365,
    "anonymous_analytics": true
  }
}
```

---

## Implementacion Existente

### Tenant Entity Settings

**Ubicacion:** `apps/backend/src/modules/auth/entities/tenant.entity.ts`

**Estado:** COMPLETO (100%)

**Default Settings:**
```typescript
@Column({
  type: 'jsonb',
  nullable: false,
  default: {
    theme: 'detective',
    features: {
      analytics_enabled: true,
      gamification_enabled: true,
      social_features_enabled: true,
    },
    language: 'es',
    timezone: 'America/Mexico_City',
  },
})
settings!: Record<string, unknown>;
```

### Subscription Tiers

**Ubicacion:** `apps/backend/src/shared/constants/enums.constants.ts`

**Estado:** COMPLETO (100%)

```typescript
export enum SubscriptionTierEnum {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}
```

### TenantConfiguration Entity

**Ubicacion:** `apps/backend/src/modules/admin/entities/tenant-configuration.entity.ts`

**Estado:** COMPLETO (100%)

**Tipos de Configuracion Soportados:**
- `branding` - Colores, logos, nombre
- `features` - Feature flags
- `limits` - Limites de uso
- `permissions` - Permisos especiales
- `integrations` - Configuracion de integraciones
- `other` - Miscelaneo

---

## Lo que Falta para Completar (55%)

### 1. TenantCustomizationService (20% de lo faltante)

```typescript
// services/tenant-customization.service.ts (NUEVO)
@Injectable()
export class TenantCustomizationService {

  /**
   * Obtiene todas las configuraciones de un tenant
   */
  async getFullConfiguration(tenantId: string): Promise<TenantFullConfig>;

  /**
   * Actualiza nombre de plataforma
   */
  async updatePlatformName(tenantId: string, name: string): Promise<void>;

  /**
   * Obtiene feature flags de un tenant
   */
  async getFeatureFlags(tenantId: string): Promise<FeatureFlags>;

  /**
   * Actualiza feature flags
   */
  async updateFeatureFlags(tenantId: string, flags: Partial<FeatureFlags>): Promise<FeatureFlags>;

  /**
   * Verifica si una feature esta habilitada para el tenant
   */
  async isFeatureEnabled(tenantId: string, feature: string): Promise<boolean>;

  /**
   * Obtiene limites del tenant
   */
  async getTenantLimits(tenantId: string): Promise<TenantLimits>;

  /**
   * Actualiza limites (solo super_admin)
   */
  async updateLimits(tenantId: string, limits: Partial<TenantLimits>): Promise<TenantLimits>;

  /**
   * Valida si el tenant puede usar una feature segun su tier
   */
  async validateTierAccess(tenantId: string, feature: string): Promise<boolean>;
}
```

### 2. TenantCustomizationController (15% de lo faltante)

```typescript
// controllers/tenant-customization.controller.ts (NUEVO)
@Controller('tenants/:tenantId/customization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantCustomizationController {

  /**
   * GET /tenants/:tenantId/customization
   * Obtiene configuracion completa del tenant
   */
  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getConfiguration(@Param('tenantId') tenantId: string): Promise<TenantFullConfigDto>;

  /**
   * PATCH /tenants/:tenantId/customization/platform-name
   * Actualiza nombre de plataforma
   */
  @Patch('platform-name')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async updatePlatformName(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdatePlatformNameDto
  ): Promise<{ platformName: string }>;

  /**
   * GET /tenants/:tenantId/customization/features
   * Obtiene feature flags
   */
  @Get('features')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getFeatures(@Param('tenantId') tenantId: string): Promise<FeatureFlagsDto>;

  /**
   * PATCH /tenants/:tenantId/customization/features
   * Actualiza feature flags
   */
  @Patch('features')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async updateFeatures(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateFeatureFlagsDto
  ): Promise<FeatureFlagsDto>;

  /**
   * GET /tenants/:tenantId/customization/limits
   * Obtiene limites del tenant
   */
  @Get('limits')
  async getLimits(@Param('tenantId') tenantId: string): Promise<TenantLimitsDto>;
}
```

### 3. Feature Flags Hook Frontend (10% de lo faltante)

```typescript
// hooks/useFeatureFlags.ts (NUEVO)
interface UseFeatureFlagsReturn {
  flags: FeatureFlags | null;
  isLoading: boolean;
  isFeatureEnabled: (feature: string) => boolean;
  refetch: () => Promise<void>;
}

export function useFeatureFlags(): UseFeatureFlagsReturn {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags | null>(null);

  useEffect(() => {
    if (user?.tenantId) {
      fetchFeatureFlags(user.tenantId);
    }
  }, [user?.tenantId]);

  const isFeatureEnabled = (feature: string): boolean => {
    if (!flags) return false;
    return flags[feature] ?? false;
  };

  return { flags, isLoading, isFeatureEnabled, refetch };
}
```

### 4. Admin UI para Customization (10% de lo faltante)

**Componentes Faltantes:**
| Componente | Descripcion |
|------------|-------------|
| TenantSettingsPage | Pagina principal de configuracion |
| PlatformNameEditor | Editor de nombre de plataforma |
| FeatureFlagsPanel | Panel de feature flags con toggles |
| LimitsUsageWidget | Widget de uso vs limites |
| TimezoneSelector | Selector de zona horaria |
| LanguageSelector | Selector de idioma |

---

## Feature Flags Disponibles

### Tier-Based Features

| Feature | Free | Basic | Pro | Enterprise |
|---------|------|-------|-----|------------|
| analytics_enabled | Basic | Full | Full | Full |
| gamification_enabled | Yes | Yes | Yes | Yes |
| social_features_enabled | No | Yes | Yes | Yes |
| peer_challenges_enabled | No | No | Yes | Yes |
| lti_integration_enabled | No | No | No | Yes |
| parent_portal_enabled | No | No | Yes | Yes |
| white_label_tier1 | No | No | Yes | Yes |
| white_label_tier2 | No | No | No | Yes |
| custom_domain | No | No | No | Yes |
| api_access | No | No | Limited | Full |

---

## DTOs

```typescript
// dto/tenant-customization.dto.ts (NUEVO)

export class TenantFullConfigDto {
  tenantId: string;
  name: string;
  slug: string;
  subscriptionTier: SubscriptionTierEnum;
  branding: BrandingConfigDto;
  features: FeatureFlagsDto;
  limits: TenantLimitsDto;
  settings: TenantSettingsDto;
}

export class UpdatePlatformNameDto {
  @IsString()
  @MaxLength(100)
  platformName: string;
}

export class FeatureFlagsDto {
  analytics_enabled: boolean;
  gamification_enabled: boolean;
  social_features_enabled: boolean;
  peer_challenges_enabled: boolean;
  lti_integration_enabled: boolean;
  parent_portal_enabled: boolean;
}

export class UpdateFeatureFlagsDto {
  @IsOptional()
  @IsBoolean()
  analytics_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  gamification_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  social_features_enabled?: boolean;

  // ... otros flags
}

export class TenantLimitsDto {
  maxUsers: number;
  currentUsers: number;
  maxStorageGb: number;
  currentStorageGb: number;
  maxClassrooms: number;
  currentClassrooms: number;
}

export class TenantSettingsDto {
  language: string;
  timezone: string;
  welcomeMessage?: string;
  supportEmail?: string;
  supportPhone?: string;
}
```

---

## API REST Endpoints (A Implementar)

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| GET | `/tenants/:id/customization` | Config completa | ADMIN |
| PATCH | `/tenants/:id/customization/platform-name` | Actualizar nombre | ADMIN |
| GET | `/tenants/:id/customization/features` | Feature flags | ADMIN |
| PATCH | `/tenants/:id/customization/features` | Actualizar flags | ADMIN |
| GET | `/tenants/:id/customization/limits` | Ver limites | ADMIN |
| PATCH | `/tenants/:id/customization/limits` | Actualizar limites | SUPER_ADMIN |
| GET | `/tenants/:id/customization/settings` | Settings generales | ADMIN |
| PATCH | `/tenants/:id/customization/settings` | Actualizar settings | ADMIN |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Admin puede cambiar nombre de plataforma y se refleja en toda la UI
- [ ] Feature flags controlan visibilidad de modulos
- [ ] Limites se validan antes de crear usuarios/classrooms
- [ ] Cambio de idioma aplica a toda la interfaz
- [ ] Zona horaria afecta horarios mostrados
- [ ] Tier controla features disponibles

### No Funcionales
- [ ] Feature check < 50ms (cacheado)
- [ ] Settings cargados al inicio de sesion
- [ ] Cambios aplican sin logout

### Seguridad
- [ ] Solo admins del tenant pueden modificar
- [ ] Super_admin puede modificar limites de cualquier tenant
- [ ] Validacion de tier antes de habilitar features premium

---

## Dependencias

### Bloqueado Por
- Tenant Entity (COMPLETO)
- TenantConfiguration Entity (COMPLETO)
- Auth Module (COMPLETO)

### Bloquea
- Tier 2 White Label
- Billing/Subscription system
- Multi-tenant analytics

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| TenantCustomizationService | 6h |
| TenantCustomizationController | 4h |
| Feature Flags Hook | 2h |
| Admin UI Components | 8h |
| Tests | 2h |
| **Total** | **22h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-WL-002-tenant-customization.md*
*Generado: 2026-01-27*
