/**
 * Manual Review Exercises Configuration
 *
 * Exercises from modules 3, 4, and 5 that require manual teacher review.
 * These exercises have auto_gradable = false in the database.
 *
 * @module apps/teacher/constants/manualReviewExercises
 */

export interface ManualReviewExercise {
  id: string;
  title: string;
  moduleId: string;
  moduleName: string;
  moduleNumber: number;
}

/**
 * Modules that contain exercises requiring manual review
 */
export const MANUAL_REVIEW_MODULES = [
  { id: 'module-3', name: 'Comprensión Crítica', number: 3 },
  { id: 'module-4', name: 'Lectura Digital', number: 4 },
  { id: 'module-5', name: 'Producción Lectora', number: 5 },
] as const;

/**
 * Exercises that require manual review by teachers
 * Organized by module for easier filtering
 */
export const MANUAL_REVIEW_EXERCISES: ManualReviewExercise[] = [
  // Módulo 3 - Comprensión Crítica (5 ejercicios con evaluación manual)
  {
    id: 'tribunal-opiniones',
    title: 'Tribunal de Opiniones',
    moduleId: 'module-3',
    moduleName: 'Comprensión Crítica',
    moduleNumber: 3,
  },
  {
    id: 'analisis-fuentes',
    title: 'Análisis de Fuentes',
    moduleId: 'module-3',
    moduleName: 'Comprensión Crítica',
    moduleNumber: 3,
  },
  {
    id: 'debate-digital',
    title: 'Debate Digital',
    moduleId: 'module-3',
    moduleName: 'Comprensión Crítica',
    moduleNumber: 3,
  },
  {
    id: 'podcast-argumentativo',
    title: 'Podcast Argumentativo',
    moduleId: 'module-3',
    moduleName: 'Comprensión Crítica',
    moduleNumber: 3,
  },
  {
    id: 'matriz-perspectivas',
    title: 'Matriz de Perspectivas',
    moduleId: 'module-3',
    moduleName: 'Comprensión Crítica',
    moduleNumber: 3,
  },

  // Módulo 4 - Lectura Digital (4 ejercicios con evaluación manual)
  // Nota: quiz_tiktok es auto-gradable y NO está en esta lista (CORR-FE-CONST-001)
  {
    id: 'verificador-fake-news',
    title: 'Verificador de Fake News',
    moduleId: 'module-4',
    moduleName: 'Lectura Digital',
    moduleNumber: 4,
  },
  {
    id: 'infografia-interactiva',
    title: 'Infografía Interactiva',
    moduleId: 'module-4',
    moduleName: 'Lectura Digital',
    moduleNumber: 4,
  },
  {
    id: 'navegacion-hipertextual',
    title: 'Navegación Hipertextual',
    moduleId: 'module-4',
    moduleName: 'Lectura Digital',
    moduleNumber: 4,
  },
  {
    id: 'analisis-memes',
    title: 'Análisis de Memes',
    moduleId: 'module-4',
    moduleName: 'Lectura Digital',
    moduleNumber: 4,
  },

  // Módulo 5 - Producción Lectora (3 ejercicios - alumno elige 1)
  {
    id: 'diario-multimedia',
    title: 'Diario Multimedia',
    moduleId: 'module-5',
    moduleName: 'Producción Lectora',
    moduleNumber: 5,
  },
  {
    id: 'comic-digital',
    title: 'Comic Digital',
    moduleId: 'module-5',
    moduleName: 'Producción Lectora',
    moduleNumber: 5,
  },
  {
    id: 'video-carta',
    title: 'Video Carta',
    moduleId: 'module-5',
    moduleName: 'Producción Lectora',
    moduleNumber: 5,
  },
];

/**
 * Get exercises filtered by module
 */
export const getExercisesByModule = (moduleId: string): ManualReviewExercise[] => {
  if (!moduleId) return MANUAL_REVIEW_EXERCISES;
  return MANUAL_REVIEW_EXERCISES.filter((ex) => ex.moduleId === moduleId);
};

/**
 * Get exercise by ID
 */
export const getExerciseById = (exerciseId: string): ManualReviewExercise | undefined => {
  return MANUAL_REVIEW_EXERCISES.find((ex) => ex.id === exerciseId);
};
