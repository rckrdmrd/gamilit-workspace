/**
 * BattleMatchmaking Component
 *
 * @description UI for finding opponents and joining battles (EXT-009)
 */

import React, { useState, useCallback } from 'react';
import { useBattle } from '../hooks/useBattle';
import type { MatchmakingPreferences } from '../types/battleTypes';

/**
 * Difficulty options
 */
const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Any Level' },
  { value: 'beginner', label: 'Beginner (A1)' },
  { value: 'elementary', label: 'Elementary (A2)' },
  { value: 'pre_intermediate', label: 'Pre-Intermediate (B1)' },
  { value: 'intermediate', label: 'Intermediate (B2)' },
  { value: 'upper_intermediate', label: 'Upper-Intermediate (C1)' },
  { value: 'advanced', label: 'Advanced (C2)' },
];

/**
 * BattleMatchmaking Component
 */
export const BattleMatchmaking: React.FC = () => {
  const {
    isSearching,
    queueStatus,
    matchResult,
    isLoading,
    error,
    isConnected,
    joinQueue,
    leaveQueue,
    joinBattle,
    clearError,
  } = useBattle();

  const [preferences, setPreferences] = useState<MatchmakingPreferences>({
    challengeType: 'head_to_head',
    difficultyLevel: undefined,
    maxSkillDiff: 100,
  });

  /**
   * Handle search button click
   */
  const handleSearch = useCallback(() => {
    if (isSearching) {
      leaveQueue();
    } else {
      joinQueue(preferences);
    }
  }, [isSearching, preferences, joinQueue, leaveQueue]);

  /**
   * Handle preference change
   */
  const handlePreferenceChange = (
    key: keyof MatchmakingPreferences,
    value: string | number,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  /**
   * Handle join battle
   */
  const handleJoinBattle = useCallback(() => {
    if (matchResult) {
      joinBattle(matchResult.challengeId);
    }
  }, [matchResult, joinBattle]);

  /**
   * Format wait time
   */
  const formatWaitTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="battle-matchmaking">
      {/* Header */}
      <div className="matchmaking-header">
        <h2>Battle Arena</h2>
        <p className="matchmaking-subtitle">
          Challenge other students to a knowledge battle!
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="matchmaking-error" role="alert">
          <span>{error}</span>
          <button onClick={clearError} className="error-dismiss">
            Dismiss
          </button>
        </div>
      )}

      {/* Match Found */}
      {matchResult && (
        <div className="match-found-card">
          <div className="match-found-header">
            <span className="match-icon">&#9876;</span>
            <h3>Opponent Found!</h3>
          </div>
          <div className="opponent-info">
            <div className="opponent-avatar">
              {matchResult.opponent.avatarUrl ? (
                <img
                  src={matchResult.opponent.avatarUrl}
                  alt={matchResult.opponent.displayName}
                />
              ) : (
                <div className="avatar-placeholder">
                  {matchResult.opponent.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="opponent-details">
              <span className="opponent-name">
                {matchResult.opponent.displayName}
              </span>
              <span className="opponent-rating">
                Rating: {matchResult.opponent.skillRating}
              </span>
            </div>
          </div>
          <button
            className="join-battle-button"
            onClick={handleJoinBattle}
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Battle'}
          </button>
        </div>
      )}

      {/* Searching State */}
      {isSearching && !matchResult && (
        <div className="searching-card">
          <div className="searching-animation">
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
            <span className="search-icon">&#128269;</span>
          </div>
          <h3>Searching for opponent...</h3>
          {queueStatus?.position && (
            <div className="queue-info">
              <p>
                Position in queue:{' '}
                <strong>{queueStatus.position.position}</strong>
              </p>
              <p>
                Estimated wait:{' '}
                <strong>
                  {formatWaitTime(queueStatus.position.estimatedWaitTime)}
                </strong>
              </p>
              <p>
                Search range: <strong>&plusmn;{queueStatus.position.currentSearchRange}</strong>{' '}
                rating
              </p>
            </div>
          )}
          <button className="cancel-search-button" onClick={leaveQueue}>
            Cancel Search
          </button>
        </div>
      )}

      {/* Preferences Form */}
      {!isSearching && !matchResult && (
        <div className="preferences-card">
          <h3>Battle Settings</h3>

          {/* Challenge Type */}
          <div className="preference-group">
            <label>Challenge Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="challengeType"
                  value="head_to_head"
                  checked={preferences.challengeType === 'head_to_head'}
                  onChange={(e) =>
                    handlePreferenceChange('challengeType', e.target.value)
                  }
                />
                <span className="radio-label">1v1 Battle</span>
                <span className="radio-description">
                  Head-to-head competition
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="challengeType"
                  value="multiplayer"
                  checked={preferences.challengeType === 'multiplayer'}
                  onChange={(e) =>
                    handlePreferenceChange('challengeType', e.target.value)
                  }
                />
                <span className="radio-label">Multiplayer</span>
                <span className="radio-description">
                  Battle with multiple players
                </span>
              </label>
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="preference-group">
            <label htmlFor="difficulty">Difficulty Level</label>
            <select
              id="difficulty"
              value={preferences.difficultyLevel || ''}
              onChange={(e) =>
                handlePreferenceChange('difficultyLevel', e.target.value)
              }
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Range */}
          <div className="preference-group">
            <label htmlFor="skillRange">
              Max Rating Difference: &plusmn;{preferences.maxSkillDiff}
            </label>
            <input
              type="range"
              id="skillRange"
              min="50"
              max="300"
              step="25"
              value={preferences.maxSkillDiff}
              onChange={(e) =>
                handlePreferenceChange('maxSkillDiff', parseInt(e.target.value))
              }
            />
            <div className="range-labels">
              <span>Strict (&plusmn;50)</span>
              <span>Flexible (&plusmn;300)</span>
            </div>
          </div>

          {/* Search Button */}
          <button
            className="search-button"
            onClick={handleSearch}
            disabled={isLoading || !isConnected}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <span className="button-icon">&#9876;</span>
                Find Opponent
              </>
            )}
          </button>

          {!isConnected && (
            <p className="connection-warning">
              Connecting to server...
            </p>
          )}
        </div>
      )}

      {/* Stats Preview */}
      <div className="stats-preview">
        <h4>Your Battle Stats</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">--</span>
            <span className="stat-label">Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">--</span>
            <span className="stat-label">Wins</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">--</span>
            <span className="stat-label">Win Rate</span>
          </div>
        </div>
      </div>

      <style>{`
        .battle-matchmaking {
          max-width: 480px;
          margin: 0 auto;
          padding: 24px;
        }

        .matchmaking-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .matchmaking-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .matchmaking-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .matchmaking-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          margin-bottom: 16px;
        }

        .error-dismiss {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          font-weight: 500;
        }

        .match-found-card,
        .searching-card,
        .preferences-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .match-found-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .match-icon {
          font-size: 32px;
        }

        .match-found-header h3 {
          margin: 0;
          font-size: 20px;
          color: #059669;
        }

        .opponent-info {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .opponent-avatar img,
        .avatar-placeholder {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          font-size: 24px;
          font-weight: 700;
        }

        .opponent-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .opponent-name {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .opponent-rating {
          font-size: 14px;
          color: #6b7280;
        }

        .join-battle-button {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .join-battle-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .join-battle-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .searching-animation {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid #6366f1;
          border-radius: 50%;
          animation: pulse 2s ease-out infinite;
        }

        .pulse-ring.delay-1 {
          animation-delay: 0.5s;
        }

        .pulse-ring.delay-2 {
          animation-delay: 1s;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .search-icon {
          font-size: 36px;
          z-index: 1;
        }

        .searching-card h3 {
          text-align: center;
          margin: 0 0 16px 0;
          color: #1f2937;
        }

        .queue-info {
          text-align: center;
          margin-bottom: 20px;
        }

        .queue-info p {
          margin: 4px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .cancel-search-button {
          width: 100%;
          padding: 12px 24px;
          background: #f3f4f6;
          color: #4b5563;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .cancel-search-button:hover {
          background: #e5e7eb;
        }

        .preferences-card h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          color: #1f2937;
        }

        .preference-group {
          margin-bottom: 20px;
        }

        .preference-group > label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .radio-option {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .radio-option:has(input:checked) {
          border-color: #6366f1;
          background: #f5f3ff;
        }

        .radio-option input {
          accent-color: #6366f1;
        }

        .radio-label {
          font-weight: 500;
          color: #1f2937;
        }

        .radio-description {
          width: 100%;
          font-size: 12px;
          color: #6b7280;
          margin-left: 24px;
        }

        .preference-group select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          background: white;
          cursor: pointer;
        }

        .preference-group select:focus {
          outline: none;
          border-color: #6366f1;
        }

        .preference-group input[type="range"] {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
          appearance: none;
          cursor: pointer;
        }

        .preference-group input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .search-button {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .search-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .search-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-icon {
          font-size: 18px;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .connection-warning {
          text-align: center;
          color: #f59e0b;
          font-size: 12px;
          margin-top: 8px;
        }

        .stats-preview {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .stats-preview h4 {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default BattleMatchmaking;
