/**
 * Header Component Unit Tests
 *
 * Tests for the Header component covering:
 * - Rendering
 * - User menu functionality
 * - Dropdown behavior
 * - Mobile hamburger menu
 * - Logout functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';

describe('Header', () => {
  const mockUser = {
    id: 'user-123',
    email: 'john.doe@example.com',
    role: 'student',
  };

  const mockOnLogout = vi.fn();
  const mockOnMenuToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render header element', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render Dashboard title', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render notification bell', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });

    it('should render mobile menu toggle button', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });
  });

  describe('user initials', () => {
    it('should display first letter of email as avatar', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should display U when no email', () => {
      render(
        <Header
          user={{ ...mockUser, email: '' } as any}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should display U when user is null', () => {
      render(
        <Header
          user={null}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('user info display', () => {
    it('should display username from email', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );
      expect(screen.getByText('john.doe')).toBeInTheDocument();
    });

    it('should display user role', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );
      expect(screen.getByText('student')).toBeInTheDocument();
    });

    it('should display Student as default role when no role', () => {
      render(
        <Header
          user={{ ...mockUser, role: undefined } as any}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );
      expect(screen.getByText('Student')).toBeInTheDocument();
    });
  });

  describe('mobile menu toggle', () => {
    it('should call onMenuToggle when hamburger clicked', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);

      expect(mockOnMenuToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('dropdown menu', () => {
    it('should not show dropdown initially', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('should show dropdown when user button clicked', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      // Click on the user avatar/button area
      const userButton = screen.getByRole('button', { expanded: false });
      fireEvent.click(userButton);

      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should have correct hrefs for menu links', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      const userButton = screen.getByRole('button', { expanded: false });
      fireEvent.click(userButton);

      expect(screen.getByText('My Profile').closest('a')).toHaveAttribute('href', '/profile');
      expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
    });

    it('should close dropdown when logout clicked', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      const userButton = screen.getByRole('button', { expanded: false });
      fireEvent.click(userButton);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('should have aria-expanded attribute', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      const userButton = screen.getByRole('button', { expanded: false });
      expect(userButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(userButton);
      expect(userButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should toggle dropdown on repeated clicks', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      const userButton = screen.getByRole('button', { expanded: false });

      // First click - open
      fireEvent.click(userButton);
      expect(screen.getByText('Logout')).toBeInTheDocument();

      // Second click - close
      fireEvent.click(userButton);
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('should close dropdown on Escape key', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      const userButton = screen.getByRole('button', { expanded: false });
      fireEvent.click(userButton);

      expect(screen.getByText('Logout')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('click outside', () => {
    it('should close dropdown when clicking outside', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      const userButton = screen.getByRole('button', { expanded: false });
      fireEvent.click(userButton);

      expect(screen.getByText('Logout')).toBeInTheDocument();

      // Click outside on header
      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have sticky positioning', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      const header = screen.getByRole('banner');
      expect(header.className).toContain('sticky');
      expect(header.className).toContain('top-0');
    });

    it('should have border-b class', () => {
      render(
        <Header
          user={mockUser}
          onLogout={mockOnLogout}
          onMenuToggle={mockOnMenuToggle}
        />
      );

      const header = screen.getByRole('banner');
      expect(header.className).toContain('border-b');
    });
  });
});
