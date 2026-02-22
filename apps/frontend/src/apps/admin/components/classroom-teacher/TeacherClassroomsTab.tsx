/**
 * TeacherClassroomsTab Component
 *
 * View and manage classrooms assigned to a teacher
 *
 * Features:
 * - Search teacher by ID
 * - View list of assigned classrooms
 * - Assign multiple classrooms to teacher
 */

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  GraduationCap,
  Loader2,
  AlertCircle,
  Mail,
  Calendar,
  Plus,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { useClassroomTeacher } from '../../hooks/useClassroomTeacher';
import { cn } from '@shared/utils/cn';
import toast from 'react-hot-toast';

export function TeacherClassroomsTab() {
  const [teacherId, setTeacherId] = useState('');
  const [searchedId, setSearchedId] = useState('');
  const [classroomIdsToAssign, setClassroomIdsToAssign] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [classroomToRemove, setClassroomToRemove] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { useTeacherClassrooms, assignClassroomsToTeacher, removeTeacherFromClassroom } =
    useClassroomTeacher();

  const { data: teacherData, isLoading, error } = useTeacherClassrooms(searchedId, !!searchedId);

  // UUID validation helper
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Copy ID to clipboard
  const handleCopyId = async (id: string, label: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success(`${label} ID copiado`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_error) {
      toast.error('Error al copiar ID');
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmedId = teacherId.trim();

    if (!trimmedId) {
      toast.error('Ingrese un ID de Docente');
      return;
    }

    if (!isValidUUID(trimmedId)) {
      toast.error('Formato de UUID inválido');
      return;
    }

    setSearchedId(trimmedId);
  };

  const handleAssignClassrooms = () => {
    if (!searchedId || !classroomIdsToAssign.trim()) {
      toast.error('Ingrese al menos un ID de Aula');
      return;
    }

    // Split by commas and clean whitespace
    const classroomIds = classroomIdsToAssign
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (classroomIds.length === 0) {
      toast.error('Ingrese IDs válidos');
      return;
    }

    // Validate all UUIDs
    const invalidIds = classroomIds.filter((id) => !isValidUUID(id));
    if (invalidIds.length > 0) {
      toast.error(`UUID inválido: ${invalidIds[0]}`);
      return;
    }

    assignClassroomsToTeacher.mutate(
      {
        teacherId: searchedId,
        data: { classroomIds },
      },
      {
        onSuccess: () => {
          setClassroomIdsToAssign('');
          setShowAssignModal(false);
        },
      },
    );
  };

  const handleRemoveClassroom = (classroomId: string) => {
    if (!searchedId) return;

    removeTeacherFromClassroom.mutate(
      {
        classroomId,
        teacherId: searchedId,
      },
      {
        onSuccess: () => {
          setClassroomToRemove(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Buscar Docente</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              placeholder="Ingrese ID del Docente (UUID)"
              className={cn(
                'w-full rounded-lg px-4 py-3',
                'border-2 border-gray-200',
                'focus:border-purple-500 focus:outline-none',
                'transition-colors',
              )}
            />
          </div>
          <button
            type="submit"
            disabled={!teacherId.trim()}
            className={cn(
              'flex items-center gap-2 rounded-lg px-6 py-3',
              'bg-purple-500 font-semibold text-white',
              'transition-colors hover:bg-purple-600',
              'disabled:cursor-not-allowed disabled:bg-gray-300',
            )}
          >
            <Search className="h-5 w-5" />
            Buscar
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-xl bg-white p-12 text-center shadow-md">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-500" />
          <p className="text-gray-600">Cargando aulas...</p>
        </div>
      )}

      {/* Error State */}
      {error && searchedId && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">Error al cargar docente</p>
              <p className="text-sm">
                {(error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Docente no encontrado'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {teacherData && !isLoading && (
        <div className="space-y-4">
          {/* Teacher Info */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {teacherData.firstName} {teacherData.lastName}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  {teacherData.email}
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(true)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2',
                  'bg-green-500 font-semibold text-white',
                  'transition-colors hover:bg-green-600',
                )}
              >
                <Plus className="h-5 w-5" />
                Asignar Aulas
              </button>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <GraduationCap className="h-5 w-5" />
              <span className="font-semibold">
                {teacherData.classroomsCount} aula(s) asignada(s)
              </span>
            </div>
          </div>

          {/* Classrooms List */}
          {teacherData.classrooms.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-12 text-center">
              <GraduationCap className="mx-auto mb-3 h-16 w-16 text-gray-300" />
              <p className="font-semibold text-gray-600">
                No hay aulas asignadas a este docente
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teacherData.classrooms.map((classroom) => (
                <motion.div
                  key={classroom.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-white p-6 shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900">{classroom.name}</h4>
                      <p className="text-sm text-gray-600">
                        Grado: {classroom.grade} - Sección: {classroom.section}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCopyId(classroom.id, 'Classroom')}
                        className={cn(
                          'rounded-lg p-2',
                          'text-gray-500 hover:bg-gray-50',
                          'transition-colors',
                        )}
                        title="Copiar ID del Aula"
                      >
                        {copiedId === classroom.id ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setClassroomToRemove(classroom.id)}
                        className={cn(
                          'rounded-lg p-2',
                          'text-red-500 hover:bg-red-50',
                          'transition-colors',
                        )}
                        title="Remover aula"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    Asignado:{' '}
                    {classroom.assignedAt
                      ? new Date(classroom.assignedAt).toLocaleDateString('es-ES')
                      : 'N/A'}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assign Classrooms Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 text-xl font-bold text-gray-900">Asignar Aulas</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  IDs de Aulas (separados por comas)
                </label>
                <textarea
                  value={classroomIdsToAssign}
                  onChange={(e) => setClassroomIdsToAssign(e.target.value)}
                  placeholder="uuid-1, uuid-2, uuid-3"
                  rows={4}
                  className={cn(
                    'w-full rounded-lg px-4 py-3',
                    'border-2 border-gray-200',
                    'focus:border-purple-500 focus:outline-none',
                    'resize-none',
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ingrese uno o más IDs de aulas separados por comas
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setClassroomIdsToAssign('');
                  }}
                  className={cn(
                    'flex-1 rounded-lg px-4 py-3',
                    'bg-gray-200 font-semibold text-gray-700',
                    'transition-colors hover:bg-gray-300',
                  )}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignClassrooms}
                  disabled={!classroomIdsToAssign.trim() || assignClassroomsToTeacher.isPending}
                  className={cn(
                    'flex-1 rounded-lg px-4 py-3',
                    'bg-purple-500 font-semibold text-white',
                    'transition-colors hover:bg-purple-600',
                    'disabled:cursor-not-allowed disabled:bg-gray-300',
                    'flex items-center justify-center gap-2',
                  )}
                >
                  {assignClassroomsToTeacher.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    'Asignar'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Remove Classroom Confirmation */}
      {classroomToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 text-xl font-bold text-gray-900">Confirmar Remoción</h3>
            <p className="mb-6 text-gray-600">
              ¿Está seguro que desea remover esta aula del docente?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setClassroomToRemove(null)}
                className={cn(
                  'flex-1 rounded-lg px-4 py-3',
                  'bg-gray-200 font-semibold text-gray-700',
                  'transition-colors hover:bg-gray-300',
                )}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemoveClassroom(classroomToRemove)}
                disabled={removeTeacherFromClassroom.isPending}
                className={cn(
                  'flex-1 rounded-lg px-4 py-3',
                  'bg-red-500 font-semibold text-white',
                  'transition-colors hover:bg-red-600',
                  'disabled:cursor-not-allowed disabled:bg-gray-300',
                  'flex items-center justify-center gap-2',
                )}
              >
                {removeTeacherFromClassroom.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Removiendo...
                  </>
                ) : (
                  'Remover'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
