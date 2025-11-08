
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: ET-EDU-001 -->
<!-- ID Nuevo: M-EDU-ET-001 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-EDU-ET-001: Implementación de Mecánicas de Ejercicios

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-EDU-001 |
| **Módulo** | 03 - Contenido Educativo |
| **Título** | Implementación de Mecánicas de Ejercicios |
| **Prioridad** | Crít ica |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team, Backend Team |
| **Reviewers** | Backend Lead, Frontend Lead, QA Lead |

---

## 🔗 Referencias

### Requerimiento Funcional

📘 **Documento RF:**
- [RF-EDU-001: Mecánicas de Ejercicios](../../01-requerimientos/03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md)

### Implementación DDL

🗄️ **ENUM:**
- `educational_content.exercise_mechanic` - `apps/database/ddl/00-prerequisites.sql:59-65`

🗄️ **Tablas:**
- `educational_content.exercises` - Ejercicios completos
- `educational_content.exercise_templates` - Plantillas reutilizables

---

## 🏗️ Arquitectura

### Diagrama de Capas

```
┌────────────────────────────────────────────────────┐
│                 FRONTEND (React)                   │
│  - ExerciseRenderer (dinámico por mecánica)       │
│  - MultipleChoiceExercise                          │
│  - FillInBlankExercise                             │
│  - ... (31 componentes específicos)                │
└─────────────────┬──────────────────────────────────┘
                  │ REST API
┌─────────────────▼──────────────────────────────────┐
│              BACKEND (NestJS)                      │
│  - ExerciseService                                 │
│    · getExercise() - sin answer_key                │
│    · submitAnswer() - valida en backend            │
│  - MechanicValidators (factory pattern)            │
│    · MultipleChoiceValidator                       │
│    · FillInBlankValidator                          │
│    · ... (31 validators)                           │
└─────────────────┬──────────────────────────────────┘
                  │ SQL Queries
┌─────────────────▼──────────────────────────────────┐
│            DATABASE (PostgreSQL)                   │
│  - exercises (JSONB content flexible)              │
│  - exercise_attempts (tracking)                    │
│  - validate_exercise_structure() (validar JSONB)   │
└────────────────────────────────────────────────────┘
```

---

## 💾 Implementación de Base de Datos

### 1. ENUM: exercise_mechanic

**Ubicación:** `apps/database/ddl/00-prerequisites.sql:59-65`

```sql
-- Exercise Mechanics (31 tipos)
CREATE TYPE educational_content.exercise_mechanic AS ENUM (
    -- Vocabulario (6)
    'multiple_choice',
    'fill_in_blank',
    'matching_pairs',
    'flashcard',
    'word_search',
    'image_association',

    -- Gramática (8)
    'verb_conjugation',
    'sentence_builder',
    'error_detection',
    'sentence_transformation',
    'pronoun_selection',
    'possessive_forms',
    'pluralization',
    'aspect_markers',

    -- Lectura (4)
    'reading_comprehension',
    'true_or_false',
    'inference',
    'sequence_ordering',

    -- Escritura (4)
    'free_writing',
    'sentence_completion',
    'translation',
    'dictation',

    -- Audio (3)
    'listening_comprehension',
    'audio_matching',
    'tone_recognition',

    -- Pronunciación (2)
    'speech_recording',
    'pronunciation_comparison',

    -- Cultura (4)
    'cultural_context',
    'historical_timeline',
    'cultural_artifact',
    'traditional_practice'
);

COMMENT ON TYPE educational_content.exercise_mechanic IS '31 mecánicas de ejercicios agrupadas en 7 categorías pedagógicas';
```

### 2. Tabla: exercises

**Ubicación:** `apps/database/ddl/schemas/educational_content/tables/exercises.sql`

