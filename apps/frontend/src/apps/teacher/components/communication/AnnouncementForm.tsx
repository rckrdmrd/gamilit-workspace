/**
 * AnnouncementForm Component
 *
 * Formulario para enviar anuncios a toda una clase.
 * Los anuncios se envían a todos los estudiantes de la clase seleccionada.
 *
 * @module apps/teacher/components/communication/AnnouncementForm
 */

import React, { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { DetectiveCard } from '../../../../shared/components/base/DetectiveCard';
import { DetectiveButton } from '../../../../shared/components/base/DetectiveButton';
import type { Classroom } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

interface AnnouncementFormProps {
  classrooms: Classroom[];
  loadingClassrooms: boolean;
  onSend: (classroomId: string, subject: string, content: string) => Promise<void>;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Formulario para enviar anuncios a clase
 *
 * @example
 * ```tsx
 * <AnnouncementForm
 *   classrooms={classrooms}
 *   loadingClassrooms={loading}
 *   onSend={async (id, subject, content) => await sendAnnouncement(id, subject, content)}
 * />
 * ```
 */
export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  classrooms,
  loadingClassrooms,
  onSend,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassroomId || !subject.trim() || !content.trim()) {
      return;
    }

    setLoading(true);

    try {
      await onSend(selectedClassroomId, subject, content);

      // Reset form
      setSelectedClassroomId('');
      setSubject('');
      setContent('');
    } catch (err) {
      console.error('[AnnouncementForm] Error sending announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const selectedClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  return (
    <DetectiveCard>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-detective-orange" />
          <h3 className="text-lg font-bold">Anuncio a la Clase</h3>
        </div>

        {/* Selector de Clase */}
        <div>
          <label className="mb-1 block text-sm font-medium">Seleccionar Clase</label>
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
              onChange={(e) => setSelectedClassroomId(e.target.value)}
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

        {/* Título del Anuncio */}
        <div>
          <label className="mb-1 block text-sm font-medium">Título del Anuncio</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-detective-orange"
            placeholder="Ej: Recordatorio de examen"
            required
          />
        </div>

        {/* Mensaje */}
        <div>
          <label className="mb-1 block text-sm font-medium">Mensaje</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-detective-orange"
            rows={5}
            placeholder="Escribe el anuncio que se enviará a todos los estudiantes de la clase..."
            required
          />
        </div>

        {/* Info box */}
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <strong>Nota:</strong> Este anuncio se enviará a todos los estudiantes de{' '}
          {selectedClassroom ? <strong>{selectedClassroom.name}</strong> : 'la clase seleccionada'}
          {selectedClassroom && ` (${selectedClassroom.student_count} estudiantes)`}.
        </div>

        {/* Actions */}
        <DetectiveButton
          type="submit"
          disabled={loading || !selectedClassroomId || !subject.trim() || !content.trim()}
        >
          {loading ? 'Enviando...' : 'Enviar Anuncio a la Clase'}
        </DetectiveButton>
      </form>
    </DetectiveCard>
  );
};
