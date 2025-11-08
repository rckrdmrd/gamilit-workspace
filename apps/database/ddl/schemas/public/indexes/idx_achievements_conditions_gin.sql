-- Índice: idx_achievements_conditions_gin
-- Tabla: gamification_system
-- Schema: public

CREATE INDEX idx_achievements_conditions_gin ON gamification_system.achievements USING GIN(conditions);