```sql
CREATE TABLE IF NOT EXISTS educational_content.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificación
    code VARCHAR(100) UNIQUE,
    title VARCHAR(300) NOT NULL,

    -- Mecánica y dificultad
    mechanic educational_content.exercise_mechanic NOT NULL,
    difficulty educational_content.difficulty_level NOT NULL,

    -- Contenido (estructura varía por mecánica)
    content JSONB NOT NULL,
    answer_key JSONB NOT NULL,
    hints JSONB, -- Array de strings: ["hint1", "hint2", "hint3"]

    -- Multimedia
    image_url VARCHAR(500),
    audio_url VARCHAR(500),
    video_url VARCHAR(500),

    -- Metadata pedagógica
    bloom_level educational_content.bloom_taxonomy,
    estimated_time_seconds INTEGER DEFAULT 60,
    xp_reward INTEGER DEFAULT 15,
    ml_coins_reward INTEGER DEFAULT 5,

    -- Relaciones
    module_id UUID REFERENCES educational_content.modules(id),
    lesson_id UUID REFERENCES educational_content.lessons(id),

    -- Restricciones
    required_rank gamification_system.maya_rank,
    is_exam BOOLEAN DEFAULT false,

    -- Estado
    status VARCHAR(20) DEFAULT 'draft', -- draft, review, published, archived
    published_at TIMESTAMPTZ,

    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_exercises_mechanic ON educational_content.exercises(mechanic);
CREATE INDEX idx_exercises_difficulty ON educational_content.exercises(difficulty);
CREATE INDEX idx_exercises_module ON educational_content.exercises(module_id);
CREATE INDEX idx_exercises_status ON educational_content.exercises(status) WHERE status = 'published';
CREATE INDEX idx_exercises_content ON educational_content.exercises USING GIN(content);

-- Constraint: validar estructura de content según mechanic
ALTER TABLE educational_content.exercises
    ADD CONSTRAINT chk_content_structure CHECK (
        educational_content.validate_exercise_structure(mechanic, content, answer_key)
    );

COMMENT ON TABLE educational_content.exercises IS 'Ejercicios con 31 mecánicas diferentes';
COMMENT ON COLUMN educational_content.exercises.content IS 'Estructura JSONB flexible según mechanic';
COMMENT ON COLUMN educational_content.exercises.answer_key IS 'Respuestas correctas (NUNCA enviar al frontend)';
COMMENT ON COLUMN educational_content.exercises.hints IS 'Array de pistas progresivas';
```

### 3. Función: validate_exercise_structure

**Ubicación:** `apps/database/ddl/schemas/educational_content/functions/validate_exercise_structure.sql`

```sql
CREATE OR REPLACE FUNCTION educational_content.validate_exercise_structure(
    p_mechanic educational_content.exercise_mechanic,
    p_content JSONB,
    p_answer_key JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Validación básica: content y answer_key no pueden ser null o vacíos
    IF p_content IS NULL OR p_content = '{}'::JSONB THEN
        RETURN false;
    END IF;

    IF p_answer_key IS NULL OR p_answer_key = '{}'::JSONB THEN
        RETURN false;
    END IF;

    -- Validaciones específicas por mecánica (ejemplos)
    CASE p_mechanic
        WHEN 'multiple_choice' THEN
            -- Debe tener: question, options (array), correct_answer en answer_key
            IF NOT (
                p_content ? 'question'
                AND p_content ? 'options'
                AND jsonb_array_length(p_content->'options') >= 2
                AND p_answer_key ? 'correct_answer'
            ) THEN
                RETURN false;
            END IF;

        WHEN 'fill_in_blank' THEN
            -- Debe tener: sentence, blank_position
            IF NOT (
                p_content ? 'sentence'
                AND p_content ? 'blank_position'
                AND p_answer_key ? 'correct_answer'
            ) THEN
                RETURN false;
            END IF;

        WHEN 'matching_pairs' THEN
            -- Debe tener: pairs (array)
            IF NOT (
                p_content ? 'pairs'
                AND jsonb_array_length(p_content->'pairs') >= 2
            ) THEN
                RETURN false;
            END IF;

        -- Agregar más validaciones según necesidad
        ELSE
            -- Por defecto, aceptar si tiene content y answer_key
            RETURN true;
    END CASE;

    RETURN true;
END;
$$;

COMMENT ON FUNCTION educational_content.validate_exercise_structure IS 'Valida que estructura JSONB sea correcta según mechanic';
```

---

## 🔧 Implementación Backend (NestJS)

### 1. Enum TypeScript

**Ubicación:** `apps/backend/src/educational-content/enums/exercise-mechanic.enum.ts`

