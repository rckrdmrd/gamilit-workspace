/**
 * CompletionModal Component Unit Tests
 *
 * Tests covering:
 * - Open/close behavior
 * - Accessibility (WCAG 2.1 AA): role, aria-modal, aria-labelledby, close button aria-label
 * - ESC key handling
 * - Backdrop click
 * - Body scroll lock
 * - Score display (success vs failure)
 * - Action buttons (Volver, Reintentar, Siguiente)
 *
 * @see CompletionModal.tsx
 * @see GUIA-WCAG-ACCESSIBILITY.md Section 3.6
 * @pattern AAA (Arrange-Act-Assert) per ESTANDAR-TESTING
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CompletionModal } from '../CompletionModal';

// ─── Mocks ──────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, ...rest } = props;
      return <p {...rest}>{children}</p>;
    },
    circle: (props: Record<string, unknown>) => {
      const { initial, animate, transition, ...rest } = props;
      return <circle {...rest} />;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock('react-confetti', () => ({
  default: () => <div data-testid="confetti" />,
}));

vi.mock('@shared/components/base/DetectiveButton', () => ({
  DetectiveButton: ({ children, onClick, icon, ...rest }: React.PropsWithChildren<{ onClick?: () => void; icon?: React.ReactNode }>) => (
    <button onClick={onClick} {...rest}>{icon}{children}</button>
  ),
}));

vi.mock('@shared/hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}));

vi.mock('@/features/gamification/ranks/hooks/useProgression', () => ({
  useProgression: () => ({
    addXP: vi.fn().mockResolvedValue(undefined),
    checkRankUp: vi.fn().mockReturnValue(false),
  }),
}));

vi.mock('@/features/gamification/economy/hooks/useCoins', () => ({
  useCoins: () => ({
    earnCoins: vi.fn(),
  }),
}));

vi.mock('@/features/gamification/economy/types/economyTypes', () => ({
  TransactionTypeEnum: { EARNED_EXERCISE: 'earned_exercise' },
}));

vi.mock('@/features/gamification/social/store/achievementsStore', () => ({
  useAchievementsStore: () => ({
    unlockAchievement: vi.fn(),
  }),
}));

vi.mock('@/app/providers/AuthContext', () => ({
  useAuth: () => ({
    user: { firstName: 'Test', email: 'test@example.com', avatar_url: null },
  }),
}));

vi.mock('@/features/gamification/social/hooks/useEquipment', () => ({
  useEquipment: () => ({
    equippedItems: [],
  }),
}));

vi.mock('@shared/components/AvatarDisplay', () => ({
  AvatarDisplay: ({ name }: { name: string }) => <div data-testid="avatar-display">{name}</div>,
}));

// ─── Test Setup ─────────────────────────────────────

describe('CompletionModal', () => {
  const defaultProps = {
    isOpen: true,
    success: true,
    score: 8,
    maxScore: 10,
    xpGained: 100,
    mlCoinsGained: 50,
    timeSpent: 120,
    hintsUsed: 1,
    moduleId: 'module-1',
    exerciseId: 'exercise-1',
    onClose: vi.fn(),
    onRetry: vi.fn(),
    onNextExercise: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  // ─── Rendering ──────────────────────────────────────

  describe('rendering', () => {
    it('should render when isOpen is true', () => {
      render(<CompletionModal {...defaultProps} />);
      expect(screen.getByText('¡Ejercicio Completado!')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<CompletionModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('¡Ejercicio Completado!')).not.toBeInTheDocument();
    });

    it('should show success title when success is true', () => {
      render(<CompletionModal {...defaultProps} success={true} />);
      expect(screen.getByText('¡Ejercicio Completado!')).toBeInTheDocument();
    });

    it('should show submission title when success is false', () => {
      render(<CompletionModal {...defaultProps} success={false} />);
      expect(screen.getByText('Ejercicio Enviado')).toBeInTheDocument();
    });

    it('should display correct performance message for high score', () => {
      render(<CompletionModal {...defaultProps} score={9} maxScore={10} />);
      expect(screen.getByText('¡Excelente trabajo!')).toBeInTheDocument();
    });

    it('should display score and max score', () => {
      render(<CompletionModal {...defaultProps} score={8} maxScore={10} />);
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('/ 10')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });

  // ─── Accessibility (WCAG 2.1 AA) ─────────────────

  describe('accessibility', () => {
    it('should have role="dialog"', () => {
      render(<CompletionModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(<CompletionModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<CompletionModal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'completion-modal-title');
      const title = document.getElementById('completion-modal-title');
      expect(title).toBeInTheDocument();
      expect(title?.textContent).toBe('¡Ejercicio Completado!');
    });

    it('should have close button with aria-label', () => {
      render(<CompletionModal {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /cerrar modal/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label', 'Cerrar modal');
    });
  });

  // ─── Close Button ─────────────────────────────────

  describe('close button', () => {
    it('should call onClose when X button is clicked', () => {
      const onClose = vi.fn();
      render(<CompletionModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /cerrar modal/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Backdrop ─────────────────────────────────────

  describe('backdrop', () => {
    it('should render backdrop overlay', () => {
      render(<CompletionModal {...defaultProps} />);
      const backdrop = document.querySelector('.bg-black\\/70');
      expect(backdrop).toBeInTheDocument();
    });

    it('should call onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      render(<CompletionModal {...defaultProps} onClose={onClose} />);

      const backdrop = document.querySelector('.bg-black\\/70');
      fireEvent.click(backdrop!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Keyboard Handling ────────────────────────────

  describe('keyboard handling', () => {
    it('should call onClose when ESC key is pressed', () => {
      const onClose = vi.fn();
      render(<CompletionModal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when other keys are pressed', () => {
      const onClose = vi.fn();
      render(<CompletionModal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should remove ESC listener when modal closes', () => {
      const onClose = vi.fn();
      const { rerender } = render(<CompletionModal {...defaultProps} onClose={onClose} />);

      rerender(<CompletionModal {...defaultProps} isOpen={false} onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ─── Body Scroll Lock ─────────────────────────────

  describe('body scroll lock', () => {
    it('should prevent body scroll when open', async () => {
      render(<CompletionModal {...defaultProps} />);
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });
    });

    it('should restore body scroll when closed', async () => {
      const { rerender } = render(<CompletionModal {...defaultProps} />);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      rerender(<CompletionModal {...defaultProps} isOpen={false} />);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('unset');
      });
    });
  });

  // ─── Action Buttons ───────────────────────────────

  describe('action buttons', () => {
    it('should navigate to module when "Volver al Modulo" is clicked', () => {
      render(<CompletionModal {...defaultProps} />);

      const backButton = screen.getByText('Volver al Módulo');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/modules/module-1');
    });

    it('should show "Reintentar" button when success is false', () => {
      render(<CompletionModal {...defaultProps} success={false} />);
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    it('should not show "Reintentar" when success is true', () => {
      render(<CompletionModal {...defaultProps} success={true} />);
      expect(screen.queryByText('Reintentar')).not.toBeInTheDocument();
    });

    it('should call onRetry when "Reintentar" is clicked', () => {
      const onRetry = vi.fn();
      render(<CompletionModal {...defaultProps} success={false} onRetry={onRetry} />);

      fireEvent.click(screen.getByText('Reintentar'));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should show "Siguiente Ejercicio" when onNextExercise is provided', () => {
      render(<CompletionModal {...defaultProps} onNextExercise={vi.fn()} />);
      expect(screen.getByText('Siguiente Ejercicio')).toBeInTheDocument();
    });

    it('should not show "Siguiente Ejercicio" when onNextExercise is not provided', () => {
      render(<CompletionModal {...defaultProps} onNextExercise={undefined} />);
      expect(screen.queryByText('Siguiente Ejercicio')).not.toBeInTheDocument();
    });

    it('should call onNextExercise when button is clicked', () => {
      const onNextExercise = vi.fn();
      render(<CompletionModal {...defaultProps} onNextExercise={onNextExercise} />);

      fireEvent.click(screen.getByText('Siguiente Ejercicio'));

      expect(onNextExercise).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Stats Display ────────────────────────────────

  describe('stats display', () => {
    it('should display formatted time', () => {
      render(<CompletionModal {...defaultProps} timeSpent={125} />);
      expect(screen.getByText('2m 5s')).toBeInTheDocument();
    });

    it('should display hints used', () => {
      render(<CompletionModal {...defaultProps} hintsUsed={3} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  // ─── Rank Up Notification ─────────────────────────

  describe('rank up notification', () => {
    it('should display rank up when provided', () => {
      render(
        <CompletionModal
          {...defaultProps}
          rankUp={{ newRank: 'Teniente', previousRank: 'Sargento', bonusMLCoins: 200, newMultiplier: 1.5 }}
        />,
      );
      expect(screen.getByText('¡Rango Mejorado!')).toBeInTheDocument();
      expect(screen.getByText('Teniente')).toBeInTheDocument();
      expect(screen.getByText('+200')).toBeInTheDocument();
      expect(screen.getByText('1.5x')).toBeInTheDocument();
    });

    it('should not display rank up when not provided', () => {
      render(<CompletionModal {...defaultProps} rankUp={null} />);
      expect(screen.queryByText('¡Rango Mejorado!')).not.toBeInTheDocument();
    });
  });

  // ─── Streak Milestone ─────────────────────────────

  describe('streak milestone', () => {
    it('should display streak milestone when provided', () => {
      render(
        <CompletionModal
          {...defaultProps}
          streakInfo={{ currentStreak: 7, milestone: true, reward: 100 }}
        />,
      );
      expect(screen.getByText('¡Racha Alcanzada!')).toBeInTheDocument();
      expect(screen.getByText('7 días')).toBeInTheDocument();
    });

    it('should not display streak when milestone is false', () => {
      render(
        <CompletionModal
          {...defaultProps}
          streakInfo={{ currentStreak: 3, milestone: false, reward: 0 }}
        />,
      );
      expect(screen.queryByText('¡Racha Alcanzada!')).not.toBeInTheDocument();
    });
  });
});
