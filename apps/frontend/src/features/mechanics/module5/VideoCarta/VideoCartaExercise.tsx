import React, { useState, useRef } from 'react';
import { Video, Camera, Download } from 'lucide-react';

export const VideoCartaExercise: React.FC = () => {
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [filter, setFilter] = useState('none');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const filters = [
    { id: 'none', name: 'Sin filtro', class: '' },
    { id: 'sepia', name: 'Sepia (Antiguo)', class: 'sepia' },
    { id: 'grayscale', name: 'Blanco y Negro', class: 'grayscale' },
    { id: 'vintage', name: 'Vintage', class: 'contrast-125 brightness-110' },
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Error al acceder a la cámara. Por favor, permite el acceso.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-detective-bg p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-detective bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <Video className="h-8 w-8 text-detective-orange" />
            <h1 className="text-3xl font-bold text-detective-text">Video Carta</h1>
          </div>
          <p className="text-detective-text-secondary">
            Graba un video mensaje sobre lo que aprendiste de Marie Curie.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!recordedVideo ? (
              <div className="rounded-detective bg-white p-6 shadow-card">
                <div
                  className="relative overflow-hidden rounded-detective bg-black"
                  style={{ aspectRatio: '16/9' }}
                >
                  <video ref={videoRef} autoPlay muted className={`h-full w-full ${filter}`} />
                  {!isRecording && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="h-20 w-20 text-white/50" />
                    </div>
                  )}
                  {isRecording && (
                    <div className="absolute right-4 top-4 flex animate-pulse items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-white">
                      <div className="h-3 w-3 rounded-full bg-white" />
                      REC
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-center gap-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 rounded-detective bg-red-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-red-700"
                    >
                      <Camera className="h-6 w-6" />
                      Iniciar Grabación
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 rounded-detective bg-detective-text px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-detective-text/90"
                    >
                      ⏹ Detener Grabación
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-detective bg-white p-6 shadow-card">
                <video src={recordedVideo} controls className="w-full rounded-detective" />
                <div className="flex gap-3">
                  <button
                    onClick={() => setRecordedVideo(null)}
                    className="flex-1 rounded-detective bg-detective-orange px-4 py-3 font-medium text-white transition-colors hover:bg-detective-orange-dark"
                  >
                    Grabar Nuevo Video
                  </button>
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = recordedVideo;
                      a.download = 'video-carta-marie-curie.webm';
                      a.click();
                    }}
                    className="flex items-center gap-2 rounded-detective bg-detective-blue px-6 py-3 font-medium text-white transition-colors hover:bg-detective-blue/90"
                  >
                    <Download className="h-5 w-5" />
                    Descargar
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
              <h3 className="mb-3 font-bold text-detective-text">💡 Consejos:</h3>
              <ul className="space-y-2 text-sm text-detective-text-secondary">
                <li>• Presenta tu tema al inicio</li>
                <li>• Habla claramente y con entusiasmo</li>
                <li>• Menciona 3 datos sobre Marie Curie</li>
                <li>• Concluye con tu reflexión personal</li>
                <li>• Duración recomendada: 1-3 minutos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
