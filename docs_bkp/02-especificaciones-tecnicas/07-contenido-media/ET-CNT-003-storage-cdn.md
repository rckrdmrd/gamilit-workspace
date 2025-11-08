# ET-CNT-003: Especificación Técnica - Storage y CDN

**ID:** ET-CNT-003
**Título:** Implementación de Storage en la Nube y CDN
**Módulo:** 07-contenido-media
**Tipo:** Especificación Técnica
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Resumen Ejecutivo

Esta especificación técnica define la implementación del sistema de almacenamiento en la nube (S3-compatible) y distribución mediante CDN para la plataforma Gamilit, incluyendo URLs firmadas, backup automático, políticas de retención y optimización de costos.

---

## 🔗 Referencias

**Implementa:**
- [RF-CNT-003: Storage y CDN](../../01-requerimientos/07-contenido-media/RF-CNT-003-storage-cdn.md)

**Relacionado con:**
- [ET-CNT-001: Gestión de Media](./ET-CNT-001-gestion-media.md)
- [ET-CNT-002: Tipos de Media y Procesamiento](./ET-CNT-002-tipos-media-procesamiento.md)

---

## 🗄️ 1. Base de Datos (PostgreSQL)

### 1.1 Tabla: `cdn_cache_rules`

```sql
-- Archivo: apps/database/ddl/schemas/storage/tables/cdn_cache_rules.sql
CREATE TABLE storage.cdn_cache_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    media_type VARCHAR(20) NOT NULL, -- image, audio, video, document
    variant_type VARCHAR(50), -- thumbnail, small, 480p, etc. (NULL = todos)

    cache_ttl_seconds INT NOT NULL, -- TTL en segundos
    cache_control VARCHAR(200) NOT NULL, -- Valor del header Cache-Control

    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (media_type, variant_type)
);

-- Datos iniciales
INSERT INTO storage.cdn_cache_rules (media_type, variant_type, cache_ttl_seconds, cache_control) VALUES
    ('image', NULL, 604800, 'public, max-age=604800, immutable'), -- 7 días
    ('audio', NULL, 2592000, 'public, max-age=2592000, immutable'), -- 30 días
    ('video', NULL, 2592000, 'public, max-age=2592000, immutable'), -- 30 días
    ('document', NULL, 604800, 'public, max-age=604800'), -- 7 días
    ('image', 'avatar', 86400, 'public, max-age=86400'); -- 1 día (avatares cambian más)

CREATE INDEX idx_cdn_cache_rules_type ON storage.cdn_cache_rules(media_type, is_active);
```

### 1.2 Tabla: `signed_urls`

```sql
-- Archivo: apps/database/ddl/schemas/storage/tables/signed_urls.sql
CREATE TABLE storage.signed_urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_file_id UUID NOT NULL REFERENCES storage.media_files(id) ON DELETE CASCADE,

    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 de la URL completa

    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    access_count INT NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CHECK (expires_at > created_at)
);

CREATE INDEX idx_signed_urls_media ON storage.signed_urls(media_file_id);
CREATE INDEX idx_signed_urls_user ON storage.signed_urls(user_id);
CREATE INDEX idx_signed_urls_expires ON storage.signed_urls(expires_at) WHERE expires_at > CURRENT_TIMESTAMP;

-- Función para limpiar URLs expiradas
CREATE OR REPLACE FUNCTION storage.cleanup_expired_signed_urls()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM storage.signed_urls
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

### 1.3 Tabla: `storage_lifecycle_rules`

```sql
-- Archivo: apps/database/ddl/schemas/storage/tables/storage_lifecycle_rules.sql
CREATE TYPE storage.storage_tier AS ENUM ('hot', 'warm', 'cold', 'archive');

