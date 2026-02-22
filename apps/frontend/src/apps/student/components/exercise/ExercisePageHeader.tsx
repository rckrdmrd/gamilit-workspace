

import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Star,
    Trophy,
    ChevronRight,
    Loader2,
    Check,
    CloudOff,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DifficultyLevel } from '@shared/types/educational.types';

// Define types locally if not available in shared types, or import from where they are defined.
// Assuming ExerciseData structure based on usage in ExercisePage.
interface ExerciseData {
    id: string;
    module_id: string;
    title: string;
    type: string;
    description: string;
    difficulty: DifficultyLevel | string;
    points: number;
    estimatedTime: number; // in seconds
    moduleTitle?: string;
    completed: boolean;
}

interface ExercisePageHeaderProps {
    exercise: ExerciseData;
    autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
    lastSavedAt?: Date | null;
    hasUnsavedChanges?: boolean;
    className?: string;
}

export const ExercisePageHeader = ({
    exercise,
    autoSaveStatus = 'idle',
    lastSavedAt,
    hasUnsavedChanges = false,
    className,
}: ExercisePageHeaderProps) => {
    const navigate = useNavigate();

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'facil':
            case 'beginner':
            case 'easy':
                return 'text-green-600 bg-green-100';
            case 'medio':
            case 'intermediate':
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'dificil':
            case 'advanced':
            case 'hard':
                return 'text-red-600 bg-red-100';
            case 'experto':
            case 'expert':
            case 'proficient':
                return 'text-purple-600 bg-purple-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        // Map English inputs to Spanish labels if necessary, or just capitalize
        const map: Record<string, string> = {
            beginner: 'Fácil',
            easy: 'Fácil',
            intermediate: 'Medio',
            medium: 'Medio',
            advanced: 'Difícil',
            hard: 'Difícil',
            proficient: 'Experto',
            expert: 'Experto',
            facil: 'Fácil',
            medio: 'Medio',
            dificil: 'Difícil',
            experto: 'Experto',
        };
        return map[difficulty.toLowerCase()] || difficulty;
    };

    return (
        <DetectiveCard hoverable={false} className={className}>
            {/* Breadcrumb Navigation */}
            <nav className="mb-4 flex items-center gap-2 text-sm text-detective-text-secondary">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="transition-colors hover:text-detective-orange"
                >
                    Dashboard
                </button>
                <ChevronRight className="h-4 w-4" />
                <button
                    onClick={() => navigate(`/modules/${exercise.module_id}`)}
                    className="transition-colors hover:text-detective-orange"
                >
                    {exercise.moduleTitle || 'Módulo'}
                </button>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold text-detective-text">{exercise.title}</span>
            </nav>

            {/* Exercise Info */}
            <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-detective-text">{exercise.title}</h1>
                <span
                    className={`rounded-lg px-3 py-1 text-sm font-bold ${getDifficultyColor(
                        String(exercise.difficulty),
                    )}`}
                >
                    {getDifficultyLabel(String(exercise.difficulty))}
                </span>
            </div>
            <p className="mb-4 text-detective-text-secondary">{exercise.description}</p>

            {/* Exercise Stats */}
            <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-detective-orange" />
                    <div>
                        <p className="text-xs text-detective-text-secondary">Tiempo estimado</p>
                        <p className="text-sm font-bold text-detective-text">
                            {Math.floor(exercise.estimatedTime / 60)} minutos
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-detective-gold" />
                    <div>
                        <p className="text-xs text-detective-text-secondary">Puntos</p>
                        <p className="text-sm font-bold text-detective-text">{exercise.points} pts</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-detective-orange" />
                    <div>
                        <p className="text-xs text-detective-text-secondary">Tipo</p>
                        <p className="text-sm font-bold capitalize text-detective-text">
                            {exercise.type.replace(/_/g, ' ')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Auto-Save Status Indicator */}
            <div className="mt-3 flex items-center gap-2 text-xs">
                {autoSaveStatus === 'saving' && (
                    <>
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                        <span className="text-blue-600">Guardando progreso...</span>
                    </>
                )}
                {autoSaveStatus === 'saved' && lastSavedAt && (
                    <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">
                            Guardado automáticamente{' '}
                            {new Date(lastSavedAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </>
                )}
                {autoSaveStatus === 'error' && (
                    <>
                        <CloudOff className="h-3 w-3 text-red-500" />
                        <span className="text-red-600">Error al guardar (guardado local activo)</span>
                    </>
                )}
                {hasUnsavedChanges && autoSaveStatus === 'idle' && (
                    <span className="italic text-orange-600">⚠️ Tienes cambios sin guardar</span>
                )}
            </div>
        </DetectiveCard>
    );
};

export default ExercisePageHeader;
