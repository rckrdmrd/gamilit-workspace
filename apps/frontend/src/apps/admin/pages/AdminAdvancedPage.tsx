import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { UnderConstruction, FeatureBadge } from '@shared/components/common';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Zap, Beaker, Users, Wrench } from 'lucide-react';

/**
 * AdminAdvancedPage - Administración avanzada
 *
 * Estado: EN CONSTRUCCIÓN
 * Esta página incluirá funcionalidades avanzadas para administradores:
 * - Gestión de tenants (multi-tenant)
 * - Feature flags
 * - A/B Testing
 * - Herramientas económicas
 *
 * Updated: 2025-11-24 - Added Under Construction message
 * Updated: 2025-11-25 - Added SHOW_CONTENT flag to preserve code while showing Under Construction
 */

// Feature flag - set to true when ready to show actual content
const SHOW_CONTENT = false;

const AdminAdvancedPage = () => {
  const { user, logout } = useAuth();

  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'advanced_admin'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={gamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      {SHOW_CONTENT ? (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-detective-text">Administración Avanzada</h1>
              <FeatureBadge
                variant="under-construction"
                tooltip="Herramientas avanzadas para administradores expertos"
                size="sm"
              />
            </div>
            <p className="mt-1 text-detective-text-secondary">
              Funcionalidades avanzadas: multi-tenant, feature flags, experimentos y herramientas
              económicas
            </p>
          </div>

          {/* Advanced Sections with Badges */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Feature Flags - Beta */}
            <DetectiveCard>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-xl font-bold text-detective-text">Feature Flags</h2>
                </div>
                <FeatureBadge variant="beta" size="sm" tooltip="En fase de pruebas" />
              </div>
              <p className="text-sm text-detective-text-secondary">
                Sistema básico de flags para activar/desactivar funcionalidades
              </p>
            </DetectiveCard>

            {/* A/B Testing - Under Construction */}
            <DetectiveCard>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beaker className="h-6 w-6 text-purple-500" />
                  <h2 className="text-xl font-bold text-detective-text">A/B Testing</h2>
                </div>
                <FeatureBadge variant="under-construction" size="sm" />
              </div>
              <p className="text-sm text-detective-text-secondary">
                Dashboard de experimentos y análisis estadístico
              </p>
            </DetectiveCard>

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

          {/* Under Construction Details */}
          <UnderConstruction
            variant="section"
            feature="Funcionalidades Avanzadas en Desarrollo"
            description="Herramientas avanzadas para administradores expertos: multi-tenant, feature flags y análisis de experimentos. Incluye configuración de organizaciones y límites, Feature Flags por tenant, experimentos con usuarios, análisis estadístico de experimentos, intervenciones económicas, reportes económicos avanzados, y balanceo de economía del juego."
            estimatedDate="Fase 2 - Q2 2026"
          />
        </div>
      ) : (
        <UnderConstruction
          variant="page"
          feature="Administración Avanzada"
          description="Esta sección incluirá herramientas avanzadas para administradores expertos: gestión multi-tenant, feature flags, A/B testing y herramientas de intervención económica."
          estimatedDate="Fase 2 - Q2 2026"
        />
      )}
    </AdminLayout>
  );
};

export default AdminAdvancedPage;
