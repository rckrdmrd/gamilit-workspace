---
id: "ET-PERF-003"
title: "Personalizacion de Avatar - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P1"
epic: "EXT-004"
module: "avatar"
labels: ["avatar", "upload", "customization", "profile"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-PERF-004"]
related_us: ["US-PERF-001"]
---

# ET-PERF-003: Personalizacion de Avatar - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-PERF-003 |
| **Epic** | EXT-004 - Perfiles Extendidos |
| **RF Relacionado** | RF-PERF-004 (Avatar Customization) |
| **US Relacionadas** | US-PERF-001 |
| **Prioridad** | P1 - Alta |
| **Estado** | Implementado |

---

## Descripcion Tecnica

El sistema de personalizacion de avatar permite a los usuarios:

1. **Seleccionar Avatares Predefinidos**: Galeria de avatares tematicos
2. **Subir Avatar Personalizado**: Upload de imagen con validacion
3. **Visualizar Avatar**: Diferentes tamanos (xs, sm, md, lg, xl)
4. **Avatar en Sistema de Gamificacion**: Integracion con leaderboards, perfil y tienda

---

## Componentes Frontend

### Componentes Principales

| Componente | Path | Descripcion |
|------------|------|-------------|
| `Avatar` | `apps/frontend/src/shared/components/Avatar.tsx` | Componente base de avatar |
| `AvatarUpload` | `apps/frontend/src/shared/components/AvatarUpload.tsx` | Upload con preview y crop |

### Uso en Otros Componentes

| Componente | Path | Uso |
|------------|------|-----|
| `GamifiedHeader` | `apps/frontend/src/shared/components/layout/GamifiedHeader.tsx` | Avatar en header |
| `LeaderboardEntry` | `apps/frontend/src/features/gamification/social/components/Leaderboards/LeaderboardEntry.tsx` | Avatar en leaderboard |
| `UserPositionCard` | `apps/frontend/src/features/gamification/social/components/Leaderboards/UserPositionCard.tsx` | Avatar del usuario actual |
| `UserInventory` | `apps/frontend/src/features/gamification/economy/components/Inventory/UserInventory.tsx` | Avatar en inventario |
| `Sidebar` | `apps/frontend/src/shared/components/Sidebar.tsx` | Avatar en menu lateral |
| `Header` | `apps/frontend/src/shared/components/Header.tsx` | Avatar en header global |

### Tests

| Test | Path | Descripcion |
|------|------|-------------|
| `Avatar.test.tsx` | `apps/frontend/src/shared/components/__tests__/Avatar.test.tsx` | Tests del componente Avatar |
| `AvatarUpload.test.tsx` | `apps/frontend/src/shared/components/__tests__/AvatarUpload.test.tsx` | Tests de upload |

---

## Props del Componente Avatar

```typescript
interface AvatarProps {
  // URL de la imagen (puede ser URL o null)
  src?: string | null;

  // Texto alternativo para accesibilidad
  alt?: string;

  // Tamano del avatar
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // Nombre para mostrar iniciales si no hay imagen
  name?: string;

  // Clases CSS adicionales
  className?: string;

  // Mostrar indicador online
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}
```

### Tamanos de Avatar

| Size | Pixels | Uso Recomendado |
|------|--------|-----------------|
| `xs` | 24x24 | Listas compactas |
| `sm` | 32x32 | Items de menu, notificaciones |
| `md` | 40x40 | Leaderboards, cards |
| `lg` | 56x56 | Header, perfil resumido |
| `xl` | 80x80 | Perfil completo, modal |

---

## Props del Componente AvatarUpload

```typescript
interface AvatarUploadProps {
  // Avatar URL actual
  currentAvatar?: string | null;

  // Callback cuando se sube nuevo avatar
  onUpload: (file: File) => Promise<void>;

  // Callback cuando se elimina avatar
  onRemove?: () => Promise<void>;

  // Tamano del preview
  size?: 'md' | 'lg' | 'xl';

  // Mostrar boton de eliminar
  showRemoveButton?: boolean;

  // Estado de carga
  isLoading?: boolean;

  // Mensaje de error
  error?: string;
}
```

---

## Servicios Backend

### ProfileService

| Metodo | Descripcion |
|--------|-------------|
| `uploadAvatar(userId, avatarUrl)` | Actualiza URL del avatar en perfil |
| `getProfile(userId)` | Obtiene perfil con avatar_url |

### StorageService (si existe)

```typescript
class StorageService {
  // Subir archivo a storage
  async uploadFile(
    file: Buffer,
    filename: string,
    folder: string
  ): Promise<{ url: string; size: number }>;

  // Eliminar archivo
  async deleteFile(url: string): Promise<boolean>;

  // Generar URL firmada
  async getSignedUrl(url: string, expiresIn: number): Promise<string>;
}
```

---

## Tablas/Schemas de Base de Datos

### Schema: `auth_management`

| Tabla | Campos Relevantes |
|-------|-------------------|
| `profiles` | avatar_url (TEXT) |

### Campos de Avatar

| Campo | Tipo | Descripcion | Validaciones |
|-------|------|-------------|--------------|
| `avatar_url` | TEXT | URL del avatar | URL valida, nullable |

---

## APIs Endpoints

### Avatar

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/profile/:userId/avatar` | POST | Subir avatar |
| `/api/v1/profile/:userId/avatar` | DELETE | Eliminar avatar |
| `/api/v1/avatars/gallery` | GET | Listar avatares predefinidos |

### Request: POST /api/v1/profile/:userId/avatar

```
Content-Type: multipart/form-data

file: <binary data>
```

### Response: POST (exito)

```json
{
  "success": true,
  "avatar_url": "https://storage.example.com/avatars/user-123/avatar-1706345600.jpg",
  "message": "Avatar updated successfully"
}
```

### Response: GET /api/v1/avatars/gallery

```json
{
  "categories": [
    {
      "id": "animals",
      "name": "Animales",
      "avatars": [
        { "id": "cat-1", "url": "/avatars/animals/cat-1.png" },
        { "id": "dog-1", "url": "/avatars/animals/dog-1.png" }
      ]
    },
    {
      "id": "characters",
      "name": "Personajes",
      "avatars": [
        { "id": "detective-1", "url": "/avatars/characters/detective-1.png" }
      ]
    }
  ]
}
```

---

## Flujos de Usuario

### Flujo 1: Ver Avatar

```
1. Componente Avatar recibe prop src (avatar_url)
2. Si src existe: muestra imagen con fallback a placeholder
3. Si src no existe: muestra iniciales del nombre o icono default
4. Aplicar estilos segun size prop
```

### Flujo 2: Subir Avatar Personalizado

```
1. Usuario hace click en AvatarUpload
2. Selector de archivo se abre
3. Validacion cliente-side:
   - Tipo: image/jpeg, image/png
   - Tamano: max 2MB
4. Preview de imagen seleccionada
5. Usuario confirma o cancela
6. Upload a backend (multipart/form-data)
7. Backend valida y almacena
8. URL retornada se guarda en profiles.avatar_url
9. UI actualiza con nuevo avatar
```

### Flujo 3: Seleccionar Avatar de Galeria

```
1. Usuario abre galeria de avatares
2. Navega por categorias (animales, personajes, abstractos)
3. Selecciona avatar
4. Confirmacion de seleccion
5. URL del avatar predefinido se guarda en perfil
6. UI actualiza con nuevo avatar
```

### Flujo 4: Eliminar Avatar

```
1. Usuario hace click en "Eliminar avatar"
2. Confirmacion modal
3. DELETE /api/v1/profile/:userId/avatar
4. avatar_url se establece como null
5. Avatar vuelve a placeholder/iniciales
```

---

## Validaciones

### Validaciones Cliente (Frontend)

```typescript
const AVATAR_VALIDATIONS = {
  maxSizeBytes: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/png'],
  maxDimensions: { width: 2000, height: 2000 },
  minDimensions: { width: 100, height: 100 },
};

function validateAvatarFile(file: File): ValidationResult {
  if (!AVATAR_VALIDATIONS.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Solo se permiten imagenes JPG o PNG' };
  }
  if (file.size > AVATAR_VALIDATIONS.maxSizeBytes) {
    return { valid: false, error: 'La imagen no debe exceder 2MB' };
  }
  return { valid: true };
}
```

### Validaciones Servidor (Backend)

```typescript
// En ProfileController
@Post(':userId/avatar')
@UseInterceptors(FileInterceptor('file', {
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
      return cb(new BadRequestException('Only JPG/PNG allowed'), false);
    }
    cb(null, true);
  }
}))
async uploadAvatar(
  @Param('userId') userId: string,
  @UploadedFile() file: Express.Multer.File
) {
  // Process and store file
}
```

---

## Dependencias

### Dependencias de Modulos

- `ProfileModule` - Gestion de perfiles
- `StorageModule` - Almacenamiento de archivos (si existe)

### Dependencias Externas Frontend

- Ninguna adicional (uso de APIs nativas: FileReader, FormData)

### Dependencias Externas Backend

- `multer` - Manejo de multipart/form-data
- `sharp` - Procesamiento de imagenes (resize, optimize)

---

## Criterios de Aceptacion

### CA-01: Visualizacion de Avatar
- [x] Avatar visible en diferentes tamanos
- [x] Fallback a iniciales si no hay imagen
- [x] Fallback a icono default si no hay nombre
- [x] Bordes redondeados (circular)
- [x] Indicador online opcional

### CA-02: Upload de Avatar
- [x] Selector de archivo funcional
- [x] Validacion de tipo (JPG/PNG)
- [x] Validacion de tamano (max 2MB)
- [x] Preview antes de confirmar
- [x] Estado de carga visible
- [x] Manejo de errores con mensajes claros

### CA-03: Galeria de Avatares
- [x] Categorias de avatares predefinidos
- [x] Seleccion con click
- [x] Preview de seleccion
- [x] Confirmacion de cambio

### CA-04: Eliminacion de Avatar
- [x] Boton de eliminar visible
- [x] Confirmacion antes de eliminar
- [x] Reversion a avatar default

### CA-05: Integracion
- [x] Avatar visible en Header
- [x] Avatar visible en Sidebar
- [x] Avatar visible en Leaderboards
- [x] Avatar visible en Perfil
- [x] Sincronizacion inmediata en toda la app

### CA-06: Accesibilidad
- [x] Alt text en todas las imagenes
- [x] Navegacion por teclado
- [x] ARIA labels en controles
- [x] Contrast adecuado

---

## Notas de Implementacion

### Optimizacion de Imagenes

```typescript
// Procesamiento con Sharp (backend)
import sharp from 'sharp';

async function processAvatar(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(200, 200, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toBuffer();
}
```

### Caching de Avatares

```typescript
// Cache headers para avatares
res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 dia
res.setHeader('ETag', avatarHash);
```

### URL Generation

```typescript
// Generar URL unica para evitar cache stale
function generateAvatarUrl(userId: string): string {
  const timestamp = Date.now();
  return `${STORAGE_BASE_URL}/avatars/${userId}/avatar-${timestamp}.jpg`;
}
```

---

## Referencias

- US-PERF-001: Personalizacion de Perfil (CA-01)
- Profile Entity: `apps/backend/src/modules/auth/entities/profile.entity.ts`
- Avatar Component: `apps/frontend/src/shared/components/Avatar.tsx`

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
