import React from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Music,
  Type,
  Grid3X3,
  ListChecks,
  Link2,
  // TASK-2026-01-19-010: Iconos adicionales para renderers M3-M5
  Award,
  BarChart3,
  MessageSquare,
  Scale,
  Shield,
  Zap,
  Bookmark,
  Map,
  Image,
  Layers,
  BookOpen,
  Palette,
  Video,
  Calendar,
  Hash,
} from 'lucide-react';

interface ExerciseContentRendererProps {
  exerciseType: string;
  answerData: Record<string, unknown>;
  correctAnswer?: Record<string, unknown>;
  showComparison?: boolean;
}

/**
 * Renderiza contenido de respuestas según el tipo de ejercicio
 *
 * Este componente toma las respuestas JSON de ejercicios y las presenta
 * de forma visual y legible para profesores y estudiantes.
 *
 * @example
 * ```tsx
 * <ExerciseContentRenderer
 *   exerciseType="podcast_argumentativo"
 *   answerData={student.answerData}
 *   showComparison={false}
 * />
 * ```
 */
export const ExerciseContentRenderer: React.FC<ExerciseContentRendererProps> = ({
  exerciseType,
  answerData,
  correctAnswer,
  showComparison = false,
}) => {
  // Renderizar según tipo de ejercicio
  switch (exerciseType) {
    case 'podcast_argumentativo':
      return <PodcastRenderer data={answerData} />;

    case 'verdadero_falso':
      return (
        <VerdaderoFalsoRenderer
          data={answerData}
          correct={correctAnswer}
          showComparison={showComparison}
        />
      );

    case 'completar_espacios':
      return (
        <CompletarEspaciosRenderer
          data={answerData}
          correct={correctAnswer}
          showComparison={showComparison}
        />
      );

    case 'crucigrama':
      return <CrucigramaRenderer data={answerData} />;

    case 'sopa_letras':
      return <SopaLetrasRenderer data={answerData} />;

    case 'mapa_conceptual':
      return <MapaConceptualRenderer data={answerData} />;

    case 'timeline':
      return <TimelineRenderer data={answerData} />;

    case 'emparejamiento':
      return (
        <EmparejamientoRenderer
          data={answerData}
          correct={correctAnswer}
          showComparison={showComparison}
        />
      );

    // Módulo 2 - Automáticos (opción múltiple)
    case 'lectura_inferencial':
    case 'puzzle_contexto':
    case 'detective_textual':
    case 'rueda_inferencias':
    case 'causa_efecto':
      return (
        <MultipleChoiceRenderer
          data={answerData}
          correct={correctAnswer}
          showComparison={showComparison}
        />
      );

    // Módulo 2 - Manuales (texto abierto)
    // P0-03: Moved prediccion_narrativa to TextResponseRenderer (2025-12-18)
    case 'prediccion_narrativa':
      return <TextResponseRenderer data={answerData} />;

    // Módulo 3 - Manuales (texto/análisis) - TASK-2026-01-19-010: Renderers específicos
    case 'analisis_fuentes':
      return <AnalisisFuentesRenderer data={answerData} />;

    case 'debate_digital':
      return <DebateDigitalRenderer data={answerData} />;

    case 'matriz_perspectivas':
      return <MatrizPerspectivasRenderer data={answerData} />;

    case 'tribunal_opiniones':
      return <TribunalOpinionesRenderer data={answerData} />;

    // P0-03: Added missing auxiliary mechanics (2025-12-18)
    case 'collage_prensa':
    case 'call_to_action':
    case 'texto_en_movimiento':
      return <TextResponseRenderer data={answerData} />;

    // Módulo 4 - Alfabetización Digital - TASK-2026-01-19-010: Renderers específicos
    case 'verificador_fake_news':
      return <VerificadorFakeNewsRenderer data={answerData} />;

    case 'quiz_tiktok':
      return <QuizTikTokRenderer data={answerData} />;

    case 'analisis_memes':
      return <AnalisisMemesRenderer data={answerData} />;

    case 'infografia_interactiva':
      return <InfografiaInteractivaRenderer data={answerData} />;

    case 'navegacion_hipertextual':
      return <NavegacionHipertextualRenderer data={answerData} />;

    // Módulo 5 - Producción Creativa - TASK-2026-01-19-010: Renderers específicos
    case 'diario_multimedia':
      return <DiarioMultimediaRenderer data={answerData} />;

    case 'comic_digital':
      return <ComicDigitalRenderer data={answerData} />;

    case 'video_carta':
      return <VideoCartaRenderer data={answerData} />;

    default:
      // TASK-2026-01-18-010: Pasar tipo para diagnóstico
      return <FallbackRenderer data={answerData} exerciseType={exerciseType} />;
  }
};

// Sub-componentes para cada tipo:

/**
 * Renderiza respuestas del ejercicio Podcast Argumentativo
 * Muestra el tema seleccionado, guión y archivo de audio
 */
const PodcastRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const topicId = data.topicId as string;
  const script = data.script as string;
  const audioUrl = data.audioUrl as string | undefined;

  const topicNames: Record<string, string> = {
    'topic-1': 'Sacrificio Personal vs Bienestar Familiar',
    'topic-2': 'Patentes vs Ciencia Abierta',
    'topic-3': 'Responsabilidad del Científico',
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-purple-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <span className="font-semibold text-purple-800">Tema seleccionado</span>
        </div>
        <p className="text-purple-700">{topicNames[topicId] || topicId}</p>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Type className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-blue-800">Guión del Podcast</span>
        </div>
        <p className="whitespace-pre-wrap text-gray-700">{script}</p>
      </div>

      {audioUrl && (
        <div className="rounded-lg bg-green-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Music className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Audio del Podcast</span>
          </div>
          <audio controls className="w-full">
            <source src={audioUrl} />
            Tu navegador no soporta audio.
          </audio>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TASK-2026-01-19-010: RENDERERS ESPECÍFICOS MÓDULO 3
// ============================================================================

/**
 * Renderiza respuestas del ejercicio Análisis de Fuentes
 * Muestra el ranking de credibilidad de fuentes ordenado
 * Formato: { ranking: ["src-3", "src-1", "src-2"] }
 */
const AnalisisFuentesRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const ranking = (data.ranking || []) as string[];
  const startedAt = data.startedAt as string | undefined;

  // Mapeo de IDs de fuentes a nombres legibles (si están disponibles)
  const sourceNames: Record<string, string> = {
    'src-1': 'Fuente 1',
    'src-2': 'Fuente 2',
    'src-3': 'Fuente 3',
    'src-4': 'Fuente 4',
    'src-5': 'Fuente 5',
  };

  const getMedalColor = (position: number): string => {
    switch (position) {
      case 0: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 1: return 'bg-gray-100 text-gray-700 border-gray-300';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getMedalEmoji = (position: number): string => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${position + 1}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-200">
        <div className="mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-600" />
          <span className="font-semibold text-indigo-800">Ranking de Credibilidad</span>
        </div>
        <p className="text-sm text-indigo-600 mb-3">
          Ordenado de más credible a menos credible según el análisis del estudiante:
        </p>
        <div className="space-y-2">
          {ranking.map((sourceId, idx) => (
            <div
              key={sourceId}
              className={`flex items-center gap-3 rounded-lg p-3 border ${getMedalColor(idx)}`}
            >
              <span className="text-xl">{getMedalEmoji(idx)}</span>
              <div className="flex-1">
                <span className="font-medium">{sourceNames[sourceId] || sourceId}</span>
                <span className="text-sm ml-2 opacity-75">
                  (Posición {idx + 1} de {ranking.length})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {startedAt && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Iniciado: {new Date(startedAt).toLocaleString('es-MX')}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Matriz de Perspectivas
 * Muestra las respuestas a las 3 preguntas de análisis
 * Formato: { questions: { q1: "respuesta1", q2: "respuesta2", q3: "respuesta3" } }
 */
const MatrizPerspectivasRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const questions = (data.questions || {}) as Record<string, string>;

  const questionLabels: Record<string, string> = {
    q1: '¿Cuál es la perspectiva principal del autor?',
    q2: '¿Qué evidencia presenta para apoyar su posición?',
    q3: '¿Qué perspectivas alternativas podrían existir?',
  };

  const questionColors: Record<string, string> = {
    q1: 'bg-purple-50 border-purple-200',
    q2: 'bg-blue-50 border-blue-200',
    q3: 'bg-green-50 border-green-200',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-5 w-5 text-purple-600" />
        <span className="font-semibold text-purple-800">Análisis de Perspectivas</span>
      </div>

      {Object.entries(questions).map(([key, value]) => (
        <div key={key} className={`rounded-lg p-4 border ${questionColors[key] || 'bg-gray-50 border-gray-200'}`}>
          <div className="mb-2 text-sm font-medium text-gray-600">
            {questionLabels[key] || `Pregunta ${key}`}
          </div>
          <p className="whitespace-pre-wrap text-gray-800">{value || '(Sin respuesta)'}</p>
          <div className="mt-2 text-xs text-gray-500">
            {value ? `${value.length} caracteres` : '0 caracteres'}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Debate Digital
 * Muestra la posición, argumentos y mensajes del debate
 * Formato: { position: 'a_favor'|'en_contra'|'neutral', response: string, arguments: string[], messageCount: number }
 */
const DebateDigitalRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const position = data.position as string;
  const response = data.response as string;
  const args = (data.arguments || []) as string[];
  const messageCount = data.messageCount as number;

  const positionConfig: Record<string, { label: string; color: string; icon: string }> = {
    'a_favor': { label: 'A Favor', color: 'bg-green-100 text-green-800 border-green-300', icon: '👍' },
    'en_contra': { label: 'En Contra', color: 'bg-red-100 text-red-800 border-red-300', icon: '👎' },
    'neutral': { label: 'Neutral', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '⚖️' },
  };

  const config = positionConfig[position] || positionConfig.neutral;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-blue-800">Debate Digital</span>
      </div>

      {/* Posición */}
      <div className={`rounded-lg p-4 border ${config.color}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{config.icon}</span>
          <span className="font-semibold">Posición: {config.label}</span>
        </div>
        {messageCount !== undefined && (
          <div className="text-sm opacity-75">
            Mensajes enviados: {messageCount}
          </div>
        )}
      </div>

      {/* Respuesta principal */}
      {response && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <div className="mb-2 font-medium text-blue-800">Respuesta Principal</div>
          <p className="whitespace-pre-wrap text-gray-800">{response}</p>
        </div>
      )}

      {/* Argumentos */}
      {args.length > 0 && (
        <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-200">
          <div className="mb-3 font-medium text-indigo-800">
            Argumentos ({args.length})
          </div>
          <ul className="space-y-2">
            {args.map((arg, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-200 text-indigo-800 text-sm flex items-center justify-center font-medium">
                  {idx + 1}
                </span>
                <span className="text-gray-700">{arg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Tribunal de Opiniones
 * Muestra las evaluaciones de afirmaciones con clasificación y veredicto
 * Formato: { evaluations: [{ statementId, classification, verdict, justification? }] }
 */
const TribunalOpinionesRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const evaluations = (data.evaluations || []) as Array<{
    statementId: string;
    classification: string;
    verdict: string;
    justification?: string;
  }>;

  const verdictConfig: Record<string, { color: string; icon: string }> = {
    'verdadero': { color: 'bg-green-100 text-green-800 border-green-300', icon: '✅' },
    'falso': { color: 'bg-red-100 text-red-800 border-red-300', icon: '❌' },
    'parcial': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⚠️' },
    'opinion': { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '💭' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-purple-600" />
        <span className="font-semibold text-purple-800">Tribunal de Opiniones</span>
        <span className="text-sm text-gray-500">({evaluations.length} evaluaciones)</span>
      </div>

      <div className="space-y-3">
        {evaluations.map((evaluation, idx) => {
          const config = verdictConfig[evaluation.verdict?.toLowerCase()] || verdictConfig.parcial;
          return (
            <div key={evaluation.statementId || idx} className={`rounded-lg p-4 border ${config.color}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{config.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Afirmación {idx + 1}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                      {evaluation.classification || 'Sin clasificar'}
                    </span>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Veredicto:</span> {evaluation.verdict}
                  </div>
                  {evaluation.justification && (
                    <div className="text-sm text-gray-700 mt-2 p-2 bg-white/50 rounded">
                      <span className="font-medium">Justificación:</span> {evaluation.justification}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// TASK-2026-01-19-010: RENDERERS ESPECÍFICOS MÓDULO 4
// ============================================================================

/**
 * Renderiza respuestas del ejercicio Verificador de Fake News
 * Muestra claims verificados con evidencia
 * Formato: { claims_verified: [...], verifiedClaims: [...], metadata: {...} }
 */
const VerificadorFakeNewsRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const claimsVerified = (data.claims_verified || data.verifiedClaims || []) as Array<{
    claim_id?: string;
    claim?: string;
    is_fake?: boolean;
    verdict?: string;
    evidence?: string;
  }>;
  const metadata = data.metadata as Record<string, unknown> | undefined;
  // TASK-2026-01-19-010: Extract to typed variable for TypeScript compatibility
  const articleTitle = typeof metadata?.articleTitle === 'string' ? metadata.articleTitle : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-blue-800">Verificador de Fake News</span>
        <span className="text-sm text-gray-500">({claimsVerified.length} claims verificados)</span>
      </div>

      {articleTitle && (
        <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
          <span className="text-sm text-gray-600">Artículo analizado:</span>
          <p className="font-medium">{articleTitle}</p>
        </div>
      )}

      <div className="space-y-3">
        {claimsVerified.map((claim, idx) => {
          const isFake = claim.is_fake || claim.verdict?.toLowerCase() === 'fake';
          return (
            <div
              key={claim.claim_id || idx}
              className={`rounded-lg p-4 border ${
                isFake
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{isFake ? '🚫' : '✅'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${isFake ? 'text-red-800' : 'text-green-800'}`}>
                      {isFake ? 'FALSO' : 'VERIFICADO'}
                    </span>
                  </div>
                  {claim.claim && (
                    <p className="text-gray-700 mb-2">{claim.claim}</p>
                  )}
                  {claim.evidence && (
                    <div className="text-sm p-2 bg-white/50 rounded">
                      <span className="font-medium">Evidencia:</span> {claim.evidence}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Quiz TikTok
 * Muestra respuestas con historial de swipes
 * Formato: { answers: number[], swipeHistory: number[], score: number }
 */
const QuizTikTokRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const answers = (data.answers || []) as number[];
  const swipeHistory = (data.swipeHistory || []) as number[];
  const score = data.score as number | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-pink-600" />
        <span className="font-semibold text-pink-800">Quiz TikTok</span>
      </div>

      {score !== undefined && (
        <div className="rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 p-4 border border-pink-200">
          <div className="text-center">
            <span className="text-3xl font-bold text-pink-600">{score}</span>
            <span className="text-pink-600 ml-1">puntos</span>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-pink-50 p-4 border border-pink-200">
        <div className="mb-3 font-medium text-pink-800">
          Respuestas ({answers.length} preguntas)
        </div>
        <div className="flex flex-wrap gap-2">
          {answers.map((answer, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-sm"
            >
              P{idx + 1}: Opción {answer + 1}
            </span>
          ))}
        </div>
      </div>

      {swipeHistory.length > 0 && (
        <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
          <div className="mb-2 text-sm font-medium text-purple-800">
            Historial de Swipes ({swipeHistory.length})
          </div>
          <div className="flex flex-wrap gap-1 text-xs">
            {swipeHistory.map((swipe, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                {swipe === 1 ? '👆' : swipe === -1 ? '👇' : '👆'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Navegación Hipertextual
 * Muestra el camino de navegación e información encontrada
 * Formato: { path: string[], information_found: {...}, metadata: {...} }
 */
const NavegacionHipertextualRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const path = (data.path || []) as string[];
  const informationFound = (data.information_found || {}) as Record<string, {
    title?: string;
    timeSpent?: number;
    visited?: boolean;
    contentPreview?: string;
  }>;
  const metadata = data.metadata as Record<string, unknown> | undefined;
  // TASK-2026-01-19-010: Extract to typed variable for TypeScript compatibility
  const navigationPath = Array.isArray(metadata?.navigationPath) ? metadata.navigationPath : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Map className="h-5 w-5 text-teal-600" />
        <span className="font-semibold text-teal-800">Navegación Hipertextual</span>
      </div>

      {/* Camino de navegación */}
      <div className="rounded-lg bg-teal-50 p-4 border border-teal-200">
        <div className="mb-3 font-medium text-teal-800">
          Camino de Navegación ({path.length} nodos)
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {path.map((node, idx) => (
            <React.Fragment key={idx}>
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-teal-100 text-teal-800 text-sm font-medium">
                {node}
              </span>
              {idx < path.length - 1 && (
                <span className="text-teal-400">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Información encontrada */}
      {Object.keys(informationFound).length > 0 && (
        <div className="rounded-lg bg-cyan-50 p-4 border border-cyan-200">
          <div className="mb-3 font-medium text-cyan-800">
            Información Encontrada
          </div>
          <div className="space-y-2">
            {Object.entries(informationFound).map(([nodeId, info]) => (
              <div key={nodeId} className="flex items-start gap-2 p-2 bg-white/50 rounded">
                <Bookmark className="h-4 w-4 text-cyan-600 mt-0.5" />
                <div className="flex-1">
                  <span className="font-medium text-cyan-800">{info.title || nodeId}</span>
                  {info.timeSpent && (
                    <span className="text-xs text-cyan-600 ml-2">
                      ({info.timeSpent}s)
                    </span>
                  )}
                  {info.contentPreview && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {info.contentPreview}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {navigationPath && (
        <div className="text-sm text-gray-500">
          Total de navegaciones: {navigationPath.length}
        </div>
      )}
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Análisis de Memes
 * Muestra anotaciones sobre el meme
 * Formato: { annotations: [...], analysis: {...}, metadata: {...} }
 */
const AnalisisMemesRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const annotations = (data.annotations || []) as Array<{
    x?: number;
    y?: number;
    text: string;
  }>;
  const analysis = data.analysis as { message?: string } | undefined;
  const metadata = data.metadata as Record<string, unknown> | undefined;
  // TASK-2026-01-19-010: Extract to typed variables for TypeScript compatibility
  const memeTitle = typeof metadata?.memeTitle === 'string' ? metadata.memeTitle : null;
  const selectedCategories = Array.isArray(metadata?.selectedCategories) ? metadata.selectedCategories : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Image className="h-5 w-5 text-orange-600" />
        <span className="font-semibold text-orange-800">Análisis de Memes</span>
      </div>

      {memeTitle && (
        <div className="rounded-lg bg-orange-50 p-3 border border-orange-200">
          <span className="text-sm text-orange-600">Meme analizado:</span>
          <p className="font-medium text-orange-800">{memeTitle}</p>
        </div>
      )}

      {/* Anotaciones */}
      <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
        <div className="mb-3 font-medium text-amber-800">
          Anotaciones ({annotations.length})
        </div>
        <div className="space-y-2">
          {annotations.map((annotation, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-white/50 rounded">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-sm flex items-center justify-center font-medium">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-gray-700">{annotation.text}</p>
                {annotation.x !== undefined && annotation.y !== undefined && (
                  <span className="text-xs text-amber-600">
                    Posición: ({annotation.x}, {annotation.y})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análisis general */}
      {analysis?.message && (
        <div className="rounded-lg bg-orange-50 p-4 border border-orange-200">
          <div className="mb-2 font-medium text-orange-800">Análisis General</div>
          <p className="whitespace-pre-wrap text-gray-700">{analysis.message}</p>
        </div>
      )}

      {selectedCategories && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category, idx) => (
            <span key={idx} className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
              {String(category)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Infografía Interactiva
 * Muestra secciones exploradas y respuestas
 * Formato: { answers: {...}, sections_explored: string[], metadata: {...} }
 */
const InfografiaInteractivaRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const answers = (data.answers || {}) as Record<string, {
    title?: string;
    content?: string;
    revealed?: boolean;
    position?: number;
  }>;
  const sectionsExplored = (data.sections_explored || []) as string[];
  const metadata = data.metadata as Record<string, unknown> | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-5 w-5 text-violet-600" />
        <span className="font-semibold text-violet-800">Infografía Interactiva</span>
      </div>

      {/* Progreso */}
      {metadata?.completionPercentage !== undefined && (
        <div className="rounded-lg bg-violet-50 p-4 border border-violet-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-violet-800">Progreso de Exploración</span>
            <span className="text-violet-600 font-bold">
              {metadata.completionPercentage as number}%
            </span>
          </div>
          <div className="w-full bg-violet-200 rounded-full h-2">
            <div
              className="bg-violet-600 h-2 rounded-full transition-all"
              style={{ width: `${metadata.completionPercentage as number}%` }}
            />
          </div>
        </div>
      )}

      {/* Secciones exploradas */}
      {sectionsExplored.length > 0 && (
        <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
          <div className="mb-3 font-medium text-purple-800">
            Secciones Exploradas ({sectionsExplored.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {sectionsExplored.map((section, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {section}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Respuestas */}
      {Object.keys(answers).length > 0 && (
        <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-200">
          <div className="mb-3 font-medium text-indigo-800">Elementos Revelados</div>
          <div className="space-y-2">
            {Object.entries(answers).map(([cardId, card]) => (
              <div key={cardId} className="p-2 bg-white/50 rounded flex items-start gap-2">
                <Hash className="h-4 w-4 text-indigo-600 mt-0.5" />
                <div className="flex-1">
                  <span className="font-medium text-indigo-800">{card.title || cardId}</span>
                  {card.content && (
                    <p className="text-sm text-gray-600 mt-1">{card.content}</p>
                  )}
                </div>
                {card.revealed && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TASK-2026-01-19-010: RENDERERS ESPECÍFICOS MÓDULO 5
// ============================================================================

/**
 * Renderiza respuestas del ejercicio Diario Multimedia
 * Muestra entradas del diario con contenido y mood
 * Formato: { entries: [...], totalEntries: number, totalWords: number, metadata: {...} }
 */
const DiarioMultimediaRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const entries = (data.entries || []) as Array<{
    id?: string;
    date?: string;
    title?: string;
    content: string;
    mood?: string;
    wordCount?: number;
    multimedia?: unknown;
  }>;
  const totalEntries = data.totalEntries as number | undefined;
  const totalWords = data.totalWords as number | undefined;

  const moodEmojis: Record<string, string> = {
    'feliz': '😊',
    'happy': '😊',
    'triste': '😢',
    'sad': '😢',
    'enojado': '😠',
    'angry': '😠',
    'neutral': '😐',
    'emocionado': '🤩',
    'excited': '🤩',
    'reflexivo': '🤔',
    'reflective': '🤔', // TASK-2026-01-19-010: Added English key from actual submission
    'thoughtful': '🤔',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-emerald-600" />
        <span className="font-semibold text-emerald-800">Diario Multimedia</span>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200 text-center">
          <span className="text-2xl font-bold text-emerald-600">{totalEntries || entries.length}</span>
          <p className="text-sm text-emerald-700">Entradas</p>
        </div>
        <div className="rounded-lg bg-teal-50 p-3 border border-teal-200 text-center">
          <span className="text-2xl font-bold text-teal-600">{totalWords || 0}</span>
          <p className="text-sm text-teal-700">Palabras</p>
        </div>
      </div>

      {/* Entradas */}
      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={entry.id || idx} className="rounded-lg bg-green-50 p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">
                  {entry.title || `Entrada ${idx + 1}`}
                </span>
              </div>
              {entry.mood && (
                <span className="text-xl" title={entry.mood}>
                  {moodEmojis[entry.mood.toLowerCase()] || '📝'}
                </span>
              )}
            </div>
            {entry.date && (
              <p className="text-xs text-green-600 mb-2">
                {new Date(entry.date).toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
            <p className="whitespace-pre-wrap text-gray-700 text-sm">
              {entry.content}
            </p>
            {entry.wordCount && (
              <p className="text-xs text-green-600 mt-2">
                {entry.wordCount} palabras
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Cómic Digital
 * Muestra paneles del cómic con diálogos
 * Formato: { panels: [...], metadata: {...} }
 */
const ComicDigitalRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const panels = (data.panels || []) as Array<{
    panelNumber?: number;
    dialogue?: string;
    narration?: string;
    imageUrl?: string;
    visualDescription?: string;
  }>;
  const metadata = data.metadata as Record<string, unknown> | undefined;
  // TASK-2026-01-19-010: Extract to typed variables for TypeScript compatibility
  const comicTitle = typeof metadata?.title === 'string' ? metadata.title : null;
  const totalPanels = typeof metadata?.totalPanels === 'number' ? metadata.totalPanels : panels.length;
  const totalSpeechBubbles = typeof metadata?.totalSpeechBubbles === 'number' ? metadata.totalSpeechBubbles : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-rose-600" />
        <span className="font-semibold text-rose-800">Cómic Digital</span>
        {comicTitle && (
          <span className="text-sm text-gray-500">- {comicTitle}</span>
        )}
      </div>

      {/* Estadísticas */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>Paneles: {totalPanels}</span>
        {totalSpeechBubbles !== null && (
          <span>Diálogos: {totalSpeechBubbles}</span>
        )}
      </div>

      {/* Paneles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {panels.map((panel, idx) => (
          <div
            key={idx}
            className="rounded-lg bg-rose-50 border-2 border-rose-200 overflow-hidden"
          >
            <div className="bg-rose-100 px-3 py-1 border-b border-rose-200">
              <span className="font-medium text-rose-800">
                Panel {panel.panelNumber || idx + 1}
              </span>
            </div>
            <div className="p-3 space-y-2">
              {panel.imageUrl && (
                <img
                  src={panel.imageUrl}
                  alt={`Panel ${idx + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              )}
              {panel.visualDescription && (
                <div className="text-xs text-gray-500 italic">
                  {panel.visualDescription}
                </div>
              )}
              {panel.dialogue && (
                <div className="bg-white rounded-lg p-2 border border-rose-100 relative">
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border-l border-t border-rose-100 rotate-45" />
                  <p className="text-sm text-gray-700">"{panel.dialogue}"</p>
                </div>
              )}
              {panel.narration && (
                <div className="bg-yellow-50 rounded p-2 border border-yellow-200">
                  <p className="text-xs text-yellow-800 italic">{panel.narration}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Video Carta
 * Muestra video y secciones completadas
 * Formato: { video_url: string, sections: [...], metadata: {...} }
 */
const VideoCartaRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const videoUrl = data.video_url as string | undefined;
  const sections = (data.sections || []) as Array<{
    title?: string;
    duration_seconds?: number;
  }>;
  const metadata = data.metadata as Record<string, unknown> | undefined;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="h-5 w-5 text-sky-600" />
        <span className="font-semibold text-sky-800">Video Carta</span>
      </div>

      {/* Video */}
      {videoUrl && (
        <div className="rounded-lg bg-sky-50 p-4 border border-sky-200">
          <div className="mb-2 font-medium text-sky-800">Video Grabado</div>
          {videoUrl.startsWith('blob:') ? (
            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
              <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Video grabado localmente</p>
              <p className="text-xs">(URL temporal no reproducible después de cerrar sesión)</p>
            </div>
          ) : (
            <video controls className="w-full rounded-lg">
              <source src={videoUrl} />
              Tu navegador no soporta video.
            </video>
          )}
          {typeof metadata?.videoDuration === 'number' && (
            <p className="text-sm text-sky-600 mt-2">
              Duración: {formatDuration(metadata.videoDuration)}
            </p>
          )}
        </div>
      )}

      {/* Secciones */}
      {sections.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <div className="mb-3 font-medium text-blue-800">
            Secciones Completadas ({sections.length})
          </div>
          <div className="space-y-2">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-white/50 rounded"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">{section.title || `Sección ${idx + 1}`}</span>
                </div>
                {section.duration_seconds && (
                  <span className="text-sm text-blue-600">
                    {formatDuration(section.duration_seconds)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata adicional */}
      {metadata?.allSectionsCompleted === true && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Todas las secciones completadas</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// RENDERERS ORIGINALES (No modificados)
// ============================================================================

/**
 * Renderiza respuestas del ejercicio Verdadero/Falso
 * Muestra las respuestas con iconos visuales y comparación opcional
 *
 * Soporta múltiples formatos de datos:
 * - { statements: { "1": true, "2": false } } - formato frontend
 * - { answers: { "1": true, "2": false } } - formato normalizado
 * - { "1": true, "2": false } - formato directo
 */
const VerdaderoFalsoRenderer: React.FC<{
  data: Record<string, unknown>;
  correct?: Record<string, unknown>;
  showComparison: boolean;
}> = ({ data, correct, showComparison }) => {
  // Soportar múltiples formatos: statements (frontend), answers (normalizado), o directo
  const rawAnswers = data.statements || data.answers || data;

  // Normalizar valores: convertir strings "true"/"false" a booleanos reales
  const answers: Record<string, boolean> = {};
  if (rawAnswers && typeof rawAnswers === 'object') {
    Object.entries(rawAnswers as Record<string, unknown>).forEach(([key, val]) => {
      // Handle string "true"/"false", boolean, or other values
      if (typeof val === 'string') {
        answers[key] = val.toLowerCase() === 'true';
      } else if (typeof val === 'boolean') {
        answers[key] = val;
      } else {
        answers[key] = Boolean(val);
      }
    });
  }

  const rawCorrectAnswers = correct?.statements || correct?.answers || correct;
  const correctAnswers: Record<string, boolean> | undefined = rawCorrectAnswers
    ? Object.entries(rawCorrectAnswers as Record<string, unknown>).reduce(
        (acc, [key, val]) => {
          if (typeof val === 'string') {
            acc[key] = val.toLowerCase() === 'true';
          } else if (typeof val === 'boolean') {
            acc[key] = val;
          } else {
            acc[key] = Boolean(val);
          }
          return acc;
        },
        {} as Record<string, boolean>,
      )
    : undefined;

  return (
    <div className="space-y-2">
      {Object.entries(answers).map(([key, value]) => {
        const isCorrect = correctAnswers ? correctAnswers[key] === value : undefined;
        return (
          <div
            key={key}
            className={`flex items-center gap-3 rounded-lg p-3 ${
              showComparison && isCorrect !== undefined
                ? isCorrect
                  ? 'border border-green-200 bg-green-50'
                  : 'border border-red-200 bg-red-50'
                : 'bg-gray-50'
            }`}
          >
            {value ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">Pregunta {key}:</span>
            <span>{value ? 'Verdadero' : 'Falso'}</span>
            {showComparison && isCorrect === false && correctAnswers && (
              <span className="ml-2 text-sm text-red-600">
                (Correcto: {correctAnswers[key] ? 'Verdadero' : 'Falso'})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Completar Espacios
 * Muestra las palabras ingresadas con comparación opcional
 */
const CompletarEspaciosRenderer: React.FC<{
  data: Record<string, unknown>;
  correct?: Record<string, unknown>;
  showComparison: boolean;
}> = ({ data, correct, showComparison }) => {
  const blanks = (data.blanks || data) as Record<string, string>;
  const correctBlanks = correct?.blanks as Record<string, string> | undefined;

  return (
    <div className="space-y-2">
      {Object.entries(blanks).map(([key, value]) => {
        const isCorrect = correctBlanks
          ? correctBlanks[key]?.toLowerCase().trim() === value?.toLowerCase().trim()
          : undefined;
        return (
          <div
            key={key}
            className={`flex items-center gap-3 rounded-lg p-3 ${
              showComparison && isCorrect !== undefined
                ? isCorrect
                  ? 'border border-green-200 bg-green-50'
                  : 'border border-red-200 bg-red-50'
                : 'bg-gray-50'
            }`}
          >
            <span className="font-medium text-gray-600">Espacio {key}:</span>
            <span className="rounded bg-yellow-100 px-2 py-1 font-mono">{value || '(vacío)'}</span>
            {showComparison && isCorrect === false && correctBlanks && (
              <span className="ml-2 text-sm text-green-600">→ {correctBlanks[key]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Crucigrama
 * Muestra las palabras completadas en formato de grid
 */
const CrucigramaRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const words = (data.words || data.answers || {}) as Record<string, string>;

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Grid3X3 className="h-5 w-5 text-gray-600" />
        <span className="font-semibold">Palabras del Crucigrama</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(words).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 rounded bg-white p-2">
            <span className="text-sm text-gray-500">{key}:</span>
            <span className="font-mono font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Sopa de Letras
 * Muestra las palabras encontradas como tags
 */
const SopaLetrasRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const foundWords = (data.foundWords || data.words || []) as string[];

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-gray-600" />
        <span className="font-semibold">Palabras Encontradas ({foundWords.length})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {foundWords.map((word, idx) => (
          <span key={idx} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Mapa Conceptual
 * Muestra las conexiones entre nodos
 */
const MapaConceptualRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const connections = (data.connections || data.nodes || []) as Array<{
    from?: string;
    to?: string;
    label?: string;
  }>;

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <span className="mb-3 block font-semibold">Conexiones del Mapa Conceptual</span>
      <div className="space-y-2">
        {Array.isArray(connections) ? (
          connections.map((conn, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="rounded bg-blue-100 px-2 py-1">{conn.from || `Nodo ${idx}`}</span>
              <span className="text-gray-400">→</span>
              <span className="rounded bg-green-100 px-2 py-1">
                {conn.to || conn.label || 'conecta'}
              </span>
            </div>
          ))
        ) : (
          <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Timeline
 * Muestra los eventos en orden cronológico
 */
const TimelineRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const events = (data.events || data.order || []) as Array<{
    id?: string;
    position?: number;
    text?: string;
  }>;

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <span className="mb-3 block font-semibold">Orden de Eventos</span>
      <div className="space-y-2">
        {Array.isArray(events) ? (
          events.map((event, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                {event.position || idx + 1}
              </span>
              <span>{event.text || event.id || `Evento ${idx + 1}`}</span>
            </div>
          ))
        ) : (
          <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

/**
 * Renderiza respuestas del ejercicio Emparejamiento
 * Muestra los pares que el estudiante conectó
 */
const EmparejamientoRenderer: React.FC<{
  data: Record<string, unknown>;
  correct?: Record<string, unknown>;
  showComparison: boolean;
}> = ({ data, correct, showComparison }) => {
  // El formato de respuesta es { matches: { questionId: answerId } }
  const matches = (data.matches || data) as Record<string, string>;
  const correctMatches = (correct?.matches || correct) as Record<string, string> | undefined;

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-gray-600" />
        <span className="font-semibold">Emparejamientos Realizados</span>
      </div>
      <div className="space-y-2">
        {Object.entries(matches).map(([questionId, answerId]) => {
          const isCorrect = correctMatches
            ? correctMatches[questionId] === answerId
            : undefined;
          return (
            <div
              key={questionId}
              className={`flex items-center gap-3 rounded-lg p-3 ${
                showComparison && isCorrect !== undefined
                  ? isCorrect
                    ? 'border border-green-200 bg-green-50'
                    : 'border border-red-200 bg-red-50'
                  : 'bg-white'
              }`}
            >
              <span className="rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800">
                {questionId}
              </span>
              <span className="text-gray-400">↔</span>
              <span className="rounded bg-purple-100 px-2 py-1 text-sm font-medium text-purple-800">
                {answerId}
              </span>
              {showComparison && isCorrect !== undefined && (
                isCorrect ? (
                  <CheckCircle className="ml-auto h-5 w-5 text-green-600" />
                ) : (
                  <>
                    <XCircle className="ml-auto h-5 w-5 text-red-600" />
                    {correctMatches && (
                      <span className="text-sm text-green-600">
                        → {correctMatches[questionId]}
                      </span>
                    )}
                  </>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Renderiza respuestas de ejercicios de opción múltiple
 * Usado para ejercicios del Módulo 2 (inferenciales)
 */
const MultipleChoiceRenderer: React.FC<{
  data: Record<string, unknown>;
  correct?: Record<string, unknown>;
  showComparison: boolean;
}> = ({ data, correct, showComparison }) => {
  const answers = data as Record<string, string | number>;
  const correctAnswers = correct as Record<string, string | number> | undefined;

  return (
    <div className="space-y-2">
      {Object.entries(answers).map(([key, value]) => {
        const isCorrect = correctAnswers ? correctAnswers[key] === value : undefined;
        return (
          <div
            key={key}
            className={`rounded-lg p-3 ${
              showComparison && isCorrect !== undefined
                ? isCorrect
                  ? 'border border-green-200 bg-green-50'
                  : 'border border-red-200 bg-red-50'
                : 'bg-gray-50'
            }`}
          >
            <span className="font-medium">{key}:</span> {String(value)}
            {showComparison && isCorrect === false && correctAnswers && (
              <span className="ml-2 text-sm text-green-600">
                (Correcto: {String(correctAnswers[key])})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Renderiza respuestas de ejercicios basados en texto
 * Usado para ejercicios del Módulo 3 (críticos/argumentativos)
 */
const TextResponseRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="rounded-lg bg-gray-50 p-4">
          <span className="mb-2 block font-semibold capitalize text-gray-700">
            {key.replace(/_/g, ' ')}
          </span>
          <p className="whitespace-pre-wrap text-gray-800">
            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          </p>
        </div>
      ))}
    </div>
  );
};

/**
 * TASK-2026-01-18-013: SmartFieldRenderer - Renderiza un campo individual de forma inteligente
 * Detecta el tipo de dato y lo presenta de la mejor manera posible
 */
const SmartFieldRenderer: React.FC<{
  fieldKey: string;
  value: unknown;
  depth?: number;
}> = ({ fieldKey, value, depth = 0 }) => {
  // Formatear el nombre del campo para mostrar
  const formatFieldName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Detectar y renderizar URLs de media
  const isMediaUrl = (val: unknown): { type: 'image' | 'video' | 'audio' | null; url: string } => {
    if (typeof val !== 'string') return { type: null, url: '' };
    const url = val.trim();
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('/image')) {
      return { type: 'image', url };
    }
    if (/\.(mp4|webm|mov|avi)$/i.test(url) || url.includes('/video')) {
      return { type: 'video', url };
    }
    if (/\.(mp3|wav|ogg|m4a|aac)$/i.test(url) || url.includes('/audio')) {
      return { type: 'audio', url };
    }
    return { type: null, url };
  };

  // Renderizar valor según su tipo
  const renderValue = (): React.ReactNode => {
    // Null/undefined
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic text-sm">Sin respuesta</span>;
    }

    // String
    if (typeof value === 'string') {
      // Verificar si es URL de media
      const media = isMediaUrl(value);
      if (media.type === 'image') {
        return (
          <div className="mt-2">
            <img
              src={media.url}
              alt={fieldKey}
              className="max-w-full md:max-w-md rounded-lg shadow-sm border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        );
      }
      if (media.type === 'video') {
        return (
          <div className="mt-2">
            <video controls className="max-w-full md:max-w-md rounded-lg shadow-sm">
              <source src={media.url} />
              Tu navegador no soporta video.
            </video>
          </div>
        );
      }
      if (media.type === 'audio') {
        return (
          <div className="mt-2">
            <audio controls className="w-full max-w-md">
              <source src={media.url} />
              Tu navegador no soporta audio.
            </audio>
          </div>
        );
      }

      // Texto largo (más de 100 caracteres) - mostrar en bloque
      if (value.length > 100) {
        return (
          <div className="mt-2 bg-white rounded-lg p-4 border border-gray-200">
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{value}</p>
          </div>
        );
      }

      // Texto corto
      return <p className="text-gray-800 mt-1">{value}</p>;
    }

    // Número
    if (typeof value === 'number') {
      return (
        <span className="inline-flex items-center gap-2 mt-1">
          <span className="text-2xl font-bold text-detective-orange">{value}</span>
          {fieldKey.toLowerCase().includes('score') && <span className="text-gray-500">puntos</span>}
          {fieldKey.toLowerCase().includes('time') && <span className="text-gray-500">segundos</span>}
        </span>
      );
    }

    // Boolean
    if (typeof value === 'boolean') {
      return (
        <span className={`inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Sí / Verdadero
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              No / Falso
            </>
          )}
        </span>
      );
    }

    // Array
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic text-sm mt-1">Lista vacía</span>;
      }

      // Si son strings simples, mostrar como tags
      if (value.every(item => typeof item === 'string')) {
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            {value.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        );
      }

      // Si son objetos, mostrar como cards
      return (
        <div className="mt-2 space-y-2">
          {value.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Elemento {idx + 1}</div>
              {typeof item === 'object' && item !== null ? (
                <SmartObjectRenderer data={item as Record<string, unknown>} depth={depth + 1} />
              ) : (
                <span className="text-gray-800">{String(item)}</span>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Objeto
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="mt-2">
          <SmartObjectRenderer data={value as Record<string, unknown>} depth={depth + 1} />
        </div>
      );
    }

    // Fallback
    return <span className="text-gray-800 mt-1">{String(value)}</span>;
  };

  // No mostrar campo si está anidado muy profundo
  if (depth > 3) {
    return (
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        <pre className="overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className={depth === 0 ? 'rounded-lg bg-gray-50 p-4 border border-gray-100' : ''}>
      <div className="flex items-start gap-2">
        <span className={`font-semibold ${depth === 0 ? 'text-gray-700' : 'text-gray-600 text-sm'}`}>
          {formatFieldName(fieldKey)}:
        </span>
      </div>
      {renderValue()}
    </div>
  );
};

/**
 * TASK-2026-01-18-013: SmartObjectRenderer - Renderiza un objeto completo de forma inteligente
 */
const SmartObjectRenderer: React.FC<{
  data: Record<string, unknown>;
  depth?: number;
}> = ({ data, depth = 0 }) => {
  if (!data || Object.keys(data).length === 0) {
    return <span className="text-gray-400 italic text-sm">Sin datos</span>;
  }

  // En niveles profundos, usar grid compacto
  if (depth > 0) {
    return (
      <div className="grid gap-2">
        {Object.entries(data).map(([key, value]) => (
          <SmartFieldRenderer key={key} fieldKey={key} value={value} depth={depth} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => (
        <SmartFieldRenderer key={key} fieldKey={key} value={value} depth={depth} />
      ))}
    </div>
  );
};

/**
 * Renderiza respuestas de tipos de ejercicio no reconocidos
 * TASK-2026-01-18-013: Completamente reescrito para usar SmartObjectRenderer
 * Muestra las respuestas de forma inteligente y legible
 */
const FallbackRenderer: React.FC<{ data: Record<string, unknown>; exerciseType?: string }> = ({
  data,
  exerciseType,
}) => {
  // Si no hay datos o están vacíos
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
        <FileText className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">Sin respuesta registrada</p>
          <p className="text-amber-700 text-sm mt-1">
            El estudiante no ha proporcionado una respuesta para este ejercicio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info de tipo de ejercicio (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && exerciseType && exerciseType !== 'unknown' && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center gap-2 text-xs text-blue-700">
          <FileText className="h-4 w-4" />
          <span>Tipo de ejercicio: <code className="font-mono bg-blue-100 px-1 rounded">{exerciseType}</code></span>
        </div>
      )}

      {/* Renderizado inteligente de las respuestas */}
      <SmartObjectRenderer data={data} />
    </div>
  );
};

export default ExerciseContentRenderer;
