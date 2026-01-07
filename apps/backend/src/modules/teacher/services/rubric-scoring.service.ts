/**
 * RubricScoringService
 *
 * @description Service for calculating scores based on standardized rubrics.
 * Provides consistent evaluation criteria across all teachers.
 *
 * FIX GAP-MED-002: Created to standardize rubric-based scoring
 *
 * Responsibilities:
 * - Define standard rubrics per exercise type
 * - Validate rubric criteria completeness
 * - Calculate weighted scores from criterion scores
 * - Apply scoring rules consistently
 *
 * @see GradingService - Uses this for rubric-based submissions
 * @see ManualReviewService - Integrates rubric scores in review flow
 */

import { Injectable, BadRequestException } from '@nestjs/common';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Performance level for a criterion
 */
export interface RubricLevel {
  score: number;
  label: string;
  description: string;
}

/**
 * Single rubric criterion definition
 */
export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight: number;
  levels: RubricLevel[];
}

/**
 * Complete rubric for an exercise type
 */
export interface ExerciseRubric {
  exerciseType: string;
  moduleName: string;
  moduleNumber: number;
  totalPoints: number;
  criteria: RubricCriterion[];
}

/**
 * Input scores from teacher evaluation
 */
export interface RubricScoreInput {
  criterionId: string;
  score: number;
}

/**
 * Result of score calculation
 */
export interface RubricScoreResult {
  totalScore: number;
  percentageScore: number;
  criteriaResults: {
    criterionId: string;
    criterionName: string;
    rawScore: number;
    maxScore: number;
    weightedScore: number;
    levelLabel: string;
  }[];
  warnings: string[];
}

// ============================================================================
// STANDARD LEVELS (reusable across criteria)
// ============================================================================

const STANDARD_4_LEVELS: RubricLevel[] = [
  { score: 0, label: 'No presentado', description: 'No se evidencia el criterio' },
  { score: 1, label: 'En desarrollo', description: 'Cumple parcialmente con dificultades' },
  { score: 2, label: 'Competente', description: 'Cumple satisfactoriamente' },
  { score: 3, label: 'Sobresaliente', description: 'Supera las expectativas' },
];

const STANDARD_5_LEVELS: RubricLevel[] = [
  { score: 0, label: 'No presentado', description: 'No se evidencia el criterio' },
  { score: 1, label: 'Inicial', description: 'Intento basico con limitaciones significativas' },
  { score: 2, label: 'En desarrollo', description: 'Cumple parcialmente con algunas dificultades' },
  { score: 3, label: 'Competente', description: 'Cumple satisfactoriamente los requisitos' },
  { score: 4, label: 'Sobresaliente', description: 'Supera las expectativas' },
];

// ============================================================================
// MODULE 3 RUBRICS - Comprension Critica
// ============================================================================

const M3_TRIBUNAL_OPINIONES: ExerciseRubric = {
  exerciseType: 'tribunal_opiniones',
  moduleName: 'Comprension Critica',
  moduleNumber: 3,
  totalPoints: 100,
  criteria: [
    {
      id: 'argumentacion',
      name: 'Argumentacion',
      description: 'Calidad y solidez de los argumentos presentados',
      maxPoints: 30,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'evidencia',
      name: 'Uso de Evidencia',
      description: 'Incorporacion correcta de evidencia del texto',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'contraargumento',
      name: 'Contraargumentacion',
      description: 'Capacidad de refutar puntos opuestos',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'claridad',
      name: 'Claridad Expositiva',
      description: 'Expresion clara y ordenada de ideas',
      maxPoints: 20,
      weight: 1.0,
      levels: STANDARD_4_LEVELS,
    },
  ],
};

