/**
 * ClassroomTeachersTab Component
 *
 * View and manage teachers assigned to a classroom
 *
 * Features:
 * - Search classroom by ID
 * - View list of assigned teachers
 * - Assign new teacher to classroom
 * - Remove teacher from classroom
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  UserPlus,
  UserMinus,
  Loader2,
  AlertCircle,
  Users,
  Mail,
  Calendar,
} from 'lucide-react';
import { useClassroomTeacher } from '../../hooks/useClassroomTeacher';
import { cn } from '@shared/utils/cn';

export function ClassroomTeachersTab() {
  const [classroomId, setClassroomId] = useState('');
  const [searchedId, setSearchedId] = useState('');
  const [teacherIdToAssign, setTeacherIdToAssign] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [teacherToRemove, setTeacherToRemove] = useState<string | null>(null);

  const { useClassroomTeachers, assignTeacherToClassroom, removeTeacherFromClassroom } =
    useClassroomTeacher();

  const { data: classroomData, isLoading, error } = useClassroomTeachers(searchedId, !!searchedId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (classroomId.trim()) {
      setSearchedId(classroomId.trim());
    }
  };

  const handleAssignTeacher = () => {
    if (!searchedId || !teacherIdToAssign.trim()) return;

    assignTeacherToClassroom.mutate(
      {
        classroomId: searchedId,
        data: { teacherId: teacherIdToAssign.trim() },
      },
      {
        onSuccess: () => {
          setTeacherIdToAssign('');
          setShowAssignModal(false);
        },
      },
    );
  };

  const handleRemoveTeacher = (teacherId: string) => {
    if (!searchedId) return;

    removeTeacherFromClassroom.mutate(
      {
        classroomId: searchedId,
        teacherId,
      },
      {
        onSuccess: () => {
          setTeacherToRemove(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Buscar Classroom</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              placeholder="Ingrese Classroom ID (UUID)"
              className={cn(
                'w-full rounded-lg px-4 py-3',
                'border-2 border-gray-200',
                'focus:border-blue-500 focus:outline-none',
                'transition-colors',
              )}
            />
          </div>
          <button
            type="submit"
            disabled={!classroomId.trim()}
            className={cn(
              'flex items-center gap-2 rounded-lg px-6 py-3',
              'bg-blue-500 font-semibold text-white',
              'transition-colors hover:bg-blue-600',
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
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Cargando teachers...</p>
        </div>
      )}

      {/* Error State */}
      {error && searchedId && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">Error al cargar classroom</p>
              <p className="text-sm">
                {(error as any)?.response?.data?.message || 'Classroom no encontrado'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {classroomData && !isLoading && (
        <div className="space-y-4">
          {/* Classroom Info */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{classroomData.name}</h3>
                <p className="text-gray-600">
                  Grado: {classroomData.grade} - Sección: {classroomData.section}
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(true)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2',
                  'bg-green-500 font-semibold text-white',
                  'transition-colors hover:bg-green-600',
                )}
              >
                <UserPlus className="h-5 w-5" />
                Asignar Teacher
              </button>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-5 w-5" />
              <span className="font-semibold">
                {classroomData.teachersCount} teacher(s) asignado(s)
              </span>
            </div>
          </div>

          {/* Teachers List */}
          {classroomData.teachers.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-12 text-center">
              <Users className="mx-auto mb-3 h-16 w-16 text-gray-300" />
              <p className="font-semibold text-gray-600">
                No hay teachers asignados a este classroom
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {classroomData.teachers.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-white p-6 shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {teacher.firstName} {teacher.lastName}
                      </h4>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {teacher.email}
                      </div>
                    </div>
                    <button
                      onClick={() => setTeacherToRemove(teacher.id)}
                      className={cn(
                        'rounded-lg p-2',
                        'text-red-500 hover:bg-red-50',
                        'transition-colors',
                      )}
                      title="Remover teacher"
                    >
                      <UserMinus className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    Asignado: {new Date(teacher.assignedAt).toLocaleDateString('es-ES')}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 text-xl font-bold text-gray-900">Asignar Teacher</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Teacher ID (UUID)
                </label>
                <input
                  type="text"
                  value={teacherIdToAssign}
                  onChange={(e) => setTeacherIdToAssign(e.target.value)}
                  placeholder="Ingrese Teacher ID"
                  className={cn(
                    'w-full rounded-lg px-4 py-3',
                    'border-2 border-gray-200',
                    'focus:border-blue-500 focus:outline-none',
                  )}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setTeacherIdToAssign('');
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
                  onClick={handleAssignTeacher}
                  disabled={!teacherIdToAssign.trim() || assignTeacherToClassroom.isPending}
                  className={cn(
                    'flex-1 rounded-lg px-4 py-3',
                    'bg-blue-500 font-semibold text-white',
                    'transition-colors hover:bg-blue-600',
                    'disabled:cursor-not-allowed disabled:bg-gray-300',
                    'flex items-center justify-center gap-2',
                  )}
                >
                  {assignTeacherToClassroom.isPending ? (
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

      {/* Remove Teacher Confirmation */}
      {teacherToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 text-xl font-bold text-gray-900">Confirmar Remoción</h3>
            <p className="mb-6 text-gray-600">
              ¿Está seguro que desea remover este teacher del classroom?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setTeacherToRemove(null)}
                className={cn(
                  'flex-1 rounded-lg px-4 py-3',
                  'bg-gray-200 font-semibold text-gray-700',
                  'transition-colors hover:bg-gray-300',
                )}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemoveTeacher(teacherToRemove)}
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
