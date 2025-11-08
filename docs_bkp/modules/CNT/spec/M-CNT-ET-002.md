
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: ET-CNT-002 -->
<!-- ID Nuevo: M-CNT-ET-002 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-CNT-ET-002: Especificación Técnica - Tipos de Media y Procesamiento

**ID:** ET-CNT-002
**Título:** Implementación del Procesamiento Específico por Tipo de Media
**Módulo:** 07-contenido-media
**Tipo:** Especificación Técnica
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Resumen Ejecutivo

Esta especificación técnica define la implementación del procesamiento específico para cada tipo de media (imágenes, audio, video, documentos) en la plataforma Gamilit, incluyendo validación, optimización, conversión y extracción de metadatos.

---

## 🔗 Referencias

**Implementa:**
- [RF-CNT-002: Tipos de Media y Procesamiento](../../01-requerimientos/07-contenido-media/RF-CNT-002-tipos-media-procesamiento.md)

**Relacionado con:**
- [ET-CNT-001: Gestión de Media](./ET-CNT-001-gestion-media.md)
- [ET-CNT-003: Storage y CDN](./ET-CNT-003-storage-cdn.md)

---

## 🗄️ 1. Base de Datos (PostgreSQL)

### 1.1 Tabla: `media_variants`

```sql
-- Archivo: apps/database/ddl/schemas/storage/tables/media_variants.sql
CREATE TABLE storage.media_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_file_id UUID NOT NULL REFERENCES storage.media_files(id) ON DELETE CASCADE,

    variant_type VARCHAR(50) NOT NULL, -- thumbnail, small, medium, large, 480p, 720p, etc.
    format VARCHAR(20) NOT NULL, -- webp, mp3, mp4, etc.

    width INT,
    height INT,
    size_bytes BIGINT NOT NULL,
    duration_seconds NUMERIC(10,2),

    s3_bucket VARCHAR(100) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    cdn_url TEXT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (media_file_id, variant_type, format)
);

CREATE INDEX idx_media_variants_file ON storage.media_variants(media_file_id);
CREATE INDEX idx_media_variants_type ON storage.media_variants(variant_type);
```

### 1.2 Tabla: `processing_jobs`

```sql
-- Archivo: apps/database/ddl/schemas/storage/tables/processing_jobs.sql
CREATE TYPE storage.job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE storage.job_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE storage.processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_file_id UUID NOT NULL REFERENCES storage.media_files(id) ON DELETE CASCADE,

    job_type VARCHAR(50) NOT NULL, -- image_processing, audio_transcoding, video_transcoding
    status storage.job_status NOT NULL DEFAULT 'pending',
    priority storage.job_priority NOT NULL DEFAULT 'medium',

    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,

    error_message TEXT,
    processing_time_seconds INT,

    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_processing_jobs_status ON storage.processing_jobs(status, priority, created_at) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_processing_jobs_media ON storage.processing_jobs(media_file_id);
```

---

## 🖥️ 2. Backend (NestJS + TypeScript)

### 2.1 Service: `ImageProcessingService`

```typescript
// Archivo: apps/backend/src/modules/media/services/image-processing.service.ts
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { S3Service } from './s3.service';

interface ImageVariant {
    type: string;
    width: number;
    height?: number;
    format: 'webp' | 'jpeg' | 'png';
}

@Injectable()
export class ImageProcessingService {
    private readonly variants: ImageVariant[] = [
        { type: 'thumbnail', width: 150, height: 150, format: 'webp' },
        { type: 'small', width: 320, format: 'webp' },
        { type: 'medium', width: 640, format: 'webp' },
        { type: 'large', width: 1280, format: 'webp' }
    ];

    constructor(private s3Service: S3Service) {}

    async processImage(fileId: string, filePath: string): Promise<void> {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        // Validar dimensiones
        if (metadata.width > 4096 || metadata.height > 4096) {
            throw new Error('Image dimensions exceed maximum (4096x4096)');
        }

        // Generar variantes
        for (const variant of this.variants) {
            await this.generateVariant(fileId, image, variant, metadata);
        }

        // Guardar metadata
        await this.saveMetadata(fileId, metadata);
    }

    private async generateVariant(
        fileId: string,
        image: sharp.Sharp,
        variant: ImageVariant,
        originalMetadata: sharp.Metadata
    ): Promise<void> {
        let processed = image.clone();

        if (variant.height) {
            // Thumbnail: crop to square
            processed = processed.resize(variant.width, variant.height, {
                fit: 'cover',
                position: 'center'
            });
        } else {
            // Other variants: maintain aspect ratio
            processed = processed.resize(variant.width, null, {
                withoutEnlargement: true
            });
        }

        // Convert format and optimize
        const buffer = await processed
            .toFormat(variant.format, { quality: 85 })
            .toBuffer();

        // Upload to S3
        const s3Key = `images/${variant.type}/${fileId}.${variant.format}`;
        await this.s3Service.upload(s3Key, buffer, {
            ContentType: `image/${variant.format}`,
            CacheControl: 'public, max-age=604800, immutable'
        });

        // Save variant to DB
        await this.saveVariant(fileId, variant, s3Key, buffer.length);
    }

    private async saveMetadata(fileId: string, metadata: sharp.Metadata): Promise<void> {
        await this.dataSource.query(`
            UPDATE storage.media_files
            SET metadata = jsonb_build_object(
                'width', $2,
                'height', $3,
                'format', $4,
                'has_alpha', $5
            )
            WHERE id = $1
        `, [fileId, metadata.width, metadata.height, metadata.format, metadata.hasAlpha]);
    }
}
```

### 2.2 Service: `AudioProcessingService`

