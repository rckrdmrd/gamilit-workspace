/**
 * TeacherResourcesPage - Recursos Educativos
 *
 * Portal de gestión de recursos educativos para profesores.
 * Permite subir, organizar y compartir materiales didácticos.
 *
 * ESTADO: IMPLEMENTADO (2026-01-16)
 * - Visualización de recursos por tipo
 * - Subida de archivos con validación
 * - Búsqueda y filtros
 * - Eliminación de recursos
 *
 * @module apps/teacher/pages/TeacherResourcesPage
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Modal } from '@shared/components/common/Modal';
import { FEATURE_FLAGS } from '@/config/api.config';
import { UnderConstruction } from '@shared/components/UnderConstruction';
import toast from 'react-hot-toast';
import {
  FolderOpen,
  Upload,
  Search,
  FileText,
  Image,
  Video,
  Music,
  File,
  Trash2,
  Download,
  Eye,
  Filter,
  Grid,
  List,
  Plus,
  X,
  Loader,
  HardDrive,
  FileImage,
  FileVideo,
  FileAudio,
} from 'lucide-react';
import {
  mediaApi,
  type MediaType,
  type MediaAttachmentResponse,
  validateFile,
  formatFileSize,
  detectMediaType,
  DEFAULT_MAX_SIZES,
} from '@/shared/api/mediaApi';

// ============================================================================
// FEATURE FLAG
// ============================================================================
const SHOW_UNDER_CONSTRUCTION = FEATURE_FLAGS.SHOW_UNDER_CONSTRUCTION;

// ============================================================================
// TYPES
// ============================================================================

interface ResourceFile {
  id: string;
  name: string;
  originalName: string;
  type: MediaType;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
  thumbnailUrl?: string;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | MediaType;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getFileIcon = (type: MediaType) => {
  switch (type) {
    case 'image':
      return FileImage;
    case 'video':
      return FileVideo;
    case 'audio':
      return FileAudio;
    case 'document':
      return FileText;
    default:
      return File;
  }
};

const getTypeColor = (type: MediaType): string => {
  switch (type) {
    case 'image':
      return 'bg-blue-100 text-blue-600';
    case 'video':
      return 'bg-purple-100 text-purple-600';
    case 'audio':
      return 'bg-green-100 text-green-600';
    case 'document':
      return 'bg-orange-100 text-orange-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getTypeLabel = (type: MediaType): string => {
  const labels: Record<MediaType, string> = {
    image: 'Imagen',
    video: 'Video',
    audio: 'Audio',
    document: 'Documento',
    interactive: 'Interactivo',
    animation: 'Animación',
  };
  return labels[type] || type;
};

// ============================================================================
// MOCK DATA (until backend endpoint is fully integrated)
// ============================================================================

const MOCK_RESOURCES: ResourceFile[] = [
  {
    id: '1',
    name: 'presentacion-comprension-lectora.pdf',
    originalName: 'Presentación Comprensión Lectora.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    size: 2500000,
    url: '/files/presentacion-comprension-lectora.pdf',
    uploadedAt: '2026-01-10T10:30:00Z',
  },
  {
    id: '2',
    name: 'video-tutorial-modulo1.mp4',
    originalName: 'Video Tutorial Módulo 1.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    size: 45000000,
    url: '/files/video-tutorial-modulo1.mp4',
    uploadedAt: '2026-01-12T14:20:00Z',
  },
  {
    id: '3',
    name: 'infografia-tipos-textos.png',
    originalName: 'Infografía Tipos de Textos.png',
    type: 'image',
    mimeType: 'image/png',
    size: 1200000,
    url: '/files/infografia-tipos-textos.png',
    uploadedAt: '2026-01-14T09:15:00Z',
  },
  {
    id: '4',
    name: 'audio-lectura-cuento.mp3',
    originalName: 'Audio Lectura Cuento.mp3',
    type: 'audio',
    mimeType: 'audio/mpeg',
    size: 8500000,
    url: '/files/audio-lectura-cuento.mp3',
    uploadedAt: '2026-01-15T16:45:00Z',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function TeacherResourcesPage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  // ============================================================================
  // STATE
  // ============================================================================

  const [resources, setResources] = useState<ResourceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<ResourceFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Fallback gamification data
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: 1,
    totalXP: 0,
    mlCoins: 0,
    rank: 'Novato',
    achievements: [],
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Load resources (using mock data for now)
    const loadResources = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call when endpoint is available
        // const response = await mediaApi.getMedia();
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading
        setResources(MOCK_RESOURCES);
      } catch (error) {
        console.error('Error loading resources:', error);
        toast.error('Error al cargar los recursos');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);

      // Validate each file
      const validFiles: File[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        const type = detectMediaType(file);
        if (!type) {
          errors.push(`${file.name}: Tipo de archivo no soportado`);
          return;
        }

        const validation = validateFile(file, type);
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.errors?.join(', ')}`);
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
      }

      setSelectedFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Selecciona al menos un archivo');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const type = detectMediaType(file);

        if (!type) continue;

        // Upload file
        const response = await mediaApi.uploadMedia(file, {
          type,
          onProgress: (progress) => {
            const totalProgress = ((i + progress / 100) / selectedFiles.length) * 100;
            setUploadProgress(Math.round(totalProgress));
          },
        });

        // Add to resources list
        const newResource: ResourceFile = {
          id: response.id,
          name: response.filename,
          originalName: response.originalFilename,
          type: response.type,
          mimeType: response.mimeType,
          size: response.size,
          url: response.url,
          uploadedAt: response.uploadedAt,
        };

        setResources((prev) => [newResource, ...prev]);
      }

      toast.success(`${selectedFiles.length} archivo(s) subido(s) correctamente`);
      setShowUploadModal(false);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir los archivos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;

    try {
      await mediaApi.deleteMedia(resourceToDelete.id);
      setResources((prev) => prev.filter((r) => r.id !== resourceToDelete.id));
      toast.success('Recurso eliminado correctamente');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error al eliminar el recurso');
    } finally {
      setShowDeleteConfirm(false);
      setResourceToDelete(null);
    }
  };

  const confirmDelete = (resource: ResourceFile) => {
    setResourceToDelete(resource);
    setShowDeleteConfirm(true);
  };

  // ============================================================================
  // FILTERED RESOURCES
  // ============================================================================

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  // ============================================================================
  // STATS
  // ============================================================================

  const stats = {
    total: resources.length,
    totalSize: resources.reduce((sum, r) => sum + r.size, 0),
    byType: {
      document: resources.filter((r) => r.type === 'document').length,
      image: resources.filter((r) => r.type === 'image').length,
      video: resources.filter((r) => r.type === 'video').length,
      audio: resources.filter((r) => r.type === 'audio').length,
    },
  };

  // ============================================================================
  // FEATURE FLAG CHECK
  // ============================================================================

  if (SHOW_UNDER_CONSTRUCTION) {
    return (
      <TeacherLayout
        user={user ?? undefined}
        gamificationData={displayGamificationData}
        organizationName={user?.organization?.name || 'Mi Institución'}
        onLogout={handleLogout}
      >
        <UnderConstruction
          title="Recursos Educativos"
          message="Gestiona y organiza materiales didácticos, documentos, presentaciones y recursos multimedia para tus clases."
          upcomingFeatures={[
            'Biblioteca de recursos educativos',
            'Subir y organizar materiales didácticos',
            'Compartir recursos con estudiantes',
            'Buscar recursos por materia y tema',
            'Favoritos y colecciones personalizadas',
            'Integración con Google Drive',
          ]}
        />
      </TeacherLayout>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={displayGamificationData}
      organizationName={user?.organization?.name || 'Mi Institución'}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-detective-text">
              <FolderOpen className="h-8 w-8 text-detective-orange" />
              Recursos Educativos
            </h1>
            <p className="mt-1 text-detective-text-secondary">
              Gestiona y organiza tus materiales didácticos
            </p>
          </div>
          <DetectiveButton onClick={() => setShowUploadModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Subir Recurso
          </DetectiveButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-detective-orange/20">
                <FolderOpen className="h-6 w-6 text-detective-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{stats.total}</p>
                <p className="text-sm text-detective-text-secondary">Total Recursos</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <HardDrive className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">
                  {formatFileSize(stats.totalSize)}
                </p>
                <p className="text-sm text-detective-text-secondary">Almacenamiento</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{stats.byType.document}</p>
                <p className="text-sm text-detective-text-secondary">Documentos</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">
                  {stats.byType.video + stats.byType.image + stats.byType.audio}
                </p>
                <p className="text-sm text-detective-text-secondary">Multimedia</p>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Search and Filters */}
        <DetectiveCard>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
              <input
                type="text"
                placeholder="Buscar recursos..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border-2 border-detective-orange/30 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-detective-text-secondary" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="rounded-lg border-2 border-detective-orange/30 px-3 py-2 focus:border-detective-orange focus:outline-none"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="document">Documentos</option>
                  <option value="image">Imágenes</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border-2 border-detective-orange/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-detective-orange text-white' : 'text-detective-text-secondary'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-detective-orange text-white' : 'text-detective-text-secondary'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </DetectiveCard>

        {/* Resources Grid/List */}
        {loading ? (
          <DetectiveCard>
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-detective-orange" />
              <span className="ml-3 text-detective-text-secondary">Cargando recursos...</span>
            </div>
          </DetectiveCard>
        ) : filteredResources.length === 0 ? (
          <DetectiveCard>
            <div className="py-12 text-center">
              <FolderOpen className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary/30" />
              <h3 className="mb-2 text-xl font-bold text-detective-text">
                {searchQuery || filterType !== 'all'
                  ? 'No se encontraron recursos'
                  : 'Sin recursos'}
              </h3>
              <p className="mb-4 text-detective-text-secondary">
                {searchQuery || filterType !== 'all'
                  ? 'Intenta con otros filtros de búsqueda'
                  : 'Sube tu primer recurso para empezar'}
              </p>
              <DetectiveButton onClick={() => setShowUploadModal(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Subir Recurso
              </DetectiveButton>
            </div>
          </DetectiveCard>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredResources.map((resource) => {
              const FileIcon = getFileIcon(resource.type);
              return (
                <DetectiveCard key={resource.id} className="group relative">
                  <div className="space-y-3">
                    {/* Icon */}
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-lg ${getTypeColor(resource.type)}`}
                    >
                      <FileIcon className="h-8 w-8" />
                    </div>

                    {/* Info */}
                    <div>
                      <h4 className="truncate font-semibold text-detective-text" title={resource.originalName}>
                        {resource.originalName}
                      </h4>
                      <p className="text-sm text-detective-text-secondary">
                        {getTypeLabel(resource.type)} &middot; {formatFileSize(resource.size)}
                      </p>
                      <p className="text-xs text-detective-text-secondary">
                        {new Date(resource.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(resource.url, '_blank')}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-detective-bg px-3 py-2 text-sm font-medium text-detective-text transition-colors hover:bg-detective-orange hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </button>
                      <button
                        onClick={() => confirmDelete(resource)}
                        className="flex items-center justify-center rounded-lg bg-red-100 px-3 py-2 text-red-600 transition-colors hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </DetectiveCard>
              );
            })}
          </div>
        ) : (
          <DetectiveCard>
            <div className="divide-y divide-detective-bg">
              {filteredResources.map((resource) => {
                const FileIcon = getFileIcon(resource.type);
                return (
                  <div key={resource.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${getTypeColor(resource.type)}`}
                      >
                        <FileIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-detective-text">{resource.originalName}</h4>
                        <p className="text-sm text-detective-text-secondary">
                          {getTypeLabel(resource.type)} &middot; {formatFileSize(resource.size)} &middot;{' '}
                          {new Date(resource.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(resource.url, '_blank')}
                        className="flex items-center gap-1 rounded-lg bg-detective-bg px-3 py-2 text-sm font-medium text-detective-text transition-colors hover:bg-detective-orange hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </button>
                      <button
                        onClick={() => confirmDelete(resource)}
                        className="flex items-center justify-center rounded-lg bg-red-100 px-3 py-2 text-red-600 transition-colors hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </DetectiveCard>
        )}

        {/* Upload Modal */}
        <Modal isOpen={showUploadModal} onClose={() => !uploading && setShowUploadModal(false)} title="Subir Recursos">
          <div className="space-y-4">
            {/* Drop Zone */}
            <div className="rounded-lg border-2 border-dashed border-detective-orange/50 p-8 text-center transition-colors hover:border-detective-orange">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,audio/*,application/pdf,.doc,.docx"
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-4 h-12 w-12 text-detective-orange" />
                <p className="mb-2 font-semibold text-detective-text">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-detective-text-secondary">
                  Imágenes (max {formatFileSize(DEFAULT_MAX_SIZES.image)}), Videos (max{' '}
                  {formatFileSize(DEFAULT_MAX_SIZES.video)}), Audio (max{' '}
                  {formatFileSize(DEFAULT_MAX_SIZES.audio)}), Documentos (max{' '}
                  {formatFileSize(DEFAULT_MAX_SIZES.document)})
                </p>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold text-detective-text">
                  Archivos seleccionados ({selectedFiles.length}):
                </p>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-detective-bg p-2"
                    >
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-detective-text-secondary" />
                        <span className="text-sm text-detective-text">{file.name}</span>
                        <span className="text-xs text-detective-text-secondary">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-red-500 hover:text-red-700"
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-detective-bg">
                  <div
                    className="h-full rounded-full bg-detective-orange transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-detective-text-secondary">
                  Subiendo... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <DetectiveButton
                variant="secondary"
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="flex-1"
              >
                Cancelar
              </DetectiveButton>
              <DetectiveButton
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                  </>
                )}
              </DetectiveButton>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirmar Eliminación"
        >
          <div className="space-y-4">
            <p className="text-detective-text">
              ¿Estás seguro de que deseas eliminar el recurso{' '}
              <strong>{resourceToDelete?.originalName}</strong>?
            </p>
            <p className="text-sm text-detective-text-secondary">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 pt-4">
              <DetectiveButton
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancelar
              </DetectiveButton>
              <button
                onClick={handleDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </TeacherLayout>
  );
}
