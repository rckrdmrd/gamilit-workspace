/**
 * Modal Component Unit Tests
 *
 * Tests for the reusable Modal component covering:
 * - Open/close behavior
 * - Portal rendering
 * - ESC key handling
 * - Backdrop click
 * - Sizes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from '../common/Modal';

// Mock createPortal to render inline for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <p>Modal content</p>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  describe('rendering', () => {
    it('should render when isOpen is true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('should render title in heading', () => {
      render(<Modal {...defaultProps} />);
      const heading = screen.getByRole('heading', { name: 'Test Modal' });
      expect(heading).toBeInTheDocument();
      expect(heading.id).toBe('modal-title');
    });

    it('should render children in body', () => {
      render(
        <Modal {...defaultProps}>
          <form>
            <input placeholder="Name" />
            <button type="submit">Submit</button>
          </form>
        </Modal>
      );
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should render without title section when title not provided', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content only
        </Modal>
      );
      expect(screen.getByText('Content only')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('close button', () => {
    it('should render close button when title is provided', () => {
      render(<Modal {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should have aria-label on close button', () => {
      render(<Modal {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });
  });

  describe('backdrop', () => {
    it('should render backdrop overlay', () => {
      render(<Modal {...defaultProps} />);
      const backdrop = document.querySelector('.bg-black\\/50');
      expect(backdrop).toBeInTheDocument();
    });

    it('should call onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const backdrop = document.querySelector('.bg-black\\/50');
      fireEvent.click(backdrop!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const content = screen.getByText('Modal content');
      fireEvent.click(content);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should call onClose when ESC key is pressed', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when other keys are pressed', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should remove event listener when modal closes', () => {
      const onClose = vi.fn();
      const { rerender } = render(<Modal {...defaultProps} onClose={onClose} />);

      rerender(<Modal {...defaultProps} isOpen={false} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      // onClose should not be called after modal is closed
      // (the call count should be 0, not 1)
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('sizes', () => {
    it('should apply small size (max-w-md)', () => {
      render(<Modal {...defaultProps} size="sm" />);
      const modal = screen.getByRole('dialog');
      expect(modal.className).toContain('max-w-md');
    });

    it('should apply medium size by default (max-w-lg)', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');
      expect(modal.className).toContain('max-w-lg');
    });

    it('should apply large size (max-w-2xl)', () => {
      render(<Modal {...defaultProps} size="lg" />);
      const modal = screen.getByRole('dialog');
      expect(modal.className).toContain('max-w-2xl');
    });
  });

  describe('accessibility', () => {
    it('should have role="dialog"', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });
  });

  describe('body scroll lock', () => {
    it('should prevent body scroll when open', async () => {
      render(<Modal {...defaultProps} />);
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });
    });

    it('should restore body scroll when closed', async () => {
      const { rerender } = render(<Modal {...defaultProps} />);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      rerender(<Modal {...defaultProps} isOpen={false} />);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('');
      });
    });
  });

  describe('styling', () => {
    it('should have modal base styles', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');
      expect(modal.className).toContain('relative');
      expect(modal.className).toContain('bg-white');
      expect(modal.className).toContain('rounded-lg');
      expect(modal.className).toContain('shadow-xl');
    });

    it('should have fixed positioning for container', () => {
      render(<Modal {...defaultProps} />);
      const container = document.querySelector('.fixed.inset-0');
      expect(container).toBeInTheDocument();
      expect(container?.className).toContain('z-50');
    });

    it('should center modal content', () => {
      render(<Modal {...defaultProps} />);
      const container = document.querySelector('.fixed.inset-0');
      expect(container?.className).toContain('flex');
      expect(container?.className).toContain('items-center');
      expect(container?.className).toContain('justify-center');
    });
  });
});
