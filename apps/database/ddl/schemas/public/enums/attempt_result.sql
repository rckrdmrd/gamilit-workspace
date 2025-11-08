-- Nombre: attempt_result
-- Descripción: Resultados posibles de intentos de ejercicios
-- Schema: public
-- Fuente: SA-DB-005

CREATE TYPE public.attempt_result AS ENUM (
    'correct',
    'incorrect',
    'partial',
    'skipped'
);
