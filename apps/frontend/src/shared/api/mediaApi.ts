/**
 * Media API Client
 *
 * API client for media upload and management service.
 * Handles file uploads for images, audio, and video in educational exercises.
 */

import apiClient from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Supported media types
 */
export type MediaType = 'image' | 'audio' | 'video' | 'document';

/**
 * Media upload options
 */
export interface MediaUploadOptions {
  exerciseId?: string;
  submissionId?: string;
  type: MediaType;
  maxSize?: number; // in bytes
  onProgress?: (progress: number) => void;
}

/**
 * Media validation result
 */
export interface MediaValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Media attachment response
 */
export interface MediaAttachmentResponse {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  type: MediaType;
  uploadedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    [key: string]: unknown;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default max file sizes by type (in bytes)
 */
export const DEFAULT_MAX_SIZES: Record<MediaType, number> = {
  image: 10 * 1024 * 1024, // 10 MB
  audio: 50 * 1024 * 1024, // 50 MB
  video: 200 * 1024 * 1024, // 200 MB
  document: 20 * 1024 * 1024, // 20 MB
};

/**
 * Allowed MIME types by media type
 */
export const ALLOWED_MIME_TYPES: Record<MediaType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  audio: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/ogg'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  document: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate file before upload
 *
 * @param file - File to validate
 * @param type - Expected media type
 * @param maxSize - Maximum allowed size
 * @returns Validation result
 */
export const validateFile = (
  file: File,
  type: MediaType,
  maxSize?: number,
): MediaValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  const maxSizeLimit = maxSize || DEFAULT_MAX_SIZES[type];
  if (file.size > maxSizeLimit) {
    errors.push(`El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(maxSizeLimit)}`);
  }

  // Check MIME type
  const allowedTypes = ALLOWED_MIME_TYPES[type];
  if (!allowedTypes.includes(file.type)) {
    errors.push(
      `Tipo de archivo no permitido. Tipos aceptados: ${allowedTypes.map((t) => t.split('/')[1]).join(', ')}`,
    );
  }

  // Check file name
  if (file.name.length > 255) {
    warnings.push('El nombre del archivo es muy largo y será truncado');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

/**
 * Format file size for display
 *
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Detect media type from file
 *
 * @param file - File to analyze
 * @returns Detected media type
 */
export const detectMediaType = (file: File): MediaType | null => {
  const mimeType = file.type;

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('application/pdf') || mimeType.startsWith('text/')) return 'document';

  return null;
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Upload a media file
 *
 * @param file - File to upload
 * @param options - Upload options
 * @returns Upload response with media details
 */
export const uploadMedia = async (
  file: File,
  options: MediaUploadOptions,
): Promise<MediaAttachmentResponse> => {
  // Validate file
  const validation = validateFile(file, options.type, options.maxSize);
  if (!validation.valid) {
    throw new Error(validation.errors?.join(', ') || 'Validación de archivo fallida');
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', options.type);

  if (options.exerciseId) {
    formData.append('exerciseId', options.exerciseId);
  }

  if (options.submissionId) {
    formData.append('submissionId', options.submissionId);
  }

  // Upload with progress tracking
  const { data } = await apiClient.post<MediaAttachmentResponse>(
    API_ENDPOINTS.media.upload,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    },
  );

  return data;
};

/**
 * Upload multiple media files
 *
 * @param files - Files to upload
 * @param options - Upload options
 * @returns Array of upload responses
 */
export const uploadMultipleMedia = async (
  files: File[],
  options: Omit<MediaUploadOptions, 'onProgress'> & {
    onProgress?: (fileIndex: number, progress: number) => void;
  },
): Promise<MediaAttachmentResponse[]> => {
  const results: MediaAttachmentResponse[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadMedia(file, {
      ...options,
      onProgress: (progress) => {
        if (options.onProgress) {
          options.onProgress(i, progress);
        }
      },
    });
    results.push(result);
  }

  return results;
};

/**
 * Get media by ID
 *
 * @param mediaId - Media ID
 * @returns Media details
 */
export const getMedia = async (mediaId: string): Promise<MediaAttachmentResponse> => {
  const { data } = await apiClient.get<MediaAttachmentResponse>(API_ENDPOINTS.media.get(mediaId));
  return data;
};

/**
 * Delete media by ID
 *
 * @param mediaId - Media ID
 * @returns Success status
 */
export const deleteMedia = async (mediaId: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean }>(
    API_ENDPOINTS.media.delete(mediaId),
  );
  return data;
};

/**
 * Validate media file (server-side validation)
 *
 * @param file - File to validate
 * @param type - Media type
 * @returns Validation result from server
 */
export const validateMediaServer = async (
  file: File,
  type: MediaType,
): Promise<MediaValidationResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const { data } = await apiClient.post<MediaValidationResult>(
    API_ENDPOINTS.media.validate,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return data;
};

// ============================================================================
// EXPORTS
// ============================================================================

export const mediaApi = {
  uploadMedia,
  uploadMultipleMedia,
  getMedia,
  deleteMedia,
  validateFile,
  validateMediaServer,
  formatFileSize,
  detectMediaType,
};

export default mediaApi;
