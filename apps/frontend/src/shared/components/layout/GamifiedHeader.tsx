import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@shared/utils/cn';
import {
  Settings,
  LogOut,
  Crown,
  Star,
  Zap,
  Trophy,
  Medal,
  ChevronDown,
  User as UserIcon,
  Building2,
  Coins,
} from 'lucide-react';
import type { User, UserGamificationData } from '@shared/types';
import type { User as AuthUser } from '@features/auth/types/auth.types';
import { getUserFullName } from '@features/auth/types/auth.types';
import { NotificationBell } from '../../../features/notifications/components/NotificationBell';
import { BrandingContext } from '@/app/providers/BrandingProvider';
import { DEFAULT_BRANDING } from '@/shared/types/branding.types';
import { AvatarDisplay } from '../AvatarDisplay';
import { useEquippedVisuals } from '@/features/gamification/social/hooks/useEquippedVisuals';

export interface GamifiedHeaderProps {
  user?: User | AuthUser;
  onLogout?: () => void;
  gamificationData?: UserGamificationData | null;
  organizationName?: string;
}

/**
 * HeaderUserStats - Tipo de vista local para el header
 *
 * NOTA: Este es un tipo de vista simplificado específico para GamifiedHeader.
 * Para el tipo completo de UserStats, ver: @/shared/types/user-stats.types.ts
 */
interface HeaderUserStats {
  level: number;
  xp: number;
  xpToNext: number;
  ml: number;
  rank: string;
  badges: string[];
}

