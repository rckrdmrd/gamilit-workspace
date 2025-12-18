/**
 * AvatarUpload - Usage Examples
 *
 * This file demonstrates how to use the AvatarUpload component in different scenarios.
 * @see AvatarUpload.tsx for the component implementation
 */

import React, { useState } from 'react';
import { AvatarUpload } from './AvatarUpload';
import { useAuth } from '@/app/providers/AuthContext';

// ============================================================================
// EXAMPLE 1: Basic Usage in Settings Page
// ============================================================================

export const BasicAvatarUploadExample: React.FC = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl);

  if (!user) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Profile Picture</h3>

      <AvatarUpload
        userId={user.id}
        currentAvatarUrl={avatarUrl}
        displayName={user.displayName || user.email?.split('@')[0] || 'User'}
        onUploadComplete={(url) => {
          setAvatarUrl(url);
          console.log('Avatar uploaded:', url);
          // Optionally update user profile in your state management
        }}
        onUploadError={(error) => {
          console.error('Upload failed:', error);
        }}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Different Sizes
// ============================================================================

export const AvatarSizesExample: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-700">Small (sm)</h4>
        <AvatarUpload
          userId={user.id}
          currentAvatarUrl={user.avatarUrl}
          displayName={user.displayName || 'User'}
          size="sm"
          showInstructions={false}
        />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-700">Medium (md)</h4>
        <AvatarUpload
          userId={user.id}
          currentAvatarUrl={user.avatarUrl}
          displayName={user.displayName || 'User'}
          size="md"
        />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-700">Large (lg) - Default</h4>
        <AvatarUpload
          userId={user.id}
          currentAvatarUrl={user.avatarUrl}
          displayName={user.displayName || 'User'}
          size="lg"
        />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-700">Extra Large (xl)</h4>
        <AvatarUpload
          userId={user.id}
          currentAvatarUrl={user.avatarUrl}
          displayName={user.displayName || 'User'}
          size="xl"
        />
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: With Custom Max File Size
// ============================================================================

export const CustomMaxSizeExample: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AvatarUpload
      userId={user.id}
      currentAvatarUrl={user.avatarUrl}
      displayName={user.displayName || 'User'}
      maxSizeMB={2} // Only allow files up to 2MB
      onUploadComplete={(url) => console.log('Uploaded:', url)}
      onUploadError={(error) => console.error('Error:', error)}
    />
  );
};

// ============================================================================
// EXAMPLE 4: Disabled State
// ============================================================================

export const DisabledAvatarExample: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Upload disabled (e.g., during profile update)
      </p>

      <AvatarUpload
        userId={user.id}
        currentAvatarUrl={user.avatarUrl}
        displayName={user.displayName || 'User'}
        disabled={true}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Integration with Form
// ============================================================================

interface ProfileFormData {
  displayName: string;
  bio: string;
  avatarUrl?: string;
}

export const ProfileFormExample: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: user?.displayName || '',
    bio: '',
    avatarUrl: user?.avatarUrl,
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Save profile data including avatar URL
      console.log('Saving profile:', formData);
      // await profileAPI.updateProfile(user.id, formData);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <AvatarUpload
          userId={user.id}
          currentAvatarUrl={formData.avatarUrl}
          displayName={formData.displayName}
          disabled={isSaving}
          onUploadComplete={(url) => {
            setFormData({ ...formData, avatarUrl: url });
          }}
        />
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Name
        </label>
        <input
          type="text"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          disabled={isSaving}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          disabled={isSaving}
          rows={4}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600 disabled:bg-gray-400"
      >
        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
};

// ============================================================================
// EXAMPLE 6: Replacing Existing SettingsPage Implementation
// ============================================================================

/**
 * How to replace the inline avatar upload in SettingsPage.tsx
 * with the new AvatarUpload component:
 *
 * BEFORE (lines 372-452 in SettingsPage.tsx):
 * ```tsx
 * <div>
 *   <label className="mb-3 block text-sm font-medium text-detective-text">
 *     Profile Picture
 *   </label>
 *   <div className="flex items-center gap-4">
 *     <div className="relative">
 *       <div className="flex h-20 w-20 items-center ...">
 *         // ... avatar display logic
 *       </div>
 *       <label htmlFor="avatar-upload" ...>
 *         <Camera ... />
 *       </label>
 *       <input id="avatar-upload" type="file" ... />
 *     </div>
 *     // ... instructions
 *   </div>
 *   // ... progress indicator
 * </div>
 * ```
 *
 * AFTER (simplified replacement):
 * ```tsx
 * import { AvatarUpload } from '@shared/components';
 *
 * <div>
 *   <label className="mb-3 block text-sm font-medium text-detective-text">
 *     Profile Picture
 *   </label>
 *
 *   <AvatarUpload
 *     userId={user.id}
 *     currentAvatarUrl={profile.avatar}
 *     displayName={profile.displayName}
 *     onUploadComplete={(url) => setProfile({ ...profile, avatar: url })}
 *     size="md"
 *   />
 * </div>
 * ```
 *
 * This removes ~80 lines of code and makes it reusable!
 */
