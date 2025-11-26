import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { toast } from 'react-hot-toast';

interface GeneralSettingsForm {
  allow_registrations: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
}

/**
 * GeneralSettings Component
 * Manages general system configuration settings
 */
export const GeneralSettings: React.FC = () => {
  const { config, isLoading, fetchConfig, updateConfig } = useSystemConfig('general');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<GeneralSettingsForm>();

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Reset form when config loads
  useEffect(() => {
    if (config) {
      reset({
        allow_registrations: config.allow_registrations ?? true,
        maintenance_mode: config.maintenance_mode ?? false,
        maintenance_message: config.maintenance_message || 'System under maintenance',
      });
    }
  }, [config, reset]);

  const onSubmit = async (data: GeneralSettingsForm) => {
    try {
      await updateConfig(data);
      toast.success('General settings updated successfully');
    } catch (error) {
      toast.error('Failed to update general settings');
    }
  };

  if (isLoading && !config) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">General Configuration</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Allow Registrations */}
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="allow_registrations"
              type="checkbox"
              {...register('allow_registrations')}
              className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="allow_registrations" className="font-medium text-gray-900">
              Allow User Registrations
            </label>
            <p className="text-sm text-gray-500">
              When enabled, new users can register themselves on the platform
            </p>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="maintenance_mode"
              type="checkbox"
              {...register('maintenance_mode')}
              className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="maintenance_mode" className="font-medium text-gray-900">
              Maintenance Mode
            </label>
            <p className="text-sm text-gray-500">
              When enabled, only administrators can access the platform
            </p>
          </div>
        </div>

        {/* Maintenance Message */}
        <div>
          <label
            htmlFor="maintenance_message"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Maintenance Message
          </label>
          <textarea
            id="maintenance_message"
            {...register('maintenance_message', {
              required: 'Maintenance message is required',
              minLength: { value: 10, message: 'Message must be at least 10 characters' },
            })}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the message to display during maintenance..."
          />
          {errors.maintenance_message && (
            <p className="mt-1 text-sm text-red-600">{errors.maintenance_message.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            This message will be displayed to users when maintenance mode is enabled
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 border-t pt-4">
          <button
            type="submit"
            disabled={!isDirty || isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            disabled={!isDirty || isLoading}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};
