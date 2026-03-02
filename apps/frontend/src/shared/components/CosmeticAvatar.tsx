/**
 * CosmeticAvatar Component
 *
 * Renders a user avatar with equipped cosmetic avatar skin.
 * Extracts cosmetic data from a batch equipped-items map and delegates
 * rendering to the existing AvatarDisplay component.
 * Note: Frames render only in RankProgressWidget, not on avatars.
 *
 * Usage:
 *   <CosmeticAvatar
 *     userId={user.id}
 *     name={user.username}
 *     fallbackAvatar={user.avatar}
 *     equippedMap={batchEquippedData}
 *     size="md"
 *   />
 *
 * @see AvatarDisplay for the underlying avatar renderer
 * @see inventory.api.ts getEquippedItemsBatch for the batch API
 */

import { AvatarDisplay } from './AvatarDisplay';
import type { EquippedItemsBatchMap } from '@/features/gamification/social/types/inventory.types';

export interface CosmeticAvatarProps {
  /** User ID to look up in the equippedMap */
  userId: string;
  /** User's display name (for initials fallback) */
  name: string;
  /** Fallback avatar URL when no cosmetic avatar is equipped */
  fallbackAvatar?: string | null;
  /** Batch equipped items map from getEquippedItemsBatch */
  equippedMap?: EquippedItemsBatchMap | null;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Extract the avatar URL from equipped cosmetics, falling back to the
 * user's default avatar if no cosmetic avatar is equipped.
 */
function resolveAvatarSrc(
  userId: string,
  fallbackAvatar?: string | null,
  equippedMap?: EquippedItemsBatchMap | null,
): string | null {
  const userEquipped = equippedMap?.[userId];
  // Look for cosmetic category names that represent avatars
  const cosmeticAvatar =
    userEquipped?.['avatar']?.assetUrl ||
    userEquipped?.['cosmetics']?.assetUrl;

  return cosmeticAvatar || fallbackAvatar || null;
}

export const CosmeticAvatar = ({
  userId,
  name,
  fallbackAvatar,
  equippedMap,
  size = 'sm',
  className,
}: CosmeticAvatarProps) => {
  const avatarSrc = resolveAvatarSrc(userId, fallbackAvatar, equippedMap);

  return (
    <AvatarDisplay
      src={avatarSrc}
      name={name}
      size={size}
      className={className}
    />
  );
};

CosmeticAvatar.displayName = 'CosmeticAvatar';
