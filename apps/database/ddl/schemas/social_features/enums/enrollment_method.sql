-- =====================================================
-- ENUM: social_features.enrollment_method
-- Descripcion: Metodos de inscripcion a aulas
-- Creado: 2026-01-07
-- Sincronizado con: backend/src/shared/constants/enums.constants.ts
-- =====================================================

DO $$ BEGIN
    CREATE TYPE social_features.enrollment_method AS ENUM (
        'teacher_invite',   -- Invitacion directa del profesor
        'self_enroll',      -- Auto-inscripcion del estudiante
        'admin_add',        -- Agregado por administrador
        'bulk_import'       -- Importacion masiva (CSV/Excel)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE social_features.enrollment_method IS 'Metodos de inscripcion a aulas virtuales (v1.0 - 2026-01-07)';