const M3_DEBATE_DIGITAL: ExerciseRubric = {
  exerciseType: 'debate_digital',
  moduleName: 'Comprension Critica',
  moduleNumber: 3,
  totalPoints: 100,
  criteria: [
    {
      id: 'postura',
      name: 'Defensa de Postura',
      description: 'Consistencia y defensa de la posicion tomada',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'interaccion',
      name: 'Interaccion Digital',
      description: 'Participacion activa y respetuosa en el debate',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'fuentes',
      name: 'Citacion de Fuentes',
      description: 'Uso correcto de fuentes para respaldar argumentos',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'sintesis',
      name: 'Sintesis Final',
      description: 'Conclusion integradora del debate',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

const M3_MATRIZ_PERSPECTIVAS: ExerciseRubric = {
  exerciseType: 'matriz_perspectivas',
  moduleName: 'Comprension Critica',
  moduleNumber: 3,
  totalPoints: 100,
  criteria: [
    {
      id: 'identificacion',
      name: 'Identificacion de Perspectivas',
      description: 'Reconocimiento de diferentes puntos de vista',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'analisis',
      name: 'Analisis Comparativo',
      description: 'Comparacion y contraste de perspectivas',
      maxPoints: 30,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'sintesis',
      name: 'Sintesis Integradora',
      description: 'Integracion coherente de multiples visiones',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'reflexion',
      name: 'Reflexion Personal',
      description: 'Posicionamiento personal fundamentado',
      maxPoints: 20,
      weight: 1.0,
      levels: STANDARD_4_LEVELS,
    },
  ],
};

// ============================================================================
// MODULE 4 RUBRICS - Lectura Digital
// ============================================================================

const M4_VERIFICADOR_FAKE_NEWS: ExerciseRubric = {
  exerciseType: 'verificador_fake_news',
  moduleName: 'Lectura Digital',
  moduleNumber: 4,
  totalPoints: 100,
  criteria: [
    {
      id: 'identificacion',
      name: 'Identificacion de Indicadores',
      description: 'Deteccion de senales de desinformacion',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'verificacion',
      name: 'Proceso de Verificacion',
      description: 'Metodologia de fact-checking aplicada',
      maxPoints: 30,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'fuentes',
      name: 'Evaluacion de Fuentes',
      description: 'Analisis de credibilidad de fuentes',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'conclusion',
      name: 'Conclusion Fundamentada',
      description: 'Veredicto final con justificacion',
      maxPoints: 20,
      weight: 1.0,
      levels: STANDARD_4_LEVELS,
    },
  ],
};

const M4_INFOGRAFIA_INTERACTIVA: ExerciseRubric = {
  exerciseType: 'infografia_interactiva',
  moduleName: 'Lectura Digital',
  moduleNumber: 4,
  totalPoints: 100,
  criteria: [
    {
      id: 'contenido',
      name: 'Contenido Informativo',
      description: 'Precision y relevancia de la informacion',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'organizacion',
      name: 'Organizacion Visual',
      description: 'Estructura logica y jerarquia visual',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'interactividad',
      name: 'Elementos Interactivos',
      description: 'Uso efectivo de elementos interactivos',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'creatividad',
      name: 'Creatividad y Originalidad',
      description: 'Enfoque creativo y original',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

const M4_ANALISIS_MEMES: ExerciseRubric = {
  exerciseType: 'analisis_memes',
  moduleName: 'Lectura Digital',
  moduleNumber: 4,
  totalPoints: 100,
  criteria: [
    {
      id: 'decodificacion',
      name: 'Decodificacion Visual-Textual',
      description: 'Interpretacion de elementos visuales y textuales',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'contexto',
      name: 'Analisis del Contexto',
      description: 'Comprension del contexto cultural/social',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'intertextualidad',
      name: 'Intertextualidad',
      description: 'Conexiones con otros textos/memes',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'critica',
      name: 'Reflexion Critica',
      description: 'Analisis critico del mensaje',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

// ============================================================================
// MODULE 5 RUBRICS - Produccion Lectora
// ============================================================================

const M5_DIARIO_MULTIMEDIA: ExerciseRubric = {
  exerciseType: 'diario_multimedia',
  moduleName: 'Produccion Lectora',
  moduleNumber: 5,
  totalPoints: 100,
  criteria: [
    {
      id: 'contenido',
      name: 'Calidad del Contenido',
      description: 'Profundidad y relevancia de las entradas',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'multimedia',
      name: 'Integracion Multimedia',
      description: 'Uso efectivo de elementos multimedia',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'reflexion',
      name: 'Reflexion Personal',
      description: 'Profundidad de la reflexion sobre Marie Curie',
      maxPoints: 25,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'coherencia',
      name: 'Coherencia Narrativa',
      description: 'Fluidez y cohesion entre entradas',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

const M5_COMIC_DIGITAL: ExerciseRubric = {
  exerciseType: 'comic_digital',
  moduleName: 'Produccion Lectora',
  moduleNumber: 5,
  totalPoints: 100,
  criteria: [
    {
      id: 'narrativa',
      name: 'Narrativa Visual',
      description: 'Historia coherente contada a traves de imagenes',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'precision',
      name: 'Precision Historica',
      description: 'Fidelidad a los hechos de Marie Curie',
      maxPoints: 25,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'dialogo',
      name: 'Dialogos y Textos',
      description: 'Calidad de dialogos y globos de texto',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'creatividad',
      name: 'Creatividad Visual',
      description: 'Originalidad en el diseno y presentacion',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

const M5_VIDEO_CARTA: ExerciseRubric = {
  exerciseType: 'video_carta',
  moduleName: 'Produccion Lectora',
  moduleNumber: 5,
  totalPoints: 100,
  criteria: [
    {
      id: 'contenido',
      name: 'Contenido del Mensaje',
      description: 'Relevancia y profundidad del mensaje a Marie Curie',
      maxPoints: 25,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'expresion',
      name: 'Expresion Oral',
      description: 'Claridad, entonacion y fluidez',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'conexion',
      name: 'Conexion Personal',
      description: 'Vinculo emocional e intelectual con la cientifica',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'produccion',
      name: 'Calidad de Produccion',
      description: 'Audio, iluminacion y edicion del video',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

// ============================================================================
// RUBRIC REGISTRY
// ============================================================================

const RUBRICS_BY_TYPE: Record<string, ExerciseRubric> = {
  // Module 3
  tribunal_opiniones: M3_TRIBUNAL_OPINIONES,
  debate_digital: M3_DEBATE_DIGITAL,
  matriz_perspectivas: M3_MATRIZ_PERSPECTIVAS,
  // Module 4
  verificador_fake_news: M4_VERIFICADOR_FAKE_NEWS,
  infografia_interactiva: M4_INFOGRAFIA_INTERACTIVA,
  analisis_memes: M4_ANALISIS_MEMES,
  // Module 5
  diario_multimedia: M5_DIARIO_MULTIMEDIA,
  comic_digital: M5_COMIC_DIGITAL,
  video_carta: M5_VIDEO_CARTA,
};

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

@Injectable()
export class RubricScoringService {
  /**
   * Get rubric by exercise type
   *
   * @param exerciseType - Exercise type identifier
   * @returns ExerciseRubric or undefined if not found
   */
  getRubricByType(exerciseType: string): ExerciseRubric | undefined {
    return RUBRICS_BY_TYPE[exerciseType];
  }

  /**
   * Get all rubrics for a module
   *
   * @param moduleNumber - Module number (3, 4, or 5)
   * @returns Array of ExerciseRubric for the module
   */
  getRubricsByModule(moduleNumber: number): ExerciseRubric[] {
    return Object.values(RUBRICS_BY_TYPE).filter(
      (rubric) => rubric.moduleNumber === moduleNumber,
    );
  }

  /**
   * Get all available rubrics
   *
   * @returns Record of all rubrics indexed by exercise type
   */
  getAllRubrics(): Record<string, ExerciseRubric> {
    return { ...RUBRICS_BY_TYPE };
  }

  /**
   * Calculate weighted score from criterion scores
   *
   * @param exerciseType - Exercise type identifier
   * @param scores - Array of criterion scores from teacher
   * @returns RubricScoreResult with calculated scores
   * @throws BadRequestException if rubric not found or validation fails
   */
  calculateScore(
    exerciseType: string,
    scores: RubricScoreInput[],
  ): RubricScoreResult {
    const rubric = this.getRubricByType(exerciseType);

    if (!rubric) {
      throw new BadRequestException(
        `No se encontro rubrica para el tipo de ejercicio: ${exerciseType}`,
      );
    }

    const warnings: string[] = [];
    const criteriaResults: RubricScoreResult['criteriaResults'] = [];

    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Process each criterion in the rubric
    for (const criterion of rubric.criteria) {
      const scoreInput = scores.find((s) => s.criterionId === criterion.id);

      if (!scoreInput) {
        warnings.push(`Criterio "${criterion.name}" no fue evaluado`);
        // Use score 0 for missing criteria
        criteriaResults.push({
          criterionId: criterion.id,
          criterionName: criterion.name,
          rawScore: 0,
          maxScore: Math.max(...criterion.levels.map((l) => l.score)),
          weightedScore: 0,
          levelLabel: 'No evaluado',
        });
        continue;
      }

      // Validate score is within valid range
      const maxLevelScore = Math.max(...criterion.levels.map((l) => l.score));
      const minLevelScore = Math.min(...criterion.levels.map((l) => l.score));

      if (scoreInput.score < minLevelScore || scoreInput.score > maxLevelScore) {
        throw new BadRequestException(
          `Puntuacion ${scoreInput.score} fuera de rango para criterio "${criterion.name}". ` +
            `Rango valido: ${minLevelScore}-${maxLevelScore}`,
        );
      }

      // Calculate normalized and weighted score
      const normalizedScore =
        (scoreInput.score / maxLevelScore) * criterion.maxPoints;
      const weightedScore = normalizedScore * criterion.weight;

      totalWeightedScore += weightedScore;
      totalWeight += criterion.maxPoints * criterion.weight;

      // Find matching level label
      const matchingLevel = criterion.levels.find(
        (l) => l.score === scoreInput.score,
      );

      criteriaResults.push({
        criterionId: criterion.id,
        criterionName: criterion.name,
        rawScore: scoreInput.score,
        maxScore: maxLevelScore,
        weightedScore: Math.round(weightedScore * 100) / 100,
        levelLabel: matchingLevel?.label || 'Desconocido',
      });
    }

    // Calculate final percentage score
    const percentageScore =
      totalWeight > 0
        ? Math.round((totalWeightedScore / totalWeight) * 100)
        : 0;

    // Calculate total score (out of rubric.totalPoints)
    const totalScore = Math.round((percentageScore / 100) * rubric.totalPoints);

    return {
      totalScore,
      percentageScore,
      criteriaResults,
      warnings,
    };
  }

  /**
   * Validate that all required criteria are present in scores
   *
   * @param exerciseType - Exercise type identifier
   * @param scores - Array of criterion scores from teacher
   * @returns Validation result with missing criteria if any
   */
  validateCriteriaCompleteness(
    exerciseType: string,
    scores: RubricScoreInput[],
  ): { isComplete: boolean; missingCriteria: string[] } {
    const rubric = this.getRubricByType(exerciseType);

    if (!rubric) {
      return { isComplete: false, missingCriteria: ['Rubrica no encontrada'] };
    }

    const scoredCriterionIds = new Set(scores.map((s) => s.criterionId));
    const missingCriteria: string[] = [];

    for (const criterion of rubric.criteria) {
      if (!scoredCriterionIds.has(criterion.id)) {
        missingCriteria.push(criterion.name);
      }
    }

    return {
      isComplete: missingCriteria.length === 0,
      missingCriteria,
    };
  }

  /**
   * Get suggested feedback based on scores
   *
   * @param exerciseType - Exercise type identifier
   * @param scores - Array of criterion scores from teacher
   * @returns Suggested feedback text
   */
  getSuggestedFeedback(
    exerciseType: string,
    scores: RubricScoreInput[],
  ): string {
    const rubric = this.getRubricByType(exerciseType);

    if (!rubric) {
      return 'Ejercicio evaluado.';
    }

    const strengths: string[] = [];
    const improvements: string[] = [];

    for (const criterion of rubric.criteria) {
      const scoreInput = scores.find((s) => s.criterionId === criterion.id);
      if (!scoreInput) continue;

      const maxScore = Math.max(...criterion.levels.map((l) => l.score));
      const percentage = (scoreInput.score / maxScore) * 100;

      if (percentage >= 75) {
        strengths.push(criterion.name.toLowerCase());
      } else if (percentage < 50) {
        improvements.push(criterion.name.toLowerCase());
      }
    }

    const parts: string[] = [];

    if (strengths.length > 0) {
      parts.push(`Fortalezas: ${strengths.join(', ')}.`);
    }

    if (improvements.length > 0) {
      parts.push(`Areas de mejora: ${improvements.join(', ')}.`);
    }

    if (parts.length === 0) {
      return 'Buen trabajo en general. Continua practicando para mejorar.';
    }

    return parts.join(' ');
  }
}
