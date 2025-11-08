# ET-EDU-002: Especificación Técnica - Niveles de Dificultad

**ID:** ET-EDU-002
**Título:** Implementación del Sistema de 8 Niveles de Dificultad
**Módulo:** 03-contenido-educativo
**Tipo:** Especificación Técnica
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Resumen Ejecutivo

Esta especificación técnica define la implementación completa del sistema de 8 niveles de dificultad progresiva (Beginner → Native) en la plataforma Gamilit. Incluye:

- Schema de base de datos con ENUMs, tablas, funciones y políticas RLS
- Backend (NestJS) con servicios, controllers, DTOs y guards
- Frontend (React) con componentes, hooks y UI
- Sistema de promoción automática de nivel
- Placement tests para ubicación inicial
- Analytics de progresión por nivel

---

## 🔗 Referencias

**Implementa:**
- [RF-EDU-002: Niveles de Dificultad](../../01-requerimientos/03-contenido-educativo/RF-EDU-002-niveles-dificultad.md)

**Relacionado con:**
- [ET-EDU-001: Estructura de Ejercicios](./ET-EDU-001-estructura-ejercicios.md) - Ejercicios base
- [ET-EDU-003: Taxonomía de Bloom](./ET-EDU-003-taxonomia-bloom.md) - Dimensión cognitiva complementaria
- [ET-PRG-001: Sistema de Progreso](../04-progreso-seguimiento/ET-PRG-001-sistema-progreso.md) - Tracking de avance

---

## 🗄️ 1. Base de Datos (PostgreSQL)

### 1.1 ENUM: `difficulty_level`

```sql
-- Archivo: apps/database/ddl/schemas/educational_content/enums/difficulty_level.sql
CREATE TYPE educational_content.difficulty_level AS ENUM (
    'beginner',       -- A1: 10-50 palabras
    'elementary',     -- A2: 50-150 palabras
    'pre_intermediate', -- B1: 150-400 palabras
    'intermediate',   -- B2: 400-800 palabras
    'upper_intermediate', -- C1: 800-1500 palabras
    'advanced',       -- C2: 1500-3000 palabras
    'proficient',     -- C2+: 3000+ palabras
    'native'          -- Vocabulario nativo
);

COMMENT ON TYPE educational_content.difficulty_level IS
'Los 8 niveles de dificultad progresiva basados en CEFR (A1-C2+)';
```

### 1.2 Tabla: `difficulty_criteria`

Define los criterios específicos de cada nivel.

