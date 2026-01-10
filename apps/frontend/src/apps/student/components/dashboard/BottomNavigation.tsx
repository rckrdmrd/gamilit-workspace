import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Trophy, Bell, User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  ariaLabel: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
    ariaLabel: 'Ir al Dashboard Principal',
  },
  {
    id: 'modules',
    label: 'Modules',
    icon: BookOpen,
    path: '/modules',
    ariaLabel: 'Ver Módulos Educativos',
  },
  {
    id: 'gamification',
    label: 'Gamification',
    icon: Trophy,
    path: '/gamification',
    ariaLabel: 'Ver Gamificación y Logros',
  },
  {
    id: 'notifications',
    label: 'Alerts',
    icon: Bell,
    path: '/notifications',
    ariaLabel: 'Ver Notificaciones',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    ariaLabel: 'Ver Perfil de Usuario',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    ariaLabel: 'Abrir Configuración',
  },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  // Using Zustand selectors to prevent unnecessary re-renders
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-detective-bg-secondary bg-white shadow-lg md:hidden"
      role="navigation"
      aria-label="Navegación Principal"
    >
      <div className="flex h-16 items-center justify-around px-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className="relative flex min-h-[44px] min-w-[44px] flex-1 touch-manipulation flex-col items-center justify-center gap-1"
              aria-label={item.ariaLabel}
              aria-currentStep={active ? 'page' : undefined}
            >
              {/* Ripple effect background */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg bg-detective-bg"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon with animation */}
              <motion.div
                className="relative z-10"
                animate={{
                  scale: active ? 1.1 : 1,
                  y: active ? -2 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 17,
                }}
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    active ? 'text-detective-orange' : 'text-detective-text-secondary'
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />

                {/* Notification Badge */}
                {item.id === 'notifications' && unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1"
                  >
                    <span className="text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Label */}
              <span
                className={`relative z-10 text-xs font-medium transition-colors ${
                  active ? 'text-detective-orange' : 'text-detective-text-secondary'
                }`}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {active && (
                <motion.div
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-detective-orange"
                  layoutId="activeIndicator"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
