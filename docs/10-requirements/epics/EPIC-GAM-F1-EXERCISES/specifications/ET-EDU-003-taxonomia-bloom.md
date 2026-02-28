---
titulo: "ET-EDU-003: Especificación Técnica - Taxonomía de Bloom"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-EDU-003: Especificación Técnica - Taxonomía de Bloom

**ID:** ET-EDU-003
**Título:** Implementación de Clasificación Cognitiva según Bloom
**Módulo:** 03-contenido-educativo
**Tipo:** Especificación Técnica
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Resumen Ejecutivo

Esta especificación técnica define la implementación completa del sistema de clasificación cognitiva basado en la Taxonomía de Bloom Revisada (6 niveles: Remember → Create) en la plataforma Gamilit. Incluye:

- Schema de base de datos con ENUMs, tablas de analytics, funciones y políticas RLS
- Backend (NestJS) con servicios de analytics cognitivos, filtrado y recomendaciones
- Frontend (React) con visualización de perfil cognitivo y progreso LOTS/HOTS
- Sistema de gamificación con achievements específicos por nivel cognitivo
- Integración con sistema de dificultad (ET-EDU-002) para complejidad multidimensional

---

## 🔗 Referencias

**Implementa:**
- [RF-EDU-003: Taxonomía de Bloom](../requirements/RF-EDU-003-taxonomia-bloom.md)

**Relacionado con:**
- [ET-EDU-001: Estructura de Ejercicios](./ET-EDU-001-estructura-ejercicios.md) - Ejercicios base
- [ET-EDU-002: Niveles de Dificultad](./ET-EDU-002-niveles-dificultad.md) - Dimensión de dificultad complementaria
- [ET-GAM-001: Sistema de Achievements](../../EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-001-achievements.md) - Achievements cognitivos

---

## 🗄️ 1. Base de Datos (PostgreSQL)

### 1.1 ENUM: `bloom_level`

```sql
-- Archivo: apps/database/ddl/schemas/educational_content/enums/bloom_level.sql
CREATE TYPE educational_content.bloom_level AS ENUM (
    'remember',      -- Recordar: recuperar información de la memoria
    'understand',    -- Comprender: construir significado, interpretar
    'apply',         -- Aplicar: usar información en situaciones nuevas
    'analyze',       -- Analizar: descomponer en partes, encontrar relaciones
    'evaluate',      -- Evaluar: hacer juicios basados en criterios
    'create'         -- Crear: reunir elementos para formar un todo original
);

COMMENT ON TYPE educational_content.bloom_level IS
'Los 6 niveles de la Taxonomía de Bloom Revisada (Anderson & Krathwohl, 2001)';
```

### 1.2 Modificación: Agregar columna a `exercises`

```sql
-- Archivo: apps/database/ddl/schemas/educational_content/tables/exercises.sql (modificación)

-- Agregar columna bloom_level a la tabla exercises
ALTER TABLE educational_content.exercises
ADD COLUMN bloom_level educational_content.bloom_level NOT NULL DEFAULT 'remember';

COMMENT ON COLUMN educational_content.exercises.bloom_level IS
'Nivel cognitivo del ejercicio según Taxonomía de Bloom';

-- Índice para búsquedas y filtrado
CREATE INDEX idx_exercises_bloom_level
ON educational_content.exercises(bloom_level);

-- Índice compuesto para búsquedas combinadas (dificultad + bloom)
CREATE INDEX idx_exercises_difficulty_bloom
ON educational_content.exercises(difficulty_level, bloom_level);
```

### 1.3 Tabla: `cognitive_performance`

Tracking del desempeño cognitivo por usuario y nivel de Bloom.

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/tables/cognitive_performance.sql
CREATE TABLE progress_tracking.cognitive_performance (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bloom_level educational_content.bloom_level NOT NULL,

    -- Métricas de desempeño
    exercises_attempted INT NOT NULL DEFAULT 0,
    exercises_correct INT NOT NULL DEFAULT 0,

    -- Tasa de éxito (calculada automáticamente)
    success_rate NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN exercises_attempted > 0
            THEN ROUND((exercises_correct::NUMERIC / exercises_attempted) * 100, 2)
            ELSE 0
        END
    ) STORED,

    -- Tiempo de ejecución
    total_time_spent_seconds BIGINT NOT NULL DEFAULT 0,
    avg_time_per_exercise NUMERIC(10,2) GENERATED ALWAYS AS (
        CASE
            WHEN exercises_attempted > 0
            THEN ROUND(total_time_spent_seconds::NUMERIC / exercises_attempted, 2)
            ELSE 0
        END
    ) STORED,

    -- Timestamps
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, bloom_level)
);

-- Índices
CREATE INDEX idx_cognitive_performance_user ON progress_tracking.cognitive_performance(user_id);
CREATE INDEX idx_cognitive_performance_level ON progress_tracking.cognitive_performance(bloom_level);
CREATE INDEX idx_cognitive_performance_success_rate ON progress_tracking.cognitive_performance(bloom_level, success_rate DESC);

-- Política RLS
ALTER TABLE progress_tracking.cognitive_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cognitive performance"
ON progress_tracking.cognitive_performance
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view students cognitive performance"
ON progress_tracking.cognitive_performance
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM auth.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'teacher'
    )
);

CREATE POLICY "System can manage cognitive performance"
ON progress_tracking.cognitive_performance
FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

-- Trigger para updated_at
CREATE TRIGGER update_cognitive_performance_updated_at
BEFORE UPDATE ON progress_tracking.cognitive_performance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

### 1.4 Función: `update_cognitive_performance()`