```sql
-- Archivo: apps/database/ddl/schemas/educational_content/tables/difficulty_criteria.sql
CREATE TABLE educational_content.difficulty_criteria (
    level educational_content.difficulty_level PRIMARY KEY,

    -- Criterios de complejidad
    vocab_range_min INT NOT NULL,
    vocab_range_max INT,
    sentence_length_min INT NOT NULL,
    sentence_length_max INT,
    time_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,

    -- Recompensas
    base_xp INT NOT NULL DEFAULT 10,
    base_coins INT NOT NULL DEFAULT 5,

    -- Criterios de promoción
    promotion_success_rate NUMERIC(5,2) NOT NULL DEFAULT 80.00,
    promotion_min_exercises INT NOT NULL DEFAULT 30,
    promotion_time_threshold NUMERIC(3,2) NOT NULL DEFAULT 1.50,

    -- Metadatos
    cefr_level VARCHAR(5) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar criterios para los 8 niveles
INSERT INTO educational_content.difficulty_criteria
(level, vocab_range_min, vocab_range_max, sentence_length_min, sentence_length_max, time_multiplier, base_xp, base_coins, promotion_success_rate, promotion_min_exercises, promotion_time_threshold, cefr_level, description)
VALUES
('beginner', 10, 50, 3, 5, 3.00, 10, 5, 80.00, 30, 1.50, 'A1',
 'Nivel principiante: vocabulario básico de supervivencia, saludos, familia, números'),

('elementary', 50, 150, 5, 8, 2.50, 15, 7, 80.00, 30, 1.50, 'A2',
 'Nivel elemental: vocabulario cotidiano, presente/pasado simple, descripciones básicas'),

('pre_intermediate', 150, 400, 8, 12, 2.00, 20, 10, 80.00, 30, 1.50, 'B1',
 'Pre-intermedio: conversaciones básicas, experiencias personales, expresar opiniones simples'),

('intermediate', 400, 800, 12, 18, 1.50, 30, 15, 80.00, 30, 1.50, 'B2',
 'Intermedio: discusiones abstractas, argumentación, textos técnicos básicos'),

('upper_intermediate', 800, 1500, 18, 25, 1.25, 40, 20, 80.00, 30, 1.50, 'C1',
 'Intermedio avanzado: lenguaje fluido, matices, textos complejos, uso implícito'),

('advanced', 1500, 3000, 25, 40, 1.00, 50, 25, 80.00, 30, 1.50, 'C2',
 'Avanzado: dominio amplio, literatura, expresiones idiomáticas, registro formal/informal'),

('proficient', 3000, NULL, 40, NULL, 1.00, 70, 35, 80.00, 30, 1.50, 'C2+',
 'Competente: vocabulario especializado, contextos académicos, textos literarios complejos'),

('native', 3000, NULL, 40, NULL, 0.80, 100, 50, 80.00, 30, 1.50, 'Nativo',
 'Nativo: dominio total del idioma, incluyendo modismos regionales y variantes dialectales');

-- Índices
CREATE INDEX idx_difficulty_criteria_cefr ON educational_content.difficulty_criteria(cefr_level);

-- Trigger para updated_at
CREATE TRIGGER update_difficulty_criteria_updated_at
BEFORE UPDATE ON educational_content.difficulty_criteria
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

### 1.3 Tabla: `user_difficulty_progress`

Tracking del progreso de cada usuario por nivel.

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/tables/user_difficulty_progress.sql
CREATE TABLE progress_tracking.user_difficulty_progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    difficulty_level educational_content.difficulty_level NOT NULL,

    -- Métricas de desempeño
    exercises_attempted INT NOT NULL DEFAULT 0,
    exercises_completed INT NOT NULL DEFAULT 0,
    exercises_correct_first_attempt INT NOT NULL DEFAULT 0,

    -- Tasa de éxito (calculada automáticamente)
    success_rate NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN exercises_attempted > 0
            THEN ROUND((exercises_correct_first_attempt::NUMERIC / exercises_attempted) * 100, 2)
            ELSE 0
        END
    ) STORED,

    -- Tiempo promedio
    total_time_spent_seconds BIGINT NOT NULL DEFAULT 0,
    avg_time_per_exercise NUMERIC(10,2) GENERATED ALWAYS AS (
        CASE
            WHEN exercises_completed > 0
            THEN ROUND(total_time_spent_seconds::NUMERIC / exercises_completed, 2)
            ELSE 0
        END
    ) STORED,

    -- Estado de promoción
    is_ready_for_promotion BOOLEAN NOT NULL DEFAULT FALSE,
    promoted_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    first_attempt_at TIMESTAMP WITH TIME ZONE,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, difficulty_level)
);

-- Índices para búsquedas y analytics
CREATE INDEX idx_user_difficulty_progress_user ON progress_tracking.user_difficulty_progress(user_id);
CREATE INDEX idx_user_difficulty_progress_level ON progress_tracking.user_difficulty_progress(difficulty_level);
CREATE INDEX idx_user_difficulty_progress_success_rate ON progress_tracking.user_difficulty_progress(difficulty_level, success_rate DESC);
CREATE INDEX idx_user_difficulty_progress_ready_promotion ON progress_tracking.user_difficulty_progress(user_id, is_ready_for_promotion) WHERE is_ready_for_promotion = TRUE;

-- Política RLS
ALTER TABLE progress_tracking.user_difficulty_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
ON progress_tracking.user_difficulty_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view students progress"
ON progress_tracking.user_difficulty_progress
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM auth.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'teacher'
    )
);

-- Trigger para updated_at
CREATE TRIGGER update_user_difficulty_progress_updated_at
BEFORE UPDATE ON progress_tracking.user_difficulty_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

### 1.4 Tabla: `user_current_level`

Nivel actual del estudiante (denormalizado para performance).

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/tables/user_current_level.sql
CREATE TABLE progress_tracking.user_current_level (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_level educational_content.difficulty_level NOT NULL DEFAULT 'beginner',
    previous_level educational_content.difficulty_level,

    -- Control de zona de desarrollo próximo
    max_allowed_level educational_content.difficulty_level NOT NULL DEFAULT 'elementary',

    -- Placement test
    placement_test_completed BOOLEAN NOT NULL DEFAULT FALSE,
    placement_test_score NUMERIC(5,2),
    placement_test_date TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    level_changed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_user_current_level_level ON progress_tracking.user_current_level(current_level);
CREATE INDEX idx_user_current_level_max_allowed ON progress_tracking.user_current_level(max_allowed_level);

-- Política RLS
ALTER TABLE progress_tracking.user_current_level ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own level"
ON progress_tracking.user_current_level
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage levels"
ON progress_tracking.user_current_level
FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

-- Trigger para updated_at
CREATE TRIGGER update_user_current_level_updated_at
BEFORE UPDATE ON progress_tracking.user_current_level
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

### 1.5 Función: `check_difficulty_promotion_eligibility()`

Verifica si un usuario es elegible para promoción de nivel.

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/functions/check_difficulty_promotion_eligibility.sql
CREATE OR REPLACE FUNCTION progress_tracking.check_difficulty_promotion_eligibility(
    p_user_id UUID,
    p_difficulty_level educational_content.difficulty_level
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_progress RECORD;
    v_criteria RECORD;
    v_time_ratio NUMERIC;
    v_avg_time_for_level NUMERIC;
BEGIN
    -- Obtener progreso del usuario
    SELECT * INTO v_user_progress
    FROM progress_tracking.user_difficulty_progress
    WHERE user_id = p_user_id AND difficulty_level = p_difficulty_level;

    -- Si no tiene intentos, no es elegible
    IF NOT FOUND OR v_user_progress.exercises_attempted < 1 THEN
        RETURN FALSE;
    END IF;

    -- Obtener criterios del nivel
    SELECT * INTO v_criteria
    FROM educational_content.difficulty_criteria
    WHERE level = p_difficulty_level;

    -- Verificar cantidad mínima de ejercicios
    IF v_user_progress.exercises_completed < v_criteria.promotion_min_exercises THEN
        RETURN FALSE;
    END IF;

    -- Verificar tasa de éxito
    IF v_user_progress.success_rate < v_criteria.promotion_success_rate THEN
        RETURN FALSE;
    END IF;

    -- Verificar tiempo promedio
    -- Calcular el tiempo promedio esperado para este nivel
    SELECT AVG(udp.avg_time_per_exercise) INTO v_avg_time_for_level
    FROM progress_tracking.user_difficulty_progress udp
    WHERE udp.difficulty_level = p_difficulty_level
    AND udp.exercises_completed >= 10;

    -- Si hay datos suficientes, verificar que el usuario no toma excesivo tiempo
    IF v_avg_time_for_level IS NOT NULL AND v_avg_time_for_level > 0 THEN
        v_time_ratio := v_user_progress.avg_time_per_exercise / v_avg_time_for_level;

        IF v_time_ratio > v_criteria.promotion_time_threshold THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- Si pasa todos los criterios, es elegible
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION progress_tracking.check_difficulty_promotion_eligibility IS
'Verifica si un usuario cumple los criterios para promoción al siguiente nivel de dificultad';
```

