import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { toast } from 'react-hot-toast';

interface SecuritySettingsForm {
  max_login_attempts: number;
  lockout_duration_minutes: number;
  session_timeout_minutes: number;
}

/**
 * SecuritySettings Component
 * Manages security configuration settings
 */
export const SecuritySettings: React.FC = () => {
  const { config, isLoading, fetchConfig, updateConfig } = useSystemConfig('security');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SecuritySettingsForm>();

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Reset form when config loads
  useEffect(() => {
    if (config) {
      reset({
        max_login_attempts: config.max_login_attempts ?? 5,
        lockout_duration_minutes: config.lockout_duration_minutes ?? 30,
        session_timeout_minutes: config.session_timeout_minutes ?? 60,
      });
    }
  }, [config, reset]);

  const onSubmit = async (data: SecuritySettingsForm) => {
    try {
      await updateConfig(data);
      toast.success('Security settings updated successfully');
    } catch (error) {
      toast.error('Failed to update security settings');
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
      <h3 className="mb-6 text-lg font-semibold">Security Configuration</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Max Login Attempts */}
        <div>
          <label
            htmlFor="max_login_attempts"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Maximum Login Attempts
          </label>
          <input
            id="max_login_attempts"
            type="number"
            {...register('max_login_attempts', {
              required: 'Maximum login attempts is required',
              min: { value: 3, message: 'Must be at least 3 attempts' },
              max: { value: 10, message: 'Must be at most 10 attempts' },
              valueAsNumber: true,
            })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          {errors.max_login_attempts && (
            <p className="mt-1 text-sm text-red-600">{errors.max_login_attempts.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Number of failed login attempts before account lockout
          </p>
        </div>

        {/* Lockout Duration */}
        <div>
          <label
            htmlFor="lockout_duration_minutes"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Lockout Duration (minutes)
          </label>
          <input
            id="lockout_duration_minutes"
            type="number"
            {...register('lockout_duration_minutes', {
              required: 'Lockout duration is required',
              min: { value: 5, message: 'Must be at least 5 minutes' },
              max: { value: 1440, message: 'Must be at most 24 hours (1440 minutes)' },
              valueAsNumber: true,
            })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          {errors.lockout_duration_minutes && (
            <p className="mt-1 text-sm text-red-600">{errors.lockout_duration_minutes.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Duration for which a user is locked out after exceeding login attempts
          </p>
        </div>

        {/* Session Timeout */}
        <div>
          <label
            htmlFor="session_timeout_minutes"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Session Timeout (minutes)
          </label>
          <input
            id="session_timeout_minutes"
            type="number"
            {...register('session_timeout_minutes', {
              required: 'Session timeout is required',
              min: { value: 15, message: 'Must be at least 15 minutes' },
              max: { value: 1440, message: 'Must be at most 24 hours (1440 minutes)' },
              valueAsNumber: true,
            })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          {errors.session_timeout_minutes && (
            <p className="mt-1 text-sm text-red-600">{errors.session_timeout_minutes.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Inactivity period after which users will be automatically logged out
          </p>
        </div>

        {/* Security Tips */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">Security Best Practices</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
            <li>Keep max login attempts between 3-5 for optimal security</li>
            <li>Set lockout duration to at least 15-30 minutes</li>
            <li>Session timeout should balance security and user experience</li>
            <li>Review authentication logs regularly for suspicious activity</li>
          </ul>
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