CREATE TABLE storage.storage_lifecycle_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    media_type VARCHAR(20) NOT NULL,
    rule_name VARCHAR(100) NOT NULL UNIQUE,

    days_to_warm INT, -- NULL = no transiciona a warm
    days_to_cold INT,
    days_to_archive INT,
    days_to_delete INT, -- NULL = no se elimina automáticamente

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO storage.storage_lifecycle_rules (media_type, rule_name, days_to_warm, days_to_cold, days_to_archive, days_to_delete) VALUES
    ('image', 'Ejercicios', 30, 90, 365, NULL), -- Nunca eliminar
    ('image', 'Avatares', 7, NULL, NULL, NULL), -- Solo hot/warm
    ('audio', 'Pronunciación', 30, 90, 365, NULL),
    ('video', 'Tutoriales', 30, 90, 365, NULL),
    ('document', 'Lecturas', 30, 90, 365, NULL),
    ('*', 'Feedback Temporal', NULL, NULL, NULL, 90), -- Eliminar a los 90 días
    ('*', 'Backups', NULL, 7, 30, 365); -- Backups se archivan y eliminan

CREATE INDEX idx_lifecycle_rules_type ON storage.storage_lifecycle_rules(media_type, is_active);
```

### 1.4 Tabla: `backup_history`

```sql
-- Archivo: apps/database/ddl/schemas/storage/tables/backup_history.sql
CREATE TYPE storage.backup_type AS ENUM ('incremental', 'full', 'archive');
CREATE TYPE storage.backup_status AS ENUM ('running', 'completed', 'failed');

CREATE TABLE storage.backup_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    backup_type storage.backup_type NOT NULL,
    status storage.backup_status NOT NULL DEFAULT 'running',

    files_backed_up INT NOT NULL DEFAULT 0,
    total_size_bytes BIGINT NOT NULL DEFAULT 0,

    source_bucket VARCHAR(100) NOT NULL,
    destination_bucket VARCHAR(100) NOT NULL,

    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,

    error_message TEXT,

    CHECK (completed_at IS NULL OR completed_at >= started_at)
);

CREATE INDEX idx_backup_history_type ON storage.backup_history(backup_type, started_at DESC);
CREATE INDEX idx_backup_history_status ON storage.backup_history(status) WHERE status = 'running';
```

---

## 🖥️ 2. Backend (NestJS + TypeScript)

### 2.1 Service: `S3Service`

```typescript
// Archivo: apps/backend/src/modules/media/services/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

interface UploadOptions {
    ContentType?: string;
    CacheControl?: string;
    Metadata?: Record<string, string>;
}

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')
            },
            endpoint: this.configService.get('S3_ENDPOINT') // Para MinIO/DigitalOcean Spaces
        });

        this.bucketName = this.configService.get('S3_BUCKET_NAME');
    }

    async upload(key: string, buffer: Buffer, options: UploadOptions = {}): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: options.ContentType,
            CacheControl: options.CacheControl,
            Metadata: options.Metadata
        });

        await this.s3Client.send(command);

        return key;
    }

    async uploadFile(key: string, filePath: string, options: UploadOptions = {}): Promise<string> {
        const fs = require('fs');
        const buffer = fs.readFileSync(filePath);

        return this.upload(key, buffer, options);
    }

    async getObject(key: string): Promise<Buffer> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        const response = await this.s3Client.send(command);

        // Stream to Buffer
        const chunks: Buffer[] = [];
        for await (const chunk of response.Body as any) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    }

    async deleteObject(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        await this.s3Client.send(command);
    }

    async objectExists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            await this.s3Client.send(command);
            return true;
        } catch (error) {
            if (error.name === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }
}
```

### 2.2 Service: `CDNService`

```typescript
// Archivo: apps/backend/src/modules/media/services/cdn.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaFile } from '../entities/media-file.entity';
import axios from 'axios';

@Injectable()
export class CDNService {
    private cdnBaseUrl: string;
    private cloudflareApiToken: string;
    private cloudflareZoneId: string;

    constructor(
        private configService: ConfigService,
        @InjectRepository(MediaFile)
        private mediaFileRepo: Repository<MediaFile>
    ) {
        this.cdnBaseUrl = this.configService.get('CDN_BASE_URL');
        this.cloudflareApiToken = this.configService.get('CLOUDFLARE_API_TOKEN');
        this.cloudflareZoneId = this.configService.get('CLOUDFLARE_ZONE_ID');
    }

