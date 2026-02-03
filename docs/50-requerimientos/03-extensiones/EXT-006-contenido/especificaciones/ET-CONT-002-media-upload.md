---
id: "ET-CONT-002"
title: "Media Upload - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P1"
epic: "EXT-006"
module: "media"
labels: ["media", "upload", "images", "videos", "storage", "processing"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-CONT-002"]
related_us: ["US-CONT-001"]
---

# ET-CONT-002: Media Upload - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-CONT-002 |
| **Epic** | EXT-006 - Gestion de Contenido |
| **RF Relacionado** | RF-CONT-002 (Media Upload) |
| **US Relacionadas** | US-CONT-001 |
| **Prioridad** | P1 - Alta |
| **Estado** | Implementado |

---

## Descripcion Tecnica

El sistema de gestion de recursos multimedia permite subir, procesar y organizar archivos de diferentes tipos:

1. **Imagenes**: JPG, PNG, GIF, WebP
2. **Videos**: MP4, WebM
3. **Audios**: MP3, WAV, OGG
4. **Documentos**: PDF

Incluye pipeline de procesamiento con estados (uploading, processing, ready, error).

---

## Componentes Frontend

### Componentes de Upload

| Componente | Path | Descripcion |
|------------|------|-------------|
| `AvatarUpload` | `apps/frontend/src/shared/components/AvatarUpload.tsx` | Upload de avatares |
| `FileUploader` | `apps/frontend/src/shared/components/FileUploader.tsx` | Upload generico |

### Integracion en Editores

Los componentes de upload se integran en:
- Editor de contenido para imagenes/videos
- Perfil para avatares
- Ejercicios para recursos multimedia

---

## Servicios Backend

### Servicio Principal

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `MediaService` | `apps/backend/src/modules/educational/services/media.service.ts` | CRUD de recursos multimedia |

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `MediaController` | `apps/backend/src/modules/educational/controllers/media.controller.ts` | Endpoints de media |

### Metodos del MediaService

```typescript
@Injectable()
class MediaService {
  // Obtener todos los recursos
  async findAll(): Promise<MediaResource[]>;

  // Obtener por ID
  async findById(id: string): Promise<MediaResource | null>;

  // Crear recurso
  async create(mediaData: Partial<MediaResource>): Promise<MediaResource>;

  // Actualizar recurso
  async update(id: string, mediaData: Partial<MediaResource>): Promise<MediaResource>;

  // Eliminar recurso
  async delete(id: string): Promise<boolean>;

  // Actualizar estado de procesamiento
  async updateProcessingStatus(
    id: string,
    status: ProcessingStatusEnum,
    metadata?: Record<string, unknown>
  ): Promise<MediaResource>;

  // Obtener recursos activos
  async findActive(): Promise<MediaResource[]>;

  // Obtener por categoria
  async findByCategory(category: string): Promise<MediaResource[]>;

  // Obtener recursos publicos
  async findPublic(): Promise<MediaResource[]>;
}
```

### Entidades

| Entidad | Path | Descripcion |
|---------|------|-------------|
| `MediaResource` | `apps/backend/src/modules/educational/entities/media-resource.entity.ts` | Entidad de recurso multimedia |

---

## Estados de Procesamiento

### Enum de Estados

```typescript
enum ProcessingStatusEnum {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  OPTIMIZING = 'optimizing',
  READY = 'ready',
  ERROR = 'error',
}
```

### Transiciones Validas

```typescript
const validTransitions: Record<ProcessingStatusEnum, ProcessingStatusEnum[]> = {
  [ProcessingStatusEnum.UPLOADING]: [
    ProcessingStatusEnum.PROCESSING,
    ProcessingStatusEnum.ERROR,
  ],
  [ProcessingStatusEnum.PROCESSING]: [
    ProcessingStatusEnum.READY,
    ProcessingStatusEnum.OPTIMIZING,
    ProcessingStatusEnum.ERROR,
  ],
  [ProcessingStatusEnum.OPTIMIZING]: [
    ProcessingStatusEnum.READY,
    ProcessingStatusEnum.ERROR,
  ],
  [ProcessingStatusEnum.READY]: [
    ProcessingStatusEnum.OPTIMIZING,
    ProcessingStatusEnum.ERROR,
  ],
  [ProcessingStatusEnum.ERROR]: [
    ProcessingStatusEnum.UPLOADING,
    ProcessingStatusEnum.PROCESSING,
  ],
};
```

### Diagrama de Estados

```
                                 +--------+
                                 | ERROR  |
                                 +---+----+
                                     ^
                                     |
     +----------+    +-----------+   |   +------------+    +-------+
     | UPLOADING|--->| PROCESSING|---+-->| OPTIMIZING |--->| READY |
     +----------+    +-----------+       +------------+    +-------+
                           |                                   ^
                           +-----------------------------------+
```

---

## Tablas/Schemas de Base de Datos

### Schema: `educational_content`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `media_resources` | Recursos multimedia | id, url, type, processing_status |

### Campos de la Tabla `media_resources`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Nombre del recurso |
| `url` | TEXT | URL del archivo (requerido) |
| `type` | ENUM | Tipo: image, video, audio, document |
| `mime_type` | VARCHAR(100) | MIME type del archivo |
| `size_bytes` | BIGINT | Tamano en bytes |
| `width` | INTEGER | Ancho (imagenes/videos) |
| `height` | INTEGER | Alto (imagenes/videos) |
| `duration_seconds` | INTEGER | Duracion (videos/audios) |
| `category` | VARCHAR(100) | Categoria de organizacion |
| `processing_status` | ENUM | Estado de procesamiento |
| `metadata` | JSONB | Metadata adicional |
| `is_public` | BOOLEAN | Publicamente accesible |
| `is_active` | BOOLEAN | Activo/Inactivo |
| `created_at` | TIMESTAMP | Fecha de creacion |
| `updated_at` | TIMESTAMP | Fecha de actualizacion |

---

## APIs Endpoints

### Recursos Multimedia

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/media` | GET | Listar recursos |
| `/api/v1/media/:id` | GET | Obtener recurso |
| `/api/v1/media` | POST | Subir recurso |
| `/api/v1/media/:id` | PUT | Actualizar recurso |
| `/api/v1/media/:id` | DELETE | Eliminar recurso |
| `/api/v1/media/:id/status` | PATCH | Actualizar estado |
| `/api/v1/media/category/:category` | GET | Recursos por categoria |
| `/api/v1/media/public` | GET | Recursos publicos |
| `/api/v1/media/active` | GET | Recursos activos |

### Request: POST /api/v1/media (multipart/form-data)

```
Content-Type: multipart/form-data

file: <binary data>
name: "Imagen de ejemplo"
category: "exercises"
is_public: true
```

### Response: POST (exito)

```json
{
  "id": "uuid",
  "name": "Imagen de ejemplo",
  "url": "https://storage.example.com/media/uuid/image.jpg",
  "type": "image",
  "mime_type": "image/jpeg",
  "size_bytes": 245760,
  "width": 1920,
  "height": 1080,
  "processing_status": "uploading",
  "is_public": true,
  "is_active": true,
  "created_at": "2026-01-27T10:00:00Z"
}
```

### Response: GET /api/v1/media

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Imagen ejercicio 1",
      "url": "https://storage.example.com/media/uuid/image.jpg",
      "type": "image",
      "category": "exercises",
      "processing_status": "ready",
      "size_bytes": 245760,
      "created_at": "2026-01-27T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

### Request: PATCH /api/v1/media/:id/status

```json
{
  "status": "ready",
  "metadata": {
    "optimized_url": "https://cdn.example.com/optimized/image.webp",
    "thumbnail_url": "https://cdn.example.com/thumb/image.webp"
  }
}
```

---

## Flujos de Usuario

### Flujo 1: Upload de Imagen

```
1. Usuario selecciona archivo de imagen
2. Frontend valida:
   - Tipo: image/jpeg, image/png, image/gif, image/webp
   - Tamano: max 10MB
3. POST /api/v1/media (multipart/form-data)
4. Backend:
   a. Valida archivo
   b. Crea registro con status = 'uploading'
   c. Guarda archivo en storage
   d. Actualiza status = 'processing'
   e. Genera thumbnail (opcional)
   f. Optimiza imagen (opcional)
   g. Actualiza status = 'ready'
5. Frontend muestra progreso
6. Imagen disponible para uso
```

### Flujo 2: Upload de Video

```
1. Usuario selecciona archivo de video
2. Frontend valida:
   - Tipo: video/mp4, video/webm
   - Tamano: max 100MB
3. Upload con progreso (chunked si es grande)
4. Backend:
   a. Crea registro con status = 'uploading'
   b. Guarda archivo
   c. status = 'processing'
   d. Extrae metadata (duracion, resolucion)
   e. Genera thumbnail del primer frame
   f. Transcoding a formatos web (opcional)
   g. status = 'ready'
5. Video disponible para reproduccion
```

### Flujo 3: Actualizar Estado de Procesamiento

```
1. Proceso background completa procesamiento
2. PATCH /api/v1/media/:id/status
3. MediaService.updateProcessingStatus():
   a. Valida transicion de estado
   b. Actualiza status
   c. Guarda metadata adicional
4. Recurso disponible segun nuevo estado
```

### Flujo 4: Usar Media en Contenido

```
1. En editor de contenido, click "Insertar Imagen"
2. Modal de biblioteca de medios se abre
3. Filtrar por categoria, buscar
4. Seleccionar recurso existente o subir nuevo
5. Insertar URL en contenido
6. Preview con imagen cargada
```

---

## Validaciones

### Validaciones Frontend

```typescript
const MEDIA_VALIDATIONS = {
  image: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxDimensions: { width: 4096, height: 4096 },
  },
  video: {
    maxSizeBytes: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm'],
    maxDurationSeconds: 600, // 10 minutos
  },
  audio: {
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxDurationSeconds: 1800, // 30 minutos
  },
  document: {
    maxSizeBytes: 25 * 1024 * 1024, // 25MB
    allowedTypes: ['application/pdf'],
  },
};
```

### Validaciones Backend

```typescript
// Validar transicion de estado
private validateStatusTransition(
  currentStatus: ProcessingStatusEnum,
  newStatus: ProcessingStatusEnum
): void {
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new BadRequestException(
      `Invalid status transition from ${currentStatus} to ${newStatus}`
    );
  }
}

