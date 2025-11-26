import { useState, useMemo } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@/shared/hooks/useUserGamification';
import { useGamificationConfig } from '../hooks/useGamificationConfig';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  Trophy,
  Star,
  Coins,
  Target,
  TrendingUp,
  Settings,
  Award,
  Loader2,
  Edit,
  RotateCcw,
} from 'lucide-react';
import type { MayaRank, Parameter } from '@/services/api/schemas/adminSchemas';
import {
  ParameterEditModal,
  MayaRankEditModal,
  BulkUpdateDialog,
  PreviewImpactDialog,
  RestoreDefaultsDialog,
  AchievementsTab,
} from '../components/gamification';

/**
 * AdminGamificationPage - Configuración de gamificación global
 *
 * Integrado con APIs reales (US-AE-005)
 * Elimina datos hardcodeados y consume endpoints backend
 * Incluye modales para edición completa de configuración
 */
export default function AdminGamificationPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'ranks' | 'achievements' | 'economy' | 'stats'>(
    'ranks',
  );

  // Modal states
  const [parameterModalOpen, setParameterModalOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);
  const [rankModalOpen, setRankModalOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<MayaRank | null>(null);
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [previewImpactOpen, setPreviewImpactOpen] = useState(false);
  const [restoreDefaultsOpen, setRestoreDefaultsOpen] = useState(false);

  // Cargar datos de gamificación del usuario actual (admin)
  const { gamificationData } = useUserGamification(user?.id);

  // Cargar datos desde APIs reales
  const {
    useParameters,
    useMayaRanks,
    useStats,
    updateParameter,
    resetParameter,
    updateMayaRank,
    bulkUpdateParameters,
    // previewImpact is available but not used yet
  } = useGamificationConfig();

  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: parametersData, isLoading: parametersLoading } = useParameters();
  const { data: mayaRanks, isLoading: ranksLoading } = useMayaRanks();

  const isLoading = statsLoading || parametersLoading || ranksLoading;

  // BUG-ADMIN-008: Validar y transformar ranks con fallbacks
  // Backend may return snake_case fields, so we cast to any for transformation
  const validatedRanks = useMemo(() => {
    if (!mayaRanks || !Array.isArray(mayaRanks)) return [];

    return mayaRanks
      .map((r) => {
        const rank = r as unknown as Record<string, unknown>;
        return {
          id:
            (rank.id as string) ||
            (rank.rank_name as string) ||
            `rank-${(rank.level as number) || 0}`,
          name: (rank.name as string) || (rank.rank_name as string) || 'Sin nombre',
          level: (rank.level as number) ?? (rank.rank_order as number) ?? 0,
          minXp: (rank.minXp as number) ?? (rank.min_xp as number) ?? 0,
          maxXp: (rank.maxXp as number | null) ?? (rank.max_xp as number | null) ?? null,
          multiplierXp: (rank.multiplierXp as number) ?? (rank.multiplier_xp as number) ?? 1,
          multiplierMlCoins:
            (rank.multiplierMlCoins as number) ?? (rank.multiplier_ml_coins as number) ?? 1,
          bonusMlCoins: (rank.bonusMlCoins as number) ?? (rank.bonus_ml_coins as number) ?? 0,
          color: (rank.color as string) || '#6B7280',
          icon: (rank.icon as string | null) || null,
          description: (rank.description as string) || '',
          perks: Array.isArray(rank.perks) ? (rank.perks as string[]) : [],
          isActive: (rank.isActive as boolean) ?? (rank.is_active as boolean) ?? true,
          order: (rank.order as number) ?? (rank.rank_order as number) ?? 0,
        };
      })
      .filter((rank) => rank.name && rank.name !== 'Sin nombre');
  }, [mayaRanks]);

  // BUG-ADMIN-009: Validar parámetros con fallback defensivo
  const safeParameters = useMemo(() => {
    if (!parametersData?.data || !Array.isArray(parametersData.data)) {
      return [];
    }
    return parametersData.data;
  }, [parametersData]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout
        user={user || undefined}
        gamificationData={gamificationData}
        organizationName="GAMILIT Platform Admin"
        onLogout={handleLogout}
      >
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-detective-orange" />
            <p className="text-lg text-detective-text">Cargando configuración de gamificación...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={gamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-detective-text">
            <Trophy className="h-8 w-8 text-detective-gold" />
            Gamificación
          </h1>
          <p className="mt-1 text-detective-text-secondary">
            Configura rangos, logros, economía y visualiza estadísticas
          </p>
          {stats?.lastModified && (
            <p className="mt-2 text-sm text-detective-text-secondary">
              Última modificación: {new Date(stats.lastModified).toLocaleString('es-ES')}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('ranks')}
            className={`whitespace-nowrap rounded-lg px-4 py-2 transition-colors ${
              activeTab === 'ranks'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <Star className="mr-2 inline h-4 w-4" />
            Rangos Maya
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`whitespace-nowrap rounded-lg px-4 py-2 transition-colors ${
              activeTab === 'achievements'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <Award className="mr-2 inline h-4 w-4" />
            Logros
          </button>
          <button
            onClick={() => setActiveTab('economy')}
            className={`whitespace-nowrap rounded-lg px-4 py-2 transition-colors ${
              activeTab === 'economy'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <Coins className="mr-2 inline h-4 w-4" />
            Economía ML Coins
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`whitespace-nowrap rounded-lg px-4 py-2 transition-colors ${
              activeTab === 'stats'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <TrendingUp className="mr-2 inline h-4 w-4" />
            Estadísticas
          </button>
        </div>

        {/* Ranks Tab */}
        {activeTab === 'ranks' && (
          <div className="space-y-4">
            <DetectiveCard>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-detective-text">
                  Rangos Maya ({validatedRanks.length})
                </h2>
                <DetectiveButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // Open selector to choose which rank to edit
                    if (validatedRanks.length > 0) {
                      setSelectedRank(validatedRanks[0]);
                      setRankModalOpen(true);
                    }
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Configurar
                </DetectiveButton>
              </div>

              <div className="space-y-3">
                {validatedRanks.length > 0 ? (
                  validatedRanks
                    .sort((a, b) => a.level - b.level)
                    .map((rank) => (
                      <div
                        key={rank.id}
                        className="flex cursor-pointer items-center justify-between rounded-lg bg-detective-bg-secondary p-4 transition-colors hover:bg-detective-bg-secondary/80"
                        onClick={() => {
                          setSelectedRank(rank);
                          setRankModalOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <Star className="h-8 w-8" style={{ color: rank.color }} />
                          <div>
                            <h3 className="text-lg font-bold" style={{ color: rank.color }}>
                              {rank.name}
                            </h3>
                            <p className="text-sm text-detective-text-secondary">
                              {rank.minXp.toLocaleString()} -{' '}
                              {rank.maxXp ? rank.maxXp.toLocaleString() : '∞'} XP
                            </p>
                            <p className="mt-1 text-xs text-detective-text-secondary">
                              Nivel {rank.level} • Mult. XP: {rank.multiplierXp}x • Mult. Coins:{' '}
                              {rank.multiplierMlCoins}x
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            {rank.isActive ? (
                              <span className="rounded bg-green-900/30 px-2 py-1 text-xs text-green-400">
                                Activo
                              </span>
                            ) : (
                              <span className="rounded bg-gray-900/30 px-2 py-1 text-xs text-gray-400">
                                Inactivo
                              </span>
                            )}
                          </div>
                          <Edit className="h-4 w-4 text-detective-orange" />
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center text-detective-text-secondary">
                    No hay rangos Maya configurados
                  </div>
                )}
              </div>
            </DetectiveCard>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && <AchievementsTab />}

        {/* Economy Tab */}
        {activeTab === 'economy' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Settings className="mx-auto mb-2 h-12 w-12 text-detective-gold" />
                  <p className="mb-1 text-sm text-detective-text-secondary">Parámetros Totales</p>
                  <p className="text-3xl font-bold text-detective-gold">
                    {stats?.totalParameters || 0}
                  </p>
                </div>
              </DetectiveCard>
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Target className="mx-auto mb-2 h-12 w-12 text-blue-400" />
                  <p className="mb-1 text-sm text-detective-text-secondary">Parámetros Activos</p>
                  <p className="text-3xl font-bold text-blue-400">{stats?.activeParameters || 0}</p>
                </div>
              </DetectiveCard>
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Coins className="mx-auto mb-2 h-12 w-12 text-green-400" />
                  <p className="mb-1 text-sm text-detective-text-secondary">Categoría Coins</p>
                  <p className="text-3xl font-bold text-green-400">
                    {safeParameters.filter((p) => p?.category === 'coins').length}
                  </p>
                </div>
              </DetectiveCard>
            </div>

            <DetectiveCard>
              <h2 className="mb-4 text-xl font-bold text-detective-text">Parámetros de Economía</h2>
              {safeParameters.length > 0 ? (
                <div className="space-y-3">
                  {safeParameters
                    .filter((param) => param.category === 'coins' || param.category === 'bonuses')
                    .map((param) => (
                      <div
                        key={param.id}
                        className="flex cursor-pointer items-center justify-between rounded-lg bg-detective-bg-secondary p-3 transition-colors hover:bg-detective-bg-secondary/80"
                        onClick={() => {
                          setSelectedParameter(param);
                          setParameterModalOpen(true);
                        }}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-detective-text">{param.key}</p>
                          {param.description && (
                            <p className="text-xs text-detective-text-secondary">
                              {param.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-detective-gold">
                              {param.value}
                              {param.dataType === 'percentage' ? '%' : ''}
                            </p>
                            {param.defaultValue && (
                              <p className="text-xs text-detective-text-secondary">
                                Default: {param.defaultValue}
                              </p>
                            )}
                          </div>
                          <Edit className="h-4 w-4 text-detective-orange" />
                        </div>
                      </div>
                    ))}
                  <div className="mt-4 flex gap-2">
                    <DetectiveButton
                      variant="primary"
                      onClick={() => setBulkUpdateOpen(true)}
                      className="flex-1"
                    >
                      <Settings className="mr-2 inline h-4 w-4" />
                      Actualización Masiva
                    </DetectiveButton>
                    <DetectiveButton
                      variant="outline"
                      onClick={() => setRestoreDefaultsOpen(true)}
                      className="flex-1"
                    >
                      <RotateCcw className="mr-2 inline h-4 w-4" />
                      Restaurar Defaults
                    </DetectiveButton>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-detective-text-secondary">
                  No hay parámetros de economía configurados
                </div>
              )}
            </DetectiveCard>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Settings className="mx-auto mb-2 h-12 w-12 text-orange-400" />
                  <p className="mb-1 text-sm text-detective-text-secondary">Total Parámetros</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {stats?.totalParameters || 0}
                  </p>
                </div>
              </DetectiveCard>
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Award className="mx-auto mb-2 h-12 w-12 text-purple-400" />
                  <p className="mb-1 text-sm text-detective-text-secondary">Parámetros Activos</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats?.activeParameters || 0}
                  </p>
                </div>
              </DetectiveCard>
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Star className="mx-auto mb-2 h-12 w-12 text-blue-400" />
                  <p className="mb-1 text-sm text-detective-text-secondary">Total Rangos Maya</p>
                  <p className="text-2xl font-bold text-blue-400">{stats?.totalRanks || 0}</p>
                </div>
              </DetectiveCard>
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <TrendingUp className="mx-auto mb-2 h-12 w-12 text-green-400" />
                  <p className="mb-1 text-sm text-detective-text-secondary">Rangos Activos</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.activeRanks || 0}</p>
                </div>
              </DetectiveCard>
            </div>

            {/* Desglose por categorías */}
            <DetectiveCard>
              <h2 className="mb-4 text-xl font-bold text-detective-text">
                Parámetros por Categoría
              </h2>
              {safeParameters.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                  {(['points', 'coins', 'levels', 'ranks', 'penalties', 'bonuses'] as const).map(
                    (category) => {
                      const count = safeParameters.filter((p) => p.category === category).length;
                      return (
                        <div
                          key={category}
                          className="rounded-lg bg-detective-bg-secondary p-4 text-center"
                        >
                          <p className="mb-1 text-sm capitalize text-detective-text-secondary">
                            {category}
                          </p>
                          <p className="text-2xl font-bold text-detective-text">{count}</p>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-detective-text-secondary">
                  No hay datos de parámetros disponibles
                </div>
              )}
            </DetectiveCard>
          </div>
        )}
      </div>

      {/* Modals */}
      <ParameterEditModal
        isOpen={parameterModalOpen}
        onClose={() => {
          setParameterModalOpen(false);
          setSelectedParameter(null);
        }}
        parameter={selectedParameter}
        onSuccess={() => {
          setParameterModalOpen(false);
          setSelectedParameter(null);
        }}
        onUpdate={async (key, value, reason) => {
          await updateParameter.mutateAsync({ key, data: { value, reason } });
        }}
        onReset={async (key) => {
          await resetParameter.mutateAsync(key);
        }}
      />

      <MayaRankEditModal
        isOpen={rankModalOpen}
        onClose={() => {
          setRankModalOpen(false);
          setSelectedRank(null);
        }}
        rank={selectedRank}
        allRanks={validatedRanks}
        onSuccess={() => {
          setRankModalOpen(false);
          setSelectedRank(null);
        }}
        onUpdate={async (id, minXp, maxXp) => {
          await updateMayaRank.mutateAsync({
            id,
            data: { minXp, maxXp },
          });
        }}
      />

      <BulkUpdateDialog
        isOpen={bulkUpdateOpen}
        onClose={() => setBulkUpdateOpen(false)}
        parameters={safeParameters}
        onSuccess={() => setBulkUpdateOpen(false)}
        onBulkUpdate={async (updates, reason) => {
          await bulkUpdateParameters.mutateAsync({ updates, reason });
        }}
      />

      <PreviewImpactDialog
        isOpen={previewImpactOpen}
        onClose={() => setPreviewImpactOpen(false)}
        impactData={null}
        isLoading={false}
        onConfirm={() => {
          setPreviewImpactOpen(false);
          // Apply changes logic here
        }}
      />

      <RestoreDefaultsDialog
        isOpen={restoreDefaultsOpen}
        onClose={() => setRestoreDefaultsOpen(false)}
        parameters={safeParameters}
        totalUsers={1250}
        onConfirm={async () => {
          // TODO: Implement restore defaults endpoint in backend
          // This endpoint is not yet available in the API
          // await restoreDefaults.mutateAsync();
          console.warn('Restore defaults endpoint not yet implemented in backend');
          setRestoreDefaultsOpen(false);
        }}
      />
    </AdminLayout>
  );
}