Actualiza el desempeño cognitivo tras completar un ejercicio.

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/functions/update_cognitive_performance.sql
CREATE OR REPLACE FUNCTION progress_tracking.update_cognitive_performance(
    p_user_id UUID,
    p_bloom_level educational_content.bloom_level,
    p_is_correct BOOLEAN,
    p_time_spent_seconds INT
) RETURNS VOID AS $$
BEGIN
    -- Upsert del desempeño cognitivo
    INSERT INTO progress_tracking.cognitive_performance
    (user_id, bloom_level, exercises_attempted, exercises_correct, total_time_spent_seconds, last_attempt_at)
    VALUES (
        p_user_id,
        p_bloom_level,
        1,
        CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        p_time_spent_seconds,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id, bloom_level)
    DO UPDATE SET
        exercises_attempted = progress_tracking.cognitive_performance.exercises_attempted + 1,
        exercises_correct = progress_tracking.cognitive_performance.exercises_correct +
            CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        total_time_spent_seconds = progress_tracking.cognitive_performance.total_time_spent_seconds + p_time_spent_seconds,
        last_attempt_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION progress_tracking.update_cognitive_performance IS
'Actualiza el desempeño cognitivo del usuario tras completar un ejercicio';
```

### 1.5 Función: `get_cognitive_profile()`

Obtiene el perfil cognitivo completo del usuario con análisis LOTS/HOTS.

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/functions/get_cognitive_profile.sql
CREATE OR REPLACE FUNCTION progress_tracking.get_cognitive_profile(p_user_id UUID)
RETURNS TABLE(
    bloom_level educational_content.bloom_level,
    success_rate NUMERIC,
    attempts INT,
    correct INT,
    avg_time NUMERIC,
    status TEXT,
    category TEXT  -- 'LOTS', 'MOTS', 'HOTS'
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cp.bloom_level,
        cp.success_rate,
        cp.exercises_attempted,
        cp.exercises_correct,
        cp.avg_time_per_exercise,
        CASE
            WHEN cp.exercises_attempted < 5 THEN 'insufficient_data'
            WHEN cp.success_rate >= 80 THEN 'excellent'
            WHEN cp.success_rate >= 70 THEN 'good'
            WHEN cp.success_rate >= 60 THEN 'needs_practice'
            ELSE 'requires_attention'
        END AS status,
        CASE
            WHEN cp.bloom_level IN ('remember', 'understand') THEN 'LOTS'
            WHEN cp.bloom_level IN ('apply', 'analyze') THEN 'MOTS'
            WHEN cp.bloom_level IN ('evaluate', 'create') THEN 'HOTS'
        END AS category
    FROM progress_tracking.cognitive_performance cp
    WHERE cp.user_id = p_user_id
    ORDER BY
        CASE cp.bloom_level
            WHEN 'remember' THEN 1
            WHEN 'understand' THEN 2
            WHEN 'apply' THEN 3
            WHEN 'analyze' THEN 4
            WHEN 'evaluate' THEN 5
            WHEN 'create' THEN 6
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION progress_tracking.get_cognitive_profile IS
'Obtiene el perfil cognitivo del usuario con análisis LOTS/MOTS/HOTS';
```

### 1.6 Función: `get_weak_cognitive_levels()`

