/**
 * useExerciseAutoSave - Ejemplos de Uso
 *
 * Este archivo contiene ejemplos prácticos de cómo usar el hook useExerciseAutoSave
 * en diferentes escenarios.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useExerciseAutoSave } from './useExerciseAutoSave';
import { Loader2, Check, AlertCircle } from 'lucide-react';

// ============================================================================
// EJEMPLO 1: Uso Básico
// ============================================================================

export function BasicAutoSaveExample() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);

  const { status, lastSavedAt, recoveredData, saveProgress, clearRecoveredData } =
    useExerciseAutoSave({
      exerciseId: 'exercise-123',
      enabled: true,
    });

  // Recuperar progreso al montar
  useEffect(() => {
    if (recoveredData?.partialAnswers) {
      setAnswers(recoveredData.partialAnswers as Record<string, string>);
      setTimeSpent(recoveredData.timeSpentSeconds || 0);
      clearRecoveredData();
    }
  }, [recoveredData, clearRecoveredData]);

  // Auto-guardar cuando cambian las respuestas
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveProgress({
        partialAnswers: answers,
        timeSpentSeconds: timeSpent,
      });
    }
  }, [answers, timeSpent, saveProgress]);

  return (
    <div className="space-y-4">
      <h2>Ejercicio con Auto-Save</h2>

      {/* Indicador de estado */}
      <div className="flex items-center gap-2">
        {status === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === 'saved' && <Check className="h-4 w-4 text-green-500" />}
        <span className="text-sm">
          {status === 'saving' && 'Guardando...'}
          {status === 'saved' &&
            lastSavedAt &&
            `Guardado a las ${lastSavedAt.toLocaleTimeString()}`}
        </span>
      </div>

      {/* Ejercicio */}
      <input
        type="text"
        value={answers.question1 || ''}
        onChange={(e) => setAnswers({ ...answers, question1: e.target.value })}
        placeholder="Respuesta"
      />
    </div>
  );
}

// ============================================================================
// EJEMPLO 2: Con Confirmación de Recuperación
// ============================================================================

export function AutoSaveWithConfirmationExample() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  const { recoveredData, saveProgress, clearRecoveredData, clearAutoSave } = useExerciseAutoSave({
    exerciseId: 'exercise-456',
  });

  // Mostrar modal de confirmación si hay datos recuperados
  useEffect(() => {
    if (recoveredData?.partialAnswers) {
      setShowRecoveryModal(true);
    }
  }, [recoveredData]);

  const handleAcceptRecovery = () => {
    if (recoveredData?.partialAnswers) {
      setAnswers(recoveredData.partialAnswers as Record<string, string>);
      clearRecoveredData();
      setShowRecoveryModal(false);
    }
  };

  const handleRejectRecovery = () => {
    clearAutoSave();
    setShowRecoveryModal(false);
  };

  return (
    <div>
      {showRecoveryModal && (
        <div className="modal">
          <h3>Progreso Anterior Encontrado</h3>
          <p>¿Deseas continuar donde lo dejaste?</p>
          <button onClick={handleAcceptRecovery}>Sí, continuar</button>
          <button onClick={handleRejectRecovery}>No, empezar de nuevo</button>
        </div>
      )}

      {/* Ejercicio */}
      <input
        type="text"
        value={answers.question1 || ''}
        onChange={(e) => {
          const newAnswers = { ...answers, question1: e.target.value };
          setAnswers(newAnswers);
          saveProgress({
            partialAnswers: newAnswers,
            timeSpentSeconds: 0,
          });
        }}
      />
    </div>
  );
}

// ============================================================================
// EJEMPLO 3: Indicador Visual Completo
// ============================================================================