```typescript
export enum ExerciseMechanicEnum {
  // Vocabulario
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING_PAIRS = 'matching_pairs',
  FLASHCARD = 'flashcard',
  WORD_SEARCH = 'word_search',
  IMAGE_ASSOCIATION = 'image_association',

  // Gramática
  VERB_CONJUGATION = 'verb_conjugation',
  SENTENCE_BUILDER = 'sentence_builder',
  ERROR_DETECTION = 'error_detection',
  SENTENCE_TRANSFORMATION = 'sentence_transformation',
  PRONOUN_SELECTION = 'pronoun_selection',
  POSSESSIVE_FORMS = 'possessive_forms',
  PLURALIZATION = 'pluralization',
  ASPECT_MARKERS = 'aspect_markers',

  // Lectura
  READING_COMPREHENSION = 'reading_comprehension',
  TRUE_OR_FALSE = 'true_or_false',
  INFERENCE = 'inference',
  SEQUENCE_ORDERING = 'sequence_ordering',

  // Escritura
  FREE_WRITING = 'free_writing',
  SENTENCE_COMPLETION = 'sentence_completion',
  TRANSLATION = 'translation',
  DICTATION = 'dictation',

  // Audio
  LISTENING_COMPREHENSION = 'listening_comprehension',
  AUDIO_MATCHING = 'audio_matching',
  TONE_RECOGNITION = 'tone_recognition',

  // Pronunciación
  SPEECH_RECORDING = 'speech_recording',
  PRONUNCIATION_COMPARISON = 'pronunciation_comparison',

  // Cultura
  CULTURAL_CONTEXT = 'cultural_context',
  HISTORICAL_TIMELINE = 'historical_timeline',
  CULTURAL_ARTIFACT = 'cultural_artifact',
  TRADITIONAL_PRACTICE = 'traditional_practice',
}
```

### 2. Entity

**Ubicación:** `apps/backend/src/educational-content/entities/exercise.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ExerciseMechanicEnum } from '../enums/exercise-mechanic.enum';
import { DifficultyLevelEnum } from '../enums/difficulty-level.enum';

@Entity({ schema: 'educational_content', name: 'exercises' })
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  code?: string;

  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Column({ type: 'enum', enum: ExerciseMechanicEnum })
  mechanic: ExerciseMechanicEnum;

  @Column({ type: 'enum', enum: DifficultyLevelEnum })
  difficulty: DifficultyLevelEnum;

  @Column({ type: 'jsonb' })
  content: Record<string, any>;

  @Column({ type: 'jsonb', name: 'answer_key', select: false }) // NUNCA select por defecto
  answerKey: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  hints?: string[];

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url' })
  imageUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'audio_url' })
  audioUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'video_url' })
  videoUrl?: string;

  @Column({ type: 'integer', default: 60, name: 'estimated_time_seconds' })
  estimatedTimeSeconds: number;

  @Column({ type: 'integer', default: 15, name: 'xp_reward' })
  xpReward: number;

  @Column({ type: 'integer', default: 5, name: 'ml_coins_reward' })
  mlCoinsReward: number;

  @Column({ type: 'uuid', nullable: true, name: 'module_id' })
  moduleId?: string;

  @Column({ type: 'uuid', nullable: true, name: 'lesson_id' })
  lessonId?: string;

  @Column({ type: 'boolean', default: false, name: 'is_exam' })
  isExam: boolean;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'review' | 'published' | 'archived';

  @Column({ type: 'timestamptz', nullable: true, name: 'published_at' })
  publishedAt?: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy?: string;
}
```

### 3. Validators (Factory Pattern)

**Ubicación:** `apps/backend/src/educational-content/validators/exercise-validators.ts`

