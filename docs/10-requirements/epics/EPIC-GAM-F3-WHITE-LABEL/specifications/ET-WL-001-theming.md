# ET-WL-001: Theming System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-WL-001 |
| **Modulo** | White Label |
| **Titulo** | Sistema de Theming Dinamico por Tenant |
| **Prioridad** | Alta |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 55% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 55%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| Tenant Entity (base) | COMPLETO | 100% |
| TenantConfiguration Entity | COMPLETO | 100% |
| Theme Files (light/dark) | COMPLETO | 100% |
| Detective Theme CSS | COMPLETO | 100% |
| ThemeProvider Context | PARCIAL | 60% |
| Branding API Endpoints | NO INICIADO | 0% |
| Logo/Favicon Upload | NO INICIADO | 0% |
| Admin UI para Theming | NO INICIADO | 0% |
| CSS Variables Dinamicas | PARCIAL | 40% |

---

## Referencias

### Requerimiento Funcional
- RF-WL-001: Sistema de Theming por Tenant

### User Stories
- [US-WL-001: Branding Configuration](../user-stories/US-WL-001/US-WL-001-branding-config.md)
- [US-WL-002: Logo and Colors Upload](../user-stories/US-WL-002/US-WL-002-logo-colors.md)

---

## Descripcion Funcional

El sistema de theming permite a cada tenant (organizacion) personalizar la apariencia visual de GAMILIT con sus propios colores, logos y branding, manteniendo la funcionalidad base de la plataforma.

### Tier 1 (Basico) - Esta Especificacion
- Logo de la organizacion
- Colores primarios y secundarios
- Nombre de la plataforma
- Favicon personalizado

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - ThemeProvider (Context)                               |
|  - theme-light.ts / theme-dark.ts                        |
|  - detective-theme.css                                    |
|  - (FALTANTE) BrandingProvider                           |
|  - (FALTANTE) DynamicStyles                              |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - (FALTANTE) BrandingController                         |
|  - (FALTANTE) BrandingService                            |
|  - TenantConfiguration Entity                            |
|  - Tenant Entity                                          |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - auth_management.tenants                               |
|  - system_configuration.tenant_configurations            |
+----------------------------------------------------------+
```

### Flujo de Carga de Theme

```
Usuario accede a GAMILIT
        |
        v
App.tsx carga ThemeProvider
        |
        v
(FALTANTE) Obtener tenant_id del usuario
        |
        v
(FALTANTE) GET /api/v1/branding/:tenantId
        |
        v
(FALTANTE) BrandingProvider aplica:
  - CSS Variables (--primary-color, etc.)
  - Logo URL en header
  - Favicon
  - document.title
        |
        v
UI renderizada con branding personalizado
```

---

## Implementacion Existente

### Tenant Entity

**Ubicacion:** `apps/backend/src/modules/auth/entities/tenant.entity.ts`

**Estado:** COMPLETO (100%)

**Campos Relevantes para Theming:**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Nombre del tenant |
| slug | TEXT | URL-friendly identifier |
| domain | TEXT | Dominio personalizado (null) |
| logo_url | TEXT | URL del logo (null) |
| settings | JSONB | Configuraciones incluyendo theme |

**Settings JSONB Default:**
```json
{
  "theme": "detective",
  "features": {
    "analytics_enabled": true,
    "gamification_enabled": true,
    "social_features_enabled": true
  },
  "language": "es",
  "timezone": "America/Mexico_City"
}
```

### TenantConfiguration Entity

**Ubicacion:** `apps/backend/src/modules/admin/entities/tenant-configuration.entity.ts`

**Estado:** COMPLETO (100%)

**Campos:**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | FK a tenants |
| config_key | VARCHAR(100) | Clave de configuracion |
| config_value | JSONB | Valor de configuracion |
| config_type | VARCHAR(50) | branding/features/limits/etc |
| is_overridable | BOOLEAN | Si puede ser sobrescrito |

**Tipos de Configuracion:**
- branding
- features
- limits
- permissions
- integrations
- other

### Theme Files Frontend

**Ubicaciones:**
- `apps/frontend/src/shared/themes/theme-light.ts`
- `apps/frontend/src/shared/themes/theme-dark.ts`
- `apps/frontend/src/shared/styles/detective-theme.css`

**Estado:** COMPLETO (100%)

**theme-light.ts (ejemplo):**
```typescript
export const lightTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
  },
  // ... mas propiedades
};
```

---

## Lo que Falta para Completar (45%)

### 1. BrandingController (15% de lo faltante)

```typescript
// controllers/branding.controller.ts (NUEVO)
@Controller('branding')
export class BrandingController {

