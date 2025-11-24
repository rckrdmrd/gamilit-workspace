import { useState } from 'react';
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
} from 'lucide-react';
import { MayaRankSchema, ParameterSchema } from '@/services/api/schemas/adminSchemas';
import type { MayaRank, Parameter } from '@/services/api/schemas/adminSchemas';

/**
 * AdminGamificationPage - Configuración de gamificación global
 *
 * Integrado con APIs reales (US-AE-005)
 * Elimina datos hardcodeados y consume endpoints backend
 */
export default function AdminGamificationPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'ranks' | 'achievements' | 'economy' | 'stats'>('ranks');

  // Cargar datos de gamificación del usuario actual (admin)
  const { gamificationData } = useUserGamification(user?.id);

  // Cargar datos desde APIs reales
  const {
    useParameters,
    useMayaRanks,
    useStats,
  } = useGamificationConfig();

  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: parametersData, isLoading: parametersLoading } = useParameters();
  const { data: mayaRanks, isLoading: ranksLoading } = useMayaRanks();

  const isLoading = statsLoading || parametersLoading || ranksLoading;

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
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-detective-orange mx-auto mb-4" />
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
          <h1 className="text-3xl font-bold text-detective-text flex items-center gap-3">
            <Trophy className="w-8 h-8 text-detective-gold" />
            Gamificación
          </h1>
          <p className="text-detective-text-secondary mt-1">
            Configura rangos, logros, economía y visualiza estadísticas
          </p>
          {stats?.lastModified && (
            <p className="text-sm text-detective-text-secondary mt-2">
              Última modificación: {new Date(stats.lastModified).toLocaleString('es-ES')}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('ranks')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'ranks'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Rangos Maya
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'achievements'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Logros
          </button>
          <button
            onClick={() => setActiveTab('economy')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'economy'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <Coins className="w-4 h-4 inline mr-2" />
            Economía ML Coins
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'stats'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Estadísticas
          </button>
        </div>

        {/* Ranks Tab */}
        {activeTab === 'ranks' && (
          <div className="space-y-4">
            <DetectiveCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-detective-text">
                  Rangos Maya ({mayaRanks?.length || 0})
                </h2>
                <DetectiveButton variant="primary" size="sm" onClick={() => alert('Editar rangos - Funcionalidad próximamente')}>
                  <Settings className="w-4 h-4" />
                  Configurar
                </DetectiveButton>
              </div>

              <div className="space-y-3">
                {/* BUG-ADMIN-008: Validar y filtrar ranks antes de renderizar */}
                {mayaRanks && mayaRanks.length > 0 ? (
                  mayaRanks
                    .filter((rank) => {
                      // Validar con Zod inline
                      try {
                        MayaRankSchema.parse(rank);
                        return true;
                      } catch (error) {
                        console.warn('Invalid rank structure:', rank, error);
                        return false;
                      }
                    })
                    .sort((a, b) => a.level - b.level)
                    .map((rank) => (
                      <div
                        key={rank.id}
                        className="flex items-center justify-between p-4 bg-detective-bg-secondary rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Star className="w-8 h-8" style={{ color: rank.color }} />
                          <div>
                            <h3 className="text-lg font-bold" style={{ color: rank.color }}>
                              {rank.name}
                            </h3>
                            <p className="text-sm text-detective-text-secondary">
                              {rank.minXp.toLocaleString()} - {rank.maxXp ? rank.maxXp.toLocaleString() : '∞'} XP
                            </p>
                            <p className="text-xs text-detective-text-secondary mt-1">
                              Nivel {rank.level} • Mult. XP: {rank.multiplierXp}x • Mult. Coins: {rank.multiplierMlCoins}x
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {rank.isActive ? (
                            <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">Activo</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-900/30 text-gray-400 text-xs rounded">Inactivo</span>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-detective-text-secondary">
                    No hay rangos Maya configurados
                  </div>
                )}
              </div>
            </DetectiveCard>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <DetectiveCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-detective-text">Logros</h2>
                <DetectiveButton variant="primary" size="sm" onClick={() => alert('Funcionalidad en desarrollo')}>
                  <Award className="w-4 h-4" />
                  Nuevo Logro
                </DetectiveButton>
              </div>

              <div className="text-center py-12 text-detective-text-secondary">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Achievements en desarrollo</p>
                <p className="text-sm">
                  La gestión de logros estará disponible en una próxima versión.
                </p>
                <p className="text-xs mt-2">
                  Total de logros configurados: {stats?.totalParameters || 0}
                </p>
              </div>
            </DetectiveCard>
          </div>
        )}

        {/* Economy Tab */}
        {activeTab === 'economy' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Settings className="w-12 h-12 text-detective-gold mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">Parámetros Totales</p>
                  <p className="text-3xl font-bold text-detective-gold">
                    {stats?.totalParameters || 0}
                  </p>
                </div>
              </DetectiveCard>
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Target className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">Parámetros Activos</p>
                  <p className="text-3xl font-bold text-blue-400">{stats?.activeParameters || 0}</p>
                </div>
              </DetectiveCard>
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Coins className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">Categoría Coins</p>
                  <p className="text-3xl font-bold text-green-400">
                    {/* BUG-ADMIN-009: Safe access a category con validación */}
                    {parametersData?.data.filter(p => p?.category === 'coins').length || 0}
                  </p>
                </div>
              </DetectiveCard>
            </div>

            <DetectiveCard>
              <h2 className="text-xl font-bold text-detective-text mb-4">Parámetros de Economía</h2>
              {parametersData && parametersData.data.length > 0 ? (
                <div className="space-y-3">
                  {/* BUG-ADMIN-009: Validar parámetros antes de renderizar */}
                  {parametersData.data
                    .filter((param) => {
                      // Validar con Zod inline
                      try {
                        ParameterSchema.parse(param);
                        return param.category === 'coins' || param.category === 'bonuses';
                      } catch (error) {
                        console.warn('Invalid parameter structure:', param, error);
                        return false;
                      }
                    })
                    .map((param) => (
                      <div
                        key={param.id}
                        className="flex items-center justify-between p-3 bg-detective-bg-secondary rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-detective-text">{param.key}</p>
                          {param.description && (
                            <p className="text-xs text-detective-text-secondary">{param.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-detective-gold">
                            {param.value}{param.dataType === 'percentage' ? '%' : ''}
                          </p>
                          {param.defaultValue && (
                            <p className="text-xs text-detective-text-secondary">
                              Default: {param.defaultValue}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  <DetectiveButton
                    variant="primary"
                    onClick={() => alert('Edición de parámetros - Funcionalidad próximamente')}
                    className="w-full mt-4"
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Configurar Parámetros
                  </DetectiveButton>
                </div>
              ) : (
                <div className="text-center py-8 text-detective-text-secondary">
                  No hay parámetros de economía configurados
                </div>
              )}
            </DetectiveCard>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Settings className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">Total Parámetros</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {stats?.totalParameters || 0}
                  </p>
                </div>
              </DetectiveCard>
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Award className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">Parámetros Activos</p>
                  <p className="text-2xl font-bold text-purple-400">{stats?.activeParameters || 0}</p>
                </div>
              </DetectiveCard>
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Star className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">Total Rangos Maya</p>
                  <p className="text-2xl font-bold text-blue-400">{stats?.totalRanks || 0}</p>
                </div>
              </DetectiveCard>
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">Rangos Activos</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.activeRanks || 0}</p>
                </div>
              </DetectiveCard>
            </div>

            {/* Desglose por categorías */}
            <DetectiveCard>
              <h2 className="text-xl font-bold text-detective-text mb-4">Parámetros por Categoría</h2>
              {parametersData && parametersData.data.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {(['points', 'coins', 'levels', 'ranks', 'penalties', 'bonuses'] as const).map(category => {
                    const count = parametersData.data.filter(p => p.category === category).length;
                    return (
                      <div key={category} className="text-center p-4 bg-detective-bg-secondary rounded-lg">
                        <p className="text-sm text-detective-text-secondary mb-1 capitalize">{category}</p>
                        <p className="text-2xl font-bold text-detective-text">{count}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-detective-text-secondary">
                  No hay datos de parámetros disponibles
                </div>
              )}
            </DetectiveCard>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
