/**
 * Media Components
 * Components for handling images, videos, and other media
 *
 * @module shared/components/media
 * @updated CORR-009: Added AudioPlayer, VideoPlayer, NavigationPathViewer
 */

// ============================================================================
// INTERFACE EXPORTS
// ============================================================================

export interface MediaUploaderProps {
  onUpload: (file: File) => void;
  accept?: string;
}

export interface MediaGalleryProps {
  items: Array<{ id: string; url: string; type: string }>;
  onSelect?: (id: string) => void;
}

export interface FileUploaderProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ExportButtonProps {
  data: unknown;
  filename?: string;
}

// ============================================================================
// CORR-009: Real Component Exports for M3-M5 Exercises
// ============================================================================

// AudioPlayer - Para podcast_argumentativo (M3)
export { AudioPlayer } from './AudioPlayer';
export type { AudioPlayerProps } from './AudioPlayer';

// VideoPlayer - Para video_carta (M5)
export { VideoPlayer } from './VideoPlayer';
export type { VideoPlayerProps } from './VideoPlayer';

// NavigationPathViewer - Para navegacion_hipertextual (M4)
export { NavigationPathViewer } from './NavigationPathViewer';
export type { NavigationPathViewerProps, NavigationStep } from './NavigationPathViewer';

// ============================================================================
// PLACEHOLDER COMPONENTS (to be implemented)
// ============================================================================

export const MediaUploader = (_props: MediaUploaderProps) => null;
export const MediaGallery = (_props: MediaGalleryProps) => null;
export const FileUploader = (_props: FileUploaderProps) => null;
export const ExportButton = (_props: ExportButtonProps) => null;
