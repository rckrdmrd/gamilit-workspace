import React, { useState, useRef, useEffect } from 'react';
import { Video, Camera, Download, Send, Loader2, CheckCircle, Pause, Play, RotateCcw, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { useSectionedRecorder, VideoSection } from '@/shared/hooks/useSectionedRecorder';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';

interface ProgressData {
  progress: {
    currentStep: number;
    totalSteps: number;
    score: number;
    hintsUsed: number;
    timeSpent: number;
  };
  answers: Record<string, unknown>;
}

interface ExerciseProps {
  exerciseId?: string;
  exercise?: unknown;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgressUpdate?: (data: ProgressData) => void;
  onExit?: () => void;
}

// Definición de las secciones del video
const VIDEO_SECTIONS: VideoSection[] = [
  { id: 'intro', name: 'Introducción', duration: 30, prompt: '¿Quién eres y por qué escribes?' },
  { id: 'main', name: 'Mensaje Principal', duration: 90, prompt: '¿Qué quieres decirle a Marie Curie?' },
  { id: 'reflection', name: 'Reflexiones', duration: 45, prompt: '¿Qué aprendiste de ella?' },
  { id: 'closing', name: 'Cierre', duration: 15, prompt: 'Despedida y agradecimiento' },
];

export const VideoCartaExercise: React.FC<ExerciseProps> = ({
  exerciseId = 'video-carta-default',
  onComplete,
  onProgressUpdate,
  onExit
}) => {
  const [filter, setFilter] = useState('none');
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    error: recorderError,
    videoBlob,
    videoUrl,
    previewUrl,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    isRecording,
    isPaused,
    isSupported,
    // Section-specific
    sections,
    currentSection,
    currentSectionIndex,
    sectionTimeRemaining,
    sectionProgress,
    totalProgress,
    sectionRecordings,
    allSectionsCompleted,
    goToNextSection,
    goToPreviousSection,
    reRecordSection,
  } = useSectionedRecorder(VIDEO_SECTIONS);

  const {
    submit,
    isSubmitting,
  } = useExerciseSubmission(exerciseId || '', {
    onSuccess: (result) => {
      setIsSubmitted(true);
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      setFeedback({
        type: 'success',
        title: '¡Ejercicio Enviado!',
        message: 'Tu video carta ha sido enviado para revisión por el docente.',
        score: result.score,
        xpEarned: result.rewards?.xp || 0,
        mlCoinsEarned: result.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);
      onComplete?.(result.score, timeSpent);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: err?.message || 'Hubo un problema. Intenta de nuevo.',
        score: 0,
      });
      setShowFeedback(true);
    },
  });

  const filters = [
    { id: 'none', name: 'Sin filtro', class: '' },
    { id: 'sepia', name: 'Sepia (Antiguo)', class: 'sepia' },
    { id: 'grayscale', name: 'Blanco y Negro', class: 'grayscale' },
    { id: 'vintage', name: 'Vintage', class: 'contrast-125 brightness-110' },
  ];

  // Progress tracking
  useEffect(() => {
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const totalSections = sections.length;
    const completedSections = Array.from(sectionRecordings.values()).filter(r => r.completed).length;
    const score = Math.min(100, Math.round((completedSections / totalSections) * 100));

    onProgressUpdate?.({
      progress: {
        currentStep: completedSections,
        totalSteps: totalSections,
        score,
        hintsUsed: 0,
        timeSpent,
      },
      answers: {
        totalSections,
        completedSections,
        currentSectionIndex,
        duration,
        allSectionsCompleted,
        hasVideo: !!videoBlob,
        sections: Array.from(sectionRecordings.entries()).map(([id, data]) => ({
          id,
          completed: data.completed,
          duration: data.duration,
        })),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionRecordings, currentSectionIndex, duration, allSectionsCompleted, videoBlob, startTime]);

  // Update video preview source when previewUrl changes
  useEffect(() => {
    if (videoRef.current && previewUrl && isRecording) {
      // For live preview during recording
      const video = videoRef.current;
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          video.srcObject = stream;
        })
        .catch(err => {
          console.error('Error setting preview:', err);
        });
    } else if (videoRef.current && videoUrl && !isRecording) {
      // For playback after recording
      videoRef.current.srcObject = null;
    }
  }, [previewUrl, videoUrl, isRecording]);

  const handleSubmit = () => {
    if (!exerciseId || isSubmitting || isSubmitted || !videoBlob) return;

    submit({
      videoDuration: duration,
      videoSize: videoBlob.size,
      hasVideo: true,
      message: 'Video carta sobre Marie Curie',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine if timer should show warning (less than 10 seconds)
  const isTimerWarning = sectionTimeRemaining <= 10 && sectionTimeRemaining > 0;

  return (
    <div className="min-h-screen bg-detective-bg p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-xl bg-gradient-to-r from-blue-800 to-orange-500 p-6 text-white shadow-lg">
          <div className="mb-2 flex items-center gap-3">
            <Video className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Video Carta a Marie Curie</h2>
          </div>
          <p className="opacity-90 mb-4">
            Graba un video mensaje dividido en 4 secciones cronometradas. Duración total: 3 minutos.
          </p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-white">Progreso Total</span>
              <span className="text-white/80">
                {Math.round(totalProgress)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>

          {/* Sections Overview */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {sections.map((section, index) => {
              const recording = sectionRecordings.get(section.id);
              const isCurrent = index === currentSectionIndex;
              const isCompleted = recording?.completed;

              return (
                <button
                  key={section.id}
                  onClick={() => !isRecording && reRecordSection(section.id)}
                  disabled={isRecording}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    isCurrent
                      ? 'border-white bg-white text-blue-800'
                      : isCompleted
                      ? 'border-green-300 bg-green-100 text-green-700'
                      : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  } ${isRecording ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <div className="text-xs font-bold mb-1">{section.name}</div>
                  <div className="text-xs">{section.duration}s</div>
                  {isCompleted && !isCurrent && (
                    <CheckCircle className="h-4 w-4 mx-auto mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!isSupported && (
              <div className="rounded-detective bg-red-50 border-2 border-red-300 p-6 shadow-card">
                <p className="text-red-600 font-medium">
                  Tu navegador no soporta grabación de video. Por favor usa Chrome, Firefox, Edge o Safari actualizado.
                </p>
              </div>
            )}

            {recorderError && (
              <div className="rounded-detective bg-red-50 border-2 border-red-300 p-6 shadow-card">
                <h3 className="font-bold text-red-600 mb-2">{recorderError.message}</h3>
                <p className="text-red-600 text-sm">{recorderError.userAction}</p>
              </div>
            )}

            {!videoUrl ? (
              <div className="rounded-detective bg-white p-6 shadow-card">
                {/* Current Section Info */}
                {currentSection && (
                  <div className="mb-4 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-blue-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-detective-orange animate-pulse" />
                        <span className="font-bold text-detective-text">
                          Sección {currentSectionIndex + 1} de {sections.length}: {currentSection.name}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 font-mono text-xl font-bold transition-colors ${
                        isTimerWarning ? 'text-red-600 animate-pulse' : 'text-detective-text'
                      }`}>
                        <Clock className="h-5 w-5" />
                        {formatDuration(sectionTimeRemaining)}
                      </div>
                    </div>

                    {/* Section Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isTimerWarning ? 'bg-red-500' : 'bg-detective-orange'
                        }`}
                        style={{ width: `${sectionProgress}%` }}
                      />
                    </div>

                    <p className="text-sm text-detective-text-secondary italic">
                      {currentSection.prompt}
                    </p>
                  </div>
                )}

                <div
                  className="relative overflow-hidden rounded-detective bg-black"
                  style={{ aspectRatio: '16/9' }}
                >
                  <video ref={videoRef} autoPlay muted className={`h-full w-full ${filter}`} />
                  {!isRecording && !isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="h-20 w-20 text-white/50" />
                    </div>
                  )}
                  {isRecording && (
                    <div className="absolute right-4 top-4 flex animate-pulse items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-white shadow-lg">
                      <div className="h-3 w-3 rounded-full bg-white" />
                      REC {formatDuration(duration)}
                    </div>
                  )}
                  {isRecording && currentSection && (
                    <div className="absolute left-4 top-4 rounded-detective bg-black/70 backdrop-blur-sm px-4 py-2 text-white">
                      <div className="text-xs opacity-75">Grabando</div>
                      <div className="font-bold">{currentSection.name}</div>
                    </div>
                  )}
                  {isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="rounded-full bg-white/90 p-4">
                        <Pause className="h-12 w-12 text-detective-text" />
                      </div>
                    </div>
                  )}
                  {isTimerWarning && isRecording && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-white shadow-lg animate-pulse">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-bold">Últimos {sectionTimeRemaining} segundos</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {/* Main Recording Controls */}
                  <div className="flex justify-center gap-4">
                    {!isRecording && !isPaused ? (
                      <button
                        onClick={() => startRecording()}
                        disabled={!isSupported}
                        className="flex items-center gap-2 rounded-detective bg-red-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Camera className="h-6 w-6" />
                        Iniciar Grabación
                      </button>
                    ) : isPaused ? (
                      <>
                        <button
                          onClick={resumeRecording}
                          className="flex items-center gap-2 rounded-detective bg-green-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-green-700"
                        >
                          <Play className="h-6 w-6" />
                          Reanudar
                        </button>
                        <button
                          onClick={stopRecording}
                          className="flex items-center gap-2 rounded-detective bg-detective-text px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-detective-text/90"
                        >
                          ⏹ Detener
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={pauseRecording}
                          className="flex items-center gap-2 rounded-detective bg-yellow-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-yellow-700"
                        >
                          <Pause className="h-6 w-6" />
                          Pausar
                        </button>
                        <button
                          onClick={stopRecording}
                          className="flex items-center gap-2 rounded-detective bg-detective-text px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-detective-text/90"
                        >
                          ⏹ Detener
                        </button>
                      </>
                    )}
                  </div>

                  {/* Section Navigation (only when recording or paused) */}
                  {(isRecording || isPaused) && (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={goToPreviousSection}
                        disabled={currentSectionIndex === 0}
                        className="flex items-center gap-2 rounded-detective bg-detective-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-detective-blue/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </button>
                      <span className="text-sm text-detective-text-secondary font-medium">
                        Sección {currentSectionIndex + 1} / {sections.length}
                      </span>
                      <button
                        onClick={goToNextSection}
                        disabled={currentSectionIndex === sections.length - 1}
                        className="flex items-center gap-2 rounded-detective bg-detective-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-detective-blue/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-detective bg-white p-6 shadow-card">
                <video src={videoUrl} controls className="w-full rounded-detective" />

                {/* Recording Summary */}
                <div className="bg-detective-bg-secondary rounded-detective p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-detective-text">Resumen de Grabación</span>
                    <span className="text-detective-text-secondary text-sm">
                      Duración Total: {formatDuration(duration)}
                    </span>
                  </div>

                  {/* Section Breakdown */}
                  <div className="space-y-2">
                    {sections.map((section) => {
                      const recording = sectionRecordings.get(section.id);
                      return (
                        <div
                          key={section.id}
                          className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            {recording?.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                            <span className="text-sm font-medium text-detective-text">
                              {section.name}
                            </span>
                          </div>
                          <div className="text-xs text-detective-text-secondary">
                            {recording?.duration ? formatDuration(recording.duration) : '--:--'} / {formatDuration(section.duration)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resetRecording}
                    className="flex-1 flex items-center justify-center gap-2 rounded-detective bg-detective-orange px-4 py-3 font-medium text-white transition-colors hover:bg-detective-orange-dark"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Grabar Nuevo Video
                  </button>
                  <button
                    onClick={() => {
                      if (videoUrl) {
                        const a = document.createElement('a');
                        a.href = videoUrl;
                        a.download = 'video-carta-marie-curie.webm';
                        a.click();
                      }
                    }}
                    className="flex items-center gap-2 rounded-detective bg-detective-blue px-6 py-3 font-medium text-white transition-colors hover:bg-detective-blue/90"
                  >
                    <Download className="h-5 w-5" />
                    Descargar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!videoBlob || isSubmitting || isSubmitted}
                    className="flex items-center gap-2 rounded-detective bg-detective-orange px-6 py-3 font-medium text-white transition-colors hover:bg-detective-orange-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : isSubmitted ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Enviado
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Enviar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-detective bg-white p-6 shadow-card">
              <h3 className="mb-4 font-bold text-detective-text">Filtros de Video</h3>
              <div className="space-y-2">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.class)}
                    className={`w-full rounded-detective border-2 px-4 py-2 text-left transition-colors ${
                      filter === f.class
                        ? 'border-detective-orange bg-detective-orange text-white'
                        : 'border-gray-300 bg-white hover:border-detective-orange'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-detective border-2 border-detective-orange/20 bg-detective-bg-secondary p-6">
              <h3 className="mb-3 font-bold text-detective-text">💡 Guía de Secciones:</h3>
              <div className="space-y-3">
                {sections.map((section, index) => {
                  const recording = sectionRecordings.get(section.id);
                  const isCurrent = index === currentSectionIndex;
                  return (
                    <div
                      key={section.id}
                      className={`p-3 rounded-detective border-2 transition-all ${
                        isCurrent
                          ? 'border-detective-orange bg-detective-orange/10'
                          : recording?.completed
                          ? 'border-green-500/30 bg-green-50/50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-detective-text">
                          {index + 1}. {section.name}
                        </span>
                        <span className="text-xs text-detective-text-secondary">
                          {section.duration}s
                        </span>
                      </div>
                      <p className="text-xs text-detective-text-secondary italic">
                        {section.prompt}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <h4 className="text-sm font-bold text-detective-text mb-2">Consejos Generales:</h4>
                <ul className="space-y-1 text-xs text-detective-text-secondary">
                  <li>• Habla claramente y con entusiasmo</li>
                  <li>• Sigue el tiempo de cada sección</li>
                  <li>• Puedes pausar si necesitas pensar</li>
                  <li>• Puedes navegar entre secciones</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success') {
              onExit?.();
            }
          }}
          feedback={feedback}
        />
      )}
    </div>
  );
};

export default VideoCartaExercise;
