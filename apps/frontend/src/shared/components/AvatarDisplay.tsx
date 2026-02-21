import React, { useState } from 'react';
import { cn } from '@shared/utils/cn';

export interface AvatarDisplayProps {
  /** Avatar image URL (from profile or equipped cosmetic) */
  src?: string | null;
  /** User's full name (for fallback initials) */
  name: string;
  /** CSS border color for equipped frame (e.g., '#8B5CF6') */
  frameColor?: string | null;
  /** Tailwind classes for frame effect (e.g., 'ring-4 ring-gold animate-pulse') */
  frameClass?: string;
  /** SVG overlay URL for decorative frame */
  frameSrc?: string;
  /** Box-shadow glow effect color */
  glowColor?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeConfig = {
  xs: { container: 'h-6 w-6', text: 'text-xs', border: 2, overlay: 'h-8 w-8' },
  sm: { container: 'h-8 w-8', text: 'text-sm', border: 2, overlay: 'h-10 w-10' },
  md: { container: 'h-12 w-12', text: 'text-lg', border: 3, overlay: 'h-16 w-16' },
  lg: { container: 'h-20 w-20', text: 'text-2xl', border: 4, overlay: 'h-24 w-24' },
} as const;

/**
 * AvatarDisplay — Reusable avatar component with equipped frame support.
 *
 * Renders:
 * 1. Profile/cosmetic image when `src` is provided
 * 2. Initials fallback when no image or on load error
 * 3. Frame support: SVG overlay > CSS class > border color (priority chain)
 * 4. Optional glow effect via box-shadow
 */
export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  src,
  name,
  frameColor,
  frameClass,
  frameSrc,
  glowColor,
  size = 'sm',
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const [frameImgError, setFrameImgError] = useState(false);
  const cfg = sizeConfig[size];
  const initial = name.charAt(0).toUpperCase() || 'U';
  const showImage = !!src && !imgError;
  const showFrameOverlay = !!frameSrc && !frameImgError;

  // Priority: frameSrc (SVG overlay) > frameClass (CSS) > frameColor (border)
  const frameStyle: React.CSSProperties = {};
  if (!showFrameOverlay && !frameClass && frameColor) {
    frameStyle.borderColor = frameColor;
    frameStyle.borderWidth = cfg.border;
    frameStyle.borderStyle = 'solid';
  }
  if (glowColor) {
    frameStyle.boxShadow = `0 0 12px 3px ${glowColor}`;
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Main avatar circle */}
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full',
          cfg.container,
          !showImage && 'bg-gradient-to-r from-purple-500 to-pink-500',
          showImage && frameColor && !frameClass && !showFrameOverlay && 'bg-white/10',
          !showFrameOverlay && frameClass,
        )}
        style={frameStyle}
      >
        {showImage ? (
          <img
            src={src!}
            alt={name}
            className="h-full w-full rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={cn('font-bold text-white', cfg.text)}>{initial}</span>
        )}
      </div>

      {/* SVG frame overlay (positioned around the avatar) */}
      {showFrameOverlay && (
        <img
          src={frameSrc!}
          alt=""
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 m-auto',
            cfg.overlay,
          )}
          onError={() => setFrameImgError(true)}
        />
      )}
    </div>
  );
};

AvatarDisplay.displayName = 'AvatarDisplay';
