import React, { useState } from 'react';
import { Construction, Clock, Beaker, Sparkles, AlertTriangle } from 'lucide-react';

export interface FeatureBadgeProps {
  /**
   * Variante de estado
   */
  variant: 'under-construction' | 'coming-soon' | 'beta' | 'new' | 'deprecated';

  /**
   * Tamaño del badge
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Mostrar tooltip con información adicional
   */
  tooltip?: string;

  /**
   * Posición del badge (para absolute positioning)
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';

  /**
   * Personalizar texto (override del default por variante)
   */
  text?: string;

  /**
   * Clase CSS adicional
   */
  className?: string;
}

/**
 * FeatureBadge Component
 *
 * Badge pequeño para indicar estado de funcionalidades específicas
 * dentro de páginas parcialmente implementadas.
 *
 * @example
 * // Badge inline
 * <div className="flex items-center gap-2">
 *   <h2>Reportes Avanzados</h2>
 *   <FeatureBadge variant="under-construction" size="sm" />
 * </div>
 *
 * @example
 * // Badge con tooltip
 * <FeatureBadge
 *   variant="coming-soon"
 *   tooltip="Disponible en Q1 2026"
 *   size="md"
 * />
 *
 * @example
 * // Badge absoluto en card
 * <div className="relative">
 *   <FeatureBadge
 *     variant="under-construction"
 *     position="top-right"
 *   />
 *   <div className="card-content">...</div>
 * </div>
 */
export const FeatureBadge: React.FC<FeatureBadgeProps> = ({
  variant,
  size = 'md',
  tooltip,
  position = 'inline',
  text,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Variant configurations
  const variantConfig = {
    'under-construction': {
      defaultText: 'En Construcción',
      icon: Construction,
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-300 dark:border-yellow-700',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    'coming-soon': {
      defaultText: 'Próximamente',
      icon: Clock,
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-700',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    beta: {
      defaultText: 'Beta',
      icon: Beaker,
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-800 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-700',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    new: {
      defaultText: 'Nuevo',
      icon: Sparkles,
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-300',
      border: 'border-green-300 dark:border-green-700',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    deprecated: {
      defaultText: 'Obsoleto',
      icon: AlertTriangle,
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-300 dark:border-red-700',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      padding: 'px-3 py-1',
      text: 'text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      padding: 'px-4 py-2',
      text: 'text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  };

  // Position configurations
  const positionConfig = {
    'top-left': 'absolute top-2 left-2',
    'top-right': 'absolute top-2 right-2',
    'bottom-left': 'absolute bottom-2 left-2',
    'bottom-right': 'absolute bottom-2 right-2',
    inline: 'inline-flex',
  };

  const config = variantConfig[variant];
  const sizeStyles = sizeConfig[size];
  const positionStyles = positionConfig[position];
  const Icon = config.icon;
  const displayText = text || config.defaultText;

  const badgeContent = (
    <span
      className={`
        ${positionStyles}
        ${config.bg}
        ${config.text}
        ${config.border}
        ${sizeStyles.padding}
        ${sizeStyles.text}
        ${sizeStyles.gap}
        flex
        items-center
        whitespace-nowrap
        rounded-full
        border
        font-semibold
        shadow-sm
        transition-all
        ${tooltip ? 'cursor-help' : ''}
        ${position !== 'inline' ? 'z-10' : ''}
        ${className}
      `}
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => tooltip && setShowTooltip(false)}
    >
      <Icon className={`${sizeStyles.icon} ${config.iconColor}`} />
      <span>{displayText}</span>
    </span>
  );

  // If tooltip is provided, wrap in a relative container
  if (tooltip && position === 'inline') {
    return (
      <span className="relative inline-block">
        {badgeContent}
        {showTooltip && (
          <span
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-gray-700"
            style={{ minWidth: 'max-content' }}
          >
            {tooltip}
            <span className="absolute left-1/2 top-full -mt-1 -translate-x-1/2 transform border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></span>
          </span>
        )}
      </span>
    );
  }

  // For absolute positioned badges, return wrapper with tooltip
  if (tooltip && position !== 'inline') {
    return (
      <div className="relative">
        {badgeContent}
        {showTooltip && (
          <span
            className="pointer-events-none absolute left-0 top-full z-50 mt-2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-gray-700"
            style={{ minWidth: 'max-content' }}
          >
            {tooltip}
            <span className="absolute bottom-full left-4 mb-0 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></span>
          </span>
        )}
      </div>
    );
  }

  return badgeContent;
};

export default FeatureBadge;
