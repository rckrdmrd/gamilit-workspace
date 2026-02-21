/**
 * GamificationOverlay Component
 *
 * Renders real-time gamification popups/modals on top of the application.
 * Listens to custom DOM events dispatched by useWebSocket when gamification
 * socket events arrive, and delegates state management to useGamificationEvents.
 *
 * Mount this component once in the authenticated layout (ProtectedRoute)
 * so it is present on every protected page.
 */

import { useEffect } from 'react';
import { useGamificationEvents } from '../hooks/useGamificationSocket';
import { XpGainedPopup } from './XpGainedPopup';
import { CoinsEarnedPopup } from './CoinsEarnedPopup';
import { RankUpModal } from './RankUpModal';
import { Trophy, Award } from 'lucide-react';

// Icon resolver for achievement banner (subset of available icons)
function resolveAchievementIcon(icon: string) {
  if (icon === 'trophy') return Trophy;
  return Award;
}

export function GamificationOverlay() {
  const {
    showXpPopup,
    showCoinsPopup,
    showRankUp,
    showAchievement,
    handleXpGained,
    handleCoinsEarned,
    handleBalanceUpdated,
    handleAchievementUnlocked,
    handleRankUpdated,
    handleMissionCompleted,
    handleMissionProgress,
    dismissXpPopup,
    dismissCoinsPopup,
    dismissRankUp,
    dismissAchievement,
  } = useGamificationEvents();

  // Subscribe to custom DOM events dispatched by useWebSocket
  useEffect(() => {
    const handlers: [string, (e: Event) => void][] = [
      ['gamilit:xp:gained', (e) => handleXpGained((e as CustomEvent).detail)],
      ['gamilit:mlcoins:earned', (e) => handleCoinsEarned((e as CustomEvent).detail)],
      ['gamilit:balance:updated', (e) => handleBalanceUpdated((e as CustomEvent).detail)],
      ['gamilit:achievement:unlocked', (e) => handleAchievementUnlocked((e as CustomEvent).detail)],
      ['gamilit:rank:updated', (e) => handleRankUpdated((e as CustomEvent).detail)],
      ['gamilit:mission:completed', (e) => handleMissionCompleted((e as CustomEvent).detail)],
      ['gamilit:mission:progress', (e) => handleMissionProgress((e as CustomEvent).detail)],
    ];

    handlers.forEach(([event, handler]) => window.addEventListener(event, handler));
    return () => {
      handlers.forEach(([event, handler]) => window.removeEventListener(event, handler));
    };
  }, [
    handleXpGained,
    handleCoinsEarned,
    handleBalanceUpdated,
    handleAchievementUnlocked,
    handleRankUpdated,
    handleMissionCompleted,
    handleMissionProgress,
  ]);

  const AchievementIcon = showAchievement
    ? resolveAchievementIcon(showAchievement.icon)
    : Award;

  return (
    <>
      {/* XP earned toast */}
      {showXpPopup && (
        <XpGainedPopup
          amount={showXpPopup.amount}
          totalXp={showXpPopup.totalXp}
          onDismiss={dismissXpPopup}
        />
      )}

      {/* ML Coins earned toast */}
      {showCoinsPopup && (
        <CoinsEarnedPopup
          amount={showCoinsPopup.amount}
          totalCoins={showCoinsPopup.totalCoins}
          onDismiss={dismissCoinsPopup}
        />
      )}

      {/* Rank promotion celebration */}
      {showRankUp && (
        <RankUpModal
          newRank={showRankUp.newRank}
          oldRank={showRankUp.oldRank}
          onDismiss={dismissRankUp}
        />
      )}

      {/* Achievement unlocked banner */}
      {showAchievement && (
        <div
          className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 cursor-pointer items-center gap-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-white shadow-xl"
          onClick={dismissAchievement}
          role="status"
          aria-live="assertive"
        >
          <AchievementIcon className="h-6 w-6" />
          <div>
            <p className="text-sm font-bold">Logro Desbloqueado!</p>
            <p className="text-xs opacity-90">{showAchievement.title}</p>
          </div>
        </div>
      )}
    </>
  );
}
