import React, { useState, useEffect } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DataTable, Column } from '@shared/components/common/DataTable';
import { Modal } from '@shared/components/common/Modal';
import { FormField } from '@shared/components/common/FormField';
import { Plus, Clock, CheckCircle, FileText, Users, Calendar, Loader } from 'lucide-react';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiConfig';
import type { Assignment, Exercise, Submission } from '../types';

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'practice' as 'practice' | 'quiz' | 'exam' | 'homework',
    dueDate: '',
    classroomId: '',
    selectedExercises: [] as string[],
  });

  // Fetch assignments from API
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(API_ENDPOINTS.teacher.assignments);
        const data = response.data.data || response.data;
        setAssignments(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to load assignments';
        setError(errorMessage);
        console.error('[TeacherAssignments] Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const mockExercises: Exercise[] = [
    { id: 'ex1', title: 'Biografía Marie Curie', type: 'BiografiaInteractiva', difficulty: 'medium', module_id: 'm1' },
    { id: 'ex2', title: 'Crucigrama Científico', type: 'CrucigramaInteractivo', difficulty: 'hard', module_id: 'm1' },
    { id: 'ex3', title: 'Quiz Descubrimientos', type: 'QuizTikTok', difficulty: 'medium', module_id: 'm2' },
    { id: 'ex4', title: 'Análisis de Memes', type: 'AnalisisMemes', difficulty: 'easy', module_id: 'm4' },
  ];

  const handleCreateAssignment = async () => {
    try {
      setError(null);
      const response = await apiClient.post(API_ENDPOINTS.teacher.createAssignment, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        due_date: formData.dueDate,
        classroom_id: formData.classroomId,
        exercise_ids: formData.selectedExercises,
      });
      const newAssignment = response.data.data || response.data;

      setAssignments([newAssignment, ...assignments]);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create assignment';
      setError(errorMessage);
      console.error('[TeacherAssignments] Error creating assignment:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'practice',
      dueDate: '',
      classroomId: '',
      selectedExercises: [],
    });
    setCurrentStep(1);
  };

  const viewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    try {
      setError(null);
      const response = await apiClient.get(
        API_ENDPOINTS.teacher.assignmentSubmissions(assignment.id)
      );
      const data = response.data.data || response.data;
      setSubmissions(data);
      setIsSubmissionsModalOpen(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load submissions';
      setError(errorMessage);
      console.error('[TeacherAssignments] Error fetching submissions:', err);
    }
  };

  const gradeSubmission = async (submissionId: string, score: number) => {
    try {
      setError(null);
      const response = await apiClient.post(
        API_ENDPOINTS.teacher.gradeSubmission(submissionId),
        { score }
      );
      const gradedSubmission = response.data.data || response.data;

      setSubmissions(
        submissions.map((sub) => (sub.id === submissionId ? gradedSubmission : sub))
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to grade submission';
      setError(errorMessage);
      console.error('[TeacherAssignments] Error grading submission:', err);
    }
  };

  const columns: Column<Assignment>[] = [
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-detective-text">{row.title}</p>
          <p className="text-xs text-gray-400">{row.classroomName}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      sortable: true,
      render: (row) => {
        const typeColors = {
          practice: 'bg-blue-500/20 text-blue-500',
          quiz: 'bg-purple-500/20 text-purple-500',
          exam: 'bg-red-500/20 text-red-500',
          homework: 'bg-green-500/20 text-green-500',
        };
        const typeLabels = {
          practice: 'Práctica',
          quiz: 'Quiz',
          exam: 'Examen',
          homework: 'Tarea',
        };
        return (
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${typeColors[row.type]}`}>
            {typeLabels[row.type]}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (row) => {
        const statusColors = {
          draft: 'bg-gray-500/20 text-gray-500',
          active: 'bg-green-500/20 text-green-500',
          completed: 'bg-blue-500/20 text-blue-500',
          archived: 'bg-gray-600/20 text-gray-600',
        };
        const statusLabels = {
          draft: 'Borrador',
          active: 'Activo',
          completed: 'Completado',
          archived: 'Archivado',
        };
        return (
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[row.status]}`}>
            {statusLabels[row.status]}
          </span>
        );
      },
    },
    {
      key: 'dueDate',
      label: 'Fecha Límite',
      sortable: true,
      render: (row) => new Date(row.dueDate).toLocaleDateString('es-ES'),
    },
    {
      key: 'submissions',
      label: 'Entregas',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-detective-text">
            {row.totalSubmissions} / {row.totalSubmissions + 10}
          </span>
        </div>
      ),
    },
    {
      key: 'pendingReviews',
      label: 'Pendientes',
      render: (row) => (
        <span className={`font-medium ${row.pendingReviews > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
          {row.pendingReviews}
        </span>
      ),
    },
  ];

  const submissionColumns: Column<Submission>[] = [
    {
      key: 'student_name',
      label: 'Estudiante',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (row) => {
        const statusColors = {
          pending: 'bg-yellow-500/20 text-yellow-500',
          graded: 'bg-green-500/20 text-green-500',
          late: 'bg-red-500/20 text-red-500',
        };
        return (
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[row.status]}`}>
            {row.status === 'pending' ? 'Pendiente' : row.status === 'graded' ? 'Calificado' : 'Tardío'}
          </span>
        );
      },
    },
    {
      key: 'score',
      label: 'Calificación',
      render: (row) => (
        <span className="font-medium text-detective-text">
          {row.score !== undefined ? `${row.score}%` : '-'}
        </span>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Fecha de Entrega',
      sortable: true,
      render: (row) => new Date(row.submitted_at).toLocaleString('es-ES'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-detective-text mb-2">Asignaciones</h1>
          <p className="text-detective-text-secondary">
            Crea y gestiona asignaciones para tus estudiantes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold text-detective-text">{assignments.length}</p>
              </div>
            </div>
          </DetectiveCard>
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Activas</p>
                <p className="text-2xl font-bold text-detective-text">
                  {assignments.filter((a) => a.status === 'active').length}
                </p>
              </div>
            </div>
          </DetectiveCard>
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Completadas</p>
                <p className="text-2xl font-bold text-detective-text">
                  {assignments.filter((a) => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </DetectiveCard>
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-400">Pendientes Revisar</p>
                <p className="text-2xl font-bold text-detective-text">
                  {assignments.reduce((sum, a) => sum + a.pendingReviews, 0)}
                </p>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Create Button */}
        <div className="mb-6">
          <DetectiveButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-5 h-5" />
            Crear Asignación
          </DetectiveButton>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-detective-orange animate-spin" />
            <span className="ml-3 text-detective-text">Cargando asignaciones...</span>
          </div>
        )}

        {/* Assignments Table */}
        {!loading && (
          <DataTable
            data={assignments}
            columns={columns}
            searchPlaceholder="Buscar asignaciones..."
            onRowClick={(row) => viewSubmissions(row)}
          />
        )}
      </main>

      {/* Create Assignment Modal - Multi-step */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title={`Crear Asignación - Paso ${currentStep} de 3`}
        size="lg"
      >
        <div className="space-y-4">
          {currentStep === 1 && (
            <>
              <FormField
                label="Título"
                name="title"
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
                placeholder="Ej: Práctica Semanal: Marie Curie"
                required
              />
              <FormField
                label="Descripción"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Describe el objetivo de la asignación"
              />
              <FormField
                label="Tipo"
                name="type"
                type="select"
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value as any })}
                options={[
                  { value: 'practice', label: 'Práctica' },
                  { value: 'quiz', label: 'Quiz' },
                  { value: 'exam', label: 'Examen' },
                  { value: 'homework', label: 'Tarea' },
                ]}
                required
              />
              <FormField
                label="Fecha Límite"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(value) => setFormData({ ...formData, dueDate: value })}
                required
              />
            </>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-bold text-detective-text mb-4">
                Seleccionar Ejercicios
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mockExercises.map((exercise) => (
                  <label
                    key={exercise.id}
                    className="flex items-center gap-3 p-3 bg-detective-bg-secondary rounded-lg cursor-pointer hover:bg-opacity-80"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedExercises.includes(exercise.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            selectedExercises: [...formData.selectedExercises, exercise.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selectedExercises: formData.selectedExercises.filter(
                              (id) => id !== exercise.id
                            ),
                          });
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="text-detective-text font-medium">{exercise.title}</p>
                      <p className="text-sm text-gray-400">{exercise.type}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        exercise.difficulty === 'easy'
                          ? 'bg-green-500/20 text-green-500'
                          : exercise.difficulty === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {exercise.difficulty}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {formData.selectedExercises.length} ejercicio(s) seleccionado(s)
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-bold text-detective-text mb-4">Resumen</h3>
              <div className="space-y-3 bg-detective-bg-secondary p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Título</p>
                  <p className="text-detective-text font-medium">{formData.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tipo</p>
                  <p className="text-detective-text">{formData.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Fecha Límite</p>
                  <p className="text-detective-text">{formData.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Ejercicios</p>
                  <p className="text-detective-text">{formData.selectedExercises.length} ejercicios</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-between pt-4 border-t border-gray-700">
            <DetectiveButton
              variant="secondary"
              onClick={() => {
                if (currentStep === 1) {
                  setIsCreateModalOpen(false);
                  resetForm();
                } else {
                  setCurrentStep(currentStep - 1);
                }
              }}
            >
              {currentStep === 1 ? 'Cancelar' : 'Atrás'}
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={() => {
                if (currentStep < 3) {
                  setCurrentStep(currentStep + 1);
                } else {
                  handleCreateAssignment();
                }
              }}
              disabled={
                (currentStep === 1 && (!formData.title || !formData.dueDate)) ||
                (currentStep === 2 && formData.selectedExercises.length === 0)
              }
            >
              {currentStep === 3 ? 'Crear Asignación' : 'Siguiente'}
            </DetectiveButton>
          </div>
        </div>
      </Modal>

      {/* Submissions Modal */}
      <Modal
        isOpen={isSubmissionsModalOpen}
        onClose={() => {
          setIsSubmissionsModalOpen(false);
          setSelectedAssignment(null);
        }}
        title={`Entregas - ${selectedAssignment?.title}`}
        size="xl"
      >
        <DataTable
          data={submissions}
          columns={submissionColumns}
          searchable={false}
          itemsPerPage={5}
        />
      </Modal>
    </div>
  );
}
