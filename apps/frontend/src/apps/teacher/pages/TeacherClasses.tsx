import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Modal } from '@shared/components/common/Modal';
import { FormField } from '@shared/components/common/FormField';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useClassrooms } from '../hooks/useClassrooms';
import type { Classroom } from '../types';

export default function TeacherClasses() {
  const navigate = useNavigate();
  const {
    classrooms,
    loading,
    error,
    createClassroom: createClassroomAPI,
    updateClassroom: updateClassroomAPI,
    deleteClassroom: deleteClassroomAPI,
    refresh,
  } = useClassrooms();

  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    grade_level: '',
  });

  // Search functionality
  useEffect(() => {
    const filtered = classrooms.filter(
      (classroom) =>
        classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.grade_level.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredClassrooms(filtered);
  }, [searchTerm, classrooms]);

  const handleCreateClassroom = async () => {
    try {
      await createClassroomAPI(formData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', subject: '', grade_level: '' });
    } catch (err: unknown) {
      console.error('[TeacherClasses] Error creating classroom:', err);
      toast.error('Error al crear la clase. Por favor intenta nuevamente.');
    }
  };

  const handleEditClassroom = async () => {
    if (!selectedClassroom) return;

    try {
      await updateClassroomAPI(selectedClassroom.id, formData);
      setIsEditModalOpen(false);
      setSelectedClassroom(null);
      setFormData({ name: '', subject: '', grade_level: '' });
    } catch (err: unknown) {
      console.error('[TeacherClasses] Error updating classroom:', err);
      toast.error('Error al actualizar la clase. Por favor intenta nuevamente.');
    }
  };

  const handleDeleteClassroom = async () => {
    if (!selectedClassroom) return;

    try {
      await deleteClassroomAPI(selectedClassroom.id);
      setIsDeleteDialogOpen(false);
      setSelectedClassroom(null);
    } catch (err: unknown) {
      console.error('[TeacherClasses] Error deleting classroom:', err);
      toast.error('Error al eliminar la clase. Por favor intenta nuevamente.');
    }
  };

  const openEditModal = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setFormData({
      name: classroom.name,
      subject: classroom.subject,
      grade_level: classroom.grade_level,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
        <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-detective-text">Mis Clases</h1>
          <p className="text-detective-text-secondary">Gestiona tus clases y estudiantes</p>
        </div>

        {/* Search and Create */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary py-3 pl-10 pr-4 text-detective-text placeholder-gray-500 focus:border-detective-orange focus:outline-none"
            />
          </div>
          <DetectiveButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-5 w-5" />
            Crear Nueva Clase
          </DetectiveButton>
          {!loading && !error && (
            <DetectiveButton variant="secondary" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </DetectiveButton>
          )}
        </div>

        {/* Error State */}
        {error && !loading && (
          <DetectiveCard variant="danger" className="mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold text-detective-text">
                  Error al cargar clases
                </h3>
                <p className="mb-4 text-detective-text-secondary">
                  No se pudieron cargar las clases. Por favor, intenta nuevamente.
                </p>
                <p className="mb-4 rounded bg-red-950 p-2 font-mono text-sm text-red-400">
                  {error.message}
                </p>
                <DetectiveButton onClick={refresh} variant="primary">
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </DetectiveButton>
              </div>
            </div>
          </DetectiveCard>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-detective-orange" />
            <p className="text-detective-text-secondary">Cargando clases...</p>
          </div>
        )}

        {/* Classrooms Grid */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClassrooms.map((classroom) => (
              <DetectiveCard
                key={classroom.id}
                className="cursor-pointer transition-colors hover:border-detective-orange"
                onClick={() => navigate(`/teacher/progress?classroomId=${classroom.id}`)}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/20 p-3">
                      <BookOpen className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-detective-text">{classroom.name}</h3>
                      <p className="text-sm text-gray-400">{classroom.subject}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-detective-text">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span>{classroom.grade_level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-detective-text">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{classroom.student_count} estudiantes</span>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-gray-700 pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(classroom);
                    }}
                    className="flex-1 rounded-lg bg-blue-500/20 px-3 py-2 text-sm font-medium text-blue-500 transition-colors hover:bg-blue-500/30"
                  >
                    <Edit className="mr-1 inline h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(classroom);
                    }}
                    className="flex-1 rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/30"
                  >
                    <Trash2 className="mr-1 inline h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </DetectiveCard>
            ))}
          </div>
        )}

        {!loading && filteredClassrooms.length === 0 && (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <p className="text-lg text-gray-400">
              {searchTerm ? 'No se encontraron clases' : 'No tienes clases creadas aún'}
            </p>
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ name: '', subject: '', grade_level: '' });
        }}
        title="Crear Nueva Clase"
      >
        <div className="space-y-4">
          <FormField
            label="Nombre de la Clase"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Español 5to A"
            required
          />
          <FormField
            label="Materia"
            name="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Ej: Español, Matemáticas"
            required
          />
          <FormField
            label="Grado"
            name="grade_level"
            type="select"
            value={formData.grade_level}
            onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
            options={[
              { value: '1ro', label: '1ro' },
              { value: '2do', label: '2do' },
              { value: '3ro', label: '3ro' },
              { value: '4to', label: '4to' },
              { value: '5to', label: '5to' },
              { value: '6to', label: '6to' },
            ]}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <DetectiveButton
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData({ name: '', subject: '', grade_level: '' });
              }}
            >
              Cancelar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleCreateClassroom}
              disabled={!formData.name || !formData.subject || !formData.grade_level}
            >
              Crear Clase
            </DetectiveButton>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClassroom(null);
          setFormData({ name: '', subject: '', grade_level: '' });
        }}
        title="Editar Clase"
      >
        <div className="space-y-4">
          <FormField
            label="Nombre de la Clase"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormField
            label="Materia"
            name="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
          <FormField
            label="Grado"
            name="grade_level"
            type="select"
            value={formData.grade_level}
            onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
            options={[
              { value: '1ro', label: '1ro' },
              { value: '2do', label: '2do' },
              { value: '3ro', label: '3ro' },
              { value: '4to', label: '4to' },
              { value: '5to', label: '5to' },
              { value: '6to', label: '6to' },
            ]}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <DetectiveButton
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedClassroom(null);
                setFormData({ name: '', subject: '', grade_level: '' });
              }}
            >
              Cancelar
            </DetectiveButton>
            <DetectiveButton variant="primary" onClick={handleEditClassroom}>
              Guardar Cambios
            </DetectiveButton>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedClassroom(null);
        }}
        onConfirm={handleDeleteClassroom}
        title="Eliminar Clase"
        message={`¿Estás seguro de que deseas eliminar "${selectedClassroom?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
      </div>
    </>
  );
}
