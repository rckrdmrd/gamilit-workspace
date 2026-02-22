/**
 * ResponseDetailModal Component
 *
 * Displays detailed information about a student's exercise attempt including:
 * - Student info
 * - Exercise info
 * - Submitted answer
 * - Correct answer
 * - Visual comparison
 * - Metrics (score, time, hints, comodines)
 * - Rewards (XP, ML Coins)
 *
 * @component
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, type ChangeEvent, type ReactNode } from 'react';
import { Modal } from '@shared/components/common/Modal';
import {
  X,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  Zap,
  Award,
  Coins,
  TrendingUp,
  BookOpen,
  ClipboardCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Image as ImageIcon,
  Video,
  Music,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAttemptDetail } from '@apps/teacher/hooks/useExerciseResponses';
import { ExerciseContentRenderer } from '@/shared/components/mechanics/ExerciseContentRenderer';

// ============================================================================
// TYPES
// ============================================================================

interface ResponseDetailModalProps {
  attemptId: string | null;
  open: boolean;
  onClose: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Determines if an exercise requires manual grading
 * P0-03: Updated 2025-12-18 - Complete list of manual mechanics
 *
 * 10 manual mechanics identified in analysis:
 * - Predicción Narrativa, Tribunal de Opiniones, Podcast Argumentativo
 * - Debate Digital, Cómic Digital, Video Carta, Diario Multimedia
 * - Collage Prensa, Call to Action, Texto en Movimiento
 */
const requiresManualGrading = (exerciseType: string): boolean => {
  const manualGradingTypes = [
    // Módulo 2 - Manual
    'prediccion_narrativa',
    // Módulo 3 - Críticos/Argumentativos
    'tribunal_opiniones',
    'podcast_argumentativo',
    'debate_digital',
    // Módulo 4 - Alfabetización Mediática (creativos)
    'analisis_memes', // Semi-auto but needs review
    // Módulo 5 - Creación de Contenido
    'comic_digital',
    'video_carta',
    'diario_multimedia',
    // Auxiliares
    'collage_prensa',
    'call_to_action',
    'texto_en_movimiento',
  ];
  return manualGradingTypes.includes(exerciseType);
};

/**
 * P2-03: Multimedia content type detection
 * Identifies multimedia content types for creative exercises
 */
type MediaType = 'video' | 'audio' | 'image' | 'text' | 'unknown';

interface MediaContent {
  type: MediaType;
  url?: string;
  urls?: string[];
  text?: string;
  mimeType?: string;
  thumbnail?: string;
}

const detectMediaType = (url: string): MediaType => {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

  if (videoExts.includes(extension)) return 'video';
  if (audioExts.includes(extension)) return 'audio';
  if (imageExts.includes(extension)) return 'image';
  return 'unknown';
};

/**
 * Extracts multimedia content from answer data
 */
const extractMediaContent = (answerData: Record<string, unknown>): MediaContent[] => {
  const media: MediaContent[] = [];

  // Check for direct media URLs
  const mediaFields = ['videoUrl', 'audioUrl', 'imageUrl', 'mediaUrl', 'url', 'file'];
  for (const field of mediaFields) {
    if (typeof answerData[field] === 'string' && answerData[field]) {
      const url = answerData[field] as string;
      media.push({
        type: detectMediaType(url),
        url,
      });
    }
  }

  // Check for arrays of media
  const arrayFields = ['images', 'videos', 'audios', 'files', 'media'];
  for (const field of arrayFields) {
    if (Array.isArray(answerData[field])) {
      for (const item of answerData[field] as (string | { url: string })[]) {
        const url = typeof item === 'string' ? item : item?.url;
        if (url) {
          media.push({
            type: detectMediaType(url),
            url,
          });
        }
      }
    }
  }

  // Check for podcast/video specific fields
  if (answerData.podcast_url && typeof answerData.podcast_url === 'string') {
    media.push({ type: 'audio', url: answerData.podcast_url });
  }
  if (answerData.video_url && typeof answerData.video_url === 'string') {
    media.push({ type: 'video', url: answerData.video_url });
  }

  // Check for comic panels (images)
  if (Array.isArray(answerData.panels)) {
    for (const panel of answerData.panels as { imageUrl?: string }[]) {
      if (panel.imageUrl) {
        media.push({ type: 'image', url: panel.imageUrl });
      }
    }
  }

  // Check for collage images
  if (Array.isArray(answerData.collage_items)) {
    for (const item of answerData.collage_items as { url?: string }[]) {
      if (item.url) {
        media.push({ type: 'image', url: item.url });
      }
    }
  }

  return media;
};

