/**
 * LoadingSpinner Component Unit Tests
 *
 * Tests for the LoadingSpinner component covering:
 * - Sizes
 * - Colors
 * - Accessibility
 * - Animation
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../loading';

describe('LoadingSpinner', () => {
  describe('rendering', () => {
    it('should render spinner', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render SVG element', () => {
      render(<LoadingSpinner />);
      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should apply small size', () => {
      render(<LoadingSpinner size="sm" />);
      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg?.classList.contains('w-4')).toBe(true);
      expect(svg?.classList.contains('h-4')).toBe(true);
    });

    it('should apply medium size by default', () => {
      render(<LoadingSpinner />);
      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg?.classList.contains('w-8')).toBe(true);
      expect(svg?.classList.contains('h-8')).toBe(true);
    });

    it('should apply large size', () => {
      render(<LoadingSpinner size="lg" />);
      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg?.classList.contains('w-12')).toBe(true);
      expect(svg?.classList.contains('h-12')).toBe(true);
    });
  });

  describe('colors', () => {
    it('should use blue color by default', () => {
      render(<LoadingSpinner />);
      const path = screen.getByRole('status').querySelector('path');
      expect(path?.className.baseVal).toContain('text-blue-600');
    });

    it('should accept custom color', () => {
      render(<LoadingSpinner color="red" />);
      const path = screen.getByRole('status').querySelector('path');
      expect(path?.className.baseVal).toContain('text-red-600');
    });

    it('should accept green color', () => {
      render(<LoadingSpinner color="green" />);
      const path = screen.getByRole('status').querySelector('path');
      expect(path?.className.baseVal).toContain('text-green-600');
    });
  });

  describe('animation', () => {
    it('should have animate-spin class', () => {
      render(<LoadingSpinner />);
      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg?.classList.contains('animate-spin')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have role="status"', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-label="Loading"', () => {
      render(<LoadingSpinner />);
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<LoadingSpinner className="my-spinner" />);
      const container = screen.getByRole('status');
      expect(container.className).toContain('my-spinner');
    });

    it('should maintain inline-block display', () => {
      render(<LoadingSpinner className="custom" />);
      const container = screen.getByRole('status');
      expect(container.className).toContain('inline-block');
    });
  });

  describe('SVG structure', () => {
    it('should have circle element for background track', () => {
      render(<LoadingSpinner />);
      const circle = screen.getByRole('status').querySelector('circle');
      expect(circle).toBeInTheDocument();
      expect(circle?.getAttribute('cx')).toBe('12');
      expect(circle?.getAttribute('cy')).toBe('12');
      expect(circle?.getAttribute('r')).toBe('10');
    });

    it('should have path element for spinner arc', () => {
      render(<LoadingSpinner />);
      const path = screen.getByRole('status').querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path?.getAttribute('fill')).toBe('currentColor');
    });

    it('should have opacity classes for contrast', () => {
      render(<LoadingSpinner />);
      const circle = screen.getByRole('status').querySelector('circle');
      const path = screen.getByRole('status').querySelector('path');
      expect(circle?.className.baseVal).toContain('opacity-25');
      expect(path?.className.baseVal).toContain('opacity-75');
    });
  });
});
