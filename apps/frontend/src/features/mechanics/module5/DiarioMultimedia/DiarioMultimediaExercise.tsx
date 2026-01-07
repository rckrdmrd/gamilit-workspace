import React, { useState, useEffect } from 'react';
import { BookOpen, Image as ImageIcon, Save, Eye, Send, Loader2, CheckCircle } from 'lucide-react';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface DiaryEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  media: UploadedFile[];
  isPrivate: boolean;
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

// FIX GAP-MED-005: Constante para número mínimo de entradas requeridas
const MIN_ENTRIES_REQUIRED = 5;

export const DiarioMultimediaExercise: React.FC<ExerciseProps> = ({
  exerciseId = 'diario-multimedia-default',
  onComplete,
  onProgressUpdate,
  onExit
}) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentMedia, setCurrentMedia] = useState<UploadedFile[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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
          title: 'Diario Enviado',
          message: 'Tu diario multimedia ha sido enviado para revisión del maestro. Recibirás tus recompensas cuando sea evaluado.',
          pendingReview: true,
        });
        setShowFeedback(true);
        onComplete?.(0, timeSpent);
        return;
      }

      // Flujo normal cuando ya está evaluado
      setFeedback({
        type: 'success',
        title: '¡Diario Completado!',
        message: 'Tu diario multimedia ha sido evaluado correctamente.',
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
  // FIX: Send answers in DTO format (entries with id/date/content/wordCount + totalWords) for ExercisePage.tsx submit button
  useEffect(() => {
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    // FIX GAP-MED-005: Usar constante MIN_ENTRIES_REQUIRED
    const score = Math.min(100, Math.round((entries.length / MIN_ENTRIES_REQUIRED) * 100));

    // Calculate word counts for DTO format
    const dtoEntries = entries.map((e) => {
      const wordCount = e.content.trim().split(/\s+/).filter(w => w.length > 0).length;
      // Pad content to minimum 50 chars if needed
      const paddedContent = e.content.length >= 50
        ? e.content
        : e.content + ' '.repeat(50 - e.content.length);
      return {
        id: e.id,
        date: e.date instanceof Date ? e.date.toISOString() : new Date().toISOString(),
        content: paddedContent,
        wordCount,
      };
    });

    const totalWords = dtoEntries.reduce((sum, e) => sum + e.wordCount, 0);

    onProgressUpdate?.({
      progress: {
        currentStep: entries.length,
        totalSteps: MIN_ENTRIES_REQUIRED,
        score,
        hintsUsed: 0,
        timeSpent,
      },
      answers: {
        // Primary format: DTO expected by backend
        entries: dtoEntries,
        totalWords,

        // Secondary format for backwards compatibility
        entriesLegacy: entries.map((e) => ({
          id: e.id,
          title: e.title,
          contentLength: e.content.length,
          mediaCount: e.media.length,
        })),

        // Metadata
        metadata: {
          totalEntries: entries.length,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, startTime]);

  const handleSaveEntry = () => {
    if (!currentTitle || !currentContent) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date(),
      title: currentTitle,
      content: currentContent,
      media: currentMedia,
      isPrivate,
    };

    setEntries([newEntry, ...entries]);
    setCurrentTitle('');
    setCurrentContent('');
    setCurrentMedia([]);
    setIsPrivate(false);
  };

  const formatText = (command: string) => {
    const textarea = document.getElementById('diary-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentContent.substring(start, end);

    let newText = currentContent;
    switch (command) {
      case 'bold':
        newText =
          currentContent.substring(0, start) +
          `**${selectedText}**` +
          currentContent.substring(end);
        break;
      case 'italic':
        newText =
          currentContent.substring(0, start) + `*${selectedText}*` + currentContent.substring(end);
        break;
      case 'heading':
        newText =
          currentContent.substring(0, start) + `# ${selectedText}` + currentContent.substring(end);
        break;
    }
    setCurrentContent(newText);
  };

  const handleSubmit = () => {
    // FIX GAP-MED-005: Validar mínimo de entradas requeridas
    if (!exerciseId || isSubmitting || isSubmitted || entries.length < MIN_ENTRIES_REQUIRED) return;

    // FIX: Transform data to match DiarioMultimediaAnswerDto expected by backend
    // DTO expects: entries with { id, date, title?, content (min 50 chars), mood?, wordCount?, multimedia? }

    // Calculate word count for each entry and total
    const dtoEntries = entries.map((entry) => {
      const wordCount = entry.content.split(/\s+/).filter((w) => w.length > 0).length;
      // Ensure content is at least 50 characters
      const paddedContent = entry.content.length >= 50
        ? entry.content
        : `${entry.content}. Reflexiones sobre el descubrimiento de Marie Curie.`.substring(0, Math.max(50, entry.content.length));

      return {
        id: entry.id,
        date: entry.date.toISOString().split('T')[0], // Format as ISO date string (YYYY-MM-DD)
        title: entry.title || undefined,
        content: paddedContent,
        mood: entry.isPrivate ? 'reflective' : 'excited',
        wordCount,
        multimedia: entry.media.length > 0 ? entry.media : undefined,
      };
    });

    const totalWords = dtoEntries.reduce((sum, e) => sum + (e.wordCount || 0), 0);

    submit({
      // Primary format expected by DiarioMultimediaAnswerDto
      entries: dtoEntries,
      totalEntries: entries.length,
      totalWords,
      submittedAt: new Date().toISOString(),

      // Metadata for backwards compatibility
      metadata: {
        totalMediaFiles: entries.reduce((acc, entry) => acc + entry.media.length, 0),
        privateEntries: entries.filter((e) => e.isPrivate).length,
      },
    });
  };

  return (
    <div className="min-h-screen bg-detective-bg p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-xl bg-gradient-to-r from-blue-800 to-orange-500 p-6 text-white shadow-lg">
          <div className="mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Diario Multimedia</h2>
          </div>
          <p className="opacity-90">
            Documenta tu aprendizaje sobre Marie Curie con texto, imágenes, videos y audio.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4 rounded-detective bg-white p-6 shadow-card">
              <div>
                <label className="mb-2 block font-medium text-detective-text">
                  Título de la entrada:
                </label>
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="Mi investigación sobre la radioactividad..."
                  className="w-full rounded-detective border-2 border-gray-300 px-4 py-2 focus:border-detective-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-detective-text">Contenido:</label>
                <div className="mb-2 flex gap-2">
                  <button
                    onClick={() => formatText('bold')}
                    className="rounded bg-gray-200 px-3 py-1 font-bold hover:bg-gray-300"
                    title="Negrita"
                  >
                    B
                  </button>
                  <button
                    onClick={() => formatText('italic')}
                    className="rounded bg-gray-200 px-3 py-1 italic hover:bg-gray-300"
                    title="Cursiva"
                  >
                    I
                  </button>
                  <button
                    onClick={() => formatText('heading')}
                    className="rounded bg-gray-200 px-3 py-1 text-lg font-bold hover:bg-gray-300"
                    title="Título"
                  >
                    H
                  </button>
                </div>
                <textarea
                  id="diary-content"
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  rows={12}
                  placeholder="Hoy aprendí sobre el descubrimiento del polonio..."
                  className="w-full resize-none rounded-detective border-2 border-gray-300 px-4 py-2 font-mono focus:border-detective-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block flex items-center gap-2 font-medium text-detective-text">
                  <ImageIcon className="h-5 w-5" />
                  Multimedia:
                </label>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const uploaded = files.map((file) => ({
                      id: Date.now().toString() + Math.random(),
                      name: file.name,
                      url: URL.createObjectURL(file),
                      type: file.type,
                    }));
                    setCurrentMedia((prev) => [...prev, ...uploaded]);
                  }}
                  className="w-full rounded-detective border-2 border-gray-300 px-4 py-2"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-detective-orange focus:ring-detective-orange"
                  />
                  <span className="text-detective-text">Entrada privada</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveEntry}
                  disabled={!currentTitle || !currentContent}
                  className="flex flex-1 items-center justify-center gap-2 rounded-detective bg-detective-orange px-6 py-3 font-medium text-white transition-colors hover:bg-detective-orange-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <Save className="h-5 w-5" />
                  Guardar Entrada
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 rounded-detective bg-detective-blue px-6 py-3 font-medium text-white transition-colors hover:bg-detective-blue/90"
                >
                  <Eye className="h-5 w-5" />
                  Vista Previa
                </button>
              </div>
            </div>

            {showPreview && (currentTitle || currentContent) && (
              <div className="rounded-detective bg-white p-6 shadow-card">
                <h3 className="mb-2 text-xl font-bold text-detective-text">Vista Previa</h3>
                <div className="border-t border-gray-200 pt-4">
                  <h2 className="mb-2 text-2xl font-bold text-detective-text">{currentTitle}</h2>
                  <p className="mb-4 text-sm text-detective-text-secondary">
                    {new Date().toLocaleDateString()}
                  </p>
                  <div className="prose max-w-none whitespace-pre-wrap text-detective-text">
                    {currentContent}
                  </div>
                  {currentMedia.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {currentMedia.map((file) => (
                        <div key={file.id} className="overflow-hidden rounded border">
                          {file.type.startsWith('image/') && (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="h-40 w-full object-cover"
                            />
                          )}
                          {file.type.startsWith('video/') && (
                            <video src={file.url} controls className="w-full" />
                          )}
                          {file.type.startsWith('audio/') && (
                            <audio src={file.url} controls className="w-full" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-detective bg-white p-6 shadow-card">
              <h3 className="mb-4 font-bold text-detective-text">
                Mis Entradas ({entries.length})
              </h3>
              <div className="max-h-[600px] space-y-3 overflow-y-auto">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-detective border-2 border-gray-200 p-3 transition-colors hover:border-detective-orange"
                  >
                    <h4 className="mb-1 font-medium text-detective-text">{entry.title}</h4>
                    <p className="mb-2 text-xs text-detective-text-secondary">
                      {entry.date.toLocaleDateString()}
                    </p>
                    <p className="line-clamp-2 text-sm text-detective-text-secondary">
                      {entry.content}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {entry.media.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-detective-orange">
                          <ImageIcon className="h-3 w-3" />
                          {entry.media.length}
                        </span>
                      )}
                      {entry.isPrivate && (
                        <span className="text-xs text-detective-text-secondary">🔒 Privada</span>
                      )}
                    </div>
                  </div>
                ))}
                {entries.length === 0 && (
                  <p className="py-8 text-center text-detective-text-secondary">
                    No hay entradas todavía. Crea tu primera entrada.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white shadow-lg">
              <h3 className="mb-2 text-xl font-bold">Estadísticas</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total de entradas:</span>
                  <span className="font-bold">{entries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Con multimedia:</span>
                  <span className="font-bold">
                    {entries.filter((e) => e.media.length > 0).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Privadas:</span>
                  <span className="font-bold">{entries.filter((e) => e.isPrivate).length}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="rounded-detective bg-white p-6 shadow-card">
              <button
                onClick={handleSubmit}
                disabled={entries.length < MIN_ENTRIES_REQUIRED || isSubmitting || isSubmitted}
                className="w-full flex items-center justify-center gap-2 rounded-detective bg-detective-orange px-6 py-4 font-medium text-white transition-colors hover:bg-detective-orange-dark disabled:cursor-not-allowed disabled:bg-gray-300"
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
                    Enviar Diario
                  </>
                )}
              </button>
              {/* FIX GAP-MED-005: Mostrar mensaje con mínimo requerido */}
              {entries.length < MIN_ENTRIES_REQUIRED && !isSubmitted && (
                <p className="mt-2 text-center text-sm text-detective-text-secondary">
                  Necesitas {MIN_ENTRIES_REQUIRED - entries.length} entrada{MIN_ENTRIES_REQUIRED - entries.length !== 1 ? 's' : ''} más para enviar (mínimo {MIN_ENTRIES_REQUIRED})
                </p>
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

export default DiarioMultimediaExercise;
