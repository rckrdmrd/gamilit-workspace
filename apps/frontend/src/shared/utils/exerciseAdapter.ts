// ============================================
// EXERCISE DATA ADAPTER
// Converts ExerciseData from ExercisePage to specific mechanic formats
// ============================================
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  BaseExercise,
  DifficultyLevel,
  DifficultyLevelEnum,
} from '@shared/components/mechanics/mechanicsTypes';

/**
 * Generic ExerciseData type from ExercisePage
 */
export interface ExerciseData {
  id: string;
  module_id: string;
  title: string;
  type: string;
  description: string;
  difficulty: DifficultyLevel; // Uses official CEFR enum
  points: number;
  estimatedTime: number;
  completed: boolean;
  moduleTitle?: string;
  mechanicData?: Record<string, any>;
}

/**
 * Maps difficulty levels - validates against DifficultyLevel enum
 */
const mapDifficulty = (difficulty: unknown): DifficultyLevel => {
  // Handle legacy string values
  const legacyMap: Record<string, DifficultyLevel> = {
    facil: DifficultyLevelEnum.BEGINNER,
    medio: DifficultyLevelEnum.INTERMEDIATE,
    dificil: DifficultyLevelEnum.ADVANCED,
    experto: DifficultyLevelEnum.PROFICIENT,
  };

  // If it's a legacy value, map it
  if (typeof difficulty === 'string' && legacyMap[difficulty]) {
    return legacyMap[difficulty];
  }

  // If it's already a valid DifficultyLevel, return it
  const validValues = Object.values(DifficultyLevelEnum) as unknown[];
  if (validValues.includes(difficulty)) {
    return difficulty as DifficultyLevel;
  }

  // Default to INTERMEDIATE (B2)
  return DifficultyLevelEnum.INTERMEDIATE;
};

/**
 * Converts ExerciseData to BaseExercise format
 * This creates the base structure that all mechanics extend from
 */
export const adaptToBaseExercise = (exercise: ExerciseData): BaseExercise => {
  return {
    id: exercise.id,
    title: exercise.title,
    difficulty: mapDifficulty(exercise.difficulty),
    estimatedTime: exercise.estimatedTime,
    topic: exercise.moduleTitle || exercise.type,
    // hints are handled separately in mechanic-specific adapters
  };
};

/**
 * Generates crossword grid from clues
 */
const generateGridFromClues = (clues: any[], rows: number, cols: number): any[][] => {
  // Initialize empty grid
  const grid: any[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = {
        row: r,
        col: c,
        letter: '',
        isBlack: true,
        userInput: '',
      };
    }
  }

  // Fill grid with letters from clues
  clues.forEach((clue) => {
    const { answer, startRow, startCol, direction, number } = clue;

    for (let i = 0; i < answer.length; i++) {
      let row, col;
      if (direction === 'horizontal') {
        row = startRow;
        col = startCol + i;
      } else {
        row = startRow + i;
        col = startCol;
      }

      if (row < rows && col < cols) {
        const existingCell = grid[row][col];

        // Check if this is the first letter of the word
        if (i === 0) {
          // Cell already has content - merge numbers
          if (!existingCell.isBlack && existingCell.number !== undefined) {
            grid[row][col] = {
              ...existingCell,
              letter: answer[i],
              numbers: existingCell.numbers
                ? [...existingCell.numbers, number].sort((a, b) => a - b)
                : [existingCell.number, number].sort((a, b) => a - b),
              number: undefined, // Clear single number, use array instead
            };
          } else {
            // First word in this cell
            grid[row][col] = {
              row,
              col,
              letter: answer[i],
              isBlack: false,
              number: number,
              userInput: '',
            };
          }
        } else {
          // Not the first letter - only update if cell is black or preserve existing
          if (existingCell.isBlack) {
            grid[row][col] = {
              row,
              col,
              letter: answer[i],
              isBlack: false,
              userInput: '',
            };
          }
          // If cell already has a letter (intersection), keep it as is
        }
      }
    }
  });

  return grid;
};

/**
 * Adapts ExerciseData to CrucigramaData format
 *
 * NEW (SECURE): Backend pre-generates grid without answers
 * FALLBACK: If old format, generate locally (backwards compatibility)
 */
