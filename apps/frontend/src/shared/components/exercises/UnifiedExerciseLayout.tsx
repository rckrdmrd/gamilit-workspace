import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { DetectiveCard } from '../base/DetectiveCard';
import { ExerciseGradientHeader } from '../mechanics/ExerciseGradientHeader';
import { cn } from '@shared/utils/cn';

export interface UnifiedExerciseLayoutProps {
    /** Title of the exercise */
    title: string;
    /** Description or instruction for the exercise */
    description?: string;
    /** Icon to display in the header */
    icon?: ReactNode;
    /** Content to display in the header actions area */
    headerActions?: ReactNode;
    /** Additional content to render inside the header (e.g. progress bar) */
    headerChildren?: ReactNode;
    /** Main content of the exercise */
    children: ReactNode;
    /** Custom class for the wrapper */
    className?: string;
    /** Variant of the DetectiveCard */
    cardVariant?: 'default' | 'exercise' | 'mystery';
    /** Padding of the DetectiveCard */
    cardPadding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    /** Gradient class for the header */
    gradientClassName?: string;
    /** Difficulty level for visual indication (optional) */
    difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * UnifiedExerciseLayout
 * 
 * Standard layout for all exercises in the platform.
 * Integrates ExerciseGradientHeader and DetectiveCard for a consistent look.
 */
export const UnifiedExerciseLayout = ({
    title,
    description,
    icon,
    headerActions,
    headerChildren,
    children,
    className,
    cardVariant = 'default',
    cardPadding = 'lg',
    gradientClassName,
    difficulty,
}: UnifiedExerciseLayoutProps) => {

    // Map difficulty to border colors if needed, or use in header
    const difficultyBorderColor = {
        easy: 'border-green-200',
        medium: 'border-blue-200',
        hard: 'border-orange-200',
    };

    return (
        <div className={cn('mx-auto max-w-4xl space-y-3 sm:space-y-6 p-2 sm:p-4', className)}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <DetectiveCard
                    variant={cardVariant}
                    padding={cardPadding}
                    hoverable={false}
                    className={cn(
                        'overflow-hidden shadow-xl border-2',
                        difficulty ? difficultyBorderColor[difficulty] : 'border-detective-blue/10'
                    )}
                >
                    <ExerciseGradientHeader
                        title={title}
                        description={description}
                        icon={icon}
                        actions={headerActions}
                        gradientClassName={gradientClassName}
                        className={cn(
                            'mb-6 rounded-t-lg',
                            // Calculate negative margins based on padding to make header flush
                            cardPadding === 'none' && 'mx-0 -mt-0',
                            cardPadding === 'sm' && '-mx-4 -mt-4',
                            cardPadding === 'md' && '-mx-6 -mt-6',
                            cardPadding === 'lg' && '-mx-8 -mt-8',
                            cardPadding === 'xl' && '-mx-10 -mt-10'
                        )}
                    >
                        {headerChildren}
                    </ExerciseGradientHeader>

                    <div className="exercise-content">
                        {children}
                    </div>
                </DetectiveCard>
            </motion.div>
        </div>
    );
};
