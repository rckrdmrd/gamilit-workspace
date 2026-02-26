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
import { AdminPageShell } from '../components/shared';

// Import tab components
import { ClassroomTeachersTab } from '../components/classroom-teacher/ClassroomTeachersTab';
import { TeacherClassroomsTab } from '../components/classroom-teacher/TeacherClassroomsTab';

type TabType = 'classroom' | 'teacher';

export default function AdminClassroomTeacherPage() {
  const [currentTab, setCurrentTab] = useState<TabType>('classroom');

  const tabs = [
    {
      id: 'classroom' as TabType,
      label: 'Por Aula',
      icon: GraduationCap,
      color: 'blue',
      description: 'Ver y gestionar docentes asignados a cada aula',
    },
    {
      id: 'teacher' as TabType,
      label: 'Por Docente',
      icon: Users,
      color: 'purple',
      description: 'Ver y gestionar aulas asignadas a cada docente',
    },
  ];

  return (
    <AdminPageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-detective-text">
            Asignaciones Aula-Docente
          </h1>
          <p className="text-detective-text-secondary">
            Gestiona las asignaciones entre aulas y docentes
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-detective-card-bg mb-6 rounded-xl p-6 shadow-md">
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
                      : 'bg-detective-bg-secondary text-detective-text hover:bg-detective-bg',
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
            className="text-sm text-detective-text-secondary"
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
    </AdminPageShell>
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
