import React from 'react';
import { FileText, CheckCircle, XCircle, Music, Type, Grid3X3, ListChecks, Link2 } from 'lucide-react';

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

    // Módulo 3 - Manuales (texto/análisis)
    case 'analisis_fuentes':
    case 'debate_digital':
    case 'matriz_perspectivas':
    case 'tribunal_opiniones':
      return <TextResponseRenderer data={answerData} />;

    // P0-03: Added missing auxiliary mechanics (2025-12-18)
    case 'collage_prensa':
    case 'call_to_action':
    case 'texto_en_movimiento':
      return <TextResponseRenderer data={answerData} />;

    // Módulo 4 y 5 (creativos con multimedia)
    case 'verificador_fake_news':
    case 'quiz_tiktok':
    case 'analisis_memes':
    case 'infografia_interactiva':
    case 'navegacion_hipertextual':
    case 'diario_multimedia':
    case 'comic_digital':
    case 'video_carta':
      return <MultimediaRenderer data={answerData} type={exerciseType} />;

    default:
      return <FallbackRenderer data={answerData} />;
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

  // Debug: Log raw data to identify format issues
  console.log('[VerdaderoFalsoRenderer] Raw data:', {
    data,
    correct,
    rawAnswers,
    dataKeys: Object.keys(data),
    rawAnswersType: typeof rawAnswers,
  });

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

  console.log('[VerdaderoFalsoRenderer] Normalized:', { answers, correctAnswers });

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
 * Renderiza respuestas de ejercicios multimedia
 * Usado para ejercicios de Módulos 4 y 5 (creativos)
 * Detecta y renderiza imágenes, videos y audio inline
 */
const MultimediaRenderer: React.FC<{ data: Record<string, unknown>; type: string }> = ({
  data,
  type: _type,
}) => {
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => {
        // Detectar si es URL de media
        const strValue = String(value);
        const isImageUrl = /\.(jpg|jpeg|png|gif|webp)$/i.test(strValue) || key.includes('image');
        const isVideoUrl = /\.(mp4|webm|mov)$/i.test(strValue) || key.includes('video');
        const isAudioUrl = /\.(mp3|wav|ogg|m4a)$/i.test(strValue) || key.includes('audio');

        return (
          <div key={key} className="rounded-lg bg-gray-50 p-4">
            <span className="mb-2 block font-semibold capitalize text-gray-700">
              {key.replace(/_/g, ' ')}
            </span>

            {isImageUrl && typeof value === 'string' ? (
              <img src={value} alt={key} className="h-auto max-w-full rounded-lg" />
            ) : isVideoUrl && typeof value === 'string' ? (
              <video controls className="max-w-full rounded-lg">
                <source src={value} />
              </video>
            ) : isAudioUrl && typeof value === 'string' ? (
              <audio controls className="w-full">
                <source src={value} />
              </audio>
            ) : typeof value === 'string' ? (
              <p className="whitespace-pre-wrap text-gray-800">{value}</p>
            ) : (
              <pre className="overflow-x-auto rounded bg-white p-2 text-sm">
                {JSON.stringify(value, null, 2)}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Renderiza respuestas de tipos de ejercicio no reconocidos
 * Muestra el JSON formateado como fallback
 */
const FallbackRenderer: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  return (
    <div className="rounded-lg bg-gray-100 p-4">
      <pre className="overflow-x-auto whitespace-pre-wrap text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default ExerciseContentRenderer;