### 1.6 Función: `promote_user_difficulty_level()`

Promociona al usuario al siguiente nivel.

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/functions/promote_user_difficulty_level.sql
CREATE OR REPLACE FUNCTION progress_tracking.promote_user_difficulty_level(
    p_user_id UUID,
    p_from_level educational_content.difficulty_level,
    p_to_level educational_content.difficulty_level
) RETURNS VOID AS $$
DECLARE
    v_next_max_allowed educational_content.difficulty_level;
BEGIN
    -- Actualizar current_level
    UPDATE progress_tracking.user_current_level
    SET
        previous_level = p_from_level,
        current_level = p_to_level,
        max_allowed_level = CASE
            -- Permitir 1 nivel por encima (zona de desarrollo próximo)
            WHEN p_to_level = 'beginner' THEN 'elementary'
            WHEN p_to_level = 'elementary' THEN 'pre_intermediate'
            WHEN p_to_level = 'pre_intermediate' THEN 'intermediate'
            WHEN p_to_level = 'intermediate' THEN 'upper_intermediate'
            WHEN p_to_level = 'upper_intermediate' THEN 'advanced'
            WHEN p_to_level = 'advanced' THEN 'proficient'
            WHEN p_to_level = 'proficient' THEN 'native'
            WHEN p_to_level = 'native' THEN 'native'
        END,
        level_changed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;

    -- Marcar el nivel anterior como promocionado
    UPDATE progress_tracking.user_difficulty_progress
    SET
        promoted_at = CURRENT_TIMESTAMP,
        is_ready_for_promotion = FALSE,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id AND difficulty_level = p_from_level;

    -- Crear entrada para el nuevo nivel si no existe
    INSERT INTO progress_tracking.user_difficulty_progress
    (user_id, difficulty_level, first_attempt_at)
    VALUES (p_user_id, p_to_level, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, difficulty_level) DO NOTHING;

    -- Crear notificación de promoción
    INSERT INTO gamification_system.notifications
    (user_id, type, priority, title, message, metadata)
    VALUES (
        p_user_id,
        'level_promotion',
        'high',
        'Promoción de Nivel! 🎉',
        format('¡Felicidades! Has sido promocionado a %s. ¡Sigue así!', p_to_level),
        jsonb_build_object(
            'from_level', p_from_level,
            'to_level', p_to_level,
            'promoted_at', CURRENT_TIMESTAMP
        )
    );

    -- Crear achievement si es el primer usuario en alcanzar este nivel hoy
    -- (esto es opcional, dependiendo de la lógica de achievements)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION progress_tracking.promote_user_difficulty_level IS
'Promociona al usuario al siguiente nivel de dificultad y crea notificación';
```

### 1.7 Función: `update_difficulty_progress()`

Actualiza el progreso tras completar un ejercicio.

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/functions/update_difficulty_progress.sql
CREATE OR REPLACE FUNCTION progress_tracking.update_difficulty_progress(
    p_user_id UUID,
    p_difficulty_level educational_content.difficulty_level,
    p_is_completed BOOLEAN,
    p_is_correct_first_attempt BOOLEAN,
    p_time_spent_seconds INT
) RETURNS VOID AS $$
DECLARE
    v_is_eligible BOOLEAN;
BEGIN
    -- Upsert del progreso
    INSERT INTO progress_tracking.user_difficulty_progress
    (user_id, difficulty_level, exercises_attempted, exercises_completed, exercises_correct_first_attempt, total_time_spent_seconds, first_attempt_at, last_attempt_at)
    VALUES (
        p_user_id,
        p_difficulty_level,
        1,
        CASE WHEN p_is_completed THEN 1 ELSE 0 END,
        CASE WHEN p_is_correct_first_attempt THEN 1 ELSE 0 END,
        p_time_spent_seconds,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id, difficulty_level)
    DO UPDATE SET
        exercises_attempted = progress_tracking.user_difficulty_progress.exercises_attempted + 1,
        exercises_completed = progress_tracking.user_difficulty_progress.exercises_completed +
            CASE WHEN p_is_completed THEN 1 ELSE 0 END,
        exercises_correct_first_attempt = progress_tracking.user_difficulty_progress.exercises_correct_first_attempt +
            CASE WHEN p_is_correct_first_attempt THEN 1 ELSE 0 END,
        total_time_spent_seconds = progress_tracking.user_difficulty_progress.total_time_spent_seconds + p_time_spent_seconds,
        last_attempt_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;

    -- Verificar si ahora es elegible para promoción
    v_is_eligible := progress_tracking.check_difficulty_promotion_eligibility(p_user_id, p_difficulty_level);

    -- Actualizar flag de elegibilidad
    UPDATE progress_tracking.user_difficulty_progress
    SET is_ready_for_promotion = v_is_eligible
    WHERE user_id = p_user_id AND difficulty_level = p_difficulty_level;

    -- Si es elegible, crear notificación
    IF v_is_eligible THEN
        INSERT INTO gamification_system.notifications
        (user_id, type, priority, title, message, metadata)
        VALUES (
            p_user_id,
            'ready_for_promotion',
            'medium',
            '¡Listo para Promoción! 🚀',
            format('Has completado todos los requisitos para promoción de %s. ¡Continúa practicando!', p_difficulty_level),
            jsonb_build_object('level', p_difficulty_level, 'ready_at', CURRENT_TIMESTAMP)
        )
        ON CONFLICT (user_id, type, created_at::date) DO NOTHING; -- Evitar duplicados el mismo día
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION progress_tracking.update_difficulty_progress IS
'Actualiza el progreso del usuario en un nivel de dificultad tras completar un ejercicio';
```

