import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Construction, CheckCircle, ArrowLeft } from 'lucide-react';

interface UnderConstructionProps {
  /**
   * Título de la funcionalidad en construcción
   */
  title?: string;

  /**
   * Descripción de qué hará esta funcionalidad
   */
  description?: string;

  /**
   * Descripción o mensaje adicional (legacy prop, replaced by description)
   */
  message?: string;

  /**
   * Estimación de disponibilidad (ej: "Q1 2026", "Próximamente")
   */
  estimatedDate?: string;

  /**
   * Features planeadas (lista de bullets)
   */
  features?: string[];

  /**
   * Lista de características que están disponibles (legacy prop)
   */
  availableFeatures?: string[];

  /**
   * Lista de características que están en desarrollo (legacy prop)
   */
  upcomingFeatures?: string[];

  /**
   * Mostrar botón de "Volver al Dashboard"
   */
  showBackButton?: boolean;

  /**
   * Callback al hacer click en "Volver"
   */
  onBack?: () => void;

  /**
   * Variante visual
   */
  variant?: 'full-page' | 'section' | 'card' | 'page' | 'banner';

  /**
   * Icono personalizado (lucide-react icon name)
   */
  icon?: string;
}

/**
 * UnderConstruction Component
 *
 * Componente reutilizable para mostrar mensaje de "En construcción"
 * en páginas o secciones que no están completamente implementadas.
 *
 * @example
 * // Página completa en construcción
 * <UnderConstruction
 *   title="Gestión de Usuarios"
 *   description="Sistema completo de CRUD para administrar usuarios, roles y permisos"
 *   estimatedDate="Próximamente"
 *   features={["Crear usuarios", "Editar usuarios"]}
 *   showBackButton
 *   variant="full-page"
 *   icon="Users"
 * />
 *
 * @example
 * // Banner con características disponibles/pendientes
 * <UnderConstruction
 *   variant="banner"
 *   title="Integración en Desarrollo"
 *   availableFeatures={["Ver usuarios", "Filtrar por rol"]}
 *   upcomingFeatures={["Crear usuario", "Editar usuario"]}
 * />
 */
export const UnderConstruction = ({
  title = 'En Construcción',
  description,
  message,
  estimatedDate,
  features,
  availableFeatures,
  upcomingFeatures,
  showBackButton = false,
  onBack,
  variant = 'page',
  icon,
}: UnderConstructionProps) => {
  const navigate = useNavigate();

  // Support both new and legacy props
  const displayDescription =
    description ||
    message ||
    'Esta funcionalidad está en desarrollo y estará disponible próximamente.';
  const displayFeatures = features || upcomingFeatures;

  // Get the icon component
  const getIcon = (): ComponentType<{ className?: string }> => {
    if (icon && icon in Icons) {
      const IconComponent = Icons[icon as keyof typeof Icons] as ComponentType<{
        className?: string;
      }>;
      return IconComponent;
    }
    return Construction;
  };

  const IconComponent = getIcon();

  // Handle back button click
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/admin/dashboard');
    }
  };

  // Banner variant - maintains backward compatibility
  if (variant === 'banner') {
    return (
      <div className="mb-6 rounded-lg border-l-4 border-detective-orange bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4">
        <div className="flex items-start gap-3">
          <Construction className="mt-0.5 h-5 w-5 flex-shrink-0 text-detective-orange" />
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold text-detective-text">{title}</h3>
            <p className="mb-3 text-sm text-detective-text-secondary">{displayDescription}</p>

            {(availableFeatures || displayFeatures) && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {availableFeatures && availableFeatures.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      Disponible
                    </h4>
                    <ul className="space-y-1">
                      {availableFeatures.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-detective-text-secondary"
                        >
                          <span className="mt-0.5 text-green-400">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {displayFeatures && displayFeatures.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-400">
                      <Construction className="h-4 w-4" />
                      En Desarrollo
                    </h4>
                    <ul className="space-y-1">
                      {displayFeatures.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-detective-text-secondary"
                        >
                          <span className="mt-0.5 text-yellow-400">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant - compact format for features within pages
  if (variant === 'card') {
    return (
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
              <IconComponent className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{displayDescription}</p>
            {displayFeatures && displayFeatures.length > 0 && (
              <div className="space-y-1">
                <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Funcionalidades planeadas:
                </p>
                <ul className="space-y-1">
                  {displayFeatures.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="mt-0.5 text-yellow-600 dark:text-yellow-500">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {estimatedDate && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Disponibilidad estimada: <span className="font-semibold">{estimatedDate}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Section variant - for sections within a page
  if (variant === 'section') {
    return (
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-md dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <IconComponent className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
          </div>

          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>

          <p className="mb-6 text-base text-gray-600 dark:text-gray-400">{displayDescription}</p>

          {displayFeatures && displayFeatures.length > 0 && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 text-left dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Construction className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                Funcionalidades Planeadas
              </h3>
              <ul className="space-y-2">
                {displayFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="mt-1 text-yellow-600 dark:text-yellow-500">⏳</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {estimatedDate && (
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-500">
              Disponibilidad estimada:{' '}
              <span className="font-semibold text-detective-orange">{estimatedDate}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full-page variant (default) - Improved design
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-10 shadow-xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="mb-6 inline-flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <IconComponent className="h-10 w-10 text-detective-orange" />
          </div>

          <h1 className="mb-3 text-4xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          <p className="mb-2 text-lg text-gray-600 dark:text-gray-400">
            Funcionalidad en desarrollo
          </p>

          <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>

          <p className="mx-auto mb-8 max-w-2xl text-base text-gray-700 dark:text-gray-300">
            {displayDescription}
          </p>

          {displayFeatures && displayFeatures.length > 0 && (
            <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-gray-200 bg-white p-8 text-left dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                <Construction className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                Funcionalidades Planeadas
              </h3>
              <ul className="space-y-3">
                {displayFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <span className="mt-1 text-lg text-yellow-600 dark:text-yellow-500">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {availableFeatures && availableFeatures.length > 0 && (
            <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-green-200 bg-green-50 p-6 text-left dark:border-green-800 dark:bg-green-900/20">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-green-800 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                Funcionalidades Disponibles
              </h3>
              <ul className="space-y-2">
                {availableFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300"
                  >
                    <span className="mt-1">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {estimatedDate && (
            <div className="mb-8 border-t border-gray-200 pt-6 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Disponibilidad estimada:{' '}
                <span className="text-lg font-bold text-detective-orange">{estimatedDate}</span>
              </p>
            </div>
          )}

          {!estimatedDate && (
            <div className="mb-8 border-t border-gray-200 pt-6 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Estamos trabajando para traerte esta funcionalidad lo antes posible.
              </p>
            </div>
          )}

          {showBackButton && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg bg-detective-orange px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-detective-orange/90 hover:shadow-xl"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
