import { useState } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useGrantBonus } from '@apps/teacher/hooks/useGrantBonus';
import { useEconomyAnalytics } from '@apps/teacher/hooks/useEconomyAnalytics';
import { useStudentsEconomy } from '@apps/teacher/hooks/useStudentsEconomy';
import { useAchievementsStats } from '@apps/teacher/hooks/useAchievementsStats';
import { useApiError } from '@shared/hooks';
import toast from 'react-hot-toast';
import {
  Coins,
  Trophy,
  TrendingUp,
  TrendingDown,
  Users,
  Gift,
  AlertCircle,
  Info,
  Plus,
  Minus,
  BarChart3,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { TeacherPageShell } from '../components/shared/TeacherPageShell';

interface StudentEconomyData {
  id: string;
  name: string;
  balance: number;
  earned_this_week: number;
  spent_this_week: number;
  rank: string;
  level: number;
}

interface ClassEconomyStats {
  total_circulation: number;
  average_balance: number;
  total_earned_today: number;
  total_spent_today: number;
  inflation_rate: number;
  wealth_distribution: {
    top_10_percent: number;
    bottom_50_percent: number;
  };
}

/**
 * TeacherGamification - Vista de Gamificación para Docentes
 *
 * FUNCIONALIDADES DISPONIBLES:
 * - ✅ Visualización de economía ML Coins (circulación, balance promedio)
 * - ✅ Leaderboard de estudiantes por ML Coins
 * - ✅ Vista de logros disponibles y estadísticas
 * - ✅ Otorgar bonus manual de ML Coins (1-1000 ML)
 *
 * RESTRICCIONES:
 * - ❌ Modificar tasas de recompensas (Solo Admin)
 * - ❌ Crear/eliminar achievements (Solo Admin)
 * - ❌ Modificar configuración de gamificación (Solo Admin)
 *
 * NOTA: Los rewards vienen predefinidos de la base de datos.
 * Para cambios en la configuración de gamificación, contactar al administrador.
 *
 * @component
 * @author Frontend-Agent
 * @version 2.0.0 - Acotada a visualización y otorgamiento de bonus
 */
export default function TeacherGamificationPage() {
  const { handleError } = useApiError();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [bonusAmount, setBonusAmount] = useState<number>(50);
  const [bonusReason, setBonusReason] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'balance' | 'level' | 'name'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [studentBalances, setStudentBalances] = useState<Record<string, number>>({});

  const { grantBonus, loading: grantingBonus, reset: resetGrant } = useGrantBonus();

  // Fetch economy analytics from API (GAP-ST-005)
  const {
    data: economyData,
    loading: economyLoading,
    error: economyError,
    refetch: refetchEconomy,
  } = useEconomyAnalytics();

  // Fetch students economy from API (GAP-ST-006)
  const {
    students: studentsData,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useStudentsEconomy();

  // Fetch achievements stats from API (GAP-ST-007)
  const {
    achievements: achievementsData,
    totalAchievements,
    totalUnlocks,
    loading: achievementsLoading,
    error: achievementsError,
    refetch: refetchAchievements,
  } = useAchievementsStats();

  // Build classStats from API data or use defaults
  const classStats: ClassEconomyStats = economyData
    ? {
      total_circulation: economyData.total_circulation,
      average_balance: economyData.average_balance,
      total_earned_today: economyData.total_earned_today,
      total_spent_today: economyData.total_spent_today,
      inflation_rate: 0, // Not calculated in backend yet
      wealth_distribution: economyData.wealth_distribution,
    }
    : {
      total_circulation: 0,
      average_balance: 0,
      total_earned_today: 0,
      total_spent_today: 0,
      inflation_rate: 0,
      wealth_distribution: {
        top_10_percent: 0,
        bottom_50_percent: 0,
      },
    };

  // Students data from API (GAP-ST-006) - transformed to match component interface
  const students: StudentEconomyData[] = studentsData.map((s) => ({
    id: s.id,
    name: s.name,
    balance: s.balance,
    earned_this_week: s.earned_this_week,
    spent_this_week: s.spent_this_week,
    rank: s.rank,
    level: s.level,
  }));

  // Filter and sort students
  const filteredStudents = students
    .filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'balance':
          comparison = a.balance - b.balance;
          break;
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Achievements data from API (GAP-ST-007)
  const achievements = achievementsData.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    reward: a.reward,
    unlocked_count: a.unlocked_count,
  }));

  const economyConfig = {
    earning_rates: {
      exercise_completion: 50,
      daily_login: 10,
      streak_bonus: 20,
      achievement: 100,
      perfect_score: 150,
    },
    spending_costs: {
      hint: 20,
      skip_exercise: 50,
      powerup_vision: 30,
      powerup_time: 40,
      cosmetic_item: 100,
    },
  };

  // Función para abrir el modal
  const handleOpenModal = (studentId?: string) => {
    if (studentId) {
      setSelectedStudent(studentId);
    }
    setIsModalOpen(true);
    resetGrant();
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setBonusAmount(50);
    setBonusReason('');
    resetGrant();
  };

  // Función para otorgar el bonus
  const handleGrantBonus = async () => {
    if (!selectedStudent) {
      toast.error('Por favor selecciona un estudiante');
      return;
    }

    if (bonusAmount < 1 || bonusAmount > 1000) {
      toast.error('La cantidad debe estar entre 1 y 1000 ML Coins');
      return;
    }

    if (bonusReason.trim().length < 10) {
      toast.error('La razón debe tener al menos 10 caracteres');
      return;
    }

    try {
      const result = await grantBonus(selectedStudent, bonusAmount, bonusReason);

      // Actualizar el balance del estudiante
      setStudentBalances((prev) => ({
        ...prev,
        [selectedStudent]: result.newBalance,
      }));

      toast.success(
        `¡${result.amountGranted} ML Coins otorgados! Nuevo balance: ${result.newBalance} ML`,
        { duration: 5000 },
      );

      // FIX M-009: Refresh student list after successful bonus grant
      refetchStudents();

      handleCloseModal();
    } catch (err: unknown) {
      handleError(err, 'Error al otorgar bonus');
    }
  };

  // Obtener el balance actualizado de un estudiante (si existe)
  const getStudentBalance = (studentId: string, originalBalance: number): number => {
    return studentBalances[studentId] ?? originalBalance;
  };

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  return (
    <TeacherPageShell>
    <div className="detective-container py-6 sm:py-8">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-detective-text">Gestión de Gamificación</h1>
          <p className="mt-1 text-detective-text-secondary">
            Monitorea y controla la economía de ML Coins de tu clase
          </p>
        </div>
        <button
          onClick={() => {
            refetchEconomy();
            refetchStudents();
            refetchAchievements();
          }}
          disabled={economyLoading || studentsLoading || achievementsLoading}
          className="rounded-lg bg-detective-bg-secondary p-2 min-w-[44px] min-h-[44px] text-detective-text transition-colors hover:bg-detective-bg-secondary/80 disabled:opacity-50"
          title="Actualizar datos"
        >
          <RefreshCw
            className={`h-5 w-5 ${economyLoading || studentsLoading || achievementsLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Error banners */}
      {economyError && (
        <div className="rounded-r border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Error al cargar economía:</strong> {economyError.message}
              </p>
              <button
                onClick={() => refetchEconomy()}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}
      {studentsError && (
        <div className="rounded-r border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Error al cargar estudiantes:</strong> {studentsError.message}
              </p>
              <button
                onClick={() => refetchStudents()}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}
      {achievementsError && (
        <div className="rounded-r border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Error al cargar logros:</strong> {achievementsError.message}
              </p>
              <button
                onClick={() => refetchAchievements()}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner de capacidades */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Lo que puedes hacer */}
        <div className="rounded-r border-l-4 border-green-400 bg-green-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="mb-1 text-sm font-semibold text-green-800">Acciones Disponibles</h3>
              <ul className="space-y-1 text-xs text-green-700">
                <li>✅ Visualizar estadísticas de economía ML Coins</li>
                <li>✅ Ver leaderboard de estudiantes</li>
                <li>✅ Consultar logros y desbloqueos</li>
                <li>✅ Otorgar bonus de ML Coins (1-1000 ML)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Restricciones */}
        <div className="rounded-r border-l-4 border-amber-400 bg-amber-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="mb-1 text-sm font-semibold text-amber-800">Solo Administradores</h3>
              <ul className="space-y-1 text-xs text-amber-700">
                <li>⚙️ Modificar tasas de recompensas</li>
                <li>⚙️ Crear/eliminar achievements</li>
                <li>⚙️ Configurar reglas de gamificación</li>
              </ul>
              <p className="mt-2 text-xs italic text-amber-600">
                Los rewards vienen predefinidos de la base de datos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Economy Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DetectiveCard hoverable={false}>
          <div className="relative flex items-center justify-between">
            {economyLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/50">
                <Loader2 className="h-6 w-6 animate-spin text-detective-orange" />
              </div>
            )}
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">Circulación Total</p>
              <p className="text-xl sm:text-2xl font-bold text-detective-text">
                {classStats.total_circulation.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-detective-text-secondary">ML Coins en la clase</p>
            </div>
            <Coins className="h-10 w-10 text-green-500" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">Balance Promedio</p>
              <p className="text-xl sm:text-2xl font-bold text-detective-text">{classStats.average_balance}</p>
              <p className="mt-1 text-xs text-detective-text-secondary">ML Coins por estudiante</p>
            </div>
            <BarChart3 className="h-10 w-10 text-blue-500" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">Ganado Hoy</p>
              <p className="text-xl sm:text-2xl font-bold text-green-500">+{classStats.total_earned_today}</p>
              <p className="mt-1 text-xs text-detective-text-secondary">ML Coins ganados</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">Gastado Hoy</p>
              <p className="text-xl sm:text-2xl font-bold text-red-500">-{classStats.total_spent_today}</p>
              <p className="mt-1 text-xs text-detective-text-secondary">ML Coins gastados</p>
            </div>
            <TrendingDown className="h-10 w-10 text-red-500" />
          </div>
        </DetectiveCard>
      </div>

      {/* Give Bonus Section */}
      <DetectiveCard>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-detective-text">
          <Gift className="h-6 w-6 text-detective-orange" />
          Otorgar Bonus de ML Coins
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">Estudiante</label>
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
            >
              <option value="">Seleccionar estudiante...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({getStudentBalance(student.id, student.balance)} ML)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">
              Cantidad de ML Coins
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setBonusAmount(Math.max(0, bonusAmount - 10))}
                className="rounded-lg bg-detective-bg-secondary p-2 min-w-[44px] min-h-[44px] text-detective-text transition-colors hover:bg-detective-bg-secondary/80"
              >
                <Minus className="h-5 w-5" />
              </button>
              <input
                type="number"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(Number(e.target.value))}
                className="flex-1 rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-center text-detective-text focus:border-detective-orange focus:outline-none"
                min="0"
              />
              <button
                onClick={() => setBonusAmount(bonusAmount + 10)}
                className="rounded-lg bg-detective-bg-secondary p-2 min-w-[44px] min-h-[44px] text-detective-text transition-colors hover:bg-detective-bg-secondary/80"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-detective-text">
              Razón (opcional)
            </label>
            <input
              type="text"
              value={bonusReason}
              onChange={(e) => setBonusReason(e.target.value)}
              placeholder="Ej: Participación excepcional en clase"
              className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <DetectiveButton
              onClick={() => handleOpenModal()}
              disabled={!selectedStudent}
              className="w-full"
              leftIcon={<Gift className="h-5 w-5" />}
            >
              Otorgar Bonus
            </DetectiveButton>
            {!selectedStudent && (
              <p className="mt-2 text-center text-xs text-detective-text-secondary">
                Selecciona un estudiante para otorgar bonus
              </p>
            )}
          </div>
        </div>
      </DetectiveCard>

      {/* Top Students */}
      <DetectiveCard>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-detective-text">
            <Trophy className="h-6 w-6 text-detective-gold" />
            Top Estudiantes por ML Coins
            {studentsLoading && (
              <Loader2 className="ml-2 h-5 w-5 animate-spin text-detective-orange" />
            )}
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-gray-700 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'balance' | 'level' | 'name')}
              className="rounded-lg border border-gray-700 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none"
            >
              <option value="balance">Ordenar por Balance</option>
              <option value="level">Ordenar por Nivel</option>
              <option value="name">Ordenar por Nombre</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="group rounded-lg border border-gray-700 bg-detective-bg-secondary p-2 text-detective-text hover:bg-detective-bg transition-colors"
              title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
            >
              {sortOrder === 'asc' ? (
                <TrendingUp className="h-5 w-5 text-detective-text-secondary group-hover:text-detective-orange" />
              ) : (
                <TrendingDown className="h-5 w-5 text-detective-text-secondary group-hover:text-detective-orange" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {studentsLoading && students.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-detective-orange" />
              <span className="ml-3 text-detective-text-secondary">Cargando estudiantes...</span>
            </div>
          )}
          {!studentsLoading && filteredStudents.length === 0 && (
            <div className="py-8 text-center text-detective-text-secondary">
              <Users className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No se encontraron estudiantes coincidents</p>
            </div>
          )}
          {filteredStudents.map((student, index) => (
            <div
              key={student.id}
              className="flex items-center gap-4 rounded-lg bg-detective-bg-secondary p-4 transition-colors hover:bg-detective-bg-secondary/80"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-detective-orange to-orange-600 text-lg font-bold text-white">
                {index + 1}
              </div>

              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-detective-text">{student.name}</h3>
                  <span className="rounded-full bg-purple-600 px-2 py-1 text-xs text-white">
                    Lvl {student.level}
                  </span>
                  <span className="rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                    {student.rank}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-detective-text-secondary">
                  <span className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-green-500" />
                    Balance: {getStudentBalance(student.id, student.balance)} ML
                  </span>
                  <span className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="h-4 w-4" />+{student.earned_this_week} esta semana
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <TrendingDown className="h-4 w-4" />-{student.spent_this_week} esta semana
                  </span>
                </div>
              </div>

              <DetectiveButton onClick={() => handleOpenModal(student.id)} size="sm">
                Dar Bonus
              </DetectiveButton>
            </div>
          ))}
        </div>
      </DetectiveCard>

      {/* Economy Configuration (Read-only for Teachers) */}
      <DetectiveCard>
        <div className="mb-4 flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 text-blue-500" />
          <div>
            <h2 className="text-xl font-bold text-detective-text">Configuración de Economía</h2>
            <p className="text-sm text-detective-text-secondary">
              Solo lectura - Los administradores pueden modificar estas tasas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-detective-text">Tasas de Ganancia</h3>
            <div className="space-y-2">
              {Object.entries(economyConfig.earning_rates).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded bg-detective-bg-secondary p-2"
                >
                  <span className="text-sm capitalize text-detective-text">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-semibold text-green-500">+{value} ML</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-detective-text">Costos de Gasto</h3>
            <div className="space-y-2">
              {Object.entries(economyConfig.spending_costs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded bg-detective-bg-secondary p-2"
                >
                  <span className="text-sm capitalize text-detective-text">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-semibold text-red-500">-{value} ML</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DetectiveCard>

      {/* Achievements Overview */}
      <DetectiveCard>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-detective-text">
            <Trophy className="h-6 w-6 text-detective-gold" />
            Logros Disponibles
            {achievementsLoading && (
              <Loader2 className="ml-2 h-5 w-5 animate-spin text-detective-orange" />
            )}
          </h2>
          {!achievementsLoading && achievements.length > 0 && (
            <span className="text-sm text-detective-text-secondary">
              {totalUnlocks} desbloqueos de {totalAchievements} logros
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {achievementsLoading && achievements.length === 0 && (
            <div className="col-span-2 flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-detective-orange" />
              <span className="ml-3 text-detective-text-secondary">Cargando logros...</span>
            </div>
          )}
          {!achievementsLoading && achievements.length === 0 && (
            <div className="col-span-2 py-8 text-center text-detective-text-secondary">
              <Trophy className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No hay logros disponibles</p>
            </div>
          )}
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="rounded-lg bg-detective-bg-secondary p-4 transition-colors hover:bg-detective-bg-secondary/80"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-detective-text">{achievement.name}</h3>
                  <p className="text-sm text-detective-text-secondary">{achievement.description}</p>
                </div>
                <Trophy className="h-8 w-8 text-detective-gold" />
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-700 pt-3">
                <span className="text-sm text-detective-text">
                  <Users className="mr-1 inline h-4 w-4" />
                  {achievement.unlocked_count} estudiantes lo han desbloqueado
                </span>
                <span className="text-sm font-semibold text-green-500">
                  +{achievement.reward} ML
                </span>
              </div>
            </div>
          ))}
        </div>
      </DetectiveCard>

      {/* Economy Health Alert */}
      {classStats.inflation_rate > 5 && (
        <DetectiveCard>
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold text-detective-text">Alerta de Inflación</h3>
              <p className="mt-1 text-sm text-detective-text-secondary">
                La tasa de inflación de ML Coins está en {classStats.inflation_rate}%. Considera
                ajustar las tasas o contactar al administrador para un rebalanceo económico.
              </p>
            </div>
          </div>
        </DetectiveCard>
      )}

      {/* Funciones Futuras - Próximamente */}
      <DetectiveCard>
        <div className="mb-4 flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-detective-text">Próximamente</h2>
            <p className="text-sm text-detective-text-secondary">
              Funciones en desarrollo para mejorar tu experiencia
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Personalización de Recompensas por Aula */}
          <div className="rounded-lg border-2 border-dashed border-gray-600 bg-detective-bg-secondary p-4 opacity-60">
            <div className="mb-2 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <h3 className="text-sm font-semibold text-detective-text">
                Personalización de Recompensas
              </h3>
            </div>
            <p className="text-xs text-detective-text-secondary">
              Configura recompensas específicas para tu aula (sujeto a límites del administrador)
            </p>
          </div>

          {/* Achievements Personalizados */}
          <div className="rounded-lg border-2 border-dashed border-gray-600 bg-detective-bg-secondary p-4 opacity-60">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-detective-gold" />
              <h3 className="text-sm font-semibold text-detective-text">Logros Personalizados</h3>
            </div>
            <p className="text-xs text-detective-text-secondary">
              Crea logros especiales para tu clase con recompensas únicas
            </p>
          </div>

          {/* Reportes Avanzados */}
          <div className="rounded-lg border-2 border-dashed border-gray-600 bg-detective-bg-secondary p-4 opacity-60">
            <div className="mb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-detective-text">Reportes Avanzados</h3>
            </div>
            <p className="text-xs text-detective-text-secondary">
              Análisis detallado de economía, tendencias y patrones de gasto/ganancia
            </p>
          </div>
        </div>

        <div className="mt-4 rounded border border-blue-700/30 bg-blue-900/20 p-3">
          <p className="text-center text-xs text-detective-text-secondary">
            💡 <strong>Sugerencia:</strong> ¿Tienes ideas para mejorar la gamificación? Contacta al
            administrador con tus propuestas
          </p>
        </div>
      </DetectiveCard>

      {/* Modal para otorgar bonus */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Otorgar Bonus de ML Coins"
        size="md"
      >
        <div className="space-y-4">
          {/* Estudiante seleccionado */}
          {selectedStudentData && (
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="mb-1 text-sm text-gray-600">Estudiante:</p>
              <p className="text-lg font-semibold text-gray-900">{selectedStudentData.name}</p>
              <p className="mt-1 text-sm text-gray-600">
                Balance actual:{' '}
                {getStudentBalance(selectedStudentData.id, selectedStudentData.balance)} ML Coins
              </p>
            </div>
          )}

          {/* Campo de cantidad */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Cantidad de ML Coins *
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setBonusAmount(Math.max(1, bonusAmount - 10))}
                className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                disabled={grantingBonus}
              >
                <Minus className="h-5 w-5" />
              </button>
              <input
                type="number"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(Number(e.target.value))}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center outline-none focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/50"
                min="1"
                max="1000"
                disabled={grantingBonus}
              />
              <button
                onClick={() => setBonusAmount(Math.min(1000, bonusAmount + 10))}
                className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                disabled={grantingBonus}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Mínimo: 1 ML - Máximo: 1000 ML</p>
          </div>

          {/* Campo de razón */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Motivo / Razón *</label>
            <textarea
              value={bonusReason}
              onChange={(e) => setBonusReason(e.target.value)}
              placeholder="Ej: Participación excepcional en clase y ayuda a compañeros..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/50"
              rows={3}
              minLength={10}
              disabled={grantingBonus}
            />
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 10 caracteres - Actual: {bonusReason.length}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <DetectiveButton
              variant="outline"
              onClick={handleCloseModal}
              className="flex-1"
              disabled={grantingBonus}
            >
              Cancelar
            </DetectiveButton>
            <DetectiveButton
              onClick={handleGrantBonus}
              className="flex-1"
              disabled={
                grantingBonus ||
                !selectedStudent ||
                bonusAmount < 1 ||
                bonusAmount > 1000 ||
                bonusReason.trim().length < 10
              }
              loading={grantingBonus}
              leftIcon={<Gift className="h-5 w-5" />}
            >
              {grantingBonus ? 'Otorgando...' : 'Otorgar Bonus'}
            </DetectiveButton>
          </div>
        </div>
      </Modal>
    </div>
    </div>
    </TeacherPageShell>
  );
}