export const adaptToCrucigramaData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get clues and grid from mechanicData.content
  const content = exercise.mechanicData?.content || {};

  // NEW FORMAT: Backend sends pre-built grid (SECURE)
  // Check if backend sent pre-generated grid (Array format)
  if (Array.isArray(content.grid) && content.gridConfig) {
    return {
      ...base,
      grid: content.grid, // Pre-built grid WITHOUT answers
      clues: content.clues || [], // Clues WITHOUT answer field
      rows: content.gridConfig.rows,
      cols: content.gridConfig.cols,
    };
  }

  // FALLBACK: Old format - generate grid locally (BACKWARDS COMPATIBILITY)
  console.warn('[FALLBACK] Generating grid locally - consider updating backend');

  // Use words array for grid generation (new format)
  // or fall back to clues array (old format)
  let wordsForGrid: any[] = [];
  if (content.words && Array.isArray(content.words)) {
    // New format: words array with word, startRow, startCol, direction
    wordsForGrid = content.words.map((w: any) => ({
      answer: w.word,
      startRow: w.startRow,
      startCol: w.startCol,
      direction: w.direction,
      number: w.clueNumber,
    }));
  } else if (Array.isArray(content.clues)) {
    // Old format: direct clues array
    wordsForGrid = content.clues;
  } else if (content.clues && typeof content.clues === 'object') {
    // Alternative old format: { vertical: [], horizontal: [] }
    const vertical = (content.clues.vertical || []).map((c: any) => ({
      answer: c.word || c.answer,
      startRow: c.startRow || 0,
      startCol: c.startCol || 0,
      direction: 'vertical',
      number: c.number,
    }));
    const horizontal = (content.clues.horizontal || []).map((c: any) => ({
      answer: c.word || c.answer,
      startRow: c.startRow || 0,
      startCol: c.startCol || 0,
      direction: 'horizontal',
      number: c.number,
    }));
    wordsForGrid = [...vertical, ...horizontal];
  }

  // Get grid config or use default
  const gridConfig = content.grid || { rows: 15, cols: 15 };
  const rows = gridConfig.rows || 15;
  const cols = gridConfig.cols || 15;

  // Generate grid from words (OLD WAY)
  const grid = generateGridFromClues(wordsForGrid, rows, cols);

  // Convert clues to flat array format expected by CrucigramaExercise component
  let cluesArray: any[] = [];
  if (content.clues && typeof content.clues === 'object' && !Array.isArray(content.clues)) {
    // New format: { vertical: [], horizontal: [] } + words array with positions
    const words = content.words || [];

    const vertical = (content.clues.vertical || []).map((c: any) => {
      const wordData = words.find(
        (w: any) => w.clueNumber === c.number && w.direction === 'vertical',
      );
      return {
        ...c,
        id: `v${c.number}`,
        direction: 'vertical',
        answer: c.word,
        startRow: wordData?.startRow || 0,
        startCol: wordData?.startCol || 0,
      };
    });

    const horizontal = (content.clues.horizontal || []).map((c: any) => {
      const wordData = words.find(
        (w: any) => w.clueNumber === c.number && w.direction === 'horizontal',
      );
      return {
        ...c,
        id: `h${c.number}`,
        direction: 'horizontal',
        answer: c.word,
        startRow: wordData?.startRow || 0,
        startCol: wordData?.startCol || 0,
      };
    });

    cluesArray = [...horizontal, ...vertical];
  } else if (Array.isArray(content.clues)) {
    // Old format: already an array
    cluesArray = content.clues;
  }

  return {
    ...base,
    grid,
    clues: cluesArray, // Flat array for component
    rows,
    cols,
  };
};

/**
 * Adapts ExerciseData to TimelineData format
 */
export const adaptToTimelineData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get data from mechanicData.content
  const content = exercise.mechanicData?.content || {};
  const solution = exercise.mechanicData?.solution || {};

  return {
    ...base,
    events: content.events || [],
    correctOrder: solution.correctOrder || [],
    categories: content.categories || [],
  };
};

/**
 * Adapts ExerciseData to VerdaderoFalsoData format
 */
