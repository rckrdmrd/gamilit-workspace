import { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Clock,
  Target,
  Award,
  Calendar,
  Trophy,
  Save,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { studentProgressApi } from '@services/api/teacher';
import type { StudentMonitoring } from '../../types';
import type {
  StudentProgress,
  StudentStats,
  StudentNote,
  AddTeacherNoteDto,
} from '@services/api/teacher/studentProgressApi';

interface StudentDetailModalProps {
  student: StudentMonitoring;
  onClose: () => void;
  classroomId?: string;
}

export function StudentDetailModal({ student, onClose, classroomId }: StudentDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState<StudentProgress | null>(null);
  const [statsData, setStatsData] = useState<StudentStats | null>(null);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    gamification: true,
    modules: true,
    notes: true,
  });

  useEffect(() => {
    fetchStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  /**
   * Fetch student data from API
   * FIX-2026-01-25: Añadida validación de student.id antes de llamar APIs
   */
  const fetchStudentData = async () => {
    // Validar que student.id exista antes de hacer llamadas API
    if (!student?.id || student.id.startsWith('unknown-')) {
      console.warn('[StudentDetailModal] Invalid student ID:', student?.id);
      setError('ID de estudiante no disponible');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [progress, stats, studentNotes] = await Promise.all([
        studentProgressApi.getStudentProgress(student.id).catch((err) => {
          console.warn('[StudentDetailModal] Error fetching progress:', err);
          return null;
        }),
        studentProgressApi.getStudentStats(student.id).catch((err) => {
          console.warn('[StudentDetailModal] Error fetching stats:', err);
          return null;
        }),
        studentProgressApi.getStudentNotes(student.id).catch((err) => {
          console.warn('[StudentDetailModal] Error fetching notes:', err);
          return [];
        }),
      ]);

      setProgressData(progress);
      setStatsData(stats);
      setNotes(studentNotes);
    } catch (err) {
      console.error('[StudentDetailModal] Error fetching data:', err);
      setError('Error al cargar datos del estudiante');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    if (!classroomId) {
      setError('No se puede guardar la nota: falta ID del aula');
      return;
    }

    try {
      setSavingNote(true);
      setError(null);

      const noteDto: AddTeacherNoteDto = {
        classroom_id: classroomId,
        note: newNote.trim(),
        is_private: true,
      };

      const savedNote = await studentProgressApi.addStudentNote(student.id, noteDto);
      setNotes([savedNote, ...notes]);
      setNewNote('');
    } catch (err) {
      console.error('[StudentDetailModal] Error saving note:', err);
      setError('Error al guardar la nota');
    } finally {
      setSavingNote(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} showCloseButton={false} size="full" className="border-2 border-detective-orange bg-detective-bg p-0 max-w-5xl">
      <div className="-mx-6 -my-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-detective-orange bg-detective-bg p-6">
          <div>
            <h2 className="text-2xl font-bold text-detective-text">{student.full_name}</h2>
            <p className="text-detective-text-secondary">{student.email}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-detective-bg-secondary"
          >
            <X className="h-6 w-6 text-detective-text" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-6 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
            <p className="mt-4 text-detective-text-secondary">Cargando datos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mx-6 mt-6 flex items-start gap-3 rounded-lg border border-red-500 bg-red-500/20 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="space-y-6 p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-detective-bg-secondary p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5 text-detective-orange" />
                  <span className="text-sm text-detective-text-secondary">Progreso</span>
                </div>
                <p className="text-2xl font-bold text-detective-text">
                  {(student.progress_percentage ?? 0).toFixed(0)}%
                </p>
              </div>

              <div className="rounded-lg bg-detective-bg-secondary p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-detective-gold" />
                  <span className="text-sm text-detective-text-secondary">Score Promedio</span>
                </div>
                <p className="text-2xl font-bold text-detective-text">
                  {(student.score_average ?? 0).toFixed(0)}%
                </p>
              </div>

              <div className="rounded-lg bg-detective-bg-secondary p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Award className="text-detective-accent h-5 w-5" />
                  <span className="text-sm text-detective-text-secondary">Ejercicios</span>
                </div>
                <p className="text-2xl font-bold text-detective-text">
                  {student.exercises_completed}/{student.exercises_total}
                </p>
              </div>

              <div className="rounded-lg bg-detective-bg-secondary p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-detective-orange" />
                  <span className="text-sm text-detective-text-secondary">Tiempo Total</span>
                </div>
                <p className="text-2xl font-bold text-detective-text">
                  {Math.floor((student.time_spent_minutes ?? 0) / 60)}h {(student.time_spent_minutes ?? 0) % 60}m
                </p>
              </div>
            </div>

            {/* Gamification Stats (Collapsible) */}
            {statsData && (
              <div className="rounded-lg bg-detective-bg-secondary">
                <button
                  onClick={() => toggleSection('gamification')}
                  className="flex w-full items-center justify-between p-4 transition-colors hover:bg-detective-bg-secondary/50"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-detective-gold" />
                    <h3 className="text-lg font-bold text-detective-text">
                      Estadísticas de Gamificación
                    </h3>
                  </div>
                  {expandedSections.gamification ? (
                    <ChevronUp className="h-5 w-5 text-detective-text-secondary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-detective-text-secondary" />
                  )}
                </button>

                {expandedSections.gamification && (
                  <div className="grid grid-cols-2 gap-4 px-4 pb-4 md:grid-cols-3">
                    <div className="rounded-lg bg-detective-bg p-3">
                      <p className="mb-1 text-xs text-detective-text-secondary">Racha Actual</p>
                      <p className="text-xl font-bold text-detective-text">
                        {statsData.streak_current} días
                      </p>
                    </div>
                    <div className="rounded-lg bg-detective-bg p-3">
                      <p className="mb-1 text-xs text-detective-text-secondary">Racha Máxima</p>
                      <p className="text-xl font-bold text-detective-text">
                        {statsData.streak_longest} días
                      </p>
                    </div>
                    <div className="rounded-lg bg-detective-bg p-3">
                      <p className="mb-1 text-xs text-detective-text-secondary">
                        Tasa Primer Intento
                      </p>
                      <p className="text-xl font-bold text-detective-text">
                        {(statsData.first_attempt_success_rate ?? 0).toFixed(0)}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-detective-bg p-3">
                      <p className="mb-1 text-xs text-detective-text-secondary">Power-ups Usados</p>
                      <p className="text-xl font-bold text-detective-text">
                        {statsData.powerups_used}
                      </p>
                    </div>
                    <div className="rounded-lg bg-detective-bg p-3">
                      <p className="mb-1 text-xs text-detective-text-secondary">Pistas Usadas</p>
                      <p className="text-xl font-bold text-detective-text">
                        {statsData.hints_used}
                      </p>
                    </div>
                    <div className="rounded-lg bg-detective-bg p-3">
                      <p className="mb-1 text-xs text-detective-text-secondary">Sesiones Totales</p>
                      <p className="text-xl font-bold text-detective-text">
                        {statsData.total_sessions}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress by Module (Collapsible) */}
            {progressData && progressData.module_progress.length > 0 && (
              <div className="rounded-lg bg-detective-bg-secondary">
                <button
                  onClick={() => toggleSection('modules')}
                  className="flex w-full items-center justify-between p-4 transition-colors hover:bg-detective-bg-secondary/50"
                >
                  <h3 className="text-lg font-bold text-detective-text">Progreso por Módulo</h3>
                  {expandedSections.modules ? (
                    <ChevronUp className="h-5 w-5 text-detective-text-secondary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-detective-text-secondary" />
                  )}
                </button>

                {expandedSections.modules && (
                  <div className="space-y-3 px-4 pb-4">
                    {progressData.module_progress.map((module) => (
                      <div key={module.module_id} className="rounded-lg bg-detective-bg p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium text-detective-text">{module.module_name}</p>
                          <span className="text-sm font-bold text-detective-text">
                            {(module.score ?? 0).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-gray-700">
                            <div
                              className="h-2 rounded-full bg-detective-orange"
                              style={{ width: `${module.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-detective-text-secondary">
                            {module.exercises_completed}/{module.exercises_total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Current Activity */}
            <div className="rounded-lg bg-detective-bg-secondary p-6">
              <h3 className="mb-4 text-lg font-bold text-detective-text">Actividad Actual</h3>
              {student.current_module ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-detective-text-secondary">Módulo:</span>
                    <p className="font-semibold text-detective-text">{student.current_module}</p>
                  </div>
                  {student.current_exercise && (
                    <div>
                      <span className="text-sm text-detective-text-secondary">Ejercicio:</span>
                      <p className="font-semibold text-detective-text">
                        {student.current_exercise}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-detective-text-secondary" />
                    <span className="text-sm text-detective-text-secondary">
                      Última actividad:{' '}
                      {student.last_activity
                        ? new Date(student.last_activity).toLocaleString('es-ES')
                        : 'Sin actividad registrada'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-detective-text-secondary">No hay actividad reciente</p>
              )}
            </div>

            {/* Teacher Notes (Collapsible) */}
            <div className="rounded-lg bg-detective-bg-secondary">
              <button
                onClick={() => toggleSection('notes')}
                className="flex w-full items-center justify-between p-4 transition-colors hover:bg-detective-bg-secondary/50"
              >
                <h3 className="text-lg font-bold text-detective-text">Notas del Profesor</h3>
                {expandedSections.notes ? (
                  <ChevronUp className="h-5 w-5 text-detective-text-secondary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-detective-text-secondary" />
                )}
              </button>

              {expandedSections.notes && (
                <div className="space-y-4 px-4 pb-4">
                  {/* Add New Note */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-detective-text">
                      Agregar Nueva Nota
                    </label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Escribe tus observaciones sobre el estudiante..."
                      className="w-full resize-none rounded-lg border border-gray-700 bg-detective-bg px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                      rows={3}
                      disabled={savingNote}
                    />
                    <DetectiveButton
                      onClick={handleSaveNote}
                      disabled={!newNote.trim() || savingNote}
                      variant="primary"
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {savingNote ? 'Guardando...' : 'Guardar Nota'}
                    </DetectiveButton>
                  </div>

                  {/* Previous Notes */}
                  {notes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-detective-text-secondary">
                        Notas Anteriores
                      </h4>
                      <div className="max-h-60 space-y-2 overflow-y-auto">
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className="rounded-lg border border-gray-700 bg-detective-bg p-3"
                          >
                            <p className="mb-2 text-sm text-detective-text">{note.note}</p>
                            <p className="text-xs text-detective-text-secondary">
                              {new Date(note.created_at).toLocaleString('es-ES')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 border-t border-gray-700 pt-4">
              <DetectiveButton
                variant="secondary"
                onClick={() => window.open(`/teacher/alerts?student_id=${student.id}`, '_blank')}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Ver Alertas
                <ExternalLink className="ml-2 h-3 w-3" />
              </DetectiveButton>
              <DetectiveButton
                variant="secondary"
                onClick={() => window.open(`/teacher/responses?student_id=${student.id}`, '_blank')}
              >
                <Award className="mr-2 h-4 w-4" />
                Ver Respuestas
                <ExternalLink className="ml-2 h-3 w-3" />
              </DetectiveButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
