-- Nombre: metric_type
-- Descripción: Tipos de métricas para análisis y seguimiento
-- Schema: public
-- Fuente: SA-DB-005

CREATE TYPE public.metric_type AS ENUM (
    'engagement',
    'performance',
    'completion',
    'time_spent',
    'accuracy',
    'streak',
    'social_interaction'
);
