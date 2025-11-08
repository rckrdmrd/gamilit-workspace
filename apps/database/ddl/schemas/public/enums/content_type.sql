-- Nombre: content_type
-- Descripción: Tipos de contenido educativo
-- Schema: public
-- Fuente: SA-DB-005

CREATE TYPE public.content_type AS ENUM (
    'video',
    'text',
    'interactive',
    'quiz',
    'game',
    'simulation'
);