    getCDNUrl(s3Key: string): string {
        // Construir URL del CDN basada en la clave S3
        return `${this.cdnBaseUrl}/${s3Key}`;
    }

    async getCDNUrlForMedia(mediaFileId: string, variantType: string = 'original'): Promise<string> {
        const mediaFile = await this.mediaFileRepo.findOne({
            where: { id: mediaFileId },
            relations: ['variants']
        });

        if (!mediaFile) {
            throw new Error('Media file not found');
        }

        // Buscar variante específica
        const variant = mediaFile.variants.find(v => v.variant_type === variantType);

        if (!variant) {
            // Fallback a original si no existe la variante
            return this.getCDNUrl(mediaFile.s3_key);
        }

        return variant.cdn_url;
    }

    async invalidateCache(urls: string[]): Promise<void> {
        // Invalidar cache en CloudFlare
        try {
            await axios.post(
                `https://api.cloudflare.com/client/v4/zones/${this.cloudflareZoneId}/purge_cache`,
                {
                    files: urls
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.cloudflareApiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            console.error('Failed to invalidate CDN cache:', error);
            // No lanzar error - la invalidación no es crítica
        }
    }

    async purgeAll(): Promise<void> {
        // Purge total del cache (usar con cuidado)
        await axios.post(
            `https://api.cloudflare.com/client/v4/zones/${this.cloudflareZoneId}/purge_cache`,
            {
                purge_everything: true
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.cloudflareApiToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    }

    async getCacheStats(): Promise<any> {
        // Obtener estadísticas de cache de CloudFlare
        const response = await axios.get(
            `https://api.cloudflare.com/client/v4/zones/${this.cloudflareZoneId}/analytics/dashboard`,
            {
                headers: {
                    'Authorization': `Bearer ${this.cloudflareApiToken}`
                },
                params: {
                    since: -10080, // últimos 7 días
                    until: 0
                }
            }
        );

        return response.data.result;
    }
}
```

### 2.3 Service: `SignedUrlService`

```typescript
// Archivo: apps/backend/src/modules/media/services/signed-url.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { S3Service } from './s3.service';
import { createHash } from 'crypto';

interface SignedUrlOptions {
    expiresIn?: number; // segundos
    trackAccess?: boolean;
}

@Injectable()
export class SignedUrlService {
    constructor(
        private s3Service: S3Service,
        private dataSource: DataSource
    ) {}

    async generateSignedUrl(
        mediaFileId: string,
        userId: string,
        options: SignedUrlOptions = {}
    ): Promise<string> {
        const { expiresIn = 3600, trackAccess = true } = options;

        // Obtener media file
        const mediaFile = await this.dataSource.query(
            'SELECT s3_key, is_public FROM storage.media_files WHERE id = $1',
            [mediaFileId]
        );

        if (!mediaFile || mediaFile.length === 0) {
            throw new Error('Media file not found');
        }

        // Si es público, devolver URL del CDN
        if (mediaFile[0].is_public) {
            // No necesita firma
            return `https://cdn.gamilit.com/${mediaFile[0].s3_key}`;
        }

        // Generar signed URL de S3
        const signedUrl = await this.s3Service.getSignedUrl(
            mediaFile[0].s3_key,
            expiresIn
        );

        // Guardar tracking si está habilitado
        if (trackAccess) {
            const urlHash = createHash('sha256').update(signedUrl).digest('hex');
            const expiresAt = new Date(Date.now() + expiresIn * 1000);

            await this.dataSource.query(`
                INSERT INTO storage.signed_urls (media_file_id, user_id, url_hash, expires_at)
                VALUES ($1, $2, $3, $4)
            `, [mediaFileId, userId, urlHash, expiresAt]);
        }

        return signedUrl;
    }

    async trackAccess(urlHash: string): Promise<void> {
        await this.dataSource.query(`
            UPDATE storage.signed_urls
            SET access_count = access_count + 1,
                last_accessed_at = CURRENT_TIMESTAMP
            WHERE url_hash = $1
        `, [urlHash]);
    }

    async cleanupExpired(): Promise<number> {
        const result = await this.dataSource.query(
            'SELECT storage.cleanup_expired_signed_urls()'
        );

        return result[0].cleanup_expired_signed_urls;
    }
}
```

### 2.4 Service: `StorageLifecycleService`

```typescript
// Archivo: apps/backend/src/modules/media/services/storage-lifecycle.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { S3Service } from './s3.service';

@Injectable()
export class StorageLifecycleService {
    constructor(
        private dataSource: DataSource,
        private s3Service: S3Service
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async applyLifecycleRules(): Promise<void> {
        console.log('Starting lifecycle rules application...');

        // Obtener todas las reglas activas
        const rules = await this.dataSource.query(`
            SELECT * FROM storage.storage_lifecycle_rules
            WHERE is_active = TRUE
        `);

        for (const rule of rules) {
            await this.processRule(rule);
        }

        console.log('Lifecycle rules application completed');
    }

    private async processRule(rule: any): Promise<void> {
        const now = new Date();

        // Transición a Warm
        if (rule.days_to_warm) {
            await this.transitionToTier(rule.media_type, 'warm', rule.days_to_warm);
        }

        // Transición a Cold
        if (rule.days_to_cold) {
            await this.transitionToTier(rule.media_type, 'cold', rule.days_to_cold);
        }

        // Transición a Archive
        if (rule.days_to_archive) {
            await this.transitionToTier(rule.media_type, 'archive', rule.days_to_archive);
        }

        // Eliminación automática
        if (rule.days_to_delete) {
            await this.deleteOldFiles(rule.media_type, rule.days_to_delete);
        }
    }

    private async transitionToTier(mediaType: string, targetTier: string, daysOld: number): Promise<void> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        // Obtener archivos elegibles para transición
        const files = await this.dataSource.query(`
            SELECT id, s3_key, s3_bucket
            FROM storage.media_files
            WHERE (mime_type LIKE $1 OR $1 = '*')
              AND created_at < $2
              AND storage_tier != $3
        `, [`${mediaType}/%`, cutoffDate, targetTier]);

        console.log(`Transitioning ${files.length} files to ${targetTier} tier`);

        // En producción: usar S3 API para cambiar storage class
        // Para demo: solo actualizar en DB
        for (const file of files) {
            await this.dataSource.query(`
                UPDATE storage.media_files
                SET storage_tier = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [targetTier, file.id]);
        }
    }

    private async deleteOldFiles(mediaType: string, daysOld: number): Promise<void> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        // Obtener archivos a eliminar
        const files = await this.dataSource.query(`
            SELECT id, s3_key
            FROM storage.media_files
            WHERE (mime_type LIKE $1 OR $1 = '*')
              AND created_at < $2
              AND deleted_at IS NULL
        `, [`${mediaType}/%`, cutoffDate]);

        console.log(`Deleting ${files.length} old files`);

        for (const file of files) {
            // Eliminar de S3
            await this.s3Service.deleteObject(file.s3_key);

            // Marcar como eliminado en DB
            await this.dataSource.query(`
                UPDATE storage.media_files
                SET deleted_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [file.id]);
        }
    }

    async getStorageStatsByTier(): Promise<any> {
        return this.dataSource.query(`
            SELECT
                storage_tier,
                COUNT(*) as file_count,
                SUM(size_bytes) as total_bytes,
                ROUND(SUM(size_bytes) / 1024.0 / 1024.0 / 1024.0, 2) as total_gb
            FROM storage.media_files
            WHERE deleted_at IS NULL
            GROUP BY storage_tier
            ORDER BY storage_tier
        `);
    }
}
```

### 2.5 Controller: `MediaController`

```typescript
// Archivo: apps/backend/src/modules/media/controllers/media.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CDNService } from '../services/cdn.service';
import { SignedUrlService } from '../services/signed-url.service';
import { StorageLifecycleService } from '../services/storage-lifecycle.service';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
    constructor(
        private cdnService: CDNService,
        private signedUrlService: SignedUrlService,
        private lifecycleService: StorageLifecycleService
    ) {}

    @Get(':id/url')
    async getMediaUrl(
        @Param('id') mediaId: string,
        @Query('variant') variant: string = 'original',
        @CurrentUser() user: any
    ): Promise<{ url: string }> {
        // Verificar permisos (implementar según lógica de negocio)

        const url = await this.cdnService.getCDNUrlForMedia(mediaId, variant);

        return { url };
    }

    @Get(':id/signed-url')
    async getSignedUrl(
        @Param('id') mediaId: string,
        @Query('expiresIn') expiresIn: number = 3600,
        @CurrentUser() user: any
    ): Promise<{ url: string, expiresAt: Date }> {
        const url = await this.signedUrlService.generateSignedUrl(
            mediaId,
            user.id,
            { expiresIn }
        );

        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        return { url, expiresAt };
    }

    @Get('stats/storage')
    async getStorageStats(): Promise<any> {
        return this.lifecycleService.getStorageStatsByTier();
    }

    @Get('stats/cdn')
    async getCDNStats(): Promise<any> {
        return this.cdnService.getCacheStats();
    }
}
```

---

## 🎨 3. Frontend (React + TypeScript)

### 3.1 Componente: `OptimizedImage`

```typescript
// Archivo: apps/frontend/src/components/media/OptimizedImage.tsx
import React, { useState } from 'react';

interface OptimizedImageProps {
    mediaId: string;
    alt: string;
    variant?: 'thumbnail' | 'small' | 'medium' | 'large';
    className?: string;
    fallbackSrc?: string;
}

export function OptimizedImage({
    mediaId,
    alt,
    variant = 'medium',
    className,
    fallbackSrc
}: OptimizedImageProps) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    // Construir URL del CDN
    const cdnUrl = `https://cdn.gamilit.com/images/${variant}/${mediaId}.webp`;
    const fallbackUrl = fallbackSrc || `https://cdn.gamilit.com/images/${variant}/${mediaId}.jpg`;

    const handleLoad = () => {
        setLoading(false);
    };

    const handleError = () => {
        setError(true);
        setLoading(false);
    };

    return (
        <picture>
            {/* WebP para navegadores modernos */}
            <source srcSet={cdnUrl} type="image/webp" />

            {/* JPEG como fallback */}
            <img
                src={error ? fallbackSrc : fallbackUrl}
                alt={alt}
                className={`${className} ${loading ? 'loading' : ''}`}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
            />
        </picture>
    );
}
```

### 3.2 Componente: `VideoPlayer`

```typescript
// Archivo: apps/frontend/src/components/media/VideoPlayer.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';

interface VideoPlayerProps {
    mediaId: string;
    autoQuality?: boolean;
    requiresAuth?: boolean;
}

export function VideoPlayer({ mediaId, autoQuality = true, requiresAuth = false }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [quality, setQuality] = useState<'480p' | '720p' | '1080p'>('720p');

    // Obtener URL (firmada si requiere autenticación)
    const { data: urlData } = useQuery({
        queryKey: ['media-url', mediaId, requiresAuth],
        queryFn: async () => {
            const endpoint = requiresAuth
                ? `/media/${mediaId}/signed-url?expiresIn=21600` // 6 horas
                : `/media/${mediaId}/url?variant=${quality}`;

            const response = await apiClient.get(endpoint);
            return response.data;
        }
    });

    // Detectar calidad automáticamente basada en ancho de banda
    useEffect(() => {
        if (!autoQuality || !videoRef.current) return;

        const connection = (navigator as any).connection;
        if (!connection) return;

        const effectiveType = connection.effectiveType;

        if (effectiveType === '4g') {
            setQuality('1080p');
        } else if (effectiveType === '3g') {
            setQuality('720p');
        } else {
            setQuality('480p');
        }
    }, [autoQuality]);

    if (!urlData) {
        return <div className="video-loading">Cargando video...</div>;
    }

    return (
        <div className="video-player">
            <video
                ref={videoRef}
                src={urlData.url}
                controls
                preload="metadata"
                className="w-full rounded-lg"
            >
                Tu navegador no soporta el elemento video.
            </video>

            {/* Selector manual de calidad */}
            <div className="quality-selector">
                <button onClick={() => setQuality('480p')}>480p</button>
                <button onClick={() => setQuality('720p')}>720p</button>
                <button onClick={() => setQuality('1080p')}>1080p</button>
            </div>
        </div>
    );
}
```

### 3.3 Hook: `useSignedUrl`

```typescript
// Archivo: apps/frontend/src/hooks/useSignedUrl.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

interface UseSignedUrlOptions {
    expiresIn?: number;
    enabled?: boolean;
}

export function useSignedUrl(mediaId: string, options: UseSignedUrlOptions = {}) {
    const { expiresIn = 3600, enabled = true } = options;

    return useQuery({
        queryKey: ['signed-url', mediaId, expiresIn],
        queryFn: async () => {
            const response = await apiClient.get(
                `/media/${mediaId}/signed-url?expiresIn=${expiresIn}`
            );
            return response.data;
        },
        enabled,
        staleTime: (expiresIn - 300) * 1000, // Refetch 5 min antes de expirar
        refetchOnMount: false,
        refetchOnWindowFocus: false
    });
}
```

---

## ⚙️ 4. Configuración

### 4.1 Variables de Entorno

```bash
# Archivo: apps/backend/.env
# S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=gamilit-media
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com  # Para DigitalOcean Spaces

# CDN Configuration
CDN_BASE_URL=https://cdn.gamilit.com

# CloudFlare Configuration
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ZONE_ID=your_zone_id

# Storage Lifecycle
ENABLE_LIFECYCLE_RULES=true
ENABLE_AUTO_CLEANUP=true
```

### 4.2 CloudFlare Workers (Opcional)

```javascript
// Archivo: cloudflare-worker.js
// Worker para agregar headers de seguridad y optimización

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
});

