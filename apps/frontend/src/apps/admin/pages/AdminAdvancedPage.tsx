import { FeatureBadge } from '@shared/components/common';
import { UnderConstruction } from '@/shared/components/UnderConstruction';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Zap, Beaker, Users, Wrench } from 'lucide-react';
import { FeatureFlagsPanel, ABTestingDashboard } from '../components/advanced';
import { AdminPageShell } from '../components/shared';

/**
 * AdminAdvancedPage - Administración avanzada
 *
 * Estado: IMPLEMENTADO - FEATURE FLAGS PANEL
 * Implementa panel de Feature Flags con funcionalidades:
 * - Lista de feature flags
 * - Toggle rápido para habilitar/deshabilitar
 * - Indicador de rollout percentage
 * - Filtros por estado
 * - CRUD de feature flags
 * - A/B Testing Dashboard (básico)
 *
 * Updated: 2025-11-24 - Added Under Construction message
 * Updated: 2025-11-25 - Added SHOW_CONTENT flag to preserve code while showing Under Construction
 * Updated: 2025-11-28 - Hidden from menu, route remains active with Coming Soon message
 * Updated: 2025-12-05 - FE-ADMIN-011-016: Implemented Feature Flags Panel (Sprint P2-B)
 */

// Feature flag - set to true when ready to show actual content
// IMPORTANTE: Esta página está oculta del menú del admin (ver GamilitSidebar.tsx)
const SHOW_CONTENT = true; // Changed to true - Feature Flags Panel implemented

export default function AdminAdvancedPage() {
  return (
    <AdminPageShell>
      {SHOW_CONTENT ? (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-detective-text">Administración Avanzada</h1>
              <FeatureBadge variant="beta" tooltip="Feature Flags implementado" size="sm" />
            </div>
            <p className="mt-1 text-detective-text-secondary">
              Gestión de feature flags, A/B testing y configuración avanzada del sistema
            </p>
          </div>

          {/* Feature Flags Panel - IMPLEMENTED */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6 text-detective-orange" />
              <h2 className="text-2xl font-bold text-detective-text">Feature Flags</h2>
              <FeatureBadge variant="beta" size="sm" tooltip="Panel de Feature Flags" />
            </div>
            <FeatureFlagsPanel />
          </div>

          {/* A/B Testing Dashboard - BASIC */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Beaker className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-detective-text">A/B Testing</h2>
              <FeatureBadge variant="beta" size="sm" tooltip="Dashboard básico de experimentos" />
            </div>
            <ABTestingDashboard />
          </div>

          {/* Future Sections - Placeholders */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Tenant Management - Under Construction */}
            <DetectiveCard>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-500" />
                  <h2 className="text-xl font-bold text-detective-text">Gestión de Tenants</h2>
                </div>
                <FeatureBadge variant="under-construction" size="sm" />
              </div>
              <p className="text-sm text-detective-text-secondary">
                Configuración multi-tenant y límites por organización
              </p>
            </DetectiveCard>

            {/* Economic Tools - Coming Soon */}
            <DetectiveCard>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-detective-text">Herramientas Económicas</h2>
                </div>
                <FeatureBadge variant="coming-soon" size="sm" />
              </div>
              <p className="text-sm text-detective-text-secondary">
                Ajustes masivos de ML Coins y balanceo de economía
              </p>
            </DetectiveCard>
          </div>
        </div>
      ) : (
        <UnderConstruction
          variant="page"
          title="Administración Avanzada"
          description="Esta sección incluirá herramientas avanzadas para administradores expertos: gestión multi-tenant, feature flags, A/B testing y herramientas de intervención económica."
          estimatedDate="Fase 2 - Q2 2026"
        />
      )}
    </AdminPageShell>
  );
}