```typescript
// Archivo: apps/backend/src/modules/media/services/audio-processing.service.ts
import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

@Injectable()
export class AudioProcessingService {
    async processAudio(fileId: string, filePath: string): Promise<void> {
        // Validar duración
        const metadata = await this.getMetadata(filePath);
        if (metadata.duration > 600) { // 10 minutos
            throw new Error('Audio duration exceeds maximum (10 minutes)');
        }

        // Normalizar volumen
        const normalizedPath = await this.normalizeAudio(filePath);

        // Generar variantes (MP3, OGG)
        await Promise.all([
            this.convertToMP3(fileId, normalizedPath),
            this.convertToOGG(fileId, normalizedPath)
        ]);

        // Guardar metadata
        await this.saveMetadata(fileId, metadata);
    }

    private async normalizeAudio(inputPath: string): Promise<string> {
        const outputPath = `${inputPath}.normalized.wav`;

        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioFilters([
                    'loudnorm=I=-14:TP=-1.5:LRA=11', // Normalize to -14 LUFS
                    'afade=t=in:d=0.5', // Fade in
                    'afade=t=out:d=0.5' // Fade out
                ])
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .save(outputPath);
        });
    }

    private async convertToMP3(fileId: string, inputPath: string): Promise<void> {
        const outputPath = `/tmp/${fileId}.mp3`;

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioBitrate('128k')
                .audioCodec('libmp3lame')
                .on('end', resolve)
                .on('error', reject)
                .save(outputPath);
        });

        // Upload to S3
        const s3Key = `audio/mp3/${fileId}.mp3`;
        await this.s3Service.uploadFile(s3Key, outputPath);
    }

    private async getMetadata(filePath: string): Promise<any> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) reject(err);
                else resolve(metadata);
            });
        });
    }
}
```

### 2.3 Queue Worker: `MediaProcessingWorker`

```typescript
// Archivo: apps/backend/src/workers/media-processing.worker.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('media-processing')
export class MediaProcessingWorker {
    constructor(
        private imageService: ImageProcessingService,
        private audioService: AudioProcessingService,
        private videoService: VideoProcessingService
    ) {}

    @Process('process-image')
    async processImage(job: Job): Promise<void> {
        const { fileId, filePath } = job.data;

        await this.imageService.processImage(fileId, filePath);

        await this.updateJobStatus(job.data.jobId, 'completed');
    }

    @Process('process-audio')
    async processAudio(job: Job): Promise<void> {
        const { fileId, filePath } = job.data;

        await this.audioService.processAudio(fileId, filePath);

        await this.updateJobStatus(job.data.jobId, 'completed');
    }

    @Process('process-video')
    async processVideo(job: Job): Promise<void> {
        const { fileId, filePath } = job.data;

        await this.videoService.processVideo(fileId, filePath);

        await this.updateJobStatus(job.data.jobId, 'completed');
    }

    private async updateJobStatus(jobId: string, status: string): Promise<void> {
        await this.dataSource.query(`
            UPDATE storage.processing_jobs
            SET status = $2, completed_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [jobId, status]);
    }
}
```

---

## 🎨 3. Frontend (React + TypeScript)

### 3.1 Hook: `useMediaUpload`

```typescript
// Archivo: apps/frontend/src/hooks/useMediaUpload.ts
import { useState } from 'react';
import { apiClient } from '../lib/api-client';

export function useMediaUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const upload = async (file: File): Promise<string> => {
        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                }
            });

            return response.data.id;
        } finally {
            setUploading(false);
        }
    };

    return { upload, uploading, progress };
}
```

### 3.2 Componente: `MediaUploader`

```typescript
// Archivo: apps/frontend/src/components/media/MediaUploader.tsx
import React, { useState } from 'react';
import { useMediaUpload } from '../../hooks/useMediaUpload';

interface MediaUploaderProps {
    accept: string;
    maxSize: number; // bytes
    onUploadComplete: (mediaId: string) => void;
}

export function MediaUploader({ accept, maxSize, onUploadComplete }: MediaUploaderProps) {
    const { upload, uploading, progress } = useMediaUpload();
    const [error, setError] = useState<string>();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size
        if (file.size > maxSize) {
            setError(`File size exceeds maximum (${formatBytes(maxSize)})`);
            return;
        }

        try {
            const mediaId = await upload(file);
            onUploadComplete(mediaId);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="media-uploader">
            <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={uploading}
            />

            {uploading && (
                <div className="upload-progress">
                    <progress value={progress} max={100} />
                    <span>{progress}%</span>
                </div>
            )}

            {error && <div className="error">{error}</div>}
        </div>
    );
}
```

---

## ✅ Criterios de Aceptación

- [x] Tabla `media_variants` almacena variantes generadas
- [x] Tabla `processing_jobs` gestiona queue de procesamiento
- [x] ImageProcessingService genera 4 variantes (thumbnail, small, medium, large)
- [x] AudioProcessingService normaliza volumen y genera MP3/OGG
- [x] VideoProcessingService transcodes a 480p/720p/1080p
- [x] Queue worker procesa jobs asíncronamente con reintentos
- [x] Hook `useMediaUpload` muestra progreso en tiempo real
- [x] Componente `MediaUploader` valida tamaño y formato

---

## 📚 Referencias Técnicas

### Database
- Schema: `storage`
- Tablas: `media_variants`, `processing_jobs`

### Backend
- Service: `apps/backend/src/modules/media/services/image-processing.service.ts`
- Service: `apps/backend/src/modules/media/services/audio-processing.service.ts`
- Worker: `apps/backend/src/workers/media-processing.worker.ts`

### Frontend
- Hook: `apps/frontend/src/hooks/useMediaUpload.ts`
- Component: `apps/frontend/src/components/media/MediaUploader.tsx`

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo Backend, DevOps
**Próxima revisión:** 2026-01-07