export function FullStatusIndicatorExample() {
  const [answers, setAnswers] = useState({});

  const { status, lastSavedAt, error, saveProgress } = useExerciseAutoSave({
    exerciseId: 'exercise-789',
  });

  useEffect(() => {
    if (answers) {
      saveProgress({
        partialAnswers: answers,
        timeSpentSeconds: 0,
      });
    }
  }, [answers, saveProgress]);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        {/* Ícono según estado */}
        {status === 'idle' && null}
        {status === 'saving' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
        {status === 'saved' && <Check className="h-4 w-4 text-green-500" />}
        {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}

        {/* Texto según estado */}
        <span className="text-sm">
          {status === 'idle' && 'Sin cambios pendientes'}
          {status === 'saving' && 'Guardando progreso...'}
          {status === 'saved' && lastSavedAt && `Guardado ${formatTimeAgo(lastSavedAt)}`}
          {status === 'error' && `Error: ${error}`}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 4: Con Callbacks
// ============================================================================

export function AutoSaveWithCallbacksExample() {
  const [answers, setAnswers] = useState({});
  const [notifications, setNotifications] = useState<string[]>([]);

  const { saveProgress } = useExerciseAutoSave({
    exerciseId: 'exercise-101',
    onRecovered: (data) => {
      console.log('Progreso recuperado:', data);
      setNotifications((prev) => [...prev, 'Progreso recuperado exitosamente']);
    },
    onSaveSuccess: (savedAt) => {
      console.log('Guardado exitoso:', savedAt);
    },
    onSaveError: (error) => {
      console.error('Error al guardar:', error);
      setNotifications((prev) => [...prev, `Error: ${error.message}`]);
    },
  });

  return (
    <div>
      {/* Notificaciones */}
      <div className="notifications">
        {notifications.map((msg, i) => (
          <div key={i} className="notification">
            {msg}
          </div>
        ))}
      </div>

      {/* Ejercicio */}
      <input
        onChange={(e) => {
          const newAnswers = { value: e.target.value };
          setAnswers(newAnswers);
          saveProgress({
            partialAnswers: newAnswers,
            timeSpentSeconds: 0,
          });
        }}
      />
    </div>
  );
}

// ============================================================================
// EJEMPLO 5: Save Forzado al Salir
// ============================================================================

export function ForceSaveOnUnmountExample() {
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);

  const { saveProgress, forceSave } = useExerciseAutoSave({
    exerciseId: 'exercise-202',
  });

  // Auto-save normal
  useEffect(() => {
    if (answers) {
      saveProgress({
        partialAnswers: answers,
        timeSpentSeconds: timeSpent,
      });
    }
  }, [answers, timeSpent, saveProgress]);

  // Force save antes de cerrar
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (Object.keys(answers).length > 0) {
        e.preventDefault();
        await forceSave({
          partialAnswers: answers,
          timeSpentSeconds: timeSpent,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [answers, timeSpent, forceSave]);

  return <div>{/* Ejercicio */}</div>;
}

// ============================================================================
// EJEMPLO 6: Auto-Save Condicional
// ============================================================================

export function ConditionalAutoSaveExample() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const { saveProgress } = useExerciseAutoSave({
    exerciseId: 'exercise-303',
  });

  // Solo guardar si hay cambios significativos
  useEffect(() => {
    if (isDirty && Object.keys(answers).length > 0) {
      saveProgress({
        partialAnswers: answers,
        timeSpentSeconds: 0,
      });
      setIsDirty(false);
    }
  }, [isDirty, answers, saveProgress]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setIsDirty(true);
  };

  return <div>{/* Ejercicio con handleAnswerChange */}</div>;
}

// ============================================================================
// EJEMPLO 7: Múltiples Ejercicios (Tabs)
// ============================================================================

export function MultiExerciseAutoSaveExample() {
  const [activeTab, setActiveTab] = useState<'ex1' | 'ex2'>('ex1');
  const [answersEx1, setAnswersEx1] = useState({});
  const [answersEx2, setAnswersEx2] = useState({});

  // Hook separado para cada ejercicio
  const autoSaveEx1 = useExerciseAutoSave({
    exerciseId: 'exercise-401',
    enabled: activeTab === 'ex1',
  });

  const autoSaveEx2 = useExerciseAutoSave({
    exerciseId: 'exercise-402',
    enabled: activeTab === 'ex2',
  });

  // Guardar según tab activo
  useEffect(() => {
    if (activeTab === 'ex1' && answersEx1) {
      autoSaveEx1.saveProgress({
        partialAnswers: answersEx1,
        timeSpentSeconds: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answersEx1, activeTab]);

  useEffect(() => {
    if (activeTab === 'ex2' && answersEx2) {
      autoSaveEx2.saveProgress({
        partialAnswers: answersEx2,
        timeSpentSeconds: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answersEx2, activeTab]);

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setActiveTab('ex1')}>Ejercicio 1</button>
        <button onClick={() => setActiveTab('ex2')}>Ejercicio 2</button>
      </div>

      {activeTab === 'ex1' && (
        <div>
          {autoSaveEx1.status === 'saved' && '✓ Guardado'}
          {/* Ejercicio 1 */}
        </div>
      )}

      {activeTab === 'ex2' && (
        <div>
          {autoSaveEx2.status === 'saved' && '✓ Guardado'}
          {/* Ejercicio 2 */}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// UTILIDADES
// ============================================================================

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'hace unos segundos';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
  return `hace ${Math.floor(seconds / 86400)} días`;
}
