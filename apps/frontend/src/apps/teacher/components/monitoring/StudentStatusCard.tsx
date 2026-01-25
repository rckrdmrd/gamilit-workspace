import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { User, Clock, Target, TrendingUp, Activity, BookOpen } from 'lucide-react';
import type { StudentMonitoring } from '../../types';

interface StudentStatusCardProps {
  student: StudentMonitoring;
  onClick?: () => void;
}

type StatusInfo = {
  color: string;
  bgColor: string;
  textColor: string;
  label: string;
  icon: React.ReactNode;
  description: string;
};

export function StudentStatusCard({ student, onClick }: StudentStatusCardProps) {
  /**
   * Get detailed status information based on last activity time
   *
   * Status criteria:
   * - Activo (verde): Actividad en últimos 5 min
   * - En ejercicio (azul): Tiene ejercicio en progreso
   * - Inactivo (gris): Sin actividad > 5 min
   * - Desconectado (rojo): Sin actividad > 30 min
   * - Sin datos (gris): Sin información de actividad
   *
   * FIX-2026-01-25: Añadida validación para last_activity null/undefined/inválido
   */
  const getStatusInfo = (student: StudentMonitoring): StatusInfo => {
    // Validar que last_activity exista y sea válido
    if (!student.last_activity) {
      return {
        color: 'border-gray-400',
        bgColor: 'bg-gray-400',
        textColor: 'text-gray-400',
        label: 'Sin datos',
        icon: <div className="h-2 w-2 rounded-full bg-gray-400" />,
        description: 'Sin información de actividad',
      };
    }

    const now = new Date();
    const last = new Date(student.last_activity);

    // Validar que la fecha sea válida
    if (isNaN(last.getTime())) {
      return {
        color: 'border-gray-400',
        bgColor: 'bg-gray-400',
        textColor: 'text-gray-400',
        label: 'Sin datos',
        icon: <div className="h-2 w-2 rounded-full bg-gray-400" />,
        description: 'Fecha de actividad inválida',
      };
    }

    const diffMins = Math.floor((now.getTime() - last.getTime()) / 60000);

    // Manejar fechas futuras (posible problema de timezone)
    if (diffMins < 0) {
      return {
        color: 'border-green-500',
        bgColor: 'bg-green-500',
        textColor: 'text-green-500',
        label: 'Activo',
        icon: <Activity className="h-4 w-4" />,
        description: 'Activo ahora',
      };
    }

    // Activo: menos de 5 minutos
    if (diffMins < 5) {
      return {
        color: 'border-green-500',
        bgColor: 'bg-green-500',
        textColor: 'text-green-500',
        label: 'Activo',
        icon: <Activity className="h-4 w-4" />,
        description: 'Activo ahora',
      };
    }

    // En ejercicio: tiene ejercicio actual y menos de 30 min
    if (student.current_exercise && diffMins < 30) {
      return {
        color: 'border-blue-500',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-500',
        label: 'En ejercicio',
        icon: <BookOpen className="h-4 w-4" />,
        description: 'Resolviendo ejercicio',
      };
    }

    // Desconectado: más de 30 minutos
    if (diffMins >= 30) {
      return {
        color: 'border-red-500',
        bgColor: 'bg-red-500',
        textColor: 'text-red-500',
        label: 'Desconectado',
        icon: <div className="h-2 w-2 rounded-full bg-red-500" />,
        description: 'Fuera de línea',
      };
    }

    // Inactivo: entre 5 y 30 minutos
    return {
      color: 'border-gray-500',
      bgColor: 'bg-gray-500',
      textColor: 'text-gray-500',
      label: 'Inactivo',
      icon: <div className="h-2 w-2 rounded-full bg-gray-500" />,
      description: 'Sin actividad reciente',
    };
  };

  /**
   * Calcula el tiempo transcurrido desde la última actividad
   * FIX-2026-01-25: Añadida validación para valores null/undefined/inválidos
   */
  const getTimeSinceLastActivity = (lastActivity: string | null | undefined): string => {
    // Validar que lastActivity exista
    if (!lastActivity) {
      return 'Sin actividad';
    }

    const last = new Date(lastActivity);

    // Validar que la fecha sea válida
    if (isNaN(last.getTime())) {
      return 'Fecha inválida';
    }

    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    // Manejar fechas futuras (posible problema de timezone)
    if (diffMins < 0) {
      return 'Hace un momento';
    }

    if (diffMins < 1) {
      return 'Hace un momento';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `Hace ${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
  };

  const statusInfo = getStatusInfo(student);

  return (
    <DetectiveCard
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 hover:border-detective-orange ${statusInfo.color} border-l-4`}
    >
      <div className="space-y-4">
        {/* Header with improved status badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-detective-bg-secondary p-2">
              <User className="h-5 w-5 text-detective-orange" />
            </div>
            <div>
              <h3 className="font-bold text-detective-text">{student.full_name}</h3>
              <p className="text-xs text-detective-text-secondary">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${statusInfo.bgColor} border bg-opacity-10 ${statusInfo.color}`}
            >
              <span className={statusInfo.textColor}>{statusInfo.icon}</span>
              <span className={`text-xs font-semibold ${statusInfo.textColor}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Current Activity with enhanced visual */}
        {student.current_module && (
          <div
            className={`rounded-lg border-l-2 p-3 ${student.current_exercise ? 'border-blue-400 bg-blue-50' : 'border-detective-border bg-detective-bg-secondary'}`}
          >
            <p className="mb-1 flex items-center gap-1 text-xs text-detective-text-secondary">
              <BookOpen className="h-3 w-3" />
              Trabajando en:
            </p>
            <p className="text-sm font-semibold text-detective-text">{student.current_module}</p>
            {student.current_exercise && (
              <div className="mt-2 border-t border-blue-200 pt-2">
                <p className="text-xs font-medium text-blue-600">{student.current_exercise}</p>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Target className="h-4 w-4 text-detective-orange" />
            </div>
            <p className="text-lg font-bold text-detective-text">
              {student.exercises_completed ?? 0}/{student.exercises_total ?? 0}
            </p>
            <p className="text-xs text-detective-text-secondary">Ejercicios</p>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-detective-gold" />
            </div>
            <p className="text-lg font-bold text-detective-text">
              {(student.score_average ?? 0).toFixed(0)}%
            </p>
            <p className="text-xs text-detective-text-secondary">Score Prom.</p>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Clock className="text-detective-accent h-4 w-4" />
            </div>
            <p className="text-lg font-bold text-detective-text">
              {Math.floor((student.time_spent_minutes ?? 0) / 60)}h
            </p>
            <p className="text-xs text-detective-text-secondary">Tiempo</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-detective-text-secondary">Progreso General</span>
            <span className="text-xs font-semibold text-detective-text">
              {(student.progress_percentage ?? 0).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-detective-bg-secondary">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-detective-orange to-detective-gold transition-all duration-300"
              style={{ width: `${student.progress_percentage ?? 0}%` }}
            />
          </div>
        </div>

        {/* Last Activity */}
        <div className="flex items-center justify-between border-t border-detective-bg-secondary pt-2">
          <span className="text-xs text-detective-text-secondary">Última actividad:</span>
          <span className="text-xs font-semibold text-detective-text">
            {getTimeSinceLastActivity(student.last_activity)}
          </span>
        </div>
      </div>
    </DetectiveCard>
  );
}