```typescript
import { ExerciseMechanicEnum } from '../enums/exercise-mechanic.enum';

export interface IExerciseValidator {
  validate(userAnswer: any, answerKey: any): ValidationResult;
}

export interface ValidationResult {
  correct: boolean;
  feedback?: string;
  score?: number; // 0-100
}

// Base Validator
abstract class BaseExerciseValidator implements IExerciseValidator {
  abstract validate(userAnswer: any, answerKey: any): ValidationResult;
}

// Multiple Choice Validator
export class MultipleChoiceValidator extends BaseExerciseValidator {
  validate(userAnswer: any, answerKey: any): ValidationResult {
    const { selected } = userAnswer;
    const { correct_answer } = answerKey;

    const isCorrect = selected === correct_answer;

    return {
      correct: isCorrect,
      feedback: isCorrect
        ? '¡Correcto!'
        : `Incorrecto. La respuesta correcta es: ${correct_answer}`,
      score: isCorrect ? 100 : 0,
    };
  }
}

// Fill in Blank Validator
export class FillInBlankValidator extends BaseExerciseValidator {
  validate(userAnswer: any, answerKey: any): ValidationResult {
    const { answer } = userAnswer;
    const { correct_answer, accept_variations = [] } = answerKey;

    // Normalizar respuesta (lowercase, trim, sin acentos opcionales)
    const normalized = this.normalize(answer);

    const acceptableAnswers = [correct_answer, ...accept_variations].map(a =>
      this.normalize(a)
    );

    const isCorrect = acceptableAnswers.includes(normalized);

    return {
      correct: isCorrect,
      feedback: isCorrect ? '¡Correcto!' : `Incorrecto. Se esperaba: ${correct_answer}`,
      score: isCorrect ? 100 : 0,
    };
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
  }
}

// Matching Pairs Validator
export class MatchingPairsValidator extends BaseExerciseValidator {
  validate(userAnswer: any, answerKey: any): ValidationResult {
    const { pairs: userPairs } = userAnswer; // [{ maya_id: 1, spanish_id: 1 }, ...]
    const { pairs: correctPairs } = answerKey;

    let correctCount = 0;
    let totalPairs = correctPairs.length;

    for (const correctPair of correctPairs) {
      const userPair = userPairs.find(
        (up: any) => up.maya_id === correctPair.id || up.id === correctPair.id
      );

      if (userPair && userPair.spanish_id === correctPair.id) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalPairs) * 100);
    const isCorrect = score === 100;

    return {
      correct: isCorrect,
      feedback: isCorrect
        ? '¡Todos los pares correctos!'
        : `${correctCount}/${totalPairs} pares correctos`,
      score,
    };
  }
}

// Verb Conjugation Validator
export class VerbConjugationValidator extends BaseExerciseValidator {
  validate(userAnswer: any, answerKey: any): ValidationResult {
    const { conjugation } = userAnswer;
    const { correct_answer, accept_variations = [] } = answerKey;

    const normalized = this.normalize(conjugation);
    const acceptableAnswers = [correct_answer, ...accept_variations].map(a =>
      this.normalize(a)
    );

    const isCorrect = acceptableAnswers.includes(normalized);

    return {
      correct: isCorrect,
      feedback: isCorrect
        ? '¡Conjugación correcta!'
        : `Incorrecto. La conjugación correcta es: ${correct_answer}`,
      score: isCorrect ? 100 : 0,
    };
  }

  private normalize(text: string): string {
    return text.toLowerCase().trim();
  }
}

// ... Implementar validators para las otras 27 mecánicas ...

// Factory
export class ExerciseValidatorFactory {
  static create(mechanic: ExerciseMechanicEnum): IExerciseValidator {
    switch (mechanic) {
      case ExerciseMechanicEnum.MULTIPLE_CHOICE:
        return new MultipleChoiceValidator();

      case ExerciseMechanicEnum.FILL_IN_BLANK:
        return new FillInBlankValidator();

      case ExerciseMechanicEnum.MATCHING_PAIRS:
        return new MatchingPairsValidator();

      case ExerciseMechanicEnum.VERB_CONJUGATION:
        return new VerbConjugationValidator();

      // ... Agregar casos para las otras 27 mecánicas ...

      default:
        throw new Error(`Validator not implemented for mechanic: ${mechanic}`);
    }
  }
}
```

### 4. ExerciseService

