-- ============================================================================
-- Tabla: media_attachments
-- Schema: educational_content
-- Descripción: Archivos multimedia adjuntos a ejercicios creativos
-- Autor: Database-Agent
-- Fecha: 2025-11-29
-- Dependencias: progress_tracking.exercise_submissions, educational_content.exercises, auth_management.profiles
-- Módulos: MOD-04-DIGITAL, MOD-05-PRODUCCION
-- ============================================================================

-- Eliminar si existe (solo en desarrollo)
DROP TABLE IF EXISTS educational_content.media_attachments CASCADE;

-- Crear tabla
CREATE TABLE IF NOT EXISTS educational_content.media_attachments (
    -- Identificador
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relaciones (al menos una debe estar presente)
    submission_id UUID REFERENCES progress_tracking.exercise_submissions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES educational_content.exercises(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth_management.profiles(id),

    -- Información del archivo
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video', 'audio', 'document')),
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,

    -- Metadata específica por tipo
    duration_seconds INTEGER,  -- Para audio/video
    width INTEGER,             -- Para imágenes/video
    height INTEGER,
    thumbnail_path TEXT,       -- Para previews

    -- Estado de procesamiento
    is_processed BOOLEAN DEFAULT false,
    processing_error TEXT,

    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_media_attachments_submission ON educational_content.media_attachments(submission_id);
CREATE INDEX IF NOT EXISTS idx_media_attachments_exercise ON educational_content.media_attachments(exercise_id);
CREATE INDEX IF NOT EXISTS idx_media_attachments_user ON educational_content.media_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_media_attachments_type ON educational_content.media_attachments(file_type);

-- Comentarios
COMMENT ON TABLE educational_content.media_attachments IS
    'Archivos multimedia adjuntos a ejercicios creativos (Módulos 4 y 5)';
COMMENT ON COLUMN educational_content.media_attachments.submission_id IS
    'Referencia al submission si el archivo es parte de una entrega de estudiante';
COMMENT ON COLUMN educational_content.media_attachments.exercise_id IS
    'Referencia al ejercicio si el archivo es material de referencia del ejercicio';
COMMENT ON COLUMN educational_content.media_attachments.user_id IS
    'Usuario que subió el archivo (estudiante o docente)';
COMMENT ON COLUMN educational_content.media_attachments.file_path IS
    'Ruta relativa desde uploads/ en el servidor (ej: "exercises/module5/diario/student123_20251129.mp4")';
COMMENT ON COLUMN educational_content.media_attachments.file_type IS
    'Tipo de archivo: image (jpg, png, gif), video (mp4, webm), audio (mp3, wav), document (pdf, docx)';
COMMENT ON COLUMN educational_content.media_attachments.file_size IS
    'Tamaño del archivo en bytes';
COMMENT ON COLUMN educational_content.media_attachments.mime_type IS
    'MIME type del archivo (ej: video/mp4, image/jpeg, audio/mpeg)';
COMMENT ON COLUMN educational_content.media_attachments.duration_seconds IS
    'Duración en segundos para archivos de audio/video';
COMMENT ON COLUMN educational_content.media_attachments.width IS
    'Ancho en píxeles para imágenes y videos';
COMMENT ON COLUMN educational_content.media_attachments.height IS
    'Alto en píxeles para imágenes y videos';
COMMENT ON COLUMN educational_content.media_attachments.thumbnail_path IS
    'Ruta a thumbnail generado automáticamente (para videos e imágenes grandes)';
COMMENT ON COLUMN educational_content.media_attachments.is_processed IS
    'Indica si el archivo fue procesado (ej: thumbnail generado, video transcodificado)';
COMMENT ON COLUMN educational_content.media_attachments.processing_error IS
    'Mensaje de error si hubo problema en procesamiento';
COMMENT ON COLUMN educational_content.media_attachments.uploaded_at IS
    'Fecha y hora de subida del archivo';
