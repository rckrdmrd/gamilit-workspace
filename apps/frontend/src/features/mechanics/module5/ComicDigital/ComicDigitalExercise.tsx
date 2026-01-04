import React, { useState, useEffect } from 'react';
import { Plus, Image, Type, MessageSquare, Download, Send, Loader2, CheckCircle } from 'lucide-react';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';

interface ComicPanel {
  id: string;
  layout: 'full' | 'half' | 'third';
  image?: string;
  text: string;
  speechBubbles: SpeechBubble[];
}

interface SpeechBubble {
  id: string;
  text: string;
  x: number;
  y: number;
  type: 'speech' | 'thought' | 'caption';
}

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

export const ComicDigitalExercise: React.FC<ExerciseProps> = ({
  exerciseId = 'comic-digital-default',
  onComplete,
  onProgressUpdate,
  onExit
}) => {
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [title, setTitle] = useState('La Historia de Marie Curie');
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    submit,
    isSubmitting,
  } = useExerciseSubmission(exerciseId || '', {
    onSuccess: (result) => {
      setIsSubmitted(true);
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Verificar si está pendiente de revisión manual
      if (result.status === 'pending_review' || result.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Cómic Enviado',
          message: 'Tu cómic digital ha sido enviado para revisión del maestro. Recibirás tus recompensas cuando sea evaluado.',
          pendingReview: true,
        });
        setShowFeedback(true);
        onComplete?.(0, timeSpent);
        return;
      }

      // Flujo normal cuando ya está evaluado
      setFeedback({
        type: 'success',
        title: '¡Cómic Completado!',
        message: 'Tu cómic digital ha sido evaluado correctamente.',
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

  // Progress tracking
  useEffect(() => {
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const minPanels = 6;
    const score = Math.min(100, Math.round((panels.length / minPanels) * 100));

    onProgressUpdate?.({
      progress: {
        currentStep: panels.length,
        totalSteps: minPanels,
        score,
        hintsUsed: 0,
        timeSpent,
      },
      answers: {
        title,
        panels: panels.map((p) => ({
          id: p.id,
          layout: p.layout,
          hasImage: !!p.image,
          textLength: p.text.length,
          bubblesCount: p.speechBubbles.length,
        })),
        totalPanels: panels.length,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panels, title, startTime]);

  const layouts = [
    { id: 'full', name: 'Panel Completo', cols: 1 },
    { id: 'half', name: '2 Paneles', cols: 2 },
    { id: 'third', name: '3 Paneles', cols: 3 },
  ];

  const backgrounds = [
    { id: 'lab', name: 'Laboratorio', color: 'bg-gray-100' },
    { id: 'university', name: 'Universidad', color: 'bg-blue-50' },
    { id: 'award', name: 'Ceremonia', color: 'bg-yellow-50' },
    { id: 'research', name: 'Investigación', color: 'bg-purple-50' },
  ];

  const addPanel = (layout: string) => {
    const newPanel: ComicPanel = {
      id: Date.now().toString(),
      layout: layout as ComicPanel['layout'],
      text: '',
      speechBubbles: [],
    };
    setPanels([...panels, newPanel]);
    setSelectedPanel(newPanel.id);
  };

  const addSpeechBubble = (panelId: string, type: SpeechBubble['type']) => {
    setPanels(panels.map(panel => {
      if (panel.id === panelId) {
        const newBubble: SpeechBubble = {
          id: Date.now().toString(),
          text: 'Escribe aquí...',
          x: 50,
          y: 30,
          type,
        };
        return { ...panel, speechBubbles: [...panel.speechBubbles, newBubble] };
      }
      return panel;
    }));
  };

  const updatePanelText = (panelId: string, text: string) => {
    setPanels(panels.map(panel =>
      panel.id === panelId ? { ...panel, text } : panel
    ));
  };

  const handleSubmit = () => {
    if (!exerciseId || isSubmitting || isSubmitted || panels.length === 0) return;

    submit({
      title,
      panels: panels.map(panel => ({
        id: panel.id,
        layout: panel.layout,
        text: panel.text,
        speechBubblesCount: panel.speechBubbles.length,
        speechBubbles: panel.speechBubbles.map(bubble => ({
          text: bubble.text,
          type: bubble.type,
        })),
      })),
      totalPanels: panels.length,
      totalSpeechBubbles: panels.reduce((acc, panel) => acc + panel.speechBubbles.length, 0),
    });
  };

  return (
    <div className="min-h-screen bg-detective-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-xl bg-gradient-to-r from-blue-800 to-orange-500 p-6 text-white shadow-lg">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-2xl font-bold">Creador de Cómics Digitales</h2>
          </div>
          <p className="opacity-90 mb-4">
            Crea tu propio cómic digital sobre Marie Curie con paneles, diálogos y elementos visuales.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-white/30 bg-white/10 rounded-xl text-white placeholder-white/70 focus:border-white focus:outline-none"
              placeholder="Título del cómic..."
            />
            <button
              onClick={() => {/* Export logic */}}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Exportar
            </button>
            <button
              onClick={handleSubmit}
              disabled={panels.length === 0 || isSubmitting || isSubmitted}
              className="flex items-center gap-2 px-6 py-2 bg-white text-blue-800 rounded-xl hover:bg-white/90 transition-colors font-medium disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : isSubmitted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Enviado
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Cómic
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-detective shadow-card p-6 space-y-4">
            <h3 className="font-bold text-detective-text">Herramientas</h3>

            <div>
              <p className="text-detective-text-secondary text-sm mb-2">Agregar Panel:</p>
              <div className="space-y-2">
                {layouts.map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => addPanel(layout.id)}
                    className="w-full py-2 px-4 bg-detective-bg border-2 border-gray-300 rounded-detective hover:border-detective-orange transition-colors text-left"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    {layout.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedPanel && (
              <>
                <div>
                  <p className="text-detective-text-secondary text-sm mb-2">Agregar Globo:</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => addSpeechBubble(selectedPanel, 'speech')}
                      className="w-full py-2 px-4 bg-blue-50 border-2 border-blue-300 rounded-detective hover:bg-blue-100 transition-colors text-left"
                    >
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Diálogo
                    </button>
                    <button
                      onClick={() => addSpeechBubble(selectedPanel, 'thought')}
                      className="w-full py-2 px-4 bg-purple-50 border-2 border-purple-300 rounded-detective hover:bg-purple-100 transition-colors text-left"
                    >
                      💭 Pensamiento
                    </button>
                    <button
                      onClick={() => addSpeechBubble(selectedPanel, 'caption')}
                      className="w-full py-2 px-4 bg-yellow-50 border-2 border-yellow-300 rounded-detective hover:bg-yellow-100 transition-colors text-left"
                    >
                      <Type className="w-4 h-4 inline mr-2" />
                      Narración
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-detective-text-secondary text-sm mb-2">Fondos:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {backgrounds.map(bg => (
                      <button
                        key={bg.id}
                        className={`py-2 px-3 ${bg.color} border-2 border-gray-300 rounded hover:border-detective-orange transition-colors text-xs`}
                      >
                        {bg.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-3 bg-white rounded-detective shadow-card p-6">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold text-detective-text">{title}</h2>
            </div>

            <div className="space-y-4 border-4 border-detective-text p-4 rounded-detective bg-white min-h-[600px]">
              {panels.map((panel, index) => (
                <div
                  key={panel.id}
                  onClick={() => setSelectedPanel(panel.id)}
                  className={`border-4 border-detective-text p-4 cursor-pointer relative bg-gray-50 ${
                    selectedPanel === panel.id ? 'ring-4 ring-detective-orange' : ''
                  }`}
                  style={{ minHeight: '200px' }}
                >
                  <div className="absolute top-2 left-2 bg-detective-text text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  {panel.speechBubbles.map(bubble => (
                    <div
                      key={bubble.id}
                      className={`absolute ${
                        bubble.type === 'speech' ? 'bg-white border-2 border-detective-text rounded-xl' :
                        bubble.type === 'thought' ? 'bg-white border-2 border-detective-text rounded-full' :
                        'bg-yellow-100 border-2 border-yellow-400'
                      } px-4 py-2 max-w-xs`}
                      style={{
                        left: `${bubble.x}%`,
                        top: `${bubble.y}%`,
                      }}
                    >
                      <p className="text-sm text-detective-text font-medium">{bubble.text}</p>
                    </div>
                  ))}

                  {selectedPanel === panel.id && (
                    <div className="mt-12">
                      <textarea
                        value={panel.text}
                        onChange={(e) => updatePanelText(panel.id, e.target.value)}
                        placeholder="Descripción de la escena o narración..."
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-detective-orange focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              ))}

              {panels.length === 0 && (
                <div className="text-center py-20 text-detective-text-secondary">
                  <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Agrega paneles para comenzar tu cómic</p>
                  <p className="text-sm">sobre la vida de Marie Curie</p>
                </div>
              )}
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

export default ComicDigitalExercise;