**Ubicación:** `apps/backend/src/educational-content/services/exercise.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { ExerciseValidatorFactory } from '../validators/exercise-validators';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,
  ) {}

  /**
   * Obtener ejercicio (SIN answer_key)
   */
  async getExercise(exerciseId: string, userId: string): Promise<Partial<Exercise>> {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId, status: 'published' },
      select: [
        'id',
        'code',
        'title',
        'mechanic',
        'difficulty',
        'content',
        'hints',
        'imageUrl',
        'audioUrl',
        'videoUrl',
        'estimatedTimeSeconds',
        'isExam',
        // ❌ NO incluir answerKey
      ],
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found or not published');
    }

    // Verificar si usuario tiene acceso (por rango, etc.)
    await this.checkAccess(userId, exercise);

    return exercise;
  }

  /**
   * Validar respuesta del usuario
   */
  async submitAnswer(
    userId: string,
    exerciseId: string,
    attemptId: string,
    userAnswer: any
  ): Promise<{
    correct: boolean;
    feedback: string;
    score: number;
    xp_earned: number;
    ml_coins_earned: number;
  }> {
    // 1. Obtener ejercicio CON answer_key (query separado)
    const exercise = await this.exerciseRepo
      .createQueryBuilder('e')
      .addSelect('e.answer_key') // Forzar select de answer_key
      .where('e.id = :id', { id: exerciseId })
      .getOne();

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // 2. Obtener validator según mecánica
    const validator = ExerciseValidatorFactory.create(exercise.mechanic);

    // 3. Validar respuesta
    const validationResult = validator.validate(userAnswer, exercise.answerKey);

    // 4. Calcular XP y ML Coins
    let xpEarned = 0;
    let mlCoinsEarned = 0;

    if (validationResult.correct) {
      // XP base según dificultad
      xpEarned = exercise.xpReward;
      mlCoinsEarned = exercise.mlCoinsReward;

      // Aplicar multiplicador de rango del usuario
      const userRank = await this.getUserRank(userId);
      xpEarned = Math.round(xpEarned * this.getRankMultiplier(userRank));
    }

    // 5. Registrar intento en progress_tracking.exercise_attempts
    await this.recordAttempt(userId, exerciseId, attemptId, validationResult.correct, validationResult.score);

    // 6. Si correcto, actualizar user_stats
    if (validationResult.correct) {
      await this.updateUserStats(userId, xpEarned, mlCoinsEarned);
    }

    // 7. Emitir evento para achievements
    if (validationResult.correct) {
      // eventEmitter.emit('exercise.completed', { userId, exerciseId, xpEarned });
    }

    return {
      correct: validationResult.correct,
      feedback: validationResult.feedback || '',
      score: validationResult.score || 0,
      xp_earned: xpEarned,
      ml_coins_earned: mlCoinsEarned,
    };
  }

  /**
   * Obtener hint (deduce del inventario si es necesario)
   */
  async getHint(userId: string, exerciseId: string, hintNumber: number): Promise<string> {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId },
      select: ['id', 'hints', 'isExam'],
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    if (exercise.isExam) {
      throw new ForbiddenException('Hints not allowed in exams');
    }

    if (!exercise.hints || exercise.hints.length < hintNumber) {
      throw new NotFoundException(`Hint ${hintNumber} not available`);
    }

    // Verificar límite de 3 pistas por ejercicio (delegado a ComodinService)
    // ...

    return exercise.hints[hintNumber - 1];
  }

  // Métodos auxiliares
  private async checkAccess(userId: string, exercise: Exercise): Promise<void> {
    // Verificar rango requerido, etc.
  }

  private async getUserRank(userId: string): Promise<string> {
    // Query a user_stats
    return 'Ajaw'; // Placeholder
  }

  private getRankMultiplier(rank: string): number {
    const multipliers = {
      Ajaw: 1.0,
      Nacom: 1.05,
      'Ah K\'in': 1.10,
      'Halach Uinic': 1.15,
      'K\'uk\'ulkan': 1.20,
    };
    return multipliers[rank] || 1.0;
  }

  private async recordAttempt(
    userId: string,
    exerciseId: string,
    attemptId: string,
    correct: boolean,
    score: number
  ): Promise<void> {
    // INSERT en progress_tracking.exercise_attempts
  }

  private async updateUserStats(userId: string, xp: number, coins: number): Promise<void> {
    // UPDATE gamification_system.user_stats
  }
}
```

### 5. Controller

**Ubicación:** `apps/backend/src/educational-content/controllers/exercise.controller.ts`

```typescript
import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExerciseService } from '../services/exercise.service';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExerciseController {
  constructor(private exerciseService: ExerciseService) {}

  /**
   * GET /exercises/:id
   * Obtener ejercicio (sin answer_key)
   */
  @Get(':id')
  async getExercise(@Req() req, @Param('id') id: string) {
    return await this.exerciseService.getExercise(id, req.user.id);
  }

  /**
   * POST /exercises/:id/submit
   * Enviar respuesta y validar
   */
  @Post(':id/submit')
  async submitAnswer(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { attemptId: string; answer: any }
  ) {
    return await this.exerciseService.submitAnswer(req.user.id, id, body.attemptId, body.answer);
  }

  /**
   * GET /exercises/:id/hints/:number
   * Obtener pista específica
   */
  @Get(':id/hints/:number')
  async getHint(@Req() req, @Param('id') id: string, @Param('number') number: string) {
    return await this.exerciseService.getHint(req.user.id, id, parseInt(number));
  }
}
```

---

## 🎨 Implementación Frontend (React)

### 1. ExerciseRenderer (Component Dinámico)

**Ubicación:** `apps/frontend/src/components/exercises/ExerciseRenderer.tsx`

