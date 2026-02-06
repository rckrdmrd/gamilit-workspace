-- Tabla: media_metadatas
-- Schema: content_management
-- Descripción: Metadatos extendidos para archivos multimedia
-- CREADO: 2025-11-08

CREATE TABLE content_management.media_metadatas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_file_id UUID NOT NULL REFERENCES content_management.media_files(id) ON DELETE CASCADE,
    duration_seconds INTEGER,
    width INTEGER,
    height INTEGER,
    resolution VARCHAR(20),
    bitrate INTEGER,
    codec VARCHAR(50),
    thumbnail_url TEXT,
    alt_text TEXT,
    caption TEXT,
    copyright_info TEXT,
    exif_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(media_file_id)
);

-- Índices
CREATE INDEX idx_media_metadatas_media_file_id ON content_management.media_metadatas(media_file_id);
CREATE INDEX idx_media_metadatas_resolution ON content_management.media_metadatas(resolution) WHERE resolution IS NOT NULL;
CREATE INDEX idx_media_metadatas_exif_gin ON content_management.media_metadatas USING GIN(exif_data) WHERE exif_data IS NOT NULL;

-- Comentarios
COMMENT ON TABLE content_management.media_metadatas IS 'Extended metadata for media files (video, audio, images)';
COMMENT ON COLUMN content_management.media_metadatas.duration_seconds IS 'Duration for video/audio files (seconds)';
COMMENT ON COLUMN content_management.media_metadatas.width IS 'Width in pixels for images/videos';
COMMENT ON COLUMN content_management.media_metadatas.height IS 'Height in pixels for images/videos';
COMMENT ON COLUMN content_management.media_metadatas.exif_data IS 'EXIF data from images (JSONB)';

-- Trigger para updated_at
CREATE TRIGGER trg_media_metadatas_updated_at
    BEFORE UPDATE ON content_management.media_metadatas
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();
