import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { useStudentPageSetup } from '../../hooks/useStudentPageSetup';
import { useEffect, useState, type ReactNode } from 'react';
import {
  DelayedRewardsModal,
  type DelayedRewardsData,
} from '../exercise/DelayedRewardsModal';

export interface StudentPageShellProps {
  children: ReactNode;
  /** Whether to show the GamifiedHeader (some pages like exercises may not need it) */
  showHeader?: boolean;
}

/**
 * StudentPageShell - Wrapper that eliminates student page boilerplate
 *
 * Combines useStudentPageSetup + GamifiedHeader into a single wrapper.
 * Pages just pass children -- no need to manually wire useAuth,
 * useUserGamification, displayGamificationData, or handleLogout.
 *
 * Unlike AdminPageShell which wraps AdminLayout, the student portal
 * uses GamifiedHeader directly (no layout wrapper component).
 *
 * @example
 * ```tsx
 * export default function StudentSomePage() {
 *   return (
 *     <StudentPageShell>
 *       <h1>Page Content</h1>
 *     </StudentPageShell>
 *   );
 * }
 * ```
 */
export function StudentPageShell({ children, showHeader = true }: StudentPageShellProps) {
  const { user, displayGamificationData, handleLogout } = useStudentPageSetup();
  const [delayedRewards, setDelayedRewards] = useState<DelayedRewardsData | null>(null);
  const [isDelayedRewardsOpen, setIsDelayedRewardsOpen] = useState(false);

  useEffect(() => {
    const handleExerciseFeedback = (event: Event) => {
      const customEvent = event as CustomEvent<{
        data?: Record<string, unknown>;
        message?: string;
      }>;
      const data = customEvent.detail?.data || {};
      setDelayedRewards({
        score: Number(data.score || 0),
        xpEarned: Number(data.xpEarned || 0),
        mlCoinsEarned: Number(data.mlCoinsEarned || 0),
        message: customEvent.detail?.message,
      });
      setIsDelayedRewardsOpen(true);
    };

    window.addEventListener('gamilit:exercise:feedback', handleExerciseFeedback);
    return () => {
      window.removeEventListener('gamilit:exercise:feedback', handleExerciseFeedback);
    };
  }, []);

  return (
    <>
      {showHeader && (
        <GamifiedHeader
          user={user || undefined}
          gamificationData={displayGamificationData}
          onLogout={handleLogout}
        />
      )}
      {children}
      <DelayedRewardsModal
        isOpen={isDelayedRewardsOpen}
        rewards={delayedRewards}
        onClose={() => setIsDelayedRewardsOpen(false)}
      />
    </>
  );
}
