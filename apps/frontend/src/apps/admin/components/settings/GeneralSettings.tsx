import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { toast } from 'react-hot-toast';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Settings, AlertCircle } from 'lucide-react';

interface GeneralSettingsForm {
  allow_registrations: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
}

/**
 * GeneralSettings Component
 * Manages general system configuration settings
 *
 * Updated: 2025-11-29 - Applied detective theme consistency
 */
export const GeneralSettings = () => {
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
      const allowRegistrations = Boolean(config.allow_registrations);
      const maintenanceMode = Boolean(config.maintenance_mode);
      const maintenanceMessage =
        typeof config.maintenance_message === 'string'
          ? config.maintenance_message
          : 'Sistema en mantenimiento';

      reset({
        allow_registrations: allowRegistrations,
        maintenance_mode: maintenanceMode,
        maintenance_message: maintenanceMessage,
      });
    }
  }, [config, reset]);

  const onSubmit = async (data: GeneralSettingsForm) => {
    try {
      await updateConfig(data as unknown as Record<string, unknown>);
      toast.success('Configuración general actualizada exitosamente');
    } catch (_error) {
      toast.error('Error al actualizar la configuración general');
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
        {/* General Configuration Section */}
        <DetectiveCard>
          <div className="space-y-4">
            <div className="border-detective-border flex items-center gap-2 border-b pb-3">
              <Settings className="h-5 w-5 text-detective-orange" />
              <h3 className="text-lg font-semibold text-detective-text">Configuración General</h3>
            </div>

            {/* Allow Registrations */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="allow_registrations"
                  type="checkbox"
                  {...register('allow_registrations')}
                  className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="allow_registrations" className="font-medium text-detective-text">
                  Permitir registro de usuarios
                </label>
                <p className="text-sm text-detective-text-secondary">
                  Cuando está habilitado, nuevos usuarios pueden registrarse en la plataforma
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
                  className="border-detective-border bg-detective-card h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="maintenance_mode" className="font-medium text-detective-text">
                  Modo de mantenimiento
                </label>
                <p className="text-sm text-detective-text-secondary">
                  Cuando está habilitado, solo los administradores pueden acceder a la plataforma
                </p>
              </div>
            </div>

            {/* Maintenance Message */}
            <div>
              <label
                htmlFor="maintenance_message"
                className="mb-2 block text-sm font-medium text-detective-text"
              >
                Mensaje de mantenimiento
              </label>
              <textarea
                id="maintenance_message"
                {...register('maintenance_message', {
                  required: 'El mensaje de mantenimiento es requerido',
                  minLength: { value: 10, message: 'El mensaje debe tener al menos 10 caracteres' },
                })}
                rows={3}
                className="border-detective-border bg-detective-card w-full rounded-lg border px-3 py-2 text-detective-text focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20"
                placeholder="Ingresa el mensaje a mostrar durante el mantenimiento..."
              />
              {errors.maintenance_message && (
                <p className="mt-1 text-sm text-red-600">{errors.maintenance_message.message}</p>
              )}
              <p className="mt-1 text-sm text-detective-text-secondary">
                Este mensaje se mostrará a los usuarios cuando el modo de mantenimiento esté
                activado
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-detective-orange/30 bg-detective-orange/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-detective-orange" />
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-detective-text">Importante</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-detective-text-secondary">
                    <li>
                      El modo de mantenimiento bloqueará el acceso a todos los usuarios excepto
                      administradores
                    </li>
                    <li>Asegúrate de configurar un mensaje claro para informar a los usuarios</li>
                    <li>
                      Desactiva el registro de usuarios si quieres limitar el crecimiento durante
                      períodos específicos
                    </li>
                  </ul>
                </div>
              </div>
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
