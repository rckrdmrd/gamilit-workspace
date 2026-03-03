import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Settings, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export interface NotificationHeaderProps {
  unreadCount: number;
  isRefreshing: boolean;
  showFilters: boolean;
  onRefresh: () => void;
  onToggleFilters: () => void;
  onMarkAllAsRead: () => void;
}

export const NotificationHeader = ({
  unreadCount,
  isRefreshing,
  showFilters,
  onRefresh,
  onToggleFilters,
  onMarkAllAsRead,
}: NotificationHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
        <Bell className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Notificaciones</h1>
        <p className="text-gray-400">
          {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leidas'}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors min-w-[44px] min-h-[44px]"
      >
        <RefreshCw className={cn('w-5 h-5 text-white', isRefreshing && 'animate-spin')} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleFilters}
        className={cn(
          'p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px]',
          showFilters ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white',
        )}
      >
        <Filter className="w-5 h-5" />
      </motion.button>

      {unreadCount > 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMarkAllAsRead}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Marcar todas</span>
        </motion.button>
      )}

      <Link
        to="/admin/settings/notifications"
        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors min-w-[44px] min-h-[44px]"
      >
        <Settings className="w-5 h-5 text-white" />
      </Link>
    </div>
  </div>
);