export const GamifiedHeader: React.FC<GamifiedHeaderProps> = ({
  user,
  onLogout,
  gamificationData,
  organizationName,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const branding = useContext(BrandingContext);
  const platformName = branding?.config?.platformName ?? DEFAULT_BRANDING.platformName;
  const logoIconUrl = branding?.config?.logoIconUrl ?? DEFAULT_BRANDING.logoIconUrl;

  // Equipped cosmetics (avatar, frame)
  const { avatar, frame } = useEquippedVisuals();
  const avatarSrc =
    avatar?.src ||
    (user && 'avatar_url' in user ? (user.avatar_url as string | undefined) : null) ||
    null;
  const frameColor = frame?.borderColor || null;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-dropdown') && !target.closest('.user-menu-button')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use real gamification data or fallback to default values
  // Support both old (xp, ml, badges) and new (totalXP, mlCoins, achievements) field names for backward compatibility
  // Use Record<string, unknown> for flexible field access since gamificationData
  // may come in different shapes (old vs new field names)
  const gd = gamificationData as Record<string, unknown> | null | undefined;
  const userStats: HeaderUserStats = {
    level: gamificationData?.level || 1,
    xp: (gd?.totalXP as number) || (gd?.xp as number) || 0,
    xpToNext: (gd?.xp_to_next as number) || 100,
    ml: (gd?.mlCoins as number) || (gd?.ml as number) || 0,
    rank: gamificationData?.rank || 'Detective Novato',
    badges: (gd?.achievements as string[]) || (gd?.badges as string[]) || [],
  };

  const xpProgress = (userStats.xp / userStats.xpToNext) * 100;

  const badgeIcons: { [key: string]: React.ElementType } = {
    first_case: Trophy,
    streak_master: Zap,
    logic_champion: Crown,
    first_login: Star,
    first_module: Medal,
  };

  const getBadgeIcon = (badgeType: string) => {
    return badgeIcons[badgeType] || Star;
  };

  const getRankColor = (rank: string) => {
    const rankColors: { [key: string]: string } = {
      'Detective Senior': 'from-yellow-500 to-orange-500',
      'Detective Novato': 'from-green-500 to-teal-500',
      Inspector: 'from-blue-500 to-indigo-500',
      'Chief Inspector': 'from-purple-500 to-pink-500',
      Oficial: 'from-orange-500 to-red-500',
    };
    return rankColors[rank] || 'from-gray-500 to-gray-600';
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl shadow-orange-900/25">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y Branding */}
          <div className="flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="flex items-center space-x-3 transition-opacity hover:opacity-90"
            >
              {logoIconUrl ? (
                <img src={logoIconUrl} alt="" className="h-10 w-10 object-contain" aria-hidden="true" />
              ) : (
                <span className="text-2xl" aria-hidden="true">
                  🕵️‍♂️
                </span>
              )}
              <div className="hidden sm:block">
                <p className="text-lg font-bold leading-tight text-white">GAMILIT</p>
                <p className="text-xs font-medium leading-tight text-white/80">lee y gana</p>
              </div>
              <span className="sr-only">{platformName}</span>
            </Link>

            {/* Current Organization Display */}
            {organizationName && (
              <div className="flex items-center space-x-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <Building2 className="h-4 w-4 text-white/90" aria-hidden="true" />
                <span className="max-w-32 truncate text-sm font-medium text-white/90">
                  {organizationName}
                </span>
              </div>
            )}
          </div>

          {/* Sistema de Gamificación Central */}
          <div className="flex items-center space-x-6">
            {/* XP y Nivel - Solo para estudiantes */}
            {user?.role === 'student' && (
              <div className="hidden items-center space-x-3 lg:flex">
                <div className="text-center">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    <span className="text-lg font-bold text-white">Lvl {userStats.level}</span>
                  </div>
                  <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-white/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                      className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                    />
                  </div>
                  <span className="text-xs text-orange-100">
                    {userStats.xp} / {userStats.xpToNext} XP
                  </span>
                </div>
              </div>
            )}

            {/* ML Counter - Solo para estudiantes */}
            {user?.role === 'student' && (
              <div className="hidden items-center space-x-2 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 shadow-sm md:flex">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm"
                >
                  <Coins className="h-4 w-4 text-white" />
                </motion.div>
                <span className="font-bold text-green-700">{userStats.ml.toLocaleString()}</span>
              </div>
            )}

            {/* Rank Badge - Solo para estudiantes */}
            {user?.role === 'student' && (
              <div
                className={cn(
                  'hidden items-center space-x-1 rounded-full bg-gradient-to-r px-3 py-1 text-white shadow-md sm:flex',
                  getRankColor(userStats.rank),
                )}
              >
                <Crown className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-semibold">{userStats.rank}</span>
              </div>
            )}

            {/* Achievement Badges - Solo para estudiantes */}
            {user?.role === 'student' && userStats.badges.length > 0 && (
              <div className="hidden items-center space-x-1 xl:flex">
                {userStats.badges.slice(0, 3).map((badgeType, index) => {
                  const IconComponent = getBadgeIcon(badgeType);
                  return (
                    <motion.div
                      key={badgeType}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 200,
                        damping: 12,
                      }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg"
                      title={`Badge: ${badgeType.replace(/_/g, ' ')}`}
                    >
                      <IconComponent className="h-4 w-4 text-white" />
                    </motion.div>
                  );
                })}
                {userStats.badges.length > 3 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white shadow-md">
                    +{userStats.badges.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controles de Usuario */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <NotificationBell />

            {/* Menu de Usuario */}
            <div className="user-menu-dropdown relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-menu-button flex items-center space-x-2 rounded-lg bg-white/10 px-3 py-2 transition-colors hover:bg-white/20"
                aria-label="Menú de usuario"
              >
                <AvatarDisplay
                  src={avatarSrc}
                  name={user ? getUserFullName(user) : 'U'}
                  frameColor={frameColor}
                  frameClass={frame?.cssClass}
                  frameSrc={frame?.assetUrl}
                  glowColor={avatar?.glowColor}
                  size="sm"
                />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-white">
                    {user ? getUserFullName(user) : 'Detective'}
                  </p>
                  <p className="text-xs capitalize text-orange-100">{user?.role || 'student'}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-white" />
              </motion.button>

              {/* Dropdown del Usuario */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                  >
                    {/* Header del menú */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4">
                      <div className="flex items-center space-x-3">
                        <AvatarDisplay
                          src={avatarSrc}
                          name={user ? getUserFullName(user) : 'U'}
                          frameColor={frameColor}
                          frameClass={frame?.cssClass}
                          frameSrc={frame?.assetUrl}
                          glowColor={avatar?.glowColor}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-white">
                            {user ? getUserFullName(user) : 'Detective'}
                          </p>
                          <p className="truncate text-sm text-white/80">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Opciones */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex w-full items-center space-x-2 px-4 py-2 text-left transition-colors hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Mi Perfil</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex w-full items-center space-x-2 px-4 py-2 text-left transition-colors hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Configuración</span>
                      </Link>
                      <Link
                        to="/achievements"
                        className="flex w-full items-center space-x-2 px-4 py-2 text-left transition-colors hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Trophy className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Mis Logros</span>
                      </Link>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout?.();
                        }}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-left text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Cerrar Sesión</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

GamifiedHeader.displayName = 'GamifiedHeader';
