-- =====================================================
-- ENUM: educational_content.difficulty_level
-- Descripción: 8 niveles de dificultad para contenido educativo
-- Documentación: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-EDUCATIONAL.md
-- Epic: EAI-002
-- Created: 2025-11-08
-- =====================================================

CREATE TYPE educational_content.difficulty_level AS ENUM (
    'very_easy',      -- Muy fácil, introductorio
    'easy',           -- Fácil, simple
    'beginner',       -- Principiante, para nuevos usuarios
    'medium',         -- Medio, dificultad estándar
    'intermediate',   -- Intermedio, requiere conocimiento previo
    'hard',           -- Difícil, desafiante
    'advanced',       -- Avanzado, para usuarios experimentados
    'very_hard'       -- Muy difícil, nivel experto
);

COMMENT ON TYPE educational_content.difficulty_level IS
'8 niveles de dificultad en orden ascendente: very_easy → easy → beginner → medium → intermediate → hard → advanced → very_hard.
Sincronizado con backend DifficultyLevelEnum (apps/backend/src/shared/constants/enums.constants.ts).
Usado en: modules, exercises, content_templates, marie_curie_content, achievements.';
