# ET-WL-003: Asset Management (Logo, Favicon, Images)

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-WL-003 |
| **Modulo** | White Label |
| **Titulo** | Gestion de Assets por Tenant (Logo, Favicon, Imagenes) |
| **Prioridad** | Alta |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 35% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 35%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| Tenant Entity (logo_url field) | COMPLETO | 100% |
| DDL tenants table | COMPLETO | 100% |
| MediaStorageService (base) | COMPLETO | 100% |
| StorageService (base) | COMPLETO | 100% |
| BrandingAssetService | NO INICIADO | 0% |
| Logo Upload Endpoint | NO INICIADO | 0% |
| Favicon Upload Endpoint | NO INICIADO | 0% |
| Image Processing (resize/optimize) | NO INICIADO | 0% |
| Frontend Logo Display | PARCIAL | 30% |
| Frontend Favicon Dynamic | NO INICIADO | 0% |
| Admin UI Asset Uploader | NO INICIADO | 0% |

---

## Referencias

### Requerimiento Funcional
- RF-WL-001: Branding personalizado

### User Stories
- [US-WL-002: Logo and Colors Upload](../historias-usuario/US-WL-002-logo-colors.md)

### Especificaciones Relacionadas
- [ET-WL-001: Theming System](./ET-WL-001-theming.md)
- [ET-WL-002: Tenant Customization](./ET-WL-002-tenant-customization.md)

---

## Descripcion Funcional

Sistema de gestion de assets visuales por tenant, incluyendo:

1. **Logo Principal** - Aparece en navbar, login page, emails
2. **Favicon** - Icono en tab del navegador
3. **Login Background** (Tier 2) - Imagen de fondo en login page
4. **Email Header** (Tier 2) - Logo para email templates

### Formatos Soportados

| Asset | Formatos | Dimensiones | Tamano Max |
|-------|----------|-------------|------------|
| Logo | PNG, JPG, SVG | 200x60 (recomendado) | 2MB |
| Favicon | ICO, PNG | 32x32, 48x48 | 100KB |
| Login BG | PNG, JPG | 1920x1080 | 5MB |
| Email Header | PNG | 600x100 | 500KB |

---

## Arquitectura

### Diagrama de Flujo de Upload

```
Admin selecciona imagen
        |
        v
Frontend: FileUploader component
  - Validacion cliente (formato, tamano)
  - Preview
  - Crop/resize tool
        |
        v
POST /api/v1/branding/:tenantId/logo
        |
        v
Backend: BrandingAssetService
  - Validar MIME type
  - Validar tamano
  - Procesar imagen (resize, optimize)
  - Generar versiones (original, thumbnail)
        |
        v
StorageService
  - Guardar en /uploads/branding/{tenantId}/
  - O subir a S3/Cloudinary (produccion)
        |
        v
Actualizar tenant.logo_url en BD
        |
        v
Response: { logoUrl: "https://..." }
        |
        v
Frontend: BrandingProvider actualiza estado
        |
        v
UI muestra nuevo logo
```

### Estructura de Almacenamiento

```
uploads/
├── branding/
│   ├── {tenant-uuid-1}/
│   │   ├── logo-original.png
│   │   ├── logo-200x60.png (thumbnail)
│   │   ├── logo-100x30.png (small)
│   │   └── favicon.ico
│   └── {tenant-uuid-2}/
│       ├── logo-original.svg
│       └── favicon.png
```

---

## Implementacion Existente

### Tenant Entity - logo_url Field

**Ubicacion:** `apps/backend/src/modules/auth/entities/tenant.entity.ts`

```typescript
/**
 * URL del logo del tenant (opcional)
 * @example "https://cdn.gamilit.com/logos/unam.png"
 */
@Column({ type: 'text', nullable: true })
  logo_url!: string | null;
```

**Estado:** COMPLETO (100%)

### MediaStorageService (Base)

**Ubicacion:** `apps/backend/src/modules/educational/services/media-storage.service.ts`

**Estado:** COMPLETO (100%) - Reutilizable para branding

**Capacidades existentes:**
- Upload de archivos con validacion MIME
- Validacion de tamano por tipo
- Almacenamiento local con estructura de directorios
- Generacion de nombres unicos
- CRUD de attachments

**Adaptaciones necesarias:**
- Nueva ruta base: `uploads/branding/` (vs `uploads/exercises/`)
- Nuevos tipos: logo, favicon
- Procesamiento de imagen (resize)