export const adaptToVerdaderoFalsoData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get data from mechanicData.content
  const content = exercise.mechanicData?.content || {};

  return {
    ...base,
    contextText: content.contextText || '',
    statements: content.statements || [],
  };
};

/**
 * Adapts ExerciseData to EmparejamientoData format
 */
export const adaptToEmparejamientoData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get data from mechanicData.content
  const content = exercise.mechanicData?.content || {};

  // Convert pairs to cards format
  const pairs = content.pairs || [];
  const cards: any[] = [];

  pairs.forEach((pair: any) => {
    cards.push({
      id: pair.left.id,
      content: pair.left.content,
      matchId: pair.id,
      type: 'question',
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: pair.right.id,
      content: pair.right.content,
      matchId: pair.id,
      type: 'answer',
      isFlipped: false,
      isMatched: false,
    });
  });

  return {
    ...base,
    scenarioText: content.scenarioText || '',
    cards,
  };
};

/**
 * Adapts ExerciseData to CompletarEspaciosData format
 */
export const adaptToCompletarEspaciosData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get data from mechanicData.content
  const content = exercise.mechanicData?.content || {};

  return {
    ...base,
    scenarioText: content.scenarioText || '',
    text: content.text || '',
    blanks: content.blanks || [],
    wordBank: content.wordBank || [],
  };
};

/**
 * Adapts ExerciseData to SopaLetrasData format
 */
export const adaptToSopaLetrasData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get config and content from mechanicData
  const config = exercise.mechanicData?.config || {};
  const content = exercise.mechanicData?.content || {};

  // Mock data for sopa de letras - fallback if no data from backend
  const mockGrid = [
    ['M', 'A', 'R', 'I', 'E'],
    ['C', 'U', 'R', 'I', 'E'],
  ];

  const mockWords = ['MARIE', 'CURIE'];
  const mockWordsPositions = [
    { word: 'MARIE', found: false, startRow: 0, startCol: 0, direction: 'horizontal' as const },
    { word: 'CURIE', found: false, startRow: 1, startCol: 0, direction: 'horizontal' as const },
  ];

  // Build config object
  const gridSize = config.gridSize || { rows: mockGrid.length, cols: mockGrid[0]?.length || 5 };

  const sopaConfig = {
    gridSize,
    useStaticGrid: config.useStaticGrid || false,
    directions: config.directions || ['horizontal', 'vertical', 'diagonal'],
    selectionMode: config.selectionMode || 'click-drag',
    highlightFound: config.highlightFound !== undefined ? config.highlightFound : true,
  };

  // Build content object
  const sopaContent = {
    grid: content.grid || mockGrid,
    words: content.words || mockWords,
    wordsPositions: content.wordsPositions || mockWordsPositions,
  };

  return {
    ...base,
    config: sopaConfig,
    content: sopaContent,
    // Keep convenience properties for backward compatibility
    rows: gridSize.rows,
    cols: gridSize.cols,
  };
};

/**
 * Adapts ExerciseData to MapaConceptualData format
 */
export const adaptToMapaConceptualData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Mock data for mapa conceptual - In production, this would come from mechanicData
  const mockNodes = [
    { id: '1', label: 'Marie Curie', x: 300, y: 100, type: 'central' as const },
    { id: '2', label: 'Polonia', x: 100, y: 200, type: 'secondary' as const },
    { id: '3', label: 'París', x: 500, y: 200, type: 'secondary' as const },
  ];

  const mockConnections = ['1-2', '1-3'];

  return {
    ...base,
    nodes: exercise.mechanicData?.nodes || mockNodes,
    correctConnections: exercise.mechanicData?.correctConnections || mockConnections,
  };
};

/**
 * Adapts ExerciseData to LecturaInferencialData format
 * Module 2 - Reading comprehension with multiple choice inference questions
 */
