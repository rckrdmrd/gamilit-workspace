-- Nombre: aggregation_period
-- Descripción: Períodos de agregación para métricas y estadísticas
-- Schema: public
-- Fuente: SA-DB-005

CREATE TYPE public.aggregation_period AS ENUM (
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly'
);
