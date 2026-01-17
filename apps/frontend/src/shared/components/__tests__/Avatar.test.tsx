/**
 * Avatar Component Unit Tests
 *
 * Tests for the Avatar component covering:
 * - Image rendering
 * - Fallback initials
 * - Sizes
 * - Error handling
 * - Color generation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  describe('image rendering', () => {
    it('should render image when src is provided', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          name="John Doe"
        />
      );
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should use alt text from alt prop', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          alt="Profile picture"
          name="John Doe"
        />
      );
      expect(screen.getByAltText('Profile picture')).toBeInTheDocument();
    });

    it('should use name as alt text when alt not provided', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          name="John Doe"
        />
      );
      expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    });

    it('should have object-cover class for proper image scaling', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          name="John Doe"
        />
      );
      const img = screen.getByRole('img');
      expect(img.className).toContain('object-cover');
    });
  });

  describe('fallback initials', () => {
    it('should show initials when no src is provided', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should show first two letters for single word name', () => {
      render(<Avatar name="John" />);
      expect(screen.getByText('JO')).toBeInTheDocument();
    });

    it('should show first and last name initials', () => {
      render(<Avatar name="John Michael Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should uppercase initials', () => {
      render(<Avatar name="john doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle extra whitespace in name', () => {
      render(<Avatar name="  John   Doe  " />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should show initials when image fails to load', async () => {
      render(
        <Avatar
          src="https://example.com/broken-image.jpg"
          name="John Doe"
        />
      );

      const img = screen.getByRole('img');
      fireEvent.error(img);

      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should apply small size', () => {
      render(<Avatar name="John Doe" size="sm" />);
      const container = screen.getByText('JD').parentElement;
      expect(container?.className).toContain('w-8');
      expect(container?.className).toContain('h-8');
      expect(container?.className).toContain('text-xs');
    });

    it('should apply medium size by default', () => {
      render(<Avatar name="John Doe" />);
      const container = screen.getByText('JD').parentElement;
      expect(container?.className).toContain('w-12');
      expect(container?.className).toContain('h-12');
      expect(container?.className).toContain('text-base');
    });

    it('should apply large size', () => {
      render(<Avatar name="John Doe" size="lg" />);
      const container = screen.getByText('JD').parentElement;
      expect(container?.className).toContain('w-16');
      expect(container?.className).toContain('h-16');
      expect(container?.className).toContain('text-xl');
    });
  });

  describe('background color', () => {
    it('should generate color based on name', () => {
      render(<Avatar name="Alice" />);
      const container = screen.getByText('AL').parentElement;
      // Should have one of the bg-color classes
      expect(container?.className).toMatch(/bg-(blue|green|yellow|red|purple|pink|indigo)-500/);
    });

    it('should generate consistent color for same name', () => {
      const { rerender } = render(<Avatar name="Alice" />);
      const firstColor = screen.getByText('AL').parentElement?.className;

      rerender(<Avatar name="Alice" />);
      const secondColor = screen.getByText('AL').parentElement?.className;

      expect(firstColor).toBe(secondColor);
    });

    it('should not apply background color when image is shown', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          name="John Doe"
        />
      );
      const container = screen.getByRole('img').parentElement;
      expect(container?.className).not.toMatch(/bg-(blue|green|yellow|red|purple|pink|indigo)-500/);
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Avatar name="John Doe" className="border-2 border-white" />);
      const container = screen.getByText('JD').parentElement;
      expect(container?.className).toContain('border-2');
      expect(container?.className).toContain('border-white');
    });
  });

  describe('base styles', () => {
    it('should have rounded-full class', () => {
      render(<Avatar name="John Doe" />);
      const container = screen.getByText('JD').parentElement;
      expect(container?.className).toContain('rounded-full');
    });

    it('should have flex centering', () => {
      render(<Avatar name="John Doe" />);
      const container = screen.getByText('JD').parentElement;
      expect(container?.className).toContain('flex');
      expect(container?.className).toContain('items-center');
      expect(container?.className).toContain('justify-center');
    });

    it('should have overflow-hidden for image clipping', () => {
      render(<Avatar name="John Doe" />);
      const container = screen.getByText('JD').parentElement;
      expect(container?.className).toContain('overflow-hidden');
    });
  });

  describe('initials text styling', () => {
    it('should have font-semibold class', () => {
      render(<Avatar name="John Doe" />);
      const initials = screen.getByText('JD');
      expect(initials.className).toContain('font-semibold');
    });

    it('should have white text color', () => {
      render(<Avatar name="John Doe" />);
      const initials = screen.getByText('JD');
      expect(initials.className).toContain('text-white');
    });
  });
});