### StorageService (Teacher Reports)

**Ubicacion:** `apps/backend/src/modules/teacher/services/storage.service.ts`

**Estado:** COMPLETO (100%) - Alternativa reutilizable

**Capacidades:**
- Sanitizacion de nombres
- Almacenamiento local
- Manejo de subdirectorios

---

## Lo que Falta para Completar (65%)

### 1. BrandingAssetService (25% de lo faltante)

```typescript
// services/branding-asset.service.ts (NUEVO)
@Injectable()
export class BrandingAssetService {
  private readonly baseUploadPath = 'uploads/branding';

  // Configuracion por tipo de asset
  private readonly assetConfig = {
    logo: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedMimes: ['image/png', 'image/jpeg', 'image/svg+xml'],
      dimensions: { width: 200, height: 60 },
      generateThumbnail: true,
    },
    favicon: {
      maxSize: 100 * 1024, // 100KB
      allowedMimes: ['image/x-icon', 'image/png'],
      dimensions: { width: 32, height: 32 },
      generateThumbnail: false,
    },
  };

  /**
   * Sube y procesa logo de tenant
   */
  async uploadLogo(
    tenantId: string,
    file: Express.Multer.File
  ): Promise<{ logoUrl: string; thumbnailUrl: string }>;

  /**
   * Sube y procesa favicon de tenant
   */
  async uploadFavicon(
    tenantId: string,
    file: Express.Multer.File
  ): Promise<{ faviconUrl: string }>;

  /**
   * Elimina assets anteriores de un tenant
   */
  async deleteAsset(
    tenantId: string,
    assetType: 'logo' | 'favicon'
  ): Promise<void>;

  /**
   * Procesa imagen: resize, optimize, convert
   */
  private async processImage(
    buffer: Buffer,
    config: AssetConfig
  ): Promise<{ original: Buffer; thumbnail?: Buffer }>;

  /**
   * Genera URL publica para asset
   */
  private generateAssetUrl(tenantId: string, filename: string): string;
}
```

### 2. Endpoints de Upload (20% de lo faltante)

```typescript
// En BrandingController (existente o nuevo)

/**
 * POST /api/v1/branding/:tenantId/logo
 * Sube logo de tenant
 */
@Post(':tenantId/logo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@UseInterceptors(FileInterceptor('logo', {
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: logoFileFilter,
}))
@ApiConsumes('multipart/form-data')
async uploadLogo(
  @Param('tenantId') tenantId: string,
  @UploadedFile() file: Express.Multer.File
): Promise<{ logoUrl: string }>;

/**
 * POST /api/v1/branding/:tenantId/favicon
 * Sube favicon de tenant
 */
@Post(':tenantId/favicon')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@UseInterceptors(FileInterceptor('favicon', {
  limits: { fileSize: 100 * 1024 }, // 100KB
  fileFilter: faviconFileFilter,
}))
async uploadFavicon(
  @Param('tenantId') tenantId: string,
  @UploadedFile() file: Express.Multer.File
): Promise<{ faviconUrl: string }>;

/**
 * DELETE /api/v1/branding/:tenantId/logo
 * Elimina logo de tenant (reset a default)
 */
@Delete(':tenantId/logo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async deleteLogo(@Param('tenantId') tenantId: string): Promise<void>;
```

### 3. Image Processing Service (10% de lo faltante)

```typescript
// services/image-processing.service.ts (NUEVO)
import * as sharp from 'sharp';

@Injectable()
export class ImageProcessingService {
  /**
   * Redimensiona imagen manteniendo aspect ratio
   */
  async resize(
    buffer: Buffer,
    width: number,
    height: number
  ): Promise<Buffer>;

  /**
   * Optimiza imagen (compresion)
   */
  async optimize(
    buffer: Buffer,
    format: 'png' | 'jpeg' | 'webp'
  ): Promise<Buffer>;

  /**
   * Convierte PNG a ICO (para favicon)
   */
  async convertToIco(buffer: Buffer): Promise<Buffer>;

  /**
   * Genera multiples versiones de una imagen
   */
  async generateVersions(
    buffer: Buffer,
    sizes: Array<{ width: number; height: number; suffix: string }>
  ): Promise<Map<string, Buffer>>;
}
```

### 4. Frontend Components (10% de lo faltante)

