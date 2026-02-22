/**
 * QuickActionsGrid Component
 *
 * Grid of quick action buttons for common admin tasks.
 * Provides fast access to key management features.
 *
 * Features:
 * - 6 action buttons with large icons
 * - Gradient backgrounds
 * - Hover effects with scale animation
 * - Route navigation
 * - Badge indicators for pending items
 */

import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Building, Flag, FileText, BarChart3, Settings, ArrowRight } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

interface QuickAction {
  title: string;
  description: string;
  icon: ElementType;
  link: string;
  gradient: string;
  badge?: number;
  color: string;
}

interface QuickActionsGridProps {
  pendingApprovals?: number;
  flaggedContent?: number;
}

export const QuickActionsGrid = ({ flaggedContent = 0 }: QuickActionsGridProps) => {
  // ============================================================================
  // ACTIONS DATA
  // ============================================================================

  const actions: QuickAction[] = [
    {
      title: 'Manage Users',
      description: 'View, edit, and manage user accounts',
      icon: Users,
      link: '/admin/users',
      gradient: 'from-blue-500/20 to-blue-600/10',
      color: 'blue',
    },
    {
      title: 'View Organizations',
      description: 'Manage schools and institutions',
      icon: Building,
      link: '/admin/organizations',
      gradient: 'from-purple-500/20 to-purple-600/10',
      color: 'purple',
    },
    {
      title: 'Content Moderation',
      description: 'Review flagged content and reports',
      icon: Flag,
      link: '/admin/content/moderation',
      gradient: 'from-red-500/20 to-red-600/10',
      badge: flaggedContent,
      color: 'red',
    },
    {
      title: 'System Logs',
      description: 'View system logs and error tracking',
      icon: FileText,
      link: '/admin/logs',
      gradient: 'from-green-500/20 to-green-600/10',
      color: 'green',
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      icon: BarChart3,
      link: '/admin/analytics',
      gradient: 'from-orange-500/20 to-orange-600/10',
      color: 'orange',
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      link: '/admin/settings',
      gradient: 'from-gray-500/20 to-gray-600/10',
      color: 'gray',
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {actions.map((action, index) => (
        <QuickActionCard key={action.title} action={action} index={index} />
      ))}
    </div>
  );
};

// ============================================================================
// QUICK ACTION CARD COMPONENT
// ============================================================================

interface QuickActionCardProps {
  action: QuickAction;
  index: number;
}

const QuickActionCard = ({ action, index }: QuickActionCardProps) => {
  const Icon = action.icon;

  // Get color classes
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { text: string; border: string; hover: string }> = {
      blue: {
        text: 'text-blue-500',
        border: 'border-blue-500/30',
        hover: 'hover:border-blue-500/50',
      },
      purple: {
        text: 'text-purple-500',
        border: 'border-purple-500/30',
        hover: 'hover:border-purple-500/50',
      },
      red: { text: 'text-red-500', border: 'border-red-500/30', hover: 'hover:border-red-500/50' },
      green: {
        text: 'text-green-500',
        border: 'border-green-500/30',
        hover: 'hover:border-green-500/50',
      },
      orange: {
        text: 'text-orange-500',
        border: 'border-orange-500/30',
        hover: 'hover:border-orange-500/50',
      },
      gray: {
        text: 'text-gray-500',
        border: 'border-gray-500/30',
        hover: 'hover:border-gray-500/50',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const colors = getColorClasses(action.color);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={action.link}>
        <DetectiveCard
          className={`group border ${colors.border} ${colors.hover} hover-lift relative overflow-hidden transition-all duration-300`}
        >
          {/* Background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-50 transition-opacity duration-300 group-hover:opacity-100`}
          />

          <div className="relative">
            <div className="mb-4 flex items-start justify-between">
              {/* Icon */}
              <motion.div
                className={`rounded-xl bg-detective-bg-secondary p-4`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className={`h-8 w-8 ${colors.text}`} />
              </motion.div>

              {/* Badge */}
              {action.badge !== undefined && action.badge > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white"
                >
                  {action.badge > 99 ? '99+' : action.badge}
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="mb-4">
              <h3 className="text-detective-subtitle mb-2 transition-colors group-hover:text-detective-orange">
                {action.title}
              </h3>
              <p className="text-detective-small text-gray-400">{action.description}</p>
            </div>

            {/* Arrow indicator */}
            <div className="text-detective-small flex items-center gap-2 text-gray-500 transition-colors group-hover:text-detective-orange">
              <span>Go to section</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </div>
          </div>
        </DetectiveCard>
      </Link>
    </motion.div>
  );
};