Identifica niveles cognitivos débiles que requieren práctica.

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/functions/get_weak_cognitive_levels.sql
CREATE OR REPLACE FUNCTION progress_tracking.get_weak_cognitive_levels(
    p_user_id UUID,
    p_success_threshold NUMERIC DEFAULT 70.0,
    p_min_attempts INT DEFAULT 5
)
RETURNS TABLE(
    bloom_level educational_content.bloom_level,
    success_rate NUMERIC,
    gap NUMERIC  -- Diferencia con el threshold
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cp.bloom_level,
        cp.success_rate,
        (p_success_threshold - cp.success_rate) AS gap
    FROM progress_tracking.cognitive_performance cp
    WHERE cp.user_id = p_user_id
    AND cp.exercises_attempted >= p_min_attempts
    AND cp.success_rate < p_success_threshold
    ORDER BY cp.success_rate ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION progress_tracking.get_weak_cognitive_levels IS
'Identifica niveles cognitivos con tasa de éxito por debajo del umbral';
```

### 1.7 Vista Materializada: `cognitive_level_distribution`

Distribución de ejercicios por nivel cognitivo en el sistema.

```sql
-- Archivo: apps/database/ddl/schemas/educational_content/materialized-views/cognitive_level_distribution.sql
CREATE MATERIALIZED VIEW educational_content.cognitive_level_distribution AS
SELECT
    bloom_level,
    COUNT(*) AS total_exercises,
    ROUND((COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER ()) * 100, 2) AS percentage,
    COUNT(CASE WHEN difficulty_level IN ('beginner', 'elementary') THEN 1 END) AS beginners_count,
    COUNT(CASE WHEN difficulty_level IN ('pre_intermediate', 'intermediate') THEN 1 END) AS intermediate_count,
    COUNT(CASE WHEN difficulty_level IN ('upper_intermediate', 'advanced', 'proficient', 'native') THEN 1 END) AS advanced_count
FROM educational_content.exercises
WHERE is_active = TRUE
GROUP BY bloom_level
ORDER BY
    CASE bloom_level
        WHEN 'remember' THEN 1
        WHEN 'understand' THEN 2
        WHEN 'apply' THEN 3
        WHEN 'analyze' THEN 4
        WHEN 'evaluate' THEN 5
        WHEN 'create' THEN 6
    END;

CREATE UNIQUE INDEX idx_cognitive_distribution_level
ON educational_content.cognitive_level_distribution(bloom_level);

-- Refresh programado (diariamente a las 3 AM)
SELECT cron.schedule('refresh-cognitive-distribution', '0 3 * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY educational_content.cognitive_level_distribution');

COMMENT ON MATERIALIZED VIEW educational_content.cognitive_level_distribution IS
'Distribución de ejercicios por nivel cognitivo de Bloom';
```

### 1.8 Achievements Cognitivos

```sql
-- Archivo: apps/database/ddl/schemas/gamification_system/tables/achievements.sql (inserción)

-- Insertar achievements específicos para niveles cognitivos
INSERT INTO gamification_system.achievements
(id, name, description, icon, xp_reward, coins_reward, criteria, rarity)
VALUES
('critical_thinker', 'Pensador Crítico', 'Alcanza 80% de éxito en ejercicios de Analyze', '🔍', 500, 100,
 '{"bloom_level": "analyze", "success_rate": 80, "min_attempts": 20}'::jsonb, 'rare'),

('master_creator', 'Creador Maestro', 'Completa 10 ejercicios de Create con calificación excelente', '🎨', 1000, 250,
 '{"bloom_level": "create", "excellent_count": 10}'::jsonb, 'epic'),

('lots_champion', 'Campeón LOTS', 'Domina todos los niveles básicos (Remember + Understand) con 85%+', '🧠', 300, 75,
 '{"categories": ["remember", "understand"], "success_rate": 85, "min_attempts_each": 30}'::jsonb, 'rare'),

('hots_master', 'Maestro HOTS', 'Domina todos los niveles superiores (Evaluate + Create) con 70%+', '🎓', 1500, 500,
 '{"categories": ["evaluate", "create"], "success_rate": 70, "min_attempts_each": 20}'::jsonb, 'legendary'),

('balanced_learner', 'Aprendiz Equilibrado', 'Mantén 70%+ de éxito en todos los 6 niveles cognitivos', '⚖️', 750, 200,
 '{"all_levels": true, "success_rate": 70, "min_attempts_each": 15}'::jsonb, 'epic'),

('cognitive_explorer', 'Explorador Cognitivo', 'Completa al menos 5 ejercicios de cada nivel cognitivo', '🗺️', 200, 50,
 '{"all_levels": true, "min_attempts_each": 5}'::jsonb, 'uncommon');

-- Badges por nivel cognitivo
INSERT INTO gamification_system.badges
(id, name, description, icon, unlock_criteria)
VALUES
('badge_remember', 'Badge Recordar', '100 ejercicios de Remember con 85%+ éxito', '🧠',
 '{"bloom_level": "remember", "count": 100, "success_rate": 85}'::jsonb),

('badge_understand', 'Badge Comprender', '100 ejercicios de Understand con 85%+ éxito', '💡',
 '{"bloom_level": "understand", "count": 100, "success_rate": 85}'::jsonb),

('badge_apply', 'Badge Aplicar', '75 ejercicios de Apply con 80%+ éxito', '🔧',
 '{"bloom_level": "apply", "count": 75, "success_rate": 80}'::jsonb),

('badge_analyze', 'Badge Analizar', '50 ejercicios de Analyze con 75%+ éxito', '🔍',
 '{"bloom_level": "analyze", "count": 50, "success_rate": 75}'::jsonb),

('badge_evaluate', 'Badge Evaluar', '30 ejercicios de Evaluate con 70%+ éxito', '⚖️',
 '{"bloom_level": "evaluate", "count": 30, "success_rate": 70}'::jsonb),

('badge_create', 'Badge Crear', '20 ejercicios de Create con 70%+ éxito', '🎨',
 '{"bloom_level": "create", "count": 20, "success_rate": 70}'::jsonb);
```

---

## 🖥️ 2. Backend (NestJS + TypeScript)

### 2.1 Enum: `BloomLevel`

```typescript
// Archivo: apps/backend/src/modules/educational-content/enums/bloom-level.enum.ts
export enum BloomLevel {
    REMEMBER = 'remember',
    UNDERSTAND = 'understand',
    APPLY = 'apply',
    ANALYZE = 'analyze',
    EVALUATE = 'evaluate',
    CREATE = 'create'
}

export const BLOOM_ORDER: BloomLevel[] = [
    BloomLevel.REMEMBER,
    BloomLevel.UNDERSTAND,
    BloomLevel.APPLY,
    BloomLevel.ANALYZE,
    BloomLevel.EVALUATE,
    BloomLevel.CREATE
];

export type CognitiveCategory = 'LOTS' | 'MOTS' | 'HOTS';

export function getCognitiveCategory(level: BloomLevel): CognitiveCategory {
    if (level === BloomLevel.REMEMBER || level === BloomLevel.UNDERSTAND) {
        return 'LOTS'; // Lower Order Thinking Skills
    }
    if (level === BloomLevel.APPLY || level === BloomLevel.ANALYZE) {
        return 'MOTS'; // Middle Order Thinking Skills
    }
    return 'HOTS'; // Higher Order Thinking Skills (Evaluate, Create)
}

export const BLOOM_LABELS: Record<BloomLevel, string> = {
    [BloomLevel.REMEMBER]: 'Recordar',
    [BloomLevel.UNDERSTAND]: 'Comprender',
    [BloomLevel.APPLY]: 'Aplicar',
    [BloomLevel.ANALYZE]: 'Analizar',
    [BloomLevel.EVALUATE]: 'Evaluar',
    [BloomLevel.CREATE]: 'Crear'
};
```

### 2.2 Entity: `CognitivePerformance`

```typescript
// Archivo: apps/backend/src/modules/progress/entities/cognitive-performance.entity.ts
import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
import { BloomLevel } from '../../educational-content/enums/bloom-level.enum';

@Entity('cognitive_performance', { schema: 'progress_tracking' })
@Index(['user_id', 'bloom_level'], { unique: true })
export class CognitivePerformance {
    @PrimaryColumn('uuid')
    user_id: string;

    @PrimaryColumn({
        type: 'enum',
        enum: BloomLevel
    })
    bloom_level: BloomLevel;

    @Column({ type: 'int', default: 0 })
    exercises_attempted: number;

    @Column({ type: 'int', default: 0 })
    exercises_correct: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, select: false })
    success_rate: number;

    @Column({ type: 'bigint', default: 0 })
    total_time_spent_seconds: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, select: false })
    avg_time_per_exercise: number;

    @Column({ type: 'timestamp with time zone', nullable: true })
    last_attempt_at: Date;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
