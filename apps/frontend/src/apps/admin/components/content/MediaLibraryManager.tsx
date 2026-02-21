import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { useMediaLibrary } from '../../hooks/useContentManagement';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import { Upload, Image, Video, Music, Trash2, Search, Tag, HardDrive } from 'lucide-react';

export const MediaLibraryManager: React.FC = () => {
  const { media, loading, storageUsed, storageLimit, uploadFile, deleteFile, bulkDelete } =
    useMediaLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} exceeds 10MB limit`);
          continue;
        }
        await uploadFile(file);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    setConfirmMessage(`Delete ${selectedFiles.length} file(s)?`);
    setPendingAction(() => async () => {
      try {
        await bulkDelete(selectedFiles);
        setSelectedFiles([]);
      } catch (error) {
        console.error('Bulk delete failed:', error);
        toast.error('Bulk delete failed');
      }
    });
    setShowConfirm(true);
  };

  const toggleSelectFile = (id: string) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const filteredMedia = media
    .filter((file) => filterType === 'all' || file.type === filterType)
    .filter(
      (file) =>
        file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    );

  const storagePercentage = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'audio':
        return <Music className="h-6 w-6" />;
      default:
        return <Image className="h-6 w-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <DetectiveCard>
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-detective-orange border-t-transparent"></div>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-detective-subtitle">Media Library Manager</h2>
        <div className="flex items-center gap-3">
          {selectedFiles.length > 0 && (
            <DetectiveButton
              variant="primary"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete {selectedFiles.length} file(s)
            </DetectiveButton>
          )}
          <label className="cursor-pointer">
            <DetectiveButton
              variant="primary"
              icon={<Upload className="h-4 w-4" />}
              disabled={uploading}
              loading={uploading}
              as="span"
            >
              Upload Files
            </DetectiveButton>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Storage Usage */}
      <DetectiveCard className="border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
        <div className="flex items-center gap-4">
          <HardDrive className="h-8 w-8 text-blue-500" />
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-detective-base">Storage Usage</span>
              <span className="text-detective-base font-bold">
                {formatFileSize(storageUsed)} / {formatFileSize(storageLimit)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-detective-bg-secondary">
              <div
                className={`h-full transition-all ${
                  storagePercentage > 90
                    ? 'bg-gradient-to-r from-red-500 to-red-400'
                    : storagePercentage > 70
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                      : 'bg-gradient-to-r from-blue-500 to-blue-400'
                }`}
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            <div className="text-detective-small mt-1 flex items-center justify-between text-gray-400">
              <span>{storagePercentage.toFixed(1)}% used</span>
              <span>{media.length} files</span>
            </div>
          </div>
        </div>
      </DetectiveCard>

      {/* Filters */}
      <DetectiveCard>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files or tags..."
              className="input-detective pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'image', 'video', 'audio'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 rounded-lg px-4 py-2 transition-colors ${
                  filterType === type
                    ? 'bg-detective-orange text-white'
                    : 'bg-detective-bg-secondary text-gray-400 hover:bg-detective-bg-secondary/70'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </DetectiveCard>

      {/* Media Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Upload}
              title="No media files found"
              description="Sube archivos para verlos aqui"
            />
          </div>
        ) : (
          filteredMedia.map((file) => {
            const isSelected = selectedFiles.includes(file.id);

            return (
              <DetectiveCard
                key={file.id}
                className={`group relative ${isSelected ? 'ring-2 ring-detective-orange' : ''}`}
                padding="none"
              >
                {/* Checkbox */}
                <div className="absolute left-2 top-2 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectFile(file.id)}
                    className="h-5 w-5 rounded border-2 border-detective-orange"
                  />
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteFile(file.id)}
                  className="absolute right-2 top-2 z-10 rounded-lg bg-red-500/80 p-2 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Thumbnail */}
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-detective-bg-secondary">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">{getFileIcon(file.type)}</div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-detective-small truncate font-semibold" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>

                  {/* Tags */}
                  {file.tags && file.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      <Tag className="h-3 w-3 text-gray-500" />
                      {file.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-detective-orange/20 px-2 py-0.5 text-xs text-detective-orange"
                        >
                          {tag}
                        </span>
                      ))}
                      {file.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{file.tags.length - 2}</span>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    {file.uploadedAt
                      ? new Date(file.uploadedAt).toLocaleDateString('es-ES')
                      : 'N/A'}
                  </p>
                </div>
              </DetectiveCard>
            );
          })
        )}
      </div>

      {/* Upload Instructions */}
      <DetectiveCard className="border border-blue-500/30 bg-blue-500/10">
        <div className="flex items-start gap-3">
          <Upload className="mt-1 h-5 w-5 text-blue-500" />
          <div>
            <p className="mb-1 text-detective-base font-semibold text-blue-500">
              Upload Guidelines
            </p>
            <ul className="text-detective-small space-y-1 text-gray-400">
              <li>Max file size: 10 MB</li>
              <li>
                Supported formats: Images (JPG, PNG, GIF), Videos (MP4, WebM), Audio (MP3, WAV)
              </li>
              <li>Files are automatically optimized for web delivery</li>
            </ul>
          </div>
        </div>
      </DetectiveCard>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          pendingAction?.();
          setShowConfirm(false);
        }}
        title="Confirmar accion"
        message={confirmMessage}
        variant="danger"
      />
    </div>
  );
};