```tsx
// components/admin/LogoUploader.tsx (NUEVO)
interface LogoUploaderProps {
  currentLogoUrl: string | null;
  onUploadSuccess: (url: string) => void;
  onUploadError: (error: string) => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogoUrl,
  onUploadSuccess,
  onUploadError
}) => {
  // Drag & drop zone
  // Preview de imagen actual
  // Validacion cliente
  // Progress bar
  // Crop tool (opcional)
  return (
    <div className="logo-uploader">
      <DropZone onDrop={handleDrop} accept={['image/png', 'image/jpeg', 'image/svg+xml']}>
        {currentLogoUrl ? (
          <img src={currentLogoUrl} alt="Current logo" className="current-logo" />
        ) : (
          <p>Arrastra tu logo aqui o haz clic para seleccionar</p>
        )}
      </DropZone>
      <p className="hint">PNG, JPG o SVG. Max 2MB. Recomendado: 200x60px</p>
    </div>
  );
};
```

```tsx
// components/admin/FaviconUploader.tsx (NUEVO)
interface FaviconUploaderProps {
  currentFaviconUrl: string | null;
  onUploadSuccess: (url: string) => void;
}

export const FaviconUploader: React.FC<FaviconUploaderProps>;
```

### 5. Dynamic Favicon en Frontend (5% de lo faltante)

```tsx
// hooks/useFavicon.ts (NUEVO)
export function useFavicon(faviconUrl: string | null) {
  useEffect(() => {
    if (faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
        || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [faviconUrl]);
}

// Uso en BrandingProvider
const BrandingProvider = ({ children }) => {
  const branding = useBranding();
  useFavicon(branding?.faviconUrl);
  // ...
};
```

---

## API REST Endpoints (A Implementar)

| Metodo | Ruta | Descripcion | Roles | Content-Type |
|--------|------|-------------|-------|--------------|
| POST | `/branding/:tenantId/logo` | Subir logo | ADMIN | multipart/form-data |
| POST | `/branding/:tenantId/favicon` | Subir favicon | ADMIN | multipart/form-data |
| DELETE | `/branding/:tenantId/logo` | Eliminar logo | ADMIN | - |
| DELETE | `/branding/:tenantId/favicon` | Eliminar favicon | ADMIN | - |
| GET | `/branding/:tenantId/assets` | Listar assets | PUBLIC | - |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Admin puede subir logo PNG, JPG o SVG
- [ ] Logo se redimensiona automaticamente a 200x60
- [ ] Se genera thumbnail de 100x30
- [ ] Admin puede subir favicon ICO o PNG
- [ ] Favicon de 32x32 se genera automaticamente
- [ ] Logo aparece en navbar en lugar de logo GAMILIT
- [ ] Favicon aparece en tab del navegador
- [ ] Preview de logo antes de confirmar upload
- [ ] Mensaje de error si formato no soportado
- [ ] Mensaje de error si excede tamano maximo

### No Funcionales
- [ ] Upload de logo < 3 segundos
- [ ] Imagenes optimizadas automaticamente (< 100KB final)
- [ ] URLs de assets servidas via CDN (produccion)
- [ ] Cache de assets: 1 mes
- [ ] Formatos modernos (WebP) para navegadores compatibles

### Seguridad
- [ ] Solo admin del tenant puede subir assets
- [ ] Validacion de MIME type en backend (no solo extension)
- [ ] Sanitizacion de nombres de archivo
- [ ] No path traversal en almacenamiento
- [ ] Tenant isolation: no ver assets de otro tenant

---

## Dependencias

### Bloqueado Por
- Tenant Entity (COMPLETO)
- MediaStorageService base (COMPLETO)
- BrandingController (EN PROCESO - ET-WL-001)

### Bloquea
- BrandingProvider frontend (parcialmente)
- Admin Branding Settings page
- Email templates con logo

### Dependencias Tecnicas
- sharp (npm) - Procesamiento de imagenes
- multer (npm) - File upload middleware (YA INSTALADO)

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| BrandingAssetService | 4h |
| ImageProcessingService | 3h |
| Logo/Favicon Endpoints | 2h |
| LogoUploader Component | 3h |
| FaviconUploader Component | 2h |
| Dynamic Favicon Hook | 1h |
| Tests | 2h |
| **Total** | **17h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-WL-003-asset-management.md*
*Generado: 2026-01-27*
