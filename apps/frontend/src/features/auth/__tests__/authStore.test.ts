/**
 * Auth Store Tests
 * Basic test examples for the auth store
 *
 * To run these tests, you'll need to install testing libraries:
 * npm install -D @testing-library/react @testing-library/react-hooks vitest
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpiresAt: null
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should login successfully with valid credentials', async () => {
    const { login } = useAuthStore.getState();

    await login('admin@gamilit.com', 'password123');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toBeTruthy();
    expect(state.user?.email).toBe('admin@gamilit.com');
    expect(state.token).toBeTruthy();
  });

  it('should fail login with invalid credentials', async () => {
    const { login } = useAuthStore.getState();

    await expect(login('wrong@email.com', 'wrongpass')).rejects.toThrow();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeTruthy();
  });

  it('should logout correctly', async () => {
    const { login, logout } = useAuthStore.getState();

    // First login
    await login('admin@gamilit.com', 'password123');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Then logout
    logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('should update user data', () => {
    const { updateUser } = useAuthStore.getState();

    // Set initial user
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'student',
        emailVerified: false
      }
    });

    // Update user
    updateUser({ fullName: 'Updated Name' });

    const state = useAuthStore.getState();
    expect(state.user?.fullName).toBe('Updated Name');
  });

  it('should check session validity', () => {
    const { checkSession } = useAuthStore.getState();

    // Set valid session
    useAuthStore.setState({
      isAuthenticated: true,
      sessionExpiresAt: Date.now() + 10000 // 10 seconds from now
    });

    expect(checkSession()).toBe(true);
  });

  it('should invalidate expired session', () => {
    const { checkSession } = useAuthStore.getState();

    // Set expired session
    useAuthStore.setState({
      isAuthenticated: true,
      sessionExpiresAt: Date.now() - 10000 // 10 seconds ago
    });

    expect(checkSession()).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('should clear error', () => {
    const { clearError } = useAuthStore.getState();

    useAuthStore.setState({ error: 'Some error' });
    expect(useAuthStore.getState().error).toBeTruthy();

    clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