```

### 2.3 DTO: `CognitiveProfileDto`

```typescript
// Archivo: apps/backend/src/modules/analytics/dto/cognitive-profile.dto.ts
import { BloomLevel, CognitiveCategory } from '../../educational-content/enums/bloom-level.enum';

export class CognitiveLevelProfileDto {
    bloom_level: BloomLevel;
    success_rate: number;
    attempts: number;
    correct: number;
    avg_time: number;
    status: 'insufficient_data' | 'excellent' | 'good' | 'needs_practice' | 'requires_attention';
    category: CognitiveCategory;
}

export class CognitiveProfileDto {
    profile: CognitiveLevelProfileDto[];
    weak_levels: BloomLevel[];
    overall_lots: number;  // Tasa de éxito promedio en LOTS
    overall_mots: number;  // Tasa de éxito promedio en MOTS
    overall_hots: number;  // Tasa de éxito promedio en HOTS
}

export class WeakCognitiveLevelDto {
    bloom_level: BloomLevel;
    success_rate: number;
    gap: number;  // Diferencia con el umbral (70%)
}
```

### 2.4 Service: `CognitiveAnalyticsService`

```typescript
// Archivo: apps/backend/src/modules/analytics/services/cognitive-analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CognitivePerformance } from '../../progress/entities/cognitive-performance.entity';
import { BloomLevel, getCognitiveCategory } from '../../educational-content/enums/bloom-level.enum';
import { CognitiveProfileDto, WeakCognitiveLevelDto } from '../dto/cognitive-profile.dto';

@Injectable()
export class CognitiveAnalyticsService {
    constructor(
        @InjectRepository(CognitivePerformance)
        private cognitiveRepo: Repository<CognitivePerformance>,
        private dataSource: DataSource
    ) {}

    /**
     * Obtiene el perfil cognitivo completo del usuario
     */
    async getCognitiveProfile(userId: string): Promise<CognitiveProfileDto> {
        const result = await this.dataSource.query(
            'SELECT * FROM progress_tracking.get_cognitive_profile($1)',
            [userId]
        );

        const weakLevels = await this.getWeakCognitiveLevels(userId);

        return {
            profile: result,
            weak_levels: weakLevels.map(w => w.bloom_level),
            overall_lots: this.calculateCategoryRate(result, 'LOTS'),
            overall_mots: this.calculateCategoryRate(result, 'MOTS'),
            overall_hots: this.calculateCategoryRate(result, 'HOTS')
        };
    }

    /**
     * Calcula la tasa de éxito promedio para una categoría (LOTS/MOTS/HOTS)
     */
    private calculateCategoryRate(profile: any[], category: string): number {
        const categoryLevels = profile.filter(p => p.category === category);
        if (categoryLevels.length === 0) return 0;

        const totalAttempts = categoryLevels.reduce((sum, p) => sum + p.attempts, 0);
        const totalCorrect = categoryLevels.reduce((sum, p) => sum + p.correct, 0);

        return totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    }

    /**
     * Identifica niveles cognitivos débiles
     */
    async getWeakCognitiveLevels(
        userId: string,
        successThreshold: number = 70,
        minAttempts: number = 5
    ): Promise<WeakCognitiveLevelDto[]> {
        return this.dataSource.query(
            'SELECT * FROM progress_tracking.get_weak_cognitive_levels($1, $2, $3)',
            [userId, successThreshold, minAttempts]
        );
    }

    /**
     * Actualiza el desempeño cognitivo tras completar un ejercicio
     */
    async updateCognitivePerformance(
        userId: string,
        bloomLevel: BloomLevel,
        isCorrect: boolean,
        timeSpentSeconds: number
    ): Promise<void> {
        await this.dataSource.query(
            'SELECT progress_tracking.update_cognitive_performance($1, $2, $3, $4)',
            [userId, bloomLevel, isCorrect, timeSpentSeconds]
        );
    }

    /**
     * Obtiene recomendaciones de ejercicios basadas en niveles débiles
     */
    async getRecommendedExercises(userId: string, limit: number = 5): Promise<any[]> {
        const weakLevels = await this.getWeakCognitiveLevels(userId);

        if (weakLevels.length === 0) {
            // Si no hay niveles débiles, recomendar HOTS para desafío
            return this.dataSource.query(`
                SELECT e.id, e.title, e.bloom_level, e.difficulty_level
                FROM educational_content.exercises e
                WHERE e.bloom_level IN ('evaluate', 'create')
                AND e.is_active = TRUE
                ORDER BY RANDOM()
                LIMIT $1
            `, [limit]);
        }

        // Recomendar ejercicios de niveles débiles
        const weakLevelNames = weakLevels.map(w => w.bloom_level);
        return this.dataSource.query(`
            SELECT e.id, e.title, e.bloom_level, e.difficulty_level
            FROM educational_content.exercises e
            WHERE e.bloom_level = ANY($1)
            AND e.is_active = TRUE
            ORDER BY RANDOM()
            LIMIT $2
        `, [weakLevelNames, limit]);
    }

