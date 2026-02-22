/**
 * BattleArena Component
 *
 * @description Real-time battle interface for peer challenges (EXT-009)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useBattle } from '../hooks/useBattle';

/**
 * Emoji reactions for quick communication
 */
const BATTLE_EMOJIS = ['&#128588;', '&#128293;', '&#128556;', '&#128526;', '&#128557;', '&#128170;'];

/**
 * BattleArena Component
 */
export const BattleArena = () => {
  const {
    currentBattle,
    currentQuestion,
    myScore,
    opponentScore,
    isConnected,
    error,
    userId,
    setReady,
    submitAnswer,
    sendEmoji,
    leaveBattle,
  } = useBattle();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const answerStartTime = useRef<number>(Date.now());

  // Get players
  const myPlayer = currentBattle?.players.find((p) => p.id === userId);
  const opponent = currentBattle?.players.find((p) => p.id !== userId);

  /**
   * Timer effect
   */
  useEffect(() => {
    if (currentBattle?.status === 'active' && currentQuestion?.timeLimit) {
      setTimeRemaining(currentQuestion.timeLimit);
      answerStartTime.current = Date.now();

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-submit if time runs out
            if (!selectedAnswer) {
              handleSubmitAnswer('');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion?.id]);

  /**
   * Countdown effect
   */
  useEffect(() => {
    if (currentBattle?.status === 'countdown') {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentBattle?.status]);

  /**
   * Reset selection when question changes
   */
  useEffect(() => {
    setSelectedAnswer(null);
    setShowFeedback(null);
  }, [currentQuestion?.id]);

  /**
   * Handle answer selection
   */
  const handleSelectAnswer = useCallback((answerId: string) => {
    if (!isSubmitting && !showFeedback) {
      setSelectedAnswer(answerId);
    }
  }, [isSubmitting, showFeedback]);

  /**
   * Handle answer submission
   */
  const handleSubmitAnswer = useCallback(
    async (answer?: string) => {
      const answerToSubmit = answer ?? selectedAnswer;
      if (!currentQuestion || isSubmitting) return;

      setIsSubmitting(true);
      const timeTaken = Date.now() - answerStartTime.current;

      try {
        const result = await submitAnswer(
          currentQuestion.id,
          answerToSubmit || '',
          timeTaken,
        );

        setShowFeedback({
          correct: result.correct,
          message: result.correct
            ? `+${result.pointsEarned} points!`
            : 'Incorrect',
        });

        // Clear feedback after delay
        setTimeout(() => {
          setShowFeedback(null);
          setIsSubmitting(false);
        }, 1500);
      } catch (err) {
        console.error('Submit answer failed:', err);
        setIsSubmitting(false);
      }
    },
    [currentQuestion, selectedAnswer, submitAnswer, isSubmitting],
  );

  /**
   * Handle ready button click
   */
  const handleReady = useCallback(() => {
    setReady();
  }, [setReady]);

  /**
   * Handle emoji click
   */
  const handleEmoji = useCallback(
    (emoji: string) => {
      sendEmoji(emoji);
    },
    [sendEmoji],
  );

  /**
   * Format time
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Render waiting room
   */
  if (currentBattle?.status === 'waiting') {
    return (
      <div className="battle-arena waiting">
        <div className="waiting-content">
          <h2>Waiting for players...</h2>
          <div className="players-status">
            {currentBattle.players.map((player) => (
              <div
                key={player.id}
                className={`player-status ${player.isReady ? 'ready' : ''}`}
              >
                <div className="player-avatar">
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt={player.displayName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {player.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {player.isReady && (
                    <span className="ready-badge">&#10003;</span>
                  )}
                </div>
                <span className="player-name">{player.displayName}</span>
                <span className="player-status-text">
                  {player.isReady ? 'Ready!' : 'Waiting...'}
                </span>
              </div>
            ))}
          </div>
          {!myPlayer?.isReady && (
            <button className="ready-button" onClick={handleReady}>
              I'm Ready!
            </button>
          )}
          <button className="leave-button" onClick={leaveBattle}>
            Leave Battle
          </button>
        </div>
        <style>{waitingStyles}</style>
      </div>
    );
  }

  /**
   * Render countdown
   */
  if (countdown !== null) {
    return (
      <div className="battle-arena countdown">
        <div className="countdown-content">
          <div className="countdown-number">{countdown}</div>
          <p>{countdown === 1 ? 'GO!' : 'Get Ready!'}</p>
        </div>
        <style>{countdownStyles}</style>
      </div>
    );
  }

  /**
   * Render active battle
   */
  return (
    <div className="battle-arena active">
      {/* Header with scores */}
      <div className="battle-header">
        <div className="player-score my-score">
          <span className="score-value">{myScore}</span>
          <span className="score-label">You</span>
        </div>
        <div className="battle-timer">
          <span className={`timer-value ${timeRemaining <= 10 ? 'warning' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
          <span className="question-progress">
            {currentQuestion?.questionNumber} / {currentQuestion?.totalQuestions}
          </span>
        </div>
        <div className="player-score opponent-score">
          <span className="score-value">{opponentScore}</span>
          <span className="score-label">{opponent?.displayName || 'Opponent'}</span>
        </div>
      </div>

      {/* Connection status */}
      {!isConnected && (
        <div className="connection-warning">
          Reconnecting...
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="battle-error">
          {error}
        </div>
      )}

      {/* Question */}
      {currentQuestion && (
        <div className="question-container">
          <div className="question-text">{currentQuestion.text}</div>
          <div className="options-grid">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                className={`option-button ${
                  selectedAnswer === option.id ? 'selected' : ''
                } ${
                  showFeedback && selectedAnswer === option.id
                    ? showFeedback.correct
                      ? 'correct'
                      : 'incorrect'
                    : ''
                }`}
                onClick={() => handleSelectAnswer(option.id)}
                disabled={isSubmitting || showFeedback !== null}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + currentQuestion.options.indexOf(option))}
                </span>
                <span className="option-text">{option.text}</span>
              </button>
            ))}
          </div>
          <button
            className="submit-button"
            onClick={() => handleSubmitAnswer()}
            disabled={!selectedAnswer || isSubmitting || showFeedback !== null}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}

      {/* Feedback overlay */}
      {showFeedback && (
        <div className={`feedback-overlay ${showFeedback.correct ? 'correct' : 'incorrect'}`}>
          <span className="feedback-icon">
            {showFeedback.correct ? '&#10003;' : '&#10007;'}
          </span>
          <span className="feedback-message">{showFeedback.message}</span>
        </div>
      )}

      {/* Emoji bar */}
      <div className="emoji-bar">
        {BATTLE_EMOJIS.map((emoji, index) => (
          <button
            key={index}
            className="emoji-button"
            onClick={() => handleEmoji(emoji)}
            dangerouslySetInnerHTML={{ __html: emoji }}
          />
        ))}
      </div>

      <style>{arenaStyles}</style>
    </div>
  );
};

/**
 * Waiting room styles
 */
const waitingStyles = `
  .battle-arena.waiting {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 24px;
  }

  .waiting-content {
    text-align: center;
    max-width: 400px;
  }

  .waiting-content h2 {
    margin: 0 0 32px 0;
    color: #1f2937;
  }

  .players-status {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-bottom: 32px;
  }

  .player-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .player-avatar {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .player-avatar img,
  .player-avatar .avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    font-size: 32px;
    font-weight: 700;
  }

  .ready-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 24px;
    height: 24px;
    background: #10b981;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .player-name {
    font-weight: 600;
    color: #1f2937;
  }

  .player-status-text {
    font-size: 14px;
    color: #6b7280;
  }

  .player-status.ready .player-status-text {
    color: #10b981;
  }

  .ready-button {
    padding: 14px 32px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 12px;
    transition: all 0.2s;
  }

  .ready-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .leave-button {
    padding: 10px 24px;
    background: #f3f4f6;
    color: #6b7280;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .leave-button:hover {
    background: #e5e7eb;
  }
`;

/**
 * Countdown styles
 */
const countdownStyles = `
  .battle-arena.countdown {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }

  .countdown-content {
    text-align: center;
    color: white;
  }

  .countdown-number {
    font-size: 120px;
    font-weight: 700;
    line-height: 1;
    animation: countdownPulse 1s ease-in-out infinite;
  }

  .countdown-content p {
    font-size: 24px;
    margin: 16px 0 0 0;
    opacity: 0.8;
  }

  @keyframes countdownPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
`;

/**
 * Arena styles
 */
const arenaStyles = `
  .battle-arena.active {
    display: flex;
    flex-direction: column;
    min-height: 500px;
    padding: 16px;
    position: relative;
  }

  .battle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    border-radius: 12px;
    margin-bottom: 24px;
  }

  .player-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
  }

  .score-value {
    font-size: 32px;
    font-weight: 700;
    color: white;
  }

  .score-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
  }

  .battle-timer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .timer-value {
    font-size: 28px;
    font-weight: 700;
    color: white;
    font-variant-numeric: tabular-nums;
  }

  .timer-value.warning {
    color: #ef4444;
    animation: timerBlink 0.5s ease-in-out infinite;
  }

  @keyframes timerBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .question-progress {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }

  .connection-warning {
    padding: 8px 16px;
    background: #fef3c7;
    color: #92400e;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 16px;
  }

  .battle-error {
    padding: 8px 16px;
    background: #fef2f2;
    color: #dc2626;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 16px;
  }

  .question-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .question-text {
    font-size: 20px;
    font-weight: 500;
    color: #1f2937;
    text-align: center;
    margin-bottom: 24px;
    padding: 24px;
    background: #f9fafb;
    border-radius: 12px;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }

  .option-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .option-button:hover:not(:disabled) {
    border-color: #6366f1;
    background: #f5f3ff;
  }

  .option-button.selected {
    border-color: #6366f1;
    background: #f5f3ff;
  }

  .option-button.correct {
    border-color: #10b981;
    background: #d1fae5;
  }

  .option-button.incorrect {
    border-color: #ef4444;
    background: #fee2e2;
  }

  .option-button:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  .option-letter {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e5e7eb;
    border-radius: 50%;
    font-weight: 600;
    color: #4b5563;
    flex-shrink: 0;
  }

  .option-button.selected .option-letter {
    background: #6366f1;
    color: white;
  }

  .option-text {
    flex: 1;
    color: #1f2937;
  }

  .submit-button {
    padding: 16px 32px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: auto;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .feedback-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 48px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: feedbackPop 0.3s ease-out;
    z-index: 10;
  }

  @keyframes feedbackPop {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }

  .feedback-overlay.correct {
    border: 3px solid #10b981;
  }

  .feedback-overlay.incorrect {
    border: 3px solid #ef4444;
  }

  .feedback-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }

  .feedback-overlay.correct .feedback-icon {
    color: #10b981;
  }

  .feedback-overlay.incorrect .feedback-icon {
    color: #ef4444;
  }

  .feedback-message {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
  }

  .emoji-bar {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    margin-top: 16px;
    border-top: 1px solid #e5e7eb;
  }

  .emoji-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .emoji-button:hover {
    background: #e5e7eb;
    transform: scale(1.1);
  }
`;

export default BattleArena;