export const adaptToLecturaInferencialData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get config and content from mechanicData
  const config = exercise.mechanicData?.config || {};
  const content = exercise.mechanicData?.content || {};

  // Build config object with defaults
  const lecturaConfig = {
    timePerQuestion: config.timePerQuestion || 90,
    allowReview: config.allowReview !== undefined ? config.allowReview : true,
    showExplanations: config.showExplanations !== undefined ? config.showExplanations : true,
    shuffleQuestions: config.shuffleQuestions || false,
    shuffleOptions: config.shuffleOptions || false,
  };

  // Build content object
  const lecturaContent = {
    passage: content.passage || '',
    questions: content.questions || [],
  };

  return {
    ...base,
    config: lecturaConfig,
    content: lecturaContent,
  };
};

/**
 * Adapts ExerciseData to CausaEfectoData format
 * Module 2 - Cause-Effect relationships with drag & drop
 */
export const adaptToCausaEfectoData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get config and content from mechanicData
  const config = exercise.mechanicData?.config || {};
  const content = exercise.mechanicData?.content || {};

  // Build config object with defaults
  const causaEfectoConfig = {
    allowMultiple: config.allowMultiple !== undefined ? config.allowMultiple : true,
    showFeedback: config.showFeedback !== undefined ? config.showFeedback : true,
    dragAndDrop: config.dragAndDrop !== undefined ? config.dragAndDrop : true,
  };

  // Build content object
  const causaEfectoContent = {
    causes: content.causes || [],
    consequences: content.consequences || [],
  };

  return {
    ...base,
    config: causaEfectoConfig,
    content: causaEfectoContent,
  };
};

/**
 * Adapts ExerciseData to PrediccionNarrativaData format
 * Module 2 - Narrative prediction with multiple choice scenarios
 */
export const adaptToPrediccionNarrativaData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get content from mechanicData
  const content = exercise.mechanicData?.content || {};

  return {
    ...base,
    subtitle: exercise.mechanicData?.subtitle || '',
    description: exercise.description || '',
    instructions: exercise.mechanicData?.instructions || '',
    scenarios: content.scenarios || [],
  };
};

/**
 * Adapts ExerciseData to PuzzleContextoData format
 * Module 2 - Ordering fragments to create a coherent inference
 */
export const adaptToPuzzleContextoData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get content and solution from mechanicData
  const content = exercise.mechanicData?.content || {};
  const solution = exercise.mechanicData?.solution || {};

  return {
    ...base,
    subtitle: exercise.mechanicData?.subtitle || '',
    description: exercise.description || '',
    instructions: exercise.mechanicData?.instructions || '',
    completeInference: content.completeInference || '',
    fragments: content.fragments || [],
    correctOrder: solution.correctOrder || [],
  };
};

/**
 * Adapts ExerciseData to TribunalOpinionesData format
 * Module 3 - Classify statements as HECHO/OPINIÓN/INTERPRETACIÓN
 *
 * Expected database format (v6.3):
 * content: {
 *   statements: [
 *     { id: "stmt-1", text: "...", correctClassification: "hecho", correctVerdict: "bien_fundamentada", explanation: "..." }
 *   ]
 * }
 */
export const adaptToTribunalOpinionesData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);

  // Get config and content from mechanicData
  const config = exercise.mechanicData?.config || {};
  const content = exercise.mechanicData?.content || {};

  // Build config object with defaults
  const tribunalConfig = {
    dragAndDrop: config.dragAndDrop !== undefined ? config.dragAndDrop : false,
    requireJustification:
      config.requireJustification !== undefined ? config.requireJustification : false,
    showHints: config.showHints !== undefined ? config.showHints : true,
  };

  // Get statements from database content (v6.3 format)
  const statements = content.statements || [];

  if (statements.length === 0) {
    console.warn('[TribunalOpiniones] No statements found in exercise content');
  }

  // Build content object with statements
  const tribunalContent = {
    statements,
    evaluationCriteria: content.evaluationCriteria || {
      evidencia: '¿Hay datos verificables que respalden la afirmación?',
      logica: '¿El razonamiento es válido y coherente?',
      falacias: '¿Evita errores lógicos comunes?',
    },
    classificationHelp: content.classificationHelp || {
      hecho: 'Dato verificable objetivamente con fuentes documentadas',
      opinion: 'Juicio de valor subjetivo sin criterios objetivos de verificación',
      interpretacion: 'Deducción razonable basada en evidencia pero no 100% demostrable',
    },
  };

  return {
    ...base,
    description: exercise.description || '',
    instructions:
      exercise.mechanicData?.instructions ||
      'Clasifica cada afirmación y evalúa si está bien fundamentada.',
    config: tribunalConfig,
    content: tribunalContent,
  };
};