```typescript
import React from 'react';
import { Exercise } from '../../types/exercise.types';
import { ExerciseMechanicEnum } from '../../enums/exercise-mechanic.enum';

// Importar componentes específicos
import { MultipleChoiceExercise } from './mechanics/MultipleChoiceExercise';
import { FillInBlankExercise } from './mechanics/FillInBlankExercise';
import { MatchingPairsExercise } from './mechanics/MatchingPairsExercise';
// ... importar los otros 28 componentes

interface ExerciseRendererProps {
  exercise: Exercise;
  onSubmit: (answer: any) => void;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({ exercise, onSubmit }) => {
  // Factory pattern para renderizar componente correcto
  const renderExercise = () => {
    switch (exercise.mechanic) {
      case ExerciseMechanicEnum.MULTIPLE_CHOICE:
        return <MultipleChoiceExercise exercise={exercise} onSubmit={onSubmit} />;

      case ExerciseMechanicEnum.FILL_IN_BLANK:
        return <FillInBlankExercise exercise={exercise} onSubmit={onSubmit} />;

      case ExerciseMechanicEnum.MATCHING_PAIRS:
        return <MatchingPairsExercise exercise={exercise} onSubmit={onSubmit} />;

      // ... otros 28 casos

      default:
        return <div>Mechanic not implemented: {exercise.mechanic}</div>;
    }
  };

  return (
    <div className="exercise-container">
      <div className="exercise-header">
        <h2>{exercise.title}</h2>
        <span className="difficulty-badge">{exercise.difficulty}</span>
      </div>

      <div className="exercise-content">{renderExercise()}</div>
    </div>
  );
};
```

### 2. Component: MultipleChoiceExercise

**Ubicación:** `apps/frontend/src/components/exercises/mechanics/MultipleChoiceExercise.tsx`

```typescript
import React, { useState } from 'react';
import { Exercise } from '../../../types/exercise.types';

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  onSubmit: (answer: any) => void;
}

export const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({ exercise, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit({ selected: selectedOption });
    }
  };

  const { question, options } = exercise.content;

  return (
    <div className="multiple-choice-exercise">
      <p className="question text-lg font-semibold mb-4">{question}</p>

      <div className="options space-y-3">
        {options.map((option: any) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`option-button w-full p-4 text-left rounded-lg border-2 transition-all ${
              selectedOption === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <span className="font-bold mr-2">{option.id.toUpperCase()})</span>
            {option.text}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedOption}
        className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Verificar Respuesta
      </button>
    </div>
  );
};
```

---

## 🧪 Testing

### Test Case 1: Validar Multiple Choice

```typescript
test('Multiple choice validator validates correct answer', () => {
  const validator = new MultipleChoiceValidator();

  const userAnswer = { selected: 'a' };
  const answerKey = { correct_answer: 'a' };

  const result = validator.validate(userAnswer, answerKey);

  expect(result.correct).toBe(true);
  expect(result.score).toBe(100);
});
```

### Test Case 2: Fill in Blank con Variaciones

```typescript
test('Fill in blank accepts variations', () => {
  const validator = new FillInBlankValidator();

  const answerKey = {
    correct_answer: 'paal',
    accept_variations: ['paal', 'páal'],
  };

  // Con acento
  const result1 = validator.validate({ answer: 'páal' }, answerKey);
  expect(result1.correct).toBe(true);

  // Sin acento
  const result2 = validator.validate({ answer: 'paal' }, answerKey);
  expect(result2.correct).toBe(true);
});
```

---

## 📊 Performance

### Índices Críticos

```sql
CREATE INDEX idx_exercises_mechanic ON educational_content.exercises(mechanic);
CREATE INDEX idx_exercises_content ON educational_content.exercises USING GIN(content);
```

### Caching

```typescript
// Redis cache para ejercicios publicados
async getExercise(exerciseId: string): Promise<Exercise> {
  const cacheKey = `exercise:${exerciseId}`;
  const cached = await this.redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const exercise = await this.exerciseRepo.findOne(exerciseId);

  await this.redis.set(cacheKey, JSON.stringify(exercise), 'EX', 3600); // 1 hora

  return exercise;
}
```

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |

---

**Documento:** `docs/02-especificaciones-tecnicas/03-contenido-educativo/ET-EDU-001-mecanicas-ejercicios.md`
**Propósito:** Especificación técnica completa de implementación de las 31 mecánicas
**Audiencia:** Backend Developers, Frontend Developers, QA Team
