/**
 * AdminClassroomTeacherPage
 *
 * Page for managing classroom-teacher assignments (US-AE-007)
 *
 * Features:
 * - View teachers assigned to a classroom
 * - View classrooms assigned to a teacher
 * - Assign/remove teachers to/from classrooms
 * - Two tabs: By Classroom and By Teacher
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap } from 'lucide-react';
import { cn } from '@shared/utils/cn';

// Import tab components
import { ClassroomTeachersTab } from '../components/classroom-teacher/ClassroomTeachersTab';
import { TeacherClassroomsTab } from '../components/classroom-teacher/TeacherClassroomsTab';

type TabType = 'classroom' | 'teacher';

export default function AdminClassroomTeacherPage() {
  const [currentTab, setCurrentTab] = useState<TabType>('classroom');

  const tabs = [
    {
      id: 'classroom' as TabType,
      label: 'Por Classroom',
      icon: GraduationCap,
      color: 'blue',
      description: 'Ver y gestionar teachers asignados a cada classroom',
    },
    {
      id: 'teacher' as TabType,
      label: 'Por Teacher',
      icon: Users,
      color: 'purple',
      description: 'Ver y gestionar classrooms asignados a cada teacher',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Asignaciones Classroom-Teacher</h1>
          <p className="text-gray-600">Gestiona las asignaciones entre classrooms y teachers</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
          <div className="mb-4 flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentTab(tab.id)}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-6 py-3 font-semibold',
                    'transition-all duration-300',
                    isActive
                      ? `bg-gradient-to-r ${getTabGradient(tab.color)} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-white/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Tab Description */}
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-gray-600"
          >
            {tabs.find((t) => t.id === currentTab)?.description}
          </motion.div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentTab === 'classroom' && <ClassroomTeachersTab />}
          {currentTab === 'teacher' && <TeacherClassroomsTab />}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Helper: Get tab gradient colors
 */
function getTabGradient(color: string): string {
  const gradients: Record<string, string> = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
  };
  return gradients[color] || gradients.blue;
}