/**
 * Check if exercise type has multimedia content
 */
const hasMultimediaContent = (exerciseType: string): boolean => {
  const multimediaTypes = [
    'video_carta',
    'podcast_argumentativo',
    'comic_digital',
    'diario_multimedia',
    'collage_prensa',
    'infografia_interactiva',
    'creacion_storyboard',
  ];
  return multimediaTypes.includes(exerciseType);
};

// ============================================================================
// MULTIMEDIA PLAYER COMPONENTS (P2-03)
// ============================================================================

/**
 * Video Player Component
 */
const VideoPlayer = ({ url, title }: { url: string; title?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatVideoTime = (time: number): string => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen?.();
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-black">
      <video
        ref={videoRef}
        src={url}
        className="aspect-video w-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="flex items-center gap-3 bg-gray-900 px-4 py-2">
        <button
          onClick={togglePlay}
          className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1"
        />
        <span className="text-xs text-white">
          {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
        </span>
        <button
          onClick={toggleMute}
          className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <button
          onClick={handleFullscreen}
          className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>
      {title && <p className="bg-gray-800 px-4 py-2 text-sm text-white">{title}</p>}
    </div>
  );
};

/**
 * Audio Player Component
 */
const AudioPlayer = ({ url, title }: { url: string; title?: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatAudioTime = (time: number): string => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white">
          <Music className="h-6 w-6" />
        </div>
        <div className="flex-1">
          {title && <p className="mb-1 font-medium text-gray-800">{title}</p>}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white transition-colors hover:bg-purple-700"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-gray-600">
              {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Image Gallery Component
 */
const ImageGallery = ({ images, title }: { images: string[]; title?: string }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      {title && <p className="font-medium text-gray-800">{title}</p>}
      {/* Main Image */}
      <div
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200"
        onClick={() => setIsLightboxOpen(true)}
      >
        <img
          src={images[selectedIndex]}
          alt={`Imagen ${selectedIndex + 1}`}
          className="h-64 w-full object-contain bg-gray-100"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <Maximize2 className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                index === selectedIndex ? 'border-orange-500' : 'border-gray-200'
              }`}
            >
              <img src={img} alt={`Miniatura ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={images[selectedIndex]}
              alt={`Imagen ${selectedIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(index);
                    }}
                    className={`h-2 w-2 rounded-full ${
                      index === selectedIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Multimedia Content Section
 * Renders all multimedia content found in the answer
 */
const MultimediaContent = ({ answerData, exerciseType }: {
  answerData: Record<string, unknown>;
  exerciseType: string;
}) => {
  const mediaContent = extractMediaContent(answerData);

  if (mediaContent.length === 0 && !hasMultimediaContent(exerciseType)) {
    return null;
  }

  const videos = mediaContent.filter((m) => m.type === 'video');
  const audios = mediaContent.filter((m) => m.type === 'audio');
  const images = mediaContent.filter((m) => m.type === 'image');

  return (
    <div className="space-y-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <h3 className="flex items-center gap-2 font-bold text-gray-800">
        {videos.length > 0 && <Video className="h-5 w-5 text-blue-600" />}
        {audios.length > 0 && <Music className="h-5 w-5 text-purple-600" />}
        {images.length > 0 && <ImageIcon className="h-5 w-5 text-green-600" />}
        Contenido Multimedia
      </h3>

      {/* Videos */}
      {videos.length > 0 && (
        <div className="space-y-3">
          {videos.map((video, index) => (
            <VideoPlayer
              key={index}
              url={video.url!}
              title={videos.length > 1 ? `Video ${index + 1}` : undefined}
            />
          ))}
        </div>
      )}

      {/* Audios */}
      {audios.length > 0 && (
        <div className="space-y-3">
          {audios.map((audio, index) => (
            <AudioPlayer
              key={index}
              url={audio.url!}
              title={audios.length > 1 ? `Audio ${index + 1}` : exerciseType === 'podcast_argumentativo' ? 'Podcast' : undefined}
            />
          ))}
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <ImageGallery
          images={images.map((img) => img.url!)}
          title={exerciseType === 'comic_digital' ? 'Paneles del C\u00f3mic' : exerciseType === 'collage_prensa' ? 'Collage' : undefined}
        />
      )}

      {/* Download Links */}
      {mediaContent.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-blue-200 pt-3">
          {mediaContent.map((media, index) => (
            <a
              key={index}
              href={media.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Download className="h-4 w-4" />
              Descargar {media.type === 'video' ? 'Video' : media.type === 'audio' ? 'Audio' : 'Imagen'}{' '}
              {mediaContent.length > 1 ? index + 1 : ''}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const InfoCard = ({ icon, title, children }: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-detective-orange/10 text-detective-orange">
          {icon}
        </div>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
};

const MetricBadge = ({ icon, label, value, color = 'bg-blue-50 text-blue-700 border-blue-200' }: {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) => {
  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${color}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium opacity-80">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
};

const AnswerComparison = ({ studentAnswer, correctAnswer, exerciseType }: {
  studentAnswer: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
  exerciseType?: string;
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Respuesta del Estudiante */}
      <div className="rounded-xl border-2 border-orange-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <User className="h-5 w-5 text-orange-600" />
          <h4 className="font-bold text-gray-800">Respuesta del Estudiante</h4>
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <ExerciseContentRenderer
            exerciseType={exerciseType || 'unknown'}
            answerData={studentAnswer}
            correctAnswer={correctAnswer}
            showComparison={true}
          />
        </div>
      </div>

      {/* Respuesta Correcta */}
      <div className="rounded-xl border-2 border-green-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h4 className="font-bold text-gray-800">Respuesta Correcta</h4>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <ExerciseContentRenderer
            exerciseType={exerciseType || 'unknown'}
            answerData={correctAnswer}
          />
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-detective-orange border-t-transparent" />
      <p className="font-medium text-gray-600">Cargando detalles...</p>
    </div>
  );
};

const ErrorState = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-800">Error al cargar</h3>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ResponseDetailModal = ({
  attemptId,
  open,
  onClose,
}: ResponseDetailModalProps) => {
  const navigate = useNavigate();
  const { data: attempt, isLoading, error } = useAttemptDetail(attemptId, open);

  // Note: ESC key, scroll lock, and focus trap are handled by Modal component

  /**
   * Navigate to ReviewPanel with submissionId parameter
   */
  const handleGoToReview = () => {
    if (attempt) {
      onClose(); // Close modal first
      navigate(`/teacher/reviews?submissionId=${attempt.id}`);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      animated
      size="5xl"
      showCloseButton={false}
      overlayClassName="bg-black/60 backdrop-blur-[2px] p-4"
      className="overflow-hidden rounded-2xl shadow-2xl my-8"
      contentClassName="custom"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
        <h2 id="response-detail-title" className="flex items-center gap-2 text-2xl font-bold text-white">
          <FileText className="h-6 w-6" />
          Detalle de Respuesta
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-2 transition-colors hover:bg-white/20"
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
              {isLoading && <LoadingState />}

              {error && <ErrorState message={error.message} />}

              {attempt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Student & Exercise Info */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoCard
                      icon={<User className="h-5 w-5" />}
                      title="Información del Estudiante"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
                          {attempt.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{attempt.student_name}</p>
                          <p className="text-sm text-gray-500">Intento #{attempt.attempt_number}</p>
                        </div>
                      </div>
                    </InfoCard>

                    <InfoCard
                      icon={<BookOpen className="h-5 w-5" />}
                      title="Información del Ejercicio"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{attempt.exercise_title}</p>
                        <p className="mt-1 text-sm text-gray-600">Módulo: {attempt.module_name}</p>
                        <p className="text-sm text-gray-600">
                          Tipo: <span className="font-medium">{attempt.exercise_type}</span>
                        </p>
                      </div>
                    </InfoCard>
                  </div>

                  {/* Result Badge */}
                  <div className="flex items-center justify-center">
                    <div
                      className={`flex items-center gap-3 rounded-2xl border-2 px-6 py-4 ${
                        attempt.is_correct
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                      }`}
                    >
                      {attempt.is_correct ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-600">Resultado</p>
                        <p
                          className={`text-2xl font-bold ${
                            attempt.is_correct ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {attempt.is_correct ? 'Correcto' : 'Incorrecto'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <MetricBadge
                      icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
                      label="Puntaje"
                      value={`${attempt.score}/${attempt.max_score}`}
                      color="bg-blue-50 text-blue-700 border-blue-200"
                    />
                    <MetricBadge
                      icon={<Clock className="h-5 w-5 text-purple-600" />}
                      label="Tiempo"
                      value={formatTime(attempt.time_spent_seconds)}
                      color="bg-purple-50 text-purple-700 border-purple-200"
                    />
                    <MetricBadge
                      icon={<Lightbulb className="h-5 w-5 text-orange-600" />}
                      label="Pistas"
                      value={attempt.hints_used}
                      color="bg-orange-50 text-orange-700 border-orange-200"
                    />
                    <MetricBadge
                      icon={<Zap className="h-5 w-5 text-yellow-600" />}
                      label="Comodines"
                      value={attempt.comodines_used.length}
                      color="bg-yellow-50 text-yellow-700 border-yellow-200"
                    />
                  </div>

                  {/* Rewards */}
                  <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
                      <Award className="h-5 w-5 text-purple-600" />
                      Recompensas Obtenidas
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                          <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">XP Ganado</p>
                          <p className="text-lg font-bold text-purple-700">
                            {attempt.xp_earned} XP
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                          <Coins className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">ML Coins</p>
                          <p className="text-lg font-bold text-yellow-700">
                            {attempt.ml_coins_earned} 🪙
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Criteria Section - Phase 3 TASK-2026-01-18-006 */}
                  <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
                      <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                      Criterios de Evaluación
                    </h3>
                    {requiresManualGrading(attempt.exercise_type) ? (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                          <p className="text-sm text-yellow-800">
                            <span className="font-semibold">Tipo de ejercicio:</span> Requiere evaluación manual
                          </p>
                          <p className="mt-1 text-xs text-yellow-600">
                            Este ejercicio creativo necesita ser evaluado por el docente usando criterios cualitativos.
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Aspectos a evaluar:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                              Coherencia y estructura del contenido
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                              Creatividad y originalidad
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                              Uso correcto del lenguaje
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                              Comprensión del tema tratado
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                          <p className="text-sm text-green-800">
                            <span className="font-semibold">Tipo de ejercicio:</span> Evaluación automática
                          </p>
                          <p className="mt-1 text-xs text-green-600">
                            Este ejercicio fue evaluado automáticamente por el sistema.
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-lg bg-white p-3 text-center">
                            <p className="text-xs text-gray-500">Puntaje obtenido</p>
                            <p className="text-xl font-bold text-indigo-600">{attempt.score}</p>
                          </div>
                          <div className="rounded-lg bg-white p-3 text-center">
                            <p className="text-xs text-gray-500">Puntaje máximo</p>
                            <p className="text-xl font-bold text-gray-600">{attempt.max_score}</p>
                          </div>
                          <div className="rounded-lg bg-white p-3 text-center">
                            <p className="text-xs text-gray-500">Porcentaje</p>
                            <p className="text-xl font-bold text-green-600">
                              {Math.round((attempt.score / attempt.max_score) * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Answer Comparison */}
                  <div>
                    <h3 className="mb-3 text-lg font-bold text-gray-800">
                      Comparación de Respuestas
                    </h3>
                    <AnswerComparison
                      studentAnswer={attempt.submitted_answers}
                      correctAnswer={attempt.correct_answer}
                      exerciseType={attempt.exercise_type}
                    />
                  </div>

                  {/* P2-03: Multimedia Content Section */}
                  {hasMultimediaContent(attempt.exercise_type) && (
                    <MultimediaContent
                      answerData={attempt.submitted_answers}
                      exerciseType={attempt.exercise_type}
                    />
                  )}

                  {/* Metadata */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Fecha de envío:</span>{' '}
                      {formatDate(attempt.submitted_at)}
                    </p>
                    {attempt.comodines_used.length > 0 && (
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold">Comodines usados:</span>{' '}
                        {attempt.comodines_used.join(', ')}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              {/* Botón Calificar - Solo para ejercicios que requieren revisión manual */}
              {attempt && requiresManualGrading(attempt.exercise_type) && (
                <button
                  onClick={handleGoToReview}
                  className="btn-detective flex items-center gap-2 rounded-lg px-6 py-2 font-semibold"
                >
                  <ClipboardCheck className="h-5 w-5" />
                  Calificar
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg bg-gray-200 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
    </Modal>
  );
};