// Validar URL requerida
async create(mediaData: Partial<MediaResource>): Promise<MediaResource> {
  if (!mediaData.url) {
    throw new BadRequestException('URL is required for media resource');
  }
  return this.mediaRepo.save(this.mediaRepo.create(mediaData));
}
```

---

## Dependencias

### Dependencias de Modulos

- `EducationalModule` - Modulo educativo
- `StorageModule` - Almacenamiento de archivos (si existe)

### Dependencias Externas Backend

| Paquete | Uso |
|---------|-----|
| `multer` | Manejo de uploads multipart |
| `sharp` | Procesamiento de imagenes |
| `ffprobe` | Metadata de videos (opcional) |

---

## Criterios de Aceptacion

### CA-01: Upload de Imagenes
- [x] Soporte JPG, PNG, GIF, WebP
- [x] Validacion de tamano (max 10MB)
- [x] Preview de imagen
- [x] Progreso de upload
- [x] Manejo de errores

### CA-02: Upload de Videos
- [x] Soporte MP4, WebM
- [x] Validacion de tamano
- [x] Extraccion de metadata
- [x] Generacion de thumbnail (parcial)

### CA-03: Upload de Audios
- [x] Soporte MP3, WAV, OGG
- [x] Extraccion de duracion
- [x] Player de preview

### CA-04: Estados de Procesamiento
- [x] Maquina de estados implementada
- [x] Transiciones validadas
- [x] Metadata por estado
- [x] UI refleja estado actual

### CA-05: Biblioteca de Medios
- [x] Lista de recursos
- [x] Filtros por tipo, categoria
- [x] Busqueda
- [x] Vista de galeria

### CA-06: Integracion
- [x] Uso en editor de contenido
- [x] Uso en perfil (avatar)
- [x] Uso en ejercicios

---

## Notas de Implementacion

### Estructura de Storage

```
storage/
├── media/
│   ├── images/
│   │   └── {year}/{month}/{uuid}.{ext}
│   ├── videos/
│   │   └── {year}/{month}/{uuid}.{ext}
│   ├── audios/
│   │   └── {year}/{month}/{uuid}.{ext}
│   └── documents/
│       └── {year}/{month}/{uuid}.{ext}
├── thumbnails/
│   └── {media_id}_thumb.jpg
└── optimized/
    └── {media_id}_optimized.webp
```

### Procesamiento de Imagenes con Sharp

```typescript
import sharp from 'sharp';

async function processImage(buffer: Buffer, options: ImageOptions): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
}> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Resize si excede dimensiones maximas
  let processed = image;
  if (metadata.width > options.maxWidth || metadata.height > options.maxHeight) {
    processed = image.resize(options.maxWidth, options.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Optimizar
  const output = await processed
    .jpeg({ quality: 85 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
  };
}
```

### Generacion de Thumbnails

```typescript
async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(200, 200, { fit: 'cover' })
    .jpeg({ quality: 75 })
    .toBuffer();
}
```

---

## Referencias

- US-CONT-001: Editor WYSIWYG (CA-02: Insertar Multimedia)
- MediaService: `apps/backend/src/modules/educational/services/media.service.ts`
- MediaResource Entity: `apps/backend/src/modules/educational/entities/media-resource.entity.ts`

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
