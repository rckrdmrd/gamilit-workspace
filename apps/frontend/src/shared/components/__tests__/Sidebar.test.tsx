/**
 * Sidebar Component Unit Tests
 *
 * Tests for the Sidebar component covering:
 * - Rendering
 * - Navigation links
 * - Active link highlighting
 * - Mobile behavior
 * - Close functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { DEFAULT_BRANDING } from '@/shared/types/branding.types';

// Helper to render with router
const renderWithRouter = (
  component: React.ReactNode,
  initialEntries = ['/dashboard']
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>
  );
};

describe('Sidebar', () => {
  const mockOnClose = vi.fn();
  const platformName = DEFAULT_BRANDING.platformName;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render sidebar element', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should render brand/logo text', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText(platformName)).toBeInTheDocument();
    });

    it('should render version info', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText(`${platformName} v1.0.0`)).toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('should render Dashboard link', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should render My Progress link', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('link', { name: /my progress/i })).toBeInTheDocument();
    });

    it('should render Achievements link', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('link', { name: /achievements/i })).toBeInTheDocument();
    });

    it('should render Leaderboard link', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('link', { name: /leaderboard/i })).toBeInTheDocument();
    });

    it('should render Missions link', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('link', { name: /missions/i })).toBeInTheDocument();
    });

    it('should render Learning link', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('link', { name: /learning/i })).toBeInTheDocument();
    });

    it('should render Profile link', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    });

    it('should render Settings link', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });
  });

  describe('link paths', () => {
    it('should have correct href for Dashboard', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const link = screen.getByRole('link', { name: /dashboard/i });
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('should have correct href for My Progress', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const link = screen.getByRole('link', { name: /my progress/i });
      expect(link).toHaveAttribute('href', '/progress');
    });

    it('should have correct href for Achievements', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const link = screen.getByRole('link', { name: /achievements/i });
      expect(link).toHaveAttribute('href', '/achievements');
    });

    it('should have correct href for Leaderboard', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const link = screen.getByRole('link', { name: /leaderboard/i });
      expect(link).toHaveAttribute('href', '/leaderboard');
    });

    it('should have correct href for Settings', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const link = screen.getByRole('link', { name: /settings/i });
      expect(link).toHaveAttribute('href', '/settings');
    });
  });

  describe('active link highlighting', () => {
    it('should highlight Dashboard when on /dashboard', () => {
      renderWithRouter(
        <Sidebar isOpen={true} onClose={mockOnClose} />,
        ['/dashboard']
      );

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink.className).toContain('bg-primary-50');
      expect(dashboardLink.className).toContain('text-primary-700');
    });

    it('should highlight Achievements when on /achievements', () => {
      renderWithRouter(
        <Sidebar isOpen={true} onClose={mockOnClose} />,
        ['/achievements']
      );

      const achievementsLink = screen.getByRole('link', { name: /achievements/i });
      expect(achievementsLink.className).toContain('bg-primary-50');
    });

    it('should not highlight non-active links', () => {
      renderWithRouter(
        <Sidebar isOpen={true} onClose={mockOnClose} />,
        ['/dashboard']
      );

      const settingsLink = screen.getByRole('link', { name: /settings/i });
      expect(settingsLink.className).not.toContain('bg-primary-50');
    });
  });

  describe('mobile behavior', () => {
    it('should render close button', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close sidebar');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when nav link clicked', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      fireEvent.click(dashboardLink);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should render overlay when open', () => {
      const { container } = renderWithRouter(
        <Sidebar isOpen={true} onClose={mockOnClose} />
      );

      const overlay = container.querySelector('.bg-black\\/50');
      expect(overlay).toBeInTheDocument();
    });

    it('should not render overlay when closed', () => {
      const { container } = renderWithRouter(
        <Sidebar isOpen={false} onClose={mockOnClose} />
      );

      const overlay = container.querySelector('.bg-black\\/50');
      expect(overlay).not.toBeInTheDocument();
    });

    it('should call onClose when overlay clicked', () => {
      const { container } = renderWithRouter(
        <Sidebar isOpen={true} onClose={mockOnClose} />
      );

      const overlay = container.querySelector('.bg-black\\/50');
      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('sidebar visibility', () => {
    it('should have translate-x-0 class when open', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('translate-x-0');
    });

    it('should have -translate-x-full class when closed', () => {
      renderWithRouter(<Sidebar isOpen={false} onClose={mockOnClose} />);
      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('-translate-x-full');
    });
  });

  describe('brand link', () => {
    it('should link to dashboard', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const brandLink = screen.getByRole('link', { name: /gamilit/i });
      expect(brandLink).toHaveAttribute('href', '/dashboard');
    });

    it('should call onClose when brand link clicked', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const brandLink = screen.getByRole('link', { name: /gamilit/i });
      fireEvent.click(brandLink);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have fixed positioning', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('fixed');
    });

    it('should have w-64 width', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('w-64');
    });

    it('should have border-r class', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('border-r');
    });

    it('should have transition classes', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('transition-transform');
      expect(aside.className).toContain('duration-300');
    });
  });

  describe('footer content', () => {
    it('should display tagline', () => {
      renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText(/Made with.*for learners/i)).toBeInTheDocument();
    });
  });
});
