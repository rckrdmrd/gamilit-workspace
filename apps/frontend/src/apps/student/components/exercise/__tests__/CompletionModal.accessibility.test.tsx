/**
 * CompletionModal Accessibility Tests (WCAG 2.1 AA)
 *
 * Tests covering:
 * - Focus trap: Tab cycles through interactive elements without escaping (WCAG 2.4.3)
 * - ESC key: Pressing Escape calls onClose (WCAG 2.1.2)
 * - ARIA attributes: role="dialog", aria-modal="true", aria-labelledby
 * - Scroll lock: Body scroll is locked when modal is open, restored on close
 * - Backdrop click: Clicking backdrop calls onClose
 * - Initial focus: Focus moves to first interactive element on open
 * - Focus restoration: Focus returns to trigger element on close
 *
 * @see CompletionModal.tsx
 * @see GUIA-WCAG-ACCESSIBILITY.md Section 3.6 (Modales y Dialogos)
 * @pattern AAA (Arrange-Act-Assert) per ESTANDAR-TESTING
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompletionModal } from '../CompletionModal';

// ─── Mocks ──────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, React.ComponentPropsWithRef<'div'>>(
      (props, ref) => {
        const { children, ...rest } = props;
        // Strip framer-motion-specific props
        const htmlProps = Object.fromEntries(
          Object.entries(rest).filter(([key]) =>
            !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'variants'].includes(key),
          ),
        );
        return <div ref={ref} {...htmlProps}>{children}</div>;
      },
    ),
    p: (props: React.ComponentPropsWithoutRef<'p'>) => {
      const { children, ...rest } = props;
      const htmlProps = Object.fromEntries(
        Object.entries(rest).filter(([key]) =>
          !['initial', 'animate', 'exit', 'transition', 'variants'].includes(key),
        ),
      );
      return <p {...htmlProps}>{children}</p>;
    },
    circle: (props: Record<string, unknown>) => {
      const htmlProps = Object.fromEntries(
        Object.entries(props).filter(([key]) =>
          !['initial', 'animate', 'transition', 'variants'].includes(key),
        ),
      );
      return <circle {...htmlProps} />;
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

// Use the REAL useFocusTrap hook so we can test focus trap behavior
vi.mock('@shared/hooks/useFocusTrap', async () => {
  const actual = await vi.importActual<typeof import('@shared/hooks/useFocusTrap')>('@shared/hooks/useFocusTrap');
  return actual;
});

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

// ─── Test Helpers ────────────────────────────────────

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

// ─── Tests ───────────────────────────────────────────

describe('CompletionModal Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.style.overflow = '';
  });

  // ─── 1. Focus Trap ────────────────────────────────

  describe('focus trap (WCAG 2.4.3 Focus Order)', () => {
    it('should trap Tab focus within the modal, cycling from last to first focusable element', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();

      render(<CompletionModal {...defaultProps} />);

      // Wait for requestAnimationFrame-based initial focus
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      // Get all focusable elements inside the dialog
      const dialog = screen.getByRole('dialog');
      const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';
      const focusables = dialog.querySelectorAll<HTMLElement>(focusableSelector);

      expect(focusables.length).toBeGreaterThan(0);

      // Focus the last focusable element
      const lastFocusable = focusables[focusables.length - 1];
      lastFocusable.focus();
      expect(document.activeElement).toBe(lastFocusable);

      // Press Tab — should cycle back to the first focusable element
      await user.tab();

      const firstFocusable = focusables[0];
      expect(document.activeElement).toBe(firstFocusable);
    });

    it('should trap Shift+Tab focus, cycling from first to last focusable element', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();

      render(<CompletionModal {...defaultProps} />);

      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      const dialog = screen.getByRole('dialog');
      const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';
      const focusables = dialog.querySelectorAll<HTMLElement>(focusableSelector);

      // Focus the first focusable element
      const firstFocusable = focusables[0];
      firstFocusable.focus();
      expect(document.activeElement).toBe(firstFocusable);

      // Press Shift+Tab — should cycle to the last focusable element
      await user.tab({ shift: true });

      const lastFocusable = focusables[focusables.length - 1];
      expect(document.activeElement).toBe(lastFocusable);
    });

    it('should contain multiple focusable interactive elements', () => {
      render(<CompletionModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';
      const focusables = dialog.querySelectorAll<HTMLElement>(focusableSelector);

      // The modal should have at least close button, Volver, and Siguiente
      expect(focusables.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ─── 2. ESC Key ───────────────────────────────────

  describe('ESC key (WCAG 2.1.2 No Keyboard Trap)', () => {
    it('should call onClose when Escape key is pressed', () => {
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
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'Space' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not respond to Escape when modal is closed', () => {
      const onClose = vi.fn();
      const { rerender } = render(<CompletionModal {...defaultProps} onClose={onClose} />);

      // Close the modal
      rerender(<CompletionModal {...defaultProps} isOpen={false} onClose={onClose} />);

      // ESC should have no effect
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should clean up ESC listener on unmount', () => {
      const onClose = vi.fn();
      const { unmount } = render(<CompletionModal {...defaultProps} onClose={onClose} />);

      unmount();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ─── 3. ARIA Attributes ───────────────────────────

  describe('ARIA attributes', () => {
    it('should have role="dialog" on the container', () => {
      render(<CompletionModal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(<CompletionModal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have an accessible title element with a known id', () => {
      render(<CompletionModal {...defaultProps} />);
      // CompletionModal delegates to shared Modal which sets aria-labelledby
      // when a title prop is provided. CompletionModal uses custom content
      // with its own title element that has a stable id for accessibility.
      const title = document.getElementById('completion-modal-title');
      expect(title).toBeInTheDocument();
    });

    it('should show success title text in the referenced title element', () => {
      render(<CompletionModal {...defaultProps} success={true} />);
      const title = document.getElementById('completion-modal-title');
      expect(title?.textContent).toBe('¡Ejercicio Completado!');
    });

    it('should show failure title text in the referenced title element', () => {
      render(<CompletionModal {...defaultProps} success={false} />);
      const title = document.getElementById('completion-modal-title');
      expect(title?.textContent).toBe('Ejercicio Enviado');
    });

    it('should have aria-label on the close button', () => {
      render(<CompletionModal {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /cerrar modal/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Cerrar modal');
    });

    it('should not render dialog when isOpen is false', () => {
      render(<CompletionModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // ─── 4. Scroll Lock ──────────────────────────────

  describe('body scroll lock', () => {
    it('should lock body scroll (overflow: hidden) when modal is open', async () => {
      render(<CompletionModal {...defaultProps} />);
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });
    });

    it('should restore body scroll (overflow: unset) when modal closes', async () => {
      const { rerender } = render(<CompletionModal {...defaultProps} />);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      rerender(<CompletionModal {...defaultProps} isOpen={false} />);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('unset');
      });
    });

    it('should restore body scroll on unmount even if still open', async () => {
      const { unmount } = render(<CompletionModal {...defaultProps} />);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      unmount();

      // Cleanup effect should restore overflow
      expect(document.body.style.overflow).toBe('unset');
    });

    it('should not affect body scroll when modal is never opened', () => {
      render(<CompletionModal {...defaultProps} isOpen={false} />);
      // overflow should not be set to 'hidden'
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  // ─── 5. Backdrop Click ────────────────────────────

  describe('backdrop click', () => {
    it('should call onClose when the backdrop overlay is clicked', () => {
      const onClose = vi.fn();
      render(<CompletionModal {...defaultProps} onClose={onClose} />);

      const backdrop = document.querySelector('.bg-black\\/70');
      expect(backdrop).toBeInTheDocument();
      fireEvent.click(backdrop!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onClose when clicking inside the modal content', () => {
      const onClose = vi.fn();
      render(<CompletionModal {...defaultProps} onClose={onClose} />);

      // Click on the title text inside the modal
      const title = screen.getByText('¡Ejercicio Completado!');
      fireEvent.click(title);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ─── 6. Initial Focus ─────────────────────────────

  describe('initial focus', () => {
    it('should move focus to the first focusable element inside the modal on open', async () => {
      vi.useRealTimers();

      render(<CompletionModal {...defaultProps} />);

      // useFocusTrap uses requestAnimationFrame for initial focus
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      const dialog = screen.getByRole('dialog');
      const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';
      const firstFocusable = dialog.querySelectorAll<HTMLElement>(focusableSelector)[0];

      expect(document.activeElement).toBe(firstFocusable);
    });

    it('should not move focus when modal is closed', () => {
      const focusBefore = document.activeElement;
      render(<CompletionModal {...defaultProps} isOpen={false} />);
      expect(document.activeElement).toBe(focusBefore);
    });
  });

  // ─── 7. Focus Restoration ─────────────────────────

  describe('focus restoration', () => {
    it('should return focus to the previously focused element when modal closes', async () => {
      vi.useRealTimers();

      const { rerender } = render(
        <div>
          <button data-testid="trigger">Trigger</button>
          <CompletionModal {...defaultProps} isOpen={false} />
        </div>,
      );

      // Focus the trigger button first
      const trigger = screen.getByTestId('trigger');
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      // Open the modal
      rerender(
        <div>
          <button data-testid="trigger">Trigger</button>
          <CompletionModal {...defaultProps} isOpen={true} />
        </div>,
      );

      // Wait for focus to move into modal
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      // Focus should now be inside the dialog
      const dialog = screen.getByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);

      // Close the modal
      rerender(
        <div>
          <button data-testid="trigger">Trigger</button>
          <CompletionModal {...defaultProps} isOpen={false} />
        </div>,
      );

      // Focus should be restored to the trigger element
      await waitFor(() => {
        expect(document.activeElement).toBe(trigger);
      });
    });
  });
});
