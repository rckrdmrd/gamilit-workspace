/**
 * ProfileHero - Hero section with avatar, user info, and quick stats.
 *
 * @module apps/student/components/profile/ProfileHero
 */

import { motion } from 'framer-motion';
import { User, Mail, Calendar, Camera } from 'lucide-react';
import { RankBadge } from '@shared/components/base/RankBadge';
import { StreakIndicator } from '@/features/gamification/components/StreakIndicator';
import type { RankType } from '@shared/components/base/RankBadge';
import type { ProfileStat } from './types';

interface ProfileHeroProps {
  user: {
    id?: string;
    fullName?: string;
    email?: string;
    avatar_url?: string;
    createdAt?: string;
  } | null;
  rankType: RankType;
  stats: ProfileStat[];
  equippedFrameColor?: string;
  onAvatarClick: () => void;
}

export function ProfileHero({ user, rankType, stats, equippedFrameColor, onAvatarClick }: ProfileHeroProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-8 text-white shadow-xl">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          {/* Avatar */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white/20 backdrop-blur-sm"
              style={equippedFrameColor
                ? { borderWidth: 4, borderStyle: 'solid', borderColor: equippedFrameColor }
                : { borderWidth: 4, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.3)' }
              }
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-16 w-16" />
              )}
            </motion.div>
            <button
              onClick={onAvatarClick}
              className="absolute bottom-0 right-0 rounded-full bg-white p-2 text-detective-orange shadow-lg transition-transform hover:scale-110"
              title="Cambiar avatar"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="mb-2 text-4xl font-bold">{user?.fullName || 'Detective'}</h1>
            <p className="mb-4 flex items-center justify-center gap-2 text-white/80 md:justify-start">
              <Mail className="h-4 w-4" />
              {user?.email}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <RankBadge rank={rankType} showIcon={true} />
              <StreakIndicator variant="compact" />
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-white/70 md:justify-start">
              <Calendar className="h-4 w-4" />
              Miembro desde:{' '}
              {new Date(user?.createdAt || Date.now()).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
              })}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.slice(0, 2).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg bg-white/20 p-4 text-center backdrop-blur-sm"
                >
                  <Icon className="mx-auto mb-2 h-8 w-8" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
