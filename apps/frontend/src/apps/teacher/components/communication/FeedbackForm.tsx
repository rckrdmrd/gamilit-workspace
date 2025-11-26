/**
 * FeedbackForm Component
 *
 * Formulario para enviar feedback privado a un estudiante.
 * Usado para retroalimentación personalizada sobre tareas o progreso.
 *
 * @module apps/teacher/components/communication/FeedbackForm
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { DetectiveCard } from '../../../../shared/components/base/DetectiveCard';
import { DetectiveButton } from '../../../../shared/components/base/DetectiveButton';
import type { Classroom, StudentMonitoring } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

interface FeedbackFormProps {
  classrooms: Classroom[];
  loadingClassrooms: boolean;
  onGetStudents: (classroomId: string) => Promise<StudentMonitoring[]>;
  onSend: (studentId: string, content: string) => Promise<void>;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Formulario para enviar feedback privado
 *
 * @example
 * ```tsx
 * <FeedbackForm
 *   classrooms={classrooms}
 *   loadingClassrooms={loading}
 *   onGetStudents={async (id) => await getStudents(id)}
 *   onSend={async (id, content) => await sendFeedback(id, content)}
 * />
 * ```
 */
export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  classrooms,
  loadingClassrooms,
  onGetStudents,
  onSend,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [students, setStudents] = useState<StudentMonitoring[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Cargar estudiantes cuando se selecciona una clase
   */
  useEffect(() => {
    if (!selectedClassroomId) {
      setStudents([]);
      setSelectedStudentId('');
      return;
    }

    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const studentsData = await onGetStudents(selectedClassroomId);
        setStudents(studentsData);
      } catch (err) {
        console.error('[FeedbackForm] Error loading students:', err);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [selectedClassroomId, onGetStudents]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClassroomChange = (classroomId: string) => {
    setSelectedClassroomId(classroomId);
    setSelectedStudentId(''); // Reset student when classroom changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId || !content.trim()) {
      return;
    }

    setLoading(true);

    try {
      await onSend(selectedStudentId, content);

      // Reset form
      setSelectedStudentId('');
      setContent('');
    } catch (err) {
      console.error('[FeedbackForm] Error sending feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <DetectiveCard>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-detective-orange" />
          <h3 className="text-lg font-bold">
            Feedback Privado{selectedStudent ? ` para ${selectedStudent.full_name}` : ''}
          </h3>
        </div>

        {/* Selector de Clase */}
        <div>
          <label className="mb-1 block text-sm font-medium">1. Seleccionar Clase</label>
          {loadingClassrooms ? (
            <div className="flex items-center text-sm text-gray-500">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-detective-orange"></div>
              Cargando clases...
            </div>
          ) : classrooms.length === 0 ? (
            <div className="text-sm italic text-gray-500">No tienes clases asignadas aún.</div>
          ) : (
            <select
              value={selectedClassroomId}
              onChange={(e) => handleClassroomChange(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-detective-orange"
              required
            >
              <option value="">-- Selecciona una clase --</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} ({classroom.grade_level} - {classroom.subject})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selector de Estudiante */}
        {selectedClassroomId && (
          <div>
            <label className="mb-1 block text-sm font-medium">2. Seleccionar Estudiante</label>
            {loadingStudents ? (
              <div className="flex items-center text-sm text-gray-500">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-detective-orange"></div>
                Cargando estudiantes...
              </div>
            ) : students.length === 0 ? (
              <div className="text-sm italic text-gray-500">No hay estudiantes en esta clase.</div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-detective-orange"
                required
              >
                <option value="">-- Selecciona un estudiante --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} ({student.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Mensaje de Feedback */}
        {selectedStudentId && (
          <div>
            <label className="mb-1 block text-sm font-medium">3. Mensaje de Feedback</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-detective-orange"
              rows={5}
              placeholder="Escribe el feedback privado para el estudiante..."
              required
            />
          </div>
        )}

        {/* Info box */}
        {selectedStudentId && (
          <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <strong>Nota:</strong> Este mensaje es privado y solo será visible para{' '}
            <strong>{selectedStudent?.full_name}</strong>.
          </div>
        )}

        {/* Actions */}
        <DetectiveButton type="submit" disabled={loading || !selectedStudentId || !content.trim()}>
          {loading ? 'Enviando...' : 'Enviar Feedback'}
        </DetectiveButton>
      </form>
    </DetectiveCard>
  );
};