  /**
   * Obtiene branding publico de un tenant
   * GET /api/v1/branding/:tenantId
   */
  @Get(':tenantId')
  @Public()
  async getPublicBranding(@Param('tenantId') tenantId: string): Promise<PublicBrandingDto>;

  /**
   * Obtiene branding por dominio
   * GET /api/v1/branding/domain/:domain
   */
  @Get('domain/:domain')
  @Public()
  async getBrandingByDomain(@Param('domain') domain: string): Promise<PublicBrandingDto>;

  /**
   * Actualiza branding (admin)
   * PATCH /api/v1/branding/:tenantId
   */
  @Patch(':tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async updateBranding(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateBrandingDto
  ): Promise<BrandingDto>;

  /**
   * Sube logo de tenant
   * POST /api/v1/branding/:tenantId/logo
   */
  @Post(':tenantId/logo')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @Param('tenantId') tenantId: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ logoUrl: string }>;

  /**
   * Sube favicon de tenant
   * POST /api/v1/branding/:tenantId/favicon
   */
  @Post(':tenantId/favicon')
  @UseInterceptors(FileInterceptor('favicon'))
  async uploadFavicon(
    @Param('tenantId') tenantId: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ faviconUrl: string }>;
}
```

### 2. BrandingService (15% de lo faltante)

```typescript
// services/branding.service.ts (NUEVO)
@Injectable()
export class BrandingService {

  /**
   * Obtiene configuracion de branding de un tenant
   */
  async getBranding(tenantId: string): Promise<BrandingConfig>;

  /**
   * Obtiene branding por dominio personalizado
   */
  async getBrandingByDomain(domain: string): Promise<BrandingConfig>;

  /**
   * Actualiza configuracion de branding
   */
  async updateBranding(tenantId: string, dto: UpdateBrandingDto): Promise<BrandingConfig>;

  /**
   * Sube y procesa logo (resize, optimizar)
   */
  async uploadLogo(tenantId: string, file: Buffer, mimetype: string): Promise<string>;

  /**
   * Sube y procesa favicon (convertir a ICO si necesario)
   */
  async uploadFavicon(tenantId: string, file: Buffer, mimetype: string): Promise<string>;

  /**
   * Valida colores hex
   */
  validateColor(color: string): boolean;

