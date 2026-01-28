/**
 * LogoUploader Component for EXT-008 White Label System
 *
 * A file uploader component for logo images with drag-and-drop support,
 * preview, and validation.
 *
 * @module features/admin/branding/components/LogoUploader
 * @see ET-WL-003-asset-management.md
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, AlertCircle, Loader2 } from 'lucide-react';

interface LogoUploaderProps {
  /** Label for the uploader */
  label: string;
  /** Current logo URL (if any) */
  currentLogoUrl?: string | null;
  /** Callback when file is selected */
  onUpload: (file: File) => Promise<void>;
  /** Callback when logo is removed */
  onRemove?: () => Promise<void>;
  /** Accepted file types (defaults to PNG, JPG, SVG) */
  accept?: string;
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Whether the uploader is disabled */
  disabled?: boolean;
  /** Optional description text */
  description?: string;
  /** Recommended dimensions text */
  dimensions?: string;
}

/**
 * LogoUploader Component
 *
 * Provides logo upload functionality with:
 * - Drag and drop support
 * - Click to select file
 * - Image preview
 * - File validation (type, size)
 * - Upload progress indication
 * - Remove functionality
 *
 * @example
 * ```tsx
 * <LogoUploader
 *   label="Company Logo"
 *   currentLogoUrl={branding?.logoUrl}
 *   onUpload={handleLogoUpload}
 *   onRemove={handleLogoRemove}
 *   description="Your logo will appear in the header"
 *   dimensions="Recommended: 200x50 pixels"
 * />
 * ```
 */
export const LogoUploader: React.FC<LogoUploaderProps> = ({
  label,
  currentLogoUrl,
  onUpload,
  onRemove,
  accept = 'image/png,image/jpeg,image/svg+xml',
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false,
  description,
  dimensions = 'Recommended: 200x50 pixels, PNG or SVG',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate file type and size
   */
  const validateFile = useCallback((file: File): string | null => {
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileType = file.type;

    if (!acceptedTypes.includes(fileType)) {
      return `Invalid file type. Accepted: ${accept}`;
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  }, [accept, maxSize]);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, validateFile]);

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  /**
   * Handle drag events
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle remove
   */
  const handleRemove = async () => {
    if (!onRemove) return;

    setIsUploading(true);
    try {
      await onRemove();
      setPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle click to open file dialog
   */
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Display URL (preview takes precedence over current)
  const displayUrl = previewUrl || currentLogoUrl;

  return (
    <div className="w-full">
      {/* Label */}
      <label className="mb-2 block text-sm font-medium text-detective-text">
        {label}
      </label>

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center
          rounded-lg border-2 border-dashed p-6 transition-all
          ${isDragging ? 'border-detective-orange bg-detective-orange/5' : 'border-detective-border'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-detective-orange/50'}
          ${error ? 'border-red-500' : ''}
        `}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
            <Loader2 className="h-8 w-8 animate-spin text-detective-orange" />
          </div>
        )}

        {/* Content */}
        {displayUrl ? (
          // Preview
          <div className="relative">
            <img
              src={displayUrl}
              alt="Logo preview"
              className="max-h-24 max-w-full object-contain"
            />
            {onRemove && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="
                  absolute -right-2 -top-2 rounded-full bg-red-500 p-1
                  text-white hover:bg-red-600 transition-colors
                "
                title="Remove logo"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          // Upload prompt
          <>
            <div className="mb-4 rounded-full bg-detective-orange/10 p-3">
              <Upload className="h-6 w-6 text-detective-orange" />
            </div>
            <p className="mb-1 text-sm font-medium text-detective-text">
              {isDragging ? 'Drop your file here' : 'Drag and drop or click to upload'}
            </p>
            <p className="text-xs text-detective-text-secondary">{dimensions}</p>
          </>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-detective-text-secondary">{description}</p>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default LogoUploader;
