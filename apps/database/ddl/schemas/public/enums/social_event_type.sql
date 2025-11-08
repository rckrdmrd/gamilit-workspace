-- Nombre: social_event_type
-- Descripción: Tipos de eventos sociales y competencias
-- Schema: public
-- Fuente: SA-DB-005

CREATE TYPE public.social_event_type AS ENUM (
    'competition',
    'collaboration',
    'challenge',
    'tournament',
    'workshop'
);
