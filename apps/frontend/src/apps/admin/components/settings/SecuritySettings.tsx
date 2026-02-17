import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { toast } from 'react-hot-toast';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Shield, Lock, Key, AlertCircle } from 'lucide-react';

interface SecuritySettingsForm {
  // Password Policies
  min_password_length: number;
  require_uppercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;

  // Session Settings
  session_timeout_minutes: number;
  max_concurrent_sessions: number;
  force_logout_on_password_change: boolean;

  // Two-Factor Authentication
  require_2fa_admins: boolean;
  require_2fa_teachers: boolean;
  enable_2fa_email: boolean;
  enable_2fa_authenticator: boolean;

  // Login Security
  max_login_attempts: number;
  lockout_duration_minutes: number;
  enable_captcha_after_failed: boolean;
}

/**
 * SecuritySettings Component
 * Manages comprehensive security configuration settings
 *
 * Features:
 * - Password policies (length, complexity requirements)
 * - Session settings (timeout, concurrent sessions, logout on password change)
 * - Two-Factor Authentication (role-based requirements, available methods)
 * - Login security (max attempts, lockout duration, CAPTCHA)
 *
 * Updated: 2025-11-29 - Expanded with 4 security sections
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
      const minPasswordLength =
        typeof config.min_password_length === 'number' ? config.min_password_length : 8;
      const sessionTimeoutMinutes =
        typeof config.session_timeout_minutes === 'number' ? config.session_timeout_minutes : 60;
      const maxConcurrentSessions =
        typeof config.max_concurrent_sessions === 'number' ? config.max_concurrent_sessions : 3;
      const maxLoginAttempts =
        typeof config.max_login_attempts === 'number' ? config.max_login_attempts : 5;
      const lockoutDurationMinutes =
        typeof config.lockout_duration_minutes === 'number' ? config.lockout_duration_minutes : 30;

      reset({
        // Password Policies
        min_password_length: minPasswordLength,
        require_uppercase: Boolean(config.require_uppercase ?? true),
        require_numbers: Boolean(config.require_numbers ?? true),
        require_special_chars: Boolean(config.require_special_chars ?? false),

        // Session Settings
        session_timeout_minutes: sessionTimeoutMinutes,
        max_concurrent_sessions: maxConcurrentSessions,
        force_logout_on_password_change: Boolean(config.force_logout_on_password_change ?? true),

        // Two-Factor Authentication
        require_2fa_admins: Boolean(config.require_2fa_admins ?? false),
        require_2fa_teachers: Boolean(config.require_2fa_teachers ?? false),
        enable_2fa_email: Boolean(config.enable_2fa_email ?? true),
        enable_2fa_authenticator: Boolean(config.enable_2fa_authenticator ?? true),

        // Login Security
        max_login_attempts: maxLoginAttempts,
        lockout_duration_minutes: lockoutDurationMinutes,
        enable_captcha_after_failed: Boolean(config.enable_captcha_after_failed ?? true),
      });
    }
  }, [config, reset]);

  const onSubmit = async (data: SecuritySettingsForm) => {
    try {
      await updateConfig(data as unknown as Record<string, unknown>);
      toast.success('Configuración de seguridad actualizada exitosamente');
    } catch (_error) {
      toast.error('Error al actualizar la configuración de seguridad');
    }
  };

  if (isLoading && !config) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-detective-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Password Policies Section */}
        <DetectiveCard>
          <div className="space-y-4">
            <div className="border-detective-border flex items-center gap-2 border-b pb-3">
              <Lock className="h-5 w-5 text-detective-orange" />
              <h3 className="text-lg font-semibold text-detective-text">
                Políticas de Contraseñas
              </h3>
            </div>

            {/* Minimum Password Length */}
            <div>
              <label
                htmlFor="min_password_length"
                className="mb-2 block text-sm font-medium text-detective-text"
              >
                Longitud mínima de contraseña
              </label>
              <input
                id="min_password_length"
                type="number"
                {...register('min_password_length', {
                  required: 'La longitud mínima es requerida',
                  min: { value: 6, message: 'Debe ser al menos 6 caracteres' },
                  max: { value: 32, message: 'Debe ser máximo 32 caracteres' },
                  valueAsNumber: true,
                })}
                className="border-detective-border bg-detective-card w-full rounded-lg border px-3 py-2 text-detective-text focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20"
              />
              {errors.min_password_length && (
                <p className="mt-1 text-sm text-red-600">{errors.min_password_length.message}</p>
              )}
              <p className="mt-1 text-sm text-detective-text-secondary">
                Número mínimo de caracteres requeridos
              </p>
            </div>

            {/* Require Uppercase */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="require_uppercase"
                  type="checkbox"
                  {...register('require_uppercase')}
                  className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="require_uppercase" className="font-medium text-detective-text">
                  Requerir mayúsculas
                </label>
                <p className="text-sm text-detective-text-secondary">
                  Las contraseñas deben contener al menos una letra mayúscula
                </p>
              </div>
            </div>

            {/* Require Numbers */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="require_numbers"
                  type="checkbox"
                  {...register('require_numbers')}
                  className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="require_numbers" className="font-medium text-detective-text">
                  Requerir números
                </label>
                <p className="text-sm text-detective-text-secondary">
                  Las contraseñas deben contener al menos un número
                </p>
              </div>
            </div>

            {/* Require Special Characters */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="require_special_chars"
                  type="checkbox"
                  {...register('require_special_chars')}
                  className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="require_special_chars" className="font-medium text-detective-text">
                  Requerir caracteres especiales
                </label>
                <p className="text-sm text-detective-text-secondary">
                  Las contraseñas deben contener al menos un carácter especial (!@#$%^&*)
                </p>
              </div>
            </div>
          </div>
        </DetectiveCard>

        {/* Session Settings Section */}
        <DetectiveCard>
          <div className="space-y-4">
            <div className="border-detective-border flex items-center gap-2 border-b pb-3">
              <Key className="h-5 w-5 text-detective-orange" />
              <h3 className="text-lg font-semibold text-detective-text">
                Configuración de Sesiones
              </h3>
            </div>

            {/* Session Timeout */}
            <div>
              <label
                htmlFor="session_timeout_minutes"
                className="mb-2 block text-sm font-medium text-detective-text"
              >
                Tiempo de espera de sesión
              </label>
              <select
                id="session_timeout_minutes"
                {...register('session_timeout_minutes', {
                  required: 'El tiempo de espera es requerido',
                  valueAsNumber: true,
                })}
                className="border-detective-border bg-detective-card w-full rounded-lg border px-3 py-2 text-detective-text focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={240}>4 horas</option>
                <option value={480}>8 horas</option>
              </select>
              {errors.session_timeout_minutes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.session_timeout_minutes.message}
                </p>
              )}
              <p className="mt-1 text-sm text-detective-text-secondary">
                Período de inactividad antes de cerrar sesión automáticamente
              </p>
            </div>

            {/* Max Concurrent Sessions */}
            <div>
              <label
                htmlFor="max_concurrent_sessions"
                className="mb-2 block text-sm font-medium text-detective-text"
              >
                Máximo de sesiones concurrentes
              </label>
              <input
                id="max_concurrent_sessions"
                type="number"
                {...register('max_concurrent_sessions', {
                  required: 'El máximo de sesiones es requerido',
                  min: { value: 1, message: 'Debe ser al menos 1 sesión' },
                  max: { value: 10, message: 'Debe ser máximo 10 sesiones' },
                  valueAsNumber: true,
                })}
                className="border-detective-border bg-detective-card w-full rounded-lg border px-3 py-2 text-detective-text focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20"
              />
              {errors.max_concurrent_sessions && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.max_concurrent_sessions.message}
                </p>
              )}
              <p className="mt-1 text-sm text-detective-text-secondary">
                Número máximo de sesiones activas simultáneas por usuario
              </p>
            </div>

            {/* Force Logout on Password Change */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="force_logout_on_password_change"
                  type="checkbox"
                  {...register('force_logout_on_password_change')}
                  className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="force_logout_on_password_change"
                  className="font-medium text-detective-text"
                >
                  Forzar cierre de sesión al cambiar contraseña
                </label>
                <p className="text-sm text-detective-text-secondary">
                  Cerrar todas las sesiones activas cuando el usuario cambie su contraseña
                </p>
              </div>
            </div>
          </div>
        </DetectiveCard>

        {/* Two-Factor Authentication Section */}
        <DetectiveCard>
          <div className="space-y-4">
            <div className="border-detective-border flex items-center gap-2 border-b pb-3">
              <Shield className="h-5 w-5 text-detective-orange" />
              <h3 className="text-lg font-semibold text-detective-text">
                Autenticación de Dos Factores (2FA)
              </h3>
            </div>

            {/* Require 2FA for Admins */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="require_2fa_admins"
                  type="checkbox"
                  {...register('require_2fa_admins')}
                  className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="require_2fa_admins" className="font-medium text-detective-text">
                  Requerir 2FA para administradores
                </label>
                <p className="text-sm text-detective-text-secondary">
                  Los usuarios con rol de administrador deben configurar 2FA
                </p>
              </div>
            </div>

            {/* Require 2FA for Teachers */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="require_2fa_teachers"
                  type="checkbox"
                  {...register('require_2fa_teachers')}
                  className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="require_2fa_teachers" className="font-medium text-detective-text">
                  Requerir 2FA para profesores
                </label>
                <p className="text-sm text-detective-text-secondary">
                  Los usuarios con rol de profesor deben configurar 2FA
                </p>
              </div>
            </div>

            <div className="border-detective-border border-t pt-3">
              <p className="mb-2 text-sm font-medium text-detective-text">
                Métodos de 2FA disponibles
              </p>
              <p className="mb-3 text-xs text-detective-text-secondary">
                Selecciona los métodos de autenticación de dos factores que los usuarios pueden usar
              </p>

              {/* Enable 2FA Email */}
              <div className="mb-3 flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="enable_2fa_email"
                    type="checkbox"
                    {...register('enable_2fa_email')}
                    className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="enable_2fa_email" className="font-medium text-detective-text">
                    Email
                  </label>
                  <p className="text-sm text-detective-text-secondary">
                    Enviar códigos de verificación por correo electrónico
                  </p>
                </div>
              </div>

              {/* Enable 2FA Authenticator */}
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="enable_2fa_authenticator"
                    type="checkbox"
                    {...register('enable_2fa_authenticator')}
                    className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                  />
                </div>
                <div className="ml-3">
                  <label
                    htmlFor="enable_2fa_authenticator"
                    className="font-medium text-detective-text"
                  >
                    Aplicación de autenticación
                  </label>
                  <p className="text-sm text-detective-text-secondary">
                    Usar apps como Google Authenticator o Authy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DetectiveCard>

        {/* Login Security Section */}
        <DetectiveCard>
          <div className="space-y-4">
            <div className="border-detective-border flex items-center gap-2 border-b pb-3">
              <AlertCircle className="h-5 w-5 text-detective-orange" />
              <h3 className="text-lg font-semibold text-detective-text">
                Seguridad de Inicio de Sesión
              </h3>
            </div>

            {/* Max Login Attempts */}
            <div>
              <label
                htmlFor="max_login_attempts"
                className="mb-2 block text-sm font-medium text-detective-text"
              >
                Máximo de intentos de inicio de sesión
              </label>
              <input
                id="max_login_attempts"
                type="number"
                {...register('max_login_attempts', {
                  required: 'El máximo de intentos es requerido',
                  min: { value: 3, message: 'Debe ser al menos 3 intentos' },
                  max: { value: 10, message: 'Debe ser máximo 10 intentos' },
                  valueAsNumber: true,
                })}
                className="border-detective-border bg-detective-card w-full rounded-lg border px-3 py-2 text-detective-text focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20"
              />
              {errors.max_login_attempts && (
                <p className="mt-1 text-sm text-red-600">{errors.max_login_attempts.message}</p>
              )}
              <p className="mt-1 text-sm text-detective-text-secondary">
                Número de intentos fallidos antes de bloquear la cuenta
              </p>
            </div>

            {/* Lockout Duration */}
            <div>
              <label
                htmlFor="lockout_duration_minutes"
                className="mb-2 block text-sm font-medium text-detective-text"
              >
                Duración del bloqueo de cuenta
              </label>
              <select
                id="lockout_duration_minutes"
                {...register('lockout_duration_minutes', {
                  required: 'La duración del bloqueo es requerida',
                  valueAsNumber: true,
                })}
                className="border-detective-border bg-detective-card w-full rounded-lg border px-3 py-2 text-detective-text focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20"
              >
                <option value={5}>5 minutos</option>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
              </select>
              {errors.lockout_duration_minutes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lockout_duration_minutes.message}
                </p>
              )}
              <p className="mt-1 text-sm text-detective-text-secondary">
                Tiempo que la cuenta permanecerá bloqueada después de exceder los intentos
              </p>
            </div>

            {/* Enable CAPTCHA */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="enable_captcha_after_failed"
                  type="checkbox"
                  {...register('enable_captcha_after_failed')}
                  className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="enable_captcha_after_failed"
                  className="font-medium text-detective-text"
                >
                  Habilitar CAPTCHA después de intentos fallidos
                </label>
                <p className="text-sm text-detective-text-secondary">
                  Mostrar CAPTCHA después de múltiples intentos fallidos para prevenir ataques de
                  fuerza bruta
                </p>
              </div>
            </div>

            {/* Security Best Practices */}
            <div className="rounded-lg border border-detective-orange/30 bg-detective-orange/10 p-4">
              <h4 className="mb-2 text-sm font-semibold text-detective-text">
                Mejores Prácticas de Seguridad
              </h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-detective-text-secondary">
                <li>Mantén los intentos de inicio de sesión entre 3-5 para seguridad óptima</li>
                <li>Establece la duración del bloqueo en al menos 15-30 minutos</li>
                <li>
                  El tiempo de espera de sesión debe balancear seguridad y experiencia de usuario
                </li>
                <li>
                  Revisa los registros de autenticación regularmente para detectar actividad
                  sospechosa
                </li>
                <li>Habilita 2FA para todos los roles administrativos</li>
              </ul>
            </div>
          </div>
        </DetectiveCard>

        {/* Actions */}
        <DetectiveCard>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={!isDirty || isLoading}
              className="disabled:bg-detective-border rounded-lg bg-detective-orange px-6 py-2 text-white transition-colors hover:bg-detective-orange/90 disabled:cursor-not-allowed disabled:text-detective-text-secondary"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              disabled={!isDirty || isLoading}
              className="border-detective-border bg-detective-card hover:bg-detective-border/50 rounded-lg border px-6 py-2 text-detective-text transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Restablecer
            </button>
            {isDirty && (
              <p className="text-sm text-detective-text-secondary">Tienes cambios sin guardar</p>
            )}
          </div>
        </DetectiveCard>
      </form>
    </div>
  );
};
