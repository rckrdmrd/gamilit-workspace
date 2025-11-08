
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: ET-CNT-001 -->
<!-- ID Nuevo: M-CNT-ET-001 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-CNT-ET-001: Gestión de Media - Especificación Técnica

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-CNT-001 |
| **Módulo** | 07 - Contenido y Media |
| **Título** | Sistema de Gestión de Media - Implementación |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha** | 2025-11-07 |

---

## 🔗 Referencias

📘 **Implementa:** [RF-CNT-001](../../01-requerimientos/07-contenido-media/RF-CNT-001-gestion-media.md)

---

## 🗄️ Base de Datos

### Tabla: media_files

```sql
CREATE TABLE content_management.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Metadatos básicos
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    media_type content_management.media_type NOT NULL,
    mime_type VARCHAR(100) NOT NULL,

    -- Almacenamiento
    storage_path TEXT NOT NULL,
    storage_bucket VARCHAR(100) DEFAULT 'gamilit-media',
    size_bytes BIGINT NOT NULL,

    -- Estado
    status content_management.media_status DEFAULT 'uploading',

    -- Procesamiento
    processed_versions JSONB, -- {thumbnail, compressed, transcoded}
    processing_error TEXT,

    -- Ownership
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),

    -- Acceso
    access_level VARCHAR(20) DEFAULT 'authenticated', -- public, authenticated, restricted
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_media_uploaded_by ON content_management.media_files(uploaded_by);
CREATE INDEX idx_media_type ON content_management.media_files(media_type);
CREATE INDEX idx_media_status ON content_management.media_files(status);
```

---

## 💻 Backend (NestJS)

### Service: MediaService

```typescript
@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaFile)
    private readonly mediaRepo: Repository<MediaFile>,
    private readonly s3Service: S3Service,
    private readonly queueService: QueueService,
  ) {}

  async upload(
    file: Express.Multer.File,
    userId: string
  ): Promise<MediaFile> {
    // 1. Validate
    this.validateFile(file);

    // 2. Upload to S3
    const storageKey = this.generateStorageKey(file);
    await this.s3Service.upload(storageKey, file.buffer);

    // 3. Create DB record
    const media = await this.mediaRepo.save({
      filename: storageKey,
      original_filename: file.originalname,
      media_type: this.detectMediaType(file.mimetype),
      mime_type: file.mimetype,
      storage_path: storageKey,
      size_bytes: file.size,
      uploaded_by: userId,
      status: 'uploading',
    });

    // 4. Queue processing
    await this.queueService.addJob('process-media', { mediaId: media.id });

    return media;
  }

  async processMedia(mediaId: string): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });

    try {
      await this.mediaRepo.update(mediaId, { status: 'processing' });

      const processedVersions = {};

      switch (media.media_type) {
        case 'image':
          processedVersions.thumbnail = await this.processImage(media);
          break;
        case 'audio':
          processedVersions.transcoded = await this.processAudio(media);
          break;
        case 'video':
          processedVersions.transcoded = await this.processVideo(media);
          break;
      }

      await this.mediaRepo.update(mediaId, {
        status: 'ready',
        processed_versions: processedVersions,
      });
    } catch (error) {
      await this.mediaRepo.update(mediaId, {
        status: 'failed',
        processing_error: error.message,
      });
    }
  }

  private async processImage(media: MediaFile): Promise<any> {
    const buffer = await this.s3Service.getObject(media.storage_path);

    // Generate thumbnail
    const thumbnail = await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .toBuffer();

    const thumbnailKey = `${media.storage_path}-thumb.webp`;
    await this.s3Service.upload(thumbnailKey, thumbnail);

    // Compress original
    const compressed = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();

    await this.s3Service.upload(media.storage_path, compressed);

    return { thumbnail: thumbnailKey };
  }

  async getSignedUrl(mediaId: string): Promise<string> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });

    if (media.access_level === 'public') {
      return this.s3Service.getPublicUrl(media.storage_path);
    }

    return this.s3Service.getSignedUrl(media.storage_path, 3600); // 1 hour
  }
}
```

---

## 🎨 Frontend (React)

### Component: MediaUploader

```tsx
export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUploadComplete,
  acceptedTypes = ['image/*', 'audio/*', 'video/*', 'application/pdf'],
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file, {
      onUploadProgress: (e) => setProgress((e.loaded / e.total) * 100),
    }),
    onSuccess: (media) => {
      onUploadComplete(media);
      setUploading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    uploadMutation.mutate(file);
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-6">
      {!uploading ? (
        <label className="cursor-pointer">
          <input
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-center">
            <p>📤 Click para subir archivo</p>
            <p className="text-sm text-gray-500 mt-2">
              Tamaño máximo: 50MB
            </p>
          </div>
        </label>
      ) : (
        <div>
          <p>Subiendo... {Math.round(progress)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🧪 Tests

```typescript
describe('MediaService', () => {
  it('should upload and process image', async () => {
    // Arrange
    const user = await createUser();
    const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 500);

    // Act
    const media = await mediaService.upload(file, user.id);

    expect(media.status).toBe('uploading');

    // Simulate processing
    await mediaService.processMedia(media.id);

    // Assert
    const processed = await mediaService.findOne(media.id);
    expect(processed.status).toBe('ready');
    expect(processed.processed_versions.thumbnail).toBeDefined();
  });
});
```

---

## 📅 Historial

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-07 | Creación |

---

**Documento:** `docs/02-especificaciones-tecnicas/07-contenido-media/ET-CNT-001-gestion-media.md`