// ============================================================================
// MODULE 4 ADAPTERS - Textos Digitales y Multimediales
// ============================================================================

/**
 * Adapts ExerciseData to QuizTikTokData format
 * Module 4 - Quick quiz with TikTok-style interface
 *
 * DB format: { questions: [{ id, text, options, correct, timeLimit, visual }] }
 * Component expects: { questions: [{ id, question, options, correctAnswer, backgroundColor }] }
 */
export const adaptToQuizTikTokData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);
  const content = exercise.mechanicData?.content || {};

  // Default colors for TikTok-style backgrounds
  const defaultColors = ['#1f2937', '#7c3aed', '#ea580c', '#2563eb', '#059669', '#dc2626', '#0891b2'];

  // Transform questions from DB format to component format
  const questions = (content.questions || []).map((q: any, index: number) => ({
    id: q.id || `q${index + 1}`,
    question: q.text || q.question || '',  // DB uses 'text', component uses 'question'
    options: q.options || [],
    correctAnswer: q.correct ?? q.correctAnswer ?? 0,  // DB uses 'correct', component uses 'correctAnswer'
    backgroundColor: q.backgroundColor || defaultColors[index % defaultColors.length],
    backgroundVideo: q.visual,
  }));

  const config = exercise.mechanicData?.config || {};

  return {
    ...base,
    description: exercise.description || '',
    hints: exercise.mechanicData?.hints || [],
    questions,
    timeLimit: config.timeLimit || 20,
  };
};

/**
 * Adapts ExerciseData to InfografiaInteractivaData format
 * Module 4 - Interactive infographic exploration
 *
 * DB format: { infographic: { title, sections: [{ id, type, data }], questions: [...] } }
 * Component expects: { cards: [{ id, title, content, position, icon, revealed }] }
 */
export const adaptToInfografiaInteractivaData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);
  const content = exercise.mechanicData?.content || {};
  const infographic = content.infographic || {};

  // Icon mapping based on section type
  const iconMap: Record<string, string> = {
    'timeline': 'calendar',
    'visual timeline': 'calendar',
    'icon grid': 'grid',
    'discoveries': 'atom',
    'flowchart': 'workflow',
    'impact': 'heart',
    'default': 'info'
  };

  // Transform sections to cards format
  const sections = infographic.sections || [];
  const cards = sections.map((section: any, index: number) => {
    // Calculate grid position (3 columns)
    const col = index % 3;
    const row = Math.floor(index / 3);

    return {
      id: section.id || `card-${index + 1}`,
      title: section.title || section.type || `Sección ${index + 1}`,
      content: section.data || '',
      position: {
        x: 20 + (col * 30),  // 20%, 50%, 80%
        y: 30 + (row * 40)   // 30%, 70%
      },
      icon: iconMap[section.type?.toLowerCase()] || iconMap['default'],
      revealed: false,
    };
  });

  // If no sections, create default cards
  if (cards.length === 0) {
    cards.push({
      id: 'card-default',
      title: infographic.title || 'Información',
      content: 'Explora esta sección para descubrir más información.',
      position: { x: 50, y: 50 },
      icon: 'info',
      revealed: false,
    });
  }

  return {
    ...base,
    description: exercise.description || '',
    hints: exercise.mechanicData?.hints || [],
    cards,
    backgroundImage: infographic.backgroundImage,
    questions: infographic.questions || [],
  };
};

/**
 * Adapts ExerciseData to VerificadorFakeNewsData format
 * Module 4 - Fact-checking articles
 */
export const adaptToVerificadorFakeNewsData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);
  const content = exercise.mechanicData?.content || {};
  const config = exercise.mechanicData?.config || {};

  return {
    ...base,
    description: exercise.description || '',
    hints: exercise.mechanicData?.hints || [],
    articles: content.articles || [],
    verificationTools: content.verificationTools || [],
    config: {
      factCheckTools: config.factCheckTools ?? true,
      sourceVerification: config.sourceVerification ?? true,
      claimExtraction: config.claimExtraction ?? true,
      confidenceScoring: config.confidenceScoring ?? true,
    },
  };
};