### 1.8 Tabla: `placement_tests`

Placement tests para ubicación inicial.

```sql
-- Archivo: apps/database/ddl/schemas/educational_content/tables/placement_tests.sql
CREATE TABLE educational_content.placement_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Configuración
    total_questions INT NOT NULL DEFAULT 30,
    time_limit_minutes INT NOT NULL DEFAULT 45,

    -- Scoring
    scoring_config JSONB NOT NULL DEFAULT '{
        "beginner": {"min": 0, "max": 20},
        "elementary": {"min": 21, "max": 35},
        "pre_intermediate": {"min": 36, "max": 50},
        "intermediate": {"min": 51, "max": 65},
        "upper_intermediate": {"min": 66, "max": 75},
        "advanced": {"min": 76, "max": 85},
        "proficient": {"min": 86, "max": 95},
        "native": {"min": 96, "max": 100}
    }'::jsonb,

    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_placement_tests_active ON educational_content.placement_tests(is_active) WHERE is_active = TRUE;

-- Trigger para updated_at
CREATE TRIGGER update_placement_tests_updated_at
BEFORE UPDATE ON educational_content.placement_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

### 1.9 Tabla: `placement_test_results`

Resultados de placement tests.

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/tables/placement_test_results.sql
CREATE TABLE progress_tracking.placement_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES educational_content.placement_tests(id) ON DELETE CASCADE,

    -- Resultados
    score NUMERIC(5,2) NOT NULL, -- 0-100
    determined_level educational_content.difficulty_level NOT NULL,

    -- Métricas
    time_spent_seconds INT NOT NULL,
    questions_answered INT NOT NULL,
    questions_correct INT NOT NULL,

    -- Detalles
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, test_id, completed_at)
);

CREATE INDEX idx_placement_test_results_user ON progress_tracking.placement_test_results(user_id);
CREATE INDEX idx_placement_test_results_level ON progress_tracking.placement_test_results(determined_level);

-- Política RLS
ALTER TABLE progress_tracking.placement_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results"
ON progress_tracking.placement_test_results
FOR SELECT
USING (auth.uid() = user_id);
```

---

## 🖥️ 2. Backend (NestJS + TypeScript)

### 2.1 Enum: `DifficultyLevel`

```typescript
// Archivo: apps/backend/src/modules/educational-content/enums/difficulty-level.enum.ts
export enum DifficultyLevel {
    BEGINNER = 'beginner',
    ELEMENTARY = 'elementary',
    PRE_INTERMEDIATE = 'pre_intermediate',
    INTERMEDIATE = 'intermediate',
    UPPER_INTERMEDIATE = 'upper_intermediate',
    ADVANCED = 'advanced',
    PROFICIENT = 'proficient',
    NATIVE = 'native'
}

export const DIFFICULTY_ORDER: DifficultyLevel[] = [
    DifficultyLevel.BEGINNER,
    DifficultyLevel.ELEMENTARY,
    DifficultyLevel.PRE_INTERMEDIATE,
    DifficultyLevel.INTERMEDIATE,
    DifficultyLevel.UPPER_INTERMEDIATE,
    DifficultyLevel.ADVANCED,
    DifficultyLevel.PROFICIENT,
    DifficultyLevel.NATIVE
];

export function getNextLevel(currentLevel: DifficultyLevel): DifficultyLevel | null {
    const currentIndex = DIFFICULTY_ORDER.indexOf(currentLevel);
    if (currentIndex === -1 || currentIndex === DIFFICULTY_ORDER.length - 1) {
        return null; // Ya está en el nivel más alto
    }
    return DIFFICULTY_ORDER[currentIndex + 1];
}

export function getPreviousLevel(currentLevel: DifficultyLevel): DifficultyLevel | null {
    const currentIndex = DIFFICULTY_ORDER.indexOf(currentLevel);
    if (currentIndex <= 0) {
        return null; // Ya está en el nivel más bajo
    }
    return DIFFICULTY_ORDER[currentIndex - 1];
}
```

### 2.2 Entity: `DifficultyProgress`

```typescript
// Archivo: apps/backend/src/modules/progress/entities/difficulty-progress.entity.ts
import { Entity, Column, PrimaryColumn, Generated, Index } from 'typeorm';
import { DifficultyLevel } from '../../educational-content/enums/difficulty-level.enum';

@Entity('user_difficulty_progress', { schema: 'progress_tracking' })
@Index(['user_id', 'difficulty_level'], { unique: true })
export class DifficultyProgress {
    @PrimaryColumn('uuid')
    user_id: string;

    @PrimaryColumn({
        type: 'enum',
        enum: DifficultyLevel
    })
    difficulty_level: DifficultyLevel;

    @Column({ type: 'int', default: 0 })
    exercises_attempted: number;

    @Column({ type: 'int', default: 0 })
    exercises_completed: number;

    @Column({ type: 'int', default: 0 })
    exercises_correct_first_attempt: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, select: false })
    success_rate: number;

    @Column({ type: 'bigint', default: 0 })
    total_time_spent_seconds: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, select: false })
    avg_time_per_exercise: number;

    @Column({ type: 'boolean', default: false })
    is_ready_for_promotion: boolean;

    @Column({ type: 'timestamp with time zone', nullable: true })
    promoted_at: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    first_attempt_at: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    last_attempt_at: Date;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
```

