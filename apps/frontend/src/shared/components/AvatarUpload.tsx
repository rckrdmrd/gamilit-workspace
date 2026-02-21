/**
 * AvatarUpload - Reusable Avatar Upload Component
 *
 * Features:
 * - Real file upload to backend (via profileAPI.uploadAvatar)
 * - Image preview before upload
 * - File type validation (images only)
 * - File size validation (max 5MB)
 * - Upload progress indicator
 * - Error handling with user feedback
 * - Loading states
 *
 * @see SETTINGS-003 - Avatar Upload Implementation
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@shared/utils/cn';
import { profileAPI, type AvatarUploadResponse } from '@/services/api/profileAPI';

// ============================================================================
// TYPES
// ============================================================================

export interface AvatarUploadProps {
  /** User ID for the avatar upload */
  userId: string;
  /** Current avatar URL to display */
  currentAvatarUrl?: string;
  /** User's display name for fallback initials */
  displayName: string;
  /** Callback when upload completes successfully */
  onUploadComplete?: (avatarUrl: string) => void;
  /** Callback when upload fails */
  onUploadError?: (error: Error) => void;
  /** Size variant of the avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Maximum file size in MB (default: 5MB) */
  maxSizeMB?: number;
  /** Disable upload functionality */
  disabled?: boolean;
  /** Show upload instructions */
  showInstructions?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  currentAvatarUrl,
  displayName,
  onUploadComplete,
  onUploadError,
  size = 'lg',
  className,
  maxSizeMB = 5,
  disabled = false,
  showInstructions = true,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // SIZE CONFIGURATIONS
  // ============================================================================

  const sizeConfig = {
    sm: {
      avatar: 'h-16 w-16',
      button: 'h-5 w-5',
      icon: 'h-3 w-3',
      text: 'text-sm',
      initials: 'text-lg'
    },
    md: {
      avatar: 'h-20 w-20',
      button: 'h-6 w-6',
      icon: 'h-4 w-4',
      text: 'text-base',
      initials: 'text-2xl'
    },
    lg: {
      avatar: 'h-24 w-24',
      button: 'h-7 w-7',
      icon: 'h-4 w-4',
      text: 'text-base',
      initials: 'text-2xl'
    },
    xl: {
      avatar: 'h-32 w-32',
      button: 'h-8 w-8',
      icon: 'h-5 w-5',
      text: 'text-lg',
      initials: 'text-3xl'
    },
  };

  const config = sizeConfig[size];

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)';
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
    }

    return null;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError, {
        icon: '❌',
        duration: 4000,
      });
      onUploadError?.(new Error(validationError));
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 150);

      // Upload to backend
      const result: AvatarUploadResponse = await profileAPI.uploadAvatar(userId, file);

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Success feedback
      toast.success('Avatar actualizado correctamente', {
        icon: '✅',
        duration: 3000,
        style: {
          border: '2px solid #f97316',
          padding: '16px',
        },
      });

      // Callback
      // FIX-2026-01-19: Use camelCase from transformed API response
      onUploadComplete?.(result.avatarUrl);

      // Reset progress after animation
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);
    } catch (err) {
      const error = err as Error;
      console.error('Error uploading avatar:', error);

      const axiosLikeError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosLikeError.response?.data?.message ||
                          error.message ||
                          'Error al subir el avatar';

      setError(errorMessage);
      setPreview(null);
      setUploadProgress(0);
      setUploading(false);

      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });

      onUploadError?.(error);
    }
  };

  const handleButtonClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const avatarSrc = preview || currentAvatarUrl;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Avatar Display */}
      <div className="relative">
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden rounded-full border-2 border-detective-orange/40 bg-gradient-to-br from-detective-orange to-detective-gold transition-all',
            config.avatar,
            uploading && 'opacity-70'
          )}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`Avatar de ${displayName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className={cn('font-bold text-white', config.initials)}>
              {getInitial(displayName)}
            </span>
          )}
        </div>

        {/* Upload Button Overlay */}
        <button
          onClick={handleButtonClick}
          disabled={disabled || uploading}
          className={cn(
            'absolute bottom-0 right-0 flex items-center justify-center rounded-full transition-all',
            config.button,
            uploading
              ? 'cursor-not-allowed bg-gray-400'
              : disabled
                ? 'cursor-not-allowed bg-gray-300'
                : 'cursor-pointer bg-detective-orange hover:scale-110 hover:bg-detective-orange-dark shadow-md'
          )}
          aria-label="Cambiar avatar"
        >
          {uploading ? (
            <Loader2 className={cn('animate-spin text-white', config.icon)} />
          ) : (
            <Camera className={cn('text-white', config.icon)} />
          )}
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
          aria-label="Seleccionar imagen"
        />
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploading && uploadProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-detective-bg">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-2 bg-gradient-to-r from-detective-orange to-detective-gold"
                  />
                </div>
              </div>
              <span className={cn('font-medium text-detective-text', config.text)}>
                {uploadProgress}%
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              {uploadProgress < 100 ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-detective-text-secondary" />
                  <p className="text-xs text-detective-text-secondary">
                    Subiendo avatar...
                  </p>
                </>
              ) : (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <p className="text-xs text-green-600">
                    ¡Completado!
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {showInstructions && !uploading && (
        <div className="text-center">
          <p className={cn('text-detective-text-secondary', config.text)}>
            {disabled ? 'Upload deshabilitado' : 'Haz click para cambiar tu avatar'}
          </p>
          <p className="text-xs text-detective-text-secondary">
            JPG, PNG, GIF o WebP. Máx {maxSizeMB}MB
          </p>
        </div>
      )}

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 max-w-xs"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default AvatarUpload;
