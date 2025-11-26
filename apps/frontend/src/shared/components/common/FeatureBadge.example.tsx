import React from 'react';
import { FeatureBadge } from './FeatureBadge';
import { DetectiveCard } from '../base/DetectiveCard';

/**
 * FeatureBadge Examples
 *
 * This file demonstrates various usage patterns for the FeatureBadge component.
 * Use these examples as reference when implementing badges in your pages.
 */

export const FeatureBadgeExamples: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-detective-text">FeatureBadge Examples</h1>
        <p className="text-detective-text-secondary">
          Ejemplos de uso del componente FeatureBadge en diferentes contextos
        </p>
      </div>

      {/* All Variants */}
      <DetectiveCard>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Todas las Variantes</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-32 text-detective-text">Under Construction:</span>
            <FeatureBadge variant="under-construction" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 text-detective-text">Coming Soon:</span>
            <FeatureBadge variant="coming-soon" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 text-detective-text">Beta:</span>
            <FeatureBadge variant="beta" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 text-detective-text">New:</span>
            <FeatureBadge variant="new" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 text-detective-text">Deprecated:</span>
            <FeatureBadge variant="deprecated" />
          </div>
        </div>
      </DetectiveCard>

      {/* Size Variations */}
      <DetectiveCard>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Tamaños</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-32 text-detective-text">Small:</span>
            <FeatureBadge variant="under-construction" size="sm" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 text-detective-text">Medium (default):</span>
            <FeatureBadge variant="under-construction" size="md" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 text-detective-text">Large:</span>
            <FeatureBadge variant="under-construction" size="lg" />
          </div>
        </div>
      </DetectiveCard>

      {/* With Tooltips */}
      <DetectiveCard>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Con Tooltips</h2>
        <p className="mb-4 text-sm text-detective-text-secondary">
          Pasa el mouse sobre los badges para ver los tooltips
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FeatureBadge
              variant="under-construction"
              tooltip="Esta funcionalidad está siendo desarrollada actualmente"
            />
            <span className="text-sm text-detective-text-secondary">
              Badge con información adicional
            </span>
          </div>
          <div className="flex items-center gap-3">
            <FeatureBadge variant="coming-soon" tooltip="Disponible en Q1 2026" size="md" />
            <span className="text-sm text-detective-text-secondary">Con fecha estimada</span>
          </div>
          <div className="flex items-center gap-3">
            <FeatureBadge
              variant="beta"
              tooltip="Función experimental - puede tener errores"
              size="sm"
            />
            <span className="text-sm text-detective-text-secondary">Advertencia para usuarios</span>
          </div>
        </div>
      </DetectiveCard>

      {/* Inline with Headers */}
      <DetectiveCard>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Inline con Títulos</h2>
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-detective-text">Reportes Avanzados</h3>
              <FeatureBadge variant="under-construction" size="sm" />
            </div>
            <p className="text-sm text-detective-text-secondary">
              Los reportes avanzados con visualizaciones personalizadas están en desarrollo.
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-detective-text">Filtros Avanzados</h3>
              <FeatureBadge variant="coming-soon" size="sm" />
            </div>
            <p className="text-sm text-detective-text-secondary">
              Filtros por institución, rol, estado y fecha de registro.
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-detective-text">
                Dashboard en Tiempo Real
              </h3>
              <FeatureBadge variant="beta" size="sm" />
            </div>
            <p className="text-sm text-detective-text-secondary">
              Métricas en tiempo real actualizándose automáticamente.
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-detective-text">Notificaciones Push</h3>
              <FeatureBadge variant="new" size="sm" />
            </div>
            <p className="text-sm text-detective-text-secondary">
              Recibe notificaciones en tiempo real de eventos importantes.
            </p>
          </div>
        </div>
      </DetectiveCard>

      {/* Absolute Positioning */}
      <DetectiveCard>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Posicionamiento Absoluto</h2>
        <p className="mb-4 text-sm text-detective-text-secondary">
          Útil para cards o secciones con contenido
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Top-Left */}
          <div className="border-detective-border relative min-h-[120px] rounded-lg border bg-detective-bg-secondary p-6">
            <FeatureBadge variant="under-construction" position="top-left" size="sm" />
            <h4 className="mt-6 font-semibold text-detective-text">Top-Left Badge</h4>
            <p className="text-sm text-detective-text-secondary">Contenido de la card...</p>
          </div>

          {/* Top-Right */}
          <div className="border-detective-border relative min-h-[120px] rounded-lg border bg-detective-bg-secondary p-6">
            <FeatureBadge variant="coming-soon" position="top-right" size="sm" />
            <h4 className="mt-6 font-semibold text-detective-text">Top-Right Badge</h4>
            <p className="text-sm text-detective-text-secondary">Contenido de la card...</p>
          </div>

          {/* Bottom-Left */}
          <div className="border-detective-border relative min-h-[120px] rounded-lg border bg-detective-bg-secondary p-6">
            <FeatureBadge variant="beta" position="bottom-left" size="sm" />
            <h4 className="font-semibold text-detective-text">Bottom-Left Badge</h4>
            <p className="text-sm text-detective-text-secondary">Contenido de la card...</p>
          </div>

          {/* Bottom-Right */}
          <div className="border-detective-border relative min-h-[120px] rounded-lg border bg-detective-bg-secondary p-6">
            <FeatureBadge variant="new" position="bottom-right" size="sm" />
            <h4 className="font-semibold text-detective-text">Bottom-Right Badge</h4>
            <p className="text-sm text-detective-text-secondary">Contenido de la card...</p>
          </div>
        </div>
      </DetectiveCard>

      {/* Custom Text */}
      <DetectiveCard>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Texto Personalizado</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FeatureBadge variant="under-construction" text="En Desarrollo" size="md" />
            <span className="text-sm text-detective-text-secondary">Texto personalizado</span>
          </div>
          <div className="flex items-center gap-3">
            <FeatureBadge variant="coming-soon" text="Q1 2026" size="md" />
            <span className="text-sm text-detective-text-secondary">Fecha específica</span>
          </div>
          <div className="flex items-center gap-3">
            <FeatureBadge variant="beta" text="v2.0 Beta" size="md" />
            <span className="text-sm text-detective-text-secondary">Versión específica</span>
          </div>
        </div>
      </DetectiveCard>

      {/* Real-world Example */}
      <DetectiveCard>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Ejemplo del Mundo Real</h2>
        <div className="space-y-6">
          {/* Section with mixed features */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-detective-text">Gestión de Usuarios</h3>
              <FeatureBadge
                variant="under-construction"
                tooltip="CRUD completo en desarrollo"
                size="sm"
              />
            </div>
            <div className="rounded-lg bg-detective-bg-secondary p-4">
              <ul className="space-y-2">
                <li className="flex items-center justify-between text-detective-text">
                  <span>Ver usuarios</span>
                  <span className="text-sm text-green-400">✓ Disponible</span>
                </li>
                <li className="flex items-center justify-between text-detective-text">
                  <span>Crear usuarios</span>
                  <FeatureBadge variant="coming-soon" size="sm" />
                </li>
                <li className="flex items-center justify-between text-detective-text">
                  <span>Editar usuarios</span>
                  <FeatureBadge variant="coming-soon" size="sm" />
                </li>
                <li className="flex items-center justify-between text-detective-text">
                  <span>Eliminar usuarios</span>
                  <FeatureBadge variant="coming-soon" size="sm" />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DetectiveCard>

      {/* Code Examples */}
      <DetectiveCard>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Ejemplos de Código</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-detective-text">Inline con título:</h3>
            <pre className="overflow-x-auto rounded-lg bg-detective-bg-secondary p-4 text-xs text-detective-text">
              {`<div className="flex items-center gap-2">
  <h2>Reportes Avanzados</h2>
  <FeatureBadge variant="under-construction" size="sm" />
</div>`}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-detective-text">Con tooltip:</h3>
            <pre className="overflow-x-auto rounded-lg bg-detective-bg-secondary p-4 text-xs text-detective-text">
              {`<FeatureBadge
  variant="coming-soon"
  tooltip="Disponible en Q1 2026"
  size="md"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-detective-text">
              Posicionamiento absoluto:
            </h3>
            <pre className="overflow-x-auto rounded-lg bg-detective-bg-secondary p-4 text-xs text-detective-text">
              {`<div className="relative">
  <FeatureBadge
    variant="under-construction"
    position="top-right"
  />
  <div className="card-content">...</div>
</div>`}
            </pre>
          </div>
        </div>
      </DetectiveCard>
    </div>
  );
};

export default FeatureBadgeExamples;
