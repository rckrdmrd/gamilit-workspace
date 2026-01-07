/**
 * Standard Rubrics Configuration
 *
 * Standardized evaluation rubrics for modules 3, 4, and 5.
 * Ensures consistent grading criteria across all teachers.
 *
 * FIX GAP-MED-007: Created to standardize rubric criteria per module
 *
 * @module apps/teacher/constants/standardRubrics
 */

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
 * Performance level for a criterion
 */
export interface RubricLevel {
  score: number;
  label: string;
  description: string;
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

// ============================================================================
// COMMON LEVELS (reusable across criteria)
// ============================================================================

const STANDARD_4_LEVELS: RubricLevel[] = [
  { score: 0, label: 'No presentado', description: 'No se evidencia el criterio' },
  { score: 1, label: 'En desarrollo', description: 'Cumple parcialmente con dificultades' },
  { score: 2, label: 'Competente', description: 'Cumple satisfactoriamente' },
  { score: 3, label: 'Sobresaliente', description: 'Supera las expectativas' },
];

const STANDARD_5_LEVELS: RubricLevel[] = [
  { score: 0, label: 'No presentado', description: 'No se evidencia el criterio' },
  { score: 1, label: 'Inicial', description: 'Intento básico con limitaciones significativas' },
  { score: 2, label: 'En desarrollo', description: 'Cumple parcialmente con algunas dificultades' },
  { score: 3, label: 'Competente', description: 'Cumple satisfactoriamente los requisitos' },
  { score: 4, label: 'Sobresaliente', description: 'Supera las expectativas' },
];

// ============================================================================
// MODULE 3 RUBRICS - Comprensión Crítica
// ============================================================================

export const M3_TRIBUNAL_OPINIONES: ExerciseRubric = {
  exerciseType: 'tribunal_opiniones',
  moduleName: 'Comprensión Crítica',
  moduleNumber: 3,
  totalPoints: 100,
  criteria: [
    {
      id: 'argumentacion',
      name: 'Argumentación',
      description: 'Calidad y solidez de los argumentos presentados',
      maxPoints: 30,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'evidencia',
      name: 'Uso de Evidencia',
      description: 'Incorporación correcta de evidencia del texto',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'contraargumento',
      name: 'Contraargumentación',
      description: 'Capacidad de refutar puntos opuestos',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'claridad',
      name: 'Claridad Expositiva',
      description: 'Expresión clara y ordenada de ideas',
      maxPoints: 20,
      weight: 1.0,
      levels: STANDARD_4_LEVELS,
    },
  ],
};

export const M3_DEBATE_DIGITAL: ExerciseRubric = {
  exerciseType: 'debate_digital',
  moduleName: 'Comprensión Crítica',
  moduleNumber: 3,
  totalPoints: 100,
  criteria: [
    {
      id: 'postura',
      name: 'Defensa de Postura',
      description: 'Consistencia y defensa de la posición tomada',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'interaccion',
      name: 'Interacción Digital',
      description: 'Participación activa y respetuosa en el debate',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'fuentes',
      name: 'Citación de Fuentes',
      description: 'Uso correcto de fuentes para respaldar argumentos',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'sintesis',
      name: 'Síntesis Final',
      description: 'Conclusión integradora del debate',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

export const M3_MATRIZ_PERSPECTIVAS: ExerciseRubric = {
  exerciseType: 'matriz_perspectivas',
  moduleName: 'Comprensión Crítica',
  moduleNumber: 3,
  totalPoints: 100,
  criteria: [
    {
      id: 'identificacion',
      name: 'Identificación de Perspectivas',
      description: 'Reconocimiento de diferentes puntos de vista',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'analisis',
      name: 'Análisis Comparativo',
      description: 'Comparación y contraste de perspectivas',
      maxPoints: 30,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'sintesis',
      name: 'Síntesis Integradora',
      description: 'Integración coherente de múltiples visiones',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'reflexion',
      name: 'Reflexión Personal',
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

export const M4_VERIFICADOR_FAKE_NEWS: ExerciseRubric = {
  exerciseType: 'verificador_fake_news',
  moduleName: 'Lectura Digital',
  moduleNumber: 4,
  totalPoints: 100,
  criteria: [
    {
      id: 'identificacion',
      name: 'Identificación de Indicadores',
      description: 'Detección de señales de desinformación',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'verificacion',
      name: 'Proceso de Verificación',
      description: 'Metodología de fact-checking aplicada',
      maxPoints: 30,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'fuentes',
      name: 'Evaluación de Fuentes',
      description: 'Análisis de credibilidad de fuentes',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'conclusion',
      name: 'Conclusión Fundamentada',
      description: 'Veredicto final con justificación',
      maxPoints: 20,
      weight: 1.0,
      levels: STANDARD_4_LEVELS,
    },
  ],
};

export const M4_INFOGRAFIA_INTERACTIVA: ExerciseRubric = {
  exerciseType: 'infografia_interactiva',
  moduleName: 'Lectura Digital',
  moduleNumber: 4,
  totalPoints: 100,
  criteria: [
    {
      id: 'contenido',
      name: 'Contenido Informativo',
      description: 'Precisión y relevancia de la información',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'organizacion',
      name: 'Organización Visual',
      description: 'Estructura lógica y jerarquía visual',
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

export const M4_ANALISIS_MEMES: ExerciseRubric = {
  exerciseType: 'analisis_memes',
  moduleName: 'Lectura Digital',
  moduleNumber: 4,
  totalPoints: 100,
  criteria: [
    {
      id: 'decodificacion',
      name: 'Decodificación Visual-Textual',
      description: 'Interpretación de elementos visuales y textuales',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'contexto',
      name: 'Análisis del Contexto',
      description: 'Comprensión del contexto cultural/social',
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
      name: 'Reflexión Crítica',
      description: 'Análisis crítico del mensaje',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

// ============================================================================
// MODULE 5 RUBRICS - Producción Lectora
// ============================================================================

export const M5_DIARIO_MULTIMEDIA: ExerciseRubric = {
  exerciseType: 'diario_multimedia',
  moduleName: 'Producción Lectora',
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
      name: 'Integración Multimedia',
      description: 'Uso efectivo de elementos multimedia',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'reflexion',
      name: 'Reflexión Personal',
      description: 'Profundidad de la reflexión sobre Marie Curie',
      maxPoints: 25,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'coherencia',
      name: 'Coherencia Narrativa',
      description: 'Fluidez y cohesión entre entradas',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

export const M5_COMIC_DIGITAL: ExerciseRubric = {
  exerciseType: 'comic_digital',
  moduleName: 'Producción Lectora',
  moduleNumber: 5,
  totalPoints: 100,
  criteria: [
    {
      id: 'narrativa',
      name: 'Narrativa Visual',
      description: 'Historia coherente contada a través de imágenes',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'precision',
      name: 'Precisión Histórica',
      description: 'Fidelidad a los hechos de Marie Curie',
      maxPoints: 25,
      weight: 1.2,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'dialogo',
      name: 'Diálogos y Textos',
      description: 'Calidad de diálogos y globos de texto',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'creatividad',
      name: 'Creatividad Visual',
      description: 'Originalidad en el diseño y presentación',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

export const M5_VIDEO_CARTA: ExerciseRubric = {
  exerciseType: 'video_carta',
  moduleName: 'Producción Lectora',
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
      name: 'Expresión Oral',
      description: 'Claridad, entonación y fluidez',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'conexion',
      name: 'Conexión Personal',
      description: 'Vínculo emocional e intelectual con la científica',
      maxPoints: 25,
      weight: 1.1,
      levels: STANDARD_5_LEVELS,
    },
    {
      id: 'produccion',
      name: 'Calidad de Producción',
      description: 'Audio, iluminación y edición del video',
      maxPoints: 25,
      weight: 1.0,
      levels: STANDARD_5_LEVELS,
    },
  ],
};

// ============================================================================
// RUBRIC LOOKUP FUNCTIONS
// ============================================================================

/**
 * All rubrics indexed by exercise type
 */
export const RUBRICS_BY_TYPE: Record<string, ExerciseRubric> = {
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

/**
 * Get rubric by exercise type
 */
export const getRubricByType = (exerciseType: string): ExerciseRubric | undefined => {
  return RUBRICS_BY_TYPE[exerciseType];
};

/**
 * Get all rubrics for a module
 */
export const getRubricsByModule = (moduleNumber: number): ExerciseRubric[] => {
  return Object.values(RUBRICS_BY_TYPE).filter(
    (rubric) => rubric.moduleNumber === moduleNumber
  );
};

/**
 * Calculate weighted score from criterion scores
 */
export const calculateWeightedScore = (
  rubric: ExerciseRubric,
  scores: Record<string, number>
): number => {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const criterion of rubric.criteria) {
    const score = scores[criterion.id] ?? 0;
    const maxLevelScore = Math.max(...criterion.levels.map((l) => l.score));
    const normalizedScore = (score / maxLevelScore) * criterion.maxPoints;
    totalWeightedScore += normalizedScore * criterion.weight;
    totalWeight += criterion.maxPoints * criterion.weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((totalWeightedScore / totalWeight) * 100);
};
