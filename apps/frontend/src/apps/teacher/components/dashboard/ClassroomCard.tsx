import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Activity,
  MoreVertical,
  Eye,
  Edit,
  BarChart3,
  Trash2,
  BookOpen,
} from 'lucide-react';
import type { DashboardClassroom } from '../../types';

interface ClassroomCardProps {
  classroom: DashboardClassroom;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onViewAnalytics: (id: string) => void;
  onDelete?: (id: string) => void;
}

const subjectColors: Record<string, { from: string; to: string; accent: string }> = {
  Math: {
    from: 'from-blue-500',
    to: 'to-blue-600',
    accent: 'bg-blue-100 text-blue-700',
  },
  Science: {
    from: 'from-green-500',
    to: 'to-green-600',
    accent: 'bg-green-100 text-green-700',
  },
  History: {
    from: 'from-purple-500',
    to: 'to-purple-600',
    accent: 'bg-purple-100 text-purple-700',
  },
  Language: {
    from: 'from-orange-500',
    to: 'to-orange-600',
    accent: 'bg-orange-100 text-orange-700',
  },
  default: {
    from: 'from-gray-500',
    to: 'to-gray-600',
    accent: 'bg-gray-100 text-gray-700',
  },
};

const getSubjectColor = (subject: string) => {
  return subjectColors[subject] || subjectColors.default;
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const ClassroomCard: React.FC<ClassroomCardProps> = ({
  classroom,
  onView,
  onEdit,
  onViewAnalytics,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const colors = getSubjectColor(classroom.subject);

  const capacityPercentage = (classroom.studentCount / classroom.capacity) * 100;
  const isNearCapacity = capacityPercentage > 80;

  const menuItems = [
    {
      icon: Eye,
      label: 'View Details',
      onClick: () => {
        onView(classroom.id);
        setShowMenu(false);
      },
    },
    {
      icon: Edit,
      label: 'Edit Classroom',
      onClick: () => {
        onEdit(classroom.id);
        setShowMenu(false);
      },
    },
    {
      icon: BarChart3,
      label: 'View Analytics',
      onClick: () => {
        onViewAnalytics(classroom.id);
        setShowMenu(false);
      },
    },
  ];

  if (onDelete) {
    menuItems.push({
      icon: Trash2,
      label: 'Delete Classroom',
      onClick: () => {
        if (window.confirm('Are you sure you want to delete this classroom?')) {
          onDelete(classroom.id);
        }
        setShowMenu(false);
      },
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
    >
      {/* Gradient Header */}
      <div
        className={`h-32 bg-gradient-to-br ${colors.from} ${colors.to} relative overflow-hidden p-6`}
      >
        {/* Decorative circles */}
        <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10"></div>
        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/10"></div>

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <div
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colors.accent} mb-2 bg-white/90`}
            >
              {classroom.subject}
            </div>
            <h3 className="truncate text-xl font-bold text-white">{classroom.name}</h3>
            <p className="mt-1 text-sm text-white/80">Grade {classroom.grade}</p>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg bg-white/20 p-2 transition-colors hover:bg-white/30"
            >
              <MoreVertical className="h-5 w-5 text-white" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg bg-white shadow-xl"
                  >
                    {menuItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={index}
                          onClick={item.onClick}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{classroom.studentCount}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{classroom.averageScore}%</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Capacity</span>
            <span
              className={`text-xs font-semibold ${isNearCapacity ? 'text-orange-600' : 'text-gray-600'}`}
            >
              {classroom.studentCount}/{classroom.capacity}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capacityPercentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-full rounded-full ${isNearCapacity ? 'bg-orange-500' : 'bg-blue-500'}`}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Last activity: {getTimeAgo(new Date(classroom.recentActivity))}</span>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              classroom.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span
              className={`mr-2 h-2 w-2 rounded-full ${classroom.isActive ? 'bg-green-500' : 'bg-gray-500'}`}
            />
            {classroom.isActive ? 'Active' : 'Inactive'}
          </span>

          <button
            onClick={() => onView(classroom.id)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            <BookOpen className="h-4 w-4" />
            Open
          </button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent transition-colors duration-300 group-hover:border-blue-400`}
      />
    </motion.div>
  );
};
