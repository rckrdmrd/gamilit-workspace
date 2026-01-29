/**
 * FaviconUploader Component for EXT-008 White Label System
 *
 * A specialized file uploader component for favicon images.
 * Similar to LogoUploader but with favicon-specific constraints.
 *
 * @module features/admin/branding/components/FaviconUploader
 * @see ET-WL-003-asset-management.md
 */

import React, { useState, useRef, useCallback } from 'react';
import { X, Globe, AlertCircle, Loader2 } from 'lucide-react';

interface FaviconUploaderProps {
  /** Label for the uploader */
  label: string;
  /** Current favicon URL (if any) */
  currentFaviconUrl?: string | null;
  /** Callback when file is selected */
  onUpload: (file: File) => Promise<void>;
  /** Callback when favicon is removed */
  onRemove?: () => Promise<void>;
  /** Whether the uploader is disabled */
  disabled?: boolean;
  /** Optional description text */
  description?: string;
}

/**
 * FaviconUploader Component
 *
 * Provides favicon upload functionality with:
 * - Drag and drop support
 * - Click to select file
 * - Preview at multiple sizes
 * - File validation (ICO, PNG only)
 * - Upload progress indication
 * - Remove functionality
 *
 * @example
 * ```tsx
 * <FaviconUploader
 *   label="Favicon"
 *   currentFaviconUrl={branding?.faviconUrl}
 *   onUpload={handleFaviconUpload}
 *   onRemove={handleFaviconRemove}
 *   description="Your favicon will appear in the browser tab"
 * />
 * ```
 */
export const FaviconUploader: React.FC<FaviconUploaderProps> = ({
  label,
  currentFaviconUrl,
  onUpload,
  onRemove,
  disabled = false,
  description,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Favicon-specific constraints
  const accept = 'image/x-icon,image/vnd.microsoft.icon,image/png';
  const maxSize = 1024 * 1024; // 1MB max for favicon

  /**
   * Validate file type and size
   */
  const validateFile = useCallback((file: File): string | null => {
    const validTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png'];

    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Use ICO or PNG format.';
    }

    if (file.size > maxSize) {
      return 'File too large. Maximum size: 1MB';
    }

    return null;
  }, [maxSize]);

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
  const displayUrl = previewUrl || currentFaviconUrl;

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
          relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center
          rounded-lg border-2 border-dashed p-4 transition-all
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
            <Loader2 className="h-6 w-6 animate-spin text-detective-orange" />
          </div>
        )}

        {/* Content */}
        {displayUrl ? (
          // Preview at multiple sizes
          <div className="relative flex items-center gap-4">
            {/* Size previews */}
            <div className="flex flex-col items-center gap-1">
              <img
                src={displayUrl}
                alt="Favicon 32x32"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xs text-detective-text-secondary">32px</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <img
                src={displayUrl}
                alt="Favicon 16x16"
                className="h-4 w-4 object-contain"
              />
              <span className="text-xs text-detective-text-secondary">16px</span>
            </div>

            {/* Browser tab preview */}
            <div className="ml-4 flex items-center gap-2 rounded bg-gray-100 px-3 py-2">
              <img
                src={displayUrl}
                alt="Favicon in tab"
                className="h-4 w-4 object-contain"
              />
              <span className="text-xs text-gray-600">Tab Preview</span>
            </div>

            {/* Remove button */}
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
                title="Remove favicon"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ) : (
          // Upload prompt
          <>
            <div className="mb-3 rounded-full bg-detective-orange/10 p-2">
              <Globe className="h-5 w-5 text-detective-orange" />
            </div>
            <p className="mb-1 text-sm font-medium text-detective-text">
              {isDragging ? 'Drop your favicon here' : 'Upload Favicon'}
            </p>
            <p className="text-xs text-detective-text-secondary">
              ICO or PNG, 32x32 or 16x16 pixels
            </p>
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

export default FaviconUploader;