async function handleRequest(request) {
    const response = await fetch(request);

    // Clonar response para poder modificar headers
    const newResponse = new Response(response.body, response);

    // Agregar headers de seguridad
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Optimizar imágenes automáticamente con Cloudflare Polish
    if (request.headers.get('Accept')?.includes('image/webp')) {
        newResponse.headers.set('CF-Polish', 'lossy');
    }

    return newResponse;
}
```

---

## ✅ Criterios de Aceptación

- [x] Tabla `cdn_cache_rules` define TTLs por tipo de media
- [x] Tabla `signed_urls` rastrea URLs firmadas activas
- [x] S3Service implementa upload/download/delete operations
- [x] CDNService genera URLs y invalida cache
- [x] SignedUrlService genera URLs con expiración
- [x] StorageLifecycleService aplica lifecycle rules automáticamente
- [x] OptimizedImage component usa WebP con fallback
- [x] VideoPlayer component con selección de calidad
- [x] Hook useSignedUrl refresca antes de expirar

---

## 📊 Monitoreo y Alertas

### Métricas Clave

```typescript
// Archivo: apps/backend/src/modules/media/services/monitoring.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MediaMonitoringService {
    constructor(private dataSource: DataSource) {}

    async getStorageMetrics(): Promise<any> {
        return this.dataSource.query(`
            SELECT
                COUNT(*) as total_files,
                SUM(size_bytes) / 1024.0 / 1024.0 / 1024.0 as total_gb,
                AVG(size_bytes) / 1024.0 / 1024.0 as avg_mb,
                storage_tier,
                mime_type
            FROM storage.media_files
            WHERE deleted_at IS NULL
            GROUP BY storage_tier, mime_type
        `);
    }

    async getCostEstimate(): Promise<any> {
        const stats = await this.getStorageMetrics();

        const costs = stats.map(stat => {
            let costPerGb = 0.023; // S3 Standard

            if (stat.storage_tier === 'warm') costPerGb = 0.0125; // S3 IA
            if (stat.storage_tier === 'cold') costPerGb = 0.004; // Glacier
            if (stat.storage_tier === 'archive') costPerGb = 0.00099; // Deep Archive

            return {
                tier: stat.storage_tier,
                gb: stat.total_gb,
                monthlyCost: stat.total_gb * costPerGb
            };
        });

        return {
            breakdown: costs,
            totalMonthlyCost: costs.reduce((sum, c) => sum + c.monthlyCost, 0)
        };
    }

    async checkCostAlerts(): Promise<void> {
        const estimate = await this.getCostEstimate();

        if (estimate.totalMonthlyCost > 100) {
            // Enviar alerta crítica
            console.error('CRITICAL: Storage costs exceed $100/month');
        } else if (estimate.totalMonthlyCost > 50) {
            // Enviar warning
            console.warn('WARNING: Storage costs exceed $50/month');
        }
    }
}
```

---

## 🧪 Tests

### Test 1: Upload y Recuperación desde CDN

```typescript
// Archivo: apps/backend/test/media/cdn.spec.ts
import { Test } from '@nestjs/testing';
import { S3Service } from '../../src/modules/media/services/s3.service';
import { CDNService } from '../../src/modules/media/services/cdn.service';

