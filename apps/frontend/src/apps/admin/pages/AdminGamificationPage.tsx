/**
 * AdminGamificationPage - Gamification configuration hub
 *
 * Integrado con APIs reales (US-AE-005). Provides four tabs for managing
 * Maya ranks, achievements, economy parameters, and statistics.
 * All defensive data transformations live in useGamificationConfig.
 */

import { useState, useCallback } from 'react';
import { useGamificationConfig } from '../hooks/useGamificationConfig';
import { AdminPageShell } from '../components/shared/AdminPageShell';
import { AdminTabBar } from '../components/shared/AdminTabBar';
import type { AdminTab } from '../components/shared/AdminTabBar';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Trophy, Star, Award, Coins, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@shared/components/loading';
import type { MayaRankConfig, Parameter } from '@/services/api/schemas/adminSchemas';
import {
  RanksTab,
  AchievementsTab,
  EconomyTab,
  StatsTab,
  ParameterEditModal,
  MayaRankEditModal,
  BulkUpdateDialog,
  PreviewImpactDialog,
  RestoreDefaultsDialog,
} from '../components/gamification';

// ---- Tab definitions ----

type GamificationTabId = 'ranks' | 'achievements' | 'economy' | 'stats';

const TABS: AdminTab<GamificationTabId>[] = [
  { id: 'ranks', label: 'Rangos Maya', icon: Star },
  { id: 'achievements', label: 'Logros', icon: Award },
  { id: 'economy', label: 'Economia ML Coins', icon: Coins },
  { id: 'stats', label: 'Estadisticas', icon: TrendingUp },
];

// ---- Modal state ----

interface ModalState {
  parameter: { open: boolean; selected: Parameter | null };
  rank: { open: boolean; selected: MayaRankConfig | null };
  bulkUpdate: boolean;
  previewImpact: boolean;
  restoreDefaults: boolean;
}

const INITIAL_MODAL_STATE: ModalState = {
  parameter: { open: false, selected: null },
  rank: { open: false, selected: null },
  bulkUpdate: false,
  previewImpact: false,
  restoreDefaults: false,
};

// ---- Component ----

