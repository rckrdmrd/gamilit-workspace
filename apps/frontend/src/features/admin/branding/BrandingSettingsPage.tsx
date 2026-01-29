/**
 * BrandingSettingsPage for EXT-008 White Label System
 *
 * Admin page for managing tenant branding configuration including:
 * - Logo upload
 * - Favicon upload
 * - Color customization
 * - Platform name
 * - Live preview
 *
 * @module features/admin/branding/BrandingSettingsPage
 * @see ET-WL-001-theming.md
 * @see IMPLEMENTATION-CHECKLIST.md TASK-WL-011
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useBranding } from '@/app/providers/BrandingProvider';
import { AdminLayout } from '@/apps/admin/layouts/AdminLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { brandingApi } from '@/lib/api/branding.api';
import {
  ColorPicker,
  LogoUploader,
  FaviconUploader,
  ThemePreview,
} from './components';
import {
  Palette,
  Image,
  Eye,
  Save,
  RotateCcw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

/**
 * Form data type for branding settings
 */
interface BrandingFormData {
  platformName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * BrandingSettingsPage Component
 *
 * Full-page admin interface for branding customization.
 * Provides real-time preview of changes before saving.
 *
 * Features:
 * - Logo upload with preview
 * - Favicon upload with preview
 * - Color pickers with presets
 * - Platform name editor
 * - Live preview panel
 * - Save/Reset actions
 */
export default function BrandingSettingsPage() {
  const { user, logout } = useAuth();
  const { config, isLoading: brandingLoading, previewBranding, resetPreview, refreshBranding } = useBranding();

  // Local state
  const [isSaving, setIsSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  // Gamification data for layout
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: gamificationLoading ? 0 : 1,
    totalXP: 0,
    mlCoins: 0,
    rank: gamificationLoading ? 'Loading...' : 'Ajaw',
    rankColor: '#9E9E9E',
    progressToNextLevel: 0,
    xpToNextLevel: 100,
    achievements: [],
    totalAchievements: 0,
  };

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BrandingFormData>({
    defaultValues: {
      platformName: config?.platformName || 'GAMILIT Platform',
      primaryColor: config?.primaryColor || '#f97316',
      secondaryColor: config?.secondaryColor || '#ea580c',
      accentColor: config?.accentColor || '#f59e0b',
    },
  });

  // Watch form values for preview
  const watchedValues = watch();

  // Reset form when config loads
  useEffect(() => {
    if (config) {
      reset({
        platformName: config.platformName,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        accentColor: config.accentColor || '#f59e0b',
      });
    }
  }, [config, reset]);

  // Update preview when form values change
  useEffect(() => {
    if (isDirty) {
      previewBranding({
        platformName: watchedValues.platformName,
        primaryColor: watchedValues.primaryColor,
        secondaryColor: watchedValues.secondaryColor,
        accentColor: watchedValues.accentColor,
      });
    }
  }, [watchedValues, isDirty, previewBranding]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: BrandingFormData) => {
    const tenantId = user?.tenantId || user?.tenant_id;
    if (!tenantId) {
      toast.error('No tenant ID available');
      return;
    }

    setIsSaving(true);
    try {
      await brandingApi.updateBranding(tenantId, {
        platformName: data.platformName,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
      });

      await refreshBranding();
      toast.success('Branding settings saved successfully');
    } catch (error) {
      console.error('Failed to save branding:', error);
      toast.error('Failed to save branding settings');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle reset to saved values
   */
  const handleReset = () => {
    if (config) {
      reset({
        platformName: config.platformName,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        accentColor: config.accentColor || '#f59e0b',
      });
      resetPreview();
      toast('Changes reverted', { icon: '↩️' });
    }
  };

  /**
   * Handle logo upload
   */
  const handleLogoUpload = async (file: File) => {
    const tenantId = user?.tenantId || user?.tenant_id;
    if (!tenantId) return;

    setLogoUploading(true);
    try {
      await brandingApi.uploadLogo(tenantId, file);
      await refreshBranding();
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Logo upload failed:', error);
      toast.error('Failed to upload logo');
      throw error;
    } finally {
      setLogoUploading(false);
    }
  };

  /**
   * Handle logo removal
   */
  const handleLogoRemove = async () => {
    const tenantId = user?.tenantId || user?.tenant_id;
    if (!tenantId) return;

    try {
      await brandingApi.deleteLogo(tenantId);
      await refreshBranding();
      toast.success('Logo removed');
    } catch (error) {
      console.error('Logo removal failed:', error);
      toast.error('Failed to remove logo');
      throw error;
    }
  };

  /**
   * Handle favicon upload
   */
  const handleFaviconUpload = async (file: File) => {
    const tenantId = user?.tenantId || user?.tenant_id;
    if (!tenantId) return;

    setFaviconUploading(true);
    try {
      await brandingApi.uploadFavicon(tenantId, file);
      await refreshBranding();
      toast.success('Favicon uploaded successfully');
    } catch (error) {
      console.error('Favicon upload failed:', error);
      toast.error('Failed to upload favicon');
      throw error;
    } finally {
      setFaviconUploading(false);
    }
  };

  /**
   * Handle favicon removal
   */
  const handleFaviconRemove = async () => {
    const tenantId = user?.tenantId || user?.tenant_id;
    if (!tenantId) return;

    try {
      await brandingApi.deleteFavicon(tenantId);
      await refreshBranding();
      toast.success('Favicon removed');
    } catch (error) {
      console.error('Favicon removal failed:', error);
      toast.error('Failed to remove favicon');
      throw error;
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Show loading state
  if (brandingLoading && !config) {
    return (
      <AdminLayout
        user={user || undefined}
        gamificationData={displayGamificationData}
        organizationName="GAMILIT Platform Admin"
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-detective-orange" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-detective-text">Branding Settings</h1>
          <p className="mt-1 text-detective-text-secondary">
            Customize your platform&apos;s appearance with your own logo, colors, and branding
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Settings */}
            <div className="space-y-6 lg:col-span-2">
              {/* Platform Name Section */}
              <DetectiveCard>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-detective-border pb-3">
                    <Palette className="h-5 w-5 text-detective-orange" />
                    <h3 className="text-lg font-semibold text-detective-text">Platform Identity</h3>
                  </div>

                  <div>
                    <label
                      htmlFor="platformName"
                      className="mb-2 block text-sm font-medium text-detective-text"
                    >
                      Platform Name
                    </label>
                    <input
                      id="platformName"
                      type="text"
                      {...register('platformName', {
                        required: 'Platform name is required',
                        maxLength: { value: 100, message: 'Maximum 100 characters' },
                      })}
                      className="w-full rounded-lg border border-detective-border bg-detective-card px-3 py-2 text-detective-text focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20"
                      placeholder="Enter platform name"
                    />
                    {errors.platformName && (
                      <p className="mt-1 text-sm text-red-500">{errors.platformName.message}</p>
                    )}
                    <p className="mt-1 text-sm text-detective-text-secondary">
                      This name will appear in the browser title and header
                    </p>
                  </div>
                </div>
              </DetectiveCard>

              {/* Colors Section */}
              <DetectiveCard>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-detective-border pb-3">
                    <Palette className="h-5 w-5 text-detective-orange" />
                    <h3 className="text-lg font-semibold text-detective-text">Brand Colors</h3>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <ColorPicker
                      label="Primary Color"
                      value={watchedValues.primaryColor}
                      onChange={(color) => setValue('primaryColor', color, { shouldDirty: true })}
                      description="Main color for buttons, links, and highlights"
                    />

                    <ColorPicker
                      label="Secondary Color"
                      value={watchedValues.secondaryColor}
                      onChange={(color) => setValue('secondaryColor', color, { shouldDirty: true })}
                      description="Secondary color for accents and gradients"
                    />

                    <ColorPicker
                      label="Accent Color"
                      value={watchedValues.accentColor}
                      onChange={(color) => setValue('accentColor', color, { shouldDirty: true })}
                      description="Additional accent color for badges and highlights"
                    />
                  </div>
                </div>
              </DetectiveCard>

              {/* Logo & Favicon Section */}
              <DetectiveCard>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-detective-border pb-3">
                    <Image className="h-5 w-5 text-detective-orange" />
                    <h3 className="text-lg font-semibold text-detective-text">Logo & Favicon</h3>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <LogoUploader
                      label="Platform Logo"
                      currentLogoUrl={config?.logoUrl}
                      onUpload={handleLogoUpload}
                      onRemove={handleLogoRemove}
                      disabled={logoUploading}
                      description="Appears in the header navigation"
                      dimensions="Recommended: 200x50 pixels, PNG or SVG"
                    />

                    <FaviconUploader
                      label="Favicon"
                      currentFaviconUrl={config?.faviconUrl}
                      onUpload={handleFaviconUpload}
                      onRemove={handleFaviconRemove}
                      disabled={faviconUploading}
                      description="Appears in browser tabs"
                    />
                  </div>
                </div>
              </DetectiveCard>

              {/* Info Box */}
              <DetectiveCard className="border-detective-orange/30 bg-detective-orange/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-detective-orange" />
                  <div>
                    <h3 className="text-sm font-medium text-detective-text">
                      About Branding Changes
                    </h3>
                    <p className="mt-1 text-sm text-detective-text-secondary">
                      Branding changes apply immediately after saving. Users will see the new
                      branding on their next page load. Logo and favicon uploads are processed
                      and optimized automatically.
                    </p>
                  </div>
                </div>
              </DetectiveCard>

              {/* Actions */}
              <DetectiveCard>
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={!isDirty || isSaving}
                    className="flex items-center gap-2 rounded-lg bg-detective-orange px-6 py-2 text-white transition-colors hover:bg-detective-orange/90 disabled:cursor-not-allowed disabled:bg-detective-border disabled:text-detective-text-secondary"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!isDirty || isSaving}
                    className="flex items-center gap-2 rounded-lg border border-detective-border bg-detective-card px-6 py-2 text-detective-text transition-colors hover:bg-detective-border/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                  {isDirty && (
                    <p className="text-sm text-detective-text-secondary">
                      You have unsaved changes
                    </p>
                  )}
                </div>
              </DetectiveCard>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <DetectiveCard>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-detective-border pb-3">
                      <Eye className="h-5 w-5 text-detective-orange" />
                      <h3 className="text-lg font-semibold text-detective-text">Live Preview</h3>
                    </div>

                    <ThemePreview
                      platformName={watchedValues.platformName}
                      logoUrl={config?.logoUrl}
                      primaryColor={watchedValues.primaryColor}
                      secondaryColor={watchedValues.secondaryColor}
                      accentColor={watchedValues.accentColor}
                    />

                    <p className="text-xs text-detective-text-secondary">
                      This preview shows how your branding will appear in the application.
                      Changes are applied in real-time.
                    </p>
                  </div>
                </DetectiveCard>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