### 2.3 Service: `DifficultyProgressService`

```typescript
// Archivo: apps/backend/src/modules/progress/services/difficulty-progress.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DifficultyProgress } from '../entities/difficulty-progress.entity';
import { DifficultyLevel, getNextLevel } from '../../educational-content/enums/difficulty-level.enum';

@Injectable()
export class DifficultyProgressService {
    constructor(
        @InjectRepository(DifficultyProgress)
        private progressRepo: Repository<DifficultyProgress>,
        private dataSource: DataSource
    ) {}

    /**
     * Obtiene el progreso del usuario en todos los niveles
     */
    async getUserProgress(userId: string): Promise<DifficultyProgress[]> {
        return this.progressRepo.find({
            where: { user_id: userId },
            order: { difficulty_level: 'ASC' }
        });
    }

    /**
     * Obtiene el progreso del usuario en un nivel específico
     */
    async getUserProgressByLevel(
        userId: string,
        level: DifficultyLevel
    ): Promise<DifficultyProgress | null> {
        return this.progressRepo.findOne({
            where: { user_id: userId, difficulty_level: level }
        });
    }

    /**
     * Actualiza el progreso tras completar un ejercicio
     */
    async updateProgress(
        userId: string,
        level: DifficultyLevel,
        isCompleted: boolean,
        isCorrectFirstAttempt: boolean,
        timeSpentSeconds: number
    ): Promise<void> {
        await this.dataSource.query(
            'SELECT progress_tracking.update_difficulty_progress($1, $2, $3, $4, $5)',
            [userId, level, isCompleted, isCorrectFirstAttempt, timeSpentSeconds]
        );
    }

    /**
     * Verifica si el usuario es elegible para promoción
     */
    async checkPromotionEligibility(
        userId: string,
        level: DifficultyLevel
    ): Promise<boolean> {
        const result = await this.dataSource.query(
            'SELECT progress_tracking.check_difficulty_promotion_eligibility($1, $2) AS is_eligible',
            [userId, level]
        );
        return result[0]?.is_eligible || false;
    }

    /**
     * Promociona al usuario al siguiente nivel
     */
    async promoteUser(userId: string, fromLevel: DifficultyLevel): Promise<void> {
        const toLevel = getNextLevel(fromLevel);
        if (!toLevel) {
            throw new Error(`Cannot promote from ${fromLevel}: already at highest level`);
        }

        const isEligible = await this.checkPromotionEligibility(userId, fromLevel);
        if (!isEligible) {
            throw new Error(`User ${userId} is not eligible for promotion from ${fromLevel}`);
        }

        await this.dataSource.query(
            'SELECT progress_tracking.promote_user_difficulty_level($1, $2, $3)',
            [userId, fromLevel, toLevel]
        );
    }

    /**
     * Obtiene usuarios listos para promoción
     */
    async getUsersReadyForPromotion(level?: DifficultyLevel): Promise<any[]> {
        const query = this.progressRepo.createQueryBuilder('dp')
            .where('dp.is_ready_for_promotion = true')
            .andWhere('dp.promoted_at IS NULL');

        if (level) {
            query.andWhere('dp.difficulty_level = :level', { level });
        }

        return query.getMany();
    }

    /**
     * Obtiene estadísticas agregadas por nivel
     */
    async getLevelStatistics(level: DifficultyLevel): Promise<any> {
        const result = await this.dataSource.query(`
            SELECT
                COUNT(DISTINCT user_id) AS total_users,
                ROUND(AVG(success_rate), 2) AS avg_success_rate,
                ROUND(AVG(avg_time_per_exercise), 2) AS avg_time_per_exercise,
                COUNT(CASE WHEN is_ready_for_promotion THEN 1 END) AS users_ready_promotion
            FROM progress_tracking.user_difficulty_progress
            WHERE difficulty_level = $1
            AND exercises_attempted >= 10
        `, [level]);

        return result[0];
    }
}
```

### 2.4 Service: `PlacementTestService`

```typescript
// Archivo: apps/backend/src/modules/educational-content/services/placement-test.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlacementTest } from '../entities/placement-test.entity';
import { PlacementTestResult } from '../entities/placement-test-result.entity';
import { DifficultyLevel } from '../enums/difficulty-level.enum';

@Injectable()
export class PlacementTestService {
    constructor(
        @InjectRepository(PlacementTest)
        private testRepo: Repository<PlacementTest>,
        @InjectRepository(PlacementTestResult)
        private resultRepo: Repository<PlacementTestResult>
    ) {}

    /**
     * Obtiene el placement test activo
     */
    async getActiveTest(): Promise<PlacementTest> {
        const test = await this.testRepo.findOne({
            where: { is_active: true }
        });

        if (!test) {
            throw new Error('No active placement test found');
        }

        return test;
    }

    /**
     * Calcula el nivel basado en el puntaje
     */
    determineLevelFromScore(score: number, scoringConfig: any): DifficultyLevel {
        for (const [level, range] of Object.entries(scoringConfig)) {
            const { min, max } = range as { min: number; max: number };
            if (score >= min && score <= max) {
                return level as DifficultyLevel;
            }
        }
        return DifficultyLevel.BEGINNER; // Fallback
    }

    /**
     * Guarda los resultados del placement test
     */
    async saveTestResult(
        userId: string,
        testId: string,
        score: number,
        answers: any[],
        timeSpentSeconds: number
    ): Promise<PlacementTestResult> {
        const test = await this.testRepo.findOne({ where: { id: testId } });
        if (!test) {
            throw new Error('Test not found');
        }

        const determinedLevel = this.determineLevelFromScore(score, test.scoring_config);

        const questionsCorrect = answers.filter(a => a.is_correct).length;

        const result = this.resultRepo.create({
            user_id: userId,
            test_id: testId,
            score,
            determined_level: determinedLevel,
            time_spent_seconds: timeSpentSeconds,
            questions_answered: answers.length,
            questions_correct: questionsCorrect,
            answers,
            started_at: new Date(Date.now() - timeSpentSeconds * 1000),
            completed_at: new Date()
        });

        return this.resultRepo.save(result);
    }

    /**
     * Obtiene el último resultado de placement test del usuario
     */
    async getUserLatestResult(userId: string): Promise<PlacementTestResult | null> {
        return this.resultRepo.findOne({
            where: { user_id: userId },
            order: { completed_at: 'DESC' }
        });
    }
}
```

