/**
 * UsersStatsGrid - Stats cards for the users management page
 *
 * Renders a 6-column grid of DetectiveCard stat items showing
 * total, active, inactive, students, teachers, and admins counts.
 */

import { DetectiveCard } from '@shared/components/base/DetectiveCard';

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  students: number;
  teachers: number;
  admins: number;
}

interface UsersStatsGridProps {
  stats: UserStats;
}

const STAT_ITEMS: { key: keyof UserStats; label: string; color: string }[] = [
  { key: 'total', label: 'Total', color: 'text-detective-text' },
  { key: 'active', label: 'Activos', color: 'text-green-500' },
  { key: 'inactive', label: 'Inactivos', color: 'text-red-500' },
  { key: 'students', label: 'Estudiantes', color: 'text-blue-500' },
  { key: 'teachers', label: 'Profesores', color: 'text-purple-500' },
  { key: 'admins', label: 'Admins', color: 'text-red-500' },
];

export function UsersStatsGrid({ stats }: UsersStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {STAT_ITEMS.map((item) => (
        <DetectiveCard key={item.key} hoverable={false}>
          <div className="text-center">
            <p className="mb-1 text-sm text-detective-text-secondary">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{stats[item.key]}</p>
          </div>
        </DetectiveCard>
      ))}
    </div>
  );
}
