import { useAuth } from '@/app/providers/AuthContext';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { RankBadge } from '@shared/components/base/RankBadge';
import { User, Mail, Calendar, Trophy, Target, Coins, Loader2 } from 'lucide-react';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { useUserStatistics } from '@shared/hooks/useUserStatistics';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  // Use useUserGamification hook for gamification data
  const { gamificationData } = useUserGamification(user?.id);

  // Use useUserStatistics hook for real statistics from backend
  const { data: userStats, isLoading, error } = useUserStatistics(user?.id);

  // Build stats array from real data
  const stats = userStats
    ? [
        {
          label: 'ML Coins',
          value: userStats.total_ml_coins.toString(),
          icon: Coins,
          color: 'text-detective-gold',
        },
        {
          label: 'Logros Desbloqueados',
          value: `${userStats.achievements_earned || 0}/${userStats.total_achievements}`,
          icon: Trophy,
          color: 'text-detective-orange',
        },
        {
          label: 'Ejercicios Completados',
          value: userStats.total_exercises.toString(),
          icon: Target,
          color: 'text-detective-blue',
        },
      ]
    : [];

  // Loading state while fetching statistics
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
        <GamifiedHeader
          user={user ?? undefined}
          gamificationData={gamificationData}
          onLogout={async () => {
            await logout();
          }}
        />
        <main className="detective-container py-8">
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-detective-orange" />
          </div>
        </main>
      </div>
    );
  }

  // Error state if statistics fail to load
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
        <GamifiedHeader
          user={user ?? undefined}
          gamificationData={gamificationData}
          onLogout={async () => {
            await logout();
          }}
        />
        <main className="detective-container py-8">
          <DetectiveCard hoverable={false} className="border-red-200 bg-red-50">
            <div className="p-4 text-center">
              <p className="mb-2 font-semibold text-red-600">Error al cargar estadísticas</p>
              <p className="text-sm text-red-500">
                {error.message || 'No se pudieron obtener los datos del usuario'}
              </p>
            </div>
          </DetectiveCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <GamifiedHeader
        user={user ?? undefined}
        gamificationData={gamificationData}
        onLogout={async () => {
          await logout();
          // No need to navigate - performLogout() handles redirect
        }}
      />

      <main className="detective-container py-8">
        <h1 className="mb-8 text-4xl font-bold text-detective-text">Mi Perfil</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Info Principal */}
          <div className="lg:col-span-1">
            <DetectiveCard hoverable={false}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-detective-orange to-detective-gold">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-detective-text">
                  {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
                </h2>
                <p className="mb-4 flex items-center gap-2 text-detective-text-secondary">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </p>
                <RankBadge rank="detective_novato" showIcon={true} />
                <p className="mt-4 flex items-center gap-2 text-sm text-detective-text-secondary">
                  <Calendar className="h-4 w-4" />
                  Miembro desde: Enero 2025
                </p>
              </div>
            </DetectiveCard>
          </div>

          {/* Estadísticas */}
          <div className="lg:col-span-2">
            <DetectiveCard hoverable={false} className="mb-6">
              <h3 className="mb-4 text-xl font-bold text-detective-text">Estadísticas</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-lg bg-detective-bg p-4"
                    >
                      <div className={`${stat.color}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-detective-text">{stat.value}</p>
                        <p className="text-sm text-detective-text-secondary">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DetectiveCard>

            <DetectiveCard hoverable={false}>
              <h3 className="mb-4 text-xl font-bold text-detective-text">Logros Recientes</h3>
              <div className="space-y-3">
                {[
                  { title: 'Primer Caso Resuelto', date: 'Hace 2 días' },
                  { title: 'Racha de 5 días', date: 'Hace 1 semana' },
                  { title: 'Maestro del Crucigrama', date: 'Hace 2 semanas' },
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-detective-bg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-detective-gold" />
                      <div>
                        <p className="font-semibold text-detective-text">{achievement.title}</p>
                        <p className="text-sm text-detective-text-secondary">{achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DetectiveCard>
          </div>
        </div>
      </main>
    </div>
  );
}