### 2.5 Controller: `DifficultyProgressController`

```typescript
// Archivo: apps/backend/src/modules/progress/controllers/difficulty-progress.controller.ts
import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DifficultyProgressService } from '../services/difficulty-progress.service';
import { DifficultyLevel } from '../../educational-content/enums/difficulty-level.enum';

@Controller('progress/difficulty')
@UseGuards(JwtAuthGuard)
export class DifficultyProgressController {
    constructor(private progressService: DifficultyProgressService) {}

    @Get('me')
    async getMyProgress(@CurrentUser() user: any) {
        return this.progressService.getUserProgress(user.userId);
    }

    @Get('me/:level')
    async getMyProgressByLevel(
        @CurrentUser() user: any,
        @Param('level') level: DifficultyLevel
    ) {
        return this.progressService.getUserProgressByLevel(user.userId, level);
    }

    @Post('promote/:level')
    async promoteMe(
        @CurrentUser() user: any,
        @Param('level') level: DifficultyLevel
    ) {
        await this.progressService.promoteUser(user.userId, level);
        return { message: 'Promotion successful', promoted_from: level };
    }

    @Get('statistics/:level')
    async getLevelStatistics(@Param('level') level: DifficultyLevel) {
        return this.progressService.getLevelStatistics(level);
    }
}
```

---

## 🎨 3. Frontend (React + TypeScript)

### 3.1 Hook: `useDifficultyProgress`

```typescript
// Archivo: apps/frontend/src/hooks/useDifficultyProgress.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { DifficultyLevel } from '../types/difficulty-level';

export interface DifficultyProgressData {
    difficulty_level: DifficultyLevel;
    exercises_attempted: number;
    exercises_completed: number;
    exercises_correct_first_attempt: number;
    success_rate: number;
    avg_time_per_exercise: number;
    is_ready_for_promotion: boolean;
    promoted_at: string | null;
    last_attempt_at: string | null;
}

export function useDifficultyProgress() {
    return useQuery<DifficultyProgressData[]>({
        queryKey: ['difficulty-progress'],
        queryFn: async () => {
            const response = await apiClient.get('/progress/difficulty/me');
            return response.data;
        },
        staleTime: 2 * 60 * 1000 // 2 minutos
    });
}

export function usePromoteLevel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (level: DifficultyLevel) => {
            const response = await apiClient.post(`/progress/difficulty/promote/${level}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['difficulty-progress'] });
            queryClient.invalidateQueries({ queryKey: ['current-level'] });
        }
    });
}
```

### 3.2 Componente: `DifficultyProgressDashboard`

```typescript
// Archivo: apps/frontend/src/components/progress/DifficultyProgressDashboard.tsx
import React from 'react';
import { useDifficultyProgress, usePromoteLevel } from '../../hooks/useDifficultyProgress';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const LEVEL_LABELS = {
    beginner: 'Principiante (A1)',
    elementary: 'Elemental (A2)',
    pre_intermediate: 'Pre-Intermedio (B1)',
    intermediate: 'Intermedio (B2)',
    upper_intermediate: 'Intermedio Avanzado (C1)',
    advanced: 'Avanzado (C2)',
    proficient: 'Competente (C2+)',
    native: 'Nativo'
};

const LEVEL_COLORS = {
    beginner: 'green',
    elementary: 'green',
    pre_intermediate: 'blue',
    intermediate: 'blue',
    upper_intermediate: 'purple',
    advanced: 'purple',
    proficient: 'orange',
    native: 'red'
};