  /**
   * Genera CSS variables de un theme
   */
  generateCssVariables(branding: BrandingConfig): string;
}
```

### 3. BrandingProvider Frontend (10% de lo faltante)

```tsx
// providers/BrandingProvider.tsx (NUEVO)
interface BrandingContextValue {
  branding: BrandingConfig | null;
  isLoading: boolean;
  error: string | null;
  refreshBranding: () => Promise<void>;
}

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [branding, setBranding] = useState<BrandingConfig | null>(null);

  useEffect(() => {
    if (user?.tenantId) {
      loadBranding(user.tenantId);
    }
  }, [user?.tenantId]);

  useEffect(() => {
    if (branding) {
      applyBranding(branding);
    }
  }, [branding]);

  const applyBranding = (config: BrandingConfig) => {
    // CSS Variables
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);

    // Document title
    document.title = config.platformName || 'GAMILIT Platform';

    // Favicon
    if (config.faviconUrl) {
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (favicon) favicon.href = config.faviconUrl;
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, isLoading, error, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};
```

### 4. Admin UI para Theming (5% de lo faltante)

**Componentes Faltantes:**
| Componente | Descripcion |
|------------|-------------|
| BrandingSettingsPage | Pagina de configuracion de branding |
| ColorPicker | Selector de colores con preview |
| LogoUploader | Componente para subir logo |
| FaviconUploader | Componente para subir favicon |
| BrandingPreview | Preview en tiempo real |

---

## Modelo de Datos para Branding

### BrandingConfig Interface

```typescript
interface BrandingConfig {
  tenantId: string;
  platformName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;      // Hex color (e.g., '#3B82F6')
  secondaryColor: string;    // Hex color (e.g., '#10B981')
  accentColor?: string;      // Opcional
  backgroundColor?: string;  // Opcional
  surfaceColor?: string;     // Opcional
  textColor?: string;        // Opcional
  fontFamily?: string;       // Tier 2
  customCss?: string;        // Tier 3
}
```

### Almacenamiento en TenantConfiguration

```sql
-- Ejemplo de registro de branding
INSERT INTO system_configuration.tenant_configurations (
  tenant_id,
  config_key,
  config_value,
  config_type
) VALUES (
  'tenant-uuid-here',
  'branding',
  '{
    "platformName": "Portal Educativo UNAM",
    "primaryColor": "#002855",
    "secondaryColor": "#CFB991",
    "logoUrl": "https://cdn.gamilit.com/tenants/unam/logo.png",
    "faviconUrl": "https://cdn.gamilit.com/tenants/unam/favicon.ico"
  }',
  'branding'
);
```

---

## API REST Endpoints (A Implementar)

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/branding/:tenantId` | Obtener branding publico | PUBLIC |
| GET | `/api/v1/branding/domain/:domain` | Branding por dominio | PUBLIC |
| PATCH | `/api/v1/branding/:tenantId` | Actualizar branding | ADMIN |
| POST | `/api/v1/branding/:tenantId/logo` | Subir logo | ADMIN |
| POST | `/api/v1/branding/:tenantId/favicon` | Subir favicon | ADMIN |
| DELETE | `/api/v1/branding/:tenantId/logo` | Eliminar logo | ADMIN |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Logo del tenant aparece en header en lugar de logo GAMILIT
- [ ] Colores primarios y secundarios aplican en toda la UI
- [ ] Nombre de plataforma aparece en titulo de navegador
- [ ] Favicon personalizado visible en tab del navegador
- [ ] Admin puede cambiar colores con preview en tiempo real
- [ ] Cambios de branding aplican sin necesidad de logout

### No Funcionales
- [ ] Tiempo de carga de branding < 200ms
- [ ] Logo optimizado automaticamente (max 200KB)
- [ ] Soporta formatos PNG, JPG, SVG para logos
- [ ] CSS variables validas para todos los navegadores modernos

### Seguridad
- [ ] Solo admins pueden modificar branding de su tenant
- [ ] Validacion de tipos MIME para uploads
- [ ] Sanitizacion de URLs de logo
- [ ] Tenant isolation (no ver/modificar branding de otro tenant)

---

## Dependencias

### Bloqueado Por
- Tenant Entity (COMPLETO)
- TenantConfiguration Entity (COMPLETO)
- File upload service (S3/Cloudinary) (PARCIAL)

### Bloquea
- Tier 2 White Label (custom domain, emails)
- Enterprise onboarding
- Branding por escuela/grupo

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| BrandingController | 4h |
| BrandingService | 6h |
| BrandingProvider Frontend | 4h |
| Admin UI Components | 6h |
| File Upload Integration | 4h |
| Tests | 2h |
| **Total** | **26h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-WL-001-theming.md*
*Generado: 2026-01-27*
