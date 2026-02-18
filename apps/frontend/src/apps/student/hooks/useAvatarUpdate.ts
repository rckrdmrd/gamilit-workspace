/**
 * useAvatarUpdate Hook
 *
 * Handles avatar update mutation: optimistic UI update via Zustand +
 * API persistence via profileAPI.
 *
 * Extracted from EnhancedProfilePage to follow Thin Shell pattern.
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/authStore';
import { profileAPI } from '@/services/api/profileAPI';

export function useAvatarUpdate() {
  const user = useAuthStore((state) => state.user);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateAvatar = async (avatarUrl: string): Promise<boolean> => {
    if (!user?.id) return false;
    setIsUpdating(true);
    try {
      useAuthStore.setState({
        user: { ...user, avatar_url: avatarUrl } as typeof user,
      });
      await profileAPI.updateProfile(user.id, { avatar_url: avatarUrl });
      toast.success('Avatar actualizado');
      return true;
    } catch {
      toast.error('Error al actualizar avatar');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateAvatar, isUpdating };
}