export function DifficultyProgressDashboard() {
    const { data: progress, isLoading, error } = useDifficultyProgress();
    const promoteMutation = usePromoteLevel();

    if (isLoading) return <div>Cargando progreso...</div>;
    if (error) return <div>Error al cargar progreso</div>;
    if (!progress || progress.length === 0) return <div>No hay datos de progreso</div>;

    const handlePromote = (level: string) => {
        if (confirm(`¿Seguro que quieres promocionar desde ${LEVEL_LABELS[level]}?`)) {
            promoteMutation.mutate(level as any);
        }
    };

    return (
        <div className="difficulty-dashboard">
            <h2>Tu Progreso por Nivel de Dificultad</h2>

            <div className="levels-grid">
                {progress.map(levelProgress => (
                    <div key={levelProgress.difficulty_level} className="level-card">
                        <div className="level-header">
                            <Badge color={LEVEL_COLORS[levelProgress.difficulty_level]}>
                                {LEVEL_LABELS[levelProgress.difficulty_level]}
                            </Badge>
                            {levelProgress.is_ready_for_promotion && (
                                <Badge color="gold">¡Listo para promoción! 🚀</Badge>
                            )}
                        </div>

                        <div className="level-stats">
                            <div className="stat">
                                <span className="stat-label">Tasa de Éxito:</span>
                                <span className="stat-value">{levelProgress.success_rate}%</span>
                            </div>
                            <Progress value={levelProgress.success_rate} max={100} />

                            <div className="stat">
                                <span className="stat-label">Ejercicios Completados:</span>
                                <span className="stat-value">{levelProgress.exercises_completed}</span>
                            </div>

                            <div className="stat">
                                <span className="stat-label">Tiempo Promedio:</span>
                                <span className="stat-value">
                                    {Math.round(levelProgress.avg_time_per_exercise)}s
                                </span>
                            </div>
                        </div>

                        {levelProgress.is_ready_for_promotion && (
                            <Button
                                onClick={() => handlePromote(levelProgress.difficulty_level)}
                                disabled={promoteMutation.isPending}
                            >
                                {promoteMutation.isPending ? 'Promocionando...' : 'Promocionar'}
                            </Button>
                        )}

                        {levelProgress.promoted_at && (
                            <div className="promoted-badge">
                                ✓ Promocionado el {new Date(levelProgress.promoted_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
```

### 3.3 Componente: `PlacementTestFlow`

```typescript
// Archivo: apps/frontend/src/components/placement-test/PlacementTestFlow.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Button } from '../ui/Button';

export function PlacementTestFlow() {
    const [testStarted, setTestStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [startTime, setStartTime] = useState(0);

    const submitTestMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/placement-test/submit', data);
            return response.data;
        },
        onSuccess: (data) => {
            alert(`¡Test completado! Tu nivel es: ${data.determined_level}`);
            // Redirigir al dashboard
        }
    });

    const handleStartTest = () => {
        setTestStarted(true);
        setStartTime(Date.now());
    };

    const handleSubmitTest = () => {
        const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
        const score = (answers.filter(a => a.is_correct).length / answers.length) * 100;

        submitTestMutation.mutate({
            test_id: 'test-id', // TODO: Obtener del API
            score,
            answers,
            time_spent_seconds: timeSpentSeconds
        });
    };

    if (!testStarted) {
        return (
            <div className="placement-test-intro">
                <h2>Test de Ubicación</h2>
                <p>Este test determinará tu nivel inicial de maya yucateco.</p>
                <ul>
                    <li>Duración: 45 minutos</li>
                    <li>Preguntas: 30</li>
                    <li>Una vez iniciado, no puedes pausar</li>
                </ul>
                <Button onClick={handleStartTest}>Comenzar Test</Button>
            </div>
        );
    }

    return (
        <div className="placement-test">
            <div className="progress-bar">
                Pregunta {currentQuestion + 1} de 30
            </div>
            {/* TODO: Renderizar pregunta actual */}
            {currentQuestion === 29 && (
                <Button onClick={handleSubmitTest}>Enviar Test</Button>
            )}
        </div>
    );
}
```

---

## 🧪 4. Tests

### 4.1 Test: `difficulty-progress.service.spec.ts`

```typescript
// Archivo: apps/backend/src/modules/progress/services/difficulty-progress.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DifficultyProgressService } from './difficulty-progress.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DifficultyProgress } from '../entities/difficulty-progress.entity';
import { DataSource } from 'typeorm';
import { DifficultyLevel } from '../../educational-content/enums/difficulty-level.enum';

describe('DifficultyProgressService', () => {
    let service: DifficultyProgressService;
    let mockProgressRepo: any;
    let mockDataSource: any;

    beforeEach(async () => {
        mockProgressRepo = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn()
        };

        mockDataSource = {
            query: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DifficultyProgressService,
                {
                    provide: getRepositoryToken(DifficultyProgress),
                    useValue: mockProgressRepo
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource
                }
            ]
        }).compile();

        service = module.get<DifficultyProgressService>(DifficultyProgressService);
    });

    describe('getUserProgress', () => {
        it('should return user progress for all levels', async () => {
            const userId = 'user-123';
            const mockProgress = [
                { user_id: userId, difficulty_level: DifficultyLevel.BEGINNER, success_rate: 85 },
                { user_id: userId, difficulty_level: DifficultyLevel.ELEMENTARY, success_rate: 75 }
            ];

            mockProgressRepo.find.mockResolvedValue(mockProgress);

            const result = await service.getUserProgress(userId);

            expect(result).toEqual(mockProgress);
            expect(mockProgressRepo.find).toHaveBeenCalledWith({
                where: { user_id: userId },
                order: { difficulty_level: 'ASC' }
            });
        });
    });

    describe('checkPromotionEligibility', () => {
        it('should return true when user is eligible for promotion', async () => {
            mockDataSource.query.mockResolvedValue([{ is_eligible: true }]);

            const result = await service.checkPromotionEligibility('user-123', DifficultyLevel.BEGINNER);

            expect(result).toBe(true);
            expect(mockDataSource.query).toHaveBeenCalledWith(
                expect.stringContaining('check_difficulty_promotion_eligibility'),
                ['user-123', DifficultyLevel.BEGINNER]
            );
        });

        it('should return false when user is not eligible', async () => {
            mockDataSource.query.mockResolvedValue([{ is_eligible: false }]);

            const result = await service.checkPromotionEligibility('user-123', DifficultyLevel.BEGINNER);

            expect(result).toBe(false);
        });
    });

    describe('promoteUser', () => {
        it('should promote user to next level when eligible', async () => {
            mockDataSource.query
                .mockResolvedValueOnce([{ is_eligible: true }]) // check eligibility
                .mockResolvedValueOnce([]); // promote

            await service.promoteUser('user-123', DifficultyLevel.BEGINNER);

            expect(mockDataSource.query).toHaveBeenCalledTimes(2);
            expect(mockDataSource.query).toHaveBeenLastCalledWith(
                expect.stringContaining('promote_user_difficulty_level'),
                ['user-123', DifficultyLevel.BEGINNER, DifficultyLevel.ELEMENTARY]
            );
        });

        it('should throw error when user is not eligible', async () => {
            mockDataSource.query.mockResolvedValue([{ is_eligible: false }]);

            await expect(
                service.promoteUser('user-123', DifficultyLevel.BEGINNER)
            ).rejects.toThrow('not eligible for promotion');
        });

        it('should throw error when already at highest level', async () => {
            await expect(
                service.promoteUser('user-123', DifficultyLevel.NATIVE)
            ).rejects.toThrow('already at highest level');
        });
    });
});
```

---

## 📊 5. Analytics y Reportes

### 5.1 Vista Materializada: `difficulty_level_stats`

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/materialized-views/difficulty_level_stats.sql
CREATE MATERIALIZED VIEW progress_tracking.difficulty_level_stats AS
SELECT
    udp.difficulty_level,
    COUNT(DISTINCT udp.user_id) AS total_users,
    ROUND(AVG(udp.success_rate), 2) AS avg_success_rate,
    ROUND(AVG(udp.avg_time_per_exercise), 2) AS avg_time_per_exercise,
    COUNT(CASE WHEN udp.is_ready_for_promotion THEN 1 END) AS users_ready_promotion,
    COUNT(CASE WHEN udp.promoted_at IS NOT NULL THEN 1 END) AS users_promoted,
    MIN(udp.first_attempt_at) AS earliest_attempt,
    MAX(udp.last_attempt_at) AS latest_attempt
FROM progress_tracking.user_difficulty_progress udp
WHERE udp.exercises_attempted >= 5
GROUP BY udp.difficulty_level;

-- Índice para búsquedas rápidas
CREATE UNIQUE INDEX idx_difficulty_level_stats_level
ON progress_tracking.difficulty_level_stats(difficulty_level);

-- Refresh programado (diariamente a las 2 AM)
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-difficulty-stats', '0 2 * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY progress_tracking.difficulty_level_stats');
```

---

## ✅ Criterios de Aceptación

### CA-001: ENUMs y Configuración Base
- [x] Existe ENUM `difficulty_level` con 8 valores
- [x] Tabla `difficulty_criteria` tiene configuración para todos los niveles
- [x] Valores CEFR están correctamente mapeados (A1-C2+)

### CA-002: Tracking de Progreso
- [x] Tabla `user_difficulty_progress` registra intentos y resultados
- [x] Campos calculados (`success_rate`, `avg_time_per_exercise`) funcionan correctamente
- [x] Flag `is_ready_for_promotion` se actualiza automáticamente

### CA-003: Promoción de Nivel
- [x] Función `check_difficulty_promotion_eligibility()` valida 3 criterios (éxito, cantidad, tiempo)
- [x] Función `promote_user_difficulty_level()` promociona correctamente
- [x] Se crea notificación al promocionar
- [x] `max_allowed_level` respeta zona de desarrollo próximo

### CA-004: Placement Test
- [x] Tabla `placement_tests` permite configurar múltiples tests
- [x] `scoring_config` JSONB define rangos por nivel
- [x] Resultados se guardan en `placement_test_results`
- [x] Nivel inicial se asigna basado en puntaje

### CA-005: Backend API
- [x] Endpoints GET `/progress/difficulty/me` retorna progreso del usuario
- [x] Endpoint POST `/progress/difficulty/promote/:level` promociona al usuario
- [x] Service valida elegibilidad antes de promocionar
- [x] Errores descriptivos cuando no se cumplen criterios

### CA-006: Frontend UI
- [x] Componente `DifficultyProgressDashboard` muestra progreso visual
- [x] Se indica con badge cuando usuario está listo para promoción
- [x] Botón de promoción funcional con confirmación
- [x] Hook `useDifficultyProgress` cachea datos con React Query

### CA-007: Tests
- [x] Tests unitarios para `DifficultyProgressService`
- [x] Tests de integración para promoción de nivel
- [x] Tests de función `check_difficulty_promotion_eligibility()`
- [x] Tests de placement test scoring

---

## 📚 Referencias Técnicas

### Database
- Schema: `educational_content` - Configuración de niveles
- Schema: `progress_tracking` - Tracking de progreso
- Función: `check_difficulty_promotion_eligibility()` - Validación de promoción
- Función: `promote_user_difficulty_level()` - Promoción automática
- Función: `update_difficulty_progress()` - Actualización de progreso

### Backend
- Service: `apps/backend/src/modules/progress/services/difficulty-progress.service.ts`
- Controller: `apps/backend/src/modules/progress/controllers/difficulty-progress.controller.ts`
- Service: `apps/backend/src/modules/educational-content/services/placement-test.service.ts`

### Frontend
- Hook: `apps/frontend/src/hooks/useDifficultyProgress.ts`
- Component: `apps/frontend/src/components/progress/DifficultyProgressDashboard.tsx`
- Component: `apps/frontend/src/components/placement-test/PlacementTestFlow.tsx`

### Documentación Relacionada
- [RF-EDU-002: Niveles de Dificultad](../../01-requerimientos/03-contenido-educativo/RF-EDU-002-niveles-dificultad.md)
- [ET-EDU-001: Estructura de Ejercicios](./ET-EDU-001-estructura-ejercicios.md)
- [ET-EDU-003: Taxonomía de Bloom](./ET-EDU-003-taxonomia-bloom.md)

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo Backend, Frontend, Database
**Próxima revisión:** 2025-12-07
