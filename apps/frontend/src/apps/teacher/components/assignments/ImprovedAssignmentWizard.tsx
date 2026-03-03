/**
 * ImprovedAssignmentWizard - Enhanced multi-step wizard for creating assignments
 *
 * Features:
 * - 4-step process with visual progress indicator
 * - Exercise preview cards with details
 * - Ability to remove selected exercises
 * - Confirmation step with full summary
 * - Validation at each step
 *
 * @module apps/teacher/components/assignments/ImprovedAssignmentWizard
 */

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Settings,
  FileText,
  CheckCircle2,
  X,
  Target,
  Clock,
  Award,
} from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { InputDetective } from '@shared/components/base/InputDetective';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { Exercise } from '../../types';

interface AssignmentData {
  title: string;
  description: string;
  type: 'practice' | 'quiz' | 'exam' | 'homework';
  exercise_ids: string[];
  due_date: string;
  classroom_id: string;
  max_attempts: number;
  allow_powerups: boolean;
  custom_points: number | null;
}

interface ImprovedAssignmentWizardProps {
  exercises: Exercise[];
  classroomId: string;
  onComplete: (data: AssignmentData) => void;
  onCancel: () => void;
}

export function ImprovedAssignmentWizard({
  exercises,
  classroomId,
  onComplete,
  onCancel,
}: ImprovedAssignmentWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<AssignmentData>({
    title: '',
    description: '',
    type: 'practice',
    exercise_ids: [],
    due_date: '',
    classroom_id: classroomId,
    max_attempts: 3,
    allow_powerups: true,
    custom_points: null,
  });

  const selectedExercises = exercises.filter((ex) => data.exercise_ids.includes(ex.id));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'hard':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Media';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'practice':
        return 'Práctica';
      case 'quiz':
        return 'Quiz';
      case 'exam':
        return 'Examen';
      case 'homework':
        return 'Tarea';
      default:
        return type;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.title && data.description && data.type;
      case 2:
        return data.exercise_ids.length > 0;
      case 3:
        return data.due_date && data.max_attempts > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    onComplete(data);
  };

  const toggleExercise = (exerciseId: string) => {
    setData((prev) => ({
      ...prev,
      exercise_ids: prev.exercise_ids.includes(exerciseId)
        ? prev.exercise_ids.filter((id) => id !== exerciseId)
        : [...prev.exercise_ids, exerciseId],
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setData((prev) => ({
      ...prev,
      exercise_ids: prev.exercise_ids.filter((id) => id !== exerciseId),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-1 items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                s === step
                  ? 'scale-110 bg-detective-orange text-white'
                  : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-detective-bg-secondary text-detective-text-secondary'
              }`}
            >
              {s < step ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`mx-2 h-1 flex-1 transition-all ${
                  s < step ? 'bg-green-500' : 'bg-detective-bg-secondary'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <span
          className={
            step === 1 ? 'font-semibold text-detective-orange' : 'text-detective-text-secondary'
          }
        >
          Información Básica
        </span>
        <span
          className={
            step === 2 ? 'font-semibold text-detective-orange' : 'text-detective-text-secondary'
          }
        >
          Ejercicios
        </span>
        <span
          className={
            step === 3 ? 'font-semibold text-detective-orange' : 'text-detective-text-secondary'
          }
        >
          Configuración
        </span>
        <span
          className={
            step === 4 ? 'font-semibold text-detective-orange' : 'text-detective-text-secondary'
          }
        >
          Confirmación
        </span>
      </div>

      {/* Step Content */}
      <DetectiveCard>
        <div className="min-h-[500px]">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <FileText className="h-6 w-6 text-detective-orange" />
                <h3 className="text-xl font-bold text-detective-text">Información Básica</h3>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-detective-text">
                  Título de la Asignación *
                </label>
                <InputDetective
                  type="text"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="Ej: Práctica Semanal: Marie Curie"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-detective-text">
                  Descripción *
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  rows={4}
                  placeholder="Describe el objetivo de la asignación..."
                  className="border-detective-border w-full resize-none rounded-lg border bg-detective-bg-secondary px-4 py-3 text-detective-text focus:border-detective-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-detective-text">
                  Tipo de Asignación *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'practice', label: 'Práctica', icon: Target },
                    { value: 'quiz', label: 'Quiz', icon: FileText },
                    { value: 'exam', label: 'Examen', icon: Award },
                    { value: 'homework', label: 'Tarea', icon: CheckCircle2 },
                  ].map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                        data.type === value
                          ? 'border-detective-orange bg-detective-orange/10'
                          : 'border-detective-border hover:border-detective-orange/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={value}
                        checked={data.type === value}
                        onChange={(e) => setData({ ...data, type: e.target.value as 'practice' | 'quiz' | 'exam' | 'homework' })}
                        className="hidden"
                      />
                      <Icon className="h-5 w-5 text-detective-orange" />
                      <span className="font-semibold text-detective-text">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Exercises with Preview */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <Target className="h-6 w-6 text-detective-orange" />
                <h3 className="text-xl font-bold text-detective-text">Seleccionar Ejercicios</h3>
              </div>

              {/* Selected Exercises Preview */}
              {selectedExercises.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold text-detective-text">
                    Ejercicios Seleccionados ({selectedExercises.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="rounded-lg border border-detective-orange bg-detective-orange/10 p-3"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-detective-text">
                              {exercise.title}
                            </p>
                            <p className="text-xs text-detective-text-secondary">{exercise.type}</p>
                          </div>
                          <button
                            onClick={() => removeExercise(exercise.id)}
                            className="rounded p-1 transition-colors hover:bg-red-500/20"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}
                        >
                          {getDifficultyLabel(exercise.difficulty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Exercises */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-detective-text">
                  Ejercicios Disponibles
                </h4>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {exercises.map((exercise) => (
                    <label
                      key={exercise.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg p-4 transition-all ${
                        data.exercise_ids.includes(exercise.id)
                          ? 'border-2 border-detective-orange bg-detective-orange/10'
                          : 'border-2 border-transparent bg-detective-bg-secondary hover:bg-detective-bg-secondary/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={data.exercise_ids.includes(exercise.id)}
                        onChange={() => toggleExercise(exercise.id)}
                        className="rounded border-detective-orange text-detective-orange focus:ring-detective-orange"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-detective-text">{exercise.title}</p>
                        <p className="text-sm text-detective-text-secondary">{exercise.type}</p>
                      </div>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}
                      >
                        {getDifficultyLabel(exercise.difficulty)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <Settings className="h-6 w-6 text-detective-orange" />
                <h3 className="text-xl font-bold text-detective-text">
                  Configuración de la Asignación
                </h3>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-detective-text">
                  Fecha Límite *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-detective-text-secondary" />
                  <InputDetective
                    type="date"
                    value={data.due_date}
                    onChange={(e) => setData({ ...data, due_date: e.target.value })}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-detective-text">
                    Intentos Permitidos
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-detective-text-secondary" />
                    <InputDetective
                      type="number"
                      min="1"
                      max="10"
                      value={data.max_attempts}
                      onChange={(e) =>
                        setData({ ...data, max_attempts: parseInt(e.target.value) || 1 })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-detective-text">
                    Puntos Personalizados (opcional)
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-3 h-5 w-5 text-detective-text-secondary" />
                    <InputDetective
                      type="number"
                      min="0"
                      value={data.custom_points || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          custom_points: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      placeholder="Por defecto"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-detective-bg-secondary p-4 transition-colors hover:bg-detective-bg-secondary/80">
                  <input
                    type="checkbox"
                    checked={data.allow_powerups}
                    onChange={(e) => setData({ ...data, allow_powerups: e.target.checked })}
                    className="h-5 w-5 rounded border-detective-orange text-detective-orange focus:ring-detective-orange"
                  />
                  <div className="flex-1">
                    <span className="block font-semibold text-detective-text">
                      Permitir Power-ups
                    </span>
                    <p className="text-sm text-detective-text-secondary">
                      Los estudiantes podrán usar power-ups durante esta asignación
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-detective-orange" />
                <h3 className="text-xl font-bold text-detective-text">Confirmar Asignación</h3>
              </div>

              <div className="space-y-4 rounded-lg bg-detective-bg-secondary p-6">
                <div>
                  <p className="mb-1 text-sm text-detective-text-secondary">Título</p>
                  <p className="text-lg font-semibold text-detective-text">{data.title}</p>
                </div>

                <div>
                  <p className="mb-1 text-sm text-detective-text-secondary">Descripción</p>
                  <p className="text-detective-text">{data.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-sm text-detective-text-secondary">Tipo</p>
                    <span className="inline-block rounded bg-detective-orange/20 px-3 py-1 text-sm font-semibold text-detective-orange">
                      {getTypeLabel(data.type)}
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-detective-text-secondary">Fecha Límite</p>
                    <p className="font-semibold text-detective-text">
                      {new Date(data.due_date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-sm text-detective-text-secondary">
                      Intentos Permitidos
                    </p>
                    <p className="font-semibold text-detective-text">{data.max_attempts}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-detective-text-secondary">Puntos</p>
                    <p className="font-semibold text-detective-text">
                      {data.custom_points ? `${data.custom_points} puntos` : 'Por defecto'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-detective-text-secondary">
                    Ejercicios ({selectedExercises.length})
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between rounded bg-detective-bg p-2"
                      >
                        <span className="text-sm text-detective-text">{exercise.title}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${getDifficultyColor(exercise.difficulty)}`}
                        >
                          {getDifficultyLabel(exercise.difficulty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {data.allow_powerups ? (
                    <span className="rounded bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-500">
                      Power-ups permitidos
                    </span>
                  ) : (
                    <span className="rounded bg-gray-500/20 px-3 py-1 text-sm font-semibold text-gray-500">
                      Power-ups no permitidos
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DetectiveCard>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <DetectiveButton variant="secondary" onClick={onCancel}>
          Cancelar
        </DetectiveButton>
        <div className="flex gap-3">
          {step > 1 && (
            <DetectiveButton variant="secondary" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </DetectiveButton>
          )}
          {step < 4 ? (
            <DetectiveButton onClick={handleNext} disabled={!canProceed()}>
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </DetectiveButton>
          ) : (
            <DetectiveButton onClick={handleComplete} disabled={!canProceed()}>
              <CheckCircle2 className="h-4 w-4" />
              Crear Asignación
            </DetectiveButton>
          )}
        </div>
      </div>
    </div>
  );
}