/**
 * Adapts ExerciseData to NavegacionHipertextualData format
 * Module 4 - Hyperlink navigation
 */
export const adaptToNavegacionHipertextualData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);
  const content = exercise.mechanicData?.content || {};

  // Map nodes from content.nodes or content.articles
  const nodes = content.nodes || content.articles || [];

  return {
    ...base,
    description: exercise.description || '',
    hints: exercise.mechanicData?.hints || [],
    // Required fields for NavegacionHipertextualExercise component
    nodes: nodes,
    startNodeId: content.startNodeId || content.start_node_id || (nodes[0]?.id || ''),
    targetNodeId: content.targetNodeId || content.target_node_id || (nodes[nodes.length - 1]?.id || ''),
    // Legacy fields (kept for compatibility)
    researchQuestion: content.researchQuestion || '',
    mainArticle: content.mainArticle || {},
    optimalPath: content.optimalPath || [],
  };
};

/**
 * Adapts ExerciseData to AnalisisMemesData format
 * Module 4 - Meme analysis
 *
 * Maps content.memes[0].imageUrl → memeUrl for the component, plus passes
 * the full memes array for multi-meme navigation support.
 * @returns AnalisisMemesData (typed as any per adapter pattern — see eslint-disable L5)
 */
export const adaptToAnalisisMemesData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);
  const content = exercise.mechanicData?.content || {};
  const firstMeme = content.memes?.[0];

  return {
    ...base,
    description: exercise.description || '',
    hints: exercise.mechanicData?.hints || [],
    memeUrl: firstMeme?.imageUrl || '',
    memeTitle: firstMeme?.format ? `${firstMeme.format}: ${base.title}` : base.title,
    expectedAnnotations: [],
    memes: content.memes || [],
    analysisQuestions: content.questions || [],
  };
};

// ============================================================================
// MODULE 5 ADAPTERS - Producción Creativa
// ============================================================================

/**
 * Adapts ExerciseData to DiarioMultimediaData format
 * Module 5 - Multimedia diary
 */
export const adaptToDiarioMultimediaData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);
  const content = exercise.mechanicData?.content || {};

  return {
    ...base,
    description: exercise.description || '',
    hints: exercise.mechanicData?.hints || [],
    themes: content.themes || [],
    prompts: content.prompts || [],
    config: exercise.mechanicData?.config || {},
  };
};

/**
 * Adapts ExerciseData to ComicDigitalData format
 * Module 5 - Digital comic creation
 */
export const adaptToComicDigitalData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);
  const content = exercise.mechanicData?.content || {};

  return {
    ...base,
    description: exercise.description || '',
    hints: exercise.mechanicData?.hints || [],
    layouts: content.layouts || [],
    backgrounds: content.backgrounds || [],
    templates: content.templates || [],
    config: exercise.mechanicData?.config || {},
  };
};

/**
 * Adapts ExerciseData to VideoCartaData format
 * Module 5 - Video letter creation
 */
export const adaptToVideoCartaData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);
  const content = exercise.mechanicData?.content || {};

  return {
    ...base,
    description: exercise.description || '',
    hints: exercise.mechanicData?.hints || [],
    sections: content.sections || [],
    recipient: content.recipient || {},
    filters: content.filters || [],
    config: exercise.mechanicData?.config || {},
  };
};

// ============================================================================
// AUXILIARY ADAPTERS
// ============================================================================

/**
 * Adapts ExerciseData to ComprensiónAuditivaData format
 * BACKLOG: comprension_auditiva desactivada. Adapter preservado para reactivacion futura.
 * Auxiliary - Listening comprehension with timed questions
 *
 * Maps content.audioUrl, content.questions[] and audio metadata.
 * @returns ComprensiónAuditivaData (typed as any per adapter pattern — see eslint-disable L5)
 */
