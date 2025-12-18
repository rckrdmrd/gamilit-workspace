/**
 * FeatureFlagEditor Component
 *
 * Modal for creating and editing feature flags.
 * Features:
 * - Form fields: key, name, description, isEnabled
 * - RolloutSlider for percentage control
 * - TargetingConfig for role selection
 * - Validation and error handling
 *
 * Created: 2025-12-05 - FE-ADMIN-011-016 (Sprint P2-B)
 */

import React, { useState, useEffect } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { X, Save, Flag } from 'lucide-react';
import { RolloutSlider } from './RolloutSlider';
import { TargetingConfig } from './TargetingConfig';
import type { FeatureFlag, CreateFlagDto, UpdateFlagDto } from '../../types';

interface FeatureFlagEditorProps {
  flag?: FeatureFlag | null;
  onSave: (data: CreateFlagDto | UpdateFlagDto) => Promise<void>;
  onClose: () => void;
}

export const FeatureFlagEditor: React.FC<FeatureFlagEditorProps> = ({ flag, onSave, onClose }) => {
  const isEditMode = !!flag;

  const [formData, setFormData] = useState({
    key: flag?.key || '',
    name: flag?.name || '',
    description: flag?.description || '',
    isEnabled: flag?.isEnabled ?? false,
    rolloutPercentage: flag?.rolloutPercentage ?? 0,
    targetRoles: flag?.targetRoles || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Reset form when flag changes
  useEffect(() => {
    if (flag) {
      setFormData({
        key: flag.key,
        name: flag.name,
        description: flag.description,
        isEnabled: flag.isEnabled,
        rolloutPercentage: flag.rolloutPercentage,
        targetRoles: flag.targetRoles,
      });
    }
  }, [flag]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Key must contain only lowercase letters, numbers, and underscores';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        // For update, exclude the key
        const { key: _, ...updateData } = formData;
        await onSave(updateData);
      } else {
        // For create, include all fields
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save feature flag:', error);
      setErrors({ submit: 'Failed to save feature flag. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <DetectiveCard className="w-full max-w-2xl border-2 border-detective-orange">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flag className="h-6 w-6 text-detective-orange" />
            <h2 className="text-2xl font-bold text-detective-text">
              {isEditMode ? 'Edit Feature Flag' : 'Create Feature Flag'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-detective-bg-secondary hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Key Field */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-400">
              Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              disabled={isEditMode} // Key cannot be changed in edit mode
              className={`input-detective font-mono ${isEditMode ? 'cursor-not-allowed opacity-60' : ''}`}
              placeholder="feature_key_name"
            />
            {errors.key && <p className="mt-1 text-xs text-red-500">{errors.key}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Unique identifier (lowercase, numbers, underscores only)
            </p>
          </div>

          {/* Name Field */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-400">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-detective"
              placeholder="Feature Display Name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Description Field */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-400">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-detective"
              rows={3}
              placeholder="Describe what this feature does and when to enable it..."
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                className="h-5 w-5 cursor-pointer rounded border-2 border-gray-500 bg-transparent text-detective-orange focus:ring-2 focus:ring-detective-orange"
              />
              <div>
                <span className="text-sm font-semibold text-detective-text">Enable Feature Flag</span>
                <p className="text-xs text-gray-400">
                  When enabled, feature will be available based on rollout percentage and targeting
                </p>
              </div>
            </label>
          </div>

          {/* Rollout Slider */}
          <RolloutSlider
            value={formData.rolloutPercentage}
            onChange={(value) => setFormData({ ...formData, rolloutPercentage: value })}
          />

          {/* Targeting Config */}
          <TargetingConfig
            targetRoles={formData.targetRoles}
            onChange={(roles) => setFormData({ ...formData, targetRoles: roles })}
          />

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <DetectiveButton
              type="submit"
              variant="green"
              icon={<Save className="h-4 w-4" />}
              disabled={saving}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Flag' : 'Create Flag'}
            </DetectiveButton>
            <DetectiveButton type="button" variant="primary" onClick={onClose} disabled={saving}>
              Cancel
            </DetectiveButton>
          </div>
        </form>
      </DetectiveCard>
    </div>
  );
};
