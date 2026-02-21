/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/features/auth/api/authAPI';
import { useAuthStore } from '@/features/auth/store/authStore';
import { performLogout } from '@/shared/utils/authCleanup';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthContextType,
} from '@/shared/types/auth.types';

/**
 * AuthContext
 * Manages authentication state and provides auth methods throughout the application
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 * Wraps the application to provide authentication context
 *
 * Features:
 * - Persists authentication state across page refreshes
 * - Automatically loads user profile on mount if token exists
 * - Handles login, register, logout operations
 * - Provides error handling for auth operations
 * - Supports user profile refresh
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user profile on component mount
   * Checks for existing token and fetches user data
   */
  useEffect(() => {
    const loadUser = async () => {
      // CRITICAL: Check for logout flag FIRST to prevent race condition
      const isLoggingOut = localStorage.getItem('is_logging_out');
      if (isLoggingOut === 'true') {
        // User is logging out, clear flag
        localStorage.removeItem('is_logging_out');

        // Ensure BOTH systems are completely cleared
        setUser(null);
        setError(null);
        setIsLoading(false);

        useAuthStore.setState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          sessionExpiresAt: null,
          error: null,
          isLoading: false,
        });

        return;
      }

      const token = localStorage.getItem('auth-token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();

        // CRITICAL: Sync BOTH auth systems on session restore
        // 1. Update AuthContext
        setUser(userData);
        setError(null);

        // 2. Update authStore
        const refreshToken = localStorage.getItem('refresh-token');
        useAuthStore.setState({
          user: userData,
          token: token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          sessionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          isLoading: false,
          error: null,
        });

      } catch (err) {
        // Token is invalid or expired, clear storage
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        localStorage.removeItem('auth-storage');

        // Clear both systems
        setUser(null);
        useAuthStore.setState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          sessionExpiresAt: null,
          error: null,
          isLoading: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user with credentials
   *
   * @param credentials - Email and password
   * @throws Error with message if login fails
   *
   * @example
   * ```tsx
   * const { login } = useAuth();
   * await login({ email: 'user@example.com', password: 'password123' });
   * ```
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear stale logout flag BEFORE saving new auth data
      localStorage.removeItem('is_logging_out');

      const response = await authAPI.login(credentials);

      // Determine user data
      let userData: User;
      if (response.user) {
        userData = response.user;
      } else {
        userData = await authAPI.getCurrentUser();
      }

      // CRITICAL: Save tokens to localStorage FIRST — apiClient reads from here
      if (response.token) {
        localStorage.setItem('auth-token', response.token);
      }
      if (response.refreshToken) {
        localStorage.setItem('refresh-token', response.refreshToken);
      }

      // CRITICAL: Sync BOTH auth systems
      // 1. Update AuthContext (React Context)
      setUser(userData);

      // 2. Update authStore (Zustand) - Direct state update to avoid duplicate API call
      useAuthStore.setState({
        user: userData,
        token: response.token || localStorage.getItem('auth-token') || '',
        refreshToken: response.refreshToken || localStorage.getItem('refresh-token') || '',
        isAuthenticated: true,
        sessionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        isLoading: false,
        error: null,
      });

    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message)
          : 'Login failed. Please check your credentials.';
      setError(errorMessage);

      // Also update authStore error
      useAuthStore.setState({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   *
   * @param userData - Registration data including email, password, and optional names
   * @throws Error with message if registration fails
   *
   * @example
   * ```tsx
   * const { register } = useAuth();
   * await register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   first_name: 'John',
   *   last_name: 'Doe'
   * });
   * ```
   */
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear stale logout flag BEFORE saving new auth data
      localStorage.removeItem('is_logging_out');

      const response = await authAPI.register(userData);

      // Determine user data
      let userProfile: User;
      if (response.user) {
        userProfile = response.user;
      } else {
        userProfile = await authAPI.getCurrentUser();
      }

      // CRITICAL: Save tokens to localStorage FIRST — apiClient reads from here
      if (response.token) {
        localStorage.setItem('auth-token', response.token);
      }
      if (response.refreshToken) {
        localStorage.setItem('refresh-token', response.refreshToken);
      }

      // CRITICAL: Sync BOTH auth systems (auto-login after registration)
      // 1. Update AuthContext
      setUser(userProfile);

      // 2. Update authStore
      useAuthStore.setState({
        user: userProfile,
        token: response.token || localStorage.getItem('auth-token') || '',
        refreshToken: response.refreshToken || localStorage.getItem('refresh-token') || '',
        isAuthenticated: true,
        sessionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        isLoading: false,
        error: null,
      });

    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message)
          : 'Registration failed. Please try again.';
      setError(errorMessage);

      // Also update authStore error
      useAuthStore.setState({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   * Clears user state and removes tokens from storage
   * Uses centralized performLogout() utility for consistent behavior
   *
   * @example
   * ```tsx
   * const { logout } = useAuth();
   * await logout();
   * ```
   */
  const logout = async (): Promise<void> => {
    await performLogout(async () => {
      await authAPI.logout();
    });
  };

  /**
   * Refresh user profile from server
   * Useful after profile updates or to sync latest data
   *
   * @throws Error if profile fetch fails
   *
   * @example
   * ```tsx
   * const { refreshUser } = useAuth();
   * await refreshUser();
   * ```
   */
  const refreshUser = async (): Promise<void> => {
    try {
      setError(null);
      const userData = await authAPI.getCurrentUser();

      // CRITICAL: Sync BOTH auth systems
      // 1. Update AuthContext
      setUser(userData);

      // 2. Update authStore (keep existing tokens)
      const currentState = useAuthStore.getState();
      useAuthStore.setState({
        ...currentState,
        user: userData,
        error: null,
      });

    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message)
          : 'Failed to refresh user profile.';
      setError(errorMessage);

      // Also update authStore error
      useAuthStore.setState({
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  };

  /**
   * Clear error state
   * Useful for dismissing error messages in UI
   *
   * @example
   * ```tsx
   * const { error, clearError } = useAuth();
   * if (error) {
   *   <Alert onClose={clearError}>{error}</Alert>
   * }
   * ```
   */
  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Custom hook to access authentication context
 *
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType with user state and auth methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *
 *   return <div>Welcome, {user.email}!</div>;
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * Export AuthContext for advanced use cases
 * (e.g., testing, custom consumers)
 */
export { AuthContext };
