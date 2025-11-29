/**
 * useAudioRecorder Hook - Examples
 *
 * This file contains usage examples for the useAudioRecorder hook.
 * NOT imported anywhere - FOR DOCUMENTATION PURPOSES ONLY.
 */

import React, { useEffect } from 'react';
import { useAudioRecorder } from './useAudioRecorder';

/**
 * Example 1: Basic Audio Recorder Component
 */
export function BasicAudioRecorder() {
  const {
    permissionState,
    isRecording,
    audioUrl,
    duration,
    checkPermission,
    requestPermission,
    startRecording,
    stopRecording,
    resetRecording,
    isSupported,
    error,
  } = useAudioRecorder();

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Handle unsupported browser
  if (!isSupported) {
    return (
      <div className="error">
        <h3>Navegador No Soportado</h3>
        <p>Por favor usa Chrome, Firefox o Edge actualizado.</p>
      </div>
    );
  }

  // Handle permission denied
  if (permissionState === 'denied') {
    return (
      <div className="warning">
        <h3>Permisos Requeridos</h3>
        <p>Por favor habilita el acceso al micrófono en la configuración de tu navegador.</p>
      </div>
    );
  }

  // Request permission first
  if (permissionState === 'prompt') {
    return <button onClick={requestPermission}>Permitir Acceso al Micrófono</button>;
  }

  // Main recording UI
  return (
    <div>
      <h2>Grabadora de Audio</h2>

      {/* Display error if any */}
      {error && (
        <div className="error">
          <strong>{error.message}</strong>
          <p>{error.userAction}</p>
        </div>
      )}

      {/* Recording controls */}
      {!audioUrl && (
        <div>
          <p>Duración: {duration}s</p>
          {!isRecording ? (
            <button onClick={startRecording}>Iniciar Grabación</button>
          ) : (
            <button onClick={stopRecording}>Detener Grabación</button>
          )}
        </div>
      )}

      {/* Playback */}
      {audioUrl && (
        <div>
          <audio src={audioUrl} controls />
          <button onClick={resetRecording}>Grabar Nuevamente</button>
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Advanced Audio Recorder with Time Limit
 */
export function TimeLimitedAudioRecorder({ maxDuration = 120 }: { maxDuration?: number }) {
  const {
    permissionState,
    recordingState,
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    checkPermission,
    requestPermission,
    startRecording,
    stopRecording,
    resetRecording,
    error,
  } = useAudioRecorder();

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Auto-stop recording when max duration is reached
  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      stopRecording();
    }
  }, [isRecording, duration, maxDuration, stopRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeRemaining = maxDuration - duration;
  const isNearLimit = timeRemaining <= 10 && isRecording;

  return (
    <div>
      <h2>Grabadora con Límite de Tiempo</h2>

      {/* Permission prompt */}
      {permissionState === 'prompt' && (
        <button onClick={requestPermission}>Permitir Micrófono</button>
      )}

      {/* Error display */}
      {error && (
        <div className="alert alert-error">
          <h4>{error.message}</h4>
          <p>{error.userAction}</p>
        </div>
      )}

      {/* Recording controls */}
      {permissionState === 'granted' && !audioBlob && (
        <div>
          <div className={`timer ${isNearLimit ? 'warning' : ''}`}>
            {formatTime(duration)} / {formatTime(maxDuration)}
          </div>

          {recordingState === 'idle' && (
            <button onClick={startRecording} className="btn-record">
              Iniciar Grabación
            </button>
          )}

          {isRecording && (
            <button onClick={stopRecording} className="btn-stop">
              Detener Grabación
            </button>
          )}

          {isNearLimit && <p className="warning">¡Solo quedan {timeRemaining} segundos!</p>}
        </div>
      )}

      {/* Playback */}
      {audioUrl && audioBlob && (
        <div>
          <p>Grabación completada: {formatTime(duration)}</p>
          <audio src={audioUrl} controls />
          <p>Tamaño: {(audioBlob.size / 1024).toFixed(2)} KB</p>
          <button onClick={resetRecording}>Grabar Nuevamente</button>
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Using with Form Submission
 */
export function AudioRecorderForm() {
  const {
    permissionState,
    audioBlob,
    audioUrl,
    duration,
    checkPermission,
    requestPermission,
    startRecording,
    stopRecording,
    resetRecording,
    isRecording,
    error,
  } = useAudioRecorder();

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioBlob) {
      alert('Por favor graba un audio primero');
      return;
    }

    // Create FormData to upload
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('duration', duration.toString());

    try {
      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Audio enviado exitosamente!');
        resetRecording();
      } else {
        alert('Error al enviar el audio');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error de red');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Formulario con Audio</h2>

      {/* Permission handling */}
      {permissionState === 'prompt' && (
        <button type="button" onClick={requestPermission}>
          Permitir Micrófono
        </button>
      )}

      {/* Error display */}
      {error && (
        <div className="error">
          <strong>{error.type}</strong>: {error.message}
          <br />
          <em>{error.userAction}</em>
        </div>
      )}

      {/* Recording controls */}
      {permissionState === 'granted' && (
        <div>
          {!audioUrl && !isRecording && (
            <button type="button" onClick={startRecording}>
              Grabar Audio
            </button>
          )}

          {isRecording && (
            <div>
              <p>Grabando... {duration}s</p>
              <button type="button" onClick={stopRecording}>
                Detener
              </button>
            </div>
          )}

          {audioUrl && (
            <div>
              <audio src={audioUrl} controls />
              <button type="button" onClick={resetRecording}>
                Grabar Nuevamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submit button */}
      <button type="submit" disabled={!audioBlob}>
        Enviar Formulario
      </button>
    </form>
  );
}

/**
 * Example 4: Permission State Visualization
 */
export function PermissionStateDemo() {
  const { permissionState, recordingState, isSupported, checkPermission, requestPermission } =
    useAudioRecorder();

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return (
    <div>
      <h2>Estado de Permisos del Micrófono</h2>

      <table>
        <tbody>
          <tr>
            <th>Browser Supported:</th>
            <td>{isSupported ? '✅ Yes' : '❌ No'}</td>
          </tr>
          <tr>
            <th>Permission State:</th>
            <td>
              {permissionState === 'prompt' && '⏸️ Not Asked'}
              {permissionState === 'granted' && '✅ Granted'}
              {permissionState === 'denied' && '❌ Denied'}
              {permissionState === 'unsupported' && '❌ Unsupported'}
            </td>
          </tr>
          <tr>
            <th>Recording State:</th>
            <td>{recordingState}</td>
          </tr>
        </tbody>
      </table>

      {permissionState === 'prompt' && (
        <button onClick={requestPermission}>Request Microphone Permission</button>
      )}

      {permissionState === 'denied' && (
        <div className="alert">
          <p>Microphone access denied. Please enable it in browser settings.</p>
        </div>
      )}
    </div>
  );
}