export const adaptToComprensionAuditivaData = (exercise: ExerciseData): any => {
  const base = adaptToBaseExercise(exercise);
  const content = exercise.mechanicData?.content || {};

  return {
    ...base,
    description: exercise.description || '',
    hints: exercise.mechanicData?.hints || [],
    audioUrl: content.audioUrl || '',
    audioTitle: content.audioTitle || base.title,
    audioDuration: content.audioDuration || 180,
    questions: content.questions || [],
    maxReplays: content.maxReplays,
    transcriptAvailable: content.transcriptAvailable,
  };
};

// ============================================================================
// MAIN ADAPTER ROUTER
// ============================================================================

/**
 * Generic adapter that routes to the correct specific adapter based on exercise type
 */
export const adaptExerciseData = (exercise: ExerciseData): any => {
  // Validate exercise and type
  if (!exercise) {
    console.error('adaptExerciseData: exercise is null or undefined');
    return null;
  }

  if (!exercise.type || typeof exercise.type !== 'string') {
    console.error('adaptExerciseData: exercise.type is invalid:', exercise.type);
    // Return base exercise with default values
    return adaptToBaseExercise(exercise);
  }

  const type = exercise.type.toLowerCase();

  if (type.includes('crucigrama')) {
    return adaptToCrucigramaData(exercise);
  } else if (type.includes('timeline') || type.includes('linea_tiempo')) {
    return adaptToTimelineData(exercise);
  } else if (type.includes('verdadero_falso') || type.includes('true_false')) {
    return adaptToVerdaderoFalsoData(exercise);
  } else if (type.includes('emparejamiento') || type.includes('matching')) {
    return adaptToEmparejamientoData(exercise);
  } else if (type.includes('completar_espacios') || type.includes('fill_in_blank')) {
    return adaptToCompletarEspaciosData(exercise);
  } else if (type.includes('sopa_letras')) {
    return adaptToSopaLetrasData(exercise);
  } else if (type.includes('mapa_conceptual') || type.includes('mapa conceptual')) {
    return adaptToMapaConceptualData(exercise);
  } else if (type.includes('lectura_inferencial') || type.includes('detective_textual')) {
    return adaptToLecturaInferencialData(exercise);
  } else if (type.includes('construccion_hipotesis')) {
    return adaptToCausaEfectoData(exercise);
  } else if (type.includes('prediccion_narrativa')) {
    return adaptToPrediccionNarrativaData(exercise);
  } else if (type.includes('puzzle_contexto')) {
    return adaptToPuzzleContextoData(exercise);
  } else if (type.includes('tribunal_opiniones')) {
    return adaptToTribunalOpinionesData(exercise);
  }

  // ========================================
  // MODULE 4 - Textos Digitales y Multimediales
  // ========================================
  else if (type.includes('quiz_tiktok') || type.includes('tiktok')) {
    return adaptToQuizTikTokData(exercise);
  } else if (type.includes('infografia_interactiva') || type.includes('infografia')) {
    return adaptToInfografiaInteractivaData(exercise);
  } else if (type.includes('verificador_fake_news') || type.includes('fake_news') || type.includes('fakenews')) {
    return adaptToVerificadorFakeNewsData(exercise);
  } else if (type.includes('navegacion_hipertextual') || type.includes('hipertextual')) {
    return adaptToNavegacionHipertextualData(exercise);
  } else if (type.includes('analisis_memes') || type.includes('memes')) {
    return adaptToAnalisisMemesData(exercise);
  }

  // ========================================
  // MODULE 5 - Producción Creativa
  // ========================================
  else if (type.includes('diario_multimedia')) {
    return adaptToDiarioMultimediaData(exercise);
  } else if (type.includes('comic_digital')) {
    return adaptToComicDigitalData(exercise);
  } else if (type.includes('video_carta')) {
    return adaptToVideoCartaData(exercise);
  }

  // ========================================
  // AUXILIARY MECHANICS
  // ========================================
  // BACKLOG: comprension_auditiva desactivada. Adapter router branch preservado.
  else if (type.includes('comprension_auditiva') || type.includes('comprensión_auditiva')) {
    return adaptToComprensionAuditivaData(exercise);
  }

  // Default: return base exercise data
  console.warn(`[exerciseAdapter] No specific adapter for type: ${type}. Using base adapter.`);
  return adaptToBaseExercise(exercise);
};