export default function AdminGamificationPage() {
  const [activeTab, setActiveTab] = useState<GamificationTabId>('ranks');
  const [modals, setModals] = useState<ModalState>(INITIAL_MODAL_STATE);

  const {
    useParameters, useMayaRanks, useStats,
    updateParameter, resetParameter, updateMayaRank,
    bulkUpdateParameters, restoreDefaults,
  } = useGamificationConfig();

  const { data: safeParameters = [], isLoading: parametersLoading } = useParameters();
  const { data: validatedRanks = [], isLoading: ranksLoading } = useMayaRanks();
  const { data: stats, isLoading: statsLoading } = useStats();

  const isLoading = statsLoading || parametersLoading || ranksLoading;
  const hasErrors = !isLoading && !stats && !safeParameters.length && !validatedRanks.length;

  // ---- Modal helpers ----

  const openParameterModal = useCallback((param: Parameter) => {
    setModals((s) => ({ ...s, parameter: { open: true, selected: param } }));
  }, []);

  const closeParameterModal = useCallback(() => {
    setModals((s) => ({ ...s, parameter: { open: false, selected: null } }));
  }, []);

  const openRankModal = useCallback((rank: MayaRankConfig) => {
    setModals((s) => ({ ...s, rank: { open: true, selected: rank } }));
  }, []);

  const closeRankModal = useCallback(() => {
    setModals((s) => ({ ...s, rank: { open: false, selected: null } }));
  }, []);

  // ---- Render ----

  if (isLoading) {
    return (
      <AdminPageShell>
        <div className="flex h-96 items-center justify-center" aria-live="polite">
          <div className="text-center" role="status">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-lg text-detective-text">Cargando configuracion de gamificacion...</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (hasErrors) {
    return (
      <AdminPageShell>
        <div className="flex h-96 items-center justify-center" aria-live="polite">
          <div className="text-center" role="alert">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-bold text-detective-text">Error al cargar configuracion</h3>
            <p className="mb-4 text-detective-text-secondary">
              No se pudieron cargar los datos de gamificacion. Verifica la conexion con el servidor.
            </p>
            <DetectiveButton variant="primary" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </DetectiveButton>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-detective-text">
            <Trophy className="h-8 w-8 text-detective-gold" />
            Gamificacion
          </h1>
          <p className="mt-1 text-detective-text-secondary">
            Configura rangos, logros, economia y visualiza estadisticas
          </p>
          {stats?.lastModified && (
            <p className="mt-2 text-sm text-detective-text-secondary">
              Ultima modificacion: {new Date(stats.lastModified).toLocaleString('es-ES')}
            </p>
          )}
        </div>

        {/* Tabs */}
        <AdminTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} variant="underline" />

        {/* Tab Content */}
        <div role="region" aria-label={`Contenido de pestana: ${TABS.find(t => t.id === activeTab)?.label ?? activeTab}`}>
        {activeTab === 'ranks' && (
          <RanksTab ranks={validatedRanks} onEditRank={openRankModal} isLoading={ranksLoading} />
        )}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'economy' && (
          <EconomyTab
            parameters={safeParameters}
            stats={stats ?? null}
            onEditParameter={openParameterModal}
            onBulkUpdate={() => setModals((s) => ({ ...s, bulkUpdate: true }))}
            onPreviewImpact={() => setModals((s) => ({ ...s, previewImpact: true }))}
            onRestoreDefaults={() => setModals((s) => ({ ...s, restoreDefaults: true }))}
            isLoading={parametersLoading}
          />
        )}
        {activeTab === 'stats' && (
          <StatsTab stats={stats ?? null} parameters={safeParameters} isLoading={parametersLoading} />
        )}
        </div>
      </div>

      {/* Modals */}
      <ParameterEditModal
        isOpen={modals.parameter.open}
        onClose={closeParameterModal}
        parameter={modals.parameter.selected}
        onSuccess={closeParameterModal}
        onUpdate={async (key, value, reason) => {
          await updateParameter.mutateAsync({ key, data: { value, reason } });
        }}
        onReset={async (key) => {
          await resetParameter.mutateAsync(key);
        }}
      />

      <MayaRankEditModal
        isOpen={modals.rank.open}
        onClose={closeRankModal}
        rank={modals.rank.selected}
        allRanks={validatedRanks}
        onSuccess={closeRankModal}
        onUpdate={async (id, minXp, maxXp) => {
          await updateMayaRank.mutateAsync({ id, data: { minXp, maxXp } });
        }}
      />

      <BulkUpdateDialog
        isOpen={modals.bulkUpdate}
        onClose={() => setModals((s) => ({ ...s, bulkUpdate: false }))}
        parameters={safeParameters}
        onSuccess={() => setModals((s) => ({ ...s, bulkUpdate: false }))}
        onBulkUpdate={async (updates, reason) => {
          await bulkUpdateParameters.mutateAsync({ updates, reason });
        }}
      />

      <PreviewImpactDialog
        isOpen={modals.previewImpact}
        onClose={() => setModals((s) => ({ ...s, previewImpact: false }))}
        impactData={null}
        isLoading={false}
        onConfirm={() => setModals((s) => ({ ...s, previewImpact: false }))}
      />

      <RestoreDefaultsDialog
        isOpen={modals.restoreDefaults}
        onClose={() => setModals((s) => ({ ...s, restoreDefaults: false }))}
        parameters={safeParameters}
        onConfirm={async () => {
          await restoreDefaults.mutateAsync();
          setModals((s) => ({ ...s, restoreDefaults: false }));
        }}
      />
    </AdminPageShell>
  );
}
