/**
 * ProfileStatsTab - Activity charts (Recharts) for the profile page.
 *
 * NOTE: Currently uses mock/demo data. Will be replaced with real API data.
 *
 * @module apps/student/components/profile/ProfileStatsTab
 */

import { Activity, Target, Info } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

// Mock data (TODO: replace with real API data from analytics endpoint)
const MOCK_ACTIVITY_DATA = [
  { date: '2025-01-15', xp: 50, coins: 25, exercises: 2 },
  { date: '2025-01-16', xp: 75, coins: 40, exercises: 3 },
  { date: '2025-01-17', xp: 100, coins: 50, exercises: 4 },
  { date: '2025-01-18', xp: 60, coins: 30, exercises: 2 },
  { date: '2025-01-19', xp: 120, coins: 60, exercises: 5 },
  { date: '2025-01-20', xp: 90, coins: 45, exercises: 3 },
  { date: '2025-01-21', xp: 150, coins: 75, exercises: 6 },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });

function DemoBadge() {
  return (
    <div className="absolute right-2 top-2 z-10">
      <span className="inline-flex items-center gap-1 rounded border border-yellow-500/30 bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-700">
        <Info className="h-3 w-3" />
        Datos de demostracion
      </span>
    </div>
  );
}

export function ProfileStatsTab() {
  return (
    <div className="space-y-6">
      {/* Activity Chart */}
      <DetectiveCard>
        <div className="relative">
          <DemoBadge />
          <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-detective-text">
            <Activity className="h-6 w-6 text-detective-orange" />
            Actividad de los ultimos 7 dias
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={MOCK_ACTIVITY_DATA}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCoins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorXp)"
                name="XP Ganado"
              />
              <Area
                type="monotone"
                dataKey="coins"
                stroke="#EAB308"
                fillOpacity={1}
                fill="url(#colorCoins)"
                name="ML Coins"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DetectiveCard>

      {/* Exercises Chart */}
      <DetectiveCard>
        <div className="relative">
          <DemoBadge />
          <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-detective-text">
            <Target className="h-6 w-6 text-detective-orange" />
            Ejercicios Completados
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={MOCK_ACTIVITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="exercises" fill="#A855F7" name="Ejercicios" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DetectiveCard>
    </div>
  );
}