    /**
     * Obtiene estadísticas agregadas por nivel cognitivo
     */
    async getBloomLevelStatistics(level: BloomLevel): Promise<any> {
        const result = await this.dataSource.query(`
            SELECT
                COUNT(DISTINCT user_id) AS total_users,
                ROUND(AVG(success_rate), 2) AS avg_success_rate,
                ROUND(AVG(avg_time_per_exercise), 2) AS avg_time_per_exercise,
                COUNT(CASE WHEN success_rate >= 80 THEN 1 END) AS users_excellent
            FROM progress_tracking.cognitive_performance
            WHERE bloom_level = $1
            AND exercises_attempted >= 5
        `, [level]);

        return result[0];
    }

    /**
     * Verifica si el usuario ha desbloqueado un achievement cognitivo
     */
    async checkCognitiveAchievements(userId: string): Promise<string[]> {
        const profile = await this.getCognitiveProfile(userId);
        const unlockedAchievements: string[] = [];

        // Critical Thinker: 80%+ en Analyze con 20+ intentos
        const analyzePerf = profile.profile.find(p => p.bloom_level === BloomLevel.ANALYZE);
        if (analyzePerf && analyzePerf.success_rate >= 80 && analyzePerf.attempts >= 20) {
            unlockedAchievements.push('critical_thinker');
        }

        // LOTS Champion: 85%+ en Remember y Understand con 30+ cada uno
        const rememberPerf = profile.profile.find(p => p.bloom_level === BloomLevel.REMEMBER);
        const understandPerf = profile.profile.find(p => p.bloom_level === BloomLevel.UNDERSTAND);
        if (
            rememberPerf && rememberPerf.success_rate >= 85 && rememberPerf.attempts >= 30 &&
            understandPerf && understandPerf.success_rate >= 85 && understandPerf.attempts >= 30
        ) {
            unlockedAchievements.push('lots_champion');
        }

        // HOTS Master: 70%+ en Evaluate y Create con 20+ cada uno
        const evaluatePerf = profile.profile.find(p => p.bloom_level === BloomLevel.EVALUATE);
        const createPerf = profile.profile.find(p => p.bloom_level === BloomLevel.CREATE);
        if (
            evaluatePerf && evaluatePerf.success_rate >= 70 && evaluatePerf.attempts >= 20 &&
            createPerf && createPerf.success_rate >= 70 && createPerf.attempts >= 20
        ) {
            unlockedAchievements.push('hots_master');
        }

        // Balanced Learner: 70%+ en todos los niveles con 15+ cada uno
        const allAbove70 = profile.profile.every(p => p.success_rate >= 70 && p.attempts >= 15);
        if (allAbove70 && profile.profile.length === 6) {
            unlockedAchievements.push('balanced_learner');
        }

        // Cognitive Explorer: 5+ intentos en cada nivel
        const allExplored = profile.profile.every(p => p.attempts >= 5);
        if (allExplored && profile.profile.length === 6) {
            unlockedAchievements.push('cognitive_explorer');
        }

        return unlockedAchievements;
    }
}
```

### 2.5 Controller: `CognitiveAnalyticsController`

```typescript
// Archivo: apps/backend/src/modules/analytics/controllers/cognitive-analytics.controller.ts
import { Controller, Get, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CognitiveAnalyticsService } from '../services/cognitive-analytics.service';

@Controller('analytics/cognitive')
@UseGuards(JwtAuthGuard)
export class CognitiveAnalyticsController {
    constructor(private cognitiveService: CognitiveAnalyticsService) {}

    @Get('profile')
    async getCognitiveProfile(@CurrentUser() user: any) {
        return this.cognitiveService.getCognitiveProfile(user.userId);
    }

    @Get('weak-levels')
    async getWeakLevels(
        @CurrentUser() user: any,
        @Query('threshold', new ParseIntPipe({ optional: true })) threshold?: number,
        @Query('minAttempts', new ParseIntPipe({ optional: true })) minAttempts?: number
    ) {
        return this.cognitiveService.getWeakCognitiveLevels(
            user.userId,
            threshold || 70,
            minAttempts || 5
        );
    }

    @Get('recommendations')
    async getRecommendations(
        @CurrentUser() user: any,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
    ) {
        const exercises = await this.cognitiveService.getRecommendedExercises(
            user.userId,
            limit || 5
        );

        const weakLevels = await this.cognitiveService.getWeakCognitiveLevels(user.userId);

        return {
            weak_levels: weakLevels,
            recommended_exercises: exercises
        };
    }

    @Get('achievements')
    async checkAchievements(@CurrentUser() user: any) {
        return this.cognitiveService.checkCognitiveAchievements(user.userId);
    }
}
```

### 2.6 Modificación: `ExerciseAttemptService`

Actualizar para llamar a `update_cognitive_performance` tras cada intento.

```typescript
// Archivo: apps/backend/src/modules/exercises/services/exercise-attempt.service.ts (modificación)

import { CognitiveAnalyticsService } from '../../analytics/services/cognitive-analytics.service';

@Injectable()
export class ExerciseAttemptService {
    constructor(
        // ... otros repositorios
        private cognitiveAnalyticsService: CognitiveAnalyticsService
    ) {}

    async submitAttempt(userId: string, exerciseId: string, answer: any): Promise<any> {
        // ... lógica existente de corrección

        // NUEVO: Actualizar desempeño cognitivo
        const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });
        if (exercise && exercise.bloom_level) {
            await this.cognitiveAnalyticsService.updateCognitivePerformance(
                userId,
                exercise.bloom_level,
                isCorrect,
                timeSpentSeconds
            );
        }

        // ... resto de la lógica
    }
}
```

---

## 🎨 3. Frontend (React + TypeScript)

### 3.1 Hook: `useCognitiveProfile`

```typescript
// Archivo: apps/frontend/src/hooks/useCognitiveProfile.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { BloomLevel, CognitiveCategory } from '../types/bloom-level';