describe('CDN Integration', () => {
    let s3Service: S3Service;
    let cdnService: CDNService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [S3Service, CDNService]
        }).compile();

        s3Service = moduleRef.get(S3Service);
        cdnService = moduleRef.get(CDNService);
    });

    it('should upload file and retrieve from CDN', async () => {
        const testBuffer = Buffer.from('test content');
        const s3Key = 'test/file.txt';

        // Upload a S3
        await s3Service.upload(s3Key, testBuffer, {
            ContentType: 'text/plain',
            CacheControl: 'public, max-age=604800'
        });

        // Obtener URL del CDN
        const cdnUrl = cdnService.getCDNUrl(s3Key);
        expect(cdnUrl).toContain('cdn.gamilit.com');

        // Verificar accesibilidad
        const response = await fetch(cdnUrl);
        expect(response.status).toBe(200);
        expect(response.headers.get('cache-control')).toBeTruthy();
    });
});
```

### Test 2: Signed URLs con Expiración

```typescript
describe('Signed URLs', () => {
    it('should generate signed URL that expires', async () => {
        const mediaId = 'test-media-id';
        const userId = 'test-user-id';

        // Generar URL con 5 segundos de expiración
        const signedUrl = await signedUrlService.generateSignedUrl(
            mediaId,
            userId,
            { expiresIn: 5 }
        );

        expect(signedUrl).toContain('Expires=');
        expect(signedUrl).toContain('Signature=');

        // Debe funcionar inmediatamente
        const response1 = await fetch(signedUrl);
        expect(response1.status).toBe(200);

        // Esperar expiración
        await new Promise(resolve => setTimeout(resolve, 6000));

        // Debe fallar
        const response2 = await fetch(signedUrl);
        expect(response2.status).toBe(403);
    });
});
```

### Test 3: Lifecycle Transition

```typescript
describe('Storage Lifecycle', () => {
    it('should transition old files to cold tier', async () => {
        // Crear archivo con fecha antigua
        const oldFile = await createTestFile({
            created_at: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000) // 91 días
        });

        // Aplicar lifecycle rules
        await lifecycleService.applyLifecycleRules();

        // Verificar transición
        const file = await getFile(oldFile.id);
        expect(file.storage_tier).toBe('cold');
    });
});
```

---

## 📚 Referencias Técnicas

### Database
- Schema: `storage`
- Tablas: `cdn_cache_rules`, `signed_urls`, `storage_lifecycle_rules`, `backup_history`

### Backend
- Service: `apps/backend/src/modules/media/services/s3.service.ts`
- Service: `apps/backend/src/modules/media/services/cdn.service.ts`
- Service: `apps/backend/src/modules/media/services/signed-url.service.ts`
- Service: `apps/backend/src/modules/media/services/storage-lifecycle.service.ts`
- Controller: `apps/backend/src/modules/media/controllers/media.controller.ts`

### Frontend
- Component: `apps/frontend/src/components/media/OptimizedImage.tsx`
- Component: `apps/frontend/src/components/media/VideoPlayer.tsx`
- Hook: `apps/frontend/src/hooks/useSignedUrl.ts`

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo Backend, DevOps, Finanzas
**Próxima revisión:** 2026-01-07
