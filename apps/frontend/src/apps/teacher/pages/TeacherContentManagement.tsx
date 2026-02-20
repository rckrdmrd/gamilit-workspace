import { useState } from 'react';
import { TeacherPageShell } from '../components/shared/TeacherPageShell';
import { toast } from 'react-hot-toast';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import { useTeacherContent } from '../hooks/useTeacherContent';
import {
  TeacherContent,
  TeacherContentType,
  TeacherContentStatus,
  TeacherContentVisibility,
  CreateContentData,
  UpdateContentData,
} from '@/services/api/teacher/teacherContentApi';

/**
 * TeacherContentManagement - Gestión de Contenidos Educativos
 *
 * ESTADO: Funcionalidad Completa (Conectado a API real)
 * - ✅ Visualización de contenidos desde API
 * - ✅ Filtros y búsqueda en tiempo real
 * - ✅ Crear/Editar/Eliminar contenidos
 * - ✅ Clonar contenidos
 * - ✅ Publicar contenidos
 *
 * @component
 */
export default function TeacherContentManagement() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const {
    content,
    total,
    loading,
    error,
    filters,
    createContent,
    updateContent,
    deleteContent,
    cloneContent,
    publishContent,
    updateFilters,
    clearError,
  } = useTeacherContent();

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedContent, setSelectedContent] = useState<TeacherContent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<TeacherContent | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateContentData>>({
    title: '',
    description: '',
    contentType: TeacherContentType.CUSTOM_EXERCISE,
    visibility: TeacherContentVisibility.CLASSROOM,
    instructions: '',
    subjectArea: '',
    gradeLevel: '',
    difficultyLevel: 'beginner',
    estimatedDurationMinutes: 30,
    pointsValue: 100,
    mlCoinsReward: 10,
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Abre modal para crear nuevo contenido
   */
  const handleCreateNew = () => {
    setModalMode('create');
    setSelectedContent(null);
    setFormData({
      title: '',
      description: '',
      contentType: TeacherContentType.CUSTOM_EXERCISE,
      visibility: TeacherContentVisibility.CLASSROOM,
      instructions: '',
      subjectArea: '',
      gradeLevel: '',
      difficultyLevel: 'beginner',
      estimatedDurationMinutes: 30,
      pointsValue: 100,
      mlCoinsReward: 10,
    });
    setShowModal(true);
  };

  /**
   * Abre modal para editar contenido existente
   */
  const handleEdit = (item: TeacherContent) => {
    setModalMode('edit');
    setSelectedContent(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      contentType: item.contentType,
      visibility: item.visibility,
      instructions: item.instructions || '',
      subjectArea: item.subjectArea || '',
      gradeLevel: item.gradeLevel || '',
      difficultyLevel: item.difficultyLevel || 'beginner',
      estimatedDurationMinutes: item.estimatedDurationMinutes || 30,
      pointsValue: item.pointsValue || 100,
      mlCoinsReward: item.mlCoinsReward || 10,
    });
    setShowModal(true);
  };

  /**
   * Guarda contenido (crear o actualizar)
   */
  const handleSave = async () => {
    try {
      if (modalMode === 'create') {
        await createContent(formData as CreateContentData);
        toast.success('Contenido creado exitosamente');
      } else if (selectedContent) {
        await updateContent(selectedContent.id, formData as UpdateContentData);
        toast.success('Contenido actualizado exitosamente');
      }
      setShowModal(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al guardar contenido';
      toast.error(errorMessage);
    }
  };

  /**
   * Clona un contenido
   */
  const handleClone = async (item: TeacherContent) => {
    try {
      await cloneContent(item.id, `Copia de ${item.title}`);
      toast.success('Contenido clonado exitosamente');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al clonar contenido';
      toast.error(errorMessage);
    }
  };

  /**
   * Abre confirmación de eliminación
   */
  const handleDeleteConfirm = (item: TeacherContent) => {
    setContentToDelete(item);
    setShowDeleteConfirm(true);
  };

  /**
   * Elimina contenido
   */
  const handleDelete = async () => {
    if (!contentToDelete) return;

    try {
      await deleteContent(contentToDelete.id);
      toast.success('Contenido eliminado exitosamente');
      setShowDeleteConfirm(false);
      setContentToDelete(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al eliminar contenido';
      toast.error(errorMessage);
    }
  };

  /**
   * Publica contenido
   */
  const handlePublish = async (item: TeacherContent) => {
    try {
      await publishContent(item.id);
      toast.success('Contenido publicado exitosamente');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al publicar contenido';
      toast.error(errorMessage);
    }
  };

  /**
   * Actualiza búsqueda local
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateFilters({ search: query });
  };

  // ============================================================================
  // FILTER & COMPUTED DATA
  // ============================================================================

  const getTypeLabel = (type: TeacherContentType): string => {
    const labels: Record<TeacherContentType, string> = {
      [TeacherContentType.CUSTOM_EXERCISE]: 'Ejercicio Personalizado',
      [TeacherContentType.WORKSHEET]: 'Hoja de Trabajo',
      [TeacherContentType.READING_MATERIAL]: 'Material de Lectura',
      [TeacherContentType.VIDEO_LESSON]: 'Lección en Video',
      [TeacherContentType.PRESENTATION]: 'Presentación',
      [TeacherContentType.QUIZ]: 'Cuestionario',
      [TeacherContentType.ASSIGNMENT]: 'Asignación',
      [TeacherContentType.RESOURCE_PACK]: 'Paquete de Recursos',
    };
    return labels[type] || type;
  };

  const getDifficultyLabel = (difficulty?: string): string => {
    if (!difficulty) return 'N/A';
    const labels: Record<string, string> = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
    };
    return labels[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty?: string): string => {
    if (!difficulty) return 'text-gray-600 bg-gray-100';
    const colors: Record<string, string> = {
      beginner: 'text-green-600 bg-green-100',
      intermediate: 'text-yellow-600 bg-yellow-100',
      advanced: 'text-red-600 bg-red-100',
    };
    return colors[difficulty] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: TeacherContentStatus) => {
    switch (status) {
      case TeacherContentStatus.PUBLISHED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case TeacherContentStatus.DRAFT:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case TeacherContentStatus.ARCHIVED:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: TeacherContentStatus): string => {
    const labels: Record<TeacherContentStatus, string> = {
      [TeacherContentStatus.DRAFT]: 'Borrador',
      [TeacherContentStatus.PENDING_REVIEW]: 'Pendiente Revisión',
      [TeacherContentStatus.APPROVED]: 'Aprobado',
      [TeacherContentStatus.PUBLISHED]: 'Publicado',
      [TeacherContentStatus.ARCHIVED]: 'Archivado',
    };
    return labels[status] || status;
  };

  // Stats
  const publishedCount = content.filter((c) => c.status === TeacherContentStatus.PUBLISHED).length;
  const draftCount = content.filter((c) => c.status === TeacherContentStatus.DRAFT).length;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <TeacherPageShell>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-detective-text">Gestión de Contenido</h1>
          <p className="mt-1 text-detective-text-secondary">
            Crea y administra contenidos educativos personalizados
          </p>
        </div>
        <DetectiveButton
          onClick={handleCreateNew}
          variant="primary"
          leftIcon={<Plus className="h-5 w-5" />}
          disabled={loading}
        >
          Nuevo Contenido
        </DetectiveButton>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-r border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <DetectiveCard>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contenidos..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary py-2 pl-10 pr-4 text-detective-text focus:border-detective-orange focus:outline-none"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filters.contentType || 'all'}
            onChange={(e) =>
              updateFilters({
                contentType:
                  e.target.value === 'all' ? undefined : (e.target.value as TeacherContentType),
              })
            }
            className="rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
          >
            <option value="all">Todos los tipos</option>
            {Object.values(TeacherContentType).map((type) => (
              <option key={type} value={type}>
                {getTypeLabel(type)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) =>
              updateFilters({
                status:
                  e.target.value === 'all' ? undefined : (e.target.value as TeacherContentStatus),
              })
            }
            className="rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            {Object.values(TeacherContentStatus).map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </DetectiveCard>

      {/* Content List */}
      <DetectiveCard>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-detective-text">Contenidos ({total})</h2>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-detective-text-secondary">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-detective-orange"></div>
              <span>Cargando...</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {content.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-detective-bg-secondary p-4 transition-colors hover:bg-opacity-80"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-detective-text">{item.title}</h3>
                    {getStatusIcon(item.status)}
                    <span className="text-xs text-detective-text-secondary">
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mb-2 text-sm text-detective-text-secondary">{item.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-detective-text-secondary">
                    <span>{getTypeLabel(item.contentType)}</span>
                    {item.difficultyLevel && (
                      <>
                        <span>•</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getDifficultyColor(
                            item.difficultyLevel,
                          )}`}
                        >
                          {getDifficultyLabel(item.difficultyLevel)}
                        </span>
                      </>
                    )}
                    {item.pointsValue && (
                      <>
                        <span>•</span>
                        <span>{item.pointsValue} puntos</span>
                      </>
                    )}
                    {item.estimatedDurationMinutes && (
                      <>
                        <span>•</span>
                        <span>{item.estimatedDurationMinutes} min</span>
                      </>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-detective-text-secondary">
                    Actualizado: {new Date(item.updatedAt).toLocaleDateString('es-ES')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <DetectiveButton
                    onClick={() => handleEdit(item)}
                    variant="blue"
                    size="sm"
                    icon={<Edit className="h-4 w-4" />}
                    aria-label="Editar"
                  />
                  <DetectiveButton
                    onClick={() => handleClone(item)}
                    variant="purple"
                    size="sm"
                    icon={<Copy className="h-4 w-4" />}
                    aria-label="Clonar"
                  />
                  {item.status !== TeacherContentStatus.PUBLISHED && (
                    <DetectiveButton
                      onClick={() => handlePublish(item)}
                      variant="green"
                      size="sm"
                      icon={<CheckCircle className="h-4 w-4" />}
                      aria-label="Publicar"
                    />
                  )}
                  <DetectiveButton
                    onClick={() => handleDeleteConfirm(item)}
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="h-4 w-4" />}
                    aria-label="Eliminar"
                  />
                </div>
              </div>
            </div>
          ))}

          {content.length === 0 && !loading && (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-600" />
              <p className="text-lg text-detective-text-secondary">No se encontraron contenidos</p>
              <p className="mt-1 text-sm text-detective-text-secondary">
                {searchQuery || filters.contentType || filters.status
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Crea tu primer contenido haciendo clic en "Nuevo Contenido"'}
              </p>
            </div>
          )}
        </div>
      </DetectiveCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DetectiveCard hoverable={false}>
          <div className="text-center">
            <p className="text-3xl font-bold text-detective-text">{total}</p>
            <p className="mt-1 text-sm text-detective-text-secondary">Total Contenidos</p>
          </div>
        </DetectiveCard>
        <DetectiveCard hoverable={false}>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">{publishedCount}</p>
            <p className="mt-1 text-sm text-detective-text-secondary">Publicados</p>
          </div>
        </DetectiveCard>
        <DetectiveCard hoverable={false}>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-500">{draftCount}</p>
            <p className="mt-1 text-sm text-detective-text-secondary">Borradores</p>
          </div>
        </DetectiveCard>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Crear Contenido' : 'Editar Contenido'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">
              Titulo *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              placeholder="Ej: Ejercicio de Numeros Mayas"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">
              Descripcion
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              placeholder="Describe el contenido..."
            />
          </div>

          {/* Type and Visibility */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Tipo *
              </label>
              <select
                value={formData.contentType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contentType: e.target.value as TeacherContentType,
                  })
                }
                className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              >
                {Object.values(TeacherContentType).map((type) => (
                  <option key={type} value={type}>
                    {getTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Visibilidad *
              </label>
              <select
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    visibility: e.target.value as TeacherContentVisibility,
                  })
                }
                className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              >
                <option value={TeacherContentVisibility.PRIVATE}>Privado</option>
                <option value={TeacherContentVisibility.CLASSROOM}>Clase</option>
                <option value={TeacherContentVisibility.SCHOOL}>Escuela</option>
                <option value={TeacherContentVisibility.PUBLIC}>Publico</option>
              </select>
            </div>
          </div>

          {/* Difficulty and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Dificultad
              </label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Duracion (minutos)
              </label>
              <input
                type="number"
                value={formData.estimatedDurationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDurationMinutes: parseInt(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              />
            </div>
          </div>

          {/* Points and Rewards */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Puntos (XP)
              </label>
              <input
                type="number"
                value={formData.pointsValue}
                onChange={(e) =>
                  setFormData({ ...formData, pointsValue: parseInt(e.target.value) })
                }
                className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                ML Coins
              </label>
              <input
                type="number"
                value={formData.mlCoinsReward}
                onChange={(e) =>
                  setFormData({ ...formData, mlCoinsReward: parseInt(e.target.value) })
                }
                className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">
              Instrucciones
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              placeholder="Instrucciones para el estudiante..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-700 pt-4">
            <DetectiveButton onClick={() => setShowModal(false)} variant="secondary">
              Cancelar
            </DetectiveButton>
            <DetectiveButton onClick={handleSave} variant="primary" disabled={!formData.title}>
              {modalMode === 'create' ? 'Crear' : 'Guardar'}
            </DetectiveButton>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm && !!contentToDelete}
        onClose={() => {
          setShowDeleteConfirm(false);
          setContentToDelete(null);
        }}
        title="Confirmar Eliminacion"
        size="sm"
      >
        <div>
          <p className="mb-6 text-detective-text-secondary">
            Estas seguro de que deseas eliminar el contenido "{contentToDelete?.title}"? Esta
            accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <DetectiveButton
              onClick={() => {
                setShowDeleteConfirm(false);
                setContentToDelete(null);
              }}
              variant="secondary"
            >
              Cancelar
            </DetectiveButton>
            <DetectiveButton onClick={handleDelete} variant="danger">
              Eliminar
            </DetectiveButton>
          </div>
        </div>
      </Modal>
    </div>
    </TeacherPageShell>
  );
}