export interface CognitiveLevelProfile {
    bloom_level: BloomLevel;
    success_rate: number;
    attempts: number;
    correct: number;
    avg_time: number;
    status: 'insufficient_data' | 'excellent' | 'good' | 'needs_practice' | 'requires_attention';
    category: CognitiveCategory;
}

export interface CognitiveProfileData {
    profile: CognitiveLevelProfile[];
    weak_levels: BloomLevel[];
    overall_lots: number;
    overall_mots: number;
    overall_hots: number;
}

export function useCognitiveProfile() {
    return useQuery<CognitiveProfileData>({
        queryKey: ['cognitive-profile'],
        queryFn: async () => {
            const response = await apiClient.get('/analytics/cognitive/profile');
            return response.data;
        },
        staleTime: 5 * 60 * 1000 // 5 minutos
    });
}

export function useCognitiveRecommendations(limit: number = 5) {
    return useQuery({
        queryKey: ['cognitive-recommendations', limit],
        queryFn: async () => {
            const response = await apiClient.get('/analytics/cognitive/recommendations', {
                params: { limit }
            });
            return response.data;
        },
        staleTime: 10 * 60 * 1000 // 10 minutos
    });
}
```

### 3.2 Componente: `CognitiveProfileDashboard`

```typescript
// Archivo: apps/frontend/src/components/analytics/CognitiveProfileDashboard.tsx
import React from 'react';
import { useCognitiveProfile } from '../../hooks/useCognitiveProfile';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

const BLOOM_LABELS = {
    remember: 'Recordar',
    understand: 'Comprender',
    apply: 'Aplicar',
    analyze: 'Analizar',
    evaluate: 'Evaluar',
    create: 'Crear'
};

const STATUS_COLORS = {
    excellent: 'green',
    good: 'blue',
    needs_practice: 'yellow',
    requires_attention: 'red',
    insufficient_data: 'gray'
};

const CATEGORY_LABELS = {
    LOTS: 'Habilidades Básicas (LOTS)',
    MOTS: 'Pensamiento Medio (MOTS)',
    HOTS: 'Pensamiento Superior (HOTS)'
};

