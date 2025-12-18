import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  X,
  FileImage,
  FileAudio,
  FileVideo,
  File as FileIcon,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  mediaApi,
  MediaType,
  MediaAttachmentResponse,
  formatFileSize,
  detectMediaType,
} from '@/shared/api/mediaApi';

/**
 * MediaUploader Props
 */
export interface MediaUploaderProps {
  acceptedTypes: MediaType[];
  maxSize?: number;
  maxFiles?: number;
  exerciseId?: string;
  submissionId?: string;
  onUpload: (media: MediaAttachmentResponse[]) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * File with upload status
 */
interface FileWithStatus {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  response?: MediaAttachmentResponse;
}

/**
 * MediaUploader Component
 *
 * Reusable component for uploading multimedia files (images, audio, video)
 * with drag & drop, preview, progress tracking, and validation.
 */
export const MediaUploader: React.FC<MediaUploaderProps> = ({
  acceptedTypes,
  maxSize,
  maxFiles = 5,
  exerciseId,
  submissionId,
  onUpload,
  onError,
  className = '',
  disabled = false,
}) => {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Get accept attribute for file input
   */
  const getAcceptAttribute = useCallback(() => {
    const mimeTypes: string[] = [];
    for (const type of acceptedTypes) {
      switch (type) {
        case 'image':
          mimeTypes.push('image/*');
          break;
        case 'audio':
          mimeTypes.push('audio/*');
          break;
        case 'video':
          mimeTypes.push('video/*');
          break;
        case 'document':
          mimeTypes.push('.pdf,.doc,.docx,.txt');
          break;
      }
    }
    return mimeTypes.join(',');
  }, [acceptedTypes]);

  /**
   * Handle file selection
   */
  const handleFiles = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return;

      const newFiles: FileWithStatus[] = [];

      // Convert FileList to array and validate
      Array.from(selectedFiles).forEach((file) => {
        // Check max files limit
        if (files.length + newFiles.length >= maxFiles) {
          onError?.(`Máximo ${maxFiles} archivos permitidos`);
          return;
        }

        // Detect media type
        const detectedType = detectMediaType(file);
        if (!detectedType || !acceptedTypes.includes(detectedType)) {
          onError?.(`Tipo de archivo no permitido: ${file.name}`);
          return;
        }

        // Validate file
        const validation = mediaApi.validateFile(file, detectedType, maxSize);
        if (!validation.valid) {
          onError?.(validation.errors?.join(', ') || 'Validación fallida');
          return;
        }

        // Add to upload queue
        newFiles.push({
          file,
          id: `${Date.now()}-${Math.random()}`,
          progress: 0,
          status: 'pending',
        });
      });

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        // Start uploads
        newFiles.forEach((fileWithStatus) => uploadFile(fileWithStatus));
      }
    },
    [files.length, maxFiles, acceptedTypes, maxSize, onError],
  );

  /**
   * Upload a single file
   */
  const uploadFile = useCallback(
    async (fileWithStatus: FileWithStatus) => {
      const detectedType = detectMediaType(fileWithStatus.file);
      if (!detectedType) return;

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) => (f.id === fileWithStatus.id ? { ...f, status: 'uploading' } : f)),
      );

      try {
        const response = await mediaApi.uploadMedia(fileWithStatus.file, {
          type: detectedType,
          exerciseId,
          submissionId,
          maxSize,
          onProgress: (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === fileWithStatus.id ? { ...f, progress } : f)),
            );
          },
        });

        // Update status to success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileWithStatus.id ? { ...f, status: 'success', progress: 100, response } : f,
          ),
        );

        // Notify parent of successful uploads
        const successfulUploads = files
          .filter((f) => f.status === 'success' && f.response)
          .map((f) => f.response!);
        successfulUploads.push(response);
        onUpload(successfulUploads);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo';

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileWithStatus.id ? { ...f, status: 'error', error: errorMessage } : f,
          ),
        );

        onError?.(errorMessage);
      }
    },
    [exerciseId, submissionId, maxSize, files, onUpload, onError],
  );

  /**
   * Remove a file
   */
  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const updated = prev.filter((f) => f.id !== fileId);

        // Update parent with remaining successful uploads
        const successfulUploads = updated
          .filter((f) => f.status === 'success' && f.response)
          .map((f) => f.response!);
        onUpload(successfulUploads);

        return updated;
      });
    },
    [onUpload],
  );

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles],
  );

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFiles],
  );

  /**
   * Open file picker
   */
  const openFilePicker = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  /**
   * Get icon for file type
   */
  const getFileIcon = (file: File) => {
    const type = detectMediaType(file);
    switch (type) {
      case 'image':
        return <FileImage className="h-8 w-8 text-detective-blue" />;
      case 'audio':
        return <FileAudio className="text-detective-purple h-8 w-8" />;
      case 'video':
        return <FileVideo className="text-detective-red h-8 w-8" />;
      case 'document':
        return <FileIcon className="h-8 w-8 text-detective-yellow" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-400" />;
    }
  };

  /**
   * Get preview for file
   */
  const getFilePreview = (fileWithStatus: FileWithStatus) => {
    const type = detectMediaType(fileWithStatus.file);

    if (type === 'image' && fileWithStatus.response?.url) {
      return (
        <img
          src={fileWithStatus.response.url}
          alt={fileWithStatus.file.name}
          className="h-full w-full object-cover"
        />
      );
    }

    if (type === 'image') {
      const url = URL.createObjectURL(fileWithStatus.file);
      return (
        <img
          src={url}
          alt={fileWithStatus.file.name}
          className="h-full w-full object-cover"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    }

    return getFileIcon(fileWithStatus.file);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          rounded-detective border-2 border-dashed p-8 text-center transition-all
          ${isDragging ? 'border-detective-orange bg-orange-50' : 'border-gray-300 bg-gray-50'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-detective-orange hover:bg-orange-50'}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={getAcceptAttribute()}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <Upload className="mx-auto mb-4 h-12 w-12 text-detective-orange" />
        <p className="mb-2 text-lg font-medium text-gray-700">
          {isDragging
            ? 'Suelta los archivos aquí'
            : 'Arrastra archivos o haz clic para seleccionar'}
        </p>
        <p className="text-sm text-gray-500">
          Tipos permitidos: {acceptedTypes.join(', ')}
          {maxSize && ` • Tamaño máximo: ${formatFileSize(maxSize)}`}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Máximo {maxFiles} {maxFiles === 1 ? 'archivo' : 'archivos'}
        </p>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileWithStatus) => (
            <div
              key={fileWithStatus.id}
              className="rounded-detective border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-100">
                  {getFilePreview(fileWithStatus)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{fileWithStatus.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(fileWithStatus.file.size)}
                  </p>

                  {/* Progress Bar */}
                  {fileWithStatus.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-detective-orange transition-all"
                          style={{ width: `${fileWithStatus.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{fileWithStatus.progress}%</p>
                    </div>
                  )}

                  {/* Error Message */}
                  {fileWithStatus.status === 'error' && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm">{fileWithStatus.error}</p>
                    </div>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex items-center gap-2">
                  {fileWithStatus.status === 'success' && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                  {fileWithStatus.status === 'error' && (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(fileWithStatus.id)}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    disabled={fileWithStatus.status === 'uploading'}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
