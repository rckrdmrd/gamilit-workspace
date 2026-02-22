/**
 * BattleResults Component
 *
 * @description Display battle results and rewards (EXT-009)
 */

import { useBattle } from '../hooks/useBattle';

/**
 * BattleResults Component
 */
export const BattleResults = () => {
  const { battleResult, userId, showResults, setShowResults, reset } = useBattle();

  if (!showResults || !battleResult) {
    return null;
  }

  // Find player results
  const myResult = battleResult.players.find((p) => p.id === userId);
  const opponentResult = battleResult.players.find((p) => p.id !== userId);

  // Determine outcome
  const isWinner = battleResult.winnerId === userId;
  const isDraw = battleResult.isDraw;

  /**
   * Handle play again
   */
  const handlePlayAgain = () => {
    setShowResults(false);
    reset();
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    setShowResults(false);
    reset();
  };

  /**
   * Format time
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="battle-results-overlay">
      <div className="battle-results-modal">
        {/* Header */}
        <div
          className={`results-header ${
            isDraw ? 'draw' : isWinner ? 'victory' : 'defeat'
          }`}
        >
          <span className="result-icon">
            {isDraw ? '&#129309;' : isWinner ? '&#127942;' : '&#128546;'}
          </span>
          <h2>
            {isDraw ? "It's a Draw!" : isWinner ? 'Victory!' : 'Defeat'}
          </h2>
          <p className="result-subtitle">
            {isDraw
              ? 'Great match! You both performed equally.'
              : isWinner
              ? 'Congratulations on your win!'
              : "Good effort! Keep practicing."}
          </p>
        </div>

        {/* Score comparison */}
        <div className="score-comparison">
          <div className={`player-result ${isWinner ? 'winner' : ''}`}>
            <span className="player-label">You</span>
            <span className="player-final-score">{myResult?.score || 0}</span>
            <div className="player-stats">
              <span>{myResult?.correctAnswers}/{myResult?.totalAnswers} correct</span>
              <span>{myResult?.accuracy}% accuracy</span>
            </div>
          </div>
          <div className="vs-divider">VS</div>
          <div className={`player-result ${!isWinner && !isDraw ? 'winner' : ''}`}>
            <span className="player-label">{opponentResult?.displayName || 'Opponent'}</span>
            <span className="player-final-score">{opponentResult?.score || 0}</span>
            <div className="player-stats">
              <span>{opponentResult?.correctAnswers}/{opponentResult?.totalAnswers} correct</span>
              <span>{opponentResult?.accuracy}% accuracy</span>
            </div>
          </div>
        </div>

        {/* Rewards */}
        {myResult && (
          <div className="rewards-section">
            <h3>Rewards Earned</h3>
            <div className="rewards-grid">
              <div className="reward-item">
                <span className="reward-icon">&#11088;</span>
                <span className="reward-value">+{myResult.xpEarned} XP</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">&#127918;</span>
                <span className="reward-value">+{myResult.coinsEarned} ML Coins</span>
              </div>
              <div className={`reward-item ${myResult.ratingChange >= 0 ? 'positive' : 'negative'}`}>
                <span className="reward-icon">&#128200;</span>
                <span className="reward-value">
                  {myResult.ratingChange >= 0 ? '+' : ''}{myResult.ratingChange} Rating
                </span>
                <span className="new-rating">({myResult.newRating})</span>
              </div>
            </div>
          </div>
        )}

        {/* Battle stats */}
        <div className="battle-stats">
          <h3>Battle Statistics</h3>
          <div className="stats-list">
            <div className="stat-row">
              <span className="stat-name">Duration</span>
              <span className="stat-value">{formatDuration(battleResult.duration)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Questions</span>
              <span className="stat-value">{battleResult.stats.totalQuestions}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Avg Response Time</span>
              <span className="stat-value">{battleResult.stats.avgResponseTime}ms</span>
            </div>
            {myResult && (
              <div className="stat-row">
                <span className="stat-name">Your Avg Time</span>
                <span className="stat-value">{myResult.avgTimePerQuestion}ms</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="results-actions">
          <button className="play-again-button" onClick={handlePlayAgain}>
            <span>&#9876;</span> Play Again
          </button>
          <button className="close-button" onClick={handleClose}>
            Back to Lobby
          </button>
        </div>
      </div>

      <style>{`
        .battle-results-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
          animation: overlayFadeIn 0.3s ease-out;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .battle-results-modal {
          background: white;
          border-radius: 16px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideUp 0.3s ease-out;
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .results-header {
          text-align: center;
          padding: 32px 24px;
          border-radius: 16px 16px 0 0;
        }

        .results-header.victory {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        }

        .results-header.defeat {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        }

        .results-header.draw {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .result-icon {
          display: block;
          font-size: 64px;
          margin-bottom: 8px;
        }

        .results-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          color: #1f2937;
        }

        .result-subtitle {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .score-comparison {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          gap: 16px;
        }

        .player-result {
          flex: 1;
          text-align: center;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
          border: 2px solid transparent;
        }

        .player-result.winner {
          border-color: #fbbf24;
          background: #fffbeb;
        }

        .player-label {
          display: block;
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .player-final-score {
          display: block;
          font-size: 36px;
          font-weight: 700;
          color: #1f2937;
        }

        .player-stats {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 8px;
          font-size: 12px;
          color: #6b7280;
        }

        .vs-divider {
          font-size: 16px;
          font-weight: 700;
          color: #9ca3af;
        }

        .rewards-section {
          padding: 0 24px 24px;
        }

        .rewards-section h3 {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          margin: 0 0 12px 0;
        }

        .rewards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .reward-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .reward-item.positive {
          background: #d1fae5;
        }

        .reward-item.negative {
          background: #fee2e2;
        }

        .reward-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .reward-value {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .reward-item.positive .reward-value {
          color: #059669;
        }

        .reward-item.negative .reward-value {
          color: #dc2626;
        }

        .new-rating {
          font-size: 11px;
          color: #6b7280;
        }

        .battle-stats {
          padding: 0 24px 24px;
        }

        .battle-stats h3 {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          margin: 0 0 12px 0;
        }

        .stats-list {
          background: #f9fafb;
          border-radius: 8px;
          padding: 8px 0;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 16px;
        }

        .stat-name {
          color: #6b7280;
          font-size: 14px;
        }

        .stat-value {
          color: #1f2937;
          font-size: 14px;
          font-weight: 500;
        }

        .results-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .play-again-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .play-again-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .close-button {
          padding: 12px 24px;
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .close-button:hover {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default BattleResults;