export function CognitiveProfileDashboard() {
    const { data, isLoading, error } = useCognitiveProfile();

    if (isLoading) return <div>Cargando perfil cognitivo...</div>;
    if (error) return <div>Error al cargar perfil cognitivo</div>;
    if (!data) return null;

    return (
        <div className="cognitive-profile">
            <h2>Tu Perfil Cognitivo</h2>

            {/* Resumen LOTS/MOTS/HOTS */}
            <div className="category-summary">
                <div className="category-item">
                    <span className="category-label">{CATEGORY_LABELS.LOTS}:</span>
                    <strong className="category-value">{data.overall_lots}%</strong>
                    <Progress value={data.overall_lots} max={100} color="green" />
                </div>
                <div className="category-item">
                    <span className="category-label">{CATEGORY_LABELS.MOTS}:</span>
                    <strong className="category-value">{data.overall_mots}%</strong>
                    <Progress value={data.overall_mots} max={100} color="blue" />
                </div>
                <div className="category-item">
                    <span className="category-label">{CATEGORY_LABELS.HOTS}:</span>
                    <strong className="category-value">{data.overall_hots}%</strong>
                    <Progress value={data.overall_hots} max={100} color="purple" />
                </div>
            </div>

            {/* Desglose por nivel de Bloom */}
            <div className="levels-breakdown">
                <h3>Desempeño por Nivel Cognitivo</h3>
                {data.profile.map(level => (
                    <div key={level.bloom_level} className="level-item">
                        <div className="level-header">
                            <span className="level-name">
                                {BLOOM_LABELS[level.bloom_level]}
                            </span>
                            <Badge color={STATUS_COLORS[level.status]}>
                                {level.success_rate}%
                            </Badge>
                            <Badge color="gray">{level.category}</Badge>
                        </div>
                        <Progress value={level.success_rate} max={100} />
                        <div className="level-stats">
                            <span>{level.correct}/{level.attempts} correctos</span>
                            <span>Tiempo promedio: {Math.round(level.avg_time)}s</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recomendaciones */}
            {data.weak_levels.length > 0 && (
                <div className="recommendations">
                    <h3>Áreas de Mejora</h3>
                    <p>Practica más ejercicios de:</p>
                    <ul>
                        {data.weak_levels.map(level => (
                            <li key={level}>
                                <strong>{BLOOM_LABELS[level]}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
```

### 3.3 Componente: `BloomLevelFilter`

Filtro de ejercicios por nivel cognitivo para maestros.

```typescript
// Archivo: apps/frontend/src/components/exercises/BloomLevelFilter.tsx
import React from 'react';
import { BloomLevel } from '../../types/bloom-level';

const BLOOM_OPTIONS = [
    { value: BloomLevel.REMEMBER, label: 'Recordar', icon: '🧠' },
    { value: BloomLevel.UNDERSTAND, label: 'Comprender', icon: '💡' },
    { value: BloomLevel.APPLY, label: 'Aplicar', icon: '🔧' },
    { value: BloomLevel.ANALYZE, label: 'Analizar', icon: '🔍' },
    { value: BloomLevel.EVALUATE, label: 'Evaluar', icon: '⚖️' },
    { value: BloomLevel.CREATE, label: 'Crear', icon: '🎨' }
];

interface BloomLevelFilterProps {
    selected: BloomLevel[];
    onChange: (levels: BloomLevel[]) => void;
}

export function BloomLevelFilter({ selected, onChange }: BloomLevelFilterProps) {
    const handleToggle = (level: BloomLevel) => {
        if (selected.includes(level)) {
            onChange(selected.filter(l => l !== level));
        } else {
            onChange([...selected, level]);
        }
    };

    return (
        <div className="bloom-filter">
            <h4>Nivel Cognitivo</h4>
            <div className="bloom-options">
                {BLOOM_OPTIONS.map(option => (
                    <label key={option.value} className="bloom-option">
                        <input
                            type="checkbox"
                            checked={selected.includes(option.value)}
                            onChange={() => handleToggle(option.value)}
                        />
                        <span className="icon">{option.icon}</span>
                        <span className="label">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
```

---

## 🧪 4. Tests

### 4.1 Test: `cognitive-analytics.service.spec.ts`

```typescript
// Archivo: apps/backend/src/modules/analytics/services/cognitive-analytics.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CognitiveAnalyticsService } from './cognitive-analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CognitivePerformance } from '../../progress/entities/cognitive-performance.entity';
import { DataSource } from 'typeorm';
import { BloomLevel } from '../../educational-content/enums/bloom-level.enum';

describe('CognitiveAnalyticsService', () => {
    let service: CognitiveAnalyticsService;
    let mockCognitiveRepo: any;
    let mockDataSource: any;

    beforeEach(async () => {
        mockCognitiveRepo = {
            find: jest.fn(),
            findOne: jest.fn()
        };

        mockDataSource = {
            query: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CognitiveAnalyticsService,
                {
                    provide: getRepositoryToken(CognitivePerformance),
                    useValue: mockCognitiveRepo
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource
                }
            ]
        }).compile();

        service = module.get<CognitiveAnalyticsService>(CognitiveAnalyticsService);
    });

    describe('getCognitiveProfile', () => {
        it('should return complete cognitive profile with LOTS/MOTS/HOTS rates', async () => {
            const mockProfileData = [
                { bloom_level: 'remember', success_rate: 85, attempts: 50, correct: 42, category: 'LOTS' },
                { bloom_level: 'understand', success_rate: 80, attempts: 40, correct: 32, category: 'LOTS' },
                { bloom_level: 'apply', success_rate: 75, attempts: 30, correct: 22, category: 'MOTS' },
                { bloom_level: 'analyze', success_rate: 65, attempts: 20, correct: 13, category: 'MOTS' },
                { bloom_level: 'evaluate', success_rate: 60, attempts: 15, correct: 9, category: 'HOTS' },
                { bloom_level: 'create', success_rate: 55, attempts: 10, correct: 5, category: 'HOTS' }
            ];

            mockDataSource.query
                .mockResolvedValueOnce(mockProfileData) // get_cognitive_profile
                .mockResolvedValueOnce([]); // get_weak_cognitive_levels

            const result = await service.getCognitiveProfile('user-123');

            expect(result.profile).toHaveLength(6);
            expect(result.overall_lots).toBeGreaterThan(0);
            expect(result.overall_mots).toBeGreaterThan(0);
            expect(result.overall_hots).toBeGreaterThan(0);
        });
    });

    describe('getWeakCognitiveLevels', () => {
        it('should return levels below success threshold', async () => {
            const mockWeakLevels = [
                { bloom_level: 'evaluate', success_rate: 60, gap: 10 },
                { bloom_level: 'create', success_rate: 55, gap: 15 }
            ];

            mockDataSource.query.mockResolvedValue(mockWeakLevels);

            const result = await service.getWeakCognitiveLevels('user-123', 70, 5);

            expect(result).toEqual(mockWeakLevels);
            expect(mockDataSource.query).toHaveBeenCalledWith(
                expect.stringContaining('get_weak_cognitive_levels'),
                ['user-123', 70, 5]
            );
        });
    });

    describe('checkCognitiveAchievements', () => {
        it('should return critical_thinker achievement when criteria met', async () => {
            const mockProfile = {
                profile: [
                    { bloom_level: BloomLevel.ANALYZE, success_rate: 85, attempts: 25, correct: 21 }
                ],
                weak_levels: [],
                overall_lots: 80,
                overall_mots: 75,
                overall_hots: 70
            };

            mockDataSource.query.mockResolvedValueOnce(mockProfile.profile);
            mockDataSource.query.mockResolvedValueOnce([]);

            jest.spyOn(service, 'getCognitiveProfile').mockResolvedValue(mockProfile as any);

            const achievements = await service.checkCognitiveAchievements('user-123');

            expect(achievements).toContain('critical_thinker');
        });

        it('should return lots_champion when both Remember and Understand exceed 85%', async () => {
            const mockProfile = {
                profile: [
                    { bloom_level: BloomLevel.REMEMBER, success_rate: 90, attempts: 40, correct: 36 },
                    { bloom_level: BloomLevel.UNDERSTAND, success_rate: 88, attempts: 35, correct: 31 }
                ],
                weak_levels: [],
                overall_lots: 89,
                overall_mots: 70,
                overall_hots: 65
            };

            jest.spyOn(service, 'getCognitiveProfile').mockResolvedValue(mockProfile as any);

            const achievements = await service.checkCognitiveAchievements('user-123');

            expect(achievements).toContain('lots_champion');
        });
    });
});
```

### 4.2 Test de Integración: Función SQL

```sql
-- Archivo: apps/database/tests/cognitive_performance_test.sql
-- Test de la función update_cognitive_performance

BEGIN;

-- Setup: Crear usuario de prueba
INSERT INTO auth.users (id, email, created_at)
VALUES ('test-user-cognitive', 'cognitive@test.com', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Test 1: Primera actualización crea la fila
SELECT progress_tracking.update_cognitive_performance(
    'test-user-cognitive',
    'remember',
    TRUE,
    30
);

SELECT
    exercises_attempted,
    exercises_correct,
    success_rate
FROM progress_tracking.cognitive_performance
WHERE user_id = 'test-user-cognitive' AND bloom_level = 'remember';

-- Expected: attempts=1, correct=1, success_rate=100.00

-- Test 2: Segunda actualización incrementa correctamente
SELECT progress_tracking.update_cognitive_performance(
    'test-user-cognitive',
    'remember',
    FALSE,
    25
);

SELECT
    exercises_attempted,
    exercises_correct,
    success_rate
FROM progress_tracking.cognitive_performance
WHERE user_id = 'test-user-cognitive' AND bloom_level = 'remember';

-- Expected: attempts=2, correct=1, success_rate=50.00

-- Test 3: get_cognitive_profile retorna datos correctos
SELECT * FROM progress_tracking.get_cognitive_profile('test-user-cognitive');

-- Expected: Debe retornar al menos la fila de 'remember' con status calculado

-- Cleanup
DELETE FROM progress_tracking.cognitive_performance WHERE user_id = 'test-user-cognitive';
DELETE FROM auth.users WHERE id = 'test-user-cognitive';

ROLLBACK;
```

---

## ✅ Criterios de Aceptación

### CA-001: ENUMs y Schema Base
- [x] Existe ENUM `bloom_level` con 6 valores
- [x] Columna `bloom_level` agregada a tabla `exercises`
- [x] Índices creados para búsquedas eficientes

### CA-002: Tracking de Desempeño Cognitivo
- [x] Tabla `cognitive_performance` registra intentos por nivel cognitivo
- [x] Campos calculados (`success_rate`, `avg_time_per_exercise`) funcionan
- [x] Función `update_cognitive_performance()` actualiza correctamente

### CA-003: Análisis Cognitivo
- [x] Función `get_cognitive_profile()` retorna perfil completo con categoría (LOTS/MOTS/HOTS)
- [x] Función `get_weak_cognitive_levels()` identifica niveles débiles
- [x] Backend calcula tasas promedio por categoría

### CA-004: Filtrado de Ejercicios
- [x] Maestros pueden filtrar ejercicios por nivel cognitivo
- [x] Índice compuesto `(difficulty_level, bloom_level)` optimiza búsquedas
- [x] API retorna ejercicios filtrados correctamente

### CA-005: Recomendaciones
- [x] Sistema sugiere ejercicios de niveles débiles
- [x] Si no hay niveles débiles, sugiere HOTS para desafío
- [x] Recomendaciones son aleatorias pero relevantes

### CA-006: Achievements Cognitivos
- [x] Existe achievement "Critical Thinker" (Analyze 80%+)
- [x] Existe achievement "LOTS Champion" (Remember + Understand 85%+)
- [x] Existe achievement "HOTS Master" (Evaluate + Create 70%+)
- [x] Service `checkCognitiveAchievements()` valida criterios correctamente

### CA-007: Frontend UI
- [x] Componente `CognitiveProfileDashboard` muestra perfil visual
- [x] Resumen LOTS/MOTS/HOTS con gráficos de progreso
- [x] Indicación de áreas de mejora
- [x] Componente `BloomLevelFilter` para maestros

### CA-008: Tests
- [x] Tests unitarios para `CognitiveAnalyticsService`
- [x] Tests de integración para funciones SQL
- [x] Tests de frontend para componentes

---

## 📊 5. Análisis y Reportes

### 5.1 Dashboard de Maestros: Distribución Cognitiva

```typescript
// Archivo: apps/backend/src/modules/analytics/services/teacher-analytics.service.ts (extracto)

async getClassroomCognitiveDistribution(classroomId: string): Promise<any> {
    const result = await this.dataSource.query(`
        SELECT
            cp.bloom_level,
            COUNT(DISTINCT cp.user_id) AS students_count,
            ROUND(AVG(cp.success_rate), 2) AS avg_success_rate,
            COUNT(CASE WHEN cp.success_rate >= 80 THEN 1 END) AS students_excellent,
            COUNT(CASE WHEN cp.success_rate < 60 THEN 1 END) AS students_struggling
        FROM progress_tracking.cognitive_performance cp
        JOIN classroom_members cm ON cm.user_id = cp.user_id
        WHERE cm.classroom_id = $1
        AND cp.exercises_attempted >= 5
        GROUP BY cp.bloom_level
        ORDER BY
            CASE cp.bloom_level
                WHEN 'remember' THEN 1
                WHEN 'understand' THEN 2
                WHEN 'apply' THEN 3
                WHEN 'analyze' THEN 4
                WHEN 'evaluate' THEN 5
                WHEN 'create' THEN 6
            END
    `, [classroomId]);

    return result;
}
```

---

## 📚 Referencias Técnicas

### Database
- Schema: `educational_content` - Ejercicios con clasificación cognitiva
- Schema: `progress_tracking` - Desempeño cognitivo
- Función: `update_cognitive_performance()` - Actualización de métricas
- Función: `get_cognitive_profile()` - Perfil cognitivo completo
- Función: `get_weak_cognitive_levels()` - Identificación de niveles débiles

### Backend
- Service: `apps/backend/src/modules/analytics/services/cognitive-analytics.service.ts`
- Controller: `apps/backend/src/modules/analytics/controllers/cognitive-analytics.controller.ts`
- Enum: `apps/backend/src/modules/educational-content/enums/bloom-level.enum.ts`

### Frontend
- Hook: `apps/frontend/src/hooks/useCognitiveProfile.ts`
- Component: `apps/frontend/src/components/analytics/CognitiveProfileDashboard.tsx`
- Component: `apps/frontend/src/components/exercises/BloomLevelFilter.tsx`

### Documentación Relacionada
- [RF-EDU-003: Taxonomía de Bloom](../requirements/RF-EDU-003-taxonomia-bloom.md)
- [ET-EDU-001: Estructura de Ejercicios](./ET-EDU-001-estructura-ejercicios.md)
- [ET-EDU-002: Niveles de Dificultad](./ET-EDU-002-niveles-dificultad.md)

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo Backend, Frontend, Database, Pedagógico
**Próxima revisión:** 2025-12-07
