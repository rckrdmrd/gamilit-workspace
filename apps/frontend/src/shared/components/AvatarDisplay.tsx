import React, { useState } from 'react';
import { cn } from '@shared/utils/cn';

export interface AvatarDisplayProps {
  /** Avatar image URL (from profile or equipped cosmetic) */
  src?: string | null;
  /** User's full name (for fallback initials) */
  name: string;
  /** CSS border color for equipped frame (e.g., '#8B5CF6') */
  frameColor?: string | null;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeConfig = {
  xs: { container: 'h-6 w-6', text: 'text-xs', border: 2 },
  sm: { container: 'h-8 w-8', text: 'text-sm', border: 2 },
  md: { container: 'h-12 w-12', text: 'text-lg', border: 3 },
  lg: { container: 'h-20 w-20', text: 'text-2xl', border: 4 },
} as const;

/**
 * AvatarDisplay — Reusable avatar component with equipped frame support.
 *
 * Renders:
 * 1. Profile/cosmetic image when `src` is provided
 * 2. Initials fallback when no image or on load error
 * 3. Optional colored border from equipped frame item
 */
export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  src,
  name,
  frameColor,
  size = 'sm',
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const cfg = sizeConfig[size];
  const initial = name.charAt(0).toUpperCase() || 'U';
  const showImage = !!src && !imgError;

  const frameStyle: React.CSSProperties = frameColor
    ? { borderColor: frameColor, borderWidth: cfg.border, borderStyle: 'solid' }
    : {};

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-full',
        cfg.container,
        !showImage && 'bg-gradient-to-r from-purple-500 to-pink-500',
        showImage && frameColor && 'bg-white/10',
        className,
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
  );
};

AvatarDisplay.displayName = 'AvatarDisplay';
