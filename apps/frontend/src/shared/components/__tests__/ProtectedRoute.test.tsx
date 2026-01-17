/**
 * ProtectedRoute Component Unit Tests
 *
 * Tests for the ProtectedRoute component covering:
 * - Authentication checks
 * - Role-based access control
 * - Loading states
 * - Redirects
 * - UnauthorizedPage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, UnauthorizedPage } from '../ProtectedRoute';

// Mock the auth store
const mockAuthStore = {
  user: null as any,
  isAuthenticated: false,
  isLoading: false,
};

vi.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (selector: (state: typeof mockAuthStore) => any) =>
    selector(mockAuthStore),
}));

// Mock the WebSocket hook
vi.mock('@/features/notifications/hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset mock state
    mockAuthStore.user = null;
    mockAuthStore.isAuthenticated = false;
    mockAuthStore.isLoading = false;
  });

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      mockAuthStore.isLoading = true;

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show spinner animation during loading', () => {
      mockAuthStore.isLoading = true;

      const { container } = render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('authentication checks', () => {
    it('should render children when authenticated', () => {
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.user = { id: '1', email: 'test@test.com', role: 'student' };

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to login when not authenticated', () => {
      mockAuthStore.isAuthenticated = false;

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when specified', () => {
      mockAuthStore.isAuthenticated = false;

      render(
        <MemoryRouter initialEntries={['/premium']}>
          <Routes>
            <Route
              path="/premium"
              element={
                <ProtectedRoute redirectTo="/subscribe">
                  <div>Premium Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/subscribe" element={<div>Subscribe Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Subscribe Page')).toBeInTheDocument();
    });
  });

  describe('role-based access control', () => {
    it('should allow access when user has required role', () => {
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.user = { id: '1', email: 'admin@test.com', role: 'admin' };

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should redirect to unauthorized when user lacks required role', () => {
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.user = { id: '1', email: 'student@test.com', role: 'student' };

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<div>Unauthorized</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('should allow any role when allowedRoles is empty', () => {
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.user = { id: '1', email: 'test@test.com', role: 'student' };

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={[]}>
            <div>Any Role Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Any Role Content')).toBeInTheDocument();
    });

    it('should allow any role when allowedRoles is not specified', () => {
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.user = { id: '1', email: 'test@test.com', role: 'teacher' };

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Open Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Open Content')).toBeInTheDocument();
    });

    it('should handle user with no role', () => {
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.user = { id: '1', email: 'test@test.com' };

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<div>Unauthorized</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });
  });

  describe('multiple allowed roles', () => {
    it('should allow first role in list', () => {
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.user = { id: '1', email: 'admin@test.com', role: 'admin' };

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['admin', 'manager', 'superadmin']}>
            <div>Multi-Role Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Multi-Role Content')).toBeInTheDocument();
    });

    it('should allow middle role in list', () => {
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.user = { id: '1', email: 'manager@test.com', role: 'manager' };

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['admin', 'manager', 'superadmin']}>
            <div>Multi-Role Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Multi-Role Content')).toBeInTheDocument();
    });

    it('should allow last role in list', () => {
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.user = { id: '1', email: 'super@test.com', role: 'superadmin' };

      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={['admin', 'manager', 'superadmin']}>
            <div>Multi-Role Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Multi-Role Content')).toBeInTheDocument();
    });
  });
});

describe('UnauthorizedPage', () => {
  it('should render 403 status code', () => {
    render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>
    );

    expect(screen.getByText('403')).toBeInTheDocument();
  });

  it('should render Access Denied heading', () => {
    render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('should render permission message', () => {
    render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/don't have permission to access this page/i)
    ).toBeInTheDocument();
  });

  it('should render Go to Home link', () => {
    render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /go to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render Go to Dashboard link', () => {
    render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('should have orange-600 bg for home button', () => {
    render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /go to home/i });
    expect(homeLink.className).toContain('bg-orange-600');
  });
});
