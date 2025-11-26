/**
 * TrophyRoom Component
 * Gallery view of unlocked achievements
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { useAchievements } from '../../hooks/useAchievements';
import { AchievementCard } from './AchievementCard';

export const TrophyRoom: React.FC = () => {
  const { unlockedAchievements } = useAchievements();

  const legendaryAchievements = unlockedAchievements.filter((a) => a.rarity === 'legendary');
  const epicAchievements = unlockedAchievements.filter((a) => a.rarity === 'epic');
  const rareAchievements = unlockedAchievements.filter((a) => a.rarity === 'rare');
  const commonAchievements = unlockedAchievements.filter((a) => a.rarity === 'common');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-detective bg-gradient-to-r from-detective-orange to-detective-gold p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-detective-3xl font-bold">Sala de Trofeos</h1>
            <p className="text-detective-lg opacity-90">Tus logros más preciados</p>
          </div>
          <Icons.Trophy className="h-20 w-20 opacity-50" />
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-detective-3xl font-bold">{legendaryAchievements.length}</p>
            <p className="text-detective-sm opacity-80">Legendarios</p>
          </div>
          <div className="text-center">
            <p className="text-detective-3xl font-bold">{epicAchievements.length}</p>
            <p className="text-detective-sm opacity-80">Épicos</p>
          </div>
          <div className="text-center">
            <p className="text-detective-3xl font-bold">{rareAchievements.length}</p>
            <p className="text-detective-sm opacity-80">Raros</p>
          </div>
          <div className="text-center">
            <p className="text-detective-3xl font-bold">{commonAchievements.length}</p>
            <p className="text-detective-sm opacity-80">Comunes</p>
          </div>
        </div>
      </div>

      {/* Legendary Section */}
      {legendaryAchievements.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-detective-2xl font-bold text-detective-text">
            <Icons.Crown className="h-6 w-6 text-detective-gold" />
            Legendarios
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {legendaryAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Epic Section */}
      {epicAchievements.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-detective-2xl font-bold text-detective-text">
            <Icons.Star className="h-6 w-6 text-detective-orange" />
            Épicos
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {epicAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Rare and Common in tabs or collapsed */}
      {(rareAchievements.length > 0 || commonAchievements.length > 0) && (
        <div>
          <h2 className="mb-4 text-detective-2xl font-bold text-detective-text">Otros Logros</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...rareAchievements, ...commonAchievements].map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {unlockedAchievements.length === 0 && (
        <div className="py-12 text-center">
          <Icons.Trophy className="mx-auto mb-4 h-24 w-24 text-gray-200" />
          <p className="text-detective-xl text-detective-text-secondary">
            Aún no has desbloqueado ningún logro
          </p>
          <p className="mt-2 text-detective-base text-detective-text-secondary">
            Completa ejercicios para comenzar tu colección
          </p>
        </div>
      )}
    </div>
  );
};
